---
name: semantic-relations
description: "Use when typing edges in a knowledge graph or concept map, resolving synonym/antonym/polysemy/homonym confusion, testing whether a connection is IS-A, PART-OF, causal, thematic, or vague, explaining adjacent concepts, or auditing whether hierarchy and skill-boundary decisions use the wrong relation type. Covers taxonomic, associative, and thematic relations plus symmetry, asymmetry, transitivity, reflexivity, and irreflexivity. Do NOT use for formal ontology axioms with reasoning constraints, database foreign-key or junction-table design, or operational data correspondence across systems. Do NOT use for I need formal OWL axioms, class restrictions, and reasoning semantics on a knowledge base. Do NOT use for I need the physical database foreign keys and junction-table design for these relationships. Do NOT use for I need to connect external IDs from one platform to canonical IDs in our system operationally."
license: MIT
compatibility: "Vocabulary-layer skill, stack- and storage-agnostic. The relation taxonomy and the substitution / property tests apply to any knowledge graph, concept map, taxonomy, naming system, or conceptual model; downstream implementation skills such as ontology-modeling, taxonomy-design, entity-relationship-modeling, and relational mapping consume the typed relations defined here."
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.2.0"
  subject: knowledge-organization
  deployment_target: portable
  taxonomy_domain: foundations/semantics
  owner: skill-graph-maintainer
  freshness: "2026-05-19"
  drift_check: "{\"last_verified\":\"2026-05-19\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"semantic relations\",\"relation typing\",\"IS-A relation\",\"PART-OF relation\",\"hypernymy hyponymy\",\"meronymy holonymy\",\"synonymy versus polysemy\",\"thematic role analysis\",\"relation property check\",\"knowledge-graph edge typing\",\"substitution test\",\"relation-vocabulary discipline\",\"typed-edge taxonomy\",\"conceptual-relation analysis\",\"adjacency-vs-boundary disambiguation\",\"generic related-to anti-pattern\",\"SKOS broader narrower related\",\"WordNet semantic relations\",\"FrameNet frame elements\"]"
  examples: "[\"our codebase uses customer, client, buyer, and user in different modules -- which relation analysis tells us whether this is synonymy, near-synonymy, or distinct domain language?\",\"a new graph schema uses related_to for every edge -- which semantic relation types should replace it so traversal and reasoning stay meaningful?\",\"is a refund a kind of payment, part of a payment, or the result of a payment action?\",\"two skills seem close: one owns structure design and one owns assignment into that structure -- is that adjacency, a boundary, or a deeper taxonomic relation?\",\"the word status appears across payments, orders, and fulfillment -- how should relation analysis expose the polysemy and guide disambiguation?\",\"type these knowledge-graph edges so traversal is meaningful instead of generic\",\"test whether every line item is an order passes the IS-A substitution test\"]"
  anti_examples: "[\"I need formal OWL axioms, class restrictions, and reasoning semantics on a knowledge base\",\"I need the physical database foreign keys and junction-table design for these relationships\",\"I need to connect external IDs from one platform to canonical IDs in our system operationally\",\"I need the broader representation choice between graph, frames, rules, or hybrid knowledge systems\",\"I need to analyze icon metaphors, color connotation, and UI sign systems\",\"rename this function across all call-sites in the repo\",\"design the full taxonomy, facets, and assignment rules for this category system\"]"
  relations: "{\"boundary\":[{\"skill\":\"linguistics\",\"reason\":\"linguistics owns word form, morphology, register, and identifier-level phrasing; semantic-relations owns the typed meaning connection between concepts such as IS-A, PART-OF, causal, thematic, synonymy, polysemy, and homonymy.\"},{\"skill\":\"conceptual-modeling\",\"reason\":\"conceptual-modeling builds the full pre-implementation domain structure of entities, attributes, relationships, and cardinality; semantic-relations supplies the relation-type vocabulary used inside or around that structure.\"},{\"skill\":\"knowledge-modeling\",\"reason\":\"knowledge-modeling chooses the representation paradigm such as graph, frame, rules, concept map, or hybrid; semantic-relations chooses the edge vocabulary inside whichever representation is selected.\"},{\"skill\":\"ontology-modeling\",\"reason\":\"ontology-modeling formalizes classes, properties, axioms, constraints, and reasoning semantics; semantic-relations is the pre-formal relation-typing layer and must not imply OWL/RDFS/SHACL commitments by itself.\"},{\"skill\":\"taxonomy-design\",\"reason\":\"taxonomy-design governs browse/category hierarchies, facets, assignment rules, and SKOS-style classification; semantic-relations only tests whether a single relation is hierarchy, association, part-whole, thematic role, or another typed edge.\"},{\"skill\":\"entity-relationship-modeling\",\"reason\":\"entity-relationship-modeling owns physical or logical database relationships, keys, junction tables, and persistence constraints; semantic-relations owns conceptual meaning relations before schema implementation.\"}],\"related\":[\"linguistics\",\"pattern-recognition\",\"semantic-center\",\"conceptual-modeling\",\"knowledge-modeling\",\"ontology-modeling\",\"taxonomy-design\"],\"verify_with\":[\"linguistics\",\"taxonomy-design\",\"ontology-modeling\",\"code-review\"]}"
  grounding: "{\"subject_matter\":\"Semantic relation typing for concept edges, lexical sense relations, knowledge-organization links, thematic roles, and relation-property checks\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://wordnet.princeton.edu/\",\"https://www.w3.org/TR/skos-reference/\",\"https://www.w3.org/TR/owl2-primer/\",\"https://framenet.icsi.berkeley.edu/WhatIsFrameNet\"],\"failure_modes\":[\"generic_related_to_edges_collapse_relation_meaning\",\"is_a_part_of_conflation_breaks_inheritance_reasoning\",\"synonym_polysemy_homonymy_confusion_drives_wrong_rename_or_flattening\",\"relation_properties_left_implicit\",\"thematic_roles_conflate_actor_instrument_cause_or_goal\",\"relation_typing_overowns_formal_ontology_taxonomy_or_database_design\",\"publishability_scan_false_positive_from_customer_specific_examples\"],\"evidence_priority\":\"equal\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Semantic-relations is to a knowledge graph what road-type labels are to a transit map: motorway, slip road, roundabout, bridge, tunnel, and one-way street are each typed connections with their own traversal rules. A map that labels every road connector is nearly useless for navigation; precise relation vocabulary makes the map a tool rather than an illustration."
  misconception: "|"
  concept: "{\"definition\":\"Semantic relations are typed connections between concepts in a meaning structure: IS-A, PART-OF, synonymy, antonymy, polysemy, homonymy, metonymy, causal relations, thematic roles, and relation properties such as symmetry and transitivity.\",\"mental_model\":\"Treat every edge as a claim with a named kind and testable behavior. A typed edge says how traversal, inheritance, substitution, role assignment, or inference should work; a vague edge only says two things are nearby.\",\"purpose\":\"The purpose is to replace generic association with relation vocabulary that supports reasoning, retrieval, naming disambiguation, hierarchy validation, and clean boundaries between neighboring skills or concepts.\",\"boundary\":\"It does not build the full conceptual model, choose the knowledge-representation paradigm, design a taxonomy, formalize an ontology, implement database relationships, or solve linguistic form and register questions.\",\"taxonomy\":\"Relation families include taxonomic relations such as hypernymy and hyponymy; mereological relations such as holonymy and meronymy; associative lexical relations such as synonymy, antonymy, polysemy, homonymy, and metonymy; thematic roles such as agent, patient, instrument, source, goal, cause, and result; and formal properties such as symmetry, asymmetry, transitivity, reflexivity, and irreflexivity.\",\"analogy\":\"Semantic relations are road types on a map: motorway, bridge, one-way street, and roundabout each permit different movement. Labelling every road as connector loses the rules that make navigation possible.\",\"misconception\":\"The common mistake is believing relation labels are optional decoration. In practice, confusing IS-A with PART-OF, synonymy with polysemy, or actor with instrument changes what readers and tools infer.\"}"
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/knowledge-organization/semantic-relations/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
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

## Boundary Routing

| User need | Use | Why |
|---|---|---|
| Word form, morphology, abbreviation, audience register, or blame-free phrasing | linguistics | Linguistics owns how terms are formed and phrased; semantic-relations owns the typed connection between meanings. |
| Meaning encoded by one name, status, version, commit type, token, or signal | semantics | Semantics owns the truthfulness of a single sign; semantic-relations owns the edge between two meanings. |
| Full entity/attribute/relationship model before implementation | conceptual-modeling | Conceptual-modeling builds the model; semantic-relations supplies precise relation vocabulary inside it. |
| Representation choice: graph, frame, rules, concept map, or hybrid | knowledge-modeling | Knowledge-modeling chooses the container; semantic-relations names the edge types inside the container. |
| Formal classes, properties, domain/range, axioms, SHACL, OWL, or reasoning semantics | ontology-modeling | Ontology-modeling turns durable relations into machine-checkable commitments; semantic-relations stays pre-formal. |
| Category tree, facets, browse taxonomy, assignment rules, or SKOS governance | taxonomy-design | Taxonomy-design owns the governed classification system; semantic-relations tests individual hierarchy/association claims. |
| Foreign keys, junction tables, cardinality constraints, or persistence schema | entity-relationship-modeling | ER modeling implements data relationships; semantic-relations analyzes conceptual meaning before implementation. |

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
| **Goal** | Where something goes | Delivery to destination address |
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
- Keep direct links and inferred links separate. SKOS, for example, distinguishes immediate `broader` / `narrower` assertions from transitive closure relations.
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

## Grounding Notes

- Use Princeton WordNet for lexical sense relations such as synonymy, hypernymy, hyponymy, meronymy, antonymy, and role-style cross-POS links.
- Use W3C SKOS for lightweight knowledge-organization links such as broader, narrower, related, preferred labels, and alternate labels.
- Use W3C OWL property semantics only to check relation-property vocabulary; move to ontology-modeling before making formal reasoning commitments.
- Use FrameNet for event/frame roles when generic thematic labels such as agent, patient, instrument, source, and goal are too coarse.

## Key Sources

- Princeton University. [WordNet: A Lexical Database for English](https://wordnet.princeton.edu/). Official public description of WordNet synsets and semantic relations including hypernymy, hyponymy, meronymy, antonymy, and role links.
- ICSI/Berkeley FrameNet. [What is FrameNet?](https://framenet.icsi.berkeley.edu/WhatIsFrameNet). Official introduction to frames, frame elements, lexical units, and frame-to-frame relation work.
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `knowledge-organization`
- Deployment: `portable`
- Domain: `foundations/semantics`

**When to use**
- our codebase uses customer, client, buyer, and user in different modules -- which relation analysis tells us whether this is synonymy, near-synonymy, or distinct domain language?
- a new graph schema uses related_to for every edge -- which semantic relation types should replace it so traversal and reasoning stay meaningful?
- is a refund a kind of payment, part of a payment, or the result of a payment action?
- two skills seem close: one owns structure design and one owns assignment into that structure -- is that adjacency, a boundary, or a deeper taxonomic relation?
- the word status appears across payments, orders, and fulfillment -- how should relation analysis expose the polysemy and guide disambiguation?
- type these knowledge-graph edges so traversal is meaningful instead of generic
- test whether every line item is an order passes the IS-A substitution test

**Not for**
- I need formal OWL axioms, class restrictions, and reasoning semantics on a knowledge base
- I need the physical database foreign keys and junction-table design for these relationships
- I need to connect external IDs from one platform to canonical IDs in our system operationally
- I need the broader representation choice between graph, frames, rules, or hybrid knowledge systems
- I need to analyze icon metaphors, color connotation, and UI sign systems
- rename this function across all call-sites in the repo
- design the full taxonomy, facets, and assignment rules for this category system
- Owned by `linguistics`: word form, morphology, register, and identifier-level phrasing
- Owned by `conceptual-modeling`
- Owned by `knowledge-modeling`
- Owned by `ontology-modeling`
- Owned by `taxonomy-design`
- Owned by `entity-relationship-modeling`: physical or logical database relationships, keys, junction tables, and persistence constraints

**Related skills**
- Verify with: `linguistics`, `taxonomy-design`, `ontology-modeling`, `code-review`
- Related: `linguistics`, `pattern-recognition`, `semantic-center`, `conceptual-modeling`, `knowledge-modeling`, `ontology-modeling`, `taxonomy-design`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Semantic-relations is to a knowledge graph what road-type labels are to a transit map: motorway, slip road, roundabout, bridge, tunnel, and one-way street are each typed connections with their own traversal rules. A map that labels every road connector is nearly useless for navigation; precise relation vocabulary makes the map a tool rather than an illustration.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://wordnet.princeton.edu/`, `https://www.w3.org/TR/skos-reference/`, `https://www.w3.org/TR/owl2-primer/`, `https://framenet.icsi.berkeley.edu/WhatIsFrameNet`

**Keywords**
- `semantic relations`, `relation typing`, `IS-A relation`, `PART-OF relation`, `hypernymy hyponymy`, `meronymy holonymy`, `synonymy versus polysemy`, `thematic role analysis`, `relation property check`, `knowledge-graph edge typing`, `substitution test`, `relation-vocabulary discipline`, `typed-edge taxonomy`, `conceptual-relation analysis`, `adjacency-vs-boundary disambiguation`, `generic related-to anti-pattern`, `SKOS broader narrower related`, `WordNet semantic relations`, `FrameNet frame elements`

<!-- skill-graph-context:end -->
