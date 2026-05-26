---
name: context-management
description: "Use when deciding what to load into an active agent session, recovering from context drift, preparing compaction or restart, distilling raw inputs into a working summary, or writing a handoff another agent can resume quickly. Covers intake triage, the six-step context-management loop, working-set shaping, evidence-first loading, drift signals, anti-drift rules, compaction-ready handoffs, and selective rebuild after context loss. Do NOT use for token math (use `context-window`), prompt wording (use `prompt-craft`), persistent memory curation, or multi-graph context architecture (use `context-graph`)."
license: MIT
compatibility: Runtime-agnostic. The intake-triage / loop / drift / handoff discipline applies to any LLM-coding harness regardless of context window size or compaction implementation.
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: know
  category: agent
  subject: agent-ops
  domain: agent/context
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-06"
  drift_check: "{\"last_verified\":\"2026-05-06\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"context management\",\"working set discipline\",\"intake triage four buckets\",\"context drift recovery\",\"context management loop\",\"compaction-ready handoff\",\"distill raw inputs\",\"one active hypothesis\",\"selective context rebuild\",\"lost-thread recovery\"]"
  examples: "[\"the session feels noisy and I'm re-reading the same files — what discipline pulls it back?\",\"the agent keeps citing assumptions that were already disproven — how do I clear them out?\",\"I'm about to compact — what do I need to preserve so the next session resumes correctly?\",\"the thread is lost; what's the recipe for rebuilding only what's needed instead of warming up everything?\",\"I have a 300-line error log and a 600-line component file in context — how do I distill them?\",\"the active question changed three times this session — how do I prevent the old context from steering the new one?\",\"this conversation has 40K tokens of evidence; what should the working set actually contain?\"]"
  anti_examples: "[\"calculate the per-zone token budget for the 200K context window\",\"improve this prompt template for the grader\",\"curate the persistent memory index file\",\"design the multi-graph architecture for skills + docs + memory\",\"review this AI-generated PR for correctness\",\"why is this skill not routing — fix the keyword config\"]"
  relations: "{\"boundary\":[{\"skill\":\"context-graph\",\"reason\":\"context-graph maps the static topology — what skills, docs, memory, scripts exist and how they connect; context-management is the live working-set discipline inside one running session\"},{\"skill\":\"prompt-craft\",\"reason\":\"prompt-craft is wording and structure of one prompt; context-management is the discipline of what enters, stays in, and exits the session around any prompt\"},{\"skill\":\"context-engineering\",\"reason\":\"context-engineering is the system-level design (injector quality, failure metrics); context-management is the per-session operating discipline within that system\"},{\"skill\":\"tool-call-strategy\",\"reason\":\"tool-call-strategy decides which tool to call next for the agent's job; context-management decides what context that decision should be made against\"}],\"related\":[\"context-engineering\",\"context-graph\",\"tool-call-strategy\"],\"verify_with\":[\"context-engineering\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/context-management/SKILL.md
---

# Context Management

## Coverage

The working discipline that controls what enters, stays in, and exits an active agent session. Intake triage that sorts every candidate context source into a four-bucket classification (must-have / useful soon / durable background / noise) before any large file is read. The six-step context-management loop: state the active question in one sentence, name the minimum evidence needed to answer it, load the cheapest sources first (index → search → narrow file slice), collapse confirmed facts into a checkpoint, drop disproven assumptions from the active thread, re-check whether the question changed before reading more. Working-set shaping rules — what to keep active vs what to push out — and the distillation pattern that converts a 300-line log into a 2-line summary, a whole file into a function name plus slice plus invariant, a long conversation into current-state-blocker-next-step. Drift detection signals (re-reading the same file, ideas changing every turn, search-space unbounded, the agent forgetting what was proven) and the anti-drift rules (one active hypothesis at a time, one primary question, one verification target). The compaction-ready handoff format with five required fields (task / question / proven facts / rejected paths / next step) and the under-thirty-seconds resume test. The selective-rebuild recipe for recovering after the thread is lost.

## Philosophy

Context management is the practical layer between _having_ the right information available somewhere in the workspace and _having_ it active in the agent at the right moment. The goal is _not_ to load more context — it is to keep the smallest working set that still lets the agent act correctly. Without this discipline, agents speculate from stale assumptions, re-read files they already processed, and lose the decision trail at the moment of compaction. Every context slot occupied by noise is a slot unavailable for the evidence that would actually resolve the current question.

The hardest part is not what to load. It is _what to drop_. Disproven hypotheses, raw logs after the key pattern is extracted, full files after the needed lines are identified, alternative hypotheses that have already been falsified — all of these continue to occupy context until they are _deliberately_ removed. The working set is what the agent is actively reasoning over, not everything it has ever seen.

## 1. Outcomes

| Job         | What success looks like                           | Common failure                                      |
| ----------- | ------------------------------------------------- | --------------------------------------------------- |
| Intake      | Only task-critical context is loaded first        | Reading five files before the problem is even named |
| Working set | The active context matches the _current_ question | Old assumptions keep steering new work              |
| Handoff     | Another session can resume cleanly                | Compaction loses the decision trail                 |
| Recovery    | The agent can rebuild the thread quickly          | Re-reading everything from scratch                  |

## 2. The Context-Management Loop

Use this loop whenever a task starts to sprawl or the session feels noisy:

1. **Define the active question** in one sentence.
2. **Name the minimum evidence** that would answer it — both the _prove_ set and the _disprove_ set.
3. **Load the cheapest sources first**: index, search result, narrow file slice. Avoid full-file reads until evidence demands the rest of the file.
4. **Collapse confirmed facts** into a short checkpoint that the agent can re-read at any later turn.
5. **Drop stale or disproven assumptions** from the active thread — disprove ≠ delete-from-history, but delete-from-active-context.
6. **Re-check whether the active question changed** before reading more. If yes, restart the loop. Do not drag old context along.

The loop is recursive — every "load more" decision restarts it. The goal is not to never read; it is to read _only when evidence demands it_.

## 3. Intake Triage — Four Buckets

Before reading anything large, sort every candidate context source into one of four buckets:

| Bucket                 | Load now? | Examples                                                                 | Rule                                                               |
| ---------------------- | --------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| **Must-have**          | Yes       | The user-named file, the failing route, the owning skill                 | Read first                                                         |
| **Useful soon**        | Maybe     | Neighbouring docs, related tests, adjacent skill files                   | Load only after the active question is stable                      |
| **Durable background** | Rarely    | Broad architecture overview, long design guide, full module README       | Use the index first; slice narrowly only if the index points there |
| **Noise**              | No        | Adjacent-but-unneeded files, unrelated generated output, one-off scripts | Ignore unless evidence later points there                          |

### Intake rules

- Start from the user's _concrete_ artefact (file, error, ticket) before loading background.
- Prefer an _owning_ doc over a broad repo-wide reference.
- Prefer a _search result_ over a full-file read.
- Prefer _one decisive file slice_ over three speculative reads.
- If you cannot explain — out loud, in one sentence — _why_ a source is being loaded, do not load it.

## 4. Working-Set Shaping

The working set is what the agent is _actively reasoning over_ — not everything it has ever seen.

### Keep these in the working set

- The current problem statement
- The current hypothesis
- The smallest evidence set that can _prove or disprove_ it
- The next verification step

### Push these out of the working set

- Raw logs after the key pattern is extracted
- Full files after the needed lines are identified
- Alternative hypotheses that have already been disproven
- Background docs once their actionable rule has been distilled

### Distillation pattern

| Raw input                | Keep in active context instead                        |
| ------------------------ | ----------------------------------------------------- |
| 300-line error log       | 2-line summary of the repeating error and its trigger |
| Whole component file     | Function name + line slice + one key invariant        |
| Large skill body         | The one rule that changes the current decision        |
| Long conversation thread | Current state, blocker, next step                     |
| Multi-page doc           | The single section that answers the active question   |

The distillation is the _artefact_ — write it down, paste it into the active context, then drop the raw input. Distillation that lives only in the agent's "memory" is fragile; distillation written into the conversation is durable.

## 5. Drift Detection

Context drift means the session is no longer solving the same problem it started with, _or_ is still reasoning from assumptions that have already been falsified.

| Drift signal                                              | What it usually means                        | Response                                                             |
| --------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------- |
| Re-reading the same file repeatedly                       | The active question is vague                 | Rewrite the question and search narrower                             |
| Fix ideas change every turn                               | No anchored hypothesis                       | Stop implementing; restate the evidence; pick one hypothesis to test |
| New files keep getting pulled in                          | Search space is unbounded                    | Identify the _first failing boundary_ and stay there                 |
| The agent forgets what was already proven                 | Facts were never collapsed into a checkpoint | Write the checkpoint _before_ continuing                             |
| The agent restates earlier conclusions in different words | Active context is too large to scan          | Distil and drop the original sources                                 |

### Anti-drift rules

- **One active hypothesis** at a time.
- **One primary question** at a time.
- **One verification target** at a time.
- When evidence contradicts the plan, _update the checkpoint_ before moving on. Do not silently abandon the contradicted hypothesis.

## 6. Compaction-Ready Handoffs

This skill does not own token math or compaction triggers. It owns _handoff quality_ — the artefact a successor agent reads when the current session compacts, restarts, or hands over.

Before any compaction, restart, or handover, preserve five fields:

1. **The active task** (identifier, link, or short description)
2. **The current question** (one sentence)
3. **The strongest supported hypothesis** (and the evidence supporting it)
4. **The evidence already verified** (proven facts the next session should not re-prove)
5. **The next concrete step** (the action a successor would take if they had no other context)

### Good handoff format

| Field          | Example                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| Task           | `ABC-123` (a single task ID or link)                                                                            |
| Question       | "Why does the settings save path ignore org scope?"                                                             |
| Proven facts   | "The route uses an unscoped query helper, not the org-scoped one; failure reproduces only for non-owner roles." |
| Rejected paths | "Not a session bug — auth claims are correct."                                                                  |
| Next step      | "Patch the org-scoped update path; rerun the failing request."                                                  |

If the handoff cannot tell another agent _where to start_ in under thirty seconds of reading, it is incomplete. Optimise for the _cold start_, not for the agent that already has full context.

## 7. Recovery After Lost Context

When the thread is lost — after compaction, after a session restart, after a long context-switching gap — rebuild _selectively_, in this order:

1. **Re-read the user request** (the canonical task statement, not your own paraphrase).
2. **Re-read the last checkpoint** (or continuation artefact, or the most recent agent-written summary).
3. **Re-open only the files that directly support the current question** — not "everything that might be relevant."
4. **Reconstruct the current hypothesis from evidence**, not from memory of what you used to think.
5. **Resume from the next unverified step.**

Do not "warm up" by re-reading everything. Recovery is a _selective_ rebuild, not a context flood. Loading 30 files to "get back into the task" recreates the original drift on a fresh canvas.

## Verification

- [ ] I can state the active question in one sentence
- [ ] I know — and could explain — why each currently loaded source is in context
- [ ] I have reduced raw inputs into a smaller written working summary that lives in the conversation, not in the agent's memory
- [ ] I have removed or ignored disproven hypotheses from the active thread
- [ ] I have a handoff-ready checkpoint with all five required fields before any compaction or session restart
- [ ] I am loading new context because _evidence demands it_, not because I feel uncertain
- [ ] One active hypothesis, one primary question, one verification target — no exceptions
- [ ] A successor agent could resume from my checkpoint in under thirty seconds

## Do NOT Use When

| Use instead                        | When                                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| A context-window budget skill      | Calculating per-zone token budgets, compaction thresholds, or 1M-vs-200K decisions                                                         |
| `prompt-craft`                     | Writing or improving a prompt template — wording, structure, format constraints                                                            |
| A persistent-memory curation skill | Curating cross-session memory files, pruning the memory index, deciding what _survives_ a session                                          |
| `context-graph`                    | Designing the architectural model for the multi-graph context system itself                                                                |
| `context-engineering`              | Designing the system-level information architecture, injector quality, and failure metrics — context-engineering is upstream of this skill |
| `code-review`                      | Reviewing AI-generated code — orthogonal concern                                                                                           |
| `tool-call-strategy`               | The dispatch decision (which tool to call next) — context-management is the _input_ to that decision, not the decision itself              |
