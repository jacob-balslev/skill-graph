---
name: audit
description: "Audit one skill (or a scope) against live repo truth. Reads every field, runs deterministic lint/drift plus optional qualitative scorecard, and writes only Integrity-Gate fields to audit-state.json. No SKILL.md mutations. Replaces the old audit-skill, domain-audit, bidirectional-audit, deep-repo-audit, workspace-audit, skill-audit."
argument-hint: "<skill-name> [--graded] [--fix] [--source-first] [--fix-code-too] [--scope skill|cluster|repo|workspace] [--pilot 5]"
version: 1.0.0
since: 2026-05-17
status: active
superseded_by: null
last_changed: 2026-06-14
---

# /audit — Read every field, write the Integrity verdict

Audit one skill against live repo truth. No mutations to `SKILL.md`; writes the Integrity-Gate audit fingerprint to the skill's sibling `audit-state.json` sidecar. The Skill Audit Loop is the umbrella; lowercase `audit` is the report-only Verify command inside it.

## Workflow context

Before running this command through an agent, read
[`skill-audit-loop/WORKFLOW_CONTRACT.md`](../../../skill-graph/skill-audit-loop/WORKFLOW_CONTRACT.md).
It defines the metric for this command as the report-only Integrity Gate:
structural pass/fail plus truth-source status, not behavior certification. The
deterministic examples are
[`audits/gate-conformance/spec.yaml`](../../../skill-graph/audits/gate-conformance/spec.yaml)
and the agent-entrypoint examples are
[`audits/workflow-conformance/spec.yaml`](../../../skill-graph/audits/workflow-conformance/spec.yaml).

## Command surface

The `scripts/skill/*` snippets below are workspace-orchestration helpers. Run
them from `~/Development`, where those scripts exist. Standalone npm consumers
should use the bundled CLI surface instead: `skill-graph audit <skill>`,
`skill-graph status <skill>`, and `skill-graph doctor`.

## Why this audit exists

> **Audit Doctrine — link only.** The canonical doctrine is `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Audit Doctrine — Intent and Teaching, Not Arbitrary Lint. It evaluates each skill on three axes (intent fidelity, teaching efficacy, upstream currency) and `application_verdict` is the real quality signal. Lint is a floor, never the goal. Do not restate the doctrine here — link to it.

## What it writes

These fields live in `audit-state.json`; long-form evidence lives in the run directory described below.

| Field | When |
|---|---|
| `last_audited` | always — ISO date of this audit run |
| `lint_verdict` | always — `PASS` / `FAIL` (external marketplace mandates only) from the deterministic phase; rolls up into `structural_verdict` |
| `drift_status` | always — `OK` / `DRIFT` / `BROKEN` / `STALE` / etc.; rolls up into `truth_verdict` |
| `structural_verdict` | always — `PASS` / `FAIL` aggregate of `lint_verdict` (form/export-blockers only, never internal-style warnings) |
| `truth_verdict` | always — `PASS` / `DRIFT` / `BROKEN` / `UNVERIFIED` from drift vs `grounding.truth_sources` (UNVERIFIED when the skill declares no truth sources) |
| `comprehension_verdict` | never — written by `evaluate --mode comprehension`, not by `audit` |
| `application_verdict` | never — written by `evaluate --mode application`, not by `audit` |

## Usage

```
/audit <skill-name>                        # Standard single-skill audit
/audit <skill-name> --graded               # Adds qualitative scorecard grading; does not stamp behavior verdicts
/audit <skill-name> --fix                  # Deterministic Integrity-gate shape fix for stale frontmatter/sidecar shape; no LLM
/audit <skill-name> --dry-run --fix        # Preview the shape fix without writing
/audit <skill-name> --source-first         # Reads source code BEFORE the skill (prevents anchoring) — was audit:domain-audit
/audit <skill-name> --fix-code-too         # Also fix code violations the skill detects (LLM-driven) — was audit:bidirectional-audit
/audit <skill-name> --scope cluster        # Audit primary + adjacent + boundary + verify_with
/audit <skill-name> --scope repo           # Project-level audit synthesis — was audit:deep-repo-audit
/audit --scope workspace                   # 8-dimension workspace structural audit — was audit:workspace-audit
/audit --pilot 5                           # Recommended starting batch: sales-hub, page-coverage, dashboard, financial-engine, shopify-sales-hub
```

## Inner pipeline (invisible to callers)

The binding per-skill contract lives at [`skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 3 — Per-Skill Audit Runbook](../../../skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook) (consolidated 2026-05-25; the historical standalone `skill-graph/audits/per-skill-contract.md` was absorbed into Part 3 of the audit loop doc). The five-phase audit shape runs internally:

1. **Deterministic** — `skill-lint.js` (external mandates only — we do not author new internal lint rules to manufacture findings) → writes `lint_verdict` → rolls up into `structural_verdict`
   - **`--fix` (deterministic remediation framework)** — the deterministic repair catalog is currently EMPTY: the v7→v8 shape codemod (`lib/audit/migrate-frontmatter.js`) was retired to git history per `AGENTS.md § Major Version Is a Clean Cut` (it produced the interim `deployment_target` shape that v8's `public` + free-text `scope` replaced, so it could no longer emit a valid current-v8 skill). The framework stays for the next version's catalog; today remaining lint errors route to `improve`/manual. Distinct from `--fix-code-too` (LLM-driven cross-artifact code fix).
2. **Drift** — `skill-graph-drift.js` against `grounding.truth_sources` → writes `drift_status` → rolls up into `truth_verdict`
3. **Graded** (only `--graded`) — qualitative scorecard grading over metadata, activation, relation, grounding, content, eval-quality, and portability dimensions. This writes findings/verdict/scorecard artifacts only; it does not run comprehension/application eval suites.
4. **Stamp** — writes `last_audited` to today's ISO date

The single `audit_verdict` field is retired (ADR 0011). The four verdicts are independent: `structural_verdict` (form), `truth_verdict` (drift), `comprehension_verdict` (recitation, demoted), `application_verdict` (behaviour change — the real quality signal). `audit` owns the first two; `evaluate` owns the latter two. Most skills sit at `UNVERIFIED` on the behavior fields until eval artifacts are authored and run.

Users see one command. Phases are an implementation detail.

## Output

Audit Status fields are written to `audit-state.json`. Long-form evidence lands in a **dated
run directory** (one per run, never clobbered), created from the `run_id` you get when you claim:

```bash
# Set AGENT_ID (session id) + MODEL in your CLI env first (each node call is a separate process —
# shell/env vars do not persist across CLI tool calls). Claim by capability-tier lane:
node scripts/skill/skill-audit-claim.js claim <skill> --lane critical-audit --json   # creates the run dir, prints audit_run_dir
# Resolve the run dir fresh in EVERY write (no persisted env var needed):
node scripts/skill/source-truth-catalog.js --skill <skill> --out "$(node scripts/skill/skill-audit-claim.js rundir <skill>)/catalog.json"
# ... write research.md / findings.md / verdict.md / scorecard.md into the same rundir ...
node scripts/skill/skill-audit-claim.js release <skill> --status completed --structural PASS --truth OK   # records ledger + latest
```

```
skill-graph/skill-audit-loop/progress/skill-audits/<skill>/
    runs/<YYYY-MM-DD>T<HHMM>--<op>--<model>--<run-id>/
        catalog.json findings.md verdict.md scorecard.md research.md
    history.jsonl     ← one line per run (run_id, op, model, agent_id, verdicts, …)
    latest -> runs/<newest>
```

The `audit-state.json` sidecar is the state. The run dir is evidence. The `_ledger.jsonl` + `history.jsonl` are
the queryable record of who audited what, when, and how many times — `node scripts/skill/skill-audit-ledger.js summary <skill>`.
See `docs/reference/skill-audit-pipeline.md` § "Artifact Family (run-dir layout)".

## When to use which flag

| Situation | Flag |
|---|---|
| Standard health check on one skill | (none) |
| Need LLM-graded dimension scores | `--graded` |
| Skill fails lint on stale frontmatter shape (retired fields / missing `public`) | `improve`/manual (the deterministic `--fix` catalog is empty — v7→v8 codemod retired) |
| Suspect anchoring on skill text | `--source-first` |
| Cross-skill fix-up across code AND docs (LLM-driven) | `--fix-code-too` |
| Auditing a multi-skill cluster | `--scope cluster` |
| Auditing a whole project's skill coverage | `--scope repo` |
| Auditing the Development workspace structure | `--scope workspace` |
| First time running the audit on this repo | `--pilot 5` |

## Do NOT use for

- Editing a skill — use `/improve`.
- Running the eval suite — use `/evaluate`.
- Walking the corpus — use `/evolve`.
- Creating new skills from coverage gaps — use `/discover`.
- Visual screenshot feedback loops — use `/design:feedback`.
