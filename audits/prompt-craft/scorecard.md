# Scorecard

## Skill

`prompt-craft`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | v8 required fields are present, sidecar-owned fields were relocated, legacy `concept` was removed, and lint passes cleanly. |
| Activation quality | 4 | Description, examples, anti-examples, and capped keywords cover prompt-writing, repair, structured output, injection hardening, and eval-linked iteration without the previous keyword sprawl. |
| Relation quality | 4 | Boundaries distinguish prompt template work from context engineering, eval design, code review, skill authoring, routing, and debugging; relation comments now use the current vocabulary. |
| Grounding fidelity | 3 | Public provider/security sources are declared and appropriate, but the drift sentinel cannot hash external URLs, so source truth remains UNVERIFIED. |
| Content quality | 5 | The body has clear coverage, philosophy, anatomy, boundary tables, output-format discipline, safety guidance, and eval-linked revision workflow. |
| Eval quality | 4 | Local comprehension eval covers definition, mental model, boundaries, misconception, and application; graded execution remains pending. |
| Portability quality | 5 | Skill is provider-agnostic and explicitly tells implementers to verify provider-specific APIs and controls before implementation. |

## Notes

Structural score is complete for this audit pass. Truth and behavior certification are intentionally not promoted because external source hashing and graded application receipts are absent.
