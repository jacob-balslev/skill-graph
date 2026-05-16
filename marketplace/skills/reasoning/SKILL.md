---
name: reasoning
description: "Use when choosing reasoning depth, deciding whether to think deeply or act fast, calibrating model effort, or diagnosing under-thinking and over-thinking in agents. Covers deterministic-first reasoning, technique routing by task type, chain/tree/ReAct patterns, the thinking-doing balance, and two-pass audit-then-implement workflows. Do NOT use for prompt wording (use `prompt-craft`) or agent architecture (use `agent-engineering`)."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: foundations
  domain: foundations/cognition
  scope: reference
  owner: skill-graph-maintainer
  freshness: "2026-03-28"
  drift_check: "{\"last_verified\":\"2026-03-28\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"reasoning strategy\",\"extended thinking\",\"think deeper\",\"reasoning effort\",\"chain of thought\",\"over-thinking\",\"under-thinking\",\"reasoning depth\",\"think before acting\"]"
  triggers: "[\"reasoning-skill\",\"thinking-skill\"]"
  relations: "{\"related\":[\"design-thinking\",\"semantic-center\"],\"boundary\":[\"prompt-craft\"],\"verify_with\":[\"evaluation\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning/SKILL.md
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

---

*Version 1.1.0 — 2026-03-28*
