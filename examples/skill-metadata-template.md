---
name: skill-metadata-template
# TEMPLATE NOTE: Be pushy in your description — Claude tends to under-trigger
# skills, so descriptions should read as commands ("Use when X", "Activate
# this skill whenever Y") not as polite suggestions ("This skill provides Z").
# State both WHAT the skill does AND WHEN to use it, and include an explicit
# negative boundary ("Do NOT use for ..." with a pointer to the right
# alternative skill). The 3-test quality gate for descriptions is:
#   (1) names a real domain object (file path, function name, route),
#   (2) has an explicit "Do NOT use for X (use Y)" exclusion clause,
#   (3) names a concrete trigger (code pattern, file path, command).
# Keep the description concise enough to route well, but do not treat runtime
# wording guidelines as protocol limits.
# for Anthropic's own guidance on pushy descriptions.
description: "Use when creating a new SKILL.md from scratch, restructuring a draft before it becomes a stable skill, or teaching an author the canonical Skill Metadata Protocol frontmatter and body structure. Covers schema-conformant frontmatter, v8 classification, body layout by skill intent, semantic-layer discipline (description vs Coverage), teaching-layer mechanics (TEMPLATE NOTE blockquotes and YAML comments), and the authoring gate. Do NOT use when modifying an already-written skill (edit that skill directly), writing general technical documentation, or debugging routing for an existing skill."

# === v8 Classification (subject + deployment_target; polyhierarchy via subjects[]) ===
# See docs/adr/0020-twelve-shelf-competency-reaxis.md for the current shelf rationale.

# subject: primary browse shelf — the competency the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering /
# agent-ops / ai-engineering / quality-assurance / design / reasoning-strategy /
# software-engineering-method / knowledge-organization / product-domain.
subject: agent-ops

# public: publishability gate (boolean). true = safe for public marketplace
# release (no private API keys / personal / customer / internal-only data);
# false = carries private data, NEVER published. This is the single switch the
# marketplace exporter filters on. When unsure, author `false` (fail-safe).
# (Replaced the deployment_target enum — ADR-0017 amendment.)
public: false

# scope: required PRD-style free-text statement of what the skill teaches and
# what it doesn't. Mirrors `## Coverage` plus `## Do NOT Use When` at the
# frontmatter level for fast scanning.
scope: "Authoring a new SKILL.md against Skill Metadata Protocol v8: frontmatter shape, v8 classification, sidecar split, body layout by skill intent, and semantic-layer discipline. Out: editing already-written skills (use `refactor`), general technical writing, or routing diagnosis (use `skill-router`)."

# taxonomy_domain: optional hierarchical sub-path within `subject`.
# Slash-delimited lowercase kebab-case segments (e.g., `agent/skill-system`).
# Use only when the library is large enough that a tree structure helps readers
# find related skills. Remove this line entirely when the flat `subject` is sufficient.
taxonomy_domain: agent/skill-system

# project: projects this skill is linked to. Array of {handle, role} objects.
# A non-empty project[] makes `grounding` schema-required; suggested role values:
# source-of-truth, consumer, mirror.
project:
  - handle: skill-graph
    role: source-of-truth
# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`
# pointing at an existing skill — otherwise validation fails. Omit
# `superseded_by` for any other stability value. See
# skill-metadata-protocol/field-reference.md § superseded_by for the full
# conditional contract.
stability: stable
# license: SPDX-compatible license identifier for the skill content.
license: MIT
# compatibility: runtime compatibility object. Prefer structured fields
# (`runtimes`, `node`) over free-text `notes`. Some Agent-Skills encoders
# still accept a top-level string `compatibility:` — the protocol-native
# shape is always the object.
compatibility:
  notes: "Markdown, YAML, JSON Schema"
# allowed-tools: optional runtime hint for tools the skill may use when loaded.
allowed-tools: Read Grep
# keywords: pushy activation surface — array of semantic phrases the router
# tokenizes for fuzzy matching. v8 cap: max 10. Keep terms a user would
# actually type when starting a task in this skill's domain.
keywords:
  - how to write a SKILL.md file
  - SKILL.md frontmatter YAML
  - Skill Metadata Protocol v8
  - Skill Graph schema fields
  - skill subject deployment target scope
  - skill description routing contract
  - audit-state sidecar
  - new skill scaffold template
  - SKILL.md authoring gate
# TEMPLATE NOTE: triggers is present because this skill is routable by explicit label.
# Remove this block if your skill activates only by keyword or path matching.
triggers:
  - skill-metadata-template
# paths: glob array of code surfaces this skill governs. Supports gitignore-
# style negation (e.g., `- "!skills/experimental/**"`). Each glob should map
# to ONE canonical skill — overlapping globs produce router ambiguity that
# the scope tiebreaker resolves arbitrarily. `scripts/skill-overlap.js`
# reports shared keyword recall as INFO. Omit this block if the skill is
# purely conceptual with no file surface.
#
# TEMPLATE NOTE: paths is present here because this template is the entry
# point whenever examples/skill-metadata-template.md is touched. Previous
# versions also listed `skills/**/SKILL.md` but that glob is owned by
# `skill-infrastructure`; tiebreaker picks it anyway.
paths:
  - examples/skill-metadata-template.md
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice, not imperative abstract form. Improves
# retrieval recall beyond keywords alone. Omit for purely label-routed skills.
# See skill-metadata-protocol/field-reference.md § examples.
examples:
  - "I'm writing a new skill from scratch — where do I start?"
  - "how do I choose subject and deployment_target for my new skill?"
  - "what's the difference between description and the ## Coverage section?"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.boundary to tell the router which skill owns the
# confusable territory. Leave absent until you have SEEN the router misfire;
# speculative anti_examples rarely match reality.
# See skill-metadata-protocol/field-reference.md § anti_examples.
anti_examples:
  - "refactor this skill to be more concise"           # → refactor, not authoring
  - "my skill's routing isn't activating — why?"       # → skill-router, not template
# workspace_tags was removed. Project belonging-entity identity lives in the
# `project[]` array near the top of the frontmatter.
relations:
  # TEMPLATE NOTE: boundary items may be bare skill names OR `{skill, reason}`
  # objects (v3). Reasons are strongly recommended — they make the boundary
  # self-documenting.
  #
  # This scaffold ships with empty `boundary` and `verify_with` arrays because
  # the skill-graph tooling repo has no peer skill library. In a real library,
  # populate the arrays as shown in the
  # commented example below (uncomment and replace with skills that exist in
  # YOUR workspace):
  #
  # boundary:
  #   - skill: refactor
  #     reason: "refactor is behavior-preserving code modification, not skill authoring"
  #   - skill: skill-router
  #     reason: "skill-router dispatches between existing skills at request time; this template creates a NEW skill"
  #   - skill: skill-infrastructure
  #     reason: "skill-infrastructure verifies the authored metadata of an existing skill; this template is the authoring-time guide"
  # verify_with:
  #   - skill-infrastructure
  boundary: []
  verify_with: []
  # OPTIONAL — io_contract (SKI-52): a deterministic, LLM-free composition
  # contract. Declares the abstract artifact TYPES this skill consumes (`inputs`)
  # and produces (`outputs`) as kebab-case tokens (NOT file paths). The builder
  # derives `depends_on` edges from output→input compatibility; broken chains and
  # cycles are flagged by `npm run check:io-composition`. Omit entirely when the
  # skill has no machine-checkable I/O contract — it forces no migration.
  # io_contract:
  #   inputs:
  #     - skill-md
  #   outputs:
  #     - audit-findings
# grounding: required when `deployment_target: project`. Declares the truth
# sources the skill anchors to (files, schemas, vendor docs) and the failure
# modes those sources prevent. Omit this entire block when the skill is
# universal-knowledge (grounding_mode: universal is implicit by absence).
# `subject_matter` replaces the earlier `domain_object`; the `subject` alias is retired.
grounding:
  subject_matter: Skill authoring for the Skill Metadata Protocol frontmatter
  grounding_mode: repo_specific
  truth_sources:
    - path: skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md
      anchor: schema-contract
      note: "Protocol anatomy and field requiredness"
    - path: schemas/SKILL_METADATA_PROTOCOL_schema.json
      line_range:
        start: 1
        end: 180
      note: "Frontmatter schema shape"
    - path: skill-audit-loop/SKILL_AUDIT_LOOP.md
      anchor: part-2--per-skill-audit-checklist
      note: "Canonical authoring and audit checklist"
  failure_modes:
    - placeholder_sludge
    - cargo_cult_meta_sections
    - description_coverage_collapse
    - authoring_gate_skipped
  evidence_priority: repo_code_first
---

# Skill Template — Scaffold

> **SCAFFOLD — NOT A PRODUCTION SKILL.** This file is the starting point authors copy when creating a new skill. It lives at `examples/skill-metadata-template.md` deliberately; production skills live at `skills/<name>/SKILL.md` with a sibling `audit-state.json`. The authoring flow is: copy → rename → classify → adapt → strip teaching annotations → seed the sidecar → verify → commit. Until you have completed those steps, the file you are editing is a *scaffold*, not a skill.

> **TEMPLATE NOTE — HOW TO READ THIS FILE:** This file is a real, valid, schema-conformant Skill Metadata Protocol skill whose *subject* is skill authoring itself. Read it as a finished specimen of the contract, then adapt it by (1) renaming the identity, (2) choosing `subject`, `deployment_target`, free-text `scope`, and `taxonomy_domain` when useful, (3) rewriting `description`, `## Coverage`, `## Philosophy`, and `## Verification` for your subject, (4) removing any section or field that does not apply to the skill's intended use, and (5) stripping ONLY the **`# TEMPLATE NOTE:` YAML comments and `> **TEMPLATE NOTE:**` body blockquotes** (authoring scaffolding) — the **field-purpose comments STAY** in your derived skill (they are co-located documentation, not scaffolding). Verify with `grep -n "TEMPLATE NOTE" <derived-skill>` returning zero hits AND `grep -c "^\s*#" <derived-skill>` showing the field-purpose comments are preserved. Never ship placeholder sludge (`your-skill-name`, `path/to/file`, `todo`). If a section does not apply, remove it — do not keep it and fill it with fake content. Convention spec: `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Inline field comments — the authoring convention`.

> **TEMPLATE NOTE — CONDITIONAL FIELDS:** `superseded_by` is required only when `stability: deprecated`. `routing_bundles` only applies when routing-group ownership is part of the skill contract. `triggers` and `paths` are shown because this template is both label-routable and file-activated; most skills need only one. `grounding` is REQUIRED when `project[]` is non-empty (a project-anchored skill); remove the block entirely for ambient/portable skills unless they ground in external specs. `public` is the boolean publishability gate (true = marketplace-safe; false = carries private data, never published) — independent of `project[]`. `project[]` and `repo[]` are optional but recommended; omit for ambient / cross-project skills. `lifecycle`, `runtime_telemetry`, and `portability` are NOT frontmatter — per [ADR-0019](../docs/adr/0019-audit-state-sidecar-separation.md) they live in the sibling `audit-state.json` sidecar (see `examples/skill-audit-state-template.md`), along with `schema_version`, `version`, `owner`, `freshness`, `drift_check`, the `eval_*` triple, and the four Audit Status verdicts. The audit/eval loop (`/audit:*`) owns that file; new-skill authors seed the 7 required sidecar fields and leave the verdict fields absent until a real audit or eval run writes evidence.

## Concept of the skill

**What it is:** A `SKILL.md` is a machine-routable, human-readable unit of agent guidance — v8 frontmatter (the routing + classification contract) plus a body of skill-content sections.
**Mental model:** Frontmatter is the contract a router reads to FIND the skill; the body is the teaching content an agent APPLIES once loaded. The five skill-content sections (this one, Coverage, Philosophy of the skill, Verification, Do NOT Use When) are required; audit/eval/provenance state lives in the sidecar.
**Why it exists:** To make a teaching-skill library scale — explicit relevance, scope, grounding, and relations so the right skill is found, stays in its lane, and can be audited.
**What it is NOT:** It is not a prompt snippet, an agent-runtime config, or a memory file; and the body sections are not optional prose — lint enforces them.
**Adjacent concepts:** the Skill Metadata Protocol (this contract), the Skill Graph (the library system), the Skill Audit Loop (the maintenance discipline).
**One-line analogy:** A skill is a well-catalogued library book — the frontmatter is the catalog card, the body is the text.
**Common misconception:** That `name` + `description` (the base Agent-Skills shape) is enough — two fields cannot route, group, or audit a real library.

## Coverage

- Frontmatter identity: `name`, `description`, `subject`, `deployment_target`, free-text `scope`, `taxonomy_domain` when useful, activation fields, relations, grounding, and the five flat Understanding fields when `comprehension_state` is present in the sidecar
- Sidecar identity: `schema_version`, `version`, `owner`, `freshness`, `drift_check`, eval status, verdicts, portability, and lifecycle in sibling `audit-state.json`
- Semantic layer discipline: how `description:` (routing contract, ≤ 3 sentences) differs from `## Coverage` (scope map, bulleted topic list) and why each must stay in its own layer
- Teaching-layer delivery: **field-purpose comments** (no prefix, STAY in derived skills) vs **`# TEMPLATE NOTE:` comments** and `> **TEMPLATE NOTE:**` blockquotes (authoring scaffolding, STRIPPED on derivation). See `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Inline field comments — the authoring convention`
- Body structure by intent: choose sections for how the agent will use the skill, not from retired `type` archetypes
- Grounding via `grounding`: when a skill should declare truth sources and failure modes, and when it should stay `grounding_mode: universal`
- drift evidence: when to record `drift_check.truth_source_hashes` in `audit-state.json` and how the drift sentinel consumes them
- Project belonging-entity tagging: when to populate `project[]` and `repo[]`, when to leave a skill ambient (omit both arrays), how `deployment_target` interacts with `project[]` membership
- Adapter workflow: how to strip a template down, how to detect and remove cargo-culted meta, and how to verify a new skill against `schemas/SKILL_METADATA_PROTOCOL_schema.json` before committing

## Philosophy of the skill

A template teaches by example, not by placeholder. A concrete, internally consistent specimen of a finished skill is a more reliable authoring reference than any amount of abstract scaffolding. The teaching layer — meta-commentary about how to read and adapt the template — must live in structurally distinct slots that disappear when the author tightens a new skill, never in the `## H2` section slots that AI agents copy verbatim when adapting the file.

## Key Files

| File | Purpose |
|---|---|
| `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` | Authoritative field semantics: required vs optional, conditional requiredness, and relationship to the plain `SKILL.md` format |
| `skill-metadata-protocol/field-reference.md` | Per-field authoring guidance and decision details |
| `schemas/SKILL_METADATA_PROTOCOL_schema.json` | Enforceable JSON Schema for the frontmatter protocol |
| `skill-audit-loop/SKILL_AUDIT_LOOP.md#part-2--per-skill-audit-checklist` | The audit checklist every new skill should pass before commit |

## Verification

Use this checklist as the authoring gate before committing a skill adapted from this template. Every item must pass.

- [ ] Every retained field has a real reason to exist in the new skill
- [ ] Every removed field was removed because it is retired, irrelevant to the new skill, or replaced by the sidecar contract
- [ ] Body sections match the skill's intent and expected agent use
- [ ] `description:` is ≤ 3 sentences, contains pushy trigger phrases, and names an explicit negative boundary
- [ ] `## Coverage` is a scope map of distinct topics, not a one-line restate of the description
- [ ] `audit-state.json` exists and has the seven required fields: `schema_version`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, and `routing_eval`
- [ ] `drift_check` is an object with `last_verified`; local `truth_source_hashes` are recorded only when the drift tool can compute them
- [ ] `compatibility` is an object (not a free-text string) when present
- [ ] `eval_artifacts`, `eval_state`, and `routing_eval` in `audit-state.json` reflect actual artifact, runtime, and routing-eval evidence
- [ ] All `relations` entries point to skills that exist in the target repo; `boundary` entries with unclear rationale use the `{skill, reason}` form
- [ ] `project[]` is populated with `{handle, role}` entries when the skill is project-specific OR absent when the skill is ambient — same for `repo[]`. Not left with stale or placeholder handles.
- [ ] No placeholder sludge (`your-skill-name`, `path/to/file`, `todo`) remains
- [ ] No `> **TEMPLATE NOTE:**` blockquotes or `# TEMPLATE NOTE:` YAML comments remain in the adapted skill
- [ ] The adapted skill validates against `schemas/SKILL_METADATA_PROTOCOL_schema.json` as a real skill

## Do NOT Use When

| Instead of this template | Use | Why |
|---|---|---|
| `skill-metadata-template` | the target skill directly | Editing an existing skill is refactor-in-place, not authoring from a template |
| `skill-metadata-template` | direct documentation work | General technical writing is not skill authoring; use the repo's docs workflow for guides and specs |
| `skill-metadata-template` | `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` | When you need the full field reference, read the contract document directly |

## References

- `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Relationship to the SKILL.md format` - how Skill Metadata Protocol extends the base format
- `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Example Template Rule` — the no-placeholder-sludge rule this template enforces
- `docs/adr/0019-audit-state-sidecar-separation.md` — why audit/eval/provenance state lives in `audit-state.json`
- `skill-audit-loop/SKILL_AUDIT_LOOP.md#part-2--per-skill-audit-checklist` — the checklist this template's Verification section is derived from
