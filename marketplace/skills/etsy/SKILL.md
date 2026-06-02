---
name: etsy
description: "Use when working with Etsy listings — the marketplace's title/tag/attribute model, its search-ranking signals (relevancy, listing quality, recency, shipping, engagement), the 13-tag and 20-character-per-tag limits, listing video, and editing Etsy listings that are managed by an upstream POD platform (Printify/Printful) including the publish/lock lifecycle. Do NOT use for generic Shopify storefront work, non-Etsy marketplaces, or the print-file (artwork) generation itself. Do NOT use for Edit a Shopify theme or storefront SEO meta fields (use shopify). Do NOT use for Create the Printify product / handle the POD publish webhook (use printify). Do NOT use for Generate the artwork PNG that gets printed (graphics task)."
license: CC-BY-4.0
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: product-domain
  deployment_target: portable
  taxonomy_domain: ecommerce/marketplaces/etsy
  owner: skill-graph-maintainer
  freshness: "2026-05-30"
  drift_check: "{\"last_verified\":\"2026-05-30\"}"
  eval_artifacts: none
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"etsy seo\",\"etsy tags\",\"etsy listing\",\"etsy title\",\"etsy 13 tags\",\"etsy search ranking\",\"etsy listing video\",\"printify to etsy\",\"etsy attributes\",\"etsy publish lock\"]"
  triggers: "[\"etsy\",\"etsy seo\",\"etsy listing\",\"etsy tags\"]"
  examples: "[\"Optimize an Etsy listing's title and 13 tags for search without exceeding the 20-character tag limit\",\"Edit the tags and title of an Etsy listing that is managed by Printify and republish it to the channel\",\"Diagnose why an Etsy product gets impressions but no clicks or sales\"]"
  anti_examples: "[\"Edit a Shopify theme or storefront SEO meta fields (use shopify)\",\"Create the Printify product / handle the POD publish webhook (use printify)\",\"Generate the artwork PNG that gets printed (graphics task)\"]"
  relations: "{\"related\":[\"printify\",\"keywords\",\"seo-strategy\",\"shopify\"],\"boundary\":[{\"skill\":\"printify\",\"reason\":\"Printify owns the POD product/blueprint/variant model and the cross-channel publish mechanics; this skill owns Etsy-listing-specific concerns — tags, titles, attributes, Etsy search ranking, and Etsy policy.\"},{\"skill\":\"shopify\",\"reason\":\"Shopify owns its own storefront/theme/Admin API; this skill is Etsy-marketplace-specific.\"}],\"verify_with\":[\"keywords\"]}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: ""
  lint_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/product-domain/etsy/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Etsy

## Coverage
Etsy is a marketplace, not a storefront — its listing model and search algorithm are Etsy's own, not Google's, and they differ sharply from generic web SEO. A listing carries a **title** (hard cap **140 characters**), **up to 13 tags** (each a hard cap of **20 characters**; longer tags are rejected and never index), category and **attributes** (type/colour/size/occasion etc.), a description, up to ~10 photos, and an optional **listing video**. Etsy search ranks on a documented set of signals: **relevancy** (query terms matched in title + tags, with multi-word phrase matches weighted), **listing quality score** (click-through and conversion history per listing), **recency** (a small new-listing boost), **shipping price** (free / low shipping is favoured), **customer-and-market experience** (shop reviews, completeness, policies), and increasingly **engagement** (favourites, dwell time, and — since listing video auto-plays on mobile — video presence). This skill covers how to shape title/tags/attributes for relevancy and how Etsy ranks and re-ranks the result.

A large share of Etsy listings are fulfilled by an upstream print-on-demand platform (Printify, Printful) rather than authored natively in Etsy. In that case the **POD platform is the source of truth**: you edit the product there and **publish** to push changes to the Etsy listing. The POD product's `tags`/`title` map onto the Etsy listing's tags/title, subject to Etsy's own limits — so the POD platform may store more than 13 tags or tags longer than 20 chars, but Etsy only honours the first 13 and silently drops over-length ones. This skill covers that translation boundary and the publish/lock lifecycle that governs edits.

## Philosophy
**Tags are a recall budget, not a keyword dump.** You get exactly 13 slots of ≤20 characters each. Multi-word long-tail phrases out-perform single words because Etsy matches phrases and most buyers search phrases; a slot spent on a >20-char phrase is a slot wasted (the tag is rejected outright). Fill all 13, make each a distinct buyer phrase, front-load the strongest in the title's first ~40 characters because mobile SERPs truncate there, and never duplicate a tag that is already a title phrase at the expense of adding new query coverage.

**Relevancy gets you seen; quality keeps you ranked.** Etsy's listing quality score is a feedback loop: a listing that earns clicks and conversions on its impressions is shown more; one that gets impressions but no clicks is demoted. So title/tag optimisation is necessary but not sufficient — the photo, price, and video drive the click-and-convert half. Do not buy Etsy Ads to mask a listing that converts poorly organically; fix conversion first.

**Editing a POD-managed listing is asynchronous and lock-gated.** On Printify, an edit is `PUT /v1/shops/{shop}/products/{id}.json` followed by `POST .../publish.json` to push to Etsy; the publish flips the product to **`is_locked: true`** until the channel confirms. **A `PUT` to a locked product fails with HTTP 400, error code 8252 "Product is disabled for editing."** Tag-only sweeps that ignore the title field leave the title untouched (a tag operation never edits the title), so title and tag remediation are two separate edits. Treat publish success as a separate state from edit success and reconcile by re-reading the product, not by assuming the `PUT` 200 means the channel is live.

## Verification
- A tag is countable for search only if it is **≤20 characters**; longer values are rejected by Etsy and never index — verify post-edit that no tag exceeds 20 chars rather than trusting the upstream store accepted it.
- A listing surfaces **at most 13 tags**; if the upstream POD product holds more, only the first 13 reach Etsy — verify the high-value phrases occupy the first 13 slots, not positions 14+.
- Title relevancy that matters on mobile lives in the **first ~40 characters** (SERP truncation point), under the 140-char hard cap — verify the strongest phrase is front-loaded.
- After editing a POD-managed listing, the change is live on Etsy only after a successful **publish** and channel confirmation — verify by re-reading the product (and, where available, the publish-status / publishing-succeeded signal), not by the edit call's 200.
- When a batch edit hits **HTTP 400 / code 8252 "Product is disabled for editing,"** the product is `is_locked` from an in-flight publish — verify the lock has cleared (re-read `is_locked`) and retry, rather than treating it as a permanent failure.
- A drop in impressions after an edit can be Etsy's re-indexing lag or a relevancy loss from removing a matched phrase — verify against the listing's own pre-edit tag/title set before attributing it to the algorithm.

## Do NOT Use When
- The work is generic Shopify storefront SEO (theme, `seo.title`/`seo.description`, Google organic). Use the shopify skill — Etsy's algorithm and limits do not apply there.
- The task is the Printify/Printful product model itself (blueprints, print providers, variants) or the POD publish-webhook plumbing. Use the printify skill; this skill only covers the Etsy-listing side of that boundary.
- The marketplace is Amazon, eBay, or another channel. Each has its own title/keyword rules (e.g. Amazon's 250-byte backend terms, profanity bans) that differ from Etsy's 13-tag/20-char model. Use a channel-specific skill or the keywords skill.
- The task is generating the print artwork (PNG/SVG, DPI, colour profiles). That is a graphics task, not an Etsy task.
- You need deep keyword-research methodology (volume validation, intent mapping, cannibalisation). Use the keywords skill; this skill consumes its output and applies it within Etsy's listing constraints.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `product-domain`
- Deployment: `portable`
- Domain: `ecommerce/marketplaces/etsy`

**When to use**
- Optimize an Etsy listing's title and 13 tags for search without exceeding the 20-character tag limit
- Edit the tags and title of an Etsy listing that is managed by Printify and republish it to the channel
- Diagnose why an Etsy product gets impressions but no clicks or sales
- Triggers: `etsy`, `etsy seo`, `etsy listing`, `etsy tags`

**Not for**
- Edit a Shopify theme or storefront SEO meta fields (use shopify)
- Create the Printify product / handle the POD publish webhook (use printify)
- Generate the artwork PNG that gets printed (graphics task)
- Owned by `printify`: the POD product/blueprint/variant model and the cross-channel publish mechanics
- Owned by `shopify`: its own storefront/theme/Admin API

**Related skills**
- Verify with: `keywords`
- Related: `printify`, `keywords`, `seo-strategy`, `shopify`

**Keywords**
- `etsy seo`, `etsy tags`, `etsy listing`, `etsy title`, `etsy 13 tags`, `etsy search ranking`, `etsy listing video`, `printify to etsy`, `etsy attributes`, `etsy publish lock`

<!-- skill-graph-context:end -->
