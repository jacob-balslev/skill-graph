#!/usr/bin/env node
/**
 * Schema-version drift sentinel for documentation.
 *
 * Reads the active schema_version from schemas/skill.schema.json and scans
 * active .md docs for stale references like `schema_version: 4`, `v4 today`,
 * `equals \`5\``, and similar patterns that would teach old contracts.
 *
 * Allowlist:
 *   - Files under any `_archived/` segment (historical snapshots)
 *   - Files under `docs/migrations/` (intentionally cite multiple versions)
 *   - Files matching `CHANGELOG.md` at any depth (release notes cite versions)
 *   - Files under `examples/` (test fixtures and sample skills intentionally
 *     test multiple schema versions and historical exports)
 *   - Filenames containing `migration` or `compatibility` (cross-version docs)
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
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const SKILL_SCHEMA_PATH = path.join(REPO_ROOT, 'schemas', 'skill.schema.json');
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.artifacts', '.roundtable', 'marketplace']);

function readActiveSchemaVersion() {
  const schema = JSON.parse(fs.readFileSync(SKILL_SCHEMA_PATH, 'utf8'));
  const sv = schema?.properties?.schema_version;
  if (!sv) throw new Error(`Cannot resolve schema_version constraint in ${SKILL_SCHEMA_PATH}`);
  // schema may be `{ const: N }` or `{ oneOf: [{ const: N }, { const: "N" }] }`
  if (typeof sv.const === 'number') return sv.const;
  if (Array.isArray(sv.oneOf)) {
    for (const branch of sv.oneOf) {
      if (typeof branch.const === 'number') return branch.const;
    }
  }
  throw new Error(`Unsupported schema_version shape in ${SKILL_SCHEMA_PATH}`);
}

function isAllowlisted(absPath) {
  const rel = path.relative(REPO_ROOT, absPath).split(path.sep);
  if (rel.some(seg => seg === '_archived')) return true;
  if (rel[0] === 'docs' && rel[1] === 'migrations') return true;
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
  // Loose patterns reported only with --include-warn.
  const warnPatterns = [];
  for (let v = 1; v < activeVersion; v++) {
    warnPatterns.push({
      kind: 'bare-version-token',
      regex: new RegExp(String.raw`\bv${v}\b(?!\s*-?to-?)`),
      version: v,
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

function scanFile(absPath, patterns) {
  const text = fs.readFileSync(absPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const migrationMask = buildMigrationSectionMask(lines);
  const hits = [];
  lines.forEach((line, idx) => {
    if (migrationMask[idx]) return;
    for (const p of patterns) {
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

  const files = collectMarkdownFiles(REPO_ROOT)
    .filter(f => !isAllowlisted(f))
    .sort((a, b) => a.localeCompare(b));

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
    process.stderr.write(`FAIL doc drift: ${errorHits.length} stale schema-version reference(s) in active docs (active v${activeVersion}). Allowlisted: _archived/, docs/migrations/, CHANGELOG.md.\n`);
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
  isAllowlisted,
  readActiveSchemaVersion,
  scanFile,
};

if (require.main === module) main();
