---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: semantic-relations
description: "Use when typing edges in a knowledge graph or concept map; resolving synonym, antonym, polysemy, or homonym confusion in naming; testing whether a connection is IS-A, PART-OF, causal, thematic, or merely vague; explaining the difference between two adjacent concepts or skills; or auditing whether hierarchy, graph, or naming decisions rest on the wrong relation type. Covers taxonomic relations (hypernymy/hyponymy, holonymy/meronymy with the substitution test), associative relations (synonymy, antonymy, polysemy, homonymy, metonymy), thematic relations (agent, patient, instrument, location, source, goal, cause, result, beneficiary), relation properties (symmetry, asymmetry, transitivity, reflexivity, irreflexivity), and the application of all of the above to knowledge-graph edge typing, naming disambiguation, and skill-boundary analysis. Do NOT use for formal ontology axioms with reasoning constraints (use an ontology skill), database foreign-key and junction-table design (use an entity-relationship-modeling skill), or operational data correspondence across systems (use a relational-mapping skill)."
version: 1.0.0
type: capability
category: knowledge
domain: ai-engineering/knowledge
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
  notes: "Vocabulary-layer skill, stack- and storage-agnostic. The relation taxonomy and the substitution / property tests apply to any knowledge graph, concept map, taxonomy, or naming system; downstream implementation skills (ontology, ER modeling, relational mapping) consume the typed relations defined here."
allowed-tools: Read Grep
keywords:
  - semantic relations
  - relation typing
  - IS-A relation
  - PART-OF relation
  - hypernymy hyponymy
  - meronymy holonymy
  - synonymy versus polysemy
  - thematic role analysis
  - relation property check
  - knowledge-graph edge typing
  - substitution test
  - relation-vocabulary discipline
  - typed-edge taxonomy
  - conceptual-relation analysis
  - adjacency-vs-boundary disambiguation
  - generic related-to anti-pattern
examples:
  - "our codebase uses customer, client, buyer, and user in different modules — which relation analysis tells us whether this is synonymy, near-synonymy, or distinct domain language?"
  - "a new graph schema uses related_to for every edge — which semantic relation types should replace it so traversal and reasoning stay meaningful?"
  - "is a refund a kind of payment, part of a payment, or the result of a payment action?"
  - "two skills seem close: one owns structure design and one owns assignment into that structure — is that adjacency, a boundary, or a deeper taxonomic relation?"
  - "the word status appears across payments, orders, and fulfillment — how should relation analysis expose the polysemy and guide disambiguation?"
  - "type these knowledge-graph edges so traversal is meaningful instead of generic"
  - "test whether 'every line item is an order' passes the IS-A substitution test"
anti_examples:
  - "I need formal OWL axioms, class restrictions, and reasoning semantics on a knowledge base"
  - "I need the physical database foreign keys and junction-table design for these relationships"
  - "I need to connect external IDs from one platform to canonical IDs in our system operationally"
  - "I need the broader representation choice between graph, frames, rules, or hybrid knowledge systems"
  - "I need to analyze icon metaphors, color connotation, and UI sign systems"
  - "rename this function across all call-sites in the repo"
relations:
  boundary:
    - skill: linguistics
      reason: "linguistics owns the rules of word form (morphology, polysemy resolution at the identifier level, audience register); semantic-relations owns the typing of meaning connections between concepts (IS-A, PART-OF, thematic roles, relation properties) — the same 'what's the relationship between these two terms?' prompt routes by whether the lens is the term form/morphology or the typed connection between meanings"
    - skill: conceptual-modeling
      reason: "conceptual-modeling builds the full concept structure (which entities, which attributes, which relationships exist); semantic-relations supplies the relation-typing vocabulary used inside that structure (whether a relationship is taxonomic, mereological, thematic, causal) — the same 'model these concepts' prompt routes by whether the user wants the structure built or the relation types named"
    - skill: knowledge-modeling
      reason: "knowledge-modeling chooses the representation paradigm (graph, frames, rules, hybrid) for a knowledge surface; semantic-relations chooses the relation vocabulary used inside whatever paradigm is picked — the same 'design how to represent this knowledge' prompt routes by whether the trigger is the representation choice or the relation typing"
  related:
    - linguistics
    - pattern-recognition
    - semantic-center
  verify_with:
    - linguistics
    - code-review
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Semantic Relations

## Coverage

Semantic relation analysis as a typed-connection discipline. Covers four families of relations and their properties:

- **Taxonomic relations** — hypernymy / hyponymy (IS-A) with the substitution test, transitivity, asymmetry, and inheritance; holonymy / meronymy (PART-OF) with six part-whole types (component-integral, member-collection, portion-mass, stuff-object, feature-activity, place-area)
- **Associative relations** — synonymy, near-synonymy, antonymy (complementary, gradable, relational), polysemy, homonymy, metonymy
- **Thematic relations** (role-based) — agent, patient, instrument, location, source, goal, cause, result, temporal, beneficiary
- **Relation properties** — symmetry, asymmetry, transitivity, reflexivity, irreflexivity

Application surfaces include knowledge-graph edge typing, naming disambiguation (synonymy vs polysemy vs homonymy), skill / module boundary analysis (adjacent vs boundary vs verify-with), category / hierarchy sanity checks, and relation-aware explanation of how concepts connect. Includes a six-item anti-pattern catalog (generic `related_to` edges, circular IS-A, conflated PART-OF and IS-A, synonym sprawl, untyped polysemy, property-free relation definitions) and a six-item verification checklist.

## Philosophy

Every complex system depends on relation quality, not just node quality. Most knowledge-system failures are not failures to name the things; they are failures to *type the connection between things*. A graph with only `related_to` edges is nearly useless for reasoning. A naming audit that cannot separate synonymy from polysemy suggests the wrong fix. A skill system that cannot tell adjacency from boundary loads the wrong context.

The discipline is: **name the relation, then test whether the name is the right kind of relation.** If "A is B" fails the substitution test, it is not hypernymy. If a part-whole relation changes lifecycle semantics, it is not just loose association. If two words share one form but multiple related meanings, that is polysemy, not synonymy. Precision here compounds into every other knowledge and modeling skill — the quality of every downstream representation depends on whether the relations were typed correctly upstream.

This skill is the *vocabulary layer*. It does not own the formal axioms (an ontology skill), the storage shape (an ER-modeling skill), the cross-system data correspondence (a relational-mapping skill), or the broader knowledge-representation paradigm (a knowledge-modeling skill). It owns the question: *what kind of relation is this?*

---

## 1. Taxonomic Relations (Hierarchical)

### Hypernymy / Hyponymy (IS-A)

| Term | Definition | Example |
|------|-----------|---------|
| **Hypernym** | The more general category | Vehicle is a hypernym of Car |
| **Hyponym** | The more specific category | Car is a hyponym of Vehicle |
| **Co-hyponyms** | Same-level members of a category | Car, Truck, Motorcycle are co-hyponyms of Vehicle |

Properties:

- **Transitive** — if A is-a B and B is-a C, then A is-a C
- **Asymmetric** — if A is-a B, then B is NOT a A
- **Inheritance** — hyponyms inherit properties of hypernyms

Rules:

- Every IS-A claim must pass the **substitution test**: "Every [hyponym] is a [hypernym]." If that sentence sounds wrong, it is probably not hypernymy.
- Distinguish IS-A from role labels. A buyer is not a *type of* order; a buyer is an actor *related to* an order.
- Co-hyponyms should be mutually exclusive unless the model explicitly allows overlap.

### Holonymy / Meronymy (PART-OF)

| Term | Definition | Example |
|------|-----------|---------|
| **Holonym** | The whole | Order is holonym of LineItem |
| **Meronym** | The part | LineItem is meronym of Order |

Types of part-whole:

| Type | Part can exist alone? | Example |
|------|----------------------|---------|
| **Component-integral** | No | Engine is component of Car |
| **Member-collection** | Yes | Tree is member of Forest |
| **Portion-mass** | No | Slice is portion of Pie |
| **Stuff-object** | No | Wood is stuff of Table |
| **Feature-activity** | No | Payment is feature of Checkout |
| **Place-area** | Yes | Room is place in Building |

Rules:

- PART-OF is not the same as IS-A. "Every line item is an order" fails; "a line item is part of an order" passes.
- Part-whole relations carry lifecycle implications that influence later ER modeling and API design, but those implementation choices belong to the downstream implementation skills.
- Do not assume every part-of relation is fully transitive in practical reasoning.

---

## 2. Associative Relations (Non-Hierarchical)

### Synonymy and Antonymy

| Relation | Definition | Software impact |
|----------|-----------|-----------------|
| **Synonymy** | Different words, same meaning | `customer`, `client`, `buyer` may collapse into one canonical term |
| **Near-synonymy** | Similar but not identical meaning | `error`, `failure`, `fault` may need explicit distinctions |
| **Antonymy** | Opposite meaning | `credit` vs `debit`, `active` vs `inactive` |
| **Complementary antonymy** | Binary opposition, no middle | `true` / `false` |
| **Gradable antonymy** | Scale with degrees | `high` / `low` |
| **Relational antonymy** | Paired roles | `buyer` / `seller`, `parent` / `child` |

Rules:

- Synonymy is usually a naming-governance problem: pick one canonical label and route aliases to it.
- Near-synonyms must not be flattened if the codebase or domain uses them differently.
- Antonym pairs should be consistent within one domain surface; avoid mixing `inactive`, `disabled`, and `off` unless the distinctions are real.

### Polysemy and Homonymy

| Relation | Definition | Software impact |
|----------|-----------|-----------------|
| **Polysemy** | One form, multiple related meanings | `order` can mean purchase, sequence, or command |
| **Homonymy** | One form, unrelated meanings | `bank` as finance vs river bank |

Rules:

- Polysemy is common in code and product language. Qualify the meaning with context when one bare term can mislead.
- Homonymy usually requires stronger renaming than polysemy because the meanings are unrelated.
- If two meanings are related and historically or structurally connected, treat it as polysemy, not accidental duplication.

### Metonymy

| Relation | Definition | Example |
|----------|-----------|---------|
| **Metonymy** | One concept stands in for a closely related concept | `shipped` used to denote an order's *current state* rather than the act itself |

Rules:

- Metonymic shortcuts are acceptable only when the intended meaning remains obvious in context.
- Audit status labels and event names for places where a metonym has become more confusing than helpful.

---

## 3. Thematic Relations (Role-Based)

| Role | Definition | Example |
|------|-----------|---------|
| **Agent** | The entity that performs the action | Customer places order |
| **Patient** | The entity affected by the action | Order is placed by customer |
| **Instrument** | The means by which the action is performed | Payment processed via payment provider |
| **Location** | Where the action occurs | Order placed in storefront |
| **Source** | Where something comes from | Shipment from warehouse |
| **Goal** | Where something goes | Delivery to customer address |
| **Cause** | What triggers the action | Webhook triggers order sync |
| **Result** | What the action produces | Payment produces receipt |
| **Temporal** | When the action occurs | Order placed on 2026-03-29 |
| **Beneficiary** | Who benefits from the action | Refund issued for customer |

Rules:

- Use thematic roles when an action or event relation is more precise than simple association.
- Distinguish the actor from the instrument and from the cause; they are often conflated in loose architecture explanations.
- Event naming and API design improve when the thematic role is clear.

---

## 4. Relation Properties

| Property | Definition | Test |
|----------|-----------|------|
| **Symmetric** | If A relates to B, then B relates to A | `sibling_of` |
| **Asymmetric** | If A relates to B, then B does NOT relate to A the same way | `is_a` |
| **Transitive** | If A → B and B → C, then A → C | `ancestor_of` |
| **Reflexive** | A relates to itself | `equal_to` |
| **Irreflexive** | A cannot relate to itself | `parent_of` |

Rules:

- Relation names are incomplete without relation properties.
- If the relation direction matters, state it explicitly instead of assuming readers infer it.
- Property mismatches are a common source of bad graph or hierarchy design.

---

## 5. Application

### Knowledge-Graph Edge Typing

| Bad (vague) | Better (typed) | Why |
|-------------|----------------|-----|
| `A -- related_to -- B` | `A -- is_a -- B` | Preserves hierarchy meaning |
| `A -- linked_to -- B` | `A -- causes -- B` | Preserves causal meaning |
| `A -- see_also -- B` | `A -- adjacent_to -- B` | Makes proximity type explicit |
| `A -- has -- B` | `A -- composed_of -- B` | Separates part-whole from loose ownership |

### Skill-Boundary Analysis

| Skill-system relation | Semantic relation analogue |
|-----------------------|----------------------------|
| `related` (formerly `adjacent`) | Associative or thematic proximity |
| `boundary` | Scope separation between neighboring categories or co-hyponyms |
| `verify_with` | Instrumental relation: one skill is used to validate another |

### Naming Disambiguation

When two names conflict:

1. Identify the relation: synonymy, near-synonymy, polysemy, homonymy, or antonym mismatch.
2. If synonymy: pick one canonical label and redirect aliases.
3. If polysemy: qualify with context.
4. If homonymy: rename one of the terms outright.

---

## 6. Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **Generic `related_to` edges** | No semantic information; poor reasoning and poor graph traversal | Type the edge with a specific relation |
| **Circular IS-A** | A is-a B is-a C is-a A | Keep the hierarchy acyclic and substitution-valid |
| **Conflated PART-OF and IS-A** | Treating a component as a subtype | Apply the substitution test first |
| **Synonym sprawl** | Several labels for one concept | Canonical term + explicit aliases |
| **Untyped polysemy** | One term overloaded across domains | Qualify the term or split the concept |
| **Property-free relation definitions** | Named relation with no symmetry/transitivity reasoning | State the relation properties explicitly |

---

## Verification

After applying this skill, verify:

- [ ] Every conceptual or graph edge has a typed relation rather than a vague generic link
- [ ] IS-A relationships pass the substitution test
- [ ] PART-OF relationships are not being mistaken for type hierarchy
- [ ] Synonymy, polysemy, and homonymy are distinguished before renaming
- [ ] Relation properties (symmetry, asymmetry, transitivity, reflexivity) are explicit when they matter
- [ ] Boundary claims with neighboring skills or modules still hold under the substitution / governance test

## Do NOT Use When

| Instead, use | Why |
|---|---|
| `linguistics` | Analyzing word morphology, polysemy at the identifier level, audience register, or blame-free phrasing. Linguistics covers word-form rules; semantic-relations covers meaning-connection types. |
| `conceptual-modeling` | Building the full concept structure (entities, attributes, relationships, invariants). Conceptual-modeling owns structure; semantic-relations owns the relation-typing vocabulary used inside it. |
| `knowledge-modeling` | Choosing the representation paradigm — graph vs frames vs rules vs hybrid — for a knowledge surface. Knowledge-modeling chooses the paradigm; semantic-relations chooses the relation vocabulary inside it. |
| (an ontology skill) | Building formal ontologies with class/property axioms, restrictions, and reasoning semantics. Ontology formalizes; semantic-relations supplies the relation vocabulary before formalization. |
| (an entity-relationship-modeling skill) | Designing database foreign keys, junction tables, and physical schema constraints. ER modeling implements physical relationships; semantic-relations analyzes conceptual ones. |
| (a relational-mapping skill) | Mapping entities between different systems or platforms operationally. Relational mapping is operational data correspondence, not conceptual relation typing. |
| (a taxonomy skill) | Designing hierarchy or facet structures themselves. Taxonomy owns the structural classification system; semantic-relations owns the relation meanings used within and around it. |
| (a semiotics skill) | Auditing iconography, color connotation, or interface sign systems. Semiotics handles signs in interfaces; semantic-relations handles concept-to-concept meaning relations. |
