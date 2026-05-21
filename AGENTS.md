# Agent Instructions for Skill Graph

> Type: Repository guide
> Scope: Applies to this `skill-graph` repository.

This repo defines the Skill Metadata Protocol and the Skill Graph reference toolchain. Treat it as a protocol/schema/tooling project, not as an agent runtime, hosted marketplace, persistent memory system, or prompt library.

<!-- SKILL-GRAPH-CHARTER v1 — CANONICAL SOURCE. This Mission/Vision + Three-Layers
     block is mirrored verbatim into every active Skill Graph project repo's AGENTS.md
     (currently: skill-graph, skills). If you change it here, update the mirrors in the
     same change. Deprecated docs-only mirrors (skill-metadata-protocol, skill-audit-loop)
     are intentionally NOT mirrored — no active agent work happens there. -->

## Mission and Vision

**Mission.** A `SKILL.md` teaches an AI agent a capability — a framework, tool, workflow, methodology, or project convention. The base `SKILL.md` spec (adopted by Claude, Codex, Gemini, Copilot, and Cursor) carries only two fields: `name` and `description`. **Two fields cannot scale a real library.** They do not declare what *area* a skill covers, which *group* it belongs to, which *domains and files* are in scope, what it is *relevant to*, or what it is *not responsible for*. The downstream symptoms are always the same: wrong-skill routing, scope ambiguity, silent overlap, and undetected staleness. **Skill Graph's mission is to make a teaching-skill library scale by making each skill's relevance, scope, grounding, and relationships explicit — so the right skill is found for the right task, stays in its lane, and can be audited and iterated as the library grows.**

**Vision.** A portable, navigable graph of agent capabilities in which every skill self-declares what it teaches, what it is for, which group and domains it belongs to, what grounds it, and what it is explicitly *not* responsible for — readable by routers, agents, and humans alike, exportable back to plain `SKILL.md` so it runs across every runtime, and self-describing enough that a library of hundreds of skills stays coherent instead of decaying into a flat folder of name-and-description guesses. The goal state is structure that is visible enough to **route, audit, maintain, and scale.**

## Core Thesis

**Skill Graph turns skills from loose prompt files into structured knowledge objects.** By adding metadata, relations, grounding, and audit state, each skill becomes easier to:

- **Predict** — what it can do, when it should activate, and where its boundaries are.
- **Categorize** — which domain, type, scope, project, or routing group it belongs to.
- **Triangulate** — which adjacent, dependent, boundary, and verification skills should be loaded with it.
- **Improve** — what is stale, unverified, overlapping, under-evaluated, or behaviorally weak.

**Strong phrasing.** Skill Graph makes skills legible. By introducing structure and organization to `SKILL.md`, it becomes possible to predict what a skill should do, route it to the right task, place it in the right category, triangulate it with neighboring skills, and improve it through repeatable audits instead of ad hoc editing.

## The Three Layers — What Each Is Supposed To Do

There are three named things. Keep them distinct; never collapse one into another.

**Bottom line:** the Skill Graph ecosystem has three distinct layers.

| Layer | Role | Analogy | Mission |
|---|---|---|---|
| **Skill Metadata Protocol** | Per-skill contract | Type system for each skill | Make every skill's relevance and boundaries explicit enough that agents stop guessing when to load it. |
| **Skill Graph** | Library-level system | Query/index layer over all skills | Make a teaching-skill library scale by turning many separate skills into a coherent, navigable graph. |
| **Skill Audit Loop** | Maintenance discipline | CI plus improvement loop | Keep skills honest as codebases, docs, concepts, and agent behavior drift. |

1. **Skill Metadata Protocol — the per-skill contract (the substrate).**
   *What it is supposed to do:* make each skill's relevance **explicit**. Every `SKILL.md` declares typed frontmatter — scope, area/category, domain, file surfaces (`paths` / `grounding`), dependencies, related skills, and boundaries (what it is *not* for). This is the contract that turns "name + description" into something a machine can route, group, and check. It is the substrate: without typed fields there is no graph to query and no deterministic gate to audit against. It turns a skill from "a Markdown instruction file" into a **machine-readable relevance contract** that can be linted, compiled into a manifest, routed against, drift-checked, and audited. **When you author or edit a skill, your job is to make its relevance and boundaries true and explicit.** Binding docs: `SKILL_METADATA_PROTOCOL.md`, `docs/field-reference.md`.

2. **Skill Graph — the library-level system (what reasons over the metadata).**
   *What it is supposed to do:* operate on that metadata across the **whole library**. Route a query to the best-matching skill; show which skills are related, which domains/groups they belong to, and where boundaries lie; detect overlap and boundary violations; drift-check grounding against source-of-truth; and export back to portable `SKILL.md`. It turns a folder of skills into a typed graph an agent, router, or human can reason over. Each node is a `SKILL.md`; each edge is a typed relation such as `relations.related`, `relations.boundary`, `relations.verify_with`, or `relations.depends_on`. It supplies schema validation, manifest compilation, routing, clustering, overlap detection, drift sentinel checks, audit artifacts, evals, and export back to plain `SKILL.md`. It is **build-time / authoring-time tooling — not** an agent runtime, hosted marketplace, or memory system; consumers read from the graph, they do not redefine it. Authority map: `SKILL_GRAPH.md`.

3. **Skill Audit Loop — the discipline that keeps it honest (what the structure enables).**
   *What it is supposed to do:* answer **one question per skill** — *does it still teach an agent to do the thing it claims to teach?* Shape: `read → fix → test → next`; one field per commit, kept or reverted on a single measurable signal (Karpathy keep-or-revert). Its four operations are `audit`, `improve`, `evaluate`, and `evolve`. It has two gates: the **Integrity Gate** proves the skill is structurally valid, grounded, routable, and export-safe; the **Behavior Gate** proves the skill changes agent behavior on realistic positives, hard negatives, prior failures, and boundary cases. The four-verdict Health Block records the result on the skill itself: `structural_verdict`, `truth_verdict`, `comprehension_verdict`, and `application_verdict`. **`application_verdict == APPLICABLE` is the only verdict that certifies a skill is *useful*** — `structural` / `truth` / `comprehension` are the floor it must clear, never the target. It is **not a lint-test factory**; an empty findings report on a genuinely good skill is a PASS. Procedure: `SKILL_AUDIT_LOOP.md`.

**Trunk and leaf.** The mission is relevance-at-scale: the **Protocol** makes relevance explicit, the **Graph** makes it queryable, and the **Audit Loop** keeps it true. Routing the right teaching-skill is the trunk; auditing whether that skill teaches well is the leaf the explicit structure enables. Do not mistake the audit mechanism for the mission.

## Start Here

Read these files before changing behavior or docs:

1. `README.md` - project purpose, public positioning, quick start, repository map.
2. `SKILL_GRAPH.md` - authority tiers and how schemas, docs, scripts, examples, and skills relate.
3. `SKILL_METADATA_PROTOCOL.md` - top-level normative protocol contract.
4. `docs/skill-metadata-protocol.md` - deeper rationale, archetypes, migration policy.
5. `docs/field-reference.md` and `docs/field-decision-guide.md` - field-level semantics and decision tables.
6. `docs/manifest-field-mapping.md` - authored-to-generated manifest projection rules.
7. `CONTRIBUTING.md` - contribution boundaries, skill authoring workflow, PR expectations.
8. `docs/quality-doctrine.md` - quality bar for scope preservation, readable names, compression, verification, and organization-over-trimming.

For audit work, also read `SKILL_AUDIT_LOOP.md` and `SKILL_AUDIT_CHECKLIST.md`.

## Project Shape

- Runtime: Node.js >= 20.
- Package: `@skill-graph/cli`.
- Package manager recorded in `package.json`: `pnpm@9.15.0`.
- The scripts use only Node built-ins today; there are no package dependencies.
- Public CLI entrypoint: `bin/skill-graph.js`.
- Current public release checkpoint in docs: `0.5.8` on `2026-05-19` (Karpathy-loop Phase 2 release; see [`CHANGELOG.md`](CHANGELOG.md#058--2026-05-19)).
- Current skill contract: `schema_version: 7` (four-verdict Health Block — `structural_verdict` / `truth_verdict` / `comprehension_verdict` / `application_verdict` replace the single v6 `audit_verdict`). The v6 aggregate-verdict field is removed because it conflated form, truth, comprehension, and behavior under one PASS/FAIL signal that masqueraded as quality; `application_verdict` is the new primary quality signal and certifies behavior change on real artifacts. See [ADR 0011](docs/adr/0011-split-audit-verdict-into-four-verdicts.md). Migrations v4→v5, v5→v6, and v6→v7 are all complete across the 284-active + 52-archived canonical workspace; see `docs/migrations/v4-to-v5.md`, `docs/migrations/v5-to-v6.md`, and `docs/migrations/v6-to-v7.md` for breaking-change matrices.
- This repo is the **canonical consolidated implementation** post-2026-05-18 (commit `654b4df`; see [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md) and SH-6137). Schemas, audit scripts, graders, eval fixtures, examples, and the protocol/audit canonical docs all live here. The canonical skill library (143 `SKILL.md` files, verified 2026-05-21 via `find /Users/jacobbalslev/Development/skills/skills -name SKILL.md`; `SKILL_GRAPH.md § Current State` is the single-source-of-truth count) lives at `/Users/jacobbalslev/Development/skills/`. The previously separate `skill-metadata-protocol` and `skill-audit-loop` mirrors are preserved as docs-only deprecation mirrors — they were **archived (read-only) on GitHub on 2026-05-20** ([ADR 0009 § Update](docs/adr/0009-sibling-repo-deprecation.md)) and no longer carry active source code. `examples/` still holds specimen projects and per-skill comprehension evals.
- Workspace config at `.skill-graph/config.json` points lint, manifest, drift, route, and truth_source resolution at the canonical sibling skills repo by default. `SKILL_GRAPH_WORKSPACE` env-var still overrides — useful when developers clone the canonical repo elsewhere. Truth_source paths starting with `skills/<name>/SKILL.md` are resolved via `scripts/lib/roots.js::resolveTruthSourcePath()`: skill-library-aware first, with REPO_ROOT fallback.

## What the Skill Graph Is

The Skill Graph is a routable, evaluable, drift-checked knowledge graph of agent capabilities. Each node is a `SKILL.md` — frontmatter (the contract) plus body (the operational guidance). Each edge is one of:

- `relations.related` — adjacency for browse and routing expansion.
- `relations.boundary` — explicit "use that skill instead, because…" with a reason field.
- `relations.verify_with` — "when this skill is applied, verify the result with that skill" (cross-check).
- `relations.depends_on` — composition; "this skill assumes the reader has the other in scope."

The graph is not a documentation pile. It is queried by routers, traversed by injection hooks, evaluated against retrieval baselines, and drift-checked against source-of-truth files. Two skills are "the same kind" iff they share a `category × type × scope` triple plus a head noun; the routing layer uses that triple as a first-pass discriminator before walking edges.

This shape is what distinguishes the Skill Graph from prompt libraries, agent-runtime config, hosted marketplaces, and personal memory systems. It is a protocol-and-tooling project that produces a navigable graph; consumers (routers, agent runtimes, hosted marketplaces) read from it but do not redefine it.

## Skill Metadata Protocol — Quick Reference

The Skill Metadata Protocol is the frontmatter contract every `SKILL.md` ships against. Treat this section as the working summary; `SKILL_METADATA_PROTOCOL.md` and `docs/field-reference.md` are the binding documents.

Core required axes:

- `name` — kebab-case, head-noun-anchored (see `docs/head-noun-glossary.md`); aligns with parent directory.
- `description` — routing contract: positive trigger phrases + explicit negative boundary (`Do NOT use for X (use that-skill).`).
- `type` — `capability` (teaches domain) / `workflow` (enforces sequence) / `router` (directs) / `overlay` (adds local truth).
- `scope` — `portable` (universal) / `reference` (vendor/spec-grounded) / `codebase` (this repo only; requires `grounding`).
- `category` — closed enum (since v5, current in v7): `{foundations, engineering, design, quality, agent, product}` (browse facet, not ontology truth). Enforced by the schema `enum` and `scripts/lint/check-category-enum.js`.

Understanding-fields contract (when `comprehension_state: present`) — see `SKILL_METADATA_PROTOCOL.md` § Understanding for the binding rules:

- Requires the **five flat top-level Understanding fields** (v6+): `mental_model`, `purpose`, `boundary`, `analogy`, `misconception`. The legacy nested `concept` block (`definition / mental_model / purpose / boundary / taxonomy / analogy / misconception`) is deprecated and accepted only for v5 back-compat; flat fields win when both are present.
- Understanding-field content must contain no repo-specific nouns (no Sales Hub, no orchestrator-ui, no internal file paths) — the concept being taught is universal, not repo-bound.

Lifecycle fields that must remain truthful, not aspirational:

- `freshness` and `drift_check.last_verified` — set when actually verified.
- `eval_artifacts` (`present` / `planned` / `none`) and `eval_state` (`unverified` / `passing` / `monitored`) — `passing` is a claim that requires evidence (an `eval_last_run` receipt) in the same change.
- `routing_eval` (`absent` / `present`) — has the skill been included in a routing eval against the retrieval baseline.

Authoring a new skill always starts from `examples/skill-metadata-template.md`, never from a hand-typed frontmatter block.

## Authority Tiers

Follow the tier model in `SKILL_GRAPH.md`.

1. Tier 1 schema files in `schemas/` are the binding machine contract.
2. Tier 2 docs explain Tier 1; if docs disagree with schema, fix the docs or intentionally change the schema with matching migration notes.
3. Tier 3 scripts enforce, compile, migrate, or export the contract.
4. Tier 4 consumer tools route, check drift, and inspect the graph; they consume the contract but do not redefine it.
5. Tier 5 examples and starter skills are specimens; if they fail the contract, the specimen is wrong.

Governance files such as `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `.github/`, `LICENSE`, and `NOTICE` govern the repo, not the protocol shape.

## Quality Doctrine

Quality means the artifact becomes more correct, complete, understandable, verifiable, and maintainable. It does not mean shorter. It does not mean fewer skills, fewer examples, fewer fields, shorter names, thinner descriptions, or smaller bodies.

Do not reduce the project to save space, complexity, launch effort, review burden, or agent context. Preserve the full intended breadth of the skill library, examples, docs, evals, and tool surfaces unless the user explicitly asks to remove something. Prioritization means ordering work; it is not permission to drop coverage. A short demo, example set, or entry point is a front door only, never a cap on the project.

Handle scale by organizing it: manifests, routing groups, tags, categories, indexes, generated views, phased execution order, evals, overlap checks, and clear navigation. If something feels too large, first add structure, references, tables, anchors, generated artifacts, or retrieval paths. Do not trim meaning to reduce token count.

Do not "optimize" titles, descriptions, bodies, field names, metadata keys, or identifiers by making them shorter at the cost of meaning. Keep names readable, searchable, and self-explanatory. Prefer explicit names such as `skill_graph_protocol`, `skill_graph_source_repo`, and `skill_graph_canonical_skill` over compressed aliases such as `sg_protocol`, `src`, or `canon`, unless a binding external schema, protocol limit, or explicit user request requires the shorter form.

Compression is allowed only when it preserves meaning and evidence. A valid compression preserves intent, outcome, constraints, names, boundaries, and evidence paths. Invalid compression removes examples, weakens titles/descriptions, hides findings, shortens readable identifiers into opaque abbreviations, or collapses distinct concepts into one vague bucket.

When an external format imposes a hard limit, satisfy the limit in a generated/export-specific artifact and preserve the canonical Skill Metadata Protocol source. Document the constraint and point back to the full source instead of weakening the source artifact.

Before changing agent behavior instructions, quality rules, marketplace positioning, or skill-library structure, load the relevant local skills from this repo and from the sibling Development skill library when available. At minimum, check the relevant Skill Graph skills (`semantics`, `information-architecture`, `context-engineering`, `skill-scaffold`, `skill-infrastructure`, `graph-audit`) and the broader Development skills that govern quality (`quality-doctrine`, `no-cutting-corners`, `compression`, `token-efficiency`) when the task touches those concerns.

Claims of quality require verification. If a change says links work, routing works, exports validate, descriptions fit a limit, or all findings are preserved, run the relevant command and report the result. If verification was not run, say so.

## Version Labels Are Earned, Not Bumped

A version number on a skill — `schema_version`, `skill_graph_protocol`, and any `vN` label — asserts that the skill's **content** meets that version's bar. Advancing the number is honest only after the substantive migration the version represents has actually been performed. Bumping a label without doing that work is fake-conformance: the same class of doc-lie as `eval_state: passing` without an `eval_last_run` receipt, or `application_verdict: APPLICABLE` without a gate-9 eval.

- **`schema_version` is the mechanical shape; the content label is the substantive bar.** The `migrate-skill-vN-to-vM.js` codemods bump `schema_version` corpus-wide — a shape migration a script *can* do. The deeper content each version introduced is **not** something a codemod can author: v6 introduced the five flat Understanding fields (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`) + `comprehension_state`; v7 introduced the four-verdict Health Block. A skill only earns the v6/v7 content label when that content is actually present and reviewed.
- **A label mismatch is HONEST, not drift.** A skill with `schema_version: 7` but `skill_graph_protocol: Skill Metadata Protocol v5` is correctly recording that the schema bump ran but the v6/v7 content migration did not (e.g., it has no Understanding fields). Do **not** "fix" this by editing the label. Fix it by doing the migration, then advancing the label — never the reverse. (Verified 2026-05-20: 115 source skills carry `v5` and 25 carry `v6`; the `v5` ones genuinely lack Understanding fields, the `v6` ones have them. The labels are accurate.)
- **Never run a find-replace that changes only a version label.** A bulk `sed`/codemod of `vN` → `vM` across `SKILL.md` files with no content change is prohibited. A backlog of skills on an older content label is migration work to schedule, not a string to replace.
- **Known tension to resolve:** `scripts/export-marketplace-skills.js` hardcodes `skill_graph_protocol: Skill Metadata Protocol v7` (`SKILL_GRAPH_PROTOCOL`, line 41) on **every** exported skill, regardless of the source content level. This conflates "exported by v7 tooling" with "content verified at v7." Until the field's meaning is pinned down, do not treat the exported `skill_graph_protocol` as a content-conformance signal.

## Editing Rules

- Version labels are earned, not bumped — never advance `schema_version` / `skill_graph_protocol` / any `vN` label without the matching content migration (see § Version Labels Are Earned, Not Bumped).

- Keep one logical change per commit or PR.
- Preserve the current narrow scope: protocol, schemas, deterministic tooling, examples, docs, evals, audit artifacts, and portable `SKILL.md` export.
- Do not add proprietary company-specific skills, hosted service assumptions, prompt-library content, or agent runtime layers.
- Do not make breaking schema changes without a `schema_version` bump, migration notes, pinned schema copies, and migration tooling.
- Do not hand-edit generated artifacts unless the owning script says to. `docs/field-reference.generated.md` is generated by `scripts/build-field-reference.js`.
- Do not hide findings during audits. If a check or audit emits N findings, preserve all N, then recommend prioritization separately.
- Do not commit local-only agent state or research output unless explicitly intended and scrubbed. `.artifacts/`, `.claude/`, `.research/`, `.roundtable/`, `audits/_state/`, and `audits/sweep-ledger.jsonl` are ignored for a reason.
- Never commit secrets, PII, private filesystem telemetry, credentials, tokens, or public-endpoint logs containing sensitive data.

## Coupled Changes

When touching one artifact, update the matching tier artifacts in the same change.

- If you change `schemas/skill.schema.json`, also update `schemas/skill.v7.schema.json` (the pinned copy of the current contract — see `npm run protocol:check § C6`) and any prior pinned versions only when intentionally backporting, plus `docs/field-reference.md`, `docs/skill-metadata-protocol.md`, `SKILL_METADATA_PROTOCOL.md` when relevant, `docs/manifest-field-mapping.md`, and `examples/skill-metadata-template.md` when affected. Regenerate `docs/field-reference.generated.md` with `node scripts/build-field-reference.js` in the same commit (enforced by `protocol:check § C7`).
- If you change `schemas/manifest.schema.json`, also update `schemas/manifest.v7.schema.json` (the pinned copy of the current contract), `docs/manifest-field-mapping.md`, and `scripts/generate-manifest.js` if projection logic changes.
- If you change `scripts/generate-manifest.js`, regenerate `examples/skills.manifest.sample.json`.
- If you change `scripts/skill-lint.js`, run it against every skill and the template. Update sample manifest or drift baselines when lint-affecting sources are part of `drift_check.truth_source_hashes`.
- If you change a Tier 2 protocol doc, check sibling Tier 2 docs for drift. The overview, field reference, decision guide, and manifest mapping must tell one story.
- If you change any grounded starter skill with `grounding.truth_sources`, re-record drift baselines with `node scripts/skill-graph-drift.js --record --apply skills/<name>` when the truth source hash is intentionally changing.
- If you add, remove, or rename a skill under `skills/`, the marketplace surface in `marketplace/skills/` is stale until you run `node scripts/export-marketplace-skills.js` (followed by `--check`) and the canonical user-facing release at `https://github.com/jacob-balslev/skills` is stale until you sync the marketplace surface into it and push. See `## Public Distribution — Canonical URL Contract` for the two-step protocol.
- If you introduce a new head noun in a skill name, update `docs/head-noun-glossary.md` in the same change. The glossary is a lint surface; adding a name with an unknown head noun without registering it produces a lint warning.
- If a skill's marketplace description exceeds the 1024-char limit, add an `EXPORT_DESCRIPTION_OVERRIDES` entry in `scripts/export-marketplace-skills.js` *in the same change* — do not shorten the canonical description to fit the marketplace.

## Document Routing Table

When a code or schema change lands, update the matching documentation rows in the same commit. This table covers the broader doc surface; for tier-coordinated changes (schema, lint, manifest projection) the stricter coupling rules in `## Coupled Changes` above take precedence. Generated artifacts (marked _generated_) must be regenerated by their owning script — never hand-edited.

| What Changed | Update These Documents |
|---|---|
| **CLI behavior** (`bin/skill-graph.js`, new flag, new subcommand) | `README.md` § quick start, `docs/QUICKSTART-30MIN.md`, `CHANGELOG.md`, `--help` output |
| **New script** in `scripts/` | `AGENTS.md` § Validation Commands (if user-runnable), `package.json` scripts (if exposed via `npm run`), `CHANGELOG.md` if user-facing |
| **Migration script** (`scripts/migrate-skill-vN-to-vM.js`) | `docs/migrations/vN-to-vM.md` (new file), `CHANGELOG.md`, `AGENTS.md` § Project Shape if the active schema version advances |
| **GitHub Actions workflows** (`.github/workflows/*.yml`) | `AGENTS.md` § GitHub Actions if conventions changed, `CONTRIBUTING.md` § PR expectations if developer workflow affected |
| **Marketplace export pipeline** (`scripts/export-marketplace-skills.js`, `scripts/verify-skill-md-export.js`) | `marketplace/README.md` (_generated_), `docs/marketplace-syndication.md`, `AGENTS.md` § Public Distribution. Never hand-edit `marketplace/skills/` — it regenerates from sibling `~/Development/skills/` |
| **`marketplace/skills/<name>/SKILL.md`** (the mirror) | _generated_ — do not hand-edit. Edit the canonical source at `~/Development/skills/skills/<category>/<name>/SKILL.md` and re-run `node scripts/export-marketplace-skills.js` |
| **Public canonical URLs** (skills.sh, GitHub release repo) | `AGENTS.md` § Public Distribution — Canonical URL Contract, `README.md`, `CHANGELOG.md`, every script/doc that emits a URL |
| **Schema deprecation, repo split, sibling-repo lifecycle** | New ADR in `docs/adr/NNNN-<slug>.md`, `AGENTS.md` § Project Shape, `CHANGELOG.md`, `SKILL_GRAPH.md` if authority tiers change |
| **Field semantics, head nouns, decision tables** | `docs/field-reference.md`, `docs/field-decision-guide.md`, `docs/field-rationale.md`, `docs/head-noun-glossary.md`, `docs/glossary.md`. Regenerate `docs/field-reference.generated.md` via `node scripts/build-field-reference.js` in the same commit (enforced by `protocol:check § C7`) |
| **Routing eval changes** (`scripts/skill-graph-routing-eval.js`, retrieval baselines) | `docs/ROUTING-METRICS.md`, `docs/recommended-skills.md`, retrieval baselines under `evals/retrieval-baseline-*.json` |
| **Skill audit loop or checklist** (`scripts/skill-audit.js`, `lib/audit/*`) | `SKILL_AUDIT_LOOP.md`, `SKILL_AUDIT_CHECKLIST.md`, `AGENTS.md` § Skill Audit Loop |
| **Marketplace publication tooling/queue** | `docs/marketplace-publication-queue.generated.md` (_generated_), per-snapshot `docs/marketplace-publication-priority-YYYY-MM-DD.md` if a new priority cut is published |
| **Proposals** | `docs/proposals/*.md` (the proposal file itself); if accepted, follow through to the canonical doc and an ADR in the same change |
| **Plans** | `docs/plans/*.md` (the plan file); when completed, move from active to `docs/_archived/` |
| **Research findings** | `docs/research/*.md` (the research file); if findings drive a change, also update the affected canonical doc in the same commit |
| **New ADR** (architectural decision) | `docs/adr/NNNN-<slug>.md` (new), `CHANGELOG.md` if architecturally visible, `AGENTS.md` if governance changes |
| **Schema, lint, manifest projection** | See `## Coupled Changes` above — tier-coordinated changes have stricter coupling rules than this table |
| **README / public positioning** | `README.md`, `docs/positioning-vs-marketplaces.md`, `docs/ADOPTION.md` if adoption surface changes, `CHANGELOG.md` if user-visible |
| **Quality doctrine, editing rules, audit anti-patterns** | `AGENTS.md` (this file), `docs/quality-doctrine.md`, `SKILL_AUDIT_CHECKLIST.md` |
| **Generated artifacts** (`docs/field-reference.generated.md`, `examples/skills.manifest.sample.json`, `docs/marketplace-publication-queue.generated.md`, `marketplace/skills/`) | _generated_ — do not hand-edit. Regenerate via the owning script (see `## Coupled Changes`) |

**Stale-reference rule:** When renaming or deleting any file, command, flag, or URL referenced in this repo, grep `*.md`, `*.yml`, `*.json`, and `package.json` for the old name and fix every hit in the same commit. The `## Coupled Changes` rules enforce this for tier artifacts; this rule extends it to the rest of the surface.

**Cross-repo coordination:** Changes that affect the sibling `~/Development/skills/` (canonical SKILL.md source) or the deprecation-mirror `~/Development/skill-metadata-protocol/` must be coordinated per [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md). The Development orchestration brain (`~/Development/.claude/`, `~/Development/scripts/`) is read-only from this repo — never mutate Development files from within skill-graph commits.

## Skill Authoring

For non-trivial new skills, write a short spec and plan first as described in `CONTRIBUTING.md`.

- Start from `examples/skill-metadata-template.md`.
- Put each skill in `skills/<skill-name>/SKILL.md`.
- Keep `name:` lowercase and aligned with the parent directory.
- Write `description:` as a routing contract: clear positive trigger plus explicit negative boundary.
- Pick `type` honestly: `capability`, `workflow`, `router`, or `overlay`.
- Pick `scope` honestly: `portable`, `reference`, or `codebase`.
- Add `grounding` for `scope: codebase`.
- Point every `relations.*` target at an existing sibling skill.
- Keep `eval_artifacts`, `eval_state`, and `routing_eval` truthful.
- Remove template teaching comments before committing a derived skill.

## Evaluation Discipline

The Skill Graph evaluates four layers; each has its own surface and its own definition of "good." Conflating them is the source of most eval debt.

### What we evaluate

| Layer | Question answered | Surface |
|---|---|---|
| Per-skill comprehension | Does an agent given this `SKILL.md` answer realistic scenarios correctly? | `evals/evals.json` (or `examples/evals/<skill>.json`) |
| Routing | Does the router fire the right skill(s) for a given query? | `scripts/skill-graph-routing-eval.js` + retrieval baseline at `evals/retrieval-baseline-*.json` |
| Manifest / contract | Does the generated manifest match the skill source 1:1, no parity drift? | `scripts/generate-manifest.js --validate-only` and the sample manifest |
| Drift | Has the skill's truth source (cited file, schema, doc, external spec) changed since the skill claimed `last_verified`? | `scripts/skill-graph-drift.js` against `drift_check.truth_source_hashes` |

### What a good comprehension eval looks like

- **≥7 realistic scenarios** per skill — not trivia, not pattern-matching, not single-line "is this X" prompts. Each scenario should require the skill's specific judgment to answer correctly.
- **Repo-grounded** when the skill is `scope: codebase`; spec/standard-grounded when `scope: reference`; principle-grounded when `scope: portable`.
- **At least one negative expectation per eval** — what the answer must *not* say or do. Negative expectations catch silent scope reduction and softened-failure responses.
- **Archetype-matched coverage:**
  - `capability` evals test domain correctness, scope boundaries, anti-pattern recognition.
  - `workflow` evals test sequencing, gate enforcement, failure-mode handling.
  - `router` evals test correct owner-skill routing and explicit refusal to over-own.
  - `overlay` evals test local-truth correctness and clear delineation from base skill.

### What a good routing eval looks like

- A baseline corpus of ≥30 queries spanning the domains the library claims to cover.
- For each query: which skill(s) the router activates today, which it *should* activate (human-reviewed), and whether the human reviewer agrees.
- Target outcomes when running a migration or large refactor: success rate ≥10% improvement on the baseline; duplicate activations down ≥30%; category inter-reviewer agreement ≥90% on a fresh 30-skill sample. Regressions on any of those are migration failures, not "small drift."

### Truth and verification

- `eval_state: passing` (or `monitored`) is a claim that the eval was run and passed in the same change. Setting `passing` without evidence (an `eval_last_run` receipt) is a doc lie and fails the No-Unverified-Claims rule.
- `eval_state: unverified` is the correct default for a new skill until evals exist and pass.
- `routing_eval: absent` is honest for a skill that has not yet appeared in a routing eval; flipping to `present` requires the eval to actually include the skill.
- Drift baselines (`drift_check.truth_source_hashes`) must be re-recorded when truth sources intentionally change, and never silently bumped to mask drift.

### Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Eval with only positive expectations | Cannot detect filtering, softening, or scope reduction. |
| Eval that paraphrases the skill body back to itself | Measures the skill's prose, not an agent's comprehension of it. |
| Single-scenario eval | Below the ≥7 threshold; insufficient signal. |
| `eval_state: passing` without re-running the eval in this change | Stale truth claim; fails the No-Unverified-Claims rule. |
| Routing eval that excludes the skills under review | Self-confirming; not a real test. |
| Using vibe judgments instead of the retrieval baseline | Migration claims need numeric comparison, not memory. |

## Skill Audit Loop

The audit loop is the disciplined sweep that validates a skill (or a batch of skills) against the Skill Metadata Protocol, drift baselines, retrieval evals, and the quality doctrine. Full contract: `SKILL_AUDIT_LOOP.md` plus `SKILL_AUDIT_CHECKLIST.md`. This section is the operational summary.

### When to run the loop

- Before a release tag or marketplace export push.
- After bulk skill changes (migration, wave authoring, schema bump).
- When the routing eval shows a regression that points at specific skills.
- On a recurring cadence for the active library (typically per cycle).

### What the loop must produce

A complete report — never a stepping stone to fixes. The audit deliverable is the report itself; remediation is a separate task created from the report.

For every audited skill, the loop produces evidence on:

1. **Schema conformance** — `node scripts/skill-lint.js skills/<name>/SKILL.md` clean, no warnings hidden behind filters.
2. **Manifest parity** — the skill round-trips through `scripts/generate-manifest.js` without drift.
3. **Drift status** — `scripts/skill-graph-drift.js` agrees with declared `last_verified` and truth-source hashes.
4. **Eval coverage** — `evals/evals.json` exists, has ≥7 scenarios, has at least one negative expectation per scenario; `eval_state` reflects reality.
5. **Routing presence** — the skill is referenced in at least one routing eval that passes; `routing_eval` is honest.
6. **Relations resolution** — every `relations.*` target exists in the configured roots; no dangling pointers.
7. **Description hygiene** — positive trigger phrases present, explicit negative boundary present, marketplace description (if exported) ≤ the marketplace limit (currently 1024 chars).
8. **Understanding-fields gate (when `comprehension_state: present`)** — the five flat fields (`mental_model`, `purpose`, `boundary`, `analogy`, `misconception`) populated (legacy nested `concept` block accepted for v5 back-compat only), no repo-specific nouns in the Understanding-field content.

### Findings completeness

Findings preservation is non-negotiable. If the audit emits N findings, the report contains N findings. The audit may *recommend* a prioritization (e.g., "address findings 1–3 before release; defer 4–9"), but never drops findings unilaterally. This rule mirrors and reinforces `Editing Rules` above.

Findings carry a severity column drawn from a fixed schema — `CRITICAL` (contract violation; ship-blocker), `HIGH` (correctness/clarity gap; pre-release), `MEDIUM` (drift, doc rot, minor structural), `LOW` (cosmetic), `INFO` (observation, no action). Severity is a column, not a prose qualifier.

### Audit anti-patterns

- "Top 5 findings" or any subset framing — drops information the user must see.
- Severity inflation/deflation to land at a desired total — distorts the priority signal.
- Filing audit findings into Linear without first stating them in the report — splits truth across surfaces.
- Marking a skill `eval_state: passing` as part of an audit without running the eval in the same change.
- Marking a finding "fixed" inside the audit report — the audit is report-only; fixes are downstream tasks.

## Validation Commands

Use the full repo verification before handing off substantive changes:

```bash
npm run verify
```

Useful focused checks:

```bash
node scripts/skill-lint.js --include-template
node scripts/check-protocol-consistency.js
node scripts/check-markdown-links.js
node scripts/generate-manifest.js --include-template --validate-only
node scripts/skill-graph-routing-eval.js --manifest examples/skills.manifest.sample.json --only-asserted
node scripts/verify-skill-md-export.js
node lib/audit/eval-staleness-checker.js
node scripts/skill-overlap.js
node scripts/skill-graph-drift.js
node bin/skill-graph.js --help
```

For routing diagnostics:

```bash
node scripts/skill-graph-route.js "audit my skills for schema conformance"
node scripts/skill-graph-routing-eval.js --only-asserted --confusion-matrix
```

For audit scaffolding:

```bash
node scripts/skill-audit.js <skill-name>
node scripts/skill-audit.js <skill-name> --graded --grader-cli "<command>"
```

## GitHub Actions

Keep `.github/workflows/skill-graph-lint.yml` aligned with `package.json` scripts and this repo's actual file names. The protocol consistency script is `scripts/check-protocol-consistency.js`.

CI should cover lint, protocol consistency, manifest generation or validation, routing evals, export verification, markdown links, overlap, and the unit smoke tests.

## Public Distribution — Canonical URL Contract

The Skill Graph has exactly one public-facing user destination for skills published to skills.sh:

**Canonical user URL:** `https://www.skills.sh/jacob-balslev/skills/`
**Canonical GitHub source:** `https://github.com/jacob-balslev/skills` (default branch `main`, public repo, plain Agent Skills-compatible `SKILL.md` files under `skills/<name>/`).
**Install command:** `npx skills add jacob-balslev/skills`

Treat that destination as the only valid answer to "where do users find our skills." Every doc, README, install instruction, marketing surface, and CI artifact must point at it.

### What `jacob-balslev/skill-graph` IS and IS NOT

- `github.com/jacob-balslev/skill-graph` (this repo) **IS** the canonical consolidated Skill Graph repository per [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md) (consolidated 2026-05-18, SH-6137). It owns the protocol contract (v7 frontmatter, JSON Schemas under `schemas/`), the lint and manifest compiler, the router, the drift sentinel, the export pipeline, the audit scripts and graders, and the per-skill comprehension evals. The canonical `skills/<name>/SKILL.md` source files still live in the sibling `skills` repo. The previously separate `skill-metadata-protocol` and `skill-audit-loop` mirrors are now docs-only deprecation mirrors and no longer carry active source.
- `github.com/jacob-balslev/skill-graph` **IS NOT** a user-facing skills.sh source. The frontmatter is the protocol contract, not a plain Agent Skills marketplace export. Do not document, link, or instruct users to install from this repo. Do not let it surface as a user-facing skills.sh row.
- The local `marketplace/skills/` directory in this repo is a **staging surface**, not a publication target. Its purpose is to produce the plain `SKILL.md` files that get synced to `jacob-balslev/skills`.

### Stale URLs (do not reference as canonical, ever)

These appeared during earlier publishing attempts. They are deprecated and tracked for removal in `vercel-labs/skills#1147`. **Verified 2026-05-20: all three rows are still LIVE and installable.** The GitHub repos behind #2 and #3 are confirmed deleted (HTTP 404), yet their skills.sh rows still serve content (34 and 27 skills) — **proving that deleting the GitHub source repo does NOT de-index the skills.sh row.** Repo deletion is a dead lever; only manual Vercel staff removal works (see "When skills.sh is wrong about us").

1. `https://www.skills.sh/jacob-balslev/skill-graph/` — old direct-index of the authoring repo (GitHub repo still exists; row live, ~39 skills).
2. `https://www.skills.sh/jacob-balslev/skill-graph-skills/` — old split export source (GitHub repo deleted 404; row still live, 34 skills).
3. `https://www.skills.sh/jacob-balslev/skill-graph-skills-missing-1/` — old split export source (GitHub repo deleted 404; row still live, 27 skills).

If any new doc, script, README, or marketing surface emits one of these URLs as canonical, that is a doc bug. Fix it to the canonical URL above.

### Release sync — two-step protocol

Publishing is a two-step sync because the **tooling repo** (this `skill-graph` repo — where the marketplace export is *generated*) and the **skills library repo** are distinct. Note the library repo is one repo wearing two hats: `jacob-balslev/skills` (local clone at `~/Development/skills/`) is **both** the canonical authoring source for `SKILL.md` files (the exporter reads it via `.skill-graph/config.json` → `skill_roots: ["../skills/skills"]`) **and** the public release repo published to skills.sh — it is not two separate skill repos. The two steps move content from this tooling repo's `marketplace/skills/` staging surface into that one library repo:

1. **Generate the marketplace surface** in this repo: `node scripts/export-marketplace-skills.js`. Verify: `node scripts/export-marketplace-skills.js --check`. The exporter writes plain Agent Skills `SKILL.md` files to `marketplace/skills/`. `RELEASE_TARGET_REPO` in that script is `jacob-balslev/skills` — do not change without coordinating both repos.
2. **Sync to the release repo** at `https://github.com/jacob-balslev/skills` (local clone at `~/Development/skills/`). Copy `marketplace/skills/.` into the release repo's `skills/` directory, refresh the release repo's `README.md` from `marketplace/README.md`, commit path-limited with `--only`, and push. The release repo's HEAD becomes the snapshot skills.sh indexes.

The two-step sync is intentional. It prevents the authoring repo's v7 protocol frontmatter from leaking into the marketplace surface, and it keeps the user-facing release small and Agent-Skills-compatible.

### Pre-release verification (in addition to Public Release Hygiene below)

Before pushing a sync to `jacob-balslev/skills`:

- The two repos' skill counts match: `find marketplace/skills -name SKILL.md | wc -l` (here) equals `find skills -name SKILL.md | wc -l` (release repo) post-sync. Use a recursive `SKILL.md` count, not `ls | wc -l`: `marketplace/skills/` is flat (`<name>/`) while the release library is nested by category (`<category>/<name>/`), so `ls | wc -l` counts incompatible top-level entries and never matches.
- The release repo's `README.md` matches `marketplace/README.md` from this repo.
- Every exported marketplace description is ≤ the marketplace limit (`node scripts/export-marketplace-skills.js --check`).
- No protocol frontmatter has leaked through — the release repo's skills are plain Agent Skills shape, not v7 protocol shape.
- All references in this repo's docs, READMEs, and scripts to the public URL go to `https://www.skills.sh/jacob-balslev/skills/`; references to the GitHub release repo go to `https://github.com/jacob-balslev/skills`.
- **No internal/codebase-scoped skills in the release tree.** `export-marketplace-skills.js` now enforces a publication gate: it excludes any skill with `scope: codebase|operational` or `grounding_mode: repo_specific|repo_internal` (logged to stderr as `EXCLUDED from marketplace export`), and `PRIVACY_PATTERNS` fails `--check` on `sales-hub/` paths and internal DB-surface names. Before pushing the release repo, also verify the working tree directly — `git ls-tree --name-only HEAD` must show only the curated `skills/` tree plus governance files, and `git rev-list --count origin/main..HEAD` plus a scan for `sales-hub/` / secret patterns must come back clean. (See the 2026-05-20 incident: 284 `scope: operational` internal skills were committed-but-unpushed in the release repo's local `main` and would have published on a `git push`; SH-6281 tracks the structural fix. An allowlist `.gitignore` now blocks `git add -A`, but a deliberate `git add <internal-dir>` could still bypass it — verify before every push.)

### When skills.sh is wrong about us

The platform-side cleanup tracking the three stale rows is at `vercel-labs/skills#1147` — **open since 2026-05-14 with zero maintainer response** (verified 2026-05-20). The GitHub issue is the wrong/slow channel; removals actually happen in the **Vercel Community forum**.

**The single working lever is manual removal by Vercel staff, requested in the forum.** `@quuu` (Andrew Qu) is both the forum staff contact who has historically performed removals (https://community.vercel.com/t/removing-a-skill-from-the-skills-sh-list/35562 — "what skill is it? I can remove it") **and the sole active maintainer of `vercel-labs/skills`** (20/20 most-recent commits). Escalate to him directly — forum reply tagging `@quuu`, and/or an `@quuu` mention on #1147. Same person, two doors.

Dead ends, all verified — do not waste effort on them:
- **Deleting the GitHub source repo does NOT de-index** the skills.sh row (proven: #2/#3 repos are 404 yet still serve skills).
- **`metadata.internal: true` does NOT de-index** — Vercel staff (Anshuman Bhardwaj, 2026-04-28) confirmed it only skips default install (`INSTALL_INTERNAL_SKILLS=1` still pulls them).
- **No self-service delist:** `npx skills remove --source` is a local uninstall, not a directory removal. The skills.sh CLI has no `delete-source`/`reindex`; the Discourse API requires login; `skills.sh/api/v1/*` needs a `Bearer sk_live_...` key we do not hold.
- **Email is the wrong door:** Vercel has no general support email (`billing@`/`security@` only), and skills.sh is a `vercel-labs` side-project outside platform support — a ticket would bounce. `security@vercel.com` is only legitimate if framing an actual exposure.

## Public Release Hygiene

Before publishing to npm, tagging a release, pushing, or otherwise making code public:

- Run `npm run verify`.
- Confirm ignored local artifacts are not staged.
- Check that docs mention the correct release version, schema version, and current command names.
- Check that `LICENSE`, `NOTICE`, `package.json`, `README.md`, `CHANGELOG.md`, and generated/sample artifacts are consistent.
- Review for secrets, PII, private paths, and local agent telemetry.
- Verify the canonical URL contract above — every public-facing URL emitted by this release points at `https://www.skills.sh/jacob-balslev/skills/` and `https://github.com/jacob-balslev/skills`, never at the stale URLs.

## When Unsure

Verify from source files and scripts before claiming behavior. If an API, command, file path, version, schema rule, or validation result has not been checked in this repo, say so and inspect it first.
