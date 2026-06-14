---
name: query-optimization
description: "Diagnosing and tuning a specific slow relational-database query from plan evidence: workload impact, exact query context, EXPLAIN / actual execution plans, row-estimate accuracy, access path choice, join order, sort/hash spills, JIT/planning overhead, parameter-sensitive plans, plan regressions, statistics, and rewrite-vs-index-vs-operational response selection. Start from the actual plan and runtime evidence, not from the reflex to add an index; modern engine features such as Query Store, PSP/OPPO, SQL Plan Management, pg_stat_statements, auto_explain, MySQL histograms, Oracle DBMS_XPLAN, and PostgreSQL planner improvements are evidence sources and response tools, not replacements for diagnosis. Do NOT use for designing the durable index portfolio (use indexing-strategy), schema design (use entity-relationship-modeling), distributed partitioning (use sharding-strategy), isolation-level correctness (use transaction-isolation), or whole-system load testing (use performance-testing)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"schema-evolution\",\"indexing-strategy\",\"entity-relationship-modeling\",\"transaction-isolation\",\"replication-patterns\",\"performance-testing\",\"database-migration\"],\"suppresses\":[\"indexing-strategy\"],\"verify_with\":[\"entity-relationship-modeling\",\"indexing-strategy\",\"transaction-isolation\",\"performance-testing\"]}"
  subject: data-engineering
  public: "true"
  scope: "Diagnosing and tuning a specific slow query in a relational database by reading optimizer evidence: workload ranking, exact SQL and parameter context, safe plan capture, estimated-vs-actual rows, access paths, join methods, sort/hash/temporary I/O, memory, buffers, parallelism, JIT/planning overhead, parameter-sensitive plan behavior, plan regressions, statistics quality, and response selection. Portable across PostgreSQL, MySQL, SQL Server, Oracle, and relational engines with a cost-based optimizer. Excludes durable index-portfolio design (indexing-strategy), schema/entity modeling (entity-relationship-modeling), distributed partitioning (sharding-strategy), transaction-correctness isolation choices (transaction-isolation), and whole-system load/performance testing (performance-testing)."
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"query optimization\",\"EXPLAIN ANALYZE\",\"execution plan\",\"query planner\",\"cardinality estimate\",\"parameter sniffing\",\"generic plan\",\"Query Store\",\"pg_stat_statements\",\"slow query\"]"
  triggers: "[\"this query is slow\",\"EXPLAIN ANALYZE output\",\"why isn't the planner using the index\",\"bad row estimate\",\"parameter sniffing\",\"generic vs custom plan\",\"query plan changed\",\"plan regression\",\"sort spilled\",\"slow only in production\"]"
  examples: "[\"diagnose this EXPLAIN ANALYZE BUFFERS output and identify the real bottleneck\",\"this query is fast with a literal but slow from the app with bind parameters\",\"the plan changed after an upgrade and Query Store shows a regression\",\"rewrite this correlated subquery or optional-parameter predicate so the optimizer can use a better plan\",\"decide whether the fix is ANALYZE, extended statistics, a histogram, an index, a rewrite, a materialized view, or accepting the scan\"]"
  anti_examples: "[\"design the index set for a new workload (use indexing-strategy)\",\"choose the database schema and keys (use entity-relationship-modeling)\",\"write the production migration for a new index (use database-migration)\",\"choose isolation levels for correctness (use transaction-isolation)\",\"design a load test for the whole service (use performance-testing)\"]"
  grounding: "{\"subject_matter\":\"portable relational query-plan diagnosis and slow-query tuning\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.postgresql.org/docs/current/sql-explain.html\",\"https://www.postgresql.org/docs/current/using-explain.html\",\"https://www.postgresql.org/docs/current/indexes-index-only-scans.html\",\"https://www.postgresql.org/docs/current/planner-stats.html\",\"https://www.postgresql.org/docs/current/sql-createstatistics.html\",\"https://www.postgresql.org/docs/current/sql-prepare.html\",\"https://www.postgresql.org/docs/current/runtime-config-query.html\",\"https://www.postgresql.org/docs/current/runtime-config-resource.html\",\"https://www.postgresql.org/docs/current/jit-decision.html\",\"https://www.postgresql.org/docs/current/queries-with.html\",\"https://www.postgresql.org/docs/current/pgstatstatements.html\",\"https://www.postgresql.org/docs/current/auto-explain.html\",\"https://www.postgresql.org/docs/release/16.0/\",\"https://www.postgresql.org/docs/release/18.0/\",\"https://www.postgresql.org/about/news/postgresql-19-beta-1-released-3313/\",\"https://www.postgresql.org/docs/19/release-19.html\",\"https://dev.mysql.com/doc/refman/9.7/en/explain.html\",\"https://dev.mysql.com/doc/refman/9.7/en/optimizer-statistics.html\",\"https://dev.mysql.com/doc/refman/9.7/en/analyze-table.html\",\"https://dev.mysql.com/doc/refman/9.7/en/show-profiles.html\",\"https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store\",\"https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization\",\"https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization\",\"https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-hints\",\"https://learn.microsoft.com/en-us/sql/relational-databases/automatic-tuning/automatic-tuning\",\"https://docs.oracle.com/en/database/oracle/oracle-database/26/tgsql/generating-and-displaying-execution-plans.html\",\"https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/overview-of-sql-plan-management.html\",\"https://blogs.oracle.com/optimizer/sql-analysis-report-in-23c-free\"],\"failure_modes\":[\"index_added_before_plan_read\",\"highest_parent_time_misread_as_root_node\",\"analyze_run_unsafely_on_write_statement\",\"text_plan_parsed_when_json_or_xml_tree_available\",\"generic_plan_or_parameter_sniffing_ignored\",\"prepared_statement_plan_differs_from_literal_test\",\"cardinality_misestimation_treated_as_missing_index\",\"stale_or_single_column_stats_left_unfixed\",\"correlated_predicates_missing_extended_statistics\",\"mysql_histogram_syntax_handwaved\",\"non_sargable_predicate_hides_existing_index\",\"partial_index_predicate_not_implied_by_real_parameterized_query\",\"cte_materialization_or_not_materialized_choice_unchecked\",\"sort_or_hash_spill_treated_as_cpu_only_slowness\",\"work_mem_raised_globally_without_concurrency_budget\",\"jit_compilation_overhead_misread_as_execution_work\",\"plan_hint_used_before_stats_and_index_maintenance\",\"automatic_tuning_recommendation_applied_without_workload_verification\",\"plan_regression_after_upgrade_not_baselined\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Query optimization is chart reading for a slow SQL statement: the plan is the chart, estimates are the diagnosis the optimizer made before treatment, actual rows and I/O are the lab results, and the intervention should follow the mismatch rather than the most familiar prescription."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/data-engineering/query-optimization/SKILL.md
---
# Query Optimization

## Concept of the skill

Query optimization is the discipline of diagnosing and tuning one slow SQL query or one repeated query shape by reading the optimizer's evidence. The query planner takes a declarative SQL statement, applies rewrites, estimates cardinalities and costs from statistics and configuration, chooses an execution plan, and executes a tree of plan nodes. Tuning starts by asking: what query shape matters, what plan did the engine choose, what did the engine expect to happen, what actually happened, and what response follows from that mismatch?

The central evidence is not just "the query took 8 seconds." The evidence is the workload impact, exact SQL text, bind values, engine version, compatibility level, schema and indexes, row counts, statistics freshness, session settings, concurrency state, prepared-vs-literal execution path, plan tree, estimated vs actual rows, loops, buffers or reads, temp I/O, memory, WAL, JIT/planning timing, waits, and plan history. Modern engines also expose workload stores and adaptive features: PostgreSQL has `pg_stat_statements`, `auto_explain`, JSON/XML/YAML EXPLAIN, generic/custom plan controls, extended statistics, PostgreSQL 18 skip scan and asynchronous I/O, and PostgreSQL 19 beta plan-advice and IO visibility; SQL Server has Query Store, Query Store hints, automatic plan correction, PSP, OPPO, CE/DOP/memory grant feedback; MySQL exposes EXPLAIN ANALYZE, TREE/JSON plans, Performance Schema, optimizer trace, and histograms; Oracle exposes actual cursor plans through `DBMS_XPLAN`, AWR/SQL Monitor, SQL Plan Management, and SQL Analysis Report advice where available.

The response catalog is larger than "add an index." Possible responses include refreshing statistics, raising statistics targets, creating extended statistics or histograms, rewriting predicates to be sargable, changing CTE materialization, handling a generic/parameter-sensitive plan, replacing an N+1 pattern, changing join shape, tuning sort/hash memory carefully, disabling or retuning PostgreSQL JIT for short queries where compilation dominates execution, using an engine plan-management tool, adding or changing an index, changing the data model, precomputing, materializing, caching, fixing lock contention, or accepting the cost because the scan is correct.

## Coverage

The discipline of diagnosing and tuning specific slow relational queries by reading actual plan evidence and matching the response to the root cause. Covers:

- Workload triage: prioritize by aggregate impact, such as calls times mean or percentile duration, total reads, temp I/O, and regression impact, not by the worst single execution alone.
- Safe plan capture: when to use EXPLAIN, EXPLAIN ANALYZE, actual execution plans, Query Store, `pg_stat_statements`, `auto_explain`, `DBMS_XPLAN`, SQL Monitor, MySQL EXPLAIN ANALYZE, Performance Schema, or slow logs; how to avoid side effects for DML.
- Plan-tree reading: estimates, actual rows, loops, inclusive vs local work, buffers/reads, temp I/O, memory, WAL, JIT/planning timing, rows removed, heap fetches, hash batches, sort spills, parallel workers, and settings.
- Root-cause taxonomy: cardinality misestimation, stale statistics, correlated predicates, parameter-sensitive plans, generic prepared plans, non-sargable predicates, wrong access path, wrong join method, sort/hash spill, JIT compilation overhead, materialization, N+1, locks/waits, plan regression, and too much work.
- Response selection: rewrite, ANALYZE/statistics target, extended statistics/histograms, index handoff, materialized view/precomputation, plan-management tool, memory/DOP or JIT tuning, isolation/lock investigation, schema handoff, application cache, or accept cost.
- Engine-specific adapters for PostgreSQL, MySQL, SQL Server, and Oracle without turning the skill into a vendor-only manual.

## Philosophy of the skill

Query optimization is mostly a reading discipline. The optimizer already tells you what it planned and, with actual execution instrumentation, what happened. A team that adds an index before reading the plan is guessing. A team that reads the plan may still add an index, but only after proving that the access path is the bottleneck and that the index is a durable response rather than a local patch.

The most common serious failure is still cardinality misestimation: the optimizer thinks a node will return 100 rows and it returns 10 million, or the reverse. Plans chosen for small row counts are bad for huge row counts, and vice versa. The right response is often `ANALYZE`, a higher statistics target, multivariate/extended statistics, MySQL histograms, SQL Server CE feedback, or a predicate rewrite. Adding an index without fixing the model may change nothing.

Modern optimizers are smarter than static rules. PostgreSQL 18 can use skip scan on some multicolumn B-tree indexes that older versions would ignore, and PostgreSQL 19 beta adds more optimizer and EXPLAIN visibility. SQL Server can maintain multiple plans for parameter-sensitive and optional-parameter cases. Oracle can preserve known-good plans and surface diagnostic advice. These features reduce some manual tuning, but they also make diagnosis more evidence-dependent: know the engine version, compatibility level, enabled features, and plan-management state before deciding what the plan means.

## Evidence Capture Ladder

Use this ladder before proposing a fix:

1. **Rank the query by workload impact.** Use `pg_stat_statements`, SQL Server Query Store, MySQL Performance Schema / sys schema / slow query log, Oracle AWR/SQL Monitor, or application traces. Prioritize total time, tail latency, execution count, reads, temp I/O, and regression impact.
2. **Capture the exact execution context.** Record engine/version, compatibility level, schema and relevant indexes, row counts, statistics freshness, parameter values, prepared statement behavior, session settings, transaction isolation, concurrency conditions, and whether the slow case is production-only.
3. **Capture a safe actual plan.** For pure `SELECT`, prefer actual runtime plans. In PostgreSQL, use `EXPLAIN (ANALYZE, BUFFERS, SETTINGS, WAL, MEMORY, FORMAT JSON)` when available; add PostgreSQL 19 beta `IO` only when testing AIO behavior on a beta system. For DML, remember that `EXPLAIN ANALYZE` executes the statement; use a transaction plus rollback, a safe replica, staging data, or plain EXPLAIN when side effects cannot be allowed.
4. **Use structured output for tooling.** Prefer JSON/XML/YAML/TREE plan output when an agent or script will inspect the plan, choosing the engine's structured explain format where available. Text-only plans are useful for humans but brittle for automation.
5. **Compare estimates to reality at every node.** Large estimate/actual divergence is the first diagnostic branch.
6. **Read the tree, not just the biggest number.** Parent node times and buffers can include child work; repeated inner nodes multiply by `loops`; a top-level node is often expensive because its children are. A useful approximation for a node's total work is per-loop time times loops; local/exclusive work subtracts child totals, but prefer structured plan tools when precision matters.
7. **Choose one response at a time and re-measure.** Apply the smallest response that follows from the evidence, re-run the same representative plan, and check adjacent regressions.
8. **Hand off durable changes.** Index portfolio changes go through indexing-strategy; schema/materialized-view changes go through entity-relationship-modeling and database-migration; isolation/lock correctness goes through transaction-isolation.

## Quick Diagnostic Flow

```text
Rank workload impact
  -> Capture exact context
  -> Capture a safe actual plan
  -> Walk the plan tree
  -> Compare estimates vs actuals
  -> Inspect I/O, temp, memory, waits, JIT, and loops
  -> Choose the smallest evidence-backed response
  -> Re-measure the same representative case
  -> Check adjacent regressions and hand off durable changes
```

## The Diagnostic Procedure

1. **State the symptom in measurable terms.** Include runtime, p95/p99 or mean, calls, total time, rows returned, rows scanned, reads/buffers, temp I/O, and whether the issue is new or long-standing.
2. **Get the actual plan for the representative case.** Use the same parameter values, data distribution, session settings, engine version, compatibility level, and prepared/literal path the application uses.
3. **Walk the plan top-down and branch on estimates.**
   - Estimate much less than actual: the planner underestimated work. Refresh stats, raise stats target, add extended/multivariate stats, add histograms, check parameter sensitivity, check stale partitions, and inspect correlated predicates.
   - Estimate much greater than actual: the planner overestimated work. Check stale stats, overly broad predicates, type/collation mismatch, missing constraints, and opportunities to expose selectivity.
   - Estimate roughly equals actual but slow: the planner understood the work, and the chosen access path, join method, sort/hash memory, I/O, wait state, or amount of work is the issue.
4. **Inspect access paths.** Confirm whether a scan is actually wrong. A sequential/table scan on a low-selectivity predicate or small table is often correct. An ignored index may be explained by low selectivity, function-wrapped columns, casts, collation/operator mismatch, partial-index predicate mismatch, generic prepared plans, version-specific skip-scan behavior, or stale stats.
5. **Inspect joins and loops.** A nested loop is good for a small outer side and indexed inner lookup; it is bad when a large outer side causes millions of inner probes. A hash join is good for many equi-joins but can spill. A merge join needs sorted inputs and may be good when sort order already exists. A right anti join variant usually means the optimizer swapped sides for cost or memory; read it as an anti-join plan shape, not as a SQL rewrite rule.
6. **Inspect memory, temp, parallelism, waits, and compilation overhead.** Sort or hash spills, high temp reads/writes, many hash batches, low or excessive DOP, poor memory grants, lock waits, and PostgreSQL JIT timing that dominates short-query execution are separate root causes from missing indexes.
7. **Inspect parameter and plan-cache behavior.** If the query is fast with one literal but slow from the application, test generic vs custom plans, bind values, SQL Server parameter sniffing/PSP/OPPO behavior, and Oracle bind-aware cursor behavior.
8. **Inspect plan history.** If performance regressed after deploy, upgrade, stats refresh, index change, or data growth, compare old and new plans through Query Store, AWR, saved JSON/XML plans, SQL Plan Management, or monitoring.
9. **Choose the response and verify.** Re-run the same representative plan and workload query. Confirm the chosen node changed, estimated/actual rows improved, latency and reads improved, and no adjacent query regressed.

## How to Read the Plan

| Evidence | What to ask | Typical diagnosis |
|---|---|---|
| Estimated rows vs actual rows | Where does the first large divergence appear? | Statistics, correlation, parameter sensitivity, stale partition stats, missing constraints |
| `loops` | Is a cheap inner node repeated thousands or millions of times? | Nested loop explosion, N+1-like shape, bad join order |
| Actual time | Is this inclusive parent time or local node work? | Use tree shape and tooling; do not equate top node time with root cause |
| Buffers / reads / I/O | Is the query CPU-bound, cache-bound, or storage-bound? | Missing access path, too much data, cold cache, sequential/bitmap scan cost |
| Temp reads/writes | Did sort, hash, or materialization spill? | Memory grant / work_mem / grouping strategy / ORDER BY response |
| Rows Removed by Filter | Did the engine fetch many rows and discard them late? | Mismatched index, predicate not pushed down, non-sargable filter |
| Heap Fetches | Did an index-only scan still visit the table? | Visibility map/vacuum issue; covering benefit not real |
| Hash batches / memory | Did a hash join or aggregate overflow memory? | Bad estimate, memory setting, pre-aggregation, different join/aggregate strategy |
| Planning vs execution time | Is repeated compilation the bottleneck? | Prepared statements, plan cache, optimized plan forcing, query shape simplification |
| PostgreSQL JIT timing | Does JIT generation/inlining/optimization/emission time dwarf execution time for a short OLTP query? | Disable `jit`, raise JIT cost thresholds, or leave JIT for analytical queries where execution savings exceed compilation cost |
| Settings and compatibility level | Did a session, compatibility level, or upgrade change planner behavior? | Regression, feature gate, hint/plan guide, database compatibility level |
| Waits and locks | Is the query fast alone but slow under concurrency? | Blocking, lock contention, vacuum/dead tuple pressure, isolation interaction, pool saturation |

## The Plan-Node Catalog

| Plan node | What it does | Read as |
|---|---|---|
| Seq Scan / Table Scan | Reads every row in a table or partition | Correct for small tables or low-selectivity predicates; suspicious for large selective predicates |
| Index Scan / Index Seek | Uses index to locate rows, then fetches base rows | Good for selective predicates; check late filters and random I/O |
| Index Only Scan / Covering Seek | Uses index without base-row fetch when visibility/coverage allows | Best read path when heap/base fetches are low; in PostgreSQL check `Heap Fetches` and visibility map state |
| Bitmap Index Scan + Bitmap Heap Scan | Builds row-location bitmap, then fetches pages | Good for medium selectivity or AND/OR combinations; check lossy rechecks and heap blocks |
| B-tree Skip Scan / Index Skip Scan | Uses a multicolumn index even when a leading column is not constrained, by repeatedly seeking distinct leading values | Useful only for specific low-cardinality-leading-column cases; verify engine/version and EXPLAIN rather than assuming leftmost-prefix folklore |
| Nested Loop | For each outer row, execute inner lookup/scan | Fast for small outer side and indexed inner; explosive for large outer side |
| Hash Join | Build hash table from one side, probe with other | Good for medium/large equi-joins; check hash batches, memory, and spills |
| Merge Join | Merge sorted inputs on join key | Good when inputs are already sorted or sort cost is paid once |
| Semi Join / Anti Join | Tests existence or non-existence | Often produced by `EXISTS`, `IN`, `NOT EXISTS`, `NOT IN`; NULL semantics matter |
| Hash Right Anti Join / right anti variant | Anti-join with sides swapped by the optimizer | PostgreSQL 16+ can expose right anti variants; read memory/build side and preserved side carefully, not as a separate SQL syntax to force |
| Adaptive Join | SQL Server can defer join choice until runtime for eligible batch-mode plans | Handles cardinality uncertainty, but still needs row estimates and actual execution evidence |
| Sort | Sorts rows | Expensive at scale; check incremental sort, top-N, memory, and temp spills |
| Incremental Sort | Sorts within already-presorted groups | Good when prefix order exists; sensitive to row estimates and input order |
| Hash Aggregate | Groups through hash table | Good for moderate grouping; check memory and spill batches |
| Group Aggregate | Groups sorted input | Good when sorted order already exists or sort is cheaper than hashing |
| Materialize | Stores intermediate rows for reuse | Can be good reuse or accidental work; check size, loops, and spill |
| Memoize | Caches repeated parameterized inner lookups | Good when repeated keys occur; check hit/miss estimates and actuals where available |
| CTE Scan | Scans a common table expression result | In current PostgreSQL, single-use side-effect-free CTEs can be folded; multiple references or `MATERIALIZED` can fence predicate pushdown |
| Gather / Gather Merge | Combines parallel worker output | Check worker count, skew, leader work, and whether parallelism helped |
| Limit / Top-N | Stops after enough rows | Can choose startup-cost plans; good for true row goals, bad when the row goal is accidental or later expanded |

## Root Cause to Response Catalog

| Diagnosis | Right response |
|---|---|
| Query has high aggregate impact | Tune it before a rarer long query; use workload stats, not anecdotes |
| Sequential/table scan on large table and predicate is selective | Handoff to indexing-strategy for an index candidate; verify with EXPLAIN before and after |
| Sequential/table scan and predicate is not selective | Accept the scan, reduce returned rows, precompute, partition, remodel, or cache; an index may not help |
| Existing index ignored | Check selectivity, stale stats, function/cast/collation mismatch, wrong operator, partial predicate implication, generic plan, and version-specific skip-scan behavior |
| Index scan has high rows removed by filter | Index shape does not match the query; consider composite/partial/expression index through indexing-strategy or rewrite predicate |
| Estimate much less than actual | `ANALYZE`; raise statistics target; add extended statistics / histograms; check correlated predicates and stale partition stats |
| Estimate much greater than actual | Refresh stats; expose constraints/selectivity; check type mismatch; rewrite predicate |
| Correlated predicates misestimated | PostgreSQL extended statistics, SQL Server CE feedback/hints as last resort, MySQL histograms, or schema/model change |
| MySQL histogram needed | Use full syntax such as `ANALYZE TABLE tbl UPDATE HISTOGRAM ON col WITH N BUCKETS AUTO UPDATE`; `AUTO UPDATE` is valid in MySQL 9.7 only as part of `UPDATE HISTOGRAM ... [{MANUAL | AUTO} UPDATE]` |
| Literal fast but parameterized app query slow | Investigate generic vs custom plan, parameter sniffing, PSP/OPPO, bind peeking, dynamic SQL, `OPTION (RECOMPILE)`, or plan-cache settings |
| Optional-parameter predicate such as `col = @p OR @p IS NULL` is slow | On SQL Server 2025+ / Azure SQL check OPPO eligibility; otherwise split query shapes or use dynamic SQL so seek and scan cases have different plans |
| Nested Loop with large outer side | Fix upstream estimate, add/adjust inner access path, rewrite to enable hash/merge, or change join order only as measured last resort |
| Hash Join spills or has many batches | Fix estimates, increase appropriate memory grant/work_mem carefully, pre-filter, pre-aggregate, or change join strategy |
| Sort spills to temp | Add order-compatible index through indexing-strategy, reduce rows before sort, use top-N/LIMIT shape, tune memory carefully, or accept if rare |
| PostgreSQL JIT compilation time dominates a short OLTP query | Test `SET jit = off` for the representative case; if it wins, disable JIT for that workload or raise `jit_above_cost` / related thresholds, while retaining JIT for analytical queries that benefit |
| Many Sort nodes | Check whether ORDER BY/GROUP BY can use existing order, incremental sort, or a deliberate index; avoid sorting data you later discard |
| CTE or derived table blocks pushdown | For PostgreSQL, test `NOT MATERIALIZED` for side-effect-free CTEs that should be folded; test `MATERIALIZED` when reuse prevents repeated expensive work |
| Correlated subquery slow | Rewrite as `EXISTS`, semi-join, join plus aggregate, or lateral join as appropriate; verify semantic equivalence |
| N+1 application query pattern | Replace with one set-based query, batched lookup, or data-loader pattern; query optimization can diagnose but app code owns the fix |
| Query slow only under concurrency | Check wait events, locks, blocking, isolation, dead tuples/vacuum, and connection pool saturation; hand off correctness to transaction-isolation |
| Plan regression after upgrade, stats refresh, or index change | Compare plan history; use Query Store / SQL Plan Management / saved plans; force known-good plan only while root cause is fixed |
| Hint seems necessary | Treat hints, plan guides, Query Store hints, and plan advice as last-resort evidence-backed controls; revisit after upgrades, data growth, and compatibility changes |
| Query fundamentally scans/joins/aggregates too much | Materialized view, precomputed aggregate, denormalization, partitioning/sharding, data-model change, or application cache |

## Query Rewrite Patterns

- **Make predicates sargable.** Avoid wrapping indexed columns in functions, implicit casts, mismatched collations, leading wildcards, broad OR conditions, or type mismatches when a clearer predicate shape is possible.
- **Split incompatible shapes.** A single query that must serve "all rows" and "one selective value" may force one bad reusable plan. Split scan and seek cases when the engine cannot do it automatically.
- **Use `EXISTS` for existence.** `EXISTS` / semi-join shapes often express intent better than join-plus-distinct or correlated row-by-row tests.
- **Push filters earlier when semantics allow.** Reduce rows before joins, sorts, and aggregates. Verify that rewrite preserves NULL and duplicate semantics.
- **Be precise with CTEs.** In current PostgreSQL, side-effect-free single-use CTEs can be folded into the parent query; multiply referenced or `MATERIALIZED` CTEs can block predicate pushdown. Use `NOT MATERIALIZED` only when duplicate work is acceptable.
- **Avoid accidental row goals.** `LIMIT`, `TOP`, `EXISTS`, and cursor patterns can favor startup-cost plans that are great for a few rows and bad when the row goal is wrong.
- **Preserve semantic equivalence.** Every rewrite must be checked for NULL behavior, duplicate rows, aggregation level, transaction visibility, and ordering assumptions.

## Modern Engine Features and Upstream Displacement Check

No current upstream release makes this skill obsolete. The trend is partial automation and richer evidence.

- **PostgreSQL 18 (current stable docs in this pass)** adds asynchronous I/O that can change sequential/bitmap scan performance, `pg_upgrade` retention of optimizer statistics, and B-tree skip scan that lets some multicolumn indexes be used when older versions would not. Do not apply old leftmost-prefix conclusions without checking engine version and EXPLAIN. PostgreSQL JIT is primarily beneficial for long-running CPU-bound analytical queries; if EXPLAIN shows JIT generation/emission time dominating a short query, test `jit = off` or higher JIT thresholds before changing indexes.
- **PostgreSQL 19 Beta 1 (released 2026-06-04, not production guidance)** previews planner improvements, `pg_plan_advice` / `pg_stash_advice`, `EXPLAIN ANALYZE IO`, Memoize estimates in EXPLAIN, more optimizer rewrites including anti-join improvements, and JIT off by default. Treat this as test evidence and future-facing source until GA.
- **SQL Server 2022/2025 and Azure SQL** move more tuning into Query Store and Intelligent Query Processing: PSP handles non-uniform parameter values, OPPO handles optional-parameter NULL-vs-not-NULL plan choices, CE/DOP/memory feedback improve repeated queries, Query Store hints shape plans without app-code edits, and automatic plan correction can force a last known good plan. These features address specific classes; they still require workload baselines, correctness checks, and hint debt review.
- **MySQL 9.7 current manuals** expose EXPLAIN ANALYZE in TREE/JSON form, Performance Schema profiling, slow logs, and histogram statistics. `SHOW PROFILE` / `SHOW PROFILES` are deprecated. Histograms can improve row estimates without write-time index overhead, but they are statistics objects with explicit `UPDATE HISTOGRAM` / `DROP HISTOGRAM` management and optional `AUTO UPDATE` behavior.
- **Oracle** distinguishes explained plans from actual cursor plans. Use `DBMS_XPLAN.DISPLAY_CURSOR`, SQL Monitor, AWR, and plan-related views for actual execution context; use SQL Plan Management for plan-regression control. Oracle SQL Analysis Report advice in DBMS_XPLAN/SQL Monitor is useful when available, but treat it as diagnostic advice to verify against actual plans, not as an autonomous fix.

## Verification

After applying this skill, verify:

- [ ] The query was prioritized by aggregate workload impact, not only by the most dramatic single execution.
- [ ] The plan came from the representative query shape: same bind values, data distribution, session settings, engine version, compatibility level, and prepared/literal path as the slow case.
- [ ] `EXPLAIN ANALYZE` or actual-plan capture was used safely; DML was not executed destructively outside rollback/staging controls.
- [ ] Structured plan output such as JSON/XML/YAML/TREE was used when an agent/script inspected the plan.
- [ ] Estimated rows vs actual rows was checked at every node, and the first major divergence was identified.
- [ ] The plan tree was read with loops, child-inclusive work, buffers/reads, temp I/O, memory, WAL, rows removed, heap fetches, hash batches, sort spills, parallel workers, and waits.
- [ ] Index-only scan claims were checked against heap fetches / visibility-map or engine-equivalent evidence.
- [ ] PostgreSQL JIT timing was checked when compilation appears in EXPLAIN output or planning/compilation time dominates a short query.
- [ ] Parameter-sensitive behavior was checked when literals and bind-parameter executions differ.
- [ ] Temp-file or spill responses accounted for row reduction, estimate fixes, and per-query memory budgeting before raising global memory settings.
- [ ] The response matches the diagnosis; "add an index" is only one response.
- [ ] Query rewrites were tested for semantic equivalence and plan-shape change.
- [ ] Statistics refresh or richer statistics were tried before deeper surgery when estimates were wrong.
- [ ] Engine-specific automation and hints were treated as candidate responses, not as proof; any forced plan, hint, plan advice, or SQL Analysis Report recommendation has an owner and review trigger.
- [ ] Durable index, schema, migration, isolation, or load-test work was handed to the appropriate adjacent skill.
- [ ] The query was re-measured after the change, and adjacent regressions were checked.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing which indexes the database should maintain | `indexing-strategy` | This skill diagnoses one query; indexing-strategy owns durable index portfolio tradeoffs |
| Writing the production DDL to add/drop the chosen index | `database-migration` | Migration owns locks, online build options, rollback, and deployment safety |
| Designing schema, entity relationships, denormalization, or materialized views | `entity-relationship-modeling` | Query optimization may diagnose the need, but entity-relationship-modeling owns the model |
| Reasoning about schema changes over time | `schema-evolution` | Schema-evolution owns versioning and lifecycle |
| Choosing isolation level for correctness | `transaction-isolation` | Isolation owns concurrency correctness; this skill only flags waits/locks as a performance symptom |
| Horizontal partitioning across nodes | `sharding-strategy` | Sharding owns cross-node partitioning; this owns within-query plan diagnosis |
| Designing whole-system performance tests | `performance-testing` | Performance-testing owns load shape and system behavior; this diagnoses query plans |

## Key Sources

- PostgreSQL Global Development Group. "EXPLAIN" and "Using EXPLAIN": https://www.postgresql.org/docs/current/sql-explain.html and https://www.postgresql.org/docs/current/using-explain.html. Provenance: official PostgreSQL reference for EXPLAIN options, safe ANALYZE use, structured output, plan tree interpretation, buffers, rows removed, and node examples.
- PostgreSQL Global Development Group. "Index-Only Scans and Covering Indexes": https://www.postgresql.org/docs/current/indexes-index-only-scans.html. Provenance: official reference for visibility-map caveats and heap visits during index-only scans.
- PostgreSQL Global Development Group. "Statistics Used by the Planner" and "CREATE STATISTICS": https://www.postgresql.org/docs/current/planner-stats.html and https://www.postgresql.org/docs/current/sql-createstatistics.html. Provenance: official reference for statistics, extended statistics, functional dependencies, n-distinct, and MCV lists.
- PostgreSQL Global Development Group. "PREPARE" and "Query Planning": https://www.postgresql.org/docs/current/sql-prepare.html and https://www.postgresql.org/docs/current/runtime-config-query.html. Provenance: official reference for generic vs custom plans, `plan_cache_mode`, Memoize, and Incremental Sort planner controls.
- PostgreSQL Global Development Group. "Resource Consumption": https://www.postgresql.org/docs/current/runtime-config-resource.html. Provenance: official reference for `work_mem`, sort/hash memory, hash memory multiplier, and concurrency multiplication.
- PostgreSQL Global Development Group. "When to JIT?": https://www.postgresql.org/docs/current/jit-decision.html. Provenance: official reference for when JIT helps or hurts, EXPLAIN JIT timing, `jit`, and JIT cost thresholds.
- PostgreSQL Global Development Group. "WITH Queries": https://www.postgresql.org/docs/current/queries-with.html. Provenance: official current CTE folding/materialization rules.
- PostgreSQL Global Development Group. "pg_stat_statements" and "auto_explain": https://www.postgresql.org/docs/current/pgstatstatements.html and https://www.postgresql.org/docs/current/auto-explain.html. Provenance: official reference for workload ranking and automatic slow-plan capture.
- PostgreSQL Global Development Group. "PostgreSQL 16 Release Notes": https://www.postgresql.org/docs/release/16.0/. Provenance: official release-note evidence for anti-join and parallel hash-join planner changes.
- PostgreSQL Global Development Group. "PostgreSQL 18 Release Notes": https://www.postgresql.org/docs/release/18.0/. Provenance: official current-stable release notes for AIO, optimizer-stat retention, and B-tree skip scan.
- PostgreSQL Global Development Group. "PostgreSQL 19 Beta 1 Released" and "PostgreSQL 19 Release Notes": https://www.postgresql.org/about/news/postgresql-19-beta-1-released-3313/ and https://www.postgresql.org/docs/19/release-19.html. Provenance: official beta source for future-facing upstream-displacement check; beta, not production guidance.
- MySQL Reference Manual. "EXPLAIN Statement," "Optimizer Statistics," "ANALYZE TABLE Statement," and "SHOW PROFILES Statement": https://dev.mysql.com/doc/refman/9.7/en/explain.html, https://dev.mysql.com/doc/refman/9.7/en/optimizer-statistics.html, https://dev.mysql.com/doc/refman/9.7/en/analyze-table.html, and https://dev.mysql.com/doc/refman/9.7/en/show-profiles.html. Provenance: official MySQL current manual for EXPLAIN ANALYZE TREE/JSON, histograms including `AUTO UPDATE`, and SHOW PROFILE deprecation.
- Microsoft Learn. "Monitor performance by using the Query Store": https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store. Provenance: official SQL Server reference for workload history, plan regressions, and plan forcing.
- Microsoft Learn. "Parameter Sensitive Plan Optimization," "Optional Parameter Plan Optimization," "Query Store hints," and "Automatic tuning": https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization, https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization, https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-hints, and https://learn.microsoft.com/en-us/sql/relational-databases/automatic-tuning/automatic-tuning. Provenance: official SQL Server sources for PSP, OPPO, hints, and automatic plan correction.
- Oracle Help Center. "Explaining and Displaying Execution Plans" and "Overview of SQL Plan Management": https://docs.oracle.com/en/database/oracle/oracle-database/26/tgsql/generating-and-displaying-execution-plans.html and https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/overview-of-sql-plan-management.html. Provenance: official Oracle sources for explained-vs-actual plan distinction, DBMS_XPLAN display functions, cursor/AWR views, and SQL Plan Management.
- Oracle Optimizer Blog. "New SQL Analysis Report in Oracle Database 23c Free!": https://blogs.oracle.com/optimizer/sql-analysis-report-in-23c-free. Provenance: Oracle-authored source for SQL Analysis Report in DBMS_XPLAN and SQL Monitor; used to qualify, not overstate, advisory Oracle SQL Analysis Report claims.
- Selinger, P. G., Astrahan, M. M., Chamberlin, D. D., Lorie, R. A., and Price, T. G. (1979). "Access Path Selection in a Relational Database Management System": https://dl.acm.org/doi/10.1145/582095.582099. Provenance: foundational System R cost-based optimization paper.
- Tow, D. (2003). SQL Tuning. O'Reilly. Provenance: classic database-agnostic practitioner methodology for SQL tuning.
- Petrov, A. (2019). Database Internals. O'Reilly. Provenance: deeper storage and execution-model background.
- Kleppmann, M. (2017). Designing Data-Intensive Applications. O'Reilly. Provenance: storage/retrieval and data-system framing behind plan shapes.
- Winand, M. Use The Index, Luke!: https://use-the-index-luke.com/. Provenance: practitioner guide for how index shape interacts with query plans; use as secondary explanation beside vendor docs.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `data-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: Diagnosing and tuning a specific slow query in a relational database by reading optimizer evidence: workload ranking, exact SQL and parameter context, safe plan capture, estimated-vs-actual rows, access paths, join methods, sort/hash/temporary I/O, memory, buffers, parallelism, JIT/planning overhead, parameter-sensitive plan behavior, plan regressions, statistics quality, and response selection. Portable across PostgreSQL, MySQL, SQL Server, Oracle, and relational engines with a cost-based optimizer. Excludes durable index-portfolio design (indexing-strategy), schema/entity modeling (entity-relationship-modeling), distributed partitioning (sharding-strategy), transaction-correctness isolation choices (transaction-isolation), and whole-system load/performance testing (performance-testing).

**When to use**
- diagnose this EXPLAIN ANALYZE BUFFERS output and identify the real bottleneck
- this query is fast with a literal but slow from the app with bind parameters
- the plan changed after an upgrade and Query Store shows a regression
- rewrite this correlated subquery or optional-parameter predicate so the optimizer can use a better plan
- decide whether the fix is ANALYZE, extended statistics, a histogram, an index, a rewrite, a materialized view, or accepting the scan
- Triggers: `this query is slow`, `EXPLAIN ANALYZE output`, `why isn't the planner using the index`, `bad row estimate`, `parameter sniffing`, `generic vs custom plan`, `query plan changed`, `plan regression`, `sort spilled`, `slow only in production`

**Not for**
- design the index set for a new workload (use indexing-strategy)
- choose the database schema and keys (use entity-relationship-modeling)
- write the production migration for a new index (use database-migration)
- choose isolation levels for correctness (use transaction-isolation)
- design a load test for the whole service (use performance-testing)

**Related skills**
- Verify with: `entity-relationship-modeling`, `indexing-strategy`, `transaction-isolation`, `performance-testing`
- Related: `schema-evolution`, `indexing-strategy`, `entity-relationship-modeling`, `transaction-isolation`, `replication-patterns`, `performance-testing`, `database-migration`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Query optimization is chart reading for a slow SQL statement: the plan is the chart, estimates are the diagnosis the optimizer made before treatment, actual rows and I/O are the lab results, and the intervention should follow the mismatch rather than the most familiar prescription.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.postgresql.org/docs/current/sql-explain.html`, `https://www.postgresql.org/docs/current/using-explain.html`, `https://www.postgresql.org/docs/current/indexes-index-only-scans.html`, `https://www.postgresql.org/docs/current/planner-stats.html`, `https://www.postgresql.org/docs/current/sql-createstatistics.html`, `https://www.postgresql.org/docs/current/sql-prepare.html`, `https://www.postgresql.org/docs/current/runtime-config-query.html`, `https://www.postgresql.org/docs/current/runtime-config-resource.html`, `https://www.postgresql.org/docs/current/jit-decision.html`, `https://www.postgresql.org/docs/current/queries-with.html`, `https://www.postgresql.org/docs/current/pgstatstatements.html`, `https://www.postgresql.org/docs/current/auto-explain.html`, `https://www.postgresql.org/docs/release/16.0/`, `https://www.postgresql.org/docs/release/18.0/`, `https://www.postgresql.org/about/news/postgresql-19-beta-1-released-3313/`, `https://www.postgresql.org/docs/19/release-19.html`, `https://dev.mysql.com/doc/refman/9.7/en/explain.html`, `https://dev.mysql.com/doc/refman/9.7/en/optimizer-statistics.html`, `https://dev.mysql.com/doc/refman/9.7/en/analyze-table.html`, `https://dev.mysql.com/doc/refman/9.7/en/show-profiles.html`, `https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store`, `https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization`, `https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization`, `https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-hints`, `https://learn.microsoft.com/en-us/sql/relational-databases/automatic-tuning/automatic-tuning`, `https://docs.oracle.com/en/database/oracle/oracle-database/26/tgsql/generating-and-displaying-execution-plans.html`, `https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/overview-of-sql-plan-management.html`, `https://blogs.oracle.com/optimizer/sql-analysis-report-in-23c-free`

**Keywords**
- `query optimization`, `EXPLAIN ANALYZE`, `execution plan`, `query planner`, `cardinality estimate`, `parameter sniffing`, `generic plan`, `Query Store`, `pg_stat_statements`, `slow query`

<!-- skill-graph-context:end -->
