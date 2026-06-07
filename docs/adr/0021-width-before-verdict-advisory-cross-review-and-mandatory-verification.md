# ADR-0021: Width Before Verdict — Advisory Cross-Review Made Contractual + Mandatory Verification Gate

> Status: Accepted (2026-06-07T19:20Z)
> Companion rule: `~/Development/.claude/rules/no-lesser-models-for-quality.md § "Width before verdict"` (commit `a8c02539e`)
> Implementing commit: `003dbe9` (skill-graph) — `skill-audit-loop/SKILL_AUDIT_LOOP.md` five-phase list + per-step table
> Supersedes the discretionary advisory-folding language in the 2026-06-05 multi-agent panel design.

## Context

The Skill Audit Loop's multi-agent panel (2026-06-05) runs a mandatory frontier pair
(Opus 4.8 + GPT-5.5) plus an advisory tier of free models (Gemini, MiniMax, Nemotron,
Big Pickle, DeepSeek, MiMo, Gemini-Flash). The user's goal for the panel is **maximum
width AND maximum quality**: the free/advisory agents should also do their own
independent research and evaluate the other agents' work, while frontier Opus + GPT
hold the final verdict and verify all claims.

A 2026-06-07 read-only research pass over the panel canon
(`no-lesser-models-for-quality.md`, `SKILL_AUDIT_LOOP.md`,
`docs/skill-audit-loop-philosophy.md`, `boardmeeting.md` + its skill-graph profile,
`docs/verdict-semantics.md`) found that **most of the goal was already built**:

- **Phase 1** — every agent (frontier + advisory) does its OWN research (repo + web,
  tools on); width comes from many independent searches.
- **Phase 2** — every agent cross-reviews every other agent's proposal and revises.
- **Phase 4** — bidirectional eval (Opus⇄GPT); advisory NEVER sets the verdict.
- **Anti-loss** (`validateAntiLoss`) refuses any merge that drops a contribution for an
  "unscored / didn't move the score" reason — no silent drops.

Three genuine gaps remained:

1. **Advisory cross-review was recorded but only DISCRETIONARILY weighted.** Phase 3
   said the curator "MAY fold in advisory content + cross-review feedback *where it adds
   value*." "Where it adds value" was never defined — so an advisory finding that was
   true but not raised by the mandatory pair could be silently invisible to the curator.
2. **No explicit mandatory-tier verification of the merge before eval.** The merged
   skill was loaded and eval'd without the two frontier proposers confirming it
   represented their contribution or that surfaced claims were verified — a "silent
   rewrite" risk, and "advisory becomes load-bearing only after a quality voice
   confirms it" was a soft synthesis rule, not an enumerated reproduce-the-evidence step.
3. **Advisory eval (`--advisory`) was off-by-default and under-documented**, so its
   breadth-only, never-decides role was easy to misread.

## Decision

Codify **"Width before verdict"** — width and quality are **sequential gates, never in
tension**: every voice is heard (width), then the frontier verifies before anything is
load-bearing (quality).

**Width (all tiers, binding):** every panel agent — mandatory frontier AND every
advisory model — does the COMPLETE independent research (byte-identical agenda, no
splitting) and cross-evaluates every other agent's work, *including the frontier's*.
Advisory critique and dissent against Opus/GPT are first-class input.

**The verify-then-decide gate (frontier only, binding):**
1. Every surfaced claim/finding (any tier) is recorded in the merge-ledger (anti-loss).
2. A frontier model VERIFIES each relied-on claim before it is load-bearing — re-run the
   command, read the `file:line`, reproduce the evidence — **bidirectionally** (Opus
   checks GPT, GPT checks Opus, both check advisory). Never load-bearing on authority.
3. Every finding is dispositioned: incorporated-with-reason / deferred-to-eval /
   rejected-with-reason. Silence is not permission to ignore.
4. Only the two mandatory frontier models cast the deciding verdict, and they must agree
   (else it caps at PROVISIONAL per `docs/verdict-semantics.md`).

**Operationalized in the panel phases** (`SKILL_AUDIT_LOOP.md`):
- **Phase 3 (curate) made contractual** — the curator MUST examine and disposition
  *every* advisory cross-review finding in the merge-ledger (incorporated/deferred/
  rejected, each with a reason). The discretion is over *whether to fold a finding in*,
  not over *whether to consider it*. An undispositioned advisory finding is a coverage gap.
- **New Phase 3.1 (mandatory verification gate)** — before eval, each mandatory frontier
  independently verifies (a) its own proposal is correctly represented / not silently
  dropped, (b) advisory dispositions are honest, (c) no relied-on claim is load-bearing
  without reproduced evidence — bidirectionally. Flagged gaps trigger a curator revision
  + re-verify (max 2 rounds). A ~2-minute pass, NOT a re-propose.
- **Phase 4 clarified** — the opt-in `--advisory` / `AUDIT_ADVISORY_PANEL=1` panel is
  breadth/novelty only (each advisory model is a measured generator graded by a frontier,
  recorded in `advisory_panel`), never feeds reconciliation, never sets a verdict.

`/boardmeeting` already implements the equivalent at project scale (byte-identical
agenda = independent width; workshop critique = peer eval; quality-weighted consensus +
mine-the-novelty-and-dissent = frontier decides) and needs no change — it is the model
the audit-loop synthesis mirrors.

## Consequences

- **Positive.** Advisory breadth is no longer discardable by silence; the frontier's
  final verdict is backed by reproduced evidence, not authority; the "silent rewrite"
  risk between curate and eval is closed; width (every model researches + adversarially
  cross-reviews everyone) and quality (two frontier models verify each claim, then
  jointly decide) are both explicit and binding.
- **Cost.** Phase 3.1 adds a verification round (≈ 1, max 2) per skill. This is the
  deliberate quality tax — the same discipline that re-verified the manifest claims and
  caught the stale-link false alarm in the 2026-06-07 board.
- **Honors** `no-lesser-models-for-quality` (the grader/decider stays top-tier; advisory
  is the measured subject, never the judge) and the anti-loss principle
  (`docs/skill-audit-loop-philosophy.md`) — the eval is a guardrail, never the optimizer.
- **Scope.** SYSTEM-only doc change; no skill content touched. The runtime already
  carries the merge-ledger + bidirectional-eval machinery this formalizes.

## See also

- `~/Development/.claude/rules/no-lesser-models-for-quality.md § "Width before verdict"`
- `docs/skill-audit-loop-philosophy.md` § "The advisory tier" (WHY advisory widens, frontier decides)
- `docs/verdict-semantics.md` (confidence-tier ordering: APPLICABLE > PROVISIONAL > UNVERIFIED)
- `skill-audit-loop/SKILL_AUDIT_LOOP.md` § "Multi-agent panel" (the five-phase + 3.1 contract)
- [ADR-0011](0011-split-audit-verdict-into-four-verdicts.md) (the four-verdict Audit Status this gate certifies)
