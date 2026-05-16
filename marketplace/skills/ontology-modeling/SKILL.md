---
name: ontology-modeling
description: "Use when formalizing domain meaning with classes, properties, constraints, RDF/OWL-style semantics, SHACL-like validation shapes, or reasoning-ready axioms. Do NOT use for simple category trees (use `taxonomy-design`), pre-implementation business entity sketches (use `conceptual-modeling`), database schemas (use `data-modeling`), or broad representation choice (use `knowledge-modeling`)."
license: MIT
compatibility: "Portable ontology modeling guidance; implementation can be Markdown, RDF, JSON-LD, OWL, SHACL, or an internal schema language."
allowed-tools: Read Grep
metadata:
  schema_version: "4"
  version: "1.1.0"
  type: capability
  category: foundations
  domain: foundations/ontology
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-16"
  drift_check: "{\"last_verified\":\"2026-05-16\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"ontology modeling\",\"formal semantics\",\"RDF\",\"OWL\",\"JSON-LD\",\"SHACL\",\"class axioms\",\"property domains\",\"property ranges\",\"disjoint classes\",\"reasoning constraints\",\"semantic interoperability\"]"
  examples: "[\"we need class and property definitions that another system can reason over, not just a human-readable diagram\",\"should Customer and Organization be disjoint classes in this ontology?\",\"define property domains and ranges for our skill graph export\",\"turn this conceptual model into a machine-checkable ontology without inventing database tables\"]"
  anti_examples: "[\"make a simple browse category tree for skills\",\"identify the business entities and relationships before implementation\",\"design the SQL tables, keys, and indexes\",\"choose whether this knowledge belongs in rules, frames, a graph, or a hybrid\"]"
  relations: "{\"boundary\":[{\"skill\":\"taxonomy-design\",\"reason\":\"taxonomy-design owns informal classification and facets; ontology-modeling owns formal semantics\"},{\"skill\":\"conceptual-modeling\",\"reason\":\"conceptual-modeling is stakeholder-readable domain analysis; ontology-modeling is machine-checkable semantic formalization\"},{\"skill\":\"data-modeling\",\"reason\":\"data-modeling owns persistence structure and constraints; ontology-modeling owns meaning constraints\"},{\"skill\":\"knowledge-modeling\",\"reason\":\"knowledge-modeling chooses the representation paradigm; ontology-modeling applies one formal paradigm\"}],\"related\":[\"semantic-relations\",\"taxonomy-design\",\"knowledge-modeling\"],\"depends_on\":[\"semantic-relations\"],\"verify_with\":[\"semantic-relations\",\"conceptual-modeling\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  concept: "{\"definition\":\"Ontology modeling is the discipline of formalizing the meaning of a domain into classes, properties, and axioms whose semantics is precise enough for automated reasoning, validation, or cross-system interoperability. Drawing from Aristotle's categories, Gruber's information-systems definition of ontology, and Guarino's formal ontology tradition, it treats meaning as something that can be specified — a *commitment to a conceptualization* — and the specification as a contract that downstream consumers can compute over.\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"taxonomy\":\"|\",\"analogy\":\"|\",\"misconception\":\"|\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/ontology-modeling/SKILL.md
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
