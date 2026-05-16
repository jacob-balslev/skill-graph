---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: reasoning
description: "Use when choosing reasoning depth, deciding whether to think deeply or act fast, calibrating model effort, or diagnosing under-thinking and over-thinking in agents. Covers deterministic-first reasoning, technique routing by task type, chain/tree/ReAct patterns, the thinking-doing balance, and two-pass audit-then-implement workflows. Do NOT use for prompt wording (use `prompt-craft`) or agent architecture (use `agent-engineering`)."
version: 1.1.0
type: capability
category: foundations
domain: foundations/cognition
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-16"
drift_check:
  last_verified: "2026-05-16"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
keywords:
  - "reasoning strategy"
  - "extended thinking"
  - "think deeper"
  - "reasoning effort"
  - "chain of thought"
  - "over-thinking"
  - "under-thinking"
  - "reasoning depth"
  - "think before acting"
triggers:
  - "reasoning-skill"
  - "thinking-skill"
relations:
  related:
    - design-thinking
    - semantic-center
  boundary:
    - prompt-craft
  verify_with:
    - evaluation
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
concept:
  definition: "Reasoning is the deliberate generation, evaluation, and selection of inferences over a problem space. Reasoning calibration is the meta-skill of matching reasoning depth to problem difficulty — engaging sustained multi-step deliberation when a problem requires it, and skipping straight to action or lookup when it does not. Drawn from dual-process accounts of cognition (Kahneman 2011, Stanovich & West 2000) and bounded-rationality theory (Simon 1955), it treats reasoning as an expensive operation that pays back only when the problem cannot be solved by cheaper means."
  mental_model: |
    Five primitives structure reasoning calibration:

    1. **System 1 vs System 2** — Kahneman's dual-process distinction. System 1 is fast, automatic, pattern-matched, low-cost; it produces an answer without conscious effort. System 2 is slow, deliberate, sequential, high-cost; it generates and checks intermediate steps. Most cognition is System 1; System 2 is engaged when the problem resists pattern-matching or when stakes warrant the deliberation cost. The calibration problem is choosing the right system for the problem.

    2. **Bounded rationality** (Simon 1955) — actual reasoners have finite time, memory, and attention. Optimal reasoning would explore the full search space; bounded reasoning *satisfices*, accepting a good-enough answer when continuing the search would cost more than the marginal improvement. Every reasoning operation has an opportunity cost: tokens spent deliberating are tokens not spent acting.

    3. **The reasoning hierarchy** — cheapest method that produces a correct answer:
       - **Lookup** — retrieve a known fact or precomputed answer.
       - **Parse / compute** — deterministic transformation (regex, hash, arithmetic).
       - **Pattern match** — recognize the problem as an instance of a class with a known solution (Klein's *recognition-primed decision*).
       - **Single-step inference** — one application of a rule.
       - **Multi-step reasoning** — sustained chain of dependent inferences.
       - **Search / planning** — branching exploration of alternatives (tree-of-thought, generate-and-test).

       Each level costs an order of magnitude more than the one above it. Skipping levels (jumping to deep reasoning when lookup would do) is the classic over-thinking failure mode.

    4. **Reasoning techniques** — named patterns for organizing System-2 thought: *chain-of-thought* (sequential explicit steps), *tree-of-thought* (branching alternatives with evaluation), *ReAct* (interleaved reasoning and action), *generate-and-test* (propose-then-critique loops), *means-ends analysis* (Newell & Simon's reduction of goal-current-state gaps). Different problem shapes route to different techniques; applying chain-of-thought to a search problem produces a confident wrong answer.

    5. **The reasoning-action balance** — every minute spent reasoning is a minute not spent acting, and every action without sufficient reasoning is a likely error. The calibration is empirical: under-reasoning shows up as wrong outputs that one more step would have caught; over-reasoning shows up as circular exploration, re-reading, and the production of analysis when action was the right move. The bias direction is task-dependent — high-stakes irreversible action warrants over-reasoning; high-volume reversible action warrants under-reasoning.

    The deep insight (Newell & Simon, Pólya): a reasoner's effectiveness is determined less by raw inferential horsepower and more by *strategy selection* — choosing the right method for the problem, and stopping when the method has produced its answer.
  purpose: |
    Reasoning is the most expensive cognitive operation available to a bounded agent — and yet most reasoning effort produces no improvement over a simpler method. The problem reasoning calibration solves is the *allocation* problem: given finite reasoning budget, which problems deserve sustained deliberation, and which should be handled by lookup, pattern-match, or a single inference?

    Without explicit calibration, two failure modes dominate. The first is *analysis paralysis* — paragraphs of deliberation produced before a one-line action, circular re-reading, multi-pass review of trivial inputs. The second is *under-reasoning* — confident snap judgments on problems that needed deliberation, missed edge cases, plausible-sounding wrong answers. The calibration discipline names both modes and provides recognition signs.

    The alternative — uniform reasoning depth — pays the cost of deep reasoning on every problem (catastrophic over-thinking) or accepts the error rate of shallow reasoning on every problem (catastrophic under-thinking). Neither is rational under bounded resources.
  boundary: |
    **Reasoning is not knowledge.** A reasoner with shallow knowledge of a domain may reason flawlessly within available premises and still produce a wrong answer because the premises were incomplete. Reasoning composes existing facts; it does not generate new domain knowledge. The fix for a knowledge gap is retrieval, not deeper reasoning.

    **Reasoning is not deliberation.** Deliberation is one mode of reasoning (System 2). Reasoning also encompasses fast pattern-matched inference (System 1). Equating reasoning with "thinking slowly" misses 90% of actual reasoning episodes.

    **Reasoning is not chain-of-thought.** Chain-of-thought is one technique within reasoning, suited to problems with sequential structure. Tree-of-thought, ReAct, generate-and-test, means-ends analysis, and analogical reasoning are all reasoning, and each fits different problem shapes. Treating chain-of-thought as the universal reasoning method is the technique-monoculture failure.

    **Reasoning is not prompt engineering.** Prompt engineering shapes the input that a reasoner consumes; it influences which reasoning pattern activates and how reliably. The reasoning *itself* happens after the prompt is parsed, in the inference process. Improving the prompt is upstream of improving the reasoning.

    **Reasoning is not always the right answer.** For deterministic problems (parse this JSON, compute this hash, look up this fact), reasoning is strictly worse than the cheap deterministic method. The calibration discipline is partly the discipline of *not* reasoning when reasoning would not help.
  taxonomy: |
    - **Deductive reasoning** (specialization) — from general rules to specific conclusions; the reasoning of classical logic. Truth-preserving when premises and rule are correct.
    - **Inductive reasoning** (specialization) — from specific observations to general patterns; the reasoning of empirical science. Truth-probable, not truth-preserving; conclusions can be falsified by new evidence.
    - **Abductive reasoning** (specialization, Peirce 1903) — inference to the best explanation; the reasoning of diagnosis. Given an observation, generate candidate causes and select the most likely.
    - **Analogical reasoning** (specialization) — mapping structure from a familiar domain to a novel one. Powerful when the structural mapping is sound; misleading when only surface similarity exists.
    - **Chain-of-thought** (downstream technique) — explicit sequential intermediate steps; suited to multi-step problems with linear dependency structure.
    - **Tree-of-thought** (downstream technique) — branching exploration with evaluation at each branch; suited to problems where multiple approaches must be compared.
    - **ReAct** (downstream technique, Yao et al. 2022) — interleaved reasoning and action; suited to problems requiring observation of external state between inferences.
    - **Means-ends analysis** (downstream technique, Newell & Simon 1972) — recursive goal decomposition; suited to planning problems.
    - **Recognition-primed decision** (alternative, Klein 1998) — System-1-dominant expert reasoning; skips deliberation when the situation matches a known pattern.
    - **Satisficing** (composition with bounded rationality, Simon 1956) — stopping rule: accept the first solution above an aspiration threshold rather than searching for the optimum.
  analogy: |
    Reasoning calibration is the cognitive equivalent of selecting the right tool for a job. A skilled carpenter doesn't reach for the table saw to drive a nail, and doesn't try to drive nails with a chisel either. The expensive tool exists for a reason; the cheap tool exists for a different reason; the discipline is recognizing which problem is in front of you.

    A second analogy: an engineer choosing an algorithm. Bubble sort is wasteful on a million-element array; quicksort is overkill on an array of three. The right answer is not "always use the more sophisticated method" — it is "match the method to the input size and structure." Reasoning calibration is the cognitive analog: match deliberation depth to problem difficulty.
  misconception: |
    The most common misconception is that **more reasoning is always better**. Deeper reasoning is *more expensive*; it is better only when the marginal correctness gain exceeds the marginal cost. For trivial problems, deeper reasoning produces the same answer (or worse — confidently wrong, with elaborate justification) at higher cost. Stanovich's research on individual differences in rationality shows that high-cognitive-effort styles produce no advantage on problems that don't require it.

    The second misconception is that **reasoning is opposite to intuition**. Klein's work on recognition-primed decision shows that expert intuition *is* reasoning — pattern-matched against thousands of cases. The dichotomy is between fast pattern-matched reasoning (which can be wrong when the pattern doesn't actually fit) and slow deliberate reasoning (which can be wrong when the deliberation premises are flawed). Both are reasoning. Both can fail.

    The third misconception is that **showing the work is the same as doing the work**. Chain-of-thought traces visible in an output can be post-hoc rationalization — the answer was generated first and the reasoning fabricated to justify it. Research on language-model reasoning (Lanham et al. 2023, Turpin et al. 2023) documents this clearly: forced chain-of-thought sometimes improves accuracy and sometimes is purely cosmetic. The visible trace is evidence of reasoning, not proof of it.

    The fourth misconception is that **deeper reasoning catches more errors**. It catches different errors. Deep deliberation can build elaborate wrong models from a single faulty premise; shallow reasoning would have stopped at the premise check. The skill is knowing which failure mode is more costly for the problem class — and adding verification steps (re-derivation, alternative path, external check) when the cost of being wrong is high.
---
# Reasoning

## Domain Context

**What is this skill?** This skill provides reasoning strategy selection for AI agents: when to think deeply vs act fast, extended thinking calibration, chain-of-thought vs tree-of-thought vs ReAct, deterministic-first reasoning doctrine, model-specific reasoning capabilities, and the two-pass pattern (audit then implement). Covers reasoning effort calibration, the thinking-doing balance, reasoning technique routing by task type, and anti-patterns like over-reasoning simple tasks. Use when choosing how much to think before acting, calibrating reasoning depth, or when an agent is either under-thinking (wrong answers) or over-thinking (slow, verbose, circular). Do NOT use for prompt engineering (use prompt-craft) or for model selection (use agents).

## Coverage

Reasoning strategy selection for AI agents: the 6-layer deterministic-first hierarchy (lookup, parse, compute, pattern-match, reason, generate), extended thinking calibration across Claude/GPT-5.4/Gemini, chain-of-thought vs tree-of-thought vs ReAct technique routing, the two-pass audit-then-implement pattern, circular reasoning detection and escape, model-specific reasoning strengths and sweet spots, and the 80/20 rule for reasoning effort allocation.

## Philosophy

Reasoning is the most expensive operation an agent performs. Every token spent thinking is a token not spent doing. This skill teaches agents to match reasoning depth to task complexity — neither under-thinking (wrong results) nor over-thinking (wasted tokens, circular exploration). Without this skill, agents default to maximum reasoning on trivial tasks (500-word analysis before a rename) or minimum reasoning on complex tasks (one-shot architecture decisions that miss critical tradeoffs). The deterministic-first doctrine prevents LLM reasoning when a simple lookup, grep, or hash comparison would produce the same answer at 1/50th the cost.

## 1. The Reasoning Hierarchy

Apply the cheapest reasoning strategy that produces a correct result:

```
Can I solve this without thinking?
├── Yes → Act immediately (lookup, copy, format)
│         Examples: rename variable, fix typo, run test
└── No
    ├── Is the answer deterministic?
    │   ├── Yes → Deterministic extraction (regex, grep, parse)
    │   │         No LLM reasoning needed. Code-first.
    │   └── No
    │       ├── Is it a simple decision?
    │       │   ├── Yes → Single-step reasoning (pattern match)
    │       │   │         Match against known patterns. One mental step.
    │       │   └── No
    │       │       ├── Does it need sustained analysis?
    │       │       │   ├── Yes → Extended thinking (multi-step)
    │       │       │   │         Architecture, debugging, cross-file refactors
    │       │       │   └── No → Chain-of-thought (explicit steps)
    │       │       │             Break into 3-5 explicit steps, execute each
    │       └── Is there genuine uncertainty?
    │           └── Yes → Generate-critique-revise loop
    │                     See reflection-pattern skill
    └── Am I going in circles?
        └── Yes → STOP. Ask the user. Or try a different approach entirely.
```

## 2. Deterministic-First Doctrine

Before engaging LLM reasoning, exhaust deterministic methods:

| Layer | Method | Example | Cost |
|-------|--------|---------|------|
| 1. Lookup | Read file, check config | "What's the DB host?" → Read .env | ~100 tokens |
| 2. Parse | Regex, JSON parse, AST | "Count exports in file" → grep pattern | ~100 tokens |
| 3. Compute | Math, diff, hash | "Are these files identical?" → hash compare | ~50 tokens |
| 4. Pattern match | Known solution | "Fix missing import" → standard fix | ~200 tokens |
| 5. Reason | LLM analysis | "Why is this failing?" → multi-step analysis | ~2K+ tokens |
| 6. Generate | LLM synthesis | "Design the new API" → creative work | ~5K+ tokens |

**Rule:** Never use Layer 5-6 when Layer 1-4 suffices.

> **Source:** `skills/deterministic/SKILL.md` — The Deterministic Hierarchy

## 3. Extended Thinking Calibration

Modern models (Opus 4.6, Sonnet 4.6, GPT-5.4) support configurable reasoning depth:

### Claude (Adaptive Thinking)
Reasoning depth auto-adjusts based on prompt complexity:
- **Low:** Simple lookups, formatting, direct answers
- **Medium:** Standard coding tasks, bug fixes, feature implementation
- **High:** Architecture decisions, cross-file refactors, complex debugging
- **Max:** Novel problems, security analysis, financial logic review

No manual control — the model self-calibrates. But you influence it through prompt structure:
- Short, direct prompts → lower reasoning
- Prompts with constraints, edge cases, "think carefully" → higher reasoning

### GPT-5.4 (Explicit Effort Levels)
Five configurable levels via API:
- **none:** No reasoning traces. Fastest. For classification only.
- **low:** Minimal reasoning. Quick decisions.
- **medium:** Standard reasoning. Most tasks.
- **high:** Deep reasoning. Complex problems.
- **xhigh:** Maximum reasoning. Known to cause edit failures (codex#13773).

**Rule:** Default to medium. Use high for architecture/security. Never use xhigh for code editing.

### Gemini (Thinking Budget)
Configurable via `thinkingConfig.thinkingBudget` (token count):
- 0: No thinking
- 1024-4096: Standard tasks
- 8192+: Complex reasoning

## 4. Reasoning Technique Routing

| Task Type | Technique | Why |
|-----------|-----------|-----|
| Bug fix (known pattern) | Pattern match | Apply known fix, don't re-derive |
| Bug fix (unknown cause) | Chain-of-thought | Trace execution step by step |
| Architecture decision | Extended thinking + two-pass | First pass: explore options. Second: decide. |
| Code review | Checklist-driven | Apply rules mechanically, reason only on violations |
| Refactoring | Tree-of-thought | Consider multiple approaches, pick best |
| Security analysis | Extended thinking (high) | Must be thorough — missing a vulnerability is worse than over-thinking |
| UI implementation | Pattern match + verify | Apply design guide rules, then visually verify |
| Data migration | Deterministic + validate | Parse schema, generate SQL, validate constraints |
| Task triage | Classification | Categorize, don't analyze deeply |

## 5. The Two-Pass Pattern

For complex tasks, separate analysis from execution:

### Pass 1: Audit (read-only)
- Scan relevant files
- Identify what needs to change
- List dependencies and risks
- Do NOT make changes yet

### Pass 2: Implement (write)
- Execute changes based on Pass 1 findings
- Verify each change
- Test

**Why two passes work:**
- Pass 1 builds a complete mental model before any mutations
- Prevents "fix one thing, break another" cascading failures
- Pass 1 can use a cheaper model (Haiku for audit, Sonnet for implementation)

> **Source:** `feedback_two_pass_design.md` — Design tasks must use two-pass

## 6. The Thinking-Doing Balance

### Signs of Under-Thinking
- Wrong answers that a moment's thought would prevent
- Missing obvious edge cases
- Ignoring constraints stated in the prompt
- Producing code that doesn't compile

**Fix:** Add explicit reasoning step before acting. "First, let me understand what's needed..."

### Signs of Over-Thinking
- Re-reading files already read in this conversation
- Spawning subagents for simple lookups
- Generating lengthy analysis before a one-line fix
- Exploring multiple approaches when the answer is obvious
- Circular reasoning (considering, then reconsidering the same options)

**Fix:** Act. If the task is simple, just do it. Verify after, not before.

### The 80/20 Rule
- 80% of tasks need <30 seconds of reasoning
- 15% of tasks need 1-5 minutes of structured analysis
- 5% of tasks need deep, multi-step reasoning

**Don't apply 5%-level reasoning to 80%-level tasks.**

## 7. Reasoning Anti-Patterns

| Anti-Pattern | Symptom | Fix |
|-------------|---------|-----|
| Analysis paralysis | 500-word analysis before a rename | Just do it, verify after |
| Circular exploration | Re-reads same files, same conclusions | Stop, summarize what you know, act |
| Premature abstraction | Designs framework for one-off task | Write the simple code first |
| Over-verification | Checks 5 sources for a single fact | One authoritative source is enough |
| Reasoning about reasoning | Meta-commentary on own thought process | Skip the commentary, show the work |
| Shotgun debugging | Tries random fixes without diagnosis | Stop. Read the error. Trace the cause. |
| Consensus-seeking | "Let me check multiple models..." | One model's confident answer > three uncertain ones |

## 8. Model-Specific Reasoning Strengths

| Model | Reasoning Sweet Spot | Avoid |
|-------|---------------------|-------|
| **Opus 4.6** | Sustained multi-step, architecture, cross-file | Simple tasks (too slow, over-engineers) |
| **Sonnet 4.6** | Standard coding, 100-step chains, balanced | Novel research (lacks Opus depth) |
| **Haiku 4.5** | Classification, triage, checklist application | Complex reasoning (loses track) |
| **GPT-5.4** | Computer use, structured review, business reasoning | Code editing at xhigh effort (known bug) |
| **Gemini 3.1 Pro** | Long-context reasoning, multimodal analysis | Speed-critical tasks (slow output) |
| **MiniMax M2.5** | Structured spec-writing, coding | Nuance, aesthetic judgment, ambiguity |

## 9. Verification Checklist

Before engaging deep reasoning:

- [ ] Can this be solved deterministically (lookup, parse, compute)?
- [ ] Am I applying the right level of reasoning for this task tier?
- [ ] Have I separated analysis (Pass 1) from execution (Pass 2)?
- [ ] Am I going in circles? If yes, stop and try a different approach.
- [ ] Is my reasoning producing actionable output, or just commentary?

## 10. Drift Traps

1. **Reasoning inflation** — Each model generation reasons more by default. Resist: simple tasks still need simple execution.
2. **Confusing thoroughness with quality** — 10 minutes of analysis doesn't help a typo fix.
3. **Model-native reasoning sufficiency** — Don't add explicit CoT prompts to models that already have extended thinking.
4. **xhigh reasoning bugs** — GPT-5.4 at xhigh breaks edit actions. Use high maximum.
5. **Reasoning about tool choice** — Just pick the tool. The decision tree (Section 1) is the reasoning.

---

## Verification

After applying reasoning strategy selection, verify:
- [ ] The chosen reasoning level matches the task tier (trivial/standard/complex)
- [ ] Deterministic methods (lookup, parse, compute) were exhausted before engaging LLM reasoning
- [ ] No circular reasoning patterns remain (re-reading same files, restating same tradeoffs)
- [ ] For complex tasks, the two-pass pattern was applied (audit then implement)
- [ ] Extended thinking was not used for trivial tasks, and trivial reasoning was not used for architecture decisions

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Choosing which AI model to assign | `agents` | agents owns model selection and routing |
| Writing or structuring prompts | `prompt-craft` | prompt-craft owns prompt design and templating |
| Running a generate-critique-revise loop | `reflection-pattern` | reflection-pattern owns iterative quality loops |
| Calibrating work intensity to task size | `effort` | effort owns fast-track vs full-protocol decisions |

## Key Sources

- Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux. The canonical popular synthesis of dual-process cognition; System 1 (fast, automatic) vs System 2 (slow, deliberate); cognitive biases and heuristics. Foundational for understanding when reasoning helps and when it produces confident error.
- Simon, H. A. (1955). "A Behavioral Model of Rational Choice." *Quarterly Journal of Economics*, 69(1), 99-118. The original statement of bounded rationality — reasoning under finite computational resources. Establishes that *satisficing* (good-enough stopping) is the rational stance for bounded agents, not optimization.
- Newell, A., & Simon, H. A. (1972). *Human Problem Solving*. Prentice-Hall. The classic account of problem solving as state-space search; means-ends analysis; the role of strategy selection in expert reasoning.
- Klein, G. (1998). *Sources of Power: How People Make Decisions*. MIT Press. The recognition-primed decision model; expert intuition as pattern-matched reasoning rather than its opposite. Why deliberation is not always the right answer under time pressure.
- Pólya, G. (1945). *How to Solve It*. Princeton University Press. A heuristic method for mathematical problem solving; the canonical statement of strategy-selection discipline in formal problem domains.
- Stanovich, K. E., & West, R. F. (2000). "Individual differences in reasoning: Implications for the rationality debate?" *Behavioral and Brain Sciences*, 23(5), 645-665. Empirical study of variation in deliberative reasoning; cognitive style versus problem-class fit.
- Wei, J., Wang, X., Schuurmans, D., Bosma, M., et al. (2022). "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models." *NeurIPS 2022*. The introduction of chain-of-thought as an explicit reasoning technique in language models.
- Yao, S., Zhao, J., Yu, D., et al. (2022). "ReAct: Synergizing Reasoning and Acting in Language Models." *ICLR 2023*. The ReAct pattern; interleaved reasoning and action.
- Lanham, T., Chen, A., Radhakrishnan, A., et al. (2023). "Measuring Faithfulness in Chain-of-Thought Reasoning." Anthropic. Empirical evidence that visible chain-of-thought traces can be unfaithful to the actual reasoning process — the visible-trace-vs-doing-the-work distinction.

---

*Version 1.2.0 — 2026-05-16*
