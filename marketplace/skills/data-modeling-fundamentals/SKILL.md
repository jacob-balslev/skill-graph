---
name: data-modeling-fundamentals
description: "Use when reasoning about the foundational theory beneath data modeling: Codd's relational model (1970) and the algebra it sits on, the normal forms (1NF, 2NF, 3NF, BCNF, 4NF, 5NF) as a precise sequence of constraint-elimination steps, functional dependencies and the closure algorithm, Chen's entity-relationship model (1976) as a higher-abstraction layer above relations, the principled case for and against denormalization, the relational-vs-document tradeoff at the conceptual level, the immutable-data-model alternative (event sourcing, append-only tables), and the historical and theoretical literature that grounds modern database design. Do NOT use for practical persistence design and method (use data-modeling), for safely applying changes to an existing schema (use schema-evolution), for choosing what indexes to maintain (use indexing-strategy), or for the conceptual-modeling layer above the data model (use conceptual-modeling)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: code-engineering
  deployment_target: portable
  taxonomy_domain: engineering/data
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"relational model\",\"Codd\",\"normalization\",\"normal forms\",\"functional dependency\",\"1NF\",\"2NF\",\"3NF\",\"BCNF\",\"4NF\"]"
  triggers: "[\"what normal form is this\",\"should this be normalized or denormalized\",\"explain functional dependencies\",\"relational vs document model\",\"Codd's rules\"]"
  examples: "[\"explain why a table is in 2NF but not 3NF and what change would bring it to 3NF\",\"decide whether a workload's read pattern justifies denormalization against the theoretical baseline\",\"compare the relational, document, and event-sourced models at the conceptual level for a given domain\",\"trace a functional-dependency closure to find a candidate key\"]"
  anti_examples: "[\"design the practical schema for a new persistence layer (use data-modeling)\",\"apply an expand-contract migration to change an existing schema (use schema-evolution)\",\"choose which indexes to maintain (use indexing-strategy)\",\"discover business entities without implementation details (use conceptual-modeling)\"]"
  relations: "{\"related\":[\"data-modeling\",\"conceptual-modeling\",\"entity-relationship-modeling\",\"schema-evolution\"],\"boundary\":[{\"skill\":\"data-modeling\",\"reason\":\"data-modeling owns the practical method of designing persistence — turn a conceptual model into a working schema with keys, constraints, indexing implications. This skill owns the theoretical foundations beneath that method — what normal forms guarantee, what Codd's relational model formally provides, the algebra that makes joins composable, and the principled justification for or against denormalization. They are companion skills: theory and practice.\"},{\"skill\":\"conceptual-modeling\",\"reason\":\"conceptual-modeling owns implementation-neutral business-concept discovery (entities, relationships, attributes as business reality). This skill owns the formal data-model layer below conceptual modeling: the relational model, the algebra, the dependency theory. The two compose: conceptual modeling identifies entities; data-modeling-fundamentals formalizes how those entities map to relations.\"},{\"skill\":\"entity-relationship-modeling\",\"reason\":\"entity-relationship-modeling owns the ER notation and method (entities, relationships, cardinality, ER diagrams) as developed by Chen and extended by Bachman, Barker, and others. This skill owns the broader theoretical frame including the relational model that ER diagrams typically translate into. The boundary: ER is the diagramming and discovery layer; the relational model is the formal target.\"},{\"skill\":\"schema-evolution\",\"reason\":\"schema-evolution owns the migration mechanics — how to change a deployed schema without downtime. This skill owns the static theory of what a good schema is. The decision 'this schema should be in 3NF' is grounded by this skill; the application of that decision to a live database is `schema-evolution`'s domain.\"}],\"verify_with\":[\"data-modeling\",\"entity-relationship-modeling\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Data-modeling fundamentals is to schema design what Euclidean geometry is to architecture — the architect does not draw a right-angled wall by intuition each time; they draw it because the geometry guarantees stability and squares lock together. A schema in 3NF is the wall built to plumb, where every dependency is structural and no anomaly is hiding in the carpentry. Denormalization is the deliberate decision to cut a non-load-bearing wall for an open floor plan — defensible when the workload justifies it, indefensible when the cost is invisible."
  misconception: "|"
  concept: "{\"definition\":\"Data-modeling fundamentals is the body of formal theory beneath practical database design: Codd's relational model (1970), which represents data as relations (sets of tuples) and provides a closed algebra (selection, projection, join, union, intersection, difference, division) for querying them; the normal forms (1NF through 5NF and BCNF), each defined by the elimination of a specific class of dependency anomaly; the theory of functional dependencies and the closure algorithm used to derive normal-form membership and candidate keys; Chen's entity-relationship model (1976), which sits above the relational model as a higher-abstraction modeling layer that translates downward into relations; the principled justifications for normalization (avoid update, insert, delete anomalies) and for denormalization (workload-driven performance trade-offs against the normal-form baseline); and the alternative data models — document, graph, key-value, columnar, event-sourced — each of which can be characterized by what relational primitives it preserves, relaxes, or trades for a different access pattern. The skill is the *theory* a practitioner draws on when deciding what shape data should take and why; the practical application of that theory is `data-modeling`.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/data-modeling-fundamentals/SKILL.md
---

# Data Modeling Fundamentals

## Coverage

The body of formal theory beneath practical database design. Covers Codd's relational model (1970), the closed relational algebra (selection, projection, join, union, difference, division), functional dependencies and the closure algorithm, the normal forms (1NF through 5NF, BCNF, with notes on 6NF and DKNF), Chen's entity-relationship model (1976) and its extensions, the principled framing of normalization vs denormalization as anomaly-elimination vs measured read-performance trade, the alternative data models (document, graph, key-value, columnar, time-series, event-sourced) characterized by which relational primitives they preserve or trade, and the foundational literature from Codd, Chen, Fagin, Date, Garcia-Molina, and Kleppmann that grounds modern database design.

## Philosophy

Data outlives application code. Application code is rewritten in years; stored data and integrations persist for decades. A bad data model is the most expensive kind of technical debt — every consumer (application, report, integration, analytical job) depends on it, and changing it requires coordinated migration across all of them. The discipline of getting the model right early pays back over the data's full lifetime.

Without the theory, design becomes folklore. Teams normalize because someone said normalization is good; they denormalize because someone said joins are slow. Neither claim is wrong, but without the theory underneath, the decisions are tribal rather than reasoned. The theoretical layer — what normal forms guarantee, what anomalies each form eliminates, what relational algebra closure buys — makes the conversation precise.

Normalization is a principled cleanup procedure, not an aesthetic standard. Each normal form eliminates a specific class of anomaly; the question is not "what normal form is this in" but "are the anomalies this form admits operationally relevant to our workload." The discipline is matching the form to the workload.

## The Normal Forms — A Sequence of Anomaly Eliminations

| Form | Eliminates | Defined by |
|---|---|---|
| 1NF | Repeating groups, non-atomic attributes | Atomic values only |
| 2NF | Partial-key dependencies | 1NF + every non-key attribute fully depends on the whole key |
| 3NF | Transitive non-prime dependencies | 2NF + no non-key attribute depends on another non-key attribute |
| BCNF | Anomalies in overlapping candidate keys | Every non-trivial FD has a superkey on its left |
| 4NF | Multi-valued-dependency anomalies | BCNF + no non-trivial multi-valued dependencies |
| 5NF | Join-dependency anomalies | 4NF + every join dependency is implied by candidate keys |

**The discipline:** start with FDs, derive closure, find candidate keys, test normal-form membership, decompose to the level where the anomalies that matter for the workload are eliminated.

## The Relational Algebra — Why It Composes

| Operator | Notation | What it does |
|---|---|---|
| Selection | σ_predicate(R) | Filter rows |
| Projection | π_columns(R) | Filter columns |
| Join | R ⋈ S | Combine relations on matching attributes |
| Union | R ∪ S | Set union of compatible relations |
| Difference | R − S | Set difference |
| Intersection | R ∩ S | Set intersection (derivable) |
| Division | R ÷ S | Tuples in R matching all values in S |
| Rename | ρ_a→b(R) | Rename attributes |

Every operator's input and output are relations. This *closure* is what makes the algebra compose — JOIN of JOIN of JOIN is still a relation, queryable by further algebra. SQL inherits this property; the document, graph, and key-value alternatives give it up in exchange for different access patterns.

## Normalization vs Denormalization — The Principled Tradeoff

| Path | Benefit | Cost |
|---|---|---|
| Normalize to BCNF | No update, insert, delete anomalies | More tables, more joins, slower reads |
| Denormalize selectively | Faster reads for measured access patterns | Update anomalies application must manage |
| Materialized view | Pre-computed aggregations | Refresh complexity; staleness window |
| Embedded reference (document-style) | Read locality | Update fan-out across embedded copies |
| Pre-computed aggregate | O(1) reads of sums/counts | Write-time computation; consistency burden |

**Principled framing:** normalize to eliminate operationally-relevant anomalies; denormalize specific paths for measured read-performance need; accept the consistency burden explicitly.

## Alternative Models — What They Trade

| Model | Preserves | Trades away | Wins for |
|---|---|---|---|
| Document (MongoDB) | Per-document atomicity | Cross-document joins, transactional consistency | Aggregate-as-document reads |
| Graph (Neo4j) | Relationship traversal | Tabular query, aggregation | Many-hop relationship queries |
| Key-value (Redis) | Point access | Structured query | Caching, simple lookups |
| Wide-column (Cassandra) | Distributed scale | Joins, ACID transactions | Distributed writes, time-series |
| Columnar (BigQuery, ClickHouse) | Analytical aggregation | Point access, transactional updates | OLAP workloads |
| Time-series (TimescaleDB, InfluxDB) | Timestamp-indexed writes | Generic relational query | Metrics, IoT, observability |
| Event-sourced | Full history | Current-state read complexity, storage | Audit, financial ledger |

## Verification

After applying this skill, verify:
- [ ] The functional dependencies of the schema have been listed explicitly. Normalization claims are grounded in FDs, not in intuition.
- [ ] The normal form chosen for each table matches the workload's anomaly tolerance. Higher form is not asserted as "better" without justification.
- [ ] Denormalization decisions have a measured read-performance justification and a documented plan for maintaining the redundant data consistently. Denormalization-by-reflex is not present.
- [ ] The choice of data model (relational vs document vs graph vs columnar vs event-sourced) has been justified against the workload's dominant access pattern, not chosen by tribal preference.
- [ ] Integrity constraints (primary keys, foreign keys, NOT NULL, CHECK constraints, UNIQUE indexes) are present where the theory requires them. Entity integrity and referential integrity are enforced at the database layer, not delegated to the application.
- [ ] The ER model (entities, relationships, cardinality) was drawn before tables were designed. The schema reflects entity structure, not query-shape.
- [ ] For each non-relational model in use, the team can name what relational primitive is being traded and what the application is doing in exchange. The choice is principled, not unexamined.
- [ ] Anti-patterns are recognized: EAV (entity-attribute-value) tables for arbitrary metadata, JSON columns used to avoid schema design, missing foreign keys, denormalization without consistency strategy.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing the practical schema for a new persistence layer | `data-modeling` | data-modeling owns the method; this owns the theory |
| Applying a migration to an existing schema | `schema-evolution` | schema-evolution owns the migration mechanics |
| Choosing which indexes to maintain | `indexing-strategy` | indexing-strategy owns the index design surface |
| Discovering business entities without implementation details | `conceptual-modeling` | conceptual-modeling sits above this layer at the business-domain level |
| Drawing an ER diagram for a specific design | `entity-relationship-modeling` | entity-relationship-modeling owns the ER notation and discovery method |
| Tuning a slow query against the current schema | `query-optimization` | query-optimization owns runtime performance |

## Key Sources

- Codd, E. F. (1970). ["A Relational Model of Data for Large Shared Data Banks"](https://dl.acm.org/doi/10.1145/362384.362685). *Communications of the ACM*, 13(6). The founding paper of the relational model. Defines relations, the algebra, and the integrity constraints. Foundational reading.
- Codd, E. F. (1972). "Further Normalization of the Data Base Relational Model." In *Data Base Systems*, Prentice-Hall. Introduces 2NF and 3NF formally.
- Codd, E. F., & Boyce, R. F. (1974). Introduces what became Boyce-Codd Normal Form (BCNF), addressing edge cases 3NF doesn't cover.
- Chen, P. P. (1976). ["The Entity-Relationship Model — Toward a Unified View of Data"](https://dl.acm.org/doi/10.1145/320434.320440). *ACM TODS*, 1(1). The founding paper of the ER model.
- Fagin, R. (1977). ["Multivalued Dependencies and a New Normal Form for Relational Databases"](https://dl.acm.org/doi/10.1145/320557.320571). *ACM TODS*, 2(3). 4NF.
- Fagin, R. (1979). ["Normal Forms and Relational Database Operators"](https://dl.acm.org/doi/10.1145/582095.582120). *SIGMOD 1979*. 5NF (project-join normal form).
- Fagin, R. (1981). ["A Normal Form for Relational Databases That Is Based on Domains and Keys"](https://dl.acm.org/doi/10.1145/319587.319592). *ACM TODS*, 6(3). Domain-Key Normal Form.
- Date, C. J. *An Introduction to Database Systems*, 8th ed. (2003). Pearson. The canonical textbook treatment of the relational model and normalization; widely used in graduate database courses.
- Garcia-Molina, H., Ullman, J. D., & Widom, J. (2008). *Database Systems: The Complete Book*, 2nd ed. Pearson. Comprehensive textbook covering relational theory, normalization, query processing, and modern systems.
- Codd, E. F. (1985). ["Is Your DBMS Really Relational?"](https://www.computerworld.com/article/2522473/codd-on-dbms-rules.html). *Computerworld*. The article introducing Codd's 12 rules (later 13).
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Chapter 2 (Data Models and Query Languages) is the modern practitioner synthesis of the relational, document, and graph models and their trade-offs.
- Ambler, S. W., & Sadalage, P. J. (2006). *Refactoring Databases: Evolutionary Database Design*. Addison-Wesley. Bridges normalization theory with the practical concerns of evolving a deployed schema; companion to `schema-evolution`.
- Hellerstein, J. M., Stonebraker, M., & Hamilton, J. (2007). ["Architecture of a Database System"](https://dsf.berkeley.edu/papers/fntdb07-architecture.pdf). *Foundations and Trends in Databases*, 1(2). Treats the relational model from the systems-architecture perspective.

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `code-engineering`
- Deployment: `portable`
- Domain: `engineering/data`

**When to use**
- explain why a table is in 2NF but not 3NF and what change would bring it to 3NF
- decide whether a workload's read pattern justifies denormalization against the theoretical baseline
- compare the relational, document, and event-sourced models at the conceptual level for a given domain
- trace a functional-dependency closure to find a candidate key
- Triggers: `what normal form is this`, `should this be normalized or denormalized`, `explain functional dependencies`, `relational vs document model`, `Codd's rules`

**Not for**
- design the practical schema for a new persistence layer (use data-modeling)
- apply an expand-contract migration to change an existing schema (use schema-evolution)
- choose which indexes to maintain (use indexing-strategy)
- discover business entities without implementation details (use conceptual-modeling)
- Owned by `data-modeling`
- Owned by `conceptual-modeling`: implementation-neutral business-concept discovery (entities, relationships, attributes as business reality)
- Owned by `entity-relationship-modeling`
- Owned by `schema-evolution`: the migration mechanics — how to change a deployed schema without downtime

**Related skills**
- Verify with: `data-modeling`, `entity-relationship-modeling`
- Related: `data-modeling`, `conceptual-modeling`, `entity-relationship-modeling`, `schema-evolution`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Data-modeling fundamentals is to schema design what Euclidean geometry is to architecture — the architect does not draw a right-angled wall by intuition each time; they draw it because the geometry guarantees stability and squares lock together. A schema in 3NF is the wall built to plumb, where every dependency is structural and no anomaly is hiding in the carpentry. Denormalization is the deliberate decision to cut a non-load-bearing wall for an open floor plan — defensible when the workload justifies it, indefensible when the cost is invisible.
- Common misconception: |

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-16`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `relational model`, `Codd`, `normalization`, `normal forms`, `functional dependency`, `1NF`, `2NF`, `3NF`, `BCNF`, `4NF`
