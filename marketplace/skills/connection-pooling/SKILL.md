---
name: connection-pooling
description: "Use when reasoning about how an application manages its database connections: why every connection has a server-side cost, the difference between application-level pools (HikariCP, pgx pool, node-postgres Pool) and proxy-level pools (PgBouncer, Pgpool, ProxySQL), the three PgBouncer modes (session, transaction, statement) and their feature compatibility, the canonical pool-sizing math (Little's Law applied to database concurrency; Wooldridge's analyses), the failure modes (connection exhaustion, hot-loop reconnects, prepared-statement breakage under transaction pooling, idle-in-transaction leaks), and the diagnostic procedure when a workload is contending on connections instead of query work. Do NOT use for query-level performance (use query-optimization), for index design (use indexing-strategy), for read/write replica routing (use replication-patterns), or for cross-shard query coordination (use sharding-strategy)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: code-engineering
  deployment_target: portable
  taxonomy_domain: engineering/data
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"connection pooling\",\"PgBouncer\",\"HikariCP\",\"pool sizing\",\"session pooling\",\"transaction pooling\",\"statement pooling\",\"prepared statements\",\"idle in transaction\",\"Little's Law\"]"
  triggers: "[\"what should max pool size be\",\"PgBouncer transaction mode\",\"too many connections error\",\"connection exhaustion\",\"prepared statements not working with PgBouncer\"]"
  examples: "[\"size a connection pool for a workload with N application servers and M cores per database\",\"diagnose why a workload is bottlenecked on connections rather than query performance\",\"decide between PgBouncer session mode and transaction mode for an application\",\"explain why HikariCP recommends small pools instead of large ones\"]"
  anti_examples: "[\"tune a slow query (use query-optimization)\",\"design indexes (use indexing-strategy)\",\"route reads to a replica (use replication-patterns)\",\"design partitioning across shards (use sharding-strategy)\"]"
  relations: "{\"related\":[\"query-optimization\",\"replication-patterns\",\"sharding-strategy\",\"transaction-isolation\"],\"boundary\":[{\"skill\":\"query-optimization\",\"reason\":\"query-optimization owns the cost of individual query work; this skill owns the cost of having a connection at all. A workload contending on connections has different symptoms than a workload contending on query work, and the diagnostic discipline differs.\"},{\"skill\":\"replication-patterns\",\"reason\":\"replication-patterns owns the routing of reads and writes across replicas; this skill owns the connection layer beneath that routing. They compose: a pooled architecture often pools to each replica separately.\"},{\"skill\":\"sharding-strategy\",\"reason\":\"sharding-strategy owns how data is partitioned across nodes; this skill owns how application connections to those nodes are pooled. A sharded architecture multiplies the pool-sizing surface — one pool per shard.\"},{\"skill\":\"transaction-isolation\",\"reason\":\"transaction-isolation owns the per-transaction concurrency-correctness contract; this skill owns the connection-level mechanics that determine whether a transaction's connection is held, released, or shared. PgBouncer's transaction mode in particular interacts with isolation level and session state.\"}],\"verify_with\":[\"query-optimization\",\"replication-patterns\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "A connection pool is to a database what a taxi rank is to an airport — every taxi has a standing cost (driver salary, fuel, parking space); a rank with too few taxis leaves passengers queuing on the curb; a rank with too many burns money on idle taxis and clogs the access road. The right number is the smallest that doesn't queue under peak arrival rate, sized by how long each taxi trip actually takes — and adding more taxis doesn't make the trips faster, it just lets more start at once."
  misconception: "|"
  concept: "{\"definition\":\"Connection pooling is the discipline of managing a finite set of database connections shared across many application threads, requests, or processes, because opening a database connection is expensive (network round-trips, authentication, session setup) and every open connection consumes server resources (a process or thread, memory for buffers and catalog state, locks on shared structures). The pool's job is to keep a small, sized-for-workload number of connections open, hand them out to application units of work for the brief time they need them, and return them to the pool. Pooling can happen at the application layer (in-process pool like HikariCP, pgx pool, node-postgres Pool) or at the proxy layer (an external service like PgBouncer or ProxySQL that multiplexes many client connections onto a smaller set of upstream database connections). The pooling mode (session, transaction, statement) determines what feature compatibility the pool preserves and what failure modes the application must handle. The pool size is a *throughput cap*, not a resource budget; sizing it correctly per Little's Law (concurrency = throughput × latency) is the central operational decision.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/connection-pooling/SKILL.md
---

# Connection Pooling

## Coverage

The discipline of managing a finite set of database connections shared across many application threads, requests, or processes. Covers the connection cost (server-side process/thread, memory, locks), why pooling is required (open-cost amortization, throughput cap, load-shedding), application-level vs proxy-level pools, the three PgBouncer modes (session, transaction, statement) and their feature compatibility, the canonical pool-sizing math via Little's Law and HikariCP's analyses, the failure modes catalog (connection exhaustion, idle-in-transaction, hot-loop reconnect, prepared-statement breakage, cross-connection state leaks, long-tail accumulation), the operational concerns (wait-time monitoring, connection rotation, reconnect backoff, health checks), and the database-specific connection models (Postgres process-per-connection, MySQL thread-per-connection, serverless variants).

## Philosophy

The pool is a throughput throttle, not a resource budget. Sizing too large doesn't make slow queries faster — it makes the database thrash and shifts the symptom from "queue waiting for connection" to "queue waiting for CPU, buffer cache, or locks." Sizing too small produces queue waits. The right size is the smallest pool that doesn't queue under peak load — typically much smaller than teams initially set.

Pooling mode determines feature surface. The choice between session, transaction, and statement pooling is not just operational — it determines what features the application is allowed to use at the database. Transaction pooling buys multiplexing in exchange for session-feature loss; statement pooling buys further multiplexing in exchange for transaction loss. Knowing which features the application uses, and the cross-product against the pooling mode, is preconditional to choosing a mode.

The pool is the place where database-level health becomes application-level latency. A workload contending on the pool surfaces as request queueing in the application, not as slow queries in the database log. Pool instrumentation (`pool.active`, `pool.idle`, `pool.waiting`, `pool.acquire_time`) is the operational hygiene that makes contention legible.

## Sizing — Little's Law in Practice

**Little's Law:** concurrency = arrival rate × average service time.

| Workload | Arrival rate | Avg query time | Concurrency | Pool size |
|---|---|---|---|---|
| OLTP point query | 10,000 req/sec | 1 ms | 10 | 12–15 |
| OLTP transaction | 1,000 req/sec | 10 ms | 10 | 12–15 |
| Mixed read/write | 2,000 req/sec | 25 ms | 50 | 60–80 |
| Analytical | 100 req/sec | 500 ms | 50 | Pool partitioning recommended |

The pool size is *peak concurrency + small headroom*. Teams that size by request rate (treating pool size as a per-app-server quota) over-size by 10x or more, then discover the database is thrashing.

**HikariCP's documented advice:** start with `cores * 2 + effective_spindle_count` (e.g., 8 cores → pool size 18); raise only when measured queue waits prove a larger pool helps. Most OLTP pools are <20 per app instance.

## PgBouncer Mode Matrix

| Feature | Session | Transaction | Statement |
|---|---|---|---|
| Prepared statements (server-side) | ✅ | ✅ (1.21+) / ❌ (pre-1.21) | ❌ |
| `SET` session variables | ✅ | ❌ (use `SET LOCAL`) | ❌ |
| `SET LOCAL` (transaction-scoped) | ✅ | ✅ | ❌ |
| Advisory locks | ✅ | ❌ | ❌ |
| `LISTEN` / `NOTIFY` | ✅ | ❌ | ❌ |
| `WITH HOLD` cursors | ✅ | ❌ | ❌ |
| Temporary tables across transactions | ✅ | ❌ | ❌ |
| Transactions | ✅ | ✅ | ❌ |
| Multiplexing benefit | 1x | High (10–100x) | Highest |

**Default rule:** Transaction mode for production scale; verify the application uses no session-spanning features (or, if it does, audit each one). Session mode when full Postgres feature surface is required.

## The Failure Modes Catalog

| Symptom | Likely cause | First diagnostic |
|---|---|---|
| `too many connections` error | Pool size × instances > `max_connections`; reconnect storm | Sum app pools + replica pools; check reconnect rate |
| Request latency spike, query latency normal | Pool exhaustion (queries holding connections too long) | `pool.acquire_time_p99` vs query latency |
| Intermittent "prepared statement does not exist" | PgBouncer transaction mode, pre-1.21 | Upgrade PgBouncer or disable server-side prepares |
| Random session-variable values | `SET` (not `SET LOCAL`) under transaction pooling | Audit `SET` use; switch to `SET LOCAL` |
| Connections held for hours; transaction-id age growing | Idle-in-transaction | `pg_stat_activity` for long `idle in transaction` |
| Brief outage during deploy | Reconnect storm | Stagger app startup; add reconnect backoff |
| Slow degradation over weeks | Long-tail connection age (memory bloat, stale prepared statements) | Enable `maxLifetime` rotation |

## Verification

After applying this skill, verify:
- [ ] Pool size has been calculated against Little's Law for the workload — not copied from advice columns. Peak concurrency × small headroom, not request rate.
- [ ] Sum of (app pool size × app instances) + replica pools + admin connections fits inside the database's `max_connections` with headroom. The database-side total is bounded, not just the per-instance pool.
- [ ] If PgBouncer transaction mode is enabled, the application's use of prepared statements, `SET`, advisory locks, `LISTEN/NOTIFY`, and WITH HOLD cursors has been audited. Compatible patterns confirmed; incompatible patterns refactored.
- [ ] Pool instrumentation is in place: `pool.acquire_time`, `pool.active`, `pool.waiting`. Connection contention shows up as a first-class signal, not as opaque application latency.
- [ ] `idle_in_transaction_session_timeout` is set (Postgres) so leaked transactions don't hold pool slots indefinitely. Application code does not perform external service calls inside database transactions.
- [ ] Connection rotation (`maxLifetime` / `server_lifetime`) is configured so connections refresh and don't accumulate long-tail bloat.
- [ ] Reconnect backoff and circuit-breaking are configured so deploy churn or brief network partitions don't produce reconnect storms.
- [ ] If serverless or auto-scaled application instances are used, a proxy pool (PgBouncer, Supavisor, RDS Proxy) caps the database-side connection total. Client count and server connection count are decoupled.
- [ ] Long-running queries (>1s) and short-running queries are not in the same pool. Pool partitioning prevents one class from starving the other.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Tuning a slow query | `query-optimization` | query-optimization owns query-level cost; this owns connection-level cost |
| Designing indexes | `indexing-strategy` | indexing-strategy owns access-path design |
| Routing reads vs writes across replicas | `replication-patterns` | replication-patterns owns the routing layer above pooling |
| Partitioning data across shards | `sharding-strategy` | sharding-strategy owns the data-partition layer; pooling sits beneath it per shard |
| Choosing transaction isolation level | `transaction-isolation` | isolation owns the per-transaction concurrency contract |
| Designing the schema | `data-modeling` | data-modeling owns design; pooling is operational |

## Key Sources

- Brett Wooldridge. ["About Pool Sizing"](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing). HikariCP maintainer's canonical analysis; the source of the "small pools" doctrine. Cites Oracle Real-World Performance Group's empirical findings.
- Brett Wooldridge. ["HikariCP — Down the Rabbit Hole"](https://github.com/brettwooldridge/HikariCP/wiki/Down-the-Rabbit-Hole). Deep dive on connection pool implementation choices and overhead.
- PgBouncer Project. ["PgBouncer Documentation"](https://www.pgbouncer.org/usage.html). Reference for the three pooling modes and their feature compatibility. The 1.21 release notes document the prepared-statement support in transaction mode.
- PostgreSQL Global Development Group. ["PostgreSQL Documentation — Connection Pooling"](https://www.postgresql.org/docs/current/runtime-config-connection.html). Reference for `max_connections`, `idle_in_transaction_session_timeout`, and related configuration.
- Little, J. D. C. (1961). ["A Proof for the Queuing Formula: L = λW"](https://www.jstor.org/stable/167570). *Operations Research*, 9(3). The original Little's Law paper; basis for concurrency-based pool sizing.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Discussion of database concurrency limits and their interaction with application architecture.
- Amazon Web Services. ["Amazon RDS Proxy"](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html). Managed proxy pool documentation; surfaces the serverless-vs-pool tension and the proxy's role.
- Supabase. ["Supavisor — Scalable Postgres Connection Pooler"](https://github.com/supabase/supavisor). Open-source proxy pool documentation; the recommended pooler for Neon and Supabase serverless workloads.
- Markus Winand. ["Performance — Open Source Database Pool Sizing"](https://use-the-index-luke.com/). Practitioner reference cross-cited from `indexing-strategy`; the chapter on operational concerns.
