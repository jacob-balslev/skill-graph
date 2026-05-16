---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: taxonomy-design
description: "Use when designing a controlled classification system: category trees, facets, browse taxonomies, SKOS broader/narrower relationships, tagging rules, and duplicate-category cleanup. Do NOT use for formal ontology axioms with reasoning constraints (use `ontology-modeling`), broad knowledge-representation choice (use `knowledge-modeling`), or one-off edge typing (use `semantic-relations`)."
version: 1.1.0
type: capability
category: foundations
domain: foundations/classification
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
  notes: "Portable taxonomy design discipline for skill libraries, product information architecture, documentation trees, and knowledge graphs."
allowed-tools: Read Grep
keywords:
  - taxonomy design
  - controlled vocabulary
  - browse taxonomy
  - category hierarchy
  - facets
  - tagging rules
  - broader narrower
  - SKOS hierarchy
  - classification cleanup
  - duplicate categories
  - taxonomy governance
examples:
  - "our skill categories are drifting: some are by domain, some by activity, and some by tool - how should the taxonomy be redesigned?"
  - "should these be tags, facets, or child categories?"
  - "build a clean category tree for these concepts without making every related term a parent-child relation"
  - "we have analytics, observability, telemetry, and monitoring as categories - which should merge and which should stay separate?"
anti_examples:
  - "define OWL class restrictions and property domains for this knowledge base"
  - "decide whether this knowledge should be represented as a graph, frame, rules, or hybrid"
  - "type this single relation as meronymy, causality, synonymy, or thematic role"
  - "write user-facing labels for this navigation item"
relations:
  boundary:
    - skill: ontology-modeling
      reason: "ontology-modeling owns formal axioms and reasoning semantics; taxonomy-design owns human-governed classification"
    - skill: knowledge-modeling
      reason: "knowledge-modeling chooses the representation paradigm; taxonomy-design works inside the classification paradigm once chosen"
    - skill: semantic-relations
      reason: "semantic-relations types individual concept edges; taxonomy-design governs the category system and assignment rules"
  related:
    - information-architecture
    - skill-infrastructure
    - context-graph
  depends_on:
    - semantic-relations
  verify_with:
    - semantic-relations
    - context-graph
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
concept:
  definition: "Taxonomy design is the discipline of constructing a controlled classification system — a category tree (possibly augmented by facets) that organizes a set of items so they can be browsed, found, and reasoned about. Drawing from Ranganathan's faceted classification, Aristotelian genus-species hierarchy, and the SKOS data model, it treats classification as a *retrieval contract* between the system that organizes and the readers who navigate, not as a private mental map of the author."
  mental_model: |
    Five primitives structure taxonomy design:

    1. **Category and hierarchy** — a *category* is a named set of items that share some defining feature; a *hierarchy* is a graph of categories connected by *broader/narrower* relations (SKOS) or *IS-A* relations (Aristotelian). A child category must pass the *substitution test*: every instance of the child is an instance of the parent. Categories whose children fail this test produce hierarchies that mislead navigation.

    2. **Organizing principle** — the dimension along which sibling categories are formed: *by domain* (chemistry / biology / physics), *by activity* (read / write / review), *by artifact* (file / function / route), *by lifecycle phase* (planned / active / archived), *by audience* (developer / agent / end-user). Sibling categories must share one organizing principle; mixing principles at a single level produces an unbrowsable tree (Bowker & Star's "boundary infrastructure" problem).

    3. **Faceted vs hierarchical** (Ranganathan 1933) — a *hierarchical* taxonomy commits each item to one path in a tree; a *faceted* taxonomy assigns each item independent values along multiple orthogonal facets (color × material × size × era). Hierarchies are easier to browse for unfamiliar users; facets are more expressive for multi-criteria retrieval. Most real systems combine: one primary hierarchical tree plus facets for cross-cutting dimensions.

    4. **Controlled vocabulary** — a finite, governed set of terms used for classification. *Preferred labels* are canonical; *alternate labels* (synonyms, abbreviations, spelling variants) point to the preferred form. SKOS provides a minimal data model (broader/narrower/related, prefLabel/altLabel) sufficient to express most taxonomies. Without vocabulary control, synonyms drift into sibling categories and the system fragments meaning.

    5. **The retrieval contract** — every category and every facet should answer a question someone actually asks. The classification's purpose is to make items *findable* under the queries the readers will issue, not to satisfy the author's sense of structural elegance. Bowker & Star's *Sorting Things Out* documents repeatedly that taxonomies built without explicit retrieval-task analysis become abandoned bureaucratic infrastructure; the taxonomies that survive are the ones whose retrieval tasks were named first.

    The deep insight (Hjørland, Bowker & Star): classification is *political* in the sense that it makes some retrievals easy and others hard, encodes the classifier's assumptions about what is alike, and resists change once embedded in downstream systems. The discipline therefore includes governance — who is allowed to add or merge categories, on what evidence, with what migration plan for items affected.
  purpose: |
    A list of items grows past the point of direct enumeration faster than most teams expect. The first 50 skills can be remembered; the 500th skill cannot, and the team begins to author duplicates of skills that already exist because the existing skill is unfindable. Taxonomy design solves the *findability-at-scale* problem: organize the items so the reader can locate the relevant subset in a few decisions rather than scanning the full list.

    The discipline addresses three failure modes. The first is *junk-drawer categories* — `misc`, `other`, `utils` — which accumulate any item the author could not place quickly. The drawer grows until it dominates the tree, and findability collapses. The second is *organizing-principle drift* — siblings formed by different dimensions ("by domain," "by activity," "by audience") at the same level, producing a tree that cannot be navigated by any single mental model. The third is *vocabulary fragmentation* — synonyms like "analytics," "observability," "telemetry," "monitoring" each becoming separate categories, splitting the items that belong to the same conceptual home.

    The alternative — refusing to classify, or letting categories emerge ad-hoc — works for tiny collections and breaks for any collection large enough to need an index. The cost is borne by every future reader who must scan more than they should have.
  boundary: |
    **Taxonomy design is not ontology modeling.** A taxonomy is human-governed and informal; an ontology is formal, with axioms and reasoning semantics. Most teams need taxonomies, not ontologies. The right time to escalate from taxonomy to ontology is when automated reasoning or cross-system semantic interop is required — not when the team wants more rigor for its own sake.

    **Taxonomy design is not information architecture.** Information architecture organizes pages, navigation, labels, and wayfinding for a user-facing experience; taxonomy is a building block that information architecture often consumes. A taxonomy can exist without a user interface; an information architecture cannot. The two compose: build the taxonomy first; design the IA on top.

    **Taxonomy design is not knowledge modeling.** Knowledge modeling chooses the representation paradigm (graph, frames, rules, hybrid); taxonomy works inside the classification paradigm once it has been chosen. A team that asks "should this be a category tree or a knowledge graph?" is doing knowledge modeling, not taxonomy design.

    **Taxonomy design is not tagging.** Tagging is uncontrolled, user-generated, often synonym-tolerant; taxonomy is controlled, governed, and synonym-resolved. Folksonomies are emergent statistical patterns over tags; taxonomies are designed structures. A system can use both — tags for emergent signal, taxonomy for governed structure — but conflating them produces a controlled vocabulary that is not actually controlled.

    **Taxonomy design is not classification application.** Once a taxonomy exists, *applying* it to new items (assigning them to categories) is a separate activity. Application is often where the taxonomy's quality becomes visible: items that don't fit cleanly reveal organizing-principle drift; items that fit multiple categories reveal where facets were needed. Treat application as feedback into design.
  taxonomy: |
    - **Hierarchical classification** (specialization, Aristotelian tradition) — strict parent-child IS-A trees; each item commits to one path. Best for stable domains with clear genus-species relations.
    - **Faceted classification** (alternative, Ranganathan 1933) — orthogonal facets each providing independent classification axes (the PMEST formula: Personality / Matter / Energy / Space / Time). Best for multi-criteria retrieval where one tree cannot express all valid access paths.
    - **Polyhierarchy** (composition) — categories with multiple parents. Useful but governance-intensive: a child with two parents is a child that two reviewers must agree on every time it changes.
    - **SKOS** (W3C data model, 2009) — lightweight RDF vocabulary for taxonomies and thesauri; broader/narrower/related plus prefLabel/altLabel. The minimum-viable formalism for transmissible taxonomy.
    - **Library Classifications** (instantiations) — Dewey Decimal (1876), Library of Congress (1897), UDC (Universal Decimal Classification, 1905); large-scale long-lived examples of design choices and their consequences.
    - **Schema.org type hierarchy** (web-scale application) — pragmatic hierarchical classification for content markup; trades depth for adoption.
    - **Folksonomy** (alternative, Vander Wal 2005) — emergent tagging-based "taxonomy" from user labels. Lower governance cost, lower retrieval reliability, no synonym control.
    - **Bowker & Star's "boundary infrastructure"** (downstream concept) — when one taxonomy must serve multiple communities with different needs; the political and design challenges of cross-community classification.
    - **Genus-species** (Aristotelian primitive) — the philosophical root of hierarchical classification: define by a higher genus plus the differentia that distinguish the species within it.
  analogy: |
    Designing a taxonomy is like designing the table of contents of an encyclopedia. The encyclopedia could exist without a table of contents — every article is still there — but readers cannot find what they need without scanning the entire volume. The table of contents organizes the same content into a structure that supports the queries readers actually issue, and the choice of organizing principle (alphabetical vs topical vs chronological) determines which queries are cheap and which are expensive.

    A second analogy: physical store layout. A grocery store could place items at random; the items would all be present, but every shopping trip would take an hour. Real stores organize aisles by category (dairy, produce, bakery), and within each aisle by sub-category, with facets like organic, frozen, on-sale that cut across the primary tree. The layout is a *retrieval contract*: the shopper learns the structure once and amortizes the learning across thousands of trips. A taxonomy that doesn't pay back across thousands of retrievals is wasted design.
  misconception: |
    The most common misconception is that **a taxonomy should reflect the structure of the domain**. Taxonomies are retrieval contracts, not domain mirrors. The same domain can be classified many valid ways; the right one is the one that serves the actual queries. A taxonomy of "kinds of bug" organized by the underlying cause is wrong for support engineers who need to find bugs by user-visible symptom, and right for engineers diagnosing recurring patterns. The retrieval task chooses the organizing principle.

    The second misconception is that **deeper trees are more rigorous**. Deep trees increase the number of decisions required to reach an item and the probability that the reader navigates down the wrong branch. Shallow, broad trees with disciplined facets often outperform deep narrow trees. Library science calls the deep-tree failure mode *over-specification*; the right depth is the shallowest tree that distinguishes items by the dimensions readers actually query on.

    The third misconception is that **adding a category never hurts**. Every category added widens the choice space at its level and lengthens the path to every sibling. Categories with only one item are evidence that the level has been over-specified; categories whose member count drops to zero are dead structure that pulls attention without serving retrieval. Governance includes pruning, not just adding.

    The fourth misconception is that **the team can always reorganize later**. Downstream consumers — URL slugs, file paths, agent routers, links from external systems — encode taxonomy choices. Reorganizing once a taxonomy is published is more expensive than the team usually estimates. The discipline therefore includes treating top-level structure as long-lived and committing to backward-compatibility for at least the levels other systems reference.

    The fifth misconception is that **a junk-drawer category is harmless**. `misc`, `other`, `general`, `utilities` — these accumulate every item the author could not place quickly, and they grow until they dominate the tree. A junk drawer is structural evidence that the organizing principle is incomplete or that categorization is being skipped under deadline pressure. The cure is not "a tidier junk drawer"; it is naming the missing principle or refusing the item until a real placement exists.
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
