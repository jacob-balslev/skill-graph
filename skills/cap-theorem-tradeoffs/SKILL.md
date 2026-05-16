---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: cap-theorem-tradeoffs
description: "Use when reasoning about the consistency-availability-partition-tolerance trade-off for distributed data systems: Brewer's CAP conjecture (2000), Gilbert & Lynch's 2002 formal proof, why P is not optional in any real distributed system, the CP-vs-AP dichotomy that follows, PACELC as the extension that names the latency-vs-consistency trade-off that exists even without partition, the relationship between CAP's C and ACID's C (different concepts with the same letter), and the choice procedure of naming what the system must guarantee under partition. Do NOT use for single-node transactional guarantees (use acid-fundamentals), choosing an isolation level (use transaction-isolation), the design of replication topologies (use replication-patterns), or sharding decisions (use sharding-strategy)."
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
  - CAP theorem
  - Brewer
  - Gilbert Lynch
  - consistency availability partition
  - CP system
  - AP system
  - PACELC
  - eventual consistency
  - linearizability
  - distributed system
triggers:
  - "CAP theorem"
  - "CP or AP"
  - "what should we do on partition"
  - "is this strongly consistent"
  - "PACELC"
examples:
  - "decide whether a new distributed service should be CP or AP given its workload"
  - "explain why CAP's C and ACID's C are different concepts despite sharing the letter"
  - "diagnose a system claiming 'CA' (consistency + availability without P) — likely confused, since P is not optional"
  - "design the partition-mode behavior of a multi-region service"
anti_examples:
  - "choose a transaction isolation level (use transaction-isolation)"
  - "explain the four ACID properties (use acid-fundamentals)"
  - "design the replication topology of a database (use replication-patterns)"
relations:
  related:
    - acid-fundamentals
    - transaction-isolation
    - replication-patterns
    - sharding-strategy
  boundary:
    - skill: acid-fundamentals
      reason: "acid-fundamentals owns the single-system transactional frame; this skill owns the distributed-system frame. CAP's C (replica agreement) is not ACID's C (constraint satisfaction); conflating them is the most common misconception in this space."
    - skill: transaction-isolation
      reason: "transaction-isolation owns single-cluster concurrency-correctness; this skill owns multi-replica consistency under network partition. The two layers can compose (a CP system may run at serializable isolation locally) but address different threats."
    - skill: replication-patterns
      reason: "replication-patterns owns the design patterns for multi-replica systems (primary-replica, multi-primary, leaderless quorum); this skill owns the C/A/P trade-off that motivates choosing among them. The two compose: this is the theoretical frame; replication-patterns is the operational realization."
    - skill: sharding-strategy
      reason: "sharding-strategy owns horizontal partitioning of data across nodes; this skill owns the C/A trade-off when those shards must coordinate or recover from network partition between them."
  verify_with:
    - acid-fundamentals
    - replication-patterns
concept:
  definition: "CAP is the theorem (Brewer 2000 as a conjecture; Gilbert & Lynch 2002 as a formal proof) that, in a distributed data system, you cannot simultaneously guarantee all three of: Consistency (every read returns the most recent write or an error), Availability (every request receives a non-error response), Partition tolerance (the system continues despite arbitrary message loss between nodes). Since real-world networks can and do partition, P is not optional — the choice is between C and A *during a partition*. A CP system refuses to serve some requests during partition to preserve consistency; an AP system serves all requests but may return stale data. PACELC (Abadi 2010) extends CAP by naming the *Else* case: even without partition, the system must trade Latency against Consistency, because synchronous replication for strong consistency takes time. The discipline is choosing C-vs-A *intentionally per workload*, knowing that P is given by physics and that even outside partition, latency-vs-consistency is a continuous choice."
  mental_model: |
    Five primitives structure CAP reasoning:

    1. **The three properties** — **Consistency** (every read returns the most recent committed write or an error), **Availability** (every non-failed node returns a non-error response in finite time), **Partition tolerance** (the system continues operating despite message loss or delay between nodes). CAP says: in a distributed system, you can guarantee at most two simultaneously *during a partition*. Outside partition, all three are achievable; the theorem is about behavior under network failure.

    2. **P is not optional** — real networks partition. Hardware fails, switches reboot, fiber cuts happen, BGP routes flap, kernel bugs lose packets. A system that claims "CA" (consistency + availability, no partition tolerance) is one that fails entirely when a partition occurs — which means its availability under partition is zero. CA is not a real choice; it is a choice you made for normal operation that violates itself the first time the network has a bad day. The practical choice is CP vs AP.

    3. **CP vs AP** — under partition, a system either preserves consistency at the cost of availability (CP: refuse to serve requests that would violate consistency; the side of the partition without quorum returns errors), or preserves availability at the cost of consistency (AP: every node continues to serve; reads may return stale data; writes may diverge and need reconciliation when the partition heals). Some systems can be configured for either mode (Cassandra's tunable consistency); some are firmly one (etcd is CP; DynamoDB's default is AP).

    4. **The C in CAP is not the C in ACID** — CAP's Consistency is *single-key linearizability*: every read returns the most recent committed write for that key, as if from a single virtual server. ACID's Consistency is *constraint satisfaction*: the database's defined integrity constraints (FK, UNIQUE, NOT NULL, CHECK) hold across transactions. A system can be CAP-Consistent (all replicas agree) and ACID-Inconsistent (a constraint was violated); a system can be ACID-Consistent (constraints hold) and CAP-Inconsistent (replicas disagree). They are different concepts; the shared letter is unfortunate.

    5. **PACELC** (Abadi 2010) — CAP describes the partition case, but the *Else* case (no partition) is also a choice: between **L**atency and **C**onsistency. Synchronous replication for strong consistency takes time (the write must reach replicas before being acknowledged); asynchronous replication is fast but admits stale reads. PACELC names this: a system is PA/EL (AP during partition, low-latency-but-eventual-consistency outside partition — Cassandra default), or PC/EC (CP during partition, strong-but-slow consistency outside partition — Spanner), or PA/EC, or PC/EL. The classification is more useful than CAP alone because real systems spend most of their time *not* partitioned.

    The deep insight is that **CAP names a forced trade-off that physics imposes on distributed systems**. The choice is not "which two of three do we want" (P is required); it is "in the partition case, do we preserve consistency or availability" — and the right answer is workload-dependent. Banking systems mostly choose CP (better to refuse a transaction than to allow double-spending). Shopping carts often choose AP (better to accept your add-to-cart and reconcile later than to be unavailable). The discipline is making the choice explicit and per-system, not by reflex.

    The complementary insight is that **CAP describes a worst case; most real-world choices are about latency-vs-consistency in the non-partition case (PACELC's E)**. A team that designs for CAP without thinking about PACELC is designing for the rare partition while ignoring the common-case latency trade-off — which is what their users will actually experience.
  purpose: |
    CAP exists as a frame because the distributed-systems industry, before Brewer's 2000 conjecture, was making contradictory claims about systems that could simultaneously be consistent, available, and partition-tolerant. The theorem clarified that those claims were *impossible* — pick any two, and accept the third is the constraint.

    **CAP forced the conversation to be precise.** Before CAP, vendors claimed "consistency and availability and fault tolerance" without specifying the failure model. After CAP, the conversation has shape: under partition (which is the relevant failure model), which property does the system preserve? The vocabulary cleaned up a decade of vague marketing.

    **Gilbert & Lynch's 2002 proof made it formal.** Brewer's original was a conjecture made at a PODC keynote; the 2002 paper proved the result under the asynchronous network model and the partial-synchrony model. The proof structure (consider a partition splitting two nodes; either one side serves stale data, or one side refuses to serve) is the basis for every subsequent discussion.

    **PACELC made it practical.** CAP focuses on the partition case, which is rare in practice. PACELC notices that the same trade-off exists in the non-partition case as a latency-vs-consistency choice and gives practitioners a four-quadrant classification (PA/EL, PA/EC, PC/EL, PC/EC) that better describes real systems' behavior. Most production systems are PA/EL (eventual consistency for speed) or PC/EC (strong consistency at latency cost); the choice is per workload.

    **CAP made eventual consistency a respectable design.** Before CAP, "eventually consistent" sounded like an admission of inadequacy. After CAP, it sounded like a defensible trade-off — "we chose A over C under partition, and EL over EC in the common case, because our workload tolerates stale data better than unavailability." The framing legitimized AP designs that dominate at internet scale (DNS, social media, content delivery).

    **The CP-vs-AP choice has economic consequences.** A CP system is unavailable to a fraction of users during partition; an AP system is consistent only eventually. The cost of unavailability (lost transactions, customer churn) versus the cost of inconsistency (data reconciliation, eventual correction) is a business decision the engineering team supports with the technical design. The framing makes this an explicit business choice rather than an implicit engineering choice.

    The cost of CAP as a frame is real. It is sometimes over-applied (the partition case is rare, and PACELC's non-partition trade-off is more often the relevant one). It is sometimes misunderstood (CA is not a real choice; the C in CAP is not the C in ACID). It is sometimes used to justify under-engineering (claiming "we're AP" for systems that don't actually need to be). The discipline is using the frame correctly.

    The deeper purpose is to make a *physics-imposed trade-off* explicit and per-workload. Before CAP, distributed systems were sold as if they could do everything; after CAP, the question "what does this system give up?" is mandatory. The discipline of naming the trade-off is what makes the design defensible.
  boundary: |
    **CAP's C is not ACID's C.** CAP's Consistency is single-key linearizability — every read sees the most recent committed write. ACID's Consistency is constraint satisfaction — the database's integrity rules hold across transactions. A system can be CAP-Consistent (linearizable) but allow constraint violations because the application didn't enforce them. A system can be ACID-Consistent (FKs hold) but CAP-Inconsistent (replicas return stale data). Conflating the two is the most-common misconception in this space.

    **CAP applies only to systems with a single logical data store.** CAP says nothing about systems where there is one node (no partition possible) or where the data is partitioned so that each partition is owned by one node (no cross-node consistency requirement). Sharding without cross-shard transactions is outside CAP's domain.

    **'CA' is not a real choice.** A system that claims to be CA is one that gives up partition tolerance — which in practice means it gives up availability the first time the network partitions, because the system has no defined behavior under partition. The "CA" label is mostly a marketing artifact for systems that haven't been tested under partition; under real partition, they reveal themselves as CP (refuse) or AP (diverge) by what they actually do. The choice is CP vs AP, period.

    **CAP is about the partition case.** It says nothing about behavior in the common case (no partition). PACELC fills this gap by naming the latency-vs-consistency trade-off that exists even without partition; for many workloads, PACELC's E (else) case dominates the design choice.

    **'AP' does not mean 'no consistency'.** It means consistency is *eventual* rather than immediate. AP systems use techniques (vector clocks, CRDTs, last-write-wins with conflict resolution, anti-entropy gossip) to converge to a consistent state once partition heals. The data is *eventually* consistent, often within milliseconds; the system simply doesn't block writes during partition to enforce it.

    **'CP' does not mean 'no availability'.** It means *some* requests are refused during partition — specifically, the side of the partition without a quorum may return errors. The majority side continues to serve. CP systems are typically very available in practice (partition events are rare, and even during partition the majority partition serves).

    **CAP does not describe latency.** Within either CP or AP, there are still latency trade-offs (synchronous vs asynchronous replication; quorum size; geographic distribution). PACELC names this; CAP alone does not.

    **CAP is not a quality verdict.** Both CP and AP are correct choices for different workloads. A CP banking system is right; an AP shopping-cart is right; the choice is workload-dependent. "We chose CP, so we're more correct than AP systems" is misreading the theorem.

    **Linearizability is not the only consistency model.** CAP's C is specifically linearizability (or strict serializability for systems with multi-object transactions). Weaker consistency models — causal consistency, monotonic reads, read-your-writes, session consistency — exist on a spectrum between CAP's C and full eventual consistency. CAP collapses this spectrum into a binary; in practice, many systems offer tunable consistency per operation.

    **The proof's assumptions matter.** Gilbert & Lynch's proof is for the asynchronous network model with no clock synchronization. With partial synchrony and bounded clock drift (Spanner's TrueTime), some of CAP's apparent impossibilities relax. Real-world systems sit on a spectrum; the theorem's binary framing is a simplification.
  taxonomy: |
    By the three CAP letters:
    - **Consistency (C)** — every read returns the most recent committed write or an error. Single-key linearizability.
    - **Availability (A)** — every non-failed node returns a non-error response in finite time.
    - **Partition tolerance (P)** — the system continues operating despite message loss or delay between nodes. *Required* — not actually optional in any real distributed system.

    By trade-off under partition (the practical CAP choice):
    - **CP system** — preserves consistency; refuses to serve requests that would violate it during partition. Examples: etcd, ZooKeeper, MongoDB with majority-read, Spanner.
    - **AP system** — preserves availability; serves all requests during partition; reads may return stale data; writes may diverge. Examples: Cassandra (default), DynamoDB (default), Riak.
    - **Tunable** — configurable per operation. Examples: Cassandra with QUORUM or ALL/ONE per operation; DynamoDB with strongly-consistent reads opt-in.

    By PACELC quadrant (Abadi 2010 extension):
    - **PA/EL** — AP during partition; latency over consistency outside. Cassandra default, DynamoDB default.
    - **PA/EC** — AP during partition; consistency over latency outside. Rare; usually a misconfiguration of a PA/EL system.
    - **PC/EL** — CP during partition; latency over consistency outside. Mixed real systems.
    - **PC/EC** — CP during partition; consistency over latency outside. Spanner, Cosmos DB strong consistency, MongoDB with majority-read.

    By consistency model (refinement of C):
    - **Linearizability** — CAP's strict C; every operation appears to occur atomically at some moment between its invocation and response.
    - **Sequential consistency** — operations appear in some serial order that respects each client's order; weaker than linearizability.
    - **Causal consistency** — operations causally related (one read another's write) appear in causal order; concurrent operations may be observed in different orders by different clients.
    - **Read-your-writes / monotonic reads** — session guarantees within a client; weaker than full causal.
    - **Eventual consistency** — replicas converge eventually; no time bound.
    - **Strong eventual consistency** — replicas that have received the same writes always converge to the same state (CRDT property).

    By partition-handling strategy:
    - **Block writes on minority side (CP)** — Raft / Paxos consensus; the side without majority is read-only or unavailable.
    - **Accept writes on both sides (AP)** — both sides continue accepting writes; convergence via vector clocks, CRDTs, or last-write-wins at heal time.
    - **Block reads on minority side (CP)** — stricter than block-writes; some systems do this to preserve linearizability.

    By proof model assumption:
    - **Asynchronous network, no clocks** — Gilbert & Lynch's strict model; CAP is hardest here.
    - **Partial synchrony** — most real systems; CAP applies with some softening.
    - **Synchronized clocks (TrueTime)** — Spanner; allows external consistency with some CAP relaxation.
  analogy: |
    A bank with two branches connected by a phone line. Most days, the branches stay in sync — every deposit at branch A is phoned to branch B immediately, and vice versa. Both branches always agree on every customer's balance.

    Then the phone line goes down (network partition). Two customers arrive simultaneously, one at each branch, both wanting to withdraw $500 from the same account that has $800 in it.

    A **CP** bank refuses both withdrawals at the branch that can't verify the balance with the other. One branch (or one side of the partition) keeps serving; the other returns "system temporarily unavailable." The balance remains consistent — no overdraft can occur — at the cost that some customers are turned away.

    An **AP** bank serves both withdrawals locally. Each branch acts on its last-known balance. When the phone line comes back, the bank discovers it gave out $1000 against an $800 balance, and either covers the overdraft, reconciles by penalizing one of the customers, or applies a conflict-resolution policy. The bank stayed available to all customers at the cost of an inconsistent state to be reconciled.

    A **CA** bank is one whose entire operation requires the phone line to work. If the line goes down, both branches close. CA is not actually a real choice for a bank — phone lines do go down — so the bank is either CP (one side closes; the bank stays correct) or AP (both stay open; the bank stays usable). "CA" is what banks claim to be in their marketing; under real partition they reveal which they actually are.

    PACELC adds: even when the phone line is working, the bank has a choice. Confirm every withdrawal with the other branch before completing it (slow but consistent — EC), or complete the withdrawal locally and update the other branch asynchronously (fast but admits brief inconsistency — EL). Most banks choose differently for different workloads; high-value transactions use EC, small everyday transactions use EL.

    The discipline is to know which kind of bank you are and which kind of trade-off you make per transaction class. A bank that doesn't know is one that will be surprised the first time the phone line goes down — and surprised again when a customer notices that the balance they just saw was wrong because EL was the default.
  misconception: |
    The most common misconception is that **CAP's C and ACID's C are the same**. They are not. CAP's Consistency is single-key linearizability (all replicas return the same recent value). ACID's Consistency is constraint satisfaction (FKs hold, UNIQUE constraints hold). A system can be CAP-Consistent and ACID-Inconsistent (the constraints were violated but all replicas agree on the violation); a system can be ACID-Consistent and CAP-Inconsistent (constraints hold on each replica but replicas disagree). The shared letter is the source of much confusion.

    The second misconception is that **'CA' is a valid choice**. It is not. Real networks partition; a system claiming CA gives up partition tolerance, which means under real partition it has no defined behavior — typically failing entirely (so its availability under partition is zero). The practical choice is CP vs AP; the "CA" label is a marketing artifact.

    The third misconception is that **CAP says you can have at most two of three at all times**. It says you can have at most two *during a partition*. Outside partition, all three are achievable. The theorem is about behavior under network failure, not steady-state operation. PACELC addresses the steady-state by naming the latency-vs-consistency trade-off that exists even without partition.

    The fourth misconception is that **'AP' means 'no consistency'**. It means *eventual* consistency rather than immediate. AP systems use convergence techniques (vector clocks, CRDTs, anti-entropy gossip) to bring replicas back into agreement after partition. Convergence is often fast (milliseconds in healthy networks); AP does not mean "wrong forever."

    The fifth misconception is that **'CP' means 'no availability'**. It means *partial* unavailability during partition — specifically, the side of the partition without a quorum is read-only or returns errors. The majority side continues to serve. CP systems are typically very available in practice because partition events are rare.

    The sixth misconception is that **CAP is the only or main trade-off**. It is the partition-case trade-off; PACELC's E (else) case dominates the common-case design. Most production systems spend more design effort on EL vs EC than on CP vs AP, because partition is rare and latency-vs-consistency is constant.

    The seventh misconception is that **CAP is a quality verdict**. It is a trade-off frame. Both CP and AP are correct choices for different workloads. A banking core ledger is right to be CP; a shopping cart's session state is right to be AP; the choice is workload-dependent, not better-or-worse.

    The eighth misconception is that **distributed databases must be at most one of CP or AP**. Many systems are tunable per operation. Cassandra can be configured AP (CONSISTENCY ONE) or CP (CONSISTENCY QUORUM with reads also at QUORUM) per query; DynamoDB has strongly-consistent and eventually-consistent reads as options. The choice is per-operation in tunable systems.

    The ninth misconception is that **the CAP theorem precludes strong consistency at scale**. It precludes strong consistency *during partition* in distributed systems. Outside partition, strong consistency at scale is achievable (Spanner does it globally with TrueTime; Spanner is PC/EC). The theorem describes the partition-case impossibility; it does not preclude strongly-consistent systems generally.

    The tenth misconception is that **eventual consistency is always good enough for AP systems' workloads**. It often isn't. A shopping cart that's eventually consistent within 2 seconds is fine; a financial ledger that's eventually consistent within 30 seconds is broken. The right "eventually" depends on the workload's tolerance for stale data. AP is a trade-off, not a free win.
---

# CAP-Theorem Tradeoffs

## Coverage

The consistency-availability-partition-tolerance trade-off that physics imposes on distributed data systems. Covers Brewer's 2000 conjecture, Gilbert & Lynch's 2002 formal proof, why P is mandatory in real networks (the practical choice is CP vs AP, not "any two of three"), the PACELC extension (Abadi 2010) that names the latency-vs-consistency trade-off in the non-partition case, the CAP-C vs ACID-C confusion that is the most-common misconception in the space, the spectrum of consistency models from linearizability to eventual consistency, the four PACELC quadrants (PA/EL, PA/EC, PC/EL, PC/EC) and the systems that occupy each, and the partition-mode choice procedure.

## Philosophy

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
