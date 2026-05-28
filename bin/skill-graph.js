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

Validate SKILL.md files against the canonical-source schema lint gate.

Arguments:
  [<skill>]              Path or name of a specific skill to lint. If omitted, lints all configured skills.

Options:
  --include-template     Also lint examples/skill-metadata-template.md.
  --path <dir>           Override the skills root directory for name lookup or all-skill lint.
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
  --audit-root <path>   Output directory root (default: audits/).
  --force               Overwrite existing audit artifacts.
  --dry-run             Resolve skill and run lint without writing any files. Exit 0 on success.
                        With --fix, previews the migration instead of applying it.
  --fix                 Deterministic Integrity-gate remediation. When lint finds shape
                        violations, apply the v7->v8 frontmatter migration (remove retired
                        fields, rename domain->taxonomy_domain & domain_object->subject_matter,
                        drop enum scope, add deployment_target), regenerate field comments,
                        and re-lint. No LLM, no evals, no keep-or-revert. Caller commits.
  --graded              Enable the prompt-driven grader pass.
  --grader-cli <cmd>    Grader command (default: claude -p). Requires --graded.
  --grader-timeout <ms> Per-dimension grader timeout (default: 120000).

Examples:
  skill-graph audit my-skill
  skill-graph audit my-skill --dry-run
  skill-graph audit my-skill --fix
  skill-graph audit my-skill --dry-run --fix
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
    unmetMessage: `skill-graph evolve requires lib/audit-shared/auto-improve.js, which ships\n` +
      `with @skill-graph/cli but must exist in the working directory.\n\n` +
      `The cross-repo path escapes (REPO_ROOT refs to agent-orchestration/,\n` +
      `scripts/run-skill-improvement-loop.js, etc.) were removed in SH-6138.\n` +
      `evolve now operates standalone when lib/audit-shared/auto-improve.js is present.\n\n` +
      `Required flags for standalone use:\n` +
      `  --workspace-root <path>   Path to your skills workspace (defaults to cwd)\n` +
      `  --skills-dir <path>       Path to your skill library directory\n` +
      `  --output-dir <path>       Path where evolve writes improvement artifacts\n\n` +
      `See: skill-graph evolve --help`,
    help: `Usage: skill-graph evolve [options]

Run the continuous Karpathy-style skill-improvement loop.

Required flags for standalone use (when run via npm install -g @skill-graph/cli):
  --workspace-root <path>   Root of your skills workspace (default: cwd).
  --skills-dir <path>       Directory containing your SKILL.md files (default: <workspace-root>/skills).
  --output-dir <path>       Directory for evolve output artifacts (default: <workspace-root>/audits).

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

Exit codes:
  0   Loop completed successfully (or analyze-only finished).
  1   Fatal error (missing required dep, unresolvable skill root, etc.).
  2   Failure budget exceeded.

Examples:
  skill-graph evolve --top 5 --max-cycles 3
  skill-graph evolve --continuous --max-cycles 20 --min-priority 5
  skill-graph evolve --auto-improve --max-cycles 3 --failure-budget 5
  skill-graph evolve --analyze-only
  skill-graph evolve --resume
  skill-graph evolve --workspace-root /path/to/my-skills --skills-dir /path/to/my-skills/skills

Standalone installation:
  npm install -g @skill-graph/cli
  skill-graph evolve --workspace-root $(pwd) --skills-dir $(pwd)/skills

Note: evolve depends on lib/audit-shared/auto-improve.js (bundled with @skill-graph/cli).
      Cross-repo path escapes were removed in SH-6138 — evolve now operates without
      requiring the Development monorepo. Set SKILL_GRAPH_WORKSPACE or pass
      --workspace-root to point at your skill library if it is not in the current directory.
`,
  },

  // ─── Spec subcommands added 2026-05-25 (SH-6481 F15/F16/SAL-3) ───────────
  // The four operations docs (SKILL_AUDIT_LOOP.md § The Four Operations)
  // promise audit / improve / evaluate / evolve. Before this commit the CLI
  // exposed only audit + evolve and pointed users at raw lib/audit/* paths
  // for the other two. These three dispatchers close the gap by delegating
  // to existing runnable scripts; the docs and the CLI now agree.
  improve: {
    script: 'lib/audit/run-skill-improvement-loop.js',
    help: `Usage: skill-graph improve [options]\n\nKarpathy keep-or-revert improvement loop for a single skill or asset list.\n\nOptions:\n  --skill <name>          Improve a single named skill.\n  --asset-id <id>         Improve one asset (skill or eval) by id.\n  --mode <adapter>        Auto-improve adapter (prompt-evolution, perf, docs, …).\n  --lens <other-skill>    Apply another skill as an audit lens against this one.\n  --time-box <sec>        Per-field time box (default 1200).\n  --dry-run               Preview the field edit and the eval delta without committing.\n\nNotes:\n  - improve is the only operation that mutates the skill's instructional body.\n  - It auto-calls evaluate after the edit and keeps OR reverts based on eval_score.\n  - Stamps last_changed; never stamps last_audited (use 'audit' for that).\n\nSee: SKILL_AUDIT_LOOP.md § The Inner Pipeline of improve\n`,
  },
  evaluate: {
    script: 'lib/audit/evaluate-skill.js',
    help: `Usage: skill-graph evaluate [options] <eval-file>\n\nRun the eval suite for one skill and stamp the result back into the SKILL.md Health Block.\n\nArguments:\n  <eval-file>                  Path to evals/<skill>.json (or comprehension.json / application.json).\n\nOptions:\n  --mode <comprehension|application>   Which grader to run.\n  --application <skill-dir>            Required with --mode application; the skill's directory.\n  --dry-run                            Print what would be stamped without writing.\n\nWrites (when not --dry-run):\n  - eval_score, eval_failed_ids, freshness on the skill's Health Block.\n  - comprehension_verdict (when --mode comprehension runs).\n  - application_verdict + eval_last_run (when --mode application runs — the\n    primary quality signal per SKILL_AUDIT_LOOP.md § Audit Doctrine).\n\nSee: SKILL_AUDIT_LOOP.md § The Inner Pipeline of evaluate\n`,
  },
  status: {
    script: 'lib/audit/skill-status.js',
    help: `Usage: skill-graph status <skill-name> [options]\n\nRead-only view of a skill's Health Block (loop-stamped frontmatter fields).\n\nArguments:\n  <skill-name>      Skill directory name.\n\nOptions:\n  --json            Emit JSON instead of a human-readable table.\n  --audit-root <p>  Root directory for SKILL.md lookup (default: auto-detect).\n\nExit codes:\n  0  Success (including the graceful no-Health-Block case).\n  1  Fatal error (manifest unreadable, unexpected parse failure).\n\nSee: SKILL_AUDIT_LOOP.md § The Health Block — state lives on the skill\n`,
  },

  // ─── Legacy / additional subcommands (backward compat) ───────────────────
  manifest: {
    script: 'scripts/generate-manifest.js',
    help: `Usage: skill-graph manifest [options]\n\nGenerate or validate a skills.manifest.json from the skill library.\n\nOptions:\n  --validate-only   Validate only, do not write. Exits non-zero on invalid manifest.\n  --output <path>   Output path (default: skills.manifest.json).\n\nSee also: skill-graph protocol-check (cross-artifact consistency)\n`,
  },
  overlap: {
    script: 'scripts/skill-overlap.js',
    help: `Usage: skill-graph overlap [options]\n\nDetect duplicate activation signals (keywords, paths, triggers) across skills.\n\nFlags activation collisions where two or more skills would compete for the same routing query.\n`,
  },
  'routing-eval': {
    script: 'scripts/skill-graph-routing-eval.js',
    help: `Usage: skill-graph routing-eval [options]\n\nRun the routing examples and anti_examples from each skill's frontmatter through the live router.\n\nWhen --manifest is not given, regenerates a fresh manifest to .skill-graph/_routing-eval-cli.manifest.json before running, so the eval never reads stale local manifest state.\n\nOptions:\n  --manifest <path>     Use an existing manifest at <path> instead of regenerating.\n  --only-asserted       Only run examples with asserted expected skills.\n  --skill <name>        Evaluate one skill only.\n  --json                Emit structured JSON output.\n  --quiet               Exit-code only (CI).\n  --confusion-matrix    Print expected-vs-actual confusion matrix.\n  --baseline <path>     Run stratified retrieval baseline and report Recall@1/3.\n`,
  },
  'export-verify': {
    script: 'scripts/verify-skill-md-export.js',
    help: `Usage: skill-graph export-verify [path]\n\nVerify exported skills under marketplace/skills/ against the plain SKILL.md export shape contract.\n\nDefault path: marketplace/skills\n`,
  },
  'verify-skill-md': {
    script: 'scripts/verify-skill-md-export.js',
    help: `Usage: skill-graph verify-skill-md [path]\n\nAlias for 'export-verify'. Verify exported skills against the plain SKILL.md export shape.\n`,
  },
  'export:verify-skill-md': {
    script: 'scripts/verify-skill-md-export.js',
    help: `Usage: skill-graph export:verify-skill-md [path]\n\nAlias for 'export-verify'. Verify exported skills against the plain SKILL.md export shape.\n`,
  },
  'eval-staleness': {
    script: 'lib/audit/eval-staleness-checker.js',
    help: `Usage: skill-graph eval-staleness [options]

Check eval artifacts for stale file-path, line-range, and symbol claims.

Options:
  --skill <name>   Check only one skill's eval artifact.
  --json           Emit JSON output.
  --all            Check all evals, not just substance:"domain".

Examples:
  skill-graph eval-staleness
  skill-graph eval-staleness --skill graph-audit
  skill-graph eval-staleness --all --json
`,
  },
  'marketplace-export': {
    script: 'scripts/export-marketplace-skills.js',
    help: `Usage: skill-graph marketplace-export [options]\n\nGenerate and validate the public marketplace export surface (marketplace/ tree).\n\nOptions:\n  --output <dir>    Marketplace output root (default: marketplace).\n  --check           Validate only; fail if generated files are stale.\n`,
  },
  'marketplace:export': {
    script: 'scripts/export-marketplace-skills.js',
    help: `Usage: skill-graph marketplace:export [options]\n\nAlias for 'marketplace-export'. Generate and validate the public marketplace surface.\n`,
  },
  'protocol-check': {
    script: 'scripts/check-protocol-consistency.js',
    help: `Usage: skill-graph protocol-check [options]\n\nCheck cross-artifact protocol consistency across the invariants:\n\n  C1 — Field-set parity (field-reference.md vs skill.schema.json)\n  C2 — Authored-to-generated parity (skill.schema.json -> manifest.schema.json)\n  C3 — Artifact-root convention\n  C4 — Sample manifest correctness\n  C5 — Example truth invariants\n  C7 — Generated field-reference parity\n  C8 — JSON-LD context coverage (schema fields vs skill.context.jsonld)\n\nOptions:\n  --verbose   Print per-field diagnostics for each failed check.\n\nExit codes: 0 on PASS; non-zero on any FAIL.\n`,
  },
  doctor:  {
    inline: true,
    help: `Usage: skill-graph doctor [options]

Run the fast deterministic smoke checks in one pass and print a single summary table.
This is the recommended first command when filing a bug report or onboarding
a new install — it surfaces the core install and protocol health at a glance.

Checks executed (in order):
  links              scripts/check-markdown-links.js
  protocol           scripts/check-protocol-consistency.js
  drift              scripts/check-doc-drift.js
  mirror-freeze      scripts/check-mirror-freeze.js
  schema             scripts/check-schema-constants.js (v8 enum drift gate)
  lint               scripts/skill-lint.js
  manifest           scripts/generate-manifest.js --validate-only

Options:
  --json             Emit a JSON summary instead of the human table.
  --bail             Stop at the first failure instead of running every check.
  --skip <name>      Skip a check by short name (repeatable). Example: --skip lint

Exit codes: 0 if every check PASS; 1 if any check FAIL.
`,
  },
};

function printHelp() {
  process.stdout.write(`Usage: skill-graph <command> [args]

Commands:
  init             Scaffold a new SKILL.md from the official template
  add <slug>       Install a skill from the marketplace into your library
  lint [skill]     Validate SKILL.md files against the canonical-source schema lint gate
  audit <skill>    Run the Integrity Gate, write evidence artifacts, and stamp the Health Block (lint/structural verdicts)
  improve          Karpathy keep-or-revert improvement loop for one skill or asset
  evaluate         Run the eval suite for one skill and stamp comprehension_verdict / application_verdict
  status <skill>   Print the Health Block for a skill (read-only)
  route <query>    Select and explain skills for a natural-language query
  drift            Check or record grounding truth-source hashes (drift sentinel)
  export           Generate and validate the public marketplace export surface
  evolve           [PREVIEW] Continuous Karpathy-style skill-improvement loop (standalone; requires --workspace-root for non-cwd libraries)

The four operations (SKILL_AUDIT_LOOP.md § The Four Operations) are audit / improve / evaluate / evolve.

Diagnostics:
  doctor           Run fast deterministic smoke checks in one pass (recommended for bug reports)

Additional commands (retained for backward compatibility):
  manifest         Generate or validate a skills.manifest.json
  overlap          Detect duplicate activation signals across skills
  routing-eval     Run routing examples / anti_examples through the router
  export-verify    Verify exported skills against the plain SKILL.md export shape
  eval-staleness   Check eval artifacts for stale path and symbol claims
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
  skill-graph eval-staleness
  skill-graph export
  skill-graph doctor
  skill-graph evolve --top 5 --max-cycles 3
`);
}

// ---------------------------------------------------------------------------
// `init` — inline scaffolder
// ---------------------------------------------------------------------------
// Copies examples/skill-metadata-template.md into
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

  const templateSrc = path.join(REPO_ROOT, 'examples', 'skill-metadata-template.md');
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
    process.stdout.write(`  1. Edit ${destFile} — fill in name, description, subject, deployment_target, scope, etc.\n`);
    process.stdout.write(`  2. Strip all "# TEMPLATE NOTE:" comments and "> **TEMPLATE NOTE:**" blockquotes.\n`);
    process.stdout.write(`  3. Run: skill-graph lint ${slug}\n`);
  } else {
    process.stdout.write(`\nEdit SKILL.md and strip all template scaffolding before shipping.\n`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------------------
// `doctor` — run the fast deterministic smoke-check subset in one pass
// ---------------------------------------------------------------------------
// Aggregates the project's fast install/protocol checks behind one command so a
// reader (or bug-report filer) has an immediate health signal. Full verification
// remains `npm run verify`.

const DOCTOR_CHECKS = [
  { name: 'links',          script: 'scripts/check-markdown-links.js' },
  { name: 'protocol',       script: 'scripts/check-protocol-consistency.js' },
  { name: 'drift',          script: 'scripts/check-doc-drift.js' },
  { name: 'mirror-freeze',  script: 'scripts/check-mirror-freeze.js' },
  { name: 'schema',         script: 'scripts/check-schema-constants.js' },
  { name: 'lint',           script: 'scripts/skill-lint.js' },
  { name: 'manifest',       script: 'scripts/generate-manifest.js', args: ['--validate-only'] },
];

function runDoctor(args) {
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(COMMANDS.doctor.help);
    process.exit(0);
  }

  const asJson = args.includes('--json');
  const bail = args.includes('--bail');
  const skipList = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--skip' && args[i + 1]) skipList.push(args[i + 1]);
  }

  const results = [];
  for (const check of DOCTOR_CHECKS) {
    if (skipList.includes(check.name)) {
      results.push({ ...check, status: 'SKIP', exit_code: null, duration_ms: 0, tail: '' });
      continue;
    }
    const scriptPath = path.join(REPO_ROOT, check.script);
    if (!fs.existsSync(scriptPath)) {
      results.push({ ...check, status: 'MISSING', exit_code: null, duration_ms: 0, tail: 'script not found' });
      if (bail) break;
      continue;
    }
    const t0 = Date.now();
    const r = spawnSync('node', [scriptPath, ...(check.args || [])], {
      cwd: REPO_ROOT,
      env: {
        ...process.env,
        SKILL_GRAPH_PACKAGE_ROOT: REPO_ROOT,
        SKILL_GRAPH_WORKSPACE: REPO_ROOT,
      },
      encoding: 'utf8',
      timeout: 120_000,
    });
    const duration_ms = Date.now() - t0;
    const combined = (r.stdout || '') + (r.stderr || '');
    const tail = combined.trim().split('\n').slice(-1)[0] || '';
    const status = r.error ? 'ERROR' : r.status === 0 ? 'PASS' : 'FAIL';
    results.push({
      ...check,
      status,
      exit_code: r.status,
      duration_ms,
      tail: tail.slice(0, 240),
    });
    if (bail && status !== 'PASS' && status !== 'SKIP') break;
  }

  if (asJson) {
    process.stdout.write(JSON.stringify({ checks: results }, null, 2) + '\n');
  } else {
    const namePad = Math.max(...DOCTOR_CHECKS.map(c => c.name.length));
    process.stdout.write(`\nskill-graph doctor — ${results.length} check(s)\n\n`);
    for (const r of results) {
      const badge = r.status === 'PASS'
        ? '[32mPASS[0m'
        : r.status === 'SKIP'
          ? '[2mSKIP[0m'
          : `[31m${r.status}[0m`;
      const padded = r.name.padEnd(namePad);
      const time = r.duration_ms ? `${r.duration_ms}ms`.padStart(6) : '     —';
      process.stdout.write(`  ${badge}  ${padded}  ${time}  ${r.tail}\n`);
    }
    const failed = results.filter(r => r.status !== 'PASS' && r.status !== 'SKIP');
    process.stdout.write(
      failed.length === 0
        ? `\nAll ${results.length - results.filter(r => r.status === 'SKIP').length} check(s) PASS.\n`
        : `\n${failed.length} check(s) failed: ${failed.map(f => f.name).join(', ')}\n`
    );
  }

  const anyFail = results.some(r => r.status !== 'PASS' && r.status !== 'SKIP');
  process.exit(anyFail ? 1 : 0);
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
    if (command === 'init') { runInit(args); return; }
    if (command === 'doctor') { runDoctor(args); return; }
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
      // Prefer an explicit SKILL_GRAPH_WORKSPACE set by the caller (e.g. in tests
      // or when the user invokes `SKILL_GRAPH_WORKSPACE=/my/skills skill-graph audit`).
      // Fall back to the current working directory — the correct default for an installed CLI.
      SKILL_GRAPH_WORKSPACE: process.env.SKILL_GRAPH_WORKSPACE || process.cwd(),
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
