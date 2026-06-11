'use strict';

// ─── Bidirectional EVAL guardrail (Opus 4.8 ⇄ GPT-5.5), tools-ON parity ───────
//
// This is the EVAL GUARDRAIL of the two-frontier audit loop — NOT the objective.
// The objective is enrichment (lib/audit/run-skill-audit-loop-lite.js); this run
// only confirms the enriched skill genuinely helps a real, tool-enabled frontier
// agent and did not regress or turn harmful. It must never be used to strip
// knowledge that failed to move a narrow score. See
// docs/skill-audit-loop-philosophy.md § "WHY enrich, never strip to a delta".
//
// Two directions, named by which model GENERATES (the measured agent), each an
// independent CROSS-FAMILY certifying run under an IDENTICAL tools-ON execution
// profile (the only variable is the model):
//   Direction "Claude": Claude (opus) generates → Codex (gpt) grades.
//   Direction "Codex":  Codex (gpt) generates   → Claude (opus) grades.
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

const { FRONTIER_PAIR, otherFrontier, REGISTRY_VERSION, resolveModelDescriptor, ADVISORY_MODELS, resolveDisplayName } = require('../audit-shared/model-provider');
const { reconcile, capAtProvisional, APPLICATION_RANK, COMPREHENSION_RANK } = require('../audit-shared/synthesize-bidirectional');
const { resolveCertificationTier } = require('../audit-shared/certification');
const { buildExecutionProfile, assertParity } = require('./eval-execution-profile');

// Strong (certifying) verdicts that may only stand on a parity-OK, both-directions-
// certifying run. When the run is not certifying-clean, these cap to PROVISIONAL.
const CERTIFYING_VERDICTS = new Set(['APPLICABLE', 'PASS']);

function directionCalibrated(directionReceipt) {
  return Boolean(
    directionReceipt
      && (directionReceipt.calibrated === true || (directionReceipt.raw && directionReceipt.raw.calibrated === true)),
  );
}

function directionHasRedHerringCoverage(directionReceipt) {
  if (!directionReceipt) return false;
  const count = Number(
    directionReceipt.red_herring_cases_total
      ?? (directionReceipt.raw && directionReceipt.raw.red_herring_cases_total)
      ?? 0,
  );
  return count > 0;
}

/**
 * Advisory panel — breadth/novelty tier of the audit loop. Each advisory model
 * (Gemini 3.1 Pro + the free OpenCode Zen tier + Gemini Flash) is run as the
 * MEASURED generator, graded by a CORE frontier (Opus, top-tier, cross-family vs
 * every advisory model). That is measurement, not lesser-model quality-judging, so
 * `.claude/rules/no-lesser-models-for-quality.md` is honored: the grader is always
 * top-tier and the advisory verdicts NEVER feed the certifying reconciliation — they
 * record whether the skill ALSO helps non-deployed/cheaper agents (extra signal),
 * while certification stays with the Opus 4.8 ⇄ GPT-5.5 core.
 *
 * Heavy (one tools-ON eval per advisory model) → callers opt in. Returns an array of
 * { model, display, tier:'advisory', verdict?, grader?, error? }.
 *
 * @param {object} opts  Same shared eval inputs as runBidirectionalEval, plus
 *   advisoryModels (default ADVISORY_MODELS), graderModel (default a core frontier),
 *   and deps.runDirection (DI; defaults to evaluate-skill.runEvalDirection).
 */
function runAdvisoryPanel(opts = {}) {
  const {
    mode, skillDir, evalFile, workspace, baselineWorkspace, executionProfile,
    calibrationReceipt,
    advisoryModels = ADVISORY_MODELS,
    graderModel = FRONTIER_PAIR[0], // a CORE frontier (Opus) — top-tier + cross-family vs all advisory models
    deps = {},
  } = opts;
  const runDirection = (typeof deps.runDirection === 'function')
    ? deps.runDirection
    : require('./evaluate-skill').runEvalDirection;

  const panel = [];
  for (const m of advisoryModels) {
    const entry = { model: m, display: resolveDisplayName(m), tier: 'advisory' };
    try {
      const r = runDirection({
        direction: `advisory:${m}`,
        generatorModel: m,
        graderModel,
        generatorFamily: m,
        graderFamily: graderModel,
        mode, skillDir, evalFile, workspace, baselineWorkspace, executionProfile, calibrationReceipt,
      });
      entry.verdict = r && r.verdict;
      entry.grader = resolveDisplayName(graderModel);
    } catch (e) {
      entry.error = e.message;
    }
    panel.push(entry);
  }
  return panel;
}

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
    baselineWorkspace,
    calibrationReceipt,
    frontierPair = FRONTIER_PAIR,
    mergeLedgerRef,
    advisory = false, // opt-in advisory panel (breadth; never affects the verdict)
    deps = {},
  } = opts;

  if (mode !== 'application' && mode !== 'comprehension') {
    throw new Error(`runBidirectionalEval: mode must be 'application' | 'comprehension' (got '${mode}')`);
  }
  // Default the direction runner to the live wiring (evaluate-skill.runEvalDirection)
  // when none is injected. Lazy require avoids loading the 2k-line runner for the
  // unit tests that inject their own runDirection, and there is no cycle
  // (evaluate-skill does not require this module).
  const runDirection = (typeof deps.runDirection === 'function')
    ? deps.runDirection
    : require('./evaluate-skill').runEvalDirection;
  if (typeof runDirection !== 'function') {
    throw new Error('runBidirectionalEval: deps.runDirection must be a function (dependency injection required).');
  }
  if (!Array.isArray(frontierPair) || frontierPair.length !== 2) {
    throw new Error('runBidirectionalEval: frontierPair must be a 2-element array.');
  }

  // ONE shared execution profile, handed to BOTH directions byte-identical. The
  // only variable across the two directions is the model.
  const executionProfile = buildExecutionProfile({ cwd });

  // Directions are named by which model GENERATES (the measured agent). For the
  // canonical FRONTIER_PAIR [opus, gpt-5.5], the first direction's generator
  // is Claude (opus) and the second's is Codex (gpt-via-codex) — hence the labels.
  const [claudeModel, codexModel] = frontierPair;
  // Swap roles across the two directions; otherFrontier throws if a non-frontier
  // alias is passed, so a frontier model can never be silently paired with a weak one.
  const claudeDirGenerator = claudeModel;
  const claudeDirGrader = otherFrontier(claudeModel); // = codexModel
  const codexDirGenerator = codexModel;
  const codexDirGrader = otherFrontier(codexModel); // = claudeModel

  // baselineWorkspace fences the candidate SKILL.md out of the baseline arm (research
  // tools stay ON). Default to the execution-profile cwd (the skill-graph root, which
  // is provably skill-absent on the panel path) so the fence is enforced even when the
  // caller does not supply an explicit skill-absent dir.
  const common = {
    mode,
    skillDir,
    evalFile,
    workspace,
    baselineWorkspace: baselineWorkspace || executionProfile.cwd,
    executionProfile,
    calibrationReceipt,
  };

  const dirClaude = runDirection({
    direction: 'Claude',
    generatorModel: claudeDirGenerator,
    graderModel: claudeDirGrader,
    generatorFamily: claudeDirGenerator,
    graderFamily: claudeDirGrader,
    ...common,
  });
  const dirCodex = runDirection({
    direction: 'Codex',
    generatorModel: codexDirGenerator,
    graderModel: codexDirGrader,
    generatorFamily: codexDirGenerator,
    graderFamily: codexDirGrader,
    ...common,
  });

  // Conservative reconciliation — the more skeptical verdict wins.
  const reconciled = reconcile(dirClaude, dirCodex, { mode });

  // Parity assertion — both directions must have run under the SAME profile.
  const parity = assertParity(
    dirClaude && dirClaude.execution_profile,
    dirCodex && dirCodex.execution_profile,
  );

  // Each direction must independently be a cross-family certifying configuration.
  const certClaude = resolveCertificationTier({
    certifying: true,
    generatorFamily: claudeDirGenerator,
    graderFamily: claudeDirGrader,
  });
  const certCodex = resolveCertificationTier({
    certifying: true,
    generatorFamily: codexDirGenerator,
    graderFamily: codexDirGrader,
  });
  const bothCertifying = certClaude.tier === 'certifying' && certCodex.tier === 'certifying';

  // GPT-5.5 review F6: honest model provenance. A direction whose generator OR
  // grader model is the explicit 'latest-alias-unresolved' sentinel cannot prove
  // WHICH concrete model ran — the version-schema-contract caps that to PROVISIONAL
  // (never UNVERIFIED→APPLICABLE without provable evidence). An undefined
  // resolved_model (a DI test that doesn't track it) is NOT treated as unresolved;
  // only the explicit sentinel caps. The live runEvalDirection sets the sentinel
  // for gpt-5.5 until codex's resolved model is captured from its output
  // (tracked follow-up), so a real run honestly caps until that lands.
  const SENTINEL = 'latest-alias-unresolved';
  const dirUnresolved = (d) => Boolean(d) && (d.resolved_model === SENTINEL || d.resolved_generator_model === SENTINEL);
  const resolvedClean = !dirUnresolved(dirClaude) && !dirUnresolved(dirCodex);
  const calibrationClean = mode !== 'application' || (directionCalibrated(dirClaude) && directionCalibrated(dirCodex));
  const redHerringCoverageClean = mode !== 'application' || (directionHasRedHerringCoverage(dirClaude) && directionHasRedHerringCoverage(dirCodex));

  // The run is certifying-clean ONLY when parity holds AND both directions are
  // cross-family certifying AND both directions' models are resolved. Application
  // evals additionally need calibrated grading evidence and red-herring coverage.
  // Otherwise a strong verdict is capped to PROVISIONAL — the in-code "never certify
  // on an invalid / biased / unprovable run".
  const certifyingClean = Boolean(parity.parity_ok)
    && bothCertifying
    && resolvedClean
    && calibrationClean
    && redHerringCoverageClean;

  // SH-6682: per-family applicability. The GENERATOR is the measured agent, so each
  // direction measures whether the skill helps THAT generator's model family. A family
  // is "applicable" only when (a) the run is certifying-clean (parity + cross-family +
  // resolved — the same trust gate the aggregate uses) AND (b) that direction reached
  // the certifying verdict (APPLICABLE for application, PASS for comprehension). The
  // conservative aggregate stays THE verdict; this records the per-family nuance the
  // aggregate hides — e.g. a skill that helps Anthropic's model but not OpenAI's caps
  // the aggregate below APPLICABLE yet is honestly `applicable_for: 'anthropic'`.
  const CERTIFYING_VERDICT_BY_MODE = { application: 'APPLICABLE', comprehension: 'PASS' };
  const certVerdict = CERTIFYING_VERDICT_BY_MODE[mode];
  const providerOf = (family) => {
    try { return resolveModelDescriptor(family).provider; } catch (_) { return null; }
  };
  const applicableProviders = new Set();
  for (const d of [dirClaude, dirCodex]) {
    if (certifyingClean && d && d.verdict === certVerdict) {
      const p = providerOf(d.generator_family || d.generator_model);
      if (p) applicableProviders.add(p);
    }
  }
  const hasAnthropic = applicableProviders.has('anthropic');
  const hasOpenai = applicableProviders.has('openai');
  const applicableFor = (hasAnthropic && hasOpenai) ? 'both'
    : hasAnthropic ? 'anthropic'
      : hasOpenai ? 'openai'
        : 'neither';

  // Opt-in advisory panel — breadth/novelty only; computed AFTER reconciliation and
  // NEVER fed into it. Enable via opts.advisory or AUDIT_ADVISORY_PANEL=1.
  const wantAdvisory = advisory === true || process.env.AUDIT_ADVISORY_PANEL === '1';
  const advisoryPanel = wantAdvisory
    ? runAdvisoryPanel({ mode, skillDir, evalFile, workspace, baselineWorkspace: baselineWorkspace || executionProfile.cwd, executionProfile, calibrationReceipt, deps })
    : null;

  let synthesizedVerdict = reconciled.verdict;
  let capped = false;
  let capReason = null;
  if (!certifyingClean && CERTIFYING_VERDICTS.has(synthesizedVerdict)) {
    synthesizedVerdict = 'PROVISIONAL';
    capped = true;
    if (!parity.parity_ok) {
      capReason = `parity failed (${parity.reason})`;
    } else if (!bothCertifying) {
      capReason = `a direction was not cross-family certifying (Claude=${certClaude.tier}, Codex=${certCodex.tier})`;
    } else if (!resolvedClean) {
      capReason = `a direction's model is unresolved (${SENTINEL}) — cannot prove which concrete model ran`;
    } else if (!calibrationClean) {
      capReason = 'application grader is uncalibrated — cannot certify without a durable >=85% human-agreement receipt';
    } else {
      capReason = 'application eval lacks red_herring:true coverage — boundary behavior is untested';
    }
  }

  return {
    mode,
    skill: skill || null,
    frontier_pair: [claudeModel, codexModel],
    // Full human-readable names for OUTPUT (e.g. "Opus 4.8 ⇄ GPT-5.5") — never print
    // the bare aliases in reports/receipts (resolveDisplayName, registry DISPLAY_NAMES).
    frontier_pair_display: [resolveDisplayName(claudeModel), resolveDisplayName(codexModel)],
    reconciliation: 'conservative',
    synthesized_verdict: synthesizedVerdict,
    reconciled_verdict_raw: reconciled.verdict,
    applicable_for: applicableFor,
    agreement: reconciled.agreement,
    verdict_capped: capped,
    cap_reason: capReason,
    certifying_clean: certifyingClean,
    resolved_clean: resolvedClean,
    calibration_clean: calibrationClean,
    red_herring_coverage_clean: redHerringCoverageClean,
    parity,
    direction_claude: dirClaude,
    direction_codex: dirCodex,
    direction_claude_certification: certClaude,
    direction_codex_certification: certCodex,
    advisory_panel: advisoryPanel, // breadth/novelty tier; does NOT affect synthesized_verdict
    execution_profile: executionProfile,
    merge_ledger_ref: mergeLedgerRef || null,
    registry_version: REGISTRY_VERSION,
    note: reconciled.note || null,
  };
}

function roleForFrontier(model) {
  const descriptor = resolveModelDescriptor(model);
  if (descriptor.provider === 'anthropic') return 'Claude';
  if (descriptor.provider === 'openai') return 'Codex';
  return 'Single';
}

function rankTableForMode(mode) {
  if (mode === 'application') return APPLICATION_RANK;
  if (mode === 'comprehension') return COMPREHENSION_RANK;
  throw new Error(`runSingleFrontierEval: mode must be 'application' | 'comprehension' (got '${mode}')`);
}

/**
 * Run a lower-confidence eval when only one certifying frontier is currently available.
 * This is a degraded, explicit operator path: it keeps the loop moving during a provider
 * budget window, but it can never certify PASS/APPLICABLE. Strong single-direction
 * verdicts are capped at PROVISIONAL and the receipt asks a later full two-frontier run
 * to re-grade the skill.
 */
function runSingleFrontierEval(opts = {}) {
  const {
    mode,
    skill,
    cwd,
    skillDir,
    evalFile,
    workspace,
    baselineWorkspace,
    calibrationReceipt,
    frontierModel,
    missingFrontiers = [],
    provisionalReason = 'single_frontier_degraded_mode',
    mergeLedgerRef,
    deps = {},
  } = opts;

  if (mode !== 'application' && mode !== 'comprehension') {
    throw new Error(`runSingleFrontierEval: mode must be 'application' | 'comprehension' (got '${mode}')`);
  }
  if (!frontierModel) throw new Error('runSingleFrontierEval: frontierModel is required.');
  const runDirection = (typeof deps.runDirection === 'function')
    ? deps.runDirection
    : require('./evaluate-skill').runEvalDirection;
  if (typeof runDirection !== 'function') {
    throw new Error('runSingleFrontierEval: deps.runDirection must be a function (dependency injection required).');
  }

  const executionProfile = buildExecutionProfile({ cwd });
  const role = roleForFrontier(frontierModel);
  const common = {
    mode,
    skillDir,
    evalFile,
    workspace,
    baselineWorkspace: baselineWorkspace || executionProfile.cwd,
    executionProfile,
    calibrationReceipt,
  };
  const direction = runDirection({
    direction: role,
    generatorModel: frontierModel,
    graderModel: frontierModel,
    generatorFamily: frontierModel,
    graderFamily: frontierModel,
    ...common,
  });

  const table = rankTableForMode(mode);
  const rawVerdict = direction && direction.verdict;
  const synthesizedVerdict = capAtProvisional(table, rawVerdict);
  const capped = synthesizedVerdict !== rawVerdict;
  const missing = Array.isArray(missingFrontiers) ? missingFrontiers.slice() : [];

  return {
    mode,
    skill: skill || null,
    frontier_pair: [frontierModel],
    frontier_pair_display: [resolveDisplayName(frontierModel)],
    reconciliation: 'single-frontier-provisional',
    synthesized_verdict: synthesizedVerdict,
    reconciled_verdict_raw: rawVerdict,
    applicable_for: 'neither',
    agreement: false,
    verdict_capped: capped,
    cap_reason: capped
      ? `${provisionalReason}: ${rawVerdict} capped to PROVISIONAL because only ${frontierModel} ran`
      : provisionalReason,
    certifying_clean: false,
    resolved_clean: true,
    parity: {
      parity_ok: false,
      mismatches: [{ field: 'frontier_pair', left: frontierModel, right: missing.join(',') || null }],
      reason: `single-frontier degraded mode: missing ${missing.join(', ') || 'the second frontier'}`,
    },
    direction_single: direction,
    direction_claude: role === 'Claude' ? direction : null,
    direction_codex: role === 'Codex' ? direction : null,
    direction_claude_certification: role === 'Claude' ? { tier: 'provisional', reason: provisionalReason } : null,
    direction_codex_certification: role === 'Codex' ? { tier: 'provisional', reason: provisionalReason } : null,
    missing_frontiers: missing,
    provisional_reason: provisionalReason,
    regrade_required: true,
    advisory_panel: null,
    execution_profile: executionProfile,
    merge_ledger_ref: mergeLedgerRef || null,
    registry_version: REGISTRY_VERSION,
    note: `single-frontier degraded eval; full two-frontier re-grade required before certification`,
  };
}

/**
 * Normalize a runBidirectionalEval receipt into the shape the sidecar schema's
 * `eval_last_run.bidirectional` sub-object accepts (GPT-5.5 review F8). The runner's
 * native return carries extra working fields (direction_claude/direction_codex/parity
 * object, certification sub-objects); this projects ONLY the schema-allowed keys so a
 * written receipt validates. Keys mirror schemas/skill-audit-state.schema.json
 * eval_last_run.bidirectional.
 *
 * @param {object} r  A runBidirectionalEval return value.
 * @returns {object}  Schema-shaped bidirectional receipt.
 */
function toSidecarReceipt(r) {
  const mapDir = (d, role) => {
    if (!d) return { role };
    const out = { role };
    if (d.generator_model !== undefined) out.generator_model = d.generator_model;
    if (d.grader_model !== undefined) out.grader_model = d.grader_model;
    if (d.generator_family !== undefined) out.generator_family = d.generator_family;
    if (d.grader_family !== undefined) out.grader_family = d.grader_family;
    if (d.resolved_model !== undefined) out.resolved_model = d.resolved_model;
    if (d.verdict !== undefined) out.verdict = d.verdict;
    if (d.certification_tier !== undefined) out.certification_tier = d.certification_tier;
    return out;
  };
  const ep = r.execution_profile;
  const directions = Array.isArray(r.directions)
    ? r.directions
    : r.direction_single
      ? [mapDir(r.direction_single, r.direction_single.direction || 'Single')]
      : [mapDir(r.direction_claude, 'Claude'), mapDir(r.direction_codex, 'Codex')];
  const receipt = {
    frontier_pair: r.frontier_pair,
    reconciliation: r.reconciliation,
    agreement: r.agreement,
    parity_ok: r.parity ? r.parity.parity_ok : undefined,
    certifying_clean: r.certifying_clean,
    synthesized_verdict: r.synthesized_verdict,
    applicable_for: r.applicable_for,
    registry_version: r.registry_version,
    merge_ledger_ref: r.merge_ledger_ref === undefined ? null : r.merge_ledger_ref,
    directions,
  };
  if (r.provisional_reason !== undefined) receipt.provisional_reason = r.provisional_reason;
  else if (r.cap_reason !== undefined) receipt.provisional_reason = r.cap_reason;
  if (r.regrade_required !== undefined) receipt.regrade_required = r.regrade_required;
  if (Array.isArray(r.missing_frontiers)) receipt.missing_frontiers = r.missing_frontiers;
  if (ep) {
    receipt.execution_profile = {
      tools: ep.tools, research: ep.research, repoScope: ep.repoScope, cwd: ep.cwd,
    };
  }
  return receipt;
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
// node lib/audit/run-bidirectional-eval.js --mode comprehension --skill-dir <dir>
//   [--eval-file <f>] [--cwd <skill-graph-root>] [--skill <slug>]
// Runs the bidirectional eval guardrail end-to-end (Direction Claude + Codex, tools-ON
// parity, conservative reconciliation) and prints the combined receipt as JSON.
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
  const mode = args.mode || 'comprehension';
  const cwd = args.cwd || process.cwd();
  const skillDir = args['skill-dir'] || args.skillDir;
  const skill = args.skill || (skillDir ? require('path').basename(skillDir) : null);
  if (!skillDir && !args['eval-file']) {
    console.error('Usage: node lib/audit/run-bidirectional-eval.js --mode comprehension|application --skill-dir <dir> [--eval-file <f>] [--cwd <skill-graph-root>] [--skill <slug>] [--advisory] [--calibration-receipt FILE]');
    process.exit(1);
  }
  const receipt = runBidirectionalEval({
    mode,
    skill,
    cwd,
    skillDir,
    evalFile: args['eval-file'],
    workspace: cwd,
    calibrationReceipt: args['calibration-receipt'],
    advisory: Boolean(args.advisory), // --advisory adds the breadth panel (heavy; never certifies)
  });
  console.log(JSON.stringify(receipt, null, 2));
  // A capped / non-certifying-clean run exits non-zero so a loop can branch on it.
  process.exit(receipt.certifying_clean ? 0 : 2);
}

if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
  CERTIFYING_VERDICTS,
  runBidirectionalEval,
  runAdvisoryPanel,
  runSingleFrontierEval,
  toSidecarReceipt,
  directionCalibrated,
  directionHasRedHerringCoverage,
};
