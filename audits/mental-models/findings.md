# Findings

## Skill

`mental-models`

## Audit Date

2026-06-01

## Verdict Summary

PASS for structural Integrity Gate; truth and Behavior Gate remain UNVERIFIED because no truth sources are declared for hash-based drift and no graded application eval was run.

## Findings

ID: F1
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/mental-models/SKILL.md`
Category: Metadata validity
Problem: The skill carried sidecar-owned fields in `SKILL.md`, missed required v8 `scope`, retained a deprecated `concept` block, used `skill_graph_protocol: Skill Metadata Protocol v5`, kept the old `skills/mental-models/SKILL.md` canonical path, and still described audit state as a Health Block.
Evidence: Before repair, `node scripts/normalize-skill-field-shape.js --report --skill mental-models` reported 15 fields to relocate, semantic debt for `scope`, and schema-unknown `concept`; `node bin/skill-graph.js lint mental-models` reported 17 errors and 1 warning.
Required action: Move loop-owned fields to `audit-state.json`, author scope, remove the legacy `concept` block, update protocol/provenance comments after conformance is earned, and re-run lint.
Status: remediated — lint now passes with 0 errors and 0 warnings, and normalization reports 0 remaining work.

ID: F2
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/mental-models/SKILL.md`
Category: Routing boundary
Problem: The skill routed teaching/transmission work to `teaching-patterns`, but no `teaching-patterns` skill exists in the live library.
Evidence: Pre-repair `anti_examples` included "use teaching-patterns" and the Do NOT Use When table listed `teaching-patterns`; `find /Users/jacobbalslev/Development/skills/skills -path '*/teaching-patterns/SKILL.md'` returned no matching skill.
Required action: Remove the non-existent route and mark instructional delivery/curriculum design as out of scope unless a real target skill exists.
Status: remediated.

ID: F3
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/mental-models/SKILL.md` relation metadata
Category: Relation quality
Problem: Relation comments still described the older six-edge vocabulary and pending `boundary` rename instead of the current relation field set.
Evidence: Pre-repair metadata said "Six edge types" and "rename to `suppresses` pending ADR-0018".
Required action: Refresh relation comments to the current relation field set, including `disjoint_with`, and keep boundary reason text in ownership/exclusion form.
Status: remediated.

ID: F4
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/mental-models/evals/comprehension.json`
Category: Eval artifact coverage
Problem: The skill declared eval intent but had no local comprehension eval under its skill directory.
Evidence: Pre-repair sidecar state was `eval_artifacts: planned`; the skill directory contained only `SKILL.md`.
Required action: Add a local comprehension eval covering definition, mental model, boundaries, misconception, and application.
Status: remediated — local eval exists and parses as JSON.

ID: F5
Severity: LOW
Surface: `node scripts/skill-graph-drift.js --json ../skills/skills/meta-methods/mental-models`
Category: Drift sentinel limitation
Problem: The skill has bibliographic key sources in the body but no declared `grounding.truth_sources`, so the zero-dependency drift sentinel has no hashable baseline.
Evidence: Drift output reports `status: "UNGROUNDED"` with `details: "no truth_sources declared"`. The Integrity-only audit command currently stamps truth PASS for this state, so the sidecar was corrected back to `truth_verdict: UNVERIFIED`.
Required action: Leave `truth_verdict` as `UNVERIFIED` until the skill declares hashable truth sources or a graded source-review receipt exists.
Status: accepted.

ID: F6
Severity: INFO
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/mental-models/audit-state.json`
Category: Behavior Gate
Problem: No graded comprehension or application run was executed, so behavior certification cannot be claimed.
Evidence: `node bin/skill-graph.js audit mental-models --force` ran in Integrity-only mode and said to re-run with `--graded` to populate behavior verdicts.
Required action: Leave `comprehension_verdict` and `application_verdict` as `UNVERIFIED` until a graded run produces receipts.
Status: accepted.

## Verification Evidence

- `node bin/skill-graph.js lint mental-models` — PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill mental-models` — 0 fields to relocate, 0 semantic debt fields.
- `node scripts/check-markdown-links.js ../skills/skills/meta-methods/mental-models/SKILL.md` — OK.
- `node -e "JSON.parse(...audit-state.json); JSON.parse(...evals/comprehension.json)"` — JSON OK.
- `node scripts/skill-graph-drift.js --json ../skills/skills/meta-methods/mental-models` — `UNGROUNDED` because no truth sources are declared.
- `node bin/skill-graph.js audit mental-models --force` — Integrity-only audit ran lint PASS and drift UNGROUNDED.
