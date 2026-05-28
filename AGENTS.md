# Agent Instructions for Skill Graph

> Type: Repository guide
> Scope: Applies to this `skill-graph` repository.

This repo defines the Skill Metadata Protocol and the Skill Graph reference toolchain. Treat it as a protocol/schema/tooling project, not as an agent runtime, hosted marketplace, persistent memory system, or prompt library.

## TL;DR Index — read these sections FIRST for these task types

| Task type | Read these sections first |
|---|---|
| **First time on this repo** | `~/Development/SKILL-SYSTEM-CHEAT-SHEET.md` (1 page) — workspace-level operator's manual for the three layers. |
| **Authoring or editing any SKILL.md** | **STOP.** § "Work Modes — SYSTEM vs CONTENT" below. CONTENT mode runs ONLY via `/audit:audit | improve | evaluate | evolve`. Ad-hoc SKILL.md edits outside that loop are banned. |
| **Editing the schema / audit script / audit prompt / protocol doc** | § "Work Modes" + § "Editing Rules" + § "Version Labels Are Earned, Not Bumped" |
| **Per-field semantics (`name`, `description`, `scope`, etc.)** | § "Doc Ownership Map" → routes to `docs/field-reference.md` and 70+ other concept owners |
| **Current state (counts, version, audit-loop maturity)** | `SKILL_GRAPH.md` § Current State — single source of truth |
| **Per-skill audit checklist + runbook** | `SKILL_AUDIT_LOOP.md` § Part 2 (checklist) + § Part 3 (binding runbook) |
| **Publishing to skills.sh** | § "Public Distribution — Canonical URL Contract" |
| **Anything else** | § "Mission and Vision" (below) → § "Editing Rules" → § "Validation Commands" |

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
   *What it is supposed to do:* answer **one question per skill** — *does it still teach an agent to do the thing it claims to teach?* Shape: `read → fix → test → next`; one field per commit, kept or reverted on a single measurable signal (Karpathy keep-or-revert). Its four operations are `audit`, `improve`, `evaluate`, and `evolve`. It has two gates: the **Integrity Gate** proves the skill is structurally valid, grounded, routable, and export-safe; the **Behavior Gate** proves the skill changes agent behavior on realistic positives, hard negatives, prior failures, and boundary cases. The four-verdict Audit Status records the result on the skill itself: `structural_verdict`, `truth_verdict`, `comprehension_verdict`, and `application_verdict`. **`application_verdict == APPLICABLE` is the only verdict that *certifies* a skill is *useful*** — `structural` / `truth` / `comprehension` establish **eligibility** for assessment, not certification. See [`docs/verdict-semantics.md`](docs/verdict-semantics.md) for the canonical enum definitions, the eligibility-vs-assessment distinction, and the confidence-tier ordering (`APPLICABLE` from dual-run grader > `PROVISIONAL` from single-model assessment > `UNVERIFIED` from no assessment at all). It is **not a lint-test factory**; an empty findings report on a genuinely good skill is a PASS. Procedure: `SKILL_AUDIT_LOOP.md`.

**Trunk and leaf.** The mission is relevance-at-scale: the **Protocol** makes relevance explicit, the **Graph** makes it queryable, and the **Audit Loop** keeps it true. Routing the right teaching-skill is the trunk; auditing whether that skill teaches well is the leaf the explicit structure enables. Do not mistake the audit mechanism for the mission.

### What each command writes (so the three layers stay distinct)

The three layers above describe **roles**; this table is the operational counterpart — which command writes to which surface. Use when debugging "why didn't field X get stamped?" or "which command should I run to refresh Y?" The Audit Status fields appear in skill frontmatter; the artifacts appear under `audits/<skill>/`.

| Operation | Reads | Writes to SKILL.md frontmatter | Writes artifacts |
|---|---|---|---|
| `audit` (Integrity Gate, no flags) | skill source + truth_sources | `last_audited`, `lint_verdict`, `structural_verdict`, `truth_verdict` | `audits/<skill>/{findings,verdict,scorecard}.md` |
| `audit --graded` | + grader CLI | + `comprehension_verdict`, `application_verdict` (when their evals exist) | graded scorecard rows |
| `evaluate --mode comprehension` | `evals/comprehension.json` | `eval_score`, `eval_failed_ids`, `freshness`, `comprehension_verdict` | grader receipt under `eval-history/` |
| `evaluate --mode application` | `evals/application.json` + skill body | `eval_score`, `eval_failed_ids`, `freshness`, `application_verdict` | grader receipt + before/after diff |
| `improve --field <name>` | skill body, last `evaluate` result | `last_changed`, possibly `eval_score` (post-keep) | commit + revert log when `eval_score` drops |
| `evolve --top N` | Audit Status priority queue | (delegates to audit/improve/evaluate per cycle) | per-cycle aggregate under `audits/_state/` |
| `drift` (standalone) | `grounding.truth_sources` + recorded hashes | `drift_status` (per-script signal) when invoked with `--write-verdict`; default check run is read-only and only emits an exit code | none — exit code is the signal |
| `lint` (standalone) | schema + skill source | none (read-only diagnostic) | none — stderr is the signal |

**Two integrity surfaces.** The audit operation runs both `lint` and `drift` inline (the rollup feeds `structural_verdict` and `truth_verdict`). The standalone `lint` / `drift` commands exist for fast iteration when authoring a single skill or when re-running just one phase — they do NOT roll up to `truth_verdict` or `structural_verdict`. Standalone `drift --write-verdict` is the explicit opt-in that stamps the per-script `drift_status` field (the only Audit Status field a standalone command may touch); other Audit Status fields are only written by the `audit` / `improve` / `evaluate` operations.

## Work Modes — SYSTEM vs CONTENT

> **Read this BEFORE touching anything in this project.** Mixing SYSTEM and CONTENT work in one task or commit is the recurring failure mode that has cost the most time in this project's history. The user's rule, stated literally: *"We should never work on skills before we have the entire planned system as we want it. Then we can follow the contract of the version-controlled schema to upgrade the skills accordingly."*

Skill Graph work splits cleanly into two modes. They are NOT interchangeable, and they are NOT to be mixed in the same task or the same commit.

### The two modes

**SYSTEM mode** changes how the library *works*. Edits to the protocol contract, schemas, audit loop infrastructure, scripts, prompt templates, audit slash-commands, or protocol/audit documentation. SYSTEM commits define and improve the machinery itself.

**CONTENT mode** changes individual skills *through* the contract. Edits to specific `SKILL.md` files, their `comprehension.json` / `application.json` eval artifacts, their `references/`, and their Audit Status stamps. CONTENT commits are the *output* of running the audit loop against the CURRENT contract — never an ad-hoc batch edit.

### File allowlist

| Mode | Allowed paths | Forbidden in this mode |
|------|---------------|------------------------|
| **SYSTEM** | `skill-graph/schemas/**`, `skill-graph/docs/**`, `skill-graph/audits/prompts/**`, `skill-graph/audits/_state/**`, `skill-graph/scripts/**`, `skill-graph/bin/**`, `skill-graph/SKILL_*.md`, `~/Development/scripts/skill/**`, `~/Development/.claude/commands/audit/**` | Any edit to `~/Development/skills/skills/**/SKILL.md` or per-skill artifacts (`comprehension.json`, `evals/`, `references/`, `skill-graph/audits/<skill-name>/**`). |
| **CONTENT** | `~/Development/skills/skills/**/SKILL.md` and per-skill artifacts (`comprehension.json`, `evals/**`, `references/**`, `skill-graph/audits/<skill-name>/**`) | Any edit to schemas, audit prompts, audit scripts, audit slash-commands, or protocol docs. |

CONTENT mode is entered ONLY via the audit loop slash-commands: `/audit:audit`, `/audit:improve`, `/audit:evaluate`, `/audit:evolve`. Manual ad-hoc SKILL.md edits outside that loop are banned by default — even when "fixing one quick thing" looks tempting.

### Mode declaration is mandatory (with one carve-out)

When asked to work on anything described as "Skill Graph", "Skill Metadata Protocol", "Skill Audit Loop", "the audit loop", or "skills", the agent's FIRST action is to ask the user via `AskUserQuestion` which mode applies — SYSTEM or CONTENT.

**Narrow exceptions where asking is NOT required** (the mode is already named, or no mode applies):

- The user explicitly invokes one of `/audit:audit`, `/audit:improve`, `/audit:evaluate`, `/audit:evolve`. → CONTENT mode is implicit.
- The user explicitly says "edit the schema", "fix the audit prompt", "update the protocol doc", "change the version-earned gate", "work on the audit script". → SYSTEM mode is implicit.
- The user explicitly says "upgrade skill X to v8", "audit skill Y", "fix the broken eval on skill Z". → CONTENT mode is implicit (and must run via `/audit:*`, not ad-hoc edits).
- **Analysis-only carve-out.** Read-only tasks that produce reports, audits, research notes, design reviews, or doc surveys without editing any schema, script, protocol doc, SKILL.md, or per-skill artifact do NOT require mode declaration. The two-mode rule exists to prevent SYSTEM/CONTENT *mixing*; analysis tasks edit neither, so there is nothing to mix. Asking in this case is the false-dichotomy form the `no-permission-asking-for-trivial-actions` rule warns against. The agent may proceed directly; the only output is the report.

If a request can be read as ambiguous between the two modes AND involves edits to either tree, it IS ambiguous — ask. When in doubt, ask.

### Cross-mode discoveries

A SYSTEM task that uncovers a skill-content issue (a SKILL.md that's wrong, drifted, mis-classified) **files a Linear task** for the next audit-loop run on that skill. It does NOT fix the SKILL.md inline. The audit loop is how skills get fixed.

A CONTENT task (running `/audit:*` against a skill) that uncovers a SYSTEM gap (a schema field missing, an audit prompt that omits an axis, a script that needs a new flag) **STOPS the audit**, reports to the user, and files a SYSTEM task. It does NOT patch the schema inline to "make the audit work today." Patching system inside a content commit is the precise failure mode this rule exists to prevent.

### Sequencing principle (the strongest form)

Until the planned system reaches the state the user wants, CONTENT work is paused except via the audit loop running against the *current* contract — and even then, ad-hoc skill edits outside `/audit:*` are forbidden. Schema bumps and protocol additions cascade to skills *through the contract* — the audit loop migrates skills per the version-earned gate (`~/Development/.claude/rules/version-schema-contract.md`), one skill at a time, with Audit Status evidence. They do NOT cascade by way of a system commit that touches the schema and N SKILL.md files in the same diff.

### Anti-patterns

| Anti-pattern | Why it's a violation | What to do instead |
|---|---|---|
| Working on an audit prompt template and "just editing one SKILL.md to test the prompt" | SYSTEM task drifted into CONTENT. The test should run the prompt against an existing skill via `/audit:audit --pilot <skill>`, not by hand-editing the skill. | Test SYSTEM changes via the audit-loop entry points; the skill stays untouched. |
| Bumping `schema_version` in `skill.schema.json` AND manually editing N SKILL.md files in the same commit | The version-earned gate exists precisely to refuse this. Cascades go through `/audit:evolve`, not a schema commit. | One SYSTEM commit bumps the schema. Then `/audit:evolve --top N` migrates skills, one commit per skill with Audit Status evidence. |
| Doing a protocol-doc update and "fixing one skill that already shows the new pattern" inline | The doc update is SYSTEM. The skill edit is CONTENT. They belong in two different tasks. | Commit the SYSTEM doc update alone. File a Linear task to migrate the example skill through `/audit:*`. |
| Inside `/audit:audit`, noticing a schema gap and patching `skill.schema.json` inline | CONTENT task patching SYSTEM. The schema change is now committed alongside the audit's content writes — and probably without the SYSTEM-side reasoning, tests, or doc update it needs. | STOP the audit. File a SYSTEM Linear task with the gap. Resume the audit once the schema lands and is released. |
| Asking the user "should I also tweak this script while I'm in here?" during a CONTENT session | Permission-asking is also a mode boundary signal. If the answer is yes, the task is two tasks. | Finish the CONTENT task as scoped. File the SYSTEM follow-up. |
| Designing a "compatibility window" / "sunset phase" / "migration mode" that forces every new author to write BOTH old and new fields until the corpus migrates | CONTENT state leaked into SYSTEM thinking. The schema's correctness is independent of how many skills currently comply. Holding the schema hostage to corpus migration produces phrases like "must author BOTH" in normative docs and traps the schema in a perpetual phase state. | Make the schema correct in one edit: move new fields into `required`, drop old fields from `required` (keep them as optional back-compat properties), delete redundant conditional rules. Skills that fail validation route to ONE CONTENT-mode follow-up ticket the audit loop drains per-skill. See `~/Development/.claude/rules/version-schema-contract.md § Companion rule — Do not hold the schema hostage to corpus migration progress`. |

### Pre-commit warning

`scripts/skill/check-work-mode-separation.js` runs as part of the workspace pre-commit hook (when `scripts/githooks/` is installed via `bash scripts/githooks/install.sh`). It classifies every staged file as SYSTEM, CONTENT, or NEUTRAL and prints a warning when a commit stages BOTH SYSTEM and CONTENT paths. The warning lists both sets, names this rule, and recommends splitting the commit. **Exit code is always 0** — this is a soft signal, not a block. The block is the version-earned gate (`check-version-earned.js`), which already enforces the harder rule (unearned schema bumps fail closed).

The `/audit:*` commands set `AUDIT_LOOP=1` before staging their writes; the check honors that envvar and suppresses the warning, because the audit loop is the *one* legitimate path where coordinated SYSTEM-adjacent + CONTENT writes can co-occur (e.g., a per-skill audit artifact under `audits/<skill>/` IS content, even though its parent directory lives in the skill-graph tree).

### Distribution and cross-references

- **This section is the canonical doctrine.** It is referenced by:
  - `~/Development/AGENTS.md` § Non-Negotiable Standards #16 (workspace-level summary for all agents; Codex, Claude, Copilot all read this)
  - `~/Development/CLAUDE.md` § Context Files (Claude-specific entrypoint)
  - `SKILL_AUDIT_LOOP.md` top-of-file (caught when an agent lands there directly)
  - `SKILL_METADATA_PROTOCOL.md` top-of-file (same)
- **OpenCode lanes** (`~/Development/.opencode/instructions/*`) do NOT auto-read AGENTS.md per their local convention. If an OpenCode lane is dispatched to Skill Graph work, the dispatcher must point it at this section explicitly.

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

For audit work, also read `SKILL_AUDIT_LOOP.md` and `SKILL_AUDIT_LOOP.md` § Part 2.

## Project Shape

- Runtime: Node.js >= 20.
- Package: `@skill-graph/cli`.
- Package manager recorded in `package.json`: `pnpm@9.15.0`.
- The scripts use only Node built-ins today; there are no package dependencies.
- Public CLI entrypoint: `bin/skill-graph.js`.
- **`bin/` vs `package.json` scripts.** `bin/skill-graph.js` is the public CLI consumers reach for via `skill-graph <subcommand>` after `npm install -g @skill-graph/cli`. The `scripts` block in `package.json` is the internal CI gate — every entry maps to a `node scripts/<file>.js` invocation that the verify chain runs. The two surfaces overlap in capability but differ in audience: a `package.json` script that disappeared would only break CI, while a `bin/` subcommand that disappeared would break external consumers. Edits should preserve both, never collapse one into the other. (L2 clarification, 2026-05-27.)
- Current public release checkpoint in docs: `0.5.10` on `2026-05-25` (the "canonical-shape sweep" release; ADR-0014/0015/0016 fully landed and the 2026-05-25 multi-model restructure review backlog closed; see [`CHANGELOG.md`](CHANGELOG.md#0510--2026-05-25)).
- Current skill contract: see [`SKILL_GRAPH.md § Current State`](SKILL_GRAPH.md#current-state--single-source-of-truth) — single source of truth for schema version, axes required, audit-loop maturity, and corpus counts. The four-verdict Audit Status (`structural_verdict` / `truth_verdict` / `comprehension_verdict` / `application_verdict`) replaces the single v6 `audit_verdict` per [ADR 0011](docs/adr/0011-split-audit-verdict-into-four-verdicts.md); `application_verdict` is the primary quality signal and certifies behavior change on real artifacts.
- This repo is the **canonical consolidated implementation** post-2026-05-18 (commit `654b4df`; see [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md) and SH-6137). Schemas, audit scripts, graders, eval fixtures, examples, and the protocol/audit canonical docs all live here. The canonical skill library lives at `/Users/jacobbalslev/Development/skills/`; `SKILL_GRAPH.md § Current State` is the single-source-of-truth count. The previously separate `skill-metadata-protocol` and `skill-audit-loop` mirrors are preserved as docs-only deprecation mirrors — they were **archived (read-only) on GitHub on 2026-05-20** ([ADR 0009 § Update](docs/adr/0009-sibling-repo-deprecation.md)) and no longer carry active source code. `examples/` still holds specimen projects and per-skill comprehension evals.
- Workspace config at `.skill-graph/config.json` points lint, manifest, drift, route, and truth_source resolution at the canonical sibling skills repo by default. `SKILL_GRAPH_WORKSPACE` env-var still overrides — useful when developers clone the canonical repo elsewhere. Truth_source paths starting with `skills/<name>/SKILL.md` are resolved via `scripts/lib/roots.js::resolveTruthSourcePath()`: skill-library-aware first, with REPO_ROOT fallback.

## What the Skill Graph Is

The Skill Graph is a routable, evaluable, drift-checked knowledge graph of agent capabilities. Each node is a `SKILL.md` — frontmatter (the contract) plus body (the operational guidance). Each edge is one of:

- `relations.related` — adjacency for browse and routing expansion.
- `relations.boundary` — score-aware exclusion guard: when this skill wins a query, listed skills are suppressed from co-routing. **Note:** the field name reads as "defer to them" but the mechanic is "exclude them when I win." Use ownership reason-text ("I own this exclusively over X"), not deference ("use X instead"). See WARNING in `SKILL_METADATA_PROTOCOL.md` § Relations § `boundary`.
- `relations.verify_with` — "when this skill is applied, verify the result with that skill" (cross-check).
- `relations.depends_on` — composition; "this skill assumes the reader has the other in scope."

The graph is not a documentation pile. It is queried by routers, traversed by injection hooks, evaluated against retrieval baselines, and drift-checked against source-of-truth files. Two skills are "the same kind" iff they share a `subject × deployment_target` pair plus a head noun (per [ADR-0017](docs/adr/0017-five-axis-classification-model.md), with the operation axis retired 2026-05-27). The routing layer uses that pair as a first-pass discriminator before walking edges. Note: in the current corpus, most skills share `deployment_target: portable`, so the pair provides broad stratum separation but not fine-grained routing precision — keyword score and relation edges carry the discriminating load. See `SKILL_METADATA_PROTOCOL.md` § Classification for the current distribution analysis and authoring implications.

This shape is what distinguishes the Skill Graph from prompt libraries, agent-runtime config, hosted marketplaces, and personal memory systems. It is a protocol-and-tooling project that produces a navigable graph; consumers (routers, agent runtimes, hosted marketplaces) read from it but do not redefine it.

## Skill Metadata Protocol — Quick Reference

The Skill Metadata Protocol is the frontmatter contract every `SKILL.md` ships against. Treat this section as the working summary; `SKILL_METADATA_PROTOCOL.md` and `docs/field-reference.md` are the binding documents.

Core required axes (v8 — see `SKILL_METADATA_PROTOCOL.md § Schema contract`):

- `name` — kebab-case, head-noun-anchored (see `docs/head-noun-glossary.md`); aligns with parent directory.
- `description` — short description of what the skill is about. Activation signals belong to `keywords`/`triggers`/`examples`/`anti_examples`; boundary semantics belong to `relations.boundary`.
- `subject` — primary browse shelf, ONE of nine closed values: `code-engineering`, `quality-assurance`, `frontend-ui`, `design-craft`, `agent-ops`, `product-domain`, `knowledge-organization`, `meta-methods`, `data-analytics`. Each subject holds 5–25 skills; <5 = fold or recruit, >25 = subdivide via `taxonomy_domain`. To propose a 10th value: ADR + ≥5 primary-fit skills. See [ADR-0017](docs/adr/0017-five-axis-classification-model.md).
- `deployment_target` — deployment targeting, ONE of two values: `portable` (any project), `project` (one specific project; requires `grounding`). The `scope` field is now an optional free-text PRD-style statement (the v8 `scope` enum's `workspace` value was removed 2026-05-27; see ADR-0017 amendment).
- `subjects[]` (optional, max 2, primary first) covers polyhierarchy when a skill genuinely spans two browse shelves.

Activation surfaces: `keywords` (≤10), `triggers` (exact), `examples` / `anti_examples` (positive/negative prompts). Routing edges live in `relations` (`related` / `boundary` / `verify_with` / `depends_on` / `broader` / `narrower` / `disjoint_with`).

Closure of `subject` (9 values) is justified by Miller's 7±2 browseability + MECE pressure + the `foundations` / `knowledge-organization` anti-junk-drawer gate. See `SKILL_METADATA_PROTOCOL.md § Classification` for the disambiguation rules.

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

Before changing agent behavior instructions, quality rules, marketplace positioning, or skill-library structure, load the relevant local skills from this repo and from the sibling Development skill library when available. At minimum, check the relevant Skill Graph skills (`semantics`, `information-architecture`, `context-engineering`, `skill-scaffold`, `skill-infrastructure`) and the live audit references (`SKILL_AUDIT_LOOP.md`, `SKILL_AUDIT_LOOP.md` § Part 2) when the task touches those concerns. Also check the broader Development skills that govern quality (`quality-doctrine`, `no-cutting-corners`, `compression`, `token-efficiency`).

Claims of quality require verification. If a change says links work, routing works, exports validate, descriptions fit a limit, or all findings are preserved, run the relevant command and report the result. If verification was not run, say so.

## No Invented Terminology — State Concepts in Plain Words

When referring to a concept, rule, convention, pattern, or sequence in conversation or in code, state what it IS in plain words. Do NOT invent a label (e.g., "the two-convention rule", "the rollout sequence", "the strippable forms", "the convention") and then use that label as if the user already knows what it means. Every label you invent forces the user to remember an unstated mapping from your shorthand back to the actual concept — they cannot verify what you mean without scrolling back through the conversation.

The corrective behavior: spell out the meaning in full every time you reference it, even if it adds 1-2 lines.

- You MAY use names the user has authored: terms in this file, the workspace `AGENTS.md`, ADRs, schemas, canonical docs, memory files, or the user's own prose in the current session.
- You may NOT use names you have authored yourself in this session as shorthand. A section title or doc-edit phrase YOU wrote during this session does NOT count as user-authored until the user has reviewed and accepted it.
- If a concept is large enough to deserve a name, propose the name explicitly in conversation and wait for the user to adopt or reject it before using it as shorthand.

Canonical text: workspace `~/Development/AGENTS.md` § Non-Negotiable Standards #17. Companion memory file: `~/.claude-profiles/jacobbalslev01/projects/-Users-jacobbalslev-Development/memory/no-invented-terminology-2026-05-26.md`.

## Version Labels Are Earned, Not Bumped

A version number on a skill — `schema_version`, `skill_graph_protocol`, and any `vN` label — asserts that the skill's **content** meets that version's bar. Advancing the number is honest only after the substantive migration the version represents has actually been performed. Bumping a label without doing that work is fake-conformance: the same class of doc-lie as `eval_state: passing` without an `eval_last_run` receipt, or `application_verdict: APPLICABLE` without a gate-9 eval.

- **`schema_version` is the mechanical shape; the content label is the substantive bar.** Migration codemods bump `schema_version` corpus-wide — a shape migration a script *can* do. The deeper content v8 carries — `subject` + `deployment_target` classification, polyhierarchy via `subjects[]` (max 2), free-text `scope`, hierarchical `taxonomy_domain`, `project[]` and `repo[]` belonging-entity references, capped `keywords`, the typed `relations` graph, the four-verdict Audit Status, and the five flat Understanding fields with `comprehension_state` — is **not** something a codemod can author. A skill only earns the v8 label when that content is actually present and reviewed.
- **A label mismatch is HONEST, not drift.** A skill with `schema_version: 8` but `skill_graph_protocol` recording an older content label is correctly recording that the schema bump ran but the deeper content migration did not. Do **not** "fix" this by editing the label. Fix it by doing the migration through `/audit:*`, then advancing the label — never the reverse.
- **Never run a find-replace that changes only a version label.** A bulk `sed`/codemod of `vN` → `vM` across `SKILL.md` files with no content change is prohibited. A backlog of skills on an older content label is migration work for the audit loop, not a string to replace.

## Major Version Is a Clean Cut. Legacy Lives in Git, Not in the Tree.

> Skill Graph is a **controlled monorepo**, not a public API with unknown external consumers. The schema describes the **current** version. Prior versions live in git tags, not in the tree.

The industry default for schema evolution is **gradual deprecation** (deprecate → keep as optional → remove after long window). That pattern is correct for **published APIs with unknown external consumers** ([Protobuf best practices](https://protobuf.dev/best-practices/dos-donts/), [Stripe's date-based versioning](https://stripe.com/blog/api-versioning), [Conduktor schema evolution](https://www.conduktor.io/glossary/schema-evolution-best-practices)) because the schema author cannot coordinate every client's migration. It is **wrong** for Skill Graph because Skill Graph is not that shape of project.

| Property | Skill Graph (this pattern) | Public API (gradual deprecation) |
|---|---|---|
| Consumers | One canonical corpus, owned by the project | Many unknown external accounts |
| Coordination | Possible — schema + corpus migrate together | Impossible — clients migrate independently |
| Compatibility-layer location | The **public exporter** (`scripts/export-marketplace-skills.js`) translates to the stable Agent-Skills format for external readers. The internal schema does not carry that burden. | Throughout the schema (Protobuf reserved tags, Stripe response-compat layer, etc.) |
| Right pattern | **Clean cut** at major version | Gradual deprecation |

Stripe's own framing names the principle: their core code "only writes code for the latest version and does not clutter the core business logic with if-else chains checking for old versions… Once the core logic generates a response in the modern format, the response compatibility layer takes over and transforms the data backward" ([averagedevs.com](https://www.averagedevs.com/blog/stripe-api-versioning-explained)). Skill Graph's analogue: the internal schema describes the current version, full stop. The exporter is the compatibility layer for external skills.sh consumers; the schema is not.

### What happens on a major version bump (v(N-1) → v(N))

1. **Rewrite the schema to v(N).** Delete v(N-1) field definitions, v(N-1) `allOf` rules, v(N-1) enum values, and v(N-1) description text. The schema is not a back-compat shim.
2. **Run the migration codemod, then delete it.** v(N-1)→v(N) is a one-time event. The codemod is not permanent tooling. Its history lives in git.
3. **Rewrite protocol / loop / graph docs to v(N).** No "deprecated v(N-1) fields" sections. No "during the sunset window" prose. No "do not author v(N-1)" rules — because v(N-1) is not part of the live contract.
4. **Amend any superseded ADRs.** One-line block: `> Superseded by v(N) (<commit>, <date>). See AGENTS.md § Major Version Is a Clean Cut.`
5. **CHANGELOG records the cut as past tense.** Single historical entry: "v(N-1) → v(N) ran on `<date>` in `<sha>`. Prior contract retrievable via `git show schema-v(N-1):schemas/skill.schema.json`."
6. **Tag the prior contract.** `git tag schema-v(N-1) <last-pre-cut-sha>` so anyone needing the old contract can `git checkout` it.

**Anyone needing v(N-1) reads git, not the live tree.**

### Anti-patterns banned in this project

| Anti-pattern | Why it fails | Do this instead |
|---|---|---|
| Schema retains v(N-1) fields as "deprecated optional" properties | The schema stops being a contract description and becomes a back-compat shim. Authors face two valid shapes and pick wrong. Lint surface widens for no live consumer. | Delete v(N-1) field definitions in the same commit v(N) becomes canonical. |
| Docs say "v(N-1) fields are deprecated — do not author v(N-1)" | Gives v(N-1) mind-share in v(N) docs. Authors waste cognitive cycles on a non-existent contract. | Don't mention v(N-1) in active v(N) docs. CHANGELOG owns the historical record. |
| Migration codemod kept in-tree after corpus migrates | Future agents read it and treat it as ongoing tooling. Confuses new authors who think v(N-1) is a current authoring path. | Delete the codemod once migration is done. Recover from git if ever re-needed. |
| "Compatibility window," "sunset phase," "v(N-1) drain," "while corpus migrates" framing | Teaches a transition state that does not exist in a controlled monorepo. CONTENT state leaking into SYSTEM thinking. | Past-tense historical record only. "v(N-1)→v(N) ran on `<date>`." |
| ADR-(N-1) left unamended after the schema cut | The decision register asserts a contract the live system no longer enforces. | One-line amendment block citing the supersession, on the original ADR. |
| Authoring docs (PRIMER, QUICKSTART, field-reference, decision-guide) carrying v(N-1) sections | Onboarding paths teach an obsolete contract. New authors waste time. | Rewrite to v(N) only. v(N-1) authoring path does not exist post-cut. |

### What stays after a cut

- **CHANGELOG entries** (historical record; that is what CHANGELOG is for)
- **ADR-(N-1)** with an amendment block citing the cut and pointing at the superseding ADR or AGENTS.md anchor
- **Git tags** for prior contracts (`schema-v(N-1)`, `schema-v(N-2)`…)
- **`scripts/export-marketplace-skills.js`** — the public-facing compatibility layer that absorbs the translation to the stable Agent-Skills shape

Nothing else.

### Cross-references

- `~/Development/.claude/rules/version-schema-contract.md` — workspace-wide version-label discipline. The "Companion rule" there should be read alongside this section; the rule's text describing "keep deprecated fields as optional back-compat properties" is calibrated for the *public API* shape and does not govern this project's schema.
- [ADR-0014](docs/adr/0014-canonical-only-schema-files.md) — the precedent: prior schema versions live in git history, not on disk as pinned copies. This section extends ADR-0014 from "no pinned-copy files on disk" to "no v(N-1) surface in the live tree at all."
- [ADR-0009](docs/adr/0009-sibling-repo-deprecation.md) § Update — the amendment-block pattern this section codifies.

## Editing Rules

- Version labels are earned, not bumped — never advance `schema_version` / `skill_graph_protocol` / any `vN` label without the matching content migration (see § Version Labels Are Earned, Not Bumped).

- Keep one logical change per commit or PR.
- Preserve the current narrow scope: protocol, schemas, deterministic tooling, examples, docs, evals, audit artifacts, and portable `SKILL.md` export.
- Do not add proprietary company-specific skills, hosted service assumptions, prompt-library content, or agent runtime layers.
- Do not make breaking schema changes without a `schema_version` bump and migration notes. Per [ADR-0014](docs/adr/0014-canonical-only-schema-files.md), pinned schema copies and per-version codemods are NOT created on disk — prior versions live in git history; codemods run once and are retired. If an external consumer needs to pin against a historical version, resolve via `git tag schema-vN` rather than a duplicate file in `main`.
- Do not hand-edit generated artifacts unless the owning script says to. `docs/field-reference.generated.md` is generated by `scripts/build-field-reference.js`.
- Do not hide findings during audits. If a check or audit emits N findings, preserve all N, then recommend prioritization separately.
- Do not commit local-only agent state or research output unless explicitly intended and scrubbed. `.artifacts/`, `.claude/`, `.research/`, `.roundtable/`, `audits/_state/`, and `audits/sweep-ledger.jsonl` are ignored for a reason.
- Never commit secrets, PII, private filesystem telemetry, credentials, tokens, or public-endpoint logs containing sensitive data.

## Coupled Changes

When touching one artifact, update the matching tier artifacts in the same change.

- If you change `schemas/skill.schema.json`, also update `docs/field-reference.md`, `docs/skill-metadata-protocol.md`, `SKILL_METADATA_PROTOCOL.md` when relevant, `docs/manifest-field-mapping.md`, and `examples/skill-metadata-template.md` when affected. Regenerate `docs/field-reference.generated.md` with `node scripts/build-field-reference.js` in the same commit (enforced by `protocol:check § C7`). Per [ADR-0014](docs/adr/0014-canonical-only-schema-files.md), the C6 "Versioned schema parity" check is retired — there is no second pinned file to drift against.
- If you change `schemas/manifest.schema.json`, also update `schemas/manifest.schema.json` (the pinned copy of the current contract), `docs/manifest-field-mapping.md`, and `scripts/generate-manifest.js` if projection logic changes.
- If you change `scripts/generate-manifest.js`, regenerate `examples/skills.manifest.sample.json`.
- If you change `scripts/skill-lint.js`, run it against every skill and the template. Update sample manifest or drift baselines when lint-affecting sources are part of `drift_check.truth_source_hashes`.
- If you change a Tier 2 protocol doc, check sibling Tier 2 docs for drift. The overview, field reference, decision guide, and manifest mapping must tell one story.
- If you change any grounded starter skill with `grounding.truth_sources`, re-record drift baselines with `node scripts/skill-graph-drift.js --record --apply skills/<name>` when the truth source hash is intentionally changing.
- If you add, remove, or rename a skill under `skills/`, the marketplace surface in `marketplace/skills/` is stale until you run `node scripts/export-marketplace-skills.js` (followed by `--check`) and the canonical user-facing release at `https://github.com/jacob-balslev/skills` is stale until you sync the marketplace surface into it and push. See `## Public Distribution — Canonical URL Contract` for the two-step protocol.
- If you introduce a new head noun in a skill name, update `docs/head-noun-glossary.md` in the same change. The glossary is a lint surface; adding a name with an unknown head noun without registering it produces a lint warning.
- If a skill's marketplace description exceeds the 1024-char limit, add an `EXPORT_DESCRIPTION_OVERRIDES` entry in `scripts/export-marketplace-skills.js` *in the same change* — do not shorten the canonical description to fit the marketplace.

## Doc Ownership Map

**Use this when your task is "edit the canonical home of concept X" and you do not know which of the many doc files owns it.** This is a *concept → file* map. The companion `## Coupled Changes` table is *action → propagation* (what else to update when one artifact changes), and `## Document Routing Table` below is *change-class → docs* (which docs a change category touches). Three views, one purpose: collapse the 5+ doc files into a single decisive lookup so agents do not spend an entire turn budget figuring out where to land an edit.

The structural rule behind this map: **prose lives in one place per concept.** If two files describe the same concept, one of them is the canonical owner and the other links back. Crossing this rule produces drift (the exact failure mode the 2026-05-23 boundary-semantics audit caught — four docs disagreed because none was declared canonical).

### Per-field semantics (the most common rabbit hole)

For any single Skill Metadata Protocol field (`name`, `description`, `subject`, `deployment_target`, `scope`, `stability`, `freshness`, `eval_state`, `routing_eval`, `comprehension_state`, `relations.*`, `grounding.*`, etc.):

| What you are editing about the field | Canonical owner | Notes |
|---|---|---|
| **Normative spec** — required/optional, allowed values, enum, gate condition, version label, what the field *means* in the protocol | `SKILL_METADATA_PROTOCOL.md` | The binding contract. If this and another doc disagree, this wins. |
| **Per-field human authoring prose** — when to use it, value choice criteria, examples, anti-patterns, common mistakes | `docs/field-reference.md` | The 78k authoring guide. Single biggest doc; agents lose half a turn budget here. Use anchor links when referencing from other docs. **Reader's canonical for `field-reference.md` vs `.generated.md`:** the hand-authored `docs/field-reference.md` is the canonical for "what does this field mean and when do I pick which value"; `docs/field-reference.generated.md` (line below) is a structural skeleton of the schema enum and type — useful for grep, never for picking values. (M2 reconciliation 2026-05-27.) |
| **Decision logic between values** — "should I pick `portable` vs `project`?", "when is `stability: stable` earned?", branching decision trees | `docs/field-decision-guide.md` | Decision tables only. Do not duplicate decision logic from `field-reference.md`; link to it. |
| **Why the field exists** — design rationale, rejected alternatives, migration history that *justifies* the field's shape | `docs/field-rationale.md` | "Why this field, not the other thing." Edit when the field's purpose changes, not when its value semantics change. |
| **Generated type/enum mirror** | `docs/field-reference.generated.md` | **NEVER hand-edit.** Run `node scripts/build-field-reference.js`. Source of truth is `schemas/skill.schema.json`. **Not for "when do I pick this value"** — that lives in the hand-authored `docs/field-reference.md` (row above). Reading the generated doc alone gives a structurally valid but semantically incomplete picture. |
| **Source-to-manifest projection** — how the authored value lands in the generated manifest | `docs/manifest-field-mapping.md` | Edit only when `scripts/generate-manifest.js` projection logic changes. |
| **One-liner mention in the AGENTS.md Quick Reference** | `AGENTS.md` § Skill Metadata Protocol — Quick Reference | Keep to one bullet per field. Never put full prose here; link to `field-reference.md`. |
| **Glossary entry** for the field name itself | `docs/glossary.md` | One-line definition; link to the canonical detail. |

**Default answer for "where do I edit field X's criteria":** the normative one-liner goes in `SKILL_METADATA_PROTOCOL.md`, the authoring prose goes in `docs/field-reference.md`, and `docs/field-decision-guide.md` is updated only if the change introduces a new decision branch. The other field-* docs are touched only if their specific axis (rationale, generated mirror, manifest projection) is what changed.

### Other concept areas

| Concept area | Canonical owner | Use for |
|---|---|---|
| **Migration narrative** (per-version: what each version introduced, breaking changes, codemod usage) | CHANGELOG.md entries + git history of `schemas/skill.schema.json` + the substantive ADR per version (e.g., ADR 0011 for the v6→v7 four-verdict Audit Status split; ADR 0017 for the v7→v8 classification model and its 2026-05-27 amendment) | New per-version migrations get a CHANGELOG entry and (if architecturally significant) a new ADR; do not append migration narrative to AGENTS.md. |
| **Authority tiers** (which file binds which) | `SKILL_GRAPH.md` § Authority Tiers | The map of "Tier 1 schemas → Tier 2 docs → Tier 3 scripts → Tier 4 consumers → Tier 5 examples." |
| **Current corpus state** — verified counts (canonical skills, exported skills, worklist), build/health snapshot | `SKILL_GRAPH.md` § Current State + `docs/status.generated.md` | Single-source-of-truth count lives in `SKILL_GRAPH.md § Current State`. The generated status file mirrors it. Volatile counts must not be duplicated into AGENTS.md, README.md, or anywhere else — link instead. |
| **Edges / relations semantics** (`related`, `boundary`, `verify_with`, `depends_on`) — the field-level mechanic | `SKILL_METADATA_PROTOCOL.md` § Relations | The boundary-semantics WARNING (2026-05-23) lives here; `AGENTS.md § What the Skill Graph Is` summarizes and links. |
| **Audit loop procedure** (read → fix → test → next; the four operations; the two gates) | `SKILL_AUDIT_LOOP.md` | The four-verdict Audit Status lives here. `AGENTS.md § Skill Audit Loop` summarizes and links. |
| **Per-skill audit contract** (the binding execution contract; Steps 1-8 of the per-skill pass) | `SKILL_AUDIT_LOOP.md` § Part 3 — Per-Skill Audit Runbook | Project-owned per ADR-0015. Workspace runtime slash commands (`.claude/commands/audit/*`, `.opencode/commands/audit-skill.md`) defer here. |
| **Audit-loop runner prompts** (interactive single-skill, autonomous batch worker, codex cron, minimal-iteration) | `audits/prompts/skill-audit-loop-*.md` | Project-owned per ADR-0015. Workspace `prompts/audits/skill-audit-loop-*.md` are back-compat pointer stubs only. |
| **Machine-readable protocol index** (protocols, runners, required artifacts, runtime aliases) | `audits/manifest.json` + `schemas/audits-manifest.schema.json` (shape) | The verifier `scripts/check-audit-manifest.js` consumes this. Bumping `schema_version` is gated by the version-schema-contract rule. |
| **Verdict semantics** (enums for all four Audit Status fields, confidence tier ordering, comprehension/application disjointness rule) | `docs/verdict-semantics.md` | Canonical for verdict enums. AGENTS.md / SKILL_AUDIT_LOOP.md / pipeline doc carry one-line summaries that link here. ADR-0011 is the rationale; this doc is the spec. |
| **Comprehension eval shape** (`evals/comprehension.json` per-case structure, 7 rubric dimensions, criticality + truth_mode enums) | `docs/comprehension-eval-spec.md` + `schemas/comprehension.schema.json` (binding) | The shape gate-8 graders evaluate against; the verifier requires this artifact when `comprehension_verdict ∈ {PROVISIONAL, PASS, SHALLOW, REDUNDANT}`. |
| **Audit-loop operational data ownership** (the trinary classification: project content / workspace orchestration / project-protocol scripts over workspace-coordinated data) | `docs/adr/0016-operational-data-ownership.md` **(Status: Proposed — sequencing deferred)** | Settles which side of the boundary new audit-loop surfaces belong to. ADR-0015 + ADR-0016 together cover spec + data ownership. The decision is settled in principle but per-surface migrations have not all shipped yet — do NOT cite ADR-0016 as if landed. |
| **Audit lane configuration** (importance bands, model tier floor, concurrency caps) | `audits/lanes.json` (project canonical, **target** per ADR-0016 surface #1 — Proposed) — read by `scripts/skill/skill-audit-claim.js` | Migration from `.opencode/skill-audit-lanes.json` is part of the ADR-0016 sequencing; verify which path is live in your branch before editing. |
| **Run-dir layout** (per-skill `runs/<run-id>/` structure, artifact filenames, claim atomicity) | `scripts/skill/skill-audit-paths.js` (current SoT) — to project-own contract per ADR-0016 surface #3 (Proposed) | Workspace script writes `.opencode/progress/skill-audits/<skill>/runs/<run-id>/...`. The layout CONTRACT is project-owned in the target ADR-0016 end-state; the workspace path is runtime-coordinated today. |
| **Finding schema** (severity, evidence, scope, recommended action) | `docs/reference/skill-audit-pipeline.md` § Unified Finding Schema (workspace, planned to migrate per F30 in `.roundtable/skill-graph-restructure-review-2026-05-25/followup-tasks.md`) | Currently at workspace root; planned migration into `skill-graph/audits/`. |
| **Grader prompts** (concept grader for gate 8, application grader for gate 9) | `lib/audit/graders/*-prompt.md` | Single canonical home post-2026-05-25 grader-prompt consolidation. Workspace `scripts/skill/graders/` copies are deprecated shims. |
| **Slash-command runtime resolvers** | `.claude/commands/audit/*.md` and `.opencode/commands/audit-skill.md` (workspace runtime), aliased in `audits/manifest.json` § aliases | The slash-command UX surface (description, argument-hint, flags) is workspace-owned per ADR-0015. Substantive operational content defers to `SKILL_AUDIT_LOOP.md` § Part 3 — Per-Skill Audit Runbook. |
| **Skill-injector routing config — shape** | `schemas/routing-config.schema.json` (project-owned per ADR-0016 surface #4 — Proposed) | The binding shape for `agent-orchestration/references/skill-routing-config.json` (instance file, cross-project orchestration). Type lives here; instance stays at consumer location. Validate via `node -e "..."` or ajv against the schema. |
| **Audit checklist items** (per-skill audit deliverable) | `SKILL_AUDIT_LOOP.md` § Part 2 | Itemized checklist. Edit when an audit produces a new mandatory check. |
| **Quality doctrine** (improve = enrich; preserve scope; organize-over-trim) | `docs/quality-doctrine.md` | `AGENTS.md § Quality Doctrine` is a summary; deeper doctrine lives in the docs file. |
| **Marketplace export contract** (description limits, privacy filter, surface generation, sync protocol) | `docs/marketplace-syndication.md` + `AGENTS.md § Public Distribution` | `AGENTS.md` owns the canonical URL contract + skills.sh manual-removal escalation. The marketplace doc owns export pipeline detail and the post-publication runbook. |
| **Publish workflow** (step-by-step export + release sync commands, pre-push gate, verification checklist) | `docs/publish-workflow.md` | Canonical how-to for running the two-step export+sync protocol. Updated 2026-05-24 (SH-6331). |
| **Routing eval** (baseline corpus, metrics, regression targets) | `docs/ROUTING-METRICS.md` | Edit when the baseline changes or a new metric is added. |
| **Recommended skills** for a given task pattern | `docs/recommended-skills.md` | Curated lists; broken links here are release-blocking. |
| **Field-name glossary** + head-noun registry | `docs/glossary.md` (concepts) + `docs/head-noun-glossary.md` (skill-name nouns) | New protocol concept → glossary; new skill name head noun → head-noun-glossary. |
| **ADRs** (architectural decisions, repo lifecycle, schema deprecation) | `docs/adr/NNNN-<slug>.md` | One file per decision. Never inline an ADR into AGENTS.md; link to it. |
| **Proposals** (in-flight, not yet decided) | `docs/proposals/*.md` | When accepted, follow through to canonical doc + ADR in the same change. |
| **Plans** (active multi-step work) | `docs/plans/*.md` | Move to `docs/_archived/` on completion. |
| **Research findings** (one-shot investigations) | `docs/research/*.md` | If findings drive a change, also update the affected canonical doc in the same commit. |
| **Concept primer / onboarding narrative** | `docs/PRIMER.md` + `docs/QUICKSTART-30MIN.md` | Long-form teaching. Edit when the public mental model of the project shifts. |
| **Positioning vs other systems** (prompt libraries, marketplaces, runtimes) | `docs/positioning.md` + `docs/positioning-vs-marketplaces.md` | Edit when external landscape shifts or our positioning changes. |
| **CLI behavior + flags** | `bin/skill-graph.js` `--help` (source of truth) → mirror to `README.md` + `docs/QUICKSTART-30MIN.md` + `CHANGELOG.md` | `--help` output is authoritative; other docs cite it. |
| **`AGENTS.md` itself** | Repo-wide rules, doctrine, this Doc Ownership Map, Document Routing Table, Public Distribution contract | Edit when *cross-cutting* rules change. Do NOT put per-field prose here. |

### When two docs disagree

If you find two docs giving different stories about the same concept, the precedence is:

1. **Schema** (`schemas/*.json`) > any prose doc — the schema is the binding contract.
2. **`SKILL_METADATA_PROTOCOL.md`** > other Tier 2 docs for normative spec language.
3. **`docs/skill-metadata-protocol.md`** > `docs/field-reference.md` for archetype/migration/rationale narrative; `docs/field-reference.md` > `docs/skill-metadata-protocol.md` for per-field authoring prose.
4. **`SKILL_AUDIT_LOOP.md`** > `AGENTS.md § Skill Audit Loop` summary.
5. **`SKILL_GRAPH.md` § Current State** > any other doc for live corpus counts.

The losing doc gets fixed in the same commit. Never leave the disagreement to be reconciled later — that is how the 2026-05-23 boundary-semantics drift happened (four docs each carrying their own version of the truth for months).

### Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Adding new field prose to `AGENTS.md § Skill Metadata Protocol — Quick Reference` instead of `docs/field-reference.md` | Quick Reference is a one-liner index, not a prose home. Prose here drifts because the canonical file is somewhere else. |
| Editing `docs/field-reference.generated.md` directly | Generated file — hand-edits are overwritten next time `build-field-reference.js` runs. |
| Putting decision-tree logic in `field-reference.md` AND `field-decision-guide.md` | One canonical home. The other links. Two homes is two truths. |
| Duplicating volatile corpus counts (144 skills, 284 active, etc.) into `README.md` / `AGENTS.md` / topic docs | `SKILL_GRAPH.md § Current State` is single-source-of-truth. Everywhere else links. Inline counts go stale within days. |
| Creating a new top-level doc instead of finding the existing canonical home for the concept | Doubles the number of places the next agent has to check. If the concept genuinely has no home, propose a new home in an ADR before creating the file. |
| Editing only the summary (e.g., `AGENTS.md § Skill Audit Loop`) without updating the canonical (`SKILL_AUDIT_LOOP.md`) | The summary drifts from the canonical. Always edit the canonical first, then re-summarize. |

## Document Routing Table

When a code or schema change lands, update the matching documentation rows in the same commit. This table covers the broader doc surface; for tier-coordinated changes (schema, lint, manifest projection) the stricter coupling rules in `## Coupled Changes` above take precedence. Generated artifacts (marked _generated_) must be regenerated by their owning script — never hand-edited.

| What Changed | Update These Documents |
|---|---|
| **CLI behavior** (`bin/skill-graph.js`, new flag, new subcommand) | `README.md` § quick start, `docs/QUICKSTART-30MIN.md`, `CHANGELOG.md`, `--help` output |
| **New script** in `scripts/` | `AGENTS.md` § Validation Commands (if user-runnable), `package.json` scripts (if exposed via `npm run`), `CHANGELOG.md` if user-facing |
| **Migration script** (`scripts/migrate-skill-vN-to-vM.js`) | None — per ADR 0014, corpus-wide migrations are run once and the codemod retired; record the change in `CHANGELOG.md` and (if architecturally significant) write an ADR |
| **GitHub Actions workflows** (`.github/workflows/*.yml`) | `AGENTS.md` § GitHub Actions if conventions changed, `CONTRIBUTING.md` § PR expectations if developer workflow affected |
| **Marketplace export pipeline** (`scripts/export-marketplace-skills.js`, `scripts/verify-skill-md-export.js`) | `marketplace/README.md` (_generated_), `docs/marketplace-syndication.md`, `AGENTS.md` § Public Distribution. Never hand-edit `marketplace/skills/` — it regenerates from sibling `~/Development/skills/` |
| **`marketplace/skills/<name>/SKILL.md`** (the mirror) | _generated_ — do not hand-edit. Edit the canonical source at `~/Development/skills/skills/<category>/<name>/SKILL.md` and re-run `node scripts/export-marketplace-skills.js` |
| **Public canonical URLs** (skills.sh, GitHub release repo) | `AGENTS.md` § Public Distribution — Canonical URL Contract, `README.md`, `CHANGELOG.md`, every script/doc that emits a URL |
| **Schema deprecation, repo split, sibling-repo lifecycle** | New ADR in `docs/adr/NNNN-<slug>.md`, `AGENTS.md` § Project Shape, `CHANGELOG.md`, `SKILL_GRAPH.md` if authority tiers change |
| **Field semantics, head nouns, decision tables** | `docs/field-reference.md`, `docs/field-decision-guide.md`, `docs/field-rationale.md`, `docs/head-noun-glossary.md`, `docs/glossary.md`. Regenerate `docs/field-reference.generated.md` via `node scripts/build-field-reference.js` in the same commit (enforced by `protocol:check § C7`) |
| **Routing eval changes** (`scripts/skill-graph-routing-eval.js`, retrieval baselines) | `docs/ROUTING-METRICS.md`, `docs/recommended-skills.md`, retrieval baselines under `evals/retrieval-baseline-*.json` |
| **Skill audit loop or checklist** (`scripts/skill-audit.js`, `lib/audit/*`) | `SKILL_AUDIT_LOOP.md`, `SKILL_AUDIT_LOOP.md` § Part 2, `AGENTS.md` § Skill Audit Loop |
| **Marketplace publication tooling/queue** | `docs/marketplace-publication-queue.generated.md` (_generated_), per-snapshot `docs/marketplace-publication-priority-YYYY-MM-DD.md` if a new priority cut is published |
| **Proposals** | `docs/proposals/*.md` (the proposal file itself); if accepted, follow through to the canonical doc and an ADR in the same change |
| **Plans** | `docs/plans/*.md` (the plan file); when completed, move from active to `docs/_archived/` |
| **Research findings** | `docs/research/*.md` (the research file); if findings drive a change, also update the affected canonical doc in the same commit |
| **New ADR** (architectural decision) | `docs/adr/NNNN-<slug>.md` (new), `CHANGELOG.md` if architecturally visible, `AGENTS.md` if governance changes |
| **Schema, lint, manifest projection** | See `## Coupled Changes` above — tier-coordinated changes have stricter coupling rules than this table |
| **README / public positioning** | `README.md`, `docs/positioning-vs-marketplaces.md`, `docs/ADOPTION.md` if adoption surface changes, `CHANGELOG.md` if user-visible |
| **Quality doctrine, editing rules, audit anti-patterns** | `AGENTS.md` (this file), `docs/quality-doctrine.md`, `SKILL_AUDIT_LOOP.md` § Part 2 |
| **Generated artifacts** (`docs/field-reference.generated.md`, `examples/skills.manifest.sample.json`, `docs/marketplace-publication-queue.generated.md`, `marketplace/skills/`) | _generated_ — do not hand-edit. Regenerate via the owning script (see `## Coupled Changes`) |

**Stale-reference rule:** When renaming or deleting any file, command, flag, or URL referenced in this repo, grep `*.md`, `*.yml`, `*.json`, and `package.json` for the old name and fix every hit in the same commit. The `## Coupled Changes` rules enforce this for tier artifacts; this rule extends it to the rest of the surface.

**Cross-repo coordination:** Changes that affect the sibling `~/Development/skills/` (canonical SKILL.md source) or the deprecation-mirror `~/Development/skill-metadata-protocol/` must be coordinated per [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md). The Development orchestration brain (`~/Development/.claude/`, `~/Development/scripts/`) is read-only from this repo — never mutate Development files from within skill-graph commits.

## Skill Authoring

For non-trivial new skills, write a short spec and plan first as described in `CONTRIBUTING.md`.

- Start from `examples/skill-metadata-template.md`.
- Put each skill in `skills/<skill-name>/SKILL.md`.
- Keep `name:` lowercase and aligned with the parent directory.
- Write `description:` as a routing contract: clear positive trigger plus explicit negative boundary.
- Pick `subject` honestly: one of the nine closed values (`code-engineering`, `quality-assurance`, `frontend-ui`, `design-craft`, `agent-ops`, `product-domain`, `knowledge-organization`, `meta-methods`, `data-analytics`).
- Pick `deployment_target` honestly: `portable` or `project`. Write `scope` as a free-text PRD-style statement of what the skill teaches.
- Add `grounding` for `deployment_target: project`.
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
- **Project-grounded** when `deployment_target: project` (anchored to specific repo truth; or a legacy unmigrated skill still carrying `scope: codebase`); **principle-grounded** when `deployment_target: portable` (repo-agnostic patterns). A skill that blends both records `grounding_mode: hybrid`.
- **At least one negative expectation per eval** — what the answer must *not* say or do. Negative expectations catch silent scope reduction and softened-failure responses.
- **Coverage matched to what the skill teaches:** domain correctness, scope boundaries, and anti-pattern recognition for capability-style skills; sequencing, gate enforcement, and failure-mode handling for procedural skills; correct owner-skill routing and explicit refusal to over-own for router-style skills.

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

The audit loop is the disciplined sweep that validates a skill (or a batch of skills) against the Skill Metadata Protocol, drift baselines, retrieval evals, and the quality doctrine. Full contract: `SKILL_AUDIT_LOOP.md` plus `SKILL_AUDIT_LOOP.md` § Part 2. This section is the operational summary.

### When to run the loop

- Before a release tag or marketplace export push.
- After bulk skill changes (migration, wave authoring, schema bump).
- When the routing eval shows a regression that points at specific skills.
- On a recurring cadence for the active library (typically per cycle).

### Two operating modes (added 2026-05-26 per SH-6505)

The audit operation has two valid modes — they are not in tension:

| Mode | When to use | Effect | Canonical contract |
|---|---|---|---|
| **Diagnostic audit (report-only)** | First sweep, pre-release scan, multi-model roundtable, anything where you want the verdict before deciding on fixes. | Runs lint + drift + (optionally graded) phases, stamps the Integrity-layer Audit Status fields, writes findings/verdict/scorecard artifacts. Does NOT mutate skill body or commit. | `SKILL_AUDIT_LOOP.md § Part 3` — Mode table row 1 |
| **Remediation audit (fix + commit)** | Targeted run after `improve --field <name>` lands a fix; the audit confirms the verdict moved. | Same Integrity write-back + artifacts; the auditor then runs `improve` (or makes the explicit edit), re-audits to confirm, and commits skill + Audit Status + artifacts together in one path-limited commit. | `SKILL_AUDIT_LOOP.md § Part 3` — Mode table row 2 |

The summary below covers the diagnostic flow (the more common case in a clean sweep). For the remediation runbook see `SKILL_AUDIT_LOOP.md § Part 3 — Per-Skill Audit Runbook`.

### What the loop must produce

In **diagnostic mode**, the deliverable is a complete report. Remediation is a downstream task. In **remediation mode**, the deliverable is the report + the fix commit in one pass. Both modes preserve every finding — neither drops information.

For every audited skill (in either mode), the loop produces evidence on:

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
- Marking a finding "fixed" inside a **diagnostic** audit report — diagnostic mode is report-only; fixes belong in a downstream task or in a **remediation** audit (which commits the fix in the same pass, see § Two operating modes).

## Validation Commands

Use the full repo verification before handing off substantive changes:

```bash
npm run verify
```

### Separate gates not in `npm run verify`

These gates run independently because their failure modes are CONTENT-drift, not SYSTEM-correctness. A green `npm run verify` does NOT imply they pass; agents and CI must run them explicitly.

| Gate | Command | What it catches | Why it's separate |
|---|---|---|---|
| **Audit-evidence consistency** | `npm run audit-manifest:check` (or `node scripts/check-audit-manifest.js`) | Historical verdict records that claim a graded comprehension/application verdict without the backing `evals/comprehension.json` / `evals/application.json` artifact | Mismatches are CONTENT-debt — the audit loop downgrades them to `UNVERIFIED` per-skill. Wiring this into `npm run verify` would force the verify suite red until all historical verdicts are reconciled, blocking unrelated SYSTEM work. Tracked at the SH-6548 follow-up. |
| **Status doc freshness** | `npm run status:check` | `docs/status.generated.md` is out of date relative to the current package version / schema / skill count / check states | Status doc is generated; running this gate before commit catches stale snapshots. |

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

For audit scaffolding — prefer the CLI surface over raw script paths:

```bash
# The four operations (audit / improve / evaluate / evolve) — see SKILL_AUDIT_LOOP.md.
node bin/skill-graph.js audit <skill-name>                          # Integrity Gate + Audit Status write-back
node bin/skill-graph.js audit <skill-name> --graded --grader-cli "<command>"
node bin/skill-graph.js improve --skill <skill-name>                # Karpathy keep-or-revert loop
node bin/skill-graph.js evaluate --mode comprehension <eval-file>   # stamp comprehension_verdict
node bin/skill-graph.js evaluate --mode application --application <skill-dir> <eval-file>  # stamp application_verdict
node bin/skill-graph.js status <skill-name>                         # read-only Audit Status view
node bin/skill-graph.js evolve --top 5                              # corpus walker (audit → improve → evaluate)
```

The CLI dispatchers delegate to `lib/audit/*.js` and pass arguments through verbatim. Calling the raw script paths still works (and is what the CLI invokes internally), but the CLI form is what the docs and `--help` reference.

One-shot umbrella entry point (recommended for bug reports and pre-PR sweeps):

```bash
node bin/skill-graph.js doctor
```

`doctor` runs the fast deterministic smoke subset — markdown links, protocol-check, doc drift, mirror freeze, schema constants, lint, and manifest validate. It is intentionally **not** equivalent to `npm run verify`; full verification still requires `npm run verify` from this repo because that also runs routing eval, export verification, overlap, and unit smoke tests.

### Internal `lib/` layout

`lib/audit/` is the audit-loop runtime bundled with `@skill-graph/cli`. `bin/skill-graph.js` calls into it for the `audit`, `evaluate`, `status`, and `evolve` operations; `application-eval.js` and `batch-eval.js` run gate-9 graders; `eval-staleness-checker.js` and `eval-linter.js` keep eval artifacts honest; `run-skill-improvement-loop.js` plus the `skill-improvement-helpers.js` / `skill-test-runner.js` / `research-feedback.js` / `log-paths.js` cluster are the inner loop for `improve`/`evolve`; `graders/*-prompt.md` are externalised grader prompts. `lib/audit-shared/` is cross-grader plumbing reused by the standalone CLI graders.

**Do not "consolidate" `lib/audit/parse-frontmatter.js`, `lib/audit/roots.js`, and `lib/audit/audit-prompt-builder.js` against the same-named files in `scripts/lib/`.** They are deliberate thin re-export shims — their own headers explain why — that let audit code `require('./<helper>')` without a relative path escaping the `lib/audit/` boundary. Both sides stay.

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

- `github.com/jacob-balslev/skill-graph` (this repo) **IS** the canonical consolidated Skill Graph repository per [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md) (consolidated 2026-05-18, SH-6137). It owns the protocol contract (v8 frontmatter, JSON Schemas under `schemas/`), the lint and manifest compiler, the router, the drift sentinel, the export pipeline, the audit scripts and graders, and the per-skill comprehension evals. The canonical `skills/<name>/SKILL.md` source files still live in the sibling `skills` repo. The previously separate `skill-metadata-protocol` and `skill-audit-loop` mirrors are now docs-only deprecation mirrors and no longer carry active source.
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

The two-step sync is intentional. It prevents the authoring repo's v8 protocol frontmatter from leaking into the marketplace surface, and it keeps the user-facing release small and Agent-Skills-compatible.

### Pre-release verification (in addition to Public Release Hygiene below)

Before pushing a sync to `jacob-balslev/skills`:

- The two repos' skill counts match: `find marketplace/skills -name SKILL.md | wc -l` (here) equals `find skills -name SKILL.md | wc -l` (release repo) post-sync. Use a recursive `SKILL.md` count, not `ls | wc -l`: `marketplace/skills/` is flat (`<name>/`) while the release library is nested by category (`<category>/<name>/`), so `ls | wc -l` counts incompatible top-level entries and never matches.
- The release repo's `README.md` matches `marketplace/README.md` from this repo.
- Every exported marketplace description is ≤ the marketplace limit (`node scripts/export-marketplace-skills.js --check`).
- No protocol frontmatter has leaked through — the release repo's skills are plain Agent Skills shape, not v8 protocol shape.
- All references in this repo's docs, READMEs, and scripts to the public URL go to `https://www.skills.sh/jacob-balslev/skills/`; references to the GitHub release repo go to `https://github.com/jacob-balslev/skills`.
- **No internal/project-scoped skills in the release tree.** `export-marketplace-skills.js` now enforces a publication gate: it excludes any skill with `deployment_target: project` (or legacy unmigrated `scope: codebase|operational`) or `grounding_mode: repo_specific|repo_internal` (logged to stderr as `EXCLUDED from marketplace export`), and `PRIVACY_PATTERNS` fails `--check` on `sales-hub/` paths and internal DB-surface names. Before pushing the release repo, also verify the working tree directly — `git ls-tree --name-only HEAD` must show only the curated `skills/` tree plus governance files, and `git rev-list --count origin/main..HEAD` plus a scan for `sales-hub/` / secret patterns must come back clean. (See the 2026-05-20 incident: 284 `scope: operational` internal skills were committed-but-unpushed in the release repo's local `main` and would have published on a `git push`; SH-6281 tracks the structural fix. An allowlist `.gitignore` now blocks `git add -A`, but a deliberate `git add <internal-dir>` could still bypass it — verify before every push.)

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
