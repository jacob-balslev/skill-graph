'use strict';

/**
 * log-paths.js — Resolve workspace-relative log paths for eval history,
 * comprehension history, application history, and skill-health ledger.
 *
 * Standalone operation:
 *   When @skill-graph/cli is installed via `npm install -g`, the parent
 *   Development monorepo does not exist. In that case the paths below
 *   fall back to the user's working directory (or a location supplied via
 *   environment variables), so the package never fails because
 *   agent-orchestration/logs/ is absent.
 *
 * Environment variable overrides (advanced):
 *   SKILL_GRAPH_LOG_DIR         — Base directory for all log files.
 *                                 Defaults to "<workspace>/agent-orchestration/logs".
 *   SKILL_GRAPH_EVAL_HISTORY    — Full path to eval-history.jsonl.
 *   SKILL_GRAPH_COMP_HISTORY    — Full path to comprehension-history.jsonl.
 *   SKILL_GRAPH_APP_HISTORY     — Full path to application-history.jsonl.
 *   SKILL_GRAPH_HEALTH_LEDGER   — Full path to skill-health-ledger.jsonl.
 *   SKILL_GRAPH_PROGRESS_DIR    — Base directory for batch-eval reports and
 *                                 skill-evolution progress files.
 *
 * The environment variables are checked first, then the workspace-relative
 * defaults. All paths are resolved at require() time so callers get stable
 * strings rather than deferred closures.
 */

const fs   = require('fs');
const path = require('path');
const { workspaceRoot } = require('./roots');

// ─── Workspace root ──────────────────────────────────────────────────────────

const WORKSPACE = workspaceRoot();

// ─── Base log directory ──────────────────────────────────────────────────────

/**
 * Resolve the log directory.
 * Priority:
 *  1. SKILL_GRAPH_LOG_DIR env var (absolute path)
 *  2. <workspace>/agent-orchestration/logs  (monorepo layout)
 *  3. <workspace>/.skill-graph/logs         (standalone layout)
 *
 * The standalone fallback ensures a writable path even when the parent
 * monorepo is absent. The directory is created on first write by each
 * log consumer (not here) so this module stays side-effect-free.
 */
function resolveLogDir() {
  if (process.env.SKILL_GRAPH_LOG_DIR) {
    return path.resolve(process.env.SKILL_GRAPH_LOG_DIR);
  }
  const monorepoLogs = path.join(WORKSPACE, 'agent-orchestration', 'logs');
  if (fs.existsSync(monorepoLogs)) return monorepoLogs;
  // Standalone: store logs relative to the user's workspace.
  return path.join(WORKSPACE, '.skill-graph', 'logs');
}

const LOG_DIR = resolveLogDir();

// ─── Named log file paths ────────────────────────────────────────────────────

/**
 * Full path to eval-history.jsonl.
 * A/B eval pass-rate data for skills evaluated via evaluate-skill.js.
 */
const EVAL_HISTORY_LOG = process.env.SKILL_GRAPH_EVAL_HISTORY
  ? path.resolve(process.env.SKILL_GRAPH_EVAL_HISTORY)
  : path.join(LOG_DIR, 'eval-history.jsonl');

/**
 * Full path to comprehension-history.jsonl.
 * Dual-run concept-delta data kept separate from A/B pass-rate data.
 */
const COMPREHENSION_HISTORY_LOG = process.env.SKILL_GRAPH_COMP_HISTORY
  ? path.resolve(process.env.SKILL_GRAPH_COMP_HISTORY)
  : path.join(LOG_DIR, 'comprehension-history.jsonl');

/**
 * Full path to application-history.jsonl.
 * Application-eval results (task-grader verdicts per skill).
 */
const APPLICATION_HISTORY_LOG = process.env.SKILL_GRAPH_APP_HISTORY
  ? path.resolve(process.env.SKILL_GRAPH_APP_HISTORY)
  : path.join(LOG_DIR, 'application-history.jsonl');

/**
 * Full path to skill-health-ledger.jsonl.
 * Per-skill upgrade-count, kept/discarded rate, score trend.
 */
const HEALTH_LEDGER_PATH = process.env.SKILL_GRAPH_HEALTH_LEDGER
  ? path.resolve(process.env.SKILL_GRAPH_HEALTH_LEDGER)
  : path.join(LOG_DIR, 'skill-health-ledger.jsonl');

// ─── Progress directory ──────────────────────────────────────────────────────

/**
 * Resolve the progress directory (batch-eval reports, skill-evolution artifacts).
 * Priority:
 *  1. SKILL_GRAPH_PROGRESS_DIR env var
 *  2. <workspace>/.opencode/progress  (monorepo layout)
 *  3. <workspace>/.skill-graph/progress  (standalone layout)
 */
function resolveProgressDir() {
  if (process.env.SKILL_GRAPH_PROGRESS_DIR) {
    return path.resolve(process.env.SKILL_GRAPH_PROGRESS_DIR);
  }
  const monorepoProgress = path.join(WORKSPACE, '.opencode', 'progress');
  if (fs.existsSync(monorepoProgress)) return monorepoProgress;
  return path.join(WORKSPACE, '.skill-graph', 'progress');
}

const PROGRESS_BASE_DIR = resolveProgressDir();

// ─── Receipt-path portability (SKI-356) ──────────────────────────────────────

// Monorepo-private location segments: a receipt-backing artifact under any of
// these lives in scratch/logs that are NOT shipped with the published public
// skill, so an external consumer of the public skills repo cannot resolve it.
const PRIVATE_RECEIPT_SEGMENTS = [
  'agent-orchestration/logs',
  '.opencode/progress',
  '.skill-graph/logs',
  '.skill-graph/progress',
  'skill-audit-loop/progress',
];

/**
 * Make a receipt-backing path portable for persistence into a (publishable)
 * skill sidecar: strip an absolute path down to a path relative to the workspace
 * root so a consumer never receives a leaked absolute home-dir location. A path
 * that escapes the workspace collapses to its basename (still no absolute leak).
 * Non-strings and already-relative paths pass through unchanged.
 */
function relativizeReceiptPath(p) {
  if (!p || typeof p !== 'string') return p;
  if (!path.isAbsolute(p)) return p;
  const rel = path.relative(WORKSPACE, p);
  return (!rel || rel.startsWith('..')) ? path.basename(p) : rel;
}

/**
 * Classify whether a receipt-backing artifact path is reachable from the PUBLIC
 * skills repo. Returns `private-monorepo` when the artifact lives in monorepo-only
 * scratch/logs (see {@link PRIVATE_RECEIPT_SEGMENTS}) or anywhere in the
 * `skill-graph/` tooling tree (the published skills repo is the `skills/` library,
 * not the tooling repo); `public` when it is co-located with a skill (e.g. a
 * `skills/<name>/eval-history/` artifact that ships with the skill); `unknown`
 * when there is no path.
 */
function receiptVisibilityForPath(p) {
  if (!p || typeof p !== 'string') return 'unknown';
  const norm = p.replace(/\\/g, '/');
  if (PRIVATE_RECEIPT_SEGMENTS.some(seg => norm.includes(`/${seg}/`) || norm.startsWith(`${seg}/`))) {
    return 'private-monorepo';
  }
  // Anywhere in the tooling repo (but NOT the published skills/ library) is private.
  if (/(^|\/)skill-graph\//.test(norm) && !/(^|\/)skills\//.test(norm)) {
    return 'private-monorepo';
  }
  return 'public';
}

module.exports = {
  LOG_DIR,
  EVAL_HISTORY_LOG,
  COMPREHENSION_HISTORY_LOG,
  APPLICATION_HISTORY_LOG,
  HEALTH_LEDGER_PATH,
  PROGRESS_BASE_DIR,
  WORKSPACE,
  PRIVATE_RECEIPT_SEGMENTS,
  relativizeReceiptPath,
  receiptVisibilityForPath,
};
