---
name: ai-native-development
description: "Use when reasoning about agent autonomy levels, designing auto-improve loops, evaluating AI-generated code quality, or measuring agent productivity in an LLM-assisted codebase. Covers Karpathy's three eras of software (1.0 explicit / 2.0 learned / 3.0 natural-language), the vibe-coding-vs-agentic-engineering distinction, the 0–5 autonomy slider with task-type recommendations, the one-asset / one-metric / one-time-box AutoResearch loop, Software 3.0 productivity metrics, and the documented quality regressions of ungated AI-generated code (the 'vibe hangover'). Do NOT use for choosing a specific autonomy-loop topology (use `agent-engineering`), for the per-prompt authoring discipline (use `prompt-craft`), or for reviewing the AI-generated code that comes out of a Software 3.0 workflow (use `code-review`)."
license: MIT
compatibility: "Provider- and runtime-agnostic. The autonomy-slider levels and quality-gate sequence apply to any LLM-coding harness (Claude Code, OpenCode, Cursor, Aider, Copilot Workspace, Continue) that supports a deterministic verify step between agent output and merge."
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: knowledge
  domain: ai-engineering/concepts
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-06"
  drift_check: "{\"last_verified\":\"2026-05-06\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"software 3.0 concepts\",\"vibe coding\",\"agentic engineering doctrine\",\"autonomy slider\",\"prompt as code\",\"karpathy three eras\",\"autoresearch loop\",\"ai-generated code quality\",\"vibe hangover\",\"llm-native development\",\"software 1.0 vs 2.0 vs 3.0\",\"natural language programs\",\"agent productivity metrics\",\"rework rate\",\"agent completion rate\",\"quality gates ai code\",\"autonomy levels coding\",\"ai code security regression\"]"
  examples: "[\"we keep accepting agent-generated code on first try and shipping bugs — what discipline replaces this?\",\"what autonomy level should I run for a security-sensitive change?\",\"does measuring lines-of-code per session make sense when an agent generates the code?\",\"the team is treating prompts and skill files like throwaway notes — what's the alternative framing?\",\"we want an auto-improve loop for our skill content — how do we constrain it so it doesn't regress?\",\"what's the conceptual difference between a vibe coding session and an agentic engineering session?\",\"AI-generated code is shipping with vulnerabilities — what gates should sit between agent output and production?\",\"how do I match autonomy level to the risk profile of the task?\"]"
  anti_examples: "[\"improve this specific prompt for the grader\",\"review this AI-generated PR for correctness\",\"design the checkpoint state machine for our loop\",\"scaffold a new skill that codifies our coding doctrine\",\"the autonomous loop is stalling — debug it\"]"
  relations: "{\"boundary\":[{\"skill\":\"prompt-craft\",\"reason\":\"prompt-craft is the per-prompt authoring discipline; ai-native-development is the meta-frame that explains why prompts are source code\"},{\"skill\":\"agent-engineering\",\"reason\":\"agent-engineering owns the production reliability discipline (orchestration, error budgets, observability); ai-native-development owns the conceptual model that motivates those concerns\"},{\"skill\":\"code-review\",\"reason\":\"code-review evaluates the AI-generated output; ai-native-development frames why that output exists and how to size the gates around it\"},{\"skill\":\"tool-call-strategy\",\"reason\":\"tool-call-strategy is the tactical layer for an agent's tool dispatch; ai-native-development is the conceptual layer above it\"}],\"related\":[\"prompt-craft\",\"agent-engineering\",\"code-review\",\"skill-router\"],\"verify_with\":[\"code-review\",\"testing-strategy\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":180,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v3
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/ai-native-development/SKILL.md
---

# AI-Native Development

## Coverage

The conceptual model for software development when an LLM participates in code creation. Specifically: Andrej Karpathy's three eras of software (1.0 explicit code / 2.0 learned weights / 3.0 natural-language programs); the vibe-coding-vs-agentic-engineering distinction and when each is appropriate; the 0–5 autonomy slider mapping task type and risk to the right level of agent independence; the AutoResearch improvement loop with its three constraints (one editable asset, one scalar metric, one time box); Software 3.0 productivity metrics that replace lines-of-code and commit-count for an LLM-assisted team; the documented security and quality regressions of ungated AI-generated code (the "vibe hangover") and the quality-gate sequence that compensates for them; and the operating principle that prompts, skill files, and agent-runtime configuration are _source code_ — versioned, reviewed, tested.

## Philosophy

A prompt is a program. A skill file is a library. An agent session is a runtime. This is not a metaphor; it is the literal operational model of an LLM-assisted codebase. The mistake teams make is treating these artifacts as ad-hoc notes — the same mistake early industry made with shell scripts before treating them as version-controlled software. AI-native development is the discipline of putting the same engineering rigor around prompts and skills that any team puts around production code: source control, code review, tests, contracts, observability.

The largest single failure mode at the team level is unintentional autonomy. Without an explicit framing, every agent session defaults to the _highest_ autonomy the harness allows, regardless of the task's risk. Vibe coding is not wrong — for a throwaway prototype it is correct. It is wrong as the _default_ for production code. The autonomy slider is the framing tool that lets a team decide _intentionally_ where on the slider any given task should run, and what gates compensate when autonomy goes up.

## 1. The Three Eras of Software

Karpathy named a structural shift in how programs are produced:

### Software 1.0 — Explicit code

Humans write instructions in a programming language. A compiler or interpreter executes them. Behavior is deterministic and fully auditable. Bugs are logic errors in code humans wrote.

```
Human writes code → compiler/interpreter runs code → output
```

### Software 2.0 — Learned programs

Humans curate data and pick an architecture. An optimizer trains weights. The trained network is the program. Behavior is probabilistic; auditability is partial (interpretability is an open problem). Bugs are distribution mismatches or training artifacts.

```
Human curates data + defines architecture → training → weights (the program) → output
```

### Software 3.0 — Natural-language programs

Humans write a specification in natural language. An LLM interprets the specification and produces behavior. The "code" is the prompt. Behavior is stochastic — the same prompt can produce different output across runs. Bugs are ambiguities in the prompt or gaps in the model's knowledge.

```
Human writes prompt → LLM interprets prompt → output
```

### The mapping

In Software 3.0 the prompt _is_ the program. Every traditional software-engineering concept has an analogue:

| Traditional concept | Software 3.0 equivalent                            |
| ------------------- | -------------------------------------------------- |
| Source code         | Prompt files, system prompts, skill specifications |
| Libraries           | Reusable skill files                               |
| Compiler            | LLM inference engine                               |
| Linker              | Skill-injector / context-loader                    |
| Runtime             | Agent session                                      |
| RAM                 | Context window                                     |
| Debugger            | Context-failure analysis                           |
| Tests               | Eval suites                                        |
| Version control     | Skill / prompt versioning + git                    |

Once the mapping is explicit, the engineering disciplines transfer: review the prompt the way you'd review a function; version the skill the way you'd version a library; eval the agent's output the way you'd run unit tests against a build.

## 2. Vibe Coding vs Agentic Engineering

"Vibe coding" was named by Karpathy (Feb 2025) for the practice of generating code by feel — describing what you want, accepting the output, iterating by vibes. It is the default mode of most AI-assisted development. Agentic engineering is the disciplined alternative: structured, verifiable, with quality gates at every step.

| Dimension       | Vibe coding                      | Agentic engineering                                          |
| --------------- | -------------------------------- | ------------------------------------------------------------ |
| Planning        | None — "just start coding"       | Explicit plan or task spec                                   |
| Specification   | Verbal / mental model            | Written contracts (acceptance criteria, ADRs, skill files)   |
| Code generation | Accept first output              | Generate → verify → iterate                                  |
| Review          | Skim the diff                    | Automated gates (lint, type-check, tests) + human spot-check |
| Quality         | "Does it look right?"            | Measurable criteria (evals pass, CI green)                   |
| Knowledge       | Lost between sessions            | Captured (skills, memory, ADRs, decision records)            |
| Reproducibility | Low — depends on prompt phrasing | High — same skill content produces same behavior             |
| Security        | "It probably works"              | Explicit security review; threat model considered            |
| Scale           | Fits small prototypes            | Fits production systems with multiple agents                 |

### When vibe coding is the right tool

Vibe coding is correct for: throwaway prototypes, personal scripts with no users, learning a new library by playing with it, design exploration before committing to an approach.

### When vibe coding is the wrong tool

Vibe coding is wrong for: production code, financial calculations, security-sensitive logic (auth, authorization, data handling), shared codebases where other developers or agents will maintain the code.

## 3. The Autonomy Slider

Agent autonomy exists on a spectrum, not a binary. The right level depends on three inputs: task type, quality of available context, and consequences of failure.

### Levels

| Level | Name                    | Human role                                | Agent role                             | Example                                   |
| ----- | ----------------------- | ----------------------------------------- | -------------------------------------- | ----------------------------------------- |
| 0     | Manual                  | Writes all code                           | None                                   | Traditional development                   |
| 1     | Suggestion              | Reviews suggestions, accepts/rejects      | Suggests completions                   | Inline tab-completion                     |
| 2     | Drafting                | Reviews drafts, edits before commit       | Generates complete drafts from prompts | "Write a component that does X"           |
| 3     | Implementing            | Reviews finished work, runs gates         | Implements full features, writes tests | Agent completes one ticket end-to-end     |
| 4     | Autonomous + spot-check | Spot-checks via session summary           | Implements, tests, documents, commits  | Multi-task queue worked independently     |
| 5     | Fully autonomous        | Monitors metrics, intervenes on anomalies | Prioritize, implement, verify, deploy  | Theoretical — not yet safe for production |

### Autonomy by task type

| Task type                   | Recommended level | Why                                                |
| --------------------------- | ----------------- | -------------------------------------------------- |
| Bug fix with failing test   | 4                 | Clear acceptance criteria; low ambiguity           |
| New feature implementation  | 3                 | Architectural decisions need human review          |
| Codebase audit              | 4                 | Research; agent investigates autonomously          |
| Security-sensitive change   | 2                 | High consequences; human must verify               |
| Financial calculation logic | 2–3               | Monetary consequences; careful review needed       |
| Documentation update        | 4                 | Low risk; agent verifies against source            |
| UI / visual implementation  | 3                 | Visual judgment; screenshot review required        |
| Refactor with green tests   | 3–4               | Tests guard correctness; scope review still needed |
| Production deployment       | 1                 | High consequences; human controls the process      |

### Autonomy prerequisites

Higher autonomy requires better infrastructure. The slider is not a free parameter; moving it up requires the supporting controls.

| Level | Required infrastructure                                                                                                          |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| 2     | Prompt quality, basic type checking                                                                                              |
| 3     | Automated tests, CI pipeline, skill system, code review                                                                          |
| 4     | Tripwire guardrails on destructive operations, structured session-summary protocol, persistent memory, eval suite, model routing |
| 5     | Self-healing, anomaly detection, automatic rollback, comprehensive evals, runtime observability                                  |

A team that runs at level 4 without the level-4 infrastructure is not "moving fast"; it is shipping at level 4 with level-2 safety, and the gap will surface as production incidents.

## 4. The AutoResearch Loop

Karpathy's `autoresearch` pattern is the simplest reliable shape for autonomous agent improvement work:

```
LOOP:
  1. Modify one thing (code, config, parameter, prompt)
  2. Run the experiment (execute, measure)
  3. Check: did the metric improve?
       YES → keep the change, continue
       NO  → revert the change, try something else
  4. Repeat until the time box expires
```

### The three constraints

The loop works because of what it forbids, not what it allows:

1. **One editable asset** — agent can modify one file, one function, or one parameter set. No cascading multi-file edits in a single iteration. Prevents diffuse failure.
2. **One scalar metric** — success is one number (accuracy, latency, score, cost). Prevents the "improved on A but regressed B and we didn't notice" failure.
3. **One time box** — the loop runs for a fixed duration. Prevents infinite exploration on a problem the loop won't solve.

### When to use AutoResearch vs manual iteration

| Situation                                      | AutoResearch                   | Manual                     |
| ---------------------------------------------- | ------------------------------ | -------------------------- |
| Optimizing a measurable metric                 | Yes                            | No                         |
| Exploring design alternatives with a judge     | Yes (with judge as the metric) | Also fine                  |
| Implementing a specified feature               | No                             | Yes                        |
| Debugging a specific bug with known root cause | No                             | Yes                        |
| Tuning a prompt against an eval set            | Yes                            | Also fine                  |
| Performance optimization with a clear metric   | Yes                            | If the metric is composite |

### Common failure modes

- **Multi-axis edits.** The agent edits two files in one iteration; the metric improves; you don't know which edit caused it. Solution: enforce one-asset programmatically.
- **Metric drift.** The metric the loop optimizes is not the metric you actually care about. Solution: validate the metric on a held-out set before starting the loop.
- **No time box.** The loop runs indefinitely against a problem the loop can't solve. Solution: hard limit; manual review at expiry.

## 5. Software 3.0 Productivity Metrics

Traditional software metrics — lines of code, commits per day, velocity points — are meaningless when an agent can produce 10,000 lines in five minutes. The question is not how much was produced; it is whether what was produced was correct.

### Metrics that matter

| Metric                             | What it measures           | Direction                                                               |
| ---------------------------------- | -------------------------- | ----------------------------------------------------------------------- |
| Tasks completed per session        | Throughput                 | Higher better                                                           |
| Agent completion rate              | Autonomy quality           | Higher better — % of tasks finished without human intervention          |
| Rework rate                        | Output quality             | Lower better — % of tasks that needed human correction                  |
| Time-to-value                      | Idea → working feature     | Decreasing trend                                                        |
| Skill / context-injection accuracy | Context engineering health | Higher precision and recall                                             |
| Eval pass rate                     | Skill-content correctness  | Higher better                                                           |
| Context-failure rate               | Agent reliability          | Lower better — % of tasks where agent went wrong because of bad context |

### Metrics that don't matter

| Metric                   | Why it's misleading                                      |
| ------------------------ | -------------------------------------------------------- |
| Lines of code generated  | Quantity is free; quality isn't                          |
| Commits per day          | More commits ≠ more value                                |
| Files changed            | Breadth says nothing about correctness                   |
| Time spent coding        | The constraint is not coding time; it is human attention |
| Number of agents running | More agents can mean more noise, not throughput          |

### The productivity equation

```
productivity ≈ (tasks completed × quality score) / human attention consumed
```

The goal is to grow the numerator while shrinking the denominator. "Getting better at AI-native development" is the operational definition of moving this ratio in the right direction over time.

## 6. The Vibe Hangover — Quality Gates as Compensation

The rapid adoption of AI-assisted coding has produced measurable quality regressions. This data grounds the case for agentic engineering and gates over vibe coding.

### Reported findings

| Source                                | Finding                                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Stanford / Microsoft study (2024)     | AI-assisted developers believe their code is more secure, but the code is ~1.7× more likely to contain security vulnerabilities |
| GitClear (2025)                       | AI-generated code shows ~2.74× higher vulnerability rate than human-written equivalents                                         |
| OWASP AI Security Guide (2024–25)     | New attack surface: prompt injection, training-data poisoning, model manipulation                                               |
| Snyk State of AI Code Security (2025) | ≥56% of surveyed developers report at least one AI-introduced vulnerability reaching production                                 |

These numbers will move; the structural reason will not. AI-generated code has more vulnerabilities because:

1. **Training-data bias.** Models learn from public repos that include vulnerable code; popular patterns are not necessarily secure patterns.
2. **Missing context.** The model does not know the deployment environment, threat model, or compliance requirements unless explicitly told.
3. **Acceptance bias.** Developers scrutinize AI-generated code less than code they wrote themselves ("it looks reasonable").
4. **Speed-vs-security trade-off.** Faster output encourages faster acceptance. Security review is slow and feels like friction.

### The compensating gates

The defence is mandatory verification between every agent action and production:

```
Agent generates code
      │
      ▼
[Gate 1] Type checking
      │
      ▼
[Gate 2] Lint / style / safety rules
      │
      ▼
[Gate 3] Automated tests (unit + integration)
      │
      ▼
[Gate 4] Security scanning (deps, secrets, known CVEs)
      │
      ▼
[Gate 5] Design / visual review (for UI changes)
      │
      ▼
[Gate 6] Human spot-check (for autonomy < 5)
      │
      ▼
Production
```

**Rule:** no gate may be skipped under speed pressure. An agent that passes all gates is trustworthy on this change. An agent that bypasses gates is a liability regardless of how good the diff looks.

The gates are also the _justification_ for higher autonomy. Without the gates, level 4 is reckless. With the gates, level 4 is responsible.

## 7. Operating Position

A team can name its current operating point on the autonomy slider explicitly. Most production-LLM teams sit between **level 3 and level 4**: agents implement complete features end-to-end, run quality gates locally, and the human reviews the completed work via a structured session summary or PR rather than line-by-line as it is being written.

Moving up the slider over time is a deliberate engineering project: each step requires the supporting infrastructure to move with it (eval suites, tripwire guardrails on destructive operations, persistent memory across sessions, model-routing logic for matching tasks to model strengths). A team that drifts upward without that infrastructure is drifting toward a regression event, not toward higher productivity.

Moving down the slider is also legitimate: high-stakes work (production deployment, security-sensitive logic, irreversible data operations) should run at lower autonomy regardless of the team's overall position. The slider is a per-task setting, not a team-wide setting.

## Verification

- [ ] Prompts and skill specifications are treated as source code — versioned in git, reviewed before merge, covered by evals where useful
- [ ] Every agent session operates at an _intentional_ autonomy level chosen for the task's risk, not the harness's default
- [ ] Quality gates exist between agent output and production: type check, lint, automated tests, security scan, plus a human spot-check while autonomy is < 5
- [ ] Productivity is measured by outcomes (tasks completed, rework rate, time-to-value), not by output volume (LoC, commit count)
- [ ] Knowledge is captured durably (skill files, decision records, structured session summaries) rather than lost between sessions
- [ ] Auto-improve loops are constrained per the AutoResearch pattern — one editable asset, one scalar metric, one time box
- [ ] Security regressions known to come from AI-generated code (data exposure, weak auth, accepted-but-vulnerable patterns) are explicitly mitigated by the gate stack
- [ ] Vibe-coding patterns are limited to throwaway prototypes; production work runs as agentic engineering
- [ ] The team can answer "what is our current autonomy level on this task?" without ambiguity, and the answer is justified by the task's risk profile

## Do NOT Use When

| Use instead          | When                                                                                                                                                              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prompt-craft`       | Authoring or improving a specific prompt — the per-prompt discipline below this skill's conceptual frame                                                          |
| `agent-engineering`  | Designing the production-reliability layer for an agent system: orchestration patterns, error budgets, observability, fault tolerance                             |
| `code-review`        | Reviewing the AI-generated code that comes out of a Software 3.0 workflow — this skill frames _why_ the review is needed; code-review is _how_ the review is done |
| `tool-call-strategy` | The tactical layer of which tool an agent should call when, in what order, with what fallback                                                                     |
| `skill-router`       | The cross-skill dispatch decision (which skill activates for a query) — this skill is meta about _why_ a skill library exists at all                              |
| `debugging`          | An autonomous loop has stalled, regressed, or is producing wrong output and you need to chase the root cause                                                      |
