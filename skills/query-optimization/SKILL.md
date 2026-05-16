---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: query-optimization
description: "Use when diagnosing and tuning a specific slow query in a relational database: the query planner mental model (parse → rewrite → plan → execute), the canonical inputs the planner reasons over (statistics, cost model, available indexes), reading EXPLAIN and EXPLAIN ANALYZE output, the catalog of plan-node types (sequential scan, index scan, index-only scan, bitmap heap scan, nested loop, hash join, merge join, sort, hash aggregate, materialize) and what each tells you about the query's actual cost, the difference between query rewriting (reformulating the SQL) and operational fixes (adding indexes, ANALYZE, statistics targets), and the diagnostic procedure that takes a slow query to a fast one. Do NOT use for the design of which indexes to maintain (use indexing-strategy), schema design (use data-modeling), distributed-data partitioning (use sharding-strategy), or isolation-level decisions (use transaction-isolation)."
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
  - query optimization
  - query planner
  - EXPLAIN
  - EXPLAIN ANALYZE
  - sequential scan
  - index scan
  - nested loop
  - hash join
  - merge join
  - query rewriting
  - statistics
  - planner cost model
  - cardinality estimation
triggers:
  - "this query is slow"
  - "EXPLAIN ANALYZE output"
  - "why isn't the planner using the index"
  - "join order optimization"
  - "subquery vs join"
examples:
  - "diagnose a query that takes 8 seconds and identify the plan node responsible"
  - "rewrite a slow correlated subquery as a join to enable a faster plan"
  - "explain why ANALYZE on a recently-changed table can change the planner's decisions"
  - "decide whether to add an index, rewrite the query, or accept the cost"
anti_examples:
  - "design which indexes to maintain on a new schema (use indexing-strategy)"
  - "choose a database schema (use data-modeling)"
  - "decide isolation level for a workload (use transaction-isolation)"
relations:
  related:
    - indexing-strategy
    - data-modeling
    - transaction-isolation
    - schema-evolution
  boundary:
    - skill: indexing-strategy
      reason: "indexing-strategy owns the design of which indexes the database has; this skill owns the diagnosis and tuning of specific slow queries. The two compose: query-optimization diagnoses; indexing-strategy is one of the response tools."
    - skill: data-modeling
      reason: "data-modeling owns schema and access-pattern design; this skill owns the tuning of queries against the existing schema. Sometimes the diagnosis is 'the schema is wrong for this query'; the response is then in data-modeling's scope."
    - skill: transaction-isolation
      reason: "transaction-isolation owns concurrency correctness; this skill owns single-query performance. Sometimes a slow query is slow because of lock contention from isolation; the disciplines intersect on those cases."
  verify_with:
    - indexing-strategy
    - data-modeling
concept:
  definition: "Query optimization is the discipline of diagnosing and tuning a specific slow query. The unit of work is one query that the application or a user reported as slow; the goal is identifying the root cause and applying a response (rewrite the SQL, add an index, refresh statistics, denormalize the schema, change the access pattern). The mental model is the query planner — the database component that takes the SQL string, parses it, applies rewrites, considers possible plans, estimates each plan's cost using statistics and a cost model, picks the cheapest, and executes it. EXPLAIN and EXPLAIN ANALYZE expose the planner's choices and their actual cost; reading these is the central diagnostic skill. The work is largely interpretation: knowing what each plan-node type means, what its cost implies, what cardinality misestimation looks like, and which response (rewrite, index, statistics, schema) addresses the diagnosis."
  mental_model: |
    Five primitives structure query optimization:

    1. **The query planner** — the database component that takes a SQL string and produces an execution plan. Phases: **parse** (lex/parse into AST), **rewrite** (apply view expansion, rule rewrites, constant folding), **plan** (enumerate candidate plans, estimate each plan's cost, choose the cheapest), **execute** (run the chosen plan). The planner is a cost-based optimizer in most modern databases; its decisions are inputs to optimization, not opaque facts. Reading what plan the planner chose, and why, is the diagnostic foundation.

    2. **The cost model and statistics** — the planner estimates each plan's cost using a model that combines row-count estimates (cardinality) with per-operation cost factors (sequential page read, random page read, CPU per tuple). The row-count estimates come from *statistics* the database maintains: column histograms, most-common-values lists, n-distinct estimates, correlations. Stale statistics produce stale estimates produce bad plans; `ANALYZE` refreshes statistics. Cardinality misestimation (the planner thinks 100 rows will match, actually 10 million do) is the most common root cause of bad plan choice.

    3. **The plan-node catalog** — execution plans are trees of plan nodes. Each node type has specific cost and behavior: **Seq Scan** (read every row of a table, cost proportional to table size), **Index Scan** (use an index to find matching rows), **Index Only Scan** (covering index — no row fetch), **Bitmap Heap Scan** (build bitmap from indexes, then fetch matching rows), **Nested Loop** (for each outer row, scan inner for matches; fast for small outer or indexed inner), **Hash Join** (build hash from one side, probe with other; fast for medium-large equi-join), **Merge Join** (merge two sorted inputs; fast when both are sorted on join key), **Sort** (sort rows in memory or on disk), **Hash Aggregate / Group Aggregate** (group rows). Reading EXPLAIN output is reading the tree of these nodes; understanding what each means is the diagnostic vocabulary.

    4. **The diagnostic procedure** — given a slow query: (a) run EXPLAIN ANALYZE; (b) identify the most expensive plan node (highest `actual time`); (c) check if the planner's row estimate matches actual rows (if not, statistics are stale or the planner is mis-modeling the predicate); (d) check if the chosen access path is right (index scan vs seq scan; nested loop vs hash join); (e) apply the appropriate response (ANALYZE, add index, raise statistics target, rewrite query, change schema). Iterate until the query meets its target.

    5. **The response catalog** — the diagnostic narrows the response to one of several: **rewrite the query** (eliminate correlated subqueries, push predicates down, use EXISTS instead of IN, avoid SELECT \*); **add an index** (one matching the query's WHERE/JOIN/ORDER BY shape); **refresh statistics** (ANALYZE, possibly with raised STATISTICS target on misestimated columns); **denormalize / materialize** (precompute the joined or aggregated result); **change isolation or lock behavior** (the query is slow due to contention, not plan); **accept the cost** (the query is rare enough to not warrant tuning). The discipline is matching the response to the specific diagnosis, not reflexively reaching for one fix.

    The deep insight is that **query optimization is largely a reading discipline**. The planner exposes its decisions; the database has the answer. The work is reading the EXPLAIN output, knowing what each node means, and choosing the response. A team that reaches for "add an index" before reading the plan is guessing; a team that reads the plan finds the actual issue and applies the right response — often *not* adding an index.

    The complementary insight is that **cardinality misestimation is the most common root cause**. The planner's cost estimates are only as good as its row-count estimates; when the estimates are wrong, the cost ordering is wrong, and the chosen plan is wrong. ANALYZE, raised statistics targets, and `pg_statistic`-like inspections are where most diagnoses live.
  purpose: |
    Query optimization exists because a single slow query can dominate a system's performance — and because the cost of fixing one query is usually orders of magnitude less than scaling the infrastructure to absorb it.

    **Performance is unevenly distributed.** A real-world database typically has a small number of queries that account for most of the load. Pareto distributions are the rule: 5% of distinct query shapes contribute 80% of total time. Optimizing the top contributors yields disproportionate returns; optimizing every query equally does not.

    **The planner exposes its reasoning.** EXPLAIN shows the chosen plan; EXPLAIN ANALYZE shows the chosen plan with actual execution statistics. A developer reading EXPLAIN ANALYZE sees the planner's predictions (estimated rows, estimated cost) alongside reality (actual rows, actual time). When prediction and reality diverge, the misestimate is visible and actionable.

    **The same query can have many plans.** The planner considers many alternatives — different join orders, different join algorithms, different access paths, different aggregation strategies. The chosen plan is one selection from a search space; sometimes the cheapest plan available is not what the planner chose because statistics or settings biased it. Knowing the planner's options lets the developer reason about whether the chosen plan is right.

    **Responses have very different costs.** A query rewrite is free (just code). An index addition costs storage and write amplification. A statistics target raise costs nothing operationally. A schema change is expensive and risky. Knowing the diagnosis lets the developer apply the cheapest sufficient response rather than reaching for the heaviest tool.

    **Untuned queries become bottlenecks.** A query that takes 100ms on a development dataset can take 30 seconds on a production dataset that grew 100×. Without query optimization, every new feature has the potential to introduce a query that scales poorly; with the discipline, queries are tuned at PR time or in scheduled review cycles, before they become incidents.

    The cost of query optimization is engineering time, knowledge investment (reading EXPLAIN, understanding the planner), and ongoing review (queries that were fast last quarter may be slow this quarter as data grew). The pay-back is large: a properly-tuned query often runs 10×-1000× faster than its naive version, and the alternative — scaling the database to absorb the inefficiency — is usually much more expensive.

    The deeper purpose is to make database performance an *engineering discipline* rather than an operational mystery. A team that reads EXPLAIN ANALYZE has empirical evidence about what is slow and why; a team that doesn't read it relies on guesses, sees scaling as the answer to every performance problem, and spends money on infrastructure where targeted optimization would have been cheaper and better.
  boundary: |
    **Query optimization is not the same as adding indexes.** Adding an index is one response; sometimes the right response is a query rewrite, a schema change, a statistics refresh, or accepting the cost. Reaching for indexes before reading the plan is guessing, and the wrong index is pure cost.

    **Query optimization is not the same as scaling infrastructure.** A slow query that's eating CPU on a single server is not necessarily solved by adding servers; if the query plan is bad, the same bad plan runs on the new servers too. Optimization should come before scaling; many "we need a bigger database" problems are actually "we need to read the plan" problems.

    **Query optimization is not premature.** "Don't optimize" applies to micro-optimizations of code that runs once; it does not apply to database queries that run thousands of times per minute. A query that's measurably slow in production is not premature to optimize; it's already too late.

    **EXPLAIN without ANALYZE is the planner's estimates.** EXPLAIN shows what the planner thinks the cost will be. EXPLAIN ANALYZE actually runs the query and reports the actual cost. For diagnosis, ANALYZE is required — the planner's estimates may be wrong, and the misestimate is often the root cause.

    **The planner is not always wrong when it chooses a sequential scan.** For small tables, low-selectivity predicates, or queries touching a large fraction of rows, scan is cheaper than index lookup. "Why isn't it using the index" sometimes has the answer "because scan is faster."

    **Query rewriting is not always equivalent.** Two queries that appear logically equivalent may produce different plans in the planner. The planner has known weaknesses (correlated subquery handling, EXISTS vs IN, LATERAL vs subquery). Knowing the planner's preferences is part of the diagnostic discipline.

    **Statistics are not automatic everywhere.** Some databases auto-ANALYZE; others require manual ANALYZE after bulk inserts or schema changes. A query that worked yesterday and is slow today may have stale statistics; running ANALYZE before deeper investigation often resolves the issue.

    **Slow queries are not always plan problems.** Lock contention, replication lag, network latency to a remote replica, slow disk, full table caches — these are not plan problems and are not solved by query optimization. Knowing when the issue is the plan vs the environment is part of the discipline.

    **One slow query is not a system-wide performance problem.** Optimizing one query does not necessarily improve aggregate throughput; sometimes the system is under load and every query is slow. System-wide diagnosis is a different (broader) discipline.

    **The planner's choices change with data volume.** A query that uses an index at 1M rows may use a scan at 10M rows because the cost model recognized the index becomes less efficient at that size. The plan that was right last year may not be right this year; periodic review of high-impact queries is the discipline.
  taxonomy: |
    By diagnostic phase:
    - **Reading EXPLAIN** — interpret the planner's chosen plan and estimated costs.
    - **Reading EXPLAIN ANALYZE** — compare estimated costs to actual costs; identify misestimates.
    - **Reading EXPLAIN ANALYZE BUFFERS** (Postgres) — see actual I/O including cache hits / misses.
    - **Reading auto_explain output** — captured plans for queries that exceeded a threshold.
    - **Reading pg_stat_statements** (Postgres) — aggregate query statistics; top-N by total time.

    By plan-node type (the catalog the developer reads in EXPLAIN):
    - **Seq Scan** — sequential scan; cost proportional to table size.
    - **Index Scan** — find matching rows via index, then fetch.
    - **Index Only Scan** — covering index; no row fetch.
    - **Bitmap Heap Scan** — build bitmap from one or more indexes, then fetch rows; useful for AND of multiple conditions.
    - **Nested Loop** — for each outer row, scan inner; fast for small outer or indexed inner.
    - **Hash Join** — build hash from one side, probe with other; fast equi-join for medium-large inputs.
    - **Merge Join** — merge two sorted inputs; fast when both already sorted on join key.
    - **Sort** — sort rows; expensive at scale.
    - **Hash Aggregate** — group-by via hash; in-memory groups.
    - **Group Aggregate** — group-by on sorted input.
    - **Materialize** — materialize intermediate result for repeated access.
    - **CTE Scan** — scan a Common Table Expression result.
    - **Subquery Scan** — scan a subquery's result.

    By response type:
    - **Query rewrite** — reformulate the SQL (predicate pushdown, eliminate correlated subquery, prefer EXISTS over IN, avoid SELECT *).
    - **Add index** — match the query's access pattern.
    - **Refresh statistics** — ANALYZE; raise STATISTICS target on misestimated columns.
    - **Denormalize / materialize** — precompute joined or aggregated state.
    - **Use a materialized view** — for repeatedly-computed expensive queries.
    - **Change isolation** — for contention-bound queries.
    - **Connection-level settings** — work_mem, effective_cache_size, random_page_cost.
    - **Application-side cache** — for read-heavy queries with stable results.
    - **Accept the cost** — for rare queries.

    By root cause:
    - **Cardinality misestimate** — planner expected N rows; got M (M ≫ N or M ≪ N).
    - **Missing index** — the planner used a sequential scan because no index matched.
    - **Wrong join order** — the planner picked a sub-optimal join order.
    - **Wrong join algorithm** — nested loop where hash join would be faster (or vice versa).
    - **Lock contention** — query is fast in isolation, slow under concurrent load.
    - **Stale statistics** — data shifted; planner has old picture.
    - **Schema mismatch** — query is slow because schema is wrong shape (denormalize candidate).
    - **N+1 pattern** — application makes 1+N queries when one with a join would suffice.

    By database:
    - **Postgres** — `EXPLAIN ANALYZE`, `EXPLAIN (ANALYZE, BUFFERS)`, `pg_stat_statements`, `auto_explain`.
    - **MySQL** — `EXPLAIN`, `EXPLAIN ANALYZE` (8.0+), `EXPLAIN FORMAT=JSON`, `performance_schema`.
    - **SQL Server** — `SET STATISTICS PROFILE ON`, actual execution plans, Query Store.
    - **Oracle** — `EXPLAIN PLAN`, `DBMS_XPLAN.DISPLAY_CURSOR`, AWR / ASH.
    - **CockroachDB / Spanner** — vendor-specific plan inspection tools.
  analogy: |
    A library reference desk receiving a research request. The patron asks "give me all books published in 1954 by Tolkien." The librarian could walk every shelf in the library (sequential scan). The librarian could check the author cabinet for Tolkien, then walk through Tolkien's books (index scan on author). The librarian could check the author cabinet for Tolkien and the year cabinet for 1954, intersect the two lists, and fetch the intersection (bitmap scan). The librarian could check a specialized author-and-year cabinet if one exists (composite index scan).

    Which approach the librarian uses depends on which cabinets exist (indexes available) and what the librarian knows about the collection (statistics: are there many Tolkien books? many 1954 books?). A new librarian who doesn't know the collection might walk the shelves (sequential scan) even when better cabinets exist. An experienced librarian who knows the collection chooses the cheapest approach for the specific request.

    EXPLAIN is asking the librarian "tell me how you'd answer this without actually going to find the books." EXPLAIN ANALYZE is asking "actually go find them, and tell me how you did it and how long it took." For diagnosing a slow request, EXPLAIN ANALYZE is the foundation — the librarian's predictions might be wrong, and the actual time tells you where the work went.

    The query planner is the librarian's reasoning. It considers multiple approaches, estimates each one's cost based on what it knows about the collection (statistics), and picks the cheapest. When the statistics are wrong — say, the catalog claims Tolkien has three books but actually has thirty-five — the librarian's cost estimates are wrong, and the chosen approach is wrong.

    Adding an index is building a new cabinet — useful only if patrons frequently ask the kind of question the cabinet serves. Rewriting the query is reformulating the request — "books published in 1954 that were written by Tolkien" might process differently from "Tolkien books published in 1954." Refreshing statistics is the librarian re-counting the collection so cost estimates align with reality.

    The discipline is: read the librarian's report (EXPLAIN ANALYZE), identify where the time actually went (the most expensive plan node), figure out why (missing index, wrong cabinet choice, stale catalog statistics), and apply the right fix (new cabinet, reformulated request, statistics refresh). Reaching for "add a new cabinet" without reading the report is guessing.
  misconception: |
    The most common misconception is that **slow queries are fixed by adding indexes**. Sometimes yes; often the right response is a query rewrite, a statistics refresh, or a schema change. Reaching for indexes before reading EXPLAIN ANALYZE is guessing. The wrong index is pure cost.

    The second misconception is that **EXPLAIN is enough**. EXPLAIN shows the planner's *estimates*; EXPLAIN ANALYZE actually runs the query and reports actual time and rows. For diagnosis, ANALYZE is required — the planner's estimates may be wrong, and the divergence is often where the root cause lives.

    The third misconception is that **the planner choosing sequential scan means it's broken**. Often it's right. Small tables, low-selectivity predicates, queries touching a large fraction of rows — all favor scan. "Why doesn't it use the index" sometimes has the right answer "because scan is faster."

    The fourth misconception is that **stale statistics are rare**. They are routine. Bulk inserts, schema changes, data growth that crosses cost-model thresholds — all can produce stale statistics. ANALYZE before deeper investigation often resolves "the planner is choosing the wrong plan."

    The fifth misconception is that **plan-node cost numbers are time**. They are not. Postgres's `cost` is an abstract unit (roughly normalized to sequential-page reads). `actual time` in EXPLAIN ANALYZE is real time. Cost-vs-time confusion is a common reading error.

    The sixth misconception is that **a query is slow because of one expensive node**. Often there are several. The pattern: an upstream node produces many more rows than the planner estimated, which forces a downstream node to do much more work than expected. The diagnosis is "follow the row counts" — the node where actual rows ≫ estimated is the root cause.

    The seventh misconception is that **rewriting a query is equivalent to changing its semantics**. Semantically-identical queries can produce different plans. EXISTS vs IN, LATERAL vs subquery, JOIN vs WHERE-with-subquery — these often differ in planner-chosen plans even when they should be equivalent. Knowing the planner's preferences is part of the discipline.

    The eighth misconception is that **the slowest query is the most important to fix**. The *most-impactful* query is the most important — high frequency × moderate slowness usually beats low frequency × extreme slowness for aggregate impact. pg_stat_statements ordered by total time (frequency × duration) is the priority list.

    The ninth misconception is that **caching solves slow queries**. Application-side caching is one response, but it has its own costs (invalidation, staleness) and is appropriate only for read-heavy queries with stable results. Cache is a hammer; not every slow query is a nail.

    The tenth misconception is that **query optimization is a one-time exercise**. Data grows; access patterns shift; the planner's choices change with data volume. A query that was fast last year may be slow this year. Periodic review of top queries is the discipline.
---

# Query Optimization

## Coverage

The discipline of diagnosing and tuning specific slow queries by reading the database planner's chosen plan, identifying the root cause, and applying the right response. Covers the query planner's phases (parse → rewrite → plan → execute), the cost model and statistics that drive plan choice, the plan-node catalog (Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan, Nested Loop, Hash Join, Merge Join, Sort, Hash Aggregate, Materialize, CTE Scan), the EXPLAIN and EXPLAIN ANALYZE diagnostic vocabulary, the response catalog (rewrite, add index, refresh statistics, denormalize, materialized view, isolation change, settings, application cache, accept cost), and the root-cause taxonomy that links diagnosis to response.

## Philosophy

Query optimization is largely a reading discipline. The planner exposes its decisions and the database reports the actual cost; the work is reading EXPLAIN ANALYZE output, knowing what each node means, and choosing the right response. A team that reaches for "add an index" before reading the plan is guessing; a team that reads the plan finds the actual issue and applies the right response — often *not* adding an index.

The most common root cause is cardinality misestimation: the planner thinks 100 rows will match, actually 10 million do. The chosen plan optimized for 100 is wrong for 10 million. ANALYZE, raised statistics targets, and (occasionally) extended statistics objects are where most diagnoses live. Adding indexes without addressing the statistics problem produces no improvement.

The discipline distinguishes diagnosis from response. The diagnosis is "what is the root cause of this query's slowness." The response is "what to do about it." The response catalog has many entries; matching diagnosis to the right one is the work.

## The Diagnostic Procedure

```
   ┌───────────────────────────┐
   │ 1. Run EXPLAIN ANALYZE    │
   └───────────────────────────┘
              │
              ▼
   ┌───────────────────────────┐
   │ 2. Find the most-expensive│
   │    plan node (highest     │
   │    actual time)           │
   └───────────────────────────┘
              │
              ▼
   ┌───────────────────────────┐
   │ 3. Compare estimated rows │
   │    vs actual rows         │
   └───────────────────────────┘
              │
              ▼
   ┌───────────────────────────────────────────────────────┐
   │ 4. Choose response based on diagnosis:                │
   │    estimate ≫ actual  → predicate is more selective   │
   │                          than planner thinks; may need│
   │                          extended statistics or       │
   │                          query rewrite                │
   │    estimate ≪ actual  → ANALYZE; raise statistics     │
   │                          target; consider extended    │
   │                          statistics                   │
   │    estimate ≈ actual but slow → access path is wrong; │
   │                          maybe add index, change      │
   │                          join order, rewrite          │
   └───────────────────────────────────────────────────────┘
              │
              ▼
   ┌───────────────────────────┐
   │ 5. Apply response and     │
   │    re-EXPLAIN ANALYZE     │
   └───────────────────────────┘
              │
              ▼
   ┌───────────────────────────┐
   │ 6. Iterate until target   │
   │    is met                 │
   └───────────────────────────┘
```

## The Plan-Node Catalog

| Plan node | What it does | Read as |
|---|---|---|
| Seq Scan | Read every row of a table | Slow for large tables; the planner chose this for a reason — check selectivity |
| Index Scan | Use index to find rows; fetch row | Standard fast access for selective predicates |
| Index Only Scan | Use covering index; no row fetch | The cheapest read access; index includes all needed columns |
| Bitmap Heap Scan | Build bitmap from indexes; fetch matching rows | Good for AND of multiple conditions; less random I/O than nested index scans |
| Nested Loop | For each outer row, scan inner | Fast for small outer or when inner has an index; bad for large outer |
| Hash Join | Build hash from one side; probe with other | Standard fast equi-join for medium-large inputs |
| Merge Join | Merge two sorted inputs | Fast when both are pre-sorted on join key (often after Sort or matching indexes) |
| Sort | Sort rows | Expensive at scale; consider an index or ORDER BY-less query |
| Hash Aggregate | Group-by via hash table | Fast for moderate cardinality groups |
| Group Aggregate | Group-by on sorted input | Used after Sort or matching index |
| Materialize | Materialize intermediate for repeated access | Inserted by planner when sub-result is reused |
| CTE Scan | Scan CTE result | CTE may be optimization fence in older Postgres |

## Response Catalog

| Diagnosis | Right response |
|---|---|
| Sequential scan on large table; predicate is selective | Add index |
| Sequential scan; predicate is poorly selective | Accept (scan is right) or denormalize |
| Index Scan with high `Rows Removed by Filter` | Index doesn't match — partial index or composite |
| Estimated rows ≫ actual | Check if predicate is more selective than planner knows; extended statistics or rewrite |
| Estimated rows ≪ actual | ANALYZE; raise STATISTICS target |
| Nested Loop with large outer | Hint hash join or rewrite to enable hash plan |
| Hash Join with small outer | Should be nested loop with index — check why |
| Many Sort nodes | Add index matching ORDER BY |
| N+1 query pattern (application-side) | Replace with single join query |
| Correlated subquery slow | Rewrite as join or EXISTS |
| Query slow under concurrency, fast solo | Lock contention — check isolation, locking strategy |
| Stale statistics suspected | ANALYZE; consider auto-vacuum tuning |
| Query is fundamentally too much work | Materialized view, precomputed aggregate, schema change |

## Verification

After applying this skill, verify:
- [ ] EXPLAIN ANALYZE is the starting point for every slow-query investigation. Guessing without reading the plan is replaced by reading the plan.
- [ ] The most-expensive plan node is identified and the diagnosis is targeted at that node, not the query as a whole.
- [ ] Estimated rows vs actual rows is checked at every node. Cardinality misestimates are the most common root cause.
- [ ] The response matches the diagnosis. Adding an index is one response of many; the team is not reflexively adding indexes.
- [ ] Slow queries are prioritized by aggregate impact (frequency × duration), not by individual duration alone. pg_stat_statements or equivalent is consulted.
- [ ] Query rewrites are tested for semantic equivalence and plan-shape change. Two queries that "should be equivalent" can produce different plans.
- [ ] Statistics are refreshed (ANALYZE) before deeper investigation when the planner's estimates seem off. Stale statistics are routine after bulk inserts and schema changes.
- [ ] Periodic review of top queries detects regressions caused by data growth. A query that was fast last year may not be this year.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing which indexes the database maintains | `indexing-strategy` | indexing-strategy owns design; this skill diagnoses |
| Designing the schema or entity relationships | `data-modeling` | data-modeling owns design; sometimes the answer is a schema change in its scope |
| Reasoning about how schema changes over time | `schema-evolution` | schema-evolution owns versioning; this owns query-level tuning |
| Choosing isolation level | `transaction-isolation` | transaction-isolation owns concurrency; this owns retrieval performance |
| Horizontal partitioning across nodes | `sharding-strategy` | sharding owns partition; this owns within-shard performance |
| Designing performance tests for the system | `performance-testing` | performance-testing owns measurement under load; this owns single-query tuning |

## Key Sources

- PostgreSQL Global Development Group. ["PostgreSQL Documentation — Performance Tips"](https://www.postgresql.org/docs/current/performance-tips.html) and ["Using EXPLAIN"](https://www.postgresql.org/docs/current/using-explain.html). The canonical reference for Postgres query planning and EXPLAIN interpretation.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Chapter 3 (Storage and Retrieval) covers the storage structures underlying query execution; useful framing for why plans take the shape they do.
- Petrov, A. (2019). *Database Internals*. O'Reilly. Deep treatment of query execution, the cost model, and plan generation.
- Tow, D. (2003). *SQL Tuning*. O'Reilly. The classic practitioner reference on diagnosing slow queries; database-agnostic methodology that applies across systems.
- Winand, M. (2012, ongoing). [*Use The Index, Luke!*](https://use-the-index-luke.com/). The canonical practitioner guide to SQL indexing, with substantial treatment of how indexes interact with the planner.
- Microsoft. ["Query Tuning Assistant and Query Store"](https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store). Reference for SQL Server's query-performance tooling.
- Oracle. ["Query Optimizer Concepts"](https://docs.oracle.com/database/121/TGSQL/tgsql_optcncpt.htm). Reference for Oracle's cost-based optimizer.
- MySQL Reference Manual. ["EXPLAIN Output Format"](https://dev.mysql.com/doc/refman/8.0/en/explain-output.html). MySQL EXPLAIN reference.
- Selinger, P. G., Astrahan, M. M., Chamberlin, D. D., Lorie, R. A., & Price, T. G. (1979). ["Access Path Selection in a Relational Database Management System"](https://dl.acm.org/doi/10.1145/582095.582099). *SIGMOD 1979*. The foundational paper on cost-based query optimization (System R); historical reference for the discipline's origin.
