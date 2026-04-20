# ADR 0005 — Freshness Field Consolidation (Proposal for v4)

- **Status:** Proposed (2026-04-20)
- **Deciders:** Skill Graph maintainers
- **Target:** v4 schema bump (breaking change)

## Context

v3 has three overlapping freshness/staleness fields:

| Field | Role |
|---|---|
| `freshness` | "When was this last *editorially* reviewed?" (ISO date, required) |
| `drift_check.last_verified` | "When was this last *verified against truth sources*?" (ISO date, required) |
| `lifecycle.stale_after_days` | "Days after `drift_check.last_verified` at which the skill is flagged stale" (integer, optional) |

The external audit of 2026-04-20 flagged this as decomposable. Two problems:

1. **Authors get confused.** `freshness` vs `drift_check.last_verified` is subtle — "editorial" vs "truth-source" review. In practice, most skills set them to the same date, and the distinction is rarely load-bearing.
2. **Tools duplicate work.** The drift sentinel already reasons about `drift_check.last_verified + lifecycle.stale_after_days`. The `freshness` field is consulted by only one check (the >90-days editorial-review warning).

## Decision (proposed)

Collapse the three fields into two primitives in v4:

| New field | Replaces | Shape |
|---|---|---|
| `asserted_at` | `freshness` + `drift_check.last_verified` | ISO date. "When was this skill last asserted to be correct? (Editorial = truth-source; if you need to separate them, the skill is probably too stale.)" |
| `stale_after` | `lifecycle.stale_after_days` | ISO 8601 duration (`P90D`, `P6M`, `P1Y`). "How long after `asserted_at` is the skill considered stale?" |

`drift_check.truth_source_hashes` stays where it is — it is content-addressable evidence, a different concern from date-based freshness.

## Rationale

- **Two fields are simpler than three.** Authors don't need to choose between editorial and truth-source review; both collapse into one "I asserted this is correct today" act.
- **ISO 8601 durations are more expressive than integers.** `P90D` vs `P6M` vs `P1Y` read correctly; `stale_after_days: 90` vs `180` vs `365` requires translation.
- **Tooling simplifies.** The drift sentinel reasons about `(today - asserted_at) > stale_after` as one comparison instead of joining three fields.
- **Backward compatibility is preserved by the codemod.** `scripts/migrate-v3-to-v4.js` (future) maps `freshness || drift_check.last_verified` → `asserted_at` (prefer later date) and `lifecycle.stale_after_days` → `stale_after: "P${n}D"`.

## Consequences

### Positive

- One fewer freshness concept to explain in the field-reference.
- Duration values self-document (`P90D` is obviously 90 days, `P6M` obviously 6 months).
- Drift-sentinel simpler.

### Negative

- Breaking change — requires v4 bump. Authors must run the codemod.
- Loses the *theoretical* distinction between editorial and truth-source review. In practice the distinction was rarely used.

### Neutral

- `drift_check.truth_source_hashes` is unchanged — hash-based evidence is orthogonal to date-based freshness.

## Not decided yet

- Whether to keep `lifecycle.review_cadence` (`per-commit` / `weekly` / `quarterly` / `on-truth-source-change`) or fold it into `stale_after`. The cadence carries scheduling intent that duration alone does not. Lean toward keeping it.
- Whether to require `asserted_at` or make it optional. Today's `freshness` is required. Lean toward required.
- The exact codemod conflict-resolution rule when `freshness` and `drift_check.last_verified` disagree by more than 30 days — use the later, or warn and ask?

## Status: Proposed, not accepted

This ADR exists to make the v4 direction visible and invite feedback before v4 work begins. No changes to the current schema. No action required from authors. Revisit when v4 planning starts.

## References

- ISO 8601 duration format — https://en.wikipedia.org/wiki/ISO_8601#Durations
- Audit that prompted this ADR — `skills/knowledge-graph/references/skill-graph-audit-standards-2026-04-20.md` § "Versioning and drift detection"
