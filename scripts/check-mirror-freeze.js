#!/usr/bin/env node
/**
 * Mirror-freeze linter.
 *
 * Scans the two docs-only deprecation mirror repos (`skill-metadata-protocol`,
 * `skill-audit-loop`) for content that contradicts their post-ADR-0009
 * docs-only status: active-package version claims, references to source
 * directories that no longer exist there (src/, evals/, lib/schemas/), or
 * live-contribution language that would mislead users into filing issues or
 * PRs against an inert repo.
 *
 * The script is read-only. It exits 1 when active claims are found in the
 * mirrors, 0 when the mirrors are clean.
 *
 * Mirrors are resolved as sibling clones of this repo by default:
 *   ../skill-metadata-protocol
 *   ../skill-audit-loop
 *
 * Override with SKILL_GRAPH_MIRRORS="path1,path2" or --mirror=path flags.
 *
 * Allowlist (lines / files are not reported):
 *   - `CHANGELOG.md` at any depth — release notes legitimately cite the
 *     packages and source paths that shipped in past releases.
 *   - Any line inside a fenced code block.
 *   - Any heading line (#, ##, ...) — these often quote retired names.
 *   - Any line containing a historical-framing token anywhere in the line:
 *     retired, deprecated, historical, was, previously, formerly, legacy,
 *     snapshot, archived, "this mirror", "docs-only", "preserved for", etc.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const PARENT = path.dirname(REPO_ROOT);

const DEFAULT_MIRRORS = [
  path.join(PARENT, 'skill-metadata-protocol'),
  path.join(PARENT, 'skill-audit-loop'),
];

const IGNORED_DIRS = new Set(['.git', 'node_modules', '.artifacts', '.roundtable', 'docs/images']);

// Active-claim patterns — match references that imply this mirror is an active
// implementation/source surface.
const ACTIVE_CLAIM_PATTERNS = [
  {
    id: 'pkg-protocol',
    regex: /@skill-graph\/protocol/g,
    description: '`@skill-graph/protocol` package mention (retired post-ADR-0009)',
  },
  {
    id: 'pkg-audit',
    regex: /@skill-graph\/audit\b/g,
    description: '`@skill-graph/audit` package mention (retired post-ADR-0009)',
  },
  {
    id: 'src-dir',
    regex: /(?:^|\s|`)src\/[A-Za-z0-9_./-]+\.js\b/g,
    description: 'reference to src/*.js (mirrors have no src/)',
  },
  {
    id: 'lib-schemas',
    regex: /lib\/schemas\//g,
    description: 'reference to lib/schemas/ (canonical path is schemas/)',
  },
  {
    id: 'local-evals',
    regex: /(?:^|\s|`)evals\/[A-Za-z0-9_./-]+/g,
    description: 'reference to local evals/ (eval fixtures live in skill-graph)',
  },
  {
    id: 'local-schemas',
    regex: /(?:^|\s|`)schemas\/skill\.v\d+\.schema\.json/g,
    description: 'reference to local schemas/skill.v*.schema.json (mirrors have no schemas/)',
  },
];

// Historical-framing tokens. When any of these appear earlier in the same line
// (or the immediately preceding sentence-ish window), we treat the active-claim
// match as historical context and skip it.
const HISTORICAL_TOKENS = [
  'retired',
  'deprecated',
  'historical',
  'historically',
  'previously',
  'formerly',
  'legacy',
  'snapshot',
  'archived',
  'no longer',
  'has moved',
  'have moved',
  'moved to',
  'docs-only',
  'docs only',
  'was the',
  'were the',
  'used to',
  'preserved for',
  'frozen',
  'mirror only',
  'this mirror',
];

function hasHistoricalFraming(line) {
  const lower = line.toLowerCase();
  return HISTORICAL_TOKENS.some(tok => lower.includes(tok));
}

function collectFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      // Skip nested ignored paths like docs/images
      const rel = path.relative(dir, abs);
      if (IGNORED_DIRS.has(rel)) continue;
      collectFiles(abs, out);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (['.md', '.yml', '.yaml', '.json'].includes(ext)) out.push(abs);
  }
  return out;
}

// File-level banner detection: a file that opens with an explicit historical-
// snapshot or frozen-mirror banner in its first ~12 lines is treated as a
// preserved artifact and skipped entirely. Detected by combining "historical"
// or "frozen" or "snapshot" or "deprecation mirror" with explicit dating or
// the word "snapshot"/"frozen" in a blockquote.
const FILE_BANNER_HINTS = [
  /historical\s+(?:v\d+\s+)?snapshot/i,
  /frozen\s+snapshot/i,
  /deprecation\s+mirror/i,
  /docs-only\s+(?:deprecation\s+)?mirror/i,
  /this\s+(?:repository|repo|file)\s+is\s+a?\s*(?:docs-only|deprecation|historical|frozen|deprecated)/i,
  /(?:do\s+not\s+execute|preserved\s+for\s+(?:the\s+)?historical\s+record)/i,
  /superseded\s+by/i,
];

function hasFileBanner(text) {
  const head = text.split(/\r?\n/).slice(0, 12).join('\n');
  return FILE_BANNER_HINTS.some(re => re.test(head));
}

function scanFile(absPath, mirrorRoot) {
  // File-level allowlist: CHANGELOG.md release notes legitimately cite
  // packages and source paths from past releases.
  if (path.basename(absPath) === 'CHANGELOG.md') return [];

  const text = fs.readFileSync(absPath, 'utf8');
  if (hasFileBanner(text)) return [];
  const lines = text.split(/\r?\n/);
  let inFence = false;
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (/^\s*#{1,6}\s/.test(line)) continue; // skip headings
    if (hasHistoricalFraming(line)) continue; // skip historically-framed lines
    for (const p of ACTIVE_CLAIM_PATTERNS) {
      // Reset regex state for each line scan.
      p.regex.lastIndex = 0;
      let m;
      while ((m = p.regex.exec(line)) !== null) {
        hits.push({
          file: path.relative(mirrorRoot, absPath),
          mirror: path.basename(mirrorRoot),
          line: i + 1,
          column: m.index + 1,
          pattern: p.id,
          description: p.description,
          match: m[0],
          snippet: line.trim().slice(0, 240),
        });
      }
    }
  }
  return hits;
}

function resolveMirrors(argv) {
  const flagMirrors = argv
    .filter(a => a.startsWith('--mirror='))
    .map(a => path.resolve(a.slice('--mirror='.length)));
  if (flagMirrors.length > 0) return flagMirrors;
  if (process.env.SKILL_GRAPH_MIRRORS) {
    return process.env.SKILL_GRAPH_MIRRORS
      .split(',')
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => path.resolve(p));
  }
  return DEFAULT_MIRRORS;
}

function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const quiet = argv.includes('--quiet');
  const mirrors = resolveMirrors(argv);

  const allHits = [];
  const missingMirrors = [];
  let filesScanned = 0;
  for (const mirror of mirrors) {
    if (!fs.existsSync(mirror)) {
      missingMirrors.push(mirror);
      continue;
    }
    const files = collectFiles(mirror);
    filesScanned += files.length;
    for (const f of files) allHits.push(...scanFile(f, mirror));
  }

  if (json) {
    process.stdout.write(JSON.stringify({
      mirrors,
      missing_mirrors: missingMirrors,
      files_scanned: filesScanned,
      hits: allHits,
    }, null, 2) + '\n');
    process.exit(allHits.length > 0 ? 1 : 0);
  }

  if (!quiet && missingMirrors.length > 0) {
    for (const m of missingMirrors) {
      process.stderr.write(`WARN mirror not found: ${m}\n`);
    }
  }
  if (!quiet) {
    for (const h of allHits) {
      process.stderr.write(
        `${h.mirror}/${h.file}:${h.line}:${h.column} [${h.pattern}] ${h.match} — ${h.description}\n     ${h.snippet}\n`
      );
    }
  }

  if (allHits.length > 0) {
    process.stderr.write(
      `FAIL mirror freeze: ${allHits.length} active claim(s) across ${mirrors.length} mirror(s). Mirrors should not advertise active source / packages — add historical framing or move content to skill-graph.\n`
    );
    process.exit(1);
  }
  process.stdout.write(
    `OK   mirror freeze: ${filesScanned} file(s) scanned across ${mirrors.length} mirror(s); no active-source/package claims found.\n`
  );
}

module.exports = {
  ACTIVE_CLAIM_PATTERNS,
  FILE_BANNER_HINTS,
  HISTORICAL_TOKENS,
  collectFiles,
  hasFileBanner,
  hasHistoricalFraming,
  resolveMirrors,
  scanFile,
};

if (require.main === module) main();
