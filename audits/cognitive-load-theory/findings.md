# Findings

## Skill

`cognitive-load-theory`

## Audit Date

2026-06-01

## Verdict Summary

Integrity Gate: PASS

Behavior Gate: UNVERIFIED

## Findings

ID: F1
Severity: HIGH
Surface: metadata
Category: Schema conformance and sidecar placement
Problem: The skill still carried audit/eval/provenance fields in `SKILL.md`, lacked the required v8 free-text `scope`, and claimed the retired protocol label.
Evidence: The field-shape report listed 14 sidecar-owned fields to relocate and semantic debt for missing `scope`; frontmatter said `skill_graph_protocol: Skill Metadata Protocol v5`.
Required action: Applied the sidecar normalizer, created `audit-state.json`, added v8 `scope`, updated `skill_graph_protocol` to v8, and preserved `schema_version: 8` in the sidecar.
Status: Fixed in this audit.

ID: F2
Severity: MEDIUM
Surface: relations
Category: Relation quality and current graph targets
Problem: Relations used the deprecated `adjacent` relation and referenced unavailable or retired skill names.
Evidence: The relation graph referenced `teaching-patterns`, `editorial-standards`, and `memory-gardener`, none of which are current bundle skills; relation comments still said six edge types and used the old ADR-0018 wording.
Required action: Replaced the graph with current `related`, `boundary`, and `verify_with` edges to available skills including `context-management`, `context-window`, `compression`, `prompt-craft`, `information-architecture`, `microcopy`, `writing-humanizer`, `summarization`, and `best-practice`.
Status: Fixed in this audit.

ID: F3
Severity: MEDIUM
Surface: evals
Category: Current eval artifact shape
Problem: The skill had only a legacy `evals/evals.json` artifact and no current comprehension eval tied to `comprehension_state`.
Evidence: The skill directory contained `evals/evals.json`; sidecar initially had no `comprehension_state`; the skill body referenced `evals/evals.json` in an audit example.
Required action: Added `evals/comprehension.json` with five realistic concept, boundary, misconception, and application cases; added flat Understanding fields; set `comprehension_state: present`; updated the body example to the current `evals/comprehension.json` surface.
Status: Fixed in this audit.

ID: F4
Severity: LOW
Surface: body
Category: Cognitive-load and audit-state duplication
Problem: The teaching body contained a stale Health Block table duplicating audit state, which is both outdated after ADR-0019 and extraneous load inside a CLT skill.
Evidence: The body included a `## Health Block` section with verdict values, `last_audited`, `eval_failed_ids`, `drift_status`, and `freshness`.
Required action: Replaced the section with a short `## Audit Status` note pointing readers to the sidecar and the Skill Audit Loop.
Status: Fixed in this audit.

ID: F5
Severity: NONE
Surface: behavior
Category: Behavior Gate
Problem: No graded comprehension or application eval was run in this CONTENT pass.
Evidence: `audit-state.json` remains `comprehension_verdict: UNVERIFIED` and `application_verdict: UNVERIFIED`; the audit command ran without `--graded`.
Required action: Keep Behavior Gate as UNVERIFIED until a graded eval run exists.
Status: Deferred by audit-loop maturity, not a skill defect.

## Required Fixes

All content fixes identified in this audit were applied. Behavior certification remains UNVERIFIED because no graded eval was run.
