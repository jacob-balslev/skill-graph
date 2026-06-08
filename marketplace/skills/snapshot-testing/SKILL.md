---
name: snapshot-testing
description: "Use when reasoning about snapshot testing as a tactical technique: capture-and-compare against a reviewed baseline, data snapshots, DOM snapshots, text/file snapshots, visual snapshots, approval-cycle discipline, snapshot churn, unstable inputs, large unreadable diffs, golden files, characterization tests, and visual regression review with tools such as Jest, Vitest, Playwright screenshots, Storybook/Chromatic, and Percy. Do NOT use for the overall test-level mix (use `testing-strategy`), universal property claims (use `property-based-testing`), test double construction (use `test-doubles-design`), strict test-first workflow design (use `test-driven-development`), or end-to-end user journey design (use `e2e-test-design`). Do NOT use for choose the overall unit integration e2e and performance test mix for this feature. Do NOT use for use property-based testing with fast-check generated arrays to assert sort output is ordered and preserves items."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: quality-assurance
  scope: "Teaching snapshot testing as a portable quality-assurance technique: capture a known-good output artifact, compare future output against that baseline, review diffs, and either update the baseline after human approval or fix the production change. Covers data, DOM/HTML, text/file, generated-output, golden-file, characterization, and visual snapshot variants; serializer/determinism controls; approval-cycle discipline; snapshot size/readability; and when visual regression tools are the right comparison surface. Excludes the overall test strategy mix, universal property claims, test double construction, strict test-first workflow design, and e2e journey design."
  taxonomy_domain: quality/testing
  stability: experimental
  keywords: "[\"snapshot testing\",\"golden file\",\"characterization test\",\"approval testing\",\"visual regression\",\"Chromatic\",\"Percy\",\"Storybook\",\"Jest snapshot\",\"DOM snapshot\"]"
  triggers: "[\"should this be a snapshot test\",\"the snapshot keeps changing\",\"is visual regression testing the same thing\",\"should we auto-update snapshots\",\"snapshot file is too big\"]"
  examples: "[\"should this Jest DOM snapshot test use toMatchSnapshot or hand-written assertions\",\"diagnose Jest snapshot file churn when every PR updates snapshots because timestamps random IDs and order change\",\"explain why running jest -u or vitest -u without reviewing snapshot diffs removes the testing value\",\"design an approval cycle for a visual snapshot regression suite using Playwright or Chromatic\"]"
  anti_examples: "[\"choose the overall unit integration e2e and performance test mix for this feature\",\"use property-based testing with fast-check generated arrays to assert sort output is ordered and preserves items\",\"design a test double fake payment provider and decide mock stub or fake\",\"write an end-to-end checkout journey from cart to payment confirmation\"]"
  relations: "{\"related\":[\"testing-strategy\",\"property-based-testing\",\"test-driven-development\",\"test-doubles-design\",\"e2e-test-design\",\"diff-analysis\"],\"boundary\":[{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy owns the strategic question of what to test at which level; snapshot-testing owns one tactical capture-and-compare technique inside that strategy.\"},{\"skill\":\"property-based-testing\",\"reason\":\"property-based-testing asserts universal claims across generated inputs; snapshot-testing captures one concrete output and compares it to a reviewed baseline.\"},{\"skill\":\"test-driven-development\",\"reason\":\"test-driven-development owns strict test-first workflow discipline; snapshot-testing usually needs existing output before the baseline can be captured.\"},{\"skill\":\"test-doubles-design\",\"reason\":\"test-doubles-design owns fake/stub/mock stand-ins for collaborators; snapshot-testing owns baseline artifacts for output comparison.\"},{\"skill\":\"e2e-test-design\",\"reason\":\"e2e-test-design owns user-journey correctness across a running system; snapshot-testing may provide visual or structural regression checks inside that journey but does not design the journey itself.\"}],\"verify_with\":[\"testing-strategy\",\"diff-analysis\"]}"
  grounding: "{\"subject_matter\":\"Portable snapshot testing and visual regression testing practice across data, DOM, text, file, and image baselines\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://jestjs.io/docs/snapshot-testing\",\"https://main.vitest.dev/guide/learn/snapshots\",\"https://playwright.dev/docs/test-snapshots\",\"https://storybook.js.org/docs/writing-tests/snapshot-testing\",\"https://storybook.js.org/docs/9/writing-tests/visual-testing\",\"https://www.chromatic.com/docs/snapshots/\",\"../skills/skills/quality-assurance/snapshot-testing/references/snapshot-testing-2026-06-07.md\"],\"failure_modes\":[\"auto_update_without_review\",\"snapshot_churn_from_nondeterministic_output\",\"large_unreadable_snapshot_diff\",\"snapshot_used_instead_of_explicit_behavior_assertion\",\"visual_snapshot_without_stable_environment\",\"property_or_journey_test_misrouted_to_snapshot\",\"baseline_file_not_committed_or_reviewed\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  analogy: "A snapshot test is to a piece of output what a wedding photograph is to a memory of the day — the photograph does not say what the wedding *should* have looked like, only what it did look like; on the next anniversary, you compare the room to the photograph and notice 'the curtains are different' (intentional — they were replaced) or 'the picture is crooked' (unintentional — fix it). A photograph filed away without anyone ever looking at it again is not a record; it is paper. A snapshot file the team auto-accepts via `-u` is the same."
  misconception: "|"
  public: "true"
  concept_boundary: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/snapshot-testing/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

# Snapshot Testing

## Coverage

The tactical testing technique in which the output of a system under test is captured on a known-good run, stored as an artifact, and compared against fresh output on each subsequent test run. Covers the five primitives (target output, snapshot artifact, comparison and diff, approval cycle, stability discipline), the taxonomy across output target (data / DOM / image / text), storage location (inline / file / centralized service), approval process (auto-update / manual edit / PR-integrated review), comparison strategy (exact / perceptual / structural / property-equality), and scope (unit / integration / full-page visual). Covers the Feathers characterization-test pattern as a legitimate use, and the auto-update-without-review anti-pattern as the technique's most common failure mode.

## Philosophy

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
- Owned by `testing-strategy`: the strategic question of what to test at which level
- Owned by `property-based-testing`
- Owned by `test-driven-development`: strict test-first workflow discipline
- Owned by `test-doubles-design`: fake/stub/mock stand-ins for collaborators
- Owned by `e2e-test-design`: user-journey correctness across a running system

**Related skills**
- Verify with: `testing-strategy`, `diff-analysis`
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
