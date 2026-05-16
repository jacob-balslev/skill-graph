---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: semantic-relations
description: "Use when typing edges in a knowledge graph or concept map; resolving synonym, antonym, polysemy, or homonym confusion in naming; testing whether a connection is IS-A, PART-OF, causal, thematic, or merely vague; explaining the difference between two adjacent concepts or skills; or auditing whether hierarchy, graph, or naming decisions rest on the wrong relation type. Covers taxonomic relations (hypernymy/hyponymy, holonymy/meronymy with the substitution test), associative relations (synonymy, antonymy, polysemy, homonymy, metonymy), thematic relations (agent, patient, instrument, location, source, goal, cause, result, beneficiary), relation properties (symmetry, asymmetry, transitivity, reflexivity, irreflexivity), and the application of all of the above to knowledge-graph edge typing, naming disambiguation, and skill-boundary analysis. Do NOT use for formal ontology axioms with reasoning constraints (use an ontology skill), database foreign-key and junction-table design (use an entity-relationship-modeling skill), or operational data correspondence across systems (use a relational-mapping skill)."
version: 1.1.0
type: capability
category: foundations
domain: foundations/semantics
scope: portable
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
concept:
  definition: "Semantic relations are the *typed connections* between concepts in a meaning structure: IS-A (hypernymy/hyponymy), PART-OF (holonymy/meronymy), synonymy, antonymy, polysemy, homonymy, metonymy, and the thematic role relations (agent, patient, instrument, location, source, goal, cause, result). Drawn from lexical semantics (Lyons, Cruse), Princeton WordNet, the W3C SKOS vocabulary, and cognitive-semantics work on thematic roles (Fillmore 1968, Jackendoff 1990), it treats every edge in a knowledge graph, concept map, or hierarchy as a relation of a *named kind* rather than a generic association."
  mental_model: |
    Five primitives structure semantic-relation analysis:

    1. **The relation kinds** — meaning connections come in a small finite catalog with well-studied properties. *Taxonomic* relations (hypernymy, hyponymy) form genus-species trees with the substitution test ("every X is a Y"). *Mereological* relations (holonymy, meronymy) are part-whole with six recognized subtypes (component-integral, member-collection, portion-mass, stuff-object, feature-activity, place-area). *Associative lexical* relations (synonymy, antonymy, polysemy, homonymy, metonymy) describe how lexical signs relate. *Thematic* relations (agent, patient, instrument, location, source, goal, cause, result, beneficiary) describe the role an entity plays in an event.

    2. **Relation properties** — every relation has logical properties that determine valid inferences: *symmetric* (sibling-of), *asymmetric* (parent-of), *transitive* (ancestor-of), *reflexive* (equal-to), *irreflexive* (parent-of). A relation typed without its properties is half-specified; downstream traversal cannot decide whether `A → B → C` implies `A → C` or whether `A → B` implies `B → A`.

    3. **The substitution test** — the operational discipline for taxonomic claims: "Every [hyponym] is a [hypernym]." The test fails for non-IS-A relations: "every refund is a payment" sounds wrong because refund is not a kind of payment, it is a *type of related event*. Failing the test silently — treating PART-OF or thematic relations as IS-A — produces broken hierarchies that mislead navigation and inference.

    4. **The lexical-vs-conceptual distinction** — synonymy, polysemy, homonymy, and metonymy are properties of *signs* (words, labels, identifiers), not of the underlying concepts. Two different signs can point to one concept (synonymy); one sign can point to multiple related concepts (polysemy) or to unrelated concepts that happen to share form (homonymy). Conflating sign-relations with concept-relations is a routine source of taxonomy bugs.

    5. **Edge typing as inference licensing** — a graph whose edges are all labelled `related_to` cannot answer questions like "what kinds of vehicles are there?" or "what is composed of what?" because the edge labels carry no inferential content. Typing edges with specific relations is what makes the graph *traversable for reasoning* rather than merely walkable for browsing.

    The deep insight (Cruse, Lyons, WordNet): meaning is constituted by *systems of relations* between signs and concepts, not by isolated definitions. A definition tells you what a concept is; the relations tell you what it is *not*, what it includes, what includes it, what it depends on, and how it participates in events. The relations are where the inferential content lives.
  purpose: |
    Most modeling failures are not failures to name entities; they are failures to type the connections between entities. A knowledge graph with rich nodes and generic edges supports browsing but blocks reasoning: the system cannot answer "is X a kind of Y?" or "what are the parts of Z?" because the relation type required to answer the question was never recorded. Semantic-relation analysis solves the *under-specified-edges* problem.

    The discipline addresses three failure modes. The first is *generic-`related_to` edges* — meaningful for human eyeballs, useless for traversal-based inference. The second is *relation-type conflation* — treating PART-OF as IS-A, or thematic roles as type membership, producing hierarchies that fail the substitution test. The third is *lexical-conceptual confusion* — collapsing synonyms into duplicate nodes, or letting polysemous identifiers spread one concept across the codebase as if it were several.

    The alternative — declining to type relations — works at the prototype scale of a few dozen entities and breaks at the production scale of thousands. Edge typing is the discipline that makes the graph computable instead of merely visible.
  boundary: |
    **Semantic relations are not ontology axioms.** Semantic-relation analysis supplies the relation *vocabulary* (IS-A, PART-OF, thematic roles, properties). Ontology modeling formalizes those relations into machine-checkable axioms with reasoning semantics. The two compose: choose the relation kind first; formalize the axioms only if reasoning, validation, or interop requires it.

    **Semantic relations are not entity-relationship modeling.** ER modeling designs persistence schema — tables, columns, foreign keys, junction tables — for storage and transactional query. Semantic-relation analysis is the conceptual layer above ER modeling that decides *what kind of relation* the foreign key represents (whether the underlying connection is IS-A, PART-OF, thematic, or associative). The conceptual analysis usually precedes the ER implementation; doing ER without it produces schemas that conflate distinct relation kinds.

    **Semantic relations are not relational mapping.** Relational mapping is the *operational* discipline of corresponding entities across systems (Shopify order ID ↔ canonical order ID). Semantic-relation analysis is the *conceptual* discipline of typing connections within a meaning structure. Different layers, different problems.

    **Semantic relations are not taxonomy design.** Taxonomy design produces the classification *structure* (the hierarchy / facets / vocabulary scope). Semantic-relation analysis supplies the relation *types* used inside any structure — including the IS-A relations that hold the taxonomy together. The two compose: relation-typing is a building block; taxonomy design assembles the building blocks into a usable system.

    **Semantic relations are not linguistic morphology.** Linguistics owns word-form rules (compounding, polysemy at the identifier level, abbreviation). Semantic-relation analysis owns the typing of conceptual connections regardless of how the linguistic forms are spelled. The two interact: polysemy is a sign-level phenomenon that often signals conceptual relations worth typing explicitly.
  taxonomy: |
    - **Taxonomic relations** (family) — hypernymy / hyponymy (IS-A) and their lexicalized version *troponymy* (manner-IS-A for verbs).
    - **Mereological relations** (family) — holonymy / meronymy (PART-OF) with Winston, Chaffin & Herrmann's six subtypes (component-integral, member-collection, portion-mass, stuff-object, feature-activity, place-area).
    - **Lexical-associative relations** (family) — synonymy, antonymy (complementary, gradable, relational), polysemy, homonymy, metonymy.
    - **Thematic relations** (family, Fillmore 1968) — semantic roles: agent, patient, instrument, location, source, goal, cause, result, temporal, beneficiary.
    - **WordNet relations** (instantiation, Miller 1995) — the empirical English lexicon organized around hypernymy / hyponymy, meronymy, antonymy, troponymy; the largest tested catalog of semantic relations.
    - **SKOS relations** (lightweight instantiation, W3C 2009) — broader / narrower / related; the minimum-viable subset of the relation catalog suited to controlled vocabularies.
    - **OWL relations** (formalization, W3C) — object properties with characteristics (functional, inverse-functional, transitive, symmetric, asymmetric, reflexive, irreflexive); the formal end of the relation-typing spectrum.
    - **Conceptual-graph relations** (alternative formalism, Sowa 1984) — the relations used in conceptual graphs as a formalism alternative to description logics.
    - **The substitution test** (downstream method) — the discipline for validating taxonomic claims.
  analogy: |
    Semantic relations are the *prepositions* of a meaning structure. Nouns name things; verbs name actions; prepositions name how things and actions connect. A sentence with rich nouns and verbs but generic prepositions ("the box near the table near the room") is grammatically possible but expressively poor — "near" carries little information, and the listener cannot infer whether the box is *on*, *under*, *inside*, or *beside* the table. A knowledge graph with rich nodes and generic `related_to` edges has the same problem: the structural information that would license inference has been smoothed away.

    A second analogy: road signs vs road markings. Nodes are the destinations; relations are the road signs that tell you what to do at each connection — IS-A is a sign saying "this leads to the parent category," PART-OF says "this leads to the containing whole," CAUSES says "this leads to the consequence." Without the signs, you can still walk the graph; with them, you can navigate it on purpose.
  misconception: |
    The most common misconception is that **typing edges is over-engineering**. Generic `related_to` edges are *cheaper to write* and *more expensive to use*: every query against them requires the reader to re-derive what kind of relation each edge encodes, and every traversal must hedge against all possibilities. The cost is paid by every consumer instead of once by the author. Typed edges invert this cost structure.

    The second misconception is that **synonymy is a single relation**. Strict synonymy (perfectly substitutable across all contexts) is rare in natural language. Most "synonyms" are *near-synonyms* with subtle differences in register, scope, or connotation. Collapsing near-synonyms produces fragmented meaning: the team gives up the distinctions the near-synonyms were carrying. The discipline is to record near-synonymy as a relation rather than as identity.

    The third misconception is that **PART-OF is a uniform relation**. Winston, Chaffin & Herrmann (1987) identified six structurally different part-whole subtypes; they behave differently under transitivity, inheritance, and lifecycle. Treating all PART-OF as one relation produces inheritance rules that work for some subtypes and silently break for others.

    The fourth misconception is that **polysemy is a naming problem**. Polysemy is a *sign-level* phenomenon that usually signals an underlying *conceptual structure* worth modeling — when one sign carries multiple related meanings, the meanings are connected by a relation (metonymy, specialization, contextual extension) that the structure should record. Resolving polysemy by renaming alone discards that information.

    The fifth misconception is that **IS-A is the most important relation**. IS-A is the most *familiar* relation because it underlies classification trees, but PART-OF, thematic roles, and causal relations carry equal inferential content in most real systems. A model that overuses IS-A — forcing every connection into a class hierarchy — produces over-deep trees where PART-OF and thematic roles were the right shape. The discipline is choosing the relation that fits the connection, not defaulting to IS-A.
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

## Key Sources

- Cruse, D. A. (1986). *Lexical Semantics*. Cambridge University Press. The canonical treatment of word-meaning relationships: synonymy, antonymy, hyponymy, meronymy, and the substitution-test discipline that grounds taxonomic-claim validation.
- Lyons, J. (1977). *Semantics* (2 vols.). Cambridge University Press. Comprehensive structural-semantics textbook covering sense relations, lexical fields, and the relational view of meaning.
- Miller, G. A. (1995). "WordNet: A Lexical Database for English." *Communications of the ACM*, 38(11), 39-41. The reference paper for Princeton WordNet — the largest empirically-grounded catalog of semantic relations between English lexemes; the working model for any taxonomic / mereological / antonymy relation system at scale.
- Fellbaum, C. (Ed.). (1998). *WordNet: An Electronic Lexical Database*. MIT Press. The collected technical account of WordNet's relation set, design decisions, and applications.
- Winston, M. E., Chaffin, R., & Herrmann, D. (1987). "A Taxonomy of Part-Whole Relations." *Cognitive Science*, 11(4), 417-444. The reference paper for the six PART-OF subtypes (component-integral, member-collection, portion-mass, stuff-object, feature-activity, place-area). Foundation for any mereological analysis.
- Fillmore, C. J. (1968). "The Case for Case." In E. Bach & R. T. Harms (Eds.), *Universals in Linguistic Theory*. Holt, Rinehart and Winston. The foundational paper for thematic / case roles (agent, patient, instrument, location, source, goal); the linguistics origin of the role catalog still used in event modeling.
- Jackendoff, R. (1990). *Semantic Structures*. MIT Press. Modern cognitive-semantics treatment of thematic roles, conceptual structure, and the relationship between semantic and syntactic categories.
- W3C. [SKOS Simple Knowledge Organization System Reference](https://www.w3.org/TR/skos-reference/) (2009). The lightweight RDF vocabulary for broader/narrower/related and prefLabel/altLabel; the minimum-viable formalism for transmissible semantic relations.
- W3C. [OWL 2 Web Ontology Language: Primer (Second Edition)](https://www.w3.org/TR/owl2-primer/) (2012). Object properties and their characteristics — functional, inverse-functional, transitive, symmetric, asymmetric, reflexive, irreflexive — for the formal end of the relation-typing spectrum.
- Storey, V. C. (1993). "Understanding Semantic Relationships." *VLDB Journal*, 2(4), 455-488. Survey of semantic relations in data-modeling contexts; the bridge from linguistic relation analysis to information-systems design.
