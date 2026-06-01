# Scorecard

## Skill

`cognitive-load-theory`

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | `node bin/skill-graph.js lint cognitive-load-theory` passes with 0 errors and 0 warnings after sidecar split, required `scope`, field comments, and protocol-label repair. |
| Activation quality | 4 | Description, keywords, and triggers clearly target cognitive-load diagnosis across skill content, prompts, docs, dashboards, and agent output. |
| Relation quality | 4 | Relations now point at current neighboring skills and distinguish CLT diagnosis from session context, prompt tactics, context-window budgets, and compression mechanics. |
| Grounding fidelity | 4 | Portable CLT claims are supported by the local Sweller/Cowan reference file; drift check is ungrounded to external hashes but concept sources are explicit. |
| Content quality | 5 | The skill has a strong concept card, concrete load taxonomy, checklists, worked examples, UI/prompt applications, failure modes, rating criteria, and negative bounds. |
| Eval quality | 4 | Current `evals/comprehension.json` exists with five cases covering definition, mental model, boundary, misconception, and application. No graded run yet. |
| Portability quality | 4 | Retired/private skill references were removed and the remaining content is portable across Markdown/docs/UI/prompt review contexts. |

## Overall

Integrity Gate: PASS

Behavior Gate: UNVERIFIED
