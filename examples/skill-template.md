---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: skill-template
description: "Use when creating a new SKILL.md, adapting an existing skill to a different archetype, or teaching an author the canonical frontmatter and body structure. Covers schema-conformant frontmatter, archetype-aware body layout, semantic-layer discipline (description vs Coverage), teaching-layer mechanics (TEMPLATE NOTE blockquotes and YAML comments), and the authoring gate. Do NOT use when modifying an already-written skill (edit that skill directly) or when writing general technical documentation (use the documentation skill)."
version: 1.0.0
type: capability
browse_category: knowledge
# TEMPLATE NOTE: category is the OPTIONAL hierarchical browse path (slash-
# delimited, lowercase kebab-case segments). Use it only when the skill library
# is large enough that a tree structure helps readers find related skills —
# `docs/field-reference.md § category` recommends against it for libraries
# under ~20 skills. Remove this line entirely when the flat `browse_category`
# above is sufficient. `browse_category` is required; `category` complements it
# but is never a replacement.
category: skill-system/authoring
scope: reference
owner: jacob-balslev
freshness: "2026-04-17"
# TEMPLATE NOTE: drift_check is an object in v3. `last_verified` is required.
# `truth_source_hashes` is optional — record it with `node scripts/skill-graph-drift.js
# --record --apply <skill-dir>`.
drift_check:
  last_verified: "2026-04-17"
# TEMPLATE NOTE: eval_artifacts, eval_state, and routing_eval are the three
# orthogonal eval-health axes introduced in schema_version 2. Set eval_artifacts
# to `planned` only as a temporary state — move to `present` once the artifact
# ships. Set eval_state to `unverified` when no run has been recorded yet.
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
# TEMPLATE NOTE: stability values are `experimental` / `stable` / `frozen` /
# `deprecated`. When you move a skill to `deprecated`, the schema's `allOf`
# rule REQUIRES you to also add `superseded_by: <replacement-skill-name>` —
# without it the skill fails validation. A deprecated + superseded skill looks
# like:
#
#   stability: deprecated
#   superseded_by: new-skill-name
#
# The replacement must be a real skill in the same library. Omit `superseded_by`
# for any stability other than `deprecated`. See `docs/field-reference.md §
# superseded_by` for the full rules and the schema's `allOf` enforcement.
stability: stable
license: MIT
# TEMPLATE NOTE: compatibility is an object in v3. Prefer structured fields
# (`runtimes`, `node`) over free-text `notes`.
compatibility:
  notes: "Markdown, YAML, JSON Schema"
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
# examples/skill-template.md itself is touched. v3 supports gitignore-style negation —
# e.g. `- "!skills/experimental/**"` excludes a subdirectory from an otherwise broad
# glob. Remove this block if your skill is purely conceptual and has no file surface.
#
# Previous versions of this block also listed `skills/**/SKILL.md` but that glob is
# owned by `graph-audit` (the audit tooling that verifies every SKILL.md against the
# schema). Two skills claiming the same glob produces router ambiguity — the scope
# tiebreaker (`codebase` > `reference`) picks graph-audit anyway, and reference-scope
# skills are looked-up rather than path-routed. Lesson: each path glob should map to
# ONE canonical skill; `scripts/skill-overlap.js` surfaces duplicates as warnings.
paths:
  - examples/skill-template.md
# TEMPLATE NOTE: examples is new in v0.5.0. 2–5 realistic user prompts the skill
# SHOULD activate for. Improves retrieval recall over keywords alone. Write in
# the user's voice, not imperative abstract form. See docs/field-reference.md §
# examples for full guidance. Omit this block for purely label-routed skills.
examples:
  - "I'm writing a new skill from scratch — where do I start?"
  - "how do I pick between capability and workflow for my skill type?"
  - "what's the difference between description and the ## Coverage section?"
# TEMPLATE NOTE: anti_examples names near-miss prompts that should route ELSEWHERE.
# Pair with relations.boundary to tell the router which skill owns the confusable
# territory. Leave this block absent until you have seen the router misfire —
# speculative anti_examples rarely match reality. See docs/field-reference.md §
# anti_examples.
anti_examples:
  - "refactor this skill to be more concise"           # → refactor, not authoring
  - "my skill's routing isn't activating — why?"       # → skill-router, not template
# TEMPLATE NOTE: project_tags is new in v3. Omit it for ambient / cross-project
# skills (the common case). Add literal project handles or semantic tags when
# the skill is relevant to a subset of projects in a multi-project workspace.
# See docs/field-decision-guide.md § 4 for the full decision tree.
#
# Example — this template is useful across every skill-authoring project, but
# the semantic tag scopes it to the Skill Graph authoring workflow rather than
# arbitrary project docs. A workspace config at `.skill-graph/config.json` can
# map literal project handles (e.g. `sales-hub`, `free-oppression`) to tag sets
# that include `skill-authoring`, so one tag reaches many projects.
project_tags:
  - skill-authoring
relations:
  # TEMPLATE NOTE: boundary items may be bare skill names OR `{skill, reason}`
  # objects (v3). Reasons are strongly recommended — they make the boundary
  # self-documenting. Adjacency has been removed here because `documentation`
  # is already declared as `verify_with` — adjacent ("often used together")
  # would be redundant and asymmetric.
  boundary:
    - skill: refactor
      reason: "refactor is behavior-preserving code modification, not skill authoring"
  verify_with:
    - documentation
# TEMPLATE NOTE: grounding is REQUIRED for grounded skills that make concrete
# repo claims. Remove this entire block if your skill has grounding_mode: universal
# and does not anchor to truth sources in the repo.
grounding:
  domain_object: Skill authoring for the Skill Graph frontmatter contract
  grounding_mode: repo_specific
  truth_sources:
    - docs/metadata-contract.md
    - schemas/skill.schema.json
    - docs/single-skill-audit-checklist.md
  failure_modes:
    - placeholder_sludge
    - cargo_cult_meta_sections
    - description_coverage_collapse
    - authoring_gate_skipped
  evidence_priority: repo_code_first
# TEMPLATE NOTE: portability declares which external agent runtimes this skill is
# known to work on. `readiness` is the operational rating: `declared` (claim only),
# `scripted` (export tooling exists), or `verified` (proven with a receipt). `targets`
# is the list of destination runtimes. Today the only supported target is `agent-skills`
# (see `schemas/skill.schema.json`). Other runtimes (cursor, windsurf, copilot, agents-md)
# were removed from the enum in 0.3.0 pending working transforms — re-add via RFC if
# adoption pressure appears. Remove this block if the skill is internal-only.
portability:
  readiness: scripted
  targets:
    - agent-skills
# TEMPLATE NOTE: lifecycle declares maintenance policy for the drift sentinel.
# `stale_after_days` flags the skill as STALE when more than N days have passed
# since `drift_check.last_verified`. Integration skills (third-party APIs) want
# shorter values; pure-concept skills want longer. Omit if staleness is not
# meaningful for your skill.
lifecycle:
  stale_after_days: 180
  review_cadence: quarterly
# TEMPLATE NOTE: runtime_telemetry is optional. It points at a JSONL feed of
# real-world success/failure receipts so consumers can corroborate or override
# `eval_state`. Omit the entire block when no feedback pipeline exists — the
# skill is still graded on authored `eval_state` and `eval_artifacts`.
# Each run receipt should carry at minimum `{ timestamp, skill, outcome }`.
# `metrics.sample_size` and `metrics.success_rate` are the aggregate summary;
# consumers may compute their own from the raw feed.
runtime_telemetry:
  feedback_source: .skill-graph/telemetry/skill-template.jsonl
  last_updated: "2026-04-17"
  metrics:
    sample_size: 0
    success_rate: 0
---

# Skill Template

> **TEMPLATE NOTE — HOW TO READ THIS FILE:** This file is a real, valid, schema-conformant Skill Graph skill whose *subject* is skill authoring itself. Read it as a finished specimen of the contract, then adapt it by (1) renaming the identity, (2) rewriting `description`, `## Coverage`, `## Philosophy`, and `## Key Files` for your subject, (3) rewriting `## Verification` to be your skill's self-check, (4) removing any section or field that does not apply to your archetype, and (5) stripping the `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments — they are authoring scaffolding, never skill content. Never ship placeholder sludge (`your-skill-name`, `path/to/file`, `todo`). If a section does not apply, remove it — do not keep it and fill it with fake content.

> **TEMPLATE NOTE — CONDITIONAL FIELDS:** `extends` is valid only when `type: overlay`. `routing_groups` only applies when routing-group ownership is part of the skill contract. `triggers` and `paths` are shown because this template is both label-routable and file-activated; most skills need only one. `grounding` is REQUIRED for `scope: codebase` skills; remove the block entirely for `scope: portable` or `scope: reference`. `project_tags` is optional — omit for ambient / cross-project skills. `lifecycle` is optional — omit when staleness is not meaningful. `runtime_telemetry` is optional — omit when no feedback pipeline exists. Generated manifest health fields belong in `skills.manifest.json`, not in the authored `SKILL.md`.

## Coverage

- Frontmatter identity: `name`, `description`, `version`, `type`, `browse_category`, `scope`, `owner`, and the governance fields required by every Skill Graph skill
- Semantic layer discipline: how `description:` (routing contract, ≤ 3 sentences) differs from `## Coverage` (scope map, bulleted topic list) and why each must stay in its own layer
- Teaching-layer delivery: how to use `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments to teach authors without cargo-culting meta sections into every new skill
- Archetype-driven body structure: which `## H2` sections each of the four archetypes (`capability`, `workflow`, `router`, `overlay`) must contain
- Grounding via `grounding`: when a skill should declare truth sources and failure modes, and when it should stay `grounding_mode: universal`
- v3 drift evidence: when to record `drift_check.truth_source_hashes` and how the drift sentinel consumes them
- v3 multi-project tagging: when to add `project_tags`, when to leave a skill ambient, and how workspace semantic-tag mapping composes
- Adapter workflow: how to strip a template down, how to detect and remove cargo-culted meta, and how to verify a new skill against `schemas/skill.schema.json` before committing

## Philosophy

A template teaches by example, not by placeholder. A concrete, internally consistent specimen of a finished skill is a more reliable authoring reference than any amount of abstract scaffolding. The teaching layer — meta-commentary about how to read and adapt the template — must live in structurally distinct slots that disappear when the author tightens a new skill, never in the `## H2` section slots that AI agents copy verbatim when adapting the file.

## Key Files

| File | Purpose |
|---|---|
| `docs/metadata-contract.md` | Authoritative field semantics: required vs optional, conditional requiredness, relationship to the Agent Skills standard, archetype section map |
| `schemas/skill.schema.json` | Enforceable JSON Schema for the frontmatter contract |
| `docs/single-skill-audit-checklist.md` | The audit checklist every new skill should pass before commit |

## Verification

Use this checklist as the authoring gate before committing a skill adapted from this template. Every item must pass.

- [ ] Every retained field has a real reason to exist in the new skill
- [ ] Every removed field was removed because of archetype or grounding mismatch, not laziness
- [ ] Body sections match the skill's declared archetype per `docs/metadata-contract.md § Archetype section map`
- [ ] `description:` is ≤ 3 sentences, contains pushy trigger phrases, and names an explicit negative boundary
- [ ] `## Coverage` is a scope map of distinct topics, not a one-line restate of the description
- [ ] `drift_check` is an object with `last_verified`; `truth_source_hashes` has been recorded when truth sources exist
- [ ] `compatibility` is an object (not a free-text string) when present
- [ ] `eval_artifacts` matches actual artifact presence (if `present`, an eval file exists under `examples/evals/` or alongside the skill); `eval_state` reflects whether a real passing run has been recorded; `routing_eval` reflects whether trigger/routing coverage is explicitly checked
- [ ] All `relations` entries point to skills that exist in the target repo; `boundary` entries with unclear rationale use the `{skill, reason}` form
- [ ] `project_tags` is present when the skill is project-specific OR absent when the skill is ambient — not left at a stale value
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
- `docs/manifest-contract.md § Migration Note — v2 → v3` — the shape changes the v3 bump introduced
- `docs/single-skill-audit-checklist.md` — the checklist this template's Verification section is derived from
