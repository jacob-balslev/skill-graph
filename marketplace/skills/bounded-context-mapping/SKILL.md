---
name: bounded-context-mapping
description: "Use when drawing Domain-Driven Design boundaries: bounded contexts, context maps, ownership seams, upstream/downstream relationships, anti-corruption layers, shared kernels, and translation boundaries. Do NOT use for pre-DDD entity discovery (use `conceptual-modeling`), database schema design (use `data-modeling`), or HTTP endpoint design (use `api-design`). Do NOT use for list entities, attributes, and cardinalities before any architecture decision. Do NOT use for create SQL tables, foreign keys, and indexes. Do NOT use for design REST routes and response envelopes. Do NOT use for write an ADR for the boundary decision after we already chose it."
license: MIT
compatibility: "Portable DDD boundary-mapping discipline for monoliths, modular monoliths, services, event-driven systems, and agent workspaces."
allowed-tools: Read Grep
metadata:
  relations: "{\"boundary\":[\"conceptual-modeling\"]}"
  schema_version: "8"
  version: "1.0.0"
  subject: software-architecture
  deployment_target: portable
  scope: "Drawing Domain-Driven Design boundaries — bounded contexts, context maps, ownership seams, upstream/downstream relationships, anti-corruption layers, shared kernels, and translation boundaries. Portable across any DDD-modeled system; principle-grounded, not repo-bound. Excludes pre-DDD entity discovery (conceptual-modeling), database schema design (data-modeling), and HTTP endpoint design (api-design)."
  taxonomy_domain: architecture/domain-boundaries
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"bounded context\",\"context map\",\"domain-driven design\",\"DDD boundary\",\"anti-corruption layer\",\"shared kernel\",\"upstream downstream\",\"conformist\",\"customer supplier\",\"domain boundary\"]"
  examples: "[\"orders, fulfillment, payments, and support all use status differently - where should the bounded contexts be?\",\"map the upstream/downstream relationships before we split this module\",\"do we need an anti-corruption layer between our canonical order model and Shopify?\",\"which concepts belong to a shared kernel and which are context-local?\"]"
  anti_examples: "[\"list entities, attributes, and cardinalities before any architecture decision\",\"create SQL tables, foreign keys, and indexes\",\"design REST routes and response envelopes\",\"write an ADR for the boundary decision after we already chose it\"]"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/bounded-context-mapping/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Bounded Context Mapping

## Coverage

Map domain ownership boundaries and relationships between contexts. Covers bounded context naming, context maps, ubiquitous language separation, upstream/downstream relationships, shared kernel, conformist, customer/supplier, partnership, open host service, published language, anti-corruption layer, and boundary validation against real change scenarios.

## Philosophy

A bounded context is a language and ownership boundary, not a deployment unit. Splitting services without splitting language creates distributed coupling. Keeping one module while mixing incompatible meanings creates hidden domain bugs.

The central question is: "Where does this word mean something different?" Those differences drive boundaries more reliably than folder layout, teams, or database tables.

## Method

1. Extract candidate terms and workflows from requirements, code, docs, and incidents.
2. Mark terms whose meaning changes by actor or workflow.
3. Group concepts that change together under the same business capability.
4. Draw context boundaries around language consistency, not technical layers.
5. Label relationships: upstream/downstream, partnership, shared kernel, conformist, or anti-corruption.
6. Define translation points and ownership of canonical terms.
7. Stress-test with change scenarios: who changes, who breaks, who must approve?

## Verification

- [ ] Each context has a coherent language that does not overload key terms
- [ ] Cross-context communication uses explicit contracts or translation
- [ ] Shared kernels are intentionally small and high-stability
- [ ] Upstream/downstream power dynamics are named
- [ ] Anti-corruption layers protect local language from external models
- [ ] Boundary decisions were tested against real feature-change scenarios
- [ ] No boundary is based only on folder, team, or database layout

## Do NOT Use When

| Use instead | When |
|---|---|
| `conceptual-modeling` | You need to discover entities and relationships before assigning ownership boundaries. |
| `data-modeling` | You need logical or physical data structures. |
| `api-design` | You need HTTP route, request, response, status, or versioning design. |
| `architecture-decision-records` | You need to record a decision that has already been made. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Deployment: `portable`
- Domain: `architecture/domain-boundaries`
- Scope: Drawing Domain-Driven Design boundaries — bounded contexts, context maps, ownership seams, upstream/downstream relationships, anti-corruption layers, shared kernels, and translation boundaries. Portable across any DDD-modeled system; principle-grounded, not repo-bound. Excludes pre-DDD entity discovery (conceptual-modeling), database schema design (data-modeling), and HTTP endpoint design (api-design).

**When to use**
- orders, fulfillment, payments, and support all use status differently - where should the bounded contexts be?
- map the upstream/downstream relationships before we split this module
- do we need an anti-corruption layer between our canonical order model and Shopify?
- which concepts belong to a shared kernel and which are context-local?

**Not for**
- list entities, attributes, and cardinalities before any architecture decision
- create SQL tables, foreign keys, and indexes
- design REST routes and response envelopes
- write an ADR for the boundary decision after we already chose it

**Keywords**
- `bounded context`, `context map`, `domain-driven design`, `DDD boundary`, `anti-corruption layer`, `shared kernel`, `upstream downstream`, `conformist`, `customer supplier`, `domain boundary`

<!-- skill-graph-context:end -->
