/**
 * v3.1 field-name alias contract.
 *
 * These pairs are intentionally additive in v3.x: authors keep the canonical
 * v3 fields, may also provide the preferred v3.1 aliases, and lint/generator
 * code verifies that duplicate declarations agree before the alias set becomes
 * canonical in v4.
 */

'use strict';

const ALIAS_PAIRS = [
  { canonical: ['type'], alias: ['archetype'] },
  { canonical: ['category'], alias: ['category_path'] },
  { canonical: ['freshness'], alias: ['reviewed_at'] },
  { canonical: ['allowed-tools'], alias: ['allowed_tools'] },
  { canonical: ['grounding', 'domain_object'], alias: ['grounding', 'subject'] },
  { canonical: ['grounding', 'grounding_mode'], alias: ['grounding', 'claim_scope'] },
  { canonical: ['drift_check', 'last_verified'], alias: ['drift_check', 'verified_at'] },
  { canonical: ['compatibility', 'runtimes'], alias: ['compatibility', 'agent_runtimes'] },
  { canonical: ['compatibility', 'node'], alias: ['compatibility', 'node_version'] },
  { canonical: ['portability', 'targets'], alias: ['portability', 'export_targets'] },
  { canonical: ['eval_artifacts'], alias: ['eval', 'artifacts'] },
  { canonical: ['eval_state'], alias: ['eval', 'content_state'] },
  { canonical: ['routing_eval'], alias: ['eval', 'routing_coverage'] },
  { canonical: ['comprehension_state'], alias: ['eval', 'comprehension_state'] },
];

function hasPath(obj, parts) {
  let cur = obj;
  for (const part of parts) {
    if (!cur || typeof cur !== 'object' || !(part in cur)) return false;
    cur = cur[part];
  }
  return true;
}

function getPath(obj, parts) {
  let cur = obj;
  for (const part of parts) {
    if (!cur || typeof cur !== 'object' || !(part in cur)) return undefined;
    cur = cur[part];
  }
  return cur;
}

function pathLabel(parts) {
  return parts.join('.');
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function valuesEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}

function checkAliasParity(fm) {
  const errors = [];
  if (!fm || typeof fm !== 'object') return errors;

  for (const pair of ALIAS_PAIRS) {
    if (!hasPath(fm, pair.canonical) || !hasPath(fm, pair.alias)) continue;
    const canonicalValue = getPath(fm, pair.canonical);
    const aliasValue = getPath(fm, pair.alias);
    if (!valuesEqual(canonicalValue, aliasValue)) {
      errors.push(
        `${pathLabel(pair.alias)}: alias value ${JSON.stringify(aliasValue)} must match ` +
        `${pathLabel(pair.canonical)} ${JSON.stringify(canonicalValue)}`
      );
    }
  }

  return errors;
}

module.exports = {
  ALIAS_PAIRS,
  checkAliasParity,
};
