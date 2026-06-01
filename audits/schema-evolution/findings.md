# Findings

## Skill

`schema-evolution`

## Audit Date

2026-06-01

## Findings

ID: F1
Severity: HIGH
Surface: metadata / sidecar
Category: Structural conformance
Problem: `SKILL.md` still carried loop-owned audit/eval state and a deprecated nested `concept` field.
Evidence: `node bin/skill-graph.js lint schema-evolution` reported 16 errors before repair, all from sidecar-only or deprecated fields in `SKILL.md`: `schema_version`, `version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, `comprehension_state`, `concept`, `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `last_audited`, and `lint_verdict`. `node scripts/normalize-skill-field-shape.js --report --skill schema-evolution` identified 15 fields to relocate plus schema-unknown `concept`.
Evidence strength: command-output
Action: FIXED-IN-SESSION in skills commit `9076dbe`; moved loop-owned state to `audit-state.json`, removed `concept`, updated field-purpose comments, and updated the export protocol/path.

ID: F2
Severity: MEDIUM
Surface: grounding
Category: Truth-source coverage
Problem: The skill listed useful Key Sources in the body, but no structured `grounding.truth_sources` existed for drift tooling.
Evidence: `node scripts/skill-graph-drift.js --json ../skills/skills/code-engineering/schema-evolution` returned `status: "UNGROUNDED"` with `details: "no truth_sources declared"` before repair. After repair it returned `EXTERNAL_UNHASHED`, not stale, with five public truth sources: Fowler evolutionary database design, Fowler parallel change, PostgreSQL ALTER TABLE, PostgreSQL CREATE INDEX, and Stripe online migrations.
Evidence strength: command-output + external-source
Action: FIXED-IN-SESSION in skills commit `9076dbe`; added universal `grounding.truth_sources`. Truth remains `UNVERIFIED` because the local drift sentinel cannot hash external URLs.

ID: F3
Severity: MEDIUM
Surface: evals
Category: Comprehension coverage
Problem: The skill declared planned eval artifacts, but no gradeable comprehension eval existed.
Evidence: Before repair, the skill directory contained only `SKILL.md`. After repair, `node -e` parsed `skills/code-engineering/schema-evolution/evals/comprehension.json`, and the eval file contains eight dimension-tagged cases covering definition, mental_model, purpose, boundary, taxonomy, analogy, application, and misconception.
Evidence strength: direct-file-line + command-output
Action: FIXED-IN-SESSION in skills commit `9076dbe`; added `evals/comprehension.json` and set sidecar `eval_artifacts: "present"`.

ID: F4
Severity: NONE
Surface: activation
Category: Activation quality
Problem: No activation defect found.
Evidence: The description names database schema changes over time, expand/contract, zero-downtime rules, backwards/forwards compatibility, deploy ordering, rollback discipline, change-type procedures, dual-write/dual-read transitions, and the boundary from one migration's mechanics. Keywords are capped at 10 and specific. Examples cover column rename, NOT NULL/backfill planning, broken deploy diagnosis, and why drop-column belongs in contract. Anti-examples route mechanical migration execution, schema design, query tuning, and distributed partitioning away from this skill.
Evidence strength: direct-file-line
Action: No fix required.

ID: F5
Severity: NONE
Surface: relations
Category: Graph correctness
Problem: No relation defect found.
Evidence: `relations.related` connects to adjacent data/modeling and database-change skills. `relations.boundary` separates the skill from `data-modeling`, `database-migration`, and `indexing-strategy` by ownership: target schema shape, one-migration mechanics, and index choice versus safe evolution between schema states. `verify_with` points to `data-modeling` and `database-migration`, which are the right cross-checks for target-shape and execution-mechanics claims.
Evidence strength: direct-file-line
Action: No fix required.

ID: F6
Severity: NONE
Surface: content
Category: Content quality
Problem: No content-density defect found.
Evidence: The body has Coverage, Philosophy, an expand/migrate/contract phase diagram, a change-type safety matrix, deploy-ordering rules, explicit contract-entry criteria, a verification checklist, a Do NOT Use table, and Key Sources. The current-source check on 2026-06-01 found the declared sources still support the skill's core claims: evolutionary database design treats database change as versioned, tested migrations; parallel change keeps old and new paths alive during transition; PostgreSQL documents ALTER TABLE and CREATE INDEX options relevant to validation/index safety; Stripe's online-migration case study supports staged expansion, data migration, code migration, and cleanup.
Evidence strength: direct-file-line + external-source
Action: No fix required.

ID: F7
Severity: NONE
Surface: portability
Category: Export safety
Problem: No portability defect found.
Evidence: `deployment_target: portable`, the `scope` is relational-database and deploy-pipeline oriented rather than repo-specific, and the grounding sources are public. No private repo paths, credentials, customer data, or Sales Hub-specific assumptions appear in the skill body or eval file.
Evidence strength: direct-file-line
Action: No fix required.

## Verification Receipts

- `node bin/skill-graph.js lint schema-evolution` -> PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill schema-evolution` -> 0 fields with work.
- `node scripts/skill-graph-drift.js --json ../skills/skills/code-engineering/schema-evolution` -> `EXTERNAL_UNHASHED`, not stale, five external truth sources listed.
- `node scripts/skill/check-version-earned.js skills/skills/code-engineering/schema-evolution/SKILL.md` -> schema version earned.
- `node scripts/check-markdown-links.js ../skills/skills/code-engineering/schema-evolution/SKILL.md` -> OK.
- `node -e` JSON parse for `audit-state.json` and `evals/comprehension.json` -> OK.
- `node scripts/skill/source-truth-catalog.js --skill skills/code-engineering/schema-evolution --deep --json` -> no key files, concept/doctrine skill catalog emitted.
- `node scripts/skill/skill-test-runner.js --skill skills/code-engineering/schema-evolution --json` -> skipped, no key-file tests.
- `node scripts/skill/claim-extractor.js --skill skills/code-engineering/schema-evolution --json` -> 0 repo path/symbol claims.
- `git diff --check -- skills/code-engineering/schema-evolution/SKILL.md skills/code-engineering/schema-evolution/audit-state.json skills/code-engineering/schema-evolution/evals/comprehension.json` -> OK.
