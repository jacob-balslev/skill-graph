'use strict';

// ─── Multi-agent Skill Audit Loop runner (multi-model panel) ──────────────────
//
// Generalizes the 2-frontier `run-skill-audit-loop-lite.js` into the N-agent panel
// the user specified (2026-06-05):
//
//   Phase 1  Independent research + proposal, in PARALLEL:
//            • Opus 4.8 + GPT-5.5 (MANDATORY) — each its OWN research + proposal.
//            • every free agent (ADVISORY) — each its OWN research + proposal.
//            Width comes from many independent searches.
//   Phase 2  Cross-review, ITERATE UNTIL CONVERGENCE: every agent reviews every
//            other agent's proposal and gives keep/wrong/missing feedback; agents
//            revise in light of the feedback; repeat until proposals stabilize
//            (no alive agent changed) or the round budget is hit.
//   Phase 3  Synthesis: a FRONTIER curator (rotated) union-merges the two MANDATORY
//            proposals under STRICT anti-loss, and MAY fold in advisory content +
//            cross-review feedback where it adds value — a frontier model makes every
//            keep/drop call (advisory never auto-merges; no-lesser-models-for-quality).
//   Phase 4  Bidirectional eval GUARDRAIL (Opus⇄GPT) on the curated skill +
//            keep-or-revert. Advisory NEVER sets the verdict. (Reused unchanged.)
//   Phase 5  Apply-on-keep; the caller commits per skill.
//
// Asymmetry (user's constraint): a MANDATORY frontier failure ABORTS — but only after a
// bounded per-cell TRANSIENT retry (SKI-297; up to PER_CELL_MAX_RETRIES with backoff before
// the cell is declared dead, so one transient model death does not collapse the quorum and
// discard the whole run); an ADVISORY failure is recorded and skipped, never blocks (and is
// never retried). The advisory tier widens the search; the certifying floor is always the
// two frontier models.
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
const { FRONTIER_PAIR, ADVISORY_MODELS, REGISTRY_VERSION } = require('../audit-shared/model-provider');
const { runBidirectionalEval } = require('./run-bidirectional-eval');
const { validateAntiLoss, decideKeepOrRevert, validateCurationChanged } = require('./run-skill-audit-loop-lite');
const { parseRateLimit, RateLimitError, classifyInfraError, INFRA_ERROR_CLASS } = require('./panel-budget');

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

// Synchronous backoff sleep. runConvergence/runSkillAuditLoop are sync, so backoff is a
// blocking sleep via spawnSync (the established repo idiom). Injectable via deps.sleepMs so
// unit tests stay fast (pass a no-op).
function defaultSleepMs(ms) {
  if (ms > 0) {
    try { require('child_process').spawnSync('sleep', [String(Math.ceil(ms / 1000))]); } catch (_) { /* best-effort */ }
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
function validateMandatoryCoverage(ledger, mandatoryProposals, mandatoryModels) {
  const contributions = (ledger && Array.isArray(ledger.contributions)) ? ledger.contributions : [];
  const surfaced = new Set();
  for (const c of contributions) {
    if (c && c.surfaced_by) surfaced.add(c.surfaced_by);
    if (c && Array.isArray(c.corroborated_by)) for (const m of c.corroborated_by) surfaced.add(m);
  }
  const produced = new Set(
    (mandatoryProposals || []).filter((p) => p && p.alive !== false).map((p) => p.model),
  );
  const violations = [];
  const covered = [];
  for (const m of mandatoryModels) {
    if (!produced.has(m)) continue; // no final proposal from this model — coverage N/A
    if (surfaced.has(m)) covered.push(m);
    else {
      violations.push({
        model: m,
        reason: `mandatory model ${m} produced a proposal but appears on NO ledger contribution (kept or dropped-with-reason) — a frontier proposal was silently lost`,
      });
    }
  }
  return { ok: violations.length === 0, violations, covered };
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
              skill, reviewerModel: reviewer.model, reviewerTier: reviewer.tier,
              ownProposalPath: reviewer.proposalPath, otherProposals: others, round,
              artifactsDir: reviewer.artifactsDir,
            });
            if (!r || r.ok === false) return { ok: false, errorText: (r && r.error) || 'crossReview failed' };
            return { ok: true, value: r };
          } catch (e) { return { ok: false, errorText: e.message }; }
        },
      });
      if (!reviewOutcome.ok) {
        reviewer.alive = false;
        reviewer.error = reviewOutcome.errorText || 'crossReview failed';
        onProgress({ kind: 'agent', model: reviewer.model, tier: reviewer.tier, phase: 'review', state: 'fail', failure_reason: 'error', failure_detail: reviewer.error });
        continue;
      }
      const res = reviewOutcome.value;
      onProgress({ kind: 'agent', model: reviewer.model, tier: reviewer.tier, phase: 'review', state: 'done' });
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
        agent.alive = false;
        agent.error = reviseOutcome.errorText || 'reviseProposal failed';
        onProgress({ kind: 'agent', model: agent.model, tier: agent.tier, phase: 'revise', state: 'fail', failure_reason: 'error', failure_detail: agent.error });
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

  return { rounds: policy.maxRounds, converged: false, reason: 'round-budget', history, lastRoundFeedback, policy };
}

function toProposalRef(p) {
  return { model: p.model, tier: p.tier, proposalPath: p.proposalPath, noveltyMemoPath: p.noveltyMemoPath };
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
    deps = {},
    log = () => {},
    onProgress = () => {},
  } = opts;

  if (!skill || !skillDir || !cwd) {
    throw new Error('runSkillAuditLoop: skill, skillDir, and cwd are required.');
  }
  if (!Array.isArray(mandatoryModels) || mandatoryModels.length !== 2) {
    throw new Error('runSkillAuditLoop: mandatoryModels must be a 2-element array (the certifying frontier floor).');
  }
  const required = ['buildResearchBrief', 'claimSlot', 'researchAndPropose', 'releaseSlot', 'curate', 'crossReview', 'reviseProposal', 'hashProposal'];
  if (Array.isArray(advisoryModels) && advisoryModels.length > 0) {
    required.push('researchAndProposeAdvisory', 'claimAdvisorySlot');
  }
  for (const fn of required) {
    if (typeof deps[fn] !== 'function') {
      throw new Error(`runSkillAuditLoop: deps.${fn} must be a function (dependency injection required).`);
    }
  }
  const policy = { ...DEFAULT_CONVERGENCE, ...convergence };

  log(`skill-audit-loop START · skill=${skill} · mandatory=[${mandatoryModels.join(', ')}] · advisory=[${(advisoryModels || []).join(', ') || 'none'}] · maxRounds=${policy.maxRounds}`);
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
    let proposeAttempt = 0;
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
        deps.releaseSlot({ skill, model, status: 'completed' });
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
          deps.releaseSlot({ skill, model, status: 'aborted' });
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
        deps.releaseSlot({ skill, model, status: 'aborted' });
        onProgress({ kind: 'agent', model, tier: 'mandatory', phase: 'propose', state: 'fail' });
        log(`phase 1a · ✗ ${model} FAILED${proposeAttempt ? ` after ${proposeAttempt} retr${proposeAttempt === 1 ? 'y' : 'ies'}` : ''}: ${err.message} — mandatory failure ABORTS`);
        throw new Error(`skill-audit-loop: MANDATORY research/propose failed for ${skill} on ${model}: ${err.message}`);
      }
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
      advisoryFailures.push({ model, phase: 'propose', error: (p && p.error) || 'no proposal produced', failure_reason });
      log(`phase 1b · ✗ ${model} skipped (${failure_reason}): ${(p && p.error) || 'no proposal produced'}`);
      onProgress({ kind: 'agent', model, tier: 'advisory', phase: 'propose', state: 'skip', failure_reason, failure_detail });
      try { deps.releaseSlot({ skill, model, status: 'aborted' }); } catch (_) { /* best-effort */ }
      continue;
    }
    proposals.push({
      model, tier: 'advisory', proposalPath: p.proposalPath, noveltyMemoPath: p.noveltyMemoPath || null,
      round: 0, contentHash: deps.hashProposal(p.proposalPath), alive: true, error: null,
      artifactsDir: slot && slot.artifactsDir,
    });
    log(`phase 1b · ✓ ${model} advised → ${p.proposalPath}`);
    onProgress({ kind: 'agent', model, tier: 'advisory', phase: 'propose', state: 'done' });
    try { deps.releaseSlot({ skill, model, status: 'completed' }); } catch (_) { /* best-effort */ }
  }

  // ── Phase 2 — cross-review, iterate to convergence ──
  const convergenceState = runConvergence({ skill, skillDir, proposals, deps, policy, log, onProgress });
  log(`phase 2 · convergence ${convergenceState.converged ? 'reached' : 'ended'} after ${convergenceState.rounds} round(s) — ${convergenceState.reason}`);
  if (convergenceState.reason === 'quorum-collapsed') {
    throw new Error(`skill-audit-loop: mandatory quorum lost mid-convergence for ${skill} — a frontier model failed; aborting (the 2-frontier floor is required for a certifiable curate).`);
  }

  const finalAlive = proposals.filter((p) => p.alive);
  const mandatoryFinal = finalAlive.filter((p) => p.tier === 'mandatory');
  const advisoryFinal = finalAlive.filter((p) => p.tier === 'advisory');

  // ── Phase 3 — synthesis (frontier curator; strict anti-loss on mandatory) ──
  log(`phase 3 · curate (frontier curator) — union-merging ${mandatoryFinal.length} mandatory + ${advisoryFinal.length} advisory proposal(s) under strict anti-loss…`);
  onProgress({ kind: 'phase', phase: 'curate (synthesis)' });
  const merge = deps.curate({
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

  // ── Phase 4 — bidirectional eval guardrail on the curated skill (reused) ──
  let evalSkillDir = skillDir;
  // Skill-absent baseline twin (plan E): the baseline arm runs here with research tools
  // ON but cannot filesystem-read the candidate SKILL.md. Null until prepared.
  let baselineEvalSkillDir = null;
  let evalCleanup = null;
  let enrichedEvalPrepared = false;
  if (merge && merge.mergedSkillPath && typeof deps.prepareEnrichedEval === 'function') {
    const prepared = deps.prepareEnrichedEval({ skill, skillDir, mergedSkillPath: merge.mergedSkillPath });
    if (prepared && prepared.evalSkillDir) {
      evalSkillDir = prepared.evalSkillDir;
      baselineEvalSkillDir = prepared.baselineEvalSkillDir || null;
      evalCleanup = prepared.cleanup;
      enrichedEvalPrepared = true;
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
    advisory_models_requested: advisoryRequested,
    advisory_models_alive: advisoryFinal.map((p) => p.model),
    advisory_failures: advisoryFailures,
    // F4: top-level rollup so the orchestrating agent SEES buried advisory failures instead of
    // them being lost in a shell call it waits on lazily. advisory_critical fires when advisory
    // was requested but EVERY advisory model failed (the breadth tier contributed nothing).
    advisory_failure_summary: advisoryFailures.reduce(
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
    proposals_final: finalAlive.map((p) => ({ model: p.model, tier: p.tier, proposalPath: p.proposalPath || null, noveltyMemoPath: p.noveltyMemoPath || null, round: p.round, contentHash: p.contentHash })),
    merge: {
      mergedSkillPath: merge && merge.mergedSkillPath,
      mergeLedgerPath: merge && merge.mergeLedgerPath,
      anti_loss: antiLoss,
      mandatory_coverage: coverage,
    },
    eval_skill_dir: enrichedEvalPrepared ? evalSkillDir : null,
    baseline_eval_skill_dir: enrichedEvalPrepared ? baselineEvalSkillDir : null,
    enriched_eval: enrichedEvalPrepared,
    eval: evalReceipt,
    // F2 — explicit, recorded eval-absent decision (never a silent keep-on-absence default).
    // eval_status: RUN (guardrail ran) | ABSENT (no eval artifact) | DEFERRED (no runner).
    // eval_certified: true ONLY when the guardrail produced a certifying-clean APPLICABLE/PASS.
    eval_status: evalStatus,
    eval_skip_reason: evalSkipReason,
    eval_certified: Boolean(
      evalReceipt && evalReceipt.certifying_clean
      && (evalReceipt.synthesized_verdict === 'APPLICABLE' || evalReceipt.synthesized_verdict === 'PASS'),
    ),
    keep_or_revert: decision,
    applied,
    registry_version: REGISTRY_VERSION,
  };
}

// ─── CLI ────────────────────────────────────────────────────────────────────────
// node lib/audit/run-skill-audit-loop.js --skill <slug> --skill-dir <dir> [--cwd <root>]
//   [--eval-mode application|comprehension] [--prior-verdict <V>] [--max-rounds N]
//   [--no-advisory] [--dry-run] [--no-eval] [--status-file <path>] [--no-tui] [--quiet]
//
// VISIBILITY: on a real TTY a pinned status header shows every panel agent (Opus/GPT
// MANDATORY + free advisory) with its live phase/state; the [+Ns] log scrolls below. A
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
  const writeSidecarFields = deps.writeSidecarFields || require('./audit-state-sidecar').writeSidecarFields;
  const todayIsoDate = deps.todayIsoDate || require('./evaluate-skill').todayIsoDate;
  const toSidecarReceipt = deps.toSidecarReceipt || require('./run-bidirectional-eval').toSidecarReceipt;
  const skillMd = path.join(skillDir, 'SKILL.md');
  const recorded = {};
  const findings = [];

  // 1. Integrity Gate (ALWAYS; deterministic, no model) → structural/truth/lint/last_audited.
  log('record · Integrity Gate (audit: lint + drift) — stamping structural/truth/last_audited…');
  const ag = spawn('node', [path.join(__dirname, 'skill-audit.js'), skill], { cwd, encoding: 'utf8', timeout: 180000 });
  recorded.integrity = ag.status === 0 ? 'stamped' : 'FAILED';
  if (ag.status !== 0) findings.push(`Integrity Gate (skill-audit.js) exited ${ag.status}: ${String(ag.stderr || ag.error || '').slice(-300)}`);

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
  if (result.eval) {
    try {
      const receipt = toSidecarReceipt(result.eval);
      writeSidecarFields(skillMd, {
        eval_last_run: { at: new Date().toISOString(), status: 'pass', runner: 'skill-audit-loop guardrail (bidirectional)', bidirectional: receipt },
      });
      const v = receipt.synthesized_verdict;
      if (v && v !== 'UNVERIFIED') { writeSidecarFields(skillMd, { [primaryField]: v }); recorded[primaryField] = v; }
      else { recorded[primaryField] = 'UNVERIFIED'; findings.push(`${primaryField}: guardrail eval inconclusive (${v || 'no verdict'}) — left UNVERIFIED.`); }
    } catch (e) { findings.push(`bidirectional receipt persist failed: ${e.message}`); }
  } else {
    recorded[primaryField] = 'UNVERIFIED';
    findings.push(`No evals/${primaryArtifact} — ${primaryField} stays UNVERIFIED. Author it (preflight --ensure / runbook Step 4c) to certify the Behavior Gate.`);
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
    const cg = spawn('node', evArgs, { cwd, encoding: 'utf8', timeout: 1800000 });
    recorded[otherField] = cg.status === 0 ? 'stamped' : 'FAILED';
    if (cg.status !== 0) findings.push(`${otherField} (evaluate-skill --mode ${otherMode}) exited ${cg.status}: ${String(cg.stderr || cg.error || '').slice(-300)}`);
  } else {
    recorded[otherField] = 'UNVERIFIED';
    findings.push(`No evals/${otherArtifact} — ${otherField} stays UNVERIFIED. Author it (runbook Step 4c/5) to run the gate.`);
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
    console.error('Usage: node lib/audit/run-skill-audit-loop.js --skill <slug> --skill-dir <dir> [--cwd <skill-graph-root>] [--eval-mode application|comprehension] [--prior-verdict <V>] [--max-rounds N] [--no-advisory] [--dry-run] [--no-eval] [--no-record-loop] [--status-file <path>] [--no-tui] [--quiet]');
    process.exit(1);
  }
  const { createSkillAuditLoopDeps } = require('./skill-audit-loop-live-deps');
  const { createProgressReporter } = require('./panel-progress');
  const dryRun = Boolean(args['dry-run']);
  const noAdvisory = Boolean(args['no-advisory']);
  const deps = createSkillAuditLoopDeps({ skillGraphRoot: cwd, curatorModel: args.curator || undefined, dryRun });
  if (!args['no-eval'] && !dryRun) {
    deps.runEvalDirection = require('./evaluate-skill').runEvalDirection;
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
  const mandatoryModels = FRONTIER_PAIR;
  const advisoryModels = noAdvisory ? [] : ADVISORY_MODELS;
  const statusFile = args['status-file']
    || path.join(path.resolve(cwd), '.opencode', 'progress', 'skill-audits', skill, 'panel-status.json');
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
    process.stderr.write(`SKILL-AUDIT-LOOP: FAILED skill=${skill} exit=1 reason=${err.message}\n`);
    process.exit(1);
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
  validateMandatoryCoverage,
  runConvergence,
  runSkillAuditLoop,
  recordFullLoop,
};
