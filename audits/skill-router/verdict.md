# Audit Verdict

## Skill

`skill-router`

## Audit Date

2026-06-01

## Integrity Gate

PASS_WITH_FIXES

## Behavior Gate

UNVERIFIED

## Rationale

`skill-router` started this audit with loop-owned state in `SKILL.md` and with body guidance that still taught retired `scope`/`type` routing tiebreakers. This pass moved loop-owned fields into `audit-state.json`, rewrote the routing explanation around current v8 project-fit, relation-aware, eval-aware, and staleness-aware behavior, reduced the keywords to the v8 cap, and reran the audit loop.

The repaired skill passes deterministic lint with one warning. The truth layer remains DRIFT because routing implementation and fixture hashes are stale.

## Follow-up State

Fixes applied for sidecar separation, routing-model drift, keyword cap, relation-vocabulary prose, and authoring-boundary wording. Fixes deferred for field-purpose comments, truth-source re-grounding, and graded application evals. Behavior Gate remains UNVERIFIED until a real application grader run supports promotion.
