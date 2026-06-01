# Scorecard

## Skill

`agent-eval-design`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Lint passes clean after adding `scope`, completing the sidecar split, and refreshing relation comments. |
| Activation quality | 4 | Positive and negative prompts are specific to agent eval design and name adjacent owners clearly. |
| Relation quality | 4 | Boundary edges distinguish product testing, library health tooling, live debugging, and code review; related/verify edges are plausible cross-checks. |
| Grounding fidelity | 4 | Portable methodology skill; no project-specific grounding required. Drift is `UNGROUNDED`, which is acceptable here. |
| Content quality | 4 | Method, verification, eval-case matrix, and threshold guidance now give concrete design help. |
| Eval quality | 2 | Eval intent is planned, but no graded eval artifact exists yet. |
| Portability quality | 4 | Guidance is portable across agent workflows and skill libraries; no private project assumptions are embedded. |

## Notes

Integrity evidence is deterministic: focused lint passes clean and the audit loop stamped the sidecar. Behavior evidence is not yet available; `application_verdict: UNVERIFIED` remains correct.
