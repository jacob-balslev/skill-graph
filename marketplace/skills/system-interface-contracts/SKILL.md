---
name: system-interface-contracts
description: "Use when defining or reviewing contracts between systems, modules, services, agents, jobs, events, APIs, or teams: ownership, inputs, outputs, invariants, compatibility, errors, idempotency, and versioning. Do NOT use for REST resource design alone (use `api-design`), async event contract detail (use `event-contract-design`), database schemas (use `data-modeling`), or post-failure debugging (use `debugging`). Do NOT use for design the REST endpoints, status codes, and pagination. Do NOT use for create database tables and constraints. Do NOT use for investigate why this existing integration is failing in production. Do NOT use for write an ADR after the interface decision has already been accepted."
license: MIT
compatibility: "Portable contract-design discipline across code modules, services, queues, APIs, webhooks, jobs, and agent interfaces."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"event-storming\",\"debugging\",\"api-design\",\"event-contract-design\",\"state-machine-modeling\",\"conceptual-modeling\"],\"suppresses\":[\"event-contract-design\",\"architecture-decision-records\",\"data-modeling\"],\"verify_with\":[\"testing-strategy\",\"code-review\",\"event-storming\"]}"
  subject: software-architecture
  scope: "Designing and reviewing cross-boundary interface contracts across modules, services, jobs, APIs, event producers/consumers, webhooks, data engineering surfaces, and AI agents/tools. Owns the stable promise at the boundary: parties, semantics, data shape, invariants, failure behavior, idempotency, security/trust, operational SLOs, compatibility, deploy choreography, observability, and verification. Excludes detailed HTTP resource design, async event envelope/topic design, persistence schema design, root-cause debugging, and ADR recording after the contract decision is accepted."
  public: "true"
  taxonomy_domain: architecture/contracts
  stability: experimental
  keywords: "[\"interface contract\",\"system boundary\",\"contract design\",\"compatibility contract\",\"input output invariant\",\"event schema\",\"module boundary\",\"idempotency contract\",\"versioning contract\",\"error contract\"]"
  examples: "[\"define the contract between the ingestion job and the dashboard view layer\",\"what invariants must this event producer and consumer share?\",\"review this module boundary for missing ownership and compatibility rules\",\"we need an interface contract before several agents implement opposite sides of the boundary\"]"
  anti_examples: "[\"design the REST endpoints, status codes, and pagination\",\"create database tables and constraints\",\"investigate why this existing integration is failing in production\",\"write an ADR after the interface decision has already been accepted\"]"
  grounding: "{\"subject_matter\":\"Portable cross-boundary system interface contract design\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://spec.openapis.org/oas/v3.2.0.html\",\"https://www.asyncapi.com/docs/reference/specification/v3.1.0\",\"https://github.com/cloudevents/spec\",\"https://modelcontextprotocol.io/specification/2025-06-18/basic/index\",\"https://modelcontextprotocol.io/specification/2025-06-18/server/tools\",\"https://google-a2a.github.io/A2A/specification/\",\"https://platform.openai.com/docs/guides/structured-outputs\",\"https://docs.pact.io/\",\"https://www.rfc-editor.org/rfc/rfc9457\",\"https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/\",\"https://protobuf.dev/best-practices/dos-donts/\",\"https://google.aip.dev/180\",\"https://json-schema.org/draft/2020-12\",\"https://semver.org/\",\"https://www.rfc-editor.org/rfc/rfc2119\",\"https://sre.google/sre-book/service-level-objectives/\",\"https://www.rfc-editor.org/rfc/rfc9413\",\"https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html\",\"https://martinfowler.com/articles/consumerDrivenContracts.html\",\"https://martinfowler.com/bliki/TolerantReader.html\",\"https://www.hyrumslaw.com/\",\"https://github.com/bitol-io/open-data-contract-standard\"],\"failure_modes\":[\"boundary_parties_not_named\",\"schema_confused_with_behavioral_contract\",\"compatibility_direction_unspecified\",\"semantic_break_labeled_additive\",\"idempotency_window_omitted\",\"expired_draft_treated_as_ratified_idempotency_standard\",\"slo_or_freshness_promise_omitted\",\"error_shape_human_only\",\"tool_contract_lacks_permissions_or_output_schema\",\"consumer_contract_not_verified_before_deploy\",\"external_contract_churn_leaks_internal_domain\",\"observability_cannot_detect_contract_violation\"],\"evidence_priority\":\"general_knowledge_first\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/system-interface-contracts/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# System Interface Contracts

## Concept of the skill

Designing and reviewing cross-boundary interface contracts across modules, services, jobs, APIs, event producers/consumers, webhooks, data engineering surfaces, and AI agents/tools.

## Concept of the Skill

**What it is:** System interface contract design is the discipline of making the stable promise at a boundary explicit before independently changing parties depend on it. The boundary may be a module, package, service, background job, queue, API, webhook, database read/write surface, AI tool, agent, or team handoff.

**Mental model:** A contract has parties, ownership, direction, semantics, data shape, lifecycle, failure behavior, compatibility rules, operational promises, trust boundaries, observability, and tests. A schema describes shape; a contract describes what both sides may safely rely on.

**Why it exists:** Integrations fail when each side has a private interpretation of "what the other side does." A written contract lets teams deploy independently, lets agents/tools call systems safely, and makes drift visible before it becomes a production incident.

**What it is NOT:** It is not detailed REST resource design, event envelope/topic design, stored-data modeling, post-failure debugging, or ADR writing after the contract is chosen. It owns the cross-boundary promise and routes detailed protocol work to the relevant neighbor skill.

**One-line analogy:** A system contract is a load-bearing join: the parts can move independently only because the join's shape, tolerances, and failure modes are known.

**Common misconception:** A JSON Schema, TypeScript type, OpenAPI file, or tool definition is not automatically the whole contract. Those artifacts are useful syntax and tooling surfaces, but the real contract also includes semantics, permissions, compatibility, deployment order, and what happens when something fails.

## Coverage

Design and audit contracts across boundaries: modules, services, event producers/consumers, background jobs, APIs, webhooks, database integration surfaces, and agents. Covers:

- **Boundary identity:** producer, consumer, owner, dependency direction, audience class, stability level, release channel, and who may approve a breaking change.
- **Semantic promise:** purpose, allowed states, invariants, forbidden states, preconditions, postconditions, side effects, and source-of-truth rules.
- **Data shape:** inputs, outputs, required/optional/nullable/deprecated fields, types, units, identifiers, defaults, examples, and redaction rules.
- **Operational promises and SLOs:** availability, latency percentiles, throughput, concurrency, data freshness, quality thresholds, consistency windows, durability, quotas, measurement windows, and violation response.
- **Failure and delivery behavior:** typed errors, retryability, timeouts, cancellation, rate limits, ordering, duplicate delivery, idempotency keys, dedup windows, and replay behavior.
- **Trust and authorization:** authn/authz, tenant isolation, object/property/function-level permissions, data sensitivity, least privilege, and agent/tool permission boundaries.
- **Compatibility and evolution:** source, wire, and semantic compatibility; backward/forward/full compatibility direction; additive vs breaking changes; versioning, deprecation, sunset, and migration windows.
- **Deploy choreography:** who upgrades first, whether old and new versions overlap, feature flags, consumer registration, canarying, rollback expectations, and "can I deploy?" gates.
- **The producer/consumer robustness split:** conservative producers, tolerant readers, and where that principle stops (trust and security boundaries).
- **Observability:** metrics, logs, traces, correlation IDs, violation counters, SLO/SLA burn signals, freshness lag, and support handoff fields needed to prove the contract is being honored.
- **Verification:** schema validation, consumer-driven contract tests, provider verification, positive and negative fixtures, compatibility checks, and production monitors.
- **Agent-facing contracts:** tool schemas, output schemas, side-effect declarations, confirmation requirements, permissions, result formats, and machine-actionable errors for agents and orchestrators.

## Philosophy of the skill
A boundary without a contract is a rumor. The implementation may work today because both sides accidentally agree, but the first independent change exposes the missing contract.

Contracts should be specific enough to protect both sides from drift and small enough that teams can keep them true. The contract is not the implementation. It is the stable promise at the boundary.

**Design the promise before optimizing the mechanism.** A contract should say what the caller may assume and what the callee must guarantee. The transport, framework, schema language, and generated code are implementation choices that support the promise; they do not replace it.

**Observable behavior becomes contract — beware the implicit contract.** With enough consumers, every *observable* behavior of your boundary — undocumented field ordering, incidental latency, a quirk in error text, null behavior, retry timing, headers, logs — becomes something someone depends on, regardless of what the written contract says ([Hyrum's Law](https://www.hyrumslaw.com/)). The defense is to make the real contract explicit and narrow: decide deliberately which observations are public promises, then deliberately vary or hide what you do not guarantee (randomize undocumented ordering, avoid leaking incidental detail) so consumers cannot silently form shadow contracts you never agreed to.

**Compatibility is relative to deployment independence.** A co-deployed module can tolerate a narrower migration window than a public API, a third-party webhook, or an agent tool exposed through MCP. Design for the least coordinated consumer, not the most convenient producer.

**Be conservative as a producer and tolerant as a reader, within limits.** The classic framing is the robustness principle — "be conservative in what you do, be liberal in what you accept" (Postel's Law). In practice the *producer* emits exactly what it promised and changes only additively; the *consumer* is a [tolerant reader](https://martinfowler.com/bliki/TolerantReader.html) that ignores unknown fields and supplies defaults for absent optional fields instead of failing. A consumer that deserializes strictly and throws on an unrecognized field turns every additive producer change into a production incident. Do not, however, tolerate malformed known fields, invalid types, authorization bypasses, money-movement ambiguity, or untrusted input at a security boundary.

**Do not hide ambiguity behind Postel's Law.** Unbounded tolerance *reduces* robustness: it lets sloppy producers proliferate, entrenches buggy behavior as a de-facto standard, and is dangerous at security boundaries where malformed input must be rejected ([RFC 9413 — Maintaining Robust Protocols](https://www.rfc-editor.org/rfc/rfc9413), Thomson & Schinazi, 2023). The resolution is not "always be liberal" but **scoped tolerance**: be tolerant of *unknown* fields (forward-compatibility), strict about *known* fields, *types*, and *security-relevant* invariants. At a trust boundary (untrusted input, auth, money movement), validate strictly and fail closed unless the contract says exactly what is tolerated, how it is validated, and why accepting it cannot expand authority or hide an attack.

**Operational promises are contract terms when consumers plan around them.** If a dashboard, data pipeline, tool, or downstream service depends on p99 latency, throughput, availability, freshness, durability, or a quality threshold, record the SLI, SLO target, measurement window, owner, alert threshold, and response when the objective is missed. An SLO without an error budget and a defined violation response is a wish, not a contract ([Google SRE — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/)). If performance is only aspirational, say it is non-contractual.

**Use an anti-corruption layer for contracts you consume but do not control.** When an external, legacy, vendor, or cross-team boundary can change independently, isolate it behind a translation layer that maps external shapes and meanings into the internal domain. The ACL owns normalization, defaulting, version bridging, validation, and alerting so external churn does not become internal semantic drift.

**Agent consumers need contracts, not prose hints.** An agent cannot reliably infer whether an error is retryable, a tool call is destructive, or a field contains sensitive data. Tool and agent contracts must encode structured inputs, structured outputs, permissions, side effects, and machine-actionable failure signals.

## Boundary Triage

Use this skill when the task is the contract that lets two independently changing sides work together.

| If the task is mainly... | Use |
|---|---|
| Cross-boundary ownership, semantics, invariants, compatibility, failure behavior, and verification across multiple surfaces | `system-interface-contracts` |
| REST/resource route taxonomy, status codes, pagination, HTTP headers, API envelopes, or OpenAPI endpoint detail | `api-design` |
| Async event envelope, schema, topic/channel, replay, ordering, dead-letter behavior, or AsyncAPI/CloudEvents detail | `event-contract-design` |
| Stored entities, keys, constraints, indexes, normalization, provenance, or data lifecycle | `data-modeling` |
| Lifecycle states, guards, invalid transitions, and transition tests for one workflow or object | `state-machine-modeling` |
| Domain discovery before the contract exists | `event-storming` or `conceptual-modeling` |
| Root-cause isolation after a boundary already failed | `debugging` |
| Recording an accepted contract decision and its consequences | `architecture-decision-records` |
| Choosing the right verification level for a change | `testing-strategy`; use `contract-testing` when available for detailed contract-test implementation |

## Contract Artifact Choice

Pick the artifact that matches the boundary. A Markdown contract is acceptable for a small internal module; an independently deployed or public boundary needs a machine-readable source of truth plus verification. Each row's compatibility model follows the rules in §Compatibility Rules.

| Boundary | Prefer artifact | Verify with | Contract dimensions still owned here |
|---|---|---|---|
| Module/package boundary | Typed interface plus Markdown contract, examples, and tests | Type checker + unit tests | Ownership, invariants, pre/postconditions, compatibility promises, negative fixtures |
| HTTP API | [OpenAPI](https://spec.openapis.org/oas/v3.2.0.html) 3.2+ where toolchain supports it | Schema validation + consumer-driven contract test | Audience, stability, auth, semantic compatibility, deploy choreography; route detail goes to `api-design` |
| Async/evented API | [AsyncAPI](https://www.asyncapi.com/) 3.1+, [CloudEvents](https://cloudevents.io/) where event metadata interoperability matters | Schema-registry compatibility check | Producer/consumer ownership, compatibility mode, operational envelope; envelope/topic detail goes to `event-contract-design` |
| gRPC/Protobuf or typed RPC | [Protobuf](https://protobuf.dev/)/`.proto` IDL ([Smithy](https://smithy.io/2.0/spec/index.html), [TypeSpec](https://typespec.io/) where they fit), generated clients, compatibility lint | Generated stubs + backward-compat linter (e.g. Buf) | Field-number discipline, source/wire/semantic compatibility, rollout order |
| Service model or SDK surface | Smithy or equivalent IDL plus semantic-diff tooling | Semantic-diff / breaking-change linter | Breaking-change policy, client generation obligations, deprecation window |
| JSON payload shared across systems | [JSON Schema](https://json-schema.org/) 2020-12 plus examples | Schema validation (positive + negative fixtures) | Which fields are contractual, defaults, semantic constraints, validation failure behavior |
| Data product or analytical data boundary | [Open Data Contract Standard (ODCS)](https://bitol-io.github.io/open-data-contract-standard/) plus data-quality and freshness checks | Data-quality checks (route persistence detail to `data-modeling`) | Producer/consumer ownership, dataset semantics, schema, quality rules, service-level expectations, access terms, evolution, and alert routing |
| Consumer/provider relationship | [Pact](https://docs.pact.io/) or consumer-driven contract tests plus broker/deploy gate | Provider verification + `can-i-deploy` deploy gate | Real consumer expectations, provider verification, canary/rollback rules |
| AI tool exposed to agents | [MCP tool schema](https://modelcontextprotocol.io/), provider tool schema, or framework-specific tool contract | Schema validation of tool args/results + the agent-contract checklist below | Input schema, output schema, permissions, side effects, confirmation, error behavior, data exposure |
| Agent-to-agent collaboration | [A2A](https://a2a-protocol.org/) agent card/task/message/artifact contract where appropriate | A2A conformance + integration test | Capability discovery, task states, auth, user identity propagation, handoff semantics |
| Decision record | ADR after the contract is accepted | — | Rationale and consequences; the contract itself remains a separate artifact |

## Method

1. **Name the boundary and parties.** Identify producer, consumer, owner, approver, dependency direction, release cadence, audience class, and trust level. Record who is allowed to make a breaking change, who must adapt, and whether consumers are co-deployed, independently deployed, external, or agentic.
2. **Choose the source-of-truth artifact.** Decide whether the contract is Markdown, type/IDL, OpenAPI, AsyncAPI, CloudEvents, Protobuf, JSON Schema, Smithy, Pact, MCP, A2A, or a combination. Name which artifact wins when generated code, docs, and implementation disagree.
3. **Define the semantic promise.** State purpose, allowed states, invariants, forbidden states, preconditions, postconditions, side effects, and source-of-truth rules. Do not stop at field names.
4. **Define the data shape.** For every input and output field, record required/optional/nullable/deprecated status, type, unit, identifier stability, default, examples, redaction, and whether unknown fields are allowed. Optional-with-default is a distinct, contract-relevant case from required.
5. **Define operational promises and SLOs.** Record availability, p95/p99 latency, throughput, concurrency, data freshness, data quality, durability, consistency windows, quotas, and capacity limits when consumers rely on them. For each promised objective, name the SLI, target, measurement window, owner, alert threshold (often a burn-rate alert fired before the error budget is fully spent), and violation response (page, degrade, shed load, fail over).
6. **Define failure and delivery semantics.** Specify typed errors, retryability, retry budget, timeout, cancellation, ordering, duplicate delivery, deduplication, replay, and idempotency. Where duplicate delivery is possible, define the idempotency key source, request fingerprint, retention/expiration window, replay response, and same-key/different-payload conflict behavior. (Detail in §Error, Retry, and Idempotency Contracts.)
7. **Define trust and authorization.** State authentication, authorization, tenant boundary, object/property/function-level permissions, data sensitivity, least privilege, and whether user consent or confirmation is required before a side effect. An API can authorize the endpoint yet still over-return fields the caller is not entitled to see; name the permission granularity.
8. **Protect the internal domain from uncontrolled contracts.** If the producer or consumer is external, legacy, vendor-owned, or otherwise outside your control, put an anti-corruption layer at the boundary. Define translation rules, validation, defaulting, version bridging, telemetry, and the owner of external-change response.
9. **Classify compatibility before the first change.** Decide source, wire, and semantic compatibility obligations. Pick backward, forward, full, or transitive compatibility where schema evolution applies. Define additive, risky, and breaking changes against that mode. (Detail in §Compatibility Rules.)
10. **Plan evolution and deploy choreography.** A contract change is not atomic across a distributed system — producer and consumer deploy at different times. Record versioning scheme, deprecation policy, sunset date if known, support window, feature flags, consumer notification, rollout order (for a backward-compatible change, ship new consumers first; for a forward-compatible change, ship new producers first), the version-overlap window during which both contract versions are live and both must validate, rollback behavior (a rollback must not strand data already written under the new contract), and canary criteria.
11. **Define observability and operational envelope.** Add correlation IDs, request IDs, event IDs, trace attributes, contract-version labels, error-type counters, schema rejection counts, dedup collisions, SLO burn-rate signals, latency/reliability/freshness monitors, and support handoff fields. Name the signal that would reveal a violation in production.
12. **Verify the contract before implementation drifts.** Add schema validation, positive and negative fixtures, consumer-driven contract tests, provider verification, compatibility checks, SLO monitors, and production monitors. Gate deploys for independently deployed parties on verified consumer/provider compatibility. (Detail in §Verification Patterns.)

## Compatibility Rules

"Additive vs breaking" is not precise enough by itself — the change is only well-defined relative to which side reads which side's data. First name the compatibility dimension:

| Dimension | Question |
|---|---|
| Source compatibility | Does code written against the old surface still compile/type-check against the new one? |
| Wire compatibility | Can old and new binaries or services still serialize, deserialize, and exchange messages correctly? |
| Semantic compatibility | Does the consumer still receive behavior a reasonable consumer of the old contract would expect? |

This source/wire/semantic distinction is the one [Google AIP-180](https://google.aip.dev/180) codifies; it is the missing bridge between schema evolution and real consumer expectations.

Then name the schema-evolution direction when data moves between versions. The cleanest vocabulary comes from the [Confluent schema-evolution model](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html); it originates in Kafka schema registries but is a *general* contract-evolution model that governs synchronous APIs and RPC too:

| Mode | Meaning | Typical safe changes |
|---|---|---|
| Backward compatible | New consumer reads old producer data | Add optional fields; preserve previous defaults; keep old data readable |
| Forward compatible | Old consumer reads new producer data | Add ignorable fields; remove only optional fields; require tolerant readers |
| Full compatible | Both directions hold | Add or remove optional fields only |
| Transitive | New version is checked against every prior supported version, not only N-1 | Required when consumers may skip versions or old data can replay indefinitely |

⚠️ **Do not import schema-registry vocabulary blindly into request/response API contracts.** In serialization-schema ecosystems (Avro/Protobuf with a compatibility registry), deleting an optional field may be labeled backward-compatible because new readers process old records and old readers safely ignore absent optional writer fields — but field deletion is safe *only* under that default-on-absence condition, never unconditionally. For request/response APIs, RPC surfaces, and agent tool parameters, the opposite governs: existing public components are treated as immutable, so **removing or renaming a field, parameter, endpoint, or enum value is a breaking change** regardless of direction (the rule [Google AIP-180](https://google.aip.dev/180) codifies). Keep "schema evolution over stored or streamed records" separate from "API surface stability for callers." Pick the model that matches your artifact, then classify every proposed change against it.

Treat these as breaking unless proven otherwise: removing or renaming a field, changing a type or unit, tightening validation, adding a required field, changing default behavior, changing enum meaning, reusing a Protobuf tag number, changing ordering or pagination semantics, changing retryability, weakening auth, changing side effects, or returning a different error class for the same failure.

For Protobuf/typed IDLs, never reuse field numbers or enum numbers that were ever live; reserve deleted tags/names. For JSON-like contracts, prefer optional additions, open enum handling where consumers can safely ignore unknown values, and explicit deprecation before removal. Anything that violates the chosen mode is a breaking change and needs a new version + deprecation window, never a silent edit.

Treat tolerant-reader behavior as a declared compatibility rule, not a blanket excuse to accept anything. Unknown fields can be ignored only when extension semantics allow it. Invalid known fields, malformed types, unsafe enum values, and ambiguous security-sensitive input should be rejected with a typed error so drift is visible instead of silently normalized.

## Error, Retry, and Idempotency Contracts

Failures are part of the interface, not an afterthought. A consumer should not parse human prose to decide whether to retry, escalate, or correct input.

- **Error identity:** a stable, machine-readable type/code per error class so the consumer can branch on the error *type*; the human message is secondary.
- **Retryability:** `retryable`, `retry_after` (or the protocol-standard equivalent), backoff, retry budget, and the terminal failure class. Distinguish "invalid arguments, do not retry" from "transient, retry with backoff."
- **Responsibility:** whether caller, provider, owner, or operator action is required.
- **Correlation:** request ID, trace ID, event ID, tool call ID, or equivalent support handle.
- **Idempotency:** key source, fingerprinted request fields, retention/expiration window, replay response, conflict-on-mismatch behavior (when the same key arrives with a *different* payload, reject — do not silently apply), and dedup-store owner.

For HTTP-facing boundaries, [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) (successor to RFC 7807, with an IANA problem-type registry) is the portable default error shape — `type` (a stable URI identifying the problem class), `title`, `status`, `detail`, `instance`, plus typed extension members — with `Retry-After` where appropriate. This is increasingly agent-driven: providers such as Cloudflare now return RFC 9457 for edge errors specifically so orchestrators can branch and back off deterministically ([Cloudflare, RFC 9457 agent error pages](https://blog.cloudflare.com/rfc-9457-agent-error-pages/)).

The IETF [`Idempotency-Key` header](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) is an **Internet-Draft, not a ratified standard — re-verify its current status before citing it as normative.** Treat its key, fingerprint, expiry, and replay-response rules as useful non-normative *shape* vocabulary unless your platform has explicitly adopted them. Adopt its shape regardless: the resource publishes its idempotency specification, including the **expiration policy** for stored keys and the conflict behavior on a same-key/different-payload collision.

The HTTP status code and endpoint envelope *design* still belong to `api-design`; this skill owns the cross-boundary requirement that errors be stable, typed, and actionable.

## Agent and Tool Contracts

An agent/tool boundary is a system contract whose consumer is a model, not human code — the same discipline applies, plus extras the LLM caller forces because a model may choose tools, compose tool calls, and retry without a human noticing.

For every tool or agent interface, define:

- **Identity:** tool or capability name, purpose, owner, stability, and discovery mechanism.
- **Input schema and output schema** — a typed, machine-readable shape (JSON Schema in MCP's `inputSchema`/`outputSchema`) so the model emits valid arguments and parses results structurally; document any unsupported schema features if the provider accepts only a subset. Treat a *structured-output* contract (the model must return JSON conforming to a schema) as an output contract with the same compatibility rules as any other.
- **Side effects:** read-only, write, delete, external communication, money movement, code execution, or human-visible change — and the blast radius. A read-only tool and a money-moving tool are different trust classes even behind the same call shape.
- **Permissions and trust:** scopes, tenant, user identity propagation, delegated auth, consent, confirmation before destructive/irreversible/costly actions, and least-privilege defaults.
- **Runtime limits:** timeout, concurrency, rate limits, cancellation, max retries, and cost/usage budget when relevant.
- **Error/result contract:** structured result, typed error, retryability, partial-result behavior, and whether a refusal or blocked action is a valid result. Reuse the machine-actionable error contract from §Error, Retry, and Idempotency Contracts.
- **Determinism and idempotency:** declare whether repeated identical calls are safe — an agent will retry — reusing the idempotency contract above.
- **Injection / trust boundary:** tool metadata, tool output, retrieved content, and remote agent messages are data to inspect, *not* instructions to obey.

Treat agent tool outputs as untrusted contract payloads. They may satisfy an output schema and still contain prompt-injection text, exfiltration requests, or instructions that conflict with system/developer/user policy. Validate the payload, route only the fields the contract declares, and never let returned content expand permissions, skip confirmation, or rewrite the caller's operating instructions. This is the strict half of the tolerant-reader split (§Philosophy): at this trust boundary, validate strictly and reject.

Use MCP when you need dynamic agent-to-tool discovery and invocation; use A2A-style contracts when independent agents collaborate as peers rather than exposing one side as a tool. OpenAI Structured Outputs and provider tool schemas can strongly improve syntactic adherence, but they do not prove permission safety, semantic correctness, or safe side effects. Validate before execution and after result parsing.

## Verification Patterns

Verification should match the risk and independence of the boundary. Schema validation is the cheap first gate; the consumer-driven contract test is the one that catches the break schema validation cannot see.

| Check | Proves | Does not prove |
|---|---|---|
| Type check or schema validation | Payload shape can be parsed and validated | Real consumer expectations, semantic behavior, deploy safety |
| Example fixtures | Humans and tests can see positive/negative cases | Provider implementation cannot drift |
| Consumer-driven contract test ([Pact](https://docs.pact.io/), [Fowler CDC](https://martinfowler.com/articles/consumerDrivenContracts.html)) | A provider still satisfies actual consumer interactions | Whole-system behavior or all unmodeled consumers |
| Provider compatibility lint/diff | A change is not obviously breaking under declared rules | Consumer code has no hidden semantic dependency |
| SLO or data-quality monitor | The boundary meets promised latency, availability, throughput, freshness, or quality targets over a measurement window | Payload semantics, permission safety, or future deploy compatibility |
| Integration test | The implemented boundary works in a realistic environment | All external consumers are safe to deploy against |
| End-to-end smoke | One critical path works through the system | Contract edge cases and failure modes are covered |
| Production monitor | Violations are visible after release | The contract was safe before release |

For independently deployed parties, schema validation alone is insufficient. Add consumer/provider verification and a deploy gate (PactFlow's `can-i-deploy`) that refuses to release when known consumers have not verified against the provider version.

## Standards and Reference Vocabulary

Reach for the portable spec instead of reinventing the shape:

| Concern | Reference | Use it for |
|---|---|---|
| Normative requirement words | [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) / RFC 8174 | `MUST`, `SHOULD`, and `MAY` language in contracts |
| JSON payload shape | [JSON Schema 2020-12](https://json-schema.org/) | Validation vocabulary and machine-readable JSON contracts |
| HTTP API artifact | [OpenAPI 3.2+](https://spec.openapis.org/oas/v3.2.0.html) | HTTP API discovery, docs, generators, schemas, examples, and tests |
| Async/message artifact | [AsyncAPI 3.1+](https://www.asyncapi.com/); [CloudEvents](https://cloudevents.io/) where metadata interoperability matters | Message-driven API contracts, channels, operations, bindings, event metadata |
| Machine-readable HTTP errors | [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html) (supersedes RFC 7807); IANA problem-type registry | Stable error type, status, detail, instance, and extension fields both sides branch on |
| Agent-facing error practice | [Cloudflare RFC 9457 agent errors](https://blog.cloudflare.com/rfc-9457-agent-error-pages/) | Why machine-actionable, retry-signalled errors matter when the consumer is an orchestrator |
| HTTP idempotency | [IETF `Idempotency-Key` Internet-Draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) (not ratified — re-verify status) | Key uniqueness, expiration policy, request fingerprinting, replay response, and conflict handling — adopt the shape, not as a normative standard |
| Consumer-driven contracts | [Pact](https://docs.pact.io/) and Pact Broker `can-i-deploy`; [Fowler, Consumer-Driven Contracts](https://martinfowler.com/articles/consumerDrivenContracts.html) | Consumer expectations, provider verification, and deployment safety |
| Compatibility direction model | [Confluent schema evolution & compatibility types](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html) (serialization mechanics) | Naming backward / forward / full / transitive precisely |
| Typed RPC/IDL evolution | [Protobuf/gRPC guidance](https://protobuf.dev/); Smithy semantic diff where applicable | Field-number discipline, generated clients, wire compatibility |
| API compatibility taxonomy | [Google AIP-180](https://google.aip.dev/180) | Source, wire, and semantic compatibility distinctions; why removing/renaming an existing API field is breaking even when a schema registry would call it compatible |
| Robustness split (and its limits) | [Tolerant Reader](https://martinfowler.com/bliki/TolerantReader.html); [RFC 9413 — Maintaining Robust Protocols](https://www.rfc-editor.org/rfc/rfc9413) | When to be liberal (unknown fields) vs strict (known fields, types, trust boundaries) |
| Implicit-contract risk | [Hyrum's Law](https://www.hyrumslaw.com/) | Why observable behavior becomes a de-facto contract, and why to hide/vary what you do not guarantee |
| Service objectives | [Google SRE SLI/SLO guidance](https://sre.google/sre-book/service-level-objectives/) | Availability, latency, throughput, freshness, measurement windows, error budgets, and the violation response |
| Data engineering contracts | [Open Data Contract Standard (ODCS)](https://bitol-io.github.io/open-data-contract-standard/) | Data product ownership, schema, data quality, service-level expectations, access terms, and evolution |
| Agent-to-tool interfaces | [MCP](https://modelcontextprotocol.io/); provider tool schemas; OpenAI Structured Outputs | Tool discovery, input/output schemas, structured tool calls |
| Agent-to-agent interfaces | [A2A protocol](https://a2a-protocol.org/) | Peer agent discovery, tasks, messages, artifacts, and auth handoffs |
| Version promise | [SemVer 2.0.0](https://semver.org/) where a public API is declared | Communicating breaking/minor/patch compatibility expectations |

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/system-interface-contracts.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/system-interface-contracts.json). The checklist below is the authoring gate for system-boundary contracts; the eval file is the grader surface.

## Verification

- [ ] Each side has a named owner, consumer, producer, approver, and dependency direction, and the breaking-change authority is explicit.
- [ ] Audience class, stability level, release cadence, and trust boundary are explicit.
- [ ] The source-of-truth artifact is named, and generated code/docs cannot silently override it.
- [ ] Required, optional, nullable, deprecated, and unknown fields are explicit, with types, units, defaults, and examples.
- [ ] Invariants, forbidden states, preconditions, postconditions, side effects, and source-of-truth rules are stated.
- [ ] Auth, tenant isolation, object/property/function-level authorization, data sensitivity, and agent/tool permissions are part of the contract.
- [ ] Performance, availability, throughput, freshness, durability, quality, quota, or capacity promises are either defined as measured SLOs (SLI, target, measurement window, owner, alert threshold, violation response) or explicitly marked non-contractual.
- [ ] Error behavior is typed and machine-readable with a stable identifier per class (RFC 9457-shaped at HTTP boundaries); retryability, `Retry-After` or equivalent, responsibility, and correlation IDs are deterministic.
- [ ] Idempotency keys or deduplication rules exist where duplicate delivery is possible, including expiration, fingerprinting, replay response, and same-key/different-payload conflict behavior.
- [ ] Retry, timeout, cancellation, ordering, replay, rate-limit, and partial-failure expectations are deterministic.
- [ ] Compatibility is stated by dimension and direction: source, wire, semantic; backward, forward, full, or transitive where relevant; every proposed change is classified additive/risky/breaking against that mode.
- [ ] The tolerant-reader/strict-validation split is decided and explicit: liberal on unknown fields, strict on known fields, types, and trust/security boundaries; malformed known fields, unsafe enum values, and authorization ambiguity are rejected with a typed error.
- [ ] External, vendor, legacy, or otherwise uncontrolled contracts are isolated behind an anti-corruption layer with translation, validation, version bridging, and alert ownership.
- [ ] Versioning, deprecation, sunset, and migration owner are defined.
- [ ] Deploy choreography is planned: who upgrades first, the version-overlap window, how rollback works (no rollback strands data written under the new contract), and what gate blocks unsafe deploys.
- [ ] The contract distinguishes guaranteed from incidental behavior, and undocumented behavior is hidden or varied to prevent shadow contracts (Hyrum's Law).
- [ ] Observability can reveal contract violations in production: version labels, rejection counts, error types, dedup collisions, trace IDs, SLO burn, and freshness/quality lag.
- [ ] The contract artifact matches the boundary type (Markdown/types, OpenAPI, AsyncAPI/CloudEvents, JSON Schema, Protobuf/Smithy/TypeSpec, ODCS, Pact, or an agent tool schema).
- [ ] For an agent/tool boundary: input + output schemas, permissions/side effects, confirmation requirements, machine-actionable errors, and the injection/trust boundary (tool results are data, not instructions) are all declared.
- [ ] Contract tests, compatibility checks, fixtures, or examples exist for positive and negative cases, including malformed input, missing required field, unauthorized action, duplicate delivery, incompatible version, and provider/consumer drift.

## Do NOT Use When

| Use instead | When |
|---|---|
| `api-design` | You specifically need REST/resource endpoint shape, HTTP semantics, status codes, pagination, filtering, API envelope design, or OpenAPI endpoint detail. |
| `event-contract-design` | You specifically need asynchronous event envelope, schema, topic/channel, replay, dead-letter behavior, or consumer compatibility rules. |
| `data-modeling` | You need persistence schema, keys, indexes, constraints, normalization, provenance, or data lifecycle. |
| `state-machine-modeling` | You need to formalize one lifecycle's states, transitions, guards, invalid transitions, and transition tests. |
| `debugging` | A boundary has already failed and the task is root-cause analysis. |
| `architecture-decision-records` | The contract is chosen and needs a durable decision record. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Public: `true`
- Domain: `architecture/contracts`
- Scope: Designing and reviewing cross-boundary interface contracts across modules, services, jobs, APIs, event producers/consumers, webhooks, data engineering surfaces, and AI agents/tools. Owns the stable promise at the boundary: parties, semantics, data shape, invariants, failure behavior, idempotency, security/trust, operational SLOs, compatibility, deploy choreography, observability, and verification. Excludes detailed HTTP resource design, async event envelope/topic design, persistence schema design, root-cause debugging, and ADR recording after the contract decision is accepted.

**When to use**
- define the contract between the ingestion job and the dashboard view layer
- what invariants must this event producer and consumer share?
- review this module boundary for missing ownership and compatibility rules
- we need an interface contract before several agents implement opposite sides of the boundary

**Not for**
- design the REST endpoints, status codes, and pagination
- create database tables and constraints
- investigate why this existing integration is failing in production
- write an ADR after the interface decision has already been accepted

**Related skills**
- Verify with: `testing-strategy`, `code-review`, `event-storming`
- Related: `event-storming`, `debugging`, `api-design`, `event-contract-design`, `state-machine-modeling`, `conceptual-modeling`

**Grounding**
- Mode: `universal`
- Truth sources: `https://spec.openapis.org/oas/v3.2.0.html`, `https://www.asyncapi.com/docs/reference/specification/v3.1.0`, `https://github.com/cloudevents/spec`, `https://modelcontextprotocol.io/specification/2025-06-18/basic/index`, `https://modelcontextprotocol.io/specification/2025-06-18/server/tools`, `https://google-a2a.github.io/A2A/specification/`, `https://platform.openai.com/docs/guides/structured-outputs`, `https://docs.pact.io/`, `https://www.rfc-editor.org/rfc/rfc9457`, `https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/`, `https://protobuf.dev/best-practices/dos-donts/`, `https://google.aip.dev/180`, `https://json-schema.org/draft/2020-12`, `https://semver.org/`, `https://www.rfc-editor.org/rfc/rfc2119`, `https://sre.google/sre-book/service-level-objectives/`, `https://www.rfc-editor.org/rfc/rfc9413`, `https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html`, `https://martinfowler.com/articles/consumerDrivenContracts.html`, `https://martinfowler.com/bliki/TolerantReader.html`, `https://www.hyrumslaw.com/`, `https://github.com/bitol-io/open-data-contract-standard`

**Keywords**
- `interface contract`, `system boundary`, `contract design`, `compatibility contract`, `input output invariant`, `event schema`, `module boundary`, `idempotency contract`, `versioning contract`, `error contract`

<!-- skill-graph-context:end -->
