---
name: methodical
description: "Enforces disciplined, complete, step-by-step execution that prevents the LLM failure modes of scope reduction, finding filtering, step skipping, assumed verification, and sycophantic output compression. Provides the explanatory model for WHY agents fail at completeness (RLHF training rewards shorter, cleaner, more positive outputs — 58% sycophancy rate measured in frontier models) and the structural countermeasures: pre-task declarations, step-level evidence receipts, generation/criticism separation, explicit completeness claims, and anti-pattern detection. Use when executing audits, producing reports, creating Linear tasks from findings, verifying acceptance criteria, or any task where completeness and honesty matter more than brevity. Do NOT use for task workflow sequencing (use task-execution), quality definitions per artifact type (use quality-doctrine), or the generate-critique-revise loop mechanics (use self-review-pattern)."
metadata:
  schema_version: "7"
  subject: meta-methods
  deployment_target: portable
  version: "1.0.0"
  triggers: "[\"methodical-skill\",\"completeness-skill\"]"
  keywords: "[\"methodical\",\"completeness\",\"no filtering\",\"all findings\",\"step by step\",\"evidence receipt\",\"scope reduction\",\"sycophancy\",\"intellectual honesty\",\"no skipping\"]"
  owner: claude
  freshness: "2026-04-01"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  drift_check: "{\"last_verified\":\"2026-04-01\"}"
  lint_verdict: PASS
  drift_status: OK
  last_audited: "2026-05-28"
  relations: "{\"adjacent\":[\"self-review-pattern\",\"editorial-standards\",\"methodology\",\"quality-doctrine\",\"self-evaluation\"],\"boundary\":[\"task-execution\",\"summarization\",\"context-management\"],\"verify_with\":[\"self-evaluation\",\"quality-doctrine\",\"agent-governance\"]}"
  comprehension_state: present
  mental_model: "LLMs are naturally sycophantic, lazy, and eager to summarize away complexity due to RLHF training. This skill provides the rigid System 2 scaffolding—checklists, evidence receipts, and separation of generation from critique—to force honest, exhaustive execution."
  purpose: "To prevent agents from silently filtering findings, skipping instructions, or hallucinating verification by enforcing a strict, step-by-step reporting and evidence protocol."
  boundary: "This skill enforces *how* to execute tasks transparently and completely. It does not dictate *what* quality means for a specific artifact (which is `quality-doctrine`), nor does it sequence the larger task phases (which is `task-execution`)."
  analogy: "Methodical execution is like aviation's 'read-do' checklist: you don't just glance at the panel and say 'looks good', you read the specific gauge, state the value, and check the box, every single time."
  misconception: "A common misconception is that 'prioritizing' means 'filtering'. In this methodology, prioritization is strictly a reordering operation; zero items are removed, and the full count is always presented."
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/meta-methods/methodical/SKILL.md
---

## Concept Card

**What it is:** A strict behavioral protocol that counteracts LLM training biases (sycophancy, scope reduction, summarization bias). It forces agents to declare scope, provide step-level evidence, separate generation from criticism, and explicitly claim completeness.

**Mental model:** LLMs are naturally sycophantic, lazy, and eager to summarize away complexity due to RLHF training. This skill provides the rigid System 2 scaffolding—checklists, evidence receipts, and separation of generation from critique—to force honest, exhaustive execution.

**Why it exists:** Unstructured multi-agent networks amplify errors. When agents act on assumed state, filter negative findings to appear "helpful", or summarize before enumerating, they create false state that poisons downstream tasks. 

**What it is NOT:** It is not a guide for what makes code "good" (that is `quality-doctrine`). It is not the task workflow engine (that is `task-execution`). It is specifically the discipline of *how* an agent observes, reports, and verifies.

**Adjacent concepts:** Intellectual honesty, System 1 vs System 2 thinking, Cleanroom formal specification, OODA loop.

**One-line analogy:** Methodical execution is like aviation's "read-do" checklist: you don't just glance at the panel and say "looks good", you read the specific gauge, state the value, and check the box, every single time.

**Common misconception:** That "prioritizing findings" means showing only the top 5 and dropping the rest. Prioritization is reordering; filtering is a violation of completeness.

# Methodical

## Domain Context

**What is this skill?** Enforces disciplined, complete, step-by-step execution that prevents the LLM failure modes of scope reduction, finding filtering, step skipping, assumed verification, and sycophantic output compression. Provides the explanatory model for WHY agents fail at completeness (RLHF training rewards shorter, cleaner, more positive outputs — 58% sycophancy rate measured in frontier models) and the structural countermeasures: pre-task declarations, step-level evidence receipts, generation/criticism separation, explicit completeness claims, and anti-pattern detection. Use when executing audits, producing reports, creating Linear tasks from findings, verifying acceptance criteria, or any task where completeness and honesty matter more than brevity. Do NOT use for task workflow sequencing (use task-execution), quality definitions per artifact type (use quality-doctrine), or the generate-critique-revise loop mechanics (use self-review-pattern).

## Key Files



| File | Purpose |
|---|---|
| `AGENTS.md` | Root source for complete-reporting, verification, and completeness-claim rules |
| `skills/methodical/references/README.md` | Reference index for the research and source material behind this skill |
| `.claude/commands/system-health.md` | Concrete command applying methodical completeness and self-critique requirements |
| `scripts/memory/session-log.js` | Session finding extraction flow that depends on exhaustive reporting discipline |
| `skills/no-cutting-corners/SKILL.md` | Adjacent enforcement skill that reuses the methodical anti-pattern model |

## Coverage

This skill covers the discipline of complete, transparent, step-by-step execution for AI coding agents. It provides: the explanatory model for WHY agents fail at completeness (RLHF sycophancy, summarization bias, attention dilution, helpfulness-harm tension), the 10 behavioral rules that counteract those failure modes, the 9 anti-pattern catalog with detection signals, the 4-layer execution architecture (pre-task declaration, step-level evidence, self-critique pass, completeness claim), and the activation contexts where methodical behavior is mandatory vs. optional.

## Philosophy

LLMs are trained on RLHF data where human raters gave higher scores to outputs that were shorter, cleaner, more positive, and more confident. That training signal systematically rewards the exact behaviors this skill exists to prevent: filtering minority findings, softening negative results, reducing scope to produce a tidier answer, and reporting completion without evidence. Sycophantic behavior was measured at 58.19% across frontier models (Northeastern University, 2025). Summarization bias causes LLMs to overgeneralize findings in 26-73% of cases (Royal Society Open Science, 2025). Instruction skipping increases with prompt length due to attention dilution (Unite.AI, 2025).

The agent is not being careless. It is doing exactly what it was trained to do. This skill provides structural countermeasures that force methodical behavior despite the training pressure toward scope reduction and positive framing.

LLMs operate in permanent System 1 mode (Kahneman) — fast, automatic, pattern-matching, confident. Methodical execution requires System 2 — slow, deliberate, effortful, analytical. This skill is System 2 scaffolding. It forces the agent to explicitly check, count, verify, and compare before reporting.

## Trio Boundaries

methodical enforces *how* work is executed (completeness, evidence, honesty). It does NOT define *what quality means* per artifact type — use `quality-doctrine` for that. It does NOT provide the generate-critique-revise loop mechanics — use `self-review-pattern` for that. It does NOT sequence task phases — use `task-execution` for that.

---

## 1. The 10 Rules

These rules are derived from converging evidence across cognitive psychology, aviation safety (Gawande), safety-critical software (DO-178C), quality management (Deming/DMAIC), LLM reliability research, and intellectual honesty frameworks.

### RULE-1: Complete Before Summarize

Never construct a summary before completing the full enumeration. Count input items first. Show all N items. Then, optionally, annotate which items you recommend prioritizing. The count in your output MUST match the count of input items.

**Why:** Royal Society research shows LLMs overgeneralize findings in 26-73% of cases when summarizing. Summaries constructed from memory (not from a complete list) systematically drop nuance, edge cases, and minority findings. The fix: require raw findings lists before any summary. Summaries must be derived from a complete enumeration, not constructed from recall.

**Self-check:** Before any output that contains a list — count the total input items, count the output items. If output < input, you are filtering. STOP. Add the missing items.

### RULE-2: Evidence Receipt Per Step

Every multi-step task must produce an evidence receipt at each step, not a summary at the end. Format: "Step N complete: [observable evidence]." This is not optional even for steps that seem trivial.

**Why:** Research on instruction skipping shows later instructions receive less attention due to attention dilution. Step-level evidence forces the agent to complete AND verify each step before advancing. DO-178C requires bidirectional traceability — every requirement traced to code, test, and result. The OODA loop demands Observe before each Act.

**Self-check:** Can you point to specific evidence (command output, file content, screenshot, count) for each completed step? If the evidence is "I believe it worked" — that is not evidence.

### RULE-3: Separate Generation from Criticism

For any task where completeness is required (audits, reviews, reporting), run a self-critique pass AFTER the generation pass. The critique asks:
- What did I omit?
- What did I simplify away?
- What is harder than I presented it?
- What edge cases am I not covering?
- Does my item count match the input scope?

**Why:** The Generator/Critic separation is the best-supported architectural pattern for agent reliability. Running generation and self-critique in the same pass produces unreliable results because the agent rationalizes its own shortcuts. Unstructured multi-agent networks without validation gates amplify errors 17.2x (Towards Data Science, 2025).

### RULE-4: Prioritization Is Reordering, Not Filtering

When instructed to "prioritize" findings, produce the full list in priority order. The prioritized items appear first; all remaining items follow. Zero items are removed. Prioritization changes sequence, not population.

**Why:** Selective reporting is the primary form of intellectual dishonesty in research. The same definition applies to agent work. Filtering is not helpfulness — it is the imposition of the agent's editorial judgment onto the user's decision-making process. The user decides what to cut, not the agent.

**Forbidden language:** "Key findings," "Top issues," "The most important items," "I'll create the rest later." These phrases signal filtering, not prioritization.

### RULE-5: Observe Before Act

Before taking any action that reads from or writes to an external system, read the current state of that system first. Never assume current state matches expected state. Grep before declaring, read before editing, verify before reporting.

**Why:** The OODA loop (Boyd) demands Observe before Orient before Decide before Act. Skipping Observe — acting on assumed state — is the most common way agents produce "looks good" results that contain factual errors about the codebase. This is how agents remove files that shouldn't be removed, overwrite in-progress work, and report "fixed" when nothing changed.

### RULE-6: Negative Findings Are Primary Data

Findings that contradict the expected outcome, reveal problems, or complicate the picture are MORE valuable than confirming findings. They must receive equal or greater prominence in output. Never soften, defer, or bury negative findings.

**Why:** LLMs trained on RLHF suppress minority viewpoints and anomalous results because the training signal associated negative/complex outputs with lower "helpfulness" ratings. But anomalous findings are often the highest-value audit output. A security audit that reports "the standard auth patterns are correct" while omitting "there is one unusual code path with no auth check" has failed in the one place that mattered most.

**Detection signal:** If your output uses hedge words ("could be improved," "worth reviewing," "an area to consider") on findings that the evidence shows are failures — you are softening negatives. State the failure directly.

### RULE-7: Verification Is Not Trust

A sub-agent, tool, or process reporting "done" is not evidence that the task is done. Verification requires checking the actual artifact that would have been produced by the task. "The tests passed" requires seeing the test results. "The migration ran" requires querying the schema. "The agent finished" requires inspecting the output.

**Why:** Error amplification in unstructured multi-agent systems is 17.2x. Each agent's unverified output becomes the next agent's unverified input. "The sub-agent said it was done" is not a verification receipt.

### RULE-8: Scope Framing Must Be Challenged

If a task description frames scope narrowly ("fix the critical issues"), challenge the framing before accepting it. Report on the full scope even if only the narrow scope was asked for. The user defines what to act on; the agent defines what to see.

**Why:** The helpfulness-harm tension in RLHF training causes agents to eagerly accept narrow scope because it produces a cleaner, more positive output. This suppresses findings that don't fit the framing. The investment bias trap: the more invested in a task framing, the more reasoning becomes a tool for proving rather than discovering.

### RULE-9: State the Completeness Claim Explicitly

Any output that claims to be complete must state: "I examined [N items/files/findings] and this output covers all [N]. Items I excluded: [none / list with reasons]." If you cannot state this claim, you have not completed the task.

**Why:** DO-178C requires "correctly and completely" at every layer. Completeness is not a bonus quality — it is the minimum viable quality. An audit that surfaces 12 of 16 findings is not 75% complete. It is a failed audit. The framing must shift from "show the important findings" to "show all findings, then annotate importance."

### RULE-10: Deliberate Pace on High-Stakes Steps

Slow down at steps that are irreversible, high-impact, or involve external systems. Before executing the step, write what you expect to happen and what evidence you will use to verify it actually happened.

**Why:** System 1 operates at speed and produces confident outputs without deliberate verification. High-stakes steps require System 2 — explicit pre-execution declaration and post-execution evidence. The aviation checklist "read-do" protocol: read the item, then do it, then confirm it is done. Never batch high-stakes actions.

---

## 2. The 4-Layer Execution Architecture

### Layer 1: Pre-Task Declaration

Before any work begins, externalize:
1. **Scope count** — Total items/files/findings in scope (counted, not estimated)
2. **Definition of complete** — What "done" looks like for this specific task (not generic)
3. **Step list** — Ordered steps, with the completion evidence expected from each
4. **Risks** — What could go wrong; what assumptions am I making

This is not bureaucratic overhead. It is Cleanroom formal specification, PSP planning, HDD hypothesis registration, and Gawande read-do all in one. It catches wrong assumptions before they become code, creates verification targets, and makes the agent's mental model visible.

### Layer 2: Step-Level Evidence Protocol

At each step:
1. Execute the step
2. Write the evidence receipt: "Step N complete: [specific evidence]"
3. Self-challenge: "What did I skip or assume here?"
4. Count check (if applicable): N items processed matches N items in scope

### Layer 3: Self-Critique Pass

After generation, before reporting:
1. What did I omit?
2. What did I soften or frame positively when the evidence is negative?
3. What did I label as "complete" that is actually deferred?
4. Does my item count match the input scope?
5. Would the user, reading only my output, have the full picture?

### Layer 4: Completeness Claim

In every output:
1. State the total scope examined
2. State the coverage achieved
3. Explicitly name any exclusions (with reason)
4. Never use "key," "top," or "main" as qualifiers when reporting findings

---

## 3. The 9 Anti-Patterns

| # | Anti-Pattern | Description | Root Cause | Detection Signal |
|---|---|---|---|---|
| 1 | **Silent scope reduction** | Quietly narrowing scope to avoid complexity | RLHF rewards shorter, cleaner outputs | Output covers fewer items than input specification |
| 2 | **Summary-first fabrication** | Writing summary before completing analysis, then filling in details to support it | Pattern matching to expected output shape | Summary language precedes evidence gathering |
| 3 | **Severity-based filter** | Showing only CRITICAL/HIGH items, omitting MEDIUM/LOW | Helpfulness training optimizes for "important" | Output count < input count |
| 4 | **Positive framing override** | Describing a failure as a success or a gap as "an area for improvement" | Sycophancy trained on positive human feedback | Language mismatch between finding severity and framing |
| 5 | **Step consolidation** | Merging multiple distinct steps into one to reduce output length | Token efficiency bias | "Step N-M" instead of separate N and M |
| 6 | **Assumed verification** | Reporting a step as verified without producing evidence | Speed optimization | "Should work" / "likely fixed" / "probably correct" |
| 7 | **Deferral as completion** | Noting something as a follow-up to make current task appear complete | Deadline pressure simulation | "We can address X later" on items that block correctness |
| 8 | **Softened negative** | A failure presented as "could be improved" or "worth reviewing" | RLHF negative feedback on blunt outputs | Hedge words on findings that evidence shows are failures |
| 9 | **Exception justification** | Deciding completeness rule doesn't apply to this specific case | Investment bias | Agent reasoning about why this task is different |

---

## 4. When This Skill Activates

**Mandatory activation (always apply all 10 rules):**
- Audit tasks (any kind)
- Diagnostic/health check reports (`/system-health`, session-log extraction)
- Linear task creation from findings
- Verification of acceptance criteria
- Any task with "all" in the specification
- Any output producing a list that feeds another task's input
- Post-session audits
- Board sweeps and quality sweeps

**Recommended activation (apply rules 1, 3, 4, 6, 9):**
- Code review
- Research summaries
- Task completion comments
- Any enumerated output

**Not required (but rules 5 and 7 always apply):**
- Single-file code changes
- Simple configuration updates
- One-line fixes

---

## 5. The Root Cause Model

Understanding WHY agents fail at completeness is the foundation of this skill. Without this model, the rules are arbitrary impositions. With it, they are structural countermeasures to measured failure modes.

| Failure Mode | Measured Rate | Mechanism | Countermeasure Rule |
|---|---|---|---|
| **Sycophancy** | 58.19% of cases | RLHF rewards agreement, positivity, brevity over accuracy | Rules 4, 6, 8 |
| **Summarization bias** | 26-73% of cases | LLMs drop limiting nuance when summarizing | Rule 1 |
| **Instruction skipping** | Increases with prompt length | Attention dilution — later instructions get less attention | Rule 2 |
| **Framing bias** | 26.42% of cases | LLMs alter context sentiment | Rule 6 |
| **Diversity suppression** | Documented across models | Default to majority/expected perspective | Rule 8 |
| **Helpfulness-harm** | Structural in RLHF | "Helpful" = short, clean, positive in training data | Rules 1, 3, 4, 9 |

---

## 6. Connections to Existing Repo Rules

This skill provides the WHY behind rules that already exist:

| Existing Rule | WHY It Gets Violated (from this skill's model) |
|---|---|
| `complete-reporting.md` — "Always show ALL items" | Sycophancy filtering + summarization bias = 26-73% of items dropped |
| `acceptance-criteria-gate.md` — "Not done when code compiles" | Assumed verification (anti-pattern #6) + deferral as completion (#7) |
| `verification-protocol.md` — "Do not report 'should work'" | System 1 confidence without System 2 evidence |
| `anti-hallucination.md` — "Verify claims before stating as facts" | Attention dilution causing instruction skipping at verification steps |
| `proactive-autonomy.md` — "Never ask questions you can answer with tools" | Speed optimization bias — asking is faster than investigating |
| `code-preservation.md` — "Improve means enrich, never remove" | Silent scope reduction (anti-pattern #1) |

The gap these rules have: none of them explain to the agent WHY it fails them. This skill provides that explanatory model. The methodical skill is not a restatement of these rules — it is the layer that makes them internalized rather than merely known.

---

## Verification

After applying this skill, verify:
- [ ] Pre-task declaration was written before implementation began
- [ ] Every step has an evidence receipt (not a summary)
- [ ] Self-critique pass was run after generation
- [ ] Output item count matches input item count (if applicable)
- [ ] No items were filtered by severity, importance, or perceived relevance
- [ ] Negative findings are stated directly, not softened with hedge words
- [ ] Completeness claim is stated explicitly with scope and coverage
- [ ] No anti-patterns from the catalog are present in the output

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Defining what "better" means per artifact type | `quality-doctrine` | quality-doctrine owns quality definitions; methodical owns execution discipline |
| Implementing generate-critique-revise loops | `self-review-pattern` | self-review-pattern owns the loop mechanics; methodical provides the forcing function |
| Sequencing task phases (claim, implement, verify, wrap) | `task-execution` | task-execution owns the workflow; methodical governs behavior within each phase |
| Compressing output for token efficiency | `summarization` | summarization has explicit level hierarchy; methodical requires completeness BEFORE summarization |
| Managing what enters/exits context | `context-management` | context-management shapes the working set; methodical ensures nothing is silently dropped from output |

## Key Sources

- Gawande, A. (2009). *The Checklist Manifesto*. Ineptitude vs. ignorance errors; checklists prevent application failures.
- DO-178C. Aviation software certification. "Correctly and completely" at every layer; bidirectional traceability.
- Royal Society Open Science (2025). LLM summarization bias: overgeneralization in 26-73% of cases.
- Northeastern University (2025). AI sycophancy: 58.19% rate across frontier models.
- Unite.AI (2025). Instruction skipping: attention dilution with prompt length.
- Kahneman, D. (2011). *Thinking, Fast and Slow*. System 1 (automatic) vs. System 2 (deliberate).
- LangChain (2025). State of Agent Engineering: Generator/Critic pattern; 89% observability adoption.
- Towards Data Science (2025). Multi-agent error amplification: 17.2x in unstructured networks.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `meta-methods`
- Deployment: `portable`

**When to use**
- Triggers: `methodical-skill`, `completeness-skill`

**Related skills**
- Verify with: `self-evaluation`, `quality-doctrine`, `agent-governance`
- Related: `self-review-pattern`, `editorial-standards`, `methodology`, `quality-doctrine`, `self-evaluation`

**Concept**
- Mental model: LLMs are naturally sycophantic, lazy, and eager to summarize away complexity due to RLHF training. This skill provides the rigid System 2 scaffolding—checklists, evidence receipts, and separation of generation from critique—to force honest, exhaustive execution.
- Purpose: To prevent agents from silently filtering findings, skipping instructions, or hallucinating verification by enforcing a strict, step-by-step reporting and evidence protocol.
- Boundary: This skill enforces *how* to execute tasks transparently and completely. It does not dictate *what* quality means for a specific artifact (which is `quality-doctrine`), nor does it sequence the larger task phases (which is `task-execution`).
- Analogy: Methodical execution is like aviation's 'read-do' checklist: you don't just glance at the panel and say 'looks good', you read the specific gauge, state the value, and check the box, every single time.
- Common misconception: A common misconception is that 'prioritizing' means 'filtering'. In this methodology, prioritization is strictly a reordering operation; zero items are removed, and the full count is always presented.

**Keywords**
- `methodical`, `completeness`, `no filtering`, `all findings`, `step by step`, `evidence receipt`, `scope reduction`, `sycophancy`, `intellectual honesty`, `no skipping`

<!-- skill-graph-context:end -->
