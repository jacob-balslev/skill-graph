# Audit Verdict

## Skill

`context-graph`

## Audit Date

2026-06-01

## Integrity Gate

PASS_WITH_FIXES

## Behavior Gate

UNVERIFIED

## Rationale

`context-graph` initially failed deterministic lint because sidecar-owned state still lived in `SKILL.md`. This audit pass moved those fields into `audit-state.json`, restored the required `scope` field, removed the deprecated nested `concept` block, and reran the audit loop. The repaired skill now passes deterministic lint with one warning. Drift reports `EXTERNAL_UNHASHED`, so truth remains UNVERIFIED.

The remaining fixes are narrower: missing field-purpose comments, stale relation-vocabulary prose, external truth-source receipt handling, and missing behavior/routing evals.

## Follow-up State

Fixes applied for structural sidecar separation. Fixes deferred for field-purpose comment cleanup, relation-vocabulary prose, external truth-source receipts, and eval authoring. Behavior Gate remains UNVERIFIED until graded application/routing evals exist and run.
