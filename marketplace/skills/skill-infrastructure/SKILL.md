---
name: skill-infrastructure
description: "Use when designing or auditing deterministic health tooling for a skill library: schema/source validation, manifest/protocol parity, relation integrity, routing health, drift/export checks, supply-chain scanning, and eval-verdict evidence honesty. Covers checker ownership, the library-as-database model, release gates, and maintenance workflows after batch skill changes. Do NOT use for authoring one SKILL.md (use `skill-scaffold`), repo conformance audits (use `graph-audit`), generic lint rules (use `lint-overlay`), or reviewing checker code (use `code-review`). Do NOT use for scaffold a new SKILL.md for our team''s deploy procedure. Do NOT use for audit this Skill Graph repo for schema conformance and dangling relation targets. Do NOT use for the manifest sample drifted from the generator — find the mismatch. Do NOT use for improve this prompt''s wording to get better outputs. Do NOT use for review this AI-generated PR for correctness. Do NOT use for review this PR that changes scripts/skill-lint.js."
license: MIT
compatibility: "Library- and harness-agnostic. Patterns apply to any skill-style library (Skill Graph, Claude skills, OpenAI/Codex skills, Cursor rules, OpenCode skills, custom in-house skill systems). Specific tool names in this skill (skill-lint, generate-manifest, routing-eval, drift-sentinel, check-audit-manifest) are concrete examples from the Skill Graph reference implementation -- substitute your library's equivalent deterministic tools."
allowed-tools: Read Grep Bash Edit Write
metadata:
  grounding: "{\"subject_matter\":\"Deterministic health tooling for Skill Graph libraries\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"package.json\",\"bin/skill-graph.js\",\"scripts/skill-lint.js\",\"scripts/lib/roots.js\",\"scripts/check-schema-constants.js\",\"scripts/check-protocol-consistency.js\",\"scripts/generate-manifest.js\",\"scripts/check-manifest-freshness.js\",\"scripts/check-audit-manifest.js\",\"scripts/check-application-evals.js\",\"lib/audit/eval-staleness-checker.js\",\"scripts/skill-audit-preflight.js\",\"scripts/skill-graph-drift.js\",\"scripts/skill-overlap.js\",\"scripts/skill-graph-routing-eval.js\",\"scripts/export-marketplace-skills.js\",\"scripts/verify-skill-md-export.js\",\"docs/manifest-field-mapping.md\",\"docs/verdict-semantics.md\",\"SKILL_GRAPH.md\",\"skill-audit-loop/SKILL_AUDIT_LOOP.md\"],\"failure_modes\":[\"health_tooling_categories_missing_from_ci\",\"checker_ownership_overclaimed\",\"protocol_mapping_drift\",\"relation_target_integrity_unguarded\",\"eval_thresholds_become_self_attested\",\"audit_verdicts_claim_artifacts_that_do_not_exist\",\"overlap_or_drift_checks_not_run_after_batch_changes\",\"export_surface_or_marketplace_index_drift\"],\"evidence_priority\":\"repo_code_first\"}"
  relations: "{\"related\":[\"lint-overlay\",\"skill-scaffold\",\"graph-audit\",\"testing-strategy\",\"project-knowledge-extraction\"],\"suppresses\":[\"skill-scaffold\"],\"verify_with\":[\"testing-strategy\",\"code-review\",\"graph-audit\"]}"
  subject: agent-ops
  scope: "Designing deterministic health tooling for skill libraries, including source/schema inventory, protocol/projection consistency, conflict/overlap/relation integrity, routing and retrieval health, drift sentinels and export/mirror parity, safety/supply-chain scanning, audit/eval evidence-state honesty, release/publication gates, and maintenance workflows after batch skill changes. Portable across Skill Graph, Claude skills, OpenAI/Codex skills, Cursor rules, OpenCode skills, and custom in-house skill systems. Excludes authoring a single SKILL.md (skill-scaffold), running this repo's conformance audit (graph-audit), selecting general codebase lint rules (lint-overlay), and reviewing the health-tooling implementation itself (code-review)."
  public: "true"
  taxonomy_domain: agent/skill-system
  stability: experimental
  keywords: "[\"skill library health\",\"skill system tooling\",\"skill library decay\",\"skill overlap detection\",\"frontmatter validation\",\"routing health\",\"drift sentinel\",\"checker ownership\",\"audit artifact integrity\",\"skill supply-chain scan\"]"
  examples: "[\"our skill library is growing and we''re getting silent decay — eval counts dropping, conflicts emerging — what tooling should we add?\",\"two of our skills give opposite instructions for the same function — how do we detect this automatically?\",\"we keep getting skill-router misses on real user queries — how do we surface and close routing gaps?\",\"design a health-check pipeline for a 200-skill library that runs in CI\",\"what''s a reasonable minimum eval count per skill, and how do we enforce it?\",\"which checker should own relation-target existence — lint, or a separate graph-integrity gate?\",\"what should fail release if an application verdict has no application.json behind it?\",\"our public skills export differs from the canonical source — what parity checks do we need?\",\"a newer vendor skill API exists now — did it make our skill-graph tooling obsolete?\",\"we want to import community skills — what safety/supply-chain scan should gate them before they enter the corpus?\",\"our skill mirror in `.claude/skills` keeps drifting from the source — what''s the parity check?\"]"
  anti_examples: "[\"scaffold a new SKILL.md for our team''s deploy procedure\",\"audit this Skill Graph repo for schema conformance and dangling relation targets\",\"the manifest sample drifted from the generator — find the mismatch\",\"improve this prompt''s wording to get better outputs\",\"review this AI-generated PR for correctness\",\"review this PR that changes scripts/skill-lint.js\",\"set up ESLint for our TypeScript repo\",\"draft an architecture note explaining why we chose Postgres\",\"write documentation explaining the protocol to humans\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/skill-infrastructure/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
# Skill Infrastructure

## Concept of the skill

**What it is:** Skill infrastructure is the deterministic health-tooling layer for a skill library: schema validation, sidecar integrity, manifest freshness, routing checks, drift detection, eval-artifact honesty, export parity, and release gates.

**Mental model:** Treat the skill corpus like a database. `SKILL.md` files are authored records, `audit-state.json` files are sidecar state, manifests and exports are materialized views, relations are foreign keys, and each checker owns one narrow invariant.

**Why it exists:** Skill libraries decay silently. A stale truth-source hash, vague routing contract, missing eval artifact, or drifted export will not crash the agent, but it can make the loaded skill misleading. The infrastructure turns that quiet drift into explicit findings.

**What it is NOT:** It is not the authoring guide for one new skill, the graph-audit skill for this repo's conformance run, a generic lint-rule catalog, or a code-review process for health-tooling changes.

**Common misconception:** A green linter is not a healthy library. Lint proves only the structural invariant it owns; drift, routing, application-eval shape, audit-manifest honesty, export parity, and relation integrity need their own receipts.

## Coverage

- The library-as-database mental model: skill-infrastructure as the linter, integrity checker, query planner, drift sentinel, release gate, and artifact ledger for a SKILL.md library
- The skill-as-contract model: a skill makes three independently-breakable promises — `description` (capability scope), `allowed-tools` (tool surface), body (procedure) — and three independent failure modes follow from them
- Why deterministic, zero-LLM tooling is mandatory for *structural* health and *artifact honesty* (trustworthy enough for CI gates; LLM-based metadata checks are circular), and where LLM-as-judge legitimately operates (task output and activation traces, one layer up)
- Checker ownership: which invariant belongs to lint, schema-constant checks, protocol parity, manifest validation/freshness, overlap, routing eval, drift, audit-manifest, application-eval, preflight, export verification, and the release gate — and why a green command is scoped, never a whole-library health claim
- The seven categories of skill-health tooling: (1) inventory and source validation, (2) protocol/projection consistency, (3) conflict/overlap/relation integrity, (4) routing and retrieval health, (5) drift/freshness/mirror/export parity, (6) safety and supply-chain scanning, (7) audit/eval evidence-state integrity
- Conflict and overlap: what the live overlap checker actually owns (activation-surface collisions — triggers, keywords, paths) vs the advanced/optional detector patterns (Jaccard description similarity, heading overlap, code duplication, imperative-conflict extraction with negation-aware false-positive suppression) that a library may layer on top
- Relation integrity: `relations.*` target existence as a foreign-key check, the `relations.suppresses` edge semantics, the deprecated `relations.boundary` alias for historical or external input, and the checker-ownership gap when target existence is unguarded
- Eval quality patterns: minimum eval threshold per skill, the contradiction-check eval type, the negative-expectation / absent-signal requirement, valid eval-type taxonomy, application-eval case floors and verdict-artifact honesty, and the activation-level dispatch/trajectory/integration rubric
- Routing gap analysis: how to read a "routing-misses" log, how to distinguish keyword gaps from skill-content gaps, retrieval-baseline metrics (Recall@1, Recall@3, coverage), signal-hygiene rules to suppress noise, and why flat libraries suffer routing collapse at scale
- Token-budget and progressive-disclosure health: skill startup cost, load-on-demand references, body-size discipline
- Drift, export, and public-index parity: truth-source hashing, mirror parity, NO_BASELINE / EXTERNAL_UNHASHED states, export-surface parity, and treating public marketplaces as caches (not canonical) whose stale rows are release debt
- Upstream-displacement reasoning: how to decide whether a native vendor skill API (OpenAI, Anthropic, OpenCode, Cursor) has displaced part of the local system, and how to retire only the exact invariant the upstream tool proves
- Maintenance workflows: when to run a full health check, the order in which to run the categories, what to fix before what, and smoke-vs-release gate distinction
- Anti-patterns that cause invisible decay: dirty-tree manifest writes, deletion-as-conflict-resolution, eval-renumbering during cleanup, scope/threshold masking, mega-linter overclaim, false-canonicality verdicts, unscanned community imports, flat-at-scale organization, stale marketplace rows
- The verification gate before any batch skill commit or public release: every category clean, every new skill meets eval minimums, every routing/export change reflected in the regenerated artifacts
- Package and workspace-root integrity: the npm CLI entrypoint must dispatch to the same scripts as local development while resolving schemas from the package and skills/manifests from the caller workspace
- The portable health-tooling landscape: the Skill Graph reference scripts plus external validators (claudelint, SkillCheck, agent-ecosystem/skill-validator) and trace-based harnesses (MLflow) that implement these categories for other ecosystems

## Philosophy of the skill

A skill library is only as useful as its worst skill. When agents load stale, conflicting, poorly-routed, over-privileged, or mirror-drifted skills, they get *worse* at tasks — not better. A skill library at scale (50+, certainly 200+) decays invisibly: eval counts drift below minimums, keyword maps miss whole product areas, public exports lag the canonical source, truth sources move, relation edges silently point at the wrong owner, and two skills start giving opposite instructions for the same function.

The value of the library is empirical, not assumed. On the SkillsBench benchmark (84 tasks across 11 domains), *curated* skills raised average task pass rates by **16.2%**, while *model-written* skills produced no consistent benefit across configurations — models generated imprecise procedures or failed to recognize what domain knowledge the task required (O'Reilly Radar, 2026; "Agent Skills Work but the Research Shows Most Teams Are Building Them Wrong"). The same research found focused skills with two-to-three modules consistently outperformed comprehensive documentation. The lesson for infrastructure: the thing you are protecting (curation quality) is exactly what decays silently, and the lift it provides is large enough to be worth a permanent guard.

Decay is also a *scale/shape* failure, not just a per-skill one. The AgentSkillOS study of ecosystems from 200 to 200,000 skills found that flat retrieval becomes unreliable as a library grows: similar descriptions trigger interchangeably and the orchestrator enters **routing collapse** — it consistently invokes the wrong skill while still producing reasonable-looking output. Hierarchical organization (domain → branch → leaf) consistently beat flat organization, with the gap widening at scale. A health-tooling layer therefore has to watch the *shape* of the library, not only the contents of each file.

The infrastructure exists to catch that decay deterministically. Structural and corpus-health checks read files, parse contracts, compare hashes, validate generated artifacts, and compute explicit pass/fail output — they do not reason, infer, or hallucinate. Do not ask an LLM whether the schema validates, whether a relation target exists, whether an eval artifact has enough cases, or whether a manifest is fresh. Those are machine-checkable facts, and a deterministic answer is trustworthy enough for a CI gate. An LLM-based health check is circular: the same probabilistic component that produces the skill library cannot reliably grade its own metadata.

That does not mean "never use LLMs." The boundary is **ownership**: deterministic tooling proves structural health and artifact honesty; behavior evaluation proves whether a skill actually changes agent behavior on realistic tasks. LLM-as-judge has a legitimate place one layer up — scoring *task output* and *activation traces*, where external harnesses like MLflow apply it — but never as the deterministic metadata gate. A model grader without eval artifacts, receipts, and verdict semantics is not a health gate.

Each checker owns a narrow invariant. The system fails when one broad script claims to prove everything.

> If the skill library is a codebase, skill-infrastructure is its combined linter, type-checker, dead-code detector, **dependency-vulnerability scanner**, drift sentinel, release gate, and artifact ledger — always-on, zero-model for the structural surface, CI-safe.

The maintenance commitment is: run a full health check after any batch skill work, fix threshold violations before they reach the gate, and document conflicts before the agents loading those skills are affected.

## The Skill-as-Contract Model

Modern skill ecosystems converge on one framing: a skill is a **contract**, not a single decision. It makes three promises, each independently verifiable and independently breakable (Future AGI, "Claude Skills Evaluation Deep Dive," 2026):

| Promise | Carried by | Broken when |
|---|---|---|
| **Capability scope** | `description` / routing contract | The skill activates outside its declared scope, or fails to activate inside it |
| **Tool surface** | `allowed-tools` frontmatter | The body invokes tools the skill never declared (privilege creep) |
| **Procedure** | the markdown body | The body wanders off its stated procedure, or contradicts its own anti-patterns |

This matters for infrastructure because each promise needs a *different* check. Scope is a routing-health concern; tool surface is an inventory concern (validate `allowed-tools` against what the body actually calls); procedure integrity is a drift and conflict concern. A single pass-or-fail verdict over the whole skill blurs three distinct contracts and hides which one broke. The checker-ownership matrix below is the operational counterpart: one checker per invariant, never one checker for everything.

## The Library-as-Database Mental Model

Treat the skill library as a database and skill-infrastructure as its query planner, integrity checker, and migration-safety net combined.

| Database concept | Skill-library equivalent |
|---|---|
| Schema | `SKILL.md` frontmatter schema plus the `audit-state.json` sidecar schema (JSON Schema or equivalent) |
| Constraints | Required fields, eval thresholds/floors, valid enum values, verdict/artifact rules, stability rules |
| Foreign keys | `relations.suppresses[]`, `relations.related[]`, verifier and dependency edges — must point at real skills |
| Indexes | Manifest, routing-keyword map, path-glob inverse index, export directory, public marketplace index |
| Integrity check | Protocol-consistency tooling (cross-schema parity, sample correctness, generated-field parity), relation-target validation, audit-artifact checks |
| Query planner | Skill router and retrieval baseline (matches user prompt + project/path context → skill activation) |
| Replication lag | Mirror parity (`.claude/skills`, `.agents/skills`, harness-specific copies), rendered/exported skills, marketplace staging output, public listings |
| Migration safety | Schema-constant checks + version-earned discipline keep a contract bump from silently invalidating the corpus |
| Dead references | Skills with broken relation targets, phantom routing entries, broken truth sources, orphaned public rows |
| Access control / injection guard | Safety scan: declared `allowed-tools` vs body; injection/exfiltration/secret patterns in untrusted imports |

Every script in this domain reads files and computes — it does not reason. Output is deterministic, reproducible, and safe to embed in CI gates. Every generated artifact must be traceable back to the canonical two-file source of a skill: `SKILL.md` for the agent-facing contract/body, and `audit-state.json` for audit/eval/provenance state. A manifest or export that cannot explain its source is not a reliable index.

## Health-Tooling Categories

Load `references/health-tooling-categories.md` when designing or auditing the full checker stack. The main categories are inventory/source validation, protocol/projection consistency, conflict/overlap/relation integrity, routing/retrieval health, drift/freshness/export parity, safety/supply-chain scanning, and audit/eval evidence-state integrity. Keep each checker narrow: one tool owns one invariant, and a green result from one checker never proves the whole library is healthy.

## Checker Ownership Matrix

Use this matrix when deciding where a new invariant belongs or when interpreting a green command. Green output is *scoped* — ask "what invariant did this checker own?" before claiming a library is healthy.

| Checker | Owns | Does not prove |
|---|---|---|
| `skill-lint` | Frontmatter parse, canonical schema, identifier shape, required authored fields, narrow cross-file schema obligations | Skill quality, routing topology, eval quality, relation-target existence, export validity |
| `check-schema-constants` | Contract constants such as schema version, required axes, enum sets, sidecar-required fields | Individual skill conformance across the corpus |
| `check-protocol-consistency` | Schema/docs/generator/sample/context parity (C1–C8) | Behavior quality or routing performance |
| `generate-manifest --validate-only` | Manifest projection shape and schema-valid generated index | Freshness (unless paired with manifest-freshness); relation targets unless explicitly implemented |
| `check-manifest-freshness` | Generated manifest matches current source | Whether the source itself is correct |
| `skill-overlap` | Activation-surface collisions across triggers, keywords, and paths | Semantic contradiction in bodies, unless a dedicated imperative detector exists |
| `skill-graph-routing-eval` | Examples/anti_examples top-1 behavior and optional retrieval-baseline metrics | Whether the skill answered correctly after activation |
| `skill-graph-drift` | Grounding truth-source hash status and stale review windows | Whether changed truth sources still support the skill after human review |
| `check-audit-manifest` | Graded verdict claims have matching artifacts | Eval-artifact schema quality or grader correctness |
| `check-application-evals` | Application-eval schema shape, case floor, required fields, unique IDs, red-herring recommendation | Whether the cases are high quality |
| `eval-staleness-checker` | Referenced paths/symbols/patterns still exist | Whether expectations are substantively correct |
| `skill-audit-preflight` | Readiness for audit/evaluate/improve operations | Final audit quality |
| Export/render verification | Public/runtime projection matches the canonical/generated output | Public marketplace cache freshness |
| `doctor` / smoke command | Fast local sanity over a subset of checks | Release readiness |
| `verify` / `release:check` | Full gate bundle for system or release context | Anything intentionally out of scope for that gate |

## Eval Quality Patterns

Load `references/eval-quality-patterns.md` when designing or repairing eval artifacts. The main SKILL.md only needs the operating rule: eval claims must have matching artifacts and receipts; cases need hard negatives or absent-signal expectations; IDs are append-only; activation-level quality separates dispatch correctness, trajectory adherence, and output integration.

## Evals

This skill ships an eval set with scenario coverage for the seven health-tooling categories, negative-expectation / absent-signal discipline, dirty-tree manifest writes, conflict/overlap triage, routing-gap hygiene, drift and export-parity states, safety-scan provenance, audit/eval evidence-state honesty, and boundary routing. The evals are portable by design: they test the skill-system discipline rather than one repository's implementation details. (Application-eval coverage must meet the schema case floor; an artifact below the floor is migration debt to close before claiming a graded application verdict.)

## The Portable Health-Tooling Landscape

The Skill Graph reference scripts are one implementation of these categories; the categories themselves are ecosystem-agnostic, and several external tools implement the same shape for Claude / Cursor / VS Code skill libraries. Substitute your library's equivalents — the discipline transfers even when the binary does not.

| Tool | Ecosystem | Categories it covers |
|---|---|---|
| Skill Graph scripts (`skill-lint`, `check-protocol-consistency`, `skill-overlap`, `skill-graph-drift`, `skill-graph-routing-eval`, `check-audit-manifest`, `check-application-evals`) | Skill Graph / portable | 1–5, 7, deterministic, CI-gated |
| claudelint "Skills" validator (43 rules) | Claude Code | 1 (correctness, documentation quality) + 6 (security, best practices) |
| SkillCheck | Claude / Cursor / VS Code | 1 + 6, runs locally (no skill content leaves the machine); covers security, slop, accessibility, agent-readiness, governance |
| agent-ecosystem/skill-validator | Agent Skill spec | 1 (link resolution, forbidden files, token counts, content density) + 6, optional LLM-as-judge for quality |
| MLflow skill harness | Claude Code (headless) | Activation-level eval (the dispatch/trajectory/integration rubric) — LLM judges over traces, the layer above the deterministic gate |

The portability lesson: a category is a *requirement*; the tool is an *implementation detail*. If your ecosystem lacks a tool for one category (most lack a deterministic safety scan and a deterministic evidence-state gate), that category is the gap to close first.

## Upstream-Displacement Check

Before expanding local infrastructure, ask whether a major upstream runtime or OSS project now owns the problem better.

Current pattern:

- OpenAI, Anthropic, OpenCode, Cursor, Microsoft, and Agent Skills-compatible tools increasingly support `SKILL.md` or rule-style packages with name/description discovery and optional resources.
- Native runtimes improve packaging, upload, invocation, dashboards, and portability. They do **not** by themselves supply Skill Graph's graph-level health model: typed relation governance, truth-source drift, audit/eval artifact honesty, manifest projection parity, release/export parity, and corpus routing metrics.
- Research on skill reuse, skill evaluation, and semantic supply-chain attacks strengthens the case for static/deterministic checks plus behavior evals. It does not displace the deterministic health layer.

**Displacement finding rule:**

| Finding | Action |
|---|---|
| Upstream now validates a structural invariant better | Prefer upstream validation; keep only local glue that proves parity or calls it |
| Upstream supports skill upload/rendering | Remove bespoke publishing mechanics only if export receipts prove parity |
| Upstream adds dashboards or usage telemetry | Use telemetry as routing/eval input, not as a replacement for local checks |
| Upstream security scanner detects malicious skills | Integrate as one checker; keep the instruction/data boundary and public-content checks local |
| Upstream only provides name/description discovery | No displacement; local graph health remains necessary |

Do not delete local guidance merely because an upstream tool exists. Record what exact invariant upstream now proves, how it is invoked, and what local checker or section it replaces.

## Maintenance Workflows

### The full health check sequence

Run after any batch skill work — creating ≥ 3 skills, changing routing config, modifying skill content across multiple files, changing schemas or manifest projection, changing export/render behavior, or refreshing public release artifacts. Order matters:

```bash
# 1. Fast structural gate for authored source
<lint tool>

# 2. Contract constants and protocol/projection parity
<schema-constant tool>
<protocol-consistency tool>

# 3. Generated index integrity
<manifest generator> --validate-only
<manifest freshness tool>

# 4. Cross-skill relation, overlap, and conflict hygiene
<relation-target checker>
<overlap tool> --conflicts

# 5. Routing health
<routing eval tool> --only-asserted
<retrieval baseline tool>
<routing gap reporter> --since 7d           # + shelf-size / hierarchy check

# 6. Drift, freshness, mirror parity
<drift tool>
<mirror parity tool>

# 7. Safety / supply-chain scan — injection, exfiltration, secrets, untrusted imports
<safety-scan tool>                          # run on every import from outside the owned corpus too

# 8. Audit / eval evidence-state integrity
<audit-manifest checker>
<application-eval checker>
<eval-staleness checker>
<audit preflight> --for all

# 9. Export and publication gates
<render/export verifier>
<marketplace verifier>

# 10. Regenerate writable artifacts only after the source is clean
<manifest generator> --write
<export generator> --write
```

Review the output of steps 1–9 before writing artifacts in step 10. Generated outputs should reflect a clean source tree; never write a manifest or export from a dirty tree, and do not use generation to hide an unhealthy source state.

### Smoke checks vs release checks

A smoke command is for quick local diagnosis — fast and narrow. A release check is the *publishability* claim: it must include corpus checks, manifest freshness, routing eval, export verification, status/audit-artifact honesty, and any strict eval-shape gates that have graduated from report-only mode. Do **not** treat `doctor`, `lint`, or a system-only gate as proof that a public skill release is safe unless the project explicitly defines them as the release bundle.

### Adding or repairing evals

1. Read the skill's existing eval set and sidecar status
2. Identify the missing coverage: activation, hard negative, contradiction, prior failure, red herring, application scenario, or stale evidence reference
3. Draft cases with `id`, `prompt`, `expected_output`, `expectations`, `type`, `grounding`, `difficulty` (plus `expected_flags` / `absent_signals` for application evals)
4. Ensure every new case has at least one `does not / never / must not` expectation or absent-signal clause
5. **Append** to the eval array — never renumber existing IDs (eval-history logs and grader receipts reference numeric IDs)
6. Run the eval-shape checker, eval-staleness checker, routing eval (if activation changed), and preflight for the intended operation; verify the skill no longer appears in `belowMinimum` / `missingNegativeEvalIds`

### Triaging overlap and imperative conflicts

1. Get structured output from the overlap/conflict tool (`--conflicts --json`)
2. Classify the finding: trigger collision, keyword recall overlap, path overlap, real imperative conflict, phantom negation match, duplicated example, or relation gap
3. Preserve useful recall — do **not** delete a keyword just because it is shared
4. Resolve real conflicts by *narrowing scope* or *naming the exception*, not by deleting the instruction:
   - "Use X" → "Use X in app code" (narrower)
   - "Always use X" → "Always use X for tenant-scoped data" (specific)
   - "Never use Y" → "Never use Y in user-facing app code; system migration scripts may use it with justification"
   - Move the negative instruction to an anti-patterns row that does not start with "Use"; add an inline qualifier (e.g. `// system: <reason>`) the detector can distinguish
   - Duplicate example → one skill owns it, the other links to the owner
5. Add or correct relation edges so the router has typed knowledge, not only lexical overlap
6. Re-run the checker to confirm the conflict is gone, and document the resolution in a conflict log so future audits know it was deliberate

### Fixing invalid frontmatter / metadata

| Problem | Fix |
|---|---|
| `scope` field absent or vague | Add a free-text PRD-style statement of what the skill teaches, where it deploys, and what it excludes |
| non-empty `project[]` without grounding | Add `grounding.subject_matter` and truth sources, or change the deployment target if the skill is actually portable |
| Sidecar missing audit/eval fields | Create or repair `audit-state.json`; do not stuff audit state back into frontmatter |
| `drift_check.last_verified` absent or stale | Add or update the sidecar date only after verifying the declared truth sources |
| `eval_artifacts` absent | Set the sidecar field to `present` if eval files exist, `planned` if intended, `none` otherwise |
| `relations.boundary` authored in new content | Use `relations.suppresses`; accept the old alias only when reading historical or external input |
| Relation target missing | Fix the target name, add the missing skill only if it really exists conceptually, or remove the edge with a recorded reason |
| `keywords` empty, vague, or over cap | Add up to 10 natural-language phrases users would actually type |
| `description` too short | Quote it; require ≥ 100 chars; include trigger phrases and a "Do NOT use for X (use Y)" exclusion |
| `allowed-tools` broader than the body uses | Tighten the declared tool surface to what the body actually invokes |
| Eval artifact below floor | Add meaningful cases; do not lower the floor to make a status green |
| `version` absent | Set the sidecar version to `1.0.0` for new skills; bump per semver on substantive content change |
| Public export differs from canonical | Fix the canonical source or the export projection, then regenerate and verify |

After editing, re-run the inventory/relevant tool and confirm the skill no longer appears in the invalid list.

## Anti-Patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| One mega-linter claims to prove the whole library | It becomes noisy, slow, and semantically overclaimed; a green run hides which invariant was never checked | Keep focused checkers with narrow ownership; consult the checker-ownership matrix |
| Treating lint success as quality certification | Lint proves shape, not usefulness | Use behavior evals and application verdicts for usefulness |
| Running manifest/export writes on a dirty skill tree | Writes a broken index/export that downstream consumers trust | Fix all source and checker errors first, then regenerate |
| Resolving conflicts by deleting one instruction | Removes useful guidance the agent needs in the right scope | Narrow the scope of the instruction, name the exception, or split ownership |
| Deleting shared keywords to reduce overlap warnings | Strips recall and worsens routing | Add/verify relation edges and boundary wording |
| Adding evals without negative expectations | They test only happy paths and miss the motivating failure modes | Every eval must have at least one `does not / never / must not` expectation or absent-signal clause |
| Renumbering eval IDs during cleanup | Breaks eval-history references and grader receipts that use numeric IDs | Always append; never renumber |
| Claiming a graded verdict without the eval artifact | Creates false canonicality — a quality claim with no evidence | Gate verdict claims on matching artifacts and receipts |
| Lowering eval floors to clear a gate | Turns the threshold into self-attestation | Add cases or explicitly document non-applicability |
| Un-backticking an identifier to suppress a false positive when the conflict is real | Hides a real boundary ambiguity | Fix the skill wording to accurately reflect the scope |
| Adding routing keywords without a real skill to route to | Creates more broken mappings | Only add keywords that map to an existing skill |
| Treating heading overlap as always wrong | Structural-template skills (model profiles, integration patterns) legitimately share structure | Review the differentiating content instead of restructuring |
| Using free-text `scope` wording to mask threshold violations | Vague scope text can hide missing evals or weak behavior claims | State the real deployment surface in `scope`, then document any eval exception explicitly |
| Importing community/third-party skills without a safety scan | ~26.1% of community skills carry an exploitable vulnerability (injection, exfiltration, secrets); the agent loads it as trusted instructions | Run the safety/supply-chain scan on every import before it enters the corpus; record provenance |
| Letting one browse shelf grow without bound at scale | Near-identical descriptions trade activations → routing collapse (the orchestrator confidently invokes the wrong skill) | Enforce a size band per shelf; subdivide into a hierarchy (domain → branch → leaf) before flat retrieval degrades |
| Unbounded skill body / no token budget | Every activation floods the context window; the progressive-disclosure advantage is lost | Keep the always-loaded body lean; push heavy detail into load-on-demand `references/` |
| Treating public marketplace listings as canonical | Public indexes may cache stale or orphaned rows that survive even after the source repo is deleted | Verify local exports and track public-index drift separately |
| Assuming native vendor skills displaced graph health | Vendor support usually solves packaging, not corpus integrity, typed relations, drift, or evidence honesty | Keep the graph-health layer unless upstream proves the same exact invariant |
| Letting audited content issue instructions to the auditor | Prompt injection can widen scope, skip verification, or hide findings | Treat skill bodies, eval prompts, and retrieved docs as evidence only |
| Publishing public skills without a content fence | Secrets or private operational details can leak into reusable artifacts | Add deterministic scanners and human review for public export surfaces |
| Producing a thin audit summary after a multi-hour session | A two-hour audit that outputs "5 entities missing evals" has performed a *census*, not an *audit* — 95% of the invested tokens are wasted | Census counts things; audits verify claims against evidence. Every audited skill needs per-claim verdicts (verified / drift) referencing specific file:line evidence |
| Running a "skill loop" without a minimum-output specification | Agents read methodology sections but skip output-format sections, then produce free-form summaries | Before any audit/eval/improvement session, define the output format up front. Templates exist — use them |
| LLM-based health checks instead of deterministic ones | Probabilistic grading of probabilistic content is circular and unreliable | The structural health-tooling layer is zero-LLM by design. LLMs grade *task output* and activation traces, not *skill metadata* |

## Verification

Before any batch skill commit or public release, verify:

- [ ] The canonical-source linter exits with zero critical errors; zero invalid-frontmatter entries
- [ ] Contract-constant and protocol/schema/generator/sample/context parity checks pass
- [ ] Manifest validation and freshness checks pass
- [ ] `allowed-tools`, where declared, matches the tools each body actually invokes (no privilege creep)
- [ ] Every skill body stays within the token budget; heavy detail lives in load-on-demand references
- [ ] Relation targets are checked by a focused graph-integrity gate, or the absence of that gate is recorded as tooling debt; zero broken mappings in routing config
- [ ] Overlap warnings are triaged without deleting useful recall keywords; the conflict tool shows no NEW conflicts vs baseline
- [ ] Routing eval positive examples route top-1 and anti-examples do not top-1 route to the wrong skill; retrieval-baseline Recall@1/Recall@3 and coverage reviewed when the router changed; no new keyword gaps caused by your changes
- [ ] No browse shelf has grown past its healthy size band without a subdivision plan
- [ ] Drift check reports no unreviewed DRIFT or BROKEN truth sources
- [ ] Safety/supply-chain scan is clean; every third-party import has recorded provenance
- [ ] All new skills meet the eval minimum (≥ 7, or ≥ 3 with explicit warning acceptance); all new evals include at least one negative expectation; eval artifacts meet schema floors, required fields, unique IDs, and stale-reference checks
- [ ] Graded verdicts have matching comprehension/application artifacts and receipts
- [ ] Export/render verification passes before publishing or updating mirrors; public marketplace/index state is checked separately when it matters to consumers
- [ ] No public artifact contains secrets, private operational data, customer data, or local-only paths
- [ ] Mirror parity verified if the library replicates to multiple harness directories; skill index header count matches actual skill count
- [ ] Generated artifacts are written only after source checks are clean

## Do NOT Use When

| Use instead | When |
|---|---|
| `skill-scaffold` | Authoring or restructuring a single new SKILL.md (the contract for one file, not the system around the library) |
| `graph-audit` | Running the conformance audit on this Skill Graph repo specifically (operational), not designing the discipline |
| `lint-overlay` | General-purpose lint-rule selection and gate placement for any codebase, not skill-system-specific tooling |
| `code-review` | Reviewing a code change to the health-tooling scripts themselves |
| `guardrails` | Designing the *runtime* defenses an agent applies while executing a skill (sandboxing, tool permissioning, exfiltration controls) — category 6 is the static library-entry scan, not the runtime guard |
| `owasp-security` | Application-security threat modeling at depth beyond static skill-file pattern scanning |
| `agent-eval-design` | Designing the eval cases, graders, and thresholds for the activation-level rubric (you build the cases there; infrastructure makes activations observable) |
| `evaluation` | Scoring a completed audit or activation trace against evidence and deciding whether it is done |
| `documentation` | Writing prose for a human reader explaining how the skill system works |
| `testing-strategy` | Designing the test pyramid / trophy / honeycomb shape for a non-skill-library codebase |
| `prompt-craft` | Improving the wording of a single skill's prompt or eval prompt |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `agent-ops`
- Public: `true`
- Domain: `agent/skill-system`
- Scope: Designing deterministic health tooling for skill libraries, including source/schema inventory, protocol/projection consistency, conflict/overlap/relation integrity, routing and retrieval health, drift sentinels and export/mirror parity, safety/supply-chain scanning, audit/eval evidence-state honesty, release/publication gates, and maintenance workflows after batch skill changes. Portable across Skill Graph, Claude skills, OpenAI/Codex skills, Cursor rules, OpenCode skills, and custom in-house skill systems. Excludes authoring a single SKILL.md (skill-scaffold), running this repo's conformance audit (graph-audit), selecting general codebase lint rules (lint-overlay), and reviewing the health-tooling implementation itself (code-review).

**When to use**
- our skill library is growing and we''re getting silent decay — eval counts dropping, conflicts emerging — what tooling should we add?
- two of our skills give opposite instructions for the same function — how do we detect this automatically?
- we keep getting skill-router misses on real user queries — how do we surface and close routing gaps?
- design a health-check pipeline for a 200-skill library that runs in CI
- what''s a reasonable minimum eval count per skill, and how do we enforce it?
- which checker should own relation-target existence — lint, or a separate graph-integrity gate?
- what should fail release if an application verdict has no application.json behind it?
- our public skills export differs from the canonical source — what parity checks do we need?
- a newer vendor skill API exists now — did it make our skill-graph tooling obsolete?
- we want to import community skills — what safety/supply-chain scan should gate them before they enter the corpus?
- our skill mirror in `.claude/skills` keeps drifting from the source — what''s the parity check?

**Not for**
- scaffold a new SKILL.md for our team''s deploy procedure
- audit this Skill Graph repo for schema conformance and dangling relation targets
- the manifest sample drifted from the generator — find the mismatch
- improve this prompt''s wording to get better outputs
- review this AI-generated PR for correctness
- review this PR that changes scripts/skill-lint.js
- set up ESLint for our TypeScript repo
- draft an architecture note explaining why we chose Postgres
- write documentation explaining the protocol to humans

**Related skills**
- Verify with: `testing-strategy`, `code-review`, `graph-audit`
- Related: `lint-overlay`, `skill-scaffold`, `graph-audit`, `testing-strategy`, `project-knowledge-extraction`

**Grounding**
- Mode: `hybrid`
- Truth sources: `package.json`, `bin/skill-graph.js`, `scripts/skill-lint.js`, `scripts/lib/roots.js`, `scripts/check-schema-constants.js`, `scripts/check-protocol-consistency.js`, `scripts/generate-manifest.js`, `scripts/check-manifest-freshness.js`, `scripts/check-audit-manifest.js`, `scripts/check-application-evals.js`, `lib/audit/eval-staleness-checker.js`, `scripts/skill-audit-preflight.js`, `scripts/skill-graph-drift.js`, `scripts/skill-overlap.js`, `scripts/skill-graph-routing-eval.js`, `scripts/export-marketplace-skills.js`, `scripts/verify-skill-md-export.js`, `docs/manifest-field-mapping.md`, `docs/verdict-semantics.md`, `SKILL_GRAPH.md`, `skill-audit-loop/SKILL_AUDIT_LOOP.md`

**Keywords**
- `skill library health`, `skill system tooling`, `skill library decay`, `skill overlap detection`, `frontmatter validation`, `routing health`, `drift sentinel`, `checker ownership`, `audit artifact integrity`, `skill supply-chain scan`

<!-- skill-graph-context:end -->
