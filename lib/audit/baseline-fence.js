'use strict';

// ─── Baseline-arm answer-key fence (eval validity) ────────────────────────────
//
// Every per-direction eval runs TWO arms over the same neutral prompt: a BASELINE
// arm (no skill) and a WITH-SKILL arm (the candidate skill injected in-prompt as
// `<skill>…</skill>`). The lift between them is the signal. That signal is only
// honest if the BASELINE arm cannot READ the candidate `SKILL.md` from disk —
// otherwise a tools-ON baseline agent can filesystem-read the very answer key it
// is supposed to be blind to, collapsing the measured lift toward zero (a skill
// that genuinely helps looks useless because the baseline already "saw" it).
//
// The fix is NOT to turn tools off for the baseline arm — research IS the curation
// mechanism and both arms must keep equal tool access (see eval-execution-profile.js
// § "WHY tools are ON"). The fix is narrower: keep research tools ON, but ensure the
// candidate `SKILL.md` is not reachable inside the baseline arm's working directory.
// Parity is preserved on RESEARCH (web + repo), removed only on the ANSWER KEY.
//
// For the two-frontier panel path this already holds by construction — the execution
// profile pins cwd to the skill-graph repo root, and the candidate skill lives in the
// sibling skills tree / a /tmp curated copy, never under that root. This module makes
// that previously-implicit safety property EXPLICIT and ENFORCED, and it catches the
// genuinely-leaky path: a direct `evaluate-skill` run whose workspace resolves to a
// parent that CONTAINS the skills tree (e.g. `~/Development` ⊃ `skills/`) while tools
// are ON. There, the candidate is reachable and the run must fail loudly rather than
// silently produce an inflated-baseline / deflated-lift verdict.

const path = require('path');

/**
 * The candidate skill file the baseline arm must be blind to.
 * @param {string} skillDir  The (canonical or temp-curated) skill directory.
 * @returns {string} Absolute path to `<skillDir>/SKILL.md`.
 */
function candidateSkillPath(skillDir) {
  return path.resolve(skillDir, 'SKILL.md');
}

/**
 * Is the candidate `SKILL.md` located inside the given workspace subtree?
 *
 * Uses a normalized `path.relative` containment test (the candidate is "inside"
 * iff the relative path neither escapes with `..` nor is absolute). A candidate
 * sitting in a sibling tree or a /tmp dir is therefore NOT inside a skill-graph-root
 * workspace, which is exactly the property the panel path relies on.
 *
 * @param {string} workspace  The arm's working directory (CLI cwd).
 * @param {string} skillDir   The candidate skill directory.
 * @returns {boolean}
 */
function candidateInsideWorkspace(workspace, skillDir) {
  if (!workspace || !skillDir) return false;
  const root = path.resolve(workspace);
  const candidate = candidateSkillPath(skillDir);
  const rel = path.relative(root, candidate);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/**
 * Assert the baseline arm cannot read the candidate skill from its working dir.
 *
 * Only ENFORCED when the baseline arm runs with tools ON — a tools-OFF baseline
 * has no filesystem access, so the fence is vacuously satisfied and we must not
 * break the legacy single-direction (tools-OFF) default. When tools are ON, a
 * candidate reachable inside `baselineWorkspace` is a hard error: the eval would
 * measure "who got to peek," not the skill's lift.
 *
 * @param {object}  opts
 * @param {string}  opts.baselineWorkspace  The baseline arm's working directory.
 * @param {string}  opts.skillDir           The candidate skill directory.
 * @param {string} [opts.skillName]         For the error message.
 * @param {boolean} [opts.allowTools=false] Whether the baseline arm has tools.
 * @throws {Error} when tools are on and the candidate SKILL.md is reachable.
 */
function assertBaselineSkillAbsent({ baselineWorkspace, skillDir, skillName, allowTools = false }) {
  if (!allowTools) return; // tools-OFF baseline cannot read the filesystem — fence not needed.
  if (!baselineWorkspace || !skillDir) return;
  if (candidateInsideWorkspace(baselineWorkspace, skillDir)) {
    const who = skillName ? ` for "${skillName}"` : '';
    throw new Error(
      `Baseline eval-arm fence violated${who}: the candidate SKILL.md (${candidateSkillPath(skillDir)}) `
      + `is reachable inside the baseline working dir (${path.resolve(baselineWorkspace)}). `
      + 'A tools-ON baseline agent could read the answer key, collapsing the measured lift. '
      + 'Point the baseline arm at a skill-absent working dir (keep research tools ON) before dispatching.',
    );
  }
}

module.exports = {
  candidateSkillPath,
  candidateInsideWorkspace,
  assertBaselineSkillAbsent,
};
