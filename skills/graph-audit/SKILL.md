---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: graph-audit
description: "Use when checking that every SKILL.md conforms to the schema, that manifest entries match authored frontmatter, or that relation targets point at real sibling skills. Covers schema conformance, manifest sync, relation integrity, eval-artifact coherence, grounding presence, and name-directory parity. Do NOT use for general code review, runtime agent debugging, or auditing non-skill files."
version: 1.0.0
type: capability
browse_category: knowledge
scope: codebase
owner: skill-graph-maintainer
freshness: "2026-04-18"
drift_check:
  last_verified: "2026-05-11"
  truth_source_hashes:
    "schemas/skill.schema.json": "d679ac0bc4cba7cdb7039eac645ab520c73ed22a4349a7b429febaa3015cf3c1"
    "schemas/manifest.schema.json": "ed1d13f30f1c9dcc96934a80136e6cd1f29df9db9bf6fdca2af99e5dc240ad44"
    "docs/skill-metadata-protocol.md": "3eba5f34009059f4bf12d741c9b4f0b16a8b2f83f5a47db77ad10f4e565b2170"
    "scripts/skill-lint.js": "a1ad4ec085a20908160886c59a63377630870651aaee696346d76db29c45ac92"
    "scripts/check-contract-consistency.js": "22786c2de59d3d27bef75ea9d36ead5ee5d4c61eb11d72ba04ccb5a0ce4a4c1e"
    "scripts/generate-manifest.js": "379c5015674fade4a00ea3a2366fd54d46a79182ee05cc9e96e51b56d565bc12"
    "examples/evals/graph-audit.json": "0484253253dd95b6205a1579bc0c365617499024581734fab10592ae94ee6bee"
eval_artifacts: present
eval_state: passing
routing_eval: present
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
examples:
  - "audit all skills for schema conformance and broken relation targets"
  - "the manifest sample drifted from the generator — find the mismatch"
  - "check that every `scope: codebase` skill has a populated grounding block"
  - "which skills declare a relations target that doesn't exist in the library?"
anti_examples:
  - "diagnose why the @/components import cycle broke the build"  # debugging owns build-failure diagnosis; this is NOT skill metadata
  - "my agent is stuck in a loop — what's wrong?"                 # debugging owns runtime failure
  - "write a reference doc explaining what the lint-checker pipeline does"  # documentation owns durable prose about the pipeline
relations:
  boundary:
    - skill: documentation
      reason: "documentation writes prose about the contract; graph-audit verifies the contract against the live files"
    - skill: refactor
      reason: "refactor changes skill body structure; graph-audit is read-only metadata verification"
    - skill: debugging
      reason: "debugging chases a specific runtime failure; graph-audit is bulk static verification of every skill"
  verify_with:
    - testing-strategy
grounding:
  domain_object: Skill Metadata Protocol and Skill Graph manifest consistency
  grounding_mode: repo_specific
  truth_sources:
    - schemas/skill.schema.json
    - schemas/manifest.schema.json
    - docs/skill-metadata-protocol.md
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
- Relation integrity: confirming that every target named under `relations.*` corresponds to a real sibling skill directory and uses the right predicate semantics (`related`/`broader`/`boundary`/`disjoint_with`/`verify_with`/`depends_on`)
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
| `docs/skill-metadata-protocol.md` | §§ Archetype, Requiredness, Schema Versioning | Source of truth for field semantics and the archetype section map |
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

For the full audit including the skill-metadata-template:

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
