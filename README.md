# Skill Metadata Protocol + Skill Graph

[![Version 0.5.0](https://img.shields.io/badge/version-0.5.0-blue?style=flat-square)](CHANGELOG.md) [![Schema v3](https://img.shields.io/badge/schema-v3-blueviolet?style=flat-square)](schemas/skill.v3.schema.json) [![License Apache-2.0 + CC-BY-4.0](https://img.shields.io/badge/license-Apache--2.0%20%2B%20CC--BY--4.0-green?style=flat-square)](LICENSE) [![Exports SKILL.md](https://img.shields.io/badge/exports-SKILL.md-orange?style=flat-square)](https://agentskills.io/specification)

**Skills that know your project and codebase. Structured and categorized.**

**Skill Metadata Protocol is a structured frontmatter contract for `SKILL.md`. Skill Graph is the local library tooling that works across those structured skills.**

A plain `SKILL.md` gives an agent a procedure to load. Skill Metadata Protocol adds the missing project map: what the skill is for, where it belongs, which files or domains ground it, which skills it depends on, which nearby skills it must not replace, and how it should be checked. Skill Graph turns those declarations into a manifest, router, cluster map, drift sentinel, audit loop, and export path back to the plain `SKILL.md` format.

[Protocol spec](SKILL_METADATA_PROTOCOL.md) | [Skill Graph system](SKILL_GRAPH.md) | [Full template](examples/skill-metadata-template.md) | [Primer](docs/PRIMER.md) | [Field reference](docs/field-reference.md) | [Adoption guide](docs/ADOPTION.md) | [Conformance](docs/CONFORMANCE.md)

## How SKILL.md, Skill Metadata Protocol, and Skill Graph Differ

| Layer | Job | Concrete output |
|---|---|---|
| **SKILL.md format** | Portable skill packaging. | A folder with `SKILL.md`, optional `scripts/`, `references/`, and `assets/`. |
| **Skill Metadata Protocol** | The per-skill relevance contract. | YAML frontmatter that declares identity, scope, taxonomy, activation signals, relations, grounding, eval state, and portability. |
| **Skill Graph** | The library-level system around the protocol. | Lint, manifest generation, routing, clustering, overlap checks, drift checks, audits, evals, and `SKILL.md` export. |

The distinction matters. The `SKILL.md` format answers "what can this skill do?" Skill Metadata Protocol answers "what is this skill relevant for, where does it belong, and what makes it trustworthy?" Skill Graph answers "how do we operate across a whole library of those declarations?"

## Why More Structured Skills Help

The plain `SKILL.md` format only needs `name` and `description` for the smallest useful skill. That is enough for small libraries. It breaks down when a project has many skills, overlapping domains, multiple workspaces, stale codebase assumptions, or a team that needs to audit why a skill was loaded.

Skill Metadata Protocol makes these questions explicit:

| Question | Protocol fields |
|---|---|
| What kind of skill is this? | `type`, `scope`, `version`, `owner` |
| Where does it belong? | `browse_category`, `category`, `project_tags`, `routing_groups` |
| When should it load? | `description`, `keywords`, `triggers`, `examples`, `anti_examples`, `paths` |
| What is it near, dependent on, or not responsible for? | `relations.related`, `relations.depends_on`, `relations.verify_with`, `relations.boundary`, `relations.broader`, `relations.narrower` |
| What evidence makes it true? | `grounding.truth_sources`, `grounding.failure_modes`, `grounding.evidence_priority` |
| Is it current and tested? | `freshness`, `drift_check`, `eval_artifacts`, `eval_state`, `routing_eval`, `eval_last_run`, `lifecycle` |
| Can it move to another runtime? | `portability`, `compatibility`, `allowed-tools` |

Once those fields exist, a skill library stops being a flat folder of Markdown files. It becomes a map of project knowledge that humans can browse and agents can route through.

## Skill Metadata Protocol

This is a compact example. The full authoring scaffold is [`examples/skill-metadata-template.md`](examples/skill-metadata-template.md).

```yaml
---
schema_version: 3
name: product-page-ux-review
description: "Use when reviewing a product page's UX, visual hierarchy, interaction patterns, accessibility, and conversion-critical content. Do NOT use for backend Shopify API work, production incident debugging, or general copy editing outside the product-page experience."
version: 1.0.0
type: capability
browse_category: design
category: design/ux
scope: codebase
owner: design-platform
freshness: "2026-05-13"
drift_check:
  last_verified: "2026-05-13"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
keywords:
  - product page UX
  - visual hierarchy
  - Shopify product detail page
  - conversion friction
  - dark mode review
examples:
  - "Review this Shopify product page for UX problems before launch."
  - "Map which design skills should be loaded for a dark-mode PDP redesign."
anti_examples:
  - "Fix the Shopify webhook signature validation failure."
  - "Diagnose why the checkout build failed in CI."
project_tags:
  - ecommerce
  - shopify
  - frontend
routing_groups:
  - product-experience
paths:
  - app/products/**/*
  - components/product/**/*
relations:
  related:
    - visual-hierarchy
    - color-system-design
    - typography-system
    - dark-mode-implementation
  boundary:
    - skill: shopify
      reason: "shopify owns API, integration, and platform behavior; this skill owns product-page UX review"
    - skill: debugging
      reason: "debugging owns concrete runtime failures; this skill owns pre-release design review"
  verify_with:
    - a11y
    - usability-testing
grounding:
  domain_object: Shopify product page UX surface
  grounding_mode: repo_specific
  truth_sources:
    - path: app/products/[handle]/page.tsx
    - path: components/product/ProductGallery.tsx
  failure_modes:
    - visual_hierarchy_unclear
    - color_contrast_regression
    - interaction_feedback_missing
  evidence_priority: repo_code_first
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---
```

The protocol is the contract. The template is just the easiest way to author the contract correctly.

## Library Axes

Skill Metadata Protocol uses several independent axes. They should not be collapsed into one taxonomy.

| Axis | Field | Cardinality | Use |
|---|---|---:|---|
| **Archetype** | `type` | one | Skill shape: `capability`, `workflow`, `router`, or `overlay`. |
| **Scope** | `scope` | one | Where it applies: `portable`, `codebase`, or `reference`. |
| **Top-level category** | `browse_category` | one | Flat top-level shelf for browsing. The explicit field name avoids colliding with the hierarchical `category` path. |
| **Domain path** | `category` | zero or one | Slash-delimited hierarchy, such as `design/ux` or `architecture/events`. |
| **Project group** | `project_tags` | many | Which project families, workspaces, or product areas this skill applies to. |
| **Routing group** | `routing_groups` | many | Runtime bundles or dispatch groups. |
| **Relations** | `relations.*` | many | Typed graph edges between skills. |
| **Grounding** | `grounding.*` | conditional | Truth sources and failure modes for repo-grounded skills. |

The schema uses `browse_category` for the flat top-level category and `category` for the hierarchical path. Adopters can choose their own values for `browse_category`, `category`, `project_tags`, and `routing_groups`. This repo currently demonstrates the following values.

### Current Top-Level Categories

These are the current `browse_category` values across the shipped skills and specimen skills. The field stays explicit because `category` is already used for slash-delimited domain paths:

`content`, `design`, `engineering`, `frontend`, `integrations`, `knowledge`, `quality`, `security`

### Current Domain Paths

| Domain root | Current `category` paths |
|---|---|
| `ai-engineering` | `ai-engineering/analysis`, `ai-engineering/architecture`, `ai-engineering/concepts`, `ai-engineering/context`, `ai-engineering/evaluation`, `ai-engineering/knowledge`, `ai-engineering/knowledge-extraction`, `ai-engineering/knowledge-representation`, `ai-engineering/language`, `ai-engineering/prompts`, `ai-engineering/safety`, `ai-engineering/strategy`, `ai-engineering/tool-use` |
| `architecture` | `architecture/contracts`, `architecture/decision-records`, `architecture/dependencies`, `architecture/domain-boundaries`, `architecture/domain-discovery`, `architecture/events`, `architecture/technology-selection` |
| `content` | `content/build/images`, `content/maintenance`, `content/markdown/frontmatter`, `content/migrations`, `content/routing` |
| `data` | `data/migrations`, `data/modeling` |
| `design` | `design/information-architecture`, `design/interaction`, `design/ux`, `design/visual` |
| `engineering` | `engineering/api-design`, `engineering/debugging`, `engineering/observability`, `engineering/performance`, `engineering/quality`, `engineering/version-control` |
| `frontend` | `frontend/design-system`, `frontend/layout` |
| `integrations` | `integrations/webhooks` |
| `modeling` | `modeling/conceptual`, `modeling/ontology`, `modeling/state-machines`, `modeling/taxonomy` |
| `skill-system` | `skill-system/authoring`, `skill-system/health` |

### Current Project And Routing Groups

`project_tags` demonstrated in this repo:

`build-pipeline`, `content`, `markdown`, `migrations`, `skill-authoring`, `static-site`

`routing_groups` demonstrated in this repo:

`quality`

Downstream projects should add their own tags: `shopify`, `checkout`, `billing`, `design-system`, `docs-site`, `mobile`, `b2b-saas`, `healthcare`, and so on. Tags are not a global ontology. They are routing and maintenance handles for your workspace.

## Skill Clusters And Triangulation

The main payoff is not the YAML. The payoff is that a project can load the right cluster of skills for a real task.

Triangulation means selecting skills from multiple independent signals:

| Signal | Example |
|---|---|
| **Project surface** | `project_tags: [shopify, frontend]`, `paths: components/product/**/*` |
| **Top-level and domain category** | `browse_category: design`, `category: design/ux` |
| **Method or phase** | `design-thinking`, `user-research`, `ideation`, `prototyping`, `usability-testing` |
| **Related skills** | `visual-hierarchy`, `color-system-design`, `typography-system`, `dark-mode-implementation` |
| **Verification skills** | `a11y`, `testing-strategy`, `code-review` |
| **Negative boundaries** | `shopify` for API work, `debugging` for runtime failures |

For a UX designer working on a Shopify product page, Skill Graph can form a cluster like this:

| Design phase | Skills to load |
|---|---|
| **Empathize** | `user-research`, `task-analysis`, `journey-mapping` |
| **Define** | `problem-framing`, `information-architecture`, `research-synthesis` |
| **Ideate** | `ideation`, `visual-design-foundations`, `interaction-patterns` |
| **Prototype** | `prototyping`, `layout-composition`, `design-module-composition`, `color-system-design`, `typography-system`, `dark-mode-implementation` |
| **Test** | `usability-testing`, `a11y`, `interaction-feedback` |
| **Project-specific context** | `shopify`, `frontend-architecture`, `design-system-architecture` |

That is the difference between asking an agent to "use the UX skill" and giving it a structured project map: what area is being changed, which design phase the work is in, which sibling skills should co-load, and which nearby skills should not take over.

## Skill Audit Loop

The Skill Audit Loop adapts two useful patterns:

- From [Karpathy's `autoresearch`](https://github.com/karpathy/autoresearch): a tight loop with a constrained action surface, a fixed experiment, a measurable result, and keep-or-revert pressure.
- From [Stanford d.school design thinking](https://dschool.stanford.edu/resources/design-thinking-bootleg) and [IDEO's design thinking framing](https://designthinking.ideo.com/faq/isnt-design-thinking-a-set-step-by-step-process): human-centered iteration through discovery, framing, ideation, prototyping, testing, and loop-back when evidence changes the problem.

For skills, the loop is:

1. Pick a skill or project area.
2. Gather evidence: the `SKILL.md`, eval files, manifest entry, related skills, and `grounding.truth_sources`.
3. Run deterministic checks first: schema lint, relation integrity, manifest validation, routing evals, overlap checks, and drift checks.
4. Audit the skill as a contract: activation, boundaries, taxonomy, grounding, examples, anti-examples, and verification partners.
5. Fix the skill or its metadata when the evidence supports the change.
6. Re-run checks and record the new state.
7. Move to the next skill or loop back if the fix changed the graph.

This is not "self-improving skills" as a slogan. It is a maintenance loop with evidence, constraints, and repeatable checks.

## Quick Start

Install the CLI from npm:

```bash
npm install --global @skill-graph/cli
skill-graph --help
```

For a source checkout, run the three commands that prove the protocol is operational:

```bash
# Validate one skill against the schema and lint rules.
node scripts/skill-lint.js skills/documentation

# Route a real request and print why each skill was selected, co-loaded, or excluded.
node scripts/skill-graph-route.js "audit my skills for schema conformance"

# Check grounded skills against recorded truth-source hashes.
node scripts/skill-graph-drift.js
```

The npm package exposes the same scripts through a `skill-graph` binary:

```bash
skill-graph lint skills/documentation
skill-graph route "which skill handles schema drift?"
skill-graph drift
```

## What You Get

| Tool | Purpose |
|---|---|
| `scripts/skill-lint.js` | Per-skill schema validation, relation target checks, eval coherence, required body sections, routing-quality checks. |
| `scripts/check-protocol-consistency.js` | Cross-artifact checks so schemas, docs, generated field references, and sample manifests stay aligned. |
| `scripts/generate-manifest.js` | Compiles all skills into a deterministic manifest for routing and downstream tooling. |
| `scripts/skill-graph-route.js` | Reference router that explains selected, co-loaded, and excluded skills. |
| `scripts/skill-graph-routing-eval.js` | Checks `examples` and `anti_examples` against router behavior. |
| `scripts/skill-graph-drift.js` | Hashes `grounding.truth_sources` and reports drift, broken sources, stale skills, or missing baselines. |
| `scripts/skill-overlap.js` | Finds overlapping skill ownership and routing ambiguity. |
| `scripts/skill-audit.js` | Generates audit artifacts and optional graded review prompts. |
| `scripts/export-skill.js` | Exports protocol-enriched skills back to plain `SKILL.md` shape. |

## Repository Map

| Path | Purpose |
|---|---|
| [`SKILL_METADATA_PROTOCOL.md`](SKILL_METADATA_PROTOCOL.md) | Normative protocol contract. |
| [`SKILL_GRAPH.md`](SKILL_GRAPH.md) | Library-level system model and authority tiers. |
| [`SKILL_AUDIT_LOOP.md`](SKILL_AUDIT_LOOP.md) | Repeatable audit workflow. |
| [`schemas/`](schemas/) | Skill and manifest JSON Schemas, including pinned v2 and v3 copies. |
| [`skills/`](skills/) | Starter skill library demonstrating the protocol. |
| [`examples/skill-metadata-template.md`](examples/skill-metadata-template.md) | Copyable authoring template. |
| [`examples/projects/markdown-static-site/`](examples/projects/markdown-static-site/) | Specimen project showing codebase-grounded skills. |
| [`docs/field-reference.md`](docs/field-reference.md) | Field-by-field reference. |
| [`docs/field-decision-guide.md`](docs/field-decision-guide.md) | Decision tables for hard field choices. |
| [`docs/SKILL-MD-FORMAT-COMPATIBILITY.md`](docs/SKILL-MD-FORMAT-COMPATIBILITY.md) | How export maps protocol-enriched skills back to plain `SKILL.md`. |

## What This Is Not

Skill Graph is not:

- a hosted skill marketplace
- an agent runtime
- persistent agent memory
- a replacement for `AGENTS.md` or `CLAUDE.md`
- a prompt library
- a guarantee that every skill is correct

It is a structured protocol and reference toolchain for making skills easier to route, cluster, verify, maintain, and port.

## External Context

Skill Metadata Protocol is designed to sit next to existing agent-context conventions, not replace them:

- [SKILL.md format reference](https://agentskills.io/specification) describes the portable base skill layout used by multiple agent runtimes.
- [AGENTS.md](https://agents.md/) and [Codex AGENTS.md docs](https://developers.openai.com/codex/guides/agents-md) define always-on repository instructions.
- [Claude Code memory docs](https://code.claude.com/docs/en/memory) document one memory model for persistent context.
- [Model Context Protocol](https://github.com/modelcontextprotocol/modelcontextprotocol) and [OpenTelemetry Specification](https://github.com/open-telemetry/opentelemetry-specification) are useful examples of protocol-first repos that separate spec, schema, docs, and reference tooling.
- The project framing was also discussed in [GitHub Discussion #1](https://github.com/jacob-balslev/skill-graph/discussions/1) and the linked [Bluesky thread](https://bsky.app/profile/did:plc:dydxbat6yyyhjfaln22sx66t/post/3mln2lefdi22u).

## Status

Latest release checkpoint: **0.5.0 (2026-05-13)**. The current contract is `schema_version: 3`.

Code is licensed under Apache-2.0. Skill content and documentation are licensed under CC-BY-4.0 where noted. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
