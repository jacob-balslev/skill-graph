#!/usr/bin/env node
/**
 * Smoke test: standalone audit + evolve pipeline
 *
 * Verifies that:
 *   1. skill-graph audit <fixture> --dry-run resolves a skill and exits 0 without
 *      writing any files. This validates the standalone pipeline end-to-end with a
 *      fixture skill inside the repo (no parent Development/ monorepo required).
 *   2. skill-graph audit --help prints the --dry-run flag.
 *   3. skill-graph evolve --help exits 0 and documents --workspace-root.
 *   4. No REPO_ROOT or cross-repo require() escape patterns exist in lib/.
 *
 * These checks confirm that the cross-repo path escapes removed in SH-6138 are
 * gone and that the audit/evolve pipeline runs standalone.
 */

'use strict';

const os   = require('os');
const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BIN       = path.join(REPO_ROOT, 'bin', 'skill-graph.js');
const NODE      = process.execPath;

/** Run a command and return { exitCode, stdout, stderr }. */
function run(args, opts = {}) {
  const env = Object.assign({}, process.env, opts.env || {});
  const result = spawnSync(NODE, [BIN, ...args], {
    cwd:      opts.cwd || REPO_ROOT,
    encoding: 'utf8',
    timeout:  30_000,
    env,
  });
  return {
    exitCode: result.status === null ? 1 : result.status,
    stdout:   result.stdout || '',
    stderr:   result.stderr || '',
  };
}

let passed = 0;
let failed = 0;

function pass(name) {
  process.stdout.write(`  PASS  ${name}\n`);
  passed++;
}

function fail(name, reason, detail = '') {
  process.stderr.write(`  FAIL  ${name}: ${reason}\n`);
  if (detail) process.stderr.write(`        ${detail}\n`);
  failed++;
}

// ---------------------------------------------------------------------------
// Test 1: audit --dry-run on a bundled fixture skill exits 0
// ---------------------------------------------------------------------------
(function testAuditDryRun() {
  // Build a minimal isolated workspace in a temp dir so the test does not
  // depend on the sibling canonical skills library being cloned.
  // Structure: <tmpdir>/skills/minimal-capability/SKILL.md
  // No .skill-graph/config.json → roots.js defaults to <workspace>/skills.
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-smoke-'));
  const skillDir = path.join(tmpDir, 'skills', 'minimal-capability');
  const auditRoot = path.join(tmpDir, 'audits');
  fs.mkdirSync(skillDir, { recursive: true });

  // Copy the bundled fixture skill into the temp workspace.
  const fixtureDir = path.join(REPO_ROOT, 'examples', 'fixture-skills', 'minimal-capability');
  const fixtureFiles = fs.readdirSync(fixtureDir);
  for (const f of fixtureFiles) {
    fs.copyFileSync(path.join(fixtureDir, f), path.join(skillDir, f));
  }

  const r = run(['audit', 'minimal-capability', '--dry-run', '--audit-root', auditRoot], {
    env: { SKILL_GRAPH_WORKSPACE: tmpDir },
  });

  // Clean up temp dir regardless of outcome.
  fs.rmSync(tmpDir, { recursive: true, force: true });

  if (r.exitCode !== 0) {
    fail('audit --dry-run exits 0', `exit code was ${r.exitCode}`, r.stderr);
  } else if (!r.stdout.includes('resolved skill')) {
    fail('audit --dry-run resolved skill', 'stdout did not contain "resolved skill"', r.stdout);
  } else if (r.stdout.includes('findings.md') || r.stdout.includes('verdict.md')) {
    fail('audit --dry-run does not write files', 'stdout mentioned output files', r.stdout);
  } else if (!r.stdout.includes('no files written')) {
    fail('audit --dry-run reports no file writes', 'stdout did not contain "no files written"', r.stdout);
  } else {
    pass('audit minimal-capability --dry-run exits 0 and reports no file writes');
  }
})();

// ---------------------------------------------------------------------------
// Test 2: audit --help documents --dry-run
// ---------------------------------------------------------------------------
(function testAuditHelpDryRun() {
  const r = run(['audit', '--help']);
  if (r.exitCode !== 0) {
    fail('audit --help exits 0', `exit code was ${r.exitCode}`, r.stderr);
    return;
  }
  if (!r.stdout.includes('--dry-run')) {
    fail('audit --help documents --dry-run', '--dry-run not found in help output', r.stdout.slice(0, 500));
  } else {
    pass('audit --help documents --dry-run flag');
  }
})();

// ---------------------------------------------------------------------------
// Test 3: evolve --help exits 0 and documents standalone flags
// ---------------------------------------------------------------------------
(function testEvolveHelp() {
  const r = run(['evolve', '--help']);
  if (r.exitCode !== 0) {
    fail('evolve --help exits 0', `exit code was ${r.exitCode}`, r.stderr);
    return;
  }
  const combined = r.stdout + r.stderr;
  if (!combined.includes('--workspace-root')) {
    fail('evolve --help documents --workspace-root', '--workspace-root not found in output', combined.slice(0, 500));
  } else if (!combined.includes('--skills-dir')) {
    fail('evolve --help documents --skills-dir', '--skills-dir not found in output', combined.slice(0, 500));
  } else if (!combined.includes('Exit codes')) {
    fail('evolve --help documents exit codes', '"Exit codes" section not found in output', combined.slice(0, 500));
  } else {
    pass('evolve --help exits 0 and documents --workspace-root, --skills-dir, exit codes');
  }
})();

// ---------------------------------------------------------------------------
// Test 4: no REPO_ROOT or cross-repo require() escapes in lib/
// ---------------------------------------------------------------------------
(function testNoCrossRepoEscapes() {
  const { spawnSync: sp } = require('child_process');
  // grep -r with extended regex for the three escape patterns
  const r = sp('grep', ['-rn', '--include=*.js',
    'REPO_ROOT\\|\\.\\.\\/scripts\\/skill\\|\\.\\.\\/\\.\\.\\/scripts',
    'lib/',
  ], { cwd: REPO_ROOT, encoding: 'utf8' });

  const hits = (r.stdout || '').trim();
  if (hits.length > 0) {
    fail('no REPO_ROOT / cross-repo require() in lib/', 'grep found hits:', hits);
  } else {
    pass('grep finds zero REPO_ROOT / ../scripts / ../../scripts hits in lib/');
  }
})();

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
process.stdout.write(`Results: ${passed + failed} total — ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
