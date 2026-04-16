---
schema_version: 1
name: skill-template
description: "Authoring template for new Skill Graph skills. Activate when creating a new SKILL.md, adapting an existing template to a different archetype, or teaching an author the canonical frontmatter and body structure. Do NOT use when modifying an already-written skill (work on that skill directly) or when writing general technical documentation (use documentation)."
version: 1.0.0
type: capability
family: knowledge
scope: reference
owner: maintainer
freshness: "2026-04-16"
drift_check: "2026-04-16"
eval_status: pending
stability: stable
license: MIT
compatibility: Markdown, YAML, JSON Schema
allowed-tools: Read Grep
# TEMPLATE NOTE: keywords are the pushy activation surface for authoring tasks.
# Keep terms that a human would type when starting a new skill.
keywords:
  - skill authoring
  - skill template
  - new skill
  - skill frontmatter
  - skill graph contract
# TEMPLATE NOTE: triggers is present because this skill is routable by explicit label.
# Remove this block if your skill activates only by keyword or path matching.
triggers:
  - skill-template
# TEMPLATE NOTE: paths is present because this template is the entry point whenever
# examples/skill-template.md or a new skills/<name>/SKILL.md file is touched.
# Remove this block if your skill is purely conceptual and has no file surface.
paths:
  - examples/skill-template.md
  - skills/**/SKILL.md
relations:
  adjacent:
    - documentation
  boundary:
    - refactor
  verify_with:
    - documentation
# TEMPLATE NOTE: domain_frame is REQUIRED for grounded skills that make concrete
# repo claims. Remove this entire block if your skill has evaluation_mode: universal
# and does not anchor to truth sources in the repo.
domain_frame:
  domain_object: Skill authoring for the Skill Graph frontmatter contract
  evaluation_mode: repo_specific
  truth_sources:
    - docs/metadata-contract.md
    - schemas/skill.schema.json
    - docs/skill-audit-checklist.md
  failure_modes:
    - placeholder_sludge
    - cargo_cult_meta_sections
    - description_coverage_collapse
    - authoring_gate_skipped
  evidence_priority: repo_code_first
# TEMPLATE NOTE: portability declares which external agent runtimes this skill is
# known to work on. Remove this block if the skill is internal-only.
portability:
  level: high
  exports:
    - agent-skills
    - cursor
    - windsurf
    - copilot
---

# Skill Template

> **TEMPLATE NOTE — HOW TO READ THIS FILE:** This file is a real, valid, schema-conformant Skill Graph skill whose *subject* is skill authoring itself. Read it as a finished specimen of the contract, then adapt it by (1) renaming the identity, (2) rewriting `description`, `## Coverage`, `## Philosophy`, and `## Key Files` for your subject, (3) rewriting `## Verification` to be your skill's self-check, (4) removing any section or field that does not apply to your archetype, and (5) stripping the `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments — they are authoring scaffolding, never skill content. Never ship placeholder sludge (`your-skill-name`, `path/to/file`, `todo`). If a section does not apply, remove it — do not keep it and fill it with fake content.

> **TEMPLATE NOTE — CONDITIONAL FIELDS:** `extends` is valid only when `type: overlay`. `route_groups` only applies when route ownership is part of the skill contract. `triggers` and `paths` are shown because this template is both label-routable and file-activated; most skills need only one. Generated manifest health fields belong in `skills.manifest.json`, not in the authored `SKILL.md`.

## Coverage

- Frontmatter identity: `name`, `description`, `version`, `type`, `family`, `scope`, `owner`, and the governance fields required by every Skill Graph skill
- Semantic layer discipline: how `description:` (routing contract, ≤ 3 sentences) differs from `## Coverage` (scope map, bulleted topic list) and why each must stay in its own layer
- Teaching-layer delivery: how to use `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments to teach authors without cargo-culting meta sections into every new skill
- Archetype-driven body structure: which `## H2` sections each of the four archetypes (`capability`, `workflow`, `router`, `overlay`) must contain
- Grounding via `domain_frame`: when a skill should declare truth sources and failure modes, and when it should stay `evaluation_mode: universal`
- Adapter workflow: how to strip a template down, how to detect and remove cargo-culted meta, and how to verify a new skill against `schemas/skill.schema.json` before committing

## Philosophy

A template teaches by example, not by placeholder. A concrete, internally consistent specimen of a finished skill is a more reliable authoring reference than any amount of abstract scaffolding. The teaching layer — meta-commentary about how to read and adapt the template — must live in structurally distinct slots that disappear when the author tightens a new skill, never in the `## H2` section slots that AI agents copy verbatim when adapting the file.

## Key Files

| File | Purpose |
|---|---|
| `docs/metadata-contract.md` | Authoritative field semantics: required vs optional, conditional requiredness, relationship to the Agent Skills standard, archetype section map |
| `schemas/skill.schema.json` | Enforceable JSON Schema for the frontmatter contract |
| `docs/skill-audit-checklist.md` | The audit checklist every new skill should pass before commit |

## Verification

Use this checklist as the authoring gate before committing a skill adapted from this template. Every item must pass.

- [ ] Every retained field has a real reason to exist in the new skill
- [ ] Every removed field was removed because of archetype or grounding mismatch, not laziness
- [ ] Body sections match the skill's declared archetype per `docs/metadata-contract.md § Archetype section map`
- [ ] `description:` is ≤ 3 sentences, contains pushy trigger phrases, and names an explicit negative boundary
- [ ] `## Coverage` is a scope map of distinct topics, not a one-line restate of the description
- [ ] `eval_status` matches actual artifact presence (if `evals`, an eval file exists under `examples/evals/` or alongside the skill)
- [ ] All `relations` entries point to skills that exist in the target repo
- [ ] No placeholder sludge (`your-skill-name`, `path/to/file`, `todo`) remains
- [ ] No `> **TEMPLATE NOTE:**` blockquotes or `# TEMPLATE NOTE:` YAML comments remain in the adapted skill
- [ ] The adapted skill validates against `schemas/skill.schema.json` as a real skill

## Do NOT Use When

| Instead of this template | Use | Why |
|---|---|---|
| `skill-template` | the target skill directly | Editing an existing skill is refactor-in-place, not authoring from a template |
| `skill-template` | `documentation` | General technical writing is not skill authoring; use `documentation` for docs, guides, and specs |
| `skill-template` | `docs/metadata-contract.md` | When you need the full field reference, read the contract document directly |

## References

- `docs/metadata-contract.md § Relationship to the Agent Skills standard` — how Skill Graph extends the base standard
- `docs/metadata-contract.md § Example Template Rule` — the no-placeholder-sludge rule this template enforces
- `docs/metadata-contract.md § Archetype section map` — required H2 sections per archetype
- `docs/skill-audit-checklist.md` — the checklist this template's Verification section is derived from
