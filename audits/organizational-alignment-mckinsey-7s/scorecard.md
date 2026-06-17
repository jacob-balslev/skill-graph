# Scorecard

## Skill

`mckinsey-7s`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Focused lint passes: `OK skills/skills/reasoning-strategy/mckinsey-7s/SKILL.md`, 0 errors, 0 warnings. |
| Activation quality | 5 | Asserted routing exits 0 with all 5 positives top-1 to `mckinsey-7s` and all 5 negatives routed to named boundary skills. |
| Relation quality | 5 | Boundary relations point to existing adjacent strategy skills and use mechanism-level ownership reasons. |
| Grounding fidelity | 4 | Local source notes are hashed; external McKinsey and ScienceDirect URLs are reviewed and cited but remain `EXTERNAL_UNHASHED`, so truth stays `UNVERIFIED`. |
| Content quality | 5 | Complete concept card, domain context, coverage, workflow, output template, boundary table, verification checklist, and negative-use table; no template residue. |
| Eval quality | 4 | Comprehension eval has 8 realistic cases across 8 dimensions and evaluator exited 0; application eval is not authored, so application behavior remains `UNVERIFIED`. |
| Portability quality | 4 | Source skill is portable, vendor-neutral, privacy-safe, and contains no project-specific assumptions; marketplace export was not updated in this content run. |

| Additional Required Row | Result |
|---|---|
| "Concept of the skill" present | yes; all 7 required labels are present. |
| "Concept of the skill" word count | 230 words. |
| Comprehension evals | 8 cases covering 8 rubric dimensions: definition, mental_model, purpose, boundary, taxonomy, analogy, misconception, application. |
| Comprehension raw score | Primary baseline 2/2 -> with-skill 2/2; legacy raw-score avg baseline 7 -> with-skill 8. |
| Comprehension delta avg | +0 primary delta; verdict `SKIPPED_BASELINE_HIGH` / classification `BASELINE_SATURATED`. |
| "Concept of the skill" verdict | AUTHORED. |
| Upstream displacement | no displacement; boundary caveat for McKinsey's 2025 Organize to Value refresh recorded in `references/upstream-displacement-2026-06-08.md`. |
| Governing principle / method / process | principle: lint is a floor and application certification requires a real application eval; method: source-grounded scaffold plus deterministic audit-loop checks; process: confirm first missing skill, author files, hash local truth sources, audit, route, evaluate comprehension; hard gate: focused lint exit 0 and asserted routing exit 0. |
| Audit report completion score | 4. Score ceilings applied: external URL drift is unhashable in default mode but disclosed with source-review evidence; application eval is absent and explicitly left `UNVERIFIED`; corpus manifest validation is blocked by unrelated pre-existing issues. |

## Evidence Commands

```bash
node skill-graph/scripts/skill-lint.js skills/skills/reasoning-strategy/mckinsey-7s --no-color
node skill-graph/bin/skill-graph.js drift --record --apply skills/skills/reasoning-strategy/mckinsey-7s
node skill-graph/bin/skill-graph.js audit mckinsey-7s --force --audit-root /Users/jacobbalslev/Development/skill-graph/audits
node skill-graph/bin/skill-graph.js drift --write-verdict skills/skills/reasoning-strategy/mckinsey-7s
SKILL_GRAPH_WORKSPACE=/Users/jacobbalslev/Development/skill-graph node skill-graph/scripts/generate-manifest.js --output /private/tmp/mckinsey-7s-manifest.json
node skill-graph/bin/skill-graph.js routing-eval --manifest /private/tmp/mckinsey-7s-manifest.json --skill mckinsey-7s --only-asserted --json
node skill-graph/bin/skill-graph.js evaluate --mode comprehension /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/mckinsey-7s/evals/comprehension.json
node scripts/skill-audit-preflight.js mckinsey-7s --for comprehension
node scripts/skill-audit-preflight.js mckinsey-7s --for application
node skill-graph/bin/skill-graph.js status mckinsey-7s --json
node scripts/check-protocol-consistency.js
git diff --check -- /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/mckinsey-7s /Users/jacobbalslev/Development/skill-graph/audits/mckinsey-7s
```
