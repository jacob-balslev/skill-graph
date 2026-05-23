# ADR 0013 — Scope Field Direction: Normalize, Deprecate, or Hybrid

> Status: Proposed — awaiting decision
> Date: 2026-05-23
> Driver: [skill-corpus-scope-naming-audit-2026-05-23](../../../Development/docs/research/skill-corpus-scope-naming-audit-2026-05-23.md)
> Authors: Claude Opus 4.7 (audit pass), pending user sign-off
> Supersedes: nothing — first ADR on this dimension

## Context

A full body-read audit of all 453 active `SKILL.md` files in the canonical library (`/Users/jacobbalslev/Development/skills/`) found two structural contradictions that block coherent maintenance work:

### Contradiction 1 — The `scope:` field has TWO incompatible enums

- **Protocol enum** (`schemas/skill.v7.schema.json` + `SKILL_METADATA_PROTOCOL.md`): `[portable, reference, codebase]`
- **Workspace tooling enum** (`scripts/skill/skill-census.js` line 227, `VALID_SCOPES`): `[operational, reference, overlay, generic]`

These overlap on `reference` only. The corpus follows the tooling — 234 skills (~52%) declare `scope: operational` and 29 (~7%) declare `scope: generic`. Zero skills declare `scope: codebase`. Two declare `portable`. Both surfaces validate-check their own declarations internally and pass; the conflict is invisible until you compare them.

This is not author error or drift in the usual sense — it's a contract conflict at the tier-1 level (binding machine schema) between two artifacts that both claim authority.

### Contradiction 2 — The 2026 community standard is to NOT have this field

Web research (full details in `Development/skills/skill-scaffold/references/skill-library-scope-taxonomy-2026-05-23.md`) found:

- **Anthropic's 17 official skills** (anthropics/skills repo) carry only `name` and `description`. No `scope:` field.
- **vercel-labs/skills** (powering the 34,000-skill skills.sh marketplace) defines scope by **install location** (project / personal / org / marketplace), not by frontmatter metadata, and ships `skills-lock.json` for portability.
- **Cursor MDC** uses `globs:` + `alwaysApply:` for path-scoped activation and beats Copilot's monolithic injection by **68% on per-request tokens** (30-day benchmark).
- **SWE-Skills-Bench** (arxiv 2603.15401, 2026) tested 49 SWE skills on 565 real GitHub tasks: 39 produced zero gain, 3 actively DEGRADED performance up to -10% due to version-mismatched concrete templates. Prescription: "favor abstract guidance patterns over concrete opinionated templates."

The mainstream answer to "what is this skill scoped to" is **what activates it** (glob, path placement, plugin namespace), not a categorical frontmatter label.

### Half-finished structural duplication adds pressure

The same audit found:
- 300 flat skills at `skills/<name>/`
- 10 single-nested at `skills/<category>/<name>/`
- 97 double-nested at `skills/skills/<category>/<name>/`
- 46 deeper sub-skill structures

61 leaf-name collisions across these layouts. Nested copies are usually (but not always — `merge-queue` is the exception) the clean v6/v7 Skill Metadata Protocol canonicals. Flat copies are usually dirty, `scope: operational`, with embedded Sales Hub paths.

Dedup decisions and scope-field decisions are entangled: a `scope:` normalization sweep is wasted work on copies that will be redirect-stubbed.

## Decision

**Proposed but not yet accepted.** Three options.

### Option A — Normalize on protocol enum (`portable / reference / codebase`)

**Mechanical impact** (per `scripts/skill/preview-scope-normalization.js`):
- `operational` (234) → `codebase` (mostly) or `reference` (the `agents/*` model-card family)
- `generic` (29) → `portable`
- `overlay` (rare) → `reference` + add `overlay_of: <base>`

Resulting distribution: codebase 222, portable 127, reference 95.

**Pros:**
- Restores tier-1 alignment between schema and tooling.
- The `check-category-enum.js`-style gate becomes meaningful.
- The protocol's `codebase` value (with `grounding:` block required) gets put to work.

**Cons:**
- Requires `scripts/skill/skill-census.js` line 227 update (workspace-wide blast radius). Manifest, lint, drift, marketplace export are all downstream.
- Doubles down on the file-level `scope:` field at a moment when the community is moving the opposite direction.
- Says nothing about the duplicate-pair problem.

### Option B — Deprecate `scope:` in favor of path-based activation + `overlay_of:` (RECOMMENDED)

**Mechanical impact:**
- Remove `scope:` from the schema. Stop emitting it in templates. Existing values stay as informational metadata until the next migration sweeps them.
- Introduce `overlay_of: <skill-name>` for project-bound skills that extend a portable base.
- Use path placement to encode scope:
  - `skills/<name>/SKILL.md` — portable concept (the default)
  - `skills/<project>/<name>/SKILL.md` — project-bound (e.g. `skills/sales-hub/typography/SKILL.md`)
  - `overlay_of:` field links the overlay to its base.
- Audit-loop and router infer scope from path, not from a label.

**Pros:**
- Aligns with 2026 community standard (Anthropic, Cursor, Copilot, vercel-labs).
- Empirically backed by SWE-Skills-Bench's "abstract guidance > concrete templates" finding.
- Path-as-namespace is more robust than label conventions (no `sh-foo` prefix collisions).
- Naturally encodes the user's already-in-flight `project-X` / `<project>-Y` umbrella+instance pattern (e.g. `project-ontology` + `sales-hub-ontology`).
- Composes with the duplicate dedup decision: once a canonical is selected, its path encodes its scope; the losing copy becomes a redirect stub at its original path.

**Cons:**
- Schema bump (v7 → v8) + migration codemod required.
- Existing `relations.*` references that target a skill by name (not path) need to be re-evaluated when overlays appear.
- The audit-loop tooling needs a path-based scope inferrer; today it reads the field directly.
- The mainstream-tool comparison is from the OSS skills ecosystem; this repo's needs (multi-repo orchestration brain + skill graph + audit loop + grader pipeline) are more demanding. Path-based may not be sufficient signal for the router.

### Option C — Hybrid

Keep `scope:` as informational (no validation), but make path placement and `overlay_of:` authoritative for routing and activation. The field becomes a non-binding hint.

**Pros:** zero-disruption migration, both old and new tooling work.
**Cons:** ambiguity. Two truths. The drift problem that motivated this ADR returns in a different form.

## Recommended decision: Option B

The audit evidence (453 skills, 264 in non-protocol enum, 61 duplicate leaf-names, 12+ "## Sales Hub Override" bolt-ons) plus the 2026 community research plus the user's parallel-creation of `project-X` / `sales-hub-X` skills all point the same way. The protocol's `scope:` field as currently designed is solving a problem the corpus has moved past.

The migration path:
1. **Accept this ADR.** Pin the direction so subsequent work doesn't second-guess.
2. **Dedup first.** Apply `select-duplicate-canonicals.js` recommendations (58 HIGH-confidence, 3 MEDIUM). Reduces corpus from 453 to ~392 unique skills.
3. **Schema v8 migration.** Add `overlay_of: <skill-name>`. Deprecate `scope:` (kept as informational; lint warns but doesn't fail).
4. **Move project-bound flat skills under `skills/<project>/`.** Mechanical move. Path becomes the scope.
5. **Bucket-C splits** in inbound-ref order (low refs first; `agents` / `contracts` / `task-execution` last).
6. **Bucket-B cleanups.** Extract `## Sales Hub Override` sections to overlay siblings.
7. **Update tooling** (`skill-census.js`, audit-loop, router) to infer scope from path + `overlay_of:`.

## Consequences

### If Option B is accepted

- All work in `docs/research/scope-normalization-preview-2026-05-23.md` becomes moot — the field is going away, not normalizing.
- `select-duplicate-canonicals.js` recommendations can proceed immediately; they're independent of the scope decision.
- The audit-loop routing in `.opencode/progress/audit-loop-routing.json` becomes the temporary policy until tooling catches up.
- The execute session that follows the 2026-05-23 audit has clear sequencing.

### If Option A is accepted

- The scope-normalization preview's Strategy A column becomes the mechanical sweep target.
- The duplicate dedup still happens, but with `scope:` normalization layered on top.
- The community-standard drift remains. Future re-audits may revisit this decision.

### If Option C is accepted

- Lowest-disruption short-term outcome.
- Highest long-term cost: two coexisting truth surfaces invite the next drift cycle.

## Evidence references

- **Audit report:** `Development/docs/research/skill-corpus-scope-naming-audit-2026-05-23.md`
- **Web research:** `Development/skills/skill-scaffold/references/skill-library-scope-taxonomy-2026-05-23.md` (local; gitignored under skill-scaffold/*)
- **Complete inventory:** `Development/.opencode/progress/complete-skill-inventory.json`
- **Dedup recommendations:** `Development/docs/research/duplicate-canonical-recommendations-2026-05-23.md`
- **Scope normalization preview:** `Development/docs/research/scope-normalization-preview-2026-05-23.md`
- **Audit-loop routing decisions:** `Development/.opencode/progress/audit-loop-routing.json`
- **Routing-with-buckets enriched worklist:** `Development/.opencode/progress/skill-audit-worklist-with-buckets.json`
- **Census tool with the conflicting enum:** `Development/scripts/skill/skill-census.js` line 227
- **Protocol schema:** `schemas/skill.v7.schema.json`
- **Related ADRs:** [ADR 0011 — Split audit verdict into four verdicts](0011-split-audit-verdict-into-four-verdicts.md), [ADR 0009 — Sibling repo deprecation](0009-sibling-repo-deprecation.md)

## Open questions for the user

1. **Which option (A / B / C)?** This ADR recommends B, but A is a defensible incremental path.
2. **If B: schema v8 timing?** Now (block bucket-B/C/D/E sweeps until migration lands), or staged (deprecate now, remove in v9)?
3. **If B: path convention for project-bound skills?** `skills/<project>/<name>/` or `skills/_<project>/<name>/` (underscore prefix to signal non-portable, parallel to `_archived/`)?
4. **Do `overlay_of:` overlays inherit `relations.*` from the base, or restate them?** Affects router complexity.
