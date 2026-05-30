# Skill Audit Loop — End-to-End Verification Status (2026-05-30)

> Type: Research / status investigation (one-shot). SYSTEM mode.
> Purpose: stop the recurring failure where the loop is declared "done" from code-reading, then a real skill run hits a script that was never wired or never existed. This doc records ONLY what was proven **by running it on a real skill**, with receipts — and names precisely what is still unproven.

## The standard (binding from now on)

A Skill Audit Loop step is "working" **only with a real-run receipt on a real skill.** Not "the code is wired," not "unit tests pass with mocks," not "the dispatcher dispatches." A real run, a real exit code, a real artifact. This doc is the receipt ledger.

## The loop the user wants (their words)

Skills should flow through: **audited → researched → improved → upgraded to the latest Skill Metadata Protocol schema version → used → evaluated**, automatically.

Canonical operations: `audit` / `improve` / `evaluate` / `evolve` (`bin/skill-graph.js`), with `research` and the v8 schema upgrade folded in.

## ✅ Proven this session (real runs, receipts)

| Step | Command actually run | Receipt (exit + effect) |
|---|---|---|
| `audit` (Integrity Gate, no model) | `node bin/skill-graph.js audit api-design --force` | exit 0 — ran `skill-lint.js` + `skill-graph-drift.js`; stamped `last_audited`, `lint_verdict: FAIL`, `structural_verdict: FAIL`, `truth_verdict: PASS` on `../skills/skills/product-domain/api-design/SKILL.md`; wrote `audits/api-design/{findings,verdict,scorecard}.md`; caught a real lint error. (Diagnostic write reverted afterward.) |
| `evolve` walker (analyze phase) | `node bin/skill-graph.js evolve --analyze-only --top 3` | exit 0 — built a 170-item priority queue; data quality `has-telemetry`; semantic health `3 perfect, 6 need work` |
| All 4 ops + `status` dispatch | `<op> --help` each | exit 0 for audit/improve/evaluate/evolve/status |
| Dependency wiring (the "missing script" hunt) | static require/shell-out existence sweep over `lib/audit/*.js` + `bin/skill-graph.js` | **0 missing** require targets |
| `research` step exists | file check | `lib/audit/research-feedback.js` present |
| `evolve` required dep exists | the `requires:` guard in `bin/skill-graph.js` (lines 177-189) | `lib/audit-shared/auto-improve.js` present |
| op→script dispatch map | `bin/skill-graph.js` | audit→`lib/audit/skill-audit.js`, improve→`lib/audit/run-skill-improvement-loop.js`, evaluate→`lib/audit/evaluate-skill.js`, evolve→`lib/audit/skill-evolution-loop.js`, status→`lib/audit/skill-status.js` — all files present |

## ❌ NOT proven — the Behavior half (where past "done" claims were hollow)

| Step | Why still unverified | Risk / next receipt needed |
|---|---|---|
| `audit --graded` | not run end-to-end this session (needs grader CLI) | stamps `comprehension_verdict` + `application_verdict` — the actual quality signal |
| `evaluate --mode comprehension` | not run on a real skill this session | the SH-6548 `audit-manifest:check` reds show some skills have PROVISIONAL verdicts with **no** `comprehension.json` — i.e. the artifact the eval needs is missing on real skills |
| `evaluate --mode application` | **mock-tested only** (SH-6624 unit suite). Never run with a real model on a real skill. | = SH-6624 **Phase 4**, still pending. Mocks ≠ real. |
| `improve` (Karpathy keep-or-revert) | not run end-to-end (needs model + eval delta) | the only op that mutates the skill body; depends on `evaluate` working |
| `evolve` real execution (not `--analyze-only`) | only the analyze phase was run | the automation that chains audit→improve→evaluate per skill |
| **"upgrade to latest schema version" (v8)** | **No standing migrate script exists** — `scripts/migrate-skill-v*.js` is absent by the "Major Version Is a Clean Cut" policy (codemods run once, retired to git history). The upgrade is supposed to happen **per-skill, agent-authored, through `improve`/`audit`** — NOT a codemod. Whether `improve` actually authors the v8 fields (`subject`, `deployment_target`, `scope`, Understanding fields) is **unverified.** | **This is the likely gap between the user's mental model ("skills auto-upgraded to v8") and the implementation (per-skill agent authoring).** A real `improve` run on a sub-v8 skill must be observed to either author v8 fields or NOT — currently unknown. |

## Honest synthesis

The loop **machinery exists** and the **Integrity half + the walker run end-to-end** (receipts above). The **Behavior half** — graded `evaluate`, `improve`, real `evolve` execution, and the actual v8 upgrade — is the part that has been claimed-done-but-never-proven, and was **not** proven in this session either. It is therefore **NOT done.**

## The decisive next step (one receipt closes most of the gap)

Run ONE real skill through `audit --graded → improve → evaluate` end-to-end, on the live `claude` model pipe, watching for the missing-script break. The same run also closes SH-6624 Phase 4 (real application-eval run). Sequencing note: the SH-6624 Phase-0 grader pilot saturates the model pipe; the loop proof must either follow it or pause it (the pilot is resumable per-unit).

## UPDATE (same session) — ran the proof, found + fixed the crucial break

Prioritized the end-to-end proof on a real skill. Receipts:

| Step | Real run | Result |
|---|---|---|
| `evaluate --mode application` on `okrs` (real model, the new trials/cert runner) | `evaluate --mode application --application <okrs> ... --trials 1` | ✅ exit 0 — generated+graded 4 cases, certification tier capped APPLICABLE→PROVISIONAL live, stamped a real `eval_last_run` receipt. **Closes SH-6624 Phase 4.** Caveat: grader ran on `sonnet` (no Opus default on the application grader path — a `no-lesser-models` finding); verdict not trustworthy, wiring proven. |
| `improve --skill okrs --dry-run` | first run | ❌ **CRASH** `ENOENT scandir .claude/skills` (run-skill-improvement-loop.js:575/57). The crucial broken piece. **SH-6640.** |

**SH-6640 root cause — three stacked bugs in `run-skill-improvement-loop.js`** (the 2026-05-28 CHANGELOG fix fixed this bug CLASS in `batch-eval.js`+`findSkillDirByName` but MISSED the `improve` entry point):
1. `skillsRoot` hardcoded `<cwd>/.claude/skills`, ignoring the canonical `.skill-graph/config.json` `skill_roots`. → fixed: default to `resolveSkillRoots()[0]`.
2. `collectSkillDirs` one-level `readdir` (FLAT-root assumption) vs the NESTED-by-subject canonical library → **0 skills processed even after fix #1**. → fixed: recursive `walkSkillFiles`.
3. `improve --skill <name>` (documented public flag) ignored; only `--include` read → processed whole library. → fixed: `--skill` aliases include.

**Progression proven by checking the work-count, NOT the exit code:** crash → `0 processed` → `1 processed` (okrs resolved, eval file found, `declaredEvalCount: 7`, status `analyzed`). Preflight passed ("✓ generator/grader available") in **all three** broken states — false confidence is the trap; the processed-count is the real signal.

**Still unproven (honest boundary — NOT claiming `improve` is done):**
- Full **apply-mode** generate→evaluate→keep/revert cycle. `--dry-run` analyzes but short-circuits before the eval ("No empirical eval data was captured … Run the evaluator").
- Apply-mode worktree relative-path math (`path.relative(workspace, skillsRoot)` at run-skill-improvement-loop.js:~735) now that the resolved root is OUTSIDE the workspace — untested, possible break #4.
- `audit --graded`, `evaluate --mode comprehension`, real `evolve` execution — still not run end-to-end this session.

## Architecture finding to escalate

The user's expectation of an **automated v8 upgrade** does not match the **clean-cut + per-skill-authoring** implementation. Either (a) the loop's `improve`/`evolve` must demonstrably author v8 fields on sub-v8 skills (verify by running), or (b) a real gap exists and an automated-or-assisted v8 authoring path is missing. This must be resolved by a real `improve` run on a sub-v8 skill (e.g. `methodical`, which preflight flagged as missing the required `scope` field), not by reading code.

## SESSION 2 (2026-05-30, second Opus session) — receipts

> Continues the same end-to-end completion goal. Parallel-session-aware: did not touch the 154 staged `marketplace/*` files; all commits path-limited.

### ✅ Proven this session (real runs, receipts)

| Step | Command actually run | Receipt (exit + effect) | Commit |
|---|---|---|---|
| **SH-6641** — application grader defaults to Opus, not silent sonnet | `evaluate --mode application --application okrs --eval-id 1 --trials 1` with `APPLICATION_GRADER_MODEL` **unset** | log printed `Grader model: opus  (env APPLICATION_GRADER_MODEL — default Opus…)`; 4 real model calls completed; stamped a real `application_verdict: REDUNDANT` (PROVISIONAL-capped). The default resolves to opus. Unit suite 59/0. | `c97854b` |
| **SH-6638** — docs:drift scanned gitignored `dist/` → 34 false reds | `node scripts/check-doc-drift.js` before/after | before: `FAIL doc drift: 34 stale … (all in dist/)`; after: `OK doc drift sentinel: 63 active doc(s) scanned`. Fix = one `git check-ignore --stdin` pass, fail-open. Every red was in dist/, so no real drift hidden. | `5bb7265` |
| **SH-6640 Break #4** — `improve --apply` processed 0 skills (worktree of workspace, but skills live in sibling repo) | `improve --skill acid-fundamentals --apply` | worktree now created on the **skills** repo (branch `automation/skill-loop-skills-*`); `=== acid-fundamentals [standard] ===` + `Eval #1 …` — skill **discovered + processing started**. Processed-count **0 → 1**, the same signal that proved Breaks 1-3. | `46ab052` |
| **SH-6641 follow-on** — `runEval` keep/revert grader defaulted to sonnet on the `claude` path | code fix + syntax/scope verify | same no-lesser-models bug as SH-6641 in the improve-loop comprehension gate; `runEval` now defaults its claude-grader model to Opus (`comprehensionGraderModel`). Full real-run receipt pending the keep/revert proof below. | `6515a4a` |

### ❌ Findings filed / boundaries (honest)

| Item | State | Next |
|---|---|---|
| `improve --apply` full keep/revert with the **default `opencode` grader** | **BLOCKED** — the opencode grader hangs when invoked from Node on the eval prompts (matches the known `opencode-run-from-node` gotcha); the run sat on baseline `Eval #1` indefinitely and had to be killed (worktree cleaned manually). | Re-run with `--grader claude` (now Opus, `6515a4a`). The default-grader hang is a separate CLI-integration finding to file. |
| `improve --apply` full keep/revert end-to-end (generate candidate → eval → keep-or-revert with non-zero kept/discarded) | **IN PROGRESS** — relaunched with `--grader claude` (opus). | Record kept/discarded + real eval scores when it completes. |
| Untracked skills (e.g. `okrs`) are invisible to `improve --apply` | **By design** — `git worktree add HEAD` checks out committed files only; the improve loop operates on committed skills. Not a bug; noted so future runs pick a *tracked* skill. | — |
| `okrs` SKILL.md application_verdict stamped by SESSION-1 + this session's SH-6641 proof | Left as-is — it is **untracked** in the skills repo (parallel-session CONTENT WIP); not part of any SYSTEM commit. | The parallel CONTENT session owns it. |
