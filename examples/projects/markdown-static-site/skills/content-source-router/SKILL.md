---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: content-source-router
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when dispatching a content-fetch task across the multiple sources the site reads from — local markdown under `content/`, MDX with React components under `content/mdx/`, and a headless-CMS sync under `lib/cms/`. Activate this skill whenever the task says 'render this content' or 'where does this post come from' without naming a specific source, or when adding a new source to the routing surface. Do NOT use for the actual rendering of one source (use the per-source skill — `markdown-post-frontmatter-validation`, an MDX rendering skill, or a CMS-sync skill) or for chasing a specific routing bug (use debugging)."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: backend-engineering
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: false
# taxonomy_domain: optional hierarchical sub-path within `subject`. Slash-delimited
# lowercase kebab-case segments. rename of the original v8 `domain`. Remove when the flat
# `subject` is sufficient.
taxonomy_domain: content/routing
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Content-source dispatch logic for the markdown-static-site example project — routes fetches between local markdown, MDX, and headless-CMS sources."
# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
license: MIT
# compatibility: runtime compatibility object. Prefer structured fields
# (`agent_runtimes`, `node_version`) over free-text `notes`.
compatibility:
  agent_runtimes:
    - node
  node_version: ">=20"
  notes: "Source dispatch by file extension and content-path prefix; assumes a unified content router."
allowed-tools: Read Grep
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
keywords:
  - content source router
  - content dispatch
  - which content source
  - markdown vs mdx
  - cms vs local
  - source dispatch
  - content routing
  - source selection
  - content-fetch routing
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - content-source-router
# paths: glob array of code surfaces this skill governs. Supports gitignore-style
# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.
paths:
  - "lib/content/router.ts"
  - "lib/content/sources/markdown.ts"
  - "lib/content/sources/mdx.ts"
  - "lib/content/sources/cms.ts"
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "the content fetcher just received a request — which source do I read from?"
  - "add a fourth source (e.g., Notion API) to the routing table"
  - "why did the router pick MDX when the file extension is `.md`?"
  - "design the routing precedence between local files and the CMS sync"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "render this MDX page with React components"
  - "the CMS sync is producing duplicate posts"
  - "write a guide explaining the content routing"
# relations: typed graph edges to sibling skills. Current fields:
# related (adjacency for browse / co-routing expansion) /
# suppresses (exclude listed skills from co-routing when THIS skill wins; write reason
#             as "I own this exclusively over X", not "use X instead") /
# boundary (DEPRECATED alias of suppresses, retained for unmigrated skills) /
# verify_with (cross-check; co-loaded as one-hop expansion) /
# depends_on (composition; transitive — A→B→C loads all three) /
# broader / narrower (SKOS-style generalization) /
# disjoint_with (mutual exclusion for incompatible ownership).
relations:
  related:
    - documentation
    - debugging
    - refactor
  verify_with:
    - graph-audit
# grounding: required when `project[]` is non-empty. Declares the truth sources
# the skill anchors to and the failure modes those sources prevent. Omit when the
# skill is universal-knowledge. `subject_matter` replaces v8 `domain_object`.
grounding:
  subject_matter: "Content source dispatch — the table that selects between local markdown, local MDX with React components, and headless-CMS-synced content based on file extension, content-path prefix, or explicit source hint"
  grounding_mode: repo_specific
  truth_sources:
    - lib/content/router.ts
    - lib/content/sources/markdown.ts
    - lib/content/sources/mdx.ts
    - lib/content/sources/cms.ts
  failure_modes:
    - silent_fallback_to_default_source
    - file_extension_check_skipped
    - cms_sync_drift_path_to_source_map_stale
    - new_source_added_without_router_update
    - error_response_from_one_source_silently_retried_via_another
  evidence_priority: repo_code_first
# project: projects this skill is linked to. Array of {handle, role} objects.
# Non-empty project[] anchors the skill to a project and requires `grounding`.
# Suggested role values: source-of-truth, consumer, mirror. Replaces original v8 `workspace_tags`.
project:
  - handle: markdown-static-site
    role: primary
---

# Content Source Router

## Concept of the skill

**What it is:** The project-specific dispatch contract that decides which content source reads a requested page or post.
**Mental model:** Treat each source as an adapter behind one explicit router; the router owns selection, not rendering.
**Why it exists:** A static site with local markdown, MDX, and CMS-synced content needs one place where source precedence is visible and testable.
**What it is NOT:** It is not the source-specific parser, the CMS sync job, or contributor-facing documentation.
**Adjacent concepts:** Content source adapters, route matching, fallback policy, routing audit logs.
**One-line analogy:** It is the switchboard that connects a content request to the right reader.
**Common misconception:** A router can safely fall back to "markdown" when uncertain; unknown source selection should surface as a coverage gap.

## Coverage

- File-extension dispatch — `.md` routes to the markdown source, `.mdx` routes to the MDX source, no extension or `.cms.json` routes to the CMS source
- Content-path prefix dispatch — `content/posts/**` routes to local sources; `content/cms-synced/**` routes to the CMS source even if the file extension is `.md`
- Explicit source hints — internal callers (preview tools, manual reconciliation) pass an explicit `source` parameter that bypasses inspection
- Coverage-gap surfacing — when no detection rule matches a request, the router returns a structured "unknown source" result; it never silently picks a default
- Adding a new source — the workflow for landing a fourth source (Notion API, Sanity, etc.) without breaking the existing three (registration, routing precedence, fixture test, end-to-end content-fetch sanity)

## Philosophy of the skill

A content router is a dispatch surface that has to be exactly right or the rest of the site reads the wrong content. Every misroute is either a 404 (the user sees nothing) or a wrong-content render (the user sees a different post than the URL implies). The discipline is the same anti-default doctrine the `skill-router` applies to skills: prefer an explicit signal over an inferred one, prefer an unambiguous match over a "best guess," and prefer surfacing a coverage gap loudly over silently routing to a default.

## Routing Rules

The router evaluates four signals in priority order. The first signal that produces an unambiguous winner stops the chain.

| Priority | Signal | Source | Match rule |
|---|---|---|---|
| 1 | Explicit `source` parameter | Internal callers (preview, manual reconciliation) | Exact match against the `Source` enum. Bypasses all subsequent inspection. |
| 2 | Content-path prefix | Inbound request path | First matching prefix wins: `content/posts/` → markdown; `content/mdx/` → mdx; `content/cms-synced/` → cms. |
| 3 | File extension | Resolved file path | `.md` → markdown; `.mdx` → mdx; `.cms.json` → cms. |
| 4 | Explicit `source_hint` in query string | Trusted internal callers | Last-resort hint; surfaced as a warning in the router's audit log. |

### Coverage-gap behavior

If no signal produces a match, the router returns `{ ok: false, reason: 'unknown_source', evidence: {...} }`. It does NOT fall back to a default source. The caller must handle the unknown-source case explicitly — typically by responding HTTP 404 and logging the full request shape for human triage.

### Adding a new source

1. Add the new source's path prefix and file extension to the priority-2 and priority-3 detection tables
2. Add a source implementation in `lib/content/sources/<source>.ts` that mirrors the markdown source's interface
3. Add the new source to the `Source` enum used at priority 1
4. Add an end-to-end test that requests a fixture path matched by the new source and asserts the router selects it — without this, the router will silently fall through

## Verification

- Run unit cases for every configured source and every unknown-source branch.
- Add a fixture request for each new path prefix, file extension, and explicit source hint.
- Confirm unknown inputs return a structured failure instead of selecting a default source.

## Do NOT Use When

| Use instead | When |
|---|---|
| `markdown-post-frontmatter-validation` | The task is the actual frontmatter parsing for the markdown source — the router decides which source to read from, the source-specific skill validates and parses |
| `debugging` | A specific routing decision is wrong in production logs and you need to reproduce |
| `documentation` | The task is writing a contributor doc about the routing architecture |
