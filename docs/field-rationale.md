# Field Rationale — Why These Fields Exist

> Hand-authored "why this field" rationale for the ~10 frontmatter fields whose meaning is non-obvious from the schema description alone. For schema-canonical definitions of every field, see [`field-reference.generated.md`](field-reference.generated.md). For full prose with examples and lint notes, see [`field-reference.md`](field-reference.md).

This doc exists because the schema description tells you *what* a field stores, but not *why the field exists at all*. For most fields (`name`, `version`, `triggers`) the why is obvious. For ~10 others, the rationale is the load-bearing knowledge — and lives outside any auto-generated index.

Each section below has three parts: **Why this field exists**, **Common confusion**, and **Worked example**.

---

## `deployment_target`

### Why this field exists

`deployment_target` is the routing-layer signal that tells consumers (and humans) how transferable a skill is between projects. The two values map to two distinct relationships with the codebase:

- `portable` — the skill captures patterns that apply across any project with no repo-specific coupling (e.g., `testing-strategy`, `webhook-integration`). Safe to load anywhere.
- `project` — the skill is coupled to specific repo conventions, file paths, or proprietary terminology of one project. Loading it in another repo would mislead the agent. Requires a populated `grounding` block and a `project[]` declaration.

Without `deployment_target`, a consumer cannot tell at a glance whether a skill inherited from another project is safe to use or is leaking assumptions. The router uses `deployment_target` together with `project[]` to enforce project-fit — a `project` skill for project A is filtered out when serving project B even if the keywords match.

### `scope` — the free-text companion

`scope` is a separate, optional free-text field for a PRD-style description of what the skill teaches and does not teach. It is not an enum and is not used for routing decisions. Use it to expand on the skill's boundaries in plain language for human readers.

### Common confusion

Authors previously used `scope: portable` as a lazy default without checking for hidden repo coupling. In v8, `deployment_target: portable` should still be set deliberately: only after a real check that the skill has no hidden coupling to a specific project. When in doubt, use `deployment_target: project` with the appropriate `grounding` and `project[]`.

### Worked example

```yaml
# Coupled to a specific repo's table names + auth helpers
deployment_target: project
project:
  - handle: sales-hub
    role: source-of-truth
grounding:
  subject_matter: Sales Hub order reconciliation logic
  grounding_mode: repo_specific

# Universal patterns; safe to load in any project
deployment_target: portable

# Optional free-text description of what this specific skill covers/excludes
scope: "Covers abstract testing strategy; does not cover project-specific test fixtures."
```

---

## `eval_artifacts`

### Why this field exists

`eval_artifacts` is the disk-truth axis of the Evaluation Status: are there actual eval files at `evals/<skill>.json` (or similar)? It exists because three orthogonal questions about Evaluation Status needed to be representable separately:

1. **Are eval files on disk?** — `eval_artifacts` (`none` / `planned` / `present`)
2. **What does the eval say?** — `eval_state` (`unverified` / `passing` / `monitored`)
3. **Is routing coverage evaluated?** — `routing_eval` (`absent` / `present`)

Conflating these into a single field hides important information. A skill can have `eval_artifacts: present + eval_state: unverified` (the file exists but has never run); or `eval_artifacts: planned + eval_state: unverified` (no file yet, intent declared). Each combination has a meaningful action — the field must be able to express them all.

### Common confusion

Authors set `eval_artifacts: planned` and never come back. ADR 0005 introduced a staleness guard: if `freshness` is older than `lifecycle.stale_after_days` (default 180) and `eval_artifacts: planned`, lint warns. Plan or move on; don't park forever.

### Worked example

```yaml
eval_artifacts: planned       # Intent declared, no file yet
eval_state: unverified        # Nothing has run
routing_eval: absent          # Routing coverage not part of plan
```

---

## `eval_state`

### Why this field exists

`eval_state` is the runtime-truth axis: when the eval ran, what did it say? Distinct from `eval_artifacts` because a file can exist without ever running, and a file can run repeatedly producing different verdicts. The three values trace the runtime trajectory:

- `unverified` — file exists but no recent run, OR no file
- `passing` — last run was green
- `monitored` — runs on a cadence, currently green

Together with `eval_artifacts`, the two fields capture the eval lifecycle without forcing the author to choose between "is there a file" and "did it pass" — both questions get explicit answers.

### Common confusion

`eval_state: passing` is a strictly weaker claim than `monitored`. `passing` means "I ran it once and it was green at that moment"; `monitored` means "it runs regularly and the latest run is green". If you don't have a cadence, you have `passing`, not `monitored` — the difference matters for consumers deciding how much to trust the skill.

---

## `routing_eval`

### Why this field exists

`routing_eval` was added in v3.x because content-quality evals (which `eval_state` captures) say nothing about whether the router actually picks the skill for the right queries. A skill can have a perfect eval verdict on its content while being completely invisible to the router because its keywords are too generic, or it is being boundary-excluded by another skill, or its `examples[]` overlap with a stronger competitor.

The harness at `scripts/skill-graph-routing-eval.js` makes the `present` claim verifiable: it runs every `examples[]` through `scripts/skill-graph-route.js` and asserts the skill wins; runs every `anti_examples[]` and asserts the winner is NOT this skill. Lint check 12 then gates the assertion — `routing_eval: present` cannot ship unless the harness agrees.

### Common confusion

Authors flip `routing_eval` to `present` because they wrote `examples[]` and feel confident — without ever running the harness. The lint check then refuses the commit. This is intentional: honesty over green checkmarks. Default to `absent`; flip to `present` only when `node scripts/skill-graph-routing-eval.js --skill <name>` exits 0.

### Worked example

```yaml
routing_eval: absent   # Default — be honest until verified

# Once node scripts/skill-graph-routing-eval.js --skill X returns PASS:
routing_eval: present  # Verified, lint check 12 will gate
```

---

## `relations.depends_on`

### Why this field exists

`depends_on` is the operational-prerequisite predicate. Distinct from `relations.related` (symmetric co-read) and `relations.broader` (cross-skill generalisation), `depends_on` says: "this skill cannot fulfil its claims without the target skill being available". The router treats it as transitive — if A depends on B, and B depends on C, the agent gets all three.

The optional `min_version` constraint exists because skill contracts evolve. A dependency on `api-key-management` 1.0 may be incorrect under 2.0 if the target's API surface changed. Authors pin only when the constraint is real; if any version works, omit `min_version`.

### Common confusion

`depends_on` is for skills the dependent skill needs at *agent runtime* — when the agent loads the dependent, it should also load the dependencies. Conceptual prerequisites that don't need co-loading at runtime belong in `relations.broader` (this skill is a specialisation of …) or in the SKILL.md prose, not in `depends_on`.

### Worked example

```yaml
relations:
  depends_on:
    - skill: api-key-management
      min_version: "1.2.0"        # constraint is real — broke at 2.0
    - testing-strategy            # any version works — bare string
```

---

## `relations.verify_with`

### Why this field exists

`verify_with` maps to PROV-O `prov:wasInformedBy` — the target skill's claims inform this skill's claims. It's the cross-skill verification predicate. Use when running this skill's checks would benefit from co-loading another skill's verification patterns.

The router co-loads `verify_with` partners as a one-hop expansion (Stage 4) — no transitive closure, because verification chains can balloon.

### Common confusion

`verify_with` is NOT for "this skill is similar to that skill" — that's `relations.related`. And it's NOT for "this skill is a more general skill" — that's `relations.broader`. It's specifically for: when you act on the claims this skill teaches, the target skill's claims help you verify that you did it correctly.

---

## `relations.broader`

### Why this field exists

`broader` exists because cross-skill generalisation was unexpressable before v3.1. `category` captures hierarchy WITHIN a single category tree, not across skill instances. A skill like `react-best-practices` is conceptually a specialisation of `frontend` (a more general standalone skill), but `category` cannot represent that relationship because both skills sit in the engineering category at the same depth.

`broader` adds SKOS-style cross-skill generalisation (skos:broader). The router uses it for parent recall: when the specific skill matches, the parent is co-loaded as a generalisation companion. The inverse (`narrower`) is NOT used to drive co-load — a parent match should not pull in arbitrary children.

### Common confusion

`broader` looks similar to `extends` but differs critically. `extends` is overlay-only and creates an existential dependency — the overlay ceases to have meaning without its parent (ADR 0003). `broader` is informational generalisation; the child is a coherent skill on its own and would survive its parent being deleted. Use `extends` only with `type: overlay`; use `broader` for everything else.

---

## `grounding.evidence_priority`

### Why this field exists

`grounding.evidence_priority` lets a skill rank evidence when repo files and general knowledge disagree. Without an explicit priority, agents reading the skill have to invent ad-hoc tie-breaking rules, which is unsafe when the skill makes claims about specific code.

Three values are valid in v3: `repo_code_first` (repo evidence wins), `general_knowledge_first` (external standard or general doctrine wins), and `equal` (case-by-case judgment required).

### Common confusion

`repo_code_first` is the right default for skills grounded in a specific repo's code. `general_knowledge_first` is correct only when the skill teaches an external standard and the repo may legitimately lag behind it. Use `equal` when the skill's verification section explains how to resolve conflicts.

---

## `lifecycle.review_cadence`

### Why this field exists

`review_cadence` lets the maintainer declare a review rhythm independent of the calendar `freshness` claim. A skill that is reviewed quarterly is in a different posture than one reviewed annually, even if both have the same `freshness` date. Drift-check workflows can read the cadence and warn when a review is overdue relative to the cadence, not just relative to a fixed staleness threshold.

### Common confusion

`review_cadence` is a process commitment, not a fact about the past. Don't set it to `quarterly` aspirationally if you have no actual cadence; omit it and use `stale_after_days` to drive reviews. Lying in the cadence makes the next maintainer mistrust the whole frontmatter.

---

## `portability.readiness`

### Why this field exists

`portability.readiness` exists because `deployment_target` says where a skill applies, while readiness says how proven its export path is. A skill can be `deployment_target: portable` and still have only a declared portability claim. Authors use `declared` for metadata-only portability, `scripted` when an export transform exists for at least one target, and `verified` when the exported output has been checked with a receipt.

Consumers use `readiness` together with `deployment_target` to decide whether a skill is only theoretically portable, mechanically exportable, or already verified in a target runtime.

### Common confusion

Do not use `readiness` as a second taxonomy for project fit. `deployment_target: portable` plus `portability.readiness: declared` is a valid state: the skill is intended to transfer, but no export verification exists yet. Move to `scripted` only when tooling exists, and to `verified` only when there is a concrete verification receipt.

---

## Cross-references

| Topic | Read |
|---|---|
| Schema-canonical field definitions (auto-generated) | [`field-reference.generated.md`](field-reference.generated.md) |
| Full prose reference with examples and lint notes | [`field-reference.md`](field-reference.md) |
| Decision tree for taxonomy fields (`subject`, `taxonomy_domain`, `deployment_target`, `project[]`, `routing_bundles`) | [`field-decision-guide.md`](field-decision-guide.md) |
| Predicate semantics (relations) | [`glossary.md` § Relation predicates](glossary.md) |
| Authoring template | [`../examples/skill-metadata-template.md`](../examples/skill-metadata-template.md) |
| Why archetypes are rigid vs anti-rigid (OntoClean) | [`adr/0003-ontoclean-rigidity-tags.md`](adr/0003-ontoclean-rigidity-tags.md) |
| Why the Evaluation Status is orthogonal | [`adr/0001-predicate-set.md`](adr/0001-predicate-set.md) + [`adr/0006-revise-predicate-rename.md`](adr/0006-revise-predicate-rename.md) |
