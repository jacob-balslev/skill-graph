---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: test-doubles-design
description: "Use when designing or reviewing test doubles — the stand-in objects that replace real collaborators in a test: the five-kind taxonomy (dummy, stub, spy, fake, mock) from Meszaros's xUnit Test Patterns, the difference between state verification (Detroit-school, classicist) and interaction verification (London-school, mockist) and how it determines which doubles fit, the cost of doubles (fragility, false confidence, divergence from real behavior), the role of fakes as the under-used middle ground, the verify_with relationship to test-driven-development, and the heuristics for when to use a real collaborator instead of any double. Do NOT use for choosing test levels or what to test (use testing-strategy), the design discipline of writing tests first (use test-driven-development), specific mocking-library API choice (library docs), or general production stubs and feature flags (use feature-gating or domain-specific skills)."
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
  - test double
  - mock
  - stub
  - spy
  - fake
  - dummy
  - test isolation
  - interaction verification
  - state verification
  - mockist
  - classicist
  - in-memory fake
  - sociable test
  - solitary test
triggers:
  - "should this be a mock or a stub"
  - "are we using mocks correctly"
  - "the test is brittle when I refactor"
  - "do we need a fake here"
  - "is this test really testing anything"
examples:
  - "decide between a mock, a stub, and a fake for a database collaborator in a test"
  - "explain why over-mocking produces fragile tests that change with every refactor"
  - "diagnose a passing test that mirrors the implementation rather than specifying behavior"
  - "design an in-memory fake for a repository interface that supports both classicist tests and integration tests"
anti_examples:
  - "decide which test levels (unit/integration/e2e) the project should invest in (use testing-strategy)"
  - "set up a production feature flag (use feature-gating)"
  - "configure a specific mocking library — Jest, Sinon, Mockito (library docs)"
relations:
  related:
    - testing-strategy
    - test-driven-development
    - refactor
    - api-design
    - type-safety
  boundary:
    - skill: test-driven-development
      reason: "test-driven-development owns the design discipline of writing the test before the production code; this skill owns the design of the stand-in objects those tests use. The two compose: TDD prescribes the rhythm; test-doubles-design prescribes the stand-ins."
    - skill: testing-strategy
      reason: "testing-strategy owns the strategic question of what to test at which level; this skill owns the tactical construction of the stand-ins that make a given test possible."
    - skill: refactor
      reason: "refactor owns behavior-preserving structural change; this skill owns the doubles whose over-use produces refactor-fragile tests. The two skills are read together when a test suite resists refactoring."
    - skill: api-design
      reason: "api-design owns the design of an interface as a production contract; this skill owns the doubles that exercise that interface in tests. When test doubles drive interface decisions (London-school TDD), this skill and api-design overlap heavily."
  verify_with:
    - test-driven-development
    - refactor
concept:
  definition: "A test double is a stand-in object that replaces a real collaborator in a test so the test can run without the collaborator's real behavior. The term, from Meszaros's *xUnit Test Patterns*, generalizes a family of stand-ins — dummies, stubs, spies, fakes, and mocks — each defined by what the test expects of it. Doubles exist because real collaborators are often unavailable (external services), nondeterministic (time, network, randomness), slow (databases, file systems), expensive (paid APIs), or have side effects unacceptable in a test (sending email, charging cards). The discipline of test-doubles design is choosing the right kind of double for each test's purpose, recognizing that the choice determines what the test actually verifies — state or interaction — and what the test will reveal under refactoring."
  mental_model: |
    Five primitives structure test-doubles reasoning:

    1. **The five kinds (Meszaros taxonomy)** — dummy (a placeholder that is never used; just satisfies a parameter), stub (returns canned answers to calls; no verification), spy (a stub that also records the calls it received; verification is post-hoc), mock (pre-programmed with the calls it expects; verification is built into the double — it fails if the expected calls did not happen as specified), fake (a working implementation that takes shortcuts unsuitable for production — an in-memory database, a deterministic clock, a recorded HTTP responder). The distinctions matter because each kind enables a different test shape and exhibits a different failure mode.

    2. **State vs interaction verification** — a test that checks "after calling A, the system's state is X" is verifying state; the doubles it needs are typically stubs and fakes. A test that checks "the system called B with these arguments" is verifying interaction; the doubles it needs are spies and mocks. The choice between state and interaction is not a matter of personal style — it determines the test's character, fragility profile, and connection to the design (Detroit-school favors state; London-school favors interaction; the two produce different test suites).

    3. **The collaborator-vs-component boundary** — a double makes sense at a *boundary between things that should be independently testable*. A double inserted inside a single cohesive component produces a test that knows too much about the component's internals; refactoring the internals breaks the test. The discipline asks: is this double sitting at a real seam (a service boundary, an external dependency, an injection point) or at an artificial seam introduced just to enable the test.

    4. **Fakes are the under-used middle ground** — most discourse about doubles is mock-heavy; fakes are the working in-memory implementations that often produce more robust tests. An in-memory repository fake, a deterministic clock fake, an HTTP recorder fake — these are real implementations of the collaborator's interface, with shortcuts that make them unsuitable for production. They survive refactors that break mock-based tests because they verify behavior end-to-end through a working substitute, not interactions against a specific call shape.

    5. **The cost ledger** — every double has costs: divergence (the double's behavior may not match the real collaborator's), maintenance (the double must be updated when the real collaborator changes), false confidence (a passing test against doubles may mean nothing in production), and fragility (interaction-based doubles break under refactoring). The discipline is choosing doubles whose costs are worth the test they enable, not reaching for doubles by reflex.

    The deep insight is that **doubles encode design decisions**. A test using a mock for collaborator X says "this code's contract with X is exactly these interactions in this order"; a test using a fake for the same X says "this code's contract with X is the externally observable behavior of a working X." The two contracts are different, and the choice of double declares which contract the test is verifying. A test suite full of mocks is making thousands of small interaction-contract decisions; a test suite full of fakes is making thousands of small behavior-contract decisions. Most teams have not consciously chosen which kind of suite they have.
  purpose: |
    Test doubles exist because the alternative — using only real collaborators in every test — has three failure modes that compound at scale: unavailability, nondeterminism, and undesirable side effects.

    **Unavailability.** A test that requires a third-party payment API to be reachable, an email provider to accept mail, or a downstream service to be running cannot execute in CI, in offline development, or after the third party deprecates the endpoint. A stub or fake decouples the test from the dependency's runtime availability without losing the unit's testable behavior.

    **Nondeterminism.** A test that depends on real time (the current date, elapsed milliseconds, scheduling), real randomness (UUIDs, sampled values), or real network conditions (latency, retries, partial failures) will fail intermittently in a way that pollutes the test signal. A deterministic clock fake, a seeded RNG stub, and a recorded HTTP responder fake remove the nondeterminism without removing the property under test.

    **Undesirable side effects.** A test that runs the production code path will run the production side effects: emails sent, payments made, audit logs written, third-party rate limits consumed, customer records mutated. A double interposes on the side effect and lets the test verify the *intent* (the right call was made) or the *contract* (the call would behave correctly) without the consequence.

    There is a fourth, more contested purpose: design pressure. London-school TDD treats doubles as a design tool — every new collaborator the test discovers becomes a mock, and the mock's interface drives the next layer of the production design. In this view, doubles are not just enabling the test; they are how the design happens. The classicist (Detroit-school) view holds that this conflates testing with designing and produces fragile interaction-tied test suites. Both views are defensible; the choice determines what the test suite becomes.

    The cost of test doubles is real. Every double is a place where the test's belief about the collaborator may diverge from the collaborator's actual behavior. The defense is bidirectional: use doubles that are as close as possible to the real collaborator's externally observable behavior (favoring fakes over mocks where practical), and supplement isolated tests with contract tests, integration tests, or end-to-end tests that exercise the real collaborator at less granular scope. Doubles are not a substitute for verification against reality; they are a trade-off for testability against verification fidelity.
  boundary: |
    **A test double is not a production stub.** Production stubs (feature-flag-gated alternative implementations, A/B test variants, fallback implementations for degraded modes) are concerns of the running system. Test doubles are concerns of the test harness. A class might be both — the same in-memory repository fake might be useful as a development stand-in for the real database — but the test-double discipline is about the role in a test, not about the class itself.

    **A test double is not a polyfill or shim.** Polyfills (browser API substitutes) and shims (interface adapters) are runtime mechanisms that change what the application sees during normal operation. Test doubles are mechanisms that change what the test under test sees during a test run. The mechanisms may look similar — both replace one implementation with another — but the lifecycle and audience differ.

    **A mock is not just a stub with extra features.** A stub returns canned answers; a mock additionally fails the test when the expected calls did not happen as specified. Treating them as interchangeable produces over-mocked tests (assertions about interactions where only state mattered) and under-mocked tests (missing the interaction guarantee a mock would have enforced). The taxonomic distinction is load-bearing.

    **Fakes are not toys.** A common misconception is that fakes are quick-and-dirty stand-ins. A well-designed fake is a working implementation of the collaborator's interface with shortcuts that make it unsuitable for production — an in-memory database is a real database with persistence shortcuts; a deterministic clock is a real clock with manual control; a recorded HTTP responder is a real HTTP client with deterministic response storage. The shortcuts make them lightweight; the working-implementation quality makes them robust under refactoring.

    **Mocking and dependency injection are not the same thing.** Dependency injection is a design pattern that makes a collaborator replaceable; mocking is one way to use the replaceability in a test. A codebase can use dependency injection without mocking (the replacement is a fake or another real implementation), and a codebase can mock without dependency injection (via monkey-patching, prototype manipulation, or DI-by-test-framework). Conflating them muddles two different decisions.

    **"Mocking the database" is rarely correct.** A database has rich, ordered, transactional behavior that a mock cannot replicate without becoming a fake (i.e., a working in-memory database). Tests that mock the database verify only that specific call shapes were made; they catch nothing about query correctness, transaction boundaries, constraint violations, or migration compatibility. The right alternatives are an in-memory database fake (SQLite, H2), a containerized real database in CI, or a contract-tested integration layer.

    **The London/Detroit divide is not about whether to use doubles.** Both schools use doubles. They differ on *which kind* and *for what purpose*. London-school uses mocks heavily as design tools; Detroit-school uses stubs and fakes sparingly for unavailable/nondeterministic dependencies and verifies state. Neither school refuses doubles entirely.

    **A passing test against doubles is not a guarantee about production.** Every double is a place where reality may differ. Contract tests, integration tests, and production observability are the layers that close the gap. A test suite that relies entirely on doubles has tested its model of reality, not reality itself.
  taxonomy: |
    By the five-kind taxonomy (Meszaros, *xUnit Test Patterns*, 2007):
    - **Dummy** — a placeholder object passed but never actually used; satisfies a parameter that the code path doesn't exercise. Lowest cost, lowest information value.
    - **Stub** — an object that returns canned responses to calls; the test reads state after the call to verify the effect. No verification of which calls were made.
    - **Spy** — a stub that additionally records every call it received; the test inspects the recorded calls post-hoc. Verification is by reading the spy after the action.
    - **Mock** — an object pre-programmed with the calls it expects, in what order, with what arguments; the double itself fails the test if reality deviates. Verification is built into the double.
    - **Fake** — a working implementation of the collaborator's interface with production-unsuitable shortcuts (in-memory database, deterministic clock, file-system stand-in). Verification is end-to-end through the fake's working behavior.

    By verification style:
    - **State verification** — the test acts, then inspects observable state. Uses stubs and fakes; rarely mocks. Detroit-school favors this. Less fragile under refactoring.
    - **Interaction verification** — the test acts, then inspects which calls were made to collaborators. Uses spies and mocks. London-school favors this. More design-tied; more fragile under refactoring.
    - **Hybrid** — most working test suites mix both. The choice is per-test.

    By solitary vs sociable (Fowler's terms):
    - **Solitary tests** — every collaborator beyond the unit under test is a double. Fast, isolated, mocky.
    - **Sociable tests** — real collaborators are used wherever practical; doubles only at boundaries that would be slow/nondeterministic/unavailable. Slower per test, more behavior covered per test, more refactor-friendly.

    By double's source:
    - **Hand-rolled** — the double is a small class written for the test. Highest control, highest maintenance.
    - **Library-generated** — the double is constructed by a mocking framework (Jest mocks, Sinon, Mockito, Moq, unittest.mock). Lowest boilerplate; some frameworks blur the kind distinctions (Sinon "spies" can be configured as stubs or mocks).
    - **Pre-existing real implementation** — the double is another real implementation of the interface (in-memory variant, no-op variant, recording variant). Highest behavioral fidelity.

    By temporal coupling:
    - **Pre-programmed expectations** (strict mocks) — mock fails if anything unexpected is called. High test specificity; high refactor fragility.
    - **Loose expectations** (lenient mocks) — mock allows unexpected calls; test verifies only the expected ones. Lower specificity; lower fragility.
    - **Post-hoc verification** (spies) — test reads recorded calls and asserts. The most flexible interaction verification.

    By replacement mechanism:
    - **Dependency injection** — the test passes the double in via constructor or parameter. Cleanest; requires DI-ready production code.
    - **Monkey-patching / prototype-replacement** — the test mutates the global namespace before the test runs. Powerful in dynamic languages; brittle across test isolation boundaries.
    - **Module-level mocking** — the test framework intercepts module imports (Jest's `jest.mock`, Vitest's `vi.mock`). Convenient; hides the mocked behavior from a casual reader of the test.
    - **Test-only build configuration** — the test build links a different implementation. Common in compiled languages; uncommon in dynamic ones.
  analogy: |
    A theater rehearsal. The play has a leading actor (the unit under test) and many supporting roles (the collaborators). Some supporting actors are present — the leading actor performs against them as in the actual play. Other supporting actors are absent, and the cast must rehearse anyway.

    A **dummy** is a chair set on stage where a character is supposed to stand. The leading actor's lines don't address it; it's just there because the scene requires a body in that position.

    A **stub** is a stagehand reading a single line from a card whenever the leading actor needs that line as a cue. The stagehand isn't acting — they're providing the input the leading actor needs to continue. The director (the test) doesn't care whether the stagehand acted convincingly; only that the leading actor's response was correct.

    A **spy** is a stagehand reading lines from cards *and* writing down everything the leading actor said in response. After the scene, the director reads the notes to confirm the leading actor said the right things at the right times.

    A **mock** is a strict stand-in who refuses to participate unless the leading actor delivers each line exactly as the rehearsal director specified — every cue word, in order, with the right tone. If the leading actor improvises or changes the order, the mock breaks the rehearsal and the director has to start over.

    A **fake** is an understudy. The understudy knows the supporting role's lines, can perform the whole scene credibly, and is used to rehearse complete scenes when the real actor is unavailable. The understudy's performance has rough edges that wouldn't survive opening night, but for rehearsal purposes the scene runs end-to-end with a real performance opposite the lead.

    A rehearsal mostly with strict stand-ins (mocks) tests the leading actor's adherence to the exact script — useful for choreographed scenes, fragile for any line the director wants to revise. A rehearsal mostly with understudies (fakes) tests the leading actor's ability to perform a complete scene — more forgiving of line changes, less precise about cue timing. A rehearsal with no stand-ins at all — only real co-stars — is dress rehearsal; it's the highest-fidelity test but it requires the whole company to be present and free.

    Most rehearsals mix all five. The discipline is knowing which scene needs which kind of stand-in, and recognizing that the choice shapes what the rehearsal actually tested.
  misconception: |
    The most common misconception is that **all test doubles are mocks**. They are not. The five-kind taxonomy from Meszaros — dummy, stub, spy, mock, fake — describes distinct constructs with different properties. Conflating them under "mock" loses the language to choose the right one and produces test suites that reach for the strictest verification (real mocks) when looser doubles would have been sufficient and more robust.

    The second misconception is that **mocks are a feature of mocking libraries**. They are an idea (Meszaros / Fowler, predating the libraries) that mocking libraries implement. The libraries (Sinon, Jest, Mockito, Moq, etc.) often provide a single API that can act as stub, spy, or mock depending on configuration — but a stub-shaped use of a library "mock" is still a stub, conceptually. A reader who can't tell which kind a given test is using is reading a test in dialect, not in clear language.

    The third misconception is that **more mocks make tests more isolated and therefore better**. They make tests more isolated and *more fragile under refactoring*. A test with a mock for every collaborator pins the implementation's exact interaction sequence; a refactor that changes how the unit collaborates (without changing observable behavior) breaks every such test. Heavy mocking trades regression-test-suite fragility for fast test execution, and the trade is often the wrong one.

    The fourth misconception is that **fakes are quick-and-dirty stand-ins**. A well-designed fake is a working implementation of the interface, just with production-unsuitable shortcuts. An in-memory database is a real database with persistence and durability shortcuts; a deterministic clock is a real clock with manual control. Fakes survive refactors that break mocks because they verify behavior end-to-end through a working substitute, not interactions against a specific call shape.

    The fifth misconception is that **mocking the database is good practice**. A database has rich, ordered, transactional, constraint-checking behavior that a mock cannot replicate without becoming a fake. Tests that mock the database test that the code makes specific calls; they test nothing about whether the query is correct, the transaction boundary is right, the migration is compatible, or constraint violations are handled. The right alternatives are an in-memory database fake, a containerized real database in CI, or an integration layer with contract tests.

    The sixth misconception is that **the London/Detroit divide is about whether to use mocks at all**. Both schools use mocks; they differ on how much and for what purpose. London-school treats mocks as a design tool that pressures the production code's collaboration interfaces; Detroit-school uses mocks only for unavailable/nondeterministic dependencies and verifies observable state. The schools produce different test suites with different fragility and design-coupling profiles.

    The seventh misconception is that **a passing test against a mock is evidence the production code works**. It is evidence that the production code makes the calls the mock expected. It is not evidence that the calls do what the production code believes they do. Contract tests against the real collaborator's interface (Pact-style consumer-driven contracts), or integration tests that exercise the real collaborator at less granular scope, are required to close the gap.

    The eighth misconception is that **dependency injection is mocking**. Dependency injection is a design pattern (the collaborator is passed in rather than constructed inside). Mocking is one use of the replaceability that DI provides. A codebase can use DI without mocking (the injected dependency is a fake or another real implementation), and a codebase can mock without DI (via monkey-patching). Conflating them runs together two separable design decisions.

    The ninth misconception is that **'sociable' tests (which use real collaborators) are integration tests**. They can be, but a sociable unit test (Fowler's term) uses real collaborators for *cohesive* portions of the unit's behavior and doubles only at the genuine boundaries (network, time, file system). Such a test is still scope-limited; it just trusts more of the in-process code. The integration-test distinction is about the *scope* of the test, not the use of real collaborators in unit-scope tests.
---

# Test-Doubles Design

## Coverage

The discipline of choosing and constructing the stand-in objects that replace real collaborators in tests. Covers the five-kind taxonomy (dummy, stub, spy, mock, fake) from Meszaros's *xUnit Test Patterns*, the state-vs-interaction verification distinction that determines which kinds fit which tests, the solitary-vs-sociable test-shape trade-off, the under-use of fakes as the robust middle ground, the cost ledger of every double (divergence, maintenance, false confidence, fragility), and the heuristics for when to use a real collaborator instead of any double. Includes the connection to London/Detroit-school TDD and to the api-design surface that doubles often pressure.

## Philosophy

A test double is a small lie the test tells the unit under test. The lie is useful — it makes the test fast, isolated, deterministic, and free of side effects — but every lie is also a place where the test's belief about the collaborator may diverge from the collaborator's actual behavior. The discipline of test-doubles design is choosing lies whose costs are worth the tests they enable, and recognizing that the choice of *what kind* of lie shapes what the test actually verifies.

The biggest design decision in test-doubles work is whether the test is verifying state ("after this action, the system looks like this") or interaction ("during this action, these calls were made to collaborators"). The choice is not a matter of preference; it determines the test suite's character, its fragility under refactoring, and its connection to the production design. London-school TDD favors interaction; Detroit-school favors state. Most working test suites mix both, and most working test suites have not chosen the mix consciously.

The under-acknowledged construct is the fake. Discourse about test doubles is dominated by mocks (because they are the most distinctive kind and the most natural fit for interaction verification), but fakes — working implementations with production-unsuitable shortcuts — often produce more robust tests with less long-term maintenance cost. A test suite that uses fakes for collaborators that admit a working stand-in (databases, clocks, HTTP clients) and reserves mocks for true behavioral verification is usually better-aged than the equivalent mock-heavy suite.

## The Five Kinds — A Practical Reference

| Kind | What it is | What it verifies | Fragility under refactor | Best use |
|---|---|---|---|---|
| Dummy | Placeholder; never actually used | Nothing | None — it isn't exercised | Parameter slots the test path doesn't touch |
| Stub | Returns canned answers to calls | State after the action | Low — only the canned answer matters | Providing inputs the unit needs |
| Spy | Stub + records calls received | State and (post-hoc) which calls happened | Medium — call-shape changes break the spy assertion | Flexible interaction verification |
| Mock | Pre-programmed with expected calls; double itself fails on deviation | Interaction (built into the double) | High — call-shape changes break the test directly | Verifying a contract with a collaborator |
| Fake | Working implementation of the interface with production-unsuitable shortcuts | State end-to-end through the fake | Low — behavior is verified through a working substitute | Slow/nondeterministic collaborators with workable in-memory stand-ins |

## State vs Interaction — The Defining Choice

| Property | State verification | Interaction verification |
|---|---|---|
| Question the test answers | "After this, what does the system look like?" | "During this, what did the system do?" |
| Typical doubles | Stubs, fakes | Spies, mocks |
| Schools | Detroit-school (Beck), classicist | London-school (Freeman & Pryce), mockist |
| Refactor fragility | Low — internal call shapes can change | High — call shapes are pinned by the test |
| Design coupling | Loose — test sees the unit's surface | Tight — test sees the unit's collaborations |
| Failure mode | Coarse assertions; missed interaction bugs | Test mirrors implementation; refactor breaks tests that still produce correct behavior |

A practical heuristic: prefer state verification when the unit's behavior is naturally state-shaped (calculators, parsers, domain logic); prefer interaction verification when the unit's behavior is naturally collaboration-shaped (orchestrators, controllers, services that exist to coordinate other services).

## When To Use A Real Collaborator (Sociable Tests)

| Collaborator | Real-collaborator use? | If not, prefer |
|---|---|---|
| Pure functions, value objects, in-process domain logic | Yes — always | n/a |
| In-process services, repositories with in-memory implementations | Often yes | Fake if the real one has setup cost |
| Database access | Increasingly yes (containerized real DB in CI) | In-memory DB fake (SQLite/H2) over mock |
| File system | Usually fake (temp dir or in-memory FS) | Fake over mock |
| Time, clocks, schedulers | Always fake | Deterministic clock fake |
| Network (HTTP) | Recorded responses (fake) or real in integration scope | Fake (recorded responder) over mock |
| External paid APIs | Fake or contract test against recorded responses | Fake over mock |
| Other services across process boundary | Contract test against; double in unit scope | Fake or stub at unit scope; real in integration scope |

A test suite that mocks pure-function collaborators is over-mocking; a test suite that uses real third-party APIs in every unit test is under-using doubles.

## Verification

After applying this skill, verify:
- [ ] Every double in the test suite is identifiable as one of the five kinds (dummy, stub, spy, mock, fake). Tests that say "mock" loosely (when the construct is really a stub or spy) are using the term in dialect, not in the precise sense.
- [ ] The verification style (state vs interaction) is consistent within a test. A test that mixes both styles is usually testing two things and should be split.
- [ ] Doubles sit at real seams (service boundaries, external dependencies, true injection points), not at artificial seams introduced just to enable the test.
- [ ] Where a collaborator admits a working in-memory implementation, a fake is preferred over a mock. Mocks are reserved for genuine interaction verification.
- [ ] No test mocks the database; database interaction uses an in-memory DB fake, a containerized real DB in CI, or a contract test layer.
- [ ] The school being practiced (London/Detroit/hybrid) is intentional, not accidental. The mock-to-fake ratio in the test suite is a measurement of which school is in use.
- [ ] Tests are not over-specified — strict mocks that pin exact call sequences are used only where the contract is genuinely about the call sequence (rare).
- [ ] Contract tests, integration tests, or production observability close the gap between mock-isolated unit tests and the real collaborator's actual behavior. Mocks alone are not the full verification story.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Choosing what to test, at which level | `testing-strategy` | testing-strategy owns the strategic question; this skill owns the doubles inside chosen tests |
| Designing the rhythm of test-first development | `test-driven-development` | TDD owns the discipline of writing tests first; this skill owns the doubles those tests use |
| Configuring a specific mocking library (Jest, Sinon, Mockito) | library documentation | library API choice is tactical detail below this skill's scope |
| Setting up a production feature flag or runtime alternative | `feature-gating` | feature-gating is about production behavior; this skill is about test-harness behavior |
| Designing the production interface a double would mimic | `api-design` | api-design owns the production contract; this skill consumes that contract for tests |
| Performing a behavior-preserving structural change | `refactor` | refactor owns the technique; this skill owns the doubles that may resist or enable the refactor |

## Key Sources

- Meszaros, G. (2007). *xUnit Test Patterns: Refactoring Test Code*. Addison-Wesley. The canonical reference for the five-kind test-double taxonomy (dummy, stub, spy, mock, fake) and the broader patterns of test-code design.
- Fowler, M. (2007). ["Mocks Aren't Stubs"](https://martinfowler.com/articles/mocksArentStubs.html). The defining practitioner essay distinguishing classicist (Detroit) and mockist (London) TDD and the role of doubles in each.
- Freeman, S., & Pryce, N. (2009). *Growing Object-Oriented Software, Guided by Tests* (GOOS). Addison-Wesley. The canonical book on London-school TDD; treats mocks as a design tool that drives collaboration interfaces.
- Beck, K. (2002). *Test-Driven Development: By Example*. Addison-Wesley. The canonical book on Detroit-school TDD; uses doubles sparingly and verifies state.
- Fowler, M. ["Test Double"](https://martinfowler.com/bliki/TestDouble.html). Short reference page formalizing Meszaros's taxonomy in practitioner vocabulary.
- de Oliveira Neto, F. G., et al. (2019). ["Evolution of statistical analysis in empirical software engineering research: Current state and steps forward"](https://www.sciencedirect.com/science/article/abs/pii/S0164121219300573). Survey of empirical evidence on test-suite quality including the effects of mock-heavy vs sociable test designs.
- Spadini, D., Aniche, M., Bruntink, M., & Bacchelli, A. (2019). ["Mock objects for testing Java systems"](https://link.springer.com/article/10.1007/s10664-018-9663-0). *Empirical Software Engineering*. Industrial study on mock usage patterns and their evolution.
- Mancinelli, F. (2018). ["A Survey on Test Doubles Frameworks"](https://arxiv.org/abs/1801.10306). Comparative review of mocking libraries across languages; useful as a third-party reference for library-specific encodings.
