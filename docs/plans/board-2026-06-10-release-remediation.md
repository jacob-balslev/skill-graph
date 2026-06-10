# Skill Graph — Board 2026-06-10 Release Remediation Plan

> Source: `/boardmeeting board --project skill-graph` (2026-06-10_17-41). Minutes: `~/Development/.boardmeeting/minutes-board-2026-06-10_17-41.md`.
> **Status legend:** ✅ DONE (committed) · �doing (parallel session, uncommitted) · ☐ TODO (SYSTEM) · ◆ CONTENT-drain (via `/audit:*`, never inline) · ⏭ maintainer/manual.
> **Coordination note (CRITICAL):** As of writing, a **parallel session is actively committing these fixes** (commits `75b99a2`→`228cbb5`, tagged `board #2/#3/#6` + Cluster 1–5) with **120 uncommitted files** in the working tree. Do NOT edit skill-graph files that the parallel session has staged/modified — collision risk per `.claude/rules/multi-session-commits.md`. This plan tracks who-owns-what so the remaining items are done once, not twice.

## A. SYSTEM — already solved by the parallel session (verified via git log)

| Board # | Item | Commit | Status |
|---|---|---|---|
| #2 | Release-time malicious-content security scan (NOT a 5th verdict — gate) | `7868c60` | ✅ DONE |
| #3 | Superset-compat marketplace shape gate, blocking in verify:system | `50096e9` | ✅ DONE |
| #6 | `concept_boundary` body-projection fix (`render-skill-context.js`) | `75b99a2` + regen `2d92c42` | ✅ DONE |
| #4 (related) | Panel verdict-honesty + robustness hardening | `79ea6c1` (Cluster 3) | ✅ partial — panel stability lifted |
| — | Privacy hard gate for external lane + path-guard | `81e8a92` (Cluster 1/D2) | ✅ DONE |
| — | audit-manifest stale aliases + path guard + HARMFUL scan | `dc3b24d` | ✅ DONE |
| — | Cross-runtime runner+supervisor drift | `9be9789` (Cluster 4) | ✅ DONE |
| — | Audit-loop entry-point table + Status section | `228cbb5` (Cluster 5) | ✅ DONE |

> The 120 uncommitted files (audits/ 39, scripts/ 22, examples/ 20, docs/ 19, lib/ 8, schemas/ 3, …) are the parallel session's in-flight batch. Treat as owned by that session until committed.

## B. SYSTEM — remaining (verify not-done before doing; coordinate to avoid collision)

| Board # | Item | Verified state (2026-06-10) | Effort | Owner |
|---|---|---|---|---|
| #8 | Delete 4 zero-usage deprecated aliases (`relations.adjacent`, top-level `boundary`, `compatibility.runtimes`, `compatibility.node`) from `schemas/SKILL_METADATA_PROTOCOL_schema.json` | aliases STILL present (schema lines ~147/161/223) — NOT done | S | ☐ TODO (schema — likely in parallel session's 3 dirty schema files; coordinate) |
| #7 | Description cap: verify the true Agent Skills marketplace limit; raise `MARKETPLACE_DESCRIPTION_LIMIT` 1024→1536 if correct. NEVER trim canonical (exporter already preserves full canonical + records length). | still `1024` (export-marketplace-skills.js:45) — NOT done. Needs spec verification first. | S | ☐ TODO (coordinate — export file may be dirty) |
| #11 | Decide implement-or-deprecate for ~0-usage fields `io_contract`, `relations.broader/narrower/disjoint_with`. Recommendation: KEEP (designed ontology/polyhierarchy fields; low usage is expected, not dead) + document the decision. | undecided | S | ☐ TODO (doc decision, not deletion) |
| #12 | Anti-loss adversarial test for the merge-ledger (known-drop scenarios assert every violation flagged) | not present | M | ☐ TODO |
| #9 (#16 W4) | `release:ready` combined CI target (verify:system + superset-compat + security scan + description-budget) | superset+security gates now exist; combined target TBD | M | ☐ TODO |
| #15 | Fix boardmeeting profile's stale `deployment_target` ref → `public` | present in `~/Development/.claude/references/boardmeeting-profiles/skill-graph.md` | S | ✅ collision-free (MY repo) — done this session |
| extra | Scope notes per 12 subject shelves + card-sort validation | not present | M | ☐ TODO |
| extra | Cite SkillsBench + SkillTester as prior art (claim leadership — predates SkillTester) | not present | S | ☐ TODO (positioning + audit-loop docs) |
| #16 | Clarity: `eval_state: passing` + `application: UNVERIFIED` reads as behavioral pass (legitimate; verified). Optional public-health-view note. | P4 | S | ☐ optional |

## C. Maintainer / manual

| Board # | Item | State | Owner |
|---|---|---|---|
| #5 | Publish `v0.5.10` to npm (gated `workflow_dispatch`); public `latest` is `0.5.8`. | repo 0.5.10, npm 0.5.8 (verified `npm view`) | ⏭ maintainer CI action — "going public", needs explicit owner approval (Standard #5) |

## D. CONTENT — drain via `/audit:*` (NEVER inline edits; Standard #16)

| Board # | Item | Route |
|---|---|---|
| #1 | Certify a 15–20 routing-central skill **seed cohort** to `APPLICABLE` — the PUBLISH GATE | `/audit:evaluate` after panel-loop stabilized |
| #10 | Run upstream-displacement axis corpus-wide (28/184 → target) | `/audit:audit` displacement step |
| #8 (corpus) | Drain `relations.boundary→suppresses` (20/184) | `/audit:improve` per skill |
| #8 (admission) | Drain the "zombie zone" (115/184 not admitted) | `/audit:audit` |
| #9 (corpus) | Shelf rebalance: subdivide reasoning-strategy (28) via taxonomy_domain; recruit-or-fold product-domain (3) | `/audit:*` + `/discover` |

## Sequence (board adversarial-debate verdict)
1. **On-ramp (SYSTEM, days):** B-items above — most already done by the parallel session. Finish #8, #7, #12, #9, scope notes, citations.
2. **Publish gate (CONTENT, weeks):** D#1 certify-seed cohort — do NOT cut a public `v1.0`/announcement at 0 APPLICABLE.
3. **Then** maintainer publishes 0.5.10 (C#5).

## Done this session (collision-free)
- D#15 boardmeeting profile `deployment_target`→`public` (workspace repo).
- This plan file.
