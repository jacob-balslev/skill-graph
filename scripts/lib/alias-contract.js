#!/usr/bin/env node
/**
 * Preferred/legacy alias parity checks for Skill Graph frontmatter.
 *
 * The manifest generator supports several transition-period aliases. When both
 * spellings are present, they must carry the same value; otherwise downstream
 * consumers cannot know which spelling is authoritative.
 */

'use strict';

// v9 (2026-05-27 per ADR-0019): the `grounding.domain_object` <-> `grounding.subject`
// alias pair was removed. The single canonical name is now `grounding.subject_matter`.
// Other v3.1 alias pairs are preserved.
const ALIAS_PAIRS = [
  // ['type', 'archetype'] removed: both fields were dropped in the v7->v8 clean cut.
  ['freshness', 'reviewed_at'],
  ['drift_check.last_verified', 'drift_check.verified_at'],
  ['eval_artifacts', 'eval.artifacts'],
  ['eval_state', 'eval.content_state'],
  ['routing_eval', 'eval.routing_coverage'],
  ['comprehension_state', 'eval.comprehension_state'],
  ['allowed-tools', 'allowed_tools'],
  ['compatibility.runtimes', 'compatibility.agent_runtimes'],
  ['compatibility.node', 'compatibility.node_version'],
  // grounding.claim_scope alias removed 2026-06-08 (SKI-241): zero corpus usage, and its name
  // collided with the top-level `scope` field. Single canonical name: grounding.grounding_mode.
  ['portability.targets', 'portability.export_targets'],
];

function getPath(obj, dottedPath) {
  return dottedPath.split('.').reduce((cursor, key) => {
    if (cursor === null || cursor === undefined || typeof cursor !== 'object') return undefined;
    return cursor[key];
  }, obj);
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function valuesEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}

/**
 * Check that duplicate alias declarations agree.
 *
 * @param {object} frontmatter Parsed SKILL.md frontmatter.
 * @returns {string[]} Human-readable mismatch errors.
 */
function checkAliasParity(frontmatter) {
  if (!frontmatter || typeof frontmatter !== 'object') return [];

  const errors = [];
  for (const [legacyPath, aliasPath] of ALIAS_PAIRS) {
    const legacyValue = getPath(frontmatter, legacyPath);
    const aliasValue = getPath(frontmatter, aliasPath);
    if (legacyValue === undefined || aliasValue === undefined) continue;
    if (!valuesEqual(legacyValue, aliasValue)) {
      errors.push(`${legacyPath} and ${aliasPath} alias values differ`);
    }
  }
  return errors;
}

module.exports = {
  checkAliasParity,
};
