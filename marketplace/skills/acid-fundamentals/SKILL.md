---
name: acid-fundamentals
description: "Use when reasoning about the four ACID properties of database transactions — Atomicity, Consistency, Isolation, Durability — as foundational concepts beneath any transactional system: what each property formally guarantees, the difference between the property the database claims and the property the application gets (depending on isolation level, replication mode, and configuration), the relationship between ACID and BASE (the alternative model in many NoSQL systems), why 'C' is the most contested letter (database consistency vs application invariants), and the historical record (Härder & Reuter 1983, the Gray-Reuter transaction model, Gray's Turing lecture). Do NOT use for choosing isolation levels for a specific workload (use transaction-isolation), distributed-system CAP tradeoffs (use cap-theorem-tradeoffs), database query design (use query-optimization), or zero-downtime migration mechanics (use database-migration). Do NOT use for design a database schema (use data-modeling)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"replication-patterns\",\"data-modeling\",\"transaction-isolation\",\"cap-theorem-tradeoffs\",\"schema-evolution\"],\"suppresses\":[\"transaction-isolation\"],\"verify_with\":[\"transaction-isolation\",\"cap-theorem-tradeoffs\"]}"
  subject: backend-engineering
  public: "true"
  scope: "Use when reasoning about the four ACID properties of database transactions — Atomicity, Consistency, Isolation, Durability — as foundational concepts beneath any transactional system: what each property formally guarantees, the difference between the property the database claims and the property the application gets (depending on isolation level, replication mode, and configuration), the relationship between ACID and BASE (the alternative model in many NoSQL systems), why 'C' is the most contested letter (database consistency vs application invariants), and the historical record (Härder & Reuter 1983, the Gray-Reuter transaction model, Gray's Turing lecture). Do NOT use for choosing isolation levels for a specific workload (use transaction-isolation), distributed-system CAP tradeoffs (use cap-theorem-tradeoffs), database query design (use query-optimization), or zero-downtime migration mechanics (use database-migration)."
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"ACID\",\"atomicity\",\"consistency\",\"isolation\",\"durability\",\"transaction\",\"BASE\",\"Härder Reuter\",\"Gray transaction model\",\"transactional guarantee\"]"
  triggers: "[\"is this database ACID\",\"what does consistency mean\",\"ACID vs BASE\",\"is my transaction atomic\",\"what's the durability guarantee\"]"
  examples: "[\"explain what ACID guarantees a database does and does not provide to the application\",\"decide whether ACID or BASE is the right model for a new system\",\"diagnose a data-loss incident — likely a durability or atomicity failure\",\"explain why the 'C' in ACID is not the same as application consistency\"]"
  anti_examples: "[\"choose an isolation level for a workload (use transaction-isolation)\",\"reason about availability vs consistency in a distributed system (use cap-theorem-tradeoffs)\",\"design a database schema (use data-modeling)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "ACID is to a database transaction what the four corners of a legal contract are to an agreement — Atomicity is the signing block (all parties sign together or no contract exists), Consistency is the boilerplate clauses (every clause must be satisfied for the contract to be valid), Isolation is the negotiating-room rule (other negotiations cannot read your draft until both sides initial each page), and Durability is the safe in the law office (once signed, the contract survives the office burning down)."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/backend-engineering/acid-fundamentals/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# ACID Fundamentals

## Concept of the skill

ACID is the precise vocabulary the database industry uses to describe transactional guarantees, codified by Härder & Reuter (1983) on Gray's transaction model. Four *orthogonal* axes: *Atomicity* (all-or-nothing per transaction; no partial state visible after failure — implemented via write-ahead logging + rollback/redo), *Consistency* (database integrity constraints satisfied — foreign keys, NOT NULL, unique indexes, CHECK constraints, triggers), *Isolation* (concurrent transactions appear serialized — locking, MVCC, Serializable Snapshot Isolation), *Durability* (committed effects survive failure — synchronous WAL flush, replication to durable storage). The four-letter frame is not a one-dimensional rating; it is a vector — a system can be atomic without being isolated, durable without being CAP-consistent, ACID-consistent (constraints satisfied) without being CAP-consistent (replicas agree).

Replaces vague claims about transactional behavior with precise vocabulary. Before ACID, database claims were imprecise ("we're safe"); after Härder & Reuter's 1983 formalization, the system's behavior on each of four orthogonal axes is the conversation. Solves the problem that a database advertising "ACID compliance" can configure any of the four properties to weaker forms — synchronous_commit off (D weakened), weaker isolation modes in engines that permit dirty reads or other anomalies (I weakened), async replication (D-across-replicas weakened), constraints disabled (C weakened) — and the application doesn't know what it actually gets. The strategic value: when a system claims ACID or relaxes some property, the conversation has precise vocabulary. The BASE alternative (Pritchett 2008) names a different point in the trade space (Basically Available, Soft state, Eventually consistent) for systems that trade strong guarantees for throughput and availability under partition; most production architectures use both, picking per component (transactional cores ACID; high-throughput non-transactional caches and streams BASE).

Distinct from transaction-isolation, which owns the choice and semantics of isolation levels — the I axis in operational depth. This skill owns ACID as the four-property foundational frame; transaction-isolation owns one of the four axes in depth. Distinct from cap-theorem-tradeoffs, which owns the distributed-system frame — CAP's C (replica agreement) is *not* ACID's C (constraint satisfaction); this skill owns the single-system transactional frame; cap-theorem-tradeoffs owns the distributed frame; conflating them is the most common misconception in the space. Distinct from replication-patterns, which owns the patterns for keeping multiple replicas in agreement — replication is the operational layer above single-node ACID, and often relaxes some ACID properties (most notably durability and isolation in async modes). Distinct from data-modeling, which owns schema design and entity structure (this skill owns the runtime guarantee semantics that any data model relies on). Distinct from database-migration (zero-downtime mechanics) and cross-transaction coordination (sagas, two-phase commit — ACID is per-transaction; cross-transaction atomicity is a different problem at a different layer). ACID is to a database transaction what the four corners of a legal contract are to an agreement — Atomicity is the signing block (all parties sign together or no contract exists), Consistency is the boilerplate clauses (every clause must be satisfied for the contract to be valid), Isolation is the negotiating-room rule (other negotiations cannot read your draft until both sides initial each page), and Durability is the safe in the law office (once signed, the contract survives the office burning down). The wrong mental model is that ACID is a binary property a database "has" or doesn't — that "Postgres is ACID" is a complete description of the system's behavior. It is not. Each property is *configuration-graded*, and the default configuration may not give the property the team thinks it does. `synchronous_commit = off` trades durability for write throughput — last few committed transactions can be lost on crash. Some engines' read-uncommitted mode allows dirty reads; PostgreSQL maps read uncommitted to read committed, which is exactly why engine-specific documentation matters. Async replication makes the primary the only durable copy. Disabled constraints make C the application's problem, not the database's. ACID-compliance is a marketing claim until the *configuration* is named. A second misconception: that ACID's C and CAP's C are the same. They are not — ACID-C is database-constraint satisfaction (FK resolves; NOT NULL holds); CAP-C is replica agreement (all replicas return the same value). A system can be ACID-C and CAP-inconsistent (constraints hold; replicas disagree), or CAP-C and ACID-inconsistent (replicas agree; foreign key violated). Using "consistency" without qualifier in design discussions produces confused decisions. A third: that ACID solves cross-transaction coordination — it does not; sagas, two-phase commit, and outbox patterns are a separate problem at a layer above per-transaction guarantees.

## Coverage

The four foundational transactional properties — Atomicity, Consistency, Isolation, Durability — that define the contract between a database and the application using it. Covers what each property formally guarantees, the implementation mechanisms underneath each (write-ahead logging for atomicity; locking and MVCC for isolation; constraint checking for consistency; synchronous storage flush for durability), the configuration-dependent strength of each property, the BASE alternative model for systems that trade ACID guarantees for availability, the C-of-ACID vs C-of-CAP distinction that is the most-frequently-confused concept in the space, and the historical record from Gray's transaction model through Härder & Reuter's 1983 formalization.

## Philosophy of the skill
ACID is the precise vocabulary the database industry uses to describe transactional guarantees. Before ACID, claims were vague; after ACID, a system's behavior on each of four orthogonal axes is the conversation. The strategic value of the frame is *not* the acronym itself but the discipline of asking, for any database in any configuration, what each property actually guarantees and what the application can rely on.

The frame's defining property is that it names four *orthogonal* axes. A system can be atomic without being isolated; it can be durable without being consistent in the CAP sense; it can be consistent (database constraints satisfied) without being consistent across replicas. The four-letter frame is not a one-dimensional rating; it is a vector.

The discipline is in the configuration. "Postgres is ACID" is a vague claim; "Postgres at read committed isolation with synchronous_commit on with foreign-key constraints enforced gives us A, I (at read-committed level), D, and C" is the precise statement. Knowing what your specific database guarantees in your specific configuration is operational hygiene; assuming the default is a class of incident.

## The Four Properties — Precise Definitions

| Property | Guarantee | Implementation |
|---|---|---|
| Atomicity | All-or-nothing per transaction; no partial state visible after failure | Write-ahead logging + rollback/redo |
| Consistency | Database integrity constraints satisfied across the transaction | Foreign keys, NOT NULL, unique indexes, CHECK constraints, triggers |
| Isolation | Concurrent transactions appear serialized | Locking, MVCC, serializable snapshot isolation |
| Durability | Committed effects survive failure | Synchronous WAL flush, replication to durable storage |

Each property is graded. Atomicity is essentially binary. Isolation has five+ levels (see `transaction-isolation`). Durability has multiple configurations (local sync, local async, replicated sync, quorum). Consistency has database-level rules vs application-level rules.

## The Two C's — ACID vs CAP

| Property | What it means | Example |
|---|---|---|
| ACID Consistency | Database integrity constraints satisfied | FK reference resolves; UNIQUE constraint holds |
| CAP Consistency | All replicas agree on the current value | All replicas return the same balance for account #1234 |

A database can be ACID-Consistent and CAP-Inconsistent (constraints hold; replicas disagree). A database can be CAP-Consistent and ACID-Inconsistent (replicas agree; foreign key was violated). They are different concepts with the same letter and are the most-confused pair in the space.

## ACID vs BASE

| Property | ACID | BASE |
|---|---|---|
| A | Atomicity per transaction | Basically Available |
| C | Database-level Consistency | Soft state |
| I | Isolation between concurrent transactions | (no I in BASE) |
| D | Durability | Eventually consistent |
| Trade | Strong guarantees, limited throughput/availability under partition | High throughput/availability, weaker correctness guarantees |
| Typical use | Transactional cores: orders, payments, accounts | High-throughput non-transactional: streams, analytics, caches |
| Examples | Postgres, Oracle, SQL Server, MongoDB transactions | Cassandra, Riak (default), DynamoDB (default) |

Most production architectures use both, picking per component.

## Configuration Matters

Three configuration knobs that change what your database actually guarantees:

| Knob | Default in Postgres | Effect when changed |
|---|---|---|
| `synchronous_commit` | `on` (durable) | `off` → commit acknowledged before WAL flush; last few commits lost on crash |
| Isolation level | `read committed` | `serializable` is strongest; Postgres maps `read uncommitted` to read committed, while some engines permit dirty reads |
| Replication mode | none | Synchronous replication = D guarantees include replica; async = primary-only |

Knowing your production configuration — not assuming the default — is operational hygiene.

## Verification

After applying this skill, verify:
- [ ] The team can name what each ACID property guarantees and what it does not, distinct from the CAP properties.
- [ ] The current database's configuration is known: isolation level, durability config, replication mode. The team is not relying on assumed defaults.
- [ ] ACID's C and CAP's C are distinguished in design discussions. Using "consistency" without qualifier produces confused decisions.
- [ ] Application-level invariants (business rules) are recognized as the application's responsibility, not delegated to the database's ACID consistency.
- [ ] For systems that mix ACID and BASE components, the boundary is explicit: which data lives in which model and why.
- [ ] Cross-transaction atomicity (sagas, two-phase commit) is recognized as a different problem from in-transaction atomicity. ACID does not solve cross-transaction coordination.
- [ ] Production incidents that involve data loss or corruption are diagnosed against the specific ACID property that failed — and against the configuration that determined the failure boundary.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Choosing an isolation level for a specific workload | `transaction-isolation` | transaction-isolation owns the I axis in operational depth |
| Reasoning about replica agreement, availability under partition | `cap-theorem-tradeoffs` | CAP is the distributed-systems frame; this is the single-system frame |
| Designing the database schema or entity model | `data-modeling` | data-modeling owns design; this owns runtime guarantees |
| Applying a zero-downtime migration | `database-migration` | database-migration owns migration mechanics |
| Designing patterns for replicated systems | `replication-patterns` | replication is the operational layer above single-node ACID |
| Choosing between ACID and BASE for a new system | `cap-theorem-tradeoffs` + this skill | cap-theorem provides the distributed frame; this provides the transactional frame |

## Key Sources

- Härder, T., & Reuter, A. (1983). ["Principles of Transaction-Oriented Database Recovery"](https://dl.acm.org/doi/10.1145/289.291). *ACM Computing Surveys*, 15(4), 287-317. The canonical paper that coined the ACID acronym and consolidated the transaction model.
- Gray, J. (1981). ["The Transaction Concept: Virtues and Limitations"](https://jimgray.azurewebsites.net/papers/thetransactionconcept.pdf). *VLDB 1981*. The foundational paper on the transaction concept that Härder & Reuter built on.
- Gray, J., & Reuter, A. (1992). *Transaction Processing: Concepts and Techniques*. Morgan Kaufmann. The canonical textbook on transaction processing; deep treatment of all four ACID properties and their implementation.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Chapter 7 (Transactions) provides modern practitioner treatment of ACID, BASE, and the configuration-dependent nature of transactional guarantees.
- PostgreSQL Global Development Group. ["PostgreSQL Documentation — Transaction Isolation"](https://www.postgresql.org/docs/current/transaction-iso.html). Reference for Postgres's specific implementation of isolation levels and the durability/consistency configuration surface.
- Pritchett, D. (2008). ["BASE: An Acid Alternative"](https://queue.acm.org/detail.cfm?id=1394128). *ACM Queue*. The canonical practitioner essay defining BASE as the alternative model for high-throughput distributed systems.
- Bailis, P., & Ghodsi, A. (2013). ["Eventual Consistency Today: Limitations, Extensions, and Beyond"](https://queue.acm.org/detail.cfm?id=2462076). *ACM Queue*. Modern treatment of the consistency models on the BASE side, including extensions to eventual consistency.
- Brewer, E. (2012). ["CAP Twelve Years Later: How the 'Rules' Have Changed"](https://ieeexplore.ieee.org/document/6133253). *IEEE Computer*, 45(2), 23-29. Brewer's revisit of CAP; useful for grounding the ACID-vs-CAP distinction.
- Berenson, H., Bernstein, P., Gray, J., Melton, J., O'Neil, E., & O'Neil, P. (1995). ["A Critique of ANSI SQL Isolation Levels"](https://dl.acm.org/doi/10.1145/568271.223785). *SIGMOD 1995*. Foundational paper on the practical issues with isolation-level definitions; required reading for understanding the I axis.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `backend-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: Use when reasoning about the four ACID properties of database transactions — Atomicity, Consistency, Isolation, Durability — as foundational concepts beneath any transactional system: what each property formally guarantees, the difference between the property the database claims and the property the application gets (depending on isolation level, replication mode, and configuration), the relationship between ACID and BASE (the alternative model in many NoSQL systems), why 'C' is the most contested letter (database consistency vs application invariants), and the historical record (Härder & Reuter 1983, the Gray-Reuter transaction model, Gray's Turing lecture). Do NOT use for choosing isolation levels for a specific workload (use transaction-isolation), distributed-system CAP tradeoffs (use cap-theorem-tradeoffs), database query design (use query-optimization), or zero-downtime migration mechanics (use database-migration).

**When to use**
- explain what ACID guarantees a database does and does not provide to the application
- decide whether ACID or BASE is the right model for a new system
- diagnose a data-loss incident — likely a durability or atomicity failure
- explain why the 'C' in ACID is not the same as application consistency
- Triggers: `is this database ACID`, `what does consistency mean`, `ACID vs BASE`, `is my transaction atomic`, `what's the durability guarantee`

**Not for**
- choose an isolation level for a workload (use transaction-isolation)
- reason about availability vs consistency in a distributed system (use cap-theorem-tradeoffs)
- design a database schema (use data-modeling)

**Related skills**
- Verify with: `transaction-isolation`, `cap-theorem-tradeoffs`
- Related: `replication-patterns`, `data-modeling`, `transaction-isolation`, `cap-theorem-tradeoffs`, `schema-evolution`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: ACID is to a database transaction what the four corners of a legal contract are to an agreement — Atomicity is the signing block (all parties sign together or no contract exists), Consistency is the boilerplate clauses (every clause must be satisfied for the contract to be valid), Isolation is the negotiating-room rule (other negotiations cannot read your draft until both sides initial each page), and Durability is the safe in the law office (once signed, the contract survives the office burning down).
- Common misconception: |

**Keywords**
- `ACID`, `atomicity`, `consistency`, `isolation`, `durability`, `transaction`, `BASE`, `Härder Reuter`, `Gray transaction model`, `transactional guarantee`

<!-- skill-graph-context:end -->
