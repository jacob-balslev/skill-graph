# Audit Findings

## Skill

`context-engineering`

## Audit Date

2026-06-01

## Verdict Summary

PASS_WITH_FIXES

## Findings

ID: F1
Severity: P2
Surface: ../skills/skills/agent-ops/context-engineering/SKILL.md:1:1
Category: Lint diagnostic
Problem: 4 top-level field(s) are missing field-purpose comments required by the Skill Metadata Protocol inline-comment convention.
Evidence: `node bin/skill-graph.js lint context-engineering` emits this warning against line 1 after the sidecar repair.
Required action: Run the field-purpose comment backfill or edit comments in a CONTENT-mode improvement pass, then rerun lint.

ID: F2
Severity: P2
Surface: ../skills/skills/agent-ops/context-engineering/SKILL.md metadata comments
Category: Sidecar-era metadata comments
Problem: The skill still carries comment-only guidance for sidecar-owned audit/eval/provenance fields inside `SKILL.md`, even though actual values now live in `audit-state.json`.
Evidence: Comments for `schema_version`, `owner`, `freshness`, `drift_check`, eval status, `comprehension_state`, `portability`, `lifecycle`, and the Health Block remain after normalization.
Required action: Remove or rewrite sidecar-owned comment blocks during a CONTENT-mode improvement.

ID: F3
Severity: P2
Surface: ../skills/skills/agent-ops/context-engineering/SKILL.md relations comment
Category: Relation vocabulary drift
Problem: The inline `relations` comment says there are "Six edge types" and omits `disjoint_with`, while the current protocol names seven current relation fields plus the deprecated `adjacent` alias.
Evidence: The authored relation values are semantically sound, but the field-purpose comment is stale after the current relation vocabulary settled.
Required action: Update the `relations` comment in CONTENT mode to match the current protocol vocabulary.

ID: F4
Severity: P3
Surface: grounding.truth_sources
Category: Truth-source verification
Problem: The skill declares external truth sources, but drift reports `EXTERNAL_UNHASHED`; the audit-state truth verdict remains `UNVERIFIED`.
Evidence: `node bin/skill-graph.js audit context-engineering --force` reports `drift: EXTERNAL_UNHASHED`; `audit-state.json` records `truth_verdict: UNVERIFIED`.
Required action: Either add verifiable external-source receipts or keep truth certification UNVERIFIED.

ID: F5
Severity: P2
Surface: evals
Category: Behavior Gate coverage
Problem: `eval_artifacts` is `planned`, `eval_state` is `unverified`, `routing_eval` is `absent`, and no eval files exist under the skill directory.
Evidence: The skill directory contains `SKILL.md` and `audit-state.json`; no `evals/` directory is present.
Required action: Add evals that test context failure diagnosis, selection-vs-stuffing decisions, compaction/delegation choices, and false positives that should route to `prompt-craft`, `skill-scaffold`, or `skill-router`.

ID: F6
Severity: INFO
Surface: activation
Category: Activation quality
Problem: No activation defect found.
Evidence: Description, keywords, examples, and anti-examples sharply target context payload design and near-miss owners.
Required action: No action required.

ID: F7
Severity: INFO
Surface: content and relations
Category: Content/relation quality
Problem: No content or relation-target defect found beyond F3.
Evidence: The skill contains a clear failure taxonomy, context stack, metrics, compaction/delegation guidance, and crisp boundaries to `prompt-craft`, `skill-scaffold`, and `skill-router`.
Required action: No action required beyond F3's stale relation-vocabulary comment.

## Fixed During This Audit Pass

- Moved 17 sidecar-owned fields from `SKILL.md` into `audit-state.json` with `normalize-skill-field-shape.js`.
- Removed the deprecated nested `concept` block because the five flat Understanding fields are already present.
- Reran the audit loop; lint now passes with one warning.

## Required Fixes

- F1 [P2]: add missing field-purpose comments or run the backfill in CONTENT mode.
- F2 [P2]: remove or rewrite sidecar-owned comment-only guidance from `SKILL.md`.
- F3 [P2]: update relation-vocabulary prose to the current protocol.
- F4 [P3]: keep truth certification UNVERIFIED until external truth-source receipts can be verified.
- F5 [P2]: add behavior/routing eval coverage before claiming Behavior Gate certification.
