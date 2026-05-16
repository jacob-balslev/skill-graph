---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: property-based-testing
description: "Use when reasoning about tests that specify universal properties of code rather than specific input-output pairs: the forall(input) → property quantification, the generator/shrinker primitives that produce inputs and minimize failing cases, the four-rules-of-simple-design analog (commutativity, associativity, idempotence, round-trip, oracle, invariant), the difference between example-based tests (one input, one assertion) and property-based tests (many generated inputs, one universal claim), why property tests find bugs example tests don't, the shrinking discipline that produces minimal failing cases, and the trade-off between generator complexity and bug-finding capacity. Do NOT use for specifying one concrete behavior with one input (use example-based tests under testing-strategy), for fuzz-testing focused on crashes (use fuzz-testing), for mutation testing as a test-suite quality signal (use mutation-testing), or for model-based testing of state machines (use state-machine-modeling)."
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
  - property-based testing
  - PBT
  - QuickCheck
  - Hypothesis
  - fast-check
  - generator
  - shrinker
  - forall
  - invariant
  - round-trip property
  - oracle property
  - random testing
  - generative testing
triggers:
  - "should this be a property test"
  - "what's an invariant for this function"
  - "the bug only happens on weird inputs"
  - "QuickCheck or fast-check"
  - "how do we test all possible cases"
examples:
  - "design property-based tests for a sorting function that exercise the universal contract"
  - "decide which functions in a parser deserve property tests vs example tests"
  - "diagnose a property test that finds a real bug but the shrunk input is large — likely a poorly-shrinkable generator"
  - "explain the round-trip property for an encode/decode pair"
anti_examples:
  - "specify one concrete input-output case (use example-based tests; see testing-strategy)"
  - "fuzz for crashes and memory safety (use fuzz-testing)"
  - "measure whether tests would catch a defect (use mutation-testing)"
relations:
  related:
    - testing-strategy
    - test-driven-development
    - type-safety
    - mutation-testing
  boundary:
    - skill: testing-strategy
      reason: "testing-strategy owns the strategic question of what test levels to invest in; this skill owns one tactical technique (generative tests with universal properties) within that strategy. Property-based testing is a complement to example-based tests, not a replacement."
    - skill: mutation-testing
      reason: "mutation-testing measures whether the test suite catches code-level defects; property-based testing is one source of high-mutation-killing tests because universal properties tend to be specific about behavior across many inputs. They compose: PBT writes the tests; mutation testing measures their effectiveness."
    - skill: type-safety
      reason: "type-safety constrains the input space at compile time; property-based testing samples the runtime input space within the type-constraint envelope. Stronger types reduce the property-test surface needed; PBT is most valuable where types alone cannot encode the invariants (algorithmic correctness, business rules, round-trips)."
  verify_with:
    - testing-strategy
    - mutation-testing
concept:
  definition: "Property-based testing is a tactical technique in which a test specifies a universal property — a claim that must hold for all inputs in a domain — and a test framework generates many random inputs in the domain and checks the property holds. When the property fails on some input, the framework shrinks the input to the smallest failing case to make the bug legible. The unit of specification is a forall-quantified claim, not a single example. Properties typically take three shapes: invariants (a property the output must always have, independent of the input), oracles (the output must equal what an alternative implementation computes), and round-trips (encoding then decoding produces the original value). Property-based testing supplements example-based testing rather than replacing it: examples specify particular behaviors; properties specify the universal contract."
  mental_model: |
    Five primitives structure property-based testing:

    1. **The property** — a universal claim about the system under test, expressed as `forall input in Domain. P(input, output)`. Examples: `forall list L. reverse(reverse(L)) == L` (round-trip); `forall list L. sorted(sort(L))` (invariant); `forall list L. sort(L) == naiveSort(L)` (oracle); `forall n: nat. n + 0 == n` (algebraic identity). The property is what the test asserts; the framework's job is to challenge it with many inputs.

    2. **The generator** — the procedure that produces random values in the input domain. A generator for `list of int` produces random lists of random integers; a generator for `email address` produces strings matching the email grammar; a generator for `binary tree of bool` produces random trees. Generators compose: a generator for `(list of int, sort order)` is the product of a list-of-int generator and a sort-order generator. The quality of the generator determines the quality of the test — a generator that produces only short lists never finds bugs that need long lists; a generator that produces only valid emails never tests the parser's rejection of invalid ones.

    3. **The shrinker** — when a property fails on some input, the framework attempts to find a smaller failing input that still triggers the failure. A failing test on `[7, 3, -2, 9001, 4]` shrinks to `[1, 0]` if `[1, 0]` also fails, then to `[1]` if `[1]` fails, then to `[]` if `[]` fails. The shrunk input is what the developer sees. Shrinking is the property-based testing innovation that makes the technique practical: without shrinking, the reported failing input is random noise; with shrinking, the reported failing input is the minimum demonstration of the bug.

    4. **The trial budget** — the number of random inputs the framework tries per property. Standard defaults are 100-1000 inputs per property. Higher budgets find more bugs at higher CI cost. The technique's bug-finding rate is approximately the probability of generating a triggering input times the trial budget; rare bugs require either smarter generators (biased toward likely-triggering inputs) or larger budgets.

    5. **The three property shapes** — most useful properties fall into one of three patterns. **Invariants**: the output has some structural property regardless of input (`isSorted(sort(L))`, `length(reverse(L)) == length(L)`, `valid(parse(s))` for any output of a known-good generator). **Oracles**: the output of the system under test equals the output of an alternative implementation (`fastSort(L) == referenceSort(L)`, `optimizedFunction(x) == naiveFunction(x)`). **Round-trips**: a transformation and its inverse compose to the identity (`decode(encode(x)) == x`, `parse(unparse(t)) == t`, `serialize(deserialize(b)) == b` for any deserializable bytes).

    The deep insight is that **property-based testing changes the unit of specification from the example to the contract**. An example test says "for *this* input, the output should be *this*"; a property test says "for *any* input matching this generator, this universal claim holds." When the contract is articulable, a property test verifies far more of the behavior than a hand-written set of examples could. When the contract is not articulable — when the function is genuinely defined by a list of cases — property testing has nothing useful to add and example testing is the right form.

    The complementary insight is that **shrinking is what makes the technique humane**. Without shrinking, a property test reports failure on a 500-element random list with arbitrary values, and the developer must reduce by hand. With shrinking, the framework reports the minimal failing case, often a 1- or 2-element list, and the bug is usually visible at a glance.
  purpose: |
    Property-based testing exists because example-based tests have three limitations that property tests address.

    **The blind spot of the examples chosen.** A test suite written by a developer reflects the cases the developer thought of. The cases the developer didn't think of — empty inputs, single-element edge cases, inputs with duplicates, inputs at type boundaries (max int, min int, NaN, infinity), inputs with surprising characters (unicode, zero-width spaces, RTL marks), inputs the developer doesn't realize are possible — are unverified. Property tests find these blind spots by generating inputs the developer would not have written, including the ones that trigger bugs.

    **The scaling of test count to behavior.** Example tests scale linearly with the number of behavioral facets the developer chooses to specify. A function with five edge cases and one happy path needs six example tests to cover them. A property test with a well-designed generator covers the entire input space with one property, finding edge cases the developer didn't write tests for *and* edge cases the developer didn't know existed.

    **The expressiveness of the contract.** Some behaviors are naturally expressed as universal claims (sort produces sorted output; reverse-of-reverse is identity; serialization round-trips) and awkwardly as examples (do you write 50 example tests for sort? They all reduce to the same property). Property tests let the contract be the test, which is closer to how the developer mentally specified the function in the first place.

    There is a fourth, more philosophical purpose: property-based testing forces the developer to articulate what the function *actually does* in universal terms. The act of writing a property is the act of making the function's contract explicit. A developer who cannot write a property for their function may not actually know what the function should do across the input space. The discipline of property thinking is itself a design tool.

    The cost of property-based testing is real. Generators must be written (for primitive types, the library provides them; for domain types, the developer writes them). Generators must be tuned (a generator that produces 99% trivial inputs finds 1% of bugs). Shrinkers must be tuned (a generator without a corresponding shrinker reports random noise as failing inputs). Property tests run slower than example tests because they execute the property hundreds or thousands of times. The technique pays back the cost on code where the contract is articulable and the input space is large or surprising — parsers, codecs, sort/search algorithms, data structures, anything mathematical, anything format-handling, any business rule with combinatorial input — and pays back less on code where the function is genuinely defined by a small list of cases.

    The deeper purpose is to find bugs no human would have written a test for. The bugs property-based testing finds are typically the ones a code review would not catch, an example test would not catch, and a fuzzer might catch but with random-noise output that the developer would discount. The combination of universal claim and minimal failing case is what makes property-based testing distinctive: it finds bugs *and* makes them legible.
  boundary: |
    **Property-based testing is not random testing.** Random testing throws random inputs at the system and looks for crashes; property-based testing checks specific universal claims against generated inputs. The distinction is the property: a random test verifies no property (the test "passes" if the program doesn't crash); a property test verifies a stated claim and fails when the claim is violated, regardless of crash status.

    **Property-based testing is not fuzz testing.** Fuzzing is a specific application of generative input techniques to find crashes, security vulnerabilities, or memory-safety violations. The "property" being checked is usually implicit (no crash). Property-based testing's properties are explicit and substantive (the output is sorted; the round-trip is identity; the output of A equals the output of B). The techniques overlap; the disciplines are distinguished by what they assert.

    **Property-based testing does not replace example tests.** Example tests are still valuable for specifying particular behaviors, including bug-fix regressions ("when input X arrives, output Y should result, because of bug #1234"). Properties cannot easily encode "this specific input is special." A test suite typically mixes: properties for the universal contract, examples for the specific cases that exercise edge conditions or document bug fixes.

    **Property-based testing is not model-based testing.** Model-based testing constructs a state-machine model of the system under test and explores it for inconsistencies; property-based testing checks claims about input-output behavior. The techniques overlap when the property is "the system's actual state matches the model's predicted state after each operation" — at that point property-based testing has become model-based testing. Most working property tests are not state-machine-shaped.

    **A property test is not a test that runs many times.** A test that runs the same example 100 times is not a property test. A property test runs *the same property* across many *different* generated inputs. The variation is in the input, not the iteration count.

    **A failing property test on a random-looking input is not random noise.** When the shrinker is well-designed, the reported failing input is the minimal demonstration of the bug. When the shrinker is poorly-designed (or the generator doesn't compose well with the shrinker), the reported failing input may be large and inscrutable — but that's a shrinker quality problem, not an inherent property-test problem. Treating large failing inputs as "the framework's fault" misses the bug; the right response is to improve the generator/shrinker until shrinks are minimal.

    **Property-based testing is not exhaustive.** It is sampling. The probability of finding a rare bug is approximately (probability of generating a triggering input) × (trial budget). For rare bugs the technique can miss them on a given run and find them on the next. This is sometimes treated as a weakness; it is actually the same property as any non-exhaustive testing technique. The mitigation is biased generators (more likely to produce triggering inputs) and longer-running test campaigns in CI.

    **Property-based testing requires a property.** Code that genuinely cannot be characterized by a universal claim — a function whose behavior is a list of disconnected cases, a function with intentionally arbitrary outputs — is not a good fit for property testing. The discipline assumes the contract is articulable; when it isn't, property tests are made up after the fact and verify whatever happens to be in the generator's reach, which is not useful.

    **A high property-test count is not a quality signal in itself.** Ten property tests with weak properties (`forall x. f(x) does not throw`) are less valuable than two property tests with strong properties (`forall L. isSorted(sort(L)) && multiset(L) == multiset(sort(L))`). The strength of the asserted property determines the test's value; the count says nothing.
  taxonomy: |
    By property shape:
    - **Invariant** — the output has some structural property regardless of input. Common: `isSorted(sort(L))`, `length(reverse(L)) == length(L)`, `count(L, x) == count(reverse(L), x)`, `parse(unparse(t)) is valid`.
    - **Oracle** (sometimes "alternative implementation" or "test oracle") — the system under test equals an alternative implementation. Common: `fastSort(L) == referenceSort(L)`, `optimizedFunction(x) == naiveFunction(x)`, `parallelImpl(x) == sequentialImpl(x)`.
    - **Round-trip** — a transformation and its inverse compose to identity. Common: `decode(encode(x)) == x`, `deserialize(serialize(t)) == t`, `decompress(compress(b)) == b`.
    - **Algebraic** — properties from algebra: commutativity (`add(a,b) == add(b,a)`), associativity (`add(add(a,b),c) == add(a,add(b,c))`), identity (`add(x, 0) == x`), idempotence (`f(f(x)) == f(x)` for normalize, sort, etc.), inverse (`f(g(x)) == x`).
    - **Metamorphic** — relations between related inputs: `sort(L ++ L) is L sorted with each element doubled`, `f(2x) == 2 * f(x)` for linear functions.
    - **Bounded** — properties that hold within bounds the generator respects: `forall L with length < 1000. f(L) terminates within 1 second`.

    By generator type:
    - **Library-provided primitive generators** — int, float, string, bool, list, map, optional. Provided by every PBT library.
    - **Composed generators** — products, sums, filters, maps over primitive generators. Compose to domain types.
    - **Custom domain generators** — for application-specific types (User, Order, Tree, AST). Written by the developer using composition.
    - **Biased generators** — generators that over-represent edge cases (empty, single-element, near-boundary values) to increase the bug-finding rate.
    - **Grammar-based generators** — generators that produce values matching a grammar (valid JSON, valid SQL, valid email addresses). Useful for parser testing.
    - **Stateful / state-machine generators** — generate sequences of operations against a stateful system; useful for testing data structures, databases, and concurrency.

    By shrinking strategy:
    - **Shrink by reducing size** — smaller lists, shorter strings, simpler trees.
    - **Shrink by simplifying values** — fewer distinct values, smaller numeric magnitudes, simpler structures.
    - **Shrink by structure-preserving simplification** — for ADT generators that need shrinking to remain in the type's domain.
    - **Custom shrinkers** — when default library shrinkers produce unintuitive minimal cases.

    By trial-budget management:
    - **Fixed budget per property** — 100-1000 inputs per run. Library default.
    - **Time-bounded** — run the property for N seconds and report results.
    - **Bug-budget** — run until a bug is found or until N inputs exhausted.
    - **Adaptive** — increase trials on properties that have historically been flaky; decrease on stable ones.

    By tool ecosystem:
    - **QuickCheck** (Haskell; Claessen & Hughes 2000) — the original.
    - **Hypothesis** (Python) — modern, sophisticated shrinker, good ergonomics.
    - **fast-check** (TypeScript/JavaScript) — production-grade PBT for the JS ecosystem.
    - **ScalaCheck** (Scala) — JVM port of QuickCheck.
    - **PropEr** (Erlang) — well-regarded for stateful and concurrent systems.
    - **proptest** (Rust) — Rust ecosystem; sophisticated shrinker.
    - **jqwik** (Java) — modern Java PBT framework.
    - **FsCheck** (.NET) — .NET ecosystem.
  analogy: |
    A bridge inspector checking a load-bearing claim. The example-test inspector parks one specific truck on the bridge, measures the deflection, and confirms it is within spec. The property-test inspector parks one hundred different trucks — light trucks, heavy trucks, empty trucks, fully loaded trucks, trucks with off-center loads, trucks at the edge of the bridge, trucks at the center — and verifies the deflection-within-spec property holds for every one.

    The example inspection certifies one truck against the bridge. The property inspection certifies the bridge's design against a class of trucks. If a particular truck type triggers a failure — say, a tanker with sloshing fluid — the inspector finds it because the property test sampled the input space; the example test would have missed it unless the inspector happened to think of tankers.

    The shrinker is the inspector's habit, after finding a failing truck, of progressively unloading it: remove half the cargo and re-test; if still failing, remove half again; if no longer failing, restore some and try a different configuration. The reported failing case is the lightest version of the truck that still breaks the bridge. This is what makes the failure legible — "the bridge breaks under a 2-ton truck centered at midspan" is debuggable; "the bridge breaks under this random 47-ton truck with a specific cargo manifest" is not.

    The generator is the inspector's catalog of truck types. A generator that only knows about delivery vans never finds the bug that requires a tanker; a generator that produces tankers, semis, double-trailers, and one-off oddities samples the input space adequately.

    The property is the inspector's actual claim — "no truck under 30 tons centered on the bridge produces deflection over X centimeters." Without that claim, the inspection has no pass/fail criterion; with it, the inspection has a falsifiable verdict on every truck tried.

    A bridge designer who can articulate the property has a buildable specification; a designer who cannot has a sketch. Property-based testing is the engineering practice of writing specifications in the form a sampling-based inspection can verify.
  misconception: |
    The most common misconception is that **property-based testing replaces example-based testing**. It does not. Examples specify particular behaviors (this input → this output, often documenting a bug fix or a specific user case); properties specify universal claims. A good test suite mixes both — properties for the contract, examples for the cases that need specific documentation. Treating PBT as a replacement loses the documentary value of example tests.

    The second misconception is that **property-based testing is random testing**. It is not. Random testing throws random inputs without explicit assertions and looks for crashes; property-based testing asserts a stated universal claim and checks generated inputs against it. The property is the test; the generation is the technique.

    The third misconception is that **good property tests are easy to write**. Some are (round-trips, invariants on standard data structures) and some are not (algorithmic correctness without an oracle, business rules with subtle dependencies). When the property is hard to articulate, the function may be defined by a list of cases rather than a contract, and example tests are the right form. The discipline of property thinking distinguishes "the function has a contract I haven't articulated yet" from "the function does not have a contract."

    The fourth misconception is that **a failing property test reports a useful failing input**. It does, *if* the shrinker is well-designed for the generator. If the generator produces complex domain values and the shrinker doesn't know how to reduce them, the reported failing input is large and inscrutable. Library-provided generators ship with library-provided shrinkers; custom domain generators require custom shrinkers, and a generator without a corresponding shrinker is a half-built tool that reports noise.

    The fifth misconception is that **trial budgets of 100 are enough**. They are enough for high-probability bugs (the bug is reachable from a significant fraction of the input space). For low-probability bugs (specific corner cases, rare combinations), higher budgets — thousands per property, run nightly rather than per-PR — are required. The relationship between trial budget and bug-finding rate is one of probability, not certainty.

    The sixth misconception is that **property-based testing is exhaustive**. It is not. It is sampling. A property test that passes on 1000 inputs has demonstrated that 1000 specific inputs satisfy the property; it has not proven the property over the entire input domain. For exhaustive verification, formal methods (model checking, theorem proving) are the appropriate technique. Property-based testing is a stronger empirical signal than example testing, not a proof.

    The seventh misconception is that **PBT is just for academic / algorithmic code**. It is most natural there (sort, search, parse, encode are textbook examples) but it applies to business rules (discount calculation, eligibility logic, pricing rules), API request/response round-trips, state-machine transitions, configuration validation, and almost any deterministic function with an articulable contract. Limiting PBT to algorithmic code misses much of its value.

    The eighth misconception is that **a generator that produces "valid" inputs is good**. Often it is too narrow. Property tests find bugs by exploring the input space, including the boundary between valid and invalid. A generator that produces only well-formed inputs misses bugs that arise on malformed inputs the parser is supposed to reject. The discipline is to generate broadly and assert the right property: "for any valid input, behavior X; for any invalid input, rejection with error Y."

    The ninth misconception is that **the shrunk failing input is the root cause**. It is the minimum demonstration of the bug, not necessarily a description of the bug's mechanism. The developer still has to look at the shrunk input, understand why it fails, and trace the failure to the production code. PBT makes the bug legible; it does not interpret the bug.
---

# Property-Based Testing

## Coverage

The tactical testing technique in which a test specifies a universal property — a claim that must hold for all inputs in a domain — and a framework generates many random inputs to challenge the claim, shrinking any failing input to its minimal form. Covers the four primitives (property, generator, shrinker, trial budget), the three classical property shapes (invariant, oracle, round-trip) plus algebraic and metamorphic patterns, the QuickCheck heritage and the modern tool ecosystem (Hypothesis, fast-check, ScalaCheck, proptest, jqwik), the generator/shrinker discipline for domain types, and the integration of property tests with example tests in a test suite.

## Philosophy

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
