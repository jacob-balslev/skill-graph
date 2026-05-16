---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: integration-test-design
description: "Use when designing tests that verify the interaction between two or more units of a system — modules, services, layers, processes: the scope-and-boundary primitives that distinguish integration from unit and e2e tests, the test-pyramid (Cohn 2009) and test-trophy (Dodds) frameworks for how much integration testing belongs in the suite, the real-vs-faked-collaborator decision per dependency, the test-data lifecycle (per-test setup, transaction rollback, container reset), the difference between sociable-unit tests, integration tests, and contract tests, and the failure modes (over-broad scope that mimics e2e, over-narrow scope that mimics unit, shared mutable state that produces flakes). Do NOT use for testing one unit in isolation (use testing-strategy + test-doubles-design), full user-journey testing (use e2e-test-design), consumer-driven contract verification (use contract-testing), or test-suite quality measurement (use mutation-testing)."
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
  - integration test
  - integration testing
  - test pyramid
  - test trophy
  - sociable test
  - test data setup
  - test transaction rollback
  - test containers
  - testcontainers
  - boundary test
triggers:
  - "should this be a unit or integration test"
  - "the integration test is flaky"
  - "test pyramid vs test trophy"
  - "real database in tests"
  - "test data setup is taking over"
examples:
  - "design an integration test for the order service that exercises real database and real message bus"
  - "decide which dependencies to fake and which to use real in an integration test"
  - "diagnose a flaky integration test — likely shared mutable state across tests"
  - "explain why the test pyramid and test trophy disagree on integration test count"
anti_examples:
  - "test a single function in isolation (use testing-strategy + test-doubles-design)"
  - "test a full user journey through the UI (use e2e-test-design)"
  - "verify a consumer-driven contract against a provider (use contract-testing)"
relations:
  related:
    - testing-strategy
    - test-doubles-design
    - test-driven-development
    - e2e-test-design
    - contract-testing
  boundary:
    - skill: testing-strategy
      reason: "testing-strategy owns the strategic question of how much of each test level to invest in; this skill owns the design of integration-level tests specifically."
    - skill: test-doubles-design
      reason: "test-doubles-design owns the construction of mocks/stubs/fakes; this skill owns the per-dependency real-vs-faked decision in integration scope. Integration tests use real collaborators where practical and fakes only at true external boundaries."
    - skill: e2e-test-design
      reason: "e2e-test-design owns user-journey-scope tests that exercise the full stack including UI; this skill owns scope below that — interaction of units inside the system, often without UI."
    - skill: contract-testing
      reason: "contract-testing owns consumer-driven contract verification between services; this skill owns the in-system interaction of modules. Contract tests verify the *interface*; integration tests verify the *implementation through* the interface."
  verify_with:
    - testing-strategy
    - e2e-test-design
concept:
  definition: "Integration test design is the discipline of designing tests that verify the interaction of two or more units of a system — modules within a process, services across processes, layers within an architecture — to catch defects that emerge only at the boundaries between those units. The unit of judgment is the *boundary*: whether type-mapped, serialized, transactional, contract-bound, or simply called across a function boundary, the integration test's value is exercising the *real* interaction between the parts rather than the *mocked* interaction a unit test would exercise. The scope choice — which units are real, which are faked, which are out of scope — is the central design decision and the source of most fragile integration test suites: too narrow and the test is a unit test in disguise; too broad and the test is an end-to-end test in disguise; in between, the test is what its name says."
  mental_model: |
    Five primitives structure integration-test design:

    1. **The boundary** — the specific seam being verified. Common boundaries: in-process module-to-module function calls; in-process layer-to-layer (controller-to-service, service-to-repository); cross-process service-to-service over HTTP/gRPC/message bus; service-to-database; service-to-third-party API. Each boundary has its own failure modes — type mismatch, serialization drift, transaction boundary errors, authentication failures, rate limit handling — and the test's value is exercising those failure modes.

    2. **Scope** — which units are in scope (exercised with real implementations) and which are out of scope (faked, stubbed, or absent). The integration test's identity is determined by this choice: a test that mocks the database, mocks the message bus, and mocks the third-party API is a unit test through three layers. A test that uses real database, real message bus, and real third-party API is an end-to-end test. An integration test sits in between, with a deliberately-chosen scope appropriate to the boundary under test.

    3. **Real vs faked collaborator** — for each dependency, the choice between using the real implementation and using a fake. Real database (containerized via Testcontainers or in-memory variant): catches type-mapping bugs, query bugs, transaction-boundary bugs. Real message bus: catches serialization, routing, ordering bugs. Real third-party API: catches contract-drift bugs but is slow, costs money, and may be unavailable; usually replaced with a recorded fake. The discipline is to use real where the failure modes are integration-specific and fake where the dependency's real-ness adds cost without proportional defect-detection.

    4. **Test data lifecycle** — how data is set up, shared, and cleaned between tests. Common patterns: per-test setup-teardown (clean database before each test, expensive but isolated); transaction rollback (each test runs in a transaction that is rolled back at end, fast and isolated for transactional databases); shared snapshot with per-test mutations isolated by container reset (Testcontainers' ryuk pattern); shared fixtures with strict no-mutation discipline (cheap but error-prone). The choice affects flakiness, speed, and test independence.

    5. **The pyramid-or-trophy framing** — Cohn's test pyramid (2009) prescribes many unit tests, fewer integration tests, fewer still end-to-end tests, on a cost-to-benefit argument. Dodds's test trophy (2018) inverts the middle: many integration tests, fewer unit tests, on the argument that integration tests catch the bugs that matter and unit tests catch implementation-detail-specific bugs. The disagreement is not about whether integration tests are valuable (both agree they are); it is about the right ratio between unit and integration in a given codebase. Modern testing libraries (Testing Library, Vitest, jest with testcontainers) make integration tests cheap enough that the trophy framing has gained ground; the pyramid still applies in codebases where integration tests are expensive.

    The deep insight is that **integration tests verify the parts of a system that no individual unit can verify alone**. The bugs they catch — type misalignment, serialization edge cases, transaction boundary errors, configuration mismatches, ordering issues, contract drift — live at the boundaries by definition. Unit tests with mocks at the boundaries hide these bugs; integration tests with real collaborators at the boundaries expose them. The technique is most valuable on the bugs unit tests *cannot* catch by construction.

    The complementary insight is that **integration tests are not the same as end-to-end tests**. An integration test's scope is bounded by a specific design decision: which collaborators are real, which are faked. An end-to-end test's scope is the user-visible path through the whole system. A team that conflates them ends up with too many slow tests (e2e disguised as integration) or with integration tests that miss real integration bugs (unit tests disguised as integration). The scope must be explicit.
  purpose: |
    Integration testing exists because unit tests, by construction, cannot verify the parts of a system that emerge from unit interaction.

    **Type-mapping bugs.** A repository class returns rows from a database driver; the unit-level test for the repository mocks the driver and verifies the mapping logic. The integration test using a real driver verifies that the mapping handles every type the driver actually returns — DECIMAL columns, NULLs at unexpected positions, timestamp time zones, JSON columns, array columns. The mock cannot represent these; the real driver does.

    **Serialization edge cases.** A service emits messages on a bus; the unit-level test verifies the message-construction logic against a mocked bus. The integration test against the real bus catches: Unicode encoding issues, message size limits, ordering guarantees, retry semantics, dead-letter queue routing. The mock bus accepts whatever it was programmed to accept; the real bus has its own behavior.

    **Transaction boundary errors.** A service writes to two tables in one transaction; the unit-level test verifies each write against a mocked repository. The integration test against a real database verifies that the transaction *actually rolls back* on failure, that the writes are *actually atomic*, that constraint violations are caught at the right moment. The mock cannot represent transactional behavior; the database does.

    **Configuration mismatches.** A service composes its behavior from configuration; the unit-level test sets a specific configuration and tests behavior under it. The integration test catches configuration that the unit test happened not to set: feature flags, environment variables, default values, missing required config. The unit test sees one configuration; the integration test exercises the configuration system.

    **Contract drift.** Two services share an interface; the unit-level test for each mocks the other. The integration test against the real interface catches drift — when one side changes its expectation without updating the other. (Contract tests are a more targeted technique for this specific concern; see `contract-testing`.)

    There is a sixth reason: integration tests provide *evidence the system works together*. A team with comprehensive unit tests and zero integration tests has high confidence in each unit and low confidence in the system. The unit-test green build is a necessary condition; the integration-test green build is the additional evidence that the units composed together do what the team thinks they do.

    The cost of integration testing is real. Tests run slower than unit tests (database setup, network calls, container start-up). Tests are more flaky (real dependencies have real failure modes). Tests are more expensive to maintain (changes to dependencies break tests). Test data setup is its own complexity. The discipline is investing in the speed-and-reliability infrastructure (Testcontainers for containerized real dependencies, transaction rollback for fast isolation, parallel test execution with isolation, recorded fakes for unavailable dependencies) so that the cost stays manageable as the integration test count grows.

    The deeper purpose is to make the system's *seams* visible and verified. Every seam between units is a place where the system might be wrong; every integration test exercising a seam is a check on that wrong-ness. A team without integration tests is trusting the seams without verification; a team with too many e2e tests instead of integration tests is paying for slow tests when faster tests would catch the same bugs.
  boundary: |
    **Integration tests are not unit tests.** A unit test exercises one unit, mocking all collaborators. An integration test exercises two or more units in their real interaction. The line is not about which testing framework is used; it is about whether the test verifies a single-unit's behavior or an inter-unit interaction.

    **Integration tests are not end-to-end tests.** An end-to-end test exercises a user-visible path through the whole system, typically including UI. An integration test exercises an internal seam, often without UI. The cost difference is large: e2e tests are seconds to tens of seconds; integration tests are milliseconds to a few seconds. Conflating them either drives up CI time (e2e for everything) or loses real-integration coverage (mock-heavy "integration" tests).

    **Integration tests do not require mocks.** This is the central insight that distinguishes modern integration testing from the older "test everything mocked" pattern. Real databases, real message buses, real third-party APIs (when available and cheap) catch more integration bugs than mocked versions. The discipline is using real collaborators where they are practical and faking only at boundaries that are unavailable or prohibitively expensive.

    **Sociable unit tests are not integration tests.** A "sociable" unit test (Fowler's term) uses real in-process collaborators rather than mocks. It is still a unit test if its scope is a single unit's behavior. The boundary at which the term shifts to "integration test" is hazy; the practical distinction is whether the test exercises an across-the-process or across-the-architecture boundary.

    **Integration tests are not contract tests.** Contract tests verify that a service's external interface meets the consumer's expectations, typically using consumer-driven contracts (Pact) or schema verification (OpenAPI conformance). They overlap with integration testing when both sides are exercised, but contract tests have a specific shape: they verify the *contract* itself, not the implementation behind it. Integration tests verify the implementation through the contract.

    **An integration test that mocks the database is not an integration test.** A test claiming to be an integration test but mocking the boundary it is supposed to exercise is a unit test in scope; it verifies whatever the mock can represent, which excludes the real integration bugs. The discipline is: integration tests use the real boundary, or they aren't integration tests.

    **Test pyramid and test trophy are recommendations, not laws.** Both have empirical support; both have known limitations. The right ratio of unit to integration tests in a given codebase depends on: cost of integration tests in that codebase (high → pyramid; low → trophy), nature of bugs the codebase produces (unit-internal → pyramid; integration-boundary → trophy), and team capacity for test maintenance. Neither framework is universally right.

    **An integration test suite that takes 30 minutes is not "just slow."** It is symptomatic. Either the suite is too large (some tests are e2e disguised as integration; consolidate or move them), the infrastructure is wrong (no parallel execution, no container reuse, no transaction-rollback isolation), or the scope-per-test is too broad (each test sets up too much). The discipline of integration test design includes the speed-and-reliability infrastructure.
  taxonomy: |
    By boundary type:
    - **Module-to-module (in-process)** — function-call boundary inside one process. Cheapest integration tests; closest to unit tests.
    - **Layer-to-layer (in-process)** — controller-to-service, service-to-repository, application-to-domain. Still in-process; tests typically use real lower layers.
    - **Service-to-database** — in-process or near-process boundary; uses Testcontainers for real DB or in-memory variant. Catches type mapping, query, transaction bugs.
    - **Service-to-message-bus** — in-process or local container; uses real bus implementation (RabbitMQ, Kafka, Redis Streams). Catches serialization, routing, ordering.
    - **Service-to-third-party API** — cross-organization boundary; usually faked with recorded responses (VCR, nock); occasionally exercised against sandbox endpoints.
    - **Service-to-service (microservices)** — cross-process boundary; can be integration test (with the other service started in the test environment) or contract test (verifying the interface).

    By scope choice for each collaborator:
    - **Real database** — containerized via Testcontainers, Dockerized, or in-memory equivalent (SQLite for Postgres, H2 for many JVM databases).
    - **Real message bus** — local container; same Testcontainers pattern.
    - **Real third-party API** — sandbox or staging endpoint; tested in scheduled integration suites, not on every PR.
    - **Recorded fake** — VCR-style recorded HTTP responses; the fake serves the recordings; appropriate when the third party's behavior is stable.
    - **Hand-written fake** — in-memory implementation of the dependency's interface; appropriate when the interface is small and stable.
    - **Stub** — returns canned responses; usually a unit-test technique, sometimes used at integration boundaries the team doesn't want to exercise.
    - **Mock** — typically inappropriate for integration tests; if mocks are present, the test is closer to unit-scope.

    By test data lifecycle:
    - **Per-test full reset** — drop and recreate the database before each test. Slowest, most isolated.
    - **Per-test transaction rollback** — each test runs in a transaction that rolls back at end. Fast and isolated for transactional databases; doesn't work for some operations.
    - **Per-suite seed with per-test mutation isolation** — seed once per suite; each test isolates its mutations (via separate schemas, separate keys, or careful test data ownership).
    - **Shared snapshot with strict no-mutation discipline** — tests read from shared data and never mutate; relies on team discipline.
    - **Container reset per test** — Testcontainers' ryuk pattern; the database container is fresh per test or per file. Higher overhead than transaction rollback, full isolation.

    By execution strategy:
    - **Run on every commit / PR** — fast integration tests on transactional DB rollback or in-memory fakes; sub-second per test.
    - **Run on every merge** — slower integration tests with containerized real dependencies; seconds per test.
    - **Run nightly / scheduled** — slowest integration tests including third-party sandbox calls; minutes per test.
    - **Run on demand** — specific integration tests for incident reproduction or one-off verification.

    By the pyramid-vs-trophy lens:
    - **Pyramid-shape suite** — many unit, fewer integration, fewer still e2e. Cohn 2009 framing. Fits cost-of-integration-test-is-high codebases.
    - **Trophy-shape suite** — much integration (the trophy's middle), fewer unit, even fewer e2e, plus static analysis as the trophy's stem. Dodds 2018 framing. Fits cost-of-integration-test-is-low codebases.
    - **Diamond-shape suite** — many integration, few unit, few e2e. The "test trophy without the static analysis stem" variant.
  analogy: |
    A car manufacturer's quality control. The assembly line has many stations: engine assembly, transmission assembly, electrical wiring, body panel installation. Each station inspects its own work — the engine team verifies the engine runs on a test stand, the transmission team verifies the transmission shifts on a bench rig, the wiring team verifies continuity with a multimeter.

    These are unit tests. Each station's quality is verified within the station's own scope. The car has not been assembled.

    Integration tests are what happens when the engine is mated to the transmission and the combined unit is bench-tested before installation. The engine ran on its stand; the transmission shifted on its rig; but only the mated test verifies that the bolt pattern aligns, the input shaft engages, the oil passages match, the ECU recognizes the transmission's sensors. Defects that exist in neither component alone but emerge from the joining are found here.

    End-to-end tests are the road test of the finished car. They verify that the customer experience works: the car starts, the steering responds, the brakes engage, the seats are comfortable. They cost the most (a road test takes time and risks the car); they catch the bugs no station and no bench test catches.

    The test pyramid is the recommendation that most QC is at the station level, less at the bench-mated level, less still at the road-test level. The test trophy is the recommendation to do more at the bench-mated level, because the bench-mated tests catch the defects that actually ship to customers.

    Real vs faked collaborators is the question of whether the bench-mated test uses the real transmission or a "test stand transmission" that mimics the real one. The fake is cheaper and easier; the real catches more defects. The choice depends on what defects the team is trying to find and how cheap the real version is to use in a bench-test setting.

    Test data lifecycle is the question of how the engine is prepared between bench-mated tests. Fresh engine each time? Drained and refilled? Same engine reused with new oil? Each choice trades speed for isolation; the team picks based on how independent the bench tests must be.

    A QC program that has only station-level inspection (unit tests) and no bench-mated or road tests will ship cars that pass every individual inspection and fail in customer hands. A QC program that has only road tests and no station or bench-mated inspection will catch the defects but at huge cost per defect. A balanced QC program — and the balance is the test pyramid or trophy — is the design problem this skill addresses.
  misconception: |
    The most common misconception is that **integration tests must mock external dependencies**. They must not. Mocking the dependency the test claims to integrate with reduces the test to unit scope. Modern integration testing uses real dependencies (Testcontainers for databases and buses, recorded fakes for stable third parties) precisely because the bugs at the integration boundary live in the real dependency's behavior, not in the mock's programmed behavior.

    The second misconception is that **integration tests are slow by nature**. They can be — naively written, with full database setup per test, with serial execution, with no isolation strategy. Done well, they run in tens of milliseconds per test using transaction rollback or container reuse. The "integration tests are slow" framing is usually a symptom of missing infrastructure (transaction rollback, parallel execution, container reuse) rather than an inherent property.

    The third misconception is that **integration tests and end-to-end tests are the same thing**. They are not. Integration tests exercise an internal seam; e2e tests exercise a user-visible path through the whole system. The cost difference is an order of magnitude. Conflating them either inflates the e2e cost (treating internal-seam tests as full e2e tests) or loses real integration coverage (treating "go through the API surface" as an integration test).

    The fourth misconception is that **the test pyramid is the only right ratio**. It's a recommendation grounded in a 2009 cost model. Test trophy (Dodds 2018) is the same observation under a different cost model — integration tests have become cheaper, unit tests have lost some value relative to their cost, and the right ratio in many modern codebases is integration-heavy rather than unit-heavy. Neither framework is universally right; both are calibrated to assumptions about test cost.

    The fifth misconception is that **sociable unit tests count as integration tests**. They don't, in the conventional sense — a sociable unit test uses real in-process collaborators but tests one unit's behavior. It is closer to integration than mock-heavy unit tests but is still unit-scope. The line is hazy in practice; the practical distinction is whether the test exercises an across-the-process or across-the-architecture boundary.

    The sixth misconception is that **flaky integration tests are unavoidable**. They are not. Common flake sources are well-known and fixable: shared mutable state (use transaction rollback or per-test reset); test data ordering dependencies (each test must set up its own data); time-of-day dependencies (use injected clocks); race conditions (use deterministic synchronization, not sleeps); shared network ports (use random ports per test). A flaky integration test is a diagnosis, not a condition.

    The seventh misconception is that **integration tests cannot run in CI on every PR**. They can, in seconds, with proper infrastructure: transactional DB rollback for isolation, container reuse across tests, parallel execution within and across CI jobs, smart test selection to skip tests whose dependencies didn't change. The "integration tests are nightly only" pattern is appropriate for the slowest tier (third-party sandbox calls, multi-service e2e); the bulk of integration tests should run on every PR.

    The eighth misconception is that **integration tests replace contract tests**. They don't. Contract tests verify the *interface contract* between consumer and provider; integration tests verify the *implementation* of an interaction. Both have value: contracts ensure the parties agree on the interface; integration tests ensure the implementation behaves correctly through the interface. Choosing one excludes the other's coverage.

    The ninth misconception is that **a small integration test suite means the codebase has low integration risk**. It usually means the team has not built the integration test infrastructure; the integration risk is the same, just untested. The signal of low integration risk is a comprehensive integration test suite that runs green; the absence of integration tests is the absence of signal, not the absence of risk.
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
