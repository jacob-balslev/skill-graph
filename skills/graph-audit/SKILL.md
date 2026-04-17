---
schema_version: 1
name: graph-audit
description: "Skill metadata and manifest consistency auditing for the Skill Graph repository. Use when checking that every SKILL.md conforms to the schema, that manifest entries are in sync with authored frontmatter, or that relation targets point at real sibling skills. Do NOT use for general code review or for auditing non-skill files."
version: 1.0.0
type: capability
family: knowledge
scope: operational
owner: maintainer
freshness: "2026-04-17"
drift_check: "2026-04-17"
eval_status: evals
stability: experimental
license: MIT
compatibility: Markdown, JSON Schema, Node.js
allowed-tools: Read Grep Bash
keywords:
  - skill audit
  - manifest audit
  - schema validation
  - skill consistency
  - graph audit
  - metadata check
triggers:
  - graph-audit
relations:
  adjacent:
    - documentation
    - refactor
  verify_with:
    - testing-strategy
grounding:
  domain_object: Skill Graph skill metadata and manifest consistency
  grounding_mode: repo_specific
  truth_sources:
    - schemas/skill.schema.json
    - schemas/manifest.schema.json
    - docs/metadata-contract.md
  failure_modes:
    - schema_drift
    - manifest_sample_out_of_sync
    - broken_relation_targets
    - eval_status_mismatch
  evidence_priority: repo_code_first
portability:
  level: medium
  exports:
    - agent-skills
---

# Graph Audit

## Coverage

- Schema conformance: checking that every `skills/<name>/SKILL.md` validates against `schemas/skill.schema.json` without errors
- Manifest sync: verifying that `examples/skills.manifest.sample.json` matches the output of `scripts/generate-manifest.js` run against the current skills
- Relation integrity: confirming that every target named in `relations.adjacent`, `relations.boundary`, `relations.verify_with`, and `relations.depends_on` corresponds to a real sibling skill directory
- Eval status coherence: ensuring that `eval_status: evals` is backed by a real eval artifact under `examples/evals/` that names the skill in its `skill_name` field
- Grounding presence: confirming that every `scope: operational` skill has a fully populated `grounding` block with `domain_object`, `grounding_mode`, `truth_sources`, `failure_modes`, and `evidence_priority`
- Name-directory parity: checking that a skill's `name` field matches the name of the parent directory (required for Agent Skills compatibility)

## Philosophy

A skill graph is only as reliable as its metadata. Schema drift, broken relation targets, and manifest desync are silent bugs — they do not break the skill's prose content but they make automated retrieval unreliable. The audit catches these violations before they accumulate.

## Key Files

| File | Purpose |
|---|---|
| `schemas/skill.schema.json` | Enforces the frontmatter contract for every SKILL.md |
| `schemas/manifest.schema.json` | Enforces the compiled manifest shape |
| `docs/metadata-contract.md` | Source of truth for field semantics and the archetype section map |
| `scripts/skill-lint.js` | The canonical audit runner; covers all six checks listed in Coverage |
| `examples/skills.manifest.sample.json` | Generator-produced sample; lint fails if this drifts from `generate-manifest.js` output |

## Verification

Run the lint script to execute all audit checks:

```bash
node scripts/skill-lint.js
```

For a single skill:

```bash
node scripts/skill-lint.js skills/<name>
```

For the full audit including the skill-template:

```bash
node scripts/skill-lint.js --include-template
```

Exit code 0 means all checks passed. Exit code 1 means at least one check failed; each failure identifies the specific file and check.

- [ ] All SKILL.md files pass schema validation
- [ ] Manifest sample matches generator output
- [ ] All relation targets exist as real sibling skill directories
- [ ] All `eval_status: evals` skills have a matching eval artifact
- [ ] All `scope: operational` skills have a complete `grounding` block

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| `graph-audit` | `documentation` | Documentation authoring is not metadata auditing |
| `graph-audit` | `refactor` | Restructuring skill prose is refactor work, not a schema audit |
| `graph-audit` | `debugging` | Chasing a runtime failure in an agent is debugging, not a skill graph audit |
