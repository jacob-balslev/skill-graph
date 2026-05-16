---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: ontology-modeling
description: "Use when formalizing domain meaning with classes, properties, constraints, RDF/OWL-style semantics, SHACL-like validation shapes, or reasoning-ready axioms. Do NOT use for simple category trees (use `taxonomy-design`), pre-implementation business entity sketches (use `conceptual-modeling`), database schemas (use `data-modeling`), or broad representation choice (use `knowledge-modeling`)."
version: 1.1.0
type: capability
category: foundations
domain: foundations/ontology
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
  notes: "Portable ontology modeling guidance; implementation can be Markdown, RDF, JSON-LD, OWL, SHACL, or an internal schema language."
allowed-tools: Read Grep
keywords:
  - ontology modeling
  - formal semantics
  - RDF
  - OWL
  - JSON-LD
  - SHACL
  - class axioms
  - property domains
  - property ranges
  - disjoint classes
  - reasoning constraints
  - semantic interoperability
examples:
  - "we need class and property definitions that another system can reason over, not just a human-readable diagram"
  - "should Customer and Organization be disjoint classes in this ontology?"
  - "define property domains and ranges for our skill graph export"
  - "turn this conceptual model into a machine-checkable ontology without inventing database tables"
anti_examples:
  - "make a simple browse category tree for skills"
  - "identify the business entities and relationships before implementation"
  - "design the SQL tables, keys, and indexes"
  - "choose whether this knowledge belongs in rules, frames, a graph, or a hybrid"
relations:
  boundary:
    - skill: taxonomy-design
      reason: "taxonomy-design owns informal classification and facets; ontology-modeling owns formal semantics"
    - skill: conceptual-modeling
      reason: "conceptual-modeling is stakeholder-readable domain analysis; ontology-modeling is machine-checkable semantic formalization"
    - skill: data-modeling
      reason: "data-modeling owns persistence structure and constraints; ontology-modeling owns meaning constraints"
    - skill: knowledge-modeling
      reason: "knowledge-modeling chooses the representation paradigm; ontology-modeling applies one formal paradigm"
  related:
    - semantic-relations
    - taxonomy-design
    - knowledge-modeling
  depends_on:
    - semantic-relations
  verify_with:
    - semantic-relations
    - conceptual-modeling
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
concept:
  definition: "Ontology modeling is the discipline of formalizing the meaning of a domain into classes, properties, and axioms whose semantics is precise enough for automated reasoning, validation, or cross-system interoperability. Drawing from Aristotle's categories, Gruber's information-systems definition of ontology, and Guarino's formal ontology tradition, it treats meaning as something that can be specified — a *commitment to a conceptualization* — and the specification as a contract that downstream consumers can compute over."
  mental_model: |
    Five primitives structure formal ontology:

    1. **Class** — a category of entities that share defining properties. Classes form a *subsumption hierarchy* (`Dog ⊑ Mammal ⊑ Animal`) and may be related by *equivalence* (two classes name the same set), *disjointness* (no entity belongs to both), and *partition* (a class is exactly the union of its disjoint subclasses). Classes are the noun-vocabulary of the ontology.

    2. **Property** — a binary relation between entities (an *object property*) or between an entity and a literal value (a *data property*). Properties carry *domain* (allowed source classes) and *range* (allowed target classes or datatypes), *cardinality* (how many values are permitted), and modal characteristics (*functional*, *inverse-functional*, *transitive*, *symmetric*, *reflexive*). Properties are the verb-vocabulary of the ontology.

    3. **Axiom** — a statement that holds true of every model of the ontology. Subclass axioms (`A ⊑ B`), property characteristics (`hasParent` is irreflexive), disjointness assertions, equivalence assertions, and class restrictions (`Parent ≡ Person ⊓ ∃hasChild.Person`) are all axioms. Axioms are what distinguish a formal ontology from a labelled vocabulary: they license inferences that would otherwise have to be hand-coded.

    4. **The world-assumption axis** — *open-world assumption* (OWA): what is not stated is *unknown*, not false. *Closed-world assumption* (CWA): what is not stated is false. OWL adopts OWA because cross-system knowledge is incomplete by design; relational databases adopt CWA because their world is the database. Mixing the two without acknowledgment produces silent reasoning errors. Negation, in particular, behaves differently under each.

    5. **OntoClean and identity** — Guarino & Welty's methodology for evaluating subclass relations using meta-properties: *rigidity* (does the class apply for an entity's whole life?), *unity* (does the class supply criteria for what counts as one whole entity?), *identity* (does it supply criteria for sameness across time and contexts?), *dependence*. A class hierarchy that puts a non-rigid class as parent of a rigid class is structurally wrong; OntoClean flags the error before downstream reasoning consumes it.

    The deep insight (Gruber, Guarino, Smith): an ontology is *more than a vocabulary*. A vocabulary names entities; an ontology *commits* to what can be inferred about them. Two systems with the same vocabulary but different axioms produce different inferences from the same data — and the difference is invisible until inference results are compared. The point of formalization is to make the commitments explicit, machine-checkable, and shareable.
  purpose: |
    Most domain knowledge is conveyed informally — diagrams, prose, conventions, the institutional memory of senior engineers. Informal knowledge serves human readers but fails three classes of consumer: (a) automated reasoners that must derive conclusions not explicitly stated; (b) validators that must reject malformed instance data before it propagates; (c) interoperating systems that must agree on what a term means without reading each other's prose. Formal ontology solves all three by committing the meaning to a specification whose semantics is decidable.

    The discipline addresses the problem of *meaning drift across systems*. Two services may both have a class called `Customer`, but if one treats employees as customers and the other excludes them, every join between the two produces silently incorrect counts. The ontological discipline forces the disagreement into the open: write the axioms, run the reasoner, find the contradiction at design time rather than in production.

    The alternative — relying on prose and convention to convey meaning across systems — works at small scale and breaks at the boundary between organizations or between systems built years apart. The cost of formal ontology is borne up-front; the cost of *not* doing it is borne by every downstream consumer who must investigate what the other party actually meant.
  boundary: |
    **Ontology modeling is not taxonomy design.** A taxonomy is a human-governed classification tree (often informal, often hierarchical only). An ontology is formal: it commits to axioms about its classes and properties that licence machine inferences. Most teams need taxonomies, not ontologies. Escalate from taxonomy to ontology when automated reasoning, validation, or interop is genuinely required.

    **Ontology modeling is not conceptual modeling.** Conceptual modeling produces a human-readable analysis of domain entities for discussion with stakeholders. Ontology modeling formalizes those entities into a specification that machines can reason over. Conceptual work precedes ontology work; ontology work without conceptual grounding produces brittle formalizations of poorly understood domains.

    **Ontology modeling is not data modeling.** Data modeling produces persistence schemas (tables, columns, indexes, foreign keys) optimized for transactions and queries. Ontology modeling produces meaning specifications optimized for inference and interop. A table that stores `Customer` rows is data; an axiom that says `Customer ⊓ Employee = ∅` is ontology. The two can coexist (the ontology constrains the data) but they are not the same artefact.

    **Ontology modeling is not knowledge graph construction.** A knowledge graph is an *instance-level* assertion of entities and relationships; an ontology is the *schema* (the TBox in description-logic terminology, vs the ABox of instances). Knowledge graphs without ontologies are property graphs; knowledge graphs with ontologies are *reasoning-ready*. Different artefacts, related by composition.

    **Ontology modeling is not SKOS vocabulary.** SKOS provides a lightweight RDF vocabulary for thesauri and controlled vocabularies (broader/narrower/related, prefLabel/altLabel). It deliberately stops short of formal class axioms because it serves vocabulary management, not reasoning. Ontology modeling escalates beyond SKOS when inference matters.
  taxonomy: |
    - **Description logics (DL)** (formal foundation, Baader et al. 2003) — the family of decidable subsets of first-order logic that underlie OWL. *ALC*, *SROIQ*, and friends parameterize the trade-off between expressiveness and decidability.
    - **OWL 2** (specialization, W3C 2012) — the Web Ontology Language; standardized DL-based syntax with profiles (OWL 2 EL, QL, RL) that bound reasoning complexity.
    - **RDFS** (lightweight precursor, W3C 2014) — RDF Schema; minimal class/property vocabulary suited to data-integration contexts that don't need full DL reasoning.
    - **SHACL** (validation companion, W3C 2017) — Shapes Constraint Language; expresses validation shapes for RDF data. Compatible with OWL but oriented toward closed-world validation rather than open-world inference.
    - **OntoClean** (methodology, Guarino & Welty 2002) — meta-property analysis for evaluating subclass-relation correctness.
    - **Upper ontologies** (foundational layer, e.g. BFO, DOLCE, SUMO) — high-level ontologies of generic categories (continuant/occurrent, object/process) that domain ontologies extend.
    - **Schema.org** (lightweight applied ontology, Guha et al. 2016) — pragmatic web-scale ontology for marking up content; trades formal rigor for adoption.
    - **Conceptual graphs** (alternative formalism, Sowa 1984) — graphical/logical formalism for representing meaning; an alternative to DL with different ergonomic trade-offs.
    - **F-Logic / Object-Oriented ontologies** (alternative formalism) — frame-based formalizations with object-oriented semantics; closer to programming-language type systems.
  analogy: |
    A formal ontology is to natural-language documentation what a statically-typed program is to a dynamically-typed one. Both can describe the same domain; the typed version makes commitments that the runtime can check and the compiler can exploit. The cost is up-front: types must be authored. The benefit is that whole classes of error become detectable before they cause incorrect behavior.

    A second analogy: legal contracts. A contract specifies exactly what each party is committed to, in language precise enough that disputes can be resolved by reading the document rather than re-litigating intent. Two parties with a contract can interoperate even when they don't trust each other; two parties without one rely on shared informal understanding that breaks down at boundaries. Formal ontology is the contract for meaning.
  misconception: |
    The most common misconception is that **every knowledge base should be formalized as an ontology**. Most domain knowledge does not need formal ontology. The right representation for most teams is plain prose with conventions, or a property graph, or SKOS-grade controlled vocabulary. Escalating to OWL by default produces years of schema work in exchange for inference capabilities the team will never use.

    The second misconception is that **ontologies are about classification trees**. They include classification, but the *axioms* (class equivalences, property characteristics, restrictions, disjointness) are what distinguishes ontologies from taxonomies. An ontology whose only content is a class tree is doing the work of a taxonomy at higher ceremony cost.

    The third misconception is that **ontologies are language-independent**. The labels are language-bound (preferred labels, alternate labels); the *logical content* of the axioms is language-independent. Conflating the two produces ontologies whose label drift across translations creates de-facto different ontologies under the same URI.

    The fourth misconception is that **open-world reasoning is always the right choice**. OWA suits cross-system knowledge where assertions are incomplete by design; it is the wrong choice for validation contexts where "this instance has no `email`" should be a violation, not unknown. SHACL exists precisely because closed-world validation is a different problem from open-world inference; using OWL alone for validation produces false negatives.

    The fifth misconception is that **a well-formed ontology is a correct ontology**. The reasoner can verify consistency (no contradictions) and entailments (what follows from the axioms), but it cannot verify that the axioms *match the domain*. An internally consistent ontology can still misrepresent the world. Validation against domain expert walkthrough is irreplaceable; the formal check is necessary, not sufficient.
---

# Ontology Modeling

## Coverage

Formalize domain meaning into classes, properties, constraints, and axioms. Covers class hierarchy, object/data properties, domain/range, cardinality constraints, equivalence, disjointness, identity, controlled vocabularies, validation shapes, and interop-oriented JSON-LD/RDF projection. The output may be an actual ontology file or a precise ontology sketch before implementation.

## Philosophy

Ontology modeling is only worth its cost when ambiguity, interoperability, validation, or reasoning matter. Most teams do not need OWL. They need clear conceptual models and controlled vocabularies. Escalate to ontology when another consumer must compute over the semantics, validate instances against constraints, or align meaning across systems.

The ontology must preserve business meaning while stating which inferences are allowed. A vague ontology is worse than no ontology because it gives false confidence to downstream tools.

## Method

1. Identify competency questions: what must the ontology answer or validate?
2. Separate classes, instances, and literals.
3. Define properties with domain, range, direction, and cardinality where needed.
4. Add equivalence and disjointness only when the claim is durable.
5. Reuse existing vocabularies where they fit; do not rename standards for style.
6. Validate against positive and negative instance examples.
7. Document open-world vs closed-world assumptions.

## Verification

- [ ] Every class exists to answer a competency question
- [ ] Property domain and range are explicit where consumers depend on them
- [ ] Disjointness claims are intentional and tested with counterexamples
- [ ] Synonyms are aliases, not duplicate classes
- [ ] The model distinguishes class, instance, and literal values
- [ ] Validation examples include invalid cases
- [ ] Reasoning assumptions are stated

## Do NOT Use When

| Use instead | When |
|---|---|
| `taxonomy-design` | You need a human-governed category tree or facets, not formal axioms. |
| `conceptual-modeling` | You are still discovering business entities and relationships with stakeholders. |
| `data-modeling` | You need persistence schema, keys, indexes, or denormalization decisions. |
| `semantic-relations` | You only need to choose the relation type between concepts. |

## Key Sources

- Gruber, T. R. (1993). "A Translation Approach to Portable Ontology Specifications." *Knowledge Acquisition*, 5(2), 199-220. The canonical definition of ontology as "a specification of a conceptualization"; the modern grounding of formal ontology in information systems.
- Guarino, N. (1998). "Formal Ontology and Information Systems." In *Proceedings of FOIS '98*. IOS Press. The methodological foundation for evaluating ontologies; the discipline of distinguishing ontology from taxonomy by the presence of formal axioms.
- Guarino, N., & Welty, C. (2002). "Evaluating ontological decisions with OntoClean." *Communications of the ACM*, 45(2), 61-65. The OntoClean methodology: meta-properties (rigidity, unity, identity, dependence) for evaluating subclass-relation correctness.
- Baader, F., Calvanese, D., McGuinness, D. L., Nardi, D., & Patel-Schneider, P. F. (Eds.). (2003). *The Description Logic Handbook*. Cambridge University Press. The canonical reference for the formal foundations of OWL: syntax, semantics, complexity, and reasoning algorithms.
- W3C. [OWL 2 Web Ontology Language: Document Overview (Second Edition)](https://www.w3.org/TR/owl2-overview/). The normative specification of OWL 2 and its profiles (EL, QL, RL).
- W3C. [RDF Schema 1.1](https://www.w3.org/TR/rdf-schema/). The minimal RDFS vocabulary used as the lightweight precursor to OWL.
- W3C. [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/). The validation companion to OWL: closed-world validation shapes for RDF data.
- Sowa, J. F. (2000). *Knowledge Representation: Logical, Philosophical, and Computational Foundations*. Brooks/Cole. Comprehensive synthesis covering description logics, conceptual graphs, and the historical lineage from Aristotle to modern formal ontology.
- Smith, B. (2004). "Beyond Concepts: Ontology as Reality Representation." In *Proceedings of FOIS 2004*. The realist position on ontology: ontologies represent what exists in the world, not just what is in someone's head. Foundation for upper ontologies like BFO.
- Noy, N. F., & McGuinness, D. L. (2001). ["Ontology Development 101: A Guide to Creating Your First Ontology."](https://protege.stanford.edu/publications/ontology_development/ontology101.pdf) Stanford KSL Technical Report. The widely-cited practitioner methodology for ontology authoring.
