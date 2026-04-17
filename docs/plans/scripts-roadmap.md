# Scripts Roadmap

This document tracks the script surfaces planned for Skill Graph. The goal is the smallest coherent toolchain that makes the metadata contract and audit system executable.

## Status

| Script | State | Notes |
|---|---|---|
| `scripts/skill-lint.js` | **Shipping** | Validates frontmatter against the schema, enforces parent-dir-matches-name, verifies relation targets exist, checks eval coherence, archetype sections, routing quality; `--strict` mode promotes warnings to errors |
| `scripts/generate-manifest.js` | **Shipping** | Walks `skills/**/SKILL.md`, applies the rename map from `docs/manifest-contract.md`, emits deterministic validated manifest; `examples/skills.manifest.sample.json` is generated output, not hand-written |
| `scripts/export-skill.js` | **Shipping** | Agent Skills export target only; transforms Skill Graph extensions under `metadata:` key. Five fixtures in `examples/exports/`. `cursor` / `windsurf` / `copilot` targets are declared in `portability.targets` but not yet implemented |
| `scripts/check-contract-consistency.js` | **Shipping** | Cross-artifact consistency — field-set parity, authored-to-generated parity, example truth invariants (C1–C5 checks) |
| `scripts/skill-audit.js` | **Shipping (stub-only)** | Seeds `audits/<skill>/{findings,verdict,scorecard}.md` stubs from lint output. Full qualitative 7-checklist grader pass is still manual; promoting the stub to a prompt-driven runner is the next milestone |

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
5. `grounding` required for `scope: codebase` (schema conditional)
6. relation targets (`adjacent`, `boundary`, `verify_with`, `depends_on`) exist as sibling skills
7. parent directory name matches the authored `name` (Agent Skills compatibility)
8. `eval_artifacts: present` is backed by a real eval file under `examples/evals/`

Run with `node scripts/skill-lint.js` (see `README.md § Validation`). Exit 0 on success, 1 on any failure.

Planned extensions:

- flag deprecated or legacy contract usage
- stricter Agent Skills name pattern mode (reject `/` and `:`)
- integration with `generate-manifest.js` for combined health reporting

### 3. Audit runner

Target file:

- `scripts/skill-audit.js`

Purpose:

- audit one skill at a time using `docs/single-skill-audit-checklist.md`
- write findings and verdict artifacts
- optionally run deterministic validation after fixes

Minimum behavior:

1. select one skill
2. run lint
3. read skill and apply checklist
4. write `audits/<skill>/findings.md`
5. write `audits/<skill>/verdict.md`

## Suggested Follow-on Scripts

After the first 5 scripts exist (all Shipping as of 2026-04-17), the next useful additions are:

1. `scripts/skill-overlap.js` — detect semantic and scope-range overlap between skills
2. `scripts/skill-router.js` — simulate routing decisions against a test corpus
3. `scripts/build-coverage.js` — build-time coverage report (keywords × triggers × archetypes)
4. Export transforms for `cursor`, `windsurf`, `copilot` targets — extend `scripts/export-skill.js` or narrow `portability.targets` enum to match reality

## Non-Goals For The First Cut

Do not build these first:

- telemetry dashboards
- model-specific grading infrastructure
- marketplace packaging layers
- runtime execution or skill hosting

These are useful later. They are not required for a credible starter toolchain around the metadata contract.
