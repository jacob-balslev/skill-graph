---
name: journey-mapping
description: "Use when mapping a user's experience across multiple touchpoints and time, surfacing emotional peaks and troughs, identifying opportunity moments in a cross-channel flow, or aligning a team on the end-to-end experience including back-stage support processes. Do NOT use for decomposing a single screen into UI steps (use task-analysis) or for drawing back-end service architecture diagrams — journey maps describe human experience, not system topology. Do NOT use for Break down the steps a user takes inside the upload modal. Do NOT use for Draw the microservice call graph for the checkout API. Do NOT use for Diagram the database schema for the order entity."
license: CC-BY-4.0
metadata:
  subject: design
  public: "true"
  scope: "Portable across any product, service, or team. Teaches how to model a person's end-to-end lived experience across touchpoints, channels, and time — the actions, thoughts, and emotional curve front-stage, plus the back-stage processes that produce each moment — so a team aligns on one cross-channel reality and fixes the moments that matter. Not bound to any codebase or tool; applies to any experience being designed, audited, or aligned on."
  stability: experimental
  keywords: "[\"customer journey map\",\"user journey\",\"service blueprint\",\"touchpoint\",\"moments of truth\",\"experience map\",\"front-stage back-stage\",\"emotional curve\",\"opportunity areas\",\"pain points\"]"
  triggers: "[\"journey map\",\"service blueprint\",\"map the user experience\",\"customer journey\",\"touchpoints\"]"
  examples: "[\"Build a journey map for first-time tax filers from awareness through filing to refund.\",\"Add a service-blueprint layer below this journey map showing the back-stage support steps.\",\"Identify the emotional low points in this onboarding journey and the opportunities at each.\",\"Map the cross-channel experience of returning an online order to a physical store.\"]"
  anti_examples: "[\"Break down the steps a user takes inside the upload modal.\",\"Draw the microservice call graph for the checkout API.\",\"Diagram the database schema for the order entity.\"]"
  relations: "{\"related\":[\"research-synthesis\",\"information-architecture\",\"design-thinking\",\"problem-framing\",\"task-analysis\",\"bounded-context-mapping\",\"event-storming\",\"ideation\",\"user-research\"],\"suppresses\":[\"information-architecture\",\"ideation\"],\"verify_with\":[\"user-research\",\"research-synthesis\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A journey map is like a film's emotional storyboard rather than a wiring diagram: it tracks how the protagonist feels scene by scene across locations and time, so you fix the scenes that lose the audience — not the lighting rig behind them."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/journey-mapping/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Journey Mapping

## Concept of the skill

Journey mapping is the discipline of modeling a person's end-to-end lived experience across touchpoints, channels, and time, so a team can see — and align on — what the user actually goes through rather than what any single screen, diagram, or backlog reveals. A journey map lays the experience out as a timeline of stages (for example Awareness → Consideration → Purchase → Onboarding → Use → Renew) with vertical lanes for what the user is doing, thinking, and feeling, and which touchpoint they are using; an emotional curve rendered along that timeline exposes the peaks and troughs — the "moments of truth" — that disproportionately shape the overall impression. A service blueprint extends the map downward through the line of visibility into the back-stage employees, systems, and support processes that produce each front-stage moment, which matters whenever the experience depends on handoffs the user never sees. The map's credibility comes entirely from being grounded in research synthesis: each pain point and emotional low cites real evidence, stages are named from the user's perspective rather than the business's, and the artifact identifies specific opportunity areas at named stages instead of a generic "improve onboarding." Done well, journey mapping is the only artifact that treats experience as temporal and cross-channel, letting a team invest in the moments that actually decide success.

## Concept Card

**What it is:** A time-ordered model of one actor's lived experience across touchpoints and channels — laying out what they do, think, and feel, against the front-stage interactions and the back-stage processes that produce each moment.

**Mental model:** Experience is one continuous arc, not a set of isolated screens. A journey map layers actions, thoughts, and an emotional curve over a stage timeline, then (in a service blueprint) extends downward through the line of visibility into the back-stage work and support processes that cause each moment.

**Why it exists:** To surface where an end-to-end experience helps or fails a person — emotional peaks and troughs, drop-off points, opportunity moments — so a team aligns on the same cross-channel reality and invests in the moments that matter, rather than optimizing individual screens in isolation.

**What it is NOT:** Not single-interface task decomposition (that is `task-analysis`), and not service/architecture diagramming. Its unit is a person's *moment* — including emotion and context — not a UI step or a service call. A flow stripped of the emotional curve, the cross-channel/time span, and the back-stage layer is a task flow, not a journey map.

**One-line analogy:** Like a film's emotional storyboard rather than a wiring diagram — track how the protagonist feels scene by scene across locations and time, and fix the scenes that lose the audience, not the lighting rig behind them.

## Coverage
Journey mapping covers the family of visualizations that lay out a user's experience as a timeline across stages, actions, thoughts, feelings, and touchpoints. The classic **customer journey map** (Jeff Patton's writing on story mapping is an adjacent influence; NN/g has codified the canonical structure) typically has a horizontal axis of stages (e.g., Awareness → Consideration → Purchase → Onboarding → Use → Renew/Churn) and vertical lanes for what the user is doing, thinking, feeling, and which touchpoint they are interacting with. An **emotional curve** rendered along the timeline highlights peaks and troughs — the "moments of truth" that disproportionately shape the overall impression.

A **service blueprint** (Lynn Shostack, 1984) extends the journey map downward with **front-stage** elements (what the user sees), the **line of visibility**, and **back-stage** elements (what employees, systems, and processes do that the user does not see). Below those, **support processes** show the infrastructure that enables back-stage work. Service blueprints are appropriate when the experience involves human or system handoffs that the user never sees but that determine whether the experience succeeds.

The skill also covers **current-state vs future-state** maps (current documents reality and surfaces pain points; future proposes a redesigned experience and is used to align stakeholders), and the choice of **scope** — a single transaction, an entire lifecycle, or a specific moment-of-truth blown up in detail. Granularity matches the decision the map will inform; a board-level alignment map is coarser than a redesign brief.

## Philosophy of the skill
Journey maps exist because experience is temporal and cross-channel, and most artifacts a team produces are neither. A screen design captures one moment; an architecture diagram captures one cross-section; a backlog captures one project. The journey map is the only artifact that asks "what does the user actually live through, end to end, including the parts that happen on phone calls, in physical mail, in the gap between sessions, and in the moments when they think about us and then put it down?"

The practice resists two failure modes. The first is the **anodyne happy-path map**, where every stage is labeled with a positive verb and the emotional curve is a gentle wave — these maps describe what the team hopes is true rather than what research showed. The second is the **everything-everywhere map**, where ambition outruns research and the map sprouts lanes for every possible channel without evidence. A journey map's credibility comes from being grounded in synthesis output; without that grounding it is decoration.

## Verification
- The map is grounded in specific research evidence — each pain point and emotional trough cites at least one source (interview quote, observation, support log) rather than being asserted.
- Stages on the horizontal axis are named from the user's perspective ("trying to understand what I owe") rather than the business's ("acquisition funnel stage 2").
- The emotional curve has actual lows, not only highs and neutrals — a curve with no dips usually means the map omits the hard parts.
- For service blueprints, the line of visibility is drawn explicitly and the back-stage steps include both human and system actors.
- The map identifies named **opportunity areas** at specific stages, not a generic "improve onboarding" annotation.
- A stakeholder who did not attend the mapping session can read the map and explain back the journey's overall arc, including where it goes wrong.

## Do NOT Use When
- The scope is a single screen or single task within one session — use **task-analysis** for goal-directed step decomposition.
- The team has not yet done qualitative research on the journey — run **user-research** and **research-synthesis** first; an unresearched journey map is fiction.
- The diagram needed is a system architecture, microservice topology, or data flow — those are engineering artifacts, not journey maps.
- The output should be a navigation structure or content taxonomy — use **information-architecture**.
- The task is modeling engineering domain events across bounded contexts — use **event-storming** or **bounded-context-mapping**.
- The team is in solutioning mode and needs to generate concept variants — use **ideation**; journey mapping clarifies experience, it does not invent new ones.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Public: `true`
- Scope: Portable across any product, service, or team. Teaches how to model a person's end-to-end lived experience across touchpoints, channels, and time — the actions, thoughts, and emotional curve front-stage, plus the back-stage processes that produce each moment — so a team aligns on one cross-channel reality and fixes the moments that matter. Not bound to any codebase or tool; applies to any experience being designed, audited, or aligned on.

**When to use**
- Build a journey map for first-time tax filers from awareness through filing to refund.
- Add a service-blueprint layer below this journey map showing the back-stage support steps.
- Identify the emotional low points in this onboarding journey and the opportunities at each.
- Map the cross-channel experience of returning an online order to a physical store.
- Triggers: `journey map`, `service blueprint`, `map the user experience`, `customer journey`, `touchpoints`

**Not for**
- Break down the steps a user takes inside the upload modal.
- Draw the microservice call graph for the checkout API.
- Diagram the database schema for the order entity.

**Related skills**
- Verify with: `user-research`, `research-synthesis`
- Related: `research-synthesis`, `information-architecture`, `design-thinking`, `problem-framing`, `task-analysis`, `bounded-context-mapping`, `event-storming`, `ideation`, `user-research`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A journey map is like a film's emotional storyboard rather than a wiring diagram: it tracks how the protagonist feels scene by scene across locations and time, so you fix the scenes that lose the audience — not the lighting rig behind them.
- Common misconception: |

**Keywords**
- `customer journey map`, `user journey`, `service blueprint`, `touchpoint`, `moments of truth`, `experience map`, `front-stage back-stage`, `emotional curve`, `opportunity areas`, `pain points`

<!-- skill-graph-context:end -->
