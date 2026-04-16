# Findings

## Skill

`documentation`

## Verdict Summary

PASS WITH FIXES

## Findings

ID: F1
Severity: P2
Surface: frontmatter
Problem: `relations.verify_with: [a11y]` is semantically incorrect.
Evidence: `skills/documentation/SKILL.md` lists `verify_with: [a11y]`. Per `docs/metadata-contract.md § relations`, `verify_with` names verification or co-loading candidates. Accessibility is not a verification surface for general technical documentation; the relation is ornamental.
Required action: Remove `a11y` from `verify_with`. Either leave `verify_with` empty or add a genuine verification partner such as `testing-strategy` if a doc-test story is in scope.

ID: F2
Severity: P2
Surface: body
Problem: `## Coverage` is a single paragraph rather than a bulleted topic list.
Evidence: The Coverage section contains one line: "Document type selection, audience fit, progressive disclosure, and docs-as-code discipline." Per `docs/metadata-contract.md § Semantic layer discipline`, non-trivial skills should have at least four bulleted topics.
Required action: Expand Coverage into a bulleted scope map with at least four distinct topics (document type selection, audience fit, progressive disclosure, docs-as-code workflow, information architecture, revision and freshness).

ID: F3
Severity: P3
Surface: frontmatter
Problem: `eval_status: pending` with no eval artifact anywhere for this skill.
Evidence: No eval file exists under `examples/evals/` naming `documentation`, nor alongside `skills/documentation/SKILL.md`. Per the contract, `pending` is a temporary state — this is a low-severity drift flag, not a blocker.
Required action: Either author a `documentation` eval artifact or keep `pending` as an explicit "planned" state until the starter pack eval work begins.

ID: F4
Severity: P3
Surface: body
Problem: `## Do NOT Use When` only lists a single negative route.
Evidence: Only the `debugging` negative route is listed. `a11y` and `refactor` are plausible adjacent routes that should also be disambiguated.
Required action: Add one or two additional negative routes (e.g., `documentation` vs `a11y` when the question is about interaction behavior, `documentation` vs `refactor` when the task is behavior-preserving code cleanup).

## Required Fixes

1. Remove `a11y` from `skills/documentation/SKILL.md` `verify_with`.
2. Expand `## Coverage` into a bulleted topic list with at least four entries.
3. Decide on the `eval_status` direction: author an eval artifact, or keep `pending` as a deliberate placeholder.
4. Broaden `## Do NOT Use When` with at least one additional negative-routing row.
