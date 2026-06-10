---
name: principled-negotiation
description: "Use when preparing, structuring, or pressure-testing a negotiation with principled negotiation / BATNA: separate people from the problem, focus on interests rather than positions, invent options for mutual gain, use objective criteria, define BATNA / reservation value / ZOPA, and decide whether to accept, improve, or walk away. Do NOT use for generic persuasion copy (use microcopy or writing-humanizer), unilateral conflict diagnosis without a deal table, competitive strategy analysis (use playing-to-win, porters-five-forces, or seven-powers), or broad decision scoring without counterparties (use expected-value or prioritization). Do NOT use for Write persuasive landing-page copy for this offer. Do NOT use for Analyze rivalry, supplier power, buyer power, entrants, and substitutes. Do NOT use for Choose our winning aspiration, where to play, and how to win. Do NOT use for Rank these initiatives by expected value and downside risk. Do NOT use for Give legal advice on whether this contract clause is enforceable."
license: MIT
compatibility: "Markdown, negotiation briefs, deal memos, conflict-resolution plans, vendor/customer negotiations"
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"expected-value\",\"epistemic-grounding\",\"constraint-awareness\",\"playing-to-win\",\"positioning\",\"methodology\",\"microcopy\"],\"suppresses\":[\"expected-value\",\"playing-to-win\",\"positioning\"],\"verify_with\":[\"epistemic-grounding\",\"constraint-awareness\",\"expected-value\"]}"
  subject: reasoning-strategy
  scope: "Principled negotiation and BATNA methodology for preparing and conducting negotiations: map parties and issues, separate relationship from substance, convert positions into interests, create option packages, use objective criteria, compare offers to BATNA/reservation value/ZOPA, and choose accept, improve, pause, or walk away. Excludes persuasion copy, legal advice, crisis/hostage negotiation, broad business strategy, and one-party decision scoring without counterparties."
  public: "true"
  taxonomy_domain: foundations/negotiation
  stability: stable
  keywords: "[\"principled negotiation\",\"BATNA\",\"best alternative to a negotiated agreement\",\"Getting to Yes\",\"interest based bargaining\",\"negotiation on the merits\",\"objective criteria\",\"reservation value\",\"ZOPA\",\"mutual gain\"]"
  triggers: "[\"principled-negotiation\",\"batna\",\"getting-to-yes\"]"
  examples: "[\"Prepare a BATNA-based negotiation brief for this vendor renewal.\",\"Turn these fixed demands into interests, options, and objective criteria.\",\"Pressure-test whether we should accept this offer or walk away.\",\"Use principled negotiation to plan this salary discussion.\",\"Find the ZOPA and reservation values in this negotiation scenario.\"]"
  anti_examples: "[\"Write persuasive landing-page copy for this offer.\",\"Analyze rivalry, supplier power, buyer power, entrants, and substitutes.\",\"Choose our winning aspiration, where to play, and how to win.\",\"Rank these initiatives by expected value and downside risk.\",\"Give legal advice on whether this contract clause is enforceable.\"]"
  grounding: "{\"subject_matter\":\"Principled negotiation, BATNA, and interest-based bargaining from Getting to Yes and Harvard Program on Negotiation materials\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.pon.harvard.edu/daily/negotiation-skills-daily/principled-negotiation-focus-interests-create-value/\",\"https://www.pon.harvard.edu/daily/batna/translate-your-batna-to-the-current-deal/\",\"https://www.pon.harvard.edu/daily/batna/best-alternative-to-a-negotiated-agreement-beyond-the-basics/\",\"skills/skills/meta-methods/principled-negotiation/references/principled-negotiation-sources.md\",\"skills/skills/meta-methods/principled-negotiation/references/upstream-displacement-2026-05-31.md\"],\"failure_modes\":[\"positions_treated_as_interests\",\"agreement_pursued_below_batna\",\"relationship_issues_mixed_with_substance\",\"options_generated_after_commitment\",\"objective_criteria_missing_or_self_serving\",\"reservation_value_or_zopa_undefined\",\"fake_win_win_without_walkaway_discipline\",\"legal_or_hr_advice_overclaimed\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "Principled negotiation treats agreement as joint problem solving under walkaway discipline. The primitives are parties, issues, relationship concerns, positions, underlying interests, options for mutual gain, objective criteria, BATNAs, reservation values, and the zone of possible agreement. The method separates people from substantive problems, expands value before dividing it, and accepts only agreements that beat the relevant BATNA."
  purpose: "This skill prevents agents from treating negotiation as either hardball demands or friendly concession. It forces preparation around interests, alternatives, standards, option packages, and walkaway thresholds so the agent can improve the negotiation without recommending a bad deal just because an agreement is available."
  concept_boundary: "Principled negotiation is for preparing and conducting negotiations with counterparties. It is not generic persuasion, legal advice, crisis negotiation, compensation-policy design, competitive strategy formulation, product positioning, or one-party expected-value analysis. Those methods may inform a negotiation, but they do not replace interest-based bargaining and BATNA comparison."
  analogy: Principled negotiation is like designing a bridge both sides can cross while keeping a mapped exit road in case the bridge would lead somewhere worse than leaving.
  misconception: "The common mistake is thinking principled negotiation means being nice, compromising, or always reaching agreement. The method is cooperative about problem solving and firm about standards and BATNA; walking away from a worse-than-BATNA deal is success, not failure."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/principled-negotiation/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

## Concept of the skill

**What it is:** Principled negotiation is the Fisher, Ury, and Patton method from *Getting to Yes* for reaching wise agreements without positional bargaining. It uses four core moves: separate people from the problem, focus on interests rather than positions, invent options for mutual gain, and insist on objective criteria, while using BATNA as the walkaway discipline.

**Mental model:** A negotiation has two layers: the relationship process and the substantive deal problem. The agent maps parties, issues, interests, options, standards, BATNAs, reservation values, and the possible agreement range, then evaluates proposals against both value creation and walkaway thresholds.

**Why it exists:** Agents often choose between hard bargaining and accommodation. This skill gives a third path: collaborative problem solving without accepting a worse-than-alternative deal.

**What it is NOT:** It is not persuasion copy, legal advice, crisis negotiation, broad strategy, product positioning, or single-actor decision analysis.

**Adjacent concepts:** BATNA, reservation value, ZOPA, interest-based bargaining, objective criteria, mutual gain, issue trades, anchoring, mediation, deal design.

**One-line analogy:** Principled negotiation builds a bridge both sides can cross while keeping a mapped exit road.

**Common misconception:** It does not mean being agreeable. It means being soft on people, hard on the problem, creative on options, strict on standards, and willing to walk away.

# Principled Negotiation

## Domain Context

Use this skill when the user needs to prepare, structure, improve, or evaluate a negotiation. The counterpart may be a vendor, customer, employer, employee, partner, investor, landlord, buyer, seller, cofounder, internal stakeholder group, or any other party whose agreement matters.

Keep examples synthetic, public, or aggregate. Do not include personal data, confidential contract terms, employee records, payment data, customer identifiers, private health facts, or legal conclusions. When a negotiation touches employment, contracts, regulated claims, or legal rights, label the answer as negotiation preparation and recommend qualified professional review for legal or HR decisions.

The output of this skill is not a script for manipulating the other party. It is a negotiation brief: the interests at stake, value-creating options, objective standards, alternatives, walkaway logic, and next conversation moves.

## Coverage

This skill teaches agents to:

1. Decide whether principled negotiation is the right tool for the request.
2. Separate relationship/process issues from substantive deal issues.
3. Convert stated positions into underlying interests.
4. Invent multiple options for mutual gain before committing to one proposal.
5. Identify objective criteria and legitimacy standards both sides can discuss.
6. Define BATNA, reservation value, target value, and ZOPA.
7. Compare proposals against the user's BATNA rather than against agreement pressure.
8. Prepare issue trades, contingent terms, and package proposals.
9. Detect bad outputs: fake win-win language, ungrounded leverage claims, self-serving standards, and agreements below BATNA.

## Philosophy of the skill

Principled negotiation is useful because it refuses the false choice between being combative and being accommodating. A negotiator can protect the relationship without surrendering the substance, and can be firm about standards without turning the other party into the enemy.

The method makes an agent more disciplined in two ways. First, it expands the search space by separating positions from interests and generating options before commitment. Second, it protects the user from agreement bias by comparing any proposed deal against the best available alternative. Agreement is not the goal; a better-than-alternative agreement is the goal.

## 1. Decide Whether This Method Fits

Use principled negotiation when at least two parties can shape an agreement and the task involves interests, terms, trade-offs, standards, or walkaway decisions.

Do not use it when the user only needs:

| User need | Better fit |
| --- | --- |
| Choose company or product strategy | `playing-to-win`, `porters-five-forces`, `seven-powers`, or `blue-ocean-strategy` |
| Rank actions without counterparties | `expected-value` or `prioritization` |
| Write final persuasive text | `microcopy` or `writing-humanizer` |
| Diagnose management feedback | `radical-candor` |
| Decide legal enforceability | qualified legal review |
| Handle immediate safety or crisis negotiation | specialized crisis-response expertise |

If the request lacks negotiation facts, gather or infer the minimum map and label inferences clearly.

```text
Parties:
Decision to be negotiated:
Current positions:
Known interests:
Issues on the table:
Relationship concerns:
Objective standards available:
User's BATNA:
Counterparty's likely BATNA:
Deadline or constraints:
```

## 2. Separate People From the Problem

Start by naming the relationship/process issues separately from the substantive issues.

| Surface | What to capture | Example |
| --- | --- | --- |
| Perception | What each side may believe, fear, or misunderstand | "They may think we are bluffing about budget." |
| Emotion | What feelings could escalate the conversation | "The prior missed deadline created blame." |
| Communication | What needs clarification or active listening | "We need to restate their service-risk concern before proposing price." |
| Substance | The actual deal terms | "Renewal price, support SLA, termination rights." |

Do not tell the user to ignore emotions. Address emotional and relational concerns directly while keeping them separate from the issue list.

## 3. Convert Positions Into Interests

Positions are what a party says it wants. Interests are why that position matters.

| Party | Position | Possible interests | Evidence | Questions to ask |
| --- | --- | --- | --- | --- |
| User | | | | |
| Counterparty | | | | |

Use interests that can explain trade-offs: cost control, certainty, speed, risk reduction, status, fairness, implementation burden, flexibility, confidentiality, capacity, timing, or precedent.

Reject interest claims that are just positions with softer words. "They are interested in a 20% discount" is still a position. "They need predictable total cost before budget close" is an interest.

## 4. Invent Options Before Committing

Generate several possible packages before recommending one. Separate option creation from option judgment.

| Option package | Interests served | Trade-off logic | Objective criteria needed | Risks |
| --- | --- | --- | --- | --- |
| Package A | | | | |
| Package B | | | | |
| Package C | | | | |

Useful option types:

- issue trades: give on a lower-priority issue to gain on a higher-priority one,
- contingent terms: tie price, bonus, scope, or renewal to a measurable future condition,
- timing changes: phase, defer, accelerate, or sequence commitments,
- risk allocation: warranties, caps, pilots, termination rights, escrow, milestones,
- non-monetary value: references, training, implementation support, exclusivity, data access.

Do not present a single compromise as "mutual gain" unless it explains which interests each side gets and why the package beats both sides' alternatives.

## 5. Use Objective Criteria

Objective criteria are standards outside either side's pure will. They reduce arbitrary haggling and help both sides explain the agreement.

| Criterion | Source | Who is likely to accept it | How it affects terms |
| --- | --- | --- | --- |
| Market benchmark | | | |
| Comparable deal | | | |
| Expert or independent standard | | | |
| Legal/professional norm | | | |
| Cost or performance data | | | |

Good standards are relevant, independent, current enough, and discussable by both sides. Weak standards are self-serving, cherry-picked, stale, confidential without permission, or unrelated to the actual issue.

When criteria conflict, list the conflict instead of pretending the standard settles the deal.

## 6. Define BATNA, Reservation Value, and ZOPA

BATNA is what the user will do if no agreement is reached. It is not the user's target, wish, fallback ask, or threat unless it is actually executable.

| Concept | Meaning | Agent check |
| --- | --- | --- |
| BATNA | Best available action if this negotiation fails | Is it real, executable, and improveable? |
| Reservation value | Worst acceptable deal before walking away | Does it translate BATNA into the negotiated terms? |
| Target value | Ambitious but defensible outcome | Is it grounded in interests and criteria? |
| ZOPA | Range where both sides prefer agreement over alternatives | Are both reservation values estimated? |

Use this sequence:

1. Identify the user's best no-deal alternative.
2. Improve it if possible before negotiating.
3. Translate the BATNA into a reservation value for this deal.
4. Estimate the counterparty's likely BATNA and reservation value.
5. Check whether a ZOPA plausibly exists.
6. Reject or redesign deals below the user's reservation value.

Do not overstate leverage. A BATNA is strong when it is better, more certain, and more executable than the proposed deal.

## 7. Build a Negotiation Brief

Use this output structure for most requests:

```text
Negotiation goal:
Parties and decision:

People/process issues:
- Perceptions:
- Emotions:
- Communication:

Substantive issues:
- Issue 1:
- Issue 2:

Interests:
- User:
- Counterparty:

Options for mutual gain:
1.
2.
3.

Objective criteria:
- Standard:
- Evidence needed:

BATNA and walkaway:
- User BATNA:
- Improve BATNA by:
- Reservation value:
- Counterparty likely BATNA:
- Possible ZOPA:

Recommended next move:
- Opening frame:
- Questions to ask:
- Package to propose:
- Conditions for accepting:
- Conditions for walking away:
```

## 8. Handle Hard Bargaining Without Copying It

Principled negotiation does not require trusting every counterpart. If the other side uses threats, stonewalling, deception, or positional pressure, keep the method and strengthen evidence.

| Tactic observed | Principled response |
| --- | --- |
| Extreme anchor | Ask for objective criteria and explain your standard. |
| "Take it or leave it" | Compare to BATNA; ask what problem the term solves. |
| Personal attack | Name the process issue and return to the substantive problem. |
| Hidden authority | Clarify who can commit and what approval path exists. |
| Moving goalposts | Document prior criteria and ask what changed. |
| False urgency | Test deadline legitimacy against BATNA and objective constraints. |

Never recommend deception, false BATNAs, fake deadlines, or disclosure of confidential information. If the facts are uncertain, say what evidence is needed before choosing a tactic.

## Verification

Before finalizing a negotiation answer, check:

- [ ] Parties, issues, interests, options, criteria, and BATNA are all explicit.
- [ ] At least one stated position has been converted into an underlying interest.
- [ ] The answer creates options before selecting a package.
- [ ] Objective criteria are independent enough to be discussable.
- [ ] The user's BATNA and reservation value are separated from their target.
- [ ] The recommendation says when to accept, improve, pause, or walk away.
- [ ] Legal, HR, safety, and confidentiality limits are clearly bounded.
- [ ] No private, personal, or confidential facts are invented or exposed.

## Do NOT Use When

| Use instead | When |
| --- | --- |
| `expected-value` | The user needs to choose among actions without an active counterparty or deal table. |
| `playing-to-win` | The user needs an integrated business or product strategy cascade before negotiating. |
| `positioning` | The user needs to frame a product's differentiated value to a market. |
| `radical-candor` | The user needs a management feedback conversation, not an agreement structure. |
| Legal counsel | The user asks whether a term is lawful, enforceable, or compliant. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Public: `true`
- Domain: `foundations/negotiation`
- Scope: Principled negotiation and BATNA methodology for preparing and conducting negotiations: map parties and issues, separate relationship from substance, convert positions into interests, create option packages, use objective criteria, compare offers to BATNA/reservation value/ZOPA, and choose accept, improve, pause, or walk away. Excludes persuasion copy, legal advice, crisis/hostage negotiation, broad business strategy, and one-party decision scoring without counterparties.

**When to use**
- Prepare a BATNA-based negotiation brief for this vendor renewal.
- Turn these fixed demands into interests, options, and objective criteria.
- Pressure-test whether we should accept this offer or walk away.
- Use principled negotiation to plan this salary discussion.
- Find the ZOPA and reservation values in this negotiation scenario.
- Triggers: `principled-negotiation`, `batna`, `getting-to-yes`

**Not for**
- Write persuasive landing-page copy for this offer.
- Analyze rivalry, supplier power, buyer power, entrants, and substitutes.
- Choose our winning aspiration, where to play, and how to win.
- Rank these initiatives by expected value and downside risk.
- Give legal advice on whether this contract clause is enforceable.

**Related skills**
- Verify with: `epistemic-grounding`, `constraint-awareness`, `expected-value`
- Related: `expected-value`, `epistemic-grounding`, `constraint-awareness`, `playing-to-win`, `positioning`, `methodology`, `microcopy`

**Concept**
- Mental model: Principled negotiation treats agreement as joint problem solving under walkaway discipline. The primitives are parties, issues, relationship concerns, positions, underlying interests, options for mutual gain, objective criteria, BATNAs, reservation values, and the zone of possible agreement. The method separates people from substantive problems, expands value before dividing it, and accepts only agreements that beat the relevant BATNA.
- Purpose: This skill prevents agents from treating negotiation as either hardball demands or friendly concession. It forces preparation around interests, alternatives, standards, option packages, and walkaway thresholds so the agent can improve the negotiation without recommending a bad deal just because an agreement is available.
- Boundary: Principled negotiation is for preparing and conducting negotiations with counterparties. It is not generic persuasion, legal advice, crisis negotiation, compensation-policy design, competitive strategy formulation, product positioning, or one-party expected-value analysis. Those methods may inform a negotiation, but they do not replace interest-based bargaining and BATNA comparison.
- Analogy: Principled negotiation is like designing a bridge both sides can cross while keeping a mapped exit road in case the bridge would lead somewhere worse than leaving.
- Common misconception: The common mistake is thinking principled negotiation means being nice, compromising, or always reaching agreement. The method is cooperative about problem solving and firm about standards and BATNA; walking away from a worse-than-BATNA deal is success, not failure.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.pon.harvard.edu/daily/negotiation-skills-daily/principled-negotiation-focus-interests-create-value/`, `https://www.pon.harvard.edu/daily/batna/translate-your-batna-to-the-current-deal/`, `https://www.pon.harvard.edu/daily/batna/best-alternative-to-a-negotiated-agreement-beyond-the-basics/`, `skills/skills/meta-methods/principled-negotiation/references/principled-negotiation-sources.md`, `skills/skills/meta-methods/principled-negotiation/references/upstream-displacement-2026-05-31.md`

**Keywords**
- `principled negotiation`, `BATNA`, `best alternative to a negotiated agreement`, `Getting to Yes`, `interest based bargaining`, `negotiation on the merits`, `objective criteria`, `reservation value`, `ZOPA`, `mutual gain`

<!-- skill-graph-context:end -->
