---
name: bayesian-reasoning
description: "Use when updating beliefs, forecasts, diagnoses, or decision assumptions under uncertainty using Bayesian reasoning: priors/base rates, likelihood, evidence strength, posterior direction, and residual uncertainty. Covers base-rate discipline, likelihood-vs-posterior separation, independent evidence updates, natural-frequency examples, confidence calibration, and when to stop at qualitative probability instead of fake precision. Do NOT use for expected monetary value calculations, strategy-cascade choices (use playing-to-win), industry-structure analysis (use porters-five-forces), or generic task prioritization (use prioritization). Do NOT use for calculate the expected value of these three options. Do NOT use for turn this growth plan into a strategy cascade. Do NOT use for analyze supplier power and substitutes in this industry. Do NOT use for rank these roadmap items by impact and effort. Do NOT use for build a statistical model from a dataset."
license: MIT
compatibility: "Markdown, decision memos, diagnostic reasoning, research synthesis, forecasting, agent confidence calibration"
allowed-tools: Read Grep
metadata:
  last_audited: "2026-05-28"
  lint_verdict: PASS
  schema_version: "8"
  version: "1.0.0"
  subject: meta-methods
  deployment_target: portable
  taxonomy_domain: foundations/decision-quality
  owner: skill-graph-maintainer
  freshness: "2026-05-26"
  drift_check: "{\"last_verified\":\"2026-05-26\",\"truth_source_hashes\":{\"skills/meta-methods/bayesian-reasoning/references/bayesian-reasoning-sources.md\":\"64efb763c7b63802a0ed16080d20cbc147600090f114cbd498153bf2618e05b3\",\"skills/meta-methods/bayesian-reasoning/references/upstream-displacement-2026-05-26.md\":\"ec0ddfb8bf6a254b9ad4e107d29c40ab33ca24a7524f1cba1560e2847dfa7baa\"}}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: stable
  keywords: "[\"bayesian reasoning\",\"bayes theorem\",\"bayesian update\",\"base rate\",\"prior probability\",\"posterior probability\",\"likelihood ratio\",\"evidence strength\",\"confidence calibration\",\"probabilistic reasoning\"]"
  examples: "[\"use Bayesian reasoning to update our confidence after this new evidence\",\"we have a rare bug signal; account for the base rate before concluding the cause\",\"separate prior, likelihood, and posterior for this diagnosis\",\"how should this customer interview change our belief in the product hypothesis?\",\"calibrate my confidence instead of giving a binary yes/no answer\"]"
  anti_examples: "[\"calculate the expected value of these three options\",\"turn this growth plan into a strategy cascade\",\"analyze supplier power and substitutes in this industry\",\"rank these roadmap items by impact and effort\",\"build a statistical model from a dataset\"]"
  relations: "{\"boundary\":[{\"skill\":\"prioritization\",\"reason\":\"prioritization ranks work items or options; bayesian-reasoning owns updating probability beliefs before a ranking or decision uses them\"},{\"skill\":\"playing-to-win\",\"reason\":\"playing-to-win owns integrated strategy choices; bayesian-reasoning owns uncertainty updates about assumptions, evidence, and confidence\"},{\"skill\":\"porters-five-forces\",\"reason\":\"porters-five-forces owns industry-structure diagnosis; bayesian-reasoning owns how new evidence changes belief strength\"}],\"related\":[\"mental-models\",\"constraint-awareness\",\"epistemic-grounding\",\"problem-approach-router\"],\"verify_with\":[\"epistemic-grounding\",\"methodology\"]}"
  grounding: "{\"subject_matter\":\"Bayesian reasoning for decision-making under uncertainty\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://plato.stanford.edu/entries/bayes-theorem/\",\"https://plato.stanford.edu/entries/epistemology-bayesian/\",\"https://pubmed.ncbi.nlm.nih.gov/17835457/\",\"skills/meta-methods/bayesian-reasoning/references/bayesian-reasoning-sources.md\",\"skills/meta-methods/bayesian-reasoning/references/upstream-displacement-2026-05-26.md\"],\"failure_modes\":[\"base_rate_neglect\",\"likelihood_confused_with_posterior\",\"anecdote_overweighted\",\"correlated_evidence_double_counted\",\"prior_hidden_or_smuggled\",\"false_precision_from_weak_inputs\",\"binary_answer_given_under_uncertainty\"],\"evidence_priority\":\"general_knowledge_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  mental_model: "Bayesian reasoning treats belief as a state that changes when evidence arrives. The primitives are a hypothesis, prior probability or base rate, evidence, likelihood of seeing that evidence if the hypothesis were true, likelihood of seeing it if the hypothesis were false, posterior belief, residual uncertainty, and update history. The key move is comparing how much better the evidence is explained by one hypothesis than by alternatives, then updating from the prior instead of starting from the vividness of the evidence."
  purpose: "This skill prevents agents from jumping from a salient signal to a confident conclusion. It replaces binary diagnosis, anecdote-weighting, and base-rate neglect with an explicit update loop: start with the prior, estimate evidential force, adjust belief in the right direction, avoid double-counting correlated evidence, and state what would change the posterior next."
  boundary: "Bayesian reasoning updates probabilities and confidence; it does not by itself choose the action with the best payoff, produce an expected value table, fit a statistical model, create a strategy cascade, analyze industry structure, or rank a backlog. Those downstream tools may consume Bayesian probabilities, but this skill owns the belief update."
  analogy: "Bayesian reasoning is like adjusting a dimmer switch rather than flipping a light switch: evidence moves confidence up or down from where it started, and stronger evidence moves it farther."
  misconception: "The common mistake is treating Bayes as a formula that requires precise numbers. The formula is the idealized version; in agent work the practical discipline is often qualitative: make the prior explicit, compare evidence under competing hypotheses, update directionally, and label uncertainty instead of inventing decimals."
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/meta-methods/bayesian-reasoning/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Bayesian Reasoning

## Concept Card

**What it is:** Bayesian reasoning is a method for updating belief under uncertainty. It starts from a prior or base rate, evaluates how expected the new evidence is under competing hypotheses, updates toward the hypothesis that better predicts the evidence, and preserves residual uncertainty.

**Mental model:** Confidence is not reset by each new clue. A belief has an existing level, evidence applies pressure to that level, and the posterior becomes the new prior for the next update.

**Why it exists:** Agents tend to overreact to vivid recent evidence, ignore base rates, and answer uncertain questions as yes/no. Bayesian reasoning forces the belief state, evidence strength, and update size into the open.

**What it is not:** It is not an expected-value decision table, a statistical modeling workflow, a generic prioritization method, a strategy framework, or a requirement to fabricate exact probabilities when inputs are weak.

**Adjacent concepts:** base rates, priors, likelihood ratios, posterior probability, diagnostic reasoning, forecasting, calibration, expected value, hypothesis testing, evidence independence.

**One-line analogy:** Bayesian reasoning is a confidence ledger: every new piece of evidence is posted against the prior balance before the new balance is reported.

**Common misconception:** The method is not "new evidence says X, therefore X." Evidence matters by how differently it is predicted by X versus not-X, and by how plausible X was before the evidence arrived.

## Coverage

This skill teaches agents to:

1. State the hypothesis and plausible alternatives before updating.
2. Make priors and base rates explicit.
3. Separate likelihood from posterior probability.
4. Estimate evidence strength by comparing competing explanations.
5. Update confidence directionally when exact numbers are unjustified.
6. Avoid double-counting correlated evidence.
7. Use natural frequencies for rare-event and diagnostic examples.
8. Report residual uncertainty and the evidence that would change the belief.

## Philosophy

Bayesian reasoning is useful because it makes uncertainty inspectable. A confident answer can hide a weak prior, a diagnostic clue can look decisive while being common under multiple explanations, and a vivid example can overwhelm a large base rate. The Bayesian discipline forces those hidden weights into the answer.

The method is not a demand for spreadsheet precision. In many product, strategy, debugging, and research tasks, the honest output is qualitative: "this evidence raises confidence from low to moderate, but not high, because the base rate is low and the evidence is not independent." That is stronger than an invented 73 percent.

## Workflow

### 1. Define the belief being updated

Name one hypothesis at a time, plus the alternatives.

```text
Hypothesis:
Alternatives:
Decision or question this belief affects:
Current confidence:
```

Do not update a vague claim such as "this is promising." Rewrite it as a belief that can be supported or weakened.

### 2. Establish the prior

Use the best available prior source:

| Prior source | Use when | Example |
| --- | --- | --- |
| Base rate | Similar cases exist | "Only a small share of signups convert without activation." |
| Historical frequency | The system has logs or repeated runs | "This error has usually been config-related." |
| Reference class | No direct data exists | "Comparable B2B onboarding changes have mixed results." |
| Stated assumption | No evidence exists | "Assume low prior and mark it as a placeholder." |

If the prior is uncertain, say so. Do not hide the prior by starting from the new evidence.

### 3. Compare likelihoods

Ask how expected the evidence is under each hypothesis.

```text
Evidence:
If hypothesis is true, how expected is this evidence?
If hypothesis is false or an alternative is true, how expected is this evidence?
Likelihood direction:
Evidence independence:
```

Evidence is strong only when it is much more expected under one hypothesis than under plausible alternatives.

### 4. Update the belief

Move confidence in proportion to prior strength and evidence strength.

| Situation | Update discipline |
| --- | --- |
| Strong prior, weak evidence | Small update |
| Weak prior, strong diagnostic evidence | Moderate or large update, but still state uncertainty |
| Rare hypothesis, noisy evidence | Small update unless the evidence is highly diagnostic |
| Multiple independent signals | Update more than once, but only if independence is credible |
| Correlated signals | Treat as one evidence cluster, not many independent confirmations |

When inputs are rough, use bands: very low, low, moderate, high, very high. Prefer bands to fake decimals.

### 5. Report the posterior and next evidence

The useful answer includes the belief state and what would change it.

```text
Bayesian update
- Prior/base rate:
- New evidence:
- Likelihood comparison:
- Update:
- Posterior confidence:
- Residual uncertainty:
- Evidence that would change the posterior next:
```

## Natural-Frequency Check

For rare events, translate percentages into counts. This catches base-rate neglect.

```text
Out of 10,000 cases:
- Prior/base-rate cases where the hypothesis is true:
- Cases where the evidence appears if true:
- Cases where the evidence appears if false:
- Total cases with evidence:
- Share of evidence-positive cases where the hypothesis is true:
```

If a rare event has a 1 percent base rate and a test is 90 percent accurate with a 10 percent false-positive rate, most positive tests may still be false positives. The exact result depends on the numbers, but the lesson is stable: low base rates require very diagnostic evidence.

## Anti-Patterns

| Anti-pattern | Why it fails | Repair |
| --- | --- | --- |
| Base-rate neglect | Treats a vivid clue as if the prior were neutral | State the reference class and prior before the update |
| Likelihood-posterior swap | "Evidence is likely if H is true" becomes "H is likely" | Compare evidence under H and not-H, then update from the prior |
| Anecdote overweighting | One case gets treated as representative | Ask whether the evidence is diagnostic or merely salient |
| Double-counting correlated evidence | Many signals from one source masquerade as independent confirmation | Cluster correlated signals and update once |
| Hidden prior | The answer smuggles in confidence without naming it | Write the prior or mark it as an assumption |
| Fake precision | Weak inputs produce precise probabilities | Use confidence bands and evidence gaps |
| Binary conclusion | An uncertain belief becomes yes/no | Report posterior confidence and next evidence |

## Boundaries

Use Bayesian reasoning when the task is to update a belief, diagnosis, forecast, or assumption after evidence arrives.

Use another tool when the task is narrower or downstream:

| Need | Better owner |
| --- | --- |
| Choose the option with highest probability-weighted payoff | Expected value skill when available; otherwise state that EV is downstream |
| Rank backlog items by impact, urgency, effort, or confidence | `prioritization` |
| Turn a vague business strategy into integrated choices | `playing-to-win` |
| Diagnose industry structure and profit-pool pressure | `porters-five-forces` |
| Choose which reasoning method to apply first | `problem-approach-router` |
| Ground factual claims to citations and modality | `epistemic-grounding` |

## Verification

Before finishing, verify:

- [ ] The hypothesis and alternatives are explicit.
- [ ] The prior or base rate is stated, or the absence of one is labeled.
- [ ] Likelihood is not confused with posterior probability.
- [ ] Evidence strength is judged against competing explanations.
- [ ] Correlated evidence is not double-counted.
- [ ] Probability precision matches evidence quality.
- [ ] The posterior is reported as an update from the prior.
- [ ] Residual uncertainty and next evidence are named.
- [ ] The answer does not present expected value, strategy cascade, industry analysis, or generic prioritization as Bayesian reasoning.

## References

- `skills/skills/meta-methods/bayesian-reasoning/references/bayesian-reasoning-sources.md`
- `skills/skills/meta-methods/bayesian-reasoning/references/upstream-displacement-2026-05-26.md`

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `meta-methods`
- Deployment: `portable`
- Domain: `foundations/decision-quality`

**When to use**
- use Bayesian reasoning to update our confidence after this new evidence
- we have a rare bug signal; account for the base rate before concluding the cause
- separate prior, likelihood, and posterior for this diagnosis
- how should this customer interview change our belief in the product hypothesis?
- calibrate my confidence instead of giving a binary yes/no answer

**Not for**
- calculate the expected value of these three options
- turn this growth plan into a strategy cascade
- analyze supplier power and substitutes in this industry
- rank these roadmap items by impact and effort
- build a statistical model from a dataset
- Owned by `prioritization`
- Owned by `playing-to-win`: integrated strategy choices
- Owned by `porters-five-forces`: industry-structure diagnosis

**Related skills**
- Verify with: `epistemic-grounding`, `methodology`
- Related: `mental-models`, `constraint-awareness`, `epistemic-grounding`, `problem-approach-router`

**Concept**
- Mental model: Bayesian reasoning treats belief as a state that changes when evidence arrives. The primitives are a hypothesis, prior probability or base rate, evidence, likelihood of seeing that evidence if the hypothesis were true, likelihood of seeing it if the hypothesis were false, posterior belief, residual uncertainty, and update history. The key move is comparing how much better the evidence is explained by one hypothesis than by alternatives, then updating from the prior instead of starting from the vividness of the evidence.
- Purpose: This skill prevents agents from jumping from a salient signal to a confident conclusion. It replaces binary diagnosis, anecdote-weighting, and base-rate neglect with an explicit update loop: start with the prior, estimate evidential force, adjust belief in the right direction, avoid double-counting correlated evidence, and state what would change the posterior next.
- Boundary: Bayesian reasoning updates probabilities and confidence; it does not by itself choose the action with the best payoff, produce an expected value table, fit a statistical model, create a strategy cascade, analyze industry structure, or rank a backlog. Those downstream tools may consume Bayesian probabilities, but this skill owns the belief update.
- Analogy: Bayesian reasoning is like adjusting a dimmer switch rather than flipping a light switch: evidence moves confidence up or down from where it started, and stronger evidence moves it farther.
- Common misconception: The common mistake is treating Bayes as a formula that requires precise numbers. The formula is the idealized version; in agent work the practical discipline is often qualitative: make the prior explicit, compare evidence under competing hypotheses, update directionally, and label uncertainty instead of inventing decimals.

**Grounding**
- Mode: `universal`
- Truth sources: `https://plato.stanford.edu/entries/bayes-theorem/`, `https://plato.stanford.edu/entries/epistemology-bayesian/`, `https://pubmed.ncbi.nlm.nih.gov/17835457/`, `skills/meta-methods/bayesian-reasoning/references/bayesian-reasoning-sources.md`, `skills/meta-methods/bayesian-reasoning/references/upstream-displacement-2026-05-26.md`

**Lifecycle & audit status**
- Stability: `stable`
- Freshness: `2026-05-26`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth UNVERIFIED, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `bayesian reasoning`, `bayes theorem`, `bayesian update`, `base rate`, `prior probability`, `posterior probability`, `likelihood ratio`, `evidence strength`, `confidence calibration`, `probabilistic reasoning`

<!-- skill-graph-context:end -->
