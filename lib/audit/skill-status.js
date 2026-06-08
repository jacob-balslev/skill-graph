#!/usr/bin/env node
/**
 * skill-status.js — Read-only view of a skill's Health Block.
 *
 * Reads the SKILL.md frontmatter for the named skill and prints the audit_state
 * Health Block fields in a compact, human-readable table.  When the skill is
 * unknown or has no Health Block, the tool exits 0 with a clear message so
 * CI and evolve loops can continue without failing.
 *
 * Usage:
 *   node src/skill-status.js <skill-name>
 *   node src/skill-status.js <skill-name> --json
 *   node src/skill-status.js <skill-name> --audit-root <path>
 *   node src/skill-status.js --help
 *
 * Flags:
 *   --json            Emit the Health Block as JSON instead of a table.
 *   --audit-root <p>  Root directory for skill SKILL.md files (default: auto-
 *                     detected from the skills.manifest.json in the repo root).
 *   --help, -h        Print usage and exit 0.
 *
 * Exit codes:
 *   0  Success or graceful no-data case.
 *   1  Fatal error (e.g. manifest unreadable, unexpected parse failure).
 *
 * Self-contained — only uses Node built-ins and the shared helpers in this repo.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const { parseArgs }        = require('../audit-shared/parse-args');
const { parseFrontmatter } = require('../audit-shared/skill-frontmatter');
const { collectSkillFiles, loadWorkspaceConfig } = require('./roots');
const { readSidecar }      = require('./audit-state-sidecar');

// ─── Health Block fields in canonical display order ──────────────────────────
//
// v7 split: the single `audit_verdict` field is replaced by four discrete
// verdicts (one per audit-pipeline layer). `lint_verdict` and `drift_status`
// remain unchanged — they are per-script signals the audit loop rolls up into
// `structural_verdict` and `truth_verdict` respectively. `audit_verdict` is
// retained in the display fallback ONLY for back-compat reads of v6 skills
// that have not yet been migrated; it is sorted last so v7 skills lead with
// the four current verdicts. See docs/adr/0011-split-audit-verdict-into-four-verdicts.md.

const HEALTH_BLOCK_FIELDS = [
  'last_audited',
  'last_changed',
  'structural_verdict',
  'truth_verdict',
  'comprehension_verdict',
  'application_verdict',
  'eval_score',
  'eval_failed_ids',
  'lint_verdict',
  'drift_status',
  'freshness',
  // Back-compat: present only on pre-v7 SKILL.md frontmatter that has not
  // been run through scripts/migrate-skill-v6-to-v7.js yet. v7 skills omit it.
  'audit_verdict',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Walk up from __dirname until we find the repo root (contains skills.manifest.json
 * or a package.json with a "skills" key).  Falls back to the Development workspace
 * root two levels above the skill-audit-loop directory.
 */
function findRepoRoot() {
  let dir = path.resolve(__dirname, '..', '..');
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, 'skills.manifest.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Final fallback: resolve relative to the skill-audit-loop parent
  return path.resolve(__dirname, '..', '..');
}

function loadManifest(repoRoot) {
  const manifestPath = path.join(repoRoot, 'skills.manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

function findSkillPath(skillName, manifest, repoRoot) {
  const manifestSkills = Array.isArray(manifest?.skills) ? manifest.skills : [];
  const allSkills = manifestSkills.length > 0
    ? manifestSkills
    : [
      ...(manifest?.skills?.shared || []),
      ...(manifest?.skills?.salesHub || []),
    ];

  const entry = allSkills.find(
    (s) => s.name === skillName || s.name === skillName.replace(/\//g, '/'),
  );

  if (entry && entry.path) {
    const skillPath = path.isAbsolute(entry.path)
      ? entry.path
      : path.join(repoRoot, entry.path);
    if (fs.existsSync(skillPath)) return skillPath;
  }

  // Fallback: try skills/<skillName>/SKILL.md and skills/sales-hub/<skillName>/SKILL.md
  const candidates = [
    path.join(repoRoot, 'skills', skillName, 'SKILL.md'),
    path.join(repoRoot, 'skills', 'sales-hub', skillName, 'SKILL.md'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  const workspace = loadWorkspaceConfig(repoRoot);
  for (const entry of collectSkillFiles(repoRoot, workspace)) {
    if (path.basename(path.dirname(entry.filePath)) === skillName) return entry.filePath;
  }

  return null;
}

function decodeYamlJsonScalar(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') && trimmed.endsWith('}')))) {
    return value;
  }
  try {
    return JSON.parse(trimmed.replace(/\\"/g, '"').replace(/\\\\/g, '\\'));
  } catch {
    return value;
  }
}

function normalizeStatusFrontmatter(frontmatter) {
  if (!frontmatter || typeof frontmatter !== 'object') return {};
  const metadata = frontmatter.metadata;
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return frontmatter;

  const normalized = { ...frontmatter };
  for (const [key, value] of Object.entries(metadata)) {
    if (!(key in normalized)) normalized[key] = decodeYamlJsonScalar(value);
  }
  return normalized;
}

function extractHealthBlock(frontmatter, sidecar) {
  // ADR-0019: the Health Block fields moved to the audit-state.json sidecar. Read order
  // mirrors joinSidecar's frontmatter-wins-on-collision rule — frontmatter blocks first
  // (so a mid-migration skill still carrying a field in frontmatter reads that copy), then
  // the sidecar (the canonical home for a fully-migrated skill). A null/absent sidecar (the
  // unmigrated/new case) contributes nothing and never crashes.
  // Pre-cut layouts: fields may live under audit_state, metadata, or top-level frontmatter.
  const blocks = [frontmatter.audit_state, frontmatter.metadata, frontmatter, sidecar].filter(Boolean);

  const result = {};
  for (const field of HEALTH_BLOCK_FIELDS) {
    for (const block of blocks) {
      if (block[field] !== undefined && block[field] !== '') {
        result[field] = block[field];
        break;
      }
    }
  }
  return result;
}

// Cumulative-gate classifier per ADR-0011 § Addendum 2026-05-27.
// Eligibility (admission) is not assessment; assessment is not certification.
// See docs/verdict-semantics.md for the canonical doctrine.
const STRUCTURAL_PASS_VALUES = new Set(['PASS', 'PASS_WITH_FIXES']);
const TRUTH_PASS_VALUES = new Set(['PASS']);

function classifyAuditState(healthBlock, skillContract = {}) {
  // Admission: structural AND truth both clear (eligibility gate).
  const structuralPass = STRUCTURAL_PASS_VALUES.has(healthBlock.structural_verdict);
  const truthPass = TRUTH_PASS_VALUES.has(healthBlock.truth_verdict);
  const admission = structuralPass && truthPass ? 'admitted' : 'not_admitted';

  // Assessment: derived from application_verdict (the primary quality signal).
  //   UNVERIFIED (or missing) → unassessed
  //   PROVISIONAL → assessed_provisional (single-model, not grader-confirmed)
  //   any other graded value → assessed_graded (dual-run grader confirmed)
  const av = healthBlock.application_verdict;
  let assessment;
  if (!av || av === 'UNVERIFIED') assessment = 'unassessed';
  else if (av === 'PROVISIONAL') assessment = 'assessed_provisional';
  else assessment = 'assessed_graded';

  // Certification outcome: only meaningful when assessed. APPLICABLE is the
  // certifying outcome; HARMFUL is the dangerous one (SkillsBench 19%);
  // others are honest negative grader signals.
  let certification;
  if (assessment === 'unassessed') certification = 'pending — eligible only';
  else certification = av;

  // Comprehension scope carve-out per ADR-0011 § Addendum 2026-05-20:
  // framework concepts the model already knows early-skip via
  // SKIPPED_BASELINE_HIGH; skills with NO comprehension layer by design
  // carry NA. These are NOT comprehension-unassessed.
  const cv = healthBlock.comprehension_verdict;
  let conceptScope;
  if (cv === 'SKIPPED_BASELINE_HIGH') conceptScope = 'framework_concept';
  else if (cv === 'NA') conceptScope = 'no_comprehension_layer';
  else if (skillContract.deployment_target === 'portable') conceptScope = 'portable';
  else if (skillContract.deployment_target === 'project') conceptScope = 'project';
  else conceptScope = 'repo_specific_or_unknown';

  return { admission, assessment, certification, conceptScope };
}

const AUDIT_STATE_FIELDS = ['admission', 'assessment', 'certification', 'conceptScope'];

// Verdict values that do NOT require a gradeable eval artifact on disk — a vacuum is
// the honest state for them (UNVERIFIED = never assessed; NA = no layer by design;
// SKIPPED_BASELINE_HIGH = comprehension early-skip for a framework concept the model
// already knows). Any OTHER value is a graded claim and MUST have its artifact on disk.
const COMPREHENSION_NO_ARTIFACT = new Set(['UNVERIFIED', 'NA', 'SKIPPED_BASELINE_HIGH', '']);
const APPLICATION_NO_ARTIFACT   = new Set(['UNVERIFIED', 'NA', '']);

/**
 * Detect "verdict present, artifact absent" (A4) — a graded comprehension/application
 * verdict recorded in the Health Block with no gradeable eval file on disk. The honest
 * state of such a skill is UNVERIFIED; the recorded verdict is unbacked and must not be
 * trusted. Symmetric to the per-run gate in scripts/check-audit-manifest.js, applied here
 * to the LIVE sidecar so `status` surfaces the inconsistency at a glance.
 *
 * @param {string} skillPath  Absolute path to the skill's SKILL.md.
 * @param {object} healthBlock The extracted Health Block (joined frontmatter+sidecar).
 * @returns {Array<{verdict: string, value: string, missing: string}>}
 */
function detectVerdictArtifactGaps(skillPath, healthBlock) {
  const dir = path.dirname(skillPath);
  const gaps = [];
  const cv = healthBlock.comprehension_verdict;
  if (cv && !COMPREHENSION_NO_ARTIFACT.has(cv)
      && !fs.existsSync(path.join(dir, 'evals', 'comprehension.json'))) {
    gaps.push({ verdict: 'comprehension_verdict', value: String(cv), missing: 'evals/comprehension.json' });
  }
  const av = healthBlock.application_verdict;
  if (av && !APPLICATION_NO_ARTIFACT.has(av)
      && !fs.existsSync(path.join(dir, 'evals', 'application.json'))) {
    gaps.push({ verdict: 'application_verdict', value: String(av), missing: 'evals/application.json' });
  }
  return gaps;
}

function formatTable(skillName, healthBlock, skillContract = {}, gaps = []) {
  const lines = [];
  lines.push(`\nHealth Block — ${skillName}`);
  lines.push('─'.repeat(48));

  if (Object.keys(healthBlock).length === 0) {
    lines.push('  (no Health Block data found — skill has not been audited yet)');
    lines.push('');
    return lines.join('\n');
  }

  const auditState = classifyAuditState(healthBlock, skillContract);
  const labelWidth = Math.max(
    ...HEALTH_BLOCK_FIELDS.map((f) => f.length),
    ...AUDIT_STATE_FIELDS.map((f) => f.length),
    14,
  );

  // Cumulative-gate summary first (per ADR-0011 § Addendum 2026-05-27).
  // These computed rows answer "is this skill admitted / assessed / certified?"
  // before the raw verdict fields they're derived from.
  lines.push('  Cumulative gates');
  for (const field of AUDIT_STATE_FIELDS) {
    const value = auditState[field];
    const label = field.padEnd(labelWidth, ' ');
    // Surface HARMFUL loudly: it's the SkillsBench-19% case the gate exists to catch.
    const marker = field === 'certification' && value === 'HARMFUL' ? '(!) ' : '';
    lines.push(`  ${label}  ${marker}${value}`);
  }
  lines.push('');
  lines.push('  Raw verdict fields');

  for (const field of HEALTH_BLOCK_FIELDS) {
    const value = healthBlock[field];
    if (value === undefined) continue;
    const label = field.padEnd(labelWidth, ' ');
    const display = Array.isArray(value) ? value.join(', ') || '—' : String(value);
    lines.push(`  ${label}  ${display}`);
  }

  // A4: loudly flag any graded verdict recorded without its backing eval artifact.
  // The honest state of such a skill is UNVERIFIED — the verdict is unbacked.
  if (gaps.length > 0) {
    lines.push('');
    lines.push('  (!) Verdict present, artifact ABSENT — honest state is UNVERIFIED');
    for (const g of gaps) {
      lines.push(`      ${g.verdict} = ${g.value}  but  ${g.missing}  is missing on disk`);
    }
    lines.push('      → re-run `evaluate --mode` to author the artifact, or reset the verdict to UNVERIFIED.');
  }

  lines.push('');
  return lines.join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    process.stdout.write([
      'skill-status.js — Read-only view of a skill\'s Health Block',
      '',
      'Usage:',
      '  node src/skill-status.js <skill-name>',
      '  node src/skill-status.js <skill-name> --json',
      '  node src/skill-status.js <skill-name> --audit-root <path>',
      '',
      'Flags:',
      '  --json            Emit the Health Block as JSON.',
      '  --audit-root <p>  Override the repo root used for skill discovery.',
      '  --help, -h        Print this message.',
      '',
    ].join('\n'));
    return;
  }

  const skillName = args._[0];

  if (!skillName) {
    process.stderr.write('Error: skill name is required.\n');
    process.stderr.write('Usage: node src/skill-status.js <skill-name>\n');
    process.exit(1);
  }

  const repoRoot = args['audit-root']
    ? path.resolve(args['audit-root'])
    : findRepoRoot();

  const manifest   = loadManifest(repoRoot);
  const skillPath  = findSkillPath(skillName, manifest, repoRoot);

  if (!skillPath) {
    const message = `Skill "${skillName}" not found in manifest or standard paths under ${repoRoot}.`;
    if (args.json) {
      process.stdout.write(JSON.stringify({ skill: skillName, found: false, message }) + '\n');
    } else {
      process.stdout.write(`\n${message}\nRun node src/skill-audit.js ${skillName} to create it.\n\n`);
    }
    // Exit 0 — not finding a skill is a graceful case, not a hard failure.
    return;
  }

  let content;
  try {
    content = fs.readFileSync(skillPath, 'utf8');
  } catch (err) {
    process.stderr.write(`Error reading ${skillPath}: ${err.message}\n`);
    process.exit(1);
  }

  const frontmatter  = normalizeStatusFrontmatter(parseFrontmatter(content));
  // ADR-0019: join the audit-state.json sidecar (sibling of SKILL.md) — the Health Block
  // fields live there for a migrated skill. readSidecar returns null for an unmigrated/new
  // skill, in which case the display falls back to the pre-cut frontmatter blocks.
  const sidecar      = readSidecar(skillPath);
  const healthBlock  = extractHealthBlock(frontmatter, sidecar);
  const verdictArtifactGaps = detectVerdictArtifactGaps(skillPath, healthBlock);

  if (args.json) {
    const auditState = classifyAuditState(healthBlock, frontmatter);
    process.stdout.write(JSON.stringify({
      skill: skillName,
      path: skillPath,
      auditState,
      healthBlock,
      verdictArtifactGaps,
    }, null, 2) + '\n');
    return;
  }

  process.stdout.write(formatTable(skillName, healthBlock, frontmatter, verdictArtifactGaps));
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    process.stderr.write(`Unexpected error: ${err.message || String(err)}\n`);
    process.exit(1);
  }
}

module.exports = { extractHealthBlock, classifyAuditState, detectVerdictArtifactGaps, findSkillPath, findRepoRoot, formatTable };
