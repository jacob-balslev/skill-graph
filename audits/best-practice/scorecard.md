# Scorecard

## Skill

`best-practice`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | `node bin/skill-graph.js lint best-practice` passes with 0 errors and 0 warnings after sidecar split, `scope`, and wrapper field comments. |
| Activation quality | 4 | Description, keywords, examples, and anti-examples now describe broad final-pass quality enforcement and explicit specialist exclusions. |
| Relation quality | 4 | Relations now use current `related`, `boundary`, and `verify_with` targets and avoid retired/private skill names. |
| Grounding fidelity | 4 | The skill is portable, so repo-specific truth-source grounding is not required. Claims are general quality practice plus current Skill Metadata Protocol guidance. |
| Content quality | 4 | The body has broad domain coverage, concrete rule tables, verification checklist, and explicit `Do NOT Use When` boundaries. Some sections remain intentionally broad because this skill is a cross-domain checklist, not a specialist depth guide. |
| Eval quality | 2 | The skill now describes current eval surfaces, but no comprehension/application eval artifacts exist and no graded eval was run. |
| Portability quality | 4 | Portable wording was improved by removing private/retired skill names and making project-specific target-size requirements conditional. |

## Overall

Integrity Gate: PASS

Behavior Gate: UNVERIFIED
