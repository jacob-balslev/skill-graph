# Findings

## Skill

`epistemic-grounding`

## Audit Date

2026-06-01

## Verdict Summary

PASS_WITH_FIXES

## Findings

ID: F1
Severity: HIGH
Surface: metadata
Category: Schema conformance and audit-state separation
Problem: The skill mixed audit-loop-owned sidecar fields into `SKILL.md`, omitted the required v8 `scope`, retained a legacy nested `concept` block, and still advertised `skill_graph_protocol: Skill Metadata Protocol v5`.
Evidence: Pre-fix normalizer reported sidecar relocations for `schema_version`, `version`, `owner`, `freshness`, `drift_check`, eval fields, and verdict fields; it also reported `semantic-debt: scope` and `schema-unknown: concept`.
Required action: Completed. The canonical `SKILL.md` now keeps instructional metadata in frontmatter, moves audit-owned fields to `audit-state.json`, adds a v8 `scope`, removes `concept`, and advertises `Skill Metadata Protocol v8`.

ID: F2
Severity: MEDIUM
Surface: relations
Category: Relation quality and boundary ownership
Problem: The relation graph was too narrow for claim-grounding work and referenced adjacent ownership in outdated terms, including a non-bundle `reasoning` handoff in the body.
Evidence: Pre-fix relations only named `methodology` and `semantics`; the Do NOT Use table pointed inference work at `reasoning`, which is not one of the loaded bundle skills and does not express the intended ownership split as precisely as `first-principles-thinking` or `bayesian-reasoning`.
Required action: Completed. Relations now include `methodology`, `semantics`, `evaluation`, `agent-eval-design`, and `best-practice`; boundary reasons are written as ownership statements, and the Do NOT Use table routes inference and verification cases to current neighboring skills.

ID: F3
Severity: MEDIUM
Surface: grounding
Category: Source precision
Problem: Two current empirical claims were presented as named 2025 findings without direct source links or publication identifiers.
Evidence: The Key Sources section cited "AI sycophancy: 58.19% rate across frontier models" and "LLM summarization bias: overgeneralization in 26-73% of cases" without stable links. Manual web verification confirmed `SycEval: Evaluating LLM Sycophancy` at AAAI/ACM AIES 2025 and `Generalization bias in large language model summarization of scientific research` in Royal Society Open Science.
Required action: Completed. The Key Sources section now links the AIES paper page and the Royal Society Open Science DOI and scopes each source to the claim it supports.

ID: F4
Severity: MEDIUM
Surface: evals
Category: Comprehension coverage
Problem: The sidecar said eval artifacts were planned, but no comprehension eval existed for this skill.
Evidence: Pre-fix `eval_artifacts: planned`; post-fix disk check confirms `evals/comprehension.json` exists with definition, mental-model, boundary, misconception, and application cases.
Required action: Completed. A five-case comprehension eval now exists, and the sidecar records `eval_artifacts: present` while leaving runtime state unverified.

ID: F5
Severity: LOW
Surface: drift
Category: Hash-based drift coverage
Problem: The standalone drift sentinel reports `UNGROUNDED` because this portable skill has no local `truth_sources` to hash.
Evidence: `node scripts/skill-graph-drift.js --json ../skills/skills/meta-methods/epistemic-grounding` reports `status: UNGROUNDED`, `details: no truth_sources declared`, and an empty `truth_sources` list.
Required action: No content fix required in this pass. The skill's external source claims were manually verified, but hash-based drift coverage remains unavailable because there are no local truth-source files.

ID: F6
Severity: INFO
Surface: behavior
Category: Behavior Gate
Problem: No graded application evaluation was run, so the skill cannot be certified as behaviorally applicable.
Evidence: Sidecar remains `eval_state: unverified`, `comprehension_verdict: UNVERIFIED`, and `application_verdict: UNVERIFIED`.
Required action: Deferred. Run the graded audit/evaluation pipeline before promoting `application_verdict` beyond `UNVERIFIED`.

## Required Fixes

F1-F4 were fixed in this audit pass. F5 is documented as a structural limitation of the current drift sentinel for portable externally sourced skills. F6 remains intentionally deferred until a graded Behavior Gate run exists.
