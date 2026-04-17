# Skill Graph Field Reference

> One section per authored field. Use this when writing or reviewing a `SKILL.md` file.
> For the "which value do I pick?" decisions, see `docs/field-decision-guide.md`.
> For field groups, conditional requiredness, and schema strictness rules, see `docs/metadata-contract.md`.

Fields are listed in authored order — the same order they appear in `examples/skill-template.md`.

---

## `schema_version`

**Purpose.** Versions the contract so migration tooling can handle future schema changes deterministically.

**Rules.**
- Must be the integer `2` or the string `"2"` for all v2 skills.
- Start every new skill at the current schema version. Do not downgrade.
- The v1 → v2 bump (SH-5784) changed the `scope` enum (`generic`→`portable`, `operational`→`codebase`), split `eval_status` into three orthogonal fields, renamed `portability.level`→`readiness` and `portability.exports`→`targets`, and renamed `route_groups`→`routing_groups`. See `docs/manifest-contract.md § Migration Note — v1 → v2` for the full migration map.

**Example.**
```yaml
schema_version: 2
```

**When to use.** Always — this is a required field.

**When NOT to use.** N/A — required.

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
- Use `family` for browse taxonomy, not `type`.
- `overlay` type always requires the `extends` field.

**Example.**
```yaml
type: capability
```

**When to use.** Always — required.

**When NOT to use.** Do not invent new type values. If none of the four archetypes fit, use `capability` as the closest and note the variation in the `## Coverage` section.

---

## `family`

**Purpose.** Human browse taxonomy for discovery and grouping. Does not imply runtime behavior or evaluation logic.

**Rules.**
- Open-ended string — no enum is enforced in v1.
- Use stable, human-readable buckets.
- Avoid one-off synonyms for the same idea (e.g., pick `engineering` and stick to it; don't use `dev` in one skill and `engineering` in another).
- A future release may adopt a controlled vocabulary; until then, choose consistently within a skill library.

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
family: integration
```

**When to use.** Always — required. Even if the family is unusual, populate it so the skill appears in browse indexes.

**When NOT to use.** Do not use `family` for behavioral control — that is `type`'s job.

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

**Purpose.** Records when the skill was last verified against its truth sources (code, docs, external specs). Distinct from `freshness` — a skill can be editorially fresh but technically drifted.

**Rules.**
- ISO 8601 date string (`YYYY-MM-DD`).
- For `scope: portable` skills with no external truth sources, `drift_check` equals `freshness`.
- For `scope: codebase` skills, update `drift_check` whenever you verify the skill's claims against the live codebase.
- A `drift_check` date significantly older than `freshness` is a warning sign that editorial updates have outpaced verification.

**Example.**
```yaml
drift_check: "2026-04-15"
```

**When to use.** Always — required.

**When NOT to use.** N/A — required.

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

**Purpose.** Declares whether routing / trigger coverage is explicitly evaluated for this skill. This is the "are we checking that the skill activates on the right prompts?" axis — independent of the content-level eval state.

**Allowed values.**

| Value | Meaning |
|---|---|
| `absent` | Routing / trigger coverage is not evaluated for this skill |
| `present` | Routing / trigger coverage is part of the eval set |

**Rules.**
- `present` implies the eval artifacts include routing or trigger assertions, not just content quality.
- Most starter skills default to `absent` — routing coverage is a deeper authoring step.

**Example.**
```yaml
routing_eval: absent
```

**When to use.** Always — required.

**When NOT to use.** N/A — required.

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

**Purpose.** Declares environment requirements for skills that have specific runtime needs (package managers, system tools, network access).

**Rules.**
- Free-form string; maximum 500 characters (Agent Skills spec limit).
- Omit entirely when the skill is fully generic with no environment requirements.
- Use comma-separated values for multiple requirements.
- Do not encode version ranges beyond what is readable as plain text.

**Example.**
```yaml
compatibility: Node.js 18+, Git
```

**When to use.** When the skill's instructions require a specific runtime, CLI tool, or package version that is not universally available.

**When NOT to use.** Generic skills with no runtime dependencies — omit rather than setting to `any` or a blank value.

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

**When NOT to use.** Keywords are not tags for browse taxonomy — that is `family`'s job. Do not add every possible synonym; keep to the 3–8 most likely search terms.

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

---

## `relations`

**Purpose.** Graph semantics between skills. Each key in the `relations` object describes a different type of relationship. Together they form the edges of the skill graph.

**Rules.**
- Object with four optional keys: `adjacent`, `boundary`, `verify_with`, `depends_on`.
- Every target must be the `name` of an existing skill. `scripts/skill-lint.js` rejects dangling targets.
- Relations are directional from the skill that declares them (A `depends_on` B means A depends on B, not the reverse).

**Allowed keys.**

| Key | Meaning |
|---|---|
| `adjacent` | Related skills for discoverability and recommended co-reading. No dependency implied. |
| `boundary` | Skills this skill explicitly does NOT own — anti-ownership and wrong-skill routing protection. |
| `verify_with` | Skills that should be co-loaded for verification or that provide cross-checks. |
| `depends_on` | Explicit dependency — this skill requires the target conceptually or operationally. |

**Example.**
```yaml
relations:
  adjacent:
    - webhook-integration
  boundary:
    - fulfillment
  verify_with:
    - test-coverage
  depends_on:
    - api-key-management
```

**When to use.** Populate `adjacent` and `boundary` for any skill that has clearly related or clearly excluded neighbors. Populate `depends_on` when the skill cannot function without another skill's concepts. Populate `verify_with` when a co-loaded skill improves verification quality.

**When NOT to use.** Do not use `adjacent` as a dumping ground for loosely related skills — keep it to the 2–4 most meaningful connections.

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
- `targets` is an array constrained to `["agent-skills", "cursor", "windsurf", "copilot", "agents-md"]`.
- `agent-skills` in `targets` means the skill can be transformed to a valid Agent Skills file via `scripts/export-skill.js`. Other targets describe compatibility goals, not yet-implemented transforms (see README for current status).

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
    - cursor
    - windsurf
    - copilot
```

**When to use.** When the skill is intended for distribution or cross-runtime use, and you want to declare its portability explicitly.

**When NOT to use.** Internal-only skills that will never be exported. Omit the field rather than setting `readiness: declared` with an empty `targets` array.

**Migration from v1.** The v1 sub-fields `portability.level` (values `high`/`medium`/`low`) and `portability.exports` were renamed in schema_version 2 (SH-5784). Map `high` → `scripted` when an export script exists for a listed target, else `declared`. Map `medium` → `scripted` similarly. Map `low` → `declared`. Rename `portability.exports` → `portability.targets`; values are unchanged.
