# Scorecard

## Skill

`a11y`

## Dimensions

| Dimension | Score | Note |
|---|---|---|
| Metadata validity | 5 | auto: lint passes |
| Activation quality | 4 | PASS WITH FIXES — Description names real trigger scenarios and keywords are specific, but the skill has no explicit `triggers` array for label-based routing. |
| Relation quality | 5 | PASS — adjacent and boundary relations are concise and point at real sibling skills; no dangling targets. |
| Grounding fidelity | N/A | N/A — Dimension does not apply to this skill (scope: portable). |
| Content quality | 4 | PASS WITH FIXES — Coverage, Philosophy, and Verification sections are present and concrete, but "Do NOT Use When" boundaries are implicit rather than an explicit named section. |
| Eval quality | 4 | PASS WITH FIXES — Eval artifact ships with seven grounded prompts; boundary coverage is good, but failure-mode prompts are missing. |
| Portability quality | 5 | PASS — Skill is generic, portable, and the skill-md export via scripts/export-skill.js round-trips cleanly. |

> **Note:** Metadata validity is auto-scored from `skill-lint.js`. All other
> dimensions come from the `--graded` grader pass. See `verdict.md` for the
> per-dimension rationale and `findings.md` for the specific finding evidence.
