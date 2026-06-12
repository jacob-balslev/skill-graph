---
name: cap-theorem-tradeoffs
description: "Use when reasoning about the consistency-availability-partition-tolerance trade-off for distributed data systems: Brewer's CAP conjecture (2000), Gilbert & Lynch's 2002 formal proof, why P is not optional in any real distributed system, the CP-vs-AP dichotomy that follows, PACELC as the extension that names the latency-vs-consistency trade-off that exists even without partition, the relationship between CAP's C and ACID's C (different concepts with the same letter), and the choice procedure of naming what the system must guarantee under partition. Do NOT use for single-node transactional guarantees (use acid-fundamentals), choosing an isolation level (use transaction-isolation), the design of replication topologies (use replication-patterns), or sharding decisions (use sharding-strategy)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"transaction-isolation\",\"acid-fundamentals\",\"replication-patterns\",\"sharding-strategy\"],\"suppresses\":[\"replication-patterns\",\"sharding-strategy\"],\"verify_with\":[\"acid-fundamentals\",\"replication-patterns\"]}"
  subject: data-engineering
  scope: "The consistency-availability-partition-tolerance trade-off for distributed data systems — Brewer's CAP conjecture (2000), Gilbert & Lynch's 2002 proof, why P is not optional, the CP-vs-AP dichotomy, PACELC as the latency-vs-consistency extension that holds even without partition, the CAP-C vs ACID-C distinction, and the choice procedure of naming what the system must guarantee under partition. Portable across any distributed data system; principle-grounded, not repo-bound. Excludes single-node transactional guarantees (acid-fundamentals), choosing an isolation level (transaction-isolation), replication topology design (replication-patterns), and sharding decisions (sharding-strategy)."
  public: "true"
  taxonomy_domain: engineering/data
  stability: experimental
  keywords: "[\"CAP theorem\",\"Brewer\",\"Gilbert Lynch\",\"consistency availability partition\",\"CP system\",\"AP system\",\"PACELC\",\"eventual consistency\",\"linearizability\",\"distributed system\"]"
  triggers: "[\"CAP theorem\",\"CP or AP\",\"what should we do on partition\",\"is this strongly consistent\",\"PACELC\"]"
  examples: "[\"decide whether a new distributed service should be CP or AP given its workload\",\"explain why CAP's C and ACID's C are different concepts despite sharing the letter\",\"diagnose a system claiming 'CA' (consistency + availability without P) — likely confused, since P is not optional\",\"design the partition-mode behavior of a multi-region service\"]"
  anti_examples: "[\"choose a transaction isolation level (use transaction-isolation)\",\"explain the four ACID properties (use acid-fundamentals)\",\"design the replication topology of a database (use replication-patterns)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "CAP is to a distributed database what the Heisenberg uncertainty principle is to physics — you cannot simultaneously have a fully consistent reading and a fully available reading when the network has partitioned, just as you cannot simultaneously measure a precise position and a precise momentum. The trade-off is not a limit of the engineering, it is a limit of the physics; pretending otherwise is the source of every 'CA' system that claims to defy CAP and chooses one side anyway on its first partition."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/data-engineering/cap-theorem-tradeoffs/SKILL.md
---
# CAP-Theorem Tradeoffs

## Concept of the skill

CAP is Brewer's 2000 conjecture, formalized by Gilbert and Lynch in 2002: during a network partition, a distributed data system cannot guarantee both replica consistency and availability. Partition tolerance is not a selectable feature in real networks; the practical design question is what the system must do when messages are delayed or lost.

Use this skill to name the partition-mode choice and then extend it with PACELC for the more common steady-state latency-vs-consistency tradeoff. It is a distributed-data-systems frame, distinct from ACID's single-transaction guarantees, isolation-level tuning, replication topology design, or sharding mechanics.

## Coverage

The consistency-availability-partition-tolerance trade-off that physics imposes on distributed data systems. Covers Brewer's 2000 conjecture, Gilbert & Lynch's 2002 formal proof, why P is mandatory in real networks (the practical choice is CP vs AP, not "any two of three"), the PACELC extension (Abadi 2010) that names the latency-vs-consistency trade-off in the non-partition case, the CAP-C vs ACID-C confusion that is the most-common misconception in the space, the spectrum of consistency models from linearizability to eventual consistency, the four PACELC quadrants (PA/EL, PA/EC, PC/EL, PC/EC) and the systems that occupy each, and the partition-mode choice procedure.

## Philosophy of the skill
CAP is the frame that made distributed-systems design honest. Before Brewer's 2000 conjecture and Gilbert & Lynch's 2002 proof, the industry made contradictory claims about consistency, availability, and fault tolerance; after CAP, those claims have shape. Under partition — which physics guarantees will happen — you preserve consistency at the cost of availability, or availability at the cost of consistency.

The discipline is making the choice *per workload* and *intentionally*. A banking core ledger is right to be CP. A shopping cart's session state is right to be AP. A multi-region content-delivery system is right to be AP with eventual consistency. A schema registry is right to be CP. The choice is the engineering team's responsibility; CAP names the trade-off; the design realizes the choice.

PACELC is the frame that made CAP practical. Most systems spend the overwhelming majority of their time *not* partitioned; PACELC's E (else) case names the latency-vs-consistency trade-off in the common case, which is where most users' actual experience lives. A team that designs for CAP without PACELC has optimized for the rare event and ignored the daily one.

## The CAP Theorem In One Diagram

```
                    During a network partition,
                    pick at most TWO of:

                    Consistency (C)
                          /\
                         /  \
                        / CP \       Common: Spanner, etcd,
                       /  ↓   \         MongoDB w/ majority,
                      / refuse \             ZooKeeper
                     /  some    \
                    /  requests  \
                   /              \
                  /                \
                 /                  \
                /                    \
               /         AP           \
              /  serve all requests    \
             /   accept stale reads     \    Common: Cassandra default,
            /   diverge on writes        \      DynamoDB default,
           /                              \              Riak
          /                                \
         /__________________________________\
       Availability (A)        Partition tolerance (P)

   "CA" is not a real choice — partitions happen.
```

## CAP-C vs ACID-C — A Worked Example

A multi-region banking system with eventual consistency:

| Scenario | CAP-C status | ACID-C status |
|---|---|---|
| Both replicas show balance = $500 (constraint: balance ≥ 0) | Consistent | Consistent |
| Replica A shows $500, replica B shows $400 (constraint: balance ≥ 0) | INconsistent (CAP) | Consistent (no constraint violated) |
| Both replicas show balance = -$100 (constraint: balance ≥ 0) | Consistent | INconsistent (constraint violated) |
| Replica A shows balance = -$100, replica B shows $500 | INconsistent (CAP) | INconsistent (replica A violates) |

The two C's measure different things. The system needs both to be operationally correct.

## PACELC Quadrants

| Quadrant | Partition behavior | Else (steady-state) behavior | Example systems |
|---|---|---|---|
| **PA/EL** | AP | Latency over consistency | Cassandra default, DynamoDB default, MongoDB default |
| **PA/EC** | AP | Consistency over latency | Rare; often misconfiguration |
| **PC/EL** | CP | Latency over consistency | Some real-world systems (mixed mode) |
| **PC/EC** | CP | Consistency over latency | Spanner, Cosmos DB strong, MongoDB w/ majority-read |

Choosing for the steady-state matters more than choosing for partition in most workloads.

## The Choice Procedure

1. **What does the system do if data goes stale by 10 seconds during a partition?** If the answer is "users see slightly old data; we reconcile later" — AP is viable. If the answer is "we lose money / corrupt records / fail an SLA" — CP is required.

2. **What does the system do if 50% of requests fail for 60 seconds during a partition?** If "users retry; we lose some requests" — CP is viable. If "we churn users / lose orders / break business" — AP is required.

3. **In the steady state, do we want low latency (EL) or strong consistency (EC)?** This is the dominant question for most workloads, since partition is rare. Strong consistency in the common case requires synchronous replication; eventual consistency in the common case allows asynchronous.

4. **Does the workload need linearizability, or is causal consistency / read-your-writes enough?** Many workloads need weaker consistency than CAP's linearizability; the choice of consistency model affects the system's achievable throughput.

5. **Is the system actually distributed?** Single-node or single-region tightly-coupled systems may not have CAP concerns at all. Avoid invoking CAP for systems where it doesn't apply.

## Verification

After applying this skill, verify:
- [ ] The team distinguishes CAP-C (replica agreement) from ACID-C (constraint satisfaction) in design discussions. Using "consistency" without qualifier produces confused decisions.
- [ ] The system's CP-or-AP choice is explicit, documented, and tied to the workload's tolerance for stale data vs unavailability.
- [ ] The PACELC quadrant is identified for the system. The steady-state latency-vs-consistency trade-off is treated as the dominant design decision, not as an afterthought to CAP.
- [ ] Partition-mode behavior is tested, not assumed. The team has actually exercised partition (chaos engineering, network-partition simulation) and verified the system behaves as designed.
- [ ] Reconciliation logic is in place for AP systems. Eventual consistency requires the team to have a defined convergence strategy (vector clocks, CRDTs, last-write-wins, anti-entropy) and to have tested it.
- [ ] No system claims "CA" without challenge. CA is not a real choice; systems that claim it have not actually been tested under partition.
- [ ] For tunable systems (Cassandra, DynamoDB), the per-operation consistency choice is intentional. The default settings are not assumed correct without verification per workload.
- [ ] The consistency model is named (linearizability, causal, read-your-writes, eventual). "Strong consistency" without specification is imprecise.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Reasoning about single-node transactional guarantees | `acid-fundamentals` | acid-fundamentals owns single-system; this owns distributed |
| Choosing an isolation level for concurrent transactions | `transaction-isolation` | transaction-isolation owns single-cluster concurrency |
| Designing replication topology (primary-replica, multi-primary, etc.) | `replication-patterns` | replication-patterns owns the operational realization of CAP choices |
| Sharding decisions for horizontal scaling | `sharding-strategy` | sharding owns horizontal partitioning; this owns the consistency frame across shards |
| Tuning a query for performance | `query-optimization` | query-optimization owns retrieval performance |
| Designing for high availability without distributed concerns | high-availability or reliability skills | HA on a single node is not a CAP concern |

## Key Sources

- Brewer, E. (2000). ["Towards Robust Distributed Systems" (PODC 2000 keynote)](https://www.cs.berkeley.edu/~brewer/cs262b-2004/PODC-keynote.pdf). The original CAP conjecture as Brewer presented it.
- Gilbert, S., & Lynch, N. (2002). ["Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services"](https://www.glassbeam.com/sites/all/themes/glassbeam/images/blog/10.1.1.20.1495.pdf). *ACM SIGACT News*, 33(2), 51-59. The formal proof; the canonical academic reference.
- Brewer, E. (2012). ["CAP Twelve Years Later: How the 'Rules' Have Changed"](https://ieeexplore.ieee.org/document/6133253). *IEEE Computer*, 45(2), 23-29. Brewer's retrospective; clarifies the misconceptions that grew up around the theorem.
- Abadi, D. (2010). ["Problems with CAP, and Yahoo's little known NoSQL system"](http://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html) and (2012) ["Consistency Tradeoffs in Modern Distributed Database System Design: CAP is Only Part of the Story"](https://ieeexplore.ieee.org/document/6127847). *IEEE Computer*, 45(2), 37-42. The introduction of PACELC as the extended frame.
- Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly. Chapter 9 (Consistency and Consensus) — modern practitioner treatment of CAP, PACELC, and the consistency model spectrum.
- Bailis, P., Davidson, A., Fekete, A., Ghodsi, A., Hellerstein, J. M., & Stoica, I. (2014). ["Highly Available Transactions: Virtues and Limitations"](https://dl.acm.org/doi/10.14778/2732232.2732237). *VLDB 2014*. Modern academic treatment of the consistency models that sit between linearizability and eventual consistency.
- Vogels, W. (2009). ["Eventually Consistent"](https://queue.acm.org/detail.cfm?id=1466448). *ACM Queue*, 6(6). The canonical practitioner essay on eventual consistency, written by Amazon's CTO.
- Lipton, R. J., & Sandberg, J. S. (1988). ["PRAM: A Scalable Shared Memory"](https://www.cs.princeton.edu/research/techreps/TR-180-88). Princeton technical report. Early work on weak consistency models that inform CAP-era distributed databases.
- Bailis, P., & Ghodsi, A. (2013). ["Eventual Consistency Today: Limitations, Extensions, and Beyond"](https://queue.acm.org/detail.cfm?id=2462076). *ACM Queue*. Modern survey of the eventual-consistency spectrum.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `data-engineering`
- Public: `true`
- Domain: `engineering/data`
- Scope: The consistency-availability-partition-tolerance trade-off for distributed data systems — Brewer's CAP conjecture (2000), Gilbert & Lynch's 2002 proof, why P is not optional, the CP-vs-AP dichotomy, PACELC as the latency-vs-consistency extension that holds even without partition, the CAP-C vs ACID-C distinction, and the choice procedure of naming what the system must guarantee under partition. Portable across any distributed data system; principle-grounded, not repo-bound. Excludes single-node transactional guarantees (acid-fundamentals), choosing an isolation level (transaction-isolation), replication topology design (replication-patterns), and sharding decisions (sharding-strategy).

**When to use**
- decide whether a new distributed service should be CP or AP given its workload
- explain why CAP's C and ACID's C are different concepts despite sharing the letter
- diagnose a system claiming 'CA' (consistency + availability without P) — likely confused, since P is not optional
- design the partition-mode behavior of a multi-region service
- Triggers: `CAP theorem`, `CP or AP`, `what should we do on partition`, `is this strongly consistent`, `PACELC`

**Not for**
- choose a transaction isolation level (use transaction-isolation)
- explain the four ACID properties (use acid-fundamentals)
- design the replication topology of a database (use replication-patterns)

**Related skills**
- Verify with: `acid-fundamentals`, `replication-patterns`
- Related: `transaction-isolation`, `acid-fundamentals`, `replication-patterns`, `sharding-strategy`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: CAP is to a distributed database what the Heisenberg uncertainty principle is to physics — you cannot simultaneously have a fully consistent reading and a fully available reading when the network has partitioned, just as you cannot simultaneously measure a precise position and a precise momentum. The trade-off is not a limit of the engineering, it is a limit of the physics; pretending otherwise is the source of every 'CA' system that claims to defy CAP and chooses one side anyway on its first partition.
- Common misconception: |

**Keywords**
- `CAP theorem`, `Brewer`, `Gilbert Lynch`, `consistency availability partition`, `CP system`, `AP system`, `PACELC`, `eventual consistency`, `linearizability`, `distributed system`

<!-- skill-graph-context:end -->
