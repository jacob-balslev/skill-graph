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
  REGISTRY_VERSION,
} = require('./skill-improvement-helpers');

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
  'harmful',
  'false_positive',
  'mixed',
]);

const APPLICATION_GRADER_MAX_ATTEMPTS = 3;
const APPLICATION_PAIRWISE_MAX_ATTEMPTS = 3;

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
  if (typeof env === 'string' && env.trim()) return env.trim();
  return APPLICATION_GRADER_DEFAULT_MODEL;
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
const APPLICATION_CERTIFICATION_TIERS = new Set(['certifying', 'provisional']);

// Vendor-family map for the cross-family certifying check. The runner does NOT
// select models (the operator sets the session model — see the OPERATOR-policy
// note above); these families are an operator *declaration* recorded for
// provenance and used only to decide whether a declared (generator, grader) pair
// is genuinely cross-family. Undeclared → cannot confirm cross-family →
// provisional. Aliases are matched case-insensitively by prefix/substring.
const MODEL_FAMILY_PATTERNS = [
  { family: 'anthropic', test: (s) => /\b(opus|sonnet|haiku|claude)\b/.test(s) },
  { family: 'openai', test: (s) => /\b(gpt|o1|o3|o4|codex|chatgpt|openai)\b/.test(s) },
  { family: 'google', test: (s) => /\b(gemini|palm|bard|gemma|google)\b/.test(s) },
  { family: 'meta', test: (s) => /\b(llama|meta)\b/.test(s) },
  { family: 'minimax', test: (s) => /\bminimax\b/.test(s) },
  { family: 'nvidia', test: (s) => /\bnemotron\b/.test(s) },
];

/**
 * Resolve a declared model/family alias to its vendor family, or null when the
 * alias is empty or unrecognised. A bare family name (e.g. 'anthropic') maps to
 * itself. Used only to decide cross-family eligibility for the certifying tier —
 * never to select or invoke a model.
 *
 * @param {string} alias  Operator-declared model name or family (e.g. 'opus',
 *   'gpt-5.4', 'gemini-3-pro', 'anthropic').
 * @returns {string|null} The vendor family, or null if undeclared/unknown.
 */
function modelFamily(alias) {
  if (!alias || typeof alias !== 'string') return null;
  const s = ` ${alias.toLowerCase().trim()} `;
  for (const { family } of MODEL_FAMILY_PATTERNS) {
    if (s.includes(` ${family} `)) return family;
  }
  for (const { family, test } of MODEL_FAMILY_PATTERNS) {
    if (test(s)) return family;
  }
  return null;
}

/**
 * Decide the certification tier for a run from operator declarations.
 *
 * A run earns the 'certifying' tier (the only tier from which APPLICABLE can be
 * stamped) ONLY when the operator explicitly asserts a certifying run AND the
 * declared generator/grader families are both known AND different. Every other
 * shape — no assertion, undeclared families, or same-family — is 'provisional',
 * which caps the stamped verdict at PROVISIONAL regardless of how strong the
 * aggregate delta is. Default-to-provisional is the safe direction: APPLICABLE
 * requires a deliberate, recorded cross-family attestation, never an accident.
 *
 * @param {object} opts
 * @param {boolean} [opts.certifying]        Operator asserts a certifying (cross-family dual-run) configuration.
 * @param {string}  [opts.generatorFamily]   Declared family/model that produced the responses.
 * @param {string}  [opts.graderFamily]      Declared family/model that graded the responses.
 * @returns {{ tier: string, reason: string, generator_family: (string|null), grader_family: (string|null) }}
 */
function resolveCertificationTier({ certifying, generatorFamily, graderFamily } = {}) {
  const genFam = modelFamily(generatorFamily);
  const gradeFam = modelFamily(graderFamily);
  const base = { generator_family: genFam, grader_family: gradeFam };
  if (!certifying) {
    return { tier: 'provisional', reason: 'no certifying assertion (default single-model / unattested tier)', ...base };
  }
  if (!genFam || !gradeFam) {
    return {
      tier: 'provisional',
      reason: `certifying asserted but family undeclared (generator=${genFam || 'unknown'}, grader=${gradeFam || 'unknown'}) — cannot confirm cross-family`,
      ...base,
    };
  }
  if (genFam === gradeFam) {
    return {
      tier: 'provisional',
      reason: `same-family judge (${genFam}) — self-preference inflation risk caps this at provisional`,
      ...base,
    };
  }
  return { tier: 'certifying', reason: `cross-family dual-run (${genFam} → ${gradeFam})`, ...base };
}

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
 * NOTE: This function is defined for completeness (forward-looking) but is not
 * currently called by runApplicationEval. It is exported so callers can use it
 * when implementing A/B comparison grading on top of the core dual-run pipeline.
 */
function buildApplicationPairwiseGraderPrompt(testCase, responses, { order, skillName, graderPromptTemplate }) {
  const firstKey = order[0];
  const secondKey = order[1];
  const labelFor = (key) => (key === 'baseline' ? 'Response A' : 'Response B');
  const responseFor = (key) => responses[key] || '(empty response)';

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
    'Return JSON only with this exact shape:',
    '{"preferred":"A|B|tie","confidence":0|1|2|3,"axis_scores":{"A":{"flag_correctness":0,"fix_correctness":0,"false_positive_avoidance":0,"primary_signal_clarity":0},"B":{"flag_correctness":0,"fix_correctness":0,"false_positive_avoidance":0,"primary_signal_clarity":0}},"axis_reasoning":{"A":{"flag_correctness":"","fix_correctness":"","false_positive_avoidance":"","primary_signal_clarity":""},"B":{"flag_correctness":"","fix_correctness":"","false_positive_avoidance":"","primary_signal_clarity":""}},"axis_evidence":{"A":{"flag_correctness":[],"fix_correctness":[],"false_positive_avoidance":[],"primary_signal_clarity":"headline|in_list|buried|absent"},"B":{"flag_correctness":[],"fix_correctness":[],"false_positive_avoidance":[],"primary_signal_clarity":"headline|in_list|buried|absent"}},"comparative_reasoning":"one sentence","with_skill_delta":"positive|neutral|negative|mixed"}',
    '',
    'Scoring rule for retained pointwise axes: use 0-5 integers, not 0-2.',
    '- 0 = absent or wrong.',
    '- 1 = weak hint only.',
    '- 2 = partial but secondary.',
    '- 3 = correct and usable.',
    '- 4 = strong and primary.',
    '- 5 = precise, non-obvious, primary, and mechanism-aware.',
    'Use 5 only when the response clearly surfaces the non-obvious skill-specific issue or boundary. A generic but correct answer is at most 3.',
    '',
    'Preference rule:',
    '- Prefer the response with materially better flag_correctness or fix_correctness on real cases, unless it introduces listed absent_signals.',
    '- Prefer the response with materially better false_positive_avoidance on red-herring cases.',
    '- Return tie only if neither response is meaningfully better after considering all axes.',
    '- Set with_skill_delta from the runner labels only if visible in the prompt metadata below; otherwise use neutral. The runner recomputes the final delta.',
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
    `## ${labelFor(firstKey)}`,
    '',
    responseFor(firstKey),
    '',
    `## ${labelFor(secondKey)}`,
    '',
    responseFor(secondKey),
    '',
    '## Hidden runner labels for auditability',
    '',
    `- ${labelFor(firstKey)} source: ${firstKey}`,
    `- ${labelFor(secondKey)} source: ${secondKey}`,
  ].join('\n');
}

// ─── Grade normalization ───────────────────────────────────────────────────────

/**
 * Coerce whatever shape the grader returned into the canonical application record.
 * Per the grader prompt spec: every axis is observable on every case (no nulls).
 * If the grader returns a non-0/1/2 value, coerce to 0 with a warning (contract violation).
 */
function normalizeApplicationGrade(grade, { redHerring }) {
  const weights = redHerring ? APPLICATION_AXIS_WEIGHTS_RED_HERRING : APPLICATION_AXIS_WEIGHTS_REAL;
  const rawScores = grade?.axis_scores || {};
  const axisScores = {};
  for (const axis of APPLICATION_AXES) {
    const rawValue = rawScores[axis];
    const numeric = Number(rawValue);
    if (numeric === 0 || numeric === 1 || numeric === 2) {
      axisScores[axis] = numeric;
    } else {
      console.warn(
        `WARN: application grader returned invalid score for axis "${axis}" (got ${JSON.stringify(rawValue)}) — coercing to 0 (grader contract violation).`,
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
    ? Number((weightedNumerator / (weightSum * 2)).toFixed(4))
    : 0;

  // Pass bar: primary-axis score ≥ 1 AND weighted_score ≥ 0.6.
  // Primary axis is flag_correctness on real cases; false_positive_avoidance on red herrings.
  const primaryAxis = redHerring ? 'false_positive_avoidance' : 'flag_correctness';
  const primaryScore = axisScores[primaryAxis];
  const passed = primaryScore >= 1 && weightedScore >= 0.6;

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
    max_raw_score: APPLICATION_AXES.length * 2,
    weighted_score: weightedScore,
    passed,
    verdict_category: verdictCategory,
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

// ─── Verdict computation ──────────────────────────────────────────────────────

/**
 * Compute the per-case verdict by pairing the baseline and with_skill grades.
 *
 * Verdict mapping (from application-grader-prompt.md § "Per-case verdict from delta"):
 *   Real case, delta ≥ +0.2 on flag OR fix axis, fp_avoidance ≥ 1 in with_skill → applicable
 *   Real case, |delta| < 0.2 across all axes → redundant
 *   Real case, delta < −0.2 on flag OR fix axis → harmful
 *   Red-herring, fp_avoidance with_skill = 2 AND ≥ baseline → applicable (red-herring clean)
 *   Red-herring, fp_avoidance with_skill ≤ 1 AND < baseline → false_positive
 *   Any case, mixed signals (flag improved but fp regressed, etc.) → mixed
 */
function computeApplicationPerCaseVerdict({ baseline, withSkill, redHerring }) {
  if (!baseline || !withSkill) return 'redundant';

  const flagDelta = withSkill.axis_scores.flag_correctness - baseline.axis_scores.flag_correctness;
  const fixDelta = withSkill.axis_scores.fix_correctness - baseline.axis_scores.fix_correctness;
  const fpDelta = withSkill.axis_scores.false_positive_avoidance - baseline.axis_scores.false_positive_avoidance;
  const primaryDelta = withSkill.axis_scores.primary_signal_clarity - baseline.axis_scores.primary_signal_clarity;

  if (redHerring) {
    const fpWithSkill = withSkill.axis_scores.false_positive_avoidance;
    const fpBaseline = baseline.axis_scores.false_positive_avoidance;
    if (fpWithSkill <= 1 && fpWithSkill < fpBaseline) return 'false_positive';
    if (fpWithSkill === 2 && fpWithSkill >= fpBaseline) return 'applicable';
    if (flagDelta > 0 && fpDelta < 0) return 'mixed';
    if (Math.abs(flagDelta) < 1 && Math.abs(fixDelta) < 1 && Math.abs(fpDelta) < 1 && Math.abs(primaryDelta) < 1) return 'redundant';
    return 'mixed';
  }

  // Real case
  if (flagDelta < 0 || fixDelta < 0) return 'harmful';
  if ((flagDelta >= 1 || fixDelta >= 1) && fpDelta >= 0) return 'applicable';
  if (Math.abs(flagDelta) < 1 && Math.abs(fixDelta) < 1 && Math.abs(fpDelta) < 1 && Math.abs(primaryDelta) < 1) return 'redundant';
  if ((flagDelta >= 1 || fixDelta >= 1) && fpDelta < 0) return 'mixed';
  return 'redundant';
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
  const redHerringFalsePositiveRatio = redHerringCases.length > 0
    ? redHerringCases.filter((r) => r.case_verdict === 'false_positive').length / redHerringCases.length
    : 0;

  if (realHarmfulCount > 0 || redHerringFalsePositiveRatio > 0.2) return 'harmful';
  if (realApplicableRatio >= 0.6 && redHerringFalsePositiveRatio <= 0.2) return 'applicable';
  if (realApplicableRatio >= 0.6 && redHerringFalsePositiveRatio > 0.2) return 'mixed';
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

  console.log('\n=== Application-shape Evaluation ===');
  console.log(`Skill: ${skillName}`);
  console.log(`Subject: ${subject}`);
  console.log(`Workspace: ${workspace}`);
  console.log(`Cases: ${cases.length}  (real: ${cases.filter((c) => !c.red_herring).length}, red_herring: ${cases.filter((c) => c.red_herring).length})`);
  console.log(`Trials per case: ${trials}`);
  console.log(`Grader model: ${graderModel}  (env APPLICATION_GRADER_MODEL — default Opus; quality judging uses the strongest model)`);
  console.log(`Certification tier: ${certification.tier.toUpperCase()}  (${certification.reason})`);
  if (certification.tier !== 'certifying') {
    console.log(`  → APPLICABLE is capped to PROVISIONAL for this run (only a cross-family dual-run certifying run can earn APPLICABLE).`);
  }
  console.log(`Generator + grader: claude CLI (session model — set by operator, NOT by this script)`);
  if (caseIds) {
    console.log(`Case filter: ${Array.from(caseIds).sort((a, b) => a - b).join(', ')}`);
  }
  if (dryRun) {
    const generatorCalls = cases.length * 2 * trials;
    const graderCalls = cases.length * 2 * trials;
    console.log('');
    console.log(`DRY RUN — no API calls will be made.`);
    console.log(`Would invoke: ${generatorCalls} generator calls (${cases.length} cases × 2 runs × ${trials} trials) + ${graderCalls} grader calls (same) = ${generatorCalls + graderCalls} total model invocations.`);
    console.log(`Would write: ${graderCalls} records to ${APPLICATION_HISTORY_LOG}`);
    return {
      mode: 'application',
      dryRun: true,
      trials,
      certification_tier: certification.tier,
      skillName,
      skillKey,
      subject,
      planned_generator_calls: generatorCalls,
      planned_grader_calls: graderCalls,
      planned_history_records: graderCalls,
    };
  }
  console.log('');
  console.log(`REAL RUN — about to invoke ${cases.length * 2 * trials} generator calls + ${cases.length * 2 * trials} grader calls (${cases.length} cases × 2 runs × ${trials} trials). ^C now to abort.`);
  console.log('');

  // Load the skill file once — used for the with_skill run. The skill body for an
  // archived skill lives at skills/_archived/<name>/SKILL.md; the runner reads it
  // verbatim and wraps it in <skill> tags. No frontmatter stripping — the body
  // travels as-is (matching the comprehension layer's behavior).
  const skillFile = path.join(skillDir, 'SKILL.md');
  const skillContent = fs.existsSync(skillFile) ? fs.readFileSync(skillFile, 'utf8') : '';
  if (!skillContent) {
    console.warn(`WARNING: SKILL.md not found at ${skillFile} — with_skill run will be identical to baseline (degenerate test).`);
  }

  const graderPromptTemplate = loadApplicationGraderPrompt();
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

      for (let trialIndex = 0; trialIndex < trials; trialIndex += 1) {
        // ── Baseline run: no skill loaded ──
        const baselinePrompt = buildApplicationGeneratorPrompt(testCase, { skillContent: '', skillName });
        const baselineResponse = getEvalResponse(baselinePrompt, {
          workspace,
          disableSlashCommands: true,
          allowTools: false,
        });

        // ── With-skill run: skill body force-loaded into context ──
        const withSkillPrompt = buildApplicationGeneratorPrompt(testCase, { skillContent, skillName });
        const withSkillResponse = getEvalResponse(withSkillPrompt, {
          workspace,
          disableSlashCommands: true,
          allowTools: false,
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

        // ── Per-trial verdict (runner-owned, pairs both runs of THIS trial) ──
        const trialVerdict = computeApplicationPerCaseVerdict({
          baseline: baselineGrade,
          withSkill: withSkillGrade,
          redHerring,
        });

        const trialWeightedDelta = Number((withSkillGrade.weighted_score - baselineGrade.weighted_score).toFixed(4));
        const trialPrimaryDelta = withSkillGrade.axis_scores[primaryAxis] - baselineGrade.axis_scores[primaryAxis];

        if (trials > 1) {
          console.log(
            `    trial ${trialIndex + 1}/${trials}  primary[${primaryAxis}]: ${baselineGrade.axis_scores[primaryAxis]}/2 → ${withSkillGrade.axis_scores[primaryAxis]}/2 (${trialPrimaryDelta >= 0 ? '+' : ''}${trialPrimaryDelta})  ` +
            `weighted: ${baselineGrade.weighted_score} → ${withSkillGrade.weighted_score} (${trialWeightedDelta >= 0 ? '+' : ''}${trialWeightedDelta})  verdict=${trialVerdict}`,
          );
        }

        trialVerdicts.push(trialVerdict);
        baselineGradesByTrial.push(baselineGrade);
        withSkillGradesByTrial.push(withSkillGrade);
        trialRecords.push({
          trial_index: trialIndex,
          baseline: baselineGrade,
          with_skill: withSkillGrade,
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

      const weightedDelta = Number((withSkillGrade.weighted_score - baselineGrade.weighted_score).toFixed(4));
      const primaryDelta = Number((withSkillGrade.axis_scores[primaryAxis] - baselineGrade.axis_scores[primaryAxis]).toFixed(4));

      console.log(
        `    case_verdict=${caseVerdict}  (consistency ${trialAgg.verdict_consistency} across ${trials} trial${trials === 1 ? '' : 's'}${trialAgg.verdict_stable ? '' : ' — UNSTABLE'})  ` +
        `mean primary[${primaryAxis}]: ${baselineGrade.axis_scores[primaryAxis]} → ${withSkillGrade.axis_scores[primaryAxis]} (${primaryDelta >= 0 ? '+' : ''}${primaryDelta})  ` +
        `mean weighted: ${baselineGrade.weighted_score} → ${withSkillGrade.weighted_score} (${weightedDelta >= 0 ? '+' : ''}${weightedDelta})`,
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
            // Model epoch — scores compare only within the same registry version.
            registry_version: REGISTRY_VERSION,
            ...(certification.generator_family ? { declared_generator_family: certification.generator_family } : {}),
            ...(certification.grader_family ? { declared_grader_family: certification.grader_family } : {}),
            certification_tier: certification.tier,
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
  const realHarmfulCount = realCases.filter((r) => r.case_verdict === 'harmful').length;
  const realMixedCount = realCases.filter((r) => r.case_verdict === 'mixed').length;
  const redHerringApplicableCount = redHerringCases.filter((r) => r.case_verdict === 'applicable').length;
  const redHerringFalsePositiveCount = redHerringCases.filter((r) => r.case_verdict === 'false_positive').length;
  const redHerringMixedCount = redHerringCases.filter((r) => r.case_verdict === 'mixed').length;

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
    certification_tier: certification.tier,
    certification_reason: certification.reason,
    declared_generator_family: certification.generator_family,
    declared_grader_family: certification.grader_family,
    total: cases.length,
    completed: completed.length,
    errors: errorCount,
    real_cases_total: realCases.length,
    red_herring_cases_total: redHerringCases.length,
    real_applicable: realApplicableCount,
    real_redundant: realRedundantCount,
    real_harmful: realHarmfulCount,
    real_mixed: realMixedCount,
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
  console.log(`Trials per case: ${trials}  (mean verdict consistency ${meanConsistency})`);
  if (unstableCases.length > 0) {
    console.log(`UNSTABLE case verdicts (consistency < ${APPLICATION_VERDICT_CONSISTENCY_THRESHOLD}): ${unstableCases.map((r) => `#${r.id}(${r.verdict_consistency})`).join(', ')} — treat these per-case verdicts as unsettled.`);
  }
  console.log(`Real cases (${realCases.length}): applicable=${realApplicableCount}, redundant=${realRedundantCount}, harmful=${realHarmfulCount}, mixed=${realMixedCount}`);
  console.log(`Red herrings (${redHerringCases.length}): applicable=${redHerringApplicableCount}, false_positive=${redHerringFalsePositiveCount}, mixed=${redHerringMixedCount}`);
  console.log(`Aggregate verdict: ${aggregateVerdict.toUpperCase()}`);
  console.log(`Certification tier: ${certification.tier.toUpperCase()} — ${certification.tier === 'certifying' ? 'APPLICABLE is earnable from this run.' : 'APPLICABLE caps to PROVISIONAL (not a cross-family dual-run).'}`);

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
    console.log('RED FLAG: skill is operationally harmful — loading it makes the candidate worse than baseline on a real case OR triggers >20% false positives on red herrings.');
  } else if (aggregateVerdict === 'mixed') {
    console.log('WARNING: skill is applicable on real cases but triggers on red herrings — body needs tighter boundary cases (anti_examples) before promoting.');
  } else if (aggregateVerdict === 'applicable') {
    console.log('GREEN: skill measurably changes operational behavior in the direction it teaches AND stays silent on red herrings.');
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
  APPLICATION_HISTORY_LOG,
  APPLICATION_GRADER_PROMPT_PATH,
  APPLICATION_DEFAULT_TRIALS,
  APPLICATION_RECOMMENDED_TRIAL_RANGE,
  APPLICATION_VERDICT_CONSISTENCY_THRESHOLD,
  APPLICATION_CERTIFICATION_TIERS,
  // Functions
  loadApplicationGraderPrompt,
  buildApplicationGeneratorPrompt,
  buildApplicationGraderPrompt,
  buildApplicationPairwiseGraderPrompt,
  normalizeApplicationGrade,
  gradeApplicationResponse,
  computeApplicationPerCaseVerdict,
  computeApplicationAggregateVerdict,
  modelFamily,
  applicationGraderModel,
  resolveCertificationTier,
  aggregateTrialVerdicts,
  aggregateTrialGrades,
  validateApplicationRecord,
  persistApplicationHistory,
  runApplicationEval,
};
