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

## The advisory tier (breadth — NEVER certifies)

The CORE of the loop is the two-frontier certifying pair above (Opus 4.8 ⇄ GPT-5.5). On top of it, an **opt-in advisory tier** widens the search: **Gemini 3.1 Pro** + the free OpenCode Zen models (**MiniMax M3, Nemotron 3 Super, Big Pickle, DeepSeek V4 Flash, MiMo V2.5**) + **Gemini 3 Flash** (`ADVISORY_MODELS` in `lib/audit-shared/model-provider.js`). Each advisory model runs as a **measured generator graded by a CORE frontier** (Opus — top-tier, cross-family), via `runAdvisoryPanel` (`lib/audit/run-bidirectional-eval.js`), enabled with `--advisory` / `AUDIT_ADVISORY_PANEL=1`.

This does **not** contradict the "generator must be frontier" rule above: that rule governs the **certifying** generator. The advisory tier asks a *different, non-certifying* question — does the skill *also* help a cheaper/other-family agent? — and is recorded separately (`advisory_panel`). **It never feeds the conservative reconciliation and never sets a verdict.** `no-lesser-models-for-quality` is honored because the GRADER is always a top-tier frontier; the advisory model is only the measured subject (measurement, not quality-judging). Certification stays with Opus 4.8 ⇄ GPT-5.5.

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
2. **Permission parity = equal full tool access for the GENERATORS.** The parity invariant binds the two *generators* (the measured agents that research + answer the eval task): both get the *same* tools, the *same* repo scope, the *same* web allowance. Parity means *equal access*, not equal-zero. If the two directions' generators did not run under matched permissions, the run is **invalid** (`parity_ok: false`) and may never certify a skill — different permissions per provider would mean you measured "who got to peek," not the model. The **graders** are a separate role: each grades a *fixed, closed evidence packet* (the prompt + the candidate response) with **tools OFF** — a judge that browses mid-grade is non-deterministic. Grader parity is "both graders closed and identical," which is the default. (Clarified 2026-06-03 per the GPT-5.5 cross-review, finding F3.)
3. **The repo-scope fence is four layers: prompt + claim-filter + in-process path guard + a kernel OS fence.** `cwd: <skill-graph>` and `repoScope: 'skill-graph + skills ONLY'` declare the *intended* public scope, but process cwd alone does not stop an agent from path-traversing to `../sales-hub` or reading a private absolute path. The boundary is enforced by (a) the prompt instruction, (b) the `skill-audit-claim` private-skill filter, (c) an in-process **path-scope guard** (`lib/audit/public-content-fence.js`, SH-6681): the enrich live deps `assertPublicScope` every artifact path, run dir, and skillDir against the public roots and REFUSE a private path before any shell-out (defense-in-depth, catches a private path the *orchestrator* resolves), and (d) the **FULL OS fence** (`lib/audit/isolated-checkout.js`, SH-6681 remainder): every spawned model CLI (claude/codex) runs under a macOS Seatbelt (`sandbox-exec`) profile that is the *policy equivalent of an isolated checkout* — from the process's view the workspace contains ONLY the public roots (skill-graph repo + skills tree + audit-artifacts run dir); every other workspace path is kernel-DENIED for read+write (EPERM), even by absolute path. This is what stops the model *process itself* from reading `../sales-hub` regardless of what it types — `claude --permission-mode bypassPermissions` has no sandbox and `codex -s workspace-write` restricts only writes, so layer (d) is what makes the boundary OS-hard. It is stronger than a physical checkout: no stale corpus copy, no disk cost, and public cross-tree refs (e.g. `skill-graph/audits/merge-protocol.md`) stay readable while the private trees vanish. Default ON when the OS supports it (`SKILL_ENRICH_OS_FENCE=0` opts out); on non-macOS it degrades to layer (c) and logs the gap. The remaining work is a **container (Docker) fence for Linux/CI** where `sandbox-exec` is absent — the only piece of SH-6681 still open. Do not describe cwd alone as a hard fence. (Clarified 2026-06-03 per GPT-5.5 review finding F5; in-process path guard added 2026-06-03; OS Seatbelt fence added 2026-06-03.)
4. **Private-content boundary** (above) applies to every model, every role, every direction.

### Operator commands

- Enrich + eval one skill: the bidirectional enrich orchestrator (`lib/audit/run-skill-audit-loop-lite.js`) drives the per-model research/propose, the union-curate merge, and the eval guardrail. Its LIVE production deps (claim → research/propose per frontier model → curate → revert) live in `lib/audit/skill-audit-loop-lite-deps.js`. Run it: `node lib/audit/run-skill-audit-loop-lite.js --skill <slug> --skill-dir <dir> --cwd <skill-graph-root>` (add `--dry-run` to exercise the whole orchestrator path offline — no LLM dispatch, no SKILL.md mutation — which is the CI-verifiable wiring path; the live pilot, without `--dry-run`, dispatches the two frontier models and writes CONTENT, so run it as a deliberate audit-loop pilot, one skill, committed separately).
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
