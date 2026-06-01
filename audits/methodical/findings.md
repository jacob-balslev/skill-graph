# Findings

## Skill

`methodical`

## Audit Date

2026-06-01

## Verdict Summary

PASS for structural Integrity Gate; truth and Behavior Gate remain UNVERIFIED because no truth sources are declared for hash-based drift and no graded application eval was run.

## Findings

ID: F1
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/methodical/SKILL.md`
Category: Metadata validity
Problem: The skill carried sidecar-owned fields in `SKILL.md` rather than `audit-state.json`.
Evidence: Before repair, `node scripts/normalize-skill-field-shape.js --report --skill methodical` reported 16 fields to relocate; `node bin/skill-graph.js lint methodical` reported 16 errors and 1 warning.
Required action: Move loop-owned fields to `audit-state.json`, add missing field-purpose comments, and re-run lint.
Status: remediated — lint now passes with 0 errors and 0 warnings, and normalization reports 0 remaining work.

ID: F2
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/methodical/SKILL.md` relations
Category: Relation quality
Problem: The relation graph used the deprecated `adjacent` alias, stale six-edge comments, and several non-existent target skills: `self-review-pattern`, `editorial-standards`, `quality-doctrine`, `self-evaluation`, `task-execution`, and `agent-governance`.
Evidence: Pre-repair relations named those targets; `find /Users/jacobbalslev/Development/skills/skills -path "*/<skill>/SKILL.md"` found only `methodology`, `summarization`, and `context-management` among the old target list.
Required action: Replace `adjacent` with `related`, update comments to the current relation vocabulary, and retarget boundaries/verification edges to live skills.
Status: remediated — relations now use live targets: `methodology`, `best-practice`, `epistemic-grounding`, `evaluation`, `prioritization`, `task-path-optimization`, `summarization`, and `context-management`.

ID: F3
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/methodical/SKILL.md` body
Category: Boundary quality
Problem: The skill body told agents to route adjacent work to missing skills, including `quality-doctrine`, `self-review-pattern`, `task-execution`, and `no-cutting-corners`.
Evidence: Pre-repair description, Concept Card, Trio Boundaries, Key Files, and Do NOT Use When sections referenced those missing skills/paths.
Required action: Reword body boundaries to use real live skills or explicit out-of-scope language.
Status: remediated.

ID: F4
Severity: LOW
Surface: `node scripts/skill-graph-drift.js --json ../skills/skills/meta-methods/methodical`
Category: Drift sentinel limitation
Problem: The skill has bibliographic/source claims in the body but no declared `grounding.truth_sources`, so the drift sentinel has no hashable baseline.
Evidence: Drift output reports `status: "UNGROUNDED"` with `details: "no truth_sources declared"`.
Required action: Leave `truth_verdict` as `UNVERIFIED` until the skill declares hashable truth sources or a graded source-review receipt exists.
Status: accepted.

ID: F5
Severity: INFO
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/methodical/evals`
Category: Behavior Gate
Problem: Eval files exist and parse, but no graded comprehension or application run was executed, so behavior certification cannot be claimed.
Evidence: `node bin/skill-graph.js audit methodical --force` ran in Integrity-only mode and said to re-run with `--graded` to populate behavior verdicts.
Required action: Leave `comprehension_verdict` and `application_verdict` as `UNVERIFIED` until a graded run produces receipts.
Status: accepted.

## Verification Evidence

- `node bin/skill-graph.js lint methodical` — PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill methodical` — 0 fields to relocate, 0 semantic debt fields.
- `node scripts/check-markdown-links.js ../skills/skills/meta-methods/methodical/SKILL.md` — OK.
- `node -e "JSON.parse(...audit-state.json); JSON.parse(...evals/*.json)"` — JSON OK.
- `node scripts/skill-graph-drift.js --json ../skills/skills/meta-methods/methodical` — `UNGROUNDED` because no truth sources are declared.
- `node bin/skill-graph.js audit methodical --force` — Integrity-only audit ran lint PASS and drift UNGROUNDED; audit runner kept Audit Status sidecar current.
