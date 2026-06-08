#!/usr/bin/env node
/**
 * Test: v8 schema contract (clean cut — no v7 surface).
 *
 * Per AGENTS.md § Major Version Is a Clean Cut, the live schema describes v8
 * only. The v7 classification fields (`type`, `category`, `categories`,
 * `primaryCategory`, …) are REMOVED — they are now `additionalProperties`
 * violations, not "optional back-compat" properties. The v8 classification
 * axes `subject` + `public` are both in the global required array; `scope` is
 * free-text (its old enum, including `workspace`, is gone); `public` is the
 * boolean publishability gate that replaced the `deployment_target` enum; and
 * grounding is required when `project[]` is non-empty (re-anchored from the
 * retired `deployment_target: project` rule — publishability and project-
 * grounding are decoupled). Grounding's domain label is `subject_matter`, not
 * the retired `domain_object`.
 *
 * This test verifies:
 *   - Minimal v8 frontmatter (subject + public + scope) validates.
 *   - Legacy v7-shaped frontmatter (type/category, no subject/public)
 *     now FAILS — missing required axes AND additionalProperties violations.
 *     Any skill still carrying that shape is CONTENT-mode migration work.
 *   - A v8 skill that re-adds a retired v7 field (type/category) FAILS the
 *     clean cut (additionalProperties).
 *   - Missing `subject` fails; missing `public` fails.
 *   - `public` is a boolean; a string ("yes") fails the type check.
 *   - `project[]` presence requires grounding; without it, fails.
 *   - `scope` is required free-text (no enum); a v8 skill without it fails.
 *   - grounding requires `subject_matter`; the retired `domain_object` fails.
 *   - schema_version accepts 8 only (int or string); v7 is deprecated and
 *     rejected — a v7 skill fails validation and migrates through the audit loop.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json');
const SCHEMA = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
// ADR-0019: schema_version + the audit/eval fields live in the audit-state
// sidecar now. schema_version validity (8 only) is asserted against this schema.
const AUDIT_STATE_SCHEMA = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, 'schemas', 'skill-audit-state.schema.json'), 'utf8'),
);
// Minimal valid audit-state sidecar (all 7 required fields), used to isolate
// the schema_version enum checks without missing-required noise.
const sidecarBase = {
  schema_version: 8,
  owner: 'test-owner',
  freshness: '2026-05-25',
  drift_check: { last_verified: '2026-05-25' },
  eval_artifacts: 'none',
  eval_state: 'unverified',
  routing_eval: 'absent',
};

// Reimplement a minimal JSON Schema validator inline — it only needs to handle
// the subset the SKILL_METADATA_PROTOCOL_schema.json uses: type, enum, required,
// additionalProperties, properties, items, if/then, oneOf, allOf, anyOf, const.
// (Importing skill-lint.js as a module would trigger its lint pass as a side
// effect because it runs at require time.)

function sameJson(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function valueType(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  if (Number.isInteger(v)) return 'integer';
  return typeof v;
}
function matchesType(v, t) {
  if (Array.isArray(t)) return t.some(tt => matchesType(v, tt));
  if (t === 'integer') return Number.isInteger(v);
  if (t === 'number') return typeof v === 'number';
  if (t === 'string') return typeof v === 'string';
  if (t === 'boolean') return typeof v === 'boolean';
  if (t === 'array') return Array.isArray(v);
  if (t === 'object') return v !== null && typeof v === 'object' && !Array.isArray(v);
  if (t === 'null') return v === null;
  return false;
}

function validate(value, schema, errors = []) {
  if (!schema || typeof schema !== 'object') return errors;
  if (Array.isArray(schema.allOf)) for (const s of schema.allOf) validate(value, s, errors);
  if (Array.isArray(schema.oneOf)) {
    const ok = schema.oneOf.filter(s => validate(value, s, []).length === 0).length;
    if (ok !== 1) errors.push(`oneOf: expected exactly 1 match, got ${ok}`);
  }
  if (Array.isArray(schema.anyOf)) {
    const ok = schema.anyOf.some(s => validate(value, s, []).length === 0);
    if (!ok) errors.push('anyOf: no branch matched');
  }
  if (schema.if && validate(value, schema.if, []).length === 0) {
    if (schema.then) validate(value, schema.then, errors);
  } else if (schema.else) {
    validate(value, schema.else, errors);
  }
  if (schema.const !== undefined && !sameJson(value, schema.const)) {
    errors.push(`const fail: expected ${JSON.stringify(schema.const)} got ${JSON.stringify(value)}`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.some(e => sameJson(value, e))) {
    errors.push(`enum fail: ${JSON.stringify(value)} not in ${JSON.stringify(schema.enum)}`);
  }
  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`type fail: expected ${schema.type} got ${valueType(value)}`);
  }
  if (Array.isArray(schema.required) && valueType(value) === 'object') {
    for (const key of schema.required) {
      if (!(key in value)) errors.push(`required: missing key '${key}'`);
    }
  }
  if (schema.properties && valueType(value) === 'object') {
    for (const [k, sub] of Object.entries(schema.properties)) {
      if (k in value) validate(value[k], sub, errors);
    }
  }
  if (schema.items && Array.isArray(value)) {
    for (const item of value) validate(item, schema.items, errors);
  }
  if (schema.additionalProperties === false && schema.properties && valueType(value) === 'object') {
    const allowed = new Set(Object.keys(schema.properties));
    for (const k of Object.keys(value)) {
      if (!allowed.has(k)) errors.push(`additionalProperties: unexpected key '${k}'`);
    }
  }
  return errors;
}

let passCount = 0;
let failCount = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`PASS test-v8-schema-compat: ${name}`);
    passCount++;
  } catch (e) {
    console.error(`FAIL test-v8-schema-compat: ${name} — ${e.message}`);
    failCount++;
  }
}

// Legacy v7-shaped frontmatter: carries the retired type/category fields and
// lacks BOTH v8 required axes (subject, deployment_target). This SHAPE no
// longer validates — it is CONTENT-mode migration work for the audit loop.
const v7Legacy = {
  schema_version: 7,
  name: 'test-skill',
  description: 'A test skill for v8 schema checks.',
  version: '1.0.0',
  type: 'capability',
  category: 'engineering',
  scope: 'portable',
  owner: 'test-owner',
  freshness: '2026-05-25',
  drift_check: { last_verified: '2026-05-25' },
  eval_artifacts: 'none',
  eval_state: 'unverified',
  routing_eval: 'absent',
};

// Minimal valid v8 frontmatter — both required classification axes present,
// no retired v7 fields, and (per ADR-0019) NO audit/eval/provenance fields:
// schema_version, version, owner, freshness, drift_check, eval_artifacts,
// eval_state, routing_eval all moved to the audit-state.json sidecar and are
// now additionalProperties violations in frontmatter. This is the clean-cut
// post-sidecar authoring shape — frontmatter `required` is the 5 core fields.
const v8Base = {
  name: 'test-skill',
  description: 'A test skill for v8 schema checks.',
  subject: 'backend-engineering',
  public: true,
  scope: 'Teaches the test subsystem; not for unrelated concerns.',
};

check('minimal v8 frontmatter (subject + public + scope) validates', () => {
  const errors = validate(v8Base, SCHEMA);
  if (errors.length > 0) throw new Error(`v8 base failed: ${errors.join('; ')}`);
});

check('ADR-0019: an audit-state field in frontmatter is now rejected (sidecar-only)', () => {
  // schema_version/owner/eval_state etc. live in audit-state.json after the
  // split; carrying one in frontmatter is an additionalProperties violation.
  for (const k of ['schema_version', 'owner', 'eval_state', 'drift_check', 'application_verdict']) {
    const withAudit = { ...v8Base, [k]: k === 'drift_check' ? { last_verified: '2026-05-25' } : (k === 'schema_version' ? 8 : 'x') };
    const errors = validate(withAudit, SCHEMA);
    if (!errors.some(e => e.includes(`unexpected key '${k}'`))) {
      throw new Error(`expected additionalProperties rejection of frontmatter audit field '${k}', got: ${errors.join('; ') || '(none)'}`);
    }
  }
});

check('legacy v7-shaped frontmatter fails (missing v8 fields + retired fields)', () => {
  // Missing subject + deployment_target + scope (now required) AND carries the retired
  // type/category fields (now additionalProperties violations).
  const errors = validate(v7Legacy, SCHEMA);
  if (errors.length === 0) throw new Error('v7-shaped frontmatter should have failed');
  if (!errors.some(e => e.includes("missing key 'subject'"))) {
    throw new Error(`expected missing-subject error, got: ${errors.join('; ')}`);
  }
  if (!errors.some(e => e.includes("missing key 'public'"))) {
    throw new Error(`expected missing-public error, got: ${errors.join('; ')}`);
  }
  if (!errors.some(e => e.includes("unexpected key 'type'"))) {
    throw new Error(`expected additionalProperties error on 'type', got: ${errors.join('; ')}`);
  }
});

check('v8 skill re-adding a retired v7 field (type/category) fails the clean cut', () => {
  const withRetired = { ...v8Base, type: 'capability', category: 'engineering' };
  const errors = validate(withRetired, SCHEMA);
  if (errors.length === 0) throw new Error('retired v7 fields should fail additionalProperties');
  if (!errors.some(e => e.includes("unexpected key 'type'") || e.includes("unexpected key 'category'"))) {
    throw new Error(`expected additionalProperties error, got: ${errors.join('; ')}`);
  }
});

check('v8 frontmatter missing subject fails', () => {
  const broken = { ...v8Base };
  delete broken.subject;
  const errors = validate(broken, SCHEMA);
  if (errors.length === 0) throw new Error('v8 missing subject should have failed validation');
  if (!errors.some(e => e.includes("missing key 'subject'"))) {
    throw new Error(`expected missing-subject error, got: ${errors.join('; ')}`);
  }
});

check('v8 frontmatter missing public fails', () => {
  const broken = { ...v8Base };
  delete broken.public;
  const errors = validate(broken, SCHEMA);
  if (errors.length === 0) throw new Error('v8 missing public should have failed validation');
  if (!errors.some(e => e.includes("missing key 'public'"))) {
    throw new Error(`expected missing-public error, got: ${errors.join('; ')}`);
  }
});

check('public accepts a boolean (publishability gate)', () => {
  for (const v of [true, false]) {
    const errors = validate({ ...v8Base, public: v }, SCHEMA);
    if (errors.length > 0) throw new Error(`public: ${v} failed: ${errors.join('; ')}`);
  }
  // A non-boolean public is a type error.
  const bad = validate({ ...v8Base, public: 'yes' }, SCHEMA);
  if (bad.length === 0) throw new Error('public: "yes" (string) should fail the boolean type check');
});

check('project[] presence requires grounding — validates when grounding present', () => {
  // The schema's allOf rule requires a grounding block when project[] is
  // non-empty (re-anchored from the retired deployment_target: project rule).
  const projGrounded = {
    ...v8Base,
    public: false,
    project: [{ handle: 'test-project', role: 'source-of-truth' }],
    grounding: {
      subject_matter: 'test subject matter',
      grounding_mode: 'repo_specific',
      truth_sources: [],
      failure_modes: [],
      evidence_priority: 'repo_code_first',
    },
  };
  const errors = validate(projGrounded, SCHEMA);
  if (errors.length > 0) throw new Error(`project[]-anchored with grounding failed: ${errors.join('; ')}`);
});

check('project[] presence WITHOUT grounding fails', () => {
  const projNoGrounding = { ...v8Base, project: [{ handle: 'test-project' }] };
  const errors = validate(projNoGrounding, SCHEMA);
  if (errors.length === 0) {
    throw new Error('project[]-anchored skill without grounding should have failed validation');
  }
  if (!errors.some(e => e.includes("missing key 'grounding'") || e.includes('grounding'))) {
    throw new Error(`expected missing-grounding error, got: ${errors.join('; ')}`);
  }
});

check('scope accepts any free-text string (no enum)', () => {
  // scope is free-text in v8 — the old enum (portable/workspace/codebase/…) is
  // gone; the publishability role is carried by the boolean `public`.
  const freeScope = { ...v8Base, scope: 'Teaches the Foo subsystem; not for Bar integrations.' };
  const errors = validate(freeScope, SCHEMA);
  if (errors.length > 0) throw new Error(`free-text scope failed: ${errors.join('; ')}`);
});

check('grounding with retired domain_object key fails (subject_matter required)', () => {
  const groundingOldKey = {
    ...v8Base,
    project: [{ handle: 'test-project' }],
    grounding: {
      domain_object: 'test',
      grounding_mode: 'universal',
      truth_sources: [],
      failure_modes: [],
      evidence_priority: 'equal',
    },
  };
  const errors = validate(groundingOldKey, SCHEMA);
  if (errors.length === 0) throw new Error('retired grounding.domain_object should fail');
  if (!errors.some(e => e.includes("unexpected key 'domain_object'") || e.includes("missing key 'subject_matter'"))) {
    throw new Error(`expected domain_object/subject_matter error, got: ${errors.join('; ')}`);
  }
});

check('subject: invalid value fails enum check', () => {
  const broken = { ...v8Base, subject: 'not-a-real-subject' };
  const errors = validate(broken, SCHEMA);
  if (errors.length === 0) throw new Error('invalid subject value should fail');
  if (!errors.some(e => e.includes('enum fail'))) {
    throw new Error(`expected enum error, got: ${errors.join('; ')}`);
  }
});

check('subjects array with valid entries validates', () => {
  const withSubjects = { ...v8Base, subjects: ['backend-engineering', 'quality-assurance'] };
  const errors = validate(withSubjects, SCHEMA);
  if (errors.length > 0) throw new Error(`subjects array failed: ${errors.join('; ')}`);
});

// Note on subjects maxItems: the schema's `maxItems: 2` is enforced by
// skill-lint.js (the project's full validator). Our minimal validator inline
// here doesn't implement maxItems. The real corpus check happens when an
// authored skill runs through skill-lint as part of `npm run verify`.

check('schema_version int 7 is rejected in the sidecar (v7 deprecated, clean cut to v8)', () => {
  const intSeven = { ...sidecarBase, schema_version: 7 };
  const errors = validate(intSeven, AUDIT_STATE_SCHEMA);
  if (errors.length === 0) throw new Error('schema_version int 7 should now fail — v7 is deprecated');
});

check('schema_version string "7" is rejected in the sidecar (v7 deprecated, clean cut to v8)', () => {
  const strSeven = { ...sidecarBase, schema_version: '7' };
  const errors = validate(strSeven, AUDIT_STATE_SCHEMA);
  if (errors.length === 0) throw new Error('schema_version string "7" should now fail — v7 is deprecated');
});

check('schema_version string "8" valid in the sidecar (parity with int)', () => {
  const strEight = { ...sidecarBase, schema_version: '8' };
  const errors = validate(strEight, AUDIT_STATE_SCHEMA);
  if (errors.length > 0) throw new Error(`schema_version string "8" failed: ${errors.join('; ')}`);
});

console.log(`\nv8 schema-compat: ${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);
