---
name: indexing-strategy
description: "Use when designing indexes for a relational or NoSQL database: the index-as-precomputed-search-structure mental model, the catalog of structures (B-tree, hash, bitmap, GIN/GiST, BRIN, LSM-tree), the matching of structures to access patterns (equality, range, prefix, contains, geospatial), composite indexes and column order, covering indexes, partial / filtered indexes, the maintenance cost of every index (write amplification, storage, lock impact), and the rules for when to add an index, when not to, and when to drop one. Do NOT use for tuning a slow query (use query-optimization), choosing isolation levels (use transaction-isolation), schema design (use data-modeling), or distributed-data partitioning (use sharding-strategy)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"transaction-isolation\",\"query-optimization\",\"data-modeling\",\"schema-evolution\",\"connection-pooling\"],\"suppresses\":[\"query-optimization\",\"schema-evolution\",\"sharding-strategy\"],\"verify_with\":[\"data-modeling\",\"query-optimization\",\"database-migration\"]}"
  subject: data-engineering
  public: "true"
  scope: "Use when designing indexes for a relational or NoSQL database: the index-as-precomputed-search-structure mental model, the catalog of structures (B-tree, hash, bitmap, GIN/GiST, BRIN, LSM-tree), the matching of structures to access patterns (equality, range, prefix, contains, geospatial), composite indexes and column order, covering indexes, partial / filtered indexes, the maintenance cost of every index (write amplification, storage, lock impact), and the rules for when to add an index, when not to, and when to drop one. Do NOT use for tuning a slow query (use query-optimization), choosing isolation levels (use transaction-isolation), schema design (use data-modeling), or distributed-data partitioning (use sharding-strategy)."
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"indexing\",\"index\",\"B-tree\",\"hash index\",\"bitmap index\",\"GIN\",\"GiST\",\"BRIN\",\"LSM\",\"composite index\"]"
  triggers: "[\"should I add an index\",\"which columns to index\",\"B-tree vs hash\",\"is this index being used\",\"composite index column order\"]"
  examples: "[\"design indexes for a table with high-volume reads on user_id and date-range queries\",\"decide between a B-tree index and a partial index for a small subset of rows\",\"diagnose a query that ignores an existing index — likely a selectivity or type-coercion issue\",\"explain why adding a sixth index to a write-heavy table is usually wrong\"]"
  anti_examples: "[\"diagnose why this specific query is slow (use query-optimization)\",\"choose a database schema (use data-modeling)\",\"decide how to partition data across nodes (use sharding-strategy)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "An index is to a database what the back-of-the-book index is to a reference manual — you do not flip through every page to find every mention of 'Postgres'; you go to the I section, find the page numbers, and jump. Adding an index for every word in the book is technically possible and obviously wrong; the printer would still have to update every index every time the text changed, and the book would now spend most of its pages on indexes rather than content."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/data-engineering/indexing-strategy/SKILL.md
---

# Indexing Strategy

## Concept of the skill

Indexing is the design of auxiliary search structures (precomputed lookups) that let the database find rows without scanning every row. Every index maps column values to row locations through a chosen structure: *B-tree* (the right default; serves equality, range, prefix-match, and ORDER BY; flexible across most patterns), *hash* (equality only; no range), *bitmap* (low-cardinality columns in data warehouses; AND-combinations efficient), *GIN* (inverted index for arrays/JSON/full-text — many keys per row), *GiST / R-tree* (geospatial, range overlaps), *BRIN* (small summary indexes for naturally-ordered append-only data — timestamps), *LSM-tree* (write-optimized point-write workloads — Cassandra, RocksDB). Composite indexes on `(A, B, C)` serve queries with leading-column prefixes: `WHERE A`, `WHERE A AND B`, `WHERE A AND C` (uses A prefix, skips B in scan), `ORDER BY A, B, C`; but not `WHERE B` or `WHERE C` alone. Column-order rule: most-selective and most-filtered first. Covering indexes (INCLUDE clause) avoid the row-fetch step. Partial / filtered indexes target a small subset (e.g., `WHERE status = 'pending'`); expression indexes index `f(col)`.

Replaces full-table scans with structure-aware lookups. Solves the problem that without indexes, finding a few rows in millions requires reading every row. But every index speeds up *some* queries (those whose WHERE / JOIN / ORDER BY clauses match the index's structure) and slows down *every* write (the index must be updated on every INSERT, on every UPDATE touching indexed columns, and on every DELETE). The strategic question is not "which columns deserve an index" considered in isolation; it is the whole-database trade-off between read speed and write cost given the workload's actual access patterns. Sub-purposes: structure-pattern matching (B-tree for ordered, GIN for contains, BRIN for naturally-ordered, LSM for write-heavy), partial indexes for selective subsets, covering indexes for read-hot queries where row fetch is the bottleneck, expression indexes for computed access patterns.

Distinct from query-optimization, which owns the diagnosis and tuning of specific slow queries — query-optimization diagnoses; this skill is one of the responses (others: rewrite, ANALYZE, schema change, materialized view, accept cost). A team that adds an index before reading EXPLAIN ANALYZE is guessing. Distinct from data-modeling, which owns the schema and access patterns — the schema determines what indexes *can* exist; the access patterns determine which *should*. Distinct from schema-evolution, which owns how the schema changes over time — adding or dropping an index is itself a schema change, but the discipline of *which* indexes to have is in this skill. Distinct from transaction-isolation (concurrency correctness) and from sharding-strategy (cross-node partitioning); both can interact with indexing — cross-shard secondary indexes are a separate, harder problem — but they answer different questions. Distinct from storage / OS-level I/O tuning, which is a layer below indexing. An index is to a database what the back-of-the-book index is to a reference manual — you do not flip through every page to find every mention of 'Postgres'; you go to the I section, find the page numbers, and jump. Adding an index for every word in the book is technically possible and obviously wrong; the printer would still have to update every index every time the text changed, and the book would now spend most of its pages on indexes rather than content. The wrong mental model is that the answer to a slow query is always "add an index," and that the answer to a high-write-load table is to have all the read-relevant indexes anyway because reads matter more. Neither is correct. Adding an index without reading EXPLAIN ANALYZE is guessing — sometimes the existing index isn't being used because of a type coercion, a function on the column, a poor cardinality estimate, or low selectivity; the right response is *not* a new index but the underlying diagnosis. And every index has a per-write cost; write-heavy tables (audit logs, event streams, append-only tables) should have minimal indexes — primary key only, occasionally one more. A third misconception: that B-tree is always the right structure. It is the default and serves most patterns, but GIN, GiST, BRIN, and LSM serve specific patterns far better; defaulting to B-tree on geospatial, full-text, JSON-contains, or naturally-ordered timestamp data is leaving structural fit on the floor. A fourth: that an index that "exists" is being used — EXPLAIN ANALYZE is required to confirm; the planner may ignore an index for many reasons, and an unused index is pure cost (storage, write amplification, planner overhead) with no benefit.

## Coverage

The discipline of designing auxiliary data structures that let the database find rows quickly without scanning every row. Covers the structure catalog (B-tree, hash, bitmap, GIN, GiST, BRIN, LSM-tree) and the access patterns each matches, composite indexes and column-order rules, covering indexes and INCLUDE clauses, partial / filtered indexes, expression indexes, the maintenance cost of every index (storage, write amplification, lock impact, planner overhead), and the strategic question of treating the index set as an optimized portfolio rather than a per-column checklist.

## Philosophy of the skill
Indexes are a write/read trade. Every index speeds up some queries and slows down every write. The strategic discipline is not "which columns deserve an index" considered in isolation; it is the whole-database trade-off between read speed and write cost, given the workload's actual access patterns.

The wrong default is "add an index for every column ever filtered on." The wrong response to a slow query is always "add an index." The right discipline is to count the queries that would benefit, count the writes that would pay the cost, and check whether the index is actually used by the planner before keeping it.

The structure catalog matters. A B-tree is the right default for the vast majority of access patterns. Specialized structures (GIN for arrays/JSON/full-text, BRIN for naturally-ordered large columns, R-tree/GiST for geospatial) serve specific patterns far better than B-tree. Knowing which structure matches which pattern is the design vocabulary.

## Structure → Access Pattern Matrix

| Pattern | Best structure | Why |
|---|---|---|
| Equality lookup (`col = x`) | B-tree, hash | Both serve; B-tree is more flexible |
| Range (`col BETWEEN x AND y`) | B-tree | Hash doesn't support range |
| Prefix match (`col LIKE 'foo%'`) | B-tree | Range over a prefix |
| Contains (`'foo' = ANY(col)`, JSON contains) | GIN | Inverted index for many-keys-per-row |
| Full-text search | GIN or specialized (Elasticsearch) | Inverted index |
| Geospatial proximity | GiST / R-tree / PostGIS | Spatial structures |
| Range types / `&&` overlap | GiST | Range-aware structure |
| Naturally-ordered append-only (timestamps) | BRIN | Small summary index |
| Write-optimized point-write workload | LSM-tree | Write throughput primary |
| Low-cardinality AND-combination (data warehouse) | Bitmap | AND across columns efficient |
| Low-cardinality high-update workload | None (use partial or skip) | Bitmap updates poorly |

## Composite Index Column Order Rule

For an index on (A, B, C), the index serves queries with leading-column prefixes:

| Query | Uses index? |
|---|---|
| `WHERE A = x` | Yes |
| `WHERE A = x AND B = y` | Yes |
| `WHERE A = x AND B = y AND C = z` | Yes |
| `WHERE A = x AND C = z` | Yes (A prefix), but skips B in scan |
| `WHERE B = y` | No (no leading A) |
| `WHERE C = z` | No |
| `ORDER BY A, B, C` | Yes (sort avoided) |
| `ORDER BY A DESC, B DESC` | Yes (Postgres can reverse scan) |
| `ORDER BY B` | No |

Column order rule: put the most-selective and most-filtered column first.

## When To Add, Drop, Never Add

| Situation | Decision |
|---|---|
| Query is frequent, slow, and matches no current index | Add an index |
| Query is rare (monthly report); table is otherwise hot | Don't add — query can scan |
| Index exists but is reported as unused by `pg_stat_user_indexes` for 3+ months | Drop it |
| Column has low selectivity (boolean, status enum with two common values) | Use a partial index on the rarer value, or skip |
| Column is part of a composite key with leading columns covered by another index | Skip; the existing index serves |
| Column is a foreign key, joined frequently | Add an index (FK joins are common; the planner uses it) |
| Column is a foreign key, never joined | Optional; some teams add for CASCADE operations |
| Write-heavy table (audit log, event stream) | Minimal indexes — primary key only, occasionally one more |

## Verification

After applying this skill, verify:
- [ ] Index structure matches the access pattern (B-tree for ordered queries; GIN for contains; BRIN for naturally-ordered large columns; etc.). Default B-tree everywhere is not necessarily correct.
- [ ] Composite indexes have intentional column order. Most-selective and most-filtered column first.
- [ ] Index usage is monitored (`pg_stat_user_indexes` for Postgres, equivalents elsewhere). Unused indexes are dropped on a regular cadence.
- [ ] Write-heavy tables have minimal indexes. The number of indexes is justified against the table's write rate.
- [ ] Partial indexes are used where access patterns target a small subset of rows (e.g., `WHERE status = 'pending'`).
- [ ] Covering indexes (INCLUDE clause or composite with projected columns) are used for read-hot queries where row fetch is the bottleneck.
- [ ] EXPLAIN ANALYZE is used to verify the planner uses the added index. An index that exists but is ignored by the planner is pure cost.
- [ ] Index creation in production uses CONCURRENTLY (Postgres) or equivalent non-blocking patterns. Production deployment is part of the design.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Diagnosing a specific slow query | `query-optimization` | query-optimization owns diagnosis; this skill is one of the responses |
| Designing the table schema and entity relationships | `data-modeling` | data-modeling owns design; this skill owns the auxiliary structures |
| Reasoning about how the schema changes over time | `schema-evolution` | schema-evolution owns versioning; this skill owns one type of schema element |
| Choosing an isolation level | `transaction-isolation` | transaction-isolation owns concurrency; this skill owns retrieval |
| Reasoning about horizontal partitioning | `sharding-strategy` | sharding owns partition; this owns within-shard retrieval |
| Tuning OS / storage-layer performance | infrastructure / storage skills | storage I/O is a layer below indexing |

## Key Sources

- Winand, M. (2012, ongoing). [*Use The Index, Luke!*](https://use-the-index-luke.com/). The canonical practitioner guide to SQL indexing, with deep treatment of B-tree internals, composite indexes, and the planner's interaction with indexes.
- PostgreSQL Global Development Group. ["PostgreSQL Documentation — Indexes"](https://www.postgresql.org/docs/current/indexes.html). Reference for Postgres's full index-type catalog including GIN, GiST, BRIN, hash, and the planner's interaction with each.
- Petrov, A. (2019). *Database Internals: A Deep Dive into How Distributed Data Systems Work*. O'Reilly. Chapters on B-tree variants, LSM-trees, and storage structures; the modern reference on the structures underneath indexes.
- Ramakrishnan, R., & Gehrke, J. (2002, 3rd ed.). *Database Management Systems*. McGraw-Hill. Classic textbook treatment of indexing structures, query execution, and the planner.
- Garcia-Molina, H., Ullman, J. D., & Widom, J. (2008, 2nd ed.). *Database Systems: The Complete Book*. Pearson. Comprehensive reference on indexing theory and practice.
- Microsoft. ["SQL Server Index Architecture and Design Guide"](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide). Reference for SQL Server's index design including covering, filtered, and columnstore indexes.
- Oracle. ["Oracle Database Concepts — Indexes and Index-Organized Tables"](https://docs.oracle.com/database/121/CNCPT/indexiot.htm). Reference for Oracle's index structures including bitmap, function-based, and index-organized tables.
- Lehman, P. L., & Yao, S. B. (1981). ["Efficient Locking for Concurrent Operations on B-Trees"](https://dl.acm.org/doi/10.1145/319628.319663). *ACM TODS*, 6(4). Foundational paper on concurrent B-tree operations; basis of modern B-tree implementations.
- O'Neil, P., Cheng, E., Gawlick, D., & O'Neil, E. (1996). ["The Log-Structured Merge-Tree (LSM-tree)"](https://dl.acm.org/doi/10.1145/240858.240861). *Acta Informatica*. The foundational paper on LSM-trees, the structure underlying Cassandra, RocksDB, and many modern write-optimized stores.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `data-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: Use when designing indexes for a relational or NoSQL database: the index-as-precomputed-search-structure mental model, the catalog of structures (B-tree, hash, bitmap, GIN/GiST, BRIN, LSM-tree), the matching of structures to access patterns (equality, range, prefix, contains, geospatial), composite indexes and column order, covering indexes, partial / filtered indexes, the maintenance cost of every index (write amplification, storage, lock impact), and the rules for when to add an index, when not to, and when to drop one. Do NOT use for tuning a slow query (use query-optimization), choosing isolation levels (use transaction-isolation), schema design (use data-modeling), or distributed-data partitioning (use sharding-strategy).

**When to use**
- design indexes for a table with high-volume reads on user_id and date-range queries
- decide between a B-tree index and a partial index for a small subset of rows
- diagnose a query that ignores an existing index — likely a selectivity or type-coercion issue
- explain why adding a sixth index to a write-heavy table is usually wrong
- Triggers: `should I add an index`, `which columns to index`, `B-tree vs hash`, `is this index being used`, `composite index column order`

**Not for**
- diagnose why this specific query is slow (use query-optimization)
- choose a database schema (use data-modeling)
- decide how to partition data across nodes (use sharding-strategy)

**Related skills**
- Verify with: `data-modeling`, `query-optimization`, `database-migration`
- Related: `transaction-isolation`, `query-optimization`, `data-modeling`, `schema-evolution`, `connection-pooling`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: An index is to a database what the back-of-the-book index is to a reference manual — you do not flip through every page to find every mention of 'Postgres'; you go to the I section, find the page numbers, and jump. Adding an index for every word in the book is technically possible and obviously wrong; the printer would still have to update every index every time the text changed, and the book would now spend most of its pages on indexes rather than content.
- Common misconception: |

**Keywords**
- `indexing`, `index`, `B-tree`, `hash index`, `bitmap index`, `GIN`, `GiST`, `BRIN`, `LSM`, `composite index`

<!-- skill-graph-context:end -->
