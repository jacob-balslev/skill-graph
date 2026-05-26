---
name: integration-test-design
description: "Use when designing tests that verify the interaction between two or more units of a system — modules, services, layers, processes: the scope-and-boundary primitives that distinguish integration from unit and e2e tests, the test-pyramid (Cohn 2009) and test-trophy (Dodds) frameworks for how much integration testing belongs in the suite, the real-vs-faked-collaborator decision per dependency, the test-data lifecycle (per-test setup, transaction rollback, container reset), the difference between sociable-unit tests, integration tests, and contract tests, and the failure modes (over-broad scope that mimics e2e, over-narrow scope that mimics unit, shared mutable state that produces flakes). Do NOT use for testing one unit in isolation (use testing-strategy + test-doubles-design), full user-journey testing (use e2e-test-design), consumer-driven contract verification (use contract-testing), or test-suite quality measurement (use mutation-testing)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: do
  category: quality
  subject: quality-assurance
  domain: quality/testing
  scope: workspace
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"integration test\",\"integration testing\",\"test pyramid\",\"test trophy\",\"sociable test\",\"test data setup\",\"test transaction rollback\",\"test containers\",\"testcontainers\",\"boundary test\"]"
  triggers: "[\"should this be a unit or integration test\",\"the integration test is flaky\",\"test pyramid vs test trophy\",\"real database in tests\",\"test data setup is taking over\"]"
  examples: "[\"design an integration test for the order service that exercises real database and real message bus\",\"decide which dependencies to fake and which to use real in an integration test\",\"diagnose a flaky integration test — likely shared mutable state across tests\",\"explain why the test pyramid and test trophy disagree on integration test count\"]"
  anti_examples: "[\"test a single function in isolation (use testing-strategy + test-doubles-design)\",\"test a full user journey through the UI (use e2e-test-design)\",\"verify a consumer-driven contract against a provider (use contract-testing)\"]"
  relations: "{\"related\":[\"testing-strategy\",\"test-doubles-design\",\"test-driven-development\",\"e2e-test-design\",\"contract-testing\"],\"boundary\":[{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy owns the strategic question of how much of each test level to invest in; this skill owns the design of integration-level tests specifically.\"},{\"skill\":\"test-doubles-design\",\"reason\":\"test-doubles-design owns the construction of mocks/stubs/fakes; this skill owns the per-dependency real-vs-faked decision in integration scope. Integration tests use real collaborators where practical and fakes only at true external boundaries.\"},{\"skill\":\"e2e-test-design\",\"reason\":\"e2e-test-design owns user-journey-scope tests that exercise the full stack including UI; this skill owns scope below that — interaction of units inside the system, often without UI.\"},{\"skill\":\"contract-testing\",\"reason\":\"contract-testing owns consumer-driven contract verification between services; this skill owns the in-system interaction of modules. Contract tests verify the *interface*; integration tests verify the *implementation through* the interface.\"}],\"verify_with\":[\"testing-strategy\",\"e2e-test-design\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "An integration test is to a software system what a fire-suppression drill in a specific corridor is to the whole building's safety plan — you are not testing whether each sprinkler head works in isolation (unit), nor whether everyone evacuates the entire building in fifteen minutes (e2e), you are testing whether the smoke detector in *this corridor* triggers the alarm panel which triggers the sprinkler which actually wets *that carpet*; the test's identity is the named boundary, and changing the named boundary changes the test's identity."
  misconception: "|"
  concept: "{\"definition\":\"Integration test design is the discipline of designing tests that verify the interaction of two or more units of a system — modules within a process, services across processes, layers within an architecture — to catch defects that emerge only at the boundaries between those units. The unit of judgment is the *boundary*: whether type-mapped, serialized, transactional, contract-bound, or simply called across a function boundary, the integration test's value is exercising the *real* interaction between the parts rather than the *mocked* interaction a unit test would exercise. The scope choice — which units are real, which are faked, which are out of scope — is the central design decision and the source of most fragile integration test suites: too narrow and the test is a unit test in disguise; too broad and the test is an end-to-end test in disguise; in between, the test is what its name says.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/integration-test-design/SKILL.md
---

# Integration-Test Design

## Coverage

The discipline of designing tests that verify the interaction between two or more units of a system — modules within a process, services across processes, layers within an architecture, services across organizational boundaries — to catch defects that emerge only at the boundaries. Covers the five primitives (boundary, scope, real-vs-faked-collaborator, test-data lifecycle, pyramid-or-trophy framing), the boundary-type taxonomy (module-to-module, layer-to-layer, service-to-database, service-to-message-bus, service-to-third-party, service-to-service), the test-data lifecycle patterns (full reset, transaction rollback, container reset, shared snapshot), and the pyramid (Cohn 2009) vs trophy (Dodds 2018) framings for how much integration testing the suite should contain. Includes Testcontainers and similar infrastructure as the modern enabler that makes integration testing cheap enough to do well.

## Philosophy

Integration tests verify the parts of a system that no individual unit can verify alone. The bugs they catch — type misalignment, serialization edge cases, transaction boundary errors, configuration mismatches, contract drift, ordering and concurrency issues — live at the boundaries between units. A test suite of comprehensive unit tests and zero integration tests has verified each unit and not the system; the seams are unverified.

The discipline's central design decision is *scope*: for each test, which collaborators are real (exercised in their integration-bug-finding form) and which are faked (replaced because their realness adds cost without proportional defect-detection). The scope determines the test's identity. Too narrow (mocks at the boundary): the "integration test" is a unit test in disguise and misses the integration bugs. Too broad (real everything, including UI): the "integration test" is an e2e test in disguise and pays the e2e cost.

Modern testing infrastructure — Testcontainers for containerized real dependencies, transaction rollback for fast isolation, parallel execution within and across CI jobs, recorded fakes for third parties — has shifted the cost of integration testing down enough that the test trophy framing (integration-heavy suite) has gained ground on the pyramid (unit-heavy suite). The right ratio for a given codebase depends on which suite costs are real and which are surmountable with infrastructure.

## The Pyramid vs The Trophy

| Framing | Suite shape | Year | Cost assumption | Best fit |
|---|---|---|---|---|
| Test Pyramid (Cohn) | Many unit / fewer integration / fewest e2e | 2009 | Integration tests expensive, slow, flaky | Codebases where integration infra is missing or costly |
| Test Trophy (Dodds) | Many integration / fewer unit / fewer e2e / static-analysis stem | 2018 | Integration tests cheap with modern tooling; unit tests pin implementation details | Codebases with strong integration-test infrastructure |
| Diamond | Many integration / few unit / few e2e | — | Same as trophy minus the static-analysis stem | Codebases where unit tests have lost most value vs the maintenance cost |

Both pyramid and trophy agree on: unit tests for fast feedback on implementation logic, integration tests for boundary verification, e2e tests sparingly for full-stack confidence. The disagreement is about the ratio between unit and integration, which depends on what each costs in a given codebase.

## Scope Choice — The Defining Decision

For each test, name the scope explicitly. For each dependency in scope, decide real or faked.

| Dependency | Real cost | Faked cost | Typical choice |
|---|---|---|---|
| In-process other modules | Free | Loses integration coverage | Real always |
| Database | Containerized: low (Testcontainers reuse) | In-memory variant: low; loses some real-DB bugs | Real (containerized or in-memory variant) |
| Message bus | Containerized: low | In-memory variant: loses delivery semantics | Real (containerized) for production-confidence tests |
| Cache (Redis) | Containerized: low | In-memory fake: loses eviction/TTL bugs | Real (containerized) |
| Third-party API (paid) | Per-call cost; rate limit | Recorded fake: free, may drift | Recorded fake for PR tests; real sandbox for nightly |
| Third-party API (free, stable) | Network latency; availability | Recorded fake: free | Real for nightly; recorded for PR |
| Email / SMS providers | Sends real messages — usually wrong | Capture fake: verifies the call was made | Capture fake; never real in tests |
| Authentication / OAuth | Real provider often unavailable in test | Issued-token fake | Token fake |

The decision rule: use real where the boundary's specific failure modes are integration-bug-finders (database, message bus); use fake where the dependency's realness adds cost (paid APIs) or unacceptable side effects (emails) without proportional defect-detection.

## Test Data Lifecycle Patterns

| Pattern | Speed | Isolation | When to use |
|---|---|---|---|
| Per-test full reset (drop / recreate) | Slowest (~seconds per test) | Strongest | Tests with destructive schema changes |
| Per-test transaction rollback | Fast (milliseconds) | Strong (for transactional DBs) | Most database integration tests |
| Per-suite seed + per-test mutation isolation | Fast | Medium | Read-heavy test suites with limited mutation |
| Shared snapshot + no-mutation discipline | Fastest | Relies on team discipline | Pure read tests |
| Container reset per test (Testcontainers) | Medium (container startup) | Strongest cross-process | Tests where transaction rollback isn't viable |

The standard production setup is transaction rollback for the bulk of database integration tests, with container reset reserved for the minority where transaction rollback doesn't work (cross-database tests, tests that exercise the transaction system itself).

## When To Use Real Dependencies vs Faked

Quick decision table:

| Question | If yes | If no |
|---|---|---|
| Is the bug class you want to catch at this boundary specific to the real dependency? | Use real | Consider faked |
| Is the real dependency available in test environment? | Use real or sandbox | Use recorded fake |
| Is the real dependency's per-test cost acceptable? | Use real | Use recorded fake |
| Does the real dependency have unacceptable side effects (real emails, real charges)? | Use capture fake | n/a |
| Does the team have infrastructure for the real dependency (Testcontainers, etc.)? | Use real | Build the infra or use recorded fake |

## Verification

After applying this skill, verify:
- [ ] Every integration test's scope is explicit: which collaborators are real, which are faked, what boundary the test exercises. Tests without explicit scope drift between unit and e2e.
- [ ] Real database, real message bus, real cache are used where their failure modes are integration-bug-finders. Mocking these dependencies usually means the test is unit-scope.
- [ ] Third-party APIs are faked (recorded responses) for fast PR tests and exercised real in scheduled (nightly/weekly) integration runs.
- [ ] Test data lifecycle is one of the named patterns (transaction rollback / container reset / per-suite seed / shared no-mutation), not ad-hoc. Test independence is a property of the lifecycle, not a hope.
- [ ] Flaky integration tests are diagnosed (shared mutable state, ordering dependency, time-of-day dependency, race condition), not accepted. A persistent flake is a bug in the test design.
- [ ] The pyramid-or-trophy ratio is intentional and reviewed against the codebase's actual integration-test cost and integration-bug rate.
- [ ] Integration tests are not used where contract tests would be more targeted. The two compose; one does not replace the other.
- [ ] Integration tests run in CI on every PR (with appropriate scope), not relegated to "nightly only" except for the slowest tier (sandbox third parties, multi-service e2e).

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Testing a single function in isolation with all collaborators mocked | `testing-strategy` + `test-doubles-design` | unit-scope test; this skill is for inter-unit scope |
| Testing a full user journey through the UI | `e2e-test-design` | user-journey scope; this skill is for internal seams |
| Verifying that a service's external interface matches the consumer's expectations | `contract-testing` | contract scope; this skill verifies implementation through the interface |
| Measuring whether the test suite catches defects | `mutation-testing` | quality measurement; this skill is the integration-test design itself |
| Choosing the overall ratio of test levels | `testing-strategy` | strategy owns ratios; this skill owns integration-test internals |
| Snapshot-capturing a complex output | `snapshot-testing` | snapshot technique; this skill is integration-test scope |

## Key Sources

- Cohn, M. (2009). *Succeeding with Agile: Software Development Using Scrum*. Addison-Wesley. The book that popularized the test pyramid as the standard recommended suite shape.
- Fowler, M. (2012). ["The Practical Test Pyramid"](https://martinfowler.com/articles/practical-test-pyramid.html). The most-cited practitioner essay on the pyramid framing, with practical advice on integration-test scope and infrastructure.
- Dodds, K. C. (2018). ["The Testing Trophy and Testing Classifications"](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications). The essay introducing the test trophy as an alternative to the pyramid, arguing integration tests are the high-value tier.
- Testcontainers. ["Testcontainers — Reference"](https://testcontainers.com/). The canonical reference for containerized real-dependency integration testing across many languages and dependency types.
- Meszaros, G. (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley. Catalog of integration-test patterns including the test-data lifecycle patterns (Setup, Teardown, Shared Fixture, Transaction Rollback).
- Fowler, M. ["UnitTest"](https://martinfowler.com/bliki/UnitTest.html) and ["IntegrationTest"](https://martinfowler.com/bliki/IntegrationTest.html). Reference pages defining the terms practitioners use; both note the hazy line between sociable unit tests and integration tests.
- Vocke, H. (2018). ["The Practical Test Pyramid — Updated"](https://martinfowler.com/articles/practical-test-pyramid.html). Updated practitioner guidance on test-pyramid implementation, including integration-test infrastructure recommendations.
- ThoughtWorks. ["Test Doubles" and "Test pyramid" in the Technology Radar](https://www.thoughtworks.com/radar). Industry-practitioner consensus on integration-test patterns evolving over years.
