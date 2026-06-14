# Skill Graph — Generated Status

> **Generated:** 2026-06-14T15:13:17.537Z
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
| Skill count (manifest) | `181` | `skills.manifest.json` |
| Upstream-displacement coverage | `31` / `181` (17%) | skills with a `references/upstream-*.md` artifact (per `skill-audit-loop/SKILL_AUDIT_LOOP.md` § 6-displacement) |
| Mirror status | docs-only mirrors per ADR 0009 (2026-05-18) | `docs/adr/0009-sibling-repo-deprecation.md` |

## Checks

| Check | Status | Duration | Last line |
|---|---|---|---|
| check-markdown-links | ✅ PASS | 502 ms | OK   markdown links (1645 file(s)) |
| check-protocol-consistency | ✅ PASS | 121 ms | PASS: all protocol consistency checks passed. 0 warning(s). |
| check-doc-drift | ✅ PASS | 238 ms | OK   doc drift sentinel: 89 active doc(s) scanned against schema v8 |
| check-mirror-freeze | ✅ PASS | 61 ms | OK   mirror freeze: 20 file(s) scanned across 2 mirror(s); no active-source/package claims found. |
| marketplace-export-check | ✅ PASS | 228 ms | PROJECTION TRUNCATED for writing-humanizer: tail truncated from 503 to 465 chars to fit 1024 limit |

## Audit Health

> The three tables below answer **eligibility**, **assessment**, and **certification** as distinct questions (per [ADR-0011 § Addendum 2026-05-27](adr/0011-split-audit-verdict-into-four-verdicts.md) and [`docs/verdict-semantics.md`](verdict-semantics.md)). A skill passing structural and truth checks is **admitted** — eligible for assessment, not yet certified. Only `application_verdict == APPLICABLE` certifies useful behavior change.

### Admission (eligibility)

| State | Count | What it means |
|---|---|---|
| Admitted | `81` / `181` | Structural + truth verdicts both PASS — skill is eligible for quality assessment. |
| Not admitted | `100` | Structural or truth gate failing — skill is not yet eligible. |

Per-verdict breakdown:

| Verdict | structural | truth |
|---|---|---|
| PASS | `181` | `81` |
| PASS_WITH_FIXES | `0` | — |
| FAIL | `0` | — |
| DRIFT | — | `2` |
| BROKEN | — | `0` |
| UNVERIFIED | `0` | `98` |

### Assessment (has the behavior gate run?)

| State | Count | Confidence tier |
|---|---|---|
| Admitted, unassessed | `73` | No gate 9 run — `pending — eligible only` |
| Assessed (provisional) | `6` | Single-model assessment — awaiting dual-run grader |
| Assessed (graded) | `2` | Dual-run grader confirmed |

Comprehension carve-out (per ADR-0011 § Addendum 2026-05-20):

| State | Count | Note |
|---|---|---|
| Framework concept or no comprehension layer (`SKIPPED_BASELINE_HIGH` / `NA`) | `21` | Comprehension legitimately does not apply — model already knows the concept or the skill ships none. |
| Comprehension graded | `6` | Comprehension grader produced a real verdict. |
| Comprehension unassessed | `154` | Repo-specific skill awaiting gate-8 run. |

### Certification — APPLICABLE gate PARKED (2026-06-14T)

> The APPLICABLE application-eval gate is **parked** (owner directive, 2026-06-14).
> The behavior eval is not yet discriminating — it produced 0 APPLICABLE corpus-wide
> and stamped HARMFUL/REDUNDANT/MIXED on skills known to be good (the test is the
> problem, not the skills) — and it is expensive to run. The gate no longer runs by
> default (`lib/audit/run-skill-audit-loop*.js`; opt in per-run with `--eval`) and its
> verdicts are **not** reported here as the project's quality signal. Existing
> `application_verdict` values in `audit-state.json` sidecars are retained but are NOT
> a current quality claim. Re-enable by reverting the parking commit once the eval is
> good enough to certify honestly. See CHANGELOG § Skill Audit Loop — APPLICABLE gate parked.

## Deprecated-alias drain

> The live schema accepts remaining deprecated/legacy aliases only for unmigrated skills, and this table records recently removed aliases until the next status cleanup. **Removal condition (per `AGENTS.md § Major Version Is a Clean Cut`): when an alias's corpus usage reaches 0, one SYSTEM commit deletes it from the schema.** The per-skill rename is CONTENT-mode audit-loop work; this table makes the drain measurable instead of open-ended.

| Deprecated alias | Canonical | Corpus usage | State |
|---|---|---|---|
| `relations.boundary` | `relations.suppresses` | `0` / `181` | **REMOVED FROM SCHEMA** — corpus usage is zero; runtime read fallbacks, if any, are compatibility-only |
| `relations.adjacent` | `relations.related` | `0` / `181` | **REMOVED FROM SCHEMA** — corpus usage is zero; runtime read fallbacks, if any, are compatibility-only |
| `boundary (top-level Understanding)` | `concept_boundary` | `0` / `181` | **REMOVED FROM SCHEMA** — corpus usage is zero; runtime read fallbacks, if any, are compatibility-only |
| `compatibility.runtimes` | `compatibility.agent_runtimes` | `0` / `181` | **REMOVED FROM SCHEMA** — corpus usage is zero; runtime read fallbacks, if any, are compatibility-only |
| `compatibility.node` | `compatibility.node_version` | `0` / `181` | **REMOVED FROM SCHEMA** — corpus usage is zero; runtime read fallbacks, if any, are compatibility-only |

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
