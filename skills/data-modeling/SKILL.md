---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: data-modeling
description: "Use when designing logical or physical data structures: entities as stored data, keys, constraints, normalization, denormalization, provenance, lifecycle, indexing implications, and schema tradeoffs. Do NOT use for pre-implementation business concept discovery (use `conceptual-modeling`), migrations against an existing database (use `database-migration`), or formal ontology semantics (use `ontology-modeling`)."
version: 1.0.0
type: capability
category: engineering
domain: data/modeling
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-11"
drift_check:
  last_verified: "2026-05-11"
eval_artifacts: present
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Portable data-modeling discipline across relational, document, graph, event-sourced, and warehouse-style systems."
allowed-tools: Read Grep
keywords:
  - data modeling
  - logical data model
  - physical data model
  - entity relationship
  - normalization
  - denormalization
  - primary key
  - foreign key
  - schema design
  - data provenance
  - indexing implications
examples:
  - "turn this conceptual model into a logical schema with keys and constraints"
  - "should this be normalized, denormalized, or materialized as a view?"
  - "model provenance for revenue, cost, and refund fields"
  - "choose identifiers and uniqueness constraints before writing the migration"
anti_examples:
  - "identify business entities and relationships without implementation details"
  - "write and apply the actual migration for an existing database"
  - "define OWL/RDF class axioms and reasoning rules"
  - "design REST endpoints for these resources"
relations:
  boundary:
    - skill: conceptual-modeling
      reason: "conceptual-modeling is implementation-neutral; data-modeling adds logical and physical data constraints"
    - skill: database-migration
      reason: "database-migration changes an existing database; data-modeling decides the schema shape before migration"
    - skill: ontology-modeling
      reason: "ontology-modeling formalizes meaning; data-modeling structures persisted data"
    - skill: api-design
      reason: "api-design exposes resources and operations; data-modeling stores and constrains underlying data"
  related:
    - conceptual-modeling
    - database-migration
    - api-design
    - state-machine-modeling
  depends_on:
    - conceptual-modeling
  verify_with:
    - database-migration
    - testing-strategy
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Data Modeling

## Coverage

Design logical and physical data structures from a validated conceptual model. Covers entities as stored records, identifiers, primary keys, foreign keys, uniqueness, cardinality enforcement, normalization, denormalization, derived data, materialized views, provenance, retention, indexing implications, and schema-change risk.

## Philosophy

Data models are long-lived promises. Application code changes quickly; stored data and integrations remember mistakes. A good data model preserves business meaning, supports expected queries, and prevents invalid states without overfitting to today's UI.

Do not jump from concept to migration. First decide what must be stored, what can be derived, what must be constrained, and what must remain queryable.

## Method

1. Start from a conceptual model or extract one quickly.
2. Define identity and uniqueness for each stored entity.
3. Map relationships to keys, junctions, embeddings, or references.
4. Decide normalization vs denormalization based on write/read patterns and consistency requirements.
5. Mark derived fields and their source of truth.
6. Add provenance for data sourced from external systems or calculations.
7. Check query patterns and indexing implications.
8. Hand off to `database-migration` for implementation changes.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/data-modeling.json`](../../examples/evals/data-modeling.json). The checklist below is the authoring gate for persistence-model decisions; the eval file is the grader surface.

## Verification

- [ ] Every stored entity has identity and uniqueness criteria
- [ ] Relationship cardinality is enforceable or intentionally documented
- [ ] Derived data names its source and refresh rule
- [ ] Denormalization has a stated read/write tradeoff
- [ ] External-source fields carry provenance
- [ ] Retention and privacy obligations are represented where relevant
- [ ] Expected queries can be served without accidental full scans at scale

## Do NOT Use When

| Use instead | When |
|---|---|
| `conceptual-modeling` | You are still discovering business concepts without persistence details. |
| `database-migration` | You need to write, apply, or verify a concrete migration. |
| `ontology-modeling` | You need formal semantic axioms or reasoning constraints. |
| `api-design` | You need endpoint, request, response, error, and versioning design. |
