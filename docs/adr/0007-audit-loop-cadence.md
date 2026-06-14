# ADR-0007: Audit Loop Cadence

**Status:** Accepted  
**Date:** 2026-05-18  
**Task:** SH-6107

> **Amendment (2026-06-14) — placement, invocation, and findings-tracking superseded.** Three operational details below are out of date: (1) `last_audited` and the four Audit Status verdicts moved from `SKILL.md` frontmatter to the `audit-state.json` sidecar per [ADR-0019](0019-audit-state-sidecar-separation.md) — the "Health Block field in `SKILL.md` frontmatter" wording is historical. (2) The canonical invocation is now `node bin/skill-graph.js audit <skill>` (the `scripts/skill-audit.js` path still resolves but is internal); run artifacts live under the run-root relocated by [ADR-0016](0016-operational-data-ownership.md). (3) Per-skill findings are no longer tracked as Linear sub-issues — they drain the file-based worklist + run ledger (Skill Graph Linear moved to org `SKI` on 2026-06-03; Linear now holds SYSTEM tasks only). The cadence decision itself stands.

## Context

The skill-graph tooling repo and its sibling `skills` library repo need a formal cadence for running the Skill Audit Loop. Without a documented cadence, audits happen ad-hoc, P2+ findings accumulate without tracking, and there is no shared understanding of what "audited" means for a skill.

The Skill Audit Loop specification (`SKILL_AUDIT_LOOP.md`) already defines the four operations (`audit`, `improve`, `evaluate`, `evolve`) and a generic cadence table. This ADR adds the concrete operational contract for this project:

- Who triggers audits
- What the pass criteria are
- Where findings go
- How P2+ findings are resolved before a task closes

## Decision

### Trigger

| Event | Action |
|---|---|
| Per skill edit (SKILL.md changes) | `node scripts/skill-lint.js <skill-path>` must pass as part of PR/commit gate |
| Event-driven, **not** weekly (amended 2026-05-27 per audit M11) | `node scripts/skill-graph-routing-eval.js` runs (a) inside `npm run verify` on every PR/commit, (b) on any major SYSTEM-side change that could affect routing (e.g., the 2026-05-25 multi-model restructure review, the 2026-05-19 lint reduction). The 2026-05-25/26 audit cluster was the correct cadence for the work that drove it, not a deviation from a weekly rhythm. |
| Before any stability promotion | Full `audit` for all skills in the promotion batch |
| Per Linear task that touches a skill | Audit the affected skill before marking the task Done |

**Cadence amendment 2026-05-27 (audit M11).** This ADR originally named a weekly rhythm. The actual practice — verified by surveying `docs/research/`: three audits on 2026-05-25 (Opus) and 2026-05-26 (Codex × 2), all triggered by the multi-model restructure review — is event-driven. Rather than retrofitting a weekly cron, this ADR is amended to accept the event-driven shape, because: (1) the verify-chain routing-eval already runs on every commit, which catches per-skill regressions inside the commit boundary, not at end-of-week; (2) a weekly cron would add work without adding signal, since most weeks have no skill-graph SYSTEM change worth re-routing; (3) the multi-model audit pattern of 2026-05-25/26 is the right shape for major restructures and should be repeated when the next one lands, not pre-scheduled. If a future operational gap shows that the event-driven shape misses skills that need re-routing review, file a new ADR that re-introduces a scheduled cron.

### Owner

The orchestrator is responsible for triggering audits. For manual sessions, the agent working a skill-touching task is responsible for running the audit and triaging findings before closing the task.

### Audit invocation

Run from the `skill-graph` tooling repo with the skill's absolute path:

```bash
# Deterministic lint (always run first)
node scripts/skill-lint.js /path/to/skills/skills/<skill-name>

# Routing eval (run when skill has routing_eval: present)
node scripts/skill-graph-routing-eval.js --skill <skill-name>

# Full stub audit (generates findings.md, verdict.md, scorecard.md)
SKILL_GRAPH_WORKSPACE=/path/to/skills node scripts/skill-audit.js <skill-name> \
  --audit-root audits/

# Note: skill-audit.js cross-repo path resolution is a known limitation (tracked separately).
# Until fixed, run skill-lint.js with an absolute path for authoritative results.
```

### Findings flow

```
audit run
  → findings.md + verdict.md + scorecard.md written to audits/<skill-name>/
  → P0/P1 findings: block task, fix immediately before closing
  → P2 findings: create Linear sub-issue with parent = current task, resolve before closing
  → P3/P4 findings: document in Linear completion comment, defer or fix opportunistically
```

### Pass criteria

A skill audit passes when:

1. `node scripts/skill-lint.js <skill-path>` exits 0 (from skill-graph workspace with absolute path)
2. `node scripts/skill-graph-routing-eval.js --skill <skill-name>` shows 100% pass rate (when `routing_eval: present`)
3. No P0 or P1 findings in `audits/<skill-name>/findings.md`
4. All P2 findings have a linked Linear sub-issue

A task is **not closed** until all P2+ findings are either resolved or have a tracking sub-issue.

### Proof-audit format

The first run of the audit loop against a skill must produce all three artifacts:

```
audits/<skill-name>/
  findings.md   — required
  verdict.md    — required
  scorecard.md  — required for first audit; optional for re-audits
```

Subsequent audits may update findings.md and verdict.md in-place. The `last_audited` Health Block field in `SKILL.md` frontmatter is updated to today's ISO date after each audit.

## Alternatives Considered

**Integrate into CI gate:** Running the full audit as a CI gate was considered but rejected — the graded pass (LLM-powered) is too slow and expensive for every commit. The deterministic lint gate is the CI gate; the full audit is a periodic process.

**Store findings in Linear only:** Rejected — audit artifacts in `audits/` provide an append-only local evidence trail that survives Linear data issues and is grep-able during grind sessions.

**Weekly only:** Rejected — the per-task trigger is needed so that skills don't drift between the time a task modifies a skill and the next scheduled audit.

## Consequences

- The `audits/<skill-name>/` directory is now the canonical location for skill audit evidence in the `skill-graph` repo.
- Agents working on skills must run the audit and triage findings before closing their Linear task.
- P2 findings generate Linear sub-issues automatically; P3/P4 go in the completion comment.
- The `skill-audit.js` cross-repo resolution bug (SH-6107 sub-issue) needs fixing before automated batch audits work reliably.
