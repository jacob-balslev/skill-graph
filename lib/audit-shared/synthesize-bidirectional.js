'use strict';

// Conservative synthesis of a two-frontier BIDIRECTIONAL eval (Opus 4.8 ⇄ GPT-5.5).
//
// Direction A: Opus generates → GPT-5.5 grades.   Direction B: GPT-5.5 generates → Opus grades.
// Each direction is an independent CROSS-FAMILY certifying run. This module
// reconciles the two into ONE verdict using the CONSERVATIVE rule (user decision
// 2026-06-02): the lower / more-skeptical verdict wins. APPLICABLE / PASS is
// therefore reachable ONLY when BOTH directions independently reach it — i.e. the
// skill demonstrably helps BOTH frontier models the user actually runs. A
// disagreement caps the result below the certifying verdict and records
// `agreement: false`.
//
// Ranks follow the confidence ordering in docs/verdict-semantics.md
// (PASS/APPLICABLE > PROVISIONAL > UNVERIFIED), with the negative grader verdicts
// ranked below PROVISIONAL (a real negative signal is worse than "not yet
// confirmed"). Procedural non-signals (SKIPPED_BASELINE_HIGH, NA) are handled
// explicitly: they are not graded outcomes, so they neither certify nor drag a
// graded direction down — see reconcile().

// Higher rank = stronger / more-certified. min(rankA, rankB) = conservative.
const APPLICATION_RANK = {
  APPLICABLE: 6,
  PROVISIONAL: 5,
  MIXED: 4,
  REDUNDANT: 3,
  FALSE_POSITIVE: 2,
  HARMFUL: 1,
  UNVERIFIED: 0,
};

const COMPREHENSION_RANK = {
  PASS: 6,
  PROVISIONAL: 5,
  REDUNDANT: 3,
  SHALLOW: 2,
  UNVERIFIED: 0,
};

// Procedural / non-graded verdicts: not a quality signal, so excluded from the
// conservative min. If a direction returns one of these, the OTHER direction's
// graded verdict stands (with agreement:false and a recorded note), because there
// is no graded signal to reconcile against.
const PROCEDURAL_COMPREHENSION = new Set(['SKIPPED_BASELINE_HIGH', 'NA']);

function rankTable(mode) {
  if (mode === 'application') return APPLICATION_RANK;
  if (mode === 'comprehension') return COMPREHENSION_RANK;
  throw new Error(`synthesize-bidirectional: unknown mode '${mode}' (expected 'application' | 'comprehension')`);
}

function rankOf(table, verdict) {
  if (Object.prototype.hasOwnProperty.call(table, verdict)) return table[verdict];
  // Unknown verdict is treated as the floor — never let an unrecognised label
  // silently certify a skill.
  return -1;
}

/**
 * Reconcile two direction results into one synthesized verdict, conservatively.
 *
 * @param {object} dirA   { verdict, model, ...receipt } for direction A (Opus gen → GPT grade).
 * @param {object} dirB   { verdict, model, ...receipt } for direction B (GPT gen → Opus grade).
 * @param {object} opts
 * @param {'application'|'comprehension'} opts.mode
 * @returns {{ verdict: string, agreement: boolean, reconciliation: string,
 *            direction_a: object, direction_b: object, note: (string|undefined) }}
 */
function reconcile(dirA, dirB, { mode } = {}) {
  const table = rankTable(mode);
  const vA = dirA && dirA.verdict;
  const vB = dirB && dirB.verdict;

  const base = {
    reconciliation: 'conservative',
    direction_a: dirA || null,
    direction_b: dirB || null,
  };

  // Procedural carve-out (comprehension): a SKIPPED_BASELINE_HIGH / NA direction
  // carries no graded signal; defer to the other direction's graded verdict.
  if (mode === 'comprehension') {
    const aProc = PROCEDURAL_COMPREHENSION.has(vA);
    const bProc = PROCEDURAL_COMPREHENSION.has(vB);
    if (aProc && bProc) {
      // Both procedural — surface the (matching or A's) procedural value, no graded signal either way.
      return { ...base, verdict: vA === vB ? vA : 'SKIPPED_BASELINE_HIGH', agreement: vA === vB, note: 'both directions procedural (no graded signal)' };
    }
    if (aProc) return { ...base, verdict: vB, agreement: false, note: `direction A procedural (${vA}); deferring to direction B graded verdict` };
    if (bProc) return { ...base, verdict: vA, agreement: false, note: `direction B procedural (${vB}); deferring to direction A graded verdict` };
  }

  const rA = rankOf(table, vA);
  const rB = rankOf(table, vB);
  // Conservative: the lower-ranked (more skeptical) verdict wins.
  const verdict = rA <= rB ? vA : vB;
  const agreement = vA === vB;
  return { ...base, verdict, agreement };
}

module.exports = {
  APPLICATION_RANK,
  COMPREHENSION_RANK,
  PROCEDURAL_COMPREHENSION,
  rankOf,
  reconcile,
};
