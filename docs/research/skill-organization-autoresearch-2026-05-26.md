# Skill Organization Autoresearch — 2026-05-26

> Transient research notes from the Karpathy-style auto-improve loop applied
> to the 153-skill corpus on 2026-05-26. The substantive findings have been
> upstreamed into canonical docs (see § Where the findings landed below);
> this file captures the session-specific reasoning, the open questions,
> and the unfinished work for the next session to pick up.
>
> Companion plan: [`docs/plans/skill-organization-karpathy-loop-2026-05-26.md`](../../../docs/plans/skill-organization-karpathy-loop-2026-05-26.md) (workspace `docs/plans/PLANS.md` index).

---

## Session goal

Apply a Karpathy keep-or-revert loop to skill **organization, semantics,
taxonomy, routing, and relations** across all 153 active skills. Start from a
ChatGPT-proposed 6-dimension scorecard and adapt it after researching the
actual repo state + external SOTA (2026 literature) before any file was
touched.

## Method

1. **Research first.** Three parallel Explore agents mapped the existing
   infrastructure; one web-research agent surveyed 2026 SOTA for LLM agent
   skill organization (SkillRouter arxiv 2603.22455, SkillReducer arxiv
   2603.29919, Anthropic Agent Skills best-practices 2026, Karpathy
   autoresearch repo, Shopify ThemeRunner overfit incident, claude-code
   issues #40121/#44780). 60% of the ChatGPT-proposed scorecard turned out
   to already exist in the repo (`skill-graph-routing-eval.js`,
   `skill-overlap.js`, `check-protocol-consistency.js`,
   `skill-graph-drift.js`); 40% was missing and required new scripts.
2. **Anti-overfit guards established BEFORE editing any skill** per the
   Shopify ThemeRunner rule ("define the metric before the agent touches a
   file; verify the metric cannot be gamed"). Frozen anchor:
   `evals/retrieval-baseline-frozen-2026-05-26.json` (64 queries, same as
   `v2.json` at that date).
3. **Three new scripts shipped** to fill the gaps:
   - `scripts/check-description-density.js` — claude-code #40121 250-char cap
   - `scripts/check-triggerability.js` — SkillReducer binary pre-gate
   - `scripts/check-subject-operation.js` — ADR-0017 v8 5-axis sanity check
4. **Phase 1 baseline** measured BEFORE any skill edit, captured at
   [`audits/skill-organization-baseline-2026-05-26.md`](../../audits/skill-organization-baseline-2026-05-26.md)
   with per-script JSON outputs at `audits/baseline-2026-05-26/`.
5. **Phase 2 description sweep (codemod-driven)** applied via
   `scripts/reorder-description-codemod.js` — a deterministic re-orderer
   that moves "Use when" and "Do NOT use" sentences to the front of each
   description without removing content. Per `.claude/rules/
   cost-aware-delegation.md`, deterministic batch work goes to a script,
   not a model.
6. **Per-skill keep-or-revert** caught 3 regressions (`compression`,
   `methodology`, `prioritization` — codemod gained disambiguation
   visibility but lost keyword-in-window credits). Reverted those 3 to
   pre-sweep state per Karpathy discipline.

## What changed (numerically)

### Mean density score (0-100 composite)

| Stage | Mean | Delta |
|---|---|---|
| Phase 1 baseline | 31.7 | — |
| Phase 2a post-codemod | 42.0 | +10.3 (+33% relative) |
| Phase 2a post-3-revert | 42.0 | (3 reverts moved corpus mean < 0.1pp) |

### Per-skill outcomes (Phase 2a)

| Outcome | Count |
|---|---|
| Improved | 51 |
| Same (already OK or untouched) | 99 |
| Regressed → reverted | 3 |
| Unhandleable (Phase 2b LLM rewrite needed) | 5 |

### Negative-boundary visibility (the largest baseline failure mode)

| Stage | Skills missing "Do NOT use" in first 250 chars |
|---|---|
| Phase 1 baseline | 117 / 153 (76%) |
| Phase 2a post-codemod | 66 / 153 (43%) |
| Improvement | -51 skills (76% → 43%) |

### Frozen-baseline routing precision (anti-overfit check)

| Stage | R@1 | R@3 |
|---|---|---|
| 2026-05-24 documented baseline (pre-v8 corpus) | 96.9% (62/64) | 100.0% (64/64) |
| 2026-05-26 pre-Phase-2a (frozen anchor measurement) | 78.13% (50/64) | 89.06% (57/64) |
| 2026-05-26 post-Phase-2a sweep | **81.25%** (52/64) | 89.06% (57/64) |

Phase 2a delta: **+3.13pp R@1, +0.00pp R@3**. Gate PASS (R@1 may not drop > 0.5pp; instead it improved). Reconciliation of the 96.9% → 78.13% drop between 2026-05-24 and 2026-05-26 pre-sweep is an open finding (see § Open findings below).

## What did NOT change

- No SKILL.md body content removed. Total description length preserved per
  skill (sentence reorder only).
- No frontmatter axes touched beyond `description`. `subject`, `operation`,
  `scope`, `keywords`, `relations`, Health Block fields all unchanged.
- No `routing_eval: present` flips. Coverage remains 10/155.
- `application_verdict: UNVERIFIED` remains on every skill (Phase 2 of this
  loop was not gate-9 work; that's the Behavior Gate's separate L0→L1 lift
  documented in `SKILL_AUDIT_LOOP.md § Current maturity`).

## Findings to upstream-investigate (Phase 4 follow-ups)

### F1. 5 skills need LLM-authored description rewrites (Phase 2b)

The codemod found these skills lack one or both disambiguation phrases
anywhere in the description, so reorder cannot help. Each needs new prose:

| Skill | Reason |
|---|---|
| `cron-scheduling` | no Use-when AND no Do-NOT-use anywhere |
| `intent-recognition` | no Use-when sentence anywhere |
| `mobile-responsive-ux` | no Use-when AND no Do-NOT-use anywhere |
| `vercel-composition-patterns` | no Use-when sentence anywhere |
| `best-practice` | no Use-when sentence anywhere |

Phase 2b execution: for each, read the SKILL.md body, infer a Use-when /
Do-NOT-use pair from the body's actual scope, write into the first 250 chars
of `description:`, re-score with `node scripts/check-description-density.js
--skill <name>`, keep if `density_score ≥ 50`. One commit per skill in the
skills repo.

### F2. 60 skills are improvable but the codemod's first-pass reorder didn't fully fix them

Post-sweep, 66 skills still miss "Do NOT use" in the first 250 chars (down
from 117). The codemod can't help further — its constraint is that BOTH
phrases exist somewhere. The remaining 60 likely have the disambiguation
phrase past 250 but the sentence containing it is too long to fit in the
window OR is followed by too much filler before the next sentence. These
need light prose rewriting — the kind of edit the Karpathy LLM-loop is
designed for, just at the per-skill granularity.

Per-skill list: re-run `node scripts/check-description-density.js --json |
node -e '...skills where !signals.negative_boundary_in_window...'` to
generate the worklist.

### F3. 51 of 153 skills (33%) have an `operation` claim that doesn't match the body's strongest linguistic signal

Per `check-subject-operation.js` — declared `operation` is "know" but the
body's strongest marker is "do" (or vice versa). The codemod for ADR-0017's
v7→v8 migration default-mapped ambiguous `type: capability` skills to
`know`, but body content suggests `decide` for a substantial fraction. The
discriminating axis collapsed during migration.

Investigation: open the JSON output at `audits/baseline-2026-05-26/
subject-operation.json` and filter for `operation_claim_supported === false`.
For each, decide whether to relabel `operation` or rebalance body content.
This is gate-1 (Integrity) work, not gate-9 (Behavior).

### F4. 3 skills have no `subject` and no `operation` at all

`first-principles-thinking`, `inversion`, `second-order-thinking` — all
under `skills/meta-methods/`. Authored without v8 axes. Will fail v7-sunset
schema lint when it lands. Migration needed before Phase 2b touches them.

### F5. 17 skills cannot be triggerability-scored because they lack `activation.examples`

Per SkillReducer arxiv 2603.29919: skills without authored positive examples
cannot be measured for triggerability. The corpus has 17 such skills.
Authoring 3 examples each (~5-10 minutes per skill) would close the gap and
move 17 from `UNKNOWN` to `PASS/FAIL`.

### F6. Documented routing baseline (96.9% R@1) doesn't match today's measurement (78.13% pre-sweep)

Real regression between 2026-05-24 and 2026-05-26 on the same query set.
Likely contributors: v8 axis migration shifting tiebreaker outcomes,
intervening skill-overlap edits, or the 2026-05-24 number being inflated.
Standalone investigation — NOT a Phase 2 concern. Do not cite the 96.9%
number in any external doc until reconciled. ROUTING-METRICS.md updated
with the recent series; the open reconciliation is a Phase 4 follow-up.

### F7. The reorder codemod itself has a known limitation

`scripts/reorder-description-codemod.js` scores at corpus level, not
per-skill. The 3 regressions (compression, methodology, prioritization)
slipped through because the corpus mean improved while their individual
scores dropped. The fix is to extend the codemod with pre-and-post scoring
per skill and an internal revert when any individual skill regresses.
Tracked as an in-tool fix; documented in `SKILL_AUDIT_LOOP.md § Anti-overfit
guards`.

## Where the findings landed

| Finding | Canonical doc updated |
|---|---|
| 250-char silent cap as a binding contract | [`SKILL_METADATA_PROTOCOL.md`](../../SKILL_METADATA_PROTOCOL.md) § Identity → `description` |
| Anti-overfit guards for corpus-touching loops | [`SKILL_AUDIT_LOOP.md`](../../SKILL_AUDIT_LOOP.md) § Audit Doctrine → "Anti-overfit guards" |
| Routing baseline recent series + reconciliation note | [`docs/ROUTING-METRICS.md`](../ROUTING-METRICS.md) § Baseline Results |
| Three new validation scripts wired into npm | [`AGENTS.md`](../../AGENTS.md) § Validation Commands + `package.json` scripts |
| Operation distribution mismatch (51 skills) | already documented in [`docs/adr/0017-five-axis-classification-model.md`](../adr/0017-five-axis-classification-model.md) § Consequences — no new ADR needed |
| Per-skill outcomes + commit log | this file + git history (`improve(skill):` and `improve(corpus):` commits) |

## Plan-traceable execution log

- [Plan](../../../docs/plans/skill-organization-karpathy-loop-2026-05-26.md) Phase 1: complete (commit `2985b88` in skill-graph)
- Plan Phase 2: pilot `methodical` (commit `7ba44d9` in skills), then codemod sweep (`52c546e`), then 3-skill revert (`02e137f`)
- Plan Phase 3: complete (post-sweep snapshot at `audits/post-phase2a-2026-05-26/`; 51 improved / 99 same / 0 net-regressed)
- Plan Phase 4: this commit (canonical doc updates)
- **Phase 2b (LLM rewrites)**: NOT yet executed — handed off as F1/F2 above.

## Next-session prompt skeleton

If picking up Phase 2b, the self-contained prompt is:

> Read `docs/plans/skill-organization-karpathy-loop-2026-05-26.md` (active plan)
> and `skill-graph/docs/research/skill-organization-autoresearch-2026-05-26.md`
> (this file). Execute Phase 2b: LLM-authored description rewrites for the 5
> unhandleable skills (F1) and the ~60 partial-improvement skills (F2). Each
> rewrite: read the SKILL.md body to infer scope, author a Use-when/Do-NOT-use
> pair in the first 250 chars of `description:`, re-score with
> `node scripts/check-description-density.js --skill <name>`, KEEP if
> `density_score ≥ 50`, REVERT otherwise. One commit per skill in the skills
> repo (`improve(skill): <name> description — Phase 2b LLM rewrite`).
> Anti-overfit guards in `SKILL_AUDIT_LOOP.md § Audit Doctrine` apply.
