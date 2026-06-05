---
description: Multi-model skill audit with union-curate merge — claim one skill, audit (any model) or merge (Opus/GPT-5.4 curator), keeping the union of all valuable work.
version: 1.0.0
since: 2026-05-21
status: active
superseded_by: null
last_changed: 2026-05-23
---

# /audit:merge

Run the multi-model skill-audit loop. Several agents (across Claude, Codex, OpenCode; any model) each claim one public-safe skill at a time, audit it into a per-model **proposal**, then a curator (Opus 4.7 / GPT-5.4) **union-merges** the current skill + every model's proposal — keeping all valuable work, dropping nothing valuable without a recorded reason.

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
