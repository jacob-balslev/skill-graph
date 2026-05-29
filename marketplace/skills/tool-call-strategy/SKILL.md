---
name: tool-call-strategy
description: "Use when an agent is making too many tool calls, when context is filling from verbose tool outputs, when the same operation could be a script instead of N individual calls, or when designing a tool-use protocol for a new agent or harness. Covers the three costs of every call (token, latency, context pollution), the script-vs-call decision gate, tool-selection decision trees (file-search vs content-search vs targeted-read vs full-read), call batching and parallelization, redundancy avoidance, the poka-yoke principle, subagent delegation for context protection, and cost-benchmark heuristics by task type. Do NOT use for prompt wording (use `prompt-craft`), broader context stack design across the five layers (use `context-engineering`), runtime tool failures or production debugging (use `debugging`), or behaviour-preserving refactor mechanics (use `refactor`). Do NOT use for improve this prompt's wording to get better outputs. Do NOT use for design what skills get loaded for which prompts."
license: MIT
compatibility: "Provider-agnostic; abstract tool capabilities map to concrete tools across Claude Code, Cursor, Copilot, OpenCode, Aider, Continue. Specific tool names in this skill (read_file, grep_search, run_in_terminal, apply_patch) are concrete examples — substitute the equivalent in your harness."
allowed-tools: Read Grep Bash Edit
metadata:
  schema_version: "8"
  version: "1.1.0"
  subject: code-engineering
  deployment_target: portable
  taxonomy_domain: ai-engineering/tool-use
  owner: skill-graph-maintainer
  freshness: "2026-05-18"
  drift_check: "{\"last_verified\":\"2026-05-18\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"tool call optimization\",\"reduce tool calls\",\"too many tool calls\",\"script vs tool call\",\"batching tool calls\",\"parallel tool calls\",\"parallelize calls\",\"independent calls\",\"redundant reads\",\"re-reading file\"]"
  examples: "[\"the agent made 17 read_file calls when 3 greps would have done — what should it have done?\",\"we're renaming a variable across 40 files — script or tool calls?\",\"the agent re-reads the same file three times in one task — fix the policy\",\"should I batch these reads into one message or wait for each result?\",\"design a tool-use protocol for our new agent harness — what rules matter?\",\"the context window is filling with verbose terminal output — how do I cut it?\",\"is it worth delegating this exploratory search to a subagent?\",\"what's a reasonable tool-call budget for a single-file bug fix?\"]"
  anti_examples: "[\"improve this prompt's wording to get better outputs\",\"design what skills get loaded for which prompts\",\"the test suite is failing after my change — find the cause\",\"extract this repeated string-concat into a helper function\",\"scaffold a new SKILL.md for our team's tool-use rules\",\"review this AI-generated PR for correctness\"]"
  relations: "{\"boundary\":[{\"skill\":\"context-engineering\",\"reason\":\"context-engineering designs the entire information stack reaching the model; tool-call-strategy owns the per-call efficiency decisions inside that stack\"},{\"skill\":\"prompt-craft\",\"reason\":\"prompt-craft writes the wording of one instruction; tool-call-strategy decides which external operations the agent should invoke around that instruction\"},{\"skill\":\"debugging\",\"reason\":\"debugging chases a specific runtime failure; tool-call-strategy is about the efficiency profile of healthy tool use\"},{\"skill\":\"refactor\",\"reason\":\"refactor owns behaviour-preserving code transformations as the deliverable; tool-call-strategy decides whether to deliver that transformation through 50 tool calls or one script\"}],\"related\":[\"context-engineering\",\"refactor\",\"prompt-craft\"],\"verify_with\":[\"code-review\"]}"
  grounding: "{\"subject_matter\":\"Efficient tool-call strategy for LLM coding agents\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"https://developers.openai.com/api/docs/guides/function-calling\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context\",\"https://github.com/jacob-balslev/skills/blob/main/skills/tool-call-flow/SKILL.md\",\"https://github.com/jacob-balslev/skills/blob/main/skills/context-engineering/SKILL.md\"],\"failure_modes\":[\"tool_call_minimization_without_verification\",\"serial_calls_when_parallel_independent\",\"shell_bulk_work_without_reviewable_diff\",\"verbose_outputs_pollute_context\",\"same_result_refetched_from_conversation\"],\"evidence_priority\":\"equal\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  mental_model: "Tool-call strategy is the query planner for an agent's external actions. Treat every call as an expensive, stateful evidence-acquisition operation with three costs: latency, tokens, and context pollution. The goal is sufficient evidence with minimum noise: pick the narrowest tool that can answer the question, batch independent calls, keep dependent calls sequential, use scripts for deterministic bulk work, preserve reviewability for edits, and stop re-fetching facts already present in the conversation."
  purpose: "This skill prevents agents from wasting time and context with redundant reads, serial searches, unbounded terminal output, or hand-driven N+1 edits while also preventing the opposite failure of under-calling and hallucinating. It gives a portable decision framework for choosing tools, scripts, batching, subagents, and output-shaping patterns."
  boundary: "This skill decides when, how many, and which external operations an already-running agent should use. It does not describe the protocol mechanics of tool-call messages, the whole context stack around the agent, prompt wording, runtime failure debugging, or the correctness mechanics of a refactor deliverable."
  analogy: "Tool-call strategy is like planning queries against a slow, expensive database: ask the smallest question that returns the needed evidence, combine independent queries when possible, avoid repeating a query whose result is already in hand, and use set-based operations for bulk deterministic work."
  misconception: "The common mistake is treating efficiency as fewer calls at all costs. Good strategy is not tool abstinence; it is evidence discipline. A necessary verification call is cheap compared with a hallucinated answer, while an unbounded log dump or a repeated file read can make every later decision worse."
  concept: "{\"definition\":\"Tool-call strategy is the discipline of choosing, batching, sequencing, and shaping an agent's external operations so each call produces enough evidence for the next decision without unnecessary latency, token cost, or context pollution.\",\"mental_model\":\"Treat tool use as query planning for an expensive, persistent evidence stream. Each call should have a specific information need, a bounded expected result, and a clear reason it cannot be satisfied from existing context. Independent calls can run together; dependent calls wait; deterministic bulk work moves into scripts; judgment-dependent work stays in the agent loop.\",\"purpose\":\"It keeps agents fast and accurate by preventing redundant reads, serial round trips, noisy outputs, and manual N+1 edits while preserving enough verification to avoid hallucination.\",\"boundary\":\"It is not the tool-call protocol itself, prompt wording, whole-context architecture, runtime debugging, or refactor methodology. It owns per-call efficiency choices inside those broader workflows.\",\"taxonomy\":\"Core levers include tool selection, script-vs-call gating, batching and parallelization, dependency detection, redundancy checks, output bounding, subagent isolation, and reviewable edit strategy.\",\"analogy\":\"Tool-call strategy is like planning queries against a slow, expensive database: ask the smallest question that returns the needed evidence, combine independent queries when possible, avoid repeating a query whose result is already in hand, and use set-based operations for bulk deterministic work.\",\"misconception\":\"Fewer calls is not automatically better. The correct target is sufficient evidence with minimal noise; skipping a needed check is worse than making one more focused call.\"}"
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/tool-call-strategy/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

# Tool Call Strategy

## Coverage

- The three costs of every tool call: token cost (schema overhead and result size), latency cost (round-trip and decision time), context pollution (results persist in attention window)
- The script-vs-call decision gate: deterministic bulk work belongs in a script; reasoning-dependent work belongs in individual tool calls with the agent in the loop
- Tool selection decision tree: file-search vs content-search vs targeted-read vs full-read, harness-native structured tools vs shell fallback, and the harness-agnostic capability map
- Batching independent calls in a single message vs sequential round-trips, and the dependency-detection heuristic
- Redundancy avoidance: the conversation-as-cache mental model, recognising re-reads, re-searches, and re-runs
- Context-efficient patterns: targeted line ranges, bounded verification output, dedicated-tool defaults, provenance notes, and tool-result lifecycle
- Subagent delegation for context protection: when exploration belongs in a disposable subagent context vs the main session
- The poka-yoke principle: design tool usage to prevent mistakes, not just optimise speed
- Cost benchmark heuristics: rough call-count ranges per task type and the "stop and reconsider" red flag

## Philosophy

Every tool call has three simultaneous costs: tokens (schema overhead plus result), latency (network round-trip plus decision time), and context pollution (results persist in the attention window and degrade subsequent reasoning). Agents that issue 12 calls where 3 would suffice are not merely slower — they are measurably less accurate, because noise accumulated in the context window pushes useful signal further from the attention window.

The optimal strategy is not "minimise calls." Under-calling causes hallucination and skipped verification. The objective is **information gained per unit cost**: a single well-targeted grep that returns five matching lines is worth more than reading three entire files to find the same information. A script that processes fifty files in one shell call is worth more than fifty individual edit calls. The conversation history acts as a cache; information already retrieved does not need to be retrieved again.

> A tool call is like a SQL query against a slow, expensive, noisy database — plan it before you run it, do not re-run queries whose results are already in the result set, and reach for set-based operations (scripts) when you catch yourself doing the same row-level work N times.

## The Three Costs of Every Tool Call

| Cost | Mechanism | Magnitude |
|---|---|---|
| **Token cost** | Tool schemas sent with every request (~500 tokens per declared tool). Each result adds to conversation. Ten available tools = ~5,000 tokens of overhead before any user input. | Scales with number of available tools and result size |
| **Latency cost** | Network round-trip, tool execution time, model decision time per call | ~200–2000 ms per call; compounds for sequential calls |
| **Context pollution** | Every result stays in conversation history. Failed attempts, verbose outputs, and redundant reads all persist | Degrades reasoning quality as context fills |

**The compound effect:** five unnecessary reads do not just cost five times the tokens — they push useful context further from the attention window, degrading the quality of subsequent reasoning. Context is not just a budget; it is a signal-to-noise ratio.

## Source Notes

This skill treats vendor tool protocols as evidence for the strategy, not as its whole scope. OpenAI's function-calling guide frames tool calling as a multi-step conversation where the application supplies tools, executes requested calls, and returns outputs for the next model turn; it also notes that large tool surfaces consume context and can be narrowed with mechanisms such as tool search or allowed-tool subsets. Anthropic's tool-use docs describe the same model/runtime separation and document parallel tool use for independent work plus context-management patterns for keeping tool output from overwhelming the conversation. Those protocol facts support the portable strategy here: plan calls, keep independent work parallel, keep dependent work sequential, and shape tool outputs as first-class context.

## Harness-Agnostic Tool Capability Map

Every modern coding-agent harness exposes the same five abstract tool capabilities under different concrete names. Substitute your harness's equivalents when applying this skill.

| Abstract capability | Claude Code | Cursor / Copilot / Continue | OpenCode | Shell-only fallback |
|---|---|---|---|---|
| File-pattern search (find files by name/path glob) | `Glob` | `file_search` | `glob` | `rg --files`, then `find` |
| Content search (find text inside files) | `Grep` | `grep_search` | `grep` | `rg`, then `grep -r` |
| Targeted read (read specific lines of a file) | `Read` (with `offset`/`limit`) | `read_file` (with line range) | `read` | `sed -n 'A,Bp'` |
| Diff-based edit (modify part of a file) | `Edit` / `MultiEdit` | `replace_string_in_file` / `apply_patch` | `edit` | `sed -i` (avoid) |
| Shell execution (run an arbitrary command) | `Bash` | `run_in_terminal` | `bash` | direct shell |

The principles in this skill apply uniformly across all of them. Examples below use the Cursor/Copilot names because they are the most descriptive; the same advice applies to whichever set of names your harness exposes.

## The Script-vs-Call Decision Gate

The single most impactful optimisation: use scripts for deterministic work, tool calls for reasoning-dependent work.

```
Is the operation deterministic (known input → known output)?
  YES → Can it be expressed as a shell command or script?
          YES → Write a script, run once via a shell-execution tool
          NO  → Single tool call with structured output
  NO  → Does the operation require reasoning about intermediate results?
          YES → Individual tool calls with the agent in the loop
          NO  → Batch into a script that returns structured data the agent can reason about
```

### When scripts beat tool calls

| Scenario | Tool-call approach | Script approach | Savings |
|---|---|---|---|
| Rename a variable across 20 files | 20 diff-based edit calls | One project-owned script via shell execution | 19 fewer calls |
| Check which files import a module | 10 targeted-read calls | One content-search call | 9 fewer calls |
| Run lint + typecheck + test | 3 sequential shell calls | `pnpm lint && pnpm typecheck && pnpm test` | 2 fewer calls |
| Create 5 similar test files | 5 file-creation calls | Script that generates all 5 | 4 fewer calls |
| Collect metrics from multiple sources | N targeted-read calls | Script that aggregates and returns JSON | N−1 fewer calls |

### When tool calls beat scripts

| Scenario | Why a script fails |
|---|---|
| Edit depends on understanding the code around it | The agent needs to read, reason, then decide what to change |
| Search result determines next action | The search path cannot be predicted in advance |
| Error in one step changes the approach for the next | Scripts cannot reason about failures mid-flight |
| Output needs human or agent review before proceeding | Scripts execute blindly |

## Tool Selection Decision Tree

Choose the right tool for the information need. Wrong tool choice is the largest single source of wasted calls.

```
Need to find files by name or path pattern?
  → file-pattern search; if shell is the available search surface, use `rg --files` before `find`

Need to find content inside files?
  → Need the matching lines themselves?
        YES → content search with matching lines (returns content)
        NO  → Just need file paths? content search or file-pattern search

Need to read file contents?
  → Know which lines you need?
        YES → targeted read with line range
        NO  → Need the whole file?
                YES → full read (default)
                NO  → content search for the specific function or class first, then targeted read of the section

Need to modify a file?
  → Targeted change to existing content?
        YES → diff-based edit (sends only the diff; fails if the old string does not match)
        NO  → Complete rewrite or new file?
                YES → file-creation tool
                NO  → diff-based edit

Need to run a command?
  → Is there a structured harness tool for this? (read tool, content search, file-pattern search)
        YES → use the structured tool
        NO  → shell execution
```

### Critical rules

| Rule | Why |
|---|---|
| Prefer structured read/search tools when the harness provides them | They usually return line numbers, respect workspace permissions, and keep output easier to inspect |
| In shell-first harnesses, prefer `rg` and `rg --files` before `grep -r`, `find`, or `ls` | Ripgrep is faster, has better defaults for code search, and makes it easier to narrow output |
| Use `head`, `tail`, or line-range reads to bound output, not as a blind substitute for targeted search | Output shaping protects context; blind file dumping pollutes it |
| Never default to inline `sed` or `awk` edits in shell | Prefer diff-based edits for reviewable changes; reserve raw `sed` for cases where a script would be disproportionate |
| Content search before full read | Content search returns only matching lines; full read returns the entire file |
| File-pattern search before content search | If you know the file pattern, narrow the search space first |

## Batching and Parallelization

### Independent calls: batch in a single message

If two or more tool calls do not depend on each other's output, make them all in the same message.

**Sequential (bad):**
```
Message 1: read file A         → wait for result
Message 2: read file B         → wait for result
Message 3: search for pattern  → wait for result
Total: 3 round-trips
```

**Parallel (good):**
```
Message 1: read file A + read file B + search for pattern
Total: 1 round-trip (wall-clock = max of individual calls)
```

### Dependency detection

| Calls are independent when | Calls are dependent when |
|---|---|
| Different files, no shared state | Second call uses first call's output |
| Read-only operations | First call creates or modifies what second reads |
| Verification checks (lint, type, test) | Error in first determines whether to run second |

### Batching heuristic

Before making a tool call, ask: *"Is there another call I need to make that does not depend on this one's result?"* If yes, batch them.

## Avoiding Redundant Operations

### The information-cache mental model

Treat the conversation context as a cache. Information already retrieved does not need to be retrieved again.

| Redundancy type | Example | Fix |
|---|---|---|
| Re-reading a file | Read file A, make an edit, re-read file A to verify | The edit tool confirms what changed; trust it |
| Re-searching for the same pattern | Two identical content searches in one conversation | Reference the earlier result |
| Reading a file just written | Create file, then read it to confirm contents | File creation confirms success; trust it |
| Running the same verification twice | `pnpm typecheck` after edit, then again before commit | Once is enough if no other changes were made |
| Exploring broadly then narrowly | Search all files, then search the same pattern in a subdirectory | Start narrow; widen only if needed |

### The "Do I already know this?" check

Before every tool call, answer: *"Is this information already in my context from a previous call?"* If yes, reference it instead of re-fetching.

## Context-Efficient Patterns

### For file reading

| Need | Efficient pattern | Wasteful pattern |
|---|---|---|
| Find a specific function | Content search for the function name, then targeted read of the 30-line section | Full read of the entire 2000-line file |
| Check if a pattern exists | Content search (returns match count) | Full read of the entire file and search manually |
| Read multiple small sections | Multiple targeted reads with explicit line ranges | One full read that includes irrelevant code |
| Compare two files | Targeted reads of both with relevant line ranges | Full reads of both |

### For file modification

| Need | Efficient pattern | Wasteful pattern |
|---|---|---|
| Change one line | Diff-based edit with minimal old/new string | Full file rewrite |
| Change N similar lines | Diff-based edits batched in one message | N separate sequential edit calls |
| Change across many files | Project-owned script (Node, Python) — see note below | N separate edit calls |
| Create a new file | File-creation tool | Diff-based edit (cannot edit what does not exist) |

> **Bulk-edit note:** for "change across many files", prefer a project-owned script (Node, Python) that produces a reviewable diff rather than inline `sed -i` or `awk` in a shell call. Inline `sed -i` bypasses agent review and is hard to audit. Reserve raw `sed` for cases where a proper script would be disproportionate overhead.

### For verification

| Need | Efficient pattern | Wasteful pattern |
|---|---|---|
| Check if tests pass | `pnpm test 2>&1 \| tail -20` | Full unbounded test output in context |
| Check if a server is running | `curl -sf URL > /dev/null && echo up \|\| echo down` | Full curl output with headers and body |
| Check types | `pnpm typecheck 2>&1 \| head -30` | Unbounded typecheck output |
| Run multiple checks | `pnpm lint && pnpm typecheck && pnpm test` (one call) | Three separate shell calls |

### For tool-result lifecycle

| Need | Efficient pattern | Wasteful pattern |
|---|---|---|
| Preserve evidence | Summarise the result with file paths, line numbers, command names, and pass/fail status | Keep a full raw transcript in the main context after the useful facts have been extracted |
| Retry after failure | Change one variable before retrying and record what changed | Re-run the identical failing call hoping for a different result |
| Continue after broad exploration | Compact to the decision, evidence path, and open questions | Carry every exploratory hit forward as if it were still active context |
| Hand off to a user or reviewer | Report the smallest reproducible command and the decisive lines | Paste unbounded logs with no interpretation |

## Subagent Delegation for Context Protection

Subagents run in separate contexts. Use them to prevent context pollution from exploratory work.

### When to use subagents

| Scenario | Why subagent |
|---|---|
| Exploring an unfamiliar part of the codebase | Exploration reads many files; main context stays clean |
| Running a broad search that may return many results | Results stay in subagent context; only the summary returns |
| Reviewing code (writer/reviewer pattern) | Reviewer has fresh context without implementation bias |
| Parallel independent investigations | Each runs in its own context without cross-contamination |

### When NOT to use subagents

| Scenario | Why direct |
|---|---|
| Single targeted read or content search | Subagent overhead exceeds the call itself |
| Work that requires multiple back-and-forth decisions | Subagent cannot ask clarifying questions mid-task |
| Simple file edits | Direct is faster |

### Subagent context-efficiency rule

Brief subagents with the minimum context they need. Include: what to find, where to look, what format to report back in. Do not include: full conversation history, unrelated background, or "figure out what I need."

## The Poka-Yoke Principle

Design tool usage to prevent mistakes, not just optimise speed. *Poka-yoke* (Japanese: "mistake-proofing") is the lean-manufacturing principle of designing the work so the wrong action is hard or impossible.

| Poka-yoke | Why it prevents errors |
|---|---|
| Use absolute file paths | Relative paths break when working directory changes |
| Prefer diff-based edit over full-file rewrite for existing files | Diff-based edit fails if the old string does not match; full rewrite silently overwrites |
| Run a content search before a full read | Confirms the file exists and contains the pattern before reading the full content |
| Run verification *after* edits, not before | Pre-edit verification is wasted if the edit changes the result |
| Pipe long outputs through `tail` or `head` | Prevents context overflow from verbose commands |

## Cost Benchmark Heuristics

Rough guideline ranges for different task types. These are heuristic targets, not empirically calibrated thresholds — actual counts vary by task complexity, codebase familiarity, and how much context is already in the session. Treat them as "should I stop and reconsider?" thresholds, not hard limits.

| Task type | Guideline range | Typical tools |
|---|---|---|
| Simple bug fix (1 file) | 3–5 calls | Content search, targeted read, diff-based edit, verify |
| Feature addition (2–3 files) | 5–10 calls | Read existing patterns, write new code, verify |
| Refactor (many files) | 3–8 calls | Content search to find all sites, script to batch-edit, verify |
| Investigation / exploration | 5–15 calls | Multiple content searches and targeted reads |
| Complex multi-file feature | 10–20 calls | Plan, read patterns, implement, verify |

**Red flag:** if a task is taking more than 20 tool calls, stop and ask: *"Am I using the right approach?"* Consider scripting, subagent delegation, or a different strategy. The fact that 20 calls feels like a lot is itself a useful signal — listen to it.

## Verification

After applying this skill, verify:

- [ ] Content search ran before targeted read when looking for specific content
- [ ] Independent tool calls were batched in the same message
- [ ] Scripts replaced N+1 individual calls for deterministic bulk operations
- [ ] No re-reads or re-searches for information already in context
- [ ] Targeted reads with explicit line ranges were used for large files
- [ ] Verbose command outputs were piped through `head` or `tail`
- [ ] Tool results were summarised into durable evidence and raw verbose output was not carried forward unnecessarily
- [ ] Shell fallback used fast, narrow search/read commands when structured harness tools were unavailable
- [ ] Total tool calls fall within the benchmark range for this task type, or there is a documented reason they exceed it
- [ ] Subagents were used for context-heavy exploration, not for trivial single calls

## Do NOT Use When

| Use instead | When |
|---|---|
| `prompt-craft` | The fix is in the wording of one instruction (clarity, format, few-shot examples), not how the surrounding tool calls are sequenced |
| `context-engineering` | The question is about the entire information stack (system prompt, memory, rules, skills) reaching the model, not per-call efficiency |
| `debugging` | A tool is returning errors at runtime — that is a bug, not an efficiency problem |
| `refactor` | The deliverable is a behaviour-preserving code transformation; the tool-call efficiency of getting there is a means, not the end |
| `skill-router` | Deciding which *skill* should activate for a query, not which *tool call* the activated skill should make next |
| `documentation` | Writing prose for a human reader explaining how the agent's tool usage works |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `code-engineering`
- Deployment: `portable`
- Domain: `ai-engineering/tool-use`

**When to use**
- the agent made 17 read_file calls when 3 greps would have done — what should it have done?
- we're renaming a variable across 40 files — script or tool calls?
- the agent re-reads the same file three times in one task — fix the policy
- should I batch these reads into one message or wait for each result?
- design a tool-use protocol for our new agent harness — what rules matter?
- the context window is filling with verbose terminal output — how do I cut it?
- is it worth delegating this exploratory search to a subagent?
- what's a reasonable tool-call budget for a single-file bug fix?

**Not for**
- improve this prompt's wording to get better outputs
- design what skills get loaded for which prompts
- the test suite is failing after my change — find the cause
- extract this repeated string-concat into a helper function
- scaffold a new SKILL.md for our team's tool-use rules
- review this AI-generated PR for correctness
- Owned by `context-engineering`
- Owned by `prompt-craft`
- Owned by `debugging`
- Owned by `refactor`: behaviour-preserving code transformations as the deliverable

**Related skills**
- Verify with: `code-review`
- Related: `context-engineering`, `refactor`, `prompt-craft`

**Concept**
- Mental model: Tool-call strategy is the query planner for an agent's external actions. Treat every call as an expensive, stateful evidence-acquisition operation with three costs: latency, tokens, and context pollution. The goal is sufficient evidence with minimum noise: pick the narrowest tool that can answer the question, batch independent calls, keep dependent calls sequential, use scripts for deterministic bulk work, preserve reviewability for edits, and stop re-fetching facts already present in the conversation.
- Purpose: This skill prevents agents from wasting time and context with redundant reads, serial searches, unbounded terminal output, or hand-driven N+1 edits while also preventing the opposite failure of under-calling and hallucinating. It gives a portable decision framework for choosing tools, scripts, batching, subagents, and output-shaping patterns.
- Boundary: This skill decides when, how many, and which external operations an already-running agent should use. It does not describe the protocol mechanics of tool-call messages, the whole context stack around the agent, prompt wording, runtime failure debugging, or the correctness mechanics of a refactor deliverable.
- Analogy: Tool-call strategy is like planning queries against a slow, expensive database: ask the smallest question that returns the needed evidence, combine independent queries when possible, avoid repeating a query whose result is already in hand, and use set-based operations for bulk deterministic work.
- Common misconception: The common mistake is treating efficiency as fewer calls at all costs. Good strategy is not tool abstinence; it is evidence discipline. A necessary verification call is cheap compared with a hallucinated answer, while an unbounded log dump or a repeated file read can make every later decision worse.

**Grounding**
- Mode: `hybrid`
- Truth sources: `https://developers.openai.com/api/docs/guides/function-calling`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/manage-tool-context`, `https://github.com/jacob-balslev/skills/blob/main/skills/tool-call-flow/SKILL.md`, `https://github.com/jacob-balslev/skills/blob/main/skills/context-engineering/SKILL.md`

**Keywords**
- `tool call optimization`, `reduce tool calls`, `too many tool calls`, `script vs tool call`, `batching tool calls`, `parallel tool calls`, `parallelize calls`, `independent calls`, `redundant reads`, `re-reading file`

<!-- skill-graph-context:end -->
