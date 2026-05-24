# Author One Valid SKILL.md, Quickstart

> Audience: anyone writing a single new SKILL.md for the first time.
> Time: 10-15 minutes for a competent reader.
> Scope: this is the **shortest path** from zero to a schema-valid, lint-passing v7 SKILL.md. For a full project-adoption walkthrough see [QUICKSTART-30MIN.md](./QUICKSTART-30MIN.md). For per-field semantics see [field-reference.md](./field-reference.md). For the full protocol see [../SKILL_METADATA_PROTOCOL.md](../SKILL_METADATA_PROTOCOL.md).

## Step 1, pick your encoding (the one decision you cannot skip)

The schema has **one logical contract** but **two valid physical encodings on disk**. Pick one before you start typing.

| Encoding | When to use | Shape |
|---|---|---|
| **Protocol-native** | You author skills in a protocol-aware repo (this one's `skill-graph/`). Authoring tooling can read structured types natively. | Every field a top-level YAML key. `relations`, `drift_check`, `grounding` are native YAML objects/arrays. |
| **Agent-Skills-compatible** | You author skills in the canonical library at `~/Development/skills/`, which double-duties as the public Agent-Skills release repo. | Only `name`, `description`, `license`, `compatibility`, `allowed-tools` at top level. **Everything else nested under a `metadata:` map, structured fields JSON-string-encoded.** |

Both encodings are normalized to the same in-memory shape by `scripts/lib/parse-frontmatter.js::normalizeFrontmatter()` before lint, manifest, routing, and drift tooling reads them. If you author Agent-Skills-compatible and later need a protocol-native copy, the round-trip is lossy for rich types (`docs/SKILL-MD-FORMAT-COMPATIBILITY.md`). Keep your authored copy as the canonical source.

**Default for new skills in `skill-graph/`:** protocol-native.
**Default for new skills in `~/Development/skills/`:** Agent-Skills-compatible.

## Step 2, copy the template

```bash
mkdir -p skills/<your-skill-name>
cp examples/skill-metadata-template.md skills/<your-skill-name>/SKILL.md
```

The template at `examples/skill-metadata-template.md` is a real schema-conformant skill whose subject is skill authoring. Adapt by renaming identity, rewriting body sections, and stripping every `# TEMPLATE NOTE:` YAML comment and `> **TEMPLATE NOTE:**` body blockquote (those are scaffolding).

## Step 3, fill the 13 required v7 fields

These are enforced by `skill-lint.js` against `schemas/skill.schema.json`. A skill missing any of these fails the structural gate.

| # | Field | Type | Value rule |
|---|---|---|---|
| 1 | `schema_version` | integer | Always `7` for v7 skills. |
| 2 | `name` | string | Lowercase alphanumerics, hyphens, slashes, colons. Must match parent directory name. Used as routing target by other skills. |
| 3 | `description` | string ≥ 20 chars | The routing contract. Lead with "Use when..." or "Activates for..." AND include "Do NOT use for..." (negative boundary). Write for the router, not for a human reader. |
| 4 | `version` | semver | `x.y.z`. Bump when the skill's instructional content changes. Independent of `schema_version`. |
| 5 | `type` | enum | One of: `capability` (most common), `workflow`, `router`, `overlay` (requires `extends`). |
| 6 | `category` | enum | One of the closed 6: `foundations`, `engineering`, `design`, `quality`, `agent`, `product`. Pick where a human would browse to discover it, not for routing. |
| 7 | `scope` | enum | One of: `codebase` (repo-specific, requires `grounding`), `reference` (general knowledge), `portable` (cross-repo). |
| 8 | `owner` | string | Team handle, GitHub username, or tool name. Used for review routing and stale-skill alerts. |
| 9 | `freshness` | ISO date | `YYYY-MM-DD`. Authored claim (not computed). When did you last review or update the body. |
| 10 | `drift_check` | object | At minimum `{ last_verified: "YYYY-MM-DD" }`. `truth_source_hashes` is added later by `node scripts/skill-graph-drift.js --record --apply <skill-dir>`. |
| 11 | `eval_artifacts` | enum | `none` / `planned` / `present`. Default `planned` for a new skill. Flip to `present` when an eval file exists. |
| 12 | `eval_state` | enum | `unverified` / `passing` / `monitored`. Default `unverified` for a new skill. Flip to `passing` only after a real grader run. |
| 13 | `routing_eval` | enum | `absent` / `present`. Default `absent`. Setting `present` requires populated `examples` + `anti_examples` AND a passing `node scripts/skill-graph-routing-eval.js --skill <name>` run. |

### Conditional requirements

Triggered only when the gating condition applies. Schema-enforced via `allOf`:

| Field | Required when |
|---|---|
| `extends` | `type: overlay` |
| `grounding` | `scope: codebase` |
| `superseded_by` | `stability: deprecated` |
| `keywords` | `scope: codebase` OR `routing_bundles` is set |

### Do NOT hand-author these (loop-written)

The Health Block fields are stamped by `audit`, `improve`, `evaluate`, and the dedicated graders. Leave them absent on a new skill. They become `UNVERIFIED` automatically until an audit run writes evidence: `last_audited`, `last_changed`, `structural_verdict`, `truth_verdict`, `comprehension_verdict`, `application_verdict`, `eval_score`, `eval_failed_ids`, `lint_verdict`, `drift_status`.

For the full state-by-state map of every field see [field-state-matrix.md](./field-state-matrix.md).

## Step 4, verify

```bash
node scripts/skill-lint.js --skill <your-skill-name>
```

Expected: zero errors, zero warnings. If warnings appear (e.g. legacy field values, missing recommended optionals), the skill is valid but not optimal; the lint output tells you what to add.

## Worked example A, protocol-native encoding

`skills/example-protocol-native/SKILL.md`:

```yaml
---
schema_version: 7
name: example-protocol-native
description: "Use when explaining how to apply Conway's Law to API boundary design. Activates for prompts mentioning team topologies, organizational coupling, or domain ownership boundaries. Do NOT use for individual service-design questions (use api-design) or for static org charts (use org-modeling)."
version: 0.1.0
type: capability
category: foundations
scope: reference
owner: example-author
freshness: "2026-05-24"
drift_check:
  last_verified: "2026-05-24"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
keywords:
  - Conway's Law
  - team topologies
  - API boundary
  - organizational coupling
relations:
  related:
    - api-design
  boundary: []
---

# Conway's Law for API Boundary Design

## Coverage

- Conway's Law as a forward design constraint (not just a retrospective observation)
- Mapping team boundaries to API boundaries
- The two failure modes: team boundary too coarse, team boundary too fine

## Philosophy

Conway's Law says system structure mirrors team communication structure. Applied as a constraint, it means API boundaries should not cross team boundaries without cause.
```

## Worked example B, Agent-Skills-compatible encoding

Same skill, different physical shape. Note structured fields are JSON-string-encoded under `metadata:`:

```yaml
---
name: example-agent-skills-compatible
description: "Use when explaining how to apply Conway's Law to API boundary design. Activates for prompts mentioning team topologies, organizational coupling, or domain ownership boundaries. Do NOT use for individual service-design questions (use api-design) or for static org charts (use org-modeling)."
license: MIT
allowed-tools: Read Grep
metadata:
  schema_version: 7
  version: 0.1.0
  type: capability
  category: foundations
  scope: reference
  owner: example-author
  freshness: "2026-05-24"
  drift_check: "{\"last_verified\":\"2026-05-24\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  keywords: "[\"Conway's Law\",\"team topologies\",\"API boundary\",\"organizational coupling\"]"
  relations: "{\"related\":[\"api-design\"],\"boundary\":[]}"
---

# Conway's Law for API Boundary Design

## Coverage

- Conway's Law as a forward design constraint (not just a retrospective observation)
- Mapping team boundaries to API boundaries
- The two failure modes: team boundary too coarse, team boundary too fine

## Philosophy

Conway's Law says system structure mirrors team communication structure. Applied as a constraint, it means API boundaries should not cross team boundaries without cause.
```

Two precedence rules apply during normalization (`scripts/lib/parse-frontmatter.js`):

1. A top-level field wins over a `metadata.*` field of the same name (explicit author signal wins).
2. Export-provenance keys (`skill_graph_source_repo`, `skill_graph_protocol`, `skill_graph_project`, `skill_graph_canonical_skill`, description-length book-keeping) are stripped during normalization and are not part of the contract. Authors do not write these.

## Step 5, commit and continue

After lint passes, commit one skill per commit, path-limited:

```bash
git commit --only -F /tmp/msg -- skills/<your-skill-name>/SKILL.md
```

Two follow-ups, both optional at authoring time:

- **Record truth hashes** if `scope: codebase` and you populated `grounding.truth_sources`: `node scripts/skill-graph-drift.js --record --apply skills/<your-skill-name>`. This makes the drift sentinel useful.
- **Author an eval** if you want the skill behaviorally certified: write `skills/<your-skill-name>/evals/comprehension.json` and run `node lib/audit/evaluate-skill.js --mode comprehension skills/<your-skill-name>/evals/comprehension.json`.

Neither blocks first commit. A new skill ships honestly as `eval_state: unverified`, `application_verdict: UNVERIFIED` (default by absence).

## Common mistakes

| Mistake | What it looks like | Fix |
|---|---|---|
| Picking `foundations` because the skill feels meta | `category: foundations` when the skill could plausibly fit `engineering` / `agent` / `quality` | The `foundations` gate is anti-junk-drawer. Pick another category unless the skill teaches an epistemic precondition AND cannot be plausibly assigned elsewhere. |
| Description is a summary, not a routing contract | "This skill teaches Conway's Law" | Rewrite as routing instructions: "Use when..." + "Do NOT use for..." with concrete examples. |
| Setting `eval_state: passing` without a receipt | New skill optimistically claims passing evals | Default to `unverified`. Flip to `passing` only after a real grader run produces a receipt. Same rule for `routing_eval: present`. |
| Stamping Health Block fields by hand | Author writes `structural_verdict: PASS` on first commit | Leave the Health Block absent. The audit loop writes those fields; hand-edits will be overwritten on the next `audit` run. |
| Cross-domain `boundary[]` entries | `boundary: [skill-from-different-category]` | Move to `anti_examples` + `relations.related`. The `boundary` field is for same-domain handoffs only (see `SKILL_METADATA_PROTOCOL.md § Cross-domain boundary doctrine`). |
| Placeholder sludge | `your-skill-name`, `path/to/file`, `todo` leftover from the template | Strip all template scaffolding before commit. The verification checklist in the template covers this. |

## What "valid" actually means at three levels

| Validator | Question | When |
|---|---|---|
| `skill-lint.js --skill <slug>` | Does this skill's frontmatter parse and match the schema? | Run on every commit by author. |
| `skill-lint.js` (no skill) | Does the corpus still parse? | CI-wide gate. New errors over baseline fail CI. |
| Audit loop (`audit` / `evaluate`) | Does the skill teach what it claims to teach? | Eventual. The `application_verdict` is the only verdict that certifies usefulness; new skills start `UNVERIFIED` and earn it over time. |

A first-commit skill aims to pass level 1. Levels 2 and 3 are earned later.

## Related

- [QUICKSTART-30MIN.md](./QUICKSTART-30MIN.md), full project-adoption walkthrough
- [field-state-matrix.md](./field-state-matrix.md), every field tagged human-authored / loop-written / earned / generated / deprecated / alias
- [field-reference.md](./field-reference.md), per-field semantics with examples
- [field-decision-guide.md](./field-decision-guide.md), when to choose which value
- [SKILL-MD-FORMAT-COMPATIBILITY.md](./SKILL-MD-FORMAT-COMPATIBILITY.md), the two physical encodings
- [../SKILL_METADATA_PROTOCOL.md](../SKILL_METADATA_PROTOCOL.md), the normative spec
- [../examples/skill-metadata-template.md](../examples/skill-metadata-template.md), the template to copy
