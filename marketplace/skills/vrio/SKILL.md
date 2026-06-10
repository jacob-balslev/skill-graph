---
name: vrio
description: "Use when evaluating whether a firm's resources or capabilities can create sustained competitive advantage with VRIO: Valuable, Rare, costly to Imitate, and Organized to capture value. Covers resource/capability inventory, sequential VRIO testing, competitive implication classification, inimitability mechanisms, organization gaps, investment/protection priorities, and handoff to broader strategy methods. Do NOT use for external industry profit-pressure diagnosis (use porters-five-forces), generic internal/external factor inventory (use swot-tows), durable moat-source taxonomy (use seven-powers), portfolio allocation (use bcg-matrix), product-market growth paths (use ansoff-matrix), or quantified option valuation (use expected-value). Do NOT use for Analyze buyer power, supplier power, substitutes, entrants, and rivalry for this industry. Do NOT use for Turn strengths, weaknesses, opportunities, and threats into TOWS strategy options."
license: MIT
compatibility: "Markdown, strategic analysis, resource-based view analysis, capability audits, competitive advantage reviews, strategy memos"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"playing-to-win\",\"blue-ocean-strategy\",\"swot-tows\",\"porters-five-forces\",\"seven-powers\",\"bcg-matrix\",\"ansoff-matrix\",\"expected-value\",\"epistemic-grounding\",\"methodology\"],\"suppresses\":[\"porters-five-forces\",\"seven-powers\",\"expected-value\",\"swot-tows\",\"bcg-matrix\",\"ansoff-matrix\"],\"verify_with\":[\"epistemic-grounding\",\"methodology\",\"expected-value\"]}"
  subject: reasoning-strategy
  scope: "VRIO resource-based competitive-advantage analysis for organizations, business units, products, programs, teams, and acquisition targets: inventory resources and capabilities, test each one sequentially for value, rarity, cost of imitation, and organizational support, map the competitive implication from disadvantage through sustained advantage, identify inimitability mechanisms and organization gaps, decide what to invest in, protect, build, partner for, or stop over-claiming, and route to broader strategy, industry, portfolio, or valuation methods when the resource test is not enough. Excludes external industry profit-pressure diagnosis, generic SWOT/TOWS factor inventory, Seven Powers moat-source classification, BCG portfolio allocation, Ansoff product-market growth paths, OKR execution tracking, and standalone financial valuation."
  public: "true"
  taxonomy_domain: foundations/strategy
  stability: stable
  keywords: "[\"VRIO\",\"VRIO framework\",\"resource-based view\",\"value rarity imitation cost organization\",\"culture moat\",\"valuable rare inimitable organized\",\"sustained competitive advantage\",\"strategic resources\",\"capabilities audit\",\"costly to imitate\"]"
  triggers: "[\"vrio\",\"vrio-framework\",\"resource-based-view\",\"resource-capability-audit\"]"
  examples: "[\"Use VRIO to assess whether our brand, data assets, partnerships, and operating process are real competitive advantages.\",\"Build a VRIO table for these capabilities and classify which are parity, temporary advantage, or sustained advantage.\",\"Review this claim that our culture is a moat using value, rarity, imitation cost, and organization.\",\"Evaluate an acquisition target's resources with the resource-based view and tell me which advantages are durable.\",\"Help me separate ordinary strengths from resources that are valuable, rare, costly to imitate, and supported by the organization.\"]"
  anti_examples: "[\"Analyze buyer power, supplier power, substitutes, entrants, and rivalry for this industry.\",\"Turn strengths, weaknesses, opportunities, and threats into TOWS strategy options.\",\"Classify this company's moat using scale economies, switching costs, network economies, branding, counter-positioning, cornered resource, or process power.\",\"Classify our products as stars, cash cows, question marks, or dogs.\",\"Classify growth ideas as market penetration, market development, product development, or diversification.\"]"
  grounding: "{\"subject_matter\":\"VRIO and resource-based view analysis as a portable strategy framework for assessing resources and capabilities\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://journals.sagepub.com/doi/10.1177/014920639101700108\",\"https://journals.aom.org/doi/10.5465/ame.1995.9512032192\",\"https://jaybarney.org/wp-content/uploads/2022/06/6-Looking-Inside-for-Competitive-Advantage-Barney-AOME-1995.pdf\",\"skills/skills/reasoning-strategy/vrio/references/vrio-sources.md\",\"skills/skills/reasoning-strategy/vrio/references/upstream-displacement-2026-06-06.md\"],\"failure_modes\":[\"ordinary_strength_mislabeled_as_sustained_advantage\",\"resource_or_capability_left_undefined\",\"value_test_not_tied_to_opportunities_or_threats\",\"rarity_asserted_without_competitor_comparison\",\"inimitability_claim_made_without_mechanism\",\"organization_gap_ignored\",\"vrio_confused_with_external_industry_analysis\",\"moat_taxonomy_confused_with_resource_level_test\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "VRIO is a sequential resource test. The primitives are an actor, a defined resource or capability, a relevant competitive context, the value test, the rarity test, the cost-of-imitation test, the organization-to-capture-value test, competitive implication, evidence, and action. A resource that is not valuable creates disadvantage; one that is valuable but common creates parity; one that is valuable and rare but easy to imitate creates temporary advantage; one that is valuable, rare, and costly to imitate but not supported by the organization is under-exploited; one that passes all four tests can support sustained competitive advantage."
  purpose: "This skill prevents agents from treating every strength, asset, capability, brand claim, data set, process, culture, or partnership as a moat. It forces the agent to define the resource precisely, prove it matters, compare competitor access, explain why imitation is costly, test whether the organization captures the value, and state the competitive implication and next action."
  concept_boundary: "VRIO is for internal resources and capabilities. It is not Porter's Five Forces industry-structure analysis, SWOT/TOWS factor inventory, Seven Powers moat-source taxonomy, BCG portfolio allocation, Ansoff growth direction, PESTEL macro scanning, OKR execution management, or financial valuation. Those methods may feed or follow VRIO, but they do not replace the sequential resource test."
  analogy: "VRIO is like a security checkpoint for claimed advantages: each resource must clear value, rarity, imitation cost, and organizational support before it can be treated as durable."
  misconception: "The common mistake is treating VRIO as a list of flattering strengths. VRIO is a falsification test: a no at any stage changes the competitive implication and usually changes the recommended action."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/vrio/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

## Concept of the skill

**What it is:** VRIO is a resource-based strategy framework for testing whether a resource or capability can support sustained competitive advantage. The four tests are Valuable, Rare, costly to Imitate, and Organized to capture value.

**Mental model:** Define one resource or capability, then test it in order. Value comes first; rarity only matters after value; inimitability only matters after rarity; organization determines whether the firm can actually capture the potential advantage.

**Why it exists:** Agents often call ordinary strengths "moats." This skill forces evidence for value, scarcity, imitation cost, and organizational support before treating a resource as durable advantage.

**What it is NOT:** It is not Five Forces, SWOT/TOWS, Seven Powers, BCG, Ansoff, PESTEL, OKRs, or a valuation model.

**Adjacent concepts:** resource-based view, VRIN, strategic resources, capabilities, core competencies, social complexity, causal ambiguity, path dependence, competitive parity, temporary advantage, sustained advantage.

**One-line analogy:** VRIO is a four-gate test that a claimed advantage must pass before it earns protection or investment priority.

**Common misconception:** The four letters are not four independent checklist items. They are sequential filters; the first failed filter determines the competitive implication and the next action.

# VRIO

## Domain Context

Use VRIO for strategy reviews, capability audits, competitive-advantage claims, product or business-unit strategy, acquisition diligence, resource allocation discussions, and critiques of existing "moat" arguments. Use public, aggregate, or synthetic examples only. Do not include personal data, customer data, payment data, secrets, confidential deal details, or private business facts in examples or evals.

VRIO is strongest when the user is evaluating specific resources or capabilities the organization controls or may acquire: brand, proprietary data, patents, know-how, operating routines, culture, supplier relationships, distribution access, installed base, process capabilities, talent systems, regulatory permissions, or bundled capabilities. It is weaker when the user's question is about industry attractiveness, macro forces, product-market growth direction, portfolio allocation, execution tracking, or a quantified financial decision.

Treat "resource" broadly but precisely. A useful VRIO analysis names the resource or capability at the right level of specificity. "Data" is usually too vague; "exclusive longitudinal transaction data linked to renewal outcomes and embedded in the pricing workflow" is testable.

## Coverage

This skill teaches agents to:

1. Define the resource or capability being tested.
2. Apply the VRIO tests sequentially: value, rarity, imitation cost, organization.
3. Translate test results into competitive implications: disadvantage, parity, temporary advantage, under-exploited advantage, or sustained advantage.
4. Explain inimitability mechanisms such as path dependence, causal ambiguity, social complexity, legal protection, time compression diseconomies, and resource bundles.
5. Detect organization gaps that prevent value capture.
6. Distinguish resource-level advantage analysis from industry analysis, moat-source taxonomy, portfolio allocation, growth-path classification, and factor inventory.
7. Produce investment, protection, development, partner, acquire, or de-prioritization recommendations without over-claiming durability.
8. State assumptions, evidence gaps, and follow-on methods needed before committing capital or strategy.

## Philosophy of the skill

VRIO is useful because strategy conversations reward confident labels: "our brand is a moat," "our data is unique," "our culture cannot be copied." Those claims are cheap. A resource-based view analysis makes them earn their keep.

The method is intentionally unforgiving. A resource must be valuable before rarity matters. It must be rare before imitation cost matters. It must be costly to imitate before organizational support can turn it into sustained advantage. A good VRIO output is therefore not a praise sheet. It is a disciplined advantage audit that separates parity resources from temporary advantages, under-exploited strengths, and resources worth protecting or building strategy around.

## Workflow

### 1. Frame the resource question

Start by naming the actor, resource, and competitive context.

```text
Actor:
Resource or capability:
Resource boundary:
Competitive context:
Rivals or substitutes:
Opportunity or threat addressed:
Evidence available:
Decision this analysis must inform:
```

Reject broad labels such as "brand," "people," "data," "AI," "culture," or "platform" unless the user explicitly wants a first-pass inventory. Narrow the resource until the value, rarity, imitation, and organization tests can be answered with evidence.

### 2. Inventory candidate resources and capabilities

Use VRIO after a resource inventory, not before one. Candidate resources can include tangible assets, intangible assets, organizational capabilities, relationships, routines, knowledge, culture, access rights, and bundled systems.

For each candidate, record:

```text
Resource:
Type: tangible / intangible / capability / relationship / bundle
Owner or location:
Where it affects cost, revenue, speed, quality, risk, learning, access, or differentiation:
Competitors with similar resources:
Evidence quality:
```

Do not analyze a whole company as "VRIO." Analyze resources and capabilities one by one, then summarize the portfolio of advantages.

### 3. Apply the VRIO tests in order

| Test | Question | Evidence to request | Common failure |
| --- | --- | --- | --- |
| Valuable | Does the resource let the actor exploit an opportunity or neutralize a threat, improve willingness to pay, reduce cost, reduce risk, increase speed, improve quality, or unlock strategic options? | customer outcomes, cost curves, revenue effect, margin effect, risk reduction, speed, quality, strategic fit | calling a resource valuable because it is liked internally |
| Rare | Is the resource controlled by few current or potential competitors in the relevant context? | competitor benchmarks, access constraints, ownership, scarcity, adoption data, exclusivity | claiming rarity without naming the comparison set |
| Costly to imitate | Would competitors face high cost, time, uncertainty, coordination burden, legal barrier, or social complexity to replicate or substitute the resource? | history, build time, tacit knowledge, patents, contracts, causal ambiguity, culture, network depth, bundle complexity | saying "hard to copy" without a mechanism |
| Organized | Is the actor structured, staffed, incentivized, governed, measured, and equipped to capture the value? | operating model, incentives, processes, systems, governance, sales motion, talent, decision rights | ignoring a resource that exists but is not exploited |

Stop at the first no when stating the competitive implication. You can still note later uncertainties, but the first failed gate controls the current classification.

### 4. Classify the competitive implication

| Valuable | Rare | Costly to imitate | Organized | Competitive implication | Typical action |
| --- | --- | --- | --- | --- | --- |
| No | Any | Any | Any | Competitive disadvantage or irrelevant resource | Stop investing, repurpose, fix value, or remove the claim |
| Yes | No | Any | Any | Competitive parity | Operate efficiently; do not overpay or over-claim |
| Yes | Yes | No | Usually yes | Temporary competitive advantage | Exploit quickly, improve, bundle, or expect imitation |
| Yes | Yes | Yes | No | Unused or under-exploited competitive advantage | Fix organization, incentives, systems, governance, or go-to-market |
| Yes | Yes | Yes | Yes | Sustained competitive advantage candidate | Protect, deepen, build strategy around it, and monitor erosion |

"Sustained" means competitors cannot quickly duplicate the benefits under current conditions. It does not mean permanent. Reassess as markets, technology, regulation, and competitor capabilities change.

### 5. Explain why imitation is costly

Do not accept "not copyable" without a mechanism. Use these explanations when evidence supports them:

| Mechanism | What it means | Evidence pattern |
| --- | --- | --- |
| Path dependence | The resource was built through a history competitors cannot replay quickly | years of accumulated learning, installed base, reputation, data history, relationships |
| Causal ambiguity | Competitors cannot tell exactly which resource or bundle causes the performance gap | performance depends on interacting routines, data, culture, process, and tacit knowledge |
| Social complexity | The resource depends on relationships, trust, norms, culture, or coordination that cannot be bought as a component | employee/customer/supplier relationships, routines, shared norms, high coordination burden |
| Legal or contractual protection | Rights restrict imitation for a period | patents, licenses, permits, exclusive contracts, regulatory approvals |
| Time compression diseconomies | Compressing the build time raises cost or reduces quality | learning curves, training, trust, data accumulation, brand formation |
| Resource bundling | The advantage comes from a system of resources rather than one asset | integrated data, workflow, brand, talent, distribution, and operating model |

If the mechanism is weak, classify the advantage as temporary or uncertain rather than durable.

### 6. Test organization to capture value

The organization test is not a footnote. A valuable, rare, hard-to-imitate resource can fail commercially if the actor is not organized to use it.

Check:

- Does the operating model put the resource where decisions are made?
- Do incentives reward using and protecting it?
- Do systems and processes let the resource scale?
- Does the sales, support, or delivery motion convert it into customer value?
- Are governance, compliance, and decision rights clear?
- Is the resource funded and staffed?
- Is there a metric that detects whether the resource is actually producing advantage?

When the "O" is weak, recommend organization fixes before claiming a sustained advantage.

### 7. Route to follow-on work

VRIO is an input to strategy work, not the whole strategy.

| Remaining question | Next method |
| --- | --- |
| What industry forces shape returns around this resource? | Porter's Five Forces |
| Which internal/external factors create options around this resource? | SWOT/TOWS |
| Which durable power category best describes the advantage source? | Seven Powers |
| How should the resource shape winning aspiration, where to play, how to win, capabilities, and systems? | Playing to Win |
| Which portfolio unit should receive resources? | BCG Matrix |
| Which growth path should use this resource? | Ansoff Matrix |
| Which option has the best probability-weighted payoff? | Expected Value |

## Review Tests

Use these checks before accepting a VRIO output:

| Question | Pass signal | Fail signal |
| --- | --- | --- |
| Is the resource or capability named precisely? | A competitor could understand what must be copied | The resource is a vague noun such as "brand" or "data" |
| Is value tied to an opportunity, threat, cost, revenue, risk, speed, quality, or option? | Concrete mechanism and evidence | Internal pride or generic importance |
| Is rarity benchmarked against a relevant competitor set? | Named comparison set and scarcity evidence | "Unique" asserted without comparison |
| Is inimitability explained by a mechanism? | Path dependence, causal ambiguity, social complexity, legal protection, time compression, or bundle complexity | "Hard to copy" asserted alone |
| Is organization tested separately? | Processes, incentives, systems, governance, and metrics are reviewed | The resource exists but value capture is assumed |
| Is the competitive implication qualified? | Disadvantage, parity, temporary advantage, under-exploited advantage, or sustained advantage candidate | Every positive resource is called a moat |

## Output Formats

For a compact answer:

```text
Resource or capability:
Competitive context:

| Resource | Valuable? | Rare? | Costly to imitate? | Organized? | Competitive implication | Evidence gap | Action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| | | | | | | | |

Summary:
Resources to protect:
Resources to organize better:
Resources that are only parity:
Recommended next analysis:
```

For a review of a claimed advantage:

```text
Claim reviewed:
Resource boundary:
Value evidence:
Rarity evidence:
Imitation-cost mechanism:
Organization evidence:
Current competitive implication:
Weakest gate:
Over-claim risk:
Required correction:
Next method:
```

## Quality Checks

- The resource or capability is defined at a testable level of specificity.
- Value is tied to external opportunity, threat, customer value, cost, risk, quality, speed, or option creation.
- Rarity is assessed relative to a named competitor or substitute set.
- Inimitability names a mechanism and evidence.
- Organization is tested through operating model, incentives, systems, governance, staffing, and metrics.
- The first failed VRIO test controls the competitive implication.
- Sustained advantage is presented as a candidate or hypothesis unless supported by strong evidence.
- The output does not replace Five Forces, SWOT/TOWS, Seven Powers, BCG, Ansoff, or Expected Value when those mechanisms own the remaining question.
- Examples remain synthetic, public, or aggregate and avoid private business data.

## Verification

After applying this skill, verify:

- [ ] The task matches the declared scope, coverage, or positive examples.
- [ ] The response follows this skill's workflow or checks instead of generic advice.
- [ ] The exclusions in `## Do NOT Use When` do not point to a better skill.

## Do NOT Use When
Use another method when the user's actual question is:

| User need | Use instead |
| --- | --- |
| Diagnose buyer power, supplier power, entrants, substitutes, and rivalry | Porter's Five Forces |
| Turn strengths, weaknesses, opportunities, and threats into options | SWOT/TOWS |
| Classify durable moat sources such as scale economies, switching costs, network economies, branding, cornered resource, counter-positioning, or process power | Seven Powers |
| Allocate resources across portfolio units by market growth and relative market share | BCG Matrix |
| Classify growth options by existing/new products and existing/new markets | Ansoff Matrix |
| Scan political, economic, social, technological, environmental, and legal forces | PESTEL |
| Build an integrated strategy cascade | Playing to Win |
| Compare probability-weighted value or quantified payoff | Expected Value |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/strategy`
- Scope: VRIO resource-based competitive-advantage analysis for organizations, business units, products, programs, teams, and acquisition targets: inventory resources and capabilities, test each one sequentially for value, rarity, cost of imitation, and organizational support, map the competitive implication from disadvantage through sustained advantage, identify inimitability mechanisms and organization gaps, decide what to invest in, protect, build, partner for, or stop over-claiming, and route to broader strategy, industry, portfolio, or valuation methods when the resource test is not enough. Excludes external industry profit-pressure diagnosis, generic SWOT/TOWS factor inventory, Seven Powers moat-source classification, BCG portfolio allocation, Ansoff product-market growth paths, OKR execution tracking, and standalone financial valuation.

**When to use**
- Use VRIO to assess whether our brand, data assets, partnerships, and operating process are real competitive advantages.
- Build a VRIO table for these capabilities and classify which are parity, temporary advantage, or sustained advantage.
- Review this claim that our culture is a moat using value, rarity, imitation cost, and organization.
- Evaluate an acquisition target's resources with the resource-based view and tell me which advantages are durable.
- Help me separate ordinary strengths from resources that are valuable, rare, costly to imitate, and supported by the organization.
- Triggers: `vrio`, `vrio-framework`, `resource-based-view`, `resource-capability-audit`

**Not for**
- Analyze buyer power, supplier power, substitutes, entrants, and rivalry for this industry.
- Turn strengths, weaknesses, opportunities, and threats into TOWS strategy options.
- Classify this company's moat using scale economies, switching costs, network economies, branding, counter-positioning, cornered resource, or process power.
- Classify our products as stars, cash cows, question marks, or dogs.
- Classify growth ideas as market penetration, market development, product development, or diversification.

**Related skills**
- Verify with: `epistemic-grounding`, `methodology`, `expected-value`
- Related: `playing-to-win`, `blue-ocean-strategy`, `swot-tows`, `porters-five-forces`, `seven-powers`, `bcg-matrix`, `ansoff-matrix`, `expected-value`, `epistemic-grounding`, `methodology`

**Concept**
- Mental model: VRIO is a sequential resource test. The primitives are an actor, a defined resource or capability, a relevant competitive context, the value test, the rarity test, the cost-of-imitation test, the organization-to-capture-value test, competitive implication, evidence, and action. A resource that is not valuable creates disadvantage; one that is valuable but common creates parity; one that is valuable and rare but easy to imitate creates temporary advantage; one that is valuable, rare, and costly to imitate but not supported by the organization is under-exploited; one that passes all four tests can support sustained competitive advantage.
- Purpose: This skill prevents agents from treating every strength, asset, capability, brand claim, data set, process, culture, or partnership as a moat. It forces the agent to define the resource precisely, prove it matters, compare competitor access, explain why imitation is costly, test whether the organization captures the value, and state the competitive implication and next action.
- Analogy: VRIO is like a security checkpoint for claimed advantages: each resource must clear value, rarity, imitation cost, and organizational support before it can be treated as durable.
- Common misconception: The common mistake is treating VRIO as a list of flattering strengths. VRIO is a falsification test: a no at any stage changes the competitive implication and usually changes the recommended action.

**Grounding**
- Mode: `universal`
- Truth sources: `https://journals.sagepub.com/doi/10.1177/014920639101700108`, `https://journals.aom.org/doi/10.5465/ame.1995.9512032192`, `https://jaybarney.org/wp-content/uploads/2022/06/6-Looking-Inside-for-Competitive-Advantage-Barney-AOME-1995.pdf`, `skills/skills/reasoning-strategy/vrio/references/vrio-sources.md`, `skills/skills/reasoning-strategy/vrio/references/upstream-displacement-2026-06-06.md`

**Keywords**
- `VRIO`, `VRIO framework`, `resource-based view`, `value rarity imitation cost organization`, `culture moat`, `valuable rare inimitable organized`, `sustained competitive advantage`, `strategic resources`, `capabilities audit`, `costly to imitate`

<!-- skill-graph-context:end -->
