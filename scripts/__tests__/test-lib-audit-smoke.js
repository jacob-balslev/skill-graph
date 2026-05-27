#!/usr/bin/env node
//
// test-lib-audit-smoke.js — smoke tests for the seven previously untested
// lib/audit/* runners (audit M9, 2026-05-27).
//
// These are NOT full unit tests — they assert each runner is syntactically
// loadable + does not crash with "Cannot find module" / SyntaxError when
// invoked with `--no-such-flag-xyz`. They are spawned as subprocesses
// (not require()'d) because most runners call main() at load time and
// process.exit() would kill the test if we required them in-process.
//
// Full per-runner unit coverage is the next ticket; this catches the
// "runner refactor silently broke its require()" regression class.

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

const RUNNERS = [
  'lib/audit/run-skill-improvement-loop.js',
  'lib/audit/skill-evolution-loop.js',
  'lib/audit/skill-status.js',
  'lib/audit/eval-staleness-checker.js',
  'lib/audit/batch-eval.js',
  'lib/audit/eval-linter.js',
  'lib/audit/skill-test-runner.js',
];

// ── 1. node --check (syntax / immediate require failure) ────────────
process.stdout.write('\n1. Syntax check via `node --check`\n');
for (const rel of RUNNERS) {
  const r = spawnSync('node', ['--check', path.join(REPO_ROOT, rel)], {
    encoding: 'utf8',
    timeout: 5000,
  });
  assert(`  ${rel} parses without SyntaxError`, r.status === 0, r.stderr.slice(0, 300));
}

// ── 2. Invocation with `--no-such-flag-xyz` doesn't panic on module/parse ──
process.stdout.write('\n2. Unknown-flag invocation does not panic with require/parse errors\n');
for (const rel of RUNNERS) {
  const r = spawnSync('node', [path.join(REPO_ROOT, rel), '--no-such-flag-xyz'], {
    encoding: 'utf8',
    timeout: 15000,
  });
  // Acceptance: process started and returned a status (any status), and
  // did NOT crash with "Cannot find module" / parser-level errors that
  // node --check wouldn't catch (runtime require() of a sibling).
  const crashy = (r.stderr || '').includes('Cannot find module')
    || (r.stderr || '').includes('UnhandledPromiseRejection')
    || (r.stderr || '').includes('TypeError: Cannot read')
    || r.error;
  assert(
    `  ${rel} did not panic on unknown flag`,
    !crashy,
    (r.stderr || '').slice(0, 300),
  );
}

process.stdout.write(`\nResults: ${passCount} passed, ${failCount} failed\n`);
process.exit(failCount === 0 ? 0 : 1);
