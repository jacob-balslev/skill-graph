#!/usr/bin/env node
'use strict';

/**
 * eval-linter.js — Eval file hygiene linter.
 *
 * Validates evals/evals.json files across all skills for:
 *   1. Required metadata fields (substance, calibration, truth_mode, skill_type, criticality)
 *   2. Dead file paths referenced in expectation strings
 *   3. Stale function/helper names referenced in expectations
 *   4. Dead or unverified URLs in prompts and expectations
 *   5. Structural issues (missing id/prompt/expectations, duplicate IDs, wrong types)
 *   6. Duplicate expectation strings within the same eval
 *
 * Zero external dependencies. Pure filesystem validation.
 *
 * Usage:
 *   node scripts/skill/eval-linter.js                             # lint all skills
 *   node scripts/skill/eval-linter.js --skill nextauth-patterns   # single skill
 *   node scripts/skill/eval-linter.js --json                      # JSON output
 *   node scripts/skill/eval-linter.js --fix-metadata              # add missing metadata with defaults
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');
const SKILLS_ROOT = path.join(ROOT_DIR, 'skills');

// ─── Metadata requirements ────────────────────────────────────────────
const REQUIRED_METADATA = ['substance', 'calibration', 'truth_mode', 'skill_type', 'criticality'];

const METADATA_DEFAULTS = {
  substance: 'domain',
  calibration: 'semantic',
  truth_mode: 'repo_implementation',
  skill_type: 'knowledge',
  criticality: 'medium',
};

// ─── Regex patterns ───────────────────────────────────────────────────

// Match file paths: things like `apps/web/src/...`, `src/...`, `lib/...`, `sales-hub/...`
// Backtick-quoted paths require a / or known extension to avoid matching property access (session.user.orgId)
// Bare paths must start with a known directory prefix.
const FILE_PATH_RE = /(?:`([a-zA-Z0-9_/-]+(?:\/[a-zA-Z0-9_.-]+)*\.[a-zA-Z]{1,10})`|(?:^|\s)((?:apps|src|lib|sales-hub|scripts|skills|agent-orchestration)\/[a-zA-Z0-9_./-]+\.[a-zA-Z]{1,10}))/g;

// Known code file extensions — used to filter backtick-matched "paths" from dotted property access
const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.css', '.scss', '.less',
  '.json', '.yaml', '.yml', '.toml',
  '.md', '.mdx', '.html', '.svg',
  '.sql', '.sh', '.bash', '.zsh',
  '.env', '.spec', '.test',
  '.py', '.rb', '.go', '.rs',
]);

// Match URLs (http/https)
const URL_RE = /https?:\/\/[^\s"'`,)}\]]+/g;

// Match function-like references that the author marked as code via backticks.
// Bare `name()` patterns in prose are ambiguous (generic verbs like `processData`, `string`,
// `acquire_lock` produced ~85% false-positive rate). Backticks are the author-declared
// "this is a real identifier" signal — consistent with FILE_PATH_RE's backtick contract.
const FUNCTION_REF_RE = /`([a-zA-Z_$][a-zA-Z0-9_$]*)\(\)`/g;

// Localhost URL pattern
const LOCALHOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/;

// ─── CLI args ─────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const fixMetadata = args.includes('--fix-metadata');
let targetSkill = null;

const skillIdx = args.indexOf('--skill');
if (skillIdx !== -1 && args[skillIdx + 1]) {
  targetSkill = args[skillIdx + 1];
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`eval-linter.js — Eval file hygiene linter

Usage:
  node scripts/skill/eval-linter.js                             # lint all skills
  node scripts/skill/eval-linter.js --skill nextauth-patterns   # single skill
  node scripts/skill/eval-linter.js --json                      # JSON output
  node scripts/skill/eval-linter.js --fix-metadata              # add missing metadata with defaults

Checks:
  - Required metadata: substance, calibration, truth_mode, skill_type, criticality
  - Dead file paths in prompts and expectations
  - Stale function names in expectations (grep-verified)
  - Dead/unverified URLs in prompts and expectations
  - Structural: missing id/prompt/expectations, duplicate IDs, wrong types
  - Duplicate expectations within the same eval`);
  process.exit(0);
}

// ─── Finding collector ────────────────────────────────────────────────

/**
 * @typedef {Object} Finding
 * @property {string} skill     - Skill name
 * @property {string} file      - Relative path to evals.json
 * @property {number|null} evalId - Eval ID within the file, or null for file-level
 * @property {'error'|'warning'|'info'} severity
 * @property {string} rule      - Rule identifier
 * @property {string} message   - Human-readable description
 */

/** @type {Finding[]} */
const findings = [];

function addFinding(skill, file, evalId, severity, rule, message) {
  findings.push({ skill, file, evalId, severity, rule, message });
}

// ─── Discovery ────────────────────────────────────────────────────────

/**
 * Recursively find all evals/evals.json files under the skills root.
 * Handles arbitrarily nested skill directories (skills/sales-hub/*, skills/agents/*, etc.).
 * A skill directory is any directory containing SKILL.md with an evals/evals.json sibling.
 * Returns array of { skillName, evalPath, relPath }.
 */
function discoverEvalFiles() {
  const results = [];

  function walk(dir) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

    const hasSkillMd = entries.some(e => e.isFile() && e.name === 'SKILL.md');
    const evalPath = path.join(dir, 'evals', 'evals.json');

    if (hasSkillMd && fs.existsSync(evalPath)) {
      // Derive skill name from relative path under skills/
      const skillName = path.relative(SKILLS_ROOT, dir).replace(/\\/g, '/');

      if (!targetSkill || skillName.includes(targetSkill)) {
        results.push({
          skillName,
          evalPath,
          relPath: path.relative(ROOT_DIR, evalPath),
        });
      }
    }

    // Recurse into subdirectories (skip non-skill dirs to avoid false matches).
    // Underscore-prefixed dirs (_archived, _meta) are non-canonical by convention and not audited.
    const SKIP_DIRS = new Set(['evals', 'references', 'findings', 'node_modules', '.git', '.next', 'dist']);
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && !entry.name.startsWith('_') && !SKIP_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
    }
  }

  if (fs.existsSync(SKILLS_ROOT)) {
    walk(SKILLS_ROOT);
  }

  return results;
}

// ─── File path validation ─────────────────────────────────────────────

// Resolution prefixes tried in order when checking file existence (matches eval-staleness-checker.js)
const PATH_PREFIXES = [
  ROOT_DIR,
  path.join(ROOT_DIR, 'sales-hub'),
  path.join(ROOT_DIR, 'sales-hub', 'apps', 'web', 'src'),
  path.join(ROOT_DIR, 'agent-orchestration'),
  path.join(ROOT_DIR, 'scripts'),
];

// Bare filename cache (avoids repeated find calls)
const _bareFileCache = new Map();

/**
 * Resolve a file path reference to an actual file on disk.
 * Returns true if found, false if not.
 */
function filePathExists(filePath) {
  // Phase 1: Prefix-based resolution
  for (const prefix of PATH_PREFIXES) {
    if (fs.existsSync(path.join(prefix, filePath))) return true;
  }

  // Phase 2: Bare filename fallback (for refs like `auth-server.ts`)
  // Uses execFileSync with array args (no shell injection risk).
  const basename = path.basename(filePath);
  if (_bareFileCache.has(basename)) {
    return _bareFileCache.get(basename) !== null;
  }

  const SEARCH_DIRS = [
    path.join(ROOT_DIR, 'sales-hub', 'apps', 'web', 'src'),
    path.join(ROOT_DIR, 'sales-hub', 'packages'),
    path.join(ROOT_DIR, 'scripts'),
    path.join(ROOT_DIR, 'agent-orchestration'),
  ];

  for (const dir of SEARCH_DIRS) {
    if (!fs.existsSync(dir)) continue;
    try {
      const result = execFileSync(
        'find', [dir, '-name', basename, '-type', 'f', '-not', '-path', '*/node_modules/*'],
        { encoding: 'utf8', timeout: 3000 }
      ).trim();
      if (result) {
        _bareFileCache.set(basename, result.split('\n')[0]);
        return true;
      }
    } catch {
      // continue
    }
  }

  _bareFileCache.set(basename, null);
  return false;
}

/**
 * Extract file paths from a string and check if they exist on disk.
 * Filters out dotted property access patterns (e.g., session.user.orgId) by
 * requiring backtick-matched paths to have a known code file extension.
 */
function checkFilePaths(text, skill, relPath, evalId) {
  let match;
  FILE_PATH_RE.lastIndex = 0;
  while ((match = FILE_PATH_RE.exec(text)) !== null) {
    const filePath = match[1] || match[2];
    if (!filePath) continue;

    // Skip patterns that are clearly example/template paths
    if (filePath.includes('{') || filePath.includes('*') || filePath.includes('$')) continue;

    // For backtick-quoted matches (match[1]), filter out dotted property access patterns
    // by requiring the extension to be a known code file extension.
    // This prevents `session.user.orgId` from being flagged as a dead path.
    if (match[1]) {
      const ext = path.extname(filePath).toLowerCase();
      if (!CODE_EXTENSIONS.has(ext)) continue;
    }

    if (!filePathExists(filePath)) {
      addFinding(skill, relPath, evalId, 'error', 'dead-path',
        `Referenced file path does not exist: ${filePath}`);
    }
  }
}

// ─── URL extraction ───────────────────────────────────────────────────

/**
 * Extract URLs from text. Flag non-localhost URLs as unverified.
 */
function checkUrls(text, skill, relPath, evalId) {
  let match;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    let url = match[0];

    // Strip trailing punctuation that likely isn't part of the URL
    url = url.replace(/[.,;:!?)}\]]+$/, '');

    if (LOCALHOST_RE.test(url)) continue;

    // Skip common example/documentation URLs
    if (url.includes('example.com') || url.includes('example.org')) continue;

    addFinding(skill, relPath, evalId, 'info', 'unverified-url',
      `External URL not verified: ${url}`);
  }
}

// ─── Stale function name detection ────────────────────────────────────

// Cache for grep results to avoid repeated searches
const functionExistsCache = new Map();

// Common standard library / well-known functions to skip
const SKIP_FUNCTIONS = new Set([
  'require', 'import', 'export', 'console', 'log', 'error', 'warn',
  'parseInt', 'parseFloat', 'toString', 'JSON', 'parse', 'stringify',
  'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
  'Promise', 'resolve', 'reject', 'then', 'catch', 'finally',
  'fetch', 'Response', 'Request', 'NextResponse', 'NextRequest',
  'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS',
  'describe', 'it', 'test', 'expect', 'beforeEach', 'afterEach',
  'beforeAll', 'afterAll', 'jest', 'mock', 'fn',
  'Array', 'Object', 'String', 'Number', 'Boolean', 'Map', 'Set',
  'Date', 'Math', 'RegExp', 'Error', 'TypeError', 'RangeError',
  'replace', 'split', 'join', 'filter', 'map', 'reduce', 'find',
  'includes', 'indexOf', 'push', 'pop', 'shift', 'unshift', 'slice',
  'sort', 'reverse', 'concat', 'flat', 'flatMap', 'every', 'some',
  'keys', 'values', 'entries', 'assign', 'freeze', 'create',
  'trim', 'toLowerCase', 'toUpperCase', 'startsWith', 'endsWith',
  'match', 'matchAll', 'search', 'replaceAll', 'padStart', 'padEnd',
  'charAt', 'charCodeAt', 'codePointAt', 'normalize', 'repeat',
  'fill', 'copyWithin', 'findIndex', 'from', 'isArray', 'of',
  'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
  'constructor', 'prototype', 'apply', 'bind', 'call',
  'auth', 'signIn', 'signOut', 'getSession', 'getServerSession',
  'crypto', 'timingSafeEqual', 'createHmac', 'update', 'digest',
  'readFileSync', 'writeFileSync', 'existsSync', 'mkdirSync',
  'readdirSync', 'statSync', 'unlinkSync', 'renameSync',
  'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
  'useContext', 'useReducer', 'useLayoutEffect', 'useId',
  'createElement', 'render', 'hydrate', 'createRoot',
  'Component', 'PureComponent', 'Fragment', 'Suspense', 'lazy',
  'forwardRef', 'memo', 'createContext', 'createRef',
]);

/**
 * Check if a function name exists in the codebase using grep.
 * Uses execFileSync to avoid shell injection.
 * Returns true if found, false if not.
 */
function functionExistsInCodebase(funcName) {
  if (functionExistsCache.has(funcName)) {
    return functionExistsCache.get(funcName);
  }

  // Validate funcName contains only safe characters (already guaranteed by regex,
  // but belt-and-suspenders for the grep argument)
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(funcName)) {
    functionExistsCache.set(funcName, false);
    return false;
  }

  const searchDirs = [
    path.join(ROOT_DIR, 'sales-hub'),
    path.join(ROOT_DIR, 'scripts'),
  ].filter(d => fs.existsSync(d));

  if (searchDirs.length === 0) {
    functionExistsCache.set(funcName, false);
    return false;
  }

  try {
    const grepArgs = [
      '-r', '-l',
      '--include=*.ts', '--include=*.tsx', '--include=*.js', '--include=*.jsx',
      '--exclude-dir=node_modules', '--exclude-dir=.next', '--exclude-dir=dist',
      '--exclude-dir=.claude', '--exclude-dir=.git', '--exclude-dir=worktrees',
      funcName,
      ...searchDirs,
    ];

    const result = execFileSync('grep', grepArgs, {
      encoding: 'utf8',
      timeout: 5000,
      maxBuffer: 1024 * 64,
    }).trim();

    const exists = result.length > 0;
    functionExistsCache.set(funcName, exists);
    return exists;
  } catch {
    // grep returns exit code 1 when no matches — that means not found
    functionExistsCache.set(funcName, false);
    return false;
  }
}

/**
 * Extract function references from expectation strings and verify they exist.
 * Only checks names that look like project-specific helpers (not stdlib).
 */
function checkStaleFunctions(text, skill, relPath, evalId) {
  let match;
  FUNCTION_REF_RE.lastIndex = 0;
  while ((match = FUNCTION_REF_RE.exec(text)) !== null) {
    const funcName = match[1];

    // Skip standard library / well-known functions
    if (SKIP_FUNCTIONS.has(funcName)) continue;

    // Skip very short names (likely variables, not helpers)
    if (funcName.length < 4) continue;

    // Skip names that start with uppercase and are likely types/classes/components
    if (/^[A-Z][A-Z]/.test(funcName)) continue;

    // This looks like a project-specific helper — verify it exists
    if (!functionExistsInCodebase(funcName)) {
      addFinding(skill, relPath, evalId, 'error', 'stale-function',
        `Referenced function not found in codebase: ${funcName}()`);
    }
  }
}

// ─── Structural checks ───────────────────────────────────────────────

/**
 * Validate the structure of a single eval entry.
 */
function checkEvalStructure(evalEntry, idx, skill, relPath) {
  const evalId = evalEntry.id ?? `[index ${idx}]`;

  // Required fields
  if (evalEntry.id === undefined || evalEntry.id === null) {
    addFinding(skill, relPath, null, 'error', 'missing-id',
      `Eval at index ${idx} is missing required field: id`);
  }

  if (!evalEntry.prompt) {
    addFinding(skill, relPath, evalId, 'error', 'missing-prompt',
      `Eval is missing required field: prompt`);
  }

  if (!evalEntry.expectations) {
    addFinding(skill, relPath, evalId, 'error', 'missing-expectations',
      `Eval is missing required field: expectations`);
  } else if (!Array.isArray(evalEntry.expectations)) {
    addFinding(skill, relPath, evalId, 'error', 'expectations-not-array',
      `Eval expectations must be an array, got: ${typeof evalEntry.expectations}`);
  } else {
    // Check for empty expectations
    if (evalEntry.expectations.length === 0) {
      addFinding(skill, relPath, evalId, 'warning', 'empty-expectations',
        `Eval has an empty expectations array`);
    }

    // Check for duplicate expectations
    const seen = new Set();
    for (const exp of evalEntry.expectations) {
      if (typeof exp !== 'string') {
        addFinding(skill, relPath, evalId, 'error', 'expectation-not-string',
          `Expectation must be a string, got: ${typeof exp}`);
        continue;
      }
      const normalized = exp.trim().toLowerCase();
      if (seen.has(normalized)) {
        addFinding(skill, relPath, evalId, 'warning', 'duplicate-expectation',
          `Duplicate expectation: "${exp.substring(0, 80)}${exp.length > 80 ? '...' : ''}"`);
      }
      seen.add(normalized);
    }
  }

  // Required metadata
  for (const field of REQUIRED_METADATA) {
    if (!evalEntry[field]) {
      addFinding(skill, relPath, evalId, 'warning', 'missing-metadata',
        `Eval is missing metadata field: ${field}`);
    }
  }

  return evalId;
}

// ─── Fix metadata ─────────────────────────────────────────────────────

/**
 * Add missing metadata fields with defaults to evals in a file.
 * Returns true if any changes were made.
 */
function fixMissingMetadata(evalPath, data) {
  let changed = false;

  if (!data.evals || !Array.isArray(data.evals)) return false;

  for (const evalEntry of data.evals) {
    for (const field of REQUIRED_METADATA) {
      if (!evalEntry[field]) {
        evalEntry[field] = METADATA_DEFAULTS[field];
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(evalPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  }

  return changed;
}

// ─── Main lint function ───────────────────────────────────────────────

function lintEvalFile(skillName, evalPath, relPath) {
  let raw;
  try {
    raw = fs.readFileSync(evalPath, 'utf8');
  } catch (err) {
    addFinding(skillName, relPath, null, 'error', 'read-error',
      `Cannot read file: ${err.message}`);
    return 0;
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    addFinding(skillName, relPath, null, 'error', 'parse-error',
      `Invalid JSON: ${err.message}`);
    return 0;
  }

  // Check top-level structure
  if (!data.evals) {
    addFinding(skillName, relPath, null, 'error', 'missing-evals-array',
      `File is missing top-level "evals" array`);
    return 0;
  }

  if (!Array.isArray(data.evals)) {
    addFinding(skillName, relPath, null, 'error', 'evals-not-array',
      `Top-level "evals" must be an array, got: ${typeof data.evals}`);
    return 0;
  }

  const evalCount = data.evals.length;

  if (evalCount === 0) {
    addFinding(skillName, relPath, null, 'warning', 'empty-evals',
      `File has an empty evals array`);
    return 0;
  }

  // Check for duplicate IDs
  const idsSeen = new Map();
  for (let i = 0; i < data.evals.length; i++) {
    const evalEntry = data.evals[i];
    if (evalEntry.id !== undefined && evalEntry.id !== null) {
      if (idsSeen.has(evalEntry.id)) {
        addFinding(skillName, relPath, evalEntry.id, 'error', 'duplicate-id',
          `Duplicate eval ID: ${evalEntry.id} (first at index ${idsSeen.get(evalEntry.id)}, duplicate at index ${i})`);
      } else {
        idsSeen.set(evalEntry.id, i);
      }
    }
  }

  // Lint each eval
  for (let i = 0; i < data.evals.length; i++) {
    const evalEntry = data.evals[i];

    // Structural checks
    const evalId = checkEvalStructure(evalEntry, i, skillName, relPath);

    // Content checks on prompt
    if (evalEntry.prompt && typeof evalEntry.prompt === 'string') {
      checkFilePaths(evalEntry.prompt, skillName, relPath, evalId);
      checkUrls(evalEntry.prompt, skillName, relPath, evalId);
    }

    // Content checks on expected_output
    if (evalEntry.expected_output && typeof evalEntry.expected_output === 'string') {
      checkFilePaths(evalEntry.expected_output, skillName, relPath, evalId);
      checkUrls(evalEntry.expected_output, skillName, relPath, evalId);
    }

    // Content checks on expectations
    if (Array.isArray(evalEntry.expectations)) {
      for (const exp of evalEntry.expectations) {
        if (typeof exp !== 'string') continue;
        checkFilePaths(exp, skillName, relPath, evalId);
        checkUrls(exp, skillName, relPath, evalId);
        checkStaleFunctions(exp, skillName, relPath, evalId);
      }
    }
  }

  // Fix metadata if requested
  if (fixMetadata) {
    const changed = fixMissingMetadata(evalPath, data);
    if (changed) {
      addFinding(skillName, relPath, null, 'info', 'metadata-fixed',
        `Added missing metadata fields with defaults`);
    }
  }

  return evalCount;
}

// ─── Output formatting ───────────────────────────────────────────────

const SEVERITY_COLORS = {
  error: '\x1b[31m',   // red
  warning: '\x1b[33m', // yellow
  info: '\x1b[36m',    // cyan
};
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

function formatHumanOutput(totalEvals) {
  if (findings.length === 0) {
    console.log(`\n${BOLD}eval-linter${RESET}: ${totalEvals} evals checked across all skills — ${BOLD}no issues found${RESET}\n`);
    return;
  }

  // Group by skill
  const bySkill = new Map();
  for (const f of findings) {
    if (!bySkill.has(f.skill)) bySkill.set(f.skill, []);
    bySkill.get(f.skill).push(f);
  }

  console.log(`\n${BOLD}eval-linter${RESET}: ${totalEvals} evals checked\n`);

  for (const [skill, skillFindings] of [...bySkill.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`${BOLD}${skill}${RESET} ${DIM}(${skillFindings[0].file})${RESET}`);

    for (const f of skillFindings) {
      const color = SEVERITY_COLORS[f.severity] || '';
      const evalLabel = f.evalId !== null ? ` eval #${f.evalId}` : '';
      console.log(`  ${color}${f.severity.toUpperCase().padEnd(7)}${RESET}${evalLabel} [${f.rule}] ${f.message}`);
    }
    console.log('');
  }

  // Summary
  const errorCount = findings.filter(f => f.severity === 'error').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const infoCount = findings.filter(f => f.severity === 'info').length;
  const skillCount = bySkill.size;

  console.log(`${BOLD}Summary${RESET}: ${findings.length} findings across ${skillCount} skill(s)`);
  console.log(`  ${SEVERITY_COLORS.error}${errorCount} error(s)${RESET}  ${SEVERITY_COLORS.warning}${warningCount} warning(s)${RESET}  ${SEVERITY_COLORS.info}${infoCount} info${RESET}`);
  console.log(`  ${totalEvals} total evals checked\n`);
}

function formatJsonOutput(totalEvals) {
  const errorCount = findings.filter(f => f.severity === 'error').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;
  const infoCount = findings.filter(f => f.severity === 'info').length;

  const output = {
    totalEvals,
    totalFindings: findings.length,
    summary: {
      errors: errorCount,
      warnings: warningCount,
      info: infoCount,
    },
    findings: findings.map(f => ({
      skill: f.skill,
      file: f.file,
      evalId: f.evalId,
      severity: f.severity,
      rule: f.rule,
      message: f.message,
    })),
  };

  console.log(JSON.stringify(output, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────

function main() {
  const evalFiles = discoverEvalFiles();

  if (evalFiles.length === 0) {
    if (targetSkill) {
      console.error(`No evals.json found for skill: ${targetSkill}`);
    } else {
      console.error('No evals.json files found under skills/');
    }
    process.exit(1);
  }

  let totalEvals = 0;

  for (const { skillName, evalPath, relPath } of evalFiles) {
    totalEvals += lintEvalFile(skillName, evalPath, relPath);
  }

  if (jsonOutput) {
    formatJsonOutput(totalEvals);
  } else {
    formatHumanOutput(totalEvals);
  }

  // Exit with error code if there are errors
  const hasErrors = findings.some(f => f.severity === 'error');
  if (hasErrors) {
    process.exit(1);
  }
}

main();
