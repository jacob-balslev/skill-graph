'use strict';

/*
 * run-layout.js — project-owned canonical CONTRACT for the skill-audit run-dir layout.
 *
 * ADR-0016 surface #3 (run-dir layout) makes the LAYOUT CONTRACT — the deterministic
 * naming and directory structure of per-skill audit runs — project-owned, so it cannot
 * drift across the tools that read/write audit artifacts. This module is that contract:
 * the pure, filesystem-free naming functions plus the structural sub-path names. The
 * workspace runtime (`~/Development/scripts/skill/skill-audit-paths.js`) imports it,
 * supplies the absolute AUDIT_ROOT, and owns the fs I/O (mkdir, symlink) — the
 * "runtime-coordinated" half ADR-0016 leaves at the consumer location.
 *
 * Layout (decided 2026-05-22, replaces the flat <skill>.<type> pile):
 *
 *   <audit-root>/
 *     _ledger.jsonl                       ← append-only global run record (all skills, all runs)
 *     <skill>/
 *       runs/
 *         <YYYY-MM-DD>T<HHMM>--<op>--<model>--<run-id>/
 *           catalog.json research.md findings.md verdict.md scorecard.md
 *       history.jsonl                      ← append-only per-skill run record (one line / run)
 *       latest -> runs/<newest-run-dir>    ← symlink to the most recent run
 *
 * Run-dir name uses HHMM (no colon) so it stays portable across filesystems and tooling.
 * The run-id is a short random hex so two runs in the same minute by the same model never collide.
 *
 * This module is PURE: it takes an `auditRoot` argument for path builders and performs NO fs
 * I/O. Keeping it fs-free is what lets the same contract be unit-tested and consumed across
 * repos without coupling to one workspace's `.opencode/progress/skill-audits` root.
 */

const crypto = require('crypto');
const path = require('path');

// Operations that may own a run directory. `migrate` is reserved for the one-time backfill.
const VALID_OPS = ['audit', 'improve', 'evaluate', 'merge', 'evolve', 'migrate'];

// Capability tiers for lane gating (centrality-scaled rigor). A lane declares a minTier; an agent
// may claim it only if its ACTUAL runner model's tier is >= that floor. This decouples "work class"
// from "which model ran", so any CLI of sufficient tier (Opus, GPT-5.5, Gemini 3.1 Pro) can serve a
// critical lane and still be attributed honestly.
const TIER_RANK = { cheap: 1, mid: 2, high: 3 };

// Structural sub-path names (the directory/file layout under <audit-root>/<skill>/).
const RUNS_SUBDIR = 'runs';
const HISTORY_FILE = 'history.jsonl';
const LATEST_LINK = 'latest';
const LEDGER_FILE = '_ledger.jsonl';

/** Generate a short, collision-resistant run id (6 hex chars). */
function runId() {
  return crypto.randomBytes(3).toString('hex');
}

/** Normalise a model label into a filesystem-safe token (e.g. "claude-opus-4-7" -> "opus"). */
function sanitizeModel(model) {
  const m = String(model || 'unknown').toLowerCase();
  if (m.includes('opus')) return 'opus';
  if (m.includes('sonnet')) return 'sonnet';
  if (m.includes('haiku')) return 'haiku';
  if (m.includes('gpt-5.5') || m.includes('gpt55') || m.includes('gpt-5-5')) return 'gpt55';
  if (m.includes('gpt-5.4') || m.includes('gpt54') || m.includes('gpt-5-4')) return 'gpt54';
  if (m.includes('gemini-flash') || m.includes('flash')) return 'gemini-flash';
  if (m.includes('gemini')) return 'gemini';
  if (m.includes('minimax')) return 'minimax';
  if (m.includes('nemotron')) return 'nemotron';
  if (m.includes('codex')) return 'codex';
  if (m.includes('copilot')) return 'copilot';
  // Fall back to a sanitised slug so unknown models still produce a legal, legible token.
  return m.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'unknown';
}

/** Capability tier name for a model token: 'high' | 'mid' | 'cheap'. */
function modelTierName(model) {
  const m = sanitizeModel(model);
  if (['opus', 'gpt55', 'gemini'].includes(m)) return 'high';   // gemini = gemini-3.1-pro (flash is separate)
  if (['sonnet', 'gpt54'].includes(m)) return 'mid';
  return 'cheap'; // haiku, gemini-flash, minimax, nemotron, codex, copilot, unknown
}

/** Numeric rank of a model's tier (3=high, 1=cheap, 0=unknown-name). */
function tierRank(model) {
  return TIER_RANK[modelTierName(model)] || 0;
}

/** Numeric rank of a bare tier name ('high'|'mid'|'cheap'). */
function tierNameRank(name) {
  return TIER_RANK[name] || 0;
}

/** Filesystem-safe slug for lock keys: skill names may contain '/' (e.g. agents/claude-haiku). */
function lockSlug(skill) {
  return String(skill).replace(/\//g, '__');
}

/** Normalise an operation token; throws on an unknown op so typos cannot create rogue dirs. */
function sanitizeOp(op) {
  const o = String(op || '').toLowerCase();
  if (!VALID_OPS.includes(o)) {
    throw new Error(`run-layout: unknown op "${op}". Valid: ${VALID_OPS.join(', ')}`);
  }
  return o;
}

/** `YYYY-MM-DDTHHMM` from a Date (defaults to now). No colon — portable across filesystems. */
function runStamp(date = new Date()) {
  const iso = date.toISOString(); // 2026-05-22T14:42:01.123Z
  const [d, t] = iso.split('T');
  const hhmm = t.slice(0, 5).replace(':', ''); // "1442"
  return `${d}T${hhmm}`;
}

/** Compose the run-dir basename: "2026-05-22T1442--audit--opus--a1b2c3". */
function runDirName({ op, model, id, date } = {}) {
  const stamp = runStamp(date instanceof Date ? date : (date ? new Date(date) : new Date()));
  return `${stamp}--${sanitizeOp(op)}--${sanitizeModel(model)}--${id || runId()}`;
}

// --- Relative-path builders: take a caller-supplied absolute auditRoot, perform no I/O ---

/** Absolute path to a skill's audit dir under the given root. */
function skillDir(auditRoot, skill) {
  return path.join(auditRoot, skill);
}

/** Absolute path to a skill's runs/ dir. */
function runsDir(auditRoot, skill) {
  return path.join(skillDir(auditRoot, skill), RUNS_SUBDIR);
}

/** Absolute path to a run directory (does not create it). */
function runDir(auditRoot, skill, opts = {}) {
  return path.join(runsDir(auditRoot, skill), runDirName(opts));
}

/** Absolute path to a skill's per-skill history.jsonl. */
function historyPath(auditRoot, skill) {
  return path.join(skillDir(auditRoot, skill), HISTORY_FILE);
}

/** Absolute path to a skill's `latest` symlink. */
function latestPath(auditRoot, skill) {
  return path.join(skillDir(auditRoot, skill), LATEST_LINK);
}

/** Absolute path to the global append-only ledger. */
function ledgerPath(auditRoot) {
  return path.join(auditRoot, LEDGER_FILE);
}

/**
 * The relative symlink target a `latest` link should point at, given a run-dir absolute path.
 * Relative so the tree stays portable (e.g. "runs/2026-05-22T1442--audit--opus--a1b2c3").
 */
function latestTarget(auditRoot, skill, runDirAbs) {
  return path.relative(skillDir(auditRoot, skill), runDirAbs);
}

module.exports = {
  VALID_OPS,
  TIER_RANK,
  RUNS_SUBDIR,
  HISTORY_FILE,
  LATEST_LINK,
  LEDGER_FILE,
  runId,
  sanitizeModel,
  modelTierName,
  tierRank,
  tierNameRank,
  lockSlug,
  sanitizeOp,
  runStamp,
  runDirName,
  skillDir,
  runsDir,
  runDir,
  historyPath,
  latestPath,
  ledgerPath,
  latestTarget,
};
