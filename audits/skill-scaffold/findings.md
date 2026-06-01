# Findings

## Skill

`skill-scaffold`

## Audit Date

2026-06-01

## Verdict Summary

Integrity Gate: PASS

Behavior Gate: UNVERIFIED

## Findings

ID: F1
Severity: P1
Surface: `../skills/skills/agent-ops/skill-scaffold/SKILL.md` and `../skills/skills/agent-ops/skill-scaffold/audit-state.json`
Category: Contract shape
Problem: The skill still carried audit-loop-owned fields in `metadata` even though the active contract stores audit/eval/provenance state in a sibling `audit-state.json` sidecar.
Evidence: `node scripts/normalize-skill-field-shape.js --report --skill skill-scaffold` reported 17 fields to relocate: `schema_version`, `version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, `last_audited`, `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `lint_verdict`, `comprehension_state`, `portability`, and `lifecycle`.
Required action: Applied. The fields now live in `../skills/skills/agent-ops/skill-scaffold/audit-state.json`; the manifest join and lint gate read the sidecar.

ID: F2
Severity: P2
Surface: `../skills/skills/agent-ops/skill-scaffold/SKILL.md`
Category: Understanding model
Problem: A legacy `concept` reminder survived next to the current flat Understanding fields, which weakened the scaffold's guidance about the retired nested concept block.
Evidence: The pre-fix file had the flat `mental_model`, `purpose`, `boundary`, `analogy`, and `misconception` fields plus a legacy `concept` comment.
Required action: Applied. The legacy `concept` reminder was removed and the body now says the nested block is retired.

ID: F3
Severity: P2
Surface: `../skills/skills/agent-ops/skill-scaffold/SKILL.md`
Category: Stale authoring guidance
Problem: The scaffold still taught parts of the retired v7-era authoring model: old archetype language, a wrong protocol-doc path, stale `v6+` wording, and older routing-eval command text.
Evidence: Pre-fix matches included `v6+ Understanding fields`, `~/Development/skill-graph/SKILL_METADATA_PROTOCOL.md`, `type: capability / workflow / router / overlay`, and `node scripts/skill-graph-routing-eval.js --skill <name>`.
Required action: Applied. The scaffold now teaches `subject`, `deployment_target`, free-text `scope`, sidecar state, body structure chosen by intended use, the current protocol-doc path, and the public CLI routing-eval command.

ID: F4
Severity: P3
Surface: `../skills/skills/agent-ops/skill-scaffold/SKILL.md:1`
Category: Field-purpose comments
Problem: The scaffold itself lacked field-purpose comments for the Agent Skills wrapper fields, creating a contradiction with its own advice to preserve field-purpose comments.
Evidence: `node bin/skill-graph.js lint skill-scaffold` initially reported top-level fields missing field-purpose comments.
Required action: Applied. Comments were added for `name`, `description`, `license`, `compatibility`, `allowed-tools`, and `metadata`; the focused lint now reports 0 errors and 0 warnings.

ID: F5
Severity: Info
Surface: Activation metadata
Category: Activation quality
Problem: No defect found. The trigger surface is specific to new-skill authoring and does not overclaim routing coverage.
Evidence: `description`, `keywords`, `examples`, and `anti_examples` now distinguish new skill authoring from existing-skill refactors, router debugging, library health tooling, and general documentation work. `routing_eval` remains `absent`, which is honest until the harness is run and passes.
Required action: No content fix required.

ID: F6
Severity: P3
Surface: Grounding metadata
Category: Truth-source verification
Problem: The skill's truth sources are public GitHub URLs and therefore cannot be hashed by the local drift sentinel.
Evidence: `node scripts/skill-graph-drift.js` reports `EXTERNAL_UNHASHED skill-scaffold` for `examples/skill-metadata-template.md`, `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`, `schemas/SKILL_METADATA_PROTOCOL_schema.json`, and `skill-metadata-protocol/field-reference.md`.
Required action: Deferred. `truth_verdict: UNVERIFIED` is the honest state unless the skill switches to local truth-source paths or the drift sentinel gains external hashing receipts.

ID: F7
Severity: P2
Surface: Behavior Gate
Category: Eval coverage
Problem: The Behavior Gate remains unverified. `eval_artifacts` is `planned`, but no graded comprehension/application evals were run for this audit.
Evidence: `audit-state.json` keeps `eval_state: unverified`, `comprehension_verdict: UNVERIFIED`, and `application_verdict: UNVERIFIED`; the audit command was run without `--graded`.
Required action: Deferred to a future `evaluate` run with real comprehension/application eval artifacts.

## Verification

- `node bin/skill-graph.js lint skill-scaffold` — PASS, 0 errors, 0 warnings.
- `node bin/skill-graph.js audit skill-scaffold --force` — PASS structural lint, `EXTERNAL_UNHASHED` drift, stamped `truth_verdict: UNVERIFIED`.
