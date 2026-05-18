#!/usr/bin/env node
/**
 * marketplace-install.js — Install a skill from the Skill Graph marketplace.
 *
 * Fetches a skill from a remote registry (GitHub or npm) and writes it into
 * the local skill library. This is a minimal stub — the full implementation
 * will follow in SH-6110.
 *
 * Usage:
 *   node scripts/marketplace-install.js <slug>
 *   node scripts/marketplace-install.js <slug> --source <registry-url>
 *   node scripts/marketplace-install.js --list
 *   node scripts/marketplace-install.js --help
 *
 * Flags:
 *   --source <url>   Override the default registry URL.
 *   --list           List skills available in the default registry.
 *   --dry-run        Show what would be installed without writing anything.
 *   --force          Overwrite if the skill already exists locally.
 *   --output <dir>   Override the local output directory (default: skills/).
 */

'use strict';

const DEFAULT_REGISTRY = 'https://raw.githubusercontent.com/jacob-balslev/skills/main/skills';

function printHelp() {
  process.stdout.write(`Usage: skill-graph add <slug> [options]

Install a skill from the marketplace into your local skill library.

Arguments:
  <slug>           Skill slug to install (e.g. "debugging", "code-review")

Options:
  --source <url>   Registry URL (default: ${DEFAULT_REGISTRY})
  --dry-run        Show what would be installed without writing files
  --force          Overwrite an existing local skill
  --output <dir>   Local directory to install into (default: skills/)
  --list           List skills available in the registry
  --help           Show this help

Examples:
  skill-graph add debugging
  skill-graph add code-review --dry-run
  skill-graph add a11y --force --output ./my-skills
  skill-graph add --list
`);
}

async function listSkills(registryUrl) {
  process.stdout.write(`Listing skills from: ${registryUrl}\n`);
  process.stdout.write(`\nThis feature requires the full SH-6110 implementation.\n`);
  process.stdout.write(`For now, browse available skills at:\n`);
  process.stdout.write(`  https://github.com/jacob-balslev/skills/tree/main/skills\n`);
}

async function installSkill(slug, opts) {
  if (!slug) {
    process.stderr.write('Error: missing required argument <slug>\n\n');
    printHelp();
    process.exit(1);
  }

  const registryUrl = opts.source || DEFAULT_REGISTRY;
  const skillUrl = `${registryUrl}/${slug}/SKILL.md`;

  process.stdout.write(`Installing skill: ${slug}\n`);
  process.stdout.write(`Registry: ${registryUrl}\n`);
  process.stdout.write(`Source: ${skillUrl}\n\n`);

  if (opts['dry-run']) {
    process.stdout.write(`[dry-run] Would fetch: ${skillUrl}\n`);
    process.stdout.write(`[dry-run] Would write: ${opts.output || 'skills'}/${slug}/SKILL.md\n`);
    return;
  }

  // Full implementation follows in SH-6110 (install verification).
  // For now, direct users to the canonical install method.
  process.stderr.write(`Full marketplace install is not yet implemented.\n`);
  process.stderr.write(`\nTo install skills manually:\n`);
  process.stderr.write(`  1. Visit: ${skillUrl}\n`);
  process.stderr.write(`  2. Copy the file to: ${opts.output || 'skills'}/${slug}/SKILL.md\n`);
  process.stderr.write(`\nFull install support is tracked in SH-6110.\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') { opts.help = true; }
    else if (arg === '--dry-run') { opts['dry-run'] = true; }
    else if (arg === '--force') { opts.force = true; }
    else if (arg === '--list') { opts.list = true; }
    else if (arg === '--source' && argv[i + 1]) { opts.source = argv[++i]; }
    else if (arg === '--output' && argv[i + 1]) { opts.output = argv[++i]; }
    else if (!arg.startsWith('--')) { positional.push(arg); }
  }
  opts._positional = positional;
  return opts;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.list) {
    await listSkills(args.source || DEFAULT_REGISTRY);
    process.exit(0);
  }

  const slug = args._positional[0];
  await installSkill(slug, args);
}

main().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
