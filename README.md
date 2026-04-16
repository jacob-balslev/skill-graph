# Skill Graph

Graph-aware skill metadata for AI agents. A superset of the [Agent Skills](https://agentskills.io/specification) open standard that adds typed relations, grounding contracts, audit surfaces, and deterministic validation targets.

## Status

Shipping today:

- public `SKILL.md` frontmatter contract (`docs/metadata-contract.md`)
- JSON Schemas for skill and manifest validation (`schemas/`)
- audit documentation for single-skill and repeated-library review (`docs/skill-audit-checklist.md`, `docs/skill-audit-loop.md`)
- a self-referential skill template (`examples/skill-template.md`)
- five starter skills (`skills/a11y`, `debugging`, `documentation`, `refactor`, `testing-strategy`)
- concrete example audit and eval artifacts against the `documentation` starter (`examples/audits/`, `examples/evals/`)

Planned, not yet implemented:

- manifest generation (`scripts/generate-manifest.js`)
- skill lint and relation validation (`scripts/skill-lint.js`)
- audit runner (`scripts/skill-audit.js`)
- overlap detection, routing, export, and coverage tooling

See `docs/plans/scripts-roadmap.md` for the planned script surface.

## Relationship to Agent Skills

Skill Graph is a graph-aware superset of the [Agent Skills](https://agentskills.io/specification) open standard. It keeps the two required base fields (`name`, `description`) and the optional base fields (`license`, `compatibility`, `allowed-tools`). Skill Graph then adds typed relations, grounding anchors, health metadata, and portability declarations as additional top-level fields.

The base standard and the Skill Graph extensions:

| Field | Source | Role in Skill Graph |
|---|---|---|
| `name` | Agent Skills | Skill identifier; Skill Graph tightens the character pattern |
| `description` | Agent Skills | Routing contract (what + when) |
| `license` | Agent Skills | Optional; strongly recommended for shared skills |
| `compatibility` | Agent Skills | Optional; environment requirements |
| `allowed-tools` | Agent Skills | Optional; space-separated tool allowlist |
| `metadata` | Agent Skills | Not used at top level; Skill Graph promotes extensions to dedicated fields |
| `schema_version`, `version`, `type`, `family`, `scope`, `owner`, `freshness`, `drift_check`, `eval_status` | Skill Graph | Required extensions for governance, routing, and health tracking |
| `relations`, `domain_frame`, `portability`, `triggers`, `keywords`, `paths`, `route_groups`, `extends`, `stability` | Skill Graph | Optional extensions for graph semantics, grounding, and exportability |

**Compatibility direction.** A valid Agent Skills skill is *not* automatically a valid Skill Graph skill — Skill Graph requires fields beyond the base two. Going the other way is possible via a transform: move every Skill Graph extension field under the standard `metadata:` key, leaving only the Agent Skills fields at the top level. Tooling for this transform is on the roadmap as `scripts/export-skill.js`. Until it ships, the `agent-skills` value in `portability.exports` describes a compatibility *goal*, not a working export path.

## Quick tour

- `docs/metadata-contract.md` — authoritative field semantics, required vs optional, conditional requiredness, schema strictness rules
- `schemas/skill.schema.json` — the frontmatter contract as enforceable JSON Schema
- `docs/skill-audit-checklist.md` — the canonical per-skill audit checklist
- `docs/skill-audit-loop.md` — the repeatable audit loop wrapping the checklist
- `examples/skill-template.md` — a self-referential template; its subject is skill authoring itself

## Audit surfaces

Skill Graph ships two reusable audit documents and a concrete artifact set that shows what the outputs look like:

- `docs/skill-audit-checklist.md` — the checklist for auditing one skill
- `docs/skill-audit-loop.md` — the standard 12-step loop for auditing many skills over time
- `examples/audits/documentation/` — worked example of `findings.md`, `verdict.md`, and `scorecard.md` applied to the `documentation` starter skill

## Starter skill pack

Five generic, portable starter skills. Each starter demonstrates at least one contract feature the others do not:

| Starter | Archetype | Unique feature demonstrated |
|---|---|---|
| `a11y` | `capability` | Minimal routable capability — frontmatter baseline, keyword + trigger activation, no optional extensions |
| `debugging` | `workflow` | Workflow archetype with a `## Workflow` body section showing numbered procedural steps |
| `documentation` | `capability` | `eval_status: evals` with a shipped eval artifact (`examples/evals/comprehension.json`) |
| `refactor` | `workflow` | `relations.depends_on` pointing at `testing-strategy` (refactor verification needs a test suite) |
| `testing-strategy` | `capability` | `route_groups: [quality]` showing the optional classification field |

The starters are all `scope: generic` and intentionally demonstrate the ungrounded path (no `domain_frame`). The `examples/skill-template.md` file shows the grounded variant with `domain_frame` populated.

Starter `eval_status` is `pending` for four of the five (no eval artifact shipped yet). `documentation` is `eval_status: evals` because `examples/evals/comprehension.json` targets it as the reference example.

## Validation

Validation tooling is on the roadmap. Until a bundled CLI ships, a Skill Graph `SKILL.md` can be validated against the schema with any JSON Schema validator, for example:

```bash
npx ajv-cli validate -s schemas/skill.schema.json -d "skills/**/SKILL.md"
```

This requires extracting the YAML frontmatter before piping it to the validator; a dedicated `scripts/skill-lint.js` will handle this end-to-end.

## Non-goals

Skill Graph is not:

- a prompt library
- a skill marketplace
- another agent framework
- a complete runtime implementation

It is a portable metadata contract with deterministic validation targets, designed to be consumed by any agent runtime that already supports Agent Skills.

## License

MIT — see `LICENSE`.
