---
name: test-coverage-strategy
description: "Use when reasoning about code coverage as a strategic measurement rather than a quality target: structural reach versus behavioral verification (covered vs tested), the coverage-criterion hierarchy (function, line, branch, decision, condition, MC/DC, path) and matching the criterion to where a module's failure modes hide, Marick's floor-vs-ceiling distinction, Goodhart's Law applied to coverage and Goodhart-resistant policy (diagnostic use, diff/patch floors, risk-weighting, behavioral panels), denominator hygiene and cross-tool counter semantics, safety-critical MC/DC (DO-178C Level A required; ISO 26262 ASIL-D highly recommended) as requirements-based evidence, and interpreting coverage from AI-generated tests. Do NOT use for choosing test levels (use testing-strategy), mutation testing as a behavioral signal (use mutation-testing), test-double construction (use test-doubles-design), LLM eval iteration (use eval-driven-development), or specific coverage-tooling configuration (tool docs)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"eval-driven-development\",\"testing-strategy\",\"mutation-testing\",\"test-driven-development\",\"test-doubles-design\",\"best-practice\"],\"suppresses\":[\"mutation-testing\",\"testing-strategy\",\"test-driven-development\"],\"verify_with\":[\"testing-strategy\",\"mutation-testing\"]}"
  subject: quality-assurance
  public: "true"
  scope: "Use when reasoning about code coverage as a strategic measurement rather than a target: the coverage-criterion hierarchy (function, statement, line, branch, decision, condition, MC/DC, path) and choosing the criterion that matches the code's failure modes, Marick's distinction between coverage as a floor signal and coverage as a ceiling target, Goodhart's Law applied to coverage metrics and Goodhart-resistant policy design, the covered-vs-tested distinction, denominator hygiene and cross-tool counter semantics, diff/patch coverage as a changed-code floor, the safety-critical industry's MC/DC criterion (DO-178C Level A required; ISO 26262 ASIL-D highly recommended) as requirements-based evidence, and how to interpret coverage from AI-generated tests. Do NOT use for choosing test levels (use testing-strategy), mutation testing as a stronger behavioral signal (use mutation-testing), the construction of test doubles (use test-doubles-design), LLM eval iteration (use eval-driven-development), or specific coverage-tooling configuration (tool docs)."
  taxonomy_domain: quality/testing
  stability: experimental
  keywords: "[\"code coverage\",\"line coverage\",\"branch coverage\",\"condition coverage\",\"MC/DC\",\"patch coverage\",\"coverage policy\",\"covered vs tested\",\"coverage as target\",\"Goodhart on coverage\"]"
  triggers: "[\"what coverage target should we set\",\"is 100% coverage the goal\",\"is this line covered or tested\",\"should we add tests for these uncovered lines\",\"branch vs line coverage\",\"patch coverage vs project coverage\",\"why did coverage go up but bugs still slipped through\"]"
  examples: "[\"set a coverage policy for a service that distinguishes 'covered' from 'tested'\",\"explain why a 100% line coverage gate may be worse than an 80% branch coverage gate\",\"diagnose a high-coverage test suite that still misses bugs — likely a granularity mismatch\",\"decide when to upgrade from branch coverage to MC/DC for safety-critical code\",\"review AI-generated tests that raised coverage but may only assert current behavior\"]"
  anti_examples: "[\"choose test levels (unit/integration/e2e) for a project (use testing-strategy)\",\"use mutation testing to evaluate test-suite quality (use mutation-testing)\",\"design mocks, stubs, fakes, or spies (use test-doubles-design)\",\"configure Istanbul, Jest coverage, JaCoCo, coverage.py, gcov, or llvm-cov (tool documentation)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Test coverage is to a test suite what cell-phone coverage maps are to a network — a green map on the carrier's website is not the same as actually being able to make a call in your basement; the map measures *where there is theoretical signal*, not *whether the call gets through*. A 100% coverage map with a 30% call-completion rate is the same shape of problem as a 100%-line-coverage suite that misses bugs — the floor is met (no dead zones), but the ceiling is unverified."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/test-coverage-strategy/SKILL.md
---
# Test-Coverage Strategy

## Concept of the skill

**What it is:** Test-coverage strategy is the discipline of using structural coverage reports to identify unexercised code and to choose an appropriate coverage *criterion* — without treating the percentage as proof of test-suite quality.

**Mental model:** Coverage is a reach map. The map gets more precise as the criterion gets stronger — functions, lines, branches, decisions, conditions, MC/DC independence, and paths each reveal a different kind of gap. The map still does not know whether a test *asserted the right behavior*. So coverage is a reliable **floor** (uncovered code is definitely untested) and an unreliable **ceiling** (covered code is not necessarily tested).

**Why it exists:** The coverage number is easy to produce and easy to gate on, and the moment it becomes the goal, tests degrade into reach-without-assertion padding. As of the LLM era that padding is now produced at scale by AI test generators, not just by humans gaming a gate. The skill keeps the strong floor signal and blocks the weak ceiling claim.

**What it is NOT:** It is not test-level selection, mutation testing, test-double construction, TDD, LLM eval design, production observability, or coverage-tool configuration.

**Adjacent concepts:** testing strategy, mutation testing, test doubles, TDD, requirements traceability, property/fuzz testing, contract/integration testing, and production observability.

**One-line analogy:** A green coverage map is like a green cell-phone coverage map — it shows *where there is theoretical signal*, not *whether the call gets through*. A 100% coverage map with a 30% call-completion rate is the same shape of problem as a 100%-line-coverage suite that misses bugs.

**Common misconception:** Higher coverage is not automatically better. A coverage report measures execution; only assertions, oracles, requirements, mutations, properties, contracts, or integration evidence tell you whether the reached behavior was verified.

## Coverage

The strategic use of code-coverage measurement as a diagnostic signal about test-suite gaps, without falling into the Goodhart-Law trap of treating the coverage number as the target. This skill covers:

- **Coverage as a structural measurement** — execution reach, not behavioral verification (the covered-vs-tested distinction, kept precise in policy and review language).
- **The coverage-criterion hierarchy** — function → statement/line → basic-block/instruction → branch → decision → condition → condition/decision → MC/DC → multiple-condition → path, and choosing the *weakest* criterion that still reveals the failure modes that matter for a given module.
- **Marick's floor-vs-ceiling distinction** — uncovered code is definitely untested (reliable); covered code is not necessarily tested (unreliable).
- **Goodhart-resistant coverage policy** — diagnostic use, changed-code (diff/patch) floors, risk-weighted thresholds, reviewable exceptions, and pairing coverage with behavioral signals.
- **Denominator hygiene** — what *population of code* the percentage is a fraction of: included roots, exclusions, the all-files-vs-loaded-only trap, and holding the denominator stable when reading a trend.
- **Tool-counter semantics** — how "line," "branch," "condition," and "MC/DC" differ across JaCoCo, coverage.py, Istanbul/nyc, gcov, llvm-cov, and Codecov, so a percentage is read with its definition attached.
- **The two empirical anchors** — advisory-at-scale (Google's voluntary, code-review-surfaced, changelist-level coverage) and mandated-for-safety (DO-178C / ISO 26262 MC/DC) — as the empirical counterpoints to "set a high gate."
- **Safety-critical structural coverage** — MC/DC as requirements-based evidence inside a certification process, including unique-cause vs masking MC/DC, object-code coverage, and tool qualification — not a standalone correctness proof.
- **AI-generated-test coverage inflation** — the now-dominant practical instance of covered-but-not-tested, and the review discipline that contains it.

## Philosophy of the skill

Coverage measures execution, not verification. A test that calls every function but asserts nothing has 100% line coverage and zero testing value; a test with rich assertions but missing some branches has lower coverage and may have much higher testing value. The metric's strategic value is in the *floor direction*: uncovered code is definitely untested. The reverse direction — covered code is necessarily tested — is not reliable.

The discipline of coverage strategy is using the metric where it is informative (gap detection, regression signaling, test-effort allocation, audit compliance) and refusing to use it where it is misleading (as a quality target, as a substitute for behavioral verification, as a ceiling claim about test thoroughness). The risk is large because coverage numbers are easy to produce, easy to gate on, and easy to optimize for in ways that degrade the test suite.

Coverage policy is *measurement design*. A real policy must name the criterion, the denominator, the threshold posture, the exception rules, the paired behavioral signals, and the review workflow. "80%" or "100%" by itself is not a policy; it is an ungrounded number. Most working test suites should aim for coverage that is *high enough to reveal gaps without becoming the goal*. Where the certification environment mandates a specific criterion (MC/DC for safety-critical), the discipline shifts: the criterion is given; the work is meeting it without coverage-padding.

## The Criterion Hierarchy

| Criterion | What it requires (proves structurally) | Test count for `A && B && C` | Typical use / what it misses |
|---|---|---|---|
| Function | Each function called once | 1 | Detects entirely-untested functions; misses lines, branches, assertions |
| Statement / Line | Each line executed once | 1 | Default in most tools; misses untaken branches and weak assertions |
| Basic block / Instruction | Each compiled block or bytecode instruction ran | — | Low-level / JVM / compiled-language reports; abstracts away source intent |
| Branch | Each branch (true/false) taken once | 2 | Catches missed-else-branch bugs; tool-specific branch definition, exception paths sometimes uncounted |
| Decision | Each decision evaluated both ways | 2 | Often conflated with branch in tooling; conditions inside a compound decision may not independently matter |
| Condition | Each Boolean sub-expression both true and false | 2 | Catches short-circuit-evaluation bugs; the overall decision may still not vary |
| Condition / decision | Condition and decision criteria both met | 2+ | Middle ground for compound Boolean expressions; independent effect may still be unshown |
| MC/DC | Each condition independently affects the decision | 4 (N+1 for N independent conditions) | Required at DO-178C Level A; highly recommended at ISO 26262 ASIL-D; coupled/repeated conditions may need masking forms |
| Multiple condition | All 2^N combinations exercised | 8 (2^N) | Combinatorial; rarely required; infeasible for many operands |
| Path | Every execution path through the function | Infeasible for loops | Theoretical; loops create unbounded paths |

The "test count" column is an *idealized minimum* for the three-operand expression `A && B && C`, not a guarantee. The real count depends on the language and tool's short-circuit semantics (whether `&&` is short-circuiting, whether the tool instruments each operand separately), on how decision vs condition vs branch are defined by the specific instrumenter, and — for MC/DC — on which *flavor* the certification interpretation accepts:

- **Unique-cause MC/DC** shows a condition's independent effect with a pair of tests where only the condition of interest and the decision outcome change; all other conditions stay fixed (the strict reading). It generally needs more cases.
- **Masking MC/DC** allows other conditions to change only when Boolean masking means they cannot affect the decision outcome in that pair. It is accepted by DO-178C for expressions with coupled/strongly-coupled conditions and is often the practical answer there — but the report must name the form, and the reviewer must understand which independence argument the tool is making.

N+1 is the floor for independent conditions; coupled conditions can require more. Treat the numbers as orders of magnitude, not as a tool-agnostic contract. Higher criteria do not make tests better by themselves; they reveal more structural gaps. **Upgrade the criterion when the lower one cannot see the failure mode.**

## Coverage Criterion Selection

The right criterion depends on where the code's failure modes hide.

| Code character | Recommended criterion | Why |
|---|---|---|
| Straight-line procedural; few branches | Line | The main risk is unexecuted code; adequate and cheap |
| Branchy business logic | Branch / decision | Line coverage can execute an `if` without exercising both outcomes |
| Compound Boolean guards | Condition/decision or MC/DC | Branch coverage can miss short-circuit and independence failures |
| Security, authorization, rate limits, financial gates | Condition/decision plus mutation or property tests | The failure risk is often a missing operand, boundary, or negated condition |
| Error, exception, and defensive paths | Branch (or accept the gap) plus explicit exception-path review | Many suites skip failure paths; some tools do not count exceptions as branches |
| Algorithmic / mathematical code | Branch plus property-based tests and mutation | Coverage finds structural holes; properties/mutations check behavior |
| Legacy system with weak tests | Function/line first, then branch on changed or risky modules | A low-friction floor beats a 100% target nobody can meet honestly |
| Safety-critical (aviation, automotive, medical) | Standard-required criterion, often MC/DC for highest criticality | Certification evidence requires the named criterion and traceability |
| High-traffic, incident-prone, or business-critical paths | Start with the structural criterion the code implies, then prioritize gaps by production usage / incident data | Runtime impact ranks which dark areas matter first; it is not itself test coverage |
| Generated, vendor, or framework glue | Exclude or separate with explicit policy | A denominator full of irrelevant code makes the percentage meaningless |

## Covered vs Tested

| Aspect | Covered | Tested |
|---|---|---|
| What it measures | Test reached the code | Test verified the code's behavior |
| Detected by | Coverage tool | Assertion/oracle presence + correctness |
| 100% achievable cheaply by | Function/line traversal with no assertions | Real behavioral assertions (not cheaply fakeable if the oracle is real) |
| Signal direction | Floor (uncovered = untested) reliable | Ceiling (covered = tested) unreliable |
| Typical companion | Diff coverage, branch gaps, per-test contexts | Mutation tests, properties, contracts, integration tests, requirements traceability |
| Strategic value | Gap detection | Quality assurance |

Use the words precisely. "This line is covered" means a test executed it. "This behavior is tested" means a test would fail if the behavior were wrong. Mixing the terms is how false confidence enters policy discussions. A test that calls `processOrder()` but asserts nothing covers `processOrder` and tests nothing in it; the coverage report cannot distinguish this from a test with full behavioral assertions. The discipline is to read coverage as one part of a picture that includes assertion review, mutation testing (see `mutation-testing`), and integration test coverage.

Mutation testing is the layer that makes the covered/tested gap *visible*: a coverage tool reports a line green whether or not an assertion would notice it changing, whereas a mutant on that line survives precisely when no assertion catches the change. This is why coverage is the *substrate* mutation testing runs on — Google's mutation system generates one mutant per *covered* line (uncovered lines have nothing to mutate against), so coverage is the precondition and mutation score is the behavioral confirmation on top of it. The pairing is not free: Google reports that ~85% of naively-generated mutants are *unproductive* (equivalent or not-worth-a-test), which is why behavioral signal must itself be curated rather than turned on blindly.

## Denominator Hygiene — what the number is a fraction *of*

A coverage percentage is a ratio, and the number is only as meaningful as its denominator. The strategic failure here is not picking the wrong *criterion* but measuring against the wrong *population of code* — a 95% that silently excludes the risky modules is worse than an honest 70%. This is a strategy concern, not a tool-config concern: it governs what the metric *means*, independent of which tool produces it.

| Denominator issue | Risk | Policy |
|---|---|---|
| Only loaded files counted | A module with zero tests is never imported, so it never enters the denominator — the least-tested code is invisible and the percentage looks high | Use all-source / all-files inclusion when the tool supports it (so adding an untested module *lowers* the number), or separately list never-loaded files. This is the single most common way a coverage number lies. |
| Generated / vendor / framework code included | Percentage drops for code the team should not test directly | Exclude with a named category and rationale |
| Generated / vendor / framework code excluded silently | The team hides real ownership behind ignore-globs to lift the number | Keep exclusions versioned and reviewable in the config, not buried |
| Dead code included | Teams write tests for code that should be deleted | Delete it or mark the gap as dead-code debt |
| Defensive / logging / debug code included | Teams pad tests around low-value paths | Allow justified exceptions, reviewed periodically |
| Tool / compiler upgrade changes counters | Coverage trend moves without any test changing | Re-baseline after major tool/compiler changes; a delta is only interpretable if the denominator did not move underneath it |
| Source maps / synthetic code distort line mapping | Coverage measured on transpiled/minified output (TS→JS, bundled code) attributes lines wrongly | Map back to source before acting; inspect the tool's counter definitions |

State the denominator explicitly — which roots are instrumented, which exclusions apply (and why), all-files vs loaded-only, and which tool's counter — and treat any unexplained jump as a denominator change until proven otherwise. None of this requires choosing a *specific* tool; it requires knowing what your chosen tool counts.

## Tool-Counter Semantics

Do not assume two tools mean the same thing by the same label. A "90%" from one tool is not comparable to a "90%" from another.

- **JaCoCo (JVM).** Counts six distinct *counters* — *instructions* (single Java bytecode instructions, its smallest and most reliable unit), *branches* (the two outcomes of each `if`/`switch`; exception handling is **not** counted as a branch), *lines* (when debug info exists), *complexity* (cyclomatic), *methods*, and *classes*. Because it instruments *bytecode*, a source line maps to many instructions and source-line numbers are approximate; the headline percentage depends on *which counter* the report surfaces, and synthetic compiler-generated code can create surprising source mappings.
- **coverage.py (Python).** Defaults to line coverage, optionally measures branch coverage, and supports *contexts* — tagging which test or dynamic context covered each line — so the same raw run can be sliced into per-test or per-feature coverage rather than one global number. Emits HTML/XML/LCOV/JSON.
- **Istanbul / nyc (JS/TS).** Reports four separate percentages — *statements*, *branches*, *functions*, *lines* — so a suite can sit at 95% lines but far lower branches; quoting "Istanbul coverage" without saying which of the four is ambiguous. By default it reports only files visited by tests; `--all` changes the denominator by including unvisited files. Threshold checks exist, but they do not decide whether the threshold is strategically wise.
- **gcov / GCC.** GCC 14 added explicit *condition coverage* (`-fcondition-coverage`, `gcov --conditions`), distinct from its older line/branch counters — so the same compiler reports different granularities depending on the flag.
- **Clang / LLVM source-based coverage.** Counts *region*, *line*, and *branch* execution with precise AST/preprocessor-based mapping, and offers *MC/DC* instrumentation (`-fcoverage-mcdc`, `llvm-cov show -show-mcdc`) — so an LLVM "coverage %" must state whether it is region, line, branch, or MC/DC before it means anything.
- **Codecov (aggregator).** Re-rolls whatever the underlying tool emitted and reports three *different* numbers teams routinely conflate: *project* coverage (whole codebase), *patch* coverage (only the lines changed in the PR — the diff-gating number), and *change/delta* (indirect coverage shifts in untouched files). A PR can be green on patch and red on project, or vice-versa.

Tooling can make the structural signal sharper. It does not solve the oracle problem.

## Goodhart-Resistant Strategy

Patterns that use coverage strategically without producing Goodhart-pressure:

1. **Use coverage to ask questions, not award grades — and default to diagnostic.** The safe default is to report coverage on PRs rather than fail the build on an aggregate number; reviewers read the report and the team adjusts allocation. This is not an absolute prohibition on gates. Google's own *Code Coverage Best Practices* (2020) is explicit that coverage targets *can* be useful when set per-team/per-workflow, risk-weighted to the code's criticality, scoped to the change rather than the whole codebase, and paired with human review — and equally explicit that a single global percentage gate imposed top-down is an anti-pattern that drives coverage-padding. The discriminator is *how* the gate is set, not whether one exists.
2. **Prefer changed-code floors over whole-project trophies.** New/changed lines must be covered above (e.g.) 70%, not the codebase as a whole. Lower aggregate target, higher meaningfulness of each test; keeps new gaps from entering unnoticed without forcing legacy cleanup into every PR.
3. **Risk-weight thresholds.** Security, financial, data-loss, safety, and high-change modules deserve stronger criteria and higher floors than generated glue or stable boilerplate.
4. **Pair coverage with behavioral signals.** Mutation score, survived-mutant review, property tests, fuzzing, assertion review, contract tests, integration breadth, and requirements traceability answer questions coverage cannot. No single metric is the target.
5. **Review uncovered lines in context.** A specific uncovered authorization branch matters more than a percentage delta.
6. **Keep exclusions explicit.** Every ignored file or pragma has a reason: generated, vendor, dead, impossible, defensive, or covered at another level.
7. **Treat 100% as suspicious outside regulated contexts.** It can be legitimate for small pure modules or mandated safety evidence; as a broad management target it usually creates padding.
8. **Prioritize gap-closing by production exposure.** Where available, pair coverage with runtime telemetry (OpenTelemetry traces, RUM, or impact-analysis tooling that maps coverage to executed-in-production paths) so the team tests the code users actually exercise first. Hot, uncovered paths are the highest-value test debt; cold, uncovered paths may be acceptable gaps.
9. **Audit agent-generated tests.** Coding agents can quickly raise coverage; require oracle review, boundary cases, and double/real-boundary checks before accepting the coverage gain (see § Coverage in the age of AI-generated tests).

### The two empirical anchors: advisory at scale, mandated for safety

The most consequential real-world coverage programs sit at opposite ends of the gating spectrum, and both vindicate the patterns above rather than the "set a high gate" instinct.

- **Advisory at scale (Google).** Google runs coverage for the large majority of its projects (~90% adoption by Q1 2018), yet coverage is **voluntary and advisory, not a merge gate**. Its primary delivery is *changelist-level* (diff) coverage surfaced *inside code review* — the reviewer sees which new/changed lines are green, orange (uncovered), or uninstrumented, which is exactly pattern #1 (diagnostic) plus pattern #2 (diff-based) at planetary scale. Project coverage is a slow health signal that can identify modules needing investment but can also hide a risky uncovered component under a healthy aggregate; changelist coverage is the changed-code floor. The researchers' own framing is that coverage is worth computing even when it is not a direct human quality signal, and that it should not be treated as a standalone success measure — an industrial confirmation of the floor-not-ceiling, panel-not-target doctrine. *Mutation-at-review* complements *coverage-at-review*: Google's mutation work presents a small number of actionable mutants on changed code, giving developers concrete behavioral test goals where coverage alone would only say code was reached. *Runtime-impact prioritization is prioritization, not proof* — production usage, incidents, and business impact rank which uncovered gaps to inspect first; that data belongs to observability and product-risk review, and coverage strategy only uses it to order the work.
- **Mandated for safety (DO-178C / ISO 26262).** At the other end, certification narrows the choice: the *criterion* is fixed at MC/DC — *required* for DO-178C Level A, and *highly recommended* (`++`) for ISO 26262 ASIL-D, where deviating is permitted only with a documented rationale and supplementary verification. This is the case where a hard coverage requirement is correct — precisely because the requirement is on the *criterion's granularity*, backed by certification audit, not on a raw line-coverage percentage chosen by a team. Note the asymmetry: even at ASIL D the standard allows a reasoned deviation, so "MC/DC is the law" overstates ISO 26262 — it is the strongly-expected default, not an absolute. See § Safety-Critical and MC/DC Discipline for the object-code and tool-qualification nuances.

The takeaway: a default repo should look more like the Google end (advisory, diff-scoped, reviewer-read) than like a blanket "fail the build under 90% line coverage" gate, and the hard-gate end is reserved for environments where a certification standard dictates the criterion.

## Coverage in the age of AI-generated tests

LLM test generators and coding agents have made the covered-vs-tested gap the dominant practical failure mode, not a 1999 abstraction. Current agents can find low-coverage modules, generate candidate tests, run suites, and iterate on failures — this accelerates the *mechanics* of closing structural gaps; it does **not** displace coverage strategy. The new failure mode is *faster Goodharting*: an agent can generate many tests that traverse code while providing little independent behavioral evidence. The mechanisms are specific and worth naming so a reviewer recognizes them:

- **Assertion-free or assertion-weak tests.** Generated tests reliably execute the target lines (coverage climbs) while asserting little or nothing of consequence — the classic "covered, not tested" shape, now produced in bulk.
- **Bug-documenting tests.** A generator that writes assertions against the *current* output of the code under test pins whatever the code does today, including its bugs, as "expected." The test is green, coverage is up, and the defect is now protected by a regression test that asserts the wrong thing.
- **Implementation-shaped assertions.** The test mirrors a private helper's behavior or an exact incidental data-structure shape, so a benign refactor fails while the real behavior remains correct.
- **Over-mocked boundaries.** The test replaces the collaborator, network, database, filesystem, or framework behavior that actually carries the risk, so coverage rises over code whose real integration point is never exercised.
- **Trivial-target / happy-path padding.** Generators favor easy targets — getters, setters, constructors, happy paths — which have near-zero defect probability but lift the percentage, while skipping the subtle edge cases (race conditions, timezone and Unicode boundaries, integer overflow) where real bugs live.
- **Scattershot volume on unfamiliar logic.** When the code diverges from patterns the model recognizes, generators tend to brute-force many shallow tests rather than engage the altered control flow — inflating both coverage and test *count* without exercising the new behavior.
- **Denominator manipulation.** The coverage gain came from exclusions, generated-file changes, or loaded-file behavior rather than from better tests.

The empirical tell is the *gap between the two metrics*: a generated suite can post high line coverage while its mutation score (the share of injected defects the suite actually catches) stays far lower — meaning most injected defects would survive despite the green coverage number. Treat any specific figure here as illustrative, not as a settled benchmark: a single vendor-adjacent blog has reported LLM-generated suites near ~20% mutation score on complex functions, but that is one practitioner data point, not peer-reviewed measurement, and rigorous published study of LLM-test mutation scores is still emerging. The 2026 MSR empirical studies on coding-agent test generation are checkable evidence that agents modify tests, add mocks, and can produce coverage gains — they do *not* prove that every AI-authored test is weak, so treat their findings as a reason for review discipline, not an automatic rejection rule. So the load-bearing claim is the *direction and shape* of the gap (coverage high, behavioral catch-rate low), not a precise percentage.

Review AI-generated coverage with stricter questions before reading a coverage rise as a quality improvement:

- What behavior would make this generated test fail?
- Does the test assert an intended contract, or just the implementation's current return value?
- Did the agent mock away the boundary that actually matters?
- Did it cover edge cases and failure paths, or only happy-path line traversal?
- Would a mutation, property, or contract violation survive?
- Did coverage rise because tests improved, or because the denominator/exclusions changed?

The strategic response is the same panel this skill already prescribes — **never accept a coverage rise from generated tests as evidence of quality without a behavioral check** (mutation score, assertion review, or running the suite against a known-buggy variant). A coverage gate alone actively rewards the generator for producing exactly these tests. Agentic test generation is a source of candidate tests, not an upstream replacement for coverage interpretation.

## Interpreting Coverage Changes

A coverage delta is only interpretable alongside the commit, denominator, criterion, and test oracle. A trend without that context is measurement noise.

| Change | Possible good interpretation | Possible bad interpretation | What to inspect |
|---|---|---|---|
| Coverage drops | Dead code removed from denominator; riskier code added honestly | New code lacks tests; tests deleted; tool now includes more files | Diff, denominator, changed files, test deletions |
| Coverage rises | Meaningful tests added for important gaps | Traversal tests with weak assertions; exclusions hid code; generated tests locked current behavior | New assertions, failure cases, excluded paths, mutation/property signal |
| Patch coverage passes | Changed lines were exercised | Important behavior changed outside the diff; tests only smoke-called code | Behavior target, assertions, integration/contract boundary |
| Project coverage passes | Overall suite did not regress structurally | A risky module remains uncovered under a healthy aggregate | Per-module and per-risk slice view |
| Branch coverage is high | Control-flow outcomes were reached | Compound conditions still lack independence; exception paths not counted by tool | Condition/decision or MC/DC details, tool branch definition |
| MC/DC is high | Conditions independently affected decisions | Requirements may be wrong or untested; tool may not match the standard's definition | Requirements traceability, qualified-tool evidence, decision tables |

## Safety-Critical and MC/DC Discipline

Safety-critical coverage is not "100% coverage, but stricter." It is structural evidence inside a broader requirements-based verification process.

- For **DO-178C / ED-12C Level A** avionics work, MC/DC is the canonical structural criterion for the highest software level. The discipline is not merely producing an MC/DC number; it is proving that *requirements-based* tests exercised the code structure, and investigating gaps as missing requirements, missing tests, dead code, deactivated code, or unintended functionality.
- **Source-level coverage is not the full object-code story at Level A.** DO-178C requires that structural coverage be analyzed at the source level *and* that the gap between source and object code be addressed. When the compiler introduces branching not directly traceable to source (e.g. a short-circuit Boolean lowered to extra object-code branches, or compiler-generated array-bounds/initialization checks), Level A requires additional verification of that object code — so MC/DC measured purely on source is necessary but not automatically sufficient. This is why safety-critical toolchains pair a *qualified* coverage tool with object-code coverage analysis rather than trusting a source-level percentage alone.
- **NASA's MC/DC tutorial** is valuable because it explains how to assess MC/DC claims *without blindly trusting a tool* — when a tool's definition, short-circuit behavior, masking form, or source/object-code mapping is under certification scrutiny.
- For **ISO 26262** automotive work, describe MC/DC as ASIL-dependent structural-coverage evidence, commonly highly recommended (`++`) or required by project safety policy for the highest ASILs. Do **not** state a blanket "ISO mandates MC/DC for all ASIL-D code" unless the safety plan and the specific standard table being applied make that exact claim; a deviation is permitted with documented rationale and additional verification.
- In safety contexts, the coverage tool itself may need **DO-330 / ED-215 qualification** or explicit project validation when its output is used to automate, replace, or substantiate a certification verification activity. A convenient report from a general-purpose tool is not automatically acceptable certification evidence.

## Coverage Policy Template

Use this shape when setting a project policy. If a policy cannot fill this table, it is not ready to fail builds.

| Policy part | Decision |
|---|---|
| Purpose | Diagnostic, changed-code floor, safety evidence, legacy cleanup, or release gate |
| Criterion | Line, branch, condition/decision, MC/DC, or tool-specific equivalent |
| Denominator | Included roots, excluded categories, unloaded-file behavior |
| Threshold posture | Warn, PR comment, soft gate, hard gate, or safety-case requirement |
| Risk differentiation | Which modules get stricter criteria or thresholds |
| Exceptions | Allowed reasons and review cadence |
| Behavioral companions | Mutation, property/fuzz, assertion review, contract/integration, requirements traceability |
| Impact prioritization | Production usage, incident history, customer-facing criticality — used only to rank gaps |
| Review workflow | Who inspects gaps and what constitutes closure |
| Tool semantics | Tool name/version and any non-obvious counter definitions |

## Verification

After applying this skill, verify:
- [ ] The coverage question is stated as a diagnostic question, not a quality grade.
- [ ] The team's coverage criterion is appropriate to the code's failure modes (line for procedural, branch for branchy, condition/decision or MC/DC for compound Boolean logic, the standard-mandated criterion for safety work). The default criterion is not assumed correct without checking what it measures.
- [ ] Coverage is read as a floor signal (gaps point to untested code), not a ceiling signal (high coverage proves tests are good). "Covered" and "tested" are kept separate in conversation, policy, and review comments.
- [ ] Coverage gates, if used, are tied to risk and a review workflow and set at a level achievable by real behavioral testing — not copied as a universal number that forces coverage-padding.
- [ ] Project-level and change-level coverage are interpreted separately: aggregate health does not hide risky changed-code gaps, and diff/patch coverage is read as a changed-code floor, not proof the behavior is verified.
- [ ] The denominator is explicit and defensible: which source roots are instrumented, which exclusions are applied (and why), whether the tool counts all source files or only those loaded during the run, and the tool/version. Any unexplained jump is treated as a denominator change until proven a real test change. Coverage measured on transpiled/bundled output is mapped back to source.
- [ ] Coverage is paired with at least one behavioral / oracle-oriented signal in any quality claim: mutation testing, property/fuzz tests, assertion review, contract/integration evidence, or requirements traceability.
- [ ] Any coverage rise driven by AI-generated or agent-authored tests is confirmed behaviorally (mutation score, assertion review, or a known-buggy variant the suite must fail) and reviewed for assertion-free reach, bug-documenting assertions, over-mocking, implementation-locking, and boundary/failure-path gaps before it is read as a quality improvement.
- [ ] Coverage of dead code is excluded or noted. A coverage drop is interpreted before being judged (dead-code removal, denominator change, tool upgrade, test deletion, or new untested code), not treated as automatically bad.
- [ ] Production usage or incident data, if used, only *prioritizes* uncovered gaps; it is not described as test coverage. Production observability is treated as a separate verification dimension — coverage tells you what tests exercised; observability tells you what production exercises.
- [ ] For safety-critical work, the applicable standard, DAL/ASIL or equivalent criticality level, coverage criterion, requirements-traceability evidence, object-code-coverage handling, and tool-qualification/validation status are named, and the tool's reported number actually matches the standard's definition.
- [ ] The team can explain every important uncovered gap as accepted risk, off-scope code, dead code to remove, behavior tested at another level, or real test debt. Unexplained gaps are test debt.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Deciding which test levels (unit/integration/e2e) to invest in | `testing-strategy` | testing-strategy owns the level/scope and behavior-target question; this skill owns the measurement of structural reach |
| Measuring whether tests would catch deliberately-introduced defects | `mutation-testing` | mutation owns the behavioral defect-detection signal; this skill owns the structural signal |
| Constructing mocks, stubs, fakes, spies, or doubles | `test-doubles-design` | doubles can affect coverage quality, but their design is a separate skill |
| Practicing red-green-refactor or choosing a TDD school | `test-driven-development` | TDD is a design rhythm; coverage may be a side effect, never the target |
| Iterating on LLM behavior via an eval suite | `eval-driven-development` | LLM evals are stochastic pass-rate measurements, not deterministic code-structure coverage |
| Configuring Istanbul, Jest, nyc, JaCoCo, coverage.py, gcov, llvm-cov, Coverlet, or Codecov | tool documentation | tool API choice and flag syntax are tactical detail below this skill's scope |
| Monitoring what production actually exercises | Observability / error-tracking skills | production telemetry is runtime evidence, complementary to test coverage |

## Key Sources

**Foundational and empirical**
- Marick, B. (1999). ["How to Misuse Code Coverage"](http://www.exampler.com/testing-com/writings/coverage.pdf). The canonical practitioner essay on coverage as a strategic signal vs target; defines the floor/ceiling distinction.
- Cornett, S. ["Code Coverage Analysis"](http://www.bullseye.com/coverage.html). Long-form reference defining the coverage-criterion hierarchy and the practical differences between branch, decision, MC/DC, path, and extended criteria.
- Inozemtseva, L., & Holmes, R. (2014). ["Coverage Is Not Strongly Correlated with Test Suite Effectiveness"](https://www.cs.ubc.ca/~rtholmes/papers/icse_2014_inozemtseva.pdf). *ICSE 2014*. Empirical study showing coverage and test-suite effectiveness are weakly correlated; the peer-reviewed backbone of the floor-not-ceiling reading.
- Namin, A. S., & Andrews, J. H. (2009). ["The influence of size and coverage on test suite effectiveness"](https://www.depts.ttu.edu/cs/research/avesta/documents/papers/ISSTA2009/ISSTA09.pdf). *ISSTA 2009*. Earlier empirical study; size and coverage both matter and the relationship is not linear. DOI: `10.1145/1572272.1572280`.
- Goodhart, C. (1975). "Problems of Monetary Management: The U.K. Experience." The origin of Goodhart's Law as commonly cited; applies sharply to coverage-as-target.

**Industrial scale (Google)**
- Ivanković, M., Petrović, G., Just, R., & Fraser, G. (2019). ["Code Coverage at Google"](https://homes.cs.washington.edu/~rjust/publ/IvankovicPJF2019-abstract.html). *ESEC/FSE 2019*. Describes Google's industrial program — voluntary/advisory adoption (~90% by Q1 2018), changelist-level coverage surfaced in code review; the empirical case that coverage works best as a diagnostic, not a gate.
- Arguelles, C., Ivanković, M., & Bender, A. (2020). ["Code Coverage Best Practices"](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html). *Google Testing Blog*. Source for the calibrated gating stance: targets *can* be useful when set per-team/per-workflow, risk-weighted, change-scoped, and review-paired — and a single global top-down percentage gate is an anti-pattern. The discriminator is *how* the gate is set, not whether one exists.
- Petrović, G., Ivanković, M., Fraser, G., & Just, R. (2021). ["Does mutation testing improve testing practices?"](https://homes.cs.washington.edu/~rjust/publ/PetrovicIFJ2021b-abstract.html). *ICSE 2021*. Evidence that mutation findings drive higher-quality tests, making mutation a strong companion signal to coverage.
- Petrović, G., Fraser, G., Ivanković, M., & Just, R. (2021/2022). ["Practical Mutation Testing at Scale: A View from Google"](https://research.google/pubs/practical-mutation-testing-at-scale-a-view-from-google/). Generates one mutant per *covered* line surfaced during code review; ~85% of naive mutants are unproductive, motivating context-based mutant selection — evidence that coverage is the substrate mutation builds on and that behavioral signal must itself be curated.

**Safety-critical standards**
- RTCA. *DO-178C: Software Considerations in Airborne Systems and Equipment Certification* (2011). The aviation certification standard requiring MC/DC for Level A software. Industry benchmark for what coverage criterion safety-critical software requires.
- FAA. ["AC 20-115D: Airborne Software Development Assurance Using EUROCAE ED-12( ) and RTCA DO-178( )"](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_20-115D.pdf). FAA recognition of DO-178C/ED-12C and DO-330/ED-215 (tool qualification) as acceptable airborne-software guidance.
- FAA/AVS. ["DO-178B/C Differences Tool"](https://www.faa.gov/sites/faa.gov/files/aircraft/air_cert/design_approvals/air_software/differences_tool.pdf). Public FAA guide noting DO-178C structural-coverage changes, object-code traceability, and DO-330 tool-qualification context.
- ISO. *ISO 26262: Road vehicles — Functional safety* (2018). The automotive safety standard. Part 6 Table 12 rates MC/DC as *highly recommended* (`++`) for ASIL-D software — a strong default rather than an absolute mandate: a deviation is permitted with documented rationale and additional verification. Parallel benchmark to DO-178C, with the weaker normative force noted.
- Hayhurst, K. J., Veerhusen, D. S., Chilenski, J. J., & Rierson, L. K. (2001). ["A Practical Tutorial on Modified Condition/Decision Coverage"](https://ntrs.nasa.gov/citations/20010057789). NASA technical memorandum; the practical reference on MC/DC, including unique-cause vs masking MC/DC, coupled-condition handling, and the tool-qualification and structural-coverage pitfalls that make a fixed per-expression test count tool- and interpretation-dependent.

**Tooling references (counter semantics)**
- JaCoCo. ["Coverage Counters"](https://www.jacoco.org/jacoco/trunk/doc/counters.html). Six bytecode/source counters and the exception-not-counted-as-branch caveat.
- Coverage.py. ["Coverage.py documentation"](https://coverage.readthedocs.io/en/7.14.1/). Line, branch, per-test contexts, and report formats.
- Clang/LLVM. ["Source-based Code Coverage"](https://clang.llvm.org/docs/SourceBasedCodeCoverage.html) and [`llvm-cov`](https://www.llvm.org/docs/CommandGuide/llvm-cov.html). Region/line/branch counters and `-fcoverage-mcdc` MC/DC reporting.
- GCC. [`gcov --conditions`](https://gcc.gnu.org/onlinedocs/gcc-14.2.0/gcc/Invoking-Gcov.html). GCC 14 condition-coverage support for MC/DC-style independent-effect reporting.
- Codecov. ["Coverage Percentages"](https://docs.codecov.com/docs/coverage-percentages). Patch, project/head, and change/delta coverage definitions for PR reporting.

**Coverage and AI-generated tests**
- Hora, A., & Robbes, R. (2026). ["Are Coding Agents Generating Over-Mocked Tests? An Empirical Study"](https://arxiv.org/abs/2602.00409). *MSR 2026*. Evidence that coding-agent commits often touch tests and mocks, supporting explicit over-mocking review. (Model-researched external source; central to the over-mocking failure mode.)
- Yoshimoto, S., Fujita, S., Horikawa, K., Feitosa, D., Kashiwa, Y., & Iida, H. (2026). ["Testing with AI Agents: An Empirical Study of Test Generation Frequency, Quality, and Coverage"](https://arxiv.org/abs/2603.13724). *MSR 2026*. Study of AI-authored test additions and their coverage effects. (Model-researched external source.)
- KeelCode. (2025). ["When AI tests pass but your code still breaks"](https://keelcode.dev/blog/ai-tests-safety-illusion). Practitioner account of the LLM-test "safety illusion": coverage rises while defect detection falls, reporting LLM-generated suites near ~20% mutation score on complex functions. **Vendor-adjacent blog, NOT an empirical anchor** — cited only for the failure-mode *framing* and the order-of-magnitude direction of the coverage-vs-mutation gap; the ~20% figure is a single practitioner data point, not peer-reviewed measurement. Do not cite the number as a benchmark. The peer-reviewed backbone for "coverage ≠ effectiveness" remains Inozemtseva & Holmes (2014) and Namin & Andrews (2009).

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/testing`
- Scope: Use when reasoning about code coverage as a strategic measurement rather than a target: the coverage-criterion hierarchy (function, statement, line, branch, decision, condition, MC/DC, path) and choosing the criterion that matches the code's failure modes, Marick's distinction between coverage as a floor signal and coverage as a ceiling target, Goodhart's Law applied to coverage metrics and Goodhart-resistant policy design, the covered-vs-tested distinction, denominator hygiene and cross-tool counter semantics, diff/patch coverage as a changed-code floor, the safety-critical industry's MC/DC criterion (DO-178C Level A required; ISO 26262 ASIL-D highly recommended) as requirements-based evidence, and how to interpret coverage from AI-generated tests. Do NOT use for choosing test levels (use testing-strategy), mutation testing as a stronger behavioral signal (use mutation-testing), the construction of test doubles (use test-doubles-design), LLM eval iteration (use eval-driven-development), or specific coverage-tooling configuration (tool docs).

**When to use**
- set a coverage policy for a service that distinguishes 'covered' from 'tested'
- explain why a 100% line coverage gate may be worse than an 80% branch coverage gate
- diagnose a high-coverage test suite that still misses bugs — likely a granularity mismatch
- decide when to upgrade from branch coverage to MC/DC for safety-critical code
- review AI-generated tests that raised coverage but may only assert current behavior
- Triggers: `what coverage target should we set`, `is 100% coverage the goal`, `is this line covered or tested`, `should we add tests for these uncovered lines`, `branch vs line coverage`, `patch coverage vs project coverage`, `why did coverage go up but bugs still slipped through`

**Not for**
- choose test levels (unit/integration/e2e) for a project (use testing-strategy)
- use mutation testing to evaluate test-suite quality (use mutation-testing)
- design mocks, stubs, fakes, or spies (use test-doubles-design)
- configure Istanbul, Jest coverage, JaCoCo, coverage.py, gcov, or llvm-cov (tool documentation)

**Related skills**
- Verify with: `testing-strategy`, `mutation-testing`
- Related: `eval-driven-development`, `testing-strategy`, `mutation-testing`, `test-driven-development`, `test-doubles-design`, `best-practice`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Test coverage is to a test suite what cell-phone coverage maps are to a network — a green map on the carrier's website is not the same as actually being able to make a call in your basement; the map measures *where there is theoretical signal*, not *whether the call gets through*. A 100% coverage map with a 30% call-completion rate is the same shape of problem as a 100%-line-coverage suite that misses bugs — the floor is met (no dead zones), but the ceiling is unverified.
- Common misconception: |

**Keywords**
- `code coverage`, `line coverage`, `branch coverage`, `condition coverage`, `MC/DC`, `patch coverage`, `coverage policy`, `covered vs tested`, `coverage as target`, `Goodhart on coverage`

<!-- skill-graph-context:end -->
