# Findings

## Skill

`pattern-recognition`

## Audit Date

2026-06-01

## Verdict Summary

PASS for structural Integrity Gate; truth and Behavior Gate remain UNVERIFIED because no hashable truth-source baseline is declared and no graded application eval was run.

## Findings

ID: F1
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/pattern-recognition/SKILL.md`
Category: Metadata validity
Problem: The skill carried sidecar-owned fields in `SKILL.md`, missed required v8 `scope`, retained a deprecated `concept` block despite having flat Understanding fields, used `skill_graph_protocol: Skill Metadata Protocol v5`, kept an old canonical skill path, and described audit state as a Health Block.
Evidence: Before repair, `node scripts/normalize-skill-field-shape.js --report --skill pattern-recognition` reported 17 fields to relocate, semantic debt for `scope`, and schema-unknown `concept`; `node bin/skill-graph.js lint pattern-recognition` reported 19 errors and 1 warning.
Required action: Move loop-owned fields to `audit-state.json`, author scope, remove the legacy `concept` block, update protocol/provenance comments after conformance is earned, and re-run lint.
Status: remediated - lint now passes with 0 errors and 0 warnings, and normalization reports 0 remaining work.

ID: F2
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/pattern-recognition/SKILL.md` relation metadata
Category: Relation quality
Problem: Relation comments still described the older edge vocabulary and pending `boundary` rename instead of the current relation field set.
Evidence: Pre-repair metadata said "Six edge types" and "rename to `suppresses` pending ADR-0018".
Required action: Refresh relation comments to the current relation field set, including `disjoint_with`, and keep boundary reason text in ownership/exclusion form.
Status: remediated.

ID: F3
Severity: MEDIUM
Surface: `node scripts/skill-graph-drift.js --json ../skills/skills/meta-methods/pattern-recognition`
Category: Drift sentinel limitation
Problem: The skill has bibliographic key sources in the body but no declared `grounding.truth_sources`, so the zero-dependency drift sentinel has no hashable baseline.
Evidence: Drift output reports `status: "UNGROUNDED"` with `details: "no truth_sources declared"`.
Required action: Leave `truth_verdict` as `UNVERIFIED` until the skill declares hashable truth sources or a graded source-review receipt exists.
Status: accepted.

ID: F4
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/pattern-recognition/evals/comprehension.json`
Category: Eval artifact coverage
Problem: The skill had legacy scenario/routing eval artifacts, but no current local comprehension eval artifact under its skill directory.
Evidence: Pre-repair skill directory contained `evals/evals.json` and `evals/eval-set.json`, but no `evals/comprehension.json`; post-repair JSON parse succeeds for all three eval artifacts.
Required action: Add a local comprehension eval covering definition, mental model, boundaries, misconception, and application.
Status: remediated.

ID: F5
Severity: INFO
Surface: `/Users/jacobbalslev/Development/skills/skills/meta-methods/pattern-recognition/audit-state.json`
Category: Behavior Gate
Problem: No graded comprehension or application run was executed, so behavior certification cannot be claimed.
Evidence: `node bin/skill-graph.js audit pattern-recognition --force` ran in Integrity-only mode and said to re-run with `--graded` to populate behavior verdicts.
Required action: Leave `comprehension_verdict` and `application_verdict` as `UNVERIFIED` until a graded run produces receipts.
Status: accepted.

## Verification Evidence

- `node bin/skill-graph.js lint pattern-recognition` - PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill pattern-recognition` - 0 fields to relocate, 0 semantic debt fields.
- `node scripts/check-markdown-links.js ../skills/skills/meta-methods/pattern-recognition/SKILL.md` - OK.
- `node -e "JSON.parse(...audit-state.json); JSON.parse(...evals/*.json)"` - JSON OK.
- `node scripts/skill-graph-drift.js --json ../skills/skills/meta-methods/pattern-recognition` - `UNGROUNDED` because no truth sources are declared.
- `node bin/skill-graph.js audit pattern-recognition --force` - Integrity-only audit ran lint PASS and drift UNGROUNDED; audit runner kept Audit Status sidecar current.
