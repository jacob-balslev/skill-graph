---
name: semantics
description: "Use when choosing or auditing meaning encoded by names and signals across code, APIs, design tokens, HTTP responses, UI labels, error codes, branded types, tool schemas, telemetry attributes, and domain terms, especially when a name feels ambiguous, misleading, or stale. Covers naming smells, DDD ubiquitous language, SemVer, Conventional Commits type choice, branded/semantic types, parse-don't-validate, semantic design tokens/CSS/API signals, semantic UI affordances, machine-reader truthfulness for LLM tools and telemetry, and anti-patterns where syntax is valid but the signal lies. Do NOT use for morphology/register (use linguistics), casing/format or rename mechanics (use naming-conventions or refactor), typed concept-edge analysis (use semantic-relations), UI copy (use microcopy), taxonomy (use taxonomy-design), accessibility (use a11y), API/protocol design (use api-design or http-semantics), LLM tool design (use agent-engineering or tool-call-flow), or telemetry strategy (use observability-modeling)."
license: MIT
compatibility: "Cross-domain naming and meaning skill, stack-agnostic. The naming-smells catalogue, SemVer rules, conventional-commit format, semantic-token architecture, HTTP-status semantics, REST/GraphQL conventions, semantic type patterns, machine-reader (tool/telemetry) name rules, and anti-pattern catalog apply to any codebase; examples use generic commerce/order language and should be substituted for the user's domain."
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"semantic-center\",\"conceptual-modeling\",\"linguistics\",\"naming-conventions\",\"semantic-relations\",\"semiotics\",\"microcopy\",\"taxonomy-design\",\"api-design\",\"http-semantics\",\"type-safety\",\"design-system-architecture\",\"theme-system-design\",\"tool-call-flow\",\"system-interface-contracts\",\"observability-modeling\",\"a11y\",\"version-control\"],\"suppresses\":[\"linguistics\",\"semantic-relations\",\"taxonomy-design\"],\"verify_with\":[\"code-review\",\"naming-conventions\",\"semantic-relations\",\"a11y\"]}"
  subject: knowledge-organization
  scope: "Teaches cross-domain meaning alignment for names, statuses, versions, commits, tokens, APIs, UI signals, machine-read tool/telemetry contracts, and semantic types. Excludes word morphology, casing mechanics, typed concept-relation analysis, UI-copy patterns, taxonomy governance, accessibility compliance, full API-surface/protocol design, tool-surface design, telemetry strategy, and git history workflows."
  public: "true"
  taxonomy_domain: foundations/semantics
  stability: experimental
  keywords: "[\"semantic naming\",\"semantic drift detection\",\"meaning encoding\",\"branded type design\",\"semantic versioning rules\",\"conventional commit type choice\",\"HTTP status semantic signaling\",\"design-token semantic layer\",\"naming smells catalogue\",\"parse-dont-validate pattern\"]"
  examples: "[\"a function named process(data) actually reconciles revenue with production cost -- what semantic rename would make the operation self-explanatory without reading the implementation?\",\"our API returns HTTP 200 with an error payload for a failed request -- is that syntactically valid but semantically wrong, and what should the response signal be instead?\",\"we named a token --light-blue and now dark mode plus rebranding broke its meaning -- what semantic token pattern should replace it?\",\"a variable called provider could mean payment, fulfillment, or auth in three different modules -- how should semantics resolve that ambiguity?\",\"I need to choose between feat(billing): add email notifications and chore(billing): add email notifications -- which commit type communicates the change correctly?\",\"should this ID be a branded type or a plain string, and what does parse-dont-validate mean for it?\",\"audit this schema for unitless financial columns and timestamp-naming drift\",\"our MCP tool is named update_record but it can also delete -- is that name a routing hazard for the model?\",\"this UI state uses color only to distinguish warning from success -- what semantic signal is missing?\"]"
  anti_examples: "[\"should onboarding be hyphenated, and how does English compound morphology affect that decision?\",\"what casing should a new database timestamp column use -- kebab, snake, or camel?\",\"rename this function and update every call-site across the repo\",\"type the relation between refund and payment as IS-A, PART-OF, causal, or thematic\",\"draft the empty-state copy for a freshly connected storefront with no orders yet\",\"design the full REST resource surface with pagination, idempotency keys, and auth boundaries for our orders API\",\"decide whether these entities should live in a strict hierarchy or a faceted taxonomy\",\"audit whether this button has the correct aria-label and focus semantics for screen readers\",\"should we squash or rebase this feature branch before release?\"]"
  grounding: "{\"subject_matter\":\"Cross-domain meaning encoding in software names, status signals, versions, commits, APIs, design tokens, UI signals, semantic types, and machine-read tool/schema/telemetry contracts\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://martinfowler.com/bliki/UbiquitousLanguage.html\",\"https://hilton.org.uk/blog/naming-smells\",\"https://semver.org/\",\"https://www.hyrumslaw.com/\",\"https://www.conventionalcommits.org/en/v1.0.0/\",\"https://www.rfc-editor.org/rfc/rfc9110.html\",\"https://www.rfc-editor.org/rfc/rfc9457.html\",\"https://www.designtokens.org/tr/2025.10/format/\",\"https://www.w3.org/TR/css-cascade-5/\",\"https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html\",\"https://www.typescriptlang.org/docs/handbook/type-compatibility.html\",\"https://www.typescriptlang.org/docs/handbook/symbols.html\",\"https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/\",\"https://spec.graphql.org/September2025/\",\"https://graphql.github.io/graphql-over-http/draft/\",\"https://developers.openai.com/api/docs/guides/function-calling\",\"https://modelcontextprotocol.io/specification/draft/server/tools\",\"https://opentelemetry.io/docs/specs/semconv/\",\"https://opentelemetry.io/docs/specs/semconv/general/naming/\",\"https://html.spec.whatwg.org/multipage/dom.html#semantics\"],\"failure_modes\":[\"identifier_name_still_matches_syntax_but_not_behavior\",\"verb_prefix_contradicts_return_shape_or_side_effects\",\"domain_language_drift_creates_translation_tax\",\"http_status_code_contradicts_response_body\",\"version_bump_understates_api_breakage\",\"semver_applied_without_a_declared_public_api\",\"commit_type_hides_feature_or_breaking_change\",\"commit_type_to_semver_mapping_asserted_as_spec_when_it_is_tooling_config\",\"design_token_name_coupled_to_appearance_instead_of_purpose\",\"cascade_layer_name_or_order_lies_about_precedence\",\"non_semantic_html_element_hides_affordance\",\"primitive_type_allows_id_or_unit_mixups\",\"color_is_the_only_state_signal\",\"concept_block_contains_placeholder_values\",\"graphql_enum_value_or_field_rename_breaks_wire_clients\",\"tool_name_or_description_misleads_llm_router\",\"destructive_tool_reads_as_benign\",\"observability_attribute_name_forks_standard_vocabulary\",\"prompt_artifact_section_or_placeholder_misencodes_its_role\",\"semantics_overowns_morphology_relation_typing_microcopy_or_full_api_design\"],\"evidence_priority\":\"equal\"}"
  mental_model: "Semantics in software is meaning encoding: every name, status code, version number, commit type, token, telemetry attribute, tool definition, and typed value is a sign that points at a referent under a convention. Good semantics keeps the sign, referent, and convention aligned as the system changes."
  purpose: "Make meaning a first-class artifact so readers, tools, APIs, models, and users can infer what something is, why it exists, and what signal it sends without opening implementation details or tribal context."
  concept_boundary: "This skill owns the meaning encoded by one identifier, signal, token, version, status, schema field, or type. It does not own word morphology, casing rules, rename mechanics, typed relation analysis between concepts, UI-copy pattern writing, taxonomy governance, accessibility compliance, full API-surface or protocol design, tool-surface design, telemetry strategy, or git history shape."
  analogy: "Semantics is road signage for software: the sign is not the road, but wrong signage sends people and machines down the wrong path even when the underlying road is structurally sound."
  misconception: "The common mistake is treating naming and signaling as polish. A name that lies, a version number that understates a breaking change, or a 200 response that reports request failure is a behavioral defect because downstream readers and tools act on the signal."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/knowledge-organization/semantics/SKILL.md
  skill_graph_export_description: shortened for Agent Skills 1024-character description limit; canonical source keeps the full routing contract
  skill_graph_canonical_description_length: "1244"
---

# Semantics

## Concept of the skill

Semantics in software is meaning encoding: every name, status code, version number, commit type, token, telemetry attribute, tool definition, and typed value is a sign that points at a referent under a convention.

## Coverage

Cross-domain semantic thinking for all naming and meaning decisions:

- **Naming in code** — the fundamental what + why principle, verb-prefix return/side-effect contracts (`get`/`find`/`fetch`/`parse`/`ensure`/`assert`), naming smells (Peter Hilton's seven categories), machine-reader naming smells, DDD ubiquitous language, scalar/count/collection/boolean rules
- **Semantic versioning** — SemVer 2.0.0 (MAJOR.MINOR.PATCH), the declared-public-API precondition, what counts as breaking, the `0.y.z` initial-development rule, deprecation-as-MINOR, precedence, Hyrum's Law, SemVer vs CalVer
- **Semantic commit messages** — Conventional Commits format, type catalog (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`), the spec-vs-tooling SemVer mapping, breaking-change syntax, the SemVer-from-commits automation chain
- **Semantic CSS** — purpose-not-appearance class names, BEM (`.block__element--modifier`), three-layer design-token architecture (primitive → semantic → component), the DTCG stable interchange format (`$value`/`$type`/`$description`/`$deprecated`, `.tokens`), cascade-layer (`@layer`) names and order as an explicit priority signal
- **Semantic data modeling** — column-naming rules (unit suffixes, boolean prefixes, timestamp/instant/date/range distinctions), semantic types beyond primitives, branded TypeScript types (string-tag and `unique symbol`), smart constructors, parse-don't-validate
- **Semantic UI / UX** — Don Norman affordances and signifiers, semantic HTML element choice (`<button>` vs `<div onclick>`, `<time datetime>`, lists), semantic color (with the never-color-alone rule), signifier checks, microcopy semantics
- **Semantic APIs** — REST resource naming (nouns + HTTP verbs, plural collections, kebab-case, max-2-nesting), HTTP status codes as semantic signals (the never-200-with-error-body rule + within-family disambiguation), RFC 9457 Problem Details for machine-readable error payloads, GraphQL naming **and schema semantics** (field/enum/nullability as wire contract, `@deprecated`, `@oneOf`, the media-type-dependent transport-status rule)
- **Semantic tool, telemetry & schema contracts for machine readers** — LLM tool/function names, descriptions as routing prompts, argument enums and units, destructive-operation legibility, result-field contracts, OpenTelemetry observability-attribute conventions, prompt-artifact boundary names, and versioning machine-read artifacts
- **Universal anti-patterns** — generic names, semantic drift, misleading names, appearance-based names, abbreviation ambiguity, cargo-cult naming, machine-reader drift, unit drift, enum reuse

## Philosophy of the skill
Every name is a micro-decision that compounds across the codebase. A function called `process(data)` forces every future reader to open the implementation to understand its purpose. A design token called `--light-blue` breaks the moment someone adds dark mode. An API returning HTTP 200 with an error body confuses every consumer. These are not style preferences — they are semantic failures that create real debugging time and real misunderstandings.

This skill exists because naming quality degrades silently. No test catches `handleRefresh()` being reused for too many unrelated actions. No linter flags `--big-spacing`. No CI gate rejects `employee2`. Without explicit semantic rules loaded at decision time, agents default to the first name that compiles rather than the name that communicates. The discipline is to make meaning a first-class artifact, not a residue.

The audience for names has widened. Names are no longer read only by humans and compilers — LLM-backed routers, agents, and tool-selection layers now read tool names, function names, and field names to decide what to invoke; dashboards and alerts read telemetry attribute names no human wrote at emit time; design-token transformers and GraphQL introspection clients read names as wire contracts. An ambiguous `provider` or a vague `process` degrades automated tool selection the same way it degrades a human reader, so semantic precision is now also a machine-routing concern, not only a readability one. (For the design of the tool/function interface itself, defer to agent-engineering and tool-call-flow; semantics owns only whether the chosen words encode the right meaning.)

The mental model: a `Sign` (the name) acquires meaning from its `Referent` (what it points to) and from `Convention` (the shared agreement). `Affordance` (what the name implies you can do) is the bridge between sign and user expectation. **Semantic drift** happens when referents change but signs do not — a silent lie in the code, the kind no test catches.

> Semantics is to code what road signage is to driving — the sign isn't the road, but bad signage causes crashes even when the road is fine.

## Semantic Audit Workflow (Sign · Referent · Convention)

When auditing any name, status, version, token, schema field, tool, or signal, run the same repeatable check — it operationalizes the mental model and works across every domain in this skill:

1. **Name the Sign.** What is the literal signal? (`process(data)`, `200`, `--light-blue`, `feat:`, `OrderId`, `get_user`, `payment.status`.)
2. **Find the Referent.** What does it actually point at *now*? Read the implementation/behavior, not the name's promise. (Does `process` reconcile revenue? Did the request actually fail? Does the token resolve to a brand color? Can the tool delete?)
3. **Check the Convention.** Under the shared agreement for this artifact kind (SemVer spec, Conventional Commits, RFC 9110, DTCG, OpenTelemetry conventions, DDD ubiquitous language, the local API style), does the Sign correctly encode the Referent?
4. **Predict the inference.** Would a competent reader, client, design tool, router, or LLM infer the actual referent from the sign *without opening implementation details*?
5. **Repair the mismatch.** Fix the Sign, split the Referent, or update the Convention — in the same change as the behavior change so the drift never ships. A comment explaining the lie is not a semantic repair.

A mismatch at step 3/4 is **semantic drift** — the defect to fix.

| Failure | Symptom | Repair |
|---|---|---|
| Referent changed, sign stayed | `handleRefresh()` now syncs, imports, and reconciles | Rename to the current operation or split the behavior |
| Convention changed, sign stayed | `--light-blue` now maps to a dark-theme accent | Move appearance to a primitive token and purpose to a semantic token |
| Sign overclaims certainty | `getOrder()` returns `undefined` | Rename to `findOrder()` or change behavior to `getOrderOrThrow()` |
| Sign hides unit | `revenue` stores integer cents | Rename to `revenue_cents` or wrap in `Money` |
| Sign hides protocol outcome | HTTP 200 with `{ "error": ... }` | Use the correct 4xx/5xx family plus a typed error body |
| Sign hides tool capability | `run` can delete records | Rename to the actual destructive action and make the boundary legible |

## When to Use

- Choosing semantically truthful names for variables, functions, classes, files, database columns, events, and types.
- Auditing whether a name still matches the behavior, domain concept, unit, or compatibility promise it now represents.
- Deciding whether one API name, status code, error code, field, or problem type tells the truth (route whole-surface design to api-design and protocol detail to http-semantics).
- Choosing semantic CSS classes, design-token names, or token layers that survive rebrand, dark mode, and component reuse.
- Choosing Conventional Commit type/scope or SemVer bump based on the meaning of a change.
- Modeling domain language with branded/refined types or parse-don't-validate boundaries.
- Auditing whether an LLM tool/function name, telemetry attribute, or prompt-artifact slot truthfully encodes its referent.
- Reviewing UI labels, colors, affordances, and status indicators for meaning alignment before microcopy or a11y checks.
- Reviewing code for naming quality when the problem is the meaning encoded by a name, not the mechanical rename.

## Boundary Routing

| User need | Use | Why |
|---|---|---|
| Word form, compound order, abbreviation policy, audience register, or blame-free phrasing | linguistics | Linguistics owns language form and register; semantics owns the meaning encoded by a signal. |
| Casing format, prefix/suffix convention, or rename mechanics across call sites | naming-conventions or refactor | Naming conventions and refactor own mechanical consistency; semantics decides whether the words are truthful. |
| Relation type between two concepts | semantic-relations | Semantic-relations owns IS-A, PART-OF, causal, thematic, synonymy, polysemy, and graph-edge typing. |
| Multi-channel visual sign systems (icons, badges, shapes, color metaphors) | semiotics | Semiotics owns visual/sign-system coherence; semantics owns the meaning of one textual identifier or signal. |
| Functional UI text pattern | microcopy | Microcopy owns button labels, empty states, dialogs, tooltips, validation, and toast text. |
| Full API surface: resources, schemas, pagination, idempotency, auth, error-envelope design | api-design | Api-design owns the whole surface; semantics owns whether one name/status/field tells the truth. |
| RFC-level method/status/header/cache protocol detail | http-semantics | Http-semantics owns the protocol contract; semantics owns meaning alignment when a signal contradicts its outcome. |
| Type soundness, narrowing, exhaustiveness, validator choice | type-safety | Type-safety owns the guarantees; semantics owns when a type/brand/unit name encodes the wrong meaning. |
| Telemetry strategy, span/metric/signal selection, dashboards, SLOs | observability-modeling | Observability-modeling owns instrumentation strategy; semantics owns whether one attribute/metric name tells the truth. |
| The LLM tool surface itself (which tools, granularity, statefulness, orchestration) | agent-engineering or tool-call-flow | Those own the interface design; semantics owns whether the chosen tool names/args/fields encode the right meaning. |
| Classification structure, facets, or category assignment rules | taxonomy-design | Taxonomy owns the structure; semantics owns the names and signals inside it. |
| Accessibility compliance or assistive-technology behavior | a11y | Semantics can detect a missing non-color signal or non-semantic element; a11y verifies the accessible contract. |
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

### Verb Prefixes Encode a Return/Side-Effect Contract

A function's leading verb is a promise about its return shape, cost, certainty, and side effects; readers and callers (human and LLM) route on it. Keep the verb honest:

| Prefix / shape | Implied contract | Violated when |
|--------|------------------|---------------|
| `get` / `read` | Cheap, synchronous, always returns the value (or throws if absence is exceptional); no I/O surprise | `getUser()` makes a network call or silently returns `null` |
| `find` / `query` | Lookup where absence is normal; may return nothing (`T | null` / list) | `findOrder()` throws on a missing order instead of returning `null` |
| `fetch` | Async, does I/O, transport can fail | `fetchConfig()` reads an in-memory constant |
| `load` | Reads and initializes or caches | `loadX()` is a pure synchronous accessor |
| `list` | Returns a collection (possibly empty), never a scalar | `listUser()` returns one record |
| `is` / `has` / `can` / `should` | Returns a boolean now, positive polarity, no side effects | `isReady()` returns a promise, mutates state, or is inverted |
| `create` / `update` / `delete` | Mutates; not idempotent for create/delete | `createSession()` returns a cached existing session |
| `ensure` / `upsert` | Idempotent; safe to call repeatedly | `ensureDir()` throws if the dir exists |
| `compute` / `calculate` / `build` | Pure derivation from inputs, no I/O | `calculateTotal()` writes to the database |
| `parse` | Less-structured input → stronger typed output or structured failure | It only returns a boolean and discards the learned structure |
| `validate` | Checks validity, usually boolean or diagnostic result | It mutates input, or returns a stronger type without saying `parse` |
| `assert` | Throws if false; narrows on success | It returns ordinary data or performs business work |

The prefix is the at-a-glance signal; when behavior and prefix disagree, the prefix lies and every caller inherits the wrong expectation. (When the work becomes artifact-specific casing, prefix/suffix policy, or rename mechanics, route to `naming-conventions`.)

### Naming Smells (Peter Hilton's catalog)

1. **Meaningless** — `foo`, `bar`, `tmp`, `x`
2. **Abstract** — `data`, `object`, `thing`, `item`
3. **Numeric suffixes** — `employee2` hides the distinction
4. **Abbreviations** — `acc` (accumulator? accuracy? account?)
5. **Vague verbs** — `get`, `process`, `handle`, `manage` say nothing about behavior
6. **Type-encoded** — `array`, `string`, `int` as variable names
7. **Weasel suffixes** — `Info`, `Data`, `Manager`, `Helper`, `Utils`, `Base`, `Entity`

### Machine-Reader Naming Smells

Names are now read by LLM routers, tool selectors, schema validators, design-token transformers, GraphQL introspection clients, and changelog generators. This adds several smells beyond Hilton's:

| Smell | Example | Why it fails |
|---|---|---|
| Hallucinated specificity | `getUserInvoices()` actually returns all billing documents | Human and model readers infer a narrower referent than the code provides |
| Implementation-step naming | `runStep3()` / `doPipelineThing()` | The name encodes how the code was built, not the domain action |
| Tool affordance mismatch | MCP/OpenAI tool `update_record` can delete records | A model may call a destructive capability under a safe-looking name |
| Generic schema fields | `data`, `result`, `payload`, `status` everywhere | Machine readers cannot distinguish entity, state, and outcome semantics |
| Enum drift | `PENDING` now means queued, blocked, and waiting for payment | A stable wire value has accumulated multiple referents |

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

### SemVer Nuances Agents Often Miss

- **SemVer requires a declared public API.** If the public API is vague, the version number cannot communicate compatibility truthfully — declare the surface before applying the rules.
- **`0.y.z` is initial development (SemVer §4): anything MAY change at any time; the public API is not considered stable.** Do not read a `0.4 → 0.5` bump as a "safe minor" — many ecosystems (npm by default) treat a `0.y.z` MINOR bump as potentially breaking. Version `1.0.0` is what *declares* a stable public API; it is a semantic commitment, not a maturity badge.
- **Deprecating public-API functionality requires a MINOR bump** — deprecation is a forward-compatibility signal even before removal. Removing or renaming public API without an alias is MAJOR.
- **Precedence: a pre-release version has lower precedence than its normal version** (`1.0.0-rc.1 < 1.0.0`), and build metadata (`1.0.0+20130313144700`) is ignored when determining precedence (SemVer §11). A release candidate never accidentally outranks the final release; never use build metadata to signal compatibility.
- **Hyrum's Law caveat:** at sufficient scale, *all* observable behavior of an API becomes something some consumer depends on, even behavior the written contract never promised. A bug-fix that changes observed output can break real consumers — weigh that before calling it a safe PATCH.

### Pre-release tags

`1.0.0-alpha.1`, `1.0.0-beta.2`, `1.0.0-rc.1`

### SemVer vs CalVer

| Aspect | SemVer | CalVer |
|--------|--------|--------|
| Encodes | API compatibility intent | Release timeline |
| Best for | Libraries, APIs, packages | OS releases, browsers, enterprise |
| Weakness | Subjective "what's breaking?" | No compatibility signal |

---

## 3. Semantic Commit Messages (Conventional Commits)

### Format: `type(scope): description`

| Type | Purpose | SemVer Bump |
|------|---------|------------|
| `feat` | New feature | MINOR *(spec-defined)* |
| `fix` | Bug fix | PATCH *(spec-defined)* |
| `docs` | Documentation only | — † |
| `style` | Formatting, no logic change | — † |
| `refactor` | Code change, no feature/fix | — † |
| `perf` | Performance improvement | — † |
| `test` | Adding/fixing tests | — † |
| `build` | Build system, dependencies | — † |
| `ci` | CI configuration | — † |
| `chore` | Maintenance, no source change | — † |

### Spec Meaning vs Release-Tool Policy

**Only three mappings are normative.** Conventional Commits 1.0.0 assigns a SemVer effect to exactly three things: `fix` → PATCH, `feat` → MINOR, and a breaking change (`!` or `BREAKING CHANGE:` footer) → MAJOR. Every other type is **allowed but carries no implicit SemVer effect** unless your release tooling defines one (spec §"Summary" + the SemVer-relationship FAQ). The `† ` rows above therefore depend on local configuration: many tools bump nothing for `perf`/`refactor`/`docs` by default, while some configs map `perf` → PATCH. Do not assert "`perf` is a PATCH bump" as a property of the spec — it is a property of a particular tool's config.

If one change honestly needs multiple types, split the commit whenever possible so the type remains a truthful signal. If it cannot be split, choose the type that communicates the externally observable change, then use the body/footer for secondary facts.

**Breaking changes** — add `!` after the type/scope or a `BREAKING CHANGE:` footer → MAJOR bump. The footer token must be uppercase `BREAKING CHANGE` (or `BREAKING-CHANGE`); a lowercased "breaking change" is not recognized by tooling. `!` and the footer may be used together — the `!` is the at-a-glance signal, the footer carries the migration detail.

```
feat(auth)!: replace session tokens with JWT

BREAKING CHANGE: Session-based auth removed. All clients must use Bearer tokens.
```

**Automation chain**: Conventional Commits → semantic-release → changelog → publish. Fully automated versioning from commit messages. This is the concrete reason the type choice is semantic, not cosmetic: a feature mislabeled `chore` is silently dropped from the changelog and never triggers the MINOR bump it earned.

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

### The DTCG interchange format (stable Final Report, 2025.10)

The three-layer architecture above is the *authoring discipline*; the **Design Tokens Community Group (DTCG) format** is the vendor-neutral *interchange* format that lets that discipline travel between tools (Figma, Style Dictionary, Tokens Studio, etc.). It reached its **first stable version — a Final Community Group Report, 2025.10, on 2025-10-28** (stable, but explicitly *not* a W3C Standard); the skill previously cited a `/drafts/` URL, which is now superseded. Semantic primitives that matter for naming and meaning:

| DTCG concept | Semantic role |
|---|---|
| Token name | Human-readable sign for a design decision |
| `$value` | The value the token resolves to |
| `$type` | Category such as `color`, `dimension`, `duration`, `number`, `fontWeight`, `typography`, `border`, `shadow` — makes the value's *kind* explicit |
| `$description` | Human-readable explanation of intended use |
| Alias / reference (`{group.token}`) | A token can point to another token while keeping its own semantic name — the interchange equivalent of `var(--…)` |
| Group | File organization only; tools should *not* infer a token's type or purpose from its group |
| `$deprecated` | Compatibility signal with optional reason/replacement — token removal or rename is a compatibility event for consumers |

```json
{
  "color": {
    "text-primary": { "$value": "{grey.900}", "$type": "color", "$description": "Default body text" }
  }
}
```

- **Aliasing is what makes appearance-coupled names wrong** — the reference syntax lets one *semantic* token (`--color-bg-danger` / `color.status.danger.bg`) resolve to different *primitive* values under different themes, so a name baked to one appearance (`--light-blue`) cannot follow a theme switch. If `color.status.success.bg` aliases green today and blue tomorrow, the semantic token survives a rebrand because the sign's *purpose* stayed stable.
- **File convention**: `.tokens` / `.tokens.json`, media type `application/design-tokens+json`.
- Treat richer theming and specific color-space support (OKLCH / Display-P3 / CSS Color 4) as the consuming *tool's* capability layered on the format, not as a guarantee the format spec itself makes — verify against the tool you target. For token taxonomy, component APIs, theming governance, and migration, route to `design-system-architecture` / `theme-system-design`; semantics owns only whether the names and aliases preserve intended meaning.

### Cascade Layers (`@layer`) — the layer name and order are a priority signal

CSS cascade layers (CSS Cascade Level 5) let you name groups of rules and declare their precedence explicitly, independent of source order or selector specificity. Both halves are semantic — semantics owns only the meaning of the layer names and the priority signal, **not** selector specificity, `@scope`, or full cascade mechanics (route those to CSS-architecture / frontend skills):

```css
/* The order statement IS the contract: later layers win. */
@layer reset, base, components, utilities;

@layer components { .card { padding: 1rem; } }
@layer utilities  { .p-0  { padding: 0; } }   /* wins over components, despite equal specificity */
```

- **The layer *name* encodes intent** (`reset` / `base` / `theme` / `components` / `utilities`) the same way a semantic token name does — `@layer hacks` or `@layer z1` is the appearance-named `--light-blue` of the cascade: it says nothing about *why* its rules should win.
- **The `@layer name, name, …` statement encodes priority** — reordering it silently changes which rules win across the whole sheet, with no selector change. Treat that order as a published contract; a reorder is a behavioral change, not a cosmetic one.
- **Layer contents must match the layer's promise** — component one-offs accumulating inside a `tokens` layer is layer drift; move the rule to its owning layer.
- Unlayered styles outrank every layer, so "drop it outside a layer to force it to win" is a meaning-defeating escape hatch; an `overrides` layer should be rare and justified — prefer fixing the owning layer or layer order.

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

### Unit and Temporal Naming

Numbers and timestamps are the places where syntax most often lies — a bare type passes every check while the meaning is wrong:

| Data shape | Bad | Good | Meaning preserved |
|---|---|---|---|
| integer money | `price` | `price_cents` | Unit and precision |
| decimal money | `price` | `price_amount` (+ currency) | Representation choice |
| duration | `timeout` | `timeout_ms` | Unit |
| weight | `weight` | `weight_grams` | Unit |
| percentage | `discount` | `discount_percent` or `discount_ratio` | 50 vs 0.5 |
| instant | `created` | `created_at` | Point in time |
| local date | `ship_at` | `ship_date` | Calendar date, not instant |
| range | `period` | `billing_period_start_at` / `billing_period_end_at` | Boundary semantics |

### Semantic Types (Beyond Primitives)

A raw `string` can hold an email, URL, SQL query, or credit-card number — semantically different despite identical type. Semantic types make illegal states unrepresentable:

| Semantic Type | Underlying | Why Distinct |
|--------------|------------|--------------|
| `Money` | `{ amount: number, currency: string }` | Prevents mixing currencies |
| `Email` | validated `string` | Ensures format, enables operations |
| `OrderId` | branded `string` | Prevents passing a `UserId` where `OrderId` expected |
| `Percentage` | `number` (0–100 or 0–1) | Prevents 50 vs 0.5 confusion |

### Branded Types in TypeScript

TypeScript is **structurally** typed: two `string`s are interchangeable no matter what they mean. A *brand* adds a phantom, compile-time-only tag so the type system treats `OrderId` and `UserId` as distinct. Prefer a reusable helper and a parser/constructor boundary; two brand forms, chosen by stakes:

```typescript
// Form A — string-tag brand. Covers most app code; one reusable helper.
type Brand<T, Tag extends string> = T & { readonly __brand: Tag };
type OrderId = Brand<string, 'OrderId'>;
type UserId  = Brand<string, 'UserId'>;

function getOrder(id: OrderId): Order { /* ... */ }
getOrder(userId); // Compile error: UserId is not assignable to OrderId

// Form B — unique symbol brand. For libraries / high-stakes domains:
// the tag cannot be forged or collided with from another module.
declare const OrderIdBrand: unique symbol;
type OrderId2 = string & { readonly [OrderIdBrand]: true };
```

**Smart constructor over raw cast.** A brand only guarantees *distinctness*, not *validity*. Mint branded values through a validating constructor so the cast happens in exactly one audited place — this is the brand's bridge to parse-don't-validate below:

```typescript
function parseOrderId(input: string): OrderId | null {
  return /^ord_[0-9a-f]{16}$/.test(input) ? (input as OrderId) : null;
}
```

Rules:

- Brand only values where mixups are plausible and costly: IDs, units, money, URLs, emails, permission scopes, state-machine states.
- Mint branded values at a parser or smart constructor, not by scattering raw casts at call sites.
- **Gotcha**: the brand is a *compile-time fiction*. The phantom property does not exist at runtime — never write `if (value.__brand === 'OrderId')`; it is always `undefined`. Runtime checks belong in the smart constructor.
- For soundness, narrowing, exhaustiveness, validator choice, and runtime-boundary mechanics, route to `type-safety`; semantics owns only when a type/brand/unit name encodes the wrong meaning.

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

The core idea: **preserve the knowledge the parser gained** in the type, instead of discarding it after a boolean check and re-validating downstream. A `parseEmail` that returns `Email | null` pushes the "is this valid?" question to the boundary once; everything past the boundary holds a value whose type already proves validity.

---

## 6. Semantic UI / UX

### Affordances and Signifiers (Don Norman)

- **Affordance** — what an object allows you to do (a button affords pressing)
- **Signifier** — what communicates the affordance (the button's raised appearance, shadow, cursor change)

Semantic UI ensures signifiers match affordances: clickable things look clickable, draggable things look draggable, disabled things look disabled.

### Semantic HTML — the element choice is the first signal

The HTML element you pick *is* a meaning declaration, read by browsers, assistive tech, and crawlers before any class or label. A `<div onclick>` styled to look like a button is the markup equivalent of `process(data)`: it works mechanically but encodes none of the meaning.

| Meaning | Semantic element | Appearance-only anti-pattern |
|---|---|---|
| "This triggers an action" | `<button type="button">` | `<div onclick>` (no keyboard focus, no role) |
| "This navigates" | `<a href>` | `<span onclick>` routing in JS |
| "This is the primary document content" | `<main>`, `<article>` | `<div class="content">` |
| "This is a named region" | `<nav>`, `<header>`, `<footer>`, `<aside>` | stacked `<div>`s |
| "This is a heading" | `<h1>` / `<h2>` | `<div class="title">` |
| "This emphasizes / is important" | `<em>`, `<strong>` | `<i>`, `<b>` (presentational only) |
| "This is a machine-readable time/date" | `<time datetime="2026-06-06">` | `<span>June 6</span>` |
| "This is a list of peer items" | `<ul>` / `<ol>` with `<li>` | repeated `<div>` siblings |
| "This is tabular data" | `<table>` | grid of `<div>`s |

Rules:

- Choose the element whose native meaning matches the referent *before* adding ARIA or JavaScript behavior.
- Class names should describe the nature of the content or component role, not only the desired presentation.
- Do not derive business meaning from opaque `id` values; use explicit data fields or structured attributes when meaning must be machine-readable.
- **Verifying the resulting accessibility contract — roles, focus order, screen-reader announcement, `aria-*` — belongs to `a11y`.** Semantics flags the `<div>`-that-should-be-a-`<button>`; a11y proves the fix is actually accessible.

### Semantic Color

| Color | Western Meaning | Risk |
|-------|----------------|------|
| Red | Danger, error, stop, loss | Color-only distinction fails for users with color-vision differences |
| Green | Success, go, profit, safe | See above |
| Yellow / Amber | Warning, caution, pending | Low contrast on white backgrounds |
| Blue | Information, link, trust | Overloaded — can mean anything neutral |
| Grey | Disabled, inactive, secondary | Must have sufficient contrast |

**Rule**: color must never be the *sole* differentiator. Always pair with icon, text, or shape. (The color-redundancy rule is a semantic-signal rule that also reaches terminal output, logs, and data viz — not only product UI.)

### Signifier Checks

Semantics can flag when a UI signal lies; semiotics and a11y own the deeper checks:

| Signal | Semantic question | Verify with |
|---|---|---|
| Color | Does the color's judgment match the state, and is color not the only signal? | `semiotics`, `a11y`, `color-system-design` |
| Icon | Does the icon convention point to the intended action/state? | `semiotics` |
| Disabled state | Does it communicate unavailable rather than loading or low priority? | `semiotics`, `a11y` |
| Native element | Does the HTML element match action, navigation, heading, landmark, list, or temporal meaning? | `a11y`, frontend skills |
| Button label | Does the verb/object match the action? | `microcopy` |
| Badge/status | Does the label/color/icon point to one state, not several? | `semiotics`, `a11y` |

### Microcopy Semantics

- **Button labels** — verbs with clear objects: "Save changes" not "Submit"
- **Error messages** — name what broke + how to fix: "Password must be 8+ characters" not "Invalid input"
- **Confirmations** — name what will happen: "Delete 3 orders permanently?" not "Are you sure?"
- **Empty states** — explain value + provide action — not just "No data"

For the full UX-text pattern catalog (button label rules, empty-state structure, tooltip rules, dialog rules, toast rules), use the dedicated `microcopy` skill — semantics owns only the underlying meaning rule.

---

## 7. Semantic APIs

> For the *whole* API surface (resources, schemas, pagination, idempotency, versioning, auth, error-envelope design) use `api-design`; for RFC-level method/status/header/cache detail use `http-semantics`. Semantics owns whether a specific name, status, field, or error signal tells the truth.

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

Choosing *which* code is itself a semantic decision — these distinctions carry meaning consumers act on:

| Code | Signals | Common mis-use it replaces |
|------|---------|----------------------------|
| `201 Created` | A resource was created; include a `Location` header | `200` on a create |
| `202 Accepted` | Accepted for async processing, not yet done | `200` on a queued job |
| `204 No Content` | Success, intentionally empty body | `200` with `{}` |
| `400 Bad Request` | Malformed/unparseable request | catch-all for any client error |
| `401 Unauthorized` | Not authenticated (no/invalid credentials) | `403` when the user simply isn't logged in |
| `403 Forbidden` | Authenticated but not permitted | `401` when the user *is* logged in |
| `404 Not Found` | Resource absent (or hidden for privacy) | `403`/`400` leaking existence; `200` with `null` |
| `409 Conflict` | State conflict (duplicate, version clash) | `400` for a stale-write |
| `412 Precondition Failed` | A conditional request's precondition failed | silently overwriting lost-update protection |
| `415 Unsupported Media Type` | Content type unsupported | generic `400` |
| `422 Unprocessable Content` | Syntactically valid but semantically invalid | `400` for a validation failure |
| `429 Too Many Requests` | Rate limited; pair with `Retry-After` | `503`/`400`/`500` for throttling |
| `503 Service Unavailable` | Temporary server-side unavailability | `500` hiding retryable semantics in the body |

### Machine-readable error bodies — RFC 9457 Problem Details

A correct status code tells the client *which class* of failure occurred; the **body** should tell it *what specifically* went wrong, in a structured, predictable shape — not an ad-hoc `{ "error": "..." }` invented per endpoint. **RFC 9457 *Problem Details for HTTP APIs*** (July 2023, Standards Track; obsoletes RFC 7807) is the vendor-neutral standard for that body. Media type **`application/problem+json`**; the object's reserved members are semantic:

```json
{
  "type": "https://example.com/probs/insufficient-funds",
  "title": "Insufficient funds",
  "status": 402,
  "detail": "Account 12345 has a balance of 30, but the order total is 50.",
  "instance": "/orders/9001"
}
```

- `type` — a URI identifying the *problem class* (stable, dereferenceable, the machine key clients branch on).
- `title` — short human-readable summary of the problem class (does not change per occurrence).
- `status` — the HTTP status code, duplicated in-body so it survives proxies/logging; must match the actual response status when present.
- `detail` / `instance` — explanation and identifier for *this specific* occurrence; `detail` is human-facing and should not be parsed for structured data. Typed extension members carry problem-specific structured data such as validation pointers.

RFC 9457 added (over 7807) explicit guidance for **representing multiple problems** (e.g. several field-validation errors via an `errors` extension) and a shared **registry of problem types**; when different problem types compete, represent the most relevant/urgent one rather than a vague batch envelope. The semantic rule: the status code is the *class signal*, the `type` URI is the *machine-readable specific signal*, and `title`/`detail` are the *human signal* — keep all three aligned, never contradicting.

### GraphQL Naming

- Types: PascalCase (`Order`, `LineItem`)
- Fields: camelCase (`totalRevenue`, `createdAt`)
- Mutations: verb + noun (`createOrder`, `updateShippingAddress`)
- Enums: SCREAMING_SNAKE (`ORDER_STATUS`, `PAYMENT_METHOD`)

### GraphQL Schema Semantics (the names *are* the contract)

In GraphQL the schema is introspectable and there is no URL versioning, so every name is a published wire contract that clients have already baked in. The meaning-encoding rules go beyond casing:

- **Field and argument names are the API.** A client selects `order { totalRevenue }` by exact name; renaming `totalRevenue` → `revenue` is a breaking change for every consumer even though no endpoint moved. There is no path to deprecate via a new route — see `@deprecated` below.
- **Enum values are stable wire vocabulary, not labels.** `PAYMENT_METHOD` values travel literally over the wire and are persisted by clients. Renaming `CREDIT_CARD` → `CARD` silently breaks any client that stored or branches on the old value. Add a new value; never repurpose an existing one (that is semantic drift on a value clients already trust).
- **Deprecate, don't delete: `@deprecated(reason: "…")`.** The directive is the semantic migration signal — it keeps the field introspectable and tells tools/humans what to use instead. A `reason` that just says "deprecated" wastes the one machine-readable channel you have; name the replacement.
- **Nullability is a meaning claim.** `String!` (non-null) promises the field is always present; `String` admits null. Loosening `String!` → `String` is breaking (clients no longer get the guarantee); tightening `String` → `String!` is breaking the other way. The `!` encodes a contract, not a style preference.
- **`@oneOf` input objects** encode "exactly one of these fields" at the type level — a semantic constraint (mutually-exclusive variant) made checkable instead of left to prose. Reach for it when an input is a tagged union, not a bag of optional fields.
- **Field order in the SDL is not semantic** (selection is by name), but stability of it aids diffs — do not rely on order to carry meaning.

> **The transport-status rule for GraphQL depends on the media type — it is NOT "errors always ride a 200."** Under the legacy `application/json` response media type, a well-formed GraphQL response (data and/or `errors`) is returned with `200`, because the HTTP request itself succeeded and the failure lives in the `errors` array of the envelope. Under the newer `application/graphql-response+json` media type (GraphQL-over-HTTP), the server *should* use the HTTP status to reflect the outcome: a **request error** (the request could not even be parsed/validated, so no well-formed GraphQL response can be produced) yields a non-2xx status such as `400`, while a **field/execution error** (a valid request whose resolver failed) still returns `200` with `errors` populated. The correct generalization: the status reflects whether a *well-formed GraphQL response* could be generated, and the `errors` array reflects per-field execution outcomes. This refines — does not contradict — the REST never-200-with-error rule, and is not an excuse for a REST API to report a failed request as 200.

---

## 8. Semantic Tool, Telemetry & Schema Contracts for Machine Readers

The Philosophy section noted that LLM routers, tool-selectors, dashboards, and introspection clients now read names to decide what to invoke or how to join data. This section is the meaning-encoding rules for that audience. (The *design* of the tool surface — which tools to expose, granularity, statefulness, orchestration — belongs to `agent-engineering` / `tool-call-flow`; telemetry strategy belongs to `observability-modeling`. Semantics owns only whether the chosen words and shapes encode the right meaning.)

A function/tool definition (OpenAI function calling, the MCP `tools` contract, an LLM structured-output schema) is read by a model the same way a human reads an identifier: the model has *only* the names, descriptions, and types — it never sees the implementation. Every field is a routing signal, and a misleading one causes the model to call the wrong tool or fill the wrong argument. Strict/typed schemas constrain *shape*; they do not guarantee *semantic truth* — a schema can be valid while `amount` means cents in one tool and dollars in another.

| Surface | Semantic rule | Bad | Good |
|---|---|---|---|
| Tool name | Verb + object + bounded capability | `run`, `cleanup`, `process` | `search_orders`, `create_refund`, `archive_file` |
| Tool description | When/how to use it, *and* the destructive boundary — it is the routing prompt, not documentation | `Updates data` | `Archive an order record. Destructive; permanently removes the row.` |
| Argument name | Domain meaning + unit/format where needed | `id`, `value`, `amount`, bare `timeout` | `order_id`, `amount_cents`, `timeout_ms`, `date: ISO 8601` |
| Argument type | Constrain a closed value space with an enum, not a free string | `status: string` | `status: "active" | "archived"` |
| Enum value | Stable state/action wire vocabulary | `OTHER`, `DONE` | `PAYMENT_FAILED`, `FULFILLMENT_PENDING` |
| Result field | Reader-facing meaning, not implementation shape; never contradict reality | `ok: true` on a partial failure | `validation_errors`, `error_type`, `retry_after_ms` |

The unifying rule: a machine reader acts on the signal with no recourse to implementation or tribal context, so a name or schema field that misleads it is a behavioral defect — identical in kind to a misleading identifier, just with a model instead of a developer as the misled party. **Destructive boundaries must be legible in the contract.** If a tool deletes, charges, sends, or otherwise mutates the world irreversibly, the name and description must say so (`delete_*`, `send_*`, "permanently removes…"). MCP surfaces this as a `destructiveHint` annotation; the semantic rule holds regardless of transport. As with GraphQL enums, renaming or repurposing an enum value the model has learned to emit (or that downstream code persists) is a breaking change, not a cosmetic one.

### Observability attributes are wire vocabulary too (OpenTelemetry Semantic Conventions)

Telemetry attribute names are read by dashboards, alerts, and queries that no human wrote at emit time — so they are a machine-read contract with the same drift hazard as a tool schema. **OpenTelemetry Semantic Conventions** publish a standardized vocabulary (`http.request.method`, `http.response.status_code`, `url.full`, `db.system`, `service.name`, `error.type`, …) precisely so a span from one service joins a query from another without per-team translation.

| Surface | Semantic rule | Bad | Good |
|---|---|---|---|
| Attribute namespace | Use an existing convention, or a collision-resistant custom namespace | `status`, `duration` | `http.response.status_code`, `com.acme.billing.plan_tier` |
| Attribute property | Include the object *and* property, not a vague noun | `owner` | `file.owner.name` |
| Metric name | Name the measured thing; keep instrument semantics truthful | `requests` | `http.server.request.duration` |
| Unit-bearing signal | Encode unit in the metric unit or attribute name where the convention requires | `timeout` | `timeout_ms` (or metric unit `ms`) |
| Custom attribute | Do not squat on OpenTelemetry-reserved namespaces | `otel.order_id` | `com.acme.shop.order.id` |
| Deprecated signal | Deprecate/alias before removal or semantic reuse | reusing `payment.status` for fraud review | new signal, or deprecate old with replacement |

- **Prefer the standardized attribute name over a hand-rolled one.** Emitting `method` or `httpMethod` instead of `http.request.method` forks the vocabulary — every downstream query must special-case your spelling, the cross-service join breaks, and the "translation tax" from §1 reappears at the observability layer.
- **Attribute names are stable wire keys, not labels.** Renaming `http.method` → `http.request.method` (a real OTel stabilization) breaks every saved query and alert keyed on the old name — treat it as breaking, the same as renaming a GraphQL field or a persisted enum value.
- Use dot-delimited namespaces and snake_case name components when authoring OpenTelemetry-style custom attributes; the dotted prefix declares the attribute's domain (`http.` is a transport signal, not a domain status). For span boundaries, signal selection, sampling, dashboards, and SLOs, route to `observability-modeling`.

### Prompt-artifact boundary names

Prompt templates, agent instructions, and eval prompts also expose semantic surfaces: file/module names, section headings, XML/Markdown tags, placeholders, typed input parameters, expected-output labels, rubric field names, and eval IDs. Semantics can audit whether those signs match their actual role:

| Surface | Semantic rule | Bad | Good |
|---|---|---|---|
| Prompt module name | Name the task and output contract | `prompt.ts` | `summarizeRefundRiskPrompt.ts` |
| Section / tag label | Separate instructions, evidence, examples, constraints, and output contract truthfully | `<context>` that actually contains new instructions | `<instructions>` for commands; `<evidence>` for data |
| Placeholder | Encode domain meaning and unit | `{{id}}`, `{{amount}}` | `{{order_id}}`, `{{amount_cents}}` |
| Output label | Match the expected structured result | `result` | `risk_summary`, `validation_errors` |
| Eval case name | State the behavior under test | `test_3` | `rejects_color_only_status_signal` |

Do not import prompt-engineering strategy or a normative "SemVer for prompts" rule here. As prompts and agent configs become deployed artifacts, applying SemVer *semantics* to them is an emerging convention (not a published standard): treat a change to the expected input/output schema or a removed capability as **MAJOR**, an added capability or new optional input as **MINOR**, and a wording/clarity fix that preserves the contract as **PATCH** — but record the actual mapping you use; do not present it as spec-defined. Semantics owns only whether names, sections, variables, and output fields tell the truth.

---

## 9. Universal Anti-Patterns

| Anti-Pattern | Domains Affected | Fix |
|--------------|------------------|-----|
| **Generic names** (`data`, `info`, `utils`, `misc`, `helpers`) | Code, files, folders, CSS, API | Replace with domain-specific purpose |
| **Semantic drift** (name no longer matches behavior) | Code, API, DB, tokens | Rename in same commit as behavior change |
| **Misleading names** (`isReady` returns a promise, not a boolean) | Code, API | Name must match return type and behavior |
| **Appearance-based names** (`.red`, `leftColumn`, `bigFont`) | CSS, tokens, components | Name purpose, not presentation |
| **Abbreviation ambiguity** (`auth`, `temp`, `proc`, `val`) | All domains | Use full words; abbreviate only universals (`id`, `url`, `api`) |
| **Cargo-cult naming** (copying patterns without understanding) | All domains | Every name must be justified for *this* context |
| **Spec drift** (`perf` treated as a spec-defined PATCH bump) | Commits, releases | Separate normative spec (`feat`/`fix`/breaking) from local release-tool policy |
| **Runtime-checked brand** (`if (value.__brand)`) | TypeScript types | Brands are compile-time fictions; validate in the smart constructor, not in consumers |
| **Unit drift** (`timeout` silently changes from seconds to ms) | DB, APIs, config, tools | Add a unit suffix or semantic type; migrate callers |
| **Status/body contradiction** (`200` + error body, `400` + `application/problem+json` saying "success") | API | Align status class, `type` URI, and human title/detail; never let them disagree |
| **Problem-envelope ambiguity** (`errorCode`/`message`/`status` with no stable problem `type`) | HTTP APIs, clients, logs | Use stable RFC 9457 problem identifiers and typed extensions |
| **Vague tool/function name** (`process`, `handle`, `cleanup` as an LLM-callable tool) | LLM tools, MCP, function calling | Name the verb+object; the model routes on the name and description alone |
| **Implicit unit/format in a tool argument** (`timeout`, `amount`, freeform `date`) | LLM tools, structured output | Encode the unit/format (`timeout_ms`, `amount_cents`, `date: ISO 8601`) or use an enum |
| **Benign-looking destructive tool** (a `cleanup`/`update` tool that permanently deletes) | LLM tools, MCP | Make the boundary legible in name + description (`delete_*`, "permanently…"); set `destructiveHint` |
| **Machine-reader drift** (tool/schema/field names still compile but misroute agents) | AI tools, structured outputs, MCP, GraphQL | Rename tool/field/enum or tighten description/schema |
| **Prompt slot drift** (`<context>` or `{{amount}}` silently gains instructions or unit meaning) | Prompt templates, evals, agent commands | Rename the section/variable/output field or split the prompt contract |
| **Mislabeled verb prefix** (`getUser()` does network I/O; `findOrder()` throws instead of returning null) | Code, API, LLM tools | Make the prefix match the contract (`fetch`/`load` for I/O, `find` for nullable, `ensure` for idempotent) |
| **Non-semantic interactive element** (`<div onclick>` styled as a button; `<div>` impersonating a heading/list/time) | HTML, UI | Use the element that encodes the meaning (`<button>`, `<a href>`, `<time>`); leave the accessibility proof to a11y |
| **Appearance/escape-hatch cascade layer** (`@layer hacks`, unlayered rule to force a win, component rules piling into a `tokens` layer) | CSS | Name layers by intent, order them, keep contents matching the promise; fix precedence via layer order |
| **Forked / drifted observability attribute** (`httpMethod` instead of `http.request.method`; `payment.status` reused for fraud review) | Observability, telemetry | Use the standardized OpenTelemetry name; treat a stabilized-name rename or reuse as breaking |
| **Repurposed enum value** (renaming/redefining a GraphQL or tool-schema enum value clients persist) | GraphQL, LLM tools, API, state machines | Add a new value; never change what an existing wire value means |

---

## Source Notes

- Fowler's Ubiquitous Language article grounds the domain-language rule: terms used by developers and domain experts must be rigorous enough for software because ambiguity turns into design defects.
- Hilton's naming-smells catalog grounds the smell list and the default remediation: rename when a name is meaningless, abstract, numeric-suffixed, abbreviated, vague, type-encoded, or simply wrong.
- SemVer and Conventional Commits ground compatibility signaling: version bumps and commit types communicate machine-readable change meaning, not decoration. The `0.y.z` carve-out (§4 of the SemVer spec) grounds the "pre-1.0 promises nothing" rule; the SemVer FAQ + Hyrum's Law ground the warning that observed behavior can become a de facto contract. The Conventional Commits spec grounds the correction that only `feat`/`fix`/breaking carry a spec-defined SemVer effect — other types' bumps are tooling configuration.
- The GraphQL specification grounds GraphQL schema semantics (names/enums/nullability as published contract, `@deprecated`, `@oneOf`); the GraphQL-over-HTTP spec grounds the media-type-dependent transport-status rule (request errors vs field errors). The OpenAI function-calling guide and the MCP tools specification ground the tool/schema-contract section: names, descriptions, argument enums/units, and destructive hints are the signals a model routes on.
- RFC 9110 grounds HTTP status codes as semantics for request outcome and within-family choice; RFC 9457 (obsoleting RFC 7807) grounds the structured, machine-readable error-body shape (`application/problem+json`: `type`/`title`/`status`/`detail`/`instance`, multi-problem representation, problem-type registry) that the status code's class signal points into.
- The Design Tokens Community Group format (stable Final Report 2025.10, not a W3C Standard) grounds tokens as named values with `$value`/`$type`/`$description`/`$deprecated` and `{alias}` references; the format standardizes the token/group/alias/type shape (and explicitly warns tools not to infer type or purpose from group names), and the semantic-token purpose layer is the authoring discipline built on top. Richer theming and color-space support are properties of the consuming tool, not guarantees of the format spec.
- CSS Cascading and Inheritance Level 5 (cascade layers) grounds the `@layer` rule: the layer name encodes rule-group intent and the layer-order statement encodes precedence explicitly, so reordering layers is a behavioral change, not a cosmetic one; selector specificity and `@scope` mechanics stay with CSS-architecture skills.
- The HTML Living Standard's element semantics ground the semantic-HTML rule: the chosen element (`<button>`, `<a>`, `<nav>`, `<main>`, `<time>`, `<ul>`) is itself a meaning declaration read by browsers and assistive tech; semantics flags the wrong element, and `a11y` verifies the resulting accessibility contract.
- OpenTelemetry Semantic Conventions (and the naming rules) ground the observability-attribute rule: standardized, namespaced, snake_case attribute names are a machine-read contract joined across services, so preferring the standard name, avoiding namespace squatting, and treating renames/reuse as breaking is the same wire-vocabulary discipline as GraphQL enums and tool-schema fields.
- WCAG Use of Color grounds the non-color signal rule: color cannot be the only way to convey state, action, response, or distinction.
- TypeScript's structural type system, `unique symbol` identity, and the parse-don't-validate pattern ground semantic/refined type advice: parse once into a value whose type preserves the knowledge the parser gained, and brand it (string-tag for app code, `unique symbol` for libraries) through a smart constructor so distinct domain ids cannot be interchanged.

## Verification

After applying this skill, verify:

```text
SEMANTICS CHECK
===============
[ ] Every name encodes what + why (no data/info/temp/misc)
[ ] Domain language matches stakeholder vocabulary
[ ] No abbreviation ambiguity (auth, proc, val, acc)
[ ] Booleans read as questions (is/has/can/should)
[ ] Verb names match side effects, cost, absence behavior, and return shape (get = cheap/sync; find = may return null; fetch/load = does I/O; parse = returns typed value; ensure = idempotent)
[ ] CSS classes describe purpose, not appearance
[ ] Design tokens use the 3-layer architecture (primitive → semantic → component)
[ ] Tokens shared across tools use the DTCG $value/$type/$description shape with {alias} references and $deprecated intentionally
[ ] Cascade-layer (@layer) names encode intent, the layer-order statement is treated as a precedence contract, and contents match the layer (no unlayered-override escape hatch)
[ ] Interactive UI uses semantic HTML elements (<button>/<a>/<nav>/<main>/<time>/<ul>), not <div onclick>; class names describe content/role, not presentation
[ ] Unit-bearing numbers and temporal fields encode unit/instant/date/range in the name or semantic type
[ ] API endpoints use nouns, HTTP methods as verbs
[ ] HTTP status codes match semantic meaning (no 200 with error body; 401 vs 403, 409 vs 400, 412/415, 422 vs 400, 429, 503 correct)
[ ] Error bodies use a structured shape (RFC 9457 application/problem+json) with status/type/title aligned
[ ] Public API boundary is declared before applying SemVer; pre-1.0 releases are not treated as stable unless project policy says so
[ ] Commit messages follow Conventional Commits format (BREAKING CHANGE footer uppercase); SemVer effect asserted only for feat/fix/breaking, not perf/refactor/etc.
[ ] GraphQL field/enum/nullability/deprecation/@oneOf changes treated as wire-contract changes; HTTP status not applied as if GraphQL were REST
[ ] LLM tool/function names + descriptions encode verb+object and when-to-use; arguments carry units/enums; destructive tools read as destructive
[ ] Observability attributes use standardized OpenTelemetry names (http.request.method, db.system), precise object/property, units, and no reserved-namespace squatting
[ ] Prompt/template section labels, placeholders, eval IDs, and output schema fields truthfully describe their role
[ ] Color is never the sole status differentiator; UI signs (color/icon/badge) verified with semiotics/a11y when the issue exceeds one signal
[ ] Semantic types prevent illegal states (branded types for IDs; minted via smart constructors, never runtime-checked)
[ ] Version bumps match SemVer rules (breaking = MAJOR; deprecation = MINOR; 0.y.z promises no stability)
[ ] Currency-as-integer columns end in `_cents` (or equivalent unit suffix)
```

## Do NOT Use When

| Instead, use | Why |
|---|---|
| `linguistics` | Word morphology, compound-word ordering, polysemy resolution at the identifier level, audience register, blame-free phrasing. Linguistics owns the form rules; semantics owns the meaning encoding. |
| `naming-conventions` | Deciding casing format, prefix/suffix convention, or rename coordination. Naming-conventions owns the convention and mechanics; semantics owns the meaning encoded under it. |
| `semantic-relations` | Typing the connection *between* two concepts (IS-A, PART-OF, thematic, causal). Semantic-relations owns the relation vocabulary; semantics owns the encoding of one identifier or signal. |
| `semiotics` | Multi-channel visual sign systems — icons, badges, shapes, color metaphors, signifier/signified coherence. Semiotics owns the visual sign system; semantics owns the meaning of one textual identifier or signal. |
| `microcopy` | The specific UX-text pattern (button labels, empty states, tooltips, dialogs, toasts). Microcopy owns the patterns; semantics owns the cross-domain meaning rule applied to many surfaces. |
| `api-design` | Designing the whole API surface — resources, request/response schemas, pagination, idempotency, versioning, auth, error-envelope design. Api-design owns the surface; semantics owns whether one name/status/field/problem-type tells the truth. |
| `http-semantics` | RFC-level method/status/header/cache protocol decisions in detail. Http-semantics owns the protocol contract; semantics owns meaning alignment when a signal contradicts its outcome. |
| `type-safety` | Soundness, narrowing, exhaustiveness, validator choice, runtime-boundary mechanics. Type-safety owns the guarantees; semantics owns when a type/brand/unit name encodes the wrong meaning. |
| `observability-modeling` | Telemetry strategy, span/metric/event selection, sampling, dashboards, SLOs, instrumentation boundaries. Observability-modeling owns the strategy; semantics owns whether one attribute/metric name tells the truth. |
| `a11y` | Accessibility-label auditing, focus-state semantics, contrast, screen-reader announcement, or WCAG compliance. Semantics can flag missing non-color meaning or a non-semantic element; a11y verifies accessibility. |
| `version-control` | Branching, rebasing, commit boundaries, release tags, hotfix flow, or history shape. Semantics owns version and commit meaning; version-control owns repository history. |
| `code-review` | Reviewing a specific PR for correctness, security, or quality across many concerns. Code-review uses semantics as one input; it does not own the meaning rules. |
| `agent-engineering` / `tool-call-flow` | Designing the LLM tool surface itself — which tools to expose, granularity, statefulness, orchestration, the declaration/request/execution protocol. Those own the interface and protocol; semantics owns only whether the chosen tool names, descriptions, argument enums, and result fields encode the right meaning for the model that reads them. |
| (a glossary skill) | Defining the canonical meaning of a domain term. A glossary owns the definition; semantics owns the consistent application of the definition in names and signals. |
| (a taxonomy skill) | Designing the classification structure itself (hierarchy vs facet, IS-A vs PART-OF tree shape). Taxonomy owns the structure; semantics owns the names inside it. |

## Key Sources

- Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley. The canonical statement of *ubiquitous language* — that domain code must use the same terms as domain experts — and the value-object pattern for encoding meaning in types.
- Norman, D. A. (2013). *The Design of Everyday Things* (Revised and Expanded Edition). Basic Books. The foundational affordance / signifier framework; applied directly to the discipline of matching identifier names to actual behavior.
- Hilton, P. (2017). ["Naming Smells."](https://hilton.org.uk/blog/naming-smells) Seven categories of names that destroy readability: meaningless, abstract, numeric-suffix, abbreviation, vague-verb, type-encoded, weasel-suffix. The practitioner reference for naming review.
- Preston-Werner, T. [Semantic Versioning 2.0.0](https://semver.org/). The normative specification for MAJOR.MINOR.PATCH, the `0.y.z` initial-development carve-out, deprecation-as-MINOR, and pre-release precedence; the convention that makes API-compatibility intent machine-readable across package ecosystems.
- [Hyrum's Law](https://www.hyrumslaw.com/). With a sufficient number of users, every observable behavior of an interface will be depended on by somebody — the practical caveat that bounds "this change is a safe PATCH" judgments.
- [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/). The specification for `type(scope): description` commit messages; the foundation for automated changelog generation and SemVer-from-commits tooling. Grounds the spec-vs-tooling distinction (only `feat`/`fix`/breaking carry a spec-defined SemVer effect).
- King, A. (2019). ["Parse, don't validate."](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/) The reference statement of the parse-don't-validate pattern; preserve knowledge gained during parsing in a stronger type instead of throwing it away after a boolean check.
- IETF. [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html). The normative specification of HTTP status-code classes, 200 OK, client-error responses, and server-error responses.
- IETF. [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html) (2023, obsoletes RFC 7807). The standard `application/problem+json` error-body shape (`type`/`title`/`status`/`detail`/`instance`), multi-problem representation, and the problem-type registry.
- Design Tokens Community Group. [Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) (first stable Final Community Group Report, 2025-10-28; not a W3C Standard). The vendor-neutral `$value`/`$type`/`$description`/`$deprecated` token interchange format with `{alias}` references and group semantics.
- Martin, R. C. (2008). *Clean Code: A Handbook of Agile Software Craftsmanship*. Prentice Hall. Chapter 2 ("Meaningful Names") is one of the most widely cited practitioner statements of naming discipline.
- Fowler, M. (2006). ["Ubiquitous Language."](https://martinfowler.com/bliki/UbiquitousLanguage.html) The bridge between DDD's ubiquitous-language principle and day-to-day engineering practice.
- Microsoft. [TypeScript Handbook — Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) and [Symbols / `unique symbol`](https://www.typescriptlang.org/docs/handbook/symbols.html). Grounds TypeScript structural typing and unique-symbol identity; branded/refined types (string-tag and `unique symbol`) are common patterns layered on top when structural compatibility is too permissive for domain identifiers.
- [GraphQL Specification (September 2025)](https://spec.graphql.org/September2025/). Grounds GraphQL schema semantics: introspectable names as contract, enum values as wire vocabulary, `@deprecated(reason:)`, nullability (`!`) as a meaning claim, and `@oneOf` input objects for tagged-union inputs.
- [GraphQL over HTTP (draft)](https://graphql.github.io/graphql-over-http/draft/). Grounds the media-type-dependent transport-status rule: `application/json` returns `200` for well-formed responses; `application/graphql-response+json` reflects request errors in the HTTP status while keeping field-execution errors in the `errors` array.
- OpenAI. [Function calling guide](https://developers.openai.com/api/docs/guides/function-calling). Grounds tool/function-definition semantics — names, descriptions, and typed/enum arguments are the signals a model uses to choose and fill a tool.
- Model Context Protocol. [Server Tools specification](https://modelcontextprotocol.io/specification/draft/server/tools). Grounds the MCP tool contract, including the destructive/read-only behavior hints that make a tool's side-effect boundary legible to a model.
- W3C. [CSS Cascading and Inheritance Level 5](https://www.w3.org/TR/css-cascade-5/). Grounds cascade layers (`@layer`): named layers and the explicit layer-order statement express precedence independent of source order and specificity, making the layer name and order a semantic priority contract.
- WHATWG. [HTML Living Standard — The elements of HTML / semantics](https://html.spec.whatwg.org/multipage/dom.html#semantics). Grounds semantic HTML: each element carries a defined meaning and role, so the element choice (`<button>` vs `<div>`, `<time>`, `<ul>`) is itself the first meaning signal — distinct from the accessibility contract that `a11y` verifies.
- OpenTelemetry. [Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/) and the [attribute naming rules](https://opentelemetry.io/docs/specs/semconv/general/naming/). Grounds the observability-attribute vocabulary: standardized, namespaced, snake_case attribute names are a machine-read contract joined across services, so preferring the standard name, avoiding reserved-namespace squatting, and treating renames as breaking is the same wire-vocabulary discipline as GraphQL enums and tool-schema fields.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `knowledge-organization`
- Public: `true`
- Domain: `foundations/semantics`
- Scope: Teaches cross-domain meaning alignment for names, statuses, versions, commits, tokens, APIs, UI signals, machine-read tool/telemetry contracts, and semantic types. Excludes word morphology, casing mechanics, typed concept-relation analysis, UI-copy patterns, taxonomy governance, accessibility compliance, full API-surface/protocol design, tool-surface design, telemetry strategy, and git history workflows.

**When to use**
- a function named process(data) actually reconciles revenue with production cost -- what semantic rename would make the operation self-explanatory without reading the implementation?
- our API returns HTTP 200 with an error payload for a failed request -- is that syntactically valid but semantically wrong, and what should the response signal be instead?
- we named a token --light-blue and now dark mode plus rebranding broke its meaning -- what semantic token pattern should replace it?
- a variable called provider could mean payment, fulfillment, or auth in three different modules -- how should semantics resolve that ambiguity?
- I need to choose between feat(billing): add email notifications and chore(billing): add email notifications -- which commit type communicates the change correctly?
- should this ID be a branded type or a plain string, and what does parse-dont-validate mean for it?
- audit this schema for unitless financial columns and timestamp-naming drift
- our MCP tool is named update_record but it can also delete -- is that name a routing hazard for the model?
- this UI state uses color only to distinguish warning from success -- what semantic signal is missing?

**Not for**
- should onboarding be hyphenated, and how does English compound morphology affect that decision?
- what casing should a new database timestamp column use -- kebab, snake, or camel?
- rename this function and update every call-site across the repo
- type the relation between refund and payment as IS-A, PART-OF, causal, or thematic
- draft the empty-state copy for a freshly connected storefront with no orders yet
- design the full REST resource surface with pagination, idempotency keys, and auth boundaries for our orders API
- decide whether these entities should live in a strict hierarchy or a faceted taxonomy
- audit whether this button has the correct aria-label and focus semantics for screen readers
- should we squash or rebase this feature branch before release?

**Related skills**
- Verify with: `code-review`, `naming-conventions`, `semantic-relations`, `a11y`
- Related: `semantic-center`, `conceptual-modeling`, `linguistics`, `naming-conventions`, `semantic-relations`, `semiotics`, `microcopy`, `taxonomy-design`, `api-design`, `http-semantics`, `type-safety`, `design-system-architecture`, `theme-system-design`, `tool-call-flow`, `system-interface-contracts`, `observability-modeling`, `a11y`, `version-control`

**Concept**
- Mental model: Semantics in software is meaning encoding: every name, status code, version number, commit type, token, telemetry attribute, tool definition, and typed value is a sign that points at a referent under a convention. Good semantics keeps the sign, referent, and convention aligned as the system changes.
- Purpose: Make meaning a first-class artifact so readers, tools, APIs, models, and users can infer what something is, why it exists, and what signal it sends without opening implementation details or tribal context.
- Boundary: This skill owns the meaning encoded by one identifier, signal, token, version, status, schema field, or type. It does not own word morphology, casing rules, rename mechanics, typed relation analysis between concepts, UI-copy pattern writing, taxonomy governance, accessibility compliance, full API-surface or protocol design, tool-surface design, telemetry strategy, or git history shape.
- Analogy: Semantics is road signage for software: the sign is not the road, but wrong signage sends people and machines down the wrong path even when the underlying road is structurally sound.
- Common misconception: The common mistake is treating naming and signaling as polish. A name that lies, a version number that understates a breaking change, or a 200 response that reports request failure is a behavioral defect because downstream readers and tools act on the signal.

**Grounding**
- Mode: `universal`
- Truth sources: `https://martinfowler.com/bliki/UbiquitousLanguage.html`, `https://hilton.org.uk/blog/naming-smells`, `https://semver.org/`, `https://www.hyrumslaw.com/`, `https://www.conventionalcommits.org/en/v1.0.0/`, `https://www.rfc-editor.org/rfc/rfc9110.html`, `https://www.rfc-editor.org/rfc/rfc9457.html`, `https://www.designtokens.org/tr/2025.10/format/`, `https://www.w3.org/TR/css-cascade-5/`, `https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html`, `https://www.typescriptlang.org/docs/handbook/type-compatibility.html`, `https://www.typescriptlang.org/docs/handbook/symbols.html`, `https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/`, `https://spec.graphql.org/September2025/`, `https://graphql.github.io/graphql-over-http/draft/`, `https://developers.openai.com/api/docs/guides/function-calling`, `https://modelcontextprotocol.io/specification/draft/server/tools`, `https://opentelemetry.io/docs/specs/semconv/`, `https://opentelemetry.io/docs/specs/semconv/general/naming/`, `https://html.spec.whatwg.org/multipage/dom.html#semantics`

**Keywords**
- `semantic naming`, `semantic drift detection`, `meaning encoding`, `branded type design`, `semantic versioning rules`, `conventional commit type choice`, `HTTP status semantic signaling`, `design-token semantic layer`, `naming smells catalogue`, `parse-dont-validate pattern`

<!-- skill-graph-context:end -->
