# Skill Graph

> **Glossary.** In this repo, **tier** = authority (which file wins on conflict — see the 5-tier "Quick tour" below; [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) is the same 5 tiers in detail). **Layer** = type of metadata inside a single skill's frontmatter — there are 5 of those too, defined in [`docs/PRIMER.md`](docs/PRIMER.md) § 3. The two fives count to the same number but refer to different concepts: tiers span the whole repo; layers live inside one `SKILL.md`.

**Skill Graph is the metadata contract for skills that know your codebase.** It adds the structure a skill needs once it lives inside a real project: hashed grounding to actual repository files, typed relations to other skills, project tags for stack-specific scoping, and eval state for routing trust. The result is skills that are relevant to *your* project, not generic skills that happen to mention your stack.

The format is interoperable with [Agent Skills](https://agentskills.io/specification) via the export transform at `scripts/export-skill.js`, so a Skill Graph library is consumable by any Agent-Skills-compatible runtime. The two contracts are distinct — Skill Graph's `compatibility` shape and `name` pattern diverge from Agent Skills' — but the export transform round-trips Skill Graph skills into Agent Skills shape.

### Three failures the contract prevents

1. **Wrong-skill activation.** The agent picks the wrong skill on an ambiguous prompt — and you can't tell whether the description was vague, the keywords overlapped, or two skills both claimed the territory. *Skill Graph names this with `relations.boundary` predicates and routing-quality lint rules so the conflict is visible at lint time, not runtime.*
2. **Silent staleness.** A grounded skill cites a file you rewrote last Tuesday. The skill is now lying, but lint doesn't know and the agent will quote it anyway. *Skill Graph hashes every `grounding.truth_sources` entry and reports DRIFT / BROKEN / STALE / NO_BASELINE against the recorded baseline.*
3. **Project-scope leak.** You want to share some skills across two projects but not all. Today this lives in folder structure or naming hacks; tomorrow you change the layout and break a project. *Skill Graph names project scope in the contract via `project_tags` + workspace `semantic_tags` matching — no folder gymnastics required.*

The contract names each failure with typed metadata; the lint catches them before they hit production. Each one is a specific symptom of skills that don't yet know which files, stacks, or sibling skills they belong to.

### Authoring is "fill the template, lint catches the rest"

The contract is machine-checked. Authoring a skill means copying [`examples/skill-template.md`](examples/skill-template.md), filling the 13 required and ~19 optional frontmatter fields, and running `node scripts/skill-lint.js` — which validates against [`schemas/skill.v3.schema.json`](schemas/skill.v3.schema.json), checks that every `relations.*` target resolves, enforces archetype-specific body sections (e.g. `## Coverage` + `## Philosophy` + `## Verification` + `## Do NOT Use When` for `capability` skills), and surfaces routing-quality regressions. Pinned v2 (frozen) and v3 (current) schema copies in `schemas/` mean adopters can pin a contract version across a future v4 bump. You do not read 32 field docs to author a skill — you copy the template, fill the placeholders, and let lint name what's missing.

### Why now

Industry framing has caught up: *"Context engineering is the essential AI coding skill of 2026"* — and *"by carefully crafting rule files, project docs, and example code, you can increase agent task success rates from 30% to 90%"* ([QubitTool 2026 AI Coding Tools comparison](https://qubittool.com/blog/ai-coding-tools-2026-comparison)). Carefully-shaped skill metadata is the leverage point — the difference between an agent that works on demos and one that works in production. Skill Graph is the contract that makes that metadata legible to lint, router, and audit.

### What Skill Graph is *not*

Skill Graph sits one layer below aggregator marketplaces like [skillsmp.com](https://skillsmp.com) and [skills.sh](https://skills.sh) — it's the contract those marketplaces could enforce on the skills they aggregate. It is not itself a marketplace, a runtime, or a prompt library; it complements them. **A skillsmp search is for *finding* a skill; a Skill Graph library is for *managing* your team's expertise.** Specifically, Skill Graph is **not**:

- a prompt library
- a skill marketplace
- another agent framework
- a complete runtime implementation

It is a portable metadata contract with deterministic validation, designed to be consumed by any agent runtime that already supports Agent Skills.

## Status

**Current version: 0.4.0** (2026-04-18) — see [CHANGELOG.md](CHANGELOG.md) for the full release history and migration notes.

**Considering adoption?** Read [`docs/ADOPTION.md`](docs/ADOPTION.md) for a 1-page decision tree. **Wondering which skills the OSS library should ship?** Read [`docs/recommended-skills.md`](docs/recommended-skills.md) for the curated set targeted at all humans and AI agents.

## Where Skill Graph sits in the agent-skills landscape

A 2026 reader has at least six AI-coding context tools in their head. Here's how Skill Graph relates to each:

| Tool | What it does (in their words) | What Skill Graph does differently | When you'd use both |
|---|---|---|---|
| [**Anthropic Agent Skills**](https://www.claude.com/skills) | *"Teach Claude your way of working" — "Build once, use everywhere" — "Stack skills for complex work."* A format for packaging procedural knowledge as discoverable folders. | Skill Graph is a distinct metadata contract. It adds typed relations, drift detection, eval state, and project scoping; Agent Skills doesn't model them. Every Skill Graph skill exports to Agent Skills shape via `scripts/export-skill.js`, so a Skill Graph library is consumable by any Agent-Skills-compatible runtime. | Together — author in Skill Graph; export to Agent Skills for runtimes that read only the simpler format. |
| [**Cursor rules**](https://cursor.com/docs) (`.cursor/rules/*.mdc`) | Repo-behavior guardrails the IDE applies to every Cursor agent action — "always treat this folder as auth-critical," "never modify schemas without a migration." | Cursor rules are repo-behavior guardrails; Skill Graph is **skill-library structure** for the moment you have many skills to route, verify, and ground. The two solve different problems. | Together — Cursor rules constrain the agent's behavior in your repo; Skill Graph organizes the skills the agent draws from. |
| **Continue rules** (`.continue/rules/*`) | Same shape as Cursor rules — IDE-applied behavior constraints. | Same distinction as Cursor: behavior rules vs. library structure. | Together — Continue rules for IDE behavior, Skill Graph for skill-library shape. |
| **GitHub Copilot custom instructions** (`.github/instructions/*`) | Per-repo prompt augmentation that ships with every Copilot completion request. | Custom instructions are inline prompt content; Skill Graph is a **routable, validatable, droppable** skill-library contract. Copilot does not load skills dynamically — Skill Graph assumes a runtime that does. | Together — custom instructions for the prompt context Copilot always sees; Skill Graph for the on-demand skills a more capable runtime would route to. |
| **CLAUDE.md / AGENTS.md** | Plain-text repo-level conventions Claude Code or generic agent runtimes read at session start. | CLAUDE.md/AGENTS.md is **always-on** repo context (small, opinionated). Skill Graph is **on-demand** skill packaging (many, structured, routable). | Together — AGENTS.md for non-negotiable repo rules; Skill Graph for the skills the agent reaches for when those rules don't cover the specific task. |
| [**skillsmp.com**](https://skillsmp.com) | Aggregator marketplace — *"Discover open-source agent skills from GitHub."* Discovery surface. | Skill Graph is the contract a marketplace could enforce on the skills it aggregates. Library-management surface. | Together — skillsmp for finding new skills to install; Skill Graph for governing the library you've assembled. |
| [**skills.sh**](https://skills.sh) | Same category as skillsmp — *"The Open Agent Skills Ecosystem."* | Same distinction as skillsmp: discovery vs. management. | Together — same pattern. |

## What you get

Three benefits, each backed by a contract field and a script:

| Benefit | What it solves | Powered by |
|---|---|---|
| **Routing that respects your skill graph** | No more wrong-skill picks on ambiguous prompts. The router reads `relations.boundary`, `relations.depends_on`, and routing-quality lint rules to make the right pick visible. | `relations` block in the contract; `scripts/skill-graph-route.js` |
| **Drift detection** | Grounded skills warn you when the truth source moved. A skill that cites `migrations/0042_add_org_id.sql` and that file has changed since the last baseline → DRIFT. | `grounding.truth_sources` + `drift_check.truth_source_hashes`; `scripts/skill-graph-drift.js` |
| **Multi-project mode** | Share skills across projects without naming codebases in frontmatter. A workspace `.skill-graph/config.json` matches `project_tags` to project `semantic_tags` automatically. | `project_tags` + `.skill-graph/config.json`; `scripts/generate-manifest.js` |

### Full feature inventory

The complete set of shipped features:

- public `SKILL.md` frontmatter contract (`docs/metadata-contract.md`) — 32 authored fields, schema_version 3
- JSON Schemas for skill and manifest validation (`schemas/`) with pinned v2 (frozen) and v3 (current) copies alongside the unversioned files
- **skill lint script** with schema validation, parent-directory check, relation-target existence (supports v3 object-item forms), eval coherence, generator parity, archetype-aware sections, and routing quality (`scripts/skill-lint.js`)
- **contract consistency checker** for cross-artifact parity between schemas, docs, and example artifacts; version-aware C6 that tracks the current pinned schema and freezes prior versions (`scripts/check-contract-consistency.js`)
- **manifest generator** that walks `skills/**/SKILL.md` (or every root declared in `.skill-graph/config.json` for multi-project workspaces), applies the rename map from `docs/manifest-contract.md`, computes SHA-256 drift detection, and emits a validated, deterministic manifest (`scripts/generate-manifest.js`)
- **Agent Skills export script** that transforms a Skill Graph SKILL.md into an Agent Skills-compatible file — flattens v3 `compatibility` object to a 500-char string (`scripts/export-skill.js`); five exported fixtures in `examples/exports/`
- **audit runner** with two modes (`scripts/skill-audit.js`): stub mode seeds `audits/<skill>/{findings,verdict,scorecard}.md` from lint output with human TODO placeholders; `--graded` mode extends the stub by calling an external model CLI (e.g. `claude -p`, `codex exec`) for each of the seven scorecard dimensions, writing evidence-backed PASS / PASS WITH FIXES / FAIL verdicts. Per-dimension prompts are composed by `scripts/lib/audit-prompt-builder.js`; a deterministic mock grader ships at `scripts/lib/mock-grader.js` for CI smoke-tests.
- **reference consumer — `skill-graph route`** (`scripts/skill-graph-route.js`): graph-aware skill selector that makes `relations`, `grounding`, `eval_state`, `lifecycle`, and `project_tags` visibly drive a routing decision. Supports `--project`, `--max`, `--min-eval-state`, `--path`, `--json`. This is the tool that demonstrates why the extra metadata exists.
- **drift sentinel — `skill-graph drift`** (`scripts/skill-graph-drift.js`): hashes every `grounding.truth_sources` entry and reports DRIFT / BROKEN / STALE / NO_BASELINE against the stored `drift_check.truth_source_hashes` baseline. `--record --apply` updates the SKILL.md frontmatter in place.
- **v2 → v3 codemod** (`scripts/migrate-skill-v2-to-v3.js`): line-based migration preserving author YAML style, applying the four v3 shape changes automatically.
- **multi-root workspace mode** — `.skill-graph/config.json` declares multiple `skill_roots` and a `projects → semantic_tags` map; the generator unions all roots into one manifest and stamps each skill with its `project` handle. Fallback to single-root `skills/` when absent.
- **CI integration** — self-hosted GitHub Actions workflow running lint + consistency checks on every PR touching schema, scripts, skills, or examples (`.github/workflows/skill-graph-lint.yml`); consumer copy-paste snippet at `docs/integrations/github-actions.md`
- audit documentation for single-skill and repeated-library review (`docs/single-skill-audit-checklist.md`, `docs/library-audit-workflow.md`)
- a self-referential skill template (`examples/skill-template.md`) — now demonstrates v3 object `drift_check`, object `compatibility`, object `boundary` with reason, and `lifecycle`
- eight starter skills (`skills/a11y`, `debugging`, `documentation`, `refactor`, `testing-strategy`, `skill-router`, `lint-overlay`, `graph-audit`) — covering all four archetypes and all three scopes, all migrated to v3
- concrete example audit and eval artifacts against the `documentation` starter (`examples/audits/`, `examples/evals/`)
- sample manifest generated by `scripts/generate-manifest.js` — not hand-written (`examples/skills.manifest.sample.json`)

### Planned, not yet implemented

- overlap detection and coverage tooling (`scripts/skill-overlap.js`, `scripts/build-coverage.js`)

### Roadmap: cross-runtime portability

Skill Graph today exports to base Agent Skills. Planned target runtimes — Cursor (`.cursor/rules/*.mdc`), Continue (`.continue/rules/*`), GitHub Copilot (`.github/instructions/*`), Anthropic AGENTS.md — will be added via new RFCs as transforms ship. Each gets its own PR pairing the enum addition with a working transform; the enum and the transform land together so `additionalProperties: false` plus enum restriction (the whole point of the contract) is never violated by aspirational values.

> **Why not now?** These four enum values previously appeared in `portability.targets` in 0.2.x as compatibility *goals* with no working transform. They were removed in 0.3.0 because aspirational enum values violated the contract. Today the enum accepts only `agent-skills`. They re-land when the matching transforms are ready — RFC + transform PR together.

See `docs/plans/scripts-roadmap.md` for the planned script surface and [CHANGELOG.md](CHANGELOG.md) for what has shipped in each release.

### The iteration loop — measured, not ad-hoc

The contract pieces compose into a **measurable improvement cycle**:

1. **Skills are versioned artifacts** — every `SKILL.md` declares `schema_version` and a per-skill `version`, and ships in a contract pinned by `schemas/skill.v3.schema.json`.
2. **Grounding is hashed** — `drift_check.truth_source_hashes` records a SHA-256 of every cited file; `scripts/skill-graph-drift.js` reports `DRIFT` / `BROKEN` / `STALE` / `NO_BASELINE` against the recorded baseline. `lifecycle.stale_after_days` time-boxes the freshness claim independently.
3. **Audits produce evidence-backed verdicts** — `node scripts/skill-audit.js <skill> --graded` runs seven per-dimension prompts through an external grader CLI (`claude -p`, `codex exec`, etc.) and writes `PASS` / `PASS WITH FIXES` / `FAIL` per dimension into `findings.md` / `verdict.md` / `scorecard.md`.
4. **The library workflow loops the whole thing** — [`docs/library-audit-workflow.md`](docs/library-audit-workflow.md) is the standard 12-step loop: select → deterministic lint → optional graded → aggregate → fix → re-verify → next skill. Phase 5 confirms fixes stuck and updates `drift_check.last_verified`.

The result is a skill library where "this skill is good" is a defended claim with a hash, an eval verdict, and a re-verify date — not a vibe.

## Relationship to Agent Skills

**If you only need plain Agent Skills, stay there.** Skill Graph exists for the moment your skills become a system and need typed relations, trust signals, and code grounding. Anthropic's own framing: *"Claude is powerful, but real work requires procedural knowledge and organizational context"* ([Anthropic engineering blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)). Skill Graph is what you adopt when "organizational context" stops being a folder of `SKILL.md` files and starts being a graph.

Skill Graph extends the [Agent Skills](https://agentskills.io/specification) open standard with a richer authoring contract. It keeps the base standard's two required fields (`name`, `description`) and the optional fields (`license`, `compatibility`, `allowed-tools`) — but tightens their shape and adds typed relations, grounding anchors, health metadata, and portability declarations as additional top-level fields.

**Compatibility is *not* automatic in either direction.** Skill Graph's `compatibility` is an object (with structured `runtimes` / `node` / `notes` keys); Agent Skills' is a free-text string capped at 500 characters. Skill Graph's `name` pattern allows `/` and `:` for namespacing; Agent Skills' is strictly kebab-case. A skill written for either format must be transformed before it is valid in the other. Use `scripts/export-skill.js` to project a Skill Graph skill back into Agent Skills shape (extensions are nested under `metadata:`); use a manual rewrite to import an Agent Skills skill into Skill Graph (Skill Graph requires fields beyond the base two).

Skill Graph then adds, as additional top-level fields beyond the base standard:

The base standard and the Skill Graph extensions:

| Field | Source | Role in Skill Graph |
|---|---|---|
| `name` | Agent Skills | Skill identifier; Skill Graph tightens the character pattern |
| `description` | Agent Skills | Routing contract (what + when) |
| `license` | Agent Skills | Optional; strongly recommended for shared skills |
| `compatibility` | Agent Skills | Optional; environment requirements |
| `allowed-tools` | Agent Skills | Optional; space-separated tool allowlist |
| `metadata` | Agent Skills | Not used at top level; Skill Graph promotes extensions to dedicated fields |
| `schema_version`, `version`, `type`, `browse_category`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval` | Skill Graph | Required extensions for governance, routing, and health tracking |
| `category`, `relations`, `grounding`, `portability`, `triggers`, `keywords`, `examples`, `anti_examples`, `paths`, `project_tags`, `routing_groups`, `extends`, `stability`, `superseded_by`, `lifecycle`, `runtime_telemetry` | Skill Graph | Optional extensions for graph semantics, grounding, hierarchical taxonomy, activation examples, exportability, and lifecycle |

**Compatibility direction.** A valid Agent Skills skill is *not* automatically a valid Skill Graph skill — Skill Graph requires fields beyond the base two. Going the other way is possible via a transform: move every Skill Graph extension field under the standard `metadata:` key, leaving only the Agent Skills fields at the top level. The transform is implemented as `scripts/export-skill.js`. Running `node scripts/export-skill.js <skill-dir>` produces a `SKILL.agent-skills.md` file with only the Agent Skills base fields at the top level and all Skill Graph extensions nested under `metadata:`. Only `agent-skills` is a valid `portability.targets` value today; other runtimes (cursor, windsurf, copilot, agents-md) are deferred until a working transform ships.

**Internal supersets.** A consumer library can be a strict superset of the Skill Graph contract by adding governance fields that Skill Graph deliberately does not model (dispatch layers, routing roles, category taxonomy, bundle aggregates). The Development workspace's own `skills/` library does exactly this — see its contract-delta document for how that library extends v2 and why the two contracts are intentionally divergent. Superset libraries should validate against their own richer schema, not against `skill-lint.js`.

## Walkthrough: a real project (multi-tenant markdown static site)

This is the missing concrete-project example — what does Skill Graph look like applied to a recognizable real-world stack? The directory [`examples/projects/markdown-static-site/`](examples/projects/markdown-static-site/) ships **5 specimen skills** that exercise every contract feature against a multi-tenant markdown static site with a build-time image pipeline, a periodic link-rot scan, and a content-source router:

| Specimen | Archetype | Scope | Demonstrates |
|---|---|---|---|
| [`markdown-post-frontmatter-validation`](examples/projects/markdown-static-site/skills/markdown-post-frontmatter-validation/SKILL.md) | `capability` | `codebase` | Full `grounding` block + pushy description + hierarchical category |
| [`image-optimization-pipeline-config`](examples/projects/markdown-static-site/skills/image-optimization-pipeline-config/SKILL.md) | `capability` | `codebase` | Five concrete `failure_modes` for the eval grader to target |
| [`link-rot-detection`](examples/projects/markdown-static-site/skills/link-rot-detection/SKILL.md) | `capability` | `portable` | The `portable` scope — no `grounding` needed for repo-agnostic knowledge |
| [`content-source-router`](examples/projects/markdown-static-site/skills/content-source-router/SKILL.md) | `router` | `codebase` | The `router` archetype with `## Routing Rules` and the anti-default doctrine |
| [`migrate-posts-to-v2-frontmatter`](examples/projects/markdown-static-site/skills/migrate-posts-to-v2-frontmatter/SKILL.md) | `workflow` | `codebase` | The `workflow` archetype with `## Workflow` + `relations.depends_on` |

### (a) The conceptual `relations.depends_on` graph

Read the [specimen pack README](examples/projects/markdown-static-site/README.md) for the full ASCII diagram. The short version: `migrate-posts-to-v2-frontmatter` (workflow) conceptually depends on `markdown-post-frontmatter-validation` (capability) — the workflow re-validates against the same schema this capability owns; flipping the validator is unsafe unless the capability's contract is authored correctly. `content-source-router` (router) dispatches to `markdown-post-frontmatter-validation` (capability) and to analogous MDX / CMS-source primitives.

### Why this stack

The specimens are deliberately a low-stakes content stack: no payments, no auth, no tenant-isolation boundaries, no cryptographic primitives. If a reader template-copies one of these specimens and gets it slightly wrong, the worst outcome is a broken image variant or a 404 on a bad route — not a customer-affecting incident. The Skill Graph contract features the specimens demonstrate (typed relations, grounding, drift detection, project tags, archetype discipline) work identically against any stack.

### (b) A routing trace where the agent picks the right skill

Unlike a flat keyword search, the router prints WHY each skill was selected, co-loaded, or excluded — every line cites the specific frontmatter field that drove the decision (a matched keyword, a `boundary` reason, an `eval_state`, a `verify_with` co-load).

Run on a query against the existing starter skills (the specimens are not in `skills/`, so the route below uses real starters; install a specimen as documented in its README to exercise the route against it):

```bash
node scripts/skill-graph-route.js "audit my skills for schema conformance"
```

```
Query: "audit my skills for schema conformance"

SELECTED
  Skill                   Score  State       Reason
  ────────────────────────────────────────────────────────────────────────
  graph-audit             9      passing     keyword:skill audit, keyword:schema validation, keyword:audit my skills
  owasp-security          3      unverified  keyword:audit code for security

EXCLUDED
  Skill                   Score  State       Reason
  ────────────────────────────────────────────────────────────────────────
  code-review             —      unverified  in boundary[] of owasp-security: code-review is the holistic per-PR pass that includes security as one of many concerns; owasp-security is the security-specific deep audit
  testing-strategy        —      passing     in boundary[] of owasp-security: testing-strategy decides what to test broadly; owasp-security defines security-specific test cases as a sub-concern

2 selected, 0 co-loaded, 2 excluded. 0 stale.
```

Read the trace as evidence: the SELECTED column shows *why* each skill activated (which specific keywords matched), the EXCLUDED column shows which adjacent skills the boundary predicates kept out and *why* — neither is a guess; both are auditable from the SKILL.md frontmatter.

### (c) A drift warning when a truth source moves

The `graph-audit` starter skill is grounded in seven truth sources (schemas, contract docs, scripts). Edit any one of them — say, add a comment to `scripts/skill-lint.js` — then run:

```bash
node scripts/skill-graph-drift.js
```

```
DRIFT         graph-audit
  DRIFT         scripts/skill-lint.js
NO_BASELINE   skill-scaffold

13 skill(s): 1 DRIFT, 1 NO_BASELINE, 11 UNGROUNDED
```

The skill now warns that one of its truth sources moved. The `UNGROUNDED` count is normal — `scope: portable` and `scope: reference` skills don't ground to truth sources, so they're correctly excluded from drift detection.

### Hands-on next step

For a step-by-step 30-minute walkthrough where you author a skill from scratch, lint it, watch lint catch a broken relation, route a real query, and record a drift baseline, see [`docs/QUICKSTART-30MIN.md`](docs/QUICKSTART-30MIN.md).

## Quick tour

The repo is organised in five authority tiers. When two files disagree, the higher tier wins — and CI enforces every tier boundary automatically. For the full architecture walkthrough, read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

### Tier 1 — Contract (source of truth)

- `schemas/skill.schema.json` — frontmatter contract; tracks latest (v3 today)
- `schemas/manifest.schema.json` — compiled manifest contract; tracks latest (v3 today)
- `schemas/skill.v3.schema.json` + `schemas/manifest.v3.schema.json` — pinned v3 copies. Consumers wanting stability across a future v4 bump validate against these.
- `schemas/skill.v2.schema.json` + `schemas/manifest.v2.schema.json` — **frozen** v2 copies for consumers still on v2. Run `node scripts/migrate-skill-v2-to-v3.js` to upgrade.

### Tier 2 — Explanation (human reflections of the contract)

- `CONTRACT.md` — **the normative spec.** Top-level public contract: required vs optional fields, semantic rules by field group, authored vs generated, migration notes, schema versioning policy. Terse, boundary-aware, no rationale. The doc you print and tape to the wall.
- `docs/metadata-contract.md` — **the design rationale.** Archetype map + anatomy + requiredness groups + strictness rules + schema versioning policy AND the *why*: why archetypes are rigid vs anti-rigid (OntoClean per ADR 0003), why the eval-health triple is orthogonal (ADR 0001 + ADR 0006), how JSON-LD `@context` maps every field to W3C terms (ADR 0002). Pedagogical, philosophical, ADR-referencing.
- `docs/field-reference.md` — per-field semantics for all 32 v3 authored fields, hand-curated prose with examples and lint notes (canonical for authoring). Now the apex of a three-doc structure including `docs/field-reference.generated.md` (auto-generated drift-free index from schema descriptions) and `docs/field-rationale.md` (hand-authored "why this field exists" rationale for the 10 non-obvious fields).
- `docs/field-decision-guide.md` — decision tables for the hard choices: `scope`, `relations.*`, eval-health triple, `portability`, `project_tags`, and `browse_category` vs `category` vs `project_tags` vs `routing_groups`
- `docs/manifest-contract.md` — authored → generated bridge with rename map, loss policy, and v2→v3 migration notes

### Tier 3 — Enforcement and transformation

- `scripts/skill-lint.js` — per-skill validator (schema, relations, evals, archetype sections, routing quality, truth-source ranges, description length)
- `scripts/skill-overlap.js` — cross-skill routing-hygiene checker (duplicate triggers, keywords, path globs)
- `scripts/check-contract-consistency.js` — 6-check cross-artifact consistency checker
- `scripts/generate-manifest.js` — authored → manifest compiler; multi-root workspace aware
- `scripts/export-skill.js` — Agent Skills export transform
- `scripts/migrate-skill-v2-to-v3.js` — v2→v3 codemod
- `scripts/skill-audit.js` — two-mode audit runner (stub + `--graded`)

### Tier 4 — Reference consumer (what the contract buys you)

- `scripts/skill-graph-route.js` — graph-aware skill selector using relations + grounding + eval_state + project_tags
- `scripts/skill-graph-drift.js` — drift sentinel that hashes `grounding.truth_sources` against the recorded baseline

### Tier 5 — Specimens

- `examples/skill-template.md` — self-referential authoring template
- `examples/skills.manifest.sample.json` — generator-produced sample manifest
- `skills/*/SKILL.md` — eight starter skills covering every archetype × scope combination the schema permits
- `examples/audits/` — worked audit artifacts (findings / verdict / scorecard) for three starters
- `examples/evals/` — nine eval fixtures
- `examples/exports/` — five Agent Skills exports demonstrating the export transform

### Governance (outside the tier hierarchy)

- `docs/ARCHITECTURE.md` — the full tier walkthrough
- `docs/single-skill-audit-checklist.md` + `docs/library-audit-workflow.md` — audit workflow docs
- `docs/integrations/github-actions.md` — consumer copy-paste CI snippet
- `docs/plans/multi-root-workspace.md` — shipped v0.4.0 design doc
- `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE`, `.github/workflows/` — project housekeeping

## Audit surfaces

Skill Graph ships two reusable audit documents and a concrete artifact set that shows what the outputs look like:

- `docs/single-skill-audit-checklist.md` — the checklist for auditing one skill
- `docs/library-audit-workflow.md` — the standard 12-step loop for auditing many skills over time
- `examples/audits/documentation/` — worked example of `findings.md`, `verdict.md`, and `scorecard.md` applied to the `documentation` starter skill

## Starter skill pack

Eight starter skills. Each starter demonstrates at least one contract feature the others do not:

| Starter | Archetype | Scope | Unique feature demonstrated |
|---|---|---|---|
| `a11y` | `capability` | `portable` | Routable capability with path-based activation — `paths:` glob targeting UI files (`**/*.{html,tsx,jsx,vue,svelte}` and `**/*.css`) with gitignore-style negations for tests and vendor bundles |
| `debugging` | `workflow` | `portable` | Workflow archetype with a `## Workflow` body section showing numbered procedural steps |
| `documentation` | `capability` | `portable` | `eval_artifacts: present` with a shipped eval artifact (`examples/evals/comprehension.json`) |
| `refactor` | `workflow` | `portable` | `relations.depends_on` pointing at `testing-strategy` (refactor verification needs a test suite) |
| `testing-strategy` | `capability` | `portable` | `routing_groups: [quality]` showing the optional classification field |
| `skill-router` | `router` | `portable` | Router archetype with a `## Routing Rules` table showing the three-surface priority dispatch logic |
| `lint-overlay` | `overlay` | `portable` | Overlay archetype with `extends: testing-strategy`, `## Extends`, and `## Overlay Rules` sections — the only archetype that exercises the schema's conditional `extends` requirement |
| `graph-audit` | `capability` | `codebase` | `scope: codebase` with a fully populated `grounding` block (`domain_object`, `grounding_mode`, `truth_sources`, `failure_modes`, `evidence_priority`) and a shipped eval artifact (`examples/evals/graph-audit.json`) |

The five original starters are all `scope: portable` and demonstrate the ungrounded path (no `grounding` block). The three new starters exercise the previously uncovered schema paths: the `router` and `overlay` archetypes, and the `codebase` scope with its mandatory `grounding` contract. (v1 values `generic` and `operational` were renamed to `portable` and `codebase` in schema_version 2 — SH-5784.)

All eight starters have `eval_artifacts: present` with a shipped `examples/evals/<name>.json` companion — `skill-router` and `lint-overlay` were authored with `planned` during their archetype-coverage work and have since shipped real eval artifacts. `graph-audit` additionally exercises the `scope: codebase` grounding path. The `examples/skill-template.md` file shows the full optional extension set including `grounding`, `project_tags`, `lifecycle`, and `runtime_telemetry`.

## Manifest generation

`scripts/generate-manifest.js` walks `skills/*/SKILL.md`, applies the authored-to-generated rename map from `docs/manifest-contract.md` (grouping `triggers`/`keywords`/`paths` into `activation`, and `eval_status`/`freshness`/`drift_check` into `health`), computes summary aggregates, validates the result against `schemas/manifest.schema.json`, and emits deterministic JSON with all object keys sorted alphabetically.

```bash
# Emit manifest to stdout
node scripts/generate-manifest.js

# Write to a file
node scripts/generate-manifest.js --output skills.manifest.json

# Validate only (no output)
node scripts/generate-manifest.js --validate-only

# Include the skill-template from examples/
node scripts/generate-manifest.js --include-template

# Regenerate the sample manifest (use a fixed timestamp for reproducibility)
node scripts/generate-manifest.js --include-template \
  --timestamp 2026-04-17T00:00:00Z \
  --output examples/skills.manifest.sample.json
```

`examples/skills.manifest.sample.json` is produced by the generator (with `--include-template`) and committed as a reference artifact. It is not hand-written. `scripts/skill-lint.js` enforces parity: running lint will fail if the sample has drifted from what the generator would produce. Regenerate with the command above whenever skills are added or changed.

## Reference consumer

The metadata contract is only as valuable as the decisions it drives. Two reference tools exercise every unique Skill Graph field end to end — if you want to see what `boundary`, `grounding.truth_sources`, `eval_state`, `lifecycle`, and `project_tags` do, run these:

```bash
# Graph-aware skill selector — shows WHY each skill was selected, co-loaded, or excluded.
# Uses activation.keywords/triggers/paths, depends_on closure, verify_with co-loading,
# boundary anti-ownership exclusion, eval_state quality gate, and lifecycle staleness.
node scripts/skill-graph-route.js "accessibility keyboard navigation" --max 5

# With a project filter (expands via workspace.projects.<handle>.semantic_tags):
node scripts/skill-graph-route.js "refactor tests" --project <your-project>

# Drift sentinel — hashes every grounding.truth_sources file and reports
# DRIFT / BROKEN / STALE / NO_BASELINE against the stored baseline.
node scripts/skill-graph-drift.js

# Record a new hash baseline for one skill (after verifying it against the truth sources):
node scripts/skill-graph-drift.js --record --apply skills/graph-audit
```

These are reference implementations. Real consumers build their own router or CI check on top of `skills.manifest.json` — the tools above document the field semantics by using them.

## Multi-project workspace

For repos with more than one project, add `.skill-graph/config.json` at the repo root:

```json
{
  "workspace": {
    "skill_roots": [
      { "path": "skills",                              "project": null },
      { "path": "<project-a>/.skill-graph/skills",     "project": "<project-a>" },
      { "path": "<project-b>/.skill-graph/skills",     "project": "<project-b>" }
    ],
    "projects": {
      "<project-a>":  { "semantic_tags": ["ecommerce", "saas"] },
      "<project-b>":  { "semantic_tags": ["ecommerce", "b2c"] }
    }
  }
}
```

A skill declares which kinds of project it applies to via `project_tags`:

```yaml
# skills/checkout-flow-review/SKILL.md
---
name: checkout-flow-review
project_tags: [ecommerce, b2c]
# ...
---
```

With the workspace config above, this skill is automatically visible to `<project-a>` (`semantic_tags: [ecommerce, saas]`) AND `<project-b>` (`semantic_tags: [ecommerce, b2c]`) because both projects' `semantic_tags` overlap the skill's `project_tags`. A skill with `project_tags: [b2b-saas]` would be visible to neither. Skills with no `project_tags` are ambient — every project sees them. No folder structure is involved; the matching is declarative.

`<project-a>` and `<project-b>` are placeholders — adopters use whatever kebab-case handles they choose. The generator walks every declared root, stamps each skill with its `project` handle, and emits the workspace block in the manifest. Skills with no `project_tags` are ambient (every project); skills with tags match projects whose `semantic_tags` include any tag. See `docs/plans/multi-root-workspace.md` for the full design.

## Validation

Skill Graph ships two self-contained Node validation tools with no external dependencies.

### skill-lint.js — per-file schema and consistency checks

`scripts/skill-lint.js` reports errors with `file:line:column` + a 5-line code frame and caret, similar to Rust or Babel diagnostics.

The lint tool runs eleven checks:

| Check | Scope | Level |
|-------|-------|-------|
| Schema validation (required fields, types, enums) | Per file | Error |
| Parent-directory-matches-name (Agent Skills compatibility) | Per file | Error |
| Relation target existence (`relations.*` targets must be real sibling skills) | Per file | Error |
| Eval artifact coherence (`eval_artifacts: present` requires a real eval file) | Per file | Error |
| Cross-schema parity (frontmatter → manifest field representability) | Once | Error |
| Sample manifest conformance (`examples/skills.manifest.sample.json` vs schema) | Once | Error |
| Generator parity (sample manifest vs live generator output) | Once | Error |
| Migration warnings (v1 → v2 field renames) | Per file | Warn |
| **Archetype-aware section validator** (required H2 sections per archetype; empty sections) | Per file | Error / Warn |
| **Routing quality — empty keywords** (`scope: codebase` or `routing_groups` skills must have keywords) | Per file | Error |
| **Routing quality — description-in-Coverage duplication** (description text copied verbatim into `## Coverage`) | Per file | Warn |

```bash
# Lint every skill under skills/
node scripts/skill-lint.js

# Lint a single skill directory
node scripts/skill-lint.js skills/documentation

# Also lint the example template
node scripts/skill-lint.js --include-template

# Skip the generator parity check (useful during initial setup)
node scripts/skill-lint.js --skip-generator-parity

# Promote warnings to errors (zero-warning CI enforcement)
node scripts/skill-lint.js --strict

# Suppress ANSI colour codes (plain output for CI logs)
node scripts/skill-lint.js --no-color
```

Exit code 0 means all checks passed. Exit code 1 means one or more files failed. Warnings do not affect the exit code unless `--strict` is active.

### check-contract-consistency.js — cross-artifact contract checks

`scripts/check-contract-consistency.js` validates the consistency of the contract documents and example artifacts against each other. This is complementary to `skill-lint.js` — where lint validates per-skill schema correctness, the contract checker validates that the contract documents themselves are internally consistent.

The script runs six checks:

| Check | What it detects | Level |
|-------|----------------|-------|
| **C1 Field-set parity** | `docs/field-reference.md` section headers match `schemas/skill.schema.json` top-level properties exactly | Error |
| **C2 Authored-to-generated parity** | Every authored field in `skill.schema.json` appears in `manifest.schema.json` (possibly grouped) or is listed as intentional loss in `docs/manifest-contract.md` | Error |
| **C3 Artifact-root convention** | Shipped audit examples (those under `examples/audits/`) are not referred to by the bare `audits/<skill>/` root in docs (which is the consumer/adopter convention) | Warn |
| **C4 Sample manifest correctness** | `examples/skills.manifest.sample.json` validates against `schemas/manifest.schema.json` and `summary.total_skills` equals `skills.length` | Error |
| **C5 Example truth invariants** | Scorecards don't claim unqualified all-target portability; eval artifacts don't use the deprecated v1 `eval_status` JSON key; scorecards don't use v1 portability sub-field names (`level`, `exports`) | Error |
| **C6 Versioned schema parity** | The pinned copy of the CURRENT schema version (`schemas/skill.v{N}.schema.json` + `schemas/manifest.v{N}.schema.json`, where N is read from `schema_version` in the unversioned schema) is content-identical to the unversioned files modulo `$id` and `title`. Prior-version pinned copies must still exist but are frozen (not parity-checked). Guarantees the latest-pin does not drift from the current-version-pin. | Error |

```bash
# Run all contract consistency checks
node scripts/check-contract-consistency.js

# Show per-check OK messages as well as errors
node scripts/check-contract-consistency.js --verbose
```

Exit code 0 means all checks passed (warnings do not affect the exit code). Exit code 1 means at least one check failed.

### Archetype section map

Each archetype requires a minimum set of H2 body sections:

| Archetype | Required sections |
|-----------|------------------|
| `capability` | `## Coverage`, `## Philosophy`, `## Verification`, `## Do NOT Use When` |
| `workflow` | `## Coverage`, `## Philosophy`, `## Workflow`, `## Verification`, `## Do NOT Use When` |
| `router` | `## Coverage`, `## Routing Rules`, `## Do NOT Use When` |
| `overlay` | `## Coverage`, `## Overlay Rules`, `## Extends`, `## Do NOT Use When` |

Lint errors on missing sections. Lint warns on sections that exist but contain fewer than 50 non-whitespace characters (empty-placeholder guard).

## License

Dual-licensed across two non-overlapping bodies of work:

- **Code** (everything outside `skills/**`) — Apache License 2.0. See [`LICENSE`](LICENSE).
- **Skill content** (markdown files under `skills/**`) — Creative Commons Attribution 4.0 International ([CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/)).

When redistributing or adapting skills, attribute as: *"Skills from @agent-orchestration-tools/skill-graph (https://github.com/jacob-balslev/skill-graph), licensed CC-BY-4.0."* See [`NOTICE`](NOTICE) for the full dual-licensing terms, third-party disclaimers, and skill provenance.
