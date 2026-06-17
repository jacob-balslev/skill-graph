# Verdict

## Skill

`principled-negotiation`

## Audit Date

2026-05-31

## Integrity Gate

PASS

Evidence:

- Canonical focused lint passed with 0 errors and 0 warnings.
- Required v8 fields are present: `subject`, `deployment_target`, `scope`, capped `keywords`, typed `relations`, grounding, lifecycle, and Health Block fields.
- Local reference files are present and hash-recorded.
- Audit artifacts exist under `skill-graph/audits/principled-negotiation/`.

## Behavior Gate

UNVERIFIED

Evidence:

- Comprehension eval ran and produced `comprehension_verdict: SKIPPED_BASELINE_HIGH`, `eval_score: 4.38`, and `eval_failed_ids: []`.
- Application-style eval cases are authored, but a certifying application grader run was not executed, so `application_verdict` correctly remains `UNVERIFIED`.

## Rationale

The skill is ready as a newly created portable meta-methods skill. It teaches the Fisher/Ury/Patton principled-negotiation method as an agent workflow: separate relationship/process issues from substance, convert positions into interests, create option packages, use objective criteria, define BATNA/reservation value/ZOPA, and decide whether to accept, improve, pause, or walk away. Boundaries are explicit for expected-value analysis, business strategy, positioning, management feedback, legal advice, crisis negotiation, and persuasion copy.

The remaining limitation is not a content defect. It is the current Skill Audit Loop maturity boundary: no certifying application grader run was performed during this automation, so behavior certification stays unpromoted.

## Follow-up State

No fixes required. Keep `application_verdict: UNVERIFIED` until a certifying application eval run is scheduled.
