# Skill Graph Field Decision Guide

> Decision tables for the three hardest field choices in a `SKILL.md` file.
> For full field semantics and rules, see `docs/field-reference.md`.
> For field groups and conditional requiredness, see `docs/metadata-contract.md`.

---

## 1. Which `scope` do I use?

`scope` tells routers and auditors whether your skill is portable, documentation-backed, or grounded in a specific codebase.

### Decision table

| Situation | Correct `scope` |
|---|---|
| Skill applies across any codebase or team with no repo-specific claims | `generic` |
| Skill is primarily a reference for a contract, spec, or document (e.g., "the metadata contract for this repo") | `reference` |
| Skill makes concrete claims about files, APIs, or behavior in a specific codebase | `operational` |
| Skill is a starter or template that could be copied into any project | `generic` |
| Skill references specific file paths, function names, or deployment details | `operational` |
| Skill documents abstract methodology (testing strategy, refactoring patterns) | `generic` |

### Diagnostic questions

**Q: Does my skill say "in `src/integrations/shopify/client.ts`" or similar?**
→ `operational`

**Q: Does my skill say "in the codebase" without naming specific files?**
→ `generic`

**Q: Is my skill's primary purpose to be a reference for a contract document (like a schema or this metadata contract)?**
→ `reference`

**Q: Would this skill work unchanged if copied into a completely different project?**
→ `generic` (if yes), `operational` (if no)

### Important constraint

`scope: operational` requires a populated `grounding` block. The schema enforces this — `scripts/skill-lint.js` will reject an operational skill without grounding. If you choose `operational`, populate `grounding` before committing.

### Examples

```yaml
# Correct: skill about abstract testing patterns
scope: generic

# Correct: skill that references this repo's contract documents
scope: reference

# Correct: skill that covers Shopify integration in a specific codebase
scope: operational
grounding:
  domain_object: Shopify integration behavior
  grounding_mode: repo_specific
  # ...
```

---

## 2. Which `relations.*` key do I use?

The four relation keys serve distinct purposes. Using the wrong key creates misleading graph edges.

### Decision table

| Situation | Correct key |
|---|---|
| The other skill covers related topics a reader should know about | `adjacent` |
| The other skill covers topics my skill explicitly does NOT own | `boundary` |
| The other skill should be co-loaded to verify my skill's claims | `verify_with` |
| My skill cannot function correctly without the other skill's concepts | `depends_on` |
| An overlay: this skill extends another skill's base behavior | Use `extends` field instead |

### Key-by-key guidance

#### `adjacent` — related reading, no dependency

Use when:
- The other skill is topically related and a reader of your skill would likely benefit from reading it.
- There is no activation dependency or ownership claim — just discoverability.

Do NOT use when:
- You are actually depending on the other skill (`depends_on` is correct).
- The other skill covers something you explicitly don't own (`boundary` is correct).

```yaml
relations:
  adjacent:
    - webhook-integration   # related topic, useful co-reading
    - api-rate-limiting     # reader may also want this context
```

#### `boundary` — anti-ownership, wrong-skill routing protection

Use when:
- A router might confuse your skill with the boundary skill and incorrectly activate yours.
- You want to explicitly declare "I don't own that — go to X instead."

Do NOT use when:
- The other skill is merely unrelated — omit rather than adding every non-owner.
- The other skill is a dependency — that is `depends_on`.

```yaml
relations:
  boundary:
    - fulfillment   # fulfillment is NOT owned by this skill; route to fulfillment skill instead
```

#### `verify_with` — co-load for verification

Use when:
- Running your skill's verification steps alongside the target skill improves correctness or coverage.
- The two skills are used together in audit or review pipelines.

Do NOT use when:
- You merely recommend the other skill as reading — use `adjacent`.
- The other skill is a hard dependency — use `depends_on`.

```yaml
relations:
  verify_with:
    - test-coverage   # co-load for verification during audits
```

#### `depends_on` — explicit dependency

Use when:
- Your skill's instructions or concepts build on the other skill's foundation.
- An agent loading your skill without the dependency skill would likely produce incorrect results.

Do NOT use when:
- The relationship is just "related" — use `adjacent`.
- The relationship is "should verify together" — use `verify_with`.

```yaml
relations:
  depends_on:
    - api-key-management   # this skill requires API key management concepts to function
```

### Combined example

```yaml
relations:
  adjacent:
    - webhook-integration   # related: reader may want this context
  boundary:
    - fulfillment           # not owned here: route to fulfillment skill
  verify_with:
    - test-coverage         # co-load during audits
  depends_on:
    - api-key-management    # hard dependency: skill builds on this
```

### Validation

All relation targets must be the `name` of an existing skill in the library. `scripts/skill-lint.js` rejects dangling targets (targets that point to non-existent skills).

---

## 3. What `eval_status` and `portability` state do I choose?

### `eval_status` decision

The decision tree is about whether eval artifacts exist and are verified.

```
Does an eval artifact exist for this skill?
  NO  →  Has eval work been intentionally deferred?
            YES → pending
            NO  → none
  YES →  Is the eval actively maintained in a live toolchain?
            YES → active
            NO  →  Is there a verified passing run?
                    YES → passing
                    NO  →  Does the eval include trigger coverage checks?
                              YES → evals+trigger
                              NO  → evals
```

| Value | Use when |
|---|---|
| `none` | No eval planned or authored. The skill is complete without evals (rare). |
| `pending` | Evals are planned but not yet authored. Temporary state — move to `evals` once artifacts ship. |
| `evals` | At least one eval artifact exists alongside the skill. This is the minimum verified state. |
| `evals+trigger` | Eval artifacts exist AND you are actively checking trigger/routing coverage. |
| `passing` | Eval artifacts exist AND you have a passing verification run receipt. |
| `active` | Eval artifacts exist, pass, AND are run continuously in a live toolchain. |

**Anti-pattern.** Do not set `passing` without an actual passing run. Do not use `evals` without a real eval artifact — `scripts/skill-lint.js` checks that the artifact file exists.

### `portability` level decision

The `level` field is a coarse-grained rating of overall portability.

| Level | Use when |
|---|---|
| `high` | Skill content, instructions, and examples work unchanged in any agent runtime. No repo-specific references. |
| `medium` | Skill works in most runtimes but may need minor adaptation (e.g., tool names differ, one example is framework-specific). |
| `low` | Skill is tightly coupled to a specific runtime, framework, or codebase. Exporting requires significant rework. |

**Quick heuristic:**
- `scope: generic` with no repo paths → `level: high`
- `scope: generic` but references framework-specific patterns → `level: medium`
- `scope: operational` with concrete repo paths → `level: low`

### `portability.exports` decision

`exports` declares which runtimes the skill can be exported to.

| Export target | Include when |
|---|---|
| `agent-skills` | The skill can be transformed to a valid Agent Skills file via `scripts/export-skill.js`. |
| `cursor` | The skill is structured for use in Cursor (export tooling not yet implemented — this is a compatibility goal). |
| `windsurf` | The skill targets Windsurf (export tooling not yet implemented). |
| `copilot` | The skill targets GitHub Copilot (export tooling not yet implemented). |
| `agents-md` | The skill is compatible with the `AGENTS.md` format. |

**If in doubt:** Include only `agent-skills` until the other export transforms are implemented. See `README.md` for current export tooling status.

```yaml
# Minimal: only agent-skills export is implemented
portability:
  level: high
  exports:
    - agent-skills

# Aspirational: declares intent for future export targets
portability:
  level: medium
  exports:
    - agent-skills
    - cursor
    - windsurf
    - copilot
```
