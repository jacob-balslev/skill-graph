---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: contract-testing
description: "Use when reasoning about verifying the interface between two services or components by capturing the consumer's expectations as a contract artifact and verifying the provider satisfies the contract: the consumer-driven contracts pattern (Fowler 2006; Pact), the contrast with schema-only validation (OpenAPI/JSON Schema) which captures shape but not consumer behavioral expectations, the role of the contract broker as the integration point between consumer and provider deploy schedules, the two-phase verification (consumer-side: record interactions against a mock provider; provider-side: replay those interactions against the real provider), the difference between contract testing and integration testing (contract verifies the interface, integration verifies the implementation through the interface), and how contract testing replaces brittle cross-service e2e tests with focused interface verification. Do NOT use for in-system integration tests (use integration-test-design), full user-journey testing (use e2e-test-design), single-unit testing (use testing-strategy + test-doubles-design), or pure schema validation against OpenAPI (use API-spec validation tooling)."
version: 1.0.0
type: capability
category: quality
domain: quality/testing
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
  - contract testing
  - consumer-driven contracts
  - Pact
  - Spring Cloud Contract
  - Specmatic
  - contract broker
  - provider verification
  - consumer test
  - CDC
  - OpenAPI conformance
triggers:
  - "should this be a contract test or an integration test"
  - "Pact vs OpenAPI"
  - "how do we decouple deploys between services"
  - "the consumer broke when the provider changed"
  - "should we e2e test across services"
examples:
  - "design a consumer-driven contract test between a frontend and a backend service"
  - "decide whether to use Pact or schema-only validation for a new API"
  - "diagnose a contract test that passes consumer-side but fails provider-side — implementation drift"
  - "explain how the contract broker decouples deploy schedules between consumer and provider teams"
anti_examples:
  - "test internal seams of a system (use integration-test-design)"
  - "validate an HTTP response against an OpenAPI schema (use API-spec tooling)"
  - "test a complete user journey through the UI (use e2e-test-design)"
relations:
  related:
    - testing-strategy
    - integration-test-design
    - e2e-test-design
    - api-design
    - event-contract-design
    - system-interface-contracts
  boundary:
    - skill: integration-test-design
      reason: "integration-test-design owns tests that exercise the real implementation through an interface; this skill owns tests that verify the interface contract independently of the implementation behind it. Contract tests can replace cross-service e2e tests; they cannot replace integration tests that verify behavior through the interface."
    - skill: e2e-test-design
      reason: "e2e-test-design owns user-journey tests across the whole stack; this skill owns service-boundary contract verification. Cross-service e2e tests are often the wrong tool — they are slow and verify too much; contract tests verify the interface specifically."
    - skill: api-design
      reason: "api-design owns the design of the request/response surface; this skill owns the testing of whether the implementation meets that design's contract. The two compose: api-design produces the contract; contract testing verifies it."
    - skill: system-interface-contracts
      reason: "system-interface-contracts owns the design and documentation of contracts between systems, modules, and services; this skill owns the testing of those contracts. system-interface-contracts is the design discipline; this skill is the verification technique."
    - skill: event-contract-design
      reason: "event-contract-design owns the design of asynchronous event contracts; this skill applies to verifying message-bus contracts (Pact supports asynchronous message contracts). The two compose for event-driven systems."
  verify_with:
    - api-design
    - integration-test-design
concept:
  definition: "Contract testing is the technique of verifying that an interface between a consumer and a provider — typically two services across a network boundary — works as both sides expect, by capturing the consumer's expectations as a *contract* artifact and then running that contract against both sides independently. The contract is consumer-driven: it expresses the specific interactions the consumer actually performs (this HTTP request → this response shape and content), not the full surface of the provider's API. The consumer side verifies its code by replaying the contract against a generated mock provider; the provider side verifies its implementation by replaying the contract against the real provider. When both verifications pass independently, the two sides are known to be compatible without ever running them together. The technique decouples deploy schedules between consumer and provider teams and replaces brittle cross-service end-to-end tests with focused interface verification."
  mental_model: |
    Five primitives structure contract testing:

    1. **Consumer** — the service or component that *uses* the interface. It has specific expectations: the requests it sends, the responses it expects, the behavior it relies on. A frontend service that calls a backend search API is the consumer of that search API. A microservice that publishes events to a downstream service is the consumer of that downstream's event-handler interface.

    2. **Provider** — the service or component that *exposes* the interface. The backend search API; the event-handler service. The provider may have many consumers, each with their own expectations; the provider's job is to satisfy all of them simultaneously.

    3. **Contract** — the artifact that captures the consumer's expectations of the provider, expressed as a sequence of interactions (request → expected response, or published message → expected handler behavior). The contract is *consumer-driven* — it records what the consumer actually does, not the full surface of the provider's API. The contract is stored in a queryable form (typically JSON), versioned, and published to a place both sides can access.

    4. **Two-phase verification** — the technique works because the contract is verified twice, independently. Phase 1 (consumer side): the consumer's code runs against a mock provider generated from the contract; if the consumer's code works against the mock, the contract correctly represents what the consumer does. Phase 2 (provider side): the contract is replayed against the real provider; if the provider responds as the contract expects, the provider satisfies the contract. Both phases pass independently → consumer and provider are compatible.

    5. **The broker** — the central registry where contracts are published. The Pact Broker is the canonical implementation. The broker connects the two sides: the consumer's CI publishes a new contract version on every consumer change; the provider's CI fetches the latest contracts and verifies against them. The broker also tracks compatibility (which consumer versions work with which provider versions) and can gate deploys (don't deploy the provider until its current version is verified against the production consumer's contract).

    The deep insight is that **contract testing decouples deploy schedules**. Before contract testing, two services that depended on each other had to be tested together — usually with cross-service end-to-end tests in a shared staging environment, which is slow, flaky, and serializes deploys. With contract testing, each side is verified independently against the shared contract; deploys can happen independently as long as the contract is satisfied. This is the property that makes contract testing valuable at scale: a microservices architecture without contract testing has either a giant slow e2e suite or accepted compatibility risk; with contract testing, neither.

    The complementary insight is that **the contract is what the consumer actually does, not what the provider offers**. A provider's API might support fifty endpoints and a hundred fields; the consumer might use three endpoints and twelve fields. The contract captures the three endpoints and twelve fields — what the consumer relies on. The provider can change the other forty-seven endpoints without breaking the consumer; it cannot change the twelve fields the consumer uses. This narrowing is what makes contract testing focused and what distinguishes it from full schema validation.
  purpose: |
    Contract testing exists because the alternatives — cross-service integration testing, schema-only validation, and "we'll catch it in staging" — each have failure modes that contract testing addresses.

    **Cross-service integration testing is expensive and serializing.** A test that requires both consumer and provider running in a shared environment must be set up, kept in sync, and run in a way that orders the deploys (you can't deploy the provider while a test is using it). In a microservices architecture with dozens of services, this becomes "all deploys must coordinate" — exactly the property that microservices were supposed to avoid. Contract testing replaces the cross-service test with two independent verifications, eliminating the coordination.

    **Schema-only validation is necessary but not sufficient.** OpenAPI, GraphQL schema, JSON Schema all let the provider publish its surface and let the consumer validate responses against the schema. They do not capture: which fields the consumer actually uses; whether the consumer relies on specific response values (not just types); whether the consumer expects a particular error shape; whether the consumer relies on specific behavioral semantics. A provider can change a field's value space in a way that breaks consumers without breaking the schema. Contract testing captures the behavioral expectations the schema cannot.

    **"We'll catch it in staging" is too late.** A breaking change discovered in shared staging has already been merged, has already passed CI on the provider's side, and now blocks both consumer and provider deploys until resolved. Contract testing catches the break at PR time, on the side that introduced it, with specific evidence of which consumer is affected.

    **The broker provides deploy-readiness signals.** A mature contract-testing setup with a broker (Pact Broker, PactFlow) tracks which consumer versions are compatible with which provider versions. The provider's deploy can be gated on "this version is verified against the production consumer's current contract," which means breaking changes can't reach production. The broker also tracks coverage — which consumer interactions are not yet verified — and surfaces drift between consumer and provider over time.

    There is a fifth purpose: contract testing makes the *interface a first-class artifact*. The consumer's expectations are captured explicitly, versioned, published, and verified. A new team member or a new consumer can read the contracts to understand what the provider's API is actually used for, not just what it offers. The contract is a queryable, executable specification of the integration.

    The cost of contract testing is real. There is tooling to set up (Pact mock servers, broker, CI integration). There is discipline to maintain (consumers must update their contracts when they change behavior; providers must verify against current consumer contracts; the broker must be kept healthy). There is the schema-evolution problem (consumer can require fields the provider deprecates; the broker surfaces this but the team must act). Modern tooling (PactFlow, Pact Broker, Spring Cloud Contract) makes the cost manageable but it is not zero.

    The deeper purpose is to make consumer expectations *exist as code* on the provider's CI pipeline. Without contract testing, the provider team has no automated way to know whether their change broke a consumer; they discover it after deploy. With contract testing, every consumer's expectations are a green/red check on every provider PR. The information flow that this enables — "the provider knows what consumers expect" — is what makes contract testing strategic, not just tactical.
  boundary: |
    **Contract testing is not the same as schema validation.** OpenAPI conformance tests, JSON-Schema validation, and GraphQL schema validation verify that responses match a declared schema. Contract testing verifies that the *specific interactions the consumer actually performs* work as the consumer expects. The schema captures the surface; the contract captures the behavior. A provider can pass schema validation and break a consumer (by changing values, error semantics, or behavioral expectations the schema doesn't cover); a contract test would catch this.

    **Contract testing is not integration testing.** Integration tests exercise both sides running together with real dependencies; contract tests verify each side independently against the contract. The cost difference is large: integration tests run in seconds-to-minutes per scenario; contract tests run in milliseconds-to-seconds. Integration tests verify implementation; contract tests verify interface.

    **Contract testing is not end-to-end testing.** E2e tests exercise the user-visible journey through the whole stack; contract tests verify service boundaries. They serve different purposes — e2e for user-perceived behavior, contracts for service-to-service interface stability — and replace each other only at the cross-service-boundary scope.

    **A contract is not a documentation artifact.** It is an executable specification of consumer expectations. Documentation describes what the provider offers; the contract verifies what the consumer relies on. The two compose (a good contract test suite is also good documentation of how the API is used), but they are different artifacts with different lifecycles.

    **Consumer-driven contracts are not the same as provider-driven contracts.** Consumer-driven (the dominant pattern, championed by Pact) means the consumer writes the contract based on its own usage. Provider-driven means the provider writes a contract for what it provides; consumers conform to it. Consumer-driven is empirically more useful because it captures what consumers actually use, not what providers think consumers might want — and because the consumer-driven shape makes deprecation safer (a provider can deprecate a field once no consumer's contract requires it).

    **Contract testing does not eliminate the need for integration tests within a service.** A service still needs to verify that its own code works with its own database, message bus, and other dependencies. Contract testing covers the *boundary* with other services; integration testing covers the *interior* of one service. Both are necessary.

    **Bi-directional contract testing is a different beast.** Some tools (Specmatic, PactFlow's bi-directional mode) verify a provider's spec (OpenAPI) against a consumer's contract without running tests on both sides. The mechanism is comparing the schema-described surface to the consumer's expected interactions; if every interaction is covered by the schema, the spec satisfies the contract. This is convenient when running provider tests is impractical but is a weaker signal than full consumer-driven verification (the schema's described behavior may differ from the implementation's actual behavior).

    **A passing contract test does not mean the system works.** It means the interface is compatible. Bugs inside either service that the contract doesn't reach are invisible. Integration tests for in-service behavior, unit tests for implementation logic, and e2e tests for user journeys are all still necessary. Contract testing replaces cross-service e2e specifically.

    **Contract testing requires consumer-team participation.** Provider-only setups don't work — the provider would write the contracts from its imagined consumer behavior, which is not consumer-driven. Real consumer-driven contracts come from consumer teams running their own consumer-side tests against generated mocks; provider teams cannot impose this without consumer team adoption.
  taxonomy: |
    By contract direction:
    - **Consumer-driven** — consumer writes the contract; provider verifies against it. The dominant pattern (Pact). Catches breaks at provider-PR time.
    - **Provider-driven** — provider writes the contract; consumers conform to it. Less common; useful when consumers are many and providers want to dictate the surface.
    - **Bi-directional** — provider spec (OpenAPI) compared against consumer contract without running provider tests. Convenient when provider can't run tests; weaker signal.

    By transport:
    - **HTTP (REST)** — most common; Pact, Spring Cloud Contract, Specmatic, others.
    - **GraphQL** — special tooling (Pact supports GraphQL queries as HTTP interactions; some GraphQL-specific tools exist).
    - **Message bus (async)** — Pact supports message contracts; the contract is "consumer expects this message shape," verified by the provider producing a message that matches.
    - **gRPC** — emerging tooling; protobuf schemas plus contract-style verification.
    - **Event-driven** — overlaps with event-contract-design; the contract is the event schema plus consumer's expected handling.

    By tool:
    - **Pact** (and Pact Broker / PactFlow) — the canonical consumer-driven contract testing tool; multi-language clients; well-integrated broker ecosystem.
    - **Spring Cloud Contract** — JVM-focused; works with REST and messaging.
    - **Specmatic** — bi-directional contract testing against OpenAPI specs.
    - **Hoverfly** — service virtualization with some contract-test patterns.
    - **WireMock** — record-and-replay HTTP service mocking; can be used for contract-test-style fixtures.

    By storage:
    - **Broker** — central registry (Pact Broker, PactFlow). Standard for production setups.
    - **File in repo** — consumer commits the contract file in the provider's repo (or vice versa). Simple; doesn't scale to many consumers; couples deploy artifacts.
    - **Schema registry** — for event-driven systems, the schema registry (Confluent, Pulsar) plays a broker-like role.

    By verification cadence:
    - **On consumer PR** — consumer tests generate the contract and publish to broker.
    - **On provider PR** — provider fetches latest contracts and verifies. Standard.
    - **On schedule (cron)** — periodic verification catches contract drift even when neither side changes.
    - **Deploy-gating** — broker gates deploys based on compatibility matrix; production provider version must be verified against production consumer contracts.

    By relationship to deploy independence:
    - **Without contract testing** — coordinated deploys, slow integration tests in staging, brittle cross-service e2e.
    - **With contract testing but no deploy gating** — independent deploys possible; broken contracts may still reach production if humans deploy without checking.
    - **With contract testing and deploy gating** — broker prevents incompatible deploys; broken contracts cannot reach production.
  analogy: |
    Tax-form templates between two government agencies. Agency A (the consumer) processes tax returns; Agency B (the provider) issues identification documents A relies on. A's tax processor needs B to send identification records in a specific format: which fields, what types, what valid values, what the error response looks like for a missing record.

    A schema-only approach is Agency B publishing "Here is form 2848: it has these 12 fields, of these types." Agency A reads the schema and tries to use it. If B later changes a field's valid value range (a state code that A uses is now retired), the schema still matches but A's processor breaks.

    A consumer-driven contract is Agency A saying to Agency B: "Here are the specific records I will request and the specific fields I will read. When I ask for record #12345 with name='Jane Smith', I expect a response with `taxpayerId` matching format X, `birthDate` in ISO 8601, and `state` from the set {valid US state codes}. If the record doesn't exist, I expect HTTP 404 with `{ error: 'not found', code: 'TX_NOT_FOUND' }`."

    This contract is filed with the central records office (the broker). Every time A's processor is updated, A re-runs its tests against a mock B and republishes the contract. Every time B's system is updated, B fetches all consumer contracts from the records office and verifies — does my system still produce the responses A expects? If yes, B's deploy is safe for A; if no, B's deploy is blocked until A is updated or the contract is renegotiated.

    The deep value is that neither agency has to coordinate its release schedule with the other. A can deploy whenever its tests pass against the mock; B can deploy whenever its system satisfies all current consumer contracts. The records office tracks compatibility — A version 5 works with B version 8; B version 9 broke A's contract, so don't deploy it.

    Schema validation is the form definition. Contract testing is the *interaction* — which records A asks for, what A reads from each, what A relies on. The form's existence doesn't tell B which fields A actually uses; the contract does. A field nobody uses can be removed from form 2848 without affecting any consumer; a field every consumer relies on cannot.

    Integration testing is A and B running together in a shared building, processing real returns. Slow, requires both available, both in the right state. Contract testing replaces this with each agency running its own tests against the central contract, in their own buildings, on their own schedules.
  misconception: |
    The most common misconception is that **contract testing is the same as OpenAPI conformance testing**. It is not. OpenAPI conformance tests verify that responses match a schema; contract tests verify that specific consumer interactions work as the consumer expects. A provider can pass OpenAPI conformance and break a consumer (by changing field semantics, error shapes, or value spaces the schema doesn't constrain). The two compose — OpenAPI for surface description, contracts for behavioral expectation — but they are not interchangeable.

    The second misconception is that **contract testing replaces integration testing**. It does not. Integration tests verify behavior *through* the interface (the provider's code works with its database and dependencies via the interface); contract tests verify the interface itself. Both are necessary — contract tests for the boundary, integration tests for the interior. A team that has only contract tests has verified interface compatibility and not implementation correctness.

    The third misconception is that **contract testing requires a broker**. It does not technically — contracts can be committed as files in the provider's repo. In practice, without a broker, contract testing doesn't scale beyond a handful of consumers per provider and doesn't enable deploy gating. The broker is the integration point that makes the technique strategic at scale; without it, the technique reduces to "contracts as committed test fixtures" which has much of the maintenance cost without the deploy-independence benefit.

    The fourth misconception is that **provider-driven contracts are equivalent to consumer-driven**. They are not. Provider-driven contracts capture what the provider thinks consumers want; consumer-driven contracts capture what consumers actually rely on. Consumer-driven is empirically more useful: it catches breaks the provider didn't know would matter, it makes deprecation safer, and it shifts the "what is this API for" question from the provider's imagination to the consumers' actual usage.

    The fifth misconception is that **bi-directional contract testing is as strong as consumer-driven**. It is not. Bi-directional compares the provider's OpenAPI spec against the consumer's contract by schema analysis; if every consumer interaction is covered by the schema, the spec is considered to satisfy the contract. The signal is weaker because the schema's *described* behavior may differ from the implementation's *actual* behavior. Full consumer-driven verification runs against the actual provider; bi-directional runs against the spec.

    The sixth misconception is that **contract tests prove the system works end-to-end**. They do not. They prove the interface is compatible. Bugs in either service that the contract doesn't reach (in-service logic, database issues, third-party-integration bugs) are invisible to contract tests. End-to-end tests for user journeys, integration tests for in-service behavior, and unit tests for implementation logic are all still necessary.

    The seventh misconception is that **contract testing eliminates cross-service e2e tests**. It can eliminate *most* — the brittle "verify the journey across all services" e2e tests that require running everything together. It does not eliminate the *strategic* cross-service e2e tests that exercise the most-critical journeys against production-like data. A team that has comprehensive contract tests still benefits from a small number of cross-service e2e tests for the journeys that absolutely must work.

    The eighth misconception is that **the contract should be generated from the provider's API spec**. Generating contracts from the provider's spec produces provider-driven contracts (the provider's imagined consumer behavior), which loses the consumer-driven property. Real contracts come from consumer-side tests that exercise actual consumer code. Tooling that auto-generates contracts from OpenAPI is at most a starting point; without consumer-side verification, the contracts don't reflect real usage.

    The ninth misconception is that **contract testing is only for HTTP APIs**. It applies to any consumer-provider boundary: HTTP, gRPC, GraphQL, message bus, event streams, even shared files. Pact supports asynchronous message contracts; specialized tools exist for gRPC, GraphQL, and event-driven systems. The defining property is the consumer-provider boundary, not the transport.
---

# Contract Testing

## Coverage

The technique of verifying interfaces between consumer and provider components by capturing the consumer's expectations as a contract artifact and running that contract against both sides independently. Covers the consumer-driven contracts pattern (Fowler 2006; Pact ecosystem), the two-phase verification (consumer-side mock generation; provider-side replay), the broker as the integration point that enables deploy independence and compatibility tracking, the contrast with schema-only validation (OpenAPI captures surface; contracts capture behavior), the contrast with integration and e2e testing (contracts verify the interface; integration and e2e verify implementation and journeys), and the tool ecosystem (Pact, Spring Cloud Contract, Specmatic, bi-directional patterns).

## Philosophy

Contract testing decouples deploy schedules between services. Before contract testing, two services that depended on each other had to be tested together — usually with brittle cross-service e2e tests in a shared staging environment, which serialized deploys and produced flaky signal. With contract testing, each side is verified independently against a shared contract; deploys can happen on independent schedules as long as the contract is satisfied.

The contract is *consumer-driven*: it captures what the consumer actually does, not what the provider offers. This narrowing — three endpoints out of fifty, twelve fields out of a hundred — is what makes contract testing focused and what distinguishes it from full schema validation. The provider can change anything the consumers don't rely on; the provider cannot break anything any consumer's contract requires.

The discipline is in the broker. A contract-test setup without a broker is "contracts as committed fixtures" — much of the maintenance cost, little of the deploy-independence benefit. A contract-test setup with a broker (Pact Broker, PactFlow) provides versioned contract storage, compatibility tracking, and deploy-gating; the strategic value of the technique is realized at this layer.

## The Two-Phase Verification

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   Consumer's CI         │         │   Provider's CI         │
│                         │         │                         │
│ 1. Run consumer tests   │         │ 4. Fetch contracts      │
│    against generated    │         │    from broker          │
│    mock provider        │         │                         │
│                         │         │ 5. Replay each contract │
│ 2. If pass: contract    │         │    against real         │
│    is correct           │         │    provider             │
│                         │         │                         │
│ 3. Publish contract     │         │ 6. If pass: provider    │
│    to broker            │ ──────▶ │    satisfies contract   │
│                         │         │                         │
│                         │ ◀────── │ 7. Mark contract version│
│                         │  broker │    as verified          │
└─────────────────────────┘         └─────────────────────────┘
```

When both sides have passed independently, the broker records the compatibility. Deploy gating uses this record: don't deploy the provider unless its current version is marked compatible with the production consumer's contract.

## Schema vs Contract — A Practical Comparison

| Property | OpenAPI / JSON Schema | Consumer-driven contract |
|---|---|---|
| Captures | Surface (endpoints, types, shapes) | Behavior (specific interactions the consumer performs) |
| Driven by | Provider | Consumer |
| Coverage | Everything the provider offers | Only what consumers use |
| Catches breaking field value change | If schema constrains values; usually not | Yes — the contract has specific values |
| Catches semantic / error-shape change | No | Yes if consumer relies on the error |
| Verifies through real implementation | No (validates response against schema only) | Yes (provider runs the contract against itself) |
| Used for | API description, code generation, validation | Test gate between consumer and provider |
| Should you have both? | Yes | Yes |

## When Contract Testing Replaces What

| Pre-contract-testing approach | Contract-testing replacement | When replacement is right |
|---|---|---|
| Cross-service e2e test for service boundary | Contract test | Almost always — cheaper, more reliable, doesn't require both services running |
| Schema validation alone | Contract test + schema | Always — schema is necessary but not sufficient |
| Coordinated deploy schedules | Independent deploys + broker gating | Almost always — the deploy-independence is the strategic value |
| Manual API change reviews | Contract verification on provider CI | Always — the verification is automated |
| "We'll catch it in staging" | Contract test on PR | Always — catching at PR time is much cheaper |

## Broker-Enabled Deploy Gating

| State | Can deploy? |
|---|---|
| Provider version has been verified against current production consumer contract | Yes |
| Provider version has not yet been verified against current production consumer contract | No — run verification first |
| Provider version fails verification against production consumer contract | No — fix or coordinate with consumer |
| Consumer version's contract has not been verified against current production provider | No — run provider verification |

The broker's compatibility matrix is the deploy gate. Modern setups (PactFlow, Pact Broker `can-i-deploy` API) automate this; the deploy pipeline calls the broker and gets a yes/no answer.

## Verification

After applying this skill, verify:
- [ ] Contracts are *consumer-driven* — written from consumer-side tests against real consumer code, not generated from provider specs.
- [ ] Contracts and OpenAPI/JSON-Schema coexist; the schema describes surface, the contract verifies behavior. Neither replaces the other.
- [ ] Both phases of verification run automatically: consumer-side on every consumer PR, provider-side on every provider PR (plus scheduled cron for drift detection).
- [ ] A broker is in use for any setup with more than 1-2 consumers per provider. The broker provides compatibility tracking and deploy gating.
- [ ] Deploy gating is wired: provider deploys are blocked if the version isn't verified against the production consumer's contract.
- [ ] Contract testing is *complementing* integration testing, not replacing it. The team still has integration tests for in-service behavior.
- [ ] Cross-service e2e tests have been reduced to the most-critical journeys; most cross-service e2e has migrated to contract tests.
- [ ] Message-bus and event-driven boundaries use contract testing where the consumer-provider pattern applies (Pact supports async message contracts).
- [ ] Contract evolution is handled: deprecating a field requires checking that no consumer's contract requires it; introducing a new field doesn't break existing contracts.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Testing the implementation behind a service interface | `integration-test-design` | integration tests verify in-service behavior; contracts verify the interface |
| Testing a user journey across the whole stack including UI | `e2e-test-design` | e2e tests verify the user experience; contracts verify the service boundary |
| Validating responses against an OpenAPI schema | OpenAPI/JSON-Schema validation tooling | schema validation captures surface; this skill captures behavior |
| Testing a single unit in isolation | `testing-strategy` + `test-doubles-design` | unit scope is below this skill's level |
| Designing the API surface itself | `api-design` | api-design owns the contract design; this skill owns the verification |
| Designing the event surface | `event-contract-design` | event-contract-design owns the asynchronous contract design; this skill verifies it |
| Choosing the test-level ratio | `testing-strategy` | strategy owns ratios; this skill owns the contract-testing technique |

## Key Sources

- Fowler, M. (2006). ["Consumer-Driven Contracts: A Service Evolution Pattern"](https://martinfowler.com/articles/consumerDrivenContracts.html). The foundational essay defining consumer-driven contracts as a pattern for service evolution.
- Pact Foundation. ["Pact — Documentation"](https://docs.pact.io). The canonical reference for the most-adopted consumer-driven contract testing tool; multi-language clients; broker ecosystem.
- PactFlow. ["The Pact Broker"](https://docs.pactflow.io/docs/pact-broker/). Reference for the contract broker pattern, compatibility tracking, and deploy gating.
- Robinson, I. (2006). ["Consumer-Driven Contracts: Three Levels of Confidence"](https://www.ianrobinson.net/). Practitioner essay on the levels of compatibility consumer-driven contracts provide.
- Specmatic. ["Specmatic — Bi-directional Contract Testing"](https://specmatic.io/). Reference for the alternative bi-directional approach that compares OpenAPI specs against consumer contracts.
- Spring Cloud. ["Spring Cloud Contract — Reference Documentation"](https://docs.spring.io/spring-cloud-contract/docs/). The JVM-ecosystem contract testing tool; works with REST and messaging.
- Newman, S. (2015, 2nd ed. 2021). *Building Microservices*. O'Reilly. Chapter on testing strategies for microservices, with contract testing as the recommended cross-service approach.
- Richardson, C. (2018). *Microservices Patterns*. Manning. Pattern chapters covering contract testing as part of microservices integration patterns.
- Cervera, A., et al. (2015). ["Consumer-driven Contracts for Microservices: A Survey"](https://www.researchgate.net/publication/277024057). Academic survey of CDC patterns and tool support.
