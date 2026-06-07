#!/usr/bin/env node
/**
 * Check local Markdown links.
 *
 * External URLs are intentionally ignored; this verifies repository-local links
 * that GitHub will resolve from Markdown files. Paths are checked with
 * case-sensitive segment matching even on Windows so links do not pass locally
 * and 404 after push.
 *
 * Severity model:
 *   - Broken local links are errors and fail the build.
 *   - Completed plans/docs are removed to git history; no in-tree path gets
 *     warning-only treatment for broken local links.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.artifacts', '.roundtable']);

// Gitignored, TRANSIENT run-scratch roots (skill-audit run dirs: proposals, review passes,
// per-skill _orphaned/READMEs). They contain machine-emitted markdown with absolute-path /
// line-anchor citations and depth-relative links that are NOT authored docs and must NOT be
// link-validated. Identified by their repo-relative prefix so the move of the run-root
// (2026-06-07T: .opencode/progress/skill-audits → skill-graph/skill-audit-loop/progress/
// skill-audits per ADR-0016 surface #3) is covered for BOTH the new and the frozen-old location.
// `workspaceRoot()` resolves to the Development workspace when run from there, but to the
// skill-graph repo root when `npm run docs:links` runs from `skill-graph/` cwd — so the run-root's
// repo-relative form is EITHER `skill-graph/skill-audit-loop/progress` (workspace REPO_ROOT) or
// `skill-audit-loop/progress` (skill-graph REPO_ROOT). List both so the skip works from either cwd.
const IGNORED_PATH_PREFIXES = [
  'skill-graph/skill-audit-loop/progress', // relocated run-root, workspace-relative
  'skill-audit-loop/progress',             // relocated run-root, skill-graph-repo-relative
  'skill-graph/.opencode/progress',        // skill-graph-nested progress scratch, workspace-relative
  '.opencode/progress',                    // historical run-root + progress scratch (either cwd)
];

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}

function isIgnoredScratchDir(absDir) {
  const rel = repoRelative(absDir);
  return IGNORED_PATH_PREFIXES.some((p) => rel === p || rel.startsWith(`${p}/`));
}

function collectMarkdownFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && IGNORED_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip gitignored transient run-scratch trees (audit run dirs); not authored docs.
      if (!IGNORED_DIRS.has(entry.name) && !isIgnoredScratchDir(abs)) collectMarkdownFiles(abs, out);
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) out.push(abs);
  }
  return out;
}

function stripCodeFences(text) {
  const lines = text.split(/\r?\n/);
  let inFence = false;
  return lines.map(line => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return '';
    }
    return inFence ? '' : line;
  }).join('\n');
}

function stripInlineCode(text) {
  return text.replace(/`[^`\n]*`/g, '');
}

function isExternalTarget(target) {
  return /^(?:https?:|mailto:|tel:|ftp:|data:|javascript:)/i.test(target);
}

function splitTarget(rawTarget) {
  let target = rawTarget.trim();
  if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1);

  // Drop optional Markdown title syntax: [x](file.md "title").
  const titleMatch = target.match(/^([^"'()\s]+)\s+["'][^"']*["']$/);
  if (titleMatch) target = titleMatch[1];

  const hashIdx = target.indexOf('#');
  if (hashIdx === -1) return { pathPart: target, anchor: null };
  return {
    pathPart: target.slice(0, hashIdx),
    anchor: target.slice(hashIdx + 1),
  };
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function existsCaseSensitive(absPath) {
  const resolved = path.resolve(absPath);
  const root = path.parse(resolved).root;
  const rel = path.relative(root, resolved);
  if (!rel) return fs.existsSync(resolved);

  let cur = root;
  for (const segment of rel.split(path.sep)) {
    if (!segment) continue;
    if (!fs.existsSync(cur)) return false;
    const entries = fs.readdirSync(cur);
    if (!entries.includes(segment)) return false;
    cur = path.join(cur, segment);
  }
  return fs.existsSync(cur);
}

function slugifyHeading(headingText) {
  return headingText
    .replace(/^#+\s*/, '')
    .replace(/<[^>]+>/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-')
    .replace(/^-|-$/g, '');
}

function anchorsForMarkdown(absPath) {
  const text = fs.readFileSync(absPath, 'utf8');
  const anchors = new Set();
  for (const line of stripCodeFences(text).split(/\r?\n/)) {
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) anchors.add(slugifyHeading(m[2]));
  }
  return anchors;
}

function lineForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function extractInlineLinks(text) {
  const links = [];
  const body = stripInlineCode(stripCodeFences(text));
  const re = /!?\[[^\]\n]*\]\(([^)\n]+)\)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    links.push({ target: m[1], index: m.index });
  }
  return links;
}

function checkFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const links = extractInlineLinks(text);
  const sourceDir = path.dirname(filePath);

  for (const link of links) {
    const target = link.target.trim();
    if (!target || isExternalTarget(target)) continue;

    const { pathPart, anchor } = splitTarget(target);
    const decodedPath = safeDecode(pathPart);
    const targetPath = decodedPath
      ? path.resolve(sourceDir, decodedPath)
      : filePath;

    if (!existsCaseSensitive(targetPath)) {
      errors.push({
        line: lineForIndex(text, link.index),
        target,
        message: `missing local target ${decodedPath || '(current file)'}`,
      });
      continue;
    }

    if (anchor && targetPath.toLowerCase().endsWith('.md')) {
      const normalizedAnchor = safeDecode(anchor).toLowerCase();
      const anchors = anchorsForMarkdown(targetPath);
      if (!anchors.has(normalizedAnchor)) {
        errors.push({
          line: lineForIndex(text, link.index),
          target,
          message: `missing anchor #${anchor} in ${repoRelative(targetPath)}`,
        });
      }
    }
  }

  return errors;
}

function main() {
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const files = args.length > 0
    ? args.map(a => path.resolve(a)).filter(p => fs.existsSync(p) && p.toLowerCase().endsWith('.md'))
    : collectMarkdownFiles(REPO_ROOT).sort((a, b) => repoRelative(a).localeCompare(repoRelative(b)));

  const failures = [];
  for (const file of files) {
    for (const issue of checkFile(file)) {
      failures.push({ file, ...issue });
    }
  }

  for (const failure of failures) {
    process.stderr.write(
      `${repoRelative(failure.file)}:${failure.line}: ${failure.message} (${failure.target})\n`
    );
  }

  if (failures.length > 0) {
    process.stderr.write(`FAIL markdown links: ${failures.length} broken local link(s)\n`);
    process.exit(1);
  }

  process.stdout.write(`OK   markdown links (${files.length} file(s))\n`);
}

module.exports = {
  checkFile,
  collectMarkdownFiles,
  existsCaseSensitive,
  extractInlineLinks,
  slugifyHeading,
};

if (require.main === module) main();
