---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: migrate-posts-to-v2-frontmatter
description: "Use when migrating every existing post in `content/posts/**/*.md` to the v2 frontmatter schema — adding the new required `summary` field, normalizing `tags` to the controlled vocabulary, converting bare-date `date` strings to ISO 8601 with timezone, and re-validating every post against the v2 schema before the next build runs. Activate this skill whenever the task references migration `0007-frontmatter-v2`, the v2 frontmatter rollout, or asks how to safely change a required-field set across a populated content tree without breaking the build. Do NOT use for unrelated migrations (use a generic content-migration skill or write a fresh one) or for general schema-design questions (use a schema-design skill)."
version: 0.1.0
type: workflow
browse_category: content
category: content/migrations
scope: codebase
owner: markdown-static-site-maintainer
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "Markdown content tree under content/posts/; assumes Zod or similar runtime validator."
allowed-tools: Read Grep Bash
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
triggers:
  - migrate-posts-to-v2-frontmatter
paths:
  - "scripts/migrate-frontmatter-v2.ts"
  - "lib/content/schema.ts"
  - "lib/content/tag-vocabulary.ts"
examples:
  - "run the v2 frontmatter migration on every post in `content/posts/`"
  - "the v2 migration's tag-normalization step is rejecting some valid tags — what's safe to do?"
  - "verify that every post passes the v2 schema before flipping the validator"
  - "design migration 0008 to drop the legacy `excerpt` field now that `summary` is canonical"
anti_examples:
  - "design a new frontmatter schema for a different domain"
  - "the migration is failing in CI — what's wrong?"
  - "write the v2 frontmatter doc for new contributors"
relations:
  boundary:
    - skill: documentation
      reason: "documentation writes prose explaining the schema migration; this workflow is the procedural enforcement"
    - skill: debugging
      reason: "debugging chases a specific migration failure from logs; this workflow is the pre-failure procedure"
    - skill: refactor
      reason: "refactor changes code shape with no behavior change; a content-schema migration changes the validation contract — different problem, different gates"
  verify_with:
    - testing-strategy
  depends_on:
    - skill: testing-strategy
      min_version: "^1.0.0"
grounding:
  domain_object: "The 0007 frontmatter-v2 migration — a multi-step procedure that adds a required field, normalizes the tag vocabulary, converts bare-date strings to ISO 8601, and re-validates every post against the v2 schema before the validator is flipped"
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
portability:
  readiness: scripted
  targets:
    - skill-md
project_tags:
  - content
  - static-site
  - migrations
lifecycle:
  stale_after_days: 30
  review_cadence: quarterly
---

# Migrate Posts to v2 Frontmatter

## Coverage

- The four-phase pattern for adding a required field to a populated content tree — *add as nullable → backfill from existing data → verify → flip the validator to require it* — and why collapsing any two phases into one is unsafe
- The backfill query — generating a `summary` from each post's first paragraph, with a per-post manual-override fallback for cases where the auto-summary is wrong
- The verification gate between backfill and validator-flip — running `validate-posts.ts` against the entire `content/posts/**/*.md` tree must return zero errors before the schema is updated
- The tag-normalization step — mapping every tag to its canonical form in `tag-vocabulary.ts`, with a deny-list for tags that should be removed entirely (e.g., legacy synonyms now folded into a canonical tag)
- The dry-run gate — the migration script always runs in dry-run by default, printing the diff per post; the `--apply` flag is opt-in and never the CI default
- The rollback path — what `ROLLBACK.md` for this migration looks like and why "regenerate every summary" is wrong (overwrites authored summaries); the correct rollback restores the per-post `.bak` file the migration writes alongside each edit

## Philosophy

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
