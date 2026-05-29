---
name: streaming-architecture
description: "Use when reasoning about systems that emit a sequence of values over time and consume them incrementally: the producer/stream/consumer/backpressure/termination primitives, the difference between streaming and request-response, the difference between streaming and pub-sub messaging, how WHATWG Streams, Server-Sent Events, HTTP chunked transfer, WebSockets, gRPC streaming, and React Server Component streaming compose, push vs pull backpressure, and the failure modes (slow consumer, abandoned consumer, partial-result correctness). Do NOT use for the message-history protocol between a model and a tool runtime (use tool-call-flow), for the realtime-update channel design (use websocket / SSE skills), for the specific encoding of token-by-token LLM output streaming (use llm-streaming if it exists; otherwise tool-call-flow), or for event-driven architecture and event sourcing (use event-driven-architecture). Do NOT use for design the JSON shape of a single response payload (use api-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: frontend-ui
  deployment_target: portable
  taxonomy_domain: engineering/realtime
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"streaming\",\"stream\",\"backpressure\",\"SSE\",\"server-sent events\",\"chunked transfer\",\"HTTP/2\",\"WebSocket\",\"WHATWG Streams\",\"ReadableStream\"]"
  triggers: "[\"how should this endpoint stream\",\"should this be SSE or WebSocket\",\"is the consumer slow\",\"what's the backpressure story\",\"partial result delivery\"]"
  examples: "[\"design the response shape for an endpoint that returns 50,000 rows incrementally\",\"decide between SSE and WebSocket for a live progress feed\",\"diagnose why a fast producer is exhausting memory when the consumer falls behind\",\"explain why an RSC-streamed page renders out of order and how the boundary resolves\"]"
  anti_examples: "[\"design the JSON shape of a single response payload (use api-design)\",\"implement the model→tool message-history protocol (use tool-call-flow)\",\"design pub-sub topic structure (use event-driven-architecture)\"]"
  relations: "{\"related\":[\"tool-call-flow\",\"client-server-boundary\",\"rendering-models\",\"performance-budgets\",\"api-design\"],\"boundary\":[{\"skill\":\"tool-call-flow\",\"reason\":\"tool-call-flow owns the message-history protocol between a model and a tool runtime; streaming-architecture owns the lower-level pattern of incremental value emission with backpressure that streaming tool-call responses are a specialization of.\"},{\"skill\":\"api-design\",\"reason\":\"api-design owns the request/response surface for one round-trip; streaming-architecture owns the multi-value-over-time surface where one logical response is delivered as N chunks.\"},{\"skill\":\"rendering-models\",\"reason\":\"rendering-models owns the page-rendering taxonomy (CSR/SSR/SSG/RSC); streaming-architecture owns the incremental-delivery primitive that streaming SSR and RSC are built on.\"},{\"skill\":\"client-server-boundary\",\"reason\":\"client-server-boundary owns the serialization frontier; streaming-architecture is what makes the frontier traversable over time rather than only once per request.\"}],\"verify_with\":[\"api-design\",\"performance-budgets\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "A streaming architecture is to data delivery what a conveyor belt is to a factory's order fulfillment — you do not wait for an entire shipment to be assembled before any piece leaves the warehouse; the belt moves boxes one at a time, the loading dock signals when it's full (backpressure), a final marker indicates the shipment is complete (termination), and the receiving truck can start unloading the first box while the last one is still being assembled. A conveyor with no full-dock signal flings boxes onto the floor; a conveyor with no end-marker keeps the truck driver waiting forever."
  misconception: "|"
  concept: "{\"definition\":\"A streaming architecture is one where a producer emits a sequence of values over time and a consumer processes them incrementally, with an explicit flow-control signal (backpressure) regulating the rate between them. The architecture decouples production speed from consumption speed and makes partial results observable before the producer finishes — or before the producer is even known to terminate.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-ui/streaming-architecture/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

# Streaming Architecture

## Coverage

The discipline of designing systems that emit and consume sequences of values over time with explicit flow control. Covers the five primitives (producer, stream, consumer, backpressure, termination), the transport mechanisms (HTTP chunked transfer, SSE, WebSocket, HTTP/2 streams, gRPC streaming, WHATWG Streams, Node streams), the directionality and backpressure-model taxonomies, in-stream error semantics, delivery guarantees, the design contract between producer and consumer, and the failure modes that streaming systems exhibit at scale (slow consumer, abandoned consumer, mid-stream disconnect, head-of-line blocking, partial-result correctness).

## Philosophy

Streaming is the response to a category of problem that batch request/response cannot solve: results that are too big to materialize, too slow to wait for, or too useful at the front to delay until the back arrives. The cost is a more demanding contract between producer and consumer — error semantics get harder, backpressure must be explicit, connections must be managed — but for the problem class it serves, batch is not an inferior streaming; batch is wrong.

The deeper philosophy is that streaming is a contract about *time*. The five primitives — producer, stream, consumer, backpressure, termination — are the same whether the transport is an SSE event source, a gRPC bidirectional RPC, a WHATWG ReadableStream piping into a TransformStream, an RSC chunked response, or an LLM emitting tokens. A practitioner who learns the contract once can move between transports at the cost of an encoding translation; a practitioner who learns only one transport's API conflates the contract with its encoding and treats every new streaming surface as a new concept.

The discipline of streaming architecture is to know when streaming is the right shape, to design the contract explicitly when it is, and to make backpressure and termination first-class in that contract rather than emergent properties of the transport.

## The Five Primitives

| Primitive | What it is | What it owns | Failure mode if absent |
|---|---|---|---|
| Producer | The source of values | Emission rate, ordering, framing | Stream cannot exist |
| Stream | The ordered emission channel | Carrying values in order; no random access | Values arrive out of order or lost in transit |
| Consumer | The processing sink | Processing rate, ack of received values | Producer has no purpose; values discarded |
| Backpressure | Flow-control signal upstream | Matching producer rate to consumer rate | Memory exhaustion, dropped values, crash |
| Termination | Explicit end-of-stream signal | Distinguishing "done" from "quiet" | Consumer waits forever; resource leak |

Any streaming system can be analyzed as: who is the producer, what is the stream's framing, who is the consumer, how does backpressure travel upstream, and how is termination signaled. A streaming system that has no answer for any of these is incomplete and will fail under load.

## Transport Comparison

| Transport | Directionality | Framing | Backpressure | Reconnect | Typical use |
|---|---|---|---|---|---|
| HTTP chunked transfer (RFC 9112) | Server→client | Length-prefixed chunks | TCP-level only | None | Large response body of unknown length |
| Server-Sent Events (HTML LS, EventSource) | Server→client | Newline-delimited `event:`/`data:` lines | TCP-level only | Built-in via `Last-Event-ID` | Live feeds, progress, LLM token streams |
| WebSocket (RFC 6455) | Bidirectional | Length-prefixed frames | Application-level | None (manual) | Chat, real-time games, collaborative editing |
| HTTP/2 streams (RFC 9113) | Bidirectional per stream | Per-stream framing with WINDOW_UPDATE flow control | Built-in via WINDOW_UPDATE | None (manual) | gRPC transport, multiplexed APIs |
| gRPC streaming | Server/client/bidi | Protobuf-framed values | Built-in via HTTP/2 flow control | Manual | Typed RPC, microservice streams |
| WHATWG ReadableStream | In-process | Reader queues | Built-in via pull model | N/A | Browser-side stream composition |
| Node.js Readable | In-process | Object or buffer chunks | Built-in via highWaterMark | N/A | Server-side file/network plumbing |

Selection rule: pick directionality first (one-way → SSE or HTTP chunked; two-way → WebSocket or gRPC bidi), then framing needs (binary structured → gRPC or WebSocket; text events → SSE; opaque bytes → HTTP chunked), then infrastructure compatibility (HTTP/1.1 proxies often break WebSocket and SSE; HTTP/2 proxies are friendlier).

## Server-Sent Events — The Streaming Default For Server→Client

SSE is the lowest-ceremony, highest-compatibility transport for server→client streaming. The HTML Living Standard `EventSource` API ships in every modern browser.

```
GET /stream HTTP/1.1
Accept: text/event-stream

HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-store

event: token
data: {"id":1,"text":"Hello"}

event: token
data: {"id":2,"text":" world"}

event: done
data: {}
```

Properties:
- One-way (server→client). Client can only initiate the connection; once established, only the server sends.
- UTF-8 text events with `event:`, `data:`, and `id:` fields.
- Built-in reconnect via `Last-Event-ID` header on the resume request.
- Works through HTTP/1.1 proxies; no upgrade handshake.
- No backpressure beyond TCP-level flow control — application-level pacing must be designed in if the producer can outrun the consumer.

For LLM token streaming, progress bars, status feeds, dashboards, and any one-way live update channel, SSE is the right starting point. Move to WebSocket only if bidirectionality is required.

## WebSocket — When Bidirectionality Is Required

WebSocket (RFC 6455) is a bidirectional, framed, binary-or-text protocol upgraded from HTTP. Both ends can send at any time.

```
GET /ws HTTP/1.1
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: ...
Sec-WebSocket-Version: 13

HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: ...
```

Properties:
- Full-duplex framed message protocol.
- Application-level backpressure required — neither end's send rate is automatically matched to the other end's receive rate.
- No built-in reconnect; the application must handle close codes and resume manually.
- Sensitive to HTTP/1.1 intermediaries that buffer or close idle connections.

For collaborative editing, multiplayer games, chat, and any interaction where both sides need to send unsolicited messages, WebSocket is the right transport. For one-way server-driven updates, it is more machinery than necessary and SSE is usually a better fit.

## Backpressure In Detail

The slow-consumer failure mode is the most consequential streaming failure. A producer that emits at 1000 events/sec and a consumer that processes at 100/sec produces 900 events/sec of accumulation. After one minute, the buffer holds 54,000 events; after one hour, 3.24 million. Without backpressure, this exhausts memory.

| Backpressure strategy | How it works | Trade-off |
|---|---|---|
| Pull (consumer asks) | Producer emits only when consumer calls `read()` | Implicit; correct by construction; requires pull-capable producer |
| Credit-based push | Consumer signals "I can accept N more"; producer emits up to N then waits | Explicit; works over network; adds round-trip latency |
| Buffered push with drop | Producer emits freely; buffer drops oldest/newest on overflow | Bounded memory; lossy; only acceptable when loss is OK |
| Buffered push with block | Producer emits freely; producer blocks when buffer full | Bounded memory; propagates slowness upstream; only works in-process |
| Sampling | Consumer samples N values/sec, discarding the rest | Lossy by design; correct for telemetry; wrong for correctness streams |

For each new streaming endpoint, the answer to "what happens when the consumer is slower than the producer?" must be one of these strategies — explicitly, not by accident.

## Termination And Resume

Termination is a distinct message, not the absence of new values. A consumer that interprets a 10-second silence as "the stream ended" will be wrong on any production network. Explicit termination signals:

| Transport | Termination signal |
|---|---|
| HTTP chunked | Zero-length chunk |
| SSE | Server closes the connection; client may auto-reconnect |
| WebSocket | Close frame with status code |
| gRPC | Status message on the trailer |
| WHATWG ReadableStream | Reader's `read()` returns `{done: true}` |

Resume after disconnect is a separate concern. SSE has it built in (`Last-Event-ID`); WebSocket requires application-level resume tokens; gRPC offers reconnect but not exactly-once across reconnects. A streaming consumer must be designed for "the connection dropped at value 4,732; reconnect and continue at 4,733" if that semantic matters.

## In-Stream Errors

| Strategy | When to use | Cost |
|---|---|---|
| Fail-fast (terminate stream on error) | The error invalidates everything after | Loses partial-results value of streaming |
| In-band error value | Errors are part of the value type (e.g., a tool-call result with an error payload) | Forces consumers to handle two value shapes |
| Out-of-band signal (HTTP trailer, WebSocket close code) | The stream is a sequence of successful values; errors are exceptional | Consumer must watch two channels |

The choice depends on whether the consumer can usefully proceed past an error. For LLM token streams, an error mid-generation is usually fatal — fail-fast. For a search-results stream, one row's permission error need not stop the others — in-band errors. For a long-lived telemetry stream, errors are out-of-band by convention.

## Streaming In Modern Web Frameworks

| Framework feature | Underlying mechanism |
|---|---|
| React Server Components streaming | HTTP chunked transfer; framework-specific chunk format |
| Next.js Suspense streaming | Streaming SSR over HTTP chunked transfer |
| Remix loader streaming with `defer()` | Promise serialization over the response stream |
| `fetch()` response body | WHATWG ReadableStream wrapping the network response |
| Node `res.write()` / `res.end()` | Node Readable on the response object |
| OpenAI/Anthropic/Gemini LLM streaming SDKs | SSE over HTTP; SDK parses event frames into iterable values |

Each of these is the same five-primitive contract dressed in a framework's API. The framework adds typing, suspense integration, error boundary handling, and ergonomic composition — but the underlying contract is the streaming-architecture primitive.

## Verification

After applying this skill, verify:
- [ ] Every streaming endpoint has a named answer for: who is the producer, who is the consumer, how is the stream framed, how does backpressure travel upstream, how is termination signaled.
- [ ] No long-lived connection assumes silence means "done" — termination is always a distinct signal.
- [ ] No streaming consumer materializes the full stream into a collection unless the stream is known-bounded and small.
- [ ] Backpressure strategy is explicit, not emergent: pull, credit-based push, drop-on-overflow, or block-on-overflow are named choices.
- [ ] Mid-stream errors have a defined encoding (fail-fast, in-band, or out-of-band) — they are not left to "whatever the transport does."
- [ ] If reconnect/resume matters for correctness, the protocol carries enough state (last-event-id, resume token) for the consumer to resume without gaps or duplicates.
- [ ] SSE is used for one-way; WebSocket for bidirectional; gRPC streaming for typed inter-service streams — choices are justified by directionality and framing, not by familiarity.
- [ ] The streaming endpoint's behavior under a deliberately slow consumer has been tested, not assumed.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing the message-history protocol between a model and a tool runtime | `tool-call-flow` | tool-call-flow is a specialization of streaming for the model↔runtime cycle; this skill is the underlying primitive |
| Choosing or designing event-driven and pub-sub architectures | `event-driven-architecture` | event-driven owns named-occurrence routing; streaming owns ordered-emission channels |
| Designing the JSON shape of a single response payload | `api-design` | api-design owns request/response surfaces; streaming-architecture owns multi-value-over-time surfaces |
| Implementing realtime collaborative updates with CRDT/OT | dedicated collab/sync skill | streaming is the transport; collaborative state has its own design layer above |
| Designing the page-level rendering taxonomy | `rendering-models` | rendering-models owns CSR/SSR/SSG/RSC; this skill owns the streaming primitive those depend on |

## Key Sources

- IETF. [RFC 9112 — HTTP/1.1, § 7.1 Chunked Transfer Coding](https://www.rfc-editor.org/rfc/rfc9112#name-chunked-transfer-coding). The base mechanism for streaming an HTTP body of unknown length.
- IETF. [RFC 9113 — HTTP/2, § 5 Streams and Multiplexing](https://www.rfc-editor.org/rfc/rfc9113#name-streams-and-multiplexing). HTTP/2's stream primitive and per-stream flow control (WINDOW_UPDATE frames).
- IETF. [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/rfc/rfc6455). The canonical specification for the bidirectional framed-message protocol.
- WHATWG. [HTML Living Standard — Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html). The EventSource API and the `text/event-stream` protocol.
- WHATWG. [Streams Living Standard](https://streams.spec.whatwg.org/). ReadableStream, WritableStream, TransformStream — the in-browser streaming primitives.
- Node.js. [Stream API documentation](https://nodejs.org/api/stream.html). Readable, Writable, Duplex, Transform; backpressure via highWaterMark and `pipe()`.
- gRPC Authors. [gRPC Concepts — RPC Lifecycle](https://grpc.io/docs/what-is-grpc/core-concepts/). Server-streaming, client-streaming, and bidirectional-streaming RPC modes.
- Reactive Streams. [Reactive Streams Specification](https://www.reactive-streams.org/). The cross-language specification for asynchronous stream processing with non-blocking backpressure — the basis of Akka Streams, RxJava, Project Reactor.
- React. [Streaming Server Rendering with Suspense (React 18 announcement)](https://react.dev/reference/react-dom/server). The framework-level streaming model that Next.js App Router and RSC build on.
- Mozilla Developer Network. [Using readable streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams). Practical reference for browser-side stream consumption.

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `frontend-ui`
- Deployment: `portable`
- Domain: `engineering/realtime`

**When to use**
- design the response shape for an endpoint that returns 50,000 rows incrementally
- decide between SSE and WebSocket for a live progress feed
- diagnose why a fast producer is exhausting memory when the consumer falls behind
- explain why an RSC-streamed page renders out of order and how the boundary resolves
- Triggers: `how should this endpoint stream`, `should this be SSE or WebSocket`, `is the consumer slow`, `what's the backpressure story`, `partial result delivery`

**Not for**
- design the JSON shape of a single response payload (use api-design)
- implement the model→tool message-history protocol (use tool-call-flow)
- design pub-sub topic structure (use event-driven-architecture)
- Owned by `tool-call-flow`: the message-history protocol between a model and a tool runtime
- Owned by `api-design`: the request/response surface for one round-trip
- Owned by `rendering-models`: the page-rendering taxonomy (CSR/SSR/SSG/RSC)
- Owned by `client-server-boundary`: the serialization frontier

**Related skills**
- Verify with: `api-design`, `performance-budgets`
- Related: `tool-call-flow`, `client-server-boundary`, `rendering-models`, `performance-budgets`, `api-design`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A streaming architecture is to data delivery what a conveyor belt is to a factory's order fulfillment — you do not wait for an entire shipment to be assembled before any piece leaves the warehouse; the belt moves boxes one at a time, the loading dock signals when it's full (backpressure), a final marker indicates the shipment is complete (termination), and the receiving truck can start unloading the first box while the last one is still being assembled. A conveyor with no full-dock signal flings boxes onto the floor; a conveyor with no end-marker keeps the truck driver waiting forever.
- Common misconception: |

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-16`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `streaming`, `stream`, `backpressure`, `SSE`, `server-sent events`, `chunked transfer`, `HTTP/2`, `WebSocket`, `WHATWG Streams`, `ReadableStream`
