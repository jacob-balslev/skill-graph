'use strict';

// ─── Multi-agent Skill Audit Loop runner (multi-model panel) ──────────────────
//
// Generalizes the 2-frontier `run-skill-audit-loop-lite.js` into the N-agent panel
// the user specified (2026-06-05):
//
//   Phase 1  Independent research + proposal (PARALLEL by design; this orchestrator
//            currently DISPATCHES SEQUENTIALLY — each model is a blocking execFileSync,
//            so with 2 mandatory + N advisory the phase runs one model at a time and the
//            heartbeat ticks at phase boundaries, not mid-dispatch. True in-process
//            parallel fan-out is the tracked follow-up in § Status; making it async breaks
//            the synchronous assert.throws unit contract):
//            • Opus 4.8 + GPT-5.5 (MANDATORY) — each its OWN research + proposal.
//            • every free agent (ADVISORY) — each its OWN research + proposal.
//            Width comes from many independent searches.
//   Phase 2  Cross-review, ITERATE UNTIL CONVERGENCE: every agent reviews every
//            other agent's proposal and gives keep/wrong/missing feedback; agents
//            revise in light of the feedback; repeat until proposals stabilize
//            (no alive agent changed) or the round budget is hit.
//   Phase 3  Synthesis: a FRONTIER curator (rotated) union-merges the two MANDATORY
//            proposals under STRICT anti-loss and explicitly dispositions every
//            advisory proposal / suggestion / cross-review finding — a frontier model
//            makes every keep/drop call (advisory never auto-merges;
//            no-lesser-models-for-quality).
//   Phase 4  Eval GUARDRAIL: representative generator answered, Opus + GPT judge
//            the curated skill, then keep-or-revert. Advisory NEVER sets the verdict.
//   Phase 5  Apply-on-keep; the caller commits per skill.
//
// Asymmetry (user's constraint): a MANDATORY frontier failure ABORTS — but only after a
// bounded per-cell TRANSIENT retry (SKI-297; up to PER_CELL_MAX_RETRIES with backoff before
// the cell is declared dead, so one transient model death does not collapse the quorum and
// discard the whole run); an ADVISORY failure is recorded and skipped, never blocks (and is
// never retried). The advisory tier widens the search; the certifying floor is always the
// two frontier judges.
//
// Like run-skill-audit-loop-lite.js this is PURE orchestration with every live
// operation injected via `deps`, so the whole path runs offline under a stub (CI) and
// the curation step stays an editorial frontier-model act, not a deterministic script.
//
// Design spec: docs/plans (multi-agent-skill-audit-loop). Reuses validateAntiLoss /
// decideKeepOrRevert / qualityRank from run-skill-audit-loop-lite and runBidirectionalEval.
// READ FIRST: docs/skill-audit-loop-philosophy.md (curate-not-strip; eval is a guardrail).
//
// Private-content boundary (HARD): research scope is the PUBLIC skill-graph repo +
// skills tree + the open web — never Sales Hub / Printify / Shopify / customer / bank /
// personal data. The live deps enforce the fence; this orchestrator never touches fs.

const path = require('path');
const { FRONTIER_PAIR, ADVISORY_MODELS, REGISTRY_VERSION, assertPanelRoster } = require('../audit-shared/model-provider');
const { runBidirectionalEval, runSingleFrontierEval } = require('./run-bidirectional-eval');
const { validateAntiLoss, decideKeepOrRevert, validateCurationChanged } = require('./run-skill-audit-loop-lite');
const { parseRateLimit, RateLimitError, classifyInfraError, INFRA_ERROR_CLASS } = require('./panel-budget');
const { buildModelRunCoverage } = require('./model-run-coverage');

// Convergence policy. maxRounds is the HARD cost/termination ceiling; minRounds floors
// at one full cross-review→revise pass; stabilityThreshold=1.0 means "converged when no
// alive agent changed its proposal this round" (a fixed point); quorum is the minimum
// alive MANDATORY proposals required to continue (below it = abort).
const DEFAULT_CONVERGENCE = {
  maxRounds: 3,
  minRounds: 1,
  stabilityThreshold: 1.0,
  quorum: 2,
};

// ── Per-cell transient retry (SKI-297) ────────────────────────────────────────
// A single MANDATORY frontier cell hitting a TRANSIENT infra failure (codex apply_patch
// fuzzy-match, timeout, econnreset, or an unknown blip) must NOT collapse the 2-frontier
// quorum and discard the whole run (~90 min of work). We retry the cell up to
// PER_CELL_MAX_RETRIES with linear backoff before declaring it dead; STRUCTURAL /
// UNAVAILABLE failures are NOT retried (a retry cannot fix them). Advisory cells are
// best-effort and never retried (their death never aborts), so the retry is gated on the
// mandatory tier at the call sites (advisory passes maxRetries:0 — single-attempt, the
// exact prior behavior).
const PER_CELL_MAX_RETRIES = 2;
const PER_CELL_BACKOFF_MS = (attempt) => 1000 * attempt; // 1s, then 2s

class NonConvergenceError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'NonConvergenceError';
    this.code = 'NON_CONVERGENCE';
    Object.assign(this, details);
  }
}

// Synchronous backoff sleep. runConvergence/runSkillAuditLoop are sync, so backoff is a
// blocking sleep via spawnSync (the established repo idiom). Injectable via deps.sleepMs so
// unit tests stay fast (pass a no-op).
function defaultSleepMs(ms) {
  if (ms > 0) {
    // Portable synchronous sleep — Atomics.wait blocks the thread for `ms` with no
    // subprocess, so the bounded-retry backoff actually delays on EVERY platform. The
    // prior `spawnSync('sleep', …)` was a silent no-op where no `sleep` binary exists
    // (non-Unix), degrading "backoff" to an immediate retry that hammers a failing CLI.
    try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.max(0, Math.ceil(ms))); } catch (_) { /* best-effort */ }
  }
}

/**
 * Run one panel cell (cross-review / revise) with bounded retry on TRANSIENT infra
 * failures. `runOnce` MUST NOT throw — it returns a normalized
 * { ok:boolean, value?, errorText? }. Returns the last outcome plus { attempts, retried }.
 *
 * @param {object}   args
 * @param {string}   args.label        human label for logs (e.g. "opus crossReview").
 * @param {function} args.runOnce      () => { ok, value?, errorText? }
 * @param {number}   [args.maxRetries] 0 disables retry (advisory cells pass 0).
 * @param {function} [args.sleepMs]    backoff sleep (injected; default real blocking sleep).
 * @param {function} [args.log]
 * @returns {{ ok:boolean, value?:any, errorText?:string, attempts:number, retried:number, lastClass?:string }}
 */
function withPerCellRetry({ label, runOnce, maxRetries = PER_CELL_MAX_RETRIES, sleepMs = defaultSleepMs, log = () => {} }) {
  let attempt = 0;
  for (;;) {
    const outcome = runOnce();
    if (outcome && outcome.ok) return { ...outcome, attempts: attempt + 1, retried: attempt };
    const cls = classifyInfraError((outcome && outcome.errorText) || 'unknown');
    if (cls !== INFRA_ERROR_CLASS.TRANSIENT || attempt >= maxRetries) {
      return { ...outcome, attempts: attempt + 1, retried: attempt, lastClass: cls };
    }
    attempt += 1;
    log(`    ↻ ${label} transient failure (${String((outcome && outcome.errorText) || '').slice(0, 80)}) — retry ${attempt}/${maxRetries} after backoff`);
    sleepMs(PER_CELL_BACKOFF_MS(attempt));
  }
}

/**
 * Strict-on-mandatory coverage check (complements validateAntiLoss). Every mandatory
 * model that produced a final-round proposal MUST appear as `surfaced_by` on at least
 * one ledger contribution (kept OR dropped-with-reason). A mandatory model wholly
 * absent from the ledger means the curator silently ignored a frontier proposal — the
 * exact silent-loss this guards against. validateAntiLoss governs disposition reasons;
 * this governs presence.
 *
 * @param {object}   ledger             merge-ledger (v2/v3) with contributions[].
 * @param {object[]} mandatoryProposals final-round mandatory PanelProposal records.
 * @param {string[]} mandatoryModels    the configured mandatory model aliases.
 * @returns {{ ok: boolean, violations: Array<{model:string, reason:string}>, covered: string[] }}
 */
function collectLedgerModels(ledger) {
  const contributions = (ledger && Array.isArray(ledger.contributions)) ? ledger.contributions : [];
  const surfaced = new Set();
  for (const c of contributions) {
    if (c && c.surfaced_by) surfaced.add(c.surfaced_by);
    if (c && Array.isArray(c.corroborated_by)) for (const m of c.corroborated_by) surfaced.add(m);
    if (c && Array.isArray(c.accepted_by)) for (const m of c.accepted_by) surfaced.add(m);
  }
  return surfaced;
}

function validateProposalCoverage(ledger, proposals, requiredModels, label = 'model') {
  const surfaced = collectLedgerModels(ledger);
  const produced = new Set(
    (proposals || []).filter((p) => p && p.alive !== false).map((p) => p.model),
  );
  const violations = [];
  const covered = [];
  for (const m of requiredModels) {
    if (!produced.has(m)) continue; // no final proposal from this model — coverage N/A
    if (surfaced.has(m)) covered.push(m);
    else {
      violations.push({
        model: m,
        reason: `${label} ${m} produced a proposal but appears on NO ledger contribution (kept or dropped-with-reason) — the proposal was silently lost`,
      });
    }
  }
  return { ok: violations.length === 0, violations, covered };
}

function validateMandatoryCoverage(ledger, mandatoryProposals, mandatoryModels) {
  return validateProposalCoverage(ledger, mandatoryProposals, mandatoryModels, 'mandatory model');
}

function validateAdvisoryCoverage(ledger, advisoryProposals) {
  const required = (advisoryProposals || []).filter((p) => p && p.alive !== false).map((p) => p.model);
  return validateProposalCoverage(ledger, advisoryProposals, required, 'advisory model');
}

/**
 * Phase 2 — cross-review, iterate to convergence.
 *
 * Mutates the `proposals` records in place (proposalPath / contentHash / round / alive).
 * Convergence is HASH-AUTHORITATIVE: a revision "changed" iff its content hash differs
 * from the previous round's, regardless of the agent's self-reported `changed` flag.
 *
 * @returns {{ rounds:number, converged:boolean, reason:'stable'|'round-budget'|'quorum-collapsed',
 *             history:Array, lastRoundFeedback:Array, policy:object }}
 */
function runConvergence({ skill, skillDir, proposals, deps, policy, log = () => {}, onProgress = () => {} }) {
  const history = [];
  let lastRoundFeedback = [];

  for (let round = 1; round <= policy.maxRounds; round += 1) {
    const alive = proposals.filter((p) => p.alive);
    const aliveMandatory = alive.filter((p) => p.tier === 'mandatory');

    // Dead-agent / quorum guard — a mandatory model dying below quorum aborts the run.
    if (aliveMandatory.length < policy.quorum) {
      return { rounds: round - 1, converged: false, reason: 'quorum-collapsed', history, lastRoundFeedback, policy };
    }

    log(`phase 2 · cross-review round ${round}/${policy.maxRounds} — ${alive.length} alive agents (${alive.map((p) => p.model).join(', ')})`);
    onProgress({ kind: 'phase', phase: `cross-review r${round}/${policy.maxRounds}` });

    // ── cross-review: every alive agent reviews every OTHER alive proposal ──
    const feedback = [];
    for (const reviewer of alive) {
      const others = alive
        .filter((p) => p.model !== reviewer.model)
        .map((p) => ({ model: p.model, proposalPath: p.proposalPath, noveltyMemoPath: p.noveltyMemoPath, tier: p.tier }));
      log(`  ↳ ${reviewer.model} (${reviewer.tier}) reviewing ${others.length} other proposal(s)…`);
      onProgress({ kind: 'agent', model: reviewer.model, tier: reviewer.tier, phase: 'review', state: 'start' });
      // Bounded TRANSIENT retry on the MANDATORY tier (SKI-297): a transient cross-review
      // failure on a frontier cell would otherwise kill the cell and collapse quorum next
      // round, discarding the whole run. Advisory passes maxRetries:0 (single attempt).
      const reviewOutcome = withPerCellRetry({
        label: `${reviewer.model} crossReview`,
        maxRetries: reviewer.tier === 'mandatory' ? PER_CELL_MAX_RETRIES : 0,
        sleepMs: deps.sleepMs,
        log,
        runOnce: () => {
          try {
            const r = deps.crossReview({
              skill, skillDir, reviewerModel: reviewer.model, reviewerTier: reviewer.tier,
              ownProposalPath: reviewer.proposalPath, otherProposals: others, round,
              artifactsDir: reviewer.artifactsDir,
            });
            if (!r || r.ok === false) return { ok: false, errorText: (r && r.error) || 'crossReview failed' };
            return { ok: true, value: r };
          } catch (e) { return { ok: false, errorText: e.message }; }
        },
      });
      if (!reviewOutcome.ok) {
        reviewer.error = reviewOutcome.errorText || 'crossReview failed';
        // BUDGET-class failure on a MANDATORY cell is recoverable-after-reset, never a dead
        // cell: raising RateLimitError lets the caller checkpoint + resume instead of
        // collapsing quorum (live incident 2026-06-10T: a session-window reset killed a whole
        // convergence round at once).
        if (reviewer.tier === 'mandatory' && reviewOutcome.lastClass === INFRA_ERROR_CLASS.BUDGET) {
          const rl = parseRateLimit(reviewer.error);
          throw new RateLimitError(
            `skill-audit-loop: budget/session-window exhaustion on mandatory ${reviewer.model} during cross-review r${round} — checkpoint and resume after the window`,
            { model: reviewer.model, retryAfterMs: rl.retryAfterMs },
          );
        }
        if (reviewer.tier === 'mandatory') reviewer.alive = false;
        else {
          reviewer.reviewFailed = true;
          reviewer.advisoryFailure = { model: reviewer.model, phase: 'review', error: reviewer.error, failure_reason: 'error' };
        }
        onProgress({ kind: 'agent', model: reviewer.model, tier: reviewer.tier, phase: 'review', state: reviewer.tier === 'mandatory' ? 'fail' : 'skip', failure_reason: 'error', failure_detail: reviewer.error });
        continue;
      }
      const res = reviewOutcome.value;
      onProgress({ kind: 'agent', model: reviewer.model, tier: reviewer.tier, phase: 'review', state: 'done' });
      // B5: a reviewer whose stdout had no parseable JSON block returns parse_ok:false with
      // empty feedback. Surface it — a malformed-and-dropped review must NOT be silently
      // indistinguishable from an honest "reviewed, found nothing" zero-findings review.
      if (res && res.parse_ok === false) {
        log(`  ↳ ⚠️ ${reviewer.model} (${reviewer.tier}) cross-review output was UNPARSEABLE (no JSON block) — its feedback was dropped for round ${round}; this is NOT a clean zero-findings review.`);
      }
      // Normalize whatever the dep returned into CrossReviewFeedback[] (each tagged
      // with reviewerModel + targetModel). A dep may return { feedback: [...] } already
      // split by target, or { structured: { items:[{targetModel,...}] } } for one target,
      // or a flat structured object. Be liberal.
      if (Array.isArray(res.feedback)) {
        feedback.push(...res.feedback);
      } else if (res.structured && Array.isArray(res.structured)) {
        feedback.push(...res.structured);
      } else if (res.structured) {
        feedback.push(res.structured);
      }
    }
    history.push({ round, phase: 'cross-review', reviewers: alive.length, feedbackRecords: feedback.length });
    lastRoundFeedback = feedback;

    // ── revise: each alive agent revises in light of feedback addressed to it ──
    let changedCount = 0;
    let mandatoryChangedCount = 0;
    for (const agent of proposals.filter((p) => p.alive)) {
      const mine = feedback.filter((f) => f && f.targetModel === agent.model);
      log(`  ↳ ${agent.model} (${agent.tier}) revising with ${mine.length} feedback item(s)…`);
      onProgress({ kind: 'agent', model: agent.model, tier: agent.tier, phase: 'revise', state: 'start' });
      // Bounded TRANSIENT retry on the MANDATORY tier (SKI-297): same quorum-collapse
      // protection as cross-review. Advisory passes maxRetries:0 (single attempt).
      const reviseOutcome = withPerCellRetry({
        label: `${agent.model} reviseProposal`,
        maxRetries: agent.tier === 'mandatory' ? PER_CELL_MAX_RETRIES : 0,
        sleepMs: deps.sleepMs,
        log,
        runOnce: () => {
          try {
            const r = deps.reviseProposal({
              skill, skillDir, reviserModel: agent.model, reviserTier: agent.tier,
              ownProposalPath: agent.proposalPath, feedbackForMe: mine, round,
              artifactsDir: agent.artifactsDir,
            });
            if (!r || r.ok === false) return { ok: false, errorText: (r && r.error) || 'reviseProposal failed' };
            return { ok: true, value: r };
          } catch (e) { return { ok: false, errorText: e.message }; }
        },
      });
      if (!reviseOutcome.ok) {
        agent.error = reviseOutcome.errorText || 'reviseProposal failed';
        // Same recoverable BUDGET handling as cross-review (see comment there).
        if (agent.tier === 'mandatory' && reviseOutcome.lastClass === INFRA_ERROR_CLASS.BUDGET) {
          const rl = parseRateLimit(agent.error);
          throw new RateLimitError(
            `skill-audit-loop: budget/session-window exhaustion on mandatory ${agent.model} during revise r${round} — checkpoint and resume after the window`,
            { model: agent.model, retryAfterMs: rl.retryAfterMs },
          );
        }
        if (agent.tier === 'mandatory') agent.alive = false;
        else {
          agent.reviseFailed = true;
          agent.advisoryFailure = { model: agent.model, phase: 'revise', error: agent.error, failure_reason: 'error' };
        }
        onProgress({ kind: 'agent', model: agent.model, tier: agent.tier, phase: 'revise', state: agent.tier === 'mandatory' ? 'fail' : 'skip', failure_reason: 'error', failure_detail: agent.error });
        continue;
      }
      const res = reviseOutcome.value;
      onProgress({ kind: 'agent', model: agent.model, tier: agent.tier, phase: 'revise', state: 'done' });
      const newHash = res.contentHash
        || (typeof deps.hashProposal === 'function' ? deps.hashProposal(res.proposalPath || agent.proposalPath) : agent.contentHash);
      // HASH-AUTHORITATIVE: a content change is a change regardless of the agent's
      // self-report (an agent may claim changed:false while emitting a different file).
      const didChange = newHash !== agent.contentHash;
      if (didChange) {
        changedCount += 1;
        if (agent.tier === 'mandatory') mandatoryChangedCount += 1;
      }
      agent.proposalPath = res.proposalPath || agent.proposalPath;
      agent.noveltyMemoPath = res.noveltyMemoPath || agent.noveltyMemoPath;
      agent.contentHash = newHash;
      agent.round = round;
    }

    const aliveNow = proposals.filter((p) => p.alive);
    const aliveMandatoryNow = aliveNow.filter((p) => p.tier === 'mandatory');
    // Convergence is judged on the MANDATORY tier ONLY (SKI-211). The curator certifies
    // from the mandatory proposals; the advisory tier is breadth/novelty and never sets a
    // verdict. Advisory delivery is stdout text-capture, which re-emits a non-byte-identical
    // document every round, so an advisory agent's hash always "changes" — including advisory
    // in the stability fraction would make it never reach 1.0 and always burn maxRounds. We
    // still log the total changed count for visibility; convergence keys off mandatory only.
    const stableFraction = aliveMandatoryNow.length
      ? (aliveMandatoryNow.length - mandatoryChangedCount) / aliveMandatoryNow.length
      : 1;
    history.push({ round, phase: 'revise', aliveCount: aliveNow.length, changedCount, mandatoryChangedCount, stableFraction });
    log(`  round ${round} done: ${changedCount}/${aliveNow.length} changed (${mandatoryChangedCount}/${aliveMandatoryNow.length} mandatory), stability=${stableFraction.toFixed(2)} (need ≥${policy.stabilityThreshold})`);

    // Convergence test — only after the minRounds floor.
    if (round >= policy.minRounds && stableFraction >= policy.stabilityThreshold) {
      return { rounds: round, converged: true, reason: 'stable', history, lastRoundFeedback, policy };
    }
  }

  // B5: the abort-vs-keep asymmetry between 'quorum-collapsed' (aborts) and
  // 'round-budget' (curates from last stable) must rest on an explicit invariant,
  // not on the in-loop quorum guard's execution order. If the mandatory tier lost
  // quorum in the final round, return 'quorum-collapsed' regardless of how the loop
  // exited — never let a quorum-collapsed run fall through to curate-and-keep.
  const aliveMandatoryFinal = proposals.filter((p) => p.alive && p.tier === 'mandatory');
  if (aliveMandatoryFinal.length < policy.quorum) {
    return { rounds: policy.maxRounds, converged: false, reason: 'quorum-collapsed', history, lastRoundFeedback, policy };
  }
  return { rounds: policy.maxRounds, converged: false, reason: 'round-budget', history, lastRoundFeedback, policy };
}

function toProposalRef(p) {
  return {
    model: p.model,
    tier: p.tier,
    proposalPath: p.proposalPath,
    noveltyMemoPath: p.noveltyMemoPath,
    iterationSuggestionsPath: p.iterationSuggestionsPath || null,
  };
}

function normalizeDegradedFrontier({ degradedFrontier, mandatoryModels }) {
  const enabled = Boolean(degradedFrontier && degradedFrontier.enabled);
  if (!enabled) return { enabled: false, missingFrontiers: [], reason: null, regradeRequired: false };
  const missing = Array.isArray(degradedFrontier.missingFrontiers)
    ? degradedFrontier.missingFrontiers.slice()
    : FRONTIER_PAIR.filter((m) => !mandatoryModels.includes(m));
  const reason = degradedFrontier.reason || `single_frontier:${missing.join(',') || 'frontier_unavailable'}`;
  return { enabled: true, missingFrontiers: missing, reason, regradeRequired: true };
}

/**
 * Run one skill's multi-agent panel cycle. See module header for phases.
 *
 * @param {object}   opts
 * @param {string}   opts.skill
 * @param {string}   opts.skillDir            absolute, public-scoped.
 * @param {string}   opts.cwd                 skill-graph repo root (fence + eval cwd).
 * @param {string[]} [opts.mandatoryModels]   default FRONTIER_PAIR; must be length 2; failure ABORTS.
 * @param {string[]} [opts.advisoryModels]    default ADVISORY_MODELS; best-effort; failure never aborts.
 * @param {string}   [opts.priorVerdict]
 * @param {'application'|'comprehension'} [opts.evalMode]  default 'application'.
 * @param {object}   [opts.convergence]       policy override (see DEFAULT_CONVERGENCE).
 * @param {object}   opts.deps                injected live ops (see design spec § A.2).
 * @returns {object} combined skill-audit-loop + eval provenance record.
 */
function runSkillAuditLoop(opts = {}) {
  const {
    skill,
    skillDir,
    cwd,
    mandatoryModels = FRONTIER_PAIR,
    advisoryModels = ADVISORY_MODELS,
    priorVerdict,
    evalMode = 'application',
    convergence = {},
    degradedFrontier = null,
    deps = {},
    log = () => {},
    onProgress = () => {},
  } = opts;

  if (!skill || !skillDir || !cwd) {
    throw new Error('runSkillAuditLoop: skill, skillDir, and cwd are required.');
  }
  // Fail closed BEFORE any dispatch: no lesser model (Haiku, Gemini Flash) may be a
  // mandatory/advisory participant or the dispatch wrapper. no-lesser-models-for-quality.
  assertPanelRoster({ mandatory: mandatoryModels, advisory: advisoryModels, wrapper: opts.dispatchWrapperModel || null });
  const degraded = normalizeDegradedFrontier({ degradedFrontier, mandatoryModels });
  if (!Array.isArray(mandatoryModels) || mandatoryModels.length < 1) {
    throw new Error('runSkillAuditLoop: mandatoryModels must contain at least one frontier model.');
  }
  if (!degraded.enabled && mandatoryModels.length !== 2) {
    throw new Error('runSkillAuditLoop: mandatoryModels must be a 2-element array unless degradedFrontier.enabled is true.');
  }
  if (degraded.enabled && mandatoryModels.length !== 1) {
    throw new Error('runSkillAuditLoop: degradedFrontier.enabled requires exactly one available mandatory model.');
  }
  const required = ['buildResearchBrief', 'claimSlot', 'researchAndPropose', 'releaseSlot', 'curate', 'crossReview', 'reviseProposal', 'hashProposal'];
  if (Array.isArray(advisoryModels) && advisoryModels.length > 0) {
    required.push('researchAndProposeAdvisory', 'claimAdvisorySlot');
  }
  for (const fn of required) {
    if (typeof deps[fn] !== 'function') {
      throw new Error(`runSkillAuditLoop: deps.${fn} must be a function — the panel loop injects every phase's worker (phase 0 brief/claim · phase 1 propose · phase 2 crossReview/reviseProposal · phase 3 curate · hashProposal), and deps.${fn} is missing from the composition.`);
    }
  }
  const policy = { ...DEFAULT_CONVERGENCE, ...convergence, ...(degraded.enabled ? { quorum: 1 } : {}) };

  // Reasons the run must NOT certify (cap any verdict at PROVISIONAL, set regrade_required,
  // and force eval_certified:false) — even if the eval guardrail reaches APPLICABLE. Knowledge
  // is still curated + kept (the eval is a guardrail, not the objective); only CERTIFICATION is
  // blocked. degraded single-frontier seeds it here; non-convergence (Phase 2) and a non-RUN
  // verify gate (Phase 3.1) append below.
  const certifyingBlocked = [];
  if (degraded.enabled) certifyingBlocked.push(`degraded-single-frontier:${degraded.reason}`);

  log(`skill-audit-loop START · skill=${skill} · mandatory=[${mandatoryModels.join(', ')}] · advisory=[${(advisoryModels || []).join(', ') || 'none'}] · maxRounds=${policy.maxRounds}${degraded.enabled ? ` · DEGRADED single-frontier (${degraded.reason}; PROVISIONAL-capped)` : ''}`);
  onProgress({ kind: 'phase', phase: 'research brief' });
  const brief = deps.buildResearchBrief(skillDir, skill) || '';
  log(`phase 0 · research brief built (${brief.length} chars)`);
  const currentSkillPath = path.join(skillDir, 'SKILL.md');

  const proposals = [];

  // ── Phase 1a — MANDATORY proposals (failure ABORTS) ──
  onProgress({ kind: 'phase', phase: 'propose (mandatory)' });
  for (const model of mandatoryModels) {
    // Pre-dispatch budget gate (in-skill-graph; no workspace dependency). When injected,
    // it throws a recoverable BudgetExhaustedError BEFORE burning a multi-minute call so a
    // caller/loop can wait for the budget window and resume rather than fail late.
    if (typeof deps.assertBudget === 'function') deps.assertBudget({ model });
    log(`phase 1a · mandatory propose: ${model} — dispatching (this is a multi-minute live call; output buffers until it returns)…`);
    onProgress({ kind: 'agent', model, tier: 'mandatory', phase: 'propose', state: 'start' });
    const slot = deps.claimSlot({ skill, model });
    // B2: release the slot EXACTLY once, no matter how the loop exits. The success/
    // abort branches call releaseOnce() explicitly; the finally is the safety net for
    // any unanticipated throw (a throw inside the catch, an onProgress error, etc.) or
    // a mid-backoff interrupt, so a claimed slot can never be orphaned.
    let slotReleased = false;
    const releaseOnce = (status) => {
      if (slotReleased) return;
      slotReleased = true;
      deps.releaseSlot({ skill, model, status });
    };
    let proposeAttempt = 0;
    try {
    for (;;) {
      try {
        const p = deps.researchAndPropose({ skill, skillDir, model, brief, artifactsDir: slot && slot.artifactsDir });
        proposals.push({
          model, tier: 'mandatory', proposalPath: p.proposalPath, noveltyMemoPath: p.noveltyMemoPath || null,
          round: 0, contentHash: deps.hashProposal(p.proposalPath), alive: true, error: null,
          artifactsDir: slot && slot.artifactsDir,
        });
        log(`phase 1a · ✓ ${model} proposed → ${p.proposalPath}`);
        onProgress({ kind: 'agent', model, tier: 'mandatory', phase: 'propose', state: 'done' });
        releaseOnce('completed');
        break;
      } catch (err) {
        // RATE-LIMIT RECOVERY: a 429 / usage-limit / retry-after is RECOVERABLE — checkpoint
        // what proposed so far and raise a distinct retry-after-reset error instead of aborting
        // the whole run as a fatal crash. A caller/loop catches RateLimitError, waits for the
        // window, and resumes. (Already-recoverable BudgetExhaustedError from the gate above
        // propagates as-is.) NOT inline-retried — the caller waits for the reset window. The
        // dispatch text often lives in err.dispatchOutput/stderr, not just err.message.
        const dispatchText = `${err.message || ''}\n${err.dispatchOutput || ''}\n${err.stdout || ''}\n${err.stderr || ''}`;
        const rl = parseRateLimit(dispatchText);
        if (err.code === 'BUDGET_EXHAUSTED' || rl.isRateLimit) {
          releaseOnce('aborted');
          onProgress({ kind: 'agent', model, tier: 'mandatory', phase: 'propose', state: 'fail' });
          const reason = err.code === 'BUDGET_EXHAUSTED' ? 'budget exhausted' : 'rate limit';
          log(`phase 1a · ⏸ ${model} ${reason} — RECOVERABLE; checkpointing + raising retry-after-reset (run not aborted as a crash)`);
          if (err.code === 'BUDGET_EXHAUSTED') throw err; // already the recoverable type from the gate
          throw new RateLimitError(
            `skill-audit-loop: MANDATORY ${model} rate-limited for ${skill} — retry after the reset window and resume.`,
            {
              model,
              retryAfterMs: rl.retryAfterMs,
              checkpoint: { phase: 'propose-mandatory', proposed: proposals.map((p) => p.model), pending: mandatoryModels.filter((m) => !proposals.some((p) => p.model === m)) },
            },
          );
        }
        // Bounded TRANSIENT retry (SKI-297) before declaring the mandatory cell dead. The slot
        // stays claimed across retries; only a terminal abort releases it. STRUCTURAL /
        // UNAVAILABLE failures are not retried (a retry cannot fix them) and abort immediately.
        const cls = classifyInfraError(err);
        if (cls === INFRA_ERROR_CLASS.TRANSIENT && proposeAttempt < PER_CELL_MAX_RETRIES) {
          proposeAttempt += 1;
          log(`phase 1a · ↻ ${model} transient failure (${String(err.message || '').slice(0, 80)}) — retry ${proposeAttempt}/${PER_CELL_MAX_RETRIES} after backoff`);
          (deps.sleepMs || defaultSleepMs)(PER_CELL_BACKOFF_MS(proposeAttempt));
          continue;
        }
        releaseOnce('aborted');
        onProgress({ kind: 'agent', model, tier: 'mandatory', phase: 'propose', state: 'fail' });
        log(`phase 1a · ✗ ${model} FAILED${proposeAttempt ? ` after ${proposeAttempt} retr${proposeAttempt === 1 ? 'y' : 'ies'}` : ''}: ${err.message} — mandatory failure ABORTS`);
        throw new Error(`skill-audit-loop: MANDATORY research/propose failed for ${skill} on ${model}: ${err.message}`);
      }
    }
    } finally {
      // Safety net: if the loop exited without an explicit release (an unanticipated
      // throw in the catch, an interrupt mid-backoff), the slot is freed here.
      releaseOnce('aborted');
    }
  }

  // ── Phase 1b — ADVISORY proposals (best-effort; failure recorded, never aborts) ──
  const advisoryFailures = [];
  const advisoryRequested = (Array.isArray(advisoryModels) ? advisoryModels : []).slice();
  // F5: auth preflight — surface (loudly) any advisory model whose CLI is not ready, BEFORE
  // dispatch. NEVER drops a model (maximize free-advisory participation); a still-unauthed
  // model just fails best-effort below with a recorded failure_reason.
  let advisoryAuthWarnings = [];
  if (advisoryRequested.length && typeof deps.advisoryAuthPreflight === 'function') {
    try {
      const pf = deps.advisoryAuthPreflight(advisoryRequested) || {};
      advisoryAuthWarnings = pf.warnings || [];
      if (advisoryAuthWarnings.length) {
        log(`phase 1b · ⚠️ advisory auth preflight: ${advisoryAuthWarnings.length} model(s) not ready — ${advisoryAuthWarnings.map((w) => `${w.model} (${w.hint})`).join('; ')} (kept in the set; fix auth to recover)`);
      }
    } catch (e) { log(`phase 1b · advisory auth preflight skipped: ${e.message}`); }
  }
  if (advisoryRequested.length) { log(`phase 1b · advisory propose: ${advisoryRequested.length} model(s) (best-effort; failures recorded, never abort)`); onProgress({ kind: 'phase', phase: 'propose (advisory)' }); }
  for (const model of advisoryRequested) {
    try {
      if (typeof deps.assertBudget === 'function') deps.assertBudget({ model });
    } catch (e) {
      const failure_reason = e && e.code === 'BUDGET_EXHAUSTED' ? 'budget-exhausted' : 'error';
      const failure_detail = String((e && e.message) || 'advisory budget gate failed').slice(0, 80);
      advisoryFailures.push({ model, phase: 'budget', error: (e && e.message) || 'advisory budget gate failed', failure_reason });
      log(`phase 1b · ✗ ${model} skipped (${failure_reason}): ${(e && e.message) || 'advisory budget gate failed'}`);
      onProgress({ kind: 'agent', model, tier: 'advisory', phase: 'propose', state: 'skip', failure_reason, failure_detail });
      continue;
    }
    log(`phase 1b · advisory: ${model} — dispatching…`);
    onProgress({ kind: 'agent', model, tier: 'advisory', phase: 'propose', state: 'start' });
    let slot;
    try { slot = deps.claimAdvisorySlot({ skill, model }); } catch (e) { slot = { ok: false, error: e.message }; }
    if (slot && slot.ok === false) { advisoryFailures.push({ model, phase: 'claim', error: slot.error, failure_reason: 'error' }); log(`phase 1b · ✗ ${model} claim failed: ${slot.error}`); onProgress({ kind: 'agent', model, tier: 'advisory', phase: 'propose', state: 'skip', failure_reason: 'error', failure_detail: String(slot.error || '').slice(0, 80) }); continue; }
    let p;
    try { p = deps.researchAndProposeAdvisory({ skill, skillDir, model, brief, artifactsDir: slot && slot.artifactsDir }); }
    catch (e) { p = { ok: false, error: e.message, failure_reason: 'error' }; }
    if (!p || p.ok === false || !p.proposalPath) {
      // F4: carry the distinct failure_reason (timeout vs error vs no-document) so a buried
      // advisory failure is visible to the orchestrator + heartbeat, not collapsed to "skip".
      const failure_reason = (p && p.failure_reason) || 'error';
      const failure_detail = String((p && p.error) || 'no proposal produced').slice(0, 80);
      advisoryFailures.push({ model, phase: 'propose', error: (p && p.error) || 'no proposal produced', failure_reason, diagnosticsPath: p && p.diagnosticsPath });
      log(`phase 1b · ✗ ${model} skipped (${failure_reason}): ${(p && p.error) || 'no proposal produced'}`);
      onProgress({ kind: 'agent', model, tier: 'advisory', phase: 'propose', state: 'skip', failure_reason, failure_detail });
      try { deps.releaseSlot({ skill, model, status: 'aborted' }); } catch (_) { /* best-effort */ }
      continue;
    }
    proposals.push({
      model, tier: 'advisory', proposalPath: p.proposalPath, noveltyMemoPath: p.noveltyMemoPath || null,
      iterationSuggestionsPath: p.iterationSuggestionsPath || null,
      round: 0, contentHash: deps.hashProposal(p.proposalPath), alive: true, error: null,
      artifactsDir: slot && slot.artifactsDir,
    });
    log(`phase 1b · ✓ ${model} advised → ${p.proposalPath}${p.iterationSuggestionsPath ? `; suggestions → ${p.iterationSuggestionsPath}` : ''}`);
    onProgress({ kind: 'agent', model, tier: 'advisory', phase: 'propose', state: 'done' });
    try { deps.releaseSlot({ skill, model, status: 'completed' }); } catch (_) { /* best-effort */ }
  }

  // ── Phase 2 — cross-review, iterate to convergence ──
  const convergenceState = runConvergence({ skill, skillDir, proposals, deps, policy, log, onProgress });
  log(`phase 2 · convergence ${convergenceState.converged ? 'reached' : 'ended'} after ${convergenceState.rounds} round(s) — ${convergenceState.reason}`);
  if (convergenceState.reason === 'quorum-collapsed') {
    // Quorum collapse is NOT recoverable by curating-from-last-stable: a mandatory frontier
    // DIED, so the 2-frontier floor that makes a curate certifiable is gone. Still abort.
    throw new Error(`skill-audit-loop: mandatory quorum lost mid-convergence for ${skill} — a frontier model failed; aborting (the 2-frontier floor is required for a certifiable curate).`);
  }
  if (!convergenceState.converged) {
    // B2 (decided 2026-06-10): round-budget exhaustion no longer DISCARDS the run's work.
    // Both mandatory frontiers are still alive (quorum-collapse is handled above); their
    // last proposals are valid curation inputs. Curate-from-last-stable PRESERVES the
    // research (the eval is a guardrail, not the optimizer — never throw away curated
    // knowledge for a process reason) but marks the run NON-CERTIFYING: the verdict is
    // capped at PROVISIONAL with regrade_required, so a non-converged curate can never
    // stamp APPLICABLE. A later full run that converges supersedes it.
    log(`phase 2 · ⚠️ round-budget non-convergence after ${convergenceState.rounds} round(s) — curating from the last stable mandatory proposals; run marked NON-CERTIFYING (PROVISIONAL-capped, regrade required).`);
    certifyingBlocked.push(`non-converged:round-budget(${convergenceState.rounds})`);
  }

  const finalAlive = proposals.filter((p) => p.alive);
  const mandatoryFinal = finalAlive.filter((p) => p.tier === 'mandatory');
  const advisoryFinal = finalAlive.filter((p) => p.tier === 'advisory');
  const convergenceAdvisoryFailures = proposals
    .filter((p) => p.tier === 'advisory' && p.advisoryFailure)
    .map((p) => p.advisoryFailure);

  // ── Phase 3 — synthesis (frontier curator; strict anti-loss on mandatory) ──
  log(`phase 3 · curate (frontier curator) — union-merging ${mandatoryFinal.length} mandatory + ${advisoryFinal.length} advisory proposal(s) under strict anti-loss…`);
  onProgress({ kind: 'phase', phase: 'curate (synthesis)' });
  let merge = deps.curate({
    skill,
    skillDir,
    currentSkillPath,
    proposals: mandatoryFinal.map(toProposalRef),       // STRICT anti-loss applies to these
    advisoryProposals: advisoryFinal.map(toProposalRef), // discretionary; frontier decides
    crossReview: convergenceState.lastRoundFeedback || [],
  });
  log(`phase 3 · ✓ merged → ${merge && merge.mergedSkillPath}`);
  const antiLoss = validateAntiLoss(merge && merge.mergeLedger);
  if (!antiLoss.ok) {
    throw new Error(
      `skill-audit-loop: merge-ledger violates anti-loss for ${skill} — ${antiLoss.violations.length} bad drop(s): `
      + antiLoss.violations.map((v) => `[${v.id}] ${v.reason}`).join('; '),
    );
  }
  const coverage = validateMandatoryCoverage(merge && merge.mergeLedger, mandatoryFinal, mandatoryModels);
  if (!coverage.ok) {
    throw new Error(
      `skill-audit-loop: mandatory coverage gap for ${skill} — ${coverage.violations.map((v) => v.reason).join('; ')}`,
    );
  }
  const advisoryCoverage = validateAdvisoryCoverage(merge && merge.mergeLedger, advisoryFinal);
  if (!advisoryCoverage.ok) {
    throw new Error(
      `skill-audit-loop: advisory coverage gap for ${skill} — ${advisoryCoverage.violations.map((v) => v.reason).join('; ')}`,
    );
  }

  // No-op curation guard (F3): a byte-identical curated SKILL.md is only legitimate when the
  // ledger declares curation_decision:'already-optimal'. Otherwise the curator silently did
  // nothing — treat as a hard error rather than silently "passing" coverage with no change.
  const curationChange = validateCurationChanged({
    currentHash: deps.hashProposal(currentSkillPath),
    mergedHash: merge && merge.mergedSkillPath ? deps.hashProposal(merge.mergedSkillPath) : null,
    ledger: merge && merge.mergeLedger,
  });
  if (!curationChange.ok) {
    throw new Error(`skill-audit-loop: no-op curation for ${skill} — ${curationChange.reason}`);
  }
  log(`phase 3 · curation change check: ${curationChange.changed ? 'real change' : 'declared already-optimal no-op'}`);

  // Surface the curated merge-ledger contributions into the LIVE heartbeat so the findings-review
  // viewer (scripts/watch-panel.js --review-findings) shows them DURING the run with no
  // --findings-file. The reporter (panel-progress.js) carries them in status.findings[]; the viewer
  // normalizes each contribution (note→title, disposition→verdict, surfaced_by→source). Best-effort
  // and non-load-bearing — a reporter that ignores the event simply shows no inline findings.
  if (merge && merge.mergeLedger && Array.isArray(merge.mergeLedger.contributions)) {
    onProgress({ kind: 'findings', findings: merge.mergeLedger.contributions });
  }

  // ── Phase 3.1 — mandatory verification gate (frontier verify-then-decide, 2026-06-10T) ──
  // Each mandatory frontier independently verifies the merge (own-contribution coverage,
  // advisory-disposition honesty, evidence on load-bearing claims) BEFORE eval. Gaps trigger
  // ONE curator revision + re-verify (max 2 verify rounds); unverified content never proceeds.
  // Doctrine: SKILL_AUDIT_LOOP.md § Phase 3.1 + no-lesser-models-for-quality § "Width before
  // verdict". The dep is optional so curate-only/dry-run compositions and the pure unit
  // contract stay valid — absence is RECORDED as DEFERRED, never silently treated as RUN.
  const verify = { status: 'DEFERRED', rounds: 0, approvals: {}, gaps: [] };
  if (typeof deps.verifyMerge === 'function') {
    verify.status = 'RUN';
    let approvedAll = false;
    for (let vRound = 1; vRound <= 2 && !approvedAll; vRound += 1) {
      verify.rounds = vRound;
      const roundGaps = [];
      onProgress({ kind: 'phase', phase: `verify 3.1 r${vRound}` });
      for (const m of mandatoryModels) {
        const ownRecord = mandatoryFinal.find((p) => p.model === m);
        log(`phase 3.1 · ${m} verifying the merge (round ${vRound})…`);
        onProgress({ kind: 'agent', model: m, tier: 'mandatory', phase: 'verify', state: 'start' });
        const outcome = withPerCellRetry({
          label: `${m} verifyMerge`,
          sleepMs: deps.sleepMs,
          log,
          runOnce: () => {
            try {
              const r = deps.verifyMerge({
                skill,
                verifierModel: m,
                skillDir,
                mergedSkillPath: merge && merge.mergedSkillPath,
                mergeLedgerPath: merge && merge.mergeLedgerPath,
                ownProposalPath: ownRecord && ownRecord.proposalPath,
                round: vRound,
              });
              if (!r || r.ok === false) return { ok: false, errorText: (r && r.error) || 'verifyMerge failed' };
              return { ok: true, value: r };
            } catch (e) { return { ok: false, errorText: e.message }; }
          },
        });
        if (!outcome.ok) {
          if (outcome.lastClass === INFRA_ERROR_CLASS.BUDGET) {
            const rl = parseRateLimit(outcome.errorText || '');
            throw new RateLimitError(
              `skill-audit-loop: budget/session-window exhaustion on mandatory ${m} during verify 3.1 r${vRound} — checkpoint and resume after the window`,
              { model: m, retryAfterMs: rl.retryAfterMs },
            );
          }
          throw new Error(`skill-audit-loop: phase 3.1 verification dispatch failed for ${skill} on mandatory ${m} — ${outcome.errorText}. Unverified content never proceeds to eval.`);
        }
        verify.approvals[m] = outcome.value.approved === true;
        const gaps = Array.isArray(outcome.value.gaps) ? outcome.value.gaps : [];
        for (const g of gaps) roundGaps.push({ verifier: m, round: vRound, ...g });
        onProgress({ kind: 'agent', model: m, tier: 'mandatory', phase: 'verify', state: outcome.value.approved ? 'done' : 'fail' });
        log(`phase 3.1 · ${m}: ${outcome.value.approved ? '✓ approved' : `✗ flagged ${gaps.length} gap(s)`}`);
      }
      verify.gaps.push(...roundGaps);
      approvedAll = mandatoryModels.every((m) => verify.approvals[m] === true);
      if (!approvedAll && vRound < 2) {
        // ONE curator revision: re-curate with the verify gaps appended as feedback, then
        // re-validate the new ledger with the SAME guards before re-verifying.
        log(`phase 3.1 · ${roundGaps.length} gap(s) flagged — curator revision + re-verify…`);
        onProgress({ kind: 'phase', phase: 'curate (verify revision)' });
        merge = deps.curate({
          skill,
          skillDir,
          currentSkillPath,
          proposals: mandatoryFinal.map(toProposalRef),
          advisoryProposals: advisoryFinal.map(toProposalRef),
          crossReview: convergenceState.lastRoundFeedback || [],
          // B7: Phase-3.1 verification gaps go through a DISTINCT typed channel — not the
          // cross-review channel with a synthetic targetModel:'curator'. They are mandatory
          // verification FAILURES on the prior merge the curator MUST resolve; buildCuratePrompt
          // renders them in their own labeled "MANDATORY VERIFICATION GAPS" block.
          verifyGaps: roundGaps.map((g) => ({
            verifier: g.verifier,
            round: g.round,
            item: g.item,
            evidence: g.evidence,
            required_action: g.required_action,
          })),
        });
        const reAntiLoss = validateAntiLoss(merge && merge.mergeLedger);
        if (!reAntiLoss.ok) throw new Error(`skill-audit-loop: verify-revision merge-ledger violates anti-loss for ${skill} — ${reAntiLoss.violations.map((v) => `[${v.id}] ${v.reason}`).join('; ')}`);
        const reCoverage = validateMandatoryCoverage(merge && merge.mergeLedger, mandatoryFinal, mandatoryModels);
        if (!reCoverage.ok) throw new Error(`skill-audit-loop: verify-revision mandatory coverage gap for ${skill} — ${reCoverage.violations.map((v) => v.reason).join('; ')}`);
      }
    }
    if (!approvedAll) {
      throw new Error(
        `skill-audit-loop: phase 3.1 verification failed for ${skill} — mandatory frontier approval not reached after ${verify.rounds} round(s); `
        + `${verify.gaps.length} unresolved gap(s): ${verify.gaps.map((g) => `[${g.verifier}] ${g.item}`).join('; ')}. Only verified content proceeds to eval.`,
      );
    }
    log(`phase 3.1 · ✓ ${mandatoryModels.length} mandatory frontier model(s) approved the merge`);
  } else {
    log('phase 3.1 · verify gate DEFERRED — no verifyMerge dep injected (curate-only / dry-run composition)');
  }
  // B4: a verify gate that did not actually RUN (DEFERRED — no verifyMerge dep) must NOT
  // certify. Production always injects verifyMerge (→ RUN); a curate-only/dry-run composition
  // that reaches a passing eval can no longer mint a certifying verdict without verification.
  if (verify.status !== 'RUN') certifyingBlocked.push(`verify-${String(verify.status).toLowerCase()}`);

  // ── Phase 4 — eval guardrail on the curated skill ─────────────────────────
  let evalSkillDir = skillDir;
  // Skill-absent baseline twin (plan E): the baseline arm runs here with research tools
  // ON but cannot filesystem-read the candidate SKILL.md. Null until prepared.
  let baselineEvalSkillDir = null;
  let evalCleanup = null;
  let candidateEvalPrepared = false;
  if (merge && merge.mergedSkillPath && typeof deps.prepareCandidateEval === 'function') {
    const prepared = deps.prepareCandidateEval({ skill, skillDir, mergedSkillPath: merge.mergedSkillPath });
    if (prepared && prepared.evalSkillDir) {
      evalSkillDir = prepared.evalSkillDir;
      baselineEvalSkillDir = prepared.baselineEvalSkillDir || null;
      evalCleanup = prepared.cleanup;
      candidateEvalPrepared = true;
    }
  }

  const evalArtifactName = evalMode === 'comprehension' ? 'comprehension.json' : 'application.json';
  // F2: default OFF — if no predicate is injected, assume the eval artifact is ABSENT
  // rather than silently assuming it exists. Absence is a RECORDED decision (eval_status:
  // ABSENT + eval_certified: false in the receipt), not a silent default-to-present.
  const evalArtifactExists = (typeof deps.evalArtifactExists === 'function')
    ? Boolean(deps.evalArtifactExists({ skillDir, evalMode }))
    : false;
  let evalReceipt = null;
  let evalSkipReason = null;
  let evalStatus = 'RUN'; // RUN | ABSENT | DEFERRED — recorded explicitly in the receipt (F2)
  if (typeof deps.runEvalDirection !== 'function') {
    evalSkipReason = 'no direction runner injected (curate-only / dry run) — eval deferred';
    evalStatus = 'DEFERRED';
    log(`phase 4 · eval guardrail SKIPPED — ${evalSkipReason}`);
  } else if (!evalArtifactExists) {
    evalSkipReason = `no evals/${evalArtifactName} for ${skill} — eval guardrail skipped (absence of an eval is not a regression; keep the curated skill)`;
    evalStatus = 'ABSENT';
    log(`phase 4 · eval guardrail SKIPPED — no evals/${evalArtifactName} (absence ≠ regression; keep)`);
  } else if (degraded.enabled) {
    log(`phase 4 · single-frontier eval guardrail (${evalMode}) with ${mandatoryModels[0]} — PROVISIONAL-capped; full two-frontier re-grade required`);
    onProgress({ kind: 'phase', phase: 'eval guardrail (single frontier)' });
    evalReceipt = runSingleFrontierEval({
      mode: evalMode,
      skill,
      cwd,
      skillDir: evalSkillDir,
      baselineWorkspace: baselineEvalSkillDir || undefined,
      mergeLedgerRef: merge && merge.mergeLedgerPath,
      frontierModel: mandatoryModels[0],
      missingFrontiers: degraded.missingFrontiers,
      provisionalReason: degraded.reason,
      deps: { runDirection: deps.runEvalDirection },
    });
  } else {
    log(`phase 4 · bidirectional eval guardrail (${evalMode}) on the curated skill — dispatching…`);
    onProgress({ kind: 'phase', phase: 'eval guardrail' });
    evalReceipt = runBidirectionalEval({
      mode: evalMode,
      skill,
      cwd,
      skillDir: evalSkillDir,
      // Skill-absent baseline working dir (research tools stay ON). Falls back to the
      // skill-absent execution-profile cwd inside runBidirectionalEval when null.
      baselineWorkspace: baselineEvalSkillDir || undefined,
      mergeLedgerRef: merge && merge.mergeLedgerPath,
      deps: { runDirection: deps.runEvalDirection },
    });
  }

  // ── Phase 4b — keep-or-revert (GUARDRAIL ONLY; advisory never decides) ──
  const decision = evalReceipt
    ? decideKeepOrRevert(evalReceipt, { priorVerdict })
    : { keep: true, action: 'keep', reason: `eval guardrail not run (${evalSkipReason || 'eval deferred'}) — curated skill kept` };
  log(`phase 4b · decision: ${decision.action.toUpperCase()} — ${decision.reason}`);

  // ── Phase 5 — apply on KEEP (the single point the canonical skill is mutated) ──
  onProgress({ kind: 'phase', phase: decision.keep ? 'apply (keep)' : 'reverted' });
  let applied = false;
  if (decision.keep && merge && merge.mergedSkillPath && typeof deps.applyMerge === 'function') {
    log(`phase 5 · apply-on-keep — writing curated SKILL.md to ${skillDir}…`);
    const applyResult = deps.applyMerge({ skill, skillDir, mergedSkillPath: merge.mergedSkillPath });
    applied = Boolean(applyResult && applyResult.applied);
    log(`phase 5 · ${applied ? '✓ APPLIED — canonical SKILL.md updated' : '✗ apply returned false'}`);
  } else if (!decision.keep) {
    log('phase 5 · NOT applied (reverted by eval guardrail)');
  }
  if (typeof evalCleanup === 'function') {
    try { evalCleanup(); } catch (_) { /* best-effort temp cleanup */ }
  }

  return {
    skill,
    objective: 'skill-audit-loop',
    mode: 'panel',
    mandatory_models: mandatoryModels.slice(),
    degraded_frontier: degraded.enabled
      ? {
        enabled: true,
        available: mandatoryModels.slice(),
        missing: degraded.missingFrontiers.slice(),
        reason: degraded.reason,
        regrade_required: true,
      }
      : { enabled: false },
    advisory_models_requested: advisoryRequested,
    advisory_models_alive: advisoryFinal.map((p) => p.model),
    advisory_failures: advisoryFailures.concat(convergenceAdvisoryFailures),
    // F4: top-level rollup so the orchestrating agent SEES buried advisory failures instead of
    // them being lost in a shell call it waits on lazily. advisory_critical fires when advisory
    // was requested but EVERY advisory model failed (the breadth tier contributed nothing).
    advisory_failure_summary: advisoryFailures.concat(convergenceAdvisoryFailures).reduce(
      (acc, f) => { const r = f.failure_reason || 'error'; acc[r] = (acc[r] || 0) + 1; return acc; },
      {},
    ),
    advisory_critical: advisoryRequested.length > 0 && advisoryFinal.length === 0,
    advisory_auth_warnings: advisoryAuthWarnings, // F5: not-ready advisory CLIs (kept, surfaced)
    convergence: {
      rounds: convergenceState.rounds,
      converged: convergenceState.converged,
      reason: convergenceState.reason,
      history: convergenceState.history,
      policy: convergenceState.policy,
    },
    proposals_final: finalAlive.map((p) => ({
      model: p.model,
      tier: p.tier,
      proposalPath: p.proposalPath || null,
      noveltyMemoPath: p.noveltyMemoPath || null,
      iterationSuggestionsPath: p.iterationSuggestionsPath || null,
      round: p.round,
      contentHash: p.contentHash,
    })),
    // Phase 3.1 record (2026-06-10T): RUN = both frontiers verified the merge; DEFERRED =
    // no verifyMerge dep injected (curate-only / dry-run). Gaps carry verifier + evidence.
    verify,
    merge: {
      mergedSkillPath: merge && merge.mergedSkillPath,
      mergeLedgerPath: merge && merge.mergeLedgerPath,
      anti_loss: antiLoss,
      mandatory_coverage: coverage,
      advisory_coverage: advisoryCoverage,
    },
    eval_skill_dir: candidateEvalPrepared ? evalSkillDir : null,
    baseline_eval_skill_dir: candidateEvalPrepared ? baselineEvalSkillDir : null,
    candidate_eval: candidateEvalPrepared,
    eval: evalReceipt,
    // F2 — explicit, recorded eval-absent decision (never a silent keep-on-absence default).
    // eval_status: RUN (guardrail ran) | ABSENT (no eval artifact) | DEFERRED (no runner).
    // eval_certified: true ONLY when the guardrail produced a certifying-clean APPLICABLE/PASS.
    eval_status: evalStatus,
    eval_skip_reason: evalSkipReason,
    eval_certified: Boolean(
      evalReceipt && evalReceipt.certifying_clean
      && (evalReceipt.synthesized_verdict === 'APPLICABLE' || evalReceipt.synthesized_verdict === 'PASS')
      && certifyingBlocked.length === 0, // B2/B4: non-converged / verify-not-run / degraded never certify
    ),
    // Reasons (if any) the run is non-certifying despite a passing eval. Empty ⇒ fully
    // certifiable. recordFullLoop caps the stamped verdict at PROVISIONAL when non-empty.
    certifying_blocked: certifyingBlocked.slice(),
    keep_or_revert: decision,
    applied,
    registry_version: REGISTRY_VERSION,
  };
}

// ─── CLI ────────────────────────────────────────────────────────────────────────
// node lib/audit/run-skill-audit-loop.js --skill <slug> --skill-dir <dir> [--cwd <root>]
//   [--eval-mode application|comprehension] [--prior-verdict <V>] [--max-rounds N]
//   [--available-frontiers <csv>] [--degrade-on-budget]
//   [--advisory-timeout-ms N] [--no-advisory] [--dry-run] [--no-eval] [--status-file <path>] [--no-tui] [--quiet]
//   [--preflight-only [--auth-probe [--auth-probe-timeout-ms N]]]
//
// VISIBILITY: on a real TTY a pinned status header shows every configured panel agent
// (mandatory frontier set + free advisory) with its live phase/state; the [+Ns] log scrolls below. A
// heartbeat status.json is always written (--status-file, default under the run-dir tree)
// for `scripts/watch-audit-batch.sh` + the Monitor tool, so the run can never go stale
// unnoticed. --no-tui forces the header off (heartbeat + stderr only); --quiet silences
// the stderr stream. See skill-audit-loop/SKILL_AUDIT_LOOP.md § "Running long batches…".

// ─── Full-loop recording (CLI path only; runSkillAuditLoop stays pure) ─────────────
// The pure orchestrator above runs the IMPROVE step (propose → cross-review → curate →
// eval guardrail → apply) and returns provenance. To run the FULL per-skill Skill Audit
// Loop, the CLI ALSO records the Integrity Gate (`audit`) and Behavior Gate (`evaluate`)
// verdicts into the skill's audit-state.json — reusing the canonical operations as
// subprocesses, never reinventing the writers. Recording is OBSERVATIONAL: it runs AFTER
// keep-or-revert and never feeds back into it (the philosophy guardrail is unchanged).
// Every gate is either run-and-stamped or left UNVERIFIED with an explicit finding — never
// silently skipped (SKILL_AUDIT_LOOP.md Part 2 Completion Rule).
function recordFullLoop({ skill, skillDir, cwd, result, evalMode, log = () => {}, deps = {} }) {
  // Deps are injectable (default to the real implementations) so the composition is unit-testable
  // without spawning real graders — matching this file's dependency-injection philosophy.
  const spawn = deps.spawn || require('child_process').spawnSync;
  const fs = deps.fs || require('fs');
  const sidecar = require('./audit-state-sidecar');
  const writeSidecarFields = deps.writeSidecarFields || sidecar.writeSidecarFields;
  const readSidecar = deps.readSidecar || sidecar.readSidecar;
  const todayIsoDate = deps.todayIsoDate || require('./evaluate-skill').todayIsoDate;
  const toSidecarReceipt = deps.toSidecarReceipt || require('./run-bidirectional-eval').toSidecarReceipt;
  const skillMd = path.join(skillDir, 'SKILL.md');
  const recorded = {};
  const findings = [];
  // B9: the Integrity-Gate and Behavior-Gate subprocess timeouts are env-tunable — a large
  // skill with many truth sources / eval cases can legitimately exceed the defaults, and a
  // timeout is reported as a DISTINCT finding (not a generic exit) so it is not mistaken for
  // a clean stamp. Defaults: 3 min integrity, 30 min behavior.
  const INTEGRITY_TIMEOUT_MS = Number(process.env.SKILL_AUDIT_INTEGRITY_TIMEOUT_MS) || 180000;
  const BEHAVIOR_TIMEOUT_MS = Number(process.env.SKILL_AUDIT_BEHAVIOR_TIMEOUT_MS) || 1800000;
  const spawnTimedOut = (r) => Boolean(r && (r.signal === 'SIGTERM' || (r.error && r.error.code === 'ETIMEDOUT')) && r.status === null);

  // 1. Integrity Gate (ALWAYS; deterministic, no model) → structural/truth/lint/last_audited.
  log('record · Integrity Gate (audit: lint + drift) — stamping structural/truth/last_audited…');
  const ag = spawn('node', [path.join(__dirname, 'skill-audit.js'), skill], { cwd, encoding: 'utf8', timeout: INTEGRITY_TIMEOUT_MS });
  recorded.integrity = ag.status === 0 ? 'stamped' : (spawnTimedOut(ag) ? 'TIMEOUT' : 'FAILED');
  if (ag.status !== 0) {
    findings.push(spawnTimedOut(ag)
      ? `Integrity Gate (skill-audit.js) TIMED OUT after ${INTEGRITY_TIMEOUT_MS}ms — structural/truth NOT stamped. Raise SKILL_AUDIT_INTEGRITY_TIMEOUT_MS for large skills.`
      : `Integrity Gate (skill-audit.js) exited ${ag.status}: ${String(ag.stderr || ag.error || '').slice(-300)}`);
  }

  // Per-model participation ledger. This is deliberately separate from the four verdicts:
  // advisory/free-model runs record coverage and failure reasons, but never certify quality.
  try {
    const existing = readSidecar(skillMd) || {};
    const modelRunCoverage = buildModelRunCoverage({
      existing: existing.model_run_coverage,
      result,
      evalMode,
      at: new Date().toISOString(),
      operation: 'panel',
    });
    writeSidecarFields(skillMd, { model_run_coverage: modelRunCoverage });
    recorded.model_run_coverage = Object.keys(modelRunCoverage.models || {}).sort();
  } catch (e) {
    findings.push(`model_run_coverage write failed: ${e.message}`);
  }

  if (!result.applied) {
    findings.push('Reverted by the eval guardrail — Behavior Gate verdicts not re-stamped (prior body unchanged).');
    return { recorded, findings };
  }

  // 2. last_changed (keep only).
  try { const d = todayIsoDate(); writeSidecarFields(skillMd, { last_changed: d }); recorded.last_changed = d; }
  catch (e) { findings.push(`last_changed stamp failed: ${e.message}`); }

  // 3. Behavior Gate — the eval-mode dimension. The guardrail already ran a bidirectional
  //    eval (mode=evalMode) on the kept body; reuse its receipt — it IS runBidirectionalEval,
  //    the same grader the canonical `evaluate` uses, honestly capped to PROVISIONAL upstream
  //    unless certifying-clean. Persist the receipt as eval_last_run.bidirectional evidence.
  const primaryField = evalMode === 'comprehension' ? 'comprehension_verdict' : 'application_verdict';
  const primaryArtifact = evalMode === 'comprehension' ? 'comprehension.json' : 'application.json';
  // B2/B4: a non-certifying run (non-converged / verify-not-run / degraded) must never STAMP a
  // certifying verdict, even if the guardrail eval reached APPLICABLE/PASS — cap it at PROVISIONAL.
  const certBlocked = Array.isArray(result.certifying_blocked) && result.certifying_blocked.length > 0;
  if (result.eval) {
    try {
      const receipt = toSidecarReceipt(result.eval);
      const runner = result.eval.reconciliation === 'single-frontier-provisional'
        ? 'skill-audit-loop guardrail (single-frontier provisional)'
        : 'skill-audit-loop guardrail (bidirectional)';
      writeSidecarFields(skillMd, {
        eval_last_run: { at: new Date().toISOString(), status: 'pass', runner, bidirectional: receipt },
      });
      const v = receipt.synthesized_verdict;
      if (v && v !== 'UNVERIFIED') {
        let stamp = v;
        const nonCertifying = certBlocked || receipt.certifying_clean === false;
        if (nonCertifying && (v === 'HARMFUL' || v === 'FALSE_POSITIVE')) {
          stamp = 'UNVERIFIED';
          findings.push(`${primaryField}: non-certifying guardrail reached ${v}; receipt preserved, but the durable active-corpus verdict was downgraded to UNVERIFIED. Active dangerous verdicts require a certifying-clean signal before they can force corpus removal or routing exclusion.`);
        }
        if (nonCertifying && (v === 'APPLICABLE' || v === 'PASS')) {
          stamp = 'PROVISIONAL';
          const blockedReasons = certBlocked ? result.certifying_blocked.join('; ') : 'receipt certifying_clean=false';
          findings.push(`${primaryField}: run is NON-CERTIFYING (${blockedReasons}) — guardrail reached ${v} but the verdict is capped at PROVISIONAL; a full certifying run is required before ${v}.`);
        }
        writeSidecarFields(skillMd, { [primaryField]: stamp }); recorded[primaryField] = stamp;
      } else {
        // D1: the body CHANGED (applied) but this eval is inconclusive — the prior verdict is
        // no longer earned. WRITE the honest downgrade to the sidecar; do not leave a stale
        // (possibly APPLICABLE) verdict attached to changed content.
        writeSidecarFields(skillMd, { [primaryField]: 'UNVERIFIED' }); recorded[primaryField] = 'UNVERIFIED';
        findings.push(`${primaryField}: guardrail eval inconclusive (${v || 'no verdict'}) — body changed, so the prior verdict was downgraded to UNVERIFIED.`);
      }
      if (receipt.regrade_required) {
        findings.push(`${primaryField}: single-frontier degraded eval recorded; full two-frontier re-grade required before certification.`);
      }
    } catch (e) { findings.push(`bidirectional receipt persist failed: ${e.message}`); }
  } else {
    // D1: applied a changed body with NO eval (the absence-keeps-curation path). The prior
    // verdict is stale — downgrade it to UNVERIFIED on disk, never leave it on changed content.
    try { writeSidecarFields(skillMd, { [primaryField]: 'UNVERIFIED' }); } catch (e) { findings.push(`${primaryField} downgrade write failed: ${e.message}`); }
    recorded[primaryField] = 'UNVERIFIED';
    findings.push(`No evals/${primaryArtifact} — ${primaryField} downgraded to UNVERIFIED (body changed). Author it (preflight --ensure / runbook Step 4c) to certify the Behavior Gate.`);
  }

  // 4. Behavior Gate — the OTHER dimension. Run the canonical `evaluate` when its artifact
  //    exists (grades + stamps the verdict via the canonical path); else UNVERIFIED + finding.
  const otherMode = evalMode === 'comprehension' ? 'application' : 'comprehension';
  const otherField = evalMode === 'comprehension' ? 'application_verdict' : 'comprehension_verdict';
  const otherArtifact = evalMode === 'comprehension' ? 'application.json' : 'comprehension.json';
  const otherJson = path.join(skillDir, 'evals', otherArtifact);
  if (fs.existsSync(otherJson)) {
    log(`record · Behavior Gate (${otherMode}) — grading evals/${otherArtifact}…`);
    const evArgs = otherMode === 'application'
      ? [path.join(__dirname, 'evaluate-skill.js'), '--mode', 'application', '--application', skillDir, otherJson]
      : [path.join(__dirname, 'evaluate-skill.js'), '--mode', 'comprehension', otherJson];
    const cg = spawn('node', evArgs, { cwd, encoding: 'utf8', timeout: BEHAVIOR_TIMEOUT_MS });
    recorded[otherField] = cg.status === 0 ? 'stamped' : (spawnTimedOut(cg) ? 'TIMEOUT' : 'FAILED');
    if (cg.status !== 0) {
      findings.push(spawnTimedOut(cg)
        ? `${otherField} (evaluate-skill --mode ${otherMode}) TIMED OUT after ${BEHAVIOR_TIMEOUT_MS}ms — not stamped. Raise SKILL_AUDIT_BEHAVIOR_TIMEOUT_MS for large skills.`
        : `${otherField} (evaluate-skill --mode ${otherMode}) exited ${cg.status}: ${String(cg.stderr || cg.error || '').slice(-300)}`);
    }
  } else {
    // D1: body changed (applied) and this dimension has no eval — downgrade the stale prior
    // verdict to UNVERIFIED on disk rather than leaving it attached to the new content.
    try { writeSidecarFields(skillMd, { [otherField]: 'UNVERIFIED' }); } catch (e) { findings.push(`${otherField} downgrade write failed: ${e.message}`); }
    recorded[otherField] = 'UNVERIFIED';
    findings.push(`No evals/${otherArtifact} — ${otherField} downgraded to UNVERIFIED (body changed). Author it (runbook Step 4c/5) to run the gate.`);
  }

  return { recorded, findings };
}

function main(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const t = argv[i];
    if (t.startsWith('--')) {
      const key = t.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) { args[key] = true; } else { args[key] = next; i += 1; }
    }
  }
  const skillDir = args['skill-dir'] || args.skillDir;
  const cwd = args.cwd || process.cwd();
  const skill = args.skill || (skillDir ? path.basename(skillDir) : null);
  if (!skill || !skillDir) {
    console.error('Usage: node lib/audit/run-skill-audit-loop.js --skill <slug> --skill-dir <dir> [--cwd <skill-graph-root>] [--eval-mode application|comprehension] [--prior-verdict <V>] [--max-rounds N] [--available-frontiers <csv>] [--degrade-on-budget] [--advisory-timeout-ms N] [--no-advisory] [--dry-run] [--no-eval] [--no-record-loop] [--preflight-only [--auth-probe [--auth-probe-timeout-ms N]]] [--model-cli-home auto|scratch|real] [--public-workspace auto|always|never] [--status-file <path>] [--no-tui] [--quiet]');
    process.exit(1);
  }
  const { frontierAvailability } = require('./panel-budget');
  const { createSkillAuditLoopDeps } = require('./skill-audit-loop-live-deps');
  const { createProgressReporter } = require('./panel-progress');
  const { isOsFenceSupported } = require('./isolated-checkout');
  const { prepareModelCliHome } = require('./model-cli-home');
  const { preparePublicWorkspace } = require('./public-workspace-fallback');
  const { runPanelPreflight } = require('./panel-preflight');
  const dryRun = Boolean(args['dry-run']);
  const noAdvisory = Boolean(args['no-advisory']);
  let mandatoryModels = FRONTIER_PAIR.slice();
  let degradedFrontier = { enabled: false };
  const parseFrontierCsv = (raw) => String(raw || '').split(',').map((s) => s.trim()).filter(Boolean);
  const configureAvailableFrontiers = (available, reason) => {
    const unique = Array.from(new Set(available));
    const invalid = unique.filter((m) => !FRONTIER_PAIR.includes(m));
    if (invalid.length) {
      console.error(`error: --available-frontiers may only contain ${FRONTIER_PAIR.join(', ')}; got invalid ${invalid.join(', ')}`);
      process.exit(1);
    }
    if (unique.length < 1 || unique.length > FRONTIER_PAIR.length) {
      console.error(`error: available frontiers must contain 1..${FRONTIER_PAIR.length} model(s), got ${unique.length}`);
      process.exit(1);
    }
    mandatoryModels = unique;
    if (unique.length === 1) {
      const missing = FRONTIER_PAIR.filter((m) => !unique.includes(m));
      degradedFrontier = {
        enabled: true,
        missingFrontiers: missing,
        reason: reason || `single_frontier:${missing.join(',') || 'frontier_unavailable'}`,
      };
    } else {
      degradedFrontier = { enabled: false };
    }
  };
  if (args['available-frontiers']) {
    configureAvailableFrontiers(parseFrontierCsv(args['available-frontiers']), args['degraded-frontier-reason']);
  } else if (args['degrade-on-budget']) {
    const availability = frontierAvailability({ models: FRONTIER_PAIR });
    if (availability.allExhausted) {
      console.error(`error: all mandatory frontiers are budget-exhausted: ${availability.exhausted.map((e) => e.model).join(', ')}`);
      process.exit(1);
    }
    if (availability.available.length > 0 && availability.available.length < FRONTIER_PAIR.length) {
      const exhausted = availability.exhausted.map((e) => e.model);
      configureAvailableFrontiers(availability.available, args['degraded-frontier-reason'] || `single_frontier:${exhausted.join(',')}_budget_exhausted`);
    }
  }
  const advisoryModels = noAdvisory ? [] : ADVISORY_MODELS;
  const curatorModel = args.curator || (degradedFrontier.enabled ? mandatoryModels[0] : undefined);
  if (degradedFrontier.enabled && args.curator && !mandatoryModels.includes(args.curator)) {
    console.error(`error: --curator ${args.curator} is not an available frontier in degraded mode (${mandatoryModels.join(', ')})`);
    process.exit(1);
  }
  const osFenceSupported = isOsFenceSupported();
  const modelHomeMode = args['model-cli-home'] || (args['no-model-cli-temp-home'] ? 'real' : 'auto');
  const publicWorkspaceMode = args['public-workspace'] || 'auto';
  if (!['auto', 'scratch', 'real'].includes(modelHomeMode)) {
    console.error(`error: --model-cli-home must be auto, scratch, or real; got ${JSON.stringify(modelHomeMode)}`);
    process.exit(1);
  }
  if (!['auto', 'always', 'never'].includes(publicWorkspaceMode)) {
    console.error(`error: --public-workspace must be auto, always, or never; got ${JSON.stringify(publicWorkspaceMode)}`);
    process.exit(1);
  }

  const resources = [];
  const modelHome = prepareModelCliHome({ mode: modelHomeMode });
  resources.push(modelHome);
  // SKI-404 (Option A): opencode 1.16.2 creates its project instance by walking from `--dir` UP to
  // the workspace root (`service=project … fromDirectory`), which the Seatbelt fence DENIES — so a
  // COLD (no warm server) fenced opencode EPERMs at startup ("lstat <ws>") before any work, and the
  // panel always cold-starts. Build the public workspace COPY (a skill-graph + skills mirror under the
  // OS tmp dir, OUTSIDE ws) even when Seatbelt IS supported, whenever an advisory roster is in play
  // (opencode-backed advisors live in ADVISORY_MODELS), so opencode's `--dir` can point OUTSIDE the
  // denied parent. Frontier (claude/codex) + gemini do NOT have this resolution behavior and keep
  // using the real fenced paths (modelCwd stays null under Seatbelt — see the createSkillAuditLoopDeps
  // call below), so this does not change their dispatch; only opencode's `--dir` moves to the copy.
  const usePublicWorkspace = publicWorkspaceMode === 'always'
    || (publicWorkspaceMode === 'auto' && (!osFenceSupported || advisoryModels.length > 0));
  const publicWorkspace = preparePublicWorkspace({
    enabled: usePublicWorkspace,
    skillGraphRoot: path.resolve(cwd),
    workspaceRoot: path.resolve(cwd, '..'),
  });
  resources.push(publicWorkspace);
  let cleanedResources = false;
  const cleanupResources = () => {
    if (cleanedResources) return;
    cleanedResources = true;
    for (const r of resources.reverse()) {
      if (r && typeof r.cleanup === 'function') {
        try { r.cleanup(); } catch (_) { /* best-effort */ }
      }
    }
  };
  process.once('exit', cleanupResources);
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.once(sig, () => {
      cleanupResources();
      process.kill(process.pid, sig);
    });
  }

  const preflight = runPanelPreflight({
    skillGraphRoot: path.resolve(cwd),
    workspaceRoot: path.resolve(cwd, '..'),
    skillDir: path.resolve(skillDir),
    mandatoryModels,
    advisoryModels,
    env: modelHome.env,
    envByCli: modelHome.envByCli,
    modelCliHome: modelHome,
    osFenceSupported,
    publicWorkspace,
    // SKI-376: opt-in authenticated no-op probe per CLI (default off so --preflight-only stays
    // cheap). Catches a logged-out child CLI before paid dispatch; logged-out mandatory => error.
    authProbe: Boolean(args['auth-probe']),
    authProbeTimeoutMs: args['auth-probe-timeout-ms'] !== undefined ? Number(args['auth-probe-timeout-ms']) : undefined,
  });
  if (args['preflight-only']) {
    console.log(JSON.stringify({
      ok: preflight.ok,
      preflight,
      mandatory_models: mandatoryModels,
      degraded_frontier: degradedFrontier,
      model_cli_home: {
        active: modelHome.active,
        mode: modelHome.mode,
        homeDir: modelHome.homeDir,
        copied: modelHome.copied,
        realWritable: modelHome.realWritable,
      },
      public_workspace: publicWorkspace.active ? {
        active: true,
        root: publicWorkspace.root,
        skillGraphRoot: publicWorkspace.skillGraphRoot,
        skillsRoot: publicWorkspace.skillsRoot,
      } : { active: false },
    }, null, 2));
    process.exit(preflight.ok ? 0 : 1);
  }
  if (!preflight.ok) {
    console.error('SKILL-AUDIT-LOOP: PREFLIGHT FAILED');
    for (const e of preflight.errors) console.error(`  error: ${e}`);
    for (const w of preflight.warnings) console.error(`  warning: ${w}`);
    process.exit(1);
  }

  // SKI-375: operator-tunable advisory dispatch timeout (the per-advisory cell ceiling).
  // Long advisory research otherwise silently times out at the createSkillAuditLoopDeps default
  // (20m). Undefined when the flag is absent so the deps default applies.
  let advisoryTimeoutMs;
  if (args['advisory-timeout-ms'] !== undefined) {
    const parsed = Number(args['advisory-timeout-ms']);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      console.error(`error: --advisory-timeout-ms must be a positive integer (milliseconds), got: ${JSON.stringify(args['advisory-timeout-ms'])}`);
      process.exit(1);
    }
    advisoryTimeoutMs = parsed;
  }

  const deps = createSkillAuditLoopDeps({
    skillGraphRoot: cwd,
    curatorModel,
    dryRun,
    modelEnv: modelHome.envByCli ? { byCli: modelHome.envByCli, default: modelHome.env } : modelHome.env,
    // modelCwd (the cwd for ALL model CLIs) is overridden to the public copy ONLY in the no-Seatbelt
    // fallback (the original disclosure-minimizing case). Under Seatbelt, frontier + gemini run fine
    // from the real skill-graph root, so keep modelCwd null there and let ONLY opencode's `--dir`
    // move outside ws via publicWorkspaceSkillsRoot (SKI-404 Option A). Overriding modelCwd for every
    // model under Seatbelt would needlessly change the working frontier/gemini cwd.
    modelCwd: (publicWorkspace.active && !osFenceSupported) ? publicWorkspace.skillGraphRoot : null,
    publicWorkspaceSkillsRoot: publicWorkspace.active ? publicWorkspace.skillsRoot : null,
    advisoryTimeoutMs,
  });
  // APPLICABLE gate PARKED (2026-06-14T, owner directive). The application eval is not yet
  // discriminating — 0 APPLICABLE corpus-wide, and it stamps HARMFUL/REDUNDANT/MIXED on skills
  // known to be good (the test is the problem, not the skills) — and it is expensive. It is
  // therefore OFF by default for application mode. Opt back in for a single run with `--eval`
  // (useful while improving the test); re-enable permanently by reverting the parking commit.
  // Comprehension mode is UNAFFECTED (it stays default-on; it is cheap and not what defames skills).
  // See CHANGELOG § Skill Audit Loop — APPLICABLE gate parked.
  const evalModeRequested = args['eval-mode'] || 'application';
  const applicableGateParked = evalModeRequested === 'application' && !args.eval;
  if (!args['no-eval'] && !dryRun && !applicableGateParked) {
    deps.runEvalDirection = require('./evaluate-skill').runEvalDirection;
  }
  if (applicableGateParked && !dryRun) {
    log('APPLICABLE gate PARKED — application eval skipped by default (pass --eval to run it; see CHANGELOG).');
  }
  const convergence = {};
  if (args['max-rounds']) {
    // SKI-278: validate before assigning. `Number('foo')` is NaN, and the
    // convergence loop `round <= NaN` is always false — so an unparseable
    // --max-rounds would SILENTLY skip all cross-review instead of erroring.
    const parsedMaxRounds = Number(args['max-rounds']);
    if (!Number.isInteger(parsedMaxRounds) || parsedMaxRounds < 1) {
      console.error(`error: --max-rounds must be a positive integer, got: ${JSON.stringify(args['max-rounds'])}`);
      process.exit(1);
    }
    convergence.maxRounds = parsedMaxRounds;
  }
  // Stream phase/agent progress to STDERR so a FOREGROUND run is visible live (the loop is
  // designed to run visibly, not as a polled black-box background process). Final result
  // JSON stays on STDOUT so batch drivers can parse it. --quiet silences the stream.
  const t0 = Date.now();
  const quiet = Boolean(args.quiet);
  const log = quiet ? () => {} : (msg) => {
    const s = Math.round((Date.now() - t0) / 1000);
    process.stderr.write(`[+${String(s).padStart(4)}s] ${msg}\n`);
  };

  // Visibility layer — heartbeat status.json (watch-audit-batch.sh contract) + pinned-header
  // TUI (TTY-only). Default heartbeat path mirrors the per-skill run-dir tree so a watcher
  // can find it deterministically; --status-file overrides. --no-tui forces the header off.
  const statusFile = args['status-file']
    // Run-root relocated 2026-06-07T from .opencode/progress to skill-audit-loop/progress
    // (ADR-0016 surface #3). The default heartbeat path must match so watch-panel.js /
    // watch-audit-batch.sh find it at the canonical location (C5).
    || path.join(path.resolve(cwd), 'skill-audit-loop', 'progress', 'skill-audits', skill, 'panel-status.json');
  const reporter = createProgressReporter({
    skill,
    mandatoryModels,
    advisoryModels,
    statusFile,
    tty: args['no-tui'] ? false : undefined, // undefined → auto-detect process.stdout.isTTY
  });
  if (!quiet) process.stderr.write(`[+   0s] heartbeat → ${statusFile}\n`);
  reporter.heartbeat();
  reporter.startTick(15000);

  let result;
  try {
    result = runSkillAuditLoop({
      skill,
      skillDir: path.resolve(skillDir),
      cwd: path.resolve(cwd),
      mandatoryModels,
      advisoryModels,
      degradedFrontier,
      priorVerdict: args['prior-verdict'] || undefined,
      evalMode: args['eval-mode'] || 'application',
      convergence,
      deps,
      log,
      onProgress: reporter.onProgress,
    });
  } catch (err) {
    reporter.teardown(); // reset scroll region + write a final (complete) heartbeat so a watcher sees terminal state
    // Unambiguous terminal marker (stderr) — the run is judged by THIS line, never by a
    // printed result JSON or a green piped exit code (which `| tee` masks). See
    // skill-audit-loop/SKILL_AUDIT_LOOP.md § banned launch forms / terminal marker.
    const nonConvergent = err && err.code === 'NON_CONVERGENCE';
    const exitCode = nonConvergent ? 3 : 1;
    const status = nonConvergent ? 'NON-CONVERGENT' : 'FAILED';
    process.stderr.write(`SKILL-AUDIT-LOOP: ${status} skill=${skill} exit=${exitCode} reason=${err.message}\n`);
    process.exit(exitCode);
  }
  reporter.teardown();

  // Full per-skill loop recording (CLI path only) — record the Integrity + Behavior gates
  // into audit-state.json so a run through this command IS the full Skill Audit Loop, not
  // just the improve step. Non-fatal: a recording failure never discards the improve result.
  if (!dryRun && !args['no-record-loop']) {
    try {
      const loopRecord = recordFullLoop({
        skill, skillDir: path.resolve(skillDir), cwd: path.resolve(cwd),
        result, evalMode: args['eval-mode'] || 'application', log,
      });
      result.loop_record = loopRecord;
      log(`record · done — verdicts ${JSON.stringify(loopRecord.recorded)} · ${loopRecord.findings.length} finding(s)`);
      for (const f of loopRecord.findings) log(`record · ${f}`);
    } catch (e) {
      log(`record · full-loop recording errored (non-fatal): ${e.message}`);
    }
  }

  console.log(JSON.stringify(result, null, 2));
  // Unambiguous terminal marker (stderr) — the run is judged by THIS line, not by the
  // result JSON above (which a detached/piped launch can emit even when the run was
  // killed) and not by the pipe's exit code (which `| tee` masks). The marker is
  // emitted by the node process itself, so it is the one honest done-signal. See
  // skill-audit-loop/SKILL_AUDIT_LOOP.md § banned launch forms / terminal marker.
  const keep = !(result.keep_or_revert && result.keep_or_revert.keep === false);
  const exitCode = keep ? 0 : 2;
  process.stderr.write(`SKILL-AUDIT-LOOP: COMPLETE skill=${skill} keep=${keep} exit=${exitCode}\n`);
  process.exit(exitCode);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
  DEFAULT_CONVERGENCE,
  validateProposalCoverage,
  validateMandatoryCoverage,
  validateAdvisoryCoverage,
  NonConvergenceError,
  runConvergence,
  runSkillAuditLoop,
  recordFullLoop,
};
