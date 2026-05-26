---
name: inversion
description: "Use when a goal, plan, design, strategy, or assumption should be examined by reversing it: ask how to guarantee failure, how the opposite could be true, or what would have to happen for the desired outcome not to occur. Covers objective reversal, failure-path enumeration, obstacle-first planning, opposite-hypothesis testing, and prevention design. Do NOT use for decomposing a problem to irreducible premises (use first-principles-thinking), post-failure root-cause analysis (use debugging), recurring failure clustering (use pattern-recognition), or claim/source grounding (use epistemic-grounding). Do NOT use for Break this pricing model down to irreducible assumptions. Do NOT use for This incident already happened; find the root cause. Do NOT use for Score every webhook failure mode with severity, occurrence, and detectability. Do NOT use for Facilitate a team pre-mortem session with independent written generation."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: "7"
  version: "1.0.0"
  type: capability
  category: foundations
  subject: meta-methods
  operation: decide
  domain: foundations/reasoning
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-21"
  drift_check: "{\"last_verified\":\"2026-05-21\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"inversion thinking\",\"invert the goal\",\"reverse the problem\",\"failure path\",\"opposite hypothesis\",\"obstacle first\",\"what would make this fail\",\"avoid failure\",\"anti-goal\",\"reverse reasoning\"]"
  triggers: "[\"invert this plan\",\"how could this fail\",\"what would guarantee failure\",\"reason from the opposite\",\"avoid the worst outcome\"]"
  examples: "[\"We want activation to improve. Invert the goal and identify what would make users abandon onboarding.\",\"Before we commit to this launch plan, ask how it could fail and what safeguards follow.\",\"Test the opposite hypothesis: what if the metric increase is actually bad?\",\"What actions would guarantee this project misses the deadline?\"]"
  anti_examples: "[\"Break this pricing model down to irreducible assumptions.\",\"This incident already happened; find the root cause.\",\"Score every webhook failure mode with severity, occurrence, and detectability.\",\"Facilitate a team pre-mortem session with independent written generation.\"]"
  relations: "{\"related\":[\"first-principles-thinking\",\"epistemic-grounding\",\"pattern-recognition\",\"debugging\"],\"verify_with\":[\"epistemic-grounding\",\"first-principles-thinking\"]}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Inversion is like checking a bridge design by asking where it would snap first, not because you want it to snap, but because that is where reinforcement matters."
  misconception: "|"
  portability: "{\"readiness\":\"declared\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/meta-methods/inversion/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

## Concept Card

**What it is:** Inversion is a reasoning technique that examines a desired outcome by reversing it: ask how to cause failure, how the opposite claim could be true, or what would prevent the goal from happening.

**Mental model:** A plan has a success path and a failure surface. Forward reasoning maps the success path. Inversion maps the failure surface first, then turns that map into safeguards, tests, and constraints.

**Why it exists:** People over-plan the route to success and under-plan the ways they can sabotage it. Inversion makes hidden blockers, perverse incentives, ignored constraints, and false assumptions easier to see.

**What it is NOT:** It is not cynicism, not post-incident debugging, not first-principles decomposition, not FMEA scoring, and not the full facilitated pre-mortem protocol.

**Adjacent concepts:** first-principles thinking, pre-mortem, FMEA, debugging, epistemic grounding, pattern recognition.

**One-line analogy:** Inversion is stress-testing a plan by first drawing the map of how it breaks.

**Common misconception:** The trap is treating inversion as "be negative." The point is not to dwell on failure; the point is to convert failure paths into prevention.

# Inversion

## Coverage

Inversion covers the deliberate reversal of goals, claims, plans, and designs. It includes goal inversion, opposite-hypothesis testing, obstacle-first planning, anti-goal definition, failure-path enumeration, success-sabotage analysis, and conversion of inverted findings into concrete safeguards.

Use this skill when the question sounds like:

- "How could this fail?"
- "What would make the opposite true?"
- "What should we avoid doing?"
- "What would guarantee this project misses?"
- "How might this metric improvement backfire?"

## Philosophy

Forward reasoning is naturally attractive because it aligns with desire: define the goal, list actions, execute. That shape is useful, but it hides the negative space. Many plans fail because of one avoidable blocker, one untested assumption, one incentive that rewards the wrong behavior, or one condition that would have been obvious if the team had asked how to lose.

Inversion is a compact antidote. It does not replace planning; it improves planning by forcing the plan to survive its own opposite. If the inverted analysis produces no changes, either the plan is unusually robust or the inversion was too generic.

Good inversion ends in action. A list of scary possibilities is not the deliverable. The deliverable is a changed plan, sharper test, added guardrail, removed anti-pattern, or explicit accepted risk.

## The Workflow

### 1. State the forward goal or claim

Name the target precisely. Vague goals produce generic failure lists.

Bad frame: "Make the product better."

Better frame: "Increase first-week activation without increasing support burden."

### 2. Invert the target

Choose the inversion that fits the task.

| Forward target | Inverted prompt |
|---|---|
| Achieve goal X | What would guarantee not-X? |
| Prove claim X | What would make X false? |
| Improve metric X | How could improving X harm the real goal? |
| Ship plan X | How would this plan fail, stall, or cause damage? |
| Avoid risk X | What behaviors would make X more likely? |

### 3. Enumerate failure paths without filtering

List specific causes, not broad categories.

Weak: "Bad communication."

Strong: "The owner changes the API contract but the integration test still mocks the old response, so the failure ships."

Look for:

- ignored constraints
- stale assumptions
- perverse incentives
- missing feedback loops
- hidden dependencies
- success metrics that can be gamed
- irreversible steps
- delayed detection
- human attention limits

### 4. Convert each failure path into a control

Every material failure path needs one of these outcomes.

| Failure-path outcome | Use when |
|---|---|
| Prevent | The cause can be removed before execution. |
| Detect | The cause cannot be removed but can be caught early. |
| Buffer | The cause can happen, but impact can be reduced. |
| Rehearse | The team needs practice or a rollback drill. |
| Accept | The risk is real but intentionally tolerated. |
| Redesign | The failure path is structural and invalidates the plan. |

### 5. Re-run the forward plan

Apply the controls and restate the plan. If the plan still depends on avoiding obvious failure paths by luck, it is not ready.

## Inversion Patterns

### Anti-goal inversion

Ask: "If we wanted the worst plausible result, what would we do?"

Useful for behavior design, operations, and product workflows. The answer exposes what to forbid, monitor, or design away.

### Opposite-hypothesis inversion

Ask: "What evidence would make the opposite conclusion true?"

Useful for strategy, research, metrics, and arguments. This prevents a favored hypothesis from becoming unfalsifiable.

### Metric inversion

Ask: "How could this metric improve while the real system gets worse?"

Useful when optimizing engagement, conversion, productivity, quality scores, or model evals. The answer exposes Goodhart risk and proxy misuse.

### Constraint inversion

Ask: "Which constraint, if violated, would break the whole plan?"

Useful for architecture, launches, compliance, and reliability. The answer identifies load-bearing assumptions.

## Anti-Patterns

| Anti-pattern | What it looks like | Correction |
|---|---|---|
| Generic risk list | "Scope creep, communication, quality" | Rewrite each as a concrete causal path. |
| Negativity without conversion | A long list of scary outcomes | Convert each material path into prevent, detect, buffer, rehearse, accept, or redesign. |
| Catastrophe-only thinking | Only naming extreme failures | Include mundane ways plans really fail: delays, ambiguity, incentives, handoffs. |
| One-sided inversion | Asking only "how could it fail?" for a claim | Also ask what evidence would make the opposite true. |
| Over-owning FMEA | Trying to score every component's S/O/D values | Use FMEA when component-level enumeration and scoring is required. |
| Post-hoc inversion | Applying inversion after the failure as if it were RCA | Use debugging or postmortem methods after the failure has occurred. |
| No plan update | Treating the inverted list as the final artifact | Update the forward plan or decision. |

## Verification

After applying this skill, verify:

- [ ] The forward goal or claim is specific.
- [ ] The inversion prompt matches the target type.
- [ ] Failure paths are concrete causal paths, not generic categories.
- [ ] The list includes mundane and high-consequence failures.
- [ ] At least one opposite-hypothesis or metric-backfire check was considered when claims or metrics are involved.
- [ ] Every material failure path maps to prevent, detect, buffer, rehearse, accept, or redesign.
- [ ] The forward plan, claim, or design changed or the accepted-risk rationale is explicit.
- [ ] The output does not pretend inversion is a post-failure root-cause method.

## Do NOT Use When

| Use instead | When |
|---|---|
| `first-principles-thinking` | You need to decompose a problem to irreducible premises and rebuild from fundamentals. |
| `debugging` or `problem-locating-solving` | A failure already occurred and you need root-cause isolation. |
| `pattern-recognition` | You need to cluster repeated failures into a recurring pattern and build prevention. |
| `epistemic-grounding` | You need to test whether a claim is sourced, warranted, and qualified. |
| Dedicated FMEA process | You need component-level failure-mode enumeration with severity, occurrence, detectability, and RPN scoring. |
| Dedicated pre-mortem facilitation | You need a team exercise with assumed future failure and independent written generation. |

## Key Sources

- Carl Jacobi is widely associated with the maxim "invert, always invert" in mathematical problem solving; the practical lesson is to transform hard forward problems into easier reverse ones.
- Charlie Munger popularized inversion as a general decision-making mental model: identify what would produce failure, then avoid it.
- Karl Popper's falsification frame supports opposite-hypothesis testing: a claim becomes stronger when the conditions that would refute it are made explicit.
- Gary Klein's pre-mortem method applies a group-process version of inversion by assuming future failure and reasoning backward to causes.
- Reliability methods such as FMEA are adjacent formalizations: they convert possible failure modes into prioritized mitigation work.
