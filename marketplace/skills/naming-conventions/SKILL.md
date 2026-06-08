---
name: naming-conventions
description: "Use when naming a new file, function, variable, type, route, database column, environment variable, or any other code or system artifact. Covers identifier morphology (verb-noun choice, plural vs singular, prefix/suffix conventions), kebab-case vs camelCase vs snake_case vs PascalCase per artifact kind, abbreviation rules, name-vs-path semantics, the rename-coordination workflow, and detection of names that lie. Do NOT use for content writing (use `documentation`), for restructuring already-named code (use `refactor`), or for human-language copy in product UI (separate skill, not in this library). Do NOT use for refactor this 200-line function into smaller pieces. Do NOT use for write a doc explaining our naming conventions. Do NOT use for review this PR's naming choices. Do NOT use for the variable named `userIsActive` is logging the wrong value. Do NOT use for scaffold a new skill that teaches naming conventions."
license: MIT
compatibility: Language-agnostic
allowed-tools: Read Grep Bash Edit
metadata:
  subject: software-engineering-method
  scope: "Portable naming-decision guidance for files, functions, variables, types, routes, database columns, environment variables, and related code/system artifacts. Teaches truthful identifier morphology, artifact-specific casing, abbreviation discipline, name-vs-path semantics, rename coordination, and detection of names that lie. Excludes prose documentation writing, structural refactoring where naming is incidental, whole-diff code review, debugging a misnamed behavior after failure, and end-user UI copy."
  taxonomy_domain: engineering/naming
  stability: experimental
  keywords: "[\"naming\",\"naming convention\",\"name a file\",\"name a function\",\"name a variable\",\"name a type\",\"rename\",\"identifier\",\"kebab case\",\"camel case\"]"
  examples: "[\"what should I name this util that converts between order shapes?\",\"is `isValidUser` or `validateUser` the right name for this guard?\",\"this function is called `getThing` but it also writes to disk — rename it\",\"kebab-case or snake_case for a new database column?\",\"the type is called `Result` but it's specifically the order-pricing result — rename\",\"should I prefix this hook with `use` or just call it `subscribeOrders`?\",\"we have `User` and `UserAccount` and `AccountUser` — which means what?\",\"rename plan: this column was called `created` but it stores the ship date\"]"
  anti_examples: "[\"refactor this 200-line function into smaller pieces\",\"write a doc explaining our naming conventions\",\"review this PR's naming choices\",\"the variable named `userIsActive` is logging the wrong value\",\"scaffold a new skill that teaches naming conventions\"]"
  relations: "{\"boundary\":[{\"skill\":\"refactor\",\"reason\":\"refactor reshapes existing code structure; naming-conventions decides what an artifact should be CALLED, before or independently of restructuring\"},{\"skill\":\"debugging\",\"reason\":\"debugging chases observed wrong behaviour; naming-conventions catches names that LIE about their meaning before the bug ships\"}],\"related\":[\"refactor\",\"code-review\"],\"verify_with\":[\"code-review\"]}"
  mental_model: "A name is a compact contract. It binds an artifact kind, a casing convention, a grammatical shape, and a behavior promise. Good naming starts by identifying the artifact type, choosing the casing that readers expect for that artifact, selecting words whose verbs and nouns match actual behavior, and then coordinating the rename so every reference carries the same meaning."
  purpose: "Prevents code and system artifacts from lying to future readers. Accurate names reduce debugging time, make APIs and data models easier to scan, and keep refactors honest because the name travels with every call site while comments explaining a bad name usually rot."
  analogy: "Naming is like labeling circuit breakers: a short label is only useful if it truthfully names the circuit it controls."
  misconception: "The wrong mental model is that naming is cosmetic. A misleading name is a behavioral bug in the reader's model: `getOrder()` that returns `undefined`, `validate()` that mutates input, or `created` that stores a ship date will eventually cause wrong assumptions."
  public: "true"
  concept_boundary: "This skill decides what an artifact should be called. It does not restructure code, review a whole diff, write prose documentation about a convention, debug a runtime failure, or choose end-user UI copy. If the work changes structure, use refactor; if the work evaluates all PR risks, use code-review; if the behavior is already broken, use debugging."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-engineering-method/naming-conventions/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

## Concept of the skill

**What it is:** Naming conventions are the rules that make artifact names truthful, predictable, and searchable across code, routes, data, configuration, and documentation-adjacent developer surfaces.

**Mental model:** A name is a compact contract: artifact kind decides casing, grammar decides the role of each word, and verbs/nouns promise behavior. A good name lets the reader infer what the artifact does before opening the implementation.

**Why it exists:** Names are read far more often than they are written. Choosing them deliberately prevents hidden cost: stale domain words, false verb promises, casing inconsistency, and missed references during renames.

**What it is NOT:** It is not whole-code refactoring, whole-diff code review, prose style guidance, product microcopy, or debugging a failed behavior after the name has already misled someone.

**Adjacent concepts:** Semantics, linguistics, refactor, code-review, debugging, version-control, and information architecture.

**One-line analogy:** Naming is like labeling circuit breakers: a short label is useful only when it truthfully names the circuit it controls.

**Common misconception:** Naming is not cosmetic. A misleading identifier creates a wrong model in every caller and reader, even when the code compiles.

# Naming Conventions

## Coverage

- Identifier morphology: verb-noun selection (`get` vs `fetch` vs `load`), plural vs singular for collections, prefix/suffix conventions (`is` / `has` / `should` for booleans, `use` for React hooks)
- Casing per artifact kind: kebab-case (file names, URL paths, CLI flags), camelCase (JavaScript/TypeScript variables and functions), PascalCase (types, classes, components, React JSX), snake_case (Python, SQL columns, environment variables when convention demands), SCREAMING_SNAKE_CASE (constants, env-var keys)
- Abbreviation rules: when an abbreviation is universally known (`url`, `id`, `api`), when it requires expansion (`cust` → `customer`), and when team-internal jargon must be avoided in public-facing names
- Name-vs-path semantics: the difference between *what an artifact is called* and *where it lives*; when name and path agree (file system) vs when they diverge (TypeScript module re-exports, npm-published package paths)
- Rename coordination: how to update every reference in the same commit, when to ship a deprecation alias, and how to detect missed call sites with grep
- Names that lie: identifiers whose words promise a behaviour the code does not deliver, and how to detect them (the function called `getX` that also writes; the boolean called `isReady` that means "should be ready"; the column called `created` that stores the ship date)
- Cross-cutting consistency: when a naming choice in one part of the codebase forces a related choice elsewhere (table column `customer_id` and TypeScript type `Customer.id`)

## Philosophy

Names are the most-read part of any codebase. Every reader pays the cost of a bad name; only the author pays the cost of choosing well. The single most valuable property of a name is *truthfulness*: a name that lies — about what an artifact does, returns, or means — is more harmful than a name that is merely unclear. The second-most-valuable property is *consistency with sibling names*: a function called `getOrders` should sit alongside `getCustomers`, not `loadCustomers`. The third is *brevity*, and only the third — short names that mislead are not a virtue.

When a name does not fit, the answer is almost always to rename, not to add a comment explaining what the name "really" means. Comments rot; renames travel with the code.

## Casing per Artifact Kind

Casing is project-convention-driven for the artifacts where languages don't enforce it, and language-mandated for the rest. Pick the convention once, document it in the project's CONTRIBUTING or AGENTS file, and apply it everywhere.

| Artifact | Convention | Example |
|---|---|---|
| File name (any) | kebab-case | `order-pricing.ts`, `webhook-handler.py` |
| URL path segment | kebab-case | `/api/order-pricing` |
| CLI flag | kebab-case | `--include-template` |
| JS/TS variable, function, parameter | camelCase | `orderTotal`, `calculateMargin()` |
| JS/TS type, class, interface, React component | PascalCase | `Order`, `OrderPricing`, `<OrderRow/>` |
| Python variable, function | snake_case | `order_total`, `calculate_margin` |
| Python class | PascalCase | `Order`, `OrderPricing` |
| SQL table name | snake_case (lowercase) | `orders`, `order_line_items` |
| SQL column name | snake_case | `created_at`, `customer_id` |
| Environment variable | SCREAMING_SNAKE_CASE | `STRIPE_SECRET_KEY`, `NODE_ENV` |
| Constant in code | SCREAMING_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT_MS` |
| Boolean variable / function | `is*` / `has*` / `should*` / `can*` prefix | `isAdmin`, `hasReceipt`, `shouldRetry` |
| React hook | `use*` prefix (mandatory) | `useOrders`, `useDebounce` |
| Predicate function | verb in interrogative form | `validateEmail()`, `isValidEmail()` |

## Identifier Morphology

The verb you pick encodes a contract. Choose deliberately.

| Verb | Implies | Wrong when |
|---|---|---|
| `get` | Pure read; cheap; never mutates; idempotent | The function writes, calls an API, or has any side effect |
| `fetch` | Network or I/O read; may fail; may be slow | The function reads from local memory or never crosses a boundary |
| `load` | Read-and-cache, or read-from-disk; one-shot | The function returns synchronously from already-loaded data |
| `compute` / `calculate` | Pure transformation of inputs | The function takes no inputs or returns I/O |
| `validate` | Returns boolean OR throws; no side effects | The function modifies the input or has hidden side effects |
| `assert` | Throws on failure; void return on success | The function returns a value or has a happy non-throwing path |
| `parse` | String → structured data; may throw on malformed input | The function takes structured data or never throws |
| `format` | Structured data → string | The function returns structured data |
| `create` | Allocates/persists a new entity; returns its identity | The function returns a transient value with no persisted identity |
| `update` | Modifies an existing entity by identity | The function inserts or replaces |
| `delete` / `remove` | Removes an entity from the system | The function only removes from a transient view |

The single most common naming bug is `getX` that also writes. If the function has a side effect, the verb must be one that *implies* side effects (`save`, `apply`, `commit`, `flush`, `record`).

## Names That Lie

A name lies when its words promise behaviour the code does not deliver. Detecting these costs nothing at authoring time and saves real debugging time later.

- **Verb mismatch**: `getThing()` that calls a remote API, `validate()` that throws, `parse()` that returns null on failure (it should throw or be renamed `tryParse`).
- **Boolean polarity inversion**: `isInvalid` set to `true` to mean valid; the codebase will eventually have `if (!isInvalid)` and someone will read it backwards. Use `isValid` and invert the value.
- **Optional collapse**: `getOrder()` that returns `Order | undefined`. The caller has no way to know the function can return undefined without reading the implementation. Either rename to `findOrder()` (convention: "find" allows null return) or change to `getOrderOrThrow()`.
- **Stale meaning after refactor**: a column originally named `created` that, after a migration, now stores the ship date. The name predates the meaning. Rename the column AND all of its callers in the same commit.
- **Domain-language drift**: code says `User` but the domain glossary says `Account`. Pick one in the glossary and rename in code.

## Rename Coordination

Renaming is a small change that touches many places. Do all of them in one commit; ship none of them piecemeal.

1. **Pick the new name** by the rules above.
2. **Find every call site**: `grep -rn "OldName" --include="*.ts" --include="*.tsx" --include="*.md"` (and equivalent for your language). Don't trust IDE rename — it misses dynamic references and string literals.
3. **Update all references** in one diff. The diff stat should show the rename and nothing else. If you find yourself fixing other things along the way, split the commits.
4. **Decide on a deprecation alias** when external consumers may have pinned to the old name. Export both names for one minor version; remove the old name in the next minor.
5. **Run the lint and test suite** to catch dynamic references the grep missed (e.g., reflection, template strings, JSON config).
6. **Update docs** in the same commit. Stale docs are a naming bug.

## Verification

- [ ] The name is *truthful* — every word in the name describes behaviour the code actually delivers
- [ ] The casing matches the artifact-kind convention (file kebab, type PascalCase, env SCREAMING_SNAKE)
- [ ] The verb implies the right cost class (`get` is cheap, `fetch` may fail, `compute` is pure)
- [ ] Boolean prefix is positive polarity (`isValid` not `isInvalid`)
- [ ] Sibling artifacts use the same verb stem (don't mix `getOrders` with `loadCustomers`)
- [ ] No team-internal jargon in public-facing names (file names, route paths, error messages)
- [ ] Rename diffs touch ALL references in one commit, including docs and tests

## Do NOT Use When

| Use instead | When |
|---|---|
| `refactor` | Restructuring already-named code (extract function, inline variable, split file) — naming may change as a side effect of the refactor |
| `documentation` | Writing prose explanation of a naming convention — this skill makes the choice; documentation explains it |
| `code-review` | Evaluating a whole PR — naming is one of many concerns the reviewer covers |
| `debugging` | Investigating why a misnamed identifier produces wrong behaviour — debugging chases the bug; naming-conventions prevents the next one |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-engineering-method`
- Domain: `engineering/naming`
- Scope: Portable naming-decision guidance for files, functions, variables, types, routes, database columns, environment variables, and related code/system artifacts. Teaches truthful identifier morphology, artifact-specific casing, abbreviation discipline, name-vs-path semantics, rename coordination, and detection of names that lie. Excludes prose documentation writing, structural refactoring where naming is incidental, whole-diff code review, debugging a misnamed behavior after failure, and end-user UI copy.

**When to use**
- what should I name this util that converts between order shapes?
- is `isValidUser` or `validateUser` the right name for this guard?
- this function is called `getThing` but it also writes to disk — rename it
- kebab-case or snake_case for a new database column?
- the type is called `Result` but it's specifically the order-pricing result — rename
- should I prefix this hook with `use` or just call it `subscribeOrders`?
- we have `User` and `UserAccount` and `AccountUser` — which means what?
- rename plan: this column was called `created` but it stores the ship date

**Not for**
- refactor this 200-line function into smaller pieces
- write a doc explaining our naming conventions
- review this PR's naming choices
- the variable named `userIsActive` is logging the wrong value
- scaffold a new skill that teaches naming conventions
- Owned by `refactor`
- Owned by `debugging`

**Related skills**
- Verify with: `code-review`
- Related: `refactor`, `code-review`

**Concept**
- Mental model: A name is a compact contract. It binds an artifact kind, a casing convention, a grammatical shape, and a behavior promise. Good naming starts by identifying the artifact type, choosing the casing that readers expect for that artifact, selecting words whose verbs and nouns match actual behavior, and then coordinating the rename so every reference carries the same meaning.
- Purpose: Prevents code and system artifacts from lying to future readers. Accurate names reduce debugging time, make APIs and data models easier to scan, and keep refactors honest because the name travels with every call site while comments explaining a bad name usually rot.
- Analogy: Naming is like labeling circuit breakers: a short label is only useful if it truthfully names the circuit it controls.
- Common misconception: The wrong mental model is that naming is cosmetic. A misleading name is a behavioral bug in the reader's model: `getOrder()` that returns `undefined`, `validate()` that mutates input, or `created` that stores a ship date will eventually cause wrong assumptions.

**Keywords**
- `naming`, `naming convention`, `name a file`, `name a function`, `name a variable`, `name a type`, `rename`, `identifier`, `kebab case`, `camel case`

<!-- skill-graph-context:end -->
