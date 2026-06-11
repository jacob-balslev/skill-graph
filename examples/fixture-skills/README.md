# Hermetic Test Fixtures (v8)

> **Purpose:** minimal v8-conformant skills used as hermetic fixtures for the
> `@skill-graph/cli` package tests. The published package can validate
> against these without needing a sibling `skills/` clone.
>
> **Status:** current-contract fixtures. Historical compatibility fixtures live in git history, not in this directory.

## Fixtures

| Fixture | Subject | Public | Tests | Status |
|---|---|---|---|---|
| [`minimal-capability`](minimal-capability/SKILL.md) | backend-engineering | true | Bare-minimum v8 frontmatter; happy-path lint pass | **shipped** |
| [`with-grounding`](with-grounding/SKILL.md) | knowledge-organization | false | Conditional requiredness — non-empty `project[]` requires `grounding.*` sub-fields | **shipped** |
| [`with-relations`](with-relations/SKILL.md) | knowledge-organization | true | Relation target resolution and live item shapes for `related`, `suppresses`, `verify_with`, and `depends_on` | **shipped** |
| [`comprehension-full`](comprehension-full/SKILL.md) | knowledge-organization | true | Flat Understanding fields + nested `concept` fallback (`anyOf`) | **shipped** |

All four fixtures cross-reference each other in `with-relations`, forming
a closed reference set: lint resolves every relation target from this
directory alone, with no dependency on the sibling `../skills/skills/`
canonical library. The four fixtures together exercise the current schema's
core conditional rules: `project[] non-empty -> grounding`,
`comprehension_state: present -> Understanding fields or concept`, and
`eval_state: passing|monitored -> eval_artifacts: present` through negative
schema tests.

## Usage

```bash
# Lint a single current-contract fixture:
node bin/skill-graph.js lint examples/fixture-skills/minimal-capability

# Lint every fixture in one pass:
node scripts/skill-lint.js --path examples/fixture-skills
```

## Invariants

- Every shipped fixture validates against `schemas/SKILL_METADATA_PROTOCOL_schema.json` with zero errors.
- Every fixture has `schema_version: 8`.
- No fixture depends on a non-fixture skill (relations between fixtures only).
- Cross-fixture `relations.*` targets MUST exist in this directory.

## Maintenance

- When the current schema bumps, update these fixtures in the same SYSTEM change.
- When a new conditional rule lands (e.g. a new `allOf` block), add or extend the fixture that exercises it.
- Treat these as the canonical regression suite for any change to lint, audit, manifest generation, or routing.
