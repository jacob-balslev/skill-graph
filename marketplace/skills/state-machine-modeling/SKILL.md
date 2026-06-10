---
name: state-machine-modeling
description: "Use when modeling lifecycle states, transitions, guards, events, side effects, invalid states, retries, statecharts, and state invariants for workflows or domain objects. Do NOT use for broad event discovery (use `event-storming`), database schema design (use `data-modeling`), frontend state-location decisions (use `state-management`), or observability instrumentation after the lifecycle already exists (use `observability-modeling`). Do NOT use for discover the domain events and policies for the whole business process. Do NOT use for create database tables and constraints for this lifecycle. Do NOT use for decide whether this React form state should live in the URL, context, or a global store. Do NOT use for instrument metrics and traces for an existing workflow. Do NOT use for debug why this job got stuck yesterday."
license: MIT
compatibility: "Portable state-machine and statechart discipline for product workflows, domain lifecycles, retries, background jobs, durable workflows, agent workflows, distributed sagas, and UI flow control."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"observability-modeling\",\"api-design\",\"debugging\",\"event-storming\",\"system-interface-contracts\",\"testing-strategy\",\"state-management\"],\"suppresses\":[\"event-storming\",\"data-modeling\"],\"verify_with\":[\"system-interface-contracts\",\"testing-strategy\"]}"
  subject: software-architecture
  public: "true"
  scope: "Use when formalizing one lifecycle's legal behavior: states, events/commands, transitions, guards, state invariants, invalid states, side effects, retries, timeouts, compensation, statecharts, actor-style communicating machines, state-bound async invocations, implementation tier, and transition verification. Includes flat finite state machines, hierarchical/parallel statecharts, and the design decision of whether to implement the lifecycle as in-process types, a persisted transition guard, a workflow/statechart library, an actor system, or a durable-execution workflow. Excludes broad domain-event discovery, persistence schema design, HTTP endpoint design, frontend state-placement decisions, and telemetry instrumentation after the lifecycle is settled."
  taxonomy_domain: modeling/state-machines
  stability: experimental
  keywords: "[\"state machine\",\"statechart\",\"lifecycle states\",\"transitions\",\"guards\",\"finite state machine\",\"invalid states\",\"status field\",\"workflow invariants\",\"state explosion\"]"
  examples: "[\"model the order fulfillment status lifecycle so invalid transitions are impossible\",\"this status field keeps growing flags - should it become a state machine?\",\"define guards and side effects for onboarding steps\",\"find impossible states in this workflow before we implement it\",\"these four booleans are multiplying into states that should never exist - how do I collapse them?\"]"
  anti_examples: "[\"discover the domain events and policies for the whole business process\",\"create database tables and constraints for this lifecycle\",\"decide whether this React form state should live in the URL, context, or a global store\",\"instrument metrics and traces for an existing workflow\",\"debug why this job got stuck yesterday\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/state-machine-modeling/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# State Machine Modeling

## Concept of the skill

**What it is:** State-machine modeling is the discipline of making one lifecycle's legal behavior explicit before implementation — what an entity can *be*, what can *happen* to it, which happenings are *legal in which state*, and what must be true before and after each transition. The whole point is to move the rules for "what can follow what" out of scattered `if`-blocks and into one inspectable model, so that the set of reachable conditions is a *deliberate enumeration* rather than the accidental product of every boolean someone added.

**Mental model — five primitives:**

- **States** — the mutually exclusive conditions one entity or workflow can occupy.
- **Events or commands** — what triggers change.
- **Transitions** — the map from `(current state, event)` to a next state *or* a deterministic rejection.
- **Guards** — pure conditions that must hold before a transition can fire.
- **Actions / side effects** — work attached to entry, exit, or the transition itself; never the state change.

**Analogy:** Treat the lifecycle like a railway switchboard — the current track segment and signal determine which next track is legal, while maintenance work and passenger notifications happen *after* the routing decision is made.

**Why it exists:** Without an explicit machine, lifecycle rules scatter across booleans, `if` branches, handlers, jobs, and UI checks. That implicit machine admits impossible combinations, makes retries ambiguous, and leaves future implementers guessing which transitions are legal.

**What it is NOT:** It is not broad domain discovery, persistence schema design, HTTP resource design, frontend state-location strategy, or post-failure debugging. Those skills compose with this one *after* the lifecycle model is clear.

**Common misconception:** A workflow engine, statechart library, or agent framework does not remove the need to model the lifecycle. It may run the model, persist progress, visualize it, or recover after crashes — but it does not decide the domain's legal states, guards, invariants, retries, or compensation semantics for you.

## Coverage

Define legal lifecycle behavior for a domain object, UI flow, background job, integration, agent workflow, or distributed process. Covers:

- **Core finite state machine** — states, initial state, terminal states, events/commands, transitions, guards, self-transitions, internal transitions, and deterministic handling of illegal events (a rejected/error trap state, a deterministic error response, or an idempotent no-effect acknowledgement).
- **State invariants** — per-state facts, cross-transition facts, forbidden combinations, and "was once" constraints (e.g. "a `refunded` order was once `paid`").
- **Actions and side effects** — entry actions, exit actions, transition actions, and **state-bound async invocations**: long-running async effects (a fetch, a subscription, a spawned child machine) whose lifecycle is *bound to a state* — started on entry and cancelled on exit, so a fire-and-forget effect can't outlive the state that launched it. Plus retries, timeouts, cancellation, idempotency, and compensation.
- **Statecharts (Harel)** — hierarchical/nested states, orthogonal/parallel regions, history states, and the escalation point where a flat machine causes state explosion or transition duplication.
- **Implementation tier** — discriminated unions or sealed types + a transition function, a persisted status + transition guard, a statechart/workflow library, an actor system, or a durable-execution engine.
- **Verification** — the transition matrix, reachability checks, invalid-transition tests, model-based tests, and machine-definition versioning checks for in-flight long-running instances.

## Philosophy of the skill

State modeling prevents boolean sprawl. When a workflow has several flags that can combine into impossible conditions, the model is *already* a state machine — just an implicit and unsafe one. `N` independent booleans represent `2^N` possible combinations, most of which are nonsense (`isPaid && isRefunded && isPending`); the discipline replaces them with one explicit lifecycle value whose variants are the handful of states that can actually occur.

**States are durations; events are instants.** A state describes a condition that holds for some span of time (`submitting`, `paid`, `waiting_for_approval`). An event or command is the instantaneous occurrence that may move the machine (`submit.clicked`, `payment.authorized`, `approval.timed_out`). This is why `Submit` is a bad state name and `Submitting` can be a good one.

The governing principle, attributed to Yaron Minsky, is **make illegal states unrepresentable**. Pursue it in three descending tiers — use the strongest your language and runtime allow:

1. **Unrepresentable** — encode the lifecycle as a closed sum type / discriminated union / sealed class / enum, with per-state data living only in the state that owns it, so the *type system itself* rejects nonsense at compile time and exhaustive handling fails type-checking when a new state is added but unhandled (TypeScript discriminated unions on a `status` literal, Rust enums with per-variant fields, F#/OCaml variants, Kotlin sealed classes; the typestate pattern threads the state through the type so a method only exists on the state that allows it).
2. **Impossible** — where the type system can't carry the full lifecycle, route *every* mutation through one transition authority `(state, event) -> next state | rejected`, so there is exactly one place that can change state and no other code path can produce an illegal combination.
3. **Detectable** — where a transition crosses a process, service, vendor, or user boundary and can't be prevented locally, make the violation *loud*: reject deterministically with a machine-actionable error and an observable signal an operator can alert on. Never make an unexpected event a silent no-op.

**Separate decision from effect.** The transition decision should be pure and replayable: given the same state, event, and guard inputs, it returns the same next state or rejection. Side effects happen *after* the transition decision is accepted, carry idempotency keys where retries are possible, and are attached deliberately to entry, exit, or the transition itself.

## Method

1. **Name the lifecycle owner.** Identify the entity/workflow whose state is being modeled, who owns the transition rules, and the single authority allowed to change state. Pick the shape that holds the state — a single status field for a flat single-axis FSM, or a structured state *value* (a sum type, or a record of concurrent region values) when there are parallel regions or per-state data. "One field" is the flat-FSM special case, not a universal requirement.
2. **List observable states as durations/conditions, not events.** Prefer nouns, adjectives, or present-participle conditions (`pending_payment`, `paid`, `submitting`, `cancelled`) over instantaneous verbs (`pay`, `ship`, `submit`). Keep them mutually exclusive. Mark the initial state and terminal states.
3. **Record state data and invariants.** For each state, write what data exists *only* in that state and what must always be true. Put shared data outside the variant; put per-state data inside it. Invariants are the spec the transition function enforces (e.g. "a `refunded` order was once `paid`").
4. **List events and commands.** Name what can trigger a transition — user commands, external events, scheduled events, timeout events, retry events, cancellation events, compensation events. Model a **timeout as an event** (`payment.timed_out`), not as ambient `if (now > deadline)` checks.
5. **Build the transition matrix.** For every `state x event` pair, record a next state, self-transition, internal action, or explicit rejection reason. Blank cells are the bug: every event in every state is either handled or deliberately refused.
6. **Add guards.** Write the condition required for each conditional transition (`approve` only fires when `amount <= limit`). Guards must be pure predicates over known state, event data, clock inputs, permissions, or already-loaded facts.
7. **Attach side effects deliberately.** Use transition actions for work caused by one edge, **entry actions** for work required no matter which edge entered the state, and **exit actions** for cleanup required no matter which edge leaves it. If async work should live only while a state is active, model it as a state-bound invocation or child actor whose result, cancellation, and error events are explicit.
8. **Model reliability states.** Name retryable, waiting, timeout, cancelled, failed, compensated, and terminal-success states where they are real domain outcomes. Include retry budget, backoff owner, max attempts, and terminal failure behavior.
9. **Define duplicate and stale-event behavior.** If the same event can arrive twice, record the event identity, idempotency key, current-state check, and replay response. If stale/out-of-order events can arrive after the machine moved on, reject or ignore them deterministically and document which.
10. **Escalate from flat FSM to statechart when needed.** Use hierarchy for shared transitions, orthogonal regions for independent axes, and history states for resumable nested flows. Do not hand-roll hierarchy and parallelism in scattered `switch` statements.
11. **Split communicating machines when one machine has multiple owners.** Treat a running machine as an actor when it owns internal state, processes events sequentially, and communicates with other machines by sending events. Do not let sibling actors mutate each other's internal state directly.
12. **Choose the implementation tier** (see "Choosing an Implementation"). The model comes first; the engine is the runtime.
13. **Write transition verification before implementation.** Test allowed transitions, forbidden transitions, guard failures, idempotent retries, stale events, terminal states, and reachability of every non-terminal state.

## Transition Matrix

The transition matrix is the central verification artifact. It turns vague lifecycle prose into a complete decision table — every `(state x event)` cell is handled or explicitly refused.

| Current state | Event / command | Guard | Next state | Action | Rejection if guard/state invalid |
|---|---|---|---|---|---|
| `pending_payment` | `payment.authorized` | amount matches order total | `paid` | reserve inventory | reject if order cancelled |
| `pending_payment` | `payment.timed_out` | deadline passed | `cancelled` | release hold | reject if already paid |
| `paid` | `refund.requested` | refund window open | `refund_pending` | start refund | reject with `refund_window_closed` |
| `shipped` | `cancel.requested` | none | `shipped` | none | reject with `cannot_cancel_shipped` |

Rules:

- A state with no inbound transition is unreachable unless it is the initial state.
- A non-terminal state with no outbound transition is a trap unless intentionally modeled as waiting for external input.
- A terminal state may accept read-only/idempotent events, but it should reject lifecycle-changing events.
- Every rejection should be deterministic enough for an API, job, UI, or operator to branch on without parsing prose.

## Flat FSM vs Statechart — when to escalate

A flat finite state machine is the right tool until **state explosion** forces a richer formalism. The trigger: when independent concerns multiply. Three independent binary axes — `online/offline` *and* `idle/syncing` *and* `authed/anon` — already imply `2 x 2 x 2 = 8` flat states, and each new axis doubles it. When the state count grows *multiplicatively* or the same transition is duplicated across many states, lift to a **statechart** (David Harel, 1987 — the formalism behind UML state machines and XState).

| Symptom | Statechart feature | Why |
|---|---|---|
| The same transition is repeated on many child states | **Hierarchical / nested state** | Define the transition on the parent superstate once — handle `cancel` on `Active`, not on each sub-state. Cuts duplicated transitions. |
| Independent axes multiply states (`online/offline` x `syncing/idle` x `authed/anon`) | **Orthogonal / parallel regions** | Model each axis as a concurrent region that holds state *additively* — `8` multiplicative states become `2 + 2 + 2 = 6`. The primary cure for boolean-product explosion. |
| A user leaves and returns to a nested flow | **History state** | Re-enter a superstate at the sub-state it was last in, without tracking that yourself (resume an interrupted wizard where the user left off). |
| Entry/cleanup work is duplicated across inbound/outbound edges | **Entry/exit actions** | Attach the effect to the state, inherited down the hierarchy, not to every edge. |

Reach for a statechart formalism or library — XState v5 is the dominant JS/TS implementation, SCXML is the W3C interchange standard, UML state machines are the diagram form — rather than hand-rolling hierarchy and parallelism, which are exactly the features hand-written `switch` statements get wrong. Stay flat when the state set is small and single-axis; the statechart is overhead you only earn when explosion or transition-duplication appears.

## Actors and State-Bound Work

A running machine can be treated as an **actor**: it owns internal state, receives events, emits events or snapshots, and processes messages through its transition logic. This is useful when a lifecycle decomposes into independent machines — parent/child UI flows, worker pools, background jobs, distributed process managers, or agent workflows. The actor boundary *is* ownership: other actors send events; they do not reach in and mutate state.

Use **state-bound invocations** for async work whose lifetime is tied to a state. Entering `loading` may invoke a fetch actor; leaving `loading` stops or cancels that actor, and any completion/error event is handled explicitly. This prevents **ghost side effects** — a response from a request started in `loading` arriving after the user `cancel`led and flipping a now-`cancelled` entity back to `loaded`. Use spawned or durable child actors only when work must *outlive* the state that started it, and then model the stop, cancellation, stale-result, and compensation paths. (Invoked actors are also a decomposition lever: when one machine grows unwieldy, split a self-contained concern into its own machine the parent invokes, rather than inlining its states.)

## Choosing an Implementation: in-process, persisted, or durable

Modeling the lifecycle is independent of *how* you run it. Decide deliberately:

| Tier | Use when | Realize as | Key risk |
|---|---|---|---|
| **In-process type** | State lives inside one request, render, or local computation and never outlives the process | Discriminated union / sealed class / enum + an exhaustive transition function. (Frontend UI flow → see `state-management` for *where* the state lives; this skill for *how it transitions*.) | Runtime events from boundaries still need validation |
| **Persisted transition guard** | State outlives a request but the workflow is short and stays in one service | A `status` (+ version/fencing) column, a transition table, and a guarded write | Race conditions and stale events if updates are not atomic |
| **Event-sourced aggregate** | You need an audit trail and state can be derived from accepted events | Fold the event stream to current state — the fold *is* the transition function | Event design, snapshots, projections, and query models belong to neighboring skills (`event-storming` / `data-modeling`) |
| **Statechart / runtime library** | UI/business logic needs hierarchy, parallel regions, visualization, model-based tests, or state-bound invocations | XState, an SCXML-compatible runtime, a UML/statechart tool, or equivalent | Overhead if the lifecycle is actually simple |
| **Actor system / communicating machines** | Independent machines own separate state and coordinate through events | Parent/child state-machine actors, an actor runtime, a process manager, or message-driven machines | Hidden shared state, unmodeled message contracts, orphaned child work |
| **Durable execution** | The workflow is long-running, distributed, crash-survivable, or human-in-the-loop | Temporal, AWS Step Functions, DBOS, Restate, Dapr Workflow, Inngest, a LangGraph-style durable graph, or an orchestrated **saga / process manager** | Engine versioning, determinism, idempotent activities, in-flight instance migration |

**Upstream-displacement check.** For the long-running, distributed, crash-survivable case, a *hand-rolled* persisted state machine is increasingly the wrong implementation. Durable-execution engines automatically persist not just the state but the **execution position** — every local variable, loop counter, and branch — and resume on different infrastructure exactly where a crash left off, eliminating the plumbing (DB writes per transition, `switch`/`case` dispatch, timeout scheduling, recovery logic) that hand-rolled machines rarely get fully correct. Temporal's own framing is that this lets you "eliminate or avoid state machines altogether" *at the implementation layer*. DBOS checkpoints workflow progress; the OpenAI Agents SDK documents durable integrations with Dapr, Temporal, Restate, and DBOS; LangGraph positions itself as infrastructure for long-running stateful agents. **This does not displace this skill:** the conceptual lifecycle — the states, the legal transitions, the guards, the invariants, the idempotency rules, the compensation steps — is exactly what you still design here and then *hand to* the engine. A **saga** coordinates a distributed transaction and compensates failed steps (the saga itself carries no state); a **process manager** *is* a state machine that drives that coordination by reacting to events plus current state. Model the lifecycle; then pick the tier.

## Agent and LLM Workflows — don't let the prompt be the state store

An LLM agent loop is a state machine whether or not you model it as one: it occupies a step, an event (a tool result, a user reply, a model turn) drives the next step, and some condition terminates it. The recurring failure is letting the **prompt / conversation history be the implicit state store** — "where the agent is" is inferred by re-reading the transcript each turn. History is lossy, unbounded, token-expensive, and non-deterministic, so the agent re-does completed steps, skips required ones, and has no crash-resumable position. Apply the same discipline:

- **Deterministic state authority** — keep the loop's state (current step, accumulated results, retry counts, what tools have run) in an explicit, inspectable structure the model *reads from*, not in free-form chat history it re-derives. The transcript is the event log; the state is the fold over it.
- **Explicit stopping conditions** — terminate on a modeled terminal state or a hard turn/step budget, never "until the model decides it's done." An unbounded loop with no terminal state is the agent equivalent of a blank transition-matrix cell.
- **Checkpoints** — persist state at each step so a crashed or interrupted run resumes from its last committed position rather than restarting. This is the durable-execution tier applied to an agent.
- **Durable, idempotent integrations** — side effects an agent triggers (a payment, an email, a write) follow the same idempotency-key and expected-version rules as any distributed machine, because the model may retry a step.

Anthropic's workflow/agent distinction reinforces the boundary: predefined, known code paths should be **workflows** (deterministic transition authority); open-ended tasks where the number of steps can't be hardcoded need **agents** with guardrails, checkpoints, and stopping conditions. Frameworks encode exactly this shape — LangGraph models the agent as a graph with checkpointed state; the OpenAI Agents SDK runs a turn loop with explicit run/stopping conditions; Temporal/DBOS supply durable execution for the orchestration. Keep transition authority deterministic when the path is safety-critical; let the model make judgments inside explicit guard/action slots, but do not let prompt text become the only state store.

## Reliability, Delivery, and Versioning (persisted & distributed machines)

Once a machine outlives a single process — a persisted status column, a queue-driven worker, a durable workflow — the network stops cooperating and the transition function must defend itself.

| Pattern | Model it as | Check |
|---|---|---|
| Retry | A retryable state + attempt count + next scheduled event | Max attempts and terminal failure are explicit |
| Timeout | A scheduled `*.timed_out` event | Timeout fires once and is idempotent |
| Cancellation | A `cancel.requested` event with state-specific legality | Cancellation after a terminal state is rejected or idempotent |
| Compensation | Forward states + compensating states/events | Compensation can itself fail and has its own terminal path |
| State-bound invocation | An invoked async actor tied to a state lifetime | Exit cancels/stops the work or makes a late completion deterministic |
| Saga / process manager | An orchestrator state machine driving local transactions | Each local step has continuation and compensation behavior |
| Duplicate delivery | Event identity + idempotency key | Same event replay returns the same result or a deterministic duplicate response |
| Concurrent / stale update | A version / fencing token at the transition authority | A stale transition cannot overwrite newer state |
| Machine-definition change | A machine version on long-running instances | In-flight instances remain executable after a deploy |

The reasoning behind the table:

- **Duplicate events** — at-least-once delivery means the *same* event can arrive twice. The transition function must be idempotent: re-applying `paid` to an already-`paid` order is a no-effect acknowledgement, never a second charge. Carry an **idempotency key** on the command so the receiver dedupes by identity rather than guessing from state.
- **Stale / out-of-order events** — an event computed against an old snapshot can arrive after the state has moved on. Guard with an **expected-version / fencing token** (optimistic concurrency): reject a transition whose expected version no longer matches the current one, so a slow or replayed writer can't clobber a newer state. Durable-execution and event-sourced systems lean on this as the core safety check.
- **In-flight machine-definition versioning** — when the state-machine *definition itself* changes while instances are mid-flight, decide per instance: drain on the old definition, or migrate deterministically to the new one. Durable engines expose explicit versioning APIs (e.g. Temporal's patched/`getVersion` and Worker Versioning) for exactly this; a hand-rolled persisted machine must version its definition and record the migration policy, or in-flight instances silently take transitions they were never designed for.

These are why a hand-rolled persisted machine is hard to get right, and why the durable-execution tier is often the better home for the long-running, distributed case.

## Verification

- [ ] States are mutually exclusive unless explicitly modeled as orthogonal/parallel regions.
- [ ] State names are durations/conditions, not instantaneous events or actions.
- [ ] Every state has written invariants, and per-state data exists only in the states where it is valid.
- [ ] Every transition has an event/command trigger (or a modeled timeout) — no transitions fire from ambient time checks.
- [ ] The transition matrix has no blank cells: every `state x event` pair is handled or explicitly rejected.
- [ ] Guards are explicit, pure, and separate from side effects.
- [ ] Side effects are attached deliberately to entry, exit, transition actions, or state-bound invocations, and carry idempotency where retries are possible.
- [ ] Async/invoked work that can outlive its starting state has explicit cancellation, stale-result, or compensation behavior, so a late completion cannot mutate a state it no longer belongs to.
- [ ] Terminal, retryable, waiting, cancelled, failed, and compensating states are named where relevant.
- [ ] Unexpected events produce a deterministic rejection or a modeled trap/error state — never a silent no-op.
- [ ] Illegal states are unrepresentable in types where the language allows; otherwise illegal transitions are impossible (single transition function) or at least detectable (loud rejection).
- [ ] Tests cover allowed transitions, forbidden transitions, guard failures, duplicate events, stale events, and terminal-state behavior.
- [ ] Every non-terminal state is reachable from the initial state and can progress or intentionally wait.
- [ ] State explosion or duplicated transitions triggered a statechart/hierarchy review rather than hand-enumeration.
- [ ] For persisted/distributed machines: duplicate events are deduped (idempotency key), stale events are rejected by an expected-version / fencing token, and a machine-definition-versioning policy exists for in-flight instances.
- [ ] The implementation tier (in-process / persisted / durable) is a deliberate choice.
- [ ] If the lifecycle drives an LLM/agent loop, state authority lives in an explicit machine (checkpointed state, deterministic transitions, explicit stopping conditions) rather than being inferred from the prompt/conversation history.
- [ ] Cross-boundary transition behavior is verified with `system-interface-contracts`; test-level choices are verified with `testing-strategy`; frontend state-location questions are out of scope and route to `state-management`.

## Anti-Patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| **Boolean sprawl** — several `is*` flags that combine | `2^N` representable combinations, most illegal; nothing prevents `isPaid && isRefunded`. | Collapse to one closed lifecycle state + per-state data. |
| **Stringly-typed status with no guard** — a free `status` string mutated anywhere | Any code path can set any value; no legal-transition enforcement. | Route all writes through one transition function; make the type a closed union. |
| **State names as event verbs** — `Submit` instead of `Submitting` | Confuses instantaneous events with duration states. | Name states as the condition the entity is in; name events as what happened. |
| **Guard hidden inside an action** | The transition looks legal until the side effect fails. | Make the guard an explicit predicate before the action. |
| **Effects on every transition** — same side effect duplicated on each inbound edge | Drifts out of sync; one edge eventually forgets it. | Move it to the state's entry/exit action. |
| **Ghost side effect** — an async effect outlives the state that launched it and resolves after the machine moved on | A stale result mutates a state it no longer belongs to. | Bind the effect to its state as an invoked actor: start on entry, **cancel on exit**; discard a late result. |
| **Silent no-op on an unexpected event** | The bug hides — the workflow stalls with no signal. | Reject with an observable error, route to a trap state, or acknowledge idempotently — never swallow it. |
| **Treating a duplicate/replayed event as new** — second `paid` charges twice | At-least-once delivery makes redelivery normal; a non-idempotent transition corrupts state. | Make the transition idempotent and dedupe by idempotency key; guard stale writes with an expected-version / fencing token. |
| **Ambient timeout checks** — `if (now > deadline)` scattered in handlers | Timeout behavior is unmodeled and untestable. | Model the timeout as a scheduled event with its own transition. |
| **Flattened parallel concerns** — independent axes enumerated as one state set | State count grows multiplicatively. | Use orthogonal regions or separate machines. |
| **Hand-rolled hierarchy** — nested `switch` emulating superstates/parallelism | Exactly where hand-written machines get hierarchy and concurrency wrong. | Use a statechart formalism/library (XState, SCXML, UML). |
| **Shared actor internals** — one machine reaches into another's state | Breaks ownership; coupling and races. | Treat machines as actors with event contracts and owned internal state. |
| **Hand-rolled durable workflow** — manual DB-persisted machine for a long, distributed, crash-prone process | Recovery, execution-position, and timeout plumbing are rarely fully correct. | Hand the modeled lifecycle to a durable-execution engine or orchestrated saga. |
| **Prompt as the state store** — an LLM agent loop tracks "where it is" implicitly in the conversation history | History is lossy, unbounded, and non-deterministic; the agent re-does/skips steps and can't resume after a crash. | Store machine state externally; let the model act only through explicit transitions — the transcript is the event log, not the state. |
| **Golden-hammer FSM** — a trivial independent toggle gets a full transition framework | Ceremony with no guards, invariants, or invalid transitions to protect. | Use a boolean or small enum until lifecycle legality, retries, hierarchy, or invariants justify a machine. |

## Key Sources

Reach for these when a decision needs more than this skill carries:

- **"Make illegal states unrepresentable"** — Yaron Minsky (Jane Street / OCaml); the type-driven framing behind the Unrepresentable tier. Operationalizes via TypeScript narrowing/exhaustiveness, Rust typestate, and sealed/sum types. https://www.cs.cornell.edu/courses/cs3110/2013fa/lectures/27/lecture27_Minsky_EffectiveML.pdf ; https://www.typescriptlang.org/docs/handbook/2/narrowing
- **Statecharts** — David Harel, *"Statecharts: A Visual Formalism for Complex Systems"* (1987); the origin of hierarchy, orthogonal regions, and history states. https://www.sciencedirect.com/science/article/pii/0167642387900359
- **SCXML** — the W3C State Chart XML interchange standard; statechart semantics for events, guards, parallel regions, `onentry`/`onexit`, history states, and transition selection. https://www.w3.org/TR/scxml/
- **UML state machines** — OMG UML 2.5.1; the formal state-machine notation family. https://www.omg.org/spec/UML
- **XState / Stately** — the dominant JS/TS statechart implementation; docs cover invoked actors, history, parallel states, and model-based/path testing. https://stately.ai/docs ; https://stately.ai/docs/actors ; https://stately.ai/docs/invoke ; https://stately.ai/docs/graph
- **AWS Step Functions** — managed state-machine workflow service; the Amazon States Language. https://docs.aws.amazon.com/step-functions/latest/dg/concepts-amazon-states-language.html
- **Durable execution** — Temporal (incl. Worker Versioning for in-flight instances), DBOS, Restate, Inngest; engines that persist execution position and expose in-flight versioning APIs. https://docs.temporal.io/ ; https://docs.dbos.dev/python/tutorials/workflow-tutorial
- **Agent-workflow state** — LangGraph (graph + checkpointed state), the OpenAI Agents SDK (turn loop with explicit run/stopping conditions), and Anthropic's "Building Effective Agents" (workflow-vs-agent distinction); the home of the "don't let the prompt be the state store" rule. https://docs.langchain.com/oss/python/langgraph/durable-execution ; https://openai.github.io/openai-agents-python/running_agents/ ; https://www.anthropic.com/engineering/building-effective-agents
- **Saga / process manager** — Garcia-Molina & Salem, *"Sagas"* (1987); Hohpe & Woolf, *Enterprise Integration Patterns* (the process-manager pattern); Microservices.io and AWS prescriptive guidance for compensation, orchestration vs choreography. https://microservices.io/patterns/data/saga.html ; https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga.html ; https://www.enterpriseintegrationpatterns.com/patterns/messaging/ProcessManager.html

## Do NOT Use When

| Use instead | When |
|---|---|
| `event-storming` | You need to discover the broader domain flow, commands, policies, actors, aggregates, and events *before* a lifecycle is known. |
| `data-modeling` | You need persistence schema, keys, constraints, indexes, query shape, retention, or migration design for state data. |
| `api-design` | You need HTTP routes, request/response shapes, status codes, headers, pagination, or endpoint versioning. |
| `state-management` | You are deciding *where* frontend state lives and who owns it (server/client/URL/persistent) rather than modeling a lifecycle's legal transitions. |
| `observability-modeling` | The lifecycle is settled and you need telemetry semantics, metrics, logs, traces, or alerts. |
| `debugging` | A stateful system has already failed and needs reproduction, evidence capture, and root-cause analysis. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Public: `true`
- Domain: `modeling/state-machines`
- Scope: Use when formalizing one lifecycle's legal behavior: states, events/commands, transitions, guards, state invariants, invalid states, side effects, retries, timeouts, compensation, statecharts, actor-style communicating machines, state-bound async invocations, implementation tier, and transition verification. Includes flat finite state machines, hierarchical/parallel statecharts, and the design decision of whether to implement the lifecycle as in-process types, a persisted transition guard, a workflow/statechart library, an actor system, or a durable-execution workflow. Excludes broad domain-event discovery, persistence schema design, HTTP endpoint design, frontend state-placement decisions, and telemetry instrumentation after the lifecycle is settled.

**When to use**
- model the order fulfillment status lifecycle so invalid transitions are impossible
- this status field keeps growing flags - should it become a state machine?
- define guards and side effects for onboarding steps
- find impossible states in this workflow before we implement it
- these four booleans are multiplying into states that should never exist - how do I collapse them?

**Not for**
- discover the domain events and policies for the whole business process
- create database tables and constraints for this lifecycle
- decide whether this React form state should live in the URL, context, or a global store
- instrument metrics and traces for an existing workflow
- debug why this job got stuck yesterday

**Related skills**
- Verify with: `system-interface-contracts`, `testing-strategy`
- Related: `observability-modeling`, `api-design`, `debugging`, `event-storming`, `system-interface-contracts`, `testing-strategy`, `state-management`

**Keywords**
- `state machine`, `statechart`, `lifecycle states`, `transitions`, `guards`, `finite state machine`, `invalid states`, `status field`, `workflow invariants`, `state explosion`

<!-- skill-graph-context:end -->
