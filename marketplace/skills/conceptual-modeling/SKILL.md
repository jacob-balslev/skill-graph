---
name: conceptual-modeling
description: "Use when translating messy business requirements, stakeholder language, or early product ideas into an implementation-neutral domain model before database schemas, API endpoints, or DDD aggregates are named. Covers entities, attributes, named relationships, cardinality, identity criteria, specialization/generalization, aggregation/composition, reification, abstraction-level control, stakeholder validation, and modeling anti-patterns. Do NOT use for database ER diagrams with keys and normalization, formal ontology axioms with OWL/RDFS, or DDD tactical design; use those dedicated skills instead. Do NOT use for give me the physical table design with PKs, FKs, and normalization forms. Do NOT use for turn this model into SQL migrations and index definitions. Do NOT use for I need OWL class axioms and reasoning constraints for these concepts. Do NOT use for build the DDD aggregate boundaries and anti-corruption layer. Do NOT use for what hypernymy or meronymy labels apply between these two terms."
license: MIT
compatibility: "Domain- and language-agnostic. The conceptual / logical / physical ladder applies across relational, document, graph, event-sourced, and service-oriented systems. Examples use generic commerce and education nouns only as public, portable modeling examples."
allowed-tools: Read Grep
metadata:
  grounding: "{\"subject_matter\":\"Implementation-neutral conceptual modeling for business domains before logical schema, physical database, ontology, API, or DDD tactical design\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://doi.org/10.1145/320434.320440\",\"https://www.omg.org/spec/UML/2.5.1/PDF\",\"https://opentextbc.ca/dbdesign01/chapter/chapter-8-entity-relationship-model/\",\"https://www.ibm.com/think/topics/conceptual-data-model\"],\"failure_modes\":[\"implementation_leakage_turns_conceptual_model_into_physical_schema\",\"unnamed_relationships_hide_business_meaning\",\"cardinality_or_optionality_left_implicit\",\"identity_criteria_missing_for_entities\",\"relationship_with_attributes_not_reified\",\"generalization_claim_lies_about_disjointness_or_totality\",\"stakeholder_validation_skipped\",\"conceptual_model_overowns_ontology_data_modeling_or_ddd_design\"],\"evidence_priority\":\"equal\"}"
  relations: "{\"related\":[\"taxonomy-design\",\"data-modeling\",\"entity-relationship-modeling\",\"semantic-relations\",\"ontology-modeling\",\"bounded-context-mapping\",\"naming-conventions\",\"code-review\"],\"suppresses\":[\"entity-relationship-modeling\",\"data-modeling\",\"bounded-context-mapping\"],\"verify_with\":[\"semantic-relations\",\"data-modeling\",\"ontology-modeling\"]}"
  subject: software-architecture
  scope: "Translating messy business requirements, stakeholder language, and early product ideas into an implementation-neutral domain model before schemas, endpoints, or DDD aggregates are named — entities, attributes, named relationships, cardinality, identity criteria, specialization/generalization, aggregation/composition, reification, abstraction-level control, stakeholder validation, and modeling anti-patterns. Portable across any domain-modeling effort; principle-grounded, not repo-bound. Excludes database ER diagrams with keys and normalization (data-modeling), formal ontology axioms in OWL/RDFS (ontology-modeling), and DDD tactical design (bounded-context-mapping)."
  public: "true"
  taxonomy_domain: engineering/modeling
  stability: experimental
  keywords: "[\"conceptual model\",\"conceptual modeling methodology\",\"domain abstraction\",\"implementation neutral model\",\"business model to system model\",\"stakeholder validation\",\"entity identity criteria\",\"named relationship\",\"relationship cardinality\",\"reified relationship\"]"
  examples: "[\"a stakeholder says users place orders that ship in multiple boxes -- how do I capture this as a model before naming tables?\",\"is a refund its own entity or just a payment status -- what conceptual test decides that?\",\"two business stakeholders disagree on whether a cart and an order are the same thing -- how should the conceptual model resolve that?\",\"our domain diagram already mentions UUIDs and cascade-delete -- what anti-pattern is that and how do I pull it back?\",\"this relationship has a date, an amount, and a status -- should it stay as a line between entities or become its own entity?\",\"should this attribute live on Customer or Order -- what is the rule?\",\"we have Physical, Digital, and Subscription products -- how do I model that as specialization without lying about totality?\"]"
  anti_examples: "[\"give me the physical table design with PKs, FKs, and normalization forms\",\"turn this model into SQL migrations and index definitions\",\"I need OWL class axioms and reasoning constraints for these concepts\",\"build the DDD aggregate boundaries and anti-corruption layer\",\"what hypernymy or meronymy labels apply between these two terms\",\"review this ORM model class for code correctness\",\"name the entities and fields once we agree on the conceptual model\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Conceptual modeling is the architectural floor plan before engineering drawings: it says what rooms exist, how people move between them, and what must be connected, while leaving materials, wiring, and load calculations to later specialists."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/conceptual-modeling/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
# Conceptual Modeling

## Concept of the skill

Conceptual modeling is a meaning-first translation layer. It turns stakeholder language and domain scenarios into an implementation-neutral map of entities, attributes, identity criteria, relationships, cardinalities, and specialization constraints. The model is not the database, not the API, and not the ontology; it is the shared domain agreement those later artifacts must preserve.

This skill exists to catch modeling mistakes while they are still cheap: ambiguous nouns, unnamed relationships, hidden many-to-many concepts, attributes that should be entities, physical design leaking into business diagrams, and subtype claims that silently change business rules. It gives agents a repeatable way to surface decisions before code, migrations, or formal axioms harden them.

This skill owns pre-implementation business meaning and stakeholder validation. It does not choose primary keys, indexes, SQL normalization forms, migration steps, OWL/RDFS axioms, SHACL shapes, DDD aggregate boundaries, anti-corruption layers, implementation names, or code-level correctness. Those are downstream skills once the conceptual model is stable. Conceptual modeling is the architectural floor plan before engineering drawings: it says what rooms exist, how people move between them, and what must be connected, while leaving materials, wiring, and load calculations to later specialists. The common mistake is treating a conceptual model as a vague sketch or as an early database diagram. A good conceptual model is neither. It is precise about meaning, identity, relationship names, cardinality, and business constraints, while deliberately refusing to decide storage, framework, or reasoning technology too early.

## Coverage

Conceptual modeling translates real-world domain language into a structured, stakeholder-readable model before implementation details are allowed to enter. It covers:

- Entity discovery: distinguishable things the domain tracks, with identity criteria for what makes two instances the same.
- Attribute placement: properties that describe one entity, derived values, multi-valued attributes, and signals that an attribute is actually a missing entity.
- Relationship modeling: named relationships, role labels, cardinality, optionality, direction, aggregation, composition, association, dependency, and relationship reification.
- Specialization and generalization: subtype/supertype modeling with disjoint versus overlapping and total versus partial constraints.
- Abstraction-level control: keeping conceptual models above logical schemas, physical storage, APIs, ontology axioms, and DDD tactical design.
- Stakeholder validation: scenario walk-throughs, negative testing, terminology audits, and conflict resolution when different stakeholders use different concepts.
- Anti-pattern detection: implementation leakage, missing entity, god entity, phantom relationship, premature normalization, attribute-as-entity, unnamed relationship, and over-formalization.

## Philosophy of the skill
Every software system is a model of a domain. If the model is wrong, correct code faithfully automates the wrong understanding. Conceptual modeling exists to make the model explicit while change is still cheap. A requirement like "users can place orders" hides real decisions: is a cart an order, can one order split into many shipments, is a refund a payment state or a separate event, and who can validate those answers?

The discipline is to stay deliberately one layer above implementation. The model should be precise enough that a stakeholder can reject it, but neutral enough that it does not smuggle in UUIDs, foreign keys, cascade rules, API routes, aggregate boundaries, or OWL axioms. Those downstream choices are important; they are just not conceptual modeling.

A useful conceptual model is not decorative. It is a decision surface. Every entity, relationship name, cardinality, and subtype constraint should answer: "What would break in the business if this were modeled differently?"

## Boundary Routing

| User need | Use | Why |
|---|---|---|
| Discover business entities, attributes, relationships, identity, and cardinality before implementation | `conceptual-modeling` | This is the meaning-first layer. |
| Translate a validated conceptual model into logical or physical storage design | `data-modeling` | Data modeling adds keys, constraints, provenance, normalization, denormalization, and indexing tradeoffs. |
| Design database ER diagrams, tables, primary keys, foreign keys, junction tables, inheritance mapping, or SQL translation | `entity-relationship-modeling` | ER modeling is database-facing implementation design. |
| Formalize classes, properties, axioms, SHACL shapes, OWL/RDFS semantics, or reasoning assumptions | `ontology-modeling` | Ontology modeling is machine-checkable semantic formalization. |
| Decide whether one edge is IS-A, PART-OF, synonymy, causal, thematic, symmetric, or transitive | `semantic-relations` | Semantic relations supplies edge-type tests consumed by conceptual models. |
| Decide DDD bounded contexts, aggregate boundaries, anti-corruption layers, or translation maps | `bounded-context-mapping` | DDD tactical design is downstream of the concept inventory. |
| Choose final implementation names, casing, suffixes, or rename mechanics | `naming-conventions` | Naming follows a settled model; it should not decide the model. |

## 1. The Three-Level Architecture

| Level | Question | Audience | Output | Forbidden leakage |
|---|---|---|---|---|
| Conceptual | What exists and how does the business understand it? | Stakeholders, product, domain experts, senior builders | Entity list, relationship map, cardinality, business constraints | UUIDs, tables, indexes, framework names, API routes |
| Logical | How should information be structured independent of one storage engine? | Architects, senior engineers | Types, schemas, constraints, interfaces, provenance | Vendor-specific DDL or performance tuning |
| Physical | How is it stored and accessed in this system? | Database/backend engineers | SQL DDL, indexes, partitions, migrations, storage settings | Unvalidated business assumptions |

Rules:

- Build conceptual before logical. Jumping from raw requirements to tables usually preserves the first interpretation, not the correct interpretation.
- Conceptual models must be readable by non-technical stakeholders. If a stakeholder cannot validate it, the model is too technical or too vague.
- Each lower level may add implementation detail, but it must not remove business meaning.
- When a model starts discussing storage, restore the abstraction boundary instead of pretending the physical choice is a business concept.

## 2. Core Modeling Constructs

### Entities and Identity

| Element | Definition | Test |
|---|---|---|
| Entity | A distinguishable thing the domain tracks | Can stakeholders identify two separate instances? |
| Identity criteria | The rule for deciding whether two references point to the same entity | If names or IDs change, can we still tell sameness? |
| Attribute | A property that describes one entity | Does it make sense without the parent entity? |
| Derived attribute | A value computed from other facts | Can we name the derivation source? |
| Multi-valued attribute | A property with multiple values | Does each value need identity, lifecycle, or metadata? |

Rules:

- Every entity needs identity criteria, not just a label. "Customer" is incomplete until the model says what makes two customer records the same real-world party.
- Attributes belong to the entity whose meaning they describe. If an attribute is shared by many entities, changes independently, or carries its own lifecycle, it is probably a missing entity.
- Derived attributes belong in the conceptual model only when the business names them. Mark them as derived so later layers do not treat them as independent facts.

### Relationships

| Type | When to use | Conceptual risk |
|---|---|---|
| Association | Two entities are meaningfully connected | Vague if unnamed |
| Aggregation | Whole-part where parts can exist independently | Confusing ownership with loose grouping |
| Composition | Whole-part where parts cannot exist without the whole | Overstating deletion/lifecycle semantics |
| Generalization | Subtype inherits from supertype | Creating false IS-A claims |
| Dependency | One concept uses or depends on another without owning it | Hiding an actor, trigger, or instrument role |

Rules:

- Every relationship must have a name or role phrase a stakeholder can read aloud.
- Every relationship must state cardinality and optionality on both ends.
- If a relationship has its own attributes, status, amount, date, actor, lifecycle, or identity, reify it into an entity.
- Use `semantic-relations` when the relation type itself is unclear; use this skill to place that relation inside the full domain model.

### Cardinality and Optionality

| Pattern | Reading | Example |
|---|---|---|
| 1:1 | Exactly one to exactly one | User has one Profile |
| 1:N | One to many | Customer places many Orders |
| M:N | Many to many | Products belong to many Categories |
| 0..1 | Optional one | Order may have zero or one Refund |
| 1..* | One or more | Order has at least one LineItem |

Rules:

- Cardinality is a business decision before it is a database constraint. Validate it with people who know the domain.
- Optionality is not a nullability shortcut. "May have zero" must mean the business permits absence.
- M:N relationships are acceptable in conceptual models. They become junctions later only if the logical/physical layer needs that representation.

## 3. Generalization and Specialization

Use generalization when multiple entities share identity logic or behavior that stakeholders recognize under a common term. Use specialization when a common entity has durable subtype distinctions with different attributes, constraints, or lifecycle rules.

| Constraint | Meaning | Example |
|---|---|---|
| Disjoint | One instance belongs to exactly one subtype | A payment is either CardPayment or BankTransfer, not both. |
| Overlapping | One instance may belong to multiple subtypes | A user may be both Buyer and Seller. |
| Total | Every supertype instance belongs to at least one subtype | Every Product is Physical or Digital. |
| Partial | Some supertype instances may not be specialized | A User may not yet be Buyer or Seller. |

Rules:

- Pick one from disjoint/overlapping and one from total/partial for every specialization.
- Do not model roles as subtypes unless the role changes identity or durable structure. Buyer is often a role in a transaction, not a type of person.
- Subtype models must survive counterexamples. If one valid example breaks the subtype rule, the conceptual model is overstating the domain.

## 4. Abstraction Strategies

| Strategy | Use when | Watch for |
|---|---|---|
| Classification | Grouping instances by stable type | Categories that are really temporary states |
| Aggregation | Modeling wholes composed from parts | Parts that should be independently identifiable |
| Generalization | Finding shared supertypes | False inheritance |
| Association | Connecting independent entities | Unnamed lines with no business purpose |
| Reification | Promoting a relationship to an entity | Losing relationship attributes such as date, amount, status, actor, or sequence |
| Role modeling | Representing how an entity participates in an event | Mistaking a role for an entity subtype |

A clean conceptual model often gets smaller after these strategies. Smaller is not the goal; clearer meaning is. If removal hides a business distinction, it is not cleanup.

## 5. Validating the Model With Stakeholders

| Method | What it catches |
|---|---|
| Walk-through | Read each relationship aloud: "A Customer places one or more Orders." If it sounds wrong, the model is wrong. |
| Scenario testing | Trace a real business scenario through the model. Every step should map to a model element. |
| Negative testing | Try to represent something the business says is impossible. If the model permits it, a constraint is missing. |
| Terminology audit | Every entity and relationship label should match domain language or deliberately record an alias. |
| Conflict interview | Ask two stakeholders to validate the same model and capture where their language diverges. |
| Downstream rehearsal | Ask data, API, ontology, or DDD reviewers what decision they would make from the model; if they infer different things, the model is ambiguous. |

If a stakeholder cannot read the model and recognize the domain, the model is documentation theater. Rework it until the disagreement is explicit.

## 6. Anti-Patterns

| Anti-pattern | Symptom | Fix |
|---|---|---|
| Implementation leakage | Conceptual model mentions tables, columns, UUIDs, indexes, foreign keys, cascade rules, routes, serializers, or framework classes | Strip physical/logical terms and return to entities, attributes, relationships, and constraints |
| Missing entity | An attribute stores a list, compound value, blob, or encoded string | Extract a proper entity with identity, lifecycle, and relationships |
| God entity | One entity carries many unrelated responsibilities | Split by business responsibility and relationship structure |
| Phantom relationship | Two entities are connected but no one can state the business meaning | Remove it or name the real relationship |
| Premature normalization | Conceptual model already looks like 3NF | Move normalization to `data-modeling` or `entity-relationship-modeling` |
| Attribute-as-entity | A simple value becomes an entity only because it appears in a diagram | Keep as an attribute or enum unless it has identity, properties, lifecycle, or relationships |
| Unnamed relationship | Lines connect boxes without verbs or role labels | Name every relationship in stakeholder language |
| False generalization | A subtype hierarchy fails real examples | Replace inheritance with roles, states, or associations |
| Over-formalization | The model uses axioms, property domains/ranges, or reasoning assumptions before needed | Route to `ontology-modeling` only when machine-checkable semantics are required |

## 7. From Conceptual Model to Downstream Work

A conceptual model should hand off decisions without pretending to be the downstream artifact.

| Conceptual element | Downstream consumer |
|---|---|
| Entity and identity criteria | Data model, API resource model, ontology class, aggregate candidate |
| Attribute and derived attribute | Data field, computed value, validation shape, API representation |
| Named relationship and cardinality | Foreign key, reference, event relation, ontology property, API link |
| Reified relationship | Junction entity, event, transaction, association object |
| Specialization constraints | Type hierarchy, discriminated union, inheritance mapping, class axioms |
| Composition or aggregation | Lifecycle policy, deletion rule, nesting, ownership semantics |

Do not erase the conceptual model after implementation starts. Keep it as the explanation of why later schema/API/ontology choices mean what they mean.

## Source Notes

- Peter Chen's 1976 ER paper grounds the idea that entities and relationships can model business meaning before storage mechanics dominate the design.
- OMG UML 2.5.1 grounds class, association, aggregation, composition, generalization, multiplicity, and role notation used in many conceptual sketches.
- Open textbook ER modeling material grounds the conceptual/logical/physical ladder and the practical entity/attribute/relationship vocabulary.
- IBM's conceptual data model overview grounds the implementation-neutral purpose of conceptual models as stakeholder-facing representations before logical and physical modeling.

## Verification

- [ ] Every entity has identity criteria: what makes two instances the same.
- [ ] Every relationship has a stakeholder-readable name or role phrase.
- [ ] Cardinality and optionality are specified on every relationship.
- [ ] Aggregation, composition, and plain association are distinguished where lifecycle meaning matters.
- [ ] Generalization/specialization states disjoint or overlapping and total or partial constraints.
- [ ] Relationships with their own attributes, lifecycle, status, amount, date, actor, or sequence are reified.
- [ ] The model is free of implementation leakage: no tables, columns, primary keys, indexes, cascade rules, routes, serializers, framework classes, or OWL axioms.
- [ ] Stakeholders validated the model through scenarios and at least one negative test.
- [ ] Terminology conflicts are recorded instead of silently normalized away.
- [ ] Downstream handoff names which decisions belong to data modeling, ER modeling, ontology modeling, DDD, naming, or code review.

## Do NOT Use When

| Use instead | When |
|---|---|
| `data-modeling` | You need logical or physical storage design: keys, constraints, provenance, normalization, denormalization, indexing, or schema tradeoffs. |
| `entity-relationship-modeling` | You need database-oriented ER diagrams, PK/FK decisions, junction tables, inheritance mapping, SQL translation, indexing, or database constraints. |
| `ontology-modeling` | You need OWL/RDFS class axioms, SHACL shapes, property domains/ranges, disjointness constraints for reasoning, or machine-checkable semantics. |
| `semantic-relations` | You only need to decide whether one relation is IS-A, PART-OF, causal, thematic, synonymy, polysemy, symmetric, or transitive. |
| `bounded-context-mapping` | You need DDD bounded contexts, aggregate boundaries, anti-corruption layers, context maps, or translation policies. |
| `naming-conventions` | The conceptual model is settled and you now need implementation names, casing, suffixes, or rename mechanics. |
| `code-review` | You are reviewing code or schema that already implements the model. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Public: `true`
- Domain: `engineering/modeling`
- Scope: Translating messy business requirements, stakeholder language, and early product ideas into an implementation-neutral domain model before schemas, endpoints, or DDD aggregates are named — entities, attributes, named relationships, cardinality, identity criteria, specialization/generalization, aggregation/composition, reification, abstraction-level control, stakeholder validation, and modeling anti-patterns. Portable across any domain-modeling effort; principle-grounded, not repo-bound. Excludes database ER diagrams with keys and normalization (data-modeling), formal ontology axioms in OWL/RDFS (ontology-modeling), and DDD tactical design (bounded-context-mapping).

**When to use**
- a stakeholder says users place orders that ship in multiple boxes -- how do I capture this as a model before naming tables?
- is a refund its own entity or just a payment status -- what conceptual test decides that?
- two business stakeholders disagree on whether a cart and an order are the same thing -- how should the conceptual model resolve that?
- our domain diagram already mentions UUIDs and cascade-delete -- what anti-pattern is that and how do I pull it back?
- this relationship has a date, an amount, and a status -- should it stay as a line between entities or become its own entity?
- should this attribute live on Customer or Order -- what is the rule?
- we have Physical, Digital, and Subscription products -- how do I model that as specialization without lying about totality?

**Not for**
- give me the physical table design with PKs, FKs, and normalization forms
- turn this model into SQL migrations and index definitions
- I need OWL class axioms and reasoning constraints for these concepts
- build the DDD aggregate boundaries and anti-corruption layer
- what hypernymy or meronymy labels apply between these two terms
- review this ORM model class for code correctness
- name the entities and fields once we agree on the conceptual model

**Related skills**
- Verify with: `semantic-relations`, `data-modeling`, `ontology-modeling`
- Related: `taxonomy-design`, `data-modeling`, `entity-relationship-modeling`, `semantic-relations`, `ontology-modeling`, `bounded-context-mapping`, `naming-conventions`, `code-review`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Conceptual modeling is the architectural floor plan before engineering drawings: it says what rooms exist, how people move between them, and what must be connected, while leaving materials, wiring, and load calculations to later specialists.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://doi.org/10.1145/320434.320440`, `https://www.omg.org/spec/UML/2.5.1/PDF`, `https://opentextbc.ca/dbdesign01/chapter/chapter-8-entity-relationship-model/`, `https://www.ibm.com/think/topics/conceptual-data-model`

**Keywords**
- `conceptual model`, `conceptual modeling methodology`, `domain abstraction`, `implementation neutral model`, `business model to system model`, `stakeholder validation`, `entity identity criteria`, `named relationship`, `relationship cardinality`, `reified relationship`

<!-- skill-graph-context:end -->
