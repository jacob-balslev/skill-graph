# Plan — Canonical-Location Migration Stage 2: `scripts/skill/*` (2026-06-05)

> Type: Plan (active). SYSTEM work (skill-graph). Created 2026-06-05T13:55Z.
> Companion to the completed Stage 1a/1b — panel + command canonical migration (that plan was finished and removed per the PLANS.md git-rm convention; see git history).
> Governs the 42 scripts under `~/Development/scripts/skill/*` per `AGENTS.md § Canonical Location` + ADR-0016.

## Why this is a plan, not a batch edit

Stage 2 moves project-protocol scripts from the workspace (`~/Development/scripts/skill/`) into
`skill-graph/` (with thin workspace shims where a hook/loop/pre-commit gate consumes them). This is
**high-risk**: the live `agent-orchestration/hooks/skill-injector.py`, the autonomous loops
(`loops.manifest.json`, `scripts/loop/*`), the pre-commit gates (`scripts/githooks/*`), and several
`package.json` scripts call into this directory. A wrong move breaks the agent runtime, the loops, or
commit-time gates.

A read-only classification pass (Explore subagent, 2026-06-05) produced the draft table below. **It is
a DRAFT, not an execution list.** Two reasons it must be verified per-script before any move:

1. **Unverified equivalence claims.** Many `skill-graph equiv?` cells say "Likely"/"Possibly" — guesses,
   not confirmed. Per `~/Development/.claude/rules/no-unverified-claims.md` + `code-preservation.md`, a
   move may only proceed once the skill-graph equivalent is confirmed to **exist and be behavior-identical**
   (else the move either duplicates an implementation or silently changes behavior).
2. **An off-by-one in the draft.** `skill-audit-claim.js` is listed under BOTH `MOVE→skill-graph` and
   `MOVE+SHIM` (43 verdicts for 42 files). Its true verdict is `MOVE+SHIM` (workspace `skill-audit-ledger.js`
   / `skill-audit-paths.js` and the loops require it) — but that itself needs confirming against the live
   consumer graph.

## Per-script execution protocol (MANDATORY for every move)

For each script with a `MOVE` or `MOVE+SHIM` verdict, in its own commit (or a small same-purpose group):

1. **Confirm the skill-graph equivalent.** Either it already exists and is behavior-identical (then the
   workspace file becomes a registered shim — `ALREADY-MIGRATED`/`MOVE+SHIM`), or it does not (then copy
   the body into `skill-graph/scripts/` or `lib/`, since `git mv` cannot cross the nested-repo boundary —
   commit the new file in skill-graph, then in a separate workspace commit replace the old file).
2. **Leave a thin shim ONLY where a live workspace consumer execs/requires it** (hook, loop, pre-commit
   gate, `package.json` script). Register the shim per `docs/reference/implementation-ownership.md`.
3. **Update every reference** (`*.js`, `*.py`, `*.sh`, `*.json`, `package.json`) in the same change.
4. **Verify the live consumers still work after the move** — at minimum: the skill-injector hook
   (`python3 agent-orchestration/hooks/skill-injector.py` smoke), the affected loop(s), and the
   pre-commit gate (`bash scripts/githooks/pre-commit` dry path). Per the user directive: "Verify the
   skill-injector hook + grind/dispatch loops still work after each move."
5. **No dead-code deletion without the evidence test** (`delete-dont-archive.md`): dates + a live-reference
   grep that excludes frozen records. The draft found **no** dead scripts; do not delete on a guess.

## Draft classification (REVIEWED — verify each before acting)

> Verdicts: `MOVE→skill-graph` (project-protocol, no live workspace-only consumer) · `MOVE+SHIM` (body
> moves; a live workspace consumer keeps a registered shim) · `ALREADY-MIGRATED` (already a shim/delegate —
> confirm the target) · `STAY-workspace` (skill-injector feeder or workspace queue/CLI — ADR-0016 type B).

### STAY-workspace (5) — workspace orchestration; do NOT move (verified rationale)
- `skill-router.js`, `skill-search-tool.js` — skill-injector feeders (the routing/discovery layer the
  agent runtime consumes). skill-graph is build-time tooling and must not depend on the agent runtime.
- `skills.js` — user-facing workspace skill CLI entry point (workspace coordination).
- `build-skill-list.js` — generates the workspace audit queue (`.opencode/progress/SKILL_LIST.json`);
  queue state is workspace-coordinated data (ADR-0016).
- `skill-evolution-analyzer.js` — required as a module by workspace-only consumers
  (`skill-families.js`, `skill-leverage-ranker.js`); moving it cascades.

### ALREADY-MIGRATED (5) — confirm the delegate target, then register the shim
- `eval-staleness-checker.js` → `skill-graph/lib/audit/eval-staleness-checker.js`
- `evaluate-skill.js` → `skill-graph/lib/audit/` graders (SH-6603)
- `run-skill-improvement-loop.js` → `skill-graph/lib/audit/run-skill-improvement-loop.js`
- `skill-improvement-helpers.js` → `skill-graph/lib/audit/skill-improvement-helpers.js`
- `skill-audit-paths.js` → delegates to `skill-graph/lib/audit/run-layout.js`; **STAYS** (binds the
  contract to the workspace absolute audit root — ADR-0016 surface #3, intentional).

### MOVE+SHIM (13) — live workspace consumer needs a shim (verify the consumer + equiv)
`build-keyfile-cache` (skill-injector.py:98), `check-version-earned` (githooks/pre-commit), `check-work-mode-separation` (githooks/pre-commit), `io-dependency-derivation`, `skill-audit-ledger`, `skill-audit-claim`, `skill-auto-create`, `skill-census` (skill-injector + skill-evolution-analyzer), `skill-embedder`, `skill-families`, `skill-keyword-matrix`, `skill-leverage-ranker`, `skill-graph-builder` (skill-injector.py:463).

### MOVE→skill-graph (19, after fixing the skill-audit-claim double-count) — confirm no live workspace-only consumer
`batch-eval`, `check-io-composition`, `claim-extractor`, `eval-discriminability-report`, `eval-linter`, `generate-skill-docs`, `refresh-skill-references.sh`, `research-feedback` (NOTE: skill-injector.py:72 references it → may be MOVE+SHIM, verify), `skill-app-coverage-matrix` (Sales-Hub-coupled → verify it isn't private-content-fenced out of skill-graph), `skill-audit-tracker`, `skill-discovery-loop`, `skill-evolution-loop-continuous`, `skill-evolution-loop`, `skill-lint`, `skill-overlap-detector`, `skill-test-runner`, `skill-verify`, `skill-writeback`, `source-truth-catalog`, `update-skill-index-counts`.

> Flagged for re-classification during execution: `research-feedback` (skill-injector consumer →
> likely MOVE+SHIM), `skill-app-coverage-matrix` (Sales-Hub-grounded → may be forbidden in skill-graph
> per the private-content boundary, like `skill-compound-loop`), `skill-lint`/`skill-overlap-detector`
> (skill-graph already has `skill-lint.js`/`skill-overlap.js` — confirm identical vs divergent before
> collapsing).

## ADR amendment owed

ADR-0015 (audit-loop spec ownership) and ADR-0016 (operational data ownership) placed these scripts in
the workspace. The 2026-06-05 canonical-location directive supersedes that for project-protocol scripts.
When the first MOVE lands, add a supersession block to ADR-0015/0016 per the amendment-block pattern in
ADR-0009 § Update (one-line, dated, time-of-day).

## Status

- Classification: DRAFT done (2026-06-05). Per-script verification + moves: NOT STARTED — high-risk,
  sequenced for a dedicated SYSTEM session per the protocol above. No moves executed yet.
- **Inventory refreshed 2026-06-11T22:46+02:00 (D1 of the audit-loop fix-list).** Confirmed against the
  live registry: of the 42 `scripts/skill/*.js`, exactly **5 are registered** in
  `docs/reference/implementation-ownership.json` (as canonical / entrypoint-shim / removed_path) and
  **37 remain UNREGISTERED + unmigrated.** The fix-list session that surfaced this did NOT execute any
  moves: the top scripts carry 50+ live workspace consumers each (across `*.js`/`*.sh`/`*.json`/`*.py`
  incl. the skill-injector hook, loops, pre-commit gates, package.json) — a relocation is the exact
  high-risk, broad-blast-radius change this plan reserves for a dedicated session, and the session in
  question had already landed 13 audit-loop commits; moving core scripts blind (with no way to run the
  full multi-repo suite) would have risked the live loop. Per the fix-list's own fallback, the rest is
  filed here. **Note (D2):** the evolve fork `scripts/skill/skill-evolution-loop-continuous.js` +
  the distinct thin walker `scripts/skill/skill-evolution-loop.js` are part of this 37 and are
  additionally analyzed in `skill-graph/CHANGELOG.md § [Unreleased] → Deprecated` (canonical =
  `lib/audit/skill-evolution-loop.js`; collapse blocked on a parity test).

### The 37 unregistered scripts — execution order (highest live-consumer count first)

> Counts are live workspace references (excluding frozen records: `.research/`, `.roundtable/`,
> `docs/plans|audits|research/`, `*/snapshots/`, `_archive`). HIGHER count = MORE references to update
> in the move's same change = higher risk. Verify the skill-graph equivalent per the § protocol before
> EACH move; do NOT batch.

| refs | script |
|---|---|
| 56 | `skill-lint.js` |
| 50 | `skill-census.js` |
| 33 | `skills.js` |
| 29 | `skill-evolution-loop.js` (D2 thin walker — distinct tool, likely `git mv` not collapse) |
| 18 | `skill-overlap-detector.js` |
| 18 | `skill-graph-builder.js` |
| 16 | `source-truth-catalog.js` |
| 11 | `skill-audit-claim.js` (MOVE+SHIM — loops/ledger/paths require it) |
| 10 | `skill-evolution-analyzer.js` |
| 9 | `skill-router.js` |
| 9 | `skill-keyword-matrix.js` |
| 9 | `generate-skill-docs.js` |
| 8 | `skill-auto-create.js` |
| 8 | `batch-eval.js` |
| 7 | `skill-leverage-ranker.js` |
| 7 | `skill-families.js` |
| 6 | `skill-test-runner.js` |
| 6 | `skill-audit-paths.js` |
| 6 | `check-version-earned.js` (pre-commit gate — MOVE+SHIM) |
| 5 | `skill-discovery-loop.js` |
| 4 | `skill-evolution-loop-continuous.js` (D2 fork of `lib/audit/skill-evolution-loop.js`) |
| 4 | `skill-audit-tracker.js` |
| 4 | `eval-linter.js` |
| 4 | `eval-discriminability-report.js` |
| 4 | `check-io-composition.js` |
| 3 | `update-skill-index-counts.js` |
| 3 | `skill-audit-ledger.js` |
| 3 | `research-feedback.js` |
| 3 | `check-work-mode-separation.js` (pre-commit warning) |
| 2 | `skill-writeback.js` |
| 2 | `skill-search-tool.js` |
| 2 | `skill-app-coverage-matrix.js` |
| 2 | `claim-extractor.js` |
| 1 | `skill-verify.js` |
| 1 | `skill-embedder.js` |
| 1 | `io-dependency-derivation.js` |
| 1 | `build-keyfile-cache.js` (KEEP — live-cache generator a running hook reads, per `delete-dont-archive`) |

**Recommended next-session order:** start from the BOTTOM (1–2 ref scripts) to build the move+shim+register
muscle on low-blast-radius files, confirm the skill-injector + loop smokes stay green, THEN climb to the
high-ref core (`skill-audit-claim`, `skill-census`, `skill-lint`) which gate the live audit loop. Each
move is one commit with its references updated in the same change; run
`node scripts/infra/check-implementation-ownership.js` after each registration.
