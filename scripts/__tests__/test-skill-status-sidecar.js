#!/usr/bin/env node
/**
 * Test: skill-status extractHealthBlock reads the audit-state sidecar (ADR-0019 Phase 4).
 *
 * Receipt that the read-only Health Block view joins the sidecar after the cut:
 *   1. A MIGRATED skill (clean frontmatter, verdicts only in the sidecar) surfaces the
 *      Health Block fields from the sidecar.
 *   2. Frontmatter wins on a mid-migration collision (mirrors joinSidecar) — a field still
 *      present in frontmatter takes precedence over the sidecar copy.
 *   3. A NULL/absent sidecar (unmigrated/new) contributes nothing and never crashes; the
 *      pre-cut frontmatter blocks (top-level / metadata / audit_state) still resolve.
 */

'use strict';

const { extractHealthBlock } = require('../../lib/audit/skill-status');

let failures = 0;
function assert(condition, msg) {
  if (condition) process.stdout.write(`  PASS  ${msg}\n`);
  else { process.stderr.write(`  FAIL  ${msg}\n`); failures += 1; }
}

// 1. Migrated: frontmatter has no audit fields; the sidecar carries them.
{
  const fm = { name: 'migrated', subject: 'backend-engineering' };
  const sidecar = {
    structural_verdict: 'PASS', truth_verdict: 'PASS',
    comprehension_verdict: 'UNVERIFIED', application_verdict: 'APPLICABLE',
    eval_score: 4.2, freshness: '2026-06-01', last_audited: '2026-06-01',
  };
  const hb = extractHealthBlock(fm, sidecar);
  assert(hb.structural_verdict === 'PASS' && hb.application_verdict === 'APPLICABLE',
    'migrated: verdicts read from the sidecar');
  assert(hb.eval_score === 4.2 && hb.freshness === '2026-06-01',
    'migrated: eval_score + freshness read from the sidecar');
}

// 2. Mid-migration collision: frontmatter copy wins over the sidecar copy.
{
  const fm = { structural_verdict: 'FAIL' };
  const sidecar = { structural_verdict: 'PASS', truth_verdict: 'PASS' };
  const hb = extractHealthBlock(fm, sidecar);
  assert(hb.structural_verdict === 'FAIL', 'collision: frontmatter wins (mirrors joinSidecar)');
  assert(hb.truth_verdict === 'PASS', 'collision: non-colliding sidecar field still read');
}

// 3. Null sidecar (unmigrated): pre-cut frontmatter blocks still resolve, no crash.
{
  const fm = { audit_state: { structural_verdict: 'PASS' }, metadata: { truth_verdict: 'DRIFT' } };
  const hb = extractHealthBlock(fm, null);
  assert(hb.structural_verdict === 'PASS', 'null sidecar: audit_state block still read');
  assert(hb.truth_verdict === 'DRIFT', 'null sidecar: metadata block still read');
}

// 3b. Undefined sidecar arg (back-compat single-arg call) does not throw.
{
  let threw = false;
  try { extractHealthBlock({ structural_verdict: 'PASS' }); } catch (_) { threw = true; }
  assert(!threw, 'extractHealthBlock tolerates a missing sidecar argument (back-compat)');
}

if (failures > 0) {
  process.stderr.write(`\ntest-skill-status-sidecar: ${failures} assertion(s) FAILED\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-skill-status-sidecar: Health Block view joins the audit-state sidecar\n');
