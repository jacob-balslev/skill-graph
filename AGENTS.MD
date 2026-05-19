# Agent Instructions for Skill Graph

> Type: Repository guide
> Scope: Applies to this `skill-graph` repository.

This repo defines the Skill Metadata Protocol and the Skill Graph reference toolchain. Treat it as a protocol/schema/tooling project, not as an agent runtime, hosted marketplace, persistent memory system, or prompt library.

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
- Current skill contract: `schema_version: 6` (flat Understanding fields + Health Block; landed across skill-metadata-protocol `af6fd7f` / skill-graph `f489641` / skills `568647a` on 2026-05-16, then advanced to v6 with marketplace_tier / secondary_categories fields). Migrations v4→v5 and v5→v6 are both complete across the 145-skill canonical workspace; see `docs/migrations/v4-to-v5.md` for the v4→v5 breaking-change matrix and `docs/migrations/v5-to-v6.md` for the v5→v6 follow-on.
- This repo is the **canonical consolidated implementation** post-2026-05-18 (commit `654b4df`; see [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md) and SH-6137). Schemas, audit scripts, graders, eval fixtures, examples, and the protocol/audit canonical docs all live here. The canonical skill library (145 SKILL.md files) lives at `/Users/jacobbalslev/Development/skills/`. The previously separate `skill-metadata-protocol` and `skill-audit-loop` mirrors are preserved as docs-only deprecation mirrors — they are not archived on GitHub but no longer carry active source code. `examples/` still holds specimen projects and per-skill comprehension evals.
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
- `category` — current open enum; being closed in v5 to `{foundations, engineering, design, quality, agent, product}` (browse facet, not ontology truth).

Concept-shape contract (when `comprehension_state: present`):

- Requires the 7-field `concept` block: `definition / mental_model / purpose / boundary / taxonomy / analogy / misconception`.
- Requires `grounding.external_sources` with ≥2 non-repo references (paper, spec, canonical book, vendor doc with adopted industry standing). Single-vendor anchors are one source, not two.
- Concept-block body must contain no repo-specific nouns (no Sales Hub, no orchestrator-ui, no internal file paths).

Lifecycle fields that must remain truthful, not aspirational:

- `freshness` and `drift_check.last_verified` — set when actually verified.
- `eval_artifacts` (`present` / `planned` / `absent`) and `eval_state` (`verified` / `unverified`) — `verified` is a claim that requires evidence in the same change.
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

## Editing Rules

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

- If you change `schemas/skill.schema.json`, also update `schemas/skill.v5.schema.json` (the pinned copy of the current contract — see `npm run protocol:check § C6`) and any prior pinned versions only when intentionally backporting, plus `docs/field-reference.md`, `docs/skill-metadata-protocol.md`, `SKILL_METADATA_PROTOCOL.md` when relevant, `docs/manifest-field-mapping.md`, and `examples/skill-metadata-template.md` when affected. Regenerate `docs/field-reference.generated.md` with `node scripts/build-field-reference.js` in the same commit (enforced by `protocol:check § C7`).
- If you change `schemas/manifest.schema.json`, also update `schemas/manifest.v5.schema.json` (the pinned copy of the current contract), `docs/manifest-field-mapping.md`, and `scripts/generate-manifest.js` if projection logic changes.
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

- `eval_state: verified` is a claim that the eval was run and passed in the same change. Setting `verified` without evidence is a doc lie and fails the No-Unverified-Claims rule.
- `eval_state: unverified` is the correct default for a new skill until evals exist and pass.
- `routing_eval: absent` is honest for a skill that has not yet appeared in a routing eval; flipping to `present` requires the eval to actually include the skill.
- Drift baselines (`drift_check.truth_source_hashes`) must be re-recorded when truth sources intentionally change, and never silently bumped to mask drift.

### Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| Eval with only positive expectations | Cannot detect filtering, softening, or scope reduction. |
| Eval that paraphrases the skill body back to itself | Measures the skill's prose, not an agent's comprehension of it. |
| Single-scenario eval | Below the ≥7 threshold; insufficient signal. |
| `eval_state: verified` without re-running the eval in this change | Stale truth claim; fails the No-Unverified-Claims rule. |
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
8. **Concept-shape gate (when `comprehension_state: present`)** — 7-field concept block populated, ≥2 non-repo external grounding sources, no repo-specific nouns in the concept body.

### Findings completeness

Findings preservation is non-negotiable. If the audit emits N findings, the report contains N findings. The audit may *recommend* a prioritization (e.g., "address findings 1–3 before release; defer 4–9"), but never drops findings unilaterally. This rule mirrors and reinforces `Editing Rules` above.

Findings carry a severity column drawn from a fixed schema — `CRITICAL` (contract violation; ship-blocker), `HIGH` (correctness/clarity gap; pre-release), `MEDIUM` (drift, doc rot, minor structural), `LOW` (cosmetic), `INFO` (observation, no action). Severity is a column, not a prose qualifier.

### Audit anti-patterns

- "Top 5 findings" or any subset framing — drops information the user must see.
- Severity inflation/deflation to land at a desired total — distorts the priority signal.
- Filing audit findings into Linear without first stating them in the report — splits truth across surfaces.
- Marking a skill `eval_state: verified` as part of an audit without running the eval in the same change.
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

- `github.com/jacob-balslev/skill-graph` (this repo) **IS** the canonical consolidated Skill Graph repository per [ADR 0009](docs/adr/0009-sibling-repo-deprecation.md) (consolidated 2026-05-18, SH-6137). It owns the protocol contract (v6 frontmatter, JSON Schemas under `schemas/`), the lint and manifest compiler, the router, the drift sentinel, the export pipeline, the audit scripts and graders, and the per-skill comprehension evals. The canonical `skills/<name>/SKILL.md` source files still live in the sibling `skills` repo. The previously separate `skill-metadata-protocol` and `skill-audit-loop` mirrors are now docs-only deprecation mirrors and no longer carry active source.
- `github.com/jacob-balslev/skill-graph` **IS NOT** a user-facing skills.sh source. The frontmatter is the protocol contract, not a plain Agent Skills marketplace export. Do not document, link, or instruct users to install from this repo. Do not let it surface as a user-facing skills.sh row.
- The local `marketplace/skills/` directory in this repo is a **staging surface**, not a publication target. Its purpose is to produce the plain `SKILL.md` files that get synced to `jacob-balslev/skills`.

### Stale URLs (do not reference as canonical, ever)

These appeared during earlier publishing attempts. They are deprecated and tracked for removal in `vercel-labs/skills#1147`. The two GitHub repos behind #2 and #3 have been deleted upstream; the skills.sh rows remain as zombie cached metadata.

1. `https://www.skills.sh/jacob-balslev/skill-graph/` — old direct-index of the authoring repo.
2. `https://www.skills.sh/jacob-balslev/skill-graph-skills/` — old split export source (GitHub repo deleted).
3. `https://www.skills.sh/jacob-balslev/skill-graph-skills-missing-1/` — old split export source (GitHub repo deleted).

If any new doc, script, README, or marketing surface emits one of these URLs as canonical, that is a doc bug. Fix it to the canonical URL above.

### Release sync — two-step protocol

Publishing is a two-step sync because the canonical authoring repo and the canonical user-facing release repo are distinct:

1. **Generate the marketplace surface** in this repo: `node scripts/export-marketplace-skills.js`. Verify: `node scripts/export-marketplace-skills.js --check`. The exporter writes plain Agent Skills `SKILL.md` files to `marketplace/skills/`. `RELEASE_TARGET_REPO` in that script is `jacob-balslev/skills` — do not change without coordinating both repos.
2. **Sync to the release repo** at `https://github.com/jacob-balslev/skills` (local clone at `~/Development/skills/`). Copy `marketplace/skills/.` into the release repo's `skills/` directory, refresh the release repo's `README.md` from `marketplace/README.md`, commit path-limited with `--only`, and push. The release repo's HEAD becomes the snapshot skills.sh indexes.

The two-step sync is intentional. It prevents the authoring repo's v5 protocol frontmatter from leaking into the marketplace surface, and it keeps the user-facing release small and Agent-Skills-compatible.

### Pre-release verification (in addition to Public Release Hygiene below)

Before pushing a sync to `jacob-balslev/skills`:

- The two repos' skill counts match: `ls marketplace/skills/ | wc -l` (here) equals `ls skills/ | wc -l` (release repo) post-sync.
- The release repo's `README.md` matches `marketplace/README.md` from this repo.
- Every exported marketplace description is ≤ the marketplace limit (`node scripts/export-marketplace-skills.js --check`).
- No protocol frontmatter has leaked through — the release repo's skills are plain Agent Skills shape, not v5 protocol shape.
- All references in this repo's docs, READMEs, and scripts to the public URL go to `https://www.skills.sh/jacob-balslev/skills/`; references to the GitHub release repo go to `https://github.com/jacob-balslev/skills`.

### When skills.sh is wrong about us

The platform-side cleanup tracking the three stale rows is at `vercel-labs/skills#1147`. The user-facing escalation channel is the Vercel Community forum (e.g. https://community.vercel.com/t/removing-a-skill-from-the-skills-sh-list/35562 — `@quuu` is the staff contact who has historically performed removals). The skills.sh CLI has no `delete-source`/`reindex` command; the Discourse API requires login; the `skills.sh/api/v1/*` surface requires a `Bearer sk_live_...` key we do not hold. There is no automation path for source removal — coordinate via the issue and forum.

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
