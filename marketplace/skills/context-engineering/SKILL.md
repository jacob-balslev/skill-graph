---
name: context-engineering
description: "Use when designing what information reaches an LLM agent before it reasons — system prompt, persistent memory, always-loaded rules, injected skills, and the user prompt — or when diagnosing why an agent produced a wrong answer despite a clear instruction. Covers the four context failure modes (missing, stale, wrong, overwhelming), the five-layer context stack, four context quality metrics (injection precision and recall, utilization, freshness), the Frequent Intentional Compaction (FIC) protocol, subagent delegation for context-heavy work, and the failure-mode decision tree. Do NOT use for prompt wording (use `prompt-craft`), authoring a new SKILL.md (use `skill-scaffold`), or deciding which skill the router activates for a given query (use `skill-router`). Do NOT use for improve this prompt's wording to get better outputs. Do NOT use for scaffold a new SKILL.md for our team's deploy procedure. Do NOT use for the router picked the wrong skill for this query — debug it."
license: MIT
compatibility: "Provider-agnostic; principles apply across Claude, GPT, Gemini, and open-weight models. Layer mapping varies by harness (Claude Code, OpenCode, Cursor, Continue, Aider) but the five-layer abstraction holds."
allowed-tools: Read Grep Bash Edit
metadata:
  relations: "{\"related\":[\"prompt-craft\",\"skill-router\",\"context-window\",\"tool-call-strategy\",\"agent-engineering\"],\"suppresses\":[\"skill-router\",\"skill-scaffold\"],\"verify_with\":[\"code-review\",\"epistemic-grounding\"]}"
  subject: agent-ops
  scope: "Designing what information reaches an LLM agent before it reasons — system prompt, persistent memory, always-loaded rules, injected skills, and user prompt — and diagnosing wrong answers despite clear instructions. Covers the four context failure modes (missing, stale, wrong, overwhelming), the five-layer context stack, four context-quality metrics (injection precision/recall, utilization, freshness), the Frequent Intentional Compaction protocol, subagent delegation for context-heavy work, and the failure-mode decision tree. Portable across any agent runtime; principle-grounded, not repo-bound. Excludes prompt wording (prompt-craft), authoring a new SKILL.md (skill-scaffold), and which skill the router activates (skill-router)."
  public: "true"
  taxonomy_domain: agent/context
  stability: experimental
  keywords: "[\"context engineering\",\"context failure\",\"agent context\",\"context quality\",\"context design\",\"missing context\",\"stale context\",\"wrong context\",\"overwhelming context\",\"context window\"]"
  examples: "[\"the agent ignored the instruction and used the wrong query helper — was the right skill loaded?\",\"we keep getting generic answers from the agent even though the skill has the answer — what's wrong?\",\"I want to design which skills get injected for which prompts — where do I start?\",\"the agent's quality drops in long sessions — when should I compact?\",\"diagnose this agent failure: it had the file open but produced wrong output anyway\",\"we have 200 skills and the agent picks the wrong ones — fix the injection\",\"should I read this 5K-line file directly or delegate to a subagent?\",\"audit our context pipeline — what's loaded when, and is any of it stale?\"]"
  anti_examples: "[\"improve this prompt's wording to get better outputs\",\"scaffold a new SKILL.md for our team's deploy procedure\",\"the router picked the wrong skill for this query — debug it\",\"review this AI-generated PR for correctness\",\"write a doc explaining our agent system to a new joiner\",\"investigate why production crashed at 3am\"]"
  grounding: "{\"subject_matter\":\"Context engineering for LLM agents\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents\",\"https://platform.claude.com/docs/en/build-with-claude/context-windows\",\"https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools\",\"https://www.ibm.com/think/topics/context-engineering\",\"https://arxiv.org/abs/2510.26493\"],\"failure_modes\":[\"context_window_treated_as_unlimited\",\"prompt_wording_treated_as_context_design\",\"retrieval_dump_replaces_selection\",\"tool_results_accumulate_without_clearing\",\"stale_memory_overrides_current_evidence\"],\"evidence_priority\":\"equal\"}"
  mental_model: "Context engineering is the discipline of compiling the smallest sufficient, highest-signal working set for an LLM at each step: instructions, memory, retrieved facts, tool outputs, examples, conversation history, and task metadata. The primitives are selection, structure, sequencing, compaction, freshness, provenance, and isolation. More context is not automatically better; every token either supports the next decision or competes with the signal the model should attend to."
  purpose: "This skill exists because many agent failures look like reasoning failures but come from a bad informational environment: the right fact was absent, stale memory won over current evidence, irrelevant retrieval buried the signal, or raw tool output accumulated after its value expired. It gives teams a way to design and debug the context pipeline instead of endlessly rewriting prompts."
  concept_boundary: "This skill does not write the wording of a single prompt, author a new SKILL.md, or decide the router result for one query. It also does not promise that context engineering fixes every model error. Use it when the failure or design question concerns what information reaches the model, how it is structured, when it is refreshed, and what should be withheld, summarized, delegated, or cleared."
  analogy: "Context engineering is like packing a surgical tray: success depends less on owning every possible instrument and more on putting the right clean tools in the right order before the operation starts."
  misconception: "The common mistake is treating context engineering as prompt stuffing: retrieve everything, paste every rule, keep every tool result, and hope the model sorts it out. That creates context pollution. Good context engineering is selective, source-aware, time-aware, and willing to remove information once it no longer helps."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/context-engineering/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

# Context Engineering

## Concept of the skill

Context engineering is the discipline of compiling the smallest sufficient, highest-signal working set for an LLM at each step: instructions, memory, retrieved facts, tool outputs, examples, conversation history, and task metadata.

## Coverage

- Core principle: the model is a reasoning engine that reasons over whatever is in its context window — wrong context produces correct reasoning over false premises
- The five-layer context stack: system prompt, persistent memory, always-loaded rules, injected skills, agent prompt — what each layer does and how each can fail
- The four context failure modes: missing, stale, wrong, overwhelming — diagnostic questions for each, table of symptoms, and prevention strategies
- Four context quality metrics: injection precision, injection recall, context utilization, freshness score — definitions, healthy ranges, and how to measure each
- Context-compilation levers: selection, structuring, sequencing, compaction, memory integration, retrieval, provenance, and tool-result clearing
- Frequent Intentional Compaction (FIC): proactive compaction at task boundaries, target utilization range, and the difference between planned and forced compaction
- Subagent delegation pattern: when to delegate context-heavy investigation to a subagent so the main agent receives a summary instead of raw evidence
- Debugging decision tree: how to diagnose any agent failure by walking from missing-context through overwhelming-context before blaming the model
- The verification checklist: gates a context-engineering review must pass before declaring the pipeline healthy

## Philosophy of the skill
The model is a reasoning engine that reasons over whatever is in its context window. If the context is wrong, the reasoning is correct but the conclusion is wrong. This means most agent failures are context failures, not model failures.

Without this discipline, teams blame the model for mistakes caused by missing keywords, stale skill content, or an overwhelmed window. Context engineering provides the diagnostic framework to identify *why* an agent produced a wrong answer and the design principles to prevent recurrence. It treats the context window as a deliberate design surface — not a dumping ground — so that the model's native reasoning produces the correct output without heroic prompting.

Current agent literature converges on the same lesson: context is finite working memory, not a warehouse. Anthropic frames context engineering as curating the optimal set of tokens across instructions, tools, MCP, external data, and message history; Anthropic's API docs warn that more context is not automatically better because recall can degrade as token count grows; IBM describes context engineering as selecting, structuring, compressing, sequencing, and integrating tool or memory information so agents can reason over the right facts. Those sources all point to the same practical rule: every context item needs a job.

> Most agent failures are context failures, not model failures. Context engineering is the discipline of designing what information the model sees, when it sees it, and in what form — so that the model's native reasoning produces the correct output without heroic prompting.

## Core Principle

The model is a reasoning engine. It reasons over whatever context is in its window. If the context is wrong, the reasoning is correct but the conclusion is wrong. **You cannot prompt your way out of a context problem.**

Three implications:

1. **Garbage in, garbage out** — a perfectly written prompt cannot compensate for missing domain knowledge. The model will hallucinate confidently.
2. **Signal-to-noise ratio matters** — flooding the context window with irrelevant information degrades performance just as surely as omitting critical information. The model attends to everything.
3. **Context is a design surface** — the information in the context window is as intentional as a database schema or an API contract. It should be designed, measured, and iterated.

## The Five-Layer Context Stack

```
Layer 5 — Agent prompt          (the task-specific instruction from user or orchestrator)
Layer 4 — Injected skills       (domain knowledge selected per task by a router or injector)
Layer 3 — Always-loaded rules   (universal guardrails: security, naming, GDPR, etc.)
Layer 2 — Persistent memory     (cross-session knowledge: user preferences, prior decisions)
Layer 1 — System prompt         (foundational identity, non-negotiable rules, reading order)
```

Each layer adds context. Each layer can introduce failure. The context engineer's job is to ensure the right information reaches the right layer at the right time.

The five layers are the stable scaffolding. Around them sits the runtime payload: retrieved documents, tool results, examples, summaries, temporary notes, and conversation history. Treat that payload as a compiled artifact. It should be rebuilt for the current step, not treated as a permanent archive.

| Layer | Loaded when | Failure mode if broken |
|-------|-------------|-----------------------|
| Layer 1 — System prompt | Always (turn 0) | Agent ignores fundamental rules and identity |
| Layer 2 — Persistent memory | Always (auto-loaded at session start) | Agent repeats prior mistakes or ignores user preferences |
| Layer 3 — Always-loaded rules | Always (auto-loaded by harness) | Agent violates universal guardrails |
| Layer 4 — Injected skills | Per task, via router or keyword match | Agent lacks domain knowledge for the task |
| Layer 5 — Agent prompt | Per request | Agent operates on an ambiguous or underspecified instruction |

The exact mechanism varies by harness — Claude Code uses `CLAUDE.md` + `.claude/rules/` + `MEMORY.md`; Cursor uses `.cursorrules`; OpenCode uses `AGENTS.md`; Aider uses `CONVENTIONS.md`. The abstraction holds across all of them.

## The Four Context Failure Modes

Every agent mistake can be traced to one of four context failures. Diagnosing which failure mode caused the mistake is the first step to fixing it.

### Missing Context

The agent does not have the information it needs. Most common, easiest to diagnose.

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| Agent uses wrong API or helper despite a skill that names the correct one | Skill not injected for this prompt's keywords | Add task-phrase keywords to the skill; verify routing |
| Agent ignores a project convention (naming, structure, format) | Convention not in always-loaded rules | Promote the rule from skill to always-loaded layer |
| Agent contradicts a decision made in a prior session | Decision not in persistent memory | Save the decision to a memory topic file |
| Agent uses a deprecated pattern | Skill content does not name the current replacement | Update the skill with the current pattern + deprecation note |

**Diagnostic question:** "Did the agent have access to the information that would have prevented this mistake?"

### Stale Context

The agent has the information, but it is outdated. The skill says X, but the codebase has moved to Y.

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| Agent references a file that was renamed several sessions ago | Skill references not updated after the rename | Run drift check; update file paths in the skill |
| Agent uses an old version of an external API | Skill content not refreshed after the upstream change | Update the skill, bump `freshness`, link new docs |
| Agent applies a pattern that was superseded by a recorded decision | The supersession is not cross-referenced from the skill | Add a "superseded by" pointer in the skill body |
| Memory says "blocked by X" but X was resolved last week | Memory topic file not pruned | Update or remove the stale memory entry |

**Diagnostic question:** "Was this information correct when it was written? Has the source of truth changed since?"

**Prevention:** every skill carries a `drift_check.last_verified` date. Skills whose verification is older than the lifecycle policy (e.g. 90 days for portable, 30 days for integration skills) should be reviewed before use in a high-stakes task.

### Wrong Context

The agent has information, but it is incorrect. The most dangerous failure mode because the agent acts confidently on false premises.

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| Agent applies a pattern from a different project / different library version | Skill content was copied without adapting | Audit skill for cross-project accuracy; add scope qualifier |
| Agent follows a rule that contradicts another rule | Two rules conflict without precedence | Establish explicit precedence or merge the rules |
| Agent uses a formula with incorrect semantics | Formula in skill has a bug | Verify formulas against actual implementation code, with a line-number citation |
| Agent cites a reference that says the opposite of what the skill claims | Hallucinated or misquoted reference | Add source attribution with file path and line numbers |

**Diagnostic question:** "Was the information the agent acted on actually correct?"

**Prevention:** skill content cites specific files and line numbers. Generic "best practice" advice without grounded evidence is a wrong-context risk.

### Overwhelming Context

The agent has too much information. The signal is diluted by noise; the model's attention is spread too thin.

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| Agent ignores a critical rule buried in a 2000-line skill | Skill is a monolith without internal structure | Split into thin SKILL.md + `references/` for depth |
| Agent produces generic output despite specific guidance | Too many skills injected, none deeply read | Improve injection precision; remove overly broad keywords |
| Agent's work quality degrades in the second half of a long session | Context window approaching capacity | Apply FIC at task breakpoints |
| Agent follows a less-relevant rule over a more-relevant one | Rules not prioritised by specificity | Use always-loaded rules for universal guardrails; skills for domain-specific |

**Diagnostic question:** "Did the agent have so much context that it couldn't focus on the right information?"

**Prevention:** measure injection precision. If more than 30% of injected skills are irrelevant to the task, the injection system needs tuning.

## Context Quality Metrics

Four metrics measure the health of a context engineering system. Track these over time to identify systemic issues.

### Injection Precision

Of all skills injected for a task, what percentage were actually needed?

```
Injection Precision = (skills used / skills injected) × 100
```

| Score | Interpretation | Action |
|-------|---------------|--------|
| > 80% | Healthy | Maintain |
| 50–80% | Noisy | Tighten keywords; remove overly broad trigger phrases |
| < 50% | Broken | Audit keywords; too many skills match too many prompts |

**How to measure:** after completing a task, review which injected skills were actually referenced in the agent's work. Skills injected but never consulted are false positives.

### Injection Recall

Of all skills that would have been useful for a task, what percentage were actually injected?

```
Injection Recall = (relevant skills injected / relevant skills total) × 100
```

| Score | Interpretation | Action |
|-------|---------------|--------|
| > 90% | Healthy | Maintain |
| 70–90% | Gaps exist | Add missing keywords to under-matched skills |
| < 70% | Systematic failure | Review skill descriptions; add trigger phrases |

**How to measure:** after a context failure, check whether the skill that would have prevented it was indexed and whether its keywords matched the prompt.

### Context Utilization

What percentage of the context window is used productively (contributes to correct output)?

```
Context Utilization = (productive context / total context used) × 100
```

Productive context: relevant skill content, necessary file reads, on-topic conversation history. Unproductive context: irrelevant skills, stale memory, redundant file reads, verbose tool output.

| Score | Interpretation | Action |
|-------|---------------|--------|
| > 70% | Efficient | Maintain |
| 40–70% | Acceptable but improvable | Compact stale conversation; reduce verbose tool output |
| < 40% | Wasteful | Apply FIC; review what loads at startup |

### Freshness Score

What percentage of injected skill content is current (drift_check within the lifecycle window)?

```
Freshness Score = (skills with drift_check inside window / total injected skills) × 100
```

| Score | Interpretation | Action |
|-------|---------------|--------|
| > 90% | Current | Maintain |
| 70–90% | Drifting | Schedule drift check for stale skills |
| < 70% | Dangerous | Stop; audit all stale skills before continuing |

## Frequent Intentional Compaction (FIC)

FIC is a proactive context-management strategy. Instead of waiting for the window to fill and reacting with an emergency compact, plan compaction points into the workflow.

**Target utilization:** 40–60% of the context window during steady-state work.

**When to compact:** at natural breakpoints, not when forced by pressure.

| Breakpoint | Action |
|-----------|--------|
| Task boundary (one task done, before starting next) | Compact — summarise what was accomplished, discard working details |
| Research complete, implementation starting | Compact — keep conclusions, discard search results and exploration |
| After reading a large file or running an enumeration | Summarise key findings; do not keep raw output in conversation |
| After a debugging session | Keep the fix and the root cause; discard the investigation steps |

The forced compact is dangerous because it is uncontrolled — you lose whatever the compaction algorithm decides is least important, which may include critical task context.

Compaction is only one lever. Long-running agents also need memory and tool-result clearing. Memory stores durable notes outside the context window and retrieves them later when relevant. Tool-result clearing removes raw outputs after their useful summary or citation has been captured. The rule is simple: preserve decisions, evidence, and open constraints; clear raw material whose job is done.

### FIC Anti-Patterns

| Anti-pattern | Why it fails | Fix |
|-------------|-------------|-----|
| Never compacting ("I might need that later") | Window fills; forced compact loses more than planned compact would | Compact proactively at breakpoints |
| Compacting too aggressively ("keep only the plan") | Loses critical decisions and constraints | Keep decisions, constraints, and the active plan; discard exploration |
| Reading entire large files "just in case" | Wastes 5–10K tokens per file | Read targeted sections; use grep to find relevant lines |
| Keeping full tool output in context | JSON or log output is enormous and rarely re-used | Summarise tool results immediately after reading |

## Subagent Delegation for Context-Heavy Work

Some tasks consume enormous context (reading 20 files, searching across the codebase, analysing dependencies). Doing this in the main session pollutes its context for every subsequent step. Delegate to a subagent instead:

```
Main agent:    "I need to understand the data pipeline that feeds the dashboard"
                ↓ spawn subagent with narrow scope
Subagent:      reads 15 files, traces the pipeline, builds a mental model
                ↓ returns a 200-word structured summary
Main agent:    receives summary (≈200 tokens, not ≈15,000)
```

The subagent's context is disposable. The main agent gets the conclusion without the investigation cost.

This pattern is especially valuable for: codebase exploration, audit work, dependency tracing, multi-file refactor planning, and any "look at everything before deciding" investigation.

## Debugging Agent Failures

When an agent produces wrong output, walk this decision tree before blaming the model:

```
Agent produced wrong output
    │
    ▼
Was the right skill (or rule) loaded?
    │
   NO ──▶  MISSING CONTEXT
    │       Fix: add keywords; promote rule to always-loaded layer; save the decision
    │
   YES
    │
    ▼
Was the loaded content correct and current?
    │
   NO ──▶  STALE or WRONG CONTEXT
    │       Fix: update the skill; verify against source; cite line numbers
    │
   YES
    │
    ▼
Was the context window > 80% full?
    │
   YES ──▶ OVERWHELMING CONTEXT
    │       Fix: apply FIC; delegate investigation to a subagent
    │
   NO
    │
    ▼
Was the prompt itself ambiguous or underspecified?
    │
   YES ──▶ Prompt problem (use prompt-craft)
    │
   NO
    │
    ▼
Genuine model reasoning failure (rare; try a different model or add observable reasoning scaffolds)
```

Prefer observable scaffolds when you reach the final branch: smaller tasks, explicit intermediate artifacts, checks, tests, or a stronger model. Do not mask a context failure by asking for more private reasoning.

### Failure analysis template

When recording a context failure for retrospective:

```markdown
## Context Failure Report

Date:            YYYY-MM-DD
Task:            [what the agent was asked to do]
Failure:         [what went wrong]
Failure mode:    Missing | Stale | Wrong | Overwhelming
Root cause:      [why the context was bad]
Fix applied:     [what was changed to prevent recurrence]
Layer affected:  Layer 1 / 2 / 3 / 4 / 5 (system prompt / memory / rules / skills / prompt)
```

## Verification

Use this checklist when designing a new skill, debugging a failure, or auditing the context pipeline:

- [ ] Every agent failure was diagnosed to one of the four failure modes (Missing, Stale, Wrong, Overwhelming) before any fix landed
- [ ] Skills involved in any failure now have keywords that match how users actually phrased the request
- [ ] Skill content cites specific files and line numbers, not generic advice
- [ ] `drift_check.last_verified` is inside the lifecycle window for every active skill
- [ ] No two skills give contradictory advice on the same topic (`relations.suppresses` is honest about ownership)
- [ ] Context utilization is tracked at task breakpoints; FIC fires at natural boundaries
- [ ] Injection precision is above 80% (most injected skills are actually consulted)
- [ ] Injection recall is above 90% (most needed skills are injected)
- [ ] Context-heavy investigations are delegated to subagents so the main agent receives summaries, not raw evidence
- [ ] Always-loaded rules contain only universal guardrails; domain-specific guidance lives in skills
- [ ] Raw tool results have been summarized, cited, or cleared once they are no longer needed
- [ ] Retrieved context records source, date, and relevance so stale or wrong inputs can be traced

## Source Notes

- [Anthropic's effective context engineering guide](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) frames context engineering as curating the token set around agents, including tools, MCP, external data, and history.
- [Anthropic's context-window docs](https://platform.claude.com/docs/en/build-with-claude/context-windows) describe the context window as working memory and warn that larger context does not automatically improve recall.
- [Anthropic's context-engineering cookbook](https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools) distinguishes compaction, memory, and tool-result clearing for long-running agents.
- [IBM's context engineering overview](https://www.ibm.com/think/topics/context-engineering) names selection, structuring, prompt design, compression, sequencing, and tool or memory integration as core steps.
- [Context Engineering 2.0](https://arxiv.org/abs/2510.26493) situates the concept historically and argues for systematic context-engineering practice in AI systems.

## Do NOT Use When

| Use instead | When |
|---|---|
| `prompt-craft` | The fix is in the wording of one instruction (clarity, format, few-shot examples), not the surrounding stack |
| `skill-scaffold` | Authoring or restructuring a single SKILL.md file (the contract, not the system around it) |
| `skill-router` | Debugging which skill the router activates for a specific query — that is a routing-mechanism question, not a context-design question |
| `code-review` | Reviewing AI-generated code for correctness, security, or style |
| `documentation` | Writing prose for a human reader about how the agent system works |
| `debugging` | Investigating a runtime production failure that is not specifically an agent context failure |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops`
- Public: `true`
- Domain: `agent/context`
- Scope: Designing what information reaches an LLM agent before it reasons — system prompt, persistent memory, always-loaded rules, injected skills, and user prompt — and diagnosing wrong answers despite clear instructions. Covers the four context failure modes (missing, stale, wrong, overwhelming), the five-layer context stack, four context-quality metrics (injection precision/recall, utilization, freshness), the Frequent Intentional Compaction protocol, subagent delegation for context-heavy work, and the failure-mode decision tree. Portable across any agent runtime; principle-grounded, not repo-bound. Excludes prompt wording (prompt-craft), authoring a new SKILL.md (skill-scaffold), and which skill the router activates (skill-router).

**When to use**
- the agent ignored the instruction and used the wrong query helper — was the right skill loaded?
- we keep getting generic answers from the agent even though the skill has the answer — what's wrong?
- I want to design which skills get injected for which prompts — where do I start?
- the agent's quality drops in long sessions — when should I compact?
- diagnose this agent failure: it had the file open but produced wrong output anyway
- we have 200 skills and the agent picks the wrong ones — fix the injection
- should I read this 5K-line file directly or delegate to a subagent?
- audit our context pipeline — what's loaded when, and is any of it stale?

**Not for**
- improve this prompt's wording to get better outputs
- scaffold a new SKILL.md for our team's deploy procedure
- the router picked the wrong skill for this query — debug it
- review this AI-generated PR for correctness
- write a doc explaining our agent system to a new joiner
- investigate why production crashed at 3am

**Related skills**
- Verify with: `code-review`, `epistemic-grounding`
- Related: `prompt-craft`, `skill-router`, `context-window`, `tool-call-strategy`, `agent-engineering`

**Concept**
- Mental model: Context engineering is the discipline of compiling the smallest sufficient, highest-signal working set for an LLM at each step: instructions, memory, retrieved facts, tool outputs, examples, conversation history, and task metadata. The primitives are selection, structure, sequencing, compaction, freshness, provenance, and isolation. More context is not automatically better; every token either supports the next decision or competes with the signal the model should attend to.
- Purpose: This skill exists because many agent failures look like reasoning failures but come from a bad informational environment: the right fact was absent, stale memory won over current evidence, irrelevant retrieval buried the signal, or raw tool output accumulated after its value expired. It gives teams a way to design and debug the context pipeline instead of endlessly rewriting prompts.
- Boundary: This skill does not write the wording of a single prompt, author a new SKILL.md, or decide the router result for one query. It also does not promise that context engineering fixes every model error. Use it when the failure or design question concerns what information reaches the model, how it is structured, when it is refreshed, and what should be withheld, summarized, delegated, or cleared.
- Analogy: Context engineering is like packing a surgical tray: success depends less on owning every possible instrument and more on putting the right clean tools in the right order before the operation starts.
- Common misconception: The common mistake is treating context engineering as prompt stuffing: retrieve everything, paste every rule, keep every tool result, and hope the model sorts it out. That creates context pollution. Good context engineering is selective, source-aware, time-aware, and willing to remove information once it no longer helps.

**Grounding**
- Mode: `hybrid`
- Truth sources: `https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents`, `https://platform.claude.com/docs/en/build-with-claude/context-windows`, `https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools`, `https://www.ibm.com/think/topics/context-engineering`, `https://arxiv.org/abs/2510.26493`

**Keywords**
- `context engineering`, `context failure`, `agent context`, `context quality`, `context design`, `missing context`, `stale context`, `wrong context`, `overwhelming context`, `context window`

<!-- skill-graph-context:end -->
