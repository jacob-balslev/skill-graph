# ADR 0009 — Sibling Repo Deprecation (Consolidation Addendum)

> Status: Accepted — **updated 2026-05-20 (repos now archived; see § Update)**
> Date: 2026-05-18
> Linear: SH-6132 / SH-6137

> **Amendment (2026-06-14) — version-source-of-truth model superseded.** This ADR points at `skill-metadata-protocol/docs/adr/0007-version-source-of-truth.md` in the now-archived sibling mirror for the dual-versioning model. That model is superseded: schema files are canonical-only ([ADR-0014](0014-canonical-only-schema-files.md)) and per-skill `schema_version` lives in the `audit-state.json` sidecar ([ADR-0019](0019-audit-state-sidecar-separation.md)). The archived-mirror reference is historical.

## Context

Per the SH-6132 monolith decision, schemas and source code from two sibling repos were consolidated into `@skill-graph/cli`:

- `skill-metadata-protocol` (`@skill-graph/protocol@1.3.0`) — JSON schemas, migration docs, examples, ADRs
- `skill-audit-loop` (`@skill-graph/audit@0.2.0`) — audit scripts, graders, shared utilities, eval fixtures

The consolidation shipped in `@skill-graph/cli@0.5.6` (commit `654b4df`, published 2026-05-18).

## Decision

Both sibling repos become **docs-only mirrors** as of 2026-05-18:

- Source files (schemas/, src/, shared/, graders/, examples/, package.json) are removed from both repos.
- Canonical documents (SKILL_METADATA_PROTOCOL.md, SKILL_AUDIT_LOOP.md, SKILL_AUDIT_LOOP.md § Part 2 — Per-Skill Audit Checklist, READMEs) are preserved for historical reference and inbound-link stability.
- Repos are NOT archived on GitHub (Option B) — they remain publicly readable. *(Reversed 2026-05-20 — see § Update.)*
- Deprecation banners are added to both READMEs pointing to `@skill-graph/cli`.

## Update — 2026-05-20: repos archived (Option B → archive)

The original decision kept the mirrors un-archived so they stayed publicly *and editably* readable. With the docs-only state stable for two weeks and no further mirror edits planned, both repos were **archived on GitHub** (`gh repo archive`) on 2026-05-20:

- `jacob-balslev/skill-metadata-protocol` → `archived: true`
- `jacob-balslev/skill-audit-loop` → `archived: true`

Archiving makes each repo **read-only** while keeping it **publicly readable**, so all inbound links to READMEs and canonical docs remain valid — the original inbound-link-stability goal is preserved. The only change is that the mirrors can no longer be pushed to without first un-archiving. This supersedes the "NOT archived (Option B)" bullet above; the consequence "stay alive as read-only mirrors" now means *archived* read-only, not *live* read-only.

## Version source of truth (post-consolidation)

The version source of truth for `schema_version` is now `@skill-graph/cli` — specifically the schemas bundled under `lib/schemas/` in the published package. ADR 0007 in `skill-metadata-protocol/docs/adr/0007-version-source-of-truth.md` documents the dual-versioning model; this ADR records the physical move.

New consumers should install `@skill-graph/cli` and reference:
- `https://github.com/jacob-balslev/skill-graph/blob/main/SKILL_METADATA_PROTOCOL.md`
- `https://github.com/jacob-balslev/skill-graph/blob/main/SKILL_AUDIT_LOOP.md`
- `https://www.npmjs.com/package/@skill-graph/cli`

## Consequences

- `skill-metadata-protocol` and `skill-audit-loop` repos stay alive as **archived** read-only mirrors with deprecation banners (archived 2026-05-20 — see § Update).
- All new schema evolution and audit tooling development happens in `skill-graph`.
- External links to the sibling repos' README and canonical docs files remain valid.
- Links to source files (schemas/, src/) in the sibling repos become 404s — consumers must migrate to `@skill-graph/cli`.

## Related

- SH-6132 — Monolith consolidation decision
- SH-6133 — Source consolidation into skill-graph
- SH-6134 — Unified CLI dispatcher
- SH-6136 — v0.5.6 publish
- ADR 0007 in `skill-metadata-protocol/docs/adr/` — version source of truth (with 2026-05-18 addendum)
- ADR 0008 — Skill surface split and curation policy
