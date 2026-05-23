# ADR 0013 — Scope Field Direction: Fix the Contract, Don't Deprecate the Field

> Status: **Accepted** — Option A (fix, not deprecate)
> Date: 2026-05-23
> Decided: 2026-05-23 by Jacob Balslev
> Driver: `skill-corpus-scope-naming-audit-2026-05-23.md` (in the sibling `Development/` repo at `/Users/jacobbalslev/Development/docs/research/skill-corpus-scope-naming-audit-2026-05-23.md` — cross-repo path, not a markdown link, so the in-repo link-check stays clean)
> Authors: Claude Opus 4.7 (audit pass), corrected by user sign-off
> Supersedes: nothing — first ADR on this dimension

## Decision (2026-05-23)

**Option A is ACCEPTED. Option B is REJECTED. Option C is REJECTED.**

The `scope:` field stays. It is load-bearing typed signal that downstream consumers (router, audit loop, grader pipeline, drift checker, marketplace publication gate) actively read. Deprecating it because two authoritative surfaces (the protocol schema enum and the `skill-census.js` tooling enum) disagree is a category error — the contradiction is a FIX problem at the surface level, not a justification for removing the field.

The web research that motivated Option B compared this workspace to OSS skill marketplaces (skills.sh, Anthropic's 17 official skills, vercel-labs/skills). Those are storage systems for portable text. This workspace is a structured knowledge graph with a routing eval, a grader pipeline, and an audit loop with `scope`-conditional gates. Different problem space, different vocabulary requirements. The mainstream answer ("path-as-namespace replaces a frontmatter scope label") does not apply unmodified.

**Open follow-up (resolved 2026-05-23):** The corpus is **normalized down to the existing protocol enum** (`portable`, `reference`, `codebase`); the schema enum is NOT expanded. This was the open follow-up after Option A was accepted; both sub-options were reviewed against the parser-fixed audit data and the normalize path was selected. Rationale:

- The protocol enum is the externally-published contract that interoperates with Anthropic's `SKILL.md` spec, Cursor MDC, vercel-labs/skills, and the skills.sh marketplace. Adding 3 workspace-internal values (`operational`, `generic`, `overlay`) to a contract three external surfaces don't carry shrinks portability.
- The 277-skill mechanical relabel (243 `operational` + 34 `generic`) is mostly automatable via `scripts/skill/preview-scope-normalization.js` Strategy A, which (post-parser-fix 2026-05-23) honors all four `operational → {portable, reference, codebase, mixed}` transitions instead of dumping everything into `codebase`.
- The 26 skills the audit classifies as MIXED (`mixed`, `portable + codebase`, `portable with sales-hub examples`, etc.) need SPLIT/OVERLAY work — that work is already on the bucket-C and bucket-overlay backlog and is not new debt created by this normalization.
- The marketplace publication gate (`scope: codebase|operational` excluded from public release) survives the normalization: `operational` collapses into `codebase`, both of which are already excluded.

The original ADR alternatives section is preserved below for historical record.

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

## Options considered

### Option A — Fix the contract: align corpus and tooling to the schema (ACCEPTED)

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

### Option B — Deprecate `scope:` in favor of path-based activation + `overlay_of:` (REJECTED)

> **Rejected 2026-05-23.** This option directly contradicts the project's stated mission. From `skill-graph/AGENTS.md`: *"The base SKILL.md spec (adopted by Claude, Codex, Gemini, Copilot, and Cursor) carries only two fields: name and description. Two fields cannot scale a real library... Skill Graph's mission is to make a teaching-skill library scale by making each skill's relevance, scope, grounding, and relationships explicit."*
>
> The project EXISTS to provide more typed structure than skills.sh, skillsmp.com, and Anthropic's vanilla `SKILL.md` spec. Recommending deprecation of `scope:` because the OSS ecosystem doesn't have it is the exact failure mode the project is designed to fix — collapsing a typed library back into a `name + description` flat folder. The 2026 community standard cited in the original recommendation is the standard this project deliberately rejects.
>
> Additionally: `scope:` is load-bearing for the routing eval, the audit loop's `scope`-conditional gates, the marketplace publication gate (which excludes `scope: codebase|operational` from the public release), and the grader pipeline. Removing the field breaks downstream consumers that actively read it.
>
> Original analysis kept below for context.

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

### Option C — Hybrid (REJECTED)

Keep `scope:` as informational (no validation), but make path placement and `overlay_of:` authoritative for routing and activation. The field becomes a non-binding hint.

> **Rejected 2026-05-23.** Same mission conflict as Option B (downgrades a typed field), with additional cost: introduces two truth surfaces (path-inferred vs. declared) that the audit loop must reconcile. Trades a fixable contradiction for a structural one.

**Pros:** zero-disruption migration, both old and new tooling work.
**Cons:** ambiguity. Two truths. The drift problem that motivated this ADR returns in a different form. Also: dilutes the typed-field guarantee that the project's mission depends on.

## Accepted decision: Option A — fix the contract, normalize the corpus

The audit evidence (453 active SKILL.md files, 277 in non-protocol enum after the parser-fix recount, 61 duplicate leaf-names, 12+ "## Sales Hub Override" bolt-ons) plus the project's mission (typed structure beyond `name + description`) point the same way. The contradiction between `schemas/skill.v7.schema.json` and `scripts/skill/skill-census.js` line 227 is a tier-1 fixable surface conflict, not a justification for downgrading the field.

The migration path (post-parser-fix data, 2026-05-23):

1. **Accept this ADR.** Pin the direction so subsequent work doesn't second-guess.
2. **Fix the parser bug first** ✅ (done 2026-05-23). `scripts/skill/build-complete-skill-inventory.js` + `scripts/skill/select-duplicate-canonicals.js` now read both flat top-level frontmatter AND the nested `metadata:` block used by the 142+ nested-tree Skill Graph skills. Without this, every downstream recommendation was scored against blank scope/schema_version for ~30% of the corpus.
3. **Dedup pass.** Apply `select-duplicate-canonicals.js` recommendations (post-fix: 19 HIGH-confidence, 39 MEDIUM, 3 LOW — total 61 pairs). Of those, 44 now correctly pick the nested/deep canonical (only 17 still pick flat, mostly cases where the flat copy carries more recent eval work). Each losing copy becomes a redirect-stub (frontmatter `redirects_to: <canonical>`). Reduces corpus to ~392 unique skills.
4. **Normalize corpus to protocol enum.** Strategy A from `scripts/skill/preview-scope-normalization.js`: `operational → {portable: 54, reference: 12, codebase: rest}` based on each skill's audit `actual_scope`, `generic → portable` (34 skills). 26 skills classified MIXED by the audit are routed to step 5 (SPLIT/OVERLAY), NOT mechanical relabel. Touches ~251 SKILL.md files mechanically + flags 26 for split work.
5. **Bucket-C splits.** Extract portable concept from project-overlay content into a sibling skill (e.g. `a11y` portable + `sales-hub-a11y` overlay). Inbound-ref order, low refs first.
6. **Update `skill-census.js` line 227.** Replace the workspace-local enum `[operational, reference, overlay, generic]` with the protocol enum `[portable, reference, codebase]`. Manifest, lint, drift, and marketplace export gates all become tier-1 aligned.
7. **Audit-loop and router re-baselined** against the corrected scope distribution (181 portable / 146 codebase / 91 reference, projected from Strategy A).

`overlay_of:` is **not** introduced in this path. Overlays are handled by step 5 as separate sibling skills with `relations.related` pointers — preserving the typed-relation model the graph already uses, without adding a new schema field that would partially re-introduce Option B's mission conflict.

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

> **Status (2026-05-23):** Q1 and Q5 resolved. Q2–Q4 dropped because Option B was rejected.

1. ~~**Which option (A / B / C)?**~~ → **Resolved: Option A** (fix the contract, do not deprecate).
2. ~~Option B schema v8 timing~~ — n/a, Option B rejected.
3. ~~Option B path convention~~ — n/a, Option B rejected.
4. ~~Option B `overlay_of:` relation inheritance~~ — n/a, Option B rejected.
5. ~~**Expand schema enum OR normalize corpus?**~~ → **Resolved: normalize corpus.** 277 SKILL.md edits using Strategy A from `scripts/skill/preview-scope-normalization.js` (post-parser-fix). 26 mixed skills route to bucket-C SPLIT work, not mechanical relabel. Protocol enum stays at 3 values. Rationale recorded in the Decision block at the top of this ADR.
