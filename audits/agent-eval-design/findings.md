# Findings

## Skill

`agent-eval-design`

## Audit Date

2026-06-01

## Verdict Summary

Integrity Gate: PASS

Behavior Gate: UNVERIFIED

## Findings

ID: F1
Severity: P1
Surface: `../skills/skills/quality-assurance/agent-eval-design/SKILL.md` and `../skills/skills/quality-assurance/agent-eval-design/audit-state.json`
Category: Contract shape
Problem: Audit/eval/provenance fields were still embedded in `metadata` even though the current contract stores them in sibling `audit-state.json`.
Evidence: `node scripts/normalize-skill-field-shape.js --report --skill agent-eval-design` reported 16 fields to relocate: `schema_version`, `version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, `last_audited`, `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `lint_verdict`, `portability`, and `lifecycle`.
Required action: Applied. The fields now live in `../skills/skills/quality-assurance/agent-eval-design/audit-state.json`.

ID: F2
Severity: P1
Surface: `../skills/skills/quality-assurance/agent-eval-design/SKILL.md`
Category: Required v8 field
Problem: The skill did not declare required free-text `scope`.
Evidence: The normalizer reported `scope` as semantic debt after moving mechanical fields.
Required action: Applied. `scope` now states the positive eval-design surface, portable deployment target, and exclusions for application-code testing, library health tooling, live debugging, and code review.

ID: F3
Severity: P2
Surface: `../skills/skills/quality-assurance/agent-eval-design/SKILL.md`
Category: Stale protocol wording
Problem: The skill carried a stale `Skill Metadata Protocol v5` export label and old relation-comment text that omitted `disjoint_with` and described a pending `suppresses` rename.
Evidence: Pre-fix frontmatter had `skill_graph_protocol: Skill Metadata Protocol v5` and relation comments saying "Six edge types" plus "rename to `suppresses` pending ADR-0018."
Required action: Applied. The content label now matches v8, and relation comments describe the current relation vocabulary and boundary exclusion mechanic.

ID: F4
Severity: P2
Surface: `../skills/skills/quality-assurance/agent-eval-design/SKILL.md`
Category: Content quality
Problem: The body was directionally correct but too thin for the skill's subject: it named eval ingredients but did not show how to map agent behavior surfaces to positive cases, hard negatives, and grader shapes.
Evidence: Pre-fix body had Coverage, Philosophy, Method, Verification, and Do NOT Use When, but no decision table or concrete matrix.
Required action: Applied. Added an Eval Case Matrix and Threshold Design section covering routing, grounding, tool-use policy, multi-step workflow, and prompt/system behavior.

ID: F5
Severity: Info
Surface: Activation and relation metadata
Category: Activation/relations
Problem: No defect found after repair. The trigger surface and boundaries are appropriately scoped for agent behavior evals rather than product tests, health tooling, live debugging, or code review.
Evidence: `description`, `keywords`, `examples`, `anti_examples`, and `relations.boundary` all distinguish agent eval design from adjacent QA and debugging skills.
Required action: No content fix required.

ID: F6
Severity: Info
Surface: Grounding metadata
Category: Truth-source verification
Problem: No grounding defect found. This is a portable methodology skill with no project-specific truth sources, so the drift sentinel reports `UNGROUNDED` and the audit loop stamps `truth_verdict: PASS`.
Evidence: `node bin/skill-graph.js audit agent-eval-design --force` reported `drift: UNGROUNDED` and stamped `truth_verdict: PASS`.
Required action: No grounding fix required.

ID: F7
Severity: P2
Surface: Behavior Gate
Category: Eval coverage
Problem: The Behavior Gate remains unverified. `eval_artifacts` is `planned`, but no comprehension/application eval artifacts or graded run exist.
Evidence: `audit-state.json` keeps `eval_state: unverified`, `comprehension_verdict: UNVERIFIED`, and `application_verdict: UNVERIFIED`; the audit command was run without `--graded`.
Required action: Deferred to a future `evaluate` run with real eval artifacts.

## Verification

- `node bin/skill-graph.js lint agent-eval-design` — PASS, 0 errors, 0 warnings.
- `node bin/skill-graph.js audit agent-eval-design --force` — PASS structural lint, `UNGROUNDED` drift, stamped `truth_verdict: PASS`.
