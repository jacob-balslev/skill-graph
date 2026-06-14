---
name: ontology-modeling
description: "Use when formalizing domain meaning with classes, properties, constraints, RDF/OWL-style semantics, SHACL-like validation shapes, or reasoning-ready axioms. Do NOT use for simple category trees (use `taxonomy-design`), pre-implementation business entity sketches (use `conceptual-modeling`), database schemas (use `entity-relationship-modeling`), or broad representation choice (use `knowledge-modeling`). Do NOT use for make a simple browse category tree for skills. Do NOT use for identify the business entities and relationships before implementation. Do NOT use for design the SQL tables, keys, and indexes. Do NOT use for choose whether this knowledge belongs in rules, frames, a graph, or a hybrid."
license: MIT
compatibility: "Portable ontology modeling guidance; implementation can be Markdown, RDF, JSON-LD, OWL, SHACL, or an internal schema language."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"entity-relationship-modeling\",\"semantic-relations\",\"taxonomy-design\",\"knowledge-modeling\",\"conceptual-modeling\"],\"suppresses\":[\"taxonomy-design\",\"knowledge-modeling\"],\"verify_with\":[\"semantic-relations\",\"conceptual-modeling\"],\"depends_on\":[\"semantic-relations\"]}"
  subject: knowledge-organization
  scope: "Teaches when and how to formalize domain meaning as classes, properties, constraints, axioms, validation shapes, and RDF/OWL/JSON-LD/SHACL-style artifacts. Excludes informal taxonomy/category trees, stakeholder-readable domain sketches, persistence/database modeling, and broad knowledge-representation choice."
  public: "true"
  taxonomy_domain: foundations/ontology
  stability: experimental
  keywords: "[\"ontology modeling\",\"formal semantics\",\"RDF\",\"OWL\",\"JSON-LD\",\"SHACL\",\"class axioms\",\"property domains\",\"property ranges\",\"disjoint classes\"]"
  examples: "[\"we need class and property definitions that another system can reason over, not just a human-readable diagram\",\"should Customer and Organization be disjoint classes in this ontology?\",\"define property domains and ranges for our skill graph export\",\"turn this conceptual model into a machine-checkable ontology without inventing database tables\"]"
  anti_examples: "[\"make a simple browse category tree for skills\",\"identify the business entities and relationships before implementation\",\"design the SQL tables, keys, and indexes\",\"choose whether this knowledge belongs in rules, frames, a graph, or a hybrid\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "An ontology is to a domain model what an engineering tolerance specification is to a manufactured part — the part might fit at +/-0.5mm informally (taxonomy, conceptual model), but if another factory must mass-produce a counterpart that mates with it, both factories need a tolerance spec that says *exactly* what 'fits' means in microns. The spec is more expensive to write than the napkin sketch, but it is the artefact that lets two shops produce interlocking parts without ever talking to each other."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/knowledge-organization/ontology-modeling/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Ontology Modeling

## Concept of the skill

Ontology modeling is the discipline of *formalizing the meaning of a domain* into classes, properties, and axioms whose semantics is precise enough for *automated reasoning, validation, or cross-system interoperability*. Drawing from Aristotle's categories, Gruber's information-systems definition ("a specification of a conceptualization"), and Guarino's formal-ontology tradition, it treats meaning as something that can be *specified* — a commitment to a conceptualization — and the specification as a *contract that downstream consumers can compute over*. Outputs: class hierarchies, object/data properties with domain/range, cardinality constraints, equivalence and disjointness axioms, identity criteria, controlled vocabularies, validation shapes (SHACL), interop-oriented JSON-LD/RDF projection.

Replaces "informal taxonomy plus prose conventions" with formal axiomatization when *ambiguity, interoperability, validation, or reasoning matter*. Solves the problem that without formal semantics, two systems claiming to share a vocabulary may *disagree on what the vocabulary means* — the same class name carrying different membership criteria, the same property carrying different domain or range, the same hierarchy carrying different inheritance semantics. Most teams do not need OWL — they need clear conceptual models and controlled vocabularies. *Escalate to ontology when another consumer must compute over the semantics, validate instances against constraints, or align meaning across systems*. The ontology must *preserve business meaning while stating which inferences are allowed*. A vague ontology is worse than no ontology because it gives false confidence to downstream tools that compute over it; the resulting incorrect inferences are harder to diagnose than the absence of any formalism.

Distinct from taxonomy-design, which owns *informal classification and facets* — human-governed category trees, browse taxonomies, SKOS broader/narrower; this skill owns *formal semantics* with axioms and reasoning constraints. Distinct from conceptual-modeling, which is *stakeholder-readable domain analysis* (entities and relationships with humans, before any formalism) — this skill is *machine-checkable semantic formalization*. Distinct from entity-relationship-modeling, which owns persistence structure and constraints (tables, FKs, indexes) — this skill owns *meaning constraints* (class/property axioms, validation shapes). Distinct from knowledge-modeling, which chooses the *representation paradigm* (graph/frames/rules/hybrid) — this skill *applies one formal paradigm* once chosen. Distinct from semantic-relations, which types individual relation edges — this skill is the formalization layer above. An ontology is to a domain model what an engineering tolerance specification is to a manufactured part — the part might fit at +/-0.5mm informally (taxonomy, conceptual model), but if another factory must mass-produce a counterpart that mates with it, both factories need a tolerance spec that says *exactly* what 'fits' means in microns. The spec is more expensive to write than the napkin sketch, but it is the artefact that lets two shops produce interlocking parts without ever talking to each other. The wrong mental model is that *every domain model should become an ontology* — that formalization is universally better. It is not. Ontology modeling is *only worth its cost when ambiguity, interoperability, validation, or reasoning matter*; most teams need clear conceptual models and controlled vocabularies, not OWL axioms. Adjacent misconceptions: that *more formal expressiveness is always better* (it is not — Baader et al.'s *Description Logic Handbook* documents the expressiveness-tractability trade-off rigorously: OWL DL is more expressive than OWL EL, but EL admits polynomial-time reasoning that DL does not; choose the profile that fits the reasoning task); that *disjointness claims are safe by default* (they are not — disjointness is a durable commitment; "Customer and Organization are disjoint" forbids legitimate cases where one entity is both, and the inference is *load-bearing for the consumer's reasoning*); that *synonyms are duplicate classes* (they are not — they should be *aliases* via `owl:sameAs` or `skos:altLabel`, not separate classes with overlapping membership); that *the open-world vs closed-world assumption is implicit* (it is not — RDF/OWL is open-world by default ["absence of a fact is not evidence of falsehood"]; many consumer applications assume closed-world ["if it's not in the database, it doesn't exist"]; the assumption *must be documented* or downstream reasoning produces wrong answers); and that *the ontology is the system* (it is not — the ontology is one artefact; the system also has data, code, and user-facing behaviour, and the ontology only governs the slice where formal semantics genuinely matter).

## Coverage

Formalize domain meaning into classes, properties, constraints, and axioms. Covers class hierarchy, object/data properties, domain/range, cardinality constraints, equivalence, disjointness, identity, controlled vocabularies, validation shapes, and interop-oriented JSON-LD/RDF projection. The output may be an actual ontology file or a precise ontology sketch before implementation.

## Philosophy of the skill
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
| `entity-relationship-modeling` | You need persistence schema, keys, indexes, or denormalization decisions. |
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

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `knowledge-organization`
- Public: `true`
- Domain: `foundations/ontology`
- Scope: Teaches when and how to formalize domain meaning as classes, properties, constraints, axioms, validation shapes, and RDF/OWL/JSON-LD/SHACL-style artifacts. Excludes informal taxonomy/category trees, stakeholder-readable domain sketches, persistence/database modeling, and broad knowledge-representation choice.

**When to use**
- we need class and property definitions that another system can reason over, not just a human-readable diagram
- should Customer and Organization be disjoint classes in this ontology?
- define property domains and ranges for our skill graph export
- turn this conceptual model into a machine-checkable ontology without inventing database tables

**Not for**
- make a simple browse category tree for skills
- identify the business entities and relationships before implementation
- design the SQL tables, keys, and indexes
- choose whether this knowledge belongs in rules, frames, a graph, or a hybrid

**Related skills**
- Depends on: `semantic-relations`
- Verify with: `semantic-relations`, `conceptual-modeling`
- Related: `entity-relationship-modeling`, `semantic-relations`, `taxonomy-design`, `knowledge-modeling`, `conceptual-modeling`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: An ontology is to a domain model what an engineering tolerance specification is to a manufactured part — the part might fit at +/-0.5mm informally (taxonomy, conceptual model), but if another factory must mass-produce a counterpart that mates with it, both factories need a tolerance spec that says *exactly* what 'fits' means in microns. The spec is more expensive to write than the napkin sketch, but it is the artefact that lets two shops produce interlocking parts without ever talking to each other.
- Common misconception: |

**Keywords**
- `ontology modeling`, `formal semantics`, `RDF`, `OWL`, `JSON-LD`, `SHACL`, `class axioms`, `property domains`, `property ranges`, `disjoint classes`

<!-- skill-graph-context:end -->
