# Scorecard

## Skill

`skill-scaffold`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Lint passes clean after the sidecar split and field-purpose-comment repair. |
| Activation quality | 4 | Trigger phrases, examples, and anti-examples are specific to new-skill authoring; `routing_eval` remains honestly absent until a passing harness run. |
| Relation quality | 4 | Boundaries against `refactor`, `skill-router`, and `skill-infrastructure` use ownership phrasing and match the skill's scope. |
| Grounding fidelity | 3 | Truth sources point at the right current protocol surfaces, but they are external URLs and remain `EXTERNAL_UNHASHED`. |
| Content quality | 4 | Coverage, philosophy, authoring flow, body-structure selection, common mistakes, verification, and negative bounds are practical and current. |
| Eval quality | 2 | Eval intent is declared as planned, but no graded comprehension/application eval artifacts exist yet. |
| Portability quality | 4 | The skill is portable and encoded in Agent Skills-compatible nested frontmatter; grounding is public-URL-based, which is portable but weak for local drift receipts. |

## Notes

Integrity evidence is deterministic: focused lint passes clean, and the audit loop stamped the sidecar. Behavior evidence is not yet available; `application_verdict: UNVERIFIED` remains correct.
