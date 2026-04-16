# Scripts Roadmap

This document defines the first script surfaces planned for Skill Graph.

These scripts do not exist in the repo yet. The goal is to describe the smallest coherent future toolchain that would make the metadata contract and audit system executable.

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

### 2. Skill lint

Target file:

- `scripts/skill-lint.js`

Purpose:

- validate frontmatter against `schemas/skill.schema.json`
- check relation targets exist
- check `extends` targets exist
- check required field combinations
- flag deprecated or legacy contract usage

Minimum checks:

1. required fields present
2. valid `type`
3. valid `scope`
4. `extends` required for overlays
5. relation targets exist
6. no legacy portability booleans

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
