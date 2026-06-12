---
name: etsy
description: "Use when working with Etsy listings — Etsy's own title/tag/category/attribute/description/photo/video model and two-phase search (query matching → ranking on relevancy, listing engagement, recency, shipping price, customer-and-market experience, and personalization); the 13-tag and 20-character-per-tag limits and 140-character title cap; Etsy's 2026 natural-readable-title guidance; the description as an indexed/semantic and Google-snippet surface; free-shipping/shipping-price visibility thresholds; listing-video specs; the first-party Search Visibility diagnostic; the Etsy Open API listing surface; and editing Etsy listings managed by an upstream POD platform (Printify/Printful) including the publish/lock lifecycle, selective publishing, and publish-failure diagnostics. Do NOT use for generic Shopify storefront work, non-Etsy marketplaces, deep keyword-research methodology, the POD product/blueprint/variant model itself, or print-file/artwork generation."
license: CC-BY-4.0
metadata:
  relations: "{\"related\":[\"seo-strategy\",\"printify\",\"keywords\",\"shopify\"],\"suppresses\":[\"printify\",\"shopify\"],\"verify_with\":[\"keywords\",\"printify\"]}"
  subject: product-domain
  scope: "Applying chosen keywords and merchandising decisions to Etsy listing fields — title, the 13 tags, category/attributes, description, photos, and listing video — and diagnosing an Etsy listing's search performance through Etsy's own first-party surfaces (the per-listing Search Visibility page, shop stats, and engagement rate). Includes the Etsy Open API listing surface and the special case where the listing's source of truth is an upstream print-on-demand platform (Printify/Printful) reached through an asynchronous, lock-gated, selectively-publishable lifecycle, and the translation/verification boundary between the POD product's fields and the live Etsy listing's indexed fields. Explicitly EXCLUDES keyword-research methodology (seed expansion, clustering, intent mapping, rank tracking), artwork/print-file generation, the POD product/blueprint/variant model itself, generic web SEO, and any non-Etsy marketplace or Shopify storefront."
  public: "true"
  taxonomy_domain: ecommerce/marketplaces/etsy
  stability: experimental
  keywords: "[\"etsy seo\",\"etsy tags\",\"etsy listing\",\"etsy title\",\"etsy search ranking\",\"etsy search visibility\",\"etsy listing video\",\"etsy open api\",\"printify to etsy\",\"etsy free shipping\"]"
  triggers: "[\"etsy\",\"etsy seo\",\"etsy listing\",\"etsy tags\",\"etsy search visibility\"]"
  examples: "[\"Optimize an Etsy listing title, description, attributes, and 13 tags without exceeding the 20-character tag limit\",\"Diagnose why an Etsy listing gets impressions but low clicks or sales after a title/tag change\",\"Apply Etsy's 2026 title guidance while preserving useful search phrases in tags, descriptions, or attributes\",\"Edit a Printify-managed Etsy listing and republish without overwriting custom Etsy-side photos or titles\",\"Check whether an Etsy Open API listing client is ready for current listing inventory and variation behavior\"]"
  anti_examples: "[\"Research a full keyword universe and cluster search intent before any listing exists (use keywords)\",\"Edit a Shopify theme or Shopify SEO meta fields (use shopify)\",\"Create the Printify product, select blueprint/provider/variants, or handle Printify webhooks (use printify)\",\"Generate the PNG/SVG artwork that will be printed (graphics task)\",\"Optimize an Amazon or eBay listing (use a channel-specific skill)\"]"
  grounding: "{\"subject_matter\":\"Etsy marketplace listing fields, search ranking, search visibility diagnostics, Open API listing behavior, and POD-to-Etsy listing sync boundaries\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://help.etsy.com/hc/en-us/articles/360000336307-How-to-Use-Tags-to-Get-Found-in-Search\",\"https://help.etsy.com/hc/en-us/articles/115015628707-How-to-Create-a-Listing?segment=selling\",\"https://www.etsy.com/seller-handbook/article/how-etsy-search-works/375461474487\",\"https://www.etsy.com/legal/policy/search-advertisement-recommendation/899478564529\",\"https://www.etsy.com/seller-handbook/article/1399426136697\",\"https://www.etsy.com/seller-handbook/article/keywords-101-everything-you-need-to-know/382774281517\",\"https://help.etsy.com/hc/en-in/articles/25869947521175-How-to-Use-the-Etsy-Search-Visibility-Page\",\"https://help.etsy.com/hc/en-us/articles/360035901534-How-to-Ship-Your-Items-on-Etsy\",\"https://help.etsy.com/hc/en-us/articles/360024198553-How-to-Offer-Free-Shipping?segment=selling\",\"https://help.etsy.com/hc/en-us/articles/360053206073-How-to-Add-a-Listing-Video\",\"https://help.etsy.com/hc/en-us/articles/115015663987-Search-Engine-Optimization-SEO-for-Shop-and-Listing-Pages?segment=selling\",\"https://developers.etsy.com/documentation/mcp_server/devmcpserver/\",\"https://developers.etsy.com/documentation/tutorials/third-variation/\",\"https://developers.printify.com/API-Doc-RREdits.html\",\"https://help.printify.com/hc/en-us/articles/4483629961489-How-do-I-use-selective-publishing-on-my-sales-channels\",\"https://help.printify.com/hc/en-us/articles/4483630521105-Why-was-my-product-information-overwritten\",\"https://help.printify.com/hc/en-us/articles/4483617102097-Why-can-t-I-publish-my-products-to-Etsy\",\"https://help.printify.com/hc/en-us/articles/45606975744529-How-can-I-create-a-Multi-Product-Listing-on-Etsy\"],\"failure_modes\":[\"old_title_keyword_stuffing_guidance_overrides_2026_clear_title_guidance\",\"title_position_confused_with_ranking_weight_instead_of_buyer_scan_ctr\",\"tags_repeated_from_categories_or_attributes_waste_recall_budget\",\"description_and_first_photo_ignored_in_query_matching\",\"search_personalization_misread_as_universal_rank_drop\",\"listing_visibility_issue_misdiagnosed_as_keyword_problem\",\"free_shipping_guarantee_or_shipping_price_visibility_lever_ignored\",\"video_autoplay_or_format_claims_made_without_current_limits\",\"POD_full_publish_overwrites_custom_etsy_listing_fields\",\"Printify_lock_or_publish_failure_treated_as_successful_Etsy_update\",\"Printify_publish_status_unlock_endpoints_omitted_for_API_flows\",\"Etsy_API_client_assumes_two_variation_inventory_after_third_variation_rollout\"],\"evidence_priority\":\"general_knowledge_first\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/product-domain/etsy/SKILL.md
---
# Etsy

## Concept of the skill

Applying chosen keywords and merchandising decisions to Etsy listing fields — title, the 13 tags, category/attributes, description, photos, and listing video — and diagnosing an Etsy listing's search performance through Etsy's own first-party surfaces (the per-listing Search Visibility page, shop stats, and engagement rate).

## Coverage

Etsy is a marketplace search system, not a generic storefront and not Google organic search — its listing model and search algorithm are Etsy's own, and they differ sharply from generic web SEO. This skill covers Etsy listing fields, Etsy search visibility, Etsy ranking diagnostics, the Etsy Open API listing surface, and the Etsy side of POD-managed listing sync. It is intentionally narrower than `keywords`: use `keywords` to research and cluster search demand, then use this skill to translate selected buyer phrases into Etsy's concrete listing fields and constraints.

An Etsy listing is shaped by its title, category, attributes, description, tags, images, video, price, shipping/processing details, return policy, shop context, and listing state. Current public Etsy docs preserve these hard field facts:

- **Title** — hard cap **140 characters**, but Etsy's current guidance recommends a short, clear, buyer-readable title (often fewer than 15 words) that states the item and its most important objective traits. The old "fill all 140 characters with comma-separated keyword variants" playbook is now counter-productive (see Title section).
- **Tags** — **up to 13 tags** per listing, each a hard cap of **20 characters (spaces included)**; tags may include spaces, letters, numbers, apostrophes, hyphens, and supported accented characters. Over-length or invalid tags must be fixed before treating the listing as optimized.
- **Categories and attributes** — act like additional matching surfaces (type/colour/size/occasion/holiday etc.). Select the most specific (leaf-level) category and fill all relevant attributes, even where an attribute uses a broader but still accurate value.
- **Description** — participates in Etsy query matching and conversion (see Search Model). Put concrete product facts and a few relevant keywords in the first sentences, without copying the title verbatim or listing keywords as a block.
- **Photos** — a listing can hold **up to 20 photos** (Etsy raised the long-standing limit of 10; POD mockup limits track the higher number). Search Visibility expects at least one image, a high-resolution primary photo (Etsy recommends **≥2000px** on the shortest side), a singular finished-product primary image, and clear/well-lit presentation. The first image wins the click; the rest drive conversion.
- **Video** — **one optional listing video**. Use the current US listing-form constraint: **5–15 seconds** (verify the current minimum against Etsy's live upload form — some current Help text states a 3-second minimum), **audio is removed on upload (the video plays silently)**, **≤100 MB**, common video formats, **minimum 500px** with **1080px+ recommended**. Do not treat aspect ratio as a universal ranking rule; verify the live upload form or latest Help page before rejecting an otherwise valid video for ratio alone.

## Search Model

Etsy search runs in **two phases: query matching and ranking.**

**Query matching** decides which listings are eligible for a query. It now takes a **holistic** view of the listing — title, tags, attributes, categories, **description**, first photo, reviews, and other listing/shop information — rather than scanning only the title and tags.

**Ranking** orders the matched set by likelihood of purchase, weighing the signals Etsy publicly names: **relevancy** (how proximate the query terms are to the listing's tags/title/attributes/description, with multi-word phrase matches weighted); **listing engagement rate / listing quality** (clicks, views, favourites, and conversions per impression — Etsy's 2026 framing calls this the *Listing Engagement Rate*); **recency** (a small, temporary new-/re-listing boost so Etsy can learn the listing's quality); **shipping price/method and free-shipping signals**; **customer-and-market experience / shop quality** (reviews, completeness, policies, and **Star Seller** trust status); **shopper personalization / context-specific ranking** (the searcher's own habits, location, language); translations/locale; and frequency capping.

**Semantic search (2026): Etsy now applies large-language-model / semantic matching to infer buyer *intent*, not just exact character matches** — a search for "gift for a gardening mum" can surface listings tagged "garden tools" or "plant lover gift." Exact multi-word phrases still win the query-matching phase, but covering the **concept space** (synonyms, recipient, occasion, style) across your 13 tags, attributes, and description now matters more than under pure exact-match.

**Relevancy gets you seen; quality keeps you ranked.** The engagement score is a feedback loop: a listing that earns clicks and conversions on its impressions is shown more; one that gets impressions but no clicks is demoted. Title/tag optimisation is necessary but not sufficient — the photo, price, **free/low shipping**, and video drive the click-and-convert half. **Do not buy Etsy Ads to mask a listing that converts poorly organically; fix conversion first.**

Use this diagnostic map before concluding a problem is keyword-only:

| Symptom | Likely Etsy-side question | What to inspect first |
|---|---|---|
| No impressions after publish | Is the listing indexed and eligible yet? | New/edited-listing timing (a new listing can take up to ~48 hours to appear in search/categories), policy status, listing state, category, image, return policy. |
| Impressions but low clicks | Does the result earn attention? | Primary photo, concise title, price, shipping badge/price/free-shipping treatment, video, reviews, and whether the query intent matches the product. |
| Clicks but low sales | Does the listing answer purchase objections? | Supporting photos, description first sentences, size/material/fit details, processing time, returns, personalization, price, shipping, trust signals. |
| Rank differs by browser/device/account | Is this personalization or filters? | Etsy's context-specific ranking, buyer location/language, filters, frequency capping, and shop stats — rather than manual self-search. |
| Drop after a title/tag change | Did the edit remove an actual matched phrase or reset learning? | Pre-edit title/tags/attributes/description, shop-stats query terms, and a re-check window instead of same-day rank checking. |
| Search Visibility warning | Is Etsy flagging a quality/completeness issue? | Search Visibility page issues: image, primary-photo quality, specific category, return policy, US shipping price/free-shipping treatment, shop completion, customer service. |

Do not claim "rank improved" from a single manual search. Use Etsy shop stats, query terms where available, impressions, clicks, favourites, purchases, conversion rate, and the Search Visibility page. Baseline before edits, record the changed fields, and give Etsy time to re-index and re-learn engagement before judging.

## Title, Tags, Attributes, And Description

**Write the title for a human, then check it for the algorithm — not the reverse.** Older Etsy advice pushed long keyword-packed titles; Etsy's 2026 public guidance (Seller Handbook, *"New Guidance for Listing Titles, and a Tool to Help"*) says search now uses a broader listing view and title readability matters for buyer confidence and conversion. Keep the title clear and scannable: name the item once, front-load the objective traits shoppers must see first (product type, material, colour, size, personalization when essential), avoid repeated words, omit price/shipping/sale language, and keep aspirational gift phrases out of the title unless essential to the item.

Concrete rewrite: a weak title like `Mug, Coffee Mug, Tea Mug, Ceramic Mug, Handmade Mug, Gift Mug, Mother's Day Mug` repeats one noun and spends buyer attention on variants of the same phrase. A stronger title is `Handmade Personalized 11oz Ceramic Coffee Mug for Mother's Day`: it names the object once, reads as natural language, and leaves secondary phrases for tags, attributes, and the description.

**Title position is a display/CTR concern, not a magic ranking weight.** Etsy's current keyword guidance states that *where* a phrase appears in the title does not by itself affect ranking. Still lead with the concrete product phrase, because buyers scan the beginning first and Google snippets show roughly the first **50–60 characters** of the page title. Front-load for readability and click-through, not to game position — and let tags + description carry the long-tail coverage the title can no longer absorb. *(This replaces the older "title relevancy lives in the first ~40 characters" framing, which conflated a buyer-scanning/CTR lever with a ranking weight.)*

**Tags are a recall budget, not a keyword dump.** You get exactly 13 slots of ≤20 characters each. Use all 13 when you have 13 accurate, distinct buyer phrases; prefer multi-word long-tail phrases over isolated fragments when they fit within 20 characters, because Etsy matches phrases and most buyers search phrases (a slot spent on a >20-char phrase is wasted — the tag is rejected outright). **Do not re-state a term the category or attributes already cover** — those fields already act like matching signals, so spend the freed slots on new query coverage (synonyms, occasion, recipient, style), which is what the semantic layer rewards. Do not intentionally add misspellings, and do not add tags in multiple languages unless you are authoring translations in the supported listing flow.

**Break long-tail targets into useful chunks.** A target such as "minimalist diamond engagement ring" exceeds 20 characters — split it into accurate phrasal tags such as `minimalist jewelry`, `diamond ring`, and `engagement ring` rather than one-word debris. Preserve true buyer language across title, tags, description, categories, and attributes instead of copying the same phrase into every field.

**The description's first lines are SEO, not boilerplate.** Etsy's semantic query-matching phase reads the description for context, so open with the listing's most relevant keyword(s) in natural prose and answer the buyer-critical facts (what it is, material/size/fit, what's included, processing expectations, key use, any buyer-critical limitations) — but **do not copy the title verbatim** (that wastes the surface). Separately, Etsy listings can rank on external search engines: Etsy's SEO Help emphasizes the first sentence (roughly the first **150–160 characters**) so it can stand alone as the Google search-result preview — Etsy does not guarantee a fixed meta-description field, so write the opening so it reads well standalone. A description that opens with "Thank you for visiting my shop!" wastes both the Google snippet and the index head.

## Search Visibility And Official Tools

Use Etsy's per-listing **Search Visibility page** as the authoritative first-party diagnostic — prefer it over third-party "SEO score" tools. It groups visibility issues into listings, shop, and customer service, and currently calls out the practical inputs Etsy itself weighs: at least one image; a **high-resolution primary photo (Etsy recommends ≥2000px)**; a singular finished-product primary photo; a clear, well-lit image; the **most-specific (leaf-level) category**; a stated **return policy**; **US domestic shipping under ~$6** for US-search priority; **shop completeness** (logo/bio/policies/about); and **customer-service** signals (message response, on-time dispatch/tracking, review score, cases). Changes typically reflect on that page after roughly **24 hours**, so do not judge an edit's effect instantly.

Etsy also offers optional **AI-powered title recommendations** for eligible English listings. Treat suggestions as a current first-party hint, not authority: before applying, export/download listing CSV data so original phrases are not lost; review the suggested title against the product; preserve useful search phrases in tags/descriptions/attributes; apply to a small set first when risk is high; then re-check shop stats after enough time has passed.

For API-oriented work, prefer Etsy's official **Open API v3 docs and the Etsy Dev MCP Server** over stale remembered endpoint details. The Dev MCP Server supplies current endpoint details, schemas, OAuth scopes, and guides from the OpenAPI spec, but **it does not call the Etsy API directly** and does not replace marketplace/listing judgment — use it to inspect `ShopListing`, `updateListing`, inventory, shipping, personalization, and receipt schemas before coding.

## Etsy Open API Listing Notes

The Etsy Open API v3 listing surface is relevant when the task is automation, but this skill still owns listing semantics rather than generic app architecture.

- Listing create/update operations require `x-api-key` plus OAuth scopes such as `listings_r`, `listings_w`, and `listings_d` (delete).
- `updateListing` is a **PATCH** operation. It accepts fields such as `title`, `description`, `taxonomy_id`, `tags`, listing state, shipping-profile-related fields, and other listing details.
- Etsy enforces title character constraints **beyond length**, and public/API-facing sources can lag or conflict. Verify current `createDraftListing` / `updateListing` title constraints against the official Open API reference or Dev MCP Server before hard-coding punctuation rules such as one-time-only `%`, `:`, `&`, or `+`.
- Tags in the API must still respect Etsy tag rules. Do not assume a connector, importer, or POD platform's accepted value means Etsy indexed that value.
- As of the **Third Variation tutorial**, OpenAPI developers were told to be ready by **June 1, 2026** for inventory/listing responses that can include up to **three** variation properties; the third variation must be a predefined property/value from the listing-taxonomy node, not a custom variation. API clients must not assume a two-variation inventory shape.

## POD-Managed Etsy Listings

A large share of Etsy listings are fulfilled by an upstream print-on-demand platform (Printify, Printful) rather than authored natively in Etsy. In those workflows the **POD platform is the operational source of truth** for product configuration, variants, print areas, and publish state, while **Etsy remains the source of truth** for Etsy listing search behaviour and marketplace policy. You edit the product on the POD platform and **publish** to push changes to the Etsy listing; the POD product's `tags`/`title` map onto the Etsy listing's fields **subject to Etsy's hard 13-tag / 20-character limits at Etsy's own boundary**. Never assume the POD store's tag set equals the indexed Etsy tag set — verify the live Etsy fields after publish.

**Editing a POD-managed listing is asynchronous and lock-gated — publish is not edit success.** On Printify, an edit is `PUT /v1/shops/{shop_id}/products/{product_id}.json` followed by `POST /v1/shops/{shop_id}/products/{product_id}/publish.json` to push to Etsy; pressing publish (or calling that endpoint) flips the product to **`is_locked: true`** and emits the `product:publish:started` webhook event until the channel confirms. **A `PUT` to a locked product fails with HTTP 400, error code 8252 "Product is disabled for editing."** Treat that as an in-flight publish lock: re-read the product, wait for `is_locked` to clear, then retry — rather than treating it as a permanent failure. For API/custom-channel publish flows, Printify documents `POST .../publishing_succeeded.json` and `POST .../publishing_failed.json` as the status endpoints that remove the locked state; use them only when the channel publish outcome is known, not as a blind workaround for native Etsy publish failures. Tag-only sweeps that ignore the title field leave the title untouched (a tag operation never edits the title), so title and tag remediation are two separate edits.

**Full publish can overwrite channel edits.** Printify Help warns that republishing can sync/overwrite product information on the sales channel. Use **selective publishing** when the seller has custom Etsy-side photos, titles, descriptions, pricing, tags, shipping profiles, or mockups that must be preserved — select only the details that should sync; after changing variants, make sure mockups/images sync for new variants or upload them manually.

**A publish can FAIL for reasons beyond the lock — read the failure, don't blind-retry.** For Printify→Etsy, check these before assuming an API outage: an **un-activated Etsy shop or expired/disconnected Etsy connection**, an **unsupported/unresolvable calculated-shipping profile**, a **deactivated/expired Etsy listing**, **Vacation Mode or an inaccessible shop**, **prohibited title characters or trailing spaces**, a **price below Etsy's listing minimum** (Printify cites the ~$0.20 publishing-fee floor — verify current), or **exceeding Etsy's variation/choice limits** (Etsy Open API third-variation support does not automatically mean every POD channel flow supports every variation shape). When a publish fails, read the **`publishing_failed` reason** and fix the specific cause.

**Multi-Product Listings (MPL) change the listing-quality math.** Printify's Etsy MPL feature combines several Printify products into one Etsy listing at no extra duplicate-listing fee, with one title/description/tag set and multiple product options. This consolidates traffic, reviews, and sales into one listing, but concentrates risk: title, tags, mockups, variants, and out-of-stock state must be maintained at the combined-listing level, and a single member product going **out of stock can trigger a republish/relist** of the combined listing — which Printify says does not sync automatically without republishing, and which can **reset listing recency** and disturb ranking. Treat MPL stock changes as listing-level events, not silent inventory updates.

**Shipping price is a ranking/visibility lever — and a POD trap.** Etsy favours free/low shipping and, for US domestic listings, listings with shipping **over roughly $6 can appear lower** in US search; a **free-shipping guarantee** (free shipping on US orders/items of **$35 or more**) can provide US-search priority placement. Treat both the $6 shipping-price issue and the $35 guarantee as Etsy visibility + seller-economics inputs, not automatic universal rank guarantees. **POD sellers using *calculated* shipping routinely exceed the $6 line without noticing**, so audit the shipping profile on every POD-managed listing — a great title on a $9-shipping listing still loses rank.

**Printful and other POD tools still inherit Etsy limits.** For Printful-managed Etsy tags, public Help says Etsy supports up to 13 unique tags and that a tag over 20 characters can surface as an **Etsy client exception** — do not assume silent truncation or silent dropping; reconcile the live Etsy listing fields after publishing.

## Philosophy of the skill

This skill exists to make agents apply Etsy through its declared scope, coverage, exclusions, and verification checks instead of relying on generic model memory. The useful behavior is specific: recognize the right task, follow the skill's operating guidance, and prove the result with the listed checks.

## Verification
- Confirm the listing is actually an Etsy listing. If the task is Shopify, Amazon, eBay, Google SEO, or POD product modeling, route elsewhere.
- Verify title length is ≤140 characters, but optimize for **clarity, not max length**: prefer a concise, natural-language title that names the item and front-loads its objective traits; move gift/aspirational/secondary modifiers to tags, attributes, or description. Do not keyword-stuff to "game position" — position does not by itself affect ranking.
- Verify **no tag exceeds 20 characters (spaces included)**, no more than **13 tags** are present, and every tag is accurate, distinct, and buyer-relevant — checking the **live Etsy listing fields**, not just that the upstream POD store accepted them.
- Verify category and attributes are filled as specifically and completely as the product truth allows; do **not** duplicate exact category/attribute phrases as standalone tags unless there is a real phrase-level reason.
- Verify the **description's first sentences** identify the product and naturally include important search language without copying the title verbatim, and that the first **~150–160 characters** read well standalone (they become the Google search-result preview).
- Verify photos and video as conversion assets: primary photo clear, high-resolution (≥2000px), finished product, no collage; up to 20 photos when useful; **one video only**, current 5–15s listing-form limit (verify the live minimum), **no audio after upload**, ≤100 MB, acceptable format, suitable resolution (≥500px, 1080px+ ideal). Check the live upload form before treating aspect ratio as a hard rejection reason.
- Use the listing's **Search Visibility page** as the first-party diagnostic source of truth, and allow **~24 hours** for an edit to reflect there before concluding it failed. Verify Search Visibility issues before treating low visibility as a keyword-only problem.
- Verify **shipping visibility inputs**: US domestic shipping prices above ~$6 can lower eligible listings, while a $35 free-shipping guarantee can provide US-search priority — account for margin and buyer total price before changing prices/profiles. On POD listings, confirm calculated shipping has not pushed the listing over the line.
- Verify **Etsy Ads, Etsy Plus, and Star Seller** are not being misread as direct organic rank levers: Ads occupy labeled ad placements; Etsy Plus does not influence search placement; Star Seller is a trust/conversion signal, not a direct ordering factor.
- Verify **re-indexing and learning windows**: a newly published listing may take up to ~48 hours to appear in search/categories; Search Visibility improvements may take ~a day to reflect; engagement changes need enough traffic to interpret.
- Verify **personalization** before concluding "rank changed": compare shop stats and query traffic rather than relying on logged-in self-search or one device.
- For **Etsy Open API** work, inspect current endpoint/schema details with the official docs or Etsy Dev MCP Server — especially listing inventory/variation shape (third-variation readiness by June 1, 2026), OAuth scopes, and title character constraints — before hard-coding a cached shape.
- For **Printify-managed listings**: re-read the Printify product after update; publish selectively when preserving Etsy-side fields; handle HTTP 400 / code 8252 "Product is disabled for editing" as a temporary `is_locked` publish-state failure; use `publishing_succeeded.json` / `publishing_failed.json` only for API publish flows where the outcome is known; on a publish failure read the `publishing_failed` reason and fix the specific cause; for an MPL, check whether an out-of-stock member triggered a republish that reset recency; and verify the final live Etsy listing rather than trusting the upstream edit's 200 response.
- A **drop in impressions** after an edit can be Etsy's re-indexing lag, a relevancy loss from removing a matched phrase, or a shipping/quality-signal change — verify against the listing's own pre-edit tag/title/shipping set (and the Search Visibility page) before attributing it to the algorithm.

## Do NOT Use When

- The work is generic keyword research, seed expansion, search-intent mapping, clustering, cannibalization detection, or rank-tracking methodology. Use `keywords`; this skill applies chosen terms to Etsy listing constraints and diagnoses them via Etsy's own surfaces — it consumes keyword research, it does not produce it.
- The work is generic Shopify storefront SEO (theme, `seo.title`/`seo.description`, Liquid, Online Store 2.0, Shopify Admin/Storefront API, Shopify webhooks). Use `shopify` — Etsy's algorithm and limits do not apply there.
- The task is creating or maintaining the Printify/Printful product model itself: blueprints, print providers, variants, print areas, product creation, order routing, or the POD publish-webhook plumbing. Use `printify` or a provider-specific skill; this skill covers only the Etsy-listing side of that boundary.
- The marketplace is Amazon, eBay, Walmart, TikTok Shop, or another channel. Their keyword/title/backend-term policies and ranking signals differ from Etsy's 13-tag/20-char model (e.g. Amazon's 250-byte backend terms). Use a channel-specific skill or `keywords`.
- The task is generating print artwork, mockup source files, PNG/SVG exports, DPI handling, colour profiles, or design variants. That is a graphics/production-art task, not an Etsy task.
- The user needs legal advice about whether a product is handmade, vintage, infringing, unsafe, or allowed for sale. Use current Etsy policies and escalate where appropriate.

## Sources

Use official vendor docs first; verify against these before relying on a cached figure:

- Etsy Seller Handbook — *"New Guidance for Listing Titles, and a Tool to Help"* (2026 natural-title guidance; AI title tool): https://www.etsy.com/seller-handbook/article/1399426136697
- Etsy Seller Handbook — *Keywords 101* (tags; title position does not affect ranking; description keyword guidance): https://www.etsy.com/seller-handbook/article/keywords-101-everything-you-need-to-know/382774281517
- Etsy Seller Handbook — *How Etsy Search Works* (two-phase model; holistic query matching; context-specific ranking): https://www.etsy.com/seller-handbook/article/how-etsy-search-works/375461474487
- Etsy ranking disclosures (legal policy): https://www.etsy.com/legal/policy/search-advertisement-recommendation/899478564529
- Etsy Help — *How to Use Tags to Get Found in Search*: https://help.etsy.com/hc/en-us/articles/360000336307-How-to-Use-Tags-to-Get-Found-in-Search
- Etsy Help — *How to Create a Listing* (photo/title/tag/attribute limits): https://help.etsy.com/hc/en-us/articles/115015628707-How-to-Create-a-Listing?segment=selling
- Etsy Help — *How to Use the Etsy Search Visibility Page* (first-party diagnostic): https://help.etsy.com/hc/en-in/articles/25869947521175-How-to-Use-the-Etsy-Search-Visibility-Page
- Etsy Help — *How to Ship Your Items on Etsy* (US shipping-price visibility): https://help.etsy.com/hc/en-us/articles/360035901534-How-to-Ship-Your-Items-on-Etsy
- Etsy Help — *How to Offer Free Shipping* ($35 free-shipping guarantee): https://help.etsy.com/hc/en-us/articles/360024198553-How-to-Offer-Free-Shipping?segment=selling
- Etsy Help — *How to Add a Listing Video* (video spec): https://help.etsy.com/hc/en-us/articles/360053206073-How-to-Add-a-Listing-Video
- Etsy Help — *SEO for Shop and Listing Pages* (Google snippet / first ~160 chars): https://help.etsy.com/hc/en-us/articles/115015663987-Search-Engine-Optimization-SEO-for-Shop-and-Listing-Pages?segment=selling
- Etsy Dev MCP Server: https://developers.etsy.com/documentation/mcp_server/devmcpserver/
- Etsy Open API — *Third Variation* tutorial (June 1, 2026 readiness): https://developers.etsy.com/documentation/tutorials/third-variation/
- Printify API reference (product update / publish / `publishing_succeeded` / `publishing_failed`; error code 8252): https://developers.printify.com/API-Doc-RREdits.html
- Printify Help — *Selective publishing*: https://help.printify.com/hc/en-us/articles/4483629961489-How-do-I-use-selective-publishing-on-my-sales-channels
- Printify Help — *Why was my product information overwritten*: https://help.printify.com/hc/en-us/articles/4483630521105-Why-was-my-product-information-overwritten
- Printify Help — *Why can't I publish my products to Etsy* (publish-failure causes): https://help.printify.com/hc/en-us/articles/4483617102097-Why-can-t-I-publish-my-products-to-Etsy
- Printify Help — *How can I create a Multi-Product Listing on Etsy* (MPL republish behaviour): https://help.printify.com/hc/en-us/articles/45606975744529-How-can-I-create-a-Multi-Product-Listing-on-Etsy

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `product-domain`
- Public: `true`
- Domain: `ecommerce/marketplaces/etsy`
- Scope: Applying chosen keywords and merchandising decisions to Etsy listing fields — title, the 13 tags, category/attributes, description, photos, and listing video — and diagnosing an Etsy listing's search performance through Etsy's own first-party surfaces (the per-listing Search Visibility page, shop stats, and engagement rate). Includes the Etsy Open API listing surface and the special case where the listing's source of truth is an upstream print-on-demand platform (Printify/Printful) reached through an asynchronous, lock-gated, selectively-publishable lifecycle, and the translation/verification boundary between the POD product's fields and the live Etsy listing's indexed fields. Explicitly EXCLUDES keyword-research methodology (seed expansion, clustering, intent mapping, rank tracking), artwork/print-file generation, the POD product/blueprint/variant model itself, generic web SEO, and any non-Etsy marketplace or Shopify storefront.

**When to use**
- Optimize an Etsy listing title, description, attributes, and 13 tags without exceeding the 20-character tag limit
- Diagnose why an Etsy listing gets impressions but low clicks or sales after a title/tag change
- Apply Etsy's 2026 title guidance while preserving useful search phrases in tags, descriptions, or attributes
- Edit a Printify-managed Etsy listing and republish without overwriting custom Etsy-side photos or titles
- Check whether an Etsy Open API listing client is ready for current listing inventory and variation behavior
- Triggers: `etsy`, `etsy seo`, `etsy listing`, `etsy tags`, `etsy search visibility`

**Not for**
- Research a full keyword universe and cluster search intent before any listing exists (use keywords)
- Edit a Shopify theme or Shopify SEO meta fields (use shopify)
- Create the Printify product, select blueprint/provider/variants, or handle Printify webhooks (use printify)
- Generate the PNG/SVG artwork that will be printed (graphics task)
- Optimize an Amazon or eBay listing (use a channel-specific skill)

**Related skills**
- Verify with: `keywords`, `printify`
- Related: `seo-strategy`, `printify`, `keywords`, `shopify`

**Grounding**
- Mode: `universal`
- Truth sources: `https://help.etsy.com/hc/en-us/articles/360000336307-How-to-Use-Tags-to-Get-Found-in-Search`, `https://help.etsy.com/hc/en-us/articles/115015628707-How-to-Create-a-Listing?segment=selling`, `https://www.etsy.com/seller-handbook/article/how-etsy-search-works/375461474487`, `https://www.etsy.com/legal/policy/search-advertisement-recommendation/899478564529`, `https://www.etsy.com/seller-handbook/article/1399426136697`, `https://www.etsy.com/seller-handbook/article/keywords-101-everything-you-need-to-know/382774281517`, `https://help.etsy.com/hc/en-in/articles/25869947521175-How-to-Use-the-Etsy-Search-Visibility-Page`, `https://help.etsy.com/hc/en-us/articles/360035901534-How-to-Ship-Your-Items-on-Etsy`, `https://help.etsy.com/hc/en-us/articles/360024198553-How-to-Offer-Free-Shipping?segment=selling`, `https://help.etsy.com/hc/en-us/articles/360053206073-How-to-Add-a-Listing-Video`, `https://help.etsy.com/hc/en-us/articles/115015663987-Search-Engine-Optimization-SEO-for-Shop-and-Listing-Pages?segment=selling`, `https://developers.etsy.com/documentation/mcp_server/devmcpserver/`, `https://developers.etsy.com/documentation/tutorials/third-variation/`, `https://developers.printify.com/API-Doc-RREdits.html`, `https://help.printify.com/hc/en-us/articles/4483629961489-How-do-I-use-selective-publishing-on-my-sales-channels`, `https://help.printify.com/hc/en-us/articles/4483630521105-Why-was-my-product-information-overwritten`, `https://help.printify.com/hc/en-us/articles/4483617102097-Why-can-t-I-publish-my-products-to-Etsy`, `https://help.printify.com/hc/en-us/articles/45606975744529-How-can-I-create-a-Multi-Product-Listing-on-Etsy`

**Keywords**
- `etsy seo`, `etsy tags`, `etsy listing`, `etsy title`, `etsy search ranking`, `etsy search visibility`, `etsy listing video`, `etsy open api`, `printify to etsy`, `etsy free shipping`

<!-- skill-graph-context:end -->
