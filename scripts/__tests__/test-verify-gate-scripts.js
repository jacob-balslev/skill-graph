#!/usr/bin/env node
//
// test-verify-gate-scripts.js — smoke tests for the two verify-chain
// scripts that had no unit tests (audit M10, 2026-05-27):
//   - scripts/build-status-doc.js
//   - scripts/check-audit-manifest.js
//
// Both ship in `npm run verify` (or its expanded chain), so a refactor
// that broke either was "run CI and pray." This test catches the
// regression class: syntax, require-time module resolution, and
// pure-function unit behavior of helpers that don't need a live tree.

'use strict';

const path = require('path');
const { spawnSync } = require('node:child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

let passCount = 0;
let failCount = 0;

function assert(label, condition, details = '') {
  if (condition) {
    passCount++;
    process.stdout.write(`  PASS  ${label}\n`);
  } else {
    failCount++;
    process.stderr.write(`  FAIL  ${label}\n`);
    if (details) process.stderr.write(`        ${details}\n`);
  }
}

// ── 1. build-status-doc.js ─────────────────────────────────────────
process.stdout.write('\n1. build-status-doc.js\n');
{
  const r = spawnSync('node', ['--check', path.join(REPO_ROOT, 'scripts', 'build-status-doc.js')], { encoding: 'utf8' });
  assert('  syntax check passes', r.status === 0, r.stderr.slice(0, 200));
}
{
  // Imports
  const mod = require(path.join(REPO_ROOT, 'scripts', 'build-status-doc.js'));
  assert('  exports readSchemaVersion', typeof mod.readSchemaVersion === 'function');
  assert('  exports readSkillCount', typeof mod.readSkillCount === 'function');
  assert('  exports renderMarkdown', typeof mod.renderMarkdown === 'function');
  assert('  exports runCheck', typeof mod.runCheck === 'function');
}
{
  // Schema version reader works
  const { readSchemaVersion } = require(path.join(REPO_ROOT, 'scripts', 'build-status-doc.js'));
  const v = readSchemaVersion();
  assert('  readSchemaVersion returns a non-empty value', !!v && (typeof v === 'string' || typeof v === 'number'), `got ${JSON.stringify(v)}`);
}
{
  // Render works against a hand-built state
  const { renderMarkdown } = require(path.join(REPO_ROOT, 'scripts', 'build-status-doc.js'));
  const state = {
    pkg: { name: '@skill-graph/cli', version: '0.0.0-test' },
    schema_version: 8,
    skill_count: '?',
    mirror_status: { skill_metadata_protocol: 'PASS', skill_audit_loop: 'PASS' },
    generated_at: '2026-05-27T00:00:00.000Z',
    checks: [
      { label: 'fake-check-a', status: 'PASS', exit_code: 0, duration_ms: 1, detail: '' },
      { label: 'fake-check-b', status: 'FAIL', exit_code: 1, duration_ms: 2, detail: 'something broke' },
    ],
  };
  const md = renderMarkdown(state);
  assert('  renderMarkdown emits something', typeof md === 'string' && md.length > 100);
  assert('  renderMarkdown includes schema_version', md.includes('8'));
  assert('  renderMarkdown includes a PASS check', md.includes('fake-check-a'));
  assert('  renderMarkdown includes a FAIL check', md.includes('fake-check-b'));
}

// ── 2. check-audit-manifest.js ────────────────────────────────────
process.stdout.write('\n2. check-audit-manifest.js\n');
{
  const r = spawnSync('node', ['--check', path.join(REPO_ROOT, 'scripts', 'check-audit-manifest.js')], { encoding: 'utf8' });
  assert('  syntax check passes', r.status === 0, r.stderr.slice(0, 200));
}
{
  // The script runs at require() time; spawn it as a subprocess with the real
  // manifest. Existing CONTENT debt (H10) keeps it RED; we only assert it
  // EXITS (not hangs / not panics) and emits a parseable summary.
  const r = spawnSync('node', [path.join(REPO_ROOT, 'scripts', 'check-audit-manifest.js')], {
    encoding: 'utf8',
    timeout: 20000,
  });
  assert('  exits with a status code', typeof r.status === 'number');
  const out = (r.stdout || '') + (r.stderr || '');
  assert('  emits some output', out.length > 0);
  // The script's documented failure mode is missing comprehension.json
  // artifacts — assert the verifier names the surface, so a future refactor
  // that silently drops the check is caught.
  const knownPhrases = ['comprehension', 'missing skills', 'audit', 'manifest'];
  const matched = knownPhrases.filter(p => out.toLowerCase().includes(p.toLowerCase()));
  assert('  output mentions audit-manifest concepts', matched.length >= 2, `matched: ${matched.join(', ')}`);
}

process.stdout.write(`\nResults: ${passCount} passed, ${failCount} failed\n`);
process.exit(failCount === 0 ? 0 : 1);
