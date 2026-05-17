#!/usr/bin/env node
/**
 * Tests for migrate-skill-v3-to-v4.js CLI safety surface.
 *
 * Verifies exit codes and flag behaviour without touching migration logic.
 * Uses spawnSync so each test is fully isolated from the current process.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'migrate-skill-v3-to-v4.js');

// ---------------------------------------------------------------------------
// Minimal v3 SKILL.md fixture (has a field to migrate: browse_category).
// ---------------------------------------------------------------------------
const V3_FIXTURE = `---
schema_version: 3
name: test-skill
browse_category: Testing
---
# Test Skill
`;

// A skill that is already v4 — nothing to migrate.
const V4_FIXTURE = `---
schema_version: 4
name: test-skill
category: Testing
---
# Test Skill
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(args, env) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v3-to-v4-test-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeFixture(dir, content) {
  const skillDir = path.join(dir, 'test-skill');
  fs.mkdirSync(skillDir, { recursive: true });
  const skillMd = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(skillMd, content, 'utf8');
  return skillMd;
}

// ---------------------------------------------------------------------------
// Test harness
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    process.stdout.write(`PASS migrate-skill-v3-to-v4: ${label}\n`);
    passed++;
  } catch (err) {
    process.stderr.write(`FAIL migrate-skill-v3-to-v4: ${label}\n  ${err.message}\n`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// ---------------------------------------------------------------------------
// Test 1: --help exits 0, prints usage, writes nothing.
// ---------------------------------------------------------------------------
test('--help exits 0 and prints usage', () => {
  withTempDir(dir => {
    const result = run(['--help']);
    assert(result.status === 0, `expected exit 0, got ${result.status}`);
    assert(result.stdout.includes('Usage:'), `expected "Usage:" in stdout, got: ${result.stdout}`);
  });
});

// ---------------------------------------------------------------------------
// Test 2: No args exits 1 with error message.
// ---------------------------------------------------------------------------
test('no args exits 1 with error', () => {
  const result = run([]);
  assert(result.status === 1, `expected exit 1, got ${result.status}`);
  assert(
    result.stderr.includes('must specify') || result.stderr.includes('ERROR'),
    `expected error in stderr, got: ${result.stderr}`
  );
});

// ---------------------------------------------------------------------------
// Test 3: --skill <nonexistent> exits 1.
// ---------------------------------------------------------------------------
test('--skill <nonexistent> exits 1', () => {
  const result = run(['--skill', 'does-not-exist-skill-xyz']);
  assert(result.status === 1, `expected exit 1, got ${result.status}`);
});

// ---------------------------------------------------------------------------
// Test 4: --all --dry-run exits 0, reports 0 files (already v4 or empty).
// ---------------------------------------------------------------------------
test('--all --dry-run exits 0, reports 0 files (already v4)', () => {
  // --all scans the repo's skills/ dir which is empty / does not exist in
  // the skill-graph repo itself — all skills are already v4 or above.
  const result = run(['--all', '--dry-run']);
  assert(
    result.status === 0,
    `expected exit 0, got ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
  );
  assert(
    result.stdout.includes('0 file(s)'),
    `expected "0 file(s)" in output, got: ${result.stdout}`
  );
});

// ---------------------------------------------------------------------------
// Test 5: --dry-run with a v3 file exits 0 and prints WOULD, not OK.
// ---------------------------------------------------------------------------
test('--dry-run shows WOULD and exits 0 for a v3 file', () => {
  withTempDir(dir => {
    const skillMd = writeFixture(dir, V3_FIXTURE);
    // Pass the file directly as a positional argument.
    const result = run(['--dry-run', skillMd]);
    assert(result.status === 0, `expected exit 0, got ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
    assert(result.stdout.includes('WOULD'), `expected "WOULD" in stdout, got: ${result.stdout}`);
    assert(!result.stdout.includes('OK    '), `expected no "OK" writes in dry-run mode, got: ${result.stdout}`);
    // Verify the file was NOT modified.
    const afterContent = fs.readFileSync(skillMd, 'utf8');
    assert(afterContent === V3_FIXTURE, 'dry-run must not write the file');
  });
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
process.stdout.write(`\nmigrate-skill-v3-to-v4: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
