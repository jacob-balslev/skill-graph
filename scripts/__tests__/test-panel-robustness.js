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
    curate: (args) => ({
      mergedSkillPath: 'merged-SKILL.md',
      mergeLedgerPath: 'merge-ledger.json',
      mergeLedger: { contributions: args.proposals.concat(args.advisoryProposals || []).map((p, i) => ({ id: i + 1, surfaced_by: p.model, disposition: 'kept' })) },
    }),
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
check('a NON-rate-limit mandatory failure RETRIES (transient), then ABORTS after retries exhausted (SKI-297)', () => {
  // "codex crashed hard" carries no STRUCTURAL/UNAVAILABLE signal → classified TRANSIENT
  // (the deliberate default), so the cell is retried PER_CELL_MAX_RETRIES (2) times before
  // the run aborts. sleepMs is stubbed to a no-op so the test does not actually sleep.
  let attempts = 0;
  const deps = makeDeps({
    sleepMs: () => {},
    researchAndPropose: ({ model }) => {
      if (model === 'codex-current') { attempts += 1; throw new Error('codex crashed hard'); }
      return { proposalPath: `p-${model}.md` };
    },
  });
  assert.throws(
    () => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }),
    (e) => !(e instanceof RateLimitError) && /MANDATORY research\/propose failed.*codex crashed hard/.test(e.message),
  );
  assert.strictEqual(attempts, 3, 'mandatory propose attempted 1 + 2 retries before aborting');
});
check('a STRUCTURAL mandatory propose failure ABORTS immediately (no retry — a retry cannot fix it) (SKI-297)', () => {
  let attempts = 0;
  const deps = makeDeps({
    sleepMs: () => {},
    researchAndPropose: ({ model }) => {
      if (model === 'codex-current') { attempts += 1; throw new Error('worktree session not found'); }
      return { proposalPath: `p-${model}.md` };
    },
  });
  assert.throws(
    () => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps }),
    /MANDATORY research\/propose failed/,
  );
  assert.strictEqual(attempts, 1, 'STRUCTURAL failure is not retried');
});
check('a TRANSIENT mandatory propose failure that recovers within retries completes the run (SKI-297)', () => {
  let attempts = 0;
  const deps = makeDeps({
    sleepMs: () => {},
    researchAndPropose: ({ model }) => {
      if (model === 'codex-current') {
        attempts += 1;
        if (attempts === 1) throw new Error('connection timeout'); // transient, recovers on retry
      }
      return { proposalPath: `p-${model}.md` };
    },
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps });
  assert.strictEqual(r.applied, true, 'a transient propose failure that recovers does not abort the run');
  assert.strictEqual(attempts, 2, 'one transient failure + one successful retry');
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

console.log('6. SKI-297 — per-cell transient retry in cross-review / revise (no quorum-collapse on a single transient blip)');
check('a TRANSIENT cross-review failure on a mandatory cell retries and the run completes (codex stays alive)', () => {
  const calls = {};
  const deps = makeDeps({
    sleepMs: () => {},
    crossReview: ({ reviewerModel }) => {
      calls[reviewerModel] = (calls[reviewerModel] || 0) + 1;
      // codex-current's FIRST cross-review call dies transiently, then recovers.
      if (reviewerModel === 'codex-current' && calls[reviewerModel] === 1) return { ok: false, error: 'connection timeout' };
      return { ok: true, structured: { items: [] } };
    },
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps });
  assert.strictEqual(r.applied, true, 'a transient cross-review blip that recovers does not collapse quorum');
  assert.ok(calls['codex-current'] >= 2, 'codex cross-review was retried (≥2 calls)');
});
check('a PERSISTENT transient cross-review failure on a mandatory cell aborts ONLY after retries exhausted (quorum-collapse)', () => {
  const calls = {};
  const deps = makeDeps({
    sleepMs: () => {},
    crossReview: ({ reviewerModel }) => {
      calls[reviewerModel] = (calls[reviewerModel] || 0) + 1;
      if (reviewerModel === 'codex-current') return { ok: false, error: 'econnreset' }; // always transient-fail
      return { ok: true, structured: { items: [] } };
    },
  });
  assert.throws(
    () => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps }),
    /quorum lost mid-convergence/,
  );
  assert.strictEqual(calls['codex-current'], 3, 'codex cross-review attempted 1 + 2 retries before being declared dead');
});
check('a TRANSIENT revise failure on a mandatory cell retries and the run completes', () => {
  const calls = {};
  const deps = makeDeps({
    sleepMs: () => {},
    reviseProposal: ({ reviserModel, ownProposalPath }) => {
      calls[reviserModel] = (calls[reviserModel] || 0) + 1;
      if (reviserModel === 'codex-current' && calls[reviserModel] === 1) return { ok: false, error: 'rate limit hit mid-revise' };
      return { ok: true, proposalPath: ownProposalPath, contentHash: `h:${ownProposalPath}`, changed: false };
    },
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps });
  assert.strictEqual(r.applied, true, 'a transient revise blip that recovers does not collapse quorum');
  assert.ok(calls['codex-current'] >= 2, 'codex revise was retried (≥2 calls)');
});

console.log(`\n${passed} passed`);
