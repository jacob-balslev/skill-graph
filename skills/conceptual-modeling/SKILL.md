---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: conceptual-modeling
description: "Use when translating business requirements into a structured domain representation, designing a new feature from scratch, or validating that a system's structure matches business reality — before any database schema, API endpoint, or aggregate boundary is named. Covers entity / attribute / relationship identification, cardinality (1:1, 1:N, M:N, 0..1, 1..*), generalization vs specialization (disjoint / overlapping, total / partial), aggregation vs composition, role modeling, the conceptual → logical → physical abstraction ladder, validation against business stakeholders' mental models, and the seven anti-patterns (implementation leakage, missing entity, god entity, phantom relationship, premature normalization, attribute-as-entity, unnamed relationship). Do NOT use for database-specific ER diagrams with PK / FK / normalization (use a logical-modeling skill), formal ontology axioms with OWL or RDFS (use an ontology skill), or DDD tactical design (aggregates, bounded contexts) — conceptual modeling stays one layer above all three."
version: 1.0.0
type: capability
browse_category: knowledge
category: modeling/conceptual
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Domain- and language-agnostic. The conceptual / logical / physical ladder applies across relational, document, graph, and event-sourced systems."
allowed-tools: Read Grep
keywords:
  - conceptual model
  - conceptual modeling methodology
  - domain abstraction
  - entity relationship cardinality
  - conceptual schema before implementation
  - business model to system model
  - generalization specialization
  - aggregation composition relationship
  - reify relationship to entity
  - conceptual logical physical layers
  - implementation leakage anti-pattern
  - unnamed relationship anti-pattern
  - god entity anti-pattern
  - missing entity anti-pattern
  - validate model with stakeholders
  - UML class diagram conceptual
  - role modeling pattern
  - is-a vs has-a vs owns
examples:
  - "a stakeholder says 'users place orders that ship in multiple boxes' — how do I capture this as a model before naming tables?"
  - "is a refund its own entity or just a payment status — what conceptual test decides that?"
  - "two business stakeholders disagree on whether a cart and an order are the same thing — how should the conceptual model resolve that?"
  - "our domain diagram already mentions UUIDs and cascade-delete — what anti-pattern is that and how do I pull it back?"
  - "this relationship has a date, an amount, and a status — should it stay as a line between entities or become its own entity?"
  - "should this attribute live on the Customer entity or on Order — what's the rule?"
  - "we have Physical, Digital, and Subscription products — how do I model that as generalization without lying about totality?"
anti_examples:
  - "give me the physical table design with PKs, FKs, and normalization forms"   # → logical/physical modeling skill
  - "I need OWL class axioms and reasoning constraints for these concepts"        # → ontology
  - "build the DDD aggregate boundaries and anti-corruption layer"                # → domain-modeling
  - "what hypernymy / meronymy labels apply between these terms"                  # → semantic relations
  - "review this ORM model class for code correctness"                            # → code-review
  - "name the entities and fields once we agree on the conceptual model"          # → naming-conventions
relations:
  boundary:
    - skill: code-review
      reason: "code-review evaluates implementation output; conceptual-modeling is the pre-implementation domain analysis above it"
    - skill: naming-conventions
      reason: "naming-conventions decides what to call entities and fields; conceptual-modeling decides what entities and fields exist in the first place"
    - skill: documentation
      reason: "documentation produces durable prose for a human reader; conceptual-modeling produces a structured domain model that documentation may later describe"
    - skill: refactor
      reason: "refactor preserves behavior while restructuring code; conceptual-modeling restructures the domain abstraction itself, which usually requires non-behavior-preserving change"
  related:
    - documentation
    - naming-conventions
  verify_with:
    - documentation
portability:
  readiness: scripted
  targets:
    - agent-skills
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Conceptual Modeling

## Coverage

Methodology for abstracting a real-world domain into a structured representation *before* any database table, API endpoint, or aggregate boundary is named. Identifies entities (distinguishable things the business tracks), attributes (properties that describe an entity), and relationships (meaningful connections between entities). Specifies cardinality (1:1, 1:N, M:N, 0..1, 1..*); distinguishes association from aggregation from composition; uses generalization / specialization with disjoint / overlapping and total / partial constraints; recognizes when an associative relationship needs to be reified into its own entity (e.g. an enrollment between Student and Course that carries grade and date). Walks the conceptual → logical → physical abstraction ladder. Validates models against business stakeholders' mental models via walk-through, scenario testing, negative testing, and terminology audit. Names the seven anti-patterns: implementation leakage, missing entity, god entity, phantom relationship, premature normalization, attribute-as-entity, unnamed relationship.

## Philosophy

Every software system is a model of some real-world domain. The quality of that model determines whether the system helps or hinders its users. Without explicit conceptual modeling, the team jumps directly from requirements to code — encoding implicit assumptions that surface later as architectural debt. A requirement like "users can place orders" hides dozens of decisions: is a cart an order? can an order have multiple shipments? is a refund a new entity or a state of a payment? Conceptual modeling forces those decisions to the surface *before* code exists, so rework happens on a whiteboard rather than across a migration.

The discipline is anti-rigid in a specific way. Conceptual modeling stays one layer *above* logical modeling (tables, foreign keys, normalization) and one layer *above* DDD tactical design (aggregates, bounded contexts, anti-corruption layers). The moment the model speaks of UUIDs, indexes, or cascade behavior, it has fallen into logical modeling. The moment it prescribes aggregates or anti-corruption layers, it has crossed into DDD. Conceptual modeling's job is earlier and narrower: capture the domain structure clearly enough that those later design layers can proceed without guessing about the business.

## 1. The Three-Level Architecture

| Level | Purpose | Audience | Notation |
|---|---|---|---|
| **Conceptual** | What exists in the business domain | Business stakeholders, product managers | Simplified UML class diagrams, entity lists, relationship maps |
| **Logical** | How the data is structured, platform-independent | Architects, senior developers | Normalized schemas, interface contracts, type hierarchies |
| **Physical** | How the data is stored and accessed | Database engineers, backend developers | SQL DDL, index strategies, partition schemes |

Rules:

- Always build conceptual *before* logical. Jumping straight to physical (tables, columns) from raw requirements produces brittle, business-disconnected schemas that fail their first feature change.
- Conceptual models must be readable by non-technical stakeholders. If a business user cannot validate the model, the model is too detailed.
- Each level *adds* implementation detail. None should *remove* business meaning. If something disappears as you move down, the lower layer has dropped a constraint that the business actually has.

## 2. Core Modeling Constructs

### 2.1 Entities and attributes

| Element | Definition | Modeling rule |
|---|---|---|
| **Entity** | A distinguishable thing the business tracks | Must have identity criteria — what makes two X's "the same"? |
| **Attribute** | A property that describes an entity | Belongs to exactly one entity; if it's shared, you've discovered a missing entity |
| **Derived attribute** | A value computed from other attributes | Mark explicitly; never store without documenting the derivation |
| **Multi-valued attribute** | An attribute with multiple values | Usually signals a missing child entity or collection |

### 2.2 Relationships

| Type | Notation (UML) | When to use |
|---|---|---|
| **Association** | Plain line between entities | Two entities are meaningfully connected |
| **Aggregation** (has-a) | Open diamond | Whole-part where parts can exist independently of the whole |
| **Composition** (owns) | Filled diamond | Whole-part where parts cannot exist without the whole |
| **Generalization** (is-a) | Triangle arrow toward supertype | Subtype inherits supertype properties |
| **Dependency** | Dashed arrow | One entity uses another without owning it |

### 2.3 Cardinality

| Pattern | Reading | Example |
|---|---|---|
| 1:1 | Exactly one to exactly one | User has one Profile |
| 1:N | One to many | Customer places many Orders |
| M:N | Many to many | Products belong to many Categories; Categories contain many Products |
| 0..1 | Optional one | Order may have zero or one Refund |
| 1..* | One or more (mandatory) | Order has at least one LineItem |

Rules:

- Every relationship must have explicit cardinality. Unmarked relationships are ambiguous and will be implemented incorrectly half the time.
- M:N relationships in the conceptual model often become junction entities in the logical model — especially once they acquire their own attributes.
- Optional vs mandatory is a *business* decision, not a technical one. Validate with stakeholders who actually know which orders can ship without addresses.

## 3. Generalization and Specialization

### When to generalize (bottom-up)

- Multiple entities share roughly 70%+ of their attributes
- Business users refer to them with a common name ("all our products, whether physical or digital")
- Operations apply uniformly ("ship any order, regardless of type")

### When to specialize (top-down)

- A single entity has attributes or behaviors that apply only to some of its instances
- Business rules differ by subtype ("digital products don't need shipping addresses")
- The type distinction drives different processing paths

### Specialization constraints

| Constraint | Meaning | Example |
|---|---|---|
| **Disjoint** | An instance belongs to *exactly one* subtype | A payment is either a CardPayment or a BankTransfer, never both |
| **Overlapping** | An instance can belong to *multiple* subtypes | A user can be both a Seller and a Buyer |
| **Total** | Every supertype instance belongs to *at least one* subtype | Every Product is either Physical or Digital — no untyped Products |
| **Partial** | Some supertype instances may not be specialized | A User may not yet be a Seller or a Buyer |

Each pair (disjoint vs overlapping) and (total vs partial) is independent — pick one from each pair for every generalization.

## 4. Abstraction Strategies

| Strategy | When to use | Risk if skipped |
|---|---|---|
| **Classification** | Grouping instances into types | Too many ad-hoc types; inconsistent behavior |
| **Aggregation** | Composing wholes from parts | Flat structures that lose structural meaning |
| **Generalization** | Finding common supertypes | Duplicated attributes and logic across subtypes |
| **Association** | Connecting related entities | Implicit relationships buried in code |
| **Reification** | Promoting a relationship to an entity | Important relationship attributes get lost (e.g., an Enrollment between Student and Course that carries grade and date) |

Rules:

- Reify a relationship when it has its *own* attributes, lifecycle, or identity.
- If an association carries a date, status, or amount, it is probably an entity in disguise.

## 5. Validating the Model with Stakeholders

| Method | What it catches |
|---|---|
| **Walk-through** | Read each relationship aloud: "A Customer places one or more Orders." If it sounds wrong, the model is wrong. |
| **Scenario testing** | Trace a real business scenario through the model. Every step should map to a model element. |
| **Negative testing** | Try to represent something the business says is impossible. If the model permits it, a constraint is missing. |
| **Terminology audit** | Every entity name should match what business users actually call it. Rename to match — never the other way around. |

If a business user can't read the model and recognise their own domain, the model is documentation theatre. Re-do it.

## 6. Anti-Patterns

| Anti-pattern | Symptom | Fix |
|---|---|---|
| **Implementation leakage** | Conceptual model talks about tables, columns, indexes, foreign keys | Strip all physical terminology; use entity / attribute / relationship |
| **Missing entity** | An attribute stores a comma-separated list, encoded compound, or JSON blob | Extract into a proper entity with its own identity |
| **God entity** | One entity with 30+ attributes spanning multiple business concerns | Decompose by business responsibility |
| **Phantom relationship** | Two entities are connected and no one can explain why | Remove it — relationships must serve a stated business purpose |
| **Premature normalization** | The conceptual model is already in 3NF | Normalization belongs in the logical model, not here |
| **Attribute-as-entity** | "Color" has its own entity with just a name attribute | Keep as an attribute or enum unless it has its own properties or lifecycle |
| **Unnamed relationship** | Lines between entities with no verb / role label | Every relationship needs a name a business user can validate |

## 7. From Conceptual to Implementation

The conceptual model is consumed by downstream layers. Track the typical translations so the conceptual model stays implementation-neutral:

| Conceptual element | Logical / physical translation |
|---|---|
| Entity | Type / class / interface, database table, API resource |
| Attribute | Property / field, database column |
| 1:N relationship | Foreign key on the N side |
| M:N relationship | Junction table with two foreign keys (often itself an entity at this layer) |
| Generalization (disjoint) | Discriminated union, single-table inheritance, or class-table inheritance |
| Generalization (overlapping) | Multiple junction tables or role-based flags |
| Composition | Cascade-delete on parent, nested API resource |
| Aggregation | Set-null on parent, independent API resource |
| Derived attribute | Computed column, getter, or materialized view |

These translations are *informational* — the conceptual model itself stays neutral. Naming the translations explicitly avoids the trap of authoring a "conceptual" model that has already pre-decided the physical layer.

## Verification

- [ ] Every relationship has a name (verb or role label) — not just lines between boxes
- [ ] Cardinality is specified on every relationship (1:1, 1:N, M:N, 0..1, 1..*)
- [ ] Aggregation, composition, and plain association are explicitly distinguished where relevant
- [ ] The model is free of physical terminology (no tables, columns, indexes, foreign keys, cascade, normalization)
- [ ] Generalization / specialization uses the correct disjoint / overlapping and total / partial pair
- [ ] Business stakeholders have read the model and validated it against their domain
- [ ] No M:N relationship hides an entity-worthy junction concept (i.e., one with its own attributes)
- [ ] No attribute stores compound, multi-valued, or encoded data
- [ ] Every entity has explicit identity criteria — "what makes two X's the same"
- [ ] Every entity name matches the term the business actually uses

## Do NOT Use When

| Use instead | When |
|---|---|
| A logical / physical modeling skill (database-specific ER) | You need PKs, FKs, normalization forms, index strategies — the layer below conceptual |
| An ontology skill | You need OWL axioms, RDFS class hierarchies, formal reasoning constraints — the layer above human-readable conceptual |
| A DDD / domain-modeling skill | You need bounded-context boundaries, aggregates, anti-corruption layers — DDD tactical design |
| `naming-conventions` | The conceptual model is settled; you now need to decide what to *call* the entities and fields in code |
| `code-review` | You are reviewing code that already implements the model — conceptual modeling is the upstream activity |
| `documentation` | You need to *describe* an existing system in prose for a human reader, not abstract a new domain into a structured model |
