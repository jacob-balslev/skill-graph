---
name: replication-patterns
description: "Use when designing how a database keeps multiple copies of its data in agreement across nodes for availability, read scaling, and disaster recovery: the three foundational topologies (single-leader / primary-replica, multi-leader / multi-primary, leaderless / quorum), synchronous vs asynchronous replication and the replication-lag trade-off, log shipping vs statement replication vs trigger-based replication, the read-after-write consistency problem and its mitigations (sticky session, read-from-leader, monotonic reads), the failover model and split-brain risk, and the relationship to the CAP/PACELC choices the topology realizes. Do NOT use for horizontal partitioning across nodes (use sharding-strategy), the CAP theoretical frame itself (use cap-theorem-tradeoffs), single-node transactional guarantees (use acid-fundamentals), or query tuning (use query-optimization)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"acid-fundamentals\",\"query-optimization\",\"indexing-strategy\",\"cap-theorem-tradeoffs\",\"sharding-strategy\",\"transaction-isolation\"],\"suppresses\":[\"sharding-strategy\",\"cap-theorem-tradeoffs\"],\"verify_with\":[\"transaction-isolation\",\"cap-theorem-tradeoffs\",\"sharding-strategy\"]}"
  subject: data-engineering
  scope: "Designing database replication topologies and operational guardrails for keeping multiple copies of the same data in agreement across nodes: single-leader, multi-leader, leaderless/quorum; synchronous, semi-synchronous, and asynchronous replication; log-shipping and statement/row/trigger/logical mechanisms; read-after-write mitigations; failover and split-brain prevention; conflict resolution; and backup-vs-replica boundaries. Portable across distributed database systems. Excludes horizontal partitioning across nodes (sharding-strategy), the abstract CAP/PACELC frame itself (cap-theorem-tradeoffs), single-node transaction guarantees (acid-fundamentals), isolation-level choice (transaction-isolation), and query/index tuning (query-optimization/indexing-strategy)."
  public: "true"
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"replication\",\"primary replica\",\"multi-leader\",\"leaderless\",\"quorum\",\"synchronous replication\",\"asynchronous replication\",\"replication lag\",\"read-after-write\",\"failover\"]"
  triggers: "[\"single-leader vs multi-leader\",\"synchronous vs async replication\",\"what happens on failover\",\"split brain\",\"read-after-write consistency\"]"
  examples: "[\"design replication topology for a service with one region writing and three regions reading\",\"decide between synchronous and asynchronous replication given a target RPO\",\"diagnose stale reads after a write — likely replication lag without read-after-write handling\",\"explain the split-brain risk in multi-leader replication\"]"
  anti_examples: "[\"horizontally partition data across nodes (use sharding-strategy)\",\"reason about the CAP theorem abstractly (use cap-theorem-tradeoffs)\",\"explain ACID properties (use acid-fundamentals)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Replication is to a database what mirror copies of a master photograph are to a museum's record — single-leader async is the photographer keeping the negative and printing copies as requested; single-leader sync is the conservator requiring two darkroom signatures before any print leaves the building; multi-leader is multiple authorized photographers in different cities each accepting submissions and reconciling at intervals; leaderless quorum is asking three of five archivists to vote on whether this print matches the master, accepting their verdict. Failover is replacing the negative-keeper when they retire; split brain is what happens when the agency forgets to revoke the old keeper's keys."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/data-engineering/replication-patterns/SKILL.md
---

## Concept of the skill

**What it is:** Replication is the design discipline for keeping multiple copies of the same data on multiple nodes so a database can survive failures, scale reads, or place data near users.

**Mental model:** The core choices are topology, synchrony, replication mechanism, read-freshness policy, failover policy, and conflict handling. Single-leader systems serialize writes through one primary, multi-leader systems accept writes in more than one place and must merge conflicts, and leaderless systems use quorums so clients can read or write through multiple nodes.

**Why it exists:** A single database copy creates one point of failure and one read bottleneck. Replication adds resilience and scale, but it also creates lag, failover, stale-read, and split-brain risks that the application must deliberately handle.

**What it is NOT:** It is not sharding, which splits different data across nodes. It is not CAP theory itself, single-node ACID guarantees, isolation-level selection, query tuning, indexing, or backups.

**Adjacent concepts:** `sharding-strategy` partitions data; `cap-theorem-tradeoffs` names the consistency/availability frame; `acid-fundamentals` and `transaction-isolation` describe local transaction guarantees; backup and restore practice protects against replicated corruption or deletion.

**One-line analogy:** Replication is like keeping synchronized copies of a critical operations log in several control rooms: the system keeps working when one room fails, but everyone needs rules for who may write, how copies catch up, and who takes charge after an outage.

**Common misconception:** Turning replication on does not automatically create zero data loss, fresh reads, safe failover, or backups; each of those safety properties requires an explicit topology, synchrony, routing, fencing, monitoring, and recovery choice.

# Replication Patterns

## Coverage

The catalog of replication topologies and the operational discipline that makes them work in production. Covers the three foundational topologies (single-leader / primary-replica, multi-leader / multi-primary, leaderless / quorum), the synchrony spectrum (sync, semi-sync, async, quorum-sync), the mechanism choices (statement-based, row-based, trigger-based, logical, physical), the read-after-write consistency problem and its mitigations (sticky session, read-from-leader, monotonic reads, version tokens), the failover model and quorum-based split-brain prevention, the conflict-resolution choices in multi-leader and leaderless systems (LWW, CRDTs, vector clocks, application merge), and the relationship to the CAP/PACELC choices the topology realizes.

## Philosophy of the skill
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `data-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: Designing database replication topologies and operational guardrails for keeping multiple copies of the same data in agreement across nodes: single-leader, multi-leader, leaderless/quorum; synchronous, semi-synchronous, and asynchronous replication; log-shipping and statement/row/trigger/logical mechanisms; read-after-write mitigations; failover and split-brain prevention; conflict resolution; and backup-vs-replica boundaries. Portable across distributed database systems. Excludes horizontal partitioning across nodes (sharding-strategy), the abstract CAP/PACELC frame itself (cap-theorem-tradeoffs), single-node transaction guarantees (acid-fundamentals), isolation-level choice (transaction-isolation), and query/index tuning (query-optimization/indexing-strategy).

**When to use**
- design replication topology for a service with one region writing and three regions reading
- decide between synchronous and asynchronous replication given a target RPO
- diagnose stale reads after a write — likely replication lag without read-after-write handling
- explain the split-brain risk in multi-leader replication
- Triggers: `single-leader vs multi-leader`, `synchronous vs async replication`, `what happens on failover`, `split brain`, `read-after-write consistency`

**Not for**
- horizontally partition data across nodes (use sharding-strategy)
- reason about the CAP theorem abstractly (use cap-theorem-tradeoffs)
- explain ACID properties (use acid-fundamentals)

**Related skills**
- Verify with: `transaction-isolation`, `cap-theorem-tradeoffs`, `sharding-strategy`
- Related: `acid-fundamentals`, `query-optimization`, `indexing-strategy`, `cap-theorem-tradeoffs`, `sharding-strategy`, `transaction-isolation`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: Replication is to a database what mirror copies of a master photograph are to a museum's record — single-leader async is the photographer keeping the negative and printing copies as requested; single-leader sync is the conservator requiring two darkroom signatures before any print leaves the building; multi-leader is multiple authorized photographers in different cities each accepting submissions and reconciling at intervals; leaderless quorum is asking three of five archivists to vote on whether this print matches the master, accepting their verdict. Failover is replacing the negative-keeper when they retire; split brain is what happens when the agency forgets to revoke the old keeper's keys.
- Common misconception: |

**Keywords**
- `replication`, `primary replica`, `multi-leader`, `leaderless`, `quorum`, `synchronous replication`, `asynchronous replication`, `replication lag`, `read-after-write`, `failover`

<!-- skill-graph-context:end -->
