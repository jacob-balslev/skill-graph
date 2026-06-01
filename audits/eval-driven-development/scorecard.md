# Scorecard

## Skill

`eval-driven-development`

## Audit Date

2026-06-01

## Dimensions

| Dimension | Score | Note |
|---|---:|---|
| Metadata validity | 5 | Lint passes clean after sidecar separation, field-purpose comments, legacy `concept` removal, and v8 protocol label repair. |
| Activation quality | 4 | Description, keywords, triggers, examples, and anti-examples cover realistic LLM-eval iteration scenarios and now route near-misses to available neighboring skills. |
| Relation quality | 4 | Boundaries now name current owners for eval construction, deterministic testing, result interpretation, production monitoring, and prompt-injection defense measurement. |
| Grounding fidelity | 4 | Academic benchmark sources remain linked; practitioner-source links were refreshed to current Anthropic and Inspect locations. Hash-based drift remains `UNGROUNDED` because no local `truth_sources` exist. |
| Content quality | 5 | The body has Coverage, Philosophy, five primitives, judgment-mechanism selection, iteration discipline, public-benchmark boundaries, Goodhart defenses, verification checks, negative bounds, and source grounding. |
| Eval quality | 4 | A five-case comprehension eval now covers definition, mental model, boundaries, misconception, and application, but no graded run has stamped comprehension or application verdicts. |
| Portability quality | 5 | The scope is portable and principle-grounded; no project-private assumptions remain in routing or examples. |

## Overall

PASS_WITH_FIXES. The Integrity Gate is repaired for metadata, relations, source freshness, and eval artifact presence. The Behavior Gate remains `UNVERIFIED`.
