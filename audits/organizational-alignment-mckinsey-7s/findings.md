# Findings

## Skill

`mckinsey-7s`

## Audit Date

2026-06-08

## Verdict Summary

Integrity Gate: PASS for structure, sidecar shape, and focused routing evidence. Truth remains UNVERIFIED because the drift sentinel hashes local source notes but does not fetch external URLs by default; `drift_status` is `EXTERNAL_UNHASHED`.

Behavior Gate: UNVERIFIED for application behavior. Comprehension was evaluated and recorded `SKIPPED_BASELINE_HIGH` because the first two primary-dimension cases already scored 2/2 at baseline and did not regress with the skill loaded.

## Findings

No required fixes identified in the new skill source, sidecar, references, or comprehension eval.

## Reviewed Areas

ID: R1
Severity: P4
Surface: activation
Category: Activation quality - routing coverage
Problem: No defect. The activation surface is specific to McKinsey 7S and organizational alignment, and it avoids relying on generic "strategy" terms alone.
Evidence: `node skill-graph/bin/skill-graph.js routing-eval --manifest /private/tmp/mckinsey-7s-manifest.json --skill mckinsey-7s --only-asserted --json` exited 0. All 5 positive examples routed top-1 to `mckinsey-7s`; all 5 negative examples routed to named boundary skills.
Required action: None.

ID: R2
Severity: P4
Surface: relations
Category: Relation quality - graph correctness
Problem: No defect. Boundary relations separate internal organization-alignment diagnosis from adjacent strategy, activity, resource, factor-inventory, and execution-goal methods by mechanism.
Evidence: `relations.boundary` names `porters-five-forces`, `value-chain-analysis`, `vrio`, `swot-tows`, `okrs`, and `playing-to-win` with reasons; routing evidence shows hard negatives resolved to the named owners for all asserted negative cases.
Required action: None.

ID: R3
Severity: P4
Surface: grounding
Category: Grounding quality - claims vs truth sources
Problem: No defect in local grounding. External URL hashing is not available in the default drift mode, so truth remains honestly UNVERIFIED rather than PASS.
Evidence: `node skill-graph/bin/skill-graph.js drift --record --apply skills/skills/reasoning-strategy/mckinsey-7s` recorded hashes for `references/mckinsey-7s-sources.md` and `references/upstream-displacement-2026-06-08.md`. `node skill-graph/bin/skill-graph.js drift --write-verdict skills/skills/reasoning-strategy/mckinsey-7s` stamped `drift_status: EXTERNAL_UNHASHED` for the three external URL sources.
Required action: None in this run. Re-check external sources on the next content audit.

ID: R4
Severity: P4
Surface: content
Category: Content quality - completeness and density
Problem: No defect. The skill includes a concept card, domain context, coverage, philosophy, workflow, output template, boundary rules, verification checklist, negative-use table, and source references.
Evidence: `SKILL.md` is 345 lines; the template-residue scan for `TEMPLATE NOTE`, `your-skill`, `path/to`, `TODO`, and `lorem` returned no matches. The body explicitly covers current-vs-target mapping, element interactions, root-cause prioritization, and the McKinsey 2025 Organize to Value boundary.
Required action: None.

ID: R5
Severity: P4
Surface: evals
Category: Eval quality - coverage and realism
Problem: No defect for comprehension coverage. Application eval coverage remains intentionally UNVERIFIED because no `evals/application.json` was authored in this run.
Evidence: `evals/comprehension.json` contains 8 cases across definition, mental_model, purpose, boundary, taxonomy, analogy, misconception, and application dimensions. `node skill-graph/bin/skill-graph.js evaluate --mode comprehension .../evals/comprehension.json` exited 0, wrote receipt `agent-orchestration/logs/eval-results/mckinsey-7s/2026-06-08T00-10-47-545Z.json`, and stamped `comprehension_verdict: SKIPPED_BASELINE_HIGH`, `eval_score=4.38`, `eval_failed_ids=[]`.
Required action: Author `evals/application.json` in a later content audit if application-level certification is needed.

## Required Fixes

None.

## Residual Risks And Deferred Checks

- Full corpus manifest validation is blocked by pre-existing unrelated skills with missing `scope`, stale `schema_version`, invalid `evidence_priority`, and other manifest-shape issues. The temporary manifest still included `mckinsey-7s` and supported focused routing checks.
- Application behavior remains `UNVERIFIED`; no application eval artifact exists yet.
- External URL drift remains `EXTERNAL_UNHASHED` by design because the default drift command does not fetch URL content.
