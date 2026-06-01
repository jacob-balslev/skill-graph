# Audit Findings

## Skill

`context-graph`

## Audit Date

2026-06-01

## Verdict Summary

PASS_WITH_FIXES

## Findings

ID: F1
Severity: P2
Surface: ../skills/skills/agent-ops/context-graph/SKILL.md:1:1
Category: Lint diagnostic
Problem: 4 top-level field(s) are missing field-purpose comments required by the Skill Metadata Protocol inline-comment convention.
Evidence: `node bin/skill-graph.js lint context-graph` emits this warning against line 1 after the structural repair.
Required action: Run the field-purpose comment backfill or edit comments in a CONTENT-mode improvement pass, then rerun lint.

ID: F2
Severity: P2
Surface: ../skills/skills/agent-ops/context-graph/SKILL.md relations/body prose
Category: Relation vocabulary drift
Problem: The skill still teaches an older relation vocabulary in comments and body prose. Its inline `relations` comment says "Six edge types," and the Coverage section says the skill graph uses three edge types: `adjacent`, `boundary`, and `verify_with`.
Evidence: Current protocol uses `related`, `boundary`, `verify_with`, `depends_on`, `broader`, `narrower`, and `disjoint_with`, with `adjacent` retained only as a deprecated alias of `related`.
Required action: Update the relation-vocabulary prose in a CONTENT-mode improvement so the skill teaches the current graph edge set.

ID: F3
Severity: P3
Surface: grounding.truth_sources
Category: Truth-source verification
Problem: The skill declares external GitHub URL truth sources, but drift reports `EXTERNAL_UNHASHED`; the audit-state truth verdict remains `UNVERIFIED`.
Evidence: `node bin/skill-graph.js audit context-graph --force` reports `drift: EXTERNAL_UNHASHED`; `audit-state.json` records `truth_verdict: UNVERIFIED`.
Required action: Either convert truth sources to local hashable paths or keep truth certification UNVERIFIED and treat the URLs as citation context.

ID: F4
Severity: P2
Surface: evals
Category: Behavior Gate coverage
Problem: `eval_artifacts` is `planned`, `eval_state` is `unverified`, `routing_eval` is `absent`, and no eval files exist under the skill directory.
Evidence: The skill directory contains `SKILL.md` and `audit-state.json`; no `evals/` directory is present.
Required action: Add evals that test graph-health diagnosis, orphan detection, edge-density judgment, and false positives that should route to `skill-router`, `skill-infrastructure`, `skill-scaffold`, `context-window`, or `context-management`.

ID: F5
Severity: INFO
Surface: activation
Category: Activation quality
Problem: No activation defect found.
Evidence: Description, examples, anti-examples, and keywords name multi-graph context architecture, orphan detection, graph connectivity, deterministic synthesis, and near-miss owners.
Required action: No action required.

ID: F6
Severity: INFO
Surface: relations
Category: Relation target quality
Problem: No relation-target defect found.
Evidence: Boundaries to `skill-router`, `skill-infrastructure`, and `skill-scaffold` are semantically crisp; `verify_with` points to `skill-infrastructure`, which is the correct implementation cross-check.
Required action: No action required beyond F2's stale relation-vocabulary prose.

## Fixed During This Audit Pass

- Removed sidecar-owned fields from `SKILL.md`: `schema_version`, `version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, `comprehension_state`, `portability`, `lifecycle`, `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `last_audited`, and `lint_verdict`.
- Removed the deprecated nested `concept` block because the five flat Understanding fields are already present.
- Restored the required frontmatter `scope` field that the deterministic `--fix` pass dropped.
- Populated `audit-state.json` with the loop-owned sidecar fields and reran the audit loop; lint moved from FAIL to PASS with one warning.

## Required Fixes

- F1 [P2]: add missing field-purpose comments or run the backfill in CONTENT mode.
- F2 [P2]: update relation-vocabulary prose to the current protocol.
- F3 [P3]: keep truth certification UNVERIFIED until external or local truth-source receipts can be verified.
- F4 [P2]: add behavior/routing eval coverage before claiming Behavior Gate certification.
