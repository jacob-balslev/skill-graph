#!/usr/bin/env node
'use strict';

/**
 * eval-staleness-checker.js
 *
 * Checks eval files (evals.json) for staleness — where eval expectations
 * reference paths, symbols, or code patterns that no longer exist in the repo.
 *
 * Usage:
 *   node scripts/skill/eval-staleness-checker.js              # check all skills
 *   node scripts/skill/eval-staleness-checker.js --skill nextauth-patterns  # single skill
 *   node scripts/skill/eval-staleness-checker.js --json        # JSON output only
 *   node scripts/skill/eval-staleness-checker.js --all         # check all evals, not just substance:"domain"
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function getFlag(name) {
  return args.includes(`--${name}`);
}

function getFlagValue(name) {
  const idx = args.indexOf(`--${name}`);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const filterSkill = getFlagValue('skill');
const jsonOutput = getFlag('json');
const checkAll = getFlag('all');
const showHelp = getFlag('help') || getFlag('h');

if (showHelp) {
  console.log(`Usage: node scripts/skill/eval-staleness-checker.js [options]

Options:
  --skill <name>   Check only the named skill
  --json           Output findings as JSON array
  --all            Check all evals, not just substance:"domain"
  --help           Show this help message

Examples:
  node scripts/skill/eval-staleness-checker.js
  node scripts/skill/eval-staleness-checker.js --skill nextauth-patterns
  node scripts/skill/eval-staleness-checker.js --json
  node scripts/skill/eval-staleness-checker.js --all --json`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Skill directory discovery
// ---------------------------------------------------------------------------

const SKILLS_ROOT = path.join(ROOT_DIR, 'skills');

/**
 * Recursively find all evals/evals.json files under the skills root.
 * Handles arbitrarily nested skill directories (skills/sales-hub/*, skills/agents/*, etc.).
 * A skill directory is any directory containing SKILL.md with an evals/evals.json sibling.
 * Returns array of { skillName, evalPath, skillDir }.
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
      const relPath = path.relative(SKILLS_ROOT, dir);
      const skillName = relPath.replace(/\\/g, '/'); // normalize Windows separators

      if (!filterSkill || skillName.includes(filterSkill)) {
        results.push({ skillName, evalPath, skillDir: dir });
      }
    }

    // Recurse into subdirectories (skip evals/, references/, findings/ to avoid false matches)
    const SKIP_DIRS = new Set(['evals', 'references', 'findings', 'node_modules', '.git']);
    for (const entry of entries) {
      if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
    }
  }

  if (fs.existsSync(SKILLS_ROOT)) {
    walk(SKILLS_ROOT);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Path resolution prefixes — tried in order when checking file existence
// ---------------------------------------------------------------------------

const PATH_PREFIXES = [
  '',                              // absolute or already rooted
  ROOT_DIR,                        // repo root
  path.join(ROOT_DIR, 'sales-hub'),
  path.join(ROOT_DIR, 'sales-hub', 'apps', 'web', 'src'),
  path.join(ROOT_DIR, 'agent-orchestration'),
];

// ---------------------------------------------------------------------------
// Claim extraction — regex patterns for paths, symbols, and line numbers
// ---------------------------------------------------------------------------

// File path patterns: things that look like relative file paths with extensions
const PATH_REGEX = /(?:^|[\s"'`(,])([a-zA-Z0-9_@./\-]+\/[a-zA-Z0-9_.\-]+\.[a-zA-Z]{1,6})(?:[\s"'`),;:]|$)/g;

// More specific patterns for common path prefixes
const EXPLICIT_PATH_REGEX = /(?:(?:lib|apps|src|components|pages|api|scripts|tests|styles|hooks|utils|middleware|providers|config|public)\/[a-zA-Z0-9_./\-]+\.[a-zA-Z]{1,6})/g;

// Function/symbol patterns: word followed by ()
const SYMBOL_REGEX = /\b([a-zA-Z_][a-zA-Z0-9_]*)\(\)/g;

// Line number patterns: "line NNN", ":NNN", "line NNN-NNN"
const LINE_NUMBER_REGEX = /(?:(?:line\s+|:)(\d{2,})(?:\s*[-–]\s*(\d+))?)/gi;

// File path + line number combined pattern: filename.ts:153-164
const PATH_LINE_REGEX = /([a-zA-Z0-9_./\-]+\.[a-zA-Z]{1,6}):(\d+)(?:\s*[-–]\s*(\d+))?/g;

/**
 * Extract all verifiable claims from text fields of an eval.
 * Returns array of { type, value, context }.
 */
function extractClaims(evalEntry) {
  const claims = [];
  const seen = new Set(); // deduplicate

  // Collect all text fields to scan
  const textFields = [];
  if (evalEntry.prompt) textFields.push({ field: 'prompt', text: evalEntry.prompt });
  if (evalEntry.expected_output) textFields.push({ field: 'expected_output', text: evalEntry.expected_output });
  if (Array.isArray(evalEntry.expectations)) {
    evalEntry.expectations.forEach((exp, i) => {
      textFields.push({ field: `expectations[${i}]`, text: exp });
    });
  }

  for (const { field, text } of textFields) {
    // Extract file paths with line numbers first (more specific)
    let match;
    PATH_LINE_REGEX.lastIndex = 0;
    while ((match = PATH_LINE_REGEX.exec(text)) !== null) {
      const filePath = match[1];
      const lineStart = parseInt(match[2], 10);
      const lineEnd = match[3] ? parseInt(match[3], 10) : null;

      const pathKey = `path:${filePath}`;
      if (!seen.has(pathKey)) {
        seen.add(pathKey);
        claims.push({ type: 'path', value: filePath, field });
      }

      const lineKey = `line:${filePath}:${lineStart}`;
      if (!seen.has(lineKey)) {
        seen.add(lineKey);
        claims.push({
          type: 'line_number',
          value: { file: filePath, lineStart, lineEnd },
          field,
        });
      }
    }

    // Extract explicit file paths (lib/..., apps/..., etc.)
    EXPLICIT_PATH_REGEX.lastIndex = 0;
    while ((match = EXPLICIT_PATH_REGEX.exec(text)) !== null) {
      const filePath = match[0];
      const key = `path:${filePath}`;
      if (!seen.has(key)) {
        seen.add(key);
        claims.push({ type: 'path', value: filePath, field });
      }
    }

    // Extract general file paths (must contain / and an extension)
    PATH_REGEX.lastIndex = 0;
    while ((match = PATH_REGEX.exec(text)) !== null) {
      const filePath = match[1];
      // Filter out obvious non-paths
      if (isLikelyPath(filePath)) {
        const key = `path:${filePath}`;
        if (!seen.has(key)) {
          seen.add(key);
          claims.push({ type: 'path', value: filePath, field });
        }
      }
    }

    // Extract function/symbol names
    SYMBOL_REGEX.lastIndex = 0;
    while ((match = SYMBOL_REGEX.exec(text)) !== null) {
      const symbol = match[1];
      // Skip generic/built-in symbols
      if (!isGenericSymbol(symbol)) {
        const key = `symbol:${symbol}`;
        if (!seen.has(key)) {
          seen.add(key);
          claims.push({ type: 'symbol', value: symbol, field });
        }
      }
    }

    // Extract standalone line number references (line NNN)
    LINE_NUMBER_REGEX.lastIndex = 0;
    while ((match = LINE_NUMBER_REGEX.exec(text)) !== null) {
      // Only standalone line refs that aren't already captured by PATH_LINE_REGEX
      const lineNum = parseInt(match[1], 10);
      // Try to find a nearby file reference in the same text
      const nearbyFile = findNearbyFile(text, match.index);
      if (nearbyFile) {
        const key = `line:${nearbyFile}:${lineNum}`;
        if (!seen.has(key)) {
          seen.add(key);
          claims.push({
            type: 'line_number',
            value: { file: nearbyFile, lineStart: lineNum, lineEnd: match[2] ? parseInt(match[2], 10) : null },
            field,
          });
        }
      }
    }
  }

  return claims;
}

/**
 * Check if a string looks like a real file path vs a URL or generic reference.
 */
function isLikelyPath(str) {
  // Must contain at least one /
  if (!str.includes('/')) return false;
  // Skip URLs
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('//')) return false;
  // Skip @/ imports (these are aliases, not literal paths)
  if (str.startsWith('@/')) {
    // Convert @/ to a resolvable path for checking
    return true;
  }
  // Must have a file extension that's code-like
  const ext = path.extname(str).toLowerCase();
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.json', '.md', '.sql', '.sh', '.yaml', '.yml', '.toml', '.env', '.html', '.spec'];
  if (!codeExtensions.includes(ext)) return false;
  // Skip things that look like version strings (e.g., v5/next)
  if (/^\d/.test(str)) return false;
  return true;
}

/**
 * Skip well-known built-in/generic function names that aren't repo-specific.
 */
function isGenericSymbol(name) {
  const generics = new Set([
    // JS/TS built-ins
    'require', 'import', 'export', 'console', 'log', 'error', 'warn',
    'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
    'JSON', 'parse', 'stringify', 'toString', 'valueOf',
    'push', 'pop', 'shift', 'unshift', 'map', 'filter', 'reduce',
    'find', 'forEach', 'includes', 'indexOf', 'slice', 'splice',
    'join', 'split', 'trim', 'replace', 'match', 'test',
    'Object', 'Array', 'String', 'Number', 'Boolean', 'Date',
    'Promise', 'then', 'catch', 'finally', 'resolve', 'reject',
    'async', 'await', 'throw', 'new', 'delete', 'typeof',
    // React
    'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
    'useContext', 'useReducer', 'useLayoutEffect',
    'React', 'render', 'createElement',
    // Next.js
    'NextResponse', 'NextRequest',
    // Generic patterns
    'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
    'fetch', 'Response', 'Request', 'Headers',
    'null', 'undefined', 'true', 'false',
  ]);
  return generics.has(name);
}

/**
 * Try to find a file path mentioned near a line number reference in the text.
 */
function findNearbyFile(text, lineRefIndex) {
  // Look within ~200 chars before the line reference
  const searchStart = Math.max(0, lineRefIndex - 200);
  const searchText = text.substring(searchStart, lineRefIndex);

  // Try explicit paths first
  EXPLICIT_PATH_REGEX.lastIndex = 0;
  const explicitMatches = [...searchText.matchAll(new RegExp(EXPLICIT_PATH_REGEX.source, 'g'))];
  if (explicitMatches.length > 0) {
    return explicitMatches[explicitMatches.length - 1][0]; // closest match
  }

  // Try general paths
  const generalMatches = [...searchText.matchAll(new RegExp(PATH_REGEX.source, 'g'))];
  for (let i = generalMatches.length - 1; i >= 0; i--) {
    const candidate = generalMatches[i][1];
    if (isLikelyPath(candidate)) return candidate;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Claim validation
// ---------------------------------------------------------------------------

// Cache for bare filename lookups (avoid repeated find calls for the same name)
const _bareFileCache = new Map();

/**
 * Resolve a file path reference to an actual file on disk.
 * Tries prefix-based resolution first, then falls back to a bare filename search
 * for references like `auth-server.ts` that lack directory context.
 * Returns the resolved absolute path or null.
 */
function resolveFilePath(filePath) {
  // Normalize @/ alias to sales-hub/apps/web/src/
  let normalized = filePath;
  if (normalized.startsWith('@/')) {
    normalized = normalized.replace('@/', '');
  }

  // Remove leading ./ if present
  if (normalized.startsWith('./')) {
    normalized = normalized.substring(2);
  }

  // Phase 1: Prefix-based resolution (fast path)
  for (const prefix of PATH_PREFIXES) {
    const candidate = path.join(prefix, normalized);
    if (fs.existsSync(candidate)) return candidate;
  }

  // Phase 2: Bare filename fallback for references without directory context.
  // Only trigger when the reference has no directory separators (e.g., "auth-server.ts")
  // or when it's a short relative path that didn't match any prefix.
  const basename = path.basename(normalized);
  if (_bareFileCache.has(basename)) {
    return _bareFileCache.get(basename);
  }

  // Search common source directories for the bare filename
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
        const firstMatch = result.split('\n')[0];
        _bareFileCache.set(basename, firstMatch);
        return firstMatch;
      }
    } catch {
      // find can fail on permission errors or timeout — continue
    }
  }

  _bareFileCache.set(basename, null);
  return null;
}

/**
 * Count lines in a file efficiently.
 */
function countFileLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch {
    return -1;
  }
}

/**
 * Search for a symbol in the codebase using grep (via execFileSync for safety).
 * Returns { found: boolean, location: string|null }.
 */
function symbolExists(symbol, contextFile) {
  // If we have a context file, check there first
  if (contextFile) {
    const resolved = resolveFilePath(contextFile);
    if (resolved) {
      try {
        const content = fs.readFileSync(resolved, 'utf8');
        if (content.includes(symbol)) return { found: true, location: resolved };
      } catch {
        // fall through to broader search
      }
    }
  }

  // Broader search in likely locations
  const searchDirs = [
    path.join(ROOT_DIR, 'sales-hub', 'apps', 'web', 'src'),
    path.join(ROOT_DIR, 'sales-hub', 'packages'),
    path.join(ROOT_DIR, 'agent-orchestration'),
    path.join(ROOT_DIR, 'scripts'),
  ];

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    try {
      const result = execFileSync(
        'grep',
        ['-rl', '--include=*.ts', '--include=*.tsx', '--include=*.js', symbol, dir],
        { encoding: 'utf8', timeout: 5000 }
      ).trim();
      if (result) {
        const firstFile = result.split('\n')[0];
        return { found: true, location: firstFile };
      }
    } catch {
      // grep returns exit code 1 when no matches found
    }
  }

  return { found: false, location: null };
}

/**
 * Validate a single claim.
 * Returns { status, detail }.
 */
function validateClaim(claim) {
  switch (claim.type) {
    case 'path': {
      const resolved = resolveFilePath(claim.value);
      if (resolved) {
        return { status: 'valid', detail: `File exists: ${resolved}` };
      }
      return { status: 'stale', detail: `File not found: ${claim.value} (tried ${PATH_PREFIXES.length} prefixes)` };
    }

    case 'symbol': {
      // Try to find a context file from the same eval's path claims
      const result = symbolExists(claim.value, claim._contextFile || null);
      if (result.found) {
        return { status: 'valid', detail: `Symbol found in ${result.location}` };
      }
      return { status: 'stale', detail: `Symbol "${claim.value}" not found in codebase` };
    }

    case 'line_number': {
      const { file, lineStart, lineEnd } = claim.value;
      const resolved = resolveFilePath(file);
      if (!resolved) {
        return { status: 'stale', detail: `Cannot verify line ${lineStart} — file not found: ${file}` };
      }
      const totalLines = countFileLines(resolved);
      if (totalLines === -1) {
        return { status: 'warning', detail: `Cannot read file to verify line count: ${resolved}` };
      }
      const checkLine = lineEnd || lineStart;
      if (checkLine > totalLines) {
        return {
          status: 'stale',
          detail: `Line ${checkLine} exceeds file length (${totalLines} lines): ${resolved}`,
        };
      }
      return { status: 'valid', detail: `Line ${lineStart}${lineEnd ? '-' + lineEnd : ''} within range (file has ${totalLines} lines)` };
    }

    default:
      return { status: 'warning', detail: `Unknown claim type: ${claim.type}` };
  }
}

// ---------------------------------------------------------------------------
// Main execution
// ---------------------------------------------------------------------------

function main() {
  const evalFiles = discoverEvalFiles();

  if (evalFiles.length === 0) {
    if (filterSkill) {
      console.error(`No eval files found for skill: ${filterSkill}`);
    } else {
      console.error('No eval files found.');
    }
    process.exit(1);
  }

  const allFindings = [];
  let totalEvalsChecked = 0;
  let totalClaims = 0;
  let totalStale = 0;
  let totalValid = 0;
  let totalWarning = 0;
  let totalEvalsSkipped = 0;

  for (const { skillName, evalPath } of evalFiles) {
    let evalData;
    try {
      const raw = fs.readFileSync(evalPath, 'utf8');
      evalData = JSON.parse(raw);
    } catch (err) {
      allFindings.push({
        skill: skillName,
        evalId: null,
        claim: null,
        type: 'error',
        status: 'warning',
        detail: `Failed to parse ${evalPath}: ${err.message}`,
      });
      continue;
    }

    const evals = evalData.evals || [];

    for (const evalEntry of evals) {
      // Filter by substance:"domain" unless --all is set
      if (!checkAll && evalEntry.substance !== 'domain') {
        totalEvalsSkipped++;
        continue;
      }

      totalEvalsChecked++;

      const claims = extractClaims(evalEntry);
      if (claims.length === 0) continue;

      // Collect path claims for symbol context
      const pathClaims = claims.filter(c => c.type === 'path').map(c => c.value);

      for (const claim of claims) {
        totalClaims++;

        // Give symbols context about nearby path references
        if (claim.type === 'symbol' && pathClaims.length > 0) {
          claim._contextFile = pathClaims[0];
        }

        const result = validateClaim(claim);

        if (result.status === 'stale') totalStale++;
        else if (result.status === 'valid') totalValid++;
        else if (result.status === 'warning') totalWarning++;

        allFindings.push({
          skill: skillName,
          evalId: evalEntry.id,
          claim: claim.type === 'line_number'
            ? `${claim.value.file}:${claim.value.lineStart}${claim.value.lineEnd ? '-' + claim.value.lineEnd : ''}`
            : claim.value,
          type: claim.type,
          status: result.status,
          detail: result.detail,
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Output
  // ---------------------------------------------------------------------------

  if (jsonOutput) {
    console.log(JSON.stringify(allFindings, null, 2));
  } else {
    // Human-readable output
    const staleFindings = allFindings.filter(f => f.status === 'stale');
    const warningFindings = allFindings.filter(f => f.status === 'warning');

    if (staleFindings.length > 0) {
      console.log('\n--- STALE CLAIMS ---\n');
      for (const f of staleFindings) {
        console.log(`  [STALE] ${f.skill} (eval #${f.evalId}) — ${f.type}: ${f.claim}`);
        console.log(`          ${f.detail}`);
        console.log();
      }
    }

    if (warningFindings.length > 0) {
      console.log('\n--- WARNINGS ---\n');
      for (const f of warningFindings) {
        console.log(`  [WARN]  ${f.skill} (eval #${f.evalId ?? '?'}) — ${f.type}: ${f.claim ?? 'N/A'}`);
        console.log(`          ${f.detail}`);
        console.log();
      }
    }

    if (staleFindings.length === 0 && warningFindings.length === 0) {
      console.log('\nAll claims are valid.\n');
    }

    // Summary
    console.log('--- SUMMARY ---');
    console.log(`  Eval files scanned: ${evalFiles.length}`);
    console.log(`  Evals checked:      ${totalEvalsChecked}${!checkAll ? ` (${totalEvalsSkipped} skipped — no substance:"domain")` : ''}`);
    console.log(`  Total claims:       ${totalClaims}`);
    console.log(`  Valid:              ${totalValid}`);
    console.log(`  Stale:              ${totalStale}`);
    console.log(`  Warnings:           ${totalWarning}`);
    console.log();

    if (totalStale > 0) {
      process.exit(1);
    }
  }
}

main();
