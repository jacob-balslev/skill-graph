# Marketplace P1 Public Migration Plan

> Status: execution plan for the 2026-05-14 skills.sh consolidation pass.

## Goal

Move public-safe Development skills that were listed as `public-after-migration` in `docs/marketplace-skill-candidate-list.md` into canonical Skill Metadata Protocol source under `skills/<slug>/SKILL.md`, then export them through the generated marketplace surface.

## Inclusion Rules

- Import only rows that are not already present in canonical `skills/`.
- Normalize nested names to flat marketplace slugs. `token-cost-estimation/findings` becomes `token-cost-estimation-findings` if and when it is safe to migrate.
- Reject any row whose full source body contains local agent-profile paths, private project names, personal paths, email addresses, or token-like strings.
- Keep canonical Skill Graph as the source of truth. Do not publish legacy/plain Development files directly.
- Preserve body content for imported skills except for replacing legacy frontmatter with schema_version 4 frontmatter.
- Keep eval claims honest: migrated skills start with `eval_artifacts: planned`, `eval_state: unverified`, and `routing_eval: absent`.
- Keep only frontmatter relations whose targets exist in the final canonical library.

## Import Set

The clean P1 rows to import in this batch are:

`background-jobs`, `command-palette`, `compression`, `content-monitor`, `cron-scheduling`, `diff-analysis`, `entity-relationship-modeling`, `evaluation`, `governance`, `guardrails`, `keywords`, `merge-queue`, `methodology`, `mobile-responsive-ux`, `ontology`, `prioritization`, `real-time-updates`, `reasoning`, `seo-strategy`, `spec-driven-development`, `summarization`, `vercel-composition-patterns`.

## Rejections For This Batch

Duplicate P1 rows already owned by canonical Skill Graph skills are rejected in favor of the canonical source.

Rows with body-level privacy or local-runtime findings are deferred until rewritten as general public skills. One private-named row is withheld from row-level public documentation: `agent-session-handoff`, `agent-task-delegation`, `autonomous-loop-patterns`, `chat-interface`, `cost-aggregation`, `dispatch-loop`, `ghostty`, `git-worktree`, `harness-engineering`, `hook-patterns`, `methodical`, `orchestration`, `perspective`, `quality-doctrine`, `self-evaluation`, `sequential-thinking`, `session-lifecycle`, `streaming`, `task-lifecycle`, `task-path-optimization`, `task-progression`, `task-sizing`, `threaded-conversations`, `token-cost-estimation-findings`, `token-efficiency`, `tui`, `vibe-kanban`.

## Verification

After import, run the standard gates plus marketplace-specific validation:

- `npm.cmd run verify`
- `node scripts/verify-skill-md-export.js`
- `node scripts/check-markdown-links.js`
- `node scripts/export-marketplace-skills.js --validate-only`
- privacy scan over generated marketplace export
- public CLI list count against `jacob-balslev/skills`
- live skills.sh canonical and owner pages
