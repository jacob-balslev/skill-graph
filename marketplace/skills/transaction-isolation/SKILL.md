---
name: transaction-isolation
description: "Use when reasoning about the I in ACID: the isolation level a database provides between concurrent transactions; the four SQL-standard levels plus practical snapshot/read-versioning modes; the anomalies each level can admit or prevent; the Berenson/Adya critique of label-based isolation; locking, MVCC, row-versioning, SSI, key-range/gap/predicate locks, RCSI, and distributed-SQL serializable/external-consistency defaults; and how to choose isolation per workload by naming the anomalies, invariants, retry contract, and engine-specific behavior. Do NOT use for the broader ACID frame (outside this active skill corpus), distributed-replica consistency or CAP/PACELC choices (use cap-theorem-tradeoffs and replication-patterns), query performance tuning (use query-optimization), durable index design (use indexing-strategy), or schema design (use entity-relationship-modeling). Do NOT use for explain the four ACID properties (outside this active skill corpus)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"cap-theorem-tradeoffs\",\"entity-relationship-modeling\",\"query-optimization\",\"indexing-strategy\",\"replication-patterns\"],\"suppresses\":[],\"verify_with\":[\"query-optimization\",\"replication-patterns\",\"entity-relationship-modeling\"]}"
  subject: backend-engineering
  public: "true"
  scope: "Reasoning about transaction isolation as the concurrency-correctness contract between transactions: standard isolation labels, practical snapshot and row-versioning modes, anomaly analysis, engine-specific semantics, explicit locks, optimistic tokens, serialization/update-conflict retry behavior, and per-transaction isolation selection. Portable across PostgreSQL, MySQL/InnoDB, SQL Server/Azure SQL, Oracle, CockroachDB, Spanner, and relational/distributed-SQL systems with transactions. Excludes general ACID explanation, replica agreement and partition behavior, stale-read routing, slow-query diagnosis, index-portfolio design, schema design, and cross-service transaction orchestration."
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"isolation level\",\"read committed\",\"repeatable read\",\"serializable\",\"snapshot isolation\",\"SSI\",\"MVCC\",\"RCSI\",\"write skew\",\"serialization failure\"]"
  triggers: "[\"what isolation level do we need\",\"is read committed enough\",\"what's write skew\",\"MVCC vs locking\",\"Postgres serializable vs MySQL serializable\",\"RCSI vs snapshot isolation\",\"retry SQLSTATE 40001\",\"ORA-08177\",\"SQL Server 3960\",\"SELECT FOR UPDATE or serializable\"]"
  examples: "[\"choose an isolation level for concurrent balance-decrement operations\",\"diagnose a data-correctness bug caused by an anomaly the chosen isolation level permits\",\"explain snapshot isolation vs full serializability for this database\",\"decide whether to use SELECT FOR UPDATE, an optimistic version column, a guard row, a unique constraint, or a higher isolation level\",\"add retry handling for PostgreSQL SSI, CockroachDB serializable, Oracle ORA-08177, MySQL lock wait timeout, snapshot-too-old, or SQL Server SNAPSHOT update conflicts\"]"
  anti_examples: "[\"explain the four ACID properties (outside this active skill corpus)\",\"reason about distributed-replica consistency under partition (use cap-theorem-tradeoffs)\",\"debug a stale replica read or read-after-write routing issue (use replication-patterns)\",\"tune a slow query (use query-optimization)\",\"choose index structures for the workload (use indexing-strategy)\",\"model entities and constraints before persistence (use entity-relationship-modeling)\"]"
  grounding: "{\"subject_matter\":\"portable transaction isolation semantics and isolation-level choice\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.postgresql.org/docs/current/transaction-iso.html\",\"https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html\",\"https://www.postgresql.org/docs/17/release-17.html\",\"https://www.postgresql.org/docs/19/release-19.html\",\"https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html\",\"https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html\",\"https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_lock_wait_timeout\",\"https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql\",\"https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide\",\"https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking\",\"https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html\",\"https://docs.oracle.com/en/error-help/db/ora-08177/\",\"https://docs.oracle.com/en/error-help/db/ora-01555/\",\"https://www.cockroachlabs.com/docs/stable/transactions\",\"https://www.cockroachlabs.com/docs/stable/read-committed\",\"https://www.cockroachlabs.com/docs/stable/transaction-retry-error-reference\",\"https://docs.cloud.google.com/spanner/docs/isolation-levels\",\"https://docs.cloud.google.com/spanner/docs/transactions\",\"https://github.com/ept/hermitage\",\"https://github.com/jepsen-io/elle\",\"https://jepsen.io/consistency\",\"https://jepsen.io/consistency/models/snapshot-isolation\",\"https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-95-51.pdf\",\"https://publications.csail.mit.edu/lcs/pubs/pdf/MIT-LCS-TR-786.pdf\"],\"failure_modes\":[\"sql_standard_four_levels_miscounted\",\"engine_label_assumed_portable\",\"statement_snapshot_confused_with_transaction_snapshot\",\"rcsi_confused_with_snapshot_isolation\",\"snapshot_isolation_treated_as_serializable\",\"strict_serializability_routed_as_general_cap_consistency\",\"write_skew_ignored_for_multi_row_invariant\",\"read_skew_or_fractured_read_omitted_from_anomaly_analysis\",\"lost_update_assumed_prevented_without_engine_check\",\"guard_row_does_not_cover_all_writers\",\"retry_only_failed_statement_instead_of_whole_transaction\",\"external_side_effect_inside_unbounded_retry\",\"serialization_error_not_mapped_to_sqlstate_40001_or_vendor_equivalent\",\"lock_wait_timeout_treated_as_serialization_failure_without_checking_transaction_state\",\"snapshot_too_old_treated_as_retryable_conflict_instead_of_version_retention_or_transaction_duration_issue\",\"oracle_serializable_assumed_to_match_postgresql_ssi\",\"mysql_repeatable_read_plain_selects_mixed_with_locking_reads_without_serializable_review\",\"gap_or_next_key_lock_range_impact_missed\",\"postgresql_17_serializable_slru_pressure_ignored\",\"postgresql_19_beta_lock_stats_treated_as_stable_semantics\",\"sql_server_optimized_locking_or_rcsi_enabled_without_semantics_review\",\"distributed_sql_serializable_default_used_without_client_retry_handling\",\"replica_lag_misdiagnosed_as_dirty_read\",\"lock_contention_slowdown_routed_only_to_query_optimization\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "An isolation level is a laboratory access policy for concurrent experiments: Read Committed lets you inspect only signed-off notes one page at a time, Snapshot gives you a private photocopy of the lab at a start time, and Serializable either proves every completed experiment could have run one at a time or rejects one experiment and asks it to run again."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/backend-engineering/transaction-isolation/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
# Transaction Isolation

## Concept of the skill

Transaction isolation is the I axis of ACID: the property and configuration choice that determines what concurrent transactions can observe and which concurrent histories are allowed to commit. It is not just a four-row standard table. The SQL standard names four levels - Read Uncommitted, Read Committed, Repeatable Read, and Serializable - but the practical field includes Snapshot Isolation, Read Committed Snapshot Isolation, MVCC snapshots, key-range/gap locks, predicate locks, SSI, optimistic conflict detection, and distributed timestamp ordering.

Use this skill when the user needs to choose, explain, or debug an isolation contract for a workload. The useful answer names the engine, version, settings, transaction classes, invariants, allowed anomalies, required locks or constraints, and retry behavior. "We use serializable" is not complete until it also says which implementation, what abort or conflict errors look like, and how application code retries the whole transaction safely.

This skill is distinct from broader ACID-primer work outside the active skill corpus, which explains ACID as a whole; `cap-theorem-tradeoffs` and `replication-patterns`, which reason about replicas, freshness, and partitions; `query-optimization`, which diagnoses plan and latency evidence; `indexing-strategy`, which designs retrieval structures; and `entity-relationship-modeling`, which owns durable schema and constraints. It composes with those skills when concurrency correctness depends on constraints, index-backed range locks, replica-read routing, or lock-contention evidence, but it owns the isolation decision itself.

## Coverage

Covers:

- The four SQL-standard isolation labels and the practical snapshot/read-versioning families beside them, including SI, RCSI, and vendor-specific snapshot modes.
- The anomaly catalog: dirty write, dirty read, non-repeatable/fuzzy read, phantom read, read skew/fractured read, lost update, write skew, read-only transaction anomaly, predicate/range anomaly, and serialization anomaly.
- The Berenson et al. critique and Adya graph-based framing that explain why implementation-independent anomaly analysis is stronger than trusting the standard's labels.
- Implementation families: strict two-phase locking, key-range locks, InnoDB gap and next-key locks, MVCC, statement snapshots, transaction snapshots, SSI predicate/SIREAD locks, optimistic write-write conflict detection, SQL Server RCSI/SNAPSHOT row versioning, Oracle transaction-level read consistency, materialized guard rows, and distributed-SQL serializable defaults.
- Engine adapters for PostgreSQL, MySQL/InnoDB, SQL Server/Azure SQL, Oracle, CockroachDB, and Spanner.
- Decision procedure: enumerate transaction invariants and anomaly vulnerabilities, choose the lowest engine-specific protection that prevents them, add targeted locks or database constraints where appropriate, and implement retry/idempotency for conflict-based isolation.

Does not cover replica freshness, CP/AP/PACELC choices, replication topology, query-plan tuning, durable index-portfolio design, schema modeling, or cross-service transaction orchestration.

## Philosophy of the skill

Isolation is the part of ACID most often mis-defaulted because it looks like a dropdown and behaves like a proof obligation. The question is not "what level is safest?" or "what is fastest?" The question is "what histories would violate this workload's invariants, and what does this engine actually do with those histories?"

The discipline is per transaction class. A single-row atomic decrement can often be safe at Read Committed if expressed as one conditional `UPDATE`, while the same business operation can be unsafe if written as read-then-write application logic. A doctor-on-call invariant across rows is vulnerable to write skew under Snapshot Isolation. A cross-table report may only need a transaction snapshot. A uniqueness invariant should be a database constraint when possible, not an isolation-level hope. A work queue may need locking reads such as `FOR UPDATE SKIP LOCKED`, but that is a deliberately different concurrency contract from serializability.

Modern engines do not remove the need for this skill. PostgreSQL SSI, CockroachDB serializable defaults, Spanner external consistency, SQL Server optimized locking with RCSI, and MySQL next-key locking all solve some classes of anomalies better than old textbook levels, but they also move the burden to retries, version-store capacity, lock range shape, database options, and engine-specific behavior.

## Anomaly Catalog

| Anomaly | What it is | Common defenses |
|---|---|---|
| Dirty write | One transaction overwrites uncommitted data from another | Prevented by almost all production engines at all useful levels; if allowed, the system is not a safe transactional store |
| Dirty read | Read data written by a transaction that later aborts | Read Committed or stronger; PostgreSQL maps Read Uncommitted to Read Committed |
| Non-repeatable / fuzzy read | Same row is read twice and has changed between reads | Repeatable Read, Snapshot, Serializable, or explicit row locks |
| Phantom read | Same predicate/range query returns a different set of rows | Serializable, key-range/gap/predicate locks, SSI, or predicate materialization |
| Read skew / fractured read | A transaction observes only part of another transaction's committed effects, or combines values from inconsistent times | Transaction-level snapshot, serializable, or engine-specific consistent-read guarantees |
| Lost update | Two transactions read the same value and write back derived values, losing one update | Single-statement atomic update, row lock, optimistic version column, write-write conflict detection, or serializable |
| Write skew | Two transactions read overlapping data, update disjoint rows, and jointly violate an invariant | Serializable/SSI, predicate/range lock, materialized guard row, exclusion/unique constraint, or redesign of invariant storage |
| Read-only transaction anomaly | A read-only transaction sees a snapshot that is inconsistent with every serial order because of concurrent writers | Serializable/SSI, deferrable safe snapshot where supported |
| Serialization anomaly | The committed result cannot be explained by any serial order | Serializable implementation, or abort/retry when the engine detects the dangerous history |

Read this table from the workload upward. Do not ask "which level sounds reasonable?" Ask which anomaly would create a real correctness bug for this transaction class.

## Engine Semantics Matrix

| Surface | PostgreSQL | MySQL/InnoDB | SQL Server / Azure SQL | Oracle | CockroachDB / Spanner |
|---|---|---|---|---|---|
| Default posture | Read Committed, MVCC per-statement snapshot | Repeatable Read, consistent read snapshot plus locking-read gap/next-key behavior | Read Committed; lock-based unless RCSI is enabled; Azure SQL defaults RCSI on | Read Committed, statement-level read consistency | CockroachDB defaults to Serializable; Spanner defaults read-write transactions to serializable external consistency |
| Read Uncommitted | Accepted syntax but behaves like Read Committed | Allows dirty reads | Allows dirty reads | Not a normal user level; effectively no dirty reads | Usually unsupported or upgraded |
| Read Committed | Each statement sees data committed before that statement starts | Each consistent read sees a fresh committed snapshot; locking behavior differs from RR; gap locks still exist for FK/duplicate checks | Lock-based RC or RCSI statement snapshot depending on database option | Each query sees data committed before that query starts | CockroachDB RC statements see data committed before each statement and reduce client-side retry burden |
| Repeatable Read / Snapshot | PostgreSQL RR is SI-like: no dirty/non-repeatable/phantom reads in PostgreSQL, but serialization anomalies remain possible | Default; plain consistent reads use a transaction snapshot; locking reads and updates can take next-key/gap locks | Repeatable Read is lock-based and allows phantoms; SNAPSHOT is separate transaction-level row-versioning | No standard RR user level; Serializable/Read Only provide transaction-level read consistency | Spanner Repeatable Read is snapshot isolation and can admit write skew; CockroachDB does not use a traditional RR level |
| Serializable | SSI detects dangerous read/write dependencies and aborts with SQLSTATE `40001` | Stricter than RR; plain SELECT becomes a locking shared read when autocommit is disabled | Key-range locking serializable; optimized locking benefits shrink or disappear outside RC/RCSI | Transaction-level snapshot-style consistency; conflicting writes can raise ORA-08177 | CockroachDB serializable may require client retry; Spanner serializable is externally consistent |

Use this matrix as a starting map, not as proof. Always read the version-specific documentation and check the actual database options. The same application code can move from lock-based Read Committed to statement-snapshot Read Committed merely by enabling RCSI; that is a behavior change, not a harmless performance toggle.

### Engine Notes

**PostgreSQL.** Read Uncommitted behaves like Read Committed. Repeatable Read sees a transaction snapshot and prevents phantom reads in PostgreSQL, but serialization anomalies remain possible and updating a row changed after the transaction snapshot can raise SQLSTATE `40001`. Serializable uses SSI with SIREAD/predicate locks that do not block writers but can abort transactions with `40001`; retry the complete transaction. PostgreSQL 17 added configurable SLRU cache sizing including `serializable_buffers`; PostgreSQL 19 is a development/beta line and its `pg_stat_lock` / `max_locks_per_transaction` notes are operational visibility/capacity notes, not semantic isolation changes.

**MySQL/InnoDB.** InnoDB offers the four SQL-standard levels and defaults to Repeatable Read. Plain consistent reads within a Repeatable Read transaction use the snapshot established by the first read. Locking reads, updates, and deletes can use record, gap, or next-key locks; range scans can block inserts into covered gaps. MySQL explicitly warns against mixing locking statements and non-locking SELECTs in one Repeatable Read transaction when the intended behavior is usually Serializable. Lock wait timeout is a contention/locking failure, not the same thing as a serialization anomaly; MySQL rolls back the current statement by default unless configured to roll back the whole transaction.

**SQL Server / Azure SQL.** Read Committed is lock-based unless the database has `READ_COMMITTED_SNAPSHOT` enabled, in which case READ COMMITTED reads use statement-level row versions. SNAPSHOT is separate, opt-in transaction-level row versioning. SNAPSHOT update conflicts, such as Msg 3960, are not RCSI read behavior. Serializable uses range locks. Optimized locking combines TID locking and Lock After Qualification (LAQ) to reduce lock memory and blocking, but it is platform/option dependent: Azure SQL has different defaults, SQL Server 2025 requires enabling it, ADR is required, and LAQ only applies under Read Committed with RCSI and without conflicting hints or unsupported plan shapes.

**Oracle.** Oracle Read Committed is statement-level read consistency: every query sees data committed before that query began. Serializable and Read Only are transaction-level read consistency: the transaction sees changes committed before the transaction began plus its own changes. Oracle Serializable can raise ORA-08177 when a read/write transaction tries to update or delete data changed after the transaction began; retry the intended operation or transaction. Long-running Oracle consistent reads can also hit ORA-01555 snapshot-too-old when needed undo has been overwritten; fix transaction duration or undo retention rather than treating it as a normal serialization conflict.

**CockroachDB and Spanner.** CockroachDB defaults to Serializable and can still require SQLSTATE `40001` client-side retries when automatic retry is impossible; Read Committed exists to reduce retry burden by using statement-level behavior. Spanner supports Serializable and Repeatable Read. Spanner Serializable is externally consistent: transactions behave as if sequential, with real-time ordering guarantees for clients. Spanner Repeatable Read is snapshot isolation, can admit write skew for application constraints not enforced by schema, and may be combined with `SELECT ... FOR UPDATE`/pessimistic concurrency to validate or lock the data actually read.

## Isolation Choice Procedure

1. **Name the engine, version, and settings.** Capture current isolation and relevant database options: PostgreSQL `SHOW transaction_isolation`; SQL Server `READ_COMMITTED_SNAPSHOT`, `ALLOW_SNAPSHOT_ISOLATION`, optimized locking, and ADR; MySQL InnoDB isolation and lock timeout behavior; Oracle transaction mode and undo-retention risk; CockroachDB/Spanner isolation and concurrency mode.

2. **Classify transaction classes.** For each class, record whether it is read-only, single-row read/write, multi-row aggregate, predicate/range read, uniqueness check, work-queue claim, cross-table report, replica-read path, or external-side-effect transaction.

3. **Name invariants and vulnerable anomalies.** Examples: "balance never negative" may be protected by one conditional update; "at least one doctor remains on call" is write-skew vulnerable; "only one active subscription per account" wants a unique/partial unique constraint; "monthly close report must be internally consistent" wants a transaction snapshot or serializable read.

4. **Choose the narrowest correct defense.** Prefer database constraints for database invariants, single atomic SQL statements for row-local state transitions, row locks for known rows, range/predicate locks or serializable for set invariants, optimistic version columns for application-managed lost-update detection, advisory locks for logical critical sections that cannot be represented as data locks, and full serializable when the read set is broad or hard to lock precisely.

5. **Verify engine-specific behavior.** Check whether the chosen label actually prevents the anomaly on this engine. PostgreSQL RR is not MySQL RR is not SQL Server RR. SQL Server RCSI is statement-level, while SNAPSHOT is transaction-level. Oracle Serializable is not PostgreSQL SSI. Spanner Repeatable Read is SI-like and can admit write skew.

6. **Design the conflict path before rollout.** Higher isolation often fails by aborting a transaction rather than by silently committing a bad history. The application must retry the complete transaction, not just the last SQL statement, and must keep external side effects outside the retryable region or behind an outbox/idempotency key.

7. **Measure the operational trade.** Stronger isolation can add blocking, deadlocks, serialization failures, lock wait timeouts, snapshot-too-old errors, version-store pressure, predicate-lock memory, SLRU cache pressure, or wider next-key locks. If the symptom is latency under concurrency, verify with lock/wait evidence and co-load `query-optimization` only for the performance diagnosis.

## Targeted Defenses

| Workload pattern | Risk | Preferred first defenses |
|---|---|---|
| Single-row decrement, inventory claim, account debit | Lost update or negative value if read-then-write | One conditional `UPDATE ... WHERE balance >= amount`, row lock, or optimistic version column; serializable when logic reads more than the target row |
| Work queue claiming jobs | Duplicate claim or blocking workers | Locking read with skip/wait policy, atomic status transition, and explicit fairness/visibility expectations |
| Multi-row "at least one" or sum invariant | Write skew under SI/RR | Serializable/SSI, a materialized guard row locked or updated by all writers, exclusion/unique constraint, or schema redesign |
| "Check then insert" uniqueness | Race to duplicate | Unique/partial unique constraint first; handle unique violation as possible concurrency conflict only when the app selected candidate keys from current state |
| Range booking / calendar overlap | Phantom or overlap write skew | Exclusion/range constraint where available, range locks, next-key locks, or serializable |
| Cross-table report / read-only export | Non-repeatable read, read skew, read-only anomaly | Transaction-level snapshot; PostgreSQL `SERIALIZABLE READ ONLY DEFERRABLE` when safe snapshot matters |
| Logical critical section not represented by one row | Interleaving across rows/tables or app-level resource | Transaction-scoped advisory lock or explicitly materialized resource; prove every writer uses the same lock key |
| External API call inside transaction | Retry repeats side effect | Move side effect after commit, use transactional outbox, or make side effect idempotent before enabling retrying isolation |

Explicit locks are tools, not magic. `SELECT FOR UPDATE`, `FOR SHARE`, SQL Server hints, advisory locks, and guard rows can be correct when they lock the same object or predicate every writer must pass through. They are harmful when they only lock a row that does not represent the invariant, or when they mask a schema constraint that should live in the database.

## Materializing Conflicts

When Snapshot Isolation permits write skew because two transactions read the same predicate but update disjoint rows, one mitigation is to materialize the conflict into a concrete object every competing transaction must touch. A guard row, parent row, summary row, booking bucket, or invariant table can turn "at least one doctor must remain on call" or "total allocated capacity must not exceed limit" from an invisible predicate conflict into a row-level write-write or lock conflict the engine can detect under a weaker isolation mode.

A concrete shape is: store the invariant under a parent or summary row such as `shift(id, on_call_version, on_call_count)`, and require every transaction that changes a doctor's on-call status to lock or update that `shift` row before changing the doctor row. The shared row forces the two transactions to contend on the same resource instead of writing disjoint rows based on stale snapshots.

Use this pattern only when the materialized object faithfully represents the invariant and every writer goes through it. If one code path can update the underlying rows without locking or updating the guard, the pattern is false comfort. Prefer a native unique, exclusion, or check constraint when the database can express the invariant directly; use a guard row when the conflict is real but otherwise too diffuse for row locks to catch.

## Retry and Error Contract

Treat retryable isolation failures as part of the API contract:

- PostgreSQL Repeatable Read and Serializable can raise SQLSTATE `40001`; PostgreSQL documentation says retry the complete transaction, including decision logic. It can also be appropriate, with care, to retry deadlocks (`40P01`) or unique/exclusion violations that are really application-level serialization conflicts.
- PostgreSQL SSI data read from a transaction that later aborts is not valid. A deferrable read-only serializable transaction is the special safe-snapshot case.
- On PostgreSQL 17+, `serializable_buffers` is a tunable SLRU cache size. Under SSI-heavy workloads with SLRU pressure, review it alongside abort rate and retry latency; it is an operational knob, not a substitute for correct isolation or retry design.
- CockroachDB uses SQLSTATE `40001` and `restart transaction` for retry errors when it cannot safely auto-retry. Serializable is default, but client-side retry handling remains required for multi-statement transactions that cannot be auto-retried.
- Oracle Serializable can raise `ORA-08177` when a read/write transaction encounters data changed after the transaction began; retry the intended operation or transaction. Oracle `ORA-01555` snapshot-too-old means the undo needed for a consistent read is no longer available; address transaction duration, undo retention, or rollback segment sizing rather than blindly retrying as if it were write contention.
- SQL Server SNAPSHOT uses transaction-level row versions and can terminate on update conflicts, including Msg 3960. RCSI is statement-level READ COMMITTED row versioning and, with optimized locking, has different writer behavior. Do not treat RCSI and SNAPSHOT as interchangeable.
- MySQL/InnoDB can block through record, gap, or next-key locks. Long range scans under RR or Serializable may lock more than the application expected. `innodb_lock_wait_timeout` produces ERROR 1205 when a row lock wait exceeds the configured timeout; by default only the current statement is rolled back, so decide whether to rollback/retry the whole transaction or handle the blocked operation explicitly.
- Deadlocks are not the same as lock wait timeouts. A deadlock victim is chosen to break a cycle; a timeout is a wait that exceeded policy. Both may be retryable, but their metrics and root-cause fixes differ.

Retry loops need bounded attempts, backoff/jitter under contention, full rollback before retry, and metrics. Never put non-idempotent external effects inside a retryable transaction body unless an outbox or idempotency key makes repeated attempts safe.

### Retry Loop Pattern

Use a language-specific transaction helper if the driver or framework provides one. Otherwise the shape is:

```text
for attempt in 1..max_attempts:
  begin transaction with chosen isolation
  try:
    read the current database state needed for the decision
    re-evaluate business rules from those fresh reads
    perform writes
    commit
    return success
  catch retryable isolation error:
    rollback the whole transaction
    sleep with bounded backoff and jitter
    continue

return retry_exhausted
```

Do not retry just the failed statement after a serialization failure unless the engine explicitly documents statement-level retry for that mode. The retry must re-run the reads and decisions that made the write correct. For lock wait timeouts and snapshot-too-old errors, first classify whether the failure is a transient contention victim, a policy timeout, or version-retention/transaction-duration exhaustion; the right fix may be shorter transactions, different lock order, retention tuning, or a narrower lock footprint, not just more attempts.

## Replica and Staleness Boundary

Replica reads can look like an isolation bug because the application sees "old data," but the mechanism is different. A dirty read is an uncommitted read inside the transaction system; a stale read is a freshness or routing issue across copies. Read-only replicas and hot standbys can expose snapshot semantics at the replica's replay/apply position, and follower reads can deliberately trade freshness for locality. Keep a short note here when the user asks how a replica read interacts with a transaction snapshot, then route the topology, monotonic-read, GTID, failover, and stale-read policy work to `replication-patterns`.

## Upstream Displacement Check

No current major database feature makes transaction-isolation analysis obsolete. The trend is the opposite: engines have become more capable and more engine-specific.

- PostgreSQL continues to expose SSI as the serializable implementation. PostgreSQL 17 added configurable SLRU cache sizing, including `serializable_buffers`, and PostgreSQL 19 beta adds lock-statistics visibility such as `pg_stat_lock`; these are operational notes, not replacements for anomaly analysis or retry design.
- SQL Server 2025/Azure SQL optimized locking plus RCSI can reduce blocking for default Read Committed workloads, but it is a database-option-dependent behavior change and stricter isolation levels still have different lock and conflict behavior.
- CockroachDB and Spanner make serializable-by-default or externally consistent transactions more accessible, but both still require the application to understand aborts, retries, transaction duration, and when weaker snapshot/repeatable-read modes are acceptable.
- Testing tools such as Hermitage and Jepsen Elle make isolation claims more verifiable; they are evidence tools, not replacements for choosing the right contract.

## Verification

After applying this skill, verify:

- [ ] The database engine, version, default isolation level, and row-versioning/optimized-locking options are known from the actual deployment, not assumed from vendor defaults.
- [ ] Each transaction class has a named read set, write set, predicate/range set, and invariant.
- [ ] The anomalies that would violate those invariants are named explicitly.
- [ ] The proposed defense is engine-specific: isolation level, lock, constraint, optimistic token, advisory lock, guard row, or schema handoff.
- [ ] Snapshot/RCSI/SI terminology is precise: statement snapshot vs transaction snapshot vs full serializability are not conflated.
- [ ] Write skew under SI/RR is considered for cross-row, aggregate, and "at least one" invariants.
- [ ] If write skew is defended with a materialized conflict object, every writer is proven to lock or update the same guard row, summary row, parent row, booking bucket, or equivalent invariant object.
- [ ] Lost-update protection is proven by atomic SQL, lock, version token, or engine conflict detection, not assumed from a label.
- [ ] Retry handling covers the complete transaction and maps vendor errors such as SQLSTATE `40001`, ORA-08177, MySQL lock wait timeout, Oracle snapshot-too-old, and SQL Server SNAPSHOT update conflicts.
- [ ] Lock wait timeout, deadlock, serialization failure, snapshot update conflict, and snapshot-too-old are distinguished before prescribing retry behavior.
- [ ] Non-idempotent external side effects are outside retryable transaction bodies or guarded by outbox/idempotency.
- [ ] Stale replica reads are not misdiagnosed as dirty reads; if the issue is replica freshness or read-after-write routing, `replication-patterns` owns the next step.
- [ ] Isolation changes are rolled out as behavior changes with contention, abort-rate, lock-wait, deadlock, snapshot-too-old, and version-store monitoring.
- [ ] On PostgreSQL 17+ SSI-heavy deployments, SLRU cache pressure and `serializable_buffers` sizing have been checked separately from application retry correctness.
- [ ] If correctness depends on documented behavior that has surprised teams before, reproduce it with a small two-session test or an isolation test harness such as Hermitage or Elle.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Explaining the broader ACID frame | broader ACID-primer work outside the active skill corpus | ACID fundamentals owns the four-property transaction vocabulary; this skill owns the I axis in depth |
| Reasoning about replica agreement, partition behavior, CP/AP, or PACELC | `cap-theorem-tradeoffs` | CAP/PACELC is the distributed-systems consistency/availability frame |
| Designing replication topology, read-after-write routing, failover, or stale-replica policy | `replication-patterns` | Replication owns multi-copy data placement and freshness; this skill owns transaction interleavings |
| Diagnosing a slow query plan | `query-optimization` | Query optimization owns plan evidence; this skill only owns lock/conflict correctness when concurrency is the cause |
| Designing the maintained index set | `indexing-strategy` | Indexing owns retrieval structures; this skill may need an index-backed lock range but not the portfolio design |
| Designing schema, constraints, or invariant storage | `entity-relationship-modeling` | Data modeling owns durable structure; this skill can hand off when a constraint or guard row is the correct defense |
| Coordinating effects across services or multiple transactions | saga/outbox/distributed-transaction skills | Cross-service coordination is above the single database transaction boundary |

## Key Sources

- Berenson, H., Bernstein, P., Gray, J., Melton, J., O'Neil, E., & O'Neil, P. (1995). ["A Critique of ANSI SQL Isolation Levels"](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-95-51.pdf). Primary source for the critique of ANSI SQL phenomena and the expanded anomaly table; provenance: used to preserve and extend the skill's anomaly vocabulary and the four-standard-level wording.
- Adya, A. (1999). ["Weak Consistency: A Generalized Theory and Optimistic Implementations for Distributed Transactions"](https://publications.csail.mit.edu/lcs/pubs/pdf/MIT-LCS-TR-786.pdf). Primary source for implementation-independent, graph-based isolation definitions; provenance: used to avoid locking-only reasoning.
- Cahill, M. J., Rohm, U., & Fekete, A. D. (2008). ["Serializable Isolation for Snapshot Databases"](https://dl.acm.org/doi/10.1145/1376616.1376690). SSI paper; provenance: grounds PostgreSQL SSI and the "abort/retry is part of correctness" claim.
- Ports, D. R. K., & Grittner, K. (2012). ["Serializable Snapshot Isolation in PostgreSQL"](https://dl.acm.org/doi/10.14778/2367502.2367523). PostgreSQL SSI implementation report; provenance: grounds predicate-lock and safe-snapshot details.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. Chapter 7. Practitioner source for write-skew examples and materializing conflicts with guard/conflict rows; provenance: grounds the named "Materializing Conflicts" mitigation pattern.
- PostgreSQL Global Development Group. ["Transaction Isolation"](https://www.postgresql.org/docs/current/transaction-iso.html) and ["Serialization Failure Handling"](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html). Vendor truth source for PostgreSQL RU=RC, RR/SI behavior, SSI predicate locks, SQLSTATE 40001, and whole-transaction retry.
- PostgreSQL Global Development Group. ["PostgreSQL 17 Release Notes"](https://www.postgresql.org/docs/17/release-17.html) and ["PostgreSQL 19 Release Notes"](https://www.postgresql.org/docs/19/release-19.html). Vendor truth sources for `serializable_buffers`, `pg_stat_lock`, and current beta/development operational notes; provenance: used only for operational guidance.
- MySQL Reference Manual 8.4. ["InnoDB Transaction Isolation Levels"](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html), ["InnoDB Locking"](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html), and [`innodb_lock_wait_timeout`](https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_lock_wait_timeout). Vendor truth source for InnoDB RR default, consistent reads, gap/next-key locks, RC semi-consistent reads, Serializable SELECT behavior, and lock wait timeout semantics.
- Microsoft Learn. ["SET TRANSACTION ISOLATION LEVEL"](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql), ["Transaction Locking and Row Versioning Guide"](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide), and ["Optimized Locking"](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking). Vendor truth source for SQL Server locking vs row-versioning, RCSI vs SNAPSHOT, optimized locking, update conflicts, and database-option-dependent semantics.
- Oracle Help Center. ["Data Concurrency and Consistency"](https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html), ["ORA-08177"](https://docs.oracle.com/en/error-help/db/ora-08177/), and ["ORA-01555"](https://docs.oracle.com/en/error-help/db/ora-01555/). Vendor truth source for Oracle statement vs transaction read consistency, Serializable/Read Only behavior, retry guidance for ORA-08177, and snapshot-too-old causes/actions.
- Cockroach Labs. ["Transactions"](https://www.cockroachlabs.com/docs/stable/transactions), ["Read Committed Transactions"](https://www.cockroachlabs.com/docs/stable/read-committed), and ["Transaction Retry Error Reference"](https://www.cockroachlabs.com/docs/stable/transaction-retry-error-reference). Vendor truth source for serializable-by-default behavior, RC tradeoffs, SQLSTATE 40001, and retry guidance.
- Google Cloud Spanner. ["Isolation Levels"](https://docs.cloud.google.com/spanner/docs/isolation-levels) and ["Transactions"](https://docs.cloud.google.com/spanner/docs/transactions). Vendor truth source for Spanner serializable external consistency, repeatable-read/snapshot-isolation tradeoffs, write-skew risk, and SELECT FOR UPDATE mitigation.
- Hermitage. ["Testing transaction isolation levels"](https://github.com/ept/hermitage). Tooling/source catalog for concrete multi-database isolation tests; provenance: used to support the recommendation to verify surprising behavior with small histories.
- Jepsen Elle. ["Black-box transactional safety checker"](https://github.com/jepsen-io/elle), Jepsen ["Consistency Models"](https://jepsen.io/consistency), and Jepsen ["Snapshot Isolation"](https://jepsen.io/consistency/models/snapshot-isolation). Tooling and model references for black-box anomaly checking and SI-vs-serializability boundaries.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `backend-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: Reasoning about transaction isolation as the concurrency-correctness contract between transactions: standard isolation labels, practical snapshot and row-versioning modes, anomaly analysis, engine-specific semantics, explicit locks, optimistic tokens, serialization/update-conflict retry behavior, and per-transaction isolation selection. Portable across PostgreSQL, MySQL/InnoDB, SQL Server/Azure SQL, Oracle, CockroachDB, Spanner, and relational/distributed-SQL systems with transactions. Excludes general ACID explanation, replica agreement and partition behavior, stale-read routing, slow-query diagnosis, index-portfolio design, schema design, and cross-service transaction orchestration.

**When to use**
- choose an isolation level for concurrent balance-decrement operations
- diagnose a data-correctness bug caused by an anomaly the chosen isolation level permits
- explain snapshot isolation vs full serializability for this database
- decide whether to use SELECT FOR UPDATE, an optimistic version column, a guard row, a unique constraint, or a higher isolation level
- add retry handling for PostgreSQL SSI, CockroachDB serializable, Oracle ORA-08177, MySQL lock wait timeout, snapshot-too-old, or SQL Server SNAPSHOT update conflicts
- Triggers: `what isolation level do we need`, `is read committed enough`, `what's write skew`, `MVCC vs locking`, `Postgres serializable vs MySQL serializable`, `RCSI vs snapshot isolation`, `retry SQLSTATE 40001`, `ORA-08177`, `SQL Server 3960`, `SELECT FOR UPDATE or serializable`

**Not for**
- explain the four ACID properties (outside this active skill corpus)
- reason about distributed-replica consistency under partition (use cap-theorem-tradeoffs)
- debug a stale replica read or read-after-write routing issue (use replication-patterns)
- tune a slow query (use query-optimization)
- choose index structures for the workload (use indexing-strategy)
- model entities and constraints before persistence (use entity-relationship-modeling)

**Related skills**
- Verify with: `query-optimization`, `replication-patterns`, `entity-relationship-modeling`
- Related: `cap-theorem-tradeoffs`, `entity-relationship-modeling`, `query-optimization`, `indexing-strategy`, `replication-patterns`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: An isolation level is a laboratory access policy for concurrent experiments: Read Committed lets you inspect only signed-off notes one page at a time, Snapshot gives you a private photocopy of the lab at a start time, and Serializable either proves every completed experiment could have run one at a time or rejects one experiment and asks it to run again.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.postgresql.org/docs/current/transaction-iso.html`, `https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html`, `https://www.postgresql.org/docs/17/release-17.html`, `https://www.postgresql.org/docs/19/release-19.html`, `https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html`, `https://dev.mysql.com/doc/refman/8.4/en/innodb-locking.html`, `https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html#sysvar_innodb_lock_wait_timeout`, `https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql`, `https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide`, `https://learn.microsoft.com/en-us/sql/relational-databases/performance/optimized-locking`, `https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html`, `https://docs.oracle.com/en/error-help/db/ora-08177/`, `https://docs.oracle.com/en/error-help/db/ora-01555/`, `https://www.cockroachlabs.com/docs/stable/transactions`, `https://www.cockroachlabs.com/docs/stable/read-committed`, `https://www.cockroachlabs.com/docs/stable/transaction-retry-error-reference`, `https://docs.cloud.google.com/spanner/docs/isolation-levels`, `https://docs.cloud.google.com/spanner/docs/transactions`, `https://github.com/ept/hermitage`, `https://github.com/jepsen-io/elle`, `https://jepsen.io/consistency`, `https://jepsen.io/consistency/models/snapshot-isolation`, `https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/tr-95-51.pdf`, `https://publications.csail.mit.edu/lcs/pubs/pdf/MIT-LCS-TR-786.pdf`

**Keywords**
- `isolation level`, `read committed`, `repeatable read`, `serializable`, `snapshot isolation`, `SSI`, `MVCC`, `RCSI`, `write skew`, `serialization failure`

<!-- skill-graph-context:end -->
