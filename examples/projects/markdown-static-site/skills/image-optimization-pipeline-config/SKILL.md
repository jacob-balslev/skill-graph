---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: image-optimization-pipeline-config
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when authoring or reviewing the build-time image pipeline config — defining responsive srcset breakpoints, picking output formats (AVIF / WebP / JPEG fallback), tuning compression quality per format, and ensuring the pipeline never produces a lossy artifact for source PNGs with transparency. Activate this skill whenever the task touches `lib/images/pipeline.config.ts`, `scripts/build-images.ts`, or any code path that resizes or recompresses content images. Do NOT use for runtime image rendering choices (use a frontend skill) or for chasing a specific build failure (use debugging)."

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
taxonomy_domain: content/build/images
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Build-time image pipeline configuration for the markdown-static-site example project — srcset breakpoints, format negotiation, transparency preservation, and idempotency."
# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
license: MIT
# compatibility: runtime compatibility object. Prefer structured fields
# (`runtimes`, `node`) over free-text `notes`.
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "sharp ^0.33 or equivalent; output formats AVIF / WebP / JPEG."
allowed-tools: Read Grep Bash
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
keywords:
  - image optimization
  - image pipeline
  - srcset breakpoints
  - responsive images
  - AVIF WebP fallback
  - sharp config
  - PNG transparency
  - compression quality
  - image build pipeline
  - format negotiation
  - image resize
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - image-optimization-pipeline-config
# paths: glob array of code surfaces this skill governs. Supports gitignore-style
# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.
paths:
  - "lib/images/pipeline.config.ts"
  - "scripts/build-images.ts"
  - "lib/images/format-negotiation.ts"
  - "!**/*.test.ts"
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "configure srcset breakpoints for hero images and thumbnails differently"
  - "review the image pipeline — does it preserve transparency on PNG sources?"
  - "add AVIF output to the pipeline alongside WebP and JPEG"
  - "tune JPEG quality without breaking the AVIF pass"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "pick the right <picture> element markup at runtime"
  - "the build is OOM-killed on the 10MB hero image"
  - "rewrite the pipeline in a different image library"
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
# grounding: required when `project[]` is non-empty. Declares the truth sources
# the skill anchors to and the failure modes those sources prevent. Omit when the
# skill is universal-knowledge. `subject_matter` replaces v8 `domain_object`.
grounding:
  subject_matter: "Build-time image pipeline configuration — the resize/compress/format-negotiation rules that turn source images in `content/` into the responsive variants under `public/images/`"
  grounding_mode: repo_specific
  truth_sources:
    - lib/images/pipeline.config.ts
    - scripts/build-images.ts
    - lib/images/format-negotiation.ts
  failure_modes:
    - lossy_compression_on_png_with_transparency
    - missing_avif_fallback_for_unsupported_clients
    - srcset_breakpoints_dont_match_layout_breakpoints
    - quality_setting_too_aggressive_visible_artifacts
    - pipeline_doesnt_skip_already_optimized_outputs
  evidence_priority: repo_code_first
# project: projects this skill is linked to. Array of {handle, role} objects.
# Non-empty project[] anchors the skill to a project and requires `grounding`.
# Suggested role values: source-of-truth, consumer, mirror. Replaces original v8 `workspace_tags`.
project:
  - handle: markdown-static-site
    role: primary
---

# Image Optimization Pipeline Config

## Concept of the skill

**What it is:** The build-time contract for turning source images into responsive, compressed, format-specific outputs.
**Mental model:** The pipeline is a deterministic compiler stage: source image plus config produces a known set of artifacts.
**Why it exists:** Image quality, file size, and fallback support have to be reviewed before they become user-visible performance or fidelity regressions.
**What it is NOT:** It is not runtime `<picture>` markup, layout design, or incident debugging after a build fails.
**Adjacent concepts:** Responsive breakpoints, format negotiation, compression quality, transparency preservation.
**One-line analogy:** It is the recipe card the image build step follows for every asset.
**Common misconception:** Smaller output is always better; preserving transparency, fallback coverage, and layout fit are part of correctness.

## Coverage

- The format-negotiation table — which output formats the pipeline produces (AVIF + WebP + JPEG fallback is the canonical shape) and the priority order browsers should request
- Srcset breakpoints — the widths the pipeline emits per image role (hero, content, thumbnail) and how those align with the site's CSS layout breakpoints
- Per-format compression quality — JPEG at 80, WebP at 75, AVIF at 65 is a defensible default; anything more aggressive needs visual A/B verification
- Transparency preservation — the pipeline must detect alpha channels in source PNGs and disable lossy formats (or fall back to lossless WebP / AVIF) for those specific images
- Idempotency — the pipeline must not reprocess already-optimized outputs on every build (cache invalidation by source-file hash, not timestamp)
- Source-format coverage — what the pipeline accepts as input (PNG, JPEG, WebP source) and what it explicitly rejects (HEIC, RAW, video formats)

## Philosophy of the skill

A build-time image pipeline is a config-defined contract between the source-of-truth images in `content/` and the bandwidth-optimized variants the browser receives. Bugs here are silent: a misconfigured srcset doesn't crash the build, it just sends a 4MB hero image to a phone. The discipline is to encode every choice — breakpoints, formats, quality, transparency rules — explicitly in the config, with a comment naming the constraint that drove each choice. Pipeline behavior should be derivable from the config without reading the build script.

## Key Files

| File | Purpose |
|---|---|
| `lib/images/pipeline.config.ts` | The canonical config: breakpoints, formats, quality settings, source-format allowlist |
| `scripts/build-images.ts` | The build entrypoint that reads the config and walks `content/` — should be a thin runner with no embedded policy |
| `lib/images/format-negotiation.ts` | The runtime helper that maps a request's `Accept:` header to the right pre-built variant |

## Verification

Before merging any change to the pipeline config:

- [ ] Every output format has an explicit quality setting; no relying on library defaults
- [ ] Srcset breakpoints match (or are a documented superset of) the site's CSS layout breakpoints
- [ ] PNG sources with an alpha channel route to lossless or alpha-preserving lossy formats (WebP-lossless, AVIF) — never to JPEG
- [ ] The pipeline skips already-optimized outputs by source-hash comparison; running the build twice in a row is a no-op on the second run
- [ ] An end-to-end test under `__tests__/images/` exercises a fixture image of each accepted format and asserts the expected variant set is produced
- [ ] The format-negotiation helper has a fallback path for clients that send no `Accept:` header (or one that lists no supported format)

## Do NOT Use When

| Use instead | When |
|---|---|
| (a frontend image-rendering skill) | The task is choosing the right `<picture>` / `<img srcset=...>` markup at the component level |
| `debugging` | A specific image is failing to optimize and you need to reproduce from build logs |
| `documentation` | The task is writing a contributor doc explaining how the pipeline works |
| `refactor` | The task is restructuring the pipeline code without changing the config contract |
