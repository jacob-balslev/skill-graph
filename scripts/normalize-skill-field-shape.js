#!/usr/bin/env node
/**
 * normalize-skill-field-shape — deterministic v8+ field-SHAPE migrator (Decision B)
 * AND the ADR-0019 frontmatter→audit-state.json sidecar MOVER (the Phase-6 corpus tool).
 *
 * TWO mechanical normalizations, one tool, both version-agnostic:
 *
 *   1. RELOCATE (ADR-0019): the 28 audit/eval/provenance fields live in the sibling
 *      `audit-state.json` sidecar, NOT in SKILL.md frontmatter. This tool moves any of
 *      those fields it finds in frontmatter into the sidecar (faithful value copy via
 *      normalizeFrontmatter, so a stringified `drift_check` lands as a real object) and
 *      strips them from the frontmatter text. The field set is read LIVE from
 *      schemas/skill-audit-state.schema.json — no field is hardcoded, so the tool tracks
 *      the contract through future schema edits.
 *
 *   2. FILL mechanical defaults: a sidecar-required field with a single honest default
 *      (eval_artifacts/eval_state/routing_eval = "nothing has run yet"; the four Health
 *      verdicts = UNVERIFIED) is filled INTO THE SIDECAR when absent everywhere. Post-cut
 *      these are sidecar fields, so the fill targets the sidecar — filling them into
 *      frontmatter would make the frontmatter lint-DIRTY (additionalProperties:false).
 *
 * The honest split this tool encodes (per the 2026-05-30 end-to-end plan § Decision B +
 * GPT-5.4's caveats):
 *
 *   MECHANICAL fields  → this codemod fills/relocates them (a single honest default, or a
 *                        faithful copy, exists).
 *   SEMANTIC fields    → reserved for agent authoring via /audit:*. This tool NEVER invents
 *                        them (no derived `deployment_target`, no PRD `scope`, no
 *                        Understanding-field prose, no fabricated `owner`/`freshness`/
 *                        `drift_check`) — that is the failure mode GPT-5.4 warned about
 *                        ("the codemod silently becomes a semantic author").
 *
 * It is VERSION-AGNOSTIC by design: it reads the CURRENT schemas' `required`/`properties`
 * sets, so it is NOT a per-version `migrate-vN-to-vM.js` codemod (which `AGENTS.md § Major
 * Version Is a Clean Cut` bans as standing tooling). It is a reusable shape NORMALIZER that
 * targets whatever the live two-file contract demands, and it survives future schema bumps
 * without edits. See the clean-cut § carve-out citing Decision B.
 *
 * It NEVER bumps `schema_version`. The version label is EARNED, not bumped
 * (`.claude/rules/version-schema-contract.md`): relocation preserves the field's value
 * (schema_version: 8 in frontmatter → schema_version: 8 in the sidecar, value untouched);
 * the integer advances only when semantic content is authored through `/audit:*`. A skill
 * this tool touches that still carries semantic debt gets an EXPLICIT `# semantic-debt:`
 * marker comment in frontmatter, so a shape-migrated-but-semantically-incomplete skill
 * never gets false "latest-schema" legitimacy.
 *
 * Modes:
 *   --report  (default, READ-ONLY): per-skill audit fields it CAN relocate, mechanical gaps
 *             it CAN fill, semantic debt it CANNOT author, plus schema-unknown (likely-
 *             retired) fields to review. The report IS the corpus debt ledger that drives
 *             /audit:* work. SYSTEM-safe.
 *   --apply   (WRITES SKILL.md + audit-state.json = CONTENT): relocates the audit fields to
 *             the sidecar, fills missing mechanical-default fields in the sidecar, strips the
 *             relocated fields from frontmatter, and injects the `# semantic-debt:` marker
 *             when debt remains. Does NOT touch schema_version's VALUE, the body, semantic
 *             fields, or schema-unknown fields. Run this through the audit loop (CONTENT),
 *             not from a SYSTEM commit.
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
const { sidecarPathForSkill, readSidecar, writeSidecarFields } = require('./lib/audit-state-sidecar');

// ---------------------------------------------------------------------------
// Mechanical-default field map. A field belongs here ONLY when a single honest
// default exists that does NOT assert anything untrue about the skill.
//   - eval_artifacts/eval_state/routing_eval: the "nothing has run yet" defaults.
//   - the four Health verdicts: UNVERIFIED = "no assessment", the honest absence.
// Everything else (subject, deployment_target, scope, name, description in frontmatter;
// owner, freshness, drift_check, version in the sidecar) has NO honest mechanical
// default — a value there is a claim only a human/agent can truthfully make → SEMANTIC.
//
// `freshness` is deliberately NOT here: defaulting it to today would be an aspirational
// (false) truth claim, the exact dishonesty version-schema-contract bans.
// `drift_check` is NOT here: a skeleton with no real hashes is not grounding.
// All keys below are SIDECAR fields post-ADR-0019, so the fill targets the sidecar.
// ---------------------------------------------------------------------------
const MECHANICAL_DEFAULTS = {
  eval_artifacts: 'none',
  eval_state: 'unverified',
  routing_eval: 'absent',
  structural_verdict: 'UNVERIFIED',
  truth_verdict: 'UNVERIFIED',
  comprehension_verdict: 'UNVERIFIED',
};

function loadSchemas() {
  // Both binding schemas live in this repo's schemas/ dir. Resolve relative to the script so
  // the tool works from any cwd (no version number in the path — version-agnostic by design).
  const schemasDir = path.join(__dirname, '..', 'schemas');
  return {
    frontmatter: JSON.parse(fs.readFileSync(path.join(schemasDir, 'SKILL_METADATA_PROTOCOL_schema.json'), 'utf8')),
    sidecar: JSON.parse(fs.readFileSync(path.join(schemasDir, 'skill-audit-state.schema.json'), 'utf8')),
  };
}

/** The 28 audit/eval/provenance field names the sidecar owns — read live from its schema. */
function sidecarFieldsFromSchema(sidecarSchema) {
  return new Set(Object.keys(sidecarSchema.properties || {}));
}

/**
 * Classify one skill's field shape against the live two-file contract.
 * @param rawText        SKILL.md contents
 * @param schemas        { frontmatter, sidecar }
 * @param existingSidecar parsed audit-state.json object (or null) — so a field already in
 *                        the sidecar is neither "to relocate" nor a "gap".
 * Returns { auditFieldsInFrontmatter, sidecarMechanicalGaps, frontmatterSemanticDebt,
 *           sidecarSemanticDebt, schemaUnknown, schemaVersion }.
 */
function classify(rawText, schemas, existingSidecar) {
  const fm = normalizeFrontmatter(parseFrontmatter(rawText) || {}) || {};
  const sidecar = existingSidecar || {};
  const sidecarFields = sidecarFieldsFromSchema(schemas.sidecar);
  const fmRequired = Array.isArray(schemas.frontmatter.required) ? schemas.frontmatter.required : [];
  const sidecarRequired = Array.isArray(schemas.sidecar.required) ? schemas.sidecar.required : [];
  const fmKnown = new Set(Object.keys(schemas.frontmatter.properties || {}));

  const present = (obj, k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== '';

  // (1) RELOCATE: sidecar-owned fields currently sitting in the frontmatter.
  const auditFieldsInFrontmatter = [...sidecarFields].filter((k) => present(fm, k));

  // A field counts as "available" if it is in frontmatter (about to move) OR already in the
  // sidecar — so a gap is a field that is truly absent everywhere.
  const available = (k) => present(fm, k) || present(sidecar, k);

  // (2) FILL: sidecar-required fields absent everywhere that have an honest mechanical default.
  const sidecarMechanicalGaps = sidecarRequired.filter((k) => !available(k) && (k in MECHANICAL_DEFAULTS));

  // SEMANTIC debt — required fields with no honest default; route to /audit:*.
  const frontmatterSemanticDebt = fmRequired.filter((k) => !present(fm, k));
  const sidecarSemanticDebt = sidecarRequired.filter((k) => !available(k) && !(k in MECHANICAL_DEFAULTS));

  // Schema-unknown present frontmatter fields = likely-retired (additionalProperties:false
  // makes them lint errors). NOT the sidecar fields (those relocate). NOT the metadata
  // wrapper key. Reported for human review; NEVER auto-removed (no destroying author data).
  const schemaUnknown = Object.keys(fm).filter(
    (k) => !fmKnown.has(k) && !sidecarFields.has(k) && k !== 'metadata',
  );

  return {
    auditFieldsInFrontmatter,
    sidecarMechanicalGaps,
    frontmatterSemanticDebt,
    sidecarSemanticDebt,
    schemaUnknown,
    schemaVersion: fm.schema_version !== undefined ? fm.schema_version : sidecar.schema_version,
  };
}

/**
 * Build the sidecar patch to write: the faithful (normalized) values of the audit fields
 * being relocated out of frontmatter, plus honest mechanical defaults for absent
 * sidecar-required fields. schema_version is carried by VALUE (never bumped).
 */
function buildSidecarPatch(fm, classification) {
  const patch = {};
  for (const k of classification.auditFieldsInFrontmatter) {
    patch[k] = fm[k]; // normalized value — drift_check is already an object, schema_version a number
  }
  for (const k of classification.sidecarMechanicalGaps) {
    patch[k] = MECHANICAL_DEFAULTS[k];
  }
  return patch;
}

// ---------------------------------------------------------------------------
// Frontmatter text surgery.
// ---------------------------------------------------------------------------
const FM_BLOCK_RE = new RegExp('^(\\uFEFF?---\\r?\\n)([\\s\\S]*?)(\\r?\\n---(?:\\r?\\n|$))');

/**
 * Remove the given top-level (or metadata-nested) field keys from a frontmatter block,
 * line-based so the author's comments, quoting, and indentation on the SURVIVING lines are
 * preserved. For each matched key line, also removes its deeper-indented block body (object
 * / array values), stopping at the first blank or sibling/shallower line. Handles both the
 * flat encoding (indent 0) and the nested `metadata:` encoding (indent 2).
 */
function stripFieldsFromBlock(fmBlock, fieldNames) {
  const fieldSet = fieldNames instanceof Set ? fieldNames : new Set(fieldNames);
  const lines = fmBlock.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^(\s*)([A-Za-z0-9_-]+)\s*:/);
    if (m && fieldSet.has(m[2])) {
      const keyIndent = m[1].length;
      i += 1; // drop the key line
      // Drop the field's block body: contiguous lines indented DEEPER than the key.
      while (i < lines.length) {
        const next = lines[i];
        if (next.trim() === '') break; // blank line ends the value block
        const ni = (next.match(/^(\s*)/)[1] || '').length;
        if (ni <= keyIndent) break; // sibling or shallower key — not part of this value
        i += 1;
      }
      continue;
    }
    out.push(line);
    i += 1;
  }
  return out.join('\n');
}

/**
 * Inject the explicit semantic-debt marker comment into the frontmatter block (under
 * `metadata:` for the nested encoding, else at the block's indent). Keeps a skill from
 * looking "fully migrated" while frontmatter/sidecar semantic fields are unauthored.
 */
function injectSemanticDebtMarker(fmBlock, debtFields) {
  if (!debtFields || debtFields.length === 0) return { text: fmBlock, changed: false };
  const nested = /^\s*metadata:\s*$/m.test(fmBlock);
  const indent = nested ? '  ' : '';
  const marker = `${indent}# semantic-debt: ${debtFields.join(', ')} — author via /audit:* (schema_version intentionally NOT bumped until earned)`;
  // Avoid duplicating an existing marker.
  if (fmBlock.includes('# semantic-debt:')) return { text: fmBlock, changed: false };
  return { text: `${fmBlock}\n${marker}`, changed: true };
}

/**
 * Apply the relocate + mark transform to the raw SKILL.md text (pure — no IO).
 * Returns { text, changed } where `text` is the new SKILL.md with the audit fields stripped
 * and the semantic-debt marker injected. The sidecar patch is built separately and written
 * by the caller.
 */
function applyToText(rawText, classification) {
  const m = rawText.match(FM_BLOCK_RE);
  if (!m) return { text: rawText, changed: false };
  const open = m[1];
  let fmBlock = m[2];
  const close = m[3];
  const rest = rawText.slice(m[0].length);

  let changed = false;
  if (classification.auditFieldsInFrontmatter.length > 0) {
    const stripped = stripFieldsFromBlock(fmBlock, classification.auditFieldsInFrontmatter);
    if (stripped !== fmBlock) { fmBlock = stripped; changed = true; }
  }
  const debt = [...classification.frontmatterSemanticDebt, ...classification.sidecarSemanticDebt];
  const marked = injectSemanticDebtMarker(fmBlock, debt);
  if (marked.changed) { fmBlock = marked.text; changed = true; }

  if (!changed) return { text: rawText, changed: false };
  return { text: `${open}${fmBlock}${close}${rest}`, changed: true };
}

/**
 * Full --apply for one skill (writes SKILL.md + audit-state.json). Relocates the audit
 * fields to the sidecar, fills mechanical gaps in the sidecar, strips them from frontmatter,
 * and injects the semantic-debt marker. Returns a record of what happened.
 */
function applyToSkill(skillMdPath, rawText, schemas) {
  const fm = normalizeFrontmatter(parseFrontmatter(rawText) || {}) || {};
  const existingSidecar = readSidecar(skillMdPath);
  const c = classify(rawText, schemas, existingSidecar);

  let sidecarWritten = false;
  const patch = buildSidecarPatch(fm, c);
  if (Object.keys(patch).length > 0) {
    const res = writeSidecarFields(skillMdPath, patch);
    sidecarWritten = res.written;
  }

  const { text, changed } = applyToText(rawText, c);
  if (changed) fs.writeFileSync(skillMdPath, text);

  return {
    relocated: c.auditFieldsInFrontmatter,
    filled: c.sidecarMechanicalGaps,
    semantic_debt: [...c.frontmatterSemanticDebt, ...c.sidecarSemanticDebt],
    sidecar_written: sidecarWritten,
    frontmatter_changed: changed,
    sidecar_path: sidecarPathForSkill(skillMdPath),
  };
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
  const schemas = loadSchemas();
  const files = gatherFiles(args);
  const results = [];

  for (const f of files) {
    let rawText;
    try { rawText = fs.readFileSync(f.filePath, 'utf8'); } catch (_) { continue; }
    const existingSidecar = readSidecar(f.filePath);
    const c = classify(rawText, schemas, existingSidecar);
    const hasWork = c.auditFieldsInFrontmatter.length > 0
      || c.sidecarMechanicalGaps.length > 0
      || c.frontmatterSemanticDebt.length > 0
      || c.sidecarSemanticDebt.length > 0
      || c.schemaUnknown.length > 0;
    if (!hasWork) continue;

    const skillName = path.basename(path.dirname(f.filePath));
    const record = {
      skill: skillName,
      path: f.filePath,
      schema_version: c.schemaVersion,
      relocate_to_sidecar: c.auditFieldsInFrontmatter,
      mechanical_fillable: c.sidecarMechanicalGaps,
      semantic_debt: [...c.frontmatterSemanticDebt, ...c.sidecarSemanticDebt],
      schema_unknown: c.schemaUnknown,
      applied: false,
    };

    if (args.mode === 'apply') {
      const r = applyToSkill(f.filePath, rawText, schemas);
      record.applied = r.frontmatter_changed || r.sidecar_written;
      record.sidecar_path = r.sidecar_path;
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
    if (r.relocate_to_sidecar.length) lines.push(`  relocate→sidecar (codemod CAN move): ${r.relocate_to_sidecar.join(', ')}`);
    if (r.mechanical_fillable.length) lines.push(`  mechanical fill→sidecar (CAN fill):  ${r.mechanical_fillable.join(', ')}`);
    if (r.semantic_debt.length) lines.push(`  semantic-debt (→ /audit:*):          ${r.semantic_debt.join(', ')}`);
    if (r.schema_unknown.length) lines.push(`  schema-unknown (review):             ${r.schema_unknown.join(', ')}`);
    if (args.mode === 'apply') lines.push(`  applied: ${r.applied}`);
  }
  const totReloc = results.reduce((n, r) => n + r.relocate_to_sidecar.length, 0);
  const totMech = results.reduce((n, r) => n + r.mechanical_fillable.length, 0);
  const totSem = results.reduce((n, r) => n + r.semantic_debt.length, 0);
  lines.push(`\nTotals: ${totReloc} field(s) to relocate, ${totMech} mechanical fill(s), ${totSem} semantic-debt field(s) across ${results.length} skill(s).`);
  lines.push('schema_version is NEVER bumped here — its value is carried into the sidecar; semantic debt drains through /audit:*, which earns the label.');
  process.stdout.write(lines.join('\n') + '\n');
  process.exit(0);
}

if (require.main === module) main();

module.exports = {
  classify,
  applyToText,
  applyToSkill,
  buildSidecarPatch,
  stripFieldsFromBlock,
  injectSemanticDebtMarker,
  sidecarFieldsFromSchema,
  loadSchemas,
  MECHANICAL_DEFAULTS,
};
