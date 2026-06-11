---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: migrate-posts-to-v2-frontmatter
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when migrating every existing post in `content/posts/**/*.md` to the v2 frontmatter schema — adding the new required `summary` field, normalizing `tags` to the controlled vocabulary, converting bare-date `date` strings to ISO 8601 with timezone, and re-validating every post against the v2 schema before the next build runs. Activate this skill whenever the task references migration `0007-frontmatter-v2`, the v2 frontmatter rollout, or asks how to safely change a required-field set across a populated content tree without breaking the build. Do NOT use for unrelated migrations (use a generic content-migration skill or write a fresh one) or for general schema-design questions (use a schema-design skill)."

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
taxonomy_domain: content/migrations
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Four-phase frontmatter migration workflow for the markdown-static-site example project — add nullable field, backfill, human review, flip validator."
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
  notes: "Markdown content tree under content/posts/; assumes Zod or similar runtime validator."
allowed-tools: Read Grep Bash
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
keywords:
  - migrate posts
  - frontmatter v2 migration
  - 0007 frontmatter v2
  - content schema migration
  - tag vocabulary normalization
  - bare-date conversion
  - safe content migration
  - post backfill
  - frontmatter migration
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - migrate-posts-to-v2-frontmatter
# paths: glob array of code surfaces this skill governs. Supports gitignore-style
# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.
paths:
  - "scripts/migrate-frontmatter-v2.ts"
  - "lib/content/schema.ts"
  - "lib/content/tag-vocabulary.ts"
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "run the v2 frontmatter migration on every post in `content/posts/`"
  - "the v2 migration's tag-normalization step is rejecting some valid tags — what's safe to do?"
  - "verify that every post passes the v2 schema before flipping the validator"
  - "design migration 0008 to drop the legacy `excerpt` field now that `summary` is canonical"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "design a new frontmatter schema for a different domain"
  - "the migration is failing in CI — what's wrong?"
  - "write the v2 frontmatter doc for new contributors"
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
  depends_on:
    - skill: testing-strategy
      min_version: "^1.0.0"
# grounding: required when `project[]` is non-empty. Declares the truth sources
# the skill anchors to and the failure modes those sources prevent. Omit when the
# skill is universal-knowledge. `subject_matter` replaces v8 `domain_object`.
grounding:
  subject_matter: "The 0007 frontmatter-v2 migration — a multi-step procedure that adds a required field, normalizes the tag vocabulary, converts bare-date strings to ISO 8601, and re-validates every post against the v2 schema before the validator is flipped"
  grounding_mode: repo_specific
  truth_sources:
    - scripts/migrate-frontmatter-v2.ts
    - lib/content/schema.ts
    - lib/content/tag-vocabulary.ts
  failure_modes:
    - validator_flipped_before_backfill_complete
    - tag_normalization_drops_a_valid_tag_silently
    - bare_date_conversion_picks_wrong_timezone
    - migration_runs_outside_dry_run_gate_first
    - rollback_step_overwrites_authored_summary_field
  evidence_priority: repo_code_first
# project: projects this skill is linked to. Array of {handle, role} objects.
# Non-empty project[] anchors the skill to a project and requires `grounding`.
# Suggested role values: source-of-truth, consumer, mirror. Replaces original v8 `workspace_tags`.
project:
  - handle: markdown-static-site
    role: primary
---

# Migrate Posts to v2 Frontmatter

## Concept of the skill

**What it is:** The rollout procedure for migrating all existing markdown posts to a new frontmatter contract.
**Mental model:** Treat the migration as a staged data change: add support, backfill content, validate everything, then enforce the new schema.
**Why it exists:** Required metadata changes can break every existing post unless compatibility and validation are sequenced deliberately.
**What it is NOT:** It is not a generic schema-design exercise or a debugging guide for a failed migration run.
**Adjacent concepts:** Content backfills, schema compatibility windows, tag normalization, date conversion.
**One-line analogy:** It is a bridge that lets old posts cross safely into the new metadata format.
**Common misconception:** Updating the validator first is harmless; populated content needs a compatibility window before enforcement.

## Coverage

- The four-phase pattern for adding a required field to a populated content tree — *add as nullable → backfill from existing data → verify → flip the validator to require it* — and why collapsing any two phases into one is unsafe
- The backfill query — generating a `summary` from each post's first paragraph, with a per-post manual-override fallback for cases where the auto-summary is wrong
- The verification gate between backfill and validator-flip — running `validate-posts.ts` against the entire `content/posts/**/*.md` tree must return zero errors before the schema is updated
- The tag-normalization step — mapping every tag to its canonical form in `tag-vocabulary.ts`, with a deny-list for tags that should be removed entirely (e.g., legacy synonyms now folded into a canonical tag)
- The dry-run gate — the migration script always runs in dry-run by default, printing the diff per post; the `--apply` flag is opt-in and never the CI default
- The rollback path — what `ROLLBACK.md` for this migration looks like and why "regenerate every summary" is wrong (overwrites authored summaries); the correct rollback restores the per-post `.bak` file the migration writes alongside each edit

## Philosophy of the skill

A content-schema migration is a rare migration where being careful is cheaper than being clever. The temptation to combine the four phases into one "atomic" pass fails because the backfill produces some surprising auto-summaries, the human reviewer needs time to override them, and flipping the validator before the human pass is done means every build between then and the override fails. The four-phase pattern is verbose but unambiguous: each phase has a clear success criterion, each phase is re-runnable, and the rollback at any phase is well-defined. Pay the verbosity cost; the alternative is a build outage on a non-emergency migration.

## Workflow

Each step has a clear precondition and a clear success criterion. Do not skip steps; the steps exist because skipping them is how content migrations corrupt authored data.

| Step | Precondition | Action | Success criterion |
|---|---|---|---|
| 1. Add nullable `summary` | The schema has no `summary` field | `lib/content/schema.ts`: add `summary: z.string().optional()` (no `required`). Deploy. | The schema accepts posts both with and without `summary`; the build does not fail on existing posts. |
| 2. Backfill | Step 1 deployed | Run `scripts/migrate-frontmatter-v2.ts --apply --field summary` which generates a draft summary per post from the first paragraph and writes a `.bak` for each modified file. | Verification query reports 0 posts where `summary` is null or empty. |
| 3. Human review of auto-summaries | Step 2 success | Each post author reviews their auto-summary. Override by editing the post's frontmatter manually; the migration script will not re-run on a post whose `summary` was edited after step 2's `.bak` was written. | Author sign-off recorded in `audits/0007-frontmatter-v2/sign-off.md`. |
| 4. Flip the validator | Step 3 sign-off committed | `lib/content/schema.ts`: change `summary: z.string().optional()` to `summary: z.string().min(40)` (required, with a minimum length). Deploy. | Builds fail on any post that doesn't pass the v2 schema; the failure surface is the build log, not user-facing pages. |

### When to back out

- Step 2 backfill produces too many surprising auto-summaries → reduce the auto-summary rule (e.g., first-sentence-only); the migration is still safe to resume from the same `.bak` set.
- Step 3 reveals that some posts genuinely have no extractable summary → those posts need authored summaries before step 4; do NOT flip the validator with placeholder summaries in place.
- Step 4 is flipped and the build fails on a post whose summary was edited but didn't trip the `min(40)` floor → revert step 4 (`.optional()` again), have the author rewrite the summary, re-flip.

## Verification

- [ ] Step 1 added the field as `.optional()`, not as required
- [ ] Step 2 was run with `--apply` only after a `--dry-run` was reviewed (the dry-run output is committed under `audits/0007-frontmatter-v2/dry-run.md`)
- [ ] Step 2's `.bak` files exist for every modified post and are committed (so rollback is a one-command restore)
- [ ] Step 3 sign-off is recorded for every post in `content/posts/**/*.md` — no post moved past step 3 without explicit author confirmation
- [ ] Step 4 was applied AFTER step 3 sign-off — never before, even if the author backlog is taking longer than expected
- [ ] The rollback path in `ROLLBACK.md` does NOT include "regenerate every summary" — that overwrites authored content. Rollback is `mv <post>.md.bak <post>.md` per file, with the `.bak`s already committed.
- [ ] An end-to-end CI test runs the migration in dry-run mode against the live `content/posts/` set and reports the diff in the PR description before any human merges step 4

## Do NOT Use When

| Use instead | When |
|---|---|
| `markdown-post-frontmatter-validation` | The task is reviewing or authoring a single post's frontmatter, not the migration that adds a new required field |
| `debugging` | A specific migration step is failing in CI and you need to reproduce |
| `documentation` | The task is writing a runbook or contributor doc about the migration |
| (a generic migration skill) | The task is a different content migration with no relation to the v2 frontmatter rollout |
