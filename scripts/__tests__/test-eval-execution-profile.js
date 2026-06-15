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
check('A6: a real-repo-root cwd defaults to fence=prompt-level; os-isolated only when asserted', () => {
  assert.strictEqual(ep.buildExecutionProfile({ cwd: '/x/skill-graph' }).fence, 'prompt-level');
  assert.strictEqual(ep.buildExecutionProfile({ cwd: '/x/skill-graph', fence: ep.FENCE_OS_ISOLATED }).fence, 'os-isolated');
  // An unknown fence value is normalized to prompt-level (the safe, weaker assertion).
  assert.strictEqual(ep.buildExecutionProfile({ cwd: '/x', fence: 'wishful' }).fence, 'prompt-level');
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

console.log('4. runBidirectionalEval — representative generator, frontier judges, conservative reconcile, parity gate');

// A faithful injected runDirection: echoes back the profile it was handed (so
// parity holds) and a per-direction verdict from a lookup keyed by direction.
function fakeRunner(verdictByDirection, { breakParity = false, calibrated = true, redHerringCases = 1 } = {}) {
  return ({ direction, generatorModel, graderModel, executionProfile }) => ({
    direction,
    generator_model: generatorModel,
    grader_model: graderModel,
    verdict: verdictByDirection[direction],
    certification_tier: 'certifying',
    calibrated,
    red_herring_cases_total: redHerringCases,
    // The Codex direction optionally records a DIFFERENT profile to simulate a parity break.
    execution_profile: breakParity && direction === 'Codex'
      ? { ...executionProfile, tools: 'none' }
      : executionProfile,
  });
}

check('uses representative generator with both frontier judges (Claude judge + Codex judge)', () => {
  const seen = [];
  const caseIds = new Set([1, 5]);
  runBidirectionalEval({
    mode: 'comprehension',
    skill: 's',
    cwd: '/x/skill-graph',
    caseIds,
    trials: 1,
    deps: {
      runDirection: (params) => {
        seen.push(params);
        return {
          ...params,
          verdict: 'PASS',
          certification_tier: 'certifying',
          calibrated: true,
          red_herring_cases_total: 1,
          execution_profile: params.executionProfile,
        };
      },
    },
  });
  const A = seen.find((s) => s.direction === 'Claude');
  const B = seen.find((s) => s.direction === 'Codex');
  assert.strictEqual(A.generatorModel, 'representative-generator');
  assert.strictEqual(A.graderModel, 'opus');
  assert.strictEqual(B.generatorModel, 'representative-generator');
  assert.strictEqual(B.graderModel, 'gpt-5.5');
  assert.strictEqual(A.caseIds, caseIds);
  assert.strictEqual(B.caseIds, caseIds);
  assert.strictEqual(A.trials, 1);
  assert.strictEqual(B.trials, 1);
});

check('both frontier judges PASS + parity OK => PASS, certifying_clean', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'PASS', Codex: 'PASS' }) },
  });
  assert.strictEqual(r.synthesized_verdict, 'PASS');
  assert.strictEqual(r.certifying_clean, true);
  assert.strictEqual(r.verdict_capped, false);
  assert.strictEqual(r.agreement, true);
  assert.strictEqual(r.parity.parity_ok, true);
});

check('disagreement reconciles conservatively (PASS vs SHALLOW => SHALLOW)', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'PASS', Codex: 'SHALLOW' }) },
  });
  assert.strictEqual(r.synthesized_verdict, 'SHALLOW');
  assert.strictEqual(r.agreement, false);
});

check('parity break => strong verdict capped to PROVISIONAL, certifying_clean false', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'PASS', Codex: 'PASS' }, { breakParity: true }) },
  });
  assert.strictEqual(r.parity.parity_ok, false);
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.verdict_capped, true);
  assert.strictEqual(r.synthesized_verdict, 'PROVISIONAL');
});

check('A7: resolved model family != declared family caps PASS to PROVISIONAL', () => {
  // The Claude judge direction declares an `opus` (anthropic) grader but RESOLVES to a
  // gpt id (openai) — a stale alias / registry drift. The certifying decision was
  // computed from the DECLARED family, so the run must not certify.
  const runDirection = ({ direction, generatorModel, graderModel, executionProfile }) => ({
    direction,
    generator_model: generatorModel,
    grader_model: graderModel,
    generator_family: generatorModel,
    grader_family: graderModel,
    // Claude direction's grader alias is `opus` (anthropic) but resolves to a GPT id.
    resolved_model: direction === 'Claude' ? 'gpt-5.4' : undefined,
    verdict: 'PASS',
    certification_tier: 'certifying',
    calibrated: true,
    red_herring_cases_total: 1,
    execution_profile: executionProfile,
  });
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection },
  });
  assert.strictEqual(r.family_consistent, false);
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.verdict_capped, true);
  assert.strictEqual(r.synthesized_verdict, 'PROVISIONAL');
  assert.ok(/resolved model family differs/.test(r.cap_reason), `cap_reason mentions family mismatch: ${r.cap_reason}`);
});

check('A7: resolved family == declared family stays certifying_clean', () => {
  // Same as the certifying-clean baseline but with resolved ids that AGREE with the
  // declared family — the mismatch guard must not fire on an honest resolution.
  const runDirection = ({ direction, generatorModel, graderModel, executionProfile }) => ({
    direction,
    generator_model: generatorModel,
    grader_model: graderModel,
    generator_family: generatorModel,
    grader_family: graderModel,
    // representative-generator is a role receipt id; frontier graders resolve to their families.
    resolved_generator_model: 'representative-generator:sonnet',
    resolved_model: graderModel === 'opus' ? 'claude-opus-4-8' : 'gpt-5.4',
    verdict: 'PASS',
    certification_tier: 'certifying',
    calibrated: true,
    red_herring_cases_total: 1,
    execution_profile: executionProfile,
  });
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection },
  });
  assert.strictEqual(r.family_consistent, true);
  assert.strictEqual(r.certifying_clean, true);
  assert.strictEqual(r.synthesized_verdict, 'PASS');
});

check('comprehension mode: both PASS => PASS', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'PASS', Codex: 'PASS' }) },
  });
  assert.strictEqual(r.synthesized_verdict, 'PASS');
  assert.strictEqual(r.certifying_clean, true);
});

check('SKI-306: both frontier judges certify => applicable_for "representative", aggregate kept', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'PASS', Codex: 'PASS' }) },
  });
  assert.strictEqual(r.applicable_for, 'representative');
  assert.strictEqual(r.synthesized_verdict, 'PASS'); // aggregate unchanged
});
check('SKI-306: divergent frontier judges => no representative certification', () => {
  // The representative generator is the measured subject in both directions. If the
  // frontier judges disagree, the conservative aggregate caps and the population is not certified.
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'PASS', Codex: 'SHALLOW' }) },
  });
  assert.strictEqual(r.applicable_for, 'neither');
  assert.strictEqual(r.synthesized_verdict, 'SHALLOW');
});
check('SH-6682: not certifying-clean (parity break) => "neither" even with both PASS', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'PASS', Codex: 'PASS' }, { breakParity: true }) },
  });
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.applicable_for, 'neither');
});
check('SKI-306: comprehension — one frontier judge PASS is not representative certification', () => {
  const r = runBidirectionalEval({
    mode: 'comprehension', skill: 's', cwd: '/x/skill-graph',
    deps: { runDirection: fakeRunner({ Claude: 'SHALLOW', Codex: 'PASS' }) },
  });
  assert.strictEqual(r.applicable_for, 'neither');
});

check('rejects a bad mode', () => {
  assert.throws(() => runBidirectionalEval({ mode: 'bogus', cwd: '/x', deps: { runDirection: () => ({}) } }), /mode must be/);
});
check('defaults runDirection to the live evaluate-skill.runEvalDirection when none injected', () => {
  // No deps.runDirection ⇒ the runner lazy-requires the real wiring (not an error).
  assert.strictEqual(typeof require('../../lib/audit/evaluate-skill').runEvalDirection, 'function');
});

console.log('5. Honest model provenance + receipt normalization (GPT-5.5 review F6, F8)');
check('F6: an unresolved direction model caps PASS to PROVISIONAL (cannot prove which model ran)', () => {
  const runDirection = ({ direction, generatorModel, graderModel, executionProfile }) => ({
    direction, generator_model: generatorModel, grader_model: graderModel,
    verdict: 'PASS', certification_tier: 'certifying',
    calibrated: true, red_herring_cases_total: 1, execution_profile: executionProfile,
    // The Codex direction's grader model is unresolvable (the gpt-5.5 case
    // before codex's concrete model is captured) → the run cannot honestly certify.
    resolved_model: direction === 'Codex' ? 'latest-alias-unresolved' : 'claude-opus-x',
  });
  const r = runBidirectionalEval({ mode: 'comprehension', skill: 's', cwd: '/x/skill-graph', deps: { runDirection } });
  assert.strictEqual(r.resolved_clean, false);
  assert.strictEqual(r.certifying_clean, false);
  assert.strictEqual(r.verdict_capped, true);
  assert.strictEqual(r.synthesized_verdict, 'PROVISIONAL');
  assert.ok(/unresolved/.test(r.cap_reason));
});
check('F8: toSidecarReceipt projects ONLY schema-allowed keys', () => {
  const allowed = new Set(['frontier_pair', 'measured_generator', 'generator_population', 'reconciliation', 'agreement', 'parity_ok', 'certifying_clean', 'synthesized_verdict', 'eval_slice', 'applicable_for', 'registry_version', 'merge_ledger_ref', 'provisional_reason', 'missing_frontiers', 'regrade_required', 'fence_caveat', 'execution_profile', 'directions']);
  const dirKeys = new Set(['role', 'generator_model', 'grader_model', 'generator_family', 'grader_family', 'resolved_model', 'verdict', 'certification_tier']);
  const epKeys = new Set(['tools', 'research', 'repoScope', 'cwd', 'fence']);
  const runDirection = ({ direction, generatorModel, graderModel, generatorFamily, graderFamily, executionProfile }) => ({
    direction, generator_model: generatorModel, grader_model: graderModel,
    generator_family: generatorFamily, grader_family: graderFamily, resolved_model: 'm',
    verdict: 'PASS', certification_tier: 'certifying',
    calibrated: true, red_herring_cases_total: 1, execution_profile: executionProfile,
  });
  const full = runBidirectionalEval({ mode: 'comprehension', skill: 's', cwd: '/x/skill-graph', deps: { runDirection } });
  const rec = toSidecarReceipt(full);
  for (const k of Object.keys(rec)) assert.ok(allowed.has(k), `unexpected receipt key: ${k}`);
  assert.strictEqual(rec.directions.length, 2);
  for (const d of rec.directions) for (const k of Object.keys(d)) assert.ok(dirKeys.has(k), `unexpected direction key: ${k}`);
  for (const k of Object.keys(rec.execution_profile)) assert.ok(epKeys.has(k), `unexpected execution_profile key: ${k}`);
  assert.strictEqual(rec.reconciliation, 'conservative');
});

check('A6: a non-isolated run records fence=prompt-level + a fence_caveat on the receipt', () => {
  const runDirection = ({ direction, generatorModel, graderModel, generatorFamily, graderFamily, executionProfile }) => ({
    direction, generator_model: generatorModel, grader_model: graderModel,
    generator_family: generatorFamily, grader_family: graderFamily, resolved_model: graderModel,
    verdict: 'PASS', certification_tier: 'certifying',
    calibrated: true, red_herring_cases_total: 1, execution_profile: executionProfile,
  });
  // runBidirectionalEval builds its own profile from cwd (the real repo root) → prompt-level.
  const r = runBidirectionalEval({ mode: 'comprehension', skill: 's', cwd: '/x/skill-graph', deps: { runDirection } });
  assert.strictEqual(r.fence, 'prompt-level');
  assert.ok(/fence: prompt-level only/.test(r.fence_caveat), 'result carries the prompt-level fence caveat');
  const rec = toSidecarReceipt(r);
  assert.strictEqual(rec.execution_profile.fence, 'prompt-level');
  assert.ok(/prompt-level only/.test(rec.fence_caveat), 'sidecar receipt carries the fence caveat');
});

check('A6: an os-isolated profile records no fence_caveat', () => {
  // Hand-build a result whose execution profile is os-isolated (the isolated-eval-workspace path).
  const r = {
    frontier_pair: ['opus', 'gpt-5.5'], reconciliation: 'conservative', agreement: true,
    parity: { parity_ok: true }, certifying_clean: true, synthesized_verdict: 'PASS',
    applicable_for: 'representative', registry_version: 'x', merge_ledger_ref: null,
    measured_generator: 'representative-generator', generator_population: 'deployment-representative',
    direction_claude: { verdict: 'PASS' }, direction_codex: { verdict: 'PASS' },
    fence: 'os-isolated', fence_caveat: null,
    execution_profile: { tools: 'full', research: 'repo', repoScope: 'skill-graph + skills ONLY', cwd: '/tmp/skill-eval-ws/skill-graph', fence: 'os-isolated' },
  };
  const rec = toSidecarReceipt(r);
  assert.strictEqual(rec.execution_profile.fence, 'os-isolated');
  assert.ok(!('fence_caveat' in rec), 'os-isolated run carries NO fence_caveat');
});

console.log('6. Single-available-frontier degraded eval');
check('single frontier PASS is capped to PROVISIONAL and marked for re-grade', () => {
  const r = runSingleFrontierEval({
    mode: 'comprehension',
    skill: 's',
    cwd: '/x/skill-graph',
    frontierModel: 'gpt-5.5',
    missingFrontiers: ['opus'],
    provisionalReason: 'single_frontier:opus_budget_exhausted',
    deps: {
      runDirection: ({ direction, generatorModel, graderModel, executionProfile }) => ({
        direction,
        generator_model: generatorModel,
        grader_model: graderModel,
        verdict: 'PASS',
        certification_tier: 'certifying',
        calibrated: true,
        red_herring_cases_total: 1,
        execution_profile: executionProfile,
      }),
    },
  });
  assert.deepStrictEqual(r.frontier_pair, ['gpt-5.5']);
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
    missingFrontiers: ['gpt-5.5'],
    deps: {
      runDirection: ({ direction, generatorModel, graderModel, executionProfile }) => ({
        direction,
        generator_model: generatorModel,
        grader_model: graderModel,
        verdict: 'PASS',
        certification_tier: 'certifying',
        calibrated: true,
        red_herring_cases_total: 1,
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
  assert.deepStrictEqual(rec.missing_frontiers, ['gpt-5.5']);
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
