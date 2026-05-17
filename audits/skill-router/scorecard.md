# Scorecard

## Skill

`skill-router`

## Audit Date

2026-05-18

## Dimensions

| Dimension | Score | Note |
|---|---|---|
| Metadata validity | 4 | lint passes clean from skill-graph workspace; 2 stale metadata fields (protocol label v5→v6, scope/grounding_mode tension) |
| Activation quality | 5 | description specific, 25 targeted keywords, trigger label present, realistic examples and anti-examples |
| Relation quality | 5 | boundary crisp at 4 skills; verify_with appropriate; routing eval 7/7 confirms boundary exclusions work |
| Grounding fidelity | 4 | truth sources exist and hashed; routing eval passes; scope:portable + grounding_mode:repo_specific is in tension |
| Content quality | 5 | Coverage, Philosophy, Routing Rules table, Fallback, Do NOT Use When — all present and substantive |
| Eval quality | 5 | both eval files present; routing eval 7/7 PASS; cases cover dispatch, boundaries, and coverage-gap |
| Portability quality | 4 | marketplace export exists; scope tension (F2) limits cross-context use in practice |

**Overall: PASS WITH FIXES** — P0=0, P1=0, P2=1 (tool bug, not skill defect), P3=2, P4=1
