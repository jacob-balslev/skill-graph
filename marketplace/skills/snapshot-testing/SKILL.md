---
name: snapshot-testing
description: "Use when reasoning about snapshot testing as a tactical technique: capture-and-compare against a reviewed baseline, data snapshots, DOM snapshots, text/file snapshots, visual snapshots, approval-cycle discipline, snapshot churn, unstable inputs, large unreadable diffs, golden files, characterization tests, and visual regression review with tools such as Jest, Vitest, Playwright screenshots, Storybook/Chromatic, and Percy. Do NOT use for the overall test-level mix (use `testing-strategy`), universal property claims (use `property-based-testing`), test double construction (use `test-doubles-design`), strict test-first workflow design (use `test-driven-development`), or end-to-end user journey design (use `e2e-test-design`). Do NOT use for choose the overall unit integration e2e and performance test mix for this feature. Do NOT use for use property-based testing with fast-check generated arrays to assert sort output is ordered and preserves items."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"testing-strategy\",\"property-based-testing\",\"test-driven-development\",\"test-doubles-design\",\"e2e-test-design\",\"diff-analysis\"],\"suppresses\":[\"e2e-test-design\",\"testing-strategy\",\"property-based-testing\",\"test-driven-development\",\"test-doubles-design\"],\"verify_with\":[\"diff-analysis\",\"testing-strategy\"]}"
  subject: quality-assurance
  scope: "Teaching snapshot testing as a portable quality-assurance technique: capture a known-good output artifact, compare future output against that baseline, review diffs, and either update the baseline after human approval or fix the production change. Covers data, DOM/HTML, text/file, generated-output, golden-file, characterization, and visual snapshot variants; serializer/determinism controls; approval-cycle discipline; snapshot size/readability; and when visual regression tools are the right comparison surface. Excludes the overall test strategy mix, universal property claims, test double construction, strict test-first workflow design, and e2e journey design."
  public: "true"
  taxonomy_domain: quality/testing
  stability: experimental
  keywords: "[\"snapshot testing\",\"golden file\",\"characterization test\",\"approval testing\",\"visual regression\",\"Chromatic\",\"Percy\",\"Storybook\",\"Jest snapshot\",\"DOM snapshot\"]"
  triggers: "[\"should this be a snapshot test\",\"the snapshot keeps changing\",\"is visual regression testing the same thing\",\"should we auto-update snapshots\",\"snapshot file is too big\"]"
  examples: "[\"should this Jest DOM snapshot test use toMatchSnapshot or hand-written assertions\",\"diagnose Jest snapshot file churn when every PR updates snapshots because timestamps random IDs and order change\",\"explain why running jest -u or vitest -u without reviewing snapshot diffs removes the testing value\",\"design an approval cycle for a visual snapshot regression suite using Playwright or Chromatic\"]"
  anti_examples: "[\"choose the overall unit integration e2e and performance test mix for this feature\",\"use property-based testing with fast-check generated arrays to assert sort output is ordered and preserves items\",\"design a test double fake payment provider and decide mock stub or fake\",\"write an end-to-end checkout journey from cart to payment confirmation\"]"
  grounding: "{\"subject_matter\":\"Portable snapshot testing and visual regression testing practice across data, DOM, text, file, and image baselines\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://jestjs.io/docs/snapshot-testing\",\"https://main.vitest.dev/guide/learn/snapshots\",\"https://playwright.dev/docs/test-snapshots\",\"https://storybook.js.org/docs/writing-tests/snapshot-testing\",\"https://storybook.js.org/docs/9/writing-tests/visual-testing\",\"https://www.chromatic.com/docs/snapshots/\",\"../skills/skills/quality-assurance/snapshot-testing/references/snapshot-testing-2026-06-07.md\"],\"failure_modes\":[\"auto_update_without_review\",\"snapshot_churn_from_nondeterministic_output\",\"large_unreadable_snapshot_diff\",\"snapshot_used_instead_of_explicit_behavior_assertion\",\"visual_snapshot_without_stable_environment\",\"property_or_journey_test_misrouted_to_snapshot\",\"baseline_file_not_committed_or_reviewed\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A snapshot test is to a piece of output what a wedding photograph is to a memory of the day — the photograph does not say what the wedding *should* have looked like, only what it did look like; on the next anniversary, you compare the room to the photograph and notice 'the curtains are different' (intentional — they were replaced) or 'the picture is crooked' (unintentional — fix it). A photograph filed away without anyone ever looking at it again is not a record; it is paper. A snapshot file the team auto-accepts via `-u` is the same."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/snapshot-testing/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

# Snapshot Testing

## Concept of the skill

Snapshot testing is a tactical testing technique in which the output of a system under test is *captured on a known-good run, stored as an artifact (the snapshot), and compared against fresh output on each subsequent test run*. A mismatch is the test failure. The snapshot itself is the assertion — there is *no hand-written claim about what the output should be*; the claim is *"the output should equal what it was last time, until someone deliberately approves a new baseline."* *Five primitives*: (1) *target output* — data structure / DOM tree / image / text; (2) *snapshot artifact* — stored serialized, checked into version control (or stored in a centralized service for visual snapshots); (3) *comparison and diff* — line-by-line text diff for data/DOM/text; perceptual diff with tolerance threshold for images; (4) *approval cycle* — the discipline-critical primitive: when a test fails, *read the diff*, decide whether the change was intentional, and either update the baseline (intentional) or fix the production code (unintentional); (5) *stability discipline* — timestamps, random IDs, iteration order, environment values must be normalized before capture or the test churns on noise.

Replaces hand-specifying every part of a complex output (impractical for large rendered DOM trees, JSON API responses, generated SQL, full-page visual layouts) with capture-and-compare. Solves the problem that some outputs are structurally complex enough that writing explicit assertions is prohibitively expensive — a rendered component might have hundreds of nodes; a JSON response might have dozens of fields; a generated migration might have many lines — and that small structural drift should be visible to a reviewer's eye. The technique's value is in *surfacing every subsequent change to a reviewer's eye* so that intentional changes are approved and unintentional changes are caught as regressions. Sub-purposes: (1) *characterize legacy code* as a safety net before refactoring (Feathers' original use); (2) catch *visual regressions* on UI components (Chromatic, Percy, Storybook); (3) detect *structural drift* in API responses or generated outputs over time. The technique fits where the output is structurally complex, where small drift should be visible, and *where the team will honor the approval cycle*.

Distinct from testing-strategy, which owns the strategic question of what to test at which level — this skill owns one tactical technique within that strategy. Distinct from property-based-testing, which asserts *universal* claims about output structure — snapshot captures a *specific* output and asserts equality to a baseline; the two complement (PBT for universal contracts; snapshots for complex structural outputs easier to capture than specify). Distinct from test-driven-development, which prescribes writing the test before the code — snapshot testing requires the code to exist before the snapshot can be captured; fits poorly with strict TDD on greenfield code, well with characterization of existing code. Distinct from code-review, which owns the broader review discipline — the approval cycle of snapshot testing is operationally *part of* the review process code-review owns; the diff must be small, legible, and *actually read*. Distinct from e2e-test-design — e2e covers user-journey testing; visual snapshots compose *inside* e2e tests as a regression net for UI changes the journey assertions don't catch. Distinct from example tests — use precise hand-written assertions for simple outputs; snapshots are wasteful for primitive return values and inappropriate for behavioral contracts that need explicit specification. A snapshot test is to a piece of output what a wedding photograph is to a memory of the day — the photograph does not say what the wedding *should* have looked like, only what it did look like; on the next anniversary, you compare the room to the photograph and notice 'the curtains are different' (intentional — they were replaced) or 'the picture is crooked' (unintentional — fix it). A photograph filed away without anyone ever looking at it again is not a record; it is paper. A snapshot file the team auto-accepts via `-u` is the same. The wrong mental model is that snapshot testing is "automatic regression coverage" and that running `jest -u` to update snapshots in response to failures is part of the workflow. It is not — *auto-updating without review removes the testing value*. The discipline is the *approval cycle*: when a snapshot test fails, the developer must read the diff, decide whether the change was intentional, and either approve (update the baseline) or fix the production code. A team that types `jest -u` reflexively has automated the maintenance and removed the verification. Adjacent misconceptions: that snapshot testing is a substitute for behavioral specification (it is not — it captures what the output *was*, not what it *should be*; pair with example tests for behaviors that need explicit specification); that snapshots can be arbitrarily large (they cannot — diffs must be readable by humans; snapshots over a few hundred lines should be split or replaced with per-property assertions); that snapshots on output with timestamps, random IDs, or iteration-order-dependent collections work (they do not — the test will churn on noise and train the team to ignore failures; normalize unstable sources before capture: freeze time, seed ID generators, sort collections, pin locale); that visual snapshots should use bit-for-bit equality (they should not — perceptual diff with a tuned tolerance threshold ignores rendering noise while catching real changes); that snapshot diffs in PR review are reviewed automatically (they are not — reviewers must actually read them, and visual snapshot services like Chromatic/Percy provide review UI for exactly that purpose); and that snapshot testing fits everywhere (it does not — fits well for complex rendered DOM, large JSON responses, generated code, visual regression; fits poorly for simple return values, behavioral contracts needing explicit specification, and any unstable output the team will neither stabilize nor stop using).

## Coverage

The tactical testing technique in which the output of a system under test is captured on a known-good run, stored as an artifact, and compared against fresh output on each subsequent test run. Covers the five primitives (target output, snapshot artifact, comparison and diff, approval cycle, stability discipline), the taxonomy across output target (data / DOM / image / text), storage location (inline / file / centralized service), approval process (auto-update / manual edit / PR-integrated review), comparison strategy (exact / perceptual / structural / property-equality), and scope (unit / integration / full-page visual). Covers the Feathers characterization-test pattern as a legitimate use, and the auto-update-without-review anti-pattern as the technique's most common failure mode.

## Philosophy of the skill
A snapshot test is a photograph of the output. The photograph itself is not a specification — it doesn't say what the output should be, only what it was on the day of capture. The technique's value is in surfacing every subsequent change to a reviewer's eye, so that intentional changes are approved and unintentional changes are caught as regressions.

The discipline is the approval cycle. When a snapshot test fails, the developer reads the diff, decides whether the change was intentional, and either updates the baseline (intentional) or fixes the production code (unintentional). A team that types `jest -u` reflexively in response to every failing snapshot has automated the maintenance and removed the verification.

Snapshot testing fits where the output is structurally complex enough that hand-specifying every part is expensive, where small drift should be visible, and where the team will honor the approval cycle. It fits poorly where the output is simple (use precise assertions), unstable (the snapshot will churn), or where the team treats failures as nuisances to silence rather than signals to read.

## Output Target Matrix

| Target | Serialization | Diff format | Common tooling |
|---|---|---|---|
| Data structure | JSON or framework-specific | Line-by-line text diff | Jest `toMatchSnapshot`, Vitest snapshot |
| DOM / HTML | Pretty-printed HTML or virtual-DOM tree | Line-by-line text diff | `@testing-library` + Jest, Enzyme legacy |
| Image | PNG (or other lossless) | Perceptual diff with threshold | Chromatic, Percy, Argos, Loki, Playwright screenshots |
| Text | Plain text | Line-by-line text diff | Approval test libraries; framework snapshot |
| Generated code | Plain text | Line-by-line text diff | Same as text |

The target's serialization stability is the technique's precondition. Outputs that include timestamps, random IDs, iteration-order-dependent collections, or environment-dependent values must be normalized before snapshot capture or the test will churn.

## The Approval Cycle In Detail

```
Test fails (snapshot != fresh output)
            │
            ▼
   Read the diff carefully
            │
            ▼
  ┌─────────────┴─────────────┐
  │                           │
  Change was intended         Change was not intended
  │                           │
  ▼                           ▼
  Update the snapshot         Fix the production code
  (the new baseline is the    (the snapshot stays;
   intended output)            the code is what changed
                               unintentionally)
```

The discipline is the read. The diff must be small enough to read, the diff format must be legible, and the developer must read it. Tooling that bypasses the read (auto-update, mass-accept) is incompatible with the technique.

## When Snapshot Testing Fits

| Fits well | Fits poorly |
|---|---|
| Complex rendered DOM components | Simple return values |
| Large JSON API responses | Single primitive outputs |
| Generated SQL or code output | Random or nondeterministic outputs |
| Visual regression of UI components | Outputs that change frequently for unrelated reasons |
| Characterizing legacy code for refactoring | Greenfield code under strict TDD |
| Full-page visual diff | Behavioral contracts that need explicit specification |
| Detecting structural drift over time | Cases where every diff is expected and uninformative |

## Stability Sources To Control

| Source | Mitigation |
|---|---|
| Wall-clock timestamps | Inject a deterministic clock; freeze time in tests |
| Random IDs (UUID, nanoid) | Inject a seeded ID generator in tests |
| Iteration order of unordered collections | Sort before serialization |
| Environment-dependent values (env vars, hostnames) | Fix or mock in test environment |
| Browser/OS rendering differences (image snapshots) | Use a snapshot service that pins the environment; tolerance threshold for perceptual diff |
| Pretty-printer changes across library versions | Pin the serializer version |
| Locale-dependent formatting | Fix locale in tests |

A snapshot test on output without these controls churns on noise and trains the team to ignore the failures.

## Verification

After applying this skill, verify:
- [ ] Every snapshot test has a designated approval cycle. The team's response to a failed snapshot test is "read the diff," not "run `-u`."
- [ ] Snapshot files are small enough that the diff between baseline and fresh output is readable by a human reviewer. Snapshots over a few hundred lines are split or replaced with per-property assertions.
- [ ] The target output is *stable* — timestamps, IDs, ordering, and environment values are controlled. Snapshots that churn on noise are diagnosed as instability, not accepted as normal.
- [ ] Snapshot tests are paired with example tests for behaviors that need specification. The suite is not snapshot-only.
- [ ] Visual snapshots use perceptual diff with a tolerance threshold, not bit-for-bit equality. The threshold is tuned to ignore rendering noise while catching real changes.
- [ ] PR review surfaces snapshot diffs; reviewers actually read them. (For visual snapshots, the snapshot service's review UI is the integration point.)
- [ ] Characterization snapshots are recognized as safety nets for legacy refactoring, not as specifications. They are progressively replaced with example or property tests as the code is understood.
- [ ] Snapshot files in source control are reviewed for size. Repository bloat from large snapshot files is a real cost that needs counterweight (technique fit, review discipline).

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Specifying one concrete behavior with explicit assertions | example tests (see `testing-strategy`) | examples specify with reasoning; snapshots capture without |
| Asserting a universal property like sort correctness | `property-based-testing` | properties assert universal claims; snapshots assert "equals last time" |
| Constructing test doubles | `test-doubles-design` | test-doubles owns the stand-in construction |
| Designing end-to-end user journey tests | `e2e-test-design` | e2e owns user-level behavioral testing; snapshot-of-screenshot is one tool inside it |
| Choosing test levels (unit/integration/e2e) | `testing-strategy` | strategy owns level choice; this skill is one tactical technique within |
| Reviewing intended visual changes against a design system | dedicated design-review process | visual design intent assessment is its own discipline; visual snapshots surface unintended changes, not whether intended ones are good |

## Key Sources

- Feathers, M. (2004). *Working Effectively with Legacy Code*. Prentice Hall. Introduces "characterization tests" — capturing current behavior as a safety net for refactoring legacy code. The conceptual ancestor of snapshot testing.
- Jest Team. ["Snapshot Testing — Jest Documentation"](https://jestjs.io/docs/snapshot-testing). The most-adopted JavaScript snapshot-testing implementation; canonical reference for inline snapshots, the `__snapshots__/` convention, and the `--updateSnapshot` flag and its discipline implications.
- Vitest Team. ["Snapshot Testing — Vitest Guide"](https://main.vitest.dev/guide/learn/snapshots). Current reference for Vitest external, inline, and file snapshots; emphasizes reviewing diffs before updates.
- Playwright Team. ["Visual comparisons"](https://playwright.dev/docs/test-snapshots). Current reference for screenshot baselines, update flow, environment sensitivity, pixel-diff options, and non-image snapshots.
- Storybook Team. ["Snapshot tests"](https://storybook.js.org/docs/writing-tests/snapshot-testing). Current reference for snapshot testing Portable Stories and the Storyshots deprecation note.
- Storybook Team. ["Visual tests"](https://storybook.js.org/docs/9/writing-tests/visual-testing). Current reference for Storybook visual tests and review of changed pixels.
- Chromatic. ["Snapshots"](https://www.chromatic.com/docs/snapshots/). Current reference for centralized visual snapshot capture, metadata, and comparison workflow.
- ApprovalTests. ["Approval Tests"](https://approvaltests.com/). Cross-language framework explicitly focused on the approval cycle as the central discipline; useful as a contrast to auto-update-heavy tools.
- Spadini, D., Schvarcbacher, M., Oprescu, A.-M., Bruntink, M., & Bacchelli, A. (2020). ["Investigating Severity Thresholds for Test Smells"](https://dl.acm.org/doi/10.1145/3387940.3392177). Industrial study including snapshot-test smells; useful empirical signal on approval-cycle failure modes.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/testing`
- Scope: Teaching snapshot testing as a portable quality-assurance technique: capture a known-good output artifact, compare future output against that baseline, review diffs, and either update the baseline after human approval or fix the production change. Covers data, DOM/HTML, text/file, generated-output, golden-file, characterization, and visual snapshot variants; serializer/determinism controls; approval-cycle discipline; snapshot size/readability; and when visual regression tools are the right comparison surface. Excludes the overall test strategy mix, universal property claims, test double construction, strict test-first workflow design, and e2e journey design.

**When to use**
- should this Jest DOM snapshot test use toMatchSnapshot or hand-written assertions
- diagnose Jest snapshot file churn when every PR updates snapshots because timestamps random IDs and order change
- explain why running jest -u or vitest -u without reviewing snapshot diffs removes the testing value
- design an approval cycle for a visual snapshot regression suite using Playwright or Chromatic
- Triggers: `should this be a snapshot test`, `the snapshot keeps changing`, `is visual regression testing the same thing`, `should we auto-update snapshots`, `snapshot file is too big`

**Not for**
- choose the overall unit integration e2e and performance test mix for this feature
- use property-based testing with fast-check generated arrays to assert sort output is ordered and preserves items
- design a test double fake payment provider and decide mock stub or fake
- write an end-to-end checkout journey from cart to payment confirmation

**Related skills**
- Verify with: `diff-analysis`, `testing-strategy`
- Related: `testing-strategy`, `property-based-testing`, `test-driven-development`, `test-doubles-design`, `e2e-test-design`, `diff-analysis`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: A snapshot test is to a piece of output what a wedding photograph is to a memory of the day — the photograph does not say what the wedding *should* have looked like, only what it did look like; on the next anniversary, you compare the room to the photograph and notice 'the curtains are different' (intentional — they were replaced) or 'the picture is crooked' (unintentional — fix it). A photograph filed away without anyone ever looking at it again is not a record; it is paper. A snapshot file the team auto-accepts via `-u` is the same.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://jestjs.io/docs/snapshot-testing`, `https://main.vitest.dev/guide/learn/snapshots`, `https://playwright.dev/docs/test-snapshots`, `https://storybook.js.org/docs/writing-tests/snapshot-testing`, `https://storybook.js.org/docs/9/writing-tests/visual-testing`, `https://www.chromatic.com/docs/snapshots/`, `../skills/skills/quality-assurance/snapshot-testing/references/snapshot-testing-2026-06-07.md`

**Keywords**
- `snapshot testing`, `golden file`, `characterization test`, `approval testing`, `visual regression`, `Chromatic`, `Percy`, `Storybook`, `Jest snapshot`, `DOM snapshot`

<!-- skill-graph-context:end -->
