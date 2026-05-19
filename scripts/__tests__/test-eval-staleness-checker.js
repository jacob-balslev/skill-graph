#!/usr/bin/env node
/**
 * Regression test for the consolidated eval staleness checker.
 *
 * The checker must inspect `examples/evals/*.json` and resolve `truth_sources`
 * through `.skill-graph/config.json` into the sibling canonical skills library.
 * A stale pre-consolidation implementation scanned per-skill `evals/evals.json`
 * and returned "No eval files found" in this repo.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { loadWorkspaceConfig, resolveSkillRoots, workspaceRoot } = require('../lib/roots');

function fail(message, details = '') {
  process.stderr.write(`FAIL test-eval-staleness-checker: ${message}\n`);
  if (details) process.stderr.write(`${details}\n`);
  process.exit(1);
}

function assert(condition, message, details = '') {
  if (!condition) fail(message, details);
}

const repoRoot = path.resolve(__dirname, '..', '..');
const skillRoots = resolveSkillRoots(workspaceRoot(), loadWorkspaceConfig(workspaceRoot()));
const sourceDir = skillRoots[0] && skillRoots[0].absPath;
if (!sourceDir || !fs.existsSync(sourceDir)) {
  process.stdout.write(
    `SKIP test-eval-staleness-checker: canonical skills library not found at ${sourceDir || '(no path resolved)'} — skipping\n`
  );
  process.exit(0);
}

const result = spawnSync(process.execPath, ['lib/audit/eval-staleness-checker.js', '--skill', 'a11y', '--json'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert(result.status === 0, 'checker should exit 0 for current a11y eval truth-source claims', result.stderr || result.stdout);

let findings;
try {
  findings = JSON.parse(result.stdout);
} catch (error) {
  fail('checker should emit JSON with --json', `${error.message}\n${result.stdout}`);
}

assert(Array.isArray(findings), 'checker JSON output should be an array');
assert(findings.length > 0, 'checker should inspect at least one a11y claim');
assert(findings.every(finding => finding.status !== 'stale'), 'a11y checker run should have no stale findings', result.stdout);
assert(
  findings.some(finding => finding.claim === 'skills/quality/a11y/SKILL.md' && finding.status === 'valid'),
  'checker should resolve a sibling skill truth_source path as valid',
  result.stdout
);

process.stdout.write('PASS test-eval-staleness-checker: consolidated eval layout covered\n');
