---
name: knowledge-modeling
description: "Use when choosing the representation paradigm for domain knowledge: knowledge graph, frame, production rule, semantic network, concept map, procedural ontology, or hybrid. Covers knowledge acquisition from tacit to explicit, graph design principles, validation types, lifecycle states, AI-agent context systems, skills as frames, routing as rules, memory as graph, and GraphRAG patterns such as entity-anchored retrieval, relationship-aware context, path reasoning, subgraph summaries, and hybrid vector+graph retrieval. Do NOT use for human-readable domain analysis (use `conceptual-modeling`), ER/database design (use `data-modeling`), pure taxonomy hierarchy (use `taxonomy-design`), formal ontology axioms (use `ontology-modeling`), exact semantic edge labels (use `semantic-relations`), or live skill-library tooling (use `skill-infrastructure`). Do NOT use for design the database tables and foreign keys for this schema. Do NOT use for I just need a clean IS-A category hierarchy with no rules or graph behavior."
license: MIT
compatibility: "Theory-level skill. Applies to any AI-coding workspace that maintains structured knowledge artefacts: skill libraries, reference docs, decision records, runbooks, agent memory systems, RAG/GraphRAG pipelines."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"skill-infrastructure\",\"data-modeling\",\"context-graph\",\"context-engineering\",\"conceptual-modeling\",\"ontology-modeling\",\"taxonomy-design\",\"semantic-relations\"],\"suppresses\":[\"ontology-modeling\",\"semantic-relations\",\"taxonomy-design\"],\"verify_with\":[\"conceptual-modeling\",\"ontology-modeling\",\"project-knowledge-extraction\"]}"
  subject: knowledge-organization
  scope: "Teaches choosing and maintaining the representation paradigm for domain knowledge: graphs, frames, semantic networks, production rules, concept maps, procedural ontologies, GraphRAG, or hybrids. Excludes stakeholder-readable conceptual modeling, database schema design, pure taxonomy hierarchy, formal ontology axioms, exact semantic edge labeling, and live skill-library tooling."
  public: "true"
  taxonomy_domain: foundations/knowledge
  stability: experimental
  keywords: "[\"knowledge representation\",\"knowledge graph\",\"frames and slots\",\"production rules\",\"semantic network\",\"concept map\",\"procedural ontology PKO\",\"hybrid knowledge representation\",\"tacit to explicit knowledge\",\"knowledge acquisition pipeline\"]"
  examples: "[\"should this domain knowledge be a graph, a set of rules, a frame structure, or a hybrid?\",\"our skill library keeps adding prose but the agent can't reason over relationships — which representation should change?\",\"the agent retrieves topically similar passages but misses structurally related facts — is GraphRAG the right shift?\",\"how do I capture decision traces and triggers as first-class entities so the agent can replay why it chose Y?\",\"we have facts, exceptions, and procedural decisions for an audit system — what representation keeps both retrieval and reasoning tractable?\",\"should this workflow stay a human concept map or be promoted to machine-usable production rules?\",\"we want to validate the knowledge base against real scenarios — what completeness / consistency / relevance / currency checks should run?\"]"
  anti_examples: "[\"design the database tables and foreign keys for this schema\",\"I just need a clean IS-A category hierarchy with no rules or graph behavior\",\"I need formal OWL axioms with class restrictions and reasoning semantics\",\"I want the exact edge labels (hypernymy / meronymy / synonymy) between concepts\",\"I need to maintain the skill library tooling and overlap detector\",\"abstract the domain into entities and relationships in human-readable terms before any database talk\"]"
  grounding: "{\"subject_matter\":\"Knowledge representation paradigm choice and GraphRAG-ready knowledge modeling\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"https://doi.org/10.1016/0004-3702(82)90012-1\",\"https://books.google.com/books/about/Knowledge_Representation_and_Reasoning.html?id=ln6Ux-EZm6YC\",\"https://courses.media.mit.edu/2004spring/mas966/Minsky%201974%20Framework%20for%20knowledge.pdf\",\"https://www.w3.org/TR/skos-reference/\",\"https://arxiv.org/abs/2404.16130\"],\"failure_modes\":[\"representation_chosen_by_familiarity_not_query_pattern\",\"graph_structure_too_sparse_for_graphrag\",\"formalism_overfit_to_theory_not_maintenance\",\"tacit_knowledge_transcribed_without_validation\",\"taxonomy_used_when_rules_or_frames_are_required\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Knowledge modeling is to a knowledge artefact what choosing between blueprint, schematic, exploded view, flowchart, and storyboard is to documenting a complex device — the device hasn't changed, but each format makes different questions easy or impossible to answer. A blueprint answers 'where does this part go?'; a schematic answers 'what is connected to what?'; a flowchart answers 'what happens when?'. Showing a customer a wiring schematic when they want to know how the product is assembled is choosing the wrong representation, not failing at the documentation."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/knowledge-organization/knowledge-modeling/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
# Knowledge Modeling

## Concept of the skill

Knowledge modeling is the discipline of choosing a *representation paradigm* — knowledge graph (nodes + edges + properties), frames (structured records with slots and inheritance), semantic network (labelled IS-A/HAS-A concepts), production rules (IF→THEN decision logic), concept map (propositions for human reading), procedural ontology / PKO (decisions + state changes + triggers as first-class entities), or hybrid — that fits how the knowledge will be queried, reasoned over, and maintained. Drawing from Newell's *knowledge level* and Brachman & Levesque's KR&R tradition, it treats representation as a *strategic choice with explicit expressiveness-tractability trade-offs* rather than as a default.

Replaces "use whichever knowledge format is familiar" with paradigm choice driven by the dominant query pattern. Solves the problem that AI-agent systems are *knowledge systems in disguise* — every SKILL.md is a knowledge artefact, every reference doc, every routing rule, every memory file, every decision record. The question is never *whether* the workspace has a knowledge model (it always does, even when implicit), but *whether the model fits the dominant query pattern*. Multi-hop reasoning needs a graph. Decision logic needs production rules. Object-like domain entities need frames. "Why did the agent decide X?" needs a procedural ontology. Pick the wrong paradigm and the agent's reasoning breaks *against the representation rather than against the domain*. The *expressiveness-vs-tractability* trade-off is non-negotiable: more expressive representations (OWL-DL, full first-order logic) admit fewer fast queries; more tractable representations (property graphs, key-value) admit fewer formal proofs. For most product teams the right answer is "Markdown with conventions" — which is what a SKILL.md is — not formal ontology; escalate formality only when automated reasoning or multi-system interop genuinely requires it.

Distinct from conceptual-modeling, which is the *human-readable domain analysis* layer (entities, attributes, relationships, cardinality) — this skill is the *representation-strategy layer above that* (choosing between graphs, frames, rules, hybrids). Distinct from context-graph, which is one specific *application* of knowledge modeling (the multi-graph context architecture for skills + docs + memory + scripts) — this skill is the general theory it draws on. Distinct from skill-infrastructure, which is the *live tooling* that maintains the skill library — this skill is the theory of *what kind of knowledge artefact* a SKILL.md is and why frames are the right paradigm for one. Distinct from database-migration / data-modeling (concerns *data* structure — tables, columns, FK constraints; this skill concerns *meaning* structure). Distinct from ontology-modeling (formal axioms with reasoning constraints — the layer *above* this skill) and from semantic-relations (typing individual concept edges). Knowledge modeling is to a knowledge artefact what choosing between blueprint, schematic, exploded view, flowchart, and storyboard is to documenting a complex device — the device hasn't changed, but each format makes different questions easy or impossible to answer. A blueprint answers 'where does this part go?'; a schematic answers 'what is connected to what?'; a flowchart answers 'what happens when?'. Showing a customer a wiring schematic when they want to know how the product is assembled is choosing the wrong representation, not failing at the documentation. The wrong mental model is that *any structured format is a knowledge model* — JSON files, Markdown docs, database tables are all "knowledge" in a loose sense. They are not, in the technical sense this skill cares about. *Knowledge is not data*: data records facts ("order #1247 has status `refunded`"); knowledge encodes the judgment and context needed to act on those facts ("refunds after 30 days require manager approval"; "the upstream fulfilment pipeline has a known 48-hour delay"). The agent with only the data hallucinates the policy; the agent with the knowledge applies it. Adjacent misconceptions: that *one paradigm fits all* (it does not — most real systems are hybrid: graph for entities and relationships, rules for decision logic, frames for stable domain objects, PKO when decision-trace replay matters); that *more formal is more capable* (it is not — OWL-DL admits fewer fast queries than property graphs; for most product teams Markdown with conventions is better than RDF triples); that *GraphRAG always beats plain RAG* (it does not — GraphRAG only wins when the underlying graph is well modelled; a sparse, mislabelled, or synonym-inconsistent graph retrieves *worse* than plain vector search because the structure becomes noise); and that *knowledge once captured is durable* (it is not — knowledge has a *lifecycle*: Create → Validate → Publish → Use → Monitor → Update → Retire; periodic currency checks are scheduled, not aspirational, because domain knowledge drifts faster than code).

## Coverage

The representation-strategy layer above conceptual modeling and below formal ontology. Names seven knowledge-representation paradigms — Knowledge Graph, Frames, Semantic Network, Production Rules, Concept Map, Process / Procedural Ontology (PKO), Hybrid — with structure, best-for, and weakness for each. Specifies the tacit-to-explicit knowledge acquisition pipeline that converts what experts know-but-cannot-articulate into computable form (elicitation → articulation → formalization → expert validation → encoding) and the five knowledge sources (domain experts, documentation, existing code, user behaviour, failure post-mortems). Lays out knowledge-graph design principles: reify when a relationship has properties, separate schema-level from instance-level, label edges precisely (`created_by` not `related_to`), enforce bidirectional naming, minimise redundancy. Covers the four validation types (completeness / consistency / relevance / currency) plus expert walkthrough. Walks the seven-phase knowledge lifecycle (Create → Validate → Publish → Use → Monitor → Update → Retire) with each phase's failure mode. Maps the theory to AI-agent systems: skills as frames, routing as production rules, memory as a knowledge graph with temporal properties. Devotes a full section to GraphRAG with five concrete patterns (entity-anchored retrieval, relationship-aware context, path-based reasoning, subgraph summarization, hybrid vector + graph) and the rules for when graph-grounded retrieval actually beats plain vector RAG. Closes with the representation-tradeoff matrix between expressiveness and tractability across reasoning, querying, maintenance, and human readability.

## Philosophy of the skill
Knowledge is not data. Data records facts; knowledge encodes the judgment and context needed to _act_ on those facts. A database stores that an order has status `refunded`. Knowledge captures that a refund after thirty days requires manager approval, that the customer's lifetime value should influence the response, and that the upstream fulfilment pipeline has a known forty-eight-hour delay. The agent that has only the data hallucinates the policy; the agent that has the knowledge applies it.

AI-agent systems are knowledge systems in disguise. Every SKILL.md is a knowledge artefact. Every reference doc is a knowledge artefact. Every routing rule, every memory file, every decision record is a knowledge artefact. The question is not _whether_ the workspace has a knowledge model — it always does, even when implicit — but _whether the model fits the dominant query pattern_. Multi-hop reasoning needs a graph. Decision logic needs production rules. Object-like domain entities need frames. "Why did the agent decide X?" needs a procedural ontology. Pick the wrong paradigm and the agent's reasoning breaks against the representation rather than against the domain.

The representation-vs-reasoning tradeoff is non-negotiable. More expressive representations (OWL-DL, full first-order logic) admit fewer fast queries; more tractable representations (property graphs, key-value) admit fewer formal proofs. For most product teams the right answer is "Markdown with conventions" — which is what a SKILL.md is — not formal ontology. Escalate formality only when automated reasoning or multi-system interop demands it.

## 1. Knowledge-Representation Paradigms

| Paradigm                                | Structure                                                                        | Best for                                                                                        | Weakness                                  |
| --------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| **Knowledge Graph**                     | Nodes (entities) + edges (relationships) + properties                            | Multi-hop reasoning, entity disambiguation, relationship discovery                              | Hard to express rules and constraints     |
| **Frames**                              | Structured records with slots, default values, inheritance                       | Object-like domain modeling; defaults and exceptions                                            | Limited relationship expressiveness       |
| **Semantic Network**                    | Labelled graph of concepts with IS-A / HAS-A links                               | Concept navigation; vocabulary organisation                                                     | No formal semantics; ambiguous edges      |
| **Production Rules**                    | IF condition THEN action                                                         | Decision logic; business rules; routing                                                         | Poor at representing structural knowledge |
| **Concept Map**                         | Propositions as labelled connections between concepts                            | Learning, communication, knowledge audit                                                        | Informal; not directly computable         |
| **Process / Procedural Ontology (PKO)** | Decisions, state changes, procedural steps, and triggers as first-class entities | Agent memory with "why / how" traces; audit trails; workflow capture; multi-agent orchestration | Heavy to author; easy to over-instrument  |
| **Hybrid**                              | Mix of graph + rules + frames                                                    | Real-world systems                                                                              | Complexity management                     |

### Choosing the paradigm

Pick the paradigm by the **primary query pattern** the system needs to answer:

- "What is related to X?" → graph
- "What should I do when X?" → production rules
- "What are the properties of X?" → frames
- "What concepts connect these ideas, for a human reader?" → concept map
- "Why did the agent decide X, and through what intermediate states?" → procedural ontology (PKO)

Most real systems converge on a _hybrid_: a knowledge graph for entities and relationships, plus production rules for decision logic, plus frames for stable domain objects, plus a PKO layer when decision-trace replay matters.

## 2. Knowledge Acquisition

### Sources and methods

| Source         | Method                                   | Output                                |
| -------------- | ---------------------------------------- | ------------------------------------- |
| Domain experts | Structured interviews, protocol analysis | Explicit rules, decision criteria     |
| Documentation  | Document analysis, extraction            | Facts, procedures, constraints        |
| Existing code  | Code archaeology, pattern mining         | Implicit rules, edge cases            |
| User behaviour | Task analysis, usage logs                | Tacit knowledge, workarounds          |
| Failures       | Post-mortem analysis, bug reports        | _Negative_ knowledge — what NOT to do |

### Tacit-to-explicit pipeline

```
Tacit knowledge (in expert's head)
   │
   ▼
Elicitation       — interview, observation
   │
   ▼
Articulation      — natural-language rules
   │
   ▼
Formalization    — structured representation
   │
   ▼
Validation       — expert review against real scenarios
   │
   ▼
Encoding         — computable form
```

Rules:

- The most valuable knowledge is _tacit_ — things experts do automatically but cannot articulate without prompting. Plan elicitation, not just transcription.
- Negative knowledge ("never do X because Y happened") is as valuable as positive knowledge. Capture failures.
- Knowledge mined from code is structurally incomplete: the code captures the _what_, not the _why_. Pair code archaeology with expert review.

## 3. Knowledge-Graph Design Principles

### Node and edge conventions

| Element               | Convention                       | Example                            |
| --------------------- | -------------------------------- | ---------------------------------- |
| **Entity node**       | Noun, PascalCase                 | `Order`, `Product`, `Customer`     |
| **Concept node**      | Noun phrase representing an idea | `RefundPolicy`, `PricingStrategy`  |
| **Relationship edge** | Verb phrase, directed, labelled  | `Order -[placed_by]-> Customer`    |
| **Property**          | Key-value on node or edge        | `Order.total_amount = 4599`        |
| **Type edge**         | IS-A classification              | `DigitalProduct -[is_a]-> Product` |
| **Part edge**         | Part-whole                       | `LineItem -[part_of]-> Order`      |

### Five graph principles

| Principle                           | Rule                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Reify when needed**               | If a relationship carries properties (date, amount, status), promote it to a node                                     |
| **Separate structure from content** | Schema nodes (types, relations) vs instance nodes (specific entities)                                                 |
| **Label precisely**                 | `created_by` not `related_to`; specificity enables reasoning                                                          |
| **Bidirectional naming**            | Every edge should read naturally in both directions: `Order -[placed_by]-> Customer` and `Customer -[placed]-> Order` |
| **Minimal redundancy**              | Derive rather than duplicate; if a value can be computed from the graph, don't store it twice                         |

## 4. Knowledge Validation

| Validation type        | What it catches                                                               |
| ---------------------- | ----------------------------------------------------------------------------- |
| **Completeness check** | Missing entities, relationships, or rules for known scenarios                 |
| **Consistency check**  | Contradictory rules or overlapping categories                                 |
| **Relevance check**    | Knowledge that exists in the model but serves no real query or decision       |
| **Currency check**     | Knowledge that was true when captured but has since changed                   |
| **Expert walkthrough** | Expert reviews the model against real scenarios; catches implicit assumptions |

Rules:

- Validate against _real scenarios_, not abstract correctness. The walkthrough catches what the schema-checker can't.
- Schedule periodic currency checks — domain knowledge drifts faster than code.
- Every piece of knowledge in the base should answer a question someone actually asks. Knowledge nobody queries is dead weight that pulls retrieval signal-to-noise down.

## 5. Knowledge Lifecycle

```
Create  →  Validate  →  Publish  →  Use  →  Monitor  →  Update  →  (Retire)
```

| Phase        | Key activity                                    | Failure mode                                                     |
| ------------ | ----------------------------------------------- | ---------------------------------------------------------------- |
| **Create**   | Acquire from source; formalise                  | Incomplete capture; missing tacit knowledge                      |
| **Validate** | Expert review; scenario testing                 | Rubber-stamp approval; untested edge cases                       |
| **Publish**  | Make available to consumers (agents, APIs, UIs) | Poor discoverability; stale indexes                              |
| **Use**      | Runtime queries; decision support               | Over-reliance on outdated knowledge                              |
| **Monitor**  | Track usage, accuracy, relevance                | No feedback loop; zombie knowledge                               |
| **Update**   | Revise based on new information or feedback     | Partial updates; inconsistencies between updated and stale parts |
| **Retire**   | Remove or archive obsolete knowledge            | Hoarding; false confidence in expired material                   |

## 6. Application to AI-Agent Systems

| Agent component     | Knowledge-modeling concern                                               |
| ------------------- | ------------------------------------------------------------------------ |
| Skill library       | Each skill is a knowledge artefact; the skill index is a knowledge graph |
| Context engineering | Selecting which knowledge to load into a finite context window           |
| Routing / dispatch  | Production rules mapping inputs to skill / agent selection               |
| Memory system       | Long-term persistence with freshness management                          |
| Evaluation          | Validating that knowledge actually improves agent output                 |

The mappings:

- **Skills are frames.** Structured slots (triggers, keywords, body, references) with defaults and inheritance.
- **The routing system is a production-rule engine.** IF keyword matches THEN load skill.
- **The memory system is a knowledge graph with temporal properties.** Freshness, drift, decay all live on the edges.
- **Context engineering is knowledge selection under token-budget constraints.** A subset-selection problem with quality and cost both as objectives.

### 6.1 GraphRAG — grounding retrieval in a knowledge graph

Plain Retrieval-Augmented Generation retrieves unordered text chunks by vector similarity. This fails on multi-entity questions, on disambiguation, and on questions whose answer depends on _how_ entities relate — vector similarity finds "topically close" passages, not "structurally connected" facts. GraphRAG grounds retrieval in a knowledge graph, so the model receives typed entities and labelled edges instead of a bag of passages.

| Pattern                        | What it does                                                                  | When it beats plain RAG                                         |
| ------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Entity-anchored retrieval**  | Resolve prompt mentions to graph nodes, then expand N hops                    | Multi-entity questions; disambiguation across namespaces        |
| **Relationship-aware context** | Include labelled edges alongside retrieved nodes                              | Questions about _how_ two things relate, not just what they are |
| **Path-based reasoning**       | Return the concrete path between two nodes as context                         | "Why is X connected to Y?" questions                            |
| **Subgraph summarization**     | Summarise a relevant subgraph into natural language before passing to the LLM | Reduces hallucination on multi-hop and aggregation questions    |
| **Hybrid (vector + graph)**    | Vector retrieval seeds entry points; graph expansion adds structure           | Corpora where neither pure approach wins alone                  |

Rules:

- GraphRAG only wins when the underlying graph is _well modelled_. A sparse, mislabelled, or synonym-inconsistent graph retrieves _worse_ than plain vector search — the structure becomes noise.
- Reserve GraphRAG for questions whose answer depends on relationships between entities. Single-entity attribute questions ("what is X's status?") do not benefit.
- Return the source nodes and edges alongside the LLM's answer so the user can verify the retrieval path. This is GraphRAG's explainability advantage over plain RAG; surface it.
- At minimum, enforce SKOS-grade vocabulary discipline (consistent labels, broader / narrower) before building a GraphRAG pipeline.
- GraphRAG does _not_ replace a good knowledge graph — it is a retrieval pattern _on top of_ one. Invest in the graph first; the retrieval pattern is downstream.

## 7. Representation Trade-offs

| Dimension             | More expressive                 | More tractable                 |
| --------------------- | ------------------------------- | ------------------------------ |
| **Reasoning**         | OWL-DL, full first-order logic  | Property graphs, key-value     |
| **Querying**          | SPARQL, Cypher                  | Simple lookups, keyword search |
| **Maintenance**       | Formal schemas with constraints | Plain text with conventions    |
| **Human readability** | Concept maps, Markdown          | JSON-LD, RDF triples           |

Rules:

- For most product teams the right answer is "Markdown with conventions" (what a SKILL.md is) rather than formal ontology.
- Escalate formality only when automated reasoning or multi-system interop is genuinely required.
- The _best_ representation is the one that domain experts can validate and developers can query. If either side struggles, the choice is wrong even when the formalism is technically correct.

## Verification

- [ ] Each knowledge artefact has an explicit source and a validation status
- [ ] The chosen representation paradigm matches the _primary query pattern_ — not the team's familiarity with one paradigm
- [ ] Tacit knowledge was _elicited_ (interview / observation) — not just documented knowledge transcribed
- [ ] A lifecycle / freshness mechanism exists for ongoing knowledge maintenance; periodic currency checks are scheduled, not aspirational
- [ ] Knowledge consumers (agents, UIs, APIs) can discover and access the relevant knowledge through structured indexes — discovery is not "remember the file path"
- [ ] Validation is run against _real_ scenarios, not abstract completeness — including failure / negative scenarios
- [ ] If GraphRAG is in use, the underlying graph passes vocabulary discipline (consistent labels, broader / narrower) and the retrieval path is surfaced alongside the LLM's answer

## Do NOT Use When

| Use instead                         | When                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `conceptual-modeling`               | Performing the _human-readable_ domain analysis (entities, attributes, relationships, cardinality) — that's the layer below this skill                  |
| `data-modeling`                     | Designing database tables, foreign keys, normalization — data structure, not meaning structure                                                          |
| `taxonomy-design`                   | Building a pure IS-A classification hierarchy with no rules or graph behaviour                                                                          |
| `ontology-modeling`                 | Defining formal axioms with OWL / RDFS, class restrictions, automated-reasoning constraints — the layer above this skill                                |
| `semantic-relations`                | Picking exact edge labels — hypernymy, meronymy, synonymy, polysemy, troponymy                                                                          |
| `skill-infrastructure`              | Maintaining the live skill library (census, overlap detection, drift checks) — knowledge-modeling is the theory, skill-infrastructure is the operations |
| `context-graph`                     | Designing the multi-graph topology of a workspace — that is one application of this skill, not the theory itself                                        |

## Key Sources

- Newell, A. (1982). "The Knowledge Level." *Artificial Intelligence*, 18(1), 87-127. The foundational paper distinguishing the *knowledge level* (rationality, goals, body of knowledge) from the *symbol level* (representation implementation). Establishes that representation choices are about which abstraction layer is appropriate, not which formalism is most powerful.
- Brachman, R. J., & Levesque, H. J. (2004). *Knowledge Representation and Reasoning*. Morgan Kaufmann. The canonical textbook on KR&R: the expressiveness-tractability trade-off, description logics, frames, production systems, default reasoning. The reference for paradigm choice.
- Sowa, J. F. (2000). *Knowledge Representation: Logical, Philosophical, and Computational Foundations*. Brooks/Cole. Encyclopedic synthesis of KR traditions from Aristotle through conceptual graphs. The single best reference for how paradigms relate to each other.
- Minsky, M. (1974). "A Framework for Representing Knowledge." MIT-AI Memo 306. The foundational paper introducing frames: structured records with slots, defaults, and inheritance. Frames remain the right paradigm for object-like domain entities with stable structure.
- W3C (2009). *SKOS Simple Knowledge Organization System Reference*. The normative low-cost vocabulary layer for concepts, labels, broader/narrower links, related links, and concept schemes.
- Edge et al. (2024). "From Local to Global: A Graph RAG Approach to Query-Focused Summarization." arXiv:2404.16130. Useful grounding for when graph-structured retrieval helps sensemaking over large corpora.
- Gruber, T. R. (1993). "A Translation Approach to Portable Ontology Specifications." *Knowledge Acquisition*, 5(2), 199-220. The definition of ontology as "a specification of a conceptualization" and the formal grounding for interoperable knowledge artefacts.
- Quillian, M. R. (1968). "Semantic Memory." In M. Minsky (Ed.), *Semantic Information Processing*. MIT Press. The original semantic-network paper; the cognitive-science origin of labelled concept graphs.
- Novak, J. D., & Cañas, A. J. (2008). *The Theory Underlying Concept Maps and How to Construct Them*. IHMC. The methodology for concept maps as a knowledge-elicitation and human-communication tool.
- Edge, D., Trinh, H., Cheng, N., et al. (2024). "From Local to Global: A Graph RAG Approach to Query-Focused Summarization." Microsoft Research. The reference statement of GraphRAG as a retrieval pattern over modelled knowledge graphs.
- W3C. [SKOS Reference](https://www.w3.org/TR/skos-reference/). The Simple Knowledge Organization System specification; the minimal vocabulary discipline (broader/narrower/related, prefLabel/altLabel) that knowledge-graph quality depends on.
- Studer, R., Benjamins, V. R., & Fensel, D. (1998). "Knowledge Engineering: Principles and Methods." *Data & Knowledge Engineering*, 25(1-2), 161-197. Survey of the acquisition pipeline (elicitation → modeling → validation) and the methodological tradition behind it.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `knowledge-organization`
- Public: `true`
- Domain: `foundations/knowledge`
- Scope: Teaches choosing and maintaining the representation paradigm for domain knowledge: graphs, frames, semantic networks, production rules, concept maps, procedural ontologies, GraphRAG, or hybrids. Excludes stakeholder-readable conceptual modeling, database schema design, pure taxonomy hierarchy, formal ontology axioms, exact semantic edge labeling, and live skill-library tooling.

**When to use**
- should this domain knowledge be a graph, a set of rules, a frame structure, or a hybrid?
- our skill library keeps adding prose but the agent can't reason over relationships — which representation should change?
- the agent retrieves topically similar passages but misses structurally related facts — is GraphRAG the right shift?
- how do I capture decision traces and triggers as first-class entities so the agent can replay why it chose Y?
- we have facts, exceptions, and procedural decisions for an audit system — what representation keeps both retrieval and reasoning tractable?
- should this workflow stay a human concept map or be promoted to machine-usable production rules?
- we want to validate the knowledge base against real scenarios — what completeness / consistency / relevance / currency checks should run?

**Not for**
- design the database tables and foreign keys for this schema
- I just need a clean IS-A category hierarchy with no rules or graph behavior
- I need formal OWL axioms with class restrictions and reasoning semantics
- I want the exact edge labels (hypernymy / meronymy / synonymy) between concepts
- I need to maintain the skill library tooling and overlap detector
- abstract the domain into entities and relationships in human-readable terms before any database talk

**Related skills**
- Verify with: `conceptual-modeling`, `ontology-modeling`, `project-knowledge-extraction`
- Related: `skill-infrastructure`, `data-modeling`, `context-graph`, `context-engineering`, `conceptual-modeling`, `ontology-modeling`, `taxonomy-design`, `semantic-relations`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Knowledge modeling is to a knowledge artefact what choosing between blueprint, schematic, exploded view, flowchart, and storyboard is to documenting a complex device — the device hasn't changed, but each format makes different questions easy or impossible to answer. A blueprint answers 'where does this part go?'; a schematic answers 'what is connected to what?'; a flowchart answers 'what happens when?'. Showing a customer a wiring schematic when they want to know how the product is assembled is choosing the wrong representation, not failing at the documentation.
- Common misconception: |

**Grounding**
- Mode: `hybrid`
- Truth sources: `https://doi.org/10.1016/0004-3702(82)90012-1`, `https://books.google.com/books/about/Knowledge_Representation_and_Reasoning.html?id=ln6Ux-EZm6YC`, `https://courses.media.mit.edu/2004spring/mas966/Minsky%201974%20Framework%20for%20knowledge.pdf`, `https://www.w3.org/TR/skos-reference/`, `https://arxiv.org/abs/2404.16130`

**Keywords**
- `knowledge representation`, `knowledge graph`, `frames and slots`, `production rules`, `semantic network`, `concept map`, `procedural ontology PKO`, `hybrid knowledge representation`, `tacit to explicit knowledge`, `knowledge acquisition pipeline`

<!-- skill-graph-context:end -->
