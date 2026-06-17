# Findings

## Skill

`hooked-model`

## Audit Date

2026-06-15

## Verdict Summary

Integrity Gate: PASS. Behavior Gate: PROVISIONAL. No required fixes remain from this audit run.

## Findings

No findings.

## Evidence Reviewed

- `node bin/skill-graph.js lint hooked-model` from `skill-graph/`: 0 errors, 0 warnings.
- `node bin/skill-graph.js routing-eval --skill hooked-model` from `skill-graph/`: PASS, 11/11 cases pass, `routing_eval: present`.
- `node bin/skill-graph.js manifest --validate-only` from `skill-graph/`: OK, manifest valid.
- `node bin/skill-graph.js audit hooked-model --audit-root /Users/jacobbalslev/Development/skill-graph/audits --force`: lint PASS, drift NO_BASELINE, `structural_verdict: PASS`, `truth_verdict: UNVERIFIED`.
- `node bin/skill-graph.js evaluate --mode comprehension /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/hooked-model/evals/comprehension.json`: stamped `comprehension_verdict: SKIPPED_BASELINE_HIGH`; receipt `.skill-graph/logs/eval-results/hooked-model/2026-06-15T00-10-38-693Z.json`.
- `node bin/skill-graph.js evaluate --mode application --application /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/hooked-model /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/hooked-model/evals/application.json --single-model`: completed 7/7 cases, 5/5 real cases applicable, 2/2 red-herring cases clean, stamped `application_verdict: PROVISIONAL`; receipt `.skill-graph/logs/eval-results/hooked-model/2026-06-15T01-22-24-322Z.json`.
- `node bin/skill-graph.js export --output .skill-graph/hooked-export && node bin/skill-graph.js export-verify .skill-graph/hooked-export/skills`: generated and verified a scratch export, 178 PASS, 0 FAIL.

## Required Fixes

None.

## Residual Risk

- Truth remains `UNVERIFIED` because the drift sentinel reported `NO_BASELINE`; the skill uses external URL truth sources plus local source notes, and no durable local hash baseline was written by this run.
- Application behavior is `PROVISIONAL`, not `APPLICABLE`, because the run was single-model and uncalibrated. A certifying dual-frontier/calibrated application run is required before claiming `APPLICABLE`.
- Canonical marketplace staging was not regenerated in this CONTENT pass. A repo-staging export check correctly reported the generated `marketplace/skills/hooked-model/SKILL.md` file is missing; the scratch export proved the source can export cleanly.
