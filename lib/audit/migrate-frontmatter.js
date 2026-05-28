'use strict';
/**
 * migrate-frontmatter.js — deterministic v7 → v8 frontmatter shape migration.
 *
 * This is the first (currently only) entry in the audit `--fix` repair catalog:
 * the deterministic Integrity-gate fix path described in
 * `docs/proposals/skill-audit-loop-fix-paths.md`. It performs the mechanical
 * v7 → v8 shape transform — NO LLM, NO evals, NO keep-or-revert. The correct
 * output is unambiguous for every skill, so the gate is binary (lint passes or
 * it doesn't), not a fuzzy metric.
 *
 * Per `AGENTS.md § Major Version Is a Clean Cut`, the per-version transform is a
 * one-time event: once the corpus has migrated, this module is retired (legacy
 * recoverable via `git tag schema-v7`). The `--fix` *framework* in
 * `skill-audit.js` stays; this map entry is what gets removed.
 *
 * What it does (per skill, both physical encodings — nested `metadata:` block
 * at 2-space indent, and flat top-level at 0-indent):
 *   1. Remove retired fields not in the v8 schema (fail `additionalProperties`):
 *      type, category, operation, primaryCategory, layerPrimary, routingRole.
 *   2. Rename the `domain` key → `taxonomy_domain`.
 *   3. Rename `domain_object` → `subject_matter` everywhere in the frontmatter
 *      (it appears as a JSON-string fragment inside `grounding: "{...}"` AND as a
 *      structured-YAML sub-key; some skills carry both — verified `domain_object`
 *      only ever occurs in a grounding context, so a blanket replace is safe).
 *   4. Drop the enum `scope` line; add the required `deployment_target`, derived
 *      deterministically: project iff scope==="project" OR grounding_mode==="repo_specific".
 *   5. Strip field-purpose comment lines at the field indent. The caller is
 *      expected to regenerate them via backfill-field-purpose-comments.js
 *      (which is already v8-aware) so the comments reflect the new shape.
 *
 * What it does NOT touch: the body, schema_version (left as honest
 * label-behind-content per the version-earned rule), the Understanding fields,
 * the `concept` block, `skill_graph_*` export provenance, evals, or any verdict.
 *
 * Block scalars (`field: |` followed by deeper-indented prose) are preserved:
 * the field/comment regexes are strictly indent-anchored, and block content is
 * always indented deeper than the field indent, so it never matches.
 *
 * Idempotent: a skill already in v8 shape returns { changed: false }.
 */

const RETIRED_FIELDS = new Set([
  'type', 'category', 'operation', 'primaryCategory', 'layerPrimary', 'routingRole',
]);

/**
 * @param {string} srcText  full SKILL.md content
 * @returns {{changed:boolean, output:string, reason?:string,
 *            deploymentTarget?:string, scopeVal?:string|null,
 *            groundingMode?:string|null, encoding?:string}}
 */
function migrateFrontmatterToV8(srcText) {
  const lines = srcText.split('\n');
  if (lines[0] !== '---') return { changed: false, output: srcText, reason: 'no leading frontmatter ---' };

  let endIdx = -1;
  for (let i = 1; i < lines.length; i++) { if (lines[i] === '---') { endIdx = i; break; } }
  if (endIdx === -1) return { changed: false, output: srcText, reason: 'no closing frontmatter ---' };

  // Encoding: nested (a `metadata:` block) vs flat top-level.
  let metaLine = -1;
  for (let i = 1; i < endIdx; i++) { if (lines[i] === 'metadata:') { metaLine = i; break; } }
  const isNested = metaLine !== -1;
  const indent = isNested ? '  ' : '';
  const startIdx = isNested ? metaLine + 1 : 1;

  const fieldRe = new RegExp('^' + indent + '([a-zA-Z_][a-zA-Z0-9_-]*):');
  const commentRe = new RegExp('^' + indent + '#');
  const scopeRe = new RegExp('^' + indent + 'scope:\\s*["\']?([a-z_]+)');
  const subjectRe = new RegExp('^' + indent + 'subject:');
  const dtRe = new RegExp('^' + indent + 'deployment_target:');
  const domainRe = new RegExp('^' + indent + 'domain:');
  const schemaVersionRe = new RegExp('^' + indent + 'schema_version:');

  // Scan the WHOLE frontmatter for the inputs to the deployment_target rule.
  // grounding_mode appears as a JSON-string fragment (\"grounding_mode\":\"X\")
  // or a structured-YAML value (grounding_mode: X); match both.
  let scopeVal = null;
  let groundingMode = null;
  let hasDT = false;
  for (let i = 1; i < endIdx; i++) {
    const l = lines[i];
    const sm = l.match(scopeRe);
    if (sm) scopeVal = sm[1];
    if (dtRe.test(l)) hasDT = true;
    const gm = l.match(/grounding_mode\\?"?\s*:\s*\\?"?([a-z_]+)/);
    if (gm) groundingMode = gm[1];
  }
  const deploymentTarget = (scopeVal === 'project' || groundingMode === 'repo_specific') ? 'project' : 'portable';

  const renameDomainObject = (l) => (l.includes('domain_object') ? l.replace(/domain_object/g, 'subject_matter') : l);

  const out = [];
  // Head slice [0, startIdx): only the domain_object rename applies (covers a
  // structured top-level grounding block declared before `metadata:`).
  for (let i = 0; i < startIdx; i++) out.push(renameDomainObject(lines[i]));

  // Walked region [startIdx, endIdx).
  let dtInserted = hasDT;
  for (let i = startIdx; i < endIdx; i++) {
    let l = lines[i];
    if (commentRe.test(l)) continue;                    // strip field-purpose comment
    const fm = l.match(fieldRe);
    const fname = fm ? fm[1] : null;
    if (fname && RETIRED_FIELDS.has(fname)) continue;   // remove retired field
    if (fname === 'scope') continue;                    // drop enum scope (replaced by deployment_target)
    if (fname === 'domain') l = l.replace(domainRe, indent + 'taxonomy_domain:');
    l = renameDomainObject(l);
    out.push(l);
    if (fname === 'subject' && !dtInserted) {
      out.push(indent + 'deployment_target: ' + deploymentTarget);
      dtInserted = true;
    }
  }

  // Fallback: every corpus skill has a `subject`, but if one didn't, the
  // required field would still be missing — insert after schema_version.
  if (!dtInserted) {
    let ins = out.findIndex((l) => schemaVersionRe.test(l));
    ins = ins === -1 ? startIdx : ins + 1;
    out.splice(ins, 0, indent + 'deployment_target: ' + deploymentTarget);
    dtInserted = true;
  }

  // Tail [endIdx, end).
  for (let j = endIdx; j < lines.length; j++) out.push(lines[j]);

  const output = out.join('\n');
  return {
    changed: output !== srcText,
    output,
    deploymentTarget,
    scopeVal,
    groundingMode,
    encoding: isNested ? 'nested' : 'flat',
  };
}

module.exports = { migrateFrontmatterToV8, RETIRED_FIELDS };
