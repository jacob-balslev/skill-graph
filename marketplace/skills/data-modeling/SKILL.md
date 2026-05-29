---
name: data-modeling
description: "Use when designing logical or physical data structures: entities as stored data, keys, constraints, normalization, denormalization, provenance, lifecycle, indexing implications, and schema tradeoffs. Do NOT use for pre-implementation business concept discovery (use `conceptual-modeling`), migrations against an existing database (use `database-migration`), or formal ontology semantics (use `ontology-modeling`). Do NOT use for identify business entities and relationships without implementation details. Do NOT use for write and apply the actual migration for an existing database. Do NOT use for define OWL/RDF class axioms and reasoning rules. Do NOT use for design REST endpoints for these resources."
license: MIT
compatibility: "Portable data-modeling discipline across relational, document, graph, event-sourced, and warehouse-style systems."
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: code-engineering
  deployment_target: portable
  taxonomy_domain: data/modeling
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"data modeling\",\"logical data model\",\"physical data model\",\"entity relationship\",\"normalization\",\"denormalization\",\"primary key\",\"foreign key\",\"schema design\",\"data provenance\"]"
  examples: "[\"turn this conceptual model into a logical schema with keys and constraints\",\"should this be normalized, denormalized, or materialized as a view?\",\"model provenance for revenue, cost, and refund fields\",\"choose identifiers and uniqueness constraints before writing the migration\"]"
  anti_examples: "[\"identify business entities and relationships without implementation details\",\"write and apply the actual migration for an existing database\",\"define OWL/RDF class axioms and reasoning rules\",\"design REST endpoints for these resources\"]"
  relations: "{\"boundary\":[{\"skill\":\"conceptual-modeling\",\"reason\":\"conceptual-modeling is implementation-neutral; data-modeling adds logical and physical data constraints\"},{\"skill\":\"database-migration\",\"reason\":\"database-migration changes an existing database; data-modeling decides the schema shape before migration\"},{\"skill\":\"ontology-modeling\",\"reason\":\"ontology-modeling formalizes meaning; data-modeling structures persisted data\"},{\"skill\":\"api-design\",\"reason\":\"api-design exposes resources and operations; data-modeling stores and constrains underlying data\"}],\"related\":[\"conceptual-modeling\",\"database-migration\",\"api-design\",\"state-machine-modeling\",\"entity-relationship-modeling\"],\"depends_on\":[\"conceptual-modeling\"],\"verify_with\":[\"database-migration\",\"testing-strategy\"]}"
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
  skill_graph_canonical_skill: skills/code-engineering/data-modeling/SKILL.md
  skill_graph_export_description_projection: anti_examples
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
- Subject: `code-engineering`
- Deployment: `portable`
- Domain: `data/modeling`

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
- Owned by `conceptual-modeling`
- Owned by `database-migration`
- Owned by `ontology-modeling`
- Owned by `api-design`

**Related skills**
- Depends on: `conceptual-modeling`
- Verify with: `database-migration`, `testing-strategy`
- Related: `conceptual-modeling`, `database-migration`, `api-design`, `state-machine-modeling`, `entity-relationship-modeling`

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-11`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `data modeling`, `logical data model`, `physical data model`, `entity relationship`, `normalization`, `denormalization`, `primary key`, `foreign key`, `schema design`, `data provenance`

<!-- skill-graph-context:end -->
