---
name: skill-audit-loop
description: "Run ONE skill through the multi-agent panel enrich loop (Opus 4.8 + GPT-5.5 mandatory + advisory, eval-guarded keep/revert), commit the enriched SKILL.md, then USE that enriched skill on a named project/repo and report findings. Interactive single-skill entry. NOT the autonomous batch queue-worker (.opencode/commands/skill-audit-loop.md)."
argument-hint: "<skill-name> <project-or-repo> [--no-advisory] [--max-rounds N] [--apply-only] [--enrich-only] [--act]"
version: 1.0.0
since: 2026-06-06
status: active
superseded_by: null
last_changed: 2026-06-06
---

# /skill-audit-loop — Enrich one skill, then use it on a target

**Usage:** `/skill-audit-loop "<skill>" "<project-or-repo>"`
**Example:** `/skill-audit-loop "methodical" "Skill Graph project"`

Two phases, two modes, two commits. Arg 1 = the skill to run through the Skill Audit Loop. Arg 2 = the project (e.g. `Sales Hub`, `Skill Graph project`) or repo (e.g. `sales-hub`, `orchestrator-ui`) the enriched skill is then **applied to** — i.e. the skill's methodology is run *against* that target and findings are reported. The skill stays portable in the library; the target is what it operates on.

> **This is the interactive single-skill command.** The autonomous batch queue-worker that drains the whole worklist is the OpenCode `skill-audit-loop` loop (`.opencode/commands/skill-audit-loop.md`, registered verbatim in `scripts/loop/run-loop-sweep.sh`). Same name, different runtime, different job — do not conflate them and do not gut that loop prompt.

> **Audit Doctrine — link only.** Canonical doctrine: `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Audit Doctrine. `application_verdict` is the real quality signal; lint is a floor, never the goal. The enrich philosophy (enrich-not-strip; eval is a guardrail; two frontier models curate; advisory widens search but never certifies): `skill-graph/docs/skill-audit-loop-philosophy.md`. Do not restate either here.

## Mode separation (mandatory — read `AGENTS.md` § Work Modes)

- **Phase A is CONTENT** — it enriches and commits a `SKILL.md` (+ `audit-state.json`) in `~/Development/skills` under `AUDIT_LOOP=1`, path-limited with `git commit --only`. One skill, its own commit.
- **Phase B is analysis** (report-only by default) — it reads the target project/repo and produces a findings report. With `--act`, any change to the target is committed in the **target's own repo**, never mixed with the Phase A skill commit.
- Building/editing THIS command file is **SYSTEM** work and must never ride in the same commit as a Phase A/B output.

## Private-content boundary (HARD)

Phase A enrichment research scope is the **public** skill-graph repo + skills tree + the open web — never Sales Hub / Printify / Shopify / customer / bank / personal data (memory `skill-graph-private-content-boundary`). Phase B may read a private target repo to audit it, but its findings stay in the session / Linear / the target repo — **no private noun, path, or datum may flow back into the enriched skill or any public artifact.**

---

## Phase A — Enrich the skill (panel loop, eval-guarded)

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

### A2. Run the loop AND show the multi-agent panel ABOVE the statusline

**The command RUNS the loop. Never hand the user a `!` command to paste** — the user invoked `/skill-audit-loop`; making them paste a runner command after that is the UX failure this command exists to remove (corrected 2026-06-06 per user feedback; supersedes the earlier "user runs via `!`" note).

**Step 1 — launch the runner** with the `Bash` tool (full panel = advisory ON; `--no-advisory` = Opus+GPT certifying floor only). A full skill takes ~15–25 min; the harness runs a long command as a managed task and notifies you when it exits. The runner writes a heartbeat `status.json`:

```
AUDIT_LOOP=1 node /Users/jacobbalslev/Development/skill-graph/lib/audit/run-skill-audit-loop.js \
  --skill <skill> \
  --skill-dir /Users/jacobbalslev/Development/skills/skills/<subject>/<skill> \
  --cwd /Users/jacobbalslev/Development/skill-graph --max-rounds 2 \
  --status-file /tmp/enrich-loop/<skill>.status.json
```

**Step 2 — start the statusline bridge so the multi-agent panel renders RIGHT ABOVE the bottom statusline** — the bottom-of-chat panel the user expects, NOT scrolling Monitor notifications. Run it with the Bash tool in the background (it is lightweight infra feeding the visible panel, not a hidden run):

```
node /Users/jacobbalslev/Development/scripts/agent/panel-heartbeat-to-agent-state.js \
  /tmp/enrich-loop/<skill>.status.json --poll 4 --stale 1800
```

It reads the heartbeat and writes `.claude/agent-memory/agent-state/*.json`, which `.claude/statusline.py` renders as one live line per agent **above** the bottom session line (Opus/GPT `[MANDATORY]` + advisory, each with its own phase·state); it clears the panel when the run completes. This is the documented "run the loop VISIBLY" requirement (`skill-audit-loop/SKILL_AUDIT_LOOP.md` — *"do NOT launch the runner as a blind background task with no viewer attached"*): the bridge IS the attached viewer.

*(Optional alternative — a scrolling collected block in the chat instead of the above-statusline panel: arm the `Monitor` tool on `skill-graph/scripts/watch-panel.js <status-file>`. The above-statusline panel is the default; only use the Monitor block if the user asks for the scrolling view.)*

Per `.claude/rules/no-ps-for-liveness.md`: never `ps`/`pgrep` the run, never tail the `.output` JSONL to guess progress — the **harness completion notification is the authoritative done-signal**. A STALE during slow advisory dispatch is "quiet ≠ dead" — confirm with ONE heartbeat read, never conclude death.

`run-skill-audit-loop.js`, the OFFICIAL loop: Phase 1 parallel propose (Opus 4.8 + GPT-5.5 MANDATORY + free advisory, each its own research) → Phase 2 cross-review to convergence → Phase 3 frontier-curated anti-loss union-merge → Phase 4 bidirectional eval guardrail + keep/revert → Phase 5 apply-on-keep. A mandatory-frontier failure ABORTS; an advisory failure is recorded + skipped (`state: skipped`, never blocks).

### A3. On the completion notification, continue to A4 — do not poll

When the harness reports the runner exited, read its result JSON and proceed to A4. Until then, keep working on other steps; the `Monitor` viewer is the live window and the completion notification is the trigger. (The same `watch-panel.js` collected renderer is the canonical multi-agent TUI shared with `/boardmeeting` — see `docs/plans/unify-multiagent-tui-2026-06-06.md`.)

### A4. Review + commit (CONTENT)

When the run completes, read its result JSON (`keep_or_revert.keep`, `applied`, `merge.anti_loss`, `merge.mandatory_coverage`, `eval`):

- **`applied: true` (keep):** review the enriched `SKILL.md` diff against the quality bar (anti-loss respected, no scope loss, no private nouns, Understanding-fields contract intact). Commit path-limited in the skills repo:
  ```bash
  cd ~/Development/skills && AUDIT_LOOP=1 git commit --only -F /tmp/msg.txt -- \
    skills/<subject>/<skill>/SKILL.md skills/<subject>/<skill>/audit-state.json
  ```
- **keep=false (revert):** report why (the eval guardrail rejected the enrichment); nothing is committed. Surface the reason; do not force a commit.

Report Phase A with the full keep/revert reason, anti-loss kept/dropped counts, mandatory coverage, and the eval delta. Never summarize away findings (`complete-reporting`).

If `--enrich-only`, STOP here.

---

## Phase B — Use the enriched skill ON the target

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

### B2. Load the enriched skill as the lens

Read the (now enriched) `~/Development/skills/skills/<subject>/<skill>/SKILL.md` body. Its guidance/methodology IS the audit lens for the target. (E.g. `methodical` → audit the target for its 9 anti-patterns + completeness; `semantics` → audit naming/ubiquitous-language; `code-review` → review the diff/surface; `taxonomy-design` → audit the classification.)

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
| `--enrich-only` | Phase A only — enrich + commit the skill; skip applying it to a target. |
| `--apply-only` | Phase B only — use the skill as-is on the target; skip enrichment. |
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
- Enrich philosophy: `skill-graph/docs/skill-audit-loop-philosophy.md`.
