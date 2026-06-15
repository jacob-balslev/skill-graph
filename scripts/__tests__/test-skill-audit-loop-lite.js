'use strict';

// Unit test: bidirectional IMPROVE orchestrator (the PRIMARY op). Covers the pure
// decision logic — anti-loss merge-ledger validation and the keep-or-revert
// guardrail — plus the DI sequencing (claim→research→release per model, curate,
// eval guardrail, keep-or-revert), all without live CLIs.

const assert = require('assert');
const audit = require('../../lib/audit/run-skill-audit-loop-lite');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log(`  PASS    ${name}`);
}

console.log('1. validateAntiLoss — every contribution kept, or dropped with a valid reason');
check('all kept => ok', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 1, disposition: 'kept' }, { id: 2, disposition: 'kept' }] });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.kept, 2);
  assert.strictEqual(r.dropped, 0);
});
check('dropped WITH a wrong/redundant/harmful reason => ok', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 1, disposition: 'dropped', drop_reason: 'factually wrong — contradicts the schema' }] });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.dropped, 1);
});
check('dropped with NO reason => violation', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 7, disposition: 'dropped' }] });
  assert.strictEqual(r.ok, false);
  assert.ok(/NO recorded reason/.test(r.violations[0].reason));
});
check('dropped for "didn\'t move the score" (unscored) => violation (audit-not-strip)', () => {
  const r = audit.validateAntiLoss({ contributions: [
    { id: 'a', disposition: 'dropped', drop_reason: "this content didn't move the eval score" },
    { id: 'b', disposition: 'dropped', drop_reason: 'unscored by the A/B delta' },
    { id: 'c', disposition: 'dropped', drop_reason: 'no measured lift' },
  ] });
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.violations.length, 3);
});
check('unknown disposition => violation', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 1, disposition: 'maybe' }] });
  assert.strictEqual(r.ok, false);
});
// Regression (2026-06-13): the curate prompt mandates a 5-value disposition vocabulary
// (kept|incorporated|dropped|rejected|deferred-to-eval); the validator previously accepted
// only kept|dropped and aborted every real panel run at the merge-ledger gate.
check('incorporated (advisory folded in) => ok, counts as kept', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 1, disposition: 'incorporated' }, { id: 2, disposition: 'kept' }] });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.kept, 2);
});
check('rejected WITH a reason => ok, counts as dropped', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 1, disposition: 'rejected', reason: 'redundant with an already-kept claim' }] });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.dropped, 1);
});
check('rejected with NO reason => violation', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 1, disposition: 'rejected' }] });
  assert.strictEqual(r.ok, false);
  assert.ok(/NO recorded reason/.test(r.violations[0].reason));
});
check('deferred-to-eval WITH a reason => ok (explicit non-silent disposition)', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 1, disposition: 'deferred-to-eval', reason: 'let the A/B eval decide if this case helps' }] });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.deferred, 1);
});
check('deferred-to-eval with NO reason => violation', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 1, disposition: 'deferred-to-eval' }] });
  assert.strictEqual(r.ok, false);
});
check('rejected for an unscored/delta reason => violation (curate-not-strip)', () => {
  const r = audit.validateAntiLoss({ contributions: [{ id: 1, disposition: 'rejected', reason: "didn't move the eval score" }] });
  assert.strictEqual(r.ok, false);
});
check('adversarial known-drop ledger reports every violation, not only the first', () => {
  const r = audit.validateAntiLoss({ contributions: [
    { id: 'missing-reason', disposition: 'dropped' },
    { id: 'delta-prune', disposition: 'rejected', reason: 'no measured lift' },
    { id: 'bad-disposition', disposition: 'ignored', reason: 'not relevant' },
    { id: 'defer-without-reason', disposition: 'deferred-to-eval' },
    { id: 'valid-control', disposition: 'dropped', drop_reason: 'factually wrong after source check' },
  ] });
  assert.strictEqual(r.ok, false);
  assert.deepStrictEqual(
    r.violations.map(v => v.id).sort(),
    ['bad-disposition', 'defer-without-reason', 'delta-prune', 'missing-reason'],
  );
});
check('F10: empty / missing ledger => violation (a union of 2 proposals must record contributions)', () => {
  assert.strictEqual(audit.validateAntiLoss({ contributions: [] }).ok, false);
  assert.strictEqual(audit.validateAntiLoss({}).ok, false);
  assert.strictEqual(audit.validateAntiLoss(null).ok, false);
});

console.log('2. decideKeepOrRevert — guardrail only (revert ONLY on genuine regression)');
check('HARMFUL => revert', () => {
  const d = audit.decideKeepOrRevert({ synthesized_verdict: 'HARMFUL' });
  assert.strictEqual(d.action, 'revert');
});
check('FALSE_POSITIVE => revert', () => {
  assert.strictEqual(audit.decideKeepOrRevert({ synthesized_verdict: 'FALSE_POSITIVE' }).action, 'revert');
});
check('verdict measurably worse than prior => revert (PROVISIONAL < APPLICABLE)', () => {
  const d = audit.decideKeepOrRevert({ synthesized_verdict: 'PROVISIONAL' }, { priorVerdict: 'APPLICABLE' });
  assert.strictEqual(d.action, 'revert');
});
check('APPLICABLE => keep', () => {
  assert.strictEqual(audit.decideKeepOrRevert({ synthesized_verdict: 'APPLICABLE' }).action, 'keep');
});
check('UNVERIFIED / non-lift => KEEP (absence of measured lift is not a regression)', () => {
  assert.strictEqual(audit.decideKeepOrRevert({ synthesized_verdict: 'UNVERIFIED' }).action, 'keep');
  // A PROVISIONAL result with no prior graded verdict must NOT revert — never strip on non-lift.
  assert.strictEqual(audit.decideKeepOrRevert({ synthesized_verdict: 'PROVISIONAL' }).action, 'keep');
  // REDUNDANT (skill didn't add measured value) is NOT a regression to revert — audit keeps it.
  assert.strictEqual(audit.decideKeepOrRevert({ synthesized_verdict: 'REDUNDANT' }).action, 'keep');
  assert.strictEqual(audit.decideKeepOrRevert({ synthesized_verdict: 'NOT_DISCRIMINATED_CEILING' }).action, 'keep');
  assert.strictEqual(audit.decideKeepOrRevert({ synthesized_verdict: 'EQUIVALENT_ON_FRONTIER' }).action, 'keep');
});
check('F9: an invalid/capped run (certifying_clean:false) DEFERS — never reverts on a confidence cap', () => {
  // Parity failed → APPLICABLE was capped to PROVISIONAL; prior was APPLICABLE. The
  // naive prior-comparison would revert, but a cap is not a regression — defer (keep).
  const d = audit.decideKeepOrRevert(
    { synthesized_verdict: 'PROVISIONAL', certifying_clean: false, cap_reason: 'parity failed' },
    { priorVerdict: 'APPLICABLE' },
  );
  assert.strictEqual(d.action, 'keep');
  // Even a HARMFUL verdict on a non-certifying-clean (untrustworthy) run defers,
  // because the run itself is invalid — we don't act on an unprovable measurement.
  assert.strictEqual(audit.decideKeepOrRevert({ synthesized_verdict: 'HARMFUL', certifying_clean: false }).action, 'keep');
});

console.log('3. runSkillAuditLoopLite — DI sequencing');

function makeDeps(overrides = {}) {
  const calls = { claims: [], releases: [], proposals: [], curated: 0, prepared: 0, cleaned: 0, applied: 0, evalDirs: [] };
  const base = {
    _calls: calls,
    buildResearchBrief: () => 'BRIEF',
    claimSlot: ({ skill, model }) => { calls.claims.push(model); return { run_id: `r-${model}`, artifactsDir: `runs/${model}` }; },
    researchAndPropose: ({ model }) => { calls.proposals.push(model); return { proposalPath: `p-${model}.md`, noveltyMemoPath: `n-${model}.md` }; },
    releaseSlot: ({ model, status }) => calls.releases.push(`${model}:${status}`),
    curate: () => { calls.curated += 1; return { mergedSkillPath: 'SKILL.md', mergeLedgerPath: 'merge-ledger.json', mergeLedger: { contributions: [{ id: 1, disposition: 'kept' }] } }; },
    // SH-6686: the guardrail grades the CANDIDATE skill — prepareCandidateEval returns a
    // (mock) temp dir; the eval should run against it, not the canonical skillDir.
    prepareCandidateEval: ({ skillDir }) => { calls.prepared += 1; return { evalSkillDir: `${skillDir}/.candidate`, cleanup: () => { calls.cleaned += 1; } }; },
    // SH-6686: apply only on KEEP — records the call and returns the canonical path.
    applyMerge: ({ skillDir }) => { calls.applied += 1; return { applied: `${skillDir}/SKILL.md` }; },
    // runEvalDirection echoes the profile so parity holds; both directions PASS (comprehension).
    runEvalDirection: ({ direction, generatorModel, graderModel, executionProfile, skillDir }) => {
      calls.evalDirs.push(skillDir);
      return {
        direction, generator_model: generatorModel, grader_model: graderModel,
        verdict: 'PASS', certification_tier: 'certifying',
        calibrated: true, red_herring_cases_total: 1,
        execution_profile: executionProfile,
      };
    },
  };
  return { ...base, ...overrides };
}

check('runs both frontier models, curates, evals the CANDIDATE copy, keeps + applies', () => {
  const deps = makeDeps();
  const r = audit.runSkillAuditLoopLite({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', deps });
  assert.deepStrictEqual(deps._calls.claims, ['opus', 'gpt-5.5']);
  assert.deepStrictEqual(deps._calls.proposals, ['opus', 'gpt-5.5']);
  assert.deepStrictEqual(deps._calls.releases, ['opus:completed', 'gpt-5.5:completed']);
  assert.strictEqual(deps._calls.curated, 1);
  assert.strictEqual(r.merge.anti_loss.ok, true);
  assert.strictEqual(r.eval.synthesized_verdict, 'PASS');
  assert.strictEqual(r.eval.merge_ledger_ref, 'merge-ledger.json');
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  // SH-6686: the eval ran against the CANDIDATE temp dir, not the canonical skillDir.
  assert.strictEqual(deps._calls.prepared, 1);
  assert.strictEqual(r.candidate_eval, true);
  assert.ok(deps._calls.evalDirs.every((d) => d === '/x/skills/s/.candidate'), 'eval ran on the improved copy');
  // KEEP => applied to canonical exactly once; the temp eval dir was cleaned up.
  assert.strictEqual(deps._calls.applied, 1);
  assert.strictEqual(r.applied, true);
  assert.strictEqual(deps._calls.cleaned, 1);
});

check('anti-loss violation in the merge throws (no silent lossy merge)', () => {
  const deps = makeDeps({
    curate: () => ({ mergedSkillPath: 'SKILL.md', mergeLedgerPath: 'm.json', mergeLedger: { contributions: [{ id: 9, disposition: 'dropped' }] } }),
  });
  assert.throws(() => audit.runSkillAuditLoopLite({ skill: 's', skillDir: '/x/s', cwd: '/x', deps }), /anti-loss/);
});

check('genuine regression (verdict measurably worse than prior) => revert: does NOT apply to canonical (SH-6686)', () => {
  const deps = makeDeps({
    runEvalDirection: ({ direction, executionProfile }) => ({
      direction,
      verdict: 'SHALLOW',
      certification_tier: 'certifying',
      execution_profile: executionProfile,
    }),
  });
  // Prior was PASS; the curated body now grades SHALLOW — measurably worse, so revert.
  const r = audit.runSkillAuditLoopLite({ skill: 's', skillDir: '/x/s', cwd: '/x', priorVerdict: 'PASS', deps });
  assert.strictEqual(r.keep_or_revert.action, 'revert');
  // The canonical skill is mutated ONLY on keep — a revert never applies (no git-revert-HEAD).
  assert.strictEqual(deps._calls.applied, 0);
  assert.strictEqual(r.applied, false);
  // The improved temp eval dir is still cleaned up.
  assert.strictEqual(deps._calls.cleaned, 1);
});

check('eval guardrail skipped when no direction runner injected (audit-only) => keep + apply, eval null', () => {
  const deps = makeDeps({ runEvalDirection: undefined });
  const r = audit.runSkillAuditLoopLite({ skill: 's', skillDir: '/x/s', cwd: '/x', deps });
  assert.strictEqual(r.eval, null);
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.strictEqual(r.applied, true); // keep => apply, even when the eval was deferred
});

check('eval artifact MISSING (deps.evalArtifactExists=false) => guardrail skipped => keep + apply, eval null', () => {
  // Many skills have no evals/comprehension.json. The guardrail must SKIP (absence of
  // an eval is not a regression) instead of crashing deep in the eval runner. A runner
  // is injected, but the artifact predicate is false.
  const deps = makeDeps({ evalArtifactExists: () => false });
  const r = audit.runSkillAuditLoopLite({ skill: 's', skillDir: '/x/s', cwd: '/x', deps });
  assert.strictEqual(r.eval, null, 'eval skipped when artifact absent');
  assert.strictEqual(deps._calls.evalDirs.length, 0, 'the direction runner was never invoked');
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.match(r.keep_or_revert.reason, /no evals\/comprehension\.json/);
  assert.strictEqual(r.applied, true, 'keep => apply even when the eval was skipped for a missing artifact');
});

check('eval artifact PRESENT (deps.evalArtifactExists=true) => guardrail runs as before', () => {
  const deps = makeDeps({ evalArtifactExists: () => true });
  const r = audit.runSkillAuditLoopLite({ skill: 's', skillDir: '/x/s', cwd: '/x', deps });
  assert.strictEqual(r.eval.synthesized_verdict, 'PASS');
  assert.strictEqual(deps._calls.evalDirs.length, 2, 'both directions ran');
});

check('requires skill, skillDir, cwd, and the injected deps', () => {
  assert.throws(() => audit.runSkillAuditLoopLite({ deps: {} }), /skill, skillDir, and cwd are required/);
  assert.throws(() => audit.runSkillAuditLoopLite({ skill: 's', skillDir: '/x', cwd: '/x', deps: {} }), /must be a function/);
});

console.log(`\nResults: ${passed} passed, 0 failed`);
