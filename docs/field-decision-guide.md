# Skill Graph Field Decision Guide

> Decision tables for the three hardest field choices in a `SKILL.md` file.
> For full field semantics and rules, see `docs/field-reference.md`.
> For field groups and conditional requiredness, see `docs/skill-metadata-protocol.md`.

---

## 1. Which `scope` do I use?

`scope` tells routers and auditors whether your skill is portable, workspace-specific, or grounded in one specific project.

### Decision table

| Situation | Correct `scope` |
|---|---|
| Skill applies across any codebase or team with no repo-specific claims | `portable` |
| Skill is primarily a workspace-local reference for a contract, spec, or document (e.g., "Skill Metadata Protocol for this repo") | `workspace` |
| Skill makes concrete claims about files, APIs, or behavior in one specific project | `project` |
| Skill is a starter or template that could be copied into any project | `portable` |
| Skill references specific file paths, function names, or deployment details | `project` |
| Skill documents abstract methodology (testing strategy, refactoring patterns) | `portable` |

### Diagnostic questions

**Q: Does my skill say "in `src/integrations/shopify/client.ts`" or similar?**
→ `project`

**Q: Does my skill say "in the codebase" without naming specific files?**
→ `portable`

**Q: Is my skill's primary purpose to be a reference for a contract document (like a schema or this Skill Metadata Protocol)?**
→ `workspace`

**Q: Would this skill work unchanged if copied into a completely different project?**
→ `portable` (if yes), `project` (if no)

### Important constraint

`scope: project` requires a populated `grounding` block. The JSON schema also accepts legacy `scope: codebase` during the v7 sunset window and applies the same grounding requirement. If you choose `project`, populate `grounding` before committing and run the protocol/manifest checks for full-contract validation.

### Migration from v1

The v1 scope values (`generic`, `operational`) were renamed in schema_version 2 (SH-5784) and are rejected as hard errors by the v2+ schemas. For the full v1 → v2 rename table see [`docs/field-reference.md § scope`](field-reference.md#scope); for the codemod that applies every v2 → v3 change automatically, see [`docs/manifest-field-mapping.md § Migration Note — v2 → v3`](manifest-field-mapping.md#migration-note--v2--v3-v040).

### Examples

```yaml
# Correct: skill about abstract testing patterns
scope: portable

# Correct: workspace-local reference for this repo's protocol documents
scope: workspace

# Correct: skill that covers Shopify integration in a specific project
scope: project
grounding:
  domain_object: Shopify integration behavior
  grounding_mode: repo_specific
  # ...
```

---

## 2. Which `relations.*` key do I use?

The four relation keys serve distinct purposes. Using the wrong key creates misleading graph edges.

### Decision table

| Field | Use when | Do NOT use when |
|---|---|---|
| `related` | Another skill is useful next reading or common co-loading | You need ordering or verification |
| `boundary` | Users commonly confuse this skill with another | You only want related reading |
| `verify_with` | A second skill materially increases confidence on the same task | The other skill is merely adjacent |
| `depends_on` | This skill cannot be applied correctly before another one | You just want a recommended pairing |

### Concrete examples

The distinction between these relation types is best illustrated by existing usage in the library:

- **`depends_on`** — `refactor` declares `depends_on: [testing-strategy]` because refactoring without understanding test strategy is unsafe. The concepts are foundational to the skill's correctness.

- **`verify_with`** — `skill-infrastructure` declares `verify_with: [skill-scaffold]` because running skill library maintenance checks alongside skill authoring patterns materially increases confidence in the skill's claims. They are commonly used together in audit pipelines.

- **`related`** — `refactor` can declare `related: [debugging, testing-strategy]` because readers of the refactor skill would benefit from understanding debugging and testing approaches. These are topically related but not mandatory dependencies. `adjacent` remains a back-compat alias, but new skills should use `related`.

- **`boundary`** — `refactor` declares `boundary: [documentation]` to assert exclusive ownership of the refactor use-case over documentation. When refactor wins a query that also matched documentation, this entry excludes documentation from co-routing. **Note:** the field name implies "defer to documentation" but the mechanic is "exclude documentation when refactor wins." Write reason text using ownership framing: `"refactor owns this use-case exclusively; documentation does not."` See WARNING in `SKILL_METADATA_PROTOCOL.md § Relations § boundary`.

When a skill extends another skill's base behavior (e.g., an overlay), use the `extends` field instead of relations.

### Combined example

```yaml
relations:
  related:
    - webhook-integration   # related: reader may want this context
  boundary:
    - fulfillment           # I own this exclusively over fulfillment; excludes fulfillment when I win
  verify_with:
    - test-coverage         # co-load during audits
  depends_on:
    - api-key-management    # hard dependency: skill builds on this
```

### Validation

All relation targets should be the `name` of an existing skill in the library. `scripts/skill-lint.js` validates relation shape; catch relation-target drift through graph/manifest review, routing review, and audit findings.

---

## 3. What eval-health and `portability` state do I choose?

### Eval-health state: the three orthogonal axes

Schema_version 2 (SH-5784) split the v1 `eval_status` enum into three orthogonal fields because the old enum mixed artifact state, runtime state, and routing coverage into a single ordinal. Each axis now has its own value.

#### `eval_artifacts` — "does a file exist?"

```
Does an eval artifact file exist for this skill?
  NO  →  Is eval work intentionally deferred?
            YES → planned
            NO  → none
  YES → present
```

| Value | Use when |
|---|---|
| `none` | No eval planned or authored. Rare — use sparingly. |
| `planned` | Evals are intended but no artifact exists yet. Temporary state. |
| `present` | At least one eval artifact exists on disk. Verify the artifact with eval/audit tooling; the schema lint gate only validates the declared value. |

#### `eval_state` — "has it been run and passed?"

```
Have the evals been run and passed recently?
  NO                                → unverified
  YES, one-off manual run           → passing
  YES, continuously run by a toolchain → monitored
```

| Value | Use when |
|---|---|
| `unverified` | Artifacts exist but no passing run has been recorded (or no artifacts yet). |
| `passing` | A recent run exists and was green. Needs a concrete receipt. |
| `monitored` | Actively run on a cadence by a live toolchain. |

#### `routing_eval` — "do we check routing coverage?"

| Value | Use when |
|---|---|
| `absent` | Routing / trigger coverage is not evaluated for this skill. Default for most starters. |
| `present` | Eval artifacts include routing assertions (does the skill activate for the right prompts?). |

**Anti-pattern.** Do not set `eval_state: passing` without an actual passing run. Do not set `eval_artifacts: present` without a real file. Do not claim `routing_eval: present` when the eval only checks content, not routing.

### Migration from v1

The v1 `eval_status` enum collapsed three concerns into one. Map each old value to the new triple:

| v1 `eval_status` | `eval_artifacts` | `eval_state` | `routing_eval` |
|---|---|---|---|
| `none` | `none` | `unverified` | `absent` |
| `pending` | `planned` | `unverified` | `absent` |
| `evals` | `present` | `passing` | `absent` |
| `passing` | `present` | `passing` | `absent` |
| `active` | `present` | `monitored` | `absent` |
| `evals+trigger` | `present` | `passing` | `present` |

### `portability.readiness` decision

The `readiness` field is operational, not ordinal. Each value says something concrete about what is true of the skill today.

| Readiness | Use when |
|---|---|
| `declared` | Portability is claimed in metadata only; no export tooling has run. |
| `scripted` | Export tooling exists for at least one listed target (e.g., `scripts/export-skill.js` covers `skill-md`). |
| `verified` | Export tooling exists AND the exported output has been verified in the target runtime with a receipt artifact. |

**Quick heuristic:**
- `scope: portable` with no repo paths AND export script covers at least one target → `readiness: scripted`
- `scope: project` with concrete repo paths AND no export tooling yet → `readiness: declared`
- Export tooling ran AND the output was loaded into the target runtime AND passed a smoke test → `readiness: verified`

### `portability.targets` decision

`targets` declares which runtimes the skill is portable to. (Renamed from `exports` in v2.)

| Target | Include when |
|---|---|
| `skill-md` | The skill can be transformed to a valid SKILL.md file via `scripts/export-skill.js`. |

The enum accepts only `skill-md` today. Other runtimes — `cursor`, `windsurf`, `copilot`, `agents-md` — were removed from the enum in 0.3.0. They previously sat in the enum as compatibility *goals* with no working transform, which violated the contract's `additionalProperties: false` strictness rule. Re-add via a new RFC and the same PR that ships the transform for that runtime.

**Rule of thumb:** if the skill can round-trip through `scripts/export-skill.js` today, include `skill-md`. Otherwise omit the `portability` block entirely.

### Migration from v1

| v1 `portability.level` | v2 `portability.readiness` |
|---|---|
| `high` | `scripted` (if an export script covers at least one target) else `declared` |
| `medium` | `scripted` (if an export script covers at least one target) else `declared` |
| `low` | `declared` |

`portability.exports` was renamed to `portability.targets`. Values are unchanged.

```yaml
# Canonical: the only target currently accepted by the schema.
portability:
  readiness: scripted
  targets:
    - skill-md
```

---

## 4. How do I tag a skill for multiple projects?

`workspace_tags` is the v3 mechanism for multi-project relevance. It is flat and composable — no hierarchy required. A workspace config at `.skill-graph/config.json` expands literal project handles into semantic tag sets, so one skill tag can match many projects.

### Decision table

| Situation | Correct `workspace_tags` |
|---|---|
| Skill applies to every project (cross-cutting concern) | Omit `workspace_tags` (ambient) |
| Skill applies to one specific project and not reusable elsewhere | `[literal-project-handle]` |
| Skill applies to several projects that share a technology / domain | Semantic tag(s) that the workspace config maps those projects to |
| Skill applies to one project by literal handle AND to a semantic group | Both: `[literal-handle, semantic-tag]` |
| Single-project workspace | Omit `workspace_tags` always |

### Literal vs semantic tags

| Tag style | Example | When to use |
|---|---|---|
| Literal | `<your-project-handle>` (whatever short kebab-case name you give a project in your workspace config) | Precise targeting. Couples the skill to a specific project name. Readable but brittle to renames. |
| Semantic | `ecommerce`, `saas`, `b2b` | Reusable across projects. The workspace config declares which literal projects expand to which semantic tags, so one tag matches several projects. |

**Prefer semantic when possible.** Literal handles work but they bind the skill to a project name. Semantic tags describe the domain and survive project renames.

### Diagnostic questions

**Q: Does my workspace have more than one project?**
→ If no, omit `workspace_tags` always.

**Q: Is this skill a cross-cutting concern (GDPR, a11y, testing patterns, general coding rules)?**
→ Omit `workspace_tags` — ambient.

**Q: Does this skill reference a specific project's files or domain?**
→ Tag with that project's literal handle OR its semantic tags.

**Q: Would I want to reuse this skill if I cloned the current project pattern into a new project?**
→ If yes, tag with semantic tags (so the new project can map its handle to those tags). If no, tag with the literal handle.

### Example

```yaml
# One specific project only — literal targeting
workspace_tags: [<project-a>]

# Cross-ecommerce — semantic, applies to every project whose config maps to `ecommerce`
workspace_tags: [ecommerce]

# Explicit both — literal match on <project-a>, semantic match on any ecommerce project
workspace_tags: [<project-a>, ecommerce]
```

With a hypothetical two-project workspace config:

```json
{
  "workspace": {
    "projects": {
      "<project-a>":  { "semantic_tags": ["ecommerce", "saas", "b2b"] },
      "<project-b>":  { "semantic_tags": ["ecommerce", "b2c"] }
    }
  }
}
```

(`<project-a>` and `<project-b>` are placeholders — adopters use whatever kebab-case handles they choose.) A skill with `workspace_tags: [ecommerce]` routes into both projects. A skill with `workspace_tags: [b2b]` routes only into the first. A skill with no `workspace_tags` routes into all projects (ambient).

---

## 5. Do I use `category`, `domain`, `workspace_tags`, or `routing_bundles`?

These four fields all group skills, but they answer different questions. Picking the wrong field creates misleading organization that corrodes routing quality. Use this table before adding any skill-grouping field:

| Field | Answers the question | Shape | Primary consumer |
|---|---|---|---|
| `category` | What flat bucket does this skill live in for quick browsing? | single string from the closed v5+ enum: `foundations` \| `engineering` \| `design` \| `quality` \| `agent` \| `product` | human browse UI, filter dropdowns |
| `domain` | Where does this skill sit in a hierarchy for tree browsing? | optional slash-delimited path (e.g., `engineering/integrations/shopify`) | folder-tree UI, docs site navigation |
| `workspace_tags` | Which of my projects is this skill relevant to? | flat array (e.g., `[<project-a>, ecommerce]`) | router filter at routing time |
| `routing_bundles` | Which batch-activation group does this skill belong to? | flat array (e.g., `[quality, security]`) | router batch-load by group label |

### Three rules that prevent misuse

1. **Never use `category` for routing.** It's a browse index. If you find yourself writing "when the router sees `engineering` it should load all X" — you want `routing_bundles`, not `category`.

2. **Never use `workspace_tags` for taxonomy.** It's a routing filter. If you find yourself tagging every skill with every project handle to build a grouping — you want `category` or `domain`.

3. **Never use `domain` to filter routing.** A hierarchy helps humans find skills. The router doesn't walk it. If you want the router to match `engineering/integrations/shopify` at query time, flatten it into `routing_bundles: [integrations]` or `workspace_tags: [ecommerce]`.

### Worked example

A Shopify skill in a multi-project, large-library workspace:

```yaml
category: engineering                          # "Where does it live in a flat browse UI?" (must be one of the 6 v5+ enum values)
domain: engineering/integrations/shopify       # "Where in a tree?" (optional; complements category for hierarchical browsing)
workspace_tags: [ecommerce]                    # "Which of my projects?"
routing_bundles: [integrations]                # "Which batch-activation group?"
```

Each field does a distinct job. None is redundant with the others. A single-project workspace can omit `workspace_tags`; a library with no batch-activation pattern can omit `routing_bundles`; a library that does not need a hierarchical browse view can omit `domain`. `category` is always present because it is required by the v7 schema (enforced by `enum` in `schemas/skill.schema.json` and `scripts/lint/check-category-enum.js`).
