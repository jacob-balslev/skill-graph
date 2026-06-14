---
name: data-modeling
description: "Practical persistence-model design after conceptual meaning is settled: grain, identity, keys, constraints, relationships, model-family choice, derived data, provenance, lifecycle, access-pattern implications, and evolution handoff across relational, document, graph, event-sourced, vector-bearing, and warehouse systems. Do NOT use for identify business entities and relationships without implementation details. Do NOT use for draw a Chen or Crow's Foot ER diagram as the primary deliverable. Do NOT use for write and apply the actual migration for an existing database. Do NOT use for pick or tune the maintained index portfolio, HNSW settings, recall targets, or reranking. Do NOT use for design REST or GraphQL request and response JSON for these resources. Do NOT use for define OWL/RDF class axioms, SHACL shapes, or reasoning rules. Do NOT use for choose masking, anonymization, or row-level-security policy mechanics."
license: MIT
compatibility: "Portable data-modeling discipline across relational, document, graph, event-sourced, vector-bearing, and warehouse-style systems. Verify engine-specific constraint, generated-column, index, partitioning, replication, and migration behavior against the target platform before implementation."
allowed-tools: Read Grep
metadata:
  subject: software-architecture
  public: "true"
  scope: "Designing durable logical and physical persistence models after business concepts are validated: stored entities and facts, grain, identity, primary/natural/surrogate/composite keys, uniqueness, foreign keys, check constraints, nullability, cardinality enforcement, normalization, document embedding/reference choices, graph node/relationship/property shape, event streams and read models, embedding/vector record metadata, temporal history, derived data, generated columns, views, materialized views, semantic metrics, provenance, lifecycle, retention, privacy classification, access-pattern implications, and handoff to indexing, migration, testing, API-contract, and security work. Portable across relational, document, graph, event-sourced, vector-bearing, and warehouse systems; principle-grounded and engine-aware, not repo-bound. Excludes upstream concept discovery, ER notation as the main artifact, live migration mechanics, index-portfolio or ANN-vector-index tuning, HTTP/API representation design, security policy implementation, DDD aggregate-boundary design, and formal ontology axioms."
  taxonomy_domain: data/modeling
  stability: experimental
  keywords: "[\"data modeling\",\"logical data model\",\"physical data model\",\"schema design\",\"keys and constraints\",\"normalization\",\"denormalization\",\"derived data\",\"data provenance\",\"data lifecycle\"]"
  triggers: "[\"data-modeling-skill\",\"logical data model\",\"physical data model\",\"persistence model\",\"schema design decision\",\"model this data for storage\"]"
  examples: "[\"turn this conceptual model into a persistence model with keys, constraints, and relationship shape\",\"choose whether this relationship should be a foreign key, junction table, embedded document, graph relationship, or event stream\",\"decide whether this revenue value should be stored, generated, materialized, projected, or computed in a semantic layer\",\"model provenance, freshness, retention, and privacy classification for externally sourced fields\",\"design vector records with source chunk lineage, model version, ACL metadata, stale handling, and re-embedding migration\"]"
  anti_examples: "[\"identify business entities and relationships without implementation details\",\"draw a Chen or Crow's Foot ER diagram as the primary deliverable\",\"write and apply the actual migration for an existing database\",\"pick or tune the maintained index portfolio, HNSW settings, recall targets, or reranking\",\"design REST or GraphQL request and response JSON for these resources\",\"define OWL/RDF class axioms, SHACL shapes, or reasoning rules\",\"choose masking, anonymization, or row-level-security policy mechanics\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Data modeling is the load-bearing blueprint for stored facts: it decides which facts need beams, joints, inspection points, and service access before construction crews pour the concrete."
  misconception: "|"
  relations: "{\"related\":[\"data-modeling-fundamentals\",\"entity-relationship-modeling\",\"ontology-modeling\",\"api-design\",\"database-migration\",\"schema-evolution\",\"state-machine-modeling\",\"system-interface-contracts\",\"owasp-security\"],\"suppresses\":[{\"skill\":\"conceptual-modeling\",\"reason\":\"data-modeling owns persistence representation after business meaning is settled; conceptual-modeling owns implementation-neutral discovery and validation of the concepts themselves.\"},{\"skill\":\"entity-relationship-modeling\",\"reason\":\"data-modeling owns the broader persistence-model decision when the task is not primarily ER notation, diagramming, or table-by-table ER translation.\"}],\"verify_with\":[\"database-migration\",\"testing-strategy\",\"indexing-strategy\"],\"depends_on\":[\"conceptual-modeling\"]}"
  grounding: "{\"subject_matter\":\"Practical persistence data-model design across relational, document, graph, event-sourced, vector-bearing, API-backed, and analytics systems\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.postgresql.org/docs/current/ddl-constraints.html\",\"https://www.postgresql.org/docs/current/ddl-identity-columns.html\",\"https://www.postgresql.org/docs/current/ddl-generated-columns.html\",\"https://www.postgresql.org/docs/current/functions-uuid.html\",\"https://www.rfc-editor.org/rfc/rfc9562.html\",\"https://www.mongodb.com/docs/manual/data-modeling/\",\"https://www.mongodb.com/docs/manual/data-modeling/best-practices/\",\"https://www.mongodb.com/docs/manual/core/schema-validation/\",\"https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/unbounded-arrays/\",\"https://neo4j.com/docs/getting-started/data-modeling/\",\"https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl\",\"https://hasura.io/docs/3.0/data-modeling/overview/\",\"https://hasura.io/docs/3.0/reference/metadata-reference/models/\",\"https://docs.snowflake.com/en/user-guide/table-considerations\",\"https://docs.snowflake.com/en/release-notes/2026/10_19\",\"https://docs.snowflake.com/en/sql-reference/virtual-columns\",\"https://github.com/pgvector/pgvector\",\"https://docs.pinecone.io/guides/index-data/data-modeling\",\"https://qdrant.tech/documentation/manage-data/collections/\",\"https://qdrant.tech/documentation/faq/qdrant-fundamentals/\",\"https://martendb.io/events/projections/\",\"marketplace/skills/data-modeling-fundamentals/SKILL.md\",\"examples/evals/data-modeling.json\"],\"failure_modes\":[\"conceptual_model_leaks_directly_into_tables_without_grain_or_constraints\",\"identity_chosen_by_framework_default_not_domain_or_distribution_need\",\"natural_key_treated_as_immutable_without_change_policy\",\"generated_identifier_confused_with_uniqueness_or_domain_identity\",\"public_identifier_leaks_sequence_tenant_or_timestamp_information\",\"foreign_key_or_uniqueness_invariant_left_to_application_code\",\"many_to_many_relationship_missing_junction_or_relationship_entity\",\"document_embedding_chosen_without_update_fanout_or_size_boundary\",\"json_or_eav_used_to_avoid_modeling_stable_fields\",\"derived_field_stored_without_source_refresh_freshness_and_rebuild_rule\",\"denormalization_lacks_consistency_repair_plan\",\"scd_or_temporal_model_uses_current_flag_without_validity_range\",\"event_sourced_read_model_missing_ordering_idempotency_lag_or_rebuild_rule\",\"embedding_row_missing_model_dimension_source_acl_staleness_or_deletion_metadata\",\"embedding_model_upgrade_mixes_vector_spaces_without_reembedding_plan\",\"analytics_metric_has_no_declared_grain_or_semantic_definition\",\"model_ignores_retention_privacy_or_lineage_obligations\",\"schema_design_skips_migration_testing_indexing_or_security_handoff\"],\"evidence_priority\":\"equal\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/data-modeling/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---
# Data Modeling

## Concept of the skill

Data modeling turns a validated conceptual model into a durable persistence model. It decides what is stored, at what grain, under which identity, with which constraints, in which data-model family, with which derived values, provenance, retention, privacy classification, and access-pattern implications.

The output is not yet a migration file and not merely an ER diagram. It is the storage contract that downstream implementation must preserve: entities as records, relationships as keys or references, invariants as constraints or validators, derived values as generated columns/views/projections/materializations/semantic metrics or recomputed values, and lifecycle rules as retention, privacy, archive, deletion, and rebuild decisions.

This skill sits between `conceptual-modeling` and implementation. `conceptual-modeling` answers what the business means; data modeling answers how those facts should be represented and protected in storage. `database-migration` later answers how to change a live database safely. `indexing-strategy` later answers which maintained search structures the workload earns. `owasp-security` and adjacent security skills later answer masking, authorization, and privacy-control mechanics.

## Coverage

Design logical and physical data structures from a validated concept inventory. Covers:

- Stored entities, facts, and grain: one row/document/node/event/fact/projection/vector record per what?
- Identity: natural, surrogate, composite, scoped, externally supplied, generated, public, and private identifiers.
- Keys and constraints: primary keys, uniqueness, foreign keys, check constraints, nullability, exclusion-style rules, relationship cardinality, and database-vs-application enforcement.
- Relationship shape: one-to-one, one-to-many, many-to-many, self-reference, ownership/lifecycle, junctions, embedded documents, references, graph relationships, and relationship entities.
- Normalization and denormalization: functional dependencies, anomaly risk, OLTP vs OLAP needs, redundancy, consistency repair, and materialized-read decisions.
- Derived data: generated columns, virtual columns, views, materialized views, read-model projections, precomputed aggregates, semantic metrics, source-of-truth fields, refresh/freshness, rebuild, and staleness windows.
- Temporal data: current state, audit/history tables, slowly changing dimensions, bitemporal rows, event history, valid-time ranges, and current-state read models.
- Embedding/vector-bearing storage: source row or chunk identity, embedding dimension, model name/version, distance/metric compatibility, tenant and ACL filter metadata, deletion/staleness, re-embedding state, and model-migration plan.
- Data model family: relational, document, graph, event-sourced, append-only, warehouse/star, and semantic-layer models; what each preserves and what it trades away.
- Provenance and lifecycle: external source, transform lineage, audit fields, retention, deletion, archival, PII/sensitive-data flags, and regulatory obligations.
- Access-pattern implications: expected predicates, joins, traversal, sorting, aggregation, tenant/shard key, analytical scans, vector filters, and the handoff to `indexing-strategy` without doing the index portfolio inside this skill.
- Evolution risk: forward/backward compatibility, additive fields, rename/type-change risk, key migration, backfill requirements, projection rebuild, vector re-embedding, and the handoff to `database-migration` or `schema-evolution`.
- Verification: model review, invariant examples, fixture rows/documents/events/vector records, migration rehearsal questions, and test-level handoff.

## Philosophy of the skill

Data models are long-lived promises. Application code changes quickly; stored data, dashboards, integrations, audit trails, exports, ML features, customer workflows, and generated API metadata remember the first model for years. A good data model preserves business meaning, prevents invalid states close to the data, serves known reads, and can evolve without forcing every consumer to change at once.

Do not jump from concept to migration. First decide what must be stored, what can be derived, what must be constrained, what can be flexible, what must remain queryable, and what future change would be painful. The model should be explicit enough that an implementer can write migrations and indexes, but still abstract enough that it does not smuggle in a specific rollout sequence or query plan.

Prefer constraints over conventions when the storage engine can enforce the invariant. PostgreSQL treats constraints as data integrity rules that raise errors on violating writes; identity columns generate values but do not by themselves guarantee uniqueness. Snowflake standard-table primary and foreign keys are informational while hybrid-table constraints are enforced. The modeling lesson is portable: generation, naming, framework types, and documented metadata are not integrity unless the target store actually enforces them. If the invariant matters, make it enforceable or record where the compensating check lives.

Flexible stores do not remove modeling. MongoDB's flexible schema still supports schema validation for established data structures, and unbounded arrays can exceed document limits or degrade performance. A document model that hides stable entities in arbitrary JSON is not more flexible; it is less inspectable.

Denormalization is a consistency liability, not a performance badge. It can be the right choice for hot reads, dashboards, aggregate documents, read models, and semantic metrics, but every redundant value needs a source, refresh rule, stale-tolerance, reconciliation path, and owner. If those are missing, the "optimization" is only postponed corruption.

## Method

1. **Confirm the modeling layer.** Start from a conceptual model or extract only enough concept inventory to proceed. If stakeholders are still disagreeing about what exists, route to `conceptual-modeling`.
2. **Name the workload and model family.** Decide whether the dominant problem is transactional integrity, aggregate-as-document reads, relationship traversal, event history, append-only audit, semantic similarity, analytical scans, or governed metrics. Choose relational, document, graph, event-sourced, vector-bearing, warehouse, semantic-layer, or hybrid deliberately.
3. **Define grain before fields.** For every table, collection, node label, event stream, fact table, projection, metric, or vector record, write "one record represents one ___." Grain errors cause duplicate counts, impossible uniqueness rules, unclear joins, stale projections, and unclear retention.
4. **Define identity and public identifiers.** Decide what makes two records the same entity, what identifier is stored as the primary key, whether a natural key is stable enough, whether the ID is scoped by tenant/org/source, and whether the external/public identifier differs from the internal key.
5. **Place attributes by ownership and lifecycle.** Put a field on the entity whose lifecycle owns it. If a value changes independently, has metadata, has multiple instances per parent, participates in relationships, or has separate privacy/retention rules, promote it to an entity, relationship entity, document subobject, graph node/relationship, event, or projection.
6. **Choose column/document/JSON shape deliberately.** Use first-class columns or properties for stable, searched, constrained, joined, reported, privacy-classified, or provenance-bearing fields. Use JSON/document metadata for sparse or genuinely variable fields whose structure is not a core invariant. Promote JSON fields when they become common predicates, joins, metrics, retention targets, or integrity rules.
7. **Map relationships to enforceable shape.** For each relationship, record cardinality, optionality, ownership, deletion/retention behavior, and implementation: foreign key, unique foreign key, junction table, embedded document, reference, graph relationship with properties, stream link, or derived projection.
8. **Write invariants as constraints where possible.** Mark primary key, unique, not-null, foreign-key, check, exclusion, and conditional-uniqueness candidates. If the target store cannot enforce the invariant, record the application, job, trigger, validator, state authority, or contract test that does.
9. **Normalize to expose dependencies, then denormalize intentionally.** List functional dependencies for transactional data. Normalize until the update/insert/delete anomalies that matter are visible, usually 3NF for OLTP unless workload evidence says otherwise. For warehouse/OLAP models, choose fact/dimension grain, surrogate dimension keys, and semantic metric definitions rather than forcing OLTP normal forms.
10. **Classify derived data.** For every computed field, choose: compute on read, generated/virtual column, stored generated column, view, materialized view, read-model projection, precomputed aggregate, semantic metric, or stored snapshot. Record source fields, refresh trigger, freshness SLA, rebuild path, and stale-read behavior.
11. **Model embeddings as derived stored facts, not opaque search artifacts.** If vectors are stored, record source object or chunk identity, embedding model name/version, dimension, metric compatibility, tenant/ACL/filter metadata, source-text or source-media pointer, chunk order/offsets, freshness, deletion behavior, re-embedding status, and model-upgrade path. Leave ANN index parameters, recall tuning, reranking, and embedding-model selection to `indexing-strategy` or the retrieval-system owner.
12. **Design document and graph shapes by access and lifecycle.** Embed when a subobject is read with the parent, bounded in size, and shares lifecycle. Reference when it is large, reused, independently updated, independently secured, or unbounded. In graphs, model relationships as first-class typed edges with properties when traversal is the workload.
13. **Model history separately from current state.** If the business needs audit, reversal, causality, late-arriving facts, or time travel, choose append-only events, bitemporal rows, history tables, slowly changing dimensions, or ledger tables instead of overwriting state silently. Define how current-state read models are rebuilt.
14. **Represent provenance, privacy, and retention in the model.** External-source fields name source system, source identifier, import time, transform/version, confidence, freshness, and deletion/retention policy. Sensitive fields carry classification and masking/deletion implications before implementation, then hand security-control mechanics to the owning security skill.
15. **Check access-pattern implications.** List expected predicates, joins, traversal paths, sort order, aggregate dimensions, tenant/shard key, filterable vector metadata, result sizes, and write rate. This does not choose the final index set, but it gives `indexing-strategy` the workload evidence it needs.
16. **Pressure-test evolution before handoff.** Ask what happens if a field is renamed, type changes, a natural key changes, a relationship becomes many-to-many, a nullable field becomes required, history must be backfilled, a projection is rebuilt, a metric definition changes, or embeddings must be regenerated with a new model. Hand concrete rollout mechanics to `database-migration` or broader lifecycle planning to `schema-evolution`.
17. **Add verification examples.** Include valid and invalid fixture records, boundary cases, duplicate identity cases, relationship cardinality cases, stale derived data cases, temporal join cases, stale embedding cases, and deletion/retention examples. Hand test-level decisions to `testing-strategy`.

## Persistence Shape Matrix

| Shape | Prefer when | Watch for |
|---|---|---|
| Relational tables | Integrity, joins, constraints, transactional updates, ad hoc query, and long-lived facts matter | Missing constraints; ORM defaults replacing modeling; over-normalization that hides hot reads |
| Document collection | The aggregate is usually read/written as one bounded unit | Update fanout, unbounded arrays, hidden stable schema, weak cross-document invariants |
| Hybrid relational + JSON/document | Core facts are stable but some metadata is sparse or evolving | JSON used to avoid modeling stable fields; weak validation; fields that later need constraints or metrics |
| Graph model | Many-hop relationship traversal is the core workload | Treating every foreign key as a graph; missing uniqueness and property constraints |
| Event stream | History, causality, audit, replay, or append-only compliance is the primary truth | Event versioning, projection lag, rebuild cost, current-state query complexity |
| Append-only / temporal table | Corrections and history matter, but full event sourcing is too heavy | Querying current state, retention policy, storage growth, late-arriving facts |
| Warehouse/star model | Analytical aggregates by dimensions and measures dominate | Grain ambiguity, metric drift, slowly changing dimensions, semantic-layer mismatch |
| Semantic metric layer | Business metrics must be reused consistently across tools | Treating metrics as a replacement for raw model lineage, permissions, and source quality |
| Embedding-bearing record or column | Semantic similarity is needed over stored source facts and must be filtered, authorized, deleted, or refreshed with domain metadata | Mixed embedding spaces, dimension mismatch, stale vectors, ACL post-filtering, missing source chunk lineage, ANN tuning leaking into the data model |
| View / virtual column | Derived value should stay non-redundant and can compute at read time | Read cost, expression restrictions, security/privilege behavior |
| Stored generated column / materialized view / projection | Derived value is read-hot or expensive enough to precompute | Refresh/rebuild path, staleness window, consistency repair |

## Identity and Keys

| Decision | Guidance |
|---|---|
| Natural key | Use only when the business identifier is truly stable, unique, and under a governance process. Record what happens when it changes. |
| Surrogate key | Use for internal identity when business identifiers can change or are composite/noisy. Do not confuse surrogate identity with domain uniqueness. |
| Composite key | Useful for junctions, scoped identities, and external-system references. Be explicit about ORM and API friction. |
| Sequence / identity | Good for compact local identifiers. Identity generation does not guarantee uniqueness without a primary key or unique constraint. |
| UUIDv4 | Good for distributed generation and opaque public IDs; random ordering can be rough on B-tree locality in some engines. |
| UUIDv7 / time-ordered UUID | Consider when distributed uniqueness and index locality/order are both useful and the target platform supports it. UUIDv7 embeds timestamp information; do not use it as a public ID when creation time/order exposure is unacceptable. |
| Public ID vs internal key | Use separate public IDs when internal keys leak volume, sequencing, tenant structure, timestamps, or implementation detail. |
| Tenant-scoped identity | Decide whether uniqueness is global or scoped. Scoped uniqueness usually needs composite unique constraints. |

## Relationship Modeling

| Relationship pressure | Model as |
|---|---|
| One-to-one, optional extension data | Same table/document if lifecycle and privacy match; separate table/document with unique reference when lifecycle, privacy, or sparsity differs |
| One-to-many with independent child lifecycle | Child table/collection with parent reference and deletion/retention rule |
| Many-to-many | Junction table/edge collection/relationship entity with uniqueness across both sides |
| Relationship has amount, status, date, role, actor, or lifecycle | Promote the relationship to its own entity, junction-with-payload, graph relationship with properties, or event fact |
| Parent and child always read/written together and child count is bounded | Embed child documents or nested values |
| Child is large, reused, independently updated, secured, or unbounded | Reference rather than embed |
| Traversal across many relationship types is the workload | Graph nodes and typed relationships, with constraints for labels/properties where supported |
| Lifecycle has legal transitions | Pair the data model with `state-machine-modeling`; do not encode a complex lifecycle as disconnected booleans |

## Constraints and Invariants

Record every invariant in this form:

| Invariant question | Modeling output |
|---|---|
| Must this value exist? | `NOT NULL`, required document field, validation rule, or explicit nullable reason |
| Must values be unique? | Unique constraint/index, scoped uniqueness, or conflict-resolution rule |
| Must this reference exist? | Foreign key, validated reference, graph relationship constraint, or eventual-consistency rule |
| Must a value be in a range or set? | Check constraint, enum/domain type, schema validator, or application validator |
| Must two rows not overlap? | Exclusion/range constraint where available, otherwise transition/booking authority |
| Is the invariant conditional? | Partial unique constraint/index, check plus state, validator, or state machine |
| Is enforcement impossible or informational in the store? | Name the compensating authority and test, not just "handled in app" |

If a rule matters to correctness, do not leave it as prose. Either make it enforceable or record why enforcement lives elsewhere.

## Derived Data and Provenance

For every derived field or external-source field, fill this mini-contract:

| Field | Required answer |
|---|---|
| Source | Which base fields, event streams, external system, source document, or metric definition produce it? |
| Owner | Which system owns truth and who may update it? |
| Derivation | Formula, transform version, semantic metric, projection, or lookup rule |
| Storage choice | Compute on read, virtual/generated column, stored generated column, view, materialized view, projection, precomputed aggregate, semantic metric, or stored snapshot |
| Refresh | On write, scheduled, event-driven, query-time, manual rebuild, or immutable |
| Freshness | Strongly consistent, eventually consistent, acceptable staleness window, or stale marker |
| Rebuild | How to recompute from source if the value is wrong or the projection is lost |
| Provenance | Source identifier, import time, transform version, confidence, and lineage |
| Retention/privacy | Deletion, masking, archival, legal hold, and downstream propagation |

PostgreSQL and Snowflake both document virtual/generated-column behavior, and dbt centralizes metrics in the modeling layer. Treat those as options in the storage-choice column, not as excuses to skip source, refresh, freshness, and permission rules.

## Temporal Data and Slowly Changing Dimensions

Model history intentionally. Current-state rows, audit logs, history tables, event streams, and slowly changing dimensions answer different questions.

Use SCD Type 2 when historical accuracy matters and facts need to join against the version that was valid at a point in time:

```sql
CREATE TABLE customer_history (
  customer_sk  bigserial PRIMARY KEY,
  customer_id  uuid NOT NULL,
  email        text NOT NULL,
  valid_from   timestamptz NOT NULL,
  valid_to     timestamptz,
  is_current   boolean NOT NULL DEFAULT true
);
```

| Temporal choice | Behavior | Use when |
|---|---|---|
| Type 1 overwrite | Keep only current value | History is not queried and correction audit is not required |
| Type 2 validity range | New version row per change with `valid_from` and `valid_to` | Time-travel joins, late-arriving facts, and historical reporting matter |
| Type 3 prior value | Store a small number of previous-value columns | Only immediate prior value is needed |
| Bitemporal row | Track both valid/effective time and recorded/transaction time | Retroactive corrections and "what did we know then?" questions matter |
| Event stream | Store immutable state-change facts | Causality, replay, audit, and derived current-state models matter |

A current-row flag is a convenience, not a temporal model. Use validity ranges for temporal joins; otherwise late-arriving facts and historical reports will attach to the wrong version.

## Vector / Embedding Storage

Embeddings are derived data with a special access path. Keep the data-model decision focused on what facts must be stored with the vector so it can be authorized, filtered, refreshed, deleted, and regenerated. Do not turn this section into nearest-neighbor index tuning or model-selection advice.

| Modeling question | Required answer |
|---|---|
| Source identity | Which entity, document, chunk, media item, event, or snapshot produced this vector? |
| Source pointer | Where can the source text/media, chunk offsets/order, and source version be recovered? |
| Model space | Which embedding model name, version, dimension, distance metric, and preprocessing pipeline produced it? |
| Storage shape | Same table/record, separate vector table, vector database record, named vector, or separate collection/index? |
| Metadata co-location | Which tenant, ACL, language, category, deletion, freshness, and filter fields must be available inside the vector query? |
| Freshness | When does a source change make the vector stale, and how is stale data excluded or marked? |
| Deletion | How do source deletion, legal hold, masking, or access changes propagate to vector records? |
| Re-embedding | How can a new model version be backfilled without mixing incompatible vector spaces? |

Use one vector space per compatible model/dimension/metric combination. If the same source object needs multiple embeddings, named vectors can share a payload when the entity and payload schema are the same; separate tables, collections, or indexes are cleaner when payloads, scaling, isolation, or query patterns diverge. Pinecone documents records with vectors plus flat metadata and structured IDs for chunk linkage, updates, and deletes. Qdrant documents named vectors and model migration by adding a new vector, re-embedding, then removing the old vector. pgvector shows vector columns with declared dimensions in PostgreSQL. The modeling lesson is portable: store enough metadata to avoid mystery vectors, stale retrieval, authorization after-the-fact, and mixed embedding spaces.

## Normalization, Denormalization, and Read Models

Normalize transactional data until the dependencies are explicit. The goal is not to reach the highest normal form for its own sake; the goal is to understand which anomalies the model admits and whether the workload can tolerate them. Use `data-modeling-fundamentals` when the task is primarily about formal dependency theory, normal-form proofs, or relational algebra.

| Form | Practical modeling reminder |
|---|---|
| 1NF | Avoid repeating groups in relational rows; document embedding is a deliberate non-relational choice, not accidental 1NF failure. |
| 2NF | Composite keys require every non-key attribute to depend on the whole key. |
| 3NF | Transactional default: non-key facts should not depend on other non-key facts unless the anomaly is acceptable. |
| BCNF and beyond | Use when overlapping candidate keys or dependency anomalies matter enough to justify extra decomposition. |

Denormalize only with a named read path and consistency plan:

| Denormalization | Use when | Required plan |
|---|---|---|
| Redundant column | A hot read repeatedly needs a stable parent field | Update authority, backfill, drift check, and repair |
| Embedded document copy | Read locality matters and child lifecycle is bounded | Update fanout and size limit |
| Precomputed aggregate | Counts/sums are hot or expensive | Increment rule, reconciliation job, rebuild from source |
| Materialized view | Query is expensive and staleness is acceptable | Refresh schedule, dependency tracking, failure behavior |
| Event projection/read model | Event stream is truth, query model is derived | Ordering, idempotency, lag, rebuild, versioning |
| Semantic metric | Business definition must be reused across tools | Grain, dimensions, measure, filters, permissions, lineage |

If the consistency plan is "remember to update both places," the model is not finished.

## Anti-patterns

| Anti-pattern | Why it fails | Better model |
|---|---|---|
| God entity | One table/document/aggregate carries unrelated hot, cold, private, historical, and optional attributes | Decompose by identity, lifecycle, ownership, privacy, and access pattern |
| Polymorphic association with `entity_type` + `entity_id` | Normal foreign keys cannot prove that the referenced row exists across arbitrary target tables; silent orphans are common | Use concrete foreign keys per target, explicit junction/relationship entities, or a modeled supertype table when the domain truly has one |
| Soft-delete as invisible schema | Global ORM filters are missed; "deleted" rows leak into reports, uniqueness, joins, and exports | Model lifecycle explicitly with status/archival/deletion semantics and retention rules |
| Stringly typed IDs | Native IDs stored as strings bloat storage and indexes and hide type constraints | Use native UUID/integer/key types where available; separate public and internal IDs when needed |
| Premature denormalization | Redundant values drift, backfills multiply, and writes become consistency jobs | Normalize first; denormalize only for a named read path with repair plan |
| Unbounded embedded arrays | Document size, update contention, and index performance degrade as the child list grows | Bound embedded subsets or reference child records/collections |
| EAV or arbitrary JSON for stable facts | Queries become brittle, constraints disappear, and types move into application code | Promote stable, constrained, queried, or reported facts to first-class fields |
| Missing source for derived data | Nobody can explain or repair the value when it disagrees with source facts | Every derived field names source, refresh, freshness, owner, and rebuild path |
| ACL post-filtering for vectors | Nearest-neighbor results are computed before authorization, causing recall loss or leaks | Co-locate tenant/ACL/filter metadata with vector records and filter inside vector retrieval |

## Upstream Displacement Check

Current tooling improves implementation but does not displace this skill.

- **ORMs and schema-as-code tools** can declare tables, constraints, relations, and migrations, and can introspect existing databases. They do not decide domain identity, grain, invariants, retention, or which redundancy is safe.
- **Hasura DDN and similar metadata/API layers** can generate or declare API models from data sources and relationships. They increase the need for a good underlying model because the generated API reflects the stored model.
- **PostgreSQL UUIDv7, identity, and generated-column features** improve identifier and derived-column options. They change the menu of key/derived-data choices; they do not remove the need to choose public/internal identity, uniqueness, source, refresh, and timestamp-exposure policy.
- **Snowflake virtual columns and dbt Semantic Layer** centralize derived values and metrics. They reduce duplicate BI logic, but the persistence model still needs grain, lineage, freshness, permissions, and source ownership.
- **Document and graph databases** remove some relational ceremony but not modeling. MongoDB still has validation, relationships, lifecycle, and document-size failure modes; Neo4j still has nodes, relationships, properties, labels, schema, and constraints.
- **Event-sourcing frameworks and projection libraries** make read-model construction easier, but they do not decide event boundaries, projection grain, ordering, lag tolerance, idempotency, or rebuild rules.
- **Vector databases, pgvector-style columns, and integrated embedding indexes** store vectors and metadata and may support multiple vector spaces or model migrations. They do not decide source chunk identity, model/version metadata, tenant/ACL filtering, stale-vector policy, deletion propagation, or re-embedding rollout.

The displacement rule: if a platform feature can enforce or generate part of the model, use it; if it only emits a shape from prior assumptions, keep this skill in charge of the assumptions.

## Handoffs

| When the data model decides... | Hand off to |
|---|---|
| A concrete table/index/constraint must be changed in a live database | `database-migration` |
| The model will evolve across several releases or compatibility windows | `schema-evolution` |
| The maintained index portfolio should be chosen or pruned | `indexing-strategy` |
| ANN/vector index parameters, recall/latency tuning, payload indexes, or retrieval ranking must be tuned | `indexing-strategy` |
| A specific query is slow and needs diagnosis | `query-optimization` |
| A lifecycle status needs legal transitions and guards | `state-machine-modeling` |
| The public request/response representation must be designed | `api-design` or `system-interface-contracts` |
| The concept semantics need formal machine reasoning | `ontology-modeling` |
| Masking, anonymization, authorization, or security policy mechanics must be designed | `owasp-security` or the relevant security skill |
| The test level and evidence for the model change must be chosen | `testing-strategy` |

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/data-modeling.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/data-modeling.json). The checklist below is the authoring gate for persistence-model decisions; the eval file is the grader surface.

## Verification

- [ ] The conceptual model is settled enough; remaining concept disputes are routed back to `conceptual-modeling`.
- [ ] Every stored entity/table/collection/node/event/fact/projection/vector record has a declared grain.
- [ ] Every stored entity has identity criteria and a key strategy; generated IDs are not confused with uniqueness constraints.
- [ ] Natural keys, external IDs, tenant-scoped IDs, public IDs, UUIDv7 timestamps, and internal keys have change and exposure policies.
- [ ] Every relationship has cardinality, optionality, ownership/lifecycle, deletion/retention behavior, and an implementation shape.
- [ ] Relationship-with-attributes cases are promoted to relationship entities, junction-with-payload tables, graph relationships with properties, or event facts.
- [ ] Correctness invariants are enforced by constraints/validators/state authorities or have an explicit compensating control.
- [ ] Column vs JSON/document shape decisions account for stability, searchability, constraints, reporting, privacy, and schema evolution.
- [ ] OLTP normalization or OLAP/star/semantic-model decisions are tied to functional dependencies, anomaly tolerance, grain, and named workload pressure.
- [ ] Every redundant or materialized value has a source, refresh rule, freshness/staleness expectation, reconciliation path, and owner.
- [ ] Derived values distinguish compute-on-read, generated/virtual columns, stored generated columns, views, materialized views, projections, semantic metrics, and snapshots.
- [ ] Temporal/history choices distinguish current state, SCD Type 1/2/3, bitemporal rows, audit logs, event streams, and read models.
- [ ] SCD Type 2 or equivalent temporal models use validity ranges for historical joins; a current-row flag alone is not treated as sufficient.
- [ ] Document embedding/reference choices account for update fanout, document size, lifecycle, query locality, validation, and unbounded-array risk.
- [ ] Graph models identify nodes, typed relationships, labels, properties, and supported constraints rather than copying every relational table blindly.
- [ ] Vector/embedding records carry source identity, source pointer/chunk order, model name/version, dimension, metric compatibility, tenant/ACL/filter metadata, staleness/deletion policy, and re-embedding plan.
- [ ] Event-sourced/read-model choices account for event ordering, idempotency, projection lag, rebuild, versioning, and current-state query needs.
- [ ] Warehouse and semantic metrics declare fact grain, dimensions, measures, filters, permissions, lineage, and metric owner.
- [ ] Provenance is recorded for external-source and calculated fields: source ID, imported/transformed time, transform version, confidence, and lineage.
- [ ] Retention, deletion, archive, privacy classification, masking implications, and legal-hold obligations are represented where relevant.
- [ ] Expected access patterns are listed for indexing and query-planning handoff, without prematurely choosing every index.
- [ ] Schema-evolution risks are named: rename, type change, required-field backfill, relationship cardinality change, key migration, temporal backfill, projection rebuild, metric change, and vector re-embedding.
- [ ] Valid and invalid fixture rows/documents/events/vector records cover identity, cardinality, nullability, uniqueness, derived values, temporal validity, authorization metadata, and retention edge cases.
- [ ] Handoffs to `database-migration`, `schema-evolution`, `indexing-strategy`, `testing-strategy`, API/interface, and security skills are explicit.

## Do NOT Use When

| Use instead | When |
|---|---|
| `conceptual-modeling` | You are still discovering business entities, relationships, identity criteria, or stakeholder meaning without persistence detail. |
| `entity-relationship-modeling` | The main deliverable is ER notation, diagram review, Crow's Foot/Chen conventions, or table-by-table ER translation. |
| `data-modeling-fundamentals` | The task is to reason about relational algebra, normal forms, functional dependencies, or theory rather than make a practical persistence design. |
| `database-migration` | You need to write, apply, rehearse, roll back, or verify a concrete migration against an existing database. |
| `schema-evolution` | You need multi-release schema lifecycle planning across compatibility windows. |
| `indexing-strategy` | You need to design, audit, add, keep, or drop the maintained index set, including ANN/vector index parameters, recall/latency tuning, payload-index tuning, and retrieval ranking. |
| `query-optimization` | You need to diagnose one slow query with execution plans. |
| `api-design` | You need endpoint, request, response, error, pagination, versioning, or public representation design. |
| `system-interface-contracts` | You need cross-system interface contracts rather than internal storage shape. |
| `ontology-modeling` | You need formal class/property axioms, RDF/OWL semantics, SHACL validation, or reasoning constraints. |
| `state-machine-modeling` | The core problem is legal lifecycle transitions, guards, retries, and invalid states. |
| `owasp-security` | The core problem is security control design, masking/anonymization mechanics, authorization policy, or threat modeling. |

## Key Sources

Outbound source provenance for the URLs used above:

- PostgreSQL constraints docs, https://www.postgresql.org/docs/current/ddl-constraints.html - primary source for CHECK, NOT NULL, UNIQUE, PK/FK, exclusion constraints, and constraint semantics; used to ground invariant guidance.
- PostgreSQL identity columns docs, https://www.postgresql.org/docs/current/ddl-identity-columns.html - primary source for generated identity behavior and the warning that identity does not itself guarantee uniqueness; used in key-strategy guidance.
- PostgreSQL generated columns docs, https://www.postgresql.org/docs/current/ddl-generated-columns.html - primary source for stored vs virtual generated columns and restrictions; used in derived-data guidance.
- PostgreSQL UUID functions docs, https://www.postgresql.org/docs/current/functions-uuid.html - primary source for built-in UUIDv7 generation and timestamp extraction; used in identifier guidance.
- RFC 9562, https://www.rfc-editor.org/rfc/rfc9562.html - primary standards source for UUID versions, UUIDv7 timestamp behavior, database considerations, and opacity/security considerations.
- MongoDB data modeling docs, https://www.mongodb.com/docs/manual/data-modeling/ - primary source for document-model guidance.
- MongoDB data-modeling best practices, https://www.mongodb.com/docs/manual/data-modeling/best-practices/ - primary source for lifecycle, consistency, validation, and indexing considerations in document models.
- MongoDB schema validation docs, https://www.mongodb.com/docs/manual/core/schema-validation/ - primary source for selective validation in flexible schemas.
- MongoDB unbounded-array anti-pattern docs, https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/unbounded-arrays/ - primary source for bounded embedded arrays and reference/subset alternatives.
- Neo4j graph data modeling docs, https://neo4j.com/docs/getting-started/data-modeling/ - primary source for nodes, relationships, labels, properties, schema, and constraints.
- dbt Semantic Layer docs, https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl - primary source for centralized metric definitions in the modeling layer.
- Hasura DDN data modeling overview, https://hasura.io/docs/3.0/data-modeling/overview/ - primary source for declarative API schema metadata lifecycle; used in upstream-displacement analysis.
- Hasura DDN model reference, https://hasura.io/docs/3.0/reference/metadata-reference/models/ - primary source for models backed by tables, views, queries, and APIs; used to show API metadata does not replace data modeling.
- Snowflake table design considerations, https://docs.snowflake.com/en/user-guide/table-considerations - primary source for warehouse table-design considerations and constraint enforcement caveats.
- Snowflake release 10.19 notes, https://docs.snowflake.com/en/release-notes/2026/10_19 - primary source for virtual columns becoming generally available on May 22-27, 2026; `10_19` is the release-number path, not October 2026.
- Snowflake virtual columns docs, https://docs.snowflake.com/en/sql-reference/virtual-columns - primary source for query-time computed virtual-column behavior and restrictions.
- pgvector README, https://github.com/pgvector/pgvector - primary source for PostgreSQL vector columns with declared dimensions and HNSW options being index options, not logical data-model fields.
- Pinecone data-modeling docs, https://docs.pinecone.io/guides/index-data/data-modeling - primary source for vector records, metadata, structured IDs, chunk linkage, update, delete, and filtering metadata.
- Qdrant collections docs, https://qdrant.tech/documentation/manage-data/collections/ - primary source for collections, vector dimensionality, named vectors, and vector-schema updates.
- Qdrant fundamentals FAQ, https://qdrant.tech/documentation/faq/qdrant-fundamentals/ - primary source for named vectors, chunk/document payload linkage, deletion behavior, filtering, and model-migration concerns.
- Marten projections docs, https://martendb.io/events/projections/ - primary source for event-sourced projections/read models and projection lifecycles.
- Data-modeling fundamentals skill, `marketplace/skills/data-modeling-fundamentals/SKILL.md` - local source for the boundary between practical persistence design and relational-model theory.
- Data-modeling eval fixture, https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/data-modeling.json - existing eval provenance retained from the canonical skill.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Public: `true`
- Domain: `data/modeling`
- Scope: Designing durable logical and physical persistence models after business concepts are validated: stored entities and facts, grain, identity, primary/natural/surrogate/composite keys, uniqueness, foreign keys, check constraints, nullability, cardinality enforcement, normalization, document embedding/reference choices, graph node/relationship/property shape, event streams and read models, embedding/vector record metadata, temporal history, derived data, generated columns, views, materialized views, semantic metrics, provenance, lifecycle, retention, privacy classification, access-pattern implications, and handoff to indexing, migration, testing, API-contract, and security work. Portable across relational, document, graph, event-sourced, vector-bearing, and warehouse systems; principle-grounded and engine-aware, not repo-bound. Excludes upstream concept discovery, ER notation as the main artifact, live migration mechanics, index-portfolio or ANN-vector-index tuning, HTTP/API representation design, security policy implementation, DDD aggregate-boundary design, and formal ontology axioms.

**When to use**
- turn this conceptual model into a persistence model with keys, constraints, and relationship shape
- choose whether this relationship should be a foreign key, junction table, embedded document, graph relationship, or event stream
- decide whether this revenue value should be stored, generated, materialized, projected, or computed in a semantic layer
- model provenance, freshness, retention, and privacy classification for externally sourced fields
- design vector records with source chunk lineage, model version, ACL metadata, stale handling, and re-embedding migration
- Triggers: `data-modeling-skill`, `logical data model`, `physical data model`, `persistence model`, `schema design decision`, `model this data for storage`

**Not for**
- identify business entities and relationships without implementation details
- draw a Chen or Crow's Foot ER diagram as the primary deliverable
- write and apply the actual migration for an existing database
- pick or tune the maintained index portfolio, HNSW settings, recall targets, or reranking
- design REST or GraphQL request and response JSON for these resources
- define OWL/RDF class axioms, SHACL shapes, or reasoning rules
- choose masking, anonymization, or row-level-security policy mechanics
- Owned by `conceptual-modeling`: persistence representation after business meaning is settled
- Owned by `entity-relationship-modeling`: the broader persistence-model decision

**Related skills**
- Depends on: `conceptual-modeling`
- Verify with: `database-migration`, `testing-strategy`, `indexing-strategy`
- Related: `data-modeling-fundamentals`, `entity-relationship-modeling`, `ontology-modeling`, `api-design`, `database-migration`, `schema-evolution`, `state-machine-modeling`, `system-interface-contracts`, `owasp-security`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Data modeling is the load-bearing blueprint for stored facts: it decides which facts need beams, joints, inspection points, and service access before construction crews pour the concrete.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.postgresql.org/docs/current/ddl-constraints.html`, `https://www.postgresql.org/docs/current/ddl-identity-columns.html`, `https://www.postgresql.org/docs/current/ddl-generated-columns.html`, `https://www.postgresql.org/docs/current/functions-uuid.html`, `https://www.rfc-editor.org/rfc/rfc9562.html`, `https://www.mongodb.com/docs/manual/data-modeling/`, `https://www.mongodb.com/docs/manual/data-modeling/best-practices/`, `https://www.mongodb.com/docs/manual/core/schema-validation/`, `https://www.mongodb.com/docs/manual/data-modeling/design-antipatterns/unbounded-arrays/`, `https://neo4j.com/docs/getting-started/data-modeling/`, `https://docs.getdbt.com/docs/use-dbt-semantic-layer/dbt-sl`, `https://hasura.io/docs/3.0/data-modeling/overview/`, `https://hasura.io/docs/3.0/reference/metadata-reference/models/`, `https://docs.snowflake.com/en/user-guide/table-considerations`, `https://docs.snowflake.com/en/release-notes/2026/10_19`, `https://docs.snowflake.com/en/sql-reference/virtual-columns`, `https://github.com/pgvector/pgvector`, `https://docs.pinecone.io/guides/index-data/data-modeling`, `https://qdrant.tech/documentation/manage-data/collections/`, `https://qdrant.tech/documentation/faq/qdrant-fundamentals/`, `https://martendb.io/events/projections/`, `marketplace/skills/data-modeling-fundamentals/SKILL.md`, `examples/evals/data-modeling.json`

**Keywords**
- `data modeling`, `logical data model`, `physical data model`, `schema design`, `keys and constraints`, `normalization`, `denormalization`, `derived data`, `data provenance`, `data lifecycle`

<!-- skill-graph-context:end -->
