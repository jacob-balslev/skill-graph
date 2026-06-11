---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: markdown-post-frontmatter-validation
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when authoring or reviewing the frontmatter of a markdown post — checking required fields (title, date, slug, tags), validating against the content schema in `lib/content/schema.ts`, catching ambiguous date formats or tags not in the controlled vocabulary, and ensuring the slug matches the file path. Activate this skill whenever the task touches files under `content/posts/**/*.md`, the `parsePostFrontmatter()` helper, or any code path that reads YAML frontmatter from a content file. Do NOT use for general YAML schema design (use a generic schema-design skill) or for chasing a specific build-time validation failure (use debugging)."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: backend-engineering
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: false
# taxonomy_domain: optional hierarchical sub-path within `subject`. Slash-delimited
# lowercase kebab-case segments. rename of the original v8 `domain`. Remove when the flat
# `subject` is sufficient.
taxonomy_domain: content/markdown/frontmatter
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Markdown post frontmatter validation for the markdown-static-site example project — required fields, date format, slug consistency, controlled-vocabulary tagging."
# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
license: MIT
# compatibility: runtime compatibility object. Prefer structured fields
# (`runtimes`, `node`) over free-text `notes`.
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "Astro / Next / Eleventy / Hugo all read YAML frontmatter; the validation pattern is portable across them."
allowed-tools: Read Grep
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
keywords:
  - markdown frontmatter
  - post frontmatter
  - frontmatter validation
  - content schema
  - parsePostFrontmatter
  - YAML frontmatter
  - title required
  - tag vocabulary
  - slug mismatch
  - date format
  - controlled vocabulary
  - markdown post metadata
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - markdown-post-frontmatter-validation
# paths: glob array of code surfaces this skill governs. Supports gitignore-style
# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.
paths:
  - "content/posts/**/*.md"
  - "lib/content/schema.ts"
  - "lib/content/parse-frontmatter.ts"
  - "!**/*.test.md"
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "validate the frontmatter of a new post against our content schema"
  - "why does the build fail when I add a tag like `Politics` (capital P)?"
  - "review this post's frontmatter — is the date format correct?"
  - "explain how the slug is derived from the file path"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "design a YAML schema for a different domain"
  - "the build is failing — what's the actual error?"
  - "rewrite parsePostFrontmatter for performance"
# relations: typed graph edges to sibling skills. Current fields:
# related (adjacency for browse / co-routing expansion) /
# suppresses (exclude listed skills from co-routing when THIS skill wins; write reason
#             as "I own this exclusively over X", not "use X instead") /
# boundary (DEPRECATED alias of suppresses, retained for unmigrated skills) /
# verify_with (cross-check; co-loaded as one-hop expansion) /
# depends_on (composition; transitive — A→B→C loads all three) /
# broader / narrower (SKOS-style generalization) /
# disjoint_with (mutual exclusion for incompatible ownership).
relations:
  related:
    - documentation
    - debugging
    - refactor
  verify_with:
    - testing-strategy
# grounding: required when `project[]` is non-empty. Declares the truth sources
# the skill anchors to and the failure modes those sources prevent. Omit when the
# skill is universal-knowledge. `subject_matter` replaces v8 `domain_object`.
grounding:
  subject_matter: "Markdown post frontmatter — the YAML block at the top of every content file that drives the site's index, routing, and rendering"
  grounding_mode: repo_specific
  truth_sources:
    - content/posts/_template.md
    - lib/content/schema.ts
    - lib/content/parse-frontmatter.ts
  failure_modes:
    - missing_required_title_field
    - ambiguous_date_format_no_timezone
    - tag_not_in_controlled_vocabulary
    - slug_mismatch_with_file_path
    - frontmatter_block_not_terminated
  evidence_priority: repo_code_first
# project: projects this skill is linked to. Array of {handle, role} objects.
# Non-empty project[] anchors the skill to a project and requires `grounding`.
# Suggested role values: source-of-truth, consumer, mirror. Replaces original v8 `workspace_tags`.
project:
  - handle: markdown-static-site
    role: primary
---

# Markdown Post Frontmatter Validation

## Concept of the skill

**What it is:** The project-specific validation discipline for the YAML frontmatter on markdown posts.
**Mental model:** Frontmatter is a typed interface between content files and the site runtime.
**Why it exists:** Routing, indexes, tags, dates, and previews all depend on frontmatter being complete and unambiguous.
**What it is NOT:** It is not general YAML schema design, parser performance work, or debugging a specific failed build.
**Adjacent concepts:** Content schemas, slug derivation, controlled vocabularies, date normalization.
**One-line analogy:** It is the checklist that makes every post safe for the build to consume.
**Common misconception:** If the markdown renders, the frontmatter is good enough; metadata can break listing pages even when body content renders.

## Coverage

- Required-field enforcement — every post must declare `title`, `date`, `slug`, and `tags`; missing fields fail the build at parse time
- Date format discipline — ISO 8601 with explicit timezone (`2026-05-06T12:00:00Z`); ambiguous formats like `2026-05-06` or `5/6/26` are rejected
- Slug-to-path consistency — the `slug` field must match the post's directory name; out-of-sync slugs cause silent route conflicts
- Controlled-vocabulary tagging — every tag in the post's `tags` array must appear in `lib/content/tag-vocabulary.ts`; lowercase, hyphen-separated, no synonyms
- Schema evolution — when `lib/content/schema.ts` changes, every post's frontmatter is re-validated; existing posts that violate the new schema are flagged before the next build runs
- Reserved-field protection — fields like `_id`, `_internal`, or any underscore-prefixed key are reserved for the build pipeline and rejected in author-facing frontmatter

## Philosophy of the skill

The frontmatter block is the contract every post makes with the site's index, the router, and the renderer. If that contract is loose — if posts can omit fields, use ambiguous dates, or invent ad-hoc tags — the index drifts, routes silently overlap, and the search surface degrades. The cost of catching frontmatter bugs at build time is one re-run; the cost of catching them in production is a broken page or a missing entry in the archive. The rule is: validate at parse time, fail loud, and keep the schema small enough that authors can hold it in their head.

## Key Files

| File | Purpose |
|---|---|
| `content/posts/_template.md` | The canonical template every new post copies — its frontmatter is the worked example of every required field |
| `lib/content/schema.ts` | The TypeScript schema (Zod or equivalent) that runtime validation calls |
| `lib/content/parse-frontmatter.ts` | The thin wrapper that reads the YAML block and runs `schema.parse()` — the failure surface for build-time errors |

## Verification

Before merging any change to a post's frontmatter or to the schema:

- [ ] Every post has the four required fields: `title`, `date`, `slug`, `tags`
- [ ] `date` is ISO 8601 with timezone (no naked `YYYY-MM-DD`, no locale-formatted dates)
- [ ] `slug` matches the post's directory name exactly — not derived from `title` at runtime
- [ ] Every tag in `tags` is present in `lib/content/tag-vocabulary.ts` (run `npm run check:tags` to confirm)
- [ ] No underscore-prefixed fields (`_id`, `_internal`, etc.) — those are reserved for the pipeline
- [ ] Schema changes (`lib/content/schema.ts`) are paired with a `npm run validate:posts` pass against the entire `content/posts/**/*.md` set

## Do NOT Use When

| Use instead | When |
|---|---|
| (a generic schema-design skill) | The task is designing a new YAML schema for an unrelated domain |
| `debugging` | A specific build is failing and you need to reproduce the validation error from logs |
| `documentation` | The task is writing a runbook or contributor doc about the frontmatter format |
| `refactor` | The task is restructuring `parse-frontmatter.ts` without changing the validation contract |
