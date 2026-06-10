# Skill Graph — Generated Status

> **Generated:** 2026-06-10T00:04:32.982Z
> **Generator:** `node scripts/build-status-doc.js` (regenerate; never hand-edit)
>
> This file is the single-source-of-truth status snapshot for the project's
> trust surface. Each value below is pulled from a deterministic origin:
> `package.json`, `schemas/SKILL_METADATA_PROTOCOL_schema.json`, the generated manifest, ADR
> 0009, and the live exit code of each check script.

## Identity

| Field | Value | Source |
|---|---|---|
| Package name | `@skill-graph/cli` | `package.json` |
| Package version | `0.5.10` | `package.json` |
| Node engine | `>=20.0.0` | `package.json` |
| Active schema version | `v8` | `schemas/skill-audit-state.schema.json` (moved from frontmatter schema per ADR-0019) |
| Skill count (manifest) | `171` | `skills.manifest.json` |
| Upstream-displacement coverage | `27` / `183` (15%) | skills with a `references/upstream-*.md` artifact (per `skill-audit-loop/SKILL_AUDIT_LOOP.md` § 6-displacement) |
| Mirror status | docs-only mirrors per ADR 0009 (2026-05-18) | `docs/adr/0009-sibling-repo-deprecation.md` |

## Checks

| Check | Status | Duration | Last line |
|---|---|---|---|
| check-markdown-links | ✅ PASS | 312 ms | OK   markdown links (1327 file(s)) |
| check-protocol-consistency | ✅ PASS | 125 ms | PASS: all protocol consistency checks passed. 0 warning(s). |
| check-doc-drift | ✅ PASS | 202 ms | OK   doc drift sentinel: 81 active doc(s) scanned against schema v8 |
| check-mirror-freeze | ✅ PASS | 50 ms | OK   mirror freeze: 20 file(s) scanned across 2 mirror(s); no active-source/package claims found. |
| marketplace-export-check | ❌ FAIL | 205 ms | FAIL missing exported skill three-horizons |

## Audit Health

> The three tables below answer **eligibility**, **assessment**, and **certification** as distinct questions (per [ADR-0011 § Addendum 2026-05-27](adr/0011-split-audit-verdict-into-four-verdicts.md) and [`docs/verdict-semantics.md`](verdict-semantics.md)). A skill passing structural and truth checks is **admitted** — eligible for assessment, not yet certified. Only `application_verdict == APPLICABLE` certifies useful behavior change.

### Admission (eligibility)

| State | Count | What it means |
|---|---|---|
| Admitted | `103` / `171` | Structural + truth verdicts both PASS — skill is eligible for quality assessment. |
| Not admitted | `68` | Structural or truth gate failing — skill is not yet eligible. |

Per-verdict breakdown:

| Verdict | structural | truth |
|---|---|---|
| PASS | `168` | `103` |
| PASS_WITH_FIXES | `0` | — |
| FAIL | `1` | — |
| DRIFT | — | `4` |
| BROKEN | — | `3` |
| UNVERIFIED | `2` | `61` |

### Assessment (has the behavior gate run?)

| State | Count | Confidence tier |
|---|---|---|
| Admitted, unassessed | `95` | No gate 9 run — `pending — eligible only` |
| Assessed (provisional) | `7` | Single-model assessment — awaiting dual-run grader |
| Assessed (graded) | `1` | Dual-run grader confirmed |

Comprehension carve-out (per ADR-0011 § Addendum 2026-05-20):

| State | Count | Note |
|---|---|---|
| Framework concept or no comprehension layer (`SKIPPED_BASELINE_HIGH` / `NA`) | `7` | Comprehension legitimately does not apply — model already knows the concept or the skill ships none. |
| Comprehension graded | `7` | Comprehension grader produced a real verdict. |
| Comprehension unassessed | `157` | Repo-specific skill awaiting gate-8 run. |

### Certification (the only number worth bragging about)

| Outcome | Count |
|---|---|
| **APPLICABLE** (certified useful) | `0` |
| PROVISIONAL (single-model APPLICABLE-equivalent) | `8` |
| NOT_DISCRIMINATED_CEILING (baseline saturated; inconclusive) | `0` |
| EQUIVALENT_ON_FRONTIER (no marginal frontier lift) | `0` |
| REDUNDANT (legacy no-delta bucket) | `2` |
| MIXED (delta varies by case) | `0` |
| FALSE_POSITIVE (skill over-triggers) | `0` |
| HARMFUL (makes agents worse) | `0` |
| UNVERIFIED (no assessment) | `161` |

## Deprecated-alias drain

> The live schema accepts these deprecated/legacy aliases only for unmigrated skills. **Removal condition (per `AGENTS.md § Major Version Is a Clean Cut`): when an alias's corpus usage reaches 0, one SYSTEM commit deletes it from the schema.** The per-skill rename is CONTENT-mode audit-loop work; this table makes the drain measurable instead of open-ended.

| Deprecated alias | Canonical | Corpus usage | State |
|---|---|---|---|
| `relations.boundary` | `relations.suppresses` | `20` / `183` | CONTENT drain in progress (per-skill via `/audit:*`) |
| `relations.adjacent` | `relations.related` | `0` / `183` | **READY TO DELETE** — remove the alias from the schema in a SYSTEM commit |
| `boundary (top-level Understanding)` | `concept_boundary` | `0` / `183` | **READY TO DELETE** — remove the alias from the schema in a SYSTEM commit |
| `compatibility.runtimes` | `compatibility.agent_runtimes` | `0` / `183` | **READY TO DELETE** — remove the alias from the schema in a SYSTEM commit |
| `compatibility.node` | `compatibility.node_version` | `0` / `183` | **READY TO DELETE** — remove the alias from the schema in a SYSTEM commit |

## How to refresh

```bash
node scripts/build-status-doc.js
```

`docs/status.generated.md` is regenerated and overwritten each run. CI
should commit the regenerated file alongside any code that affects the
underlying values (package version bump, schema bump, new lint check,
etc.).

## What this replaces

- Hand-maintained "Latest release" lines in README hero sections (drifted three minor versions in Phase 1).
- Ad-hoc "skill count" claims scattered across docs (drifted from 137 → 141 → 145 in Phase 1 alone).
- Manual "we run these checks" lists in CONTRIBUTING.

The reader is now one URL away from the truth.
