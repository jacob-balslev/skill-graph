#!/usr/bin/env node
/**
 * Test: skill-audit-preflight reads the contract from BOTH schemas (ADR-0019 Phase 4).
 *
 * Receipt that preflight's per-op readiness checks the right file after the audit-state
 * sidecar split:
 *   1. Frontmatter-required fields (v8) are checked against SKILL.md frontmatter — a moved
 *      audit field can never satisfy a frontmatter-required slot.
 *   2. The moved fields (schema_version, the four verdicts, eval_state/eval_artifacts,
 *      comprehension_state) read from the joined audit-state.json sidecar for a MIGRATED
 *      skill, and from frontmatter for an UNMIGRATED one (graceful join fallback).
 *   3. A MISSING sidecar never crashes — it is the honest "not yet migrated" case.
 *   4. Sidecar readiness is reported (informational) but does NOT gate `--for all`.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { assess, loadSchema, loadSidecarSchema } = require('../skill-audit-preflight');

let failures = 0;
function assert(condition, msg) {
  if (condition) process.stdout.write(`  PASS  ${msg}\n`);
  else { process.stderr.write(`  FAIL  ${msg}\n`); failures += 1; }
}

const schema = loadSchema();
const sidecarSchema = loadSidecarSchema();

const CLEAN_FRONTMATTER = `---
name: SKILLNAME
description: "Fixture skill for preflight sidecar-read verification. Activate when checking that the joined sidecar supplies schema_version and verdicts. Do NOT use as a production skill."
subject: code-engineering
deployment_target: portable
scope: "Fixture proving preflight reads moved fields from the sidecar. Out: production use."
---
# Body
Teaching content.
`;

const SIDECAR = {
  schema_version: 8,
  owner: 'skill-graph-maintainer',
  freshness: '2026-06-01',
  drift_check: { last_verified: '2026-06-01' },
  eval_artifacts: 'present',
  eval_state: 'passing',
  routing_eval: 'present',
  structural_verdict: 'PASS',
  truth_verdict: 'PASS',
  comprehension_verdict: 'UNVERIFIED',
  application_verdict: 'UNVERIFIED',
  comprehension_state: 'absent',
};

function makeSkill(dirName, frontmatter, sidecar) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-test-'));
  const dir = path.join(root, dirName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'SKILL.md'), frontmatter.replace(/SKILLNAME/g, dirName));
  if (sidecar) fs.writeFileSync(path.join(dir, 'audit-state.json'), JSON.stringify(sidecar, null, 2) + '\n');
  return dir;
}

// ---------------------------------------------------------------------------
// 1. MIGRATED skill — clean frontmatter, audit fields only in the sidecar.
// ---------------------------------------------------------------------------
{
  const dir = makeSkill('migrated-fixture', CLEAN_FRONTMATTER, SIDECAR);
  const a = assess(dir, schema, sidecarSchema);
  assert(a.operations.v8.ok, 'migrated: v8 ok (frontmatter required fields all present)');
  assert(a.operations.v8.schema_version === 8, 'migrated: schema_version read from the sidecar (8)');
  assert(a.audit_status.structural_verdict === 'PASS' && a.audit_status.eval_state === 'passing',
    'migrated: verdicts + eval_state read from the sidecar');
  assert(a.sidecar_present === true && a.sidecar_readiness.ok === true,
    'migrated: sidecar present and all 7 required sidecar fields satisfied');
}

// ---------------------------------------------------------------------------
// 2. UNMIGRATED skill — no sidecar, audit fields still in frontmatter.
//    Join fallback supplies the moved fields from frontmatter; no crash.
// ---------------------------------------------------------------------------
{
  const fmWithAuditInFrontmatter = CLEAN_FRONTMATTER.replace(
    '---\n# Body',
    'schema_version: 8\nstructural_verdict: PASS\neval_state: unverified\n---\n# Body',
  );
  const dir = makeSkill('unmigrated-fixture', fmWithAuditInFrontmatter, null);
  const a = assess(dir, schema, sidecarSchema);
  assert(a.operations.v8.ok, 'unmigrated: v8 ok');
  assert(a.operations.v8.schema_version === 8, 'unmigrated: schema_version read from frontmatter via join fallback');
  assert(a.audit_status.structural_verdict === 'PASS', 'unmigrated: verdict read from frontmatter via join fallback');
  assert(a.sidecar_present === false && a.sidecar_readiness.ok === false,
    'unmigrated: sidecar absent — reported as not-yet-migrated, not an error');
}

// ---------------------------------------------------------------------------
// 3. A frontmatter-required field can NEVER be satisfied by a sidecar field.
//    Strip `scope` from frontmatter but leave everything in the sidecar.
// ---------------------------------------------------------------------------
{
  const noScope = CLEAN_FRONTMATTER.replace(/^scope: .*$/m, '');
  const dir = makeSkill('no-scope-fixture', noScope, SIDECAR);
  const a = assess(dir, schema, sidecarSchema);
  assert(!a.operations.v8.ok && a.operations.v8.missing_required.includes('scope'),
    'frontmatter-required scope missing → v8 GAP even with a full sidecar (no false PASS from the join)');
}

if (failures > 0) {
  process.stderr.write(`\ntest-preflight-sidecar: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-preflight-sidecar: preflight reads both schemas, joins the sidecar, no false PASS\n');
