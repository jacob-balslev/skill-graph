# Plans Index

> Plans are active or completed project roadmaps, execution plans, and strategic initiatives.
> Follows the workspace-wide plan-persistence rule: each plan file is indexed here, and completed plans are archived.
> Last updated: 2026-05-30

## Active Plans

| Plan | Purpose | Status | Target Date | Owner |
|------|---------|--------|-------------|-------|
| [audit-state-sidecar-implementation.md](./audit-state-sidecar-implementation.md) | Split audit/eval/provenance metadata out of the agent-facing `SKILL.md` frontmatter into a per-skill `audit-state.json` sidecar (ADR-0019). Makes the SYSTEM/CONTENT boundary physical. 6 phases: sidecar schema → frontmatter rewrite → manifest-join (critical path) → consumer updates → docs → CONTENT corpus migration. Clean major-version-shaped cut. | Scoped — implementation not started (SYSTEM) | TBD | Engineering |
| [skill-audit-loop-end-to-end-completion-2026-05-30.md](./skill-audit-loop-end-to-end-completion-2026-05-30.md) | Lockstep explanation of the Skill Metadata Protocol + Skill Audit Loop, 4 reproduced end-to-end breaks (silent `/evolve` scaffold path, opt-in verdict write-back, 14 orphan verdicts + false-green policy, divergent grader fork), and a re-sequenced fix plan (Step 0 = model-free black-box CLI contract test in `npm run verify`). Reviewed by GPT-5.4 + 18 quality/architecture skills. | Plan ready — implementation deferred (SYSTEM) | 2026-05-30 | Engineering |
| [multi-root-workspace.md](./multi-root-workspace.md) | Design and implement multi-root workspace support for Skill Graph routing and manifest generation | Strategic initiative | TBD | Engineering |
| [scripts-roadmap.md](./scripts-roadmap.md) | Script development roadmap: deterministic drift sentinels, mirror-freeze linter, doctor subcommand, hermetic fixtures | Execution roadmap | Through Phase 2 (2026-05-19) | Engineering |
| [skill-library-as-lens-review-2026-05-21.md](./skill-library-as-lens-review-2026-05-21.md) | Skill library audit review — assess library structure, coverage, and conformance across 284 active skills | Audit review | 2026-05-21 | Research |

## Completed Plans

| Plan | Purpose | Archived |
|------|---------|----------|
| [marketplace-p1-public-migration-plan](../_archived/marketplace-p1-public-migration-plan-2026-05-23.md) | Migrate public-safe Development skills to canonical Skill Graph and export via marketplace surface | 2026-05-23 |
| [v4-schema-bump](../_archived/v4-schema-bump-2026-05-23.md) | Major schema version bump (v3 → v4): freshness consolidation, field simplification, codemod planning | 2026-05-23 |
| [wave-2-extraction](../_archived/wave-2-extraction-2026-05-23.md) | Second wave of skill library extraction and consolidation | 2026-05-23 |
