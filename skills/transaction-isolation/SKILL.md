---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: transaction-isolation
description: "Use when reasoning about the I in ACID — the isolation level a database provides between concurrent transactions: the five SQL-standard levels (read uncommitted, read committed, repeatable read, serializable) plus snapshot isolation; the anomalies each level admits (dirty reads, non-repeatable reads, phantom reads, write skew, lost updates); the Berenson et al. 1995 critique that exposed the standard's looseness; the difference between locking-based and MVCC-based isolation; Postgres's Serializable Snapshot Isolation (SSI) as one rigorous implementation; how to choose an isolation level for a workload by enumerating the anomalies the workload cannot tolerate. Do NOT use for the broader ACID frame (use acid-fundamentals), distributed-replica consistency (use cap-theorem-tradeoffs), query performance tuning (use query-optimization), or schema design (use data-modeling)."
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
  - isolation level
  - read committed
  - repeatable read
  - serializable
  - snapshot isolation
  - SSI
  - MVCC
  - dirty read
  - non-repeatable read
  - phantom read
  - write skew
  - lost update
  - Berenson
triggers:
  - "what isolation level do we need"
  - "is read committed enough"
  - "what's write skew"
  - "MVCC vs locking"
  - "Postgres serializable vs MySQL serializable"
examples:
  - "choose an isolation level for a workload that has concurrent balance-decrement operations"
  - "diagnose a data-correctness bug caused by an anomaly the chosen isolation level permits"
  - "explain the difference between snapshot isolation and full serializability"
  - "decide whether to use SELECT FOR UPDATE or upgrade isolation level"
anti_examples:
  - "explain the four ACID properties (use acid-fundamentals)"
  - "reason about distributed-replica consistency under partition (use cap-theorem-tradeoffs)"
  - "tune a slow query (use query-optimization)"
relations:
  related:
    - acid-fundamentals
    - cap-theorem-tradeoffs
    - data-modeling
    - query-optimization
  boundary:
    - skill: acid-fundamentals
      reason: "acid-fundamentals owns the four-property ACID frame as a whole; this skill owns the I axis specifically — the choice and semantics of isolation levels as a tunable. The two compose: acid-fundamentals names isolation as one of four guarantees; this skill makes the I axis operational."
    - skill: cap-theorem-tradeoffs
      reason: "cap-theorem-tradeoffs owns distributed-replica agreement (CAP's C); this skill owns single-cluster transaction isolation (ACID's I). The two C/I letters concern different layers of the system."
    - skill: query-optimization
      reason: "query-optimization owns the performance dimension of query execution; this skill owns the correctness dimension of concurrent execution. Optimizations that change locking behavior can shift anomaly exposure; the two interact."
    - skill: data-modeling
      reason: "data-modeling owns schema and access-pattern design; this skill owns the concurrency-correctness contract under whichever schema and access pattern are chosen."
  verify_with:
    - acid-fundamentals
    - query-optimization
concept:
  definition: "Transaction isolation is the property — and the configurable choice — that determines whether concurrent transactions appear to execute serially or are permitted to observe each other's intermediate effects. The SQL standard defines four isolation levels (read uncommitted, read committed, repeatable read, serializable) by enumerating the anomalies each level may or may not permit (dirty reads, non-repeatable reads, phantom reads). Snapshot isolation, ubiquitous in modern MVCC databases, is a fifth practical level that the standard did not define. Stronger isolation eliminates more anomalies at the cost of concurrency (more transactions block or retry); weaker isolation admits anomalies that the application must handle, either by tolerating them, by upgrading the isolation level, or by using explicit locking. The discipline is choosing the isolation level by *naming the anomalies the application cannot tolerate*, not by reflex."
  mental_model: |
    Five primitives structure isolation reasoning:

    1. **Anomalies** — the specific kinds of incorrect outcome that arise when concurrent transactions interleave. Dirty read: T1 reads data T2 wrote but hasn't committed; T2 rolls back, T1 saw a value that never existed. Non-repeatable read: T1 reads a row twice and sees different values because T2 committed between the reads. Phantom read: T1 queries a range twice and gets different sets of rows because T2 inserted (or deleted) matching rows between. Lost update: two transactions read the same value, both compute updates, both write back, one update overwrites the other. Write skew: two transactions each read a consistent state, each act on a constraint the other transaction's write affects, both commit — neither saw the other's effect, and the final state violates the invariant.

    2. **Isolation levels (graded by anomaly admission)** — Read Uncommitted (admits dirty reads), Read Committed (admits non-repeatable reads, phantoms, lost updates, write skew), Repeatable Read (admits phantoms; behavior on lost updates and write skew varies), Snapshot Isolation (eliminates non-repeatable reads via snapshot but admits write skew), Serializable (eliminates all anomalies — outcome equivalent to *some* serial execution). The strength is partial-ordered; each higher level eliminates a strict superset of anomalies the lower level admitted.

    3. **The Berenson et al. (1995) critique** — the SQL standard defined isolation levels by anomaly admission in language that was imprecise; multiple databases implemented "serializable" or "repeatable read" with different actual behavior. The 1995 paper formally characterized the anomalies and showed the standard left ambiguities that vendors filled inconsistently. Reading the specific database's documentation — not the standard — is required to know what an isolation level actually guarantees.

    4. **Locking vs MVCC implementations** — the two dominant implementation strategies. Locking (DB2, older SQL Server): readers take shared locks; writers take exclusive locks; conflicts block. MVCC (Postgres, Oracle, MySQL InnoDB, SQL Server with RCSI enabled): each transaction sees a consistent snapshot at its start; writes create new versions; reads don't block writers and writers don't block readers, but write-write conflicts still produce conflicts (detected at commit time in SSI; via SELECT FOR UPDATE in classic MVCC). The implementation determines the performance profile and the exact anomaly set.

    5. **The choice procedure** — enumerate the anomalies the application's correctness depends on preventing, find the lowest isolation level that prevents them, choose that level. The reverse approach (default to serializable for safety; default to read committed for performance) ignores the application's actual concurrency-correctness needs and produces either over-conservatism (unnecessary throughput cost) or correctness bugs (the application admits write skew because it's running at snapshot isolation and a developer didn't realize the workload was vulnerable).

    The deep insight is that **isolation level is a correctness-vs-throughput trade-off the application authors must make explicitly, knowing the workload**. The right default depends on the workload: read committed is often fine for read-heavy workloads with simple writes; serializable is right when the workload includes invariants across rows that the database must enforce; snapshot isolation is the sweet spot for many MVCC databases (eliminates non-repeatable reads cheaply) but admits write skew (which catches many teams unprepared). The discipline is naming the anomalies you cannot tolerate and choosing the level that prevents them.

    The complementary insight is that **the database's named isolation level is not the standard's**. PostgreSQL's "serializable" is SSI (Serializable Snapshot Isolation) — different in mechanism from MS SQL Server's serializable. Reading the specific database's documentation is required.
  purpose: |
    Transaction isolation exists because concurrent execution is the database's central performance feature, and unrestricted concurrency violates correctness. The isolation framework names the trade-off precisely and lets the application choose the right point on it.

    **Without isolation, every read is a race.** A transaction that reads a row and acts on the value has no guarantee the value is committed, the value is stable across reads in the same transaction, or the value reflects any consistent state of the database. Applications would have to defensively lock everything or accept frequent correctness failures.

    **With unrestricted isolation (full serializability for everything), throughput collapses.** A workload of 10,000 concurrent transactions running at serializable level produces enormous lock contention or retry traffic. Many workloads don't need serializable correctness; running everything there pays an unnecessary throughput cost.

    **The graded model lets per-transaction choice.** Each transaction can run at the isolation level it needs. A read-only report can run at read committed (or even read uncommitted) — it doesn't need serializability. A balance-decrement that must not lose updates needs at least snapshot isolation with explicit locking or full serializable. A schema migration that must observe a stable view needs repeatable read or serializable. The application picks per transaction.

    **The anomaly vocabulary makes the choice explicit.** Without the named anomalies (dirty read, non-repeatable read, phantom read, write skew, lost update), the conversation is "more isolation = safer." With them, the conversation is "this workload is vulnerable to write skew because we read X, decide based on it, then write Y; that's an SI-class anomaly; we need SSI or explicit locking." Naming the specific anomaly makes the choice empirical.

    **The Berenson critique made the standard usable.** Before the 1995 paper, vendors implemented "repeatable read" and "serializable" with different actual behavior and different anomaly sets. The paper's formalization let practitioners specify behavior precisely; modern databases document their actual anomaly set rather than rely on the standard's name.

    The cost is real. Stronger isolation costs more in lock contention, MVCC version maintenance, retry traffic (under SSI, transactions can be aborted at commit time for serialization conflicts), and engineer time to understand the anomaly set. The discipline pays back when correctness bugs are caught at the database layer rather than in production reports of "the balance went negative" or "the assignee got duplicated."

    The deeper purpose of isolation as a discipline is to make the concurrency-correctness contract *explicit, per workload, per transaction*. A team that runs everything at the database default and assumes "the database handles it" is one transaction away from a write-skew incident; a team that knows its workload's anomaly vulnerabilities and chooses isolation level per transaction has internalized the discipline.
  boundary: |
    **Isolation is not concurrency control mechanism.** Isolation is the *contract*; locking and MVCC are *implementations*. The same level (serializable) can be achieved by classic two-phase locking, by SSI (Serializable Snapshot Isolation), or by deterministic concurrency control. The mechanism determines performance characteristics; the level determines anomaly set.

    **Higher isolation is not always 'safer'.** It eliminates more anomalies but introduces new failure modes: more deadlocks (locking), more transaction aborts (SSI), more retry traffic, longer transaction durations. A workload that doesn't need serializable correctness pays an unnecessary cost — sometimes a large one — running there. Safer for *correctness*; less safe for *availability and latency*.

    **The SQL standard's isolation level names are not universal.** Postgres's "serializable" is SSI; MS SQL Server's "serializable" uses range locks; Oracle's "serializable" is snapshot-isolation-like with some extensions; MySQL's "repeatable read" uses gap locking and prevents phantoms (unusual for the level). The standard's anomaly-admission table is one definition; specific databases implement it variously.

    **Snapshot isolation is not in the SQL standard.** It is a fifth practical level that emerged from MVCC databases (Postgres, Oracle). Its anomaly set sits between repeatable read and serializable: eliminates non-repeatable reads and phantoms, admits write skew and the broader "snapshot anomalies" Berenson et al. characterized. Many production databases run at SI by default; teams that don't know this don't know what they're running.

    **The 'no isolation needed for read-only' rule has exceptions.** Even a read-only transaction can produce wrong outputs at weak isolation: a report that reads three tables can see a partial commit if it runs at read committed and a writer is mid-transaction. For *consistent reads*, the read transaction needs at least repeatable read or snapshot isolation. Read-only does not mean isolation-free.

    **Lock-based isolation is not just 'taking a row lock'.** A transaction that does `SELECT FOR UPDATE` on a row takes a lock; a transaction that runs at serializable level may take many locks (row locks, range locks, predicate locks) without the developer explicitly requesting them. Knowing what the database is doing under the hood at each level is part of choosing.

    **Application-level locking (mutexes, distributed locks) is not transaction isolation.** Application-level locks coordinate across transactions and across services; transaction isolation coordinates within a transaction's view of the database. They compose (an application can use both) but are not interchangeable. A distributed lock outside the database doesn't change the database's isolation behavior.

    **A serializable transaction is not 'first transaction wins'.** Serializable means the outcome is equivalent to *some* serial order — which order is implementation-defined. Two concurrent transactions at serializable can both succeed (the database chose an order that allowed both), or one can abort (the database detected an order conflict it couldn't resolve). The retry-and-back-off discipline is part of running at serializable.

    **MVCC does not eliminate write conflicts.** It eliminates *reader-blocking-by-writer* and *writer-blocking-by-reader*. Writer-vs-writer conflicts remain — two transactions writing the same row will still conflict, with the conflict resolved at commit time (via SSI's predicate tracking) or at write time (via `SELECT FOR UPDATE`).
  taxonomy: |
    By SQL standard isolation level (in order of strength):
    - **Read Uncommitted** — admits dirty reads (read uncommitted data from in-flight transactions). Rare in modern databases.
    - **Read Committed** — eliminates dirty reads; admits non-repeatable reads, phantoms, lost updates, write skew. Default in Postgres, Oracle, MS SQL Server.
    - **Repeatable Read** — eliminates dirty reads and non-repeatable reads; standard admits phantoms (some implementations prevent them — Postgres, MySQL via gap locks). Default in MySQL InnoDB.
    - **Serializable** — eliminates all anomalies; outcome equivalent to some serial order. Strongest standard level.

    Beyond the standard:
    - **Snapshot Isolation (SI)** — each transaction sees a consistent snapshot from its start; reads never block; writes detect conflicts; admits write skew and SI anomalies. Standard in many MVCC databases (Oracle, Postgres before 9.1).
    - **Serializable Snapshot Isolation (SSI)** — Postgres's implementation of serializable since 9.1; detects serialization conflicts at commit time and aborts a transaction. Stronger than SI; equivalent to standard serializable.
    - **Linearizability** — distributed-systems notion stronger than serializable; adds real-time ordering. Outside single-node databases' typical scope.

    By anomaly:
    - **Dirty read** — read uncommitted data. Eliminated by read committed and above.
    - **Non-repeatable read** — same row, different values within transaction. Eliminated by repeatable read and above.
    - **Phantom read** — same range query, different result set. Eliminated by serializable (and by some repeatable-read implementations).
    - **Lost update** — read-modify-write race. Eliminated by serializable; mitigated by SELECT FOR UPDATE or optimistic concurrency tokens at lower levels.
    - **Write skew** — two transactions each act on a consistent snapshot but jointly violate an invariant. Eliminated by serializable / SSI; admitted by SI.
    - **Read-only transaction anomaly** — even a read-only transaction can produce inconsistent output at SI. Eliminated by SSI's commit-time conflict detection.

    By implementation mechanism:
    - **Two-phase locking (2PL)** — readers take shared locks; writers take exclusive locks; conflicts block. Classical approach; standard in DB2, older SQL Server.
    - **MVCC (Multi-Version Concurrency Control)** — each transaction sees a snapshot; writes create new versions; reads don't block writers. Standard in Postgres, Oracle, MySQL InnoDB, SQL Server with RCSI.
    - **SSI (Serializable Snapshot Isolation)** — MVCC plus predicate-conflict tracking at commit; aborts transactions whose serialization order can't be reconciled. Postgres since 9.1.
    - **Deterministic concurrency control** — transactions executed in a predetermined order (Calvin, FaunaDB). Specialized.

    By database default:
    - **Read Committed**: Postgres, Oracle, SQL Server.
    - **Repeatable Read**: MySQL InnoDB.
    - **Snapshot Isolation**: many MVCC databases when RCSI/SI mode is enabled.
    - **Serializable**: rarely a default; opt-in for transactions that need it.

    By application pattern:
    - **Read-heavy report**: read committed (with awareness of cross-table consistency needs).
    - **Counter/balance update**: serializable or SELECT FOR UPDATE at lower level.
    - **Invariant-protecting transaction (write skew vulnerable)**: serializable, or SI + explicit locking on the read set.
    - **Schema migration**: repeatable read or serializable for stable view of catalog.
    - **Background analytical query**: read committed or snapshot (long-running queries at higher levels create version-keep-alive pressure).
  analogy: |
    A bank with multiple tellers serving customers at the same row of windows. Without isolation, two tellers helping two different customers might both look at the same account ledger entry, both decide to subtract $100, both write the new balance, and one teller's update overwrites the other. The customer who deposited might find their money gone.

    Read Uncommitted is allowing a teller to read what another teller is *currently writing* — the customer might see a balance that was about to be reverted. Few banks operate this way; few databases default to it.

    Read Committed is requiring that what one teller sees is at least *committed* by another teller. Dirty reads are prevented. But within a single customer interaction, two reads of the same account might see different values if another teller committed an update between them.

    Repeatable Read is requiring that within one customer interaction, the same account reads as the same value throughout — the teller is working from a stable view. Other tellers' updates aren't visible inside this interaction. New rows (insertions matching the teller's range queries) might still appear; that's the phantom read.

    Snapshot Isolation is giving each teller a complete photograph of the ledger as of when their interaction began. Throughout the interaction, the teller sees only this photograph. New tellers see the new state. The trade-off: if two tellers both photographed the same constraint-bound state and each chose actions that violated the constraint, both can commit and the bank is in violation. That's write skew.

    Serializable is the bank's chief auditor watching all transactions and aborting any combination that would violate consistency in some serial order. Throughput is lower; correctness is highest.

    SSI (Postgres's serializable) is the bank using a fast-track lane that lets tellers act on photographs but tracks who looked at what; if at commit time the photographs would have implied violations under any sensible ordering, the offending teller is asked to redo. Throughput is between SI and classical serializable; correctness is full serializable.

    Choosing an isolation level is choosing how strict the bank's audit policy is and where the costs land — in latency (transactions wait for locks), in retry traffic (transactions abort and retry), or in throughput (the audit serializes some transactions).
  misconception: |
    The most common misconception is that **'serializable' means the same thing across databases**. It does not. Postgres's serializable is SSI (Serializable Snapshot Isolation, since 9.1); MS SQL Server's serializable uses range locks; Oracle's serializable is snapshot-like; MySQL InnoDB's serializable is achieved through stricter locking. Reading the specific database's documentation is required, not optional.

    The second misconception is that **the SQL standard's anomaly table is universal**. The 1992 standard defined isolation levels by anomaly admission in imprecise language; the Berenson et al. (1995) critique showed the definitions left ambiguities that vendors filled inconsistently. Many databases prevent more anomalies than the standard requires at a given level (Postgres's serializable, MySQL's repeatable read). The standard is a lower bound, not a specification.

    The third misconception is that **higher isolation is always safer**. It eliminates more anomalies but introduces new failure modes: more deadlocks, more SSI aborts requiring retry logic, longer transaction durations under load, more lock contention. A workload that doesn't need serializable correctness pays a real cost running there.

    The fourth misconception is that **snapshot isolation is full serializability**. It is not. SI eliminates non-repeatable reads and phantoms but admits *write skew* — two transactions each read a consistent state, each act on an invariant the other affects, both commit, and the final state violates the invariant. The classic example: two doctors checking that at least one is on call, both noting the other is on, both setting themselves off, both committing; nobody is on call. SI was vulnerable to this until SSI extensions arrived.

    The fifth misconception is that **read committed is enough for most workloads**. It often is — until it isn't. A workload with concurrent counter increments will lose updates at read committed (multiple transactions read the same value, all add 1, all write back, only one increment is preserved). A workload that reads X and writes Y based on it can produce write skew at SI. The "good enough" framing without knowing the workload's anomaly vulnerabilities is how teams ship correctness bugs.

    The sixth misconception is that **MVCC eliminates write conflicts**. It eliminates reader-blocks-writer and writer-blocks-reader. Writer-vs-writer conflicts remain — two transactions writing the same row still conflict, with the conflict resolved at commit time (SSI) or by `SELECT FOR UPDATE` at the read.

    The seventh misconception is that **isolation level applies to the whole database**. It is typically per-transaction or per-session. A workload can run reports at read committed and counter-updates at serializable simultaneously, picking per transaction. Configuration sets the default; the application can override per transaction.

    The eighth misconception is that **read-only transactions don't need isolation**. They do — for *consistent reads* across multiple tables, a read-only transaction needs at least repeatable read or snapshot isolation. A report that joins three tables at read committed can see a writer's partial commit and produce inconsistent output.

    The ninth misconception is that **isolation level changes are zero-risk operational changes**. They are not. Moving from read committed to serializable adds retry-on-conflict requirements the application must handle; moving from SI to SSI adds commit-time aborts. Application code that doesn't handle the new failure modes will produce errors after the change. The change is a behavior change, not just a config change.

    The tenth misconception is that **'SELECT FOR UPDATE is the same as serializable'**. It is a *tool* for upgrading the locking semantics of specific reads, not a substitute for serializable. A transaction can use SELECT FOR UPDATE at read committed to lock specific rows while leaving other reads at the weak level. The technique is useful for targeted correctness; it is not equivalent to running the whole transaction at serializable.
---

# Transaction Isolation

## Coverage

The I axis of ACID — the property and operational choice that determines what concurrent transactions can observe of each other. Covers the five practical levels (read uncommitted, read committed, repeatable read, snapshot isolation, serializable), the anomalies each admits (dirty reads, non-repeatable reads, phantom reads, lost updates, write skew, read-only-transaction anomalies), the Berenson et al. (1995) critique that exposed the SQL standard's looseness, the two dominant implementation mechanisms (two-phase locking and MVCC), Postgres's Serializable Snapshot Isolation (SSI), and the choice procedure: enumerate the anomalies the workload cannot tolerate, choose the lowest level that prevents them.

## Philosophy

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
