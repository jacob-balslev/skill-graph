#!/usr/bin/env node
/**
 * Skill Graph codemod: schema_version 6 -> 7.
 *
 * Transforms a SKILL.md file, a skill directory, or a directory of skills from
 * the v6 frontmatter shape to v7.
 *
 * v6 → v7 transformation:
 *
 *   1. schema_version: "6" | 6              -> schema_version: 7
 *
 *   2. audit_verdict: <value>               -> REMOVED
 *      (replaced by four discrete verdicts below)
 *
 *   3. ADD four new Health Block fields, inserted in place of the removed
 *      audit_verdict line (or after last_changed if audit_verdict is absent):
 *        structural_verdict     # PASS | PASS_WITH_FIXES | FAIL | UNVERIFIED
 *        truth_verdict          # PASS | DRIFT | BROKEN | UNVERIFIED
 *        comprehension_verdict  # PASS | SHALLOW | REDUNDANT | UNVERIFIED |
 *                                 SKIPPED_BASELINE_HIGH | NA
 *        application_verdict    # APPLICABLE | REDUNDANT | HARMFUL | MIXED |
 *                                 FALSE_POSITIVE | UNVERIFIED
 *
 * Forward mapping (conservative — preserves signal from per-script fields):
 *
 *   structural_verdict:
 *     - lint_verdict: PASS                  -> PASS
 *     - lint_verdict: FAIL                  -> FAIL
 *     - else, audit_verdict: PASS           -> PASS
 *     - audit_verdict: PASS_WITH_FIXES      -> PASS_WITH_FIXES
 *     - audit_verdict: PARTIAL              -> PASS_WITH_FIXES (closest v7 match)
 *     - audit_verdict: FAIL                 -> FAIL
 *     - else                                -> UNVERIFIED
 *
 *   truth_verdict:
 *     - drift_status: OK                    -> PASS
 *     - drift_status: DRIFT                 -> DRIFT
 *     - drift_status: BROKEN                -> BROKEN
 *     - else (STALE / NO_BASELINE /
 *       EXTERNAL_UNHASHED / UNKNOWN /
 *       missing)                            -> UNVERIFIED
 *
 *   comprehension_verdict:                  -> UNVERIFIED (honest default —
 *                                            gate 8 will populate on next
 *                                            audit run; see ADR 0011)
 *
 *   application_verdict:                    -> UNVERIFIED (no skill has been
 *                                            audited via gate 9; this is the
 *                                            honest state per SYNTHESIS §1)
 *
 * Reverse mapping (v7 -> v6 for rollback):
 *
 *   audit_verdict:
 *     - structural FAIL OR truth BROKEN     -> FAIL
 *     - structural PASS_WITH_FIXES OR
 *       truth DRIFT                         -> PASS_WITH_FIXES
 *     - structural PASS AND truth PASS      -> PASS
 *     - all UNVERIFIED                      -> UNKNOWN
 *     - mixed (some PASS, some UNVERIFIED)  -> PARTIAL
 *
 *   schema_version: 7 -> 6
 *   structural_verdict / truth_verdict /
 *     comprehension_verdict /
 *     application_verdict                   -> REMOVED
 *
 * Reverse is for ROLLBACK and ROUND-TRIP TESTING. It is lossy by construction:
 * the four v7 verdicts collapse into one v6 verdict, so comprehension and
 * application signals are discarded. The reverse output validates against the
 * v6 schema but is not byte-identical to the pre-forward state.
 *
 * Usage:
 *   node scripts/migrate-skill-v6-to-v7.js <path>
 *   node scripts/migrate-skill-v6-to-v7.js skills/
 *   node scripts/migrate-skill-v6-to-v7.js --dry-run <path>          # default
 *   node scripts/migrate-skill-v6-to-v7.js --apply <path>
 *   node scripts/migrate-skill-v6-to-v7.js --skill cognitive-load-theory
 *   node scripts/migrate-skill-v6-to-v7.js --reverse <path>          # v7 -> v6
 *   node scripts/migrate-skill-v6-to-v7.js --reverse --apply <path>
 *
 * Default mode is dry-run. Pass --apply to write changes.
 *
 * See: docs/migrations/v6-to-v7.md
 * See: docs/adr/0011-split-audit-verdict-into-four-verdicts.md
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();

const V7_VERDICT_FIELDS = [
  'structural_verdict',
  'truth_verdict',
  'comprehension_verdict',
  'application_verdict',
];

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

// Strip surrounding quotes from a YAML value: "PASS" -> PASS, 'PASS' -> PASS.
function unquote(raw) {
  const s = String(raw).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function readField(lines, field, start, end) {
  const found = findFieldLine(lines, field, start, end);
  if (!found) return null;
  return unquote(found.rest);
}

// Forward roll-up: derive structural_verdict from audit_verdict + lint_verdict.
function deriveStructuralVerdict({ auditVerdict, lintVerdict }) {
  if (lintVerdict === 'PASS') return 'PASS';
  if (lintVerdict === 'FAIL') return 'FAIL';
  // lint_verdict UNKNOWN or missing -> fall back to audit_verdict
  if (auditVerdict === 'PASS') return 'PASS';
  if (auditVerdict === 'PASS_WITH_FIXES') return 'PASS_WITH_FIXES';
  if (auditVerdict === 'PARTIAL') return 'PASS_WITH_FIXES';
  if (auditVerdict === 'FAIL') return 'FAIL';
  return 'UNVERIFIED';
}

// Forward roll-up: derive truth_verdict from drift_status.
function deriveTruthVerdict({ driftStatus }) {
  if (driftStatus === 'OK') return 'PASS';
  if (driftStatus === 'DRIFT') return 'DRIFT';
  if (driftStatus === 'BROKEN') return 'BROKEN';
  // STALE / NO_BASELINE / EXTERNAL_UNHASHED / UNKNOWN / missing
  return 'UNVERIFIED';
}

// Reverse roll-down: derive audit_verdict from the four v7 verdicts.
function deriveAuditVerdict({ structural, truth, comprehension, application }) {
  if (structural === 'FAIL' || truth === 'BROKEN') return 'FAIL';
  if (structural === 'PASS_WITH_FIXES' || truth === 'DRIFT') return 'PASS_WITH_FIXES';
  if (structural === 'PASS' && truth === 'PASS') return 'PASS';
  // All UNVERIFIED -> UNKNOWN; mixed -> PARTIAL.
  const allFour = [structural, truth, comprehension, application];
  if (allFour.every((v) => v === 'UNVERIFIED' || v === 'NA')) return 'UNKNOWN';
  return 'PARTIAL';
}

function migrateForward(filePath) {
  const oldText = fs.readFileSync(filePath, 'utf8');
  const split = splitFrontmatter(oldText);
  if (!split) return { changed: false, newText: oldText, error: 'no frontmatter block found', stats: null };

  const lines = split.lines.slice();
  const fmStart = 1;
  let fmEnd = split.closeIdx; // exclusive

  const stats = {
    schemaBumped: false,
    schemaAdded: false,
    auditVerdictRemoved: false,
    verdictsAdded: false,
    derived: null,
    alreadyV7: false,
  };

  // Quick check: is this already v7?
  let schemaLine = findFieldLine(lines, 'schema_version', fmStart, fmEnd);
  if (schemaLine) {
    const val = unquote(schemaLine.rest);
    if (val === '7') {
      stats.alreadyV7 = true;
      return finalize();
    }
    if (val === '6' || val === '"6"' || val === "'6'") {
      lines[schemaLine.index] = `${schemaLine.indent}schema_version: 7`;
      stats.schemaBumped = true;
    }
  } else {
    // No schema_version line at all — the flat-layout authoring corpus today
    // omits this field on the majority of skills. v7 makes it explicit. Insert
    // `schema_version: 7` immediately after the opening `---` so it leads the
    // frontmatter, matching the canonical authoring shape.
    lines.splice(fmStart, 0, 'schema_version: 7');
    fmEnd += 1;
    stats.schemaAdded = true;
    // Refresh schemaLine so downstream insertion-anchor logic works.
    schemaLine = findFieldLine(lines, 'schema_version', fmStart, fmEnd);
  }

  // Read inputs for the roll-up (before mutating the line array).
  const auditVerdict = readField(lines, 'audit_verdict', fmStart, fmEnd) || null;
  const lintVerdict = readField(lines, 'lint_verdict', fmStart, fmEnd) || null;
  const driftStatus = readField(lines, 'drift_status', fmStart, fmEnd) || null;

  const derived = {
    structural_verdict: deriveStructuralVerdict({ auditVerdict, lintVerdict }),
    truth_verdict: deriveTruthVerdict({ driftStatus }),
    comprehension_verdict: 'UNVERIFIED',
    application_verdict: 'UNVERIFIED',
  };
  stats.derived = derived;

  // Skip insertion if all four verdicts are already present (idempotency).
  const existingVerdicts = V7_VERDICT_FIELDS.filter((f) => findFieldLine(lines, f, fmStart, fmEnd) !== null);
  if (existingVerdicts.length === V7_VERDICT_FIELDS.length) {
    // Already migrated structurally — just bump schema if needed.
    return finalize();
  }

  // Locate the audit_verdict line for replacement, or the insertion anchor.
  const auditLine = findFieldLine(lines, 'audit_verdict', fmStart, fmEnd);
  let insertIndex;
  let indent = '';

  if (auditLine) {
    insertIndex = auditLine.index;
    indent = auditLine.indent;
    lines.splice(auditLine.index, 1);
    stats.auditVerdictRemoved = true;
    // fmEnd shrinks by 1 because we removed a line.
    fmEnd -= 1;
  } else {
    // No audit_verdict line — insert after last_changed if present, else
    // after last_audited, else just before the closing ---.
    const anchor =
      findFieldLine(lines, 'last_changed', fmStart, fmEnd)
      || findFieldLine(lines, 'last_audited', fmStart, fmEnd);
    if (anchor) {
      insertIndex = anchor.index + 1;
      indent = anchor.indent;
    } else {
      // No Health Block anchor at all — insert just before the closing `---`.
      insertIndex = fmEnd;
      // Use the same indent as schema_version, or empty.
      indent = schemaLine ? schemaLine.indent : '';
    }
  }

  // Build the four verdict lines, skipping any that already exist.
  const linesToInsert = [];
  for (const field of V7_VERDICT_FIELDS) {
    if (findFieldLine(lines, field, fmStart, fmEnd) !== null) continue;
    linesToInsert.push(`${indent}${field}: ${derived[field]}`);
  }
  if (linesToInsert.length > 0) {
    lines.splice(insertIndex, 0, ...linesToInsert);
    stats.verdictsAdded = true;
  }

  return finalize();

  function finalize() {
    const changed = stats.schemaBumped || stats.schemaAdded || stats.auditVerdictRemoved || stats.verdictsAdded;
    return { changed, newText: lines.join('\n'), error: null, stats };
  }
}

function migrateReverse(filePath) {
  const oldText = fs.readFileSync(filePath, 'utf8');
  const split = splitFrontmatter(oldText);
  if (!split) return { changed: false, newText: oldText, error: 'no frontmatter block found', stats: null };

  const lines = split.lines.slice();
  const fmStart = 1;
  let fmEnd = split.closeIdx;

  const stats = {
    schemaDropped: false,
    verdictsRemoved: 0,
    auditVerdictAdded: false,
    derivedAuditVerdict: null,
  };

  // 1. Read the four v7 verdicts for the roll-down.
  const structural = readField(lines, 'structural_verdict', fmStart, fmEnd) || 'UNVERIFIED';
  const truth = readField(lines, 'truth_verdict', fmStart, fmEnd) || 'UNVERIFIED';
  const comprehension = readField(lines, 'comprehension_verdict', fmStart, fmEnd) || 'UNVERIFIED';
  const application = readField(lines, 'application_verdict', fmStart, fmEnd) || 'UNVERIFIED';

  // 2. Drop schema_version 7 -> 6.
  const schemaLine = findFieldLine(lines, 'schema_version', fmStart, fmEnd);
  if (schemaLine && unquote(schemaLine.rest) === '7') {
    lines[schemaLine.index] = `${schemaLine.indent}schema_version: 6`;
    stats.schemaDropped = true;
  }

  // 3. Remove the four v7 verdict lines (track the first removal index for
  //    audit_verdict insertion).
  let firstRemovedIndex = -1;
  let firstRemovedIndent = '';
  for (const field of V7_VERDICT_FIELDS) {
    const found = findFieldLine(lines, field, fmStart, fmEnd);
    if (found) {
      if (firstRemovedIndex === -1) {
        firstRemovedIndex = found.index;
        firstRemovedIndent = found.indent;
      }
      lines.splice(found.index, 1);
      fmEnd -= 1;
      stats.verdictsRemoved += 1;
    }
  }

  // 4. Insert audit_verdict (skip if already present — idempotency).
  if (findFieldLine(lines, 'audit_verdict', fmStart, fmEnd) === null) {
    const derived = deriveAuditVerdict({ structural, truth, comprehension, application });
    stats.derivedAuditVerdict = derived;
    const insertIndex = firstRemovedIndex !== -1 ? firstRemovedIndex : fmEnd;
    const indent = firstRemovedIndent || (schemaLine ? schemaLine.indent : '');
    lines.splice(insertIndex, 0, `${indent}audit_verdict: ${derived}`);
    stats.auditVerdictAdded = true;
  }

  const changed = stats.schemaDropped || stats.verdictsRemoved > 0 || stats.auditVerdictAdded;
  return { changed, newText: lines.join('\n'), error: null, stats };
}

// Paths to skip during recursive collection.
//
// Per the 2026-05-19 layout-canonicalisation decision (see ADR 0011 §Open
// questions and the SYNTHESIS roundtable): the **categorized layout** at
// `skills/skills/<category>/<name>/SKILL.md` (145 skills, Anthropic Agent
// Skills shape with nested `metadata:` block) is the canonical authoring
// source. The **flat layout** at `skills/<name>/SKILL.md` (284 entries, legacy
// Skill Graph Protocol shape) is treated as legacy bloat pending the cleanup
// directive — the migrator skips it so we do not pollute legacy frontmatter
// with v7 fields while the cleanup decision is still pending.
//
// To migrate the flat layout in a future commit, pass `--include-flat` (see
// CLI parsing below) or remove the flat-layout entry from this list.
const SKIP_PATH_FRAGMENTS = [
  // skill-graph repo's own marketplace staging surface (always skip).
  path.sep + 'marketplace' + path.sep + 'skills' + path.sep,
];

// Flat-layout detection: a SKILL.md at depth 2 directly under a `skills/`
// directory (no intermediate `skills/skills/` segment, no `_archived/` etc.).
// We use this as a positive flat-layout test so that
// `--include-flat` can be added later without changing SKIP_PATH_FRAGMENTS.
function isFlatLayoutSkill(p) {
  // Match `/skills/<name>/SKILL.md` but NOT `/skills/skills/<cat>/<name>/SKILL.md`.
  // Also exclude `/skills/_archived/...` and `/skills/_meta/...` from the flat-layout
  // category — those have their own lifecycle handling.
  const sep = path.sep;
  const flatPattern = new RegExp(
    `${sep.replace(/\\/g, '\\\\')}skills${sep.replace(/\\/g, '\\\\')}[^${sep.replace(/\\/g, '\\\\')}_][^${sep.replace(/\\/g, '\\\\')}]*${sep.replace(/\\/g, '\\\\')}SKILL\\.md$`,
  );
  return flatPattern.test(p) && !p.includes(`${sep}skills${sep}skills${sep}`);
}

function shouldSkipPath(p, opts = {}) {
  if (SKIP_PATH_FRAGMENTS.some((frag) => p.includes(frag))) return true;
  // Skip flat-layout skills by default (pending cleanup). The CLI's
  // --include-flat flag clears this skip when an operator explicitly asks
  // for the legacy layout to be migrated.
  if (!opts.includeFlat && isFlatLayoutSkill(p)) return true;
  return false;
}

function collectSkillFiles(targetPath, out = [], opts = {}) {
  if (!fs.existsSync(targetPath)) return out;
  if (shouldSkipPath(targetPath + path.sep, opts)) return out;
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    if (path.basename(targetPath) === 'SKILL.md' && !shouldSkipPath(targetPath, opts)) {
      out.push(targetPath);
    }
    return out;
  }
  const directSkill = path.join(targetPath, 'SKILL.md');
  if (fs.existsSync(directSkill) && !shouldSkipPath(directSkill, opts)) out.push(directSkill);
  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    if (entry.isDirectory()) collectSkillFiles(path.join(targetPath, entry.name), out, opts);
  }
  return [...new Set(out)];
}

function parseArgs(argv) {
  const args = { apply: false, reverse: false, skill: null, includeFlat: false, targets: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--apply') args.apply = true;
    else if (a === '--dry-run') args.apply = false;
    else if (a === '--reverse') args.reverse = true;
    else if (a === '--skill') args.skill = argv[++i];
    else if (a === '--include-flat') args.includeFlat = true;
    else if (a === '--help' || a === '-h') {
      console.log('Usage: migrate-skill-v6-to-v7.js [--dry-run|--apply] [--reverse] [--include-flat] [--skill <name>] [<path>...]');
      console.log('Default mode is dry-run. Default target is the canonical skills/ workspace.');
      console.log('Default target layout: categorized (skills/skills/<category>/<name>/SKILL.md).');
      console.log('--include-flat also migrates the legacy flat layout (skills/<name>/SKILL.md).');
      console.log('--reverse downgrades v7 -> v6 (lossy: comprehension and application verdicts are discarded).');
      process.exit(0);
    } else if (!a.startsWith('--')) args.targets.push(a);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  let targets = [];
  const opts = { includeFlat: args.includeFlat };
  if (args.skill) {
    // For --skill, try the categorized layout first (the default canonical
    // source); fall back to flat layout if --include-flat is set.
    const categorizedGlobRoots = [
      path.resolve(REPO_ROOT, 'skills', 'skills'),
    ];
    let resolved = null;
    for (const root of categorizedGlobRoots) {
      if (!fs.existsSync(root)) continue;
      // Walk subdirectories looking for skills/skills/<category>/<name>/SKILL.md.
      for (const cat of fs.readdirSync(root, { withFileTypes: true })) {
        if (!cat.isDirectory()) continue;
        const candidate = path.join(root, cat.name, args.skill, 'SKILL.md');
        if (fs.existsSync(candidate)) {
          resolved = candidate;
          break;
        }
      }
      if (resolved) break;
    }
    if (!resolved && args.includeFlat) {
      const flat = path.resolve(REPO_ROOT, 'skills', args.skill, 'SKILL.md');
      if (fs.existsSync(flat)) resolved = flat;
    }
    if (resolved) targets.push(resolved);
  } else {
    const targetArgs = args.targets.length > 0 ? args.targets : ['skills'];
    for (const target of targetArgs) {
      const resolved = path.isAbsolute(target) ? target : path.resolve(REPO_ROOT, target);
      targets.push(...collectSkillFiles(resolved, [], opts));
    }
    targets = [...new Set(targets)];
  }

  let touched = 0;
  let unchanged = 0;
  let already = 0;
  const migrate = args.reverse ? migrateReverse : migrateForward;
  const direction = args.reverse ? 'v7→v6' : 'v6→v7';

  for (const filePath of targets) {
    const rel = path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
    const result = migrate(filePath);
    if (result.error) {
      console.error(`FAIL  ${rel}: ${result.error}`);
      continue;
    }
    const s = result.stats || {};
    if (!result.changed) {
      if (s.alreadyV7) already++;
      else unchanged++;
      continue;
    }
    touched++;

    const detailParts = [];
    if (args.reverse) {
      if (s.schemaDropped) detailParts.push('schema:7→6');
      if (s.verdictsRemoved) detailParts.push(`removed-verdicts:${s.verdictsRemoved}`);
      if (s.auditVerdictAdded) detailParts.push(`audit_verdict:${s.derivedAuditVerdict}`);
    } else {
      if (s.schemaBumped) detailParts.push('schema:6→7');
      if (s.schemaAdded) detailParts.push('schema:added→7');
      if (s.auditVerdictRemoved) detailParts.push('removed:audit_verdict');
      if (s.verdictsAdded && s.derived) {
        detailParts.push(`structural:${s.derived.structural_verdict}`);
        detailParts.push(`truth:${s.derived.truth_verdict}`);
        detailParts.push(`comprehension:${s.derived.comprehension_verdict}`);
        detailParts.push(`application:${s.derived.application_verdict}`);
      }
    }
    const detail = detailParts.join(' ');

    if (args.apply) {
      fs.writeFileSync(filePath, result.newText, 'utf8');
      console.log(`OK    ${rel}  | ${detail}`);
    } else {
      console.log(`WOULD ${rel}  | ${detail}`);
    }
  }

  console.log('');
  console.log(`${args.apply ? 'Migrated' : 'Would migrate'} ${touched} file(s) ${direction}.`);
  console.log(`  already at target schema: ${already}`);
  console.log(`  unchanged (no frontmatter or no schema_version): ${unchanged}`);
}

if (require.main === module) main();

module.exports = {
  migrateForward,
  migrateReverse,
  deriveStructuralVerdict,
  deriveTruthVerdict,
  deriveAuditVerdict,
  V7_VERDICT_FIELDS,
};
