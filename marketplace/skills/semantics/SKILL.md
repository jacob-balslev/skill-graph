---
name: semantics
description: "Use when choosing or auditing the meaning encoded by names and signals across code, APIs, design tokens, commits, versions, HTTP responses, UI labels, error codes, branded types, and domain terms, especially when a name feels ambiguous, misleading, or semantically stale. Covers meaning-encoding decisions: naming smells, DDD ubiquitous language, SemVer, Conventional Commits type choice, branded/semantic types, parse-don't-validate, semantic design tokens/CSS/API signals, semantic UI affordances, and anti-patterns where syntax is valid but the signal lies. Do NOT use for word morphology or audience register (use linguistics), casing/format conventions or rename mechanics (use naming-conventions or refactor), typed concept-edge analysis (use semantic-relations), in-product UI-copy patterns (use microcopy), classification structure (use taxonomy-design), accessibility compliance (use a11y), or git history shape (use version-control)."
license: MIT
compatibility: "Cross-domain naming and meaning skill, stack-agnostic. The naming-smells catalogue, SemVer rules, conventional-commit format, semantic-token architecture, HTTP-status semantics, REST/GraphQL conventions, semantic type patterns, and anti-pattern catalog apply to any codebase; examples use generic commerce/order language and should be substituted for the user's domain."
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.2.0"
  subject: knowledge-organization
  deployment_target: portable
  taxonomy_domain: foundations/semantics
  owner: skill-graph-maintainer
  freshness: "2026-05-19"
  drift_check: "{\"last_verified\":\"2026-05-19\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"semantic naming\",\"semantic drift detection\",\"meaning encoding\",\"names as contracts\",\"branded type design\",\"semantic versioning rules\",\"conventional commit type choice\",\"HTTP status semantic signaling\",\"design-token semantic layer\",\"naming smells catalogue\",\"DDD ubiquitous language\",\"semantic affordance naming\",\"semantic UI signal\",\"semantic API contract\",\"parse-dont-validate pattern\",\"three-layer token architecture\",\"semantic-vs-syntactic distinction\",\"cargo-cult naming anti-pattern\",\"status code semantics\",\"semantic design tokens\"]"
  examples: "[\"a function named process(data) actually reconciles revenue with production cost -- what semantic rename would make the operation self-explanatory without reading the implementation?\",\"our API returns HTTP 200 with an error payload for a failed request -- is that syntactically valid but semantically wrong, and what should the response signal be instead?\",\"we named a token --light-blue and now dark mode plus rebranding broke its meaning -- what semantic token pattern should replace it?\",\"a variable called provider could mean payment, fulfillment, or auth in three different modules -- how should semantics resolve that ambiguity?\",\"I need to choose between feat(billing): add email notifications and chore(billing): add email notifications -- which commit type communicates the change correctly?\",\"should this ID be a branded type or a plain string, and what does parse-dont-validate mean for it?\",\"audit this schema for unitless financial columns and timestamp-naming drift\",\"this UI state uses color only to distinguish warning from success -- what semantic signal is missing?\"]"
  anti_examples: "[\"should onboarding be hyphenated, and how does English compound morphology affect that decision?\",\"what casing should a new database timestamp column use -- kebab, snake, or camel?\",\"rename this function and update every call-site across the repo\",\"type the relation between refund and payment as IS-A, PART-OF, causal, or thematic\",\"draft the empty-state copy for a freshly connected storefront with no orders yet\",\"decide whether these entities should live in a strict hierarchy or a faceted taxonomy\",\"audit whether this button has the correct aria-label and focus semantics for screen readers\",\"should we squash or rebase this feature branch before release?\"]"
  relations: "{\"boundary\":[{\"skill\":\"linguistics\",\"reason\":\"linguistics owns word-form rules, polysemy phrasing, morphology, audience register, and blame-free wording; semantics owns what a name or signal communicates about the underlying concept or behavior.\"},{\"skill\":\"naming-conventions\",\"reason\":\"naming-conventions owns casing, prefix/suffix conventions, and rename mechanics per artifact kind; semantics owns whether the chosen words encode the right meaning before any casing rule is applied.\"},{\"skill\":\"semantic-relations\",\"reason\":\"semantic-relations owns typed connections between concepts such as IS-A, PART-OF, causal, and thematic relations; semantics owns the meaning encoded by one identifier, token, status, or signal.\"},{\"skill\":\"microcopy\",\"reason\":\"microcopy owns concrete UI-text patterns such as button labels, empty states, dialogs, validation, and toasts; semantics owns the cross-domain meaning rule those words must preserve.\"},{\"skill\":\"taxonomy-design\",\"reason\":\"taxonomy-design owns classification structures, facets, and category governance; semantics owns the names and signals inside or around that structure.\"},{\"skill\":\"a11y\",\"reason\":\"a11y owns accessibility compliance and assistive-technology behavior; semantics can flag a missing non-color signal but a11y verifies the actual accessibility contract.\"},{\"skill\":\"version-control\",\"reason\":\"version-control owns branch, commit, tag, and release-history shape; semantics owns the meaning encoded by version numbers and conventional-commit type choice.\"}],\"related\":[\"linguistics\",\"naming-conventions\",\"semantic-relations\",\"microcopy\",\"semantic-center\",\"conceptual-modeling\",\"taxonomy-design\"],\"verify_with\":[\"naming-conventions\",\"semantic-relations\",\"a11y\",\"code-review\"]}"
  grounding: "{\"subject_matter\":\"Cross-domain meaning encoding in software names, status signals, versions, commits, APIs, design tokens, UI signals, and semantic types\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://martinfowler.com/bliki/UbiquitousLanguage.html\",\"https://hilton.org.uk/blog/naming-smells\",\"https://semver.org/\",\"https://www.conventionalcommits.org/en/v1.0.0/\",\"https://www.rfc-editor.org/rfc/rfc9110.html\",\"https://www.designtokens.org/tr/drafts/format/\",\"https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html\",\"https://www.typescriptlang.org/docs/handbook/type-compatibility.html\",\"https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/\"],\"failure_modes\":[\"identifier_name_still_matches_syntax_but_not_behavior\",\"domain_language_drift_creates_translation_tax\",\"http_status_code_contradicts_response_body\",\"version_bump_understates_api_breakage\",\"commit_type_hides_feature_or_breaking_change\",\"design_token_name_coupled_to_appearance_instead_of_purpose\",\"primitive_type_allows_id_or_unit_mixups\",\"color_is_the_only_state_signal\",\"concept_block_contains_placeholder_values\",\"semantics_overowns_morphology_relation_typing_or_microcopy_work\"],\"evidence_priority\":\"equal\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":365,\"review_cadence\":\"quarterly\"}"
  mental_model: "Semantics in software is meaning encoding: every name, status code, version number, commit type, token, and typed value is a sign that points at a referent under a convention. Good semantics keeps the sign, referent, and convention aligned as the system changes."
  purpose: "Make meaning a first-class artifact so readers, tools, APIs, and users can infer what something is, why it exists, and what signal it sends without opening implementation details or tribal context."
  boundary: "This skill owns the meaning encoded by one identifier, signal, token, version, status, or type. It does not own word morphology, casing rules, rename mechanics, typed relation analysis between concepts, UI-copy pattern writing, taxonomy governance, accessibility compliance, or git history shape."
  analogy: "Semantics is road signage for software: the sign is not the road, but wrong signage sends people and machines down the wrong path even when the underlying road is structurally sound."
  misconception: "The common mistake is treating naming and signaling as polish. A name that lies, a version number that understates a breaking change, or a 200 response that reports request failure is a behavioral defect because downstream readers and tools act on the signal."
  concept: "{\"definition\":\"Semantics applied to software is the discipline of encoding meaning in names and signals: identifiers, status codes, version numbers, commit types, design tokens, UI signifiers, API resources, and semantic types.\",\"mental_model\":\"Treat every visible name or signal as a contract between a sign, the thing it refers to, and the convention readers use to decode it. Semantic drift happens when the thing changes but the signal does not.\",\"purpose\":\"It reduces translation tax, prevents misleading signals, and makes intent legible to humans, agents, tools, and downstream systems before they inspect implementation details.\",\"boundary\":\"It does not decide casing formats, word morphology, audience register, rename mechanics, relation types between concepts, UI-copy patterns, taxonomy structure, accessibility compliance, or git history shape.\",\"taxonomy\":\"Core surfaces include code names, database names, API names, HTTP status signals, SemVer bumps, Conventional Commit types, design-token layers, semantic UI signifiers, branded or refined types, and anti-patterns such as generic names, stale names, appearance-based names, and syntactically valid but semantically false responses.\",\"analogy\":\"Semantics is like road signage: a sign is small compared with the road, but if it points to the wrong destination, every later decision built on that sign is at risk.\",\"misconception\":\"Good semantics is not taste or clever wording. It is evidence-backed alignment between the words/signals a system exposes and the behavior, domain concept, or compatibility promise those words/signals represent.\"}"
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/knowledge-organization/semantics/SKILL.md
---

# Semantics

## Coverage

Cross-domain semantic thinking for all naming and meaning decisions:

- **Naming in code** — the fundamental what + why principle, naming smells (Peter Hilton's seven categories), DDD ubiquitous language, scalar/count/collection/boolean rules
- **Semantic versioning** — SemVer 2.0.0 (MAJOR.MINOR.PATCH), what counts as breaking, SemVer vs CalVer, pre-release tags
- **Semantic commit messages** — Conventional Commits format, type catalog (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`), breaking-change syntax, the SemVer-from-commits automation chain
- **Semantic CSS** — purpose-not-appearance class names, BEM (`.block__element--modifier`), three-layer design-token architecture (primitive → semantic → component)
- **Semantic data modeling** — column-naming rules (unit suffixes, boolean prefixes, timestamp suffixes), semantic types beyond primitives, branded TypeScript types, parse-don't-validate
- **Semantic UI / UX** — Don Norman affordances and signifiers, semantic color (with the never-color-alone rule), microcopy semantics
- **Semantic APIs** — REST resource naming (nouns + HTTP verbs, plural collections, kebab-case, max-2-nesting), HTTP status codes as semantic signals (the never-200-with-error-body rule), GraphQL naming
- **Universal anti-patterns** — generic names, semantic drift, misleading names, appearance-based names, abbreviation ambiguity, cargo-cult naming

## Philosophy

Every name is a micro-decision that compounds across the codebase. A function called `process(data)` forces every future reader to open the implementation to understand its purpose. A design token called `--light-blue` breaks the moment someone adds dark mode. An API returning HTTP 200 with an error body confuses every consumer. These are not style preferences — they are semantic failures that create real debugging time and real misunderstandings.

This skill exists because naming quality degrades silently. No test catches `handleRefresh()` being reused for too many unrelated actions. No linter flags `--big-spacing`. No CI gate rejects `employee2`. Without explicit semantic rules loaded at decision time, agents default to the first name that compiles rather than the name that communicates. The discipline is to make meaning a first-class artifact, not a residue.

The mental model: a `Sign` (the name) acquires meaning from its `Referent` (what it points to) and from `Convention` (the shared agreement). `Affordance` (what the name implies you can do) is the bridge between sign and user expectation. **Semantic drift** happens when referents change but signs do not — a silent lie in the code, the kind no test catches.

> Semantics is to code what road signage is to driving — the sign isn't the road, but bad signage causes crashes even when the road is fine.

## When to Use

- Choosing semantically truthful names for variables, functions, classes, files, database columns, events, and types.
- Auditing whether a name still matches the behavior, domain concept, unit, or compatibility promise it now represents.
- Designing API resource names, error-code families, HTTP status semantics, or response envelopes.
- Choosing semantic CSS classes, design-token names, or token layers that survive rebrand, dark mode, and component reuse.
- Choosing Conventional Commit type/scope or SemVer bump based on the meaning of a change.
- Modeling domain language with branded/refined types or parse-don't-validate boundaries.
- Reviewing UI labels, colors, affordances, and status indicators for meaning alignment before microcopy or a11y checks.
- Reviewing code for naming quality when the problem is the meaning encoded by a name, not the mechanical rename.

## Boundary Routing

| User need | Use | Why |
|---|---|---|
| Word form, compound order, abbreviation policy, audience register, or blame-free phrasing | linguistics | Linguistics owns language form and register; semantics owns the meaning encoded by a signal. |
| Casing format, prefix/suffix convention, or rename mechanics across call sites | naming-conventions or refactor | Naming conventions and refactor own mechanical consistency; semantics decides whether the words are truthful. |
| Relation type between two concepts | semantic-relations | Semantic-relations owns IS-A, PART-OF, causal, thematic, synonymy, polysemy, and graph-edge typing. |
| Functional UI text pattern | microcopy | Microcopy owns button labels, empty states, dialogs, tooltips, validation, and toast text. |
| Classification structure, facets, or category assignment rules | taxonomy-design | Taxonomy owns the structure; semantics owns the names and signals inside it. |
| Accessibility compliance or assistive-technology behavior | a11y | Semantics can detect a missing non-color signal; a11y verifies the accessible contract. |
| Branching, rebasing, commit boundaries, release tags, or history shape | version-control | Version-control owns repository history; semantics owns version/commit meaning. |

---

## 1. Semantic Naming in Code

### The Fundamental Principle

A name must encode **what** something is, **why** it exists, and what contract it exposes to readers or tools. The reader should not need to open the implementation to distinguish the domain concept, unit, side effect, lifecycle state, or compatibility signal.

### Rules

| Rule | Bad | Good | Why |
|------|-----|------|-----|
| Use full words | `calc()`, `mgr`, `btn` | `calculateProfitAndMargin()`, `manager`, `button` | Abbreviations are ambiguous (`auth` = authentication or authorization?) |
| Encode intent | `data`, `info`, `result` | `unpaidInvoices`, `customerProfile`, `validationErrors` | Generic names carry zero information |
| Use domain language | `UserRequestsProduct` | `customerPlacesOrder` | Match stakeholder vocabulary (DDD ubiquitous language) |
| Name the distinction | `employee`, `employee2` | `manager`, `recentHire` | Numeric suffixes hide the actual difference |
| Scalars need qualifiers | `store = "text"` | `storeName = "text"` | `store` implies an object, not a string |
| Counts need suffixes | `products = 0` | `productCount = 0` | `products` implies a collection |
| Collections use plurals | `orderList` | `orders` | The data structure already implies "list" |
| Booleans read as questions | `active` | `isActive`, `hasOrders`, `canEdit` | Reads naturally in conditionals |

### Naming Smells (Peter Hilton's catalog)

1. **Meaningless** — `foo`, `bar`, `tmp`, `x`
2. **Abstract** — `data`, `object`, `thing`, `item`
3. **Numeric suffixes** — `employee2` hides the distinction
4. **Abbreviations** — `acc` (accumulator? accuracy? account?)
5. **Vague verbs** — `get`, `process`, `handle`, `manage` say nothing about behavior
6. **Type-encoded** — `array`, `string`, `int` as variable names
7. **Weasel suffixes** — `Info`, `Data`, `Manager`, `Helper`, `Utils`, `Base`, `Entity`

### DDD Ubiquitous Language

Core domain classes (entities, value objects, events, services) must use business terminology. Zero tolerance for weasel words. Technical terms are acceptable only in infrastructure classes where no domain equivalent exists.

**Translation tax**: every time a developer mentally translates between code vocabulary and business vocabulary, cognitive overhead accumulates — and it compounds across teams and codebase lifetime.

---

## 2. Semantic Versioning (SemVer 2.0.0)

### Format: `MAJOR.MINOR.PATCH`

| Increment | When | Example |
|-----------|------|---------|
| **MAJOR** | Backward-incompatible API changes | Removing a method, changing return type |
| **MINOR** | New backward-compatible functionality | Adding an endpoint, new optional param |
| **PATCH** | Backward-compatible bug fixes only | Fixing a calculation, patching a security issue |

### What Constitutes a Breaking Change

- Removing a public method, class, endpoint, or field
- Changing return types or parameter types
- Changing default behavior users depend on
- Renaming public APIs without aliases
- Changing serialization format
- **NOT breaking**: adding optional params, new endpoints, new types

### SemVer vs CalVer

| Aspect | SemVer | CalVer |
|--------|--------|--------|
| Encodes | API compatibility intent | Release timeline |
| Best for | Libraries, APIs, packages | OS releases, browsers, enterprise |
| Weakness | Subjective "what's breaking?" | No compatibility signal |

### Pre-release tags

`1.0.0-alpha.1`, `1.0.0-beta.2`, `1.0.0-rc.1`

---

## 3. Semantic Commit Messages (Conventional Commits)

### Format: `type(scope): description`

| Type | Purpose | SemVer Bump |
|------|---------|------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | — |
| `style` | Formatting, no logic change | — |
| `refactor` | Code change, no feature/fix | — |
| `perf` | Performance improvement | PATCH |
| `test` | Adding/fixing tests | — |
| `build` | Build system, dependencies | — |
| `ci` | CI configuration | — |
| `chore` | Maintenance, no source change | — |

**Breaking changes** — add `!` after the type or `BREAKING CHANGE:` in the footer → MAJOR bump.

```
feat(auth)!: replace session tokens with JWT

BREAKING CHANGE: Session-based auth removed. All clients must use Bearer tokens.
```

**Automation chain**: Conventional Commits → semantic-release → changelog → publish. Fully automated versioning from commit messages.

---

## 4. Semantic CSS

### Class Names Describe Purpose, Not Appearance

| Bad (appearance) | Good (purpose) |
|-----------------|----------------|
| `.red-text` | `.error-message` |
| `.left-sidebar` | `.navigation` |
| `.big-button` | `.primary-action` |
| `.mt-4` (alone) | `.card__spacing` (with utility supplement) |

### BEM: `.block__element--modifier`

Names encode component structure. `.card__title` belongs to `.card` without reading HTML.

### Design-Token Naming: Three-Layer Architecture

```css
/* Layer 1: Primitive (raw values, no meaning) */
--blue-500: oklch(0.62 0.18 260);
--spacing-4: 1rem;

/* Layer 2: Semantic (purpose-driven) */
--color-text-primary: var(--grey-900);
--color-bg-danger: var(--red-100);
--spacing-component-gap: var(--spacing-4);

/* Layer 3: Component (scoped to specific component) */
--button-bg-hover: var(--color-bg-interactive-hover);
--card-border-radius: var(--radius-md);
```

**Rule**: UI code references *semantic* tokens. Semantic tokens reference *primitives*. Primitives hold raw values. Never skip a layer.

**Anti-patterns**: `--light-blue` (breaks on rebrand), `--color-1` (meaningless), `--homepage-hero-cta-bg` (too coupled to one location).

---

## 5. Semantic Data Modeling

### Column-Naming Rules

| Rule | Bad | Good |
|------|-----|------|
| Describe what, not where | `external_price` | `retail_price_cents` |
| Include unit | `weight` | `weight_grams` |
| Include precision | `revenue` | `revenue_cents` (integer) |
| Boolean prefix | `active` | `is_active` |
| Timestamp suffix | `created` | `created_at` |

### Semantic Types (Beyond Primitives)

A raw `string` can hold an email, URL, SQL query, or credit-card number — semantically different despite identical type. Semantic types make illegal states unrepresentable:

| Semantic Type | Underlying | Why Distinct |
|--------------|------------|--------------|
| `Money` | `{ amount: number, currency: string }` | Prevents mixing currencies |
| `Email` | validated `string` | Ensures format, enables operations |
| `OrderId` | branded `string` | Prevents passing a `UserId` where `OrderId` expected |
| `Percentage` | `number` (0–100 or 0–1) | Prevents 50 vs 0.5 confusion |

### Branded Types in TypeScript

```typescript
type OrderId = string & { readonly __brand: 'OrderId' };
type UserId  = string & { readonly __brand: 'UserId' };

function getOrder(id: OrderId): Order { /* ... */ }

// Compile error: UserId is not assignable to OrderId
getOrder(userId);
```

### Parse, Don't Validate

Instead of checking data after the fact, parse it into a type that *guarantees* validity:

```typescript
// Bad: validate then trust
function processEmail(input: string) {
  if (!isValidEmail(input)) throw new Error('Invalid email');
  sendEmail(input); // input is still just string
}

// Good: parse into semantic type
function parseEmail(input: string): Email | null {
  return isValidEmail(input) ? (input as Email) : null;
}
```

---

## 6. Semantic UI / UX

### Affordances and Signifiers (Don Norman)

- **Affordance** — what an object allows you to do (a button affords pressing)
- **Signifier** — what communicates the affordance (the button's raised appearance, shadow, cursor change)

Semantic UI ensures signifiers match affordances: clickable things look clickable, draggable things look draggable, disabled things look disabled.

### Semantic Color

| Color | Western Meaning | Risk |
|-------|----------------|------|
| Red | Danger, error, stop, loss | Color-only distinction fails for users with color-vision differences |
| Green | Success, go, profit, safe | See above |
| Yellow / Amber | Warning, caution, pending | Low contrast on white backgrounds |
| Blue | Information, link, trust | Overloaded — can mean anything neutral |
| Grey | Disabled, inactive, secondary | Must have sufficient contrast |

**Rule**: color must never be the *sole* differentiator. Always pair with icon, text, or shape.

### Microcopy Semantics

- **Button labels** — verbs with clear objects: "Save changes" not "Submit"
- **Error messages** — name what broke + how to fix: "Password must be 8+ characters" not "Invalid input"
- **Confirmations** — name what will happen: "Delete 3 orders permanently?" not "Are you sure?"
- **Empty states** — explain value + provide action — not just "No data"

For the full UX-text pattern catalog (button label rules, empty-state structure, tooltip rules, dialog rules, toast rules), use the dedicated `microcopy` skill — semantics owns only the underlying meaning rule.

---

## 7. Semantic APIs

### REST Resource Naming

| Rule | Bad | Good |
|------|-----|------|
| Nouns, not verbs | `/getOrders` | `/orders` |
| Plural for collections | `/order` | `/orders` |
| HTTP method = verb | `POST /createUser` | `POST /users` |
| Kebab-case | `/orderItems` | `/order-items` |
| Max 2 nesting levels | `/a/1/b/2/c/3` | `/orders/123/items` |

### HTTP Status Codes as Semantic Signals

| Family | Semantic Meaning | Responsibility |
|--------|------------------|---------------|
| 2xx | Success | Server fulfilled the request |
| 3xx | Redirect | Client must follow |
| 4xx | Client error | Client's fault |
| 5xx | Server error | Server's fault |

**Do not report a failed HTTP request as 200 merely because the transport succeeded.** RFC 9110 defines 200 as request success; if the request failed, the status code should carry that failure class. Domain-level partial success can still use a typed success payload when the request itself truly succeeded.

### GraphQL Naming

- Types: PascalCase (`Order`, `LineItem`)
- Fields: camelCase (`totalRevenue`, `createdAt`)
- Mutations: verb + noun (`createOrder`, `updateShippingAddress`)
- Enums: SCREAMING_SNAKE (`ORDER_STATUS`, `PAYMENT_METHOD`)

---

## 8. Universal Anti-Patterns

| Anti-Pattern | Domains Affected | Fix |
|--------------|------------------|-----|
| **Generic names** (`data`, `info`, `utils`, `misc`, `helpers`) | Code, files, folders, CSS, API | Replace with domain-specific purpose |
| **Semantic drift** (name no longer matches behavior) | Code, API, DB, tokens | Rename in same commit as behavior change |
| **Misleading names** (`isReady` returns a promise, not a boolean) | Code, API | Name must match return type and behavior |
| **Appearance-based names** (`.red`, `leftColumn`, `bigFont`) | CSS, tokens, components | Name purpose, not presentation |
| **Abbreviation ambiguity** (`auth`, `temp`, `proc`, `val`) | All domains | Use full words; abbreviate only universals (`id`, `url`, `api`) |
| **Cargo-cult naming** (copying patterns without understanding) | All domains | Every name must be justified for *this* context |

---

## Source Notes

- Fowler's Ubiquitous Language article grounds the domain-language rule: terms used by developers and domain experts must be rigorous enough for software because ambiguity turns into design defects.
- Hilton's naming-smells catalog grounds the smell list and the default remediation: rename when a name is meaningless, abstract, numeric-suffixed, abbreviated, vague, type-encoded, or simply wrong.
- SemVer and Conventional Commits ground compatibility signaling: version bumps and commit types communicate machine-readable change meaning, not decoration.
- RFC 9110 grounds HTTP status codes as semantics for request outcome and response meaning.
- The Design Tokens Community Group format grounds tokens as named values with aliases; semantic-token guidance here adds the practical purpose layer on top of that interoperable naming model.
- WCAG Use of Color grounds the non-color signal rule: color cannot be the only way to convey state, action, response, or distinction.
- TypeScript's structural type system and the parse-don't-validate pattern ground semantic/refined type advice: parse once into a value whose type preserves the knowledge the parser gained.

## Verification

After applying this skill, verify:

```text
SEMANTICS CHECK
===============
[ ] Every name encodes what + why (no data/info/temp/misc)
[ ] Domain language matches stakeholder vocabulary
[ ] No abbreviation ambiguity (auth, proc, val, acc)
[ ] Booleans read as questions (is/has/can/should)
[ ] CSS classes describe purpose, not appearance
[ ] Design tokens use the 3-layer architecture (primitive → semantic → component)
[ ] API endpoints use nouns, HTTP methods as verbs
[ ] HTTP status codes match semantic meaning (no 200 with error body)
[ ] Commit messages follow Conventional Commits format
[ ] Color is never the sole status differentiator
[ ] Semantic types prevent illegal states (branded types for IDs)
[ ] Version bumps match SemVer rules (breaking = MAJOR)
[ ] Currency-as-integer columns end in `_cents` (or equivalent unit suffix)
```

## Do NOT Use When

| Instead, use | Why |
|---|---|
| `linguistics` | Word morphology, compound-word ordering, polysemy resolution at the identifier level, audience register, blame-free phrasing. Linguistics owns the form rules; semantics owns the meaning encoding. |
| `naming-conventions` | Deciding casing format, prefix/suffix convention, or rename coordination. Naming-conventions owns the convention and mechanics; semantics owns the meaning encoded under it. |
| `semantic-relations` | Typing the connection *between* two concepts (IS-A, PART-OF, thematic, causal). Semantic-relations owns the relation vocabulary; semantics owns the encoding of one identifier or signal. |
| `microcopy` | The specific UX-text pattern (button labels, empty states, tooltips, dialogs, toasts). Microcopy owns the patterns; semantics owns the cross-domain meaning rule applied to many surfaces. |
| `a11y` | Accessibility-label auditing, focus-state semantics, contrast, screen-reader announcement, or WCAG compliance. Semantics can flag missing non-color meaning; a11y verifies accessibility. |
| `version-control` | Branching, rebasing, commit boundaries, release tags, hotfix flow, or history shape. Semantics owns version and commit meaning; version-control owns repository history. |
| `code-review` | Reviewing a specific PR for correctness, security, or quality across many concerns. Code-review uses semantics as one input; it does not own the meaning rules. |
| (a glossary skill) | Defining the canonical meaning of a domain term. A glossary owns the definition; semantics owns the consistent application of the definition in names and signals. |
| (a taxonomy skill) | Designing the classification structure itself (hierarchy vs facet, IS-A vs PART-OF tree shape). Taxonomy owns the structure; semantics owns the names inside it. |

## Key Sources

- Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley. The canonical statement of *ubiquitous language* — that domain code must use the same terms as domain experts — and the value-object pattern for encoding meaning in types.
- Norman, D. A. (2013). *The Design of Everyday Things* (Revised and Expanded Edition). Basic Books. The foundational affordance / signifier framework; applied directly to the discipline of matching identifier names to actual behavior.
- Hilton, P. (2017). ["Naming Smells."](https://hilton.org.uk/blog/naming-smells) Seven categories of names that destroy readability: meaningless, abstract, numeric-suffix, abbreviation, vague-verb, type-encoded, weasel-suffix. The practitioner reference for naming review.
- Preston-Werner, T. [Semantic Versioning 2.0.0](https://semver.org/). The normative specification for MAJOR.MINOR.PATCH; the convention that makes API-compatibility intent machine-readable across package ecosystems.
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). The specification for `type(scope): description` commit messages; the foundation for automated changelog generation and SemVer-from-commits tooling.
- King, A. (2019). ["Parse, don't validate."](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) The reference statement of the parse-don't-validate pattern; preserve knowledge gained during parsing in a stronger type instead of throwing it away after a boolean check.
- IETF. [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html). The normative specification of HTTP status-code classes, 200 OK, client-error responses, and server-error responses.
- Martin, R. C. (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall. Chapter 2 ("Meaningful Names") is one of the most widely cited practitioner statements of naming discipline.
- Fowler, M. (2006). ["Ubiquitous Language."](https://martinfowler.com/bliki/UbiquitousLanguage.html) The bridge between DDD's ubiquitous-language principle and day-to-day engineering practice.
- Microsoft. [TypeScript Handbook — Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html). Grounds TypeScript structural typing; branded/refined types are a common pattern layered on top when structural compatibility is too permissive for domain identifiers.

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `knowledge-organization`
- Deployment: `portable`
- Domain: `foundations/semantics`

**When to use**
- a function named process(data) actually reconciles revenue with production cost -- what semantic rename would make the operation self-explanatory without reading the implementation?
- our API returns HTTP 200 with an error payload for a failed request -- is that syntactically valid but semantically wrong, and what should the response signal be instead?
- we named a token --light-blue and now dark mode plus rebranding broke its meaning -- what semantic token pattern should replace it?
- a variable called provider could mean payment, fulfillment, or auth in three different modules -- how should semantics resolve that ambiguity?
- I need to choose between feat(billing): add email notifications and chore(billing): add email notifications -- which commit type communicates the change correctly?
- should this ID be a branded type or a plain string, and what does parse-dont-validate mean for it?
- audit this schema for unitless financial columns and timestamp-naming drift
- this UI state uses color only to distinguish warning from success -- what semantic signal is missing?

**Not for**
- should onboarding be hyphenated, and how does English compound morphology affect that decision?
- what casing should a new database timestamp column use -- kebab, snake, or camel?
- rename this function and update every call-site across the repo
- type the relation between refund and payment as IS-A, PART-OF, causal, or thematic
- draft the empty-state copy for a freshly connected storefront with no orders yet
- decide whether these entities should live in a strict hierarchy or a faceted taxonomy
- audit whether this button has the correct aria-label and focus semantics for screen readers
- should we squash or rebase this feature branch before release?
- Owned by `linguistics`: word-form rules, polysemy phrasing, morphology, audience register, and blame-free wording
- Owned by `naming-conventions`: casing, prefix/suffix conventions, and rename mechanics per artifact kind
- Owned by `semantic-relations`: typed connections between concepts such as IS-A, PART-OF, causal, and thematic relations
- Owned by `microcopy`: concrete UI-text patterns such as button labels, empty states, dialogs, validation, and toasts
- Owned by `taxonomy-design`: classification structures, facets, and category governance
- Owned by `a11y`: accessibility compliance and assistive-technology behavior
- Owned by `version-control`: branch, commit, tag, and release-history shape

**Related skills**
- Verify with: `naming-conventions`, `semantic-relations`, `a11y`, `code-review`
- Related: `linguistics`, `naming-conventions`, `semantic-relations`, `microcopy`, `semantic-center`, `conceptual-modeling`, `taxonomy-design`

**Concept**
- Mental model: Semantics in software is meaning encoding: every name, status code, version number, commit type, token, and typed value is a sign that points at a referent under a convention. Good semantics keeps the sign, referent, and convention aligned as the system changes.
- Purpose: Make meaning a first-class artifact so readers, tools, APIs, and users can infer what something is, why it exists, and what signal it sends without opening implementation details or tribal context.
- Boundary: This skill owns the meaning encoded by one identifier, signal, token, version, status, or type. It does not own word morphology, casing rules, rename mechanics, typed relation analysis between concepts, UI-copy pattern writing, taxonomy governance, accessibility compliance, or git history shape.
- Analogy: Semantics is road signage for software: the sign is not the road, but wrong signage sends people and machines down the wrong path even when the underlying road is structurally sound.
- Common misconception: The common mistake is treating naming and signaling as polish. A name that lies, a version number that understates a breaking change, or a 200 response that reports request failure is a behavioral defect because downstream readers and tools act on the signal.

**Grounding**
- Mode: `universal`
- Truth sources: `https://martinfowler.com/bliki/UbiquitousLanguage.html`, `https://hilton.org.uk/blog/naming-smells`, `https://semver.org/`, `https://www.conventionalcommits.org/en/v1.0.0/`, `https://www.rfc-editor.org/rfc/rfc9110.html`, `https://www.designtokens.org/tr/drafts/format/`, `https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html`, `https://www.typescriptlang.org/docs/handbook/type-compatibility.html`, `https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/`

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-19`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth UNVERIFIED, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.2.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `semantic naming`, `semantic drift detection`, `meaning encoding`, `names as contracts`, `branded type design`, `semantic versioning rules`, `conventional commit type choice`, `HTTP status semantic signaling`, `design-token semantic layer`, `naming smells catalogue`, `DDD ubiquitous language`, `semantic affordance naming`, `semantic UI signal`, `semantic API contract`, `parse-dont-validate pattern`, `three-layer token architecture`, `semantic-vs-syntactic distinction`, `cargo-cult naming anti-pattern`, `status code semantics`, `semantic design tokens`
