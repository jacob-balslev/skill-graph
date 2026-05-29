---
name: tool-call-flow
description: "Use when reasoning about the protocol-level cycle by which a language model uses external tools: the four phases (declaration, request, execution, continuation), the message-history state model that ties them together, the structural differences between vendor protocols (Anthropic tool-use, OpenAI function-calling, MCP) and how they compose, parallel vs sequential tool calls, error handling and retries inside the cycle, and the separation between the model (which produces structured intent) and the runtime (which executes the intent and routes results back). Do NOT use for the decision of when and how many tool calls to make (use tool-call-strategy), agent-system architecture and coordination patterns (use agent-engineering), prompt wording (use prompt-craft), or the design of evals for tool-use behavior (use agent-eval-design). Do NOT use for the external API surface (use api-design). Do NOT use for the serialization frontier between server and client code (use client-server-boundary)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: agent-ops
  deployment_target: portable
  taxonomy_domain: agent/protocol
  owner: skill-graph-maintainer
  freshness: "2026-05-15"
  drift_check: "{\"last_verified\":\"2026-05-15\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"tool call\",\"tool use\",\"function calling\",\"MCP\",\"Model Context Protocol\",\"tool result\",\"parallel tool calls\",\"tool schema\",\"JSON Schema\",\"assistant turn\"]"
  triggers: "[\"how does tool calling actually work\",\"what's the message shape for a tool result\",\"MCP vs function calling vs Anthropic tools\",\"can the model call tools in parallel\",\"where do tool errors live in the message history\"]"
  examples: "[\"design the message-shape contract between a model and a tool runtime\",\"explain why a tool result must be appended to the message history before the next assistant turn\",\"decide whether to expose a capability as a tool, an MCP server, or an inline API\",\"diagnose why a model keeps re-calling the same tool with the same arguments\"]"
  anti_examples: "[\"decide whether to call a tool or write a script (use tool-call-strategy)\",\"choose a multi-agent coordination pattern (use agent-engineering)\",\"design an eval suite that tests tool-call correctness (use agent-eval-design)\"]"
  relations: "{\"related\":[\"tool-call-strategy\",\"agent-engineering\",\"api-design\",\"type-safety\",\"client-server-boundary\"],\"boundary\":[{\"skill\":\"tool-call-strategy\",\"reason\":\"tool-call-strategy owns the decision of when, how many, and which tools to call (token cost, redundancy, parallelization, decision gate). tool-call-flow owns the protocol-level cycle that makes any call possible. The two compose: strategy decides what to do; flow describes the mechanism that carries it out.\"},{\"skill\":\"agent-engineering\",\"reason\":\"agent-engineering owns multi-agent and multi-step system architecture (orchestrator/worker, consensus, sequential chains). tool-call-flow is one cycle inside a single agent — the protocol for a single model-to-runtime interaction.\"},{\"skill\":\"api-design\",\"reason\":\"api-design owns the external API surface that tools may wrap. tool-call-flow owns the model-facing contract: how the tool is declared to the model, how the result is encoded back to it, and how the cycle is structured.\"},{\"skill\":\"client-server-boundary\",\"reason\":\"client-server-boundary owns the serialization frontier between server and client code. tool-call-flow is an analogous frontier between a language model (which produces structured intent) and a runtime (which executes the intent) — the trust direction is different but the discipline of explicit serialization is identical.\"}],\"verify_with\":[\"tool-call-strategy\",\"agent-eval-design\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "A tool-call flow is to a language model what a procurement system is to an executive — the executive does not personally drive to the supplier; they sign a typed purchase order, the procurement department validates the order, executes it, and returns the receipt with whatever was delivered or with a documented reason it could not be. The executive's signature is intent; the department's stamp is authorization; the receipt is the only state of the cycle that survives, and the next decision is made against that record."
  misconception: "|"
  concept: "{\"definition\":\"A tool-call flow is the multi-turn protocol by which a language model uses external capabilities. It has four phases — declaration (the runtime tells the model which tools exist and their parameter schemas), request (the model emits a structured tool-call message specifying tool name and arguments), execution (the runtime invokes the underlying capability and produces a result), continuation (the runtime appends the result to the message history and re-prompts the model, which either continues with another tool call or produces a final answer). The state of the cycle lives in the message history; the model is stateless across calls.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/tool-call-flow/SKILL.md
  skill_graph_export_description_projection: boundary
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

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `agent-ops`
- Deployment: `portable`
- Domain: `agent/protocol`

**When to use**
- design the message-shape contract between a model and a tool runtime
- explain why a tool result must be appended to the message history before the next assistant turn
- decide whether to expose a capability as a tool, an MCP server, or an inline API
- diagnose why a model keeps re-calling the same tool with the same arguments
- Triggers: `how does tool calling actually work`, `what's the message shape for a tool result`, `MCP vs function calling vs Anthropic tools`, `can the model call tools in parallel`, `where do tool errors live in the message history`

**Not for**
- decide whether to call a tool or write a script (use tool-call-strategy)
- choose a multi-agent coordination pattern (use agent-engineering)
- design an eval suite that tests tool-call correctness (use agent-eval-design)
- Owned by `tool-call-strategy`: the decision of when, how many, and which tools to call (token cost, redundancy, parallelization, decision gate)
- Owned by `agent-engineering`: multi-agent and multi-step system architecture (orchestrator/worker, consensus, sequential chains)
- Owned by `api-design`: the external API surface
- Owned by `client-server-boundary`: the serialization frontier between server and client code

**Related skills**
- Verify with: `tool-call-strategy`, `agent-eval-design`
- Related: `tool-call-strategy`, `agent-engineering`, `api-design`, `type-safety`, `client-server-boundary`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A tool-call flow is to a language model what a procurement system is to an executive — the executive does not personally drive to the supplier; they sign a typed purchase order, the procurement department validates the order, executes it, and returns the receipt with whatever was delivered or with a documented reason it could not be. The executive's signature is intent; the department's stamp is authorization; the receipt is the only state of the cycle that survives, and the next decision is made against that record.
- Common misconception: |

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-15`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `tool call`, `tool use`, `function calling`, `MCP`, `Model Context Protocol`, `tool result`, `parallel tool calls`, `tool schema`, `JSON Schema`, `assistant turn`
