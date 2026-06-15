#!/usr/bin/env node
'use strict';

/**
 * Test: receipt-path portability for public skills (SKI-356).
 *
 * A receipt persisted into a (publishable) skill sidecar must never carry an
 * absolute home-dir path, and must declare whether the ledger it references
 * actually ships with the public skill. Covers:
 *   - log-paths.relativizeReceiptPath  (no absolute leak)
 *   - log-paths.receiptVisibilityForPath (private-monorepo vs public vs unknown)
 *   - run-bidirectional-eval.toSidecarReceipt (applies both at the sidecar boundary)
 */

const assert = require('assert');
const path = require('path');
const { relativizeReceiptPath, receiptVisibilityForPath, WORKSPACE } = require('../../lib/audit/log-paths');
const { toSidecarReceipt } = require('../../lib/audit/run-bidirectional-eval');

let failures = 0;
function check(name, fn) {
  try { fn(); process.stdout.write(`  PASS  ${name}\n`); }
  catch (e) { failures += 1; process.stdout.write(`  FAIL  ${name}: ${e.message}\n`); }
}

// A merge-ledger path in monorepo-private scratch (the real shape observed in 3 corpus sidecars).
const privateLedger = path.join(WORKSPACE, 'skill-audit-loop', 'progress', 'skill-audits', 'demo', 'runs', '2026-06-13T1052--merge--opus--abc', 'demo.merge-ledger.json');

check('relativizeReceiptPath strips the absolute home-dir prefix', () => {
  const rel = relativizeReceiptPath(privateLedger);
  assert.ok(!path.isAbsolute(rel), 'must not be absolute');
  assert.ok(!rel.includes('/Users/'), 'must not leak a home-dir path');
  assert.ok(rel.includes('skill-audit-loop/progress'), 'keeps the workspace-relative location');
});

check('relativizeReceiptPath passes through a relative path unchanged', () => {
  assert.strictEqual(relativizeReceiptPath('runs/x/y.json'), 'runs/x/y.json');
});

check('relativizeReceiptPath collapses an escaping path to basename (no leak)', () => {
  const rel = relativizeReceiptPath('/etc/passwd');
  assert.strictEqual(rel, 'passwd');
});

check('receiptVisibilityForPath: monorepo scratch → private-monorepo', () => {
  assert.strictEqual(receiptVisibilityForPath(privateLedger), 'private-monorepo');
  assert.strictEqual(receiptVisibilityForPath('agent-orchestration/logs/eval-history.jsonl'), 'private-monorepo');
  assert.strictEqual(receiptVisibilityForPath('.opencode/progress/runs/x/ledger.json'), 'private-monorepo');
});

check('receiptVisibilityForPath: a skill-co-located eval-history artifact → public', () => {
  assert.strictEqual(receiptVisibilityForPath('skills/agent-ops/demo/eval-history/r.json'), 'public');
});

check('receiptVisibilityForPath: no path → unknown', () => {
  assert.strictEqual(receiptVisibilityForPath(null), 'unknown');
  assert.strictEqual(receiptVisibilityForPath(undefined), 'unknown');
});

check('toSidecarReceipt relativizes the ledger ref and stamps receipt_visibility', () => {
  const rec = toSidecarReceipt({
    frontier_pair: ['opus', 'gpt-5.5'],
    synthesized_verdict: 'PASS',
    merge_ledger_ref: privateLedger,
    directions: [],
  });
  assert.ok(!path.isAbsolute(rec.merge_ledger_ref), 'sidecar ledger ref must not be absolute');
  assert.ok(!rec.merge_ledger_ref.includes('/Users/'), 'sidecar ledger ref must not leak a home-dir path');
  assert.strictEqual(rec.receipt_visibility, 'private-monorepo', 'private ledger marked private-monorepo');
});

check('toSidecarReceipt marks a standalone (no ledger) receipt visibility unknown', () => {
  const rec = toSidecarReceipt({ frontier_pair: ['opus', 'gpt-5.5'], synthesized_verdict: 'UNVERIFIED', directions: [] });
  assert.strictEqual(rec.merge_ledger_ref, null);
  assert.strictEqual(rec.receipt_visibility, 'unknown');
});

if (failures > 0) {
  process.stderr.write(`\nFAIL test-receipt-path-portability: ${failures} failure(s)\n`);
  process.exit(1);
}
process.stdout.write('\nPASS test-receipt-path-portability: receipt paths are portable + visibility-labeled\n');
process.exit(0);
