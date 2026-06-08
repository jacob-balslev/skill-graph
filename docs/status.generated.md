# Skill Graph — Generated Status

> **Generated:** 2026-06-08T12:16:23.249Z
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
| Upstream-displacement coverage | `24` / `171` (14%) | skills with a `references/upstream-*.md` artifact (per `skill-audit-loop/SKILL_AUDIT_LOOP.md` § 6-displacement) |
| Mirror status | docs-only mirrors per ADR 0009 (2026-05-18) | `docs/adr/0009-sibling-repo-deprecation.md` |

## Checks

| Check | Status | Duration | Last line |
|---|---|---|---|
| check-markdown-links | ✅ PASS | 280 ms | OK   markdown links (1323 file(s)) |
| check-protocol-consistency | ✅ PASS | 116 ms | PASS: all protocol consistency checks passed. 0 warning(s). |
| check-doc-drift | ✅ PASS | 159 ms | OK   doc drift sentinel: 80 active doc(s) scanned against schema v8 |
| check-mirror-freeze | ✅ PASS | 44 ms | OK   mirror freeze: 20 file(s) scanned across 2 mirror(s); no active-source/package claims found. |
| marketplace-export-check | ✅ PASS | 193 ms | PROJECTION TRUNCATED for writing-humanizer: tail truncated from 503 to 465 chars to fit 1024 limit |

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
| REDUNDANT (no behavioral delta) | `2` |
| MIXED (delta varies by case) | `0` |
| FALSE_POSITIVE (skill over-triggers) | `0` |
| HARMFUL (makes agents worse) | `0` |
| UNVERIFIED (no assessment) | `161` |

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
