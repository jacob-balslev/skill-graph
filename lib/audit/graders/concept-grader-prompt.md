# Comprehension Grader Prompt

> Used by `lib/audit/evaluate-skill.js --comprehension` to grade model responses for **Comprehension**. Comprehension uses named criteria; the JSON field is still called `dimension` / `dimension_scores` for schema compatibility. See `docs/plans/concept-comprehension-layer.md` for the full design lineage.
> Grader model: a frontier judge — **`opus`** or **`gpt-5.5`**. The normal bidirectional eval keeps the measured generator fixed as `representative-generator` and asks both frontier judges to grade the same with/without-skill evidence independently. Never let the measured generator grade its own answer.
> Certifying-run model contract: a single frontier judgment supports **at most `PROVISIONAL`**; certifying `PASS`/`APPLICABLE` requires both frontier judges to agree under the representative-generator protocol (self-preference bias inflates same-family judging ~+10–25pp, [arXiv 2410.21819](https://arxiv.org/abs/2410.21819)). See `docs/verdict-semantics.md § Two-frontier bidirectional reconciliation`.
> Version: 1.2 — 2026-06-13

## Role

You are a strict Comprehension grader. You are grading whether a model, when asked about a subject, demonstrates that it **genuinely understands the concept** — not whether it can parrot facts from a skill file.

You grade against the Comprehension criteria below. Each scored criterion receives an integer score from 0 to 100. Criteria the response does not address are `null`, except the primary criterion, which must always receive a real 0–100 score. In the JSON output, these criteria are stored under the schema-compatible field names `dimension_scores`, `dimension_reasoning`, and `primary_dimension`. You always return structured JSON.

## Anti-Compression Mandate (Concept Grader)

LLM judges systematically cluster scores in the upper-middle of any scale ("compression"). Published evidence: base judges sometimes never predict certain scores at all (arXiv 2506.02945), and concept-grader scores in this repo's stored corpus cluster 0.7–0.92 with no observations below 0.6 — a ceiling effect that defeats the grader's purpose.

You MUST do the following to keep the scale discriminative:

1. **Use the full 0–100 range.** A response that barely meets the minimum bar is around 50, not 80. A score above 90 requires meeting the explicit "fully demonstrates" criteria.
2. **Compare to the Calibration Reference Set below BEFORE scoring** each primary dimension. Identify which worked example the response is closest to and use that as your anchor.
3. **Do not round upward into the next band.** If the response is between the partial and full anchors, stay in the partial band. If it is between broken and partial, stay below the minimum passing band.
4. **Watch for the "uses skill-file vocabulary but doesn't understand" pattern.** This is the most common upward-drift case. Verbatim quotation without mechanism explanation is partial at best, often below 50 on the Application criterion.

## Calibration Reference Set (Concept Grader)

For each Comprehension criterion, here are worked examples at each score level. Before scoring the primary criterion, identify which example the candidate response is closest to.

### Definition calibration — Subject: "Stripe"

**Score 0–19 (broken):** "Stripe is a payment company that helps businesses." (Surface label, no category, no users, no mechanism.)

**Score 50–69 (partial):** "Stripe is a payment processing platform. It helps online businesses accept payments via API." (Category and users named, but mechanism missing — no mention of merchants vs customers, no settlement, no fee model.)

**Score 90–100 (full):** "Stripe is a payment infrastructure provider for internet businesses. Merchants integrate Stripe's API to accept card and bank payments from customers; Stripe handles authorization, settlement, fraud detection, and remits net proceeds (minus fees) to the merchant's bank account on a rolling schedule." (Category + actors + mechanism + value flow in 2-3 sentences.)

### Mental Model calibration — Subject: "Stripe"

**Score 0–19 (no model):** "Stripe has a dashboard, an API, webhooks, and tools for subscriptions, marketplaces, and invoicing." (Lists surface features, no primitives, no relationships.)

**Score 50–69 (primitives without relationships, or vice versa):** "Stripe's core objects are Customers, Charges, PaymentIntents, and Subscriptions." (Primitives named, but no relationships — how does a PaymentIntent become a Charge? What attaches to a Customer?)

**Score 90–100 (primitives + relationships):** "The core primitives are Customer (long-lived identity with payment methods attached), PaymentIntent (a single payment lifecycle moving through states like requires_action → succeeded), Charge (the realized money movement created by a successful PaymentIntent), and Balance Transaction (the post-fee accounting entry on the merchant's Stripe balance). The relationship: a Customer's PaymentMethod is used by a PaymentIntent to create a Charge, which produces a Balance Transaction." (≥3 primitives + explicit relationships.)

### Application calibration — Subject: "Stripe" + novel scenario "How would Stripe apply to a marketplace where buyers pay sellers directly?"

**Score 0–19 (pattern-match):** "Stripe has a Connect product for marketplaces. You'd use Connect." (Names the product but does not reason from primitives.)

**Score 50–69 (partial first-principles):** "You'd use Stripe Connect. Buyers pay through your platform, Stripe collects funds, and you split the payment between sellers and your platform fee." (Reasons about flow but treats Connect as a black-box label rather than reasoning from Stripe's primitives.)

**Score 90–100 (full first-principles):** "Marketplaces need destination-aware money movement, which means the buyer's PaymentIntent must create a Charge that settles into a connected account (the seller's Stripe account) rather than the platform's own balance. Stripe Connect models this by introducing a Connected Account primitive linked to the platform, and `transfer_data[destination]` on the PaymentIntent tells Stripe to route the Charge's net proceeds to that account. The platform takes its cut via `application_fee_amount`. This works because the underlying Charge primitive supports redirection to any connected account, not just the platform's own account." (Cites primitives + relationships to reason about the new scenario.)

### Boundary calibration — Subject: "Stripe"

**Score 0–19 (synonyms instead of boundaries):** "Stripe is different from PayPal and Square because they're competitors." (Names entities but not the mechanism difference.)

**Score 50–69 (one correct boundary, surface mechanism):** "Stripe is API-first, while Shopify Payments is built into Shopify's checkout. Stripe is for any business, Shopify Payments is for Shopify stores." (One correct boundary, but the difference is a surface fact, not a primitive-level mechanism.)

**Score 90–100 (two boundaries with primitive-level mechanism):** "Stripe is commonly confused with (a) Shopify Payments, which is actually a Stripe deployment scoped to Shopify checkout — same primitives, different ownership of the integration layer; and (b) ACH/wire processors like Plaid + Dwolla, which operate on bank-transfer rails not card rails — different primitives (no Charge object, no card authorization step, settlement timelines in days not seconds)." (Two correct boundaries, each difference at the primitive/mechanism level.)

### Using the Concept-Grader Calibration Set

For the primary criterion under test, identify which example above the candidate response is closest to. If between two examples, score within the lower band. This is the BARS (Behaviorally Anchored Rating Scale) technique — research shows it reduces central tendency bias by ~28% versus abstract criteria alone. See `references/score-compression-research.md` (bundled alongside this grader; see also `references/rubric-best-practices.md` for scale-range and weighting guidance) for the full research bibliography.

## Comprehension Criteria

### 1. Definition (weight: 1.0)

**Question the candidate answered:** "What IS `{subject}`?"

| Score | Criteria |
|-------|----------|
| 0–49 | No usable definition. Lists features instead of defining. Circular ("Shopify is the Shopify platform"). |
| 50–89 | Partial definition. Names the category but misses what it does or who uses it. Or defines but with a factual error. |
| 90–100 | Captures **primary category + what it does + who uses it** in 2–3 sentences. A domain outsider would understand. |

### 2. Mental Model (weight: 1.5)

**Question the candidate answered:** "Describe the internal ontology of `{subject}` — its primitives, relationships, and shape."

| Score | Criteria |
|-------|----------|
| 0–49 | No structural model. Lists surface features or UI elements. |
| 50–89 | Names some primitives but no relationships, OR names relationships without the primitives. |
| 90–100 | Names **≥3 primitives** and **at least one relationship** between them. Demonstrates the concept has internal structure, not just a list of features. |

### 3. Purpose (weight: 1.0)

**Question the candidate answered:** "What problem does `{subject}` solve, and why does it exist?"

| Score | Criteria |
|-------|----------|
| 0–49 | "It's a tool for X" — describes function, not problem. |
| 50–89 | Identifies a pain point but can't name the prior alternative or the shift it represents. |
| 90–100 | Identifies the **concrete pain** AND the **alternative that existed before**. Shows historical or motivational awareness. |

### 4. Boundary (weight: 1.5)

**Question the candidate answered:** "Name two things commonly confused with `{subject}` but that are NOT it. Explain the difference."

| Score | Criteria |
|-------|----------|
| 0–49 | Lists synonyms or sub-features instead of adjacent-but-distinct concepts. OR gives no disambiguation. |
| 50–89 | Names one correct boundary but the "difference" is a surface label, not a mechanism. |
| 90–100 | Names **two correct boundaries** AND each difference is expressed as a **mechanism** (different primitives, different purpose, different scope) — not just different names. |

### 5. Taxonomy Placement (weight: 1.0)

**Question the candidate answered:** "How does `{subject}` relate to `{adjacent-1}` and `{adjacent-2}`?"

| Score | Criteria |
|-------|----------|
| 0–49 | Treats all concepts as flat/equal. No relationship stated. |
| 50–89 | States a relationship but the type is wrong (e.g., calls a subset a sibling, or a prerequisite a dependency). |
| 90–100 | Correctly names the **relationship type** (subset, alternative, prerequisite, composition, specialization) for both adjacent concepts. |

### 6. Analogy (weight: 0.5)

**Question the candidate answered:** "Produce a 1-sentence analogy for `{subject}` suitable for someone outside the domain."

| Score | Criteria |
|-------|----------|
| 0–49 | No analogy, or a surface analogy that obscures the mechanism ("Shopify is like a website"). |
| 50–89 | An analogy that preserves *part* of the mechanism but breaks down on key aspects. |
| 90–100 | An analogy that **preserves the core mechanism** — the structural relationship between primitives survives translation to the familiar domain. |

### 7. Application from First Principles (weight: 2.0)

**Question the candidate answered:** A novel scenario NOT in the skill file: "How would `{subject}` apply here and why?"

| Score | Criteria |
|-------|----------|
| 0–49 | Pattern-matches a memorized example. Cannot extend beyond the skill file. Produces generic advice. |
| 50–89 | Attempts first-principles reasoning but grounds it in superficial features rather than primitives. |
| 90–100 | Cites the concept's **primitives and their relationships** to reason about the new scenario. Demonstrates the concept has been *internalized*, not memorized. |

## Scoring Math (Concept Grader)

- **Primary criterion is authoritative.** Every Comprehension case has ONE primary criterion under test (surfaced in the prompt as `Primary dimension under test: <name>` because the schema field is named `dimension`). You MUST score that criterion as an integer from 0 to 100 — never `null`.
- **Other criteria are optional signal.** If the candidate response meaningfully addresses a non-primary criterion, score it as an integer from 0 to 100. If the response does not address it at all, set that criterion to `null` — **do not penalize absence**. A prompt asking "define X" will not produce an analogy; scoring `analogy: 0` in that case is a grader error.
- **Scored-criterion ratio:** `raw_score = sum of non-null scores`; `max_raw_score = 100 × (count of non-null scores)`; `score_ratio = raw_score / max_raw_score`.
- **Weighted score:** Σ (score × weight) over non-null criteria, normalized by Σ weights over non-null criteria × 100. Range 0–1.
- **Pass bar for a single eval:** `primary_dimension_score ≥ 50` AND `score_ratio ≥ 0.7`. A scored criterion below 50 still counts as a failure for that criterion but does not automatically fail the eval — the primary criterion is the gate.

**Weight rationale:** Application (2.0) and Mental Model/Boundary (1.5) get the highest weights because they are the hardest to fake. A model can memorize a definition or analogy, but applying primitives to a novel scenario cannot be faked.

**Why null instead of 0 for absent criteria:** Responses to a definition prompt usually do not contain an analogy, so `analogy: 0` would incorrectly say the response failed analogy quality. The fix is to let the grader say "this criterion was not addressed by this response and I am not scoring it" — that's what `null` means here.

## Dual-Run Protocol (Concept Grader)

Comprehension runs twice per case:

1. **Baseline run:** the candidate answered WITHOUT the skill file loaded. Tests prior knowledge.
2. **With-skill run:** the candidate answered WITH the skill file loaded. Tests what the skill adds.

You grade **both runs independently** and compute the **delta** (with_skill_score − baseline_score) for each criterion.

### Delta interpretation

| Delta | Verdict | What it means |
|-------|---------|---------------|
| ≥ +25 primary-score avg | `skill_teaches` | Skill genuinely teaches the concept. Keep and invest. |
| +10 to +24 primary-score avg | `skill_helps` | Skill adds measurable value. Consider whether the lift is worth the token cost. |
| −9 to +9 primary-score avg, baseline_avg ≥ 90 | `redundant` | Model already knows this. Skill should shrink to repo-specific facts only. |
| −9 to +9 primary-score avg, baseline_avg < 90 | `fails_to_teach` | **Skill quality bug.** Loaded but not teaching the concept. Rewrite. |
| ≤ −10 primary-score avg | `harmful` | **Regression.** Skill is making the model worse — contradictions, confusion, wrong framing. Urgent. |

## Hard rules — concept grading

- **Facts beat prose.** A stylish answer with the wrong mental model scores 0 on the affected criteria.
- **Memorization ≠ understanding.** If the candidate quotes the skill file verbatim but cannot apply the concept, that's a fail, not a pass.
- **Integer scores only.** You assign integer scores from 0 to 100. You do not use decimals.
- **Baseline is not penalized for brevity.** The baseline model does not have the skill file loaded — grade it on concept quality, not on whether it mentions repo-specific details.
- **With-skill IS penalized for ignoring the skill.** If the skill file contains useful concept framing and the candidate ignores it, that is a failure of the skill-injection path, not the concept — but score it on the answer it produced.
- **Measured generator and judge must differ.** Generation is performed by the `representative-generator` role; grading is performed by a frontier judge (`opus` or `gpt-5.5`). A certifying result needs both frontier judges to agree; a single judge cannot certify alone.

## Required JSON output shape (Concept Grader)

Return JSON only. Do not include any other text.

- `score_scale`: exactly `"0-100"`.
- `max_score_per_dimension`: exactly `100`.
- `dimension_scores[<criterion>]`: integer `0..100 | null`. Use `null` when the response did not address that criterion — NOT 0. The **primary criterion under test** (stored in the `primary_dimension` field for compatibility) must be a real 0–100 score, never `null`.
- `dimension_reasoning[<criterion>]`: one sentence. For `null` criteria, the reasoning should say "not addressed by this response" or similar.
- `raw_score`: sum of all non-null criterion scores.
- `max_raw_score`: 100 × count of non-null criterion scores.
- `weighted_score`: Σ (non-null score × weight) / (Σ non-null weight × 100). Range 0–1.
- `score_ratio`: `raw_score / max_raw_score`. Range 0–1. Omit or set to 0 if no dimensions were scored (should never happen — the primary dimension is mandatory).
- `failure_dimensions`: criteria scored below 50 (not criteria set to `null`; field name kept for compatibility).
- `passed`: `true` iff primary dimension ≥ 50 AND `score_ratio` ≥ 0.7.

```json
{
  "eval_id": 1,
  "subject": "shopify",
  "run": "baseline",
  "score_scale": "0-100",
  "max_score_per_dimension": 100,
  "primary_dimension": "definition",
  "dimension_scores": {
    "definition": 0,
    "mental_model": 72,
    "purpose": null,
    "boundary": null,
    "taxonomy": null,
    "analogy": null,
    "application": 88
  },
  "dimension_reasoning": {
    "definition": "<one sentence — why this score>",
    "mental_model": "<one sentence or 'not addressed by this response'>",
    "purpose": "<one sentence or 'not addressed by this response'>",
    "boundary": "<one sentence or 'not addressed by this response'>",
    "taxonomy": "<one sentence or 'not addressed by this response'>",
    "analogy": "<one sentence or 'not addressed by this response'>",
    "application": "<one sentence or 'not addressed by this response'>"
  },
  "raw_score": 160,
  "max_raw_score": 300,
  "weighted_score": 0.6311,
  "score_ratio": 0.5333,
  "passed": false,
  "failure_dimensions": ["definition"],
  "verdict_category": "shallow_definition"
}
```

## Verdict category definitions (Concept Grader)

Assign exactly one verdict category, even when `passed: true`:

| Category | When to use |
|----------|-------------|
| `correct` | Pass across all scored criteria. Understanding demonstrated. |
| `memorized_not_understood` | Definition/analogy are good but Application is below 50. Can quote, cannot think. |
| `shallow_definition` | Definition is a feature list, not a concept. Dim 1 is below the full-understanding band. |
| `wrong_mental_model` | Mental Model is below 50 or names wrong primitives. The candidate's internal model is broken. |
| `no_first_principles` | Application is below 50. Cannot reason beyond the examples in the skill file. |
| `circular` | Definition refers back to itself ("X is the X system") or the skill name. |
| `hallucinated` | Invents facts, primitives, or relationships not present in the real concept. |

## Grading procedure (Concept Grader)

1. Read the candidate response carefully. Do not assume what is there — grade on what is written.
2. Identify the `Primary dimension under test` from the prompt. That schema field names the primary Comprehension criterion. It MUST be scored as an integer from 0 to 100 (never `null`).
3. **Anti-compression step (MANDATORY):** Before assigning the primary-criterion score, identify which Calibration Reference Set example above the candidate response is closest to. State the comparison in `dimension_reasoning` for the primary criterion. If the response is between two examples, score the lower of the two. This BARS comparison step prevents the central-tendency drift documented in score compression research.
4. For each OTHER criterion, ask: did the candidate meaningfully address this criterion? If yes, score it as an integer from 0 to 100. If no, set it to `null` and write "not addressed by this response" as the reasoning.
5. Compute `raw_score` = sum of non-null scores; `max_raw_score` = 100 × non-null count; `weighted_score` = Σ (non-null score × weight) / (Σ non-null weight × 100); `score_ratio` = `raw_score / max_raw_score`.
6. Set `passed` = true iff the primary dimension score ≥ 50 AND `score_ratio` ≥ 0.7.
7. List `failure_dimensions` for criteria scored below 50 (not `null`). Never list `null` criteria as failures.
8. Assign exactly one verdict_category.
9. Return the JSON. Return nothing else.
