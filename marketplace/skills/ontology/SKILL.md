---
name: ontology
description: "Use when designing domain models that need formal type hierarchies, entity classification, knowledge-graph structure, category/type design, or ontology-driven APIs and databases. Covers class hierarchies, property axioms, instances, upper ontologies, OWL/RDF, mereology, taxonomy-vs-ontology boundaries, and ontological commitment. Do NOT use for database ER diagrams (use `entity-relationship-modeling`), linguistic meaning analysis (use `semiotics`), or bounded contexts (use `bounded-context-mapping`)."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: quality
  domain: quality/doctrine
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-03-29"
  drift_check: "{\"last_verified\":\"2026-03-29\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"ontology\",\"class hierarchy\",\"type hierarchy\",\"upper ontology\",\"OWL\",\"RDF\",\"knowledge representation\",\"formal ontology\",\"ontological commitment\",\"mereology\",\"classification\"]"
  triggers: "[\"ontology-skill\",\"knowledge-skill\"]"
  relations: "{\"related\":[\"conceptual-modeling\",\"knowledge-modeling\",\"semantic-relations\",\"semantics\"],\"boundary\":[\"entity-relationship-modeling\",\"semiotics\"],\"verify_with\":[\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/ontology/SKILL.md
---
## Domain Context

**What is this skill?** This skill provides formal ontology patterns for structuring domain knowledge: class hierarchies, property axioms, instance classification, upper ontologies (BFO, DOLCE, Schema.org), OWL/RDF modeling patterns, and ontology-driven API and database design. Covers when to formalize domain knowledge into ontological structures, mereology (part-whole), taxonomy vs. ontology distinction, ontological commitment in schema design, and anti-patterns like over-classification and premature formalization. Use when designing domain models that need formal type hierarchies, reasoning about entity classification, building knowledge graphs, or deciding how to structure categories and types in a product. Do NOT use for database ER diagrams (use `entity-relationship-modeling`), linguistic meaning analysis (use `semiotics`), or DDD bounded contexts (use `domain-modeling`).

## Coverage

Formal ontology patterns for structuring domain knowledge: class hierarchies and inheritance, property axioms and constraints, instance classification and individuation, upper ontology frameworks (BFO, DOLCE, Schema.org), OWL/RDF modeling patterns, ontology-driven API and database design, mereology (part-whole relations), taxonomy vs. ontology distinction, ontological commitment in schema design, and anti-patterns like over-classification, premature formalization, and category confusion. Does not cover database ER diagrams (`entity-relationship-modeling`), linguistic sign theory (`semiotics`), or bounded context boundaries (`domain-modeling`).

## Philosophy

Software systems encode ontological commitments whether developers realize it or not. Every database schema, API contract, and type hierarchy is a claim about what exists and how things relate. Without explicit ontological thinking, agents produce inconsistent category systems -- an "order" that is simultaneously a transaction, a fulfillment request, and an accounting entry, with no formal distinction between these roles. This skill forces the question: what kinds of things exist in this domain, what properties define them, and what relationships constrain them? The answer shapes every downstream decision from database schema to API surface to UI navigation.

## 1. Core Ontological Concepts

| Concept | Definition | Software Analog |
|---------|-----------|-----------------|
| **Class (Type)** | A category of entities sharing essential properties | TypeScript interface, DB table, API resource type |
| **Instance (Individual)** | A particular member of a class | A row in a table, a JSON object, a specific entity |
| **Property (Attribute)** | A characteristic that describes or constrains an entity | Column, field, JSON key |
| **Relation** | A connection between two or more entities | Foreign key, join table, nested resource |
| **Axiom** | A formal constraint on what can exist or how things relate | Validation rule, CHECK constraint, type guard |
| **Ontological commitment** | What a system claims exists by virtue of its schema | The entities your schema forces into existence |

## 2. The Ontology Ladder — When to Formalize

| Level | Formality | When to use | Example |
|-------|-----------|-------------|---------|
| **Informal** | Natural language categories, ad-hoc types | Early exploration, rapid prototyping | "Orders can be pending, shipped, or delivered" |
| **Semi-formal** | TypeScript discriminated unions, Zod schemas | Most application code | `type OrderStatus = 'pending' \| 'shipped' \| 'delivered'` |
| **Formal** | OWL classes, property axioms, reasoning | Knowledge graphs, multi-system interop, regulatory compliance | `Order SubClassOf hasStatus exactly 1 OrderStatus` |
| **Foundational** | Upper ontology alignment (BFO, DOLCE) | Enterprise-wide integration, academic/medical/legal domains | Aligning to BFO's "process" vs "continuant" distinction |

Rules:
- Default to semi-formal (TypeScript types + validation schemas) for most application code.
- Escalate to formal ontology only when multiple systems must agree on shared categories, or when automated reasoning over categories adds measurable value.
- Never adopt foundational ontology for a single-team application; the overhead destroys velocity.

## 3. Upper Ontology Frameworks

| Framework | Focus | Best for | Complexity |
|-----------|-------|----------|-----------|
| **BFO** (Basic Formal Ontology) | Process vs. continuant, temporal/spatial | Biomedical, scientific, regulatory | High |
| **DOLCE** | Cognitive categories, social reality | Cultural, social, organizational | High |
| **Schema.org** | Web-visible entities and actions | E-commerce, content, SEO | Low-Medium |
| **SUMO** | General-purpose, comprehensive | Academic integration | Very High |
| **None (domain-specific)** | Custom hierarchy for one product | SaaS applications, most startups | Varies |

Rules:
- For e-commerce/SaaS products, Schema.org provides the most practical upper ontology alignment.
- Use Schema.org's `Order`, `Product`, `Organization`, `Person` as alignment anchors, not as strict superclasses.
- Custom domain ontologies are fine as long as they can map to Schema.org for external interop.

## 4. Key Ontological Distinctions for Software

### 4.1 Identity and Individuation

| Question | Ontological impact | Code consequence |
|----------|-------------------|-----------------|
| What makes two entities the "same" entity? | Identity criteria | Primary key strategy, dedup logic, entity resolution |
| Can an entity change type over time? | Rigidity | Enum vs. state machine, migration strategy |
| Does removing a part destroy the whole? | Essential vs. accidental parts | CASCADE vs SET NULL, archival policy |

### 4.2 Mereology (Part-Whole Relations)

| Relation | Example | Constraint |
|----------|---------|-----------|
| **Component-of** | LineItem component-of Order | Part cannot exist without whole |
| **Member-of** | Product member-of Collection | Part can exist independently |
| **Portion-of** | Payment portion-of TotalDue | Quantitative division |
| **Stuff-of** | Thread stuff-of Conversation | Material constitution |

Rules:
- Component-of implies lifecycle dependency: destroying the whole destroys the parts.
- Member-of implies independent existence: removing a member from a collection does not destroy it.
- For database implementation of these constraints (CASCADE vs SET NULL), see `entity-relationship-modeling`.
- Make the distinction explicit in API design: component resources are nested (`/orders/{id}/line-items`), member resources have independent endpoints.

### 4.3 Taxonomy vs. Ontology

| Taxonomy | Ontology |
|----------|---------|
| Classifies by IS-A hierarchy | Classifies + constrains properties and relations |
| Tree structure | Graph structure (multiple inheritance, cross-cutting) |
| Answers "what kind of thing is this?" | Also answers "what can this thing do?" and "what must be true?" |
| Navigation and organization | Reasoning and validation |

Rules:
- If you only need categorization for navigation/filtering, build a taxonomy (simpler, faster).
- If you need to enforce constraints across categories or reason about entity capabilities, build an ontology.

## 5. Ontological Anti-Patterns

| Anti-Pattern | What happens | Fix |
|-------------|-------------|-----|
| **Over-classification** | Every variation becomes a new type/class | Use properties and enums instead of new types for variations |
| **Premature formalization** | OWL/RDF for a single-app domain | Use TypeScript types until multi-system integration demands formality |
| **Category confusion** | Same term means different things in different contexts | Introduce explicit bounded contexts (route to `domain-modeling`) |
| **God class** | One entity absorbs all roles (Order = transaction + fulfillment + invoice) | Decompose by role; each role gets its own type |
| **Missing identity criteria** | No clear rule for when two records are "the same thing" | Define identity explicitly before building dedup or sync |
| **Attribute masquerading as type** | `type: 'premium'` field when you need different class behavior | Promote to discriminated union or subclass |
| **Relational overload** | One "link" table handles unrelated relationship types | Separate relation types with distinct semantics |

## 6. Ontology-Driven Design Decisions

| Design question | Ontological input | Downstream impact |
|----------------|-------------------|-------------------|
| How many tables/resources? | Count the genuine entity types | Too few = god tables; too many = join hell |
| What are the API resources? | Identify independently addressable entities | Resources = entities with independent identity |
| What validates on write? | Axioms and constraints on properties | Zod schemas, CHECK constraints, type guards |
| What navigates the UI? | Class hierarchy and containment relations | Sidebar structure, breadcrumbs, URL hierarchy |
| How do systems integrate? | Shared ontological commitments | API contracts, event schemas, canonical IDs |

## 7. Practical Workflow

> **Note:** This workflow covers the ontological analysis phase. For the full domain modeling workflow (entities → relationships → cardinality → implementation), see `conceptual-modeling`. For database implementation, see `entity-relationship-modeling`. For relationship type analysis (IS-A vs PART-OF), see `semantic-relations`.

1. **Enumerate entities** — List every thing the system talks about (nouns in user stories).
2. **Define identity** — For each entity, state what makes two instances "the same."
3. **Classify** — Group into types; identify IS-A and part-whole relationships.
4. **Constrain** — State what must be true (axioms): required properties, cardinality, valid states.
5. **Validate** — Check for anti-patterns: god classes, missing identity, over-classification.
6. **Implement** — Map to TypeScript types, database schema, API resources.

## Verification

> **Scope note:** This checklist covers the ontology (axioms) layer — formal type definitions, property constraints, and logical consistency. For relationship-level verification (cardinality, named associations), use [`conceptual-modeling`]. For implementation-level verification (PKs, FKs, normalization), use [`entity-relationship-modeling`].

After applying this skill, verify:
- [ ] Classes are formally defined with necessary and sufficient conditions (not just labels)
- [ ] Properties have specified domains (which class they apply to) and ranges (which values are valid)
- [ ] Logical axioms are consistent — no unsatisfiable classes or contradictory constraints
- [ ] Ontology modules are coherent in isolation (no undefined cross-imports)
- [ ] No god classes absorb multiple unrelated roles
- [ ] Category distinctions map to real behavioral differences, not just labels
- [ ] The formality level matches the actual multi-system integration needs

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Designing ER diagrams or database schemas from requirements | `entity-relationship-modeling` | ER modeling is the implementation layer; ontology is the conceptual layer |
| Analyzing how signs and symbols create meaning | `semiotics` | Semiotics covers meaning-making in communication; ontology covers what exists |
| Defining bounded contexts and aggregates | `domain-modeling` | DDD patterns are the tactical implementation; ontology informs the strategic model |
| Classifying items into a navigation hierarchy | `taxonomy` | Taxonomy is IS-A classification; ontology adds constraints and reasoning |
| Structuring knowledge for agent consumption (graphs, frames, rules) | `knowledge-modeling` | Knowledge modeling is pragmatic knowledge organization; ontology is formal type theory |
| Typing relationships between concepts (IS-A, PART-OF, synonymy) | `semantic-relations` | Semantic relations analyze meaning connections; ontology constrains what can exist |

---

*Version 1.0.0 — 2026-03-29. Initial creation.*
