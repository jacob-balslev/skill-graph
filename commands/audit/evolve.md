---
name: evolve
description: "Walk the corpus. For each skill in priority order (comprehension_verdict first, then last_audited staleness — see SKILL_AUDIT_LOOP.md § Loop Principles), run the analyzer-driven Skill Audit Loop lifecycle. Replaces the old skill-evolution alias."
argument-hint: "[--top N] [--continuous] [--scope all] [--failure-budget N] [--pilot <skill>]"
version: 1.0.0
since: 2026-05-17
status: deprecated
superseded_by: skill-audit-loop
last_changed: 2026-06-14
---

> **DEPRECATED (2026-06-07T14:47+02:00).** `/evolve` (the legacy corpus walker that dispatches `run-skill-improvement-loop.js`) is superseded by the Skill Audit Loop: run one skill via `/skill-audit-loop` (the full `Read → Verify → Evaluate → Research → Improve → Use → Evaluate → Grade` lifecycle), or drain the whole corpus via `scripts/run-panel-loop.sh --worklist`. Kept for back-compat; its engine retires once no consumer remains (follow-up). Recover: `git show <sha>^:commands/audit/evolve.md`.

# /evolve — Walk the corpus, one skill at a time

Run the analyzer-driven corpus walker over the Skill Audit Loop. In priority order it analyzes, triages, executes candidate improvements, verifies, and checkpoints. Audit/eval/provenance fields are written back to the skill's sibling `audit-state.json` sidecar by the operations it composes. The walker advances when each per-skill cycle completes.

> **Workflow context:** `/evolve` is deprecated, but any agent still routed here must read
> [`skill-audit-loop/WORKFLOW_CONTRACT.md`](../../../skill-graph/skill-audit-loop/WORKFLOW_CONTRACT.md)
> and inspect [`audits/workflow-conformance/spec.yaml`](../../../skill-graph/audits/workflow-conformance/spec.yaml)
> before walking the corpus. The metric is per-skill workflow evidence, not a
> single corpus-wide behavior score.

> **Preview maturity.** `evolve` is still a preview corpus walker. Use it with an explicit small scope first (`--top N` or `--pilot <skill>`) and verify each per-skill result before widening the run.

> **Audit Doctrine — link only.** The canonical doctrine is `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Audit Doctrine. It evaluates each skill on three axes (intent fidelity, teaching efficacy, upstream currency) and `comprehension_verdict` is the behavior-gate quality signal. Lint is a floor, never the goal. Do not restate the doctrine here — link to it.

## Priority order

Walker priority is owned by `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md § Loop Principles` (`comprehension_verdict` first, then `last_audited` ascending for ties; failing verdicts jump to top). Do not restate the ordering here — read it from the canonical so a single change in the canonical updates every runtime resolver. No telemetry crawl: the `audit-state.json` Audit Status is the priority signal.

## Usage

```
/evolve --top 5                       # Walk the five highest-priority skills
/evolve --top 50 --continuous         # Keep walking until stop or failure budget hit
/evolve --scope all                   # Walk every skill in the corpus
/evolve --pilot financial-correctness # Single-skill end-to-end demo
/evolve --failure-budget 10           # Stop after 10 failed improve attempts
/evolve --analyze-only                # Show priority order without acting
```

## Per-iteration shape

```
analyze corpus state                           # comprehension_verdict first, then centrality + staleness
triage top actions                             # improve_skill / ensure_evals / fix_semantics / scaffold_skill
execute one action at a time                   # improve delegates to evaluate for keep-or-revert
verify batch                                   # no regressions, artifacts present
checkpoint                                     # resumable state + telemetry
```

## When to use

| Cadence | Command |
|---|---|
| Daily | `/evolve --top 5` |
| Weekly | `/evolve --top 30` |
| Pre-release | `/evolve --scope all` |
| Investigating one skill | `/evolve --pilot <skill>` |

## Do NOT use `/evolve` for

- Single-skill audits — use `/audit`.
- Single-field edits — use `/improve`.
- Eval suite without the walker overhead — use `/evaluate`.
- Creating new skills — use `/discover`.
