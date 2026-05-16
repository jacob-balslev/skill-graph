---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: connection-pooling
description: "Use when reasoning about how an application manages its database connections: why every connection has a server-side cost, the difference between application-level pools (HikariCP, pgx pool, node-postgres Pool) and proxy-level pools (PgBouncer, Pgpool, ProxySQL), the three PgBouncer modes (session, transaction, statement) and their feature compatibility, the canonical pool-sizing math (Little's Law applied to database concurrency; Wooldridge's analyses), the failure modes (connection exhaustion, hot-loop reconnects, prepared-statement breakage under transaction pooling, idle-in-transaction leaks), and the diagnostic procedure when a workload is contending on connections instead of query work. Do NOT use for query-level performance (use query-optimization), for index design (use indexing-strategy), for read/write replica routing (use replication-patterns), or for cross-shard query coordination (use sharding-strategy)."
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
  - connection pooling
  - PgBouncer
  - HikariCP
  - pool sizing
  - session pooling
  - transaction pooling
  - statement pooling
  - prepared statements
  - idle in transaction
  - Little's Law
  - max_connections
  - serverless databases
triggers:
  - "what should max pool size be"
  - "PgBouncer transaction mode"
  - "too many connections error"
  - "connection exhaustion"
  - "prepared statements not working with PgBouncer"
examples:
  - "size a connection pool for a workload with N application servers and M cores per database"
  - "diagnose why a workload is bottlenecked on connections rather than query performance"
  - "decide between PgBouncer session mode and transaction mode for an application"
  - "explain why HikariCP recommends small pools instead of large ones"
anti_examples:
  - "tune a slow query (use query-optimization)"
  - "design indexes (use indexing-strategy)"
  - "route reads to a replica (use replication-patterns)"
  - "design partitioning across shards (use sharding-strategy)"
relations:
  related:
    - query-optimization
    - replication-patterns
    - sharding-strategy
    - transaction-isolation
  boundary:
    - skill: query-optimization
      reason: "query-optimization owns the cost of individual query work; this skill owns the cost of having a connection at all. A workload contending on connections has different symptoms than a workload contending on query work, and the diagnostic discipline differs."
    - skill: replication-patterns
      reason: "replication-patterns owns the routing of reads and writes across replicas; this skill owns the connection layer beneath that routing. They compose: a pooled architecture often pools to each replica separately."
    - skill: sharding-strategy
      reason: "sharding-strategy owns how data is partitioned across nodes; this skill owns how application connections to those nodes are pooled. A sharded architecture multiplies the pool-sizing surface — one pool per shard."
    - skill: transaction-isolation
      reason: "transaction-isolation owns the per-transaction concurrency-correctness contract; this skill owns the connection-level mechanics that determine whether a transaction's connection is held, released, or shared. PgBouncer's transaction mode in particular interacts with isolation level and session state."
  verify_with:
    - query-optimization
    - replication-patterns
concept:
  definition: "Connection pooling is the discipline of managing a finite set of database connections shared across many application threads, requests, or processes, because opening a database connection is expensive (network round-trips, authentication, session setup) and every open connection consumes server resources (a process or thread, memory for buffers and catalog state, locks on shared structures). The pool's job is to keep a small, sized-for-workload number of connections open, hand them out to application units of work for the brief time they need them, and return them to the pool. Pooling can happen at the application layer (in-process pool like HikariCP, pgx pool, node-postgres Pool) or at the proxy layer (an external service like PgBouncer or ProxySQL that multiplexes many client connections onto a smaller set of upstream database connections). The pooling mode (session, transaction, statement) determines what feature compatibility the pool preserves and what failure modes the application must handle. The pool size is a *throughput cap*, not a resource budget; sizing it correctly per Little's Law (concurrency = throughput × latency) is the central operational decision."
  mental_model: |
    Five primitives structure connection-pooling reasoning:

    1. **The connection cost.** Every database connection consumes server-side resources. In Postgres, each connection is a separate OS process with its own ~10MB+ memory footprint, its own per-connection cache, and its own slots in shared catalog/lock structures. Opening a connection requires TCP setup (1 RTT), TLS handshake (2 RTTs if not resumed), authentication (1–2 RTTs), and session initialization. The unit cost of "open then close per request" is hundreds of milliseconds and unsustainable server load. The pool exists because the alternative — opening on demand — does not scale.

    2. **Pool size = concurrency cap, not load average.** Little's Law states *concurrency = arrival rate × average service time*. A workload with 1000 requests/sec averaging 5ms of database work has a concurrency of 5 — only 5 connections are simultaneously busy at any instant. Pool sizing is governed by *peak concurrent in-flight queries*, not by request rate. The common mistake is "we have 100 application servers, so we need 100×4=400 pool slots"; the correct framing is "our peak concurrent DB-bound work is N; pool size = N + small headroom." HikariCP's documented recommendation is *small pools* (often single digits per app instance for OLTP); large pools usually indicate the workload is contending on the database (queries too slow) and the pool is masking the symptom.

    3. **Where the pool lives — application vs proxy.** *Application-level pools* live in the application process (HikariCP for JVM; pgx for Go; node-postgres Pool; psycopg2 SimpleConnectionPool; SQLAlchemy QueuePool). Each app instance has its own pool; total open connections = sum across app instances. *Proxy-level pools* (PgBouncer, Pgpool-II, ProxySQL, AWS RDS Proxy, Supavisor) sit between the application and the database, multiplexing many client connections onto a smaller upstream pool. The proxy decouples *client count* (large) from *server connection count* (small); essential when client count exceeds the database's `max_connections` (typical for serverless or auto-scaled deployments). They compose: most production architectures pool at both layers.

    4. **Pooling mode and feature compatibility (the PgBouncer matrix).** PgBouncer offers three modes that determine when the upstream connection is returned to the pool: *Session pooling* (return on client disconnect) — fully compatible with all Postgres features but offers no multiplexing benefit beyond avoiding open-close overhead. *Transaction pooling* (return on COMMIT/ROLLBACK) — high multiplexing benefit but breaks features that span transactions: prepared statements (until PgBouncer 1.21+ with prepared-statement support), advisory locks, `SET`/`SET LOCAL`, `LISTEN`/`NOTIFY`, cursors held across transactions, `WITH HOLD`. *Statement pooling* (return after each statement) — rare; breaks transactions entirely; useful only for stateless workloads. Choosing the mode is choosing what features the application is allowed to use. The trap: a team enables transaction pooling for scale, then weeks later a feature that uses session state breaks in subtle ways.

    5. **The failure modes catalog.** *Connection exhaustion* — every pool slot held, requests queue or fail; symptom of pool-too-small or queries-too-slow. *Idle-in-transaction* — connection holds a transaction open while the application does other work; blocks vacuum, holds row locks, consumes a slot indefinitely. *Hot-loop reconnect* — pool drops and re-opens connections faster than the database can clear sessions; manifests as `too many connections` despite low real load. *Prepared-statement breakage under transaction pooling* — application caches a server-side prepared statement keyed by name, but a subsequent transaction lands on a different upstream connection that doesn't have it. *Cross-connection assumption leaks* — application sets a session variable on one connection and reads it from another, getting different results because the pool gave it a different upstream. *Replica routing mismatch* — pool to the primary used for reads that could have gone to a replica, or pool to a stale replica used for reads that need primary consistency.

    The deep insight is that **the pool is a throughput throttle, not a resource budget**. Sizing too large doesn't make slow queries faster; it makes the database thrash and the symptom shift from "queue waiting for connection" to "queue waiting for buffer cache, locks, or CPU." Sizing too small produces queue waits. The right size is the smallest pool that doesn't queue under peak load — typically much smaller than teams initially set.

    The complementary insight is that **pooling mode determines feature surface**. The choice is not just operational; it shapes what the application is allowed to do at the database. Transaction pooling buys multiplexing in exchange for session-feature loss; statement pooling buys further multiplexing in exchange for transaction loss. Knowing which features the application uses — and the cross-product against the pooling mode — is preconditional to choosing a mode.
  purpose: |
    Connection pooling exists because the unit cost of opening a database connection is high (server-side process creation, memory allocation, authentication, session setup) and the per-request work is short, so opening per request would dominate latency and exhaust the database. The pool amortizes the open cost across many requests by keeping connections warm and handing them out for brief reuses.

    **Without pooling, throughput collapses.** A naive HTTP service that opens a fresh connection per request, runs a 1ms query, and closes the connection spends 200ms+ on connection lifecycle. The throughput ceiling is the connection-open rate the database can sustain, often <1000/sec on Postgres. Pooling raises the ceiling to the *query* rate the database can sustain, often 10,000+/sec.

    **Without sized pooling, connection counts grow until the database breaks.** A workload with no upper bound on connections is one outage away from production: a brief slowdown causes connections to accumulate, the database hits `max_connections`, and every new request fails. The pool's *cap* is the system's load-shedding mechanism — queue or fail fast rather than overload the database.

    **Without proxy pooling, serverless and auto-scaled deployments cannot connect.** A serverless platform that scales to 1000 concurrent function instances cannot reasonably hold 1000 database connections (Postgres `max_connections` is typically 100–500 in production). A proxy pool (RDS Proxy, Supavisor, PgBouncer) multiplexes the 1000 client connections onto 50 upstream connections, decoupling client scale from database concurrency.

    **Without understanding pooling mode, features break in production.** A team that enables PgBouncer transaction pooling without auditing the application's use of prepared statements, session variables, advisory locks, or `LISTEN`/`NOTIFY` will discover the breakage in production, intermittently, in patterns hard to reproduce. The discipline is to choose the mode against a known feature surface, not against a desired multiplication ratio.

    **The right pool size is workload-dependent and counter-intuitive.** Teams over-size pools because "more is safer" — but a too-large pool produces context-switch storms, buffer-cache thrashing, and lock contention. HikariCP's documented advice is to start small (e.g., `cores * 2` for the database's CPU count, then add a small buffer for I/O wait) and increase only when queue waits prove necessary. Pool sizing is one of the few places where "less is more" is operationally validated.

    **The pool is the place where database-level health becomes application-level latency.** A workload contending on the pool surfaces as request queueing in the application, not as slow queries in the database log. A team that doesn't monitor pool wait times will miss connection contention until the user complains. Pool instrumentation (`pool.active`, `pool.idle`, `pool.waiting`, `pool.acquire_time`) is the operational hygiene that makes contention legible.

    The deeper purpose is to make the *concurrency contract* between application and database explicit. A team that knows its pool size, peak concurrency, queue thresholds, and pooling mode has a contract it can reason about; a team that uses defaults and hopes is one workload spike away from an incident.
  boundary: |
    **Pooling is not load balancing.** A pool sends connections to one (or a small set of) upstream databases; routing reads vs writes, sharding across nodes, and replica selection are separate concerns. The pool is the connection layer; routing sits above it. Many production setups have one pool per upstream (one to the primary, one to each replica) and a routing layer above choosing among pools.

    **Pooling does not fix slow queries.** A workload with slow queries and a too-small pool will show queue waits; raising the pool size moves the symptom but doesn't fix the cause. The correct response to "the pool is exhausted" is *first* to check whether queries are slow (use `query-optimization`), and only after queries are fast to consider raising the pool size. Raising the pool to mask slow queries produces worse outcomes (CPU starvation, lock contention).

    **Application pool size sums across instances.** A pool size of 10 per app instance with 50 app instances means 500 upstream connections — which may exceed the database's `max_connections`. The per-instance pool number is per-instance; the database-side total is the sum. This is the case where a proxy pool (PgBouncer) becomes load-bearing: it caps the database-side total regardless of how many app instances exist.

    **Transaction pooling is not free multiplication.** PgBouncer in transaction mode can give 50x or 100x multiplexing — at the cost of breaking session-spanning features. The list of broken features is non-trivial: prepared statements (until PgBouncer 1.21+), `SET` variables (use `SET LOCAL` within transactions instead), advisory locks, `LISTEN`/`NOTIFY`, cursors held across transactions, `WITH HOLD CURSOR`, temporary tables that span transactions. Application code that uses any of these features must be audited before transaction pooling is enabled. The "free multiplication" framing has put applications into production-broken states.

    **Idle-in-transaction is the silent killer.** A connection that has begun a transaction but is now blocked on application work (waiting for an HTTP response from another service, holding a long lock, waiting on a user's input) holds a pool slot, prevents vacuum on its visible rows, and can deadlock with other transactions. The pattern is invisible in connection counts but visible in `idle_in_transaction_session_timeout` (Postgres) and pool-wait latency. Application code that does cross-service work inside a database transaction is the source of this problem; the fix is to scope transactions tightly.

    **Pool size advice does not generalize across workloads.** "Pool size = 10" works for some workloads and is catastrophic for others. OLTP point-query workloads need small pools (HikariCP defaults to 10). Long-running analytical workloads need very few connections (analytical queries can saturate CPU; many of them in parallel produce CPU contention). Workloads with mixed long+short queries need pool partitioning (separate pools for different query classes). The right size is measured against the specific workload, not copied from advice columns.

    **Serverless databases change the model.** Aurora Serverless v2, Neon, and similar autoscaling databases handle connection elasticity differently: some support extremely high connection counts (Aurora Serverless v2 supports thousands), some require proxy pooling (Neon recommends Supavisor or PgBouncer), some have built-in poolers (PlanetScale). The connection-pooling discipline still applies; the specific tooling differs.

    **Proxy pools are not transparent.** PgBouncer in transaction mode does not pass through every protocol message; some Postgres features behave differently. A team adopting PgBouncer must read the documentation on what is and is not preserved across the proxy; the proxy is not a drop-in replacement for a direct connection.

    **Connection age matters.** A connection that has been open for hours has accumulated transaction-id wraparound risk, may hold stale prepared statements, and can have memory bloat. Pools should rotate connections periodically (`maxLifetime` in HikariCP, `server_lifetime` in PgBouncer) to refresh state. A pool that never rotates is one with a long tail of subtle staleness.

    **Reconnect storms can take down the database.** A pool that drops and re-opens connections faster than the database can accept them (often during deploy churn or network partition recovery) produces a `too many connections` storm. Backoff and circuit-breaking on the pool side are operational hygiene; without them, recovery from a brief glitch becomes an outage.
  taxonomy: |
    By pool layer:
    - **Application-level pool (in-process)** — HikariCP (JVM), pgx pool (Go), node-postgres Pool (Node), psycopg2 SimpleConnectionPool / psycopg3 ConnectionPool (Python), SQLAlchemy QueuePool / NullPool, .NET ADO.NET pooling, Ruby ActiveRecord connection pool. Lives in app process; one pool per process; total = sum across processes.
    - **Proxy-level pool** — PgBouncer (most common for Postgres), Pgpool-II, ProxySQL (MySQL), AWS RDS Proxy, Supavisor (Supabase), PgCat. External service; multiplexes many client connections onto fewer upstream connections; caps database-side total regardless of client count.
    - **Built-in / native pool** — some managed databases (PlanetScale, Aurora Serverless) include built-in connection management; explicit external pooling is reduced or eliminated.
    - **Hybrid stacks** — application pool → proxy pool → database. Both layers contribute caps; sizing must consider both.

    By PgBouncer pooling mode (and equivalents):
    - **Session pooling** — connection returned to pool on client disconnect. Compatibility: full. Multiplexing: low (1:1 mostly, saves only open/close overhead). Use when full Postgres feature surface is needed.
    - **Transaction pooling** — connection returned on COMMIT/ROLLBACK. Compatibility: prepared statements pre-1.21 broken; session variables broken; advisory locks broken; LISTEN/NOTIFY broken; WITH HOLD cursors broken. Multiplexing: high (often 10x–100x). Most common production mode.
    - **Statement pooling** — connection returned after each statement. Compatibility: transactions broken. Multiplexing: highest. Rare; specific use cases only.

    By failure mode:
    - **Connection exhaustion** — pool full; requests queue or fail. Symptom: pool wait time spike; queries normal speed.
    - **Idle-in-transaction** — connection in transaction but no query running. Blocks vacuum, holds locks. Symptom: long-lived connections; transaction_id age growth; lock waits.
    - **Hot-loop reconnect** — pool repeatedly opens and closes connections, often during deploy. Symptom: `too many connections`; high reconnect rate; brief total outage.
    - **Prepared statement breakage (transaction mode)** — server-side prepared statement absent on the upstream connection the next transaction lands on. Symptom: errors about unknown prepared statement; pre-PgBouncer-1.21 issue.
    - **Cross-connection state leak** — `SET` variable set on connection A, read from connection B with a different value. Symptom: intermittent behavior depending on which upstream the pool happened to assign.
    - **Long-tail connection accumulation** — connections never rotate; stale state, memory bloat, transaction-id risk. Symptom: subtle degradation over weeks.

    By sizing methodology:
    - **Little's Law sizing** — pool size = peak concurrent in-flight queries; concurrency = arrival rate × average service time. The first-principles approach.
    - **HikariCP starting recommendation** — `cores * 2 + effective_spindle_count`; small pools for OLTP; raise only when queue waits prove necessary.
    - **Database-CPU-bound sizing** — for analytical or CPU-heavy workloads, pool size ≤ database CPU count. More is counterproductive.
    - **Per-tier partitioning** — separate pools for short queries and long queries to prevent one class from starving the other.
    - **Workload-class isolation** — separate pools for OLTP/analytical/admin to prevent cross-class contention.

    By operational concern:
    - **Pool wait time monitoring** — `pool.acquire_time_p99`; the canonical signal of pool-too-small or queries-too-slow.
    - **Idle-in-transaction monitoring** — `idle_in_transaction_session_timeout`; Postgres setting that kills idle-in-transaction connections after a threshold.
    - **Connection age rotation** — `maxLifetime` (HikariCP), `server_lifetime` (PgBouncer); periodic connection refresh.
    - **Reconnect backoff** — exponential backoff and circuit-breaker on pool reconnect; prevents reconnect storms.
    - **Health checks** — pool-side health check before handing out a connection (e.g., HikariCP `connectionTestQuery`); prevents handing out dead connections.

    By database / managed-service connection model:
    - **Postgres process-per-connection** — high per-connection cost; pooling essential. Typical `max_connections` 100–500.
    - **MySQL thread-per-connection** — lower per-connection cost than Postgres; pooling still important.
    - **SQL Server thread pooling** — built-in; per-connection cost lower; external pooling less common.
    - **Aurora Serverless v2** — supports very high connection counts; some workloads don't need external pooling.
    - **Neon, Supabase, Render Postgres** — Postgres-based; recommend Supavisor or PgBouncer for serverless clients.
    - **PlanetScale (Vitess)** — built-in connection management; external pooling not needed.
  analogy: |
    A restaurant with kitchen capacity for 50 simultaneous orders. Customers arrive at the front of house and need to interact with the kitchen to get food. There are two ways to handle this:

    *Naive model:* every customer walks to the kitchen, talks to a chef, gets their food, walks back. With one customer at a time, this works. With 200 customers waiting and 50 chefs, the kitchen becomes a mob — chefs interrupted constantly, orders mixed up, throughput collapses.

    *Pooled model:* a small team of waiters mediates between customers and the kitchen. The 200 customers tell waiters what they want; the waiters batch and serialize the kitchen interactions. The kitchen sees only 50 active waiter conversations at any time (pool size). When a waiter finishes one customer, they pick up the next. The kitchen's throughput is preserved.

    The waiters are the **connection pool**. The 50 maximum kitchen interactions are the **pool size**. The throughput of the system is limited by the kitchen's serving rate (database throughput), not by the waiter count.

    *Session pooling* is "each waiter is dedicated to one customer for the entire meal." Throughput multiplier: 1. The waiter is busy with their customer's whole interaction, even when the customer is reading the menu. Used when the customer needs continuity (some features need session state).

    *Transaction pooling* is "the waiter serves the customer through one course (transaction), then moves to whichever customer is ready for their next course." Throughput multiplier: high. The customer might be served their soup by waiter A and their main course by waiter B. Works *unless* the customer was relying on the same waiter remembering their dietary preferences (session state) — then the assumption breaks intermittently.

    *Statement pooling* is "every single request (statement) is a fresh waiter assignment." Throughput multiplier: highest. The customer can't reasonably hold a conversation; transaction continuity is lost. Rare in practice.

    **Pool sizing** is "how many waiters do we hire." Hiring too few means customers queue at the front of house (request queue). Hiring too many means waiters get in each other's way in the kitchen (CPU contention, lock contention at the database). The right number is the smallest count that keeps the front-of-house queue empty under peak load — measured, not guessed. Little's Law: concurrency = arrival rate × average service time. If 100 customers per minute each need 30 seconds of waiter attention, concurrency is 50 — and you need ~50 waiters, not 100, not 25.

    **Idle-in-transaction** is "a waiter took an order, walked partway to the kitchen, and stopped to take a phone call" — they're not freeing up to serve another customer, and they're blocking the kitchen line.

    **Hot-loop reconnect** is "every customer fires their waiter and hires a new one for each course" — pure overhead, no throughput benefit, the hiring process saturates HR.

    **A proxy pool (PgBouncer)** is a second level: the restaurant chain has 100 small storefronts (application instances), each with 5 in-house waiters (application pool), all connected to a central kitchen via 50 outbound trunk lines (proxy pool to database). The 500 in-house waiter slots are decoupled from the 50 kitchen slots. The chain can scale storefronts without overwhelming the central kitchen.

    Choosing pool size and mode is choosing what restaurant the team is operating, what features the menu offers, and how much overhead the operating model can absorb.
  misconception: |
    The most common misconception is that **more pool size = more throughput**. It does not. Pool size is a *concurrency cap*, not a load-handling capacity. Beyond the database's natural concurrency (often 2× CPU cores for OLTP, fewer for analytical), more pool slots produce CPU thrashing, buffer-cache contention, and lock waits. HikariCP's documented advice is small pools; teams over-size and produce worse latency.

    The second misconception is that **pool size scales with request rate**. It scales with *concurrent in-flight queries*, which is request rate × average query time (Little's Law). A workload at 10,000 req/sec with 1ms queries has concurrency of 10, not 10,000. Sizing the pool by request rate produces wildly over-sized pools.

    The third misconception is that **PgBouncer transaction mode is a drop-in replacement for direct connections**. It is not. Prepared statements (pre-1.21), session variables, advisory locks, LISTEN/NOTIFY, WITH HOLD cursors, and temporary tables that span transactions all behave differently or break. Adopting transaction mode without auditing the application's feature use produces intermittent production breakage.

    The fourth misconception is that **`SET` and `SET LOCAL` are interchangeable**. They are not. `SET` persists for the session; `SET LOCAL` persists only for the transaction. Under PgBouncer transaction mode, `SET` leaks across transactions on the shared upstream connection and is visible to other clients' transactions. `SET LOCAL` is the correct form; many teams discover this after a production incident.

    The fifth misconception is that **the pool eliminates connection-open cost**. It eliminates *per-request* connection-open cost. The pool itself opens connections (at startup, on growth, on rotation, after errors). Pool initialization is still expensive; a deploy that recreates all pools simultaneously can swamp the database (reconnect storm). Backoff and staggered start-up are operational hygiene.

    The sixth misconception is that **idle-in-transaction is the application's problem, not the pool's**. It is both. Idle-in-transaction often originates in application code (BEGIN, then await an HTTP call to another service, then COMMIT), but the pool surfaces it: the connection is held, the slot is unavailable, and other requests queue. Pool monitoring of long-held connections is the operational defense.

    The seventh misconception is that **prepared statement caching is incompatible with PgBouncer transaction mode**. Pre-1.21 this was true. PgBouncer 1.21+ supports prepared statements in transaction mode by name-tracking. Teams on outdated PgBouncer versions ship broken assumptions; upgrading PgBouncer is often the path of least resistance.

    The eighth misconception is that **one pool size fits all workloads**. It does not. OLTP workloads with point queries (1ms) need small pools (cores×2). Analytical workloads with multi-minute queries need very few connections (each consumes a database CPU for the duration). Mixed workloads need pool partitioning (separate pools per workload class) to prevent one class from starving another.

    The ninth misconception is that **proxy pools (PgBouncer) reduce latency**. They add a hop (TCP round-trip, protocol parsing). A direct connection is faster per request; the proxy is justified when client count exceeds what direct connections can support, not because the proxy is faster. Latency tradeoff is acceptable when the alternative is connection exhaustion.

    The tenth misconception is that **the default `max_connections` is fine**. Postgres ships with `max_connections = 100`; production Postgres on cloud-managed databases typically has 100–500. Cloud-managed Postgres often pins this number for resource reasons. Application-side pool size + per-instance count + replica connection count must sum to fit; teams that miss this discover during a scale event.

    The eleventh misconception is that **pool monitoring is optional**. It is not. Without `pool.acquire_time` instrumentation, a contending pool produces request queueing that looks like application latency, not database latency. Teams diagnose for hours before realizing the bottleneck is the pool, not the queries. Pool wait time, active count, and pending count are first-class operational metrics.

    The twelfth misconception is that **serverless databases eliminate the pooling problem**. They change it. Serverless platforms (Aurora Serverless v2, Neon, Supabase) have different connection elasticity, but the pooling discipline still applies: short queries, careful transaction scoping, monitoring of pool-side metrics, and proxy pooling for high-fanout serverless clients. The tooling changes; the discipline does not.
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
