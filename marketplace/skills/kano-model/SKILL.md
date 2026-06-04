---
name: kano-model
description: "Use when classifying product features, service attributes, customer needs, or roadmap candidates with the Kano model: must-be/basic quality, performance/one-dimensional quality, attractive/delighter quality, indifferent quality, reverse quality, and questionable responses. Covers paired functional/dysfunctional survey design, segment-specific classification, feature-priority implications, category migration over time, and the boundary between Kano analysis and general backlog scoring. Do NOT use for generic RICE/ICE/MoSCoW ranking without customer-response evidence (use prioritization), open-ended research synthesis (use user-research or research-synthesis), or product-market positioning (use positioning). Do NOT use for Rank this backlog by reach, impact, confidence, and effort. Do NOT use for Synthesize these interview transcripts into research themes. Do NOT use for Design a generic quality-improvement process with DMAIC or PDCA."
license: MIT
compatibility: "Markdown, product briefs, roadmap analysis, customer-needs research, quality planning"
allowed-tools: Read Grep
metadata:
  relations: "{\"boundary\":[\"prioritization\"]}"
  schema_version: "8"
  version: "1.0.0"
  subject: reasoning-strategy
  deployment_target: portable
  scope: "Kano model feature and customer-need classification for product, service, and quality decisions: classify candidate features by satisfaction response to presence and absence, design paired functional/dysfunctional questions, handle segment differences, translate must-be/performance/attractive/indifferent/reverse categories into roadmap implications, and avoid over-ranking delighters before basics. Excludes generic backlog scoring without customer-response evidence, broad qualitative research synthesis, product-market positioning, and financial expected-value comparison."
  taxonomy_domain: foundations/product-strategy
  owner: skill-graph-maintainer
  freshness: "2026-06-01"
  drift_check: "{\"last_verified\":\"2026-06-01\",\"truth_source_hashes\":{\"skills/skills/meta-methods/kano-model/references/kano-model-sources.md\":\"5475489cb775d47510d5cbffcc1d709f49cc59a920e59ac9cb7d750a7804a811\",\"skills/skills/meta-methods/kano-model/references/upstream-displacement-2026-06-01.md\":\"37d2a0d5618b633ade01432772c1ff1cb785980b64cf2b8d0967c218b154ded5\"}}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: present
  stability: stable
  keywords: "[\"Kano model\",\"customer satisfaction\",\"must-be quality\",\"performance needs\",\"delighters\",\"attractive quality\",\"feature prioritization\",\"Kano survey\",\"reverse quality\",\"indifferent quality\"]"
  triggers: "[\"kano-model\",\"kano-analysis\",\"kano-survey\"]"
  examples: "[\"Use the Kano model to classify these feature requests into must-be, performance, delighter, indifferent, and reverse categories.\",\"Design a Kano survey for these roadmap candidates.\",\"Use the Kano model to classify faster search as performance quality and SSO as must-be quality.\",\"Which of these features are delighters versus basics for this customer segment?\",\"Explain Kano category drift when an old delighter becomes a must-have expectation.\"]"
  anti_examples: "[\"Rank this backlog by reach, impact, confidence, and effort.\",\"Synthesize these interview transcripts into research themes.\",\"Design a generic quality-improvement process with DMAIC or PDCA.\"]"
  grounding: "{\"subject_matter\":\"Kano model feature classification and customer-defined quality analysis\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.jstage.jst.go.jp/article/quality/14/2/14_KJ00002952366/_article\",\"https://asq.org/quality-resources/kano-model\",\"https://cir.nii.ac.jp/crid/1571980075723369472\",\"https://www.walden-family.com/public/cqm-journal/2-4-Whole-Issue.pdf\",\"skills/skills/meta-methods/kano-model/references/kano-model-sources.md\",\"skills/skills/meta-methods/kano-model/references/upstream-displacement-2026-06-01.md\"],\"failure_modes\":[\"treating_requested_features_as_equally_valuable\",\"ranking_delighters_before_unmet_basics\",\"classifying_from_feature_names_without_customer_evidence\",\"ignoring_segment_specific_response_patterns\",\"using_yes_no_preference_questions_as_kano_data\",\"missing_reverse_quality_signals\",\"assuming_delighters_stay_delighters_forever\",\"replacing_prioritization_with_kano_categories_alone\"],\"evidence_priority\":\"general_knowledge_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  comprehension_state: present
  mental_model: "Kano analysis maps how a defined customer segment reacts when a feature is present versus absent. The primitives are segment, candidate feature, functional question, dysfunctional question, response pair, quality category, satisfaction effect, dissatisfaction effect, evidence confidence, and time. Must-be features prevent dissatisfaction, performance features move satisfaction roughly with execution quality, attractive features create upside when present without penalty when absent, indifferent features do not matter much, reverse features hurt some users, and questionable responses signal confusion or bad survey design."
  purpose: "This skill prevents agents from treating all feature requests as the same kind of demand. It forces the answer to distinguish basics customers punish you for missing, performance attributes customers reward proportionally, delighters that can differentiate only after basics are covered, indifferent ideas that should not consume roadmap capacity, and reverse features that help one segment while hurting another."
  boundary: "The Kano model is for classifying customer satisfaction response patterns to candidate features or service attributes. It is not a complete prioritization score, open-ended user-research synthesis, positioning strategy, expected-value calculation, accessibility or safety gate, or proof that a feature is worth building. Kano categories can feed those decisions, but they do not replace cost, feasibility, strategy, risk, or evidence-quality checks."
  analogy: "Kano analysis is like a control panel with different levers: some only stop alarms, some raise the gauge steadily, some create a burst of delight, and some should not be pulled for the wrong audience."
  misconception: "The common mistake is thinking delighters are always the highest priority. In Kano reasoning, missing basics can destroy satisfaction, performance attributes may deserve steady investment, and delighters only matter when they fit the segment and do not mask must-be gaps."
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_changed: "2026-06-01"
  last_audited: "2026-06-01"
  lint_verdict: PASS
  drift_status: EXTERNAL_UNHASHED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/reasoning-strategy/kano-model/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

## Concept of the skill

**What it is:** The Kano model is Noriaki Kano's quality and customer-satisfaction framework for classifying features by how customers react when the feature is present and when it is absent.

**Mental model:** A feature does not have one universal priority score. For a specific customer segment, its presence and absence create a response pattern: must-be basics prevent dissatisfaction, performance attributes move satisfaction proportionally, attractive features delight when present, indifferent features do little, reverse features hurt, and questionable responses need cleanup.

**Why it exists:** Agents often treat every requested feature as a backlog item with a score. Kano reasoning asks what kind of satisfaction mechanism the feature has before ranking it.

**What it is NOT:** It is not RICE, ICE, MoSCoW, expected value, open-ended research synthesis, product positioning, or a substitute for non-negotiable safety, accessibility, reliability, or legal requirements.

**Adjacent concepts:** customer needs, voice of customer, quality function deployment, feature prioritization, delighters, hygiene factors, product research, segmentation, roadmap planning, satisfaction coefficients.

**One-line analogy:** Kano analysis is a control panel where different levers stop alarms, steadily raise satisfaction, create surprise delight, do nothing, or make the wrong users unhappy.

**Common misconception:** Delighters are not automatically the top priority. Basics that are missing can dominate satisfaction, and a delighter can become expected over time.

# Kano Model

## Domain Context

Use this skill when the user has candidate product features, service attributes, customer needs, or roadmap ideas and needs to understand how each one affects customer satisfaction. The method is useful for product management, service design, quality planning, roadmap trade-offs, and customer-needs research.

Keep examples synthetic, public, or aggregate. Do not include personal data, customer identifiers, payment data, private support tickets, confidential roadmap details, or raw interview transcripts unless the user has already supplied them for the task and they are safe to process.

The output of this skill is a Kano analysis brief: customer segment, feature list, evidence quality, category classification, category-specific roadmap implication, and follow-up research or prioritization step.

## Coverage

This skill teaches agents to:

1. Decide whether Kano analysis fits the request.
2. Define the customer segment and decision context before classifying features.
3. Phrase each candidate as a user-visible feature, capability, or service attribute.
4. Design paired functional and dysfunctional questions.
5. Classify responses as must-be, performance, attractive, indifferent, reverse, or questionable.
6. Interpret category implications without over-ranking delighters.
7. Handle segment splits, weak evidence, and category migration over time.
8. Feed Kano results into prioritization, positioning, research, or expected-value work without replacing those methods.
9. Detect bad Kano work: classification from feature names alone, yes/no preference questions, averaged-away reverse quality, and stale delighter labels.

## Philosophy of the skill

The Kano model matters because customer satisfaction is asymmetric. The absence of one feature can make a product unacceptable, while the presence of another feature creates little extra satisfaction because users already assume it will be there. A third feature may create delight precisely because users did not expect it. Treating all three as ordinary backlog items hides the real product risk.

The method is not "ask customers what they want and build the highest-scoring request." It is a disciplined way to reveal the shape of customer response. The best Kano answer protects basics, invests deliberately in performance attributes, treats delighters as segment-specific bets, and avoids building indifferent or reverse features just because they sound clever.

## 1. Decide Whether Kano Fits

Use Kano analysis when the request asks how feature presence or absence affects satisfaction for a defined customer segment.

Do not use Kano as the primary method when the user needs:

| User need | Better fit |
| --- | --- |
| Rank a whole backlog by reach, impact, confidence, and effort | `prioritization` |
| Synthesize open-ended interviews, observations, or diary notes | `user-research` or `research-synthesis` |
| Choose market category, alternatives, and differentiated value | `positioning` |
| Compare actions by probability-weighted value | `expected-value` |
| Design a broad process-improvement sequence | `methodology` |
| Decide non-negotiable legal, safety, accessibility, or reliability requirements | the relevant compliance, safety, or quality gate |

If the request lacks the minimum inputs, ask for or infer them and label inference clearly.

```text
Customer segment:
Decision horizon:
Candidate features or attributes:
Current product baseline:
Evidence available:
Constraints or non-negotiables:
What decision the classification must inform:
```

## 2. Define the Segment and Feature Unit

Kano categories are not universal. Classify each feature for a segment, use case, and point in time.

| Input | Good form | Bad form |
| --- | --- | --- |
| Segment | "Security admins at 200+ employee companies" | "users" |
| Feature | "SAML SSO for account login" | "enterprise readiness" |
| Outcome | "Search results return in under 500 ms" | "better search" |
| Time context | "2026 B2B SaaS buying expectation" | no market timestamp |
| Evidence | paired Kano survey, support data, interviews, sales-loss notes | founder intuition alone |

If different segments disagree, keep separate classifications. A feature can be attractive for power users and reverse for novices.

## 3. Ask Paired Questions

A Kano survey asks two questions for each feature: one where the feature is present and one where it is absent. The category comes from the response pair, not from a simple "do you want this?" answer.

```text
Functional question:
If [feature] is available, how do you feel?

Dysfunctional question:
If [feature] is not available, how do you feel?

Common response options:
- I like it that way.
- I expect it that way.
- I am neutral.
- I can live with it that way.
- I dislike it that way.
```

Keep wording concrete and neutral. Do not bundle multiple features into one question. Do not ask leading questions such as "How excited would you be if we added this amazing feature?"

## 4. Classify the Response Pattern

Use the category definitions before making roadmap recommendations.

| Category | Presence | Absence | Product implication |
| --- | --- | --- | --- |
| Must-be / basic | Expected, little extra satisfaction | Strong dissatisfaction | Meet the threshold first; missing basics can veto the product |
| Performance / one-dimensional | More is better | Less is worse | Invest by value, cost, and competitive importance |
| Attractive / delighter | Creates satisfaction or surprise | Little or no dissatisfaction | Differentiates after basics are covered; validate segment fit |
| Indifferent | Little effect | Little effect | Deprioritize unless it supports another requirement |
| Reverse | Creates dissatisfaction for some users | Preferred absent | Avoid, make optional, or segment carefully |
| Questionable | Contradictory or confused response | Contradictory or confused response | Fix wording, split the feature, or collect better evidence |

Do not classify from the feature name alone. "Dark mode" can be attractive, indifferent, must-be, or reverse depending on user segment, accessibility needs, context, and market expectations.

## 5. Translate Category to Roadmap Logic

Kano categories guide priority, but they are not the whole priority decision.

| Category | Default next move | Check before committing |
| --- | --- | --- |
| Must-be gap | Fix or provide a credible alternative before delighters | Is it truly expected by the target segment? Is there a compliance or safety floor? |
| Performance | Size the investment curve | What level is good enough? What is the marginal satisfaction per unit cost? |
| Attractive | Treat as differentiation option | Are basics already met? Is the delighter hard to copy? Does it fit positioning? |
| Indifferent | Cut or defer | Does it support internal efficiency, compliance, or another visible feature? |
| Reverse | Avoid default exposure | Can it be optional, segmented, or hidden behind progressive disclosure? |
| Questionable | Re-research | Was the feature too vague, bundled, or leading? |

For a final roadmap, combine Kano output with `prioritization`, `expected-value`, constraints, strategy, technical feasibility, and evidence confidence.

## 6. Handle Category Migration

Kano categories drift. A feature that delighted early adopters can become a performance expectation and eventually a must-be basic. Re-check categories when:

- competitors normalize the feature,
- buyers start assuming it during sales or onboarding,
- support complaints appear only when the feature is missing,
- a platform or regulation changes expectations,
- a new segment becomes the priority.

Do not cite old delight as current evidence. State the date, segment, and market context behind the classification.

## 7. Output Format

When applying the skill, use this compact structure.

```text
KANO ANALYSIS

Segment:
Decision:
Evidence quality:

| Feature | Likely category | Evidence | Roadmap implication | Follow-up |
| --- | --- | --- | --- | --- |

Must-be gaps:
Performance investments:
Attractive bets:
Indifferent/reverse candidates:
Questions to validate:
Boundary handoff:
```

Boundary handoff names which method should take the result further: `prioritization` for scoring, `user-research` for evidence collection, `positioning` for differentiation, or `expected-value` for quantified payoff.

## Verification

Before finalizing a Kano analysis, check:

- [ ] Customer segment and decision horizon are explicit.
- [ ] Each feature is a single user-visible capability or attribute.
- [ ] Functional and dysfunctional questions are paired and neutral.
- [ ] Categories are based on response patterns or clearly labeled as hypotheses.
- [ ] Must-be gaps are not outranked by speculative delighters without a stated reason.
- [ ] Performance attributes include a "how much is enough?" question.
- [ ] Reverse-quality signals are preserved, not averaged away.
- [ ] Indifferent features have a separate reason if still recommended.
- [ ] Category migration over time is considered.
- [ ] Kano output is handed to the right next method when cost, strategy, or scoring is needed.

## Do NOT Use When

| Instead of this skill | Use | Why |
| --- | --- | --- |
| Generic backlog scoring | `prioritization` | Kano classifies satisfaction response shape; prioritization ranks work across reach, impact, effort, confidence, and constraints |
| Open-ended customer evidence synthesis | `user-research` or `research-synthesis` | Kano needs candidate features and paired responses; it does not discover all themes by itself |
| Market category and differentiated value | `positioning` | Kano can inform perceived value, but positioning owns competitive context and buyer framing |
| Probability-weighted economic choice | `expected-value` | Kano categories are not payoffs or probabilities |
| Broad quality-improvement process design | `methodology` | Kano is one customer-needs classification method, not a full process system |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `reasoning-strategy`
- Deployment: `portable`
- Domain: `foundations/product-strategy`
- Scope: Kano model feature and customer-need classification for product, service, and quality decisions: classify candidate features by satisfaction response to presence and absence, design paired functional/dysfunctional questions, handle segment differences, translate must-be/performance/attractive/indifferent/reverse categories into roadmap implications, and avoid over-ranking delighters before basics. Excludes generic backlog scoring without customer-response evidence, broad qualitative research synthesis, product-market positioning, and financial expected-value comparison.

**When to use**
- Use the Kano model to classify these feature requests into must-be, performance, delighter, indifferent, and reverse categories.
- Design a Kano survey for these roadmap candidates.
- Use the Kano model to classify faster search as performance quality and SSO as must-be quality.
- Which of these features are delighters versus basics for this customer segment?
- Explain Kano category drift when an old delighter becomes a must-have expectation.
- Triggers: `kano-model`, `kano-analysis`, `kano-survey`

**Not for**
- Rank this backlog by reach, impact, confidence, and effort.
- Synthesize these interview transcripts into research themes.
- Design a generic quality-improvement process with DMAIC or PDCA.

**Concept**
- Mental model: Kano analysis maps how a defined customer segment reacts when a feature is present versus absent. The primitives are segment, candidate feature, functional question, dysfunctional question, response pair, quality category, satisfaction effect, dissatisfaction effect, evidence confidence, and time. Must-be features prevent dissatisfaction, performance features move satisfaction roughly with execution quality, attractive features create upside when present without penalty when absent, indifferent features do not matter much, reverse features hurt some users, and questionable responses signal confusion or bad survey design.
- Purpose: This skill prevents agents from treating all feature requests as the same kind of demand. It forces the answer to distinguish basics customers punish you for missing, performance attributes customers reward proportionally, delighters that can differentiate only after basics are covered, indifferent ideas that should not consume roadmap capacity, and reverse features that help one segment while hurting another.
- Boundary: The Kano model is for classifying customer satisfaction response patterns to candidate features or service attributes. It is not a complete prioritization score, open-ended user-research synthesis, positioning strategy, expected-value calculation, accessibility or safety gate, or proof that a feature is worth building. Kano categories can feed those decisions, but they do not replace cost, feasibility, strategy, risk, or evidence-quality checks.
- Analogy: Kano analysis is like a control panel with different levers: some only stop alarms, some raise the gauge steadily, some create a burst of delight, and some should not be pulled for the wrong audience.
- Common misconception: The common mistake is thinking delighters are always the highest priority. In Kano reasoning, missing basics can destroy satisfaction, performance attributes may deserve steady investment, and delighters only matter when they fit the segment and do not mask must-be gaps.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.jstage.jst.go.jp/article/quality/14/2/14_KJ00002952366/_article`, `https://asq.org/quality-resources/kano-model`, `https://cir.nii.ac.jp/crid/1571980075723369472`, `https://www.walden-family.com/public/cqm-journal/2-4-Whole-Issue.pdf`, `skills/skills/meta-methods/kano-model/references/kano-model-sources.md`, `skills/skills/meta-methods/kano-model/references/upstream-displacement-2026-06-01.md`

**Keywords**
- `Kano model`, `customer satisfaction`, `must-be quality`, `performance needs`, `delighters`, `attractive quality`, `feature prioritization`, `Kano survey`, `reverse quality`, `indifferent quality`

<!-- skill-graph-context:end -->
