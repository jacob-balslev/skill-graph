# Skill Graph Documentation Audit — 2026-05-23

> Type: Research / Audit Findings
> Auditor: general-purpose subagent (Sonnet)
> Triggered by: /manage session 2026-05-23, user request "Read up on all documents… make sure documentation is up to date and old legacy documentation is marked deprecated"
> Read-only — no edits performed during audit
> Status: pending action; downstream tasks tracked in Linear

## Audit Summary

- **Repo scope verified:** `/Users/jacobbalslev/Development/skill-graph/` (canonical, last commit `db0ce34` 2026-05-23). Sibling `skill-audit-loop/` present as docs-only mirror. Sibling `skill-metadata-protocol/` is **DELETED** locally (parent `Development` git status shows `D skill-metadata-protocol`) — the ADR 0009 archive process completed at the local level.
- **Schema state:** v7 active, all 8 pinned schema files present (v2-v7 for both skill + manifest). Migrations v4→v5, v5→v6, v6→v7 all present and complete.
- **Skill count:** Canonical library has been restructured into 6 nested category dirs (agent/design/engineering/foundations/product/quality) containing **144 SKILL.md files** plus 1 archived — but the canonical "Current State" block in `SKILL_GRAPH.md` and `docs/status.generated.md` both claim **143**. Marketplace mirror also says 143. Off-by-one drift.
- **ADRs:** 13 ADRs present (0001–0013). All Accepted except 0005 (Proposed). 0009 was updated 2026-05-20 to reflect GitHub archival.

## Findings (22 total — all shown, severity-tagged)

### HIGH

**FINDING 2:** Active scripts still require deleted `skill-audit-loop/src/build-skill-audit-worklist.js`
- Files: `scripts/skill/build-skill-audit-worklist.js:13-14,728`, `skill-graph/scripts/seed-publication-classification.js:13,113`, `docs/marketplace-publication-queue.generated.md:9`
- Issue: Source comments and the generated marketplace-publication-queue.md reference a deleted path. Per ADR 0009 that path no longer exists. Worklist regeneration is documented as blocked.
- Fix: Repoint the require shim and regenerator origin into `skill-graph/scripts/` (or `@skill-graph/cli`) and re-run the worklist build; update inline doc comments + the generated-file header in the same commit.

**FINDING 3:** `examples/skill-metadata-template.md` cites the archived sibling as canonical
- Files: `skill-graph/examples/skill-metadata-template.md:283, 317`
- Issue: Both lines point new-skill authors at `../skill-audit-loop/SKILL_AUDIT_LOOP.md § Part 2 — Per-Skill Audit Checklist` as the live checklist source. Per ADR 0009 the canonical checklist lives in-repo. Template is a leverage point — one fix prevents many downstream errors.
- Fix: Update both references to `../SKILL_AUDIT_LOOP.md#part-2--per-skill-audit-checklist` (in-repo); drop the "post-2026-05-16 monorepo split" framing.

### MEDIUM

**FINDING 1:** Skill count drift — canonical library has 144 SKILL.md but docs claim 143
- Files: `skill-graph/SKILL_GRAPH.md:18`, `docs/status.generated.md:20`, `skills.manifest.json`, `marketplace/README.md`, `AGENTS.md` (147 — actual 144)
- Issue: `find` returns 144; all four artifacts say 143. Single-source-of-truth doctrine breached.
- Fix: Re-run `npm run status` and `node scripts/export-marketplace-skills.js` to regenerate, then update prose mentions via the routing table.

**FINDING 4:** `integrations/github-actions.md` links to archived sibling repo's checklist
- Files: `skill-graph/docs/integrations/github-actions.md:139`
- Issue: Link is `https://github.com/jacob-balslev/skill-audit-loop/blob/main/SKILL_AUDIT_LOOP.md § Part 2 — Per-Skill Audit Checklist`. The sibling is archived.
- Fix: Change to `../SKILL_AUDIT_LOOP.md#part-2--per-skill-audit-checklist` or the skill-graph GitHub equivalent.

**FINDING 5:** `docs/_drafts/0.5.8-release-prep.md` never applied; still marked DRAFT after 0.5.8 shipped
- Files: `skill-graph/docs/_drafts/0.5.8-release-prep.md:1-5`
- Issue: Status reads "DRAFT — not yet applied" but CHANGELOG + package.json show 0.5.8 shipped on 2026-05-19.
- Fix: Move to `docs/_archived/0.5.8-release-prep-2026-05-19.md` and update header to "Applied 2026-05-19".

**FINDING 18:** `docs/plans/skill-repo-reorganization.md` treats reverted split as future plan
- Files: `/Users/jacobbalslev/Development/docs/plans/skill-repo-reorganization.md` (lives in Development root)
- Issue: 220+ line plan describes splitting `skill-graph` INTO `skill-metadata-protocol` and `skill-audit-loop` — the exact split reverted by ADR 0009.
- Fix: Move to `docs/_archived/` with header "Superseded 2026-05-18 by ADR 0009 (consolidation)".

**FINDING 19:** `docs/plans/skill-graph-oss-docs-refresh.md` references `skill-metadata-protocol/` as hub destination
- Files: `/Users/jacobbalslev/Development/docs/plans/skill-graph-oss-docs-refresh.md:17, 66, 123, 129, 130, 142, 144, 168`
- Issue: Plan describes promoting deprecated sibling repo as the hub README. Per ADR 0009, skill-graph IS the hub.
- Fix: Archive or rewrite post-consolidation.

### LOW

**FINDING 6:** `docs/_drafts/` has 3 files but no INDEX.md identifying which are live
- Files: `skill-graph/docs/_drafts/{0.5.8-release-prep.md, awesome-list-submissions.md, org-readme.md}`
- Fix: Add `_drafts/README.md` with status of each draft.

**FINDING 7:** `docs/_archived/` has only 1 entry — older candidates never moved
- Files: `docs/plans/v4-schema-bump.md`, `docs/plans/wave-2-extraction.md`, `docs/plans/marketplace-p1-public-migration-plan.md`
- Issue: AGENTS.md routing table says completed plans move to `_archived/`. These three were not.
- Fix: Move with date suffix.

**FINDING 8:** No `PLANS.md` index in `skill-graph/docs/plans/` (required by `plan-persistence.md` rule)
- Files: `skill-graph/docs/plans/` (no PLANS.md)
- Fix: Mirror the schema used in `~/Development/docs/plans/PLANS.md`.

**FINDING 9:** ADR 0005 still marked "Proposed" after 5+ weeks
- Files: `skill-graph/docs/adr/0005-freshness-consolidation.md`
- Fix: Accept / Reject / Supersede with explicit reference to which later ADR absorbed the decision.

**FINDING 16:** CHANGELOG historical entry references v6 as current
- Files: `skill-graph/CHANGELOG.md` line 67 (under [0.5.0] historical heading)
- Status: Historically accurate within that versioned entry; verified no fix needed.

### INFO (no action)

**FINDING 10:** `marketplace/skills/` count 143 vs source 144 — export script needs another run (overlaps F1)
**FINDING 11:** `docs/field-reference.generated.md` correctly stamped — clean
**FINDING 12:** No `*-backup`, `*.old`, `*-deprecated` files in skill-graph repo
**FINDING 13:** Stale skills.sh URLs correctly documented as deprecated, not emitted as canonical
**FINDING 14:** `skill-metadata-protocol` sibling locally deleted — consistent with ADR 0009 intent, deletion should be committed in Development root
**FINDING 15:** `skill-audit-loop` sibling correctly stamps deprecation banners — compliant
**FINDING 17:** Worktree-leak references to deprecated paths — agent scratch state, not user-facing
**FINDING 20:** `SKILL_METADATA_PROTOCOL.md` correctly versioned (1.4.0, schema 7, SG 0.5.8)
**FINDING 21:** No "TBD" / "to be drafted" markers in 4 top-level docs
**FINDING 22:** Workspace SKILL.md count is 4916 vs canonical 144 — bulk in worktrees + scratch dirs (not a bug; informational)

## Recommended Priority

Top 5 to address first:
1. **F2** (HIGH) — broken require to deleted `skill-audit-loop/src/`. Real tooling breakage.
2. **F3** (HIGH) — template teaches new authors to follow deprecated paths. Leverage point.
3. **F1** (MEDIUM) — 143/144 skill-count drift; single-source-of-truth doctrine breached.
4. **F18 + F19** (MEDIUM, batch) — Development-root plans contradicting ADR 0009.
5. **F5 + F7** (MEDIUM + LOW, batch) — release-prep draft + 3 shipped plans never archived.

Remaining 14 findings are real but lower-leverage. They surface again if skipped.

## Source

Captured by general-purpose audit subagent on 2026-05-23 during /manage session. Original transcript preserved in agent output at `/private/tmp/claude-501/-Users-jacobbalslev-Development/a10c12f6-5497-460d-88de-ec884a7fbe0e/tasks/a2ca46b8d4a685c74.output`.
