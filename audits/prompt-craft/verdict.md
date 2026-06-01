# Verdict

## Skill

`prompt-craft`

## Audit Date

2026-06-01

## Integrity Gate

PASS

## Behavior Gate

UNVERIFIED

## Rationale

`prompt-craft` now conforms to the v8 structural contract: the skill has required classification fields, sidecar-owned audit fields live in `audit-state.json`, keywords respect the v8 cap, relation comments match the current relation vocabulary, the deprecated nested `concept` block is gone, and the local comprehension eval artifact exists. Lint, field-shape normalization, markdown links, JSON parsing, and the audit runner all pass for the completed repair.

Truth certification remains UNVERIFIED because the skill's source list is composed of public external URLs that `skill-graph-drift.js` intentionally marks `EXTERNAL_UNHASHED`. Behavior certification also remains UNVERIFIED because no graded comprehension or application eval was run.

## Follow-up State

Fixes applied. Do not promote `truth_verdict`, `comprehension_verdict`, or `application_verdict` until hashable source-review receipts or graded eval receipts exist.
