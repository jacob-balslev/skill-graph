---
name: skill-scaffold
description: "Use when creating a new SKILL.md from scratch, restructuring a draft before it becomes a stable skill, or teaching another author the canonical Skill Metadata Protocol frontmatter and body structure. Covers schema-conformant frontmatter, v8 classification, body layout by skill intent, semantic-layer discipline (description vs Coverage), teaching-layer mechanics (TEMPLATE NOTE blockquotes), focused authoring gates, and routing-eval honesty. Do NOT use when modifying an already-written skill (edit it directly), when writing general technical documentation, or when fixing a malformed skill detected by health tooling (use `skill-infrastructure` for systematic library health, not authoring scaffold help). Do NOT use for refactor my existing skill to be more concise. Do NOT use for my skill's routing isn't activating — why? Do NOT use for audit my skill library for stale frontmatter. Do NOT use for write a developer guide for the contributor docs. Do NOT use for review this skill's content for correctness."
license: MIT
compatibility: "Markdown, YAML, JSON Schema"
allowed-tools: Read Grep Bash Write Edit
metadata:
  subject: agent-ops
  deployment_target: portable
  scope: "Creating a new SKILL.md from scratch, restructuring a draft before it becomes a stable skill, or teaching the canonical Skill Metadata Protocol frontmatter and body structure — schema-conformant frontmatter, v8 classification, body layout by skill intent, semantic-layer discipline (description vs Coverage), teaching-layer mechanics (TEMPLATE NOTE blockquotes), focused authoring gates, and routing-eval honesty. Portable across any Skill-Metadata-Protocol library; principle-grounded, not repo-bound. Excludes modifying an already-written skill (edit directly), general technical documentation, and fixing a malformed skill detected by health tooling (skill-infrastructure)."
  taxonomy_domain: agent/skill-system
  stability: experimental
  keywords: "[\"skill authoring\",\"new skill\",\"writing a skill\",\"skill scaffold\",\"skill template\",\"skill frontmatter\",\"skill metadata protocol\",\"v8 classification\",\"description vs coverage\",\"routing eval\"]"
  examples: "[\"I'm writing a new skill from scratch — where do I start?\",\"how do I choose subject and deployment_target for a new skill?\",\"what's the difference between description and the ## Coverage section?\",\"scaffold a new skill that teaches react component composition patterns\",\"I copied skill-metadata-template.md but my new skill won't pass lint — help\",\"draft frontmatter for a skill that owns deployment rollback\",\"how do I strip teaching annotations from the template before commit?\",\"should I flip routing_eval to present on my new skill?\"]"
  anti_examples: "[\"refactor my existing skill to be more concise\",\"my skill's routing isn't activating — why?\",\"audit my skill library for stale frontmatter\",\"write a developer guide for the contributor docs\",\"review this skill's content for correctness\"]"
  relations: "{\"boundary\":[{\"skill\":\"refactor\",\"reason\":\"refactor is behaviour-preserving modification of existing code or skills; skill-scaffold creates a new skill from scratch\"},{\"skill\":\"skill-router\",\"reason\":\"skill-router dispatches between existing skills at request time; skill-scaffold is the authoring-time guide for a NEW skill\"},{\"skill\":\"skill-infrastructure\",\"reason\":\"skill-infrastructure runs health tooling across the entire skill library after authoring; skill-scaffold is the authoring-time guide for creating a single new skill before it joins the library\"}],\"related\":[\"naming-conventions\"],\"verify_with\":[]}"
  grounding: "{\"subject_matter\":\"Authoring a new SKILL.md against Skill Metadata Protocol v8\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"https://github.com/jacob-balslev/skill-graph/blob/main/examples/skill-metadata-template.md\",\"https://github.com/jacob-balslev/skill-graph/blob/main/skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md\",\"https://github.com/jacob-balslev/skill-graph/blob/main/schemas/SKILL_METADATA_PROTOCOL_schema.json\",\"https://github.com/jacob-balslev/skill-graph/blob/main/skill-metadata-protocol/field-reference.md\"],\"failure_modes\":[\"placeholder_sludge\",\"cargo_cult_meta_sections\",\"description_coverage_collapse\",\"authoring_gate_skipped\",\"inflated_routing_eval\",\"retired_field_reintroduced\"],\"evidence_priority\":\"equal\"}"
  mental_model: "Skill scaffolding is protocol-backed authoring, not free-form prompt writing. The scaffold separates the routing contract, field contract, concept model, grounding evidence, body sections, and verification gates so a new skill becomes a routable graph node rather than a decorative Markdown file."
  purpose: "This skill prevents new SKILL.md files from inheriting template comments, false eval claims, stale schema fields, dangling relations, or vague descriptions. It turns authoring into a reproducible sequence: start from the canonical template, choose the v8 classification and body shape, adapt the contract, remove teaching annotations, and verify before publishing."
  boundary: "This skill is for authoring a new skill or restructuring a draft before it becomes a stable node. It is not for routine edits to an existing skill, router debugging, bulk graph audits, general documentation, or correctness review of an already-authored skill's domain content."
  analogy: "A skill scaffold is like construction formwork: it gives the new structure its shape while the concrete sets, but the temporary braces must be removed before the finished building is occupied."
  misconception: "The common mistake is treating the template as copy text to fill in. A scaffold is an authoring instrument: fields must be chosen for the new skill, template notes must disappear, and every health or eval claim must match evidence from the current change."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/skill-scaffold/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Skill Scaffold

## Coverage

- Authoring flow: copy → rename → classify → adapt → strip authoring scaffolding (`# TEMPLATE NOTE:` lines and `> **TEMPLATE NOTE:**` blockquotes only; keep field-purpose comments) → verify → commit
- Frontmatter identity: `name`, `description`, `subject`, `deployment_target`, free-text `scope`, `taxonomy_domain` when useful, activation fields, relations, grounding, and the five flat Understanding fields when `comprehension_state` is present in the sidecar
- Sidecar identity: `schema_version`, `version`, `owner`, `freshness`, `drift_check`, eval status, verdicts, portability, and lifecycle in sibling `audit-state.json`
- Body-shape selection: how to choose sections based on what the skill teaches and how the agent will use it, without relying on retired `type` archetypes
- Understanding fields: when to add `mental_model`, `purpose`, `boundary`, `analogy`, and `misconception`; the legacy nested `concept` block is retired
- Semantic-layer discipline: how `description:` (≤ 3 sentences, pushy, boundary-aware routing contract) differs from `## Coverage` (bulleted scope map of distinct topics) and why each must stay in its own layer
- Teaching-layer mechanics: two distinct comment conventions with opposite lifecycles — `# TEMPLATE NOTE:` lines and `> **TEMPLATE NOTE:**` blockquotes are authoring scaffolding (strip on derivation), while field-purpose comments (no `TEMPLATE NOTE:` prefix; sit above each field documenting its purpose, allowed values, and when-to-use) are co-located documentation (keep in production). See `~/Development/skill-graph/skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Inline field comments — the authoring convention`
- Focused authoring gates: passing lightweight skill lint, then running protocol/routing checks that match the fields you changed
- Routing-eval honesty: defaulting to `routing_eval: absent` and only flipping to `present` after `node bin/skill-graph.js routing-eval --skill <name> --only-asserted` exits 0
- Grounding declarations: when to populate `grounding.truth_sources`, when URL truth sources are acceptable, and how local truth-source hashes differ from external references

## Philosophy

A scaffold teaches by example, not by placeholder. A concrete, internally consistent specimen of a finished skill is a more reliable authoring reference than any amount of abstract instruction. The teaching layer — meta-commentary about how to read and adapt the scaffold — must live in structurally distinct slots that disappear when the author tightens a new skill, never in the `## H2` section slots that AI agents copy verbatim. Authoring is also a verification-first discipline: lightweight lint is the first smoke test, but protocol consistency, routing evals, drift checks, and human review are what answer "did I do this right?" for the full contract.

## Authoring Flow

The six steps are non-negotiable; skipping any step produces a skill that lints in your editor but breaks on someone else's machine.

**Step 0 (precondition):** Before authoring, search the existing skill library and any project-specific redundancy registry. If the intended subject is already covered, either improve the existing skill or document the new grounding evidence that justifies a separate node. Re-authoring a duplicate skill without contradicting evidence wastes context and weakens routing precision.

1. **Copy** the canonical template from the Skill Graph tooling repo's `examples/skill-metadata-template.md` to `skills/<your-skill-name>/SKILL.md`. Do not rename in-place; the template stays as the canonical specimen.
2. **Rename** identity fields: `name`, `description`, `subject`, `deployment_target`, `scope`, `keywords`, `examples`, `anti_examples`, `paths` (if applicable), and the body title. Every reference to "skill-metadata-template" should be gone.
3. **Classify** the skill. Choose the primary `subject`, optional `subjects[]` when the skill genuinely spans two shelves, `deployment_target`, free-text `scope`, and `taxonomy_domain` only when the subject shelf is crowded enough to need a sub-path.
4. **Adapt** body sections to your skill's intent. Keep `## Coverage`, a short model/stance section such as `## Philosophy`, the main workflow/tables/checklists the agent will actually use, `## Verification`, and `## Do NOT Use When`. Remove sections that do not apply — do not keep placeholder content.
5. **Decide understanding and grounding.** Add Understanding fields only when the skill needs concept transfer and the content is ready to be graded. Add `grounding.truth_sources` when the skill is anchored to a protocol, spec, codebase, or vendor/source document; use public URLs when the release repo does not contain the source files.
6. **Strip authoring scaffolding while preserving field-purpose comments.** The template carries two distinct comment conventions with opposite lifecycles (see `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md § Inline field comments — the authoring convention`):
   - **STRIP** every `> **TEMPLATE NOTE:**` body blockquote and every YAML comment line beginning with `# TEMPLATE NOTE:`. These are scaffolding *about the template itself* — guidance about how to use the template — never field semantics. Shipping them in a derived skill is the most common authoring mistake.
   - **KEEP** every YAML comment line that documents a field's purpose, allowed values, or when-to-use. These have no `TEMPLATE NOTE:` prefix and read like `# subject: primary browse shelf — what the skill teaches.` followed by the enum values. They are co-located documentation, not scaffolding. They stay so the derived skill's frontmatter is self-explanatory to readers and to cold-start agents who would otherwise have to open `~/Development/skill-graph/skill-metadata-protocol/field-reference.md` to decode each field.

   Verification (both must hold):
   - `grep -n "TEMPLATE NOTE" skills/<your-skill>/SKILL.md` returns zero hits — scaffolding stripped.
   - `grep -c "^\s*#" skills/<your-skill>/SKILL.md` returns a count similar to the template's (roughly 30-50 depending on which optional fields you kept) — field-purpose comments preserved.
7. **Verify** by running the gate sequence: focused `node scripts/skill-lint.js skills/<your-skill>` (must show 0 errors), `node scripts/check-protocol-consistency.js` for protocol-tier changes, and (if you populated `examples` and `anti_examples`) the routing-eval harness (verdict PASS before flipping `routing_eval` to `present`).

## Body Structure Selection

Pick body sections from the skill's intent and expected use, not from the retired `type` archetype axis.

| Skill intent | Use when | Body sections to include |
|---|---|---|
| Teaches a reusable capability | The user may jump to the section they need | `## Coverage`, a model/stance section, decision tables, `## Verification`, `## Do NOT Use When` |
| Orchestrates a sequence | The agent must follow steps in order every time | `## Coverage`, `## Workflow` with numbered steps, checkpoints, `## Verification`, `## Do NOT Use When` |
| Routes between skills | The task is choosing the owner skill or surfacing coverage gaps | `## Coverage`, `## Routing Rules`, examples/anti-examples, `## Verification`, `## Do NOT Use When` |
| Specializes a broader skill | The skill narrows a parent discipline for one project, stack, or domain | `## Coverage`, the override rules, relation/grounding notes, inherited boundaries, `## Verification` |

The fastest way to pick wrong is to let an old archetype name drive the body. Current v8 classification tells where the skill belongs and where it deploys; the body still has to be designed for how the agent will use the instruction.

## Semantic-Layer Discipline

`description` and `## Coverage` look like duplicates and are not. They live in different layers and serve different consumers.

- `description` (≤ 3 sentences, frontmatter): the **routing contract**. Pushy, specific, boundary-aware. Tells a router whether to activate this skill for a given query. Should include an explicit "Do NOT use for…" boundary clause so the router doesn't over-activate.
- `## Coverage` (bulleted list, body): the **scope map**. Enumerates the distinct topics this skill teaches. The reader scans `## Coverage` to decide whether to read further. Should NOT restate `description` as a single line; should NOT be a checklist of placeholder commitments.

If you can drop your `description` into `## Coverage` without changing meaning, both layers are wrong. Rewrite `description` until it is too pushy for the body, then rewrite `## Coverage` until it is too enumerative for the description.

## Common Authoring Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| Placeholder sludge | `description: "Use when... for..."`, paths like `your/file.md`, `todo` markers | Search the file for `your-`, `path/to/`, `todo`, `lorem`. Zero hits before commit. |
| Cargo-culted teaching layer | `> **TEMPLATE NOTE:**` blocks survive into derived skill | `grep -n "TEMPLATE NOTE" skills/<name>/SKILL.md` returns nothing |
| Description-Coverage collapse | `description` and `## Coverage` say the same thing in different shapes | Rewrite description as routing contract, Coverage as scope map (see § Semantic-Layer Discipline) |
| Inflated routing_eval | `routing_eval: present` set without running the harness | Default to `absent`. Flip to `present` only after `node bin/skill-graph.js routing-eval --skill <name> --only-asserted` returns PASS |
| Stale protocol version | `schema_version: 7` paired with retired schema names, old concept-block advice, or the deprecated `audit_verdict` aggregate | Update truth sources, protocol labels, understanding fields, Audit Status fields, and migration notes together |
| Retired archetype language | New skill guidance asks for `type: capability` / `workflow` / `router` / `overlay` | Replace with v8 `subject`, `deployment_target`, free-text `scope`, and body structure chosen by intent |
| Anti-examples for skills that don't exist | `anti_examples` references skills not in the library | Either author those skills first or use existing starter names |
| Lint-skipped commit | New skill is committed without focused lint | Run `node scripts/skill-lint.js skills/<name>` before every commit; fix all errors |

## Verification

Use this checklist as the authoring gate before committing a skill. Every item must pass.

- [ ] Every retained field has a real reason to exist in the new skill
- [ ] Every removed field was removed because it is retired, irrelevant to the new skill, or replaced by the sidecar contract
- [ ] Body sections match the skill's intent and expected agent use
- [ ] `description:` is ≤ 3 sentences, contains pushy trigger phrases, and names an explicit negative boundary
- [ ] `## Coverage` is a scope map of distinct topics, not a one-line restate of the description
- [ ] `drift_check` is an object with `last_verified`; local `truth_source_hashes` are recorded only when the drift tool can compute them, while URL truth sources remain explicit but external-unhashed
- [ ] Understanding fields are either honestly populated or omitted with `comprehension_state` absent
- [ ] `compatibility` is an object (not a free-text string) when present
- [ ] `eval_artifacts`, `eval_state`, `routing_eval` reflect the actual skill state — no inflation
- [ ] All `relations` entries point to skills that exist in the target repo; `boundary` entries with non-obvious rationale use the `{skill, reason}` form
- [ ] No placeholder sludge (`your-skill-name`, `path/to/file`, `todo`) remains
- [ ] No `> **TEMPLATE NOTE:**` blockquotes or `# TEMPLATE NOTE:` YAML comments remain — scaffolding fully stripped (`grep -n "TEMPLATE NOTE" skills/<name>/SKILL.md` returns zero hits)
- [ ] Field-purpose comments above each frontmatter field PRESERVED — the derived skill carries the same kind of `# fieldname: purpose / allowed values` comment block the template had for each retained field. `grep -c "^\s*#" skills/<name>/SKILL.md` is roughly the same magnitude as the template's, not zero
- [ ] `node scripts/skill-lint.js skills/<name>` returns 0 errors against the new skill
- [ ] `node scripts/check-protocol-consistency.js` passes C1-C5 and C7-C8
- [ ] If `routing_eval: present`, `node bin/skill-graph.js routing-eval --skill <name> --only-asserted` returns verdict PASS

## Do NOT Use When

| Use instead | When |
|---|---|
| Direct documentation work | Writing general technical documentation (guides, tutorials, references) — not a skill specifically |
| `refactor` | Modifying an existing skill's content while preserving its identity |
| `skill-infrastructure` | Auditing the metadata health of skills already in the library |
| `skill-router` | Diagnosing why a router doesn't activate an existing skill on a given query |
| `code-review` | Reviewing the technical content of a skill (correctness, clarity) once authored |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops`
- Deployment: `portable`
- Domain: `agent/skill-system`
- Scope: Creating a new SKILL.md from scratch, restructuring a draft before it becomes a stable skill, or teaching the canonical Skill Metadata Protocol frontmatter and body structure — schema-conformant frontmatter, v8 classification, body layout by skill intent, semantic-layer discipline (description vs Coverage), teaching-layer mechanics (TEMPLATE NOTE blockquotes), focused authoring gates, and routing-eval honesty. Portable across any Skill-Metadata-Protocol library; principle-grounded, not repo-bound. Excludes modifying an already-written skill (edit directly), general technical documentation, and fixing a malformed skill detected by health tooling (skill-infrastructure).

**When to use**
- I'm writing a new skill from scratch — where do I start?
- how do I choose subject and deployment_target for a new skill?
- what's the difference between description and the ## Coverage section?
- scaffold a new skill that teaches react component composition patterns
- I copied skill-metadata-template.md but my new skill won't pass lint — help
- draft frontmatter for a skill that owns deployment rollback
- how do I strip teaching annotations from the template before commit?
- should I flip routing_eval to present on my new skill?

**Not for**
- refactor my existing skill to be more concise
- my skill's routing isn't activating — why?
- audit my skill library for stale frontmatter
- write a developer guide for the contributor docs
- review this skill's content for correctness
- Owned by `refactor`
- Owned by `skill-router`
- Owned by `skill-infrastructure`

**Related skills**
- Related: `naming-conventions`

**Concept**
- Mental model: Skill scaffolding is protocol-backed authoring, not free-form prompt writing. The scaffold separates the routing contract, field contract, concept model, grounding evidence, body sections, and verification gates so a new skill becomes a routable graph node rather than a decorative Markdown file.
- Purpose: This skill prevents new SKILL.md files from inheriting template comments, false eval claims, stale schema fields, dangling relations, or vague descriptions. It turns authoring into a reproducible sequence: start from the canonical template, choose the v8 classification and body shape, adapt the contract, remove teaching annotations, and verify before publishing.
- Boundary: This skill is for authoring a new skill or restructuring a draft before it becomes a stable node. It is not for routine edits to an existing skill, router debugging, bulk graph audits, general documentation, or correctness review of an already-authored skill's domain content.
- Analogy: A skill scaffold is like construction formwork: it gives the new structure its shape while the concrete sets, but the temporary braces must be removed before the finished building is occupied.
- Common misconception: The common mistake is treating the template as copy text to fill in. A scaffold is an authoring instrument: fields must be chosen for the new skill, template notes must disappear, and every health or eval claim must match evidence from the current change.

**Grounding**
- Mode: `hybrid`
- Truth sources: `https://github.com/jacob-balslev/skill-graph/blob/main/examples/skill-metadata-template.md`, `https://github.com/jacob-balslev/skill-graph/blob/main/skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md`, `https://github.com/jacob-balslev/skill-graph/blob/main/schemas/SKILL_METADATA_PROTOCOL_schema.json`, `https://github.com/jacob-balslev/skill-graph/blob/main/skill-metadata-protocol/field-reference.md`

**Keywords**
- `skill authoring`, `new skill`, `writing a skill`, `skill scaffold`, `skill template`, `skill frontmatter`, `skill metadata protocol`, `v8 classification`, `description vs coverage`, `routing eval`

<!-- skill-graph-context:end -->
