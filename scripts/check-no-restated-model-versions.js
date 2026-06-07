#!/usr/bin/env node
'use strict';

/**
 * check-no-restated-model-versions.js
 *
 * Enforces the Model Identity Discipline (workspace AGENTS.md § "Model Identity
 * Discipline"; skill-graph AGENTS.md § "Skill Audit Loop Model Policy"):
 *
 *   Model identity is resolved through the model registry, not restated in prose.
 *   Durable instructions name model ROLES or family ALIASES, never dated release
 *   IDs. A dated model id/name in a durable instruction surface is drift: when a
 *   newer model ships, that surface silently points at the old one.
 *
 * This check scans DURABLE INSTRUCTION surfaces (grader prompts, audit runner
 * prompt templates, audit policy docs) for dated model identifiers and fails when
 * it finds one outside the allowed homes.
 *
 * ALLOWED homes for a dated version string (NOT scanned / explicitly permitted):
 *   - the model registry itself (lib/audit-shared/model-provider.js + workspace mirror)
 *   - this check script
 *   - CHANGELOG / history / ADR / receipts / archived / research surfaces
 *     (those record PAST state and stay accurate by NOT being rewritten)
 *
 * Usage:
 *   node scripts/check-no-restated-model-versions.js            # report (exit 0)
 *   node scripts/check-no-restated-model-versions.js --strict   # fail on hits (exit 1)
 *   node scripts/check-no-restated-model-versions.js --json
 *
 * Run from the skill-graph repo root. Consumed by `npm run models:check`.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

// Dated model identifiers. Roles/bare aliases (opus, sonnet, codex-current,
// strongest-reasoning-grader) are intentionally NOT matched.
const DATED_MODEL_PATTERNS = [
  /\bclaude-opus-4-\d+\b/i,
  /\bclaude-sonnet-4-\d+\b/i,
  /\bclaude-haiku-4-\d+\b/i,
  /\bOpus\s4\.\d+\b/i,
  /\bSonnet\s4\.\d+\b/i,
  /\bHaiku\s4\.\d+\b/i,
  /\bgpt-5\.\d+\b/i,
  /\bGPT-5\.\d+\b/,
  /\bgemini-3[.-][\w.-]*preview\b/i,
];

// Durable instruction surfaces to scan (globs relative to REPO_ROOT). These are
// files an agent READS AS INSTRUCTIONS at runtime — drift here changes behavior.
const SCAN_DIRS = [
  'prompts',                 // audit runner prompt templates
  'lib/audit/graders',       // grader prompts
];

// Explicit allow-list: substrings of a path that may carry dated versions.
const ALLOW_PATH_SUBSTR = [
  'model-provider.js',                       // the registry (the one allowed home)
  'check-no-restated-model-versions.js',     // this file
  'CHANGELOG', 'changelog',
  '/adr/',
  '/research/', 'receipt', 'history', 'eval-history',
];

function listFiles(dir) {
  const abs = path.join(REPO_ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    const full = path.join(abs, entry.name);
    if (entry.isDirectory()) {
      out.push(...listFiles(path.join(dir, entry.name)));
    } else if (/\.(md|js|json|txt)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function isAllowed(filePath) {
  return ALLOW_PATH_SUBSTR.some((s) => filePath.includes(s));
}

// A line that records PAST state (an incident, a dated run, a numbered cite) is
// an honest historical receipt even inside a durable file — skip it. Authors may
// also add an explicit `model-id-ok` marker to opt a line out.
const HISTORICAL_LINE = /incident|\b20\d\d-\d\d\b|§\s*Q?\d|over-applied|automation run|runner-drift|two-channel|merge-ledger|model-id-ok/i;

function isHistoricalLine(line) {
  return HISTORICAL_LINE.test(line);
}

function scan() {
  const findings = [];
  const files = SCAN_DIRS.flatMap(listFiles).filter((f) => !isAllowed(f));
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (isHistoricalLine(line)) return;
      for (const pat of DATED_MODEL_PATTERNS) {
        const m = line.match(pat);
        if (m) {
          findings.push({
            file: path.relative(REPO_ROOT, file),
            line: i + 1,
            match: m[0],
            text: line.trim().slice(0, 120),
          });
          break;
        }
      }
    });
  }
  return findings;
}

function main() {
  const args = process.argv.slice(2);
  const strict = args.includes('--strict');
  const json = args.includes('--json');
  const findings = scan();

  if (json) {
    console.log(JSON.stringify({ findings, count: findings.length }, null, 2));
  } else if (findings.length === 0) {
    console.log('✓ No restated dated model versions in durable instruction surfaces.');
  } else {
    console.log(`Found ${findings.length} restated dated model version(s) in durable surfaces:`);
    console.log('(Use a ROLE or family ALIAS instead — see AGENTS.md § Model Identity Discipline.)\n');
    for (const f of findings) {
      console.log(`  ${f.file}:${f.line}  [${f.match}]  ${f.text}`);
    }
  }

  if (findings.length > 0 && strict) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scan, DATED_MODEL_PATTERNS };
