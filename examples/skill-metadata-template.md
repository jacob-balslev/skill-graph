---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.schema.json
#
# ============================================================================
# SCAFFOLD — this file is a skill template, not a production skill.
# ============================================================================
#
# Adopters COPY this file to `skills/<new-name>/SKILL.md` and then edit it to
# author a new skill. Two distinct comment conventions live in this template
# — they have OPPOSITE lifecycles, do not confuse them:
#
#   1. Field-purpose comments — short blocks (typically 2-4 lines) immediately
#      above each field, naming what the field is, its allowed values, and
#      when-to-use. Example:
#
#        # operation: cognitive operation enabled (Bloom-grounded). 1 of 4.
#        # know (declarative) / do (procedural) / decide (judgment) /
#        # modify (context-injection).
#        operation: know
#
#      → **STAY in the derived skill.** These are the design intent at the
#        point of authoring. Cold-start agents and human authors read them
#        instead of opening `docs/field-reference.md`. Do NOT strip these.
#        Canonical source for field-purpose content is `docs/field-reference.md`;
#        the inline comment is the abridged summary. See
#        `SKILL_METADATA_PROTOCOL.md § Inline field comments — the authoring convention`.
#
#   2. `# TEMPLATE NOTE:` comments — authoring scaffolding about HOW to use
#      the template itself, OR about this specific scaffold (e.g., why
#      `routing_eval` stays `absent` on the template). Example:
#
#        # TEMPLATE NOTE: Be pushy in your description — Claude tends to
#        # under-trigger skills, so descriptions should read as commands...
#
#      → **STRIPPED on derivation.** Run `grep -n "TEMPLATE NOTE" <derived>`
#        before commit; the result MUST be zero hits. Every `# TEMPLATE NOTE:`
#        line and every `> **TEMPLATE NOTE:**` body blockquote is removed.
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
schema_version: 7
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
description: "Use when creating a new SKILL.md, adapting an existing skill to a different archetype, or teaching an author the canonical frontmatter and body structure. Covers schema-conformant frontmatter, archetype-aware body layout, semantic-layer discipline (description vs Coverage), teaching-layer mechanics (TEMPLATE NOTE blockquotes and YAML comments), and the authoring gate. Do NOT use when modifying an already-written skill (edit that skill directly) or when writing general technical documentation (use `docs-development`)."
version: 1.0.0
type: capability
# TEMPLATE NOTE: category is the closed six-value enum — exactly one of:
# foundations / engineering / design / quality / agent / product. See
# docs/skill-metadata-protocol.md § Category and SKILL_METADATA_PROTOCOL.md §
# Classification for the full contract. The scaffold itself is an agent-system authoring
# tool, hence `agent`; replace with the correct value for your subject when
# adapting.
category: agent
# TEMPLATE NOTE: domain is the OPTIONAL hierarchical domain path (slash-
# delimited, lowercase kebab-case segments). Use it only when the skill library
# is large enough that a tree structure helps readers find related skills.
# Remove this line entirely when the flat `category` above is sufficient.
domain: agent/skill-system
scope: reference
owner: skill-graph-maintainer
freshness: "2026-04-17"
# TEMPLATE NOTE: drift_check is an object. `last_verified` is required.
# `truth_source_hashes` is optional — record it with `node scripts/skill-graph-drift.js
# --record --apply <skill-dir>`.
drift_check:
  last_verified: "2026-04-17"
# === Eval-health: three orthogonal axes ===
# Introduced in schema_version 2 to split what v1's single `eval_status` enum
# collapsed. The three fields answer three different questions and must NOT
# be collapsed back into a boolean. See docs/field-rationale.md § eval_artifacts
# + § eval_state + § routing_eval for the design rationale.

# eval_artifacts: disk-truth — does an eval file exist on disk?
# none (no intent) / planned (intent declared, no file yet) / present (file exists).
# `planned` is a temporary state; move to `present` once the artifact ships.
# ADR-0005 staleness guard: `planned` past `lifecycle.stale_after_days` warns.
eval_artifacts: planned

# eval_state: runtime-truth — has the eval been run and passed?
# unverified (no run yet, or no file) / passing (one-shot green) / monitored (cadenced green).
# `monitored` is strictly stronger than `passing` — advance here when continuous
# cadence runs against this skill. Forward state, not aspirational.
eval_state: unverified

# routing_eval: routing-coverage — is the skill's activation verified by the harness?
# absent (not verified) / present (gated by lint check 12; harness must exit 0).
# `present` requires populated `examples` + `anti_examples` (below) AND a passing
# run of `node scripts/skill-graph-routing-eval.js --skill <name>`. See
# docs/field-reference.md § routing_eval for the full enforcement contract.
#
# TEMPLATE NOTE: on THIS scaffold, routing_eval MUST stay `absent` even though
# the harness happens to report every case passing. The scaffold's job is to
# model the correct authoring-time default for a brand-new un-verified skill.
# If flipped to `present`, every skill copy-pasted from the scaffold would
# inherit a false attestation until the author noticed and downgraded. In your
# derived copy, leave this line `absent` at first commit; flip to `present` only
# after the harness exits 0 on YOUR skill's own examples + anti_examples.
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
  - how to write a SKILL.md file
  - SKILL.md frontmatter YAML
  - Skill Metadata Protocol v7
  - Skill Graph schema fields
  - skill archetype capability vs workflow
  - skill description routing contract
  - drift_check eval_artifacts routing_eval
  - new skill scaffold template
  - SKILL.md authoring gate
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
# owned by `skill-infrastructure` (the audit tooling that verifies every SKILL.md against the
# schema). Two skills claiming the same glob produces router ambiguity — the scope
# tiebreaker (`codebase` > `reference`) picks skill-infrastructure anyway, and reference-scope
# skills are looked-up rather than path-routed. Lesson: each path glob should map to
# ONE canonical skill; `scripts/skill-overlap.js` reports shared keyword recall as INFO.
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
  #   - docs-development
  boundary: []
  verify_with: []
# TEMPLATE NOTE: grounding is REQUIRED for grounded skills that make concrete
# repo claims. Remove this entire block if your skill has grounding_mode: universal
# and does not anchor to truth sources in the repo.
grounding:
  domain_object: Skill authoring for the Skill Metadata Protocol frontmatter
  grounding_mode: repo_specific
  truth_sources:
    - path: docs/skill-metadata-protocol.md
      anchor: the-52-authored-fields-grouped-by-purpose
      note: "Protocol anatomy and field requiredness"
    - path: schemas/skill.schema.json
      line_range:
        start: 480
        end: 590
      note: "Grounding schema shape"
    - path: SKILL_AUDIT_LOOP.md § Part 2 — Per-Skill Audit Checklist
      note: "Canonical authoring and audit checklist"
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

> **TEMPLATE NOTE — HOW TO READ THIS FILE:** This file is a real, valid, schema-conformant Skill Metadata Protocol skill whose *subject* is skill authoring itself. Read it as a finished specimen of the contract, then adapt it by (1) renaming the identity, (2) rewriting `description`, `## Coverage`, `## Philosophy of the skill`, and `## Key Files` for your subject, (3) rewriting `## Verification` to be your skill's self-check, (4) removing any section or field that does not apply to your archetype, and (5) stripping the `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments — they are authoring scaffolding, never skill content. Never ship placeholder sludge (`your-skill-name`, `path/to/file`, `todo`). If a section does not apply, remove it — do not keep it and fill it with fake content. (Section headings renamed 2026-05-26: `## Philosophy` → `## Philosophy of the skill`; `## Concept Card` → `## Concept of the skill`.)

> **TEMPLATE NOTE — CONDITIONAL FIELDS:** `extends` is valid only when `type: overlay`. `routing_bundles` only applies when routing-group ownership is part of the skill contract. `triggers` and `paths` are shown because this template is both label-routable and file-activated; most skills need only one. `grounding` is REQUIRED for `scope: codebase` skills; remove the block entirely for `scope: portable` or `scope: reference`. `workspace_tags` is optional — omit for ambient / cross-project skills. `lifecycle` is optional — omit when staleness is not meaningful. `runtime_telemetry` is optional — omit when no feedback pipeline exists. Health Block fields live in the authored `SKILL.md`, but the audit/eval loop owns them; new-skill authors should leave them absent until a real audit or eval run writes evidence.

## Coverage

- Frontmatter identity: `name`, `description`, `version`, `type`, `category`, `scope`, `owner`, and the governance fields required by every Skill Metadata Protocol skill
- Semantic layer discipline: how `description:` (routing contract, ≤ 3 sentences) differs from `## Coverage` (scope map, bulleted topic list) and why each must stay in its own layer
- Teaching-layer delivery: how to use `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments to teach authors without cargo-culting meta sections into every new skill
- Archetype-driven body structure: which `## H2` sections each of the four archetypes (`capability`, `workflow`, `router`, `overlay`) must contain
- Grounding via `grounding`: when a skill should declare truth sources and failure modes, and when it should stay `grounding_mode: universal`
- drift evidence: when to record `drift_check.truth_source_hashes` and how the drift sentinel consumes them
- Workspace tagging: when to add `workspace_tags`, when to leave a skill ambient, and how workspace semantic-tag mapping composes
- Adapter workflow: how to strip a template down, how to detect and remove cargo-culted meta, and how to verify a new skill against `schemas/skill.schema.json` before committing

## Philosophy of the skill

A template teaches by example, not by placeholder. A concrete, internally consistent specimen of a finished skill is a more reliable authoring reference than any amount of abstract scaffolding. The teaching layer — meta-commentary about how to read and adapt the template — must live in structurally distinct slots that disappear when the author tightens a new skill, never in the `## H2` section slots that AI agents copy verbatim when adapting the file.

## Key Files

| File | Purpose |
|---|---|
| `docs/skill-metadata-protocol.md` | Authoritative field semantics: required vs optional, conditional requiredness, relationship to the plain `SKILL.md` format, archetype section map |
| `schemas/skill.schema.json` | Enforceable JSON Schema for the frontmatter protocol |
| `../SKILL_AUDIT_LOOP.md#part-2--per-skill-audit-checklist` | The audit checklist every new skill should pass before commit |

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
| `skill-metadata-template` | `docs-development` | General technical writing is not skill authoring; use `docs-development` for docs, guides, and specs |
| `skill-metadata-template` | `docs/skill-metadata-protocol.md` | When you need the full field reference, read the contract document directly |

## References

- `docs/skill-metadata-protocol.md § Relationship to the SKILL.md format` - how Skill Metadata Protocol extends the base format
- `docs/skill-metadata-protocol.md § Example Template Rule` — the no-placeholder-sludge rule this template enforces
- `docs/skill-metadata-protocol.md § Archetype section map` — required H2 sections per archetype
- `docs/adr/0011-split-audit-verdict-into-four-verdicts.md` — the Health Block four-verdict split that current v7 skills use
- `../SKILL_AUDIT_LOOP.md#part-2--per-skill-audit-checklist` — the checklist this template's Verification section is derived from
