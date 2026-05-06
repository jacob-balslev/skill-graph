---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: semantics
description: "Use when naming any artifact across any domain — function, variable, file, CSS class, design token, database column, API field, HTTP status code, semantic-version bump, conventional-commit type, UI label, error code, or branded TypeScript type — or when a name in code review feels wrong, ambiguous, or misleading. Covers the meaning-encoding rules across naming smells (Peter Hilton catalogue), DDD ubiquitous language, semantic versioning (SemVer 2.0.0), conventional commit messages, branded/nominal types and parse-don't-validate, three-layer design-token architecture (primitive → semantic → component), semantic CSS / BEM, semantic REST and GraphQL APIs, HTTP status codes as semantic signals, semantic UI affordances and color usage, and the universal anti-pattern catalog (generic names, semantic drift, misleading names, appearance-based names, abbreviation ambiguity, cargo-cult naming). Provides the cross-domain meaning-encoding layer — the why behind every naming convention — not the casing format itself, not word-form morphology, and not relation typing between concepts. Do NOT use for word morphology or polysemy resolution at the identifier level (use linguistics), the casing format per artifact kind (use naming-conventions), the typed connection between concepts (use semantic-relations), or specific in-product UI-text patterns (use microcopy)."
version: 1.0.0
type: capability
browse_category: knowledge
category: ai-engineering/language
scope: portable
owner: skill-graph-maintainer
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Cross-domain naming and meaning skill, stack-agnostic. The naming-smells catalogue, SemVer rules, conventional-commit format, three-layer token architecture, HTTP-status semantics, REST/GraphQL conventions, and anti-pattern catalog apply to any codebase; example identifiers use generic e-commerce framings — substitute the equivalents from your domain."
allowed-tools: Read Grep
keywords:
  - semantic naming
  - semantic drift detection
  - branded type design
  - semantic versioning rules
  - conventional commit type choice
  - HTTP status semantic signaling
  - design-token semantic layer
  - naming smells catalogue
  - DDD ubiquitous language
  - affordance signifier match
  - semantic UI signal
  - semantic API contract
  - parse-do-not-validate pattern
  - three-layer token architecture
  - meaning-encoding identifier
  - semantic-vs-syntactic distinction
  - cargo-cult naming anti-pattern
examples:
  - "a function named process(data) actually reconciles revenue with production cost — what semantic rename would make the operation self-explanatory without reading the implementation?"
  - "our API returns HTTP 200 with { success: false, error: 'User not found' } — is that syntactically valid but semantically wrong, and what should the response signal be instead?"
  - "we named a token --light-blue and now dark mode plus rebranding broke its meaning — what semantic token pattern should replace it?"
  - "a variable called provider could mean payment, fulfillment, or auth in three different modules — how should semantics resolve that ambiguity?"
  - "I need to choose between feat(billing): add email notifications and chore(billing): add email notifications — which commit message is semantically correct?"
  - "should this ID be a branded type or a plain string, and what does parse-don't-validate mean for it?"
  - "audit this database schema for unitless financial columns and timestamp-naming drift"
anti_examples:
  - "should onboarding be hyphenated, and how does English compound morphology affect that decision?"
  - "what does margin mean in finance reporting versus CSS layout — give me the canonical definition?"
  - "what casing should a new database timestamp column use — kebab, snake, or camel?"
  - "audit whether this button has the correct aria-label and focus semantics for screen readers"
  - "decide whether these entities should live in a strict hierarchy or a faceted taxonomy"
  - "draft the empty-state copy for a freshly connected storefront with no orders yet"
relations:
  boundary:
    - skill: linguistics
      reason: "linguistics owns word-form rules (morphology, compound-word ordering, abbreviation policy, audience register, blame-free phrasing); semantics owns meaning encoding (what the name communicates, semantic drift, branded types, HTTP-status semantics, SemVer signaling) — the same 'is this name good?' prompt routes by whether the trigger is the form of the word or the meaning the name encodes"
    - skill: naming-conventions
      reason: "naming-conventions owns the deterministic casing/format choice per artifact kind (kebab vs camel vs snake vs Pascal); semantics owns the meaning encoding behind the name — the same 'what should I call this?' prompt routes by whether the user wants the format rule or the meaning-encoding decision"
    - skill: semantic-relations
      reason: "semantic-relations owns the typed-connection vocabulary between concepts (IS-A, PART-OF, thematic roles); semantics owns the meaning encoding for an individual identifier or signal — the same 'what does this mean?' prompt routes by whether the trigger is the relation between things or the encoding of one thing"
    - skill: microcopy
      reason: "microcopy owns specific in-product UI-text patterns (button labels, empty states, tooltips, dialogs, toasts); semantics owns the underlying meaning-encoding rules that apply to any name or signal — the same 'rewrite this UI text' prompt routes by whether the trigger is the UX-pattern surface or the cross-domain meaning rule"
  related:
    - linguistics
    - semantic-relations
    - microcopy
  verify_with:
    - a11y
    - code-review
portability:
  readiness: scripted
  targets:
    - agent-skills
lifecycle:
  stale_after_days: 365
  review_cadence: quarterly
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

- Naming variables, functions, classes, files, or database columns
- Designing API endpoints, error codes, or status systems
- Choosing CSS class names or design-token names
- Writing commit messages or versioning releases
- Designing UI labels, error messages, or microcopy quality bars
- Modeling data with domain language and branded types
- Reviewing code for naming quality

---

## 1. Semantic Naming in Code

### The Fundamental Principle

A name must encode **what** something is and **why** it exists. The reader should never need to read the implementation to understand the purpose.

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
| Red | Danger, error, stop, loss | Green/red pair fails for ~8% of males (deuteranopia) |
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

**Never return HTTP 200 with an error body.** The status code IS the semantic signal.

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
| `naming-conventions` | Deciding the casing format for an artifact kind (kebab vs camel vs snake vs Pascal). Naming-conventions owns the convention; semantics owns the meaning encoding under it. |
| `semantic-relations` | Typing the connection *between* two concepts (IS-A, PART-OF, thematic, causal). Semantic-relations owns the relation vocabulary; semantics owns the encoding of one identifier or signal. |
| `microcopy` | The specific UX-text pattern (button labels, empty states, tooltips, dialogs, toasts). Microcopy owns the patterns; semantics owns the cross-domain meaning rule applied to many surfaces. |
| `a11y` | Accessibility-label auditing (aria-label correctness, focus-state semantics, screen-reader announcement). A11y owns accessibility contracts; semantics owns naming-quality contracts. |
| `code-review` | Reviewing a specific PR for correctness, security, or quality across many concerns. Code-review uses semantics as one input; it does not own the meaning rules. |
| (a glossary skill) | Defining the canonical meaning of a domain term. A glossary owns the definition; semantics owns the consistent application of the definition in names and signals. |
| (a taxonomy skill) | Designing the classification structure itself (hierarchy vs facet, IS-A vs PART-OF tree shape). Taxonomy owns the structure; semantics owns the names inside it. |
