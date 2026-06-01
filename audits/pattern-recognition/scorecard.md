# Scorecard

## Skill

`pattern-recognition`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | v8 required fields are present, sidecar-owned fields were relocated, legacy `concept` was removed, and lint passes cleanly. |
| Activation quality | 5 | Description, keywords, examples, and anti-examples target real recurring-issue, convention-drift, and clustering prompts. |
| Relation quality | 4 | Boundaries distinguish recurrence analysis from one-off debugging and PR review; relation comments now use the current vocabulary. |
| Grounding fidelity | 3 | Bibliographic sources are named in the body, but no hashable `grounding.truth_sources` baseline exists, so truth remains UNVERIFIED. |
| Content quality | 5 | The body has a full recognition loop, detection methods, false-positive discipline, lifecycle states, and explicit negative bounds. |
| Eval quality | 4 | Existing scenario/routing evals plus new comprehension eval cover realistic positives, boundaries, misconception, and application; graded execution remains pending. |
| Portability quality | 5 | Skill is portable and cross-stack; examples are illustrative and not tied to private project assumptions. |

## Notes

Structural score is complete for this audit pass. Truth and behavior certification are intentionally not promoted because hashable truth-source receipts and graded application receipts are absent.
