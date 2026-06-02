# Skill Audit Loop — Enrichment Philosophy (Why + How Agents Use It)

> Type: Canonical doctrine. Read this BEFORE changing anything about how the audit loop builds, evaluates, or scores skills. It exists because the design below is easy to "optimize" into its own opposite, and doing so silently destroys the thing the loop is for.
>
> Authority: this doc owns the *why*. Procedure lives in [`skill-audit-loop/SKILL_AUDIT_LOOP.md`](../skill-audit-loop/SKILL_AUDIT_LOOP.md); verdict enums in [`docs/verdict-semantics.md`](verdict-semantics.md); quality doctrine in [`docs/quality-doctrine.md`](quality-doctrine.md); model policy in [`AGENTS.md § Skill Audit Loop Model Policy`](../AGENTS.md). They link here for the rationale.

## The assignment (read this first)

**A skill is how we hand an AI agent the best possible curated knowledge for its topic — so that an agent equipped with it produces the best possible solution for tasks in that domain.**

The Skill Audit Loop exists to do two things, in this priority order:

1. **ENRICH (the objective):** continuously research and curate the strongest available knowledge for each skill's topic, and fold it into the skill — so the skill keeps getting closer to "the best solution we and the best available models can assemble for this topic."
2. **EVAL (the guardrail):** confirm the enriched skill actually helps a real, tool-enabled agent solve better, and didn't regress or turn harmful.

Everything else in this doc follows from that one sentence. If a change you are about to make makes a skill *carry less curated knowledge*, you are working against the assignment — stop and re-read.

## WHY enrich, never strip to a delta

The single most dangerous failure mode in this loop is turning the **eval into the objective function.** It looks reasonable: "measure the lift the skill provides; keep what raises the score; drop what doesn't." Applied as an optimizer, it strips every skill down to the minimal core that moves a narrow A/B metric — and throws away the curated knowledge that is the entire point.

So the rule is absolute:

- **The objective is knowledge and quality — enrich.** Each iteration folds in the best current solution for the topic, toward the *fullest, strongest* curated knowledge. This is the project's [`quality-doctrine`](quality-doctrine.md) and [`code-preservation`](../../.claude/rules/code-preservation.md) direction: *improve = enrich; organize, don't trim.*
- **The eval is a guardrail, not the optimizer.** It answers "does the enriched skill genuinely help, and did it regress or turn harmful?" — a *floor and a safety check*, never a pressure to shrink.
- **Keep-or-revert reverts genuine regressions only.** Revert an enrichment commit if the eval shows the skill became *harmful* or *measurably worse*. **Never** revert (or prune) knowledge merely because a narrow eval delta failed to credit it. "Didn't move the score" is **not** a reason to remove curated knowledge — the eval is too narrow to see all the value, and absence of measured lift is not evidence of absence of value.

> If you ever catch yourself writing "this content didn't improve the eval score, so I removed it" — that is the banned pattern. Removal requires a recorded reason that the content is *wrong, redundant, or harmful*, not that it was unscored.

## WHY two fully-tooled frontier models

We curate each skill with **two competing frontier models — Claude Opus 4.8 and GPT-5.5** (each its company's most advanced publicly-released thinking model), and we run them **fully tool-enabled and encouraged to research the repo and the web.**

- **Union of knowledge > either alone.** The two models have different training, different knowledge, different research reach, and different blind spots. Curating from the **union of what both know and can find** produces a stronger skill than one model can. This is why the pipeline is *bidirectional* and the curation step is a *union-curate merge* (anti-loss): every valuable contribution from either model is kept, or dropped only with a recorded reason. See [`audits/merge-protocol.md`](../audits/merge-protocol.md) and [`docs/skill-audit-multimodel-merge-v2.md`](skill-audit-multimodel-merge-v2.md).
- **Research IS the curation mechanism.** The agents are *supposed* to do their own research — read the repo for grounding, search the web for the current best practices, latest tools, and vendor changes (the [upstream-displacement check](../skill-audit-loop/SKILL_AUDIT_LOOP.md): has a newer release solved this topic better?). **Disabling their tools defeats the assignment** — you cannot "find the best solution using all the knowledge we can curate" while forbidding the agent to look anything up. Tools and research are ON, by design.
- **Cross-family judging is a bonus, not the primary reason.** Because the two models are from different vendors, each can independently grade the other's output without self-preference bias (a same-family judge inflates its own model's scores; see [`certification.js`](../lib/audit-shared/certification.js)). That makes the *eval guardrail* trustworthy — but the primary value of using both is **combining their knowledge**, not just unbiased grading.

### The one fence — private-content boundary (HARD)

"Research the repo and online" is scoped to the **public skill-graph repo + the skills tree + the open web.** Eval and enrichment agents must **NEVER** pull Sales Hub / Sales Channels / Printify / Shopify / personal-API / bank / customer data from the private workspace into prompts, proposals, references, or receipts. The skills library is public; private operational data must not leak into it. See memory `skill-graph-private-content-boundary`.

## WHY the generator (the measured agent) is a frontier model

When the eval measures "does this skill help," the agent that *answers the eval task* (the generator) must be a **frontier model — the same grade we actually deploy on** (Opus 4.8 / GPT-5.5), never a weaker "representative" stand-in like Sonnet.

- The skills are deployed to and used by frontier agents. A skill's value is whether it helps *that* agent. Measuring lift on a weaker model measures the wrong thing — it keeps skills that only help the weak model and discards skills that genuinely help the frontier model (the weak model can't apply them well enough to show the gain).
- The generator *reasons* to produce the answer; that requires real capability. A weak generator conflates "skill quality" with "model capability."
- The "ceiling effect" worry ("the frontier model already knows it, so no lift") is the **correct signal**, not a problem to engineer around: if a fully-resourced frontier agent already produces the best solution without the skill, the skill is *redundant for our deployment* — and enrichment's job is to keep pushing each skill to carry knowledge the agent does **not** already have or trivially find.

## HOW agents use the loop

Per skill, the cycle is **enrich → eval-guardrail → keep-or-revert**:

```
ENRICH (primary, reuse the union-curate merge protocol)
  Opus 4.8  : claim a per-model slot, research (repo + web, tools ON, privacy-scoped),
              propose the best knowledge (changeset or rewrite) + a novelty memo.
  GPT-5.5   : same, independently.
  Curator (a frontier model, rotated to differ from the convener):
              UNION both proposals + the current SKILL.md into a RICHER skill,
              anti-loss, recording every decision in the merge-ledger.

EVAL (guardrail — bidirectional, tools ON, lockstep parity)
  Run A: Opus answers the eval task   -> GPT-5.5 grades it.
  Run B: GPT-5.5 answers the same task -> Opus grades it.
  Synthesize conservatively: certify only if BOTH frontier directions agree it helps.

KEEP-OR-REVERT (guardrail only)
  Keep the enriched skill. Revert ONLY on a genuine quality/knowledge regression
  (the skill became harmful or measurably worse) — NEVER to strip unscored knowledge.
```

### The lockstep parity invariant (non-negotiable)

Both frontier models must run under **identical conditions** — the only variable is the model:

1. **Prompt lockstep.** The generator task and the grader rubric are each built once and handed to both models byte-identical. Never branch prompt content on model or provider.
2. **Permission parity = equal full tool access.** Both models get the *same* tools, the *same* repo scope, the *same* web allowance. Parity means *equal access*, not equal-zero. If the two directions did not run under matched permissions, the run is **invalid** (`parity_ok: false`) and may never certify a skill — different permissions per provider would mean you measured "who got to peek," not the model.
3. **Private-content boundary** (above) applies to every model, every direction.

### Operator commands

- Enrich + eval one skill: the bidirectional enrich orchestrator (see `lib/audit/run-bidirectional-enrich.js`) drives the per-model research/propose, the union-curate merge, and the eval guardrail.
- The four classic operations remain (`audit` / `improve` / `evaluate` / `evolve`, see [`SKILL_AUDIT_LOOP.md § Part 3`](../skill-audit-loop/SKILL_AUDIT_LOOP.md)); the two-frontier enrich is the *curate-the-best-knowledge* path, with `evaluate` as its guardrail.
- Model identity is resolved by role/alias, never dated version — `strongest-reasoning-grader` (newest Opus), `codex-current` (newest GPT via Codex). See [`AGENTS.md § Skill Audit Loop Model Policy`](../AGENTS.md).

## What this doc forbids (quick self-check before you change the loop)

- ❌ Turning the eval score into the optimization target / pruning unscored knowledge.
- ❌ Disabling the agents' tools or forbidding research "for cleaner measurement."
- ❌ Using a weaker model as the eval generator "to avoid ceiling effects."
- ❌ Letting one model grade its own output (same-family judge) and calling it certified.
- ❌ Running the two models with different tools/permissions and comparing them.
- ❌ Pulling private workspace data into eval/enrichment artifacts.

If a proposed change does any of these, it is working against the assignment. The assignment is: **the best possible curated knowledge for each topic, so the agent finds the best solution.**
