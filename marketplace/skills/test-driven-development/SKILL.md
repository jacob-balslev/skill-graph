---
name: test-driven-development
description: "Use when reasoning about Test-Driven Development as a design discipline rather than a workflow: the red-green-refactor cycle as a feedback loop, the difference between London-school (outside-in, interaction-heavy, mock-driven) and Detroit-school (inside-out, state-heavy, classicist) TDD, the role of TDD as a design tool (how tests pressure code into more decomposable shapes), the connection between TDD and emergent design, the boundary between TDD and prior-test-suites, why TDD's failure mode is not 'no tests' but 'tests that mirror implementation', and the empirical record of TDD's effects on defect density, design quality, and development velocity. Do NOT use for the strategy of what to test at which level (use testing-strategy), the construction of test doubles (use test-doubles-design), the discipline of LLM eval iteration (use eval-driven-development), or general-software process workflow (use the obra/superpowers test-driven-development workflow skill — this skill is the concept-shape complement)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: quality
  domain: quality/testing
  scope: reference
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"test-driven development\",\"TDD\",\"red green refactor\",\"London school\",\"Detroit school\",\"Chicago school\",\"outside-in TDD\",\"inside-out TDD\",\"mockist\",\"classicist\",\"emergent design\",\"test-first\",\"design pressure\",\"GOOS\"]"
  triggers: "[\"should we write tests first\",\"are mocks ruining the design\",\"is TDD worth it\",\"London school vs Detroit school\",\"the tests changed every refactor\"]"
  examples: "[\"explain why writing the test first changes the design of the code under test\",\"decide between London-school (mocks-as-design) and Detroit-school (state-verification) TDD for a new module\",\"diagnose why the test suite is fragile under refactor — likely over-mocked interaction tests\",\"explain why high test coverage with TDD is a side effect, not the goal\"]"
  anti_examples: "[\"construct a mock, stub, or spy (use test-doubles-design)\",\"decide what test levels (unit/integration/e2e) to invest in (use testing-strategy)\",\"iterate on LLM behavior using an eval suite (use eval-driven-development)\"]"
  relations: "{\"related\":[\"testing-strategy\",\"test-doubles-design\",\"eval-driven-development\",\"refactor\",\"type-safety\"],\"boundary\":[{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy owns the question 'what should we test, at which level, with what evidence' for a given change; this skill owns the design discipline of writing the test before the code that satisfies it. The two compose — testing-strategy decides the surface; TDD prescribes the rhythm — but they answer different questions.\"},{\"skill\":\"test-doubles-design\",\"reason\":\"test-doubles-design owns mocks/stubs/fakes/spies as a construct; this skill owns the discipline that places them (London-school heavily, Detroit-school lightly). The schools differ on how much test-doubles design matters to the practice.\"},{\"skill\":\"eval-driven-development\",\"reason\":\"eval-driven-development owns the LLM analog of TDD where the unit of judgment is pass-rate over a sample rather than binary per-test pass/fail. The disciplines share the iteration-first-then-implement spirit but the math underneath differs.\"},{\"skill\":\"refactor\",\"reason\":\"refactor owns behavior-preserving structural change; this skill prescribes refactor as the third beat of red-green-refactor. The skills compose: TDD calls refactor on every green; refactor owns how to do it without breaking behavior.\"}],\"verify_with\":[\"testing-strategy\",\"refactor\"]}"
  concept: "{\"definition\":\"Test-Driven Development is a software design discipline in which the test for a behavior is written before the production code that satisfies the test, then production code is written until the test passes, then the code is restructured to improve its shape while the test continues to pass. The cycle — red (failing test), green (passing test), refactor (clean code, still passing) — is the unit of work, and the test suite is the design pressure that shapes the production code. TDD is not 'writing tests first' as a procedural rule; it is using the act of writing a test as the moment to design the interface, decompose the responsibility, and discover what the code should be. The tests are a beneficial side effect of doing design through the test-writing lens; mistaking the side effect for the purpose is the most common failure mode.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/test-driven-development/SKILL.md
---

# Test-Driven Development

## Coverage

The design discipline of writing the test before the production code that satisfies it, using the test-writing pressure to shape the code's design, and applying the red-green-refactor cycle as the unit of work. Covers the cycle structure (red → green → refactor), the design-pressure mechanism that makes TDD a design discipline rather than just a test-first habit, the London/Detroit/Chicago school distinctions (mockist vs classicist, outside-in vs inside-out, interaction vs state), the relationship between TDD and emergent design, the empirical record (Nagappan 2008 at Microsoft/IBM and meta-analyses since), the boundary between TDD and BDD, and the failure modes (skipping refactor, ignoring design pressure, mock-heavy fragile tests, coverage-as-goal Goodharting).

## Philosophy

TDD is design through the test-writing lens. Every test you sit down to write is a moment of design: what is this unit, what does it own, what does it delegate, what does its interface look like from the outside. The discomfort of writing a hard-to-test piece of code is the same discomfort that will eventually arrive as hard-to-use, hard-to-maintain, hard-to-compose code; TDD makes that discomfort visible at the moment when correcting it is cheap.

The tests are not the point. The tests are an artifact of doing design with a test-shaped tool. A team that "does TDD" by writing tests first without heeding the design pressure has the artifact without the practice; they will conclude TDD doesn't work because they will see only the cost (slower initial development) without the benefit (better-shaped code with lower defect density).

The schools matter. London and Detroit produce different code under the same red-green-refactor cycle, because they apply the design pressure to different surfaces. A practitioner who has not chosen a school has chosen by accident, and the test suite's character — interaction-heavy or state-heavy, mock-rich or mock-sparse, outside-in or inside-out — reveals which they chose without knowing.

## The Cycle In Detail

| Beat | Activity | Stop condition | Common mistake |
|---|---|---|---|
| Red | Write one failing test for one increment of desired behavior | The test compiles and fails for the right reason (not a syntax error) | Writing a passing test (no design pressure); writing many tests at once (loses the increment) |
| Green | Write the smallest production change that makes the test pass | The test passes; no other tests broke | Writing more than needed; "fake it till you make it" abandoned too early |
| Refactor | Improve the shape of both code and test while keeping all tests passing | The structure is cleaner; tests still pass | Skipping this beat; refactoring into bigger changes that break tests |

Each cycle should fit in a few minutes — long cycles indicate either insufficient test granularity or production complexity that should be decomposed before continuing.

## London School vs Detroit School — A Practical Comparison

| Property | London (mockist, outside-in) | Detroit (classicist, inside-out) |
|---|---|---|
| Origin | Freeman & Pryce, *GOOS* (2009) | Beck, *TDD by Example* (2002) |
| Starting point | Acceptance test or service boundary | A single concrete unit |
| Test focus | Interactions (who called whom with what) | Observable state changes |
| Test doubles | Central — every new collaborator becomes a mock | Sparse — used only when needed (DB, external service) |
| Design pressure | On collaborator interfaces (the mocks shape them) | On units' responsibilities and state shape |
| Failure mode | Tests mirror implementation; refactor breaks them | State assertions get coarse; design coupling grows |
| Typical codebase | Many small classes with well-defined collaboration roles | Fewer larger classes with rich state |

A practical heuristic: London-school suits services with rich collaboration (microservices, hexagonal architectures); Detroit-school suits state-rich domains (calculators, domain logic, parsers). Hybrid is the working norm.

## The Empirical Record

Multiple controlled studies and one large industrial study converge on a consistent finding: TDD codebases have lower defect density at the cost of slightly longer initial development time.

| Study | Finding |
|---|---|
| Nagappan et al. (2008) at Microsoft and IBM | TDD teams had 40-90% lower defect density; 15-35% longer initial development time |
| Erdogmus et al. (2005) controlled experiment | TDD subjects had higher external code quality; productivity comparable |
| Janzen & Saiedian (2008) meta-analysis | Code complexity reduced; cohesion improved; coupling reduced under TDD |
| Bissi et al. (2016) systematic review | 27 of 39 studies showed TDD improved internal quality; 18 of 23 showed external quality improvement |

The trade is well-documented. Teams abandoning TDD often do so on the visible-cost side (the time spent writing tests) without measuring the invisible-saving side (defects not encountered, rework not required).

## Verification

After applying this skill, verify:
- [ ] Every increment of production code is preceded by a failing test that describes the behavior, not the implementation. If code was written before the test, the test is regression coverage, not TDD-born specification.
- [ ] Each cycle includes a refactor beat. Cycles that go red → green → next-red are test-first development, not TDD.
- [ ] The school being practiced (London / Detroit / hybrid) is intentional, not accidental. The test suite's character (mock-rich vs state-rich) reveals which school is in use.
- [ ] When a test is hard to write, the design is examined. Hard-to-test code is the design-pressure signal; ignoring it (with test-only hooks, exposed internals, or stretched test boundaries) defeats the discipline.
- [ ] Test names describe behaviors at the unit's natural boundaries — "calculates total with discount applied," not "tests `calculateTotal()` line 17."
- [ ] Coverage is treated as a side effect, not a target. The discipline is the goal; coverage emerges from doing it.
- [ ] The cycle's granularity stays small. Cycles that run hours indicate either over-large tests or under-decomposed production code.
- [ ] For research/spike work where the target is unclear, exploration is allowed before TDD applies. The discipline is not universally appropriate.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Choosing what to test, at which level, with what evidence | `testing-strategy` | testing-strategy owns the strategic-level decision; this skill owns the tactical design discipline |
| Constructing a mock, stub, fake, or spy | `test-doubles-design` | test-doubles-design owns the constructs; this skill owns the discipline that places them |
| Iterating on LLM behavior using an eval suite | `eval-driven-development` | eval-driven-development is the LLM analog with statistical (not binary) judgment |
| Performing a behavior-preserving structural change | `refactor` | refactor owns the technique; this skill calls it as the third beat |
| Process workflow guidance for a TDD session | the obra/superpowers `test-driven-development` skill on skills.sh | that skill is the workflow-shape complement; this one is concept-shape |

## Key Sources

- Beck, K. (2002). *Test-Driven Development: By Example*. Addison-Wesley. The canonical book on Detroit-school TDD; defines red-green-refactor and the discipline's core form.
- Freeman, S., & Pryce, N. (2009). *Growing Object-Oriented Software, Guided by Tests* (GOOS). Addison-Wesley. The canonical book on London-school TDD; defines outside-in mock-driven development.
- Nagappan, N., Maximilien, E. M., Bhat, T., & Williams, L. (2008). ["Realizing quality improvement through test driven development: results and experiences of four industrial teams"](https://link.springer.com/article/10.1007/s10664-008-9062-z). *Empirical Software Engineering*, 13(3), 289-302. The Microsoft/IBM industrial study showing 40-90% defect-density reduction.
- Erdogmus, H., Morisio, M., & Torchiano, M. (2005). ["On the effectiveness of the test-first approach to programming"](https://ieeexplore.ieee.org/document/1423994). *IEEE Transactions on Software Engineering*, 31(3), 226-237. Controlled experiment on TDD's productivity and quality effects.
- Janzen, D., & Saiedian, H. (2008). ["Does Test-Driven Development Really Improve Software Design Quality?"](https://ieeexplore.ieee.org/document/4493089). *IEEE Software*, 25(2). Meta-analysis on TDD's effect on code complexity, cohesion, and coupling.
- Bissi, W., Serra Seca Neto, A. G., & Emer, M. C. F. P. (2016). ["The effects of test driven development on internal quality, external quality and productivity: A systematic review"](https://www.sciencedirect.com/science/article/abs/pii/S0950584916300903). *Information and Software Technology*, 74, 45-54. Systematic review of 27 controlled studies.
- Fowler, M. (2007). ["Mocks Aren't Stubs"](https://martinfowler.com/articles/mocksArentStubs.html). Practitioner-focused explanation of the London/Detroit school distinction and its consequences.
- North, D. (2006). ["Introducing BDD"](https://dannorth.net/introducing-bdd/). The origin essay for Behavior-Driven Development as a vocabulary and tooling layer above TDD.
