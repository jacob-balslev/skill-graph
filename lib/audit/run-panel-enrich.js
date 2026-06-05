'use strict';

// ─── Multi-agent PANEL ENRICH orchestrator — the OFFICIAL Skill Audit Loop ─────
//
// Generalizes the 2-frontier `run-bidirectional-enrich.js` into the N-agent panel
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
//   Phase 4  Bidirectional eval GUARDRAIL (Opus⇄GPT) on the ENRICHED skill +
//            keep-or-revert. Advisory NEVER sets the verdict. (Reused unchanged.)
//   Phase 5  Apply-on-keep; the caller commits per skill.
//
// Asymmetry (user's constraint): a MANDATORY frontier failure ABORTS; an ADVISORY
// failure is recorded and skipped, never blocks. The advisory tier widens the search;
// the certifying floor is always the two frontier models.
//
// Like run-bidirectional-enrich.js this is PURE orchestration with every live
// operation injected via `deps`, so the whole path runs offline under a stub (CI) and
// the curation step stays an editorial frontier-model act, not a deterministic script.
//
// Design spec: docs/plans (multi-agent-panel-enrich). Reuses validateAntiLoss /
// decideKeepOrRevert / qualityRank from run-bidirectional-enrich and runBidirectionalEval.
// READ FIRST: docs/audit-loop-enrich-philosophy.md (enrich-not-strip; eval is a guardrail).
//
// Private-content boundary (HARD): research scope is the PUBLIC skill-graph repo +
// skills tree + the open web — never Sales Hub / Printify / Shopify / customer / bank /
// personal data. The live deps enforce the fence; this orchestrator never touches fs.

const path = require('path');
const { FRONTIER_PAIR, ADVISORY_MODELS, REGISTRY_VERSION } = require('../audit-shared/model-provider');
const { runBidirectionalEval } = require('./run-bidirectional-eval');
const { validateAntiLoss, decideKeepOrRevert } = require('./run-bidirectional-enrich');

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
function runConvergence({ skill, skillDir, proposals, deps, policy, log = () => {} }) {
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

    // ── cross-review: every alive agent reviews every OTHER alive proposal ──
    const feedback = [];
    for (const reviewer of alive) {
      const others = alive
        .filter((p) => p.model !== reviewer.model)
        .map((p) => ({ model: p.model, proposalPath: p.proposalPath, noveltyMemoPath: p.noveltyMemoPath, tier: p.tier }));
      log(`  ↳ ${reviewer.model} (${reviewer.tier}) reviewing ${others.length} other proposal(s)…`);
      let res;
      try {
        res = deps.crossReview({
          skill, reviewerModel: reviewer.model, reviewerTier: reviewer.tier,
          ownProposalPath: reviewer.proposalPath, otherProposals: others, round,
          artifactsDir: reviewer.artifactsDir,
        });
      } catch (e) { res = { ok: false, error: e.message }; }
      if (!res || res.ok === false) {
        reviewer.alive = false;
        reviewer.error = (res && res.error) || 'crossReview failed';
        continue;
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
    for (const agent of proposals.filter((p) => p.alive)) {
      const mine = feedback.filter((f) => f && f.targetModel === agent.model);
      log(`  ↳ ${agent.model} (${agent.tier}) revising with ${mine.length} feedback item(s)…`);
      let res;
      try {
        res = deps.reviseProposal({
          skill, skillDir, reviserModel: agent.model, reviserTier: agent.tier,
          ownProposalPath: agent.proposalPath, feedbackForMe: mine, round,
          artifactsDir: agent.artifactsDir,
        });
      } catch (e) { res = { ok: false, error: e.message }; }
      if (!res || res.ok === false) {
        agent.alive = false;
        agent.error = (res && res.error) || 'reviseProposal failed';
        continue;
      }
      const newHash = res.contentHash
        || (typeof deps.hashProposal === 'function' ? deps.hashProposal(res.proposalPath || agent.proposalPath) : agent.contentHash);
      // HASH-AUTHORITATIVE: a content change is a change regardless of the agent's
      // self-report (an agent may claim changed:false while emitting a different file).
      const didChange = newHash !== agent.contentHash;
      if (didChange) changedCount += 1;
      agent.proposalPath = res.proposalPath || agent.proposalPath;
      agent.noveltyMemoPath = res.noveltyMemoPath || agent.noveltyMemoPath;
      agent.contentHash = newHash;
      agent.round = round;
    }

    const aliveNow = proposals.filter((p) => p.alive);
    const stableFraction = aliveNow.length ? (aliveNow.length - changedCount) / aliveNow.length : 1;
    history.push({ round, phase: 'revise', aliveCount: aliveNow.length, changedCount, stableFraction });
    log(`  round ${round} done: ${changedCount}/${aliveNow.length} changed, stability=${stableFraction.toFixed(2)} (need ≥${policy.stabilityThreshold})`);

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
 * Run one skill's multi-agent panel enrich cycle. See module header for phases.
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
 * @returns {object} combined panel-enrich + eval provenance record.
 */
function runPanelEnrich(opts = {}) {
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
  } = opts;

  if (!skill || !skillDir || !cwd) {
    throw new Error('runPanelEnrich: skill, skillDir, and cwd are required.');
  }
  if (!Array.isArray(mandatoryModels) || mandatoryModels.length !== 2) {
    throw new Error('runPanelEnrich: mandatoryModels must be a 2-element array (the certifying frontier floor).');
  }
  const required = ['buildResearchBrief', 'claimSlot', 'researchAndPropose', 'releaseSlot', 'curate', 'crossReview', 'reviseProposal', 'hashProposal'];
  if (Array.isArray(advisoryModels) && advisoryModels.length > 0) {
    required.push('researchAndProposeAdvisory', 'claimAdvisorySlot');
  }
  for (const fn of required) {
    if (typeof deps[fn] !== 'function') {
      throw new Error(`runPanelEnrich: deps.${fn} must be a function (dependency injection required).`);
    }
  }
  const policy = { ...DEFAULT_CONVERGENCE, ...convergence };

  log(`panel-enrich START · skill=${skill} · mandatory=[${mandatoryModels.join(', ')}] · advisory=[${(advisoryModels || []).join(', ') || 'none'}] · maxRounds=${policy.maxRounds}`);
  const brief = deps.buildResearchBrief(skillDir, skill) || '';
  log(`phase 0 · research brief built (${brief.length} chars)`);
  const currentSkillPath = path.join(skillDir, 'SKILL.md');

  const proposals = [];

  // ── Phase 1a — MANDATORY proposals (failure ABORTS) ──
  for (const model of mandatoryModels) {
    log(`phase 1a · mandatory propose: ${model} — dispatching (this is a multi-minute live call; output buffers until it returns)…`);
    const slot = deps.claimSlot({ skill, model });
    try {
      const p = deps.researchAndPropose({ skill, skillDir, model, brief, artifactsDir: slot && slot.artifactsDir });
      proposals.push({
        model, tier: 'mandatory', proposalPath: p.proposalPath, noveltyMemoPath: p.noveltyMemoPath || null,
        round: 0, contentHash: deps.hashProposal(p.proposalPath), alive: true, error: null,
        artifactsDir: slot && slot.artifactsDir,
      });
      log(`phase 1a · ✓ ${model} proposed → ${p.proposalPath}`);
      deps.releaseSlot({ skill, model, status: 'completed' });
    } catch (err) {
      deps.releaseSlot({ skill, model, status: 'aborted' });
      log(`phase 1a · ✗ ${model} FAILED: ${err.message} — mandatory failure ABORTS`);
      throw new Error(`panel-enrich: MANDATORY research/propose failed for ${skill} on ${model}: ${err.message}`);
    }
  }

  // ── Phase 1b — ADVISORY proposals (best-effort; failure recorded, never aborts) ──
  const advisoryFailures = [];
  const advisoryRequested = (Array.isArray(advisoryModels) ? advisoryModels : []).slice();
  if (advisoryRequested.length) log(`phase 1b · advisory propose: ${advisoryRequested.length} model(s) (best-effort; failures recorded, never abort)`);
  for (const model of advisoryRequested) {
    log(`phase 1b · advisory: ${model} — dispatching…`);
    let slot;
    try { slot = deps.claimAdvisorySlot({ skill, model }); } catch (e) { slot = { ok: false, error: e.message }; }
    if (slot && slot.ok === false) { advisoryFailures.push({ model, phase: 'claim', error: slot.error }); log(`phase 1b · ✗ ${model} claim failed: ${slot.error}`); continue; }
    let p;
    try { p = deps.researchAndProposeAdvisory({ skill, skillDir, model, brief, artifactsDir: slot && slot.artifactsDir }); }
    catch (e) { p = { ok: false, error: e.message }; }
    if (!p || p.ok === false || !p.proposalPath) {
      advisoryFailures.push({ model, phase: 'propose', error: (p && p.error) || 'no proposal produced' });
      log(`phase 1b · ✗ ${model} skipped: ${(p && p.error) || 'no proposal produced'}`);
      try { deps.releaseSlot({ skill, model, status: 'aborted' }); } catch (_) { /* best-effort */ }
      continue;
    }
    proposals.push({
      model, tier: 'advisory', proposalPath: p.proposalPath, noveltyMemoPath: p.noveltyMemoPath || null,
      round: 0, contentHash: deps.hashProposal(p.proposalPath), alive: true, error: null,
      artifactsDir: slot && slot.artifactsDir,
    });
    log(`phase 1b · ✓ ${model} advised → ${p.proposalPath}`);
    try { deps.releaseSlot({ skill, model, status: 'completed' }); } catch (_) { /* best-effort */ }
  }

  // ── Phase 2 — cross-review, iterate to convergence ──
  const convergenceState = runConvergence({ skill, skillDir, proposals, deps, policy, log });
  log(`phase 2 · convergence ${convergenceState.converged ? 'reached' : 'ended'} after ${convergenceState.rounds} round(s) — ${convergenceState.reason}`);
  if (convergenceState.reason === 'quorum-collapsed') {
    throw new Error(`panel-enrich: mandatory quorum lost mid-convergence for ${skill} — a frontier model failed; aborting (the 2-frontier floor is required for a certifiable enrich).`);
  }

  const finalAlive = proposals.filter((p) => p.alive);
  const mandatoryFinal = finalAlive.filter((p) => p.tier === 'mandatory');
  const advisoryFinal = finalAlive.filter((p) => p.tier === 'advisory');

  // ── Phase 3 — synthesis (frontier curator; strict anti-loss on mandatory) ──
  log(`phase 3 · curate (frontier curator) — union-merging ${mandatoryFinal.length} mandatory + ${advisoryFinal.length} advisory proposal(s) under strict anti-loss…`);
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
      `panel-enrich: merge-ledger violates anti-loss for ${skill} — ${antiLoss.violations.length} bad drop(s): `
      + antiLoss.violations.map((v) => `[${v.id}] ${v.reason}`).join('; '),
    );
  }
  const coverage = validateMandatoryCoverage(merge && merge.mergeLedger, mandatoryFinal, mandatoryModels);
  if (!coverage.ok) {
    throw new Error(
      `panel-enrich: mandatory coverage gap for ${skill} — ${coverage.violations.map((v) => v.reason).join('; ')}`,
    );
  }

  // ── Phase 4 — bidirectional eval guardrail on the ENRICHED skill (reused) ──
  let evalSkillDir = skillDir;
  let evalCleanup = null;
  let enrichedEvalPrepared = false;
  if (merge && merge.mergedSkillPath && typeof deps.prepareEnrichedEval === 'function') {
    const prepared = deps.prepareEnrichedEval({ skill, skillDir, mergedSkillPath: merge.mergedSkillPath });
    if (prepared && prepared.evalSkillDir) {
      evalSkillDir = prepared.evalSkillDir;
      evalCleanup = prepared.cleanup;
      enrichedEvalPrepared = true;
    }
  }

  const evalArtifactName = evalMode === 'comprehension' ? 'comprehension.json' : 'application.json';
  const evalArtifactExists = (typeof deps.evalArtifactExists === 'function')
    ? Boolean(deps.evalArtifactExists({ skillDir, evalMode }))
    : true;
  let evalReceipt = null;
  let evalSkipReason = null;
  if (typeof deps.runEvalDirection !== 'function') {
    evalSkipReason = 'no direction runner injected (enrich-only / dry run) — eval deferred';
    log(`phase 4 · eval guardrail SKIPPED — ${evalSkipReason}`);
  } else if (!evalArtifactExists) {
    evalSkipReason = `no evals/${evalArtifactName} for ${skill} — eval guardrail skipped (absence of an eval is not a regression; keep the enriched skill)`;
    log(`phase 4 · eval guardrail SKIPPED — no evals/${evalArtifactName} (absence ≠ regression; keep)`);
  } else {
    log(`phase 4 · bidirectional eval guardrail (${evalMode}) on the enriched skill — dispatching…`);
    evalReceipt = runBidirectionalEval({
      mode: evalMode,
      skill,
      cwd,
      skillDir: evalSkillDir,
      mergeLedgerRef: merge && merge.mergeLedgerPath,
      deps: { runDirection: deps.runEvalDirection },
    });
  }

  // ── Phase 4b — keep-or-revert (GUARDRAIL ONLY; advisory never decides) ──
  const decision = evalReceipt
    ? decideKeepOrRevert(evalReceipt, { priorVerdict })
    : { keep: true, action: 'keep', reason: `eval guardrail not run (${evalSkipReason || 'eval deferred'}) — enriched skill kept` };
  log(`phase 4b · decision: ${decision.action.toUpperCase()} — ${decision.reason}`);

  // ── Phase 5 — apply on KEEP (the single point the canonical skill is mutated) ──
  let applied = false;
  if (decision.keep && merge && merge.mergedSkillPath && typeof deps.applyMerge === 'function') {
    log(`phase 5 · apply-on-keep — writing enriched SKILL.md to ${skillDir}…`);
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
    objective: 'enrich',
    mode: 'panel',
    mandatory_models: mandatoryModels.slice(),
    advisory_models_requested: advisoryRequested,
    advisory_models_alive: advisoryFinal.map((p) => p.model),
    advisory_failures: advisoryFailures,
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
    enriched_eval: enrichedEvalPrepared,
    eval: evalReceipt,
    keep_or_revert: decision,
    applied,
    registry_version: REGISTRY_VERSION,
  };
}

// ─── CLI ────────────────────────────────────────────────────────────────────────
// node lib/audit/run-panel-enrich.js --skill <slug> --skill-dir <dir> [--cwd <root>]
//   [--eval-mode application|comprehension] [--prior-verdict <V>] [--max-rounds N]
//   [--no-advisory] [--dry-run] [--no-eval]
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
    console.error('Usage: node lib/audit/run-panel-enrich.js --skill <slug> --skill-dir <dir> [--cwd <skill-graph-root>] [--eval-mode application|comprehension] [--prior-verdict <V>] [--max-rounds N] [--no-advisory] [--dry-run] [--no-eval]');
    process.exit(1);
  }
  const { createPanelEnrichDeps } = require('./panel-enrich-live-deps');
  const dryRun = Boolean(args['dry-run']);
  const noAdvisory = Boolean(args['no-advisory']);
  const deps = createPanelEnrichDeps({ skillGraphRoot: cwd, curatorModel: args.curator || undefined, dryRun });
  if (!args['no-eval'] && !dryRun) {
    deps.runEvalDirection = require('./evaluate-skill').runEvalDirection;
  }
  const convergence = {};
  if (args['max-rounds']) convergence.maxRounds = Number(args['max-rounds']);
  // Stream phase/agent progress to STDERR so a FOREGROUND run is visible live (the loop is
  // designed to run visibly, not as a polled black-box background process). Final result
  // JSON stays on STDOUT so batch drivers can parse it. --quiet silences the stream.
  const t0 = Date.now();
  const quiet = Boolean(args.quiet);
  const log = quiet ? () => {} : (msg) => {
    const s = Math.round((Date.now() - t0) / 1000);
    process.stderr.write(`[+${String(s).padStart(4)}s] ${msg}\n`);
  };
  const result = runPanelEnrich({
    skill,
    skillDir: path.resolve(skillDir),
    cwd: path.resolve(cwd),
    advisoryModels: noAdvisory ? [] : undefined,
    priorVerdict: args['prior-verdict'] || undefined,
    evalMode: args['eval-mode'] || 'application',
    convergence,
    deps,
    log,
  });
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.keep_or_revert && result.keep_or_revert.keep === false ? 2 : 0);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
  DEFAULT_CONVERGENCE,
  validateMandatoryCoverage,
  runConvergence,
  runPanelEnrich,
};
