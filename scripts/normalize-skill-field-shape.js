#!/usr/bin/env node
/**
 * normalize-skill-field-shape — deterministic v8+ field-SHAPE migrator (Decision B).
 *
 * The honest split this tool encodes (per the 2026-05-30 end-to-end plan §
 * Decision B + GPT-5.4's caveats):
 *
 *   MECHANICAL fields  → this codemod fills them (a single honest default exists).
 *   SEMANTIC fields    → reserved for agent authoring via /audit:*. This tool NEVER
 *                        invents them (no derived `deployment_target`, no PRD `scope`,
 *                        no Understanding-field prose) — that is the failure mode
 *                        GPT-5.4 warned about ("the codemod silently becomes a
 *                        semantic author").
 *
 * It is VERSION-AGNOSTIC by design: it reads the CURRENT schema's `required` set,
 * so it is NOT a per-version `migrate-vN-to-vM.js` codemod (which `AGENTS.md §
 * Major Version Is a Clean Cut` bans as standing tooling). It is a reusable shape
 * NORMALIZER that targets whatever the live contract requires, and it survives
 * future schema bumps without edits. See the clean-cut § carve-out citing Decision B.
 *
 * It NEVER bumps `schema_version`. The version label is EARNED, not bumped
 * (`.claude/rules/version-schema-contract.md`): the integer advances only when the
 * semantic content is authored, which happens through `/audit:*`, not here. A skill
 * this tool touches keeps its current `schema_version` and — when semantic debt
 * remains — carries an EXPLICIT `# semantic-debt:` marker comment, so a
 * shape-migrated-but-semantically-incomplete skill never gets false "latest-schema"
 * legitimacy.
 *
 * Modes:
 *   --report  (default, READ-ONLY): per-skill mechanical gaps it CAN fill + semantic
 *             debt it CANNOT, plus schema-unknown (likely-retired) fields to review.
 *             The report IS the corpus debt ledger that drives /audit:* work. SYSTEM-safe.
 *   --apply   (WRITES SKILL.md = CONTENT): fills missing mechanical-default fields and
 *             injects the `# semantic-debt:` marker. Does NOT touch schema_version, the
 *             body, semantic fields, or schema-unknown fields. Run this through the
 *             audit loop (CONTENT), not from a SYSTEM commit.
 *
 * Usage:
 *   node scripts/normalize-skill-field-shape.js                 # report, whole corpus
 *   node scripts/normalize-skill-field-shape.js --skill okrs    # report, one skill
 *   node scripts/normalize-skill-field-shape.js --path <file>   # report, one file
 *   node scripts/normalize-skill-field-shape.js --json          # machine-readable report
 *   node scripts/normalize-skill-field-shape.js --apply --path <file>   # CONTENT write
 *
 * Self-contained. Node built-ins only. Exit 0 (report is a diagnostic, not a gate).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter, normalizeFrontmatter } = require('./lib/parse-frontmatter');
const { collectSkillFiles } = require('./lib/roots');

// ---------------------------------------------------------------------------
// Mechanical-default field map. A required field belongs here ONLY when a single
// honest default exists that does NOT assert anything untrue about the skill.
//   - eval_artifacts/eval_state/routing_eval: the "nothing has run yet" defaults.
//   - the four Health verdicts: UNVERIFIED = "no assessment", the honest absence.
// Everything else required (subject, deployment_target, scope, owner, freshness,
// drift_check, name, description, version) has NO honest mechanical default — a
// value there is a claim only a human/agent can truthfully make → SEMANTIC.
//
// `freshness` is deliberately NOT here: defaulting it to today would be an
// aspirational (false) truth claim, the exact dishonesty version-schema-contract bans.
// `drift_check` is NOT here: a skeleton with no real hashes is not grounding.
// ---------------------------------------------------------------------------
const MECHANICAL_DEFAULTS = {
  eval_artifacts: 'none',
  eval_state: 'unverified',
  routing_eval: 'absent',
  structural_verdict: 'UNVERIFIED',
  truth_verdict: 'UNVERIFIED',
  comprehension_verdict: 'UNVERIFIED',
  application_verdict: 'UNVERIFIED',
};

function loadSchema() {
  // The binding schema lives in this repo's schemas/ dir. Resolve relative to the
  // script so the tool works from any cwd (no version number in the path —
  // version-agnostic by design).
  const schemaPath = path.join(__dirname, '..', 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json');
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
}

/**
 * Classify one skill's frontmatter against the live schema's required set.
 * Returns { mechanicalFillable, semanticDebt, schemaUnknown, schemaVersion }.
 */
function classify(rawText, schema) {
  const fm = normalizeFrontmatter(parseFrontmatter(rawText) || {}) || {};
  const required = Array.isArray(schema.required) ? schema.required : [];
  const known = new Set(Object.keys(schema.properties || {}));

  const present = (k) => fm[k] !== undefined && fm[k] !== null && fm[k] !== '';
  const missingRequired = required.filter((k) => !present(k));

  const mechanicalFillable = missingRequired.filter((k) => k in MECHANICAL_DEFAULTS);
  const semanticDebt = missingRequired.filter((k) => !(k in MECHANICAL_DEFAULTS));

  // Schema-unknown present fields = likely-retired (additionalProperties:false makes
  // them lint errors). Reported for human review; NEVER auto-removed (no destroying
  // author data deterministically).
  const schemaUnknown = Object.keys(fm).filter((k) => !known.has(k) && k !== 'metadata');

  return {
    mechanicalFillable,
    semanticDebt,
    schemaUnknown,
    schemaVersion: fm.schema_version,
  };
}

// ---------------------------------------------------------------------------
// --apply text surgery. Inserts missing mechanical-default fields into the
// frontmatter (under `metadata:` for the nested encoding, else at top level) and
// injects the semantic-debt marker comment. NEVER edits the body or schema_version.
// ---------------------------------------------------------------------------
const FM_BLOCK_RE = new RegExp('^(\\uFEFF?---\\r?\\n)([\\s\\S]*?)(\\r?\\n---(?:\\r?\\n|$))');

function applyToText(rawText, classification) {
  const m = rawText.match(FM_BLOCK_RE);
  if (!m) return { text: rawText, changed: false };
  const open = m[1];
  let fmBlock = m[2];
  const close = m[3];
  const rest = rawText.slice(m[0].length);

  const nested = /^\s*metadata:\s*$/m.test(fmBlock);
  const indent = nested ? '  ' : '';
  const additions = [];
  for (const field of classification.mechanicalFillable) {
    additions.push(`${indent}${field}: ${MECHANICAL_DEFAULTS[field]}`);
  }
  // Explicit semantic-debt marker — only when debt remains. Keeps the skill from
  // looking "fully migrated" while scope / Understanding fields are unauthored.
  if (classification.semanticDebt.length > 0) {
    additions.push(`${indent}# semantic-debt: ${classification.semanticDebt.join(', ')} — author via /audit:* (schema_version intentionally NOT bumped until earned)`);
  }
  if (additions.length === 0) return { text: rawText, changed: false };

  fmBlock = `${fmBlock}\n${additions.join('\n')}`;
  return { text: `${open}${fmBlock}${close}${rest}`, changed: true };
}

function parseArgs(argv) {
  const args = { mode: 'report', json: false, skill: null, pathArg: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--apply') args.mode = 'apply';
    else if (a === '--report') args.mode = 'report';
    else if (a === '--json') args.json = true;
    else if (a === '--skill') args.skill = argv[++i];
    else if (a === '--path') args.pathArg = argv[++i];
    else if (a === '-h' || a === '--help') { args.help = true; }
  }
  return args;
}

function gatherFiles(args) {
  if (args.pathArg) return [{ filePath: path.resolve(args.pathArg) }];
  const all = collectSkillFiles();
  if (args.skill) {
    return all.filter((f) => path.basename(path.dirname(f.filePath)) === args.skill);
  }
  return all;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write('Usage: normalize-skill-field-shape.js [--report|--apply] [--skill N | --path FILE] [--json]\n');
    process.exit(0);
  }
  const schema = loadSchema();
  const files = gatherFiles(args);
  const results = [];

  for (const f of files) {
    let rawText;
    try { rawText = fs.readFileSync(f.filePath, 'utf8'); } catch (_) { continue; }
    const c = classify(rawText, schema);
    const hasWork = c.mechanicalFillable.length > 0 || c.semanticDebt.length > 0 || c.schemaUnknown.length > 0;
    if (!hasWork) continue;

    const skillName = path.basename(path.dirname(f.filePath));
    const record = {
      skill: skillName,
      path: f.filePath,
      schema_version: c.schemaVersion,
      mechanical_fillable: c.mechanicalFillable,
      semantic_debt: c.semanticDebt,
      schema_unknown: c.schemaUnknown,
      applied: false,
    };

    if (args.mode === 'apply') {
      const { text, changed } = applyToText(rawText, c);
      if (changed) {
        fs.writeFileSync(f.filePath, text);
        record.applied = true;
      }
    }
    results.push(record);
  }

  if (args.json) {
    process.stdout.write(JSON.stringify({ mode: args.mode, skills: results }, null, 2) + '\n');
    process.exit(0);
  }

  // Human report.
  const lines = [];
  lines.push(`# Field-shape normalization (${args.mode}) — ${results.length} skill(s) with work\n`);
  for (const r of results) {
    lines.push(`${r.skill}  [schema_version: ${r.schema_version ?? '?'}]`);
    if (r.mechanical_fillable.length) lines.push(`  mechanical (codemod CAN fill): ${r.mechanical_fillable.join(', ')}`);
    if (r.semantic_debt.length) lines.push(`  semantic-debt (→ /audit:*):     ${r.semantic_debt.join(', ')}`);
    if (r.schema_unknown.length) lines.push(`  schema-unknown (review):        ${r.schema_unknown.join(', ')}`);
    if (args.mode === 'apply') lines.push(`  applied: ${r.applied}`);
  }
  const totMech = results.reduce((n, r) => n + r.mechanical_fillable.length, 0);
  const totSem = results.reduce((n, r) => n + r.semantic_debt.length, 0);
  lines.push(`\nTotals: ${totMech} mechanical fill(s), ${totSem} semantic-debt field(s) across ${results.length} skill(s).`);
  lines.push('schema_version is NEVER bumped here — semantic debt drains through /audit:*, which earns the label.');
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(0);
}

if (require.main === module) main();

module.exports = { classify, applyToText, MECHANICAL_DEFAULTS };
