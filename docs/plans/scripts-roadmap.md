# Scripts Roadmap

This document tracks the script surfaces planned for Skill Graph. The goal is the smallest coherent toolchain that makes the metadata contract and audit system executable.

## Status

| Script | State | Notes |
|---|---|---|
| `scripts/skill-lint.js` | **Shipping** | Validates frontmatter against the schema, enforces parent-dir-matches-name, verifies relation targets exist, checks eval coherence |
| `scripts/generate-manifest.js` | Planned | `examples/skills.manifest.sample.json` is hand-written as a reference until the generator ships |
| `scripts/skill-audit.js` | Planned | Audit runner that consumes the checklist and writes findings artifacts |

## Priority Order

### 1. Manifest generation

Target file:

- `scripts/generate-manifest.js`

Purpose:

- walk `skills/**/SKILL.md`
- parse frontmatter
- normalize activation, relations, portability, and health fields
- output `skills.manifest.json`
- validate against `schemas/manifest.schema.json`

Minimum output:

- `schema_version`
- `generated_at`
- `summary`
- `skills[]`

A hand-written sample manifest showing the exact output shape ships today at `examples/skills.manifest.sample.json`.

### 2. Skill lint (SHIPPED)

Target file:

- `scripts/skill-lint.js`

Shipping today. Covers:

1. required fields present and well-typed
2. valid `type` enum
3. valid `scope` enum
4. `extends` required for overlays (schema conditional)
5. `domain_frame` required for `scope: operational` (schema conditional)
6. relation targets (`adjacent`, `boundary`, `verify_with`, `depends_on`) exist as sibling skills
7. parent directory name matches the authored `name` (Agent Skills compatibility)
8. `eval_status: evals` is backed by a real eval file under `examples/evals/`

Run with `node scripts/skill-lint.js` (see `README.md § Validation`). Exit 0 on success, 1 on any failure.

Planned extensions:

- flag deprecated or legacy contract usage
- stricter Agent Skills name pattern mode (reject `/` and `:`)
- integration with `generate-manifest.js` for combined health reporting

### 3. Audit runner

Target file:

- `scripts/skill-audit.js`

Purpose:

- audit one skill at a time using `docs/skill-audit-checklist.md`
- write findings and verdict artifacts
- optionally run deterministic validation after fixes

Minimum behavior:

1. select one skill
2. run lint
3. read skill and apply checklist
4. write `audits/<skill>/findings.md`
5. write `audits/<skill>/verdict.md`

## Suggested Follow-on Scripts

After the first 3 scripts exist, the next useful additions are:

1. `scripts/skill-overlap.js`
2. `scripts/skill-router.js`
3. `scripts/export-skill.js`
4. `scripts/build-coverage.js`

## Non-Goals For The First Cut

Do not build these first:

- telemetry dashboards
- model-specific grading infrastructure
- marketplace packaging layers
- runtime execution or skill hosting

These are useful later. They are not required for a credible starter toolchain around the metadata contract.
