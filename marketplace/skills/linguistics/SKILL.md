---
name: linguistics
description: "Use when choosing semantically precise names for files/functions/variables/types/columns, resolving overloaded terms, reviewing error messages or UI copy for blame/register clarity, or adapting language for end-user/agent/developer/global-audience contexts. Covers morphology, compound-word order, abbreviation policy, verb-noun naming, polysemy qualification, audience register, blame-free error structure, and cross-cultural language awareness. Do NOT use for casing convention policy (use `naming-conventions`), call-site-wide renames (use `refactor`), docs/navigation structure (use `information-architecture`), specialized UI text pattern catalogs (use `microcopy`), or final prose humanization (use `writing-humanizer`). Do NOT use for decide kebab-case vs snake_case vs camelCase for new database columns. Do NOT use for restructure this doc into a tutorial format with progressive disclosure. Do NOT use for implement Intl.NumberFormat for DKK vs USD currency formatting."
license: MIT
compatibility: "Provider-, runtime-, stack-, and language-agnostic. The morphology, polysemy, register, and error-message rules apply to any software product; substitute the artifact conventions and project language of the local stack while preserving the meaning-level checks."
allowed-tools: Read Grep
metadata:
  grounding: "{\"subject_matter\":\"Linguistic precision for software identifiers, UI copy, error messages, technical documentation, and cross-cultural language choices\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://developers.google.com/style/voice\",\"https://developers.google.com/style/tone\",\"https://developers.google.com/style/translation\",\"https://learn.microsoft.com/en-us/windows/apps/design/style/writing-style\",\"https://learn.microsoft.com/en-us/windows/win32/debug/error-message-guidelines\",\"https://www.w3.org/TR/WCAG22/\",\"https://www.nngroup.com/articles/ten-usability-heuristics/\",\"https://www.nngroup.com/articles/hostile-error-messages/\"],\"failure_modes\":[\"naming_taste_mistaken_for_linguistic_fit\",\"artifact_casing_policy_confused_with_semantic_naming\",\"polysemous_identifier_left_unqualified\",\"generic_handle_process_or_utils_names_hide_contracts\",\"error_copy_blames_user_or_hides_action\",\"agent_register_leaks_into_end_user_copy\",\"global_audience_copy_uses_idioms_jargon_or_untranslatable_phrasing\",\"linguistics_overowns_refactor_docs_ia_microcopy_or_i18n_implementation\"],\"evidence_priority\":\"equal\"}"
  drift_check: "{\"last_verified\":\"2026-05-19\"}"
  schema_version: "8"
  version: "1.2.0"
  subject: knowledge-organization
  deployment_target: portable
  taxonomy_domain: foundations/language
  owner: skill-graph-maintainer
  freshness: "2026-05-19"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"linguistic precision\",\"software linguistics\",\"identifier morphology\",\"polysemy resolution\",\"polysemy map\",\"register selection\",\"audience register\",\"blame-free error wording\",\"what why action error structure\",\"compound-word ordering\",\"abbreviation policy\",\"ambiguous identifier qualification\",\"semantic naming\",\"global audience language\",\"cross-cultural language awareness\",\"verb-noun naming rule\",\"unqualified polysemous identifier\",\"error-message linguistics\"]"
  examples: "[\"this variable is named provider but it could mean fulfillment, auth, or payment -- what linguistic rule applies?\",\"rewrite this error message to be specific, blame-free, and actionable\",\"the word shipping means seller cost in one file and customer charge in another -- how do we resolve the polysemy without a glossary cleanup?\",\"should this helper file be called utils.ts, helpers.ts, or something domain-specific?\",\"explain how to phrase the same finance concept for an end-user, an agent, and a developer\",\"audit this UI copy for register mismatch with the end-user audience\",\"when is an abbreviation acceptable in a code identifier?\",\"is this sentence clear for a global developer audience or full of idioms and ambiguous modifiers?\"]"
  anti_examples: "[\"decide kebab-case vs snake_case vs camelCase for new database columns\",\"restructure this doc into a tutorial format with progressive disclosure\",\"implement Intl.NumberFormat for DKK vs USD currency formatting\",\"give me the canonical definition of reconciliation in our domain\",\"review this PR for code quality and missing tests\",\"rename this function and update every call-site across the repo\",\"rewrite this release note only to remove AI tells and vary sentence rhythm\"]"
  relations: "{\"boundary\":[{\"skill\":\"naming-conventions\",\"reason\":\"naming-conventions owns artifact-specific casing, prefix/suffix policy, and deterministic convention choice; linguistics owns the meaning-level rationale behind morphology, polysemy resolution, register, and error wording.\"},{\"skill\":\"refactor\",\"reason\":\"refactor owns behavior-preserving rename mechanics across call sites; linguistics owns choosing a precise name before or during the rename.\"},{\"skill\":\"information-architecture\",\"reason\":\"information-architecture owns docs/navigation/page hierarchy and findability; linguistics owns sentence-level and identifier-level meaning inside that structure.\"},{\"skill\":\"microcopy\",\"reason\":\"microcopy owns specialized in-product UI-text patterns such as button, empty-state, tooltip, dialog, and toast structures; linguistics owns underlying language rules and register diagnostics.\"},{\"skill\":\"writing-humanizer\",\"reason\":\"writing-humanizer owns prose polish, AI-tell removal, and rhythm repair; linguistics owns morphology, semantic ambiguity, audience register, and blame-free error language.\"}],\"related\":[\"semantics\",\"writing-humanizer\",\"microcopy\",\"prompt-craft\",\"intent-recognition\",\"code-review\"],\"verify_with\":[\"naming-conventions\",\"code-review\",\"writing-humanizer\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  mental_model: "|"
  purpose: "|"
  boundary: "|"
  analogy: "Linguistics in software is grammar for the interface between people and systems: the syntax of a name or sentence should make the intended meaning easy to recover without hidden context."
  misconception: "The common mistake is treating naming and wording as personal preference. Ambiguous words, weak compounds, blame-heavy error text, and wrong register create predictable comprehension failures; agreement inside one team does not make the language portable or clear."
  concept: "{\"definition\":\"Linguistics applied to software is the discipline of using human-language structure, meaning, context, and audience register to shape code identifiers, labels, error messages, UI copy, and technical prose so readers can decode intent reliably.\",\"mental_model\":\"Treat every name or visible string as a small language artifact. Its form carries a contract: morphology makes the artifact parseable, semantics fixes what it means, pragmatics fits the situation, and register fits the audience.\",\"purpose\":\"The skill replaces taste-based naming and copy decisions with repeatable linguistic checks for ambiguity, misleading names, register mismatch, blame assignment, and cross-language readability.\",\"boundary\":\"It does not own casing convention policy, repo-wide rename mechanics, document information architecture, specialized UI microcopy pattern catalogs, final prose humanization, or locale-format implementation.\",\"taxonomy\":\"Foundations/language capability covering morphology, semantics, pragmatics, sociolinguistic register, error-message language, and cross-cultural language awareness for software surfaces.\",\"analogy\":\"It is grammar for the interface between people and software: the syntax of a name or sentence should make the intended meaning easy to recover without hidden context.\",\"misconception\":\"The common mistake is treating naming and wording as personal preference. Ambiguous words, weak compounds, blame-heavy error text, and wrong register create predictable comprehension failures.\"}"
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/knowledge-organization/linguistics/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

# Linguistics

## Coverage

Linguistic analysis patterns for software work — the rules that govern how names, labels, error messages, and copy are formed. Covers (1) **morphology**: casing conventions per artifact kind, compound-word head-first ordering, abbreviation decision tree, verb-noun naming patterns; (2) **polysemy resolution**: identifying ambiguous identifiers in a codebase and qualifying them with their domain (e.g., `provider` → `fulfillmentProvider` / `authProvider` / `paymentProvider`); (3) **register selection**: choosing the right tone, vocabulary, and sentence structure for end-users, agents, and developers; (4) **error-message linguistics**: the three-part What → Why → What-to-do structure with blame-free framing, specificity rules, and actionability; and (5) **cross-cultural linguistic awareness**: the linguistic facts (number structure, currency notation, grammatical gender, script direction) that shape internationalization decisions. Provides the *linguistic rationale* for these choices — not the casing convention itself, not document/navigation structure, not specialized UI microcopy pattern catalogs, not final prose polish, not canonical term definition, and not i18n implementation.

## Philosophy

Language in software is architecture. A function named `handleContinue` can do anything from persisting form state to advancing a wizard — it carries a weak contract outside its local component. A function named `transformPaymentEvent` is much harder to misunderstand. An error message that says "Error 500" transfers zero information; one that says "Order sync paused — your API key may have expired. Open Settings → Integrations to reconnect." transfers a complete causal chain plus an action. The same word can carry different meanings in different parts of the same codebase, and without disambiguation every reader must infer the meaning from surrounding context — that inference has a cost, and sometimes a failure mode.

Three linguistic laws follow:

1. **Names are contracts.** A name commits to what a thing is and what it does. Changing behavior without changing the name is a lie.
2. **Ambiguous terms compound.** One ambiguous term causes one bug. Ten ambiguous terms cause a combinatorial fog. Resolve at the first encounter, not in a later cleanup.
3. **Audience determines form.** The same fact needs different words for an end-user, an agent, and a developer. Writing in the wrong register is a communication failure even when the facts are correct.

The linguistic goal is to make meaning unambiguous *at the point of contact* — in the name itself, the message itself, the label itself — not in a glossary entry the reader has to look up.

## Boundary Routing

| Trigger | Use this skill? | Route |
|---|---:|---|
| Choosing the meaning-bearing words in an identifier, label, error, or agent-facing sentence | Yes | Apply morphology, polysemy, register, and blame-free language checks here. |
| Choosing kebab-case vs camelCase vs snake_case or project-wide artifact naming convention | No | Use `naming-conventions`; return here only for semantic ambiguity or abbreviation judgment. |
| Renaming a symbol across call sites or preserving behavior through a structural rename | No | Use `refactor`; this skill may supply the target name but not the mechanics. |
| Structuring docs, navigation, page hierarchy, sitemap, or content grouping | No | Use `information-architecture`; this skill only audits wording inside the structure. |
| Choosing a specialized button, empty-state, tooltip, dialog, or toast text pattern | Usually no | Use `microcopy`; return here for register, blame, ambiguity, or cross-cultural language concerns. |
| Removing AI tells, improving prose rhythm, or polishing a release note/PR/doc paragraph | No | Use `writing-humanizer`; return here when the question is linguistic correctness rather than prose finish. |
| Implementing locale-aware number/date/currency/plural behavior | No | Use the project i18n tooling and platform docs; this skill explains the language risk, not the implementation. |

---

## 1. Naming Precision (Morphology)

Morphology is the study of word form — how words are built from parts. In code, the "words" are identifiers, and the "morphology rules" are casing conventions, compounding strategies, and abbreviation policies.

### Casing Conventions and Their Linguistic Basis

| Convention | Typical Use | Linguistic Reason |
|------------|-------------|-------------------|
| `camelCase` | Variables, function names in many languages | Each morpheme boundary is marked by capitalization; reads as one compound word |
| `PascalCase` | Types, classes, components | Same compound logic, but signals "noun/thing" rather than "action/value" |
| `kebab-case` | File names, CSS classes, URL paths | Human-readable in filesystem and URL contexts where case is often flattened |
| `snake_case` | Database columns, Python identifiers | Separator makes each morpheme explicit; SQL is case-insensitive so underscores are the only safe delimiter |
| `SCREAMING_SNAKE` | Constants, enums, environment variables | All-caps signals immutability; snake separators keep it readable |

**Rule:** match the convention to the artifact-kind context, never cross-pollinate. `orderCount` in TypeScript, `order_count` in SQL, `order-count` in CSS. They are the same concept expressed in three linguistic registers. The casing decision itself belongs to `naming-conventions`; this skill explains *why* each convention fits its context.

### Compound Word Rules

Compound words carry more semantic load than simple words. The order of morphemes matters.

**Head-first vs. modifier-first:**

In English technical compounds, the modifier comes first and the head (the main concept) comes last. The head tells you *what kind of thing it is*; the modifier qualifies it.

| Compound | Head | Modifier | Reads as |
|----------|------|----------|----------|
| `shippingCost` | cost | shipping | "a cost, specifically for shipping" |
| `orderCount` | count | order | "a count, specifically of orders" |
| `fulfillmentProvider` | provider | fulfillment | "a provider, specifically for fulfillment" |

**Anti-pattern:** reversing the order (`costShipping`, `countOrders`) breaks English morphology and makes names harder to scan. The mind expects the head at the end.

**Disambiguation through compounding:**

When a simple word is ambiguous, compound it with its domain qualifier:

| Ambiguous | Qualified | Domain |
|-----------|-----------|--------|
| `shipping` | `shippingCostCents` | Outbound cost paid by the seller |
| `shipping` | `shippingChargedCents` | Amount charged to the customer |
| `provider` | `fulfillmentProvider` | Fulfillment partner |
| `provider` | `authProvider` | Authentication identity provider |
| `provider` | `paymentProvider` | Payment processor |
| `cost` | `productionCostCents` | Production / fulfillment cost |
| `cost` | `subscriptionCost` | Plan pricing |
| `cost` | `tokenCostUsd` | Inference / API cost |

**Rule:** if a word has more than one meaning anywhere in the codebase, compound it with its domain qualifier. The unqualified form is banned in typed code.

### Abbreviation Policy

Abbreviations save characters but cost comprehension. Use this decision tree:

```
Is this abbreviation universally understood by every reader?
├── Yes → Allow (examples: URL, API, DB, ID, HTML, CSS, JSON, HTTP, SKU)
└── No → Is the full form longer than 25 characters?
    ├── No → Use the full form
    └── Yes → Is the abbreviation used in 10+ places?
        ├── No → Use the full form, consider renaming the concept
        └── Yes → Define the abbreviation in the project glossary, then allow it
```

**Always acceptable:** `id`, `url`, `api`, `db`, `html`, `css`, `json`, `http`, `sku`, `ui`, `ux`, `pii`, `gdpr`.

**Never acceptable:** `mgr` (manager), `proc` (process or procedure?), `calc` (just write `calculate`), `btn` (button), `val` (validate or value?), `auth` without qualifier (authentication or authorization?), `temp` (temporary or temperature?), `util` (a red flag — see anti-patterns).

### Verb-Noun Naming Patterns

Functions describe actions (verbs). Variables describe things (nouns). Mixing the patterns creates naming smells.

**Function naming — verb-first:**

| Verb | When to use | Example |
|------|-------------|---------|
| `get` | Retrieval from a source, may be async | `getOrders`, `getOrderById` |
| `fetch` | Specifically async network call | `fetchExternalOrders` |
| `load` | Load into memory/state from a slower source | `loadDashboardData` |
| `validate` | Check correctness, return boolean or throw | `validateWebhookPayload` |
| `parse` | Convert raw input into typed output | `parseConnectionString` |
| `transform` | Convert one structured form to another | `transformPaymentEvent` |
| `convert` | Change units or formats, same semantic content | `convertCentsToDisplayAmount` |
| `calculate` | Derive a computed value | `calculateNetMargin` |
| `create` | Instantiate and persist | `createPlatformConnection` |
| `update` | Modify existing entity | `updateOrderStatus` |
| `delete` / `remove` | Destructive operations | `deleteAccount`, `removeLineItem` |
| `handle` | Entry point for events/webhooks (and nothing else) | `handleIncomingWebhook` |
| `process` | Multi-step pipeline execution | `processVerifiedWebhook` |
| `extract` | Pull a subset from a larger structure | `extractOrderPii` |
| `format` | Produce a display string | `formatCurrencyDisplay` |
| `build` | Assemble a complex object | `buildCanonicalOrder` |

**Anti-pattern:** using `handle` for everything in server-side or utility code. `handleSync` tells you the entry point. It does not tell you whether it validates, transforms, persists, or retries. Name the operation, not the trigger.

**Exception — UI event handlers:** in component files (e.g., React `.tsx`), `handle*` is the established convention for DOM event callbacks (`handleSubmit`, `handleChange`, `handleClose`). These are scoped to the component and the "event being handled" is self-evident from the UI context. The anti-pattern label applies to backend / service / utility functions where the operation ambiguity is real.

**Variable naming — noun-first:**

| Pattern | Example | Why |
|---------|---------|-----|
| Boolean: `is` + adjective | `isValid`, `isActive`, `isReconciled` | Reads as a question in conditions: `if (isValid)` |
| Boolean: `has` + noun | `hasConnection`, `hasFinancialData` | "Does X have Y?" — confirms presence |
| Boolean: `can` + verb | `canExportOrders`, `canEditPricing` | Permission check — "is X allowed to do Y?" |
| Count: noun + `Count` | `orderCount`, `lineItemCount` | Disambiguates from the collection |
| Collection: plural noun | `orders`, `lineItems`, `errors` | Plural form signals collection; no `List`, `Array`, `Set` suffix |
| Nullability | Express via the type system, not the name | Use `T | null`, not `*OrNull` suffixes |
| Currency-as-integer | noun + `Cents` (or unit suffix) | Mandatory for any financial integer; never store money as a float |

---

## 2. Polysemy Resolution (Disambiguation)

Polysemy is when one word carries multiple meanings. In natural language, surrounding context resolves the ambiguity automatically. In code and documentation, context is often missing — and the resolution cost falls on every reader.

### Polysemy Map (Examples)

These words are commonly polysemous in software. The unqualified form should not appear in typed code; always use the qualified form.

| Ambiguous term | Context A | Context B | Context C | Qualified forms |
|----------------|-----------|-----------|-----------|-----------------|
| **margin** | Finance: profit as % of revenue | CSS: spacing property | Domain-typical range (industry-specific) | `marginPercent` (finance), CSS property (leave as-is in stylesheet) |
| **shipping** | Cost paid by the seller to a carrier | Amount charged to the customer on invoice | The carrier itself | `shippingCostCents`, `shippingChargedCents`, `carrierName` |
| **provider** | Fulfillment partner | Authentication identity provider | Payment processor | `fulfillmentProvider`, `authProvider`, `paymentProvider` |
| **cost** | Production / fulfillment cost | Subscription plan pricing | Inference / API token spend | `productionCostCents`, `subscriptionPriceCents`, `tokenCostUsd` |
| **sync** | Data import from an external platform | URL ↔ UI state coordination | Inter-process / inter-agent coordination | `platformSync`, `stateSync`, `agentSync` |
| **channel** | Sales platform | Alert delivery medium | Chat-platform channel | `salesChannel`, `alertChannel`, `chatChannel` |
| **source** | Data origin (which platform) | Source code file | Content source | `dataSource`, `sourceFile`, `contentSource` |
| **status** | Order status (pending / shipped) | Fulfillment status (in production) | Task status (in progress / done) | `orderStatus`, `fulfillmentStatus`, `taskStatus` |
| **connection** | Platform integration (a third-party connected) | Database connection pool | WebSocket connection | `platformConnection`, `dbConnection`, `wsConnection` |
| **confidence** | Data completeness score (0–100) | Statistical probability | Colloquial certainty | `dataConfidenceScore`, keep `confidence` in statistical contexts |

### Resolution Protocol

When you encounter an ambiguous term:

1. **Identify all contexts** where the term appears in the codebase. Grep before assuming.
2. **Choose the qualified form** for each code context. The project glossary is the authority on canonical forms.
3. **Update the variable name, column name, or UI label** to use the qualified form.
4. **Document the disambiguation** in a code comment if the qualified form is not yet self-evident.

**Code naming rule:** the qualified form goes into the identifier. No fallback to context inference.

```typescript
// Wrong — "shipping" is ambiguous
const shipping = order.shipping_cost + order.shipping_charged;

// Right — each concept is named precisely
const shippingCostCents = order.shipping_cost_cents;       // seller pays this
const shippingChargedCents = order.shipping_charged_cents; // customer pays this
```

**Documentation rule:** the first occurrence of an ambiguous term in any doc must be qualified. Subsequent occurrences may use the short form only if the surrounding context is unambiguous.

---

## 3. Tone and Register

Register is the level of formality and technicality appropriate for a given audience and context. The same fact requires different register for an end-user, an agent, and a developer. Writing in the wrong register is a communication failure even when the content is accurate.

### Register Map

| Audience | Context | Register | Character | Example |
|----------|---------|----------|-----------|---------|
| **End-user** | UI copy, tooltips, empty states, error messages | Warm, plain, action-oriented | A knowledgeable friend who respects the user's time and intelligence | "Connect your fulfillment partner to see your real production cost per order." |
| **End-user** | Onboarding | Confident, step-by-step, time-honest | A setup guide written by someone who has done this a hundred times | "Step 2 of 5: Link your storefront. Takes about 2 minutes." |
| **Agent** | Skill / capability files | Dense, precise, reference-heavy | A technical spec from a colleague who assumes domain knowledge | "Use `fulfillmentProvider`, never unqualified `provider`. Three distinct meanings exist." |
| **Agent** | Structured logs | Diagnostic, no hedging | A structured log entry | `[WEBHOOK_FAILED] order_id=12345 reason=hmac_mismatch retry=true` |
| **Developer** | Code comments | Concise, rationale-focused, explains *why* | A note from the author who knows the reader is technical | `// Using the org-scoped query — must stay tenant-scoped (ABC-123)` |
| **Developer** | Architecture decision records | Formal, decision-focused, versioned | An architectural decision record | "Decision: use COALESCE(EXCLUDED.col, existing.col) to prevent null overwrites on upsert." |
| **Developer** | PR descriptions | Technical, factual, testable | A clear brief for a code reviewer | "Adds HMAC verification to platform webhooks. Test: curl the endpoint without the signature header — expect 401." |

### End-User Register: Detailed Rules

The end-user register has the tightest constraints because it directly affects user trust and conversion.

**Vocabulary:**
- Use domain terms the user already knows: revenue, margin, SKU, fulfillment for an e-commerce audience; subscriber, MRR, churn for a SaaS audience.
- Avoid internal technical terms: `canonical`, `reconciliation` (say "matched" instead), `backfill` (say "importing past data").
- Use "you" and "your" — the UI speaks to the user directly.
- Quantify time when you know it: "~2 minutes" beats "just a moment".

**Sentence structure:**
- Lead with the outcome, not the process. "See your real profit per order" not "This feature connects your order data and calculates profit."
- Use active voice. "Sync paused" not "Sync has been paused."
- One idea per sentence in error messages.

**Tone:**
- Calm authority, not startup hype. "Know your real profit." not "Unlock powerful profit insights!"
- Honest about missing data. "Connecting your fulfillment partner will reveal your production cost." not "Your profit: $0.00" when production cost is unknown.
- Never blame the user. "We couldn't connect" not "You entered the wrong API key."

### Agent-Facing Register: Detailed Rules

Agent-facing docs prioritize density and parsability over warmth.

**Structure:**
- Tables over prose for any comparison of 3+ items.
- Bullet points for sequential rules or lists of 3+ items.
- Code blocks for any naming example, pattern, or anti-pattern.
- No narrative introductions — lead with the rule.

**Vocabulary:**
- Use precise technical terms without definition: polysemy, morpheme, compound, register. The agent has loaded the skill.
- Name file paths absolutely (e.g., `src/lib/payment/processor.ts`), not "the payment processor".
- Reference the evidence: "Verified in `cardComponent.tsx` line 42" not "this is the pattern used".

### Developer-Facing Register: Detailed Rules

Developer-facing content (code comments, ADRs, PR descriptions) lives closer to the code and prioritizes rationale.

**Code comments:**
- Explain *why*, not *what*. The code is the *what*. `// must use the tenant-scoped query — raw query() leaks across tenants (ABC-123)` not `// using tenant-scoped query here`.
- Flag non-obvious decisions: `// COALESCE prevents null overwrite on re-webhook — partner has a 30-day deletion window`.
- Link to the issue: `(ABC-123)` in comments that address a known bug or decision.

**PR descriptions:**
- Problem statement first: what was broken or missing.
- Solution: what changed and why this approach.
- Test protocol: how to verify the change is correct.
- Breaking changes: explicit callout if any contract changed.

---

## 4. Cross-Cultural Linguistic Awareness

Implementation details for currency formatting, date locale rules, and number systems belong to a separate i18n skill. This section covers only the *linguistic awareness* that shapes those decisions: different languages have fundamentally different number structures, grammatical gender, and script directions.

**Key linguistic facts that affect i18n decisions:**

- **Number structure differs by language.** English uses comma-grouping and period-decimal (`1,234.56`); many European locales reverse them (`1.234,56`). This is not a formatting preference — it changes how numbers are *read*. A developer writing number logic must know the linguistic reason for the locale parameter, not just its mechanical effect.
- **Currency symbols carry meaning beyond their value.** `$` signals USD to a US reader; `€` signals EUR. Bare numbers without currency symbols are linguistically incomplete — they transfer a quantity but not a unit. Always qualify with the currency code or symbol.
- **Grammatical gender affects pluralization.** English has no grammatical gender for numbers, but many languages do. A string like "1 order" vs "2 orders" is a morphological change; other languages require agreement with grammatical gender of the noun. Hardcoded plurals are always wrong.
- **Script direction is architectural.** Arabic, Hebrew, and Persian run right-to-left. This is not a CSS toggle — it reverses spatial reasoning (icons, progress bars, layout flow). Affects component architecture far upstream of any formatting call.
- **Operator-language vs audience-language axis.** When the maintainer's primary language differs from the target audience's, code identifiers and UI copy should follow the audience's language conventions, never the maintainer's. Personal notes can stay in the operator's language; anything an agent or another developer reads must be in the project's chosen lingua franca.

### Operator-Language Code Mixing

When the maintainer is bilingual, all code-facing surfaces must be in the project's chosen language:

| Domain | Rule | Reason |
|--------|------|--------|
| Code identifiers | Project language only | Global readability; future contributors may not read the operator's native language |
| UI copy | Audience language only | The product speaks the audience's language |
| Internal docs (skill files, ADRs) | Project language only | Agent-readable docs must be in a single language |
| Commit messages | Project language only | Conventional-commit type/scope terms are typically English |
| Code comments | Project language only | Agents and developers across regions read these |
| Personal notes (private) | Operator's native language acceptable | Private communication between operator and operator-only tools |
| Business term references | Qualify if a non-project-language term is used | Proper nouns (carrier names, regulatory terms) are acceptable as borrowed words |

**Anti-pattern:** business concepts from the operator's native language slipping into code as abbreviations. If a word in the operator's language collides with a different meaning in the project language, the abbreviation is unsafe even when the operator finds it natural.

---

## 5. Error-Message Linguistics

Error messages are the most linguistically precise text in any software product. They arrive at the worst moment for the reader (something went wrong) and must deliver maximum information in minimum words.

### The Three-Part Structure

Every error message must answer three questions in order:

1. **What happened?** — Name the failure specifically. Not "an error occurred."
2. **Why?** — Name the cause if known. Skip this if the cause is unknown — do not guess.
3. **What to do next?** — Give one specific action. Not "contact support" as a first resort.

| Pattern | Example |
|---------|---------|
| What → Why → What to do | "Order sync paused — your API key expired. Open Settings → Integrations to reconnect." |
| What → What to do (cause unknown) | "Couldn't load your orders. Try refreshing. If this continues, check your storefront connection." |
| What (system message, no user action) | "Webhook received but could not be verified. The payload was rejected." |

### Blame-Free Language

| Blame-assigning (wrong) | Blame-free (right) | Why |
|------------------------|---------------------|-----|
| "You entered the wrong API key." | "We couldn't verify your API key." | Passive construction removes blame; "verify" names the operation |
| "Invalid input." | "This field requires a number between 1 and 100." | Describe what's needed, not what was wrong |
| "You haven't connected the fulfillment partner yet." | "Connect your fulfillment partner to see your production cost." | Positive framing — lead with the outcome |
| "Your sync failed." | "Sync paused — we'll retry automatically in 5 minutes." | "Your sync failing" reads as the user's fault; "sync paused" is a system state |

**Rule:** never use "you" in a negative construction. "You haven't…", "You entered…", "Your connection failed…" all assign blame. Reframe to a system state or a missing action.

### Specificity Rules

| Too vague | Specific | Why |
|-----------|----------|-----|
| "Something went wrong." | "Order sync failed — the API returned a 429 (rate limit). Retrying in 60 seconds." | Names the operation, the error code, and the recovery |
| "Error loading data." | "Couldn't load orders for the last 30 days. Your storefront connection may have expired." | Names the data type, time range, and probable cause |
| "Action failed." | "Couldn't archive order #1247 — it's currently in fulfillment." | Names the order, the operation, and the blocking state |

**Include the entity name** when the error involves a specific record, connection, or resource. `order #1247` beats "an order"; `your store "my-shop"` beats "your store".

### Actionability

Every error that requires user action must end with a specific next step:

| Error type | Actionable ending |
|------------|-------------------|
| Connection expired | "Open Settings → Integrations to reconnect." |
| Missing source data | "Connect your fulfillment partner to see your production cost." |
| Sync paused | "We'll retry in 5 minutes. Or reconnect now in Settings → Integrations." |
| Rate limit hit | "We're retrying automatically. No action needed." |
| Unknown error | "Refresh the page, or check your connection in Settings." |

**Never end with a bare error.** If the error is purely informational (system log, agent message), mark it explicitly as informational so the reader knows no action is needed.

---

## 6. Anti-Patterns

| Anti-pattern | Example | Why it fails | Correct pattern |
|-------------|---------|--------------|-----------------|
| **Generic verb names** | `handleContinue()`, `handleRefresh()`, `handleExport()` in non-UI code | Carries too little semantic load once you leave the local UI context | Name the operation and its subject: `transformPaymentEvent()`, `validateWebhookPayload()` |
| **Unqualified polysemous terms** | `provider`, `shipping`, `cost`, `margin` in typed code | Ambiguous — requires context to resolve | Always compound with domain: `fulfillmentProvider`, `shippingCostCents`, `productionCostCents`, `marginPercent` |
| **Register mismatch** | "COGS null — display `—`" in an end-user tooltip | Agent register in an end-user context | "Cost data not yet available for this order." |
| **Blame-assigning errors** | "You haven't connected your storefront yet." | Assigns blame; creates friction | "Connect your storefront to start tracking revenue." |
| **Abbreviation overload** | `calcMgrSvcUtil()` | Three unrecognized abbreviations; zero parsability | `calculateManagedServiceUtilization()` (or rename the concept) |
| **False precision in i18n** | `$${(cents / 100).toFixed(2)}` | Hardcoded USD symbol, no locale, bypasses any shared formatter | Use the project's currency formatter or `Intl.NumberFormat(...)` |
| **Vague error messages** | "Error 500. Please try again." | Names neither the operation nor the cause | "Sync failed. We'll retry automatically — check Settings if this persists." |
| **Implicit null = zero** | Display `$0.00` when the cost field is null | Null means *unknown*; zero means *confirmed zero*. `$0.00` cost implies 100% margin | Display `—` or "Cost unknown" when null |
| **Utility file names** | `utils.ts`, `helpers.ts`, `misc.ts` | Non-names that aggregate unrelated functionality | Name by domain: `orderCalculations.ts`, `webhookValidation.ts`, `currencyFormatting.ts` |

---

## Verification

Before committing code, writing documentation, or shipping UI copy, run through this checklist.

### Naming (Code)

```text
LINGUISTICS NAMING CHECK
========================
[ ] Every function is verb-first with a specific subject (not handle/do/process/get alone in non-UI code)
[ ] Every variable is noun-first with qualifiers for counts, booleans, and financial values
[ ] No unqualified polysemous terms in typed code: provider, shipping, cost, margin, sync, channel, source, status
[ ] Financial values end in Cents (or specify currency in the name) and are stored as integers
[ ] Abbreviations are universally understood or defined in the project glossary
[ ] File names describe what the file does, not which workflow it belongs to
[ ] No utils.ts, helpers.ts, misc.ts — name by domain
```

### Language (UI Copy and Error Messages)

```text
LINGUISTICS COPY CHECK
======================
[ ] Error messages follow What → Why → What to do structure
[ ] No blame-assigning language ("you entered", "you haven't", "your error")
[ ] Specific entity names included when a specific record/connection is involved
[ ] Every error that requires action has a specific next step
[ ] Register matches the audience (end-user: warm + plain; agent: dense + precise; developer: rationale-focused)
[ ] No agent-register terms in end-user copy (canonical, reconciliation, backfill, orchestration)
[ ] Financial terms match the project glossary definitions
```

### Internationalization

```text
LINGUISTICS I18N CHECK
======================
[ ] All code identifiers are in the project's chosen language
[ ] No business concepts from the operator's native language slipping into code abbreviations
[ ] UI copy targets the audience's language and conventions, not the operator's
[ ] Null financial values display as — or "unknown", never as $0.00 (null ≠ zero)
[ ] Currency symbol or code is always present — bare numbers without units are linguistically incomplete
[ ] Implementation details (Intl.NumberFormat, date locale, plural handling) are deferred to project i18n tooling or platform docs
```

---

## Do NOT Use When

| Instead, use | Why |
|---|---|
| `naming-conventions` | Deciding artifact casing or deterministic convention policy such as kebab-case, camelCase, snake_case, boolean prefixes, or env-var casing. Linguistics owns meaning, ambiguity, morphology rationale, and register. |
| `refactor` | Renaming a thing across many call sites or restructuring code without behavior change. Refactor owns the mechanics; linguistics can supply the target wording. |
| `information-architecture` | Choosing docs architecture, navigation, page hierarchy, sitemap shape, or content grouping. IA owns structure; linguistics owns wording inside a structure. |
| `microcopy` | Selecting specialized UI text patterns for buttons, empty states, tooltips, dialogs, or toasts. Microcopy owns the pattern catalog; linguistics verifies ambiguity, register, and blame-free wording. |
| `writing-humanizer` | Polishing prose, removing AI tells, varying rhythm, or making a draft sound less robotic while preserving truth. |
| `code-review` | Judging a specific PR or change for correctness, security, tests, or maintainability. Code review may call this skill for naming/copy findings. |
| A glossary or domain-modeling source | Defining the canonical meaning of a domain term. Linguistics applies definitions consistently in names and copy; it does not establish the domain ontology. |
| Project i18n tooling or locale docs | Implementing `Intl.NumberFormat`, date pickers, ICU plurals, string extraction, bidirectional layout, or locale fallback. Linguistics explains the language risk behind those decisions. |

## Key Sources

### Public Grounding Checked 2026-05-19

- Google Developer Documentation Style Guide: [Active voice](https://developers.google.com/style/voice), [Voice and tone](https://developers.google.com/style/tone), and [Write for a global audience](https://developers.google.com/style/translation). Grounds active/passive actor clarity, conversational but direct developer register, short unambiguous sentences, terminology consistency, and global-audience translation constraints.
- Microsoft Learn: [Writing style for Windows apps](https://learn.microsoft.com/en-us/windows/apps/design/style/writing-style) and [Error Message Guidelines](https://learn.microsoft.com/en-us/windows/win32/debug/error-message-guidelines). Grounds non-blaming error messages, clear next steps, active voice where useful, present-tense state descriptions, and avoiding generic one-size-fits-all errors.
- W3C WCAG 2.2: [Input Assistance](https://www.w3.org/TR/WCAG22/#input-assistance) and related Understandable criteria. Grounds the requirement that detected input errors be identified and described in text, that labels/instructions exist when input is required, and that known correction suggestions be provided when safe.
- Nielsen Norman Group: [10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) and [Hostile Patterns in Error Messages](https://www.nngroup.com/articles/hostile-error-messages/). Grounds user-language matching, consistency of words/actions, plain-language error recovery, avoiding premature error scolding, and reserving disruptive error styling for real errors.

### Classical and Book Grounding

- Saussure, F. de (1916). *Cours de linguistique générale* / *Course in General Linguistics*. Payot. Signifier/signified distinction and meaning by contrast; supports treating identifiers as meaning-bearing contracts.
- Lyons, J. (1977). *Semantics* (2 vols.). Cambridge University Press. Structural semantics, polysemy, synonymy, hyponymy, and systematic analysis of word meaning.
- Cruse, D. A. (1986). *Lexical Semantics*. Cambridge University Press. Word-level meaning relationships and polysemy resolution by qualification.
- Halliday, M. A. K., & Matthiessen, C. M. I. M. (2014). *An Introduction to Functional Grammar* (4th ed.). Routledge. Systemic-functional grammar and register through field, tenor, and mode.
- Grice, H. P. (1975). "Logic and Conversation." In *Syntax and Semantics, Vol. 3: Speech Acts*. Academic Press. Cooperative principle and maxims of quantity, quality, relation, and manner.
- Searle, J. R. (1969). *Speech Acts: An Essay in the Philosophy of Language*. Cambridge University Press. Speech-act theory for distinguishing reporting, instructing, and accusing.
- Austin, J. L. (1962). *How to Do Things with Words*. Oxford University Press. Performative utterances and locutionary/illocutionary/perlocutionary acts.
- Williams, J. M., & Bizup, J. (2017). *Style: Lessons in Clarity and Grace* (12th ed.). Pearson. Cognitive-linguistic clarity principles for technical and public prose.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `knowledge-organization`
- Deployment: `portable`
- Domain: `foundations/language`

**When to use**
- this variable is named provider but it could mean fulfillment, auth, or payment -- what linguistic rule applies?
- rewrite this error message to be specific, blame-free, and actionable
- the word shipping means seller cost in one file and customer charge in another -- how do we resolve the polysemy without a glossary cleanup?
- should this helper file be called utils.ts, helpers.ts, or something domain-specific?
- explain how to phrase the same finance concept for an end-user, an agent, and a developer
- audit this UI copy for register mismatch with the end-user audience
- when is an abbreviation acceptable in a code identifier?
- is this sentence clear for a global developer audience or full of idioms and ambiguous modifiers?

**Not for**
- decide kebab-case vs snake_case vs camelCase for new database columns
- restructure this doc into a tutorial format with progressive disclosure
- implement Intl.NumberFormat for DKK vs USD currency formatting
- give me the canonical definition of reconciliation in our domain
- review this PR for code quality and missing tests
- rename this function and update every call-site across the repo
- rewrite this release note only to remove AI tells and vary sentence rhythm
- Owned by `naming-conventions`: artifact-specific casing, prefix/suffix policy, and deterministic convention choice
- Owned by `refactor`: behavior-preserving rename mechanics across call sites
- Owned by `information-architecture`: docs/navigation/page hierarchy and findability
- Owned by `microcopy`: specialized in-product UI-text patterns such as button, empty-state, tooltip, dialog, and toast structures
- Owned by `writing-humanizer`: prose polish, AI-tell removal, and rhythm repair

**Related skills**
- Verify with: `naming-conventions`, `code-review`, `writing-humanizer`
- Related: `semantics`, `writing-humanizer`, `microcopy`, `prompt-craft`, `intent-recognition`, `code-review`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Linguistics in software is grammar for the interface between people and systems: the syntax of a name or sentence should make the intended meaning easy to recover without hidden context.
- Common misconception: The common mistake is treating naming and wording as personal preference. Ambiguous words, weak compounds, blame-heavy error text, and wrong register create predictable comprehension failures; agreement inside one team does not make the language portable or clear.

**Grounding**
- Mode: `universal`
- Truth sources: `https://developers.google.com/style/voice`, `https://developers.google.com/style/tone`, `https://developers.google.com/style/translation`, `https://learn.microsoft.com/en-us/windows/apps/design/style/writing-style`, `https://learn.microsoft.com/en-us/windows/win32/debug/error-message-guidelines`, `https://www.w3.org/TR/WCAG22/`, `https://www.nngroup.com/articles/ten-usability-heuristics/`, `https://www.nngroup.com/articles/hostile-error-messages/`

**Keywords**
- `linguistic precision`, `software linguistics`, `identifier morphology`, `polysemy resolution`, `polysemy map`, `register selection`, `audience register`, `blame-free error wording`, `what why action error structure`, `compound-word ordering`, `abbreviation policy`, `ambiguous identifier qualification`, `semantic naming`, `global audience language`, `cross-cultural language awareness`, `verb-noun naming rule`, `unqualified polysemous identifier`, `error-message linguistics`

<!-- skill-graph-context:end -->
