---
name: mental-models
description: "Use when reasoning about how a system, user, or designer's internal model of behavior may diverge from reality — applies across UX, distributed systems, type systems, API design, and team collaboration. Covers the three-model frame (designer / system image / user), the two gulfs (execution and evaluation), analogy and metaphor as model-seeding, the five failure modes (transfer, overgeneralization, underspecification, drift, invariant blindness), the surface/operational/architectural/domain layering, and the discipline of validating a model against the system it claims to represent. Do NOT use for the visual representation of a model (use knowledge-modeling), for the formal-domain entities-attributes-relationships of conceptual modeling (use conceptual-modeling), for cognitive biases in decision-making (out of scope), or for empirically eliciting user models via research methods (use user-research). Do NOT use for name the React hook for managing form state (tactical implementation choice)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"conceptual-modeling\",\"semantics\",\"knowledge-modeling\",\"user-research\",\"problem-approach-router\"],\"verify_with\":[\"user-research\",\"second-order-thinking\"]}"
  subject: reasoning-strategy
  scope: "Mental-models reasoning for diagnosing how users, designers, developers, teams, and agents represent a system differently from how it actually behaves. Portable across UX, distributed systems, type systems, API design, and collaboration contexts. Covers the three-model frame, the two gulfs, analogy/metaphor as model-seeding, model failure modes, model depth layers, and validation against system behavior. Excludes formal entity/schema modeling (conceptual-modeling), representation-paradigm choice (knowledge-modeling), empirical research-method design (user-research), cognitive-bias analysis, and tactical implementation choices."
  public: "true"
  taxonomy_domain: foundations/mental-models
  stability: experimental
  keywords: "[\"mental models\",\"mental model\",\"gulf of execution\",\"gulf of evaluation\",\"user model\",\"system model\",\"designer model\",\"conceptual model\",\"metaphor\",\"analogy\"]"
  triggers: "[\"how do I think about\",\"users expect X but the system does Y\",\"this is confusing\",\"the user's model doesn't match\",\"why is this surprising\",\"what's the right metaphor\"]"
  examples: "[\"users keep trying to drag a row to reorder but the table doesn't support drag — diagnose the model mismatch\",\"explain why race conditions across parallel tool calls are hard for developers to anticipate\",\"decide on the right metaphor for a feature that combines folders and tags\",\"the team disagrees on what 'workspace' means in the product — surface the divergent mental models\"]"
  anti_examples: "[\"draw the boxes-and-arrows diagram of the system (use knowledge-modeling)\",\"name the React hook for managing form state (tactical implementation choice)\",\"write user-research interview questions (use user-research)\",\"teach a junior engineer about distributed-systems consistency models\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A mental model is to a system what a map is to a city — the map is not the territory, the map is useful precisely because it is smaller and selective, and a traveler navigating with the wrong map (a city map for a different city, an out-of-date map, a tourist map missing the metro) does not get lost because the map is 'wrong' but because the map's selectiveness does not match the route they need."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/mental-models/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
# Mental Models

## Concept of the skill

Three-model frame (designer's model / system image / user's model) plus the two gulfs (execution: "how do I do what I want to do?" and evaluation: "what did the system actually do?") between them. The interface is the only channel from designer's model to user's model; everything else (intent, internal docs, design rationale) is invisible to the user. Layered on top: five failure modes (transfer, overgeneralization, underspecification, drift, invariant blindness) each with their characteristic intervention; four model layers (surface / operational / architectural / domain) describing different depths of understanding; cross-domain application — UX, distributed systems, type systems, API design, team collaboration all reduce to model-vs-system fit and how to align them.

Replaces "whose fault was that surprise" with "where did the model diverge from the system." Without mental-models discipline, every confusing UX moment, every "user error," every miscommunication, every bug-shaped misunderstanding looks like an isolated incident — and the response is either to train the user or developer harder (rarely works; the model came from somewhere) or to add documentation (rarely read; arrives too late). The discipline replaces blame-finding with diagnosis: which of the three models differs from its referent, where, and which intervention closes the gap. The right model for a role is the smallest model that supports successful action in that role — not the most complete one, not the most accurate one in some absolute sense.

Distinct from conceptual-modeling, which owns the formal representation of a domain (entities, attributes, relationships) for downstream use by schemas and APIs — this skill owns the cognitive construct (how a mind represents the system), upstream of any formalism. Distinct from knowledge-modeling, which owns the choice of representation paradigm (graphs, frames, rules, networks) — this skill owns the discipline of reasoning about model-system fit before any paradigm is chosen. Distinct from user-research, which owns the methods for empirically eliciting and validating mental models (interviews, think-aloud, surveys, contextual inquiry) — this skill owns the framing of what a mental model is and how to reason about its accuracy. Distinct from cognitive-biases work (out of scope) — this skill is about model-system fit, not the systematic decision-making errors a mind exhibits. A mental model is to a system what a map is to a city — the map is not the territory, the map is useful precisely because it is smaller and selective, and a traveler navigating with the wrong map (a city map for a different city, an out-of-date map, a tourist map missing the metro) does not get lost because the map is 'wrong' but because the map's selectiveness does not match the route they need. The wrong mental model is that the user's mental model is the user's fault — that confusion comes from inattention or lack of training, and the response is "train harder" or "add a tooltip." The user's model came from somewhere: usually the interface itself, prior experience with similar systems, the analogy the documentation used. The discipline is to ask which signals seeded the wrong model and how the system image can be made to convey the system's actual model honestly. "The user is holding it wrong" is almost never the right diagnosis; "the interface is teaching the wrong model" almost always is, and the right intervention sits at the interface, not at the user.

## Coverage

The cognitive discipline of building, evaluating, and aligning the internal representations that minds carry of systems, domains, and interactions. Covers the three-model frame (designer model / system image / user model), the two gulfs (execution and evaluation), the role of analogy and metaphor in seeding new models, the model failure modes (transfer, overgeneralization, underspecification, drift, invariant blindness), the difference between surface, operational, architectural, and domain models, the methods for surfacing and repairing mental models through interface and documentation, and the cross-domain application of mental-models reasoning to UX, distributed systems, type systems, API design, and team collaboration.

## Philosophy of the skill
Mental models are how minds make systems tractable. Every user, every developer, every stakeholder operates from a model — partial, private, learned. Most surprise, most "confusing UX," most "miscommunication," most "user error" is the trace of a model-system gap. The disciplined response is to ask which model differs from which referent, where, and which intervention closes the gap — not to ask whose fault the surprise was.

The discipline holds three commitments. First: that the user, the developer, and the system are three distinct sources of truth, each with their own model, none of which is automatically right. Second: that the interface is the bridge through which the system's actual model can become visible enough to repair user models in flight. Third: that the right model for a role is the smallest model that supports successful action in that role — not the most complete model, not the most accurate model in some absolute sense, but the model that does the work and no more.

For agents working in software systems, mental-models discipline is the layer that decides what model to operate from before deciding what code to write. An agent that imports a wrong metaphor — "git branches are tree branches," "React state is OOP state," "a webhook is a function call" — produces code that compiles but doesn't work. The discipline is to make the operating model explicit, to test its predictions against the system, and to surface the gap before it becomes a bug.

## The Three-Model Frame

Norman's foundational distinction. Every system involves three models that may or may not align.

| Model | Held by | Built from | Failure mode when divergent |
|---|---|---|---|
| **Designer's model** | The builders | Intent, specs, internal docs | "I built it this way; why doesn't anyone get it?" — usually the system image fails to convey the designer's model |
| **System image** | The interface itself | Visual design, behavior, copy, feedback | An accurate system that looks wrong, or an inaccurate system that looks reasonable — both confuse users |
| **User's model** | Each user | Interface, prior experience, instruction | User takes actions that match their model but not the system; reports the system as buggy |

The interface is the only channel by which the designer's model can reach the user. If the interface is opaque, inconsistent, or contradicts the system's actual behavior, the user constructs the best model they can from incomplete signals — and that model will be wrong in predictable ways.

## The Two Gulfs

Norman's framework for where model failure shows up.

| Gulf | Question it asks | What widens it | What narrows it |
|---|---|---|---|
| **Gulf of execution** | "How do I do what I want to do?" | Hidden affordances, non-discoverable commands, jargon controls | Direct manipulation, obvious primary action, learned conventions matched correctly |
| **Gulf of evaluation** | "What did the system actually do?" | Silent state changes, no feedback, ambiguous results | Immediate visible feedback, undo, state inspection, clear confirmations |

A wide gulf of execution means the user can't find the right action. A wide gulf of evaluation means they can't tell whether their action succeeded. Both are bridged by surfacing the system's state in a form the user's model can read.

## Model Failure Modes And Their Interventions

| Failure mode | What it looks like | Intervention |
|---|---|---|
| **Transfer failure** | User applies a model from another system whose details don't fit ("I tried to drag this row to reorder, like every other table") | Surface the difference explicitly: tooltip, copy, signifier change. Or implement the expected behavior. |
| **Overgeneralization** | A pattern that worked in one context applied beyond its scope ("I tried to click outside the dialog to dismiss; it was a modal that requires explicit choice") | Signal boundaries: visual cues, copy that names the constraint, behavioral signals |
| **Underspecification** | The user has a model that's silent on the case they hit ("I assumed undo would work everywhere; this action wasn't undoable") | Progressive disclosure of the relevant constraint at the moment of relevance, not in advance |
| **Drift** | A model that was once correct but no longer matches ("I learned this workflow last year; it has three new steps now") | Change communication: in-product release notes, prompts on first encounter with changed behavior, removal of stale documentation |
| **Invariant blindness** | The system has a rule the user doesn't know about ("you can edit this except when another user has it locked, and the lock isn't visible") | Surface the invariant at the moment of relevance: lock indicator, error message that names the rule, preflight check |

The right intervention depends on the right diagnosis. "Train the user harder" is almost never correct — the user's model came from somewhere, usually from the interface or precedent.

## Metaphor As Model-Seeding

A new mental model is most often constructed by analogy from an existing one. The chosen metaphor has long downstream effects.

| Metaphor | What it seeds | What it costs |
|---|---|---|
| File ⟶ paper-in-folder | Discrete unit; in one place; can be moved | Implies physical containment that cloud-sync, multi-tag, and shared-link systems violate |
| Email folder ⟶ filing cabinet | Mutually exclusive categories | Doesn't fit messages that belong in multiple buckets — tags model fits better |
| Web page ⟶ printed document | Static, paginated, top-to-bottom | Doesn't fit dynamic, interactive, scrollable, infinite-content pages |
| API call ⟶ function call | Synchronous, single-machine, return-immediately | Hides network failure, latency, retries, partial failure |
| Thread ⟶ worker | Independent unit; pauseable | Doesn't surface the shared-memory failure modes that cause actual concurrency bugs |
| Database transaction ⟶ all-or-nothing | Strong atomicity | Doesn't fit weaker isolation levels (Read Committed, etc.); see `transaction-isolation` |

Choosing a metaphor commits the designer to surfacing the points where it breaks down. The metaphor is useful precisely because of its match; it is dangerous precisely because of its mismatches.

## Applying The Discipline

| Domain | Question to ask |
|---|---|
| **Designing a feature** | What's the user's model now? What model do we want them to have? What's the smallest interface change that bridges the two? |
| **Naming a function or API** | What model does this name imply? Does the function actually behave that way? If not, rename or change behavior. |
| **Writing an error message** | What model fragment caused this error? What model would prevent it? Can the error message implant the corrective model? |
| **Onboarding a new user** | What metaphor will we seed? Will it still fit in 6 months when the user is fluent? |
| **Resolving team disagreement** | Are we disagreeing about the system, or about each member's model of the system? Compare models before debating decisions. |
| **Debugging a confusing codebase** | What model would make this code obvious? Why doesn't the code communicate that model? |
| **Working with an agent on a codebase** | What model is the agent operating from? What would it predict about this code? Does the prediction match reality? |
| **Architecting a distributed system** | What is the designer's model of consistency? What will the system actually exhibit? What's in the system image (logs, dashboards, error semantics) that lets operators build the right operational model? |

## Verification

After applying this skill, verify:
- [ ] The system being designed, debugged, or discussed has the three models (designer / image / user) named separately, not conflated into a single "the system."
- [ ] When the user surprises you, the diagnosis identifies which failure mode (transfer / overgeneralization / underspecification / drift / invariant blindness) is operating before any intervention is chosen.
- [ ] When you choose a metaphor, you have explicitly listed at least one place it breaks down and how the interface will signal that breakdown.
- [ ] When the team disagrees, you have asked whether the disagreement is about the system or about the models of the system, and you have surfaced the divergent models before adjudicating.
- [ ] The model targeted for users is the smallest one that supports their role, not the most complete one that explains the implementation.
- [ ] Interfaces, error messages, naming, and defaults are aligned (not all five elements implying contradictory models).
- [ ] When you ship a model-shifting change, you have a mechanism to refresh user models (in-product notification, onboarding update, release note that explains the new model — not just the new behavior).
- [ ] If you are an agent working in an unfamiliar codebase, you have named the model you are currently operating from and tested at least one prediction against the system before producing substantial code.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Building a formal representation (entities, attributes, schemas) | `conceptual-modeling` | conceptual-modeling owns formal-domain representation; mental-models owns the cognitive layer above any formalism |
| Choosing between graphs, frames, rules as a knowledge representation paradigm | `knowledge-modeling` | knowledge-modeling owns paradigm selection; mental-models is upstream of paradigm choice |
| Empirically eliciting user mental models through research methods | `user-research` | user-research owns the elicitation methods; this skill owns the conceptual frame the methods serve |
| Transferring a known mental model to another person | Out of scope | This skill owns diagnosing and aligning model-system fit, not instructional delivery or curriculum design |
| Reasoning about specific cognitive biases (anchoring, framing, recency) | (no direct skill — out of scope) | The cognitive-bias literature is its own discipline; this skill focuses on system-model representation rather than decision-making bias |
| Choosing the React hook for a state-management decision | `state-management` + library docs | Tactical implementation choice; this skill is the upstream framing |
| The drawing or notation of a model | diagramming tools / `knowledge-modeling` | The artifact is not the model; this skill applies to the cognitive structure, not its visual representation |

## Key Sources

- Norman, D. A. (1983). "Some Observations on Mental Models." In Gentner, D. & Stevens, A. L. (Eds.), *Mental Models* (pp. 7–14). Lawrence Erlbaum. The foundational designer's-model / system-image / user's-model framing, and the gulfs of execution and evaluation.
- Norman, D. A. (2013). *The Design of Everyday Things* (Revised and Expanded Edition). Basic Books. The most accessible exposition of mental-models discipline applied to interface design; the three-model frame and the gulfs are presented in operational form.
- Johnson-Laird, P. N. (1983). *Mental Models: Towards a Cognitive Science of Language, Inference, and Consciousness*. Harvard University Press. The canonical cognitive-science treatment of mental models as the internal structures over which reasoning operates.
- Gentner, D., & Stevens, A. L. (Eds.). (1983). *Mental Models*. Lawrence Erlbaum. The collection that established the modern study of mental models across multiple domains (physics, calculators, navigation).
- Senge, P. M. (1990). *The Fifth Discipline: The Art and Practice of the Learning Organization*. Doubleday. The application of mental-models discipline to organizational thinking, with emphasis on surfacing assumptions and challenging "the way things are."
- Hutchins, E. (1995). *Cognition in the Wild*. MIT Press. The situated-cognition account: mental models are not purely internal but distributed across people, artifacts, and environments.
- Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux. Adjacent treatment of the System 1 / System 2 distinction, which intersects with how mental models are constructed (fast, pattern-matched) and challenged (slow, deliberate).
- Carroll, J. M., & Mack, R. L. (1985). "Metaphor, computing systems, and active learning." *International Journal of Man-Machine Studies, 22*(1), 39–57. Foundational work on the role of metaphor in seeding mental models of computing systems, and on the production paradox (what users say vs what they do).
- Korzybski, A. (1933). *Science and Sanity: An Introduction to Non-Aristotelian Systems and General Semantics*. Institute of General Semantics. The origin of "the map is not the territory" — the foundational distinction between representation and represented.
- Clark, A. (2013). "Whatever next? Predictive brains, situated agents, and the future of cognitive science." *Behavioral and Brain Sciences, 36*(3), 181–204. The predictive-coding view, which reframes mental models as prior expectations the brain continuously tests against incoming evidence.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/mental-models`
- Scope: Mental-models reasoning for diagnosing how users, designers, developers, teams, and agents represent a system differently from how it actually behaves. Portable across UX, distributed systems, type systems, API design, and collaboration contexts. Covers the three-model frame, the two gulfs, analogy/metaphor as model-seeding, model failure modes, model depth layers, and validation against system behavior. Excludes formal entity/schema modeling (conceptual-modeling), representation-paradigm choice (knowledge-modeling), empirical research-method design (user-research), cognitive-bias analysis, and tactical implementation choices.

**When to use**
- users keep trying to drag a row to reorder but the table doesn't support drag — diagnose the model mismatch
- explain why race conditions across parallel tool calls are hard for developers to anticipate
- decide on the right metaphor for a feature that combines folders and tags
- the team disagrees on what 'workspace' means in the product — surface the divergent mental models
- Triggers: `how do I think about`, `users expect X but the system does Y`, `this is confusing`, `the user's model doesn't match`, `why is this surprising`, `what's the right metaphor`

**Not for**
- draw the boxes-and-arrows diagram of the system (use knowledge-modeling)
- name the React hook for managing form state (tactical implementation choice)
- write user-research interview questions (use user-research)
- teach a junior engineer about distributed-systems consistency models

**Related skills**
- Verify with: `user-research`, `second-order-thinking`
- Related: `conceptual-modeling`, `semantics`, `knowledge-modeling`, `user-research`, `problem-approach-router`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A mental model is to a system what a map is to a city — the map is not the territory, the map is useful precisely because it is smaller and selective, and a traveler navigating with the wrong map (a city map for a different city, an out-of-date map, a tourist map missing the metro) does not get lost because the map is 'wrong' but because the map's selectiveness does not match the route they need.
- Common misconception: |

**Keywords**
- `mental models`, `mental model`, `gulf of execution`, `gulf of evaluation`, `user model`, `system model`, `designer model`, `conceptual model`, `metaphor`, `analogy`

<!-- skill-graph-context:end -->
