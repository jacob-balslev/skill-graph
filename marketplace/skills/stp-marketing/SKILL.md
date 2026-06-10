---
name: stp-marketing
description: "Use when building, reviewing, or repairing an STP marketing strategy: segmentation, targeting, and positioning as one linked sequence from market definition to segment profiles, target selection, positioning statement, and marketing-mix implications. Covers consumer, B2B, nonprofit, and product-led contexts; segment bases; segment attractiveness; fit; primary/secondary targets; differentiated versus concentrated targeting; perceptual maps; positioning statements; evidence gaps; and handoff to campaign, product, pricing, channel, or sales work. Do NOT use for standalone product positioning/category design without segmentation and target choice (use positioning), macro-environment scanning (use pestel), industry profit-pressure diagnosis (use porters-five-forces), value-curve redesign/new-demand creation (use blue-ocean-strategy), product-market growth-path selection (use ansoff-matrix), or tactical marketing-mix design alone."
license: MIT
compatibility: "Markdown, marketing strategy, product strategy, go-to-market planning, campaign briefs, market research synthesis, nonprofit program planning"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"positioning\",\"pestel\",\"porters-five-forces\",\"blue-ocean-strategy\",\"swot-tows\",\"ansoff-matrix\",\"expected-value\",\"research-synthesis\",\"user-research\"],\"suppresses\":[\"positioning\",\"pestel\",\"porters-five-forces\",\"blue-ocean-strategy\",\"ansoff-matrix\"],\"verify_with\":[\"research-synthesis\",\"epistemic-grounding\",\"positioning\"]}"
  subject: reasoning-strategy
  scope: "STP marketing strategy for products, services, programs, brands, and go-to-market plans: define the relevant market; segment buyers or users using behavior, need, demographic, geographic, psychographic, firmographic, account, job-to-be-done, or usage bases; test whether segments are measurable, substantial, accessible, differentiable or responsive, actionable, and privacy-safe; evaluate segment attractiveness, strategic fit, economics, growth, competitive intensity, reachability, and mission/objective fit; choose primary and optional secondary target segments; decide whether to use undifferentiated, differentiated, concentrated, micromarket, or account-based targeting; create a positioning statement for the chosen target and competitive frame; translate positioning into marketing-mix, product, channel, sales, and messaging implications; and state evidence gaps and validation needs. Excludes standalone positioning/category design without segmentation and target selection, broad macro-environment scanning, industry-structure analysis, value-curve/new-demand design, execution OKRs, and tactical channel/copy work as the primary task."
  public: "true"
  taxonomy_domain: foundations/marketing
  stability: stable
  keywords: "[\"STP marketing\",\"segmentation targeting positioning\",\"market segmentation\",\"target market selection\",\"target audience strategy\",\"positioning statement\",\"perceptual map\",\"differentiated marketing\",\"niche targeting\",\"go-to-market segmentation\"]"
  triggers: "[\"stp marketing\",\"stp strategy\",\"stp-marketing\",\"segmentation-targeting-positioning\",\"stp-analysis\",\"target-market-selection\"]"
  examples: "[\"Use STP marketing to choose which customer segment this product should focus on and how to position it.\",\"Build a segmentation, targeting, and positioning strategy for this B2B service.\",\"Review this STP analysis and tell me whether the target segment actually follows from the segmentation.\",\"We have three possible customer segments. Which one should be our primary target and what positioning statement follows?\",\"Turn this market research summary into segment profiles, target choice, and positioning implications.\",\"Create a minimum useful STP marketing analysis for a nonprofit program launch without inventing segment facts.\"]"
  anti_examples: "[\"Help me choose the market category and value themes for an existing product against spreadsheets and BI tools.\",\"Scan political, economic, social, technological, environmental, and legal risks for market entry.\",\"Analyze buyer power, supplier power, substitutes, new entrants, and rivalry.\",\"Design a blue ocean value curve and ERRC grid for creating new demand.\",\"Should we grow by selling our existing product into a new market or building a new product for current customers?\",\"Write the ad copy using attention, interest, desire, and action.\"]"
  grounding: "{\"subject_matter\":\"STP marketing as a portable segmentation, targeting, and positioning strategy method\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://open.lib.umn.edu/principlesmarketing/chapter/5-2-how-markets-are-segmented/\",\"https://open.lib.umn.edu/principlesmarketing/chapter/5-3-selecting-target-markets-and-target-market-strategies/\",\"https://open.lib.umn.edu/principlesmarketing/chapter/5-4-positioning-and-repositioning-offerings/\",\"https://hbr.org/1984/05/how-to-segment-industrial-markets\",\"https://doi.org/10.2307/1247695\",\"https://doi.org/10.1177/002224298705100201\",\"skills/skills/reasoning-strategy/stp-marketing/references/stp-marketing-sources.md\",\"skills/skills/reasoning-strategy/stp-marketing/references/upstream-displacement-2026-06-10.md\"],\"failure_modes\":[\"segmentation_bases_chosen_before_market_definition\",\"persona_written_without_segment_evidence\",\"target_chosen_by_preference_not_attractiveness_and_fit\",\"segment_size_growth_profitability_or_accessibility_ignored\",\"multiple_segments_selected_without_resource_tradeoffs\",\"positioning_statement_not_specific_to_target_segment\",\"differentiation_claim_unlinked_to_competitive_alternative\",\"marketing_mix_tactics_started_before_target_and_position_are_set\",\"segment_labels_use_sensitive_or_discriminatory_attributes_without_need_or_safeguards\",\"stp_table_treated_as_research_evidence\",\"invented_market_facts_or_personas\",\"pure_positioning_work_misrouted_to_full_stp\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "STP marketing is a staged choice system. The primitives are a defined market, buyer/user population, segmentation bases, segment profiles, evidence quality, segment attractiveness, organizational fit, target selection, competitive frame, differentiated value, positioning statement, marketing-mix implications, validation plan, and monitoring signals. Segmentation creates candidate groups with meaningfully different needs or behaviors; targeting chooses which groups deserve focus given attractiveness and fit; positioning states how the offer should be understood by the chosen target relative to alternatives. Each stage constrains the next."
  purpose: "This skill prevents agents from writing generic personas, choosing favorite customers without evidence, or jumping to messaging before the market has been segmented and a target has been selected. It forces the agent to connect customer evidence to segment profiles, segment profiles to target choice, target choice to positioning, and positioning to downstream product, pricing, channel, sales, and communications decisions."
  concept_boundary: "STP marketing is for the complete segmentation, targeting, and positioning sequence. It is not standalone positioning/category design, PESTEL macro scanning, Five Forces industry-structure analysis, Blue Ocean market-boundary reconstruction, Ansoff growth-path selection, OKR execution planning, copywriting, or tactical marketing-mix design as the primary task. Those methods may feed or follow STP, but they do not replace the segment-to-target-to-position chain."
  analogy: "STP marketing is like choosing a table at a crowded market before writing the sign: first separate the crowd into meaningful groups, then choose whom to serve, then say why this stall is the right one for that group."
  misconception: "The common mistake is treating STP as a naming exercise: invent segments, pick one that sounds attractive, and write a tagline. A useful STP analysis is evidence-backed, explicit about segment criteria and attractiveness, honest about reachability and resource fit, clear about the competitive alternative, and specific enough that product, price, place, promotion, sales, and research decisions can follow."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/stp-marketing/SKILL.md
---

## Concept of the skill

**What it is:** STP marketing is the strategy sequence of segmenting a market, targeting one or more attractive and reachable segments, and positioning the offer for the chosen target relative to alternatives.

**Mental model:** Treat the market as heterogeneous. First find meaningful buyer/user groups. Then choose which group or groups the organization can serve better than alternatives. Then define the position the offer should occupy for that target and translate it into product, price, channel, sales, and communications implications.

**Why it exists:** Agents often jump straight to messaging, personas, or a broad "everyone" target. This skill forces the choice logic that makes a marketing strategy coherent: who is meaningfully different, which group is worth focus, and what differentiated value should that group remember.

**What it is NOT:** It is not standalone product positioning, macro-environment scanning, industry-structure analysis, Blue Ocean value innovation, copywriting, or marketing-mix execution.

**Adjacent concepts:** market segmentation, target market selection, target audience, customer profile, ideal customer profile, buyer persona, positioning statement, perceptual mapping, go-to-market strategy, differentiated marketing, niche marketing, account-based targeting.

**One-line analogy:** STP picks the people to serve before it writes the message to them.

**Common misconception:** A persona is not a segment, and a segment name is not a strategy. The segment must be evidence-backed, reachable, and actionable; the target choice must be justified; and the position must be tailored to that target.

# STP Marketing

## Domain Context

Use STP marketing for go-to-market strategy, campaign strategy, product strategy, nonprofit program planning, B2B service positioning, market research synthesis, brand strategy, sales focus, and review of marketing plans that need a coherent customer-choice logic. Use public, aggregate, or synthetic examples only. Do not include personal data, customer-level records, payment data, secrets, confidential deal details, or private business facts in examples or evals.

STP is strongest when a team has a broad possible market and needs to decide which customer groups matter most and how the offer should be framed for them. It is weaker when the target and competitive frame are already fixed and the task is only to sharpen a product's category/value framing; that belongs to `positioning`. It is also weaker when the user asks for macro trends, industry attractiveness, or tactical campaign copy.

For B2B contexts, do not force consumer-only variables. Use firmographic, account, buying-center, use-case, maturity, budget, technology-stack, urgency, decision-process, or job-to-be-done bases when they better explain demand and reachability. For nonprofit or public-sector contexts, replace profit-only language with mission fit, beneficiary need, funding model, reachability, delivery capacity, and measurable outcomes.

For product-led contexts, treat usage evidence as one input, not the whole strategy. Segment by privacy-safe in-product behavior, activation path, use-case, team size, feature adoption, collaboration pattern, free-to-paid conversion trigger, expansion signal, or self-serve versus sales-assisted motion when those variables explain different needs or economics. Do not turn raw telemetry clusters into target segments until they have a named job, reachable channel, value hypothesis, and validation plan.

## Coverage

This skill teaches agents to:

1. Define the market, offer, decision, geography, buyer/user boundary, and evidence available before segmenting.
2. Choose segmentation bases that plausibly explain different needs, behaviors, buying processes, willingness to pay, access channels, or outcome requirements.
3. Build segment profiles with evidence, not invented personas.
4. Test whether segments are measurable, substantial, accessible, differentiable or responsive, actionable, and ethically usable.
5. Evaluate target attractiveness using segment size, growth, economics, urgency, fit, competitive intensity, reachability, channel access, mission/objective fit, and organizational capability.
6. Choose a primary target and optional secondary targets while naming resource tradeoffs.
7. Select an appropriate targeting pattern: undifferentiated, differentiated, concentrated/niche, micromarket, or account-based.
8. Write a positioning statement tied to the chosen target, category or competitive frame, key need, differentiated value, proof, and primary alternative.
9. Translate the position into implications for product, pricing, channels, sales motion, content, campaign briefs, customer success, and research.
10. State evidence gaps, validation tests, and monitoring triggers.
11. Route adjacent tasks to the right framework instead of stretching STP beyond its mechanism.

## Philosophy of the skill

STP is useful because marketing strategy is a focus choice. A broad market usually contains groups with different needs, buying triggers, adoption barriers, budgets, channels, and decision criteria. If the agent skips segmentation, it tends to write "for everyone" messages that fit nobody well. If it skips targeting, it treats all segments as equally worth serving. If it skips positioning, it leaves the chosen target without a memorable reason to choose the offer.

The method is sequential but iterative. Bad targeting can reveal weak segmentation. A position that cannot be made credible can reveal a poor target choice. A channel constraint can make an otherwise attractive segment unreachable. The agent should move through segmentation, targeting, and positioning in order, but it should loop back when the evidence shows that an earlier choice does not hold.

STP also has an ethics and privacy boundary. Segmentation can become discriminatory, manipulative, or privacy-invasive when it relies on sensitive attributes, hidden inference, or customer-level data without a legitimate and safe use. Use aggregate or synthetic examples, avoid protected or sensitive targeting unless the purpose is clearly lawful and beneficial, and state when a segmentation basis should be replaced by need, behavior, or context instead.

## Workflow

### 1. Frame the STP decision

Start by naming what the analysis must decide. Do not segment before the market and offer are clear.

```text
Offer, product, service, or program:
Market or category being considered:
Geography or channel boundary:
Buyer/user/customer boundary:
Decision this STP must inform:
Evidence available:
Constraints: budget, channel, regulation, capacity, ethics/privacy:
Current hypothesis, if any:
```

If the user gives no evidence, produce a sparse STP scaffold and mark assumptions. Do not invent segment sizes, needs, willingness to pay, or channel behavior.

### 2. Segment the market

Choose segmentation bases that explain real differences in need, behavior, reachability, or value. Do not use every base. Use the few that matter for the decision.

| Base | Use when it explains | Examples | Guardrail |
| --- | --- | --- | --- |
| Behavioral | Different usage, purchase, adoption, loyalty, trigger, or benefit-seeking patterns | heavy users, first-time buyers, churn-risk users, urgent compliance buyers | Behavior often predicts action better than demographics; still needs evidence |
| Needs / jobs | Different outcomes, pains, constraints, or jobs-to-be-done | speed-sensitive teams, risk-averse buyers, status-seeking consumers | Do not invent needs from stereotypes |
| Demographic | Population traits correlate with need, access, or regulation | age band, income, family stage, education | Avoid sensitive or protected attributes unless clearly justified and safe |
| Geographic | Location changes need, access, law, culture, climate, or distribution | urban/rural, country, region, service area | Geography is not enough unless it changes behavior or feasibility |
| Psychographic | Values, lifestyles, attitudes, motivations, identity, or preferences drive choice | sustainability-driven buyers, convenience maximizers | Hard to validate; requires research, not vibes |
| Firmographic / account | Organization traits affect buying process or value | industry, company size, tech stack, maturity, revenue, compliance exposure | Do not confuse a list of named accounts with a segment unless the common pattern is stated |
| Channel / accessibility | Reachability determines acquisition or service model | online self-serve, partner-led, field sales, community referral | A reachable audience is not automatically attractive |

For each segment, create a profile:

```text
Segment name:
Defining criteria:
Need / job / trigger:
Evidence:
Size or proxy:
Growth or urgency:
Reach channels:
Buying/adoption barriers:
Economic or mission value:
Competitive alternatives:
Ethics/privacy concerns:
Confidence:
```

### 3. Test segment quality

Before choosing a target, test each segment against quality criteria.

| Criterion | Question | Failure signal |
| --- | --- | --- |
| Measurable | Can we estimate who is in the segment and how large/value-relevant it is? | Segment name sounds plausible but has no evidence or proxy |
| Substantial | Is it large, valuable, or mission-important enough to justify focus? | Segment is too small for the required investment unless it is strategic |
| Accessible | Can we reach and serve it through real channels? | Team can describe the segment but not reach it |
| Differentiable / responsive | Does it respond differently enough to need a distinct offer or message? | Segments have different labels but same needs and response |
| Actionable | Can we build product, channel, pricing, sales, or messaging actions for it? | Segment cannot change decisions |
| Safe and fair | Is the basis lawful, ethical, privacy-safe, and not needlessly sensitive? | Segment relies on sensitive inference or discriminatory targeting |

Merge segments that do not behave differently. Split segments that hide different jobs, barriers, or channels. Drop segments that cannot support an action.

### 4. Choose targets

Evaluate each segment before choosing. Do not let a favorite persona win without evidence.

| Targeting factor | What to assess |
| --- | --- |
| Size / value | Current and potential revenue, impact, funding, or mission value |
| Growth / timing | Whether the segment is expanding, urgent, or becoming easier/harder to reach |
| Need intensity | Pain, job importance, switching motivation, unmet demand |
| Competitive intensity | Whether alternatives already serve the segment well |
| Fit | Product capability, brand credibility, channel access, sales motion, operating capacity |
| Economics | Acquisition cost, service cost, willingness to pay or fund, margin, retention |
| Strategic value | Learning value, beachhead potential, cross-sell, referenceability, ecosystem leverage |
| Risk | Legal, ethical, privacy, reputation, dependency, or execution risk |

Then state:

```text
Primary target:
Why this segment wins:
Secondary target, if any:
Why it is secondary:
Segments rejected and why:
Targeting pattern: undifferentiated / differentiated / concentrated / micromarket / account-based
Resource tradeoff:
Validation needed:
```

Use `expected-value` when the user has quantified outcomes and probabilities. Use `porters-five-forces` when the main uncertainty is industry profit pressure. Use `pestel` when the target choice depends on macro forces such as regulation, social change, or economic conditions.

### 5. Position for the chosen target

Positioning comes after target choice. Write the position for the primary target first; secondary targets may need separate positioning.

Use a perceptual map when the target's choice criteria are unclear or when competitors cluster around the same claims. Choose two attributes the target actually values, not the axes the team wishes mattered. Plot the main competitive alternatives, mark the current or intended offer, and look for positions that are open, valuable to the target, credible for the organization, and defensible against alternatives. Do not use perceptual maps as decoration: if the axes do not come from customer evidence or the map does not change the positioning statement, skip it.

Use this statement shape:

```text
For [target segment]
who [need/job/problem],
[offer] is a [category / frame]
that [differentiated value]
because [proof / reason to believe],
unlike [primary alternative].
```

Then test it:

| Test | Question |
| --- | --- |
| Target-specific | Would a different segment need a different statement? |
| Competitive | Does it name or imply a real alternative? |
| Differentiated | Does it explain why this offer wins for this target? |
| Credible | Is there proof, capability, or evidence behind the claim? |
| Useful | Does it guide product, pricing, channel, sales, and messaging choices? |
| Memorable | Can it be compressed without losing the target and difference? |

If the task is only to choose a category, competitive alternative, value themes, or product narrative after the target is already fixed, route to `positioning`.

### 6. Translate into implications

STP should change decisions. End with implications and next evidence.

| Area | STP implication |
| --- | --- |
| Product / service | Which features, packaging, onboarding, or service levels matter for the target |
| Price / funding | Willingness to pay, pricing model, discount risk, funding logic |
| Place / channel | Where and how the target can be reached or served |
| Promotion / messaging | Message themes, proof points, objections, content channels |
| Sales / partnership | Sales motion, lead qualification, partner fit, account list |
| Customer success / retention | Adoption risks, success metrics, expansion path |
| Research | Unknowns to validate, sample needed, evidence quality, monitoring triggers |

Do not finish with only a table. Finish with the few choices the STP analysis supports and the evidence still missing.

## Output Template

```text
STP Marketing

Decision:
Market boundary:
Evidence used:
Evidence missing:

Segmentation
1. Segment:
   Criteria:
   Need/job:
   Evidence:
   Size/value proxy:
   Reachability:
   Risks:

Targeting
Primary target:
Reason:
Rejected/secondary segments:
Targeting pattern:
Resource tradeoff:

Positioning
For:
Who:
Offer/category:
Differentiated value:
Proof:
Alternative:

Implications
Product/service:
Price/funding:
Channel:
Promotion/message:
Sales/partnership:
Research/validation:
Monitoring triggers:
```

## Boundary Rules

| User need | Use | Why |
| --- | --- | --- |
| Full segmentation, target selection, and positioning sequence | `stp-marketing` | The task needs the chain from market groups to chosen target to position |
| Product category, competitive alternative, differentiated value themes, or positioning statement only | `positioning` | The target and competitive context are already fixed or the work is category/value framing |
| Macro-environment context for entering a market | `pestel` | The task is about external political, economic, social, technology, environmental, or legal forces |
| Industry attractiveness and profit pressure | `porters-five-forces` | The task is about buyer/supplier power, entrants, substitutes, and rivalry |
| New-demand creation and value-curve reconstruction | `blue-ocean-strategy` | The task is about breaking the value-cost tradeoff or creating uncontested space |
| Product-market growth path | `ansoff-matrix` | The task is about existing/new products and existing/new markets |
| Tactical marketing mix after target and position are known | Direct execution without this skill | The task is mainly Product, Price, Place, Promotion, People, Process, or Physical evidence |
| Copywriting sequence for a specific message | Direct copywriting | The task is wording a message, not choosing the customer segment and position |

## Verification

Before using this skill's output as a recommendation, check:

- [ ] The market boundary, geography/channel, offer, and decision are explicit.
- [ ] Segments are based on evidence-backed differences in need, behavior, value, reachability, or buying process.
- [ ] Segment criteria are measurable or have honest proxies.
- [ ] Segment size/value, growth/timing, reachability, competition, fit, economics, and risk are considered.
- [ ] A primary target is chosen and rejected/secondary segments are explained.
- [ ] The targeting pattern matches the organization's resources and strategy.
- [ ] The positioning statement names target, need/job, category/frame, differentiated value, proof, and alternative.
- [ ] The position changes product, price, channel, sales, promotion, or research decisions.
- [ ] Sensitive or protected attributes are avoided unless the purpose is clearly lawful, beneficial, and privacy-safe.
- [ ] Evidence gaps and validation steps are stated.
- [ ] The answer routes standalone positioning, macro scanning, industry structure, value innovation, and tactical copy to their owner skills.

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `positioning` | The user already has a target segment and needs product/category/value-theme positioning, competitive-alternative framing, or a positioning statement only. |
| `pestel` | The user needs a macro-environment scan across political, economic, social, technological, environmental, and legal forces. |
| `porters-five-forces` | The user needs industry structure and profit-pressure analysis. |
| `blue-ocean-strategy` | The user wants to reconstruct market boundaries, create new demand, or design an ERRC grid/value curve. |
| `ansoff-matrix` | The user asks which product-market growth path to pursue. |
| Direct marketing-mix execution | The user needs tactical Product, Price, Place, Promotion, People, Process, or Physical-evidence design after STP is already settled. |
| Direct copywriting | The user needs wording for a specific message after audience and position are already settled. |

## References

Read `references/stp-marketing-sources.md` when you need source grounding for segmentation bases, target attractiveness, target-market strategies, positioning, or B2B segmentation. Read `references/upstream-displacement-2026-06-10.md` when checking whether modern AI marketing tools or ad-platform targeting features replace this skill. The body uses skill-relative reference paths for agent navigation; frontmatter truth sources use repo-rooted paths because the drift sentinel resolves sources from the workspace root.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/marketing`
- Scope: STP marketing strategy for products, services, programs, brands, and go-to-market plans: define the relevant market; segment buyers or users using behavior, need, demographic, geographic, psychographic, firmographic, account, job-to-be-done, or usage bases; test whether segments are measurable, substantial, accessible, differentiable or responsive, actionable, and privacy-safe; evaluate segment attractiveness, strategic fit, economics, growth, competitive intensity, reachability, and mission/objective fit; choose primary and optional secondary target segments; decide whether to use undifferentiated, differentiated, concentrated, micromarket, or account-based targeting; create a positioning statement for the chosen target and competitive frame; translate positioning into marketing-mix, product, channel, sales, and messaging implications; and state evidence gaps and validation needs. Excludes standalone positioning/category design without segmentation and target selection, broad macro-environment scanning, industry-structure analysis, value-curve/new-demand design, execution OKRs, and tactical channel/copy work as the primary task.

**When to use**
- Use STP marketing to choose which customer segment this product should focus on and how to position it.
- Build a segmentation, targeting, and positioning strategy for this B2B service.
- Review this STP analysis and tell me whether the target segment actually follows from the segmentation.
- We have three possible customer segments. Which one should be our primary target and what positioning statement follows?
- Turn this market research summary into segment profiles, target choice, and positioning implications.
- Create a minimum useful STP marketing analysis for a nonprofit program launch without inventing segment facts.
- Triggers: `stp marketing`, `stp strategy`, `stp-marketing`, `segmentation-targeting-positioning`, `stp-analysis`, `target-market-selection`

**Not for**
- Help me choose the market category and value themes for an existing product against spreadsheets and BI tools.
- Scan political, economic, social, technological, environmental, and legal risks for market entry.
- Analyze buyer power, supplier power, substitutes, new entrants, and rivalry.
- Design a blue ocean value curve and ERRC grid for creating new demand.
- Should we grow by selling our existing product into a new market or building a new product for current customers?
- Write the ad copy using attention, interest, desire, and action.

**Related skills**
- Verify with: `research-synthesis`, `epistemic-grounding`, `positioning`
- Related: `positioning`, `pestel`, `porters-five-forces`, `blue-ocean-strategy`, `swot-tows`, `ansoff-matrix`, `expected-value`, `research-synthesis`, `user-research`

**Concept**
- Mental model: STP marketing is a staged choice system. The primitives are a defined market, buyer/user population, segmentation bases, segment profiles, evidence quality, segment attractiveness, organizational fit, target selection, competitive frame, differentiated value, positioning statement, marketing-mix implications, validation plan, and monitoring signals. Segmentation creates candidate groups with meaningfully different needs or behaviors; targeting chooses which groups deserve focus given attractiveness and fit; positioning states how the offer should be understood by the chosen target relative to alternatives. Each stage constrains the next.
- Purpose: This skill prevents agents from writing generic personas, choosing favorite customers without evidence, or jumping to messaging before the market has been segmented and a target has been selected. It forces the agent to connect customer evidence to segment profiles, segment profiles to target choice, target choice to positioning, and positioning to downstream product, pricing, channel, sales, and communications decisions.
- Boundary: STP marketing is for the complete segmentation, targeting, and positioning sequence. It is not standalone positioning/category design, PESTEL macro scanning, Five Forces industry-structure analysis, Blue Ocean market-boundary reconstruction, Ansoff growth-path selection, OKR execution planning, copywriting, or tactical marketing-mix design as the primary task. Those methods may feed or follow STP, but they do not replace the segment-to-target-to-position chain.
- Analogy: STP marketing is like choosing a table at a crowded market before writing the sign: first separate the crowd into meaningful groups, then choose whom to serve, then say why this stall is the right one for that group.
- Common misconception: The common mistake is treating STP as a naming exercise: invent segments, pick one that sounds attractive, and write a tagline. A useful STP analysis is evidence-backed, explicit about segment criteria and attractiveness, honest about reachability and resource fit, clear about the competitive alternative, and specific enough that product, price, place, promotion, sales, and research decisions can follow.

**Grounding**
- Mode: `universal`
- Truth sources: `https://open.lib.umn.edu/principlesmarketing/chapter/5-2-how-markets-are-segmented/`, `https://open.lib.umn.edu/principlesmarketing/chapter/5-3-selecting-target-markets-and-target-market-strategies/`, `https://open.lib.umn.edu/principlesmarketing/chapter/5-4-positioning-and-repositioning-offerings/`, `https://hbr.org/1984/05/how-to-segment-industrial-markets`, `https://doi.org/10.2307/1247695`, `https://doi.org/10.1177/002224298705100201`, `skills/skills/reasoning-strategy/stp-marketing/references/stp-marketing-sources.md`, `skills/skills/reasoning-strategy/stp-marketing/references/upstream-displacement-2026-06-10.md`

**Keywords**
- `STP marketing`, `segmentation targeting positioning`, `market segmentation`, `target market selection`, `target audience strategy`, `positioning statement`, `perceptual map`, `differentiated marketing`, `niche targeting`, `go-to-market segmentation`

<!-- skill-graph-context:end -->
