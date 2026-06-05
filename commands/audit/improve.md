---
name: improve
description: "Edit one field of a skill, one commit, time-boxed. Auto-tests after the edit and reverts the commit if `eval_score` drops. Karpathy keep-or-revert discipline. Replaces the old improve-skill, auto-improve, skill-fix."
argument-hint: "<skill-name> [--field <name>] [--mode rewrite|adapter|content-promote|design|perf|docs] [--lens <other-skill>] [--time-box 20m]"
version: 1.0.0
since: 2026-05-17
status: active
superseded_by: null
last_changed: 2026-05-23
---

# /improve — One field, one commit, keep or revert

Edit one field of a skill. One commit. Time-boxed. After the edit, `evaluate` runs automatically; if the metric drops, the commit reverts. The lesson is recorded; the field's `last_changed` stamp updates only on accept.

## What it writes

| Field | When |
|---|---|
| the chosen field | when the edit is accepted (auto-revert wipes it if rejected) |
| `last_changed` | when the edit is accepted — ISO date |

## Usage

```
/improve <skill-name>                                  # Walker mode — picks an UNDERSTANDING field automatically (empty wins; else shortest)
/improve <skill-name> --field mental_model             # Edit exactly this field
/improve <skill-name> --mode rewrite                   # Free rewrite of the targeted field (default)
/improve <skill-name> --mode adapter                   # Run an auto-improve adapter (prompt-evolution, design, perf, docs)
/improve <skill-name> --lens <other-skill>             # Apply <other-skill> as an audit lens against this skill and fix violations — was audit:skill-fix
/improve <skill-name> --time-box 20m                   # Cap the operation duration (default 20m)
```

## Karpathy discipline (non-negotiable)

1. **One field, one commit.** Multi-field changes are sequences of single-field improves.
2. **Time-boxed.** Default 20 minutes per field; configurable with `--time-box`. Beyond that, abort and re-queue.
3. **Auto-test.** `improve` calls `evaluate` immediately after the edit.
4. **Keep or revert.** If `eval_score` did not improve (or regressed below the allowed threshold), the commit reverts. The walker records the failed attempt and moves on.
5. **Stamp.** `last_changed` only updates when the edit is accepted.

## Modes

| Mode | When |
|---|---|
| `rewrite` (default) | Edit the SKILL.md content of the targeted field |
| `adapter` | Run a known auto-improve adapter (prompt evolution, design candidate discovery, perf, docs) |
| `content-promote` | Promote a finding into the skill (was the propagation path) |
| `--lens <skill>` | Apply another skill as an audit lens — fix violations the lens detects |

## Fields commonly improved

- `mental_model` (when comprehension grader flags weakness on dimension 2)
- `purpose`, `boundary`, `misconception` (other Understanding fields)
- `description` (when routing miss rate is high)
- `keywords` / `triggers` (when routing-gap report flags coverage gaps)
- `examples` / `anti_examples` (when routing_eval is `absent`)

## Do NOT use for

- Reading audit state — use `/audit`.
- Running the eval suite without editing — use `/evaluate`.
- Walking the corpus autonomously — use `/evolve`.
