---
name: schema-evolution
description: "Use when reasoning about how a database schema changes over time without breaking deployed application code — the multi-release path from current to target schema: the expand/contract pattern (parallel change), zero-downtime change rules, the backwards/forwards compatibility envelope (deploy ordering + rollback), the catalog of schema changes (add/drop/rename column, type change, add constraint/index) and the safe procedure for each, dual-write/dual-read transitions with a named source-of-truth, the lock-acquisition hazard (bounded lock_timeout + retry), cross-engine online-change mechanisms (Postgres CONCURRENTLY/NOT VALID, MySQL Online DDL, gh-ost/pt-osc, Vitess/PlanetScale), view-based multi-version tooling (pgroll, Reshape), and migration-lint enforcement (Strong Migrations, Squawk, Atlas). Do NOT use for executing one migration (use database-migration), schema design from scratch (use data-modeling), query tuning (use query-optimization), or partitioning (use sharding-strategy)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"acid-fundamentals\",\"data-modeling\",\"database-migration\",\"indexing-strategy\",\"query-optimization\"],\"suppresses\":[\"database-migration\",\"indexing-strategy\"],\"verify_with\":[\"data-modeling\",\"database-migration\"]}"
  subject: data-engineering
  scope: "Evolving a database schema over time without breaking deployed application code — the expand/contract pattern, zero-downtime change rules, the backwards/forwards compatibility envelope (deploy ordering and rollback discipline), the per-change-type safe procedure (add/drop/rename column, type change, constraints, indexes), dual-write/dual-read transitions with named source-of-truth and production consistency-check rules, the bounded lock-acquisition discipline that makes even a metadata-only change safe under live traffic (Postgres lock_timeout + retry, or the engine equivalent), the cross-engine online-change mechanisms (Postgres CONCURRENTLY/NOT VALID, MySQL INSTANT/INPLACE/COPY Online DDL, gh-ost/pt-osc ghost-table cutover, Vitess/PlanetScale revert windows), the view-based multi-version tools (pgroll, Reshape) and the migration-lint enforcement layer (Strong Migrations, Squawk, Atlas) that encode the discipline. Portable across relational databases and deploy pipelines; principle-grounded, not repo-bound. Excludes mechanical execution of one migration (database-migration), schema design from scratch (data-modeling), query tuning (query-optimization), and distributed-data partitioning (sharding-strategy)."
  public: "true"
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"schema evolution\",\"expand contract\",\"parallel change\",\"zero-downtime migration\",\"backwards compatibility\",\"dual write\",\"lock timeout\",\"online schema change\",\"schema versioning\",\"rolling deploy\"]"
  triggers: "[\"how do we rename this column without downtime\",\"expand contract\",\"is this migration safe\",\"schema versioning\",\"backwards compatibility for database\"]"
  examples: "[\"design the expand-contract sequence to rename a column from `name` to `full_name` across a deployed system\",\"decide whether to add a NOT NULL column with a default or with a separate backfill phase\",\"diagnose a deploy that broke because the schema change shipped before the code change\",\"explain why drop-column is the third phase of expand-contract, not the first\",\"why did a one-line ALTER TABLE freeze the whole app even though it didn't rewrite the table\",\"plan a MySQL online schema change where INSTANT DDL exists but app versions still overlap\"]"
  grounding: "{\"subject_matter\":\"Portable database schema evolution, expand/contract sequencing, zero-downtime compatibility envelopes, online migrations across engines (Postgres, MySQL/InnoDB Online DDL, gh-ost/pt-osc, Vitess/PlanetScale), the lock-acquisition queue and bounded lock-acquisition discipline, view-based multi-version migration tooling, migration-lint enforcement, dual-write/dual-read transition patterns, and production-safe constraint/index/backfill changes\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://martinfowler.com/articles/evodb.html\",\"https://martinfowler.com/bliki/ParallelChange.html\",\"https://www.postgresql.org/docs/current/sql-altertable.html\",\"https://www.postgresql.org/docs/current/sql-createindex.html\",\"https://www.postgresql.org/docs/current/explicit-locking.html\",\"https://stripe.com/blog/online-migrations\",\"https://postgres.ai/blog/20210923-zero-downtime-postgres-schema-migrations-lock-timeout-and-retries\",\"https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-operations.html\",\"https://github.com/github/gh-ost\",\"https://docs.percona.com/percona-toolkit/pt-online-schema-change.html\",\"https://planetscale.com/docs/vitess/schema-changes/deploy-requests\",\"https://planetscale.com/docs/vitess/schema-changes/safe-migrations\",\"https://github.com/xataio/pgroll\",\"https://github.com/fabianlindfors/reshape\",\"https://github.com/ankane/strong_migrations\",\"https://squawkhq.com/\",\"https://atlasgo.io/versioned/lint\"],\"failure_modes\":[\"treating_nontrivial_schema_change_as_one_alter_table\",\"confusing_database_online_ddl_with_application_compatibility\",\"dropping_old_shape_before_all_code_and_data_migrate\",\"deploying_code_and_schema_outside_a_backward_forward_compatibility_envelope\",\"tightening_constraints_without_not_valid_validate_or_engine_equivalent_pattern\",\"adding_unique_constraint_by_validating_inline_instead_of_via_concurrent_unique_index\",\"creating_or_dropping_production_indexes_without_concurrent_or_online_mechanism\",\"running_backfill_as_one_unbounded_nonresumable_update\",\"acquiring_a_lock_without_a_bounded_acquisition_budget_so_a_metadata_only_change_blocks_the_lock_queue\",\"assuming_one_engines_online_change_mechanism_is_universal\",\"treating_dual_write_as_vague_duplication_without_a_named_source_of_truth_and_consistency_check\",\"contracting_without_runtime_evidence_that_old_shape_is_unused\",\"assuming_contract_is_always_reversible_or_assuming_it_is_never_recoverable\",\"assuming_a_migration_tool_lint_or_ghost_table_cutover_replaces_cross_release_planning\"],\"evidence_priority\":\"equal\"}"
  anti_examples: "[\"execute one ALTER TABLE migration mechanically (use database-migration)\",\"design a schema from scratch (use data-modeling)\",\"diagnose a slow query (use query-optimization)\",\"choose shard keys or repartition data across nodes (use sharding-strategy)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Schema evolution is to a database what stage carpentry is to a Broadway musical — the show does not stop; you do not bolt a new staircase to the stage during the second act; you build the new staircase upstage while the old staircase serves the cast (expand), gradually rehearse the cast to use the new one while the old still works (migrate), and only after every performer has memorized the new route do you remove the old staircase (contract). Removing the old before everyone has migrated is the production-incident equivalent of a missed cue; swinging a heavy set piece across the stage mid-scene without warning the cast — even briefly — is the lock-queue freeze."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/data-engineering/schema-evolution/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1581"
---
# Schema Evolution

## Concept of the skill

Schema evolution is the discipline of changing a database schema over time while deployed application code keeps serving traffic. The unit of work is not one SQL statement; it is a compatibility-preserving *path* from the current schema to the target schema across one or more deploys. The central technique is *expand/contract* (Ambler & Sadalage 2006; also called Fowler's *parallel change*): three phases. Phase 1 EXPAND — add the new column/table/index/view/ghost table; old shape unchanged; old code continues working; new code can use the new shape if deployed; rollback = drop the new shape. Phase 2 MIGRATE (multi-deploy) — deploy code that dual-writes; backfill existing data (batched, resumable); deploy code that dual-reads with fallback to old; verify production traffic on new with a consistency check; deploy code that single-reads new; rollback = revert code, old shape still present. Phase 3 CONTRACT (normally one-way) — drop old column/table/index; no code references old shape; old-shape application rollback is gone *unless* explicitly preserved by a retained table, a snapshot/restore, or a managed revert window (Vitess/PlanetScale keep the old table for a bounded window; Postgres DROP COLUMN is logically invisible but not immediately physically reclaimed).

Replaces "schedule a maintenance window for the migration" with continuous evolution while serving traffic. Solves the problem that *schema and deployed code are co-evolving systems* — schema-first can break old code, code-first can assume a shape that has not landed, and rollback can reintroduce old code after a new schema already exists — and that desynchronization is the primary danger. Expand/contract is the protocol that keeps both sides compatible during transition: additively introduce the new shape, migrate behavior and data with observation, then contract the old; at every intermediate point, both old and new code can run against both old and new schema. That intermediate state requires the two named guarantees at once (DDIA ch.4): *backward compatibility* (new code reads old-written data) and *forward compatibility* (old code reads/ignores new-written data). Sub-purposes: (1) sequence migrations and deploys safely — the ordering across migrations and deploys, the compatibility envelope each intermediate state must satisfy; (2) preserve rollback through expand and migrate, accepting irreversibility only at contract; (3) avoid the common-incident pattern of premature contract — dropping the old shape before all code and data have migrated; (4) make constraint-tightening safe via the right *per-constraint* mechanism (NOT VALID + VALIDATE for FK/CHECK/NOT NULL; a concurrent unique index for UNIQUE); (5) keep the lock-acquisition step itself from taking down the app via a bounded acquisition budget (Postgres `lock_timeout` + retry against the FIFO lock queue; the engine-equivalent online-change control elsewhere); and (6) give the dual-write/dual-read transition a named source of truth plus a measured production consistency check so it is not vague duplication.

Distinct from database-migration, which owns the *mechanics* of applying one concrete migration — the ALTER TABLE statement itself, its lock profile and transaction wrapping, CONCURRENTLY indexes, the NOT VALID + VALIDATE constraint pattern, batched backfill implementation, the bounded lock-acquisition wrapper (`lock_timeout` + retry, or engine equivalent) on a single DDL statement, unpooled migration connections, and an engine's ghost-table cutover (gh-ost / pt-osc). This skill owns the *sequencing* across migrations and application deploys, the multi-step expand/migrate/contract discipline, and the boundary gates between phases. Distinct from data-modeling, which owns the design of a schema at a point in time — this skill owns how that schema changes between points in time; the two compose (data-modeling decides the target shape; this skill decides the safe path from current to target). Distinct from indexing-strategy, which owns which indexes the database has — adding/dropping an index is one type of schema change governed by this skill's discipline (CREATE INDEX CONCURRENTLY is part of the expand vocabulary). Distinct from acid-fundamentals (runtime guarantee semantics), transaction-isolation (concurrency level), query-optimization (single-query tuning), and sharding-strategy (cross-node partitioning) — all of which can constrain a plan but answer different questions. Tools such as pgroll and Reshape *automate* this skill's discipline (view-based multi-version expand/contract); they do not replace the need to understand it — they are the mechanism database-migration executes, sequenced by the discipline this skill teaches. Schema evolution is to a database what stage carpentry is to a Broadway musical — the show does not stop; you do not bolt a new staircase to the stage during the second act; you build the new staircase upstage while the old staircase serves the cast (expand), gradually rehearse the cast to use the new one while the old still works (migrate), and only after every performer has memorized the new route do you remove the old staircase (contract). Removing the old before everyone has migrated is the production-incident equivalent of a missed cue; swinging a heavy set piece across the stage mid-scene without warning the cast — even briefly — is the lock-queue freeze. The wrong mental model is that a schema change is a single migration — write the ALTER TABLE, deploy it, done. It is not, except for the small class of single-step app-safe additive changes (add nullable column, add table, add index with the engine's online build, change DEFAULT). Drop column, rename, type change, add NOT NULL without default, add FK, add UNIQUE constraint — each requires expand/migrate/contract spanning multiple deploys over days or weeks. Adjacent misconceptions: (a) that "online DDL" or "the migration linter passed" means the change is safe — online DDL reduces *database blocking* and a linter inspects a *migration file*; neither proves that old and new application versions can both run, that background workers have switched, that reads no longer depend on old columns, or that rollback is still possible. (b) That "single-step safe" means no production lock risk — even a metadata-only ALTER acquires an `ACCESS EXCLUSIVE` lock, and because lock acquisition is a FIFO queue, a DDL that waits behind one long-running transaction blocks every read and write queued behind *it*; the fix is a bounded lock-acquisition budget (Postgres `lock_timeout`, often sub-2-second, sometimes 50ms, so the DDL aborts instead of blocking the queue, plus an automatic retry-with-backoff because Postgres never auto-retries a timed-out statement). (c) That the Postgres recipe is universal — MySQL/InnoDB uses `ALGORITHM=INSTANT/INPLACE/COPY` with `LOCK` clauses and has its own INSTANT limitations; gh-ost and pt-online-schema-change copy into a ghost table and cut over with an atomic rename; the portable invariant is "use the engine's online-change mechanism with a bounded lock window," not "run lock_timeout." (d) That a database-specific *physical* improvement turns a destructive change into a one-step app-compatible change — MySQL INSTANT drop, Postgres fast metadata drop-column, view-based multi-version tooling, or ghost-table cutover may reduce *physical* DDL cost while still requiring contract evidence before the old application-visible shape disappears. (e) That all constraint-tightening uses one mechanism — FK/CHECK/NOT NULL use NOT VALID then VALIDATE to avoid the validation scan-lock, but a UNIQUE constraint is NOT created NOT VALID: prove duplicate absence, `CREATE UNIQUE INDEX CONCURRENTLY` (handling the invalid-index-on-failure recovery), then `ADD CONSTRAINT ... USING INDEX` where supported. (f) That contract-readiness is obvious — "we'll know when we're ready" is not a gate; contract requires runtime evidence that *every* code path (web tier, background workers, queue/stream consumers, cron jobs, batch ETL, analytics/reporting queries, replicas, materialized views, downstream services, ad-hoc operator scripts) has stopped referencing the old shape, plus a data-verified backfill and an explicit decision that rollback through the old shape is no longer required. (g) That rollback is always available — expand and migrate preserve rollback; contract is the irreversible boundary *unless* you deliberately keep a revert path (retained old table, snapshot/restore, or a managed revert window like Vitess/PlanetScale deploy requests); "I dropped it, it's instantly unrecoverable" and "rollback is always free" are both wrong — the truth is "old-shape application rollback is gone unless explicitly preserved." (h) That dual-write means "write to both and hope" — pick a source of truth, dual-write to both, backfill, dual-read comparing new against the source of truth with a production mismatch metric and alert, flip the source of truth only when the mismatch rate is acceptably low, rolled out incrementally (Stripe's online-migration discipline). (i) That backfill can run in one statement — a single UPDATE on a large hot table locks it, fills WAL, and times out; batched-and-resumable is the production discipline. (j) That a zero-downtime migration tool removes the need to understand this — pgroll/Reshape automate expand/contract via database views, but you still operate, debug, and trust them by knowing the sequence they run. (k) That deploy ordering is "obvious" — migration-first vs code-first is a per-change decision; expand/contract makes the ordering explicit and survivable at every intermediate point, and getting it wrong is how deploys break.

## Coverage

The discipline of changing a database schema over time without breaking deployed application code. Covers the expand/contract (parallel change) pattern as the foundational technique; the backwards-and-forwards compatibility envelope each intermediate state must satisfy; the catalog of schema-change types and their safety profiles (additive, constraint-tightening, destructive, renaming, type-change); the distinction between *physical* online change and *application* compatibility; the lock-acquisition hazard that makes a bounded lock-acquisition budget (`lock_timeout` + retry in Postgres, the engine equivalent elsewhere) mandatory even for metadata-only changes; the cross-engine online-change mechanisms (Postgres CONCURRENTLY / NOT VALID, MySQL/InnoDB INSTANT/INPLACE/COPY Online DDL, gh-ost / pt-osc ghost-table cutover, Vitess/PlanetScale deploy requests and revert windows); the backfill strategies (no-backfill, batched, background, lazy/read-repair, dual-write-only); the dual-write / dual-read transition patterns with named source-of-truth and production consistency-check rules; the deploy-ordering rules (migration-first vs code-first vs coordinated multi-step); the boundary gates between phases (enter migrate, switch reads, enter contract); the view-based multi-version tools (pgroll, Reshape) and the migration-lint enforcement layer (Strong Migrations, Squawk, Atlas) that encode the discipline; and the relationship to the underlying database-migration tooling that executes individual steps.

## Philosophy of the skill
Schema and deployed code are co-evolving systems. The danger is desynchronization — schema changes break running code; code changes assume a schema that hasn't been deployed; rollback can put old code back into contact with a new schema. Expand/contract is the protocol that keeps every intermediate state survivable: additively introduce the new shape, migrate, then contract the old.

The compatibility envelope has two named directions, and the middle state of every expand/contract requires **both at once** (Kleppmann, *Designing Data-Intensive Applications*, ch. 4):

- **Backward compatibility** — newer code can read data that older code wrote.
- **Forward compatibility** — older code can read (or safely ignore) data that newer code wrote.

Additive-first works precisely because it satisfies both: old code ignores the new column (forward compat), and new code falls back to the old column until backfill completes (backward compat). Drop-first breaks forward compatibility instantly — old code that still references the dropped column errors the moment the migration lands.

The discipline is not in the individual `ALTER TABLE` statement (that's database-migration's concern). It is in the *sequencing* across migrations and deploys, the compatibility envelope at every intermediate point, and the rollback discipline that keeps the system recoverable when a step fails. A plan is safe only if it names which code versions may run against which schema versions at each point, and what rollback means before and after each irreversible step.

The most important distinction to hold onto: **physical online change is not application compatibility.** A database may add, drop, rename, or swap structures without long write locks, but that does not prove the application can tolerate the change. Database online DDL and migration linters are enforcement aids; expand/contract is the design discipline. The most consequential moments are the boundaries — entering migrate (the dual-write/dual-read transition), switching reads to the new shape, and entering contract (the irreversible drop). Knowing the explicit criteria for crossing each boundary is the operational hygiene that separates evolved systems from broken ones.

## Compatibility Envelope

Plan each schema evolution as a sequence of compatible states. The envelope is valid only if old and new application versions can overlap during rolling deploy, canary, retry, worker drain, and rollback.

| State | Schema | Application behavior | Rollback posture |
|---|---|---|---|
| **S0 current** | Old shape only | Old code reads/writes old shape | Normal app rollback |
| **S1 expanded** | Old + new shape coexist | Old code still works; new code may write/read new shape behind a gate | Drop or ignore new shape if needed |
| **S2 migrating** | Old + new coexist; backfill/validation running | Code dual-writes (or writes new while preserving old fallback); reads can fall back from new to old until verified | Revert code — old shape still exists |
| **S3 cut over** | Old + new coexist; new data verified | Code reads new shape only; old writes redundant or stopped | Revert only if old data/path preserved |
| **S4 contracted** | New shape only | No deployed code references old shape | Old-shape rollback is gone, or requires restore/rebuild |

Backward compatibility means new code can read or reconstruct the old shape until data and DDL have caught up. Forward compatibility means old code can ignore or survive the expanded/new shape when a migration lands before all code is replaced, or when rollback reintroduces old code. When either direction is false, the plan needs another expand/migrate step — not a more carefully timed deploy.

## The Expand / Migrate / Contract Phases

```
   ┌────────────────────────────────────────┐
   │ Phase 1: EXPAND                         │
   │ • Add new column / table / index / view │
   │   / ghost table — old shape unchanged   │
   │ • Old code continues working unchanged  │
   │ • New code can use new shape if deployed│
   │ • Rollback: drop / stop using new shape │
   └────────────────────────────────────────┘
                    │
                    ▼
   ┌────────────────────────────────────────┐
   │ Phase 2: MIGRATE (multi-deploy)         │
   │ • Deploy code that dual-writes          │
   │ • Backfill existing data (batched)      │
   │ • Deploy code that dual-reads (new w/    │
   │   fallback to old) + consistency check  │
   │ • Verify production traffic on new       │
   │ • Deploy code that single-reads new      │
   │ • Rollback: revert code; old shape OK   │
   └────────────────────────────────────────┘
                    │
                    ▼
   ┌────────────────────────────────────────┐
   │ Phase 3: CONTRACT (normally one-way)    │
   │ • Drop old column / table / index / view│
   │ • No code references old shape          │
   │ • Rollback: old-shape app rollback gone │
   │   unless preserved (retained table /    │
   │   snapshot / managed revert window)     │
   └────────────────────────────────────────┘
```

The time between expand-complete and contract-start is normally days or weeks, not minutes. The wait is not ceremony; it is how rolling deploys, scheduled jobs, long-running workers, caches, read replicas, analytics jobs, and rollback paths finish moving.

## Change-Type Safety Matrix

The matrix is a starting point, not a waiver. Always verify the target engine version, table size, lock profile, replication behavior, migration-runner transaction behavior, and application-version overlap.

| Change | Single-step app-safe? | Safe pattern |
|---|---|---|
| Add nullable column | Usually yes | Direct additive DDL; verify lock profile for engine/table size |
| Add column with constant default | Often yes in modern engines | Postgres 11+ stores constant defaults metadata-only; MySQL 8.x may use INSTANT for supported add-column ops; verify target engine/version and operation-specific fallback |
| Add column with NOT NULL no default | No | Expand: add nullable; update code to write it; batched/resumable backfill; validate no gaps; then enforce NOT NULL (see NOT NULL row) |
| Enforce NOT NULL on existing column | No (validation scan) | Postgres with native not-null `NOT VALID` support: add the not-null constraint `NOT VALID`, then `VALIDATE CONSTRAINT` separately; Postgres 12–17 (no direct NOT VALID for NOT NULL): add an equivalent `CHECK (col IS NOT NULL)` NOT VALID, VALIDATE it, then `SET NOT NULL` (the validated CHECK lets `SET NOT NULL` skip the full-table rescan); MySQL: verify online DDL support and table-rebuild risk |
| Add new table | Usually yes | Direct CREATE TABLE; if app starts writing it, still plan deploy ordering and rollback |
| Add index | Yes only with online build (+ caveats) | Postgres `CREATE INDEX CONCURRENTLY` outside a transaction block — does extra work, waits on transactions, can leave an INVALID index on failure (drop + retry), partitioned tables need per-child builds; MySQL/Vitess use online DDL or the deploy-request mechanism. Plan recovery + monitoring, not just "single-step safe" |
| Add UNIQUE constraint | No (needs verified uniqueness; **NOT** a NOT VALID change) | Verify duplicates absent; `CREATE UNIQUE INDEX CONCURRENTLY` (handle invalid-index recovery if the build aborts); `ADD CONSTRAINT ... USING INDEX` where supported — UNIQUE does not support NOT VALID; the concurrent unique index IS the online path |
| Add foreign key | No (validation locks) | Postgres: `ADD FK NOT VALID` then `VALIDATE CONSTRAINT` separately; MySQL/Vitess: preflight orphan rows — validation semantics and tool FK handling differ |
| Add CHECK constraint | No (validation locks) | Add `NOT VALID`, then `VALIDATE CONSTRAINT` separately |
| Drop index | Usually if unused | Prove no query relies on it; `DROP INDEX CONCURRENTLY` / online where supported; monitor after removal |
| Drop column | No (deployed code references it) | Full expand/contract; physical drop may be fast, but application compatibility is destructive |
| Drop table | No (deployed code references it) | Full expand/contract plus retention/restore decision; references and jobs must be gone |
| Rename column | No | Full expand/contract: add new; dual-write; backfill; switch reads; stop old writes; drop old |
| Rename table | No | Prefer a compatibility view/alias or new-table path; migrate callers; contract old name only after evidence |
| Change column type | Usually no | Add shadow column with target type; convert/backfill in batches; switch reads/writes; contract old column |
| Change DEFAULT | Usually yes | Direct ALTER (affects only future inserts); existing rows need separate backfill if semantics require it |
| Add generated / identity / auto-increment behavior | Usually no on large live tables | Engine-specific high-risk DDL; prefer an additive nullable/generated target column plus backfill/validation |
| Reorder columns | Engine-specific, usually not worth doing | Postgres has no `ALTER TABLE` reorder subform — use a logical projection/view or rebuild if physical order truly matters; MySQL `FIRST`/`AFTER` reorganizes data and rebuilds — avoid on hot tables without a strong operational reason |

> **Three orthogonal axes hide in this matrix — do not collapse them.** (1) The **"single-step app-safe?" column is the application-compatibility axis**: it answers "can this change be applied without breaking a currently-deployed code version?" — NOT "does it rewrite the table?" and NOT "does it avoid a lock?". An additive nullable column is app-safe because no deployed code breaks; a drop-column is not, because deployed code still references it. (2) **Physical rewrite is a separate axis**: some app-safe changes still rewrite or scan the table, and conversely an engine can make a change *physically* instant (e.g. MySQL `ALGORITHM=INSTANT` drop/rename) while it remains *application-destructive* — so "instant" at the storage layer never licenses skipping expand/contract. (3) **Lock acquisition is a third axis**: every entry above, even a metadata-only one, must still *acquire* its lock, and acquiring it is its own coordination problem (see *The Lock Queue*) regardless of rewrite cost. On mechanism: constraint-tightening is not one recipe — FK / CHECK / NOT NULL use **NOT VALID + VALIDATE**, but a **UNIQUE constraint is built via a concurrent unique index**, not NOT VALID. The matrix keeps these distinctions on purpose.

Two common constraint corrections worth restating:

- Postgres `NOT VALID` applies to foreign-key, CHECK, and (on supporting versions) not-null constraints; it is **not** the online path for UNIQUE.
- For Postgres UNIQUE, first prove duplicate absence, then `CREATE UNIQUE INDEX CONCURRENTLY`, handle the invalid-index failure if the build aborts, and attach it with `ALTER TABLE ... ADD CONSTRAINT ... USING INDEX` where supported.

## The Lock Queue — Why a "Safe" DDL Can Still Freeze the App

**Portable invariant:** every schema change must acquire its lock under a *bounded acquisition budget* — fail fast and retry rather than block the queue indefinitely. Each engine expresses this differently; below is the Postgres instance, then the cross-engine equivalents.

A change marked single-step app-safe avoids rewriting the table, but it still acquires an `ACCESS EXCLUSIVE` lock for a metadata edit that should take a millisecond. The hazard is not the edit — it is *acquiring* the lock:

- **Lock acquisition is a FIFO queue.** A plain `SELECT` takes `ACCESS SHARE`; `ACCESS EXCLUSIVE` conflicts with it, and many `ALTER TABLE` subforms request `ACCESS EXCLUSIVE` unless a subform documents a weaker lock. A DDL waiting for `ACCESS EXCLUSIVE` does not jump ahead; it waits behind whatever currently holds a conflicting lock. While it waits, **every later query that needs a conflicting lock — including ordinary `SELECT`s — queues up behind the DDL.** The outage is caused by the waiting lock request, not by the eventual metadata change.
- **The trigger is a single long transaction.** A slow analytics query, a forgotten `idle in transaction` connection, or a long-running report holds its lock; the "instant" ALTER stalls behind it; the whole application stalls behind the ALTER. The migration never rewrote anything — it just sat in the queue and took the queue down with it.

Controls (these belong to the *single-statement* mechanics that `database-migration` owns, but always applying them is part of evolving a live schema):

1. **Put a low `lock_timeout` (or the engine's lock-acquisition timeout) on every production DDL** — commonly under 2 seconds, sometimes as aggressive as 50 ms — including "metadata-only" changes. If the DDL cannot get its lock quickly, it *aborts* instead of blocking the queue. Aborting a deploy is recoverable; freezing production is an incident.
2. **Retry timed-out DDL from the migration runner with backoff and jitter.** Postgres aborts the timed-out statement and does **not** auto-retry — retrying is the runner's job. Once the blocking transaction finishes, the retried DDL usually succeeds in a millisecond or two.
3. **Don't hide several unrelated DDL statements inside one broad transaction.** Split DDL by lock profile so a timed-out statement is independently retryable and does not hold locks open for the others; or explicitly acquire all required locks at the start with the same low timeout so failure happens before work has been done.
4. **Keep long transactions out of the migration window.** The classic culprit is `idle in transaction`; also long analytical reads, long replica snapshots, and worker transactions. Detect them before deploying and postpone or terminate per the team's production policy.

This is why tools like Strong Migrations, pgroll, and gh-ost wrap DDL in a bounded lock window by default — the lock queue, not the rewrite, is the most common surprise outage in an otherwise "safe" change.

## Cross-Engine Reality — The Invariant Is Portable, the Mechanism Is Not

The expand/contract discipline is engine-agnostic, but the *online-change mechanism* that executes each step is engine-specific. Do not assume the Postgres recipe transfers verbatim.

| Engine / tool | Online-change mechanism | Bounded-lock control | Sharp edges to know |
|---|---|---|---|
| **PostgreSQL native** | `CREATE INDEX CONCURRENTLY`, `ADD CONSTRAINT ... NOT VALID` + `VALIDATE`, concurrent unique index for UNIQUE, metadata-only subforms where documented | `lock_timeout` + caller retry/backoff; separate lock-profile steps; explicit transaction boundaries | `ACCESS EXCLUSIVE` blocks reads; FIFO lock queue; multi-subcommand `ALTER TABLE` uses the strictest lock; CONCURRENTLY cannot run in a transaction block and can leave an INVALID index on failure (drop + retry); **partitioned tables cannot be indexed concurrently in one statement** — build each child index `CONCURRENTLY`, create the parent index `ON ONLY`, then `ATTACH PARTITION` each child so the parent becomes valid without a blocking parent-level build |
| **MySQL / InnoDB (8.0+)** | Online DDL: `ALGORITHM=INSTANT` (metadata-only) / `INPLACE` (no full copy, may rebuild) / `COPY` (full rebuild), with `LOCK=NONE` for concurrent DML | `ALGORITHM`/`LOCK` review + `lock_wait_timeout`; load/replica monitoring | INSTANT is the default for supported add-column ops (8.0.12+) and drop-column ops (8.0.29+) but is **limited** (row-version ceiling, row-size checks, compressed/fulltext/temp-table restrictions, functional-index and operation-combination restrictions; pre-8.0.29 add-column could only append at the end); type changes, NOT NULL transitions, and PK changes still rebuild or block; **INSTANT changes physical cost, not application compatibility** |
| **gh-ost (MySQL)** | Triggerless ghost-table fed from row-based replication / binlog, controlled cutover, then **atomic rename** | replica-lag / load / http / file throttles; operator-controlled pause/resume | Foreign keys and triggers are **not supported**; the rename cutover is the lock-sensitive moment; long throttles depend on binary-log retention; replica-lag throttling is part of the run |
| **pt-online-schema-change (MySQL)** | Ghost table + triggers, chunked copy, final atomic table swap | `innodb_lock_wait_timeout` / `lock_wait_timeout`; replica-lag + chunk/load throttles | Foreign keys require `--alter-foreign-keys-method` and add risk; existing triggers can conflict; adding a unique key has an `INSERT IGNORE` **data-loss** caveat; cutover still needs metadata locks |
| **Vitess / PlanetScale** | Managed online schema changes via **deploy requests** (branch/review/gated cutover; gh-ost / vitess-native under the hood) | platform-managed topology-aware throttling | A **revert window** keeps the old table for a bounded period so a change can be reverted after apply — contract is *recoverable within the window* (not a restore-from-backup); instant deployments may be non-revertible; FK semantics have Vitess-specific caveats; app compatibility is still external to the tool |

**The portable rule:** name the engine's online-change mechanism and its bounded-lock control before sequencing the change. The expand/migrate/contract phases sit *above* all of these; the engine decides how each phase's DDL runs safely under live traffic.

### PostgreSQL reality checks (depth)

- `ALTER TABLE` acquires `ACCESS EXCLUSIVE` unless a subform documents a weaker lock; multiple subcommands use the strictest lock among them.
- `NOT VALID` lets foreign-key, CHECK, and (on supporting versions) not-null constraints be added without immediately scanning old rows; `VALIDATE CONSTRAINT` verifies existing rows later under a less disruptive lock.
- `SET NOT NULL` historically required a full scan or a validated proof that no NULLs exist. Current Postgres supports not-null constraints with `NOT VALID`; 12–17 deployments still need the CHECK-proof pattern before `SET NOT NULL`.
- UNIQUE and PRIMARY KEY do not use `NOT VALID`; use the concurrent unique-index path, then attach with `USING INDEX` where supported. A concurrent unique build can enforce uniqueness against other transactions before the index is available for reads; a failed build can leave an invalid unique index still imposing write overhead — recovery is drop/retry or reindex concurrently.

### PostgreSQL view-based multi-version tools

- pgroll and Reshape automate parts of expand/contract by exposing old and new schema versions at once through schemas/views over the physical tables.
- For breaking column changes they create the new physical shape, backfill/transform values, and use triggers or generated up/down expressions so writes through either version stay synchronized for the migration window.
- They decouple app rollout from the database change: old app versions connect to the old view/schema, new ones to the new; rollback can remove the new version while the old still exists.
- **Completion remains contract.** Do not remove the old schema version until runtime evidence shows no clients, workers, scripts, or rollback paths still depend on it.

## Dual-Write / Dual-Read — The Transition Discipline (not "write to both and hope")

The migrate phase is where most non-trivial changes actually live, and "dual-write" is not vague duplication. Dual-writing is a *transition tool, not a permanent architecture*. The production-grade pattern (Stripe's *Online Migrations at Scale*) has named rules:

1. **Pick a source of truth.** At the start of migrate, the **old shape is the source of truth**; the new shape is being populated and is not yet trusted. Name the source-of-truth rule before implementation:
   - *Old primary:* write old first, derive new from old, read old fallback until new coverage is proven.
   - *New primary:* write new first, derive old for rollback/old readers, switch reads to new after consistency passes.
   - *Adapter primary:* a single write-through function updates both shapes so callers do not fork logic.
2. **Dual-write.** New code writes to *both* old and new shapes on every mutation, keeping them in lock-step for all new rows.
3. **Backfill** existing rows into the new shape (batched, resumable — see *Backfill Modes*).
4. **Dual-read with verification.** Read from the new shape but **compare against the source of truth** (old shape). Give dual-read an explicit fallback order and a metric for fallback usage (e.g. read new column; if null/missing, fall back to old and emit a counter — the counter must trend to zero before contract). Log discrepancies; emit a **production consistency metric** (mismatch rate); alert when it exceeds a threshold. This is the gate, not a guess.
5. **Flip the source of truth** to the new shape only once the mismatch rate is acceptably low and stable. Run dark reads / production experiments that compute old and new results while serving the old result first, and roll the flip out **incrementally** (a percentage of traffic / by tenant / shard / canary) so a defect is caught on a slice, not the whole fleet.
6. **Stop dual-writing the old shape** once the new shape is the source of truth and reads are exclusively new — this is the precondition for contract.

Never let silent divergence accumulate: add consistency checks that compare old/new values for changed rows and sampled historical rows; for high-volume systems, use sampled checks plus targeted full checks on high-risk partitions. The discipline that distinguishes this from "hope": a *named source of truth at every moment*, a *measured consistency check in production*, and *incremental rollout* — not a single cutover deploy.

## Backfill Modes

| Mode | Use when | Safety rule |
|---|---|---|
| **No backfill** | New field only matters for future rows | Existing rows must be semantically allowed to stay empty |
| **Batched backfill** | Existing rows need deterministic conversion | Chunk by stable key/range; commit per batch; resume after failure |
| **Background job** | Backfill takes hours/days or must throttle with load | Track progress, errors, lag, idempotency |
| **Lazy / read-repair** | Data can be repaired safely when read | Must not leave critical invariants unenforced forever |
| **Dual-write-only** | Historical rows are irrelevant, but rollback needs old writes | Define when old-write redundancy can stop |

Backfills should be idempotent, bounded, observable, resumable, and safe to pause. A single unbounded `UPDATE` on a large hot table is a production operation, not just a migration line — it locks the table, fills WAL, and times out.

## The Deploy-Ordering Rule

| Direction | When safe | Risk |
|---|---|---|
| **Migration first, then code** | Migration is additive (column added; nothing depending on it); old code ignores the new shape | Migration runs; old code keeps working; new code rolls out later and uses new |
| **Code first, then migration** | Code is backwards-compatible with the old schema and gates new behavior | New code rolls out; tolerates absence of new shape until migration completes |
| **Coordinated (multi-step)** | Renames, drops, type changes, required fields, validated constraints, table swaps — most non-trivial changes | Expand/migrate/contract spans multiple deploys |

The deploy-ordering choice is a design decision per change. The expand/contract pattern's value is that it makes the ordering *explicit* and *survivable* at every intermediate point. If the plan depends on "the deploy will happen immediately after the migration," the plan is not robust enough for production.

## Tooling — Helpful, Not Sufficient (Lint, Online-Rewrite, and Multi-Version)

The expand/contract discipline can be executed by hand (the matrix above) or delegated to tooling that encodes it. There are two generations of tools, and they automate different amounts of the work:

| Generation | Examples | What it automates | What it leaves to you |
|---|---|---|---|
| **Lint / guard / online-rewrite** | Strong Migrations (Rails), **Squawk** (Postgres, raw-SQL / language-agnostic), **Atlas** (`migrate lint`, engine-agnostic), gh-ost & pt-online-schema-change (MySQL) | Rejects or rewrites unsafe single migrations — Squawk and Atlas lint raw SQL / migration files for destructive, non-additive, table-locking, and table-rewriting changes regardless of ORM, so the guard is not Rails-only; gh-ost / pt-osc run online table copies for MySQL changes that would otherwise lock | The multi-deploy *sequencing* — when to dual-write, when to switch reads, when to contract |
| **Declarative multi-version** | pgroll (Xata), Reshape | Maintains **both** schema versions at once: each version is exposed through a database **view** over the physical table, with triggers that **dual-write between old and new columns** for the migration's lifetime. Old app versions query the old view; new versions query the new view; neither sees the other's shape. Backfill, lock-safe DDL, and the view swap are tool-managed | Declaring the desired end state; deciding *when* to roll the version forward and complete (contract) |

pgroll's model is the clearest expression of this skill's thesis made executable: the **compatibility window becomes a first-class, tool-managed object** instead of a hand-coordinated sequence of deploys. The expand → migrate → contract phases still exist; pgroll just owns the triggers, the backfill, and the view swap, and lets old and new application deployments target their own schema version simultaneously.

**Caveat — tooling changes WHO runs expand/contract, not WHETHER it happens.** Linters answer "did this migration file contain known hazards?"; online-rewrite and ghost-table tools answer "can this physical change run with less blocking?"; multi-version tools automate the steps. None of them answers "can every deployed application version, worker, rollback, and consumer survive every intermediate state?" — that remains schema evolution's job. Understanding the manual sequence is what lets you operate, debug, and trust these tools — and what tells you when a change is outside their safe envelope. pgroll and Reshape are Postgres-specific; the principle is portable across every relational store.

## Boundary Gates — The Explicit Criteria for Crossing Each Phase

Every phase boundary has an explicit gate. "We'll know when we're ready" is not a gate.

### Gate 1 — Enter Migrate (start dual-write / backfill)

- [ ] The new shape exists in production (expand is complete and verified).
- [ ] The new shape is **additive and ignorable** — currently-deployed old code is unaffected by its presence (forward compatibility holds).
- [ ] Old code still works against the expanded schema; new code can be deployed without requiring contract.
- [ ] Code that dual-writes to both shapes is ready to deploy; the **source of truth is named** (old shape, at this point).
- [ ] Read/write adapters or feature flags have explicit fallback behavior.
- [ ] A backfill job exists that is **batched and resumable**, with progress / error / consistency metrics.
- [ ] Rollback is still trivial: dropping the new shape (or reverting the app) restores the prior state.

### Gate 2 — Switch Reads to the New Shape

- [ ] New writes are reaching the new shape for live traffic.
- [ ] Backfill is complete and verified — no existing rows have inconsistent state (or the missing-data policy is explicit).
- [ ] Dual-read verification has run in production and the **mismatch rate (new vs source-of-truth old) is acceptably low and stable** over a named observation window.
- [ ] Dark reads / read experiments have compared old/new results in production without serving bad new results.
- [ ] The read switch is rolled out **incrementally** (percentage / tenant / shard / canary), not as a single fleet-wide cutover; fallback reads are observable and trending to zero.
- [ ] Observability for the new read path is in place; a regression would be visible.
- [ ] Rollback is still available: revert the reading code; the old shape is intact and still written.

### Gate 3 — Enter Contract (drop the old shape)

- [ ] All deployed code reads exclusively from the new shape (verified via code inspection or runtime monitoring).
- [ ] All deployed code writes exclusively to the new shape (dual-write to the old shape has stopped, or old writes are demonstrably redundant and ready to stop).
- [ ] **Every non-web code path is accounted for, not just the request-serving app.** Background workers, queue/stream consumers, cron and scheduled jobs, batch ETL, analytics and reporting queries, replicas/read-replicas, materialized views, downstream services reading the same database, and ad-hoc operator scripts can all still reference the old shape long after the web tier has migrated. A column "no code reads" by web-tier inspection can still be read by a nightly report. Enumerate and verify these explicitly.
- [ ] Runtime monitoring, query logs, code search, and schema-reference checks agree the old shape is unused.
- [ ] The migrate phase has been stable in production for a defined observation period (typically days).
- [ ] Observability for the new shape is in place; the old shape's removal would not blind monitoring or alerts.
- [ ] The rollback posture for contract is explicit: either the team accepts irreversibility, **or** a revert path is deliberately preserved (retained old table, snapshot/restore, or a managed revert window such as Vitess/PlanetScale deploy requests).

Premature contract is a common cause of incidents. A fast physical drop is still logically destructive when deployed code, workers, reports, or rollback paths reference the old shape. Treat contract as one-way unless a revert path is explicitly preserved.

## Verification

After applying this skill, verify:

- [ ] Every non-trivial schema change is planned as expand → migrate → contract, not as a single deploy.
- [ ] The compatibility envelope is explicit: which code versions are expected to run, with which schema versions, at every intermediate point — and each intermediate state satisfies BOTH backward and forward compatibility.
- [ ] Deploy ordering is explicit: migration-first, code-first, or coordinated multi-step.
- [ ] Database-specific lock/rewrite behavior is checked against the target engine and version (the Postgres recipe is not assumed to transfer verbatim).
- [ ] Every production DDL — even a "single-step safe" one — runs under a bounded lock-acquisition budget (Postgres `lock_timeout` with automatic retry/backoff, or the engine equivalent) so it cannot cascade-block the lock queue behind a long transaction.
- [ ] Constraint-tightening uses the correct per-constraint mechanism: NOT VALID + VALIDATE for FK / CHECK / NOT NULL; a concurrent unique index (not NOT VALID) for UNIQUE, with invalid-index recovery planned.
- [ ] Index creation/removal uses CONCURRENTLY (Postgres), the engine's online DDL, or a deploy-request mechanism — with the recovery/monitoring plan for invalid indexes.
- [ ] The engine's online-change mechanism is named for each change (Postgres CONCURRENTLY/NOT VALID; MySQL ALGORITHM/LOCK; gh-ost/pt-osc ghost-table cutover; platform deploy request).
- [ ] The dual-write / dual-read transition has a **named source of truth at every moment**, a **production consistency check (mismatch metric + alert)**, dark-read experiments, an acceptable-mismatch threshold, and **incremental rollout** of the read switch — not vague duplication.
- [ ] Dual-write / dual-read transitions have defined criteria for advancing to the next state — the boundary gates above, not "we'll know when we're ready."
- [ ] Backfill jobs are batched (rows in tractable chunks), idempotent, observable, and resumable.
- [ ] Online DDL / tooling (linters, ghost-table tools, multi-version tools, managed deploy requests) is treated as a lower-level aid, not as proof of application compatibility; if a tool or managed platform is in use, the team can still name the phase it is in and the criterion to advance.
- [ ] Contract criteria are evidence-backed before any old shape is dropped (including every non-web code path).
- [ ] Rollback is preserved through expand and migrate; the contract phase's rollback posture is explicit (accepted irreversibility, or a deliberately preserved revert path).
- [ ] Migrations are reviewed for the *sequence* and the *envelope*, not just the SQL syntax.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Executing one ALTER TABLE migration mechanically | `database-migration` | database-migration owns the mechanics (including the bounded lock-acquisition wrapper and ghost-table cutover on a single change); this owns the sequencing |
| Designing the schema from scratch | `data-modeling` | data-modeling owns design; this owns evolution |
| Deciding which indexes to maintain | `indexing-strategy` | indexing-strategy owns design; this owns how the index set evolves |
| Tuning a slow query | `query-optimization` | query-optimization owns retrieval performance; this owns schema change |
| Horizontal partitioning | `sharding-strategy` | sharding owns partitioning; this owns schema shape changes |
| Choosing isolation level | `transaction-isolation` | transaction-isolation owns concurrency semantics; this owns shape evolution |

## Key Sources

- Ambler, S. W., & Sadalage, P. J. (2006). *Refactoring Databases: Evolutionary Database Design*. Addison-Wesley. The canonical reference for the expand/contract pattern (called "Parallel Change" in some literature) and the broader catalog of database refactorings.
- Sadalage, P. J., & Fowler, M. ["Evolutionary Database Design"](https://martinfowler.com/articles/evodb.html). Practitioner essay grounding database changes as version-controlled, tested migrations that move with application code.
- Fowler, M. ["Parallel Change"](https://martinfowler.com/bliki/ParallelChange.html). The general expand/migrate/contract pattern as a software-evolution technique (applies beyond databases).
- PostgreSQL Global Development Group. ["ALTER TABLE"](https://www.postgresql.org/docs/current/sql-altertable.html), ["CREATE INDEX"](https://www.postgresql.org/docs/current/sql-createindex.html), and ["Explicit Locking"](https://www.postgresql.org/docs/current/explicit-locking.html). Reference for Postgres-specific safe-change patterns (NOT VALID, CONCURRENTLY, ACCESS EXCLUSIVE lock semantics, the FIFO lock queue, invalid-index recovery, partitioned-table caveats).
- Nikolaev, N. (PostgresAI). ["Zero-downtime Postgres schema migrations need this: lock_timeout and retries"](https://postgres.ai/blog/20210923-zero-downtime-postgres-schema-migrations-lock-timeout-and-retries). The canonical explanation of the FIFO lock-queue hazard and the `lock_timeout` (sub-2s, often 50ms) + retry-with-backoff mitigation that makes even "instant" DDL safe under live traffic.
- pgroll (Xata). [`xataio/pgroll`](https://github.com/xataio/pgroll) and ["Schema changes and the Postgres lock queue"](https://pgroll.com/blog/schema-changes-and-the-postgres-lock-queue). The view-based, declarative, multi-version expand/contract tool for Postgres — old and new schema versions coexist via views + dual-write triggers, decoupling application and database deploys — and a clear write-up of why a metadata-only ALTER queued behind a long transaction blocks reads.
- Reshape. [`fabianlindfors/reshape`](https://github.com/fabianlindfors/reshape). The view-and-trigger based zero-downtime migration tool for Postgres that pioneered the multi-version approach pgroll generalizes.
- MySQL. ["InnoDB Online DDL Operations"](https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-operations.html). The per-operation matrix of INSTANT / INPLACE / COPY algorithms and LOCK levels — the MySQL expression of the bounded-lock online-change invariant, with its INSTANT limitations.
- gh-ost (GitHub). [`github/gh-ost`](https://github.com/github/gh-ost). Triggerless, binlog-driven ghost-table copy + atomic rename cutover for online schema change on large MySQL tables; documents the FK/trigger non-support and replica-lag throttling that distinguish ghost-table migrations from in-place DDL.
- Percona Toolkit. ["pt-online-schema-change"](https://docs.percona.com/percona-toolkit/pt-online-schema-change.html). The trigger-based ghost-table analogue to gh-ost: chunked row copy, triggers to keep the shadow table in sync, atomic rename cutover — with documented foreign-key complications, the `INSERT IGNORE` unique-key data-loss caveat, and load/replica-lag checks.
- PlanetScale / Vitess. ["Safe migrations"](https://planetscale.com/docs/vitess/schema-changes/safe-migrations) and ["Deploy requests"](https://planetscale.com/docs/vitess/schema-changes/deploy-requests). Managed online schema changes with branch-based review, gated cutover, and a **revert window** — contract is recoverable within a bounded period because the old table is retained; the source for the "contract is irreversible *unless preserved*" nuance and the instant-deploy non-revertibility caveat.
- Strong Migrations (Ruby). [`ankane/strong_migrations`](https://github.com/ankane/strong_migrations). Open-source linter that encodes the safe-migration patterns and rejects unsafe migrations at lint time, with safer expand/contract alternatives.
- Squawk. [`squawkhq.com`](https://squawkhq.com/). A PostgreSQL migration linter and language server operating on raw SQL (ORM- and language-agnostic), flagging table-locking ALTERs, non-concurrent index builds, and dangerous constraint additions in CI.
- Atlas. ["Migration linting"](https://atlasgo.io/versioned/lint). Engine-agnostic schema-as-code tool whose `migrate lint` checks for destructive changes, non-additive/breaking changes, table-locking operations, and table rewrites — the source for non-Rails, multi-engine migration linting coverage.
- Sandberg, R. (2021). ["Online Migrations at Scale"](https://stripe.com/blog/online-migrations) (Stripe Engineering Blog). Industrial case study on expand/contract at scale; the source of the dual-write / backfill / dual-read-with-verification / flip-source-of-truth discipline and the production consistency-check pattern.
- Shopify Engineering. ["Adding a NOT NULL Column to a Table in Postgres"](https://shopify.engineering/safely-adding-not-null-columns-postgres). Industrial guide to one common change with detailed safety reasoning.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Chapter 4 covers schema evolution across data models and distributed-data systems, and is the source of the backward/forward compatibility distinction this skill's envelope relies on.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `data-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: Evolving a database schema over time without breaking deployed application code — the expand/contract pattern, zero-downtime change rules, the backwards/forwards compatibility envelope (deploy ordering and rollback discipline), the per-change-type safe procedure (add/drop/rename column, type change, constraints, indexes), dual-write/dual-read transitions with named source-of-truth and production consistency-check rules, the bounded lock-acquisition discipline that makes even a metadata-only change safe under live traffic (Postgres lock_timeout + retry, or the engine equivalent), the cross-engine online-change mechanisms (Postgres CONCURRENTLY/NOT VALID, MySQL INSTANT/INPLACE/COPY Online DDL, gh-ost/pt-osc ghost-table cutover, Vitess/PlanetScale revert windows), the view-based multi-version tools (pgroll, Reshape) and the migration-lint enforcement layer (Strong Migrations, Squawk, Atlas) that encode the discipline. Portable across relational databases and deploy pipelines; principle-grounded, not repo-bound. Excludes mechanical execution of one migration (database-migration), schema design from scratch (data-modeling), query tuning (query-optimization), and distributed-data partitioning (sharding-strategy).

**When to use**
- design the expand-contract sequence to rename a column from `name` to `full_name` across a deployed system
- decide whether to add a NOT NULL column with a default or with a separate backfill phase
- diagnose a deploy that broke because the schema change shipped before the code change
- explain why drop-column is the third phase of expand-contract, not the first
- why did a one-line ALTER TABLE freeze the whole app even though it didn't rewrite the table
- plan a MySQL online schema change where INSTANT DDL exists but app versions still overlap
- Triggers: `how do we rename this column without downtime`, `expand contract`, `is this migration safe`, `schema versioning`, `backwards compatibility for database`

**Not for**
- execute one ALTER TABLE migration mechanically (use database-migration)
- design a schema from scratch (use data-modeling)
- diagnose a slow query (use query-optimization)
- choose shard keys or repartition data across nodes (use sharding-strategy)

**Related skills**
- Verify with: `data-modeling`, `database-migration`
- Related: `acid-fundamentals`, `data-modeling`, `database-migration`, `indexing-strategy`, `query-optimization`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Schema evolution is to a database what stage carpentry is to a Broadway musical — the show does not stop; you do not bolt a new staircase to the stage during the second act; you build the new staircase upstage while the old staircase serves the cast (expand), gradually rehearse the cast to use the new one while the old still works (migrate), and only after every performer has memorized the new route do you remove the old staircase (contract). Removing the old before everyone has migrated is the production-incident equivalent of a missed cue; swinging a heavy set piece across the stage mid-scene without warning the cast — even briefly — is the lock-queue freeze.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://martinfowler.com/articles/evodb.html`, `https://martinfowler.com/bliki/ParallelChange.html`, `https://www.postgresql.org/docs/current/sql-altertable.html`, `https://www.postgresql.org/docs/current/sql-createindex.html`, `https://www.postgresql.org/docs/current/explicit-locking.html`, `https://stripe.com/blog/online-migrations`, `https://postgres.ai/blog/20210923-zero-downtime-postgres-schema-migrations-lock-timeout-and-retries`, `https://dev.mysql.com/doc/refman/8.4/en/innodb-online-ddl-operations.html`, `https://github.com/github/gh-ost`, `https://docs.percona.com/percona-toolkit/pt-online-schema-change.html`, `https://planetscale.com/docs/vitess/schema-changes/deploy-requests`, `https://planetscale.com/docs/vitess/schema-changes/safe-migrations`, `https://github.com/xataio/pgroll`, `https://github.com/fabianlindfors/reshape`, `https://github.com/ankane/strong_migrations`, `https://squawkhq.com/`, `https://atlasgo.io/versioned/lint`

**Keywords**
- `schema evolution`, `expand contract`, `parallel change`, `zero-downtime migration`, `backwards compatibility`, `dual write`, `lock timeout`, `online schema change`, `schema versioning`, `rolling deploy`

<!-- skill-graph-context:end -->
