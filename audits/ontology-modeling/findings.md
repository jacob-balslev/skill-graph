# Audit Findings

## Skill

`ontology-modeling`

## Audit Date

2026-06-01

## Verdict Summary

PASS_WITH_FIXES

## Findings

ID: F1
Severity: P2
Surface: ../skills/skills/knowledge-organization/ontology-modeling/SKILL.md:1:1
Category: Lint diagnostic
Problem: 4 top-level field(s) are missing field-purpose comments required by the Skill Metadata Protocol inline-comment convention.
Evidence: `node bin/skill-graph.js lint ontology-modeling` emits this warning against line 1.
Required action: Run the field-purpose comment backfill or edit comments in a CONTENT-mode improvement pass, then rerun lint.

ID: F2
Severity: P2
Surface: ../skills/skills/knowledge-organization/ontology-modeling/SKILL.md:9-34 and 102-114
Category: Sidecar-era metadata comments
Problem: The skill still carries comment-only guidance for `schema_version`, `version`, `owner`, `freshness`, `drift_check`, and the Health Block inside `SKILL.md`, even though ADR-0019 moved those fields to `audit-state.json`.
Evidence: The actual values now live in `../skills/skills/knowledge-organization/ontology-modeling/audit-state.json`; the comments remain in `SKILL.md`.
Required action: Remove or rewrite sidecar-owned comment blocks during a CONTENT-mode improvement so the skill does not teach authors to edit loop-owned state in frontmatter.

ID: F3
Severity: P2
Surface: ../skills/skills/knowledge-organization/ontology-modeling/SKILL.md:60-67
Category: Relation vocabulary comment
Problem: The inline `relations` comment says there are "Six edge types" and omits `disjoint_with`, while the current protocol names seven current relation fields plus the deprecated `adjacent` alias.
Evidence: `relations` values are semantically reasonable, but the field-purpose comment is stale after the v8 relation vocabulary settled.
Required action: Update the `relations` comment in CONTENT mode to match the current protocol vocabulary.

ID: F4
Severity: P2
Surface: evals
Category: Behavior Gate coverage
Problem: `eval_artifacts` is `planned`, `eval_state` is `unverified`, `routing_eval` is `absent`, and no eval files exist under the skill directory.
Evidence: `find ../skills/skills/knowledge-organization/ontology-modeling -maxdepth 3 -type f` returns only `SKILL.md` and `audit-state.json`.
Required action: Add realistic evals that test when ontology modeling should activate, when taxonomy/conceptual/data/knowledge modeling should win instead, and whether application improves a real modeling artifact.

ID: F5
Severity: INFO
Surface: activation
Category: Activation quality
Problem: No activation defect found.
Evidence: The description, keywords, examples, and anti-examples explicitly cover formal semantics, RDF/OWL/JSON-LD/SHACL, class axioms, property domain/range, and near-miss routing to taxonomy, conceptual, data, and knowledge modeling.
Required action: No action required.

ID: F6
Severity: INFO
Surface: relations
Category: Relation quality
Problem: No relation-target defect found.
Evidence: Boundaries to `taxonomy-design`, `conceptual-modeling`, `data-modeling`, and `knowledge-modeling` are mechanistically crisp; `depends_on` and `verify_with` point at `semantic-relations`, which is the right cross-check for typed edge semantics.
Required action: No action required beyond F3's stale relation-vocabulary comment.

ID: F7
Severity: INFO
Surface: grounding and portability
Category: Grounding/portability
Problem: No grounding or portability defect found.
Evidence: The skill is `deployment_target: portable`; drift reports `UNGROUNDED`; `audit-state.json` records scripted export readiness for `skill-md`.
Required action: No action required.

## Required Fixes

- F1 [P2]: add missing field-purpose comments or run the backfill in CONTENT mode.
- F2 [P2]: remove or rewrite sidecar-owned comment-only guidance from `SKILL.md`.
- F3 [P2]: update the relation-vocabulary comment to include `disjoint_with` and the deprecated `adjacent` alias.
- F4 [P2]: add behavior/routing eval coverage before claiming Behavior Gate certification.
