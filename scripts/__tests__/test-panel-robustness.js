'use strict';

// Unit test: panel ORCHESTRATOR robustness wiring (run-skill-audit-loop.js) for F1-F4 —
// rate-limit recovery, budget gate, eval-absent recording, no-op curation guard, and the
// advisory failure rollup. Pure DI (no real dispatch, no fs). Companion to test-panel-budget.js
// (pure modules) and test-skill-audit-loop.js (base sequencing).

const assert = require('assert');
const panel = require('../../lib/audit/run-skill-audit-loop');
const { validateCurationChanged } = require('../../lib/audit/run-skill-audit-loop-lite');
const { RateLimitError, BudgetExhaustedError } = require('../../lib/audit/panel-budget');

let passed = 0;
function check(name, fn) { fn(); passed += 1; console.log(`  PASS    ${name}`); }

// Base DI deps (mirrors test-skill-audit-loop.js makeDeps) — a curated change by default so
// the F3 no-op guard passes; hashProposal returns a path-keyed hash so current ≠ merged.
function makeDeps(overrides = {}) {
  const calls = { mandatory: [], advisory: [] };
  const base = {
    _calls: calls,
    buildResearchBrief: () => 'BRIEF',
    claimSlot: ({ model }) => ({ run_id: `r-${model}`, artifactsDir: `runs/${model}` }),
    claimAdvisorySlot: ({ model }) => ({ run_id: `r-${model}`, artifactsDir: `runs/${model}`, ok: true }),
    researchAndPropose: ({ model }) => { calls.mandatory.push(model); return { proposalPath: `p-${model}.md`, noveltyMemoPath: `n-${model}.md` }; },
    researchAndProposeAdvisory: ({ model }) => { calls.advisory.push(model); return { ok: true, proposalPath: `p-${model}.md`, noveltyMemoPath: `n-${model}.md` }; },
    releaseSlot: () => {},
    // current SKILL.md hashes to 'h:SKILL.md.current', merged to 'h:SKILL.md' — distinct ⇒ real change.
    hashProposal: (p) => (String(p).endsWith('/SKILL.md') || String(p) === 'SKILL.md' || String(p).includes('skills/') ? `h:current:${p}` : `h:merged:${p}`),
    crossReview: () => ({ ok: true, structured: { items: [] } }),
    reviseProposal: ({ ownProposalPath }) => ({ ok: true, proposalPath: ownProposalPath, contentHash: `h:${ownProposalPath}`, changed: false }),
    curate: () => ({ mergedSkillPath: 'merged-SKILL.md', mergeLedgerPath: 'merge-ledger.json', mergeLedger: { contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }, { id: 2, surfaced_by: 'codex-current', disposition: 'kept' }] } }),
    prepareEnrichedEval: ({ skillDir }) => ({ evalSkillDir: `${skillDir}/.enriched`, baselineEvalSkillDir: `${skillDir}/.baseline`, cleanup: () => {} }),
    applyMerge: ({ skillDir }) => ({ applied: `${skillDir}/SKILL.md` }),
    evalArtifactExists: () => true,
    runEvalDirection: ({ direction, executionProfile }) => ({ direction, verdict: 'APPLICABLE', certification_tier: 'certifying', execution_profile: executionProfile, certifying_clean: true }),
  };
  return { ...base, ...overrides };
}

console.log('1. F1 — rate-limit recovery (mandatory propose)');
check('a rate-limit dispatch error raises a RECOVERABLE RateLimitError with a checkpoint (not a fatal abort)', () => {
  const deps = makeDeps({
    researchAndPropose: ({ model }) => {
      if (model === 'codex-current') { const e = new Error('proposal not written'); e.dispatchOutput = 'HTTP 429 rate_limit_exceeded; retry after 30s'; throw e; }
      return { proposalPath: `p-${model}.md` };
    },
  });
  let err;
  try { panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps }); } catch (e) { err = e; }
  assert.ok(err instanceof RateLimitError, 'a rate limit raises RateLimitError, not a generic abort');
  assert.strictEqual(err.recoverable, true);
  assert.strictEqual(err.retryAfterMs, 30000);
  assert.deepStrictEqual(err.checkpoint.proposed, ['opus']);
  assert.deepStrictEqual(err.checkpoint.pending, ['codex-current']);
});
check('a NON-rate-limit mandatory failure still ABORTS (generic error)', () => {
  const deps = makeDeps({ researchAndPropose: ({ model }) => { if (model === 'codex-current') throw new Error('codex crashed hard'); return { proposalPath: `p-${model}.md` }; } });
  assert.throws(
    () => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }),
    (e) => !(e instanceof RateLimitError) && /MANDATORY research\/propose failed.*codex crashed hard/.test(e.message),
  );
});

console.log('2. F1 — pre-dispatch budget gate');
check('assertBudget throwing BudgetExhaustedError propagates as the recoverable type', () => {
  const deps = makeDeps({ assertBudget: ({ model }) => { if (model === 'opus') throw new BudgetExhaustedError('budget out', { model: 'opus', resetAt: 'later' }); } });
  let err;
  try { panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }); } catch (e) { err = e; }
  assert.ok(err instanceof BudgetExhaustedError);
  assert.strictEqual(err.recoverable, true);
});

console.log('3. F2 — explicit eval-absent recording');
check('missing eval artifact => eval_status ABSENT + eval_certified false, still keep+apply', () => {
  const deps = makeDeps({ evalArtifactExists: () => false });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.eval, null);
  assert.strictEqual(r.eval_status, 'ABSENT');
  assert.strictEqual(r.eval_certified, false);
  assert.match(r.eval_skip_reason, /no evals\/application\.json/);
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.strictEqual(r.applied, true);
});
check('eval ran + APPLICABLE => eval_status RUN + eval_certified true', () => {
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps: makeDeps() });
  assert.strictEqual(r.eval_status, 'RUN');
  assert.strictEqual(r.eval_certified, true);
});

console.log('4. F3 — no-op curation guard');
check('byte-identical curation with NO already-optimal declaration throws', () => {
  // hashProposal returns the SAME hash for current and merged ⇒ no change, no declaration.
  const deps = makeDeps({ hashProposal: () => 'IDENTICAL' });
  assert.throws(
    () => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }),
    /no-op curation/,
  );
});
check('byte-identical curation WITH curation_decision:already-optimal passes', () => {
  const deps = makeDeps({
    hashProposal: () => 'IDENTICAL',
    curate: () => ({ mergedSkillPath: 'merged-SKILL.md', mergeLedgerPath: 'm.json', mergeLedger: { curation_decision: 'already-optimal', contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }, { id: 2, surfaced_by: 'codex-current', disposition: 'kept' }] } }),
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.applied, true);
});
check('validateCurationChanged pure predicate', () => {
  assert.strictEqual(validateCurationChanged({ currentHash: 'a', mergedHash: 'b' }).ok, true);
  assert.strictEqual(validateCurationChanged({ currentHash: 'a', mergedHash: 'a' }).ok, false);
  assert.strictEqual(validateCurationChanged({ currentHash: 'a', mergedHash: 'a', ledger: { curation_decision: 'already-optimal' } }).ok, true);
});

console.log('5. F4 — advisory failure rollup');
check('advisory failures are summarized by reason + advisory_critical fires when all die', () => {
  const deps = makeDeps({
    researchAndProposeAdvisory: ({ model }) => (
      model === 'minimax' ? { ok: false, error: 'timed out', failure_reason: 'timeout' }
        : { ok: false, error: 'auth fail', failure_reason: 'error' }
    ),
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: ['minimax', 'gemini'], deps });
  assert.strictEqual(r.applied, true, 'advisory failures never abort');
  assert.deepStrictEqual(r.advisory_models_alive, []);
  assert.strictEqual(r.advisory_critical, true);
  assert.deepStrictEqual(r.advisory_failure_summary, { timeout: 1, error: 1 });
  assert.ok(r.advisory_failures.every((f) => f.failure_reason));
});
check('advisory auth preflight warnings surface in the receipt + never drop a model', () => {
  const deps = makeDeps({
    advisoryAuthPreflight: (models) => ({ models, warnings: [{ model: 'minimax', backend: 'opencode', hint: 'opencode auth login' }], ready: ['gemini'] }),
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: ['minimax', 'gemini'], deps });
  assert.strictEqual(r.advisory_auth_warnings.length, 1);
  assert.strictEqual(r.advisory_auth_warnings[0].model, 'minimax');
  // both advisory models were still attempted (none dropped by the preflight)
  assert.deepStrictEqual(deps._calls.advisory.sort(), ['gemini', 'minimax']);
});

console.log(`\n${passed} passed`);
