'use strict';

// Unit test: tools-ON parity execution profile + bidirectional eval orchestrator.
// Covers lib/audit/eval-execution-profile.js (the lockstep-parity invariant) and
// lib/audit/run-bidirectional-eval.js (sequencing + conservative reconciliation +
// parity gating, via an injected runDirection — no live CLI calls).

const assert = require('assert');
const ep = require('../../lib/audit/eval-execution-profile');
const { runBidirectionalEval, toSidecarReceipt } = require('../../lib/audit/run-bidirectional-eval');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. buildExecutionProfile');
check('requires cwd (the public-content fence)', () => {
  assert.throws(() => ep.buildExecutionProfile({}), /cwd is required/);
});
check('defaults to tools=full, research=repo+web, public repo scope', () => {
  const p = ep.buildExecutionProfile({ cwd: '/x/skill-graph' });
  assert.strictEqual(p.tools, 'full');
  assert.strictEqual(p.research, 'repo+web');
  assert.strictEqual(p.repoScope, 'skill-graph + skills ONLY');
  assert.strictEqual(p.cwd, '/x/skill-graph');
});

console.log('2. cliAccessForProfile — equal access, different flags');
check('claude DROPS disallowed-tools (allowTools true) under a full profile', () => {
  const p = ep.buildExecutionProfile({ cwd: '/x/skill-graph' });
  const a = ep.cliAccessForProfile('claude', p);
  assert.strictEqual(a.allowTools, true);
  assert.strictEqual(a.web, true);
});
check('codex uses its in-repo normal sandbox (full tools)', () => {
  const p = ep.buildExecutionProfile({ cwd: '/x/skill-graph' });
  const a = ep.cliAccessForProfile('codex', p);
  assert.strictEqual(a.allowTools, true);
  assert.strictEqual(a.sandbox, 'workspace-write');
});
check('a NON-full profile is never a parity/certifying access (allowTools false)', () => {
  const a = ep.cliAccessForProfile('claude', { tools: 'none' });
  assert.strictEqual(a.allowTools, false);
});

console.log('3. assertParity — the HARD invariant');
check('identical profiles => parity_ok true', () => {
  const p = ep.buildExecutionProfile({ cwd: '/x/skill-graph' });
  const r = ep.assertParity(p, { ...p });
  assert.strictEqual(r.parity_ok, true);
  assert.strictEqual(r.mismatches.length, 0);
});
check('tool-access mismatch => parity_ok false (measured permissions, not the model)', () => {
  const a = ep.buildExecutionProfile({ cwd: '/x/skill-graph' });
  const b = ep.buildExecutionProfile({ cwd: '/x/skill-graph', tools: 'none' });
  const r = ep.assertParity(a, b);
  assert.strictEqual(r.parity_ok, false);
  assert.ok(r.mismatches.some((m) => m.field === 'tools'));
});
check('repoScope / cwd mismatch => parity_ok false', () => {
  const a = ep.buildExecutionProfile({ cwd: '/x/skill-graph' });
  const b = ep.buildExecutionProfile({ cwd: '/other/repo' });
  assert.strictEqual(ep.assertParity(a, b).parity_ok, false);
  const c = ep.buildExecutionProfile({ cwd: '/x/skill-graph', repoScope: 'everything' });
  assert.strictEqual(ep.assertParity(a, c).parity_ok, false);
});
check('a missing profile cannot be proven equal => parity_ok false', () => {
  const a = ep.buildExecutionProfile({ cwd: '/x/skill-graph' });
  assert.strictEqual(ep.assertParity(a, null).parity_ok, false);
  assert.strictEqual(ep.assertParity(null, a).parity_ok, false);
});

console.log('4. runBidirectionalEval — sequencing, swap, conservative reconcile, parity gate');

// A faithful injected runDirection: echoes back the profile it was handed (so
// parity holds) and a per-direction verdict from a lookup keyed by direction.
function fakeRunner(verdictByDirection, { breakParity = false } = {}) {
  return ({ direction, generatorModel, graderModel, executionProfile }) => ({
    direction,
    generator_model: generatorModel,
    grader_model: graderModel,
    verdict: verdictByDirection[direction],
    certification_tier: 'certifying',
    // Direction B optionally records a DIFFERENT profile to simulate a parity break.
    execution_profile: breakParity && direction === 'B'
      ? { ...executionProfile, tools: 'none' }
      : executionProfile,
  });
}

check('swaps generator/grader across directions (A: opus→codex-current, B: codex-current→opus)', () => {
  const seen = [];
  runBidirectionalEval({
    mode: 'application',
    skill: 's',
    cwd: '/x/skill-graph',
    deps: {
      runDirection: (params) => {
        seen.push(params);
        return { ...params, verdict: 'APPLICABLE', certification_tier: 'certifying', execution_profile: params.executionProfile };
      },
    },
  });
  const A = seen.find((s) => s.direction === 'A');
  const B = seen.find((s) => s.direction === 'B');
  assert.strictEqual(A.generatorModel, 'opus');
  assert.strictEqual(A.graderModel, 'codex-current');
  assert.strictEqual(B.generatorModel, 'codex-current');
  assert.strictEqual(B.graderModel, 'opus');
});

check('both APPLICABLE + parity OK + cross-family => APPLICABLE, certifying_clean', () => {
  const r = runBidirectionalEval({
    mode: 'application', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ A: 'APPLICABLE', B: 'APPLICABLE' }) },
  });
  assert.strictEqual(r.synthesized_verdict, 'APPLICABLE');
  assert.strictEqual(r.certifying_clean, true);
  assert.strictEqual(r.verdict_capped, false);
  assert.strictEqual(r.agreement, true);
  assert.strictEqual(r.parity.parity_ok, true);
});

check('disagreement reconciles conservatively (APPLICABLE vs MIXED => MIXED)', () => {
  const r = runBidirectionalEval({
    mode: 'application', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ A: 'APPLICABLE', B: 'MIXED' }) },
  });
  assert.strictEqual(r.synthesized_verdict, 'MIXED');
  assert.strictEqual(r.agreement, false);
});

check('parity break => strong verdict capped to PROVISIONAL, certifying_clean false', () => {
  const r = runBidirectionalEval({
    mode: 'application', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ A: 'APPLICABLE', B: 'APPLICABLE' }, { breakParity: true }) },
  });
  assert.strictEqual(r.parity.parity_ok, false);
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.verdict_capped, true);
  assert.strictEqual(r.synthesized_verdict, 'PROVISIONAL');
});

check('comprehension mode: both PASS => PASS', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ A: 'PASS', B: 'PASS' }) },
  });
  assert.strictEqual(r.synthesized_verdict, 'PASS');
  assert.strictEqual(r.certifying_clean, true);
});

check('rejects a bad mode', () => {
  assert.throws(() => runBidirectionalEval({ mode: 'bogus', cwd: '/x', deps: { runDirection: () => ({}) } }), /mode must be/);
});
check('defaults runDirection to the live evaluate-skill.runEvalDirection when none injected', () => {
  // No deps.runDirection ⇒ the runner lazy-requires the real wiring (not an error).
  assert.strictEqual(typeof require('../../lib/audit/evaluate-skill').runEvalDirection, 'function');
});

console.log('5. Honest model provenance + receipt normalization (GPT-5.5 review F6, F8)');
check('F6: an unresolved direction model caps APPLICABLE to PROVISIONAL (cannot prove which model ran)', () => {
  const runDirection = ({ direction, generatorModel, graderModel, executionProfile }) => ({
    direction, generator_model: generatorModel, grader_model: graderModel,
    verdict: 'APPLICABLE', certification_tier: 'certifying', execution_profile: executionProfile,
    // Direction B's grader model is unresolvable (the codex-current case before
    // codex's concrete model is captured) → the run cannot honestly certify.
    resolved_model: direction === 'B' ? 'latest-alias-unresolved' : 'claude-opus-x',
  });
  const r = runBidirectionalEval({ mode: 'application', skill: 's', cwd: '/x/skill-graph', deps: { runDirection } });
  assert.strictEqual(r.resolved_clean, false);
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.verdict_capped, true);
  assert.strictEqual(r.synthesized_verdict, 'PROVISIONAL');
  assert.ok(/unresolved/.test(r.cap_reason));
});
check('F8: toSidecarReceipt projects ONLY schema-allowed keys', () => {
  const allowed = new Set(['frontier_pair', 'reconciliation', 'agreement', 'parity_ok', 'certifying_clean', 'synthesized_verdict', 'registry_version', 'merge_ledger_ref', 'execution_profile', 'directions']);
  const dirKeys = new Set(['role', 'generator_model', 'grader_model', 'generator_family', 'grader_family', 'resolved_model', 'verdict', 'certification_tier']);
  const epKeys = new Set(['tools', 'research', 'repoScope', 'cwd']);
  const runDirection = ({ direction, generatorModel, graderModel, generatorFamily, graderFamily, executionProfile }) => ({
    direction, generator_model: generatorModel, grader_model: graderModel,
    generator_family: generatorFamily, grader_family: graderFamily, resolved_model: 'm',
    verdict: 'APPLICABLE', certification_tier: 'certifying', execution_profile: executionProfile,
  });
  const full = runBidirectionalEval({ mode: 'application', skill: 's', cwd: '/x/skill-graph', deps: { runDirection } });
  const rec = toSidecarReceipt(full);
  for (const k of Object.keys(rec)) assert.ok(allowed.has(k), `unexpected receipt key: ${k}`);
  assert.strictEqual(rec.directions.length, 2);
  for (const d of rec.directions) for (const k of Object.keys(d)) assert.ok(dirKeys.has(k), `unexpected direction key: ${k}`);
  for (const k of Object.keys(rec.execution_profile)) assert.ok(epKeys.has(k), `unexpected execution_profile key: ${k}`);
  assert.strictEqual(rec.reconciliation, 'conservative');
});

console.log(`\nResults: ${passed} passed, 0 failed`);
