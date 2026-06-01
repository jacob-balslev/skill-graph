# Audit Findings

## Skill

`taxonomy-design`

## Audit Date

2026-06-01

## Verdict Summary

PASS_WITH_FIXES

## Findings

ID: F1
Severity: P2
Surface: ../skills/skills/knowledge-organization/taxonomy-design/SKILL.md:1:1
Category: Lint diagnostic
Problem: 4 top-level field(s) are missing field-purpose comments required by the Skill Metadata Protocol inline-comment convention.
Evidence: `node bin/skill-graph.js lint taxonomy-design` emits this warning against line 1.
Required action: Run the field-purpose comment backfill or edit comments in a CONTENT-mode improvement pass, then rerun lint.

ID: F2
Severity: P2
Surface: ../skills/skills/knowledge-organization/taxonomy-design/SKILL.md metadata comments
Category: Sidecar-era metadata comments
Problem: The skill still carries comment-only guidance for sidecar-owned audit/eval/provenance fields inside `SKILL.md`, even though ADR-0019 moved those fields to `audit-state.json`.
Evidence: `schema_version`, `version`, `owner`, `freshness`, `drift_check`, and Health Block guidance appear as comments in the skill body; actual values live in `../skills/skills/knowledge-organization/taxonomy-design/audit-state.json`.
Required action: Remove or rewrite sidecar-owned comment blocks during a CONTENT-mode improvement so authors are not steered toward editing loop-owned state in frontmatter.

ID: F3
Severity: P2
Surface: ../skills/skills/knowledge-organization/taxonomy-design/SKILL.md relations comment
Category: Relation vocabulary comment
Problem: The inline `relations` comment says there are "Six edge types" and omits `disjoint_with`, while the current protocol names seven current relation fields plus the deprecated `adjacent` alias.
Evidence: The authored relation values are semantically sound, but the field-purpose comment is stale after the current relation vocabulary settled.
Required action: Update the `relations` comment in CONTENT mode to match the current protocol vocabulary.

ID: F4
Severity: P2
Surface: evals
Category: Behavior Gate coverage
Problem: `eval_artifacts` is `planned`, `eval_state` is `unverified`, `routing_eval` is `absent`, and no eval files exist under the skill directory.
Evidence: `find ../skills/skills/knowledge-organization/taxonomy-design -maxdepth 3 -type f` returns only `SKILL.md` and `audit-state.json`.
Required action: Add evals that test facet-vs-tree choices, SKOS broader/narrower use, duplicate-category cleanup, and false positives that should route to ontology, knowledge modeling, semantic relations, or information architecture.

ID: F5
Severity: INFO
Surface: activation
Category: Activation quality
Problem: No activation defect found.
Evidence: Description, keywords, examples, and anti-examples name category trees, facets, SKOS hierarchy, controlled vocabulary, duplicate cleanup, and clear near misses.
Required action: No action required.

ID: F6
Severity: INFO
Surface: relations
Category: Relation quality
Problem: No relation-target defect found.
Evidence: Boundaries to `ontology-modeling`, `knowledge-modeling`, and `semantic-relations` mirror the skill's Do NOT Use When table; `depends_on` and `verify_with` point to `semantic-relations`, which is appropriate for SKOS-grade edge checks.
Required action: No action required beyond F3's stale relation-vocabulary comment.

ID: F7
Severity: INFO
Surface: content and portability
Category: Content/portability
Problem: No content or portability defect found.
Evidence: The skill includes Coverage, Philosophy, Method, Verification, Do NOT Use When, and strong sources; it is `deployment_target: portable`, drift reports `UNGROUNDED`, and audit-state records scripted export readiness.
Required action: No action required.

## Required Fixes

- F1 [P2]: add missing field-purpose comments or run the backfill in CONTENT mode.
- F2 [P2]: remove or rewrite sidecar-owned comment-only guidance from `SKILL.md`.
- F3 [P2]: update the relation-vocabulary comment to include `disjoint_with` and the deprecated `adjacent` alias.
- F4 [P2]: add behavior/routing eval coverage before claiming Behavior Gate certification.
