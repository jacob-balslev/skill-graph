'use strict';

/**
 * Application-shape eval pipeline — self-contained module for skill-graph.
 *
 * Ported verbatim from ~/Development/scripts/skill/evaluate-skill.js
 * (lines ~1246–1911 + exports 2362–2378 in the parent, authoritative source
 * as of 2026-05-21).  This module is the canonical skill-graph home for the
 * --application eval layer per ADR 0009 + ADR 0011 and SH-6198.
 *
 * Dependency injection contract
 * ─────────────────────────────
 * `runApplicationEval(evalFile, options)` accepts an `options.deps` object
 * carrying the model-runner helpers that would otherwise require a circular
 * require back into evaluate-skill.js.  Callers (typically evaluate-skill.js)
 * build the deps object from their own local definitions:
 *
 *   const { runApplicationEval } = require('./application-eval');
 *   runApplicationEval(evalFile, {
 *     workspace: args.workspace,
 *     grader: args.grader || 'claude',
 *     deps: {
 *       runGraderPrompt,     // (prompt, { grader, workspace, model }) => string
 *       getEvalResponse,     // (prompt, { workspace, disableSlashCommands, allowTools }) => string
 *       logGraderDiscrepancy, // ({ shape, testCase, run, rawJudgeOutput }) => void
 *     },
 *   });
 *
 * Self-containment rule: this file MUST NOT require anything outside
 * lib/audit/.  No ../scripts, no ../../Development paths.
 */

const fs = require('fs');
const path = require('path');

const {
  extractJsonObject,
  skillNameFromDir,
  skillHistoryKeyFromDir,
  resolveReceiptModelId,
  REGISTRY_VERSION,
} = require('./skill-improvement-helpers');
// Tools-ON parity (two-frontier bidirectional design). Lives in lib/audit/, so
// requiring it does NOT break the self-containment rule (no ../scripts escape).
const { buildExecutionProfile, cliAccessForProfile } = require('./eval-execution-profile');
const { assertBaselineSkillAbsent } = require('./baseline-fence');

// ─── Constants (ported verbatim) ──────────────────────────────────────────────

const APPLICATION_AXES = [
  'flag_correctness',
  'fix_correctness',
  'false_positive_avoidance',
  'primary_signal_clarity',
];

const APPLICATION_AXIS_WEIGHTS_REAL = {
  flag_correctness: 2.0,
  fix_correctness: 1.5,
  false_positive_avoidance: 1.0,
  primary_signal_clarity: 1.0,
};

const APPLICATION_AXIS_WEIGHTS_RED_HERRING = {
  flag_correctness: 2.0,
  fix_correctness: 1.5,
  false_positive_avoidance: 2.0,
  primary_signal_clarity: 1.0,
};

const APPLICATION_VERDICT_CATEGORIES = new Set([
  'applicable',
  'redundant',
  'not_discriminated_ceiling',
  'equivalent_on_frontier',
  'harmful',
  'false_positive',
  'mixed',
]);

// ─── Application axis scale (0–100) ────────────────────────────────────────────
//
// Each axis is scored 0–100 (free continuous integer) by the grader. The coarse
// 0/1/2 scale was retired 2026-06-11 (user directive): on a 3-point scale a strong
// frontier BASELINE (the no-skill arm) is forced to the ceiling (2/2) and trips
// baseline saturation with zero headroom to measure the skill's lift. 0–100 gives
// the grader room to say "baseline is strong but not perfect" (e.g. 88), restoring
// measurable headroom. See docs/application-eval-spec.md and the grader prompt's
// Anti-Compression Mandate (the discipline that keeps a wide scale discriminative).
const APPLICATION_AXIS_MAX = 100;

// Baseline near-ceiling band. A baseline scoring at/above this on EVERY axis has
// effectively no headroom for the skill to lift, so a no-lift verdict is
// `not_discriminated_ceiling` (ceiling) rather than `equivalent_on_frontier`
// (had headroom, no lift). Env-overridable for calibration. Replaces the old
// "baseline == absolute max (2)" test that fired on nearly every frontier case.
const APPLICATION_BASELINE_SATURATION_THRESHOLD = (() => {
  const env = Number(process.env.APPLICATION_BASELINE_SATURATION_THRESHOLD);
  return Number.isFinite(env) && env > 0 && env <= APPLICATION_AXIS_MAX ? env : 90;
})();

// Minimum per-axis delta (0–100) that counts as a real behavior change rather than
// grader noise. A lift is delta ≥ this; a regression is delta ≤ −this; |delta| below
// this is "no meaningful change." Replaces the old integer ±1 step on the 0/1/2 scale.
const APPLICATION_MIN_MEANINGFUL_DELTA = (() => {
  const env = Number(process.env.APPLICATION_MIN_MEANINGFUL_DELTA);
  return Number.isFinite(env) && env > 0 && env <= APPLICATION_AXIS_MAX ? env : 10;
})();

const APPLICATION_GRADER_MAX_ATTEMPTS = 3;
const APPLICATION_PAIRWISE_MAX_ATTEMPTS = 3;
const APPLICATION_GRADING_MODES = new Set(['pairwise', 'pointwise']);

function resolveApplicationCalibration(options = {}) {
  const receipt = typeof options.calibrationReceipt === 'string'
    ? options.calibrationReceipt.trim()
    : '';
  if (!receipt && options.calibrated !== true) {
    return { calibrated: false, calibration_receipt: null };
  }
  if (!receipt) {
    throw new Error('Application grader calibration requires calibrationReceipt evidence; refusing a bare calibrated=true flag.');
  }
  const resolved = path.resolve(receipt);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Application grader calibration receipt not found: ${resolved}`);
  }
  return { calibrated: true, calibration_receipt: resolved };
}

// ─── Grader model (SH-6641) ───────────────────────────────────────────────────
//
// The application grader JUDGES skill quality (it stamps application_verdict),
// so it must use the strongest model — never a lesser one (workspace rule
// `no-lesser-models-for-quality.md`). Default Opus, env-overridable, mirroring
// the comprehension grader's COMPREHENSION_GRADER_MODEL. Before this constant
// existed, gradeApplicationResponse() passed no model to runGraderPrompt(),
// which silently fell back to DEFAULT_EVAL_MODEL ('sonnet') — every graded
// application_verdict was sonnet-judged. The model the runner actually selects
// is recorded as grader_model on each history record so the receipt is honest
// (this is distinct from the operator-declared *_family attestations).
const APPLICATION_GRADER_DEFAULT_MODEL = 'opus';
function applicationGraderModel() {
  const env = process.env.APPLICATION_GRADER_MODEL;
  // SH-6626: fail closed on a lesser-tier env override — a quality judge is never
  // silently downgraded to Haiku/Sonnet/Flash/MiniMax/Nemotron. Default is already Opus.
  if (typeof env === 'string' && env.trim()) {
    return assertTopTierGraderModel(env.trim(), { source: 'APPLICATION_GRADER_MODEL' });
  }
  return APPLICATION_GRADER_DEFAULT_MODEL;
}

// ─── Generator model (SH-6661) ─────────────────────────────────────────────────
//
// The GENERATOR is the measured agent — it answers the eval scenario baseline-vs-
// with-skill. Before this, runApplicationEval passed NO model to the injected
// getEvalResponse, and evaluate-skill's runPromptWithCli THROWS on a missing model
// (the "no silent Sonnet" guard) — so a live application run errored on the first
// generator call. The generator must run on an explicit FRONTIER deployment-matched
// model (default 'opus'); the bidirectional runner sets each direction's generator
// from FRONTIER_PAIR. This is NOT a no-lesser-models violation — that rule governs
// the GRADER; a frontier generator is not a lesser model. See
// docs/skill-audit-loop-philosophy.md § "WHY the generator ... is a frontier model".
const APPLICATION_GENERATOR_DEFAULT_MODEL = 'opus';
function applicationGeneratorModel() {
  const env = process.env.APPLICATION_GENERATOR_MODEL;
  if (typeof env === 'string' && env.trim()) return env.trim();
  return APPLICATION_GENERATOR_DEFAULT_MODEL;
}

// ─── Trials + certification-tier constants (SH-6624 Phase 2) ───────────────────
//
// The behavior-delta signal a single (baseline, with_skill) pair produces is
// noisy: same-judge repetition has correlated error and a single draw can land
// on a non-modal verdict (IRT judge-reliability framework, arXiv 2602.00521;
// CARE confounder-aware aggregation, arXiv 2603.00039). The runner therefore
// repeats each case N times and takes the MODE of the per-trial verdicts as the
// per-case verdict, reporting a verdict-consistency metric (modal-agreement
// fraction) so a low-stability case is visible rather than silently averaged
// away. Field-standard repetition for stable LLM-judge verdicts is ≥5; the AC
// range is 3–5 and the default is 3 (cost-balanced).
const APPLICATION_DEFAULT_TRIALS = 3;
const APPLICATION_RECOMMENDED_TRIAL_RANGE = [3, 5];

// A per-case verdict is "stable" when the modal verdict holds across at least
// this fraction of trials (i.e. the mode is a real majority, not a plurality of
// one). Below it, the run records verdict_stable:false so downstream readers do
// not treat the per-case verdict as settled. 0.6 mirrors the aggregate
// applicable threshold (computeApplicationAggregateVerdict) for consistency.
const APPLICATION_VERDICT_CONSISTENCY_THRESHOLD = 0.6;

// Certification tiers. APPLICABLE — the only verdict that *certifies* a skill is
// useful (docs/verdict-semantics.md) — is reachable ONLY from a 'certifying'
// run: an independent, cross-family dual-run grader (e.g. Opus generates →
// GPT-5.4 grades). A judge grading its OWN model family inflates scores +10–25pp
// (Self-Preference Bias, arXiv 2410.21819; arXiv 2504.03846), so a same-family or
// undeclared run is structurally only PROVISIONAL. This is the in-code form of
// the version-schema-contract rule "never UNVERIFIED→APPLICABLE without
// evidence" — the runner stamps the tier, and stampApplicationVerdict caps
// APPLICABLE→PROVISIONAL whenever the tier is not 'certifying'.
// Cross-family certification + self-grading guard now live in the shared module
// lib/audit-shared/certification.js so the comprehension gate reuses the exact
// same logic for the two-frontier bidirectional design. `APPLICATION_CERTIFICATION_TIERS`
// is kept as a back-compat alias for callers/tests that import it from here.
const {
  CERTIFICATION_TIERS: APPLICATION_CERTIFICATION_TIERS,
  MODEL_FAMILY_PATTERNS,
  modelFamily,
  resolveCertificationTier,
  assertTopTierGraderModel,
} = require('../audit-shared/certification');

/**
 * Aggregate N per-trial case verdicts into the authoritative per-case verdict.
 *
 * Takes the MODE of the trial verdicts (most-common wins; ties broken by the
 * order verdicts first appear, which is run order). Reports the modal-agreement
 * fraction as verdict_consistency and a verdict_stable boolean against
 * APPLICATION_VERDICT_CONSISTENCY_THRESHOLD. This is a verdict-stability metric,
 * NOT a mean of scores — averaging categorical verdicts is a fallacy; the
 * winning verdict is one a real trial produced.
 *
 * @param {string[]} trialVerdicts  Per-trial case verdicts (non-empty).
 * @returns {{ case_verdict: string, verdict_consistency: number, verdict_stable: boolean, verdict_distribution: object, trials: number }}
 */
function aggregateTrialVerdicts(trialVerdicts) {
  const verdicts = Array.isArray(trialVerdicts) ? trialVerdicts.filter(Boolean) : [];
  if (verdicts.length === 0) {
    return { case_verdict: 'redundant', verdict_consistency: 0, verdict_stable: false, verdict_distribution: {}, trials: 0 };
  }
  const distribution = {};
  for (const v of verdicts) distribution[v] = (distribution[v] || 0) + 1;
  // Mode: highest count; on a tie, the verdict that appeared first in run order.
  let mode = verdicts[0];
  let modeCount = 0;
  const seenOrder = [];
  for (const v of verdicts) if (!seenOrder.includes(v)) seenOrder.push(v);
  for (const v of seenOrder) {
    if (distribution[v] > modeCount) {
      mode = v;
      modeCount = distribution[v];
    }
  }
  const consistency = Number((modeCount / verdicts.length).toFixed(4));
  return {
    case_verdict: mode,
    verdict_consistency: consistency,
    verdict_stable: consistency >= APPLICATION_VERDICT_CONSISTENCY_THRESHOLD,
    verdict_distribution: distribution,
    trials: verdicts.length,
  };
}

/**
 * Aggregate the per-trial grade records for one run (baseline OR with_skill) into
 * a mean grade used for delta reporting and receipts. Axis scores are averaged
 * across trials (so they may be fractional — e.g. 1.33 — which is correct: it is
 * the expected score, not a coerced integer), and weighted_score is averaged
 * directly. The categorical per-case verdict does NOT come from these means (it
 * comes from aggregateTrialVerdicts); these are for the human-readable delta and
 * the receipt's score provenance only.
 *
 * @param {object[]} grades  Per-trial normalized grade records (from normalizeApplicationGrade).
 * @returns {object} A grade-shaped record with mean axis_scores / weighted_score.
 */
function aggregateTrialGrades(grades) {
  const valid = Array.isArray(grades) ? grades.filter(Boolean) : [];
  if (valid.length === 0) return null;
  const n = valid.length;
  const axisScores = {};
  for (const axis of APPLICATION_AXES) {
    const sum = valid.reduce((acc, g) => acc + (Number(g.axis_scores?.[axis]) || 0), 0);
    axisScores[axis] = Number((sum / n).toFixed(4));
  }
  const meanOf = (key) => Number((valid.reduce((acc, g) => acc + (Number(g[key]) || 0), 0) / n).toFixed(4));
  // primary_axis is identical across a case's trials (it depends only on red_herring).
  const primaryAxis = valid[0].primary_axis;
  return {
    primary_axis: primaryAxis,
    primary_axis_score: axisScores[primaryAxis],
    axis_scores: axisScores,
    raw_score: meanOf('raw_score'),
    max_raw_score: valid[0].max_raw_score,
    weighted_score: meanOf('weighted_score'),
    passed: valid.filter((g) => g.passed).length > n / 2, // majority of trials passed
    trials: n,
  };
}

// NOTE: The application layer does NOT select a model. The "grader differs from
// generator" rule from application-grader-prompt.md is an OPERATOR policy, not a
// script policy — run the grader from a different claude session if you want a
// different model. The script trusts the session model and stays out of selection.

// APPLICATION_GRADER_PROMPT_PATH is resolved via __dirname (bundled graders/) so
// this module works when installed as a standalone package. Mirrors the SH-6304
// concept-grader fix applied to lib/audit/evaluate-skill.js.
const APPLICATION_GRADER_PROMPT_PATH = path.join(__dirname, 'graders', 'application-grader-prompt.md');
const APPLICATION_PAIRWISE_GRADER_PROMPT_PATH = path.join(__dirname, 'graders', 'application-comparative-grader-prompt.md');

// APPLICATION_HISTORY_LOG is resolved via log-paths.js which supports env-var
// overrides and falls back to a standalone-safe location when the parent
// monorepo is not present (e.g., after installing via npm globally).
// persistApplicationHistory() creates the directory if it does not exist.
const { APPLICATION_HISTORY_LOG } = require('./log-paths');

// ─── Workspace helpers ────────────────────────────────────────────────────────
// Defined here (not imported from evaluate-skill.js) to avoid circular require.
// Logic is identical to the definitions in lib/audit/evaluate-skill.js.

function resolveWorkspaceFromEvalFile(evalFile) {
  const normalized = path.resolve(evalFile).replace(/\\/g, '/');
  const marker = '/.claude/skills/';
  const markerIndex = normalized.indexOf(marker);
  if (markerIndex >= 0) {
    return normalized.slice(0, markerIndex);
  }

  const sharedMarker = '/skills/';
  const sharedIndex = normalized.indexOf(sharedMarker);
  if (sharedIndex >= 0) {
    return normalized.slice(0, sharedIndex);
  }

  // Fallback: walk up 3 levels from the eval file. If the result is a
  // filesystem root (e.g. '/') — which happens when the eval file lives
  // outside a skills tree (like /tmp/) — fall back to cwd instead.
  const guess = path.dirname(path.dirname(path.dirname(path.resolve(evalFile))));
  if (guess === '/' || guess === path.parse(guess).root) {
    return process.cwd();
  }
  return guess;
}

function normalizeWorkspace(workspace) {
  if (!workspace) return process.cwd();
  return path.resolve(workspace);
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

/**
 * Load the bundled application grader prompt markdown file.
 * Throws if the file is missing (it should ship alongside this module).
 */
function loadApplicationGraderPrompt() {
  try {
    return fs.readFileSync(APPLICATION_GRADER_PROMPT_PATH, 'utf8');
  } catch (error) {
    throw new Error(`Application grader prompt not found at ${APPLICATION_GRADER_PROMPT_PATH}: ${error.message}`);
  }
}

function loadApplicationPairwiseGraderPrompt() {
  try {
    return fs.readFileSync(APPLICATION_PAIRWISE_GRADER_PROMPT_PATH, 'utf8');
  } catch (error) {
    throw new Error(`Application pairwise grader prompt not found at ${APPLICATION_PAIRWISE_GRADER_PROMPT_PATH}: ${error.message}`);
  }
}

/**
 * Build the generator prompt for one application eval case.
 *
 * Baseline run: scenario + context + question, no skill loaded.
 * With-skill run: skill body wrapped in <skill> tags, then the same baseline content.
 * The deliberate open-ended question is what the eval author wrote — do not add
 * any leading hints that would steer the candidate toward the expected flags.
 */
function buildApplicationGeneratorPrompt(testCase, { skillContent, skillName }) {
  const corePrompt = [
    '## Scenario',
    '',
    testCase.scenario || '',
    '',
    '## Context',
    '',
    testCase.context || '',
    '',
    '## Question',
    '',
    testCase.question || '',
  ].join('\n');

  if (!skillContent) return corePrompt;
  return `<skill name="${skillName}">\n${skillContent}\n</skill>\n\n${corePrompt}`;
}

/**
 * Build the per-run grader prompt for a single application eval case.
 *
 * The grader prompt template describes the rubric, axes, weights, and JSON output
 * contract. We append the specific case (scenario, context, question, expected_flags,
 * expected_fix_hints, absent_signals, red_herring) and the candidate response so the
 * grader has everything it needs in one turn.
 */
function buildApplicationGraderPrompt(testCase, response, { run, skillName, graderPromptTemplate }) {
  return [
    graderPromptTemplate,
    '',
    '---',
    '',
    '## This case',
    '',
    `- Skill name: ${skillName}`,
    `- Case ID: ${testCase.id}`,
    `- Scenario type: ${testCase.scenario_type || 'unknown'}`,
    `- Red herring: ${testCase.red_herring ? 'true (skill should NOT trigger)' : 'false (skill SHOULD trigger)'}`,
    `- Criticality: ${testCase.criticality || 'normal'}`,
    `- Run type: ${run}   (baseline = skill not loaded; with_skill = skill loaded)`,
    '',
    '## Scenario shown to candidate',
    '',
    testCase.scenario || '',
    '',
    '## Context provided',
    '',
    testCase.context || '',
    '',
    '## Question asked',
    '',
    testCase.question || '',
    '',
    '## expected_flags (issues the skill is supposed to lead the agent to surface)',
    '',
    Array.isArray(testCase.expected_flags) && testCase.expected_flags.length > 0
      ? testCase.expected_flags.map((f) => `- ${f}`).join('\n')
      : '(none specified)',
    '',
    '## expected_fix_hints (remediations the skill is supposed to lead the agent to recommend)',
    '',
    Array.isArray(testCase.expected_fix_hints) && testCase.expected_fix_hints.length > 0
      ? testCase.expected_fix_hints.map((f) => `- ${f}`).join('\n')
      : '(none specified)',
    '',
    '## absent_signals (claims the candidate should NOT make — false-positive risks)',
    '',
    Array.isArray(testCase.absent_signals) && testCase.absent_signals.length > 0
      ? testCase.absent_signals.map((f) => `- ${f}`).join('\n')
      : '(none specified)',
    '',
    '## Candidate response to grade',
    '',
    response || '(empty response)',
    '',
    '## Instructions',
    '',
    'Grade the candidate response across the 4 axes using the rubric above. Return the JSON shape exactly. No other text.',
  ].join('\n');
}

/**
 * Build a pairwise grader prompt that compares baseline vs with_skill responses
 * side-by-side for the same application eval case.
 *
 * The prompt intentionally hides which answer is baseline vs with-skill; the
 * runner decodes Response A/B back to run labels after the judge returns.
 */
function buildApplicationPairwiseGraderPrompt(testCase, responses, { order, skillName, graderPromptTemplate }) {
  const firstKey = order[0];
  const secondKey = order[1];
  const labelForIndex = (index) => (index === 0 ? 'Response A' : 'Response B');
  const responseFor = (key) => responses[key] || '(empty response)';
  const criteria = Array.isArray(testCase.criteria) && testCase.criteria.length > 0
    ? testCase.criteria.map((criterion) => {
      const id = criterion && criterion.id ? criterion.id : '(missing id)';
      const polarity = criterion && criterion.polarity ? criterion.polarity : 'positive';
      const statement = criterion && criterion.statement ? criterion.statement : '';
      return `- ${id} [${polarity}]: ${statement}`;
    }).join('\n')
    : '(none specified; compare against expected_flags, expected_fix_hints, and absent_signals)';

  return [
    graderPromptTemplate,
    '',
    '---',
    '',
    '## Pairwise grading task',
    '',
    'You are comparing TWO candidate responses for the SAME application eval case.',
    'Primary decision: which response surfaces more correct, non-obvious expected flags/fixes and fewer false positives?',
    'Run this as a blind pairwise comparison. Do not assume Response A is baseline or with-skill; the runner will decode the labels.',
    '',
    'Return JSON only. Required top-level fields:',
    '{"preferred":"A|B|tie","confidence":0|1|2|3,"with_skill_delta":"neutral","application_verdict":"APPLICABLE|HARMFUL|MIXED|FALSE_POSITIVE|REDUNDANT|EQUIVALENT_ON_FRONTIER|UNVERIFIED","criteria_results":[],"rollup":{"gained":0,"lost":0,"already":0,"harm":0,"total":0},"comparative_reasoning":"one sentence"}',
    '',
    'Preference rule:',
    '- Treat Response A and Response B as anonymous arms. The prompt intentionally does not reveal which one had the skill.',
    '- Prefer the response with materially better flag/fix behavior on real cases, unless it introduces listed absent_signals.',
    '- Prefer the response with materially better false-positive avoidance on red-herring cases.',
    '- Return tie only if neither response is meaningfully better after considering all expected behavior.',
    '- Use confidence 0 for a forced tie/insufficient evidence, 1 for weak preference, 2 for clear preference, 3 for decisive preference.',
    '- Set with_skill_delta to "neutral"; the runner decodes A/B to baseline/with_skill after grading.',
    '',
    '## This case',
    '',
    `- Skill name: ${skillName}`,
    `- Case ID: ${testCase.id}`,
    `- Scenario type: ${testCase.scenario_type || 'unknown'}`,
    `- Red herring: ${testCase.red_herring ? 'true (skill should NOT trigger)' : 'false (skill SHOULD trigger)'}`,
    `- Criticality: ${testCase.criticality || 'normal'}`,
    '',
    '## Scenario shown to both candidates',
    '',
    testCase.scenario || '',
    '',
    '## Context provided',
    '',
    testCase.context || '',
    '',
    '## Question asked',
    '',
    testCase.question || '',
    '',
    '## expected_flags (issues the skill is supposed to lead the agent to surface)',
    '',
    Array.isArray(testCase.expected_flags) && testCase.expected_flags.length > 0
      ? testCase.expected_flags.map((f) => `- ${f}`).join('\n')
      : '(none specified)',
    '',
    '## expected_fix_hints (remediations the skill is supposed to lead the agent to recommend)',
    '',
    Array.isArray(testCase.expected_fix_hints) && testCase.expected_fix_hints.length > 0
      ? testCase.expected_fix_hints.map((f) => `- ${f}`).join('\n')
      : '(none specified)',
    '',
    '## absent_signals (claims the candidate should NOT make — false-positive risks)',
    '',
    Array.isArray(testCase.absent_signals) && testCase.absent_signals.length > 0
      ? testCase.absent_signals.map((f) => `- ${f}`).join('\n')
      : '(none specified)',
    '',
    '## criteria[] checklist',
    '',
    criteria,
    '',
    '## Artifact under review',
    '',
    testCase.artifact || '(none specified; use Scenario + Context as the artifact)',
    '',
    `## ${labelForIndex(0)}`,
    '',
    responseFor(firstKey),
    '',
    `## ${labelForIndex(1)}`,
    '',
    responseFor(secondKey),
  ].join('\n');
}

// ─── Grade normalization ───────────────────────────────────────────────────────

/**
 * Coerce whatever shape the grader returned into the canonical application record.
 * Per the grader prompt spec: every axis is observable on every case (no nulls).
 * Axis scores are 0–100 (free continuous integer); a non-numeric value is a grader
 * contract violation and is coerced to 0 with a warning. Out-of-range numbers are
 * clamped to [0, APPLICATION_AXIS_MAX] and rounded to an integer.
 */
function normalizeApplicationGrade(grade, { redHerring }) {
  const weights = redHerring ? APPLICATION_AXIS_WEIGHTS_RED_HERRING : APPLICATION_AXIS_WEIGHTS_REAL;
  const rawScores = grade?.axis_scores || {};
  const axisScores = {};
  for (const axis of APPLICATION_AXES) {
    const rawValue = rawScores[axis];
    const numeric = Number(rawValue);
    if (Number.isFinite(numeric)) {
      axisScores[axis] = Math.max(0, Math.min(APPLICATION_AXIS_MAX, Math.round(numeric)));
    } else {
      console.warn(
        `WARN: application grader returned non-numeric score for axis "${axis}" (got ${JSON.stringify(rawValue)}) — coercing to 0 (grader contract violation).`,
      );
      axisScores[axis] = 0;
    }
  }

  const rawReasoning = grade?.axis_reasoning || {};
  const axisReasoning = {};
  for (const axis of APPLICATION_AXES) {
    axisReasoning[axis] = typeof rawReasoning[axis] === 'string' ? rawReasoning[axis] : '';
  }

  const rawEvidence = grade?.axis_evidence || {};
  const axisEvidence = {};
  for (const axis of APPLICATION_AXES) {
    axisEvidence[axis] = rawEvidence[axis] !== undefined ? rawEvidence[axis] : null;
  }

  const rawScore = APPLICATION_AXES.reduce((sum, axis) => sum + axisScores[axis], 0);
  const weightSum = APPLICATION_AXES.reduce((sum, axis) => sum + weights[axis], 0);
  const weightedNumerator = APPLICATION_AXES.reduce((sum, axis) => sum + axisScores[axis] * weights[axis], 0);
  const weightedScore = weightSum > 0
    ? Number((weightedNumerator / (weightSum * APPLICATION_AXIS_MAX)).toFixed(4))
    : 0;

  // Pass bar: primary-axis score ≥ half the axis max (50/100) AND weighted_score ≥ 0.6.
  // weighted_score stays normalized 0–1 (numerator and denominator both scale with the
  // axis max), so the 0.6 bar and all downstream case-ratio gates are scale-invariant.
  // Primary axis is flag_correctness on real cases; false_positive_avoidance on red herrings.
  const primaryAxis = redHerring ? 'false_positive_avoidance' : 'flag_correctness';
  const primaryScore = axisScores[primaryAxis];
  const passed = primaryScore >= APPLICATION_AXIS_MAX / 2 && weightedScore >= 0.6;

  // Verdict category from the grader (per-run provisional). The runner finalizes
  // the per-case verdict from the pairing of baseline + with_skill runs.
  const rawVerdict = typeof grade?.verdict_category === 'string' ? grade.verdict_category : '';
  const verdictCategory = APPLICATION_VERDICT_CATEGORIES.has(rawVerdict)
    ? rawVerdict
    : (passed ? 'applicable' : 'redundant');

  return {
    primary_axis: primaryAxis,
    primary_axis_score: primaryScore,
    axis_scores: axisScores,
    axis_reasoning: axisReasoning,
    axis_evidence: axisEvidence,
    raw_score: rawScore,
    max_raw_score: APPLICATION_AXES.length * APPLICATION_AXIS_MAX,
    weighted_score: weightedScore,
    passed,
    verdict_category: verdictCategory,
  };
}

function normalizeApplicationPairwiseGrade(grade, { order }) {
  const rawPreferred = typeof grade?.preferred === 'string' ? grade.preferred.trim().toUpperCase() : 'TIE';
  const preferred = rawPreferred === 'A' || rawPreferred === 'B' ? rawPreferred : 'tie';
  const preferredRun = preferred === 'tie'
    ? 'tie'
    : order[preferred === 'A' ? 0 : 1];
  const rawConfidence = Number(grade?.confidence);
  const confidence = Number.isFinite(rawConfidence)
    ? Math.max(0, Math.min(3, Math.floor(rawConfidence)))
    : 0;
  const rawDelta = typeof grade?.with_skill_delta === 'string'
    ? grade.with_skill_delta.trim().toLowerCase()
    : 'neutral';
  const withSkillDelta = ['positive', 'neutral', 'negative', 'mixed'].includes(rawDelta)
    ? rawDelta
    : 'neutral';
  const rawVerdict = typeof grade?.application_verdict === 'string'
    ? grade.application_verdict.trim().toLowerCase()
    : '';
  const verdictCategory = APPLICATION_VERDICT_CATEGORIES.has(rawVerdict)
    ? rawVerdict
    : 'redundant';

  return {
    preferred,
    preferred_run: preferredRun,
    confidence,
    with_skill_delta: withSkillDelta,
    application_verdict: verdictCategory,
    criteria_results: Array.isArray(grade?.criteria_results) ? grade.criteria_results : [],
    rollup: grade?.rollup && typeof grade.rollup === 'object' ? grade.rollup : {},
    comparative_reasoning: typeof grade?.comparative_reasoning === 'string' ? grade.comparative_reasoning : '',
    order: { A: order[0], B: order[1] },
  };
}

// ─── Grader orchestration ─────────────────────────────────────────────────────

/**
 * Grade a single application eval response.
 *
 * Calls the grader model (via `deps.runGraderPrompt`) up to
 * APPLICATION_GRADER_MAX_ATTEMPTS times, parses the JSON result, and returns
 * the normalized grade record.
 *
 * @param {object} testCase  - The application eval case object.
 * @param {string} response  - The candidate response to grade.
 * @param {string} run       - 'baseline' or 'with_skill'.
 * @param {object} options
 * @param {string} options.skillName            - Skill identifier for grader context.
 * @param {string} options.graderPromptTemplate - Full grader prompt markdown.
 * @param {string} [options.grader='claude']    - Grader backend alias.
 * @param {string} options.workspace            - Working directory for the grader CLI.
 * @param {object} options.deps                 - Injected runner helpers (see module JSDoc).
 */
function gradeApplicationResponse(testCase, response, run, options) {
  const prompt = buildApplicationGraderPrompt(testCase, response, {
    run,
    skillName: options.skillName,
    graderPromptTemplate: options.graderPromptTemplate,
  });

  const deps = options.deps || {};
  const runGraderPrompt = deps.runGraderPrompt;
  const logGraderDiscrepancy = deps.logGraderDiscrepancy;

  if (typeof runGraderPrompt !== 'function') {
    throw new Error('gradeApplicationResponse: options.deps.runGraderPrompt must be a function (dependency injection required).');
  }

  const errors = [];
  for (let attempt = 1; attempt <= APPLICATION_GRADER_MAX_ATTEMPTS; attempt += 1) {
    let raw;
    try {
      raw = runGraderPrompt(prompt, {
        grader: options.grader || 'claude',
        workspace: options.workspace,
        // SH-6641: select the grader model explicitly (default Opus) so the
        // judge is never silently demoted to DEFAULT_EVAL_MODEL ('sonnet').
        model: options.graderModel,
      });
    } catch (callError) {
      errors.push(`attempt ${attempt}: grader call failed: ${callError.message}`);
      continue;
    }

    let parsed;
    try {
      parsed = extractJsonObject(raw);
    } catch (parseError) {
      const preview = String(raw || '').slice(0, 200).replace(/\s+/g, ' ');
      errors.push(`attempt ${attempt}: JSON extraction failed (${parseError.message}); raw preview: "${preview}"`);
      continue;
    }

    if (typeof logGraderDiscrepancy === 'function') {
      logGraderDiscrepancy({ shape: 'application_grader', testCase, run, rawJudgeOutput: parsed });
    }
    return normalizeApplicationGrade(parsed, { redHerring: Boolean(testCase.red_herring) });
  }

  throw new Error(
    `Application grader failed after ${APPLICATION_GRADER_MAX_ATTEMPTS} attempts for case ${testCase.id} [${testCase.scenario_type || '?'}] ${run} run:\n` +
      errors.map((e) => `  ${e}`).join('\n'),
  );
}

function gradeApplicationPairwise(testCase, responses, options) {
  const prompt = buildApplicationPairwiseGraderPrompt(testCase, responses, {
    order: options.order,
    skillName: options.skillName,
    graderPromptTemplate: options.graderPromptTemplate,
  });

  const deps = options.deps || {};
  const runGraderPrompt = deps.runGraderPrompt;
  const logGraderDiscrepancy = deps.logGraderDiscrepancy;

  if (typeof runGraderPrompt !== 'function') {
    throw new Error('gradeApplicationPairwise: options.deps.runGraderPrompt must be a function (dependency injection required).');
  }

  const errors = [];
  for (let attempt = 1; attempt <= APPLICATION_PAIRWISE_MAX_ATTEMPTS; attempt += 1) {
    let raw;
    try {
      raw = runGraderPrompt(prompt, {
        grader: options.grader || 'claude',
        workspace: options.workspace,
        model: options.graderModel,
      });
    } catch (callError) {
      errors.push(`attempt ${attempt}: pairwise grader call failed: ${callError.message}`);
      continue;
    }

    let parsed;
    try {
      parsed = extractJsonObject(raw);
    } catch (parseError) {
      const preview = String(raw || '').slice(0, 200).replace(/\s+/g, ' ');
      errors.push(`attempt ${attempt}: JSON extraction failed (${parseError.message}); raw preview: "${preview}"`);
      continue;
    }

    if (typeof logGraderDiscrepancy === 'function') {
      logGraderDiscrepancy({ shape: 'application_pairwise_grader', testCase, run: 'pairwise', rawJudgeOutput: parsed });
    }
    return normalizeApplicationPairwiseGrade(parsed, { order: options.order });
  }

  throw new Error(
    `Application pairwise grader failed after ${APPLICATION_PAIRWISE_MAX_ATTEMPTS} attempts for case ${testCase.id} [${testCase.scenario_type || '?'}]:\n` +
      errors.map((e) => `  ${e}`).join('\n'),
  );
}

// ─── Verdict computation ──────────────────────────────────────────────────────

/**
 * Compute the per-case verdict by pairing the baseline and with_skill grades.
 *
 * Verdict mapping (from application-grader-prompt.md § "Per-case verdict from delta"):
 *   Real case, lift ≥ MIN_MEANINGFUL_DELTA on flag OR fix axis, fp_avoidance not regressed → applicable
 *   Real case, |delta| < MIN_MEANINGFUL_DELTA across all axes → no-lift (ceiling vs equivalent_on_frontier)
 *   Real case, regression ≥ MIN_MEANINGFUL_DELTA on flag OR fix axis → harmful
 *   Red-herring, fp_avoidance with_skill ≥ saturation AND ≥ baseline → applicable (red-herring clean)
 *   Red-herring, fp_avoidance with_skill < saturation AND < baseline → false_positive
 *   Any case, mixed signals (flag improved but fp regressed, etc.) → mixed
 */
function isBaselineSaturated({ baseline, redHerring }) {
  if (redHerring || !baseline || !baseline.axis_scores) return false;
  return APPLICATION_AXES.every(
    (axis) => Number(baseline.axis_scores[axis]) >= APPLICATION_BASELINE_SATURATION_THRESHOLD,
  );
}

function equivalentNoLiftVerdict({ baseline, redHerring }) {
  return isBaselineSaturated({ baseline, redHerring })
    ? 'not_discriminated_ceiling'
    : 'equivalent_on_frontier';
}

function computeApplicationPerCaseVerdict({ baseline, withSkill, redHerring, pairwise }) {
  if (!baseline || !withSkill) return 'redundant';

  const flagDelta = withSkill.axis_scores.flag_correctness - baseline.axis_scores.flag_correctness;
  const fixDelta = withSkill.axis_scores.fix_correctness - baseline.axis_scores.fix_correctness;
  const fpDelta = withSkill.axis_scores.false_positive_avoidance - baseline.axis_scores.false_positive_avoidance;
  const primaryDelta = withSkill.axis_scores.primary_signal_clarity - baseline.axis_scores.primary_signal_clarity;
  const baselineSaturated = isBaselineSaturated({ baseline, redHerring });

  // 0–100 delta bands: a lift/regression must clear MIN_MEANINGFUL_DELTA to beat
  // grader noise; below it is "no meaningful change." (Replaces the old integer
  // ±1 step on the 0/1/2 scale.)
  const D = APPLICATION_MIN_MEANINGFUL_DELTA;
  const flagLift = flagDelta >= D;
  const fixLift = fixDelta >= D;
  const flagDrop = flagDelta <= -D;
  const fixDrop = fixDelta <= -D;
  const fpDrop = fpDelta <= -D;
  const fpNoRegress = fpDelta > -D;
  const noLift =
    Math.abs(flagDelta) < D &&
    Math.abs(fixDelta) < D &&
    Math.abs(fpDelta) < D &&
    Math.abs(primaryDelta) < D;

  if (pairwise && pairwise.confidence > 0) {
    if (redHerring) {
      if (pairwise.preferred_run === 'baseline') {
        return 'false_positive';
      }
      if (pairwise.application_verdict === 'mixed') return 'mixed';
      return 'applicable';
    }

    if (pairwise.preferred_run === 'with_skill') {
      if (fpDrop || pairwise.application_verdict === 'mixed') return 'mixed';
      return 'applicable';
    }
    if (pairwise.preferred_run === 'baseline') {
      return 'harmful';
    }
    if (pairwise.application_verdict === 'mixed') return 'mixed';
    if (pairwise.application_verdict === 'equivalent_on_frontier') return 'equivalent_on_frontier';
  }

  if (redHerring) {
    const fpWithSkill = withSkill.axis_scores.false_positive_avoidance;
    const fpBaseline = baseline.axis_scores.false_positive_avoidance;
    if (fpWithSkill < APPLICATION_BASELINE_SATURATION_THRESHOLD && fpWithSkill < fpBaseline) return 'false_positive';
    if (fpWithSkill >= APPLICATION_BASELINE_SATURATION_THRESHOLD && fpWithSkill >= fpBaseline) return 'applicable';
    if (flagLift && fpDrop) return 'mixed';
    if (noLift) return 'redundant';
    return 'mixed';
  }

  // Real case
  if (flagDrop || fixDrop) return 'harmful';
  if ((flagLift || fixLift) && fpNoRegress) return 'applicable';
  if (noLift) {
    return baselineSaturated ? 'not_discriminated_ceiling' : 'equivalent_on_frontier';
  }
  if ((flagLift || fixLift) && fpDrop) return 'mixed';
  return equivalentNoLiftVerdict({ baseline, redHerring });
}

/**
 * Compute the aggregate per-skill verdict from all per-case results.
 *
 * Aggregate verdict rules (from plan + grader prompt):
 *   applicable    if ≥ 60% of real cases are `applicable` AND ≤ 20% of red herrings are `false_positive`
 *   redundant     if neither delta direction is measurable across cases
 *   harmful       if any real case is `harmful` OR > 20% of red herrings trigger `false_positive`
 *   mixed         if `applicable` on real cases but problematic on red herrings
 */
function computeApplicationAggregateVerdict(results) {
  const completed = results.filter((r) => !r.error);
  const realCases = completed.filter((r) => !r.red_herring);
  const redHerringCases = completed.filter((r) => r.red_herring);

  const realApplicableRatio = realCases.length > 0
    ? realCases.filter((r) => r.case_verdict === 'applicable').length / realCases.length
    : 0;
  const realHarmfulCount = realCases.filter((r) => r.case_verdict === 'harmful').length;
  const realRedundantRatio = realCases.length > 0
    ? realCases.filter((r) => r.case_verdict === 'redundant').length / realCases.length
    : 0;
  const realNotDiscriminatedRatio = realCases.length > 0
    ? realCases.filter((r) => r.case_verdict === 'not_discriminated_ceiling').length / realCases.length
    : 0;
  const realEquivalentRatio = realCases.length > 0
    ? realCases.filter((r) => r.case_verdict === 'equivalent_on_frontier').length / realCases.length
    : 0;
  const redHerringFalsePositiveRatio = redHerringCases.length > 0
    ? redHerringCases.filter((r) => r.case_verdict === 'false_positive').length / redHerringCases.length
    : 0;

  if (realHarmfulCount > 0 || redHerringFalsePositiveRatio > 0.2) return 'harmful';
  if (realApplicableRatio >= 0.6) return 'applicable';
  if (realNotDiscriminatedRatio >= 0.6) return 'not_discriminated_ceiling';
  if (realEquivalentRatio >= 0.6) return 'equivalent_on_frontier';
  if (realRedundantRatio >= 0.6) return 'redundant';
  return 'mixed';
}

// ─── History persistence ──────────────────────────────────────────────────────

/**
 * Lightweight schema check — warns on missing/wrong-type required fields. Does
 * NOT throw, so persistence is never broken by a malformed record (we want the
 * evidence in the log even if shape drifted).
 */
function validateApplicationRecord(record) {
  const required = [
    'timestamp', 'skill_name', 'case_id', 'scenario_type', 'red_herring',
    'run', 'trial_index', 'trials_total', 'axis_scores', 'weighted_score', 'passed',
    'provisional_verdict', 'trial_verdict', 'case_verdict', 'certification_tier',
  ];
  const missing = required.filter((k) => record[k] === undefined);
  if (missing.length > 0) {
    console.warn(`WARN: application history record missing fields: ${missing.join(', ')} (case_id=${record.case_id || '?'}, run=${record.run || '?'})`);
  }
  return missing.length === 0;
}

/**
 * Append application eval history records to APPLICATION_HISTORY_LOG (JSONL).
 *
 * Creates the log directory if it does not exist. History persistence does not
 * throw — eval runs continue regardless — but I/O failures are surfaced via
 * console.warn so an unsynced receipt does not silently disappear (SH-6481
 * SAL-7). Treat persisted history as the audit trail behind the Health Block
 * verdicts; losing it means a stamped application_verdict has no receipt to
 * point at.
 */
function persistApplicationHistory(entries) {
  try {
    const logDir = path.dirname(APPLICATION_HISTORY_LOG);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    for (const entry of entries) {
      validateApplicationRecord(entry);
      fs.appendFileSync(APPLICATION_HISTORY_LOG, JSON.stringify(entry) + '\n');
    }
  } catch (err) {
    console.warn(`WARN: application history persistence FAILED (${err.code || err.name}): ${err.message}`);
    console.warn(`      log path: ${APPLICATION_HISTORY_LOG}`);
    console.warn('      The eval verdicts (including any Health Block write-back) have no receipt to point at.');
  }
}

// ─── Main runner ──────────────────────────────────────────────────────────────

/**
 * Run the full application-shape eval pipeline for one eval file.
 *
 * @param {string} evalFile  - Path to an application.json eval file (must have `cases[]`).
 * @param {object} [options]
 * @param {string}   [options.workspace]  - Override the working directory for CLI calls.
 * @param {string}   [options.grader]     - Grader backend alias (default: 'claude').
 * @param {boolean}  [options.dryRun]     - Log planned work without making API calls.
 * @param {Set}      [options.caseIds]    - Optional Set<number> to filter cases to run.
 * @param {number}   [options.trials]     - Trials per case (default 3, recommended 3–5). Each
 *                  trial is an independent baseline+with-skill generate-then-grade pair; the
 *                  modal trial verdict becomes the per-case verdict and the modal-agreement
 *                  fraction is recorded as verdict_consistency.
 * @param {boolean}  [options.certifying] - Operator attests this is a cross-family dual-run
 *                  certifying configuration. ONLY a certifying run (asserted + declared families
 *                  differ) can stamp APPLICABLE; every other shape caps at PROVISIONAL.
 * @param {string}   [options.generatorFamily] - Declared family/model that produced responses
 *                  (provenance + cross-family check only; the runner never selects a model).
 * @param {string}   [options.graderFamily]    - Declared family/model that graded responses.
 * @param {string}   [options.graderModel]     - Model the runner invokes for grading (SH-6641).
 *                  Defaults to APPLICATION_GRADER_MODEL env or 'opus'. A judge of quality must be
 *                  top-tier — this overrides runGraderPrompt's DEFAULT_EVAL_MODEL ('sonnet') fallback.
 * @param {string}   [options.gradingMode]     - 'pairwise' (default) computes the trial verdict from
 *                  a blind A/B comparison while retaining pointwise axis grades for provenance.
 *                  'pointwise' keeps the legacy independent-grade delta path.
 * @param {string}   [options.calibrationReceipt] - Durable human-agreement receipt proving
 *                  the application grader is calibrated. Required before APPLICABLE can certify.
 * @param {object}   options.deps         - Injected runner helpers:
 *   @param {Function} options.deps.runGraderPrompt      - (prompt, { grader, workspace, model }) => string
 *   @param {Function} options.deps.getEvalResponse      - (prompt, { workspace, disableSlashCommands, allowTools }) => string
 *   @param {Function} [options.deps.logGraderDiscrepancy] - ({ shape, testCase, run, rawJudgeOutput }) => void
 * @returns {object} Summary of the eval run with aggregate_verdict and per-case results.
 */
function runApplicationEval(evalFile, options = {}) {
  const data = JSON.parse(fs.readFileSync(evalFile, 'utf8'));

  // Strict shape check — application eval files use `cases[]`, not `evals[]` (the
  // comprehension shape). If we see the wrong key, fail loudly so the user knows
  // which mode to invoke instead of silently doing nothing.
  if (!Array.isArray(data.cases)) {
    if (Array.isArray(data.evals)) {
      throw new Error(
        `Eval file ${evalFile} has 'evals[]' but no 'cases[]'. This looks like a comprehension eval set — use --comprehension instead of --application.`,
      );
    }
    throw new Error(`Eval file ${evalFile} has no 'cases[]' array (application layer requires this key).`);
  }

  const deps = options.deps || {};
  const getEvalResponse = deps.getEvalResponse;
  if (typeof getEvalResponse !== 'function') {
    throw new Error('runApplicationEval: options.deps.getEvalResponse must be a function (dependency injection required).');
  }

  const workspace = normalizeWorkspace(options.workspace || resolveWorkspaceFromEvalFile(evalFile));
  const skillDir = path.dirname(path.dirname(path.resolve(evalFile)));
  const skillName = data.skill_name || skillNameFromDir(skillDir);
  const skillKey = data.skill_key || skillHistoryKeyFromDir(skillDir);
  const subject = data.subject || skillName;
  const caseIds = options.caseIds || null;
  const allCases = data.cases;
  const cases = caseIds
    ? allCases.filter((testCase) => caseIds.has(Number(testCase.id)))
    : allCases;
  const realCaseCount = cases.filter((c) => !c.red_herring).length;
  const redHerringCaseCount = cases.filter((c) => c.red_herring).length;

  if (caseIds && cases.length === 0) {
    throw new Error(`No application cases matched requested ids: ${Array.from(caseIds).join(', ')}`);
  }

  const dryRun = Boolean(options.dryRun);

  // Trials per case. Default 3, recommended 3–5. Permit 1 (fast smoke / unit
  // tests with mocked deps) but warn outside the recommended range so a
  // production run does not silently under- or over-sample.
  const requestedTrials = Number(options.trials);
  const trials = Number.isFinite(requestedTrials) && requestedTrials >= 1
    ? Math.floor(requestedTrials)
    : APPLICATION_DEFAULT_TRIALS;
  const [trialMin, trialMax] = APPLICATION_RECOMMENDED_TRIAL_RANGE;
  if (trials < trialMin || trials > trialMax) {
    console.warn(`WARN: trials=${trials} is outside the recommended range ${trialMin}–${trialMax} (default ${APPLICATION_DEFAULT_TRIALS}). Proceeding — low trial counts give noisier per-case verdicts.`);
  }

  // Grader model (SH-6641). A judge of quality is top-tier (default Opus);
  // env APPLICATION_GRADER_MODEL overrides, an explicit options.graderModel
  // wins over both. Recorded on every history record as grader_model.
  const graderModel = options.graderModel || applicationGraderModel();
  const gradingMode = APPLICATION_GRADING_MODES.has(options.gradingMode)
    ? options.gradingMode
    : 'pairwise';

  // Generator model (SH-6661). The measured agent runs on an explicit FRONTIER
  // model (default 'opus'); the bidirectional runner threads each direction's
  // frontier here. Without this the injected getEvalResponse received no model
  // and the run threw on the first call.
  const generatorModel = options.generatorModel || applicationGeneratorModel();

  // Execution profile (lockstep parity). When supplied (the bidirectional runner
  // always supplies one), the generator runs with FULL repo/exec tools. WEB access
  // is a deliberate parameter that now defaults to OFF (the no-web baseline — see
  // eval-execution-profile.js header): the eval measures the skill's deployment
  // value, not web findability. Both arms run the same (no-web) policy; only the
  // skill differs, so parity holds. Without a profile, the legacy single-direction
  // default stays tools-OFF (already no-web). (Repo-on isolation for the default
  // single-direction CLI is a tracked follow-up — see isolated-eval-workspace.js.)
  const executionProfile = options.executionProfile
    || (options.toolsOn ? buildExecutionProfile({ cwd: workspace }) : null);
  const generatorAccess = executionProfile
    ? cliAccessForProfile(options.generator || 'claude', executionProfile)
    : null;
  const generatorAllowTools = generatorAccess ? generatorAccess.allowTools : false;
  const generatorWeb = generatorAccess ? generatorAccess.web : false;

  // ── Baseline-arm answer-key fence (eval validity) ──
  // The baseline arm runs in `baselineWorkspace` (default = workspace) so it cannot
  // filesystem-read the candidate SKILL.md. Research tools stay ON (parity preserved
  // on research, removed only on the answer key). Enforced when tools are ON — see
  // baseline-fence.js + the comprehension layer's mirror of this block.
  const baselineWorkspace = options.baselineWorkspace || workspace;
  assertBaselineSkillAbsent({ baselineWorkspace, skillDir, skillName, allowTools: generatorAllowTools });

  // Certification tier (default provisional). Only a declared, cross-family
  // certifying run can later stamp APPLICABLE; everything else is capped at
  // PROVISIONAL in stampApplicationVerdict. resolveCertificationTier never
  // selects a model — it records the operator's attestation.
  const certification = resolveCertificationTier({
    certifying: Boolean(options.certifying),
    generatorFamily: options.generatorFamily,
    graderFamily: options.graderFamily,
  });
  if (!APPLICATION_CERTIFICATION_TIERS.has(certification.tier)) {
    throw new Error(`resolveCertificationTier returned an unknown tier "${certification.tier}"`);
  }
  const calibration = resolveApplicationCalibration(options);

  console.log('\n=== Application-shape Evaluation ===');
  console.log(`Skill: ${skillName}`);
  console.log(`Subject: ${subject}`);
  console.log(`Workspace: ${workspace}`);
  console.log(`Cases: ${cases.length}  (real: ${realCaseCount}, red_herring: ${redHerringCaseCount})`);
  console.log(`Trials per case: ${trials}`);
  console.log(`Grader model: ${graderModel}  (env APPLICATION_GRADER_MODEL — default Opus; quality judging uses the strongest model)`);
  console.log(`Certification tier: ${certification.tier.toUpperCase()}  (${certification.reason})`);
  if (certification.tier !== 'certifying') {
    console.log(`  → APPLICABLE is capped to PROVISIONAL for this run (only a cross-family dual-run certifying run can earn APPLICABLE).`);
  }
  console.log(`Calibration: ${calibration.calibrated ? `CALIBRATED (${calibration.calibration_receipt})` : 'UNCALIBRATED — APPLICABLE caps to PROVISIONAL'}`);
  console.log(`Generator model: ${generatorModel}  (env APPLICATION_GENERATOR_MODEL — default Opus frontier; the measured agent — SH-6661)`);
  console.log(`Execution profile: ${executionProfile ? `tools-ON (${executionProfile.tools}/${executionProfile.research}, allowTools=${generatorAllowTools})` : 'tools-OFF (legacy single-direction default)'}`);
  if (caseIds) {
    console.log(`Case filter: ${Array.from(caseIds).sort((a, b) => a - b).join(', ')}`);
  }
  if (dryRun) {
    const generatorCalls = cases.length * 2 * trials;
    const pointwiseGraderCalls = cases.length * 2 * trials;
    const pairwiseGraderCalls = gradingMode === 'pairwise' ? cases.length * trials : 0;
    const graderCalls = pointwiseGraderCalls + pairwiseGraderCalls;
    console.log('');
    console.log(`DRY RUN — no API calls will be made.`);
    console.log(`Would invoke: ${generatorCalls} generator calls (${cases.length} cases × 2 runs × ${trials} trials) + ${pointwiseGraderCalls} pointwise grader calls${pairwiseGraderCalls ? ` + ${pairwiseGraderCalls} pairwise grader calls` : ''} = ${generatorCalls + graderCalls} total model invocations.`);
    console.log(`Would write: ${pointwiseGraderCalls} run records to ${APPLICATION_HISTORY_LOG}`);
    return {
      mode: 'application',
      dryRun: true,
      trials,
      grading_mode: gradingMode,
      certification_tier: certification.tier,
      calibrated: calibration.calibrated,
      calibration_receipt: calibration.calibration_receipt,
      red_herring_cases_total: redHerringCaseCount,
      red_herring_coverage_ok: redHerringCaseCount > 0,
      skillName,
      skillKey,
      subject,
      planned_generator_calls: generatorCalls,
      planned_grader_calls: graderCalls,
      planned_pointwise_grader_calls: pointwiseGraderCalls,
      planned_pairwise_grader_calls: pairwiseGraderCalls,
      planned_history_records: pointwiseGraderCalls,
    };
  }
  console.log('');
  console.log(`REAL RUN — about to invoke ${cases.length * 2 * trials} generator calls + ${cases.length * 2 * trials} pointwise grader calls${gradingMode === 'pairwise' ? ` + ${cases.length * trials} pairwise grader calls` : ''} (${cases.length} cases × ${trials} trials). ^C now to abort.`);
  console.log('');

  // Load the skill file once, then use it for the with_skill run. The runner
  // reads the resolved SKILL.md verbatim and wraps it in <skill> tags. No
  // frontmatter stripping - the body travels as-is, matching the comprehension
  // layer's behavior.
  const skillFile = path.join(skillDir, 'SKILL.md');
  const skillContent = fs.existsSync(skillFile) ? fs.readFileSync(skillFile, 'utf8') : '';
  if (!skillContent) {
    console.warn(`WARNING: SKILL.md not found at ${skillFile} — with_skill run will be identical to baseline (degenerate test).`);
  }

  const graderPromptTemplate = loadApplicationGraderPrompt();
  const pairwiseGraderPromptTemplate = gradingMode === 'pairwise'
    ? loadApplicationPairwiseGraderPrompt()
    : null;
  const timestamp = new Date().toISOString();
  const results = [];
  const historyEntries = [];

  for (const testCase of cases) {
    const redHerring = Boolean(testCase.red_herring);
    const primaryAxis = redHerring ? 'false_positive_avoidance' : 'flag_correctness';
    console.log(`  Case #${testCase.id} [${testCase.scenario_type || '?'}${redHerring ? ' / red_herring' : ''}]: ${String(testCase.question || '').slice(0, 64)}...`);

    try {
      // ── N trials per case. Each trial is an independent (baseline, with_skill)
      //    generate-then-grade pair. Repetition smooths the single-draw noise of
      //    same-judge grading; the modal trial verdict (not a mean of verdicts)
      //    becomes the authoritative per-case verdict, with the modal-agreement
      //    fraction recorded as verdict_consistency.
      const trialRecords = [];
      const trialVerdicts = [];
      const baselineGradesByTrial = [];
      const withSkillGradesByTrial = [];
      const pairwiseGradesByTrial = [];

      for (let trialIndex = 0; trialIndex < trials; trialIndex += 1) {
        // ── Baseline run: no skill loaded ── (skill-absent baselineWorkspace, tools ON)
        const baselinePrompt = buildApplicationGeneratorPrompt(testCase, { skillContent: '', skillName });
        const baselineResponse = getEvalResponse(baselinePrompt, {
          workspace: baselineWorkspace,
          model: generatorModel,
          generator: options.generator,
          disableSlashCommands: true,
          // Repo/exec tools ON when a bidirectional execution profile is supplied;
          // tools-OFF for the legacy default. WEB gated separately (generatorWeb —
          // default OFF: the no-web baseline). Both runs use the same level (parity).
          allowTools: generatorAllowTools,
          web: generatorWeb,
        });

        // ── With-skill run: skill body force-loaded into context ──
        const withSkillPrompt = buildApplicationGeneratorPrompt(testCase, { skillContent, skillName });
        const withSkillResponse = getEvalResponse(withSkillPrompt, {
          workspace,
          model: generatorModel,
          generator: options.generator,
          disableSlashCommands: true,
          allowTools: generatorAllowTools,
          web: generatorWeb,
        });

        // ── Grade both runs independently. The grader model is selected
        //    explicitly (graderModel, default Opus per SH-6641) — the runner
        //    does pick the GRADER model (a judge of quality must be top-tier);
        //    it still does NOT pick the GENERATOR model (getEvalResponse is the
        //    caller's injected CLI session).
        const graderOptions = {
          workspace,
          skillName,
          graderPromptTemplate,
          grader: options.grader || 'claude',
          graderModel,
          deps,
        };
        const baselineGrade = gradeApplicationResponse(testCase, baselineResponse, 'baseline', graderOptions);
        const withSkillGrade = gradeApplicationResponse(testCase, withSkillResponse, 'with_skill', graderOptions);
        const pairwiseOrder = (Number(testCase.id) + trialIndex) % 2 === 0
          ? ['baseline', 'with_skill']
          : ['with_skill', 'baseline'];
        const pairwiseGrade = gradingMode === 'pairwise'
          ? gradeApplicationPairwise(testCase, {
            baseline: baselineResponse,
            with_skill: withSkillResponse,
          }, {
            workspace,
            skillName,
            graderPromptTemplate: pairwiseGraderPromptTemplate,
            grader: options.grader || 'claude',
            graderModel,
            deps,
            order: pairwiseOrder,
          })
          : null;

        // ── Per-trial verdict (runner-owned, pairs both runs of THIS trial) ──
        const trialVerdict = computeApplicationPerCaseVerdict({
          baseline: baselineGrade,
          withSkill: withSkillGrade,
          redHerring,
          pairwise: pairwiseGrade,
        });

        const trialWeightedDelta = Number((withSkillGrade.weighted_score - baselineGrade.weighted_score).toFixed(4));
        const trialPrimaryDelta = withSkillGrade.axis_scores[primaryAxis] - baselineGrade.axis_scores[primaryAxis];
        const trialBaselineSaturated = isBaselineSaturated({ baseline: baselineGrade, redHerring });

        if (trials > 1) {
          console.log(
            `    trial ${trialIndex + 1}/${trials}  primary[${primaryAxis}]: ${baselineGrade.axis_scores[primaryAxis]}/100 → ${withSkillGrade.axis_scores[primaryAxis]}/100 (${trialPrimaryDelta >= 0 ? '+' : ''}${trialPrimaryDelta})  ` +
            `weighted: ${baselineGrade.weighted_score} → ${withSkillGrade.weighted_score} (${trialWeightedDelta >= 0 ? '+' : ''}${trialWeightedDelta})  ` +
            `${pairwiseGrade ? `pairwise=${pairwiseGrade.preferred_run}/${pairwiseGrade.confidence}  ` : ''}verdict=${trialVerdict}${trialBaselineSaturated ? '  baseline_saturated' : ''}`,
          );
        }

        trialVerdicts.push(trialVerdict);
        baselineGradesByTrial.push(baselineGrade);
        withSkillGradesByTrial.push(withSkillGrade);
        pairwiseGradesByTrial.push(pairwiseGrade);
        trialRecords.push({
          trial_index: trialIndex,
          baseline: baselineGrade,
          with_skill: withSkillGrade,
          pairwise: pairwiseGrade,
          baseline_saturated: trialBaselineSaturated,
          weighted_delta: trialWeightedDelta,
          primary_delta: trialPrimaryDelta,
          trial_verdict: trialVerdict,
        });
      }

      // ── Aggregate the trial set into the authoritative per-case verdict ──
      const trialAgg = aggregateTrialVerdicts(trialVerdicts);
      const caseVerdict = trialAgg.case_verdict;
      const baselineGrade = aggregateTrialGrades(baselineGradesByTrial);
      const withSkillGrade = aggregateTrialGrades(withSkillGradesByTrial);
      const baselineSaturated = isBaselineSaturated({ baseline: baselineGrade, redHerring });

      const weightedDelta = Number((withSkillGrade.weighted_score - baselineGrade.weighted_score).toFixed(4));
      const primaryDelta = Number((withSkillGrade.axis_scores[primaryAxis] - baselineGrade.axis_scores[primaryAxis]).toFixed(4));

      console.log(
        `    case_verdict=${caseVerdict}  (consistency ${trialAgg.verdict_consistency} across ${trials} trial${trials === 1 ? '' : 's'}${trialAgg.verdict_stable ? '' : ' — UNSTABLE'})  ` +
        `mean primary[${primaryAxis}]: ${baselineGrade.axis_scores[primaryAxis]} → ${withSkillGrade.axis_scores[primaryAxis]} (${primaryDelta >= 0 ? '+' : ''}${primaryDelta})  ` +
        `mean weighted: ${baselineGrade.weighted_score} → ${withSkillGrade.weighted_score} (${weightedDelta >= 0 ? '+' : ''}${weightedDelta})${baselineSaturated ? '  baseline_saturated' : ''}`,
      );

      results.push({
        id: testCase.id,
        scenario_type: testCase.scenario_type || 'unknown',
        red_herring: redHerring,
        criticality: testCase.criticality || 'normal',
        baseline: baselineGrade,
        with_skill: withSkillGrade,
        weighted_delta: weightedDelta,
        primary_delta: primaryDelta,
        case_verdict: caseVerdict,
        baseline_saturated: baselineSaturated,
        pairwise: pairwiseGradesByTrial.filter(Boolean),
        trials_total: trials,
        verdict_consistency: trialAgg.verdict_consistency,
        verdict_stable: trialAgg.verdict_stable,
        verdict_distribution: trialAgg.verdict_distribution,
        trial_verdicts: trialVerdicts.slice(),
      });

      // History records: one per RUN per TRIAL (2 × trials per case). The grader
      // stamps a provisional verdict_category per RUN; the runner pairs them per
      // trial (trial_verdict) and stamps the aggregate case_verdict on every
      // record so downstream tooling can group by case_id and read the truth from
      // any record. trial_index + trials_total make the trial set reconstructable.
      for (const trialRecord of trialRecords) {
        for (const [runName, grade] of [['baseline', trialRecord.baseline], ['with_skill', trialRecord.with_skill]]) {
          const record = {
            timestamp,
            skill: skillKey,
            skill_name: skillName,
            subject,
            case_id: testCase.id,
            scenario_type: testCase.scenario_type || 'unknown',
            red_herring: redHerring,
            criticality: testCase.criticality || 'normal',
            run: runName,
            trial_index: trialRecord.trial_index,
            trials_total: trials,
            // grader_model is the model the runner ACTUALLY invoked for grading
            // (APPLICATION_GRADER_MODEL, default Opus — SH-6641); recording it
            // keeps the receipt honest rather than hiding a silent model choice.
            // generator_model is still NOT invented — getEvalResponse is the
            // caller's injected CLI session, so the runner cannot know it. When
            // the operator DECLARES families (for the certifying-tier check),
            // they are recorded as declared_* provenance — the operator's
            // attestation, distinct from the grader_model the runner selected.
            grader_model: graderModel,
            // Concrete model id (or `latest-alias-unresolved` sentinel) — a bare
            // alias like "opus" cannot tell Opus 4.8 from 4.9, so a sentinel-tagged
            // score is not strictly comparable across dates. (SKI-41.)
            resolved_grader_model: resolveReceiptModelId(graderModel),
            // generator_model is now the model the runner ACTUALLY selected for the
            // measured agent (SH-6661, default Opus frontier) — no longer a silent
            // session default. execution_profile records the tools level both runs
            // used (parity within the direction).
            generator_model: generatorModel,
            resolved_generator_model: resolveReceiptModelId(generatorModel),
            execution_profile: executionProfile,
            // Model epoch — scores compare only within the same registry version.
            registry_version: REGISTRY_VERSION,
            ...(certification.generator_family ? { declared_generator_family: certification.generator_family } : {}),
            ...(certification.grader_family ? { declared_grader_family: certification.grader_family } : {}),
            certification_tier: certification.tier,
            calibrated: calibration.calibrated,
            calibration_receipt: calibration.calibration_receipt,
            axis_scores: grade.axis_scores,
            axis_reasoning: grade.axis_reasoning,
            axis_evidence: grade.axis_evidence,
            raw_score: grade.raw_score,
            max_raw_score: grade.max_raw_score,
            weighted_score: grade.weighted_score,
            primary_axis: grade.primary_axis,
            primary_axis_score: grade.primary_axis_score,
            passed: grade.passed,
            provisional_verdict: grade.verdict_category, // grader's per-run guess
            trial_verdict: trialRecord.trial_verdict, // runner's per-trial pairing
            case_verdict: caseVerdict, // runner's per-case authoritative verdict (modal across trials)
            grading_mode: gradingMode,
            baseline_saturated: trialRecord.baseline_saturated,
            ...(trialRecord.pairwise ? {
              pairwise_preferred_run: trialRecord.pairwise.preferred_run,
              pairwise_confidence: trialRecord.pairwise.confidence,
              pairwise_with_skill_delta: trialRecord.pairwise.with_skill_delta,
              pairwise_application_verdict: trialRecord.pairwise.application_verdict,
              pairwise_order: trialRecord.pairwise.order,
            } : {}),
            verdict_consistency: trialAgg.verdict_consistency,
            verdict_stable: trialAgg.verdict_stable,
            weighted_delta: trialRecord.weighted_delta,
            primary_delta: trialRecord.primary_delta,
          };
          historyEntries.push(record);
        }
      }
    } catch (error) {
      console.log(`    ERROR: ${error.message}`);
      results.push({
        id: testCase.id,
        scenario_type: testCase.scenario_type || 'unknown',
        red_herring: redHerring,
        criticality: testCase.criticality || 'normal',
        error: error.message,
      });
    }
  }

  // ── Aggregate per-skill verdict (runner-owned, computed from per-case verdicts) ──
  const completed = results.filter((r) => !r.error);
  const errorCount = results.length - completed.length;
  const aggregateVerdict = computeApplicationAggregateVerdict(completed);

  const realCases = completed.filter((r) => !r.red_herring);
  const redHerringCases = completed.filter((r) => r.red_herring);
  const realApplicableCount = realCases.filter((r) => r.case_verdict === 'applicable').length;
  const realRedundantCount = realCases.filter((r) => r.case_verdict === 'redundant').length;
  const realNotDiscriminatedCount = realCases.filter((r) => r.case_verdict === 'not_discriminated_ceiling').length;
  const realEquivalentCount = realCases.filter((r) => r.case_verdict === 'equivalent_on_frontier').length;
  const realHarmfulCount = realCases.filter((r) => r.case_verdict === 'harmful').length;
  const realMixedCount = realCases.filter((r) => r.case_verdict === 'mixed').length;
  const redHerringApplicableCount = redHerringCases.filter((r) => r.case_verdict === 'applicable').length;
  const redHerringFalsePositiveCount = redHerringCases.filter((r) => r.case_verdict === 'false_positive').length;
  const redHerringMixedCount = redHerringCases.filter((r) => r.case_verdict === 'mixed').length;
  const baselineSaturatedCount = realCases.filter((r) => r.baseline_saturated).length;
  const baselineSaturationRate = realCases.length > 0
    ? Number((baselineSaturatedCount / realCases.length).toFixed(4))
    : 0;
  const certificationBlockers = [];
  if (!calibration.calibrated) {
    certificationBlockers.push('application grader is uncalibrated; provide a durable calibration receipt before APPLICABLE can certify');
  }
  if (redHerringCases.length === 0) {
    certificationBlockers.push('application eval has zero red_herring:true cases; boundary behavior is untested');
  }
  const certificationCanEarnApplicable = certification.tier === 'certifying' && certificationBlockers.length === 0;

  // Verdict-stability rollup across the trial sets. Unstable cases (modal verdict
  // below the consistency threshold) are surfaced so a confident-looking
  // aggregate built on shaky per-case verdicts is visible, not hidden.
  const unstableCases = completed.filter((r) => r.verdict_stable === false);
  const meanConsistency = completed.length > 0
    ? Number((completed.reduce((acc, r) => acc + (Number(r.verdict_consistency) || 0), 0) / completed.length).toFixed(4))
    : 0;

  const summary = {
    mode: 'application',
    skillName,
    skillKey,
    subject,
    workspace,
    trials,
    grading_mode: gradingMode,
    generator_model: generatorModel,
    grader_model: graderModel,
    // Concrete model ids (or `latest-alias-unresolved` sentinel) for cross-date
    // score comparability — see the per-record note above. (SKI-41.)
    resolved_generator_model: resolveReceiptModelId(generatorModel),
    resolved_grader_model: resolveReceiptModelId(graderModel),
    execution_profile: executionProfile,
    certification_tier: certification.tier,
    certification_reason: certification.reason,
    calibrated: calibration.calibrated,
    calibration_receipt: calibration.calibration_receipt,
    red_herring_coverage_ok: redHerringCases.length > 0,
    certification_blockers: certificationBlockers,
    declared_generator_family: certification.generator_family,
    declared_grader_family: certification.grader_family,
    total: cases.length,
    completed: completed.length,
    errors: errorCount,
    real_cases_total: realCases.length,
    red_herring_cases_total: redHerringCases.length,
    real_applicable: realApplicableCount,
    real_redundant: realRedundantCount,
    real_not_discriminated_ceiling: realNotDiscriminatedCount,
    real_equivalent_on_frontier: realEquivalentCount,
    real_harmful: realHarmfulCount,
    real_mixed: realMixedCount,
    baseline_saturated_real_cases: baselineSaturatedCount,
    baseline_saturation_rate: baselineSaturationRate,
    red_herring_applicable: redHerringApplicableCount,
    red_herring_false_positive: redHerringFalsePositiveCount,
    red_herring_mixed: redHerringMixedCount,
    aggregate_verdict: aggregateVerdict,
    unstable_case_ids: unstableCases.map((r) => r.id),
    mean_verdict_consistency: meanConsistency,
    results,
  };

  console.log('\n=== Application Summary ===');
  console.log(`Completed: ${completed.length}/${cases.length}${errorCount > 0 ? ` (${errorCount} ERRORS — see RED FLAG below)` : ''}`);
  console.log(`Trials per case: ${trials}  grading_mode=${gradingMode}  (mean verdict consistency ${meanConsistency})`);
  if (unstableCases.length > 0) {
    console.log(`UNSTABLE case verdicts (consistency < ${APPLICATION_VERDICT_CONSISTENCY_THRESHOLD}): ${unstableCases.map((r) => `#${r.id}(${r.verdict_consistency})`).join(', ')} — treat these per-case verdicts as unsettled.`);
  }
  console.log(`Real cases (${realCases.length}): applicable=${realApplicableCount}, not_discriminated_ceiling=${realNotDiscriminatedCount}, equivalent_on_frontier=${realEquivalentCount}, redundant_legacy=${realRedundantCount}, harmful=${realHarmfulCount}, mixed=${realMixedCount}`);
  console.log(`Baseline saturation: ${baselineSaturatedCount}/${realCases.length} real cases (${baselineSaturationRate})`);
  console.log(`Red herrings (${redHerringCases.length}): clean=${redHerringApplicableCount}, false_positive=${redHerringFalsePositiveCount}, mixed=${redHerringMixedCount}`);
  if (certificationBlockers.length > 0) {
    console.log(`Certification blockers: ${certificationBlockers.join('; ')}`);
  }
  if (redHerringCases.length > 0 && redHerringFalsePositiveCount === 0 && redHerringMixedCount === 0) {
    console.log(`Red herring check: 0/${redHerringCases.length} false positives; boundary cases stayed silent.`);
  }
  console.log(`Aggregate verdict: ${aggregateVerdict.toUpperCase()}`);
  console.log(`Certification tier: ${certification.tier.toUpperCase()} — ${certificationCanEarnApplicable ? 'APPLICABLE is earnable from this run.' : 'APPLICABLE caps to PROVISIONAL unless every certification blocker is cleared.'}`);

  if (errorCount > 0) {
    console.log('');
    console.log('============================================================');
    console.log(`RED FLAG: ${errorCount}/${cases.length} cases errored (grader JSON parse failure, timeout, or candidate empty).`);
    console.log('This run is INCOMPLETE. Do not use its aggregate verdict as ground truth.');
    console.log('Errored case IDs:');
    for (const r of results) {
      if (r.error) {
        console.log(`  - case ${r.id} [${r.scenario_type}${r.red_herring ? ' / red_herring' : ''}]: ${r.error}`);
      }
    }
    console.log('============================================================');
  }

  if (aggregateVerdict === 'harmful') {
    const reasons = [];
    if (realHarmfulCount > 0) reasons.push(`${realHarmfulCount} real case(s) got worse with the skill loaded`);
    if (redHerringFalsePositiveCount > 0) reasons.push(`${redHerringFalsePositiveCount}/${redHerringCases.length} red-herring case(s) false-positive`);
    console.log(`RED FLAG: skill is operationally harmful — ${reasons.join('; ') || 'the aggregate verdict is harmful'}.`);
  } else if (aggregateVerdict === 'mixed') {
    if (redHerringFalsePositiveCount > 0 || redHerringMixedCount > 0) {
      console.log('WARNING: skill has mixed boundary behavior on red herrings — tighten boundary cases and anti_examples before promoting.');
    } else if (realMixedCount > 0) {
      console.log('WARNING: skill has mixed real-case behavior — some measured cases improve while others remain unsettled.');
    } else {
      console.log('WARNING: skill did not reach a dominant aggregate behavior on this case set.');
    }
  } else if (aggregateVerdict === 'applicable') {
    console.log('GREEN: skill measurably changes operational behavior in the direction it teaches AND stays silent on red herrings.');
  } else if (aggregateVerdict === 'not_discriminated_ceiling') {
    console.log('INCONCLUSIVE: baseline saturated on most real cases, so the eval had too little headroom to measure skill lift.');
  } else if (aggregateVerdict === 'equivalent_on_frontier') {
    console.log('NO FRONTIER LIFT: baseline had measurement headroom but the skill did not improve the measured frontier-model behavior on this case set.');
  }

  persistApplicationHistory(historyEntries);

  return summary;
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  // Constants
  APPLICATION_AXES,
  APPLICATION_AXIS_WEIGHTS_REAL,
  APPLICATION_AXIS_WEIGHTS_RED_HERRING,
  APPLICATION_VERDICT_CATEGORIES,
  APPLICATION_GRADER_MAX_ATTEMPTS,
  APPLICATION_PAIRWISE_MAX_ATTEMPTS,
  APPLICATION_GRADING_MODES,
  APPLICATION_HISTORY_LOG,
  resolveApplicationCalibration,
  APPLICATION_GRADER_PROMPT_PATH,
  APPLICATION_PAIRWISE_GRADER_PROMPT_PATH,
  APPLICATION_DEFAULT_TRIALS,
  APPLICATION_RECOMMENDED_TRIAL_RANGE,
  APPLICATION_VERDICT_CONSISTENCY_THRESHOLD,
  APPLICATION_CERTIFICATION_TIERS,
  // Functions
  loadApplicationGraderPrompt,
  loadApplicationPairwiseGraderPrompt,
  buildApplicationGeneratorPrompt,
  buildApplicationGraderPrompt,
  buildApplicationPairwiseGraderPrompt,
  normalizeApplicationGrade,
  normalizeApplicationPairwiseGrade,
  gradeApplicationResponse,
  gradeApplicationPairwise,
  computeApplicationPerCaseVerdict,
  computeApplicationAggregateVerdict,
  isBaselineSaturated,
  modelFamily,
  applicationGraderModel,
  resolveCertificationTier,
  aggregateTrialVerdicts,
  aggregateTrialGrades,
  validateApplicationRecord,
  persistApplicationHistory,
  runApplicationEval,
};
