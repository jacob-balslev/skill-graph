# Architecture Decision Records — Index

> Type: Reference. One file per decision under `docs/adr/NNNN-<slug>.md`.
> This index is the navigable status table for the register. When you add an ADR,
> add its row here; when an ADR is superseded or amended, update its Status cell.
> Per `AGENTS.md § Major Version Is a Clean Cut`, a superseded ADR keeps a one-line
> amendment block in its own file citing the supersession — it is not deleted.

## Status table

| ADR | Title | Status | Superseded / amended by |
|-----|-------|--------|--------------------------|
| [0001](0001-predicate-set.md) | Relation Predicate Set | Accepted (revised) | 0006 (Decision #2 reverted); 0018 (`boundary` → `suppresses`, removed 2026-06-13) |
| [0002](0002-json-ld-context.md) | JSON-LD `@context` | Accepted (updated 2026-06-08) | refined by 0006 / 0018 / 0019 |
| [0003](0003-ontoclean-rigidity-tags.md) | OntoClean Rigidity Tags | Superseded | v8 / 0017 |
| [0004](0004-persistent-identifiers.md) | Persistent Identifiers via URN | Accepted-in-principle, **not implemented** | no `urn` field in the live v8 schema |
| [0005](0005-freshness-consolidation.md) | Freshness Consolidation | Superseded | 0019 |
| [0006](0006-revise-predicate-rename.md) | Revise ADR-0001 §2 (`boundary` ≠ `owl:disjointWith`) | Accepted | extended by 0018 |
| [0007](0007-audit-loop-cadence.md) | Audit Loop Cadence | Accepted (operational details amended 2026-06-14) | placement → 0019; invocation/run-dir → 0016; findings now file-based, not Linear |
| [0008](0008-skill-surface-split-and-curation-policy.md) | Skill Surface Split + Curation Policy | Accepted | counts are as-of 2026-05-18 |
| [0009](0009-sibling-repo-deprecation.md) | Sibling Repo Deprecation (Consolidation) | Accepted (updated 2026-05-20) | version-SoT model → 0014 / 0019 |
| [0010](0010-docs-site-decision.md) | Docs Site Decision (defer) | Accepted | — |
| [0011](0011-split-audit-verdict-into-four-verdicts.md) | Four-Verdict Health Block | Accepted (grader-model amended 2026-05-29) | verdict placement → sidecar (0019) |
| [0012](0012-internal-skill-library-separation.md) | Internal Skill Library Separation | Accepted | `SH-` refs pre-migration; counts as-of 2026-05-21 |
| [0013](0013-scope-field-vs-overlay-of.md) | Scope Field vs `overlay_of` | Superseded | v8 / 0017 (`scope` now free-text) |
| [0014](0014-canonical-only-schema-files.md) | Canonical-only Schema Files | Accepted | — |
| [0015](0015-project-owned-operational-prompts.md) | Project-Owned Operational Prompts | Accepted (3 relocation amendments) | — |
| [0016](0016-operational-data-ownership.md) | Operational Data Ownership | Accepted (per-surface migrations sequenced) | — |
| [0017](0017-five-axis-classification-model.md) | Five-Axis Classification Model (v8) | Accepted, partially superseded | `subject` enum → 0020; `deployment_target` → boolean `public` (2026-06-08) |
| [0018](0018-relations-boundary-semantic-inversion.md) | `relations.boundary` Semantic Inversion | Accepted (aliases removed 2026-06-13) | — |
| [0019](0019-audit-state-sidecar-separation.md) | Audit-State Sidecar Separation | Accepted & implemented | — |
| [0020](0020-twelve-shelf-competency-reaxis.md) | Twelve-Shelf Competency Re-Axis | Accepted | — |
| [0021](0021-width-before-verdict-advisory-cross-review-and-mandatory-verification.md) | Width Before Verdict — Advisory Cross-Review + Mandatory Verification | Accepted | — |
| [0022](0022-representative-generator-frontier-judges.md) | Representative Generator + Frontier Judges | Accepted | — |

## Conventions

- **Numbering** is sequential and never reused; gaps are not allowed.
- **Status** is one of `Accepted`, `Accepted (amended)`, `Superseded`, `Accepted-not-implemented`, `Deferred`, `Rejected`.
- A **superseded** ADR stays in the tree with an amendment block citing the superseding ADR — prior decisions are part of the record, not deleted.
- For the schema-evolution doctrine that governs how decisions retire, see [`AGENTS.md § Major Version Is a Clean Cut`](../../AGENTS.md).
