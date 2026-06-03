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
 *   node scripts/build-status-doc.js --check       # run checks and print summary; do not write
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

function runCheck(scriptRelPath, label, extraArgs = []) {
  const t0 = Date.now();
  const r = spawnSync('node', [scriptRelPath, ...extraArgs], {
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
  // `schema_version` moved from the frontmatter schema to the audit-state sidecar in the
  // ADR-0019 audit-state split (which contract a skill conforms to is a system/audit
  // concern, not part of the public Agent-Skills frontmatter). Read the sidecar schema
  // first; fall back to the frontmatter schema for pre-split back-compat. Without this
  // the status doc printed "schema vunknown" post-split (SH-6662).
  const sidecar = readJson('schemas/skill-audit-state.schema.json');
  const frontmatter = readJson('schemas/SKILL_METADATA_PROTOCOL_schema.json');
  const sv = sidecar?.properties?.schema_version ?? frontmatter?.properties?.schema_version;
  // const-shaped (older schemas): single value
  if (typeof sv?.const === 'number') return String(sv.const);
  // oneOf with const branches: pick the highest const
  if (Array.isArray(sv?.oneOf)) {
    const consts = sv.oneOf.map(b => b?.const).filter(c => typeof c === 'number');
    if (consts.length > 0) return String(Math.max(...consts));
    // oneOf with enum branches (current shape — integer + string back-compat enums)
    const allValues = sv.oneOf.flatMap(b => Array.isArray(b?.enum) ? b.enum : []);
    const numeric = allValues.map(v => Number(v)).filter(n => Number.isFinite(n));
    if (numeric.length > 0) return String(Math.max(...numeric));
  }
  // enum-shaped (no oneOf wrapper)
  if (Array.isArray(sv?.enum)) {
    const numeric = sv.enum.map(v => Number(v)).filter(n => Number.isFinite(n));
    if (numeric.length > 0) return String(Math.max(...numeric));
  }
  return 'unknown';
}

function readSkillCount() {
  const manifestPath = path.join(REPO_ROOT, 'skills.manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  return Array.isArray(m.skills) ? m.skills.length : null;
}

// Pull the corpus-wide verdict facets out of the generated manifest. These
// are written by scripts/generate-manifest.js::computeSummary() per ADR-0011
// § Addendum 2026-05-27. Returns null when the manifest is missing or has
// not yet been regenerated against the v9.X schema that introduced the
// verdict facets — callers must tolerate that absence.
function readManifestSummary() {
  const manifestPath = path.join(REPO_ROOT, 'skills.manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return m && typeof m.summary === 'object' ? m.summary : null;
  } catch {
    return null;
  }
}

function readMirrorStatus() {
  const adrPath = path.join(REPO_ROOT, 'docs', 'adr', '0009-sibling-repo-deprecation.md');
  if (!fs.existsSync(adrPath)) return 'unknown';
  return 'docs-only mirrors per ADR 0009 (2026-05-18)';
}

// Render the Audit Health section from the manifest summary's verdict facets.
// Per ADR-0011 § Addendum 2026-05-27, the doctrine is eligibility ≠ assessment ≠
// certification. The three sub-tables below render exactly that split so a
// reader can answer "how many are certified?" not "how many are passing?"
function renderAuditHealthSection(summary, skillCount) {
  if (!summary) {
    return `## Audit Health

> _Audit Health facets are not yet available — regenerate the manifest with the post-ADR-0011-addendum \`generate-manifest.js\` to populate \`by_audit_state\`, \`by_application_verdict\`, and \`harmful_skill_count\` in \`skills.manifest.json\`._

`;
  }

  const state = summary.by_audit_state || {};
  const apps = summary.by_application_verdict || {};
  const compr = summary.by_comprehension_verdict || {};
  const struc = summary.by_structural_verdict || {};
  const truth = summary.by_truth_verdict || {};
  const total = skillCount ?? summary.total_skills ?? 0;
  const harmful = summary.harmful_skill_count ?? 0;

  const get = (obj, key) => obj[key] || 0;
  const notAdmitted = get(state, 'not_admitted');
  const admittedUnassessed = get(state, 'admitted_unassessed');
  const assessedProv = get(state, 'assessed_provisional');
  const assessedGraded = get(state, 'assessed_graded');
  const admitted = admittedUnassessed + assessedProv + assessedGraded;
  const certifiedUseful = get(apps, 'APPLICABLE');

  // Comprehension scope carve-out per ADR-0011 § Addendum 2026-05-20:
  // SKIPPED_BASELINE_HIGH and NA are NOT comprehension-unassessed — they
  // are the framework-concept and no-comprehension-layer-by-design cases.
  const frameworkOrNa = get(compr, 'SKIPPED_BASELINE_HIGH') + get(compr, 'NA');
  const comprUnassessed = get(compr, 'UNVERIFIED');
  const comprGraded = total - frameworkOrNa - comprUnassessed;

  const harmfulCallout = harmful > 0
    ? `\n> **⚠️ HARMFUL skills detected:** \`${harmful}\` skill${harmful === 1 ? '' : 's'} carry \`application_verdict: HARMFUL\` — they make agents worse than running without the skill (SkillsBench arXiv 2602.12670 found 19% of evaluated skills fall in this band). These are not warnings to skim; they are removal candidates pending the deprecate/fold/reframe decision per \`code-preservation\` rules.\n`
    : '';

  return `## Audit Health

> The three tables below answer **eligibility**, **assessment**, and **certification** as distinct questions (per [ADR-0011 § Addendum 2026-05-27](adr/0011-split-audit-verdict-into-four-verdicts.md) and [\`docs/verdict-semantics.md\`](verdict-semantics.md)). A skill passing structural and truth checks is **admitted** — eligible for assessment, not yet certified. Only \`application_verdict == APPLICABLE\` certifies useful behavior change.
${harmfulCallout}
### Admission (eligibility)

| State | Count | What it means |
|---|---|---|
| Admitted | \`${admitted}\` / \`${total}\` | Structural + truth verdicts both PASS — skill is eligible for quality assessment. |
| Not admitted | \`${notAdmitted}\` | Structural or truth gate failing — skill is not yet eligible. |

Per-verdict breakdown:

| Verdict | structural | truth |
|---|---|---|
| PASS | \`${get(struc, 'PASS')}\` | \`${get(truth, 'PASS')}\` |
| PASS_WITH_FIXES | \`${get(struc, 'PASS_WITH_FIXES')}\` | — |
| FAIL | \`${get(struc, 'FAIL')}\` | — |
| DRIFT | — | \`${get(truth, 'DRIFT')}\` |
| BROKEN | — | \`${get(truth, 'BROKEN')}\` |
| UNVERIFIED | \`${get(struc, 'UNVERIFIED')}\` | \`${get(truth, 'UNVERIFIED')}\` |

### Assessment (has the behavior gate run?)

| State | Count | Confidence tier |
|---|---|---|
| Admitted, unassessed | \`${admittedUnassessed}\` | No gate 9 run — \`pending — eligible only\` |
| Assessed (provisional) | \`${assessedProv}\` | Single-model assessment — awaiting dual-run grader |
| Assessed (graded) | \`${assessedGraded}\` | Dual-run grader confirmed |

Comprehension carve-out (per ADR-0011 § Addendum 2026-05-20):

| State | Count | Note |
|---|---|---|
| Framework concept or no comprehension layer (\`SKIPPED_BASELINE_HIGH\` / \`NA\`) | \`${frameworkOrNa}\` | Comprehension legitimately does not apply — model already knows the concept or the skill ships none. |
| Comprehension graded | \`${comprGraded}\` | Comprehension grader produced a real verdict. |
| Comprehension unassessed | \`${comprUnassessed}\` | Repo-specific skill awaiting gate-8 run. |

### Certification (the only number worth bragging about)

| Outcome | Count |
|---|---|
| **APPLICABLE** (certified useful) | \`${certifiedUseful}\` |
| PROVISIONAL (single-model APPLICABLE-equivalent) | \`${get(apps, 'PROVISIONAL')}\` |
| REDUNDANT (no behavioral delta) | \`${get(apps, 'REDUNDANT')}\` |
| MIXED (delta varies by case) | \`${get(apps, 'MIXED')}\` |
| FALSE_POSITIVE (skill over-triggers) | \`${get(apps, 'FALSE_POSITIVE')}\` |
| HARMFUL (makes agents worse) | \`${harmful}\` |
| UNVERIFIED (no assessment) | \`${get(apps, 'UNVERIFIED')}\` |

`;
}

function renderMarkdown(state) {
  const { pkg, schema_version, skill_count, checks, generated_at, mirror_status, summary } = state;
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
> \`package.json\`, \`schemas/SKILL_METADATA_PROTOCOL_schema.json\`, the generated manifest, ADR
> 0009, and the live exit code of each check script.

## Identity

| Field | Value | Source |
|---|---|---|
| Package name | \`${pkg.name}\` | \`package.json\` |
| Package version | \`${pkg.version}\` | \`package.json\` |
| Node engine | \`${pkg.engines?.node ?? '—'}\` | \`package.json\` |
| Active schema version | \`${schema_version}\` | \`schemas/skill-audit-state.schema.json\` (moved from frontmatter schema per ADR-0019) |
| Skill count (manifest) | \`${skill_count ?? '—'}\` | \`skills.manifest.json\` |
| Mirror status | ${mirror_status} | \`docs/adr/0009-sibling-repo-deprecation.md\` |

## Checks

| Check | Status | Duration | Last line |
|---|---|---|---|
${checks.map(checkRow).join('\n')}

${renderAuditHealthSection(summary, skill_count)}## How to refresh

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

// Strip time-varying fields so --check can compare rendered output against the
// on-disk file without false positives from regeneration noise.
function normalizeForCompare(markdown) {
  return markdown
    .replace(/^> \*\*Generated:\*\* .+$/m, '> **Generated:** <stripped>')
    .replace(/\| \d+ ms \|/g, '| <stripped> ms |');
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
  const summary = readManifestSummary();
  const mirror_status = readMirrorStatus();
  const generated_at = new Date().toISOString();

  const checks = opts.skipChecks ? [] : [
    runCheck('scripts/check-markdown-links.js', 'check-markdown-links'),
    runCheck('scripts/check-protocol-consistency.js', 'check-protocol-consistency'),
    runCheck('scripts/check-doc-drift.js', 'check-doc-drift'),
    runCheck('scripts/check-mirror-freeze.js', 'check-mirror-freeze'),
    runCheck('scripts/export-marketplace-skills.js', 'marketplace-export-check', ['--check']),
    // NOTE: skill-graph-drift.js and check-audit-manifest.js are intentionally
    // NOT surfaced here — they are gated by CONTENT-side audit-loop work
    // (audit findings H9 and H10, 2026-05-27). Surface them once the per-skill
    // drift baselines are re-recorded and the comprehension.json artifacts are
    // committed for the 15 graded-comprehension claims.
  ];

  const state = { pkg, schema_version, skill_count, summary, mirror_status, generated_at, checks };
  const markdown = renderMarkdown(state);

  if (opts.stdout) {
    process.stdout.write(markdown);
    process.exit(0);
  }

  if (!opts.check) {
    fs.writeFileSync(OUTPUT_PATH, markdown);
  }

  // --check has two failure modes: (1) underlying checks failing, (2) on-disk
  // status doc is stale relative to what would be regenerated right now.
  const failures = [];

  const failedChecks = checks.filter(c => c.status !== 'PASS' && c.status !== 'SKIP');
  if (opts.check && failedChecks.length > 0) {
    failures.push(`${failedChecks.length} check(s) not passing: ${failedChecks.map(c => c.label).join(', ')}`);
  }

  if (opts.check && fs.existsSync(OUTPUT_PATH)) {
    const onDisk = fs.readFileSync(OUTPUT_PATH, 'utf8');
    if (normalizeForCompare(onDisk) !== normalizeForCompare(markdown)) {
      failures.push(
        `${path.relative(REPO_ROOT, OUTPUT_PATH)} is stale relative to current state — run \`node scripts/build-status-doc.js\` to regenerate and commit the result.`
      );
    }
  } else if (opts.check && !fs.existsSync(OUTPUT_PATH)) {
    failures.push(
      `${path.relative(REPO_ROOT, OUTPUT_PATH)} does not exist — run \`node scripts/build-status-doc.js\` to generate it.`
    );
  }

  if (failures.length > 0) {
    for (const msg of failures) process.stderr.write(`FAIL build-status-doc: ${msg}\n`);
    process.exit(1);
  }

  process.stdout.write(
    `OK   ${opts.check ? 'checked' : 'wrote'} ${path.relative(REPO_ROOT, OUTPUT_PATH)} (${pkg.name}@${pkg.version}, schema v${schema_version}, ${skill_count ?? '?'} skills, ${checks.length} checks)\n`
  );
}

module.exports = { readSchemaVersion, readSkillCount, readManifestSummary, renderMarkdown, renderAuditHealthSection, runCheck };

if (require.main === module) main();
