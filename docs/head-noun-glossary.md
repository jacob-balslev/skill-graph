# Head-Noun Glossary

> Type: Reference
> Purpose: Canonical head nouns for skill names, derived from current live usage.
> Last updated: 2026-05-16 (Deferred-skills promotion: `models`, `management` added as new active head nouns; `fundamentals` 2->3 and `architecture` 6->7 from component-architecture + security-fundamentals authoring)

## What this is

A skill name is a **noun-anchored compound**, not a verb. The **head noun** is the rightmost segment of the kebab-case name and tells the reader what kind of thing the skill is.

- `component-architecture` — head = `architecture`, modifier = `component`
- `client-server-boundary` — head = `boundary`, modifiers = `client`, `server`
- `epistemic-grounding` — head = `grounding`, modifier = `epistemic`

This file enumerates head nouns currently in use across the 102 skills in `skill-graph/skills/`, plus head nouns reserved for upcoming gap-fill skills. Adding a new head noun to a skill name should require justifying it here.

## Why head nouns matter

Verb-prefix names (`polish-`, `audit-`, `critique-`, `improve-`) don't compose with the protocol's taxonomy axes. They look like commands, not concepts. Noun-anchored names compose: `category × head-noun` is a clean two-dimensional lookup that the router can reason about.

The skills that violate this convention live in `name-exceptions.yaml` with citations for why they're industry term-of-art.

## Active head nouns (derived from live skill names)

| Head noun | Live count | Example skills |
|---|---|---|
| `modeling` | 7 | conceptual-modeling, data-modeling, entity-relationship-modeling, knowledge-modeling, ontology-modeling, state-machine-modeling, observability-modeling |
| `design` | 10 | api-design, agent-eval-design, color-system-design, event-contract-design, taxonomy-design, theme-system-design, test-doubles-design, integration-test-design, e2e-test-design, server-components-design, server-actions-design |
| `testing` | 5 | contract-testing, mutation-testing, property-based-testing, snapshot-testing, performance-testing |
| `architecture` | 7 | component-architecture, dependency-architecture, design-system-architecture, form-ux-architecture, frontend-architecture, streaming-architecture, agent-engineering (umbrella) |
| `strategy` | 6 | testing-strategy, seo-strategy, tool-call-strategy, test-coverage-strategy, indexing-strategy, sharding-strategy |
| `development` | 4 | spec-driven-development, ai-native-development, eval-driven-development, test-driven-development |
| `engineering` | 3 | agent-engineering, performance-engineering, prompt-craft (suffix-style) |
| `analysis` | 3 | diff-analysis, research-synthesis, task-analysis |
| `patterns` | 5 | interaction-patterns, vercel-composition-patterns, replication-patterns, hooks-patterns, suspense-patterns |
| `fundamentals` | 3 | acid-fundamentals, data-modeling-fundamentals, security-fundamentals |
| `mapping` | 2 | bounded-context-mapping, journey-mapping |
| `recognition` | 2 | intent-recognition, pattern-recognition |
| `composition` | 2 | design-module-composition, layout-composition |
| `boundary` | 2 | client-server-boundary, error-boundary |

## Single-instance head nouns (kept for completeness)

`audit`, `cognition`, `craft`, `defense` (live in `prompt-injection-defense`), `evolution` (live in `schema-evolution`), `extraction`, `feedback`, `flow` (live in `tool-call-flow`), `foundations`, `governance`, `hierarchy`, `humanizer`, `infrastructure`, `isolation` (live in `transaction-isolation`), `management` (live in `state-management`), `migration`, `models` (live in `mental-models`), `monitor`, `optimization` (live in `query-optimization`), `palette`, `pooling` (live in `connection-pooling`), `queue`, `relations`, `review`, `router`, `routing`, `scaffold`, `scheduling`, `semantics`, `semiotics`, `solving`, `storming`, `summarization`, `synthesis`, `system`, `thinking`, `tracking`, `tradeoffs` (live in `cap-theorem-tradeoffs`), `ui` (live in `generative-ui`), `updates`, `ux`, `window`.

## Reserved head nouns (gap-fill skills, not yet authored)

All Wave 1–5 reservations are now live in source. New gap-fill waves will populate this section.

_(empty — all reservations promoted to Active or Single-instance lists)_

## Rules

1. **Use an existing head noun when one fits.** Don't invent new ones for nominal variation.
2. **One head noun per skill name.** The compound is `<modifier(s)>-<head>`. Modifiers can be multi-segment (`client-server-`), the head is always the last segment.
3. **No verb prefixes.** Banned in the head position and as standalone names: `audit-X`, `polish-X`, `critique-X`, `improve-X`, `fix-X`. Exception: when the verb has a noun reading that is the industry term-of-art (e.g. `code-review`, `design-review`, `event-storming`). These must be enumerated in `docs/name-exceptions.yaml` with a citation.
4. **Adding a new head noun.** Update this glossary in the same commit as the skill, with the live example and a one-line rationale. Drift between glossary and live names is a lint warning candidate.

## See also

- `docs/name-exceptions.yaml` — Established industry term-of-art skills that violate the head-noun rule.
- `SKILL_METADATA_PROTOCOL.md` § `name` — the schema pattern (`^[a-z0-9][a-z0-9-/:]*$`) is the shape; this glossary is the policy.
- `scripts/lint/check-category-enum.js` — companion lint check for the category axis.
