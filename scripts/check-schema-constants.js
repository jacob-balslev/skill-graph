#!/usr/bin/env node
/**
 * Schema constants drift check (doctor gate).
 *
 * Validates that `schemas/skill.schema.json` and `schemas/manifest.schema.json`
 * still carry the v7 + v8 enum values mandated by:
 *   - ADR-0011 (four-verdict Health Block — v7)
 *   - ADR-0017 (5-axis classification — v8: subject 9-enum, operation 4-enum, scope 5-enum during compat)
 *
 * Why this gate exists (per 2026-05-25 F14 finding): `doctor` historically
 * passed clean even when a v8 enum value was missing or extra, because the
 * deterministic checks downstream (`skill-lint.js`, `protocol-check`) validate
 * SKILLS against the schema but do not validate the SCHEMA's constants against
 * the ADR. A typo in `subjects[].enum` would route the v8 corpus into a silent
 * acceptance hole — invalid values pass because the typo widens the enum, or
 * valid values fail because the typo shrinks it. This check closes that hole.
 *
 * Exit codes:
 *   0 — every spec-mandated enum value is present and no extras present
 *   1 — drift detected (missing or extra values; details on stderr)
 *   2 — runtime error (missing schema file, unparseable JSON, etc.)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = process.env.SKILL_GRAPH_PACKAGE_ROOT || process.cwd();
const SKILL_SCHEMA = path.join(REPO_ROOT, 'schemas', 'skill.schema.json');
const MANIFEST_SCHEMA = path.join(REPO_ROOT, 'schemas', 'manifest.schema.json');

// ---------------------------------------------------------------------------
// Spec — the ground truth from ADR-0011 and ADR-0017.
// ---------------------------------------------------------------------------

const SPEC = {
  schema_version: {
    integer: [7, 8],
    string: ['7', '8'],
  },
  // v7 classification (compat-mode — retained until v7 sunset)
  v7_category: ['foundations', 'engineering', 'design', 'quality', 'agent', 'product'],
  v7_type: ['capability', 'workflow', 'router', 'overlay'],
  // v8 classification (ADR-0017)
  v8_subject: [
    'agent-ops',
    'code-engineering',
    'frontend-ui',
    'design-craft',
    'data-analytics',
    'quality-assurance',
    'meta-methods',
    'knowledge-organization',
    'product-domain',
  ],
  v8_operation: ['know', 'do', 'decide', 'modify'],
  // scope is dual-mode during the v7→v8 window: v7 names + v8 renames coexist
  scope_compat: ['codebase', 'reference', 'portable', 'project', 'workspace'],
  // Health Block — ADR-0011 four-verdict split
  v7_verdict_fields: [
    'structural_verdict',
    'truth_verdict',
    'comprehension_verdict',
    'application_verdict',
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readSchema(p) {
  if (!fs.existsSync(p)) {
    throw new Error(`schema not found: ${path.relative(REPO_ROOT, p)}`);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function symDiff(expected, actual) {
  const exp = new Set(expected);
  const act = new Set(actual || []);
  const missing = expected.filter(v => !act.has(v));
  const extra = (actual || []).filter(v => !exp.has(v));
  return { missing, extra };
}

function checkEnum(label, expected, actual) {
  if (!Array.isArray(actual)) {
    return { label, ok: false, reason: `enum missing or not an array` };
  }
  const { missing, extra } = symDiff(expected, actual);
  if (missing.length === 0 && extra.length === 0) {
    return { label, ok: true };
  }
  const parts = [];
  if (missing.length) parts.push(`missing: ${missing.join(', ')}`);
  if (extra.length) parts.push(`extra: ${extra.join(', ')}`);
  return { label, ok: false, reason: parts.join(' | ') };
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function runChecks() {
  const skill = readSchema(SKILL_SCHEMA);
  const manifest = readSchema(MANIFEST_SCHEMA);

  const skillProps = skill.properties || {};
  const manifestSkillProps =
    (manifest.properties &&
      manifest.properties.skills &&
      manifest.properties.skills.items &&
      manifest.properties.skills.items.properties) ||
    {};

  const results = [];

  // schema_version oneOf — verify integer + string branches both list [7, 8]
  const sv = skillProps.schema_version;
  if (!sv || !Array.isArray(sv.oneOf)) {
    results.push({ label: 'skill.schema schema_version.oneOf', ok: false, reason: 'missing or not an array' });
  } else {
    const intBranch = sv.oneOf.find(b => b.type === 'integer');
    const strBranch = sv.oneOf.find(b => b.type === 'string');
    results.push(checkEnum('skill.schema schema_version (integer)', SPEC.schema_version.integer, intBranch && intBranch.enum));
    results.push(checkEnum('skill.schema schema_version (string)', SPEC.schema_version.string, strBranch && strBranch.enum));
  }

  // v7 classification (compat-mode — must still be present)
  results.push(checkEnum('skill.schema category (v7 6-enum, compat)', SPEC.v7_category, skillProps.category && skillProps.category.enum));
  results.push(checkEnum('skill.schema type (v7 4-enum, compat)', SPEC.v7_type, skillProps.type && skillProps.type.enum));

  // v8 classification (ADR-0017)
  results.push(checkEnum('skill.schema subject (v8 9-enum)', SPEC.v8_subject, skillProps.subject && skillProps.subject.enum));
  results.push(checkEnum('skill.schema operation (v8 4-enum)', SPEC.v8_operation, skillProps.operation && skillProps.operation.enum));
  if (skillProps.subjects && skillProps.subjects.items) {
    results.push(checkEnum('skill.schema subjects[].items (v8 9-enum)', SPEC.v8_subject, skillProps.subjects.items.enum));
  }

  // scope must accept both v7 + v8 names during the compat window
  results.push(checkEnum('skill.schema scope (v7+v8 compat 5-enum)', SPEC.scope_compat, skillProps.scope && skillProps.scope.enum));

  // Manifest mirrors: per-skill enum must match
  results.push(checkEnum('manifest.schema skills.category (v7 6-enum, compat)', SPEC.v7_category, manifestSkillProps.category && manifestSkillProps.category.enum));
  results.push(checkEnum('manifest.schema skills.type (v7 4-enum, compat)', SPEC.v7_type, manifestSkillProps.type && manifestSkillProps.type.enum));
  results.push(checkEnum('manifest.schema skills.subject (v8 9-enum)', SPEC.v8_subject, manifestSkillProps.subject && manifestSkillProps.subject.enum));
  results.push(checkEnum('manifest.schema skills.operation (v8 4-enum)', SPEC.v8_operation, manifestSkillProps.operation && manifestSkillProps.operation.enum));
  results.push(checkEnum('manifest.schema skills.scope (v7+v8 compat 5-enum)', SPEC.scope_compat, manifestSkillProps.scope && manifestSkillProps.scope.enum));

  // schema_version pass-through on per-skill entry — must list both 7 and 8
  const msv = manifestSkillProps.schema_version;
  if (!msv || !Array.isArray(msv.oneOf)) {
    results.push({ label: 'manifest.schema skills.schema_version', ok: false, reason: 'missing or not oneOf — see F4 (2026-05-25)' });
  } else {
    const intBranch = msv.oneOf.find(b => b.type === 'integer');
    const strBranch = msv.oneOf.find(b => b.type === 'string');
    results.push(checkEnum('manifest.schema skills.schema_version (integer)', SPEC.schema_version.integer, intBranch && intBranch.enum));
    results.push(checkEnum('manifest.schema skills.schema_version (string)', SPEC.schema_version.string, strBranch && strBranch.enum));
  }

  // v7 verdict fields must be declared (Health Block, ADR-0011)
  for (const field of SPEC.v7_verdict_fields) {
    const def = skillProps[field];
    results.push({
      label: `skill.schema Health Block field: ${field}`,
      ok: !!def,
      reason: def ? undefined : 'missing — ADR-0011 four-verdict split incomplete',
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');

  let results;
  try {
    results = runChecks();
  } catch (e) {
    process.stderr.write(`ERROR check-schema-constants: ${e.message}\n`);
    process.exit(2);
  }

  const failed = results.filter(r => !r.ok);

  if (asJson) {
    process.stdout.write(JSON.stringify({ total: results.length, failed: failed.length, results }, null, 2) + '\n');
  } else {
    const labelPad = Math.max(...results.map(r => r.label.length));
    for (const r of results) {
      const badge = r.ok ? 'OK  ' : 'FAIL';
      const label = r.label.padEnd(labelPad);
      const detail = r.reason ? `  — ${r.reason}` : '';
      process.stdout.write(`${badge}  ${label}${detail}\n`);
    }
    if (failed.length === 0) {
      process.stdout.write(`\n${results.length}/${results.length} schema-constant checks PASS\n`);
    } else {
      process.stdout.write(`\n${failed.length}/${results.length} schema-constant checks FAIL — schema drifted from ADR-0011 / ADR-0017 spec\n`);
    }
  }

  process.exit(failed.length === 0 ? 0 : 1);
}

if (require.main === module) main();

module.exports = { runChecks, SPEC };
