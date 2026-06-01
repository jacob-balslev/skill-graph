#!/usr/bin/env node
/**
 * Field-Relevance Benchmark — Conceptual Field-Placement Classification (the real P5)
 *
 * This REPLACES the empirical ablation scorecard. Per the user directives (2026-06-01):
 *   1. The system was built AFTER the skills; the legacy corpus cannot prove/disprove a
 *      field's CONCEPT. Relevance is conceptual, not corpus-empirical. (Machine R + Machine B
 *      over the legacy corpus are retired as verdict sources.)
 *   2. The actual COMPREHENSION (the 5 Understanding prose fields) is a different thing from
 *      the EVALUATION of comprehension (the grader + comprehension.json + verdicts).
 *   3. Audit/Evaluation/Provenance metadata is relevant ONLY to the Skill Audit Loop. The
 *      everyday agentic dev workflow never reads it, so it must NOT live in the agent-facing
 *      SKILL.md frontmatter — it belongs in a sidecar JSON in the skill folder.
 *
 * THE CUT (one clean test per field):
 *   "Does the everyday agent — loading this skill to do dev work — need to SEE this field to
 *    FIND, UNDERSTAND, or EXECUTE the skill?"  YES → frontmatter (agent-facing).
 *    NO (it only tells the audit loop whether the skill is healthy/honest/fresh/published) →
 *    sidecar (audit-loop-facing).
 *
 * Output: field-placement.json + a printed table. Verifies every schema field is classified
 * (completeness gate — no field silently dropped).
 *
 * INVOCATION: node benchmarks/field-relevance/field-placement.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const SG = path.resolve(__dirname, '..', '..');
const SCHEMA = path.join(SG, 'schemas', 'SKILL_METADATA_PROTOCOL_schema.json');

// placement: frontmatter | sidecar | deprecated | unresolved
// moment:    everyday-agentic | audit-loop | (n/a)
// role/subclass explains WHY.
const CLASS = {
  // ── FRONTMATTER (agent-facing — the everyday agentic dev workflow reads these) ──
  name:              { placement: 'frontmatter', moment: 'everyday-agentic', role: 'identity', why: 'what the skill is called; every consumer keys on it' },
  description:       { placement: 'frontmatter', moment: 'everyday-agentic', role: 'description', why: 'one-line what-it-is; primary router signal' },
  subject:           { placement: 'frontmatter', moment: 'everyday-agentic', role: 'classification', why: 'browse shelf + router stratum + graph node' },
  subjects:          { placement: 'frontmatter', moment: 'everyday-agentic', role: 'classification', why: 'polyhierarchy browse (max 2)' },
  taxonomy_domain:   { placement: 'frontmatter', moment: 'everyday-agentic', role: 'classification', why: 'finer browse sub-path within a subject' },
  deployment_target: { placement: 'frontmatter', moment: 'everyday-agentic', role: 'classification', why: 'where it applies; router tie-break + publication gate' },
  scope:             { placement: 'frontmatter', moment: 'everyday-agentic', role: 'scope', why: 'PRD-style when/why-to-use; agent reads to decide applicability' },
  grounding:         { placement: 'frontmatter', moment: 'everyday-agentic', role: 'scope-grounding', why: 'where it applies + truth surface for project skills (truth_source_hashes are the audit facet — see note)' },
  project:           { placement: 'frontmatter', moment: 'everyday-agentic', role: 'scope', why: 'router project filter (which project a project-skill belongs to)' },
  keywords:          { placement: 'frontmatter', moment: 'everyday-agentic', role: 'activation', why: 'dominant deterministic routing signal' },
  triggers:          { placement: 'frontmatter', moment: 'everyday-agentic', role: 'activation', why: 'exact-phrase activation (substitute carrier when keywords miss)' },
  examples:          { placement: 'frontmatter', moment: 'everyday-agentic', role: 'activation', why: 'positive activation prompts + eval seed' },
  anti_examples:     { placement: 'frontmatter', moment: 'everyday-agentic', role: 'activation', why: 'negative boundary prompts + export boundary synth' },
  paths:             { placement: 'frontmatter', moment: 'everyday-agentic', role: 'activation', why: 'file-surface activation (--path boost)' },
  relations:         { placement: 'frontmatter', moment: 'everyday-agentic', role: 'relations', why: 'graph co-load / exclusion / verify / depends — the navigable graph' },
  mental_model:      { placement: 'frontmatter', moment: 'everyday-agentic', role: 'comprehension-prose', why: 'ACTUAL comprehension: the frame the agent reasons with' },
  purpose:           { placement: 'frontmatter', moment: 'everyday-agentic', role: 'comprehension-prose', why: 'ACTUAL comprehension: when/why to invoke the thinking' },
  boundary:          { placement: 'frontmatter', moment: 'everyday-agentic', role: 'comprehension-prose', why: 'ACTUAL comprehension: the not-for / scoping facet' },
  analogy:           { placement: 'frontmatter', moment: 'everyday-agentic', role: 'comprehension-prose', why: 'ACTUAL comprehension: transfer from known to new' },
  misconception:     { placement: 'frontmatter', moment: 'everyday-agentic', role: 'comprehension-prose', why: 'ACTUAL comprehension: inoculation against the predictable error' },
  'allowed-tools':   { placement: 'frontmatter', moment: 'everyday-agentic', role: 'execution', why: 'harness gates tool calls; public Agent-Skills kebab spelling' },
  license:           { placement: 'frontmatter', moment: 'everyday-agentic', role: 'distribution-public', why: 'public Agent-Skills standard field; ships with the skill' },
  compatibility:     { placement: 'frontmatter', moment: 'everyday-agentic', role: 'distribution-public', why: 'public Agent-Skills standard field (runtime compat)' },
  stability:         { placement: 'frontmatter', moment: 'everyday-agentic', role: 'lifecycle-routing', why: 'deprecation state the router gates on (do not route to deprecated)' },
  superseded_by:     { placement: 'frontmatter', moment: 'everyday-agentic', role: 'lifecycle-routing', why: 'deprecation redirect the router/agent follows' },

  // ── SIDECAR (audit-loop-facing — Audit / Evaluation / Provenance; the agent never reads these) ──
  schema_version:    { placement: 'sidecar', moment: 'audit-loop', role: 'provenance', why: 'which contract the skill conforms to — system/audit concern, not the public Agent-Skills spec' },
  version:           { placement: 'sidecar', moment: 'audit-loop', role: 'provenance', why: 'skill version number; governance/provenance, not agent-facing' },
  urn:               { placement: 'sidecar', moment: 'audit-loop', role: 'provenance', why: 'registry identity; provenance, 0 acting consumer today' },
  repo:              { placement: 'sidecar', moment: 'audit-loop', role: 'provenance', why: 'belonging-entity repo reference; provenance' },
  owner:             { placement: 'sidecar', moment: 'audit-loop', role: 'provenance', why: 'maintenance accountability; human-curator/audit, not agent' },
  freshness:         { placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'audit freshness timestamp' },
  reviewed_at:       { placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'audit timestamp (alias of freshness — consolidate)' },
  last_audited:      { placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'when the audit loop last ran' },
  last_changed:      { placement: 'sidecar', moment: 'audit-loop', role: 'provenance', why: 'last content change; audit/provenance bookkeeping' },
  drift_check:       { placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'drift sentinel hashes + last_verified — audit machinery' },
  drift_status:      { placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'recorded drift result' },
  eval_artifacts:    { placement: 'sidecar', moment: 'audit-loop', role: 'evaluation', why: 'whether gradeable eval artifacts exist' },
  eval_state:        { placement: 'sidecar', moment: 'audit-loop', role: 'evaluation', why: 'unverified/passing/monitored — eval bookkeeping' },
  routing_eval:      { placement: 'sidecar', moment: 'audit-loop', role: 'evaluation', why: 'whether the skill appears in a routing eval' },
  eval_score:        { placement: 'sidecar', moment: 'audit-loop', role: 'evaluation', why: 'last eval score' },
  eval_failed_ids:   { placement: 'sidecar', moment: 'audit-loop', role: 'evaluation', why: 'which eval cases failed' },
  eval_last_run:     { placement: 'sidecar', moment: 'audit-loop', role: 'evaluation', why: 'eval receipt timestamp' },
  eval:              { placement: 'sidecar', moment: 'audit-loop', role: 'evaluation', why: 'legacy nested eval block (alias of flat eval_* — consolidate)' },
  structural_verdict:{ placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'Integrity-gate verdict' },
  truth_verdict:     { placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'grounding/drift verdict' },
  comprehension_verdict:{ placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'comprehension-gate verdict (the EVALUATION of comprehension, not the prose)' },
  application_verdict:{ placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'behavior-gate verdict (primary quality signal) — audit output' },
  lint_verdict:      { placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'structural lint result' },
  comprehension_state:{ placement: 'sidecar', moment: 'audit-loop', role: 'evaluation', why: 'FLAG that Understanding prose + comprehension eval are present; the eval/bookkeeping side of comprehension (prose itself stays frontmatter)' },
  marketplace_tier:  { placement: 'sidecar', moment: 'audit-loop', role: 'distribution-internal', why: 'publication tier; marketplace consumer at publish time, not the agent' },
  portability:       { placement: 'sidecar', moment: 'audit-loop', role: 'distribution-internal', why: 'portability classification; manifest-only pass-through, not agent-read' },
  runtime_telemetry: { placement: 'sidecar', moment: 'audit-loop', role: 'runtime-feedback', why: 'observed runtime outcome feed; corroborates audit verdicts' },
  lifecycle:         { placement: 'sidecar', moment: 'audit-loop', role: 'audit', why: 'review cadence + stale_after_days; audit/freshness scheduling (NOTE: stale_after_days feeds the router staleness gate — see cross-tier note)' },

  // ── DEPRECATED / ALIAS (consolidate or remove — neither tier) ──
  concept:           { placement: 'deprecated', moment: 'n/a', role: 'deprecated', why: 'legacy nested Understanding block; superseded by the 5 flat fields' },
  allowed_tools:     { placement: 'deprecated', moment: 'n/a', role: 'alias', why: 'snake-case alias of allowed-tools (kebab); drop, keep kebab (public spelling)' },

  // ── UNRESOLVED (no acting consumer — decide, do not default) ──
  routing_bundles:   { placement: 'unresolved', moment: 'n/a', role: 'no-consumer', why: 'curated working-set grouping; 0 acting consumer (P1a). If revived it is LIBRARY-LEVEL routing config, not per-skill frontmatter — decision pending, not a default-to-sidecar' },
};

function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA, 'utf8'));
  const fields = Object.keys(schema.properties || {});
  const required = new Set(schema.required || []);

  // completeness gate — every schema field MUST be classified
  const unclassified = fields.filter(f => !CLASS[f]);
  const phantom = Object.keys(CLASS).filter(f => !fields.includes(f));
  if (unclassified.length) { console.error('UNCLASSIFIED schema fields (must fix):', unclassified.join(', ')); process.exitCode = 2; }
  if (phantom.length) console.error('CLASS keys not in schema (stale):', phantom.join(', '));

  const groups = { frontmatter: [], sidecar: [], deprecated: [], unresolved: [] };
  for (const f of fields) {
    const c = CLASS[f] || { placement: 'UNCLASSIFIED' };
    groups[c.placement] ? groups[c.placement].push(f) : null;
  }

  const reqInSidecar = fields.filter(f => required.has(f) && CLASS[f] && CLASS[f].placement === 'sidecar');

  console.log('Field-Relevance — Conceptual Field-Placement Classification');
  console.log(`Schema fields: ${fields.length} | classified: ${fields.length - unclassified.length}\n`);
  for (const g of ['frontmatter', 'sidecar', 'deprecated', 'unresolved']) {
    console.log(`\n## ${g.toUpperCase()} (${groups[g].length})`);
    for (const f of groups[g]) {
      const c = CLASS[f];
      const req = required.has(f) ? ' [REQUIRED]' : '';
      console.log(`  ${f.padEnd(22)} ${c.role.padEnd(20)} ${c.why}${req}`);
    }
  }
  console.log('\n── Migration tension ──');
  console.log(`Schema-REQUIRED fields that this model moves to the sidecar (${reqInSidecar.length}):`);
  console.log('  ' + reqInSidecar.join(', '));
  console.log('  → the SYSTEM schema split must DE-require these from the agent-facing frontmatter');
  console.log('    and re-require them in the sidecar schema.');

  const out = {
    generated_for: 'field-relevance-benchmark/conceptual-field-placement',
    basis: 'conceptual (consumer x moment); NOT corpus-empirical — Machine R + Machine B retired per user directive 2026-06-01',
    cut_test: 'Does the everyday agent need to SEE this field to FIND/UNDERSTAND/EXECUTE the skill? yes=frontmatter, no=sidecar(audit-loop).',
    total_fields: fields.length,
    counts: { frontmatter: groups.frontmatter.length, sidecar: groups.sidecar.length, deprecated: groups.deprecated.length, unresolved: groups.unresolved.length },
    required_fields_moved_to_sidecar: reqInSidecar,
    fields: Object.fromEntries(fields.map(f => [f, { ...CLASS[f], required: required.has(f) }])),
  };
  fs.writeFileSync(path.join(__dirname, 'field-placement.json'), JSON.stringify(out, null, 2) + '\n');
  console.log('\nWrote field-placement.json');
  console.log(`Completeness: classified all ${fields.length} schema fields; unclassified: ${unclassified.length ? unclassified.join(',') : 'none'}.`);
}

main();
