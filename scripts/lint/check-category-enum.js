#!/usr/bin/env node
/**
 * Category enum check for SKILL.md files (Check 13).
 *
 * The Skill Graph policy is that `category` functions as a **browse facet**,
 * not ontology truth, and must take exactly one of six canonical values.
 *
 * Post-Phase-1 (v5 schema bump, skill-graph commit `f489641`, 2026-05-16):
 * the canonical enum is closed at BOTH the schema level (`schemas/skill.schema.json`
 * `category.enum`) AND this lint level. This file is now redundant-but-correct:
 * the schema will reject invalid values first, and this lint provides a
 * second-layer guarantee with a more descriptive error message and the
 * authoritative definitions inline.
 *
 * Both sources of truth must stay in sync. A future protocol revision that
 * adds (e.g.) a 7th category must update three places in the same commit:
 *   1. `schemas/skill.schema.json` `category.enum`
 *   2. `CATEGORY_ENUM` below
 *   3. `docs/skill-metadata-protocol.md` § Category
 *
 * @module lint/check-category-enum
 */

'use strict';

/**
 * Canonical category enum — closed set as of v5 (2026-05-16).
 *
 * Mirror of `schemas/skill.schema.json` `category.enum`. Update both in the
 * same commit when adding/removing values.
 *
 * Framed as a BROWSE FACET, not ontology truth. Cross-cutting truth
 * (a skill that is both engineering and quality, for example) lives in
 * `relations.related`, not in multiple category memberships.
 */
const CATEGORY_ENUM = Object.freeze([
  'foundations', // Epistemics, grounding, verification, context engineering, reasoning
  'engineering', // Building software systems
  'design',      // Visual, interaction, IA, content, motion
  'quality',     // Cross-cutting non-functional properties (a11y, perf, security, type-safety, testing)
  'agent',       // Agent-specific concepts (tool design, prompt design, agent state)
  'product',     // Prioritization, scope, MVP, PRDs, journeys
]);

/**
 * Run the category-enum check on one SKILL.md file.
 *
 * @param {object} opts
 * @param {string}  opts.filePath    - Path to the file (used in messages only).
 * @param {string}  opts.sourceText  - Full file content.
 * @param {object}  opts.fm          - Parsed frontmatter object.
 *
 * @returns {{
 *   errors:   Array<{message: string, line: number, column: number, help: string}>,
 *   warnings: Array<{message: string, line: number, column: number, help: string}>
 * }}
 */
function checkCategoryEnum(opts) {
  const { sourceText, fm } = opts;
  const errors = [];
  const warnings = [];

  if (!fm) return { errors, warnings };
  if (typeof fm.category !== 'string') return { errors, warnings };

  if (!CATEGORY_ENUM.includes(fm.category)) {
    const lineMatch = sourceText.match(/^category\s*:.*$/m);
    const lineNumber = lineMatch
      ? sourceText.substring(0, sourceText.indexOf(lineMatch[0])).split('\n').length
      : 1;

    errors.push({
      message: `category "${fm.category}" is not in the canonical enum: ${CATEGORY_ENUM.join(', ')}`,
      line: lineNumber,
      column: 1,
      help: `Pick one of: ${CATEGORY_ENUM.join(', ')}. If the skill is genuinely cross-cutting, primary-category it under its strongest fit and use relations.related for the others. See docs/skill-metadata-protocol.md § Category and docs/plans/skill-taxonomy-v5-and-gap-fill.md.`,
    });
  }

  return { errors, warnings };
}

module.exports = { checkCategoryEnum, CATEGORY_ENUM };
