# ADR-0008: Skill Surface Split + Curation Policy

**Status:** Accepted
**Date:** 2026-05-18
**Task:** SH-6125
**Supersedes:** Portion of SH-6127 (Tier F mass migration)
**Related:** SH-6114 (Finding F6), SH-6127 (rescoped)

## Context

Two skill surfaces coexist in `~/Development/`:

| Surface | Path | Count | Schema status | Audience |
|---|---|---|---|---|
| **Outer** | `~/Development/skills/<name>/` | **263** active skills | Pre-v6 flat layout; `metadata:` wrapper on 0/263; Health Block on ~121/263 (~46%) | Personal library + Sales Hub skills, mixed with PII-adjacent and project-specific content |
| **Nested** | `~/Development/skills/skills/<name>/` | **141** active skills | v6 compliant cohort, OSS-portable, canonical Skill Graph library | Public, generalizable, non-PII, non-Sales-Hub |

This duality was flagged as Finding F6 in SH-6114 ("outer vs nested ambiguity"). SH-6127 originally scoped a Tier F mass migration of the 263 outer skills onto the v6 `metadata:`-wrapped layout, blocked on this architecture decision (SH-6125).

Three options were on the table:

- **Option A — Unify:** Migrate all 263 outer skills to v6, treat as one library
- **Option B — Split cleanly:** Keep outer as personal/Sales Hub (frozen), nested as OSS-portable canonical
- **Option C — Overlay:** Outer is a superset that includes nested as a view

The implicit cost of Option A is migrating 263 mixed-purpose skills (many with PII, project-specific Sales Hub assumptions, or content that is not generalizable) to the v6 contract — work that produces no OSS value and locks Sales Hub doctrine into the public schema.

Jacob's directive (2026-05-18) settles the question by removing the production assumption that motivated Option A:

> PAUSE all production of skills for the personal library (`~/Development/skills/` top-level 263) and Sales Hub skills. Use non-PII, non-Sales-Hub personal skills as INSPIRATION for OSS additions. The 141 nested at `~/Development/skills/skills/` IS the active OSS-portable canonical library. The OSS Skill Graph repo (`~/Development/skill-graph/`) is the active development surface.

## Decision

**Adopt Option B (Split cleanly) plus a Curation Policy that governs how content moves between surfaces.**

### Surface ownership

| Surface | Status | Schema | Production | Audience |
|---|---|---|---|---|
| **Outer 263** | **Frozen** | Pre-v6 flat (no migration) | **No new production** | Personal + Sales Hub historical |
| **Nested 141** | **Active** | v6 `metadata:`-wrapped, Skill Graph canonical | OSS contributions only, via curation | Public, OSS-portable |
| **Sales Hub skills** | Separate concern | Lives in Sales Hub repo / scope | Owned by Sales Hub product surface | Tenant code, not OSS library |

### Curation policy (outer → nested)

A skill on the outer surface MAY be promoted into the nested OSS library only when ALL of the following hold:

1. **Non-PII:** Contains no personal data, no real customer references, no internal-only contacts, no production identifiers
2. **Non-Sales-Hub:** Not coupled to Sales Hub data model, routes, tenants, schema, or product-specific doctrine
3. **Generalizable:** Useful to consumers outside this monorepo without rewriting the procedural guidance
4. **Curation review:** Reviewed and approved against the v6 schema contract before promotion
5. **Schema-compliant on arrival:** Promoted skill is authored (or rewritten) directly in v6 `metadata:`-wrapped layout — no migration codemod runs on the outer surface

The curation flow itself is the rescoped scope of SH-6127 (see Consequences).

### What this is NOT

- This is **not** a deprecation of the outer 263. They remain on disk, remain readable by the agent, remain part of personal workflow. They are frozen with respect to **new production** and **schema migration**.
- This is **not** a claim that the outer 263 is low quality. It is a claim that the outer surface mixes audiences in a way that makes a single schema contract counterproductive.
- This is **not** a merge of the two surfaces. They remain distinct paths with distinct contracts.

## Consequences

### Cancelled work

- **Tier F mass migration (original SH-6127 scope) is cancelled.** No v6 codemod will run across the 263 outer skills. No cohort selection pass for `comprehension_state: present` will happen on the outer surface. No mass Understanding-field hand-authoring for outer skills.
- The Health Block walker work already completed on ~121/263 outer skills (commit `3e43f6e2`) remains in place as a one-time enrichment; it is not extended to the remaining ~142 outer skills as a migration goal. If a specific outer skill is later promoted via curation, it picks up Health Block fields as part of the v6 rewrite.

### New work (rescoped SH-6127)

- SH-6127 is rescoped to define and run the **curation pipeline**: outer → nested for non-PII, non-Sales-Hub, generalizable skills. The pipeline picks candidates, applies the v6 contract, and lands them in `~/Development/skills/skills/`.

### Schema clarity

- The nested 141 is now the single source of v6 truth in this monorepo. Any reference to "the v6 library" in Skill Graph docs, lint, manifest, or routing tooling means the nested surface.
- The outer 263 is documented as a historical/personal surface on the pre-v6 flat layout. Tooling that targets v6 does not need to handle outer-surface compatibility.

### Sales Hub boundary

- Sales Hub skills are a separate concern: they live in the Sales Hub repo / scope and are owned by the Sales Hub product surface, not by Skill Graph. Skill Graph does not curate or migrate Sales Hub skills into the OSS library.

### Reversal cost

- If Jacob later decides to unify (Option A), the cancelled migration work can be revived — the policy here is "don't migrate now," not "migration is impossible." The outer 263 remain authored in their pre-v6 form, ready for codemod if ever needed.

## References

- SH-6125 — this architecture decision
- SH-6127 — rescoped to curation pipeline
- SH-6114 § Finding F6 — original outer-vs-nested ambiguity finding
- Commit `3e43f6e2` — prior Health Block walker enrichment on 121 outer skills
- `~/Development/skills/skills/` — nested 141, OSS-portable canonical library
- `~/Development/skill-graph/` — active OSS development surface
