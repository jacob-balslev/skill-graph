---
name: context-window
description: "Use when allocating context-window budget across system, skill-injection, working, and output zones; monitoring context health; deciding when to compact; preserving state before compaction; recovering after compaction; or choosing strategies for 1M, 200K, or 128K context windows. Covers zone budgets, practical model-budget tables, the 80% compaction rule, pre/post-compact protocols, persistence hierarchy, operation token costs, and token-reduction techniques. Do NOT use for deciding what information belongs in the working set (use `context-management`), prompt design (use `prompt-craft`), graph architecture (use `context-graph`), or memory curation. Do NOT use for decide what context to load or drop in the working set. Do NOT use for design the multi-graph architecture for skills + docs + memory. Do NOT use for improve the prompt template the agent uses. Do NOT use for curate the durable memory index across sessions. Do NOT use for which skill should activate for this query."
license: MIT
compatibility: "Provider-agnostic. The zone model, 80% rule, persistence hierarchy, and token-reduction techniques apply across Anthropic, OpenAI, Google, and open-weight contexts of any size. Specific token figures are illustrative — substitute the figures of the model you actually run."
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.1.0"
  subject: agent-ops
  deployment_target: portable
  taxonomy_domain: agent/context
  owner: skill-graph-maintainer
  freshness: "2026-05-18"
  drift_check: "{\"last_verified\":\"2026-05-18\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"context window management\",\"context budget allocation\",\"80% compaction rule\",\"context health states\",\"pre-compact hook\",\"post-compact recovery\",\"cross-session persistence hierarchy\",\"token consumption per operation\",\"deterministic cli vs mcp tool result tokens\",\"targeted file read offset limit\"]"
  examples: "[\"the agent's tool results are starting to truncate — what state are we in and what should I do next?\",\"I have a 1M-context model — does that mean I can ignore budget management?\",\"the session is at 75% context — should I compact now or finish the current operation first?\",\"I just compacted and lost the decision trail; what should the pre-compact hook have preserved?\",\"the agent reads 5 files looking for a function and burns 100K tokens — what's the right pattern?\",\"I'm running on a 128K-context model — what's the per-task budget I can plan against?\",\"what survives compaction and what doesn't, ranked from most to least durable?\",\"the skill payload is 30K and I haven't even read a file yet — how do I shrink it?\"]"
  anti_examples: "[\"decide what context to load or drop in the working set\",\"design the multi-graph architecture for skills + docs + memory\",\"improve the prompt template the agent uses\",\"curate the durable memory index across sessions\",\"which skill should activate for this query\",\"review this AI-generated PR for correctness\",\"the README has drifted from the actual CLI flags — which wins?\",\"the docs have drifted from the code — which is canonical?\"]"
  relations: "{\"boundary\":[{\"skill\":\"context-management\",\"reason\":\"context-management decides what to load and drop in the working set; context-window is the budget math underneath that decides how much fits and when to compact\"},{\"skill\":\"context-graph\",\"reason\":\"context-graph maps the static topology of skills / docs / memory; context-window is the runtime budget for the part of that topology that is actually loaded\"},{\"skill\":\"tool-call-strategy\",\"reason\":\"tool-call-strategy decides which tool to invoke; context-window decides how much budget the result of that tool is allowed to occupy\"},{\"skill\":\"prompt-craft\",\"reason\":\"prompt-craft is wording / structure of one prompt; context-window is the per-session budget the prompt and its results live within\"}],\"related\":[\"context-management\",\"context-graph\",\"tool-call-strategy\",\"context-engineering\"],\"verify_with\":[\"context-management\"]}"
  grounding: "{\"subject_matter\":\"Runtime context-window budgeting and compaction discipline for LLM agents\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"https://platform.claude.com/docs/en/build-with-claude/context-windows\",\"https://ai.google.dev/gemini-api/docs/long-context\",\"https://developers.openai.com/api/docs/models/compare\",\"https://github.com/jacob-balslev/skills/blob/main/skills/context-engineering/SKILL.md\",\"https://github.com/jacob-balslev/skills/blob/main/skills/context-management/SKILL.md\",\"https://github.com/jacob-balslev/skills/blob/main/skills/tool-call-strategy/SKILL.md\"],\"failure_modes\":[\"large_context_treated_as_unlimited\",\"output_headroom_not_reserved\",\"compaction_started_after_overflow\",\"mixed_git_tree_committed_before_compaction\",\"raw_tool_results_preserved_after_distillation\"],\"evidence_priority\":\"equal\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":180,\"review_cadence\":\"quarterly\"}"
  mental_model: "A context window is finite working memory shared by instructions, tools, skills, conversation history, tool results, reasoning/output budget, and files. Budget management is a runtime accounting loop: know the model's actual limit, reserve output and recovery headroom, measure the active working set, compact or checkpoint before overflow, and promote durable state out of live context before it can be lost."
  purpose: "This skill prevents long-running agent sessions from failing because they treated a large context window as unlimited, kept raw tool results after extracting facts, or began compaction too late to preserve the decision trail. It gives practical budget zones, health states, compaction timing, and recovery rules that compose with context-management and tool-call-strategy."
  boundary: "This skill owns quantitative capacity planning and compaction timing. It does not decide which facts belong in the working set, design the context graph, write prompt wording, curate long-term memory, or choose the next tool; those skills consume its budget guidance."
  analogy: "Context-window management is like scuba air management: a large tank lets you dive longer, but you still track pressure, reserve enough air for ascent, and surface before the gauge is empty."
  misconception: "The common mistake is believing a larger window removes the need for discipline. Large windows expand the failure radius: bigger raw dumps, longer stale threads, and more expensive overflow. Good management keeps the window useful, not merely full."
  concept: "{\"definition\":\"Context-window management is the practice of allocating and protecting the finite token budget available to an LLM call or agent session, including instructions, tool schemas, injected skills, conversation history, tool results, retrieved files, and output headroom.\",\"mental_model\":\"Treat the window as working memory with a gauge. Every added message, tool result, file slice, image, or reasoning/output allocation consumes capacity. The operating loop is measure, reserve headroom, narrow inputs, checkpoint durable state, compact before overflow, and rebuild selectively after compaction.\",\"purpose\":\"It keeps long-running agent work from losing state or degrading quality when the active context becomes too large, noisy, or close to the model limit.\",\"boundary\":\"It is budget math and compaction timing, not qualitative working-set selection, prompt writing, graph topology, memory curation, or per-tool choice. It tells neighboring skills how much room they have and when the session must checkpoint or compact.\",\"taxonomy\":\"Core levers include zone budgeting, health-state thresholds, output headroom, tool-result shaping, targeted reads, progressive skill disclosure, compaction checkpoints, persistence hierarchy, and model-class strategy.\",\"analogy\":\"Context-window management is like scuba air management: a large tank lets you dive longer, but you still track pressure, reserve enough air for ascent, and surface before the gauge is empty.\",\"misconception\":\"A 1M-token window is not infinite. It delays overflow but does not remove context pollution, stale assumptions, output-headroom needs, or the cost of raw dumps.\"}"
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/context-window/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

# Context Window

## Coverage

The quantitative discipline behind an agent's working memory. Allocates the context-window budget across three zones: System (system prompt, rules, tool schemas), Skill Injection (the SKILL.md files auto-loaded for the current task), and Working (conversation, tool results, file contents, agent output). Names the three context health states — `ok` (< 60% used), `compact` (60–80%), `exhausted` (> 80%) — and the **80% compaction rule** that compaction must always trigger before the budget is fully consumed, leaving 20% as the safety margin for finishing the current operation, writing the checkpoint, running the closeout protocol, and emitting the continuation signal. Specifies the pre-compact protocol (commit uncommitted changes, write the continuation signal, update the checkpoint, save state that cannot be re-derived from git or disk) and the post-compact recovery flow (re-injection of git status, active-task reference, recent commits, critical findings). Catalogs typical token consumption per operation type (full file read 20–40K, large tool-result JSON 10–30K, single SKILL injection 3–8K, fixed system overhead) and the five token-reduction techniques: deterministic-CLI over heavy MCP / tool-result paths, targeted file reads with `offset` + `limit` instead of full-file reads, search-before-read (grep first, read the match), progressive skill disclosure (small SKILL.md kept always loaded; large reference files loaded on demand), and count-mode for exploration (count matches, then read the few that matter). Specifies the cross-session persistence hierarchy — git history > files on disk > durable memory > live context — and uses it to decide _what to checkpoint_ before compaction. Lists per-model-class context strategies for 1M, 200K, and 128K windows.

## Philosophy

The context window is the agent's _working memory_. Unlike human memory, it has a hard ceiling — when it fills, information is permanently lost from the live session unless it has been checkpointed somewhere durable. Managing the window is not optional. It is the difference between completing a long task and crashing mid-work with the most recent reasoning gone.

The trap of large windows is the assumption that they are _effectively_ unlimited. A 1M-token window feels infinite until a single 2000-line file read consumes 30K, three of those plus a long tool-result chain pushes past 200K, and the agent is at 60% before any real implementation has happened. The ceiling is real, and it is closer than the headline number suggests. Discipline at 200K is identical to discipline at 1M; only the absolute numbers move.

The 80% rule exists because compaction is _itself_ an operation that needs budget. Hitting 100% mid-operation loses the operation. Compacting at 80% preserves it — the remaining 20% pays for the act of preserving.

## Source Notes

Current vendor docs agree on the central budget shape: the context window is a finite store for prior conversation and current-turn input, and output or thinking/tool-use behavior also competes for capacity in provider-specific ways. Anthropic's context-window docs describe conversation history accumulating across turns, 200K and 1M Claude classes, context awareness, tool-result and extended-thinking nuances, and server-side compaction / context editing options. Google's Gemini long-context guide frames long context as short-term memory, notes 1M+ token Gemini windows, and still recommends optimization techniques such as context caching for high-input workloads. OpenAI's model comparison docs expose model-specific context-window and max-output-token values, which is the operational reminder that planning must use the actual model selected at runtime, not a generic "frontier model" assumption.

## Zone Model

A useful per-session mental partition of the available budget:

| Zone                | Typical share | What lives here                                                          |
| ------------------- | ------------- | ------------------------------------------------------------------------ |
| **System**          | ~5–10%        | System prompt, repo rules, tool schemas, always-loaded directives        |
| **Skill injection** | ~2–5%         | The SKILL.md files auto-loaded by the routing layer for the current task |
| **Working**         | ~85–93%       | Conversation, tool results, file contents, agent output                  |

The exact share varies by model, harness, and task type. The zones are useful because budget breaches show up in different places: a System overrun is a rules / tool-schema problem, a Skill overrun is a routing / over-injection problem, a Working overrun is a context-management / file-read problem. Each has a different remediation.

### Practical budget by model class

Replace these illustrative figures with the actual figures of your runtime — they shift over time and across vendors.

| Model class | Total context | Reserve first | Practical working budget |
|---|---:|---:|---:|
| 1M+ long-context class | ~1,000,000+ | output headroom + system/tool/schema overhead | model limit minus reserved output and fixed overhead |
| 400K long-context class | ~400,000 | output headroom + system/tool/schema overhead | model limit minus reserved output and fixed overhead |
| 200K long-context class | ~200,000 | output headroom + system/tool/schema overhead | model limit minus reserved output and fixed overhead |
| ~128K class | ~128,000 | output headroom + system/tool/schema overhead | model limit minus reserved output and fixed overhead |

Do not copy these classes into a capacity claim. Check the provider's model page for the exact model, then subtract: system prompt, tool schemas, always-loaded rules, injected skills, conversation history that must remain visible, and a realistic `max_tokens` / output reserve. A request that fits the input window can still fail the task if it leaves no room to answer.

## Context Health States

| State       | Used budget | Meaning          | Action                                           |
| ----------- | ----------- | ---------------- | ------------------------------------------------ |
| `ok`        | < 60%       | Normal operation | Continue working                                 |
| `compact`   | 60–80%      | Getting crowded  | Plan compaction at the next logical boundary     |
| `exhausted` | > 80%       | Critical         | Stop after the current item, compact immediately |

### The 80% rule

**Always compact at 80% of the working budget — never at 100%.** The remaining 20% is the safety margin for:

- Completing the operation currently in flight
- Writing the checkpoint state
- Running whatever session-closeout / wrap protocol the runtime ships
- Emitting the continuation signal so the next session can resume

Hitting 100% mid-operation loses work. Compacting at 80% preserves it.

## Compaction Protocol

### When to compact

1. Context health reaches `compact` or `exhausted`
2. After completing a logical unit of work (one task, one file, one audit item)
3. Before starting a large new operation that will read many files
4. When tool results begin to truncate (a leading indicator of context pressure)

### Pre-compact checklist

Before triggering compaction:

1. **Durably checkpoint intended changes** — commit, stage, or write a patch/notes file for work you own; do not blanket-commit an unrelated dirty tree.
2. **Write the continuation signal** — the next-session contract: active task, current question, remaining work.
3. **Update any loop or task checkpoint** — advance the recorded phase to the actual phase.
4. **Save critical state** — anything that cannot be re-derived from git history or files on disk goes into a durable artefact now.

### Pre-compact hook

A pre-compact hook, closeout script, or manual checklist is the deterministic enforcer of the checklist. It captures, at minimum:

- The active task identifier and the current question
- The agent mode / phase
- The current git branch and the most recent commit hashes
- The current context-health state
- A small bag of custom state (whatever the runtime needs to resume)

Any runtime that supports compaction without a checkpoint mechanism is _one accidental compaction away from losing the decision trail_. The mechanism can be a hook, a closeout command, or a human-run checklist, but it must be repeatable and fast.

### Post-compact recovery

After compaction, the session-start brief should re-inject:

- Git status (branch, recent commits, dirty files)
- The active task pulled from the continuation signal
- A short summary of the in-progress board state
- Any critical findings recorded in the pre-compact checkpoint

The agent does not re-load the lost conversation. It rebuilds _selectively_ from the durable artefacts.

## Token Consumption Patterns

### What consumes the most context

| Operation                           | Typical tokens | Impact     |
| ----------------------------------- | -------------- | ---------- |
| Full file read (2000 lines)         | 20–40K         | High       |
| Grep results, 50 matches            | 5–10K          | Medium     |
| Tool result, large JSON             | 10–30K         | High       |
| Skill injection, one SKILL.md       | 3–8K           | Low–Medium |
| Agent response, code + explanation  | 2–5K           | Low        |
| System prompt + always-loaded rules | ~50K (fixed)   | Baseline   |

### Five token-reduction techniques

#### 1. Deterministic CLI over heavy tool-result paths

Where the runtime offers both a heavy tool-result path (e.g., a large MCP-style JSON dump) and a deterministic CLI / scripted path that returns the same data shaped tighter, prefer the CLI. The savings can easily be 50–100× per call. The principle: ship structured output through tools the model can read efficiently, not through whatever path the runtime happens to expose by default.

#### 2. Targeted file reads (offset + limit)

```
BAD:  read the whole 2000-line file
      → 30K tokens
GOOD: read 30 lines starting at the function you actually need
      → 500 tokens
```

If a code-search step has already located the relevant lines, _use_ those line numbers. A "read everything because I might need it" pattern is the single biggest avoidable burn.

#### 3. Search before read

```
BAD:  read 5 candidate files looking for a function
      → 100K tokens
GOOD: grep for the function name first, then read 30 lines from the one match
      → 2K tokens
```

The search step costs ~1K tokens and replaces 50–100K of speculative reading.

#### 4. Progressive skill disclosure

Skills should follow a two-tier structure:

- **`SKILL.md`** — the core patterns, the routing-contract description, the verification checklist. Always loaded when the skill is selected. Should fit comfortably in 3–8K tokens.
- **`references/*.md`** — detailed reference material, long examples, deep specifications. Loaded _only_ when explicitly needed.

Only `SKILL.md` is auto-injected. References are loaded by the agent when the task demands the depth.

#### 5. Count mode for exploration

```
BAD:  list every TODO comment in the repo, full match content
      → 50K tokens
GOOD: count first, then read selectively
      grep --count "TODO"                                  → 200 tokens
      grep "TODO" path: src/lib/ --head 10                 → 2K tokens
```

Exploration should be a _count → narrow → read_ sequence, not a single exhaustive read.

## Cross-Session Persistence Hierarchy

What survives a compaction or session restart, ranked from most to least durable:

1. **Git** — code, commits, branches. Permanent.
2. **Files on disk** — checkpoints, continuation signals, structured logs (JSONL is ideal). Persistent until manually deleted.
3. **Durable memory** — index files and topic files in a memory directory consumed by the next session. Persistent and indexed.
4. **Live context** — conversation history, in-flight reasoning, tool results. **Lost on compaction.**

The hierarchy drives the pre-compact checklist: anything that lives only at level 4 needs to be promoted to levels 1–3 _before_ compaction, or it is gone.

### Planning for compaction

When starting a complex multi-step task:

1. Break it into subtasks each of which can complete inside one context window
2. After each subtask: checkpoint intended changes + update state + write continuation signal
3. If a subtask risks exceeding the budget mid-flight, split further or read fewer files

The rhythm is: small unit → durable checkpoint → state update → next unit. Compaction becomes a routine boundary instead of a crisis.

## Per-Model-Class Strategies

| Model class | Typical task sizing | Compaction cadence | Key disciplines |
|---|---|---|---|
| 1M+ context | Multiple focused reads and one substantial implementation or audit batch | After several logical units, or earlier if tool results get noisy | Progressive skill disclosure; targeted reads still required |
| 400K context | A focused multi-file implementation or one medium audit batch | At each clean milestone | Reserve output headroom; narrow broad searches before reading |
| 200K context | A focused implementation or audit item | After one to two logical units | Aggressive search-before-read; skill targeting; line-range reads |
| ~128K class | One narrow task | Hard boundary | Count-mode first; read only essentials; one verification step at a time |

A 1M window is not a license to ignore the rules — it just shifts the breaking point further out. Apply the same discipline; the budget math just lets you run longer between compactions.

## Anti-Patterns

| Anti-pattern                                             | Why it fails                                                               | Correct                                                                            |
| -------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Reading entire large files when 30 lines would do        | Burns 20–40K per file with no benefit                                      | Use `offset` + `limit`                                                             |
| Loading every available skill regardless of task         | Skill injection should be 2–5%, not 25%                                    | Use targeted routing labels; trust the routing layer                               |
| Ignoring the `compact` health signal                     | Skipping past 80% guarantees a 100% loss event sooner or later             | Compact at the next logical boundary once `compact` triggers                       |
| Compacting without a pre-compact checkpoint              | The decision trail is lost; the next session re-derives wrong              | Always run the pre-compact checklist; keep the hook always-on                      |
| Letting tool results dump unstructured JSON into context | A 30K tool result evicts 30K of useful conversation                        | Wrap heavy results in a CLI / script that returns the shape you need               |
| Speculative reads ("I might need this")                  | Speculation has the same cost as evidence-based reads, with worse outcomes | Read on evidence; if you cannot name _what you'll do with the file_, don't read it |
| Treating the 1M window as effectively unlimited          | A complex task crosses 60% in minutes; the ceiling is real                 | Apply the same discipline at 1M as at 200K; the budget just stretches              |

## Verification

- [ ] The current context-health state has been correctly classified as `ok`, `compact`, or `exhausted` based on actual usage estimates
- [ ] The pre-compact checklist has been followed before any compaction (durable checkpoint, continuation signal, state update, custom state)
- [ ] A pre-compact hook, closeout script, or manual checklist runs deterministically enough that compaction never happens without a checkpoint
- [ ] File reads use `offset` + `limit` targeting for any file beyond ~200 lines
- [ ] The session prefers deterministic CLI / scripted tool paths over heavy MCP-style result dumps where both exist
- [ ] No compaction has been triggered at 100% — the 80% rule has been respected
- [ ] What needs to survive the session has been promoted from live context to git / files / durable memory before any compaction
- [ ] The active model's actual context budget (not assumed budget) is the planning baseline
- [ ] Output / reasoning headroom is reserved before declaring the working set safe

## Do NOT Use When

| Use instead             | When                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `context-management`    | Deciding _what_ to load, keep, or drop from the working set — the qualitative side of context health                                 |
| `context-graph`         | Designing the multi-graph architecture (skills + docs + memory + scripts) — the topology, not the runtime budget                     |
| `prompt-craft`          | Writing or improving a prompt — wording, structure, format constraints                                                               |
| A memory-curation skill | Curating cross-session persistent memory files, pruning the memory index                                                             |
| `tool-call-strategy`    | Choosing which tool to call next — context-window decides the _budget_ for the call's result, not whether the call is the right call |
| `code-review`           | Reviewing AI-generated code — orthogonal concern                                                                                     |
| `context-engineering`   | Designing the system-level information architecture — context-engineering is upstream of this skill                                  |

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `agent-ops`
- Deployment: `portable`
- Domain: `agent/context`

**When to use**
- the agent's tool results are starting to truncate — what state are we in and what should I do next?
- I have a 1M-context model — does that mean I can ignore budget management?
- the session is at 75% context — should I compact now or finish the current operation first?
- I just compacted and lost the decision trail; what should the pre-compact hook have preserved?
- the agent reads 5 files looking for a function and burns 100K tokens — what's the right pattern?
- I'm running on a 128K-context model — what's the per-task budget I can plan against?
- what survives compaction and what doesn't, ranked from most to least durable?
- the skill payload is 30K and I haven't even read a file yet — how do I shrink it?

**Not for**
- decide what context to load or drop in the working set
- design the multi-graph architecture for skills + docs + memory
- improve the prompt template the agent uses
- curate the durable memory index across sessions
- which skill should activate for this query
- review this AI-generated PR for correctness
- the README has drifted from the actual CLI flags — which wins?
- the docs have drifted from the code — which is canonical?
- Owned by `context-management`
- Owned by `context-graph`
- Owned by `tool-call-strategy`
- Owned by `prompt-craft`

**Related skills**
- Verify with: `context-management`
- Related: `context-management`, `context-graph`, `tool-call-strategy`, `context-engineering`

**Concept**
- Mental model: A context window is finite working memory shared by instructions, tools, skills, conversation history, tool results, reasoning/output budget, and files. Budget management is a runtime accounting loop: know the model's actual limit, reserve output and recovery headroom, measure the active working set, compact or checkpoint before overflow, and promote durable state out of live context before it can be lost.
- Purpose: This skill prevents long-running agent sessions from failing because they treated a large context window as unlimited, kept raw tool results after extracting facts, or began compaction too late to preserve the decision trail. It gives practical budget zones, health states, compaction timing, and recovery rules that compose with context-management and tool-call-strategy.
- Boundary: This skill owns quantitative capacity planning and compaction timing. It does not decide which facts belong in the working set, design the context graph, write prompt wording, curate long-term memory, or choose the next tool; those skills consume its budget guidance.
- Analogy: Context-window management is like scuba air management: a large tank lets you dive longer, but you still track pressure, reserve enough air for ascent, and surface before the gauge is empty.
- Common misconception: The common mistake is believing a larger window removes the need for discipline. Large windows expand the failure radius: bigger raw dumps, longer stale threads, and more expensive overflow. Good management keeps the window useful, not merely full.

**Grounding**
- Mode: `hybrid`
- Truth sources: `https://platform.claude.com/docs/en/build-with-claude/context-windows`, `https://ai.google.dev/gemini-api/docs/long-context`, `https://developers.openai.com/api/docs/models/compare`, `https://github.com/jacob-balslev/skills/blob/main/skills/context-engineering/SKILL.md`, `https://github.com/jacob-balslev/skills/blob/main/skills/context-management/SKILL.md`, `https://github.com/jacob-balslev/skills/blob/main/skills/tool-call-strategy/SKILL.md`

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-18`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth UNVERIFIED, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.1.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `context window management`, `context budget allocation`, `80% compaction rule`, `context health states`, `pre-compact hook`, `post-compact recovery`, `cross-session persistence hierarchy`, `token consumption per operation`, `deterministic cli vs mcp tool result tokens`, `targeted file read offset limit`
