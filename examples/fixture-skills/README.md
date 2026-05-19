# Hermetic Test Fixtures (v6)

> **Purpose:** minimal v6-conformant skills used as hermetic fixtures for the
> `@skill-graph/cli` package tests. The published package can validate
> against these without needing a sibling `skills/` clone.
>
> **Status:** v6 (current contract). Update when the schema bumps.

## Fixtures

| Fixture | Type | Scope | Tests | Status |
|---|---|---|---|---|
| [`minimal-capability`](minimal-capability/SKILL.md) | capability | portable | Bare-minimum v6 frontmatter; happy-path lint pass | **shipped** |
| [`with-grounding`](with-grounding/SKILL.md) | capability | codebase | Conditional requiredness — `grounding.*` sub-fields + non-empty `keywords` | **shipped** |
| [`with-relations`](with-relations/SKILL.md) | capability | portable | All four `relations.*` edges (related / boundary / verify_with / depends_on) using `{skill, reason}` object shape | **shipped** |
| [`comprehension-full`](comprehension-full/SKILL.md) | capability | portable | Flat Understanding fields + nested v5 `concept` block (anyOf back-compat) | **shipped** |

All four fixtures cross-reference each other in `with-relations`, forming
a closed reference set: lint resolves every relation target from this
directory alone, with no dependency on the sibling `../skills/skills/`
canonical library. The four fixtures together exercise every conditional
required rule in the v6 schema (`scope: codebase → grounding`,
`comprehension_state: present → concept`) plus the lint rule that
`scope: codebase` demands non-empty `keywords`. See [SH-6132](https://linear.app/sales-hub/issue/SH-6132) EPIC for context.

## Usage

```bash
# Lint a single fixture against the v6 schema:
node bin/skill-graph.js lint examples/fixture-skills/minimal-capability

# Lint every fixture in one pass:
node scripts/skill-lint.js --path examples/fixture-skills
```

## Invariants

- Every shipped fixture validates against `schemas/skill.v6.schema.json` with zero errors.
- Every fixture has `schema_version: 6`.
- No fixture depends on a non-fixture skill (relations between fixtures only).
- Cross-fixture `relations.*` targets MUST exist in this directory.

## Maintenance

- When the schema bumps, every fixture's `schema_version` advances in the same commit as the schema change.
- When a new conditional rule lands (e.g. a new `allOf` block), add or extend the fixture that exercises it.
- Treat these as the canonical regression suite for any change to lint, audit, manifest generation, or routing.
