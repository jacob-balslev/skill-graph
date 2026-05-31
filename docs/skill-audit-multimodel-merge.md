# Multi-Model Skill Audit — Fan-out + Union-Curate Merge

> Type: Reference (protocol)
> Status: v1 (2026-05-21). Extends the single-agent loop (`skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook`) to many models without losing any valuable contribution.

## Why this exists

We want several agents — across **OpenCode, Codex, and Claude**, running **Opus 4.7, GPT-5.5, Sonnet 4.6, Gemini 3.1 Pro, and others** — each auditing skills, one at a time. Two requirements drove this design:

1. **No double-claims.** Two agents must never work the same skill.
2. **No lost knowledge.** When Opus, GPT-5.5, and Gemini each audit the *same* skill, we keep the union of everything valuable from all of them **plus the skill's current content** — never winner-take-all, never silent drops.

## Roles

| Role | Who | Does |
|---|---|---|
| **Auditor** | any model, any CLI | Runs the v2.2 audit on one claimed skill and writes a **proposal** (does NOT commit to the canonical `SKILL.md`). |
| **Curator** | Opus 4.7 or GPT-5.4 (the grader-authorized models) | Reads the **current skill** + every auditor's proposal, produces the **union-merged** upgrade, verifies, commits. |

## Claim model — one skill per agent, atomic, cross-CLI

Use `scripts/skill/skill-audit-claim.js` (atomic `fs.linkSync` lock in the shared `.claude/agent-memory/`, identical primitive to `linear-cli.js`). It replaces the static A/B/C batch partition.

- `next` — returns the highest-priority **public-safe** unclaimed skill. It **skips Sales Hub, personal, and customer-data skills** (the [[skill-graph-private-content-boundary]] rule): repoScope must be `shared`, not sales-hub-bound, not on the private denylist.
- `claim <slug>` — atomic. **One skill per agent**: the helper refuses a second skill while you still hold one. Finish and `release` (or commit through the curator) before claiming the next.
- `claim <slug> --model <m>` — opens a per-model audit slot *on the skill you already hold* (lets N models contribute to the same skill).
- `claim <slug> --merge` — the curator's merge lock.
- `list` / `reap` / `release` / `contributions <slug>` — inspect, reap stale (adaptive TTL by model tier), release (owner-only), and list which models have submitted proposals.

Because the lock dir is the shared repo-root `.claude/agent-memory/`, the atomic guarantee holds across every CLI on the same filesystem: the second agent to race for a key loses deterministically.

## Phases

```
claim → [per-model audit ×N → proposal] → union-curate merge → verify (keep-or-revert) → commit → advance
```

### Phase A — Per-model audit (auditor; one model)
Run the full **v2.2 contract** (deep catalog, test runner, read, audit-as-contract, concept card, comprehension evals, fix-drift reasoning, external research). The only change: **write a proposal, do not commit the canonical files.** Emit per-model artifacts:

```
.opencode/progress/skill-audits/<slug>.<model>.catalog.json
.opencode/progress/skill-audits/<slug>.<model>.research.md
.opencode/progress/skill-audits/<slug>.<model>.findings.md
.opencode/progress/skill-audits/<slug>.<model>.proposed-SKILL.md         # full proposed SKILL.md
.opencode/progress/skill-audits/<slug>.<model>.proposed-comprehension.json
.opencode/progress/skill-audits/<slug>.<model>.scorecard.md
```

`<model>` is the model slug (`opus`, `gpt-5.5`, `gemini-3.1-pro`, `sonnet`, …). Proposals are **never deleted** — they are the durable record of each model's research.

### Phase B — Union-curate merge (curator; Opus or GPT-5.4)
The curator claims `--merge` and produces the final upgrade. **The merge baseline is the CURRENT `SKILL.md`** — read it first; existing valuable content is preserved unless a proposal proves it wrong with repo evidence.

Merge rule (the anti-loss guarantee):
1. Start from the current `SKILL.md` + evals.
2. For every proposal, fold in each valuable contribution (a fixed claim, a sharper boundary, a better example, a missing edge case, a stronger eval). **Union, not selection.**
3. Resolve conflicts by keeping the contribution with the strongest repo/vendor evidence; record the decision.
4. **Reject nothing valuable silently.** Anything not merged MUST be recorded in the merge ledger with a reason (`duplicate-of <model>`, `contradicted-by <evidence>`, `out-of-scope`). A reviewer can audit every drop.

Write the merge ledger:
```
.opencode/progress/skill-audits/<slug>.merge-ledger.md
```
listing, per contribution: source model → kept / merged-into-existing / rejected(reason) → evidence.

### Phase C — Verify & keep-or-revert
Run the v2.2 verify checklist + the dual-run comprehension grader on the **merged** result. The merged skill must not regress `eval_score` below the current skill's score (keep-or-revert). Then commit **one skill per commit** (path-limited, `git commit --only`), staging the canonical `SKILL.md`/evals + the merge ledger + the retained per-model proposals + regenerated census outputs.

### Phase D — Advance
`release` the skill (and any `--model`/`--merge` sub-locks), update the worklist, pick the next via `next`.

## Invariants
- One skill per agent at a time (enforced by the claim helper).
- Auditors propose; only the curator commits the canonical skill.
- Every per-model proposal is retained; every non-merged contribution has a recorded reason.
- `next` never returns a Sales Hub / personal / customer-data skill.
- The merge always reads and preserves the current skill state as the baseline.

## Related
- Single-agent contract: `skill-graph/skill-audit-loop/SKILL_AUDIT_LOOP.md#part-3--per-skill-audit-runbook`
- Runnable prompt (this protocol): `.opencode/commands/skill-audit-merge-v1.md`
- Audit doctrine + grader policy: `skill-audit-loop/SKILL_AUDIT_LOOP.md`
- Claim helper: `scripts/skill/skill-audit-claim.js`
