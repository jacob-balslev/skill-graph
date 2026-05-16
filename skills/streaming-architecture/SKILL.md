---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: streaming-architecture
description: "Use when reasoning about systems that emit a sequence of values over time and consume them incrementally: the producer/stream/consumer/backpressure/termination primitives, the difference between streaming and request-response, the difference between streaming and pub-sub messaging, how WHATWG Streams, Server-Sent Events, HTTP chunked transfer, WebSockets, gRPC streaming, and React Server Component streaming compose, push vs pull backpressure, and the failure modes (slow consumer, abandoned consumer, partial-result correctness). Do NOT use for the message-history protocol between a model and a tool runtime (use tool-call-flow), for the realtime-update channel design (use websocket / SSE skills), for the specific encoding of token-by-token LLM output streaming (use llm-streaming if it exists; otherwise tool-call-flow), or for event-driven architecture and event sourcing (use event-driven-architecture)."
version: 1.0.0
type: capability
category: engineering
domain: engineering/realtime
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-16"
drift_check:
  last_verified: "2026-05-16"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - streaming
  - stream
  - backpressure
  - SSE
  - server-sent events
  - chunked transfer
  - HTTP/2
  - WebSocket
  - WHATWG Streams
  - ReadableStream
  - TransformStream
  - gRPC streaming
  - RSC streaming
  - flow control
  - reactive streams
triggers:
  - "how should this endpoint stream"
  - "should this be SSE or WebSocket"
  - "is the consumer slow"
  - "what's the backpressure story"
  - "partial result delivery"
examples:
  - "design the response shape for an endpoint that returns 50,000 rows incrementally"
  - "decide between SSE and WebSocket for a live progress feed"
  - "diagnose why a fast producer is exhausting memory when the consumer falls behind"
  - "explain why an RSC-streamed page renders out of order and how the boundary resolves"
anti_examples:
  - "design the JSON shape of a single response payload (use api-design)"
  - "implement the model→tool message-history protocol (use tool-call-flow)"
  - "design pub-sub topic structure (use event-driven-architecture)"
relations:
  related:
    - tool-call-flow
    - client-server-boundary
    - rendering-models
    - performance-budgets
    - api-design
  boundary:
    - skill: tool-call-flow
      reason: "tool-call-flow owns the message-history protocol between a model and a tool runtime; streaming-architecture owns the lower-level pattern of incremental value emission with backpressure that streaming tool-call responses are a specialization of."
    - skill: api-design
      reason: "api-design owns the request/response surface for one round-trip; streaming-architecture owns the multi-value-over-time surface where one logical response is delivered as N chunks."
    - skill: rendering-models
      reason: "rendering-models owns the page-rendering taxonomy (CSR/SSR/SSG/RSC); streaming-architecture owns the incremental-delivery primitive that streaming SSR and RSC are built on."
    - skill: client-server-boundary
      reason: "client-server-boundary owns the serialization frontier; streaming-architecture is what makes the frontier traversable over time rather than only once per request."
  verify_with:
    - api-design
    - performance-budgets
concept:
  definition: "A streaming architecture is one where a producer emits a sequence of values over time and a consumer processes them incrementally, with an explicit flow-control signal (backpressure) regulating the rate between them. The architecture decouples production speed from consumption speed and makes partial results observable before the producer finishes — or before the producer is even known to terminate."
  mental_model: |
    Five primitives structure streaming reasoning:

    1. **Producer** — the source of values. May be finite (a database query result set), infinite (a clock tick, a log tail), or bounded-but-unknown (a generative model emitting tokens until it decides to stop). The producer's defining property is that it does not know in advance how long the consumer will take to process each value.

    2. **Stream** — the ordered, time-extended sequence of values flowing from producer to consumer. A stream is *not* a collection. A collection is a finite, materialized value you can re-iterate; a stream is a one-shot ordered emission with potentially unbounded length. The stream may carry framing (where each value begins and ends), typing, and ordering guarantees, but it never carries random access.

    3. **Consumer** — the sink that processes values as they arrive. A consumer may be passive (waiting to be handed values: push model) or active (asking for the next value: pull model). The consumer's defining property is that it can fall behind the producer, and when it does, something must give: drop values, buffer, slow the producer, or fail.

    4. **Backpressure** — the signal a slow consumer sends upstream to indicate "I cannot accept more right now." Backpressure is what distinguishes a streaming architecture from a fire-and-forget broadcast. Without backpressure, a fast producer paired with a slow consumer eventually fills buffers, exhausts memory, drops values, or crashes. With backpressure, the producer slows to match the consumer, and the steady-state throughput equals the slower of the two.

    5. **Termination** — the explicit signal that the stream has ended. Either side may originate termination: the producer (no more values, the source is exhausted), the consumer (I'm done listening, even if you have more), or the channel (the underlying transport closed). Termination is not the absence of new values; it is a distinct message. A stream that is "quiet for a while" is *not* terminated.

    The deep insight is that streaming is a contract about *time*, not about *transport*. Whether the values flow over an SSE connection, an HTTP/2 frame sequence, a WebSocket message stream, a gRPC server-streaming RPC, a WHATWG ReadableStream within one process, or React Server Component chunks, the five-primitive structure is identical. The transport determines latency, framing overhead, and bidirectionality; the structure determines correctness.

    The complementary insight is that streaming and async iteration are duals. Push streams (the producer drives) require backpressure as a runtime signal; pull streams (the consumer drives) get backpressure for free because the consumer cannot be over-supplied. JavaScript's `ReadableStream`, Node's object-mode streams, RxJS Observables, Reactive Streams, and Akka Streams all implement variations of this duality.
  purpose: |
    Streaming exists because three problems become unsolvable with single-shot request/response: latency to first byte, memory to hold the full result, and partial-result usefulness.

    **Latency to first byte.** A consumer that must wait for the producer to finish before processing anything has a worst-case latency equal to the full producer runtime. A streaming consumer can begin processing the first byte the instant it arrives. For a 30-second LLM generation, a search result that scans 10 million rows, or an HTML page whose `<head>` is cheap but whose `<body>` is expensive, this difference is the difference between "feels fast" and "feels broken."

    **Memory to hold the full result.** A consumer that materializes the full result before processing must allocate memory proportional to the result size. A streaming consumer can process each value and release it, allocating memory proportional only to the working set. For results larger than memory (log tails, database exports, video frames), streaming is not an optimization — it is the only viable design.

    **Partial-result usefulness.** Some results are useful before they are complete: the first 100 search results before the long-tail ones, the first 80% of an HTML page before the slow recommendations widget, the first chunk of an audio file before the rest. Single-shot delivery delays all of the result until the slowest part of it is ready; streaming delivery makes the useful part available immediately and treats the rest as enrichment.

    Streaming costs are real: framing overhead, more complex error semantics (an error mid-stream is harder than an error at the start), backpressure design (push systems require explicit work to handle slow consumers), and connection management (long-lived connections have failure modes that short-lived ones don't). The discipline of streaming architecture is knowing when these costs are worth paying — and what the contract between producer and consumer must encode to make them manageable.
  boundary: |
    **A stream is not a collection.** A collection (array, list, set) is materialized — every element is in memory at once and can be accessed in any order any number of times. A stream is non-materialized — elements pass through and are gone unless the consumer captured them. Operations that work on collections (sort, count, length, random-access lookup) do not work on streams without either buffering the entire stream (defeating its purpose) or accepting that the operation is approximate or windowed.

    **A stream is not an event.** An event is a discrete, named occurrence in a system that may or may not have subscribers. A stream is an ordered sequence with at least one consumer by design. Event-driven systems route events through topics or buses to interested parties; streaming systems carry an ordered sequence on a channel between specific endpoints. The two patterns compose (a streaming consumer can publish events; an event handler can produce a stream) but they are not the same primitive.

    **A stream is not a message queue.** A message queue stores values durably for asynchronous consumption with at-least-once or exactly-once semantics; a stream is an in-flight sequence with at-most-once-per-consumer delivery and no built-in durability. Kafka and similar log-structured systems blur this line by being a queue that exposes a streaming consumer interface — but the durability is the queue, the consumer interface is the stream.

    **Backpressure is not throttling.** Throttling is rate-limiting imposed by policy: "no more than 100 requests per second." Backpressure is rate-matching imposed by capacity: "I can process 100 per second right now; if you send more, you will buffer or fail." Throttling has a fixed cap; backpressure has a dynamic cap that follows the consumer's actual processing rate. A system that confuses the two will either underuse capacity (throttle set below real backpressure) or fail under load (backpressure ignored because throttle "should be enough").

    **HTTP/2 server push is not SSE.** HTTP/2 server push (RFC 7540 § 8.2) was a mechanism for a server to preemptively send resources alongside a response — largely deprecated in Chrome by 2022 because it produced poor outcomes relative to `<link rel=preload>`. Server-Sent Events (HTML Living Standard, EventSource API) is a protocol on top of HTTP/1.1 or HTTP/2 for the server to push a stream of event messages to a single client over a long-lived connection. They are different mechanisms at different layers; treating them as interchangeable is a category error.

    **Streaming is not a substitute for pagination.** Pagination divides a finite result into pages the client requests sequentially. Streaming delivers a sequence the server emits proactively. Pagination gives the client control over pace and order; streaming gives the server control over pace and continuity. For result sets the client may stop reading early, pagination is often the better fit; for results the server is computing as it emits, streaming is the better fit.

    **A streaming response is not a Promise.** A Promise resolves to one value (or one error). A streaming response yields N values then terminates. Idioms that assume Promise semantics — `await fetch()`, then read the body once — handle the body's stream-ness via a separate ReadableStream API. Treating a streaming endpoint's response as a Promise is the source of many "the fetch worked but I got nothing" bugs.
  taxonomy: |
    By transport mechanism:
    - **HTTP chunked transfer encoding** (RFC 9112 § 7.1) — the HTTP/1.1 mechanism for sending a body whose length is not known up front; the basis of every HTTP-based streaming protocol.
    - **Server-Sent Events (SSE)** — HTML Living Standard EventSource API; a one-way (server→client) stream of UTF-8 text events over a long-lived HTTP connection with automatic reconnection and a last-event-id resume mechanism.
    - **WebSocket** (RFC 6455) — a full-duplex framed message protocol upgraded from an HTTP handshake; bidirectional streaming where each direction is independent.
    - **HTTP/2 streams** (RFC 9113) — the multiplexed-stream layer of HTTP/2; multiple concurrent streams over one TCP connection with per-stream flow control.
    - **HTTP/3 streams** (RFC 9114) — HTTP/2 streams over QUIC instead of TCP; same stream semantics, different transport.
    - **gRPC streaming** — server-streaming, client-streaming, and bidirectional-streaming RPC modes built on HTTP/2 streams with protobuf framing.
    - **WHATWG Streams** — the in-browser API (ReadableStream, WritableStream, TransformStream) for streaming inside one JavaScript runtime; underlies fetch response bodies, the File API, and most modern web streaming.
    - **Node.js streams** — the older Node-specific stream types (Readable, Writable, Duplex, Transform) with `pipe()` composition; interop with WHATWG Streams via Web Streams adapter.

    By directionality:
    - **Server→client only (push down)** — SSE, gRPC server-streaming, RSC chunked responses.
    - **Client→server only (push up)** — large file upload over chunked transfer, gRPC client-streaming.
    - **Bidirectional** — WebSocket, gRPC bidi-streaming, WebRTC data channels.

    By backpressure model:
    - **Pull-based** — the consumer requests the next value (Node Readable in paused mode, WHATWG ReadableStream's reader.read(), async iterators). Backpressure is automatic because the producer never emits without a request.
    - **Push-based with credit** — the consumer signals "I can accept N more" (Reactive Streams, gRPC flow control). The producer emits up to N values then pauses until more credit arrives.
    - **Push-based without backpressure** — the producer emits as fast as it can; the consumer must keep up or drop (UDP-style firehose). Suitable only when loss is acceptable.

    By termination model:
    - **Finite stream** — the producer knows the count or has a defined endpoint (a query result set, a file).
    - **Infinite stream** — the producer has no defined end (a sensor feed, a clock, a log tail). The consumer terminates by unsubscribing.
    - **Bounded-by-decision stream** — the producer emits until an internal condition stops it (an LLM emitting tokens until it produces a stop sequence). Neither side knows the length up front.

    By in-stream error semantics:
    - **Fail-fast** — any error terminates the stream immediately; the consumer sees an error event and no further values.
    - **In-band error values** — errors are encoded as values in the stream (a tool-result-error message in a tool-call cycle); the consumer continues processing.
    - **Out-of-band signal** — errors arrive on a separate channel (HTTP trailers, WebSocket close frame); the value stream itself contains only successful values.

    By delivery guarantee:
    - **At-most-once** — values may be lost; never duplicated (default for SSE without resume, UDP).
    - **At-least-once** — values may be duplicated; never lost (Kafka consumer group, SSE with last-event-id).
    - **Exactly-once** — values are delivered once and only once (requires distributed coordination; rarely cheap).
  analogy: |
    A conveyor belt in a sushi restaurant. Plates emerge from the kitchen (the producer) and travel down the belt (the stream). Customers (consumers) take what they want as it passes; the belt does not stop and the plates do not wait. If a customer is slow, plates pile up at their station — at which point the kitchen sees the buildup and slows down (backpressure). If a customer leaves, plates they didn't take continue past unnoticed (at-most-once delivery).

    A different restaurant — table service — is the request/response analog. The customer orders, the kitchen prepares the full order, then it arrives all at once. The latency to first food is the full kitchen time; the memory required is the full order on the tray; partial enjoyment of the meal must wait until everything is on the table.

    SSE is a conveyor belt that runs in one direction only. WebSocket is a conveyor belt that runs in both directions simultaneously, with the kitchen sending dishes and customers sending requests on parallel belts. gRPC bidirectional streaming is the same idea with stricter framing — each plate has a printed label so neither side can mistake what arrived. HTTP/2 multiplexed streams are many conveyor belts sharing the same loading dock (TCP connection) with their own independent paces.

    Termination is the chef ringing the bell — "kitchen's closed, no more plates after the ones already on the belt." A quiet kitchen with no plates passing is *not* closed; it might be busy preparing something. The closing bell is a distinct, explicit signal — without it, customers wait forever for plates that will never come.

    Backpressure is the customer raising a hand to the kitchen: "we're full down here, slow down." Without it, a fast kitchen and slow customers produce a counter buried in plates the floor manager must throw away — which is what a buffer overflow is.
  misconception: |
    The most common misconception is that **streaming makes things faster**. It does not, in the sense of total throughput. A streaming endpoint and a batch endpoint that deliver the same data over the same network at the same rate transfer the same total bytes in roughly the same total time. What streaming changes is *when the first byte arrives* and *whether intermediate state is observable*. For latency-to-first-byte and partial-result usefulness, streaming is faster; for total wall-clock, it is approximately the same.

    The second misconception is that **all streaming protocols are interchangeable**. They are not. SSE is a one-way text-event protocol; WebSocket is a bidirectional binary-framed protocol; HTTP/2 streams are a transport feature most application code does not directly observe; gRPC streaming carries protobuf-framed values. Choosing between them is a function of directionality, framing, infrastructure compatibility (HTTP/1.1 proxies often break long-lived connections), client API expressiveness, and reconnection semantics — not interchangeable.

    The third misconception is that **backpressure is handled by the transport**. It is not. TCP has its own flow-control mechanism (the receiver's advertised window), but TCP backpressure is invisible to the application; an application that reads from a TCP socket fast enough to keep the socket buffer drained but processes the values slowly will accumulate in its own application buffer with no help from TCP. Application-level backpressure must be designed explicitly: pull-based APIs make it implicit; push-based APIs make it explicit; push-based APIs without explicit backpressure are the source of the "fast producer eats memory" failure mode.

    The fourth misconception is that **errors mid-stream are exceptional**. They are not — they are routine. Any long-lived connection will lose its underlying transport eventually (network blip, server restart, mobile network change). A streaming consumer that treats mid-stream termination as a fatal error rather than a routine resume point will fail in production. SSE's `Last-Event-ID` header and resume semantics exist precisely because mid-stream disconnection is normal.

    The fifth misconception is that **streaming and pagination are alternatives**. They serve different needs and frequently compose. A search-results page might paginate the long tail (client controls when to load page 2) while streaming the first page (server emits results as the index returns them). Treating them as exclusive forces a choice between "all the controls go to one side" and loses both benefits.

    The sixth misconception is that **WHATWG ReadableStream and Node.js streams are the same thing**. They are not. The two APIs exist independently and have different semantics for backpressure, error propagation, and composition. Modern Node (18+) provides a Web Streams adapter for interop, but a programmer who treats them as interchangeable will hit subtle differences (Node streams are EventEmitter-based and push-by-default with `pause()`; WHATWG streams are pull-based via a reader).

    The seventh misconception is that **infinite streams must be unbounded in resource use**. They need not be. A consumer that processes each value and releases it has bounded memory regardless of stream length; a producer that respects backpressure has bounded buffering. The infinity is in the *number* of values, not in the *resources* they consume. A naive consumer (`stream.toArray()`) collapses the distinction and crashes; a streaming consumer maintains it indefinitely.
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
