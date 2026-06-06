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

> **Audit Doctrine — link only.** Canonical doctrine: `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Audit Doctrine. `application_verdict` is the real quality signal; lint is a floor, never the goal. The enrich philosophy (enrich-not-strip; eval is a guardrail; two frontier models curate; advisory widens search but never certifies): `skill-graph/docs/audit-loop-enrich-philosophy.md`. Do not restate either here.

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

### A2. Launch the panel enrich loop — FOREGROUND via `!`

The runner takes ~15–25 min/skill (full panel). It MUST run in the user's terminal via `!` (uncapped, streams the pinned-header TUI + `[+Ns]` logs into the conversation). Do **not** run it as a backgrounded harness `Bash` and poll it — that is the exact anti-pattern this loop removed (memory `panel-loop-runs-in-foreground-not-background`; `.claude/rules/no-ps-for-liveness.md`). The harness `Bash` 10-min cap is below a single skill's runtime, so a harness call would be killed mid-run and misread as a stall.

Hand the user this exact command (full panel = advisory ON; add `--no-advisory` for the Opus+GPT certifying floor only):

```
! cd ~/Development/skill-graph && AUDIT_LOOP=1 node lib/audit/run-panel-enrich.js \
  --skill <skill> \
  --skill-dir ~/Development/skills/skills/<subject>/<skill> \
  --cwd . --max-rounds 2 \
  --status-file /tmp/enrich-loop/<skill>.status.json
```

What it does (`run-panel-enrich.js`, the OFFICIAL loop): Phase 1 parallel propose (Opus 4.8 + GPT-5.5 MANDATORY + free advisory, each its own research) → Phase 2 cross-review to convergence → Phase 3 frontier-curated anti-loss union-merge → Phase 4 bidirectional eval guardrail + keep/revert → Phase 5 apply-on-keep. A mandatory-frontier failure ABORTS; an advisory failure is recorded + skipped.

### A3. Stream the collected TUI in-session (optional second view)

The `!` run already streams its own pinned-header TUI. If a separate **collected** multi-agent view is wanted (every agent's phase/state together), run the canonical viewer against the same status file — it is an observer with terminal states (COMPLETE / STALE), safe to run as a background Monitor:

```
! node ~/Development/skill-graph/scripts/watch-panel.js /tmp/enrich-loop/<skill>.status.json --poll 3
```

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

- Canonical loop runner: `skill-graph/lib/audit/run-panel-enrich.js` (`--help` for all flags).
- TUI viewer: `skill-graph/scripts/watch-panel.js`.
- Per-skill audit contract: `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 3.
- Autonomous batch sibling (drains the whole worklist): `.opencode/commands/skill-audit-loop.md`.
- Enrich philosophy: `skill-graph/docs/audit-loop-enrich-philosophy.md`.
