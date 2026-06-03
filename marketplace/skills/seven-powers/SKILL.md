---
name: seven-powers
description: "Use when diagnosing whether a business has, can build, or is falsely claiming durable strategic power using Hamilton Helmer's Seven Powers: scale economies, network economies, counter-positioning, switching costs, branding, cornered resource, and process power. Do NOT use for industry-structure analysis alone (use porters-five-forces), integrated strategy-cascade formulation (use playing-to-win), generic prioritization, or surface-level SWOT lists. Covers power as benefit plus barrier, moat-source classification, power progression by company phase, false-positive checks, and strategy implications. Do NOT use for analyze the attractiveness of this industry using entrants, suppliers, buyers, substitutes, and rivalry. Do NOT use for turn this market-entry plan into a winning aspiration, where to play, how to win, capabilities, and systems. Do NOT use for rank these roadmap items by impact and effort. Do NOT use for make a SWOT table for this company."
license: MIT
compatibility: "Markdown, strategy memos, investment diligence, product strategy, market-entry analysis, moat diagnosis"
allowed-tools: Read Grep
metadata:
  last_audited: "2026-05-28"
  lint_verdict: PASS
  schema_version: "8"
  version: "1.0.0"
  subject: reasoning-strategy
  deployment_target: portable
  taxonomy_domain: foundations/strategy
  owner: skill-graph-maintainer
  freshness: "2026-05-26"
  drift_check: "{\"last_verified\":\"2026-05-26\",\"truth_source_hashes\":{\"skills/meta-methods/seven-powers/references/seven-powers-sources.md\":\"79e4fbfeaf37dd1e98ee0946f642fb88722885896537bd8476096fc8232e052f\",\"skills/meta-methods/seven-powers/references/upstream-displacement-2026-05-26.md\":\"c0790ff7d3ec7fa29ebda3c60d5fa0a5c7d5fac4ddb52a0153f1455c31259d60\"}}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: stable
  keywords: "[\"seven powers\",\"7 powers\",\"Hamilton Helmer\",\"strategic power\",\"durable moat\",\"scale economies\",\"network economies\",\"counter-positioning\",\"switching costs\",\"process power\"]"
  examples: "[\"assess whether this startup has a real Seven Powers moat\",\"which of Helmer's powers could apply to this business model?\",\"test if our claimed network effects are actually power\",\"separate branding from ordinary brand awareness in this strategy memo\",\"does this incumbent face counter-positioning from a new entrant?\"]"
  anti_examples: "[\"analyze the attractiveness of this industry using entrants, suppliers, buyers, substitutes, and rivalry\",\"turn this market-entry plan into a winning aspiration, where to play, how to win, capabilities, and systems\",\"rank these roadmap items by impact and effort\",\"make a SWOT table for this company\"]"
  relations: "{\"boundary\":[{\"skill\":\"porters-five-forces\",\"reason\":\"porters-five-forces owns industry-structure and profit-pool pressure; seven-powers owns firm-level durable power sources that can let one company earn persistent differential returns\"},{\"skill\":\"playing-to-win\",\"reason\":\"playing-to-win owns integrated strategy choices across aspiration, arena, advantage, capabilities, and systems; seven-powers owns classifying and testing the specific moat mechanism that may support how-to-win\"}],\"related\":[\"constraint-awareness\",\"framework-fit-analysis\",\"epistemic-grounding\",\"bayesian-reasoning\",\"prioritization\"],\"verify_with\":[\"methodology\",\"epistemic-grounding\"]}"
  grounding: "{\"subject_matter\":\"Hamilton Helmer's Seven Powers strategy framework\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://7powers.com/\",\"https://7powers.com/synopsis/\",\"https://7powers.com/foreword/\",\"skills/meta-methods/seven-powers/references/seven-powers-sources.md\",\"skills/meta-methods/seven-powers/references/upstream-displacement-2026-05-26.md\"],\"failure_modes\":[\"growth_confused_with_power\",\"benefit_without_barrier\",\"barrier_without_customer_value\",\"network_effects_claimed_from_usage_only\",\"brand_awareness_confused_with_branding_power\",\"temporary_execution_edge_confused_with_process_power\",\"industry_attractiveness_confused_with_firm_power\"],\"evidence_priority\":\"general_knowledge_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  mental_model: "Seven Powers treats durable strategy as a specific mechanism that creates both benefit for the business and a barrier against competitors. The seven mechanisms are scale economies, network economies, counter-positioning, switching costs, branding, cornered resource, and process power. A power claim is weak unless it explains why the company benefits and why rivals cannot quickly copy, neutralize, or bid away that benefit."
  purpose: "This skill prevents agents from labeling any attractive business, fast-growing product, or popular feature as having a moat. It replaces vague advantage language with a mechanism test: identify the candidate power, prove the benefit, prove the barrier, check timing and phase, name false positives, and translate the finding into strategy implications."
  boundary: "Seven Powers diagnoses durable firm-level power. It is not Porter's Five Forces industry-structure analysis, Playing to Win strategy-cascade formulation, Blue Ocean value-innovation design, generic competitive positioning, financial valuation, or task prioritization. Those tools can feed or consume the analysis, but this skill owns the moat mechanism."
  analogy: "Seven Powers is a stress test for a bridge: the benefit is the load the bridge can carry, the barrier is why competitors cannot build the same bridge beside it tomorrow, and a claim fails if either side is missing."
  misconception: "The common mistake is treating the seven powers as a checklist of nice business traits. A real power is not just growth, differentiation, brand awareness, loyal users, or operational competence. It must create an economic benefit and a defensible barrier that persists against competitive pressure."
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/seven-powers/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Seven Powers

## Concept Card

**What it is:** Seven Powers is Hamilton Helmer's strategy framework for identifying durable sources of business power: scale economies, network economies, counter-positioning, switching costs, branding, cornered resource, and process power.

**Mental model:** Power is not a compliment. It is a mechanism. A valid power creates a benefit for the company and a barrier that prevents rivals from fully copying, neutralizing, or bidding away that benefit.

**Why it exists:** Agents often call every strong company, growing product, sticky workflow, or differentiated feature a "moat." Seven Powers forces the moat claim to name its source, economic benefit, competitive barrier, timing, and failure mode.

**What it is not:** It is not industry attractiveness, a generic competitor list, a strategy cascade, a financial valuation, or a claim that execution alone is durable power.

**Adjacent concepts:** moat, competitive advantage, strategy statics, power progression, barriers to imitation, value capture, industry structure, where-to-play/how-to-win, switching costs, network effects.

**One-line analogy:** Seven Powers is a lock-and-key test: the benefit is the key that opens economic value, and the barrier is the lock that keeps competitors from using the same key.

**Common misconception:** A company can have a strong product, high growth, or a large market without having power. Growth may reveal an opportunity; it does not by itself prove durable power.

## Coverage

This skill teaches agents to:

1. Name all seven powers accurately.
2. Separate firm-level power from industry attractiveness.
3. Test every power claim for both benefit and barrier.
4. Distinguish real network economies from ordinary user growth.
5. Distinguish branding power from awareness, taste, or short-term marketing.
6. Distinguish process power from ordinary execution competence.
7. Map likely powers to company phase and timing.
8. Translate power diagnosis into strategic implications and evidence requests.

## Philosophy

Seven Powers is useful because it makes competitive advantage falsifiable. A vague moat claim can survive almost any critique: "we have data," "we have brand," "we are better," "we move faster." A power claim has to survive a sharper question: what exact mechanism lets this company earn better economics, and why can competitors not close the gap?

The framework should make an agent slower and stricter. Do not reward a confident-sounding moat story. Look for the economic effect, the barrier, the time horizon, the rival response, and the evidence that would disconfirm the claim.

## Core Equation

Treat a candidate power as valid only when both sides are present.

| Component | Meaning | Fails when |
| --- | --- | --- |
| Benefit | The mechanism improves value, cost, pricing, retention, access, or strategic options for the company. | The trait is interesting but does not improve economics or strategic position. |
| Barrier | Competitors cannot quickly copy, neutralize, or bid away the benefit. | Rivals can buy, imitate, subsidize, hire, integrate, or regulate around it. |
| Persistence | The benefit and barrier hold over the relevant time horizon. | The edge disappears once rivals respond, scale changes, contracts renew, or customers learn. |

If the analysis cannot state the benefit and barrier, report "candidate power, not proven power."

## The Seven Powers

| Power | Mechanism | Valid signal | Common false positive |
| --- | --- | --- | --- |
| Scale economies | Higher volume lowers unit cost or improves economics in ways smaller rivals cannot match. | Large fixed-cost base, learning volume, purchasing leverage, or distribution leverage that creates a cost gap. | "Large market" or "big company" without a cost advantage. |
| Network economies | The product becomes more valuable as more relevant users, participants, data contributors, or complements join. | New participants increase value for existing participants and make rival networks harder to start. | Ordinary growth, social proof, or data accumulation without a defensible network loop. |
| Counter-positioning | A new entrant adopts a superior model that incumbents rationally avoid because copying would damage their existing business. | Incumbent imitation would cannibalize revenue, margins, channels, assets, or incentives. | Any new business model or lower price, even when incumbents can copy without self-harm. |
| Switching costs | Customers face meaningful cost, risk, workflow disruption, data migration, retraining, contract, or compliance burden when leaving. | Retention improves because leaving is costly even when alternatives exist. | Users like the product, forgot to cancel, or have mild habit but can leave cheaply. |
| Branding | Durable perception lets the company command preference or price for an objectively similar offer. | Trust, identity, status, or assurance changes willingness to pay or choice behavior over time. | Awareness, paid acquisition, logo recognition, or current popularity. |
| Cornered resource | Preferential access to a scarce asset, right, talent, relationship, data source, location, license, or capability enhances value. | The resource is valuable, scarce, controlled, and difficult for rivals to obtain on similar terms. | A normal supplier contract, public data, or talent that rivals can hire. |
| Process power | A complex, embedded activity system produces better cost or quality and is hard to replicate quickly. | Advantage comes from accumulated routines, coordination, tacit knowledge, and organizational fit. | "We execute well" or "we have good processes" without a durable, hard-to-copy system. |

## Workflow

### 1. Scope the business and arena

State what business, product, segment, geography, and time horizon you are analyzing.

```text
Business:
Arena:
Stage: origination / takeoff / stability / unclear
Time horizon:
Competitors or substitutes:
Power claim being tested:
```

Do not diagnose power for "the company" in the abstract when the power may apply only to one product, segment, geography, or channel.

### 2. Extract the candidate power claims

List every claim in the source material that sounds like durable advantage.

```text
Claim:
Possible power:
Evidence offered:
Missing evidence:
Immediate false-positive risk:
```

Translate vague claims into the nearest power. For example, "our community grows by itself" might be network economies, "customers never leave" might be switching costs, and "incumbents cannot respond" might be counter-positioning.

### 3. Test benefit and barrier separately

For each candidate power, fill both columns.

| Candidate power | Benefit | Barrier | Verdict |
| --- | --- | --- | --- |
| Scale economies | What cost or economic gap appears at volume? | Why can smaller or richer rivals not match it? | proven / plausible / weak / false positive |
| Network economies | How does each participant increase value for others? | Why is a rival network hard to bootstrap? | proven / plausible / weak / false positive |
| Counter-positioning | Why is the entrant model superior for customers or economics? | What incumbent economics would be damaged by copying it? | proven / plausible / weak / false positive |
| Switching costs | What makes leaving costly or risky? | Why can rivals not make switching painless? | proven / plausible / weak / false positive |
| Branding | How does perception change willingness to pay or choice? | Why can rivals not buy equivalent perception quickly? | proven / plausible / weak / false positive |
| Cornered resource | What scarce resource improves value or economics? | Why can rivals not access it on similar terms? | proven / plausible / weak / false positive |
| Process power | What activity system produces the edge? | Why is replication slow, opaque, or culturally hard? | proven / plausible / weak / false positive |

If either benefit or barrier is missing, the verdict cannot be "proven."

### 4. Check timing and phase

Different powers tend to become available at different moments. Use phase as a diagnostic, not as a rigid rule.

| Phase | Useful question |
| --- | --- |
| Origination | What invention, model, resource, or positioning choice could create power before scale arrives? |
| Takeoff | Is growth creating scale economies, network economies, or switching costs before rivals respond? |
| Stability | Does the company have branding, process power, or other accumulated barriers that keep returns durable? |

Do not assume a startup has process power or branding just because it wants them. Do not assume an incumbent has power just because it is large.

### 5. Rank the power diagnosis

Use four verdicts.

| Verdict | Meaning |
| --- | --- |
| Proven power | Benefit and barrier are both evidenced and tied to durable economics. |
| Plausible candidate | The mechanism could exist, but evidence is incomplete. |
| Weak edge | There is a benefit, but the barrier is weak or temporary. |
| False positive | The claim sounds like power but fails the mechanism test. |

Prefer "plausible candidate" over overclaiming when evidence is thin.

### 6. Translate into strategy implications

End with action, not just classification.

```text
Most likely power:
Confidence:
Evidence that supports it:
Evidence still needed:
Competitor response to watch:
Strategic implication:
What would strengthen the power:
What would weaken or destroy it:
```

Strong implications usually change where the company invests. For example: deepen the network loop, protect the resource, make switching safer for current customers but harder for rivals to dislodge, or avoid a market where no plausible power exists.

## Diagnostic Prompts

Use these prompts to pressure-test common claims.

### Scale Economies

- Which costs decline with cumulative volume or current scale?
- What minimum efficient scale matters in this arena?
- Could a well-funded rival subsidize its way to equivalent scale?
- Does scale improve unit economics, distribution, procurement, data quality, or utilization?

### Network Economies

- Who creates value for whom as the network grows?
- Is the network same-side, cross-side, data-driven, protocol-driven, or complement-driven?
- What makes a cold-start rival hard to bootstrap?
- Are participants multi-homing, and does that weaken the barrier?

### Counter-Positioning

- What incumbent profit pool, asset, channel, metric, culture, or incentive would be harmed by copying?
- Is the entrant model truly superior for a chosen segment?
- Could incumbents respond with a separate brand, acquisition, price cut, or regulation?
- Is the advantage temporary until incumbents accept cannibalization?

### Switching Costs

- What exactly makes switching expensive: data, workflow, integrations, contracts, risk, training, compliance, identity, or relationships?
- Are costs borne by users, buyers, admins, developers, or partners?
- Can a rival automate migration or offer guarantees?
- Are customers retained because of value or trapped despite weak value?

### Branding

- Would customers pay more or choose faster for an objectively similar offering?
- Is the brand tied to trust, identity, status, safety, taste, or assurance?
- How long did the perception take to build?
- Can rivals buy similar awareness, or is the perception historically accumulated?

### Cornered Resource

- What scarce resource is controlled?
- Is control exclusive, preferential, contractual, regulatory, geographic, relational, or capability-based?
- Does the resource independently enhance value or economics?
- Can rivals substitute, bid it away, lobby around it, or develop an alternative?

### Process Power

- What activity system produces lower cost, higher quality, faster cycle time, or superior reliability?
- How much is codified versus tacit?
- How long would a competent rival need to replicate it?
- Is the process embedded across people, tooling, routines, metrics, culture, and suppliers?

## Output Template

```markdown
## Seven Powers Diagnosis

Business and arena:
Time horizon:
Stage:

### Candidate Powers
| Power | Verdict | Benefit | Barrier | Evidence | Missing evidence |
| --- | --- | --- | --- | --- | --- |

### Strongest Claim
- Power:
- Confidence:
- Why it creates benefit:
- Why competitors face a barrier:
- Key false-positive risk:

### Strategy Implications
- Invest in:
- Protect:
- Watch:
- Evidence to collect next:
- What would change the verdict:
```

## Failure Modes

- **Growth confused with power:** Fast adoption may be demand discovery, not defensibility.
- **Benefit without barrier:** The business has an edge, but rivals can copy it.
- **Barrier without benefit:** The company has something hard to copy, but it does not improve economics.
- **Network effects claimed from usage:** More users is not enough; users must increase value for other users or participants.
- **Brand awareness confused with branding power:** Recognition is not the same as durable willingness to pay.
- **Process power claimed too early:** Good execution is not a hard-to-copy activity system.
- **Industry attractiveness confused with firm power:** A good industry can still lack firm-specific power, and a tough industry can contain a powerful firm.

## Boundaries

- Use **Porter's Five Forces** when the question is whether an industry structure lets participants keep profits.
- Use **Playing to Win** when the question is which arena to choose, how to win, what capabilities are required, and what management systems support the choice.
- Use **Seven Powers** when the question is whether the company has or can build a durable moat mechanism.
- Use **expected value** when the question is which action has the best probability-weighted payoff.
- Use **prioritization** when the question is how to rank a queue of work.
- Use **framework-fit-analysis** when the question is which method should be used at all.

## Quality Bar

A good Seven Powers answer:

1. Names the relevant power precisely.
2. Tests benefit and barrier separately.
3. Explains why rival imitation is hard.
4. Labels weak evidence and false positives.
5. Distinguishes company power from industry structure.
6. Connects the diagnosis to strategy implications.
7. Avoids calling every advantage a moat.

## References

- `skills/skills/meta-methods/seven-powers/references/seven-powers-sources.md`
- `skills/skills/meta-methods/seven-powers/references/upstream-displacement-2026-05-26.md`

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Deployment: `portable`
- Domain: `foundations/strategy`

**When to use**
- assess whether this startup has a real Seven Powers moat
- which of Helmer's powers could apply to this business model?
- test if our claimed network effects are actually power
- separate branding from ordinary brand awareness in this strategy memo
- does this incumbent face counter-positioning from a new entrant?

**Not for**
- analyze the attractiveness of this industry using entrants, suppliers, buyers, substitutes, and rivalry
- turn this market-entry plan into a winning aspiration, where to play, how to win, capabilities, and systems
- rank these roadmap items by impact and effort
- make a SWOT table for this company
- Owned by `porters-five-forces`: industry-structure and profit-pool pressure
- Owned by `playing-to-win`: integrated strategy choices across aspiration, arena, advantage, capabilities, and systems

**Related skills**
- Verify with: `methodology`, `epistemic-grounding`
- Related: `constraint-awareness`, `framework-fit-analysis`, `epistemic-grounding`, `bayesian-reasoning`, `prioritization`

**Concept**
- Mental model: Seven Powers treats durable strategy as a specific mechanism that creates both benefit for the business and a barrier against competitors. The seven mechanisms are scale economies, network economies, counter-positioning, switching costs, branding, cornered resource, and process power. A power claim is weak unless it explains why the company benefits and why rivals cannot quickly copy, neutralize, or bid away that benefit.
- Purpose: This skill prevents agents from labeling any attractive business, fast-growing product, or popular feature as having a moat. It replaces vague advantage language with a mechanism test: identify the candidate power, prove the benefit, prove the barrier, check timing and phase, name false positives, and translate the finding into strategy implications.
- Boundary: Seven Powers diagnoses durable firm-level power. It is not Porter's Five Forces industry-structure analysis, Playing to Win strategy-cascade formulation, Blue Ocean value-innovation design, generic competitive positioning, financial valuation, or task prioritization. Those tools can feed or consume the analysis, but this skill owns the moat mechanism.
- Analogy: Seven Powers is a stress test for a bridge: the benefit is the load the bridge can carry, the barrier is why competitors cannot build the same bridge beside it tomorrow, and a claim fails if either side is missing.
- Common misconception: The common mistake is treating the seven powers as a checklist of nice business traits. A real power is not just growth, differentiation, brand awareness, loyal users, or operational competence. It must create an economic benefit and a defensible barrier that persists against competitive pressure.

**Grounding**
- Mode: `universal`
- Truth sources: `https://7powers.com/`, `https://7powers.com/synopsis/`, `https://7powers.com/foreword/`, `skills/meta-methods/seven-powers/references/seven-powers-sources.md`, `skills/meta-methods/seven-powers/references/upstream-displacement-2026-05-26.md`

**Keywords**
- `seven powers`, `7 powers`, `Hamilton Helmer`, `strategic power`, `durable moat`, `scale economies`, `network economies`, `counter-positioning`, `switching costs`, `process power`

<!-- skill-graph-context:end -->
