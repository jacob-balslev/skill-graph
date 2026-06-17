# Findings

## Skill

`three-horizons`

## Audit Date

2026-06-09

## Verdict Summary

Integrity Gate: PASS

Behavior Gate: UNVERIFIED

## Findings

No blocking findings after initial creation and focused audit-loop checks.

## Non-Blocking Gaps

1. Application behavior is not certified because `evals/application.json` is not authored. `application_verdict` remains `UNVERIFIED`, which is the honest state.
2. External URL truth sources are reviewed but not hashed by the default drift sentinel. The sidecar records local hashes for `references/three-horizons-sources.md` and `references/upstream-displacement-2026-06-09.md`; `drift_status` is `EXTERNAL_UNHASHED`.
3. Focused routing has 0 failures, but two hard-negative prompts are coverage gaps: the Blue Ocean Strategy anti-example avoids `three-horizons` but no other skill is selected, and the expected-value anti-example avoids `three-horizons` but no other skill is selected. These are non-failing for this skill's hard-negative contract.
4. Whole-corpus manifest validation still exits nonzero on unrelated pre-existing corpus issues such as missing `scope`, invalid old audit-state values, and old eval metadata shapes. The temporary manifest was still written and contains `three-horizons`.
5. Broad generated indexes and marketplace exports were not refreshed in this run because the workspace already had unrelated dirty generated files.

## Evidence Summary

- New canonical skill created under `skills/skills/reasoning-strategy/three-horizons/`.
- Source notes and upstream displacement notes created under the skill's `references/`.
- Comprehension eval created under `evals/comprehension.json`.
- Focused lint exited 0 with 0 errors and 0 warnings.
- Drift recording wrote local reference hashes; drift verdict is `EXTERNAL_UNHASHED` for four external URLs.
- Integrity audit exited 0 and stamped `structural_verdict: PASS`, `truth_verdict: UNVERIFIED`, and `lint_verdict: PASS`.
- Asserted routing eval exited 0 with 8 PASS, 0 FAIL, and 2 non-failing coverage gaps.
- Comprehension evaluation exited 0, stamped `comprehension_verdict: SKIPPED_BASELINE_HIGH`, score 4.27, and no failed IDs.
