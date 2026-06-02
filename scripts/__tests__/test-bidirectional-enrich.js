'use strict';

// Unit test: bidirectional ENRICH orchestrator (the PRIMARY op). Covers the pure
// decision logic — anti-loss merge-ledger validation and the keep-or-revert
// guardrail — plus the DI sequencing (claim→research→release per model, curate,
// eval guardrail, keep-or-revert), all without live CLIs.

const assert = require('assert');
const enrich = require('../../lib/audit/run-bidirectional-enrich');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. validateAntiLoss — every contribution kept, or dropped with a valid reason');
check('all kept => ok', () => {
  const r = enrich.validateAntiLoss({ contributions: [{ id: 1, disposition: 'kept' }, { id: 2, disposition: 'kept' }] });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.kept, 2);
  assert.strictEqual(r.dropped, 0);
});
check('dropped WITH a wrong/redundant/harmful reason => ok', () => {
  const r = enrich.validateAntiLoss({ contributions: [{ id: 1, disposition: 'dropped', drop_reason: 'factually wrong — contradicts the schema' }] });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.dropped, 1);
});
check('dropped with NO reason => violation', () => {
  const r = enrich.validateAntiLoss({ contributions: [{ id: 7, disposition: 'dropped' }] });
  assert.strictEqual(r.ok, false);
  assert.ok(/NO recorded reason/.test(r.violations[0].reason));
});
check('dropped for "didn\'t move the score" (unscored) => violation (enrich-not-strip)', () => {
  const r = enrich.validateAntiLoss({ contributions: [
    { id: 'a', disposition: 'dropped', drop_reason: "this content didn't move the eval score" },
    { id: 'b', disposition: 'dropped', drop_reason: 'unscored by the A/B delta' },
    { id: 'c', disposition: 'dropped', drop_reason: 'no measured lift' },
  ] });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.violations.length, 3);
});
check('unknown disposition => violation', () => {
  const r = enrich.validateAntiLoss({ contributions: [{ id: 1, disposition: 'maybe' }] });
  assert.strictEqual(r.ok, false);
});
check('F10: empty / missing ledger => violation (a union of 2 proposals must record contributions)', () => {
  assert.strictEqual(enrich.validateAntiLoss({ contributions: [] }).ok, false);
  assert.strictEqual(enrich.validateAntiLoss({}).ok, false);
  assert.strictEqual(enrich.validateAntiLoss(null).ok, false);
});

console.log('2. decideKeepOrRevert — guardrail only (revert ONLY on genuine regression)');
check('HARMFUL => revert', () => {
  const d = enrich.decideKeepOrRevert({ synthesized_verdict: 'HARMFUL' });
  assert.strictEqual(d.action, 'revert');
});
check('FALSE_POSITIVE => revert', () => {
  assert.strictEqual(enrich.decideKeepOrRevert({ synthesized_verdict: 'FALSE_POSITIVE' }).action, 'revert');
});
check('verdict measurably worse than prior => revert (PROVISIONAL < APPLICABLE)', () => {
  const d = enrich.decideKeepOrRevert({ synthesized_verdict: 'PROVISIONAL' }, { priorVerdict: 'APPLICABLE' });
  assert.strictEqual(d.action, 'revert');
});
check('APPLICABLE => keep', () => {
  assert.strictEqual(enrich.decideKeepOrRevert({ synthesized_verdict: 'APPLICABLE' }).action, 'keep');
});
check('UNVERIFIED / non-lift => KEEP (absence of measured lift is not a regression)', () => {
  assert.strictEqual(enrich.decideKeepOrRevert({ synthesized_verdict: 'UNVERIFIED' }).action, 'keep');
  // A PROVISIONAL result with no prior graded verdict must NOT revert — never strip on non-lift.
  assert.strictEqual(enrich.decideKeepOrRevert({ synthesized_verdict: 'PROVISIONAL' }).action, 'keep');
  // REDUNDANT (skill didn't add measured value) is NOT a regression to revert — enrich keeps it.
  assert.strictEqual(enrich.decideKeepOrRevert({ synthesized_verdict: 'REDUNDANT' }).action, 'keep');
});
check('F9: an invalid/capped run (certifying_clean:false) DEFERS — never reverts on a confidence cap', () => {
  // Parity failed → APPLICABLE was capped to PROVISIONAL; prior was APPLICABLE. The
  // naive prior-comparison would revert, but a cap is not a regression — defer (keep).
  const d = enrich.decideKeepOrRevert(
    { synthesized_verdict: 'PROVISIONAL', certifying_clean: false, cap_reason: 'parity failed' },
    { priorVerdict: 'APPLICABLE' },
  );
  assert.strictEqual(d.action, 'keep');
  // Even a HARMFUL verdict on a non-certifying-clean (untrustworthy) run defers,
  // because the run itself is invalid — we don't act on an unprovable measurement.
  assert.strictEqual(enrich.decideKeepOrRevert({ synthesized_verdict: 'HARMFUL', certifying_clean: false }).action, 'keep');
});

console.log('3. runBidirectionalEnrich — DI sequencing');

function makeDeps(overrides = {}) {
  const calls = { claims: [], releases: [], proposals: [], curated: 0, reverts: [] };
  const base = {
    _calls: calls,
    buildResearchBrief: () => 'BRIEF',
    claimSlot: ({ skill, model }) => { calls.claims.push(model); return { run_id: `r-${model}`, artifactsDir: `runs/${model}` }; },
    researchAndPropose: ({ model }) => { calls.proposals.push(model); return { proposalPath: `p-${model}.md`, noveltyMemoPath: `n-${model}.md` }; },
    releaseSlot: ({ model, status }) => calls.releases.push(`${model}:${status}`),
    curate: () => { calls.curated += 1; return { mergedSkillPath: 'SKILL.md', mergeLedgerPath: 'merge-ledger.json', mergeLedger: { contributions: [{ id: 1, disposition: 'kept' }] } }; },
    // runEvalDirection echoes the profile so parity holds; both directions APPLICABLE.
    runEvalDirection: ({ direction, generatorModel, graderModel, executionProfile }) => ({
      direction, generator_model: generatorModel, grader_model: graderModel,
      verdict: 'APPLICABLE', certification_tier: 'certifying', execution_profile: executionProfile,
    }),
    revert: ({ reason }) => calls.reverts.push(reason),
  };
  return { ...base, ...overrides };
}

check('runs both frontier models, curates, runs eval guardrail, keeps', () => {
  const deps = makeDeps();
  const r = enrich.runBidirectionalEnrich({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', deps });
  assert.deepStrictEqual(deps._calls.claims, ['opus', 'codex-current']);
  assert.deepStrictEqual(deps._calls.proposals, ['opus', 'codex-current']);
  assert.deepStrictEqual(deps._calls.releases, ['opus:completed', 'codex-current:completed']);
  assert.strictEqual(deps._calls.curated, 1);
  assert.strictEqual(r.merge.anti_loss.ok, true);
  assert.strictEqual(r.eval.synthesized_verdict, 'APPLICABLE');
  assert.strictEqual(r.eval.merge_ledger_ref, 'merge-ledger.json');
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.strictEqual(deps._calls.reverts.length, 0);
});

check('anti-loss violation in the merge throws (no silent lossy merge)', () => {
  const deps = makeDeps({
    curate: () => ({ mergedSkillPath: 'SKILL.md', mergeLedgerPath: 'm.json', mergeLedger: { contributions: [{ id: 9, disposition: 'dropped' }] } }),
  });
  assert.throws(() => enrich.runBidirectionalEnrich({ skill: 's', skillDir: '/x/s', cwd: '/x', deps }), /anti-loss/);
});

check('genuine regression (HARMFUL eval) triggers revert', () => {
  const deps = makeDeps({
    runEvalDirection: ({ direction, executionProfile }) => ({ direction, verdict: 'HARMFUL', certification_tier: 'certifying', execution_profile: executionProfile }),
  });
  const r = enrich.runBidirectionalEnrich({ skill: 's', skillDir: '/x/s', cwd: '/x', deps });
  assert.strictEqual(r.keep_or_revert.action, 'revert');
  assert.strictEqual(deps._calls.reverts.length, 1);
});

check('eval guardrail skipped when no direction runner injected (enrich-only) => keep, eval null', () => {
  const deps = makeDeps({ runEvalDirection: undefined });
  const r = enrich.runBidirectionalEnrich({ skill: 's', skillDir: '/x/s', cwd: '/x', deps });
  assert.strictEqual(r.eval, null);
  assert.strictEqual(r.keep_or_revert.action, 'keep');
});

check('requires skill, skillDir, cwd, and the injected deps', () => {
  assert.throws(() => enrich.runBidirectionalEnrich({ deps: {} }), /skill, skillDir, and cwd are required/);
  assert.throws(() => enrich.runBidirectionalEnrich({ skill: 's', skillDir: '/x', cwd: '/x', deps: {} }), /must be a function/);
});

console.log(`\nResults: ${passed} passed, 0 failed`);
