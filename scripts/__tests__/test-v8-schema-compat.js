#!/usr/bin/env node
/**
 * Test: v7→v8 schema compatibility window.
 *
 * Guards the v8 introduction of the 5-axis classification model (subject,
 * subjects, operation, scope with project/workspace) against regressing v7
 * frontmatter, and verifies the new v8-required-fields allOf rule fires.
 *
 * Per the v7→v8 restructure plan (compatibility mode landing):
 *   - v7 frontmatter (current 147-skill corpus) validates unchanged.
 *   - v8 frontmatter requires subject + operation in addition to v7 fields.
 *   - scope: project|workspace validates alongside codebase|reference|portable
 *     during the migration window.
 *   - subjects[0] must equal subject when both are present.
 *
 * See docs/adr/0017-five-axis-classification-model.md (planned).
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..', '..');
const SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'skill.schema.json');
const SCHEMA = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

// Reimplement a minimal JSON Schema validator inline — it only needs to handle
// the subset the skill.schema.json uses: type, enum, required,
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

// Minimal valid v7 frontmatter (the current shape).
const v7Base = {
  schema_version: 7,
  name: 'test-skill',
  description: 'A test skill for v7→v8 compat checks. Use when verifying schema validation. Do NOT use for production.',
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

// Minimal valid v8 frontmatter (carries BOTH v7 and v8 fields during compat window).
const v8Base = {
  ...v7Base,
  schema_version: 8,
  subject: 'code-engineering',
  operation: 'know',
};

check('v7 frontmatter validates unchanged', () => {
  const errors = validate(v7Base, SCHEMA);
  if (errors.length > 0) throw new Error(`v7 base failed: ${errors.join('; ')}`);
});

check('v8 frontmatter with subject+operation validates', () => {
  const errors = validate(v8Base, SCHEMA);
  if (errors.length > 0) throw new Error(`v8 base failed: ${errors.join('; ')}`);
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

check('v8 frontmatter missing operation fails', () => {
  const broken = { ...v8Base };
  delete broken.operation;
  const errors = validate(broken, SCHEMA);
  if (errors.length === 0) throw new Error('v8 missing operation should have failed validation');
  if (!errors.some(e => e.includes("missing key 'operation'"))) {
    throw new Error(`expected missing-operation error, got: ${errors.join('; ')}`);
  }
});

check('scope: project validates when grounding present (v8 rename)', () => {
  // SH-6550: scope: project now requires grounding (parity with v7 scope: codebase).
  // The schema's allOf rule was updated 2026-05-26 to require grounding on BOTH
  // scope: codebase (v7) and scope: project (v8) — the docs always claimed this;
  // the schema rule was missing the v8 alias before this fix.
  const v8Project = {
    ...v8Base,
    scope: 'project',
    grounding: {
      domain_object: 'test',
      grounding_mode: 'repo_specific',
      truth_sources: [],
      failure_modes: [],
      evidence_priority: 'repo_code_first',
    },
  };
  const errors = validate(v8Project, SCHEMA);
  if (errors.length > 0) throw new Error(`scope:project with grounding failed: ${errors.join('; ')}`);
});

check('scope: project WITHOUT grounding fails (v8 parity with v7 codebase)', () => {
  // SH-6550: the inverse — scope: project without grounding must now FAIL,
  // matching the existing v7 scope: codebase behavior.
  const v8ProjectNoGrounding = { ...v8Base, scope: 'project' };
  delete v8ProjectNoGrounding.grounding;
  const errors = validate(v8ProjectNoGrounding, SCHEMA);
  if (errors.length === 0) {
    throw new Error('scope:project without grounding should have failed validation (SH-6550)');
  }
  if (!errors.some(e => e.includes("missing key 'grounding'") || e.includes('grounding'))) {
    throw new Error(`expected missing-grounding error, got: ${errors.join('; ')}`);
  }
});

check('scope: workspace validates (v8 rename)', () => {
  const v8Workspace = { ...v8Base, scope: 'workspace' };
  const errors = validate(v8Workspace, SCHEMA);
  if (errors.length > 0) throw new Error(`scope:workspace failed: ${errors.join('; ')}`);
});

check('scope: codebase still validates (v7 backcompat)', () => {
  const v7Codebase = {
    ...v7Base,
    scope: 'codebase',
    grounding: {
      domain_object: 'test',
      grounding_mode: 'universal',
      truth_sources: [],
      failure_modes: [],
      evidence_priority: 'equal',
    },
  };
  const errors = validate(v7Codebase, SCHEMA);
  if (errors.length > 0) throw new Error(`scope:codebase failed: ${errors.join('; ')}`);
});

check('subject: invalid value fails enum check', () => {
  const broken = { ...v8Base, subject: 'not-a-real-subject' };
  const errors = validate(broken, SCHEMA);
  if (errors.length === 0) throw new Error('invalid subject value should fail');
  if (!errors.some(e => e.includes('enum fail'))) {
    throw new Error(`expected enum error, got: ${errors.join('; ')}`);
  }
});

check('operation: invalid value fails enum check', () => {
  const broken = { ...v8Base, operation: 'execute' };
  const errors = validate(broken, SCHEMA);
  if (errors.length === 0) throw new Error('invalid operation value should fail');
});

check('subjects array with valid entries validates', () => {
  const withSubjects = { ...v8Base, subject: 'code-engineering', subjects: ['code-engineering', 'quality-assurance'] };
  const errors = validate(withSubjects, SCHEMA);
  if (errors.length > 0) throw new Error(`subjects array failed: ${errors.join('; ')}`);
});

// Note on subjects maxItems: the schema's `maxItems: 2` is enforced by
// skill-lint.js (the project's full validator). Our minimal validator inline
// here doesn't implement maxItems. The real corpus check happens when an
// authored skill runs through skill-lint as part of `npm run verify`.

check('v7 schema_version string "7" still valid (back-compat)', () => {
  const v7Str = { ...v7Base, schema_version: '7' };
  const errors = validate(v7Str, SCHEMA);
  if (errors.length > 0) throw new Error(`schema_version string "7" failed: ${errors.join('; ')}`);
});

check('v8 schema_version string "8" valid (parity with v7)', () => {
  const v8Str = { ...v8Base, schema_version: '8' };
  const errors = validate(v8Str, SCHEMA);
  if (errors.length > 0) throw new Error(`schema_version string "8" failed: ${errors.join('; ')}`);
});

console.log(`\nv8 schema-compat: ${passCount} passed, ${failCount} failed`);
process.exit(failCount > 0 ? 1 : 0);
