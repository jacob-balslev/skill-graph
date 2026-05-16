---
name: skill-scaffold
description: "Use when creating a new SKILL.md from scratch, adapting an existing skill to a different archetype, or teaching another author the canonical Skill Metadata Protocol frontmatter and body structure. Covers schema-conformant frontmatter, archetype-aware body layout, semantic-layer discipline (description vs Coverage), teaching-layer mechanics (TEMPLATE NOTE blockquotes), the lint-first authoring gate, and the routing-eval honesty rule. Do NOT use when modifying an already-written skill (edit it directly), when writing general technical documentation (use `documentation`), or when fixing a malformed skill detected by lint (use `graph-audit` for systematic library health, not authoring scaffold help)."
license: MIT
compatibility: "Markdown, YAML, JSON Schema"
allowed-tools: Read Grep Bash Write Edit
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: agent
  domain: agent/skill-system
  scope: reference
  owner: skill-graph-maintainer
  freshness: "2026-05-04"
  drift_check: "{\"last_verified\":\"2026-05-14\",\"truth_source_hashes\":{\"examples/skill-metadata-template.md\":\"42b3185ebf53f9efc6a32977ee9408efce0957c0a7ed62cabca97cb83c33600a\",\"schemas/skill.v4.schema.json\":\"e83d6be8b1314488b39b8c7bec2784d6459980d3f9965be68ad1c9a53865622d\",\"docs/skill-metadata-protocol.md\":\"08ad662c5f470fac337aa559dacd0b9e882be7df8d7918f20a5d4e3aaaaa2ed7\",\"SKILL_AUDIT_CHECKLIST.md\":\"4056dcbee84a5d160b0d0e7c7f840279e9382bfccbdb31873da95cdf44c8f1af\"}}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"skill authoring\",\"new skill\",\"writing a skill\",\"skill scaffold\",\"skill template\",\"skill frontmatter\",\"skill graph contract\",\"capability or workflow\",\"description vs coverage\",\"archetype selection\",\"skill body layout\",\"teaching layer\",\"placeholder sludge\",\"cargo cult meta sections\",\"lint first authoring\",\"routing eval honesty\"]"
  examples: "[\"I'm writing a new skill from scratch — where do I start?\",\"how do I pick between capability and workflow for my skill type?\",\"what's the difference between description and the ## Coverage section?\",\"scaffold a new skill that teaches react component composition patterns\",\"I copied skill-metadata-template.md but my new skill won't pass lint — help\",\"draft frontmatter for a workflow skill that owns deployment rollback\",\"how do I strip teaching annotations from the template before commit?\",\"should I flip routing_eval to present on my new skill?\"]"
  anti_examples: "[\"refactor my existing skill to be more concise\",\"my skill's routing isn't activating — why?\",\"audit my skill library for stale frontmatter\",\"write a developer guide for the contributor docs\",\"review this skill's content for correctness\"]"
  relations: "{\"boundary\":[{\"skill\":\"refactor\",\"reason\":\"refactor is behaviour-preserving modification of existing code or skills; skill-scaffold creates a new skill from scratch\"},{\"skill\":\"skill-router\",\"reason\":\"skill-router dispatches between existing skills at request time; skill-scaffold is the authoring-time guide for a NEW skill\"},{\"skill\":\"graph-audit\",\"reason\":\"graph-audit verifies the authored metadata of an existing skill; skill-scaffold is the authoring-time guide before a skill exists\"},{\"skill\":\"documentation\",\"reason\":\"documentation owns durable prose for human readers; skill-scaffold owns the skill-authoring contract specifically\"}],\"related\":[\"naming-conventions\"],\"verify_with\":[\"documentation\"]}"
  grounding: "{\"domain_object\":\"Authoring a new SKILL.md against Skill Metadata Protocol v4\",\"grounding_mode\":\"repo_specific\",\"truth_sources\":[\"examples/skill-metadata-template.md\",\"schemas/skill.v4.schema.json\",\"docs/skill-metadata-protocol.md\",\"SKILL_AUDIT_CHECKLIST.md\"],\"failure_modes\":[\"placeholder_sludge\",\"cargo_cult_meta_sections\",\"description_coverage_collapse\",\"authoring_gate_skipped\",\"inflated_routing_eval\"],\"evidence_priority\":\"repo_code_first\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":180,\"review_cadence\":\"quarterly\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/skill-scaffold/SKILL.md
---

# Skill Scaffold

## Coverage

- Authoring flow: copy → rename → adapt → strip teaching annotations → verify → commit
- Frontmatter identity: `name`, `description`, `version`, `type`, `category`, `scope`, `owner`, plus the eval-health triple and `drift_check` required by every Skill Metadata Protocol skill
- Archetype selection: how to pick between `capability`, `workflow`, `router`, and `overlay` and which `## H2` body sections each archetype requires
- Semantic-layer discipline: how `description:` (≤ 3 sentences, pushy, boundary-aware routing contract) differs from `## Coverage` (bulleted scope map of distinct topics) and why each must stay in its own layer
- Teaching-layer mechanics: how to use `> **TEMPLATE NOTE:**` blockquotes and `# TEMPLATE NOTE:` YAML comments to teach without cargo-culting meta sections into derived skills
- Lint-first authoring gate: passing `node scripts/skill-lint.js --strict` against your new skill before commit, every time, no exceptions
- Routing-eval honesty: defaulting to `routing_eval: absent` and only flipping to `present` after `node scripts/skill-graph-routing-eval.js --skill <name>` exits 0
- Grounding declarations: when to populate `grounding.truth_sources` vs leaving the block off, and how the drift sentinel consumes recorded `truth_source_hashes`

## Philosophy

A scaffold teaches by example, not by placeholder. A concrete, internally consistent specimen of a finished skill is a more reliable authoring reference than any amount of abstract instruction. The teaching layer — meta-commentary about how to read and adapt the scaffold — must live in structurally distinct slots that disappear when the author tightens a new skill, never in the `## H2` section slots that AI agents copy verbatim. Authoring is also a *lint-first* discipline: the lint output is the primary debugging surface for new skills, deliberately verbose, and the canonical answer to "did I do this right?" — not a senior reviewer's pattern-match.

## Authoring Flow

The five steps are non-negotiable; skipping any step produces a skill that lints in your editor but breaks on someone else's machine.

1. **Copy** `examples/skill-metadata-template.md` to `skills/<your-skill-name>/SKILL.md`. Do not rename in-place; the template stays as the canonical specimen.
2. **Rename** identity fields: `name`, `description`, `category` (if used), `keywords`, `examples`, `anti_examples`, `paths` (if applicable), and the body title. Every reference to "skill-metadata-template" should be gone.
3. **Adapt** body sections to your skill's subject. Match the `## H2` layout to your declared archetype per `docs/skill-metadata-protocol.md § Archetype section map`. Remove sections that do not apply — do not keep them with placeholder content.
4. **Strip** every `> **TEMPLATE NOTE:**` body blockquote and every `# TEMPLATE NOTE:` YAML comment. They are authoring scaffolding; shipping them in a derived skill is the most common authoring mistake. Run `grep -n "TEMPLATE NOTE" skills/<your-skill>/SKILL.md` to confirm zero hits.
5. **Verify** by running the gate sequence: `node scripts/skill-lint.js --strict` (must show 0 errors), `node scripts/check-protocol-consistency.js` (C1-C7 must all pass), and (if you populated `examples` and `anti_examples`) `node scripts/skill-graph-routing-eval.js --skill <your-skill>` (verdict PASS before flipping `routing_eval` to `present`).

## Archetype Selection

Pick `type:` once, deliberately, before writing the body — the archetype determines which body sections are required.

| Archetype | When to pick it | Required body sections |
|---|---|---|
| `capability` | The skill teaches *how to do something* with no fixed sequence (e.g., a11y, naming-conventions, prompt-craft) | `## Coverage`, `## Philosophy`, `## Verification` |
| `workflow` | The skill orchestrates a *sequence of steps* the agent follows in order (e.g., debugging, refactor, skill-audit-loop) | `## Coverage`, `## Workflow` (numbered steps), `## Verification` |
| `router` | The skill dispatches between *other skills* (rare; only one starter — `skill-router`) | `## Coverage`, `## Routing Rules`, `## Verification` |
| `overlay` | The skill *specialises an `extends:` parent* with project-specific or stack-specific overrides (e.g., `lint-overlay`) | `## Overlay Rules` plus everything inherited from the parent's archetype |

The fastest way to pick wrong: choose `workflow` because your skill happens to list ordered steps in the body. If the *user* could reasonably consume the skill in any order based on the section they need, it is a `capability`, not a `workflow`. Workflows are skills the agent literally walks through start-to-end every time.

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
| Inflated routing_eval | `routing_eval: present` set without running the harness | Default to `absent`. Flip to `present` only after `node scripts/skill-graph-routing-eval.js --skill <name>` returns PASS |
| Wrong archetype | Skill body sections don't match `type:` | Re-pick archetype per § Archetype Selection; rewrite the body to match |
| Anti-examples for skills that don't exist | `anti_examples` references skills not in the library | Either author those skills first or use existing starter names |
| Lint-skipped commit | New skill is committed without `--strict` lint pass | Run `node scripts/skill-lint.js --strict` before every commit; fix all errors |

## Verification

Use this checklist as the authoring gate before committing a skill. Every item must pass.

- [ ] Every retained field has a real reason to exist in the new skill
- [ ] Every removed field was removed because of archetype or grounding mismatch, not laziness
- [ ] Body sections match the declared archetype per `docs/skill-metadata-protocol.md § Archetype section map`
- [ ] `description:` is ≤ 3 sentences, contains pushy trigger phrases, and names an explicit negative boundary
- [ ] `## Coverage` is a scope map of distinct topics, not a one-line restate of the description
- [ ] `drift_check` is an object with `last_verified`; `truth_source_hashes` recorded when truth sources exist
- [ ] `compatibility` is an object (not a free-text string) when present
- [ ] `eval_artifacts`, `eval_state`, `routing_eval` reflect the actual skill state — no inflation
- [ ] All `relations` entries point to skills that exist in the target repo; `boundary` entries with non-obvious rationale use the `{skill, reason}` form
- [ ] No placeholder sludge (`your-skill-name`, `path/to/file`, `todo`) remains
- [ ] No `> **TEMPLATE NOTE:**` blockquotes or `# TEMPLATE NOTE:` YAML comments remain
- [ ] `node scripts/skill-lint.js --strict` returns 0 errors against the new skill
- [ ] `node scripts/check-protocol-consistency.js` passes C1-C7
- [ ] If `routing_eval: present`, `node scripts/skill-graph-routing-eval.js --skill <name>` returns verdict PASS

## Do NOT Use When

| Use instead | When |
|---|---|
| `documentation` | Writing general technical documentation (guides, tutorials, references) — not a skill specifically |
| `refactor` | Modifying an existing skill's content while preserving its identity |
| `graph-audit` | Auditing the metadata health of skills already in the library |
| `skill-router` | Diagnosing why a router doesn't activate an existing skill on a given query |
| `code-review` | Reviewing the technical content of a skill (correctness, clarity) once authored |
