'use strict';

// ─── Bidirectional EVAL guardrail (Opus 4.8 ⇄ GPT-5.5), tools-ON parity ───────
//
// This is the EVAL GUARDRAIL of the two-frontier audit loop — NOT the objective.
// The objective is enrichment (lib/audit/run-bidirectional-enrich.js); this run
// only confirms the enriched skill genuinely helps a real, tool-enabled frontier
// agent and did not regress or turn harmful. It must never be used to strip
// knowledge that failed to move a narrow score. See
// docs/audit-loop-enrich-philosophy.md § "WHY enrich, never strip to a delta".
//
// Two directions, each an independent CROSS-FAMILY certifying run under an
// IDENTICAL tools-ON execution profile (the only variable is the model):
//   Direction A: Opus generates      → GPT-5.5 grades.
//   Direction B: GPT-5.5 generates    → Opus grades.
// Reconciled CONSERVATIVELY (synthesize-bidirectional.reconcile): the more
// skeptical verdict wins, so APPLICABLE/PASS is reachable ONLY when BOTH frontier
// directions independently reach it — i.e. the skill helps BOTH models the user
// actually deploys on. A `parity_ok:false` (the two directions ran under
// different permissions) makes the whole run INVALID — it may never certify.
//
// Dependency-injection contract (so this is unit-testable without live CLIs and
// reusable by the enrich orchestrator and a thin CLI):
//   runBidirectionalEval({ mode, skill, cwd, deps: { runDirection }, ... })
//     deps.runDirection({ direction, generatorModel, graderModel,
//                         generatorFamily, graderFamily, executionProfile,
//                         mode, evalFile, skillDir, workspace })
//       => { verdict, certification_tier, execution_profile, ...receiptFields }
// The injected runDirection is what actually shells the eval (it wraps
// evaluate-skill.js's runComprehensionEval / runApplicationEval with the
// direction's models + the tools-ON execution profile). This module owns ONLY
// the sequencing, parity assertion, conservative reconciliation, and the combined
// receipt — never model selection beyond the frontier-pair swap.

const { FRONTIER_PAIR, otherFrontier, REGISTRY_VERSION } = require('../audit-shared/model-provider');
const { reconcile } = require('../audit-shared/synthesize-bidirectional');
const { resolveCertificationTier } = require('../audit-shared/certification');
const { buildExecutionProfile, assertParity } = require('./eval-execution-profile');

// Strong (certifying) verdicts that may only stand on a parity-OK, both-directions-
// certifying run. When the run is not certifying-clean, these cap to PROVISIONAL.
const CERTIFYING_VERDICTS = new Set(['APPLICABLE', 'PASS']);

/**
 * Run the two-frontier bidirectional eval guardrail for one skill.
 *
 * @param {object}  opts
 * @param {'application'|'comprehension'} opts.mode
 * @param {string}  opts.skill          Skill slug (for the receipt / logging).
 * @param {string}  opts.cwd            Working directory — the skill-graph repo root
 *                                      (the public-content fence). Used to build the
 *                                      shared tools-ON execution profile.
 * @param {string} [opts.skillDir]      Absolute skill dir (passed through to runDirection).
 * @param {string} [opts.evalFile]      Eval file path (passed through to runDirection).
 * @param {string} [opts.workspace]     Workspace override (passed through to runDirection).
 * @param {string[]} [opts.frontierPair] Override the frontier pair (default FRONTIER_PAIR).
 * @param {string} [opts.mergeLedgerRef] Link to the enrichment merge-ledger so the
 *                                      enrichment provenance and the eval provenance
 *                                      are one record (SH-6663).
 * @param {object}  opts.deps
 * @param {Function} opts.deps.runDirection  (params) => direction receipt (see module JSDoc).
 * @returns {object} The combined bidirectional receipt.
 */
function runBidirectionalEval(opts = {}) {
  const {
    mode,
    skill,
    cwd,
    skillDir,
    evalFile,
    workspace,
    frontierPair = FRONTIER_PAIR,
    mergeLedgerRef,
    deps = {},
  } = opts;

  if (mode !== 'application' && mode !== 'comprehension') {
    throw new Error(`runBidirectionalEval: mode must be 'application' | 'comprehension' (got '${mode}')`);
  }
  if (typeof deps.runDirection !== 'function') {
    throw new Error('runBidirectionalEval: deps.runDirection must be a function (dependency injection required).');
  }
  if (!Array.isArray(frontierPair) || frontierPair.length !== 2) {
    throw new Error('runBidirectionalEval: frontierPair must be a 2-element array.');
  }

  // ONE shared execution profile, handed to BOTH directions byte-identical. The
  // only variable across the two directions is the model.
  const executionProfile = buildExecutionProfile({ cwd });

  const [modelA, modelB] = frontierPair;
  // Swap roles across the two directions; otherFrontier throws if a non-frontier
  // alias is passed, so a frontier model can never be silently paired with a weak one.
  const dirAGenerator = modelA;
  const dirAGrader = otherFrontier(modelA); // = modelB
  const dirBGenerator = modelB;
  const dirBGrader = otherFrontier(modelB); // = modelA

  const common = { mode, skillDir, evalFile, workspace, executionProfile };

  const dirA = deps.runDirection({
    direction: 'A',
    generatorModel: dirAGenerator,
    graderModel: dirAGrader,
    generatorFamily: dirAGenerator,
    graderFamily: dirAGrader,
    ...common,
  });
  const dirB = deps.runDirection({
    direction: 'B',
    generatorModel: dirBGenerator,
    graderModel: dirBGrader,
    generatorFamily: dirBGenerator,
    graderFamily: dirBGrader,
    ...common,
  });

  // Conservative reconciliation — the more skeptical verdict wins.
  const reconciled = reconcile(dirA, dirB, { mode });

  // Parity assertion — both directions must have run under the SAME profile.
  const parity = assertParity(
    dirA && dirA.execution_profile,
    dirB && dirB.execution_profile,
  );

  // Each direction must independently be a cross-family certifying configuration.
  const certA = resolveCertificationTier({
    certifying: true,
    generatorFamily: dirAGenerator,
    graderFamily: dirAGrader,
  });
  const certB = resolveCertificationTier({
    certifying: true,
    generatorFamily: dirBGenerator,
    graderFamily: dirBGrader,
  });
  const bothCertifying = certA.tier === 'certifying' && certB.tier === 'certifying';

  // The run is certifying-clean ONLY when parity holds AND both directions are
  // cross-family certifying. Otherwise a strong verdict is capped to PROVISIONAL —
  // the in-code "never certify on an invalid/biased run".
  const certifyingClean = Boolean(parity.parity_ok) && bothCertifying;

  let synthesizedVerdict = reconciled.verdict;
  let capped = false;
  let capReason = null;
  if (!certifyingClean && CERTIFYING_VERDICTS.has(synthesizedVerdict)) {
    synthesizedVerdict = mode === 'application' ? 'PROVISIONAL' : 'PROVISIONAL';
    capped = true;
    capReason = !parity.parity_ok
      ? `parity failed (${parity.reason})`
      : `a direction was not cross-family certifying (A=${certA.tier}, B=${certB.tier})`;
  }

  return {
    mode,
    skill: skill || null,
    frontier_pair: [modelA, modelB],
    reconciliation: 'conservative',
    synthesized_verdict: synthesizedVerdict,
    reconciled_verdict_raw: reconciled.verdict,
    agreement: reconciled.agreement,
    verdict_capped: capped,
    cap_reason: capReason,
    certifying_clean: certifyingClean,
    parity,
    direction_a: dirA,
    direction_b: dirB,
    direction_a_certification: certA,
    direction_b_certification: certB,
    execution_profile: executionProfile,
    merge_ledger_ref: mergeLedgerRef || null,
    registry_version: REGISTRY_VERSION,
    note: reconciled.note || null,
  };
}

module.exports = {
  CERTIFYING_VERDICTS,
  runBidirectionalEval,
};
