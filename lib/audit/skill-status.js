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
  if (!manifest) return null;

  const allSkills = [
    ...(manifest.skills?.shared || []),
    ...(manifest.skills?.salesHub || []),
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

  return null;
}

function extractHealthBlock(frontmatter) {
  // Health Block may live under audit_state or as top-level fields.
  const block = frontmatter.audit_state || frontmatter;

  const result = {};
  for (const field of HEALTH_BLOCK_FIELDS) {
    if (block[field] !== undefined && block[field] !== '') {
      result[field] = block[field];
    } else if (frontmatter[field] !== undefined && frontmatter[field] !== '') {
      result[field] = frontmatter[field];
    }
  }
  return result;
}

function formatTable(skillName, healthBlock) {
  const lines = [];
  lines.push(`\nHealth Block — ${skillName}`);
  lines.push('─'.repeat(48));

  if (Object.keys(healthBlock).length === 0) {
    lines.push('  (no Health Block data found — skill has not been audited yet)');
    lines.push('');
    return lines.join('\n');
  }

  const labelWidth = Math.max(...HEALTH_BLOCK_FIELDS.map((f) => f.length), 14);

  for (const field of HEALTH_BLOCK_FIELDS) {
    const value = healthBlock[field];
    if (value === undefined) continue;
    const label = field.padEnd(labelWidth, ' ');
    const display = Array.isArray(value) ? value.join(', ') || '—' : String(value);
    lines.push(`  ${label}  ${display}`);
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

  const frontmatter  = parseFrontmatter(content);
  const healthBlock  = extractHealthBlock(frontmatter);

  if (args.json) {
    process.stdout.write(JSON.stringify({ skill: skillName, path: skillPath, healthBlock }, null, 2) + '\n');
    return;
  }

  process.stdout.write(formatTable(skillName, healthBlock));
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    process.stderr.write(`Unexpected error: ${err.message || String(err)}\n`);
    process.exit(1);
  }
}

module.exports = { extractHealthBlock, findSkillPath, findRepoRoot };
