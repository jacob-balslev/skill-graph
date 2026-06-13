---
name: tool-call-flow
description: "Use when reasoning about the protocol-level cycle by which a language model uses external tools: declaration, request, execution, continuation, model-visible transcript or provider-resumed state, ID pairing, tool-result formatting, vendor encodings (Anthropic Messages, OpenAI Responses and Chat Completions, MCP, Gemini generateContent and Interactions), client tools vs hosted/server tools, strict schemas and grammar-constrained custom tools, streaming arguments, tool search/deferred loading, programmatic tool calling, computer-use/browser-control screenshot-action loops, parallel vs sequential calls, error handling, and the separation between model intent and runtime execution. Do NOT use for deciding when or how many tools to call (use tool-call-strategy), multi-agent architecture (use agent-engineering), prompt wording (use prompt-craft), or eval design for tool-use behavior (use agent-eval-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"agent-engineering\",\"api-design\",\"type-safety\",\"client-server-boundary\",\"tool-call-strategy\"],\"suppresses\":[\"tool-call-strategy\"],\"verify_with\":[\"tool-call-strategy\"]}"
  subject: ai-engineering
  scope: "The protocol-level cycle by which a language model uses external tools: the four phases (declaration, request, execution, continuation), the state contract that carries requests/results across turns, the structural differences between Anthropic tool use, OpenAI Responses / Chat Completions function calling, OpenAI grammar-constrained custom tools, MCP, Gemini generateContent / Interactions function calling, SDK-managed loops, hosted tools, deferred tool loading, programmatic tool calling, and computer-use/browser-control loops, plus parallelism, streaming, strict schemas, in-cycle failure handling, untrusted-output handling, and model-produces-intent / runtime-executes-intent separation. Portable across tool-using LLM runtimes; principle-grounded, not repo-bound. Excludes the decision of when and how many tool calls to make (tool-call-strategy), agent-system architecture and coordination (agent-engineering), prompt wording (prompt-craft), and designing evals for tool-use behavior (agent-eval-design)."
  public: "true"
  taxonomy_domain: agent/protocol
  grounding: "{\"subject_matter\":\"Portable tool-call protocol mechanics for LLM runtimes: declaration, request, execution, continuation, schema/grammar validation, ID pairing, result formatting, streaming, hosted tools, MCP tool discovery, SDK-managed loops, tool search / deferred loading, programmatic tool calling, computer-use/browser-control action loops, provider-resumed interactions, and error handling\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://developers.openai.com/api/docs/guides/function-calling\",\"https://developers.openai.com/api/docs/guides/tools-tool-search\",\"https://developers.openai.com/api/docs/guides/tools-computer-use\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool\",\"https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool\",\"https://www.anthropic.com/engineering/code-execution-with-mcp\",\"https://modelcontextprotocol.io/specification/2025-11-25/server/tools\",\"https://modelcontextprotocol.io/specification/2025-11-25/basic/transports\",\"https://modelcontextprotocol.io/specification/draft/changelog\",\"https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/\",\"https://ai.google.dev/gemini-api/docs/function-calling\",\"https://ai.google.dev/gemini-api/docs/thought-signatures\",\"https://ai.google.dev/gemini-api/docs/interactions/interactions-overview\",\"https://ai.google.dev/gemini-api/docs/interactions/function-calling\",\"https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling\"],\"failure_modes\":[\"OpenAI Responses output items mistaken for Chat Completions tool messages\",\"function_call item id confused with call_id pairing key\",\"custom text-tool inputs treated as JSON-schema object arguments\",\"tool-result IDs omitted or mismatched\",\"Anthropic tool_result blocks inserted in the wrong message position\",\"Gemini function-call IDs or thought signatures omitted in manual history\",\"Gemini Interactions previous_interaction_id treated as permanent hidden memory instead of provider-supported continuation with beta and retention limits\",\"computer-use actions executed without screenshot/result feedback, coordinate mapping, isolation, approval, or page-content prompt-injection handling\",\"programmatic tool calling treated as unsandboxed model code execution or as a universal syntax rule\",\"large tool catalogs loaded eagerly instead of discovered/deferred just in time\",\"MCP 2026-07-28 release-candidate behavior treated as current stable protocol\",\"partial streamed arguments executed before validation\",\"MCP protocol errors collapsed with tool execution errors\",\"untrusted tool output promoted into instruction channels\",\"private runtime state assumed to be model-visible\"],\"evidence_priority\":\"equal\"}"
  stability: experimental
  keywords: "[\"tool call flow\",\"tool use protocol\",\"OpenAI Responses API\",\"function calling\",\"MCP tools\",\"tool result IDs\",\"strict schemas\",\"deferred tool loading\",\"programmatic tool calling\",\"computer use\"]"
  triggers: "[\"how does tool calling actually work\",\"what message shape should a tool result have\",\"Responses API vs Chat Completions tool calls\",\"MCP vs function calling vs Anthropic tools\",\"why do tool results need matching IDs\",\"where do tool errors live in the history\",\"what does an SDK tool runner automate\",\"how should tool search deferred loading fit the flow\",\"what is programmatic tool calling in the tool-use loop\",\"how does computer use fit the tool-call loop\"]"
  examples: "[\"design the message-shape contract between a model and a tool runtime\",\"explain why an OpenAI Responses function_call_output must carry the matching call_id\",\"debug a provider error because tool results were not placed immediately after tool requests\",\"decide whether this integration should be a client tool, hosted tool, MCP server, deferred tool, programmatic sandbox, or computer-use harness\",\"write the invariants for a streaming tool-call loop without executing partial JSON\"]"
  anti_examples: "[\"decide whether to call a tool or write a script (use tool-call-strategy)\",\"choose a multi-agent coordination pattern (use agent-engineering)\",\"design an eval suite that tests tool-call correctness (use agent-eval-design)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A tool-call flow is to a language model what a procurement system is to an executive: the executive signs a typed purchase order, the procurement department validates authority and constraints, carries out the purchase, then returns a receipt or documented failure. The next decision is made against that record, not against an invisible shared stack frame."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/ai-engineering/tool-call-flow/SKILL.md
---
# Tool-Call Flow

## Concept of the skill

A tool-call flow is the multi-turn protocol by which a language model uses external capabilities. The four phases are stable:

| Phase | Who acts | Output | Becomes |
|---|---|---|---|
| 1. Declaration | Runtime/provider/SDK | Tool catalog, schemas, grammar constraints, or a discovery/search surface | Model input for the next turn |
| 2. Request | Model | Structured tool-call intent, programmatic code that calls allowed tools, UI action request, or final answer | Assistant/model output in the transcript |
| 3. Execution | Runtime/provider/MCP server/sandbox/UI harness | Result of invoking the capability after validation and policy checks | Tool result, function output, screenshot, code result, or provider-hosted observation |
| 4. Continuation | Runtime/provider/SDK | Result paired to the request by ID, plus provider-required continuity artifacts | Next model input; the cycle repeats |

The cycle ends when the model emits a turn without tool-call requests. The final message's content is the answer.

The cycle's defining property is the separation of planning from execution. The model produces structured intent; the runtime carries it out. This is not a workaround for model limitations. It is a deliberate design choice that makes the system auditable, composable, and recoverable.

## Coverage

This skill covers the protocol-level cycle by which a language model uses external capabilities: declaration, request, execution, continuation, ID pairing, model-visible state, vendor message shapes, strict schemas, grammar-constrained custom tools, MCP discovery and results, SDK-managed loops, hosted/server tools, tool search and deferred loading, programmatic tool calling, code execution with MCP, computer-use/browser-control loops, parallel and streaming tool calls, error encoding, untrusted tool output, runtime responsibilities, and the boundary between model-side intent and runtime-side execution.

It does not decide whether a tool should be called, which tool is optimal, or how many calls are cost-effective. That is `tool-call-strategy`. It does not design multi-agent orchestration, prompt wording, external APIs, or eval suites.

## Philosophy of the skill

A tool-call flow is the smallest durable unit of agentic capability: one model turn asks for outside work, one runtime decides whether and how to execute it, and one continuation turn makes the result visible again. The important craft is keeping those responsibilities separate even when modern SDKs, hosted tools, MCP servers, computer-use loops, or provider-resumed interactions hide some mechanics.

The philosophy is therefore explicit serialization over magical control. The model should emit intent; the runtime should validate, authorize, execute, log, and encode the result; the next model turn should reason over the record it can actually see. A system that blurs those roles may feel easier in a demo, but it becomes harder to audit, replay, secure, and port between providers.

## Protocol Invariants

Vendor encoding can change, but these invariants do not:

| Invariant | What to check | Failure if broken |
|---|---|---|
| Tool declaration is model input | The model sees a bounded catalog with names, descriptions, and input contracts, or a discovery surface that can expose that catalog just in time. | The model invents unavailable tools or malformed arguments. |
| Tool request is structured intent | The model emits a typed block/item/action, not direct execution authority. | Runtime code treats free text as permission to act. |
| Runtime validates before execution | Tool name, arguments, grammar, authorization, idempotency, and side-effect policy are checked before dispatch. | Malformed, unauthorized, or destructive calls execute because the model asked. |
| Result is paired by ID | Every result carries the request ID: `tool_use_id`, `tool_call_id`, `call_id`, Gemini function-call `id`, or framework equivalent. | The continuation turn cannot prove which result belongs to which request. |
| Continuation preserves required output | The next request includes prior assistant tool-call output and provider-required reasoning, thinking, response, or interaction artifacts. | The provider rejects the request or the model loses the context needed to continue. |
| Tool output stays in a data channel | Results remain in tool-result/function-output/screenshot/result blocks and are treated as untrusted data. | Prompt injection inside retrieved content can be promoted into instructions. |
| Loop termination is explicit | Runtime caps steps and exits when the model emits a non-tool answer or hits a guardrail. | A model can re-call tools indefinitely. |

## Model-Visible State

The old shorthand "message history is the only state" is useful only if read as model-visible state. The precise rule is:

> A tool result influences the model only when the next turn includes it, or when the provider resumes an equivalent state through a documented continuation mechanism.

OpenAI Responses integrations preserve `response.output` items and return `function_call_output` items with the matching `call_id`; reasoning models also require reasoning items to be passed back with tool outputs. Gemini manual history must preserve function-call IDs, and Gemini thinking models may require `thoughtSignature` values to be passed back exactly. Gemini Interactions can continue through `previous_interaction_id`. Anthropic extended/structured tool flows may require preserving content blocks in a strict order. SDKs may hold runner state for you. None of that means the model has arbitrary hidden memory. It means the runtime must honor each provider's continuation contract.

## Vendor Protocol Comparison

The cycle is the same; the encoding differs.

### Anthropic Messages API

Anthropic client tools use `tool_use` blocks inside assistant content and `tool_result` blocks inside the following user message. Pair results with `tool_use_id`. Tool-result blocks must immediately follow the corresponding assistant tool-use message in history, and inside the user message they come before any explanatory text.

```jsonc
{
  "role": "assistant",
  "content": [
    { "type": "text", "text": "I'll check the weather." },
    {
      "type": "tool_use",
      "id": "toolu_01A",
      "name": "get_weather",
      "input": { "location": "Paris" }
    }
  ]
}
{
  "role": "user",
  "content": [
    {
      "type": "tool_result",
      "tool_use_id": "toolu_01A",
      "content": "{\"temp_c\":18,\"conditions\":\"cloudy\"}"
    }
  ]
}
```

Anthropic server tools are different in locus, not in concept: the provider executes the tool internally and incorporates the result without requiring the client to run the tool. The application still owns tool choice policy, approvals, observability, and trust boundaries.

### OpenAI Responses API

OpenAI Responses represents tool requests as output items. Preserve the response output, execute each `function_call`, then append a `function_call_output` input item with the matching `call_id`. The `function_call` item's `id` is not the pairing key; `call_id` is.

```jsonc
// Model output item
{
  "type": "function_call",
  "id": "fc_123",
  "call_id": "call_123",
  "name": "get_weather",
  "arguments": "{\"location\":\"Paris, France\"}"
}

// Runtime continuation item
{
  "type": "function_call_output",
  "call_id": "call_123",
  "output": "{\"temp_c\":18,\"conditions\":\"cloudy\"}"
}
```

For reasoning models, pass back any reasoning items returned with tool calls along with the tool outputs. Treat them as provider-required continuity artifacts, not as normal user-visible text.

### OpenAI Custom Tools And Grammar-Constrained Input

OpenAI Responses can declare `custom` tools whose input is text rather than a JSON object. A custom tool can use grammar constraints such as Lark or regex. The flow is still declaration, request, execution, continuation: the model emits a `custom_tool_call` with a `call_id`, the runtime validates/parses the text, executes only after policy checks, and returns the matching output.

```jsonc
{
  "type": "custom",
  "name": "timestamp",
  "description": "Saves a timestamp in a strict textual format.",
  "format": {
    "type": "grammar",
    "syntax": "regex",
    "definition": "^(January|February|March)\\s+\\d{1,2}\\s+at\\s+\\d{1,2}(AM|PM)$"
  }
}
```

Do not collapse custom text tools into JSON-schema function tools. The runtime's validation contract changes from "parse JSON arguments" to "parse/check grammar-constrained text and then enforce the same authorization, approval, logging, and result-pairing policy."

### OpenAI Chat Completions

Chat Completions encodes the same cycle with assistant `tool_calls` and `role: "tool"` result messages:

```jsonc
{
  "role": "assistant",
  "content": null,
  "tool_calls": [{
    "id": "call_abc",
    "type": "function",
    "function": {
      "name": "get_weather",
      "arguments": "{\"location\":\"Paris\"}"
    }
  }]
}
{
  "role": "tool",
  "tool_call_id": "call_abc",
  "content": "{\"temp_c\":18,\"conditions\":\"cloudy\"}"
}
```

This shape remains important for existing integrations and OpenAI-compatible APIs, but it is not the only OpenAI encoding.

### Gemini GenerateContent And Interactions

Gemini generateContent uses function declarations and `functionCall` / `functionResponse` parts. Gemini 3 model APIs generate a unique `id` for each function call; when manually constructing history or using REST, pass the matching `id` back in the `functionResponse`. Gemini function-calling modes also distinguish `AUTO`, `ANY`, `NONE`, and `VALIDATED`; `VALIDATED` constrains schema-adherent calls while still allowing natural language where applicable.

```jsonc
{
  "functionCall": {
    "id": "gth23981",
    "name": "get_weather",
    "args": { "location": "Paris" }
  }
}
{
  "functionResponse": {
    "name": "get_weather",
    "id": "gth23981",
    "response": {
      "content": { "temp_c": 18, "conditions": "cloudy" }
    }
  }
}
```

For thinking models, preserve `thoughtSignature` values when manually carrying history; SDKs may handle this automatically, but hand-rolled REST/history code must not drop them.

Gemini Interactions API beta changes the continuation surface without changing the concept. An `Interaction` records typed steps such as model thoughts, `function_call`, `function_result`, and final output. A later turn can continue through `previous_interaction_id`; current-turn tools, system instruction, and generation configuration are scoped to the interaction and must be specified as needed. Treat this as beta, version-gated provider-resumed state with storage and retention caveats, not as permanent hidden model memory.

### Model Context Protocol

MCP externalizes declaration and tool execution to a provider-neutral JSON-RPC layer:

1. Host/client calls `tools/list` on an MCP server.
2. MCP server returns tool definitions with `inputSchema` and optional `outputSchema`.
3. Host/client translates those tools into the model provider's declaration format.
4. Model emits a provider-specific tool request.
5. Host/client calls MCP `tools/call { name, arguments }`.
6. MCP server returns content, optional `structuredContent`, and `isError`.
7. Host/client translates the result into the model provider's continuation format.

MCP's contribution is dynamic discovery, provider neutrality, output schemas, structured results, rich content types, and a standardized host/server boundary. It is not a different four-phase cycle.

MCP 2025-11-25 is the current stable spec as of this audit. It defines `stdio` and Streamable HTTP transports, `tools/list`, `tools/call`, `structuredContent`, `outputSchema`, and two error layers: JSON-RPC protocol errors versus tool execution errors with `isError: true`.

## Where Execution Happens

Tool-call flow is the same cycle even when execution moves.

| Execution locus | Who runs the tool | What the app still owns |
|---|---|---|
| Client/user-defined tool | Your runtime executes local code, service calls, or human workflows. | Validation, authorization, dispatch, result encoding, retries, loop caps, logs. |
| Provider-hosted/server tool | The model provider executes an approved hosted tool such as web search, code execution, file search, computer use, or hosted MCP. | Tool choice policy, approval settings, observability, output trust boundaries, returned artifacts, and data-retention fit. |
| MCP server tool | An MCP host/client discovers tools with `tools/list`, invokes `tools/call`, and translates results into the provider's format. | MCP transport/session security, server trust, tool approval, result shaping, and version pinning. |
| SDK-managed runner | An SDK wraps the loop and may execute tools, append results, and stop after configured iterations. | Correct definitions, approval gates, error policy, trace capture, max iterations, and knowing when to take over manually. |
| Programmatic sandbox | Generated code calls allowed tools, loops, filters, and distills intermediate results before returning a compact observation. | Sandbox isolation, allowed callers, egress limits, credential scope, provider resource limits, provenance, and validation of distilled output. |
| Computer-use/browser-control harness | The model returns screenshot-grounded UI actions; the harness clicks, types, scrolls, waits, drags, moves, or captures screenshots. | Isolated environment, action allowlist, coordinate mapping, screenshot/result feedback, high-impact approvals, prompt-injection handling, and trace capture. |

## Tool Search And Deferred Loading

Large tool catalogs should not always be declared in full. Tool search/deferred loading is a declaration-phase sub-protocol: the model first sees a small search/discovery surface, uses it to retrieve relevant tool references, and only then receives or activates the full definitions for tools it can call.

| Pattern | Flow | Failure mode |
|---|---|---|
| Provider-hosted tool search | Mark functions/MCP servers as deferred; include `tool_search`; provider searches and loads a subset. | Deferring the search tool itself, hiding always-needed tools, or assuming discovery authorizes execution. |
| Client-executed tool search | Model emits a search call; your runtime performs BM25, semantic, regex, policy-filtered, filesystem, or tenant-specific lookup and returns definitions. | Returning untrusted or unauthorized tools, leaking private metadata, or bypassing approval gates. |
| MCP discovery | Host/client lists tools from MCP servers and shapes the provider-facing catalog just in time. | Treating discovery as trust, flooding context with every schema, or failing to cache/version definitions deliberately. |
| Code execution with MCP | Tool definitions are exposed as filesystem/code APIs inside a sandbox, so the model reads only the needed files and calls tools from code. | Confusing sandbox state with model-visible state, omitting sandbox policy, or letting intermediate data leak into logs. |

Deferred loading changes how declaration is populated. A discovered tool still needs a stable name, schema or grammar, request ID, validation, authorization, result pairing, and model-visible result formatting.

## Programmatic Tool Calling

Programmatic tool calling is not a fifth phase. It moves part of execution into a code-execution environment where the model writes code that calls allowed tools, loops, filters, branches, and distills results before returning a smaller observation.

| Variant | What changes | What must remain explicit |
|---|---|---|
| Client-side direct execution | The application exposes functions to generated code and runs that code locally. | Safe arbitrary-code execution, callable allowlist, arguments, side effects, returned data, and logs. |
| Self-managed sandbox | Generated code runs in a restricted container and calls tools through an explicit bridge. | Isolation, egress policy, resource limits, IPC/tool-call protocol, credentials, audit logs, and result validation. |
| Provider-managed programmatic tool calling | Provider manages the sandbox and invocation channel for allowed tools. | Allowed-caller policy, tool restrictions, data retention, approval policy, trace capture, and returned artifacts. |
| Code execution with MCP | Code calls MCP tools or MCP-like adapters to avoid sending every intermediate result through model context. | MCP server trust, credential scope, sandbox-to-MCP permissions, explicit state handles, and final result shaping. |

For Anthropic's programmatic tool-calling surface, Claude writes Python code in a code-execution container. When code calls a user-defined tool, execution pauses and the API returns a `tool_use` block with caller/code-execution metadata; the client returns the tool result and code execution continues. Intermediate results are not loaded into Claude's context unless the code logs or returns them. Current PTC uses `allowed_callers`, a `caller` field on tool-use blocks, container IDs, and an `expires_at` deadline while awaiting tool results. `allowed_callers` guides invocation but is not a security boundary; clients must still handle and validate direct calls.

Provider resource limits are version-specific. Current Anthropic code-execution containers are documented with 5 GiB RAM, 5 GiB workspace storage, 1 CPU, no outbound network, workspace-scoped file access, 30-day maximum container lifetime, and cleanup after 4.5 minutes idle. PTC currently has feature restrictions: tools with `strict: true` are not supported with programmatic calling, direct `tool_choice` forcing cannot force a programmatic call, `disable_parallel_tool_use` is not supported with PTC, and MCP connector tools cannot be called programmatically.

The key distinction is context economy, not authority. PTC can reduce model round trips and token use because loops, joins, filtering, and data transformation happen in code. It does not authorize arbitrary execution or remove validation, approval, timeout, sandbox, provenance, and result-shaping duties.

## Computer Use And Browser Control

Computer-use and browser-control tools are specialized tool-call flows for visual/UI environments. They do not make the model execute UI actions directly. The model observes a screenshot or UI state, emits action requests, the harness performs them, captures changed state, and returns a new screenshot/result.

| Element | Protocol meaning | Runtime duty |
|---|---|---|
| Screenshot/UI state | Model-visible observation grounding the next action. | Capture declared dimensions, redact sensitive regions when needed, preserve viewport/source provenance, and return fresh state after actions. |
| Action batch | Structured intent such as screenshot, click, double click, type, keypress, scroll, drag, mouse move, wait, or provider equivalent. | Execute only supported actions, in order, with timeout/resource limits and approval before sensitive or externally visible effects. |
| Coordinates | Arguments whose frame is the screenshot or declared display. | Keep display dimensions aligned with the actual image; handle downsampling, device-pixel-ratio, zoom, crop regions, and coordinate scaling. |
| Page/screen content | Tool output controlled by websites, apps, documents, emails, or images. | Treat on-screen instructions as untrusted data, not user permission; stop or ask before credentials, purchases, account changes, phishing, or other high-impact actions. |
| Continuation | New screenshot/result after action execution. | Pair it to the request (`call_id`, `tool_use_id`, or equivalent) and repeat until the model stops or a guardrail fires. |

Browser-control harnesses built with Playwright, Selenium, VNC, or MCP adapters are the same pattern with a different execution substrate. A DOM/API shortcut may be safer and more deterministic than UI actions, but the model-visible contract still needs observation, structured action intent, runtime execution, result feedback, and loop caps.

## Strict Schemas And Runtime Validation

Tool schemas do two jobs: they teach the model the argument shape, and they let the runtime validate before execution. Strict modes strengthen the model-output side; they do not authorize the action.

- Use constrained schemas: explicit `type`, `required`, enums where useful, bounded arrays/strings where possible, and clear descriptions for each argument.
- Enable provider strict/schema-adherent modes deliberately when available. OpenAI strict mode requires schemas that can be normalized into the supported subset; if omitted in Responses, the API attempts strict-compatible normalization when possible and can fall back to non-strict. Chat Completions remains non-strict by default.
- Still validate in the runtime. Provider strictness is version-specific, supports subsets of JSON Schema, and does not prove authorization, freshness, idempotency, or semantic safety.
- Recognize non-JSON argument contracts. OpenAI custom tools can accept grammar-constrained text input (`lark` or `regex`) instead of JSON-schema arguments; validate by grammar parsing and execution policy.
- Treat output schemas as a separate contract. MCP 2025-11-25 supports `outputSchema` and `structuredContent`; clients should validate structured results when an output schema is declared.
- Do not put private or sensitive data in schema names, enum values, `const` values, examples, or regex patterns. Schemas are often cached and logged differently from message content.

## Parallel Tool Calls

Protocols allow multiple tool-call blocks/items in one assistant turn. Those calls are an unordered batch. The runtime may execute them concurrently, sequentially, or in any order, but the model cannot condition one call in the batch on another call's result. Dependent calls must be sequential across turns.

```jsonc
{
  "role": "assistant",
  "content": [
    { "type": "tool_use", "id": "toolu_01A", "name": "get_weather", "input": { "location": "Paris" } },
    { "type": "tool_use", "id": "toolu_01B", "name": "get_weather", "input": { "location": "Tokyo" } }
  ]
}
```

If a batched call turns out to depend on another result and fails naturally, return that failure as an error result; the model can reissue the dependent call on the next turn. When using Anthropic-style parallel tool results, send the batch's tool-result blocks in one continuation message and place result blocks before any explanatory text. When deterministic ordering matters more than latency, disable parallel calls through the provider's controls where available.

## Streaming Tool Calls

Streaming changes when the runtime can observe a request, not the correctness contract. The safe rule is: aggregate argument deltas, parse and validate when the provider says the item/block is complete, then execute. Some providers expose fine-grained argument streaming where chunks arrive before server-side JSON buffering or validation; this reduces latency for large arguments but means clients must handle incomplete/invalid JSON and `max_tokens` cutoffs. Speculative execution is safe only when the call name, ID, and arguments are complete enough for the tool's idempotency and validation policy.

## Failure Encoding

There are two failure layers:

| Failure layer | Examples | Handling |
|---|---|---|
| Tool execution failure | Business/API rejection, timeout, permission denied, schema-valid input fails domain validation, dependency missing, tool-specific error | Return a model-visible tool result with error content (`is_error`, `isError`, error object, or framework equivalent). The model can retry, choose another tool, ask the user, or stop. |
| Protocol/transport/request-shape failure | Malformed JSON-RPC, invalid message ordering, missing `tool_call_id`, wrong `call_id`, provider 400 from misplaced result blocks, lost MCP Streamable HTTP session, incompatible strict schema | Runtime handles, retries, or fails closed outside the model when needed. If the model can recover, summarize the problem into a valid continuation; otherwise log the trace and stop safely. |

The runtime should not throw raw exceptions into the conversation or let transport errors silently disappear. The design goal is model-visible recovery for errors the model can act on, and fail-closed runtime handling for errors it cannot repair.

## Tool Results Are Untrusted Input

Tool outputs often contain text controlled by web pages, files, emails, user uploads, API records, screenshots, or other external systems. Treat those bytes as data, not instructions.

- Keep tool output inside tool-result/function-output/screenshot/result blocks; do not paste it into `system` messages or unlabeled user text.
- Preserve provenance: tool name, call ID, safe source URI or file path, timestamp, truncation/filtering status, and approval decision where relevant.
- Redact secrets and private data before returning output to the model unless the task explicitly requires model reasoning over that data and the runtime is authorized to expose it.
- Bound output size and shape. Prefer structured, minimal results over raw payloads when the model only needs a few fields.
- If output contains instructions that conflict with system/developer/user policy, treat them as adversarial content, not commands.

## The Runtime's Responsibilities

The runtime is the orchestrator. It owns:

- **Tool-surface shaping** - expose relevant tools or provide a discovery/search mechanism for large catalogs.
- **Schema and grammar validation** - validate JSON-schema arguments, grammar-constrained text, output schemas, and provider-specific strict-mode compatibility.
- **Provider-continuity preservation** - preserve response output items, reasoning items, thinking blocks, function-call IDs, Gemini function-call IDs, interaction IDs, or SDK runner state required by the next turn.
- **Dispatch** - route validated calls to local code, network APIs, MCP servers, provider-hosted tools, subagents, humans, sandboxes, or UI harnesses.
- **Authorization and approval** - pause or deny destructive, costly, privileged, high-impact, externally visible, or suspicious actions.
- **Execution policy** - timeouts, retries, rate limits, idempotency, parallelism limits, container/resource limits, egress limits, credential scope, and cancellation.
- **Result encoding** - format outputs as tool-result/function-output/screenshot/result messages paired by ID, with error flags where appropriate.
- **Untrusted-output handling** - keep results in data channels, redact where needed, bound output size, attach provenance, and avoid instruction promotion.
- **Transport/session security** - for MCP and remote tools, validate origins, authenticate connections, bind local servers safely, handle resumability, and fail closed on unsupported protocol versions.
- **Loop control** - cap turns/steps, detect runaway loops, and know when manual control is required.
- **Observability** - record tool name, request ID, validated arguments, approval decision, start/end times, result summary, error class, retries, continuation message ID, and provider/version.
- **Audit and persistence** - store the transcript or structured trace so runs are replayable without leaking secrets.

The model owns only planning: which tool, which arguments, and when to stop.

## SDK-Managed Loops And Upstream Displacement

Current SDKs and providers automate more loop mechanics:

- Anthropic Tool Runner can run tools, append results, wrap errors, manage conversation state, and stop after a configured iteration count.
- OpenAI Agents SDK and Responses tooling can attach function tools, hosted tools, hosted MCP tools, and specialist agents as tools.
- Vercel AI SDK models tools with input schemas, optional `execute`, strict mode, approval requests, multi-step stopping, and lifecycle callbacks.
- Anthropic/OpenAI tool search and MCP discovery load large catalogs just in time.
- Anthropic programmatic tool calling and code execution with MCP move loops, filtering, and data transfer into a code execution environment.
- OpenAI/Anthropic/Gemini computer-use tools move execution into a UI harness with screenshot-grounded actions and updated visual state.
- Gemini Interactions API beta moves more continuity and observability into typed server-side steps.

These displace boilerplate loop code in common cases. They do not displace the need to understand ID pairing, model-visible state, validation, authorization, approval, prompt-injection boundaries, loop caps, trace persistence, and when to take over manually.

## MCP Release-Track Note

Keep stable MCP guidance grounded in the implemented spec version. As of this audit, 2025-11-25 is the latest stable MCP spec; the 2026-07-28 release candidate is available but final publication is scheduled for July 28, 2026.

Version-gate these RC/draft points:

- Protocol-level HTTP sessions and `Mcp-Session-Id` are removed in the RC direction; applications can still keep state through explicit model-visible handles such as `basket_id` or `browser_id`.
- `initialize` / `notifications/initialized` are removed; protocol version, client identity, and capabilities move into request `_meta`.
- `server/discover` becomes the up-front capability/version discovery RPC.
- Streamable HTTP POST requests add routability headers such as `Mcp-Method` and `Mcp-Name`.
- Cacheable list/read results add `ttlMs` and `cacheScope` (`public` or `private`).
- Resource-not-found shifts from custom `-32002` to JSON-RPC `-32602` (`Invalid Params`).

Do not silently apply release-candidate behavior to stable deployments. Name the MCP version you implement.

## Verification

After applying this skill, verify:

- [ ] Every tool declaration has a precise name, description, input contract, and execution locus.
- [ ] Tool-call and tool-result messages/items are paired by the provider's correct ID field; OpenAI Responses uses `call_id`, not the output item `id`.
- [ ] OpenAI Responses integrations preserve `response.output`, append `function_call_output` with the matching `call_id`, and preserve reasoning items for reasoning models.
- [ ] OpenAI custom-tool integrations distinguish JSON-schema function tools from grammar-constrained text tools and validate Lark/regex input before execution.
- [ ] Anthropic integrations place `tool_result` blocks immediately after the assistant `tool_use` message and put tool-result blocks first in the user content array.
- [ ] Gemini integrations pass back function-call IDs and required thought signatures when manually constructing history or using REST.
- [ ] Gemini Interactions integrations treat `previous_interaction_id` as beta provider-managed continuation, re-specify current-turn tools/system/config as needed, and account for storage/retention limits.
- [ ] Strict/provider schema mode is enabled deliberately where supported, but runtime validation, authorization, and side-effect policy still happen before execution.
- [ ] Streaming code aggregates deltas and handles partial/invalid JSON before dispatch.
- [ ] MCP integrations name the implemented version, validate `outputSchema`/`structuredContent` where present, and distinguish protocol errors from execution errors.
- [ ] MCP 2026-07-28 RC behavior is version-gated and not applied to stable 2025-11-25 deployments by accident.
- [ ] Tool search/deferred loading keeps the search surface non-deferred, authorizes discovered tools before execution, and preserves normal ID/result pairing after loading.
- [ ] Programmatic tool calling runs generated code only in an approved execution environment with allowed callers, resource and egress limits, container timeout/expiration handling, approval gates, and validation of distilled results.
- [ ] Computer-use/browser-control integrations isolate the UI environment, declare display dimensions accurately, handle coordinate scaling, execute only supported actions, return updated screenshots/results, and require approval for high-impact actions.
- [ ] Tool results from external sources are treated as untrusted data, kept in tool-result channels, bounded, redacted where needed, and recorded with provenance.
- [ ] SDK-managed loops have explicit max iterations/stop conditions, approval hooks, trace capture, and a manual takeover path.
- [ ] Logs include a replayable transcript or structured trace without secrets.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Deciding when to call a tool versus when to write a script | `tool-call-strategy` | Strategy owns the decision; flow owns the protocol that carries it out. |
| Choosing a multi-agent coordination pattern | `agent-engineering` | Agent engineering owns system architecture; tool-call-flow is one cycle inside one agent/runner. |
| Writing the natural-language description inside a tool declaration | `prompt-craft` | Prompt craft owns wording; this skill owns the structural contract. |
| Designing the JSON shape of an external API a tool wraps | `api-design` | API design owns the external service surface; this skill owns the model-facing tool contract. |
| Designing evals for tool-use correctness | `agent-eval-design` | Eval design owns measurement; this skill describes the behavior being measured. |
| Debugging a tool's domain result quality | `debugging` | Debugging owns the diagnostic activity; this skill owns protocol mechanics. |

## Key Sources

- OpenAI. [Function calling guide](https://developers.openai.com/api/docs/guides/function-calling). Responses typed items, `function_call_output`, `call_id` pairing, reasoning-item preservation, strict mode, Chat Completions, and custom grammar tools.
- OpenAI. [Tool search](https://developers.openai.com/api/docs/guides/tools-tool-search). Hosted and client-executed tool search plus deferred loading.
- OpenAI. [Computer use](https://developers.openai.com/api/docs/guides/tools-computer-use). Screenshot/action/result continuation and untrusted page-content handling.
- Anthropic. [Handle tool calls](https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls). `tool_use` / `tool_result` pairing, result placement, `is_error`, server-tool distinction, and untrusted result warning.
- Anthropic. [Parallel tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use). Same-turn unordered batches and dependency-recovery guidance.
- Anthropic. [Fine-grained tool streaming](https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming). Argument deltas, invalid/partial JSON, and parse-on-completion guidance.
- Anthropic. [Programmatic tool calling](https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling). Code-execution-mediated tool calls, `allowed_callers`, caller metadata, container expiration, and incompatibilities.
- Anthropic. [Code execution tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool). Sandbox resource, network, file, retention, and container constraints.
- Anthropic. [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp). Filesystem-driven MCP discovery, context efficiency, and token-reduction example.
- Model Context Protocol. [Tools specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/server/tools). Stable MCP `tools/list`, `tools/call`, `structuredContent`, `outputSchema`, `isError`, and protocol-vs-execution error split.
- Model Context Protocol. [Transports 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports). Stable `stdio` and Streamable HTTP transport guidance.
- Model Context Protocol. [Draft changelog](https://modelcontextprotocol.io/specification/draft/changelog) and [2026-07-28 release-candidate announcement](https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/). Release-track stateless protocol changes, cache hints, routability headers, and error-code shift; version-gated until final.
- Google. [Gemini function calling](https://ai.google.dev/gemini-api/docs/function-calling). Function-call IDs, function responses, function-calling modes, automatic/compositional calling, and multi-tool use.
- Google. [Thought signatures](https://ai.google.dev/gemini-api/docs/thought-signatures). Required preservation of Gemini thinking-model thought signatures in manual function-calling history.
- Google. [Gemini Interactions API overview](https://ai.google.dev/gemini-api/docs/interactions/interactions-overview) and [Interactions function calling](https://ai.google.dev/gemini-api/docs/interactions/function-calling). Beta provider-resumed typed steps, `previous_interaction_id`, and `function_result` / `call_id` pairing.
- Vercel. [AI SDK Core: Tool calling](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling). Provider-agnostic tools, schemas, approvals, multi-step loops, and lifecycle callbacks.
- Yao, S. et al. [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629). Thought-action-observation loop that prefigured structured tool protocols.
- Schick, T. et al. [Toolformer: Language Models Can Teach Themselves to Use Tools](https://arxiv.org/abs/2302.04761). Foundational research on trained tool invocation.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `ai-engineering`
- Public: `true`
- Domain: `agent/protocol`
- Scope: The protocol-level cycle by which a language model uses external tools: the four phases (declaration, request, execution, continuation), the state contract that carries requests/results across turns, the structural differences between Anthropic tool use, OpenAI Responses / Chat Completions function calling, OpenAI grammar-constrained custom tools, MCP, Gemini generateContent / Interactions function calling, SDK-managed loops, hosted tools, deferred tool loading, programmatic tool calling, and computer-use/browser-control loops, plus parallelism, streaming, strict schemas, in-cycle failure handling, untrusted-output handling, and model-produces-intent / runtime-executes-intent separation. Portable across tool-using LLM runtimes; principle-grounded, not repo-bound. Excludes the decision of when and how many tool calls to make (tool-call-strategy), agent-system architecture and coordination (agent-engineering), prompt wording (prompt-craft), and designing evals for tool-use behavior (agent-eval-design).

**When to use**
- design the message-shape contract between a model and a tool runtime
- explain why an OpenAI Responses function_call_output must carry the matching call_id
- debug a provider error because tool results were not placed immediately after tool requests
- decide whether this integration should be a client tool, hosted tool, MCP server, deferred tool, programmatic sandbox, or computer-use harness
- write the invariants for a streaming tool-call loop without executing partial JSON
- Triggers: `how does tool calling actually work`, `what message shape should a tool result have`, `Responses API vs Chat Completions tool calls`, `MCP vs function calling vs Anthropic tools`, `why do tool results need matching IDs`, `where do tool errors live in the history`, `what does an SDK tool runner automate`, `how should tool search deferred loading fit the flow`, `what is programmatic tool calling in the tool-use loop`, `how does computer use fit the tool-call loop`

**Not for**
- decide whether to call a tool or write a script (use tool-call-strategy)
- choose a multi-agent coordination pattern (use agent-engineering)
- design an eval suite that tests tool-call correctness (use agent-eval-design)

**Related skills**
- Verify with: `tool-call-strategy`
- Related: `agent-engineering`, `api-design`, `type-safety`, `client-server-boundary`, `tool-call-strategy`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A tool-call flow is to a language model what a procurement system is to an executive: the executive signs a typed purchase order, the procurement department validates authority and constraints, carries out the purchase, then returns a receipt or documented failure. The next decision is made against that record, not against an invisible shared stack frame.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://developers.openai.com/api/docs/guides/function-calling`, `https://developers.openai.com/api/docs/guides/tools-tool-search`, `https://developers.openai.com/api/docs/guides/tools-computer-use`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/parallel-tool-use`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/fine-grained-tool-streaming`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/programmatic-tool-calling`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool`, `https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool`, `https://www.anthropic.com/engineering/code-execution-with-mcp`, `https://modelcontextprotocol.io/specification/2025-11-25/server/tools`, `https://modelcontextprotocol.io/specification/2025-11-25/basic/transports`, `https://modelcontextprotocol.io/specification/draft/changelog`, `https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/`, `https://ai.google.dev/gemini-api/docs/function-calling`, `https://ai.google.dev/gemini-api/docs/thought-signatures`, `https://ai.google.dev/gemini-api/docs/interactions/interactions-overview`, `https://ai.google.dev/gemini-api/docs/interactions/function-calling`, `https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling`

**Keywords**
- `tool call flow`, `tool use protocol`, `OpenAI Responses API`, `function calling`, `MCP tools`, `tool result IDs`, `strict schemas`, `deferred tool loading`, `programmatic tool calling`, `computer use`

<!-- skill-graph-context:end -->
