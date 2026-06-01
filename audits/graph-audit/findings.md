# Findings

## Skill

`graph-audit`

## Audit Date

2026-06-01

## Verdict Summary

PASS for Integrity Gate; Behavior Gate remains UNVERIFIED because no graded application eval was run.

## Findings

ID: F1
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/graph-audit/SKILL.md`
Category: Metadata validity
Problem: The skill still carried loop-owned audit fields in `SKILL.md`, missed required v8 `scope`, used `skill_graph_protocol: Skill Metadata Protocol v5`, and duplicated stale grounding at the top level and inside `metadata`.
Evidence: Before repair, `node scripts/normalize-skill-field-shape.js --report --skill graph-audit` reported 14 fields to relocate and semantic debt for `scope`; `node bin/skill-graph.js lint graph-audit` reported 15 errors and 1 warning.
Required action: Move audit/eval/provenance fields into `audit-state.json`, author `scope`, remove duplicated stale grounding, update the protocol label only after v8 conformance is earned, and re-run lint.
Status: remediated — `node bin/skill-graph.js lint graph-audit` now reports 0 errors and 0 warnings, and normalization reports 0 remaining work.

ID: F2
Severity: HIGH
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/graph-audit/SKILL.md` grounding and body
Category: Grounding fidelity
Problem: Truth sources and body claims still named retired files and contract terms such as `schemas/skill.schema.json`, `docs/skill-metadata-protocol.md`, `scope: codebase`, `domain_object`, and older single-frontmatter assumptions.
Evidence: Pre-repair body and grounding referenced retired paths and v3/v5-era concepts; current repository files are `schemas/SKILL_METADATA_PROTOCOL_schema.json`, `schemas/skill-audit-state.schema.json`, `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`, and the sidecar-backed manifest join.
Required action: Update truth sources, body coverage, key-file table, verification checklist, and grounding vocabulary to the current v8 sidecar contract.
Status: remediated — drift baseline was recorded for the current local truth sources and `node scripts/skill-graph-drift.js --json ../skills/skills/quality-assurance/graph-audit` now reports `status: "OK"`.

ID: F3
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skill-graph/examples/evals/graph-audit.json`
Category: Eval artifact drift
Problem: The repo-grounded eval fixture tested retired schema examples and old skill paths, including v3-era `type`, `browse_category`, old `scope` enum examples, and stale `skills/quality/graph-audit/SKILL.md` truth paths.
Evidence: Pre-repair fixture asked about `schema_version: const 3`, `type: capability`, `browse_category`, `scope: portable`, `scope: codebase`, and old truth-source paths.
Required action: Rewrite the fixture around current v8 `subject`, `deployment_target`, `scope`, sidecar state, manifest joins, relation targets, and gradeable-artifact evidence.
Status: remediated — `examples/evals/graph-audit.json` parses as JSON and now contains eight current repo-grounded cases.

ID: F4
Severity: MEDIUM
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/graph-audit/evals/comprehension.json`
Category: Local comprehension coverage
Problem: The canonical skill had no local comprehension eval even though the audit loop now expects per-skill comprehension artifacts for behavior work.
Evidence: Before repair, `find skills/quality-assurance/graph-audit -maxdepth 3 -type f` showed only `SKILL.md`; sidecar declared `eval_artifacts: present` because of the legacy Skill Graph fixture.
Required action: Add a local comprehension eval covering definition, mental model, boundaries, misconception, and application behavior.
Status: remediated — local `evals/comprehension.json` exists and parses as JSON.

ID: F5
Severity: LOW
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/graph-audit/SKILL.md` relation metadata
Category: Relation quality
Problem: Relation comments still described the older six-edge wording and a pending `boundary` rename; relation neighbors did not clearly distinguish applying graph checks from maintaining health-check tooling or routing between skills.
Evidence: Pre-repair metadata said "Six edge types" and "rename to `suppresses` pending ADR-0018"; relation set lacked `skill-infrastructure` and `skill-router` ownership distinctions.
Required action: Refresh relation comments and add mechanism-level boundaries for `skill-infrastructure`, `skill-router`, `refactor`, `debugging`, and `eval-driven-development`.
Status: remediated.

ID: F6
Severity: INFO
Surface: `/Users/jacobbalslev/Development/skills/skills/quality-assurance/graph-audit/audit-state.json`
Category: Behavior Gate
Problem: No graded comprehension or application run was executed, so behavior certification cannot be claimed.
Evidence: `node bin/skill-graph.js audit graph-audit --force` ran in Integrity-only mode and explicitly said to re-run with `--graded` to populate behavior verdicts.
Required action: Leave `comprehension_verdict` and `application_verdict` as `UNVERIFIED` until a graded run produces receipts.
Status: accepted.

## Verification Evidence

- `node bin/skill-graph.js lint graph-audit` — PASS, 0 errors, 0 warnings.
- `node scripts/normalize-skill-field-shape.js --report --skill graph-audit` — 0 fields to relocate, 0 semantic debt fields.
- `node scripts/check-markdown-links.js ../skills/skills/quality-assurance/graph-audit/SKILL.md` — OK.
- `node -e "JSON.parse(...audit-state.json); JSON.parse(...evals/comprehension.json); JSON.parse(...examples/evals/graph-audit.json)"` — JSON OK.
- `node scripts/skill-graph-drift.js --record --apply ../skills/skills/quality-assurance/graph-audit` — recorded current local truth-source hashes.
- `node scripts/skill-graph-drift.js --json ../skills/skills/quality-assurance/graph-audit` — `status: "OK"`.
- `node bin/skill-graph.js audit graph-audit --force` — Integrity-only audit reports lint PASS and drift OK.
