---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: data-modeling-fundamentals
description: "Use when reasoning about the foundational theory beneath data modeling: Codd's relational model (1970) and the algebra it sits on, the normal forms (1NF, 2NF, 3NF, BCNF, 4NF, 5NF) as a precise sequence of constraint-elimination steps, functional dependencies and the closure algorithm, Chen's entity-relationship model (1976) as a higher-abstraction layer above relations, the principled case for and against denormalization, the relational-vs-document tradeoff at the conceptual level, the immutable-data-model alternative (event sourcing, append-only tables), and the historical and theoretical literature that grounds modern database design. Do NOT use for practical persistence design and method (use data-modeling), for safely applying changes to an existing schema (use schema-evolution), for choosing what indexes to maintain (use indexing-strategy), or for the conceptual-modeling layer above the data model (use conceptual-modeling)."
version: 1.0.0
type: capability
category: engineering
domain: engineering/data
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-16"
drift_check:
  last_verified: "2026-05-16"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - relational model
  - Codd
  - normalization
  - normal forms
  - functional dependency
  - 1NF
  - 2NF
  - 3NF
  - BCNF
  - 4NF
  - 5NF
  - entity-relationship model
  - Chen
  - relational algebra
  - denormalization
  - immutable data model
  - event sourcing
triggers:
  - "what normal form is this"
  - "should this be normalized or denormalized"
  - "explain functional dependencies"
  - "relational vs document model"
  - "Codd's rules"
examples:
  - "explain why a table is in 2NF but not 3NF and what change would bring it to 3NF"
  - "decide whether a workload's read pattern justifies denormalization against the theoretical baseline"
  - "compare the relational, document, and event-sourced models at the conceptual level for a given domain"
  - "trace a functional-dependency closure to find a candidate key"
anti_examples:
  - "design the practical schema for a new persistence layer (use data-modeling)"
  - "apply an expand-contract migration to change an existing schema (use schema-evolution)"
  - "choose which indexes to maintain (use indexing-strategy)"
  - "discover business entities without implementation details (use conceptual-modeling)"
relations:
  related:
    - data-modeling
    - conceptual-modeling
    - entity-relationship-modeling
    - schema-evolution
  boundary:
    - skill: data-modeling
      reason: "data-modeling owns the practical method of designing persistence — turn a conceptual model into a working schema with keys, constraints, indexing implications. This skill owns the theoretical foundations beneath that method — what normal forms guarantee, what Codd's relational model formally provides, the algebra that makes joins composable, and the principled justification for or against denormalization. They are companion skills: theory and practice."
    - skill: conceptual-modeling
      reason: "conceptual-modeling owns implementation-neutral business-concept discovery (entities, relationships, attributes as business reality). This skill owns the formal data-model layer below conceptual modeling: the relational model, the algebra, the dependency theory. The two compose: conceptual modeling identifies entities; data-modeling-fundamentals formalizes how those entities map to relations."
    - skill: entity-relationship-modeling
      reason: "entity-relationship-modeling owns the ER notation and method (entities, relationships, cardinality, ER diagrams) as developed by Chen and extended by Bachman, Barker, and others. This skill owns the broader theoretical frame including the relational model that ER diagrams typically translate into. The boundary: ER is the diagramming and discovery layer; the relational model is the formal target."
    - skill: schema-evolution
      reason: "schema-evolution owns the migration mechanics — how to change a deployed schema without downtime. This skill owns the static theory of what a good schema is. The decision 'this schema should be in 3NF' is grounded by this skill; the application of that decision to a live database is `schema-evolution`'s domain."
  verify_with:
    - data-modeling
    - entity-relationship-modeling
concept:
  definition: "Data-modeling fundamentals is the body of formal theory beneath practical database design: Codd's relational model (1970), which represents data as relations (sets of tuples) and provides a closed algebra (selection, projection, join, union, intersection, difference, division) for querying them; the normal forms (1NF through 5NF and BCNF), each defined by the elimination of a specific class of dependency anomaly; the theory of functional dependencies and the closure algorithm used to derive normal-form membership and candidate keys; Chen's entity-relationship model (1976), which sits above the relational model as a higher-abstraction modeling layer that translates downward into relations; the principled justifications for normalization (avoid update, insert, delete anomalies) and for denormalization (workload-driven performance trade-offs against the normal-form baseline); and the alternative data models — document, graph, key-value, columnar, event-sourced — each of which can be characterized by what relational primitives it preserves, relaxes, or trades for a different access pattern. The skill is the *theory* a practitioner draws on when deciding what shape data should take and why; the practical application of that theory is `data-modeling`."
  mental_model: |
    Six primitives structure data-modeling-fundamentals reasoning:

    1. **The relational model.** Codd's 1970 paper "A Relational Model of Data for Large Shared Data Banks" defined data as *relations* — unordered sets of tuples over a fixed set of attributes. The relational model's three components are *structure* (relations with attributes drawn from domains), *operators* (the relational algebra: σ select, π project, ⋈ join, ∪ union, − difference, ÷ division, and derived operators), and *integrity constraints* (entity integrity: primary keys are non-null; referential integrity: foreign keys reference existing primary keys; domain integrity: values fit their declared domain). The algebra is *closed* — every operator's input and output are relations, so operators compose. This closure is the property SQL inherits and the reason JOINs can be chained arbitrarily.

    2. **Functional dependencies and closure.** A functional dependency (FD) X → Y means: whenever two tuples agree on attributes X, they must agree on attributes Y. Functional dependencies are the formal apparatus underneath normalization. The *closure* of a set of FDs (computed by Armstrong's axioms: reflexivity, augmentation, transitivity) lets you derive which attributes determine which others. The closure algorithm finds candidate keys (minimal attribute sets that functionally determine all attributes) and tests normal-form membership (does every non-trivial FD have a superkey on its left?). Most "should this be normalized" arguments resolve cleanly once the FDs are listed explicitly.

    3. **The normal forms as a sequence of anomaly eliminations.** *1NF* — every attribute is atomic (no repeating groups, no nested tables). *2NF* — 1NF plus no partial dependency on a composite key. *3NF* — 2NF plus no transitive dependency through a non-prime attribute. *BCNF* — every non-trivial FD has a superkey on its left (slightly stronger than 3NF; matters for edge cases). *4NF* — eliminates multi-valued dependencies. *5NF* — eliminates join dependencies. Each form eliminates a specific class of *anomaly* (update anomaly: same fact stored redundantly, must be updated everywhere; insertion anomaly: cannot insert a fact about A without also having a fact about B; deletion anomaly: deleting a fact about B accidentally loses a fact about A). The sequence is not "bigger numbers are better" — it is "each level eliminates one more class of anomaly," and the right level for a workload depends on whether the eliminated anomalies are operationally relevant.

    4. **The entity-relationship model.** Chen's 1976 paper "The Entity-Relationship Model — Toward a Unified View of Data" introduced ER as a higher-abstraction modeling layer above the relational model. The primitives are *entities* (things), *relationships* (associations among entities), *attributes* (properties of entities or relationships), and *cardinality* constraints (1:1, 1:N, M:N). ER diagrams translate downward into relational tables: each entity becomes a table, each relationship typically becomes a foreign key or a junction table depending on cardinality. The ER model is the workhorse design layer in practice because thinking at the entity level is closer to the domain than thinking at the relation level. Extended ER (EER) adds generalization/specialization, weak entities, multi-valued attributes, and aggregation.

    5. **Normalization vs denormalization — the principled tradeoff.** Normalization eliminates anomalies but produces more tables and more joins. Denormalization reverses some normalization to reduce joins at read time, accepting the resulting anomalies as application-managed risk. The principled framing is: *normalize until anomalies are eliminated, then denormalize for measured read-performance need, accepting the burden of maintaining the redundant data consistently*. The trap is denormalization-by-reflex (developers denormalize because "joins are slow" without measuring) or normalization-by-reflex (designers normalize to 5NF without considering the operational cost of join-heavy workloads). The right point on the spectrum is workload-dependent and should be defended with measurement, not aesthetics.

    6. **The relational alternatives.** Document models (MongoDB, Couchbase) trade the relational join for embedded documents (read-optimized at the cost of update consistency across documents). Graph models (Neo4j, Dgraph) optimize for relationship traversal (the "many joins" relational pain point), at the cost of weaker tabular query and aggregation. Key-value stores (Redis, DynamoDB single-table) optimize for point access at the cost of structured query. Columnar stores (BigQuery, ClickHouse) optimize for analytical aggregation at the cost of point access. Event-sourced models (immutable append-only event log + projections) trade in-place update for full history at the cost of operational complexity. Each can be characterized by which relational primitives it preserves and which it trades; the choice is not "relational vs NoSQL" but "what access pattern dominates and which model serves it best."

    The deep insight is that **normalization is a principled cleanup procedure, not an aesthetic standard**. Each normal form eliminates a specific class of anomaly; the question is not "what normal form is this in" but "are the anomalies this form admits operationally relevant to our workload." A read-only reporting table can sit at 1NF without harm; a high-write transactional table benefits from 3NF or BCNF to avoid update anomalies. The discipline is matching the form to the workload.

    The complementary insight is that **the relational algebra is the property the alternatives trade away**. Closure under join is what lets relational queries compose arbitrarily; document, graph, and key-value models give that up in exchange for different performance characteristics. Knowing what closure buys you is what makes the trade explicit rather than mystical.
  purpose: |
    Data-modeling fundamentals exists because data outlives application code. Application code is rewritten in years; stored data and integrations persist for decades. A bad data model is the most expensive kind of technical debt — every consumer (application, report, integration, analytical job) depends on it, and changing it requires coordinated migration across all of them. The discipline of *getting the model right early* pays back over the data's full lifetime.

    **Without the theory, design becomes folklore.** Teams normalize because someone said normalization is good; they denormalize because someone said joins are slow. Neither claim is wrong, but without the theory underneath, the decisions are tribal rather than reasoned. The theoretical layer — what normal forms guarantee, what anomalies each form eliminates, what relational algebra closure buys — makes the conversation precise.

    **Without functional dependencies, normalization arguments are vibes.** "This should be in 3NF" is empty until the FDs are listed and the closure computed. With the FDs explicit, normal-form membership is mechanical: does every non-trivial FD have a superkey on its left? If yes, BCNF. If no, what FD violates it, and what decomposition fixes it? The FD apparatus makes normalization an analytical procedure, not a stylistic one.

    **Without the ER model, conceptual design defaults to direct-to-table.** A practitioner who skips the ER layer often invents tables that fit one anticipated query rather than the domain's actual entity structure. Two months later a new query requires data the chosen table doesn't capture, and the schema-or-rewrite tradeoff begins. Designing at the ER level first — entities, relationships, cardinality — keeps the model domain-shaped and resilient to new query patterns.

    **Without the alternative-model framework, "NoSQL" is unprincipled choice.** Document, graph, columnar, event-sourced — each is the right model for some workload and the wrong one for others. The right framing is "what relational primitive am I trading and what am I getting for it." Trading join closure for embedded-document fast reads is rational when the workload is dominated by reading a single aggregate; it is the wrong trade when the workload includes ad-hoc reporting and cross-aggregate analytics.

    **Theory makes anti-patterns identifiable.** "EAV (entity-attribute-value) tables for arbitrary metadata" — anti-pattern because they push schema enforcement into application code and break the algebra's optimization story. "JSON columns for variable structured data" — sometimes right (genuinely heterogeneous data), often wrong (using JSON to avoid designing the schema). Knowing the theory makes the difference between these cases visible.

    **Theory grounds long-term decisions.** A team that designs at the theoretical level produces schemas that survive product pivots — the entities are the business's entities, not its current UI's. A team that designs at the UI-shape level produces schemas that the next product manager will need to migrate. The investment in theory pays back over years.

    The deeper purpose is to make data design a *deliberate engineering activity*, grounded in 50 years of accumulated theory (Codd 1970, Chen 1976, the relational-database literature through Date, Garcia-Molina, Kleppmann), rather than a craft transmitted by example. The theory is mature, well-documented, and changes slowly. Investing in it is one of the highest-leverage things a practitioner can do for the life of the data they design.
  boundary: |
    **This skill is theory; `data-modeling` is method.** The decision "this schema should be in BCNF" lives here; the actual process of designing the schema for a production workload (with practical constraints, indexing concerns, integration boundaries) lives in `data-modeling`. The two are companion skills; reading both yields the full picture.

    **Normalization is not the goal; anomaly-elimination is.** "Higher normal form = better" is a category error. A table that admits no relevant anomalies at 2NF does not need to be in 3NF to be correct; pushing it to 3NF adds joins and indirection without addressing real risk. Knowing which form eliminates which anomaly is the discipline; mechanically maximizing the form is not.

    **Denormalization is not failure of design.** A denormalized table that's been measured against the workload and chosen for a documented read-performance need is correct design. The failure mode is *unprincipled* denormalization — denormalize-by-reflex without the measurement, or normalize-by-reflex without considering the join cost. The theory's role is to make either choice defensible.

    **The relational model is not the universal model.** Some domains map poorly to relations: highly-connected graphs (knowledge graphs, social networks), time-series with very high write rate, semi-structured logs with unpredictable schema, full-text-search workloads. Each has a better-fitting model. The theory teaches what relational gives up and what alternatives offer; it does not require everything to be relational.

    **Functional dependencies are not assertions about reality.** FDs are assertions about the data — "in this dataset, attribute X functionally determines attribute Y." They can be wrong (the modeler thought email → user but the data has shared emails) and they can change over time (today every order has one customer; next year orders can have multiple customers). FDs underpinning normalization are claims that must be validated against actual data, not asserted from intuition.

    **Codd's 12 rules are aspirational, not a checklist.** Codd published 12 rules (later extended to 13) defining "fully relational" — most production databases meet some but not all. The rules are useful as a reference for what the model formally requires; treating them as a pass/fail audit of a production database is the wrong use.

    **Normal-form theory does not address performance directly.** Higher normal forms eliminate update anomalies; they also produce more joins and (sometimes) slower reads. Performance optimization belongs to `query-optimization` and `indexing-strategy`. The data-modeling fundamentals layer is about *correctness of representation*; performance is a separate axis.

    **The choice between document and relational is not a binary.** Many production architectures combine both: a relational core for transactional consistency, a document store for high-fanout aggregate reads, a search index for full-text queries, an event log for audit history. The theoretical framing of each model lets the architecture be principled rather than haphazard.

    **Theory has limits in handling sparse, semi-structured, or evolving data.** A schema where most rows have only a small fraction of all possible attributes (sparse data; product catalogs, telemetry) maps poorly to fixed columns; the discipline is to recognize the unfit and choose a different representation (JSON, EAV with explicit metadata layer, document store), not to torture the relational model into it.

    **The model is not the implementation.** Two databases (Postgres and Oracle) can implement the same logical relational model with different physical storage, different index types, different optimizer characteristics. The theory describes the logical layer; the physical layer is an implementation concern below it.
  taxonomy: |
    By normal form (in order of restrictiveness):
    - **1NF (First Normal Form)** — every attribute is atomic; no repeating groups; no nested tables. Eliminates positional or set-valued column abuse.
    - **2NF (Second Normal Form)** — 1NF plus every non-key attribute is fully functionally dependent on the entire primary key, not part of it. Eliminates partial-dependency redundancy.
    - **3NF (Third Normal Form)** — 2NF plus every non-key attribute is non-transitively dependent on the primary key. Eliminates transitive-dependency redundancy.
    - **BCNF (Boyce-Codd Normal Form)** — every non-trivial FD has a superkey on its left. Slightly stronger than 3NF; relevant when 3NF still admits anomalies in overlapping-candidate-key cases.
    - **4NF (Fourth Normal Form)** — BCNF plus eliminates multi-valued dependencies. Relevant when an entity has multiple independent multi-valued attributes (e.g., a person with multiple phone numbers and multiple email addresses where phone and email are independent).
    - **5NF (Fifth Normal Form, Project-Join Normal Form)** — 4NF plus eliminates join dependencies that cannot be expressed as candidate keys. Rare in practice.
    - **6NF (Sixth Normal Form)** — relevant primarily for temporal databases; decomposes to irreducible relations.
    - **DKNF (Domain-Key Normal Form)** — every constraint is a consequence of domain and key constraints. Theoretical ideal; rarely achieved in practice.

    By relational-algebra operator:
    - **Selection (σ)** — extract rows matching a predicate. The WHERE clause.
    - **Projection (π)** — extract columns. The SELECT column list.
    - **Join (⋈)** — combine relations on matching attributes. Includes natural join, theta join, equi-join, outer joins (left, right, full).
    - **Union (∪)** — set union of compatible relations.
    - **Difference (−)** — set difference.
    - **Intersection (∩)** — set intersection (derivable from union and difference).
    - **Division (÷)** — find tuples that match all values in a divisor relation. "Find students who took all required courses."
    - **Rename (ρ)** — rename attributes for compatibility in further operations.

    By integrity constraint:
    - **Entity integrity** — primary keys are non-null and unique. Enforces "every entity is identifiable."
    - **Referential integrity** — foreign keys reference existing primary keys. Enforces relational connectivity.
    - **Domain integrity** — values conform to their column's domain (data type, NOT NULL, CHECK constraints).
    - **User-defined integrity** — application-specific constraints expressed via triggers, CHECK constraints, or assertions.

    By data-model alternative:
    - **Relational** — Codd's model; closure under algebra; SQL. Postgres, MySQL, SQL Server, Oracle, SQLite.
    - **Document** — nested JSON-like records; embedded relationships; reduced join cost; eventual consistency in some implementations. MongoDB, Couchbase, AWS DocumentDB.
    - **Key-value** — primary-key access only; high throughput, simple model. Redis, DynamoDB (in key-value mode), Riak.
    - **Wide-column** — sparse, distributed, column-family model. Cassandra, HBase, ScyllaDB.
    - **Graph** — nodes and edges as primary citizens; traversal-optimized. Neo4j, Dgraph, Amazon Neptune, ArangoDB.
    - **Columnar** — column-oriented storage; analytical query optimization. BigQuery, ClickHouse, Snowflake, DuckDB.
    - **Time-series** — timestamp-indexed; high-write workloads; retention policies. InfluxDB, TimescaleDB, Prometheus.
    - **Event-sourced / append-only** — immutable event log + materialized projections. Kafka with streams, EventStoreDB, custom event-sourcing on top of relational.
    - **Multi-model** — multiple of the above in one engine. ArangoDB (document + graph + key-value), CosmosDB (multiple APIs), Postgres with JSONB (relational + document).

    By denormalization pattern:
    - **Duplication** — same fact stored in multiple tables; update cost amortized for read benefit. Common in read-heavy reports.
    - **Pre-computed aggregates** — sums, counts, averages computed at write time and stored. Avoids aggregation at read time.
    - **Materialized views** — query results stored as a table; refreshed on schedule or on event. Decouples query cost from query frequency.
    - **Embedded references** — relation's attributes copied into the embedded position (document style). Trades update locality for read locality.
    - **Wide tables** — many related entities flattened into one wide row. Fast reads of all attributes; expensive partial updates.
    - **Junction-table elimination** — many-to-many relationship represented inline (array column, JSON list). Loses referential integrity; gains read speed.

    By dependency type:
    - **Functional dependency (FD)** — X → Y; same X implies same Y.
    - **Multi-valued dependency (MVD)** — X ↠ Y; independence of Y from other attributes given X.
    - **Join dependency** — the relation can be losslessly reconstructed from specific projections.
    - **Inclusion dependency** — values of one attribute set are a subset of another's. Foreign key is a special case.

    By foundational paper / source:
    - **Codd (1970)** — the relational model.
    - **Chen (1976)** — the ER model.
    - **Codd (1972)** — second normal form, third normal form.
    - **Codd (1974)** — Boyce-Codd Normal Form (with Boyce).
    - **Fagin (1977)** — fourth normal form (multi-valued dependencies).
    - **Fagin (1979)** — fifth normal form (project-join normal form).
    - **Fagin (1981)** — domain-key normal form.
    - **Ambler & Sadalage (2006)** — refactoring databases; bridges modeling theory and continuous-evolution practice.
    - **Date (multiple editions)** — *An Introduction to Database Systems*; canonical textbook.
    - **Garcia-Molina, Ullman, Widom (2008)** — *Database Systems: The Complete Book*; canonical textbook with extensive theory coverage.
    - **Kleppmann (2017)** — *Designing Data-Intensive Applications*; modern practitioner synthesis of the theory.
  analogy: |
    A library's catalog system. The relational model is the formal catalog: every book is a record with a fixed set of attributes (title, author, ISBN, year, subject), every record is identified by a unique key (the call number), and the catalog supports a small set of operations (select by author, project to titles only, join author records to book records) that compose to answer any query.

    Normalization is the librarian's principled decision about how to split the catalog. *1NF* says: don't store multiple authors for one book in a single field as comma-separated text — each author-book relationship gets its own row. *2NF* says: if the catalog has composite keys (book + edition), the attributes that depend only on book (not edition) should be in their own table. *3NF* says: the genre's description shouldn't be in the book record if the description is determined by the genre alone — it goes in a genres table. *BCNF* says: if multiple key combinations could identify the same book, every fact must depend on a full key.

    The point of each normalization step is to eliminate a specific *anomaly*. Without 2NF, updating a book's publisher requires updating it on every edition's row — easy to forget one and create inconsistency. Without 3NF, you can't add a new genre to the catalog until you have a book in that genre — the genre fact is tangled with book facts.

    Functional dependencies are the librarian's assertions about the data: "an ISBN determines a title" (one ISBN → one title), "an author and a publication year don't determine the title" (the same author might publish many books in a year). The closure procedure mechanically derives which attribute sets form valid keys.

    The ER model is the librarian thinking before designing the catalog: what are the entities (books, authors, publishers, genres, copies), what are the relationships (authors *write* books; publishers *publish* books; copies *are-of* books), what's the cardinality (one author → many books; one book → many copies). Then translating: each entity becomes a table; each many-to-many relationship needs a junction table.

    Denormalization is the librarian's pragmatic choice to duplicate. The most-requested view is "popular books with their author names and genre descriptions" — to avoid joining four tables on every lookup, the librarian builds a materialized summary that pre-joins everything. The summary is denormalized; it sacrifices the strict no-duplication principle for read speed. The librarian commits to keeping it consistent with the normalized truth.

    The alternative models are different cataloging systems. A *document model* is "every book's record contains the author records, publisher record, and review records embedded inline" — fast to read everything about a book, slow to update an author (must find every book by that author and update each). A *graph model* is "books and authors and topics are all nodes; relationships are edges" — natural for queries like "find all authors who collaborated with anyone who collaborated with this author." A *columnar model* is for analytical questions: "what's the average year of all books in the science section" — store column-wise to answer fast. A *time-series model* is for "how many books were checked out per day for the last year" — timestamp-indexed.

    Each model is the right tool for some workload. The relational model wins for general-purpose ad-hoc query because the algebra composes; the alternatives win for specific access patterns the algebra doesn't cheaply support. Choosing well requires knowing the algebra and knowing what the alternatives trade for it.
  misconception: |
    The most common misconception is that **higher normal form is always better**. It is not. Each normal form eliminates a specific class of anomaly; if the anomalies the form admits are not operationally relevant to the workload, pushing to a higher form adds complexity without benefit. Read-only or low-write workloads often live happily at lower normal forms.

    The second misconception is that **denormalization means giving up on theory**. It does not. Principled denormalization is a measured trade: normalize to eliminate anomalies, then denormalize specific paths for measured read-performance need, and accept the burden of maintaining the redundant data consistently. The unprincipled version (denormalize-by-default because "joins are slow") is the anti-pattern; the principled version is mature engineering.

    The third misconception is that **NoSQL means "no relational theory."** It does not. The alternative models each give up specific relational primitives (join closure, transactional consistency, structured query) in exchange for specific gains. Understanding what each model preserves and what it trades is grounded in relational theory; "NoSQL" is meaningful only against the baseline of the relational model.

    The fourth misconception is that **3NF and BCNF are interchangeable**. They differ in edge cases involving overlapping candidate keys. BCNF is strictly stronger; a relation in BCNF is in 3NF, but a relation in 3NF might not be in BCNF. The difference matters for some pathological cases; in well-designed schemas they often coincide.

    The fifth misconception is that **Codd's 12 rules are a pass/fail certification**. They are aspirational. Most production databases meet some of the rules; few meet all. The rules are a reference for what "fully relational" formally means; treating them as a checklist for product evaluation misuses them.

    The sixth misconception is that **document databases eliminate the need for relational thinking**. They do not. A document model still needs entity boundaries (what's one document, what's multiple), still has relationships (embedded vs referenced), still has integrity concerns (cross-document consistency). The relational theory tells you what you're giving up; without it, document-database design tends to reinvent the same anti-patterns at higher cost.

    The seventh misconception is that **normalization is purely an artifact of disk storage cost from the 1970s**. It is not. The original motivation included storage efficiency but the principled benefit — eliminating update, insertion, and deletion anomalies — is independent of storage cost. A system with infinite cheap storage still benefits from normalization because of consistency, not space.

    The eighth misconception is that **functional dependencies are obvious from looking at the table**. They are not. FDs are claims about the data that must be validated against actual values, not inferred from intuition. The modeler may think email → user, but the data has shared emails (couples, families, support aliases); the intuition is wrong and the FD doesn't hold. Validating FDs against actual data is hygiene.

    The ninth misconception is that **the ER model is just diagramming**. The diagram is a notation; the underlying model includes formal cardinality semantics, entity-relationship distinctions, the EER extensions (generalization/specialization, weak entities), and the translation rules to relational tables. Treating ER as just shapes-on-a-page misses what makes it a modeling discipline.

    The tenth misconception is that **6NF and DKNF are abstract theory with no practical use**. 6NF is the basis for temporal databases (every change to an attribute is a separate row, with valid-time tracked); some financial and audit-required systems benefit from it. DKNF is the formal characterization of "all integrity is expressed via keys and domains" — a useful aspiration even when not fully achieved.

    The eleventh misconception is that **JSON columns in relational databases are the same as a document database**. They are not. JSON in Postgres or MySQL inherits relational transaction guarantees, indexability constraints, and query language. Document databases offer different consistency models, different indexing, different query semantics. The choice is not symmetric.

    The twelfth misconception is that **immutable/event-sourced data models are universally better because they preserve history**. They have real costs: query complexity (every read must aggregate events or use a projection), storage growth, schema-evolution complexity in the event payloads. They are right for workloads where history is a first-class requirement (financial ledgers, audit logs); they are wrong for workloads where current state is what matters and history is overhead.
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
