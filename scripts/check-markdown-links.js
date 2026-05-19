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
 *   - Active docs (default): broken links are errors and fail the build.
 *   - Archived docs (under any `_archived/` segment): broken links are warnings
 *     and DO NOT fail the build. Archived docs are historical snapshots; the
 *     project's link guarantees apply to the active surface only.
 *
 * Override with --strict-archived to treat archived broken links as errors
 * (useful when migrating an archive batch or auditing snapshot integrity).
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const IGNORED_DIRS = new Set(['.git', 'node_modules', '.artifacts', '.roundtable']);

// Lenient policy: any markdown file beneath a `_archived/` segment is treated
// as a historical snapshot. Broken links inside such files become warnings
// rather than build-failing errors.
function isArchivedPath(absPath) {
  const rel = path.relative(REPO_ROOT, absPath).split(path.sep);
  return rel.some(segment => segment === '_archived');
}

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
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
  const flagArgs = process.argv.slice(2).filter(a => a.startsWith('--'));
  const strictArchived = flagArgs.includes('--strict-archived');
  const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const files = args.length > 0
    ? args.map(a => path.resolve(a)).filter(p => fs.existsSync(p) && p.toLowerCase().endsWith('.md'))
    : collectMarkdownFiles(REPO_ROOT).sort((a, b) => repoRelative(a).localeCompare(repoRelative(b)));

  const failures = [];
  const warnings = [];
  for (const file of files) {
    const archived = !strictArchived && isArchivedPath(file);
    for (const issue of checkFile(file)) {
      (archived ? warnings : failures).push({ file, ...issue });
    }
  }

  for (const warning of warnings) {
    process.stderr.write(
      `WARN ${repoRelative(warning.file)}:${warning.line}: ${warning.message} (${warning.target}) [archived snapshot]\n`
    );
  }
  for (const failure of failures) {
    process.stderr.write(
      `${repoRelative(failure.file)}:${failure.line}: ${failure.message} (${failure.target})\n`
    );
  }

  if (failures.length > 0) {
    process.stderr.write(`FAIL markdown links: ${failures.length} broken local link(s) in active docs (${warnings.length} in _archived/ ignored — use --strict-archived to elevate)\n`);
    process.exit(1);
  }

  const suffix = warnings.length > 0
    ? ` — ${warnings.length} archived-doc warning(s) ignored (use --strict-archived to elevate)`
    : '';
  process.stdout.write(`OK   markdown links (${files.length} file(s))${suffix}\n`);
}

module.exports = {
  checkFile,
  collectMarkdownFiles,
  existsCaseSensitive,
  extractInlineLinks,
  isArchivedPath,
  slugifyHeading,
};

if (require.main === module) main();
