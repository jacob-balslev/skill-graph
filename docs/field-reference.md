# Skill Graph Field Reference

> One section per authored field. Use this when writing or reviewing a `SKILL.md` file.
> For the "which value do I pick?" decisions, see [`docs/field-decision-guide.md`](field-decision-guide.md).
> For field groups, conditional requiredness, and schema strictness rules, see [`docs/metadata-contract.md`](metadata-contract.md).

Fields are listed in authored order — the same order they appear in [`examples/skill-template.md`](../examples/skill-template.md).

## Three docs, three genres

The field reference is split across three coordinated documents. Use whichever fits your task:

| Doc | Genre | When to read |
|---|---|---|
| [`field-reference.md`](field-reference.md) (this doc) | **Hand-curated prose reference.** Field-by-field, with worked examples, lint notes, and cross-cutting guidance. | When authoring or reviewing a SKILL.md and you want examples and "when to use" rules alongside the schema-canonical definition. |
| [`field-reference.generated.md`](field-reference.generated.md) | **Auto-generated index.** Built from `schemas/skill.v3.schema.json` description strings by `scripts/build-field-reference.js`. Drift-free against the schema. | When you want the machine-guaranteed list of every field, every type, every pattern, every enum value. The fastest way to verify what the schema actually accepts today. |
| [`field-rationale.md`](field-rationale.md) | **Hand-authored "why this field" rationale.** Covers the ~10 fields whose meaning is non-obvious from the schema description (`scope`, `eval_artifacts`, `eval_state`, `routing_eval`, `relations.depends_on`, `relations.verify_with`, `relations.broader`, `grounding.evidence_priority`, `lifecycle.review_cadence`, `portability.readiness`). | When you understand *what* a field stores but want to know *why the field exists at all* and *what the common confusion looks like*. |

The schema is the single source of truth for shape; this doc is the source of truth for prose; `field-rationale.md` is the source of truth for design intent. Lint check C7 (in `scripts/check-contract-consistency.js`) verifies the generated index stays in sync with the schema description strings — running `node scripts/build-field-reference.js --check` against the live schema must succeed before commit.

---

## `schema_version`

**Purpose.** Versions the contract so migration tooling can handle future schema changes deterministically.

**Rules.**
- Must be the integer `3` or the string `"3"` for all v3 skills.
- Start every new skill at the current schema version. Do not downgrade.
- The v2 → v3 bump introduced `drift_check` as an object (was a date string), `compatibility` as an object (was a free-text string), renamed `family` → `browse_category`, and added optional `category`, `project_tags`, `lifecycle`, and `runtime_telemetry`. Run `node scripts/migrate-skill-v2-to-v3.js` for a one-shot migration. See `docs/manifest-contract.md § Migration Note — v2 → v3` for the full map.
- The v1 → v2 bump (SH-5784) changed the `scope` enum (`generic`→`portable`, `operational`→`codebase`), split `eval_status` into three orthogonal fields, renamed `portability.level`→`readiness` and `portability.exports`→`targets`, and renamed `route_groups`→`routing_groups`. See `docs/manifest-contract.md § Migration Note — v1 → v2` for the historical map.

**Versioning semantics (policy).** The integer signals *breaking vs non-breaking* evolution. A minor/patch axis is intentionally not surfaced on this field — the schema's own additive changes (new optional fields, new enum values, new lint warnings) do not require consumers to migrate, so no version bump is emitted. If a future release needs finer-grained version signalling (e.g. "v3.1 adds the SKOS-aligned predicates"), the canonical location is `CHANGELOG.md`, not a schema bump. v4 is the breaking-change horizon — `urn` becomes required, `adjacent` / `boundary` are removed in favour of `related` / `disjoint_with`, and the freshness fields may consolidate (ADR 0001, ADR 0004).

**Example.**
```yaml
schema_version: 3
```

**When to use.** Always — this is a required field.

**When NOT to use.** N/A — required.

---

## `urn`

**Purpose.** Globally-unique persistent identifier for the skill. Unlocks FAIR Findability (Wilkinson et al. 2016) across repos and federated registries. `name` is the display-layer handle; `urn` is the stable identity consumers should cite. See ADR 0004 for the full rationale.

**Rules.**
- Optional in v3; target-required in v4.
- Format: `urn:skill:<repo-slug>:<skill-name>`.
- `<repo-slug>` is the publishing repo's canonical short handle — lowercase, hyphen-separated, `[a-z0-9-]+` (e.g. `skill-graph`, `development`, `sales-hub`).
- `<skill-name>` MUST equal the `name` field exactly.
- Must be globally unique across all federated repos — the URN is the primary key a registry uses to resolve skills.
- Pattern: `^urn:skill:[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-/:]*$`.

**Example.**
```yaml
name: knowledge-graph
urn: urn:skill:skill-graph:knowledge-graph
```

**When to use.** Populate on every new skill and on every skill edited after 2026-04-20. Required when the skill is published to a federated registry. Recommended universally because it is cheap to add and free to have.

**When NOT to use.** Skills that are strictly internal and will never leave the authoring repo MAY omit the field in v3. They cannot omit it in v4.

**JSON-LD mapping.** `urn` maps to `@id` in `schemas/skill.context.jsonld`. When the skill is projected to RDF, the URN becomes the subject of every triple derived from the skill's frontmatter.

**References.** RFC 8141 (URN Syntax), ADR 0004.

---

## `name`

**Purpose.** Stable skill identifier used for routing, `relations.*` targets, and filesystem layout. This is the handle other skills point at in their `relations` blocks.

**Rules.**
- Must match `^[a-z0-9][a-z0-9-/:]*$` — lowercase alphanumerics, hyphens, forward slashes, and colons only.
- Must start with a letter or digit.
- Should match the parent directory name so Agent-Skills export can use the directory as the canonical identifier.
- Forward slashes (`/`) and colons (`:`) are allowed in Skill Graph names but are normalized to hyphens during Agent-Skills export.

**Example.**
```yaml
name: shopify
```

**When to use.** Always — required.

**When NOT to use.** N/A — required.

---

## `description`

**Purpose.** The routing contract. Tells a router whether this skill should activate for a given query or label. It is pushy, specific, and boundary-aware.

**Rules.**
- Minimum 20 characters.
- Maximum 3 sentences.
- Lead with trigger phrases ("Use when…", "Activates for…") rather than generic summaries.
- Include an explicit negative boundary ("Do NOT use for…") so the router doesn't over-activate.
- Do not repeat the `## Coverage` section body here — that belongs inside the skill body, not in the routing contract.

**Example.**
```yaml
description: >
  Shopify integration skill for API, webhook, and sync work. Use when the
  task involves Shopify orders, products, webhooks, or the Shopify Admin API.
  Do NOT use for general e-commerce patterns not tied to Shopify.
```

**When to use.** Always — required.

**When NOT to use.** Do not expand beyond 3 sentences or copy-paste the `## Coverage` scope list here. The description and `## Coverage` are sibling layers of progressive disclosure, not duplicates.

**Lint check.** `scripts/skill-lint.js` warns when the description text appears verbatim inside the `## Coverage` section body — a signal that the two layers have collapsed. See `scripts/lint/check-routing-quality.js` (check R2).

---

## `version`

**Purpose.** Tracks the semantic version of the skill content itself, independent of the schema version. Enables change tracking, relation resolution, and diff-based audit.

**Rules.**
- Must be a semver string matching `^[0-9]+\.[0-9]+\.[0-9]+$`.
- Start new skills at `1.0.0`.
- Increment the patch version for small corrections (examples, wording, typos).
- Increment the minor version when new sections or fields are added without breaking the existing shape.
- Increment the major version when content is reorganized or an archetype changes.

**Example.**
```yaml
version: 1.0.0
```

**When to use.** Always — required.

**When NOT to use.** N/A — required.

---

## `type`

**Purpose.** Defines the behavioral archetype. The archetype determines which body H2 sections are required, how the skill is loaded by a router, and which schema conditionals apply.

**Allowed values.**

| Value | Meaning |
|---|---|
| `capability` | A standalone functional skill — what the agent can do. Required sections: `## Coverage`, `## Philosophy`, `## Verification`, `## Do NOT Use When`. |
| `workflow` | A step-by-step procedural skill. Adds `## Workflow` to the required sections. |
| `router` | A skill that dispatches to other skills. Uses `## Routing Rules` instead of `## Workflow`. |
| `overlay` | A skill that extends another skill. Requires `extends` and uses `## Overlay Rules` and `## Extends`. |

**Rules.**
- Keep `type` restricted to these four values.
- Use `browse_category` (flat bucket) or `category` (hierarchical path) for browse taxonomy, not `type`.
- `overlay` type always requires the `extends` field.

**Example.**
```yaml
type: capability
```

**When to use.** Always — required.

**When NOT to use.** Do not invent new type values. If none of the four archetypes fit, use `capability` as the closest and note the variation in the `## Coverage` section.

**Lint check.** `scripts/skill-lint.js` enforces the archetype section map: missing required H2 sections produce an error; H2 sections present but containing fewer than 50 non-whitespace characters produce a warning. See `scripts/lint/check-archetype-sections.js`.

---

## `browse_category`

**Purpose.** Flat human browse bucket for discovery and grouping. Does not imply runtime behavior or evaluation logic. Renamed from v2 `family` in v3 — the old name invited misuse as a routing signal, so the v3 name makes the intent (browse, not behavior) explicit.

**Rules.**
- Open-ended string — no enum is enforced.
- Use stable, human-readable buckets.
- Avoid one-off synonyms for the same idea (e.g., pick `engineering` and stick to it; don't use `dev` in one skill and `engineering` in another).
- A future release may adopt a controlled vocabulary; until then, choose consistently within a skill library.
- For hierarchical taxonomy (`ecommerce/integrations/shopify`), use the separate optional `category` field. `browse_category` is flat on purpose.

**Recommended values.**

| Value | Use for |
|---|---|
| `knowledge` | Domain expertise, reference skills |
| `engineering` | Code, architecture, infrastructure |
| `frontend` | UI, CSS, component patterns |
| `quality` | Testing, auditing, review |
| `integration` | External APIs, webhooks, data sync |
| `meta` | Skills about the skill system itself |

**Example.**
```yaml
browse_category: integration
```

**When to use.** Always — required. Even if the bucket is unusual, populate it so the skill appears in browse indexes.

**When NOT to use.** Do not use `browse_category` for behavioral control — that is `type`'s job. Do not use it for routing group membership — that is `routing_groups`. Do not use it for hierarchical placement — that is `category`.

**Migration from v2.** The field name changed from `family` to `browse_category` in v3 (values unchanged). The v2 name is rejected as an unknown field under the v3 schema via `additionalProperties: false`. Run `node scripts/migrate-skill-v2-to-v3.js` for an automatic rename.

---

## `category`

**Purpose.** Hierarchical browse path as slash-delimited segments. Complements `browse_category`: flat bucket vs. tree path answer different questions. A UI or docs site uses `category` to render a folder tree; a filter UI uses `browse_category` for quick grouping.

**Rules.**
- Optional.
- Lowercase alphanumeric segments separated by `/` (e.g., `ecommerce/integrations/shopify`).
- Must match pattern `^[a-z0-9][a-z0-9-]*(/[a-z0-9][a-z0-9-]*)*$`.
- Do not use absolute paths (no leading `/`), no trailing `/`, no `.` or `..`.
- One skill, one path. A skill cannot belong to two hierarchies at once — the `browse_category` field is the escape hatch for secondary flat grouping.

**Example.**
```yaml
category: ecommerce/integrations/shopify
```

**When to use.** When the skill library is large enough that a tree structure helps readers find related skills. A library with fewer than 20 skills rarely benefits.

**When NOT to use.** Small skill libraries — `browse_category` alone is sufficient. Skills where categorization is genuinely ambiguous — use `project_tags` or `routing_groups` to attach flat semantic tags instead.

---

## `scope`

**Purpose.** Indicates locality and usage mode. Tells the router and auditor whether the skill is fully portable, a documentation reference, or grounded in a specific codebase.

**Allowed values.**

| Value | Meaning | Requires `grounding`? |
|---|---|---|
| `portable` | Fully portable, no repo-specific claims | No |
| `reference` | Documentation-style skill grounded in contract documents | No |
| `codebase` | Grounded in a specific codebase or deployment | **Yes** (schema-enforced) |

**Rules.**
- `scope: codebase` triggers a schema `allOf` rule that requires the `grounding` block. Lint fails without it.
- Do not use `overlay` as a scope value — use `type: overlay` and `extends` instead.
- Choose `portable` for starter skills and broadly reusable skills.
- The v1 names `generic` and `operational` were renamed in schema_version 2: `generic` → `portable` (the intent is "works anywhere"), and `operational` → `codebase` (the intent is "grounded in *this* codebase"). The v1 names are hard errors under the v2 schema.

**Example.**
```yaml
scope: codebase
```

**When to use.** Always — required.

**When NOT to use.** Do not use `codebase` for skills that make no concrete repo claims — use `portable` instead.

---

## `owner`

**Purpose.** Records who is responsible for keeping the skill current. Enables audit tooling to surface orphaned or unmaintained skills.

**Rules.**
- Free-form string — no enum is enforced.
- Use a stable identifier: a GitHub handle, a team name, or `maintainer` for shared ownership.
- For open-source skills with no single owner, use `community`.

**Example.**
```yaml
owner: maintainer
```

**When to use.** Always — required.

**When NOT to use.** Do not omit or use a placeholder like `TBD`. An unknown owner is still a real state — record the team that accepted the skill.

---

## `freshness`

**Purpose.** Records when the skill content was last meaningfully reviewed or updated. Drives staleness detection in audit tooling.

**Rules.**
- ISO 8601 date string (`YYYY-MM-DD`).
- Update this field whenever the skill body or frontmatter is substantively revised.
- Cosmetic edits (typos, formatting) do not require a `freshness` bump.
- A `freshness` date more than 90 days old is a signal for re-review.

**Example.**
```yaml
freshness: "2026-04-15"
```

**When to use.** Always — required.

**When NOT to use.** N/A — required. If you are unsure of the last review date, set it to the current date as an explicit "reviewed now" assertion.

---

## `drift_check`

**Purpose.** Records when the skill was last verified against its truth sources (code, docs, external specs) AND stores content hashes of those truth sources at the time of verification. The stored hashes turn `drift_check` from a self-asserted date into evidence the drift sentinel can verify. Distinct from `freshness` — a skill can be editorially fresh but technically drifted.

**Shape change in v3.** The v2 field was a date string. The v3 field is an object with a required `last_verified` date and an optional `truth_source_hashes` map. The v2 scalar form is rejected as a type error under v3; run `node scripts/migrate-skill-v2-to-v3.js` for an automatic upgrade.

**Rules.**
- Object with one required sub-field and one optional sub-field.
- `last_verified`: ISO 8601 date string (`YYYY-MM-DD`).
- `truth_source_hashes`: optional map of truth source file path → SHA-256 hex digest.
- The file paths in `truth_source_hashes` must match entries in `grounding.truth_sources` exactly. The drift sentinel (`scripts/skill-graph-drift.js`) reports DRIFT when any live hash differs from the recorded hash, BROKEN when a truth source is missing, and NO_BASELINE when `truth_source_hashes` is absent but truth sources are declared.
- For `scope: portable` skills with no external truth sources, `drift_check.last_verified` equals `freshness` and `truth_source_hashes` is omitted.
- Record hashes with `node scripts/skill-graph-drift.js --record --apply <skill-path>`; preview without `--apply`.
- A `drift_check.last_verified` date significantly older than `freshness` is a warning sign that editorial updates have outpaced verification.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `last_verified` | string (date) | ISO date of the most recent verification against truth sources |
| `truth_source_hashes` | object (string → string) | Map of truth source path → SHA-256 hex digest at the time of verification |

**Example.**
```yaml
drift_check:
  last_verified: "2026-04-17"
  truth_source_hashes:
    "src/integrations/shopify/client.ts": "c2a4b1e0...64-char-hex..."
    "src/integrations/shopify/webhooks.ts": "7f81a3d2...64-char-hex..."
```

**When to use.** Always — required.

**When NOT to use.** Do not fabricate hashes. If you cannot compute them with the drift tool, omit `truth_source_hashes` and accept a NO_BASELINE state until you can run the tool.

**Migration from v2.** v2 used a single date string: `drift_check: "2026-04-15"`. v3 requires an object: `drift_check:\n  last_verified: "2026-04-15"`. The codemod handles this transformation automatically.

---

## `eval_artifacts`

**Purpose.** Declares the presence of eval artifact files for this skill. This is the "does an eval file exist on disk?" axis — independent of whether the eval has ever been run or is routed anywhere.

**Allowed values.**

| Value | Meaning | Artifact expectation |
|---|---|---|
| `none` | No eval work started or planned | No eval artifact expected |
| `planned` | Eval work intended but not yet authored | No eval artifact yet — temporary state |
| `present` | One or more eval files exist on disk | `scripts/skill-lint.js` verifies a file under `examples/evals/` carries the skill's `skill_name` |

**Rules.**
- `present` requires a real eval artifact. The lint script rejects a mismatch.
- `planned` is a temporary state — move to `present` once artifacts ship.
- `none` is reserved for skills where evals are genuinely not part of the plan (rare).

**Example.**
```yaml
eval_artifacts: present
```

**When to use.** Always — required.

**When NOT to use.** N/A — required. Do not inflate (`present` without a real file).

**Migration from v1.** The v1 `eval_status` enum mixed three orthogonal concerns; this field is the "artifact state" axis. See `docs/manifest-contract.md § Migration Note — v1 → v2` for the full mapping (e.g. `eval_status: evals` → `eval_artifacts: present, eval_state: passing, routing_eval: absent`).

---

## `eval_state`

**Purpose.** Declares the current runtime verification state of the skill's evals. This is the "have the evals been run and passed recently?" axis — independent of whether the artifact file exists.

**Allowed values.**

| Value | Meaning |
|---|---|
| `unverified` | No passing run has been recorded for these evals |
| `passing` | A recent run exists and was green |
| `monitored` | Actively run in a live toolchain, continuously verified |

**Rules.**
- `passing` requires a concrete verification receipt (test output, CI run, or similar evidence).
- `monitored` requires a live toolchain that re-runs the evals on some cadence.
- Do not use `passing` without a recorded run — use `unverified` when the artifacts exist but have not been exercised.

**Example.**
```yaml
eval_state: passing
```

**When to use.** Always — required.

**When NOT to use.** N/A — required.

---

## `routing_eval`

**Purpose.** Declares whether routing / trigger coverage is explicitly evaluated for this skill. This is the "are we checking that the skill activates on the right prompts?" axis — independent of the content-level eval state captured by `eval_state`.

**Allowed values.**

| Value | Meaning |
|---|---|
| `absent` | Routing / trigger coverage is not evaluated for this skill |
| `present` | Routing / trigger coverage is part of the eval set |

**Rules.**
- `present` implies the eval artifacts include routing or trigger assertions, not just content quality.
- Most starter skills default to `absent` — routing coverage is a deeper authoring step.

**Enforcement.** As of [Unreleased], `routing_eval: present` is a verifiable claim. The harness at `scripts/skill-graph-routing-eval.js` runs every `examples[]` entry through `skill-graph-route.js` and asserts the skill wins; runs every `anti_examples[]` entry and asserts the winner is NOT this skill AND (if non-null) is named in `relations.boundary[]`. A skill that declares `present` must satisfy two lint gates (check 12 in `scripts/skill-lint.js`):

1. Both `examples` and `anti_examples` are populated — the harness needs prompts to evaluate.
2. Running `node scripts/skill-graph-routing-eval.js --skill <name>` returns verdict `PASS` for the skill.

A skill whose harness run contains any `FAIL` case cannot ship `present`; lint surfaces each failing prompt with the router's actual decision. A `COVERAGE_GAP` verdict (the anti-example correctly avoids this skill but no other skill absorbs it) is informational and does not block `present` — the anti-example did its job; the coverage-gap signal is for the next authoring iteration. Prefer `absent` until the harness agrees — honesty over green checkmarks.

**Current status of the starter library.** As of the `[Unreleased]` entry, all eight starters declare `routing_eval: present` and pass the harness 8-of-8 (verified by `node scripts/skill-graph-routing-eval.js --only-asserted`). Each starter's `examples[]` activate the skill correctly and each `anti_examples[]` route to the appropriate boundary owner. The route flips `present` were earned by tightening keywords, splitting `examples` from `anti_examples`, and populating `relations.boundary[]` with explicit handoff targets. New skills should default to `absent` until the harness agrees — honesty over green checkmarks remains the rule.

**Example (preferred — production starters).**
```yaml
routing_eval: present
```

**Example (acceptable for new authoring — flip to `present` once the harness passes).**
```yaml
routing_eval: absent
```

**When to use.** Always — required.

**When NOT to use.** N/A — required. Do not inflate (`present` without a routing harness that returns verdict PASS for the skill).

---

## `stability`

**Purpose.** Communicates how mature and reliable the skill is. Helps consumers decide whether to depend on the skill in production workflows.

**Allowed values.**

| Value | Meaning |
|---|---|
| `experimental` | Under active development; API or content may change without notice |
| `stable` | Content is settled and expected to change only via versioned updates |
| `frozen` | No further changes planned; archived as-is |
| `deprecated` | Superseded by another skill; consumers should migrate |

**Rules.**
- Strongly recommended even though not schema-required.
- Omit only for skills where stability is genuinely unknown at authoring time (migrate to a real value quickly).
- A deprecated skill should add a note in `## Coverage` pointing to the replacement.

**Example.**
```yaml
stability: stable
```

**When to use.** For any skill intended to be used by others. Omit only if the skill is a draft that will be revised immediately.

**When NOT to use.** Do not use `frozen` for skills that might still need maintenance — `stable` is the correct choice for mature, actively-owned skills.

---

## `superseded_by`

**Purpose.** Names the skill that replaces this one when `stability: deprecated`. Consumers and routers use this to follow a deprecation chain automatically instead of reading the body prose.

**Rules.**
- Optional for non-deprecated skills.
- **Required when `stability: deprecated`** — enforced by the `allOf` rule in `skill.schema.json`. A deprecated skill without `superseded_by` fails schema validation.
- The value must be the `name` of an existing skill in the library. (Target-existence check follows the `relations.*` enforcement pattern and is expected to land in a future lint iteration.)
- Write a brief pointer in `## Coverage` as well so human readers see the migration path without re-parsing frontmatter.

**Example.**
```yaml
stability: deprecated
superseded_by: new-skill-name
```

**When to use.** On every skill entering the `deprecated` state, in the same commit that sets `stability: deprecated`.

**When NOT to use.** Non-deprecated skills. Do not declare a speculative replacement ahead of the deprecation event — it misleads routers.

**Migration from v2.** Added in v0.5.0 (additive — not a schema bump). Prior deprecated skills must retroactively populate `superseded_by` when they next get edited.

---

## `examples`

**Purpose.** Positive-class activation examples — a short list of realistic user prompts the skill SHOULD activate for. Complements `keywords` (semantic tokens) and `triggers` (exact labels) by giving routers full-prompt, few-shot retrieval targets.

**Rules.**
- Optional array of strings.
- 2–5 entries is the sweet spot. Fewer than 2 gives the router no discrimination signal; more than 5 dilutes the vector-search centroid.
- Write the examples in the user's voice — the prompt they would actually type — not in imperative abstract form.
- Each example should be a self-contained prompt, not a fragment (router embeddings cover the full string).
- Groups under `activation.examples` in the manifest projection.

**Example.**
```yaml
examples:
  - "how do I validate a webhook signature from Shopify?"
  - "the HMAC check is failing for a real payload — what's wrong?"
  - "add Stripe webhook signature verification to this route"
```

**When to use.** Any skill that relies on natural-language routing at query time — the router cannot see the skill body, only the metadata. Routable skills without `examples` under-trigger at library scale (see SkillRouter paper, `.artifacts/audit-brief.md` for references).

**When NOT to use.** Internal helper skills activated only by label or path. Overlay skills that inherit their parent's activation.

**Migration from v2.** Added in v0.5.0 (additive — not a schema bump).

---

## `anti_examples`

**Purpose.** Negative-class activation examples — user prompts that look topically related to this skill but should activate a DIFFERENT skill instead. Used as hard-negative training signal by embedding routers to sharpen boundary discrimination.

**Rules.**
- Optional array of strings.
- Pair with `relations.boundary` — every `anti_examples` entry should correspond to a concrete other skill the router should route to. Name that skill in `relations.boundary` with an object-form `{skill, reason}` explaining why it owns that territory.
- Do not dump generic off-topic prompts here — this is not a blocklist. Use it only for near-misses the router keeps getting wrong.
- Groups under `activation.anti_examples` in the manifest projection.

**Example.**
```yaml
anti_examples:
  - "refactor this function to be more testable"     # → refactor skill, not this one
  - "why is my test failing after the refactor?"     # → debugging skill
relations:
  boundary:
    - skill: refactor
      reason: "refactor covers behavior-preserving code modification; this skill is test-strategy planning"
    - skill: debugging
      reason: "chasing a failure is debugging; planning is strategy"
```

**When to use.** When the skill has documented confusables (near-miss activations) that the routing layer has gotten wrong. Write the anti-example list after you have seen the router misfire, not before — authoring anti-examples without real router data is speculative.

**When NOT to use.** Skills with no close-neighbor confusables. Skills that are activated only by exact label or path (routing is deterministic, not embedding-based).

**Migration from v2.** Added in v0.5.0 (additive — not a schema bump).

---

## `license`

**Purpose.** Declares the distribution license for the skill content. Required for any skill intended for public or cross-team sharing.

**Rules.**
- Free-form string — use a standard SPDX identifier where possible (`MIT`, `Apache-2.0`, `CC-BY-4.0`).
- Strongly recommended for all skills, even if the repo already has a top-level LICENSE file.
- Omit only for internal skills that are explicitly not intended for redistribution.

**Example.**
```yaml
license: MIT
```

**When to use.** Whenever a skill might be shared outside the immediate team or repo.

**When NOT to use.** Internal-only skills where no redistribution is expected — but prefer to include it even then, for clarity.

---

## `compatibility`

**Purpose.** Declares environment requirements for skills that have specific runtime needs — target agent runtimes, Node.js version, and free-text notes for anything else.

**Shape change in v3.** The v2 field was a free-text string up to 500 characters. The v3 field is a structured object so consumers can parse `runtimes` and `node` without heuristics. The scalar form is rejected as a type error under v3; run `node scripts/migrate-skill-v2-to-v3.js` to upgrade (the codemod moves the old string verbatim into `compatibility.notes`).

**Rules.**
- Object with up to three optional sub-fields.
- Omit the field entirely when the skill is fully generic with no environment requirements.
- `runtimes`: array of strings naming target agent runtimes with optional version constraints (e.g., `claude-code>=2.0`, `cursor>=0.40`). Use short stable identifiers.
- `node`: Node.js version constraint as a string (e.g., `>=18`).
- `notes`: free-text supplement, capped at 500 characters.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `runtimes` | string[] | Target agent runtimes with optional version constraints |
| `node` | string | Node.js version constraint |
| `notes` | string (≤500 chars) | Free-text supplement |

**Example.**
```yaml
compatibility:
  runtimes:
    - claude-code>=2.0
    - cursor>=0.40
  node: ">=18"
  notes: Requires PostgreSQL 15+ when using the `neon` adapter.
```

**When to use.** When the skill's instructions require a specific runtime, CLI tool, or package version that is not universally available.

**When NOT to use.** Generic skills with no runtime dependencies — omit the field rather than setting it to an empty object.

**Migration from v2.** The codemod (`scripts/migrate-skill-v2-to-v3.js`) transforms `compatibility: "<text>"` to `compatibility:\n  notes: "<text>"`. Authors move the string into `runtimes` / `node` manually when the structured form is more accurate.

---

## `allowed-tools`

**Purpose.** Names the pre-approved tools a skill is permitted to invoke when loaded into an agent runtime that honors the declaration.

**Rules.**
- Space-separated string — not an array. The string form is required for Agent-Skills-compatible export.
- Use the tool names as defined by the target agent runtime (e.g., `Read`, `Grep`, `Bash` for Claude Code).
- This is experimental per the Agent Skills spec — support varies across agent implementations.
- Skill Graph validates the shape but does not enforce the allowlist at runtime.

**Example.**
```yaml
allowed-tools: Read Grep Bash
```

**When to use.** When deploying to a runtime that enforces tool allowlists and you want to declare the minimum required set.

**When NOT to use.** Skills where all tools are permitted (omit the field) or where the deployment runtime does not read this field.

---

## `extends`

**Purpose.** Explicitly states which base skill an overlay extends. Required for all `type: overlay` skills.

**Rules.**
- Must be the `name` value of an existing skill in the library.
- `scripts/skill-lint.js` verifies the target exists.
- Only valid when `type: overlay`. Setting `extends` on a non-overlay skill is an error.

**Example.**
```yaml
type: overlay
extends: shopify
```

**When to use.** When and only when `type: overlay`. The overlay inherits and specializes the base skill's content.

**When NOT to use.** Non-overlay skills. Do not use `extends` to express a dependency — use `relations.depends_on` for that.

---

## `triggers`

**Purpose.** Explicit phrase or label triggers that activate this skill. Complements `keywords` for skills that respond to exact phrases rather than semantic matching.

**Rules.**
- Array of strings.
- Use for exact activation phrases that the routing layer should match literally (e.g., skill IDs, CLI flags, label strings).
- Prefer `keywords` for semantic matching; use `triggers` for exact-match activation.

**Example.**
```yaml
triggers:
  - shopify-skill
  - use-shopify
```

**When to use.** When the skill has known exact trigger phrases (CLI commands, label names, template strings) that should reliably activate it.

**When NOT to use.** Generic concepts best expressed as `keywords`. If the phrase is conceptual rather than exact, put it in `keywords`.

---

## `keywords`

**Purpose.** Semantic keywords for discovery, search indexing, and activation routing. The primary signal for routers that use vector search or fuzzy matching.

**Rules.**
- Array of strings.
- Include topic synonyms, related concepts, and the primary use-case phrases a user would naturally type.
- Do not duplicate `name` in keywords unless it is also a common search phrase.
- Ordered from most specific to most general.

**Example.**
```yaml
keywords:
  - shopify
  - shopify api
  - shopify webhook
  - e-commerce integration
```

**When to use.** Required for all routable skills. Omit only for internal helper skills that are never activated by user language.

**When NOT to use.** Keywords are not tags for browse taxonomy — that is `browse_category` / `category`'s job. Do not add every possible synonym; keep to the 3–8 most likely search terms.

**Lint check.** `scripts/skill-lint.js` errors when `keywords` is absent or empty for a skill with `scope: codebase` or a non-empty `routing_groups` field. Those skills are designed to be discovered by keyword routers and cannot be omitted. See `scripts/lint/check-routing-quality.js` (check R1).

---

## `paths`

**Purpose.** Filesystem glob patterns that identify the code surfaces this skill governs. Enables file-surface activation and diff-aware routing.

**Rules.**
- Array of glob strings.
- Use `**` for recursive matching within a directory.
- Paths are relative to the repo root where the skill is deployed.
- A skill activated by file path will load automatically when an agent edits a matching file.

**Example.**
```yaml
paths:
  - src/integrations/shopify/**
  - src/webhooks/shopify.ts
```

**When to use.** For `scope: codebase` skills that govern specific files or directories. Omit for portable or reference skills.

**When NOT to use.** Generic skills with no specific file surfaces. Do not add paths as aspirational documentation — only add paths the skill actively covers.

---

## `project_tags`

**Purpose.** Declares which projects a skill is relevant to in a multi-project workspace. A skill without `project_tags` is ambient — it applies to every project. A skill with tags is filtered in or out by the router based on the active project.

**Taxonomy note.** `project_tags` answers "which of my projects is this skill relevant to?" `category` answers "where does this belong in a browse tree?" `routing_groups` answers "which batch-activation group is this in?" Three fields, three different jobs, no overlap.

**Rules.**
- Optional array of lowercase kebab-case tokens.
- Each tag is either a literal project handle (e.g., `sales-hub`, `free-oppression`) or a semantic tag that multiple projects share (e.g., `ecommerce`, `shopify-stack`).
- The workspace config at `.skill-graph/config.json` maps literal project handles to `semantic_tags`. A skill tagged with a semantic tag matches every project whose config expands to include that tag.
- Absent `project_tags` means the skill is ambient — applies to every project. This is the default; use it for cross-cutting skills like GDPR, a11y, or test-driven-development.

**Example.**
```yaml
# Sales Hub only
project_tags: [sales-hub]

# Cross-ecommerce — both sales-hub and free-oppression
project_tags: [ecommerce]

# Literal + semantic — precise match on sales-hub, semantic match on any ecommerce project
project_tags: [sales-hub, ecommerce]
```

**Workspace config resolution.**

```json
// .skill-graph/config.json
{
  "workspace": {
    "projects": {
      "sales-hub":        { "semantic_tags": ["ecommerce", "shopify-stack"] },
      "free-oppression":  { "semantic_tags": ["ecommerce", "etsy-stack"] }
    }
  }
}
```

A skill tagged `[ecommerce]` matches both `sales-hub` and `free-oppression`. A skill tagged `[sales-hub]` only matches `sales-hub`. A skill tagged `[etsy-stack]` only matches `free-oppression`.

**When to use.** When the workspace has more than one project and a skill's scope is clearly bound to a subset. Tag with semantic tags whenever possible — literal project handles couple the skill to a project name that may change.

**When NOT to use.** Single-project workspaces — omit the field. Cross-cutting skills that apply everywhere — omit the field. Do not use it as a substitute for `browse_category` or `routing_groups`; they answer different questions.

---

## `routing_groups`

**Purpose.** Named routing group membership for batch activation and browse classification. Allows a router to load all skills in a group with a single label.

**Taxonomy note.** A routing group is a *classification tag* a router can consult to select a family of skills (e.g., `quality`, `security`, `integrations`). It is not a URL route, not an execution graph, and not a permission scope. The field was renamed from `route_groups` in schema_version 2 (SH-5784) because the old name invited confusion with URL routing; the semantics did not change.

**Rules.**
- Array of strings.
- Group names are library-defined — establish a consistent vocabulary and document it in the library's README.
- A skill can belong to multiple routing groups.
- Use established groups before inventing new ones. Today's canonical group in this repo is `quality` (used by `testing-strategy`). Propose new groups in a PR before adopting them.

**Example.**
```yaml
routing_groups:
  - integrations
  - quality
```

**When to use.** When the skill belongs to a logical activation group (e.g., all `integrations` skills load together during an integration task, all `quality` skills load together during an audit).

**When NOT to use.** Skills that should only activate individually. Do not add routing groups speculatively — add them when a real routing pattern requires them.

**Migration from v1.** The v1 field name `route_groups` is a hard error under the v2 schema. Rename the field to `routing_groups`; values are unchanged.

**Lint check.** `scripts/skill-lint.js` errors when a skill has a non-empty `routing_groups` field but an absent or empty `keywords` field. A skill designed for group-based batch activation must also be discoverable by keyword-based routers. See `scripts/lint/check-routing-quality.js` (check R1).

---

## `relations`

**Purpose.** Graph semantics between skills. Each key in the `relations` object describes a different type of relationship. Together they form the edges of the skill graph.

**Rules.**
- Object with up to seven optional keys: `related` (preferred) / `adjacent` (deprecated alias), `broader`, `narrower`, `boundary`, `disjoint_with`, `verify_with`, `depends_on`.
- Every target must be the `name` of an existing skill. `scripts/skill-lint.js` rejects dangling targets across all seven keys.
- Relations are directional from the skill that declares them (A `depends_on` B means A depends on B, not the reverse). `related` is symmetric by SKOS convention; `boundary` is asymmetric (A `boundary: B` does not imply B `boundary: A`).

**Allowed keys.**

| Key | Meaning | Item shape | W3C mapping |
|---|---|---|---|
| `related` *(v3.1 preferred)* | Related skills for discoverability and recommended co-reading. Symmetric; no dependency implied. | string | `skos:related` |
| `adjacent` *(deprecated alias of `related`)* | v3.0 name; still valid in v3.x. Lint warns. Removed in v4. | string | `skos:related` |
| `broader` *(v3.1)* | Cross-skill generalisation — target is more general than this skill. Triggers Stage 4b parent recall in `scripts/skill-graph-route.js`. | string | `skos:broader` |
| `narrower` *(v3.1)* | Cross-skill specialisation — target is more specific than this skill. Inverse of `broader`; not used to drive co-load (a parent match should not pull in arbitrary children). | string | `skos:narrower` |
| `boundary` *(canonical, ADR 0006)* | Routing-layer asymmetric handoff — skills this skill explicitly does NOT own; the router uses this to redirect wrong-skill queries to the correct owner. | string OR `{skill, reason}` | `sg:disjointOwnership` |
| `disjoint_with` *(v3.1, separate orthogonal relation per ADR 0006)* | Optional formal OWL class-disjointness assertion. Use only when authors genuinely want to claim that no entity can simultaneously be an instance of both classes. Rare; most authors only need `boundary`. | string OR `{skill, reason}` | `owl:disjointWith` |
| `verify_with` | Skills that should be co-loaded for verification or that provide cross-checks | string | `prov:wasInformedBy` |
| `depends_on` | Explicit dependency — this skill requires the target conceptually or operationally | string OR `{skill, min_version}` | `dcterms:requires` |

**Boundary vs disjoint_with — the ADR 0006 split.** ADR 0001 originally proposed renaming `boundary` to `disjoint_with` and treating them as aliases. ADR 0006 reverses that: the two predicates operate at different semantic layers and the schema keeps them distinct.

- `boundary` is a **routing-layer** claim. Skill A says "I am not the right answer for queries also matching B; route those to B." The router uses this for wrong-skill exclusion. Asymmetric; `reason` is strongly recommended; the canonical name for the everyday use case.
- `disjoint_with` is a **formal class-theory** claim. A and B name disjoint conceptual classes; no entity can simultaneously be an instance of both. Maps to OWL `owl:disjointWith` for RDF consumers that reason about class membership. Rare in practice — most skill libraries never need this.

If you are unsure which to use, you want `boundary`. Use `disjoint_with` only when you have an explicit reason to make a formal ontological claim that survives the JSON-LD projection into OWL.

**Glossary.** See `docs/glossary.md § Relation predicates` for the formal definitions of each predicate, including the OntoClean rigidity tags for `extends` (which lives outside `relations` but participates in the same semantic space). The JSON-LD `@context` at `schemas/skill.context.jsonld` projects these predicates to their W3C equivalents for RDF consumers.

**Item shapes in v3.** `boundary`, `disjoint_with`, and `depends_on` accept both the bare-string form (v2-compatible) and the enriched object form (v3 addition). The bare form remains valid — upgrade item-by-item when a reason or version constraint is real.

- `boundary` and `disjoint_with` objects carry a `reason` string. The reason is what makes the relation self-documenting: `"fulfillment owns order state transitions; this skill only reads them"` beats `"fulfillment"` alone.
- `depends_on` objects carry a `min_version` semver constraint. Useful when a skill depends on a specific version of another skill's contract.
- `related`, `broader`, `narrower`, `verify_with` are bare-string only — they carry no additional metadata.

**When to use `broader` vs `extends`.** `extends` is overlay-only (`type: overlay`) and forms a single-parent existential-dependency chain (child ceases to have meaning without parent; ADR 0003). `broader` is cross-skill generalisation that does NOT imply existential dependency or overlay semantics — use it when the target is a more general concept but this skill has its own standalone identity. Example: `react-best-practices` has `broader: [frontend]` because it specialises frontend knowledge, but React-best-practices remains a coherent skill even if the `frontend` skill were deleted.

**Example (v3.1, SKOS-aligned preferred names + ADR 0006 boundary canonical).**
```yaml
relations:
  related:
    - webhook-integration
  broader:
    - integration
  boundary:
    - skill: fulfillment
      reason: "fulfillment owns order state transitions; this skill only reads them"
    - skill: shipping
      reason: "shipping is covered by the shipping-integration skill"
  verify_with:
    - test-coverage
  depends_on:
    - skill: api-key-management
      min_version: "1.2.0"
    - testing-strategy
```

**Example (back-compat — `adjacent` still validates with a deprecation warning).**
```yaml
relations:
  adjacent:                                   # warns: rename to `related`
    - webhook-integration
  boundary:                                   # canonical (no warning per ADR 0006)
    - skill: fulfillment
      reason: "fulfillment owns order state transitions; this skill only reads them"
  verify_with:
    - test-coverage
  depends_on:
    - api-key-management
```

**Example (rare — formal OWL class-disjointness assertion).**
```yaml
relations:
  boundary:                                   # routing-layer (everyday)
    - skill: error-tracking
      reason: "error-tracking owns observability surface; this skill is for prevention"
  disjoint_with:                              # formal class-theory (rare)
    - skill: physical-security
      reason: "Physical-security and information-security are disjoint conceptual classes by design"
```

**When to use.** Populate `related` and `boundary` for any skill that has clearly related or clearly excluded neighbours. Populate `broader` when the target is a more general standalone skill (router uses this for parent recall). Populate `depends_on` when the skill cannot function without another skill's concepts. Populate `verify_with` when a co-loaded skill improves verification quality. Populate `disjoint_with` only for explicit OWL-class-disjointness needs.

**When to use object form.** Use `{skill, reason}` whenever a `boundary` or `disjoint_with` entry's rationale isn't obvious from the skill name alone. Use `{skill, min_version}` when a dependency's contract has versioned — without the constraint, a future update to the target skill can silently break this skill's claims.

**When NOT to use.** Do not use `related` as a dumping ground for loosely related skills — keep it to the 2–4 most meaningful connections. Do not declare the same target under both `adjacent` and `related` (lint warns). Do not fabricate `min_version` values — if you don't know the constraint, omit it. Do not use `disjoint_with` as a more emphatic `boundary`; the OWL semantics are real and reaching for them changes how RDF consumers reason about your skill graph.

---

## `grounding`

**Purpose.** Declares what the skill governs in the real world or codebase, and provides evidence anchors for repo-grounded verification. Required for `scope: codebase` skills.

**Rules.**
- Object with five required sub-fields: `domain_object`, `grounding_mode`, `truth_sources`, `failure_modes`, `evidence_priority`.
- Omit entirely for `scope: portable` and `scope: reference` skills.
- `grounding_mode` must be one of `repo_specific`, `universal`, or `hybrid`.
- `evidence_priority` must be one of `repo_code_first`, `general_knowledge_first`, or `equal`.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `domain_object` | string | The real-world or codebase entity this skill governs (e.g., "Shopify integration behavior") |
| `grounding_mode` | enum | How the skill is grounded: `repo_specific` (one codebase), `universal` (language/framework), `hybrid` (both) |
| `truth_sources` | string[] | Files, docs, or URLs that are the ground truth for the skill's claims |
| `failure_modes` | string[] | Known ways the skill can produce incorrect guidance if applied incorrectly |
| `evidence_priority` | enum | Whether to trust repo code or general knowledge first when they conflict |

**Example.**
```yaml
grounding:
  domain_object: Shopify integration behavior
  grounding_mode: repo_specific
  truth_sources:
    - src/integrations/shopify/client.ts
    - src/integrations/shopify/webhooks.ts
  failure_modes:
    - webhook_signature_bypass
    - stale_cursor_pagination
  evidence_priority: repo_code_first
```

**When to use.** Required for `scope: codebase`. Strongly recommended for any skill that makes concrete implementation claims, even if `scope` is `portable`.

**When NOT to use.** Portable skills with no specific codebase claims. Omit the entire block rather than populating it with placeholder values.

---

## `portability`

**Purpose.** Declares which agent runtimes the skill can be exported to, and an operational rating of how ready the skill is for export.

**Rules.**
- Object with two required sub-fields: `readiness` and `targets`.
- `readiness` must be `declared`, `scripted`, or `verified`. This is an operational axis, not an ordinal rating — each value says something concrete about what is true of the skill today.
- `targets` is an array constrained to `["agent-skills"]`.
- `agent-skills` in `targets` means the skill can be transformed to a valid Agent Skills file via `scripts/export-skill.js`.
- Other runtimes — `cursor`, `windsurf`, `copilot`, `agents-md` — were removed from the enum in 0.3.0. They previously described compatibility goals, but without a working transform they violated the `additionalProperties: false` strictness rule. Re-add via a new RFC and the same PR that ships the transform.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `readiness` | `declared` \| `scripted` \| `verified` | Operational export readiness — see values table below |
| `targets` | string[] | Destination runtimes the skill is declared portable to |

**`readiness` values.**

| Value | Meaning | What must be true |
|---|---|---|
| `declared` | Portability is asserted in metadata only | The author claims the skill is portable to the listed targets; no export tooling has been run |
| `scripted` | Export tooling exists for at least one target | A script (e.g., `scripts/export-skill.js`) can transform this skill to a listed target |
| `verified` | Export tooling exists AND the exported output has been verified | A receipt artifact (test run, import check) proves the exported skill works in the target runtime |

**Example.**
```yaml
portability:
  readiness: scripted
  targets:
    - agent-skills
```

**When to use.** When the skill is intended for distribution via the Agent Skills transform, and you want to declare its portability explicitly.

**When NOT to use.** Internal-only skills that will never be exported. Omit the field rather than setting `readiness: declared` with an empty `targets` array.

**Migration from v1.** The v1 sub-fields `portability.level` (values `high`/`medium`/`low`) and `portability.exports` were renamed in schema_version 2 (SH-5784). Map `high` → `scripted` when an export script exists for a listed target, else `declared`. Map `medium` → `scripted` similarly. Map `low` → `declared`. Rename `portability.exports` → `portability.targets`; values are unchanged.

---

## `lifecycle`

**Purpose.** Per-skill maintenance policy consumed by the drift sentinel (`scripts/skill-graph-drift.js`). Declares how often the skill should be re-verified and after how many days it is considered stale. New in v3.

**Why it exists.** Integration skills rot faster than pure concept skills. A Shopify API skill might need quarterly review; a testing-strategy skill might be stable for years. A single global staleness threshold misrepresents both. `lifecycle.stale_after_days` lets each skill declare its own decay rate.

**Rules.**
- Optional object with two optional sub-fields.
- `stale_after_days`: positive integer. The drift sentinel flags the skill as STALE when `today - drift_check.last_verified > stale_after_days`.
- `review_cadence`: enum hint for scheduled drift checks. The value does not affect schema validation; it signals to tooling when the skill wants to be re-verified.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `stale_after_days` | integer (≥1) | Days after `drift_check.last_verified` at which the skill is flagged stale |
| `review_cadence` | enum | `per-commit` \| `weekly` \| `quarterly` \| `on-truth-source-change` |

**Example.**
```yaml
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
```

**When to use.** Any skill that makes concrete claims about external systems, APIs, or code that changes independently of the skill content.

**When NOT to use.** Purely conceptual skills where staleness is not a meaningful concept. In that case, omit the whole block rather than setting `stale_after_days` to an absurdly high value.

---

## `runtime_telemetry`

**Purpose.** Pointer to a real-world success/failure feed for this skill. Consumers may use telemetry to corroborate or override the authored `eval_state`. New in v3.

**Why it exists.** `eval_state` is self-reported — an author claims a skill's evals are passing. `runtime_telemetry` is external-reported — a feedback pipeline records actual success/failure rates from agents that ran the skill. Together they close the loop from "did the author claim this works?" to "does this actually work in the field?"

**Rules.**
- Optional object.
- `feedback_source` is required when the block is present. It is a path or URL to a JSONL of run receipts. Each receipt is expected to carry at minimum `{ timestamp, skill, outcome }`.
- `last_updated` records when the block's `metrics` were last refreshed.
- `metrics` is optional summary statistics derived from the feedback source. Consumers may read this pre-computed summary instead of re-parsing the JSONL.

**Sub-fields.**

| Sub-field | Type | Meaning |
|---|---|---|
| `feedback_source` | string | Path or URL to a JSONL of run receipts (required) |
| `last_updated` | string (date) | ISO date of the most recent metrics refresh |
| `metrics.sample_size` | integer (≥0) | Number of recorded runs used for the summary |
| `metrics.success_rate` | number (0–1) | Fraction of runs with a positive outcome |

**Example.**
```yaml
runtime_telemetry:
  feedback_source: "telemetry/skills/shopify.jsonl"
  last_updated: "2026-04-15"
  metrics:
    sample_size: 142
    success_rate: 0.87
```

**When to use.** When a telemetry pipeline actually exists for this skill and produces receipts the router or auditor can consume.

**When NOT to use.** Speculative feedback-source paths that do not yet exist. An empty `feedback_source` is worse than an absent block — it promises data that isn't there.
