---
name: indexing-strategy
description: "Use when designing or auditing the maintained index set for a database workload: choosing index structures, matching access patterns, setting composite order, balancing read speed against write/storage cost, and deciding when to add, keep, or drop indexes. Do NOT use for tuning one slow query (use query-optimization), applying production DDL (use database-migration), isolation choices, schema design, or sharding. Do NOT use for choose a database schema (use data-modeling). Do NOT use for decide how to partition data across nodes (use sharding-strategy)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"transaction-isolation\",\"query-optimization\",\"data-modeling\",\"schema-evolution\",\"connection-pooling\",\"database-migration\"],\"suppresses\":[\"query-optimization\",\"schema-evolution\",\"sharding-strategy\"],\"verify_with\":[\"data-modeling\",\"query-optimization\",\"database-migration\"]}"
  subject: data-engineering
  public: "true"
  scope: "Use when designing the maintained index set for a relational, document, search, vector, or LSM-backed database: the index-as-precomputed-search-structure mental model, the catalog of structures (B-tree, hash, bitmap, GIN, GiST, SP-GiST, BRIN, LSM-tree, Bloom, columnstore, and vector/ANN indexes such as HNSW and IVFFlat), the matching of structures to access patterns (equality, range, prefix, contains, geospatial, overlap-exclusion, analytic scan, vector similarity), composite indexes and column order (equality/sort/range, NOT 'most selective first'), covering / INCLUDE indexes, partial / filtered indexes, expression indexes, hidden/invisible and hypothetical/advisor-tested indexes, index usage monitoring and bloat, the maintenance cost and lifecycle of every index (write amplification, storage, lock impact), and the rules for when to add an index, when not to, and when to drop one. Do NOT use for tuning a slow query (use query-optimization), safely applying a concrete production index migration (use database-migration), choosing isolation levels (use transaction-isolation), schema design (use data-modeling), or distributed-data partitioning (use sharding-strategy)."
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"indexing\",\"B-tree\",\"GIN\",\"GiST\",\"BRIN\",\"composite index\",\"partial index\",\"covering index\",\"vector index\",\"HNSW\"]"
  triggers: "[\"should I add an index\",\"which columns to index\",\"B-tree vs hash\",\"is this index being used\",\"composite index column order\",\"HNSW vs IVFFlat\",\"drop unused index\",\"index bloat\"]"
  examples: "[\"design indexes for a table with high-volume reads on user_id and date-range queries\",\"choose column order for a compound index that filters by tenant_id, sorts by created_at, and ranges over status\",\"decide between a B-tree index and a partial index for a small subset of rows\",\"explain why adding a sixth index to a write-heavy table is usually wrong\",\"choose between HNSW and IVFFlat for a pgvector similarity-search column\"]"
  anti_examples: "[\"diagnose why this specific query is slow (use query-optimization)\",\"write the production migration to create this index concurrently (use database-migration)\",\"choose a database schema (use data-modeling)\",\"decide how to partition data across nodes (use sharding-strategy)\"]"
  grounding: "{\"subject_matter\":\"portable database index design and index-portfolio maintenance\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.postgresql.org/docs/current/indexes.html\",\"https://www.postgresql.org/docs/current/indexes-types.html\",\"https://www.postgresql.org/docs/current/indexes-multicolumn.html\",\"https://www.postgresql.org/docs/current/indexes-ordering.html\",\"https://www.postgresql.org/docs/current/indexes-bitmap-scans.html\",\"https://www.postgresql.org/docs/current/indexes-partial.html\",\"https://www.postgresql.org/docs/current/indexes-index-only-scans.html\",\"https://www.postgresql.org/docs/current/sql-createindex.html\",\"https://www.postgresql.org/docs/current/bloom.html\",\"https://www.postgresql.org/docs/current/functions-uuid.html\",\"https://www.postgresql.org/docs/current/release-18.html\",\"https://use-the-index-luke.com/sql/myth-directory/most-selective-first\",\"https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/\",\"https://www.mongodb.com/docs/manual/core/index-hidden/\",\"https://www.mongodb.com/docs/manual/core/indexes/index-types/index-wildcard/\",\"https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide\",\"https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview\",\"https://github.com/HypoPG/hypopg\",\"https://github.com/supabase/index_advisor\",\"https://github.com/pgvector/pgvector\"],\"failure_modes\":[\"most_selective_first_myth\",\"leftmost_prefix_rule_overstated_after_skip_scan\",\"index_added_without_plan_or_workload_evidence\",\"covering_index_added_to_table_that_cannot_use_index_only_scan\",\"partial_index_predicate_not_implied_by_parameterized_query\",\"unused_index_dropped_without_observation_window_or_constraint_check\",\"advisor_recommendation_applied_without_write_cost_review\",\"vector_ann_index_used_without_recall_budget\",\"ivfflat_built_on_empty_or_unrepresentative_data\",\"wildcard_index_used_instead_of_schema_or_targeted_index\",\"random_uuid_pk_causing_btree_page_split_bloat\",\"production_index_created_with_blocking_DDL\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "An index is to a database what the back-of-the-book index is to a reference manual — you do not flip through every page to find every mention of 'Postgres'; you go to the I section, find the page numbers, and jump. Adding an index for every word in the book is technically possible and obviously wrong; the printer would still have to update every index every time the text changed, and the book would now spend most of its pages on indexes rather than content."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/data-engineering/indexing-strategy/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Indexing Strategy

## Concept of the skill

Indexing is the design of auxiliary search structures (precomputed lookups) that let the database find rows without scanning every row. Every index maps column values to row locations through a chosen structure: *B-tree* (the right default; serves equality, range, prefix-match, and ORDER BY; flexible across most patterns), *hash* (equality only; no range; WAL-logged and crash-safe since PostgreSQL 10), *bitmap* (low-cardinality columns in data warehouses; AND-combinations efficient), *GIN* (inverted index for arrays/JSON/full-text — many keys per row), *GiST / R-tree* (geospatial, range overlaps, and the only structure that backs `EXCLUDE` overlap constraints), *SP-GiST* (space-partitioned, non-overlapping regions — text-prefix tries, point/quadtree spatial, IP/hierarchical ranges), *BRIN* (small summary indexes for naturally-ordered append-only data — timestamps), *Bloom* (probabilistic multi-column equality filter for wide tables where no single column is selective), *LSM-tree* (write-optimized point-write workloads — Cassandra, RocksDB), *columnstore* (column-oriented storage for analytic scans over many rows and few columns), and *vector / ANN indexes* (HNSW graph and IVFFlat clustering, e.g. pgvector — approximate nearest-neighbor over high-dimensional embeddings, where B-tree and GiST do not scale to hundreds of dimensions). Composite indexes on `(A, B, C)` serve queries with leading-column prefixes: `WHERE A`, `WHERE A AND B`, `WHERE A AND C` (uses A prefix, skips B in scan), `ORDER BY A, B, C`; but classically not `WHERE B` or `WHERE C` alone — though PostgreSQL 18+ B-tree *skip scan* relaxes this when the omitted leading column has low cardinality. Column-order heuristic: equality-predicate columns first, then the `ORDER BY` column, then range-predicate columns last — "most selective column first" is a debunked myth. Covering indexes (INCLUDE clause) avoid the row-fetch step *only when the heap page is all-visible*. Partial / filtered indexes target a small subset (e.g., `WHERE status = 'pending'`); expression indexes index `f(col)`.

Replaces full-table scans with structure-aware lookups, and replaces per-column index guessing with workload-based portfolio design. Without indexes, finding a few rows in millions requires reading every row. But every index speeds up *some* queries (those whose WHERE / JOIN / ORDER BY clauses match the index's structure) and slows down *every* write (the index must be updated on every INSERT, on every UPDATE touching indexed columns, and on every DELETE). The strategic question is not "which columns deserve an index" considered in isolation; it is the whole-database trade-off between read speed and write cost given the workload's actual access patterns. The object of design is the index *portfolio* attached to a table or workload, kept intentionally small and tied to workload evidence.

This skill is distinct from `query-optimization`, which diagnoses one slow query by reading EXPLAIN ANALYZE — query optimization may conclude "add an index," but this skill decides which index belongs in the durable schema. It is distinct from `database-migration`, which owns the safe production mechanics of creating or dropping the chosen index (locks, `CONCURRENTLY`, rollback). It is distinct from `data-modeling`, which decides stored entities, constraints, and access patterns before indexes are selected, and from `schema-evolution`, which owns how those change over time. An index is to a database what the back-of-the-book index is to a reference manual — you go to the I section, find the page numbers, and jump; adding an index for every word in the book is technically possible and obviously wrong. The wrong mental model is that the answer to a slow query is always "add an index" and that a high-write table should carry all read-relevant indexes anyway. Adding an index without reading EXPLAIN ANALYZE is guessing — sometimes the existing index isn't used because of a type coercion, a function on the column, a poor cardinality estimate, or low selectivity, and the right response is the underlying diagnosis, not a new index. Every index has a per-write cost; write-heavy tables should have minimal indexes. B-tree is the default but not always right; GIN, GiST, SP-GiST, BRIN, Bloom, columnstore, LSM, and vector/ANN indexes serve specific patterns far better. An index that "exists" is not necessarily used — EXPLAIN ANALYZE confirms it; the most-selective-first composite rule is a myth (equality, then sort, then range is the mechanism); vector/ANN indexes are approximate, not exact; and an index is never set-and-forget.

## Coverage

The discipline of designing and maintaining a database's index portfolio so it finds rows quickly without scanning every row. Covers the structure catalog (B-tree, hash, bitmap, GIN, GiST, SP-GiST, BRIN, Bloom, LSM-tree, columnstore, and vector/ANN — HNSW and IVFFlat) and the access patterns each matches; composite indexes and column-order rules (equality/sort/range, skip-scan, mixed sort direction, NULL ordering, the NoSQL ESR guideline); covering / INCLUDE indexes and index-only scans (with the visibility-map/MVCC caveat); partial / filtered, expression, hidden/invisible, wildcard, and hypothetical/advisor-tested indexes; vector index tuning (HNSW vs IVFFlat, recall budget, quantization); the add/keep/drop lifecycle (usage counters, observation windows, redundant indexes, constraint ownership); the maintenance cost of every index (storage, write amplification, lock impact, planner overhead, bloat) and online rebuild; the operational mechanics of building an index without blocking writes (the production DDL handed off to `database-migration`); and the strategic question of treating the index set as an optimized portfolio rather than a per-column checklist.

## Philosophy of the skill

Indexes are a write/read trade, and a workload contract. Every index speeds up some queries and slows down every write. The strategic discipline is not "which columns deserve an index" considered in isolation; it is the whole-database trade-off between read speed and write cost, given the workload's actual access patterns. The same table needs a different index set for a write-heavy event stream, a tenant-scoped SaaS table, a full-text search collection, a geospatial catalog, an append-only time-series table, or an analytics fact table. A column does not "deserve" an index because it appears in a `WHERE` clause; a workload earns an index when important queries repeatedly benefit enough to pay the write and operational cost.

The wrong default is "add an index for every column ever filtered on." The wrong response to a slow query is always "add an index." The right discipline is to make the access pattern concrete — name the predicate shape, join key, sort, projection, result size, frequency, table size, write rate — then choose the narrowest structure that supports it, count the queries that would benefit and the writes that would pay, and check whether the planner actually uses it before keeping it.

The structure catalog matters. A B-tree is the right default for the vast majority of access patterns. Specialized structures (GIN for arrays/JSON/full-text, GiST for overlap and exclusion constraints, SP-GiST for non-overlapping prefix/point/hierarchy, BRIN for naturally-ordered large columns, columnstore for analytic scans, and vector/ANN indexes for high-dimensional similarity search) serve specific patterns far better than B-tree. Knowing which structure matches which pattern is the design vocabulary.

Indexes are not set-and-forget. An index that was right six months ago may now be bloated, redundant, or unused. Index lifecycle management — monitor usage, detect bloat, identify redundancy, rebuild when degraded, retire when dead — is part of the discipline, not an afterthought.

## Structure → Access Pattern Matrix

| Pattern | Best structure | Why |
|---|---|---|
| Equality lookup (`col = x`) | B-tree, hash | Both serve; B-tree is more flexible. Hash is equality-only but crash-safe since PG 10 and can be substantially smaller than B-tree on a wide, high-cardinality column. |
| Range (`col BETWEEN x AND y`, `<`, `>`) | B-tree | Hash and vector indexes do not support range. Put equality filters before the first range column. |
| Prefix match (`col LIKE 'foo%'`) | B-tree (with `text_pattern_ops` for non-C collations / expression indexes) | Range over a prefix. A leading wildcard (`'%foo'`) is not a normal B-tree search. |
| Text prefix / IP ranges / point data (non-overlapping) | SP-GiST | Space-partitioning (trie/quadtree/k-d); each value lives in exactly one partition. Can beat GiST on point clouds where most branches are empty. |
| Contains (`'foo' = ANY(col)`, JSON `@>`, full text) | GIN | Inverted index for many-keys-per-row values. |
| Geospatial proximity / bounding box | GiST / R-tree / PostGIS (SP-GiST for point clouds) | Spatial structures built for the predicate. |
| Range types / `&&` overlap, `EXCLUDE` scheduling constraints | GiST | Range-aware; the only structure backing exclusion constraints on overlap. |
| Multi-column equality on a wide table where no single column is selective | Bloom (PostgreSQL `bloom` extension) | Probabilistic filter; small index summarizing several columns. False positives need a recheck, and write cost is high — use when many columns are tested with AND and writes are infrequent. |
| Vector similarity / nearest-neighbor (embeddings, semantic search) | HNSW (recall/latency-first), IVFFlat (build/memory-first), exact scan for small sets | Approximate nearest-neighbor over high-dimensional vectors; B-tree/GiST do not scale past a few dimensions. |
| Naturally-ordered append-only (timestamps) | BRIN | Small summary index; requires physical/insert order correlated with the column. Tune `pages_per_range`. |
| Analytic scan / aggregate over many rows and few columns | Columnstore (SQL Server / column stores) | Column-oriented storage and compression minimize I/O for wide-table aggregations; use rowstore B-tree for selective OLTP lookups. |
| Unknown / flexible document fields (NoSQL) | Wildcard index (cautiously) | Indexes every field matching a path pattern when the queried field set is unpredictable; prefer targeted indexes (or settle the schema via data-modeling) once the fields are stable. |
| Low-cardinality AND-combination (data warehouse) | Bitmap | AND across columns efficient. |
| Low-cardinality high-update workload | None (use partial or skip) | Bitmap updates poorly. |

## Composite Index Column Order Rule

For an index on (A, B, C), the index is sorted by A, then by B within each A, then by C within each (A, B). That makes leading-column prefix usefulness the central rule:

| Query | Uses index? |
|---|---|
| `WHERE A = x` | Yes |
| `WHERE A = x AND B = y` | Yes |
| `WHERE A = x AND B = y AND C = z` | Yes |
| `WHERE A = x AND C = z` | Yes (A prefix), but skips B in scan |
| `WHERE B = y` | No (no leading A) — but see the skip-scan note below |
| `WHERE C = z` | No |
| `ORDER BY A, B, C` | Yes (sort avoided) |
| `ORDER BY A DESC, B DESC` | Yes (Postgres can reverse-scan) |
| `ORDER BY A ASC, B DESC` | May need an explicit mixed-direction index `(A ASC, B DESC)` |
| `ORDER BY B` | No (unless an equality predicate fixes A) |

**Column-order heuristic — equality first, then sort, then range; NOT "most selective first."** Order the columns: equality-predicate columns first, then the column used for `ORDER BY` (sort), then range/inequality-predicate columns last. The mnemonic **ESR (Equality, Sort, Range)** is MongoDB's — documented there as a *guideline* (with the ERS variant as a deliberate tradeoff when narrowing the range matters more than avoiding an in-memory sort), not a universal database law. PostgreSQL does not name "ESR"; its multicolumn-index docs document the underlying *mechanism* instead: equality constraints on leading columns are used to seek, the first range/inequality column bounds the scan, and columns after that first range column can only filter, not seek. Both frame the same mechanism — a B-tree composite scan seeks on a leading run of equality columns and can then return rows already sorted by the next column, but the moment it reaches a range column (`>`, `<`, `BETWEEN`, `LIKE 'foo%'`), every index column after it can only *filter* the rows it already matched. So a range column placed early throws away the seek power of everything after it. Putting the "most selective" column first is a widely-repeated **myth**, explicitly debunked by *Use The Index, Luke!*; selectivity is at most a tiebreaker *among* the equality columns, never the primary ordering criterion. Two more practical points:

- **Top-N / `LIMIT`.** An index matching equality + sort lets the planner stop after N rows (an ordered index scan instead of scan-then-sort), which is critical on large tables.
- **Sort direction and NULL ordering.** Single-column reverse scans are usually free; mixed direction across columns (`A ASC, B DESC`) may need the directions baked into the index. Make `NULLS FIRST/LAST` explicit when it matters.

Example: for `WHERE status = 'x' AND created_at > $1 ORDER BY priority`, the equality→sort→range order is `(status, priority, created_at)` — equality (`status`), then sort (`priority`, so the sort step is avoided), then range (`created_at`); reordering to lead with `created_at` because it looks "more selective" breaks both the prefix seek and the sort.

**PostgreSQL 18+ skip scan (released 2025-09-25).** The classic left-most rule — that a query with no condition on A cannot use an `(A, B, C)` index — is no longer absolute on B-tree indexes. PostgreSQL 18 added *skip scan*: when the omitted leading column has **low cardinality**, the planner performs many small range seeks (one per distinct A value) and can use the index for `WHERE B = y` even with no A predicate. It is automatic (no syntax), B-tree only, generally chosen only when the planner estimates the omitted column has few distinct values and it can skip most of the index, and its benefit shrinks as that distinct-value count grows. It does **not** make the index as efficient as a purpose-built `(B)` index, and it is not permission to ignore column order — treat it as a bonus that may let a low-cardinality-leading index serve more queries than the column-order rule alone predicts. Confirm with EXPLAIN; on a database older than 18, the strict "No" rows above still hold. (MongoDB, SQL Server, and others have their own related optimizations; the same "verify, don't assume" rule applies.)

**NoSQL note.** For document databases (MongoDB), the same Equality→Sort→Range ordering applies to compound indexes, with the ERS variant as a deliberate tradeoff; this is MongoDB's documented guideline and the direct origin of the ESR mnemonic.

## Index Design Method

A repeatable workflow that turns indexing from guessing into portfolio design:

1. **Inventory the workload, not just the schema.** Use query logs, `pg_stat_statements`, Query Store, slow-query logs, Atlas/Cloud dashboards, or application traces to identify frequent and important access patterns.
2. **Group queries by shape:** predicates, joins, sort, projection, `LIMIT`/top-N, aggregation, and tenant/shard key.
3. **For each group, choose the structure that matches the operator family** (see the matrix): B-tree for ordered/equality/range, GIN for containment/full text, GiST/SP-GiST for spatial/overlap, BRIN for naturally-ordered large tables, columnstore for analytic scans, a vector index for nearest-neighbor, etc.
4. **Design composite key order for the workload prefix:** equality columns first, then the sort column, then range columns; align with the queries that should reuse the index; make sort direction / NULL ordering explicit when mixed ordering matters.
5. **Decide whether covering is worthwhile.** Use key columns for navigation and `INCLUDE`/payload columns only when they let a high-value query avoid base-row fetches without turning every write into an oversized index update.
6. **Prefer one well-shaped index over many redundant ones**, but do not over-compress unrelated query shapes into one awkward index.
7. **Test candidates before building when possible:** hypothetical indexes (HypoPG), index advisors, hidden/invisible indexes, or staging with production-like data. Treat recommendations as candidates, not verdicts.
8. **Verify after creation:** the planner uses the index for the intended shape, latency and I/O improve, writes stay acceptable, and no adjacent query regresses.
9. **Retire safely:** identify unused or redundant indexes over a meaningful observation window (account for stats-reset time and seasonality), check constraint/unique/FK/replication roles, hide/make-invisible where supported, then drop through the migration discipline.

## Vector (ANN) Index Tuning

When the access pattern is "find the rows whose embedding is nearest to this query vector" (semantic search, RAG retrieval, recommendation, dedup), a B-tree or GiST index does not help — high-dimensional nearest-neighbor needs an **approximate nearest-neighbor (ANN)** structure. In PostgreSQL this is `pgvector`'s two index types; managed and other engines (MongoDB Vector Search, Elasticsearch dense_vector) expose equivalents. Exact (flat) scan remains correct and is often best for small sets or strict-recall requirements.

| | **HNSW** (Hierarchical Navigable Small World) | **IVFFlat** (Inverted File with Flat lists) |
|---|---|---|
| Structure | Multi-layer proximity graph | k-means clusters; search the nearest cluster lists |
| Recall / latency | Higher recall, lower query latency, scales sub-linearly | Lower recall unless `probes` raised; latency grows with probes |
| Build cost | Slower to build, more memory | Faster to build, less memory |
| Inserts | Streaming inserts wired into the graph without a rebuild | Degrades under inserts; centroids drift, periodic `REINDEX` needed |
| Empty/unrepresentative data | Can be built before data exists | **Must** be built on representative data — it trains cluster centroids at build time; an empty or unrepresentative table gives near-zero recall |
| Best for | The default for most production similarity search | Very large, mostly-static datasets optimizing build time/memory |
| Key knobs | `m` (graph degree) and `ef_construction` at build; `ef_search` (raise for recall) at query | `lists` (cluster count) at build; `probes` (raise for recall) at query |

```sql
-- HNSW (cosine distance)
CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
-- IVFFlat (L2 distance); SET ivfflat.probes = sqrt(lists) at query time
CREATE INDEX ON items USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);
```

Operational rules that catch teams out:

- **The vector column must appear raw in the `ORDER BY ... <distance-operator> ...` (and any `WHERE`).** Wrapping it in a function or expression makes the planner ignore the ANN index and fall back to an exact full scan — fast in dev, catastrophic at scale. pgvector's distance operators are `<->` (L2), `<#>` (inner product), `<=>` (cosine).
- **ANN indexes are approximate by definition.** Recall is a tunable, not a guarantee; measure recall against an exact baseline at your chosen `ef_search` / `probes` before trusting results. IVFFlat recall also degrades when the embedding distribution is clustered rather than uniform.
- **When the index is RAM-bound, reduce the vector before buying a bigger server.** Half-precision vectors (`halfvec`), binary quantization (`binary_quantize`), or dimensionality reduction shrink the index and can speed build/query — at an accuracy/re-ranking cost, so record the recall budget before adopting them.
- **When filters are mixed with vector search,** index the filters too, or use partial / partitioned vector indexes where the engine supports them. State the distance metric, recall target, latency target, dimensionality, data size, filter selectivity, update rate, and memory budget — do not hide these behind "add a vector index."

## Specialized Index Patterns

### Covering / INCLUDE indexes

A covering index lets a query be answered from the index without fetching the base row. In PostgreSQL this is an index-only scan and it wins **only** when the index stores all needed values *and* enough heap pages are marked all-visible; recently changed rows still require heap visibility checks. The `INCLUDE` clause (PostgreSQL 11+, SQL Server) stores non-key payload columns in the leaf pages only — they are not part of the index key, cannot be used for search conditions, do not affect tree structure, and may be non-sortable types (e.g. JSON). MySQL and Oracle have no `INCLUDE`; cover with a composite key instead.

```sql
CREATE INDEX orders_customer_created_idx
  ON orders (customer_id, created_at DESC)
  INCLUDE (total_cents, status);
```

Use covering indexes for stable, read-hot query shapes where base-row fetches dominate; do not make every projected column a key. **Visibility-map caveat:** confirm the benefit is real — read `Heap Fetches` in `EXPLAIN (ANALYZE, BUFFERS)`; a high count means autovacuum is behind and the covering benefit has evaporated. Keep `autovacuum` tuned (`VACUUM` is what sets the all-visible bits).

### Partial / filtered indexes

A partial index contains only rows matching a predicate — among the highest-leverage techniques when the workload repeatedly targets a small, stable subset. A partial index covering 0.5% of a million-row table is roughly 0.5% the size of the full index.

```sql
CREATE INDEX jobs_pending_run_at_idx ON jobs (run_at) WHERE status = 'pending';
CREATE UNIQUE INDEX ON subscriptions (user_id) WHERE status = 'active';  -- conditional uniqueness
```

**The query must imply the index predicate, and PostgreSQL proves implication only against plan-time constants.** An index built `WHERE status = 'pending'` serves `... WHERE status = 'pending' AND user_id = 7`, but **not** `... WHERE status = $1` with a bound parameter, and not `status IN ('pending','processing')` (which does not imply `status = 'pending'`). A partial index that quietly goes unused under the application's parameterized queries is one of the most common "why isn't my index used" failures — verify with `EXPLAIN` on the *real* parameterized form, not a hand-substituted literal. Do not create many non-overlapping partial indexes as a substitute for partitioning. Common patterns: soft-deletes (`WHERE deleted_at IS NULL`), status flags, recent-data windows.

### Expression / generated-column indexes

Index a transformed value when queries search on it:

```sql
CREATE INDEX users_lower_email_idx ON users (lower(email));
-- For LIKE 'prefix%' on the expression, add an operator class that orders by byte value:
CREATE INDEX users_lower_email_prefix_idx ON users (lower(email) text_pattern_ops);
```

Without the expression index, `WHERE lower(email) = $1` forces a sequential scan. `text_pattern_ops` is required for `LIKE 'prefix%'` to become an index range scan when the database collation is not C. If the function can be avoided by normalizing stored data or adding a canonical/generated column, route that decision through `data-modeling`.

### Hash, SP-GiST, Bloom — specialized relational structures

- **Hash** (PostgreSQL 10+ is WAL-logged and crash-safe) is equality-only — no range, no `ORDER BY`, no uniqueness — but for pure equality on a wide high-cardinality column it can be much smaller than a B-tree. The planner may still prefer a sequential scan on small or low-selectivity tables.
- **SP-GiST** partitions data into non-overlapping regions — phone/IP prefixes (CIDR, inet), quad-trees for 2D points, k-d trees, skewed text prefixes — and can outperform GiST on point clouds where most branches are empty.
- **Bloom** (the `bloom` extension) is a probabilistic multi-column equality filter for wide tables where no single column is selective but the *combination* is (`WHERE a = 1 AND b = 2 AND c = 3 AND d = 4`). It is small, returns false positives that need a recheck, and has high write cost — use it when writes are infrequent.

### Columnstore indexes

Columnstore stores data by column (not "a B-tree on every column") and suits data-warehousing, reporting, and analytic scans that read many rows but few columns. Use rowstore/B-tree for selective OLTP lookups; use columnstore when scan, compression, and vectorized execution dominate.

### Wildcard / flexible-schema indexes

Document databases support wildcard indexes for unknown or changing fields (MongoDB `{ "$**": 1 }`, or scoped to a subtree). Use them **only** while the queried field set is genuinely unpredictable — they are larger and more write-expensive than targeted indexes, cannot be a general compound index across arbitrary fields, and the planner still picks one indexed field per query. Once the high-value query fields are known and stable, replace with targeted indexes or push the structure into the schema via `data-modeling`. A wildcard index used as a lazy substitute for understanding the access pattern is the document-store version of "index every column."

### Hypothetical indexes and index advisors

HypoPG, Supabase `index_advisor`, Cloud SQL Index Advisor, and Azure SQL automatic tuning generate or test candidates without building them. HypoPG creates a *virtual* index the planner will cost in `EXPLAIN`, so you can see whether the planner would choose it (and how much it would help) before paying the `CREATE INDEX CONCURRENTLY` build cost on a large table; `hypopg_hide_index` simulates a drop. They are useful candidate generators, not the design authority — confirm the source workload is representative, compare read benefit to write/storage/migration cost, check redundancy against existing indexes, verify the generated DDL is production-safe through `database-migration`, and re-measure after implementation. Automatic-tuning systems that create/drop with verification reduce toil; the team still owns policy, exclusions, workload windows, and review thresholds.

### Hidden / invisible indexes (safe drop testing)

Before dropping a suspected-unused index, make it invisible rather than dropping it. MySQL 8 `ALTER TABLE ... ALTER INDEX ... INVISIBLE`, Oracle `INVISIBLE` indexes, and MongoDB `db.collection.hideIndex()` keep the index maintained but hide it from the planner — so you can watch a full workload run without it and confirm nothing regresses, then unhide instantly if a query slows. This converts an irreversible `DROP` into a reversible toggle. (PostgreSQL has no native invisible-index flag; approximate it by watching `pg_stat_user_indexes` over a representative window, or with HypoPG's drop simulation.) Hidden/invisible indexes are still maintained and may still enforce uniqueness/TTL, so they are not a cost-free final state.

## When To Add, Drop, Never Add

| Situation | Decision |
|---|---|
| Important query shape is frequent, slow, selective, and matches no current index | Add a candidate index, test with plan/usage evidence, then migrate safely |
| Query is rare (monthly report); table is otherwise hot | Don't add — the query can scan |
| Before adding a heavy index on a large table | Test as a hypothetical (HypoPG) — confirm the planner would choose it before paying the build cost |
| Existing index is reported unused over a meaningful observation window | Candidate for hide/invisible/drop — but first check stats-reset time, seasonality, constraints, uniqueness, FK/cascade needs, and failover/reporting workloads |
| Existing index is a strict left-prefix duplicate of another (e.g. `(a)` when `(a, b)` exists) | Usually drop/merge — unless uniqueness, ordering, predicate, INCLUDE columns, operator class, or lower write cost gives it a distinct purpose |
| Column has low selectivity (boolean, status enum with two common values) | Use a partial index on the rarer value, or skip |
| Column is part of a composite key with leading columns covered by another index | Skip; the existing index serves |
| Column is a foreign key, joined frequently (or parent deletes/updates must check children) | Add an index on the referencing column where the engine does not already provide one |
| Column is a foreign key, never joined | Optional; some teams add for CASCADE operations |
| Write-heavy table (audit log, event stream) | Minimal indexes — primary key only, occasionally one more |
| Index is bloated beyond a workload-tuned threshold | Rebuild online (`REINDEX ... CONCURRENTLY`) or `pg_repack` |
| Semantic / vector search over embeddings | Choose exact scan, HNSW, IVFFlat, or a quantized variant only after stating recall, latency, memory, build, and re-ranking tradeoffs |
| Analytics scan over a large fact table by a few columns | Consider columnstore rather than many rowstore indexes |
| Advisor suggests an index | Treat as a candidate; verify workload representativeness, redundancy, write cost, and deploy safety |

## Operational Notes — Index Lifecycle (Create → Monitor → Maintain → Drop)

The *design* of which indexes to have is only half the job; getting them into a live database without an outage and keeping the portfolio healthy is the other half. The concrete production DDL — locks, transaction limits, rollback — is owned by `database-migration`; this section is the design-side awareness of what that handoff must respect.

### Create — build without blocking writes

- A plain `CREATE INDEX` takes a lock that blocks writes for the whole build. Use `CREATE INDEX CONCURRENTLY` (Postgres) or the engine's online-build equivalent (`ONLINE = ON` in SQL Server; `ALGORITHM=INPLACE LOCK=NONE` in MySQL/InnoDB, version-dependent) for any table being written to. `CONCURRENTLY` cannot run in a transaction and can leave an *invalid* index if it fails — verify and `DROP`/rebuild on failure.
- **GIN indexes are expensive to write** (each insert touches many entries). For bulk loads, build the GIN index *after* loading, or use the `fastupdate` option to batch pending entries. Recent PostgreSQL versions added parallel GIN builds (B-tree/BRIN builds also parallelize), shortening large index-build windows; set `max_parallel_maintenance_workers` for large GIN/JSONB/full-text builds. pgvector HNSW builds also parallelize (pgvector 0.8+).
- Set `fillfactor` (70–90) on B-tree indexes for hot, frequently-updated tables to leave room for HOT updates and reduce page splits.

### Monitor — find what is unused or oversized

Query the engine's counters on a cadence so the "drop unused indexes" rule actually runs rather than staying aspirational. In PostgreSQL, `pg_stat_user_indexes` / `pg_statio_user_indexes`; in SQL Server, Query Store / DMVs; in MongoDB Atlas, the metrics dashboards.

```sql
-- PostgreSQL: indexes with zero scans since stats reset (exclude primary keys / constraints)
SELECT schemaname, relname AS table, indexrelname AS index,
       pg_size_pretty(pg_relation_size(indexrelid)) AS size, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

Verify stats have been reset long enough ago to be representative, and weigh seasonality before acting.

### Maintain — bloat, redundancy, write cost

- **Indexes bloat.** Under heavy update/delete churn a B-tree accumulates dead tuples and partially-empty pages and grows larger and slower even though its definition never changed — silent degradation. B-tree deduplication (PG 13+) and bottom-up deletion (PG 14+) reduce, but do not eliminate, bloat; deduplication shrinks low-cardinality index *storage* without lowering write cost. Measure physical bloat with `pgstattuple` (`pgstatindex(...)`; `leaf_fragmentation` and index-size-vs-row-count heuristics elsewhere) and treat thresholds (e.g. ~30–40% index bloat) as workload-tuned rules of thumb, not universal law.
- **Rebuild degraded indexes online** with `REINDEX INDEX CONCURRENTLY` (Postgres 12+) — it rebuilds without the write-blocking lock plain `REINDEX` takes; ensure free disk ≈ 1.5× the index size, since old and new coexist. `pg_repack` / `pg_squeeze` reorganize table+index online for large tables; `pg_cron` can schedule VACUUM/ANALYZE. (PostgreSQL 17's TidStore also cut VACUUM memory use sharply, easing maintenance on large tables.)
- **Detect redundant indexes:** `(a)` is redundant when `(a, b)` exists; `(a)` is *not* redundant to `(b, a)`. Drop exact duplicates.
- **Write amplification is per-*indexed-column*, not per-write.** An UPDATE that changes no indexed column can use a heap-only-tuple (HOT) update and skip the indexes entirely — so narrowing *which* columns are indexed (not just how many indexes exist) directly lowers write cost; keep `fillfactor` below 100 on hot tables to enable HOT chains. More indexes also mean more WAL (replication lag, backup size), more autovacuum work, more buffer-pool pressure, and more planner overhead. The cost is measurable: in one Percona (2025) benchmark, TPS dropped from ~1,400 to ~600 as indexes on a table grew from 7 to 39 — illustrative and workload-dependent, not a universal constant, but the direction is real. Rule of thumb on write-heavy tables: keep indexes to the primary key plus the few access paths actually queried; multiply the write rate by (1 + index count) against your write-latency budget.
- **A random primary key punishes the B-tree it indexes; prefer a time-ordered key.** A v4 UUID (or any random/hash PK) inserts at scattered positions, so the B-tree suffers constant *page splits* and packs pages poorly — inflating index size, write amplification, and cache misses on a high-insert table. A time-ordered key appends to the right edge, keeping pages dense. **UUIDv7** (RFC 9562 standardized the time-ordered layout; PostgreSQL 18 ships a native `uuidv7()` function — note that `gen_random_uuid()` still produces a *v4* UUID, so opt into `uuidv7()` explicitly), ULID, or a plain `bigint` sequence are the time-ordered options. The key-type *choice* is partly `data-modeling`'s territory, but the index-health consequence is squarely an indexing concern. (A monotonic key can shift insert contention to the rightmost page under extreme concurrency — far rarer than the bloat a random key guarantees.)

### Drop — retire safely

- Use `DROP INDEX CONCURRENTLY` (Postgres) to remove unused/redundant indexes without blocking writes; on engines that support it, hide/make-invisible first and watch a representative workload before the irreversible drop.
- Before dropping, verify the index does not back a constraint (PRIMARY KEY, UNIQUE, FK with CASCADE) or a uniqueness/TTL rule.
- Dropping a dead index immediately improves write throughput and cuts storage, WAL volume, and autovacuum work.
- Re-record drift baselines when index DDL is part of a tracked migration.

## Verification

After applying this skill, verify:
- [ ] The proposed index has a named workload shape: predicates, joins, sort, projection, frequency, row count, write rate, and latency/recall target where relevant.
- [ ] Index structure matches the access pattern (B-tree for ordered queries; GIN for contains; GiST for overlap/exclusion; SP-GiST for non-overlapping prefix/point; BRIN for naturally-ordered large columns; Bloom for wide multi-column equality; columnstore for analytics; HNSW/IVFFlat for vector similarity). Default B-tree everywhere is not necessarily correct.
- [ ] Composite indexes have intentional column order following equality → sort → range — NOT "most selective first" (a debunked myth). On PostgreSQL 18+, account for skip scan when the leading column is low-cardinality; bake in sort direction / NULL ordering when mixed ordering matters.
- [ ] Covering / `INCLUDE` columns are payload columns, not accidental key columns, and the index-only scan actually skips the heap (`Heap Fetches` low in `EXPLAIN (ANALYZE, BUFFERS)`; the table is vacuumed enough that pages are all-visible).
- [ ] Partial indexes are confirmed *used* under the application's real parameterized queries (the planner proves predicate implication only against plan-time constants, not bound parameters) — verified with `EXPLAIN` on the parameterized form.
- [ ] Expression / generated-column indexes match the query expression exactly (with `text_pattern_ops` for prefix `LIKE` under non-C collations), or the data model is changed so the expression is unnecessary.
- [ ] Existing indexes are checked for redundancy (subset/duplicate) before adding another one.
- [ ] Index usage is monitored (`pg_stat_user_indexes` / Query Store / Atlas metrics) over a window that accounts for stats resets and seasonality; unused indexes are retired on a cadence — and a suspected-unused index is made invisible/hidden (or HypoPG drop-simulated) before an irreversible `DROP`.
- [ ] Index bloat is monitored (`pgstattuple` or size-vs-rowcount heuristics) and degraded indexes are rebuilt online (`REINDEX ... CONCURRENTLY`); a candidate new index on a large table is tested as a hypothetical before paying the real build cost.
- [ ] Write-heavy tables have minimal indexes, justified against the table's write rate, with indexed columns narrowed to preserve HOT updates.
- [ ] High-insert tables use a time-ordered primary key (UUIDv7 via `uuidv7()` / ULID / `bigint` sequence), not a random v4 UUID, to avoid B-tree page-split bloat — or the random-key cost is a deliberate, measured choice.
- [ ] For vector / ANN indexes: the raw vector column appears in the distance `ORDER BY`/`WHERE` (no wrapping function), IVFFlat is built on representative data, recall is measured against an exact baseline at the chosen `ef_search`/`probes`, and quantization (`halfvec`/`binary_quantize`) is adopted only with an explicit recall/memory tradeoff.
- [ ] Wildcard / flexible-schema document indexes are used only while the queried field set is genuinely unpredictable; stable high-value fields have targeted indexes (or are settled in the schema) instead.
- [ ] EXPLAIN ANALYZE confirms the planner actually uses the added index (check for type-coercion, function-wrapping, or selectivity issues). An index that exists but is ignored is pure cost.
- [ ] Production index creation/deletion is handed to `database-migration` for lock profile, `CONCURRENTLY`/online-build, transaction limits, rollback, and verification.
- [ ] Advisor-generated or automatic-tuning actions are reviewed against write cost, redundancy, and business-critical query coverage before being accepted as durable schema.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Diagnosing a specific slow query or plan | `query-optimization` | query-optimization owns plan reading and root-cause diagnosis; this skill owns durable index design |
| Writing or applying the production DDL to create/drop an index (locks, `CONCURRENTLY`, rollback) | `database-migration` | index DDL has lock, transaction, and rollback behavior that migration discipline owns |
| Designing the table schema, entities, keys, and access patterns | `data-modeling` | data-modeling owns stored shape; this skill owns the auxiliary access paths over it |
| Reasoning about how the schema changes across releases | `schema-evolution` | schema-evolution owns coordinated change over time; this skill owns the index portfolio |
| Choosing an isolation level or lock semantics | `transaction-isolation` | transaction-isolation owns concurrency correctness; this skill owns retrieval paths |
| Reasoning about horizontal partitioning / shard keys | `sharding-strategy` | sharding owns cross-node placement; this skill owns within-shard retrieval |
| Selecting an embedding model or designing the RAG/retrieval pipeline | AI-engineering skills | those own the embedding/retrieval strategy; this skill owns the index structure on the stored vectors |
| Tuning OS / storage-layer / cache I/O | infrastructure / storage skills | storage I/O is a layer below indexing |

## Key Sources

- Winand, M. (2012, ongoing). [*Use The Index, Luke!*](https://use-the-index-luke.com/) and ["Myth: Most Selective Column First"](https://use-the-index-luke.com/sql/myth-directory/most-selective-first). The canonical practitioner guide to SQL indexing — B-tree internals, concatenated-index column order, the planner's interaction with indexes, and the explicit debunking of "most selective first."
- PostgreSQL Global Development Group. ["Indexes"](https://www.postgresql.org/docs/current/indexes.html) and ["Index Types"](https://www.postgresql.org/docs/current/indexes-types.html). The index-overhead mental model and the full structure catalog (B-tree, hash, GiST, SP-GiST, GIN, BRIN), including SP-GiST's space-partitioning use cases.
- PostgreSQL Global Development Group. ["Multicolumn Indexes"](https://www.postgresql.org/docs/current/indexes-multicolumn.html) and ["Indexes and ORDER BY"](https://www.postgresql.org/docs/current/indexes-ordering.html). Leading-column prefix behavior, PostgreSQL 18 skip scan, multicolumn limits, reverse scans, and mixed sort direction — the mechanism PostgreSQL documents in place of a named ESR law.
- PostgreSQL Global Development Group. ["Partial Indexes"](https://www.postgresql.org/docs/current/indexes-partial.html) and ["Index-Only Scans and Covering Indexes"](https://www.postgresql.org/docs/current/indexes-index-only-scans.html). Predicate-implication against plan-time constants; `INCLUDE` columns and the visibility-map/MVCC caveat on index-only scans.
- PostgreSQL Global Development Group. ["CREATE INDEX"](https://www.postgresql.org/docs/current/sql-createindex.html), ["REINDEX"](https://www.postgresql.org/docs/current/sql-reindex.html), ["pgstattuple"](https://www.postgresql.org/docs/current/pgstattuple.html), and ["bloom"](https://www.postgresql.org/docs/current/bloom.html). Concurrent/invalid-index build behavior, online rebuild, physical bloat measurement, and the Bloom multi-column equality filter.
- PostgreSQL Global Development Group. ["PostgreSQL 18 Release Notes"](https://www.postgresql.org/docs/current/release-18.html) and ["UUID Functions"](https://www.postgresql.org/docs/current/functions-uuid.html). PostgreSQL 18 (2025-09-25) added B-tree skip scan, OR-condition optimization, and parallel GIN/B-tree/BRIN builds; `uuidv7()` is the native v7 generator while `gen_random_uuid()` remains v4.
- Davis, B., Peabody, B., & Leach, P. (2024). ["RFC 9562 — Universally Unique IDentifiers (UUIDs)"](https://www.rfc-editor.org/rfc/rfc9562.html). Standardizes the time-ordered UUIDv7 layout that keeps a B-tree primary-key index dense and avoids the page-split bloat a random v4 UUID causes.
- MongoDB. ["The ESR (Equality, Sort, Range) Guideline"](https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/), ["Hidden Indexes"](https://www.mongodb.com/docs/manual/core/index-hidden/), ["Wildcard Indexes"](https://www.mongodb.com/docs/manual/core/indexes/index-types/index-wildcard/), and ["Vector Search"](https://www.mongodb.com/docs/vector-search/). Document-database compound-index ordering and ERS tradeoff, safe index-retirement testing, flexible-schema index caveats, and vector ANN/ENN search.
- Microsoft. ["SQL Server Index Architecture and Design Guide"](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide), ["Columnstore indexes: Overview"](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview), and ["Automatic tuning"](https://learn.microsoft.com/en-us/sql/relational-databases/automatic-tuning/automatic-tuning). Key vs included columns, analytic columnstore guidance, and create/drop-with-verification automatic tuning.
- HypoPG, Supabase, and Google Cloud. ["HypoPG"](https://github.com/HypoPG/hypopg), ["PostgreSQL Index Advisor"](https://github.com/supabase/index_advisor), and ["Cloud SQL Index Advisor"](https://docs.cloud.google.com/sql/docs/postgres/use-index-advisor). Hypothetical-index costing and candidate-generation workflows; advisors are candidate generators, not design authority.
- pgvector contributors. ["pgvector"](https://github.com/pgvector/pgvector). HNSW vs IVFFlat index types, build/query knobs (`m`, `ef_construction`, `ef_search`, `lists`, `probes`), distance operators, half-precision/binary quantization, and the raw-column requirement for the index to be used.
- Malkov, Y. A., & Yashunin, D. A. (2018). ["Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs"](https://arxiv.org/abs/1603.09320). *IEEE TPAMI*. The foundational HNSW paper underlying pgvector's default vector index.
- Percona. ["Benchmarking PostgreSQL: The Hidden Cost of Over-Indexing"](https://www.percona.com/blog/benchmarking-postgresql-the-hidden-cost-of-over-indexing/) (2025). A quantitative (workload-specific, illustrative) benchmark of write-throughput degradation from over-indexing.
- Petrov, A. (2019). *Database Internals: A Deep Dive into How Distributed Data Systems Work*. O'Reilly. B-tree variants, LSM-trees, and storage-engine internals.
- Ramakrishnan, R., & Gehrke, J. (2002, 3rd ed.). *Database Management Systems*. McGraw-Hill; Garcia-Molina, H., Ullman, J. D., & Widom, J. (2008, 2nd ed.). *Database Systems: The Complete Book*. Pearson. Classic textbook treatment of indexing structures, query execution, and the planner.
- Oracle. ["Oracle Database Concepts — Indexes and Index-Organized Tables"](https://docs.oracle.com/database/121/CNCPT/indexiot.htm). Bitmap, function-based, and index-organized tables.
- Lehman, P. L., & Yao, S. B. (1981). ["Efficient Locking for Concurrent Operations on B-Trees"](https://dl.acm.org/doi/10.1145/319628.319663). *ACM TODS*, 6(4). Foundational paper on concurrent B-tree operations.
- O'Neil, P., Cheng, E., Gawlick, D., & O'Neil, E. (1996). ["The Log-Structured Merge-Tree (LSM-tree)"](https://dl.acm.org/doi/10.1145/240858.240861). *Acta Informatica*. The foundational LSM-tree paper underlying Cassandra, RocksDB, and modern write-optimized stores.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `data-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: Use when designing the maintained index set for a relational, document, search, vector, or LSM-backed database: the index-as-precomputed-search-structure mental model, the catalog of structures (B-tree, hash, bitmap, GIN, GiST, SP-GiST, BRIN, LSM-tree, Bloom, columnstore, and vector/ANN indexes such as HNSW and IVFFlat), the matching of structures to access patterns (equality, range, prefix, contains, geospatial, overlap-exclusion, analytic scan, vector similarity), composite indexes and column order (equality/sort/range, NOT 'most selective first'), covering / INCLUDE indexes, partial / filtered indexes, expression indexes, hidden/invisible and hypothetical/advisor-tested indexes, index usage monitoring and bloat, the maintenance cost and lifecycle of every index (write amplification, storage, lock impact), and the rules for when to add an index, when not to, and when to drop one. Do NOT use for tuning a slow query (use query-optimization), safely applying a concrete production index migration (use database-migration), choosing isolation levels (use transaction-isolation), schema design (use data-modeling), or distributed-data partitioning (use sharding-strategy).

**When to use**
- design indexes for a table with high-volume reads on user_id and date-range queries
- choose column order for a compound index that filters by tenant_id, sorts by created_at, and ranges over status
- decide between a B-tree index and a partial index for a small subset of rows
- explain why adding a sixth index to a write-heavy table is usually wrong
- choose between HNSW and IVFFlat for a pgvector similarity-search column
- Triggers: `should I add an index`, `which columns to index`, `B-tree vs hash`, `is this index being used`, `composite index column order`, `HNSW vs IVFFlat`, `drop unused index`, `index bloat`

**Not for**
- diagnose why this specific query is slow (use query-optimization)
- write the production migration to create this index concurrently (use database-migration)
- choose a database schema (use data-modeling)
- decide how to partition data across nodes (use sharding-strategy)

**Related skills**
- Verify with: `data-modeling`, `query-optimization`, `database-migration`
- Related: `transaction-isolation`, `query-optimization`, `data-modeling`, `schema-evolution`, `connection-pooling`, `database-migration`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: An index is to a database what the back-of-the-book index is to a reference manual — you do not flip through every page to find every mention of 'Postgres'; you go to the I section, find the page numbers, and jump. Adding an index for every word in the book is technically possible and obviously wrong; the printer would still have to update every index every time the text changed, and the book would now spend most of its pages on indexes rather than content.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.postgresql.org/docs/current/indexes.html`, `https://www.postgresql.org/docs/current/indexes-types.html`, `https://www.postgresql.org/docs/current/indexes-multicolumn.html`, `https://www.postgresql.org/docs/current/indexes-ordering.html`, `https://www.postgresql.org/docs/current/indexes-bitmap-scans.html`, `https://www.postgresql.org/docs/current/indexes-partial.html`, `https://www.postgresql.org/docs/current/indexes-index-only-scans.html`, `https://www.postgresql.org/docs/current/sql-createindex.html`, `https://www.postgresql.org/docs/current/bloom.html`, `https://www.postgresql.org/docs/current/functions-uuid.html`, `https://www.postgresql.org/docs/current/release-18.html`, `https://use-the-index-luke.com/sql/myth-directory/most-selective-first`, `https://www.mongodb.com/docs/manual/tutorial/equality-sort-range-guideline/`, `https://www.mongodb.com/docs/manual/core/index-hidden/`, `https://www.mongodb.com/docs/manual/core/indexes/index-types/index-wildcard/`, `https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide`, `https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview`, `https://github.com/HypoPG/hypopg`, `https://github.com/supabase/index_advisor`, `https://github.com/pgvector/pgvector`

**Keywords**
- `indexing`, `B-tree`, `GIN`, `GiST`, `BRIN`, `composite index`, `partial index`, `covering index`, `vector index`, `HNSW`

<!-- skill-graph-context:end -->
