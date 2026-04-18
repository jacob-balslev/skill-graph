---
schema_version: 3
name: graph-audit
description: "Use when checking that every SKILL.md conforms to the schema, that manifest entries match authored frontmatter, or that relation targets point at real sibling skills. Covers schema conformance, manifest sync, relation integrity, eval-artifact coherence, grounding presence, and name-directory parity. Do NOT use for general code review, runtime agent debugging, or auditing non-skill files."
version: 1.0.0
type: capability
browse_category: knowledge
scope: codebase
owner: maintainer
freshness: "2026-04-17"
drift_check:
  last_verified: "2026-04-18"
  truth_source_hashes:
    "schemas/skill.schema.json": "04cf90cfa703a4dd5bf74fde5ad4c273a16f5977c34b1fd569140e3d9d38aade"
    "schemas/manifest.schema.json": "3a1fdf060f0928f12c54d5414bd17fee999c1edcb9833b82d40d36268481906a"
    "docs/metadata-contract.md": "98e923369eac343b7581560caa7e580d6f2a03eb129069cd48f7dd7894b886fa"
    "scripts/skill-lint.js": "b6e4053808802fa328e6ecc616b01e37ca439e21656edb3da7426baf438c2b96"
    "scripts/check-contract-consistency.js": "2d6a88154c28629e58d2cffc2778726b80c631717428a037ad81a5350f791444"
    "scripts/generate-manifest.js": "50a3aa0910a34a6721475fc2cf2f4408ca801ef1f8971858754704d6f1debcd8"
    "examples/evals/graph-audit.json": "18ec7a85872c8b6db67edc2e144d71c0c4a7f9b73f4193d03f9fd60d43a57f26"
eval_artifacts: present
eval_state: passing
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, JSON Schema, Node.js"
allowed-tools: Read Grep Bash
keywords:
  - skill audit
  - manifest audit
  - schema validation
  - skill consistency
  - graph audit
  - metadata check
  - skill frontmatter check
  - broken relation
  - skill drift
  - audit my skills
triggers:
  - graph-audit
paths:
  - skills/**/SKILL.md
  - schemas/*.json
  - examples/skills.manifest.sample.json
relations:
  adjacent:
    - documentation
    - refactor
  boundary:
    - documentation
    - refactor
    - debugging
  verify_with:
    - testing-strategy
grounding:
  domain_object: Skill Graph skill metadata and manifest consistency
  grounding_mode: repo_specific
  truth_sources:
    - schemas/skill.schema.json
    - schemas/manifest.schema.json
    - docs/metadata-contract.md
    - scripts/skill-lint.js
    - scripts/check-contract-consistency.js
    - scripts/generate-manifest.js
    - examples/evals/graph-audit.json
  failure_modes:
    - schema_drift
    - manifest_sample_out_of_sync
    - broken_relation_targets
    - eval_artifacts_mismatch
    - name_directory_mismatch
  evidence_priority: repo_code_first
---

# Graph Audit

## Coverage

- Schema conformance: checking that every `skills/<name>/SKILL.md` validates against `schemas/skill.schema.json` without errors
- Manifest sync: verifying that `examples/skills.manifest.sample.json` matches the output of `scripts/generate-manifest.js` run against the current skills
- Relation integrity: confirming that every target named in `relations.adjacent`, `relations.boundary`, `relations.verify_with`, and `relations.depends_on` corresponds to a real sibling skill directory
- Eval artifact coherence: ensuring that `eval_artifacts: present` is backed by a real eval artifact under `examples/evals/` that names the skill in its `skill_name` field
- Grounding presence: confirming that every `scope: codebase` skill has a fully populated `grounding` block with `domain_object`, `grounding_mode`, `truth_sources`, `failure_modes`, and `evidence_priority`
- Name-directory parity: checking that a skill's `name` field matches the name of the parent directory (required for Agent Skills compatibility)

## Philosophy

Skill graphs fail silently. A broken relation or a drifted enum value does not crash the agent — it just makes retrieval subtly wrong, and subtly-wrong retrieval is worse than a crash because nothing tells you to look. The audit's job is to turn every silent bug into a loud one before the graph accumulates enough drift that agents can no longer trust its edges.

## Key Files

| File | Line range | Purpose |
|---|---|---|
| `schemas/skill.schema.json` | whole file | Enforces the frontmatter contract for every SKILL.md |
| `schemas/manifest.schema.json` | whole file | Enforces the compiled manifest shape |
| `docs/metadata-contract.md` | §§ Archetype, Requiredness, Schema Versioning | Source of truth for field semantics and the archetype section map |
| `scripts/skill-lint.js` | 91–114 (`AUTHORED_FIELDS_MUST_FLOW`), 149–202 (`checkSchemaParity`), 175–250 (`validateAgainstSchema`) | The canonical audit runner. Implements the six dimensions listed in Coverage plus five more: parent-directory-matches-name, cross-schema parity, sample-manifest conformance, generator parity, and routing-quality rules. See README § Validation for the full eleven-check list. |
| `scripts/check-contract-consistency.js` | C1–C6 checks | Cross-artifact contract checker. Complementary to `skill-lint.js` — lint validates per-skill correctness; this validates that the contract documents themselves remain consistent with the schemas. |
| `examples/skills.manifest.sample.json` | whole file | Generator-produced sample; lint fails if this drifts from `generate-manifest.js` output |

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/graph-audit.json`](../../examples/evals/graph-audit.json) covering all six audit dimensions listed under Coverage. The `Verification` checklist below is the deterministic per-file audit gate; the eval file is how this skill's concept comprehension is graded by `scripts/skill-audit.js --graded`.

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
- [ ] All `eval_artifacts: present` skills have a matching eval artifact
- [ ] All `scope: codebase` skills have a complete `grounding` block
- [ ] Every skill's `name` field matches its parent directory name (Agent Skills compatibility)

## Do NOT Use When

| Use instead | When |
|---|---|
| `documentation` | The task is authoring or restructuring skill prose, not auditing metadata |
| `refactor` | The task is restructuring skill body sections while keeping the contract stable |
| `debugging` | The task is chasing a runtime failure in an agent, not validating graph metadata |
