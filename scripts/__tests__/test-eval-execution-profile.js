'use strict';

// Unit test: tools-ON parity execution profile + bidirectional eval orchestrator.
// Covers lib/audit/eval-execution-profile.js (the lockstep-parity invariant) and
// lib/audit/run-bidirectional-eval.js (sequencing + conservative reconciliation +
// parity gating, via an injected runDirection — no live CLI calls).

const assert = require('assert');
const ep = require('../../lib/audit/eval-execution-profile');
const { runBidirectionalEval, runSingleFrontierEval, toSidecarReceipt } = require('../../lib/audit/run-bidirectional-eval');

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
check('defaults to tools=full, research=repo (NO web), public repo scope', () => {
  const p = ep.buildExecutionProfile({ cwd: '/x/skill-graph' });
  assert.strictEqual(p.tools, 'full');
  assert.strictEqual(p.research, 'repo'); // no-web baseline default (2026-06-11)
  assert.strictEqual(p.repoScope, 'skill-graph + skills ONLY');
  assert.strictEqual(p.cwd, '/x/skill-graph');
});
check('SKILL_EVAL_WEB=on restores repo+web; explicit research arg always wins over env', () => {
  const prev = process.env.SKILL_EVAL_WEB;
  try {
    process.env.SKILL_EVAL_WEB = 'on';
    assert.strictEqual(ep.resolveDefaultEvalResearch(), 'repo+web');
    assert.strictEqual(ep.buildExecutionProfile({ cwd: '/x' }).research, 'repo+web');
    // explicit arg wins over env even when web is on
    assert.strictEqual(ep.buildExecutionProfile({ cwd: '/x', research: 'repo' }).research, 'repo');
    delete process.env.SKILL_EVAL_WEB;
    assert.strictEqual(ep.resolveDefaultEvalResearch(), 'repo');
  } finally {
    if (prev === undefined) delete process.env.SKILL_EVAL_WEB; else process.env.SKILL_EVAL_WEB = prev;
  }
});

console.log('2. cliAccessForProfile — equal access, different flags');
check('claude: default profile (research=repo) => allowTools true, web FALSE', () => {
  const p = ep.buildExecutionProfile({ cwd: '/x/skill-graph' });
  const a = ep.cliAccessForProfile('claude', p);
  assert.strictEqual(a.allowTools, true);
  assert.strictEqual(a.web, false); // no-web baseline
});
check('claude: research=repo+web => web TRUE', () => {
  const p = ep.buildExecutionProfile({ cwd: '/x/skill-graph', research: ep.RESEARCH_REPO_WEB });
  assert.strictEqual(ep.cliAccessForProfile('claude', p).web, true);
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
    // The Codex direction optionally records a DIFFERENT profile to simulate a parity break.
    execution_profile: breakParity && direction === 'Codex'
      ? { ...executionProfile, tools: 'none' }
      : executionProfile,
  });
}

check('swaps generator/grader across directions (Claude: opus→codex-current, Codex: codex-current→opus)', () => {
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
  const A = seen.find((s) => s.direction === 'Claude');
  const B = seen.find((s) => s.direction === 'Codex');
  assert.strictEqual(A.generatorModel, 'opus');
  assert.strictEqual(A.graderModel, 'codex-current');
  assert.strictEqual(B.generatorModel, 'codex-current');
  assert.strictEqual(B.graderModel, 'opus');
});

check('both APPLICABLE + parity OK + cross-family => APPLICABLE, certifying_clean', () => {
  const r = runBidirectionalEval({
    mode: 'application', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'APPLICABLE', Codex: 'APPLICABLE' }) },
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
    deps: { runDirection: fakeRunner({ Claude: 'APPLICABLE', Codex: 'MIXED' }) },
  });
  assert.strictEqual(r.synthesized_verdict, 'MIXED');
  assert.strictEqual(r.agreement, false);
});

check('parity break => strong verdict capped to PROVISIONAL, certifying_clean false', () => {
  const r = runBidirectionalEval({
    mode: 'application', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'APPLICABLE', Codex: 'APPLICABLE' }, { breakParity: true }) },
  });
  assert.strictEqual(r.parity.parity_ok, false);
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.verdict_capped, true);
  assert.strictEqual(r.synthesized_verdict, 'PROVISIONAL');
});

check('comprehension mode: both PASS => PASS', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'PASS', Codex: 'PASS' }) },
  });
  assert.strictEqual(r.synthesized_verdict, 'PASS');
  assert.strictEqual(r.certifying_clean, true);
});

check('SH-6682: per-family applicable_for — both certifying => "both", aggregate kept', () => {
  const r = runBidirectionalEval({
    mode: 'application', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'APPLICABLE', Codex: 'APPLICABLE' }) },
  });
  assert.strictEqual(r.applicable_for, 'both');
  assert.strictEqual(r.synthesized_verdict, 'APPLICABLE'); // aggregate unchanged
});
check('SH-6682: divergent — only the anthropic (Claude/opus) direction certifies => "anthropic"', () => {
  // Claude (opus → anthropic) APPLICABLE, Codex (gpt → openai) MIXED. The conservative
  // aggregate caps to MIXED, but the per-family field surfaces that the skill helps Anthropic.
  const r = runBidirectionalEval({
    mode: 'application', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'APPLICABLE', Codex: 'MIXED' }) },
  });
  assert.strictEqual(r.applicable_for, 'anthropic');
  assert.strictEqual(r.synthesized_verdict, 'MIXED');
});
check('SH-6682: not certifying-clean (parity break) => "neither" even with both APPLICABLE', () => {
  const r = runBidirectionalEval({
    mode: 'application', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'APPLICABLE', Codex: 'APPLICABLE' }, { breakParity: true }) },
  });
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.applicable_for, 'neither');
});
check('SH-6682: comprehension — only Codex (openai) PASS => "openai"', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'SHALLOW', Codex: 'PASS' }) },
  });
  assert.strictEqual(r.applicable_for, 'openai');
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
    // The Codex direction's grader model is unresolvable (the codex-current case
    // before codex's concrete model is captured) → the run cannot honestly certify.
    resolved_model: direction === 'Codex' ? 'latest-alias-unresolved' : 'claude-opus-x',
  });
  const r = runBidirectionalEval({ mode: 'application', skill: 's', cwd: '/x/skill-graph', deps: { runDirection } });
  assert.strictEqual(r.resolved_clean, false);
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.verdict_capped, true);
  assert.strictEqual(r.synthesized_verdict, 'PROVISIONAL');
  assert.ok(/unresolved/.test(r.cap_reason));
});
check('F8: toSidecarReceipt projects ONLY schema-allowed keys', () => {
  const allowed = new Set(['frontier_pair', 'reconciliation', 'agreement', 'parity_ok', 'certifying_clean', 'synthesized_verdict', 'applicable_for', 'registry_version', 'merge_ledger_ref', 'provisional_reason', 'missing_frontiers', 'regrade_required', 'execution_profile', 'directions']);
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

console.log('6. Single-available-frontier degraded eval');
check('single frontier APPLICABLE is capped to PROVISIONAL and marked for re-grade', () => {
  const r = runSingleFrontierEval({
    mode: 'application',
    skill: 's',
    cwd: '/x/skill-graph',
    frontierModel: 'codex-current',
    missingFrontiers: ['opus'],
    provisionalReason: 'single_frontier:opus_budget_exhausted',
    deps: {
      runDirection: ({ direction, generatorModel, graderModel, executionProfile }) => ({
        direction,
        generator_model: generatorModel,
        grader_model: graderModel,
        verdict: 'APPLICABLE',
        certification_tier: 'certifying',
        execution_profile: executionProfile,
      }),
    },
  });
  assert.deepStrictEqual(r.frontier_pair, ['codex-current']);
  assert.strictEqual(r.reconciliation, 'single-frontier-provisional');
  assert.strictEqual(r.synthesized_verdict, 'PROVISIONAL');
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.regrade_required, true);
  assert.deepStrictEqual(r.missing_frontiers, ['opus']);
});
check('single frontier sidecar receipt keeps one direction plus regrade evidence', () => {
  const r = runSingleFrontierEval({
    mode: 'comprehension',
    skill: 's',
    cwd: '/x/skill-graph',
    frontierModel: 'opus',
    missingFrontiers: ['codex-current'],
    deps: {
      runDirection: ({ direction, generatorModel, graderModel, executionProfile }) => ({
        direction,
        generator_model: generatorModel,
        grader_model: graderModel,
        verdict: 'PASS',
        certification_tier: 'certifying',
        execution_profile: executionProfile,
      }),
    },
  });
  const rec = toSidecarReceipt(r);
  assert.strictEqual(rec.reconciliation, 'single-frontier-provisional');
  assert.deepStrictEqual(rec.frontier_pair, ['opus']);
  assert.strictEqual(rec.directions.length, 1);
  assert.strictEqual(rec.directions[0].role, 'Claude');
  assert.strictEqual(rec.regrade_required, true);
  assert.deepStrictEqual(rec.missing_frontiers, ['codex-current']);
});

console.log('\n4. web-off baseline — CLI arg builder + isolated workspace');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { runClaudeCliPrompt } = require('../../lib/audit/evaluate-skill');
const { prepareIsolatedEvalWorkspace } = require('../../lib/audit/isolated-eval-workspace');

check('repo-only (no web) both directions, tools full => parity_ok true (certifying config preserved)', () => {
  const p = ep.buildExecutionProfile({ cwd: '/x/skill-graph' }); // research=repo
  const r = ep.assertParity(p, { ...p });
  assert.strictEqual(r.parity_ok, true);
  assert.ok(/tools=full/.test(r.reason), r.reason);
});

// Stub claude binary that echoes its args so we can assert the disallowed-tools flag
// without spawning the real CLI (CLAUDE_GRADER_BIN override path, SKI-133).
(() => {
  const stubDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-stub-'));
  const stubBin = path.join(stubDir, 'claude');
  fs.writeFileSync(stubBin, '#!/bin/sh\necho "ARGS: $@"\n');
  fs.chmodSync(stubBin, 0o755);
  const prevBin = process.env.CLAUDE_GRADER_BIN;
  process.env.CLAUDE_GRADER_BIN = stubBin;
  try {
    check('claude arg-builder: allowTools + web OFF => --disallowed-tools WebSearch,WebFetch (repo tools stay ON)', () => {
      const out = runClaudeCliPrompt('hi', { model: 'opus', allowTools: true, web: false });
      assert.ok(/--disallowed-tools WebSearch,WebFetch/.test(out), out);
      assert.ok(!/Read,Edit,Write,Bash/.test(out), 'repo/exec tools must NOT be disallowed when allowTools is true');
    });
    check('claude arg-builder: allowTools + web ON => no --disallowed-tools', () => {
      const out = runClaudeCliPrompt('hi', { model: 'opus', allowTools: true, web: true });
      assert.ok(!/--disallowed-tools/.test(out), out);
    });
    check('claude arg-builder: tools OFF => full disallow list (incl WebSearch,WebFetch)', () => {
      const out = runClaudeCliPrompt('hi', { model: 'opus', allowTools: false });
      assert.ok(/--disallowed-tools Read,Edit,Write,Bash,Glob,Grep,Agent,WebSearch,WebFetch,NotebookEdit/.test(out), out);
    });
  } finally {
    if (prevBin === undefined) delete process.env.CLAUDE_GRADER_BIN; else process.env.CLAUDE_GRADER_BIN = prevBin;
    fs.rmSync(stubDir, { recursive: true, force: true });
  }
})();

check('prepareIsolatedEvalWorkspace: public copy, repo-only (web-off) profile, candidate absent, cleanup', () => {
  const src = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-src-')); // tiny stand-in for skill-graph repo
  fs.writeFileSync(path.join(src, 'marker.txt'), 'public');
  const iso = prepareIsolatedEvalWorkspace({ skillGraphRoot: src });
  try {
    assert.strictEqual(iso.active, true);
    assert.strictEqual(iso.executionProfile.research, 'repo'); // web OFF
    assert.strictEqual(iso.executionProfile.tools, 'full');
    assert.strictEqual(iso.baselineWorkspace, iso.cwd);
    assert.ok(fs.existsSync(path.join(iso.cwd, 'marker.txt')), 'skill-graph content copied into the isolated cwd');
    assert.ok(!fs.existsSync(path.join(iso.cwd, '..', 'skills')), 'skills corpus NOT copied (candidate definitionally absent)');
  } finally {
    iso.cleanup();
    fs.rmSync(src, { recursive: true, force: true });
  }
  assert.ok(!fs.existsSync(iso.root), 'cleanup removes the tmp workspace');
});

console.log(`\nResults: ${passed} passed, 0 failed`);
