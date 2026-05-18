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
const fs = require('fs');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Subcommand → implementation map
// ---------------------------------------------------------------------------
//
// Script paths are relative to REPO_ROOT. The `inline` key marks subcommands
// implemented as inline Node code in this file rather than via a delegated
// script (e.g. `init`).
//
// The optional `help` key provides a static help string that is printed when
// `--help` / `-h` is passed. Use this for scripts that cannot handle --help
// themselves (e.g. scripts that require positional args or have heavy init
// that runs before arg-parsing).
//
// Spec subcommands (ordered as per SH-6134):
//   init, add, lint, audit, route, drift, export, evolve
//
// Legacy subcommands (retained for backward compat):
//   manifest, overlap, routing-eval, export-verify, marketplace-export, protocol-check

const COMMANDS = {
  // ─── Spec subcommands ────────────────────────────────────────────────────
  init:    { inline: true },
  add:     { script: 'scripts/marketplace-install.js' },
  lint:    {
    script: 'scripts/skill-lint.js',
    help: `Usage: skill-graph lint [<skill>] [options]

Validate SKILL.md files against the Skill Metadata Protocol schema and lint rules.

Arguments:
  [<skill>]              Path or name of a specific skill to lint. If omitted, lints all skills.

Options:
  --include-template     Also lint examples/protocol/skill-metadata-template.md.
  --path <dir>           Override the skills root directory.
  --json                 Emit JSON output.
  --strict               Treat warnings as errors.

Examples:
  skill-graph lint
  skill-graph lint my-skill
  skill-graph lint --include-template
`,
  },
  audit:   {
    script: 'lib/audit/skill-audit.js',
    help: `Usage: skill-graph audit <skill-name> [options]

Seed or run a single-skill audit against a SKILL.md file.

Arguments:
  <skill-name>       Skill directory name (relative to workspace skill roots).

Options:
  --audit-root <path>   Output directory root (default: examples/audits/).
  --force               Overwrite existing audit artifacts.
  --graded              Enable the prompt-driven grader pass.
  --grader-cli <cmd>    Grader command (default: claude -p). Requires --graded.
  --grader-timeout <ms> Per-dimension grader timeout (default: 120000).

Examples:
  skill-graph audit my-skill
  skill-graph audit my-skill --graded
  skill-graph audit my-skill --graded --grader-cli "codex exec" --force
`,
  },
  route:   {
    script: 'scripts/skill-graph-route.js',
    help: `Usage: skill-graph route <query> [options]

Select and explain which skills are relevant for a natural-language query.

Arguments:
  <query>            Natural-language description of the task or topic.

Options:
  --project <name>   Filter to skills in a specific project.
  --max <n>          Maximum number of skills to return (default: 5).
  --manifest <path>  Path to compiled manifest (default: skills.manifest.json).
  --json             Emit JSON output.
  --min-eval-state   Minimum eval state filter (unverified|passing|monitored).

Examples:
  skill-graph route "audit my skills for schema conformance"
  skill-graph route "debug a failing eval" --max 3
`,
  },
  drift:   {
    script: 'scripts/skill-graph-drift.js',
    help: `Usage: skill-graph drift [skill] [options]

Check whether grounding truth-source files have changed since the last recorded hash.

Arguments:
  [skill]            Skill name to check. If omitted, checks all skills.

Options:
  --record           Record current hashes as the new baseline.
  --apply <skill>    Apply hash recording to a specific skill only.
  --json             Emit JSON output.

Examples:
  skill-graph drift
  skill-graph drift graph-audit
  skill-graph drift --record --apply skills/graph-audit
`,
  },
  export:  {
    script: 'scripts/export-marketplace-skills.js',
    help: `Usage: skill-graph export [options]

Generate and validate the public marketplace export surface.

Options:
  --output <dir>    Marketplace output root (default: marketplace).
  --check           Do not write; fail if generated files are missing or stale.
  --validate-only   Alias for --check.

Examples:
  skill-graph export
  skill-graph export --check
`,
  },
  evolve:  {
    script: 'lib/audit/skill-evolution-loop.js',
    requires: ['lib/audit-shared/auto-improve.js'],
    unmetMessage: `skill-graph evolve depends on lib/audit-shared/auto-improve.js, which is\n` +
      `not yet bundled in this release. The script also reaches into parent-repo paths\n` +
      `(scripts/run-skill-improvement-loop.js, scripts/skill-auto-create.js,\n` +
      `scripts/dispatch-solver.js, agent-orchestration/logs/) that exist only in the\n` +
      `source Development monorepo.\n\n` +
      `Standalone-compatible refactor tracked in SH-6138 (parent EPIC SH-6132).\n` +
      `Until then, run the loop from the source repo where these deps are available.`,
    help: `Usage: skill-graph evolve [options]

Run the continuous Karpathy-style skill-improvement loop.

Options:
  --top <n>               Process top n items per cycle (default: 5).
  --max-cycles <n>        Maximum improvement cycles (default: 10).
  --max-iterations <n>    Safety cap per cycle (default: 20).
  --continuous            Auto re-analyze and repeat until convergence.
  --auto-improve          Full Karpathy spine (analyze → triage → execute → verify).
  --analyze-only          Produce analysis without executing improvements.
  --resume                Resume from last checkpoint.
  --cooldown <sec>        Seconds between continuous cycles (default: 0).
  --min-priority <n>      Skip items below this priority score (default: 0).
  --failure-budget <n>    Tolerated failures before aborting (default: 5).
  --pilot <skill>         Run in bounded pilot lane for a single skill.
  --actions <list>        Comma-separated action types to allow (default: all).

Examples:
  skill-graph evolve --top 5 --max-cycles 3
  skill-graph evolve --continuous --max-cycles 20 --min-priority 5
  skill-graph evolve --auto-improve --max-cycles 3 --failure-budget 5
  skill-graph evolve --analyze-only
  skill-graph evolve --resume

Note: skill-graph evolve is not yet standalone-compatible. It depends on
      lib/audit-shared/auto-improve.js and several parent-repo scripts that
      do not yet ship with @skill-graph/cli. Tracking the standalone refactor
      in SH-6138. Until then, run the loop from the source Development repo.
`,
  },

  // ─── Legacy / additional subcommands (backward compat) ───────────────────
  manifest:           { script: 'scripts/generate-manifest.js' },
  overlap:            { script: 'scripts/skill-overlap.js' },
  'routing-eval':     { script: 'scripts/skill-graph-routing-eval.js' },
  'export-verify':    { script: 'scripts/verify-skill-md-export.js' },
  'export:verify-skill-md': { script: 'scripts/verify-skill-md-export.js' },
  'marketplace-export': { script: 'scripts/export-marketplace-skills.js' },
  'marketplace:export': { script: 'scripts/export-marketplace-skills.js' },
  'protocol-check':   { script: 'scripts/check-protocol-consistency.js' },
};

function printHelp() {
  process.stdout.write(`Usage: skill-graph <command> [args]

Commands:
  init             Scaffold a new SKILL.md from the official template
  add <slug>       Install a skill from the marketplace into your library
  lint [skill]     Validate SKILL.md files against the schema and lint rules
  audit <skill>    Seed or run a single-skill audit (stub or graded mode)
  route <query>    Select and explain skills for a natural-language query
  drift            Check or record grounding truth-source hashes (drift sentinel)
  export           Generate and validate the public marketplace export surface
  evolve           Run the continuous skill-improvement loop (Karpathy-style)

Additional commands (retained for backward compatibility):
  manifest         Generate or validate a skills.manifest.json
  overlap          Detect duplicate activation signals across skills
  routing-eval     Run routing examples / anti_examples through the router
  export-verify    Verify exported skills against the plain SKILL.md export shape
  marketplace-export
                   Alias for export
  protocol-check   Check cross-artifact protocol consistency

Examples:
  skill-graph init
  skill-graph add debugging
  skill-graph lint --include-template
  skill-graph audit my-skill --graded
  skill-graph route "audit my skills for schema conformance"
  skill-graph drift --record --apply skills/graph-audit
  skill-graph export
  skill-graph evolve --top 5 --max-cycles 3
`);
}

// ---------------------------------------------------------------------------
// `init` — inline scaffolder
// ---------------------------------------------------------------------------
// Copies examples/protocol/skill-metadata-template.md into
// skills/<slug>/SKILL.md in the caller's working directory (or SKILL.md in
// the current directory if no slug is given).

function runInit(args) {
  const helpFlag = args.includes('--help') || args.includes('-h');
  if (helpFlag) {
    process.stdout.write(`Usage: skill-graph init [<slug>] [options]

Scaffold a new skill from the official Skill Metadata Protocol template.

Arguments:
  <slug>          Name for the new skill directory (e.g. "my-skill").
                  If omitted, writes SKILL.md in the current directory.

Options:
  --output <dir>  Override the output directory.
  --force         Overwrite an existing SKILL.md.
  --help          Show this help.

Examples:
  skill-graph init
  skill-graph init my-skill
  skill-graph init my-skill --output ./skills
`);
    process.exit(0);
  }

  const templateSrc = path.join(REPO_ROOT, 'examples', 'protocol', 'skill-metadata-template.md');
  if (!fs.existsSync(templateSrc)) {
    process.stderr.write(`Error: template not found at ${templateSrc}\n`);
    process.stderr.write('Is REPO_ROOT set correctly? (' + REPO_ROOT + ')\n');
    process.exit(1);
  }

  // Resolve output path.
  let slug = null;
  let outputDir = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) { outputDir = args[++i]; }
    else if (args[i] === '--force') { /* handled below */ }
    else if (!args[i].startsWith('--')) { slug = args[i]; }
  }
  const force = args.includes('--force');

  let destDir;
  if (outputDir) {
    destDir = slug ? path.resolve(outputDir, slug) : path.resolve(outputDir);
  } else {
    destDir = slug ? path.resolve(process.cwd(), 'skills', slug) : process.cwd();
  }

  const destFile = path.join(destDir, 'SKILL.md');

  if (fs.existsSync(destFile) && !force) {
    process.stderr.write(`Error: ${destFile} already exists. Use --force to overwrite.\n`);
    process.exit(1);
  }

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(templateSrc, destFile);

  process.stdout.write(`Created: ${destFile}\n`);
  if (slug) {
    process.stdout.write(`\nNext steps:\n`);
    process.stdout.write(`  1. Edit ${destFile} — fill in name, description, domain_context, etc.\n`);
    process.stdout.write(`  2. Strip all "# TEMPLATE NOTE:" comments and "> **TEMPLATE NOTE:**" blockquotes.\n`);
    process.stdout.write(`  3. Run: skill-graph lint ${slug}\n`);
  } else {
    process.stdout.write(`\nEdit SKILL.md and strip all template scaffolding before shipping.\n`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const command = args.shift();

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    process.exit(0);
  }

  const entry = COMMANDS[command];
  if (!entry) {
    process.stderr.write(`Unknown command: ${command}\n\n`);
    printHelp();
    process.exit(1);
  }

  // Inline subcommands run in-process.
  if (entry.inline) {
    if (command === 'init') { runInit(args); }
    // (future inline commands added here)
    return;
  }

  // Intercept --help / -h before delegating to scripts that may not support it.
  const wantsHelp = args.includes('--help') || args.includes('-h');
  if (wantsHelp && entry.help) {
    process.stdout.write(entry.help);
    process.exit(0);
  }

  const scriptPath = path.join(REPO_ROOT, entry.script);
  if (!fs.existsSync(scriptPath)) {
    process.stderr.write(`Error: implementation script not found: ${entry.script}\n`);
    process.stderr.write(`REPO_ROOT: ${REPO_ROOT}\n`);
    process.exit(1);
  }

  if (Array.isArray(entry.requires) && entry.requires.length) {
    const missing = entry.requires.filter((rel) => !fs.existsSync(path.join(REPO_ROOT, rel)));
    if (missing.length) {
      process.stderr.write(`Error: '${command}' is not standalone-compatible in this release.\n\n`);
      if (entry.unmetMessage) process.stderr.write(`${entry.unmetMessage}\n\n`);
      process.stderr.write(`Missing required file(s):\n`);
      for (const rel of missing) process.stderr.write(`  - ${rel}\n`);
      process.exit(1);
    }
  }

  const result = spawnSync(process.execPath, [scriptPath, ...args], {
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
