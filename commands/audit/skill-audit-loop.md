---
name: skill-audit-loop
description: "Run ONE skill through the Skill Audit Loop (multi-model panel: Opus 4.8 + GPT-5.5 mandatory + advisory; full loop = audit + improve + evaluate, eval-guarded keep/revert), commit the improved SKILL.md, then USE that skill on a named project/repo and report findings. Interactive single-skill entry. NOT the autonomous batch queue-worker (.opencode/commands/skill-audit-loop.md)."
argument-hint: "<skill-name> <project-or-repo> [--no-advisory] [--max-rounds N] [--apply-only] [--improve-only] [--act]"
version: 1.0.0
since: 2026-06-06
status: active
superseded_by: null
last_changed: 2026-06-06
---

# /skill-audit-loop — Run one skill through the loop, then use it on a target

**Usage:** `/skill-audit-loop "<skill>" "<project-or-repo>"`
**Example:** `/skill-audit-loop "methodical" "Skill Graph project"`

Two phases, two modes, two commits. Arg 1 = the skill to run through the Skill Audit Loop. Arg 2 = the project (e.g. `Sales Hub`, `Skill Graph project`) or repo (e.g. `sales-hub`, `orchestrator-ui`) the improved skill is then **applied to** — i.e. the skill's methodology is run *against* that target and findings are reported. The skill stays portable in the library; the target is what it operates on.

> **This is the interactive single-skill command.** The autonomous batch queue-worker that drains the whole worklist is the OpenCode `skill-audit-loop` loop (`.opencode/commands/skill-audit-loop.md`, registered verbatim in `scripts/loop/run-loop-sweep.sh`). Same name, different runtime, different job — do not conflate them and do not gut that loop prompt.

> **Audit Doctrine — link only.** Canonical doctrine: `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Audit Doctrine. `application_verdict` is the real quality signal; lint is a floor, never the goal. The Skill Audit Loop philosophy (curate-not-strip; eval is a guardrail; two frontier models curate; advisory widens search but never certifies): `skill-graph/docs/skill-audit-loop-philosophy.md`. Do not restate either here.

## Mode separation (mandatory — read `AGENTS.md` § Work Modes)

- **Phase A is CONTENT** — it improves and commits a `SKILL.md` (+ `audit-state.json`) in `~/Development/skills` under `AUDIT_LOOP=1`, path-limited with `git commit --only`. One skill, its own commit.
- **Phase B is analysis** (report-only by default) — it reads the target project/repo and produces a findings report. With `--act`, any change to the target is committed in the **target's own repo**, never mixed with the Phase A skill commit.
- Building/editing THIS command file is **SYSTEM** work and must never ride in the same commit as a Phase A/B output.

## Private-content boundary (HARD)

Phase A research scope is the **public** skill-graph repo + skills tree + the open web — never Sales Hub / Printify / Shopify / customer / bank / personal data (memory `skill-graph-private-content-boundary`). Phase B may read a private target repo to audit it, but its findings stay in the session / Linear / the target repo — **no private noun, path, or datum may flow back into the improved skill or any public artifact.**

---

## Phase A — Improve the skill (multi-model panel, eval-guarded)

### A1. Resolve the skill

Find the skill directory by name (exhaustive search — a literal path may be approximate; see `.claude/rules/exhaustive-search-before-blocked.md`):

```bash
find ~/Development/skills/skills -type d -name '<skill>' -not -path '*/node_modules/*'
```

The canonical dir is `~/Development/skills/skills/<subject>/<skill>/` and must contain `SKILL.md`. If zero hits, STOP and report (with the search command + empty output) — do not guess.

Run the readiness preflight so the skill has what the loop needs:

```bash
cd ~/Development/skill-graph && node scripts/skill-audit-preflight.js <skill> --for all
```

### A2. Run the loop AND show the multi-agent panel IN THE MAIN CONVERSATION AREA

**The panel belongs in the MAIN conversation area — the native Task panel = the harness `TaskCreate` / `TaskUpdate` tools (the PINNED, interactive checklist at the BOTTOM of the main conversation) — NEVER the statusline.** The statusline is a bottom-line tab-title complement at most; it is never the panel surface. This is the user's repeated, standing requirement (confirmed 2026-06-07); surface the multi-agent panel as a live Task panel in the main area or you have regressed this command.

**The command RUNS the loop. Never hand the user a `!` command to paste** — the user invoked `/skill-audit-loop`; making them paste a runner command after that is the UX failure this command exists to remove (corrected 2026-06-06 per user feedback; supersedes the earlier "user runs via `!`" note).

Two ways to surface the panel, in strict priority order:

**PRIMARY (default — native Task panel via `TaskCreate` / `TaskUpdate`).** The pinned, interactive checklist the harness paints at the bottom of the main conversation IS the panel. The orchestrator session drives it directly with the Task tools, so it works regardless of how the per-model work runs underneath (Agent-tool subagents or the monolithic runner). Paint the panel as:

- ONE in_progress **header / summary** task whose `subject` + `activeForm` encode the live rollup — e.g. `⟳ Skill Audit Loop · <skill> · <phase> · N/M done · 2 QUALITY/4 advisory`. The harness renders the in_progress task's `activeForm` as the pinned header, so this line is the always-visible status banner.
- One task **per phase** (`propose` / `cross-review` / `revise` / `curate`) whose `subject` encodes the participating models + their per-model state, e.g. `cross-review · ✓Opus[Q] ⟳GPT-5.5[Q] ✓MiniMax ·Nemotron ✓BigPickle ·Gemini` (`✓` done, `⟳` running, `·` pending; `[Q]` = QUALITY/mandatory).
- `TaskUpdate` flips each phase + per-model state live as the loop runs (pending → in_progress → completed) and rewrites the header task's `activeForm` rollup on each transition.

Honest constraint: true parent/child UI nesting is NOT a Task-tool primitive, so the per-model hierarchy is **encoded in the task subjects** (the strings above), not in real nested rows — do not claim nested rows the harness does not render.

Underneath the panel, dispatch each model's per-phase work however the run is structured — typically as Agent-tool subagents (one subagent per model per phase via the per-model primitives, each writing an authoritative `result.json`):

| Phase | Per-model primitive | Dispatch |
|---|---|---|
| 1 · propose | `lib/audit/propose-one.js` | one `Agent` subagent per model (Opus native `claude`; GPT a `sonnet` wrapper running `codex`; each advisory a `sonnet` wrapper) |
| 2 · cross-review → revise/converge | `lib/audit/cross-review-one.js` + `lib/audit/revise-one.js` | one subagent per model per round |
| 3 · curate (synthesis) | `lib/audit/curate-one.js` | one frontier curator subagent |
| 4 · eval + 5 · apply | (orchestrator) | the SESSION reads each on-disk `result.json` (never the wrapper subagent's free-text report, which is unreliable) and runs the eval guardrail + apply-on-keep |

The orchestrator reads each `result.json` between phases and reflects every phase/model transition into the Task panel with `TaskUpdate`. The Agent-tool subagents are the execution layer underneath; the pinned Task panel — not the subagent `↑/↓ · Enter to view` list — is the panel the user watches. (Dispatch contract: `skill-audit-loop/SKILL_AUDIT_LOOP.md` § "In-session Agent-tool dispatch".)

**FALLBACK (scrolling collected block — NOT pinned, NOT interactive).** When you cannot drive the Task panel (e.g. the single-process runner `run-skill-audit-loop.js` on a batch/unattended drain that cannot orchestrate per-model subagents), it writes a heartbeat `status.json`; surface that in the chat with the collected-TUI viewer via the **`Monitor` tool**, the SAME viewer `/boardmeeting` uses:

```
# Step 1 — launch the runner with the Bash tool (full panel = advisory ON; --no-advisory = Opus+GPT floor).
# ~15–25 min; the harness runs it as a managed task and notifies you on exit.
AUDIT_LOOP=1 node /Users/jacobbalslev/Development/skill-graph/lib/audit/run-skill-audit-loop.js \
  --skill <skill> \
  --skill-dir /Users/jacobbalslev/Development/skills/skills/<subject>/<skill> \
  --cwd /Users/jacobbalslev/Development/skill-graph --max-rounds 2 \
  --status-file /tmp/skill-audit-loop/<skill>.status.json
```

```
# Step 2 — IMMEDIATELY attach the collected-view viewer via the Monitor tool (persistent):
Monitor (persistent):
  node /Users/jacobbalslev/Development/skill-graph/scripts/watch-panel.js \
    /tmp/skill-audit-loop/<skill>.status.json --poll 5 --stale 1800 --fail-on-stall
```

This streams every agent's phase/state into the chat as a **scrolling collected block — a new message per change, NOT the pinned/interactive Task panel.** It is a degraded fallback for the unattended-runner case only; the PRIMARY Task panel is the panel whenever the orchestrator can drive `TaskCreate`/`TaskUpdate`. It still satisfies the "run the loop VISIBLY" requirement (`skill-audit-loop/SKILL_AUDIT_LOOP.md` § "Canonical way to run the PANEL loop VISIBLY" — *"do NOT launch the runner as a blind background task with no viewer attached"*): the Monitor viewer IS the attached viewer.

**SECONDARY (statusline bridge — a cheap complement ONLY, NEVER the panel surface).** The `panel-heartbeat-to-agent-state.js` bridge (which paints one line per agent above the bottom statusline) MAY run alongside either surface above as a cheap tab-title-style complement, but it is NEVER the way you surface the panel. **DO NOT surface the panel via the statusline; the panel belongs in the main conversation area.** If the only visible output is the statusline, you have regressed this command — fix it by using the PRIMARY (or FALLBACK) main-area surface above.

Per `.claude/rules/no-ps-for-liveness.md`: never `ps`/`pgrep` the run, never tail the `.output` JSONL to guess progress — the **harness completion notification is the authoritative done-signal**. A STALE during slow advisory dispatch is "quiet ≠ dead" — confirm with ONE heartbeat read, never conclude death.

`run-skill-audit-loop.js`, the OFFICIAL loop: Phase 1 parallel propose (Opus 4.8 + GPT-5.5 MANDATORY + free advisory, each its own research) → Phase 2 cross-review to convergence → Phase 3 frontier-curated anti-loss union-merge → Phase 4 bidirectional eval guardrail + keep/revert → Phase 5 apply-on-keep. A mandatory-frontier failure ABORTS; an advisory failure is recorded + skipped (`state: skipped`, never blocks).

### A3. On the completion notification, continue to A4 — do not poll

Under the PRIMARY path the orchestrator drives each phase and reads each `result.json` between phases; under the FALLBACK path you wait for the harness to report the runner exited, then read its result JSON. Either way, proceed to A4 on completion. Until then, keep working on other steps; the pinned Task panel (PRIMARY, driven by `TaskUpdate`) or the `Monitor` scrolling block (FALLBACK) is the live window in the main area, and the completion notification is the trigger — do NOT poll, and do NOT fall back to the statusline as the live view. (The same `watch-panel.js` collected renderer is the canonical multi-agent TUI shared with `/boardmeeting` — see `docs/plans/unify-multiagent-tui-2026-06-06.md`.)

### A4. Review + commit (CONTENT)

When the run completes, read its result JSON (`keep_or_revert.keep`, `applied`, `merge.anti_loss`, `merge.mandatory_coverage`, `eval`):

- **`applied: true` (keep):** review the improved `SKILL.md` diff against the quality bar (anti-loss respected, no scope loss, no private nouns, Understanding-fields contract intact). Commit path-limited in the skills repo:
  ```bash
  cd ~/Development/skills && AUDIT_LOOP=1 git commit --only -F /tmp/msg.txt -- \
    skills/<subject>/<skill>/SKILL.md skills/<subject>/<skill>/audit-state.json
  ```
- **keep=false (revert):** report why (the eval guardrail rejected the change); nothing is committed. Surface the reason; do not force a commit.

Report Phase A with the full keep/revert reason, anti-loss kept/dropped counts, mandatory coverage, and the eval delta. Never summarize away findings (`complete-reporting`).

If `--improve-only`, STOP here.

---

## Phase B — Use the improved skill ON the target

> Skip Phase A and run only this with `--apply-only` (use the skill as it currently stands).

### B1. Resolve the target

Map arg 2 to its repo root(s) via the Project Routing table in `~/Development/AGENTS.md` § Project Routing:

| Arg 2 (project or repo) | Root(s) |
|---|---|
| `Sales Hub` / `sales-hub` | `~/Development/sales-hub/` |
| `Skill Graph project` / `skill-graph` | `~/Development/skill-graph/` (+ `~/Development/skills/` for skill content) |
| `Agent Orchestration` | `~/Development/agent-orchestration/`, `~/Development/scripts/`, `~/Development/skills/`, `~/Development/.claude/` |
| `Orchestrator UI` / `orchestrator-ui` | `~/Development/orchestrator-ui/` |
| `Module Components` / `Module-Components` | `~/Development/Module-Components/` |

A bare repo name resolves to that directory. If arg 2 is unknown, STOP and ask which root.

### B2. Load the improved skill as the lens

Read the (now improved) `~/Development/skills/skills/<subject>/<skill>/SKILL.md` body. Its guidance/methodology IS the audit lens for the target. (E.g. `methodical` → audit the target for its 9 anti-patterns + completeness; `semantics` → audit naming/ubiquitous-language; `code-review` → review the diff/surface; `taxonomy-design` → audit the classification.)

### B3. Apply it to the target → complete findings report

Run the skill's methodology against the resolved root(s). Produce a report-only deliverable (per `.claude/rules/` Diagnostic Report-Only): **every** finding, severity-tagged with the canonical 5-level schema (`P0/CRITICAL … P4/INFO`) as a column, with file:line evidence, root cause, and the skill rule it maps to. End with the mandatory completeness claim: "Examined N items. This report covers all N. Items excluded: [none / list]."

Do **not** filter to "top findings", consolidate distinct findings, or drop any (`complete-reporting`). Recommend prioritization separately — the user decides what to act on.

### B4. Act only on request (`--act`)

Default is report-only. With `--act` (or after the user picks findings by number), implement the fixes in the **target's own repo**, verify, and commit there path-limited (`repo-commit-ownership`). Never mix target-repo changes with the Phase A skill commit.

---

## Flags

| Flag | Effect |
|---|---|
| `--no-advisory` | Phase A runs the certifying floor only (Opus 4.8 + GPT-5.5), no advisory CLIs. Faster. |
| `--max-rounds N` | Phase A cross-review convergence budget (default 2). |
| `--improve-only` | Phase A only — run the loop + commit the skill; skip applying it to a target. |
| `--apply-only` | Phase B only — use the skill as-is on the target; skip the improve phase. |
| `--act` | Phase B may make + commit changes in the target repo (default: report-only). |

## Output contract

1. **Phase A:** keep/revert verdict + reason, anti-loss (kept/dropped), mandatory coverage, eval delta, commit SHA (or "reverted — not committed").
2. **Phase B:** complete severity-tagged findings report with file:line evidence + completeness claim.
3. State the mode of each commit (CONTENT skill commit in `~/Development/skills`; any `--act` change in the target repo) so the SYSTEM/CONTENT boundary is auditable.

## Related

- Canonical loop runner: `skill-graph/lib/audit/run-skill-audit-loop.js` (`--help` for all flags).
- TUI viewer: `skill-graph/scripts/watch-panel.js`.
- Per-skill audit contract: `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 3.
- Autonomous batch sibling (drains the whole worklist): `.opencode/commands/skill-audit-loop.md`.
- Skill Audit Loop philosophy: `skill-graph/docs/skill-audit-loop-philosophy.md`.
