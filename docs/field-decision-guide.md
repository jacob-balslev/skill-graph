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
| Skill applies across any codebase or team with no repo-specific claims | `portable` |
| Skill is primarily a reference for a contract, spec, or document (e.g., "the metadata contract for this repo") | `reference` |
| Skill makes concrete claims about files, APIs, or behavior in a specific codebase | `codebase` |
| Skill is a starter or template that could be copied into any project | `portable` |
| Skill references specific file paths, function names, or deployment details | `codebase` |
| Skill documents abstract methodology (testing strategy, refactoring patterns) | `portable` |

### Diagnostic questions

**Q: Does my skill say "in `src/integrations/shopify/client.ts`" or similar?**
→ `codebase`

**Q: Does my skill say "in the codebase" without naming specific files?**
→ `portable`

**Q: Is my skill's primary purpose to be a reference for a contract document (like a schema or this metadata contract)?**
→ `reference`

**Q: Would this skill work unchanged if copied into a completely different project?**
→ `portable` (if yes), `codebase` (if no)

### Important constraint

`scope: codebase` requires a populated `grounding` block. The schema enforces this — `scripts/skill-lint.js` will reject a codebase-scoped skill without grounding. If you choose `codebase`, populate `grounding` before committing.

### Migration from v1

The v1 names were renamed in schema_version 2 (SH-5784). The old names are hard errors under the v2 schema.

| v1 value | v2 value |
|---|---|
| `generic` | `portable` |
| `operational` | `codebase` |
| `reference` | `reference` (unchanged) |

### Examples

```yaml
# Correct: skill about abstract testing patterns
scope: portable

# Correct: skill that references this repo's contract documents
scope: reference

# Correct: skill that covers Shopify integration in a specific codebase
scope: codebase
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
| `present` | At least one eval artifact exists on disk. `scripts/skill-lint.js` verifies it. |

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

**Anti-pattern.** Do not set `eval_state: passing` without an actual passing run. Do not set `eval_artifacts: present` without a real file — the lint script checks. Do not claim `routing_eval: present` when the eval only checks content, not routing.

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
| `scripted` | Export tooling exists for at least one listed target (e.g., `scripts/export-skill.js` covers `agent-skills`). |
| `verified` | Export tooling exists AND the exported output has been verified in the target runtime with a receipt artifact. |

**Quick heuristic:**
- `scope: portable` with no repo paths AND export script covers at least one target → `readiness: scripted`
- `scope: codebase` with concrete repo paths AND no export tooling yet → `readiness: declared`
- Export tooling ran AND the output was loaded into the target runtime AND passed a smoke test → `readiness: verified`

### `portability.targets` decision

`targets` declares which runtimes the skill is portable to. (Renamed from `exports` in v2.)

| Target | Include when |
|---|---|
| `agent-skills` | The skill can be transformed to a valid Agent Skills file via `scripts/export-skill.js`. |
| `cursor` | The skill is structured for use in Cursor (export tooling not yet implemented — this is a compatibility goal). |
| `windsurf` | The skill targets Windsurf (export tooling not yet implemented). |
| `copilot` | The skill targets GitHub Copilot (export tooling not yet implemented). |
| `agents-md` | The skill is compatible with the `AGENTS.md` format. |

**If in doubt:** Include only `agent-skills` until the other export transforms are implemented. See `README.md` for current export tooling status.

### Migration from v1

| v1 `portability.level` | v2 `portability.readiness` |
|---|---|
| `high` | `scripted` (if an export script covers at least one target) else `declared` |
| `medium` | `scripted` (if an export script covers at least one target) else `declared` |
| `low` | `declared` |

`portability.exports` was renamed to `portability.targets`. Values are unchanged.

```yaml
# Minimal: only agent-skills export is implemented
portability:
  readiness: scripted
  targets:
    - agent-skills

# Aspirational: declares intent for future export targets
portability:
  readiness: scripted
  targets:
    - agent-skills
    - cursor
    - windsurf
    - copilot
```
