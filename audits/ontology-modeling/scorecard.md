# Audit Scorecard

## Skill

`ontology-modeling`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 4 | Lint passes with 1 warning about missing field-purpose comments. |
| Activation quality | 5 | Description, keywords, examples, and anti-examples sharply target formal semantics and route near misses elsewhere. |
| Relation quality | 4 | Relation values are crisp and target the right sibling skills; the inline relation-vocabulary comment is stale. |
| Grounding fidelity | 5 | Portable skill with no project truth-source requirement; drift reports `UNGROUNDED` and the audit-state truth verdict is PASS. |
| Content quality | 5 | Strong coverage, philosophy, method, verification checklist, negative bounds, and authoritative sources. |
| Eval quality | 2 | Eval intent is planned, but no eval files or routing harness coverage exist. |
| Portability quality | 4 | Repo-agnostic guidance with scripted `skill-md` export readiness; stale sidecar comments reduce authoring clarity. |

## Notes

The skill is instructionally strong. The main defects are metadata-comment drift after ADR-0019, relation-vocabulary comment drift after the current `relations` contract settled, and missing Behavior Gate evidence.
