'use strict';

// Conservative synthesis of a two-frontier BIDIRECTIONAL eval (Opus 4.8 ⇄ GPT-5.5).
//
// Directions are named by their generator: "Claude" = Claude (opus) generates →
// Codex (gpt) grades; "Codex" = Codex (gpt) generates → Claude (opus) grades.
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
 * Normalize a verdict to a KNOWN label before it can become the synthesized verdict.
 *
 * An unknown / invalid verdict (a grader returned a string that is not in the rank
 * table, e.g. a malformed or hallucinated label like "WAT") must NEVER surface AS the
 * synthesized verdict. Under the conservative rule it would otherwise win — an unknown
 * ranks at the floor (rankOf === -1), so `min(rankA, rankB)` would pick it and emit the
 * unrecognised label as if it were a real verdict. That is a correctness hole: a
 * synthesized verdict must always be a value downstream consumers (the schema,
 * keep-or-revert, the receipt) can interpret. We resolve it to UNVERIFIED — the
 * no-signal floor present in BOTH rank tables — so an invalid direction caps the whole
 * reconciliation at "no graded signal" rather than leaking the garbage label. The
 * caller records WHICH input was normalized in the receipt `note` for auditability.
 *
 * @param {object} table  The mode's rank table (APPLICATION_RANK | COMPREHENSION_RANK).
 * @param {string} verdict
 * @returns {string} the verdict if known, else 'UNVERIFIED'.
 */
function normalizeKnown(table, verdict) {
  return Object.prototype.hasOwnProperty.call(table, verdict) ? verdict : 'UNVERIFIED';
}

/**
 * Reconcile two direction results into one synthesized verdict, conservatively.
 *
 * @param {object} dirClaude  { verdict, model, ...receipt } for the Claude direction (Claude/opus gen → Codex/gpt grade).
 * @param {object} dirCodex   { verdict, model, ...receipt } for the Codex direction (Codex/gpt gen → Claude/opus grade).
 * @param {object} opts
 * @param {'application'|'comprehension'} opts.mode
 * @returns {{ verdict: string, agreement: boolean, reconciliation: string,
 *            direction_claude: object, direction_codex: object, note: (string|undefined) }}
 */
function reconcile(dirClaude, dirCodex, { mode } = {}) {
  const table = rankTable(mode);
  const vClaude = dirClaude && dirClaude.verdict;
  const vCodex = dirCodex && dirCodex.verdict;

  const base = {
    reconciliation: 'conservative',
    direction_claude: dirClaude || null,
    direction_codex: dirCodex || null,
  };

  // Procedural carve-out (comprehension): a SKIPPED_BASELINE_HIGH / NA direction
  // carries no graded signal; defer to the other direction's graded verdict.
  if (mode === 'comprehension') {
    const claudeProc = PROCEDURAL_COMPREHENSION.has(vClaude);
    const codexProc = PROCEDURAL_COMPREHENSION.has(vCodex);
    if (claudeProc && codexProc) {
      // Both procedural — surface the (matching or Claude's) procedural value, no graded signal either way.
      return { ...base, verdict: vClaude === vCodex ? vClaude : 'SKIPPED_BASELINE_HIGH', agreement: vClaude === vCodex, note: 'both directions procedural (no graded signal)' };
    }
    if (claudeProc) return { ...base, verdict: normalizeKnown(table, vCodex), agreement: false, note: `Claude direction procedural (${vClaude}); deferring to Codex direction graded verdict` };
    if (codexProc) return { ...base, verdict: normalizeKnown(table, vClaude), agreement: false, note: `Codex direction procedural (${vCodex}); deferring to Claude direction graded verdict` };
  }

  // Normalize BEFORE ranking so an unknown/invalid verdict can never become the
  // synthesized verdict (it resolves to UNVERIFIED, the no-signal floor). Record which
  // input was normalized for audit.
  const nClaude = normalizeKnown(table, vClaude);
  const nCodex = normalizeKnown(table, vCodex);
  const normalizedNote = [];
  if (nClaude !== vClaude) normalizedNote.push(`claude="${vClaude}"`);
  if (nCodex !== vCodex) normalizedNote.push(`codex="${vCodex}"`);

  const rClaude = rankOf(table, nClaude);
  const rCodex = rankOf(table, nCodex);
  // Conservative: the lower-ranked (more skeptical) verdict wins.
  const verdict = rClaude <= rCodex ? nClaude : nCodex;
  // Agreement is true only when the two directions produced the SAME valid verdict;
  // a normalized (invalid) input never counts as agreement even if both floored to
  // UNVERIFIED.
  const agreement = nClaude === nCodex && normalizedNote.length === 0;
  const note = normalizedNote.length
    ? `unknown verdict(s) normalized to UNVERIFIED (never surfaced as the synthesized verdict): ${normalizedNote.join(', ')}`
    : undefined;
  return { ...base, verdict, agreement, note };
}

module.exports = {
  APPLICATION_RANK,
  COMPREHENSION_RANK,
  PROCEDURAL_COMPREHENSION,
  rankOf,
  normalizeKnown,
  reconcile,
};
