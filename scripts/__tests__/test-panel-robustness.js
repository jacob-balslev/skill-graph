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
    prepareCandidateEval: ({ skillDir }) => ({ evalSkillDir: `${skillDir}/.candidate`, baselineEvalSkillDir: `${skillDir}/.baseline`, cleanup: () => {} }),
    applyMerge: ({ skillDir }) => ({ applied: `${skillDir}/SKILL.md` }),
    evalArtifactExists: () => true,
    runEvalDirection: ({ direction, executionProfile }) => ({
      direction,
      verdict: 'PASS',
      certification_tier: 'certifying',
      execution_profile: executionProfile,
      certifying_clean: true,
    }),
  };
  return { ...base, ...overrides };
}

console.log('1. F1 — rate-limit recovery (mandatory propose)');
check('a rate-limit dispatch error raises a RECOVERABLE RateLimitError with a checkpoint (not a fatal abort)', () => {
  const deps = makeDeps({
    researchAndPropose: ({ model }) => {
      if (model === 'gpt-5.5') { const e = new Error('proposal not written'); e.dispatchOutput = 'HTTP 429 rate_limit_exceeded; retry after 30s'; throw e; }
      return { proposalPath: `p-${model}.md` };
    },
  });
  let err;
  try { panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps }); } catch (e) { err = e; }
  assert.ok(err instanceof RateLimitError, 'a rate limit raises RateLimitError, not a generic abort');
  assert.strictEqual(err.recoverable, true);
  assert.strictEqual(err.retryAfterMs, 30000);
  assert.deepStrictEqual(err.checkpoint.proposed, ['opus']);
  assert.deepStrictEqual(err.checkpoint.pending, ['gpt-5.5']);
});
check('a NON-rate-limit mandatory failure RETRIES (transient), then ABORTS after retries exhausted (SKI-297)', () => {
  // "codex crashed hard" carries no STRUCTURAL/UNAVAILABLE signal → classified TRANSIENT
  // (the deliberate default), so the cell is retried PER_CELL_MAX_RETRIES (2) times before
  // the run aborts. sleepMs is stubbed to a no-op so the test does not actually sleep.
  let attempts = 0;
  const deps = makeDeps({
    sleepMs: () => {},
    researchAndPropose: ({ model }) => {
      if (model === 'gpt-5.5') { attempts += 1; throw new Error('codex crashed hard'); }
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
      if (model === 'gpt-5.5') { attempts += 1; throw new Error('worktree session not found'); }
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
      if (model === 'gpt-5.5') {
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
check('degraded mode with gpt-5.5 only never checks the exhausted opus budget gate', () => {
  const checked = [];
  const deps = makeDeps({
    assertBudget: ({ model }) => {
      checked.push(model);
      if (model === 'opus') throw new BudgetExhaustedError('opus budget out', { model: 'opus' });
    },
  });
  const r = panel.runSkillAuditLoop({
    skill: 's',
    skillDir: '/x/s',
    cwd: '/x',
    mandatoryModels: ['gpt-5.5'],
    advisoryModels: [],
    degradedFrontier: { enabled: true, reason: 'single_frontier:opus_budget_exhausted', missingFrontiers: ['opus'] },
    deps,
  });
  assert.deepStrictEqual(checked, ['gpt-5.5']);
  assert.strictEqual(r.applied, true);
  assert.strictEqual(r.eval.synthesized_verdict, 'PROVISIONAL');
  assert.strictEqual(r.degraded_frontier.regrade_required, true);
});

console.log('3. F2 — explicit eval-absent recording');
check('missing eval artifact => eval_status ABSENT + eval_certified false, still keep+apply', () => {
  const deps = makeDeps({ evalArtifactExists: () => false });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/s', cwd: '/x', advisoryModels: [], deps });
  assert.strictEqual(r.eval, null);
  assert.strictEqual(r.eval_status, 'ABSENT');
  assert.strictEqual(r.eval_certified, false);
  assert.match(r.eval_skip_reason, /no evals\/comprehension\.json/);
  assert.strictEqual(r.keep_or_revert.action, 'keep');
  assert.strictEqual(r.applied, true);
});
check('eval ran + PASS + verify RAN => eval_status RUN + eval_certified true', () => {
  // B4 (2026-06-10): certification now REQUIRES the Phase 3.1 verify gate to have RUN — a
  // DEFERRED verify (no verifyMerge dep) can no longer certify. Inject a passing verifyMerge
  // (the legitimate certifying path; production always wires it).
  const r = panel.runSkillAuditLoop({
    skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [],
    deps: makeDeps({ verifyMerge: () => ({ ok: true, approved: true, gaps: [], parse_ok: true }) }),
  });
  assert.strictEqual(r.eval_status, 'RUN');
  assert.strictEqual(r.verify.status, 'RUN');
  assert.deepStrictEqual(r.certifying_blocked, []);
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
    curate: () => ({ mergedSkillPath: 'merged-SKILL.md', mergeLedgerPath: 'm.json', mergeLedger: { curation_decision: 'already-optimal', contributions: [{ id: 1, surfaced_by: 'opus', disposition: 'kept' }, { id: 2, surfaced_by: 'gpt-5.5', disposition: 'kept' }] } }),
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
      // gpt-5.5's FIRST cross-review call dies transiently, then recovers.
      if (reviewerModel === 'gpt-5.5' && calls[reviewerModel] === 1) return { ok: false, error: 'connection timeout' };
      return { ok: true, structured: { items: [] } };
    },
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps });
  assert.strictEqual(r.applied, true, 'a transient cross-review blip that recovers does not collapse quorum');
  assert.ok(calls['gpt-5.5'] >= 2, 'codex cross-review was retried (≥2 calls)');
});
check('a PERSISTENT transient cross-review failure on a mandatory cell aborts ONLY after retries exhausted (quorum-collapse)', () => {
  const calls = {};
  const deps = makeDeps({
    sleepMs: () => {},
    crossReview: ({ reviewerModel }) => {
      calls[reviewerModel] = (calls[reviewerModel] || 0) + 1;
      if (reviewerModel === 'gpt-5.5') return { ok: false, error: 'econnreset' }; // always transient-fail
      return { ok: true, structured: { items: [] } };
    },
  });
  assert.throws(
    () => panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps }),
    /quorum lost mid-convergence/,
  );
  assert.strictEqual(calls['gpt-5.5'], 3, 'codex cross-review attempted 1 + 2 retries before being declared dead');
});
check('a TRANSIENT revise failure on a mandatory cell retries and the run completes', () => {
  const calls = {};
  const deps = makeDeps({
    sleepMs: () => {},
    reviseProposal: ({ reviserModel, ownProposalPath }) => {
      calls[reviserModel] = (calls[reviserModel] || 0) + 1;
      // genuinely transient blip ('timeout') — rate-limit/session-limit texts are BUDGET
      // class since 2026-06-10T and raise RateLimitError instead (next test).
      if (reviserModel === 'gpt-5.5' && calls[reviserModel] === 1) return { ok: false, error: 'timeout hit mid-revise' };
      return { ok: true, proposalPath: ownProposalPath, contentHash: `h:${ownProposalPath}`, changed: false };
    },
  });
  const r = panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps });
  assert.strictEqual(r.applied, true, 'a transient revise blip that recovers does not collapse quorum');
  assert.ok(calls['gpt-5.5'] >= 2, 'codex revise was retried (≥2 calls)');
});
check('a BUDGET (rate-limit / session-window) failure on a mandatory cell mid-convergence raises recoverable RateLimitError, never inline-retries or collapses quorum', () => {
  const calls = {};
  const deps = makeDeps({
    sleepMs: () => {},
    reviseProposal: ({ reviserModel, ownProposalPath }) => {
      calls[reviserModel] = (calls[reviserModel] || 0) + 1;
      // the live 2026-06-10T incident text shape
      if (reviserModel === 'gpt-5.5') return { ok: false, error: "You've hit your session limit · resets 4:40am" };
      return { ok: true, proposalPath: ownProposalPath, contentHash: `h:${ownProposalPath}`, changed: false };
    },
  });
  let err = null;
  try { panel.runSkillAuditLoop({ skill: 's', skillDir: '/x/skills/s', cwd: '/x/skill-graph', advisoryModels: [], deps }); }
  catch (e) { err = e; }
  assert.ok(err instanceof RateLimitError, 'session-window exhaustion raises RateLimitError (checkpoint + resume)');
  assert.strictEqual(err.recoverable, true);
  assert.strictEqual(calls['gpt-5.5'], 1, 'no inline retry on a BUDGET failure — retrying burns the budget harder');
});

console.log('7. SKI-349 — terminal-marker safety net (every abort path emits a marker + terminal heartbeat)');
{
  const { EventEmitter } = require('events');
  // A fake process: an EventEmitter with a spied exit(); and a fake reporter that records teardown().
  const makeProc = () => { const p = new EventEmitter(); p.exit = (c) => { p._exitCode = c; }; return p; };
  const makeReporter = () => { const r = { teardownCount: 0 }; r.teardown = () => { r.teardownCount += 1; }; return r; };
  const makeStderr = () => { const s = { lines: [] }; s.write = (x) => { s.lines.push(x); return true; }; return s; };

  check('a process that exits WITHOUT a marker (killed/crashed/early-exit) emits a FAILED marker + teardown', () => {
    const proc = makeProc(); const reporter = makeReporter(); const stderr = makeStderr();
    panel.createExitSafetyNet({ skill: 'demo', reporter, proc, stderr });
    proc.emit('exit', 137); // e.g. SIGKILL-derived code / OOM
    assert.strictEqual(reporter.teardownCount, 1, 'heartbeat flushed to terminal (complete) state');
    assert.ok(stderr.lines.some(l => /SKILL-AUDIT-LOOP: FAILED skill=demo exit=137/.test(l)), 'FAILED marker written on exit');
  });

  check('markEmitted() (a real COMPLETE/FAILED was written) makes the exit net a no-op — no double marker', () => {
    const proc = makeProc(); const reporter = makeReporter(); const stderr = makeStderr();
    const net = panel.createExitSafetyNet({ skill: 'demo', reporter, proc, stderr });
    net.markEmitted();
    proc.emit('exit', 0);
    assert.strictEqual(reporter.teardownCount, 0, 'no teardown — the run already wrote its own marker');
    assert.strictEqual(stderr.lines.length, 0, 'no second marker');
  });

  check('SIGTERM (batch watchdog kill) emits a FAILED marker, flushes the heartbeat, and exits 143', () => {
    const proc = makeProc(); const reporter = makeReporter(); const stderr = makeStderr();
    panel.createExitSafetyNet({ skill: 'demo', reporter, proc, stderr });
    proc.emit('SIGTERM');
    assert.ok(stderr.lines.some(l => /SKILL-AUDIT-LOOP: FAILED skill=demo exit=143 reason=signal SIGTERM/.test(l)), 'SIGTERM → FAILED marker');
    assert.strictEqual(reporter.teardownCount, 1, 'heartbeat flushed on SIGTERM');
    assert.strictEqual(proc._exitCode, 143, 'exits 143 after marking');
  });

  check('the net emits only ONCE even across multiple terminal signals (idempotent)', () => {
    const proc = makeProc(); const reporter = makeReporter(); const stderr = makeStderr();
    panel.createExitSafetyNet({ skill: 'demo', reporter, proc, stderr });
    proc.emit('SIGTERM');
    proc.emit('exit', 143);
    const markers = stderr.lines.filter(l => /SKILL-AUDIT-LOOP:/.test(l));
    assert.strictEqual(markers.length, 1, 'exactly one terminal marker across SIGTERM + exit');
    assert.strictEqual(reporter.teardownCount, 1, 'teardown ran once');
  });

  check('an uncaughtException emits a FAILED marker with the reason and exits 1', () => {
    const proc = makeProc(); const reporter = makeReporter(); const stderr = makeStderr();
    panel.createExitSafetyNet({ skill: 'demo', reporter, proc, stderr });
    proc.emit('uncaughtException', new Error('boom in cross-review'));
    assert.ok(stderr.lines.some(l => /SKILL-AUDIT-LOOP: FAILED skill=demo exit=1 reason=uncaughtException: boom in cross-review/.test(l)), 'uncaught → FAILED marker');
    assert.strictEqual(proc._exitCode, 1);
  });
}

console.log(`\n${passed} passed`);
