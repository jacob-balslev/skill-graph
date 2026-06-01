# Audit Scorecard

## Skill

`skill-router`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 4 | Repaired to the sidecar shape; lint passes with one field-purpose-comment warning. |
| Activation quality | 4 | Strong trigger, examples, anti-examples, and 10 focused keywords; routing eval is declared present. |
| Relation quality | 4 | Boundary targets are appropriate and relation prose was updated to the current vocabulary. |
| Grounding fidelity | 2 | Routing truth-source hashes are stale, so truth verdict remains DRIFT. |
| Content quality | 4 | Current routing mechanics are now represented; remaining concern is re-grounding against the exact implementation. |
| Eval quality | 3 | Routing/application artifacts exist, but no graded Behavior Gate receipt was produced in this pass. |
| Portability quality | 3 | Useful outside the repo as a model, but intentionally `deployment_target: project` because it is anchored to the Skill Graph routing harness. |

## Notes

The skill is now structurally current and instructionally useful. Re-grounding is the main Integrity Gate follow-up; graded application evidence is the Behavior Gate follow-up.
