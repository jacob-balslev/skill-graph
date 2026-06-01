# Findings

## Skill

`architecture-decision-records`

## Audit Date

2026-06-01

## Verdict Summary

Integrity Gate: PASS

Behavior Gate: UNVERIFIED

## Findings

ID: F1
Severity: P1
Surface: `../skills/skills/code-engineering/architecture-decision-records/SKILL.md` and `../skills/skills/code-engineering/architecture-decision-records/audit-state.json`
Category: Contract shape
Problem: Audit/eval/provenance fields still lived in `metadata` instead of the sibling `audit-state.json` sidecar.
Evidence: `node scripts/normalize-skill-field-shape.js --report --skill architecture-decision-records` reported 16 fields to relocate: `schema_version`, `version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, `last_audited`, `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `lint_verdict`, `portability`, and `lifecycle`.
Required action: Applied. The fields now live in the sidecar and the audit loop stamped the 2026-06-01 state.

ID: F2
Severity: P2
Surface: `../skills/skills/code-engineering/architecture-decision-records/SKILL.md`
Category: Stale protocol wording
Problem: The skill carried a stale `Skill Metadata Protocol v5` export label and old relation-comment text that omitted `disjoint_with` and described a pending `suppresses` rename.
Evidence: Pre-fix frontmatter had `skill_graph_protocol: Skill Metadata Protocol v5` and relation comments saying "Six edge types" plus "rename to `suppresses` pending ADR-0018."
Required action: Applied. The content label now matches v8, and relation comments describe the current relation vocabulary and boundary exclusion mechanic.

ID: F3
Severity: P3
Surface: `../skills/skills/code-engineering/architecture-decision-records/SKILL.md`
Category: Field-purpose comments
Problem: The Agent Skills wrapper fields lacked field-purpose comments.
Evidence: The original file had no comments for `name`, `description`, `license`, `compatibility`, `allowed-tools`, or `metadata`.
Required action: Applied. Field-purpose comments were added; focused lint reports 0 warnings.

ID: F4
Severity: P2
Surface: `../skills/skills/code-engineering/architecture-decision-records/SKILL.md`
Category: Content quality
Problem: The skill explained how to create an ADR, but lacked a quick decision table for status, deprecation, supersession, and implementation drift.
Evidence: Pre-fix body had Method and Verification but no status-transition guidance.
Required action: Applied. Added a Status Decision Table that tells the agent when to keep `proposed`, mark `accepted`, deprecate, supersede, add follow-up verification, or split an overloaded ADR.

ID: F5
Severity: Info
Surface: Activation and relation metadata
Category: Activation/relations
Problem: No defect found after repair. Activation text and boundaries distinguish ADR work from general docs, code review, framework choice, and interface-contract design.
Evidence: `description`, `examples`, `anti_examples`, and `relations.boundary` name those adjacent owners explicitly.
Required action: No content fix required.

ID: F6
Severity: Info
Surface: Grounding metadata
Category: Truth-source verification
Problem: No grounding defect found. This is a portable methodology skill with no project-specific truth sources, so the drift sentinel reports `UNGROUNDED` and the audit loop stamps `truth_verdict: PASS`.
Evidence: `node bin/skill-graph.js audit architecture-decision-records --force` reported `drift: UNGROUNDED` and stamped `truth_verdict: PASS`.
Required action: No grounding fix required.

ID: F7
Severity: P2
Surface: Behavior Gate
Category: Eval coverage
Problem: The Behavior Gate remains unverified. `eval_artifacts` is `planned`, but no comprehension/application eval artifacts or graded run exist.
Evidence: `audit-state.json` keeps `eval_state: unverified`, `comprehension_verdict: UNVERIFIED`, and `application_verdict: UNVERIFIED`; the audit command was run without `--graded`.
Required action: Deferred to a future `evaluate` run with real eval artifacts.

## Verification

- `node bin/skill-graph.js lint architecture-decision-records` — PASS, 0 errors, 0 warnings.
- `node bin/skill-graph.js audit architecture-decision-records --force` — PASS structural lint, `UNGROUNDED` drift, stamped `truth_verdict: PASS`.
