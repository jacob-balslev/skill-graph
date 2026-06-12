---
name: data-modeling
description: "Use when designing logical or physical data structures: entities as stored data, keys, constraints, normalization, denormalization, provenance, lifecycle, indexing implications, and schema tradeoffs. Do NOT use for pre-implementation business concept discovery (use `conceptual-modeling`), migrations against an existing database (use `database-migration`), or formal ontology semantics (use `ontology-modeling`). Do NOT use for identify business entities and relationships without implementation details. Do NOT use for write and apply the actual migration for an existing database. Do NOT use for define OWL/RDF class axioms and reasoning rules. Do NOT use for design REST endpoints for these resources."
license: MIT
compatibility: "Portable data-modeling discipline across relational, document, graph, event-sourced, and warehouse-style systems."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"ontology-modeling\",\"entity-relationship-modeling\",\"api-design\",\"conceptual-modeling\",\"database-migration\",\"state-machine-modeling\"],\"suppresses\":[\"conceptual-modeling\"],\"verify_with\":[\"database-migration\",\"testing-strategy\",\"indexing-strategy\"],\"depends_on\":[\"conceptual-modeling\"]}"
  subject: software-architecture
  scope: "Designing logical and physical data structures — entities as stored data, keys, constraints, normalization and denormalization, provenance, lifecycle, indexing implications, and schema tradeoffs. Portable across relational and document data stores; principle-grounded, not repo-bound. Excludes pre-implementation business-concept discovery (conceptual-modeling), migrations against an existing database (database-migration), and formal ontology semantics (ontology-modeling)."
  public: "true"
  taxonomy_domain: data/modeling
  stability: experimental
  keywords: "[\"data modeling\",\"logical data model\",\"physical data model\",\"entity relationship\",\"normalization\",\"denormalization\",\"primary key\",\"foreign key\",\"schema design\",\"data provenance\"]"
  examples: "[\"turn this conceptual model into a logical schema with keys and constraints\",\"should this be normalized, denormalized, or materialized as a view?\",\"model provenance for revenue, cost, and refund fields\",\"choose identifiers and uniqueness constraints before writing the migration\"]"
  anti_examples: "[\"identify business entities and relationships without implementation details\",\"write and apply the actual migration for an existing database\",\"define OWL/RDF class axioms and reasoning rules\",\"design REST endpoints for these resources\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/data-modeling/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Data Modeling

## Concept of the skill

Designing logical and physical data structures — entities as stored data, keys, constraints, normalization and denormalization, provenance, lifecycle, indexing implications, and schema tradeoffs.

## Coverage

Design logical and physical data structures from a validated conceptual model. Covers entities as stored records, identifiers, primary keys, foreign keys, uniqueness, cardinality enforcement, normalization, denormalization, derived data, materialized views, provenance, retention, indexing implications, and schema-change risk.

## Philosophy of the skill
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

This skill ships a comprehension-eval artifact at [`examples/evals/data-modeling.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/data-modeling.json). The checklist below is the authoring gate for persistence-model decisions; the eval file is the grader surface.

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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Public: `true`
- Domain: `data/modeling`
- Scope: Designing logical and physical data structures — entities as stored data, keys, constraints, normalization and denormalization, provenance, lifecycle, indexing implications, and schema tradeoffs. Portable across relational and document data stores; principle-grounded, not repo-bound. Excludes pre-implementation business-concept discovery (conceptual-modeling), migrations against an existing database (database-migration), and formal ontology semantics (ontology-modeling).

**When to use**
- turn this conceptual model into a logical schema with keys and constraints
- should this be normalized, denormalized, or materialized as a view?
- model provenance for revenue, cost, and refund fields
- choose identifiers and uniqueness constraints before writing the migration

**Not for**
- identify business entities and relationships without implementation details
- write and apply the actual migration for an existing database
- define OWL/RDF class axioms and reasoning rules
- design REST endpoints for these resources

**Related skills**
- Depends on: `conceptual-modeling`
- Verify with: `database-migration`, `testing-strategy`, `indexing-strategy`
- Related: `ontology-modeling`, `entity-relationship-modeling`, `api-design`, `conceptual-modeling`, `database-migration`, `state-machine-modeling`

**Keywords**
- `data modeling`, `logical data model`, `physical data model`, `entity relationship`, `normalization`, `denormalization`, `primary key`, `foreign key`, `schema design`, `data provenance`

<!-- skill-graph-context:end -->
