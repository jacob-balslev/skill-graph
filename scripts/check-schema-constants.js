#!/usr/bin/env node
/**
 * Schema constants drift check (doctor gate).
 *
 * Validates that `schemas/SKILL_METADATA_PROTOCOL_schema.json` and `schemas/manifest.schema.json`
 * carry the enum values mandated by:
 *   - ADR-0011 (four-verdict Audit Status)
 *   - ADR-0020 twelve-shelf re-axis (`subject` 12-enum), boolean `public`,
 *     and free-text `scope` with NO enum. The amendment retired the `operation`
 *     axis, replaced the interim `deployment_target` enum, removed the `scope`
 *     enum, and dropped the `category` and `type` axes. This checker asserts
 *     the clean-cut v8 shape, not the retired one.
 *
 * Why this gate exists (per 2026-05-25 F14 finding): `doctor` historically
 * passed clean even when an enum value was missing or extra, because the
 * deterministic checks downstream (`skill-lint.js`, `protocol-check`) validate
 * SKILLS against the schema but do not validate the SCHEMA's constants against
 * the ADR. A typo in the `subject` / `subjects[]` enum would route the corpus
 * into a silent acceptance hole — invalid values pass because the typo widens
 * the enum, or valid values fail because it shrinks it. This check closes that
 * hole, and also guards against a `scope` enum or retired `deployment_target`
 * requirement being re-introduced after the ADR-0017 amendment.
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
// ADR-0019 audit-state sidecar: schema_version + owner + the four Audit Status
// verdicts + the eval/drift bookkeeping live here now, not in the frontmatter
// schema. This checker asserts the sidecar's constants too.
const AUDIT_STATE_SCHEMA = path.join(REPO_ROOT, 'schemas', 'skill-audit-state.schema.json');

// ---------------------------------------------------------------------------
// Spec — the ground truth from ADR-0011 and ADR-0017.
// ---------------------------------------------------------------------------

const SPEC = {
  schema_version: {
    // v8 is the only accepted version; v7 is deprecated and rejected. A v7 skill
    // fails validation and must migrate through the audit loop (CONTENT work).
    integer: [8],
    string: ['8'],
  },
  // classification subject enum (ADR-0020 twelve-shelf competency re-axis).
  // 3 bands: engineering /
  // AI-agentic / cross-cutting craft.
  v8_subject: [
    'backend-engineering',
    'frontend-engineering',
    'software-architecture',
    'data-engineering',
    'agent-ops',
    'ai-engineering',
    'quality-assurance',
    'design',
    'reasoning-strategy',
    'software-engineering-method',
    'knowledge-organization',
    'product-domain',
  ],
  // `public` is the boolean publishability gate that replaced the
  // deployment_target enum (ADR-0017 amendment) — it has no enum, so it is
  // asserted by type, not by enum membership.
  v8_required_fields: ['subject', 'public', 'scope'],
  // Frontmatter `required` is exactly the 5 agent-facing core fields after the
  // ADR-0019 sidecar split. schema_version/owner/freshness/drift_check/eval_*
  // are no longer frontmatter-required — they are sidecar-required.
  frontmatter_required_exact: ['name', 'description', 'subject', 'public', 'scope'],
  // Audit-state sidecar `required` (7 of the 8 previously-required audit fields;
  // `version` is optional in the sidecar). ADR-0019.
  sidecar_required_fields: [
    'schema_version',
    'owner',
    'freshness',
    'drift_check',
    'eval_artifacts',
    'eval_state',
    'routing_eval',
  ],
  // Audit Status — ADR-0011 four-verdict split. Lives in the audit-state
  // sidecar after the ADR-0019 split (was frontmatter under single-file v8).
  health_block_verdict_fields: [
    'structural_verdict',
    'truth_verdict',
    'comprehension_verdict',
    'application_verdict',
  ],
  // Total top-level property counts — drift guard for the hand-stamped field
  // counts in prose. When a field is added or removed, bump these AND the
  // counts in: AGENTS.md § Skill Metadata Protocol — Quick Reference,
  // docs/concept-map.md, and docs/adr/0019-audit-state-sidecar-separation.md.
  // (Added 2026-06-14 per audit finding P-7: six fields were added on
  // 2026-06-10/06-12 and three docs went stale because no gate asserted counts.)
  frontmatter_property_count: 31,
  sidecar_property_count: 30,
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

function checkRequiredFields(label, required, fields) {
  if (!Array.isArray(required)) {
    return { label, ok: false, reason: 'required missing or not an array' };
  }
  const missing = fields.filter(field => !required.includes(field));
  if (missing.length === 0) {
    return { label, ok: true };
  }
  return { label, ok: false, reason: `missing required field(s): ${missing.join(', ')}` };
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

// Assert a property exists and is exactly the expected JSON-schema `type`.
// Used for the boolean `public` publishability gate (ADR-0017 amendment) which
// replaced the deployment_target enum — it is asserted by type, not enum.
function checkType(label, def, expectedType) {
  if (!def) return { label, ok: false, reason: 'property missing' };
  if (def.type !== expectedType) {
    return { label, ok: false, reason: `expected type ${expectedType}, found ${def.type || '(none)'}` };
  }
  if (Array.isArray(def.enum)) {
    return { label, ok: false, reason: `expected a plain ${expectedType} — found an enum: ${def.enum.join(', ')}` };
  }
  return { label, ok: true };
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function runChecks() {
  const skill = readSchema(SKILL_SCHEMA);
  const manifest = readSchema(MANIFEST_SCHEMA);
  const auditState = readSchema(AUDIT_STATE_SCHEMA);

  const skillProps = skill.properties || {};
  const skillRequired = skill.required || [];
  const auditProps = auditState.properties || {};
  const auditRequired = auditState.required || [];
  const manifestSkillRequired =
    (manifest.properties &&
      manifest.properties.skills &&
      manifest.properties.skills.items &&
      manifest.properties.skills.items.required) ||
    [];
  const manifestSkillProps =
    (manifest.properties &&
      manifest.properties.skills &&
      manifest.properties.skills.items &&
      manifest.properties.skills.items.properties) ||
    {};

  const results = [];

  // schema_version oneOf — lives in the audit-state sidecar after ADR-0019.
  // Verify integer + string branches both list only v8.
  const sv = auditProps.schema_version;
  if (!sv || !Array.isArray(sv.oneOf)) {
    results.push({ label: 'audit-state.schema schema_version.oneOf', ok: false, reason: 'missing or not an array' });
  } else {
    const intBranch = sv.oneOf.find(b => b.type === 'integer');
    const strBranch = sv.oneOf.find(b => b.type === 'string');
    results.push(checkEnum('audit-state.schema schema_version (integer)', SPEC.schema_version.integer, intBranch && intBranch.enum));
    results.push(checkEnum('audit-state.schema schema_version (string)', SPEC.schema_version.string, strBranch && strBranch.enum));
  }

  // Frontmatter `required` is exactly the 5 agent-facing core fields (ADR-0019).
  results.push(checkRequiredFields('skill.schema required v8 fields', skillRequired, SPEC.v8_required_fields));
  {
    const { missing, extra } = symDiff(SPEC.frontmatter_required_exact, skillRequired);
    results.push({
      label: 'skill.schema required is exactly the 5 core fields (ADR-0019)',
      ok: missing.length === 0 && extra.length === 0,
      reason: (missing.length || extra.length)
        ? [missing.length ? `missing: ${missing.join(', ')}` : '', extra.length ? `extra (audit field still required in frontmatter?): ${extra.join(', ')}` : ''].filter(Boolean).join(' | ')
        : undefined,
    });
  }

  // Audit-state sidecar `required` (7 fields; `version` optional). ADR-0019.
  results.push(checkRequiredFields('audit-state.schema required fields', auditRequired, SPEC.sidecar_required_fields));

  // Total property-count drift guard (audit finding P-7). Keeps the prose
  // field counts in AGENTS.md / concept-map.md / ADR-0019 from going stale.
  {
    const fc = Object.keys(skillProps).length;
    results.push({
      label: 'skill.schema frontmatter property count',
      ok: fc === SPEC.frontmatter_property_count,
      reason: fc === SPEC.frontmatter_property_count ? undefined
        : `expected ${SPEC.frontmatter_property_count}, found ${fc} — bump SPEC.frontmatter_property_count AND the counts in AGENTS.md, docs/concept-map.md, ADR-0019`,
    });
    const sc = Object.keys(auditProps).length;
    results.push({
      label: 'audit-state.schema sidecar property count',
      ok: sc === SPEC.sidecar_property_count,
      reason: sc === SPEC.sidecar_property_count ? undefined
        : `expected ${SPEC.sidecar_property_count}, found ${sc} — bump SPEC.sidecar_property_count AND the counts in AGENTS.md, docs/concept-map.md, ADR-0019`,
    });
  }
  results.push(checkEnum('skill.schema subject (12-enum)', SPEC.v8_subject, skillProps.subject && skillProps.subject.enum));
  if (skillProps.subjects && skillProps.subjects.items) {
    results.push(checkEnum('skill.schema subjects[].items (12-enum)', SPEC.v8_subject, skillProps.subjects.items.enum));
  }
  results.push(checkType('skill.schema public (boolean publishability gate)', skillProps.public, 'boolean'));

  // scope is free-text under v8 — assert it carries NO enum (regression guard)
  results.push(checkFreeText('skill.schema scope (free-text, no enum)', skillProps.scope));

  // Manifest mirrors: per-skill enum must match
  results.push(checkRequiredFields('manifest.schema skills.required v8 fields', manifestSkillRequired, SPEC.v8_required_fields));
  results.push(checkEnum('manifest.schema skills.subject (12-enum)', SPEC.v8_subject, manifestSkillProps.subject && manifestSkillProps.subject.enum));
  results.push(checkType('manifest.schema skills.public (boolean publishability gate)', manifestSkillProps.public, 'boolean'));
  results.push(checkFreeText('manifest.schema skills.scope (free-text, no enum)', manifestSkillProps.scope));

  // schema_version pass-through on per-skill entry — must list only v8
  const msv = manifestSkillProps.schema_version;
  if (!msv || !Array.isArray(msv.oneOf)) {
    results.push({ label: 'manifest.schema skills.schema_version', ok: false, reason: 'missing or not oneOf — see F4 (2026-05-25)' });
  } else {
    const intBranch = msv.oneOf.find(b => b.type === 'integer');
    const strBranch = msv.oneOf.find(b => b.type === 'string');
    results.push(checkEnum('manifest.schema skills.schema_version (integer)', SPEC.schema_version.integer, intBranch && intBranch.enum));
    results.push(checkEnum('manifest.schema skills.schema_version (string)', SPEC.schema_version.string, strBranch && strBranch.enum));
  }

  // Audit Status verdict fields must be declared in the audit-state sidecar
  // (ADR-0011 four-verdict split; relocated from frontmatter to the sidecar by
  // ADR-0019).
  for (const field of SPEC.health_block_verdict_fields) {
    const def = auditProps[field];
    results.push({
      label: `audit-state.schema Audit Status field: ${field}`,
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
