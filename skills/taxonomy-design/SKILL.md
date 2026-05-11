---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: taxonomy-design
description: "Use when designing a controlled classification system: category trees, facets, browse taxonomies, SKOS broader/narrower relationships, tagging rules, and duplicate-category cleanup. Do NOT use for formal ontology axioms with reasoning constraints (use `ontology-modeling`), broad knowledge-representation choice (use `knowledge-modeling`), or one-off edge typing (use `semantic-relations`)."
version: 1.0.0
type: capability
browse_category: knowledge
category: modeling/taxonomy
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-11"
drift_check:
  last_verified: "2026-05-11"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Portable taxonomy design discipline for skill libraries, product information architecture, documentation trees, and knowledge graphs."
allowed-tools: Read Grep
keywords:
  - taxonomy design
  - controlled vocabulary
  - browse taxonomy
  - category hierarchy
  - facets
  - tagging rules
  - broader narrower
  - SKOS hierarchy
  - classification cleanup
  - duplicate categories
  - taxonomy governance
examples:
  - "our skill categories are drifting: some are by domain, some by activity, and some by tool - how should the taxonomy be redesigned?"
  - "should these be tags, facets, or child categories?"
  - "build a clean category tree for these concepts without making every related term a parent-child relation"
  - "we have analytics, observability, telemetry, and monitoring as categories - which should merge and which should stay separate?"
anti_examples:
  - "define OWL class restrictions and property domains for this knowledge base"
  - "decide whether this knowledge should be represented as a graph, frame, rules, or hybrid"
  - "type this single relation as meronymy, causality, synonymy, or thematic role"
  - "write user-facing labels for this navigation item"
relations:
  boundary:
    - skill: ontology-modeling
      reason: "ontology-modeling owns formal axioms and reasoning semantics; taxonomy-design owns human-governed classification"
    - skill: knowledge-modeling
      reason: "knowledge-modeling chooses the representation paradigm; taxonomy-design works inside the classification paradigm once chosen"
    - skill: semantic-relations
      reason: "semantic-relations types individual concept edges; taxonomy-design governs the category system and assignment rules"
  related:
    - information-architecture
    - skill-infrastructure
    - context-graph
  depends_on:
    - semantic-relations
  verify_with:
    - semantic-relations
    - context-graph
portability:
  readiness: scripted
  targets:
    - agent-skills
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Taxonomy Design

## Coverage

Design controlled classification systems for skills, docs, product catalogs, navigation trees, knowledge graphs, and tags. Covers hierarchy shape, facet selection, synonym control, category granularity, assignment rules, governance, and drift cleanup. Use SKOS-grade distinctions: broader/narrower for hierarchy, related for association, preferred labels for canonical terms, alternate labels for aliases.

## Philosophy

A taxonomy is a retrieval contract. It should make things findable by the people or agents who browse it, not mirror the author's private mental map. The main failure mode is mixing incompatible organizing principles: by audience, by tool, by lifecycle phase, by domain, and by risk all in the same tree.

Prefer shallow, stable, mutually understandable structure. Add facets when one tree cannot express all valid access paths. Do not turn every semantic relation into a hierarchy.

## Method

1. Name the retrieval tasks: what questions must the taxonomy answer?
2. Choose one primary organizing principle for the tree: domain, activity, artifact, lifecycle, or risk.
3. Move secondary dimensions into facets or tags.
4. Apply the substitution test to every parent-child pair: every child must be a kind of the parent.
5. Define assignment rules for ambiguous cases.
6. Add canonical labels and aliases; never let synonyms become sibling categories.
7. Test with real items and real prompts; count "misc", duplicates, and uncertain assignments.

## Verification

- [ ] Every child category passes the IS-A substitution test against its parent
- [ ] Sibling categories share the same organizing principle
- [ ] Cross-cutting concerns are facets/tags, not duplicated branches
- [ ] Canonical labels and aliases are explicit
- [ ] Ambiguous assignment rules are written down
- [ ] No category exists only because one item needed somewhere to go
- [ ] Real items can be placed without using a catch-all bucket

## Do NOT Use When

| Use instead | When |
|---|---|
| `ontology-modeling` | You need formal class/property axioms, RDF/OWL semantics, or automated reasoning. |
| `knowledge-modeling` | You are still choosing between graph, frame, rule, concept-map, or hybrid representations. |
| `semantic-relations` | You only need to type the relation between two concepts. |
| `information-architecture` | You are arranging pages, navigation, labels, and wayfinding for a user-facing experience. |

