#!/usr/bin/env node
/**
 * Schema constants drift check (doctor gate).
 *
 * Validates that `schemas/SKILL_METADATA_PROTOCOL_schema.json` and `schemas/manifest.schema.json`
 * carry the enum values mandated by:
 *   - ADR-0011 (four-verdict Health Block)
 *   - ADR-0017 + its 2026-05-27 amendment (v8 classification: `subject` 9-enum,
 *     `deployment_target` 2-enum, and free-text `scope` with NO enum). The
 *     amendment retired the `operation` axis, removed the `scope` enum, and
 *     dropped the `category` and `type` axes. This checker asserts the
 *     clean-cut v8 shape, not the retired one.
 *
 * Why this gate exists (per 2026-05-25 F14 finding): `doctor` historically
 * passed clean even when an enum value was missing or extra, because the
 * deterministic checks downstream (`skill-lint.js`, `protocol-check`) validate
 * SKILLS against the schema but do not validate the SCHEMA's constants against
 * the ADR. A typo in the `subject` / `subjects[]` / `deployment_target` enums
 * would route the corpus into a silent acceptance hole — invalid values pass
 * because the typo widens the enum, or valid values fail because it shrinks it.
 * This check closes that hole, and also guards against a `scope` enum being
 * re-introduced after the 2026-05-27 amendment made it free-text.
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
const SKILL_SCHEMA = path.join(REPO_ROOT, 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json');
const MANIFEST_SCHEMA = path.join(REPO_ROOT, 'schemas', 'manifest.schema.json');

// ---------------------------------------------------------------------------
// Spec — the ground truth from ADR-0011 and ADR-0017.
// ---------------------------------------------------------------------------

const SPEC = {
  schema_version: {
    // Integer 8 is canonical; 7 is still accepted while pre-v8 skills migrate.
    // This is transitional acceptance, not a parallel authoring path.
    integer: [7, 8],
    string: ['7', '8'],
  },
  // v8 classification (ADR-0017 + 2026-05-27 amendment)
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
  v8_deployment_target: ['portable', 'project'],
  // Health Block — ADR-0011 four-verdict split (current under v8)
  health_block_verdict_fields: [
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

// Assert a property exists, is a free-text string, and carries NO enum.
// Guards against a retired enum (e.g. the removed v8 `scope` enum) being
// re-introduced after the ADR-0017 2026-05-27 amendment made `scope` free-text.
function checkFreeText(label, def) {
  if (!def || def.type !== 'string') {
    return { label, ok: false, reason: 'property missing or not a string' };
  }
  if (Array.isArray(def.enum)) {
    return { label, ok: false, reason: `must be free-text — found an enum: ${def.enum.join(', ')} (ADR-0017 2026-05-27 amendment removed the scope enum)` };
  }
  return { label, ok: true };
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

  // v8 classification (ADR-0017 + 2026-05-27 amendment)
  results.push(checkEnum('skill.schema subject (v8 9-enum)', SPEC.v8_subject, skillProps.subject && skillProps.subject.enum));
  if (skillProps.subjects && skillProps.subjects.items) {
    results.push(checkEnum('skill.schema subjects[].items (v8 9-enum)', SPEC.v8_subject, skillProps.subjects.items.enum));
  }
  results.push(checkEnum('skill.schema deployment_target (v8 2-enum)', SPEC.v8_deployment_target, skillProps.deployment_target && skillProps.deployment_target.enum));

  // scope is free-text under v8 — assert it carries NO enum (regression guard)
  results.push(checkFreeText('skill.schema scope (free-text, no enum)', skillProps.scope));

  // Manifest mirrors: per-skill enum must match
  results.push(checkEnum('manifest.schema skills.subject (v8 9-enum)', SPEC.v8_subject, manifestSkillProps.subject && manifestSkillProps.subject.enum));
  results.push(checkEnum('manifest.schema skills.deployment_target (v8 2-enum)', SPEC.v8_deployment_target, manifestSkillProps.deployment_target && manifestSkillProps.deployment_target.enum));
  results.push(checkFreeText('manifest.schema skills.scope (free-text, no enum)', manifestSkillProps.scope));

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

  // Health Block verdict fields must be declared (ADR-0011, current under v8)
  for (const field of SPEC.health_block_verdict_fields) {
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
