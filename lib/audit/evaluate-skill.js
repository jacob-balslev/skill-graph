'use strict';

// Comprehension and application evaluation runner for the Skill Audit Loop.
// Records durable receipts and sidecar verdict evidence.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { evaluateCandidateGate, countLines } = require('./skill-improvement-helpers');
const {
  parseFrontmatter,
} = require('../audit-shared/skill-frontmatter');
// ADR-0019: audit/eval verdicts + eval_* + freshness are written to the
// audit-state.json sidecar, NOT SKILL.md frontmatter.
const { writeSidecarFields } = require('./audit-state-sidecar');
// Bidirectional design: the comprehension gate reuses the SAME certification
// logic as the application gate, so PASS is reachable only from a certifying
// run with representative-generator provenance and frontier-judge evidence. The
// tools-ON execution profile carries the lockstep-parity invariant.
const { resolveCertificationTier, assertTopTierGraderModel } = require('../audit-shared/certification');
const { REPRESENTATIVE_GENERATOR_MODEL } = require('../audit-shared/model-provider');
const { buildExecutionProfile, cliAccessForProfile } = require('./eval-execution-profile');
const { assertBaselineSkillAbsent } = require('./baseline-fence');
const { writeRunnerHeartbeat } = require('./panel-status-file');
const {
  startAgentTelemetry,
  finishAgentTelemetry,
  appendSkillTelemetry,
  TELEMETRY_FILENAME,
} = require('./agent-telemetry');

/**
 * Skill A/B and matrix evaluator.
 *
 * Supports per-eval filtering so interrupted runs can be resumed case-by-case
 * instead of restarting the whole suite.
 */

// Durable eval-result home. Results used to default to ephemeral .cache/
// (gitignored, GC-able) while the stamped verdict recorded only at/status/runner
// — so a verdict could outlive its evidence (Break #4). They now default to a
// durable per-skill dir under the portable LOG_DIR (agent-orchestration/logs in
// the monorepo, .skill-graph/logs standalone — resolved by log-paths.js so this
// file stays portable for `npm install -g @skill-graph/cli`), and the application
// receipt records the workspace-relative artifact path so the verdict always
// points at durable evidence.
function durableEvalResultPath(skillSlug) {
  const slug = (skillSlug || 'unknown').toString().replace(/[^a-zA-Z0-9_-]+/g, '-');
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(LOG_DIR, 'eval-results', slug, `${ts}.json`);
}

// Comprehension grader defaults.
//
// Quality JUDGING uses the strongest model — the grader defaults to Opus.
// Per ~/Development/.claude/rules/no-lesser-models-for-quality.md and the pilot
// grader contract (lib/audit/graders/concept-grader-prompt.md: "Grader model
// (pilot): Opus 4.6"), a lesser model must never score skill quality. ADR 0011
// Change 3 originally demoted this grader to Haiku 4.5 for token cost; that
// grader-model demotion is SUPERSEDED (2026-05-29) — see the ADR's amendment
// block. The token-cost mitigation is the baseline-skip early-exit below (do
// not grade a concept the model already knows), NOT a weak grader.
//
//   COMPREHENSION_GRADER_MODEL  — claude model alias for the grader.
//     Default: 'opus'. May be overridden to 'gpt-5.4' (the other
//     contract-named top grader). Do not set a lesser model for graded quality.
//   COMPREHENSION_BASELINE_SKIP_THRESHOLD — float 0.0–100.0. If
//     `avg_primary_baseline` after the first 2 completed Comprehension cases is >=
//     this threshold, the run aborts the dual-run and writes
//     `comprehension_verdict: SKIPPED_BASELINE_HIGH`. Default: 90.
//     The skip means "the agent already understands the concept WITHOUT the skill,
//     so the skill cannot demonstrate lift" — that is only true near the 100 ceiling.
//     At the old midpoint the skip fired on half-understood concepts, exactly the
//     cells where a good skill can create meaningful lift. 90 = near-saturation.
//     Set to 101 to disable (always run full eval set).
//
// See docs/adr/0011-split-audit-verdict-into-four-verdicts.md (and its
// 2026-05-29 amendment on the grader-model reversal).
const DEFAULT_COMPREHENSION_GRADER_MODEL = 'opus';
const DEFAULT_COMPREHENSION_BASELINE_SKIP_THRESHOLD = 90;
const COMPREHENSION_BASELINE_SKIP_MIN_EVALS = 2;

function comprehensionGraderModel() {
  const env = process.env.COMPREHENSION_GRADER_MODEL;
  // SH-6626: validate the env OVERRIDE against the top-tier allowlist — a quality judge
  // must never be silently downgraded to a lesser tier (Haiku/Sonnet/Flash/MiniMax/
  // Nemotron). Fail closed; the default is already the strongest tier.
  if (env && env.trim().length > 0) {
    return assertTopTierGraderModel(env.trim(), { source: 'COMPREHENSION_GRADER_MODEL' });
  }
  return DEFAULT_COMPREHENSION_GRADER_MODEL;
}

// The GENERATOR is the agent being MEASURED — it answers the comprehension
// questions baseline-vs-with-skill.
//
// Default representative generator (SKI-306): the measured subject is the
// deployment-representative agent population, while the quality judges stay frontier.
// This gives the eval headroom to measure whether the skill teaches an agent that
// benefits from curated context. This is NOT a no-lesser-models violation: that rule
// governs the GRADER, and the grader remains top-tier. Override with
// COMPREHENSION_GENERATOR_MODEL when deliberately measuring another subject.
const DEFAULT_COMPREHENSION_GENERATOR_MODEL = REPRESENTATIVE_GENERATOR_MODEL;

function comprehensionGeneratorModel() {
  const env = process.env.COMPREHENSION_GENERATOR_MODEL;
  if (env && env.trim().length > 0) return env.trim();
  return DEFAULT_COMPREHENSION_GENERATOR_MODEL;
}

function comprehensionBaselineSkipThreshold() {
  const env = process.env.COMPREHENSION_BASELINE_SKIP_THRESHOLD;
  if (env === undefined || env === '') return DEFAULT_COMPREHENSION_BASELINE_SKIP_THRESHOLD;
  const parsed = Number(env);
  if (Number.isFinite(parsed)) return parsed;
  return DEFAULT_COMPREHENSION_BASELINE_SKIP_THRESHOLD;
}

const REMOVED_FLAGS = [
  'generator-model',
  'grader-model',
  'force-same-model',
  'generator-timeout-ms',
  'grader-timeout-ms',
];

const BOOLEAN_FLAGS = new Set([
  'dry-run',
  'comprehension',
  'regression-gate',
  // Audit B2 (2026-05-27): explicit opt-in that the run is a single-model
  // self-assessment, not an independent dual-run grader. When set, the strong
  // verdicts PASS (comprehension) / APPLICABLE (application) are downgraded
  // to PROVISIONAL so the Health Block reflects the actual confidence tier.
  'single-model',
  // SH-6624/SKI-306: explicit operator attestation that the application run is a
  // certifying configuration. Without it (the default), the application run is
  // provisional-capped and APPLICABLE is unreachable — the in-code form of
  // "never UNVERIFIED→APPLICABLE without evidence". Pair with
  // --generator-family / --grader-family (declared, not selected — the runner
  // never picks a model) so the tier check can confirm the measured subject and
  // frontier judge provenance.
  'certifying',
  // Tools-ON parity (two-frontier bidirectional design): run the generator with
  // FULL tools so it can research repo+web. Builds the lockstep execution profile
  // from --workspace as cwd. The bidirectional runner sets this for both directions.
  'tools-on',
]);

// ─── Eval history persistence ────────────────────────────────────
//
// Log paths are resolved via log-paths.js which supports env-var overrides
// and falls back to a standalone-safe location when agent-orchestration/logs/
// is not present (e.g., after `npm install -g @skill-graph/cli`).
const {
  EVAL_HISTORY_LOG,
  COMPREHENSION_HISTORY_LOG,
  LOG_DIR,
  WORKSPACE,
} = require('./log-paths');
// Grader prompts ship bundled with this package under lib/audit/graders/, so
// The path is resolved relative to __dirname (bundled graders/) so this works
// standalone without a parent monorepo. (SH-6304)
const CONCEPT_GRADER_PROMPT_PATH = path.join(__dirname, 'graders', 'concept-grader-prompt.md');

// ─── Grader-math discrepancy observability ──────────────────────────
// Telemetry log for grader-math discrepancies: whenever the judge's stated
// raw_score / weighted_score / passed disagrees with the deterministic
// recomputation, we log a record here for calibration analysis. The
// downstream normalize* functions still correct the math, so this is
// observability — not a fail signal. Set EVAL_STRICT_VALIDATION=1 to make
// discrepancies fail the run. The validator (grader-output-validator.js) is
// bundled alongside this runner; the require is wrapped so a missing validator
// degrades to a no-op rather than breaking eval runs.
const GRADER_DISCREPANCY_LOG = path.join(LOG_DIR, 'grader-math-discrepancies.jsonl');

let validatorModule = null;
function getValidator() {
  if (!validatorModule) {
    try {
      validatorModule = require('./grader-output-validator');
    } catch {
      validatorModule = { validate: null };
    }
  }
  return validatorModule;
}

function logGraderDiscrepancy({ shape, testCase, run, rawJudgeOutput }) {
  const { validate } = getValidator();
  if (typeof validate !== 'function') return null;
  let result;
  try {
    result = validate(rawJudgeOutput);
  } catch {
    return null;
  }
  if (!result || result.valid) return result;
  try {
    const logDir = path.dirname(GRADER_DISCREPANCY_LOG);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const entry = {
      timestamp: new Date().toISOString(),
      shape,
      eval_id: testCase?.id,
      dimension: testCase?.dimension,
      red_herring: testCase?.red_herring || false,
      run,
      issues: result.issues,
    };
    fs.appendFileSync(GRADER_DISCREPANCY_LOG, JSON.stringify(entry) + '\n');
  } catch {
    // never break eval runs
  }
  if (process.env.EVAL_STRICT_VALIDATION === '1') {
    const summary = result.issues.map((i) => `${i.code}(${i.dim || i.axis || i.label || ''})`).join(', ');
    throw new Error(`grader output failed validator (strict mode): ${summary}`);
  }
  return result;
}

// ─── Understanding-field provenance (v6) ────────────────────────────
// Reads the skill's frontmatter and reports which source carries the
// Understanding fields. v6 promotes them to flat top-level keys; v5 skills
// still use the nested `concept.*` block. The comprehension grader treats
// both as valid (matches v6 schema's allOf rule). This helper exposes the
// source so the eval run can log it and the Health Block writer can stamp
// freshness only when an Understanding source actually exists.

const UNDERSTANDING_FLAT_FIELDS_EVAL = [
  'mental_model',
  'purpose',
  'concept_boundary',
  'analogy',
  'misconception',
];

// Deprecated-alias fallback (ADR-0018): the top-level Understanding field
// `boundary` was renamed `concept_boundary`. The legacy nested `concept` block
// also keys it as `boundary`. readUnderstandingField reads the canonical name
// first, then the alias — so migrated, unmigrated-flat, and legacy-concept
// skills all resolve.
const UNDERSTANDING_FIELD_ALIASES_EVAL = { concept_boundary: 'boundary' };

function readUnderstandingField(obj, field) {
  if (obj && typeof obj[field] === 'string' && obj[field].trim().length > 0) return obj[field];
  const alias = UNDERSTANDING_FIELD_ALIASES_EVAL[field];
  if (alias && obj && typeof obj[alias] === 'string' && obj[alias].trim().length > 0) return obj[alias];
  return null;
}

function extractUnderstandingFromFrontmatter(skillContent) {
  const fm = parseFrontmatter(skillContent || '');
  const flat = {};
  let flatHits = 0;
  for (const field of UNDERSTANDING_FLAT_FIELDS_EVAL) {
    const val = readUnderstandingField(fm, field);
    if (val !== null) {
      flat[field] = val;
      flatHits += 1;
    }
  }
  if (flatHits === UNDERSTANDING_FLAT_FIELDS_EVAL.length) {
    return { source: 'flat', fields: flat, partial: false };
  }
  const concept = fm.concept && typeof fm.concept === 'object' ? fm.concept : null;
  if (concept) {
    const conceptFields = {};
    let conceptHits = 0;
    for (const field of UNDERSTANDING_FLAT_FIELDS_EVAL) {
      const val = readUnderstandingField(concept, field);
      if (val !== null) {
        conceptFields[field] = val;
        conceptHits += 1;
      }
    }
    if (conceptHits === UNDERSTANDING_FLAT_FIELDS_EVAL.length) {
      return { source: 'concept', fields: conceptFields, partial: false };
    }
    if (conceptHits > 0) {
      return { source: 'concept', fields: conceptFields, partial: true };
    }
  }
  if (flatHits > 0) {
    return { source: 'flat', fields: flat, partial: true };
  }
  return { source: 'none', fields: {}, partial: true };
}

// ─── v6 Health Block writer ────────────────────────────────────────
// After an eval run completes, writes the eval_score, eval_failed_ids, and
// freshness fields to the skill's frontmatter. eval_score is a 0.0–5.0
// scalar derived per-mode:
//   - comprehension: avg_with_skill_score_ratio × 5 (capped 0..5)
//   - ab / matrix:   (candidatePassed / total) × 5
// eval_failed_ids is the list of test-case IDs whose candidate run did NOT
// pass. freshness is today's ISO date (YYYY-MM-DD). Other frontmatter is
// preserved verbatim by updateFrontmatterFields().

function deriveEvalScoreAndFailures(mode, result) {
  if (!result || typeof result !== 'object') {
    return { score: null, failedIds: [] };
  }
  if (mode === 'comprehension') {
    const ratio = Number(result.avg_with_skill_score_ratio);
    const score = Number.isFinite(ratio)
      ? Number(Math.max(0, Math.min(5, ratio * 5)).toFixed(2))
      : null;
    const failedIds = Array.isArray(result.results)
      ? result.results
          .filter((r) => {
            if (r.error) return true;
            const verdict = r.with_skill && r.with_skill.verdict_category;
            // Anything other than the explicitly-passing categories counts as a fail.
            return !(verdict === 'correct' || verdict === 'passed');
          })
          .map((r) => String(r.id))
      : [];
    return { score, failedIds };
  }
  // ab / matrix modes — runEval and runMatrixEval expose a result.results[]
  // with .candidate.passed booleans.
  const total = Number(result.total) || (Array.isArray(result.results) ? result.results.length : 0);
  const candidatePassed = Number(result.candidatePassed);
  const score = total > 0 && Number.isFinite(candidatePassed)
    ? Number(Math.max(0, Math.min(5, (candidatePassed / total) * 5)).toFixed(2))
    : null;
  const failedIds = Array.isArray(result.results)
    ? result.results
        .filter((r) => r.error || !(r.candidate && r.candidate.passed === true))
        .map((r) => String(r.id))
    : [];
  return { score, failedIds };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function writeHealthFieldsFromEvalResult(evalFile, mode, result) {
  const skillDir = path.dirname(path.dirname(path.resolve(evalFile)));
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) {
    return { written: false, reason: 'SKILL.md not found', skillFile };
  }
  const { score, failedIds } = deriveEvalScoreAndFailures(mode, result);
  if (score === null) {
    return { written: false, reason: 'no derivable score', skillFile };
  }
  // ADR-0019: eval_score / eval_failed_ids / freshness live in the sidecar.
  // eval_score is a number in the sidecar schema (was stringified in frontmatter).
  const res = writeSidecarFields(skillFile, {
    eval_score: Number(score),
    eval_failed_ids: failedIds,
    freshness: todayIsoDate(),
  });
  if (!res.written) {
    return { written: false, reason: 'unchanged', skillFile, score, failedIds };
  }
  return { written: true, skillFile, sidecar: res.path, score, failedIds };
}

function persistEvalHistoryWithMetadata(skillMeta, results) {
  try {
    const logDir = path.dirname(EVAL_HISTORY_LOG);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const timestamp = new Date().toISOString();
    const skillName = skillMeta?.skillName || 'unknown';
    const skillKey = skillMeta?.skillKey || skillName;
    const skillScope = String(skillKey).startsWith('sales-hub/') ? 'sales-hub' : 'shared';
    for (const r of results) {
      if (r.error) continue; // Skip errored evals
      const entry = {
        timestamp,
        skill: skillKey,
        skill_name: skillName,
        skill_scope: skillScope,
        eval_id: r.id,
        passed: r.candidate.passed,
        score: r.candidate.score,
        failure_category: r.candidate.failure_category || 'correct',
        missing_expectations: r.candidate.missing_expectations || [],
        criticality: r.criticality || 'normal',
        baseline_passed: r.baseline.passed,
        baseline_score: r.baseline.score,
      };
      fs.appendFileSync(EVAL_HISTORY_LOG, JSON.stringify(entry) + '\n');
    }
  } catch (err) {
    // History persistence does not throw — eval runs continue regardless — but
    // I/O failures are surfaced so an unsynced receipt does not silently
    // disappear (SH-6481 SAL-7). The receipt is the audit trail behind any
    // stamped Health Block verdict; losing it means the verdict has no proof.
    console.warn(`WARN: eval history persistence FAILED (${err.code || err.name}): ${err.message}`);
    console.warn(`      log path: ${EVAL_HISTORY_LOG}`);
    console.warn('      Eval verdicts (including any Health Block write-back) have no receipt to point at.');
  }
}

const {
  buildSkillInvocationPrompt,
  skillNameFromDir,
  skillHistoryKeyFromDir,
  resolveModelExecutor,
  resolveReceiptModelId,
  extractJsonObject,
  OPENCODE_CLI,
  REGISTRY_VERSION,
} = require('./skill-improvement-helpers');

function parseArgs(argv) {
  const args = {};
  const positional = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const key = token.slice(2);
    if (BOOLEAN_FLAGS.has(key)) {
      args[key] = true;
      continue;
    }

    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return { args, positional };
}

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

function parseEvalIds(rawValue) {
  if (!rawValue) return null;

  const ids = String(rawValue)
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value));

  if (ids.length === 0) {
    throw new Error(`Invalid --eval-id value: ${rawValue}`);
  }

  return new Set(ids);
}

function inferEvalMode(evalFile) {
  try {
    const data = JSON.parse(fs.readFileSync(evalFile, 'utf8'));
    if (Array.isArray(data.evals) && (data.skill_name || data.subject)) {
      return 'comprehension';
    }
  } catch {
    // Fall back to legacy AB mode when the file cannot be inspected here.
  }
  return 'ab';
}

// extractJsonObject is imported from skill-improvement-helpers.js

function buildJudgePrompt(testCase, response) {
  return [
    'You are grading an answer against a grounded skill-eval rubric.',
    'Return JSON only with this exact shape:',
    '{"passed":boolean,"score":number,"matched_expectations":string[],"missing_expectations":string[],"failure_category":string,"notes":string}',
    '',
    'Grading methodology (from evaluation skill):',
    '- Score on 6 dimensions: Accuracy (factual correctness against repo truth), Completeness (all expectations addressed), Actionability (concrete guidance, not vague advice), Specificity (project-specific, not generic), Consistency (no contradictions within response), Edge-case coverage (handles boundary conditions)',
    '- Weight: score = 0.4*accuracy + 0.2*completeness + 0.15*actionability + 0.1*specificity + 0.1*consistency + 0.05*edge_coverage',
    '- A response that is stylistically polished but factually wrong scores LOW. Facts beat prose.',
    '- "skill_not_activated" means the response could have come from the base model without the skill — the skill added no value.',
    '- "over_general" means the response gives generic advice instead of project-specific guidance grounded in actual repo files.',
    '- "hallucinated_path" is the most damaging failure: inventing files, APIs, or functions that don\'t exist. Score 0 for accuracy.',
    '',
    'Rules:',
    '- score is between 0 and 1',
    '- passed is true only if all critical expectations are met',
    '- use expectation text verbatim in matched_expectations and missing_expectations',
    '- do not reward style if the factual content is wrong',
    '- failure_category must be exactly one of: "correct" (eval passed), "wrong_answer" (factually incorrect), "missing_context" (right direction but missing detail), "hallucinated_path" (invented file/API/function), "over_general" (generic answer, not project-specific), "skill_not_activated" (base model answered without using skill knowledge)',
    '',
    'Original task:',
    testCase.prompt,
    '',
    'Expected output summary:',
    testCase.expected_output || '',
    '',
    'Expectations:',
    ...(testCase.expectations || []).map((expectation, index) => `${index + 1}. ${expectation}`),
    '',
    'Candidate response:',
    response,
  ].join('\n');
}

// Strip only the vars that make the claude subprocess think it IS a Claude Code
// session (which causes it to inherit or re-enter session state). Auth vars
// (ANTHROPIC_API_KEY, profile state) are intentionally preserved so the subprocess
// can authenticate non-interactively — stripping them triggers the interactive
// `[claude-account-switch] Select a profile:` picker (SKI-133).
//
// If the grader subprocess shows the picker despite these guards, set
// CLAUDE_GRADER_BIN to the absolute path of an authenticated claude binary —
// see runClaudeCliPrompt().
function sanitizedEnv() {
  const env = { ...process.env };
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_ENTRYPOINT;
  return env;
}

// 2026-05-17: previously this function stripped stderr/stdout and returned
// "Evaluation command failed" regardless of cause. That hid the real reason
// (rate-limit, auth, session) and produced silent-eval-failure-after-first-run
// (resumption-prompt finding #3). The CLI surfaces concrete diagnostic text in
// stderr — we preserve it (truncated to 2KB) so the operator can see why a
// run died. Exit code and signal are also surfaced when present.
function formatCommandError(command, args, error) {
  const stderr = typeof error?.stderr === 'string' ? error.stderr.trim() : String(error?.stderr || '').trim();
  const stdout = typeof error?.stdout === 'string' ? error.stdout.trim() : String(error?.stdout || '').trim();
  const exitCode = error?.status !== undefined && error?.status !== null ? ` (exit ${error.status})` : '';
  const signal = error?.signal ? ` (signal ${error.signal})` : '';
  // Surface the arg count in the failure label (SH-6657) — a compact, bloat-free
  // signal of which invocation failed without dumping a multi-KB prompt arg.
  const argsLabel = Array.isArray(args) && args.length ? ` [${args.length} arg(s)]` : '';
  const cmdLabel = `${command}${argsLabel}${exitCode}${signal}`;

  const parts = [`Evaluation command failed: ${cmdLabel}`];
  if (stderr) parts.push(`stderr: ${stderr.slice(0, 2000)}`);
  // SKI-133: stdout is always surfaced when non-empty (previous `&& !stderr` guard
  // hid the `[claude-account-switch] Select a profile:` picker text that the claude
  // binary prints to stdout, making the picker failure look like a silent exit with
  // no diagnostic — the very worst case for an unattended grader loop).
  if (stdout) parts.push(`stdout: ${stdout.slice(0, 2000)}`);
  if (!stderr && !stdout && error instanceof Error && error.message) {
    parts.push(`message: ${error.message}`);
  }
  return parts.join(' | ');
}

// 5-minute default ceiling per CLI call. Without this the Claude/OpenCode/Gemini
// shell-out can hang indefinitely on a stalled API call, which made finding #3
// look like a silent crash instead of a stuck process. Override with
// SKILL_AUDIT_CLI_TIMEOUT_MS=<ms> when running long-context grader prompts.
const CLI_TIMEOUT_MS = Number(process.env.SKILL_AUDIT_CLI_TIMEOUT_MS || 5 * 60 * 1000);

function runCommand(command, args, options) {
  try {
    return execFileSync(command, args, {
      cwd: options.cwd,
      encoding: 'utf8',
      env: sanitizedEnv(),
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
      timeout: CLI_TIMEOUT_MS,
      // npm-installed CLIs (claude, opencode, gemini) live as .cmd shims on
      // Windows; execFileSync without a shell cannot resolve PATHEXT, so the
      // call fails with spawnSync ENOENT. shell:true on win32 routes through
      // cmd.exe which performs the extension search.
      shell: process.platform === 'win32',
    }).trim();
  } catch (error) {
    throw new Error(formatCommandError(command, args, error), { cause: error });
  }
}

// ─── Codex resolved-model capture (SH-6680) ──────────────────────────────────
//
// The `gpt-5.5` role omits the `-m` flag so Codex serves its own current GPT
// model (zero-touch newest-GPT). resolveModelExecutor therefore returns model:null
// for it, and the bidirectional receipt would carry the honest `latest-alias-
// unresolved` sentinel — which caps the run to PROVISIONAL (we cannot prove WHICH
// concrete model graded/generated). But `codex exec`'s default (non-JSON) output
// prints a header block that names the model it actually used:
//
//   OpenAI Codex v0.130.0
//   --------
//   workdir: /private/tmp
//   model: gpt-5.5
//   provider: openai
//   ...
//
// We parse that `model:` line from the real run output (no extra probe call) and
// surface it so runEvalDirection can replace the sentinel with the resolved id —
// which (with parity + cross-family) unblocks APPLICABLE/PASS. gpt-5.5 is
// deterministic per install, so the same value applies to whichever role (generator
// or grader) ran Codex in a direction. The capture is reset per direction so a
// recorded value always reflects THIS direction's run, never a stale one.

let lastCodexModel = null;

/**
 * Parse the resolved model id from `codex exec` default output.
 * @param {string} stdout  Raw codex stdout (its header carries `model: <id>`).
 * @returns {string|null}  The model id (e.g. 'gpt-5.5'), or null if no header line.
 */
function extractCodexModel(stdout) {
  if (!stdout || typeof stdout !== 'string') return null;
  // Anchor to a header-shaped `model:` line: line-start, a model-id-looking token
  // (letters/digits then word chars, dots, hyphens, slashes). `.match` returns the
  // FIRST occurrence, and the header is always printed before any agent text — so
  // this picks the header line, not a stray "model:" inside the response prose.
  const m = stdout.match(/^model:\s*([A-Za-z0-9][\w.\-/]*)\s*$/m);
  return m ? m[1] : null;
}

/** Record the codex model from a run's output (no-op if no header line found). */
function recordCodexModelFromOutput(stdout) {
  const model = extractCodexModel(stdout);
  if (model) lastCodexModel = model;
  return stdout;
}

/** The codex model captured since the last reset, or null if none seen. */
function getResolvedCodexModel() {
  return lastCodexModel;
}

/** Clear the per-direction codex-model capture (call before a direction's run). */
function resetCodexModelCapture() {
  lastCodexModel = null;
}

// Marker string printed by the claude account-switch picker to stdout when no
// authenticated profile is available. Detecting it in the response lets us throw
// an actionable error before the downstream JSON-parse fails silently (SKI-133).
const CLAUDE_PICKER_MARKER = '[claude-account-switch]';

function runClaudeCliPrompt(prompt, {
  workspace,
  model = 'opus',
  disableSlashCommands = false,
  allowTools = false,
  // web: when tools are ON, gate websearch separately. Default true preserves the
  // legacy "tools ON ⇒ web ON" behavior for any non-eval caller; the eval generators
  // pass web:false (the no-web baseline — see eval-execution-profile.js header).
  web = true,
}) {
  // SKI-133: CLAUDE_GRADER_BIN allows operators to override the resolved 'claude'
  // binary when the default PATH resolution reaches an account-switch picker wrapper.
  // Typical use: CLAUDE_GRADER_BIN=/usr/local/bin/claude (or the absolute path from
  // `command -v claude` in a non-session shell). Leave unset to use the PATH default.
  const claudeBin = process.env.CLAUDE_GRADER_BIN || 'claude';
  const args = ['-p', prompt];
  // SKI-177: only pass --model when a non-empty model id is present. A null/empty
  // model (e.g. resolveModelExecutor('gpt-5.5').model === null reaching a
  // mis-routed claude path) would otherwise be coerced by execFileSync into the
  // literal string '--model null', which the claude CLI rejects ('unknown model:
  // null') or silently defaults — with no useful diagnostic either way. Omitting
  // the flag lets the CLI use its own default.
  if (typeof model === 'string' && model.trim() !== '') {
    args.push('--model', model);
  }
  args.push(
    '--output-format',
    'text',
    '--permission-mode',
    'default',
    '--no-session-persistence',
  );
  if (!allowTools) {
    args.push('--disallowed-tools', 'Read,Edit,Write,Bash,Glob,Grep,Agent,WebSearch,WebFetch,NotebookEdit');
  } else if (!web) {
    // Tools ON but web OFF: keep repo/exec tools, disable only websearch (the
    // no-web eval baseline — both arms run this way; only the skill differs).
    // Same tool names as the full disallow list above.
    args.push('--disallowed-tools', 'WebSearch,WebFetch');
  }
  if (disableSlashCommands) {
    args.push('--disable-slash-commands');
  }

  const response = runCommand(claudeBin, args, { cwd: workspace });

  // SKI-133: fail loudly when the picker menu appeared instead of a model response.
  // The picker prints its header to stdout (not stderr), so it arrives here as the
  // "response". Downstream JSON-parse or eval-score logic would silently produce a
  // zero-score / UNVERIFIED verdict, with no operator visibility into the root cause.
  if (response.includes(CLAUDE_PICKER_MARKER)) {
    throw new Error(
      `claude subprocess returned the account-switch picker instead of a model response ` +
      `("${CLAUDE_PICKER_MARKER}" detected in stdout). ` +
      `The grader cannot authenticate non-interactively from this context. ` +
      `Fix options: (1) set CLAUDE_GRADER_BIN=<absolute-path-to-authenticated-claude-binary>; ` +
      `(2) set ANTHROPIC_API_KEY in the subprocess environment; ` +
      `(3) ensure the claude profile is logged in (run 'claude' interactively once).`,
    );
  }

  return response;
}

// Up to 4 attempts on empty CLI output. Without per-attempt logging this loop
// previously absorbed silent failures — finding #3 (2026-05-17): subsequent
// evals after the first run returned '' four times in a row with no operator
// visibility into why. Now we narrate each retry and the final exhaustion so
// rate-limit / auth / session-degradation patterns are visible in the log.
function getEvalResponse(prompt, options) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = runPromptWithCli(prompt, options);
    if (response !== '') {
      if (attempt > 0) {
        console.warn(`    [getEvalResponse] succeeded on attempt ${attempt + 1}/4 after ${attempt} empty response(s)`);
      }
      return response;
    }
    if (attempt < 3) {
      console.warn(`    [getEvalResponse] attempt ${attempt + 1}/4 returned empty response — retrying`);
    }
  }

  console.warn('    [getEvalResponse] all 4 attempts returned empty — returning ""');
  return '';
}

function appendEvalAgentTelemetry({ skillDir, skillName, phase, model, backend, tier, start, ok = true, status, stdout, stderr, error, extra }) {
  if (!skillDir) return;
  try {
    const entry = finishAgentTelemetry(start || startAgentTelemetry({
      skill: skillName || skillNameFromDir(skillDir),
      operation: 'evaluate',
      phase,
      model,
      backend,
      tier,
    }), {
      ok,
      status,
      stdout,
      stderr,
      error,
      extra,
    });
    appendSkillTelemetry(skillDir, entry);
  } catch (_) {
    // Eval receipts must never make an eval fail; the CLI result is still authoritative.
  }
}

function runPromptWithCli(prompt, {
  workspace,
  model,
  // SKI-176: default to null, NOT 'claude'. A truthy 'claude' default made
  // `generator || resolvedCli` (below) always resolve to 'claude', so a caller
  // that supplied model='gpt-5.5' but omitted `generator` silently ran the
  // claude CLI — and then handed resolvedModel=null to runClaudeCliPrompt, which
  // produced the literal arg '--model null' (SKI-177). With null, the model-derived
  // resolvedCli wins unless a caller explicitly overrides the backend via `generator`.
  generator = null,
  disableSlashCommands = false,
  allowTools = false,
  // web: gate websearch when tools are ON. Default true preserves legacy "tools ON ⇒
  // web ON". Eval generators pass web:false (the no-web baseline). Cleanly enforced
  // on the claude CLI (--disallowed-tools WebSearch,WebFetch); best-effort on
  // gemini/codex (see the per-CLI branches below).
  web = true,
  skillDir = null,
  skillName = null,
  telemetryRun = null,
  telemetryEvalId = null,
  telemetryTrialIndex = null,
}) {
  // The generator REASONS to produce the eval answer; it must be supplied explicitly
  // by the caller or defaulted through the representative-generator role. A missing
  // model is never allowed to fall through to a CLI's uncontrolled default.
  if (!model) {
    throw new Error(
      'runPromptWithCli: no generator model supplied. The eval generator must run on an '
      + 'explicit measured-subject model — never a silent CLI default.',
    );
  }
  const { cli: resolvedCli, model: resolvedModel } = resolveModelExecutor(model);
  const cli = generator || resolvedCli;
  const telemetryStart = startAgentTelemetry({
    skill: skillName || (skillDir ? skillNameFromDir(skillDir) : null),
    operation: 'evaluate',
    phase: 'generator',
    model,
    backend: cli,
    tier: 'generator',
  });

  try {
    let response;
    if (cli === 'claude') {
      response = runClaudeCliPrompt(prompt, {
        workspace,
        model: resolvedModel,
        disableSlashCommands,
        allowTools,
        web,
      });
    } else if (cli === 'gemini') {
      // LIMITATION: gemini --yolo has no clean per-tool web disable, so a web:false
      // request cannot be enforced here. Surface it rather than silently allowing web
      // — for a clean no-web baseline use claude (or codex). (The certifying
      // judge pair is claude+codex; gemini-as-generator is an edge case.)
      if (allowTools && !web) {
        console.warn('    [runPromptWithCli] gemini: web:false requested but --yolo cannot disable websearch — running web-ON (best-effort).');
      }
      response = runCommand(cli, ['--yolo', '-m', resolvedModel, '-p', prompt], {
        cwd: workspace,
      });
    } else if (cli === 'codex') {
      // `gpt-5.5` role: omit `-m` so Codex serves its own current GPT model
      // (zero-touch newest-GPT). A concrete model is passed only when one is pinned.
      // GPT-5.5 review F2: make the sandbox EXPLICIT rather than inheriting the
      // operator's codex default — the GENERATOR is the measured agent, so when
      // tools-ON (allowTools) it gets workspace-write (repo read + skills-tree write);
      // when tools-OFF it gets read-only. --skip-git-repo-check keeps it working in
      // sparse/sandboxed worktrees.
      // WEB: codex `workspace-write` denies network by default, so web:false is the
      // natural state (no web-enabling flag is added). web:true relies on the operator's
      // codex network config — best-effort, not enforced here.
      const args = ['exec', '--skip-git-repo-check', '-s', allowTools ? 'workspace-write' : 'read-only'];
      if (resolvedModel) args.push('-m', resolvedModel);
      args.push(prompt);
      // SH-6680: capture the resolved model from codex's output header so the
      // direction receipt can report which concrete GPT actually generated.
      response = recordCodexModelFromOutput(runCommand('codex', args, { cwd: workspace }));
    } else {
      response = runCommand(
        cli,
        ['run', '--dir', workspace, '-m', resolvedModel, '--format', 'default', prompt],
        { cwd: workspace },
      );
    }
    appendEvalAgentTelemetry({
      skillDir, skillName, phase: 'generator', model, backend: cli, tier: 'generator',
      start: telemetryStart, stdout: response,
      extra: { run: telemetryRun, eval_id: telemetryEvalId, trial_index: telemetryTrialIndex, allow_tools: allowTools, web, disable_slash_commands: disableSlashCommands },
    });
    return response;
  } catch (e) {
    appendEvalAgentTelemetry({
      skillDir, skillName, phase: 'generator', model, backend: cli, tier: 'generator',
      start: telemetryStart, ok: false, status: 'failed', error: e.message,
      extra: { run: telemetryRun, eval_id: telemetryEvalId, trial_index: telemetryTrialIndex, allow_tools: allowTools, web, disable_slash_commands: disableSlashCommands },
    });
    throw e;
  }
}

/**
 * Run the grader LLM and return its raw text response.
 *
 * **OpenCode JSON format**:
 *   OpenCode outputs newline-delimited JSON events; this function extracts the final
 *   `{type: 'text', part: {text: string}}` event's `.part.text` field as the
 *   grader's response. Eval authors must ensure the grader prompt instructs the
 *   model to return JSON with the shape defined in buildJudgePrompt.
 *
 * @param {string} prompt - The judge prompt to send to the grader model.
 * @param {object} options
 * @param {'opencode'|'claude'|'gemini'} [options.grader='claude'] - Grader backend.
 * @param {string} options.workspace - Working directory for the grader CLI.
 * @returns {string} Raw grader response text (expected to contain a JSON object).
 */
function runGraderPrompt(prompt, {
  grader = 'claude',
  workspace,
  model,
  skillDir = null,
  skillName = null,
  telemetryRun = null,
  telemetryEvalId = null,
  telemetryTrialIndex = null,
}) {
  const telemetryStart = startAgentTelemetry({
    skill: skillName || (skillDir ? skillNameFromDir(skillDir) : null),
    operation: 'evaluate',
    phase: 'grader',
    model,
    backend: grader,
    tier: 'grader',
  });
  const recordSuccess = (response, backend = grader, modelAlias = model) => {
    appendEvalAgentTelemetry({
      skillDir, skillName, phase: 'grader', model: modelAlias, backend, tier: 'grader',
      start: telemetryStart, stdout: response,
      extra: { run: telemetryRun, eval_id: telemetryEvalId, trial_index: telemetryTrialIndex },
    });
    return response;
  };
  const recordFailure = (error, backend = grader, modelAlias = model) => {
    appendEvalAgentTelemetry({
      skillDir, skillName, phase: 'grader', model: modelAlias, backend, tier: 'grader',
      start: telemetryStart, ok: false, status: 'failed', error: error.message,
      extra: { run: telemetryRun, eval_id: telemetryEvalId, trial_index: telemetryTrialIndex },
    });
  };

  if (grader === 'claude') {
    // FAIL CLOSED (SH-6664): a grader is a QUALITY JUDGE — it must never silently
    // run on a weak model. The old `model || <weak default>` fallback meant a
    // caller that forgot to thread the grader model silently graded with Sonnet.
    // The grader model must be supplied explicitly by the visible top-level
    // options layer (comprehensionGraderModel() / applicationGraderModel(),
    // default the strongest tier). No model => throw, never substitute down.
    if (!model) {
      throw new Error(
        'runGraderPrompt: no grader model supplied. A quality judge must run on an '
        + 'explicit strong-tier model (e.g. the opus role). '
        + 'Thread the grader model from the top-level options layer — never fall back to a weak default.',
      );
    }
    try {
      return recordSuccess(runClaudeCliPrompt(prompt, {
        workspace,
        model,
        disableSlashCommands: true,
      }), 'claude', model);
    } catch (e) {
      recordFailure(e, 'claude', model);
      throw e;
    }
  }

  if (grader === 'gemini') {
    // FAIL CLOSED (SKI-40): a grader is a QUALITY JUDGE. The Gemini CLI's
    // default model is uncontrolled — the workspace Gemini tooling defaults to
    // Flash (scripts/model/gemini-batch.js), a lesser tier banned for judging by
    // no-lesser-models-for-quality. Resolve the frontier Gemini (gemini-pro)
    // explicitly, assert it is top-tier (a `flash` request throws), and pass it
    // via -m so the grader never silently runs on whatever the CLI picks.
    const { model: resolvedGeminiModel } = resolveModelExecutor(model || 'gemini');
    assertTopTierGraderModel(resolvedGeminiModel, { source: 'gemini grader model' });
    try {
      return recordSuccess(runCommand('gemini', ['-p', prompt, '-m', resolvedGeminiModel, '--sandbox'], { cwd: workspace }), 'gemini', model || 'gemini');
    } catch (e) {
      recordFailure(e, 'gemini', model || 'gemini');
      throw e;
    }
  }

  // Codex grader branch (bidirectional "Codex judge" direction: representative
  // generator answers → Codex judges). Without this branch a codex grader silently fell
  // through to the OpenCode GPT route, so the receipt's grader identity disagreed
  // with the requested `gpt-5.5` role. `gpt-5.5` omits -m so Codex
  // serves its own current GPT (zero-touch newest-GPT); a concrete model is passed
  // only when one is pinned. The grader prompt instructs JSON-only output and the
  // downstream extractJsonObject tolerates a preamble. (Partially addresses SH-6665.)
  if (grader === 'codex') {
    const exec = resolveModelExecutor(model || 'gpt-5.5');
    // SKI-178: Codex cannot run a Claude model. If the requested grader model
    // resolves to the claude CLI (e.g. the default 'opus' from
    // comprehensionGraderModel(), or the 'opus' role), route
    // to gpt-5.5 semantics (omit -m → Codex serves its own current GPT)
    // instead of passing a Claude alias to `codex exec -m`, which Codex does not
    // recognize ('unknown model' or a silent default — no useful signal either way).
    const resolvedModel = exec.cli === 'claude' ? null : exec.model;
    // GPT-5.5 review F3: a GRADER is a closed-packet judge — it grades the fixed
    // prompt+response and must NOT browse mid-grade (non-determinism). Run read-only,
    // no workspace write, --skip-git-repo-check for sparse worktrees.
    const args = ['exec', '--skip-git-repo-check', '-s', 'read-only'];
    if (resolvedModel) args.push('-m', resolvedModel);
    args.push(prompt);
    // SH-6680: capture the resolved model from codex's output header so the
    // direction receipt can report which concrete GPT actually graded.
    try {
      return recordSuccess(recordCodexModelFromOutput(runCommand('codex', args, { cwd: workspace })), 'codex', model || 'gpt-5.5');
    } catch (e) {
      recordFailure(e, 'codex', model || 'gpt-5.5');
      throw e;
    }
  }

  // Default backend: the pinned OpenCode GPT route (MODEL_LATEST.gptOpenCode).
  // FAIL CLOSED (SKI-40): assert the resolved pin is a top-tier judge, so a future
  // registry drift that points gptOpenCode at a lesser tier fails closed here
  // rather than silently grading quality on a weak model.
  const { model: resolvedGraderModel } = resolveModelExecutor('gpt-5.4');
  assertTopTierGraderModel(resolvedGraderModel, { source: 'opencode grader model (MODEL_LATEST.gptOpenCode)' });
  let raw;
  try {
    raw = runCommand(OPENCODE_CLI, ['run', '--dir', workspace, '-m', resolvedGraderModel, '--format', 'json', prompt], {
      cwd: workspace,
    });
  } catch (e) {
    recordFailure(e, 'opencode', 'gpt-5.4');
    throw e;
  }

  const lines = String(raw || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let finalText = '';
  for (const line of lines) {
    try {
      const event = JSON.parse(line);
      if (event?.type === 'text' && typeof event?.part?.text === 'string') {
        finalText = event.part.text;
      }
    } catch {
      // Ignore malformed/non-JSON lines and let downstream extraction fail loudly.
    }
  }

  recordSuccess(raw, 'opencode', 'gpt-5.4');
  return finalText || raw;
}

const VALID_FAILURE_CATEGORIES = ['correct', 'wrong_answer', 'missing_context', 'hallucinated_path', 'over_general', 'skill_not_activated'];

function normalizeGrade(grade) {
  const category = typeof grade.failure_category === 'string' && VALID_FAILURE_CATEGORIES.includes(grade.failure_category)
    ? grade.failure_category
    : (grade.passed ? 'correct' : 'wrong_answer');
  return {
    passed: Boolean(grade.passed),
    score: Number.isFinite(Number(grade.score)) ? Number(grade.score) : 0,
    matched_expectations: Array.isArray(grade.matched_expectations) ? grade.matched_expectations : [],
    missing_expectations: Array.isArray(grade.missing_expectations) ? grade.missing_expectations : [],
    failure_category: category,
    notes: typeof grade.notes === 'string' ? grade.notes : '',
  };
}

function getCriticalityWeight(value) {
  const normalized = String(value || 'normal').toLowerCase();
  if (normalized === 'critical') return 4;
  if (normalized === 'important') return 2;
  return 1;
}

function computeWilsonLowerBound(passed, total, z = 1.96) {
  if (!Number.isFinite(total) || total <= 0) return 0;
  const p = Math.max(0, Math.min(1, passed / total));
  const z2 = z * z;
  const denominator = 1 + z2 / total;
  const center = p + z2 / (2 * total);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * total)) / total);
  return Number(((center - margin) / denominator).toFixed(4));
}

function percentile(sortedValues, fraction) {
  if (!Array.isArray(sortedValues) || sortedValues.length === 0) return 0;
  const safeFraction = Math.max(0, Math.min(1, fraction));
  const index = Math.floor((sortedValues.length - 1) * safeFraction);
  return sortedValues[index];
}

function summarizeEvalMetrics(results, evalCases, gradeKey) {
  const evalCaseById = new Map((evalCases || []).map((testCase) => [Number(testCase.id), testCase]));
  const completed = results.filter((entry) => !entry.error && entry[gradeKey]);
  const passCount = completed.filter((entry) => entry[gradeKey].passed).length;
  const scoreDeltas = completed
    .map((entry) => Number((entry.candidate.score - entry.baseline.score).toFixed(4)))
    .sort((left, right) => left - right);

  let weightedTotal = 0;
  let weightedAchieved = 0;
  let criticalPassCount = 0;
  let criticalTotal = 0;
  const failureCategories = {};

  for (const entry of completed) {
    const evalCase = evalCaseById.get(Number(entry.id)) || {};
    const criticality = evalCase.criticality || evalCase.severity || 'normal';
    const weight = getCriticalityWeight(criticality);
    const grade = entry[gradeKey];
    const quality = 0.7 * (grade.passed ? 1 : 0) + 0.3 * grade.score;

    weightedTotal += weight;
    weightedAchieved += weight * quality;

    if (weight === 4) {
      criticalTotal += 1;
      if (grade.passed) criticalPassCount += 1;
    }

    if (!grade.passed) {
      const category = grade.failure_category || 'wrong_answer';
      failureCategories[category] = (failureCategories[category] || 0) + 1;
    }
  }

  return {
    completed_evals: completed.length,
    error_count: results.length - completed.length,
    passed_evals: passCount,
    pass_rate: completed.length > 0 ? Number((passCount / completed.length).toFixed(4)) : 0,
    weighted_quality_score: weightedTotal > 0 ? Number((weightedAchieved / weightedTotal).toFixed(4)) : 0,
    wilson_lower_bound: computeWilsonLowerBound(passCount, completed.length),
    critical_total: criticalTotal,
    critical_passed: criticalPassCount,
    failure_categories: failureCategories,
    median_score_delta: scoreDeltas.length > 0 ? Number(percentile(scoreDeltas, 0.5).toFixed(4)) : 0,
    p10_score_delta: scoreDeltas.length > 0 ? Number(percentile(scoreDeltas, 0.1).toFixed(4)) : 0,
  };
}

function gradeResponse(testCase, response, options) {
  const raw = runGraderPrompt(buildJudgePrompt(testCase, response), options);
  return normalizeGrade(extractJsonObject(raw));
}

// ─── Comprehension (added 2026-04-08) ───────────────────────────
// Plan: docs/plans/concept-comprehension-layer.md
// Design: test whether the model understands the *concept* of a skill's subject,
// not just whether it can quote facts from the skill file. See the grader prompt
// at lib/audit/graders/concept-grader-prompt.md for the criteria.

const CONCEPT_DIMENSIONS = [
  'definition',
  'mental_model',
  'purpose',
  'boundary',
  'taxonomy',
  'analogy',
  'application',
];

const CONCEPT_DIMENSION_WEIGHTS = {
  definition: 1.0,
  mental_model: 1.5,
  purpose: 1.0,
  boundary: 1.5,
  taxonomy: 1.0,
  analogy: 0.5,
  application: 2.0,
};

const CONCEPT_DIMENSION_MAX = 100;
const CONCEPT_PRIMARY_PASS_MIN = 50;
const CONCEPT_SCORE_RATIO_PASS_MIN = 0.7;
const CONCEPT_AGGREGATE_RATIO_PASS_MIN = 0.6;
const CONCEPT_MIN_HELPFUL_DELTA = 10;
const CONCEPT_MIN_STRONG_DELTA = 25;
const CONCEPT_BASELINE_SATURATION_MIN = 90;

const CONCEPT_VERDICT_CATEGORIES = new Set([
  'correct',
  'memorized_not_understood',
  'shallow_definition',
  'wrong_mental_model',
  'no_first_principles',
  'circular',
  'hallucinated',
]);

function loadConceptGraderPrompt() {
  try {
    return fs.readFileSync(CONCEPT_GRADER_PROMPT_PATH, 'utf8');
  } catch (error) {
    throw new Error(`Concept grader prompt not found at ${CONCEPT_GRADER_PROMPT_PATH}: ${error.message}`);
  }
}

function buildConceptGraderPrompt(testCase, response, { run, subject, graderPromptTemplate }) {
  // The grader prompt template describes the rubric and JSON output contract.
  // We append the specific eval context (subject, dimension, run, candidate response)
  // so the grader has everything it needs in one turn.
  return [
    graderPromptTemplate,
    '',
    '---',
    '',
    '## This eval',
    '',
    `- Subject: ${subject}`,
    `- Eval ID: ${testCase.id}`,
    `- Primary dimension under test: ${testCase.dimension || 'unknown'}`,
    `- Run type: ${run}   (baseline = skill not loaded; with_skill = skill loaded)`,
    '',
    '## Prompt that was asked',
    '',
    testCase.prompt || '',
    '',
    '## Candidate response to grade',
    '',
    response || '(empty response)',
    '',
    '## Instructions',
    '',
    'Grade the candidate response against the Comprehension criteria above. Return the JSON shape exactly. No other text.',
  ].join('\n');
}

function normalizeConceptGrade(grade, { dimension }) {
  // Coerce whatever shape the grader returned into the canonical comprehension record.
  //
  // dimension_scores may contain `null` for dimensions the candidate response did
  // not address. Missing non-primary dimensions are not failures; the primary
  // dimension MUST be a real 0-100 score. If the grader returned null for the
  // primary dim we fall back to 0 with a warning, because that's a grader contract
  // violation.
  const primaryDim = dimension || 'unknown';
  const rawScores = grade?.dimension_scores || {};
  const numericRawScores = Object.values(rawScores).filter((value) => typeof value === 'number');
  if (
    grade?.score_scale !== '0-100'
    && numericRawScores.length > 0
    && numericRawScores.every((value) => value === 0 || value === 1 || value === 2)
  ) {
    console.warn(
      'WARN: concept grader output looks like the retired 0/1/2 scale — interpreting values as 0-100 scores. ' +
      'Check concept-grader-prompt.md if this repeats.',
    );
  }
  const dimensionScores = {};
  for (const dim of CONCEPT_DIMENSIONS) {
    const rawValue = rawScores[dim];
    if (rawValue === null || rawValue === undefined) {
      dimensionScores[dim] = null;
      continue;
    }
    const numeric = Number(rawValue);
    if (Number.isFinite(numeric)) {
      dimensionScores[dim] = Math.max(0, Math.min(CONCEPT_DIMENSION_MAX, Math.round(numeric)));
    } else {
      dimensionScores[dim] = null;
    }
  }

  // Enforce primary-dimension contract: never null.
  if (CONCEPT_DIMENSIONS.includes(primaryDim) && dimensionScores[primaryDim] === null) {
    console.warn(
      `WARN: grader returned null for primary dimension "${primaryDim}" — coercing to 0 (grader contract violation).`,
    );
    dimensionScores[primaryDim] = 0;
  }

  const rawReasoning = grade?.dimension_reasoning || {};
  const dimensionReasoning = {};
  for (const dim of CONCEPT_DIMENSIONS) {
    dimensionReasoning[dim] = typeof rawReasoning[dim] === 'string' ? rawReasoning[dim] : '';
  }

  // Aggregate over NON-NULL dimensions only.
  const scoredDims = CONCEPT_DIMENSIONS.filter((dim) => dimensionScores[dim] !== null);
  const rawScore = scoredDims.reduce((sum, dim) => sum + dimensionScores[dim], 0);
  const maxPossibleScore = scoredDims.length * CONCEPT_DIMENSION_MAX;
  const scoreRatio = maxPossibleScore > 0 ? Number((rawScore / maxPossibleScore).toFixed(4)) : 0;

  // Weighted score: Σ (score × weight) over scored dims, normalized by Σ (weight × 100).
  const scoredWeightSum = scoredDims.reduce((sum, dim) => sum + CONCEPT_DIMENSION_WEIGHTS[dim], 0);
  const weightedScore = scoredWeightSum > 0
    ? Number(
        (scoredDims.reduce((sum, dim) => sum + dimensionScores[dim] * CONCEPT_DIMENSION_WEIGHTS[dim], 0) /
          (scoredWeightSum * CONCEPT_DIMENSION_MAX)).toFixed(4),
      )
    : 0;

  // failure_dimensions = scored dims below the minimum passing band. A null is
  // "not scored", not "failed".
  const failureDimensions = CONCEPT_DIMENSIONS.filter((dim) => (
    typeof dimensionScores[dim] === 'number' && dimensionScores[dim] < CONCEPT_PRIMARY_PASS_MIN
  ));

  // Pass bar: primary dim ≥ 50 AND score_ratio ≥ 0.7.
  const primaryScore = CONCEPT_DIMENSIONS.includes(primaryDim) ? dimensionScores[primaryDim] : null;
  const primaryScoreSafe = primaryScore === null ? 0 : primaryScore;
  const passed = primaryScoreSafe >= CONCEPT_PRIMARY_PASS_MIN && scoreRatio >= CONCEPT_SCORE_RATIO_PASS_MIN;

  const rawVerdict = typeof grade?.verdict_category === 'string' ? grade.verdict_category : '';
  const verdictCategory = CONCEPT_VERDICT_CATEGORIES.has(rawVerdict)
    ? rawVerdict
    : (passed ? 'correct' : 'shallow_definition');

  return {
    score_scale: '0-100',
    max_score_per_dimension: CONCEPT_DIMENSION_MAX,
    primary_dimension: primaryDim,
    primary_dimension_score: primaryScoreSafe,
    dimension_scores: dimensionScores,
    dimension_reasoning: dimensionReasoning,
    raw_score: rawScore,
    max_possible_score: maxPossibleScore,
    score_ratio: scoreRatio,
    scored_dimensions: scoredDims.length,
    weighted_score: weightedScore,
    passed,
    failure_dimensions: failureDimensions,
    verdict_category: verdictCategory,
  };
}

// Max grader retries on JSON parse / extraction failure. LLMs (especially via
// `claude -p`) can occasionally emit malformed JSON — a trailing "```" fence, a
// stray preamble, or truncation under token pressure. Before 2026-04-09 this
// was a single attempt and the run silently lost the eval (Phase 2 pilot lost
// eval 3 this way). Three attempts costs at most 2 extra grader calls per
// broken eval and catches transient formatting glitches without masking real
// grader regressions.
const CONCEPT_GRADER_MAX_ATTEMPTS = 3;

function gradeConceptResponse(testCase, response, run, options) {
  const prompt = buildConceptGraderPrompt(testCase, response, {
    run,
    subject: options.subject,
    graderPromptTemplate: options.graderPromptTemplate,
  });

  const errors = [];
  for (let attempt = 1; attempt <= CONCEPT_GRADER_MAX_ATTEMPTS; attempt += 1) {
    let raw;
    try {
      raw = runGraderPrompt(prompt, {
        grader: options.grader,
        workspace: options.workspace,
        // The comprehension grader runs on Opus by default (quality judging
        // uses the strongest model — see DEFAULT_COMPREHENSION_GRADER_MODEL).
        // The caller (runComprehensionEval) passes this explicitly so other
        // grading paths keep their own grader model.
        model: options.model,
        skillDir: options.skillDir,
        skillName: options.skillName,
        telemetryRun: run,
        telemetryEvalId: testCase.id,
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

    logGraderDiscrepancy({ shape: 'concept_grader', testCase, run, rawJudgeOutput: parsed });
    return normalizeConceptGrade(parsed, { dimension: testCase.dimension });
  }

  throw new Error(
    `Grader failed after ${CONCEPT_GRADER_MAX_ATTEMPTS} attempts for eval ${testCase.id} [${testCase.dimension || 'unknown'}] ${run} run:\n` +
      errors.map((e) => `  ${e}`).join('\n'),
  );
}

function persistComprehensionHistory(entries) {
  try {
    const logDir = path.dirname(COMPREHENSION_HISTORY_LOG);
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    for (const entry of entries) {
      fs.appendFileSync(COMPREHENSION_HISTORY_LOG, JSON.stringify(entry) + '\n');
    }
  } catch {
    // History persistence must never break eval runs
  }
}

function runComprehensionEval(evalFile, options = {}) {
  const data = JSON.parse(fs.readFileSync(evalFile, 'utf8'));
  const workspace = normalizeWorkspace(options.workspace || resolveWorkspaceFromEvalFile(evalFile));
  const skillDir = path.dirname(path.dirname(path.resolve(evalFile)));
  const skillName = data.skill_name || skillNameFromDir(skillDir);
  const skillKey = data.skill_key || skillHistoryKeyFromDir(skillDir);
  const subject = data.subject || skillName;
  const allEvals = Array.isArray(data.evals) ? data.evals : [];
  const evalIds = options.evalIds || null;
  const evals = evalIds
    ? allEvals.filter((testCase) => evalIds.has(Number(testCase.id)))
    : allEvals;
  const timestamp = new Date().toISOString();
  const graderPromptTemplate = loadConceptGraderPrompt();
  if (evalIds && evals.length === 0) {
    throw new Error(`No Comprehension cases matched requested ids: ${Array.from(evalIds).join(', ')}`);
  }

  // Gate 8 grader configuration:
  // - graderModel: default Opus (quality judging uses the strongest model;
  //   no-lesser-models-for-quality). Overridable via env or
  //   options.comprehensionGraderModel to the other contract-named top grader
  //   ('gpt-5.4'), never to a lesser model.
  // - baselineSkipThreshold: when avg_primary_baseline after the first 2
  //   completed Comprehension cases is >= this value, abort the dual-run and write
  //   `comprehension_verdict: SKIPPED_BASELINE_HIGH`. The foundation model
  //   already has the concept; spending more tokens on grader calls produces
  //   noise, not signal.
  const graderModel = options.comprehensionGraderModel || comprehensionGraderModel();
  const generatorModel = options.comprehensionGeneratorModel || comprehensionGeneratorModel();
  const baselineSkipThreshold = options.baselineSkipThreshold !== undefined
    ? Number(options.baselineSkipThreshold)
    : comprehensionBaselineSkipThreshold();

  // ── Certification tier (representative-generator + frontier judges) ──
  // PASS is reachable ONLY from a certifying run. The audit-loop path fixes the
  // measured generator as representative-generator and asks both frontier judges
  // to agree; same-family legacy pairs, unresolved identities, or undeclared runs
  // are structurally only PROVISIONAL (self-preference inflation guard,
  // certification.js). resolveCertificationTier never selects a model — it
  // records the operator's attestation.
  const certification = resolveCertificationTier({
    certifying: Boolean(options.certifying),
    generatorFamily: options.generatorFamily || (options.certifying ? generatorModel : undefined),
    graderFamily: options.graderFamily || (options.certifying ? graderModel : undefined),
  });

  // ── Eval execution profile (lockstep parity) ──
  // When an executionProfile is supplied (the bidirectional runner always supplies
  // one), the generator runs with FULL repo/exec tools. WEB access is a deliberate
  // parameter that now defaults to OFF (the no-web baseline — see
  // eval-execution-profile.js header): the eval measures the skill's deployment value
  // (search-elimination + curation), not web findability — a web-enabled baseline
  // could google the definition and hide the skill's lift. Both arms run the same
  // (no-web) policy; only the skill differs, so parity holds. Without a profile, the
  // single-direction default stays tools-OFF for back-compat. The profile is recorded
  // on the receipt so parity across the two directions can be asserted.
  const executionProfile = options.executionProfile
    || (options.toolsOn ? buildExecutionProfile({ cwd: workspace }) : null);
  const generatorAccess = executionProfile
    ? cliAccessForProfile(options.generator || 'claude', executionProfile)
    : null;
  const generatorAllowTools = generatorAccess ? generatorAccess.allowTools : false;
  const generatorWeb = generatorAccess ? generatorAccess.web : false;

  // ── Baseline-arm answer-key fence (eval validity) ──
  // The baseline arm must not be able to filesystem-read the candidate SKILL.md it
  // is supposed to be blind to. It runs in `baselineWorkspace` (default = workspace,
  // which preserves research parity — both arms share the same research surface, and
  // the candidate is structurally absent from the skill-graph-root cwd on the panel
  // path). When tools are ON, the fence is enforced: a candidate reachable inside the
  // baseline working dir is a hard error (see baseline-fence.js).
  const baselineWorkspace = options.baselineWorkspace || workspace;
  assertBaselineSkillAbsent({ baselineWorkspace, skillDir, skillName, allowTools: generatorAllowTools });

  console.log(`\n=== Comprehension ===`);
  console.log(`Skill: ${skillName}`);
  console.log(`Subject: ${subject}`);
  console.log(`Workspace: ${workspace}`);
  console.log(`Cases: ${evals.length}`);
  console.log(`Grader model: ${graderModel}  (env COMPREHENSION_GRADER_MODEL — default Opus; quality judging uses the strongest model)`);
  console.log(`Generator model: ${generatorModel}  (env COMPREHENSION_GENERATOR_MODEL — default Opus frontier, deployment-matched; the measured agent, not a judge)`);
  console.log(`Baseline-skip threshold: ${baselineSkipThreshold}  (skip after first ${COMPREHENSION_BASELINE_SKIP_MIN_EVALS} cases if avg_primary_baseline >= threshold; env COMPREHENSION_BASELINE_SKIP_THRESHOLD)`);
  if (evalIds) {
    console.log(`Case filter: ${Array.from(evalIds).sort((a, b) => a - b).join(', ')}`);
  }
  console.log('');

  // SKI-205: true no-call dry-run preview — mirrors application mode.
  // Previously --dry-run only skipped the write-back, while all model calls
  // (generator baseline + with_skill, grader per eval) still ran. This makes
  // --dry-run consistent: preview planned invocations without touching any CLI.
  if (options.dryRun) {
    // Each eval runs two generator arms (baseline + with_skill) and two grader
    // calls (one per arm). Baseline-skip may eliminate some grader calls in a
    // real run, but the conservative estimate shown here assumes no skip fires.
    const evalCount = evals.length;
    const generatorCalls = evalCount * 2;
    const graderCalls = evalCount * 2;
    console.log('DRY RUN — no API calls will be made.');
    console.log(
      `Would invoke: ${generatorCalls} generator call(s) ` +
      `(${evalCount} case(s) × 2 arms baseline/with_skill) + ` +
      `${graderCalls} grader call(s) (same) = ` +
      `${generatorCalls + graderCalls} total model invocations.`,
    );
    console.log(`Grader model (would use): ${graderModel}`);
    console.log(`Generator model (would use): ${generatorModel}`);
    return {
      mode: 'comprehension',
      dryRun: true,
      skillName,
      skillKey,
      subject,
      workspace,
      score_scale: '0-100',
      max_score_per_dimension: CONCEPT_DIMENSION_MAX,
      total: evalCount,
      completed: 0,
      errors: 0,
      comprehension_verdict: 'UNVERIFIED',
      grader: options.grader || 'claude',
      grader_model: graderModel,
      // SKI-176: record the generator backend actually used. With generator now
      // defaulting to the model-derived CLI (not a forced 'claude'), the receipt
      // must reflect that — a non-Claude generatorModel runs on its resolved CLI,
      // so hardcoding 'claude' here would misreport provenance.
      generator: options.generator || resolveModelExecutor(generatorModel).cli,
      generator_model: generatorModel,
      certification_tier: certification.tier,
    };
  }

  // Load the skill file once, up front — used for the with_skill run.
  const skillFile = path.join(skillDir, 'SKILL.md');
  const skillContent = fs.existsSync(skillFile) ? fs.readFileSync(skillFile, 'utf8') : '';
  if (!skillContent) {
    console.warn(`WARNING: SKILL.md not found at ${skillFile} — with_skill run will be identical to baseline`);
  }

  const results = [];
  const historyEntries = [];

  for (const testCase of evals) {
    console.log(`  Case #${testCase.id} [${testCase.dimension || '?'}]: ${String(testCase.prompt || '').slice(0, 64)}...`);

    try {
      // ── Baseline run: no skill loaded ── (skill-absent baselineWorkspace, tools ON)
      const baselineResponse = getEvalResponse(testCase.prompt, {
        workspace: baselineWorkspace,
        generator: options.generator,
        model: generatorModel,
        skillDir,
        skillName,
        telemetryRun: 'baseline',
        telemetryEvalId: testCase.id,
        disableSlashCommands: true,
        // Repo/exec tools ON when a bidirectional execution profile is supplied;
        // tools-OFF for the legacy single-direction default. WEB gated separately
        // (generatorWeb — default OFF: the no-web baseline).
        allowTools: generatorAllowTools,
        web: generatorWeb,
      });

      // ── With-skill run: skill force-loaded into context ──
      const withSkillPrompt = skillContent
        ? `<skill>\n${skillContent}\n</skill>\n\n${buildSkillInvocationPrompt(skillName, testCase.prompt, { toolsAvailable: generatorAllowTools })}`
        : buildSkillInvocationPrompt(skillName, testCase.prompt, { toolsAvailable: generatorAllowTools });
      const withSkillResponse = getEvalResponse(withSkillPrompt, {
        workspace,
        generator: options.generator,
        model: generatorModel,
        skillDir,
        skillName,
        telemetryRun: 'with_skill',
        telemetryEvalId: testCase.id,
        disableSlashCommands: false,
        // Same tools + web level as the baseline run — lockstep parity within the
        // direction (the only variable is whether the skill is loaded).
        allowTools: generatorAllowTools,
        web: generatorWeb,
      });

      // ── Grade both runs independently with the concept grader ──
      // graderOptions.model is the env-controlled grader model (default Opus;
      // quality judging uses the strongest model). The legacy options.grader
      // (CLI selector) still routes to claude/gemini/opencode; within the
      // claude CLI path we select the configured grader model explicitly
      // rather than relying on the operator's session model.
      const graderOptions = {
        grader: options.grader,
        workspace,
        subject,
        graderPromptTemplate,
        model: graderModel,
        skillDir,
        skillName,
      };
      const baselineGrade = gradeConceptResponse(testCase, baselineResponse, 'baseline', graderOptions);
      const withSkillGrade = gradeConceptResponse(testCase, withSkillResponse, 'with_skill', graderOptions);

      const deltaRaw = withSkillGrade.raw_score - baselineGrade.raw_score;
      const deltaWeighted = Number((withSkillGrade.weighted_score - baselineGrade.weighted_score).toFixed(4));

      // Display both primary criterion (authoritative) and unweighted raw/max.
      // The primary criterion is what drives the classification; raw/max is a secondary
      // unweighted signal with a variable denominator (depends on how many
      // criteria the grader actually scored — some may be null).
      const primaryDelta = withSkillGrade.primary_dimension_score - baselineGrade.primary_dimension_score;
      const baselinePrimary = `${baselineGrade.primary_dimension_score}/${CONCEPT_DIMENSION_MAX}`;
      const withSkillPrimary = `${withSkillGrade.primary_dimension_score}/${CONCEPT_DIMENSION_MAX}`;
      const primaryDeltaStr = primaryDelta >= 0 ? `+${primaryDelta}` : String(primaryDelta);
      const baselineStr = `${baselineGrade.raw_score}/${baselineGrade.max_possible_score}`;
      const withSkillStr = `${withSkillGrade.raw_score}/${withSkillGrade.max_possible_score}`;
      console.log(
        `    primary[${testCase.dimension || '?'}]: ${baselinePrimary} → ${withSkillPrimary} (${primaryDeltaStr})  ` +
        `unweighted ${baselineStr} → ${withSkillStr}  verdict=${withSkillGrade.verdict_category}`,
      );

      results.push({
        id: testCase.id,
        dimension: testCase.dimension || 'unknown',
        baseline: baselineGrade,
        with_skill: withSkillGrade,
        delta_raw: deltaRaw,
        delta_weighted: deltaWeighted,
      });

      historyEntries.push({
        timestamp,
        skill: skillKey,
        skill_name: skillName,
        subject,
        eval_id: testCase.id,
        dimension: testCase.dimension || 'unknown',
        score_scale: '0-100',
        max_score_per_dimension: CONCEPT_DIMENSION_MAX,
        // Unweighted raw score over the criteria the grader actually scored.
        // This is not a pass bar. Prefer the primary score and score_ratio
        // fields for comparisons.
        baseline_score: baselineGrade.raw_score,
        baseline_max_score: baselineGrade.max_possible_score,
        baseline_weighted: baselineGrade.weighted_score,
        with_skill_score: withSkillGrade.raw_score,
        with_skill_max_score: withSkillGrade.max_possible_score,
        with_skill_weighted: withSkillGrade.weighted_score,
        delta_raw: deltaRaw,
        delta_weighted: deltaWeighted,
        // Primary-criterion-first fields (added 2026-04-09 Phase 3 bug fix).
        // These are the authoritative signal — raw_score is now a secondary
        // aggregate over whatever criteria the grader actually scored.
        baseline_primary_score: baselineGrade.primary_dimension_score,
        with_skill_primary_score: withSkillGrade.primary_dimension_score,
        primary_delta: withSkillGrade.primary_dimension_score - baselineGrade.primary_dimension_score,
        baseline_score_ratio: baselineGrade.score_ratio,
        with_skill_score_ratio: withSkillGrade.score_ratio,
        baseline_scored_dimensions: baselineGrade.scored_dimensions,
        with_skill_scored_dimensions: withSkillGrade.scored_dimensions,
        baseline_verdict: baselineGrade.verdict_category,
        with_skill_verdict: withSkillGrade.verdict_category,
        baseline_failure_dimensions: baselineGrade.failure_dimensions,
        with_skill_failure_dimensions: withSkillGrade.failure_dimensions,
        grader: options.grader || 'claude',
      });
    } catch (error) {
      console.log(`    ERROR: ${error.message}`);
      results.push({
        id: testCase.id,
        dimension: testCase.dimension || 'unknown',
        error: error.message,
      });
    }

    // v7 baseline-skip (gate 8 demotion, per ADR 0011 Change 3).
    //
    // After the first COMPREHENSION_BASELINE_SKIP_MIN_EVALS (default: 2)
    // successfully-completed Comprehension cases, check whether the baseline already
    // saturates the primary-criterion scale. If `avg_primary_baseline` is
    // >= the configured threshold, the foundation model already has the
    // concept — running the rest of the dual-runs produces noise, not
    // signal. Break the loop, mark the run as SKIPPED_BASELINE_HIGH, and
    // let the caller surface that on `comprehension_verdict`.
    //
    // This is the load-bearing token-cost reduction for the audit loop:
    // ~99% of framework-style concepts (CLT, Toulmin, FMEA, OODA, DSRP,
    // Meadows leverage points, design thinking) ceiling-saturate on the
    // foundation model's training prior. The grader runs on Opus (quality
    // judging uses the strongest model); the saving comes from grading only
    // the first 2 cases before skipping the remainder once the baseline
    // proves saturated — not from a weaker grader.
    const completedSoFar = results.filter((r) => !r.error);
    if (
      completedSoFar.length >= COMPREHENSION_BASELINE_SKIP_MIN_EVALS &&
      baselineSkipThreshold <= CONCEPT_DIMENSION_MAX
    ) {
      const baselineSum = completedSoFar.reduce(
        (acc, r) => acc + Number(r.baseline.primary_dimension_score || 0),
        0,
      );
      const baselineAvg = baselineSum / completedSoFar.length;
      if (baselineAvg >= baselineSkipThreshold) {
        console.log(
          `\n  Baseline-skip triggered: avg_primary_baseline=${baselineAvg.toFixed(2)} >= ${baselineSkipThreshold} after ${completedSoFar.length} cases. ` +
            `Skipping remaining ${evals.length - results.length} case(s) — foundation model already has the concept. ` +
            `comprehension_verdict: SKIPPED_BASELINE_HIGH.`,
        );
        // Annotate the run so the summary can surface the skip cleanly.
        // Subsequent aggregation reads `baseline_skip_triggered`.
        // eslint-disable-next-line no-param-reassign
        options._baselineSkipTriggered = {
          completed: completedSoFar.length,
          threshold: baselineSkipThreshold,
          baselineAvg: Number(baselineAvg.toFixed(4)),
          skippedCount: evals.length - results.length,
        };
        break;
      }
    }
  }

  // ── Aggregate summary ──
  //
  // 2026-04-09 rewrite (Phase 3 bug fix #1 + #2):
  //   - Primary criterion is the authoritative signal. avg_primary_* / primary_delta_avg
  //     are computed first and drive classification.
  //   - raw_score averages remain for backward compat but are labeled "unweighted" and
  //     are no longer the classification input. They are not a fixed pass bar because
  //     the denominator depends on how many criteria the grader scored (some are null).
  //   - An error count > 0 is treated as a hard failure of the run — we print a loud
  //     banner, include an `errors` field in the summary, and set exitCode so main() can
  //     fail the process. Previously the runner silently reported "6/7 completed" as if
  //     that were fine; it is not.
  const completed = results.filter((r) => !r.error);
  const errorCount = results.length - completed.length;

  const avgBaseline = completed.length > 0
    ? Number((completed.reduce((s, r) => s + r.baseline.raw_score, 0) / completed.length).toFixed(2))
    : 0;
  const avgWithSkill = completed.length > 0
    ? Number((completed.reduce((s, r) => s + r.with_skill.raw_score, 0) / completed.length).toFixed(2))
    : 0;
  const avgDelta = Number((avgWithSkill - avgBaseline).toFixed(2));

  const avgPrimaryBaseline = completed.length > 0
    ? Number((completed.reduce((s, r) => s + r.baseline.primary_dimension_score, 0) / completed.length).toFixed(2))
    : 0;
  const avgPrimaryWithSkill = completed.length > 0
    ? Number((completed.reduce((s, r) => s + r.with_skill.primary_dimension_score, 0) / completed.length).toFixed(2))
    : 0;
  const primaryDeltaAvg = Number((avgPrimaryWithSkill - avgPrimaryBaseline).toFixed(2));

  const avgBaselineRatio = completed.length > 0
    ? Number((completed.reduce((s, r) => s + r.baseline.score_ratio, 0) / completed.length).toFixed(3))
    : 0;
  const avgWithSkillRatio = completed.length > 0
    ? Number((completed.reduce((s, r) => s + r.with_skill.score_ratio, 0) / completed.length).toFixed(3))
    : 0;

  // Classification based on PRIMARY delta (out of a 0-100 range).
  // +10 points is the minimum meaningful lift; +25 points is a strong lift.
  // v7: baseline-skip short-circuits classification — when the loop bailed
  // early due to high baseline, the comprehension verdict is
  // SKIPPED_BASELINE_HIGH regardless of delta math.
  let classification;
  let comprehensionVerdict;
  if (options._baselineSkipTriggered) {
    classification = 'baseline_saturated';
    comprehensionVerdict = 'SKIPPED_BASELINE_HIGH';
  } else if (primaryDeltaAvg <= -CONCEPT_MIN_HELPFUL_DELTA) {
    classification = 'harmful';
    // Application_verdict owns the HARMFUL signal in v7. The comprehension
    // grader marks this as SHALLOW so the operator routes via application
    // audit (gate 9) for the authoritative harmful determination.
    comprehensionVerdict = 'SHALLOW';
  } else if (avgPrimaryWithSkill < CONCEPT_PRIMARY_PASS_MIN || avgWithSkillRatio < CONCEPT_AGGREGATE_RATIO_PASS_MIN) {
    classification = 'fails_to_teach';
    comprehensionVerdict = 'SHALLOW';
  } else if (primaryDeltaAvg >= CONCEPT_MIN_STRONG_DELTA) {
    classification = 'skill_teaches';
    comprehensionVerdict = 'PASS';
  } else if (primaryDeltaAvg >= CONCEPT_MIN_HELPFUL_DELTA) {
    classification = 'skill_helps';
    comprehensionVerdict = 'PASS';
  } else if (avgPrimaryBaseline >= CONCEPT_BASELINE_SATURATION_MIN) {
    classification = 'redundant';
    comprehensionVerdict = 'REDUNDANT';
  } else if (primaryDeltaAvg > -CONCEPT_MIN_HELPFUL_DELTA) {
    classification = 'fails_to_teach';
    comprehensionVerdict = 'SHALLOW';
  } else {
    classification = 'harmful';
    // Application_verdict owns the HARMFUL signal in v7. The comprehension
    // grader marks this as SHALLOW so the operator routes via application
    // audit (gate 9) for the authoritative harmful determination.
    comprehensionVerdict = 'SHALLOW';
  }

  // PASS is reserved for the bidirectional frontier-judge confirmation. A
  // single-model self-assessment (--single-model) OR any run that is not a
  // certifying configuration caps the
  // strong PASS verdict to PROVISIONAL. REDUNDANT / SHALLOW / SKIPPED_BASELINE_HIGH
  // are factual descriptions of the delta and don't change with grader identity,
  // so only PASS is downgraded. This generalizes the older Audit-B2 single-model
  // cap via the shared certification tier (certification.js): same-family,
  // undeclared, or unattested ⇒ PROVISIONAL; only a declared cross-family pair
  // earns PASS. See docs/verdict-semantics.md + version-schema-contract.md.
  const comprehensionCertifying = certification.tier === 'certifying';
  if ((options.singleModel || !comprehensionCertifying) && comprehensionVerdict === 'PASS') {
    comprehensionVerdict = 'PROVISIONAL';
    classification = `${classification}_provisional`;
  }

  const summary = {
    mode: 'comprehension',
    skillName,
    skillKey,
    subject,
    workspace,
    agent_telemetry_source: TELEMETRY_FILENAME,
    score_scale: '0-100',
    max_score_per_dimension: CONCEPT_DIMENSION_MAX,
    total: evals.length,
    completed: completed.length,
    errors: errorCount,
    // Primary-criterion-first aggregates (authoritative).
    avg_primary_baseline: avgPrimaryBaseline,
    avg_primary_with_skill: avgPrimaryWithSkill,
    primary_delta_avg: primaryDeltaAvg,
    avg_baseline_score_ratio: avgBaselineRatio,
    avg_with_skill_score_ratio: avgWithSkillRatio,
    primary_pass_min: CONCEPT_PRIMARY_PASS_MIN,
    aggregate_score_ratio_pass_min: CONCEPT_AGGREGATE_RATIO_PASS_MIN,
    min_helpful_primary_delta: CONCEPT_MIN_HELPFUL_DELTA,
    min_strong_primary_delta: CONCEPT_MIN_STRONG_DELTA,
    baseline_saturation_min: CONCEPT_BASELINE_SATURATION_MIN,
    // Backward-compatible unweighted aggregates, no longer used for classification.
    avg_baseline: avgBaseline,
    avg_with_skill: avgWithSkill,
    avg_delta: avgDelta,
    classification,
    // v7 four-verdict surface — the audit loop reads this to stamp
    // comprehension_verdict on the SKILL.md Health Block. Never alone
    // certifies a skill (per ADR 0011 Change 3) — application_verdict is
    // the aggregate-quality field.
    comprehension_verdict: comprehensionVerdict,
    baseline_skip: options._baselineSkipTriggered || null,
    grader: options.grader || 'claude',
    grader_model: graderModel,
    // Concrete model id (or `latest-alias-unresolved` sentinel) — a bare alias
    // like "opus" cannot tell Opus 4.8 from 4.9, so scores tagged with the
    // sentinel are not strictly comparable across dates. (SKI-41.)
    resolved_grader_model: resolveReceiptModelId(graderModel),
    // SKI-176: record the generator backend actually used (model-derived CLI),
    // not a hardcoded 'claude' — see the matching dry-run receipt above.
    generator: options.generator || resolveModelExecutor(generatorModel).cli,
    generator_model: generatorModel,
    resolved_generator_model: resolveReceiptModelId(generatorModel),
    // Cross-family certification provenance (PASS only from a certifying tier).
    certification_tier: certification.tier,
    certification_reason: certification.reason,
    declared_generator_family: certification.generator_family,
    declared_grader_family: certification.grader_family,
    // Tools-ON execution profile (parity asserted across the two bidirectional
    // directions by run-bidirectional-eval.js). null on a legacy single-direction
    // tools-OFF run.
    execution_profile: executionProfile,
    // Model epoch — scores are comparable only within the same registry version
    // (a score from one Opus generation is not comparable to the next). See
    // workspace AGENTS.md § Model Identity Discipline.
    registry_version: REGISTRY_VERSION,
    results,
  };

  console.log('\n=== Comprehension Summary ===');
  console.log(`Completed: ${completed.length}/${evals.length}${errorCount > 0 ? ` (${errorCount} ERRORS — see RED FLAG below)` : ''}`);
  console.log(`Primary criterion baseline: ${avgPrimaryBaseline}/${CONCEPT_DIMENSION_MAX}  (score_ratio avg: ${avgBaselineRatio})`);
  console.log(`Primary criterion with_skill: ${avgPrimaryWithSkill}/${CONCEPT_DIMENSION_MAX}  (score_ratio avg: ${avgWithSkillRatio})`);
  console.log(`Primary delta: ${primaryDeltaAvg >= 0 ? '+' : ''}${primaryDeltaAvg}`);
  console.log(`(Unweighted raw-score avg over scored criteria: baseline ${avgBaseline}, with_skill ${avgWithSkill}, delta ${avgDelta >= 0 ? '+' : ''}${avgDelta})`);
  console.log(`Classification: ${classification.toUpperCase()}`);

  if (errorCount > 0) {
    console.log('');
    console.log('============================================================');
    console.log(`RED FLAG: ${errorCount}/${evals.length} Comprehension cases errored (grader JSON parse failure, timeout, or candidate empty).`);
    console.log('This run is INCOMPLETE. Do not use its aggregate scores as ground truth.');
    console.log('Errored eval IDs:');
    for (const r of results) {
      if (r.error) {
        console.log(`  - case ${r.id} [${r.dimension}]: ${r.error}`);
      }
    }
    console.log('============================================================');
  }

  if (classification === 'harmful') {
    console.log('RED FLAG: skill appears to regress model comprehension. Investigate before shipping.');
  } else if (classification === 'fails_to_teach') {
    console.log('WARNING: skill is loaded but not improving model comprehension on a concept it doesn\'t already know.');
  }

  persistComprehensionHistory(historyEntries);

  return summary;
}

function writeArtifacts(baseDir, evalId, baselineResponse, baselineGrade, candidateResponse, candidateGrade) {
  const evalDir = path.join(baseDir, `eval-${evalId}`);
  fs.mkdirSync(evalDir, { recursive: true });
  fs.writeFileSync(path.join(evalDir, 'baseline-response.md'), `${baselineResponse}\n`);
  fs.writeFileSync(path.join(evalDir, 'candidate-response.md'), `${candidateResponse}\n`);
  fs.writeFileSync(path.join(evalDir, 'baseline-grade.json'), `${JSON.stringify(baselineGrade, null, 2)}\n`);
  fs.writeFileSync(path.join(evalDir, 'candidate-grade.json'), `${JSON.stringify(candidateGrade, null, 2)}\n`);
}

function runEval(evalFile, options = {}) {
  const data = JSON.parse(fs.readFileSync(evalFile, 'utf8'));
  const workspace = normalizeWorkspace(options.workspace || resolveWorkspaceFromEvalFile(evalFile));
  const skillDir = path.dirname(path.dirname(path.resolve(evalFile)));
  const skillName = data.skill_name || skillNameFromDir(skillDir);
  const skillKey = data.skill_key || skillHistoryKeyFromDir(skillDir);
  const allEvals = Array.isArray(data.evals) ? data.evals : [];
  const evalIds = options.evalIds || null;
  const evals = evalIds
    ? allEvals.filter((testCase) => evalIds.has(Number(testCase.id)))
    : allEvals;
  const artifactsDir = options.artifactsDir || '';
  // Grader model for the keep/revert gate. This grader JUDGES whether the
  // candidate skill's responses pass — a quality judgment — so the claude-grader
  // path must be top-tier (default Opus via comprehensionGraderModel), never a
  // silent weak-model ('sonnet') fallback in runGraderPrompt. Same
  // no-lesser-models fix as the application grader (SH-6641); only affects the
  // `claude` grader (opencode=gpt-5.4 and gemini resolve their own models).
  const graderModel = options.graderModel || comprehensionGraderModel();

  if (evalIds && evals.length === 0) {
    throw new Error(`No evals matched requested ids: ${Array.from(evalIds).join(', ')}`);
  }

  console.log(`Evaluating skill: ${skillName}`);
  console.log(`Workspace: ${workspace}`);
  if ((options.grader || 'claude') === 'claude') {
    console.log(`Grader model: ${graderModel}  (env COMPREHENSION_GRADER_MODEL — default Opus; quality judging uses the strongest model)`);
  }
  if (evalIds) {
    console.log(`Eval filter: ${Array.from(evalIds).sort((a, b) => a - b).join(', ')}`);
  }

  let baselinePassed = 0;
  let candidatePassed = 0;
  const results = [];

  for (const testCase of evals) {
    console.log(`  Eval #${testCase.id}: ${String(testCase.prompt || '').slice(0, 72)}...`);
    try {
      const requiresBrowser = Boolean(testCase.requires_browser);
      const baselineResponse = getEvalResponse(testCase.prompt, {
        workspace,
        generator: options.generator,
        disableSlashCommands: true,
        allowTools: requiresBrowser,
      });

      // Force-load the skill content directly (bypass injector heuristics)
      // If options.skillOverride is set, use that content instead of reading from disk
      let skillContent = '';
      if (options.skillOverride) {
        skillContent = options.skillOverride;
      } else {
        const evalDir = path.dirname(evalFile);
        const skillDir2 = path.dirname(evalDir);
        const skillFile = path.join(skillDir2, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          skillContent = fs.readFileSync(skillFile, 'utf8');
        }
      }
      const candidatePrompt = skillContent
        ? `<skill>\n${skillContent}\n</skill>\n\n${buildSkillInvocationPrompt(skillName, testCase.prompt, { toolsAvailable: requiresBrowser })}`
        : buildSkillInvocationPrompt(skillName, testCase.prompt, { toolsAvailable: requiresBrowser });

      const candidateResponse = getEvalResponse(candidatePrompt, {
        workspace,
        generator: options.generator,
        disableSlashCommands: false,
        allowTools: requiresBrowser,
      });

      const baselineGrade = gradeResponse(testCase, baselineResponse, {
        grader: options.grader,
        workspace,
        model: graderModel,
      });
      const candidateGrade = gradeResponse(testCase, candidateResponse, {
        grader: options.grader,
        workspace,
        model: graderModel,
      });

      if (baselineGrade.passed) baselinePassed += 1;
      if (candidateGrade.passed) candidatePassed += 1;

      if (artifactsDir) {
        writeArtifacts(artifactsDir, testCase.id, baselineResponse, baselineGrade, candidateResponse, candidateGrade);
      }

      const status = candidateGrade.passed ? 'PASS' : 'FAIL';
      console.log(`    ${status} baseline=${baselineGrade.score.toFixed(2)} candidate=${candidateGrade.score.toFixed(2)}`);
      if (!candidateGrade.passed && candidateGrade.missing_expectations.length > 0) {
        console.log(`    Missing: ${candidateGrade.missing_expectations.join(', ')}`);
      }

      results.push({
        id: testCase.id,
        criticality: testCase.criticality || testCase.severity || 'normal',
        baseline: baselineGrade,
        candidate: candidateGrade,
      });
    } catch (error) {
      console.log(`    ERROR: ${error.message}`);
      results.push({
        id: testCase.id,
        error: error.message,
      });
    }
  }

  const summary = {
    skillName,
    skillKey,
    workspace,
    agent_telemetry_source: TELEMETRY_FILENAME,
    baselinePassed,
    candidatePassed,
    total: evals.length,
    results,
  };

  summary.baselineMetrics = summarizeEvalMetrics(results, evals, 'baseline');
  summary.candidateMetrics = summarizeEvalMetrics(results, evals, 'candidate');

  console.log(`\nBaseline: ${baselinePassed}/${evals.length}`);
  console.log(`Candidate: ${candidatePassed}/${evals.length}`);
  console.log(`Delta: ${candidatePassed - baselinePassed >= 0 ? '+' : ''}${candidatePassed - baselinePassed}`);
  console.log(
    `Quality: baseline=${summary.baselineMetrics.weighted_quality_score.toFixed(4)} candidate=${summary.candidateMetrics.weighted_quality_score.toFixed(4)}`,
  );
  console.log(
    `Wilson LB: baseline=${summary.baselineMetrics.wilson_lower_bound.toFixed(4)} candidate=${summary.candidateMetrics.wilson_lower_bound.toFixed(4)}`,
  );

  // Persist eval results to history log for trend analysis
  persistEvalHistoryWithMetadata({ skillName, skillKey }, results);

  return summary;
}

function runMatrixEval(evalFile, options = {}) {
  const baselineSkillPath = options.baselineSkill;
  const baselineEvalsPath = options.baselineEvals;

  if (!baselineSkillPath || !baselineEvalsPath) {
    throw new Error('Matrix mode requires --baseline-skill and --baseline-evals');
  }
  if (!fs.existsSync(baselineSkillPath)) throw new Error(`Baseline skill not found: ${baselineSkillPath}`);
  if (!fs.existsSync(baselineEvalsPath)) throw new Error(`Baseline evals not found: ${baselineEvalsPath}`);

  const oldSkill = fs.readFileSync(baselineSkillPath, 'utf8');
  const currentSkillDir = path.dirname(path.dirname(path.resolve(evalFile)));
  const currentSkillFile = path.join(currentSkillDir, 'SKILL.md');
  const newSkill = fs.existsSync(currentSkillFile) ? fs.readFileSync(currentSkillFile, 'utf8') : '';

  const generator = options.generator || 'claude';

  const baseOpts = {
    workspace: options.workspace,
    grader: options.grader,
    generator,
    evalIds: options.evalIds || null,
  };

  console.log('\n=== Matrix Evaluation ===\n');

  // Pass 1: old skill + old evals (baseline)
  console.log('--- Pass 1: Old Skill + Old Evals ---');
  const pass1 = runEval(baselineEvalsPath, {
    ...baseOpts,
    skillOverride: oldSkill,
    artifactsDir: options.artifactsDir ? path.join(options.artifactsDir, 'pass1-old-old') : '',
  });

  // Pass 2: new skill + old evals (skill improvement gate)
  console.log('\n--- Pass 2: New Skill + Old Evals ---');
  const pass2 = runEval(baselineEvalsPath, {
    ...baseOpts,
    skillOverride: newSkill,
    artifactsDir: options.artifactsDir ? path.join(options.artifactsDir, 'pass2-new-old') : '',
  });

  // Pass 3: old skill + new evals (eval strictness check)
  console.log('\n--- Pass 3: Old Skill + New Evals ---');
  const pass3 = runEval(evalFile, {
    ...baseOpts,
    skillOverride: oldSkill,
    artifactsDir: options.artifactsDir ? path.join(options.artifactsDir, 'pass3-old-new') : '',
  });

  // Pass 4: new skill + new evals (final bundle)
  console.log('\n--- Pass 4: New Skill + New Evals ---');
  const pass4 = runEval(evalFile, {
    ...baseOpts,
    artifactsDir: options.artifactsDir ? path.join(options.artifactsDir, 'pass4-new-new') : '',
  });

  // Acceptance decision — use the rich evaluateCandidateGate instead of simple
  // pass-count comparison. This checks eval regression, weighted quality score,
  // Wilson lower bound, critical-eval counts, error counts, hallucination tracking,
  // line count preservation, domain anchor retention, and documentation sections.
  const evalsStricter = pass3.candidatePassed < pass1.candidatePassed;

  const gateResult = evaluateCandidateGate({
    baselinePassed: pass1.candidatePassed,
    candidatePassed: pass2.candidatePassed,
    total: pass1.total,
    baselineMetrics: pass1.candidateMetrics || null,
    candidateMetrics: pass2.candidateMetrics || null,
    skillName: pass1.skillName || '',
    tier: 2,
    beforeLines: countLines(oldSkill),
    afterLines: countLines(newSkill),
    beforeContent: oldSkill,
    afterContent: newSkill,
    referencesModified: false,
    ownershipMode: 'authored',
  });

  const skillRegressed = !gateResult.accepted;
  const accepted = !skillRegressed && evalsStricter;

  const matrix = {
    mode: 'matrix',
    passes: {
      oldSkillOldEvals: { passed: pass1.candidatePassed, total: pass1.total },
      newSkillOldEvals: { passed: pass2.candidatePassed, total: pass2.total },
      oldSkillNewEvals: { passed: pass3.candidatePassed, total: pass3.total },
      newSkillNewEvals: { passed: pass4.candidatePassed, total: pass4.total },
    },
    gateResult,
    skillRegressed,
    evalsStricter,
    accepted,
  };

  console.log('\n=== Matrix Results ===');
  console.log(`Old+Old: ${pass1.candidatePassed}/${pass1.total}`);
  console.log(`New+Old: ${pass2.candidatePassed}/${pass2.total} ${skillRegressed ? '(REGRESSED)' : '(OK)'}`);
  if (gateResult.reasons.length > 0) {
    console.log(`  Gate rejections: ${gateResult.reasons.join('; ')}`);
  }
  console.log(`Old+New: ${pass3.candidatePassed}/${pass3.total} ${evalsStricter ? '(stricter)' : '(NOT stricter)'}`);
  console.log(`New+New: ${pass4.candidatePassed}/${pass4.total}`);
  console.log(`Verdict: ${accepted ? 'ACCEPT' : 'REJECT'}`);

  return matrix;
}

/**
 * Valid comprehension_verdict enum values per SKILL_METADATA_PROTOCOL_schema.json.
 * Sorted in the same order as the schema enum.
 */
const COMPREHENSION_VERDICT_ENUM = [
  'PASS',
  'SHALLOW',
  'REDUNDANT',
  'UNVERIFIED',
  'PROVISIONAL',
  'SKIPPED_BASELINE_HIGH',
  'NA',
];

/**
 * Normalize comprehension verdict to a schema-valid enum value, defaulting to
 * UNVERIFIED for absent / unknown values rather than stamping garbage.
 */
function normalizeComprehensionVerdict(rawVerdict) {
  if (!rawVerdict || typeof rawVerdict !== 'string') return 'UNVERIFIED';
  const upper = rawVerdict.toUpperCase();
  if (COMPREHENSION_VERDICT_ENUM.includes(upper)) return upper;
  console.warn(`WARN: unrecognised comprehension_verdict value "${rawVerdict}" — treating as UNVERIFIED`);
  return 'UNVERIFIED';
}

/**
 * Stamp `comprehension_verdict` into the SKILL.md Health Block.
 *
 * Closes audit finding H2 (system-audit-2026-05-27) and the ADR 0011
 * § Addendum 2026-05-20 gap — gate 8 (the comprehension grader) appends to
 * comprehension-history.jsonl but, until this stamp ran, never wrote the
 * verdict back to the skill's frontmatter, so corpus-wide
 * comprehension_verdict stayed UNVERIFIED regardless of grader output.
 *
 * Safety rules:
 *   - Never stamp on incomplete runs (errors === total).
 *   - Never stamp if SKILL.md cannot be resolved from the eval path.
 *   - Default on; pass `dryRun: true` to preview without writing.
 *
 * @param {string}  evalFilePath          Path to the comprehension.json that ran
 * @param {object}  comprehensionResult   Return value of runComprehensionEval()
 * @param {boolean} dryRun                When true, log only — do not write
 */
function resolveSkillMdFromEvalFile(evalFilePath) {
  const skillDir = path.dirname(path.dirname(path.resolve(evalFilePath)));
  const skillMd = path.join(skillDir, 'SKILL.md');
  return fs.existsSync(skillMd) ? skillMd : null;
}

function stampComprehensionVerdict(evalFilePath, comprehensionResult, dryRun) {
  if (!comprehensionResult) return;

  // Incomplete run: every case errored.
  const total = comprehensionResult.total || 0;
  const errorCount = comprehensionResult.errors || 0;
  if (total > 0 && errorCount >= total) {
    console.warn('\n[write-back] All comprehension cases errored — not stamping comprehension_verdict (run is incomplete).');
    return;
  }

  const verdict = normalizeComprehensionVerdict(comprehensionResult.comprehension_verdict);

  const skillMd = resolveSkillMdFromEvalFile(evalFilePath);
  if (!skillMd) {
    console.warn(`\n[write-back] SKILL.md not found from eval path ${evalFilePath} — cannot stamp comprehension_verdict.`);
    return;
  }

  if (dryRun) {
    console.log(`\n[write-back] DRY RUN — would stamp to ${skillMd}:`);
    console.log(`  comprehension_verdict: ${verdict}`);
    return;
  }

  // ADR-0019: comprehension_verdict lives in the sidecar.
  const res = writeSidecarFields(skillMd, { comprehension_verdict: verdict });
  console.log(`\n[write-back] Stamped comprehension_verdict: ${verdict} → ${res.path}`);
}

function main() {
  const { args, positional } = parseArgs(process.argv.slice(2));
  for (const removedFlag of REMOVED_FLAGS) {
    if (Object.prototype.hasOwnProperty.call(args, removedFlag)) {
      console.error(`--${removedFlag} has been removed. The evaluator no longer accepts per-run model or timeout overrides.`);
      process.exit(1);
    }
  }
  const evalFile = positional[0] || args['eval-file'];
  const comprehensionFlag = args.comprehension === true || args.comprehension === 'true';
  const mode = args.mode
    || (comprehensionFlag ? 'comprehension'
        : (evalFile ? inferEvalMode(evalFile) : 'ab'));
  // The application (APPLICABLE) eval has been removed; only comprehension/ab/matrix remain.
  if (mode === 'application' || args.application !== undefined) {
    console.error('The application (APPLICABLE) eval has been removed. Use --mode comprehension.');
    process.exit(1);
  }
  const evalIds = parseEvalIds(args['eval-id'] || args['eval-ids']);

  const regressionGate = args['regression-gate'] === true || args['regression-gate'] === 'true';

  // D5: heartbeat status.json so watch-panel.js / watch-audit-batch.sh can observe a
  // single-skill eval run too (the panel runner already emits one; this runner did not).
  // --status-file opts in; one agents[] row for the eval. The completion tick fires on
  // process exit (writeRunnerHeartbeat is sync), so every main() return path is covered
  // without wrapping the large body.
  const statusFile = args['status-file'];
  if (statusFile) {
    const hbSkill = evalFile ? path.basename(path.dirname(path.dirname(path.resolve(evalFile)))) : null;
    const hbAgent = (state) => [{ model: hbSkill || mode, tier: 'eval', phase: mode, state }];
    writeRunnerHeartbeat(statusFile, { skill: hbSkill, phase: mode, total: 1, done: 0, agents: hbAgent('running') });
    process.once('exit', (code) => writeRunnerHeartbeat(statusFile, {
      skill: hbSkill, phase: mode, total: 1, done: code === 0 ? 1 : 0, failed: code === 0 ? 0 : 1,
      complete: true, agents: hbAgent(code === 0 ? 'done' : 'failed'),
    }));
  }


  if (!evalFile) {
    console.error('Usage: node skill-graph/lib/audit/evaluate-skill.js [--mode ab|matrix|comprehension] [--baseline-skill PATH] [--baseline-evals PATH] [--workspace DIR] [--eval-id 1,2] [--artifacts-dir DIR] [--output FILE] [--regression-gate] [--dry-run] <evals.json | comprehension.json>');
    console.error('Canonical entry point per ADR 0009.');
    console.error('  --dry-run             comprehension: preview planned model calls without invoking any CLI (true no-call preview — SKI-205).');
    process.exit(1);
  }

  let result;
  if (mode === 'comprehension') {
  // Comprehension: dual-run baseline vs with_skill grading.
    result = runComprehensionEval(evalFile, {
      workspace: args.workspace,
      grader: args.grader || 'claude',
      generator: args.generator,
      evalIds,
      singleModel: args['single-model'] === true,
      // SKI-205: pass --dry-run through to runComprehensionEval so it previews
      // the planned call count and returns early without model invocations,
      // matching the application mode's true no-call preview behavior.
      dryRun: args['dry-run'] === true || args['dry-run'] === 'true',
      // Cross-family certifying attestation (mirrors application mode). PASS caps
      // to PROVISIONAL unless --certifying with differing --generator-family /
      // --grader-family is asserted (the default is now provisional).
      certifying: args.certifying === true,
      generatorFamily: args['generator-family'],
      graderFamily: args['grader-family'],
      // Tools-ON parity: --tools-on builds the lockstep execution profile from the
      // workspace cwd so the generator can research repo+web.
      toolsOn: args['tools-on'] === true,
    });
  } else if (mode === 'matrix') {
    result = runMatrixEval(evalFile, {
      baselineSkill: args['baseline-skill'],
      baselineEvals: args['baseline-evals'],
      workspace: args.workspace,
      grader: args.grader || 'claude',
      generator: args.generator,
      evalIds,
      artifactsDir: args['artifacts-dir'] || '',
    });
  } else {
    result = runEval(evalFile, {
      workspace: args.workspace,
      grader: args.grader || 'claude',
      generator: args.generator,
      evalIds,
      artifactsDir: args['artifacts-dir'] || '',
    });
  }

  // Default output file is per-skill + timestamped to prevent parallel runs
  // from clobbering each other's results. Before 2026-04-09 this was a fixed
  // path (.cache/eval-results.json) and a parallel ontology + shopify run
  // corrupted the ontology pilot by having shopify overwrite ontology's cache.
  let outputFile = args.output;
  if (!outputFile) {
    outputFile = durableEvalResultPath(result && (result.skillName || result.skillKey || result.skill));
  }
  if (!fs.existsSync(path.dirname(outputFile))) {
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  }
  fs.writeFileSync(outputFile, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`Results saved to ${outputFile}`);

  // Verdict + Health Block write-back now persists BY DEFAULT. --dry-run is the
  // single opt-out (preview only), consistent with the application/comprehension
  // stamp paths which already honor it.
  const writeBackDryRun = args['dry-run'] === true || args['dry-run'] === 'true';

  // Closes audit H2: stamp comprehension_verdict onto the SKILL.md
  // Health Block after a comprehension run completes. Safety rules
  // inside stampComprehensionVerdict guard incomplete / unresolved runs.
  if (mode === 'comprehension') {
    stampComprehensionVerdict(evalFile, result, writeBackDryRun);
  }

  // v6 Health Block — eval_score / eval_failed_ids / freshness — written to the
  // skill's frontmatter so /evolve and /audit read the latest eval state from
  // the Health Block instead of crawling eval-history.jsonl. (Application mode
  // stamps its verdict in the dedicated branch above and never reaches here.)
  //
  // Step 3 (2026-05-31): inverted from opt-in (--write-verdict) to persist-by-
  // default. Writing the eval result you just computed is the honest default;
  // an unattended loop no longer silently produces zero durable verdicts because
  // it forgot a flag (Break #2). The legacy --write-verdict flag is retained as
  // a harmless no-op alias (writing is now the default); --dry-run opts out.
  //
  // 2026-05-19: the incomplete-run guard must run BEFORE the comprehension
  // errors-exit below. An incomplete run (errors > 0) must NOT overwrite the
  // prior baseline with a misleading eval_score=0 — downstream readers
  // (skill-evolution loop, /audit) would then see "skill scored 0" instead of
  // "skill never got a clean baseline". Gating the write on errors=0 preserves
  // the prior NO_BASELINE state so the next clean run can fill it in.
  // (formal-methods-tla, rag-evaluation 2026-05-19.)
  const isIncompleteRun = mode === 'comprehension' && result && Number(result.errors) > 0;
  if (writeBackDryRun) {
    console.log('Health Block not updated: --dry-run (preview only).');
  } else if (isIncompleteRun) {
    console.log(
      `Health Block not updated: run had ${result.errors} errored case${result.errors === 1 ? '' : 's'} — incomplete runs must not overwrite the prior baseline.`,
    );
  } else {
    const writeRes = writeHealthFieldsFromEvalResult(evalFile, mode, result);
    if (writeRes.written) {
      console.log(
        `Health Block updated at ${writeRes.sidecar || writeRes.skillFile}: ` +
          `eval_score=${writeRes.score}, eval_failed_ids=[${writeRes.failedIds.join(', ')}], freshness=${todayIsoDate()}`,
      );
    } else {
      console.log(`Health Block not updated: ${writeRes.reason}`);
    }
  }

  // 2026-04-09: comprehension runs with ANY errored case are incomplete.
  // Previously this script exited 0 even when 1/7 cases silently dropped
  // (the Phase 2 pilot lost case 3 this way). A non-zero exit makes the
  // failure visible to loops, CI, and the shell caller.
  if (mode === 'comprehension' && result && Number(result.errors) > 0) {
    console.error(
      `Exit 1: comprehension run had ${result.errors} errored case${result.errors === 1 ? '' : 's'}. Run is incomplete — see the RED FLAG block above for the failed IDs.`,
    );
    process.exit(1);
  }

  // Regression gate: compare candidate vs baseline pass counts on completed evals
  if (regressionGate && Array.isArray(result.results)) {
    const gatedResults = result.results.filter((r) => !r.error);
    const gatedTotal = gatedResults.length;
    const gatedBaselinePassed = gatedResults.filter((r) => r.baseline && r.baseline.passed === true).length;
    const gatedCandidatePassed = gatedResults.filter((r) => r.candidate && r.candidate.passed === true).length;

    if (gatedCandidatePassed < gatedBaselinePassed) {
      console.error(`REGRESSION DETECTED: candidate passed ${gatedCandidatePassed}/${gatedTotal} evals vs baseline ${gatedBaselinePassed}/${gatedTotal}`);
      process.exit(1);
    }
    console.log(`Regression gate passed: candidate ${gatedCandidatePassed}/${gatedTotal} >= baseline ${gatedBaselinePassed}/${gatedTotal}`);
  }
}

// ─── Bidirectional eval direction runner (the live runDirection) ──────────────
//
// The function the two-frontier bidirectional runner (lib/audit/run-bidirectional-
// eval.js) and enrich orchestrator inject as deps.runDirection / deps.runEvalDirection.
// It wires ONE direction: the measured generator + one frontier grader, under the
// SHARED tools-ON execution profile, then returns a normalized
// direction receipt. The generator CLI is inferred from the generator model alias
// (resolveModelExecutor); the grader CLI is the grader model's backend (claude for
// opus, codex for gpt-5.5). Model identity stays role/alias-based — never a
// dated version. This is the ONLY place the two runners are wired with per-direction
// models; runBidirectionalEval owns the judge-pair sequencing + reconciliation + parity gate.
function runEvalDirection({
  direction,
  mode,
  generatorModel,
  graderModel,
  generatorFamily,
  graderFamily,
  executionProfile,
  evalFile,
  skillDir,
  workspace,
  baselineWorkspace,
}) {
  const cwd = (executionProfile && executionProfile.cwd) || workspace || process.cwd();
  // Grader CLI = the grader model's backend (claude | codex | gemini | opencode).
  // The concrete grader/generator model ids are resolved below via
  // resolveReceiptModelId (SKI-41); here we only need the CLI to route the run.
  const { cli: graderCli } = resolveModelExecutor(graderModel);
  // Generator CLI = the generator model's backend. MUST be passed explicitly:
  // runPromptWithCli defaults `generator = 'claude'`, which would override the
  // model-inferred CLI and send a gpt-5.5 generator to the claude CLI with a
  // null model (live pilot 2026-06-03 caught exactly this — the Codex direction failed with
  // "claude selected model (null)"). Threading the inferred CLI fixes it.
  const { cli: generatorCli } = resolveModelExecutor(generatorModel);

  // SH-6680: capture the concrete codex model from the actual run. gpt-5.5
  // resolves to null (USE_CLI_CURRENT), so without this the receipt carries the
  // `latest-alias-unresolved` sentinel and the run caps to PROVISIONAL. Reset the
  // per-direction capture so a recorded value reflects only THIS direction's codex run.
  resetCodexModelCapture();

  let result;
  let verdict;
  if (mode === 'comprehension') {
    const file = evalFile || path.join(skillDir, 'evals', 'comprehension.json');
    result = runComprehensionEval(file, {
      workspace: cwd,
      // Skill-absent baseline working dir (keeps research tools ON). Defaults to the
      // shared cwd when not supplied — the panel path's cwd is the skill-graph root,
      // which is provably skill-absent (the candidate lives in a sibling/temp dir).
      baselineWorkspace: baselineWorkspace || cwd,
      generator: generatorCli,
      grader: graderCli,
      comprehensionGeneratorModel: generatorModel,
      comprehensionGraderModel: graderModel,
      certifying: true,
      generatorFamily: generatorFamily || generatorModel,
      graderFamily: graderFamily || graderModel,
      executionProfile,
    });
    verdict = result.comprehension_verdict;
  } else {
    throw new Error(`runEvalDirection: mode must be 'comprehension' (got '${mode}')`);
  }

  // Resolve the concrete models AFTER the eval ran. SKI-41: a bare claude alias
  // (opus/sonnet/haiku) resolves to "newest installed" at run time — it is NOT a
  // concrete generation id, so resolveModelExecutor returns the alias string
  // ('opus') which the old `|| SENTINEL` chain treated as resolved (truthy). It is
  // not: resolveReceiptModelId maps a latest-resolving alias to the honest
  // sentinel, keeps a concrete pinned id (gemini/gpt) as-is, and prefers the codex
  // model captured from the output header (SH-6680) for the codex role.
  const capturedCodexModel = getResolvedCodexModel();
  const resolvedGenerator = resolveReceiptModelId(generatorModel, { capturedCodexModel });
  const resolvedGrader = resolveReceiptModelId(graderModel, { capturedCodexModel });

  return {
    direction,
    mode,
    generator_model: generatorModel,
    grader_model: graderModel,
    generator_family: generatorFamily || generatorModel,
    grader_family: graderFamily || graderModel,
    resolved_generator_model: resolvedGenerator,
    resolved_model: resolvedGrader, // grader is the certifying judge; resolved id (or sentinel)
    verdict,
    certification_tier: result.certification_tier || 'provisional',
    calibrated: result.calibrated === true,
    calibration_receipt: result.calibration_receipt || null,
    red_herring_cases_total: Number(result.red_herring_cases_total || 0),
    red_herring_coverage_ok: result.red_herring_coverage_ok === true,
    // Prefer the profile the runner recorded; fall back to the one we passed in so
    // assertParity always has a profile to compare (a missing profile = parity fail).
    execution_profile: result.execution_profile || executionProfile || null,
    raw: result,
  };
}

if (require.main === module) {
  main();
}

module.exports = {
  runEvalDirection,
  // SH-6680 codex resolved-model capture (exported for unit tests).
  extractCodexModel,
  recordCodexModelFromOutput,
  getResolvedCodexModel,
  resetCodexModelCapture,
  parseArgs,
  resolveWorkspaceFromEvalFile,
  normalizeWorkspace,
  extractJsonObject,
  buildJudgePrompt,
  runClaudeCliPrompt,
  getEvalResponse,
  computeWilsonLowerBound,
  summarizeEvalMetrics,
  runEval,
  runMatrixEval,
  // Comprehension (added 2026-04-08)
  runComprehensionEval,
  buildConceptGraderPrompt,
  normalizeConceptGrade,
  loadConceptGraderPrompt,
  CONCEPT_DIMENSIONS,
  CONCEPT_DIMENSION_WEIGHTS,
  CONCEPT_DIMENSION_MAX,
  CONCEPT_PRIMARY_PASS_MIN,
  CONCEPT_SCORE_RATIO_PASS_MIN,
  CONCEPT_AGGREGATE_RATIO_PASS_MIN,
  CONCEPT_MIN_HELPFUL_DELTA,
  CONCEPT_MIN_STRONG_DELTA,
  CONCEPT_BASELINE_SATURATION_MIN,
  COMPREHENSION_VERDICT_ENUM,
  normalizeComprehensionVerdict,
  stampComprehensionVerdict,
  // v6 Health Block + Understanding-field provenance (workspace fork parity)
  extractUnderstandingFromFrontmatter,
  deriveEvalScoreAndFailures,
  writeHealthFieldsFromEvalResult,
  todayIsoDate,
  // Exported for grader-backend tier-enforcement tests (SKI-40).
  runGraderPrompt,
};
