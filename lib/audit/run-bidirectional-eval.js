'use strict';

// ─── Bidirectional EVAL guardrail (representative generator + frontier judges) ─
//
// This is the EVAL GUARDRAIL of the two-frontier audit loop — NOT the objective.
// The objective is curation (lib/audit/run-skill-audit-loop-lite.js); this run
// only confirms the candidate skill genuinely helps a real, tool-enabled representative
// agent population and did not regress or turn harmful. It must never be used to strip
// knowledge that failed to move a narrow score. See
// docs/skill-audit-loop-philosophy.md § "WHY curate, never strip to a delta".
//
// Two directions, named by which frontier JUDGES the representative generator's
// output. The measured generator is the same deployment-representative role in both
// directions under an IDENTICAL tools-ON execution profile:
//   Direction "Claude": representative-generator answers → Opus judges.
//   Direction "Codex":  representative-generator answers → GPT judges.
// Reconciled CONSERVATIVELY (synthesize-bidirectional.reconcile): the more
// skeptical verdict wins, so PASS is reachable ONLY when BOTH frontier
// judges independently reach it — i.e. the skill helps the representative measured
// agent and survives both frontier judges. A `parity_ok:false` (the two directions ran under
// different permissions) makes the whole run INVALID — it may never certify.
//
// Dependency-injection contract (so this is unit-testable without live CLIs and
// reusable by the curation orchestrator and a thin CLI):
//   runBidirectionalEval({ mode, skill, cwd, deps: { runDirection }, ... })
//     deps.runDirection({ direction, generatorModel, graderModel,
//                         generatorFamily, graderFamily, executionProfile,
//                         mode, evalFile, skillDir, workspace })
//       => { verdict, certification_tier, execution_profile, ...receiptFields }
// The injected runDirection is what actually shells the eval (it wraps
// evaluate-skill.js's runComprehensionEval with the
// direction's models + the tools-ON execution profile). This module owns ONLY
// the sequencing, parity assertion, conservative reconciliation, and the combined
// receipt — never model selection beyond representative-generator + frontier judges.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { Worker, isMainThread, workerData } = require('worker_threads');

const { FRONTIER_PAIR, REPRESENTATIVE_GENERATOR_MODEL, REGISTRY_VERSION, resolveModelDescriptor, ADVISORY_MODELS, resolveDisplayName } = require('../audit-shared/model-provider');
const { reconcile, capAtProvisional, COMPREHENSION_RANK } = require('../audit-shared/synthesize-bidirectional');
const { resolveCertificationTier, modelFamily } = require('../audit-shared/certification');
const { buildExecutionProfile, assertParity } = require('./eval-execution-profile');

// Strong (certifying) verdicts that may only stand on a parity-OK, both-directions-
// certifying run. When the run is not certifying-clean, these cap to PROVISIONAL.
const CERTIFYING_VERDICTS = new Set(['PASS']);

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
 *   deps.runDirection (DI; in-process test hook) or deps.runDirectionModule
 *   (worker-thread test hook). Live/default advisory runs fan out to one worker
 *   per advisory model so free agents do not queue behind each other.
 */
function sleepUntilWorkersComplete(done, expected, timeoutMs) {
  const started = Date.now();
  while (Atomics.load(done, 0) < expected) {
    const current = Atomics.load(done, 0);
    const remaining = timeoutMs > 0 ? timeoutMs - (Date.now() - started) : 1000;
    if (timeoutMs > 0 && remaining <= 0) return false;
    Atomics.wait(done, 0, current, timeoutMs > 0 ? Math.min(1000, remaining) : 1000);
  }
  return true;
}

function writeAdvisoryWorkerResult(outputFile, entry, done) {
  fs.writeFileSync(outputFile, JSON.stringify(entry, null, 2));
  Atomics.add(done, 0, 1);
  Atomics.notify(done, 0);
}

function runAdvisoryDirection(params) {
  const {
    model,
    mode,
    skillDir,
    evalFile,
    workspace,
    baselineWorkspace,
    executionProfile,
    calibrationReceipt,
    graderModel,
    runDirectionModule,
  } = params;
  const entry = { model, display: resolveDisplayName(model), tier: 'advisory' };
  try {
    const moduleExports = runDirectionModule
      ? require(path.resolve(runDirectionModule))
      : require('./evaluate-skill');
    const runDirection = moduleExports.runDirection || moduleExports.runEvalDirection;
    if (typeof runDirection !== 'function') {
      throw new Error(`advisory worker module does not export runDirection or runEvalDirection: ${runDirectionModule || './evaluate-skill'}`);
    }
    const r = runDirection({
      direction: `advisory:${model}`,
      generatorModel: model,
      graderModel,
      generatorFamily: model,
      graderFamily: graderModel,
      mode, skillDir, evalFile, workspace, baselineWorkspace, executionProfile, calibrationReceipt,
    });
    entry.verdict = r && r.verdict;
    entry.grader = resolveDisplayName(graderModel);
  } catch (e) {
    entry.error = e.message;
  }
  return entry;
}

function runAdvisoryWorkerMain() {
  const data = workerData || {};
  const done = new Int32Array(data.shared);
  const entry = runAdvisoryDirection(data.params);
  writeAdvisoryWorkerResult(data.outputFile, entry, done);
}

function runAdvisoryPanelInWorkers(opts = {}) {
  const {
    mode, skillDir, evalFile, workspace, baselineWorkspace, executionProfile,
    calibrationReceipt,
    advisoryModels = ADVISORY_MODELS,
    graderModel = FRONTIER_PAIR[0],
    deps = {},
  } = opts;
  if (!advisoryModels.length) return [];

  const timeoutMs = Number(deps.workerTimeoutMs || process.env.SKILL_AUDIT_ADVISORY_PANEL_TIMEOUT_MS || 0);
  const resultDir = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-advisory-panel-'));
  const shared = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT);
  const done = new Int32Array(shared);
  const workers = [];

  try {
    for (let i = 0; i < advisoryModels.length; i += 1) {
      const model = advisoryModels[i];
      const outputFile = path.join(resultDir, `${String(i).padStart(2, '0')}-${model}.json`);
      workers.push(new Worker(__filename, {
        workerData: {
          advisoryWorker: true,
          shared,
          outputFile,
          params: {
            model,
            mode,
            skillDir,
            evalFile,
            workspace,
            baselineWorkspace,
            executionProfile,
            calibrationReceipt,
            graderModel,
            runDirectionModule: deps.runDirectionModule || null,
          },
        },
      }));
    }

    const completed = sleepUntilWorkersComplete(done, advisoryModels.length, timeoutMs);
    if (!completed) {
      for (const worker of workers) worker.terminate().catch(() => {});
    }

    return advisoryModels.map((model, i) => {
      const outputFile = path.join(resultDir, `${String(i).padStart(2, '0')}-${model}.json`);
      if (!fs.existsSync(outputFile)) {
        return {
          model,
          display: resolveDisplayName(model),
          tier: 'advisory',
          error: completed ? 'advisory worker exited without writing a result' : `advisory worker timed out after ${timeoutMs}ms`,
        };
      }
      try {
        return JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      } catch (e) {
        return {
          model,
          display: resolveDisplayName(model),
          tier: 'advisory',
          error: `advisory worker wrote an unreadable result: ${e.message}`,
        };
      }
    });
  } finally {
    fs.rmSync(resultDir, { recursive: true, force: true });
  }
}

function runAdvisoryPanelInProcess(opts = {}) {
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

function runAdvisoryPanel(opts = {}) {
  if (opts.deps && typeof opts.deps.runDirection === 'function') {
    return runAdvisoryPanelInProcess(opts);
  }
  return runAdvisoryPanelInWorkers(opts);
}

/**
 * Run the two-frontier bidirectional eval guardrail for one skill.
 *
 * @param {object}  opts
 * @param {'comprehension'} opts.mode
 * @param {string}  opts.skill          Skill slug (for the receipt / logging).
 * @param {string}  opts.cwd            Working directory — the skill-graph repo root
 *                                      (the public-content fence). Used to build the
 *                                      shared tools-ON execution profile.
 * @param {string} [opts.skillDir]      Absolute skill dir (passed through to runDirection).
 * @param {string} [opts.evalFile]      Eval file path (passed through to runDirection).
 * @param {string} [opts.workspace]     Workspace override (passed through to runDirection).
 * @param {Set<number>} [opts.caseIds]  Optional case filter (passed through to runDirection).
 * @param {number} [opts.trials]        Optional trial count (passed through to runDirection).
 * @param {string[]} [opts.frontierPair] Override the frontier judge pair (default FRONTIER_PAIR).
 * @param {string} [opts.representativeGeneratorModel] Override the measured generator role.
 * @param {string} [opts.mergeLedgerRef] Link to the curation merge-ledger so the
 *                                      curation provenance and the eval provenance
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
    caseIds,
    trials,
    frontierPair = FRONTIER_PAIR,
    representativeGeneratorModel = REPRESENTATIVE_GENERATOR_MODEL,
    mergeLedgerRef,
    advisory = false, // opt-in advisory panel (breadth; never affects the verdict)
    // A10: held-out slicing. 'certification' grades the held-out slice
    // the improve/evolve loop never optimized against (anti-Goodhart); 'iteration' the loop
    // slice; 'all' (default) every case. Recorded as eval_slice on the receipt.
    slice = 'all',
    deps = {},
  } = opts;

  if (mode !== 'comprehension') {
    throw new Error(`runBidirectionalEval: mode must be 'comprehension' (got '${mode}')`);
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
  // measured generator population is the same in both directions; the variable is
  // which frontier judge evaluates the closed evidence packet.
  const executionProfile = buildExecutionProfile({ cwd });

  // Directions are named by which frontier JUDGES. The generator is the deployment-
  // representative measured subject in both directions; the frontier pair are judges.
  const [claudeJudgeModel, codexJudgeModel] = frontierPair;
  const claudeDirGenerator = representativeGeneratorModel;
  const claudeDirGrader = claudeJudgeModel;
  const codexDirGenerator = representativeGeneratorModel;
  const codexDirGrader = codexJudgeModel;

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
    caseIds,
    trials,
    slice, // A10: threaded to runEvalDirection (recorded as eval_slice)
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

  // Each direction must independently be a representative-generator + frontier-judge
  // certifying configuration. The two frontier judges must both agree before the
  // conservative aggregate can certify.
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
  // (never UNVERIFIED→PASS without provable evidence). An undefined
  // resolved_model (a DI test that doesn't track it) is NOT treated as unresolved;
  // only the explicit sentinel caps. The live runEvalDirection sets the sentinel
  // for gpt-5.5 until codex's resolved model is captured from its output
  // (tracked follow-up), so a real run honestly caps until that lands.
  const SENTINEL = 'latest-alias-unresolved';
  const dirUnresolved = (d) => Boolean(d) && (d.resolved_model === SENTINEL || d.resolved_generator_model === SENTINEL);
  const resolvedClean = !dirUnresolved(dirClaude) && !dirUnresolved(dirCodex);

  // A7: resolved-family vs declared-family agreement. The certifying decision above
  // (resolveCertificationTier) is computed from the DECLARED generator/grader families.
  // But a stale alias can RESOLVE to a different vendor family than declared — e.g. an
  // `opus` grader alias the CLI resolves to a GPT id, or a registry drift that points a
  // declared-Anthropic role at a Google model. That silently invalidates the cross-family
  // decision the declared families drove. So when a direction's resolved CONCRETE model id
  // (not the sentinel, not undefined) has a KNOWN family that DIFFERS from the declared
  // family's known family, the run is not certifying — cap to PROVISIONAL. An unknown or
  // unresolved family cannot prove disagreement and is left to resolvedClean (sentinel cap).
  const dirFamilyMismatch = (d) => {
    if (!d) return false;
    const pairs = [
      [d.resolved_generator_model, d.generator_family || d.generator_model],
      [d.resolved_model, d.grader_family || d.grader_model],
    ];
    for (const [resolved, declared] of pairs) {
      if (!resolved || resolved === SENTINEL) continue;
      const rf = modelFamily(resolved);
      const df = modelFamily(declared);
      if (rf && df && rf !== df) return true;
    }
    return false;
  };
  const familyConsistent = !dirFamilyMismatch(dirClaude) && !dirFamilyMismatch(dirCodex);

  // The run is certifying-clean ONLY when parity holds AND both directions are
  // certifying AND both directions' models are resolved. Otherwise a strong verdict
  // is capped to PROVISIONAL — the in-code "never certify on an invalid / biased /
  // unprovable run".
  const certifyingClean = Boolean(parity.parity_ok)
    && bothCertifying
    && resolvedClean
    && familyConsistent;

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
      capReason = `a direction was not certifying (Claude=${certClaude.tier}, Codex=${certCodex.tier})`;
    } else if (!resolvedClean) {
      capReason = `a direction's model is unresolved (${SENTINEL}) — cannot prove which concrete model ran`;
    } else {
      capReason = 'a direction\'s resolved model family differs from its declared family — the certifying decision was computed from a stale/incorrect declared family';
    }
  }

  // A6: fence honesty. The isolated-eval-workspace (a public-only temp checkout) is the
  // OS-enforced form of the repoScope/answer-key boundary. When the execution profile is
  // NOT os-isolated, the boundary is the prompt instruction + claim-filter only (an agent
  // could path-traverse to a private sibling) — record that caveat on the receipt so a
  // certifying verdict never silently implies a kernel-enforced fence it did not have.
  const fenceStrength = (executionProfile && executionProfile.fence) || 'prompt-level';
  const fenceCaveat = fenceStrength === 'os-isolated'
    ? null
    : 'fence: prompt-level only — the repoScope/answer-key boundary was the prompt + claim-filter, NOT an OS-isolated public-only checkout (isolated-eval-workspace.js). A certifying verdict here is honest only to that fence strength.';

  return {
    mode,
    skill: skill || null,
    frontier_pair: [claudeJudgeModel, codexJudgeModel],
    // Full human-readable names for OUTPUT (e.g. "Opus 4.8 ⇄ GPT-5.5") — never print
    // the bare aliases in reports/receipts (resolveDisplayName, registry DISPLAY_NAMES).
    frontier_pair_display: [resolveDisplayName(claudeJudgeModel), resolveDisplayName(codexJudgeModel)],
    measured_generator: representativeGeneratorModel,
    measured_generator_display: resolveDisplayName(representativeGeneratorModel),
    generator_population: 'deployment-representative',
    reconciliation: 'conservative',
    eval_slice: slice, // A10: which slice (all/iteration/certification) earned this verdict
    fence: fenceStrength, // A6: os-isolated | prompt-level
    fence_caveat: fenceCaveat, // A6: non-null when the fence was prompt-level only
    synthesized_verdict: synthesizedVerdict,
    reconciled_verdict_raw: reconciled.verdict,
    agreement: reconciled.agreement,
    verdict_capped: capped,
    cap_reason: capReason,
    certifying_clean: certifyingClean,
    resolved_clean: resolvedClean,
    family_consistent: familyConsistent,
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
  if (mode === 'comprehension') return COMPREHENSION_RANK;
  throw new Error(`runSingleFrontierEval: mode must be 'comprehension' (got '${mode}')`);
}

/**
 * Run a lower-confidence eval when only one certifying frontier is currently available.
 * This is a degraded, explicit operator path: it keeps the loop moving during a provider
 * budget window, but it can never certify PASS. Strong single-direction
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
    caseIds,
    trials,
    frontierModel,
    representativeGeneratorModel = REPRESENTATIVE_GENERATOR_MODEL,
    missingFrontiers = [],
    provisionalReason = 'single_frontier_degraded_mode',
    mergeLedgerRef,
    deps = {},
  } = opts;

  if (mode !== 'comprehension') {
    throw new Error(`runSingleFrontierEval: mode must be 'comprehension' (got '${mode}')`);
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
    caseIds,
    trials,
  };
  const direction = runDirection({
    direction: role,
    generatorModel: representativeGeneratorModel,
    graderModel: frontierModel,
    generatorFamily: representativeGeneratorModel,
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
    measured_generator: representativeGeneratorModel,
    measured_generator_display: resolveDisplayName(representativeGeneratorModel),
    generator_population: 'deployment-representative',
    reconciliation: 'single-frontier-provisional',
    synthesized_verdict: synthesizedVerdict,
    reconciled_verdict_raw: rawVerdict,
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
    ...(r.measured_generator !== undefined ? { measured_generator: r.measured_generator } : {}),
    ...(r.generator_population !== undefined ? { generator_population: r.generator_population } : {}),
    reconciliation: r.reconciliation,
    agreement: r.agreement,
    parity_ok: r.parity ? r.parity.parity_ok : undefined,
    certifying_clean: r.certifying_clean,
    synthesized_verdict: r.synthesized_verdict,
    ...(r.eval_slice !== undefined ? { eval_slice: r.eval_slice } : {}),
    registry_version: r.registry_version,
    merge_ledger_ref: r.merge_ledger_ref === undefined ? null : r.merge_ledger_ref,
    directions,
  };
  if (r.provisional_reason !== undefined) receipt.provisional_reason = r.provisional_reason;
  else if (r.cap_reason !== undefined) receipt.provisional_reason = r.cap_reason;
  if (r.regrade_required !== undefined) receipt.regrade_required = r.regrade_required;
  if (Array.isArray(r.missing_frontiers)) receipt.missing_frontiers = r.missing_frontiers;
  // A6: record the fence-strength caveat so a certifying receipt never silently implies a
  // kernel-enforced answer-key fence it did not have.
  if (r.fence_caveat) receipt.fence_caveat = r.fence_caveat;
  if (ep) {
    receipt.execution_profile = {
      tools: ep.tools, research: ep.research, repoScope: ep.repoScope, cwd: ep.cwd,
      ...(ep.fence !== undefined ? { fence: ep.fence } : {}),
    };
  }
  return receipt;
}

function parsePositiveIntegerSet(raw, { label = 'ids' } = {}) {
  if (raw === undefined || raw === null || raw === '') return null;
  const ids = String(raw)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part));
  const bad = ids.find((id) => !Number.isInteger(id) || id <= 0);
  if (bad !== undefined) {
    throw new Error(`Invalid --${label} value: ${raw}`);
  }
  return new Set(ids);
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
// node lib/audit/run-bidirectional-eval.js --mode comprehension --skill-dir <dir>
//   [--eval-file <f>] [--cwd <skill-graph-root>] [--skill <slug>] [--case-id 1,2] [--trials N]
// Runs the bidirectional eval guardrail end-to-end (Claude judge + Codex judge, tools-ON
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
  let caseIds = null;
  try {
    caseIds = parsePositiveIntegerSet(args['case-id'] || args['case-ids'] || args['eval-id'] || args['eval-ids'], { label: 'case-id' });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
  const trials = args.trials !== undefined ? Number(args.trials) : undefined;
  if (args.trials !== undefined && (!Number.isFinite(trials) || trials < 1)) {
    console.error(`Invalid --trials value: ${args.trials}`);
    process.exit(1);
  }
  if (!skillDir && !args['eval-file']) {
    console.error('Usage: node lib/audit/run-bidirectional-eval.js --mode comprehension --skill-dir <dir> [--eval-file <f>] [--cwd <skill-graph-root>] [--skill <slug>] [--case-id 1,2] [--trials N] [--advisory]');
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
    caseIds,
    trials,
    advisory: Boolean(args.advisory), // --advisory adds the breadth panel (heavy; never certifies)
  });
  console.log(JSON.stringify(receipt, null, 2));
  // A capped / non-certifying-clean run exits non-zero so a loop can branch on it.
  process.exit(receipt.certifying_clean ? 0 : 2);
}

if (!isMainThread && workerData && workerData.advisoryWorker) {
  runAdvisoryWorkerMain();
} else if (require.main === module) {
  main(process.argv.slice(2));
}

module.exports = {
  CERTIFYING_VERDICTS,
  runBidirectionalEval,
  runAdvisoryPanel,
  runAdvisoryPanelInWorkers,
  runSingleFrontierEval,
  toSidecarReceipt,
};
