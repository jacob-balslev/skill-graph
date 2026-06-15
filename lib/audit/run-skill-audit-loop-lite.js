'use strict';

// ─── Bidirectional Skill Audit Loop runner (Opus 4.8 ⇄ GPT-5.5) — 2-frontier lite ──
//
// The objective of the audit loop is CURATION: fold the strongest available
// knowledge for a skill's topic into the skill, toward the fullest, strongest
// curated knowledge — so an agent equipped with it produces the best solution.
// This orchestrator drives one skill's curate → eval-guardrail → keep-or-revert
// cycle. The eval is a GUARDRAIL, never the optimizer. READ FIRST:
// docs/skill-audit-loop-philosophy.md.
//
// Per skill:
//   1. Build the research brief (buildResearchBrief — repo grounding + relations
//      + reference URLs + .research feedback).
//   2. Open two frontier per-model audit slots (opus + gpt-5.5) and dispatch
//      EACH frontier model to research (repo + web, FULL tools, privacy-scoped) and
//      produce a proposal (changeset/rewrite) + a novelty memo. Both models run —
//      curation draws from the UNION of what two companies' best models know/find.
//   3. Curator (a frontier model, rotated to differ from the convener) runs the
//      union-curate merge under the --merge lock: it UNIONS both proposals + the
//      current SKILL.md into a RICHER SKILL.md, recording the merge-ledger v2 —
//      anti-loss: every valuable contribution is KEPT, or dropped ONLY with a
//      recorded reason (wrong/redundant/harmful — NEVER "didn't move the score").
//   4. Build the curated eval target (a temp copy whose SKILL.md is the merged
//      output) so the guardrail grades the curated skill, not the canonical
//      pre-curation version. The canonical skill is NOT mutated here.
//   5. Run the bidirectional EVAL guardrail (run-bidirectional-eval.js) on the
//      curated copy: tools-ON parity, cross-family, conservative reconciliation.
//   6. Keep-or-revert (GUARDRAIL ONLY) + apply-on-keep: keep the curated skill;
//      revert ONLY on a genuine quality/knowledge regression (HARMFUL / measurably
//      worse than the prior verdict) — NEVER to strip unscored knowledge. The
//      canonical skill is mutated ONLY on KEEP (applyMerge writes the working tree;
//      the caller commits). A REVERT applies nothing — canonical stays original, so
//      there is no unsafe git-revert-HEAD.
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
  NOT_DISCRIMINATED_CEILING: 3,
  EQUIVALENT_ON_FRONTIER: 3,
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
 * curation objective forbids pruning knowledge merely because a narrow A/B delta
 * failed to credit it (skill-audit-loop-philosophy.md § "WHY curate, never strip
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
  // The curate prompt (prompts/skill-audit-loop-curate-pass.md § ADVISORY DISPOSITION)
  // mandates a 5-value disposition vocabulary, NOT a binary kept/dropped:
  //   kept | incorporated  → contribution PRESERVED in the merge (no loss; no reason required)
  //   dropped | rejected   → contribution NOT folded in; anti-loss requires a wrong/redundant/harmful reason
  //   deferred-to-eval     → explicit non-silent disposition (handed to the eval phase to decide);
  //                          satisfies anti-loss (recorded + reasoned), neither a merge-kept nor a loss-by-drop.
  // This validator previously accepted only kept|dropped and rejected the richer vocabulary the
  // prompt itself instructs, aborting every real run at the merge-ledger gate.
  let deferred = 0;
  const KEPT_DISPOSITIONS = new Set(['kept', 'incorporated']);
  const DROP_DISPOSITIONS = new Set(['dropped', 'rejected']);
  const reasonOf = (c) => (c.drop_reason || c.reason || c.defer_reason || '').toString().trim();
  for (const c of contributions) {
    const disposition = c && c.disposition;
    if (KEPT_DISPOSITIONS.has(disposition)) { kept += 1; continue; }
    if (DROP_DISPOSITIONS.has(disposition)) {
      dropped += 1;
      const reason = reasonOf(c);
      if (!reason) {
        violations.push({ id: c.id, reason: `${disposition} with NO recorded reason (anti-loss requires a reason: wrong/redundant/harmful)` });
      } else if (BANNED_DROP_REASON.test(reason)) {
        violations.push({ id: c.id, reason: `${disposition} for an unscored/delta reason ("${reason}") — banned by curate-not-strip; only wrong/redundant/harmful justifies a drop` });
      }
      continue;
    }
    if (disposition === 'deferred-to-eval') {
      deferred += 1;
      const reason = reasonOf(c);
      if (!reason) {
        violations.push({ id: c.id, reason: 'deferred-to-eval with NO recorded reason (anti-loss requires an explicit reason for the deferral)' });
      }
      continue;
    }
    violations.push({ id: c && c.id, reason: `unknown disposition ${JSON.stringify(disposition)} (expected 'kept'|'incorporated'|'dropped'|'rejected'|'deferred-to-eval')` });
  }
  return { ok: violations.length === 0, violations, kept, dropped, deferred };
}

/**
 * No-op curation guard. A curate that produces a SKILL.md byte-identical to the
 * pre-curation canonical is suspicious: either the curator silently did nothing (a
 * lost run) or it genuinely judged the skill already optimal — and those two cases
 * must be DISTINGUISHED, not conflated. A byte-identical curation is only legitimate
 * when the merge-ledger EXPLICITLY records `curation_decision: 'already-optimal'`.
 * Otherwise it is a guard violation (the curator produced no change without declaring
 * the no-op intentional).
 *
 * Pure (operates on two precomputed hashes + the ledger) so the orchestrators stay
 * fs-free — they compute the hashes via the injected hashProposal and pass them here.
 *
 * @param {object}  opts
 * @param {string}  opts.currentHash  hash of the pre-curation canonical SKILL.md.
 * @param {string}  opts.mergedHash   hash of the curator's merged SKILL.md.
 * @param {object} [opts.ledger]      the merge-ledger (read for curation_decision).
 * @returns {{ ok: boolean, changed: boolean, declaredNoop: boolean, reason: string }}
 */
function validateCurationChanged({ currentHash, mergedHash, ledger } = {}) {
  const changed = currentHash != null && mergedHash != null && currentHash !== mergedHash;
  const declaredNoop = Boolean(ledger && ledger.curation_decision === 'already-optimal');
  if (changed) {
    return { ok: true, changed: true, declaredNoop, reason: 'curation produced a real content change' };
  }
  if (declaredNoop) {
    return { ok: true, changed: false, declaredNoop: true, reason: "curation is byte-identical but the ledger declares curation_decision:'already-optimal' (intentional no-op)" };
  }
  return {
    ok: false,
    changed: false,
    declaredNoop: false,
    reason: "curation produced a byte-identical SKILL.md with no curation_decision:'already-optimal' in the merge-ledger — a silent no-op curation (curator did nothing, or did not declare the skill already-optimal)",
  };
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
  //    regression, so reverting on it would discard curation for a measurement
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
    return { keep: false, action: 'revert', reason: `curation produced a genuinely harmful verdict (${verdict}) — revert the curate commit` };
  }
  // 2. Measurably worse than the prior recorded verdict ⇒ revert. Only when prior
  //    was a real graded verdict and the new one dropped beneath it.
  if (priorVerdict && qualityRank(verdict) < qualityRank(priorVerdict)) {
    return { keep: false, action: 'revert', reason: `synthesized verdict ${verdict} is measurably worse than prior ${priorVerdict} — knowledge regression, revert` };
  }
  // 3. Everything else ⇒ KEEP. Crucially: a non-improving or UNVERIFIED guardrail
  //    result is NOT a reason to revert or strip. The eval is too narrow to see all
  //    the value; absence of measured lift is not evidence of absence of value.
  return { keep: true, action: 'keep', reason: `keep curated skill (verdict=${verdict || 'unscored'}); the eval is a guardrail — non-lift is not a regression and never grounds to strip knowledge` };
}

/**
 * Run one skill's bidirectional curate → eval-guardrail → keep-or-revert cycle.
 *
 * @param {object}   opts
 * @param {string}   opts.skill           Skill slug.
 * @param {string}   opts.skillDir         Absolute skill directory (contains SKILL.md).
 * @param {string}   opts.cwd              skill-graph repo root (the public-content fence + eval cwd).
 * @param {string[]} [opts.frontierPair]   The two frontier models (default FRONTIER_PAIR).
 * @param {string}   [opts.priorVerdict]   The skill's prior verdict (for the regression check).
 * @param {'comprehension'} [opts.evalMode]  Guardrail mode (default 'comprehension').
 * @param {object}   opts.deps             Injected live operations (see module JSDoc):
 *   @param {Function} opts.deps.buildResearchBrief  (skillDir, skill) => string
 *   @param {Function} opts.deps.claimSlot           ({ skill, model }) => { run_id, artifactsDir }
 *   @param {Function} opts.deps.researchAndPropose  ({ skill, skillDir, model, brief, artifactsDir }) => { proposalPath, noveltyMemoPath }
 *   @param {Function} opts.deps.releaseSlot         ({ skill, model, status }) => void
 *   @param {Function} opts.deps.curate              ({ skill, skillDir, proposals, currentSkillPath }) => { mergedSkillPath, mergeLedger, mergeLedgerPath }
 *   @param {Function} [opts.deps.prepareCandidateEval] ({ skill, skillDir, mergedSkillPath }) => { evalSkillDir, cleanup? }. Returns a temp skill dir whose SKILL.md is the curated merge so the guardrail grades the curated skill (SH-6686). If omitted, the eval falls back to the canonical skillDir.
 *   @param {Function} [opts.deps.applyMerge]        ({ skill, skillDir, mergedSkillPath }) => void. Applies the curated SKILL.md to the canonical working tree. Called ONLY when keep-or-revert decides KEEP — the single point the canonical skill is mutated. A REVERT never applies (canonical stays original), so there is no git-revert-HEAD.
 *   @param {Function} [opts.deps.runEvalDirection]  the runDirection for run-bidirectional-eval (tools-ON, per-direction model). If omitted, the eval guardrail is SKIPPED and recorded as such.
 * @returns {object} Combined curation + eval provenance record.
 */
function runSkillAuditLoopLite(opts = {}) {
  const {
    skill,
    skillDir,
    cwd,
    frontierPair = FRONTIER_PAIR,
    priorVerdict,
    evalMode = 'comprehension',
    deps = {},
  } = opts;

  if (!skill || !skillDir || !cwd) {
    throw new Error('runSkillAuditLoopLite: skill, skillDir, and cwd are required.');
  }
  for (const fn of ['buildResearchBrief', 'claimSlot', 'researchAndPropose', 'releaseSlot', 'curate']) {
    if (typeof deps[fn] !== 'function') {
      throw new Error(`runSkillAuditLoopLite: deps.${fn} must be a function (dependency injection required).`);
    }
  }
  if (!Array.isArray(frontierPair) || frontierPair.length !== 2) {
    throw new Error('runSkillAuditLoopLite: frontierPair must be a 2-element array.');
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
      throw new Error(`skill-audit-loop: research/propose failed for ${skill} on ${model}: ${err.message}`);
    }
  }

  // 3. Curator union-curate merge (anti-loss). Curation is a frontier-model
  //    editorial act; the orchestrator only sequences it and VALIDATES anti-loss.
  const merge = deps.curate({ skill, skillDir, proposals, currentSkillPath });
  const antiLoss = validateAntiLoss(merge && merge.mergeLedger);
  if (!antiLoss.ok) {
    // The curator dropped a contribution without a valid reason — the curate
    // objective is violated. Surface it hard; do NOT silently accept a lossy merge.
    throw new Error(
      `skill-audit-loop: merge-ledger violates anti-loss for ${skill} — ${antiLoss.violations.length} bad drop(s): `
      + antiLoss.violations.map((v) => `[${v.id}] ${v.reason}`).join('; '),
    );
  }

  // No-op curation guard (F3): a byte-identical curated SKILL.md is only legitimate when the
  // ledger declares curation_decision:'already-optimal'. Run only when a hashProposal dep is
  // available (the live deps supply it); pure DI tests without it skip the guard.
  if (typeof deps.hashProposal === 'function' && merge && merge.mergedSkillPath) {
    const curationChange = validateCurationChanged({
      currentHash: deps.hashProposal(currentSkillPath),
      mergedHash: deps.hashProposal(merge.mergedSkillPath),
      ledger: merge.mergeLedger,
    });
    if (!curationChange.ok) {
      throw new Error(`skill-audit-loop: no-op curation for ${skill} — ${curationChange.reason}`);
    }
  }

  // 4. Build the curated eval target (SH-6686). The guardrail must grade the
  //    curated skill, NOT the canonical pre-curation version — otherwise keep-or-revert
  //    decides on a skill that was never changed. `prepareCandidateEval` returns a temp
  //    skill dir whose SKILL.md is the curator's merged output; the canonical skill is
  //    NOT mutated here. When the dep is absent (curate-only / back-compat), the eval
  //    falls back to the canonical skillDir (and we record that it did).
  let evalSkillDir = skillDir;
  // baselineEvalSkillDir is the skill-ABSENT twin of the eval dir: the baseline arm
  // runs there (research tools ON) so it cannot filesystem-read the candidate SKILL.md
  // it is meant to be blind to. The with-skill arm gets the curated skill in-prompt.
  // Null until prepared; when null the eval baseline arm defaults to the (skill-absent)
  // execution-profile cwd. (Plan E — eval baseline fence.)
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

  // 5. Bidirectional EVAL guardrail (tools-ON parity, cross-family) on the curated
  //    skill. Skipped when (a) no direction runner is injected (curate-only dry run),
  //    OR (b) the skill has no eval artifact for this mode. (b) is NOT a failure: the
  //    eval is a GUARDRAIL, and absence of an eval is never a regression — a skill that
  //    cannot be graded is KEPT (curate succeeded), not crashed. Before this guard, a
  //    missing evals/<mode>.json threw ENOENT deep in runApplicationEval and discarded
  //    the entire (successful) curation (SKI: pilot best-practice 2026-06-05). The
  //    curated eval dir is a recursive copy of the canonical skillDir, so the canonical
  //    artifact's presence is authoritative for whether the copy can be graded.
  // Artifact existence is an INJECTED predicate (default true) so the orchestrator
  // stays pure/fs-free and the unit DI tests (synthetic skillDirs) are unaffected.
  // The LIVE deps supply deps.evalArtifactExists = fs.existsSync(evals/<mode>.json);
  // when the artifact is absent the guardrail is skipped (NOT a regression — keep), and
  // that decision is RECORDED in the receipt (F2: eval_status ABSENT + eval_certified false).
  const evalArtifactName = 'comprehension.json';
  const evalArtifactExists = (typeof deps.evalArtifactExists === 'function')
    ? Boolean(deps.evalArtifactExists({ skillDir, evalMode }))
    : true;
  let evalReceipt = null;
  let evalSkipReason = null;
  let evalStatus = 'RUN'; // RUN | ABSENT | DEFERRED — recorded explicitly in the receipt (F2)
  if (typeof deps.runEvalDirection !== 'function') {
    evalSkipReason = 'no direction runner injected (curate-only / dry run) — eval deferred';
    evalStatus = 'DEFERRED';
  } else if (!evalArtifactExists) {
    evalSkipReason = `no evals/${evalArtifactName} for ${skill} — eval guardrail skipped (absence of an eval is not a regression; keep the curated skill)`;
    evalStatus = 'ABSENT';
  } else {
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

  // 6. Keep-or-revert (GUARDRAIL ONLY).
  const decision = evalReceipt
    ? decideKeepOrRevert(evalReceipt, { priorVerdict })
    : { keep: true, action: 'keep', reason: `eval guardrail not run (${evalSkipReason || 'eval deferred'}) — curated skill kept` };

  // 7. Apply on KEEP — the ONLY point the canonical skill is mutated (SH-6686). This
  //    replaces the old, unsafe `git revert HEAD` path: because the canonical skill is
  //    untouched until KEEP, a REVERT needs no restore — it simply does NOT apply, and
  //    the canonical skill is already in its original state. Applying writes the
  //    curated SKILL.md to the working tree; the caller (CLI/operator) reviews + commits
  //    — we never auto-commit or push a public skill.
  let applied = false;
  if (decision.keep && merge && merge.mergedSkillPath && typeof deps.applyMerge === 'function') {
    // applyMerge returns { applied: <canonical-path|null> }; null = not applied (e.g.
    // a dry run that must not mutate a real skill).
    const applyResult = deps.applyMerge({ skill, skillDir, mergedSkillPath: merge.mergedSkillPath });
    applied = Boolean(applyResult && applyResult.applied);
  }
  if (typeof evalCleanup === 'function') {
    try { evalCleanup(); } catch (_) { /* best-effort temp cleanup — never fail the run on it */ }
  }

  return {
    skill,
    frontier_pair: [frontierPair[0], frontierPair[1]],
    objective: 'skill-audit-loop',
    proposals: proposals.map((p) => ({ model: p.model, proposalPath: p.proposalPath || null, noveltyMemoPath: p.noveltyMemoPath || null })),
    merge: {
      mergedSkillPath: merge && merge.mergedSkillPath,
      mergeLedgerPath: merge && merge.mergeLedgerPath,
      anti_loss: antiLoss,
    },
    eval_skill_dir: candidateEvalPrepared ? evalSkillDir : null,
    baseline_eval_skill_dir: candidateEvalPrepared ? baselineEvalSkillDir : null,
    candidate_eval: candidateEvalPrepared,
    eval: evalReceipt,
    // F2 — explicit, recorded eval-absent decision (never a silent keep-on-absence default).
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

// ─── CLI ──────────────────────────────────────────────────────────────────────
// node lib/audit/run-skill-audit-loop-lite.js --skill <slug> --skill-dir <dir>
//   [--cwd <skill-graph-root>] [--eval-mode comprehension]
//   [--prior-verdict <V>] [--curator <model>] [--dry-run] [--no-eval]
//
// Drives ONE skill's bidirectional curate → eval-guardrail → keep-or-revert cycle
// with the LIVE production deps (lib/audit/skill-audit-loop-lite-deps.js). --dry-run stubs the
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
    console.error('Usage: node lib/audit/run-skill-audit-loop-lite.js --skill <slug> --skill-dir <dir> [--cwd <skill-graph-root>] [--eval-mode comprehension] [--prior-verdict <V>] [--curator <model>] [--dry-run] [--no-eval]');
    process.exit(1);
  }
  // Lazy require so the unit tests (which inject deps) never load the live shell-out module.
  const { createSkillAuditLoopLiteDeps } = require('./skill-audit-loop-lite-deps');
  const dryRun = Boolean(args['dry-run']);
  const deps = createSkillAuditLoopLiteDeps({
    skillGraphRoot: cwd,
    curatorModel: args.curator || undefined,
    dryRun,
  });
  if (!args['no-eval'] && !dryRun) {
    deps.runEvalDirection = require('./evaluate-skill').runEvalDirection;
  }
  const result = runSkillAuditLoopLite({
    skill,
    skillDir: path.resolve(skillDir),
    cwd: path.resolve(cwd),
    priorVerdict: args['prior-verdict'] || undefined,
    evalMode: args['eval-mode'] || 'comprehension',
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
  validateCurationChanged,
  decideKeepOrRevert,
  runSkillAuditLoopLite,
};
