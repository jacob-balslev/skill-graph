# Audit Findings

## Skill

`skill-infrastructure`

## Audit Date

2026-06-01

## Verdict Summary

PASS_WITH_FIXES

## Findings

ID: F1
Severity: P2
Surface: ../skills/skills/agent-ops/skill-infrastructure/SKILL.md:1:1
Category: Lint diagnostic
Problem: 5 top-level field(s) are missing field-purpose comments required by the Skill Metadata Protocol inline-comment convention.
Evidence: `node bin/skill-graph.js lint skill-infrastructure` emits this warning against line 1 after the sidecar repair and content updates.
Required action: Run the field-purpose comment backfill or edit comments in a CONTENT-mode improvement pass, then rerun lint.

ID: F2
Severity: P1
Surface: grounding.truth_sources / audit-state.json drift_check.truth_source_hashes
Category: Truth-source drift
Problem: The skill is grounded in Skill Graph implementation files, but the recorded hashes no longer match the current files.
Evidence: `node bin/skill-graph.js audit skill-infrastructure --force` reports `drift: DRIFT`. `node scripts/skill-graph-drift.js` reports drift for `package.json`, `bin/skill-graph.js`, `scripts/skill-lint.js`, `scripts/lib/roots.js`, `scripts/check-protocol-consistency.js`, `scripts/generate-manifest.js`, `scripts/skill-graph-drift.js`, `scripts/skill-graph-routing-eval.js`, and `docs/manifest-field-mapping.md`.
Required action: Re-ground the skill against the current tooling files, update any stale claims, then record fresh truth-source hashes.

ID: F3
Severity: P1
Surface: SKILL.md / audit-state.json field placement
Category: Sidecar split
Problem: The skill started this audit in the pre-ADR-0019 shape: loop-owned audit/eval/provenance fields lived in `SKILL.md`, and the v8-required `scope` field was absent.
Evidence: `node scripts/normalize-skill-field-shape.js --report --skill skill-infrastructure` reported 16 fields to relocate and one semantic-debt field (`scope`).
Required action: Fixed during this pass: moved loop-owned fields into `audit-state.json`, added free-text `scope`, and set sidecar `schema_version` to 8 after the v8 shape was actually present.

ID: F4
Severity: P1
Surface: Skill body
Category: Retired protocol vocabulary
Problem: The body still taught retired v7-era health checks such as `type`, enum-like `scope`, `scope: codebase`, `scope: reference`, and `version` / `owner` / `freshness` as frontmatter-owned fields.
Evidence: The Inventory, Protocol Consistency, Eval Quality, Fixing Invalid Frontmatter, and Anti-Patterns sections used those old field meanings before this pass.
Required action: Fixed during this pass: updated the body to the current `SKILL.md` plus `audit-state.json` split, free-text `scope`, `deployment_target: project` grounding rule, sidecar-owned audit/eval fields, and current schema/reference parity language.

ID: F5
Severity: P2
Surface: metadata.keywords
Category: Activation hygiene
Problem: The skill carried an overlong keyword list, exceeding the current v8 cap and increasing false-positive routing risk.
Evidence: The pre-fix keyword string contained more than 10 terms, including several near-duplicates around routing misses, schema conformance, and audits.
Required action: Fixed during this pass: reduced the keyword list to 10 high-signal activation phrases.

ID: F6
Severity: P2
Surface: metadata.relations comment and boundary reason
Category: Relation vocabulary drift
Problem: The inline relation comment said "Six edge types" and omitted `disjoint_with`; one boundary reason described `graph-audit` with the retired `scope: codebase` wording.
Evidence: The authored relation targets were sound, but the relation prose lagged the current protocol vocabulary and classification model.
Required action: Fixed during this pass: updated the relation comment to the current relation vocabulary and reworded the `graph-audit` boundary reason around the Skill Graph project rather than retired `scope` labels.

ID: F7
Severity: P2
Surface: evals / audit-state.json
Category: Behavior Gate coverage
Problem: Eval files exist and include useful application cases, but no graded run receipt is recorded; `routing_eval` remains `absent` and `application_verdict` remains `UNVERIFIED`.
Evidence: The skill directory contains `evals/evals.json`, `evals/eval-set.json`, and `evals/application.json`; `audit-state.json` records `eval_artifacts: present`, `eval_state: unverified`, `routing_eval: absent`, and `application_verdict: UNVERIFIED`.
Required action: Run the graded application/routing evaluation or keep Behavior Gate certification UNVERIFIED.

ID: F8
Severity: INFO
Surface: activation and boundaries
Category: Activation quality
Problem: No activation defect remains after the keyword trim.
Evidence: The description, examples, anti-examples, and boundary relations clearly separate library-wide health tooling from single-skill scaffolding, project-specific graph audits, and general lint-rule selection.
Required action: No action required.

ID: F9
Severity: INFO
Surface: content structure
Category: Content quality
Problem: No structural content defect remains after the v8 terminology updates.
Evidence: The skill has Coverage, Philosophy, the library-as-database mental model, five health-tooling categories, eval quality patterns, maintenance workflows, anti-patterns, verification checklist, and explicit Do NOT Use When boundaries.
Required action: No action required beyond re-grounding F2 and behavior evidence F7.

## Fixed During This Audit Pass

- Moved 16 sidecar-owned fields from `SKILL.md` into `audit-state.json`.
- Added the required free-text `scope` field and set the sidecar schema version to 8 after the field migration was real.
- Updated stale body guidance from retired v7 field ownership and enum-like `scope` wording to the current `SKILL.md` plus `audit-state.json` model.
- Reduced keywords to the v8 cap of 10.
- Updated relation-vocabulary prose and the `graph-audit` boundary reason.
- Bumped sidecar content version to `1.1.1` and freshness to `2026-06-01` for the content repair.

## Required Fixes

- F1 [P2]: add missing field-purpose comments or run the backfill in CONTENT mode.
- F2 [P1]: re-ground the skill against current Skill Graph tooling files and record fresh hashes.
- F7 [P2]: run graded application/routing evals before claiming Behavior Gate certification.
