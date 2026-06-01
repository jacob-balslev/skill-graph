# Audit Scorecard

## Skill

`context-graph`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 4 | Started as FAIL due sidecar-owned fields in `SKILL.md`; repaired to PASS with one field-purpose-comment warning. |
| Activation quality | 5 | Strong activation surface for multi-graph workspace topology and graph-health diagnostics. |
| Relation quality | 4 | Relation targets are correct; prose still teaches an older edge vocabulary. |
| Grounding fidelity | 3 | External URL truth sources are relevant but drift reports `EXTERNAL_UNHASHED`, so truth remains UNVERIFIED. |
| Content quality | 4 | Strong architecture guidance, but relation-vocabulary prose needs current-protocol cleanup. |
| Eval quality | 2 | Eval intent is planned, but no eval files or routing harness coverage exist. |
| Portability quality | 4 | Portable architecture guidance with scripted `skill-md` export readiness after sidecar repair. |

## Notes

The audit pass materially improved the skill's structural conformance by completing the ADR-0019 split for this skill. Behavior Gate evidence and current relation-vocabulary prose remain the main follow-ups.
