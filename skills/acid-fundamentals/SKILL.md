---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: acid-fundamentals
description: "Use when reasoning about the four ACID properties of database transactions — Atomicity, Consistency, Isolation, Durability — as foundational concepts beneath any transactional system: what each property formally guarantees, the difference between the property the database claims and the property the application gets (depending on isolation level, replication mode, and configuration), the relationship between ACID and BASE (the alternative model in many NoSQL systems), why 'C' is the most contested letter (database consistency vs application invariants), and the historical record (Härder & Reuter 1983, the Gray-Reuter transaction model, Gray's Turing lecture). Do NOT use for choosing isolation levels for a specific workload (use transaction-isolation), distributed-system CAP tradeoffs (use cap-theorem-tradeoffs), database query design (use query-optimization), or zero-downtime migration mechanics (use database-migration)."
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
  - ACID
  - atomicity
  - consistency
  - isolation
  - durability
  - transaction
  - BASE
  - Härder Reuter
  - Gray transaction model
  - transactional guarantee
triggers:
  - "is this database ACID"
  - "what does consistency mean"
  - "ACID vs BASE"
  - "is my transaction atomic"
  - "what's the durability guarantee"
examples:
  - "explain what ACID guarantees a database does and does not provide to the application"
  - "decide whether ACID or BASE is the right model for a new system"
  - "diagnose a data-loss incident — likely a durability or atomicity failure"
  - "explain why the 'C' in ACID is not the same as application consistency"
anti_examples:
  - "choose an isolation level for a workload (use transaction-isolation)"
  - "reason about availability vs consistency in a distributed system (use cap-theorem-tradeoffs)"
  - "design a database schema (use data-modeling)"
relations:
  related:
    - transaction-isolation
    - cap-theorem-tradeoffs
    - data-modeling
    - replication-patterns
  boundary:
    - skill: transaction-isolation
      reason: "transaction-isolation owns the choice and semantics of isolation levels (read uncommitted, read committed, repeatable read, serializable, snapshot) — the 'I' of ACID specifically as a tunable. This skill owns ACID as the four-property foundational frame; transaction-isolation owns one of the four in operational depth."
    - skill: cap-theorem-tradeoffs
      reason: "cap-theorem-tradeoffs owns the distributed-systems frame (consistency, availability, partition tolerance) which uses 'consistency' in a different sense than the C in ACID. This skill owns the single-system transactional frame; cap-theorem-tradeoffs owns the distributed frame; conflating them is the most common misconception in this space."
    - skill: data-modeling
      reason: "data-modeling owns schema design and entity structure; this skill owns the transactional-guarantee semantics that any data model relies on at runtime."
    - skill: replication-patterns
      reason: "replication-patterns owns the patterns for keeping multiple replicas in agreement; this skill owns the single-node transactional model from which distributed replication is a generalization (and often a relaxation of)."
  verify_with:
    - transaction-isolation
    - cap-theorem-tradeoffs
concept:
  definition: "ACID is the acronym for four properties that a database transaction either provides or does not provide, defining the contract between the database and the application using it: Atomicity (the transaction either entirely happens or entirely does not — there is no partial state visible after a failure), Consistency (the transaction takes the database from one valid state to another valid state per the database's defined integrity constraints), Isolation (concurrent transactions do not see each other's intermediate states; each transaction observes the database as if it were the only transaction), Durability (once the transaction commits, its effects survive any subsequent failure including power loss). The four properties were codified by Härder and Reuter (1983) based on Jim Gray's earlier transaction model and have become the foundational vocabulary for relational and many NoSQL database systems. The strategic value of the ACID frame is that it names the four orthogonal guarantees the application can rely on, so that when a database advertises 'ACID compliance' or claims to relax some property, the conversation has precise vocabulary."
  mental_model: |
    Five primitives structure ACID reasoning:

    1. **Atomicity** — all-or-nothing transaction semantics. A transaction that performs N writes either commits all N or applies none. Mid-transaction failures (process crash, server power loss, network partition during commit) leave no partial state. The implementation is typically write-ahead logging plus rollback-or-redo: the database writes intent to a durable log before mutating data; on recovery, it replays committed transactions and discards uncommitted ones. Atomicity is *within* a transaction's scope; cross-transaction atomicity is a different problem (sagas, two-phase commit, application-level coordination).

    2. **Consistency** (the contested letter) — the transaction takes the database from one valid state to another, where "valid" means satisfying the database's defined integrity constraints (NOT NULL columns, foreign keys, check constraints, unique indexes, triggers). This is *database* consistency: the database's own rules. It is not application consistency (the business-rule invariants that the application enforces) — applications still need their own discipline. Many practitioners argue C is the weakest of the four letters because it follows from the application using A, I, and D correctly; Härder and Reuter themselves noted C is more an application-side responsibility than a database property.

    3. **Isolation** — concurrent transactions appear to execute as if serialized, even though the database is interleaving them for performance. The strongest level (serializable) guarantees the outcome is equivalent to *some* serial ordering; weaker levels (snapshot isolation, repeatable read, read committed, read uncommitted) trade isolation strength for concurrency throughput, allowing anomalies (phantom reads, write skew, lost updates) that strict serializability would prevent. The application's correctness depends on understanding which anomalies the chosen isolation level admits.

    4. **Durability** — once the database acknowledges a commit, the transaction's effects survive subsequent failure. The implementation typically requires the write-ahead log to be flushed to durable storage (disk or replicated to a quorum) before commit is acknowledged. Durability is the property that makes a database recoverable after power loss; without it, "committed" is a soft claim that disk failures can revoke. Configuration determines the strength: `synchronous_commit = off` in PostgreSQL trades durability for latency, and applications must know whether their database is configured this way.

    5. **The contract** — ACID is the *contract* the database advertises; the application's job is to use the database in a way that turns the contract into actual application correctness. A database can be ACID-compliant and the application can still corrupt data — by choosing a too-weak isolation level for the workload, by relying on cross-transaction invariants the database does not enforce, by configuring durability off in production, by depending on consistency rules the database doesn't know about. ACID is the foundation; correct usage is the discipline built on top.

    The deep insight is that **ACID names the four orthogonal axes a system can guarantee independently**. A database can be atomic and durable but not isolated (allowing concurrent transactions to see each other's intermediate state). A database can be isolated and atomic but not durable (acknowledging commit before flushing to disk). The four properties compose; understanding what your specific database actually guarantees on each axis — at the configuration in which you run it — is the operational discipline. "Is it ACID?" is the wrong question; "what does it guarantee for atomicity, consistency, isolation, and durability *in our configuration*?" is the right one.
  purpose: |
    ACID exists as a frame because, before its codification, the database industry was making incompatible claims about transactional behavior with no shared vocabulary. Härder and Reuter's 1983 paper consolidated Jim Gray's earlier transaction model into the four-letter acronym, and the frame has been the load-bearing concept underneath every relational database since.

    **Atomicity prevents partial-application corruption.** A transfer from account A to B that succeeded on the debit and failed on the credit produces money loss; an order-creation that succeeded on the order row and failed on the line-items produces orphaned data. Without atomicity, every multi-write operation requires application-level rollback logic that gets edge cases wrong under failure. With atomicity, the database guarantees the all-or-nothing property the application would otherwise have to implement, badly.

    **Consistency provides the integrity-constraint baseline.** Foreign keys, NOT NULL columns, unique indexes, and check constraints are the database's contribution to keeping data valid. Without them, the application is the only line of defense, and any bug in the application can corrupt the data store. With them, the database catches a class of bugs at the constraint boundary, preventing the corruption from being persisted.

    **Isolation prevents concurrency anomalies.** Without isolation, a transaction that reads X, computes a value, and writes the value back can be interleaved with another transaction doing the same thing, producing lost updates, write skew, phantom reads. The strongest isolation level (serializable) makes the database behave as if transactions ran one at a time; weaker levels trade off correctness for throughput. The choice is operational; the *property* exists because without it concurrency at scale becomes a guessing game.

    **Durability is the recoverability foundation.** A database that doesn't durably commit before acknowledging is one whose 'committed' state can be lost in a power failure. Without durability, every claim the application makes to users ('your order is confirmed') is unreliable. With durability, the application's persistence guarantees compose with the user's experience.

    The cost of ACID is real. Atomicity requires write-ahead logging and rollback machinery. Isolation requires locking, multi-version concurrency control, or both. Durability requires synchronous I/O at commit time. The combination limits throughput and latency relative to systems that relax some properties. This is why BASE-style systems (Basically Available, Soft state, Eventually consistent) exist — they trade ACID's guarantees for the throughput and availability ACID prevents. Both models are correct for different workloads.

    The deeper purpose is to give engineers and operators a *precise vocabulary* for what the database does and does not guarantee. A team that says "our database is ACID" without knowing the isolation level, the durability configuration, and the consistency-constraint set is making a vague claim. A team that says "we use Postgres at read committed with synchronous_commit=on, and our application enforces these specific application invariants in transactions" has a precise contract they can reason about.
  boundary: |
    **ACID is not the same as 'good database'.** A database can be ACID-compliant and still be the wrong choice for a workload — too slow, too rigid, too costly at scale, missing the access patterns the application needs. ACID is a *property set*, not a quality verdict. Many production systems use ACID-relaxed stores (Cassandra, DynamoDB, Redis without persistence) for workloads where ACID's costs exceed its benefits.

    **The 'C' in ACID is not the 'C' in CAP.** ACID's Consistency is database integrity-constraint satisfaction (foreign keys, check constraints, unique indexes). CAP's Consistency is multi-replica agreement (every replica returns the same value). They are different concepts with the same letter. A database can be ACID-Consistent (constraints satisfied) and CAP-inconsistent (replicas disagree); the two are about different things. Conflating them is the most common misconception in this space.

    **ACID is not strictly about relational databases.** Many NoSQL systems provide ACID transactions (MongoDB multi-document transactions since 4.0; DynamoDB transactional APIs; etcd; FoundationDB). The relational/NoSQL distinction is about data model; ACID is about transaction guarantees. A document database with ACID transactions is more transactional than a relational database configured with weak isolation and asynchronous commit.

    **ACID guarantees are configuration-dependent.** "Postgres is ACID" is incomplete — Postgres can be configured with `synchronous_commit = off` (sacrificing durability for latency), with `read uncommitted` (sacrificing isolation), or with replication that allows reads from stale replicas (sacrificing consistency for distributed reads). A team that doesn't know its production configuration doesn't know what guarantees it has.

    **Atomicity is within a single transaction.** Cross-transaction atomicity (saga pattern, two-phase commit, application-level compensation) is a different problem with different solutions. A bug-tracker that records "issue created → assignee notified" as two transactions has no atomicity between them; the assignee notification can fail after the issue creation succeeded, and the application must handle this case explicitly. ACID doesn't extend across transaction boundaries.

    **ACID does not prevent all data corruption.** A database can be perfectly ACID-compliant and accept inputs that the *application* considers corrupt (a price field set to a negative value, a date set to year 9999). ACID enforces the database's own rules; the application's rules are the application's responsibility. The two layers compose; ACID is not a substitute for application validation.

    **'BASE' is not the opposite of ACID.** BASE (Basically Available, Soft state, Eventually consistent) is a different model with different goals — relax consistency for availability, accept eventual rather than immediate convergence. BASE and ACID are not mutually exclusive across an architecture; many systems use ACID for transactional cores and BASE for high-throughput non-transactional paths (logs, analytics, caches).

    **Durability has degrees.** "Committed" can mean: written to OS buffer cache (lost on power failure), written to disk on this server (lost on disk failure), written to disk on a replica (lost on rare correlated failures), written to multiple geographic replicas (lost only on regional disaster). Different durability configurations match different failure-tolerance budgets; "durable" without qualification is imprecise.
  taxonomy: |
    By property of ACID:
    - **Atomicity** — all-or-nothing within a single transaction. Implementation: write-ahead logging, rollback/redo.
    - **Consistency** — database-defined integrity constraints satisfied across the transaction. Implementation: foreign keys, NOT NULL, unique indexes, check constraints, triggers.
    - **Isolation** — concurrent transactions appear serialized. Implementation: locking, multi-version concurrency control (MVCC), serializable snapshot isolation. Has graded levels (see transaction-isolation).
    - **Durability** — committed effects survive failure. Implementation: synchronous WAL flush, replication to durable storage.

    By isolation level (graded under the I):
    - **Read uncommitted** — weakest; dirty reads allowed. Rare in modern databases.
    - **Read committed** — default in many databases (Postgres, Oracle); dirty reads prevented but non-repeatable reads allowed.
    - **Repeatable read** — same row reads return same value within transaction; phantom reads still possible.
    - **Snapshot isolation** — transaction sees a consistent snapshot; allows write skew anomaly.
    - **Serializable** — strongest; equivalent to some serial ordering. Postgres's serializable snapshot isolation (SSI) is one implementation.

    By durability configuration:
    - **Synchronous local** — WAL flushed to local disk before commit acknowledged. Standard durable default.
    - **Asynchronous local** — commit acknowledged before WAL flush. Lower latency, possible loss of last few transactions on crash.
    - **Synchronous replication** — WAL flushed to replicas before commit acknowledged. Strongest; highest latency.
    - **Quorum replication** — commit acknowledged once a quorum of replicas acknowledge. Common in distributed databases.

    By consistency-rule scope:
    - **Database-level** — constraints declared in schema (PK, FK, NOT NULL, UNIQUE, CHECK).
    - **Transaction-level** — application enforces invariants within a transaction; database executes them atomically.
    - **Cross-transaction-level** — application-level coordination via locks, queues, sagas, or compensating transactions. Outside ACID's scope.

    By model:
    - **ACID** — the classical relational model; strong transactional guarantees within a single node (or tightly-replicated cluster).
    - **BASE** — Basically Available, Soft state, Eventually consistent. Designed for distributed-availability tradeoff; gives up strict consistency for high availability under partition.
    - **Mixed** — many real systems use ACID for transactional cores and BASE for high-throughput non-transactional paths (event logs, analytics, distributed caches).

    By database type and ACID support:
    - **Strong-ACID relational** — Postgres, Oracle, SQL Server, MySQL InnoDB; ACID is the default.
    - **ACID with caveats** — MongoDB multi-document transactions (since 4.0); DynamoDB transactional APIs; Cosmos DB transactional level.
    - **Single-row-ACID** — many NoSQL stores guarantee atomicity per single row/document but not across multiple.
    - **BASE-by-default** — Cassandra, Riak; ACID transactions are not the primary model.
  analogy: |
    A bank's accounting system. ACID is the four guarantees the bank teller can promise a customer about the deposit they just made:

    **Atomicity** is "your deposit and the corresponding credit to your account either both happened, or neither happened — there is no state where the bank has your money but your balance hasn't gone up." If the system crashes mid-transaction, the recovery procedure either re-runs the credit or returns the money; it never leaves you in a state where one side happened and the other didn't.

    **Consistency** is "after the deposit, the bank's ledger still balances — total liabilities equal total assets, no account has a negative balance unless an overdraft is authorized, no FX transfer leaves currency totals broken." The bank's defined rules are still satisfied. Application-level consistency (your bank's specific policies about, say, large transactions requiring manager approval) is a separate concern enforced elsewhere.

    **Isolation** is "even though there are five tellers serving customers simultaneously, your transaction sees a consistent view of your account; another customer depositing at the same teller's station can't see your half-completed transaction, and you can't see theirs." The bank presents each customer with the illusion that they are the only one being served, even though parallel transactions are happening.

    **Durability** is "once the teller stamps your receipt, the deposit is permanent. If the bank's mainframe crashes the next minute, your deposit survived; if the bank burns down, the deposit was replicated to another office so it survived; if the entire region loses power, your deposit was written to durable storage before the lights went out." The acknowledgment is binding.

    BASE is what happens when the bank moves to a globally-distributed model with thousands of branches. The bank may decide it cannot afford to wait for all branches to agree on the deposit's official record before giving you a receipt; instead, it gives you a receipt locally and lets the other branches catch up over the next minutes. Your balance might briefly disagree across branches; eventually all branches will show the same balance. This is BASE — availability and eventual convergence at the cost of immediate global consistency.

    The CAP theorem's C is a different sense — it asks whether all branches *currently agree* on your balance (CAP-consistency), not whether your transaction satisfies the bank's accounting rules (ACID-consistency). The two C's are the source of much confusion.

    Choosing between ACID and BASE for a system is choosing what kind of bank you are: a single trusted vault that takes a moment to credit but is rock-solid (ACID), or a distributed network of branches that is always available but may briefly disagree about your balance (BASE). Different business models call for different choices.
  misconception: |
    The most common misconception is that **'ACID' means 'good database'**. It does not. ACID is a property set, not a quality verdict. Many production-strong systems are non-ACID by design; many ACID-compliant systems are wrong for specific workloads (too slow, too rigid, too costly). The right question is "does this database provide the guarantees this workload needs," not "is it ACID."

    The second misconception is that **ACID's C and CAP's C are the same**. They are not. ACID's Consistency is database integrity-constraint satisfaction (foreign keys hold, unique indexes hold, etc.). CAP's Consistency is multi-replica agreement on the value of a given key. A database can be ACID-Consistent and CAP-inconsistent — the constraints are satisfied but the replicas disagree. Treating them as the same letter is the most common misconception in this space.

    The third misconception is that **ACID is binary**. It is not. Each of A, I, D has graded levels (durability has synchronous local / async local / synchronous replication / quorum; isolation has uncommitted / committed / repeatable / snapshot / serializable). A database can be strongly atomic, weakly isolated, and synchronously durable simultaneously. Asking "is this ACID?" without specifying configuration is asking an under-determined question.

    The fourth misconception is that **ACID prevents all data corruption**. It prevents corruption of *database-level rules*. Application-level rules (a price should never be negative; a user should never have two active subscriptions) are the application's responsibility. ACID guarantees the database executes the application's writes atomically; whether those writes are *correct* is the application's discipline.

    The fifth misconception is that **ACID applies to relational databases only**. Many NoSQL systems provide ACID transactions: MongoDB (since 4.0), DynamoDB (transactional APIs), etcd, FoundationDB, Cosmos DB. The relational/NoSQL distinction is about data model; ACID is about transactional behavior. The two are independent.

    The sixth misconception is that **ACID and BASE are mutually exclusive across an architecture**. They are not. Most production architectures use both — ACID for transactional cores (orders, payments, account state) and BASE for high-throughput non-transactional paths (event streams, analytics, caches, search indexes). The choice is per-component, not per-system.

    The seventh misconception is that **'committed' means the same thing across databases**. It does not. In Postgres with `synchronous_commit = on`, committed means written to the local WAL on durable storage. In Postgres with `synchronous_commit = off`, committed means written to OS buffer cache; a crash can lose the last few commits. In a synchronous-replicated cluster, committed means flushed to a quorum of nodes. The semantics depend on configuration.

    The eighth misconception is that **durability is automatic**. It is configurable. Production systems are sometimes deployed with weaker durability than the team realizes; the cost manifests as data loss in incident reports. Knowing your specific database's durability configuration — not assuming the default — is operational discipline.

    The ninth misconception is that **isolation level is universal across databases**. The SQL standard names four levels (read uncommitted, read committed, repeatable read, serializable), but each database implements them with subtle variations. Postgres's serializable is SSI (Serializable Snapshot Isolation) — different from MS SQL Server's serializable. Reading the specific database's isolation-level documentation is required, not optional.
---

# ACID Fundamentals

## Coverage

The four foundational transactional properties — Atomicity, Consistency, Isolation, Durability — that define the contract between a database and the application using it. Covers what each property formally guarantees, the implementation mechanisms underneath each (write-ahead logging for atomicity; locking and MVCC for isolation; constraint checking for consistency; synchronous storage flush for durability), the configuration-dependent strength of each property, the BASE alternative model for systems that trade ACID guarantees for availability, the C-of-ACID vs C-of-CAP distinction that is the most-frequently-confused concept in the space, and the historical record from Gray's transaction model through Härder & Reuter's 1983 formalization.

## Philosophy

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
| Isolation level | `read committed` | `serializable` is strongest; `read uncommitted` allows dirty reads |
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
