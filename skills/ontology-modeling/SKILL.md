---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: ontology-modeling
description: "Use when formalizing domain meaning with classes, properties, constraints, RDF/OWL-style semantics, SHACL-like validation shapes, or reasoning-ready axioms. Do NOT use for simple category trees (use `taxonomy-design`), pre-implementation business entity sketches (use `conceptual-modeling`), database schemas (use `data-modeling`), or broad representation choice (use `knowledge-modeling`)."
version: 1.0.0
type: capability
category: foundations
domain: foundations/ontology
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
  notes: "Portable ontology modeling guidance; implementation can be Markdown, RDF, JSON-LD, OWL, SHACL, or an internal schema language."
allowed-tools: Read Grep
keywords:
  - ontology modeling
  - formal semantics
  - RDF
  - OWL
  - JSON-LD
  - SHACL
  - class axioms
  - property domains
  - property ranges
  - disjoint classes
  - reasoning constraints
  - semantic interoperability
examples:
  - "we need class and property definitions that another system can reason over, not just a human-readable diagram"
  - "should Customer and Organization be disjoint classes in this ontology?"
  - "define property domains and ranges for our skill graph export"
  - "turn this conceptual model into a machine-checkable ontology without inventing database tables"
anti_examples:
  - "make a simple browse category tree for skills"
  - "identify the business entities and relationships before implementation"
  - "design the SQL tables, keys, and indexes"
  - "choose whether this knowledge belongs in rules, frames, a graph, or a hybrid"
relations:
  boundary:
    - skill: taxonomy-design
      reason: "taxonomy-design owns informal classification and facets; ontology-modeling owns formal semantics"
    - skill: conceptual-modeling
      reason: "conceptual-modeling is stakeholder-readable domain analysis; ontology-modeling is machine-checkable semantic formalization"
    - skill: data-modeling
      reason: "data-modeling owns persistence structure and constraints; ontology-modeling owns meaning constraints"
    - skill: knowledge-modeling
      reason: "knowledge-modeling chooses the representation paradigm; ontology-modeling applies one formal paradigm"
  related:
    - semantic-relations
    - taxonomy-design
    - knowledge-modeling
  depends_on:
    - semantic-relations
  verify_with:
    - semantic-relations
    - conceptual-modeling
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Ontology Modeling

## Coverage

Formalize domain meaning into classes, properties, constraints, and axioms. Covers class hierarchy, object/data properties, domain/range, cardinality constraints, equivalence, disjointness, identity, controlled vocabularies, validation shapes, and interop-oriented JSON-LD/RDF projection. The output may be an actual ontology file or a precise ontology sketch before implementation.

## Philosophy

Ontology modeling is only worth its cost when ambiguity, interoperability, validation, or reasoning matter. Most teams do not need OWL. They need clear conceptual models and controlled vocabularies. Escalate to ontology when another consumer must compute over the semantics, validate instances against constraints, or align meaning across systems.

The ontology must preserve business meaning while stating which inferences are allowed. A vague ontology is worse than no ontology because it gives false confidence to downstream tools.

## Method

1. Identify competency questions: what must the ontology answer or validate?
2. Separate classes, instances, and literals.
3. Define properties with domain, range, direction, and cardinality where needed.
4. Add equivalence and disjointness only when the claim is durable.
5. Reuse existing vocabularies where they fit; do not rename standards for style.
6. Validate against positive and negative instance examples.
7. Document open-world vs closed-world assumptions.

## Verification

- [ ] Every class exists to answer a competency question
- [ ] Property domain and range are explicit where consumers depend on them
- [ ] Disjointness claims are intentional and tested with counterexamples
- [ ] Synonyms are aliases, not duplicate classes
- [ ] The model distinguishes class, instance, and literal values
- [ ] Validation examples include invalid cases
- [ ] Reasoning assumptions are stated

## Do NOT Use When

| Use instead | When |
|---|---|
| `taxonomy-design` | You need a human-governed category tree or facets, not formal axioms. |
| `conceptual-modeling` | You are still discovering business entities and relationships with stakeholders. |
| `data-modeling` | You need persistence schema, keys, indexes, or denormalization decisions. |
| `semantic-relations` | You only need to choose the relation type between concepts. |

