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
 * @property {(match: string) => boolean} [validate] - Optional second-stage guard.
 *   When present, a regex match is reported ONLY if `validate(match)` returns true.
 *   This exists so structured financial identifiers (IBAN, payment card, ABA
 *   routing) can be matched by a deliberately loose regex and then confirmed by a
 *   checksum, so an innocent digit run in an example does NOT false-positive and
 *   break the CI/export gate. Patterns without `validate` behave exactly as before.
 */

// --- Checksum validators for structured-financial-identifier patterns ---
// These are the second-stage guard for the IBAN / payment-card / routing patterns
// below. The regex finds a CANDIDATE; the checksum decides whether it is real.
// Without the checksum, "a 16-digit number in an example" would false-positive;
// with it, a random digit run is rejected (Luhn rejects ~90%, the IIN prefix and
// the ISO-7064 mod-97 / ABA mod-10 checks reject nearly all of the remainder).

/** Strip every non-digit character. */
function digitsOnly(s) { return String(s).replace(/[^0-9]/g, ''); }

/** Luhn (mod-10) checksum — the standard payment-card check. */
function luhnValid(numStr) {
  const d = digitsOnly(numStr);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = d.charCodeAt(i) - 48;
    if (double) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Major-network IIN prefix — combined with Luhn, makes accidental matches negligible. */
function looksLikeCardIIN(numStr) {
  const d = digitsOnly(numStr);
  return /^4/.test(d)                      // Visa
    || /^(?:5[1-5]|2[2-7])/.test(d)        // Mastercard
    || /^3[47]/.test(d)                    // Amex
    || /^(?:6011|65|64[4-9]|622)/.test(d)  // Discover
    || /^3(?:0[0-5]|[68])/.test(d);        // Diners Club
}

/** A candidate is a real payment card iff it carries a known IIN AND passes Luhn. */
function creditCardValid(raw) {
  const d = digitsOnly(raw);
  return looksLikeCardIIN(d) && luhnValid(d);
}

/** ISO 7064 mod-97 IBAN check (the real IBAN validity test). */
function ibanValid(raw) {
  const s = String(raw).replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  if (s.length < 15 || s.length > 34) return false;
  const rearranged = s.slice(4) + s.slice(0, 4); // move country+check to the end
  let remainder = 0;
  for (const ch of rearranged) {
    // letters A-Z map to 10-35; digits stay as-is
    const mapped = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch;
    for (let j = 0; j < mapped.length; j++) {
      remainder = (remainder * 10 + (mapped.charCodeAt(j) - 48)) % 97;
    }
  }
  return remainder === 1;
}

/** US ABA routing-number checksum (mod-10, position-weighted 3-7-1). */
function abaRoutingValid(raw) {
  const d = digitsOnly(raw);
  if (d.length !== 9) return false;
  const n = d.split('').map((c) => c.charCodeAt(0) - 48);
  if (n.every((x) => x === 0)) return false; // all-zeros is not a real routing number
  const sum = 3 * (n[0] + n[3] + n[6]) + 7 * (n[1] + n[4] + n[7]) + (n[2] + n[5] + n[8]);
  return sum % 10 === 0;
}

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
  {
    // Structured financial identifier. The regex is a loose candidate finder; the
    // ISO 7064 mod-97 `validate` is the real guard, so a non-IBAN alphanumeric run
    // (a hash, a token, a version string) is rejected and cannot break the gate.
    id: 'iban',
    message: 'IBAN (international bank account number)',
    regex: /\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]){11,30}\b/g,
    validate: ibanValid,
  },
  {
    // Payment card number. `validate` requires a major-network IIN prefix AND a
    // passing Luhn checksum — so a random 13-19 digit number in an example does
    // NOT match (the exact false-positive that would otherwise break CI/export).
    id: 'credit_card',
    message: 'payment card number (Luhn-valid, major-network IIN)',
    regex: /\b(?:\d[ -]?){12,18}\d\b/g,
    validate: creditCardValid,
  },
  {
    // US ABA bank routing number — 9 digits gated by the mod-10 routing checksum,
    // so an arbitrary 9-digit run that does not satisfy the checksum is rejected.
    id: 'us_aba_routing',
    message: 'US ABA bank routing number (checksum-valid)',
    regex: /\b\d{9}\b/g,
    validate: abaRoutingValid,
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
      // Second-stage guard: a pattern with a `validate` checksum reports a match
      // ONLY when the checksum confirms it (keeps loose candidate regexes from
      // false-positiving on innocent digit/alphanumeric runs).
      if (typeof pattern.validate !== 'function' || pattern.validate(match[0])) {
        findings.push({
          file: filePath,
          line: lineForIndex(text, match.index),
          id: pattern.id,
          message: pattern.message,
          match: String(match[0]).trim().slice(0, 120),
        });
      }
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
