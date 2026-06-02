'use strict';

// Cross-family certification + self-grading guard — shared by BOTH eval gates
// (application-eval.js gate 9 AND evaluate-skill.js comprehension gate 8). This
// was extracted from application-eval.js so the comprehension gate can reuse the
// exact same family resolution and tier logic for the two-frontier bidirectional
// design (Opus 4.8 ⇄ GPT-5.5). See docs/verdict-semantics.md and
// skill-graph/AGENTS.md § "Skill Audit Loop Model Policy".
//
// APPLICABLE / PASS — the only verdicts that *certify* a skill is useful — are
// reachable ONLY from a 'certifying' run: an independent, CROSS-FAMILY dual-run
// grader (e.g. Opus generates → GPT-5.5 grades). A judge grading its OWN model
// family inflates scores +10–25pp (Self-Preference Bias, arXiv 2410.21819;
// arXiv 2504.03846), so a same-family or undeclared run is structurally only
// PROVISIONAL.

const CERTIFICATION_TIERS = new Set(['certifying', 'provisional']);

// Vendor-family map for the cross-family certifying check. Aliases are matched
// case-insensitively by family-name substring first, then by token pattern.
const MODEL_FAMILY_PATTERNS = [
  { family: 'anthropic', test: (s) => /\b(opus|sonnet|haiku|claude)\b/.test(s) },
  { family: 'openai', test: (s) => /\b(gpt|o1|o3|o4|codex|chatgpt|openai)\b/.test(s) },
  { family: 'google', test: (s) => /\b(gemini|palm|bard|gemma|google)\b/.test(s) },
  { family: 'meta', test: (s) => /\b(llama|meta)\b/.test(s) },
  { family: 'minimax', test: (s) => /\bminimax\b/.test(s) },
  { family: 'nvidia', test: (s) => /\bnemotron\b/.test(s) },
];

/**
 * Resolve a declared model/family alias to its vendor family, or null when the
 * alias is empty or unrecognised. A bare family name (e.g. 'anthropic') maps to
 * itself. Used only to decide cross-family eligibility — never to select or
 * invoke a model.
 *
 * @param {string} alias  Model name or family (e.g. 'opus', 'gpt-5.4', 'codex-current', 'anthropic').
 * @returns {string|null} The vendor family, or null if undeclared/unknown.
 */
function modelFamily(alias) {
  if (!alias || typeof alias !== 'string') return null;
  const s = ` ${alias.toLowerCase().trim()} `;
  for (const { family } of MODEL_FAMILY_PATTERNS) {
    if (s.includes(` ${family} `)) return family;
  }
  for (const { family, test } of MODEL_FAMILY_PATTERNS) {
    if (test(s)) return family;
  }
  return null;
}

/**
 * Decide the certification tier for a run from generator/grader model identities.
 *
 * A run earns the 'certifying' tier (the only tier from which APPLICABLE/PASS can
 * be stamped) ONLY when a certifying run is asserted AND both families are known
 * AND different. Every other shape — no assertion, undeclared families, or
 * same-family — is 'provisional'. Default-to-provisional is the safe direction.
 *
 * @param {object} opts
 * @param {boolean} [opts.certifying]      Assert a certifying (cross-family dual-run) configuration.
 * @param {string}  [opts.generatorFamily] Family/model that produced the responses.
 * @param {string}  [opts.graderFamily]    Family/model that graded the responses.
 * @returns {{ tier: string, reason: string, generator_family: (string|null), grader_family: (string|null) }}
 */
function resolveCertificationTier({ certifying, generatorFamily, graderFamily } = {}) {
  const genFam = modelFamily(generatorFamily);
  const gradeFam = modelFamily(graderFamily);
  const base = { generator_family: genFam, grader_family: gradeFam };
  if (!certifying) {
    return { tier: 'provisional', reason: 'no certifying assertion (default single-model / unattested tier)', ...base };
  }
  if (!genFam || !gradeFam) {
    return {
      tier: 'provisional',
      reason: `certifying asserted but family undeclared (generator=${genFam || 'unknown'}, grader=${gradeFam || 'unknown'}) — cannot confirm cross-family`,
      ...base,
    };
  }
  if (genFam === gradeFam) {
    return {
      tier: 'provisional',
      reason: `same-family judge (${genFam}) — self-preference inflation risk caps this at provisional`,
      ...base,
    };
  }
  return { tier: 'certifying', reason: `cross-family dual-run (${genFam} → ${gradeFam})`, ...base };
}

/**
 * True when the two model identities are from genuinely different, known vendor
 * families (the precondition for a certifying cross-family grader direction).
 *
 * @param {string} generatorModel  Generator model alias/family.
 * @param {string} graderModel     Grader model alias/family.
 * @returns {boolean}
 */
function isCrossFamily(generatorModel, graderModel) {
  const a = modelFamily(generatorModel);
  const b = modelFamily(graderModel);
  return Boolean(a && b && a !== b);
}

module.exports = {
  CERTIFICATION_TIERS,
  MODEL_FAMILY_PATTERNS,
  modelFamily,
  resolveCertificationTier,
  isCrossFamily,
};
