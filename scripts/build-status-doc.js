#!/usr/bin/env node
/**
 * Generate `docs/status.generated.md` — a single-source-of-truth status
 * snapshot that pulls live values from package.json, the schema, the
 * generated manifest, and the deterministic check scripts.
 *
 * The intent is to make the project's trust surface auditable from one URL:
 * a reader can see, without running any code, what the current package
 * version, schema version, skill count, and check states are.
 *
 * Usage:
 *   node scripts/build-status-doc.js               # write docs/status.generated.md
 *   node scripts/build-status-doc.js --check       # print summary, exit non-zero on drift
 *   node scripts/build-status-doc.js --stdout      # print to stdout, do not write file
 *   node scripts/build-status-doc.js --no-checks   # skip check execution (just version + count)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(REPO_ROOT, 'docs', 'status.generated.md');

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(REPO_ROOT, relPath), 'utf8'));
}

function runCheck(scriptRelPath, label) {
  const t0 = Date.now();
  const r = spawnSync('node', [scriptRelPath], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 60_000,
  });
  const duration_ms = Date.now() - t0;
  if (r.error) {
    return { label, status: 'ERROR', duration_ms, detail: r.error.message };
  }
  const tail = (r.stdout + r.stderr).trim().split('\n').slice(-1)[0] || '';
  return {
    label,
    status: r.status === 0 ? 'PASS' : 'FAIL',
    exit_code: r.status,
    duration_ms,
    detail: tail.slice(0, 200),
  };
}

function readSchemaVersion() {
  const schema = readJson('schemas/skill.schema.json');
  const sv = schema?.properties?.schema_version;
  if (typeof sv?.const === 'number') return sv.const;
  if (Array.isArray(sv?.oneOf)) {
    for (const b of sv.oneOf) if (typeof b.const === 'number') return b.const;
  }
  return 'unknown';
}

function readSkillCount() {
  const manifestPath = path.join(REPO_ROOT, 'skills.manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return Array.isArray(m.skills) ? m.skills.length : null;
}

function readMirrorStatus() {
  const adrPath = path.join(REPO_ROOT, 'docs', 'adr', '0009-sibling-repo-deprecation.md');
  if (!fs.existsSync(adrPath)) return 'unknown';
  return 'docs-only mirrors per ADR 0009 (2026-05-18)';
}

function renderMarkdown(state) {
  const { pkg, schema_version, skill_count, checks, generated_at, mirror_status } = state;
  const checkRow = c => {
    const badge = c.status === 'PASS' ? '✅ PASS' : c.status === 'SKIP' ? '⏭️  SKIP' : '❌ ' + c.status;
    const detail = c.detail ? c.detail.replace(/\|/g, '\\|') : '';
    return `| ${c.label} | ${badge} | ${c.duration_ms ?? '—'} ms | ${detail} |`;
  };

  return `# Skill Graph — Generated Status

> **Generated:** ${generated_at}
> **Generator:** \`node scripts/build-status-doc.js\` (regenerate; never hand-edit)
>
> This file is the single-source-of-truth status snapshot for the project's
> trust surface. Each value below is pulled from a deterministic origin:
> \`package.json\`, \`schemas/skill.schema.json\`, the generated manifest, ADR
> 0009, and the live exit code of each check script.

## Identity

| Field | Value | Source |
|---|---|---|
| Package name | \`${pkg.name}\` | \`package.json\` |
| Package version | \`${pkg.version}\` | \`package.json\` |
| Node engine | \`${pkg.engines?.node ?? '—'}\` | \`package.json\` |
| Active schema version | \`${schema_version}\` | \`schemas/skill.schema.json\` |
| Skill count (manifest) | \`${skill_count ?? '—'}\` | \`skills.manifest.json\` |
| Mirror status | ${mirror_status} | \`docs/adr/0009-sibling-repo-deprecation.md\` |

## Checks

| Check | Status | Duration | Last line |
|---|---|---|---|
${checks.map(checkRow).join('\n')}

## How to refresh

\`\`\`bash
node scripts/build-status-doc.js
\`\`\`

\`docs/status.generated.md\` is regenerated and overwritten each run. CI
should commit the regenerated file alongside any code that affects the
underlying values (package version bump, schema bump, new lint check,
etc.).

## What this replaces

- Hand-maintained "Latest release" lines in README hero sections (drifted three minor versions in Phase 1).
- Ad-hoc "skill count" claims scattered across docs (drifted from 137 → 141 → 145 in Phase 1 alone).
- Manual "we run these checks" lists in CONTRIBUTING.

The reader is now one URL away from the truth.
`;
}

function main() {
  const argv = process.argv.slice(2);
  const opts = {
    check: argv.includes('--check'),
    stdout: argv.includes('--stdout'),
    skipChecks: argv.includes('--no-checks'),
  };

  const pkg = readJson('package.json');
  const schema_version = readSchemaVersion();
  const skill_count = readSkillCount();
  const mirror_status = readMirrorStatus();
  const generated_at = new Date().toISOString();

  const checks = opts.skipChecks ? [] : [
    runCheck('scripts/check-markdown-links.js', 'check-markdown-links'),
    runCheck('scripts/check-protocol-consistency.js', 'check-protocol-consistency'),
    runCheck('scripts/check-doc-drift.js', 'check-doc-drift'),
    runCheck('scripts/check-mirror-freeze.js', 'check-mirror-freeze'),
  ];

  const state = { pkg, schema_version, skill_count, mirror_status, generated_at, checks };
  const markdown = renderMarkdown(state);

  if (opts.stdout) {
    process.stdout.write(markdown);
    process.exit(0);
  }

  fs.writeFileSync(OUTPUT_PATH, markdown);

  const failed = checks.filter(c => c.status !== 'PASS' && c.status !== 'SKIP');
  if (opts.check && failed.length > 0) {
    process.stderr.write(
      `FAIL build-status-doc: ${failed.length} check(s) not passing — see docs/status.generated.md\n`
    );
    process.exit(1);
  }

  process.stdout.write(
    `OK   wrote ${path.relative(REPO_ROOT, OUTPUT_PATH)} (${pkg.name}@${pkg.version}, schema v${schema_version}, ${skill_count ?? '?'} skills, ${checks.length} checks)\n`
  );
}

module.exports = { readSchemaVersion, readSkillCount, renderMarkdown, runCheck };

if (require.main === module) main();
