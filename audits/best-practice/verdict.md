# Verdict

## Skill

`best-practice`

## Audit Date

2026-06-01

## Integrity Gate

PASS

## Behavior Gate

UNVERIFIED

## Rationale

`best-practice` now passes the deterministic Skill Metadata Protocol lint gate with 0 errors and 0 warnings. The audit also repaired the sidecar split, added required v8 `scope`, replaced retired relation targets, updated protocol wording to v8, and replaced old `evals.json` guidance with the current comprehension/application eval split.

Truth drift is UNGROUNDED because the skill is a portable cross-domain quality checklist with no project-bound truth-source files. The audit sidecar honestly records `truth_verdict: PASS` for the current integrity pass and keeps both behavior verdicts UNVERIFIED.

## Follow-up State

Fixes applied. Behavior certification remains pending until a graded comprehension/application eval suite exists and passes.
