# Skill Graph Field Decision Guide

> Decision tables for the three hardest field choices in a `SKILL.md` file.
> For full field semantics and rules, see `skill-metadata-protocol/field-reference.md`.
> For field groups and conditional requiredness, see `skill-metadata-protocol/design-rationale.md`.

---

## 1. What `public` value do I use? (and when is a skill project-anchored?)

`public` is a boolean **publishability / private-data gate** — is this skill safe to release to the public skills.sh marketplace? It replaced the old `deployment_target` enum because publishability, not deployment location, is what the export gate actually needs. **Publishability and project-anchoring are two independent axes:**

- **`public`** answers *"does this skill carry private data?"* — `false` keeps it out of the public release.
- **`project[]` + `grounding`** answers *"is this skill anchored to a specific repo's truth?"* — non-empty `project[]` triggers the schema-enforced `grounding` requirement.

A skill can be project-anchored yet public (a portable pattern grounded in a public repo), or ambient yet private (carries an internal API key but isn't tied to one project). Set each axis on its own merits.

### Decision table — `public`

| Situation | Correct `public` |
|---|---|
| Skill teaches an abstract methodology with no private data (testing strategy, refactoring patterns) | `true` |
| Skill references private API keys, customer/personal data, bank details, or internal-only operations | `false` |
| Skill is a starter or template safe for anyone to copy | `true` |
| Skill quotes internal dashboards, private endpoints, or proprietary business logic | `false` |
| Unsure whether anything private leaked in | `false` (fail-safe; the audit loop can promote it later) |

### Diagnostic questions

**Q: If a stranger installed this skill from skills.sh, would any private API key, customer record, or internal-operational detail be exposed?**
→ `public: false`

**Q: Is everything in the skill an abstract/portable pattern or a fact about a *public* repo?**
→ `public: true`

**Q: When in doubt?**
→ `public: false` — the export gate is fail-safe; a skill is published only when explicitly `public: true`.

### Project-anchoring (the separate axis)

A skill that makes concrete claims about files, APIs, or behavior in one specific project should declare that project in `project[]` and populate a `grounding` block — **non-empty `project[]` makes `grounding` schema-required** (populate `grounding.subject_matter` and run the protocol/manifest checks). This is independent of `public`: anchor to a repo when the skill's claims are repo-specific, regardless of whether the skill is publishable.

### `scope` — the required free-text companion

`scope` is a separate, required free-text field (not an enum). Use it for a PRD-style statement describing what this skill teaches and what it does not — for example, "Covers order reconciliation for the Sales Hub Shopify integration; does not cover payment disputes." It is not a routing enum, does not drive the project-fit filter, and does not carry the publishability role — that belongs entirely to `public`.

### Examples

```yaml
# Correct: portable abstract pattern, safe to publish
public: true

# Correct: project-anchored skill that quotes private Sales Hub internals — keep private
public: false
project:
  - handle: sales-hub
    role: source-of-truth
grounding:
  subject_matter: Shopify integration behavior in the Sales Hub repo
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

- **`boundary`** — `refactor` declares `boundary: [documentation]` to assert exclusive ownership of the refactor use-case over documentation. When refactor wins a query that also matched documentation, this entry excludes documentation from co-routing. **Note:** the field name implies "defer to documentation" but the mechanic is "exclude documentation when refactor wins." Write reason text using ownership framing: `"refactor owns this use-case exclusively; documentation does not."` See WARNING in `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Relations § boundary`.

When a skill is a specialisation of a more general skill, use `relations.broader` to express that generalisation.

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

## 3. What Evaluation Status and `portability` state do I choose?

### Evaluation Status state: the three orthogonal axes

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
- A portable skill (no `project[]`, no repo paths) AND export script covers at least one target → `readiness: scripted`
- A project-anchored skill (non-empty `project[]`, concrete repo paths) AND no export tooling yet → `readiness: declared`
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

## 4. How do I declare a skill's project membership?

`project[]` is the v8 mechanism for anchoring a skill to one or more specific projects. Each entry carries a kebab-case `handle` and a free-text `role`. `repo[]` works the same way for repo-level anchoring. Both fields replace the old `workspace_tags` flat array.

### Decision table

| Situation | Correct `project[]` / `repo[]` usage |
|---|---|
| Skill applies to every project (cross-cutting concern) | Omit `project[]` and `repo[]` (ambient) |
| Skill is anchored to one specific project | `project: [{handle: "<project-handle>", role: "source-of-truth"}]` |
| Skill is anchored to one specific repo (not necessarily one project) | `repo: [{handle: "<repo-slug>", url: "https://github.com/..."}]` |
| Skill applies to multiple projects that share a technology | Declare each project in `project[]` with its own role |
| Single-project workspace | Either omit (ambient) or declare the one project — your choice |

### Diagnostic questions

**Q: Is this skill anchored to one specific project?**
→ Yes → declare `project[]` with the project handle (this also makes `grounding` required). The router uses `project[]` for project-fit filtering.

**Q: Is this skill a cross-cutting concern (GDPR, a11y, testing patterns, general coding rules)?**
→ Omit `project[]` and `repo[]` — ambient.

**Q: Does this skill reference a specific repo's files or domain without being a single-project skill?**
→ Use `repo[]` to anchor to the repo; set `project[]` only if it is also project-anchored, and `public` on its own merits.

### Example

```yaml
# One specific project — project[] with role (makes grounding required)
project:
  - handle: sales-hub
    role: source-of-truth

# Repo-anchored (e.g. cross-project docs skill anchored to one repo)
repo:
  - handle: skill-graph
    url: https://github.com/jacob-balslev/skill-graph
```

---

## 5. Do I use `subject`, `taxonomy_domain`, `project[]`, or `routing_bundles`?

These four fields all group skills, but they answer different questions. Picking the wrong field creates misleading organization that corrodes routing quality. Use this table before adding any skill-grouping field:

| Field | Answers the question | Shape | Primary consumer |
|---|---|---|---|
| `subject` | What flat browse shelf does this skill live on? | single string from the closed 12-value enum (see `SKILL_METADATA_PROTOCOL_field-reference.md § subject`) | human browse UI, filter dropdowns, routing first-pass discriminator |
| `taxonomy_domain` | Where does this skill sit in a hierarchy for tree browsing within its `subject`? | optional slash-delimited path (e.g., `backend-engineering/integrations/shopify`) | folder-tree UI, docs site navigation |
| `project[]` / `repo[]` | Which specific project(s) or repo(s) is this skill anchored to? | array of `{handle, role}` objects | router project-fit filter, manifest `by_project` rollup |
| `routing_bundles` | Which batch-activation group does this skill belong to? | flat array (e.g., `[quality, security]`) | router batch-load by group label |

### Three rules that prevent misuse

1. **Never use `subject` for routing-bundle membership.** It's a browse shelf. If you find yourself writing "when the router sees `backend-engineering` it should load all X" — you want `routing_bundles`, not `subject`.

2. **Never use `project[]` for taxonomy.** It's a project-fit filter for project-anchored skills. If you find yourself declaring every project handle to build a grouping — you want `subject` or `taxonomy_domain`.

3. **Never use `taxonomy_domain` to filter routing.** A hierarchy helps humans find skills. The router doesn't walk it. If you want the router to match `backend-engineering/integrations/shopify` at query time, flatten it into `routing_bundles: [integrations]` or declare the project in `project[]`.

### Worked example

A Shopify skill in a project-anchored, large-library workspace:

```yaml
subject: backend-engineering                                    # "Which flat browse shelf?" (one of the 12-value enum)
taxonomy_domain: backend-engineering/integrations/shopify       # "Where in a tree?" (optional; complements subject for hierarchical browsing)
public: false                                               # "Safe to publish?" — private (carries repo-internal detail)
project:
  - handle: sales-hub                                        # "Which project?" (project-anchored ⇒ grounding required)
    role: source-of-truth
routing_bundles: [integrations]                              # "Which batch-activation group?"
```

Each field does a distinct job. None is redundant with the others. A portable skill omits `project[]`; a library with no batch-activation pattern can omit `routing_bundles`; a library that does not need a hierarchical browse view can omit `taxonomy_domain`. `subject`, `public`, and `scope` are always present because they are required by the schema.
