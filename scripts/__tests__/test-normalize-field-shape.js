#!/usr/bin/env node
/**
 * Test: normalize-skill-field-shape (Step 6 — Decision B deterministic codemod).
 *
 * Receipt that the field-shape normalizer honors the SYSTEM/CONTENT split GPT-5.4
 * insisted on:
 *   1. classify() reports MECHANICAL gaps (defaultable fields) separately from
 *      SEMANTIC debt (scope/subject/etc. — no honest default) and schema-unknown
 *      (retired) fields.
 *   2. applyToText() fills ONLY mechanical defaults and injects the explicit
 *      `# semantic-debt:` marker when semantic debt remains.
 *   3. It NEVER bumps schema_version and NEVER authors a semantic field — the
 *      "codemod becomes a semantic author" failure mode is structurally impossible.
 *   4. The body is untouched.
 */

'use strict';

const { classify, applyToText, MECHANICAL_DEFAULTS } = require('../normalize-skill-field-shape');

let failures = 0;
function assert(condition, msg) {
  if (condition) process.stdout.write(`  PASS  ${msg}\n`);
  else { process.stderr.write(`  FAIL  ${msg}\n`); failures += 1; }
}

// Minimal hermetic schema mirroring the v8 required set + a couple of properties.
const SCHEMA = {
  required: ['schema_version', 'name', 'subject', 'scope', 'eval_state', 'routing_eval'],
  properties: {
    schema_version: {}, name: {}, subject: {}, scope: {},
    eval_state: {}, routing_eval: {}, eval_artifacts: {}, description: {},
    structural_verdict: {}, truth_verdict: {}, comprehension_verdict: {}, application_verdict: {},
  },
};

// ---------------------------------------------------------------------------
// 1. classify — mechanical vs semantic vs schema-unknown.
// ---------------------------------------------------------------------------
const skillMissingMechanicalAndSemantic = `---
schema_version: 7
name: fixture
subject: meta-methods
retired_field: legacy
---
# Body
Real teaching content here.
`;
{
  const c = classify(skillMissingMechanicalAndSemantic, SCHEMA);
  assert(c.mechanicalFillable.includes('eval_state') && c.mechanicalFillable.includes('routing_eval'),
    'classify: missing eval_state/routing_eval are MECHANICAL (defaultable)');
  assert(c.semanticDebt.includes('scope'),
    'classify: missing scope is SEMANTIC debt (no honest default)');
  assert(!c.mechanicalFillable.includes('scope'),
    'classify: scope is NEVER classified as mechanically fillable');
  assert(c.schemaUnknown.includes('retired_field'),
    'classify: a schema-unknown field is flagged (review for removal)');
  assert(c.schemaVersion === 7, 'classify: surfaces the current schema_version');
}

// A complete skill (all required present) yields no work.
const completeSkill = `---
schema_version: 8
name: fixture
subject: meta-methods
scope: Teaches X; does not teach Y.
eval_state: unverified
routing_eval: absent
---
body
`;
{
  const c = classify(completeSkill, SCHEMA);
  assert(c.mechanicalFillable.length === 0 && c.semanticDebt.length === 0 && c.schemaUnknown.length === 0,
    'classify: a fully-shaped skill reports zero work');
}

// ---------------------------------------------------------------------------
// 2 + 3 + 4. applyToText — fills mechanical, marks semantic debt, NEVER bumps
//            schema_version, NEVER authors scope, preserves body.
// ---------------------------------------------------------------------------
{
  const c = classify(skillMissingMechanicalAndSemantic, SCHEMA);
  const { text, changed } = applyToText(skillMissingMechanicalAndSemantic, c);
  assert(changed, 'applyToText: reports changed when there is mechanical/semantic work');
  assert(/^eval_state: unverified$/m.test(text) && /^routing_eval: absent$/m.test(text),
    'applyToText: fills mechanical defaults (eval_state/routing_eval)');
  assert(/# semantic-debt: scope/.test(text),
    'applyToText: injects the explicit semantic-debt marker for scope');
  assert(!/^scope:/m.test(text),
    'applyToText: NEVER authors a value for the semantic field scope');
  assert(/schema_version: 7/.test(text) && !/schema_version: 8/.test(text),
    'applyToText: NEVER bumps schema_version (stays 7 — earned, not bumped)');
  assert(/Real teaching content here\./.test(text),
    'applyToText: leaves the body untouched');
}

// A skill with ONLY semantic debt (no mechanical gaps) still gets the marker but
// no field fills.
const onlySemantic = `---
schema_version: 8
name: fixture
subject: meta-methods
eval_state: unverified
routing_eval: absent
---
body
`;
{
  const c = classify(onlySemantic, SCHEMA);
  const { text } = applyToText(onlySemantic, c);
  assert(/# semantic-debt: scope/.test(text), 'applyToText: marker injected for scope-only debt');
  const svCount = (text.match(/schema_version:/g) || []).length;
  assert(svCount === 1 && /schema_version: 8/.test(text),
    'applyToText: schema_version untouched (exactly one, still 8)');
}

// MECHANICAL_DEFAULTS must never contain a semantic field (defensive contract guard).
assert(!('scope' in MECHANICAL_DEFAULTS) && !('subject' in MECHANICAL_DEFAULTS) &&
       !('deployment_target' in MECHANICAL_DEFAULTS) && !('freshness' in MECHANICAL_DEFAULTS),
  'MECHANICAL_DEFAULTS never includes a semantic field (scope/subject/deployment_target/freshness)');

if (failures > 0) {
  process.stderr.write(`\ntest-normalize-field-shape: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-normalize-field-shape: deterministic shape migrator stays mechanical-only\n');
