---
name: evolve
description: "Walk the corpus. For each skill in priority order (application_verdict first, then last_audited staleness — see SKILL_AUDIT_LOOP.md § Loop Principles), run audit → improve (when needed) → evaluate. Replaces the old skill-evolution alias."
argument-hint: "[--top N] [--continuous] [--scope all] [--failure-budget N] [--pilot <skill>]"
version: 1.0.0
since: 2026-05-17
status: active
superseded_by: null
last_changed: 2026-05-23
---

# /evolve — Walk the corpus, one skill at a time

Run the corpus walker over the Skill Audit Loop. For each skill, in priority order: `/audit`, then `/improve` if a field is stale or failing, then `/evaluate`. Audit/eval/provenance fields are written back to the skill's sibling `audit-state.json` sidecar. The walker advances when each per-skill cycle completes.

> **Preview maturity.** `evolve` is still a preview corpus walker. Use it with an explicit small scope first (`--top N` or `--pilot <skill>`) and verify each per-skill result before widening the run.

> **Audit Doctrine — link only.** The canonical doctrine is `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Audit Doctrine. It evaluates each skill on three axes (intent fidelity, teaching efficacy, upstream currency) and `application_verdict` is the real quality signal. Lint is a floor, never the goal. Do not restate the doctrine here — link to it.

## Priority order

Walker priority is owned by `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md § Loop Principles` (`application_verdict` first, then `last_audited` ascending for ties; failing verdicts jump to top). Do not restate the ordering here — read it from the canonical so a single change in the canonical updates every runtime resolver. No telemetry crawl: the `audit-state.json` Audit Status is the priority signal.

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
audit(skill)                                  # writes last_audited plus structural/truth/comprehension/application verdicts
if structural_verdict in {FAIL, PASS_WITH_FIXES} or truth_verdict in {DRIFT, BROKEN}:
  field = pick_stalest_or_failing_field(skill)
  improve(skill, field=field)                 # one commit, time-boxed, keep-or-revert via evaluate
evaluate(skill)                                # writes application_verdict, eval_score, eval_failed_ids, freshness
advance
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
