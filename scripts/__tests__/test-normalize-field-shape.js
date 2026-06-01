#!/usr/bin/env node
/**
 * Test: normalize-skill-field-shape — the frontmatter→sidecar MOVER (ADR-0019 Phase 4)
 * + the version-agnostic mechanical-default normalizer (Decision B).
 *
 * Receipt that the tool honors the SYSTEM/CONTENT + two-file split:
 *   1. classify() separates RELOCATE (sidecar-owned fields in frontmatter) from MECHANICAL
 *      gaps (sidecar-required defaultable fields absent everywhere), SEMANTIC debt
 *      (frontmatter + sidecar required with no honest default), and schema-unknown (retired).
 *   2. applyToText() strips the relocated audit fields from frontmatter, injects the
 *      `# semantic-debt:` marker when debt remains, NEVER bumps schema_version, and leaves
 *      the body untouched.
 *   3. buildSidecarPatch() carries the relocated values (faithfully — drift_check stays an
 *      object) + mechanical defaults; schema_version moves by VALUE, never bumped.
 *   4. AC integration: --apply on a fully-populated skill yields a frontmatter-lint-clean
 *      SKILL.md (0 errors) + a sidecar-lint-clean audit-state.json (0 errors).
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const {
  classify, applyToText, applyToSkill, buildSidecarPatch, stripFieldsFromBlock,
  loadSchemas, MECHANICAL_DEFAULTS,
} = require('../normalize-skill-field-shape');
const { normalizeFrontmatter } = require('../lib/parse-frontmatter');
const { parseFrontmatter } = require('../lib/parse-frontmatter');

let failures = 0;
function assert(condition, msg) {
  if (condition) process.stdout.write(`  PASS  ${msg}\n`);
  else { process.stderr.write(`  FAIL  ${msg}\n`); failures += 1; }
}

const SCHEMAS = loadSchemas(); // real frontmatter + sidecar schemas — faithful, not hand-rolled

// ---------------------------------------------------------------------------
// 1. classify — relocate vs mechanical vs semantic vs schema-unknown.
//    Unmigrated skill: audit fields live in frontmatter; scope (frontmatter-required)
//    missing; owner/freshness/drift_check (sidecar-required, no default) missing too.
// ---------------------------------------------------------------------------
const unmigrated = `---
schema_version: 8
name: fixture
description: "x"
subject: meta-methods
deployment_target: portable
structural_verdict: PASS
retired_field: legacy
---
# Body
Real teaching content here.
`;
{
  const c = classify(unmigrated, SCHEMAS, null);
  assert(c.auditFieldsInFrontmatter.includes('schema_version') && c.auditFieldsInFrontmatter.includes('structural_verdict'),
    'classify: sidecar-owned fields in frontmatter are flagged for RELOCATE');
  assert(!c.auditFieldsInFrontmatter.includes('name') && !c.auditFieldsInFrontmatter.includes('subject'),
    'classify: frontmatter-owned fields are NOT relocated');
  assert(c.frontmatterSemanticDebt.includes('scope'),
    'classify: missing scope is frontmatter SEMANTIC debt (no honest default)');
  assert(c.sidecarSemanticDebt.includes('owner') && c.sidecarSemanticDebt.includes('freshness') && c.sidecarSemanticDebt.includes('drift_check'),
    'classify: missing owner/freshness/drift_check are sidecar SEMANTIC debt');
  assert(c.sidecarMechanicalGaps.includes('eval_artifacts') && c.sidecarMechanicalGaps.includes('eval_state') && c.sidecarMechanicalGaps.includes('routing_eval'),
    'classify: missing eval_artifacts/eval_state/routing_eval are MECHANICAL (fillable in the sidecar)');
  assert(c.schemaUnknown.includes('retired_field'),
    'classify: a schema-unknown field is flagged (review for removal)');
  assert(c.schemaVersion === 8, 'classify: surfaces the current schema_version');
}

// A field already in the sidecar is neither relocate nor gap.
{
  const fmOnlyScopeMissing = `---
name: fixture
description: "x"
subject: meta-methods
deployment_target: portable
scope: "teaches X; not Y"
---
body
`;
  const sidecar = { eval_artifacts: 'none', eval_state: 'unverified', routing_eval: 'absent', owner: 'me', freshness: '2026-06-01', drift_check: { last_verified: '2026-06-01' }, schema_version: 8 };
  const c = classify(fmOnlyScopeMissing, SCHEMAS, sidecar);
  assert(c.auditFieldsInFrontmatter.length === 0, 'classify: nothing to relocate when frontmatter is clean');
  assert(c.sidecarMechanicalGaps.length === 0, 'classify: no mechanical gap when the sidecar already supplies the field');
  assert(c.frontmatterSemanticDebt.length === 0 && c.sidecarSemanticDebt.length === 0,
    'classify: a complete two-file skill reports zero semantic debt');
}

// ---------------------------------------------------------------------------
// 2 + 3. applyToText strips audit fields, marks semantic debt, never bumps
//        schema_version, preserves body; buildSidecarPatch carries the values.
// ---------------------------------------------------------------------------
{
  const c = classify(unmigrated, SCHEMAS, null);
  const { text, changed } = applyToText(unmigrated, c);
  assert(changed, 'applyToText: reports changed when there are audit fields to relocate');
  assert(!/^schema_version:/m.test(text) && !/^structural_verdict:/m.test(text),
    'applyToText: strips the relocated audit fields from frontmatter');
  assert(/^name: fixture$/m.test(text) && /^subject: meta-methods$/m.test(text),
    'applyToText: leaves frontmatter-owned fields in place');
  assert(/# semantic-debt: scope/.test(text) && /owner/.test(text.match(/# semantic-debt:.*/)[0]),
    'applyToText: injects the semantic-debt marker covering frontmatter + sidecar debt');
  assert(/retired_field: legacy/.test(text),
    'applyToText: NEVER removes a schema-unknown field deterministically');
  assert(/Real teaching content here\./.test(text), 'applyToText: leaves the body untouched');

  const patch = buildSidecarPatch(normalizeFrontmatter(parseFrontmatter(unmigrated)), c);
  assert(patch.schema_version === 8, 'buildSidecarPatch: schema_version carried by VALUE (8 — not bumped)');
  assert(patch.structural_verdict === 'PASS', 'buildSidecarPatch: relocated verdict value carried faithfully');
  assert(patch.eval_state === 'unverified' && patch.routing_eval === 'absent',
    'buildSidecarPatch: mechanical defaults filled into the sidecar (not frontmatter)');
}

// stripFieldsFromBlock handles the NESTED metadata: encoding (indent 2).
{
  const nested = `metadata:
  name: fixture
  schema_version: 8
  drift_check:
    last_verified: "2026-06-01"
  subject: meta-methods`;
  const stripped = stripFieldsFromBlock(nested, ['schema_version', 'drift_check']);
  assert(!/schema_version:/.test(stripped) && !/last_verified:/.test(stripped),
    'stripFieldsFromBlock: removes a nested key AND its deeper-indented block body');
  assert(/name: fixture/.test(stripped) && /subject: meta-methods/.test(stripped),
    'stripFieldsFromBlock: preserves sibling keys around the stripped block');
}

// MECHANICAL_DEFAULTS must never contain a semantic field (defensive contract guard).
assert(!('scope' in MECHANICAL_DEFAULTS) && !('subject' in MECHANICAL_DEFAULTS) &&
       !('deployment_target' in MECHANICAL_DEFAULTS) && !('freshness' in MECHANICAL_DEFAULTS) &&
       !('owner' in MECHANICAL_DEFAULTS) && !('drift_check' in MECHANICAL_DEFAULTS),
  'MECHANICAL_DEFAULTS never includes a semantic field (scope/subject/deployment_target/freshness/owner/drift_check)');

// ---------------------------------------------------------------------------
// 4. AC integration — --apply on a fully-populated skill yields lint-clean both files.
// ---------------------------------------------------------------------------
{
  const REPO = path.resolve(__dirname, '..', '..');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mover-ac-'));
  const dir = path.join(root, 'mover-fixture');
  fs.mkdirSync(dir, { recursive: true });
  // Fully-populated skill: clean frontmatter + a complete audit block (all 7 sidecar-required
  // fields present) so relocation alone produces a sidecar-lint-clean audit-state.json.
  const skill = `---
name: mover-fixture
description: "Use as a fixture for the ADR-0019 mover AC integration test. Activate when verifying that --apply relocates audit fields to the sidecar and both files lint clean. Do NOT use as a production skill."
subject: code-engineering
deployment_target: portable
scope: "Fixture proving the mover produces lint-clean frontmatter + sidecar. Out: production use."
license: Apache-2.0
schema_version: 8
owner: skill-graph-maintainer
freshness: "2026-06-01"
drift_check:
  last_verified: "2026-06-01"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
structural_verdict: UNVERIFIED
truth_verdict: UNVERIFIED
comprehension_verdict: UNVERIFIED
application_verdict: UNVERIFIED
---

# Mover Fixture

Capability body for the AC integration test.

## When to use

When verifying the mover.

## How

Run --apply.

## Do NOT use when

You need a production skill.
`;
  const mdPath = path.join(dir, 'SKILL.md');
  fs.writeFileSync(mdPath, skill);
  const rawBefore = fs.readFileSync(mdPath, 'utf8');
  const r = applyToSkill(mdPath, rawBefore, SCHEMAS);

  assert(r.sidecar_written && r.frontmatter_changed, 'AC: --apply wrote the sidecar and rewrote the frontmatter');

  const after = fs.readFileSync(mdPath, 'utf8');
  assert(!/^schema_version:/m.test(after) && !/^eval_state:/m.test(after) && !/^structural_verdict:/m.test(after),
    'AC: no audit fields remain in the migrated frontmatter');

  const sidecar = JSON.parse(fs.readFileSync(path.join(dir, 'audit-state.json'), 'utf8'));
  assert(sidecar.schema_version === 8 && sidecar.owner === 'skill-graph-maintainer' && sidecar.drift_check.last_verified === '2026-06-01',
    'AC: sidecar carries the relocated values (schema_version by value, drift_check as an object)');

  // Lint both files via the real linter (0 errors = lint-clean; warnings are the floor, allowed).
  let lintOut = '';
  try {
    lintOut = execFileSync('node', [path.join(REPO, 'scripts', 'skill-lint.js'), mdPath], { encoding: 'utf8', cwd: REPO });
  } catch (e) {
    lintOut = (e.stdout || '') + (e.stderr || '');
  }
  assert(/0 error\(s\)/.test(lintOut),
    `AC: migrated SKILL.md + audit-state.json lint clean (0 errors). Got: ${lintOut.trim().split('\n').pop()}`);

  fs.rmSync(root, { recursive: true, force: true });
}

if (failures > 0) {
  process.stderr.write(`\ntest-normalize-field-shape: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-normalize-field-shape: frontmatter→sidecar mover relocates + fills mechanical, never authors semantics\n');
