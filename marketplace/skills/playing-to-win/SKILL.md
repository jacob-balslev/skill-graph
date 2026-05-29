---
name: playing-to-win
description: "Use when turning a vague business strategy, product strategy, market-entry decision, or initiative plan into an integrated Playing to Win strategy cascade: winning aspiration, where to play, how to win, must-have capabilities, and management systems. Covers Lafley/Martin choice-making, fit across the five choices, trade-off pressure, reverse tests, capability-system alignment, and the difference between strategy and planning. Do NOT use for competitive-industry structure analysis (use a five-forces skill when available), generic backlog scoring (use prioritization), or broad process-gate design (use methodology). Do NOT use for analyze whether this industry has attractive supplier power and threat of substitutes. Do NOT use for score these ten backlog items by impact and effort. Do NOT use for design a quality gate process for this multi-step implementation. Do NOT use for write OKRs for this strategy after it has already been chosen."
license: MIT
compatibility: "Markdown, strategy memos, product strategy, executive decision-making"
allowed-tools: Read Grep
metadata:
  last_audited: "2026-05-28"
  lint_verdict: PASS
  schema_version: "8"
  version: "1.0.0"
  subject: meta-methods
  deployment_target: portable
  taxonomy_domain: foundations/strategy
  owner: skill-graph-maintainer
  freshness: "2026-05-26"
  drift_check: "{\"last_verified\":\"2026-05-26\",\"truth_source_hashes\":{\"skills/meta-methods/playing-to-win/references/playing-to-win-sources.md\":\"893c99345dc9ee846548ff71f3b1cea07bdf5286c3ab10429705f9b139cb4599\",\"skills/meta-methods/playing-to-win/references/upstream-displacement-2026-05-26.md\":\"c47197db5053b744d57abd323670098df4f555171a0ad9d5324adf259b445403\"}}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: stable
  keywords: "[\"playing to win\",\"strategy cascade\",\"strategic choice cascade\",\"winning aspiration\",\"where to play\",\"how to win\",\"strategy choices\",\"capability system\",\"management systems\",\"lafley martin\"]"
  examples: "[\"turn this vague growth plan into a Playing to Win cascade\",\"we need a product strategy for a narrow segment; help choose where to play and how to win\",\"our strategy doc has goals and initiatives but no trade-offs; apply Lafley/Martin\",\"pressure-test whether these capabilities actually support our how-to-win choice\",\"rewrite this market-entry plan as winning aspiration, where to play, how to win, capabilities, and systems\"]"
  anti_examples: "[\"analyze whether this industry has attractive supplier power and threat of substitutes\",\"score these ten backlog items by impact and effort\",\"design a quality gate process for this multi-step implementation\",\"write OKRs for this strategy after it has already been chosen\"]"
  relations: "{\"boundary\":[{\"skill\":\"prioritization\",\"reason\":\"prioritization scores a queue of work; playing-to-win owns the upstream integrated strategy choices that decide what work should exist\"},{\"skill\":\"framework-fit-analysis\",\"reason\":\"framework-fit-analysis selects among methods; playing-to-win applies one specific strategy-cascade method once selected\"},{\"skill\":\"methodology\",\"reason\":\"methodology designs rigorous process and verification gates; playing-to-win owns competitive and organizational strategy choices\"}],\"related\":[\"constraint-awareness\",\"methodology\",\"framework-fit-analysis\"],\"verify_with\":[\"methodology\",\"epistemic-grounding\"]}"
  grounding: "{\"subject_matter\":\"Playing to Win strategy cascade by A.G. Lafley and Roger L. Martin\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://hbr.org/books/playing-to-win\",\"https://hbr.org/webinar/2013/04/a-playbook-for-winning\",\"https://www-2.rotman.utoronto.ca/insightshub/strategy-value-creation/playing-to-win-how-strategy-re\",\"skills/meta-methods/playing-to-win/references/playing-to-win-sources.md\",\"skills/meta-methods/playing-to-win/references/upstream-displacement-2026-05-26.md\"],\"failure_modes\":[\"goal_list_without_choice\",\"where_to_play_too_broad\",\"how_to_win_not_differentiated\",\"capabilities_not_tied_to_advantage\",\"management_systems_missing\",\"cascade_choices_do_not_reinforce\",\"strategy_confused_with_planning\"],\"evidence_priority\":\"general_knowledge_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  mental_model: "Playing to Win treats strategy as five mutually reinforcing choices, not as a plan, goal list, or analysis deck. The primitives are a winning aspiration, a chosen playing field, a differentiated way to win there, the capabilities required to deliver that advantage, and the management systems that build and sustain those capabilities. The cascade works only when the answers fit together and force trade-offs."
  purpose: "This skill prevents agents from producing strategy-shaped prose that lacks choices. It replaces broad aspirations, market summaries, and initiative lists with an explicit cascade that says what the organization will do, what it will not do, why it can win in the chosen arena, and what must be true operationally for the choice to work."
  boundary: "Playing to Win is for strategy formulation and choice integration. It is not Porter's Five Forces industry-structure diagnosis, Seven Powers moat taxonomy, OKR execution tracking, generic prioritization, scenario planning, or full financial valuation. Those tools may feed or follow the cascade, but they do not replace the five integrated choices."
  analogy: "A strategy cascade is like designing a bridge from both banks at once: the aspiration and market choice define one side, the advantage and capability system define the other, and the bridge fails if the pieces do not meet in the middle."
  misconception: "The common mistake is filling the five boxes independently. The cascade is not a worksheet; changing one answer should force a re-check of the others, because an aspiration with no winnable arena is hope and a how-to-win with no supporting capabilities is fantasy."
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/meta-methods/playing-to-win/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Playing to Win

## Concept Card

**What it is:** Playing to Win is A.G. Lafley and Roger L. Martin's strategy-cascade method. It frames strategy as an integrated set of five choices: winning aspiration, where to play, how to win, must-have capabilities, and management systems.

**Mental model:** Strategy is not a document that collects goals and initiatives. It is a coherent choice system. Each answer narrows and constrains the next answer, then the later answers pressure-test the earlier ones.

**Why it exists:** Agents often produce generic strategy prose: "grow revenue," "serve customers," "differentiate," "execute well." The cascade forces the missing choices into the open: which customers, markets, channels, offers, advantage, activities, capabilities, measures, and routines.

**What it is not:** It is not an industry attractiveness analysis, a moat taxonomy, an OKR tree, a roadmap, a backlog-prioritization table, or a financial model. Those can support the cascade, but the cascade owns the integrated strategy choice.

**Adjacent concepts:** Strategic choice cascade, strategy choice, where-to-play/how-to-win, activity systems, capability systems, reverse testing, competitive advantage, trade-offs.

**One-line analogy:** Playing to Win is a set of interlocking gears: if one gear turns, the others must still mesh.

**Common misconception:** The five questions are not five independent brainstorm prompts. They must fit together and reinforce each other.

## Coverage

This skill teaches agents to:

1. Convert strategy prose into the five cascade choices.
2. Separate strategy from planning, goals, initiatives, and analysis.
3. Make the `where to play` choice concrete across customer, geography, channel, product/service, value-chain stage, and occasion.
4. Make the `how to win` choice a real advantage, not a slogan.
5. Identify capabilities that are necessary because of the how-to-win choice.
6. Define management systems that build, measure, and sustain the capabilities.
7. Pressure-test fit across all five choices.
8. Surface trade-offs, no-go choices, and assumptions that must be true.

## Philosophy

Playing to Win is useful because it makes strategy expensive in the right place: choice. A vague strategy feels easy because it refuses trade-offs. A real strategy creates tension. It chooses one arena over another, one advantage logic over another, one capability system over another, and one management rhythm over another.

The cascade is not a guarantee that the strategy is correct. It is a forcing function that makes the strategy inspectable. Once the choices are explicit, an agent can ask whether they fit, whether they are feasible, whether competitors can copy them, and what evidence would change the decision.

## The Five Choices

| Choice | Question | Good answer | Weak answer |
| --- | --- | --- | --- |
| Winning aspiration | What does winning mean for this organization or initiative? | Specific enough to guide choices and define success | "Be the best", "grow", "delight users" |
| Where to play | In which arenas will we compete? | Clear customer, segment, geography, channel, category, use case, or value-chain scope | "Everyone", "SMBs", "global market" |
| How to win | What advantage lets us win in that arena? | Distinct value equation, cost position, experience, access, speed, trust, data, or system advantage | "Better product", "great UX", "AI-powered" |
| Capabilities | What must we be excellent at to deliver that advantage? | Few must-have activities tied directly to how-to-win | Generic functions every company needs |
| Management systems | What routines, metrics, structures, and incentives sustain the capabilities? | Concrete review cadence, metrics, decision rights, resource allocation, learning loops | "Execute", "track KPIs", "communicate" |

## Workflow

### 1. Extract the current implied strategy

Read the existing plan and identify what it already implies.

```text
Current aspiration:
Current where-to-play:
Current how-to-win:
Current capabilities:
Current management systems:
Unstated assumptions:
No-go choices:
```

If the source material only contains initiatives, infer the missing choices and label them as inferred. Do not present inferred choices as confirmed.

### 2. Make where-to-play concrete

Specify the arena with at least three dimensions when possible.

| Dimension | Examples |
| --- | --- |
| Customer or user | enterprise admins, solo operators, first-time buyers, expert teams |
| Need or occasion | urgent repair, recurring workflow, high-risk decision, low-cost habit |
| Product or service category | onboarding tool, compliance service, analytics dashboard |
| Geography or regulation | US-only, EU-regulated, local-market dependent |
| Channel | self-serve, partner-led, marketplace, enterprise sales |
| Value-chain stage | discovery, purchase, fulfillment, operations, retention |

The test: a competitor should be able to tell what you are choosing not to pursue.

### 3. Make how-to-win falsifiable

Describe why the chosen customers will prefer this offer against the relevant alternative.

Strong how-to-win statements name:

- the target customer's job or pain,
- the alternative they would otherwise use,
- the specific value equation you improve,
- the hard-to-copy system that makes the improvement durable enough,
- the evidence that would show the advantage is working.

Weak how-to-win statements use adjectives without mechanism: better, easier, smarter, delightful, AI-powered, premium, trusted.

### 4. Tie capabilities to the advantage

Capabilities are not departments. They are things the organization must do unusually well because the how-to-win demands them.

Use this check:

```text
If our how-to-win is true, we must be excellent at:
1.
2.
3.

If we are not excellent at those, the strategy fails because:
```

Keep the list short. A long list means the advantage is vague or the strategy is actually multiple strategies.

### 5. Define management systems

Management systems make the strategy persistent. They decide what gets measured, funded, reviewed, escalated, rewarded, and learned.

At minimum, define:

- decision cadence,
- owner for each capability,
- leading indicators,
- lagging indicators,
- review ritual,
- resource-allocation rule,
- kill or pivot trigger.

If the cascade has no management systems, it is a workshop artifact, not an operating strategy.

## Fit Checks

Run these checks before presenting the strategy as coherent.

| Check | Failure signal | Repair |
| --- | --- | --- |
| Aspiration/arena fit | The aspiration cannot be achieved in the chosen arena | Narrow or change aspiration, or choose a different arena |
| Arena/advantage fit | The how-to-win does not matter to the chosen customer | Rebuild the value proposition around that customer's real trade-off |
| Advantage/capability fit | Required capabilities are generic or missing | Name the few capabilities that make the advantage possible |
| Capability/system fit | No routines or metrics build the capabilities | Add operating mechanisms, owners, and review cadence |
| Trade-off clarity | Nothing is explicitly excluded | State no-go segments, channels, products, or behaviors |
| Reverse test | Competitors would happily choose the opposite | If not, the choice is probably a platitude |

## Output Template

Use this compact shape for strategy work.

```text
Playing to Win cascade

Winning aspiration:

Where to play:
- Customer/segment:
- Need/occasion:
- Product/category:
- Geography/channel/value-chain scope:
- Explicit no-go:

How to win:
- Advantage:
- Relevant alternative:
- Why the target chooses us:
- Evidence that this is working:

Must-have capabilities:
1.
2.
3.

Management systems:
- Metrics:
- Cadence:
- Decision rights:
- Resource allocation:
- Kill/pivot trigger:

Fit risks:
- Choice mismatch:
- Assumption to test:
- Capability gap:
```

## Boundaries

Use Playing to Win when the task is to define or repair the strategy choice system.

Use another tool when the task is narrower:

| Need | Better owner |
| --- | --- |
| Industry structure, bargaining power, substitutes, entrants | Porter's Five Forces skill when available |
| Durable moat source taxonomy | Seven Powers skill when available |
| Creating execution objectives after strategy is chosen | OKRs skill when available |
| Ranking backlog items by effort, impact, confidence, or urgency | `prioritization` |
| Choosing which framework to apply | `framework-fit-analysis` |
| Designing quality gates or process methodology | `methodology` |

## Verification

Before finishing, verify:

- [ ] The answer contains all five choices.
- [ ] `Where to play` is narrow enough to exclude real alternatives.
- [ ] `How to win` names a mechanism of advantage, not just an adjective.
- [ ] Capabilities follow from the how-to-win choice.
- [ ] Management systems include owners, metrics, cadence, and decision rights.
- [ ] The choices reinforce each other.
- [ ] At least one no-go trade-off is explicit.
- [ ] Unverified assumptions are labeled as assumptions.
- [ ] The response does not present a plan, roadmap, OKR tree, or market analysis as a strategy cascade.

## References

- `references/playing-to-win-sources.md`
- `references/upstream-displacement-2026-05-26.md`

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `meta-methods`
- Deployment: `portable`
- Domain: `foundations/strategy`

**When to use**
- turn this vague growth plan into a Playing to Win cascade
- we need a product strategy for a narrow segment; help choose where to play and how to win
- our strategy doc has goals and initiatives but no trade-offs; apply Lafley/Martin
- pressure-test whether these capabilities actually support our how-to-win choice
- rewrite this market-entry plan as winning aspiration, where to play, how to win, capabilities, and systems

**Not for**
- analyze whether this industry has attractive supplier power and threat of substitutes
- score these ten backlog items by impact and effort
- design a quality gate process for this multi-step implementation
- write OKRs for this strategy after it has already been chosen
- Owned by `prioritization`
- Owned by `framework-fit-analysis`
- Owned by `methodology`

**Related skills**
- Verify with: `methodology`, `epistemic-grounding`
- Related: `constraint-awareness`, `methodology`, `framework-fit-analysis`

**Concept**
- Mental model: Playing to Win treats strategy as five mutually reinforcing choices, not as a plan, goal list, or analysis deck. The primitives are a winning aspiration, a chosen playing field, a differentiated way to win there, the capabilities required to deliver that advantage, and the management systems that build and sustain those capabilities. The cascade works only when the answers fit together and force trade-offs.
- Purpose: This skill prevents agents from producing strategy-shaped prose that lacks choices. It replaces broad aspirations, market summaries, and initiative lists with an explicit cascade that says what the organization will do, what it will not do, why it can win in the chosen arena, and what must be true operationally for the choice to work.
- Boundary: Playing to Win is for strategy formulation and choice integration. It is not Porter's Five Forces industry-structure diagnosis, Seven Powers moat taxonomy, OKR execution tracking, generic prioritization, scenario planning, or full financial valuation. Those tools may feed or follow the cascade, but they do not replace the five integrated choices.
- Analogy: A strategy cascade is like designing a bridge from both banks at once: the aspiration and market choice define one side, the advantage and capability system define the other, and the bridge fails if the pieces do not meet in the middle.
- Common misconception: The common mistake is filling the five boxes independently. The cascade is not a worksheet; changing one answer should force a re-check of the others, because an aspiration with no winnable arena is hope and a how-to-win with no supporting capabilities is fantasy.

**Grounding**
- Mode: `universal`
- Truth sources: `https://hbr.org/books/playing-to-win`, `https://hbr.org/webinar/2013/04/a-playbook-for-winning`, `https://www-2.rotman.utoronto.ca/insightshub/strategy-value-creation/playing-to-win-how-strategy-re`, `skills/meta-methods/playing-to-win/references/playing-to-win-sources.md`, `skills/meta-methods/playing-to-win/references/upstream-displacement-2026-05-26.md`

**Lifecycle & audit status**
- Stability: `stable`
- Freshness: `2026-05-26`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth UNVERIFIED, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `playing to win`, `strategy cascade`, `strategic choice cascade`, `winning aspiration`, `where to play`, `how to win`, `strategy choices`, `capability system`, `management systems`, `lafley martin`
