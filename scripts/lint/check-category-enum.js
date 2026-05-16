#!/usr/bin/env node
/**
 * Category enum check for SKILL.md files (Check 13).
 *
 * The schema allows `category` to be any string for backward compatibility,
 * but the Skill Graph policy (as of 2026-05-15) is that the field functions
 * as a **browse facet**, not ontology truth, and must take exactly one of
 * six canonical values.
 *
 * Why lint, not schema:
 *   - Schema is the SHAPE contract; lint is the POLICY contract.
 *   - Closing the schema enum requires a v5 schema bump that cascades through
 *     manifest schemas, generators, and downstream consumers. The lint check
 *     achieves the same enforcement guarantee with no version churn.
 *   - Future protocol revisions may legitimately add a 7th category (e.g.
 *     `research`, `ops`); revising a lint constant is cheaper than a schema
 *     bump.
 *
 * The six canonical values and their definitions live in
 * docs/skill-metadata-protocol.md § Category. Any deviation here must update
 * that doc in the same commit.
 *
 * @module lint/check-category-enum
 */

'use strict';

/**
 * Canonical category enum — closed set as of 2026-05-15.
 *
 * Note: framed as a BROWSE FACET, not ontology truth. Cross-cutting truth
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
