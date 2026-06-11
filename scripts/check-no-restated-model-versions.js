#!/usr/bin/env node
'use strict';

/**
 * check-no-restated-model-versions.js
 *
 * Enforces Model Identity Discipline (workspace AGENTS.md § "Model Identity
 * Discipline"; skill-graph AGENTS.md § "Skill Audit Loop Model Policy"):
 *
 *   Durable instruction surfaces name models EXPLICITLY by their real current
 *   product names (Opus 4.8, GPT-5.5, …) — there are NO invented role personas.
 *   The registry (lib/audit-shared/model-provider.js) is the single source of
 *   which name is current; when a newer model ships, the registry display pin is
 *   bumped in one place and this gate then flags any surface still naming the old
 *   model. So the failure this gate catches is a STALE/WRONG dated name, never the
 *   current canonical one.
 *
 * This check scans DURABLE INSTRUCTION surfaces (grader prompts, audit runner
 * prompt templates) for dated model identifiers and fails on any that is NOT one
 * of the registry's current canonical names.
 *
 * ALLOWED (NOT flagged):
 *   - any dated name that matches the registry's CURRENT model set (DISPLAY_NAMES
 *     values + registry alias keys/modelIds + MODEL_LATEST/OPENCODE_LATEST ids)
 *   - the registry itself + this check script
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
const {
  DISPLAY_NAMES,
  MODEL_REGISTRY,
  MODEL_LATEST,
  OPENCODE_LATEST,
} = require('../lib/audit-shared/model-provider');

const REPO_ROOT = path.resolve(__dirname, '..');

// The registry's CURRENT canonical model identifiers (lowercased). A dated name
// matching one of these is the model we WANT named explicitly, not drift — so it
// is allowed in durable surfaces. Anything else dated is a stale/wrong reference.
const CURRENT_MODEL_NAMES = new Set(
  [
    ...Object.values(DISPLAY_NAMES),
    ...Object.keys(MODEL_REGISTRY),
    ...Object.values(MODEL_REGISTRY).map((d) => d && d.modelId).filter(Boolean),
    ...Object.values(MODEL_LATEST),
    ...Object.values(OPENCODE_LATEST),
  ].map((s) => String(s).toLowerCase().trim()),
);

// Dated model identifiers. Bare aliases (opus, sonnet) are not dated and never
// match. A pattern hit is a FINDING only when the matched string is not in the
// registry's CURRENT_MODEL_NAMES set above (i.e. it names a stale/wrong version).
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
          // A current canonical model name is exactly what we want named explicitly.
          if (CURRENT_MODEL_NAMES.has(m[0].toLowerCase().trim())) break;
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
    console.log(`Found ${findings.length} STALE/WRONG dated model version(s) in durable surfaces:`);
    console.log('(Name the registry\'s CURRENT model — bump the display pin in model-provider.js if a newer model shipped. See AGENTS.md § Model Identity Discipline.)\n');
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
