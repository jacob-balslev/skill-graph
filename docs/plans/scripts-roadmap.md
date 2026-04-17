# Scripts Roadmap

This document tracks the script surfaces planned for Skill Graph. The goal is the smallest coherent toolchain that makes the metadata contract and audit system executable.

## Status

| Script | State | Notes |
|---|---|---|
| `scripts/skill-lint.js` | **Shipping** | Validates frontmatter against the schema, enforces parent-dir-matches-name, verifies relation targets exist, checks eval coherence, archetype sections, routing quality; `--strict` mode promotes warnings to errors |
| `scripts/generate-manifest.js` | **Shipping** | Walks `skills/**/SKILL.md`, applies the rename map from `docs/manifest-contract.md`, emits deterministic validated manifest; `examples/skills.manifest.sample.json` is generated output, not hand-written |
| `scripts/export-skill.js` | **Shipping** | Agent Skills export target only; transforms Skill Graph extensions under `metadata:` key. Five fixtures in `examples/exports/`. Other runtimes (cursor, windsurf, copilot, agents-md) were removed from the `portability.targets` enum in 0.3.0 — re-add via a new RFC and the PR that ships the transform |
| `scripts/check-contract-consistency.js` | **Shipping** | Cross-artifact consistency — field-set parity, authored-to-generated parity, example truth invariants (C1–C5 checks) |
| `scripts/skill-audit.js` | **Shipping** | Stub mode seeds `audits/<skill>/{findings,verdict,scorecard}.md` from lint output (unchanged). `--graded` mode composes per-dimension prompts via `scripts/lib/audit-prompt-builder.js`, calls an external model CLI for each of the seven scorecard dimensions, and writes evidence-backed verdicts into the artifact files replacing TODO placeholders. A deterministic mock grader ships at `scripts/lib/mock-grader.js` for CI smoke-tests |

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

### 3. Audit runner (SHIPPED)

Target file:

- `scripts/skill-audit.js`

Purpose:

- audit one skill at a time using `docs/single-skill-audit-checklist.md`
- write findings, verdict, and scorecard artifacts
- optionally run deterministic validation after fixes

Shipping today. Two modes:

1. **Stub mode** (default) — runs `scripts/skill-lint.js` and seeds `audits/<skill>/{findings,verdict,scorecard}.md` with lint-derived findings and human-TODO placeholders for the seven qualitative dimensions.
2. **`--graded` mode** — on top of the stub, composes per-dimension prompts via `scripts/lib/audit-prompt-builder.js` and calls an external model CLI (`--grader-cli`, default `claude -p`) once per dimension. Each response must return a `<verdict>…</verdict>` JSON block matching the fixed schema (dimension / score / verdict / justification / findings[]). The runner parses, validates, and merges these into the artifact files, replacing TODO placeholders with structured PASS / PASS WITH FIXES / FAIL verdicts with evidence quotes.

Related files:

- `scripts/lib/audit-prompt-builder.js` — dimension registry, context collector, prompt composer, response parser, verdict aggregator
- `scripts/lib/mock-grader.js` — deterministic canned-response grader for CI smoke-tests and reproducible examples (prints fixed `<verdict>` blocks per dimension)

Grader CLI discipline: the runner NEVER embeds API keys. Auth is delegated to the external CLI on the host (see `.claude/rules/cli-first.md`). `--grader-cli "claude -p"` and `--grader-cli "codex exec"` both work when the respective CLIs are authenticated.

## Suggested Follow-on Scripts

After the first 5 scripts exist (all Shipping as of 2026-04-17), the next useful additions are:

1. `scripts/skill-overlap.js` — detect semantic and scope-range overlap between skills
2. `scripts/skill-router.js` — simulate routing decisions against a test corpus
3. `scripts/build-coverage.js` — build-time coverage report (keywords × triggers × archetypes)
4. Export transforms for `cursor`, `windsurf`, `copilot`, or `agents-md` targets — removed from scope in 0.3.0. Re-add via RFC + the PR that ships the transform.

## Non-Goals For The First Cut

Do not build these first:

- telemetry dashboards
- model-specific grading infrastructure
- marketplace packaging layers
- runtime execution or skill hosting

These are useful later. They are not required for a credible starter toolchain around the metadata contract.
