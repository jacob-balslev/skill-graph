# Scorecard

## Skill

`hooked-model`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Focused lint passes with 0 errors and 0 warnings. Required v8 fields, sidecar, understanding fields, and relation targets are accepted. |
| Activation quality | 5 | `routing-eval --skill hooked-model` passes 11/11 examples and anti-examples with `routing_eval: present`. |
| Relation quality | 4 | Same-subject `suppresses` edges cover Lean Startup, Kano, and STP; cross-subject boundaries are represented as related/verification context rather than suppressions. |
| Grounding fidelity | 4 | Official Hooked and Fogg sources plus local source notes are present; `truth_verdict` stays `UNVERIFIED` because drift returned `NO_BASELINE`. |
| Content quality | 5 | Body includes the required sections, workflow, decision tables, output shapes, ethics checklist, verification checklist, and explicit negative bounds. |
| Eval quality | 4 | Eight comprehension cases and seven application cases include positives, hard negatives, and ethics boundaries. Behavior is positive but capped to `PROVISIONAL` until a certifying calibrated run. |
| Portability quality | 4 | Scratch export and export verification passed. Canonical marketplace staging was not regenerated in this CONTENT pass, so publication staging remains pending. |

## Overall

Score: 4/5.

The skill is created and usable with strong structural, routing, and provisional behavior evidence. It stops short of 5 because truth certification and application certification are intentionally not overclaimed, and canonical marketplace staging remains stale until a publication/export pass updates generated files.
