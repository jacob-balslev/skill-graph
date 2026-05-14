---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
#
# ============================================================================
# SCAFFOLD — this file is a skill template, not a production skill.
# ============================================================================
#
# Adopters COPY this file to `skills/<new-name>/SKILL.md` and then edit it to
# author a new skill. Every `# TEMPLATE NOTE:` YAML comment and every
# `> **TEMPLATE NOTE:**` body blockquote is authoring scaffolding that MUST be
# stripped from the derived copy before shipping.
#
# Field values here are deliberate authoring-time defaults, not aspirational
# targets. In particular `eval_artifacts: planned`, `eval_state: unverified`,
# and `routing_eval: absent` (see comment on the routing_eval line below)
# encode the correct starting state for a brand-new un-verified skill —
# flipping them to `present` on this scaffold would make every derived skill
# inherit a false attestation until the author noticed.
#
# Build automation treats this file specially: the sample manifest
# generator ingests it only under `--include-template`, and the library-wide
# harness counts it as the 9th "skill" only when the flag is set. It is NOT
# routable in day-to-day skill dispatch — `scope: reference` keeps it out of
# the normal routing pool.
# ============================================================================
schema_version: 4
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
description: "Use when creating a new SKILL.md, adapting an existing skill to a different archetype, or teaching an author the canonical frontmatter and body structure. Covers schema-conformant frontmatter, archetype-aware body layout, semantic-layer discipline (description vs Coverage), teaching-layer mechanics (TEMPLATE NOTE blockquotes and YAML comments), and the authoring gate. Do NOT use when modifying an already-written skill (edit that skill directly) or when writing general technical documentation (use the documentation skill)."
version: 1.0.0
type: capability
category: knowledge
# TEMPLATE NOTE: domain is the OPTIONAL hierarchical domain path (slash-
# delimited, lowercase kebab-case segments). Use it only when the skill library
# is large enough that a tree structure helps readers find related skills.
# Remove this line entirely when the flat `category` above is sufficient.
domain: skill-system/authoring
scope: reference
owner: skill-graph-maintainer
freshness: "2026-04-17"
# TEMPLATE NOTE: drift_check is an object. `last_verified` is required.
# `truth_source_hashes` is optional — record it with `node scripts/skill-graph-drift.js
# --record --apply <skill-dir>`.
drift_check:
  last_verified: "2026-04-17"
# TEMPLATE NOTE: eval_artifacts, eval_state, and routing_eval are the three
# orthogonal eval-health axes introduced in schema_version 2. Set eval_artifacts
# to `planned` only as a temporary state — move to `present` once the artifact
# ships. Set eval_state to `unverified` when no run has been recorded yet.
#
# routing_eval: `present` is LINT-ENFORCED since [Unreleased]. Setting `present`
# requires (1) populated `examples` + `anti_examples` below, AND (2) a passing
# run of `node scripts/skill-graph-routing-eval.js --skill <name>`. Lint check
# 12 surfaces each failing prompt. Default to `absent` when authoring; flip
# to `present` only after the harness agrees. See docs/field-reference.md §
# routing_eval for the full enforcement contract.
#
# SCAFFOLD NOTE — on this specific file (`examples/skill-metadata-template.md`),
# routing_eval MUST stay `absent` even though the harness happens to report
# every case passing. The scaffold's job is to model the correct authoring-
# time default for a brand-new un-verified skill. If this line were flipped
# to `present`, every skill copy-pasted from the scaffold would inherit a
# false attestation until the author noticed and downgraded. In your
# derived copy, leave this line `absent` at first commit; flip it to
# `present` only after `node scripts/skill-graph-routing-eval.js --skill
# <your-skill-name>` exits 0 on YOUR skill's own examples + anti_examples.
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
# TEMPLATE NOTE: Optional. Populate eval_last_run only after the skill has a
# real eval receipt (scorecard, grader history, CI run). Leave it absent for a
# brand-new skill with eval_state: unverified.
# eval_last_run:
#   at: "2026-05-12T09:30:00Z"
#   status: pass
#   runner: "node scripts/skill-audit.js --graded"
#   receipt: "examples/audits/<skill>/scorecard.md"
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
# TEMPLATE NOTE: compatibility is an object. Prefer structured fields
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
  - writing a new skill
  - skill frontmatter
  - skill graph contract
  - capability or workflow
  - pick capability or workflow
  - skill type pick
  - description vs coverage
  - description versus coverage
  - authoring a skill
  - skill archetype
  - frontmatter structure
  - skill body layout
  - teaching layer
# TEMPLATE NOTE: triggers is present because this skill is routable by explicit label.
# Remove this block if your skill activates only by keyword or path matching.
triggers:
  - skill-metadata-template
# TEMPLATE NOTE: paths is present because this template is the entry point whenever
# examples/skill-metadata-template.md itself is touched. the protocol supports gitignore-style negation —
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
  - examples/skill-metadata-template.md
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
# TEMPLATE NOTE: workspace_tags replaces v3 project_tags. Omit it for ambient / cross-project
# skills (the common case). Add literal project handles or semantic tags when
# the skill is relevant to a subset of projects in a multi-project workspace.
# See docs/field-decision-guide.md § 4 for the full decision tree.
#
# Example — this template is useful across every skill-authoring project, but
# the semantic tag scopes it to the Skill Graph authoring workflow rather than
# arbitrary project docs. A workspace config at `.skill-graph/config.json` can
# map your literal project handles to tag sets that include `skill-authoring`,
# so one tag reaches many projects.
workspace_tags:
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
    - skill: skill-router
      reason: "skill-router dispatches between existing skills at request time; this template creates a NEW skill"
    - skill: graph-audit
      reason: "graph-audit verifies the authored metadata of an existing skill; this template is the authoring-time guide"
  verify_with:
    - documentation
# TEMPLATE NOTE: grounding is REQUIRED for grounded skills that make concrete
# repo claims. Remove this entire block if your skill has grounding_mode: universal
# and does not anchor to truth sources in the repo.
grounding:
  domain_object: Skill authoring for the Skill Metadata Protocol frontmatter
  grounding_mode: repo_specific
  truth_sources:
    - path: docs/skill-metadata-protocol.md
      anchor: the-40-authored-fields-grouped-by-purpose
      note: "Protocol anatomy and field requiredness"
    - path: schemas/skill.schema.json
      line_range:
        start: 480
        end: 590
      note: "Grounding schema shape"
    - path: SKILL_AUDIT_CHECKLIST.md
      anchor: canonical-checklist
      note: "Audit checklist this template supports"
  failure_modes:
    - placeholder_sludge
    - cargo_cult_meta_sections
    - description_coverage_collapse
    - authoring_gate_skipped
  evidence_priority: repo_code_first
# TEMPLATE NOTE: portability declares which external agent runtimes this skill is
# known to work on. `readiness` is the operational rating: `declared` (claim only),
# `scripted` (export tooling exists), or `verified` (proven with a receipt). `targets`
# is the list of destination runtimes. Today the supported portable target is `skill-md`
# (see `schemas/skill.schema.json`). Other runtimes (cursor, windsurf, copilot, agents-md)
# were removed from the enum in 0.3.0 pending working transforms — re-add via RFC if
# adoption pressure appears. Remove this block if the skill is internal-only.
portability:
  readiness: scripted
  targets:
    - skill-md
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
  feedback_source: .skill-graph/telemetry/skill-metadata-template.jsonl
  last_updated: "2026-04-17"
  metrics:
    sample_size: 0
    success_rate: 0
---

# Skill Template — Scaffold

> **SCAFFOLD — NOT A PRODUCTION SKILL.** This file is the starting point authors copy when creating a new skill. It lives at `examples/skill-metadata-template.md` deliberately; production skills live at `skills/<name>/SKILL.md`. The authoring flow is: copy → rename → adapt → strip teaching annotations → verify → commit. Until you have completed those steps, the file you are editing is a *scaffold*, not a skill.

> **TEMPLATE NOTE — HOW TO READ THIS FILE:** This file is a real, valid, schema-conformant Skill Metadata Protocol skill whose *subject* is skill authoring itself. Read it as a finished specimen of the contract, then adapt it by (1) renaming the identity, (2) rewriting `description`, `## Coverage`, `## Philosophy`, and `## Key Files` for your subject, (3) rewriting `## Verification` to be your skill's self-check, (4) removing any section or field that does not apply to your archetype, and (5) stripping the `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments — they are authoring scaffolding, never skill content. Never ship placeholder sludge (`your-skill-name`, `path/to/file`, `todo`). If a section does not apply, remove it — do not keep it and fill it with fake content.

> **TEMPLATE NOTE — CONDITIONAL FIELDS:** `extends` is valid only when `type: overlay`. `routing_bundles` only applies when routing-group ownership is part of the skill contract. `triggers` and `paths` are shown because this template is both label-routable and file-activated; most skills need only one. `grounding` is REQUIRED for `scope: codebase` skills; remove the block entirely for `scope: portable` or `scope: reference`. `workspace_tags` is optional — omit for ambient / cross-project skills. `lifecycle` is optional — omit when staleness is not meaningful. `runtime_telemetry` is optional — omit when no feedback pipeline exists. Generated manifest health fields belong in `skills.manifest.json`, not in the authored `SKILL.md`.

## Coverage

- Frontmatter identity: `name`, `description`, `version`, `type`, `category`, `scope`, `owner`, and the governance fields required by every Skill Metadata Protocol skill
- Semantic layer discipline: how `description:` (routing contract, ≤ 3 sentences) differs from `## Coverage` (scope map, bulleted topic list) and why each must stay in its own layer
- Teaching-layer delivery: how to use `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments to teach authors without cargo-culting meta sections into every new skill
- Archetype-driven body structure: which `## H2` sections each of the four archetypes (`capability`, `workflow`, `router`, `overlay`) must contain
- Grounding via `grounding`: when a skill should declare truth sources and failure modes, and when it should stay `grounding_mode: universal`
- drift evidence: when to record `drift_check.truth_source_hashes` and how the drift sentinel consumes them
- v4 workspace tagging: when to add `workspace_tags`, when to leave a skill ambient, and how workspace semantic-tag mapping composes
- Adapter workflow: how to strip a template down, how to detect and remove cargo-culted meta, and how to verify a new skill against `schemas/skill.schema.json` before committing

## Philosophy

A template teaches by example, not by placeholder. A concrete, internally consistent specimen of a finished skill is a more reliable authoring reference than any amount of abstract scaffolding. The teaching layer — meta-commentary about how to read and adapt the template — must live in structurally distinct slots that disappear when the author tightens a new skill, never in the `## H2` section slots that AI agents copy verbatim when adapting the file.

## Key Files

| File | Purpose |
|---|---|
| `docs/skill-metadata-protocol.md` | Authoritative field semantics: required vs optional, conditional requiredness, relationship to the plain `SKILL.md` format, archetype section map |
| `schemas/skill.schema.json` | Enforceable JSON Schema for the frontmatter protocol |
| `SKILL_AUDIT_CHECKLIST.md` | The audit checklist every new skill should pass before commit |

## Verification

Use this checklist as the authoring gate before committing a skill adapted from this template. Every item must pass.

- [ ] Every retained field has a real reason to exist in the new skill
- [ ] Every removed field was removed because of archetype or grounding mismatch, not laziness
- [ ] Body sections match the skill's declared archetype per `docs/skill-metadata-protocol.md § Archetype section map`
- [ ] `description:` is ≤ 3 sentences, contains pushy trigger phrases, and names an explicit negative boundary
- [ ] `## Coverage` is a scope map of distinct topics, not a one-line restate of the description
- [ ] `drift_check` is an object with `last_verified`; `truth_source_hashes` has been recorded when truth sources exist
- [ ] `compatibility` is an object (not a free-text string) when present
- [ ] `eval_artifacts` matches actual artifact presence (if `present`, an eval file exists under `examples/evals/` or alongside the skill); `eval_state` reflects whether a real passing run has been recorded; `routing_eval` reflects whether trigger/routing coverage is explicitly checked
- [ ] All `relations` entries point to skills that exist in the target repo; `boundary` entries with unclear rationale use the `{skill, reason}` form
- [ ] `workspace_tags` is present when the skill is project-specific OR absent when the skill is ambient — not left at a stale value
- [ ] No placeholder sludge (`your-skill-name`, `path/to/file`, `todo`) remains
- [ ] No `> **TEMPLATE NOTE:**` blockquotes or `# TEMPLATE NOTE:` YAML comments remain in the adapted skill
- [ ] The adapted skill validates against `schemas/skill.schema.json` as a real skill

## Do NOT Use When

| Instead of this template | Use | Why |
|---|---|---|
| `skill-metadata-template` | the target skill directly | Editing an existing skill is refactor-in-place, not authoring from a template |
| `skill-metadata-template` | `documentation` | General technical writing is not skill authoring; use `documentation` for docs, guides, and specs |
| `skill-metadata-template` | `docs/skill-metadata-protocol.md` | When you need the full field reference, read the contract document directly |

## References

- `docs/skill-metadata-protocol.md § Relationship to the SKILL.md format` - how Skill Metadata Protocol extends the base format
- `docs/skill-metadata-protocol.md § Example Template Rule` — the no-placeholder-sludge rule this template enforces
- `docs/skill-metadata-protocol.md § Archetype section map` — required H2 sections per archetype
- `docs/manifest-field-mapping.md § Migration Note — v2 → v3` — the field-name cleanup the v4 bump introduced
- `SKILL_AUDIT_CHECKLIST.md` — the checklist this template's Verification section is derived from
