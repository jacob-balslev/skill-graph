# Verdict

## Skill

`cognitive-load-theory`

## Audit Date

2026-06-01

## Integrity Gate

PASS

## Behavior Gate

UNVERIFIED

## Rationale

`cognitive-load-theory` now passes the deterministic Skill Metadata Protocol lint gate with 0 errors and 0 warnings. The audit repaired the sidecar split, added required v8 `scope`, refreshed relation targets, added flat Understanding fields, created a current `evals/comprehension.json`, removed stale Health Block body duplication, and updated the protocol label to v8.

Truth drift is UNGROUNDED because the skill is portable and the audit command did not hash external academic sources. The local reference file cites Sweller, Paas, van Merrienboer, and Cowan and remains the documented source trail. The sidecar honestly records `truth_verdict: PASS` for this integrity pass while behavior verdicts stay UNVERIFIED.

## Follow-up State

Fixes applied. Behavior certification remains pending until a graded comprehension/application eval run exists and passes.
