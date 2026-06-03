'use strict';

// ─── Public-content boundary fence (SH-6681) ──────────────────────────────────
//
// The private-content boundary is HARD: enrich/eval agents may read+write the PUBLIC
// skill-graph repo + the skills tree + the open web, and must NEVER touch private
// workspace data (Sales Hub / Printify / Shopify / customer / bank / personal data).
//
// Before this module the boundary was enforced only by (a) the enrich-pass PROMPT
// instruction and (b) the skill-audit-claim private-skill FILTER — neither of which
// stops a path-traversal (`cwd: <skill-graph>` does not prevent an agent or a bug from
// writing `../sales-hub/...`). The philosophy doc names the true OS-level fence (an
// isolated checkout containing only the public trees) as the gold standard.
//
// This module is the IN-PROCESS down payment toward it: a path-scope GUARD that makes
// the enrich/eval code REFUSE to resolve, read, or write any path outside the declared
// public roots. It is defense-in-depth — it catches a private path BEFORE we hand it
// to a CLI — and it is the primitive the future isolated-checkout builder will reuse to
// decide what belongs in the public sandbox. It does NOT yet sandbox the model process
// itself (an agent the CLI spawns could still traverse); that remains the tracked
// isolated-checkout follow-up. Do not describe this as a complete OS sandbox.
//
// See docs/audit-loop-enrich-philosophy.md § "The lockstep parity invariant" point 3,
// and memory skill-graph-private-content-boundary.

const path = require('path');

// Directory names that, if they appear as a path segment, mark PRIVATE workspace data
// even when nominally reachable from a public root via traversal. A belt to the
// public-roots suspenders: a path is rejected if it is outside the public roots OR if
// it crosses one of these segments.
const PRIVATE_SEGMENTS = new Set([
  'sales-hub', 'sales-channels', 'printify', 'shopify',
  'node_modules', '.git', '.env',
]);

/**
 * Normalize the set of public roots to absolute, trailing-separator-free paths.
 * @param {string[]} roots
 * @returns {string[]}
 */
function normalizeRoots(roots) {
  if (!Array.isArray(roots) || roots.length === 0) {
    throw new Error('public-content-fence: at least one public root is required');
  }
  return roots.filter(Boolean).map((r) => path.resolve(r));
}

/**
 * Is `targetPath` contained within one of the public roots (and not crossing a known
 * private segment)? Pure, no filesystem access — operates on resolved path strings.
 *
 * @param {string}   targetPath  The path to test (may be relative; resolved against process.cwd()).
 * @param {object}   opts
 * @param {string[]} opts.roots  Absolute (or resolvable) public roots — typically [skillGraphRoot, skillsRoot].
 * @returns {boolean}
 */
function isWithinPublicScope(targetPath, { roots } = {}) {
  if (!targetPath || typeof targetPath !== 'string') return false;
  const resolvedRoots = normalizeRoots(roots);
  const resolved = path.resolve(targetPath);

  // Reject any path crossing a private segment (e.g. .../sales-hub/...), regardless of root.
  const segments = resolved.split(path.sep).filter(Boolean);
  if (segments.some((s) => PRIVATE_SEGMENTS.has(s))) return false;

  // Accept iff the resolved path is the root itself or strictly under it. Compare with a
  // trailing separator so `/a/skill-graph-private` is NOT treated as under `/a/skill-graph`.
  return resolvedRoots.some((root) => {
    if (resolved === root) return true;
    return resolved.startsWith(root + path.sep);
  });
}

/**
 * Throw unless `targetPath` is within the public scope. Use at every seam that resolves
 * a path destined for a CLI cwd, an artifact write, or a read — so a private path is
 * refused IN PROCESS, before the shell-out, with a clear operator message.
 *
 * @param {string}   targetPath
 * @param {object}   opts                  { roots, label? }
 * @returns {string} the resolved path (for convenient chaining)
 */
function assertPublicScope(targetPath, { roots, label } = {}) {
  if (!isWithinPublicScope(targetPath, { roots })) {
    const where = label ? ` (${label})` : '';
    throw new Error(
      `public-content-fence: refused a path outside the public scope${where}: ${targetPath}. `
      + 'The enrich/eval private-content boundary is HARD — only the public skill-graph repo + '
      + 'skills tree are in scope. See docs/audit-loop-enrich-philosophy.md.',
    );
  }
  return path.resolve(targetPath);
}

/**
 * The default public roots for an enrich/eval run: the skill-graph repo + the canonical
 * skills tree (sibling of the workspace). The skills root is resolved relative to the
 * workspace when not given. Web research is allowed by policy and is not a filesystem
 * path, so it is out of scope for this guard.
 *
 * @param {object} opts  { skillGraphRoot, skillsRoot?, workspaceRoot? }
 * @returns {string[]}
 */
function defaultPublicRoots({ skillGraphRoot, skillsRoot, workspaceRoot } = {}) {
  if (!skillGraphRoot) throw new Error('defaultPublicRoots: skillGraphRoot is required');
  const sg = path.resolve(skillGraphRoot);
  const ws = workspaceRoot ? path.resolve(workspaceRoot) : path.resolve(sg, '..');
  const skills = skillsRoot ? path.resolve(skillsRoot) : path.join(ws, 'skills');
  return [sg, skills];
}

module.exports = {
  PRIVATE_SEGMENTS,
  normalizeRoots,
  isWithinPublicScope,
  assertPublicScope,
  defaultPublicRoots,
};
