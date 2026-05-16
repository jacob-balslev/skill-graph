---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: tool-call-flow
description: "Use when reasoning about the protocol-level cycle by which a language model uses external tools: the four phases (declaration, request, execution, continuation), the message-history state model that ties them together, the structural differences between vendor protocols (Anthropic tool-use, OpenAI function-calling, MCP) and how they compose, parallel vs sequential tool calls, error handling and retries inside the cycle, and the separation between the model (which produces structured intent) and the runtime (which executes the intent and routes results back). Do NOT use for the decision of when and how many tool calls to make (use tool-call-strategy), agent-system architecture and coordination patterns (use agent-engineering), prompt wording (use prompt-craft), or the design of evals for tool-use behavior (use agent-eval-design)."
version: 1.0.0
type: capability
category: agent
domain: agent/protocol
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-15"
drift_check:
  last_verified: "2026-05-15"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - tool call
  - tool use
  - function calling
  - MCP
  - Model Context Protocol
  - tool result
  - parallel tool calls
  - tool schema
  - JSON Schema
  - assistant turn
  - tool runtime
  - tool router
triggers:
  - "how does tool calling actually work"
  - "what's the message shape for a tool result"
  - "MCP vs function calling vs Anthropic tools"
  - "can the model call tools in parallel"
  - "where do tool errors live in the message history"
examples:
  - "design the message-shape contract between a model and a tool runtime"
  - "explain why a tool result must be appended to the message history before the next assistant turn"
  - "decide whether to expose a capability as a tool, an MCP server, or an inline API"
  - "diagnose why a model keeps re-calling the same tool with the same arguments"
anti_examples:
  - "decide whether to call a tool or write a script (use tool-call-strategy)"
  - "choose a multi-agent coordination pattern (use agent-engineering)"
  - "design an eval suite that tests tool-call correctness (use agent-eval-design)"
relations:
  related:
    - tool-call-strategy
    - agent-engineering
    - api-design
    - type-safety
    - client-server-boundary
  boundary:
    - skill: tool-call-strategy
      reason: "tool-call-strategy owns the decision of when, how many, and which tools to call (token cost, redundancy, parallelization, decision gate). tool-call-flow owns the protocol-level cycle that makes any call possible. The two compose: strategy decides what to do; flow describes the mechanism that carries it out."
    - skill: agent-engineering
      reason: "agent-engineering owns multi-agent and multi-step system architecture (orchestrator/worker, consensus, sequential chains). tool-call-flow is one cycle inside a single agent — the protocol for a single model-to-runtime interaction."
    - skill: api-design
      reason: "api-design owns the external API surface that tools may wrap. tool-call-flow owns the model-facing contract: how the tool is declared to the model, how the result is encoded back to it, and how the cycle is structured."
    - skill: client-server-boundary
      reason: "client-server-boundary owns the serialization frontier between server and client code. tool-call-flow is an analogous frontier between a language model (which produces structured intent) and a runtime (which executes the intent) — the trust direction is different but the discipline of explicit serialization is identical."
  verify_with:
    - tool-call-strategy
    - agent-eval-design
concept:
  definition: "A tool-call flow is the multi-turn protocol by which a language model uses external capabilities. It has four phases — declaration (the runtime tells the model which tools exist and their parameter schemas), request (the model emits a structured tool-call message specifying tool name and arguments), execution (the runtime invokes the underlying capability and produces a result), continuation (the runtime appends the result to the message history and re-prompts the model, which either continues with another tool call or produces a final answer). The state of the cycle lives in the message history; the model is stateless across calls."
  mental_model: |
    Five primitives structure tool-call reasoning:

    1. **Tool declaration** — a JSON-Schema-typed description of an available capability. Each tool has a name, a one-paragraph natural-language description (the model reads this to decide when to use it), and a parameters schema (the model fills this to invoke it). The declaration is part of the request to the model — the model sees the tool list with every turn.

    2. **Tool-call message** — the model's structured emission saying "invoke this tool with these arguments." Across all current vendor protocols, this appears as a message in the assistant role with one or more typed tool_use blocks (Anthropic) or tool_calls (OpenAI) or equivalent. The model does not execute the tool; it produces an instruction for the runtime to execute.

    3. **Runtime** — the code outside the model that owns the execution loop. The runtime receives the model's tool-call message, dispatches to the named tool, awaits the result (which may be local, network, or human-mediated), appends the result to the message history in the correct role (tool / tool_result), and re-prompts the model. The runtime is the orchestrator; the model is the planner.

    4. **Tool-result message** — the runtime's structured emission saying "the tool you asked for produced this output." The result is paired with the original tool-call message by an ID (Anthropic: tool_use_id; OpenAI: tool_call_id). Errors, partial successes, and timeouts are still tool-result messages — the encoding distinguishes them by content, not by message kind.

    5. **The cycle** — the model and runtime alternate turns until the model emits a message without a tool-call (a "final answer"). Each turn the model sees the full history, including all prior tool calls and results. This means the cycle has unbounded depth in principle, bounded only by context window and runtime-side caps.

    The deep insight is that the model is stateless across calls and the message history *is* the program state. Anything the model needs to remember between turns must be in the messages — either in the original prompt, in a previous tool result, or in the model's own assistant-role messages from earlier turns. There is no hidden memory; the protocol's transparency is the property that makes it auditable.

    The three current vendor protocols (Anthropic tool-use, OpenAI function-calling, Model Context Protocol) differ in message shapes and encoding but share this four-phase structure exactly. MCP additionally externalizes the tool declaration: tools live on a separate server that the model client discovers and queries, rather than being inlined into the prompt — which makes tool composition across providers a runtime concern rather than a per-call configuration concern.
  purpose: |
    The four-phase structure exists because language models can produce structured intent reliably but cannot execute it. The model can decide "this user is asking for the current weather in Paris; the right tool is `get_weather` with `location='Paris'`," but the model cannot reach the weather API. Splitting intent from execution makes the system buildable: the model contributes natural-language reasoning over a tool catalog; the runtime contributes deterministic invocation, authentication, retries, and audit.

    The protocol shape — model emits intent, runtime executes, runtime returns result, model continues — has three consequences that justify it over the alternatives:

    - **Auditable.** Every action the model causes is a message in the history. There is no hidden side effect; reproducing a run means replaying the messages.
    - **Composable.** A runtime can expose any capability as a tool: local function, HTTP API, database query, human-in-the-loop approval, another agent. The model does not need to know how the tool is implemented; only what it does and what arguments it accepts.
    - **Recoverable.** A failed tool call is a result with an error payload, not a crash. The model sees the error in the next turn and can retry with different arguments, try a different tool, or surface the failure to the user. The runtime decides what counts as a recoverable error and what counts as a hard failure.

    The alternatives — letting the model produce code that it then executes, or wiring the model directly to network sockets — have been tried and produce worse systems. Code-execution models can do more but require sandbox infrastructure and have a much larger blast radius on failure. Direct network access removes the audit trail and conflates planning with execution. The four-phase tool-call flow is the current synthesis: structured enough to audit, flexible enough to compose, narrow enough to secure.
  boundary: |
    **A tool call is not a function call.** A function call invokes code in the same process; a tool call is a request from a model (which runs in one place) to a runtime (which runs in another) to invoke a capability and return the result over the wire as a message. The latency, error surface, and trust model are different.

    **A tool result is not a function return.** A function returns a typed value to its caller; a tool result is a message appended to a shared history that the model will see on its next turn. The encoding (text, JSON, image, document reference) is part of the result, not part of a return-type contract.

    **The model is not the runtime.** A common confusion is to talk about "the model" executing a tool. The model only produces the structured request. The runtime executes. Failures of the runtime (network timeout, API error, authentication denial) are runtime failures encoded into the result; the model is responsible for handling them in its next turn.

    **Parallel tool calls are not multi-agent.** Most current protocols allow the model to emit multiple tool-call blocks in a single message; the runtime executes them in parallel and appends all results before the next assistant turn. This is parallelism inside one agent's cycle, not coordination across agents. Multi-agent patterns (orchestrator/worker, fan-out) compose multiple cycles, each with its own tool-call flow.

    **Tool declarations are not the same as API documentation.** The declaration is the model's view of the tool — short, prescriptive, focused on when the tool should be chosen and how arguments are filled. API documentation is the developer's view — full, reference, focused on every parameter and edge case. The declaration is a slice of the documentation, not a copy of it.

    **MCP is not a different kind of tool call.** Model Context Protocol is a transport for tool declarations and tool calls; the cycle shape is identical. MCP's contribution is to externalize the tool catalog: tools live on a server outside the model client and are discovered at runtime. From the model's perspective, an MCP tool is a tool.

    **A tool call is not a side-effect-free function call.** Tools commonly cause side effects (database writes, emails sent, money moved). The runtime decides which tools have side effects and how to gate them (confirmation prompts, dry-run modes, human approval). The model does not enforce side-effect discipline; the runtime does.
  taxonomy: |
    By role in the cycle:
    - **Tool declaration** — schema + description; lives in the request to the model.
    - **Tool-call message** — structured emission; lives in an assistant-role message.
    - **Tool-result message** — execution output; lives in a tool-role (or equivalent) message.
    - **Final answer** — assistant-role message without a tool-call block; ends the cycle.

    By transport protocol:
    - **Anthropic tool-use** — Messages API; tool_use and tool_result blocks inside content arrays; tool_use_id pairs results to calls.
    - **OpenAI function-calling** — Chat Completions and Responses APIs; tool_calls and tool messages; tool_call_id pairs results to calls.
    - **Model Context Protocol (MCP)** — open transport (typically JSON-RPC over stdio or SSE) for externalizing tool servers; the model client embeds MCP-fetched tools into the per-call request.
    - **Gemini function calling** — analogous to OpenAI's; function_call and function_response message parts.
    - **Custom in-prompt protocols** — older or local-model patterns where the cycle is encoded in plain text (e.g., ReAct's "Thought / Action / Observation" loop parsed by the runtime).

    By parallelism mode:
    - **Sequential** — the model emits one tool call, gets the result, decides the next. Default in older protocols.
    - **Parallel** — the model emits N tool calls in one message; the runtime executes them concurrently and appends N results before the next turn. Standard in current Anthropic, OpenAI, and Gemini protocols when enabled.
    - **Streaming** — the runtime emits tool-call deltas as they arrive token-by-token; the runtime may begin execution as soon as a complete tool-call block is parsed, before the full message finishes streaming.

    By execution location:
    - **Local function** — tool implementation is in the same process as the runtime.
    - **Network API** — tool implementation is over HTTP; the runtime makes the API call.
    - **MCP server** — tool implementation is on a separate process or machine; the runtime communicates over the MCP transport.
    - **Subagent** — tool implementation is itself another tool-call cycle; the result of the subagent's final answer becomes this agent's tool result.
    - **Human-in-the-loop** — tool implementation is a human approval or input; the runtime pauses until the human responds.

    By failure mode:
    - **Schema-rejected** — model's tool-call arguments don't match the declared schema; runtime returns a validation-error result.
    - **Execution-failed** — tool ran but produced an error; runtime encodes the error in the result.
    - **Timeout** — tool exceeded a runtime-imposed time bound; runtime returns a timeout result.
    - **Permission-denied** — runtime refused to execute (auth, rate limit, policy); result encodes the refusal.
    - **Hallucinated tool** — model called a tool name not in the declared catalog; runtime returns an unknown-tool result.
  analogy: |
    A short-order kitchen with one head chef (the model) and many specialist stations (the tools). The chef cannot grill, sauté, or plate — but the chef can read tickets, decide what to order from which station, and assemble the final plate from what the stations produce.

    The order pad (the message history) records every ticket the chef writes and every dish the stations return. A ticket says "station: grill; item: medium-rare steak; modifiers: no salt." A returned dish has the same ticket number stapled to it (the tool_use_id), so the chef knows which order produced which plate.

    The chef writes a ticket, waits for the dish, looks at the order pad with the new dish on it, and decides the next ticket — maybe "station: sauce; item: béarnaise" or maybe "service: plate the table." The cycle ends when the chef sends the table service notice instead of another ticket.

    MCP is the staffing agency: the chef does not know which stations exist until the agency tells them, at the start of each shift, "tonight you have grill, sauce, garde manger, pastry." The cycle shape does not change; only the way the station catalog gets to the chef changes.

    Parallel tool calls are the chef writing five tickets at once, sliding them onto the rail simultaneously, and waiting for the five dishes to come back before assembling the plate. The dishes can arrive in any order; each is tagged with its ticket number so the chef can pair them correctly.
  misconception: |
    The most common misconception is that **the model executes tools**. It does not. The model emits a structured request; the runtime executes. A model running offline with no runtime cannot use any tool — it can only describe the call it would make. Treating the model as the executor leads to incorrect mental models around timeouts ("why is the model hanging?" — the runtime is hanging, not the model), retries ("ask the model to retry" — the runtime retries, the model just sees the new result), and security ("the model called this dangerous tool" — the runtime executed the dangerous tool the model requested).

    The second misconception is that **tool calls return values like function calls**. They do not. The result is a message appended to the history, which the model will see on its *next* turn. The model has no way to "use the return value" inside the same turn it made the call; the cycle structure mandates a turn boundary between request and continuation.

    The third misconception is that **the model remembers across cycles**. It does not — the model is stateless. What looks like memory is the message history: each turn the model sees every prior message in the conversation. If a tool result from three turns ago is needed, the model re-reads it from the history; nothing is implicit.

    The fourth misconception is that **all vendor protocols are interchangeable** at the message-shape level. They share the four-phase structure but differ in encoding: where the tool-call block lives (Anthropic: in `content`; OpenAI: in `tool_calls` adjacent to `content`), how IDs pair calls to results, whether parallel calls are first-class, how streaming deltas are framed. A runtime that supports multiple providers must translate at the message-shape layer; the cycle structure translates cleanly, the encoding does not.

    The fifth misconception is that **MCP replaces tool calling**. It does not. MCP is a transport for tool declarations and tool results, allowing tools to live on servers outside the model client. From the model's perspective, an MCP tool is a tool; the cycle structure is unchanged. MCP's value is that the tool catalog becomes dynamic and shareable across model clients, not that the protocol shape changes.

    The sixth misconception is that **errors should be exceptions**. They should not. A tool that fails returns a tool-result message with an error payload; the model sees the failure and decides what to do next. If the runtime instead raises an exception that breaks the loop, the model loses the opportunity to recover or to report the failure to the user with context. The protocol's failure model is in-band, not out-of-band.

    The seventh misconception is that **tool descriptions are documentation**. They are prompts. The description is part of every request to the model and shapes when the model chooses to call the tool. A description that says "Use this tool to look up users" produces different behavior than one that says "Use this tool to look up users only when you have a confirmed user ID; do not call without an ID, prefer the search tool when uncertain." Prompt engineering in the description is part of designing the tool.
---

# Tool-Call Flow

## Coverage

The protocol-level cycle by which a language model uses external capabilities. Covers the four phases (declaration, request, execution, continuation), the message-history state model that ties them together, the structural differences between vendor protocols (Anthropic tool-use, OpenAI function-calling, Model Context Protocol, Gemini function calling), parallel tool calls, streaming tool calls, the runtime's role as orchestrator, error encoding inside the cycle, and the boundary between model-side intent and runtime-side execution.

## Philosophy

A tool-call flow is the smallest unit of agentic capability. Strip away orchestration patterns, multi-agent coordination, evaluation harnesses — what remains is a single language model alternating turns with a runtime that executes capabilities on its behalf. Understanding this cycle precisely is the foundation for understanding everything that builds on it.

The cycle's defining property is the separation of planning from execution. The model produces structured intent; the runtime carries it out. This separation is not a workaround for current model capabilities; it is a deliberate design choice that makes the system auditable, composable, and recoverable. A system that fuses the two — by letting the model execute code directly, or by letting the runtime make decisions — gains expressiveness and loses every benefit the separation provides.

The four-phase structure is identical across every current vendor protocol. The names differ, the message shapes differ, the encoding of parallelism differs, but the cycle — declare, request, execute, continue — is the same. A practitioner who understands the cycle can move between Anthropic, OpenAI, MCP, and Gemini at the cost of a translation layer; a practitioner who understands only one vendor's encoding cannot.

## The Four Phases

| Phase | Who acts | Output | Becomes |
|---|---|---|---|
| 1. Declaration | Runtime | List of tools with name, description, JSON-Schema parameter spec | Part of the request to the model |
| 2. Request | Model | Assistant message with one or more tool-call blocks (or a final-answer message — ending the cycle) | Appended to message history |
| 3. Execution | Runtime | Result of invoking the named tool with the supplied arguments | A tool-result message |
| 4. Continuation | Runtime | Tool-result message paired with the request by ID | Appended to message history; cycle repeats |

The cycle ends when the model emits an assistant message *without* any tool-call blocks. The final message's content is the final answer.

## Vendor Protocol Comparison

The cycle is the same; the encoding differs. The table below shows the same single-call cycle in three protocols.

### Anthropic tool-use (Messages API)

```jsonc
// Request to model (turn 1)
{
  "model": "claude-opus-4-7",
  "tools": [{
    "name": "get_weather",
    "description": "Returns current weather for a city.",
    "input_schema": {
      "type": "object",
      "properties": { "location": { "type": "string" } },
      "required": ["location"]
    }
  }],
  "messages": [
    { "role": "user", "content": "What's the weather in Paris?" }
  ]
}

// Model response (turn 1 → 2)
{
  "role": "assistant",
  "content": [
    { "type": "text", "text": "I'll check the current weather." },
    { "type": "tool_use", "id": "toolu_01A", "name": "get_weather",
      "input": { "location": "Paris" } }
  ]
}

// Runtime executes get_weather("Paris") → { "temp_c": 18, "conditions": "cloudy" }

// Request to model (turn 2, includes appended tool result)
{
  "messages": [
    { "role": "user", "content": "What's the weather in Paris?" },
    { "role": "assistant", "content": [...] },  // turn 1 above
    { "role": "user", "content": [
        { "type": "tool_result", "tool_use_id": "toolu_01A",
          "content": "{\"temp_c\":18,\"conditions\":\"cloudy\"}" }
    ]}
  ]
}

// Model response (final)
{ "role": "assistant", "content": [
  { "type": "text", "text": "It's 18°C and cloudy in Paris." }
]}
```

### OpenAI function-calling (Chat Completions)

```jsonc
// Same flow with different encoding:
// - Tool calls live in `tool_calls` adjacent to `content`, not inside `content`.
// - Tool results live in messages with `role: "tool"` (not inside a user-role message).
// - IDs pair via `tool_call_id`.
{
  "role": "assistant",
  "content": null,
  "tool_calls": [{
    "id": "call_abc", "type": "function",
    "function": { "name": "get_weather",
                   "arguments": "{\"location\":\"Paris\"}" }
  }]
}
{
  "role": "tool",
  "tool_call_id": "call_abc",
  "content": "{\"temp_c\":18,\"conditions\":\"cloudy\"}"
}
```

### Model Context Protocol (MCP)

```jsonc
// MCP externalizes the declaration phase. Tools live on an MCP server.
// The model client discovers them at runtime via the MCP transport
// (typically JSON-RPC over stdio or SSE), then inlines them into the
// per-call request to the underlying model API (Anthropic, OpenAI, etc.).

// 1. Client → MCP server: tools/list
// 2. MCP server → client: list of tool declarations
// 3. Client embeds those declarations in the model request (in whatever
//    vendor's encoding the underlying model uses)
// 4. Model emits a tool-call message
// 5. Client → MCP server: tools/call { name, arguments }
// 6. MCP server → client: result
// 7. Client appends the result and re-prompts the model
```

MCP's contribution is dynamic discovery and provider neutrality at the catalog level, not a different cycle shape.

## Parallel Tool Calls

Modern protocols allow the model to emit multiple tool-call blocks in a single assistant message. The runtime executes them concurrently and appends all results to the history before re-prompting.

```jsonc
// Anthropic — single assistant message with two tool_use blocks
{
  "role": "assistant",
  "content": [
    { "type": "tool_use", "id": "toolu_01A", "name": "get_weather",
      "input": { "location": "Paris" } },
    { "type": "tool_use", "id": "toolu_01B", "name": "get_weather",
      "input": { "location": "Tokyo" } }
  ]
}
// Runtime executes both concurrently
// Next user-role message contains both tool_result blocks
```

Parallel calls reduce wall-clock latency for independent operations but add coordination complexity for dependent ones: the model cannot use the result of one parallel call to inform another in the same turn (they all execute against the same pre-result state). Dependent calls must be sequential.

## Streaming Tool Calls

Streaming protocols emit the assistant message token-by-token. A complete tool-call block can be reconstructed before the full message finishes streaming, allowing the runtime to begin execution speculatively:

1. Streamed tokens form a complete tool_use block.
2. Runtime parses the complete block and begins executing the tool.
3. Streaming continues; if a second tool-call block arrives, it also begins executing.
4. When the streamed message completes, the runtime has the full set of calls; some are already done.

Streaming is an optimization, not a different cycle. The correctness contract is the same: results must be appended in their assigned positions; the model sees the same history regardless of timing.

## Failure Encoding

All failures are tool-result messages — never out-of-band exceptions that break the cycle.

| Failure | Encoding |
|---|---|
| Schema validation failed | Result with error: "arguments did not match schema: missing required field 'location'" |
| Tool execution threw | Result with error: "OpenWeatherMap returned 503 Service Unavailable" |
| Timeout | Result with error: "tool execution exceeded 10s timeout" |
| Permission denied | Result with error: "this tool requires admin permission" |
| Unknown tool | Result with error: "no tool named 'get_wether' (did you mean 'get_weather'?)" |

The model sees the error in its next turn and can choose: retry with corrected arguments, try a different tool, abandon the goal, or surface the failure to the user with context. The runtime's job is to encode the failure faithfully; the model's job is to handle it.

## The Runtime's Responsibilities

The runtime is the orchestrator. Specifically, it owns:

- **Tool catalog management** — declare which tools exist and their schemas (or, with MCP, discover them).
- **Schema validation** — verify the model's tool-call arguments match the declared schema before invocation.
- **Dispatch** — route the validated call to the underlying implementation (local, network, MCP, subagent, human).
- **Execution policy** — timeouts, retries, rate limits, parallelism limits, side-effect gating.
- **Result encoding** — format the execution output as a tool-result message paired by ID.
- **Loop control** — re-prompt the model; cap the maximum number of turns; detect runaway loops.
- **Audit and persistence** — store the message history; make runs replayable.

The model owns only the planning: which tool, which arguments, when to stop.

## Verification

After applying this skill, verify:
- [ ] Every tool declaration has a precise description naming when the tool should be used and what the arguments mean (the description is a prompt, not documentation).
- [ ] Every tool has a JSON Schema for its parameters with `required` fields and constrained types — the model's arguments are validated against this schema before execution.
- [ ] Tool-call and tool-result messages are paired by ID — the pairing is checked, not assumed.
- [ ] Errors are encoded into tool-result messages with diagnostic content the model can read — they do not break the loop.
- [ ] The cycle has a maximum-turns cap on the runtime side — a model that keeps tool-calling never exits without intervention.
- [ ] Side-effecting tools have explicit gating (confirmation, dry-run mode, allow-list) — the model does not enforce side-effect discipline.
- [ ] Parallel tool calls are used only for independent operations — dependent calls remain sequential.
- [ ] The message history is the only state — no hidden runtime memory the model cannot see.
- [ ] Logs include the full message history (or a structured trace) per cycle — runs are replayable.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Deciding when to call a tool versus when to write a script | `tool-call-strategy` | tool-call-strategy owns the decision; tool-call-flow owns the mechanism that carries the decision out |
| Choosing a multi-agent coordination pattern | `agent-engineering` | agent-engineering owns system-level architecture; tool-call-flow is one cycle inside one agent |
| Writing the natural-language description that goes into a tool declaration | `prompt-craft` | prompt-craft owns wording; this skill owns the shape of what wording goes where |
| Designing the JSON shape of an external API a tool wraps | `api-design` | api-design owns the external surface; tool-call-flow owns the model-facing contract |
| Designing evals for tool-use correctness | `agent-eval-design` | agent-eval-design owns eval structure; tool-call-flow describes what is being evaluated |
| Debugging a tool that returns wrong results in production | `debugging` | debugging owns the diagnostic activity |

## Key Sources

- Anthropic. [Tool use overview](https://docs.anthropic.com/en/docs/build-with-claude/tool-use). Canonical reference for the Anthropic Messages API tool-use protocol — the tool_use / tool_result block structure, ID pairing, parallel calls.
- OpenAI. [Function calling guide](https://platform.openai.com/docs/guides/function-calling). Canonical reference for the OpenAI Chat Completions and Responses APIs' function-calling protocol — tool_calls / tool messages, tool_call_id pairing.
- Anthropic. [Model Context Protocol specification](https://modelcontextprotocol.io/specification). The open specification for MCP — transport, tool discovery, the tools/list and tools/call methods.
- JSON Schema. [Draft 2020-12 specification](https://json-schema.org/draft/2020-12/json-schema-core). The schema language used for parameter declarations across all vendor protocols.
- Google. [Gemini function calling documentation](https://ai.google.dev/gemini-api/docs/function-calling). The function_call / function_response message-part structure — same four-phase cycle, third encoding.
- Yao, S., Zhao, J., Yu, D., Du, N., Shafran, I., Narasimhan, K., & Cao, Y. (2022). ["ReAct: Synergizing Reasoning and Acting in Language Models"](https://arxiv.org/abs/2210.03629). The Thought-Action-Observation loop that prefigured the structured tool-call protocols.
- Schick, T., Dwivedi-Yu, J., Dessì, R., Raileanu, R., Lomeli, M., Zettlemoyer, L., Cancedda, N., & Scialom, T. (2023). ["Toolformer: Language Models Can Teach Themselves to Use Tools"](https://arxiv.org/abs/2302.04761). Meta's foundational paper on training models to invoke tools — the research thread that motivates the protocol design choices.
- LangChain. [Tool calling concepts](https://python.langchain.com/docs/concepts/tool_calling/). Framework-agnostic description of the cycle structure, useful as a third-party reference outside any single vendor.
