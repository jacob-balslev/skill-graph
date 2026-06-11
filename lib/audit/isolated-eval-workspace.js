'use strict';

// Isolated, private-data-safe eval workspace for the SINGLE-DIRECTION CLI evals.
//
// WHY this exists (2026-06-11, owner directive): the eval baseline should run with
// the agent's normal ability — weights + REPO grounding — but WITHOUT websearch, so
// it reflects a realistic deployed agent rather than an unrealistically strong
// "search-anything" baseline. Turning repo tools ON for the baseline is unsafe
// naively, because the single-direction CLI resolves its workspace to the WHOLE
// private Development tree (sales-hub / Printify / customer data) and the candidate
// SKILL.md sits inside it — a tools-ON agent there would (a) breach the hard
// private-content boundary and (b) trip the answer-key fence.
//
// The fix (reuses the panel's `copySkillGraph` primitive — see
// public-workspace-fallback.js): copy ONLY the PUBLIC skill-graph repo into an OS
// tmp dir and run BOTH eval arms there with repo/exec tools ON and web OFF.
//   - PRIVACY: `../` from `<tmp>/skill-graph` reaches `os.tmpdir()`, never the
//     private Development workspace. No private data is on the agent's path.
//   - ANSWER-KEY FENCE: the candidate SKILL.md lives in the SIBLING `skills/` repo,
//     which is NOT copied here — so it is definitionally absent from the baseline's
//     (and the with-skill arm's) filesystem. The with-skill arm receives the skill
//     IN-PROMPT (`<skill>…</skill>`), the intended single difference between arms.
//
// This is the disclosure-minimizing fallback pattern (a physical public-only copy),
// not an OS kernel fence by itself; pair it with the in-process public-content guard.
// The panel/bidirectional certifying path has its own (stronger) isolation and does
// NOT use this — it supplies its own executionProfile + baselineWorkspace.

const fs = require('fs');
const os = require('os');
const path = require('path');

const { copySkillGraph } = require('./public-workspace-fallback');
const { buildExecutionProfile, RESEARCH_REPO_ONLY } = require('./eval-execution-profile');

/**
 * Prepare an isolated, candidate-absent eval workspace (public skill-graph copy in
 * an OS tmp dir) and the matching repo-only (web-OFF) execution profile.
 *
 * @param {object}   opts
 * @param {string}   opts.skillGraphRoot  Absolute path to the canonical skill-graph repo.
 * @param {string}  [opts.research]        Research allowance (default RESEARCH_REPO_ONLY — web OFF).
 * @param {object}  [opts.fsImpl]          fs override (tests).
 * @returns {{ active: true, root: string, cwd: string, executionProfile: object,
 *            baselineWorkspace: string, cleanup: function }}
 */
function prepareIsolatedEvalWorkspace({ skillGraphRoot, research, fsImpl = fs } = {}) {
  if (!skillGraphRoot || typeof skillGraphRoot !== 'string') {
    throw new Error('prepareIsolatedEvalWorkspace: skillGraphRoot (the canonical skill-graph repo path) is required.');
  }
  const root = fsImpl.mkdtempSync(path.join(os.tmpdir(), 'skill-eval-ws-'));
  try { fsImpl.chmodSync(root, 0o700); } catch (_) { /* best-effort */ }

  const publicSkillGraphRoot = path.join(root, 'skill-graph');
  copySkillGraph(path.resolve(skillGraphRoot), publicSkillGraphRoot, fsImpl);

  return {
    active: true,
    root,
    cwd: publicSkillGraphRoot,
    // research defaults to repo-only (web OFF) — the no-web baseline. tools stay full.
    executionProfile: buildExecutionProfile({ cwd: publicSkillGraphRoot, research: research || RESEARCH_REPO_ONLY }),
    // Both arms run here. The candidate is absent (skills corpus not copied), so this
    // doubles as the skill-absent baseline working dir the answer-key fence requires.
    baselineWorkspace: publicSkillGraphRoot,
    cleanup: () => {
      try { fsImpl.rmSync(root, { recursive: true, force: true }); } catch (_) { /* best-effort */ }
    },
  };
}

module.exports = { prepareIsolatedEvalWorkspace };
