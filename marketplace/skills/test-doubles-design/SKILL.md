---
name: test-doubles-design
description: "Use when designing or reviewing test doubles — the stand-in objects that replace real collaborators in a test: the five-kind taxonomy (dummy, stub, spy, fake, mock) from Meszaros's xUnit Test Patterns, the difference between state verification (Detroit-school, classicist) and interaction verification (London-school, mockist) and how it determines which doubles fit, the cost of doubles (fragility, false confidence, divergence from real behavior), the role of fakes as the under-used middle ground, the verify_with relationship to test-driven-development, and the heuristics for when to use a real collaborator instead of any double. Do NOT use for choosing test levels or what to test (use testing-strategy), the design discipline of writing tests first (use test-driven-development), specific mocking-library API choice (library docs), or general production stubs and feature flags (use feature-gating or domain-specific skills). Do NOT use for set up a production feature flag (use feature-gating)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"api-design\",\"type-safety\",\"testing-strategy\",\"test-driven-development\",\"refactor\"],\"suppresses\":[\"test-driven-development\",\"testing-strategy\"],\"verify_with\":[\"refactor\",\"test-driven-development\"]}"
  subject: quality-assurance
  public: "true"
  scope: "Use when designing or reviewing test doubles — the stand-in objects that replace real collaborators in a test: the five-kind taxonomy (dummy, stub, spy, fake, mock) from Meszaros's xUnit Test Patterns, the difference between state verification (Detroit-school, classicist) and interaction verification (London-school, mockist) and how it determines which doubles fit, the cost of doubles (fragility, false confidence, divergence from real behavior), the role of fakes as the under-used middle ground, the verify_with relationship to test-driven-development, and the heuristics for when to use a real collaborator instead of any double. Do NOT use for choosing test levels or what to test (use testing-strategy), the design discipline of writing tests first (use test-driven-development), specific mocking-library API choice (library docs), or general production stubs and feature flags (use feature-gating or domain-specific skills)."
  taxonomy_domain: quality/testing
  stability: experimental
  keywords: "[\"test double\",\"mock\",\"stub\",\"spy\",\"fake\",\"dummy\",\"test isolation\",\"interaction verification\",\"state verification\",\"mockist\"]"
  triggers: "[\"should this be a mock or a stub\",\"are we using mocks correctly\",\"the test is brittle when I refactor\",\"do we need a fake here\",\"is this test really testing anything\"]"
  examples: "[\"decide between a mock, a stub, and a fake for a database collaborator in a test\",\"explain why over-mocking produces fragile tests that change with every refactor\",\"diagnose a passing test that mirrors the implementation rather than specifying behavior\",\"design an in-memory fake for a repository interface that supports both classicist tests and integration tests\"]"
  anti_examples: "[\"decide which test levels (unit/integration/e2e) the project should invest in (use testing-strategy)\",\"set up a production feature flag (use feature-gating)\",\"configure a specific mocking library — Jest, Sinon, Mockito (library docs)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A test double is to a unit under test what a Hollywood stunt-double is to a leading actor — the stunt-double looks like the actor enough that the camera believes the scene, performs the dangerous part the actor cannot or should not perform (slow networks, paid APIs, real emails), but is not the actor. The director's job is choosing the right kind of stunt-double for the scene: a dummy stands in the back of the shot (placeholder); a stub recites canned lines from off-camera (canned answers); a spy records which lines were spoken (call recording); a mock has a script that *fails the take* if the actor deviates (rigid interaction verification); a fake is a body-double trained to actually perform the action in a controlled way (working in-memory substitute). Casting mocks where a fake would do produces takes that pass when the stunt is performed exactly as written and fail catastrophically when the actor improvises a better line."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/test-doubles-design/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
# Test-Doubles Design

## Concept of the skill

A test double is a *stand-in object that replaces a real collaborator in a test* so the test can run without the collaborator's real behavior. The term, from Meszaros's *xUnit Test Patterns* (2007), generalizes a family of stand-ins each defined by what the test expects of it: *dummy* (placeholder; never actually used; verifies nothing; for parameter slots the test path doesn't touch), *stub* (returns canned answers to calls; verifies state after the action; low fragility under refactor — only the canned answer matters), *spy* (stub + records calls received; verifies state and post-hoc which calls happened; medium fragility — call-shape changes break the spy assertion), *mock* (pre-programmed with expected calls; the double *itself* fails on deviation; verifies interaction built into the double; *high* fragility under refactor because call-shape changes break the test directly), *fake* (working implementation of the interface with production-unsuitable shortcuts — in-memory DB, deterministic clock, recorded HTTP responses; verifies state end-to-end through the fake; low fragility because behavior is verified through a working substitute).

Replaces "real collaborator everywhere or test cannot run" with controllable stand-ins that make tests fast, isolated, deterministic, and free of side effects — but with each lie a place where the test's belief about the collaborator may diverge from reality. The discipline of test-doubles design is *choosing lies whose costs are worth the tests they enable*, and recognizing that the choice of *what kind* of lie shapes what the test actually verifies. Sub-purpose: surface the *under-acknowledged construct* of fakes — discourse is dominated by mocks (most distinctive, natural fit for interaction verification), but fakes (working implementations with shortcuts) often produce more robust tests with less long-term maintenance cost; a test suite that uses fakes for collaborators admitting in-memory stand-ins (databases via SQLite/H2, clocks via deterministic stubs, HTTP clients via recorded responders) and reserves mocks for true behavioral verification is usually better-aged than the equivalent mock-heavy suite. The *sociable-vs-solitary* trade-off: real collaborators (pure functions, value objects, in-process domain logic) should always be used real; databases and message buses are increasingly real-via-containerized-CI; only at true external boundaries (paid APIs, email/SMS providers) should fakes or stubs replace the real thing.

Distinct from test-driven-development, which owns the design discipline of writing the test before the production code — this skill owns the design of the stand-in objects those tests use; the two compose (TDD prescribes the rhythm; this skill prescribes the stand-ins). Distinct from testing-strategy, which owns the strategic question of what to test at which level — this skill owns the tactical construction of the stand-ins that make a given test possible. Distinct from refactor, which owns behavior-preserving structural change — this skill owns the doubles whose *over-use* produces refactor-fragile tests; the two are read together when a test suite resists refactoring. Distinct from api-design, which owns the design of an interface as a *production* contract — this skill owns the doubles that exercise that interface in *tests*; when test doubles drive interface decisions (London-school TDD), the two overlap heavily. Distinct from feature-gating (production runtime alternatives — this skill is about test-harness behavior) and from specific mocking-library API choice (Jest, Sinon, Mockito — library docs). A test double is to a unit under test what a Hollywood stunt-double is to a leading actor — the stunt-double looks like the actor enough that the camera believes the scene, performs the dangerous part the actor cannot or should not perform (slow networks, paid APIs, real emails), but is not the actor. The director's job is choosing the right kind of stunt-double for the scene: a dummy stands in the back of the shot (placeholder); a stub recites canned lines from off-camera (canned answers); a spy records which lines were spoken (call recording); a mock has a script that *fails the take* if the actor deviates (rigid interaction verification); a fake is a body-double trained to actually perform the action in a controlled way (working in-memory substitute). Casting mocks where a fake would do produces takes that pass when the stunt is performed exactly as written and fail catastrophically when the actor improvises a better line. The wrong mental model is that *all stand-ins are "mocks"* and the choice is just which mocking library to use. They are not — there are *five distinct kinds*, each verifying something different, and the term "mock" used loosely (when the construct is really a stub or spy) is dialect, not the precise sense. Adjacent misconceptions: that *more mocking is better isolation* (it is not — mock-heavy test suites are refactor-fragile; tests pin call shapes that the next refactor will break, producing tests that fail even when the production code still produces correct behavior — the canonical mockist failure mode); that *fakes are exotic* (they are not — they are the under-used middle ground for collaborators admitting in-memory stand-ins: in-memory database fakes via SQLite/H2, deterministic clock fakes, recorded HTTP responders, in-memory FS fakes; production-grade test suites use fakes for databases/clocks/HTTP and reserve mocks for true interaction verification); that *mocking a database is fine* (it is not — database interaction should use an in-memory DB fake, a containerized real DB in CI via Testcontainers, or a contract test layer; mocking the database removes the precise boundary the test was for); that *the school being practiced (London/Detroit/hybrid) doesn't matter* (it does — the school determines whether the test suite is interaction-heavy or state-heavy, mock-rich or mock-sparse, refactor-resistant or refactor-fragile; a practitioner who has not chosen has chosen *by accident*, and the mock-to-fake ratio in the test suite reveals which they chose without knowing); and that *strict mocking pinning exact call sequences is a default* (it is not — strict mocks should be used only where the contract is *genuinely about the call sequence*, which is rare; default to relaxed verification of presence and arguments, and complement mock-isolated unit tests with contract tests, integration tests, or production observability to close the gap between mocks and real collaborator behavior).

## Coverage

The discipline of choosing and constructing the stand-in objects that replace real collaborators in tests. Covers the five-kind taxonomy (dummy, stub, spy, mock, fake) from Meszaros's *xUnit Test Patterns*, the state-vs-interaction verification distinction that determines which kinds fit which tests, the solitary-vs-sociable test-shape trade-off, the under-use of fakes as the robust middle ground, the cost ledger of every double (divergence, maintenance, false confidence, fragility), and the heuristics for when to use a real collaborator instead of any double. Includes the connection to London/Detroit-school TDD and to the api-design surface that doubles often pressure.

## Philosophy of the skill
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/testing`
- Scope: Use when designing or reviewing test doubles — the stand-in objects that replace real collaborators in a test: the five-kind taxonomy (dummy, stub, spy, fake, mock) from Meszaros's xUnit Test Patterns, the difference between state verification (Detroit-school, classicist) and interaction verification (London-school, mockist) and how it determines which doubles fit, the cost of doubles (fragility, false confidence, divergence from real behavior), the role of fakes as the under-used middle ground, the verify_with relationship to test-driven-development, and the heuristics for when to use a real collaborator instead of any double. Do NOT use for choosing test levels or what to test (use testing-strategy), the design discipline of writing tests first (use test-driven-development), specific mocking-library API choice (library docs), or general production stubs and feature flags (use feature-gating or domain-specific skills).

**When to use**
- decide between a mock, a stub, and a fake for a database collaborator in a test
- explain why over-mocking produces fragile tests that change with every refactor
- diagnose a passing test that mirrors the implementation rather than specifying behavior
- design an in-memory fake for a repository interface that supports both classicist tests and integration tests
- Triggers: `should this be a mock or a stub`, `are we using mocks correctly`, `the test is brittle when I refactor`, `do we need a fake here`, `is this test really testing anything`

**Not for**
- decide which test levels (unit/integration/e2e) the project should invest in (use testing-strategy)
- set up a production feature flag (use feature-gating)
- configure a specific mocking library — Jest, Sinon, Mockito (library docs)

**Related skills**
- Verify with: `refactor`, `test-driven-development`
- Related: `api-design`, `type-safety`, `testing-strategy`, `test-driven-development`, `refactor`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A test double is to a unit under test what a Hollywood stunt-double is to a leading actor — the stunt-double looks like the actor enough that the camera believes the scene, performs the dangerous part the actor cannot or should not perform (slow networks, paid APIs, real emails), but is not the actor. The director's job is choosing the right kind of stunt-double for the scene: a dummy stands in the back of the shot (placeholder); a stub recites canned lines from off-camera (canned answers); a spy records which lines were spoken (call recording); a mock has a script that *fails the take* if the actor deviates (rigid interaction verification); a fake is a body-double trained to actually perform the action in a controlled way (working in-memory substitute). Casting mocks where a fake would do produces takes that pass when the stunt is performed exactly as written and fail catastrophically when the actor improvises a better line.
- Common misconception: |

**Keywords**
- `test double`, `mock`, `stub`, `spy`, `fake`, `dummy`, `test isolation`, `interaction verification`, `state verification`, `mockist`

<!-- skill-graph-context:end -->
