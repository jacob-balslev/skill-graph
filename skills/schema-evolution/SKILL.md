---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: schema-evolution
description: "Use when reasoning about how a database schema changes over time without breaking deployed application code: the expand/contract pattern (Ambler & Sadalage), the zero-downtime change rules, the backwards-and-forwards compatibility envelope (deploy ordering and rollback discipline), the catalog of schema changes (add column, drop column, rename, type change, add constraint, add index) and the safe procedure for each, the dual-write and dual-read transitions that make non-trivial changes safe in production, and the relationship between schema evolution as a design discipline and database-migration mechanics as its tooling. Do NOT use for the mechanical execution of one migration (use database-migration), schema design from scratch (use data-modeling), query tuning (use query-optimization), or distributed-data partitioning (use sharding-strategy)."
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
  - schema evolution
  - expand contract
  - parallel change
  - zero-downtime migration
  - backwards compatibility
  - rolling deploy
  - dual write
  - dual read
  - schema versioning
  - additive change
  - destructive change
triggers:
  - "how do we rename this column without downtime"
  - "expand contract"
  - "is this migration safe"
  - "schema versioning"
  - "backwards compatibility for database"
examples:
  - "design the expand-contract sequence to rename a column from `name` to `full_name` across a deployed system"
  - "decide whether to add a NOT NULL column with a default or with a separate backfill phase"
  - "diagnose a deploy that broke because the schema change shipped before the code change"
  - "explain why drop-column is the third phase of expand-contract, not the first"
relations:
  related:
    - data-modeling
    - database-migration
    - indexing-strategy
    - acid-fundamentals
  boundary:
    - skill: data-modeling
      reason: "data-modeling owns the design of a schema at a point in time; this skill owns how that schema changes between points in time. The two compose: data-modeling decides the target shape; this skill decides the safe path from current to target."
    - skill: database-migration
      reason: "database-migration owns the mechanics of applying one migration (ALTER TABLE, batched backfill, CONCURRENTLY indexes, unpooled connections); this skill owns the multi-step sequence of migrations and the deploy-coordination discipline that makes the sequence safe."
    - skill: indexing-strategy
      reason: "indexing-strategy owns which indexes the database has; this skill owns how the index set evolves over time. Adding or removing an index is one type of schema change governed by this skill's discipline."
  verify_with:
    - data-modeling
    - database-migration
anti_examples:
  - "execute one ALTER TABLE migration mechanically (use database-migration)"
  - "design a schema from scratch (use data-modeling)"
  - "diagnose a slow query (use query-optimization)"
concept:
  definition: "Schema evolution is the discipline of changing a database schema over time in a way that keeps deployed application code working. The unit of work is a *change to the schema* (add a column, rename a column, change a type, add a constraint, drop a column) that must be applied to a database serving an application that does not stop running. The central technique is expand/contract (Ambler & Sadalage 2006; also called parallel change): introduce the new shape *additively* without removing the old shape (expand), migrate the application to use the new shape, then remove the old shape (contract). The discipline is the *ordering* across migrations and deploys, the backwards-and-forwards-compatibility envelope each intermediate state must satisfy, and the rollback discipline that keeps the system recoverable when any step fails. The mechanical execution of any single migration is the concern of database-migration; the *sequence* of migrations and their relationship to application deploys is this skill's concern."
  mental_model: |
    Five primitives structure schema-evolution reasoning:

    1. **Expand/contract (parallel change)** — the foundational pattern. To change the schema in a way that is unsafe to apply atomically, split the change into three phases: **Expand** (add the new shape additively; old shape still present), **Migrate** (update the application to write to and read from the new shape; backfill data if needed; old shape becomes redundant), **Contract** (remove the old shape now that no code uses it). Each phase is individually safe — the system runs correctly between phases. The pattern dates to Ambler & Sadalage (2006) "Refactoring Databases."

    2. **The compatibility envelope** — at every point during the evolution, the deployed code must work with the schema that's actually in the database. Two compatibility directions: **backwards compatibility** (newer code works with older schema; required during deploy when code rolls out before migration completes) and **forwards compatibility** (older code works with newer schema; required during deploy when migration completes before code is fully rolled out). The deploy order (code first vs migration first) determines which compatibility direction matters. The expand/contract pattern guarantees both at the price of multi-step deploys.

    3. **The change taxonomy and its safety profile** — schema changes vary in safety. **Additive** (add nullable column, add table, add index, add view): generally safe — deployed code can ignore the new shape. **Constraint-tightening** (add NOT NULL, add UNIQUE, add CHECK, add FK): unsafe in one step if existing data violates; requires validate-existing-then-add-with-NOT-VALID pattern. **Destructive** (drop column, drop table, drop index): unsafe — deployed code that still references the shape will fail. **Renaming** (rename column, rename table): typically requires expand/contract because deployed code references the old name. **Type changes**: dangerous; often require add-new-column + backfill + swap pattern.

    4. **The dual-write / dual-read transition** — during the migrate phase, the application writes to both shapes simultaneously (dual write) and reads from the new shape with fallback to old (dual read), or the inverse. Either pattern allows the system to function while data is in mixed state. The dual phase is the critical compatibility envelope; the duration depends on backfill speed.

    5. **The rollback discipline** — each phase must be independently reversible. Expand is reversible by dropping the new shape (no data was depending on it yet). Contract is irreversible (old shape is gone; data may have been transformed). The migrate phase is reversible by reverting the code (old shape is still there). The discipline is to never enter a phase whose rollback would lose data — and to never depend on rollback being possible after Contract.

    The deep insight is that **the schema and the deployed code are two co-evolving systems**, and the danger is desynchronization. Naive thinking ("change the schema; deploy the code") works when the database is small and downtime is acceptable; production systems with continuous availability require multi-step evolution that keeps both sides compatible at every point. Expand/contract is the protocol that makes this discipline executable.

    The complementary insight is that **the time between phases is the critical resource**. A team that ships expand on Monday and contract on Tuesday has no margin for discovering that the migrate phase broke something. The right cadence is expand-and-migrate landed and verified; then a separate later deploy contracts. Days or weeks between expand and contract is normal in production systems.
  purpose: |
    Schema evolution exists because deployed applications cannot stop running while the database changes shape, and naive schema changes break running code.

    **Downtime is unacceptable for many systems.** A SaaS product, a payment system, a global service — all serve users 24/7. Changing the schema with a downtime window is not an option. The system must evolve while continuing to operate.

    **Rolling deploys are how modern applications ship.** New application versions roll out gradually (canary → 10% → 50% → 100%); during the rollout, multiple versions of the code are running simultaneously against the same database. A schema change that breaks the old version while the new version expects it produces a brief outage; one that breaks the new version while only the old has rolled out produces the same. Expand/contract is the discipline that makes rolling deploys work alongside schema changes.

    **Rollback must remain possible.** A code deploy that fails should be revertable. If the deploy was paired with a schema change that is hard to reverse (a column was dropped; data was destructively transformed), the rollback is hard or impossible. The expand phase preserves rollability; the contract phase explicitly accepts loss of rollback in exchange for the simpler steady-state shape.

    **Multi-region and replicated systems amplify the problem.** A schema change in one region must propagate to replicas; the replica catches up at its own pace; for a window of time, replicas have different schemas. Application code reading from a replica may see the old shape after the new shape has landed on the primary. Expand/contract's intermediate states handle this implicitly by keeping both shapes available.

    **The "I'll just take a maintenance window" alternative is increasingly unviable.** Even when a maintenance window exists, the schema change might take longer than the window. A long-running migration on a billion-row table can run for hours; the deploy that depends on it cannot start until it finishes; the entire team is blocked. Splitting into expand-and-contract phases lets each phase fit in a normal deploy window.

    The cost of schema evolution as a discipline is real. A "trivial" rename becomes a three-phase deploy. A "trivial" drop column requires waiting for all code to migrate. Migrations are written more carefully, with backfills, with NOT VALID intermediate states, with backwards-compatible reads and writes. The cost pays back when the alternative — downtime, incident, lost data, blocked deploy — is much more expensive.

    The deeper purpose is to make the database a *co-deployable* part of the system. Without schema-evolution discipline, the database is a special part of the deploy that requires coordination, downtime, or risk acceptance. With the discipline, the database evolves continuously alongside the code, with each change designed to be deployable in the same model as any code change.
  boundary: |
    **Schema evolution is not the same as database migration.** Database migration is the *mechanical execution* of one schema change (ALTER TABLE syntax, batched backfill, CONCURRENTLY index creation, unpooled-connection requirements). Schema evolution is the *strategic sequencing* of migrations and the deploy-coordination discipline. The two compose: schema evolution decides the sequence; database migration executes each step.

    **The expand/contract pattern is not always necessary.** For purely additive changes (add a nullable column that the new code uses; existing code ignores it), a single deploy can land both schema and code. The pattern is required when the change is destructive, constraint-tightening, or shape-changing in a way that affects deployed code.

    **Schema evolution does not eliminate downtime risk; it manages it.** A miscoordinated deploy can still produce outage even with expand/contract — for example, if the contract phase runs before all old code has been replaced. The discipline reduces risk; it does not zero it.

    **Forwards and backwards compatibility have different costs.** Backwards-compatible code (new code that works with old schema) is generally easier than forwards-compatible code (old code that works with new schema). Deploy order (code first vs migration first) determines which direction matters; the typical safe order is migration-first-with-additive-changes, then code, then migration-with-destructive-changes.

    **The migrate phase is not a one-deploy step.** It often includes: deploy new code that dual-writes; run a backfill job (potentially batched over hours); deploy new code that dual-reads (now reads from new shape with old as fallback); deploy new code that single-reads from new shape only. These can be multiple separate deploys spanning days or weeks.

    **NOT NULL constraints are not added with `ALTER TABLE ADD CONSTRAINT NOT NULL`.** They are added with NOT NULL DEFAULT in the column definition (so existing rows get a default), or by first making the column accept new writes with NOT NULL behavior at the application layer, backfilling missing values, then adding the constraint with NOT VALID, then validating it separately. The single-step ADD NOT NULL on a table with existing nulls fails immediately.

    **Renaming columns is rarely a simple operation.** Adding a new column, dual-writing to both, backfilling, switching reads, then dropping the old is the typical pattern. The "rename" itself is sometimes never executed atomically; instead the old name is dropped after all code has been migrated.

    **Foreign keys are not always safe to add.** ALTER TABLE ADD FOREIGN KEY validates all existing rows by default and acquires a strong lock during validation. The pattern is ADD FOREIGN KEY NOT VALID (instant), then VALIDATE CONSTRAINT in a separate transaction (slow but doesn't block writes). Adding FK without NOT VALID on a large table is the cause of many production stalls.

    **Index creation is not free.** CREATE INDEX (without CONCURRENTLY in Postgres) blocks writes for the duration. CREATE INDEX CONCURRENTLY is non-blocking but slower; it can fail and leave an invalid index that must be cleaned up. Indexes are part of schema evolution; their creation has the same deploy-coordination concerns as any other schema change.

    **Schema evolution is not just for relational databases.** Document databases (MongoDB), wide-column stores (Cassandra), and even key-value stores have schemas — implicit, application-enforced, or partial. The discipline applies wherever stored shape and reading code can disagree.
  taxonomy: |
    By the expand/contract phases:
    - **Expand** — additively introduce the new shape. Deploy is safe; old code keeps working.
    - **Migrate** — application uses new shape; data is backfilled; both shapes are populated. May be multi-deploy.
    - **Contract** — remove the old shape. Irreversible; must be after all code has migrated.

    By change safety profile:
    - **Additive (safe in one step)** — add nullable column, add new table, add view, add non-unique index.
    - **Constraint-tightening (multi-step or careful)** — add NOT NULL (requires default or backfill), add UNIQUE (requires no duplicates), add CHECK, add FK (use NOT VALID + VALIDATE).
    - **Destructive (multi-step always)** — drop column, drop table, drop index. Requires expand/contract.
    - **Renaming (multi-step always)** — rename column, rename table. Deployed code references the old name.
    - **Type change (multi-step always)** — change column type. Requires add new column + backfill + swap + drop old.
    - **Behavior change (subtle)** — change DEFAULT, change ON DELETE behavior, change collation. Often safe but can break edge cases.

    By backfill strategy:
    - **No backfill (additive only)** — new column gets default for existing rows; no separate fill required.
    - **Batched backfill** — UPDATE in batches of 1000-10000 rows; doesn't block writes; can run for hours.
    - **Background backfill via separate worker** — application-layer process fills new column at its own pace.
    - **Dual-write only, no backfill** — new code writes to new shape only; old rows keep old data; eventually they get touched or are explicitly migrated.
    - **Lazy migration** — fill new column when a row is read or written; old rows stay until touched.

    By dual-write / dual-read pattern:
    - **Dual-write, single-read (old)** — write to both shapes; read from old. Used when transitioning *to* new shape.
    - **Dual-write, dual-read (new with fallback)** — write to both; read from new, fall back to old. Used after backfill is sufficient.
    - **Single-write (new), single-read (new)** — fully migrated state.
    - **No dual phase** — only safe for purely additive changes.

    By deploy ordering:
    - **Migration first, then code** — safe when migration is additive; the new column exists before new code uses it.
    - **Code first, then migration** — safe when code is backwards-compatible with old schema; the new code handles both shapes.
    - **Coordinated** — multiple deploys interleaved across a multi-day evolution window.

    By database constraint mechanism:
    - **NOT NULL with DEFAULT** — table-rewrite-required in older Postgres; metadata-only in Postgres 11+ for some default types.
    - **NOT VALID + VALIDATE** — Postgres-specific pattern for adding constraints in two phases.
    - **CHECK + NOT VALID** — same pattern for CHECK constraints.
    - **CREATE INDEX CONCURRENTLY** — Postgres-specific non-blocking index creation.
  analogy: |
    Renovating a busy hotel. The hotel cannot close — there are guests staying every night, room service to deliver, conferences in session. The renovation must happen while the hotel continues to operate.

    A naive approach is to close the hotel for a weekend, renovate, reopen. This is the downtime-window strategy. It works when the renovation is small and the closure is acceptable.

    A more sophisticated approach is to renovate one floor at a time. Floor 5 is taken out of service; guests are moved to other floors; the renovation happens; floor 5 reopens with the new layout. The hotel never fully closes. This is the rolling-deploy analog.

    But what about a renovation that requires changing the elevator system — every floor's plumbing — every guest-services workflow? You can't do these per-floor because the change spans the whole building. The hotel must run both old and new systems in parallel.

    Schema evolution's expand/contract is the parallel-systems renovation. Build the new system alongside the old (expand). For a period, the hotel operates both — guests using the old elevator can still go to their rooms, guests using the new elevator can too; room service operates from both kitchens, dispatched to the right one depending on the room's signage; the housekeeping system reads from both inventories. After enough time has passed that all old usage has migrated to the new system, the old elevators are decommissioned, the old kitchens dismantled, the old inventory system retired. The hotel never closed; the renovation happened while guests slept and dined.

    The expand phase is building the new elevators while the old are still running. The migrate phase is the period when both elevators carry guests, the staff is trained on the new system, the inventory is duplicated, the routing software handles both paths. The contract phase is removing the old elevators after weeks or months of confirming nobody uses them.

    The risk is bad coordination. If the contract phase runs before the staff has fully migrated to the new system, room service can't find the kitchen. If the expand phase doesn't actually serve the new system correctly, the new elevators don't carry guests. The discipline is multi-step, slow, and produces working transitions because each step is independently survivable.
  misconception: |
    The most common misconception is that **schema evolution is the same as database migration**. Database migration is the mechanical execution of one ALTER TABLE; schema evolution is the strategic sequencing of multiple migrations and their coordination with code deploys. The two are different scopes that compose.

    The second misconception is that **expand/contract is overkill for "simple" changes**. Renaming a column is not simple in a system where deployed code references the column. Adding a NOT NULL constraint is not simple if existing data has nulls. Many changes that *look* simple require the full expand/contract pattern because the deployed code is the constraint.

    The third misconception is that **a maintenance window solves the problem**. For many production systems, maintenance windows don't exist — global services, regulated systems, contracts that don't allow downtime. Even when they exist, the migration's actual runtime may exceed the window. The discipline of zero-downtime evolution becomes mandatory for systems that grow.

    The fourth misconception is that **backwards compatibility is enough**. It's necessary but not always sufficient. During a rolling deploy, both old and new code versions run simultaneously; forwards compatibility (old code with new schema) matters too. Expand/contract's intermediate state preserves both.

    The fifth misconception is that **the migrate phase is one deploy**. It often spans multiple deploys over days or weeks: deploy code that dual-writes; backfill data; deploy code that dual-reads; verify; deploy code that reads only from new; only then contract. Each step is its own deploy with its own verification.

    The sixth misconception is that **rolling back a contract phase is possible**. It is generally not. Once the old column is dropped, the data in it is gone (or transformed and not reversible). The discipline is to never enter contract without confidence that the migrate is complete and stable.

    The seventh misconception is that **NOT NULL is added with `ALTER TABLE ADD CONSTRAINT NOT NULL`**. The single-step add fails if any rows have nulls. The pattern is: add the column with NOT NULL DEFAULT, or add the constraint with NOT VALID (which doesn't check existing data), then VALIDATE in a separate slow operation.

    The eighth misconception is that **adding a foreign key is fast**. ALTER TABLE ADD FOREIGN KEY validates all existing rows by default, acquiring a strong lock for the validation duration. On a large table, this stalls writes for the validation time. The pattern is ADD with NOT VALID (instant), then VALIDATE CONSTRAINT separately.

    The ninth misconception is that **dual writes are easy**. The application must write to both shapes consistently; failures of one side require compensating logic. Transactional dual-writes can be done in a single transaction; non-transactional ones (writing to two databases) require sagas or eventual consistency. The implementation is more nuanced than "write to both."

    The tenth misconception is that **schema evolution is only about adding things**. The contract phase — removing the old shape — is often the harder phase. Knowing when it is safe to drop a column (all code paths migrated; verified; observability green) is a discipline of its own. Premature contract is a common cause of incidents in evolved systems.
---

# Schema Evolution

## Coverage

The discipline of changing a database schema over time without breaking deployed application code. Covers the expand/contract (parallel change) pattern as the foundational technique, the backwards-and-forwards compatibility envelope each intermediate state must satisfy, the catalog of schema-change types and their safety profiles (additive, constraint-tightening, destructive, renaming, type-change), the backfill strategies (no-backfill, batched, background, dual-write-only, lazy), the dual-write / dual-read transition patterns, the deploy-ordering rules (migration-first vs code-first), and the relationship to the underlying database-migration tooling that executes individual steps.

## Philosophy

Schema and deployed code are co-evolving systems. The danger is desynchronization — schema changes break running code; code changes assume a schema that hasn't been deployed yet. Expand/contract is the protocol that keeps both sides compatible during transition: additively introduce the new shape, migrate, then contract the old.

The discipline is not in the individual ALTER TABLE statement (that's database-migration's concern). It is in the *sequencing* across migrations and deploys, the compatibility envelope at every intermediate point, and the rollback discipline that keeps the system recoverable when a step fails.

The most consequential phases are the boundaries — entering migrate (the dual-write/dual-read transition) and entering contract (the irreversible drop). Knowing the criteria for crossing each boundary is the operational hygiene that separates evolved systems from broken ones.

## The Expand / Migrate / Contract Phases

```
   ┌────────────────────────────────────────┐
   │ Phase 1: EXPAND                         │
   │ • Add new column / table / index        │
   │ • Old shape unchanged                   │
   │ • Old code continues working unchanged  │
   │ • New code can use new shape if deployed│
   │ • Rollback: drop new shape              │
   └────────────────────────────────────────┘
                    │
                    ▼
   ┌────────────────────────────────────────┐
   │ Phase 2: MIGRATE (multi-deploy)         │
   │ • Deploy code that dual-writes          │
   │ • Backfill existing data (batched)      │
   │ • Deploy code that dual-reads (new w/   │
   │   fallback to old)                      │
   │ • Verify production traffic on new      │
   │ • Deploy code that single-reads new     │
   │ • Rollback: revert code; old shape OK   │
   └────────────────────────────────────────┘
                    │
                    ▼
   ┌────────────────────────────────────────┐
   │ Phase 3: CONTRACT (irreversible)        │
   │ • Drop old column / table / index       │
   │ • No code references old shape          │
   │ • Rollback: impossible (data is gone)   │
   └────────────────────────────────────────┘
```

The time between expand-complete and contract-start is normally days or weeks, not minutes.

## Change-Type Safety Matrix

| Change | Single-step safe? | Pattern |
|---|---|---|
| Add nullable column | Yes | Direct ALTER |
| Add column with NOT NULL DEFAULT | Yes (in Postgres 11+ for constant defaults; verify per database) | Direct ALTER |
| Add column with NOT NULL no default | No | Expand: add nullable; backfill; add constraint with NOT VALID; VALIDATE |
| Add new table | Yes | Direct CREATE TABLE |
| Add index | Yes (with CONCURRENTLY in Postgres) | CREATE INDEX CONCURRENTLY |
| Add foreign key | No (validation locks) | ADD FK NOT VALID; then VALIDATE CONSTRAINT separately |
| Add CHECK constraint | No (validation locks) | Same NOT VALID + VALIDATE pattern |
| Add UNIQUE constraint | No (needs verified uniqueness) | Verify no duplicates; CREATE UNIQUE INDEX CONCURRENTLY; ADD CONSTRAINT USING INDEX |
| Drop column | No (deployed code references it) | Full expand/contract |
| Drop table | No (deployed code references it) | Full expand/contract |
| Drop index | Yes (only if no query relies on it) | DROP INDEX CONCURRENTLY |
| Rename column | No | Full expand/contract: add new; dual-write; backfill; switch reads; drop old |
| Rename table | No | Same expand/contract pattern |
| Change column type | No | Add new column; backfill with conversion; switch reads; drop old |
| Change DEFAULT | Yes | Direct ALTER (affects only future inserts) |

## The Deploy-Ordering Rule

| Direction | When safe | Risk |
|---|---|---|
| **Migration first, then code** | Migration is additive (column added; nothing depending on it) | Migration runs; old code keeps working; new code rolls out and uses new |
| **Code first, then migration** | Code is backwards-compatible with old schema | New code rolls out; tolerates old schema; migration runs; new code now uses new shape |
| **Coordinated (multi-step)** | Most non-trivial changes | Expand/migrate/contract spans multiple deploys |

The deploy-ordering choice is a design decision per change. The expand/contract pattern's value is that it makes the ordering *explicit* and *survivable* at every intermediate point.

## When To Contract

The criteria for crossing into the irreversible contract phase:

- [ ] All deployed code reads exclusively from the new shape (verified via code inspection or runtime monitoring).
- [ ] All deployed code writes exclusively to the new shape, or writes to both with the old write being redundant.
- [ ] The backfill is complete and verified — no existing rows have inconsistent state.
- [ ] Observability for the new shape is in place; the old shape's removal would not blind monitoring.
- [ ] The migrate phase has been stable in production for a defined observation period (typically days).
- [ ] Rollback path during the contract is not required — the team has decided the change is permanent.

Premature contract is a common cause of incidents. The contract phase is irreversible by definition.

## Verification

After applying this skill, verify:
- [ ] Every non-trivial schema change is planned as expand → migrate → contract, not as a single deploy.
- [ ] The compatibility envelope is explicit: which code versions are expected to run, and with which schema versions, at every intermediate point.
- [ ] Constraint-tightening changes use the NOT VALID + VALIDATE pattern (or equivalent in the specific database) to avoid blocking writes during validation.
- [ ] Index creation uses CONCURRENTLY (Postgres) or equivalent non-blocking mechanism.
- [ ] Dual-write / dual-read transitions have defined criteria for advancing to the next state — not "we'll know when we're ready."
- [ ] The contract phase has explicit verification criteria (above list) before it runs.
- [ ] Backfill jobs are batched (rows in tractable chunks) and resumable (can pick up where they left off after failure).
- [ ] Rollback is preserved through expand and migrate; the team accepts irreversibility only at contract.
- [ ] Migrations are reviewed for the *sequence* and the *envelope*, not just the syntax.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Executing one ALTER TABLE migration mechanically | `database-migration` | database-migration owns the mechanics; this owns the sequencing |
| Designing the schema from scratch | `data-modeling` | data-modeling owns design; this owns evolution |
| Deciding which indexes to maintain | `indexing-strategy` | indexing-strategy owns design; this owns how the index set evolves |
| Tuning a slow query | `query-optimization` | query-optimization owns retrieval performance; this owns schema change |
| Horizontal partitioning | `sharding-strategy` | sharding owns partition; this owns schema shape changes |
| Choosing isolation level | `transaction-isolation` | transaction-isolation owns concurrency; this owns shape |

## Key Sources

- Ambler, S. W., & Sadalage, P. J. (2006). *Refactoring Databases: Evolutionary Database Design*. Addison-Wesley. The canonical reference for the expand/contract pattern (called "Parallel Change" in some literature) and the broader catalog of database refactorings.
- Sadalage, P. J., & Fowler, M. ["Evolutionary Database Design"](https://martinfowler.com/articles/evodb.html). Practitioner essay summarizing the discipline of incremental schema change.
- Fowler, M. ["ParallelChange"](https://martinfowler.com/bliki/ParallelChange.html). Short reference on the parallel-change pattern as a general software-evolution technique (applies beyond databases).
- PostgreSQL Global Development Group. ["PostgreSQL Documentation — ALTER TABLE"](https://www.postgresql.org/docs/current/sql-altertable.html). Reference for Postgres-specific safe-change patterns (NOT VALID, CONCURRENTLY, etc.).
- Strong Migrations (Ruby) and pt-online-schema-change (MySQL/Percona). Open-source tools that encode the safe-migration patterns and reject unsafe migrations at lint time.
- gh-ost (GitHub's online schema change tool for MySQL). Documented patterns for online schema change on large MySQL tables; useful framing for non-Postgres environments.
- Sandberg, R. (2021). ["Online Migrations at Scale"](https://stripe.com/blog/online-migrations) (Stripe Engineering Blog). Industrial case study on expand/contract at scale.
- Shopify Engineering. ["Adding a NOT NULL Column to a Table in Postgres"](https://shopify.engineering/safely-adding-not-null-columns-postgres). Industrial guide to one common change with detailed safety reasoning.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Chapter 4 covers schema evolution in distributed-data contexts including the document/wide-column store cases.
