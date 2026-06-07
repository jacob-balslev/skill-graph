---
name: taxonomy-design
description: "Use when designing a controlled classification system: category trees, facets, browse taxonomies, SKOS broader/narrower relationships, tagging rules, and duplicate-category cleanup. Do NOT use for formal ontology axioms with reasoning constraints (use `ontology-modeling`), broad knowledge-representation choice (use `knowledge-modeling`), or one-off edge typing (use `semantic-relations`). Do NOT use for define OWL class restrictions and property domains for this knowledge base. Do NOT use for decide whether this knowledge should be represented as a graph, frame, rules, or hybrid. Do NOT use for type this single relation as meronymy, causality, synonymy, or thematic role. Do NOT use for write user-facing labels for this navigation item. Do NOT use for formal axioms and reasoning semantics (use ontology-modeling)."
license: MIT
compatibility: "Portable taxonomy design discipline for skill libraries, product information architecture, documentation trees, and knowledge graphs."
allowed-tools: Read Grep
metadata:
  subject: knowledge-organization
  deployment_target: portable
  scope: "Teaches controlled classification systems for categories, facets, browse taxonomies, SKOS broader/narrower links, assignment rules, synonym control, and duplicate-category cleanup. Excludes formal ontology axioms, representation-paradigm choice, single-edge relation typing, and UI-copy/navigation-label writing."
  taxonomy_domain: foundations/classification
  stability: experimental
  keywords: "[\"taxonomy design\",\"controlled vocabulary\",\"browse taxonomy\",\"category hierarchy\",\"facets\",\"tagging rules\",\"broader narrower\",\"SKOS hierarchy\",\"classification cleanup\",\"duplicate categories\"]"
  examples: "[\"our skill categories are drifting: some are by domain, some by activity, and some by tool - how should the taxonomy be redesigned?\",\"should these be tags, facets, or child categories?\",\"build a clean category tree for these concepts without making every related term a parent-child relation\",\"we have analytics, observability, telemetry, and monitoring as categories - which should merge and which should stay separate?\"]"
  anti_examples: "[\"define OWL class restrictions and property domains for this knowledge base\",\"decide whether this knowledge should be represented as a graph, frame, rules, or hybrid\",\"type this single relation as meronymy, causality, synonymy, or thematic role\",\"write user-facing labels for this navigation item\"]"
  relations: "{\"boundary\":[{\"skill\":\"ontology-modeling\",\"reason\":\"ontology-modeling owns formal axioms and reasoning semantics; taxonomy-design owns human-governed classification\"},{\"skill\":\"knowledge-modeling\",\"reason\":\"knowledge-modeling chooses the representation paradigm; taxonomy-design works inside the classification paradigm once chosen\"},{\"skill\":\"semantic-relations\",\"reason\":\"semantic-relations types individual concept edges; taxonomy-design governs the category system and assignment rules\"}],\"related\":[\"information-architecture\",\"skill-infrastructure\",\"context-graph\"],\"depends_on\":[\"semantic-relations\"],\"verify_with\":[\"semantic-relations\",\"context-graph\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Taxonomy design is to a knowledge surface what a public library's call-number system is to its collection — the books haven't changed, but the system determines which books a researcher finds when looking under 'biology' versus 'medicine' versus 'public health.' A library that categorizes by acquisition date (the author's mental map) is unfindable; one that categorizes by subject with cross-references and facet headings (retrieval contract for the navigator) is searchable. Dewey Decimal is a hierarchy with facet-like subdivisions; Library of Congress is more faceted; both are taxonomies, both have explicit retrieval-task analyses behind their structure."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/knowledge-organization/taxonomy-design/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---

# Taxonomy Design

## Coverage

Design controlled classification systems for skills, docs, product catalogs, navigation trees, knowledge graphs, and tags. Covers hierarchy shape, facet selection, synonym control, category granularity, assignment rules, governance, and drift cleanup. Use SKOS-grade distinctions: broader/narrower for hierarchy, related for association, preferred labels for canonical terms, alternate labels for aliases.

## Philosophy

A taxonomy is a retrieval contract. It should make things findable by the people or agents who browse it, not mirror the author's private mental map. The main failure mode is mixing incompatible organizing principles: by audience, by tool, by lifecycle phase, by domain, and by risk all in the same tree.

Prefer shallow, stable, mutually understandable structure. Add facets when one tree cannot express all valid access paths. Do not turn every semantic relation into a hierarchy.

## Method

1. Name the retrieval tasks: what questions must the taxonomy answer?
2. Choose one primary organizing principle for the tree: domain, activity, artifact, lifecycle, or risk.
3. Move secondary dimensions into facets or tags.
4. Apply the substitution test to every parent-child pair: every child must be a kind of the parent.
5. Define assignment rules for ambiguous cases.
6. Add canonical labels and aliases; never let synonyms become sibling categories.
7. Test with real items and real prompts; count "misc", duplicates, and uncertain assignments.

## Verification

- [ ] Every child category passes the IS-A substitution test against its parent
- [ ] Sibling categories share the same organizing principle
- [ ] Cross-cutting concerns are facets/tags, not duplicated branches
- [ ] Canonical labels and aliases are explicit
- [ ] Ambiguous assignment rules are written down
- [ ] No category exists only because one item needed somewhere to go
- [ ] Real items can be placed without using a catch-all bucket

## Do NOT Use When

| Use instead | When |
|---|---|
| `ontology-modeling` | You need formal class/property axioms, RDF/OWL semantics, or automated reasoning. |
| `knowledge-modeling` | You are still choosing between graph, frame, rule, concept-map, or hybrid representations. |
| `semantic-relations` | You only need to type the relation between two concepts. |
| `information-architecture` | You are arranging pages, navigation, labels, and wayfinding for a user-facing experience. |

## Key Sources

- Ranganathan, S. R. (1933/1962). *Colon Classification* and *Prolegomena to Library Classification* (3rd ed.). Asia Publishing House. The foundational statement of faceted classification and the PMEST formula (Personality / Matter / Energy / Space / Time); the alternative to strict hierarchical trees that all modern multi-criteria classification descends from.
- W3C. [SKOS Simple Knowledge Organization System Reference](https://www.w3.org/TR/skos-reference/) (2009). The standard data model for taxonomies and thesauri: broader/narrower/related, prefLabel/altLabel, and the minimal formalism required for transmissible classification.
- Bowker, G. C., & Star, S. L. (1999). *Sorting Things Out: Classification and Its Consequences*. MIT Press. The canonical critical study of how classifications shape what becomes thinkable; the source of the "boundary infrastructure" framing and the empirical evidence that taxonomies without explicit retrieval-task analysis become abandoned bureaucratic structure.
- Hjørland, B. (2008). "What is Knowledge Organization (KO)?" *Knowledge Organization*, 35(2-3), 86-101. Authoritative survey of the field; situates taxonomy design within library and information science.
- Aristotle. *Categories* (c. 350 BCE). The philosophical root of hierarchical classification: genus-species definitions, the predicables, and the structure that two and a half millennia of taxonomy work has built on or against.
- Vander Wal, T. (2005). ["Folksonomy."](https://vanderwal.net/folksonomy.html) The coinage and definition of folksonomy; the alternative to controlled vocabulary and the trade-offs that come with emergent tagging.
- Morville, P., & Rosenfeld, L. (2006). *Information Architecture for the World Wide Web* (3rd ed.). O'Reilly. The practitioner reference for taxonomy work in user-facing systems; the bridge from classification to navigation.
- Glushko, R. J. (Ed.). (2013). *The Discipline of Organizing*. MIT Press. Cross-disciplinary synthesis treating classification as a design activity rather than a domain reflection; explicit attention to facet design and retrieval-task analysis.
- Schema.org. [Type Hierarchy](https://schema.org/docs/full.html). A pragmatic large-scale web taxonomy; a real-world example of design choices, facet vs hierarchy decisions, and the costs of governance at scale.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `knowledge-organization`
- Deployment: `portable`
- Domain: `foundations/classification`
- Scope: Teaches controlled classification systems for categories, facets, browse taxonomies, SKOS broader/narrower links, assignment rules, synonym control, and duplicate-category cleanup. Excludes formal ontology axioms, representation-paradigm choice, single-edge relation typing, and UI-copy/navigation-label writing.

**When to use**
- our skill categories are drifting: some are by domain, some by activity, and some by tool - how should the taxonomy be redesigned?
- should these be tags, facets, or child categories?
- build a clean category tree for these concepts without making every related term a parent-child relation
- we have analytics, observability, telemetry, and monitoring as categories - which should merge and which should stay separate?

**Not for**
- define OWL class restrictions and property domains for this knowledge base
- decide whether this knowledge should be represented as a graph, frame, rules, or hybrid
- type this single relation as meronymy, causality, synonymy, or thematic role
- write user-facing labels for this navigation item
- Owned by `ontology-modeling`: formal axioms and reasoning semantics
- Owned by `knowledge-modeling`
- Owned by `semantic-relations`

**Related skills**
- Depends on: `semantic-relations`
- Verify with: `semantic-relations`, `context-graph`
- Related: `information-architecture`, `skill-infrastructure`, `context-graph`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Taxonomy design is to a knowledge surface what a public library's call-number system is to its collection — the books haven't changed, but the system determines which books a researcher finds when looking under 'biology' versus 'medicine' versus 'public health.' A library that categorizes by acquisition date (the author's mental map) is unfindable; one that categorizes by subject with cross-references and facet headings (retrieval contract for the navigator) is searchable. Dewey Decimal is a hierarchy with facet-like subdivisions; Library of Congress is more faceted; both are taxonomies, both have explicit retrieval-task analyses behind their structure.
- Common misconception: |

**Keywords**
- `taxonomy design`, `controlled vocabulary`, `browse taxonomy`, `category hierarchy`, `facets`, `tagging rules`, `broader narrower`, `SKOS hierarchy`, `classification cleanup`, `duplicate categories`

<!-- skill-graph-context:end -->
