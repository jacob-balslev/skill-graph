#!/usr/bin/env node
/**
 * Release-time security scan for the PUBLIC skill surface.
 *
 * Scans the exported marketplace skill bodies (`marketplace/skills/<name>/SKILL.md`
 * — the exact bytes that get published to github.com/jacob-balslev/skills +
 * skills.sh) for two classes of risk a published agent-skill library should
 * never ship silently:
 *
 *   1. EXECUTION / EXFILTRATION patterns in the body — a skill body is fed
 *      straight to an agent, so a `curl … | bash`, a base64-decode-and-eval, a
 *      reverse shell, a fork bomb, or a broad destructive `rm -rf` in the prose
 *      is an instruction the agent may act on. (Snyk's 2026 audit found
 *      1,467/3,984 public skills carrying malicious or dangerous content; a
 *      library that claims to be "the audited one" must have a signal here.)
 *   2. OVER-BROAD TOOL SCOPE — an `allowed-tools` declaration that grants a
 *      wildcard or an unrestricted shell/execute capability. A published skill
 *      should request the narrowest tool set it needs.
 *
 * Scope boundary: this scanner does NOT look for secrets / PII / internal paths
 * — that is `scripts/lib/privacy-patterns.js` (the export-time privacy gate,
 * fails-closed). This scanner is the complementary MALICIOUS-CONTENT signal.
 *
 * Default mode is ADVISORY (exit 0, findings printed): these are TEACHING
 * skills that legitimately discuss shell/injection patterns (e.g.
 * `prompt-injection-defense`), so a finding is a human-review prompt, not an
 * automatic block. `--strict` turns any finding into a non-zero exit for a
 * release that wants to hard-gate.
 *
 * Usage:
 *   node scripts/scan-skill-security.js                       # scan marketplace/skills (advisory)
 *   node scripts/scan-skill-security.js --strict              # non-zero exit on any finding
 *   node scripts/scan-skill-security.js marketplace/skills/a11y
 *   node scripts/scan-skill-security.js --json
 *
 * Self-contained. Only uses Node built-ins.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { parseFrontmatter } = require('./lib/parse-frontmatter');
const { workspaceRoot } = require('./lib/roots');

const REPO_ROOT = workspaceRoot();
const DEFAULT_TARGET = path.join(REPO_ROOT, 'marketplace', 'skills');

/**
 * @typedef {Object} SecurityPattern
 * @property {string} id      - Machine-readable identifier used in finding reports.
 * @property {string} severity - Canonical severity (P0..P4) for the finding class.
 * @property {string} message - Human-readable description of the risk class.
 * @property {RegExp} regex   - Stateful (global) regex; lastIndex is reset before each scan.
 */

/**
 * High-signal execution / exfiltration patterns. Deliberately narrow to keep the
 * false-positive rate low on teaching content — breadth is handled by advisory
 * mode + human review, not by matching every shell command that appears in prose.
 *
 * @type {SecurityPattern[]}
 */
const SECURITY_PATTERNS = [
  {
    id: 'pipe_to_shell',
    severity: 'P1',
    message: 'remote download piped directly into a shell (curl/wget … | sh/bash)',
    regex: /\b(?:curl|wget)\b[^\n|]*\|\s*(?:sudo\s+)?(?:bash|sh|zsh|ksh)\b/gi,
  },
  {
    id: 'base64_decode_exec',
    severity: 'P1',
    message: 'base64 (or other) decode piped into a shell or eval',
    regex: /\b(?:base64\s+-{1,2}d(?:ecode)?|openssl\s+enc\s+-d)\b[^\n|]*\|\s*(?:bash|sh|zsh)\b|\beval\s*\(\s*atob\s*\(/gi,
  },
  {
    id: 'reverse_shell',
    severity: 'P0',
    message: 'reverse-shell construct (/dev/tcp redirect or netcat -e)',
    regex: /(?:\bbash\b[^\n]*>&\s*\/dev\/tcp\/|\/dev\/tcp\/[0-9.]+\/[0-9]+|\bnc\b[^\n]*\s-[a-z]*e[a-z]*\s)/gi,
  },
  {
    id: 'fork_bomb',
    severity: 'P0',
    message: 'shell fork bomb',
    regex: /:\s*\(\s*\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/g,
  },
  {
    id: 'destructive_rm',
    severity: 'P1',
    message: 'broad destructive delete (rm -rf on / ~ $HOME or a glob root)',
    regex: /\brm\s+-[a-z]*r[a-z]*f[a-z]*\s+(?:--no-preserve-root\s+)?(?:\/(?:\s|$|\*)|~(?:\s|\/|$)|\$HOME\b|\/\*)/gi,
  },
  {
    id: 'curl_data_exfil',
    severity: 'P2',
    message: 'curl POSTing data to a hardcoded external URL (possible exfiltration — review intent)',
    regex: /\bcurl\b[^\n]*\s(?:-d|--data(?:-raw|-binary)?)\s[^\n]*\bhttps?:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0|example\.(?:com|org))/gi,
  },
  {
    id: 'dynamic_remote_eval',
    severity: 'P2',
    message: 'eval/Function of fetched or decoded remote content',
    regex: /(?:eval|Function)\s*\(\s*(?:await\s+)?(?:fetch|require\(['"]https?|process\.env)/gi,
  },
];

/**
 * `allowed-tools` declarations considered over-broad for a published skill.
 * Each entry: id + severity + message + a predicate over a single normalized
 * tool token. Severity is graded honestly: a bare-`*` grants EVERYTHING (P1),
 * a glob narrows to one tool but with a wildcard scope (P2), and a bare shell
 * tool name (`Bash`) is unrestricted but is the CONVENTIONAL Claude Code grant
 * for a skill that needs shell — so it is P3 "consider an allowlist", not an
 * alarm. The bare-shell case is intentionally low-severity to avoid flagging
 * ~20% of a legitimate teaching corpus at a level that trains reviewers to
 * ignore the channel.
 */
const OVERBROAD_TOOL_RULES = [
  { id: 'wildcard_all', severity: 'P1', message: 'grants ALL tools via a bare wildcard', test: t => t === '*' || t === 'all' },
  // Whole-argument wildcard only — `Bash(*)` is over-broad, but `Bash(git:*)`
  // is a properly prefix-restricted scope and must NOT be flagged.
  { id: 'wildcard_glob', severity: 'P2', message: 'grants a whole-argument wildcard tool scope (e.g. "Bash(*)")', test: t => /\(\s*\*\s*\)$/.test(t) },
  { id: 'unrestricted_shell', severity: 'P3', message: 'unrestricted shell/execute tool — consider a command allowlist (e.g. "Bash(git:*)")', test: t => /^(?:bash|shell|sh|execute|exec|run|terminal)$/i.test(t) },
];

function repoRelative(filePath) {
  return path.relative(REPO_ROOT, filePath).split(path.sep).join('/');
}

/** Recursively collect SKILL.md files under a path (file or dir). */
function collectSkillFiles(inputs) {
  const roots = inputs.length > 0 ? inputs.map(p => path.resolve(p)) : [DEFAULT_TARGET];
  const files = [];
  const walk = abs => {
    if (!fs.existsSync(abs)) return;
    const stat = fs.statSync(abs);
    if (stat.isFile()) {
      if (path.basename(abs) === 'SKILL.md') files.push(abs);
      return;
    }
    if (!stat.isDirectory()) return;
    for (const entry of fs.readdirSync(abs)) {
      if (entry === 'node_modules' || entry.startsWith('.')) continue;
      walk(path.join(abs, entry));
    }
  };
  for (const r of roots) walk(r);
  return files.sort((a, b) => repoRelative(a).localeCompare(repoRelative(b)));
}

/** Line number (1-based) of a character offset in `text`. */
function lineAt(text, index) {
  let line = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}

/**
 * Scan body text for execution/exfiltration patterns.
 * @returns {{id:string, severity:string, message:string, line:number, match:string}[]}
 */
function scanSecurityText(text) {
  const findings = [];
  if (typeof text !== 'string' || text.length === 0) return findings;
  for (const pattern of SECURITY_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let m;
    while ((m = pattern.regex.exec(text)) !== null) {
      findings.push({
        id: pattern.id,
        severity: pattern.severity,
        message: pattern.message,
        line: lineAt(text, m.index),
        match: m[0].replace(/\s+/g, ' ').slice(0, 120),
      });
      if (m.index === pattern.regex.lastIndex) pattern.regex.lastIndex++; // zero-width guard
    }
  }
  return findings;
}

/** Normalize an `allowed-tools` value (string or array) into a token list. */
function normalizeToolTokens(allowedTools) {
  if (allowedTools === undefined || allowedTools === null) return [];
  const raw = Array.isArray(allowedTools) ? allowedTools : String(allowedTools).split(/[\s,]+/);
  return raw.map(t => String(t).trim()).filter(Boolean);
}

/**
 * Flag over-broad tool scope in a parsed frontmatter object.
 * Reads both `allowed-tools` (exported name) and `allowed_tools` (source name).
 * @returns {{id:string, severity:string, message:string, line:number, match:string}[]}
 */
function checkToolScope(fm) {
  const findings = [];
  if (!fm || typeof fm !== 'object') return findings;
  const tokens = normalizeToolTokens(fm['allowed-tools'] !== undefined ? fm['allowed-tools'] : fm.allowed_tools);
  for (const tok of tokens) {
    for (const rule of OVERBROAD_TOOL_RULES) {
      if (rule.test(tok)) {
        findings.push({ id: `tool_scope_${rule.id}`, severity: rule.severity, message: `over-broad allowed-tools: ${rule.message}`, line: 0, match: tok });
        break; // one finding per token
      }
    }
  }
  return findings;
}

function scanSkillFile(skillMd) {
  const text = fs.readFileSync(skillMd, 'utf8');
  const fm = parseFrontmatter(text);
  const findings = [...scanSecurityText(text), ...checkToolScope(fm)];
  return { file: repoRelative(skillMd), findings };
}

function printText(results) {
  let total = 0;
  for (const r of results) {
    if (r.findings.length === 0) continue;
    process.stdout.write(`\nFINDINGS ${r.file}\n`);
    for (const f of r.findings) {
      total++;
      const where = f.line > 0 ? `:${f.line}` : '';
      process.stdout.write(`  [${f.severity}] ${f.id}${where} — ${f.message}\n        -> ${f.match}\n`);
    }
  }
  const skillsWith = results.filter(r => r.findings.length > 0).length;
  process.stdout.write(`\n${results.length} public skill(s) scanned: ${total} finding(s) across ${skillsWith} skill(s).\n`);
  if (total > 0) {
    process.stdout.write('Advisory: review each finding — teaching skills may legitimately show these patterns as anti-examples.\n');
  }
  return total;
}

function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const quiet = args.includes('--quiet');
  const strict = args.includes('--strict');
  const inputs = args.filter(a => !a.startsWith('--'));
  const skillFiles = collectSkillFiles(inputs);

  if (skillFiles.length === 0) {
    process.stderr.write('ERROR no SKILL.md files found to scan.\n');
    process.exit(1);
  }

  const results = skillFiles.map(scanSkillFile);
  const total = results.reduce((n, r) => n + r.findings.length, 0);

  if (outputJson) {
    process.stdout.write(JSON.stringify({ scanned: results.length, total, results: results.filter(r => r.findings.length) }, null, 2) + '\n');
  } else if (!quiet) {
    printText(results);
  }

  // Advisory by default (exit 0). --strict turns findings into a failing gate.
  process.exit(strict && total > 0 ? 1 : 0);
}

module.exports = {
  SECURITY_PATTERNS,
  OVERBROAD_TOOL_RULES,
  scanSecurityText,
  checkToolScope,
  normalizeToolTokens,
  collectSkillFiles,
  scanSkillFile,
};

if (require.main === module) main();
