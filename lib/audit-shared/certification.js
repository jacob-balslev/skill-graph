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
 * @param {string} alias  Model name or family (e.g. 'opus', 'gpt-5.4', 'gpt-5.5', 'anthropic').
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

// ─── Top-tier grader enforcement (SH-6626) ─────────────────────────────────────
//
// A QUALITY JUDGE (comprehension/application grader, audit verdict, eval scoring)
// must run on the strongest model — never the lesser tiers named by
// ~/Development/.claude/rules/no-lesser-models-for-quality.md: Haiku, Sonnet,
// Gemini Flash, MiniMax, Nemotron. The grader DEFAULTS already resolve to Opus, but
// the COMPREHENSION_GRADER_MODEL / APPLICATION_GRADER_MODEL env OVERRIDES were
// returned unvalidated — so `COMPREHENSION_GRADER_MODEL=haiku` would silently grade
// quality with Haiku (the exact class of the haiku-4-5-default incident behind that
// rule). These guards make the override fail CLOSED. This is the GRADER allowlist
// only: a frontier GENERATOR (the measured agent) is explicitly NOT covered — that
// rule governs the judge, and a frontier generator is not a lesser model.
//
// Note: plain `gemini` (Gemini Pro) is NOT denied — the rule names "Gemini Flash",
// not Gemini Pro. Only the `flash` tier is matched.
const LESSER_QUALITY_GRADER_PATTERNS = [
  /\bsonnet\b/, /\bhaiku\b/, /\bflash\b/, /\bminimax\b/, /\bnemotron\b/,
];

/**
 * Is `model` one of the lesser tiers that may never JUDGE quality?
 * @param {string} model  a model alias or id (e.g. 'haiku', 'claude-haiku-4-5', 'gemini-3-flash-preview')
 * @returns {boolean}
 */
function isLesserQualityGraderModel(model) {
  if (!model || typeof model !== 'string') return false;
  const m = model.trim().toLowerCase();
  return LESSER_QUALITY_GRADER_PATTERNS.some((re) => re.test(m));
}

/**
 * Fail CLOSED on a lesser-tier grader model. Returns the model unchanged when it is an
 * acceptable top-tier judge; throws otherwise. Use to validate a grader-model env
 * OVERRIDE before it reaches a grading call.
 * @param {string} model
 * @param {object} [opts]
 * @param {string} [opts.source='grader model']  label for the error (e.g. the env-var name)
 * @returns {string} the validated model
 */
function assertTopTierGraderModel(model, { source = 'grader model' } = {}) {
  if (isLesserQualityGraderModel(model)) {
    throw new Error(
      `${source}: "${model}" is a lesser-tier model and may not JUDGE quality. `
      + 'Per no-lesser-models-for-quality, grading / eval scoring / audit verdicts use the '
      + 'strongest model (opus, or gpt-5.5/gpt where a contract names it) — never '
      + 'Haiku, Sonnet, Gemini Flash, MiniMax, or Nemotron. Set the override to a top-tier '
      + 'judge, or unset it to use the strong default.',
    );
  }
  return model;
}

module.exports = {
  CERTIFICATION_TIERS,
  MODEL_FAMILY_PATTERNS,
  modelFamily,
  resolveCertificationTier,
  isCrossFamily,
  LESSER_QUALITY_GRADER_PATTERNS,
  isLesserQualityGraderModel,
  assertTopTierGraderModel,
};
