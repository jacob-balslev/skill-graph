---
name: semantic-center
description: "Use when you need to explain how parts of a system, feature, concept, page, workflow, or problem connect; identify the single most important part of something; untangle dense dependencies into a core plus typed relations; or answer 'what is the load-bearing part?' without drifting into implementation or task prioritization. Provides a five-step workflow — classify the unit of analysis, find the single primary part using removal/governance/purpose/weight/decision tests, map secondary parts via typed relations (dependency, input/output, parent/child, owner/owned, cause/effect, constraint/enabler, and others), produce a structured output, and reduce the whole to one final sentence — that forces explanation through one-primary reduction rather than flat lists or chronology. Do NOT use for implementation work (use the relevant domain skill), choosing what to do next (use a prioritization skill), or formal architectural-ownership design (use a domain-modeling skill)."
license: MIT
compatibility: "Domain-agnostic explanation method. The five-step workflow, the five primary-part tests, and the typed-relation taxonomy apply to systems, features, modules, workflows, concepts, decisions, or problems in any stack — substitute the relevant domain vocabulary for the structural skeleton."
allowed-tools: Read Grep
metadata:
  metadata: "{\"schema_version\":6,\"version\":\"1.0.0\",\"type\":\"workflow\",\"category\":\"foundations\",\"domain\":\"foundations/semantics\",\"scope\":\"portable\",\"owner\":\"skill-graph-maintainer\",\"freshness\":\"2026-05-06\",\"drift_check\":\"{\\\\\\\"last_verified\\\\\\\":\\\\\\\"2026-05-06\\\\\\\"}\",\"eval_artifacts\":\"planned\",\"eval_state\":\"unverified\",\"routing_eval\":\"absent\",\"stability\":\"experimental\",\"keywords\":\"[\\\\\\\"semantic center\\\\\\\",\\\\\\\"semantic-center workflow\\\\\\\",\\\\\\\"one-primary-part reduction\\\\\\\",\\\\\\\"removal test\\\\\\\",\\\\\\\"governance test\\\\\\\",\\\\\\\"load-bearing part\\\\\\\",\\\\\\\"typed relation map\\\\\\\",\\\\\\\"center-finding method\\\\\\\",\\\\\\\"structural importance\\\\\\\",\\\\\\\"single primary part\\\\\\\",\\\\\\\"figure-ground reduction\\\\\\\",\\\\\\\"explanation structure\\\\\\\",\\\\\\\"relation typing rules\\\\\\\",\\\\\\\"supporting-relation map\\\\\\\",\\\\\\\"analysis-vs-prioritization distinction\\\\\\\"]\",\"examples\":\"[\\\\\\\"what is the most important part of this dashboard, and how do the surrounding widgets relate to it?\\\\\\\",\\\\\\\"explain how the order, fulfillment, and payment systems relate — what is the semantic center of that flow?\\\\\\\",\\\\\\\"break down the query-tier system; what is the governing part and how do the others depend on it?\\\\\\\",\\\\\\\"we need to understand the onboarding flow, not implement it — what is the primary part and how do the steps relate around it?\\\\\\\",\\\\\\\"a skill system has frontmatter, body, and references — which part is the semantic center, and what roles do the others play?\\\\\\\",\\\\\\\"untangle these dense module dependencies into one core plus typed relations\\\\\\\",\\\\\\\"explain at a high level how this system hangs together\\\\\\\"]\",\"anti_examples\":\"[\\\\\\\"implement the new chart component for the reports page\\\\\\\",\\\\\\\"which task should I work on next from the board?\\\\\\\",\\\\\\\"design bounded contexts and aggregate ownership for the domain\\\\\\\",\\\\\\\"review this PR for code quality and missing tests\\\\\\\",\\\\\\\"decide kebab-case vs camelCase for new database columns\\\\\\\",\\\\\\\"rewrite this UI button label to be specific and action-oriented\\\\\\\"]\",\"relations\":\"{\\\\\\\"boundary\\\\\\\":[{\\\\\\\"skill\\\\\\\":\\\\\\\"task-analysis\\\\\\\",\\\\\\\"reason\\\\\\\":\\\\\\\"task-analysis decomposes a route or flow around the user's top task and friction dimensions (UX-goal-driven decomposition); semantic-center decomposes a system or concept around its single load-bearing part (structural-importance reduction) — the same 'what's the primary thing on this page?' prompt routes by whether the lens is the user's goal or the structural importance of the parts\\\\\\\"},{\\\\\\\"skill\\\\\\\":\\\\\\\"conceptual-modeling\\\\\\\",\\\\\\\"reason\\\\\\\":\\\\\\\"conceptual-modeling builds out a full concept structure (entities, attributes, relationships, invariants); semantic-center reduces a concept structure to one primary part plus typed relations to it — the same 'how do these concepts relate?' prompt routes by whether the user wants the full model or the load-bearing reduction\\\\\\\"},{\\\\\\\"skill\\\\\\\":\\\\\\\"pattern-recognition\\\\\\\",\\\\\\\"reason\\\\\\\":\\\\\\\"pattern-recognition surfaces recurring pattern classes across many instances; semantic-center forces one-primary reduction within a single instance — the same 'how does this hang together?' prompt routes by whether the unit of analysis is many instances (pattern) or one instance (center)\\\\\\\"}],\\\\\\\"related\\\\\\\":[\\\\\\\"intent-recognition\\\\\\\",\\\\\\\"diagnosis\\\\\\\",\\\\\\\"knowledge-modeling\\\\\\\"],\\\\\\\"verify_with\\\\\\\":[\\\\\\\"code-review\\\\\\\"]}\",\"portability\":\"{\\\\\\\"readiness\\\\\\\":\\\\\\\"scripted\\\\\\\",\\\\\\\"targets\\\\\\\":[\\\\\\\"skill-md\\\\\\\"]}\",\"lifecycle\":\"{\\\\\\\"stale_after_days\\\\\\\":365,\\\\\\\"review_cadence\\\\\\\":\\\\\\\"quarterly\\\\\\\"}\",\"skill_graph_source_repo\":\"https://github.com/jacob-balslev/skill-graph\",\"skill_graph_protocol\":\"Skill Metadata Protocol v5\",\"skill_graph_project\":\"Skill Graph\",\"skill_graph_canonical_skill\":\"skills/semantic-center/SKILL.md\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/semantic-center/SKILL.md
---

# Semantic Center

## Coverage

A structured explanatory workflow for identifying the *semantic center* of any system, feature, concept, page, workflow, decision, or problem and mapping how surrounding parts relate to it. Covers (1) **unit-of-analysis classification** (system / feature / module / page / workflow / concept / data model / decision / problem); (2) **primary-part identification** via the five tests (removal, governance, purpose, weight, decision) ranked by priority; (3) **typed secondary-part relation mapping** using a fixed taxonomy of relation types (dependency, input/output, parent/child, source/consumer, cause/effect, owner/owned, trigger/result, semantic grouping, constraint/enabler, sequence/timeline, contrast/tradeoff); (4) **structured-output production** following a fixed skeleton; and (5) **final one-sentence reduction** in a fixed grammatical form. Includes a "codebase analysis mode" overlay for analyzing a real implementation surface (grep, read primary file, follow data path, read tests) and an anti-pattern catalog (everything-is-important flattening, visibility-as-importance, proximity-as-relation, chronology-instead-of-structure, symmetric-relation blur).

## Philosophy

Most explanations fail because they present everything at the same weight. A user asks "how does this work?" and receives a chronological walkthrough or a laundry list, neither of which tells them what the system *depends on*. Until one part is named as load-bearing, the explanation is not structurally useful — the reader still has to do the reduction work themselves.

The core rule is: **prefer one primary part and typed supporting relations over multiple co-equal "important" parts.** When more than one thing seems important, the removal test or the governance test usually breaks the tie. If it doesn't, state the tension explicitly rather than hiding it behind a list. The five-step workflow exists to force that reduction every time, not as an aesthetic preference but as a structural one.

This skill is for *explanation*, not for execution. It tells you which part of a system carries the most semantic load. It does not tell you which task to start next (a prioritization concern), how to design the bounded contexts and aggregates of the system (a domain-modeling concern), or how to implement any of it (a domain skill concern).

## Workflow

The skill is the five-step workflow below. Each step produces explicit output. Steps run in order; a missing step downstream usually means the analysis short-circuited at the previous step.

```text
Step 1: Classify the unit of analysis
Step 2: Find the single most important part
Step 3: Map secondary parts in relation to the primary part
Step 4: Produce the structured output
Step 5: Reduce to one sentence
```

### Step 1 — Classify the Unit of Analysis

Before analyzing, explicitly state what kind of thing this is. The category shapes which relation types and tests are most likely to matter.

| Category | Examples |
|----------|---------|
| **System** | Auth pipeline, reconciliation engine, webhook chain |
| **Feature** | Order detail page, onboarding flow, CSV export |
| **Module** | Financial calculator, query-tier system, skill injector |
| **Page / Screen** | Dashboard, orders list, settings page |
| **Workflow** | Deploy pipeline, PR review cycle, task protocol |
| **Concept** | Data provenance, margin calculation, multi-tenancy |
| **Data model** | Order → line items → costs |
| **Decision** | Build vs buy, monolith vs microservice |
| **Problem** | Race condition, data inconsistency, bottleneck |

**Rule:** say explicitly, "This is a [category]." If you cannot pick a category, the unit of analysis is too vague — narrow it before continuing.

### Step 2 — Find the Primary Part

Use these tests, in priority order. The first test that produces a clear winner is the test you cite.

| Test | Question | What it reveals |
|------|----------|----------------|
| **Removal test** | If removed, what breaks first? | Load-bearing dependency |
| **Governance test** | What constrains or governs the rest? | Authority source |
| **Purpose test** | What best explains the point of the whole? | Semantic anchor |
| **Weight test** | What carries the most semantic load? | Core concept |
| **Decision test** | What anchors downstream choices? | Decision root |

**Rules:**

- Prefer one primary part. If the removal test is genuinely tied between two, name the tie explicitly rather than hiding it behind a list.
- Distinguish importance from visibility — the loudest element is not necessarily the most load-bearing.
- Distinguish importance from recency — the most recently changed part is rarely the semantic center.

### Step 3 — Map Secondary Parts

List secondary parts only in relation to the primary part. Every secondary part must have an explicit relation type from the taxonomy below.

| Relation Type | Meaning |
|--------------|---------|
| **dependency** | Secondary depends on the primary |
| **input/output** | Primary consumes or produces the secondary |
| **parent/child** | Structural containment |
| **source/consumer** | Data or event flow direction |
| **cause/effect** | Causal chain |
| **owner/owned** | Authority relationship |
| **trigger/result** | Event-driven relationship |
| **semantic grouping** | Family of concepts around the center |
| **constraint/enabler** | What limits or unlocks the primary |
| **sequence/timeline** | Temporal ordering only when no stronger structural relation exists |
| **contrast/tradeoff** | Competing alternative or tension |

**Rules:**

- Every secondary part must have an explicit relation type from this list.
- Proximity is not a relation. Two parts being "near each other" in the codebase is not a structural relationship — name the actual relation or drop the part.
- Chronology is not enough when a stronger structural relation exists. Use sequence/timeline only as a last resort.
- Symmetric "A and B both explain each other" is not allowed — choose the dominant direction.

### Step 4 — Structured Output

Use this output skeleton verbatim. Each `H2:` label below becomes a real `##` heading in the produced analysis document.

```text
H2: Unit of Analysis
    [Category]: [Name]

H2: Primary Part
    [Name of the single most important part]

H2: Why This Is the Primary Part
    [Which test(s) it passes and why]

H2: Secondary Parts
    - [Part A] — [role]
    - [Part B] — [role]

H2: Relation Map
    - Primary → Part A: [relation type] — [explanation]
    - Part B → Primary: [relation type] — [explanation]

H2: Simplest Explanation
    [2-3 sentences]

H2: Important Distinction
    [What people most often confuse]

H2: Common Misunderstanding
    [What goes wrong and why]

H2: Naming Recommendation
    [If naming is misleading, suggest better names]
```

### Step 5 — Final Reduction

End with exactly one sentence in this form:

> The core is **[X]**, and everything else matters because it [supports / depends on / constrains / expresses / feeds / consumes] **X**.

If you cannot write this sentence in one line, the analysis is not yet finished — return to Step 2.

### Codebase Analysis Mode (Overlay)

When the unit of analysis is a real repo surface rather than a pure concept, add these steps before Step 2:

1. Grep for the entity or surface name across the codebase.
2. Read the primary implementation file.
3. Follow the data or event path one hop in each direction.
4. Read tests if they exist.

Then add to the structured output:

- `## Key Files` — list the files that participate in the analyzed unit
- `## Verified Against` — list the artifacts that confirmed the analysis (grep results, test names, log lines)

### Anti-Patterns

| Anti-Pattern | Problem | Fix |
|--------------|---------|-----|
| **"Everything is important"** | No real reduction happened | Apply the removal test rigorously |
| **Visibility = importance** | The loudest element gets mistaken for the most load-bearing | Ask what breaks if it disappears |
| **Relation = proximity** | Nearby parts get treated as semantically connected | Name the actual relation type or drop the part |
| **Chronology instead of structure** | Timeline replaces architecture | Map dependencies and constraints first; use timeline only as last resort |
| **Symmetric relation blur** | "A and B both explain each other" | Choose the dominant direction |
| **Drift into prioritization** | Analysis turns into a what-to-do-next list | Stop at Step 5; prioritization is a different skill |

## Verification

After delivering a semantic-center analysis, verify:

- [ ] Exactly one primary part was identified (a stated tie counts as one, not two)
- [ ] Every secondary part has an explicit relation type from the taxonomy
- [ ] No relation is just proximity dressed up as structure
- [ ] No symmetric "A and B both explain each other" relations remain
- [ ] The "Important Distinction" is non-obvious rather than a restatement of the primary part
- [ ] The final reduction is exactly one sentence in the prescribed form
- [ ] The output stays in explanation mode rather than drifting into implementation or prioritization
- [ ] If codebase analysis mode was used, `## Key Files` and `## Verified Against` are present and grounded in actual reads

## Do NOT Use When

| Instead, use | Why |
|---|---|
| `task-analysis` | The unit of analysis is a route or flow and the question is "what is the user's top task?" Task-analysis owns goal-driven UX decomposition; semantic-center owns structural-importance reduction. |
| `conceptual-modeling` | You need a *full* concept model (all entities, attributes, relationships, invariants), not a single load-bearing reduction. Conceptual-modeling owns the full model; semantic-center owns the reduction. |
| `pattern-recognition` | The unit of analysis is *many instances* and the question is "what recurring pattern is this?" Pattern-recognition owns cross-instance pattern classes; semantic-center owns within-instance one-primary reduction. |
| `intent-recognition` | The task is parsing an ambiguous user prompt to recover the intent, not analyzing a system. Intent-recognition is upstream of any system analysis. |
| `documentation` | You are writing or restructuring a doc artifact, not analyzing a system. Documentation owns the artifact; semantic-center may produce content that goes into the artifact. |
| (a prioritization skill) | The question is "what should we work on next?" Prioritization is operational ranking; semantic-center is conceptual load-bearing. |
| (a domain-modeling skill) | The task is formal architecture: bounded contexts, aggregates, ownership boundaries. Domain-modeling owns formal model design; semantic-center is a quick structural explanation. |
| (the relevant domain skill) | The task is implementation, debugging, or shipping code. Semantic-center explains structure; it does not build. |
