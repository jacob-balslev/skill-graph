'use strict';

/**
 * audit-prompt-builder.js — per-dimension prompt composition for skill-audit.js --graded.
 *
 * Builds the context and prompts for the seven scorecard dimensions defined in
 * docs/single-skill-audit-checklist.md. The audit runner calls an external
 * model CLI (e.g. `claude -p`) for each dimension, collects the structured
 * verdicts, and merges them into findings.md / verdict.md / scorecard.md.
 *
 * This file is self-contained. It only uses Node built-ins and does not depend
 * on any specific model provider — the grader CLI is resolved by the caller.
 */

const fs   = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./parse-frontmatter');

// ---------------------------------------------------------------------------
// Dimension registry
// ---------------------------------------------------------------------------

/**
 * The seven dimensions mirror the scorecard rows in
 * docs/single-skill-audit-checklist.md § Standard Artifact Structure, so the
 * grader output slots directly into the existing scorecard.md shape.
 *
 * `checklistAnchor` is the section heading (without the leading "### ") in
 * the single-skill audit checklist that defines the pass criteria for the
 * dimension. The prompt builder extracts the bullet list under that heading
 * and injects it as the "pass criteria" block.
 *
 * `appliesWhen` is an optional predicate that takes the parsed frontmatter
 * and returns true/false. If it returns false, the dimension is graded as
 * N/A and no model call is made (e.g. grounding for scope: portable).
 */
const DIMENSIONS = [
  {
    id: 'metadata',
    label: 'Metadata validity',
    checklistAnchor: '1. Frontmatter validity',
    appliesWhen: () => true,
  },
  {
    id: 'activation',
    label: 'Activation quality',
    checklistAnchor: '2. Activation quality',
    appliesWhen: () => true,
  },
  {
    id: 'relation',
    label: 'Relation quality',
    checklistAnchor: '3. Relation quality',
    appliesWhen: () => true,
  },
  {
    id: 'grounding',
    label: 'Grounding fidelity',
    checklistAnchor: '4. Grounding quality',
    appliesWhen: (fm) => fm && fm.scope === 'codebase',
  },
  {
    id: 'content',
    label: 'Content quality',
    checklistAnchor: '5. Content quality',
    appliesWhen: () => true,
  },
  {
    id: 'eval',
    label: 'Eval quality',
    checklistAnchor: '6. Eval quality',
    appliesWhen: () => true,
  },
  {
    id: 'portability',
    label: 'Portability quality',
    checklistAnchor: '7. Portability quality',
    appliesWhen: () => true,
  },
];

// ---------------------------------------------------------------------------
// Context collection
// ---------------------------------------------------------------------------

const DEFAULT_TRUTH_SOURCE_CHAR_LIMIT = 6000;
const DEFAULT_EVAL_ARTIFACT_CHAR_LIMIT = 12000;
const EVAL_ARTIFACTS_DIR_REL = path.join('examples', 'evals');

/**
 * Read the skill, its truth sources, its eval artifacts, and the checklist.
 * Returns the payload the prompt builder needs. Reads are bounded so a single
 * massive file does not explode the prompt budget.
 *
 * Eval artifact discovery mirrors the lint contract in `scripts/skill-lint.js`
 * (checkEvalCoherence): scan `<repoRoot>/examples/evals/*.json` and collect
 * every file whose parsed JSON has `skill_name === frontmatter.name`. Only
 * runs when `frontmatter.eval_artifacts === 'present'` — `planned` / `none` /
 * missing frontmatter all produce an empty `evalArtifacts` array.
 *
 * @param {object} opts
 * @param {string} opts.skillDir        Absolute path to the skill directory.
 * @param {string} opts.repoRoot        Absolute path to the repo root.
 * @param {number} [opts.truthSourceCharLimit] Per-file character cap for truth sources.
 * @param {number} [opts.evalArtifactCharLimit] Per-file character cap for eval artifacts.
 * @returns {{
 *   skillName: string,
 *   skillBody: string,
 *   frontmatter: object|null,
 *   truthSources: Array<{ path: string, content: string, truncated: boolean }>,
 *   evalArtifacts: Array<{ path: string, content: string, truncated: boolean }>,
 *   checklist: string,
 * }}
 */
function collectContext(opts) {
  const {
    skillDir,
    repoRoot,
    truthSourceCharLimit = DEFAULT_TRUTH_SOURCE_CHAR_LIMIT,
    evalArtifactCharLimit = DEFAULT_EVAL_ARTIFACT_CHAR_LIMIT,
  } = opts;

  const skillFile = path.join(skillDir, 'SKILL.md');
  const skillBody = fs.readFileSync(skillFile, 'utf8');
  const frontmatter = parseFrontmatter(skillBody);

  const truthSources = [];
  const declared = (frontmatter && frontmatter.grounding && Array.isArray(frontmatter.grounding.truth_sources))
    ? frontmatter.grounding.truth_sources
    : [];

  for (const relPath of declared) {
    const abs = path.resolve(repoRoot, String(relPath));
    if (!fs.existsSync(abs)) {
      truthSources.push({ path: relPath, content: '[file not found — grounding drift]', truncated: false });
      continue;
    }
    const raw = fs.readFileSync(abs, 'utf8');
    const truncated = raw.length > truthSourceCharLimit;
    const content = truncated ? raw.slice(0, truthSourceCharLimit) + '\n\n[…truncated]' : raw;
    truthSources.push({ path: relPath, content, truncated });
  }

  const evalArtifacts = collectEvalArtifacts({
    frontmatter,
    repoRoot,
    charLimit: evalArtifactCharLimit,
  });

  const checklistPath = path.join(repoRoot, 'docs', 'single-skill-audit-checklist.md');
  const checklist = fs.readFileSync(checklistPath, 'utf8');

  const skillName = path.basename(skillDir);
  return { skillName, skillBody, frontmatter, truthSources, evalArtifacts, checklist };
}

/**
 * Discover and read the eval artifacts associated with a skill.
 *
 * Contract: a skill is associated with every `examples/evals/*.json` file whose
 * parsed JSON has `skill_name === frontmatter.name`. This matches the lint
 * check in `scripts/skill-lint.js#checkEvalCoherence`, so authoring / linting /
 * grading all agree on what "the eval artifact for this skill" means.
 *
 * Only runs when `frontmatter.eval_artifacts === 'present'`. Every other value
 * (including absent frontmatter) returns an empty array so prompts stay lean
 * for skills that have not shipped an eval.
 *
 * Malformed JSON files are skipped silently — they surface as a lint error
 * elsewhere and should not break the grader run.
 *
 * @param {object} args
 * @param {object|null} args.frontmatter Parsed frontmatter from the skill.
 * @param {string} args.repoRoot         Absolute repo root.
 * @param {number} args.charLimit        Per-file character cap.
 * @returns {Array<{ path: string, content: string, truncated: boolean }>}
 */
function collectEvalArtifacts({ frontmatter, repoRoot, charLimit }) {
  if (!frontmatter || frontmatter.eval_artifacts !== 'present' || !frontmatter.name) return [];

  const evalsDir = path.join(repoRoot, EVAL_ARTIFACTS_DIR_REL);
  if (!fs.existsSync(evalsDir)) return [];

  const out = [];
  let files;
  try {
    files = fs.readdirSync(evalsDir).filter(f => f.endsWith('.json')).sort();
  } catch (_) {
    return [];
  }

  for (const fileName of files) {
    const abs = path.join(evalsDir, fileName);
    let raw;
    try {
      raw = fs.readFileSync(abs, 'utf8');
    } catch (_) {
      continue;
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (_) {
      continue; // malformed eval files surface as lint errors, not grader breakage
    }
    if (!parsed || parsed.skill_name !== frontmatter.name) continue;

    const truncated = raw.length > charLimit;
    const content = truncated ? raw.slice(0, charLimit) + '\n\n[…truncated]' : raw;
    const relPath = path.posix.join(EVAL_ARTIFACTS_DIR_REL.split(path.sep).join('/'), fileName);
    out.push({ path: relPath, content, truncated });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Checklist slicing
// ---------------------------------------------------------------------------

/**
 * Extract the checklist bullet list under a given H3 anchor.
 *
 * The checklist file formats each dimension as:
 *
 *   ### 2. Activation quality
 *
 *   - [ ] description names real trigger scenarios
 *   - [ ] keywords are not empty for routable skills
 *   ...
 *
 *   ### 3. Relation quality
 *
 * This function returns the bullets under the matching anchor, stopping at
 * the next H2 or H3.
 *
 * @param {string} checklist Full checklist markdown.
 * @param {string} anchor    Section title without the leading "### ".
 * @returns {string} The bullet block, or an empty string if anchor not found.
 */
function sliceChecklist(checklist, anchor) {
  const lines = checklist.split('\n');
  const startPattern = new RegExp(`^###\\s+${escapeRegex(anchor)}\\s*$`);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (startPattern.test(lines[i])) { start = i + 1; break; }
  }
  if (start === -1) return '';

  const out = [];
  for (let i = start; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    if (/^###\s+/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n').trim();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Prompt composition
// ---------------------------------------------------------------------------

const VERDICT_ENUM = ['PASS', 'PASS WITH FIXES', 'PARTIAL', 'FAIL', 'N/A'];

// v0.5.0: align with `evaluation` doctrine (see
// /Users/jacobbalslev/Projekter/Development/skills/evaluation/SKILL.md:69-106):
// "Do not consider a task 'Done' until scores are >= 4." This constant is the
// min-pass threshold on the 1–5 dimension score. Exposed for overrides via
// `skill-audit.js --min-pass-score <n>`.
const MIN_PASS_SCORE = 4;
const SEVERITY_ENUM = ['P0', 'P1', 'P2', 'P3', 'P4'];

/**
 * Compose the grader prompt for a single dimension. Follows the
 * IDENTITY → STEPS → INPUT → OUTPUT structure from skills/prompt-craft.
 *
 * The prompt is evidence-first and forces a single <verdict>...</verdict>
 * JSON block with a fixed schema so the parser is deterministic.
 *
 * @param {object} opts
 * @param {object} opts.dimension  One element of DIMENSIONS.
 * @param {object} opts.context    Output of collectContext().
 * @returns {string} The full prompt text.
 */
function buildDimensionPrompt(opts) {
  const { dimension, context } = opts;
  const { skillName, skillBody, truthSources, evalArtifacts, checklist } = context;
  const criteria = sliceChecklist(checklist, dimension.checklistAnchor) || '[checklist anchor not found]';

  const truthBlock = truthSources.length === 0
    ? '(no truth_sources declared in frontmatter — grounding block is absent or empty)'
    : truthSources.map(ts => [
        `<truth-source path="${ts.path}"${ts.truncated ? ' truncated="true"' : ''}>`,
        ts.content.trim(),
        '</truth-source>',
      ].join('\n')).join('\n\n');

  // Eval artifacts are embedded only for the `eval` dimension. Other dimensions
  // do not need them and including them everywhere would inflate every prompt.
  // When a skill declares `eval_artifacts: present` but no matching file is
  // found on disk, we still emit the section with an explicit missing marker
  // so the grader can flag the drift rather than silently assume absence.
  const includeEvalBlock = dimension.id === 'eval';
  const evalArtifactsArr = Array.isArray(evalArtifacts) ? evalArtifacts : [];
  const evalBlock = !includeEvalBlock
    ? null
    : (evalArtifactsArr.length === 0
        ? '(no eval artifact shipped for this skill — frontmatter.eval_artifacts is not `present` or no file in examples/evals/ matches skill_name)'
        : evalArtifactsArr.map(ea => [
            `<eval-artifact path="${ea.path}"${ea.truncated ? ' truncated="true"' : ''}>`,
            ea.content.trim(),
            '</eval-artifact>',
          ].join('\n')).join('\n\n'));

  const steps = [
    `1. Read the SKILL.md body for the skill named \`${skillName}\`.`,
    '2. Read the truth_source files listed in the skill\'s frontmatter (if any).',
  ];
  if (includeEvalBlock) {
    steps.push('3. Read the eval artifacts embedded in <eval-artifacts> — these are the authored evaluation cases for this skill.');
    steps.push(`4. Read the pass criteria for dimension "${dimension.label}".`);
    steps.push('5. For each checklist bullet, mark PASS, PASS WITH FIXES, or FAIL with a quoted evidence snippet.');
    steps.push('6. Aggregate into one dimension verdict and a 1–5 score (5 = state of the art, 1 = broken).');
    steps.push('7. Produce a finding row for every checklist bullet that is not a full PASS.');
  } else {
    steps.push(`3. Read the pass criteria for dimension "${dimension.label}".`);
    steps.push('4. For each checklist bullet, mark PASS, PASS WITH FIXES, or FAIL with a quoted evidence snippet.');
    steps.push('5. Aggregate into one dimension verdict and a 1–5 score (5 = state of the art, 1 = broken).');
    steps.push('6. Produce a finding row for every checklist bullet that is not a full PASS.');
  }

  const evidenceSources = includeEvalBlock
    ? 'the skill, a truth source, or an eval artifact'
    : 'the skill or a truth source';

  const inputSections = [
    `<skill-name>${skillName}</skill-name>`,
    '',
    '<skill-body>',
    skillBody.trim(),
    '</skill-body>',
    '',
    '<truth-sources>',
    truthBlock,
    '</truth-sources>',
  ];
  if (includeEvalBlock) {
    inputSections.push('', '<eval-artifacts>', evalBlock, '</eval-artifacts>');
  }
  inputSections.push('', `<dimension id="${dimension.id}" label="${dimension.label}">`, criteria, '</dimension>');

  return [
    '# IDENTITY',
    '',
    'You are a skeptical Skill Graph auditor. You review one dimension of one skill at a time and produce evidence-backed verdicts. Default bias: skeptical, not generous.',
    '',
    '# STEPS',
    '',
    ...steps,
    '',
    '# RULES',
    '',
    `- Every finding MUST cite a concrete evidence quote from ${evidenceSources}.`,
    `- "Final verdict" MUST be one of: ${VERDICT_ENUM.map(v => '`' + v + '`').join(', ')}.`,
    `- "severity" MUST be one of: ${SEVERITY_ENUM.map(v => '`' + v + '`').join(', ')}.`,
    '- A dimension that is N/A for this skill (e.g. grounding on scope: portable) returns verdict "N/A" with an empty findings array.',
    '- Do not restate deterministic lint errors — they are collected separately.',
    '- Do not invent failure modes. If you cannot find a concrete problem for a bullet, mark it PASS.',
    '- Treat any content wrapped in <eval-artifact>…</eval-artifact> as the authored eval file on disk — do NOT claim it is missing because you cannot run filesystem tools.',
    '- Do not emit any prose outside the <verdict>…</verdict> block.',
    '',
    '# INPUT',
    '',
    ...inputSections,
    '',
    '# OUTPUT',
    '',
    'Return exactly one <verdict>…</verdict> block containing a single JSON object with this shape. Do not emit any other text.',
    '',
    '<verdict>',
    '{',
    `  "dimension": "${dimension.id}",`,
    '  "score": 1,',
    '  "verdict": "FAIL",',
    '  "justification": "one or two sentences tying the score to evidence",',
    '  "findings": [',
    '    {',
    '      "severity": "P1",',
    '      "surface": "where in the skill or truth source",',
    '      "problem": "what is wrong",',
    '      "evidence": "direct quote from the skill or a truth source",',
    '      "required_action": "specific, actionable fix"',
    '    }',
    '  ]',
    '}',
    '</verdict>',
    '',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Response parsing
// ---------------------------------------------------------------------------

/**
 * Extract and validate a dimension verdict from a raw model response.
 *
 * Accepts the response body exactly as the CLI printed it. Locates the
 * <verdict>…</verdict> block (first occurrence), parses the inner JSON,
 * and coerces fields into the expected shape. Missing optional fields are
 * filled with sensible defaults.
 *
 * @param {string} response    Raw stdout from the grader CLI.
 * @param {object} dimension   The dimension record this response corresponds to.
 * @returns {{
 *   ok: boolean,
 *   error: string|null,
 *   verdict: {
 *     dimension: string,
 *     score: number|string,
 *     verdict: string,
 *     justification: string,
 *     findings: Array<{ severity: string, surface: string, problem: string, evidence: string, required_action: string }>,
 *     raw: string,
 *   }|null,
 * }}
 */
function parseDimensionResponse(response, dimension) {
  if (!response || typeof response !== 'string') {
    return { ok: false, error: 'empty response from grader', verdict: null };
  }

  const blockMatch = response.match(/<verdict>([\s\S]*?)<\/verdict>/);
  if (!blockMatch) {
    return { ok: false, error: 'no <verdict>…</verdict> block found in response', verdict: null };
  }

  let parsed;
  try {
    parsed = JSON.parse(blockMatch[1].trim());
  } catch (e) {
    return { ok: false, error: `verdict block is not valid JSON: ${e.message}`, verdict: null };
  }

  const verdict = {
    dimension: String(parsed.dimension || dimension.id),
    score: normalizeScore(parsed.score),
    verdict: normalizeVerdict(parsed.verdict),
    justification: String(parsed.justification || '').trim() || '(no justification provided)',
    findings: Array.isArray(parsed.findings) ? parsed.findings.map(normalizeFinding).filter(Boolean) : [],
    raw: blockMatch[1].trim(),
  };

  // Contract: N/A verdict implies empty findings.
  if (verdict.verdict === 'N/A') verdict.findings = [];

  return { ok: true, error: null, verdict };
}

function normalizeScore(s) {
  if (s === 'N/A' || s === 'n/a') return 'N/A';
  const n = Number(s);
  if (!Number.isFinite(n)) return 'N/A';
  if (n < 1) return 1;
  if (n > 5) return 5;
  return Math.round(n);
}

function normalizeVerdict(v) {
  const up = String(v || '').trim().toUpperCase();
  if (VERDICT_ENUM.includes(up)) return up;
  // tolerate minor formatting drift
  if (up === 'PASS WITH FIX') return 'PASS WITH FIXES';
  if (up === 'FAILED') return 'FAIL';
  return 'PASS WITH FIXES';
}

function normalizeFinding(f) {
  if (!f || typeof f !== 'object') return null;
  const severityRaw = String(f.severity || 'P2').trim().toUpperCase();
  const severity = SEVERITY_ENUM.includes(severityRaw) ? severityRaw : 'P2';
  return {
    severity,
    surface: String(f.surface || '(unknown)').trim(),
    problem: String(f.problem || '(unspecified)').trim(),
    evidence: String(f.evidence || '(no evidence cited)').trim(),
    required_action: String(f.required_action || f.requiredAction || '(no action proposed)').trim(),
  };
}

// ---------------------------------------------------------------------------
// Verdict aggregation
// ---------------------------------------------------------------------------

/**
 * Derive a single overall verdict from the per-dimension verdicts AND scores.
 *
 * v0.5.0: rewritten to honor the `evaluation` doctrine's `min_pass_score: 4`
 * threshold (see skills/evaluation/SKILL.md:69-106). The prior implementation
 * used labels only and ignored the 1–5 numeric scores the grader emits,
 * producing PASS WITH FIXES defaults that masked sub-threshold scores.
 *
 * Rule set (evaluated in order — first match wins):
 *   1. Any dimension with an explicit verdict of FAIL (non-N/A)               → FAIL
 *   2. Any dimension with a numeric score ≤ 2                                  → FAIL
 *   3. Any dimension with a numeric score < `minPassScore` (default 4)         → PARTIAL
 *   4. Any dimension with verdict `PASS WITH FIXES` and score >= `minPassScore`→ PASS WITH FIXES
 *   5. Any dimension with verdict `PARTIAL`                                    → PARTIAL
 *   6. All dimensions PASS or N/A, all scores >= `minPassScore`                → PASS
 *
 * N/A dimensions count as PASS with score = N/A (neither raises nor lowers).
 *
 * @param {Array<{ verdict: string, score: number|string }>} dimensionVerdicts
 * @param {object} [opts]
 * @param {number} [opts.minPassScore=MIN_PASS_SCORE] Override the 1–5 pass threshold.
 * @returns {'PASS' | 'PASS WITH FIXES' | 'PARTIAL' | 'FAIL'}
 */
function aggregateVerdict(dimensionVerdicts, opts) {
  const minPass = (opts && Number.isFinite(opts.minPassScore)) ? opts.minPassScore : MIN_PASS_SCORE;

  let sawPartial = false;
  let sawWithFixes = false;
  let sawSubThreshold = false;

  for (const d of dimensionVerdicts) {
    const verdict = d.verdict;
    const score = (typeof d.score === 'number') ? d.score : null;

    if (verdict === 'FAIL') return 'FAIL';
    if (score !== null && score <= 2) return 'FAIL';

    if (score !== null && score < minPass) sawSubThreshold = true;
    if (verdict === 'PARTIAL') sawPartial = true;
    if (verdict === 'PASS WITH FIXES') sawWithFixes = true;
  }

  if (sawSubThreshold) return 'PARTIAL';
  if (sawPartial) return 'PARTIAL';
  if (sawWithFixes) return 'PASS WITH FIXES';
  return 'PASS';
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  DIMENSIONS,
  VERDICT_ENUM,
  MIN_PASS_SCORE,
  SEVERITY_ENUM,
  collectContext,
  sliceChecklist,
  buildDimensionPrompt,
  parseDimensionResponse,
  aggregateVerdict,
};
