#!/usr/bin/env node
/**
 * Generates docs/status.generated.md — a checked-in snapshot of the project's
 * current invariants: package version, schema version, skill count, and the
 * pass/fail state of every deterministic check the repo ships.
 *
 * Re-runnable. Consumers should never hand-edit the output; re-run this script
 * after any change that affects the invariants and commit the regenerated file
 * in the same change.
 *
 * Exit codes:
 *   0  — file written
 *   1  — io error or unrecoverable inconsistency (e.g. schema version unreadable)
 *
 * Flags:
 *   --check    Compare current output against the on-disk file; exit 1 if drift.
 *              Used by CI to enforce that the status doc tracks reality.
 *   --output   Output path (default: docs/status.generated.md).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const { workspaceRoot } = require('./lib/roots');
const REPO_ROOT = workspaceRoot();
const PACKAGE_JSON = path.join(REPO_ROOT, 'package.json');
const SKILL_SCHEMA = path.join(REPO_ROOT, 'schemas', 'skill.schema.json');
const MANIFEST_SAMPLE = path.join(REPO_ROOT, 'examples', 'skills.manifest.sample.json');
const DEFAULT_OUTPUT = path.join(REPO_ROOT, 'docs', 'status.generated.md');

function readPackageVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  return pkg.version;
}

function readSchemaVersion() {
  const schema = JSON.parse(fs.readFileSync(SKILL_SCHEMA, 'utf8'));
  const sv = schema?.properties?.schema_version;
  if (typeof sv?.const === 'number') return sv.const;
  if (Array.isArray(sv?.oneOf)) {
    for (const branch of sv.oneOf) {
      if (typeof branch.const === 'number') return branch.const;
    }
  }
  throw new Error(`Unsupported schema_version shape in ${SKILL_SCHEMA}`);
}

function countSkills() {
  try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_SAMPLE, 'utf8'));
    if (!Array.isArray(manifest.skills)) return null;
    // The sample is regenerated with --include-template, which adds the
    // skill-metadata-template entry. Exclude it so the user-facing count
    // matches the canonical-skills count surfaced by `--validate-only`.
    return manifest.skills.filter(s => s?.name !== 'skill-metadata-template').length;
  } catch {
    return null;
  }
}

function runCheck(label, command, args, opts = {}) {
  const started = Date.now();
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const durationMs = Date.now() - started;
  const status = result.status === 0 ? 'OK' : 'FAIL';
  return {
    label,
    command: `${command} ${args.join(' ')}`,
    status,
    exit: result.status,
    durationMs,
    summary: extractSummary(result.stdout, result.stderr, opts),
  };
}

function extractSummary(stdout, stderr, opts = {}) {
  const lines = `${stdout}\n${stderr}`.split(/\r?\n/).filter(Boolean);
  if (opts.summaryMatch) {
    const match = lines.find(l => opts.summaryMatch.test(l));
    if (match) return match.trim();
  }
  // Default: last non-empty line, which is usually the verdict.
  return lines.length ? lines[lines.length - 1].trim() : '';
}

function readGitCommit() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: REPO_ROOT, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function buildMarkdown({ packageVersion, schemaVersion, skillCount, checks, gitCommit }) {
  const generatedAt = new Date().toISOString();
  const lines = [];
  lines.push('# Skill Graph — Current Status');
  lines.push('');
  lines.push('> _Generated artifact. Source of truth: `scripts/build-status.js`._');
  lines.push(`> _Generated: ${generatedAt}_`);
  lines.push(`> _Commit: \`${gitCommit}\`_`);
  lines.push('');
  lines.push('Re-run with `node scripts/build-status.js` after any change that affects these invariants. CI enforces `--check` parity.');
  lines.push('');
  lines.push('## Invariants');
  lines.push('');
  lines.push('| Field | Value | Source |');
  lines.push('|---|---|---|');
  lines.push(`| Package | \`@skill-graph/cli\` | \`package.json\` |`);
  lines.push(`| Package version | \`${packageVersion}\` | \`package.json\` |`);
  lines.push(`| Current schema_version | \`${schemaVersion}\` | \`schemas/skill.schema.json\` |`);
  lines.push(`| Skill count (canonical) | \`${skillCount == null ? 'unknown' : skillCount}\` | \`examples/skills.manifest.sample.json\` |`);
  lines.push('');
  lines.push('## Deterministic checks');
  lines.push('');
  lines.push('All checks below run against the canonical workspace at session-pinned cwd. Run `npm run verify` to reproduce.');
  lines.push('');
  lines.push('| Check | Status | Exit | Summary |');
  lines.push('|---|---|---|---|');
  for (const check of checks) {
    const summary = check.summary.replace(/\|/g, '\\|').slice(0, 240);
    lines.push(`| ${check.label} | ${check.status === 'OK' ? '✅ OK' : '❌ FAIL'} | ${check.exit} | ${summary} |`);
  }
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  lines.push('- A `FAIL` row here is a contract violation; the project ships its checks green or not at all.');
  lines.push('- The skill count reflects the canonical sibling skill library (`../skills/skills/`) projected through the manifest sample; the manifest sample is itself regenerated by `scripts/generate-manifest.js --include-template`.');
  lines.push('- The doctor subcommand (`skill-graph doctor`) groups the same checks with a non-zero exit on any failure.');
  lines.push('');
  return lines.join('\n');
}

function main() {
  const argv = process.argv.slice(2);
  const checkOnly = argv.includes('--check');
  const outputIdx = argv.indexOf('--output');
  const output = outputIdx >= 0 ? path.resolve(REPO_ROOT, argv[outputIdx + 1]) : DEFAULT_OUTPUT;

  const packageVersion = readPackageVersion();
  const schemaVersion = readSchemaVersion();
  const skillCount = countSkills();
  const gitCommit = readGitCommit();

  const checks = [
    runCheck('Markdown links', 'node', ['scripts/check-markdown-links.js'], {
      summaryMatch: /^(OK|FAIL)\s+markdown/,
    }),
    runCheck('Protocol consistency', 'node', ['scripts/check-protocol-consistency.js'], {
      summaryMatch: /^(PASS|FAIL):/,
    }),
    runCheck('Manifest validation', 'node', ['scripts/generate-manifest.js', '--validate-only'], {
      summaryMatch: /^(OK|FAIL)\s+manifest/,
    }),
    runCheck('Schema-version doc-drift sentinel', 'node', ['scripts/check-doc-drift.js'], {
      summaryMatch: /^(OK|FAIL)\s+doc drift/,
    }),
    runCheck('Mirror-freeze sentinel', 'node', ['scripts/check-mirror-freeze.js'], {
      summaryMatch: /^(OK|FAIL)\s+mirror/,
    }),
    runCheck('Skill lint (errors only)', 'node', ['scripts/skill-lint.js', '--no-color']),
  ];

  const markdown = buildMarkdown({ packageVersion, schemaVersion, skillCount, checks, gitCommit });

  if (checkOnly) {
    let onDisk = '';
    try { onDisk = fs.readFileSync(output, 'utf8'); } catch { onDisk = ''; }
    // Strip the timestamp + commit lines before comparing; they change every run.
    const stripVolatile = s => s
      .replace(/^> _Generated:.*$/m, '')
      .replace(/^> _Commit:.*$/m, '');
    if (stripVolatile(onDisk) === stripVolatile(markdown)) {
      process.stdout.write(`OK   status.generated.md matches current state (${output})\n`);
      process.exit(0);
    }
    process.stderr.write(`FAIL status.generated.md is out of date — run \`node scripts/build-status.js\` and commit\n`);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, markdown + '\n', 'utf8');
  process.stdout.write(`OK   wrote ${path.relative(REPO_ROOT, output)} (${checks.length} checks, version ${packageVersion}, schema_version ${schemaVersion}, ${skillCount ?? '?'} skills)\n`);
}

module.exports = { readPackageVersion, readSchemaVersion, countSkills, buildMarkdown };

if (require.main === module) main();
