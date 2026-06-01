# Findings

## Skill

`methodology`

## Audit Date

2026-06-01

## Verdict Summary

PASS for structural Integrity Gate; truth and Behavior Gate remain UNVERIFIED because public methodology sources are external URLs the zero-dependency drift sentinel does not hash, and no graded application eval was run.

## Findings

ID: F1
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/methodology/SKILL.md`
Category: Metadata validity
Problem: The skill carried sidecar-owned fields in `SKILL.md`, missed required v8 `scope`, used `skill_graph_protocol: Skill Metadata Protocol v6`, and described audit state as a Health Block rather than an Audit Status sidecar.
Evidence: Before repair, `node scripts/normalize-skill-field-shape.js --report --skill methodology` reported fields to relocate and semantic debt for `scope`; `node bin/skill-graph.js lint methodology` reported 17 errors and 1 warning.
Required action: Move loop-owned fields to `audit-state.json`, author a v8 scope, update protocol/provenance wording only after conformance is earned, and re-run lint.
Status: remediated - lint now passes with 0 errors and 0 warnings, and normalization reports 0 remaining work.

ID: F2
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/methodology/SKILL.md` relation metadata
Category: Relation quality
Problem: Relation comments still described the older edge vocabulary and pending boundary rename language instead of the current relation field set.
Evidence: Pre-repair relation comments described a stale edge vocabulary; post-repair comments name `related`, `boundary`, `verify_with`, `depends_on`, `broader`, `narrower`, and `disjoint_with`, with the inverse `boundary` mechanic explained in ownership terms.
Required action: Refresh relation comments to the current relation field set and keep boundary reason text in ownership/exclusion form.
Status: remediated.

ID: F3
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/methodology/SKILL.md` truth sources
Category: Grounding fidelity
Problem: The skill has public methodology sources, but they are external URLs without recorded hashes, so the local drift sentinel cannot certify source freshness.
Evidence: `node scripts/skill-graph-drift.js --json ../skills/skills/quality-assurance/methodology` reports `status: "EXTERNAL_UNHASHED"` for the Mills/Cleanroom, SEI TSP/PSP, ASQ DMAIC/PDCA, WHO checklist, NASA IV&V, NASA systems engineering, hypothesis-driven development, and EDDOps sources.
Required action: Keep `truth_verdict: UNVERIFIED` until a hashable source-review receipt or graded source review exists.
Status: accepted - the audit state uses `truth_verdict: UNVERIFIED`.

ID: F4
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/methodology/evals/comprehension.json`
Category: Eval artifact coverage
Problem: The skill had no local comprehension eval artifact under its skill directory.
Evidence: Pre-repair skill directory contained no `evals/comprehension.json`; post-repair JSON parse succeeds and the eval covers definition, mental model, boundaries, misconception correction, and application.
Required action: Add a local comprehension eval with realistic methodology-use prompts, including boundary and failure-case coverage.
Status: remediated.

ID: F5
Severity: INFO
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/methodology/audit-state.json`
Category: Behavior Gate
Problem: No graded comprehension or application run was executed, so behavior certification cannot be claimed.
Evidence: `node bin/skill-graph.js audit methodology --force` ran in Integrity-only mode and said to re-run with `--graded` to populate behavior verdicts.
Required action: Leave `comprehension_verdict` and `application_verdict` as `UNVERIFIED` until a graded run produces receipts.
Status: accepted.

## Verification Evidence

- `node bin/skill-graph.js lint methodology` - PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill methodology` - 0 fields to relocate, 0 semantic debt fields.
- `node scripts/check-markdown-links.js ../skills/skills/quality-assurance/methodology/SKILL.md` - OK.
- `node -e "JSON.parse(...audit-state.json); JSON.parse(...evals/comprehension.json)"` - JSON OK.
- `node scripts/skill-graph-drift.js --json ../skills/skills/quality-assurance/methodology` - `EXTERNAL_UNHASHED` for public external truth sources.
- `node bin/skill-graph.js audit methodology --force` - Integrity-only audit ran lint PASS and drift EXTERNAL_UNHASHED; audit runner kept Audit Status sidecar current.
