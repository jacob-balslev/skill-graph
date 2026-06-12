#!/usr/bin/env node
/**
 * Read-only documentation freshness audit.
 *
 * This complements check-doc-drift.js. Drift is the narrow schema-version
 * sentinel; this script checks active docs against the code surface they claim:
 * file paths, `node scripts/...` commands, `npm run ...` scripts, public
 * `skill-graph ...` commands, and review-only questions about legacy wording or
 * high cognitive-load prose.
 *
 * Exit codes:
 *   0  report completed
 *   1  --strict was passed and at least one error-class finding exists
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { workspaceRoot } = require('./lib/roots');

const DEFAULT_ROOT = workspaceRoot();
const DEFAULT_MAX_PARAGRAPH_WORDS = 420;
const DEFAULT_MAX_PARAGRAPH_CHARS = 3000;

const IGNORED_DIRS = new Set([
  '.git',
  '.cache',
  '.roundtable',
  '.skill-graph',
  '.artifacts',
  'coverage',
  'dist',
  'node_modules',
  'marketplace',
]);

const HISTORICAL_DOC_DIRS = new Set(['adr', 'migrations', 'plans', 'research', '_drafts']);
const ROOT_DOC_ALLOWLIST = new Set(['CHANGELOG.md']);
const UNQUALIFIED_STALE_WORDING_RE = /\b(?:use|run|call|invoke|author|write|set|add|prefer)\b[^.!?\n]{0,100}\b(?:legacy|deprecated|obsolete|retired|removed|superseded|archived|back-?compat(?:ible|ibility)?)\b|\b(?:legacy|deprecated|obsolete|retired|removed|superseded|archived|back-?compat(?:ible|ibility)?)\b[^.!?\n]{0,100}\b(?:runner|command|script|path|workflow|shape|value|field)\b/i;
const CURRENTNESS_CONTEXT_RE = /\b(?:historical|history|git history|recover(?:y|able)?|retired to|removed (?:in|from|per|because)|was removed|deleted|deletion|deprecation|superseded by|replaced by|deprecated alias|legacy alias(?:es)?|legacy support|legacy corpus|legacy code|legacy `?boundary`?|legacy expectations|back-?compat(?:ible|ibility)?|backwards compatibility|retained for|preserved for|former(?:ly)?|migration|migrat(?:ed|ion)|current|canonical|today|now|no longer|user directive|warning|warnings|archived source|for example|0 acting consumer|0% corpus adoption|accepts|supported|ungradeable)\b/i;
const ACTIONABLE_MARKER_RE = /(?:^|[\s([*-])(?:TODO|TBD|FIXME|XXX)\s*:/i;
const HISTORICAL_REFERENCE_RE = /\b(?:historical|history|git history|recover via|recover(?:y|able)?|retired to|retired codemod|codemod|removed (?:in|from|per)|was removed|was deleted|deleted in|superseded by|replaced by|former(?:ly)?|old path|previous path|no longer exists|no longer ships)\b/i;
const EXTERNAL_REFERENCE_RE = /\b(?:external repo|sibling repo|sibling `?(?:skills|skill-graph)`? repo|jacob-balslev\/skills|github\.com\/jacob-balslev\/skills|skills\.sh|cd skills\b|skills\/scripts\/)\b/i;
const EXAMPLE_REFERENCE_RE = /\b(?:example project|sample project|running example|placeholder|substitute paths?|your own project|your project|template path)\b/i;
const TAXONOMY_HEADING_RE = /^(?:misc|miscellaneous|other|general|various|stuff|uncategorized)$/i;
const LOCAL_LINK_RE = /\[[^\]]*]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
const INLINE_CODE_RE = /`([^`\n]+)`/g;
const FENCED_CODE_RE = /```[A-Za-z0-9_-]*\r?\n([\s\S]*?)```/g;
const NODE_SCRIPT_RE = /\bnode\s+((?:\.\/)?scripts\/[A-Za-z0-9._/-]+\.js)\b/g;
const NPM_RUN_RE = /\b(?:npm|pnpm|yarn)\s+run\s+([A-Za-z0-9:_.-]+)\b/g;
const SKILL_GRAPH_INLINE_CMD_RE = /^skill-graph\s+([A-Za-z0-9:_.-]+)\b/;
const SKILL_GRAPH_FENCED_CMD_RE = /(?:^|\n)\s*(?:[$#]\s*)?skill-graph\s+([A-Za-z0-9:_.-]+)\b/g;

const KNOWN_ROOT_FILES = new Set([
  'AGENTS.md',
  'README.md',
  'SKILL_GRAPH.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CODE_OF_CONDUCT.md',
  'CHANGELOG.md',
  'LICENSE',
  'NOTICE',
  'package.json',
]);

const KNOWN_PATH_PREFIXES = [
  'bin/',
  'docs/',
  'examples/',
  'lib/',
  'prompts/',
  'schemas/',
  'scripts/',
  'skill-audit-loop/',
  'skill-metadata-protocol/',
  '.github/',
];

function parseArgs(argv) {
  const opts = {
    json: false,
    quiet: false,
    strict: false,
    errorsOnly: false,
    maxParagraphWords: DEFAULT_MAX_PARAGRAPH_WORDS,
    maxParagraphChars: DEFAULT_MAX_PARAGRAPH_CHARS,
    root: DEFAULT_ROOT,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') opts.json = true;
    else if (arg === '--quiet') opts.quiet = true;
    else if (arg === '--strict') opts.strict = true;
    else if (arg === '--errors-only') opts.errorsOnly = true;
    else if (arg === '--max-paragraph-words' && argv[i + 1]) opts.maxParagraphWords = Number(argv[++i]);
    else if (arg === '--max-paragraph-chars' && argv[i + 1]) opts.maxParagraphChars = Number(argv[++i]);
    else if (arg === '--root' && argv[i + 1]) opts.root = path.resolve(argv[++i]);
    else if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return opts;
}

function printHelp() {
  process.stdout.write(`Usage: node scripts/check-doc-freshness.js [options]

Audit active documentation for stale code references and rewrite questions.

Options:
  --strict                    Exit 1 when error-class findings exist.
  --errors-only               Omit review-question findings from the report.
  --json                      Emit JSON.
  --quiet                     Print only the summary line.
  --max-paragraph-words <n>   Rewrite-question threshold (default: ${DEFAULT_MAX_PARAGRAPH_WORDS}).
  --max-paragraph-chars <n>   Rewrite-question threshold (default: ${DEFAULT_MAX_PARAGRAPH_CHARS}).
  --root <dir>                Override workspace root.

Finding classes:
  error      Missing local file, script, package script, or skill-graph command.
  question   Unqualified stale wording, actionable TODO markers, vague taxonomy headings, or long prose.
`);
}

function toRel(root, absPath) {
  return path.relative(root, absPath).replace(/\\/g, '/');
}

function isHistoricalDoc(root, absPath) {
  const rel = toRel(root, absPath).split('/');
  const base = path.basename(absPath);
  if (ROOT_DOC_ALLOWLIST.has(base)) return true;
  if (rel[0] === 'audits') return true;
  if (rel[0] === 'examples') return true;
  if (rel[0] === 'docs' && HISTORICAL_DOC_DIRS.has(rel[1])) return true;
  if (rel[0] === 'skill-audit-loop' && rel[1] === 'progress') return true;
  return false;
}

function isGeneratedDoc(absPath) {
  const base = path.basename(absPath).toLowerCase();
  return base.endsWith('.generated.md') || base.includes('.generated.');
}

function collectMarkdownFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(abs, out);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      out.push(abs);
    }
  }
  return out;
}

function filterGitIgnored(files, root) {
  if (!files.length) return files;
  const rel = files.map((f) => toRel(root, f));
  let stdout = '';
  try {
    stdout = execFileSync('git', ['check-ignore', '--stdin'], {
      cwd: root,
      input: rel.join('\n'),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (err) {
    if (err && err.status === 1) {
      stdout = err.stdout ? err.stdout.toString() : '';
    } else {
      return files;
    }
  }
  const ignored = new Set(stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean));
  if (!ignored.size) return files;
  return files.filter((f) => !ignored.has(toRel(root, f)));
}

function activeMarkdownFiles(root) {
  return filterGitIgnored(collectMarkdownFiles(root), root)
    .filter((f) => !isHistoricalDoc(root, f))
    .filter((f) => !isGeneratedDoc(f))
    .sort((a, b) => a.localeCompare(b));
}

function loadPackageScripts(root) {
  const pkgPath = path.join(root, 'package.json');
  if (!fs.existsSync(pkgPath)) return new Set();
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  return new Set(Object.keys(pkg.scripts || {}));
}

function loadCliCommands(root) {
  const binPath = path.join(root, 'bin', 'skill-graph.js');
  if (!fs.existsSync(binPath)) return new Set();
  const source = fs.readFileSync(binPath, 'utf8');
  const commands = new Set(['help']);
  const commandBlock = source.match(/const COMMANDS = \{([\s\S]*?)\n\};/);
  if (!commandBlock) return commands;
  const keyRe = /^  (?:'([^']+)'|"([^"]+)"|([A-Za-z_][A-Za-z0-9_:-]*))\s*:/gm;
  let match;
  while ((match = keyRe.exec(commandBlock[1])) !== null) {
    commands.add(match[1] || match[2] || match[3]);
  }
  return commands;
}

function stripMarkdownTitle(target) {
  return String(target || '').split(/\s+/)[0];
}

function isExternalTarget(value) {
  return /^(?:https?:|mailto:|tel:|urn:|#)/i.test(value);
}

function cleanCandidate(raw) {
  let value = stripMarkdownTitle(raw).trim();
  value = value.replace(/^<|>$/g, '');
  value = value.replace(/^['"]|['"]$/g, '');
  value = value.replace(/[),.;]+$/g, '');
  value = value.replace(/#.*$/, '');
  value = value.replace(/::.*$/, '');
  value = value.replace(/:(?:\d+)(?:[-:,]\d+)*$/, '');
  value = value.replace(/^\.\//, '');
  try {
    value = decodeURIComponent(value);
  } catch {
    // Keep the original value if it is not valid URI encoding.
  }
  return value;
}

function shouldCheckPath(candidate) {
  if (!candidate) return false;
  if (isExternalTarget(candidate)) return false;
  if (candidate.includes('<') || candidate.includes('>')) return false;
  if (candidate.includes('{') || candidate.includes('}')) return false;
  if (candidate.includes('*') || candidate.includes('$')) return false;
  if (candidate.includes('...')) return false;
  if (/\b(?:YYYY|MM|DD|vN|vM)\b/.test(candidate)) return false;
  if (candidate.startsWith('~') || path.isAbsolute(candidate)) return false;
  if (KNOWN_ROOT_FILES.has(candidate)) return true;
  if (KNOWN_PATH_PREFIXES.some((prefix) => candidate.startsWith(prefix))) return true;
  return candidate.startsWith('../') || candidate.startsWith('./');
}

function resolveDocPath(root, docFile, raw, source) {
  const cleaned = cleanCandidate(raw);
  if (!shouldCheckPath(cleaned)) return null;
  const buildResult = (absPath) => {
    const absPaths = [absPath];
    if (
      path.basename(root) === 'skill-graph' &&
      !cleaned.startsWith('../') &&
      !cleaned.startsWith('./')
    ) {
      absPaths.push(path.resolve(root, '..', cleaned));
    }
    return { target: cleaned, absPath, absPaths };
  };
  if (source === 'markdown-link' && (cleaned.startsWith('../') || cleaned.startsWith('./'))) {
    return buildResult(path.resolve(path.dirname(docFile), cleaned));
  }
  if (cleaned.startsWith('../') || cleaned.startsWith('./')) {
    return buildResult(path.resolve(path.dirname(docFile), cleaned));
  }
  return buildResult(path.resolve(root, cleaned));
}

function existsAsPath(absPath) {
  if (fs.existsSync(absPath)) return true;
  const noTrailingSlash = absPath.replace(/[\\/]+$/, '');
  return noTrailingSlash !== absPath && fs.existsSync(noTrailingSlash);
}

function existsAnyPath(absPaths) {
  return absPaths.some((absPath) => existsAsPath(absPath));
}

function commandSlices(text) {
  const slices = [];
  let match;
  while ((match = INLINE_CODE_RE.exec(text)) !== null) {
    slices.push({ text: match[1], offset: match.index, kind: 'inline' });
  }
  while ((match = FENCED_CODE_RE.exec(text)) !== null) {
    const contentOffset = match.index + match[0].indexOf(match[1]);
    slices.push({ text: match[1], offset: contentOffset, kind: 'fenced' });
  }
  return slices;
}

function commandPathCandidates(root, target) {
  const candidates = [path.resolve(root, target)];
  if (path.basename(root) === 'skill-graph') {
    candidates.push(path.resolve(root, '..', target));
  }
  return candidates;
}

function lineAt(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function lineTextAt(text, index) {
  const start = text.lastIndexOf('\n', Math.max(0, index - 1)) + 1;
  const end = text.indexOf('\n', index);
  return text.slice(start, end === -1 ? text.length : end);
}

function allowsMissingReference(line) {
  const text = String(line || '');
  return (
    HISTORICAL_REFERENCE_RE.test(text) ||
    EXTERNAL_REFERENCE_RE.test(text) ||
    EXAMPLE_REFERENCE_RE.test(text)
  );
}

function hasCurrentnessContext(line) {
  return CURRENTNESS_CONTEXT_RE.test(String(line || ''));
}

function addFinding(findings, seen, finding) {
  const key = `${finding.kind}:${finding.file}:${finding.line}:${finding.target || finding.snippet || ''}`;
  if (seen.has(key)) return;
  seen.add(key);
  findings.push(finding);
}

function scanPathReferences(root, file, text, findings, seen) {
  let match;
  while ((match = LOCAL_LINK_RE.exec(text)) !== null) {
    if (allowsMissingReference(lineTextAt(text, match.index))) continue;
    const resolved = resolveDocPath(root, file, match[1], 'markdown-link');
    if (!resolved || existsAnyPath(resolved.absPaths)) continue;
    addFinding(findings, seen, {
      severity: 'error',
      kind: 'missing-local-path',
      file: toRel(root, file),
      line: lineAt(text, match.index),
      target: resolved.target,
      question: 'Update the link target, restore the file, or explain why this doc should still cite it.',
    });
  }

  while ((match = INLINE_CODE_RE.exec(text)) !== null) {
    if (allowsMissingReference(lineTextAt(text, match.index))) continue;
    const parts = match[1].split(/\s+/);
    for (const part of parts) {
      const resolved = resolveDocPath(root, file, part, 'inline-code');
      if (!resolved || existsAnyPath(resolved.absPaths)) continue;
      addFinding(findings, seen, {
        severity: 'error',
        kind: 'missing-local-path',
        file: toRel(root, file),
        line: lineAt(text, match.index),
        target: resolved.target,
        question: 'Update the code/path reference, restore the target, or mark it as historical in an allowlisted record.',
      });
    }
  }
}

function scanCommandReferences(root, file, text, packageScripts, cliCommands, findings, seen) {
  for (const slice of commandSlices(text)) {
    let match;
    while ((match = NODE_SCRIPT_RE.exec(slice.text)) !== null) {
      const absoluteIndex = slice.offset + match.index;
      if (allowsMissingReference(lineTextAt(text, absoluteIndex))) continue;
      const target = cleanCandidate(match[1]);
      if (existsAnyPath(commandPathCandidates(root, target))) continue;
      addFinding(findings, seen, {
        severity: 'error',
        kind: 'missing-node-script',
        file: toRel(root, file),
        line: lineAt(text, absoluteIndex),
        target,
        question: 'Update the command, restore the script, or move the reference into a historical record.',
      });
    }

    while ((match = NPM_RUN_RE.exec(slice.text)) !== null) {
      const absoluteIndex = slice.offset + match.index;
      if (allowsMissingReference(lineTextAt(text, absoluteIndex))) continue;
      const target = match[1];
      if (packageScripts.has(target)) continue;
      addFinding(findings, seen, {
        severity: 'error',
        kind: 'missing-package-script',
        file: toRel(root, file),
        line: lineAt(text, absoluteIndex),
        target: `npm run ${target}`,
        question: 'Add the package script or update the documented command.',
      });
    }

    const skillGraphMatches = [];
    if (slice.kind === 'inline') {
      const inlineMatch = slice.text.trim().match(SKILL_GRAPH_INLINE_CMD_RE);
      if (inlineMatch) skillGraphMatches.push({ target: inlineMatch[1], index: slice.text.indexOf('skill-graph') });
    } else {
      while ((match = SKILL_GRAPH_FENCED_CMD_RE.exec(slice.text)) !== null) {
        skillGraphMatches.push({ target: match[1], index: match.index });
      }
    }
    for (const commandMatch of skillGraphMatches) {
      const absoluteIndex = slice.offset + commandMatch.index;
      if (allowsMissingReference(lineTextAt(text, absoluteIndex))) continue;
      const target = commandMatch.target;
      if (target.startsWith('--') || target.startsWith('<') || cliCommands.has(target)) continue;
      addFinding(findings, seen, {
        severity: 'error',
        kind: 'missing-skill-graph-command',
        file: toRel(root, file),
        line: lineAt(text, absoluteIndex),
        target: `skill-graph ${target}`,
        question: 'Add the CLI command, update the documented command, or mark the reference as historical.',
      });
    }
  }
}

function scanLineQuestions(root, file, text, findings, seen) {
  const rel = toRel(root, file);
  if (path.basename(file) === 'doc-freshness-audit.md') return;
  const lines = text.split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (UNQUALIFIED_STALE_WORDING_RE.test(line) && !hasCurrentnessContext(line)) {
      addFinding(findings, seen, {
        severity: 'question',
        kind: 'legacy-language',
        file: rel,
        line: index + 1,
        snippet: trimmed.slice(0, 220),
        question: 'State the current behavior, or add enough context to show this is intentional history.',
      });
    }
    if (ACTIONABLE_MARKER_RE.test(line)) {
      addFinding(findings, seen, {
        severity: 'question',
        kind: 'open-marker',
        file: rel,
        line: index + 1,
        snippet: trimmed.slice(0, 220),
        question: 'Resolve the marker, move it to a tracked plan, or state why it belongs in active docs.',
      });
    }
    const heading = trimmed.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading && TAXONOMY_HEADING_RE.test(heading[2].trim())) {
      addFinding(findings, seen, {
        severity: 'question',
        kind: 'vague-taxonomy-heading',
        file: rel,
        line: index + 1,
        snippet: trimmed.slice(0, 220),
        question: 'Rename the heading to the organizing principle, or split the content into specific categories.',
      });
    }
    if (heading && heading[1].length > 4) {
      addFinding(findings, seen, {
        severity: 'question',
        kind: 'deep-heading',
        file: rel,
        line: index + 1,
        snippet: trimmed.slice(0, 220),
        question: 'Check whether the doc hierarchy is too deep for first-pass understanding.',
      });
    }
  });
}

function scanParagraphQuestions(root, file, text, findings, seen, opts) {
  const rel = toRel(root, file);
  const lines = text.split(/\r?\n/);
  let inFence = false;
  let paragraph = [];
  let startLine = 0;

  function flush() {
    if (!paragraph.length) return;
    const content = paragraph.join(' ').replace(/\s+/g, ' ').trim();
    const words = content ? content.split(/\s+/).length : 0;
    if (words > opts.maxParagraphWords || content.length > opts.maxParagraphChars) {
      addFinding(findings, seen, {
        severity: 'question',
        kind: 'long-paragraph',
        file: rel,
        line: startLine,
        snippet: content.slice(0, 220),
        question: 'Consider segmenting this prose into a table, bullets, headings, or a shorter worked example without losing context.',
      });
    }
    paragraph = [];
    startLine = 0;
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (/^```/.test(trimmed)) {
      flush();
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    if (
      !trimmed ||
      /^#{1,6}\s+/.test(trimmed) ||
      /^[-*+]\s+/.test(trimmed) ||
      /^\d+\.\s+/.test(trimmed) ||
      /^>/.test(trimmed) ||
      /^\|/.test(trimmed) ||
      /^</.test(trimmed)
    ) {
      flush();
      return;
    }
    if (!paragraph.length) startLine = idx + 1;
    paragraph.push(trimmed);
  });
  flush();
}

function scanFile(root, file, context, opts = {}) {
  const text = fs.readFileSync(file, 'utf8');
  const findings = [];
  const seen = new Set();
  scanPathReferences(root, file, text, findings, seen);
  scanCommandReferences(root, file, text, context.packageScripts, context.cliCommands, findings, seen);
  if (!opts.errorsOnly) {
    scanLineQuestions(root, file, text, findings, seen);
    scanParagraphQuestions(root, file, text, findings, seen, opts);
  }
  return findings.sort((a, b) => a.line - b.line || a.kind.localeCompare(b.kind));
}

function scanWorkspace(root = DEFAULT_ROOT, options = {}) {
  const opts = {
    maxParagraphWords: Number.isFinite(options.maxParagraphWords) ? options.maxParagraphWords : DEFAULT_MAX_PARAGRAPH_WORDS,
    maxParagraphChars: Number.isFinite(options.maxParagraphChars) ? options.maxParagraphChars : DEFAULT_MAX_PARAGRAPH_CHARS,
    errorsOnly: Boolean(options.errorsOnly),
  };
  const absRoot = path.resolve(root);
  const files = activeMarkdownFiles(absRoot);
  const context = {
    packageScripts: loadPackageScripts(absRoot),
    cliCommands: loadCliCommands(absRoot),
  };
  const findings = [];
  for (const file of files) findings.push(...scanFile(absRoot, file, context, opts));
  const errors = findings.filter((f) => f.severity === 'error');
  const questions = findings.filter((f) => f.severity === 'question');
  return {
    root: absRoot,
    files_scanned: files.length,
    package_scripts: context.packageScripts.size,
    skill_graph_commands: context.cliCommands.size,
    errors,
    questions,
    findings,
  };
}

function formatFinding(index, finding) {
  const subject = finding.target ? ` ${finding.target}` : '';
  const snippet = finding.snippet ? ` ${finding.snippet}` : '';
  return `${index}. ${finding.file}:${finding.line} [${finding.kind}]${subject}${snippet}\n   Question: ${finding.question}`;
}

function printHumanReport(result, opts) {
  const total = result.errors.length + result.questions.length;
  if (opts.quiet) {
    process.stdout.write(`doc freshness: ${result.files_scanned} active doc(s), ${result.errors.length} error(s), ${result.questions.length} question(s)\n`);
    return;
  }

  process.stdout.write(`\nDoc Freshness Audit\n`);
  process.stdout.write(`Files scanned: ${result.files_scanned}\n`);
  process.stdout.write(`Code surface: ${result.package_scripts} package script(s), ${result.skill_graph_commands} skill-graph command(s)\n`);
  process.stdout.write(`Findings: ${total} (${result.errors.length} error, ${result.questions.length} question)\n\n`);

  if (result.errors.length) {
    process.stdout.write(`Errors\n`);
    result.errors.forEach((finding, idx) => process.stdout.write(`${formatFinding(idx + 1, finding)}\n`));
    process.stdout.write('\n');
  }

  if (!opts.errorsOnly && result.questions.length) {
    process.stdout.write(`Questions\n`);
    result.questions.forEach((finding, idx) => process.stdout.write(`${formatFinding(idx + 1, finding)}\n`));
    process.stdout.write('\n');
  }

  if (!total) {
    process.stdout.write('No doc freshness findings.\n\n');
  }
  process.stdout.write('Removal policy: this audit does not delete or rewrite. Use each finding as evidence for an update, rewrite question, or explicit keep-as-history decision.\n');
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    process.stderr.write(`${err.message}\n\n`);
    printHelp();
    process.exit(1);
  }

  if (opts.help) {
    printHelp();
    process.exit(0);
  }

  const result = scanWorkspace(opts.root, opts);
  if (opts.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    printHumanReport(result, opts);
  }
  process.exit(opts.strict && result.errors.length > 0 ? 1 : 0);
}

module.exports = {
  activeMarkdownFiles,
  cleanCandidate,
  loadCliCommands,
  loadPackageScripts,
  scanFile,
  scanWorkspace,
  shouldCheckPath,
};

if (require.main === module) main();
