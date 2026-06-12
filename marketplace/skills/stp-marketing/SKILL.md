---
name: stp-marketing
description: "Use when building, reviewing, or repairing an STP marketing strategy: segmentation, targeting, and positioning as one linked sequence from market definition to segment profiles, target selection, positioning statement, and marketing-mix implications. Covers consumer, B2B, nonprofit, and product-led contexts; segment bases; segment attractiveness; fit; primary/secondary targets; differentiated versus concentrated targeting; perceptual maps; positioning statements; evidence gaps; and handoff to campaign, product, pricing, channel, or sales work. Do NOT use for standalone product positioning/category design without segmentation and target choice (use positioning), macro-environment scanning (use pestel), industry profit-pressure diagnosis (use porters-five-forces), value-curve redesign/new-demand creation (use blue-ocean-strategy), product-market growth-path selection (use ansoff-matrix), or tactical marketing-mix design alone."
license: MIT
compatibility: "Markdown, marketing strategy, product strategy, go-to-market planning, campaign briefs, market research synthesis, nonprofit program planning"
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"positioning\",\"pestel\",\"porters-five-forces\",\"blue-ocean-strategy\",\"swot-tows\",\"ansoff-matrix\",\"expected-value\",\"research-synthesis\",\"user-research\",\"bcg-matrix\",\"playing-to-win\"],\"suppresses\":[\"positioning\",\"pestel\",\"porters-five-forces\",\"blue-ocean-strategy\",\"ansoff-matrix\"],\"verify_with\":[\"research-synthesis\",\"epistemic-grounding\",\"positioning\"]}"
  subject: reasoning-strategy
  scope: "STP marketing strategy for products, services, programs, brands, and go-to-market plans: define the relevant market; segment buyers or users using behavior, need, demographic, geographic, psychographic, firmographic, technographic, account, intent/signal, job-to-be-done, or usage bases; test whether segments are measurable, substantial, accessible, differentiable or responsive, actionable, and privacy-safe; evaluate segment attractiveness, strategic fit, economics, growth, competitive intensity, reachability, and mission/objective fit; choose primary and optional secondary target segments; decide whether to use undifferentiated, differentiated, concentrated, micromarket, or account-based targeting; create a positioning statement for the chosen target and competitive frame; translate positioning into marketing-mix, product, channel, sales, and messaging implications; and state evidence gaps and validation needs. Excludes standalone positioning/category design without segmentation and target selection, broad macro-environment scanning, industry-structure analysis, value-curve/new-demand design, execution OKRs, and tactical channel/copy work as the primary task."
  public: "true"
  taxonomy_domain: foundations/marketing
  stability: stable
  keywords: "[\"STP marketing\",\"segmentation targeting positioning\",\"market segmentation\",\"target market selection\",\"target audience strategy\",\"positioning statement\",\"perceptual map\",\"differentiated marketing\",\"niche targeting\",\"go-to-market segmentation\"]"
  triggers: "[\"stp marketing\",\"stp strategy\",\"stp-marketing\",\"segmentation-targeting-positioning\",\"stp-analysis\",\"target-market-selection\"]"
  examples: "[\"Use STP marketing to choose which customer segment this product should focus on and how to position it.\",\"Build a segmentation, targeting, and positioning strategy for this B2B service.\",\"Review this STP analysis and tell me whether the target segment actually follows from the segmentation.\",\"We have three possible customer segments. Which one should be our primary target and what positioning statement follows?\",\"Turn this market research summary into segment profiles, target choice, and positioning implications.\",\"Create a minimum useful STP marketing analysis for a nonprofit program launch without inventing segment facts.\"]"
  anti_examples: "[\"Help me choose the market category and value themes for an existing product against spreadsheets and BI tools.\",\"Scan political, economic, social, technological, environmental, and legal risks for market entry.\",\"Analyze buyer power, supplier power, substitutes, new entrants, and rivalry.\",\"Design a blue ocean value curve and ERRC grid for creating new demand.\",\"Should we grow by selling our existing product into a new market or building a new product for current customers?\",\"Write the ad copy using attention, interest, desire, and action.\"]"
  grounding: "{\"subject_matter\":\"STP marketing as a portable segmentation, targeting, and positioning strategy method\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://open.lib.umn.edu/principlesmarketing/chapter/5-2-how-markets-are-segmented/\",\"https://open.lib.umn.edu/principlesmarketing/chapter/5-3-selecting-target-markets-and-target-market-strategies/\",\"https://open.lib.umn.edu/principlesmarketing/chapter/5-4-positioning-and-repositioning-offerings/\",\"https://hbr.org/1984/05/how-to-segment-industrial-markets\",\"https://doi.org/10.2307/1247695\",\"https://doi.org/10.1177/002224298705100201\",\"https://strategyn.com/needs-based-segmentation/\",\"https://marketingscience.info/news-and-insights/easy-to-find-being-where-b2b-buying-happens\",\"skills/reasoning-strategy/stp-marketing/references/stp-marketing-sources.md\",\"skills/reasoning-strategy/stp-marketing/references/upstream-displacement-2026-06-10.md\"],\"failure_modes\":[\"segmentation_bases_chosen_before_market_definition\",\"persona_written_without_segment_evidence\",\"target_chosen_by_preference_not_attractiveness_and_fit\",\"segment_size_growth_profitability_or_accessibility_ignored\",\"multiple_segments_selected_without_resource_tradeoffs\",\"positioning_statement_not_specific_to_target_segment\",\"differentiation_claim_unlinked_to_competitive_alternative\",\"marketing_mix_tactics_started_before_target_and_position_are_set\",\"segment_labels_use_sensitive_or_discriminatory_attributes_without_need_or_safeguards\",\"stp_table_treated_as_research_evidence\",\"invented_market_facts_or_personas\",\"pure_positioning_work_misrouted_to_full_stp\",\"ai_generated_cluster_or_synthetic_persona_treated_as_validated_segment\",\"reachability_assumed_from_deprecated_tracking_or_third_party_audiences\",\"ad_platform_audience_optimization_treated_as_target_strategy\",\"demographic_or_firmographic_label_used_as_causal_need_without_job_or_behavior\",\"real_time_behavioral_or_predictive_microsegment_confused_with_durable_strategic_segment\",\"segment_confidence_or_evidence_provenance_omitted\",\"multi_role_b2b_buying_center_collapsed_to_one_persona\",\"hypersegmentation_ignores_mental_or_physical_availability\",\"ai_search_visibility_or_geo_treated_as_stp_strategy\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "STP marketing is a staged choice system. The primitives are a defined market, buyer/user population, segmentation bases, segment profiles, evidence quality, segment attractiveness, organizational fit, target selection, competitive frame, differentiated value, positioning statement, marketing-mix implications, validation plan, and monitoring signals. Segmentation creates candidate groups with meaningfully different needs or behaviors; targeting chooses which groups deserve focus given attractiveness and fit; positioning states how the offer should be understood by the chosen target relative to alternatives. Each stage constrains the next."
  purpose: "This skill prevents agents from writing generic personas, choosing favorite customers without evidence, or jumping to messaging before the market has been segmented and a target has been selected. It forces the agent to connect customer evidence to segment profiles, segment profiles to target choice, target choice to positioning, and positioning to downstream product, pricing, channel, sales, and communications decisions."
  concept_boundary: "STP marketing is for the complete segmentation, targeting, and positioning sequence. It is not standalone positioning/category design, PESTEL macro scanning, Five Forces industry-structure analysis, Blue Ocean market-boundary reconstruction, Ansoff growth-path selection, OKR execution planning, copywriting, or tactical marketing-mix design as the primary task. Those methods may feed or follow STP, but they do not replace the segment-to-target-to-position chain."
  analogy: "STP marketing is like choosing a table at a crowded market before writing the sign: first separate the crowd into meaningful groups, then choose whom to serve, then say why this stall is the right one for that group."
  misconception: "The common mistake is treating STP as a naming exercise: invent segments, pick one that sounds attractive, and write a tagline. A useful STP analysis is evidence-backed, explicit about segment criteria and attractiveness, honest about reachability and resource fit, clear about the competitive alternative, and specific enough that product, price, place, promotion, sales, and research decisions can follow. A second common mistake is assuming finer segmentation always improves performance: brand-growth evidence shows most growth comes from broad mental and physical availability, so a target can be narrowed past the point where the brand is still easy to remember and easy to buy."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/stp-marketing/SKILL.md
---

## Concept of the skill

**What it is:** STP marketing is the strategy sequence of segmenting a market, targeting one or more attractive and reachable segments, and positioning the offer for the chosen target relative to alternatives.

**Mental model:** Treat the market as heterogeneous. First find meaningful buyer/user groups. Then choose which group or groups the organization can serve better than alternatives. Then define the position the offer should occupy for that target and translate it into product, price, channel, sales, and communications implications.

**Why it exists:** Agents often jump straight to messaging, personas, or a broad "everyone" target. This skill forces the choice logic that makes a marketing strategy coherent: who is meaningfully different, which group is worth focus, and what differentiated value should that group remember.

**What it is NOT:** It is not standalone product positioning, macro-environment scanning, industry-structure analysis, Blue Ocean value innovation, copywriting, or marketing-mix execution.

**Adjacent concepts:** market segmentation, target market selection, target audience, customer profile, ideal customer profile, buyer persona, positioning statement, perceptual mapping, go-to-market strategy, differentiated marketing, niche marketing, account-based targeting, TAM/SAM/SOM, mental availability.

**One-line analogy:** STP picks the people to serve before it writes the message to them.

**Common misconception:** A persona is not a segment, and a segment name is not a strategy. The segment must be evidence-backed, reachable, and actionable; the target choice must be justified; and the position must be tailored to that target.

# STP Marketing

## Domain Context

Use STP marketing for go-to-market strategy, campaign strategy, product strategy, nonprofit program planning, B2B service positioning, market research synthesis, brand strategy, sales focus, and review of marketing plans that need a coherent customer-choice logic. Use public, aggregate, or synthetic examples only. Do not include personal data, customer-level records, payment data, secrets, confidential deal details, or private business facts in examples or evals.

STP is strongest when a team has a broad possible market and needs to decide which customer groups matter most and how the offer should be framed for them. It is weaker when the target and competitive frame are already fixed and the task is only to sharpen a product's category/value framing; that belongs to `positioning`. It is also weaker when the user asks for macro trends, industry attractiveness, or tactical campaign copy.

For B2B contexts, do not force consumer-only variables. Use firmographic, account, buying-center, use-case, maturity, budget, technology-stack (technographic), urgency, decision-process, intent/signal, or job-to-be-done bases when they better explain demand and reachability. For nonprofit or public-sector contexts, replace profit-only language with mission fit, beneficiary need, funding model, reachability, delivery capacity, and measurable outcomes.

For B2B and account-based work, separate the account segment from the buying-center roles. A target account pattern can be "regulated mid-market manufacturers modernizing quality reporting", but the positioning may need different proof for the end user, economic buyer, technical evaluator, procurement reviewer, security/legal approver, and executive sponsor. Do not collapse the account into one persona. If the task is ABM, the named account list is downstream activation; STP still needs the common account pattern, buying trigger, role map, target rationale, and differentiated position.

For product-led contexts, treat usage evidence as one input, not the whole strategy. Segment by privacy-safe in-product behavior, activation path, use-case, team size, feature adoption, collaboration pattern, free-to-paid conversion trigger, expansion signal, or self-serve versus sales-assisted motion when those variables explain different needs or economics. Do not turn raw telemetry clusters into target segments until they have a named job, reachable channel, value hypothesis, and validation plan.

Prefer consented data. Where the organization holds zero-party data (information customers voluntarily share, such as preference-centre selections or stated intent) or first-party data, it is usually the most privacy-safe and most durable segmentation input — though it is not automatically the *strongest* evidence for every claim (see the evidence ladder in Step 2: observed behavior is the strongest signal for actual behavior, retention, and adoption). Choose the evidence by claim type, and state the data source and consent basis for every segmentation variable.

## Coverage

This skill teaches agents to:

1. Define the market, offer, decision, geography, buyer/user boundary, and evidence available before segmenting; size the boundary with TAM/SAM/SOM when the decision turns on whether the market is large enough.
2. Choose segmentation bases that plausibly explain different needs, behaviors, intent, buying processes, willingness to pay, access channels, or outcome requirements.
3. Build segment profiles with evidence, not invented personas, and label each claim by evidence strength and provenance.
4. Test whether segments are measurable, substantial, accessible, differentiable or responsive, actionable, and ethically/privacy-safe.
5. Evaluate target attractiveness using segment size, growth, economics, urgency, fit, competitive intensity, reachability, channel access, mission/objective fit, and organizational capability.
6. Choose a primary target and optional secondary targets, assign each surviving segment a portfolio role, and name resource tradeoffs.
7. Select an appropriate targeting pattern: undifferentiated, differentiated, concentrated/niche, micromarket, or account-based — without over-narrowing past the brand's need for broad availability.
8. Write a positioning statement tied to the chosen target, category or competitive frame, key need, differentiated value, proof, and primary alternative.
9. Translate the position into implications for product, pricing, channels, sales motion, content, campaign briefs, customer success, and research.
10. State evidence gaps, validation tests, and monitoring triggers, and name the fastest responsible test for each weak link.
11. Treat AI clusters, analytics cohorts, ad-platform audiences, and synthetic personas as hypotheses to validate, not finished segments.
12. Route adjacent tasks to the right framework instead of stretching STP beyond its mechanism.

## Philosophy of the skill

STP is useful because marketing strategy is a focus choice. A broad market usually contains groups with different needs, buying triggers, adoption barriers, budgets, channels, and decision criteria. If the agent skips segmentation, it tends to write "for everyone" messages that fit nobody well. If it skips targeting, it treats all segments as equally worth serving. If it skips positioning, it leaves the chosen target without a memorable reason to choose the offer.

The method is sequential but iterative. Bad targeting can reveal weak segmentation. A position that cannot be made credible can reveal a poor target choice. A channel constraint can make an otherwise attractive segment unreachable. The agent should move through segmentation, targeting, and positioning in order, but it should loop back when the evidence shows that an earlier choice does not hold.

STP also has an ethics and privacy boundary. Segmentation can become discriminatory, manipulative, or privacy-invasive when it relies on sensitive attributes, hidden inference, or customer-level data without a legitimate and safe use. Use aggregate or synthetic examples, prioritize explicit zero-party or first-party data, avoid protected or sensitive targeting unless the purpose is clearly lawful and beneficial, and state when a segmentation basis should be replaced by need, behavior, or context instead.

STP should create useful focus, not strategic tunnel vision. Narrow segments can improve relevance, but hyper-segmentation becomes harmful when it fragments reach, ignores category buyers, or makes the brand hard to remember and hard to buy. Large-scale brand-growth evidence (Ehrenberg-Bass) shows that brands grow mainly by reaching *more* category buyers and being easy to remember and easy to buy — that is, by building **mental availability** (easy to think of in relevant buying situations) and **physical availability** (easy to find, evaluate, and buy through the channels the target uses) — not by ever-tighter targeting. A narrow beachhead is acceptable when resources are constrained or learning is the goal, but it still needs buying situations, reach channels, distinctive proof, and an expansion logic. If a proposed target is too small, too hidden, or too operational to build mental and physical availability, downgrade it to an activation cohort or validation hypothesis rather than making it the whole STP strategy. This is a tension to balance, not a rule that overrides targeting: differentiated and concentrated strategies remain valid — the test is whether narrowing is earned.

## Working with AI, analytics, and platform tooling

AI research tools, analytics clustering, customer-data platforms, CRM scoring, ad-platform audiences, and persona generators are *evidence and execution surfaces* for STP, not substitutes for it. They can collect data, cluster audiences, draft personas, draft positioning lines, suggest audiences, optimize bids, personalize creative, and activate target lists — but they do not perform the strategy judgment STP teaches: defining the market boundary, choosing bases that explain real differences, testing segment quality, choosing a target under resource constraints, tying positioning to the chosen target and competitive alternative, and stating what is still unproven.

Treat every machine-produced cluster, lookalike, predicted score, ad audience, or persona as a *hypothesis* until it has four things:

1. A human-readable segment definition tied to a need, job, trigger, behavior, buying process, or value driver.
2. Evidence provenance: which data or research produced it, how current it is, and what it excludes.
3. Reachability and actionability: how the organization can reach, serve, sell to, or learn from it without unsafe data use.
4. A positioning implication: what should change in product, price, channel, sales, proof, or message because this segment exists.

Two specific traps to guard against:

- **AI-generated / synthetic personas are unvalidated by default.** A persona produced by an LLM or a "synthetic respondent" tool approximates patterns already present in its training and inputs; it is not field evidence. LLM-derived personas systematically under-represent marginalized, older, and accessibility-affected populations, and "bias laundering" — presenting an inferred persona in the language of empathy and research — makes the missing validation hard to spot. If synthetic personas are used, disclose the data sources, mark what was inferred versus observed, label them synthetic, and pair them with at least one real-user or market test before they drive a target choice. Do not present simulated quotes, needs, objections, or behaviors as if they came from real people. The defensible mode is hybrid: fast synthetic exploration plus real-world validation, with a methods note.
- **Reachability is not what the old ad stack assumed.** Do not infer that a segment is *accessible* from third-party-cookie audiences or interest taxonomies that no longer exist. Google retired the *advertising-related* Privacy Sandbox APIs (Topics, Protected Audience, Attribution Reporting, and others such as Private Aggregation) in October 2025 — while non-advertising Privacy Sandbox technologies (CHIPS, FedCM, Private State Tokens) continue — and reversed its third-party-cookie deprecation plan in April 2025, leaving the durable industry shift toward consented first-party data, contextual reach, and direct/owned channels. A segment that was reachable through a detailed interest, third-party-cookie audience, lookalike, or custom list last year may now require first-party data, consented lists, contextual targeting, broader automated optimization, or a different channel. Check reachability against the channels and consented data the organization can actually use *now*, not against a deprecated ad-targeting capability.

Do not let platform language replace strategy language. A Google Performance Max audience signal, AI Max query expansion, Meta Advantage+ audience suggestion, CRM propensity score, or CDP cohort can help discover or activate demand, but it is not automatically a strategic segment. Use platform reports to update the evidence, then rerun the segment-quality and target-choice tests.

AI search, answer-engine optimization (AEO), and generative-engine optimization (GEO) are downstream *visibility and channel implications* of a chosen position, not a replacement for segmentation or target choice, and not an STP failure mode to design around. If AI-mediated discovery is a real reach channel for the target, you may check whether the target-specific position, proof, and product/business data are available through crawlable, people-first, source-backed content — but route GEO/AEO/SEO *execution* to the relevant SEO/content skill. Do not use GEO/AEO hacks, inauthentic mentions, or special machine-readable files as a substitute for a credible position or real evidence.

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

**Size the market boundary before segmenting (TAM/SAM/SOM).** When the decision turns on whether the market is large enough to justify the effort, bound it with three nested estimates: **TAM** (Total Addressable Market — everyone who could conceivably need the offer), **SAM** (Serviceable Addressable Market — the portion reachable with your model, geography, channels, and right to operate), and **SOM** (Serviceable Obtainable Market — the share you can realistically win given competition, differentiation, and capacity). Use honest proxies and label every assumption; do not manufacture precise figures. The number a target choice should be tested against is SOM, not the headline TAM — an attractive TAM with a tiny reachable SOM is a common trap.

### 2. Segment the market

Choose segmentation bases that explain real differences in need, behavior, reachability, or value. Do not use every base. Use the few that matter for the decision.

| Base | Use when it explains | Examples | Guardrail |
| --- | --- | --- | --- |
| Behavioral | Different usage, purchase, adoption, loyalty, trigger, or benefit-seeking patterns | heavy users, first-time buyers, churn-risk users, urgent compliance buyers | Behavior often predicts action better than demographics; still needs evidence, not just telemetry noise |
| Intent / signal | Who is in-market or researching now, derived from first-party signals | high-intent researchers, "searching for [competitor] alternatives", expansion-ready accounts, hiring-for-[skill] firms | An intent score or signal can be transient and must map to a coherent human need, not just a black-box probability; pair with a fit check |
| Needs / jobs | Different outcomes, pains, constraints, or jobs-to-be-done | speed-sensitive teams, risk-averse buyers, status-seeking consumers | Do not invent needs from stereotypes |
| Demographic | Population traits correlate with need, access, or regulation | age band, income, family stage, education | Avoid sensitive or protected attributes unless clearly justified and safe |
| Geographic | Location changes need, access, law, culture, climate, or distribution | urban/rural, country, region, service area | Geography is not enough unless it changes behavior or feasibility |
| Psychographic | Values, lifestyles, attitudes, motivations, identity, or preferences drive choice | sustainability-driven buyers, convenience maximizers | Hard to validate; requires research or zero-party data, not vibes |
| Firmographic / account | Organization traits affect buying process or value | industry, company size, tech stack, maturity, revenue, compliance exposure | Do not confuse a list of named accounts with a segment unless the common pattern is stated |
| Technographic | Current tooling / stack reveals fit, gaps, or switching readiness (B2B) | "companies on [legacy tool] with [modern stack] gaps", integration-constrained buyers | Tech fit is not a need on its own; it must connect to a job or value driver |
| Usage / product-led | In-product behavior, activation, feature adoption, free-to-paid triggers, expansion signals | power users, dormant trial users, onboarding-dropoff users, team-admin vs end-user, collaboration-driven teams | Do not treat raw telemetry clusters as target segments without a named job, reachable channel, and value hypothesis |
| Channel / accessibility | Reachability determines acquisition or service model | online self-serve, partner-led, field sales, community referral | A reachable audience is not automatically attractive; reachability must hold on the channels and consented data the team can use now |

**Needs/jobs and JTBD, used rigorously.** A "needs" basis is strongest when it names the *job the buyer is trying to get done* and the *outcomes* by which they judge success, not a demographic stand-in. Jobs-to-be-done (JTBD) and needs-based segmentation are complementary, not competing: JTBD qualitatively articulates what the customer is trying to accomplish and under what circumstances; needs-based segmentation then quantifies, clusters, and operationalizes those jobs into addressable segments. Outcome-Driven Innovation (ODI) is the most rigorous form — it segments by under-served *desired outcomes* rather than by who the buyer is. Reach for a job/outcome basis when demographic or firmographic groups keep showing the same buying behavior for different reasons, or different behavior for the same reason; that mismatch is the signal that the real segmenting variable is the job, not the buyer's traits.

**For B2B, use a nested approach when appropriate** — start with broad demographics/firmographics, then layer operating variables (technology, usage rate), purchasing approach (centralized vs decentralized), situational factors (urgency, application), and personal characteristics (risk tolerance, values). This multilayer approach, derived from Shapiro and Bonoma's nested-model research, prevents single-variable oversimplification.

For each segment, create a profile:

```text
Segment name:
Human-readable definition:
Defining criteria (bases):
Primary difference: need / job / trigger / behavior / buying process / value driver:
Evidence:
Evidence provenance (which data/research produced it; how current; what it excludes):
Evidence strength: verified / source-supported / inferred / synthetic hypothesis / unverified
Size or proxy:
Growth or urgency:
Stability: durable segment / event-triggered / lifecycle stage / dynamic operational cohort:
Reach channels:
Buying/adoption barriers:
Economic or mission value:
B2B roles, if relevant: end user / economic buyer / technical evaluator / procurement / influencer / executive sponsor:
Competitive alternatives:
Positioning implication:
Mental/physical availability implication:
Ethics/privacy concerns:
Confidence:
```

Name segments by the difference that matters, not by a convenient descriptor. "Mid-market finance teams with manual reconciliation risk" is stronger than "SMB women 25-44" because it names a job, context, and decision implication. Demographic, geographic, firmographic, and account attributes are acceptable when they explain need, access, regulation, buying process, or economics; otherwise they are only descriptors and should not carry the strategy.

Keep strategic segments stable enough to guide positioning. Real-time propensity scores, churn-risk flags, campaign-engagement cohorts, and AI-discovered microclusters can be useful operational subsegments, but they are too fluid to carry the whole positioning unless the underlying need or buying context is stable.

**Label evidence by strength — not all evidence is equal.** When you fill in `Evidence:`, `Evidence strength:`, and `Confidence:`, name where each segment claim sits on this ladder, strongest first:

| Rung | Evidence type | What it is |
| --- | --- | --- |
| 1 | Observed behavior | Real purchase, usage, retention, conversion, transaction, or pipeline data from the actual population. |
| 2 | Direct qualitative research | Interviews, contextual inquiry, field studies, support transcripts, sales-call notes, diary studies, usability sessions. |
| 3 | Primary survey | Representative, adequately sampled survey/panel of the real population. |
| 4 | Secondary research | Analyst reports, published studies, census/industry datasets, competitor evidence, third-party market data. |
| 5 | Analytics clusters | Unsupervised segmentation of behavioral/telemetry data, propensity scores, CDP cohorts, ad-platform audiences — a *hypothesis* until a named job, reachable channel, and value hypothesis are attached. |
| 6 | Synthetic / inferred | LLM personas, synthetic respondents, assumption-based profiles — a *hypothesis to validate*, never a finished segment or real-user evidence. |

Stamp each segment claim with one evidence label — `verified`, `source-supported`, `inferred`, `synthetic hypothesis`, or `unverified`. A target choice resting on rungs 5–6 alone must be marked provisional and paired with a validation test before it drives investment. State the rung; do not let a rung-6 inference read as a rung-1 fact. Note also that rung-1 observed behavior can over-represent current customers and current channels — it does not automatically capture future or noncustomer demand.

### 3. Test segment quality

Before choosing a target, test each segment against quality criteria.

| Criterion | Question | Failure signal |
| --- | --- | --- |
| Measurable | Can we estimate who is in the segment and how large/value-relevant it is? | Segment name sounds plausible but has no evidence or proxy |
| Substantial | Is it large, valuable, or mission-important enough to justify focus? | Segment is too small for the required investment unless it is strategic |
| Accessible | Can we reach and serve it through real channels and consented data we have today? | Team can describe the segment but not reach it, or reachability rests on deprecated third-party tracking/audience products |
| Differentiable / responsive | Does it respond differently enough to need a distinct offer or message? | Segments have different labels but same needs and response |
| Actionable | Can we build product, channel, pricing, sales, or messaging actions for it? | Segment cannot change decisions |
| Safe and fair | Is the basis lawful, ethical, privacy-safe, and not needlessly sensitive? | Segment relies on sensitive inference, hidden scoring, or discriminatory targeting |

Merge segments that do not behave differently. Split segments that hide different jobs, barriers, or channels. Drop segments that cannot support an action.

Run a privacy, fairness, and current-channel check before target selection:

```text
Personal data used:
Consent / lawful basis / permission state:
Sensitive or protected attributes involved:
Is the attribute necessary for a lawful, beneficial purpose?
Can a need, behavior, context, or channel proxy replace a sensitive label?
Could the segment exclude, exploit, or unfairly burden a protected group?
Current platform/channel availability:
Measurement limitation or attribution caveat:
Required safeguard:
```

If the segment relies on protected traits, inferred sensitive attributes, customer-level records, or platform-restricted categories, do not proceed as if it is ordinary targeting. Either replace the basis with a safer need/behavior/context variable, narrow the use to a clearly beneficial and compliant purpose, or route the compliance question outside STP before acting. STP can flag the risk; it is not legal advice.

### 4. Choose targets

Evaluate each segment before choosing. Do not let a favorite persona win without evidence.

| Targeting factor | What to assess |
| --- | --- |
| Size / value | Current and potential revenue, impact, funding, or mission value |
| Growth / timing | Whether the segment is expanding, urgent, or becoming easier/harder to reach |
| Need intensity / intent | Pain, job importance, switching motivation, unmet demand, current in-market signal |
| Competitive intensity | Whether alternatives already serve the segment well |
| Fit | Product capability, brand credibility, channel access, sales motion, operating capacity, stack/integration fit |
| Economics | Acquisition cost, service cost, willingness to pay or fund, margin, retention |
| Strategic value | Learning value, beachhead potential, cross-sell, referenceability, ecosystem leverage |
| Risk | Legal, ethical, privacy, reputation, dependency, or execution risk |

A compact restatement many teams use for a first cut is **Size, Profitability, Accessibility**: is the segment large enough to matter, will lifetime value and ROI justify the acquisition cost, and can you legally and technically reach it. Treat that triad as a screen, not a substitute for the fuller table above — fit, timing, strategic value, and risk routinely flip a target choice that the three-criterion screen would have passed.

As a quantitative economics check, the **LTV:CAC ratio** is a common heuristic — a segment whose customer lifetime value to acquisition cost is roughly **3:1 or better** is generally easier to sustain, and a much lower ratio is a warning sign. Treat it as a guideline, not a universal gate: it does not fit nonprofit, public-sector, or mission-value contexts, where you substitute mission-value-per-beneficiary for LTV and delivery-cost-per-beneficiary for CAC, and even in commercial contexts a strategic beachhead may justify weaker near-term economics.

**Do not over-narrow past the brand's need for broad availability.** The focus logic above has a counterweight from large-scale brand-growth evidence (Ehrenberg-Bass): brands grow mainly by reaching *more* category buyers and being easy to remember and easy to buy, not by ever-tighter targeting. A target so narrow that the brand becomes hard for the wider category to recall, find, evaluate, or buy trades away mental and physical availability — the very assets that drive growth — for a precision the business may not need. Concentrated, niche, or account-based targeting is right when resources, fit, a beachhead, or a genuinely distinct need demand it; it is wrong when it is just an excuse to talk to fewer people or to dress narrow ambition up as strategy. When you recommend a focused target, confirm the focus is a deliberate resource/fit/beachhead choice and that the chosen target still leaves the brand easy to remember and easy to buy among the buyers who matter.

**Assign a portfolio role, not just a rank.** Real STP output is usually a portfolio of segments with different jobs, not a single pick. Give each surviving segment one explicit role:

| Role | Meaning | Output requirement |
| --- | --- | --- |
| Primary | The segment the strategy is built around now; gets the positioning statement and the bulk of resources. | State why it wins and what the organization will stop doing or delay. |
| Beachhead | A narrow, winnable *entry* segment chosen for fast proof, learning, referenceability, or wedge potential. | State the expansion hypothesis and the trigger for moving beyond it. |
| Secondary | Served with the same or lightly adapted offer; real but not the focus of resources or positioning. | State the resource limit and whether it needs separate positioning. |
| Watchlist | Attractive but not yet reachable, ready, validated, or strategically timed; monitored for a named trigger that would promote it. | State what evidence would promote it. |
| Rejected | Explicitly declined, with the reason recorded so the choice is auditable and revisitable. | State the reason: weak need, low value, poor fit, inaccessible, too risky, too crowded, or unsupported evidence. |

Do not choose multiple primary targets unless the organization can fund distinct offers, channels, proof, and positioning for each. A differentiated targeting strategy is a resource commitment, not a bigger table.

**Name the fastest responsible validation for every weak claim.** For each segment resting on evidence rungs 5–6, an unproven reachability assumption, or an untested willingness to pay, state the *fastest responsible* test that would confirm or kill it — a handful of customer interviews, a smoke-test landing page, a small paid-reach test on a channel you actually control, or a concierge/manual delivery to one account — and the result that would change the target choice. "Fastest responsible" means the cheapest test that still produces real-world signal; do not let an attractive-sounding segment advance to positioning on unvalidated rungs without naming its next test.

Then state:

```text
Primary target:
Why this segment wins:
LTV:CAC estimate or mission-value proxy:
Beachhead, if any (and expansion path):
Secondary target, if any:
Why it is secondary:
Watchlist segments (and promotion trigger):
Segments rejected and why:
Targeting pattern: undifferentiated / differentiated / concentrated / micromarket / account-based
Resource tradeoff:
Weakest claim + fastest responsible validation:
```

Use `expected-value` when the user has quantified outcomes and probabilities. Use `porters-five-forces` when the main uncertainty is industry profit pressure. Use `pestel` when the target choice depends on macro forces such as regulation, social change, or economic conditions — and reference the relevant macro factors explicitly when they materially affect segment attractiveness (e.g., regulatory tailwinds, inflation-driven budget shifts, sustainability mandate changes).

### 5. Position for the chosen target

Positioning comes after target choice. Write the position for the primary target first; secondary targets may need separate positioning.

Use a perceptual map when the target's choice criteria are unclear or when competitors cluster around the same claims. Choose two attributes the target actually values, not the axes the team wishes mattered. Plot the main competitive alternatives, mark the current or intended offer, and look for positions that are open, valuable to the target, credible for the organization, and defensible against alternatives. Do not use perceptual maps as decoration: if the axes do not come from customer evidence or the map does not change the positioning statement, skip it.

Consider which positioning strategy type fits the target and competitive context:

| Strategy type | When to use | Example |
| --- | --- | --- |
| Competitor-based | The competitive alternative is well known and the offer has a meaningful difference | "Unlike [competitor]'s expensive option, we deliver the same outcome at half the cost" |
| Benefit-based | One functional or emotional benefit dominates the decision | "The only mattress that guarantees spine alignment" |
| Attribute-based | A specific feature or ingredient is uniquely defensible | "The only brand using medical-grade silicone" |
| Consumer/identity-based | The target has a strong self-concept or identity need | "For creative professionals who refuse to compromise on tools" |
| Price-based | Cost sensitivity is the primary buying criterion | "The premium experience at a mid-range price" |
| Prestige-based | Status signaling is central to the purchase | "Worn by the world's top athletes" |

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
| Machine-readable (optional) | If AI-mediated discovery is a real reach channel for the target, is the claim expressed with enough clarity and verifiable entities (certifications, standards, measurable outcomes) that an answer engine can categorize the offer — avoiding vague qualifiers like "leading" or "best-in-class"? This is a downstream visibility check, not a core STP test; route GEO/AEO execution to the SEO/content owner. |

If the task is only to choose a category, competitive alternative, value themes, or product narrative after the target is already fixed, route to `positioning`.

### 5b. Validate the STP logic

Before turning the strategy into execution, name the fastest responsible validation for each weak link.

| Claim to validate | Useful evidence | Failure signal |
| --- | --- | --- |
| Segment exists and is large enough | Survey incidence, market data, first-party counts, CRM/account data, public datasets | The segment is vivid but unmeasured |
| Segment has a distinct job or need | Interviews, field observation, support/sales-call synthesis, diary studies | The segment label changes, but the need and buying trigger do not |
| Segment is reachable | Channel tests, search/ad reports, partner access, community access, sales-list quality | The team can describe the segment but cannot reach it safely or economically |
| Segment economics justify focus | CAC/payback, margin/service cost, funding logic, willingness-to-pay research, retention/cohort data | High interest but poor economics or delivery capacity |
| Position is credible and differentiated | Win/loss evidence, competitor comparison, proof inventory, message tests, sales-call objections | The claim is attractive but not believable or not distinct |
| Platform audience maps to the strategic segment | Holdout test, campaign-quality review, conversion quality, downstream retention or sales acceptance | Low-cost traffic or leads that do not match the target or do not retain |
| Position can be found and remembered in buying situations | Category-entry-point research, search/AI-search visibility checks, channel coverage, distinctive-asset/proof inventory, sales-channel data | The segment is named, but buyers cannot recall, find, evaluate, or buy the offer when the need arises |

When evidence is thin, present the STP as a learning plan with hypotheses and tests. Do not turn an unvalidated segment into a confident campaign brief.

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

Where relevant to the context (service, nonprofit, people-intensive B2B), extend implications beyond the classic 4Ps to include People (staff, skills, training), Process (ordering, onboarding, support workflows), and Physical evidence (tangible cues, facilities, credentials).

Do not finish with only a table. Finish with the few choices the STP analysis supports and the evidence still missing.

## Output Template

```text
STP Marketing

Decision:
Market boundary:
Offer:
Geography/channel boundary:
TAM / SAM / SOM (if sized):
Evidence used:
Evidence missing:
Tooling/audience inputs used, if any:

Segmentation
1. Segment:
   Definition:
   Criteria:
   Primary difference:
   Need/job/trigger:
   Evidence provenance:
   Evidence strength: verified / source-supported / inferred / synthetic hypothesis / unverified
   Size/value proxy:
   Stability:
   Reachability:
   B2B roles, if relevant:
   Privacy/fairness risks:
   Positioning implication:
   Mental/physical availability implication:

Targeting
Primary target:
Why this segment wins:
LTV:CAC estimate or mission-value proxy:
Target role: primary / beachhead / secondary / watchlist / rejected
Rejected/secondary segments:
Targeting pattern:
Resource tradeoff:
Current reachability caveat:
Weakest claim + fastest responsible validation:

Positioning
For:
Who:
Offer/category:
Differentiated value:
Proof:
Alternative:
Positioning strategy type:
Role-specific proof, if B2B:

Implications
Product/service:
Price/funding:
Channel:
Promotion/message:
Sales/partnership:
Customer success/retention:
People/process/physical evidence (if relevant):
Research/validation:
AI search / agentic discovery, if relevant:
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
| Market share and portfolio balance | `bcg-matrix` | The task is about cash cow, star, question mark, and dog classification |
| Competitive strategy choice | `playing-to-win` | The task is about where to play and how to win at the highest strategic level |
| Build or tune ad-platform audiences, campaign settings, bid strategy, creative variants, or platform reports after the target and position are known | Direct campaign/platform execution | Platform activation consumes STP but does not replace segment strategy |
| Analyze CRM/CDP/product-analytics clusters without choosing a strategic target or positioning | Direct analytics / data analysis | Clustering and scoring can feed STP, but the task is data analysis unless it makes the segment-to-target-to-position choice |
| Generate synthetic personas or simulated interviews | `user-research` / `research-synthesis` when real research is needed; otherwise label as synthetic desk research | Synthetic personas are hypotheses, not validated market segments |
| Optimize SEO, AEO/GEO, AI Overviews, agentic website access, structured data, or content distribution after target and position are known | SEO/content/technical execution | AI-mediated discovery is a channel and visibility implication of the chosen position, not the STP method itself |
| Decide whether targeting sensitive attributes is lawful or compliant in a jurisdiction | Legal/compliance review outside this skill | STP can flag privacy and fairness risk but does not provide legal advice |
| Tactical marketing mix after target and position are known | Direct execution without this skill | The task is mainly Product, Price, Place, Promotion, People, Process, or Physical evidence |
| Copywriting sequence for a specific message | Direct copywriting | The task is wording a message, not choosing the customer segment and position |

## Verification

Before using this skill's output as a recommendation, check:

- [ ] The market boundary, geography/channel, offer, and decision are explicit.
- [ ] TAM, SAM, and SOM are sized or at least scoped where the decision depends on it, and the target is tested against the obtainable share, not the headline total.
- [ ] Segments are based on evidence-backed differences in need, behavior, intent, value, reachability, or buying process.
- [ ] Segment criteria are measurable or have honest proxies.
- [ ] Each segment's evidence is labeled by strength and provenance (observed behavior through synthetic inference), and claims resting only on analytics clusters or synthetic personas are marked provisional.
- [ ] Reachability is checked against channels and consented data available now, not deprecated third-party tracking.
- [ ] Any AI-generated or synthetic persona is labeled a hypothesis, its inferred-vs-observed content is marked, and it is not treated as a validated segment.
- [ ] Real-time/operational cohorts and predictive microsegments are distinguished from durable strategic segments.
- [ ] Segment size/value, growth/timing, reachability, competition, fit, economics, and risk are considered.
- [ ] LTV:CAC or a mission-value proxy is assessed for the chosen target, treated as a heuristic rather than a universal gate.
- [ ] A primary target is chosen, segments carry an explicit portfolio role (primary/beachhead/secondary/watchlist/rejected), and rejected/secondary segments are explained.
- [ ] For B2B, the account segment is separated from buying-center roles rather than collapsed into one persona.
- [ ] Every weak or provisional claim names a fastest-responsible validation test and the result that would change the target choice.
- [ ] The targeting pattern matches the organization's resources and strategy, and a focused/niche target is justified by a real resource, fit, or beachhead reason rather than narrowed so far that the brand loses broad mental and physical availability (easy to remember, find, evaluate, and buy) among category buyers.
- [ ] The positioning statement names target, need/job, category/frame, differentiated value, proof, and alternative, and the positioning strategy type fits the competitive context.
- [ ] The position changes product, price, channel, sales, promotion, or research decisions.
- [ ] Extended marketing-mix dimensions (people, process, physical evidence) are considered when contextually relevant.
- [ ] Sensitive or protected attributes are avoided unless the purpose is clearly lawful, beneficial, and privacy-safe; consented zero/first-party data was preferred where available.
- [ ] Evidence gaps and validation steps are stated.
- [ ] The answer routes standalone positioning, macro scanning, industry structure, value innovation, ad-platform/GEO execution, and tactical copy to their owner skills.

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `positioning` | The user already has a target segment and needs product/category/value-theme positioning, competitive-alternative framing, or a positioning statement only. |
| `pestel` | The user needs a macro-environment scan across political, economic, social, technological, environmental, and legal forces. |
| `porters-five-forces` | The user needs industry structure and profit-pressure analysis. |
| `blue-ocean-strategy` | The user wants to reconstruct market boundaries, create new demand, or design an ERRC grid/value curve. |
| `ansoff-matrix` | The user asks which product-market growth path to pursue. |
| `bcg-matrix` | The user needs portfolio classification by market share and growth rate. |
| `playing-to-win` | The user needs the highest-level "where to play / how to win" strategic choice. |
| Direct campaign/platform execution | The user needs to build or tune ad-platform audiences, bids, creative, or campaign settings after STP is settled. |
| Direct analytics / data analysis | The user needs cluster/propensity/CDP analysis without making the segment-to-target-to-position choice. |
| SEO/content/technical execution | The user needs SEO, AEO/GEO, structured data, or AI-search visibility work after target and position are known. |
| Legal/compliance review outside this skill | The user needs a ruling on whether sensitive-attribute targeting is lawful in a jurisdiction. |
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
- Scope: STP marketing strategy for products, services, programs, brands, and go-to-market plans: define the relevant market; segment buyers or users using behavior, need, demographic, geographic, psychographic, firmographic, technographic, account, intent/signal, job-to-be-done, or usage bases; test whether segments are measurable, substantial, accessible, differentiable or responsive, actionable, and privacy-safe; evaluate segment attractiveness, strategic fit, economics, growth, competitive intensity, reachability, and mission/objective fit; choose primary and optional secondary target segments; decide whether to use undifferentiated, differentiated, concentrated, micromarket, or account-based targeting; create a positioning statement for the chosen target and competitive frame; translate positioning into marketing-mix, product, channel, sales, and messaging implications; and state evidence gaps and validation needs. Excludes standalone positioning/category design without segmentation and target selection, broad macro-environment scanning, industry-structure analysis, value-curve/new-demand design, execution OKRs, and tactical channel/copy work as the primary task.

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
- Related: `positioning`, `pestel`, `porters-five-forces`, `blue-ocean-strategy`, `swot-tows`, `ansoff-matrix`, `expected-value`, `research-synthesis`, `user-research`, `bcg-matrix`, `playing-to-win`

**Concept**
- Mental model: STP marketing is a staged choice system. The primitives are a defined market, buyer/user population, segmentation bases, segment profiles, evidence quality, segment attractiveness, organizational fit, target selection, competitive frame, differentiated value, positioning statement, marketing-mix implications, validation plan, and monitoring signals. Segmentation creates candidate groups with meaningfully different needs or behaviors; targeting chooses which groups deserve focus given attractiveness and fit; positioning states how the offer should be understood by the chosen target relative to alternatives. Each stage constrains the next.
- Purpose: This skill prevents agents from writing generic personas, choosing favorite customers without evidence, or jumping to messaging before the market has been segmented and a target has been selected. It forces the agent to connect customer evidence to segment profiles, segment profiles to target choice, target choice to positioning, and positioning to downstream product, pricing, channel, sales, and communications decisions.
- Boundary: STP marketing is for the complete segmentation, targeting, and positioning sequence. It is not standalone positioning/category design, PESTEL macro scanning, Five Forces industry-structure analysis, Blue Ocean market-boundary reconstruction, Ansoff growth-path selection, OKR execution planning, copywriting, or tactical marketing-mix design as the primary task. Those methods may feed or follow STP, but they do not replace the segment-to-target-to-position chain.
- Analogy: STP marketing is like choosing a table at a crowded market before writing the sign: first separate the crowd into meaningful groups, then choose whom to serve, then say why this stall is the right one for that group.
- Common misconception: The common mistake is treating STP as a naming exercise: invent segments, pick one that sounds attractive, and write a tagline. A useful STP analysis is evidence-backed, explicit about segment criteria and attractiveness, honest about reachability and resource fit, clear about the competitive alternative, and specific enough that product, price, place, promotion, sales, and research decisions can follow. A second common mistake is assuming finer segmentation always improves performance: brand-growth evidence shows most growth comes from broad mental and physical availability, so a target can be narrowed past the point where the brand is still easy to remember and easy to buy.

**Grounding**
- Mode: `universal`
- Truth sources: `https://open.lib.umn.edu/principlesmarketing/chapter/5-2-how-markets-are-segmented/`, `https://open.lib.umn.edu/principlesmarketing/chapter/5-3-selecting-target-markets-and-target-market-strategies/`, `https://open.lib.umn.edu/principlesmarketing/chapter/5-4-positioning-and-repositioning-offerings/`, `https://hbr.org/1984/05/how-to-segment-industrial-markets`, `https://doi.org/10.2307/1247695`, `https://doi.org/10.1177/002224298705100201`, `https://strategyn.com/needs-based-segmentation/`, `https://marketingscience.info/news-and-insights/easy-to-find-being-where-b2b-buying-happens`, `skills/reasoning-strategy/stp-marketing/references/stp-marketing-sources.md`, `skills/reasoning-strategy/stp-marketing/references/upstream-displacement-2026-06-10.md`

**Keywords**
- `STP marketing`, `segmentation targeting positioning`, `market segmentation`, `target market selection`, `target audience strategy`, `positioning statement`, `perceptual map`, `differentiated marketing`, `niche targeting`, `go-to-market segmentation`

<!-- skill-graph-context:end -->
