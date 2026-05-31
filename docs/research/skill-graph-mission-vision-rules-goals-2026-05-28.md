# Skill Graph Mission, Vision, Rules, and Goals Report

> **SUPERSEDED (point-in-time research artifact).** The Mission/Vision/Rules/Goals
> defined here have been promoted to the canonical docs and now live there:
> shared **Mission & Vision** in [`AGENTS.md § Mission and Vision`](../../AGENTS.md#mission-and-vision);
> per-layer **Rules & Goal** in each owning doc's "Charter — Rules & Goal" section
> ([`SKILL_METADATA_PROTOCOL.md`](../../skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md#charter--rules--goal),
> [`SKILL_AUDIT_LOOP.md`](../../skill-audit-loop/SKILL_AUDIT_LOOP.md#charter--rules--goal),
> [`SKILL_GRAPH.md`](../../SKILL_GRAPH.md#charter--rules--goal)).
> Read the canonical docs for current guidance. This file is retained as the
> dated research input and a record of the freshness findings it surfaced.

Date: 2026-05-28

Mode: SYSTEM work. This report concerns protocol, graph, audit-loop, documentation, and tooling clarity. It does not edit individual `SKILL.md` files or per-skill audit artifacts.

## Purpose

This report turns the current Skill Graph project state into plain operating language for agents. It defines a Mission, Vision, Rules, and Goal for each of the three project layers:

1. Skill Metadata Protocol
2. Skill Audit Loop
3. Skill Graph

It also records documentation and tooling freshness findings discovered while reading the root instructions, the Skill Graph project instructions, the canonical docs, schemas, examples, and implementation surfaces.

## Evidence Base

Primary instructions read:

- `CLAUDE.md`
- `AGENTS.md`
- `SKILL-SYSTEM-CHEAT-SHEET.md`
- `skill-graph/CLAUDE.md`
- `skill-graph/AGENTS.md`

Primary Skill Graph sources read:

- `SKILL_METADATA_PROTOCOL.md`
- `SKILL_GRAPH.md`
- `SKILL_AUDIT_LOOP.md`
- `README.md`
- `CHANGELOG.md`
- `schemas/SKILL_METADATA_PROTOCOL_schema.json`
- `schemas/manifest.schema.json`
- `docs/SKILL_METADATA_PROTOCOL_field-reference.md`
- `docs/field-decision-guide.md`
- `docs/field-state-matrix.md`
- `docs/manifest-field-mapping.md`
- `docs/skill-metadata-protocol.md`
- `docs/verdict-semantics.md`
- `docs/PRIMER.md`
- `docs/positioning.md`
- `docs/quality-doctrine.md`
- ADRs 0009, 0011, 0017, and 0018

Implementation surfaces inspected:

- `bin/skill-graph.js`
- `scripts/generate-manifest.js`
- `scripts/skill-graph-route.js`
- `scripts/skill-lint.js`
- `scripts/check-protocol-consistency.js`
- `scripts/check-doc-drift.js`
- `scripts/check-schema-constants.js`
- `scripts/export-skill.js`
- `scripts/export-marketplace-skills.js`
- `lib/audit/evaluate-skill.js`
- `lib/audit/skill-audit.js`
- `lib/audit/skill-evolution-loop.js`
- `lib/audit/run-skill-improvement-loop.js`
- `lib/audit-shared/skill-frontmatter.js`

Inventory scan:

- 270 Markdown, JavaScript, and JSON files were inventoried with generated `marketplace/skills/**`, `node_modules/**`, and `.opencode/**` excluded.
- The project has about 22,900 lines of system JavaScript across `bin/`, `scripts/`, and `lib/`.

## Current Contract Snapshot

The binding machine contract is `schemas/SKILL_METADATA_PROTOCOL_schema.json`. As of this report:

- Required top-level fields are `schema_version`, `name`, `description`, `version`, `subject`, `deployment_target`, `scope`, `owner`, `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, and `routing_eval`.
- `subject` is a closed 9-value enum: `agent-ops`, `code-engineering`, `frontend-ui`, `design-craft`, `data-analytics`, `quality-assurance`, `meta-methods`, `knowledge-organization`, `product-domain`.
- `deployment_target` is a closed 2-value enum: `portable`, `project`.
- `scope` is a required free-text string. It is not the deployment targeting enum.
- `deployment_target: project` requires `grounding`.
- `grounding.subject_matter` is the current grounding field. `grounding.domain_object` is historical.
- `manifest.schema.json` summarizes by `by_deployment_target`, not `by_scope`.

The current contract is clearest in `SKILL_METADATA_PROTOCOL.md`, `schemas/SKILL_METADATA_PROTOCOL_schema.json`, `schemas/manifest.schema.json`, `docs/SKILL_METADATA_PROTOCOL_field-reference.md`, and `examples/skill-metadata-template.md`.

## Skill Metadata Protocol

### Mission

The Skill Metadata Protocol turns a simple `SKILL.md` file from a title/name, description, and body into a reliable contract for agents. It makes each skill explicit about what it teaches, where it applies, what codebase or external sources ground it, when it should activate, what it should not own, and how it relates to nearby skills.

The protocol exists so agents do not have to guess from prose alone. It gives routers, validators, auditors, and humans enough structured information to decide whether a skill is relevant to the current project, codebase, task, and workflow.

### Vision

The vision is a portable `SKILL.md` structure that stays readable by humans, works across agent runtimes, exports back to plain Agent Skills format, and still carries enough metadata to support project-aware routing, graph traversal, drift checks, audit evidence, and behavioral evaluation.

The ideal skill file reads like a teachable lesson and behaves like a typed interface. It should be clear enough for a cold-start agent to load the right skill at the right time, avoid the wrong neighboring skill, and understand which evidence sources must be checked before trusting the content.

### Rules

1. The schema is the binding machine contract. If prose and `schemas/SKILL_METADATA_PROTOCOL_schema.json` disagree, the schema wins and the prose must be corrected.
2. A current authored skill must use `subject`, `deployment_target`, and `scope` as required classification fields.
3. `scope` is a required free-text statement of deployment scope and boundaries. It must not be described as `portable`, `workspace`, or `project`.
4. `deployment_target` is the deployment targeting enum. It has exactly two current values: `portable` and `project`.
5. Project-specific skills must declare grounding. In the current schema, `deployment_target: project` requires `grounding`.
6. Use `grounding.subject_matter`, not `grounding.domain_object`, in current guidance and examples.
7. Use `taxonomy_domain`, not top-level `domain`, for a hierarchical sub-path within a subject.
8. Use `project[]` and `repo[]` for belonging-entity references. Do not revive `workspace_tags` as current authoring guidance.
9. The canonical library uses the nested Agent Skills-compatible encoding. The protocol normalizer reconciles the flat and nested encodings.
10. `relations.boundary` means "exclude this neighboring skill from co-routing when this skill wins." Reason text must describe ownership, not deference.
11. Version labels are earned by content. Do not bump `schema_version` or any `vN` label unless the substantive migration represented by that label is actually present.
12. Audit Status fields are owned by the audit and evaluation tooling. Humans should not hand-stamp `application_verdict: APPLICABLE` or equivalent proof fields without an eval receipt.
13. Public exports must not leak repo-private paths, project secrets, PII, or internal-only doctrine.

### Goal

The goal of the Skill Metadata Protocol is to become the default open-source structure for project-relevant AI agent skills: simple enough to author, strict enough to validate, and expressive enough to make `SKILL.md` files useful for real codebases rather than just generic prompt snippets.

Near-term goals:

1. Finish the v8 documentation sweep so every current guide describes `deployment_target`, `taxonomy_domain`, `project[]`, `repo[]`, and `grounding.subject_matter`.
2. Keep `SKILL_METADATA_PROTOCOL.md`, `schemas/SKILL_METADATA_PROTOCOL_schema.json`, `schemas/manifest.schema.json`, and `docs/SKILL_METADATA_PROTOCOL_field-reference.md` in exact agreement.
3. Regenerate or repair sample manifests and examples so protocol checks pass.
4. Keep the public skill shape compatible with standard Agent Skills while preserving richer local metadata for routing and audit.

## Skill Audit Loop

### Mission

The Skill Audit Loop answers one question for every skill: does this skill still teach an agent to do what it claims to teach?

It does that by researching the skill in the live codebase and, when the subject depends on changing external systems, against official online sources; verifying claims; improving the skill; evaluating the result; and then using the skill only with honest evidence about what has and has not been proven.

### Vision

The vision is a disciplined improvement system for skill libraries, inspired by Karpathy-style keep-or-revert loops and Design Thinking's insistence on understanding the problem before changing the artifact.

The loop should let a library improve without becoming arbitrary churn. Each skill moves through evidence collection, targeted improvement, measurable evaluation, and explicit status. A good skill can pass with no findings. A weak skill gets concrete findings. A useful skill earns behavioral certification only after an application eval shows that loading it changes agent behavior on realistic work.

### Rules

1. The loop shape is `read -> fix -> test -> next`.
2. `audit`, `improve`, `evaluate`, and `evolve` are the four per-skill operations.
3. `discover` and `merge` are utilities, not replacements for the per-skill loop.
4. Content work on individual skills runs through `/audit:audit`, `/audit:improve`, `/audit:evaluate`, or `/audit:evolve`.
5. SYSTEM work and CONTENT work must not be mixed in the same task or commit.
6. Audit findings must be evidence-backed. Do not invent lint rules or findings to make an audit look productive.
7. Lint is a floor, not the quality bar. Structural validity does not prove usefulness.
8. The Integrity Gate checks whether the skill is structurally valid, grounded, routable, and export-safe.
9. The Behavior Gate checks whether the skill changes agent behavior in the intended way.
10. `application_verdict` is the primary quality signal.
11. `application_verdict: UNVERIFIED` is honest when no application eval has run. It is not a defect by itself.
12. `application_verdict: APPLICABLE` requires an eval receipt. Do not stamp it from intuition or a single optimistic read.
13. External framework, API, platform, product, or library claims must be checked against official or primary online sources during an audit when those claims could have changed.
14. A displacement finding recommends deprecating, folding, or reframing a skill. It must not automatically delete or gut the skill.
15. Every finding produced by an audit must be preserved in the report. Prioritization is allowed after complete reporting, but dropping findings is not.

### Goal

The goal of the Skill Audit Loop is to make the skill library self-correcting without making it careless: every skill should carry an honest status about structure, truth, comprehension, and application, and every improvement should be kept only when evidence says it made the skill better.

Near-term goals:

1. Complete the first corpus-wide Integrity Gate sweep under the current schema.
2. Expand comprehension and application eval artifacts so Behavior Gate coverage becomes real rather than sparse.
3. Wire at least one application grader into CI before treating `APPLICABLE` as a routine corpus status.
4. Keep audit reports complete, with all findings preserved and all status changes backed by evidence.
5. Use official online sources during audits for external claims that can drift.

## Skill Graph

### Mission

Skill Graph is the organized library system around the Skill Metadata Protocol and the Skill Audit Loop. It operates over many skills as one coherent library: compiling manifests, validating metadata, routing queries, walking relations, checking drift, detecting overlap, tracking audit status, and exporting safe public `SKILL.md` files.

It exists because a folder of hundreds of skills cannot scale if every agent has to infer relevance from names and descriptions alone. Skill Graph turns skills into a navigable graph of teachable capabilities.

### Vision

The vision is an agent capability library that feels like structured learning rather than a flat pile of files. The user's Matrix kung-fu analogy maps well: the point is not magic upload, but reliable capability loading. The right skill should become available in the right context, with clear boundaries, evidence, and neighbors.

A mature Skill Graph should also feel like the best parts of learning platforms: browseable categories, clear scope, prerequisites, related lessons, currency signals, evaluation, and ongoing maintenance. The agent-facing result is not a course catalog for humans; it is a structured, audited capability graph for agentic workflow.

### Rules

1. Skill Graph is build-time and authoring-time tooling. It is not an agent runtime, hosted marketplace, or memory system.
2. The five authority tiers are schema, explanation docs, enforcement/transformation tooling, consumer tooling, and specimens. Higher tiers win over lower tiers.
3. `SKILL_METADATA_PROTOCOL.md` owns normative protocol language.
4. `SKILL_GRAPH.md` owns library-level architecture and live current-state facts.
5. `SKILL_AUDIT_LOOP.md` owns audit-loop procedure and quality gates.
6. Generated files must not be hand-edited when a generator owns them.
7. Source skills live in the canonical skills library. `marketplace/skills/` is generated staging output, not the source of truth.
8. Public release output must exclude project-private, repo-specific, secret-bearing, or GDPR-sensitive content.
9. Routing should use the current fields: `subject`, `deployment_target`, `taxonomy_domain`, `project[]`, `repo[]`, activation fields, relations, grounding, and eval status.
10. Legacy terms such as top-level `domain`, `workspace_tags`, `scope: workspace`, and `scope: project` must not appear as current authoring guidance unless clearly marked historical.
11. The library should preserve useful domain intelligence during refactors. Compression is allowed only when it does not drop behaviorally important information.
12. Documentation must route concepts to their owning file rather than duplicating stale summaries across many places.

### Goal

The goal of Skill Graph is to make large AI-agent skill libraries coherent, project-aware, auditable, and exportable. It should let agents and humans answer: which skill applies, why it applies, what evidence grounds it, which skills are related, which skills should not co-route, and whether the skill has actually been proven useful.

Near-term goals:

1. Align docs, examples, tests, and schema-constant checks with the current v8 clean-cut contract.
2. Repair sample manifests so `protocol:check` and manifest validation pass.
3. Make `SKILL_GRAPH.md`, `AGENTS.md`, `README.md`, and onboarding docs say the same current facts.
4. Keep router, manifest compiler, export pipeline, drift sentinel, and audit loop focused on current fields instead of historical compatibility comments.
5. Keep the public source/release path safe so generated exports never expose internal project content.

## Documentation And Tooling Freshness Findings

1. `SKILL_GRAPH.md:17` says the required schema axes are `subject + scope`. Current schema requires `subject + deployment_target`.
2. `SKILL_GRAPH.md:20` lists manifest summary facets as `by_subject`, `by_scope`, `by_schema_version`, `by_stability`, and `by_project`. Current manifest schema uses `by_deployment_target`, not `by_scope`.
3. `SKILL_GRAPH.md:23`, `SKILL_GRAPH.md:56`, and `SKILL_GRAPH.md:402` describe publication or fixture behavior in terms of `scope: project`. Current guidance should use `deployment_target: project`.
4. `SKILL_GRAPH.md:142` says the field decision guide covers `scope` and `workspace_tags`; those are not the current authoring axes.
5. `SKILL_GRAPH.md:232` says the router uses `workspace_tags` filtering. Current `scripts/skill-graph-route.js` uses `project[]` and `deployment_target` in the implementation, although comments still mention removed `workspace_tags`.
6. `skill-graph/AGENTS.md:191` says two skills are the same kind when they share a `subject x scope` pair. Current model should reference `subject`, `deployment_target`, and a clear head noun or domain description.
7. `skill-graph/AGENTS.md:204` describes `scope` as a three-value deployment targeting enum. Current schema makes `deployment_target` the enum and `scope` a free-text string.
8. `skill-graph/AGENTS.md:478`, `skill-graph/AGENTS.md:499`, and `skill-graph/AGENTS.md:700` still describe grounding and public export gating in terms of `scope: project`, `scope: workspace`, or legacy scope values. Current wording should use `deployment_target: project` plus grounding and publication classification.
9. `README.md:102`, `README.md:123`, `README.md:144`, `README.md:200`, `README.md:203`, `README.md:230`, and `README.md:248` still teach `domain`, `workspace_tags`, and `scope: project` as current authoring concepts.
10. `docs/PRIMER.md:19`, `docs/PRIMER.md:98`, `docs/PRIMER.md:112`, `docs/PRIMER.md:130`, `docs/PRIMER.md:181`, `docs/PRIMER.md:198`, `docs/PRIMER.md:201`, `docs/PRIMER.md:211`, `docs/PRIMER.md:221`, `docs/PRIMER.md:223`, `docs/PRIMER.md:236`, and `docs/PRIMER.md:239` still describe the older `workspace_tags`, top-level `domain`, and enum-style `scope` model.
11. `docs/skill-metadata-protocol.md:9` says the current v8 contract uses `subject` and `scope` as required axes. Current schema requires `subject` and `deployment_target`.
12. `docs/skill-metadata-protocol.md:32`, `docs/skill-metadata-protocol.md:90`, `docs/skill-metadata-protocol.md:150`, `docs/skill-metadata-protocol.md:159`, `docs/skill-metadata-protocol.md:294`, and `docs/skill-metadata-protocol.md:300` still reference `workspace_tags`, `domain`, `scope: project`, `grounding.domain_object`, or `portable/workspace/project` scope decisions as current guidance.
13. `SKILL_METADATA_PROTOCOL.md` is mostly current, but its example block still has stale comments at `SKILL_METADATA_PROTOCOL.md:107` and `SKILL_METADATA_PROTOCOL.md:114` describing "subject + scope" and a three-value `scope`. Its later contract section correctly describes `deployment_target`.
14. `SKILL_METADATA_PROTOCOL.md:592` still shows `grounding.domain_object` in a shape block, even though the current schema requires `grounding.subject_matter`.
15. `docs/field-decision-guide.md:40`, `docs/field-decision-guide.md:53`, `docs/field-decision-guide.md:56`, `docs/field-decision-guide.md:183`, and `docs/field-decision-guide.md:220-315` still teach the older `scope`, `workspace_tags`, and `domain` decision model.
16. `docs/field-state-matrix.md:18` still says "Required (13 fields, v7 schema gate)".
17. `docs/field-state-matrix.md:73`, `docs/field-state-matrix.md:104`, and `docs/field-state-matrix.md:162` still include `workspace_tags`, `grounding.domain_object`, and summary keys `by_type`, `by_category`, and `by_scope`.
18. `docs/manifest-field-mapping.md:68`, `docs/manifest-field-mapping.md:95`, `docs/manifest-field-mapping.md:123`, `docs/manifest-field-mapping.md:316`, `docs/manifest-field-mapping.md:344`, and `docs/manifest-field-mapping.md:393` still describe removed or renamed fields in current-looking mapping prose.
19. `docs/AUTHORING-QUICKSTART.md:30`, `docs/AUTHORING-QUICKSTART.md:85`, and `docs/AUTHORING-QUICKSTART.md:131` still present v7 or `scope: workspace` guidance.
20. `docs/QUICKSTART-30MIN.md:80`, `docs/QUICKSTART-30MIN.md:91`, and `docs/QUICKSTART-30MIN.md:95` still use `scope: project` and `grounding.domain_object`.
21. `CONTRIBUTING.md:44` still instructs authors to choose `scope` from `portable`, `workspace`, and `project` and says `scope: project` is schema-enforced. Current schema enforces `deployment_target: project` with grounding.
22. `docs/concept-map.md:95`, `docs/concept-map.md:128`, and `docs/concept-map.md:157` still include `workspace_tags` and `grounding.domain_object` as current concept-map entries.
23. `docs/field-rationale.md:21` and `docs/field-rationale.md:207` still explain router behavior around `scope`, `workspace_tags`, and old category terminology.
24. `docs/positioning-vs-marketplaces.md:38` and `docs/positioning-vs-marketplaces.md:159` still position multi-root sharing around `workspace_tags`.
25. `examples/skills.manifest.sample.json` fails the current manifest schema. Repeated failures include missing `deployment_target`, additional top-level `domain`, additional `workspace_tags`, additional `grounding.domain_object`, missing `grounding.subject_matter`, and additional `summary.by_scope`.
26. `examples/protocol/skills.manifest.sample.json` also contains historical manifest fields such as `domain_object`, `workspace_tags`, `by_category`, and `by_type`.
27. `examples/projects/markdown-static-site/**/SKILL.md` example skills still include `workspace_tags` and `grounding.domain_object`.
28. `examples/projects/saas-stripe-postgres/**/SKILL.md` example skills still include `grounding.domain_object`.
29. `examples/fixture-skills/with-grounding/SKILL.md` still describes the old grounding contract and `scope: codebase`.
30. `schemas/vocabulary/workspace_tags.json` still exists and describes a removed field. It should either be archived, renamed for historical compatibility, or clearly marked non-current.
31. `scripts/backfill-field-purpose-comments.js:110`, `scripts/backfill-field-purpose-comments.js:180`, `scripts/backfill-field-purpose-comments.js:195`, and `scripts/backfill-field-purpose-comments.js:283` still carry comments for removed or renamed fields, including a comment that says "subject + scope".
32. `scripts/skill-lint.js:195` still comments that v8 classification is "subject + scope" even though the active schema requires `subject + deployment_target`.
33. `scripts/skill-graph-route.js:328` still comments on the removed `workspace_tags` field and workspace semantic-tag mapping.
34. `scripts/export-skill.js:45` still comments that `domain` and `workspace_tags` are authored fields, which is stale under the current schema.
35. `scripts/__tests__/test-v8-schema-compat.js:15`, `scripts/__tests__/test-v8-schema-compat.js:18`, and later cases around `scope: project` still encode older compatibility expectations. These tests need review against the current clean-cut schema.
36. `scripts/check-schema-constants.js` is stale relative to the current schema. Its run expects compatibility enums for `category`, `type`, `operation`, and enum-style `scope`; the current schema intentionally does not expose those enum properties.
37. `docs/category-consumers.md` appears to be historical v5/v3 analysis but is still scanned by the doc drift sentinel and contains many current-looking statements about older fields. It should be archived or clearly labeled as historical if it is not active guidance.
38. `docs/verdict-semantics.md` is substantively current on verdict meaning, but several lines still say "since the v7 schema bump." That may be historically intentional; if not, it should be updated to describe current v8 status.
39. `lib/audit/graders/application-comparative-grader-prompt.md` still calls `application_verdict` the "v7 primary quality signal." That may be historically true but can confuse agents in a v8 project.
40. `skills.manifest.json` in the Skill Graph repo still contains `domain_object` entries. Since generated manifests are consumer-facing evidence, this should be regenerated after the canonical skill corpus is migrated or explicitly documented as content-side debt.

## Verification Results

Commands run from `skill-graph/`:

1. `node bin/skill-graph.js doctor`
   - Result: failed.
   - Passed checks: markdown links, doc drift sentinel, mirror freeze.
   - Failed checks: protocol, schema constants, lint, manifest.
   - Doctor reported 364 protocol errors, 8 of 19 schema-constant checks failing, lint failure, and manifest validation failure.

2. `node scripts/check-protocol-consistency.js`
   - Result: failed.
   - Passing checks: C1 field-set parity, C2 authored-to-generated parity, C3 artifact-root convention, C5 example truth invariants, C7 generated field-reference parity, C8 JSON-LD context coverage.
   - Failing check: C4 sample manifest correctness.
   - The sample manifest failed with 364 schema validation errors. The repeated classes are missing `deployment_target`, additional `domain`, additional `workspace_tags`, missing `grounding.subject_matter`, additional `grounding.domain_object`, and additional `summary.by_scope`.

3. `node scripts/check-doc-drift.js --include-warn`
   - Result: passed with warnings.
   - It scanned 54 active docs against schema v8 and reported 461 warnings.
   - The warnings include stale version phrases and stale current-state claims, including `SKILL_GRAPH.md:17`.

4. `node scripts/check-schema-constants.js`
   - Result: failed.
   - It reported 8 failures out of 19 checks because the checker still expects compatibility enum properties for removed or retired fields.

5. `node scripts/skill-lint.js --help`
   - Result: the script treated the invocation as a lint run and failed.
   - It checked 155 files and reported 823 errors plus 155 warnings.
   - The failures are CONTENT-mode corpus debt: missing `deployment_target`, removed fields such as `type`, `operation`, `category`, and `domain`, missing `grounding.subject_matter`, additional `grounding.domain_object`, missing inline field-purpose comments, and boundary reason wording in at least one skill.

## Recommended Update Order

1. Fix current-state docs first: `SKILL_GRAPH.md`, `skill-graph/AGENTS.md`, `README.md`, and `docs/PRIMER.md`.
2. Fix protocol authoring docs next: `docs/skill-metadata-protocol.md`, `docs/field-decision-guide.md`, `docs/field-state-matrix.md`, `docs/manifest-field-mapping.md`, `docs/AUTHORING-QUICKSTART.md`, and `docs/QUICKSTART-30MIN.md`.
3. Regenerate or repair sample manifests and example skills under `examples/` so `check-protocol-consistency.js` no longer fails C4.
4. Update stale code comments and test expectations in `scripts/backfill-field-purpose-comments.js`, `scripts/skill-lint.js`, `scripts/skill-graph-route.js`, `scripts/export-skill.js`, and `scripts/__tests__/test-v8-schema-compat.js`.
5. Decide whether historical docs such as `docs/category-consumers.md` should remain active, move to `docs/_archived/`, or receive an explicit historical banner.
6. Treat the 155 skill-lint failures as CONTENT-mode work. They should be drained through the audit loop, one skill at a time or through the sanctioned `/audit:evolve` flow, not patched inside a SYSTEM documentation change.

## Bottom Line

The project has a strong current center: the schema, main protocol doc, field reference, audit-loop doctrine, manifest compiler, and route implementation mostly agree on the post-2026-05-27 model. The main freshness problem is that several onboarding docs, examples, generated samples, comments, and tests still teach older `scope`/`domain`/`workspace_tags` vocabulary as if it were current.

The clearest agent-facing framing is:

- Skill Metadata Protocol: the structure inside each `SKILL.md`.
- Skill Audit Loop: the evidence-driven process for checking and improving each skill.
- Skill Graph: the organized library system that routes, validates, audits, relates, and exports the skills.

Those three layers should stay separate in wording, ownership, and commits. Together they describe a credible open-source path from simple skill files to a project-aware, auditable, teachable agent capability library.
