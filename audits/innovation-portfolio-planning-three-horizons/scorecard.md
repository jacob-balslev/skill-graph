# Scorecard

## Skill

`three-horizons`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Focused lint passes: `OK skills/skills/reasoning-strategy/three-horizons/SKILL.md`, 0 errors, 0 warnings. |
| Activation quality | 4 | Asserted routing exits 0 with 8 PASS, 0 FAIL, and 2 non-failing hard-negative coverage gaps. All 5 positives route top-1 to `three-horizons`; BCG, Ansoff, and OKR negatives route away to the named boundary skills. |
| Relation quality | 5 | Boundary relations point to existing adjacent strategy skills and use mechanism-level ownership reasons. |
| Grounding fidelity | 4 | Local source notes are hashed; external McKinsey and IFF URLs are reviewed and cited but remain `EXTERNAL_UNHASHED`, so truth stays `UNVERIFIED`. |
| Content quality | 5 | Complete concept card, domain context, coverage, workflow, output template, boundary table, verification checklist, and negative-use table; no template residue. |
| Eval quality | 4 | Comprehension eval has 8 realistic cases across 8 dimensions and evaluator exited 0 with `SKIPPED_BASELINE_HIGH`; application eval is not authored, so application behavior remains `UNVERIFIED`. |
| Portability quality | 4 | Source skill is portable, vendor-neutral, privacy-safe, and contains no project-specific assumptions; marketplace export was not updated in this content run. |

| Additional Required Row | Result |
|---|---|
| "Concept of the skill" present | yes; all 7 required labels are present. |
| Comprehension evals | 8 cases covering definition, mental_model, purpose, boundary, taxonomy, analogy, misconception, and application. |
| Comprehension raw score | Primary baseline 2/2 -> with-skill 2/2 across the first two cases; score 4.27; no failed IDs. |
| Comprehension verdict | `SKIPPED_BASELINE_HIGH` / `BASELINE_SATURATED`; remaining 6 cases skipped because the foundation model already had the concept. |
| Upstream displacement | no displacement; boundary caveat for International Futures Forum futures facilitation recorded in `references/upstream-displacement-2026-06-09.md`. |
| Governing principle / method / process | principle: lint is a floor and application certification requires a real application eval; method: source-grounded scaffold plus deterministic audit-loop checks; process: confirm first missing skill, author files, hash local truth sources, audit, route, evaluate comprehension. |
| Audit report completion score | 4. Score ceilings applied: external URL drift is unhashable in default mode, application eval is absent, two non-failing routing coverage gaps remain, and broad generated exports were not refreshed in a dirty workspace. |

## Evidence Commands

```bash
node skill-graph/scripts/skill-lint.js skills/skills/reasoning-strategy/three-horizons --no-color
node skill-graph/bin/skill-graph.js drift --record --apply skills/skills/reasoning-strategy/three-horizons
node skill-graph/bin/skill-graph.js audit three-horizons --force --audit-root /Users/jacobbalslev/Development/skill-graph/audits
node skill-graph/bin/skill-graph.js drift --write-verdict skills/skills/reasoning-strategy/three-horizons
SKILL_GRAPH_WORKSPACE=/Users/jacobbalslev/Development/skill-graph node skill-graph/scripts/generate-manifest.js --output /private/tmp/three-horizons-manifest.json
node skill-graph/bin/skill-graph.js routing-eval --manifest /private/tmp/three-horizons-manifest.json --skill three-horizons --only-asserted --json
node skill-graph/scripts/skill-audit-preflight.js three-horizons --for comprehension
node skill-graph/scripts/skill-audit-preflight.js three-horizons --for application
node skill-graph/bin/skill-graph.js evaluate --mode comprehension /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/three-horizons/evals/comprehension.json
node skill-graph/bin/skill-graph.js status three-horizons --json
git diff --check -- /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/three-horizons /Users/jacobbalslev/Development/skill-graph/audits/three-horizons
```
