# Skill Audit Loop, Claude Code Panel Supervisor (v1)

> Type: Claude Code prompt for MULTI-MODEL panel runs (interactive session or `claude -p` headless)
> Created: 2026-06-10T13:40Z
> Siblings: `skill-audit-loop-codex-panel-supervisor-v1.md` (Codex automation/cron),
> `skill-audit-loop-opencode-panel-supervisor-v1.md` (interactive OpenCode session). This is the
> Claude Code equivalent — SAME canonical driver, SAME contracts, Claude-runtime adaptations only.
> Engine: `scripts/run-panel-loop.sh` (claim → panel enrich → eval-guarded apply → CONTENT
> commit → release, per skill) over `lib/audit/run-skill-audit-loop.js`
> Binding contracts: `skill-audit-loop/SKILL_AUDIT_LOOP.md` § "Multi-agent panel" + § "Canonical
> way to run the PANEL loop VISIBLY"; `docs/skill-audit-loop-philosophy.md` (the WHY)

## When to use this prompt

- Use this from Claude Code (the harness you are reading this in, or a `claude -p` headless run)
  to push the next few worklist skills through the FULL multi-model Skill Audit Loop, then stop.
- Prefer the **Codex** or **OpenCode** supervisor when **Claude/Opus is rate-limited** — those
  runtimes drive the panel without spending the Opus quota the supervisor itself needs (see
  § Rate-limit resilience below; full independence requires the single-available-frontier engine
  mode, tracked separately).
- Use `skill-audit-loop-single-model.md` when no multi-model panel is wanted.

## Operator Summary

| Field | Value |
|---|---|
| Project / workspace | `/Users/jacobbalslev/Development` (launch Claude Code from HERE, not from inside `skill-graph/` — the orchestration brain, rules, skills, and memory are cwd-keyed to this root) |
| Environment | **Local** (NOT a worktree): the claim/ledger system, the per-skill run-root, and the `~/Development/skills` CONTENT commits are shared state on the main checkout; a worktree orphans claims and strands commits. |
| Supervisor model | `opus` (Claude MAX, the `strongest-reasoning-grader` tier) — for supervising the driver; the panel's own mandatory frontiers are resolved by the engine (`FRONTIER_PAIR`), do not pin them here |
| Cadence | session- or scheduler-owned; the prompt NEVER respawns itself |

**Claude-runtime facts (the adaptations vs Codex/OpenCode):**

1. **No Codex sandbox.** Claude Code is not in the Codex `workspace-write` sandbox, so the
   network probe + `network_access` config are NOT needed. The panel still dispatches FOUR
   child CLIs (`claude`/`codex`/`gemini`/`opencode`), so the binary + auth preflight still apply.
2. **The Bash tool's max timeout is 600000ms (10 min)** — and a panel skill runs ~68 min. So you
   CANNOT run `bash scripts/run-panel-loop.sh` for a real skill as a foreground Bash call: it is
   killed at 10 min. Dispatch the driver with **`run_in_background: true`** and judge it by the
   **completion notification** the harness sends + the driver's terminal markers — NEVER by
   foreground-blocking, and NEVER by `ps`/`pgrep` polling (`.claude/rules/no-ps-for-liveness.md`).
   Optionally arm `scripts/watch-panel.js --status-file <f> --fail-on-stall` via the `Monitor` tool
   for a live view (the driver/runner write the heartbeat when `--status-file` is passed downstream).
3. **Context window**, not a per-call timeout, is your binding resource: stop at the STOP
   CONDITIONS below before context exhaustion, and `/wrap` cleanly.

## The Prompt

```text
You are Claude Code running as the Skill Audit Loop PANEL SUPERVISOR in
/Users/jacobbalslev/Development. You supervise the canonical multi-model panel driver
(scripts/run-panel-loop.sh); you do NOT hand-orchestrate panel phases and you do NOT audit
skills single-model. This is SYSTEM-adjacent supervision of a CONTENT-producing driver — the
driver owns the per-skill CONTENT commits under AUDIT_LOOP=1; you never hand-edit a SKILL.md.

READ FIRST (small, fixed — you already have the workspace rules/skills via the cwd):
1. skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md § "Multi-agent panel" + § "Canonical way to
   run the PANEL loop VISIBLY"
2. docs/skill-audit-loop-philosophy.md (curate-not-strip; eval is a guardrail; advisory never
   certifies)
3. $AUDIT_MEMORY if it exists (prior runs' outcomes; do not re-derive)

PREFLIGHT (before ANY paid dispatch; report-and-exit on failure)
1. Worklist freshness + zero-tripwire:
     node scripts/skill/build-skill-list.js --write --fail-on-empty
   Exit 3 = ZERO-TRIPWIRE: the worklist is empty while the manifest has skills — a SYSTEM bug
   (builder/manifest shape drift, the 2026-06-10 incident), NOT an empty queue. Report the builder
   stderr + the SKILL_LIST summary block and EXIT without running the panel. (Add --refresh-manifest
   when the builder warns skills.manifest.json is stale.) The written
   .opencode/progress/SKILL_LIST.md (JSON twin: SKILL_LIST.json) is the canonical skill-state
   inventory — read it; NEVER rebuild a skill inventory ad hoc.
2. Panel execution preflight on the first eligible skill (with --auth-probe so a logged-out child
   CLI is caught BEFORE any paid dispatch — recommended; it makes one cheap per-CLI no-op):
     node lib/audit/run-skill-audit-loop.js --skill <first-slug> --skill-dir <its dir> \
       --cwd skill-graph --preflight-only --auth-probe
   (run from ~/Development/skill-graph). Healthy shape: both mandatory CLIs available, no mandatory
   budget locks, every mandatory CLI's auth.<cli>.ok: true, and EITHER an active OS fence OR
   model-cli-home scratch + public_workspace.active. Any mandatory failure (incl. a failed auth
   probe) -> report the preflight JSON (the `auth` block names the CLI + its re-auth hint) and EXIT.
   NEVER fall back to auditing single-model.

RUN (dispatch the driver in the BACKGROUND — never foreground; the Bash tool's 10-min max would
kill a ~68-min skill). One driver call per skill; the claim/ledger carries state between calls.
  Dispatch via run_in_background: true (NOT a foreground Bash call):
     cd ~/Development/skill-graph && \
     bash scripts/run-panel-loop.sh --worklist --fail-fast-budget --max-skills 1 --timeout 5400
  - --fail-fast-budget: if the opus daily exhausted-lock is present (wake start or mid-drain) the
    driver emits a recoverable `run-panel-loop: BUDGET-PAUSED` marker and exits 0 cleanly instead
    of busy-waiting. (SKI-372)
  - No PANEL_LOCK_DIR override is needed (SKI-374): the default lock lives at
    skill-graph/skill-audit-loop/progress/panel-drain.lock — the SAME default the Codex and
    OpenCode supervisors use, so all three runtimes mutually exclude (one panel drain at a time;
    two concurrent panels exhaust the shared frontier quota and fail as fake watchdog timeouts).
  - Optional: pass --advisory-timeout-ms N downstream to extend long advisory research past the
    20-min default (SKI-375); --no-advisory for a fast floor-only run.
  - JUDGE THE DRIVER by the harness completion notification + the runner's terminal markers:
      SKILL-AUDIT-LOOP: COMPLETE skill=<slug> keep=<bool> exit=<0|2>   (per-skill done)
      SKILL-AUDIT-LOOP: FAILED   skill=<slug> exit=1 reason=<msg>      (per-skill exception)
    and the driver's DRAIN DONE summary line — NEVER by a stdout result JSON alone, NEVER by
    polling ps/pgrep (no-ps-for-liveness), NEVER by reading the background task's JSONL transcript
    via the shell.
  - Do NOT tail the background task's output file via Bash. Wait for the completion notification.

STOP CONDITIONS (exit cleanly at the FIRST one; resume next session)
- max-skills reached (driver prints "max-skills reached ... clean stop").
- BUDGET-PAUSED marker (opus exhausted) -> report "recoverable — resume next session". With Opus
  rate-limited, hand the loop to the Codex or OpenCode supervisor (they do not spend the Opus
  quota to supervise) rather than retrying here. Never busy-wait through a multi-hour window.
- Queue empty / no eligible skills — VALID only when SKILL_LIST.json has a non-zero worklist[] and
  the eligible set is genuinely exhausted; an empty worklist[] while the manifest reports >0 skills
  is a SYSTEM bug (the "0 eligible skills" incident), NOT an empty queue — report it and EXIT.
- A FAILED marker or non-zero driver exit: stop, include the marker line + the last ~20 log lines.
- Context window approaching exhaustion: /wrap and report which skills completed.

REPORT (end of session)
- One line per skill: <slug> · COMPLETE keep=<bool> | FAILED <reason> | SKIPPED <reason>.
- The driver's DRAIN DONE summary (processed / applied / reverted / failed / missing / skipped).
- Any preflight or auth-probe failure with the exact re-auth hint.
- Stop reason. Then /wrap.
```

## Rate-limit resilience (Opus rate-limited)

Today the panel's certifying core is the two-frontier pair `FRONTIER_PAIR = ['opus', 'codex-current']`
with `quorum: 2` and a **bidirectional** Opus⇄GPT eval — so when Opus is rate-limited the panel
BUDGET-PAUSEs (via `--fail-fast-budget`) or aborts (quorum < 2). That blocks Codex/OpenCode runs too,
not just Claude. Running the loop with GPT (codex) as the SOLE available frontier — capped at a
`PROVISIONAL` verdict (a single-frontier result is valid lower-confidence evidence per
`.claude/rules/version-schema-contract.md`; `codex-current` is a top-tier frontier, so this is NOT a
`no-lesser-models` violation) and reconciled to the dual-certified verdict when Opus returns — is a
SEPARATE engine feature (single-available-frontier degraded mode). Until it lands, a Claude/Opus
rate-limit pauses the panel on every runtime. Tracked as its own SYSTEM task.
