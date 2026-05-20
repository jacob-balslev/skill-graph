#!/usr/bin/env node
/**
 * Skill Graph overlap detector.
 *
 * Detects collisions across the three activation surfaces that a router
 * consults to decide which skill claims an inbound request:
 *
 *   1. triggers — exact label match. A duplicate is a routing ambiguity
 *      the router cannot resolve (no semantic fallback for identical
 *      labels). Duplicates are hard errors.
 *
 *   2. keywords — semantic match. Some overlap is natural (e.g. both an
 *      a11y skill and a testing-strategy skill might reference "keyboard").
 *      Excessive overlap is a signal that activation will mis-fire;
 *      emitted as warnings for author review.
 *
 *   3. paths — glob match. Two skills claiming the same file surface
 *      will both activate when that surface is touched. Exact-string
 *      glob duplicates are flagged as warnings; partial-overlap
 *      (e.g. `src/**` vs `src/auth/**`) is out of scope for a
 *      dependency-free implementation.
 *
 * Complementary to skill-lint.js, which validates per-skill correctness.
 * This script validates cross-skill routing hygiene.
 *
 * Self-contained. Only uses Node built-ins — no external dependencies.
 * Exit 0 on success (no errors), 1 on any trigger/keyword/path error.
 * With --strict, warnings are promoted to errors.
 *
 * Usage:
 *   node scripts/skill-overlap.js
 *   node scripts/skill-overlap.js --include-template   # also scan skill-metadata-template.md
 *   node scripts/skill-overlap.js --strict             # warnings become errors
 *   node scripts/skill-overlap.js --json               # machine-readable output
 *   node scripts/skill-overlap.js --no-color           # plain CI output
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter, normalizeFrontmatter } = require('./lib/parse-frontmatter');
const { collectSkillFilesFromRoots, loadWorkspaceConfig, resolveSkillRoots, workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const TEMPLATE_PATH = path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md');
const WORKSPACE_CONFIG = loadWorkspaceConfig(REPO_ROOT, msg => process.stderr.write(`WARN ${msg}\n`));
const SKILL_ROOTS = resolveSkillRoots(REPO_ROOT, WORKSPACE_CONFIG);

// ANSI color helpers — matched to scripts/lint/format-code-frame.js palette.
const C = {
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  green:  '\x1b[32m',
  dim:    '\x1b[2m',
  bold:   '\x1b[1m',
  reset:  '\x1b[0m',
};
function paint(s, color, enabled) {
  return enabled ? color + s + C.reset : s;
}

// ---------------------------------------------------------------------------
// Skill loading
// ---------------------------------------------------------------------------

function loadSkills(includeTemplate) {
  const skills = [];
  for (const source of collectSkillFilesFromRoots(SKILL_ROOTS)) {
    const text = fs.readFileSync(source.filePath, 'utf8');
    const fm = normalizeFrontmatter(parseFrontmatter(text));
    if (fm && fm.name) skills.push({ file: source.filePath, fm });
  }
  if (includeTemplate && fs.existsSync(TEMPLATE_PATH)) {
    const text = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    const fm = normalizeFrontmatter(parseFrontmatter(text));
    if (fm && fm.name) skills.push({ file: TEMPLATE_PATH, fm });
  }
  return skills;
}

// ---------------------------------------------------------------------------
// Overlap detection helpers
// ---------------------------------------------------------------------------

/**
 * Build a map of value → [skill-name, ...] for a given frontmatter array field.
 * Case-insensitive (activation surfaces are case-insensitive in practice).
 * Returns only entries that appear in 2+ skills.
 */
function detectDuplicates(skills, field) {
  const map = new Map();
  for (const { fm } of skills) {
    const list = Array.isArray(fm[field]) ? fm[field] : [];
    for (const raw of list) {
      if (typeof raw !== 'string') continue;
      const key = raw.trim().toLowerCase();
      if (!key) continue;
      if (!map.has(key)) map.set(key, { value: raw, owners: [] });
      // Avoid double-listing a skill that has the same value twice in its own array.
      const entry = map.get(key);
      if (!entry.owners.includes(fm.name)) entry.owners.push(fm.name);
    }
  }
  const dups = [];
  for (const [, entry] of map) {
    if (entry.owners.length >= 2) dups.push(entry);
  }
  return dups.sort((a, b) => a.value.localeCompare(b.value));
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function formatDuplicateLine(kind, entry, useColor) {
  const label = paint(kind, C.bold, useColor);
  const value = paint(JSON.stringify(entry.value), C.yellow, useColor);
  const owners = entry.owners.map(o => paint(o, C.dim, useColor)).join(', ');
  return `  ${label} ${value}  —  in: ${owners}`;
}

function printReport({ triggerDups, keywordDups, pathDups, strict, useColor }) {
  // Triggers — always error.
  if (triggerDups.length === 0) {
    console.log(paint('OK   ', C.green, useColor) + '[triggers]   no duplicate trigger labels');
  } else {
    console.error(paint('FAIL ', C.red, useColor) + `[triggers]   ${triggerDups.length} duplicate label(s)`);
    for (const d of triggerDups) console.error(formatDuplicateLine('trigger', d, useColor));
  }

  // Keywords — warning (or error in --strict).
  if (keywordDups.length === 0) {
    console.log(paint('OK   ', C.green, useColor) + '[keywords]   no duplicate keyword entries');
  } else {
    const level = strict ? 'FAIL ' : 'WARN ';
    const levelColor = strict ? C.red : C.yellow;
    const stream = strict ? console.error : console.log;
    stream.call(console, paint(level, levelColor, useColor) + `[keywords]   ${keywordDups.length} duplicate keyword(s)`);
    for (const d of keywordDups) stream.call(console, formatDuplicateLine('keyword', d, useColor));
  }

  // Paths — warning (or error in --strict).
  if (pathDups.length === 0) {
    console.log(paint('OK   ', C.green, useColor) + '[paths]      no duplicate path globs');
  } else {
    const level = strict ? 'FAIL ' : 'WARN ';
    const levelColor = strict ? C.red : C.yellow;
    const stream = strict ? console.error : console.log;
    stream.call(console, paint(level, levelColor, useColor) + `[paths]      ${pathDups.length} duplicate glob(s)`);
    for (const d of pathDups) stream.call(console, formatDuplicateLine('path', d, useColor));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const argv = process.argv.slice(2);
  const strict = argv.includes('--strict');
  const includeTemplate = argv.includes('--include-template');
  const jsonOut = argv.includes('--json');
  const noColor = argv.includes('--no-color');
  const useColor = !noColor && process.stdout.isTTY;

  const skills = loadSkills(includeTemplate);
  if (skills.length === 0) {
    console.error('No skills found to analyze.');
    process.exit(1);
  }

  const triggerDups = detectDuplicates(skills, 'triggers');
  const keywordDups = detectDuplicates(skills, 'keywords');
  const pathDups    = detectDuplicates(skills, 'paths');

  const triggerErrors = triggerDups.length;
  const warnCount     = keywordDups.length + pathDups.length;
  const totalErrors   = triggerErrors + (strict ? warnCount : 0);

  if (jsonOut) {
    const payload = {
      skills_scanned: skills.length,
      triggers: triggerDups,
      keywords: keywordDups,
      paths:    pathDups,
      summary:  {
        errors:   triggerErrors,
        warnings: strict ? 0 : warnCount,
        strict,
      },
    };
    process.stdout.write(JSON.stringify(payload, null, 2) + '\n');
    process.exit(totalErrors > 0 ? 1 : 0);
  }

  printReport({ triggerDups, keywordDups, pathDups, strict, useColor });

  const tail = strict && warnCount > 0
    ? ` (--strict: ${warnCount} warning(s) promoted to errors)`
    : warnCount > 0
      ? `, ${warnCount} warning(s)`
      : '';
  console.log(`\n${skills.length} skill(s) analyzed, ${totalErrors} error(s)${tail}.`);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
