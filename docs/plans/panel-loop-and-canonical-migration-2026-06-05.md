# Plan — Official Panel Loop + Canonical-Location Migration (2026-06-05)

> Type: Plan (active). Started 2026-06-05. SYSTEM work (skill-graph).
> Resume point for the next session. Handoff prompt at the bottom.

## What this session delivered (all committed)

**Official multi-agent PANEL ENRICH loop** — the user's spec: Opus 4.8 + GPT-5.5 MANDATORY + every free agent ADVISORY, each its OWN research+proposal; all agents cross-review → iterate to convergence; frontier curator union-merges under strict anti-loss + mandatory-coverage, may fold advisory in; bidirectional eval guardrail + keep/revert; apply-on-keep.

| Commit (skill-graph unless noted) | What |
|---|---|
| `2274369` | fix: eval guardrail skips → keep on missing eval artifact (pilot crash; 31/33 skills lack application.json) |
| *(feat panel loop)* | `lib/audit/run-panel-enrich.js` + `panel-enrich-live-deps.js` + `prompts/skill-audit-loop-{cross-review,revise}-pass.md` + gemini/opencode arg builders in `enrich-live-deps.js` + tests `test-panel-enrich.js` (17) + `test-panel-enrich-live-deps.js` (7) |
| `4d01db2` | docs: `SKILL_AUDIT_LOOP.md § Multi-agent PANEL ENRICH — THE OFFICIAL LOOP` + `AGENTS.md § Canonical Location` |
| `34fa8f5` | docs: full canonical-structure doctrine (migrate-with-shims, deprecate→delete-to-history, deprecate→CHANGELOG, time-of-day timestamps) |
| `f3f20f7` | fix: opencode advisory delivery — **live-verified** (minimax wrote a real 33 KB enriched proposal) |
| *(feat)* + workspace `715c7b637` | migration Stage 1a: 6 audit commands → `skill-graph/commands/audit/` + thin `.claude` shims |
| workspace `f84eba28c` | legacy filter: deleted dead orphan `scripts/skill/convert-finding-to-eval.js` |

## Critical facts (do not re-derive)

- **opencode advisory delivery rule (live-verified):** `--dir` = the run dir; the model writes the proposal to a **relative filename** in its working dir (lands at `proposalPath`); **inline all content** (skill body + brief) so NO external read is attempted; **do NOT use `--dangerously-skip-permissions`** (the auto-mode classifier blocks it and it's unauthorized). Confirmed by interviewing minimax (2026-06-05T11:08) + a 33 KB live write.
- **Panel loop CLI:** `node lib/audit/run-panel-enrich.js --skill <slug> --skill-dir <dir> --cwd <skill-graph-root> [--no-advisory] [--max-rounds N] [--dry-run] [--no-eval]`. Dry-run E2E green (2 mandatory + 7 advisory, converged round 1).
- **The 33 union skill list** is in `/tmp/enrich-loop/run-enrich-loop.sh` (that driver uses the OLD 2-frontier runner — for the panel loop, drive `run-panel-enrich.js` per skill instead).
- **Skills-repo regression** (134-file deprecated-alias relation rewrite) is stashed at `git stash@{0}` in `~/Development/skills` (recoverable; deliberately discarded pre-run).
- **Canonical structure doctrine:** `skill-graph/AGENTS.md § Canonical Location` — all Skill Graph scripts/commands live in `skill-graph/`; thin pointer-shims only where a runtime mechanically needs one; dead code deleted to git history + CHANGELOG note; timestamps carry time-of-day.

## Remaining work (resume here)

1. **Migration Stage 1b** — move `.opencode/commands/*` skill/audit commands (`skill-audit-loop`, `skill-audit-merge-v1`, `audit-skill`, `deep-repo-audit`, `skill-compound-loop`, `skill-upgrade-loop`, `skill-search`) → `skill-graph/` canonical bodies + thin `.opencode/command/` pointer-shims. CHANGELOG per removal.
2. **Migration Stage 2** — classify the 42 `scripts/skill/*` scripts: project-protocol (→ `skill-graph/scripts/` with a registered workspace shim where a hook/loop consumes it) vs workspace-orchestration (the skill-injector feeders: `skill-router`, `skill-keyword-matrix`, `skill-embedder`, `skill-search-tool`, `skills.js`, `build-keyfile-cache` — decide stay-vs-shim). Delete any dead ones (legacy/bloat filter continues; scan already run — surface is lean). Amend ADR-0015/0016 with the supersession block.
3. **Verify gemini advisory delivery live** (2/7 advisory: `gemini`, `gemini-flash` — `--yolo` + cwd=run dir; confirm a real proposal write).
4. **Apply the relative-write fix to revise/cross-review** advisory dispatch too (propose is fixed; `reviseProposal` writes the proposal file — confirm it also uses the relative-write-into-`--dir` pattern, not absolute).
5. **Run the 33 skills** through the panel loop in the foreground (stream per-agent dispatch logs + proposals from the run dir), commit each kept skill one-per-commit (CONTENT, path-limited, in `~/Development/skills`).
6. **Apply the enriched skills to the skill-graph project/repo + report findings** (the user's closing ask).

## Handoff prompt (paste to resume)

> Resume the Skill Graph official-panel-loop work from `skill-graph/docs/plans/panel-loop-and-canonical-migration-2026-06-05.md`. The panel loop (`lib/audit/run-panel-enrich.js`) is built, tested, and live-verified (opencode advisory delivery: `--dir`=run dir + relative-filename write + inline content, NO `--dangerously-skip-permissions`). Continue the canonical-location migration: Stage 1b (`.opencode/commands/*` skill commands → `skill-graph/` + thin shims), then Stage 2 (classify + move the 42 `scripts/skill/*` with shims for workspace consumers, delete dead ones, amend ADR-0015/0016) — committing per stage with CHANGELOG notes (time-of-day timestamps). Then verify gemini advisory delivery live, confirm `reviseProposal` uses the relative-write pattern, run the 33 union skills (`/tmp/enrich-loop/run-enrich-loop.sh` has the list) through the panel loop in the foreground committing each kept skill, and finally apply the enriched skills to skill-graph and report findings. All Skill Graph code stays in `skill-graph/` per `AGENTS.md § Canonical Location`.
