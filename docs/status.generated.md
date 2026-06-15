# Skill Graph — Generated Status

> **Generated:** 2026-06-15T10:49:13.369Z
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
| Upstream-displacement coverage | `32` / `182` (18%) | skills with a `references/upstream-*.md` artifact (per `skill-audit-loop/SKILL_AUDIT_LOOP.md` § 6-displacement) |
| Earned content-label coverage | `1` / `182` (1%) | skills whose `audit-state.json` carries an EARNED `skill_graph_protocol` label (stamped by the audit loop on a verified content migration — SKI-355; distinct from `schema_version`) |
| Mirror status | docs-only mirrors per ADR 0009 (2026-05-18) | `docs/adr/0009-sibling-repo-deprecation.md` |

## Checks

| Check | Status | Duration | Last line |
|---|---|---|---|
| check-markdown-links | ✅ PASS | 308 ms | OK   markdown links (1647 file(s)) |
| check-protocol-consistency | ✅ PASS | 112 ms | PASS: all protocol consistency checks passed. 0 warning(s). |
| check-doc-drift | ✅ PASS | 216 ms | OK   doc drift sentinel: 87 active doc(s) scanned against schema v8 |
| check-mirror-freeze | ✅ PASS | 44 ms | OK   mirror freeze: 20 file(s) scanned across 2 mirror(s); no active-source/package claims found. |
| marketplace-export-check | ❌ FAIL | 194 ms | FAIL missing exported skill hooked-model |

## Audit Health

> The tables below answer **eligibility** and **assessment** as distinct questions (per [`docs/verdict-semantics.md`](verdict-semantics.md)). A skill passing structural and truth checks is **admitted** — eligible for the comprehension behavior gate. The `comprehension_verdict` is the behavior-gate quality signal.

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
