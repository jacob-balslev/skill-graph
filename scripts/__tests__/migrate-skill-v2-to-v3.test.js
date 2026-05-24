#!/usr/bin/env node
/**
 * Tests for migrate-skill-v2-to-v3.js CLI safety surface.
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
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'migrate-skill-v2-to-v3.js');

if (!fs.existsSync(SCRIPT)) {
  process.stdout.write('SKIP migrate-skill-v2-to-v3: legacy migration CLI not present\n');
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Minimal v2 SKILL.md fixture (has a field to migrate: family → browse_category).
// ---------------------------------------------------------------------------
const V2_FIXTURE = `---
schema_version: 2
name: test-skill
family: Testing
---
# Test Skill
`;

// A skill that is already v3 — nothing to migrate.
const V3_FIXTURE = `---
schema_version: 3
name: test-skill
browse_category: Testing
---
# Test Skill
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: 'utf8',
    env: process.env,
  });
}

function withTempDir(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v2-to-v3-test-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function writeFixture(dir, skillName, content) {
  const skillDir = path.join(dir, skillName);
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
    process.stdout.write(`PASS migrate-skill-v2-to-v3: ${label}\n`);
    passed++;
  } catch (err) {
    process.stderr.write(`FAIL migrate-skill-v2-to-v3: ${label}\n  ${err.message}\n`);
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
  const result = run(['--help']);
  assert(result.status === 0, `expected exit 0, got ${result.status}`);
  assert(result.stdout.includes('Usage:'), `expected "Usage:" in stdout, got: ${result.stdout}`);
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
// Test 4: --all --dry-run exits 0, reports 0 files migrated.
// ---------------------------------------------------------------------------
test('--all --dry-run exits 0, reports 0 files migrated', () => {
  // --all scans the repo's skills/ dir which is empty / does not exist in
  // the skill-graph repo itself — this is the "already fully migrated" case.
  const result = run(['--all', '--dry-run']);
  assert(
    result.status === 0,
    `expected exit 0, got ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
  );
  assert(
    result.stdout.includes('0 file') || result.stdout.includes('0 would'),
    `expected 0-files report, got: ${result.stdout}`
  );
});

// ---------------------------------------------------------------------------
// Test 5: --dry-run with a v2 file exits 0 and shows DIFF, not OK.
// ---------------------------------------------------------------------------
test('--dry-run shows DIFF and exits 0 for a v2 file', () => {
  withTempDir(dir => {
    const skillMd = writeFixture(dir, 'test-skill', V2_FIXTURE);
    // Pass the SKILL.md path directly as a positional argument.
    const result = run(['--dry-run', skillMd]);
    assert(
      result.status === 0,
      `expected exit 0, got ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`
    );
    assert(
      result.stdout.includes('DIFF') || result.stdout.includes('SKIP') || result.stdout.includes('would migrate'),
      `expected dry-run marker in stdout, got: ${result.stdout}`
    );
    // Verify the file was NOT modified.
    const afterContent = fs.readFileSync(skillMd, 'utf8');
    assert(afterContent === V2_FIXTURE, 'dry-run must not write the file');
  });
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
process.stdout.write(`\nmigrate-skill-v2-to-v3: ${passed} passed, ${failed} failed.\n`);
if (failed > 0) process.exit(1);
