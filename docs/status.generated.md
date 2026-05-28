# Skill Graph — Generated Status

> **Generated:** 2026-05-28T12:37:51.848Z
> **Generator:** `node scripts/build-status-doc.js` (regenerate; never hand-edit)
>
> This file is the single-source-of-truth status snapshot for the project's
> trust surface. Each value below is pulled from a deterministic origin:
> `package.json`, `schemas/skill.schema.json`, the generated manifest, ADR
> 0009, and the live exit code of each check script.

## Identity

| Field | Value | Source |
|---|---|---|
| Package name | `@skill-graph/cli` | `package.json` |
| Package version | `0.5.10` | `package.json` |
| Node engine | `>=20.0.0` | `package.json` |
| Active schema version | `8` | `schemas/skill.schema.json` |
| Skill count (manifest) | `154` | `skills.manifest.json` |
| Mirror status | docs-only mirrors per ADR 0009 (2026-05-18) | `docs/adr/0009-sibling-repo-deprecation.md` |

## Checks

| Check | Status | Duration | Last line |
|---|---|---|---|
| check-markdown-links | ✅ PASS | 304 ms | OK   markdown links (762 file(s)) |
| check-protocol-consistency | ✅ PASS | 116 ms | PASS: all protocol consistency checks passed. 0 warning(s). |
| check-doc-drift | ✅ PASS | 73 ms | OK   doc drift sentinel: 54 active doc(s) scanned against schema v8 |
| check-mirror-freeze | ✅ PASS | 48 ms | OK   mirror freeze: 20 file(s) scanned across 2 mirror(s); no active-source/package claims found. |
| marketplace-export-check | ✅ PASS | 169 ms | PROJECTION TRUNCATED for writing-humanizer: tail truncated from 652 to 465 chars to fit 1024 limit |

## Audit Health

> The three tables below answer **eligibility**, **assessment**, and **certification** as distinct questions (per [ADR-0011 § Addendum 2026-05-27](adr/0011-split-audit-verdict-into-four-verdicts.md) and [`docs/verdict-semantics.md`](verdict-semantics.md)). A skill passing structural and truth checks is **admitted** — eligible for assessment, not yet certified. Only `application_verdict == APPLICABLE` certifies useful behavior change.

### Admission (eligibility)

| State | Count | What it means |
|---|---|---|
| Admitted | `3` / `154` | Structural + truth verdicts both PASS — skill is eligible for quality assessment. |
| Not admitted | `151` | Structural or truth gate failing — skill is not yet eligible. |

Per-verdict breakdown:

| Verdict | structural | truth |
|---|---|---|
| PASS | `8` | `3` |
| PASS_WITH_FIXES | `0` | — |
| FAIL | `0` | — |
| DRIFT | — | `1` |
| BROKEN | — | `0` |
| UNVERIFIED | `146` | `150` |

### Assessment (has the behavior gate run?)

| State | Count | Confidence tier |
|---|---|---|
| Admitted, unassessed | `3` | No gate 9 run — `pending — eligible only` |
| Assessed (provisional) | `0` | Single-model assessment — awaiting dual-run grader |
| Assessed (graded) | `0` | Dual-run grader confirmed |

Comprehension carve-out (per ADR-0011 § Addendum 2026-05-20):

| State | Count | Note |
|---|---|---|
| Framework concept or no comprehension layer (`SKIPPED_BASELINE_HIGH` / `NA`) | `0` | Comprehension legitimately does not apply — model already knows the concept or the skill ships none. |
| Comprehension graded | `0` | Comprehension grader produced a real verdict. |
| Comprehension unassessed | `154` | Repo-specific skill awaiting gate-8 run. |

### Certification (the only number worth bragging about)

| Outcome | Count |
|---|---|
| **APPLICABLE** (certified useful) | `0` |
| PROVISIONAL (single-model APPLICABLE-equivalent) | `0` |
| REDUNDANT (no behavioral delta) | `0` |
| MIXED (delta varies by case) | `0` |
| FALSE_POSITIVE (skill over-triggers) | `0` |
| HARMFUL (makes agents worse) | `0` |
| UNVERIFIED (no assessment) | `154` |

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
