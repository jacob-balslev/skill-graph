# Scorecard

## Skill

`architecture-decision-records`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Lint passes clean after the sidecar split, field-purpose comments, and protocol wording repair. |
| Activation quality | 4 | Prompts and anti-prompts clearly distinguish ADRs from docs, code review, framework selection, and contract design. |
| Relation quality | 4 | Boundaries and related skills are semantically appropriate; `verify_with: code-review` is a useful cross-check. |
| Grounding fidelity | 4 | Portable methodology skill; no project-specific grounding required. Drift is `UNGROUNDED`, which is acceptable here. |
| Content quality | 4 | Method, verification, negative bounds, and status decision table give practical ADR guidance. |
| Eval quality | 2 | Eval intent is planned, but no graded eval artifact exists yet. |
| Portability quality | 4 | Guidance is portable across Markdown decision logs and architecture-governance workflows. |

## Notes

Integrity evidence is deterministic: focused lint passes clean and the audit loop stamped the sidecar. Behavior evidence is not yet available; `application_verdict: UNVERIFIED` remains correct.
