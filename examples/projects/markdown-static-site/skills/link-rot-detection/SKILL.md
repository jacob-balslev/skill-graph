---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: link-rot-detection
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when authoring or reviewing a periodic-scan job that walks every external link in a markdown content set and flags 404s, redirects to unrelated content, and connection failures. Activate this skill whenever the task says 'check our links' or mentions a link-rot scan, broken-link audit, or link-health report. Do NOT use for live runtime link checking inside the rendered page (use a frontend a11y / UX skill) or for chasing a specific broken-link incident from a user report (use debugging)."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: quality-assurance
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: true
# taxonomy_domain: optional hierarchical sub-path within `subject`. Slash-delimited
# lowercase kebab-case segments. rename of the original v8 `domain`. Remove when the flat
# `subject` is sufficient.
taxonomy_domain: content/maintenance
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Portable workflow skill for periodic link-rot detection across markdown content sets. Excludes live runtime link checking, one-off incident debugging, and UI treatment of broken-link states."
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
  notes: "Portable across any markdown-content project; no codebase grounding required."
allowed-tools: Read Grep Bash
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
keywords:
  - link rot
  - link-rot detection
  - broken link audit
  - link health
  - dead link scan
  - 404 audit
  - external link check
  - periodic scan
  - markdown link extraction
  - link-rot report
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - link-rot-detection
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "design a periodic link-rot scan that runs nightly and posts a report"
  - "review the link-rot detector — does it handle redirects correctly?"
  - "explain how to test the link-rot scanner against a fixture set without hitting the network"
  - "should the scan retry on transient 5xx, or only flag persistent failures?"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "validate this internal route in the live app"
  - "the link to example.com just broke for one user"
  - "design the rendering of broken-link badges in the UI"
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
    - testing-strategy
---

# Link-Rot Detection

## Concept of the skill

**What it is:** The scheduled audit mechanism that scans markdown content for external links that no longer resolve correctly.
**Mental model:** Treat link checking as a batch health report, not a live page-rendering feature.
**Why it exists:** Broken or redirected links erode trust quietly, so the project needs a repeatable scan with clear evidence.
**What it is NOT:** It is not a one-off production incident investigation or UI design for broken-link badges.
**Adjacent concepts:** Markdown link extraction, status-code classification, soft-404 detection, polite crawling.
**One-line analogy:** It is a periodic inspection report for all outbound references.
**Common misconception:** HTTP 200 means healthy; soft-404s, unrelated redirects, and rate-limit behavior also need interpretation.

## Coverage

- Markdown link extraction — pulling every `[text](url)` and `[text][ref]` reference link out of every `.md` and `.mdx` file in the content tree
- External vs internal classification — what counts as external (different host) and what gets skipped (relative path, anchor link, mailto, tel)
- Status-code interpretation — 200 is healthy, 301/308 is a redirect (record the new URL but don't fail), 302/307 is transient (re-check next run), 404/410 is dead (flag), 5xx is transient (retry with backoff before flagging)
- Soft-404 detection — pages that return HTTP 200 but render an "unknown page" interstitial (compare body length / content against known soft-404 patterns)
- Rate-limiting and politeness — concurrent request budget per origin host, honoring `robots.txt` crawl-delay, exponential backoff on 429
- Reporting shape — the scanner's output is a structured report (JSON + markdown summary), not a live alert; the report is the audit artifact

## Philosophy of the skill

External links rot. Every site that's older than two years has at least a few. The choice is between knowing about them on a schedule or finding out from a user. A periodic scan with a published report turns link health into a maintenance task instead of an emergency. The discipline is to be conservative — distinguish persistent failures (404 across 3 runs) from transient ones (one 503 on a Tuesday) — and to never let the scanner itself become a denial-of-service vector against the targets it's checking.

## Verification

Before merging any change to the link-rot scanner or its config:

- [ ] The scanner extracts every link in `[text](url)` and `[text][ref]` form from `.md` and `.mdx` files; reference links resolve their targets before classification
- [ ] Internal links (relative paths, same-host absolute, anchors, mailto, tel) are explicitly excluded — confirmed by a fixture test with mixed link types
- [ ] Persistent failures are distinguished from transient ones — a link is only flagged after N consecutive failures across separate runs (default N=3)
- [ ] The scanner respects per-host concurrency limits and honors `robots.txt` crawl-delay; a single host getting many requests in tight sequence is a bug
- [ ] Soft-404 detection has a defined pattern set and an explicit "unknown" bucket for cases that don't match any known soft-404
- [ ] The scanner produces both a JSON report (machine-readable) and a markdown summary (human-readable) with link, status code, last-seen-OK timestamp, and recommendation

## Do NOT Use When

| Use instead | When |
|---|---|
| (a frontend a11y / UX skill) | The task is rendering a "this link may be broken" badge in the live UI |
| `debugging` | A specific link broke for a specific user and you need to reproduce |
| `documentation` | The task is writing the link-health policy doc, not the scanner |
| `refactor` | The task is restructuring the scanner without changing the detection contract |
