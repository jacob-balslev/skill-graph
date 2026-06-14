#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');

const REQUIRED_PATHS = [
  'AGENTS.md',
  'skill-audit-loop/AGENT_CONTEXT.yaml',
  'skill-audit-loop/WORKFLOW_CONTRACT.md',
  'skill-audit-loop/SKILL_AUDIT_LOOP.md',
  'audits/gate-conformance/README.md',
  'audits/gate-conformance/spec.yaml',
  'audits/gate-conformance/fixtures/application-workspace/.skill-graph/config.json',
  'audits/gate-conformance/fixtures/audit-workspaces/empty/.gitkeep',
  'audits/workflow-conformance/README.md',
  'audits/workflow-conformance/spec.yaml',
  'scripts/__tests__/test-gate-conformance.js',
  'scripts/__tests__/test-workflow-conformance.js',
];

const FORBIDDEN_PREFIXES = [
  'skill-audit-loop/progress/',
  '.skill-graph/',
];

function main() {
  const result = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  if (result.error) {
    console.error(`FAIL package files check: could not run npm pack: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(result.stdout || '');
    console.error(result.stderr || '');
    console.error(`FAIL package files check: npm pack exited ${result.status}`);
    process.exit(result.status || 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(result.stdout);
  } catch (err) {
    console.error(result.stdout || '');
    console.error(`FAIL package files check: npm pack did not return JSON: ${err.message}`);
    process.exit(1);
  }

  const packed = parsed && parsed[0] && Array.isArray(parsed[0].files)
    ? parsed[0].files.map((file) => file.path)
    : null;
  if (!packed) {
    console.error('FAIL package files check: npm pack JSON missing files list');
    process.exit(1);
  }

  const fileSet = new Set(packed);
  const missing = REQUIRED_PATHS.filter((path) => !fileSet.has(path));
  const forbidden = packed.filter((path) => (
    FORBIDDEN_PREFIXES.some((prefix) => path.startsWith(prefix))
  ));

  if (missing.length > 0 || forbidden.length > 0) {
    if (missing.length > 0) {
      console.error('FAIL package files check: required package file(s) missing:');
      for (const path of missing) console.error(`  - ${path}`);
    }
    if (forbidden.length > 0) {
      console.error('FAIL package files check: forbidden package file(s) included:');
      for (const path of forbidden.slice(0, 25)) console.error(`  - ${path}`);
      if (forbidden.length > 25) console.error(`  ... ${forbidden.length - 25} more`);
    }
    process.exit(1);
  }

  console.log(`OK package files (${packed.length} files): BDD context included, transient progress excluded.`);
}

main();
