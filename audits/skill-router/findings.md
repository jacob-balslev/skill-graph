# Audit Findings

## Skill

`skill-router`

## Audit Date

2026-06-01

## Verdict Summary

PASS_WITH_FIXES

## Findings

ID: F1
Severity: P2
Surface: ../skills/skills/agent-ops/skill-router/SKILL.md:1:1
Category: Lint diagnostic
Problem: 5 top-level field(s) are missing field-purpose comments required by the Skill Metadata Protocol inline-comment convention.
Evidence: `node bin/skill-graph.js lint skill-router` emits this warning against line 1 after the sidecar repair and content updates.
Required action: Run the field-purpose comment backfill or edit comments in a CONTENT-mode improvement pass, then rerun lint.

ID: F2
Severity: P1
Surface: grounding.truth_sources / audit-state.json drift_check.truth_source_hashes
Category: Truth-source drift
Problem: The skill is grounded in the Skill Graph routing implementation and routing eval fixtures, but recorded hashes no longer match several current files.
Evidence: `node bin/skill-graph.js audit skill-router --force` reports `drift: DRIFT`. `node scripts/skill-graph-drift.js` reports drift for `scripts/skill-graph-route.js`, `scripts/skill-graph-routing-eval.js`, and `examples/evals/skill-router.json`.
Required action: Re-ground the skill against current routing code and fixtures, update any stale claims, then record fresh truth-source hashes.

ID: F3
Severity: P1
Surface: SKILL.md / audit-state.json field placement
Category: Sidecar split
Problem: The skill started this audit with loop-owned audit/eval/provenance fields in `SKILL.md` instead of the sibling `audit-state.json` sidecar.
Evidence: `node scripts/normalize-skill-field-shape.js --report --skill skill-router` reported 15 fields to relocate.
Required action: Fixed during this pass: moved loop-owned fields into `audit-state.json` and reran the audit loop.

ID: F4
Severity: P1
Surface: Description, Coverage, Routing Rules, tiebreaker sections
Category: Retired routing model
Problem: The skill still taught retired `scope`/`type` tiebreakers (`scope: codebase`, `type: workflow`, `schema_version: 2`) even though the current router uses v8 project fit, relation expansion/exclusion, eval-state quality gates, and lifecycle staleness annotations.
Evidence: Before this pass the description and body named `scope/type` tiebreakers; the Routing Rules section ranked keyword ties with `scope` then `type`; the Scope and Type tiebreaker sections documented retired enums.
Required action: Fixed during this pass: rewrote those sections around `deployment_target`, `project[]` / `repo[]`, `relations.depends_on`, `relations.verify_with`, `relations.boundary`, `relations.disjoint_with`, `eval_state`, and `lifecycle.stale_after_days`.

ID: F5
Severity: P2
Surface: metadata.keywords and relation comments
Category: Activation and relation hygiene
Problem: The keyword list exceeded the current v8 cap and the inline relation comment still said "Six edge types" while omitting `disjoint_with`.
Evidence: The pre-fix keyword string contained more than 10 terms; relation prose lagged the current relation vocabulary.
Required action: Fixed during this pass: reduced keywords to 10 high-signal phrases and updated the relation comment to the current relation vocabulary.

ID: F6
Severity: P2
Surface: evals / audit-state.json
Category: Behavior Gate coverage
Problem: Routing and application eval artifacts exist, but `application_verdict` remains `UNVERIFIED`; no graded Behavior Gate receipt was produced in this pass.
Evidence: The skill directory contains `evals/application.json`, and `examples/evals/skill-router.json` plus `examples/evals/skill-router.routing.json` exist; `audit-state.json` records `eval_artifacts: present`, `routing_eval: present`, and `application_verdict: UNVERIFIED`.
Required action: Run the graded application eval and keep the Behavior Gate UNVERIFIED until a real grader receipt supports promotion.

ID: F7
Severity: INFO
Surface: activation and boundaries
Category: Activation quality
Problem: No activation defect remains after the keyword trim and boundary wording updates.
Evidence: Description, examples, anti-examples, and boundary relations clearly separate routing unknown/ambiguous requests from known-target skill loading, single-skill graph audits, and skill authoring.
Required action: No action required.

ID: F8
Severity: INFO
Surface: content structure
Category: Content quality
Problem: No content-structure defect remains after the routing-model update.
Evidence: The skill now explains priority surfaces, coverage-gap behavior, project-fit/quality gates, graph expansion/exclusion, eval artifacts, and explicit Do NOT Use When boundaries.
Required action: No action required beyond re-grounding F2 and behavior evidence F6.

## Fixed During This Audit Pass

- Moved 15 sidecar-owned fields from `SKILL.md` into `audit-state.json`.
- Rewrote retired `scope`/`type` tiebreaker guidance around current v8 routing mechanics.
- Reduced keywords to the v8 cap of 10.
- Updated relation-vocabulary prose.
- Updated authoring-boundary wording from the template artifact to `skill-scaffold`.
- Bumped sidecar content version to `1.0.1` and freshness to `2026-06-01`.

## Required Fixes

- F1 [P2]: add missing field-purpose comments or run the backfill in CONTENT mode.
- F2 [P1]: re-ground the skill against current routing code and fixtures, then record fresh hashes.
- F6 [P2]: run graded application evals before claiming Behavior Gate certification.
