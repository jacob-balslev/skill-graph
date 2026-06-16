# ADR 0016 — Operational Data Ownership

> Status: Accepted — 2026-05-27 (was Proposed 2026-05-25)
> Linear: none (synthesis-driven; downstream of the 2026-05-25 multi-model restructure review)
> Authors: Opus 4.7 session (2026-05-25) synthesizing the Opus + GPT-5.5 review at `.roundtable/skill-graph-restructure-review-2026-05-25/`
> Related: ADR-0009 (sibling repo deprecation — source consolidation), ADR-0015 (project-owned operational prompts — spec consolidation), this ADR (operational-data consolidation).

## Status

> **Supersession note — 2026-06-07T (run-root relocation).** Surface #3's run-root was relocated from `<ws>/.opencode/progress/skill-audits` to `<ws>/skill-graph/skill-audit-loop/progress/skill-audits` per user directive. The run-layout substructure underneath is unchanged (`<skill>/runs/<YYYY-MM-DD>T<HHMM>--<op>--<model>--<id>/`, plus `_ledger.jsonl`, per-skill `history.jsonl`, and the `latest` symlink). The new root lives inside the `skill-graph/` tree (gitignored transient scratch — `skill-graph/.gitignore` `skill-audit-loop/progress/`) rather than under the workspace `.opencode/progress`. This refines the original surface-#3 Decision ("`.opencode/progress/...` stays as the runtime path because concurrent claim atomicity needs workspace-level locks"): the lock dir (`.claude/agent-memory/`) and the worklist (`.opencode/progress/SKILL_LIST.json`) are unchanged at workspace level — only the per-skill run-artifact root moved. The single source of truth is `scripts/skill/skill-audit-paths.js::AUDIT_ROOT` (`AUDIT_ROOT_SEGMENTS`); the pure layout contract `lib/audit/run-layout.js` remains root-agnostic (the root is an argument). The write fences (`lib/audit/public-content-fence.js::defaultPublicRoots` and `lib/audit/skill-audit-loop-live-deps.js::advisoryWritableRoots`) moved the writable run-root with it; because the new root nests inside the read-only `skillGraphRoot`, the SBPL last-match rule re-allows it for write — the same pattern already used for `<skill-graph>/.opencode/progress`.

> **Supersession note — 2026-06-05 (canonical-location directive).** `AGENTS.md § Canonical Location` (user directive) supersedes this ADR's placement of **project-protocol scripts** under `~/Development/scripts/skill/*`: each moves into `skill-graph/` (`scripts/`/`lib/`/`bin/`), leaving only a registered thin shim where a workspace hook/loop/pre-commit gate mechanically requires one. The trinary ownership classification below remains the binding model for *ownership* (project content / workspace orchestration / project-protocol scripts over workspace-coordinated data); only the *location* of the project-protocol scripts changes — to `skill-graph/`. Execution is tracked by the `stage2-scripts-skill-migration-2026-06-05` plan (42 scripts, per-script with shims). Operational run-data placement (run-root, worklist, claim locks) is unchanged from the 2026-06-07 note above.

**Accepted 2026-05-27.** The trinary classification below (project content / workspace orchestration / project-protocol scripts over workspace-coordinated data) is the binding model for operational data and project-protocol scripts. P1 (lanes.json migration) shipped on 2026-05-25 — `audits/lanes.json` is the canonical lane configuration and the workspace `.opencode/skill-audit-lanes.json` was deleted in the same change. Surfaces P2–P7 are individually sequenced; the per-surface migrations land in their own commits because each carries a coupled writer/reader update story. Audit `system-audit-2026-05-27.md` § H7 noted the Proposed-but-unsequenced state; this status update reflects that P1 is in (per the lanes.json file at `audits/lanes.json`) and that "sequencing deferred" is the residual state, not the ADR's overall acceptance.

## Context

ADR-0009 moved canonical *source code* into `skill-graph/`. ADR-0015 moved canonical *operational prompts and contracts* into `skill-graph/`. **Operational data** — the runtime byproducts of executing those prompts against that source — has remained outside `skill-graph/` by inertia. The 2026-05-25 multi-model review surfaced this gap as the largest unfinished axis of the restructure (both Opus and GPT-5.5 flagged the same surfaces as PARTIAL/HIGH on G1).

The surfaces in scope:

| Surface | Lines / refs | Current location | Touched by |
|---|---:|---|---|
| Audit-run artifacts (per-skill `runs/<run-id>/...`) | 3,241 path refs across the workspace; 1,409 files; 172 skill subdirs | `.opencode/progress/skill-audits/` | `scripts/skill/skill-audit-paths.js`, `skill-audit-claim.js`, `skill-audit-ledger.js`, `build-skill-audit-worklist.js`, `backfill-audit-state.js`, `skill-graph/scripts/check-audit-manifest.js` |
| Lane configuration | 65 lines | `.opencode/skill-audit-lanes.json` | `scripts/skill/skill-audit-claim.js:56-58, :81` |
| Skill routing config | 5,593 lines | `agent-orchestration/references/skill-routing-config.json` | `scripts/skill/skill-router.js`, `skill-keyword-matrix.js`, `skill-census.js`, `agent-orchestration/hooks/skill-injector.py` (the runtime injection hook) |
| Comprehension grader logs | 1,966 lines history; 5 lines unresolved queue | `agent-orchestration/logs/comprehension-{history,followup-queue}.jsonl` | `scripts/skill/evaluate-skill.js` (writer), `backfill-audit-state.js`, `eval-discriminability-report.js` |

### Why the binary "move it" / "keep it" framing fails

Opus's dissent in the 2026-05-25 review (opus-response.md § Dissent) names the right reason. The brief's G1 question — "is this Skill Graph-specific operational content, or genuinely workspace-level orchestrator glue?" — is **insufficient** for the lane/claim/ledger cluster. These scripts are simultaneously:

1. **Project content** — they implement the Skill Audit Loop protocol (`skill-graph/SKILL_AUDIT_LOOP.md`).
2. **Workspace orchestration** — they coordinate concurrent agents across the multi-CLI fleet, writing to a workspace-level run directory.

Moving them under `skill-graph/` would either (a) require a workspace-root spawn shim per script (inflating the very ceremony ADR-0015 reduced) or (b) break the `path.resolve(__dirname, '..', '..')` workspace-root assumption baked into `skill-audit-paths.js:27`.

The brief's binary should be a **trinary**:

| Category | Definition | Examples | Resolution |
|---|---|---|---|
| **(a) Pure project content** | Spec, schema, lint rule. No runtime path assumption. | `skill-graph/lib/audit/*`, `skill-graph/schemas/*`, `skill-graph/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook` | **Move into `skill-graph/`** (already done in ADRs 0009 + 0015). |
| **(b) Pure workspace orchestration** | Multi-project coordination. No skill-graph dependency. | `scripts/loop/loop-checkpoint.js`, `scripts/linear/*`, `agent-orchestration/hooks/skill-injector.py` (as runtime arm) | **Stay outside.** Not skill-graph content. |
| **(c) Project-protocol scripts that operate over workspace-coordinated data** | Implement a project protocol, but coordinate workspace-level state. | `scripts/skill/skill-audit-paths.js`, `skill-audit-claim.js`, `skill-audit-ledger.js`, `build-skill-audit-worklist.js` | **Project owns the CONTRACT TYPE; workspace owns the INSTANCE.** Move the type into `skill-graph/schemas/`, leave the script at workspace level, document the dual citizenship. |

The same trinary applies to data: the `routing-config.json` *contract* (what fields, what enums, what constraints) is project-owned; the *instance file* is legitimately workspace-located because the skill-injector hook (consumer) is cross-project.

## Decision

**Adopt the trinary classification above as the binding model for operational data and project-protocol scripts.** For each surface:

| # | Surface | Category | Action | Priority |
|---|---|---|---|---|
| 1 | `.opencode/skill-audit-lanes.json` | (a) project content | **Move** to `skill-graph/audits/lanes.json`; update `scripts/skill/skill-audit-claim.js` consumer; add Doc Ownership Map row. | LOW-RISK / FIRST |
| 2 | `.opencode/commands/skill-audit-merge-v1.md` | (a) project content | **Move** to `skill-graph/audits/merge-protocol.md`; add alias row in `audits/manifest.json`. | LOW-RISK / SECOND |
| 3 | Audit-run artifacts (run-root: `skill-graph/skill-audit-loop/progress/skill-audits/`, **relocated 2026-06-07T** from `.opencode/progress/skill-audits/` — see Supersession note) | (c) project-protocol over workspace-coordinated data | **Project owns the layout contract** (move `skill-audit-paths.js` exports into `skill-graph/lib/audit/run-layout.js`); the run-root instance directory now lives inside the `skill-graph/` tree as gitignored scratch (the concurrent-claim lock dir `.claude/agent-memory/` and the worklist `.opencode/progress/SKILL_LIST.json` remain at workspace level). Document in `skill-graph/AGENTS.md § Doc Ownership Map`. | MEDIUM / SEQUENCED |
| 4 | `agent-orchestration/references/skill-routing-config.json` | (c) project-protocol over workspace-coordinated data | **Project owns the schema** (new `skill-graph/schemas/routing-config.schema.json` — validates shape, enums, required fields); **workspace owns the instance** (the file stays where the skill-injector hook reads it). | MEDIUM / SEQUENCED |
| 5 | `agent-orchestration/logs/comprehension-*.jsonl` | (b) workspace telemetry, but with a project-defined contract | **Project owns the row schema** (SKILL_AUDIT_LOOP.md § Part 3 — Per-Skill Audit Runbook § 6b already defines it; promote to a schema file); **workspace owns the JSONL files** (they're append-only run output, telemetry shape). Project owns the drain protocol. | LOW / LAST |

### What this does NOT change

- `skills/` stays at workspace root — public release source per ADR-0009; this is a designed split.
- `skills.manifest.json`, `skills-lock.json`, `SKILL-INDEX.md` stay at workspace root — they describe the workspace `skills/` tree, not skill-graph.
- The Python skill-injector hook stays in `agent-orchestration/hooks/` — runtime arm, not project content.
- `agent-orchestration/`, the workspace-level orchestration engine, remains its own repo.

## Consequences

**Positive:**

- The single biggest gap in G4 (changelog/version discipline) — operational-data ownership being *implicit* — becomes *explicit*. Future agents can grep this ADR for the rule.
- Migrations sequence by surface, not by all-at-once. Each migration commits independently with `git commit --only --` and is independently revertable.
- The trinary classification gives the project a vocabulary for "project owns the type, workspace owns the instance" that doesn't currently exist. Useful well beyond audit data — applies to skill manifests, lockfiles, and any future cross-project contract.

**Negative / accepted costs:**

- Two-file overhead for category (c): a schema in `skill-graph/schemas/` AND an instance file at the consumer location. This is an acceptable trade — the schema is small, and the alternative (move + breakage) is worse.
- The audit-runs migration (surface #3) remains the largest open architectural item — but it's now scoped to "change writer paths and atomic-claim" rather than "move 3,241 files." Per the 2026-06-07T Supersession note above, the run-root was relocated to `skill-graph/skill-audit-loop/progress/skill-audits/` (the prior scratch at `.opencode/progress/skill-audits/` was copied to the new location with `cp -a` to keep the worklist/drain resuming, and the old copy can stay frozen indefinitely or be cleaned up later — neither is committed, both are gitignored).
- Rollback is per-surface, not all-at-once. If migration #1 (lanes.json) breaks, revert just that commit and its parent gitlink bump. The other migrations remain in flight.

## Migration order and rollback plan

Lowest-risk-first sequencing:

1. **Lanes.json** (surface #1) — one consumer (`skill-audit-claim.js`); 65 lines of data; trivial revert if it breaks. Lands as a skill-graph + parent gitlink pair.
2. **Merge protocol** (surface #2) — workspace command file move; no script consumers (the merge runs by prompt include). Lands as a skill-graph + parent gitlink pair.
3. **Audit-runs layout contract** (surface #3a) — extract `skill-audit-paths.js` constants into `skill-graph/lib/audit/run-layout.js`; leave the workspace script as a thin re-export. Validates the approach without moving any data.
4. **Audit-runs path migration** (surface #3b) — defer until the layout contract has been in use for ≥ 1 audit cycle without drift.
5. **Routing-config schema** (surface #4) — author `skill-graph/schemas/routing-config.schema.json`; add a one-shot validation pass; defer migration of the instance file pending evidence the schema covers all use cases.
6. **Comprehension logs row schema** (surface #5) — promote `SKILL_AUDIT_LOOP.md § Part 3 — Per-Skill Audit Runbook § 6b` row format to a schema file; add a drain CLI subcommand.

Each migration's commit message must:

- Cite this ADR.
- State which surface (1-5) it touches.
- Path-limit the commit with `git commit --only --`.
- Update `skill-graph/CHANGELOG.md` § Unreleased > Changed in the same commit.

Rollback: `git revert <skill-graph-sha>` + `git revert <parent-gitlink-sha>` per migration. No interdependence between surfaces 1, 2, 5 ensures clean per-surface revert.

## Related

- [ADR-0009](0009-sibling-repo-deprecation.md) — the source-consolidation precedent this extends.
- [ADR-0015](0015-project-owned-operational-prompts.md) — the spec-consolidation precedent this extends.
- [ADR-0011](0011-split-audit-verdict.md) — the Health Block whose `comprehension_verdict` certifies skill behavior; the routing-config schema (surface #4) must enforce field types compatible with the Health Block consumers.
- `.roundtable/skill-graph-restructure-review-2026-05-25/merged-review.md` § S2 row D2 — the synthesis resolution that motivated surface #4's "project owns type, workspace owns instance" split.
- `.roundtable/skill-graph-restructure-review-2026-05-25/followup-tasks.md` — the deduplicated catalog this ADR sequences (F07, F08, F32, F33, F34).
- `.claude/rules/multi-session-commits.md` — `git commit --only` is mandatory for every surface migration.

## Verification

This ADR is verified when:

1. The trinary classification is referenced in `skill-graph/AGENTS.md § Doc Ownership Map`.
2. The 5 migration commits have shipped (or each has an explicit deferral reason in CHANGELOG).
3. `grep -rE 'agent-orchestration/(references|logs)' skill-graph/ scripts/skill/ --include='*.js'` returns either zero hits (full migration) OR the hits map to documented thin shims with schema citations.
