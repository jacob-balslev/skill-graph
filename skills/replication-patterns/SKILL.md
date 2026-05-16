---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: replication-patterns
description: "Use when designing how a database keeps multiple copies of its data in agreement across nodes for availability, read scaling, and disaster recovery: the three foundational topologies (single-leader / primary-replica, multi-leader / multi-primary, leaderless / quorum), synchronous vs asynchronous replication and the replication-lag trade-off, log shipping vs statement replication vs trigger-based replication, the read-after-write consistency problem and its mitigations (sticky session, read-from-leader, monotonic reads), the failover model and split-brain risk, and the relationship to the CAP/PACELC choices the topology realizes. Do NOT use for horizontal partitioning across nodes (use sharding-strategy), the CAP theoretical frame itself (use cap-theorem-tradeoffs), single-node transactional guarantees (use acid-fundamentals), or query tuning (use query-optimization)."
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
  - replication
  - primary replica
  - multi-leader
  - leaderless
  - quorum
  - synchronous replication
  - asynchronous replication
  - replication lag
  - read-after-write
  - failover
  - split brain
  - log shipping
  - WAL streaming
triggers:
  - "single-leader vs multi-leader"
  - "synchronous vs async replication"
  - "what happens on failover"
  - "split brain"
  - "read-after-write consistency"
examples:
  - "design replication topology for a service with one region writing and three regions reading"
  - "decide between synchronous and asynchronous replication given a target RPO"
  - "diagnose stale reads after a write — likely replication lag without read-after-write handling"
  - "explain the split-brain risk in multi-leader replication"
anti_examples:
  - "horizontally partition data across nodes (use sharding-strategy)"
  - "reason about the CAP theorem abstractly (use cap-theorem-tradeoffs)"
  - "explain ACID properties (use acid-fundamentals)"
relations:
  related:
    - cap-theorem-tradeoffs
    - acid-fundamentals
    - sharding-strategy
    - transaction-isolation
  boundary:
    - skill: cap-theorem-tradeoffs
      reason: "cap-theorem-tradeoffs owns the theoretical frame for the consistency-availability trade-off; this skill owns the operational topologies and protocols that realize a chosen position on that trade-off. The two compose: CAP names the choice; replication-patterns is one of the realizations."
    - skill: sharding-strategy
      reason: "sharding-strategy owns horizontal partitioning of data across nodes (different nodes hold different data); this skill owns replication of the same data across nodes (multiple nodes hold the same data). The two often combine in production systems but answer different questions."
    - skill: acid-fundamentals
      reason: "acid-fundamentals owns the single-system transactional model; this skill owns the multi-node replication patterns that distributed systems use to scale, replicate, and survive failure. Replication often relaxes some ACID properties (most notably durability and isolation in async modes)."
  verify_with:
    - cap-theorem-tradeoffs
    - sharding-strategy
concept:
  definition: "Replication is the discipline of keeping multiple copies of the same data on multiple nodes so that the system can serve reads from any copy, survive the failure of any node, or both. The three foundational topologies are single-leader (primary-replica; one node accepts writes, others receive a stream of changes), multi-leader (multi-primary; multiple nodes accept writes and reconcile), and leaderless (quorum; clients write to a quorum of nodes directly). Each topology has its own consistency, availability, conflict-handling, and operational properties; choosing among them is choosing the system's CAP/PACELC position and accepting the operational complexity that comes with it. Synchronous vs asynchronous replication is an orthogonal choice within each topology, trading durability/consistency against latency. The discipline is matching the topology and the synchrony choice to the workload's actual requirements for read scaling, write availability, recovery point objective (RPO), and recovery time objective (RTO)."
  mental_model: |
    Five primitives structure replication reasoning:

    1. **The three topologies** — **Single-leader (primary-replica)**: one leader accepts all writes; replicas receive a replication stream (WAL, binlog, oplog) and apply it. Reads can come from leader (strong) or replicas (eventual). Standard for relational databases and read-heavy workloads. **Multi-leader (multi-primary)**: multiple nodes accept writes; changes propagate to other leaders; conflicts can arise and need resolution (last-write-wins, CRDTs, application-level merge). Used for multi-region writes and active-active disaster recovery. **Leaderless (quorum)**: clients write to N nodes directly; success requires W writes acknowledged out of N; reads require R reads of N. Used in Dynamo-style systems (Cassandra, Riak, DynamoDB).

    2. **Synchronous vs asynchronous** — orthogonal to topology. **Synchronous**: the leader waits for at least one (or quorum of) replica(s) to acknowledge before acknowledging the write to the client. Strong durability and consistency at the cost of latency. **Asynchronous**: the leader acknowledges the write immediately; replicas catch up later. Low latency at the cost of potential data loss if the leader fails before the replica has caught up. **Semi-synchronous**: wait for at least one replica acknowledgment (sometimes with timeout fallback to async).

    3. **Replication mechanism** — how changes propagate. **Statement-based**: ship the SQL statements; replicas re-execute them. Simple; sensitive to non-determinism (NOW(), RAND(), triggers with side effects). **Row-based (WAL/binlog streaming)**: ship the actual row changes the leader produced. Standard in modern systems; deterministic. **Trigger-based**: triggers on the source write to a replication table; an external process applies changes elsewhere. Flexible (cross-database); expensive at scale. **Logical replication**: ship logical changes with column-level semantics; supports table-level subscription, partial replication, cross-version upgrades.

    4. **The read-after-write consistency problem** — in async replication, a client that writes to the leader and then immediately reads from a replica may not see its own write yet. Mitigations: **read-your-writes / sticky session** (the client routes to the leader for a window after its write), **monotonic reads** (the client always reads from a replica at least as up-to-date as its last read), **read-from-leader** (give up read scaling for this query), **causal consistency tracking** (vector clocks or version tokens). The mitigation must be chosen explicitly; defaulting to "read from any replica" produces user-visible stale-data bugs.

    5. **Failover and split brain** — when the leader fails, a replica is promoted. **Manual failover**: an operator triggers promotion. **Automatic failover**: a coordinator (Patroni, Repmgr, Pacemaker, Raft consensus) detects leader failure and promotes. **Split brain**: two nodes both believe they are leader (network partition between them; each side promoted a leader). Split brain produces divergent state that must be reconciled. Quorum-based promotion (Raft, Paxos) prevents split brain by requiring majority agreement; non-quorum promotion can split. The discipline is using a quorum-based promotion mechanism for any system that must avoid split brain.

    The deep insight is that **replication topology determines the consistency-availability-latency surface, and the mechanism determines the operational complexity**. A single-leader async replica setup is the simplest production replication design and the right answer for the majority of workloads. Multi-leader and leaderless add capabilities (multi-region writes, no single-point-of-failure for writes) at the cost of conflict resolution and operational complexity. The discipline is starting with single-leader and moving to a more complex topology only when the workload's requirements demand it.

    The complementary insight is that **replication does not eliminate the need to think about consistency**. Async replication makes "stale reads" a real failure mode that the application must handle. Sync replication makes "leader-waits-for-replica" a real latency cost. The right consistency model for each query is a design choice, not a default.
  purpose: |
    Replication exists because the alternative — running on a single node — has three failure modes that compound at scale.

    **Single-node availability is bounded.** A single node fails; without replication, the system goes down for the duration of repair (hours to days). Replication gives the system a hot standby that can take over in seconds to minutes. The cost is operational complexity (failover, monitoring); the benefit is multi-9s availability.

    **Single-node read throughput is bounded.** A single node serves a finite number of reads per second; once the read workload exceeds that, the system slows down or fails. Replicas serve reads in parallel, scaling read throughput nearly linearly with replica count for read-mostly workloads.

    **Single-node geographic latency is bad.** A user in Tokyo reading from a database in Virginia pays 150ms of round-trip latency. Replicating to a Tokyo replica brings the latency under 10ms for those reads. For globally-distributed services, this is the difference between a usable product and an unusable one.

    **Replication enables disaster recovery.** A replica in a different region (or different cloud, or different physical site) is the recovery point if the primary region fails. Without replication, regional disaster means data loss; with replication, it means failover.

    **Replication enables online upgrades.** A primary-replica setup lets the team upgrade the replica's version, fail over to it, then upgrade what was the primary. This is the standard zero-downtime database upgrade pattern.

    The cost of replication is significant. Asynchronous replication admits replication lag (replicas can be seconds or minutes behind), which produces user-visible "stale read" failure modes that the application must handle. Synchronous replication eliminates this at the cost of write latency (the write waits for replica acknowledgment). Multi-leader and leaderless topologies require conflict resolution that simple primary-replica doesn't. Split-brain risk requires quorum-based promotion. Operational tooling (monitoring, alerting, failover automation) is a real engineering investment.

    The discipline is treating replication as a *capability the architecture builds on*, not as a feature the database provides automatically. A team that turns on replication without designing the read-after-write handling, the failover procedure, and the lag-monitoring will discover the failure modes the hard way.

    The deeper purpose is to give the system the *fault tolerance and scaling capacity* that single-node systems cannot match, while making the trade-offs explicit. A team that knows its replication topology, its synchrony choice, and its consistency-handling strategy has internalized a real distributed-systems discipline; a team that runs replication as a black-box "we have HA" has not.
  boundary: |
    **Replication is not sharding.** Sharding partitions data across nodes (different nodes hold different data); replication copies the same data across nodes. They compose — a sharded system can replicate each shard — but they answer different questions. Sharding addresses storage and write capacity; replication addresses availability, read capacity, and disaster recovery.

    **Replication does not eliminate the need for backups.** A replica is a copy of the current state; a backup is a recoverable historical snapshot. A bug in the application that corrupts data is replicated to all replicas instantly; only a backup (or a delayed replica designed for this purpose) is recoverable to a pre-corruption state.

    **Async replication does not provide strong consistency.** A read from an async replica may not reflect the most recent write. Applications must handle this explicitly (read-from-leader for read-after-write, sticky session, monotonic reads) or accept stale-data failure modes.

    **Sync replication does not eliminate replication lag entirely.** It eliminates the *acknowledged-but-not-replicated* window. Read-replicas in sync mode still have a small window during commit propagation. And sync replication's write latency is real: writes wait for replica round-trip time.

    **Multi-leader is not "no single point of failure for writes." It is "no single point of failure for writes, *at the cost of conflict resolution*."** Multi-leader systems must define how to merge concurrent writes to the same row from different leaders. Last-write-wins is simple but discards data. CRDTs preserve merge semantics but constrain the data model. Application-level merge is custom logic. There is no free lunch.

    **Quorum (leaderless) replication does not require leaders, but quorum reads cost latency.** Dynamo-style systems do W writes and R reads of N total nodes; W + R > N gives strong consistency, but R reads mean reading from R nodes per query. The latency is bounded by the slowest of the R nodes. Quorum is conceptually elegant; operationally expensive at scale.

    **Failover is not free.** Automatic failover requires a coordinator (Raft, Patroni, etc.); the coordinator can itself fail; the failure mode is more complex than a single-node failure. Manual failover requires operators on call. Both are real engineering investments.

    **Split brain is a real risk, not a theoretical one.** Network partitions happen; promoted-leader-while-old-leader-still-up scenarios produce divergent writes. The discipline is using quorum-based promotion (majority must agree before promoting) and fencing mechanisms (the old leader's writes are rejected once promotion happens). Without these, split brain produces silent data divergence.

    **A read replica is not a hot standby is not a backup is not a disaster-recovery target.** Each has different recovery characteristics. A read replica is for read scaling. A hot standby is for fast failover. A backup is for point-in-time recovery. A DR target is for regional failure. A system may need any combination; each has its own configuration.

    **Replication lag should be monitored, not assumed acceptable.** Lag spikes (minutes or hours of falling behind) happen — usually from long-running queries on the replica, long-running transactions on the primary, or network issues. Without monitoring, the team discovers lag when users complain about stale data. With monitoring, lag is a leading indicator the team can act on.
  taxonomy: |
    By topology:
    - **Single-leader (primary-replica / master-slave)** — one leader accepts writes; replicas receive a change stream. Standard.
    - **Multi-leader (multi-primary / active-active)** — multiple nodes accept writes; changes propagate; conflicts must be resolved. Used for multi-region writes.
    - **Leaderless (quorum / Dynamo-style)** — clients write to N nodes; success at W; reads at R. Used in Cassandra, DynamoDB, Riak.

    By synchrony:
    - **Synchronous** — leader waits for replica(s) before ack. Strong durability; higher latency.
    - **Asynchronous** — leader acks immediately; replicas catch up. Low latency; possible data loss on leader failure.
    - **Semi-synchronous** — wait for at least one replica with timeout fallback to async.
    - **Quorum-synchronous** — wait for W replicas (leaderless).

    By mechanism:
    - **Statement-based** — ship SQL statements; replicas re-execute. Simple; sensitive to non-determinism.
    - **Row-based (logical / WAL streaming)** — ship row changes; deterministic. Standard.
    - **Trigger-based** — application-layer replication via triggers and queues. Flexible; expensive.
    - **Logical replication** — column-level row changes; supports partial replication, cross-version, table-level subscription.
    - **Physical (block-level)** — replicate disk blocks; the simplest mechanism but bound to identical major versions.

    By replica role:
    - **Hot standby** — replica ready to be promoted on failover.
    - **Read replica** — serves read queries; eventual or strong consistency depending on synchrony.
    - **Delayed replica** — intentionally lagging (hours); recoverable from operator error.
    - **Cascading replica** — replica of a replica; reduces leader load.

    By failover:
    - **Manual** — operator triggers promotion.
    - **Automatic with quorum** — coordinator (Raft, Patroni) detects failure; majority agrees; promotion is split-brain-safe.
    - **Automatic without quorum** — heuristic-based failover; risk of split brain.
    - **STONITH (Shoot The Other Node In The Head)** — fencing mechanism; ensures old leader is killed before new leader takes over.

    By read-after-write handling:
    - **Read-from-leader** — client routes back to leader for a window after writing.
    - **Sticky session** — client always reads from the same replica for the session.
    - **Monotonic reads** — client tracks last-seen version; replica must be at least that fresh.
    - **Wait-for-replica** — client waits until replica catches up (via version-token check).
    - **Accept stale reads** — application tolerates the staleness; common for read-mostly workloads where staleness is acceptable.

    By conflict resolution (multi-leader and leaderless):
    - **Last-write-wins (LWW)** — most recent timestamp wins. Simple; loses data on concurrent updates.
    - **CRDTs (Conflict-free Replicated Data Types)** — types with mathematically-defined merge semantics. Strong eventual consistency; constrained data model.
    - **Vector clocks** — track causal history; surface conflicts for application resolution.
    - **Application-level merge** — application-specific logic for combining concurrent changes.

    By production system:
    - **Postgres**: physical streaming replication, logical replication (Postgres 10+).
    - **MySQL**: binlog-based replication; semi-sync; group replication.
    - **MongoDB**: oplog-based replication with replica sets and automatic failover.
    - **Cassandra**: leaderless quorum with tunable consistency.
    - **DynamoDB**: leaderless internal replication with eventual or strong consistency choice.
    - **CockroachDB / Spanner**: synchronous replication via Raft / Paxos for strong consistency.
  analogy: |
    A bank with branches. The bank's records exist in multiple branches so customers can do business anywhere, and so a fire in one branch doesn't destroy the bank's records.

    **Single-leader** is the model where one main office is the authoritative source. All transactions are recorded at the main office; the branches receive copies (overnight courier, hourly fax, or live feed) and serve customer questions from their copy. Customers can deposit and withdraw at branches, but those transactions must go to the main office for confirmation before settling. If the main office burns down, a branch becomes the new main office.

    **Multi-leader** is the model where each branch is also authoritative. Customers can deposit and withdraw at any branch; the branch records the transaction locally and propagates a copy to all other branches. When two customers simultaneously deposit at branch A and withdraw the same amount at branch B from the same account, there's a conflict — both branches recorded a state that the other will need to merge. The bank needs a defined policy for how to resolve such conflicts.

    **Leaderless (quorum)** is the model where customers don't go to a single branch but instead to a teller team. The teller team writes the transaction to several branches simultaneously and confirms it once a majority have written. Reads work the same way — a teller checks the customer's balance at several branches and returns the majority answer. The protocol guarantees consistency without designating any branch as primary.

    **Synchronous replication** is the courier-confirmation rule: the main office doesn't tell the customer "your deposit is recorded" until at least one branch has confirmed receiving the copy. Slow but safe — if the main office burns down, the branch has the record. **Asynchronous** is "tell the customer right away; the courier will deliver the copy tonight." Fast but if the main office burns before the courier arrives, the transaction is gone.

    **Replication lag** is the time between the main office recording a transaction and the branch having the copy. **Read-after-write consistency** is the customer who deposited at the main office walking into a branch and asking for their balance — if the branch hasn't received the copy yet, the customer sees a stale balance. The mitigations are routing the customer back to the main office for a window after their deposit, or waiting at the branch until the copy arrives.

    **Failover** is when the main office burns down and a branch takes over. **Split brain** is the disaster scenario where the courier network is broken; the branch thinks the main office is gone and declares itself the new main office, while the original main office is still operating. Two main offices are now accepting transactions independently; reconciling them later is painful or impossible. The discipline of quorum-based promotion (a branch only becomes the new main office if a majority of branches agree) prevents this.
  misconception: |
    The most common misconception is that **replication eliminates the need for backups**. It does not. A replica is the current state; a backup is a recoverable historical snapshot. Application bugs that corrupt data replicate instantly; only backups (or delayed replicas) recover to pre-corruption states.

    The second misconception is that **async replication is "almost as good as sync"**. It is materially different. Async admits a window where committed-on-primary writes are not yet on replicas; if the primary fails in that window, those writes are lost (RPO > 0). For systems where any data loss is unacceptable, async is wrong.

    The third misconception is that **multi-leader is "no single point of failure for writes."** It is — at the cost of conflict resolution that single-leader doesn't have. Two leaders accepting writes to the same row from different clients produce conflicts that the system must resolve, often by discarding data (LWW) or with custom merge logic. Multi-leader is a trade-off, not a free win.

    The fourth misconception is that **read replicas scale read throughput linearly**. They scale it nearly linearly for read-mostly workloads where staleness is tolerable. Write-heavy workloads see replication lag grow; tolerance for stale reads on replicas determines how usable they are. Naive "throw replicas at it" without addressing the lag and consistency design produces a system that scales reads but is incorrect under load.

    The fifth misconception is that **failover is automatic and free**. It requires a coordinator (which can fail itself), a quorum mechanism (which has latency cost), and operator-tested procedures (which need rehearsal). Untested failover is failover that fails the first time it's needed. The first failover in production is rarely the smoothest.

    The sixth misconception is that **split brain only happens in pathological networks**. Network partitions are routine. The risk is real on any system without quorum-based promotion. The mitigation is using Raft, Paxos, or another quorum protocol — not "we don't expect partition."

    The seventh misconception is that **logical replication is just a faster physical replication**. They have different properties. Physical replication is faster, bound to identical versions, copies everything. Logical replication is slower, version-flexible, supports table-level subscription. They serve different goals; the choice depends on whether the replica needs to differ from the source.

    The eighth misconception is that **replication lag is a Postgres-specific issue**. Every async-replication system has it. MySQL, MongoDB, Cassandra, DynamoDB, MS SQL Server — all have lag windows in async modes. Monitoring lag and designing for it is universal.

    The ninth misconception is that **read-after-write handling is the application's problem alone**. It is, but the system provides the building blocks: version tokens, leader-read routing, sticky-session support, monotonic-read guarantees. Designing the application-database integration to use these primitives is the discipline; ignoring them produces user-visible stale-data bugs.

    The tenth misconception is that **quorum (leaderless) replication is simpler than primary-replica**. It is conceptually elegant but operationally more complex. Consistency tuning per query (CONSISTENCY LEVEL in Cassandra), conflict resolution (vector clocks or LWW), repair processes (anti-entropy gossip) — all are additional operational concerns. Primary-replica is the simpler default for the majority of workloads.
---

# Replication Patterns

## Coverage

The catalog of replication topologies and the operational discipline that makes them work in production. Covers the three foundational topologies (single-leader / primary-replica, multi-leader / multi-primary, leaderless / quorum), the synchrony spectrum (sync, semi-sync, async, quorum-sync), the mechanism choices (statement-based, row-based, trigger-based, logical, physical), the read-after-write consistency problem and its mitigations (sticky session, read-from-leader, monotonic reads, version tokens), the failover model and quorum-based split-brain prevention, the conflict-resolution choices in multi-leader and leaderless systems (LWW, CRDTs, vector clocks, application merge), and the relationship to the CAP/PACELC choices the topology realizes.

## Philosophy

Replication is the discipline that gives a database fault tolerance, read scaling, and disaster recovery — at the cost of consistency-handling, conflict resolution, and operational complexity.

The default starting point is single-leader with asynchronous replication: simple, well-understood, sufficient for most read-mostly workloads. The departures from this default — multi-leader, leaderless, synchronous, geographic — each address a specific requirement (multi-region writes, strong consistency under partition, RPO=0) and add proportional complexity.

The most common production failures are not in the replication topology itself but in the application's handling of its consequences: stale reads producing user-visible bugs, split brain producing silent data divergence, failover producing unrehearsed surprises. The discipline is treating replication as an architecture the application is co-designed with, not a database feature that handles itself.

## Topology Selection

| Topology | Best for | Trade-offs |
|---|---|---|
| Single-leader, async | Read-heavy workloads with tolerance for stale reads | Replication lag; possible data loss on leader failure |
| Single-leader, sync | Workloads requiring RPO=0 | Write latency; replica failure can block writes |
| Multi-leader | Multi-region writes; active-active disaster recovery | Conflict resolution complexity |
| Leaderless (quorum) | High availability with tunable consistency | Read latency = slowest of R; quorum-sizing decisions |
| Synchronous via Raft/Paxos (Spanner, CockroachDB) | Strong consistency at scale | High write latency for distant replicas |

The starting point for most workloads is single-leader async; depart from this default only when the workload requires it.

## Synchronous vs Asynchronous Trade-off

| Property | Synchronous | Asynchronous |
|---|---|---|
| Write latency | Higher (waits for replica) | Lower (acks immediately) |
| RPO (data loss on failure) | Zero | Up to lag window |
| Read consistency from replicas | Strong | Eventual |
| Replica failure impact | Can block writes | None |
| Use case | High-stakes financial transactions, strong-RPO systems | Most production read-replicas |

Semi-sync (wait for one replica with timeout-to-async fallback) is the middle ground; production-default for many systems.

## Read-After-Write Mitigations

| Mitigation | How it works | Cost |
|---|---|---|
| Read-from-leader for a window after write | Client routes back to leader for N seconds | Loses read scaling for write-heavy users |
| Sticky session | Client always reads from same replica | Replica failure invalidates session |
| Monotonic reads | Client tracks last-seen version; replica must be ≥ that fresh | Requires version-token plumbing |
| Wait-for-replica | Client waits until replica catches up | Adds latency to the read |
| Accept stale reads | Application tolerates staleness | Only viable when stale data is OK |

Every read-mostly workload with async replicas must choose one. Defaulting to "read from any replica" produces stale-data bugs.

## Failover and Split-Brain Prevention

| Mechanism | Split-brain risk | Used by |
|---|---|---|
| Manual operator failover | None (if procedure is correct) | Small / legacy systems |
| Heuristic auto-failover (no quorum) | High under partition | Older Postgres tools (without proper consensus) |
| Quorum-based promotion (Raft / Paxos) | Eliminated by majority requirement | Modern HA tools (Patroni, etcd, CockroachDB internal) |
| STONITH fencing | Old leader killed; cannot continue writing | Pacemaker / Corosync HA |

A system that must not split-brain uses quorum-based promotion. The cost is requiring an odd number of voting nodes ≥ 3.

## Verification

After applying this skill, verify:
- [ ] The replication topology is intentional and documented: single-leader / multi-leader / leaderless; sync / async / semi-sync; physical / logical / trigger-based.
- [ ] Read-after-write consistency is handled explicitly. Sticky session, read-from-leader, monotonic reads, version tokens, or accept-stale is a named choice.
- [ ] Replication lag is monitored. Lag thresholds trigger alerts before users notice.
- [ ] Failover procedure is documented, tested, and rehearsed. Untested failover is failover that fails first time.
- [ ] Split-brain prevention uses quorum-based promotion for any system requiring it. Heuristic failover is recognized as risky.
- [ ] Backups exist separately from replication. Replica state and backup state are distinguished.
- [ ] For multi-leader: the conflict resolution mechanism (LWW / CRDT / vector clocks / app merge) is defined and tested with concurrent-write scenarios.
- [ ] For leaderless: W and R values are chosen for the workload's consistency-vs-latency target; W+R>N if strong consistency is required.
- [ ] Cross-region replication latency is measured and accepted as part of the design budget.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Horizontally partitioning data across nodes | `sharding-strategy` | sharding partitions data; replication copies it |
| Reasoning about the CAP/PACELC theoretical frame | `cap-theorem-tradeoffs` | CAP names the trade-off; this skill realizes it |
| Single-node transactional guarantees | `acid-fundamentals` | ACID is the single-system frame |
| Choosing isolation levels | `transaction-isolation` | transaction-isolation owns concurrency; this owns multi-node |
| Indexing | `indexing-strategy` | indexing is within-node retrieval |
| Tuning a slow query | `query-optimization` | query-optimization is per-query |

## Key Sources

- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Chapter 5 (Replication) — modern comprehensive treatment of all three topologies with practical detail.
- Lamport, L. (1998). ["The Part-Time Parliament"](https://lamport.azurewebsites.net/pubs/lamport-paxos.pdf). *ACM TOCS*, 16(2). The Paxos consensus algorithm; foundation of synchronous replication with split-brain prevention.
- Ongaro, D., & Ousterhout, J. (2014). ["In Search of an Understandable Consensus Algorithm (Raft)"](https://raft.github.io/raft.pdf). *USENIX ATC 2014*. The Raft consensus algorithm; basis of etcd, CockroachDB, many modern HA systems.
- DeCandia, G., Hastorun, D., Jampani, M., et al. (2007). ["Dynamo: Amazon's Highly Available Key-Value Store"](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf). *SOSP 2007*. The foundational paper on leaderless (Dynamo-style) replication; basis of Cassandra, Riak, DynamoDB.
- PostgreSQL Global Development Group. ["PostgreSQL Documentation — Replication"](https://www.postgresql.org/docs/current/runtime-config-replication.html) and ["Logical Replication"](https://www.postgresql.org/docs/current/logical-replication.html). Reference for Postgres physical streaming and logical replication.
- MySQL Reference Manual. ["Replication"](https://dev.mysql.com/doc/refman/8.0/en/replication.html). MySQL replication including binlog formats, semi-sync, and group replication.
- MongoDB Manual. ["Replication"](https://www.mongodb.com/docs/manual/replication/). MongoDB replica sets, automatic failover, and oplog-based replication.
- Vogels, W. (2009). ["Eventually Consistent"](https://queue.acm.org/detail.cfm?id=1466448). *ACM Queue*. Practitioner essay on eventual consistency in replicated systems.
- Shapiro, M., Preguiça, N., Baquero, C., & Zawirski, M. (2011). ["A Comprehensive Study of Convergent and Commutative Replicated Data Types"](https://hal.inria.fr/inria-00555588). CRDT foundational paper; basis for multi-leader conflict resolution without data loss.
- Brewer, E. (2012). ["CAP Twelve Years Later"](https://ieeexplore.ieee.org/document/6133253). *IEEE Computer*. Brewer's retrospective on CAP, useful for understanding the consistency-availability trade-offs replication realizes.
