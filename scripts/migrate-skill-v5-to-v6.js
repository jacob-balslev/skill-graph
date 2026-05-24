#!/usr/bin/env node
/**
 * Skill Graph codemod: schema_version 5 -> 6.
 *
 * Transforms a SKILL.md file, a skill directory, or a directory of skills from
 * the v5 frontmatter shape to v6.
 *
 * Transformations:
 *
 *   1. schema_version: "5" | 5         -> schema_version: 6
 *   2. metadata.concept.{mental_model,
 *      purpose, boundary, analogy,
 *      misconception}                  -> flat top-level fields under metadata:
 *      (only when nested sub-field is NOT pipe-empty; v6 retires `taxonomy`)
 *   3. concept block retained for v5 back-compat (v6 schema anyOf rule)
 *   4. Body `## Concept Card` section retention: this codemod does NOT touch
 *      body content. Body section is retired in v6 but removal is out of
 *      scope here — handle separately if needed.
 *
 * What this codemod does NOT do:
 *   - Does not author flat fields when nested sub-field is pipe-empty ("|") or
 *     missing. The comprehension grader surfaces the gap; hand-authoring
 *     produces better content than null-promotion.
 *   - Does not lift `definition` (covered by `description`) or `taxonomy`
 *     (covered by `category` + `relations.broader`). Both are retired in v6.
 *   - Does not delete the nested concept block. The v6 schema retains it via
 *     anyOf for v5 back-compat; the migration doc explains the deprecation.
 *   - Does not bump body content, headings, or `## Concept Card` sections.
 *
 * Line-based transformation: preserves comments, quoting style, and
 * indentation as authored. Only inserts flat fields and rewrites the
 * schema_version line.
 *
 * Usage:
 *   node scripts/migrate-skill-v5-to-v6.js <path>
 *   node scripts/migrate-skill-v5-to-v6.js skills/
 *   node scripts/migrate-skill-v5-to-v6.js --dry-run <path>          # default
 *   node scripts/migrate-skill-v5-to-v6.js --apply <path>
 *   node scripts/migrate-skill-v5-to-v6.js --skill ref-patterns
 *
 * Default mode is dry-run. Pass --apply to write changes.
 *
 * See: docs/migrations/v5-to-v6.md
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const V6_FIELDS = ['mental_model', 'purpose', 'boundary', 'analogy', 'misconception'];

function splitFrontmatter(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  if (lines[0] !== '---') return null;
  let closeIdx = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { closeIdx = i; break; }
  }
  if (closeIdx === -1) return null;
  return { lines, closeIdx };
}

// Find a line `<indent><field>:<rest>` within [start, end). Returns
// { index, indent, rest } or null. Matches indent ≤ 4 spaces (root or
// under `metadata:`).
function findFieldLine(lines, field, start, end) {
  const re = new RegExp(`^([ \\t]{0,4})${field}:[ \\t]*(.*)$`);
  for (let i = start; i < end; i++) {
    const m = lines[i].match(re);
    if (m) return { index: i, indent: m[1], rest: m[2] };
  }
  return null;
}

// Unwrap a YAML-quoted JSON-stringified string into a plain JSON string.
// Examples:
//   '"{\\"definition\\":\\"...\\"}"'   -> '{"definition":"..."}'
//   '{"definition":"..."}'              -> unchanged
function unwrapQuotedJson(raw) {
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  // Unescape YAML-escaped quotes and newlines.
  s = s.replace(/\\"/g, '"').replace(/\\n/g, '\n');
  return s;
}

function parseConceptValue(raw) {
  const s = unwrapQuotedJson(raw);
  if (!s.startsWith('{')) return null;
  try {
    return JSON.parse(s);
  } catch (e) {
    return { __parseError: e.message };
  }
}

function isPipeEmpty(v) {
  if (v === undefined || v === null) return true;
  const s = String(v).trim();
  return s === '' || s === '|' || s === '""' || s === "''";
}

// Format a string value as a YAML field. Single-line -> double-quoted with
// escaping. Multi-line -> block-scalar with `|` and proper indentation.
function formatFieldValue(indent, field, value) {
  const str = String(value);
  if (!str.includes('\n')) {
    // Single-line: double-quote with embedded-quote and backslash escape.
    const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return `${indent}${field}: "${escaped}"`;
  }
  // Multi-line: block-scalar (|) at +2 indent
  const childIndent = indent + '  ';
  const body = str.split('\n').map(line => `${childIndent}${line}`).join('\n');
  return `${indent}${field}: |\n${body}`;
}

function migrateFile(filePath) {
  const oldText = fs.readFileSync(filePath, 'utf8');
  const split = splitFrontmatter(oldText);
  if (!split) return { changed: false, newText: oldText, error: 'no frontmatter block found', stats: null };

  const lines = split.lines.slice();
  const fmStart = 1;
  const fmEnd = split.closeIdx; // exclusive

  const stats = {
    schemaBumped: false,
    fieldsLifted: [],
    fieldsSkippedPipeEmpty: [],
    fieldsSkippedAlreadyFlat: [],
    conceptFound: false,
    conceptParseError: null,
  };

  // 1. Bump schema_version "5" | 5 -> 6
  const schemaLine = findFieldLine(lines, 'schema_version', fmStart, fmEnd);
  if (schemaLine) {
    const val = schemaLine.rest.trim();
    if (val === '"5"' || val === "'5'" || val === '5') {
      lines[schemaLine.index] = `${schemaLine.indent}schema_version: 6`;
      stats.schemaBumped = true;
    }
  }

  // 2. Locate concept block (single-line JSON-stringified value at any indent ≤ 4).
  const conceptLine = findFieldLine(lines, 'concept', fmStart, fmEnd);
  if (!conceptLine) {
    // No concept block to migrate; bump-only file.
    return finalize();
  }
  stats.conceptFound = true;

  const concept = parseConceptValue(conceptLine.rest);
  if (!concept) {
    // concept: value isn't a JSON object — maybe it's already a YAML-block-scalar
    // shape (rare). Leave it untouched.
    return finalize();
  }
  if (concept.__parseError) {
    stats.conceptParseError = concept.__parseError;
    return finalize();
  }

  // 3. For each v6 field, lift to flat top-level (at same indent as concept:)
  //    when nested sub-field is non-empty AND no flat field already exists.
  const insertLines = [];
  for (const field of V6_FIELDS) {
    const existingFlat = findFieldLine(lines, field, fmStart, fmEnd);
    if (existingFlat) {
      stats.fieldsSkippedAlreadyFlat.push(field);
      continue;
    }
    const nestedVal = concept[field];
    if (isPipeEmpty(nestedVal)) {
      stats.fieldsSkippedPipeEmpty.push(field);
      continue;
    }
    insertLines.push(formatFieldValue(conceptLine.indent, field, nestedVal));
    stats.fieldsLifted.push(field);
  }

  if (insertLines.length > 0) {
    // Insert flat fields BEFORE the concept: line (so they read together,
    // flat first as canonical, nested second as v5 back-compat).
    lines.splice(conceptLine.index, 0, ...insertLines);
  }

  return finalize();

  function finalize() {
    const changed = stats.schemaBumped || stats.fieldsLifted.length > 0;
    return { changed, newText: lines.join('\n'), error: null, stats };
  }
}

function collectSkillFiles(targetPath, out = []) {
  if (!fs.existsSync(targetPath)) return out;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (path.basename(targetPath) === 'SKILL.md' || targetPath.endsWith('.md')) out.push(targetPath);
    return out;
  }
  const directSkill = path.join(targetPath, 'SKILL.md');
  if (fs.existsSync(directSkill)) out.push(directSkill);
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    if (entry.isDirectory()) collectSkillFiles(path.join(targetPath, entry.name), out);
  }
  return [...new Set(out)];
}

function parseArgs(argv) {
  // Default to dry-run; --apply opts into mutation.
  const args = { apply: false, skill: null, targets: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--apply') args.apply = true;
    else if (a === '--dry-run') args.apply = false;
    else if (a === '--skill') args.skill = argv[++i];
    else if (a === '--help' || a === '-h') {
      console.log('Usage: migrate-skill-v5-to-v6.js [--dry-run|--apply] [--skill <name>] [<path>...]');
      console.log('Default mode is dry-run. Default target is skills/.');
      process.exit(0);
    } else if (!a.startsWith('--')) args.targets.push(a);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  let targets = [];
  if (args.skill) {
    targets.push(path.resolve(REPO_ROOT, 'skills', args.skill, 'SKILL.md'));
  } else {
    const targetArgs = args.targets.length > 0 ? args.targets : ['skills'];
    for (const target of targetArgs) {
      targets.push(...collectSkillFiles(path.resolve(REPO_ROOT, target)));
    }
    targets = [...new Set(targets)];
  }

  let touched = 0;
  let bumpedOnly = 0;
  let liftedTotal = 0;
  let parseErrors = 0;
  let alreadyV6 = 0;
  let noConcept = 0;

  for (const filePath of targets) {
    const rel = path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
    const result = migrateFile(filePath);
    if (result.error) {
      console.error(`FAIL  ${rel}: ${result.error}`);
      continue;
    }
    const s = result.stats || {};
    if (s.conceptParseError) {
      console.error(`PARSE ${rel}: concept JSON unparseable — ${s.conceptParseError}`);
      parseErrors++;
      continue;
    }
    if (!result.changed) {
      if (!s.conceptFound) noConcept++;
      else alreadyV6++;
      continue;
    }
    touched++;
    if (s.fieldsLifted.length === 0 && s.schemaBumped) bumpedOnly++;
    liftedTotal += s.fieldsLifted.length;

    const detail = [
      s.schemaBumped ? 'schema:5→6' : null,
      s.fieldsLifted.length > 0 ? `lift:[${s.fieldsLifted.join(',')}]` : null,
      s.fieldsSkippedPipeEmpty.length > 0 ? `skip-empty:[${s.fieldsSkippedPipeEmpty.join(',')}]` : null,
      s.fieldsSkippedAlreadyFlat.length > 0 ? `skip-flat:[${s.fieldsSkippedAlreadyFlat.join(',')}]` : null,
    ].filter(Boolean).join(' ');

    if (args.apply) {
      fs.writeFileSync(filePath, result.newText, 'utf8');
      console.log(`OK    ${rel}  | ${detail}`);
    } else {
      console.log(`WOULD ${rel}  | ${detail}`);
    }
  }

  console.log('');
  console.log(`${args.apply ? 'Migrated' : 'Would migrate'} ${touched} file(s).`);
  console.log(`  bumped-only (no liftable fields): ${bumpedOnly}`);
  console.log(`  total v6 fields lifted:           ${liftedTotal}`);
  console.log(`  already v6 (no changes needed):   ${alreadyV6}`);
  console.log(`  no concept block (v6-shaped):     ${noConcept}`);
  console.log(`  concept JSON parse errors:        ${parseErrors}`);
  if (parseErrors > 0) process.exit(1);
}

if (require.main === module) main();

module.exports = { migrateFile, parseConceptValue, formatFieldValue };
