#!/usr/bin/env node
//
// check-work-mode-separation.js — Skill Graph work-mode separation warning (skill-graph repo).
//
// Skill-graph-repo-local sibling of ~/Development/scripts/skill/check-work-mode-separation.js.
// Same purpose, narrower classifier: only skill-graph-relative paths exist in this repo, so the
// classifier only needs to distinguish per-skill audit artifacts (CONTENT) from audit prompts +
// audit-loop state + schemas + scripts + protocol docs (SYSTEM).
//
// Enforces:
//   - skill-graph/AGENTS.md § "Work Modes — SYSTEM vs CONTENT"
//   - workspace AGENTS.md § Non-Negotiable Standards #16
//
// Exit code is ALWAYS 0 — soft warning, never blocks. Honors AUDIT_LOOP=1 bypass.

const { execSync } = require('node:child_process');

const args = process.argv.slice(2);
const STAGED = args.includes('--staged');
const FILES_IDX = args.indexOf('--files');
const FILES_ARG = FILES_IDX >= 0 ? args[FILES_IDX + 1] : null;

if (process.env.AUDIT_LOOP === '1') {
  process.exit(0);
}

function listStaged() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.split('\n').map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function listFromArg(arg) {
  return arg.split(',').map((s) => s.trim()).filter(Boolean);
}

const files = FILES_ARG ? listFromArg(FILES_ARG) : STAGED ? listStaged() : [];

if (files.length === 0) {
  process.exit(0);
}

// Skill-graph-relative paths only. Order matters: per-skill audit artifacts beat the generic
// audits/ match.
function classify(path) {
  const auditMatch = path.match(/^audits\/([^/]+)\//);
  if (auditMatch) {
    const child = auditMatch[1];
    if (child === 'prompts' || child === '_state') return 'SYSTEM';
    return 'CONTENT';
  }

  if (/^schemas\//.test(path)) return 'SYSTEM';
  if (/^docs\//.test(path)) return 'SYSTEM';
  if (/^scripts\//.test(path)) return 'SYSTEM';
  if (/^bin\//.test(path)) return 'SYSTEM';
  if (/^examples\/audits\//.test(path)) return 'CONTENT';
  if (/^examples\//.test(path)) return 'SYSTEM';
  if (/^SKILL_[A-Z_]+\.md$/.test(path)) return 'SYSTEM';
  if (/^(AGENTS|CLAUDE|README|CONTRIBUTING|CHANGELOG)\.md$/.test(path)) return 'SYSTEM';
  if (/^[^/]+\.md$/.test(path)) return 'SYSTEM';

  return 'NEUTRAL';
}

const buckets = { SYSTEM: [], CONTENT: [], NEUTRAL: [] };
for (const f of files) {
  buckets[classify(f)].push(f);
}

if (buckets.SYSTEM.length === 0 || buckets.CONTENT.length === 0) {
  process.exit(0);
}

const lines = [];
lines.push('');
lines.push('⚠️  WORK-MODE SEPARATION WARNING (skill-graph repo)');
lines.push('');
lines.push('This commit stages BOTH SYSTEM and CONTENT files in the skill-graph repo.');
lines.push('The work-mode rule forbids mixing them — audit prompts / schemas / scripts');
lines.push('(SYSTEM) and per-skill audit artifacts under audits/<skill>/ (CONTENT) belong');
lines.push('in separate commits.');
lines.push('');
lines.push('  SYSTEM paths staged (' + buckets.SYSTEM.length + '):');
for (const f of buckets.SYSTEM) lines.push('    - ' + f);
lines.push('');
lines.push('  CONTENT paths staged (' + buckets.CONTENT.length + '):');
for (const f of buckets.CONTENT) lines.push('    - ' + f);
lines.push('');
lines.push('Recommended: split into two commits — one SYSTEM, one CONTENT — and drive');
lines.push('per-skill audit artifact updates through /audit:audit | improve | evaluate |');
lines.push('evolve, which sets AUDIT_LOOP=1 to suppress this warning.');
lines.push('');
lines.push('Doctrine: AGENTS.md § "Work Modes — SYSTEM vs CONTENT"');
lines.push('Workspace summary: ~/Development/AGENTS.md § Non-Negotiable Standards #16');
lines.push('');
lines.push('This is a WARNING only — the commit will proceed. To suppress this warning');
lines.push('for legitimate audit-loop writes, set AUDIT_LOOP=1.');
lines.push('');

process.stderr.write(lines.join('\n'));
process.exit(0);
