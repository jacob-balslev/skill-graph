# Findings

## Skill

`information-architecture`

## Audit Date

2026-06-01

## Verdict Summary

PASS for structural Integrity Gate; truth and Behavior Gate remain UNVERIFIED because no local truth-source baseline or graded application eval was run.

## Findings

ID: F1
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/frontend-ui/information-architecture/SKILL.md`
Category: Metadata validity
Problem: The skill carried sidecar-owned audit/eval/provenance fields in `SKILL.md`, used stale Health Block wording, and still labeled its export provenance as `Skill Metadata Protocol v5`.
Evidence: Before repair, `node scripts/normalize-skill-field-shape.js --report --skill information-architecture` reported 16 fields to relocate; `node bin/skill-graph.js lint information-architecture` reported 16 errors and 1 warning.
Required action: Move loop-owned fields into `audit-state.json`, add field-purpose comments, update the protocol label and Audit Status wording, and re-run lint.
Status: remediated — lint now passes with 0 errors and 0 warnings, and normalization reports 0 remaining work.

ID: F2
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/frontend-ui/information-architecture/SKILL.md` relation metadata
Category: Relation quality
Problem: The relation comment still described the older six-edge relation vocabulary and pending `boundary` rename.
Evidence: Pre-repair metadata said "Six edge types" and "rename to `suppresses` pending ADR-0018".
Required action: Refresh the relation comment to the current relation field set and keep boundary reason text in ownership form.
Status: remediated.

ID: F3
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/frontend-ui/information-architecture/evals/comprehension.json`
Category: Eval artifact coverage
Problem: The canonical skill declared eval artifacts but had no local comprehension eval under its skill directory.
Evidence: Before repair, the skill directory contained only `SKILL.md`; eval coverage depended on the legacy `examples/evals/information-architecture.json` fixture.
Required action: Add a local comprehension eval covering definition, mental model, boundaries, misconception, and application.
Status: remediated — the new local eval exists and parses as JSON.

ID: F4
Severity: LOW
Surface: `/Users/jacobbalslev/Development/skills/skills/frontend-ui/information-architecture/audit-state.json`
Category: Truth verdict honesty
Problem: The drift sentinel reports `UNGROUNDED` because this portable skill declares no local truth sources. That is not hash-backed truth evidence.
Evidence: `node scripts/skill-graph-drift.js --json ../skills/skills/frontend-ui/information-architecture` reports `status: "UNGROUNDED"` with `details: "no truth_sources declared"`.
Required action: Leave `truth_verdict` as `UNVERIFIED` unless future work adds truth sources or a graded truth review with evidence.
Status: remediated — sidecar truth verdict is `UNVERIFIED`.

ID: F5
Severity: INFO
Surface: `/Users/jacobbalslev/Development/skills/skills/frontend-ui/information-architecture/audit-state.json`
Category: Behavior Gate
Problem: No graded comprehension or application run was executed, so behavior certification cannot be claimed.
Evidence: `node bin/skill-graph.js audit information-architecture --force` ran in Integrity-only mode and said to re-run with `--graded` to populate behavior verdicts.
Required action: Leave `comprehension_verdict` and `application_verdict` as `UNVERIFIED` until a graded run produces receipts.
Status: accepted.

## Verification Evidence

- `node bin/skill-graph.js lint information-architecture` — PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill information-architecture` — 0 fields to relocate, 0 semantic debt fields.
- `node scripts/check-markdown-links.js ../skills/skills/frontend-ui/information-architecture/SKILL.md` — OK.
- `node -e "JSON.parse(...audit-state.json); JSON.parse(...evals/comprehension.json)"` — JSON OK.
- `node scripts/skill-graph-drift.js --json ../skills/skills/frontend-ui/information-architecture` — `UNGROUNDED`, no truth sources declared.
- `node bin/skill-graph.js audit information-architecture --force` — Integrity-only audit ran lint PASS and drift UNGROUNDED.
