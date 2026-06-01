# Findings

## Skill

`eval-driven-development`

## Audit Date

2026-06-01

## Verdict Summary

PASS_WITH_FIXES

## Findings

ID: F1
Severity: HIGH
Surface: metadata
Category: Schema conformance and audit-state separation
Problem: The skill kept audit-loop-owned fields in `SKILL.md`, retained the legacy nested `concept` field, lacked top-level field-purpose comments, and still claimed `Skill Metadata Protocol v5`.
Evidence: Pre-fix lint emitted 16 schema errors for sidecar-owned or unknown fields; the field-shape normalizer reported 15 relocations plus `schema-unknown: concept`.
Required action: Completed. The sidecar-owned fields now live in `audit-state.json`, top-level field-purpose comments exist, the legacy `concept` block is removed, and the skill advertises `Skill Metadata Protocol v8`.

ID: F2
Severity: MEDIUM
Surface: relations
Category: Current neighbor ownership
Problem: The routing metadata and body pointed near-miss cases at unavailable or stale skill names and used older relation comments.
Evidence: Pre-fix `anti_examples` referenced `observability` and `benchmarking-engine`; the boundary paragraph also named `benchmarking-engine`. The relation comment still described six edge types and a pending `suppresses` rename.
Required action: Completed. The skill now routes production monitoring to `error-tracking` / `observability-modeling`, benchmark interpretation to `evaluation`, and relation comments to the current field set.

ID: F3
Severity: MEDIUM
Surface: grounding
Category: External source freshness
Problem: Two practitioner-source links were stale or less precise than current source locations.
Evidence: The Key Sources section linked Anthropic's old GitHub cookbook path and the older Inspect domain. Manual web verification found Anthropic's current Claude Cookbook evals page, Anthropic's empirical-evals guide, and Inspect's current `inspect.aisi.org.uk` home.
Required action: Completed. The Key Sources section now links the current Claude Cookbook evals page, the Anthropic empirical-evals guide, and the current Inspect site.

ID: F4
Severity: MEDIUM
Surface: evals
Category: Comprehension coverage
Problem: The skill declared `eval_artifacts: planned`, but no comprehension eval artifact existed.
Evidence: Pre-fix sidecar had `eval_artifacts: planned`; post-fix disk check confirms `evals/comprehension.json` exists with definition, mental-model, boundary, misconception, and application cases.
Required action: Completed. A five-case comprehension eval now exists, and the sidecar records `eval_artifacts: present` while runtime verdicts remain unverified.

ID: F5
Severity: LOW
Surface: drift
Category: Hash-based drift coverage
Problem: The standalone drift sentinel reports `UNGROUNDED` because this portable skill has no local `truth_sources` to hash.
Evidence: `node scripts/skill-graph-drift.js --json ../skills/skills/agent-ops/eval-driven-development` reports `status: UNGROUNDED`, `details: no truth_sources declared`, and an empty `truth_sources` list.
Required action: No content fix required in this pass. External source links were manually checked; hash-based drift coverage remains unavailable without local truth-source files.

ID: F6
Severity: INFO
Surface: behavior
Category: Behavior Gate
Problem: No graded application evaluation was run, so the skill cannot be certified as behaviorally applicable.
Evidence: Sidecar remains `eval_state: unverified`, `comprehension_verdict: UNVERIFIED`, and `application_verdict: UNVERIFIED`.
Required action: Deferred. Run the graded audit/evaluation pipeline before promoting `application_verdict` beyond `UNVERIFIED`.

## Required Fixes

F1-F4 were fixed in this audit pass. F5 is documented as a drift-coverage limitation for a portable externally sourced skill. F6 remains intentionally deferred until a graded Behavior Gate run exists.
