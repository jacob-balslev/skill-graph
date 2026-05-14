---
name: writing-humanizer
description: "Use when writing or editing human-readable prose such as docs, PRs, issues, release notes, errors, UI copy, commits, tooltips, or support replies, especially when text sounds robotic, padded, monotonous, or overly formal. Covers AI-tell removal, active voice, hedging reduction, readability diagnosis, sentence rhythm, vocabulary variety, tone mapping, paragraph rhythm, bullets-vs-prose choice, and the 5-step humanization workflow. Do NOT use for documentation routing/type selection, code-identifier naming, or in-product UI-text pattern catalogs."
license: MIT
compatibility: "Stack-agnostic prose-humanization rules. The AI-tell catalog, voice-conversion decision tree, readability formulas, sentence-rhythm patterns, tone-mapping table, and detection-avoidance techniques apply to any human-readable text in any product domain — substitute the equivalents from your own audience and brand voice."
allowed-tools: Read Grep Edit
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: knowledge
  domain: ai-engineering/language
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-06"
  drift_check: "{\"last_verified\":\"2026-05-06\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"AI-tell detection\",\"AI-tell removal\",\"prose humanization\",\"passive-to-active voice\",\"hedging-pattern removal\",\"readability scoring diagnosis\",\"sentence-rhythm pattern\",\"3-beat sentence variety\",\"hook-body-landing paragraph\",\"tone mapping framework\",\"AI-detection avoidance\",\"perplexity burstiness rule\",\"enumeration-trap anti-pattern\",\"hollow-intensifier removal\",\"jargon decision tree\",\"humanization 5-step workflow\"]"
  examples: "[\"this PR description sounds AI-generated — strip the tells and rewrite it concisely\",\"rewrite this onboarding paragraph in the active voice with shorter average sentence length\",\"audit this release-notes draft for Tier 1 AI tells (delve, leverage, comprehensive, testament)\",\"this paragraph starts every sentence with The dashboard — rotate the openers and vary the rhythm\",\"humanize this error-message body so it stops sounding like a corporate FAQ\",\"drop the hollow intensifiers and over-qualification from this tooltip\",\"the docs team flagged this prose as robotic — apply the 5-step humanization workflow\"]"
  anti_examples: "[\"decide kebab-case vs camelCase for this new database column\",\"draft the marketing headline for the pricing page with strong persuasion\",\"restructure this doc into a tutorial format with progressive disclosure\",\"rewrite this UI button label so it names the actual action instead of saying Submit\",\"rename this React component across all call-sites in the repo\",\"audit this WCAG 2.2 contrast violation on the dashboard\"]"
  relations: "{\"boundary\":[{\"skill\":\"documentation\",\"reason\":\"documentation owns doc-type selection, audience targeting, freshness, and progressive disclosure of doc *content*; writing-humanizer owns the prose-form quality inside any human-readable text (AI tells, voice, sentence rhythm, register fit) — the same 'fix this writing' prompt routes by whether the trigger is doc structure or prose form\"},{\"skill\":\"microcopy\",\"reason\":\"microcopy owns the specific in-product UX-text patterns (button labels, empty-state structure, tooltip rules, dialog rules, toast rules); writing-humanizer owns AI-tell removal and prose-rhythm rules across any human-readable text including but not limited to UI — the same 'rewrite this for humans' prompt routes by whether the surface is a specific UI pattern or any other prose\"},{\"skill\":\"linguistics\",\"reason\":\"linguistics owns the underlying language rules (morphology, polysemy, audience register as a general principle, blame-free framing); writing-humanizer owns the specific catalog of AI tells, the perplexity/burstiness fingerprint, and the 5-step humanization workflow — the same 'is this writing good?' prompt routes by whether the trigger is the linguistic rationale or the AI-fingerprint detection-and-fix\"}],\"related\":[\"linguistics\",\"microcopy\",\"semantics\"],\"verify_with\":[\"linguistics\",\"documentation\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v3
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/writing-humanizer/SKILL.md
---

# Writing Humanizer

## Coverage

The full pipeline for transforming AI-generated or robotic text into clear, human-sounding prose:

- **AI-tell detection and removal** — Tier 1 zero-tolerance word list (`delve`, `testament`, `crucial`, `vital`, `paramount`, `furthermore`, `seamless`, `robust`, `comprehensive`, `cutting-edge`, `foster`, `empower`, `leverage`, `harness`, etc.); Tier 2 conditional list (`utilize`, `facilitate`, `streamline`, `implement`, `optimize`)
- **Active-voice conversion** — passive-to-active decision tree based on actor knownness; hedging-pattern removal table
- **Readability scoring as diagnosis** — Flesch-Kincaid Grade (target 8–10 for general docs), Gunning Fog Index (10–12 for technical docs), Flesch Reading Ease (60–70 for UI copy); the readability diagnostic tree for sentence length, word complexity, paragraph density, and nested clauses
- **Sentence variety and rhythm** — the 3-beat short-long-medium pattern; sentence-structure variety checklist (declarative, compound, conditional, question+answer, fragment); opening-word rotation rule
- **Vocabulary diversity** — repeat technical terms exactly, rotate generic verbs, avoid elegant variation; the abstract-vs-concrete table; the jargon decision tree
- **Tone mapping** — the formal-to-casual spectrum (1–5) and a context-tone table covering API documentation, error messages, UI tooltips, commit messages, PR descriptions, release notes, issue bodies, onboarding copy, empty states, and marketing copy
- **AI-detection avoidance** — perplexity (word predictability) and burstiness (sentence-length variance) techniques: sentence-length variance, unexpected word choices, idiomatic expressions, contractions, sentence fragments, rhetorical questions, first-person asides, specific numbers
- **Paragraph rhythm and structure** — paragraph-length rules per context, the hook-body-landing pattern, the bullets-vs-prose decision tree
- **Anti-patterns** — over-qualification, repetitive transitions, the enumeration trap, hollow intensifiers
- **The 5-step humanization workflow** — Tell Scan, Readability Check, Structural Rewrite, Rhythm Pass, Voice Calibration

## Philosophy

AI-generated text has consistent, detectable failure modes: excessive hedging, passive voice, hollow superlatives, monotonous sentence structure, and vocabulary that signals machine authorship. Left unchecked, these patterns erode trust with human readers, trigger AI-detection tools, and produce text that is longer and less clear than necessary. Every agent in a system produces text that humans read, and every piece of that text reflects on the product.

The mental model: human prose scores higher on **perplexity** (word unpredictability) and **burstiness** (sentence-length variance) than AI prose. The humanizer's job is to shift the linguistic fingerprint toward the human distribution *without sacrificing clarity*. Plain-language editing addressed the same underlying failure long before LLMs existed; this skill applies that discipline specifically to AI fingerprints.

This skill is *not* about making text casual. A technical API doc can be fully humanized while staying formal. It is also not about adding contractions alone — structural uniformity is the stronger fingerprint. And it is not a substitute for copywriting; persuasion and conversion are separate concerns owned by a copywriting skill.

> Clear, direct, and human. AI tells are bugs in the prose.

## When to Use

Use this skill whenever you are tasked with:

1. Writing new documentation, reports, or communicative user text.
2. Editing existing copy or documentation.
3. Reviewing PR descriptions, issue bodies, or release notes.
4. "Humanizing" or adjusting the tone of any drafted text.
5. Writing error messages, UI copy, tooltips, or onboarding instructions.
6. Rewriting text flagged as AI-generated or robotic.
7. Writing commit messages, changelogs, or release notes.

---

## 1. Remove AI Tells and Cliches

Eradicate filler words and overused phrases that immediately signal AI authorship.

**Tier 1 — Always remove (zero tolerance):**

- `delve`, `dive into`, `navigate` (unless literally navigating a UI)
- `testament`, `crucial`, `vital`, `paramount`
- `furthermore`, `moreover`, `consequently`, `in conclusion`
- `seamless`, `robust`, `comprehensive`, `cutting-edge`
- `foster`, `empower`, `elevate`, `leverage`, `harness`
- `it's important to note that`, `it's worth mentioning`
- `in today's world`, `in the ever-evolving landscape`

**Tier 2 — Remove unless technically precise:**

- `utilize` → `use`; `facilitate` → `help` / `enable`; `streamline` → say what improves
- `implement` is OK in code context; `optimize` is OK when measurable

**Before:** *Let's delve into the comprehensive architecture, which serves as a testament to our robust backend.*
**After:** *Here is the backend architecture.*

---

## 2. Enforce Active Voice and Direct Phrasing

Convert passive constructions into active ones. Remove hedging and unnecessary introductory clauses.

### Passive-to-Active Decision Tree

```text
Is the actor known?
├── Yes → Name them: "The server rejects invalid tokens"
│         (not "Invalid tokens are rejected")
└── No → Is the reader the actor?
    ├── Yes → Use imperative: "Click the button to submit"
    │         (not "The button should be clicked")
    └── No → Passive is acceptable: "The migration was applied at 03:00 UTC"
```

### Hedging Language to Remove

| Hedging Pattern | Replace With |
|----------------|-------------|
| "It is recommended that..." | Direct imperative: "Do X" |
| "In order to ensure..." | "To..." |
| "It should be noted that..." | Delete — just state the fact |
| "There are several reasons why..." | State the reasons directly |
| "Basically," / "Essentially," | Delete — adds nothing |
| "I think" / "I believe" | State the claim, qualify with evidence if needed |
| "Kind of" / "Sort of" | Either commit to the statement or don't make it |

**Before:** *In order to ensure that the synchronization process completes successfully, it is important to check your internet connection.*
**After:** *Check your internet connection before syncing.*

---

## 3. Readability Scoring

Use readability formulas to *diagnose* problems, not as optimization targets. Over-optimizing for a score produces choppy, unnatural prose.

### When to Apply Each Formula

| Formula | Best For | Target Score | Red Flag |
|---------|----------|--------------|----------|
| **Flesch-Kincaid Grade** | General docs, onboarding copy | Grade 8–10 | > Grade 14 (academic) |
| **Gunning Fog Index** | Technical documentation | 10–12 | > 15 (impenetrable) |
| **Flesch Reading Ease** | UI copy, tooltips, error messages | 60–70 (standard) | < 30 (very hard) |

### Readability Diagnostic Tree

```text
Text feels hard to read?
├── Long sentences (avg > 20 words)?
│   └── Break sentences. Target 12–18 word average.
├── Multi-syllable words (> 3 syllables frequently)?
│   └── Replace with plain equivalents where meaning is preserved.
├── Dense paragraphs (> 4 sentences)?
│   └── Split. Use bullets for lists of 3+ items.
└── Nested clauses (2+ commas per sentence)?
    └── Unpack into separate sentences or use a colon + list.
```

### Word-Level Simplification

| Complex | Plain | When Complex Is OK |
|---------|-------|--------------------|
| Utilize | Use | Never |
| Ameliorate | Improve / Fix | Never in user-facing text |
| Facilitate | Help / Enable | Formal API docs only |
| Aforementioned | (delete — refer by name) | Never |
| Subsequently | Then / Next | Never in UI copy |

---

## 4. Sentence Variety and Rhythm

Monotonous sentence structure is the #1 tell of AI-generated text. Humans naturally vary sentence length, structure, and opening words.

### The 3-Beat Rhythm Pattern

Alternate sentence lengths in a roughly short–long–medium pattern. This creates a natural cadence that mirrors how people actually write.

**Monotonous (AI pattern):**
> The dashboard shows your profit. The dashboard shows your costs. The dashboard shows your revenue. The dashboard shows your orders.

**Natural rhythm:**
> The dashboard shows your profit at a glance. Below the headline number, you will find a full cost breakdown — production cost, ad spend, transaction fees, and refunds, each with its own trend line. Revenue and order counts sit in the sidebar.

### Sentence Structure Variety Checklist

| Structure | Example | Use When |
|-----------|---------|----------|
| Simple declarative | "Production cost was 41% of sales." | Stating facts, KPI summaries |
| Compound (two clauses) | "Revenue grew 12%, but ad spend grew faster." | Showing contrast or cause-effect |
| Leading with condition | "If cost data is missing, the profit column shows a dash." | Conditional instructions |
| Question + answer | "Why did profit drop? Three refunds hit on Tuesday." | Explanatory sections, FAQs |
| Fragment (intentional) | "Not great." / "Three reasons." | Emphasis, transitions, hooks |

### Opening Word Rotation

Never start 3+ consecutive sentences with the same word. Especially avoid `The` (the most common AI opener), `This`, `It`, `There`. Rotate `We` / `You` too.

---

## 5. Vocabulary Diversity

### Synonym Rotation Rules

1. **Repeat technical terms exactly** — your domain term (an acronym like `MRR` or `CAC`, or any other established industry abbreviation) is always written the same way; never call the same concept `production costs` in one place and `fulfillment expenses` in another.
2. **Rotate generic verbs** — `shows`, `displays`, `lists`, `includes` can rotate for non-technical usage.
3. **Avoid elegant variation** — do not call the same thing three different names. Clarity beats variety.

### Concrete vs. Abstract

| Abstract (weak) | Concrete (strong) | Why |
|-----------------|-------------------|-----|
| "Improve performance" | "Reduce page load from 3.2 s to 1.1 s" | Measurable |
| "Enhance user experience" | "Add inline validation so users fix errors before submitting" | Specific |
| "Significant growth" | "Revenue grew 34% in Q1" | Quantified |
| "Various issues" | "Three bugs: stale cache, missing null check, off-by-one in pagination" | Named |

### Jargon Decision Tree

```text
Is the term domain-specific (industry vocabulary your audience knows)?
├── Yes → Keep it. Add a tooltip or parenthetical on first use.
│         Example: "production cost (what your fulfillment partner charges per order)"
└── No → Is there a simpler word with identical meaning?
    ├── Yes → Use the simpler word.
    └── No → Keep the term but define it inline.
```

---

## 6. Tone Mapping Framework

Tone is not one-size-fits-all. Match the tone to the context and audience.

### The Formal-to-Casual Spectrum

```text
Legal/Compliance ←──── Technical Docs ←──── Product Copy ←──── Internal Comms ←──── Chat
      1                     2                    3                   4                5
```

### Context-Specific Tone Rules

| Context | Tone Level | Character | Example |
|---------|-----------|-----------|---------|
| **API documentation** | 2 (technical) | Precise, neutral | "Returns a 404 if the order ID does not exist." |
| **Error messages** | 3 (product) | Calm, solution-oriented | "Sync failed. We'll retry in 5 minutes." |
| **UI tooltips** | 3 (product) | One sentence, domain-specific | "What your fulfillment partner charges per order." |
| **Commit messages** | 2 (technical) | Imperative, factual | "fix: resolve stale cache in order list" |
| **PR descriptions** | 3 (product) | What changed, why, how to test | Direct bullets, no narrative |
| **Release notes** | 3 (product) | User benefit first | "You can now filter orders by profit margin." |
| **Issue bodies** | 3–4 (product / internal) | Problem → evidence → solution | Structured, not conversational |
| **Onboarding copy** | 3 (product) | Encouraging, time-anchored | "Step 2 of 3: Link your storefront. Takes about 2 minutes." |
| **Empty states** | 3 (product) | Helpful, specific, actionable | "Connect your fulfillment partner to see your production cost here." |
| **Marketing copy** | 4 (internal / casual) | Direct, benefit-led, no hype | "See your real profit per order." |

---

## 7. AI-Detection Avoidance

AI detectors measure two properties: **perplexity** (word predictability) and **burstiness** (sentence-length variance). AI text is low-perplexity (predictable words) and low-burstiness (uniform sentence lengths).

### Techniques That Increase Human-Likeness

| Technique | What It Does | Example |
|-----------|--------------|---------|
| **Sentence-length variance** | Raises burstiness score | Mix 5-word sentences with 25-word ones |
| **Unexpected word choices** | Raises perplexity | "The API barks back a 403" vs. "The API returns a 403" |
| **Idiomatic expressions** | Raises perplexity | "That shipped" / "under the hood" / "the gotcha is..." |
| **Contractions** | Natural speech pattern | "doesn't" not "does not"; "you'll" not "you will" |
| **Sentence fragments** | Burstiness spike | "Not ideal." / "Three reasons." / "Here's why." |
| **Rhetorical questions** | Pattern break | "Why does this matter?" before an explanation |
| **First-person asides** | Personal voice signal | "(I ran into this on the webhook handler)" |
| **Specific numbers / names** | Concrete detail | "The 847th order" vs. "a particular order" |

### What NOT to Do

- Do **not** insert typos or grammatical errors.
- Do **not** use obscure vocabulary just to raise perplexity.
- Do **not** sacrifice clarity for detection avoidance — clarity always wins.
- Do **not** apply these techniques to code comments or strict API docs (precision over personality there).

---

## 8. Paragraph Rhythm and Structure

### Paragraph Length Rules

| Context | Max Sentences | Max Words | Notes |
|---------|---------------|-----------|-------|
| Body paragraphs (docs) | 4 | ~80 | Break at topic shifts |
| UI descriptions | 2 | ~30 | One idea per paragraph |
| Tooltips | 1 | ~15 | Single sentence, no period |
| Error messages | 2 | ~25 | Problem + action |
| Commit messages | 1 (subject) + optional body | 50 (subject) | Imperative mood |

### The Hook-Body-Landing Pattern

Strong paragraphs follow this structure:

1. **Hook sentence** — short, direct, states the point (5–10 words)
2. **Body sentences** — develop the point with evidence or detail (1–3 sentences)
3. **Landing sentence** — wraps up or transitions (optional, keep short)

**Weak (no hook):** *When you consider the various factors that contribute to the overall profitability of an order, including the cost of goods sold...* (reader lost by word 10)

**Strong (hook-body-landing):** *Order profit depends on three cost layers. Production cost covers what your fulfillment partner charges. Transaction fees come from your payment processor. Add refunds, and you get real margin.*

### When to Use Bullets vs. Prose

```text
Is it a list of 3+ items?
├── Yes → Are items parallel in structure?
│   ├── Yes → Bulleted list
│   └── No → Fix parallelism first, then bullet
└── No → Prose (2 items can stay inline with "and")
```

---

## 9. Anti-Patterns Reference

### Over-Qualification

Adding unnecessary caveats that weaken every statement.

| Over-Qualified | Direct |
|----------------|--------|
| "It might be worth considering that perhaps..." | State the recommendation |
| "This could potentially help to somewhat improve..." | "This improves..." |
| "In some cases, it may be possible to..." | "You can..." |

### Repetitive Transitions

AI text chains paragraphs with the same connectors. Vary or delete.

| Overused | Alternatives |
|----------|--------------|
| "Additionally," | (delete — just start the sentence) |
| "Furthermore," | (delete — or use a colon on the previous sentence) |
| "However," | "But" / "That said," / start with the contrasting fact |
| "Therefore," | "So" / (delete — the logic should be self-evident) |
| "In conclusion," | (delete — just conclude) |

### The Enumeration Trap

AI loves "There are three key aspects:" followed by "First, ... Second, ... Third, ..." Humans just list them: *Order profitability depends on production cost, transaction fees, and refund rates.*

### Hollow Intensifiers

Remove words that add emphasis but no meaning: `very`, `really`, `extremely`, `highly`, `absolutely`. If `important` needs strengthening, pick a stronger word (`critical`, `required`). If `fast` needs a number, give the number.

---

## 10. The Humanization Workflow

When tasked with humanizing text, follow this 5-step process:

1. **Tell Scan.** Read the text once. Highlight every word from the Tier 1 removal list (section 1). Mark passive constructions and hedging phrases.
2. **Readability Check.** Estimate average sentence length. If over 20 words, flag for splitting. Count paragraphs over 4 sentences — flag for breaking.
3. **Structural Rewrite.** Break long sentences. Convert inline semicolon lists to bullets. Apply the hook-body-landing pattern to weak paragraphs. Fix passive voice using the decision tree (section 2).
4. **Rhythm Pass.** Read the rewrite aloud (mentally). Check for:
   - 3+ consecutive sentences starting with the same word → rotate openers
   - All sentences the same length → vary (short-long-medium)
   - All sentences the same structure → mix declarative, conditional, fragment
5. **Voice Calibration.** Match tone to context using the tone-mapping table (section 6). For technical docs, keep precision over personality.

---

## Output Expectations

When asked to revise text or provide new text following these guidelines, **only output the revised text**. Do not provide metacommentary like "Here is the humanized version:" unless explicitly asked to explain your changes.

## Verification

Before finalizing any humanized text, confirm:

- [ ] Zero Tier 1 AI tells remaining (section 1 word list)
- [ ] No passive voice where active is possible (section 2 decision tree)
- [ ] Average sentence length between 12–18 words
- [ ] No paragraph exceeds 4 sentences (docs) or 2 sentences (UI copy)
- [ ] No 3+ consecutive sentences start with the same word
- [ ] Sentence lengths vary (not all within 2–3 words of each other)
- [ ] Technical jargon is explained on first use or tooltipped
- [ ] Tone matches the context (section 6 tone table)
- [ ] Concrete details used instead of abstract claims (section 5)
- [ ] No metacommentary in output ("Here is the humanized version:")

## Do NOT Use When

| Instead, use | Why |
|---|---|
| `documentation` | Choosing a doc type, structuring a doc, or applying progressive disclosure of *content*. Documentation owns the doc architecture; writing-humanizer owns the prose form inside it. |
| `microcopy` | Writing the specific UX-text patterns (button labels, empty-state structure, tooltip rules, dialog rules, toast rules). Microcopy owns the UX patterns; writing-humanizer owns AI-tell removal in any prose. |
| `linguistics` | The underlying linguistic rules — morphology, polysemy resolution, audience register as a general principle, blame-free framing. Linguistics owns the rationale; writing-humanizer owns the AI-fingerprint detection-and-fix workflow. |
| `semantics` | Naming an identifier, design token, HTTP status code, or commit type — the meaning encoding behind any name. Semantics owns the meaning encoding; writing-humanizer owns the prose around it. |
| `naming-conventions` | Deciding the casing format for an artifact kind. Naming-conventions is a code-identifier convention skill, not a prose skill. |
| `code-review` | Reviewing a specific PR for correctness, security, or quality. Code-review may use writing-humanizer as one input for the PR description; it does not own the prose rules. |
| (a copywriting skill) | Marketing headlines, pricing copy, landing-page persuasion, brand-voice work. Copywriting owns persuasive product surfaces; writing-humanizer owns prose-quality humanization. |
| (a typography skill) | Font rendering, font loading, or typographic hierarchy work. Typography owns font engineering; writing-humanizer owns the words rendered in the font. |
