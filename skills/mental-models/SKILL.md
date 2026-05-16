---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: mental-models
description: "Use when reasoning about how a system, user, or designer's internal model of behavior may diverge from reality — applies across UX, distributed systems, type systems, API design, and team collaboration. Covers the three-model frame (designer / system image / user), the two gulfs (execution and evaluation), analogy and metaphor as model-seeding, the five failure modes (transfer, overgeneralization, underspecification, drift, invariant blindness), the surface/operational/architectural/domain layering, and the discipline of validating a model against the system it claims to represent. Do NOT use for the visual representation of a model (use knowledge-modeling), for the formal-domain entities-attributes-relationships of conceptual modeling (use conceptual-modeling), for cognitive biases in decision-making (out of scope), or for empirically eliciting user models via research methods (use user-research)."
version: 1.0.0
type: capability
category: foundations
domain: foundations/mental-models
scope: reference
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
allowed-tools: Read Grep
keywords:
  - mental models
  - mental model
  - gulf of execution
  - gulf of evaluation
  - user model
  - system model
  - designer model
  - conceptual model
  - metaphor
  - analogy
  - model-system fit
  - hidden invariant
  - model drift
  - shared understanding
  - cognitive tool
triggers:
  - "how do I think about"
  - "users expect X but the system does Y"
  - "this is confusing"
  - "the user's model doesn't match"
  - "why is this surprising"
  - "what's the right metaphor"
examples:
  - "users keep trying to drag a row to reorder but the table doesn't support drag — diagnose the model mismatch"
  - "explain why race conditions across parallel tool calls are hard for developers to anticipate"
  - "decide on the right metaphor for a feature that combines folders and tags"
  - "the team disagrees on what 'workspace' means in the product — surface the divergent mental models"
anti_examples:
  - "draw the boxes-and-arrows diagram of the system (use knowledge-modeling)"
  - "name the React hook for managing form state (tactical implementation choice)"
  - "write user-research interview questions (use user-research)"
  - "teach a junior engineer about distributed-systems consistency models (use teaching-patterns)"
relations:
  related:
    - reasoning
    - conceptual-modeling
    - knowledge-modeling
    - user-research
    - semantics
  boundary:
    - skill: conceptual-modeling
      reason: "conceptual-modeling owns the FORMAL representation of a domain (entities, attributes, relationships) for downstream use by schemas and APIs; this skill owns the COGNITIVE construct (how a mind represents the system), which is upstream of any formalism."
    - skill: knowledge-modeling
      reason: "knowledge-modeling owns the choice of representation paradigm (graphs, frames, rules, networks); this skill owns the discipline of reasoning about model-system fit before any paradigm is chosen."
    - skill: user-research
      reason: "user-research owns the methods for eliciting and validating user mental models empirically; this skill owns the framing of what a mental model is and how to reason about its accuracy."
    - skill: reasoning
      reason: "reasoning is the cognitive primitive of drawing inferences; mental models are the structures over which that reasoning operates. Reasoning uses models; this skill builds and audits them."
  verify_with:
    - user-research
    - reasoning
concept:
  definition: "A mental model is the internal representation a person carries of how a system, domain, or set of relationships behaves — used to predict outcomes, plan actions, and interpret feedback. Mental models are constructed (from experience, instruction, analogy, and inference), private (each mind holds its own), and partial (no model captures the full complexity of its referent). They are the cognitive scaffolding that makes the world tractable; they are also the silent source of most surprise, frustration, and bug-shaped misunderstanding. The discipline of mental-models is the explicit study of how these representations are built, where they diverge from the systems they represent, and how to bring multiple models into alignment when collaborators, users, and systems are working from different ones."
  mental_model: |
    Five primitives structure mental-models reasoning:

    1. **The three-model frame (Norman)**. Any system involves three distinct mental models: the *designer's model* (what the builders intend the system to be), the *system model* or *system image* (what the system actually does, made visible through its interface), and the *user's model* (what the user believes the system does, constructed from the interface and prior experience). Failure happens when these three diverge: the user's model says "this button cancels" but the system model says "this button submits." The interface is the bridge — the only channel by which the designer's model can transfer to the user, and the system image's accuracy depends on how well the interface represents the system.

    2. **The two gulfs (Norman)**. The *gulf of execution* is the distance between what a user wants to do and the actions the system requires. A wide gulf means the user can't figure out how to act; the available controls don't match the action they want to perform. The *gulf of evaluation* is the distance between the system's response and the user's ability to interpret what happened. A wide gulf means the user took an action but doesn't know whether it succeeded. Both gulfs are bridged by surfacing the system's state in a form the user's model can read.

    3. **Model fidelity vs model utility**. A mental model is judged by how well it predicts the relevant behavior, not by how completely it captures the system. A mechanic's model of an engine is high-fidelity for the work of repair; a driver's model is low-fidelity but high-utility for the work of driving. The right model for a role is the smallest model that supports successful action in that role. A model that includes irrelevant complexity costs cognitive load without payoff; a model that omits relevant complexity produces predictable errors.

    4. **Analogy and metaphor as transfer mechanisms**. New mental models are most often built by analogy from existing ones — "a file is like a piece of paper in a folder," "a thread is like a worker that can be paused and resumed." The metaphor seeds the model, then experience refines it. Metaphors that match the target system at the relevant layer of abstraction accelerate model-building; metaphors that match at the wrong layer (folders implying physical containment, when the underlying system uses tag-based grouping) implant predictable misconceptions that are hard to unlearn. The choice of metaphor is a high-leverage design decision.

    5. **Model failure modes**. A constructed model can fail in identifiable ways: *transfer failure* (importing a metaphor whose details don't fit — "git branches are like tree branches" implies a tree structure that git doesn't enforce); *overgeneralization* (a rule that worked in one case is applied beyond its scope — "all dialogs are dismissible by clicking outside" applied to a dialog that isn't); *underspecification* (the model has gaps the user doesn't notice until they hit one — "I can undo everything" until they hit a non-undoable action); *drift* (the model held a year ago no longer matches the system as it now is — caused by feature changes, not model changes); *invariant blindness* (the system has a hidden rule the model doesn't know about — "you can edit this except when another user has a lock"). Each failure mode has a different intervention: transfer failure wants a better metaphor; overgeneralization wants explicit boundary signaling; underspecification wants progressive disclosure; drift wants change communication; invariant blindness wants surfaced constraints.

    The deep insight is that mental models are the *unit of surprise*. When a user says "I didn't expect that," they are reporting a gap between their model and the system. When a developer says "this code is confusing," they are reporting a gap between the reader's reconstructable model and the actual control flow. When a stakeholder says "we mean different things by 'workspace'," they are reporting that two minds hold different models of the same word. Treating "surprise" or "confusion" or "disagreement" as the trace of a model-mismatch — rather than as a user/developer/stakeholder problem — converts a vague complaint into a tractable diagnosis: which model differs, where does it differ, and which intervention closes the gap.

    The complementary insight is that *no one is working from the full picture*. The designer's model is incomplete because the system has emergent behavior the designer didn't anticipate. The system itself is opaque except through its interface. The user's model is built from a fragment of interactions. Every collaborator works from a partial model and treats that partial model as if it were complete. The discipline is to keep this partiality visible: to ask "what does my model assume?" before debugging behavior, to ask "what does the other person's model assume?" before resolving disagreement, and to design interfaces and documentation that make the system's actual model visible enough to repair user models in flight.
  purpose: |
    Mental-models discipline exists because the gap between expected and actual behavior is the most expensive class of error in any product, system, or collaboration. A user who has the wrong model takes the wrong action; a developer who has the wrong model writes the wrong code; a team that holds divergent models ships incompatible decisions. Most "user error" is model error; most "confusing API" is model error; most "miscommunication" is model error. Treating these as failures of attention, intelligence, or communication — rather than as failures of model construction and validation — misroutes the fix.

    The discipline is also the only way to reason about surprise productively. Surprise is information: it tells you that some mind's model has diverged from some part of reality. The naive response is to treat the surprised party as wrong ("the user should have known," "the developer should have read the docs"). The disciplined response is to ask which model diverged from which referent, why, and what intervention closes the gap. The same surprise can have very different causes: a wrong metaphor, a missing constraint, an outdated assumption, a hidden state. Each cause needs a different fix.

    For products, the discipline shapes affordances, signifiers, feedback, and progressive disclosure. A button that looks like a button signals "press me"; an interface that confirms success signals "what you tried worked." Both are model-repair mechanisms wired into the interface. For APIs, the discipline shapes naming, default behavior, error messages, and documentation. A function called `delete()` that actually marks-as-deleted-but-can-be-recovered implants a wrong model; the right name (`softDelete()` or `archive()`) prevents the model error before it forms. For team collaboration, the discipline shapes vocabulary, glossaries, design reviews, and the question "what do we each mean by this word?" surfaced before agreement is presumed.

    For AI agents — building, debugging, and operating in increasingly complex software systems — the discipline matters with particular force. An agent that has the wrong model of a codebase will write the wrong code; an agent that has the wrong model of a user's intent will solve the wrong problem; an agent that imports a metaphor from one framework into another will produce code that compiles but doesn't work. The agent's model is built from training data, from context, and from observation; each of those sources has known divergence modes. The discipline of mental-models, applied to agent work, is the discipline of asking what model the agent is currently operating from, what it would predict, and whether the prediction matches the system.

    Mental-models discipline is, finally, what makes teaching possible. To teach is to install a mental model in another mind; to teach well is to install one that matches the target system at the right level of abstraction, that is robust to the failure modes the learner will encounter, and that can be refined by the learner's experience without breaking. A teacher without mental-models discipline transmits surface facts; a teacher with it transmits the structure that lets the learner generate the right facts themselves.
  boundary: |
    **A mental model is not the system it represents.** This is the discipline's foundational distinction. The system has its own behavior, governed by its own logic. A mental model is a mind's claim about that behavior. Conflating the two ("I expected X, therefore X is the right behavior") produces design that prioritizes the loudest model over the most accurate one. Conflating in the other direction ("the system does X, therefore the user's expectation of Y is wrong") prioritizes the implementation over the people using it. The discipline holds both as separate objects: the system has its truth; each mind has its model of that truth; the gap between them is a designed-or-accident-of-construction.

    **A mental model is not a formal representation.** A diagram, a UML class hierarchy, a database schema, or an ontology is a *formalization* of (some aspect of) a domain. A mental model is the *cognitive construct* in a mind that interprets and uses such formalizations. The diagram on the whiteboard is not the team's mental model — it is at most an artifact that the team's mental models reference. Two engineers can look at the same diagram and walk away with different mental models if their existing conceptual scaffolding differs. The skill `conceptual-modeling` owns the formal-representation side; this skill owns the cognitive-construct side.

    **A mental model is not a user model.** The phrase "user model" in this skill refers to the cognitive construct a *specific person* (user, developer, agent) carries. The phrase "user model" in machine-learning contexts often refers to a *statistical model of a population of users* — a recommender's profile, a personalization vector, a clickthrough predictor. These are unrelated despite the shared phrase. This skill applies only to the cognitive sense.

    **A mental model is not a personality trait.** Sometimes "mental model" is used loosely for "general worldview" or "thinking style." That usage is not this skill's subject. This skill applies to representations of specific systems, domains, or interaction patterns — testable against the system in question, refinable through experience with that system, and held to the standard of fit between model and referent.

    **Mental-models discipline is not the same as user research.** User research empirically elicits the mental models real users hold (think-aloud studies, card sorts, cognitive walkthroughs, contextual inquiry). Mental-models discipline is the conceptual frame that interprets such research findings, plus the design moves that take a known model-system gap and close it. The two compose: user research produces data about mental models; this discipline reasons about what to do with the data.

    **Mental-models discipline is not philosophy of mind.** The discipline does not require committing to any particular theory of how cognition works. It is consistent with the cognitivist tradition (Johnson-Laird 1983), the situated/embodied tradition (Hutchins 1995), the predictive-coding view (Clark 2013), and pragmatic engineering use. The construct "mental model" is a useful abstraction for design and engineering work regardless of the metaphysics underneath.

    **Not all confusion is model failure.** Some confusion is missing information (the user doesn't yet have any model — a first-time encounter). Some is information overload (the user has too much input to construct any stable model). Some is fatigue, distraction, or interruption. The discipline applies when the user has had time to construct a model AND that model is making predictions, AND those predictions are diverging from system behavior. Diagnosing confusion as model failure when it's actually missing-information leads to over-explanation; diagnosing it as missing information when it's actually model failure leads to repetition that doesn't help.
  taxonomy: |
    By model-system relationship:
    - **Mapping correctness** — does the model's structure correspond to the system's actual structure? A model with wrong correspondences produces wrong predictions, even if the user is fluent with the model.
    - **Mapping visibility** — does the system's interface reveal enough of its actual behavior for a user to build a correct model? A correct system with an opaque interface generates wrong user models.
    - **Mapping completeness** — does the model cover the relevant cases the user will encounter? An incomplete model is correct where it applies and silently wrong outside that scope.

    By level of abstraction:
    - **Surface model** — what the user perceives at the interface (buttons, fields, error messages). Built quickly; failures are visible quickly.
    - **Operational model** — how the user thinks the system processes their actions (what gets sent, what gets saved, what gets shown). Built over multiple interactions; failures show up as "but I expected it to..."
    - **Architectural model** — the user's account of how the system is structured internally (clients, servers, databases, queues). Most users don't construct this; developers do, and rely on it for debugging. Wrong architectural models produce surprising bugs.
    - **Domain model** — the user's understanding of the underlying domain the software supports (the difference between revenue and bookings, the relationship between an order and a fulfillment). Built from domain experience; failures here cause the wrong feature to be requested or used.

    By failure mode:
    - **Transfer failure** — a model imported from another system whose details don't apply. Fix: surface the differences explicitly.
    - **Overgeneralization** — a pattern applied beyond its actual scope. Fix: signal boundaries through interface and copy.
    - **Underspecification** — a model with silent gaps. Fix: progressive disclosure of the relevant cases.
    - **Drift** — a model that was once correct but no longer matches the current system. Fix: change communication, in-product updates.
    - **Invariant blindness** — a model that doesn't know about a hidden constraint. Fix: surface the constraint at the moment of relevance.

    By participant:
    - **Designer's model** — what the builders intend.
    - **System image** — what the interface actually conveys.
    - **User's model** — what the user actually believes.

    By teaching mechanism:
    - **Analogy / metaphor** — borrow structure from a familiar domain.
    - **Worked example** — demonstrate the model through a concrete scenario.
    - **Constraint surfacing** — make the system's rules visible at the moment of relevance.
    - **Progressive disclosure** — reveal model layers as the user's role demands them.
    - **Feedback loops** — let the user's prediction be tested against the system's response.

    By artifact type that can implant or repair models:
    - **Naming** (variable names, function names, field labels) — every name is a model fragment.
    - **Defaults** — defaults teach what's expected.
    - **Error messages** — errors are model-repair opportunities or wasted bytes.
    - **Documentation** — explicit model transmission.
    - **Empty states** — what the user sees when there's nothing tells them what they could have.
    - **Affordances and signifiers (Norman, Gibson)** — what the interface invites the user to do, and how it announces those invitations.
  analogy: |
    A map is to a territory what a mental model is to a system.

    Several insights follow from this analogy, all of them load-bearing:

    **The map is not the territory** (Korzybski's foundational distinction). The map shows roads, elevation, and named places — but it omits weather, terrain conditions, current traffic, and a thousand details. A traveler who treats the map as identical to the territory will be surprised the first time the road they planned through doesn't exist anymore. The same applies to mental models: every model is selective, omitting what its purpose doesn't need. The discipline of mental-models is the discipline of asking "what does my map omit that this terrain requires?"

    **A map is useful only at the scale relevant to the journey.** A subway map is a topologically accurate but geographically distorted representation of the city — useful for "which train do I take" and useless for "how far am I walking." A geographic map is the inverse. The right map for a role is the smallest map that supports the action; a model that includes irrelevant complexity is a worse tool than a simpler one, despite being more accurate in some absolute sense.

    **Maps go stale.** The road the map shows was built; the road the territory now has was built later. The map says "open field" where the city now is. Maps require maintenance; the older the map, the more likely some part of it doesn't match the current territory. Mental models drift the same way: the system the developer built a model of a year ago has shipped twenty changes since. The discipline includes refreshing one's model against the current state, not just relying on the one built initially.

    **A map can be wrong without anyone noticing for a long time.** If the map shows a road that doesn't exist, the traveler doesn't discover the error until they go there. Most of a map's errors are silent until the part of the map containing them is queried. The same is true of mental models: the wrong part of the model isn't noticed until the system is asked to do exactly the thing the wrong part predicts. Most model bugs are latent.

    **Different travelers carrying different maps will disagree.** Show two people maps of the same city drawn at different scales, with different conventions, by different cartographers, and they will both confidently make incompatible claims about it. The fix is not to argue about whose claim is right; it is to compare the maps and discover the source of the divergence. Team disagreements about a system are often disagreements about each member's mental model of the system, not about the system itself.

    The analogy also illuminates the role of *the interface*. A territory has no inherent map; a system has no inherent mental model. Both are constructed by minds working from observation. The interface is the cartographer's product placed in the territory itself — a system's interface is the system's attempt to give visitors an accurate map of what's there, drawn at the right scale, refreshed as the territory changes.
  misconception: |
    The most common misconception is that **a mental model is what someone says they think when asked**. It is not. What someone says is a *verbalized reconstruction* of their mental model — filtered through their ability to articulate, biased toward the parts they can put into words, edited in the moment to satisfy the question. The actual mental model is the structure that drives their predictions and actions. Studies of how users describe interfaces vs. how they use them (Carroll & Mack 1985, the "production paradox") show consistent divergence between the spoken model and the operational one. The implication for design and research: observe behavior, not just self-report; observe error patterns, which reveal model fragments the user can't articulate.

    The second misconception is that **the right model is the most complete model**. It is not. The right model is the smallest model that supports successful action in the user's role. A model that contains more than the user needs costs cognitive load without proportional payoff — and is harder to teach, harder to maintain in the user's head, and more likely to break under stress. Designers who try to "fully explain" the system to every user produce documentation no one reads. Designers who pick the right partial model for each role produce interfaces that feel obvious.

    The third misconception is that **users with wrong models are unintelligent or untrained**. They are not. Every user is doing what their model predicts will work; if their model is wrong, the prediction is wrong, but the reasoning is sound *given the model*. The disciplined response to "users keep doing this wrong" is to ask what model would make this the right behavior, then either change the system to match (when the user's model is reasonable) or change the interface to repair the model (when the system's behavior is the better choice). "Train the user harder" is almost always the wrong intervention — the user's model came from somewhere, usually from the interface itself.

    The fourth misconception is that **a metaphor that works at first will keep working**. It will not, necessarily. The "files in folders" metaphor worked when files were singular things stored in one place. It works less well when files are stored in cloud-synced multi-device tag-based shared workspaces. The metaphor's structural correspondence to the system shifted from "high" to "low"; the model the metaphor seeded now produces predictable errors (where is this file *really*; what happens when I delete a folder on one device). Designers must continually ask whether the metaphor still maps; metaphor drift is a leading cause of accumulated user confusion in long-lived products.

    The fifth misconception is that **good naming is sufficient to install the right model**. Naming is necessary but not sufficient. A function named `archive()` invites the user to model it as "moves to a separate location for long-term storage" — but if the actual behavior is "deletes immediately and waits 30 days before purging," the name set up an expectation the system breaks. Naming is one input to model construction; defaults, feedback, error messages, and observed behavior all contribute. Aligning all of them is the discipline; aligning only the names is window-dressing.

    The sixth misconception is that **mental models are individual**, as opposed to also being shared, social, and institutional. They are both. Individual users construct individual models; teams construct shared models through vocabulary and shared artifacts; organizations construct institutional models through documentation, training, and design conventions. A new hire inherits the team's mental model through socialization; a user community develops conventions for how to think about a tool through forums, tutorials, and word-of-mouth. The discipline applies at all scales; the failure modes (drift, transfer failure, invariant blindness) appear at every level.

    The seventh misconception is that **the goal of design is to match the user's existing model**. Sometimes it is — when the user's existing model is well-formed and the system can reasonably be built to fit. Often it is not — when the user's existing model is itself flawed, drawn from a poorer precedent, or unsuited to the new capability being introduced. The disciplined choice between "match the existing model" and "replace it with a better one" depends on the cost of the replacement (Are users willing to relearn? Is the new model better in ways the user will discover?) vs. the cost of matching (Will the system inherit the limitations of the precedent? Will it carry forward the wrong invariants?). Many products that "follow industry conventions" inherit twenty years of dubious decisions encoded in conventions no one has audited.

    The eighth misconception is that **once a user has the right model, they keep it**. They do not, automatically. Models decay: not used, they fade; not refreshed, they drift; not challenged, they overgeneralize. The discipline includes mechanisms to keep models fresh — release notes that explain meaningful changes, prompts that surface new behavior, feedback that confirms or repairs predictions during use. A product that ships a model-shifting change and assumes users will absorb it via a static FAQ has misunderstood how mental models live.
---

# Mental Models

## Coverage

The cognitive discipline of building, evaluating, and aligning the internal representations that minds carry of systems, domains, and interactions. Covers the three-model frame (designer model / system image / user model), the two gulfs (execution and evaluation), the role of analogy and metaphor in seeding new models, the model failure modes (transfer, overgeneralization, underspecification, drift, invariant blindness), the difference between surface, operational, architectural, and domain models, the methods for surfacing and repairing mental models through interface and documentation, and the cross-domain application of mental-models reasoning to UX, distributed systems, type systems, API design, and team collaboration.

## Philosophy

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
| Transferring a known mental model to another person | `teaching-patterns` | teaching-patterns owns the transmission discipline; this skill owns the construction discipline |
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
