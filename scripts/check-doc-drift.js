#!/usr/bin/env node
/**
 * Schema-version drift sentinel for documentation.
 *
 * Reads the active schema_version from schemas/SKILL_METADATA_PROTOCOL_schema.json and scans
 * active .md docs for stale references like `schema_version: 4`, `v4 today`,
 * `equals \`5\``, stale prose phrases like `v6 frontmatter` / `v5 protocol` /
 * `v4 top-level fields`, and similar patterns that would teach old contracts.
 *
 * Allowlist:
 *   - Files under `docs/migrations/` (intentionally cite multiple versions)
 *   - Files matching `CHANGELOG.md` at any depth (release notes cite versions)
 *   - Files under `examples/` (test fixtures and sample skills intentionally
 *     test multiple schema versions and historical exports)
 *   - Filenames containing `migration` or `compatibility` (cross-version docs)
 *   - Any git-ignored path (e.g. `dist/`, `.cache/`) — throwaway build/A-B
 *     output is not an active doc (filtered via `git check-ignore`; SH-6638)
 *
 * Each finding includes file:line and the offending fragment.
 *
 * Exit codes:
 *   0  — no drift in active docs
 *   1  — at least one drift hit in an active doc
 *
 * Flags:
 *   --json          Emit findings as JSON
 *   --quiet         Only print failure summary line
 *   --include-warn  Report warning-class hits (e.g. raw `v4`, `v5` mentions)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const SKILL_SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json');
// ADR-0019: `schema_version` moved from the frontmatter schema to the audit-state
// sidecar schema (which contract a skill conforms to is a system/audit concern, not
// part of the public Agent-Skills frontmatter). The active-version source of truth is
// now the sidecar schema; the frontmatter schema is kept as a back-compat fallback for
// pre-cut trees retrieved from git history.
const AUDIT_STATE_SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'skill-audit-state.schema.json');
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.artifacts', '.roundtable', 'marketplace']);

function readActiveSchemaVersion() {
  // Read schema_version from the sidecar schema first (its post-ADR-0019 home), then
  // fall back to the frontmatter schema (pre-cut shape). Either source resolves to the
  // same canonical-version constraint; only the file that owns the field moved.
  let svSchemaPath = AUDIT_STATE_SCHEMA_PATH;
  let sv = null;
  if (fs.existsSync(AUDIT_STATE_SCHEMA_PATH)) {
    sv = JSON.parse(fs.readFileSync(AUDIT_STATE_SCHEMA_PATH, 'utf8'))?.properties?.schema_version || null;
  }
  if (!sv) {
    svSchemaPath = SKILL_SCHEMA_PATH;
    sv = JSON.parse(fs.readFileSync(SKILL_SCHEMA_PATH, 'utf8'))?.properties?.schema_version || null;
  }
  if (!sv) throw new Error(`Cannot resolve schema_version constraint in ${AUDIT_STATE_SCHEMA_PATH} or ${SKILL_SCHEMA_PATH}`);
  // Supported shapes (in order of historical evolution):
  //   { const: N }                                — single-version contract (pre-v7)
  //   { oneOf: [{ const: N }, { const: "N" }] }  — single-version w/ string back-compat (v7)
  //   { oneOf: [{ enum: [N, M] }, { enum: ["N", "M"] }] }  — multi-version compatibility
  //                                                window (v7+v8 during the v7→v8
  //                                                migration).
  // For doc-drift purposes, return the CANONICAL (highest) version. Older
  // versions in the enum are accepted by the schema as deprecated back-compat
  // reads, NOT as a current authoring path — references to them in current-
  // state docs are drift. Legitimate historical context (migrations, CHANGELOG,
  // examples, ADRs that describe the migration itself) is
  // allowlisted in isAllowlisted() below.
  if (typeof sv.const === 'number') return sv.const;
  if (Array.isArray(sv.oneOf)) {
    const ints = [];
    for (const branch of sv.oneOf) {
      if (typeof branch.const === 'number') ints.push(branch.const);
      if (Array.isArray(branch.enum)) {
        for (const v of branch.enum) {
          if (typeof v === 'number') ints.push(v);
        }
      }
    }
    if (ints.length > 0) return Math.max(...ints);
  }
  throw new Error(`Unsupported schema_version shape in ${svSchemaPath}`);
}

function isAllowlisted(absPath) {
  const rel = path.relative(REPO_ROOT, absPath).split(path.sep);
  if (rel.some(seg => seg === '_drafts')) return true;
  if (rel[0] === 'audits') return true;
  if (rel[0] === 'docs' && rel[1] === 'migrations') return true;
  if (rel[0] === 'docs' && rel[1] === 'adr') return true;
  if (rel[0] === 'docs' && rel[1] === 'research') return true;
  if (rel[0] === 'docs' && rel[1] === 'plans') return true;
  if (rel[0] === 'examples') return true;
  if (path.basename(absPath) === 'CHANGELOG.md') return true;
  const base = path.basename(absPath).toLowerCase();
  if (base.includes('migration') || base.includes('compatibility')) return true;
  return false;
}

function collectMarkdownFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && IGNORED_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) collectMarkdownFiles(abs, out);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) out.push(abs);
  }
  return out;
}

// Drop paths git ignores (e.g. `dist/`, `.cache/`, `.opencode/` — throwaway A/B
// harness dumps and build output that carry old SKILL.md copies with stale
// schema_version labels). Those are not "active docs"; scanning them produced
// 34 false-positive drift reds in `npm run verify:system` (SH-6638). One
// `git check-ignore --stdin` pass is authoritative against .gitignore and any
// parent-dir ignore, so this also covers future ignored output dirs without
// hardcoding each one. Fail-open: if git is unavailable or this is not a git
// repo, return the list unchanged (the gate must never crash on infra absence).
function filterGitIgnored(files, repoRoot) {
  if (!Array.isArray(files) || files.length === 0) return files;
  const rel = files.map((f) => path.relative(repoRoot, f));
  let stdout = '';
  try {
    stdout = execFileSync('git', ['check-ignore', '--stdin'], {
      cwd: repoRoot,
      input: rel.join('\n'),
      encoding: 'utf8',
    });
  } catch (err) {
    // git check-ignore exits 1 when NONE of the paths are ignored — not an
    // error, the stdout (empty) is still valid. Any other status (128 = not a
    // git repo, ENOENT = git not installed) → fail open and scan everything.
    if (err && err.status === 1) {
      stdout = err.stdout ? err.stdout.toString() : '';
    } else {
      return files;
    }
  }
  const ignored = new Set(
    stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
  );
  if (ignored.size === 0) return files;
  return files.filter((f) => !ignored.has(path.relative(repoRoot, f)));
}

function buildPatterns(activeVersion) {
  // Patterns that name an explicit non-current version.
  const errorPatterns = [];
  for (let v = 1; v < activeVersion; v++) {
    errorPatterns.push({
      kind: 'schema_version',
      regex: new RegExp(String.raw`\bschema_version:\s*"?${v}"?\b`),
      version: v,
    });
    errorPatterns.push({
      kind: 'schema_version-equals',
      regex: new RegExp(String.raw`equals\s*\`${v}\``),
      version: v,
    });
    errorPatterns.push({
      kind: 'schema_version-tracks-latest',
      regex: new RegExp(String.raw`tracks\s+latest\s*\(v${v}\s+today\)`, 'i'),
      version: v,
    });
  }
  // Loose patterns reported only with --include-warn (advisory, non-failing).
  const warnPatterns = [];
  for (let v = 1; v < activeVersion; v++) {
    warnPatterns.push({
      kind: 'bare-version-token',
      regex: new RegExp(String.raw`\bv${v}\b(?!\s*-?to-?)`),
      version: v,
      suppressInLegacyContext: true,
    });
    // Prose phrases that qualify a contract noun with a non-current version
    // (e.g. "v6 frontmatter", "v5 protocol shape", "v4 top-level fields") —
    // the drift class that produced the 2026-05-20 AGENTS.md/SKILL_GRAPH.md
    // rot. Warn-class, not error: legitimately describing an old version as
    // "legacy"/"back-compat"/"deprecated" is correct, not drift, so lines
    // carrying legacy-context keywords are suppressed (see LEGACY_CONTEXT_RE).
    warnPatterns.push({
      kind: 'stale-version-phrase',
      regex: new RegExp(String.raw`\bv${v}\s+(?:frontmatter|protocol|contract|schema|field|fields|top-level|shape)\b`, 'i'),
      version: v,
      suppressInLegacyContext: true,
    });
  }
  return { errorPatterns, warnPatterns };
}

// Heading-level allowlist: when inside a migration section (e.g. `## v4 -> v5`
// or `### v5 → v6 (historical)`), lines are treated as migration context and
// not reported. The section ends at the next heading at the same level or
// shallower.
function buildMigrationSectionMask(lines) {
  const mask = new Array(lines.length).fill(false);
  let inMigration = false;
  let migrationDepth = 0;
  const migrationHeadingRe = /^(#{2,6})\s+.*\bv\d+\s*(?:->|→|to)\s*v\d+\b/i;
  const headingRe = /^(#{1,6})\s+/;

  lines.forEach((line, idx) => {
    const mh = line.match(migrationHeadingRe);
    if (mh) {
      inMigration = true;
      migrationDepth = mh[1].length;
      return;
    }
    if (inMigration) {
      const hh = line.match(headingRe);
      if (hh && hh[1].length <= migrationDepth) {
        inMigration = false;
      }
    }
    mask[idx] = inMigration;
  });
  return mask;
}

// Lines that legitimately describe an old version as historical/back-compat
// are not drift. Patterns flagged `suppressInLegacyContext` skip these.
const LEGACY_CONTEXT_RE = /\b(legacy|deprecated|back-?compat|backward|historical|superseded|supersedes|retired|frozen|pinned|strict superset|allOf|anyOf|prior version|previous|earlier)\b/i;

function scanFile(absPath, patterns) {
  const text = fs.readFileSync(absPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const migrationMask = buildMigrationSectionMask(lines);
  const hits = [];
  lines.forEach((line, idx) => {
    if (migrationMask[idx]) return;
    const legacyContext = LEGACY_CONTEXT_RE.test(line);
    for (const p of patterns) {
      if (p.suppressInLegacyContext && legacyContext) continue;
      if (p.regex.test(line)) {
        hits.push({
          file: path.relative(REPO_ROOT, absPath),
          line: idx + 1,
          kind: p.kind,
          version: p.version,
          snippet: line.trim().slice(0, 240),
        });
      }
    }
  });
  return hits;
}

function main() {
  const argv = process.argv.slice(2);
  const opts = {
    json: argv.includes('--json'),
    quiet: argv.includes('--quiet'),
    includeWarn: argv.includes('--include-warn'),
  };

  const activeVersion = readActiveSchemaVersion();
  const { errorPatterns, warnPatterns } = buildPatterns(activeVersion);

  const files = filterGitIgnored(
    collectMarkdownFiles(REPO_ROOT).filter(f => !isAllowlisted(f)),
    REPO_ROOT,
  ).sort((a, b) => a.localeCompare(b));

  const errorHits = [];
  const warnHits = [];
  for (const file of files) {
    errorHits.push(...scanFile(file, errorPatterns));
    if (opts.includeWarn) warnHits.push(...scanFile(file, warnPatterns));
  }

  if (opts.json) {
    process.stdout.write(JSON.stringify({
      active_schema_version: activeVersion,
      files_scanned: files.length,
      errors: errorHits,
      warnings: warnHits,
    }, null, 2) + '\n');
    process.exit(errorHits.length > 0 ? 1 : 0);
  }

  if (!opts.quiet) {
    if (warnHits.length > 0) {
      for (const h of warnHits) {
        process.stderr.write(`WARN ${h.file}:${h.line} [${h.kind}] ${h.snippet}\n`);
      }
    }
    for (const h of errorHits) {
      process.stderr.write(`${h.file}:${h.line} [${h.kind} v${h.version}] ${h.snippet}\n`);
    }
  }

  if (errorHits.length > 0) {
    process.stderr.write(`FAIL doc drift: ${errorHits.length} stale schema-version reference(s) in active docs (active v${activeVersion}). Allowlisted: _drafts/, audits/, docs/{migrations,adr,research,plans}/, examples/, CHANGELOG.md.\n`);
    process.exit(1);
  }

  const warnNote = opts.includeWarn && warnHits.length > 0
    ? ` (${warnHits.length} warning(s) reported)`
    : '';
  process.stdout.write(`OK   doc drift sentinel: ${files.length} active doc(s) scanned against schema v${activeVersion}${warnNote}\n`);
}

module.exports = {
  buildMigrationSectionMask,
  buildPatterns,
  collectMarkdownFiles,
  filterGitIgnored,
  isAllowlisted,
  readActiveSchemaVersion,
  scanFile,
};

if (require.main === module) main();
