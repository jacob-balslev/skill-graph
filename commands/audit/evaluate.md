---
name: evaluate
description: "Run the eval suite against one skill (LLM grader). Writes `eval_score`, `eval_failed_ids`, `freshness`, and the relevant behavior verdict fields to the skill's Audit Status. Read-only with respect to the SKILL.md body. Replaces the old evaluate-skill and improve-eval (which were byte-equivalent)."
argument-hint: "<skill-name> [--mode ab|matrix|comprehension] [--eval-id <id>]"
version: 1.0.0
since: 2026-05-17
status: active
superseded_by: null
last_changed: 2026-06-14
---

# /evaluate — Run the eval suite, write the score

Run the eval suite (`evals/<skill>.json` plus the optional `evals/comprehension.json`) against the targeted skill via the LLM grader. Writes the result to the Audit Status. No mutations to the SKILL.md body.

## Workflow context

Before running this command through an agent, read
[`skill-audit-loop/WORKFLOW_CONTRACT.md`](../../../skill-graph/skill-audit-loop/WORKFLOW_CONTRACT.md).
This command evaluates behavior evidence, not structural correctness. Its
metric is `comprehension_verdict` — the behavior-gate quality signal. No-lift
and ceiling outcomes are scoped evidence, not deletion instructions.

## What it writes

| Field | When |
|---|---|
| `eval_score` | always — aggregate 0.0–5.0 across all evals run |
| `eval_failed_ids` | always — list of failed case IDs, empty when clean |
| `freshness` | always — today's ISO date |
| `comprehension_verdict` | comprehension mode — gate 8 behavior-gate quality signal |
| `eval_state` | when the eval-health triple updates (`unverified` → `passing` etc.) |

## Usage

```
/evaluate <skill-name>                       # Standard eval run
/evaluate <skill-name> --mode ab             # A/B vs baseline (use after /improve to verify keep-or-revert)
/evaluate <skill-name> --mode matrix         # Run against full eval matrix
/evaluate <skill-name> --mode comprehension  # Run only the 7-dimension comprehension grader
/evaluate <skill-name> --eval-id <id>        # Re-run one specific case
```

## Codex GPT-5.5 CLI profile

When the default evaluator path is unavailable because it would route through the Claude CLI, use the canonical Skill Graph wrapper instead of hand-assembling environment variables:

```
skill-graph evaluate:gpt-5.5 --comprehension skills/<skill>/evals/comprehension.json
```

The wrapper lives in `lib/audit/evaluate-skill-codex-gpt-5.5.js`. It delegates to `lib/audit/evaluate-skill.js`, forces `--grader codex`, `--generator codex`, `--tools-on`, and `--single-model`, and pins the comprehension generator and grader env vars to `gpt-5.5`. Same-family Codex/GPT evidence is honest but provisional; it cannot earn `PASS`.

## When this fires automatically

- `/improve` calls `/evaluate` immediately after every accepted edit to enforce keep-or-revert.
- `/evolve` calls `/evaluate` at the end of each per-skill iteration.

You rarely call `/evaluate` directly except for ad-hoc A/B comparisons or re-running a specific failing case.

## Comprehension mode

When `evals/comprehension.json` exists, comprehension grading runs against the five flat Understanding fields (`mental_model`, `purpose`, `concept_boundary`, `analogy`, `misconception`) — or against the legacy `concept.*` block for pre-v6 compatibility fixtures.

The grader's seven dimensions (definition, mental model, purpose, boundary, taxonomy, analogy, application) produce the `eval_score` directly when this mode is selected.

## Do NOT use `/evaluate` for

- Auditing schema/lint/drift — use `/audit`.
- Editing fields — use `/improve`.
- Walking the corpus — use `/evolve`.
