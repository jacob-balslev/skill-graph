---
name: property-based-testing
description: "Use when reasoning about tests that specify universal properties of code rather than specific input-output pairs: the forall(input) → property quantification, the generator/shrinker primitives that produce inputs and minimize failing cases, the four-rules-of-simple-design analog (commutativity, associativity, idempotence, round-trip, oracle, invariant), the difference between example-based tests (one input, one assertion) and property-based tests (many generated inputs, one universal claim), why property tests find bugs example tests don't, the shrinking discipline that produces minimal failing cases, and the trade-off between generator complexity and bug-finding capacity. Do NOT use for specifying one concrete behavior with one input (use example-based tests under testing-strategy), for fuzz-testing focused on crashes (use fuzz-testing), for mutation testing as a test-suite quality signal (use mutation-testing), or for model-based testing of state machines (use state-machine-modeling)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"test-driven-development\",\"testing-strategy\",\"type-safety\",\"mutation-testing\"],\"suppresses\":[\"testing-strategy\",\"mutation-testing\",\"type-safety\"],\"verify_with\":[\"testing-strategy\",\"mutation-testing\"]}"
  subject: quality-assurance
  public: "true"
  scope: "Use when reasoning about tests that specify universal properties of code rather than specific input-output pairs: the forall(input) → property quantification, the generator/shrinker primitives that produce inputs and minimize failing cases, the four-rules-of-simple-design analog (commutativity, associativity, idempotence, round-trip, oracle, invariant), the difference between example-based tests (one input, one assertion) and property-based tests (many generated inputs, one universal claim), why property tests find bugs example tests don't, the shrinking discipline that produces minimal failing cases, and the trade-off between generator complexity and bug-finding capacity. Do NOT use for specifying one concrete behavior with one input (use example-based tests under testing-strategy), for fuzz-testing focused on crashes (use fuzz-testing), for mutation testing as a test-suite quality signal (use mutation-testing), or for model-based testing of state machines (use state-machine-modeling)."
  taxonomy_domain: quality/testing
  stability: experimental
  keywords: "[\"property-based testing\",\"PBT\",\"QuickCheck\",\"Hypothesis\",\"fast-check\",\"generator\",\"shrinker\",\"forall\",\"invariant\",\"round-trip property\"]"
  triggers: "[\"should this be a property test\",\"what's an invariant for this function\",\"the bug only happens on weird inputs\",\"QuickCheck or fast-check\",\"how do we test all possible cases\"]"
  examples: "[\"design property-based tests for a sorting function that exercise the universal contract\",\"decide which functions in a parser deserve property tests vs example tests\",\"diagnose a property test that finds a real bug but the shrunk input is large — likely a poorly-shrinkable generator\",\"explain the round-trip property for an encode/decode pair\"]"
  anti_examples: "[\"specify one concrete input-output case (use example-based tests; see testing-strategy)\",\"fuzz for crashes and memory safety (use fuzz-testing)\",\"measure whether tests would catch a defect (use mutation-testing)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A property-based test is to an example test what an actuarial table is to a single insurance claim — the example tells you what happened in one case, the property tells you what must hold across the entire population; you do not learn that fire insurance is sound by inspecting one policy, you learn it from a contract that quantifies over every house ever insured."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/property-based-testing/SKILL.md
---

# Property-Based Testing

## Concept of the skill

Property-based testing changes the unit of specification from the example to the universal contract. The four primitives are: the *property* (a forall-quantified claim that must hold for all inputs in a domain), the *generator* (produces random inputs spanning the domain including its edges — empty, single-element, boundary values, Unicode pathologies), the *shrinker* (when the property fails, reduces the failing input to its minimal demonstration — without shrinking, a failing input is random noise; with shrinking, it is the smallest case that exhibits the bug), and the *trial budget* (how many inputs the framework tries before declaring the property held — 100 for cheap properties, 1000+ for slow code or rare-bug input spaces, nightly long-running campaigns for production-critical properties).

Replaces hand-written example sets with generative tests that exercise the *universal contract* of the code. Solves the limitation that example tests verify only the specific cases the author thought to write down — they miss the edge cases the author didn't think of, the combinations they couldn't enumerate, and the boundary conditions hidden in the input space. A well-designed property test exercises hundreds or thousands of inputs per run, including the edges humans systematically miss (empty collections, single-element collections, off-by-one boundaries, Unicode edge cases, integer overflow zones). When the bug is rare in the hand-written example space but findable in the generator's reach, property tests catch what examples cannot. Industrial validation: Hughes et al. (2016) caught real Dropbox synchronization bugs via PBT that example tests had not surfaced over years.

Distinct from testing-strategy, which owns the strategic question of what test levels to invest in — this skill is one tactical technique within the strategy, complementary to example-based tests, not a replacement. Distinct from mutation-testing, which measures whether the test suite catches code-level defects — the two compose: PBT tends to produce high-mutation-killing tests because universal properties are specific about behavior across many inputs; mutation testing then measures their effectiveness. Distinct from type-safety, which constrains the input space at compile time — stronger types reduce the property-test surface needed; PBT is most valuable where types alone cannot encode the invariants (algorithmic correctness, business rules, round-trips). Distinct from fuzz-testing, which asserts no-crash implicitly — PBT asserts an explicit property. Distinct from state-machine-modeling, which owns finite-state representation of workflows (stateful PBT is a related narrower technique). Distinct from test-driven-development, which can be done with either example or property tests (the schools and the unit-of-specification choice are orthogonal). A property-based test is to an example test what an actuarial table is to a single insurance claim — the example tells you what happened in one case, the property tells you what must hold across the entire population; you do not learn that fire insurance is sound by inspecting one policy, you learn it from a contract that quantifies over every house ever insured. The wrong mental model is that property tests *replace* example tests, or that any test with random input is a property test. They do not, and it is not. A test that runs `forall input in [single_value]` is an example test in property-test clothing. A "property" written after the fact to fit whatever the generator happens to produce is not a universal claim — it is whatever the generator's reach happens to be, which verifies nothing meaningful. Property tests are *complements* to example tests in a mature suite: properties for the universal contract; examples for specific cases that document particular behaviors or bug fixes. The discipline lives in *three* places simultaneously — the property must be universal, falsifiable, and meaningful (writing a property requires articulating the contract; if the contract is not articulable, PBT does not apply); the generator must produce inputs that cover the space *including the edges* (generators that produce only "typical" inputs miss bug-triggering edges by construction); the shrinker must reduce failing inputs to a minimal form (if the reported failure is a 500-element random list, the generator/shrinker pair is the bug, not the property). All three must be well-designed for PBT to deliver its promise.

## Coverage

The tactical testing technique in which a test specifies a universal property — a claim that must hold for all inputs in a domain — and a framework generates many random inputs to challenge the claim, shrinking any failing input to its minimal form. Covers the four primitives (property, generator, shrinker, trial budget), the three classical property shapes (invariant, oracle, round-trip) plus algebraic and metamorphic patterns, the QuickCheck heritage and the modern tool ecosystem (Hypothesis, fast-check, ScalaCheck, proptest, jqwik), the generator/shrinker discipline for domain types, and the integration of property tests with example tests in a test suite.

## Philosophy of the skill
Property-based testing changes the unit of specification from the example to the contract. An example test says "for this input, the output should be this." A property test says "for any input matching this generator, this universal claim holds." When the contract is articulable, a property test verifies far more of the behavior than a hand-written set of examples could; when the contract is not articulable, property tests are made up after the fact and verify whatever happens to be in the generator's reach, which is not useful.

The discipline is in three places: the property (is the claim universal, falsifiable, and meaningful?), the generator (does it produce inputs that cover the space, including the edges?), and the shrinker (when a property fails, can the framework reduce the failing input to something a developer can read?). All three must be well-designed for property-based testing to deliver its promise.

Property tests are complements to example tests, not replacements. The mature pattern is properties for the universal contract and examples for the specific cases that document particular behaviors or bug fixes.

## The Three Classical Property Shapes

| Shape | Pattern | Example |
|---|---|---|
| Invariant | The output has a structural property regardless of input | `forall L. isSorted(sort(L))` |
| Oracle | The output equals an alternative implementation's output | `forall L. fastSort(L) == referenceSort(L)` |
| Round-trip | A transformation and its inverse compose to identity | `forall x. decode(encode(x)) == x` |

Plus algebraic patterns (commutativity, associativity, identity, idempotence) and metamorphic patterns (relations between related inputs). Most useful property tests use one or two of these shapes.

## The Generator and Shrinker

A property test has two halves: the property and the generator. A well-designed generator produces inputs that exercise the input space — including edge cases (empty, single-element, boundary values), valid cases, and invalid cases as appropriate. A poorly-designed generator misses bug-triggering inputs and the property "passes" by not having been challenged.

The shrinker reduces a failing input to its minimal form. Without shrinking, a failing input is random noise. With shrinking, a failing input is the smallest demonstration of the bug — usually small enough that the bug is visible at a glance.

| Domain | Library-provided generator | Library-provided shrinker | Custom shrinker need |
|---|---|---|---|
| Primitive types (int, float, string, bool) | Yes | Yes | No |
| Collections (list, map, set) | Yes | Yes | No |
| Optional, Either, Result | Yes | Yes | No |
| Tuples and products | Yes | Yes | No |
| Custom domain types | Compose from primitives | Shrinks to component primitives | Sometimes — when domain has invariants |
| Grammar-based (valid JSON, SQL, email) | Some libraries provide | May need custom | Often yes |
| Stateful (sequences of operations) | Yes (PBT state-machine modes) | Yes | Custom for domain operations |

## Property vs Example — Where Each Fits

| Code character | Property test | Example test |
|---|---|---|
| Sorting, searching, data structure operations | Strong fit | For regression of specific bugs |
| Parsing / unparsing, encoding / decoding | Strong fit (round-trip) | For known-input regression |
| Pure mathematical functions | Strong fit | Rarely needed |
| Business rules with combinatorial input | Strong fit | For specific edge cases |
| API request/response round-trips | Strong fit | For known good/bad cases |
| Functions defined by a small list of cases | Weak fit — property unclear | Strong fit |
| Bug regression for a specific known input | Weak fit | Strong fit |
| Code with side effects / I/O | Adaptable via stateful PBT | Often easier |

A test suite typically mixes both; the right ratio depends on how much of the code has articulable universal contracts.

## Verification

After applying this skill, verify:
- [ ] Every property test asserts a *universal* claim, not a specific input-output. A test that runs `forall input in [single_value]` is an example test in property-test clothing.
- [ ] Each property fits one of the recognized shapes (invariant, oracle, round-trip, algebraic, metamorphic) or has a clearly-stated rationale for being a different shape.
- [ ] Generators for domain types are composed from library primitives; custom generators ship with custom shrinkers when default shrinking produces unintuitive minimal cases.
- [ ] Generator design produces both common and edge-case inputs. Generators that produce only "typical" inputs miss bug-triggering edge cases by construction.
- [ ] When a property fails, the reported failing input is the shrunk minimum — not a 500-element random list. If the shrunk input is large, the generator/shrinker pair needs work.
- [ ] Property tests are complemented by example tests for specific cases (bug regressions, documented behaviors). The suite is not property-only.
- [ ] Trial budgets are appropriate to the property: 100 inputs for cheap properties; 1000+ for properties on slow code or with rare-bug input spaces; nightly long-running campaigns for production-critical properties.
- [ ] PBT is applied where the contract is articulable. Functions that are genuinely defined by a list of cases are not force-fit to property tests.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Specifying one concrete input-output behavior | example tests (see `testing-strategy`) | examples specify particular behaviors; this skill specifies universal contracts |
| Generating random inputs to find crashes or memory-safety bugs | fuzz-testing skill | fuzzing asserts no-crash implicitly; this skill asserts an explicit property |
| Measuring whether the test suite catches deliberately-introduced defects | `mutation-testing` | mutation measures test-suite quality; PBT is one technique for producing high-mutation-killing tests |
| Constructing a state-machine model of the system under test | `state-machine-modeling` (when it exists) | state-machine modeling is its own discipline; stateful PBT is a related but narrower technique |
| Choosing test levels (unit/integration/e2e) | `testing-strategy` | testing-strategy owns level choices; this skill is a tactical technique within them |

## Key Sources

- Claessen, K., & Hughes, J. (2000). ["QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs"](https://www.cs.tufts.edu/~nr/cs257/archive/john-hughes/quick.pdf). *ICFP 2000*. The foundational paper introducing property-based testing as a discipline; the QuickCheck library it describes is the ancestor of every modern PBT library.
- Hughes, J. (2007). ["QuickCheck Testing for Fun and Profit"](https://link.springer.com/chapter/10.1007/978-3-540-69611-7_1). *PADL 2007*. The canonical practitioner-oriented introduction to property-based testing patterns.
- Hughes, J., et al. (2016). ["Mysteries of Dropbox: Property-Based Testing of a Distributed Synchronization Service"](https://ieeexplore.ieee.org/document/7515466). *ICST 2016*. Industrial case study showing PBT's effectiveness on a real distributed system.
- MacIver, D. R. ["Hypothesis — How does this work?"](https://hypothesis.works/articles/how-hypothesis-works/) and ["The shrinker is the Hypothesis"](https://hypothesis.works/articles/shrinking/). Modern PBT shrinker design; the strongest current open-source implementation.
- fast-check team. ["fast-check Documentation — Properties"](https://fast-check.dev/docs/core-blocks/properties/). Reference for the most-adopted PBT library in the JavaScript ecosystem.
- Arts, T., Hughes, J., Johansson, J., & Wiger, U. (2006). ["Testing telecoms software with Quviq QuickCheck"](https://dl.acm.org/doi/10.1145/1159789.1159792). *Erlang Workshop 2006*. Industrial PBT case study; a foundational reference for stateful property testing.
- Lampropoulos, L., Gallois-Wong, D., Hritcu, C., Hughes, J., Pierce, B. C., & Xia, L. (2017). ["Beginner's Luck: A Language for Property-Based Generators"](https://dl.acm.org/doi/10.1145/3009837.3009868). *POPL 2017*. Recent research on the generator/shrinker design problem.
- Fink, G., & Bishop, M. (1997). ["Property-based testing: a new approach to testing for assurance"](https://dl.acm.org/doi/10.1145/263244.263267). *ACM SIGSOFT Software Engineering Notes*, 22(4), 74-80. Earlier related thread on properties as a testing discipline.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/testing`
- Scope: Use when reasoning about tests that specify universal properties of code rather than specific input-output pairs: the forall(input) → property quantification, the generator/shrinker primitives that produce inputs and minimize failing cases, the four-rules-of-simple-design analog (commutativity, associativity, idempotence, round-trip, oracle, invariant), the difference between example-based tests (one input, one assertion) and property-based tests (many generated inputs, one universal claim), why property tests find bugs example tests don't, the shrinking discipline that produces minimal failing cases, and the trade-off between generator complexity and bug-finding capacity. Do NOT use for specifying one concrete behavior with one input (use example-based tests under testing-strategy), for fuzz-testing focused on crashes (use fuzz-testing), for mutation testing as a test-suite quality signal (use mutation-testing), or for model-based testing of state machines (use state-machine-modeling).

**When to use**
- design property-based tests for a sorting function that exercise the universal contract
- decide which functions in a parser deserve property tests vs example tests
- diagnose a property test that finds a real bug but the shrunk input is large — likely a poorly-shrinkable generator
- explain the round-trip property for an encode/decode pair
- Triggers: `should this be a property test`, `what's an invariant for this function`, `the bug only happens on weird inputs`, `QuickCheck or fast-check`, `how do we test all possible cases`

**Not for**
- specify one concrete input-output case (use example-based tests; see testing-strategy)
- fuzz for crashes and memory safety (use fuzz-testing)
- measure whether tests would catch a defect (use mutation-testing)

**Related skills**
- Verify with: `testing-strategy`, `mutation-testing`
- Related: `test-driven-development`, `testing-strategy`, `type-safety`, `mutation-testing`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A property-based test is to an example test what an actuarial table is to a single insurance claim — the example tells you what happened in one case, the property tells you what must hold across the entire population; you do not learn that fire insurance is sound by inspecting one policy, you learn it from a contract that quantifies over every house ever insured.
- Common misconception: |

**Keywords**
- `property-based testing`, `PBT`, `QuickCheck`, `Hypothesis`, `fast-check`, `generator`, `shrinker`, `forall`, `invariant`, `round-trip property`

<!-- skill-graph-context:end -->
