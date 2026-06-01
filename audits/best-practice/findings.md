# Findings

## Skill

`best-practice`

## Audit Date

2026-06-01

## Verdict Summary

Integrity Gate: PASS

Behavior Gate: UNVERIFIED

## Findings

ID: F1
Severity: HIGH
Surface: metadata
Category: Schema conformance and audit-state placement
Problem: The skill still carried sidecar-owned audit/eval/provenance fields in `SKILL.md` and lacked the required v8 free-text `scope`.
Evidence: The normalization report listed 16 fields to relocate to `audit-state.json` (`schema_version`, `version`, `owner`, `freshness`, `drift_check`, eval state, routing eval, audit verdicts, portability, and lifecycle) plus semantic debt for missing `scope`.
Required action: Applied the sidecar normalizer, created `audit-state.json`, added a v8 `scope`, and kept `schema_version` unchanged because version labels are earned by the audit loop.
Status: Fixed in this audit.

ID: F2
Severity: MEDIUM
Surface: relations
Category: Relation quality and current graph targets
Problem: The skill used the deprecated `adjacent` relation and pointed at retired or unavailable skill names from an older/private library surface.
Evidence: Frontmatter referenced `security-scanning`, `design-guide`, `composition-theory`, `color-science`, `visual-design`, `ui-ux`, and `next-best-practices`; the relation key was `adjacent` instead of current `related`.
Required action: Replaced the relation graph with current `related`, `boundary`, and `verify_with` edges that point at available skills such as `code-review`, `owasp-security`, `a11y`, `testing-strategy`, `design-system-architecture`, `color-system-design`, `typography-system`, `skill-scaffold`, and `agent-eval-design`.
Status: Fixed in this audit.

ID: F3
Severity: MEDIUM
Surface: content
Category: Eval and protocol drift
Problem: The body still taught the retired generic eval surface and the frontmatter claimed the retired protocol label.
Evidence: The AI/LLM table said "Every skill has evals.json with 7+ scenarios"; `skill_graph_protocol` was `Skill Metadata Protocol v6`.
Required action: Updated eval guidance to the current `evals/comprehension.json` and `evals/application.json` split, and updated the protocol label to `Skill Metadata Protocol v8`.
Status: Fixed in this audit.

ID: F4
Severity: LOW
Surface: portability
Category: Private/project-specific residue
Problem: Some portable-skill wording still named Sales Hub-specific standards and private retired skill names where a public/current skill relation should be used.
Evidence: Accessibility guidance hard-coded "Sales Hub enforces 44x44px"; boundary rows mentioned `nextauth-patterns`, `security-scanning`, `gdpr-compliance`, `code-logic`, `design-guide`, `composition-theory`, `typography`, `color-science`, and `craft-doctrine`.
Required action: Reworded target-size guidance to follow the stricter project standard when applicable and replaced private/retired boundary targets with current public skills.
Status: Fixed in this audit.

ID: F5
Severity: NONE
Surface: behavior
Category: Behavior Gate
Problem: No graded application eval was run in this CONTENT pass.
Evidence: `audit-state.json` remains `comprehension_verdict: UNVERIFIED` and `application_verdict: UNVERIFIED`; the audit command ran without `--graded`.
Required action: Leave Behavior Gate as UNVERIFIED until a graded comprehension/application eval run exists.
Status: Deferred by audit-loop maturity, not a skill defect.

## Required Fixes

All content fixes identified in this audit were applied. Behavior certification remains UNVERIFIED because no graded eval was run.
