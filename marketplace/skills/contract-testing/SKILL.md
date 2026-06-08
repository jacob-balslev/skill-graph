---
name: contract-testing
description: "Use when verifying the interface between two services or components by capturing the consumer's expectations as a contract artifact and verifying the provider satisfies it. Covers the consumer-driven contracts pattern (Fowler 2006; Pact), the contrast with schema-only validation (OpenAPI/JSON Schema captures shape, not behavioral expectations), the broker as the integration point between consumer and provider deploy schedules, two-phase verification (consumer-side mocks; provider-side replay), the difference between contract testing (verifies the interface) and integration testing (verifies the implementation through it), and how contract tests replace brittle cross-service e2e. Do NOT use for in-system integration (use `integration-test-design`), full user-journey testing (use `e2e-test-design`), single-unit testing (use `testing-strategy` + `test-doubles-design`), or pure OpenAPI schema validation (API-spec tooling). Do NOT use for test internal seams of a system (use integration-test-design)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: quality-assurance
  taxonomy_domain: quality/testing
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"contract testing\",\"consumer-driven contracts\",\"Pact\",\"Spring Cloud Contract\",\"Specmatic\",\"contract broker\",\"provider verification\",\"consumer test\",\"CDC\",\"OpenAPI conformance\"]"
  triggers: "[\"should this be a contract test or an integration test\",\"Pact vs OpenAPI\",\"how do we decouple deploys between services\",\"the consumer broke when the provider changed\",\"should we e2e test across services\"]"
  examples: "[\"design a consumer-driven contract test between a frontend and a backend service\",\"decide whether to use Pact or schema-only validation for a new API\",\"diagnose a contract test that passes consumer-side but fails provider-side — implementation drift\",\"explain how the contract broker decouples deploy schedules between consumer and provider teams\"]"
  anti_examples: "[\"test internal seams of a system (use integration-test-design)\",\"validate an HTTP response against an OpenAPI schema (use API-spec tooling)\",\"test a complete user journey through the UI (use e2e-test-design)\"]"
  relations: "{\"related\":[\"testing-strategy\",\"integration-test-design\",\"e2e-test-design\",\"api-design\",\"event-contract-design\",\"system-interface-contracts\"],\"boundary\":[{\"skill\":\"integration-test-design\",\"reason\":\"integration-test-design owns tests that exercise the real implementation through an interface; this skill owns tests that verify the interface contract independently of the implementation behind it. Contract tests can replace cross-service e2e tests; they cannot replace integration tests that verify behavior through the interface.\"},{\"skill\":\"e2e-test-design\",\"reason\":\"e2e-test-design owns user-journey tests across the whole stack; this skill owns service-boundary contract verification. Cross-service e2e tests are often the wrong tool — they are slow and verify too much; contract tests verify the interface specifically.\"}],\"verify_with\":[\"api-design\",\"integration-test-design\"]}"
  mental_model: "|"
  purpose: "|"
  analogy: "A contract test is to a service interface what a lease is to a tenancy — the consumer writes down the specific obligations they depend on (utilities included, quiet hours, this exact rent), the landlord (provider) verifies independently that they can honor those obligations, and the lease in the broker's filing cabinet lets either party prove compatibility without re-negotiating from scratch each time one of them moves."
  misconception: "|"
  concept: "{\"definition\":\"Contract testing is the technique of verifying that an interface between a consumer and a provider — typically two services across a network boundary — works as both sides expect, by capturing the consumer's expectations as a *contract* artifact and then running that contract against both sides independently. The contract is consumer-driven: it expresses the specific interactions the consumer actually performs (this HTTP request → this response shape and content), not the full surface of the provider's API. The consumer side verifies its code by replaying the contract against a generated mock provider; the provider side verifies its implementation by replaying the contract against the real provider. When both verifications pass independently, the two sides are known to be compatible without ever running them together. The technique decouples deploy schedules between consumer and provider teams and replaces brittle cross-service end-to-end tests with focused interface verification.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  public: "true"
  concept_boundary: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/contract-testing/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Domain: `quality/testing`

**When to use**
- design a consumer-driven contract test between a frontend and a backend service
- decide whether to use Pact or schema-only validation for a new API
- diagnose a contract test that passes consumer-side but fails provider-side — implementation drift
- explain how the contract broker decouples deploy schedules between consumer and provider teams
- Triggers: `should this be a contract test or an integration test`, `Pact vs OpenAPI`, `how do we decouple deploys between services`, `the consumer broke when the provider changed`, `should we e2e test across services`

**Not for**
- test internal seams of a system (use integration-test-design)
- validate an HTTP response against an OpenAPI schema (use API-spec tooling)
- test a complete user journey through the UI (use e2e-test-design)
- Owned by `integration-test-design`: tests
- Owned by `e2e-test-design`: user-journey tests across the whole stack

**Related skills**
- Verify with: `api-design`, `integration-test-design`
- Related: `testing-strategy`, `integration-test-design`, `e2e-test-design`, `api-design`, `event-contract-design`, `system-interface-contracts`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: A contract test is to a service interface what a lease is to a tenancy — the consumer writes down the specific obligations they depend on (utilities included, quiet hours, this exact rent), the landlord (provider) verifies independently that they can honor those obligations, and the lease in the broker's filing cabinet lets either party prove compatibility without re-negotiating from scratch each time one of them moves.
- Common misconception: |

**Keywords**
- `contract testing`, `consumer-driven contracts`, `Pact`, `Spring Cloud Contract`, `Specmatic`, `contract broker`, `provider verification`, `consumer test`, `CDC`, `OpenAPI conformance`

<!-- skill-graph-context:end -->
