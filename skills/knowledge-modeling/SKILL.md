---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: knowledge-modeling
description: "Use when deciding *which representation paradigm* fits a piece of domain knowledge — knowledge graph vs frames vs production rules vs semantic network vs concept map vs procedural ontology vs hybrid — when designing AI-agent context systems, building a knowledge base, structuring a skill or reference library, or planning a GraphRAG retrieval pipeline. Covers the seven paradigms with structure / best-for / weakness tables, the tacit-to-explicit knowledge acquisition pipeline (elicitation → articulation → formalization → validation → encoding), knowledge graph design principles (reify when needed, separate schema from instance, label precisely, bidirectional naming, minimal redundancy), the four knowledge-validation types (completeness / consistency / relevance / currency) plus expert walkthrough, the seven-phase knowledge lifecycle (Create / Validate / Publish / Use / Monitor / Update / Retire), the application to AI-agent systems (skills as frames, routing as rules, memory as graph), and a full GraphRAG section covering the five patterns (entity-anchored retrieval, relationship-aware context, path-based reasoning, subgraph summarization, hybrid vector+graph) with rules for when graph-grounded retrieval beats plain RAG. Do NOT use for the *human-readable* domain analysis layer (use `conceptual-modeling`), for the database / ER design layer (a logical-modeling skill), for pure classification hierarchies (a taxonomy skill), for formal ontology axioms (an ontology skill), or for the live skill-library tooling that consumes modeled knowledge (use `skill-infrastructure`)."
version: 1.0.0
type: capability
category: foundations
domain: foundations/knowledge
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
  notes: "Theory-level skill. Applies to any AI-coding workspace that maintains structured knowledge artefacts: skill libraries, reference docs, decision records, runbooks, agent memory systems, RAG/GraphRAG pipelines."
allowed-tools: Read Grep
keywords:
  - knowledge representation
  - knowledge graph
  - frames and slots
  - production rules
  - semantic network
  - concept map
  - procedural ontology PKO
  - hybrid knowledge representation
  - tacit to explicit knowledge
  - knowledge acquisition pipeline
  - graphRAG retrieval
  - entity anchored retrieval
  - relationship aware context
  - path based reasoning
  - subgraph summarization
  - knowledge lifecycle
  - representation tradeoff expressiveness tractability
  - which representation paradigm fits
examples:
  - "should this domain knowledge be a graph, a set of rules, a frame structure, or a hybrid?"
  - "our skill library keeps adding prose but the agent can't reason over relationships — which representation should change?"
  - "the agent retrieves topically similar passages but misses structurally related facts — is GraphRAG the right shift?"
  - "how do I capture decision traces and triggers as first-class entities so the agent can replay why it chose Y?"
  - "we have facts, exceptions, and procedural decisions for an audit system — what representation keeps both retrieval and reasoning tractable?"
  - "should this workflow stay a human concept map or be promoted to machine-usable production rules?"
  - "we want to validate the knowledge base against real scenarios — what completeness / consistency / relevance / currency checks should run?"
anti_examples:
  - "design the database tables and foreign keys for this schema" # → database-migration / ER modeling
  - "I just need a clean IS-A category hierarchy with no rules or graph behavior" # → a taxonomy skill
  - "I need formal OWL axioms with class restrictions and reasoning semantics" # → an ontology skill
  - "I want the exact edge labels (hypernymy / meronymy / synonymy) between concepts" # → a semantic-relations skill
  - "I need to maintain the skill library tooling and overlap detector" # → skill-infrastructure
  - "abstract the domain into entities and relationships in human-readable terms before any database talk" # → conceptual-modeling
relations:
  boundary:
    - skill: conceptual-modeling
      reason: "conceptual-modeling is the human-readable domain analysis layer (entities, attributes, relationships, cardinality); knowledge-modeling is the *representation-strategy* layer above that — choosing between graphs, frames, rules, hybrids"
    - skill: context-graph
      reason: "context-graph is one specific *application* of knowledge modeling (the multi-graph context architecture for skills + docs + memory + scripts); knowledge-modeling is the general theory it draws on"
    - skill: skill-infrastructure
      reason: "skill-infrastructure is the live tooling that maintains the skill library; knowledge-modeling is the theory of *what kind of knowledge artefact* a SKILL.md is and why frames are the right paradigm for one"
    - skill: database-migration
      reason: "database-migration concerns *data* structure (tables, columns, FK constraints); knowledge-modeling concerns *meaning* structure (entities, relations, rules)"
  related:
    - conceptual-modeling
    - context-graph
    - context-engineering
    - skill-infrastructure
  verify_with:
    - conceptual-modeling
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
---

# Knowledge Modeling

## Coverage

The representation-strategy layer above conceptual modeling and below formal ontology. Names seven knowledge-representation paradigms — Knowledge Graph, Frames, Semantic Network, Production Rules, Concept Map, Process / Procedural Ontology (PKO), Hybrid — with structure, best-for, and weakness for each. Specifies the tacit-to-explicit knowledge acquisition pipeline that converts what experts know-but-cannot-articulate into computable form (elicitation → articulation → formalization → expert validation → encoding) and the five knowledge sources (domain experts, documentation, existing code, user behaviour, failure post-mortems). Lays out knowledge-graph design principles: reify when a relationship has properties, separate schema-level from instance-level, label edges precisely (`created_by` not `related_to`), enforce bidirectional naming, minimise redundancy. Covers the four validation types (completeness / consistency / relevance / currency) plus expert walkthrough. Walks the seven-phase knowledge lifecycle (Create → Validate → Publish → Use → Monitor → Update → Retire) with each phase's failure mode. Maps the theory to AI-agent systems: skills as frames, routing as production rules, memory as a knowledge graph with temporal properties. Devotes a full section to GraphRAG with five concrete patterns (entity-anchored retrieval, relationship-aware context, path-based reasoning, subgraph summarization, hybrid vector + graph) and the rules for when graph-grounded retrieval actually beats plain vector RAG. Closes with the representation-tradeoff matrix between expressiveness and tractability across reasoning, querying, maintenance, and human readability.

## Philosophy

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
| A logical / physical modeling skill | Designing database tables, foreign keys, normalization — data structure, not meaning structure                                                          |
| A taxonomy skill                    | Building a pure IS-A classification hierarchy with no rules or graph behaviour                                                                          |
| An ontology skill                   | Defining formal axioms with OWL / RDFS, class restrictions, automated-reasoning constraints — the layer above this skill                                |
| A semantic-relations skill          | Picking exact edge labels — hypernymy, meronymy, synonymy, polysemy, troponymy                                                                          |
| `skill-infrastructure`              | Maintaining the live skill library (census, overlap detection, drift checks) — knowledge-modeling is the theory, skill-infrastructure is the operations |
| `context-graph`                     | Designing the multi-graph topology of a workspace — that is one application of this skill, not the theory itself                                        |
