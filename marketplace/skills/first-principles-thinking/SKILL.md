---
name: first-principles-thinking
description: "Use when a problem is trapped inside inherited assumptions, copied convention, analogy, or local optimization and needs to be rebuilt from irreducible premises. Covers decomposition to primitives, assumption stripping, primitive tests, reconstruction from constraints, derivation chains, and reality checks. Do NOT use for root-cause analysis of an observed failure (use debugging or problem-locating-solving), formal argument grounding (use epistemic-grounding), domain entity modeling (use conceptual-modeling), or recurring issue clustering (use pattern-recognition). Do NOT use for This incident happened yesterday. Find the root cause. Do NOT use for Update the probability after new evidence arrives. Do NOT use for Score these options by expected monetary value. Do NOT use for Imagine this plan failed and list why."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"pattern-recognition\",\"debugging\",\"mental-models\",\"epistemic-grounding\",\"conceptual-modeling\"],\"verify_with\":[\"epistemic-grounding\",\"conceptual-modeling\"]}"
  subject: reasoning-strategy
  public: "true"
  scope: "Use when a problem is trapped inside inherited assumptions, copied convention, analogy, or local optimization and needs to be rebuilt from irreducible premises. Covers decomposition to primitives, assumption stripping, primitive tests, reconstruction from constraints, derivation chains, and reality checks. Do NOT use for root-cause analysis of an observed failure (use debugging or problem-locating-solving), formal argument grounding (use epistemic-grounding), domain entity modeling (use conceptual-modeling), or recurring issue clustering (use pattern-recognition)."
  taxonomy_domain: foundations/reasoning
  stability: experimental
  keywords: "[\"first principles thinking\",\"first principle\",\"irreducible premise\",\"assumption stripping\",\"rebuild from fundamentals\",\"primitive constraints\",\"axiomatic reasoning\",\"inherited assumptions\",\"reasoning from basics\",\"ab initio reasoning\"]"
  triggers: "[\"reason from first principles\",\"rebuild this from fundamentals\",\"strip the assumptions\",\"what are the primitive truths here\",\"stop reasoning by analogy\"]"
  examples: "[\"We keep copying the old pricing model. Rebuild the problem from first principles.\",\"This architecture decision is full of assumptions. What facts and constraints are actually irreducible?\",\"Everyone says this workflow needs five steps, but why? Strip it to fundamentals.\",\"The analogy to competitors is misleading. Derive the design from user needs and constraints instead.\"]"
  anti_examples: "[\"This incident happened yesterday. Find the root cause.\",\"Update the probability after new evidence arrives.\",\"Score these options by expected monetary value.\",\"Imagine this plan failed and list why.\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "First-principles thinking is like dismantling a machine to its load-bearing parts, discarding decorative casing and copied attachments, then rebuilding only the mechanism that the physics of the problem requires."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/first-principles-thinking/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
## Concept Card

**What it is:** First-principles thinking is a reasoning discipline that breaks a problem down to propositions, definitions, constraints, and values that cannot be derived from deeper premises inside the relevant domain, then rebuilds a solution from those primitives.

**Mental model:** Treat every accepted belief as a candidate, not a foundation. Sort candidates into observed facts, definitions, constraints, conventions, analogies, preferences, and derived claims. Keep only the load-bearing primitives, then derive the answer upward with explicit warrants.

**Why it exists:** It prevents inherited assumptions from masquerading as laws. Many bad solutions persist because a team copied a pattern, optimized a proxy, or accepted an old constraint without asking whether it was still load-bearing.

**What it is NOT:** It is not root-cause analysis after a failure, not inversion, not Bayesian updating, not expected-value scoring, and not an excuse to discard useful prior art.

**Adjacent concepts:** epistemic-grounding, Toulmin argument, DSRP systems thinking, conceptual modeling, inversion, Bayesian reasoning, expected value.

**One-line analogy:** It is dismantling a problem to the structural beams, then rebuilding only what those beams can actually support.

**Common misconception:** The trap is thinking "from scratch" means "ignore history." History is evidence; first principles decide whether that evidence represents a primitive, a derived claim, or a stale convention.

# First-Principles Thinking

## Concept of the skill

First-principles thinking has three primitives: candidate beliefs, primitive premises, and derived conclusions. Candidate beliefs are everything currently accepted in the problem frame: facts, rules, conventions, analogies, preferences, constraints, and proxy metrics. Primitive premises are the subset that cannot be derived from another premise inside the relevant domain and that survives evidence, definition, or constraint tests. Derived conclusions are rebuilt from those primitives through explicit inference steps. The method moves downward from inherited belief to irreducible premise, then upward from premise to design, decision, or explanation.

Replaces reasoning by inheritance with reasoning by construction. Without it, teams copy existing solutions, argue from analogy, preserve outdated constraints, and optimize around proxy rules whose original purpose has been forgotten. First-principles thinking strips those inherited layers away until only load-bearing facts, definitions, laws, constraints, and values remain; then it rebuilds a solution that is justified by those primitives rather than by precedent.

Distinct from root-cause analysis, which starts after an observed failure and asks what caused that failure; first-principles thinking can be used before anything fails, when the problem frame itself may be wrong. Distinct from inversion, which asks what would make the goal fail; first-principles thinking asks what must be true before any solution is valid. Distinct from Bayesian reasoning, which updates belief weights after evidence; first-principles thinking identifies the premises whose truth or falsity should be weighted. Distinct from expected-value reasoning, which compares options once the option space exists; first-principles thinking may reveal that the inherited option space is wrong. First-principles thinking is like dismantling a machine to its load-bearing parts, discarding decorative casing and copied attachments, then rebuilding only the mechanism that the physics of the problem requires. The common misconception is that first-principles thinking means ignoring all prior work. It does not. Prior work is useful evidence and can supply candidate premises, but it is not automatically foundational. The test is whether a belief is derivable, contingent, negotiable, or merely conventional. A copied rule may survive as a primitive if it encodes a real constraint; it fails if it is only inherited habit.

## Coverage

First-principles thinking covers the reasoning move from inherited problem frame to load-bearing primitives and back to a justified conclusion. It includes assumption inventory, primitive classification, irreducibility tests, premise validation, derivation-chain reconstruction, constraint checks, and anti-pattern detection when precedent, analogy, or local optimization has displaced the real problem.

Use this skill when the question sounds like:

- "Why are we assuming this has to work that way?"
- "What is actually true underneath the copied pattern?"
- "If we could not use the old solution, what would the problem require?"
- "Which constraints are real, and which are inherited habit?"

## Philosophy of the skill
First-principles thinking is useful because many constraints are second-hand. A rule that began as a physical limit, legal requirement, customer need, or economic fact can degrade into ritual after the environment changes. Once that happens, teams optimize inside a false box.

The discipline is not skepticism for its own sake. It is controlled reduction followed by reconstruction. The reduction phase prevents stale assumptions from entering as axioms. The reconstruction phase prevents analysis paralysis by requiring every conclusion to climb back from the primitives it retained.

The quality bar is not originality. A first-principles answer may converge on the conventional answer. The difference is that the answer is now justified by primitives rather than copied from precedent.

## The Workflow

### 1. Frame the exact question

State the decision, design problem, or explanation being sought. A vague prompt creates vague primitives.

Bad frame: "Rethink onboarding."

Better frame: "What is the smallest set of steps a new user must complete before they experience the product's core value?"

### 2. Inventory current beliefs

List every belief currently shaping the answer:

| Belief type | Test question |
|---|---|
| Observed fact | What was directly measured or seen? |
| Definition | What does the term mean by contract? |
| Constraint | What cannot be changed without violating physics, law, safety, time, money, or human limits? |
| Value | What are we choosing to optimize? |
| Convention | What are we doing because others do it this way? |
| Analogy | What outside system are we importing a model from? |
| Derived claim | What conclusion depends on earlier premises? |

Do not discard anything in this phase. The goal is visibility.

### 3. Strip inherited assumptions

For each belief, ask:

1. What would make this false?
2. Is this directly observed, defined, or required, or is it inferred?
3. If it is inferred, what premise supports it?
4. If it is a convention, what problem did the convention originally solve?
5. If it is an analogy, where does the analogy break?

A belief survives this step only if it is primitive for the problem or if its derivation is made explicit.

### 4. Test candidate primitives

Use these tests before declaring anything foundational.

| Test | Pass condition | Failure signal |
|---|---|---|
| Irreducibility | It cannot be derived from a deeper premise in scope | It starts with "because we usually..." |
| Evidence | It is observed, measured, defined, or otherwise grounded | It is asserted from habit or authority only |
| Scope | It holds for this problem, not just for a similar one | It depends on an imported analogy |
| Necessity | Removing it makes the solution invalid | Removing it only makes the solution unfamiliar |
| Stability | It will not flip under ordinary variation | It depends on a temporary implementation detail |

### 5. Rebuild upward

Construct the answer as a derivation chain:

```text
Primitive 1 + Primitive 2 -> Derived conclusion A
Derived conclusion A + Primitive 3 -> Design requirement B
Design requirement B + Constraint C -> Candidate solution
```

Every conclusion must point back to the primitives that support it. If a conclusion cannot be derived, either add a missing primitive with evidence or remove the conclusion.

### 6. Reconcile with reality

First-principles reasoning can be internally clean and externally wrong if the primitives were incomplete. Before acting, check:

- Which primitives are empirical and need measurement?
- Which primitives are definitions and need stakeholder agreement?
- Which primitives are constraints and need expert verification?
- Which derived conclusions are brittle if one primitive changes?
- Which conventional solution did the derivation recover, and why?

## Primitive Types

| Primitive | Meaning | Example |
|---|---|---|
| Physical law | Cannot be violated by any design | Latency cannot be lower than propagation and processing time combined. |
| Mathematical identity | True by definition or proof | Profit equals revenue minus costs under the chosen definition. |
| Human constraint | Stable limit of human attention, memory, time, or behavior | A user cannot compare twenty dense options accurately under time pressure. |
| Economic constraint | Resource tradeoff that cannot be wished away | Storage, review time, and support load all have opportunity costs. |
| Legal or policy constraint | Binding rule from outside the design space | A required disclosure must be present before action. |
| Definition | Meaning chosen by the system or domain | "Active user" must be defined before optimizing activation. |
| Value premise | What the decision optimizes | Reliability over novelty, speed over completeness, or reversibility over throughput. |

Value premises are legitimate primitives, but only after being named honestly. Hiding a value premise inside a "fact" is a reasoning bug.

## Common Applications

### Product design

Start with the user's job, attention budget, risk, and required trust. Do not start with competitor screens or inherited flows. Rebuild the flow from the minimum sequence needed for the user to make progress safely.

### Technical architecture

Start with invariants, failure modes, latency budgets, data ownership, reversibility, and operational constraints. Do not start with a fashionable architecture label. Rebuild boundaries from what must remain true when components fail or scale.

### Strategy

Start with customer value, constraints, distribution reality, margins, and capability asymmetries. Do not start with category norms. Rebuild the strategy from what must be true for the system to win.

### Skill and documentation authoring

Start with what behavior the reader must perform differently after reading. Do not start with a table of contents copied from neighboring artifacts. Rebuild the document from primitives: trigger, boundary, mental model, procedure, verification.

## Anti-Patterns

| Anti-pattern | What it looks like | Correction |
|---|---|---|
| Physics cosplay | Treating social, product, or business claims as universal laws | Mark value and behavior premises as contingent and testable. |
| Premature axiom | "This is a requirement" with no evidence | Ask what happens if it is removed and who or what enforces it. |
| Analogy lock-in | "This is like X, so we should do Y" | Identify where the analogy breaks before deriving conclusions. |
| Abstraction escape | Staying so abstract that no decision changes | Rebuild upward until the conclusion constrains action. |
| Destructive skepticism | Discarding every prior belief and never rebuilding | Treat prior work as evidence, not authority or trash. |
| Proxy primitive | Optimizing a metric as if it were the goal | Name the value the proxy is supposed to represent. |
| Hidden value claim | Presenting a preference as an objective fact | Separate facts from values before deriving the answer. |

## Verification

After applying this skill, verify:

- [ ] The exact question was framed before decomposition.
- [ ] Current beliefs were inventoried before anything was discarded.
- [ ] Candidate primitives are classified as facts, definitions, constraints, or values.
- [ ] Inherited conventions and analogies were tested rather than accepted.
- [ ] Every retained primitive passed irreducibility, evidence, scope, necessity, and stability checks.
- [ ] The answer was rebuilt upward through explicit derivation steps.
- [ ] Empirical primitives have a measurement plan or evidence source.
- [ ] Value premises are named as values, not disguised as facts.
- [ ] The final answer constrains action; it is not merely an abstract restatement.

## Do NOT Use When

| Use instead | When |
|---|---|
| `debugging` or `problem-locating-solving` | You have an observed failure and need root-cause isolation. |
| `epistemic-grounding` | You need to prove that a claim is sourced, qualified, and warranted. |
| `conceptual-modeling` | You need to model domain entities, attributes, relationships, identity, and cardinality. |
| `pattern-recognition` | You need to cluster repeated issues and turn recurrence into prevention. |
| Dedicated inversion reasoning | You need to reverse the goal and ask how the plan could fail. |
| Dedicated Bayesian or expected-value reasoning | You need to update probabilities or compare options by probability-weighted payoff. |

## Key Sources

- Aristotle's *Metaphysics* frames wisdom as concern with primary causes and starting-points, and treats the principle of non-contradiction as a fundamental axiom of reasoning.
- Aristotle's *Physics* opening, as summarized in public reference sources, describes inquiry as moving from what is clearer to us toward what is clearer by nature, seeking first principles, causes, and elements.
- Euclidean and formal-logical traditions treat axioms, postulates, definitions, and primitive notions as starting points from which further propositions are derived.
- Descartes' method of doubt and foundationalism show the destructive-then-constructive pattern: remove doubtful inherited beliefs, then rebuild from clearer foundations.
- In physics and chemistry, ab initio or first-principles methods start from established laws rather than empirical fitting parameters; that usage is a narrow scientific cousin, not the whole reasoning skill.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/reasoning`
- Scope: Use when a problem is trapped inside inherited assumptions, copied convention, analogy, or local optimization and needs to be rebuilt from irreducible premises. Covers decomposition to primitives, assumption stripping, primitive tests, reconstruction from constraints, derivation chains, and reality checks. Do NOT use for root-cause analysis of an observed failure (use debugging or problem-locating-solving), formal argument grounding (use epistemic-grounding), domain entity modeling (use conceptual-modeling), or recurring issue clustering (use pattern-recognition).

**When to use**
- We keep copying the old pricing model. Rebuild the problem from first principles.
- This architecture decision is full of assumptions. What facts and constraints are actually irreducible?
- Everyone says this workflow needs five steps, but why? Strip it to fundamentals.
- The analogy to competitors is misleading. Derive the design from user needs and constraints instead.
- Triggers: `reason from first principles`, `rebuild this from fundamentals`, `strip the assumptions`, `what are the primitive truths here`, `stop reasoning by analogy`

**Not for**
- This incident happened yesterday. Find the root cause.
- Update the probability after new evidence arrives.
- Score these options by expected monetary value.
- Imagine this plan failed and list why.

**Related skills**
- Verify with: `epistemic-grounding`, `conceptual-modeling`
- Related: `pattern-recognition`, `debugging`, `mental-models`, `epistemic-grounding`, `conceptual-modeling`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: First-principles thinking is like dismantling a machine to its load-bearing parts, discarding decorative casing and copied attachments, then rebuilding only the mechanism that the physics of the problem requires.
- Common misconception: |

**Keywords**
- `first principles thinking`, `first principle`, `irreducible premise`, `assumption stripping`, `rebuild from fundamentals`, `primitive constraints`, `axiomatic reasoning`, `inherited assumptions`, `reasoning from basics`, `ab initio reasoning`

<!-- skill-graph-context:end -->
