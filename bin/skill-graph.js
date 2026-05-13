#!/usr/bin/env node
/**
 * Public CLI dispatcher for Skill Graph.
 *
 * Keeps the existing zero-dependency scripts as the implementation surface and
 * exposes a stable installable command for users who do not want to clone the
 * repo just to run one tool.
 */

'use strict';

const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');

const COMMANDS = {
  lint: 'scripts/skill-lint.js',
  manifest: 'scripts/generate-manifest.js',
  route: 'scripts/skill-graph-route.js',
  drift: 'scripts/skill-graph-drift.js',
  overlap: 'scripts/skill-overlap.js',
  'routing-eval': 'scripts/skill-graph-routing-eval.js',
  export: 'scripts/export-skill.js',
  'export-verify': 'scripts/verify-skill-md-export.js',
  'export:verify-skill-md': 'scripts/verify-skill-md-export.js',
  'marketplace-export': 'scripts/export-marketplace-skills.js',
  'marketplace:export': 'scripts/export-marketplace-skills.js',
  audit: 'scripts/skill-audit.js',
  'protocol-check': 'scripts/check-protocol-consistency.js',
};

function printHelp() {
  process.stdout.write(`Usage: skill-graph <command> [args]

Commands:
  lint             Validate SKILL.md files
  manifest         Generate or validate a skills.manifest.json
  route            Select skills for a query
  drift            Check or record grounding truth-source hashes
  overlap          Detect duplicate activation signals
  routing-eval     Run routing examples / anti_examples through the router
  export           Export a Skill Graph skill to plain SKILL.md shape
  export-verify    Verify exported skills against the plain SKILL.md export shape
  marketplace-export
                   Generate and validate the public marketplace export surface
  audit            Seed or run a single-skill audit
  protocol-check   Check cross-artifact protocol consistency

Examples:
  skill-graph lint --include-template
  skill-graph manifest --validate-only
  skill-graph route "audit my skills for schema conformance"
  skill-graph drift --record --apply skills/graph-audit
`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args.shift();

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    process.exit(0);
  }

  const script = COMMANDS[command];
  if (!script) {
    process.stderr.write(`Unknown command: ${command}\n\n`);
    printHelp();
    process.exit(1);
  }

  const result = spawnSync(process.execPath, [path.join(REPO_ROOT, script), ...args], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      SKILL_GRAPH_PACKAGE_ROOT: REPO_ROOT,
      SKILL_GRAPH_WORKSPACE: process.cwd(),
    },
    stdio: 'inherit',
  });

  if (result.error) {
    process.stderr.write(`Failed to run ${command}: ${result.error.message}\n`);
    process.exit(1);
  }
  process.exit(result.status == null ? 1 : result.status);
}

main();
