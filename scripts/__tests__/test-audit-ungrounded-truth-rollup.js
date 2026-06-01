#!/usr/bin/env node
'use strict';

/**
 * Regression: `skill-graph audit` must not truth-certify an ungrounded skill.
 *
 * A skill with no declared `grounding.truth_sources` gives the drift sentinel
 * no hashable baseline. That is an UNVERIFIED truth state, not PASS.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BIN = path.join(REPO_ROOT, 'bin', 'skill-graph.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sg-audit-ungrounded-'));
const skillDir = path.join(tmp, 'skills', 'ungrounded-fixture');
const skillMd = path.join(skillDir, 'SKILL.md');
const sidecarPath = path.join(skillDir, 'audit-state.json');

let passed = 0;
let failed = 0;

function cleanup() {
  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}
process.on('exit', cleanup);

function check(label, condition, detail = '') {
  if (condition) {
    passed++;
    process.stdout.write(`  PASS  ${label}\n`);
  } else {
    failed++;
    process.stderr.write(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}\n`);
  }
}

fs.mkdirSync(skillDir, { recursive: true });
fs.mkdirSync(path.join(tmp, '.skill-graph'), { recursive: true });
fs.writeFileSync(
  path.join(tmp, '.skill-graph', 'config.json'),
  JSON.stringify({ schema_version: 1, skill_roots: ['skills'] }, null, 2),
);

fs.writeFileSync(skillMd, `---
# name: stable kebab-case skill identifier; must match the parent directory.
name: ungrounded-fixture
# description: routing contract for when this skill should activate and when it should not.
description: "Use for the audit ungrounded truth-rollup regression fixture."
# metadata: Skill Metadata Protocol fields encoded under frontmatter.
metadata:
  # subject: primary browse shelf — what the skill teaches.
  subject: quality-assurance
  # deployment_target: where this skill applies.
  deployment_target: portable
  # scope: free-text PRD-style statement of what the skill teaches and where it deploys.
  scope: "Portable audit-runner regression fixture with no declared truth sources."
---

# Ungrounded Fixture

## Coverage

Fixture content for the audit truth-rollup regression.
`);

fs.writeFileSync(sidecarPath, JSON.stringify({
  schema_version: 8,
  version: '0.0.0',
  owner: 'test',
  freshness: '2026-06-01',
  drift_check: { last_verified: '2026-06-01' },
  eval_artifacts: 'none',
  eval_state: 'unverified',
  routing_eval: 'absent',
}, null, 2));

const run = spawnSync(process.execPath, [BIN, 'audit', 'ungrounded-fixture', '--force'], {
  cwd: tmp,
  encoding: 'utf8',
  timeout: 120000,
  env: {
    ...process.env,
    SKILL_GRAPH_WORKSPACE: tmp,
  },
});

check('audit exits 0', run.status === 0, `exit=${run.status}; stderr=${(run.stderr || '').slice(0, 400)}`);

let sidecar = {};
try {
  sidecar = JSON.parse(fs.readFileSync(sidecarPath, 'utf8'));
} catch (err) {
  check('audit-state.json parses', false, err.message);
}

check('UNGROUNDED rolls up to truth_verdict UNVERIFIED', sidecar.truth_verdict === 'UNVERIFIED',
  `truth_verdict=${sidecar.truth_verdict}; stdout=${(run.stdout || '').slice(-500)}`);
check('CLI names the Audit Status sidecar', (run.stdout || '').includes('Stamped Audit Status sidecar'),
  `stdout=${(run.stdout || '').slice(-500)}`);
check('CLI no longer says Health Block for audit write-back', !(run.stdout || '').includes('Health Block'),
  `stdout=${(run.stdout || '').slice(-500)}`);

process.stdout.write(`\nResults: ${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
