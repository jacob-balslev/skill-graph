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

/**
 * Read the skill, its truth sources, and the checklist. Returns the payload
 * the prompt builder needs. Reads are bounded so a single massive truth
 * source does not explode the prompt budget.
 *
 * @param {object} opts
 * @param {string} opts.skillDir        Absolute path to the skill directory.
 * @param {string} opts.repoRoot        Absolute path to the repo root.
 * @param {number} [opts.truthSourceCharLimit] Per-file character cap.
 * @returns {{
 *   skillName: string,
 *   skillBody: string,
 *   frontmatter: object|null,
 *   truthSources: Array<{ path: string, content: string, truncated: boolean }>,
 *   checklist: string,
 * }}
 */
function collectContext(opts) {
  const {
    skillDir,
    repoRoot,
    truthSourceCharLimit = DEFAULT_TRUTH_SOURCE_CHAR_LIMIT,
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

  const checklistPath = path.join(repoRoot, 'docs', 'single-skill-audit-checklist.md');
  const checklist = fs.readFileSync(checklistPath, 'utf8');

  const skillName = path.basename(skillDir);
  return { skillName, skillBody, frontmatter, truthSources, checklist };
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

const VERDICT_ENUM = ['PASS', 'PASS WITH FIXES', 'FAIL', 'N/A'];
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
  const { skillName, skillBody, truthSources, checklist } = context;
  const criteria = sliceChecklist(checklist, dimension.checklistAnchor) || '[checklist anchor not found]';

  const truthBlock = truthSources.length === 0
    ? '(no truth_sources declared in frontmatter — grounding block is absent or empty)'
    : truthSources.map(ts => [
        `<truth-source path="${ts.path}"${ts.truncated ? ' truncated="true"' : ''}>`,
        ts.content.trim(),
        '</truth-source>',
      ].join('\n')).join('\n\n');

  return [
    '# IDENTITY',
    '',
    'You are a skeptical Skill Graph auditor. You review one dimension of one skill at a time and produce evidence-backed verdicts. Default bias: skeptical, not generous.',
    '',
    '# STEPS',
    '',
    `1. Read the SKILL.md body for the skill named \`${skillName}\`.`,
    '2. Read the truth_source files listed in the skill\'s frontmatter (if any).',
    `3. Read the pass criteria for dimension "${dimension.label}".`,
    '4. For each checklist bullet, mark PASS, PASS WITH FIXES, or FAIL with a quoted evidence snippet.',
    '5. Aggregate into one dimension verdict and a 1–5 score (5 = state of the art, 1 = broken).',
    '6. Produce a finding row for every checklist bullet that is not a full PASS.',
    '',
    '# RULES',
    '',
    '- Every finding MUST cite a concrete evidence quote from the skill or a truth source.',
    `- "Final verdict" MUST be one of: ${VERDICT_ENUM.map(v => '`' + v + '`').join(', ')}.`,
    `- "severity" MUST be one of: ${SEVERITY_ENUM.map(v => '`' + v + '`').join(', ')}.`,
    '- A dimension that is N/A for this skill (e.g. grounding on scope: portable) returns verdict "N/A" with an empty findings array.',
    '- Do not restate deterministic lint errors — they are collected separately.',
    '- Do not invent failure modes. If you cannot find a concrete problem for a bullet, mark it PASS.',
    '- Do not emit any prose outside the <verdict>…</verdict> block.',
    '',
    '# INPUT',
    '',
    `<skill-name>${skillName}</skill-name>`,
    '',
    '<skill-body>',
    skillBody.trim(),
    '</skill-body>',
    '',
    '<truth-sources>',
    truthBlock,
    '</truth-sources>',
    '',
    `<dimension id="${dimension.id}" label="${dimension.label}">`,
    criteria,
    '</dimension>',
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
 * Derive a single overall verdict from the per-dimension verdicts.
 *
 * Rule (coarse, intentional):
 * - any FAIL in a non-N/A dimension → FAIL
 * - otherwise any PASS WITH FIXES → PASS WITH FIXES
 * - all PASS (N/A counts as PASS) → PASS
 *
 * @param {Array<{ verdict: string }>} dimensionVerdicts
 * @returns {'PASS' | 'PASS WITH FIXES' | 'FAIL'}
 */
function aggregateVerdict(dimensionVerdicts) {
  let worst = 'PASS';
  for (const d of dimensionVerdicts) {
    if (d.verdict === 'FAIL') return 'FAIL';
    if (d.verdict === 'PASS WITH FIXES') worst = 'PASS WITH FIXES';
  }
  return worst;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  DIMENSIONS,
  VERDICT_ENUM,
  SEVERITY_ENUM,
  collectContext,
  sliceChecklist,
  buildDimensionPrompt,
  parseDimensionResponse,
  aggregateVerdict,
};
