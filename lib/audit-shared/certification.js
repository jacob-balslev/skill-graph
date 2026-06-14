'use strict';

// Certification + self-grading guard — shared by BOTH eval gates
// (application-eval.js gate 9 AND evaluate-skill.js comprehension gate 8). This
// was extracted from application-eval.js so the comprehension gate can reuse the
// exact same family resolution and tier logic for the representative-generator +
// frontier-judge design. See docs/verdict-semantics.md and
// skill-graph/AGENTS.md § "Skill Audit Loop Model Policy".
//
// APPLICABLE / PASS — the only verdicts that *certify* a skill is useful — are
// reachable ONLY from a 'certifying' run. The normal certifying path keeps the
// measured generator fixed as `representative-generator` and requires both
// frontier judges to agree. A judge grading its OWN model family inflates scores
// +10–25pp (Self-Preference Bias, arXiv 2410.21819; arXiv 2504.03846), so a
// same-family or undeclared single-perspective run is structurally only PROVISIONAL.

const CERTIFICATION_TIERS = new Set(['certifying', 'provisional']);
const REPRESENTATIVE_GENERATOR_FAMILY = 'representative';
const REPRESENTATIVE_GENERATOR_ALIASES = new Set([
  'representative',
  'representative-generator',
  'deployment-representative',
]);

// Vendor-family map for the certification check. Aliases are matched
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

function isRepresentativeGeneratorFamily(alias) {
  if (!alias || typeof alias !== 'string') return false;
  return REPRESENTATIVE_GENERATOR_ALIASES.has(alias.toLowerCase().trim());
}

/**
 * Decide the certification tier for a run from generator/grader model identities.
 *
 * A run earns the 'certifying' tier (the only tier from which APPLICABLE/PASS can
 * be stamped) only when a certifying run is asserted and the identities satisfy
 * the current certification contract: either representative-generator measured
 * by a top-tier frontier judge, or a legacy known cross-family generator/judge
 * pair. Every other shape — no assertion, undeclared families, lesser grader, or
 * same-family legacy pair — is 'provisional'. Default-to-provisional is safe.
 *
 * @param {object} opts
 * @param {boolean} [opts.certifying]      Assert a certifying configuration.
 * @param {string}  [opts.generatorFamily] Family/model that produced the responses.
 * @param {string}  [opts.graderFamily]    Family/model that graded the responses.
 * @returns {{ tier: string, reason: string, generator_family: (string|null), grader_family: (string|null) }}
 */
function resolveCertificationTier({ certifying, generatorFamily, graderFamily } = {}) {
  const representativeGenerator = isRepresentativeGeneratorFamily(generatorFamily);
  const genFam = modelFamily(generatorFamily);
  const gradeFam = modelFamily(graderFamily);
  const base = {
    generator_family: representativeGenerator ? REPRESENTATIVE_GENERATOR_FAMILY : genFam,
    grader_family: gradeFam,
  };
  if (!certifying) {
    return { tier: 'provisional', reason: 'no certifying assertion (default single-model / unattested tier)', ...base };
  }
  if (representativeGenerator) {
    if (!gradeFam) {
      return {
        tier: 'provisional',
        reason: `certifying asserted for representative generator but grader family is undeclared (grader=${gradeFam || 'unknown'})`,
        ...base,
      };
    }
    if (isLesserQualityGraderModel(graderFamily)) {
      return {
        tier: 'provisional',
        reason: `representative generator requires a top-tier frontier judge; "${graderFamily}" is a lesser-tier grader`,
        ...base,
      };
    }
    return {
      tier: 'certifying',
      reason: `representative generator judged by ${gradeFam} frontier grader`,
      ...base,
    };
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
  return { tier: 'certifying', reason: `legacy cross-family run (${genFam} → ${gradeFam})`, ...base };
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
// rule governs the judge, and a representative generator is measurement design,
// not lesser-model quality judging.
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
  REPRESENTATIVE_GENERATOR_FAMILY,
  REPRESENTATIVE_GENERATOR_ALIASES,
  MODEL_FAMILY_PATTERNS,
  modelFamily,
  isRepresentativeGeneratorFamily,
  resolveCertificationTier,
  isCrossFamily,
  LESSER_QUALITY_GRADER_PATTERNS,
  isLesserQualityGraderModel,
  assertTopTierGraderModel,
};
