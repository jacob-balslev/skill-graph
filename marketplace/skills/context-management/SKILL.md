---
name: context-management
description: "Use when deciding what to load into an active agent session, recovering from context drift, preparing compaction or restart, distilling raw inputs into a working summary, or writing a handoff another agent can resume quickly. Covers intake triage, the active-context contract, the six-step context-management loop, working-set shaping, evidence capsules and observation masking, just-in-time handle-before-payload loading, prompt-caching alignment, context-rot defenses, drift signals and reset, the runtime-primitives boundary, compaction-ready handoffs, and selective rebuild after context loss. Do NOT use for token math (use `context-window`), prompt wording (use `prompt-craft`), persistent memory curation, or multi-graph context architecture (use `context-graph`). Do NOT use for calculate the per-zone token budget for the 200K context window. Do NOT use for improve this prompt template for the grader. Do NOT use for curate the persistent memory index file."
license: MIT
compatibility: "Runtime-agnostic. The intake-triage / loop / drift / handoff discipline applies to any LLM-coding harness regardless of context window size, compaction implementation, session-memory mechanism, or tool-result-clearing API."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"prompt-craft\",\"tool-call-strategy\",\"context-engineering\",\"context-graph\",\"summarization\"],\"suppresses\":[\"context-engineering\",\"context-graph\",\"context-window\"],\"verify_with\":[\"context-engineering\"]}"
  subject: agent-ops
  scope: "Deciding what to load into an active agent session, recovering from context drift, preparing compaction or restart, distilling raw inputs into a working summary, and writing a resumable handoff — intake triage, the active-context contract, the six-step context-management loop, working-set shaping, evidence capsules, observation masking, just-in-time handle-before-payload loading, prompt-caching alignment, context-rot defenses, drift signals, anti-drift reset rules, the runtime-primitives boundary, compaction-ready handoffs, and selective rebuild after context loss. Portable across any agent session; principle-grounded, not repo-bound. Excludes token math (context-window), prompt wording (prompt-craft), persistent memory curation, and multi-graph context architecture (context-graph)."
  public: "true"
  taxonomy_domain: agent/context
  stability: experimental
  keywords: "[\"context management\",\"working set discipline\",\"intake triage four buckets\",\"context drift recovery\",\"context management loop\",\"compaction-ready handoff\",\"distill raw inputs\",\"one active hypothesis\",\"selective context rebuild\",\"lost-thread recovery\"]"
  examples: "[\"the session feels noisy and I'm re-reading the same files — what discipline pulls it back?\",\"the agent keeps citing assumptions that were already disproven — how do I clear them out?\",\"I'm about to compact — what do I need to preserve so the next session resumes correctly?\",\"the thread is lost; what's the recipe for rebuilding only what's needed instead of warming up everything?\",\"I have a 300-line error log and a 600-line component file in context — how do I distill them?\",\"the active question changed three times this session — how do I prevent the old context from steering the new one?\",\"this conversation has 40K tokens of evidence; what should the working set actually contain?\"]"
  anti_examples: "[\"calculate the per-zone token budget for the 200K context window\",\"improve this prompt template for the grader\",\"curate the persistent memory index file\",\"design the multi-graph architecture for skills + docs + memory\",\"review this AI-generated PR for correctness\",\"why is this skill not routing — fix the keyword config\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/context-management/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
# Context Management

## Concept of the skill

Context management is the live-session discipline for deciding what evidence enters the agent's active working set, what gets carried only as a handle, what gets distilled, what gets dropped, and what must be preserved so a compacted, restarted, or successor session can continue without re-deriving the decision trail. It treats the context window as finite reasoning attention — not free storage — that degrades through _context rot_ (attention dilution and recall loss as the window fills) and _context pollution_ (irrelevant tool traces, stale logs, and disproven assumptions left active) even while well within the technical token limit.

## Coverage

The working discipline that controls what enters, stays in, and exits an active agent session. Intake triage that sorts every candidate context source into four buckets (must-have / useful soon / durable background / noise) before any large file, transcript, tool result, or external page is read. The active-context contract: task, active question, hypothesis, loaded evidence, rejected paths, next verification, and handoff location. The six-step context-management loop: state the active question in one sentence, name the minimum evidence needed to prove or disprove it, load the cheapest source first (index → search → narrow slice), collapse confirmed facts and completed branches into a checkpoint and re-cite it near the recency end when the window has grown long, drop stale or disproven assumptions from the active thread while preserving rejected-path markers, and re-check whether the question changed before reading more.

Working-set shaping rules: what to keep active, what to carry only as an identifier, what to summarize, and what to push out (including raw tool results, subagent reports, and the model's own exposed reasoning traces). The "carry handles until you need payloads" rule for just-in-time loading. The L1–L4 memory-hierarchy analogy for attention cost versus retrieval cost. Stable-prefix ordering for prompt caching: keep durable system / tool / skill / reference material ahead of volatile per-turn conversation, fresh tool results, timestamps, and user-specific payloads when the runtime exposes prompt assembly order. Evidence capsules that preserve source, claim, status, implication, and re-open condition after raw material is dropped, and observation masking for large tool outputs. Distillation patterns for logs, whole files, tool results, exposed reasoning traces, subagent reports, completed debugging branches, long conversations, and multi-page docs. Drift detection signals (re-reading the same source, fix ideas changing every turn, unbounded search, forgotten proofs, repeated paraphrases, contradicted plans, superseded tool results), the four live-window pathologies (poisoning / distraction / confusion / clash), the reset rule for changing active questions, and the reset-threshold signal for when a clean restart beats more distillation. Runtime primitives that support the discipline — compaction, prompt caching / prefix reuse, tool-result or reasoning-block clearing / context editing, session trimming or summarization, memory or progress files, subagents, programmatic tool filtering — with the boundary that none of them replaces agent judgment. The compaction-ready handoff format with its required fields (task / question / hypothesis / proven facts / rejected paths / next step), high-recall-first then precision-tightened writing, durable checkpoint placement, and the under-thirty-seconds resume test. The selective-rebuild recipe for recovery after the thread is lost. A vocabulary bridge that maps this skill's home-grown terms to the industry-standard names (compaction, structured note-taking / agentic memory, just-in-time / progressive-disclosure retrieval, prompt caching, tool-result clearing, observation masking, context isolation) so the discipline travels across vendor docs and runtimes, with an outbound source trail recording the provenance of every web-derived concept carried in.

## Philosophy of the skill

Context management is the practical layer between _having_ the right information available somewhere in the workspace and _having_ it active in the agent at the right moment. The goal is _not_ to load more context — it is to keep the smallest working set (the _minimal effective context_) that still lets the agent act correctly. Without this discipline, agents speculate from stale assumptions, re-read sources they already processed, and lose the decision trail at the moment of compaction. Every context slot occupied by noise is a slot unavailable for the evidence that would actually resolve the current question.

The small-working-set rule is empirical, not aesthetic — it is grounded in how the models behave. Long-context research and current vendor guidance converge on the same operational fact: a larger context window increases what can fit, but it does not make every fitted token equally useful. As input grows, recall and accuracy _tend to_ degrade — non-uniformly, position-dependent, and worse when distractors are present — rather than as a clean monotonic "every fact gets harder" rule. This is now named **context rot**, observed across the current generation of frontier models, not as a quirk of one vendor. It has three compounding mechanisms: the _lost-in-the-middle_ effect (models attend well to the start and end of context but poorly to the middle), _attention dilution_ (every added token competes for a fixed attention budget), and _distractor interference_ (content semantically similar to the question but irrelevant actively misleads). The practical consequence: a large, mostly-noise window can reason _worse_ than a much smaller window that is all signal. A million-token window is capacity, not permission to flood the session; you cannot reliably prompt your way out of it and a bigger window does not fix it. The smallest high-signal working set is the most durable lever, and it is the lever this skill operates. Treat context as scarce attention, not storage.

The hardest part is not what to load. It is _what to drop_. Disproven hypotheses, raw logs after the key pattern is extracted, full files after the needed lines are identified, old plans after the question changed, tool outputs after their conclusions are captured, and exposed scratch reasoning after its decisions are captured all continue to steer reasoning until they are _deliberately_ removed or demoted. The working set is what the agent is actively reasoning over, not everything it has ever seen.

Automatic compaction, session memory, context editing, tool-result clearing, prompt caching, and subagents do not obsolete this skill. They automate mechanics: trimming, summarizing, clearing, ordering, isolating, or storing. They do not decide which fact is load-bearing, which assumption is falsified, which source should be reopened, which context is stable enough for a reusable prefix, or which handoff detail lets a cold successor resume. This skill owns that judgment — ensuring the core meaning is preserved _before_ automation blindly truncates it.

## 1. Outcomes

| Job | What success looks like | Common failure |
| --- | --- | --- |
| Intake | Only task-critical evidence is loaded first | Reading five files before the problem is named |
| Working set | The active context matches the _current_ question; smallest high-signal set | Old assumptions keep steering new work; reasoning over a window mostly full of noise and stale logs |
| Distillation | Raw input is replaced by a smaller claim with provenance | Summary drops the trigger, invariant, uncertainty, or source |
| Drift recovery | The agent notices the question or evidence changed and resets active state | A disproven plan continues under a new label |
| Handoff | Another session can resume from a small durable checkpoint | Compaction keeps prose but loses the decision trail |
| Rebuild | The agent can restart from evidence without warming up everything | Re-reading the whole workspace recreates the original drift |

## 2. The Active Context Contract

At any point in a serious task, the active working set should be explainable in this compact contract. Make it an explicit, structured object you maintain _live_ — not a vague mental model. These are the same fields the handoff (Section 8) freezes at compaction time: the handoff is just this contract written down at the moment the session ends, so there is nothing to assemble under pressure when compaction fires.

```text
Task: <ticket, file, user request, or short label>
Active question: <one sentence>
Current hypothesis: <one claim being tested, with its supporting evidence>
Loaded evidence: <source -> why it is active now> (as capsules, §5)
Rejected paths: <falsified assumptions and why they are out>
Next verification: <one concrete check>
Handoff location: <where the durable checkpoint lives, if any>
```

If any line is hard to fill, do not load more context yet — first clarify the missing line. The contract is not ceremony; it lets the agent distinguish useful uncertainty from context panic, and it prevents the agent from "guessing" what it is doing based on the last few turns of history.

## 3. The Context-Management Loop

Use this loop whenever a task starts, sprawls, changes direction, or feels noisy:

1. **Define the active question** in one sentence.
2. **Name the minimum evidence** that would answer it — both the _prove_ set and the _disprove_ set.
3. **Load the cheapest source that can answer the question**: index, search result, symbol list, line slice, small doc section, then only if necessary the full file, full transcript, or complete tool result. (This is _just-in-time_ / _progressive-disclosure_ loading — pull data in by reference at the moment it is needed, rather than front-loading everything.)
4. **Collapse confirmed facts and completed branches** into a short checkpoint the agent can re-read later. A finished subtask or trial-and-error branch should become one result line plus source handles, not remain as raw intermediate turns. Once the window has grown long, re-state that checkpoint near the _end_ of the active context rather than leaving it only where it was first written: because models attend most strongly to the most recent tokens (the recency end of the lost-in-the-middle curve), the live plan and proven facts steer most reliably while they sit near the bottom of the window. Treat this as an occasional attention repair — done when the checkpoint has drifted up out of recent context — not as a mandate to repeat it every turn.
5. **Drop stale or disproven assumptions** from the active thread — disprove ≠ delete-from-history, but delete-from-active-context. When you drop a disproven hypothesis, leave a _one-line rejected-path marker_ in the checkpoint (`tried X — ruled out because Y`) so the freed context is not re-spent re-exploring the same dead end on a later turn. Drop the raw evidence; keep the one-line verdict.
6. **Re-check whether the active question changed** before reading more. If yes, restart the loop and re-triage remaining sources. Do not drag old context along.

The loop is recursive — every "load more" decision restarts it. The goal is not to never read; it is to read _only when evidence demands it_.

## 4. Intake Triage — Four Buckets

Before reading anything large, sort every candidate context source into one of four buckets:

| Bucket | Load now? | Carry form | Examples | Rule |
| --- | --- | --- | --- | --- |
| **Must-have** | Yes | Source slice, or full source if the whole source is the object of work | User-named file, failing route, exact error, owning skill, current diff | Read first, narrowly when possible |
| **Useful soon** | Maybe | Identifier, search query, path, symbol name, source URL | Neighbouring docs, related tests, adjacent skill files | Keep as a pointer until the active question stabilizes |
| **Durable background** | Rarely | Index entry, README heading, memory-file name, issue ID | Architecture overview, long design guide, complete module README | Carry as a handle / use the index first; slice narrowly only if the index points there. If genuinely loaded, order it with the stable prefix (below) so it does not bloat the active window |
| **Noise** | No | Nothing | Adjacent-but-unneeded files, unrelated generated output, stale one-off scripts | Ignore unless later evidence points there |

### Intake rules

- Start from the user's _concrete_ artefact: the named file, pasted error, failing test, ticket, or requested source — before loading background.
- Prefer an _owning_ doc or source file over a broad repo-wide reference.
- Prefer a _search result_ over a full-file read.
- Prefer _one decisive slice_ over three speculative reads.
- Prefer a path, symbol, URL, command, or query as the temporary carrier when the content itself is not needed yet.
- If you cannot explain — out loud, in one sentence — _why_ a source is being loaded, do not load it.

### Just-in-time loading

Modern agent platforms increasingly support just-in-time context: skills load on demand, tools fetch data only when called, subagents isolate exploration, sessions can trim history, and compaction summarizes older turns. Use those features to support the same discipline: keep lightweight identifiers in the main window until the current question requires the full content.

The portable rule is: **carry handles until you need payloads**. A file path, line range, issue ID, URL, grep query, tool-call ID, or memory filename is often enough to preserve discoverability without paying the attention cost of the full source. Load the payload only when the handle is insufficient for the next verification.

### Agent memory hierarchy analogy

Use this as an access-cost mental model, not as a runtime contract. The four buckets decide whether a source is _relevant_; the hierarchy decides _where_ relevant information should live until the active question needs it.

| Level | Location | Cost | Keep there when |
| --- | --- | --- | --- |
| **L1 active window** | Immediate prompt, current turn, live checkpoint | Highest attention cost | The fact is needed for the current reasoning step |
| **L2 working set** | Recently read slices, distilled notes, evidence capsules | High token cost | The source is being manipulated, compared, or verified now |
| **L3 session history / durable checkpoint** | Transcript, progress file, memory file, task comment, handoff | Medium drift or retrieval cost | The fact must remain recoverable but should not steer every turn |
| **L4 workspace / tool space** | Files, docs, issues, URLs, commands, search queries | Low attention cost, higher tool-call cost | A handle is enough and the payload can be reopened on demand |

Promote information upward only when the next verification needs it. Demote it as soon as its claim, provenance, and re-open condition have been captured. This is the cache analogy behind the four buckets: do not pay L1 attention for L4 discoverability.

### Stable-prefix ordering for prompt caching

Prompt caching is a runtime optimization, but the context-management decision is _ordering_. When a runtime reuses exact prompt prefixes and you can influence prompt assembly, keep low-churn material before high-churn material so the cacheable prefix stays stable:

| Stable prefix candidates | Volatile tail candidates |
| --- | --- |
| Tool definitions, system instructions, loaded skills, stable project rules, reusable reference excerpts, examples | Current user request, per-turn scratch notes, fresh tool outputs, timestamps, temporary hypotheses, the live checkpoint, user-specific payloads |

Do not fight the runtime's required instruction order. Within the regions you control, keep the reusable prefix stable and place the changing payload after it. A tool output or scratch note that changes every turn should usually become a handle, capsule, or masked observation in the active working set rather than being inserted into the stable prefix. Note the corollary: clearing or editing content the cache had already warmed _invalidates_ that prefix downstream, so eviction is not free (see §7). Token thresholds, cache duration, cache keys, pricing, and billing math belong to `context-window` or runtime documentation; this skill owns only the context-ordering judgment.

## 5. Working-Set Shaping

The working set is what the agent is _actively reasoning over_ — not everything it has ever seen.

### Keep these active

- The current problem statement
- The current hypothesis
- The smallest evidence set that can _prove or disprove_ it
- The facts already verified and still relevant to the current question
- The rejected-path markers that prevent repeated dead ends
- The next verification step

### Push these out

- Raw logs after the repeating pattern and trigger are extracted (keep the capsule)
- Raw tool results (search output, command dumps, file reads) once the extracted fact is recorded — clearing stale tool output is the lightest-touch, lowest-risk form of compaction in an agentic loop, because the agent rarely needs to re-read a raw result after it has acted on it
- Full files after the needed symbols, lines, and invariants are identified
- Alternative hypotheses that have already been disproven, after their one-line rejected-path marker is written (not deleted blind)
- Background docs once their actionable rule has been distilled
- Subagent / sub-task reports once their conclusion is captured — a delegated agent's full transcript is bulk; keep its verdict capsule, drop the transcript
- Exposed reasoning traces, thinking-block summaries, or scratch plans after their decisions, surviving assumptions, rejected paths, and next checks are captured — on reasoning models the model's own extended-thinking blocks bloat the window as fast as raw tool output, so summarize the conclusion into a capsule and let the trace fall away rather than carrying every deliberation forward
- Prior plans after the active question has changed
- Intermediate subtask branches after their conclusion, evidence handle, and residual risk are captured

### Evidence capsules

Use an evidence capsule when a source is too large to keep active — so a fact survives the drop of its raw source without losing the trail back:

```text
Source: <path:line, URL, tool result, or command>
Claim: <what this source proves or disproves>
Status: <proven | assumed | likely | contradicted | needs recheck>
Implication: <what this changes about / lets you decide about the active question>
Re-open if: <condition under which the raw source must be read again>
```

The capsule is not a prose summary for its own sake — it is an _auditable substitute_ for raw context, and it is what lets you push the raw evidence out while keeping everything reasoning depends on. If the capsule does not say _when to re-open_ the source, it is probably too lossy.

### Observation masking

When the raw observation is large but the fact that the observation _happened_ still matters, replace it with a compact masked observation that doubles as an evidence capsule — preserving the result, key fields, source handle, and re-open condition:

```text
[Output masked: tool-call-17 GET /items -> HTTP 200; 50 items; item #42 status=error; re-open if the item #42 remediation fails or another field becomes relevant]
```

Masking is only safe _after_ the extracted fact is written somewhere auditable. A masked line that says only "output omitted" is not a capsule; it hides evidence without preserving the decision trail.

### Distillation pattern

| Raw input | Keep in active context instead |
| --- | --- |
| 300-line error log | Repeating error + trigger + first failing boundary (2-line summary) |
| Whole component file | Function or class name + line slice + the one invariant that matters |
| Large skill body | The one rule that changes the current decision + boundary owner |
| Long conversation thread | Current state + blocker + next step + rejected paths |
| Multi-page doc | Section heading / URL / line range + the claim it supports |
| Verbose tool / command output (e.g. large JSON) | Masked observation + key fields + interpretation + re-open condition |
| Exposed reasoning trace / scratch plan / thinking block | Decision + surviving assumptions + rejected paths + next verification; do not preserve verbatim scratch reasoning |
| Subagent report | Answer + evidence list + unresolved questions + changed files |
| Completed debugging branch | Outcome + why it worked or failed + any remaining risk |

The distillation is the _artefact_ — write it into the active conversation or checkpoint, then drop the raw input. A conversation-only distillation is durable enough for the live session, but it is _not_ durable across compaction, restart, or handoff. Anything a successor must rely on belongs in a durable artefact: progress file, memory file, task comment, commit message, patch note, or other explicit checkpoint the session can re-read. (Writing the working summary to a re-readable file is _structured note-taking_, sometimes called agentic memory — the same move as the in-conversation checkpoint, just persisted outside the window so it survives a compaction or restart.)

## 6. Drift Detection and Reset

Context drift means the session is no longer solving the same problem it started with, _or_ is still reasoning from assumptions that have already been falsified.

| Drift signal | What it usually means | Response |
| --- | --- | --- |
| Re-reading the same source repeatedly | The active question is vague | Rewrite the question and search narrower |
| Fix ideas change every turn | No anchored hypothesis | Stop implementing; restate the evidence; pick one hypothesis to test |
| New files keep getting pulled in | Search space is unbounded | Identify the _first failing boundary_ and stay there |
| The agent forgets what was already proven (state fragmentation) | Facts were never collapsed into a checkpoint | Write the checkpoint _before_ continuing |
| The agent re-explores a path already ruled out | The rejection was deleted, not recorded | Keep the one-line rejected-path marker in the checkpoint |
| The agent restates earlier conclusions in different words | Active context is too large to scan | Distil and drop the original sources |
| The agent keeps defending a contradicted plan | Disproven assumption still has active weight | Name the contradiction; move the plan to rejected paths |
| The agent drifts off core instructions (constraint erosion) | System rules buried mid-window under accumulated history | Re-cite the live checkpoint and active constraints near the recency end |
| The user changes the objective mid-session | Old context is now partly stale | Restart the loop from the new active question |
| A tool result is still cited after newer evidence superseded it | Raw output outlived its usefulness | Replace the raw output with an updated capsule |

### Live-window pathologies

These are failure modes of the active window itself. Recognising the named mode tells you _which_ corrective move applies. They complement `context-engineering`'s system-level missing / stale / wrong / overwhelming taxonomy; they do not replace it.

| Pathology | What it is | Corrective move (this skill) |
| --- | --- | --- |
| **Poisoning** | A false or hallucinated fact enters context and is then cited as true | Mark its capsule `contradicted`/`refuted`; drop it from the active thread, keep the rejected-path marker — never leave it as an unresolved possibility |
| **Distraction** | The window grows so large the model over-weights its own history over fresh evidence | Distil and drop raw inputs; restate the contract near the recency end; compact at a logical boundary |
| **Confusion** | Irrelevant-but-loaded content steers the answer (the distractor-interference mechanism) | Re-triage harder at intake; keep only must-have and current useful-soon items; remove sources that fail the "why is this loaded?" test |
| **Clash** | Two loaded sources, instructions, tools, or hypotheses contradict and the model averages them | Resolve to one capsule with an explicit `Status`; keep exactly one active hypothesis; drop the loser and record why |

_Designing_ the system that prevents these at the library level — injector quality, retrieval architecture, failure metrics — is `context-engineering`'s job, upstream of this skill.

### Anti-drift rules

- **One active hypothesis** at a time.
- **One primary question** at a time.
- **One verification target** at a time.
- When evidence contradicts the plan, _update the checkpoint_ before moving on. Do not silently abandon the contradicted hypothesis — record it as a rejected path so the contradiction is not forgotten and re-litigated.
- When a branch completes, fold it into a result capsule and drop the branch's raw trial-and-error.
- When the question changes, carry forward only facts that directly support the new question.

### Reset rule and reset threshold

When drift is detected, do not keep pushing. Reset the active contract:

1. Freeze the old checkpoint in one short paragraph.
2. Name the new active question.
3. Carry forward only facts that directly support the new question.
4. Move contradicted plans and old assumptions to rejected paths.
5. Reclassify every remaining source into the four intake buckets before reading more.

There is a point past which distillation stops paying off and a clean restart is cheaper. **Reset threshold:** when the window is so polluted that the agent repeatedly ignores the live checkpoint, contradicts facts it just captured, or each distillation pass is immediately re-bloated — stop distilling in place. Write a durable checkpoint, then trigger a deliberate restart / compaction and rebuild selectively (§9) from that checkpoint rather than attempting yet another in-place trim.

## 7. Runtime Primitives That Support Context Management

These primitives are now common across agent runtimes and major libraries. They _support_ context management; they do not _replace_ it.

| Runtime primitive | What it automates | What stays the agent's call | Boundary |
| --- | --- | --- | --- |
| **Server-side or automatic compaction** | Summarizes older conversation history as the window approaches limits | Which facts, decisions, rejected paths, and next steps must survive | `context-window` owns trigger thresholds and budgets |
| **Prompt caching / prefix reuse** | Reuses stable prompt prefixes across requests | Which context is stable enough to sit before volatile per-turn payloads, and what must remain in the tail | Exact token thresholds, retention windows, cache keys, and billing belong to runtime docs / `context-window`; prompt wording belongs to `prompt-craft` |
| **Context editing / tool-result or reasoning-block clearing** | Removes old, re-fetchable tool outputs or verbose exposed scratch/reasoning blocks while preserving the fact that they happened | Which output or trace is safe to clear, what extracted fact replaces it, and when to re-open | `tool-call-strategy` owns the tool choice; this skill owns what survives. Do not preserve private reasoning verbatim; preserve evidence-backed decisions |
| **Session trimming / summarized short-term memory** | Keeps recent messages or replaces older messages with summaries | Which history is stale, which current goal supersedes it, and whether "yesterday's plan" is still valid | Persistent retention policy is out of scope |
| **Memory / progress files / structured notes** | Stores facts outside the active window and retrieves them on demand | Which note is load-bearing for the current task and what belongs in the live checkpoint | Long-term memory _curation_ is out of scope |
| **Subagents or isolated child sessions** | Moves exploratory context into a separate window and returns a report | What question to delegate, what evidence the subagent must return, and what summary enters the main window | Delegation policy may involve `tool-call-strategy` |
| **Programmatic tool filtering / sandboxed processing** | Filters or aggregates large external data before it reaches the model context | Whether the filtered result is sufficient evidence and what raw source handle remains | Tool protocol and security belong to tool-use / guardrail skills |

### Three properties that change how you _use_ these primitives

Knowing the cost is agent-side discipline; configuring the policy is `context-window`'s job.

- **A cleared tool result usually leaves a placeholder** — the model keeps _awareness_ that a result existed, without its content. Clearing is not amnesia: the agent can re-fetch by reference if the capsule's "Re-open if" fires.
- **Eviction is not free** — dropping content the prompt cache had warmed invalidates that cache prefix, so reflexively clearing on every turn trades a token saving for a recompute cost. Clear only after a capsule has replaced the raw content _and_ enough tokens are freed to justify breaking the prefix — not on a timer.
- **Persisted memory is durable; the live window is not** — a fact written only into the window dies at compaction, while a fact written to a re-readable file survives. Persist anything the next session must not re-derive.

**Upstream-displacement check:** no current runtime fully supersedes this skill. Anthropic, OpenAI, OpenCode, and LangChain now expose stronger prompt caching, compaction, clearing, trimming, memory, and isolation mechanisms. Those are mechanical supports. The unsolved part is still selection judgment: what is load-bearing, what is stable enough for a reusable prefix, what is stale, what is falsified, what should be reopened, and what a successor needs.

## 8. Compaction-Ready Handoffs

This skill does not own token math or compaction triggers. It owns _handoff quality_ — the artefact a successor agent reads when the current session compacts, restarts, or hands over.

The handoff is the **Active Context Contract** (Section 2) frozen at the moment the session ends — same fields, written down. So the work is not a separate ritual: if you have kept the contract live, the handoff already exists.

Modern runtimes increasingly compact **automatically** — summarizing and re-initiating the window when it nears its limit, trimming session history, and clearing stale tool results without a manual "write the handoff now" moment — so you often do not choose _when_ compaction fires. The defensive consequence: keep the checkpoint **continuously fresh** as a living artefact. A handoff you only intend to write "before compacting" is a handoff you can lose to an automatic compaction you did not see coming.

Before any compaction, restart, or handover — and in the living contract you maintain throughout — preserve these fields:

1. **The active task** (identifier, link, or short description)
2. **The current question** (one sentence)
3. **The strongest supported hypothesis** (and the evidence supporting it — may ride with proven facts)
4. **The evidence already verified** (proven facts the next session should not re-prove, as evidence handles/capsules)
5. **The rejected paths** (one-line `tried X — ruled out because Y` markers, so the successor does not re-explore a dead end you already closed)
6. **The next concrete step** (the action a successor would take if they had no other context)

Rejected paths are not optional padding: omitting them is the single most common way a resumed session burns its first hour re-walking a path the prior session had already falsified.

Write the first pass **high-recall**: err toward keeping every fact that might be needed to resume. Then tighten for **precision** by cutting the genuinely superfluous detail. It is cheaper to trim an over-complete handoff than to reconstruct a fact a terse one dropped.

### Good handoff format

| Field | Example |
| --- | --- |
| Task | `ABC-123` (a single task ID or link) |
| Question | "Why does the settings save path ignore org scope?" |
| Hypothesis | "The save route calls the unscoped query helper instead of the org-scoped one." |
| Proven facts | "The route uses an unscoped query helper, not the org-scoped one; failure reproduces only for non-owner roles." |
| Rejected paths | "Not a session bug — auth claims are correct." |
| Next step | "Patch the org-scoped update path; rerun the failing request." |

If the handoff cannot tell another agent _where to start_ in under thirty seconds of reading, it is incomplete. Optimise for the _cold start_, not for the agent that already has full context.

## 9. Recovery After Lost Context

When the thread is lost — after compaction, after a session restart, after a long context-switching gap — rebuild _selectively_, in this order:

1. **Re-read the user request** (the canonical task statement, not your own paraphrase).
2. **Re-read the last checkpoint** (the durable contract, continuation artefact, or most recent agent-written summary).
3. **Re-open only the files that directly support the current question** — not "everything that might be relevant." Omit any raw source already distilled into an evidence capsule.
4. **Reconstruct the current hypothesis from evidence** (and the current file state), not from memory of what you used to think.
5. **Resume from the next unverified step.**

Do not "warm up" by re-reading everything. Recovery is a _selective_ rebuild, not a context flood. Loading 30 files to "get back into the task" recreates the original drift on a fresh canvas.

## 10. Vocabulary and Source Trail

This skill uses task-level operational names so an agent can act without first learning one vendor's vocabulary. The table maps those names to terms used in current agent-engineering docs — for recognition and transfer, not scope expansion. The mechanisms those terms name as _runtime features_ (configuring a context-editing policy, wiring a persistent memory store, sizing per-zone token budgets) belong to the runtime and to `context-window` / a persistent-memory skill, not here. This skill owns the agent-side _discipline_ that uses them well.

| This skill's term | Wider-field name | Note |
| --- | --- | --- |
| Collapse facts into a checkpoint; recite it | Compaction; structured note-taking; agentic memory | The checkpoint is the curated state that survives summarization or restart |
| Carry handles until you need payloads | Just-in-time retrieval; progressive disclosure | Pull data in by reference at the moment of need |
| Stable-prefix ordering | Prompt caching; prefix caching | Keep reusable context before volatile per-turn payloads when exact-prefix caching matters |
| Push raw tool output or scratch reasoning out after acting | Tool-result clearing; context editing; reasoning-block clearing; observation masking | Clear raw bloat only after the extracted fact, decision, and re-open handle exist |
| Fold completed branches | Context folding; summarization of branch state | Collapse trial-and-error once the branch has an outcome |
| Split exploration from main reasoning | Context isolation; subagents | Keep exploratory noise out of the main active window |
| Noise / stale logs / distractors left active | Context pollution | Irrelevant tool output or stale history that pulls attention from the goal |
| One active hypothesis; smallest evidence set | Defending against context rot | The empirical reason the smallest high-signal working set wins (see Philosophy) |

This bridge prevents the skill from silently re-inventing terms the field has already settled.

### Outbound source provenance

Provenance for the web-derived concepts this skill carries (each entry: source + why it is cited). These are **recognition pointers, not required reading**, and they are deliberately _not_ registered as drift-tracked `truth_sources` — the skill stays principle-grounded and portable rather than citation-bound.

| Source | URL | Why cited |
| --- | --- | --- |
| Anthropic, "Effective context engineering for AI agents" | https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | Compaction recall-then-precision, tool-result clearing, structured note-taking, subagent isolation, just-in-time retrieval, smallest-high-signal-token framing |
| Anthropic Claude Cookbook, "Context engineering: memory, compaction, and tool clearing" | https://platform.claude.com/cookbook/tool-use-context-engineering-context-engineering-tools | Distinguishes compaction, tool-result clearing, and memory as separate first-party-supported primitives |
| Anthropic API docs, Compaction | https://platform.claude.com/docs/en/build-with-claude/compaction | Confirms automatic / server-side compaction as a current runtime primitive, not merely a manual pattern |
| Anthropic API docs, Context editing | https://platform.claude.com/docs/en/build-with-claude/context-editing | Tool-result and thinking-block clearing; the placeholder and need-to-preserve-before-clearing behavior; cache-prefix invalidation |
| Anthropic API docs, Prompt caching | https://platform.claude.com/docs/en/build-with-claude/prompt-caching | Prompt-cache prefix ordering, breakpoint placement, and invalidation when earlier prompt parts change |
| Anthropic API docs, Memory tool | https://platform.claude.com/docs/en/agents-and-tools/tool-use/memory-tool | File-backed memory as just-in-time retrieval and cross-session persistence |
| Anthropic API docs, Programmatic tool calling | https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling | Filtering or aggregating large tool data before it reaches the model context |
| OpenAI API docs, Prompt caching | https://developers.openai.com/api/docs/guides/prompt-caching | Exact-prefix matching and the static-before-variable prompt-ordering rule |
| OpenAI Agents SDK, Sessions | https://openai.github.io/openai-agents-python/sessions/ | Session history as automatic short-term memory that can carry stale state forward |
| OpenAI Cookbook, Session memory | https://developers.openai.com/cookbook/examples/agents_sdk/session_memory | Trimming/compression for keeping agents anchored to the latest goal and avoiding stale-history amplification |
| OpenCode docs, Agents | https://opencode.ai/docs/agents/ | Built-in subagent roles and automatic compaction / summary agents |
| OpenCode docs, Config | https://opencode.ai/docs/config/ | Configurable auto-compaction, pruning of old tool outputs, and reserved compaction buffer |
| LangChain docs, Short-term memory | https://docs.langchain.com/oss/python/langchain/short-term-memory | Trim / delete / summarize / custom message-filtering strategies |
| LangChain blog, Context Engineering for agents | https://www.langchain.com/blog/context-engineering-for-agents | Write / select / compress / isolate strategy vocabulary and subagent context isolation |
| Manus, "Context Engineering for AI Agents: Lessons from Building Manus" | https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus | Recitation-as-attention-lever (recite the live plan at the recency end) and deliberate rejected-path preservation |
| Chroma Research, "Context Rot" report | https://research.trychroma.com/context-rot | Empirical, non-uniform degradation of recall as input grows: lost-in-the-middle, attention dilution, distractor interference |
| Chroma `context-rot` repository | https://github.com/chroma-core/context-rot | Reproducibility provenance for the Context Rot report |
| Liu et al. (2023), "Lost in the Middle: How Language Models Use Long Contexts" | https://arxiv.org/abs/2307.03172 | Foundational evidence for the positional-attention (start/end strong, middle weak) effect named in Philosophy and §4 |
| Drew Breunig, "How Long Contexts Fail" | https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html | The poisoning / distraction / confusion / clash live-window taxonomy in §6 |
| Drew Breunig, "How to Fix Your Context" | https://www.dbreunig.com/2025/06/26/how-to-fix-your-context.html | Pruning, summarization, quarantine/isolation, offloading vocabulary |

## Verification

- [ ] I can state the active question in one sentence
- [ ] I can fill the active-context contract (task / question / hypothesis / evidence / rejected / next step / handoff location) without hand-waving
- [ ] I know — and could explain — why each currently loaded source is in context
- [ ] I am carrying handles for useful-soon sources instead of payloads I do not yet need
- [ ] I have reduced raw inputs — including subagent reports and my own reasoning traces — into smaller written evidence capsules or checkpoints with provenance and re-open conditions
- [ ] I have replaced large tool outputs and exposed reasoning traces with masked observations or decision capsules before clearing them
- [ ] Stable reusable context is ordered before volatile per-turn context when prompt caching / prefix reuse matters
- [ ] I have removed or ignored disproven hypotheses from the active thread while preserving one-line rejected-path markers
- [ ] I have folded completed branches into result capsules instead of leaving trial-and-error active
- [ ] The handoff is just my live contract frozen — kept continuously fresh against automatic compaction, not deferred to a moment I might not control — with all required fields
- [ ] I am loading new context because _evidence demands it_, not because I feel uncertain
- [ ] One active hypothesis, one primary question, one verification target — no exceptions
- [ ] A successor agent could resume from my checkpoint in under thirty seconds
- [ ] Any outbound URL or external source carried into the active context has provenance and a reason for inclusion

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `context-window` | Calculating per-zone token budgets, compaction thresholds, model context limits, cache pricing, or 1M-vs-200K decisions |
| `prompt-craft` | Writing or improving a prompt template — wording, structure, format constraints, examples, or instruction hierarchy |
| A persistent-memory curation skill | Curating cross-session memory files, pruning the memory index, deciding what _survives_ across many sessions |
| `context-graph` | Designing the architectural model for the multi-graph context system itself |
| `context-engineering` | Designing the system-level information architecture, injector quality, retrieval payloads, context metrics, or failure-mode taxonomy across the full stack — context-engineering is upstream of this skill |
| `summarization` | Condensing selected prose for a human or successor once the working-set selection decision is already made |
| `code-review` | Reviewing AI-generated code for correctness, security, maintainability, or merge readiness — orthogonal concern |
| `tool-call-strategy` | Deciding which tool to call next, how to batch calls, or whether a script should replace many calls — context-management is the _input_ to that decision, not the decision itself |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops`
- Public: `true`
- Domain: `agent/context`
- Scope: Deciding what to load into an active agent session, recovering from context drift, preparing compaction or restart, distilling raw inputs into a working summary, and writing a resumable handoff — intake triage, the active-context contract, the six-step context-management loop, working-set shaping, evidence capsules, observation masking, just-in-time handle-before-payload loading, prompt-caching alignment, context-rot defenses, drift signals, anti-drift reset rules, the runtime-primitives boundary, compaction-ready handoffs, and selective rebuild after context loss. Portable across any agent session; principle-grounded, not repo-bound. Excludes token math (context-window), prompt wording (prompt-craft), persistent memory curation, and multi-graph context architecture (context-graph).

**When to use**
- the session feels noisy and I'm re-reading the same files — what discipline pulls it back?
- the agent keeps citing assumptions that were already disproven — how do I clear them out?
- I'm about to compact — what do I need to preserve so the next session resumes correctly?
- the thread is lost; what's the recipe for rebuilding only what's needed instead of warming up everything?
- I have a 300-line error log and a 600-line component file in context — how do I distill them?
- the active question changed three times this session — how do I prevent the old context from steering the new one?
- this conversation has 40K tokens of evidence; what should the working set actually contain?

**Not for**
- calculate the per-zone token budget for the 200K context window
- improve this prompt template for the grader
- curate the persistent memory index file
- design the multi-graph architecture for skills + docs + memory
- review this AI-generated PR for correctness
- why is this skill not routing — fix the keyword config

**Related skills**
- Verify with: `context-engineering`
- Related: `prompt-craft`, `tool-call-strategy`, `context-engineering`, `context-graph`, `summarization`

**Keywords**
- `context management`, `working set discipline`, `intake triage four buckets`, `context drift recovery`, `context management loop`, `compaction-ready handoff`, `distill raw inputs`, `one active hypothesis`, `selective context rebuild`, `lost-thread recovery`

<!-- skill-graph-context:end -->
