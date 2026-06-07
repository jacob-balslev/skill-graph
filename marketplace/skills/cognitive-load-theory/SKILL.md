---
name: cognitive-load-theory
description: "Sweller's Cognitive Load Theory (CLT) for agents reviewing skill bodies, prompts, docs, dashboards, and agent outputs for avoidable cognitive burden. Working memory holds ~4 chunks; CLT splits load into intrinsic (irreducible difficulty), extraneous (avoidable load from poor presentation — ELIMINATE), and germane (the schema-building work applied to intrinsic load — PROTECT). Use when writing a SKILL.md body, designing prompts (am I asking the model to hold too much at once?), building dashboards (per-screen cognitive budget), authoring docs (is intrinsic load segmented?), or checking whether modern features (long context, structured outputs, prompt caching, subagents) actually reduce load or just move it. Do NOT use for retrieval/session working-set design (use context-management), token budget and compaction timing (use context-window), prompt engineering tactics (use prompt-craft), or token-efficient representation (use compression)."
license: MIT
compatibility: "Markdown, Git, any agent-skill runtime"
allowed-tools: Read Grep
metadata:
  subject: quality-assurance
  deployment_target: portable
  scope: "Portable cognitive-load review for skill bodies, prompts, documentation, dashboards, and agent outputs. Teaches Sweller's intrinsic/extraneous/germane load taxonomy (including the modern post-2010 reframing of germane load as resource allocation / productive processing), element interactivity, working-memory chunk and duration limits, the named CLT instructional effects, segmentation, chunking, worked examples, expertise reversal, structure-over-prose checks, and upstream-displacement checks for modern LLM/tooling features. Excludes retrieval/session working-set design (context-management), token budget math and compaction timing (context-window), provider-specific prompt tactic authoring (prompt-craft), token-efficient representation mechanics (compression), and broad instructional design beyond the CLT mechanisms grounded here."
  taxonomy_domain: quality/cognition
  stability: experimental
  keywords: "[\"cognitive load theory\",\"working memory\",\"intrinsic load\",\"extraneous load\",\"germane load\",\"chunking\",\"segmentation\",\"element interactivity\",\"expertise reversal\",\"prompt design\"]"
  triggers: "[\"cognitive-load-skill\",\"working-memory-skill\",\"clt-skill\"]"
  relations: "{\"related\":[\"context-management\",\"context-window\",\"compression\",\"prompt-craft\",\"information-architecture\",\"layout-composition\",\"visual-hierarchy\",\"microcopy\",\"writing-humanizer\",\"summarization\",\"best-practice\",\"guardrails\"],\"verify_with\":[\"best-practice\",\"information-architecture\",\"prompt-craft\"]}"
  mental_model: "Working memory is a small workspace with roughly four independent chunks available at once, and expertise changes what counts as one chunk. Cognitive Load Theory asks whether the material's element interactivity is intrinsic to the task, imposed by presentation (extraneous), or productive schema-building work (germane). Good design sequences unavoidable intrinsic load, eliminates extraneous load, and frees capacity so the learner can devote germane processing to schema construction through examples, self-explanation, contrast, and practice."
  purpose: "This skill prevents agents from treating 'simplify' as 'make shorter.' It gives a precise review lens for skill bodies, prompts, docs, dashboards, and agent outputs: identify which kind of load each section creates, remove only unnecessary presentation burden, keep worked examples and structure that build schemas, and verify that newer model/tool features did not merely hide the load in a different layer."
  boundary: "This skill diagnoses cognitive load in authored or presented material. It is not source selection, session-state pruning, token-budget accounting, compaction timing, prompt phrasing craft, plain-language editing, token compression, or general pedagogy beyond the cognitive-load mechanisms named here."
  analogy: "Cognitive Load Theory is like RAM management for comprehension: intrinsic load is the program that must run, extraneous load is unnecessary background work, and germane processing is useful caching that makes the next run easier."
  misconception: "The common mistake is thinking reduced cognitive load always means shorter output. Cutting context, examples, contrast, or schema-building structure can increase intrinsic load and waste the freed capacity that should go to germane processing; the correct first target is extraneous load."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/cognitive-load-theory/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1133"
---

## Concept Card

**What it is:** Cognitive Load Theory (CLT) is a psychological framework originating with John Sweller (1988) that explains how human working memory processes new information and what design decisions help or hinder schema formation. It is the scientific backbone behind "keep it simple" intuitions — but with actionable precision about *which* complexity to cut and which to preserve.

**Mental model:** Working memory is a small workspace — roughly 4 independent chunks at once (Miller's 7±2, revised by Cowan to ~4), and it holds novel information for only seconds unless rehearsed. CLT describes the load on that workspace in terms of intrinsic load (the task itself) and extraneous load (how you presented the task); germane load is the portion of working-memory effort that gets applied to building schemas out of the intrinsic material. Total load must stay below capacity or learning and comprehension fail.

**Why it exists:** Without CLT, agents default to "simplify" without knowing what to cut. They might remove worked examples (germane processing of intrinsic load, valuable) while keeping verbose prose around a table (extraneous load, wasteful). CLT gives a precise vocabulary for the tradeoff. Its deeper grounding is evolutionary (Geary's biologically *secondary* knowledge): we did not evolve to acquire reading, mathematics, or code effortlessly, so this material runs into the working-memory bottleneck and *needs* deliberate instructional design — unlike biologically *primary* skills such as speech or face recognition, which we acquire without it.

**What it is NOT:** Not a general UX heuristic. Not the same as plain-language writing. Not about reducing all complexity — germane processing (building schemas) is *desirable* and should not be starved. Not retrieval design (see `context-management`). Not a token-budget model, compression algorithm, or complete instructional-design theory.

**Adjacent concepts:** working memory, element interactivity, chunking, schema theory, dual-channel processing (Mayer's multimedia learning), segmentation principle, split-attention effect, redundancy effect, expertise reversal effect, transient information effect.

**One-line analogy:** CLT is like RAM management for humans — intrinsic load is the program you must run, extraneous load is unnecessary background processes, and germane load is the OS caching data so the next run is faster.

**Common misconception:** "Reducing cognitive load always means making things shorter or simpler." Wrong — cutting worked examples, removing context, or over-abstracting increases intrinsic load and wastes the freed capacity that should go to schema-building. The correct target is *extraneous load only*.

**Measurement note:** Cognitive load is not just a metaphor — it is *measured*, classically with subjective rating scales (the Paas single-item mental-effort scale), dual-task performance, and physiological signals. This skill applies CLT as a design lens rather than running formal measurement, but the underlying loads are empirically tractable, not hand-wavy.

# Cognitive Load Theory

## Domain Context

**What is this skill?** Sweller's Cognitive Load Theory for agents writing skill content, designing prompts, building UI/dashboards, and authoring documentation. Use when evaluating whether a skill body, prompt, UI screen, doc section, review comment, or agent output is imposing unnecessary cognitive load on its reader or user. The question is not "is it long?" but "what must the reader (or model) hold simultaneously, and why?" Do NOT use for retrieval and context-loading design (use `context-management`), token budget math and compaction timing (use `context-window`), prompt engineering tactics (use `prompt-craft`), or instructional design beyond what grounds the theory here.

## Coverage

- The three-load taxonomy (intrinsic, extraneous, germane) with definitions, examples, and the modern post-2010 reframing of germane load as processing/resource-allocation.
- Element interactivity as the determinant of intrinsic load, and how it falls with expertise.
- Working-memory capacity and duration limits, the long-term-memory escape hatch, and expertise-dependent chunking.
- Segmentation, simple-to-complex sequencing, prerequisite activation, and progressive disclosure.
- The named CLT instructional effects (worked-example, split-attention, redundancy, modality, expertise-reversal, guidance-fading, completion-problem, goal-free, transient-information, isolated-elements, collective/collaborative working memory).
- A five-step diagnostic protocol; application to skill writing, prompt design, dashboards, docs, audit output, and agent responses.
- How the working-memory analogy transfers (and where it breaks) to LLM context, with 2024–2026 evidence.
- Upstream-displacement checks for modern LLM capabilities: long context, structured outputs, prompt caching, prompt optimizers, stronger models, and subagents.
- A worked example reducing extraneous load in agent audit output; a measurement orientation; and common failure modes including the "simplify to lose germane content" trap.

This skill does not cover the full Mayer multimedia-learning research programme, formal load-measurement study design, assessment/test design, retrieval design, token accounting, prompt-security hardening, or copywriting style beyond what CLT directly explains.

## Philosophy

Every agent output — a SKILL.md body, a prompt, a dashboard widget, a Linear comment — competes for space in the reader's working memory alongside everything else they hold. An agent that generates a 3-paragraph preamble before the actual answer forces the reader to hold that prose until they reach the substance. An agent that uses a consistent table format for comparative data lets the reader chunk the format into a single schema slot and spend their remaining capacity on the content. CLT is the theoretical justification for structure-over-prose, examples-before-explanation, and segmentation. Without it, quality guidance is cargo-culted. With it, agents can reason precisely about *why* a design choice reduces or increases cognitive burden. But CLT also prevents over-trimming: the goal is not minimum tokens; the goal is maximum useful comprehension within capacity.

CLT is also a *living* theory, not a 1988 relic. It has been refined repeatedly — the reconceptualization of germane load (Sweller 2010), the "20 years later" synthesis (Sweller, van Merriënboer & Paas 2019), and an explicit account (Sweller 2023) of how replication failures drove the theory's expansion rather than its collapse. Apply the current model, not the introductory-textbook caricature.

## Cross-Domain Synergy

CLT is a theoretical foundation that neighboring skills draw on, but it owns *load diagnosis*, not their mechanisms. The table states both the help and the boundary so the synergy never drifts into a co-ownership claim.

| Neighbor | How CLT helps | Boundary |
|---|---|---|
| `information-architecture` | Explains why grouping, labels, and wayfinding reduce search load. | IA owns cross-page structure and findability. |
| `layout-composition` / `visual-hierarchy` | Explains why one focal path, grouping, and stable visual weight reduce simultaneous decisions. | Layout and visual hierarchy own concrete screen composition. |
| `prompt-craft` | Explains why prompt segmentation, examples, and clear output contracts reduce simultaneous instruction burden. | Prompt-craft owns provider-specific wording, role placement, and prompt tactics. |
| `context-management` | Shares the small-working-set intuition. | Context-management owns evidence selection and live session working-set discipline; CLT does **not** own the agent's session working memory. |
| `context-window` | Shares the finite-capacity analogy. | Context-window owns token budgets, model limits, headroom, and compaction timing. |
| `compression` / `summarization` | CLT can identify extraneous representation burden. | Compression and summarization own representation mechanics and meaning-preserving condensation. |
| `microcopy` / `writing-humanizer` | CLT explains why functional wording and non-robotic prose matter. | Those skills own sentence-level copy and voice. |
| `guardrails` | CLT recognizes when high-load presentation is being *weaponized* (the "cognitive overload attack" inflates effective load with long, nested context to bypass safety controls). | Guardrails owns the *defense*; CLT only diagnoses the load the attack exploits. |

---

## 1. When to Invoke CLT

Use this skill when the active question is about cognitive burden in material already chosen for presentation:

| Question | CLT lens |
|----------|----------|
| "Is this skill section too long?" | Which load type is the length adding? Cut only extraneous. |
| "Should I split this prompt into two?" | Intrinsic load exceeds single-session working-memory capacity → segment. |
| "Why is this dashboard hard to read?" | Per-screen load budget exceeded; count independent chunks, then group/prioritize before deleting data. |
| "Should I remove this example from the skill?" | Only if it's redundant (extraneous). If it builds a schema, keep it — it's the substrate for germane processing. |
| "Does this doc section need more context?" | Yes if removing context increases intrinsic load for the reader. |
| "Should I use a table or prose here?" | Table chunks multiple dimensions into one schema slot → lower extraneous load. |
| "Will this scaffolding help my reader?" | Only if they're a novice for this material; for experts the same scaffolding may *raise* load (expertise reversal). |
| "Does a bigger context window solve this?" | No. It solves capacity pressure, not presentation burden or reader comprehension. |
| "Can structured outputs replace prompt instructions?" | Often yes for schema enforcement, but CLT still reviews examples, constraints, and human-facing output. |

**Do NOT invoke this skill for:**
- Deciding *what* retrieval files to load or drop in a session (use `context-management`)
- Calculating token budgets, context health states, compaction timing, or model limits (use `context-window`)
- Writing the actual copy / prose (use `writing-humanizer` or `microcopy`)
- Choosing prompt phrasing strategies, provider role semantics, or structured-output API syntax (use `prompt-craft`)
- Compressing tokens, payloads, files, images, or long context (use `compression`)

---

## 2. The Load Model — Three Load Types

### 2.1 Intrinsic Load — irreducible difficulty of the task itself

Determined by the **element interactivity** of the material: how many things must be held *simultaneously* because they interact with each other. High interactivity = high intrinsic load. A task with many independent elements that can each be understood in isolation is low intrinsic load even if there are many of them; a task with few elements that all depend on each other is high intrinsic load. It is not the same as length — a short proof can be high intrinsic load; a long table of independent rows is low.

| Signal | Example | Management move |
|--------|---------|-----------------|
| Many interdependent concepts | Debugging a recursive algorithm while tracking stack frames and invariants | Segment the trace; show one frame transition first. |
| Prior knowledge required | Reading a diff that assumes familiarity with a domain-specific pattern | Activate prerequisites before the diff. |
| Multiple steps that reference each other | A 7-step migration guide where step 4 depends on step 2's output | Show one phase at a time with checkpoint outputs. |
| Mixed audience expertise | Novices and experts reading the same skill | Design for novices, add fast paths for experts. |

**Intrinsic load is relative to the reader's expertise.** Element interactivity is not a fixed property of the material — it falls as expertise rises. When several interacting elements are already stored as one schema in long-term memory, the reader treats them as a *single* element, so high-element-interactivity material becomes low-element-interactivity material (Sweller 2010). This is why the same page is dense for a novice and trivial for an expert.

**Management strategies:**
- **Segmentation**: Break into sub-tasks where each segment can be completed before the next is shown.
- **Prior-knowledge activation**: Surface prerequisite concepts before the main material so they pre-load as chunks.
- **Worked examples**: Replace problem-solving with example-study while schemas are forming (reduces intrinsic load during early learning).
- **Isolated-elements first**: For very high-interactivity material, teach the elements in isolation first (accepting temporarily incomplete understanding), then present them interacting once each is chunked.

**Rule:** Intrinsic load cannot be eliminated — the task is what it is. It can only be managed by sequencing, scaffolding, chunking, moving content behind prerequisites, and raising the reader's expertise.

### 2.2 Extraneous Load — unnecessary load from poor presentation

Load that arises from the *way* the information is presented, not from the information itself. This is the only load type that should be aggressively eliminated.

| Source | Example | Elimination tactic |
|--------|---------|--------------------|
| Split-attention effect | Having to look at a diagram in one place and its legend somewhere else | Integrate labels directly or place legend adjacent. |
| Redundancy effect | Restating in prose what a table already communicates clearly | Keep the table; cut the prose unless it adds interpretation. |
| Coherence violation | Including interesting-but-irrelevant context that the reader must process and then discard | Remove or move to a reference note. |
| Verbose preamble | Three paragraphs explaining what you're about to say before saying it | Start with the answer, then add rationale. |
| Inconsistent formatting | Different heading levels for the same type of content across sections | Normalize the pattern. |
| Missing visual hierarchy | A flat wall of text or flat metric grid with no structural cues | Add grouping, labels, and salience order. |
| Transient information | Key content that scrolls away (long streamed reasoning, prior chat turns) and must be held in memory | Make important information persistent and re-readable; pin it where the reader can re-read it. |
| Hidden state | Output assumes the reader remembers a prior caveat | Repeat the caveat where it is used or segment the flow. |

### 2.3 Germane Processing — the schema-building work applied to intrinsic load

Cognitive effort spent constructing, organizing, or automating a mental model. This effort is *desirable* — it is the mechanism of learning and skill acquisition. The goal is to free enough capacity (by removing extraneous load) that the reader can spend it on schema construction, while total load stays within capacity. It is not a blank check to add complexity: germane processing is valuable only when it helps the reader understand, transfer, or automate the material.

| Source | Example | Keep / add when |
|--------|---------|-----------------|
| Worked examples | Step-by-step solutions with explicit reasoning | Novices need a solution path before independent application. |
| Faded examples | Full example → partial completion → independent task | The learner is moving from novice to practice. |
| Variability practice | Multiple examples of the same concept in different contexts | Transfer across contexts matters. |
| Self-explanation prompts | "Why does this rule apply here?" | The reader must connect a rule to a case. |
| Analogies | Mapping a new concept onto a familiar schema (e.g., "CLT is like RAM management") | The analogy preserves the mechanism and is not mistaken for literal equivalence. |
| Contrasting cases | Showing what's wrong alongside what's right | Boundary recognition matters. |

**Rule:** Eliminate extraneous load first. Use the freed capacity for germane processing only when the material's goal includes understanding, transfer, or future application.

### 2.4 Modern refinement — germane load is resource *allocation*, not a third tank

The introductory model presents three *additive* loads (intrinsic + extraneous + germane ≤ capacity). The current theory is more precise, and getting this right prevents a real reasoning error.

Sweller (2010), reaffirmed in the "20 years later" synthesis (Sweller, van Merriënboer & Paas 2019) and in Paas & van Merriënboer (2020), holds that **germane load is not an independent source of load with its own knob.** It is the portion of working-memory resources *allocated to dealing with the intrinsic load* — i.e., the effort that actually goes into building schemas from the task's interacting elements. (Kalyuga's 2011 critique made the same point sharply: "germane load" is redundant unless redefined as resources devoted to intrinsic rather than extraneous load.) The honest accounting is therefore:

> **Total load = intrinsic + extraneous.** Germane load is how much of the capacity left after extraneous removal is genuinely devoted to the intrinsic material.

Why this matters for design:
- You **cannot "add germane load"** as a separate ingredient. You free capacity by cutting extraneous load, and you make germane processing *likely* by giving the reader something worth building a schema from (worked examples, varied cases, contrasts).
- "Promote germane" is shorthand for "remove extraneous so the freed capacity lands on schema construction, and present the intrinsic material so that construction is invited." It is causally correct under the modern model; the older additive phrasing is a teaching simplification.
- The practical checklist in this skill is unchanged by the refinement — but your *reasoning* about it should be: don't imagine a germane dial you can turn up independently of the task.

This is also why the original three-additive-bucket diagram survived as a teaching device: the *practice* (eliminate extraneous, protect schema-building structure) is identical. **Use the additive picture to teach; use the allocation picture to reason.** The traditional three-label vocabulary is retained throughout this skill for practical review and eval compatibility.

---

## 3. Working Memory and Chunking

### The ~4-chunk finding

Cowan (2001) revised Miller's 7±2 downward: *the reliable limit of working memory is approximately 4 independent chunks* — not 7. Treat the number as a planning heuristic, not a literal universal ceiling. Crucially, what counts as a "chunk" depends on expertise: an expert chess player chunks a board position into one unit; a novice processes each piece separately. Working memory is also **duration-limited**: novel information decays within seconds unless rehearsed, which is why transient, scroll-away content is costly.

The deep asymmetry CLT rests on: working memory is severely limited for *novel* information, but **effectively unlimited when drawing organized knowledge from long-term memory.** Schemas in long-term memory are the escape hatch from the 4-chunk ceiling — the entire point of promoting schema formation.

**Implications:**

| Situation | Working-memory implication |
|-----------|---------------------------|
| Novice reader encountering an unfamiliar pattern | Each element is a separate chunk; total capacity exhausted quickly |
| Expert reader encountering a known pattern | The entire pattern is one chunk; more capacity for novel details |
| An agent writing for a mixed audience | Design for the novice's chunking capacity; experts will auto-compress |
| A 10-column dashboard widget | If column meanings are not already chunked, viewer hits capacity before first insight |
| A prompt with eight interacting constraints | The model may satisfy some and drop others unless the work is sequenced or schema-backed |

### Chunking strategies

1. **Label by type, not by instance**: Instead of 10 separate data points, introduce a category that chunks them (e.g., "fulfillment metrics" as a header that frames the following 5 rows).
2. **Consistent structure as a free chunk**: When every SKILL.md section follows the same format, the reader chunks the format itself — freeing all 4 slots for content.
3. **Pre-load schemas**: Front-load the concept card / summary so the reader builds a lightweight schema before encountering detail.
4. **Segment before elaborating**: Deliver the simplest complete unit first, add complexity in subsequent passes.
5. **Move enforcement to structure**: Tables, schemas, typed fields, and UI grouping reduce interpretation burden.
6. **Support then fade**: Keep worked examples for novices, then replace some solution steps with completion prompts when the reader has enough schema.

---

## 4. The Named CLT Effects (catalogue)

CLT is not one rule; it is a family of empirically established **effects**, each a specific instructional manipulation that lowers extraneous load or manages intrinsic load. Knowing the named effects turns vague "this feels heavy" intuitions into nameable, fixable diagnoses. Each row maps the effect to its agent-authoring application.

| Effect | What it says | Agent-authoring application |
|--------|--------------|-----------------------------|
| **Worked-example effect** | Novices learn more from studying solved examples than from solving equivalent problems (Sweller 1988). | Keep before/after worked examples in skill bodies; cut surrounding prose, not the example. |
| **Split-attention effect** | Forcing the reader to integrate two separated-but-related sources (diagram + distant legend) raises load. | Co-locate labels, captions, and the thing they describe; don't make readers hold one section to parse another. |
| **Redundancy effect** | Presenting the *same* information two ways (prose restating a clear table) raises load — more is not safer. | Delete prose that duplicates a table/diagram; pick one representation. |
| **Modality effect** | Splitting information across complementary channels (visual + auditory) can expand effective capacity vs. all-visual. | For agent output: don't pile every cue into one dense visual block; use structure to separate channels of meaning. |
| **Expertise-reversal effect** | Scaffolding that helps novices *hurts* experts — the extra support becomes redundant load (Kalyuga). | Match scaffolding to the reader's expertise; for an expert audience, fade examples and detailed steps. |
| **Guidance-fading effect** | As expertise grows, guidance should be progressively withdrawn (worked example → completion problem → full problem). | Layer skills: heavy worked examples for first contact, terse reference for the practiced reader. |
| **Completion-problem effect** | Partially worked examples the reader finishes bridge worked examples and independent problem-solving. | "Fill-in" templates and partial scaffolds are a load-calibrated middle ground between full examples and bare instructions. |
| **Goal-free effect** | Removing a specific goal ("find angle X") and asking "find what you can" lowers means-ends search load for novices. | Open-ended exploratory framings can reduce load when a fixed target would force heavy search. |
| **Transient-information effect** | Information that disappears (speech, animation, scroll-away context) raises load because it must be held in memory. | Prefer persistent, re-readable structure over long streamed reasoning or content that scrolls out of view. |
| **Isolated-elements effect** | For very high element interactivity, teaching elements in isolation first (then combined) beats full interaction up front. | Decompose a dense interacting procedure into isolated pieces before showing the full interacting whole. |
| **Collective / collaborative working memory effect** | A group can pool working memory to handle load no individual could — at the cost of transactive coordination overhead. | Relevant to multi-agent designs: distributing load across agents helps, but coordination is itself a load (arXiv 2506.06843). |

**Note on expertise-dependence:** most of these effects are *novice* effects — they appear for learners without the relevant schema and weaken or reverse as expertise rises (the expertise-reversal effect is the meta-statement of this). Always ask "who is the reader, and what do they already chunk?" before applying an effect.

---

## 5. Diagnostic Protocol

Use this five-step protocol before editing. **Do not begin by shortening. Begin by classifying.**

| Step | Question | Output |
|------|----------|--------|
| 1. Name the audience | What can this reader/model already chunk? | Novice / mixed / expert assumption. |
| 2. Count interacting elements | What must be held simultaneously because pieces interact? | Intrinsic-load map. |
| 3. Mark presentation burden | What search, redundancy, inconsistency, transient/hidden state is imposed by presentation? | Extraneous-load findings. |
| 4. Identify schema builders | What examples, contrasts, labels, or prompts help future application? | Germane-processing keep/add list. |
| 5. Choose the smallest load-aware intervention | Segment, group, integrate, delete, move, table, example, or API/schema enforcement? | Concrete edit with boundary skill if needed. |

---

## 6. Application: Writing Skills

When authoring or reviewing a `SKILL.md` body, apply the three-load taxonomy to each section before cutting content.

### Checklist

| Question | If YES → action |
|----------|-----------------|
| Does this section restate what the heading already conveys? | Extraneous redundancy → cut the restatement |
| Is this section longer than the information it communicates? | Extraneous verbosity → compress to table or bullets |
| Does this section require the reader to cross-reference another section to understand it? | Split-attention → integrate or re-sequence |
| Does this section contain a worked example? | Germane substrate → keep it; do not cut for length |
| Does this section teach a reusable distinction? | Germane processing → preserve or enrich with contrast |
| Does this section assume private or unstated prerequisites? | Intrinsic load raised by missing context → add prerequisite activation or boundary |
| Does this section use a consistent format with neighboring sections? | If YES: format-as-chunk is working → maintain consistency |
| Is my reader an expert who already holds this schema? | Expertise reversal → fade the scaffolding; a terse reference beats a worked example |

### Writing skills *for agents* — the expertise-reversal caveat

A subtle trap specific to this library: the *reader* of a SKILL.md is usually a frontier model with enormous prior knowledge. For a topic the model already chunks, heavy worked examples and step-by-step scaffolding can become **redundancy / expertise-reversal load** — they restate what the model already holds and crowd out the genuinely novel content (the project's conventions, boundaries, and decisions). The fix is not to strip examples reflexively, but to ask which content is *novel* to a strong model: examples that encode this project's non-obvious choices are germane; examples that re-teach a well-known pattern the model already has are extraneous for that reader. Calibrate scaffolding to the *novelty for the actual reader*, not to a hypothetical beginner.

### Anti-patterns in skill bodies

| Anti-pattern | Load type | Fix |
|---|---|---|
| Four-paragraph intro before the actual content | Extraneous (preamble) | Move preamble to Concept Card; open sections with the content |
| "This section covers X. X is important because..." | Extraneous (redundancy) | Remove the meta-commentary; start with X |
| Removing the worked example to save tokens | Germane substrate destroyed | Keep the example; cut prose around it instead |
| Using different heading levels for equivalent content | Extraneous (inconsistency) | Normalize heading hierarchy |
| Abstract rule with no boundary case | Intrinsic load left unmanaged | Add a contrasting case |
| Five adjacent bullets that all say "be clear" | Extraneous (redundancy) | Merge into one actionable rule |
| Re-teaching a pattern a strong reader already chunks | Extraneous (expertise reversal) | Cut to a reference; spend the space on what's novel to this reader |

---

## 7. Application: Designing Prompts and Agent Instructions

Prompt design is working-memory design for the model. The model's context window is not literally working memory, but the principles transfer functionally: a prompt that requires holding many interdependent instructions simultaneously creates a load-like degradation — drop, drift, or malformed output. Use CLT to decide *when* a prompt is overloading the processor; use `prompt-craft` for the exact provider tactics.

### High-intrinsic-load prompt signals

| Signal | Why it's high load | CLT-informed move |
|--------|-------------------|-------------------|
| Multiple tasks stated in one unsequenced prompt | Model must track all tasks simultaneously | Split into phases with one deliverable per phase |
| Later instructions that modify earlier ones | Model must retroactively reinterpret prior context | Put stable rules first; avoid exceptions unless needed |
| Abstract instructions with no examples | Model must construct the intent without schema | Add a minimal positive example or use structured outputs |
| Long preamble before the actual instruction | Model must retain preamble while processing what follows | Put the primary task in the first sentence |
| User data not separated from instructions | Competing instruction sources | Delimit data and state which source has authority |
| Output schema described only in prose | Schema adherence depends on obedience | Use provider structured-output features when available |

### CLT-informed prompt design

| Strategy | What it does | Boundary |
|----------|--------------|----------|
| **Segment high-intrinsic tasks** | Split into sequential prompts; each builds on the prior output | CLT owns rationale; prompt-craft owns exact prompt shape |
| **Example-first for novel formats** | Show the output format before describing it abstractly | Prompt-craft owns few-shot selection details |
| **Front-load the primary task** | State what you want in sentence 1; justification follows | Prompt-craft owns role/message placement |
| **Consistent instruction schema** | Reuse the same structure across related prompts so the format becomes a chunk | Context-engineering owns broader injection design |
| **One constraint per instruction** | Avoid compound constraints ("do X but not Y, unless Z") | Guardrails own runtime safety controls |
| **Use structured outputs for strict shapes** | Moves schema enforcement out of prose | Provider docs/API own implementation |

### Does CLT actually transfer to LLMs? (what the 2024–2026 research shows)

The working-memory analogy is *partly* empirical now, with important caveats — state both honestly rather than asserting a clean equivalence:

- **The transfer is real but mechanistically different.** An LLM has a bounded active workspace at inference: attention weights are spread across all tokens in a fixed context window, so every added token consumes attention budget. A recent framework (*Overloaded minds and machines*, Springer 2026, doi 10.1007/s10462-026-11510-z) maps Sweller's three loads onto this — intrinsic from task complexity, extraneous from poor structure and distractors, germane from productive in-context reasoning. The mechanism (finite biological working memory vs. distributed attention budget) differs, so treat it as a strong analogy, not an identity.
- **Overload shows threshold, then collapse.** As effective load rises (long dependency chains, poorly structured instructions, irrelevant distractors), accuracy holds up to a point and then degrades abruptly — the same shape CLT predicts for humans, and consistent with "lost-in-the-middle" / context-rot findings. Segmentation and distractor removal are load reductions, not just style.
- **Load can be weaponized.** The "cognitive overload attack" (arXiv 2410.11272) deliberately inflates a model's effective load with long, nested context to slip past safety guardrails — a security reason to flag high-load presentation, connecting this skill to `guardrails`.
- **The analogy's limit.** Humans apply *metacognitive control* — they notice overload and self-trigger strategies (take notes, simplify). Current models mostly need that scaffolding supplied explicitly in the prompt or workflow. So "design the model's working memory for it" is the actionable transfer; "the model will manage its own load" is not yet reliable.

### Example: refactoring a high-load prompt

**Before (high extraneous and intrinsic load):**
```
I need you to look at this audit output from our skill review system and think about which findings are the most important ones and then also consider whether any of them might actually be incorrect given the context of how skills work in our system, and then write a summary that could be used in a Linear comment explaining what needs to be done.
```

**After (segmented, reduced extraneous load):**
```
Step 1: Classify each finding below as VALID or INVALID. A finding is invalid if it misunderstands how our skill schema works.

[findings]

Step 2: Of the VALID findings, rank by severity: BLOCKING, ADVISORY, NITPICK.

Step 3: Write a Linear comment summarizing the BLOCKING findings and their required fixes.
```

The second version segments intrinsic load, removes preamble verbosity, makes the invalidity rule local to the classification step, gives severity an explicit schema, and provides a consistent schema for each step.

---

## 8. Application: UI / Dashboards

Per-screen cognitive budget is a CLT concept: a screen imposes load through the number of independent data points, interaction affordances, labels, legends, hidden state, visual weight, and task dependencies the viewer must process simultaneously.

### Budget heuristics

| Guideline | Rationale |
|-----------|-----------|
| Max 4-5 independent ungrouped data points per widget | Matches working-memory chunk limit |
| Group related metrics under a labeled category | The label becomes a single chunk |
| One primary decision path per screen zone | Competing focal points consume attention |
| Consistent card structure across the dashboard | Format chunked → all capacity for content |
| Progressive disclosure for detail | Show summary first; reveal detail on demand |
| Put legends, units, and labels where they are used | Prevents split-attention |
| Normalize numeric precision and status symbols | Prevents parsing each value format separately |
| Avoid same-visual-weight competing CTAs | Multiple salient actions compete for the same chunk slot |

### Common dashboard extraneous-load sources

| Source | Fix |
|--------|-----|
| 12-column table with no grouping | Group by category; hide secondary columns behind expand/detail |
| Redundant title + axis label + legend | Integrate axis label into chart; remove the duplicate |
| Color-coded data with no legend visible | Move legend adjacent to chart or encode in tooltip (avoids split-attention) |
| Mixed decimal precision across a single widget | Normalize precision so reader doesn't parse each format separately |
| Status indicators without consistent icon meaning | Define a fixed icon vocabulary (same icon = same meaning everywhere) |
| Three equal-weight CTAs | Pick one primary action; demote or nest the rest |

---

## 9. Modern Agent Capability Check

Run this upstream-displacement check before assuming CLT advice is obsolete because of a newer model or tooling feature.

| Newer capability | What it improves | What it does NOT solve | Skill boundary |
|---|---|---|---|
| Large (1M-token) context windows | More material can fit in one request | Noisy, redundant, or badly sequenced material is still hard to use | `context-window` owns token budgets |
| Prompt caching | Stable prefixes can cost less and respond faster | It does not make the cached instructions cognitively clearer | `context-window` / provider docs own caching mechanics |
| Structured Outputs / schemas | Output shape can be enforced outside prose | The reader still needs understandable content, examples, and decisions | `prompt-craft` owns API tactic; CLT reviews burden |
| Stronger reasoning models | Some tasks require less scaffolding and fewer micro-instructions | A stronger model can still drop constraints when the task is overstuffed or contradictory | `prompt-craft` owns model-specific prompting |
| Prompt optimizers | They can find prompt simplifications or migration changes | They do not replace source-grounded load diagnosis or eval evidence | `evaluation` / `prompt-craft` verify behavior |
| Subagents / specialized agents | Work can be split by responsibility and tool authority | Splitting badly can create coordination and handoff load | Agent orchestration owns delegation; CLT reviews instruction burden |
| Hosted tools / file search | Retrieval and execution can move out of the prompt | Tool output can still be verbose, ungrouped, or poorly summarized | `context-management` owns selection |

**Rule:** A newer upstream feature displaces CLT only when it removes the same *mechanism* of load. Most features move load between layers: from prompt prose to API schema, from one large agent to subagents, or from repeated prefixes to a cache. CLT remains the review lens for the human- or model-facing material that remains.

---

## 10. Worked Example: Reducing Extraneous Load in Audit Output

**Before (high extraneous load):**
```
Audit Results for skills/my-skill/SKILL.md:

After reviewing the skill carefully I noticed that there are a few things that 
could be improved. The first issue I want to mention is that the description field 
in the frontmatter doesn't actually have the use_when and not_for patterns that 
we require. Also, looking at the relations section, I see that verify_with is 
empty which means the skill has no verification partners. Additionally, the eval 
file has only one eval which is below the minimum we set.

I think these should be fixed but the skill is otherwise in reasonable shape.
```

**After (low extraneous load, structured):**

```
## Audit: skills/my-skill/SKILL.md

| Finding | Severity | Fix |
|---------|----------|-----|
| description missing use_when / not_for pattern | BLOCKING | Add "Use when: ... Do NOT use for: ..." |
| relations.verify_with is empty | ADVISORY | Add at least one verify_with skill |
| evals/comprehension.json has fewer than 5 cases | BLOCKING | Add realistic boundary and application cases |

Overall: 2 BLOCKING. Fix before marking PASS.
```

**What changed:**
- Removed verbal preamble ("After reviewing the skill carefully I noticed...")
- Replaced prose with a table — each finding is now one chunk
- Made severity and fix explicit rather than embedded in prose
- Removed hedging ("I think", "otherwise in reasonable shape") — extraneous load with no information content
- Preserved the germane structure: finding, severity, fix, and overall status

---

## 11. Common Failure Modes

| Failure mode | Load consequence | Detection signal | Fix |
|---|---|---|---|
| "Simplify" interpreted as "make shorter" | Cuts germane substrate (worked examples, analogies) | More follow-up questions, weaker application | Classify load before cutting |
| Removing context to reduce word count | Increases intrinsic load (reader must infer what was removed) | Reader asks follow-up questions that context would have answered | Add prerequisite activation or local context |
| Adding beautiful prose to describe what a table already shows | Extraneous redundancy | Section length ≠ information density | Cut prose or add interpretation only |
| Designing a prompt in one large block | High intrinsic load; model can't segment | Model produces mixed output or drops constraints | Segment by deliverable |
| Consistent formatting abandoned mid-document | Format chunk broken; reader spends capacity re-orienting | Mixed heading levels, inconsistent table structures | Normalize section pattern |
| Equating "expert content" with "high cognitive load" | False: experts chunk more; appropriate material for audience reduces load | Ask: who is the reader? What do they already chunk? | Match scaffolding to audience |
| Heavy scaffolding for an expert reader | Expertise reversal — the support becomes redundant load | Examples re-teach what the reader already holds; novel content gets crowded out | Add a fast path or fade examples |
| Novice scaffolding removed for experts only | Intrinsic load spikes for novices | Novices ask basic follow-ups | Keep novice path; add collapsible/optional depth |
| Key info delivered as transient streamed prose | Transient-information load — reader can't re-read it | Reader re-asks for something that already scrolled past | Make important information persistent |
| Long context treated as clarity | Extraneous noise remains | Model cites irrelevant details or misses core task | Use `context-management` and CLT together |
| Schema enforcement left in prose | Output shape is unreliable | JSON/fields drift or malformed output | Use structured outputs; keep prompt human-readable |
| Imagining a "germane dial" you can turn up independently | Mis-models the theory; leads to padding "to add germane load" | You're adding content that doesn't remove extraneous load or build a schema | Free capacity by cutting extraneous; invite schema-building |

---

## 12. Measuring Cognitive Load (orientation, not a procedure)

This skill is a *design lens*, but the loads it names are empirically measurable — useful to know so claims about load aren't treated as pure opinion:

- **Subjective rating** — the Paas single-item mental-effort scale (rate effort 1–9) is the classic, cheap measure; some protocols rate intrinsic and extraneous separately.
- **Dual-task / secondary-task** — performance on a concurrent task drops as primary-task load rises.
- **Performance and behavioral traces** — error rate, time-on-task, re-reads, and (for agents) dropped constraints or degraded accuracy under longer/denser context.
- **Physiological** — pupil dilation, EEG, and similar are used in research settings.

You will rarely run these in an authoring task; the point is that "this section adds extraneous load" is a claim that *could* be tested, and you should reach for the closest cheap evidence (a re-read, a confused follow-up, a dropped constraint) rather than asserting load from taste alone.

---

## 13. Rating Criteria

Rate any output (skill body, prompt, doc section, dashboard widget) against CLT:

| Score | Criterion |
|-------|-----------|
| **5** | Extraneous load eliminated. Schema-building substrate (worked examples, contrasts) preserved so freed capacity lands on germane processing. Structure is consistent and chunks the format. Scaffolding matched to the reader's expertise. Intrinsic load segmented where it exceeds single-pass capacity. Upstream features used only when they actually remove load. |
| **4** | Extraneous load mostly eliminated. Minor redundancy remains but does not impede comprehension. Germane substrate intact. Structure mostly consistent. |
| **3** | Some extraneous elements (preamble, redundant prose) present but not dominant. Germane substrate mostly intact. Structure inconsistent in places; segmentation incomplete. |
| **2** | Significant extraneous load (verbose intro, split-attention, redundancy). Some schema-building content removed. Reader/model must do significant work to find or apply the substance. |
| **1** | Dominant extraneous load (wall of text, no structure, redundancy throughout). Schema-building substrate absent or destroyed. Reader/model cannot reliably extract the core information. |

### Evidence signals (did load actually drop?)

- Reader asks questions the artifact should have answered.
- Model output drops one of several constraints.
- Reviewer says "I could not find the actual instruction."
- Dashboard viewer cannot name the top insight after one scan.
- The same explanation must be repeated in follow-up comments.
- A stronger model improves fluency but not correctness or task completion.

---

## Verification

After applying CLT, verify:

- [ ] The target audience/expertise level was named.
- [ ] Intrinsic load was managed through sequencing, prerequisite activation, or worked examples.
- [ ] Extraneous load was removed without deleting schema-building content.
- [ ] Germane processing was preserved or added only where it improves transfer or application.
- [ ] Tables, examples, labels, and headings create reusable chunks instead of decoration.
- [ ] Prompt/application changes route provider-specific tactics to `prompt-craft`.
- [ ] Retrieval, token budget, compaction, and compression decisions route to their owning skills.
- [ ] Modern tooling was checked for real displacement: schema/API/caching/subagent features replace only the load mechanism they actually own.
- [ ] A before/after or concrete case proves the change reduced burden without hiding substance.

---

## Audit Status

Audit/eval/provenance state lives in the sibling `audit-state.json` sidecar, not in the skill body. Run the Skill Audit Loop to update verdicts, freshness, and eval state; the teaching surface should not duplicate those values.

---

## Do NOT Use When

| Use instead | When |
|---|---|
| `context-management` | The task is deciding what evidence or files enter, stay in, or leave an active session working set. |
| `context-window` | The task is token capacity, context zones, compaction timing, output headroom, or model window selection. |
| `prompt-craft` | The task is exact prompt wording, provider roles, few-shot format, structured-output implementation, or prompt-injection hardening. |
| `compression` | The task is token-efficient representation, payload compression, semantic summarization, token pruning, or storage/network compression. |
| `information-architecture` | The task is navigation, sitemap, page hierarchy, wayfinding, or findability beyond CLT diagnosis. |
| `layout-composition` / `visual-hierarchy` | The task is concrete responsive layout, grid/flex composition, scan pattern, or visual salience design. |
| `microcopy` / `writing-humanizer` | The task is final UI wording, prose tone, voice, readability style, or AI-tell removal after the load diagnosis. |
| `guardrails` | The task is *defending* against cognitive-overload prompt-injection attacks; CLT only diagnoses the load that the attack exploits. |
| `evaluation` | The task is scoring a completed artifact against acceptance criteria. |

---

## Reference Trail

The canonical sibling `references/sweller-1988.md` remains the local source trail. This enrich pass also checked current external sources on the 2010 germane reconceptualization (Sweller), the "20 years later" synthesis (Sweller, van Merriënboer & Paas 2019), Paas & van Merriënboer (2020), Kalyuga (2011), the replication-crisis account (Sweller 2023), digital/online-learning CLT, the named-effects catalogue, the LLM cognitive-load framework (*Overloaded minds and machines*, Springer 2026), the cognitive-overload attack (arXiv 2410.11272), multi-agent CLT (arXiv 2506.06843), and current OpenAI / Anthropic / Google Gemini / OpenCode guidance on long context, structured outputs, prompt caching, and agent decomposition. Keep external source URLs in a sidecar/reference file rather than the teaching surface.

---

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Deployment: `portable`
- Domain: `quality/cognition`
- Scope: Portable cognitive-load review for skill bodies, prompts, documentation, dashboards, and agent outputs. Teaches Sweller's intrinsic/extraneous/germane load taxonomy (including the modern post-2010 reframing of germane load as resource allocation / productive processing), element interactivity, working-memory chunk and duration limits, the named CLT instructional effects, segmentation, chunking, worked examples, expertise reversal, structure-over-prose checks, and upstream-displacement checks for modern LLM/tooling features. Excludes retrieval/session working-set design (context-management), token budget math and compaction timing (context-window), provider-specific prompt tactic authoring (prompt-craft), token-efficient representation mechanics (compression), and broad instructional design beyond the CLT mechanisms grounded here.

**When to use**
- Triggers: `cognitive-load-skill`, `working-memory-skill`, `clt-skill`

**Related skills**
- Verify with: `best-practice`, `information-architecture`, `prompt-craft`
- Related: `context-management`, `context-window`, `compression`, `prompt-craft`, `information-architecture`, `layout-composition`, `visual-hierarchy`, `microcopy`, `writing-humanizer`, `summarization`, `best-practice`, `guardrails`

**Concept**
- Mental model: Working memory is a small workspace with roughly four independent chunks available at once, and expertise changes what counts as one chunk. Cognitive Load Theory asks whether the material's element interactivity is intrinsic to the task, imposed by presentation (extraneous), or productive schema-building work (germane). Good design sequences unavoidable intrinsic load, eliminates extraneous load, and frees capacity so the learner can devote germane processing to schema construction through examples, self-explanation, contrast, and practice.
- Purpose: This skill prevents agents from treating 'simplify' as 'make shorter.' It gives a precise review lens for skill bodies, prompts, docs, dashboards, and agent outputs: identify which kind of load each section creates, remove only unnecessary presentation burden, keep worked examples and structure that build schemas, and verify that newer model/tool features did not merely hide the load in a different layer.
- Boundary: This skill diagnoses cognitive load in authored or presented material. It is not source selection, session-state pruning, token-budget accounting, compaction timing, prompt phrasing craft, plain-language editing, token compression, or general pedagogy beyond the cognitive-load mechanisms named here.
- Analogy: Cognitive Load Theory is like RAM management for comprehension: intrinsic load is the program that must run, extraneous load is unnecessary background work, and germane processing is useful caching that makes the next run easier.
- Common misconception: The common mistake is thinking reduced cognitive load always means shorter output. Cutting context, examples, contrast, or schema-building structure can increase intrinsic load and waste the freed capacity that should go to germane processing; the correct first target is extraneous load.

**Keywords**
- `cognitive load theory`, `working memory`, `intrinsic load`, `extraneous load`, `germane load`, `chunking`, `segmentation`, `element interactivity`, `expertise reversal`, `prompt design`

<!-- skill-graph-context:end -->
