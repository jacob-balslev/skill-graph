'use strict';

/**
 * Shared privacy detection patterns for the Skill Graph defense-in-depth gate.
 *
 * This module is the SINGLE SOURCE OF TRUTH for `PRIVACY_PATTERNS` and the
 * scan logic. It is consumed by:
 *
 *   L2 — export-marketplace-skills.js  (export-time gate, fails closed — in THIS repo)
 *   L3 — skills/hooks/pre-push         (pre-push hook in the PUBLIC skills repo)
 *   L4 — .github/workflows/privacy-scan.yml + scripts/ci-privacy-scan.js
 *        (CI gate in the PUBLIC skills repo `jacob-balslev/skills` — SH-6325;
 *        runs the full-tree scan on every PR/push to its `main`)
 *
 * Repo note: L3 and L4 live in the PUBLIC skills repo (the sibling
 * `~/Development/skills/`, which is both the canonical source and the published
 * release), NOT in skill-graph — whose only workflows are `publish.yml` and
 * `skill-graph-lint.yml`. (Clarified 2026-06-10 after a verification miss: the
 * L4 layer is real; it is just hosted in the public repo, not this one.)
 *
 * Architecture: ADR 0012 "Internal Skill Library Separation: Defense-in-Depth Gate"
 * (skill-graph/docs/adr/0012-internal-skill-library-separation.md)
 *
 * HARD RULE: No Sales Hub / Sales Channels / Printify / Shopify / customer /
 * personal API / bank / credential / PII data may enter the public skills repo
 * or the eval pipeline — ever.
 */

/**
 * @typedef {Object} PrivacyPattern
 * @property {string} id      - Machine-readable identifier used in finding reports.
 * @property {string} message - Human-readable description of the pattern class.
 * @property {RegExp} regex   - Stateful regex. Reset `lastIndex` before each scan.
 */

/**
 * Canonical set of privacy-violation patterns.
 * Any new internal path prefix, DB surface name, or project-specific identifier
 * that must be blocked must be added here — all gate layers consume it via this module.
 *
 * @type {PrivacyPattern[]}
 */
const PRIVACY_PATTERNS = [
  {
    id: 'windows_user_path',
    message: 'local Windows user path',
    regex: /\b[A-Za-z]:[\\/]+Users[\\/]+[^ \t\r\n"')]+/g,
  },
  {
    id: 'posix_user_path',
    message: 'local macOS user path',
    regex: /(^|[\s"'(])\/Users\/[^ \t\r\n"')]+/g,
  },
  {
    id: 'linux_home_path',
    message: 'local Linux home path',
    regex: /(^|[\s"'(])\/home\/[^\/\s"')]+\/[^ \t\r\n"')]+/g,
  },
  {
    id: 'email_address',
    message: 'email address',
    // SKI-247: ReDoS-safe. The prior `[A-Z0-9.-]+\.[A-Z]{2,}` let the char class
    // AND the final `\.` both match dots — ambiguous backtracking that degraded
    // to O(n^2)+ on adversarial input (~3.3s at 32k chars on the export scan
    // buffer). This label-based form has NO dot inside a label, so each `.`
    // advances unambiguously → linear (~0.3ms at 32k). It matches the same real
    // emails (or more completely, e.g. punycode TLDs) — never fewer, so the P0
    // leak filter cannot under-match.
    regex: /\b[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)+/gi,
  },
  {
    id: 'private_key',
    message: 'private key block',
    regex: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/g,
  },
  {
    id: 'known_secret_prefix',
    message: 'token-like secret prefix',
    regex: /\b(?:AIza[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|shpat_[A-Za-z0-9]{20,}|shpss_[A-Za-z0-9]{20,}|napi_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/g,
  },
  {
    // Defense-in-depth behind the scope/grounding publication gate: a skill that is
    // mis-marked as portable but still names a private codebase path leaks internal
    // architecture. The canonical private repo is `sales-hub`; its app source lives
    // under `apps/web/src`.
    id: 'internal_codebase_path',
    message: 'internal codebase path (sales-hub / app source)',
    regex: /(^|[\s"'(`/])(?:sales-hub|apps\/web\/src)(?:[\/\s"')`]|$)/gi,
  },
  {
    // Internal database surface names observed leaking via codebase-grounded skills
    // (stripe-ledger-recon, etc.). These are private storage surfaces, never
    // portable knowledge.
    id: 'internal_db_surface',
    message: 'internal database surface name',
    regex: /\b(?:stripe_(?:events_raw|payments_raw|order_links|balance_transactions)|shopify_(?:orders_raw|line_item_tax_lines)|printify_(?:blueprints|line_items|order_items|shipments)|fx_rates_daily)\b/gi,
  },
  {
    id: 'local_artifact_path',
    message: 'local-only artifact path',
    regex: /(^|[\s"'(])(?:\.artifacts|\.research|\.roundtable|audits\/_state|audits\\_state)(?:[\/\\]|$)/gi,
  },
  {
    id: 'private_project_name',
    message: 'known private project name',
    regex: /\b(?:placeholder-project-name|boardmeeting|free-oppression-data)\b/gi,
  },
];

/**
 * @typedef {Object} PrivacyFinding
 * @property {string} file    - Path to the file containing the violation (display-formatted by the caller).
 * @property {number} line    - 1-based line number of the first character of the match.
 * @property {string} id      - Pattern identifier from PRIVACY_PATTERNS.
 * @property {string} message - Human-readable description of the pattern.
 * @property {string} match   - Truncated match text (up to 120 characters).
 */

/**
 * Return the 1-based line number for a character offset inside `text`.
 *
 * @param {string} text
 * @param {number} index - Character offset.
 * @returns {number}
 */
function lineForIndex(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

/**
 * Scan `text` for privacy violations and return all findings.
 *
 * The `filePath` parameter is used only for the `file` field in returned
 * findings — callers are responsible for normalizing it to a display-friendly
 * form (repo-relative, absolute, etc.).
 *
 * @param {string} text     - Full text content to scan.
 * @param {string} filePath - Path included verbatim in each finding's `file` field.
 * @returns {PrivacyFinding[]}
 */
function scanPrivacyText(text, filePath) {
  const findings = [];
  for (const pattern of PRIVACY_PATTERNS) {
    pattern.regex.lastIndex = 0;
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      findings.push({
        file: filePath,
        line: lineForIndex(text, match.index),
        id: pattern.id,
        message: pattern.message,
        match: String(match[0]).trim().slice(0, 120),
      });
      if (match.index === pattern.regex.lastIndex) pattern.regex.lastIndex++;
    }
  }
  return findings;
}

/**
 * Scan one or more file paths for privacy violations.
 *
 * This is the primary entry point for callers that work at the filesystem
 * level (pre-push hook, CI scan). Each file's content is read synchronously.
 *
 * @param {string[]} filePaths    - Absolute or relative file paths to scan.
 * @param {{ fs?: object, pathDisplay?: (p: string) => string }} [opts]
 *   - `fs`: injectable filesystem module (defaults to the built-in `fs`). Useful
 *     for tests.
 *   - `pathDisplay`: transform applied to each path before it appears in
 *     finding `file` fields (e.g. to make paths repo-relative). Defaults to
 *     the identity function.
 * @returns {PrivacyFinding[]} All findings across all files, in file order.
 */
function detectPrivacyViolations(filePaths, opts = {}) {
  const fsModule = opts.fs || require('fs');
  const display = opts.pathDisplay || (p => p);
  const findings = [];
  for (const filePath of filePaths) {
    let text;
    try {
      text = fsModule.readFileSync(filePath, 'utf8');
    } catch (err) {
      // SKI-256: FAIL CLOSED. A privacy/safety gate must never silently skip a file it
      // cannot read — an unscannable file is NOT a clean file. Emit a blocking finding so
      // the gate fails on it (callers treat findings as failures) instead of letting an
      // unreadable file pass unscanned (the silent-skip here was a fail-open hole).
      findings.push({
        file: display(filePath),
        line: 0,
        id: 'unreadable-file',
        message: `cannot scan for privacy violations — file unreadable (${err.code || err.message}); failing closed (an unscannable file must not pass the privacy gate)`,
        match: '',
      });
      continue;
    }
    findings.push(...scanPrivacyText(text, display(filePath)));
  }
  return findings;
}

module.exports = {
  PRIVACY_PATTERNS,
  detectPrivacyViolations,
  lineForIndex,
  scanPrivacyText,
};
