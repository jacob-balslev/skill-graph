#!/usr/bin/env node
/**
 * marketplace-install.js — implementation of `skill-graph add <slug>`.
 *
 * Installs a skill from the bundled marketplace export surface
 * (`marketplace/skills/<slug>/`) into the user's skill library. This is the
 * consume-side inverse of `scripts/export-marketplace-skills.js` (which writes
 * the marketplace export); `add` reads from it.
 *
 * Consumed by: bin/skill-graph.js (the `add` subcommand → `{ script:
 * 'scripts/marketplace-install.js' }`). bin spawns `node
 * scripts/marketplace-install.js <args>` with everything after `add` forwarded
 * as argv, and does NOT intercept --help for this command, so --help/--list are
 * handled here.
 *
 * CLI:
 *   skill-graph add <slug> [--output <dir>] [--force]
 *   skill-graph add --list
 *   skill-graph add --help
 *
 * Arguments:
 *   <slug>            Marketplace skill name (a directory under marketplace/skills/).
 *
 * Options:
 *   --output <dir>    Destination root. Default: <cwd>/skills/<slug>/ (mirrors `init`).
 *   --force           Overwrite an existing destination skill directory.
 *   --list            List installable marketplace skills and exit.
 *   --help, -h        Show this help.
 *
 * Exit codes: 0 success, 1 user error (missing/unknown slug, dest exists), 2 internal error.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const MARKETPLACE_DIR = path.join(REPO_ROOT, 'marketplace', 'skills');

function listAvailable() {
  if (!fs.existsSync(MARKETPLACE_DIR)) return [];
  return fs
    .readdirSync(MARKETPLACE_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(MARKETPLACE_DIR, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort();
}

function printHelp() {
  process.stdout.write(`Usage: skill-graph add <slug> [options]

Install a skill from the bundled marketplace into your library.

Arguments:
  <slug>            Marketplace skill name (see \`skill-graph add --list\`).

Options:
  --output <dir>    Destination root. Default: <cwd>/skills/<slug>/.
  --force           Overwrite an existing destination skill directory.
  --list            List installable marketplace skills and exit.
  --help, -h        Show this help.

Examples:
  skill-graph add debugging
  skill-graph add a11y --output ./my-library
  skill-graph add --list
`);
}

// Suggest near-matches for a mistyped slug (substring or shared prefix).
function suggest(slug, available) {
  const q = slug.toLowerCase();
  return available
    .filter((n) => n.includes(q) || q.includes(n) || n.slice(0, 3) === q.slice(0, 3))
    .slice(0, 5);
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const available = listAvailable();

  if (args.includes('--list')) {
    if (available.length === 0) {
      process.stdout.write(`No marketplace skills found under ${path.relative(REPO_ROOT, MARKETPLACE_DIR)}/.\n`);
    } else {
      process.stdout.write(`Installable skills (${available.length}):\n`);
      for (const name of available) process.stdout.write(`  ${name}\n`);
    }
    process.exit(0);
  }

  // Parse positional slug + flags.
  let slug = null;
  let outputDir = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) outputDir = args[++i];
    else if (args[i] === '--force') { /* handled below */ }
    else if (!args[i].startsWith('--')) slug = slug || args[i];
  }
  const force = args.includes('--force');

  if (!slug) {
    process.stderr.write('Error: no skill specified.\n\n');
    printHelp();
    process.exit(1);
  }

  if (!fs.existsSync(MARKETPLACE_DIR)) {
    process.stderr.write(`Error: marketplace not found at ${MARKETPLACE_DIR}\n`);
    process.stderr.write(`Is REPO_ROOT correct? (${REPO_ROOT})\n`);
    process.exit(2);
  }

  const srcDir = path.join(MARKETPLACE_DIR, slug);
  if (!fs.existsSync(path.join(srcDir, 'SKILL.md'))) {
    process.stderr.write(`Error: no marketplace skill named "${slug}".\n`);
    const near = suggest(slug, available);
    if (near.length) process.stderr.write(`Did you mean: ${near.join(', ')}?\n`);
    process.stderr.write(`Run \`skill-graph add --list\` to see all ${available.length} installable skills.\n`);
    process.exit(1);
  }

  const destDir = outputDir
    ? path.resolve(outputDir, slug)
    : path.resolve(process.cwd(), 'skills', slug);

  if (fs.existsSync(destDir) && !force) {
    process.stderr.write(`Error: ${destDir} already exists. Use --force to overwrite.\n`);
    process.exit(1);
  }

  try {
    fs.rmSync(destDir, { recursive: true, force: true });
    fs.cpSync(srcDir, destDir, { recursive: true });
  } catch (err) {
    process.stderr.write(`Error: failed to install "${slug}": ${err.message}\n`);
    process.exit(2);
  }

  const destFile = path.join(destDir, 'SKILL.md');
  process.stdout.write(`Installed: ${destFile}\n`);
  process.stdout.write(`\nNext steps:\n`);
  process.stdout.write(`  1. Review ${destFile}.\n`);
  process.stdout.write(`  2. Run: skill-graph lint ${slug}\n`);
  process.exit(0);
}

main();
