# Flat-Layout Skill Drift Report — 2026-05-25

> Type: Audit deliverable
> Audited surface: 302 SKILL.md files under `~/Development/skills/<name>/` (flat-layout)
> Excluded from scope: 147 canonical SKILL.md files under `~/Development/skills/skills/<category>/<name>/` (nested layout — already audited via `npm run verify`)
> Source finding: 2026-05-25 multi-model restructure-review F10/F15
> Method: deterministic frontmatter scan (12 drift patterns) across every flat-layout SKILL.md the workspace's skill-injector exposes
> Verifier: `node scripts/check-flat-layout-drift.js` (if added — currently a one-shot scan; see § Mechanisation)

## Why "flat-layout" is a separate audit surface

The skill-graph tooling repo's `.skill-graph/config.json` validates **only** the nested canonical tree at `~/Development/skills/skills/<category>/<name>/`. That tree is 147 skills, all on `schema_version: 7|8`, all gate-checked by `skill-lint.js` and the doctor pipeline.

The **302** SKILL.md files at `~/Development/skills/<name>/` live in the same on-disk location as the nested tree but are **outside** the validated corpus. They are the **runtime activation surface** — the files Claude Code, OpenCode, Codex, and the multi-agent runners actually load via `agent-orchestration/hooks/skill-injector.py`, which dereferences the symlink `agent-orchestration/skills → ../skills` and resolves `SKILLS_PATH / <name> / SKILL.md` against the flat tree (see `skill-injector.py:56` + `find_skill_file()` at `:3082`).

**Two-surface architecture (verified 2026-05-25):**
- **Tracked in `jacob-balslev/skills` HEAD:** 153 SKILL.md files under nested `skills/<category>/<name>/` — the **publish surface** that ships to skills.sh per the v8 migration sweep (`feat(skills): migrate <subject> batch to v8` commit series).
- **Untracked working-copy on disk at `~/Development/skills/<name>/`:** 302 SKILL.md files (the **runtime activation surface**). Intentionally untracked in the public repo so the publish surface stays clean; the workspace runtime reads them via the symlink. Versioning of these files lives outside the public repo's history.

The drift cataloged below is in the **runtime activation surface**. Fixes to these files do not flow through the public-repo commit history; they are workspace-runtime fixes that take effect immediately for any local agent run that loads the affected skills.

The F10/F15 finding ("flat-layout skills carry v3-v5-v7 mixed drift") is a finding about the **runtime activation surface**, not the canonical protocol corpus.

## Drift summary (302 files scanned)

| # | Pattern | Count | % | Severity |
|---|---|---|---|---|
| 1 | carries legacy `family` facet (v8 retires) | 296 | 98% | LOW (retired but harmless during v8 sunset) |
| 2 | carries legacy `layer` facet (v8 retires) | 296 | 98% | LOW |
| 3 | carries legacy `layerPrimary` workspace facet (v8 retires) | 296 | 98% | LOW |
| 4 | carries legacy `routingRole` workspace facet (v8 retires) | 296 | 98% | LOW |
| 5 | carries `primaryCategory` without `category` | 291 | 96% | MEDIUM (v7 protocol requires `category`; workspace-only `primaryCategory` does not replace it) |
| 6 | carries legacy `eval_status` field (v6 split into triple) | 291 | 96% | MEDIUM (replaced by `eval_artifacts` + `eval_state` + `routing_eval` in v6+; reading `eval_status` is undefined under v7 lint) |
| 7 | `scope: operational` (workspace extension, not v7 protocol enum) | 215 | 71% | HIGH (would fail v7 protocol lint; only legal because flat-layout is out-of-corpus) |
| 8 | `drift_check:` bare string (v6 wants object with `truth_source_hashes`) | 253 | 84% | MEDIUM |
| 9 | missing flat `mental_model` Understanding field | 238 | 79% | LOW (only required when `comprehension_state: present`) |
| 10 | missing `application_verdict` Health Block field | 4 | 1.3% | MEDIUM (ADR-0011 v7 contract — these 4 skip the four-verdict split entirely) |
| 11 | carries non-protocol `domain_frame` workspace block | 37 | 12% | LOW (workspace extension; not v7 protocol but not harmful) |
| 12 | **no `subject` / `operation` v8 fields at all** | 302 | 100% | HIGH (v8 migration not started for flat tree) |
| 13 | **no `schema_version` field at all** (orphan) | 4 | 1.3% | HIGH (v7 schema requires `schema_version`; these would fail lint if in corpus) |

## The 4 schema_version orphans (immediate-fix list)

These four flat-layout SKILL.md files lack `schema_version` entirely. Their content shape is v7 (four-verdict Health Block, v7-style relations) but they omit the required `schema_version: 7` field. Adding the field is honest restoration of an omitted required field, not a label-jump — the content is already at v7.

1. `~/Development/skills/ai-coding-agents/SKILL.md`
2. `~/Development/skills/doc-updater/SKILL.md`
3. `~/Development/skills/code-review/SKILL.md`
4. `~/Development/skills/design-review/SKILL.md`

Fix landed in 2026-05-25 cleanup pass as a **runtime-surface edit** (these flat-layout files are intentionally untracked in the public release repo per the two-surface architecture above). The `schema_version: 7` field was added to each file's frontmatter; the change is live on disk for the workspace skill-injector to pick up on the next skill load. No public-repo commit because the flat-layout files are not in the publish surface.

## Drift cohort analysis — why this isn't 13 separate problems

Almost every flat-layout skill (98%+) carries the same v3/v4/v5 legacy facet set (`family`, `layer`, `layerPrimary`, `routingRole`) AND the v6 Health Block AND the v7 `schema_version: 7` label AND `scope: operational` (a workspace extension). This is one coherent state: **v7 frontmatter with v3-era workspace-routing extensions retained and v8 migration not started.**

The 13 patterns above are 13 lenses on three actual problems:

- **Problem A: workspace extensions never harmonised with v7 protocol.** Drift patterns 1-4, 7, 11, 13 → 296-302 skills carry workspace-only fields (`family`, `layer`, `layerPrimary`, `routingRole`, `scope: operational`, `domain_frame`) that the protocol does not declare. They work because the workspace skill-injector reads them; they "drift" because the protocol does not own them. Either the protocol absorbs them (ADR + schema extension) or the workspace strips them (codemod). Doing neither is the silent acceptance hole.

- **Problem B: v6 lifecycle field replacements never propagated.** Drift patterns 6 + 8 → 253-291 skills carry `eval_status` (legacy) instead of the v6+ triple, and `drift_check` as a bare string instead of the v6 object. The codemod is mechanical but per-skill review is needed because some `eval_status: evals` skills genuinely have evals while others claim them without proof.

- **Problem C: v8 migration not started for the flat tree.** Drift pattern 12 → 302/302 skills lack `subject` / `operation`. ADR-0017 Phase 4 codemod (`scripts/migrate-skill-v7-to-v8.js`) was authored against the canonical nested tree only; it does not currently walk the flat tree. The flat tree migration is a separate work item.

## What this report does NOT do

Per AGENTS.md "Version Labels Are Earned, Not Bumped" + `.claude/rules/code-preservation.md` "improve = enrich, never silently delete":

- **No mass strip of legacy facets** (`family`, `layer`, `layerPrimary`, `routingRole`). Each removal must be paired with a v8 `subject`/`operation` choice and reviewed.
- **No bulk `scope: operational` → `scope: project` rename**. The 215 skills carrying `operational` are workspace-extension; the v8 `scope: project` enum value is for project-scoped skills in the protocol sense. Mapping is not 1:1.
- **No bulk `eval_status` → triple conversion**. The mapping requires reading each skill's actual eval state.
- **No bulk v8 migration of the flat tree**. The codemod must be extended to walk the flat tree, run dry-run, and produce a per-skill mapping artifact for HITL review (mirroring the ADR-0017 Phase 4 pattern).

This report is the audit deliverable. The corpus-wide fixes are downstream batched workstreams that follow it.

## Recommended remediation order

| Priority | Item | Reason |
|---|---|---|
| P0 | Fix 4 `schema_version` orphans (one commit, +1 line each) | Restores omitted required v7 field. Fully tractable. Done 2026-05-25. |
| P1 | Extend `scripts/migrate-skill-v7-to-v8.js` to optionally walk the flat tree (`--include-flat` flag) | Required infrastructure for Problem C. Mechanical; no per-skill judgment. |
| P2 | Run `migrate-skill-v7-to-v8.js --include-flat` in dry-run; produce `audits/migration-mapping-v7-to-v8-flat.json` | HITL gate — generates per-skill `subject`/`operation` proposals with confidence column. |
| P3 | Per-`subject` batch commits applying the reviewed mapping | One commit per subject (9 commits + one cleanup-completing commit), mirroring ADR-0017 Phase 4. |
| P4 | After v8 migration: strip `family`/`layer`/`layerPrimary`/`routingRole`/`primaryCategory` legacy facets in a single codemod commit per-subject batch | Only safe AFTER the v8 fields they retire are populated. |
| P5 | Convert `eval_status` → `eval_artifacts`/`eval_state`/`routing_eval` triple | Per-skill review required (each `evals: evals` claim needs verification). |
| P6 | Convert bare-string `drift_check:` to v6 object form with `truth_source_hashes` | Only meaningful for skills that actually declare truth sources; for the rest, drop the field. |
| P7 | Either absorb `scope: operational` into the v7/v8 protocol enum (ADR) OR rename the 215 skills to `scope: project` (codemod with per-skill review) | Requires a protocol decision before any cleanup. |

## Mechanisation

The drift scan can be re-run any time via the inline script preserved in this report's audit trail. To turn it into a recurring doctor gate (so future flat-tree drift becomes loud), add a `scripts/check-flat-layout-drift.js` script (mirroring `scripts/check-schema-constants.js`) and wire it into the doctor pipeline as a WARN-only gate (since flat-tree skills are out-of-corpus by `.skill-graph/config.json` design).

Tracking issue / future work: not yet filed; per the user's 2026-05-25 directive these are leftovers being solved in-session — the actionable next steps live in the "Recommended remediation order" table above, not in a separate Linear ticket.

## Completeness claim (per `methodical` RULE-9)

- I examined **302** flat-layout SKILL.md files (full population — every file matching `find ~/Development/skills -maxdepth 2 -name SKILL.md ! -path '*/skills/skills/*'`).
- I scanned each against **13** drift patterns.
- I reported on **all 302 skills × all 13 patterns**. No filtering by severity.
- Items I excluded:
  - The 147 canonical nested-layout SKILL.md files — they are inside the validated skill-graph corpus and audited via `npm run verify`; F10/F15 specifically targets the flat-layout surface.
  - The `marketplace/skills/` mirror — it is a generated export, not authored content, so its frontmatter is by-design v7-pinned (see AGENTS.md § Conformance caveat).
