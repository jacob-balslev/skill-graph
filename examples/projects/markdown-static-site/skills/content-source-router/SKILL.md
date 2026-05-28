---
schema_version: 8
name: content-source-router
description: "Use when dispatching a content-fetch task across the multiple sources the site reads from — local markdown under `content/`, MDX with React components under `content/mdx/`, and a headless-CMS sync under `lib/cms/`. Activate this skill whenever the task says 'render this content' or 'where does this post come from' without naming a specific source, or when adding a new source to the routing surface. Do NOT use for the actual rendering of one source (use the per-source skill — `markdown-post-frontmatter-validation`, an MDX rendering skill, or a CMS-sync skill) or for chasing a specific routing bug (use debugging)."
version: 0.1.0
subject: code-engineering
deployment_target: project
taxonomy_domain: content/routing
scope: "Content-source dispatch logic for the markdown-static-site example project — routes fetches between local markdown, MDX, and headless-CMS sources."
owner: markdown-static-site-maintainer
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "Source dispatch by file extension and content-path prefix; assumes a unified content router."
allowed-tools: Read Grep
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
triggers:
  - content-source-router
paths:
  - "lib/content/router.ts"
  - "lib/content/sources/markdown.ts"
  - "lib/content/sources/mdx.ts"
  - "lib/content/sources/cms.ts"
examples:
  - "the content fetcher just received a request — which source do I read from?"
  - "add a fourth source (e.g., Notion API) to the routing table"
  - "why did the router pick MDX when the file extension is `.md`?"
  - "design the routing precedence between local files and the CMS sync"
anti_examples:
  - "render this MDX page with React components"
  - "the CMS sync is producing duplicate posts"
  - "write a guide explaining the content routing"
relations:
  boundary:
    - skill: documentation
      reason: "documentation writes prose ABOUT routing; this router is the routing logic itself"
    - skill: debugging
      reason: "debugging chases a specific routing mis-dispatch; this skill designs the routing table"
    - skill: refactor
      reason: "refactor restructures code; this skill defines the dispatch contract that any refactor must preserve"
  verify_with:
    - graph-audit
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
portability:
  readiness: scripted
  targets:
    - skill-md
project:
  - handle: markdown-static-site
    role: primary
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---

# Content Source Router

## Coverage

- File-extension dispatch — `.md` routes to the markdown source, `.mdx` routes to the MDX source, no extension or `.cms.json` routes to the CMS source
- Content-path prefix dispatch — `content/posts/**` routes to local sources; `content/cms-synced/**` routes to the CMS source even if the file extension is `.md`
- Explicit source hints — internal callers (preview tools, manual reconciliation) pass an explicit `source` parameter that bypasses inspection
- Coverage-gap surfacing — when no detection rule matches a request, the router returns a structured "unknown source" result; it never silently picks a default
- Adding a new source — the workflow for landing a fourth source (Notion API, Sanity, etc.) without breaking the existing three (registration, routing precedence, fixture test, end-to-end content-fetch sanity)

## Philosophy

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

## Do NOT Use When

| Use instead | When |
|---|---|
| `markdown-post-frontmatter-validation` | The task is the actual frontmatter parsing for the markdown source — the router decides which source to read from, the source-specific skill validates and parses |
| `debugging` | A specific routing decision is wrong in production logs and you need to reproduce |
| `documentation` | The task is writing a contributor doc about the routing architecture |
