---
name: transaction-isolation
description: "Use when reasoning about the I in ACID — the isolation level a database provides between concurrent transactions: the five SQL-standard levels (read uncommitted, read committed, repeatable read, serializable) plus snapshot isolation; the anomalies each level admits (dirty reads, non-repeatable reads, phantom reads, write skew, lost updates); the Berenson et al. 1995 critique that exposed the standard's looseness; the difference between locking-based and MVCC-based isolation; Postgres's Serializable Snapshot Isolation (SSI) as one rigorous implementation; how to choose an isolation level for a workload by enumerating the anomalies the workload cannot tolerate. Do NOT use for the broader ACID frame (use acid-fundamentals), distributed-replica consistency (use cap-theorem-tradeoffs), query performance tuning (use query-optimization), or schema design (use data-modeling)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"cap-theorem-tradeoffs\",\"data-modeling\",\"acid-fundamentals\",\"query-optimization\",\"indexing-strategy\"],\"suppresses\":[\"acid-fundamentals\"],\"verify_with\":[\"query-optimization\",\"acid-fundamentals\",\"replication-patterns\"]}"
  subject: backend-engineering
  public: "true"
  scope: "Use when reasoning about the I in ACID — the isolation level a database provides between concurrent transactions: the five SQL-standard levels (read uncommitted, read committed, repeatable read, serializable) plus snapshot isolation; the anomalies each level admits (dirty reads, non-repeatable reads, phantom reads, write skew, lost updates); the Berenson et al. 1995 critique that exposed the standard's looseness; the difference between locking-based and MVCC-based isolation; Postgres's Serializable Snapshot Isolation (SSI) as one rigorous implementation; how to choose an isolation level for a workload by enumerating the anomalies the workload cannot tolerate. Do NOT use for the broader ACID frame (use acid-fundamentals), distributed-replica consistency (use cap-theorem-tradeoffs), query performance tuning (use query-optimization), or schema design (use data-modeling)."
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"isolation level\",\"read committed\",\"repeatable read\",\"serializable\",\"snapshot isolation\",\"SSI\",\"MVCC\",\"dirty read\",\"non-repeatable read\",\"phantom read\"]"
  triggers: "[\"what isolation level do we need\",\"is read committed enough\",\"what's write skew\",\"MVCC vs locking\",\"Postgres serializable vs MySQL serializable\"]"
  examples: "[\"choose an isolation level for a workload that has concurrent balance-decrement operations\",\"diagnose a data-correctness bug caused by an anomaly the chosen isolation level permits\",\"explain the difference between snapshot isolation and full serializability\",\"decide whether to use SELECT FOR UPDATE or upgrade isolation level\"]"
  anti_examples: "[\"explain the four ACID properties (use acid-fundamentals)\",\"reason about distributed-replica consistency under partition (use cap-theorem-tradeoffs)\",\"tune a slow query (use query-optimization)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "An isolation level is to a database what a confidentiality regime is to a research lab — Read Uncommitted is the open whiteboard (anyone can read anyone's half-finished work); Read Committed is the rule that you only photograph your colleague's notebook after they have signed each page; Repeatable Read is a sealed envelope (you read once, you keep reading the same thing for the duration); Serializable is a locked vault (you take exclusive custody, others queue); Snapshot Isolation is a private photocopy (you read from your photocopy, others read from theirs, and only at commit time do the photocopies have to agree on the world they were taken from)."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/backend-engineering/transaction-isolation/SKILL.md
---

# Transaction Isolation

## Concept of the skill

Transaction isolation is the I axis of ACID — the property and operational choice that determines what concurrent transactions can observe of each other's intermediate effects. The SQL standard defines four levels by enumerating the *anomalies* each may or may not permit: Read Uncommitted (dirty reads allowed), Read Committed (no dirty reads), Repeatable Read (no dirty reads or non-repeatable reads), Serializable (no anomalies). Snapshot Isolation (SI) is a fifth practical level the standard did not define — ubiquitous in MVCC databases — that prevents most anomalies but still admits *write skew* and the read-only-transaction anomaly. The anomaly catalog: *dirty read* (uncommitted data visible), *non-repeatable read* (same row, different values within transaction), *phantom read* (same range query, different result set), *lost update* (read-modify-write race), *write skew* (two transactions act on a snapshot and jointly violate an invariant), *read-only-transaction anomaly*.

Replaces reflex isolation choices ("default to serializable for safety," "default to read committed for performance") with named, workload-aware vulnerability analysis. Solves the problem that the SQL standard's levels are loosely defined (Berenson et al. 1995 critique), the level names are not universal across databases, and the workload's vulnerability to specific anomalies determines the required level — and most teams don't enumerate that vulnerability before choosing. The choice procedure: (1) enumerate the workload's anomaly vulnerabilities per transaction class (a balance-decrement is vulnerable to lost updates; a doctor-on-call check is vulnerable to write skew; a cross-table report is vulnerable to non-repeatable reads if consistency matters); (2) find the lowest level that prevents the named anomalies; (3) verify the specific database's implementation actually prevents what the standard says it should; (4) add explicit locking (`SELECT FOR UPDATE`, advisory locks, optimistic-concurrency tokens) where targeted correctness is needed without raising the whole transaction's isolation level; (5) handle the retry-required failure modes higher isolation introduces (SSI commit-time aborts, serialization errors at RR).

Distinct from acid-fundamentals, which owns the four-property ACID frame as a whole — acid-fundamentals names isolation as one of four guarantees; this skill makes the I axis operational by enumerating levels and anomalies. The two compose. Distinct from cap-theorem-tradeoffs, which owns distributed-replica agreement — CAP's C is the cross-replica consistency property; this skill's I is the single-cluster transaction-isolation property; the two C/I letters concern different layers of the system. Distinct from query-optimization, which owns the performance dimension of query execution — sometimes a slow query is slow because of lock contention from isolation, and the disciplines intersect on those cases (slow under concurrency, fast solo → suspect locking). Distinct from data-modeling, which owns schema and access-pattern design (this skill owns the concurrency-correctness contract under whichever schema is chosen). Distinct from replication-patterns, which owns multi-node copying — sometimes interacts with isolation when reads from replicas have different freshness guarantees, but the in-cluster isolation question is separate. Distinct from cross-transaction coordination (sagas, distributed locks), which is a different problem at a layer above. An isolation level is to a database what a confidentiality regime is to a research lab — Read Uncommitted is the open whiteboard (anyone can read anyone's half-finished work); Read Committed is the rule that you only photograph your colleague's notebook after they have signed each page; Repeatable Read is a sealed envelope (you read once, you keep reading the same thing for the duration); Serializable is a locked vault (you take exclusive custody, others queue); Snapshot Isolation is a private photocopy (you read from your photocopy, others read from theirs, and only at commit time do the photocopies have to agree on the world they were taken from). The wrong mental model is that the SQL standard's level names mean the same thing across databases, and that "we run at serializable" is a complete description of the system's behavior. They are not, and it is not. Postgres at serializable uses SSI with commit-time aborts that the application must catch and retry — the retry logic is part of the contract. MySQL InnoDB at "repeatable read" uses gap locks to prevent phantoms, giving a different anomaly profile than the standard's repeatable read. SQL Server's RCSI turns read committed into snapshot-flavored read committed. Oracle's "serializable" is snapshot isolation with consistency checks — not the same as Postgres SSI. A second misconception: that snapshot isolation is "almost serializable" and safe enough for most workloads. SI admits *write skew* — two transactions read overlapping data and write disjoint updates that jointly violate an invariant the application depended on. Doctors-on-call schedules, balance-sum constraints across rows, uniqueness invariants across a set, and "at least one of these rows must be X" invariants are all SI-vulnerable. A third: that "raise the isolation level to be safe" is free — higher isolation introduces new failure modes (SSI aborts, serialization errors) that the application must handle, not zero failure modes. The discipline is to *name the anomalies the workload cannot tolerate* and choose accordingly, not to default to a familiar level and hope.

## Coverage

The I axis of ACID — the property and operational choice that determines what concurrent transactions can observe of each other. Covers the five practical levels (read uncommitted, read committed, repeatable read, snapshot isolation, serializable), the anomalies each admits (dirty reads, non-repeatable reads, phantom reads, lost updates, write skew, read-only-transaction anomalies), the Berenson et al. (1995) critique that exposed the SQL standard's looseness, the two dominant implementation mechanisms (two-phase locking and MVCC), Postgres's Serializable Snapshot Isolation (SSI), and the choice procedure: enumerate the anomalies the workload cannot tolerate, choose the lowest level that prevents them.

## Philosophy of the skill
Isolation is the most-mis-defaulted and most-mis-understood part of ACID. The standard's level names are not universal across databases; the level the team thinks they're running may not be the one the database actually provides; the workload's vulnerability to specific anomalies determines the required level — and most teams don't enumerate that vulnerability before choosing.

The discipline is to make the choice explicit, per transaction, against a named anomaly set. "Default to serializable for safety" is over-conservative; "default to read committed for performance" is under-safe; "this workload has invariants across rows that are vulnerable to write skew under SI, so this transaction runs at serializable" is the discipline.

The implementation matters as much as the level. A team running on Postgres at "serializable" is using SSI, with commit-time aborts that require retry-loop logic; a team running on MySQL InnoDB at "repeatable read" is getting gap-lock-prevented phantoms unlike the standard. Knowing the specific database's implementation of the chosen level is operational hygiene.

## The Anomaly Catalog

| Anomaly | What it is | Eliminated by |
|---|---|---|
| Dirty read | Reading uncommitted data from another transaction | Read committed and above |
| Non-repeatable read | Same row, different values within transaction | Repeatable read and above |
| Phantom read | Same range query, different result set | Serializable (and some RR implementations) |
| Lost update | Read-modify-write race between two transactions | Serializable; mitigated by SELECT FOR UPDATE |
| Write skew | Two transactions act on a snapshot; jointly violate an invariant | Serializable / SSI |
| Read-only transaction anomaly | Read-only transaction produces inconsistent output | SSI |

The discipline is reading this table for the workload at hand: which of these anomalies, if they occurred, would produce a correctness bug? Pick the lowest level that prevents those.

## Level vs Implementation Matrix

| Level (standard) | Postgres | MySQL InnoDB | SQL Server | Oracle |
|---|---|---|---|---|
| Read Uncommitted | Same as read committed | Available; dirty reads | Available | Same as read committed |
| Read Committed | Default; MVCC | Available | Default | Default; MVCC |
| Repeatable Read | MVCC; phantoms allowed | Default; gap locks prevent phantoms | Available; lock-based | Same as serializable |
| Snapshot Isolation | Not directly named (RR is SI-like) | n/a | RCSI option | Default-equivalent |
| Serializable | SSI (since 9.1) | Lock-based | Lock-based with range locks | Snapshot + checks |

Naming is not consistent; reading the database's documentation is required.

## The Choice Procedure

1. **Enumerate the workload's anomaly vulnerabilities.** For each transaction class: which anomalies would produce a correctness bug if they occurred? (A balance-decrement is vulnerable to lost updates. A doctor-on-call check is vulnerable to write skew. A read-only report is vulnerable to non-repeatable reads if cross-table consistency matters.)

2. **Find the lowest level that prevents the named anomalies.** Walk the anomaly catalog upward. Stop at the level that prevents all vulnerabilities.

3. **Verify the database's implementation actually prevents what the standard says it should.** Read the specific database's documentation; don't assume the standard's table is what your database does.

4. **Add explicit locking where the level alone is insufficient.** `SELECT FOR UPDATE`, advisory locks, and optimistic-concurrency tokens are tools for targeted correctness without raising the whole transaction's isolation level.

5. **Handle the retry-required failure modes.** SSI can abort transactions at commit; the application must retry. Repeatable read can throw serialization errors; the application must handle. Higher isolation introduces new failure modes, not zero failure modes.

## Verification

After applying this skill, verify:
- [ ] The team can name the database's default isolation level and the level's implementation mechanism (MVCC, SSI, locking). Default assumption is not relied on.
- [ ] For each transaction class, the team has enumerated the anomaly vulnerabilities and chosen an isolation level that prevents them. Levels are not picked by reflex.
- [ ] Explicit locking (SELECT FOR UPDATE, advisory locks) is used where targeted correctness is needed without upgrading the whole transaction.
- [ ] Application code that runs at SSI or repeatable-read with serialization errors has retry-on-conflict logic. Higher isolation's failure modes are handled, not ignored.
- [ ] Write skew vulnerability is recognized for transactions that read X and write Y based on it under SI; either the level is upgraded to serializable or explicit locking guards the read set.
- [ ] Read-only transactions that join multiple tables run at at least repeatable read or snapshot isolation when cross-table consistency matters.
- [ ] The specific database's documentation has been consulted, not the SQL standard's level names. The team knows the specific anomaly set the level actually prevents.
- [ ] Isolation-level changes in production are treated as behavior changes, not config changes. New failure modes are handled before the change rolls.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Explaining the broader ACID frame | `acid-fundamentals` | acid-fundamentals owns the four-property frame; this owns the I axis |
| Reasoning about replica agreement across nodes | `cap-theorem-tradeoffs` | CAP is the distributed-systems frame; this is the single-cluster transactional frame |
| Tuning a slow query's performance | `query-optimization` | query-optimization owns performance; this owns concurrency correctness |
| Choosing an index for a query | `indexing-strategy` | indexing owns retrieval performance; this owns concurrent execution |
| Designing schema and access patterns | `data-modeling` | data-modeling owns design; this owns the concurrency contract |
| Coordinating across multiple transactions or services | sagas / distributed locks (out of this skill's scope) | cross-transaction coordination is a different problem |

## Key Sources

- Berenson, H., Bernstein, P., Gray, J., Melton, J., O'Neil, E., & O'Neil, P. (1995). ["A Critique of ANSI SQL Isolation Levels"](https://dl.acm.org/doi/10.1145/568271.223785). *SIGMOD 1995*. Foundational paper formalizing the anomalies and showing the SQL standard's looseness; required reading for serious treatment of isolation.
- Adya, A. (1999). ["Weak Consistency: A Generalized Theory and Optimistic Implementations for Distributed Transactions"](http://pmg.csail.mit.edu/papers/adya-phd.pdf). PhD thesis, MIT. Extends Berenson et al. with a more rigorous framework; basis for modern isolation reasoning.
- Cahill, M. J., Röhm, U., & Fekete, A. D. (2008). ["Serializable Isolation for Snapshot Databases"](https://dl.acm.org/doi/10.1145/1376616.1376690). *SIGMOD 2008*. The paper that introduced Serializable Snapshot Isolation (SSI); the basis of Postgres's serializable mode since 9.1.
- Fekete, A., Liarokapis, D., O'Neil, E., O'Neil, P., & Shasha, D. (2005). ["Making Snapshot Isolation Serializable"](https://dl.acm.org/doi/10.1145/1071610.1071615). *ACM TODS*, 30(2). Precursor to the SSI paper; characterization of snapshot isolation's anomaly set.
- PostgreSQL Global Development Group. ["PostgreSQL Documentation — Transaction Isolation"](https://www.postgresql.org/docs/current/transaction-iso.html). Canonical reference for Postgres's specific isolation implementation; covers SSI behavior and the abort-and-retry contract.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Chapter 7 (Transactions) — modern practitioner treatment of all isolation levels, anomalies, and the implementation strategies.
- Gray, J., & Reuter, A. (1992). *Transaction Processing: Concepts and Techniques*. Morgan Kaufmann. The canonical textbook; deep treatment of locking and concurrency control.
- Bernstein, P. A., & Goodman, N. (1981). ["Concurrency Control in Distributed Database Systems"](https://dl.acm.org/doi/10.1145/356842.356846). *ACM Computing Surveys*, 13(2). Foundational survey of concurrency-control techniques.
- MySQL Reference Manual. ["Transaction Isolation Levels"](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html). Reference for MySQL InnoDB's specific implementation; documents the gap-lock prevention of phantoms at RR.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `backend-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: Use when reasoning about the I in ACID — the isolation level a database provides between concurrent transactions: the five SQL-standard levels (read uncommitted, read committed, repeatable read, serializable) plus snapshot isolation; the anomalies each level admits (dirty reads, non-repeatable reads, phantom reads, write skew, lost updates); the Berenson et al. 1995 critique that exposed the standard's looseness; the difference between locking-based and MVCC-based isolation; Postgres's Serializable Snapshot Isolation (SSI) as one rigorous implementation; how to choose an isolation level for a workload by enumerating the anomalies the workload cannot tolerate. Do NOT use for the broader ACID frame (use acid-fundamentals), distributed-replica consistency (use cap-theorem-tradeoffs), query performance tuning (use query-optimization), or schema design (use data-modeling).

**When to use**
- choose an isolation level for a workload that has concurrent balance-decrement operations
- diagnose a data-correctness bug caused by an anomaly the chosen isolation level permits
- explain the difference between snapshot isolation and full serializability
- decide whether to use SELECT FOR UPDATE or upgrade isolation level
- Triggers: `what isolation level do we need`, `is read committed enough`, `what's write skew`, `MVCC vs locking`, `Postgres serializable vs MySQL serializable`

**Not for**
- explain the four ACID properties (use acid-fundamentals)
- reason about distributed-replica consistency under partition (use cap-theorem-tradeoffs)
- tune a slow query (use query-optimization)

**Related skills**
- Verify with: `query-optimization`, `acid-fundamentals`, `replication-patterns`
- Related: `cap-theorem-tradeoffs`, `data-modeling`, `acid-fundamentals`, `query-optimization`, `indexing-strategy`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: An isolation level is to a database what a confidentiality regime is to a research lab — Read Uncommitted is the open whiteboard (anyone can read anyone's half-finished work); Read Committed is the rule that you only photograph your colleague's notebook after they have signed each page; Repeatable Read is a sealed envelope (you read once, you keep reading the same thing for the duration); Serializable is a locked vault (you take exclusive custody, others queue); Snapshot Isolation is a private photocopy (you read from your photocopy, others read from theirs, and only at commit time do the photocopies have to agree on the world they were taken from).
- Common misconception: |

**Keywords**
- `isolation level`, `read committed`, `repeatable read`, `serializable`, `snapshot isolation`, `SSI`, `MVCC`, `dirty read`, `non-repeatable read`, `phantom read`

<!-- skill-graph-context:end -->
