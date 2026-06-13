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
const fs = require('fs');
const os = require('os');
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

// Extra args appended in the unknown-flag check (loop 2) for runners whose
// default (no-action) invocation does real, expensive work. batch-eval.js
// treats a bare invocation as "evaluate the whole corpus" — now that it
// resolves the configured skill library standalone-safely it actually finds
// skills and would spawn grader subprocesses, blowing the 15s timeout. The
// smoke test only verifies require/parse health, so --dry-run keeps that
// intent (discovery + arg-parse still run) without launching real evals.
const SAFE_EXTRA_ARGS = {
  'lib/audit/batch-eval.js': ['--dry-run'],
  // SH-6640: run-skill-improvement-loop.js now resolves the configured skill
  // library (instead of crashing on a missing .claude/skills), so a bare
  // invocation walks 158 skills + spawns grader subprocesses and blows the 15s
  // timeout — same situation as batch-eval.js above. --smoke-test runs preflight
  // + arg-parse (the require/parse health this test verifies) then exits before
  // the corpus walk.
  'lib/audit/run-skill-improvement-loop.js': ['--smoke-test'],
  // SH-6643: generate_evals now invokes the model IN-LOOP (option B) instead of
  // fast-failing on a missing dispatch-solver.js. A bare evolve run therefore reaches
  // a real model call and blows the 15s timeout — same execute-phase situation as the
  // two runners above. --analyze-only exercises the require/parse + analyze health this
  // test verifies (0.3s) without entering the execute phase.
  'lib/audit/skill-evolution-loop.js': ['--analyze-only'],
};

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
  const extra = SAFE_EXTRA_ARGS[rel] || [];
  const r = spawnSync('node', [path.join(REPO_ROOT, rel), '--no-such-flag-xyz', ...extra], {
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

// ── 3. Current eval artifact resolver for improve loop ───────────────
process.stdout.write('\n3. Improve loop accepts current eval artifact names\n');
{
  const { resolveImprovementEvalFile } = require('../../lib/audit/run-skill-improvement-loop');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'skill-improve-evals-'));
  const skillDir = path.join(tmp, 'demo-skill');
  const evalsDir = path.join(skillDir, 'evals');
  fs.mkdirSync(evalsDir, { recursive: true });

  assert('  no eval artifact returns null', resolveImprovementEvalFile(skillDir) === null);

  fs.writeFileSync(path.join(evalsDir, 'application.json'), '{}\n');
  let resolved = resolveImprovementEvalFile(skillDir);
  assert('  application-only artifact is detected as unsupported by legacy gate',
    resolved && resolved.kind === 'application' && resolved.unsupportedByLegacyGate === true,
    JSON.stringify(resolved));

  fs.writeFileSync(path.join(evalsDir, 'comprehension.json'), '{}\n');
  resolved = resolveImprovementEvalFile(skillDir);
  assert('  current comprehension.json is selected for the keep/revert gate',
    resolved && resolved.kind === 'comprehension' && resolved.path.endsWith('evals/comprehension.json'),
    JSON.stringify(resolved));

  fs.writeFileSync(path.join(evalsDir, 'evals.json'), '{}\n');
  resolved = resolveImprovementEvalFile(skillDir);
  assert('  legacy evals.json remains preferred when present',
    resolved && resolved.kind === 'legacy' && resolved.path.endsWith('evals/evals.json'),
    JSON.stringify(resolved));
}

process.stdout.write(`\nResults: ${passCount} passed, ${failCount} failed\n`);
process.exit(failCount === 0 ? 0 : 1);
