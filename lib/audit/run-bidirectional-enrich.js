'use strict';

// ─── Bidirectional ENRICH orchestrator (Opus 4.8 ⇄ GPT-5.5) — the PRIMARY op ──
//
// The objective of the audit loop is ENRICHMENT: fold the strongest available
// knowledge for a skill's topic into the skill, toward the fullest, strongest
// curated knowledge — so an agent equipped with it produces the best solution.
// This orchestrator drives one skill's enrich → eval-guardrail → keep-or-revert
// cycle. The eval is a GUARDRAIL, never the optimizer. READ FIRST:
// docs/audit-loop-enrich-philosophy.md.
//
// Per skill:
//   1. Build the research brief (buildResearchBrief — repo grounding + relations
//      + reference URLs + .research feedback).
//   2. Open two frontier per-model audit slots (opus + codex-current) and dispatch
//      EACH frontier model to research (repo + web, FULL tools, privacy-scoped) and
//      produce a proposal (changeset/rewrite) + a novelty memo. Both models run —
//      curation draws from the UNION of what two companies' best models know/find.
//   3. Curator (a frontier model, rotated to differ from the convener) runs the
//      union-curate merge under the --merge lock: it UNIONS both proposals + the
//      current SKILL.md into a RICHER SKILL.md, recording the merge-ledger v2 —
//      anti-loss: every valuable contribution is KEPT, or dropped ONLY with a
//      recorded reason (wrong/redundant/harmful — NEVER "didn't move the score").
//   4. Run the bidirectional EVAL guardrail (run-bidirectional-eval.js): tools-ON
//      parity, cross-family, conservative reconciliation.
//   5. Keep-or-revert (GUARDRAIL ONLY): keep the enriched skill; revert the enrich
//      commit ONLY on a genuine quality/knowledge regression (HARMFUL / measurably
//      worse than the prior verdict) — NEVER to strip unscored knowledge.
//
// The orchestrator OWNS sequencing, the anti-loss check, the keep-or-revert
// decision, and assembling the combined provenance record. It does NOT replace the
// curator's editorial judgment (curation is a frontier-model act) and it never
// selects a model beyond the frontier-pair swap. The live CLI dispatch (claim /
// research / curate) is injected via `deps` so this logic is unit-testable and the
// curation step stays an editorial act, not a deterministic script.
//
// Private-content boundary (HARD): research scope is the PUBLIC skill-graph repo +
// skills tree + the open web — never Sales Hub / Printify / Shopify / customer /
// bank / personal data. The execution profile fences cwd to the skill-graph repo;
// skill-audit-claim's `next`/`claim` already refuse private skills. See memory
// `skill-graph-private-content-boundary`.

const path = require('path');
const { FRONTIER_PAIR, REGISTRY_VERSION } = require('../audit-shared/model-provider');
const { runBidirectionalEval } = require('./run-bidirectional-eval');

// Verdicts that constitute a GENUINE regression — the only grounds for revert.
// A skill that became operationally harmful, or whose synthesized verdict is
// measurably worse than the prior recorded verdict, may be reverted. "Didn't move
// the score" / UNVERIFIED / a narrow non-improvement is NOT a regression.
const REGRESSION_VERDICTS = new Set(['HARMFUL', 'FALSE_POSITIVE']);

// Confidence/quality ordering used to decide "measurably worse than prior". Mirrors
// docs/verdict-semantics.md (APPLICABLE/PASS > PROVISIONAL > UNVERIFIED, negatives
// below). Higher = better.
const VERDICT_QUALITY_RANK = {
  APPLICABLE: 6,
  PASS: 6,
  PROVISIONAL: 5,
  MIXED: 4,
  REDUNDANT: 3,
  SHALLOW: 2,
  FALSE_POSITIVE: 1,
  HARMFUL: 0,
  UNVERIFIED: 3, // a neutral floor: never treat "not yet measured" as a regression target
};

function qualityRank(verdict) {
  if (verdict && Object.prototype.hasOwnProperty.call(VERDICT_QUALITY_RANK, verdict)) {
    return VERDICT_QUALITY_RANK[verdict];
  }
  return 3; // unknown verdict → neutral floor, never an automatic regression
}

/**
 * Validate the curator's merge-ledger against the anti-loss rule.
 *
 * Anti-loss (merge-protocol.md + docs/skill-audit-multimodel-merge-v2.md): every
 * contribution surfaced by either frontier model is either KEPT in the merged
 * skill, or dropped with a RECORDED REASON. A drop whose reason is empty, or whose
 * reason amounts to "didn't move the eval score / unscored", is a VIOLATION — the
 * enrich objective forbids pruning knowledge merely because a narrow A/B delta
 * failed to credit it (audit-loop-enrich-philosophy.md § "WHY enrich, never strip
 * to a delta").
 *
 * @param {object} ledger  The merge-ledger v2 object: { contributions: [{ id,
 *                 surfaced_by, corroborated_by?, evidence_strength?, disposition:
 *                 'kept'|'dropped', drop_reason?, format_loss? }], ... }
 * @returns {{ ok: boolean, violations: Array<{id:*, reason:string}>, kept:number, dropped:number }}
 */
function validateAntiLoss(ledger) {
  const violations = [];
  const contributions = (ledger && Array.isArray(ledger.contributions)) ? ledger.contributions : [];
  // GPT-5.5 review F10: an empty/missing ledger trivially "passes" the anti-loss
  // check (no drops to inspect) — but a union of two frontier proposals MUST record
  // its contributions. An empty ledger is itself a violation: either the merge
  // recorded nothing (lossy by omission) or the curator skipped the ledger.
  if (contributions.length === 0) {
    return {
      ok: false,
      violations: [{ id: null, reason: 'merge-ledger has no contributions — a union of two proposals must record every contribution (kept or dropped-with-reason); an empty ledger cannot prove anti-loss' }],
      kept: 0,
      dropped: 0,
    };
  }
  let kept = 0;
  let dropped = 0;
  // Phrasings that signal an illegitimate "unscored ⇒ pruned" drop. A drop must be
  // justified by wrong/redundant/harmful, never by absence of measured lift.
  const BANNED_DROP_REASON = /\b(didn'?t (move|raise|improve) (the )?(score|delta|eval)|unscored|no (measured )?lift|score(d)? (zero|nothing)|not credited by the eval)\b/i;
  for (const c of contributions) {
    const disposition = c && c.disposition;
    if (disposition === 'kept') { kept += 1; continue; }
    if (disposition === 'dropped') {
      dropped += 1;
      const reason = (c.drop_reason || '').toString().trim();
      if (!reason) {
        violations.push({ id: c.id, reason: 'dropped with NO recorded reason (anti-loss requires a reason: wrong/redundant/harmful)' });
      } else if (BANNED_DROP_REASON.test(reason)) {
        violations.push({ id: c.id, reason: `dropped for an unscored/delta reason ("${reason}") — banned by enrich-not-strip; only wrong/redundant/harmful justifies a drop` });
      }
      continue;
    }
    violations.push({ id: c && c.id, reason: `unknown disposition ${JSON.stringify(disposition)} (expected 'kept'|'dropped')` });
  }
  return { ok: violations.length === 0, violations, kept, dropped };
}

/**
 * Decide keep-or-revert from the bidirectional eval guardrail result. GUARDRAIL
 * ONLY — keep by default; revert ONLY on a genuine regression.
 *
 * @param {object} evalReceipt  Return of runBidirectionalEval (has synthesized_verdict).
 * @param {object} [opts]
 * @param {string} [opts.priorVerdict]  The skill's prior application/comprehension verdict.
 * @returns {{ keep: boolean, action: 'keep'|'revert', reason: string }}
 */
function decideKeepOrRevert(evalReceipt, { priorVerdict } = {}) {
  const verdict = evalReceipt && evalReceipt.synthesized_verdict;
  // 0. GPT-5.5 review F9: an INVALID or CAPPED run is INCONCLUSIVE — defer (keep),
  //    never revert. A parity failure, an unresolved model, or a not-cross-family
  //    run caps the verdict to PROVISIONAL; that confidence cap is NOT a quality
  //    regression, so reverting on it would discard enrichment for a measurement
  //    problem. Only a certifying-clean run may trigger a revert. (certifying_clean
  //    === false is the explicit invalid signal; undefined = a direct unit-test call
  //    that opts out of this gate.)
  if (evalReceipt && evalReceipt.certifying_clean === false) {
    return {
      keep: true,
      action: 'keep',
      reason: `eval run not certifying-clean (${evalReceipt.cap_reason || 'capped/invalid'}) — inconclusive; defer (keep), never revert on an invalid/capped run`,
    };
  }
  // 1. Operationally harmful / false-positive on the guardrail ⇒ revert. This is
  //    the skill becoming worse than baseline or over-triggering — a real defect.
  if (REGRESSION_VERDICTS.has(verdict)) {
    return { keep: false, action: 'revert', reason: `enrichment produced a genuinely harmful verdict (${verdict}) — revert the enrich commit` };
  }
  // 2. Measurably worse than the prior recorded verdict ⇒ revert. Only when prior
  //    was a real graded verdict and the new one dropped beneath it.
  if (priorVerdict && qualityRank(verdict) < qualityRank(priorVerdict)) {
    return { keep: false, action: 'revert', reason: `synthesized verdict ${verdict} is measurably worse than prior ${priorVerdict} — knowledge regression, revert` };
  }
  // 3. Everything else ⇒ KEEP. Crucially: a non-improving or UNVERIFIED guardrail
  //    result is NOT a reason to revert or strip. The eval is too narrow to see all
  //    the value; absence of measured lift is not evidence of absence of value.
  return { keep: true, action: 'keep', reason: `keep enriched skill (verdict=${verdict || 'unscored'}); the eval is a guardrail — non-lift is not a regression and never grounds to strip knowledge` };
}

/**
 * Run one skill's bidirectional enrich → eval-guardrail → keep-or-revert cycle.
 *
 * @param {object}   opts
 * @param {string}   opts.skill           Skill slug.
 * @param {string}   opts.skillDir         Absolute skill directory (contains SKILL.md).
 * @param {string}   opts.cwd              skill-graph repo root (the public-content fence + eval cwd).
 * @param {string[]} [opts.frontierPair]   The two frontier models (default FRONTIER_PAIR).
 * @param {string}   [opts.priorVerdict]   The skill's prior verdict (for the regression check).
 * @param {'application'|'comprehension'} [opts.evalMode]  Guardrail mode (default 'application').
 * @param {object}   opts.deps             Injected live operations (see module JSDoc):
 *   @param {Function} opts.deps.buildResearchBrief  (skillDir, skill) => string
 *   @param {Function} opts.deps.claimSlot           ({ skill, model }) => { run_id, artifactsDir }
 *   @param {Function} opts.deps.researchAndPropose  ({ skill, skillDir, model, brief, artifactsDir }) => { proposalPath, noveltyMemoPath }
 *   @param {Function} opts.deps.releaseSlot         ({ skill, model, status }) => void
 *   @param {Function} opts.deps.curate              ({ skill, skillDir, proposals, currentSkillPath }) => { mergedSkillPath, mergeLedger, mergeLedgerPath }
 *   @param {Function} [opts.deps.runEvalDirection]  the runDirection for run-bidirectional-eval (tools-ON, per-direction model). If omitted, the eval guardrail is SKIPPED and recorded as such.
 *   @param {Function} [opts.deps.revert]            ({ skill, reason }) => void  (only called when keep-or-revert decides revert)
 * @returns {object} Combined enrichment + eval provenance record.
 */
function runBidirectionalEnrich(opts = {}) {
  const {
    skill,
    skillDir,
    cwd,
    frontierPair = FRONTIER_PAIR,
    priorVerdict,
    evalMode = 'application',
    deps = {},
  } = opts;

  if (!skill || !skillDir || !cwd) {
    throw new Error('runBidirectionalEnrich: skill, skillDir, and cwd are required.');
  }
  for (const fn of ['buildResearchBrief', 'claimSlot', 'researchAndPropose', 'releaseSlot', 'curate']) {
    if (typeof deps[fn] !== 'function') {
      throw new Error(`runBidirectionalEnrich: deps.${fn} must be a function (dependency injection required).`);
    }
  }
  if (!Array.isArray(frontierPair) || frontierPair.length !== 2) {
    throw new Error('runBidirectionalEnrich: frontierPair must be a 2-element array.');
  }

  // 1. Research brief — repo grounding for BOTH frontier models.
  const brief = deps.buildResearchBrief(skillDir, skill) || '';
  const currentSkillPath = path.join(skillDir, 'SKILL.md');

  // 2. Per-model research + propose (UNION-of-knowledge — BOTH models run).
  const proposals = [];
  for (const model of frontierPair) {
    const slot = deps.claimSlot({ skill, model });
    try {
      const proposal = deps.researchAndPropose({
        skill,
        skillDir,
        model,
        brief,
        artifactsDir: slot && slot.artifactsDir,
      });
      proposals.push({ model, ...proposal });
      deps.releaseSlot({ skill, model, status: 'completed' });
    } catch (err) {
      deps.releaseSlot({ skill, model, status: 'aborted' });
      throw new Error(`enrich: research/propose failed for ${skill} on ${model}: ${err.message}`);
    }
  }

  // 3. Curator union-curate merge (anti-loss). Curation is a frontier-model
  //    editorial act; the orchestrator only sequences it and VALIDATES anti-loss.
  const merge = deps.curate({ skill, skillDir, proposals, currentSkillPath });
  const antiLoss = validateAntiLoss(merge && merge.mergeLedger);
  if (!antiLoss.ok) {
    // The curator dropped a contribution without a valid reason — the enrich
    // objective is violated. Surface it hard; do NOT silently accept a lossy merge.
    throw new Error(
      `enrich: merge-ledger violates anti-loss for ${skill} — ${antiLoss.violations.length} bad drop(s): `
      + antiLoss.violations.map((v) => `[${v.id}] ${v.reason}`).join('; '),
    );
  }

  // 4. Bidirectional EVAL guardrail (tools-ON parity, cross-family). Skipped only
  //    when no direction runner is injected (e.g. enrich-only dry run); recorded.
  let evalReceipt = null;
  if (typeof deps.runEvalDirection === 'function') {
    evalReceipt = runBidirectionalEval({
      mode: evalMode,
      skill,
      cwd,
      skillDir,
      mergeLedgerRef: merge && merge.mergeLedgerPath,
      deps: { runDirection: deps.runEvalDirection },
    });
  }

  // 5. Keep-or-revert (GUARDRAIL ONLY).
  const decision = evalReceipt
    ? decideKeepOrRevert(evalReceipt, { priorVerdict })
    : { keep: true, action: 'keep', reason: 'eval guardrail not run (no direction runner injected) — enriched skill kept, eval deferred' };

  if (!decision.keep && typeof deps.revert === 'function') {
    deps.revert({ skill, reason: decision.reason });
  }

  return {
    skill,
    frontier_pair: [frontierPair[0], frontierPair[1]],
    objective: 'enrich',
    proposals: proposals.map((p) => ({ model: p.model, proposalPath: p.proposalPath || null, noveltyMemoPath: p.noveltyMemoPath || null })),
    merge: {
      mergedSkillPath: merge && merge.mergedSkillPath,
      mergeLedgerPath: merge && merge.mergeLedgerPath,
      anti_loss: antiLoss,
    },
    eval: evalReceipt,
    keep_or_revert: decision,
    registry_version: REGISTRY_VERSION,
  };
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
// node lib/audit/run-bidirectional-enrich.js --skill <slug> --skill-dir <dir>
//   [--cwd <skill-graph-root>] [--eval-mode application|comprehension]
//   [--prior-verdict <V>] [--curator <model>] [--dry-run] [--no-eval]
//
// Drives ONE skill's bidirectional enrich → eval-guardrail → keep-or-revert cycle
// with the LIVE production deps (lib/audit/enrich-live-deps.js). --dry-run stubs the
// LLM dispatch so the whole orchestrator path runs offline (claim → propose → curate
// → anti-loss → keep) — that is the CI-verifiable wiring path; the live multi-model
// pilot (no --dry-run) verifies the actual model dispatch and writes CONTENT.
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
    console.error('Usage: node lib/audit/run-bidirectional-enrich.js --skill <slug> --skill-dir <dir> [--cwd <skill-graph-root>] [--eval-mode application|comprehension] [--prior-verdict <V>] [--curator <model>] [--dry-run] [--no-eval]');
    process.exit(1);
  }
  // Lazy require so the unit tests (which inject deps) never load the live shell-out module.
  const { createLiveEnrichDeps } = require('./enrich-live-deps');
  const dryRun = Boolean(args['dry-run']);
  const deps = createLiveEnrichDeps({
    skillGraphRoot: cwd,
    curatorModel: args.curator || undefined,
    dryRun,
  });
  // The eval guardrail runs unless --no-eval (or dry-run, which has no graded signal).
  if (!args['no-eval'] && !dryRun) {
    deps.runEvalDirection = require('./evaluate-skill').runEvalDirection;
  }
  const result = runBidirectionalEnrich({
    skill,
    skillDir: path.resolve(skillDir),
    cwd: path.resolve(cwd),
    priorVerdict: args['prior-verdict'] || undefined,
    evalMode: args['eval-mode'] || 'application',
    deps,
  });
  console.log(JSON.stringify(result, null, 2));
  // A revert decision exits non-zero so a loop can branch on it.
  process.exit(result.keep_or_revert && result.keep_or_revert.keep === false ? 2 : 0);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
  REGRESSION_VERDICTS,
  VERDICT_QUALITY_RANK,
  qualityRank,
  validateAntiLoss,
  decideKeepOrRevert,
  runBidirectionalEnrich,
};
