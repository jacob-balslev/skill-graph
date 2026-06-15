---
description: Multi-model skill audit with union-curate merge — claim one skill, audit (any model) or merge (frontier curator — the strongest-reasoning-grader role (Opus) / codex-current (GPT)), keeping the union of all valuable work.
version: 1.0.0
since: 2026-05-21
status: active
superseded_by: null
last_changed: 2026-06-14
---

# /audit:merge

Run the multi-model skill-audit loop. Several agents (across Claude, Codex, OpenCode; any model) each claim one public-safe skill at a time, audit it into a per-model **proposal**, then a curator (the strongest-reasoning-grader role (Opus) / codex-current (GPT)) **union-merges** the current skill + every model's proposal — keeping all valuable work, dropping nothing valuable without a recorded reason.

**Workflow context:** read
[`skill-audit-loop/WORKFLOW_CONTRACT.md`](../../../skill-graph/skill-audit-loop/WORKFLOW_CONTRACT.md)
and inspect
[`audits/workflow-conformance/spec.yaml`](../../../skill-graph/audits/workflow-conformance/spec.yaml)
before curating. The relevant metric is Merge Quality: every contributor item
is kept, rejected, superseded, or deferred with evidence in the ledger.

**Command surface:** the `scripts/skill/*` snippets below are
workspace-orchestration helpers. Run them from `~/Development`, where those
scripts exist. Standalone npm consumers should use `skill-graph audit`,
`skill-graph evaluate`, and local proposal files instead of the shared
workspace claim/ledger helpers.

**Follow the portable procedure verbatim:** `skill-graph/audits/merge-protocol.md` (project-owned per ADR-0016 surface #2; relocated 2026-05-25 from `.opencode/commands/skill-audit-merge-v1.md`)
**Design/protocol:** `skill-graph/docs/skill-audit-multimodel-merge.md`
**Per-skill audit contract (referenced by the procedure):** [`skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md` § Part 3 — Per-Skill Audit Runbook](../../../skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook) (consolidated 2026-05-25; the historical standalone `skill-graph/audits/per-skill-contract.md` was absorbed into Part 3 of the audit loop doc).

Key commands:
```bash
node scripts/skill/skill-audit-claim.js next                       # next public-safe unclaimed skill (skips Sales Hub/personal/customer)
node scripts/skill/skill-audit-claim.js claim <slug>               # atomic; one skill per agent
node scripts/skill/skill-audit-claim.js claim <slug> --model opus  # AUDIT: your model's proposal slot
node scripts/skill/skill-audit-claim.js claim <slug> --merge       # MERGE: curator
node scripts/skill/skill-audit-claim.js contributions <slug>       # which models have proposed
```

Set `$ARGUMENTS` as `audit` (default) or `merge` to pick your mode. Default model slug comes from the `MODEL` env var.
