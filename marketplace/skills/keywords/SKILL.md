---
name: keywords
description: "Use when doing keyword research, mapping search intent, building topical clusters, choosing terms for product or marketplace listings, detecting cannibalization, or translating query demand into page/listing targets. Covers seed expansion, intent classification, clustering, platform field translation for Etsy, Amazon, Shopify, SaaS/content sites, long-tail marketplace strategy, cannibalization resolution, and rank-tracking cadence. Do NOT use for building SEO pages or schema strategy (use `seo-strategy`), writing the finished prose (use `writing-humanizer`), or designing navigation/page hierarchy (use `information-architecture`). Do NOT use for build the SEO landing page, JSON-LD schema, and internal-linking plan from these keywords. Do NOT use for rewrite the product description so it sounds more human and on-brand. Do NOT use for design the site navigation and decide which categories become top-level menu items. Do NOT use for audit Core Web Vitals or crawlability problems."
license: MIT
compatibility: Portable keyword research and marketplace keyword-mapping guidance. Platform limits and field names can drift; verify against current marketplace docs before high-stakes listing work.
allowed-tools: Read Grep Bash
metadata:
  grounding: "{\"domain_object\":\"Keyword research, intent mapping, topical clustering, and marketplace/search field translation for public e-commerce, marketplace, SaaS, and content surfaces\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://help.etsy.com/hc/en-gb/articles/360000336307-How-to-Use-Tags-to-Get-Found-in-Search\",\"https://help.etsy.com/hc/en-us/articles/115015628707-How-to-Create-a-Listing\",\"https://sellercentral.amazon.com/seller-forums/discussions/t/923d53dc-a182-4475-a164-6b2500dbaf2d\",\"https://sellercentral.amazon.com/seller-forums/discussions/t/b2b15728-0d43-453e-974f-59eb63f73059/\",\"https://developers.google.com/search/docs/appearance/title-link\",\"https://developers.google.com/search/docs/appearance/snippet\",\"https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords\",\"https://help.shopify.com/en/manual/promoting-marketing/seo/seo-overview\"],\"failure_modes\":[\"keyword_stuffing_mistaken_for_strategy\",\"platform_field_limits_drift_silently\",\"marketplace_tags_padded_with_irrelevant_terms\",\"amazon_search_terms_repeat_title_or_brand_fields\",\"shopify_keyword_guidance_ignores_readability\",\"intent_mapping_skipped_before_page_or_listing_targeting\",\"cannibalization_collapses_distinct_search_intents\",\"rank_tracking_claims_made_without_baseline_or_cadence\",\"keyword_skill_overowns_seo_implementation_finished_prose_or_information_architecture\"],\"evidence_priority\":\"equal\"}"
  drift_check: "{\"last_verified\":\"2026-05-19\"}"
  schema_version: "8"
  version: "1.2.0"
  type: capability
  operation: know
  category: product
  subject: product-domain
  domain: product/search
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-19"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  comprehension_state: present
  stability: experimental
  keywords: "[\"keyword research\",\"keyword strategy\",\"search intent mapping\",\"keyword clustering\",\"topical cluster\",\"topic cluster\",\"seed keyword expansion\",\"long-tail keyword\",\"marketplace keyword optimization\",\"etsy tags\",\"amazon search terms\",\"amazon backend keywords\",\"shopify keywords\",\"google title link\",\"meta description keywords\",\"keyword cannibalization\",\"rank tracking cadence\",\"SERP overlap\",\"commercial investigation query\",\"transactional query\",\"informational query\",\"navigational query\",\"listing keyword field mapping\"]"
  triggers: "[\"keyword-skill\",\"keyword-research-skill\"]"
  examples: "[\"research keywords for a new product line before writing listings\",\"map these 80 queries into informational, transactional, navigational, and commercial-investigation intent\",\"cluster these search terms into pillar and support pages without cannibalizing the same query\",\"choose Etsy tags for a listing while respecting current tag limits and avoiding padding\",\"convert Amazon keyword research into title-safe terms and backend search terms without repetition\",\"decide whether a Shopify collection page or product page should target this keyword\",\"two pages rank for the same query in Search Console -- is that cannibalization or different intent?\",\"set up a rank tracking cadence after changing marketplace titles and tags\"]"
  anti_examples: "[\"build the SEO landing page, JSON-LD schema, and internal-linking plan from these keywords\",\"rewrite the product description so it sounds more human and on-brand\",\"design the site navigation and decide which categories become top-level menu items\",\"audit Core Web Vitals or crawlability problems\",\"prove that this exact marketplace listing will rank first after the keyword update\"]"
  relations: "{\"boundary\":[{\"skill\":\"seo-strategy\",\"reason\":\"seo-strategy owns page construction, schema markup, programmatic SEO, internal linking, and implementation strategy after keywords are selected; keywords owns research, clustering, intent mapping, and field translation before construction.\"},{\"skill\":\"writing-humanizer\",\"reason\":\"writing-humanizer owns the finished prose quality and AI-tell removal; keywords can supply target terms and intent but must not stuff or write the final copy.\"},{\"skill\":\"information-architecture\",\"reason\":\"information-architecture owns navigation, sitemap shape, page hierarchy, and content grouping; keywords may reveal demand but does not decide the IA alone.\"}],\"related\":[\"seo-strategy\",\"writing-humanizer\",\"information-architecture\"],\"verify_with\":[\"seo-strategy\",\"writing-humanizer\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  mental_model: "Keyword work is demand translation. Raw queries are evidence of language, intent, and platform constraints; the skill turns them into targetable clusters, page/listing assignments, and measurement baselines without pretending that keywords alone create rankings."
  purpose: "This skill prevents agents from jumping straight to generic SEO copy, stuffing repeated terms into marketplace fields, or targeting one query from multiple pages. It gives a repeatable process for finding search language, mapping intent, respecting platform fields, and measuring whether changes moved visibility."
  boundary: "This skill owns research, clustering, intent mapping, field translation, cannibalization detection, and tracking setup. It does not build SEO pages, write final listing or page prose, design navigation, diagnose technical SEO, guarantee rankings, or bypass current marketplace policy checks."
  analogy: "Keyword research is like translating customer demand into a shelf map: each phrase tells you where a shopper is looking, but the shelf still needs good products, labels, layout, and measurement."
  misconception: "The common mistake is treating keywords as magic words to repeat. Search systems reward relevance, clarity, and satisfaction signals; repeated or irrelevant terms can waste fields, confuse readers, and make pages compete with each other."
  concept: "{\"definition\":\"Keyword research is the practice of discovering search language, classifying the intent behind it, grouping related terms, assigning each group to the right page or listing surface, and tracking visibility after changes.\",\"mental_model\":\"Treat keywords as demand signals, not incantations. A query suggests intent, vocabulary, competition, and platform field constraints; the work is to translate that signal into one clear target per page or listing.\",\"purpose\":\"It helps agents and teams choose what to target before building pages or writing copy, avoid cannibalization, respect marketplace limits, and measure whether keyword changes improved discovery.\",\"boundary\":\"It does not implement SEO page architecture, write final copy, design information architecture, audit technical SEO, or promise ranking outcomes.\",\"taxonomy\":\"Core moves include seed expansion, query-source capture, volume/difficulty/context review, intent classification, SERP or marketplace result inspection, semantic clustering, page/listing assignment, platform field translation, cannibalization checks, and rank tracking.\",\"analogy\":\"It is a shelf map for demand: it shows which aisle shoppers search in and what label they expect, but it does not manufacture the product or guarantee the sale.\",\"misconception\":\"More keywords is not better. Better means the right query language mapped to the right surface with readable, policy-safe, non-duplicative usage.\"}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/product-domain/keywords/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

# Keywords

## Coverage

Keyword work starts before writing or page building. This skill covers:

- Seed expansion: turning product, audience, competitor, and problem language into candidate queries.
- Intent mapping: classifying terms as informational, navigational, transactional, or commercial investigation.
- Clustering: grouping related terms by meaning, shared results, and target surface so one page or listing owns one primary intent.
- Platform field translation: mapping query language into Etsy tags/titles, Amazon titles/search terms, Shopify page fields, and SaaS/content page targets.
- Long-tail strategy: finding specific marketplace and product phrases where relevance is stronger than raw volume.
- Cannibalization detection: finding cases where two owned surfaces compete for the same intent.
- Tracking methodology: choosing a baseline, cadence, and platform-specific measurement surface after keyword changes.

## Philosophy

Keywords are not ranking spells. They are evidence of how people describe a need, what stage of the buying or learning journey they are in, and which surface can answer that need best. A good keyword pass reduces ambiguity: one query cluster, one intent, one owner surface, one measurement plan.

Agents often make three mistakes without this discipline. First, they stuff repeated terms into titles or tags instead of choosing precise phrases. Second, they copy web SEO rules into marketplace fields where character, byte, and matching rules differ. Third, they let multiple pages chase the same query, splitting relevance and making tracking unreadable.

The right move is translation: query language becomes a target map, not a paragraph full of repeated words.

## Boundary Routing

| User need | Use | Why |
|---|---|---|
| Research, cluster, and map keywords before content or listings are written | `keywords` | This skill owns demand language and target assignment. |
| Build SEO pages, schema, internal links, programmatic templates, or AI-search strategy | `seo-strategy` | SEO strategy owns implementation after target terms and intent are known. |
| Rewrite the final page, listing, error, or doc prose | `writing-humanizer` | Writing quality and tone are downstream of the keyword map. |
| Decide navigation, sitemap, category hierarchy, or page grouping | `information-architecture` | Search demand can inform IA, but IA owns findability and structure. |

## 1. Keyword Research Process

### Seed, Expand, Cluster, Map

| Phase | Goal | Evidence to collect | Output |
|---|---|---|---|
| Seed | Identify 5-15 starting concepts | Product names, user language, support questions, competitor titles, internal search, marketplace autocomplete | Seed list with source notes |
| Expand | Grow into a wider candidate set | Keyword tools, marketplace autocomplete, Search Console, ads terms, related searches, questions, reviews | Candidate list with rough demand and competition signals |
| Cluster | Group terms by shared meaning and likely result set | SERP or marketplace overlap, modifiers, synonyms, audience/occasion/product attributes | Topic clusters with one primary term and supporting terms |
| Intent map | Decide what the searcher wants | Query wording, current results, marketplace category, funnel stage | Intent label plus target surface |
| Assign | Give every cluster one owner | Existing pages/listings, planned pages/listings, canonical URLs | Keyword map with no duplicate primary targets |
| Track | Establish visibility baseline | Rank tool, Search Console, marketplace rank, impressions/clicks | Baseline and re-check date |

### Search Intent Types

| Intent | Signal words | Best target | Example |
|---|---|---|---|
| Informational | how, what, why, guide, tutorial, ideas | Guide, article, FAQ, documentation | "how to clean a wool rug" |
| Navigational | brand, login, app, dashboard, support | Homepage, app page, support page | "brand shipping policy" |
| Transactional | buy, order, coupon, price, near me | Product page, collection, marketplace listing | "buy waterproof picnic blanket" |
| Commercial investigation | best, vs, review, comparison, alternative | Comparison page, roundup, buyer guide | "best print on demand providers for mugs" |

Do not assign a target until intent is clear. A single phrase can change owner depending on results: "custom mug ideas" likely wants inspiration; "custom mug bulk order" likely wants a transactional page.

## 2. Platform Field Translation

Platform fields are not interchangeable. Translate the same keyword cluster differently depending on where the buyer searches.

| Platform | Primary fields | Current public constraints to verify | Practical rule |
|---|---|---|---|
| Etsy | Listing title, category, attributes, tags | Etsy listing titles can be up to 140 characters; Etsy supports up to 13 tags per listing, and each tag can contain up to 20 characters. | Use accurate multi-word tags when they fit; do not pad irrelevant tags just to fill space. |
| Amazon | Product title, bullets, product description, generic search terms/search terms | Amazon announced 2025 title requirements where most categories may not exceed 200 characters including spaces; Amazon search terms are limited to 250 bytes in the public Seller Central forum guidance. | Keep titles readable and product-specific; use search terms for generic synonyms not already captured in title, brand, or other fields. |
| Shopify | Product/collection titles, title tags, meta descriptions, URLs, image alt text, product and collection copy | Shopify recommends adding keywords in readable, natural phrases and lets merchants edit title tags, meta descriptions, URLs, and alt text. Google has no fixed title/meta-description character limit but truncates snippets as needed. | Prefer collection pages for broad commercial terms and product pages for specific long-tail terms; keep titles and descriptions human-readable. |
| SaaS/content site | Page title, H1, headings, URL slug, body copy, internal links, meta description | Google recommends descriptive, concise title text, unique descriptions, no keyword stuffing, and page-specific summaries. | One primary intent per page; supporting terms belong naturally in headings, examples, and related sections. |

### Etsy Rules

- Use tags as phrases, not isolated fragments, when the phrase reflects how a shopper searches.
- Etsy allows up to 13 tags per listing; use the available slots only when the terms are accurate and distinct.
- Each Etsy tag has a 20-character limit, so choose compact buyer language over long keyword strings.
- Do not repeat the same concept across title, tags, and attributes unless repetition adds a real matching path.
- Include audience, occasion, material, style, use case, and product type when those details are true.

### Amazon Rules

- Keep the product title specific to the product and within current category policy.
- Treat the 200-character title ceiling as a maximum for most categories, not as a writing target.
- Use backend/search terms for discoverability words that are generic, relevant, and not already captured elsewhere.
- Stay within the 250-byte search-term constraint; bytes are not the same as characters for all languages.
- Separate search-term words with spaces; punctuation and stop words usually waste budget.
- Do not repeat title words, brand terms, or other redundant information in search terms.

### Shopify and Google Organic Rules

- Add keywords in readable phrases and sentences. Random keyword strings are bad UX and may be ignored by search engines.
- Use collection pages for broader product-category demand when the collection can satisfy the query.
- Use product pages for specific attributes, models, variants, themes, or audience/occasion searches.
- Make `<title>` text descriptive and concise; avoid stuffing and boilerplate.
- Make meta descriptions page-specific and useful. They are snippet candidates, not ranking guarantees.

## 3. Long-Tail Strategy

Long-tail terms are useful when specificity increases match quality. They are especially valuable for marketplaces, product catalogs, and niche content because they encode product type, audience, style, occasion, material, or problem.

Pattern:

```text
[modifier] + [theme/problem] + [product or page type] + [audience/occasion]
```

Examples:

| Weak head term | Stronger long-tail target | Why it is better |
|---|---|---|
| "mug" | "sarcastic camping mug gift for dad" | Names theme, product, audience, and occasion. |
| "blanket" | "waterproof picnic blanket for beach" | Names attribute, use case, and setting. |
| "invoice software" | "invoice software for freelance designers" | Names category and audience. |
| "running shoes" | "wide trail running shoes for muddy paths" | Names fit, activity, and terrain. |

Long-tail does not mean every modifier belongs in the title. Use the full phrase to choose the target, then distribute true details across the appropriate fields.

## 4. Clustering and Topical Authority

### Pillar-Cluster Model

```text
Pillar: "Print on Demand Guide"
  - Cluster: "POD pricing strategy"
  - Cluster: "How to design for POD"
  - Cluster: "Best POD providers compared"
  - Cluster: "POD profit margins explained"
  - Cluster: "Start a POD business on Etsy"
```

Rules:

1. One cluster owns one primary intent.
2. The pillar targets broad understanding; cluster pages target specific sub-intents.
3. Every cluster links back to the pillar, and the pillar links to all clusters.
4. Two cluster pages must not target the same primary keyword unless they intentionally serve different intent.
5. Marketplace listings can cluster too: one design family can split by product type, audience, or occasion when each listing is genuinely distinct.

### Cluster Types

| Type | Purpose | Example |
|---|---|---|
| Topic cluster | Build authority around a broad subject | "e-commerce analytics" pillar plus reporting, attribution, and cohort articles |
| Product cluster | Cover variations of one product type | "custom mugs" with ceramic, travel, gift, and bulk-order pages |
| Comparison cluster | Own "X vs Y" or "best X for Y" demand | "Printify vs Printful" and "best POD providers for hats" |
| Question cluster | Capture informational queries | "How does POD work?" FAQ or explainer hub |

## 5. Cannibalization Detection

Keyword cannibalization happens when two or more owned surfaces compete for the same query and same intent. It is not a problem when different surfaces satisfy different intents for the same head term.

### Detection Protocol

1. Export query data from Search Console, marketplace analytics, ads reports, or rank tracking.
2. Group by query and primary intent.
3. Flag queries where two or more URLs/listings get similar impressions or ranks for the same intent.
4. Inspect the current results: if the same result set appears for both targets, the surfaces may be competing.
5. Decide whether the surfaces should merge, differentiate, canonicalize, redirect, noindex, or remain separate.

### Resolution Options

| Strategy | Use when | Action |
|---|---|---|
| Merge | Two thin pages/listings target the same intent | Combine useful content into one stronger target. |
| Redirect | One web page is clearly obsolete or weaker | 301 to the canonical target. |
| Differentiate | Both targets are useful but blurred | Give each a distinct intent, audience, or modifier. |
| Canonical | Duplicate or near-duplicate web variants exist | Canonical to the primary version. |
| Noindex | Low-value filter/tag page competes with a real page | Remove the low-value page from indexable search. |
| Leave alone | Same head term, different searcher intent | Track separately and document the distinction. |

## 6. Tracking Methodology

Ranking claims need a baseline and a re-check window. "Improved keywords" is not evidence unless visibility, impressions, clicks, rank, or marketplace listing quality changed.

| Surface | Useful measurement | Cadence |
|---|---|---|
| Google / Shopify / SaaS | Search Console impressions, clicks, CTR, average position; rank tracker for priority terms | Baseline before change; re-check 2-4 weeks after recrawl; monthly portfolio review |
| Etsy | Listing stats, query terms where available, marketplace rank checks, tag/listing quality tooling | Baseline before edit; re-check after marketplace re-indexing; monthly review |
| Amazon | Search term performance, Brand Analytics when available, keyword rank, sessions, conversion | Baseline before edit; re-check after indexing; monthly review |
| Content clusters | Target page traffic, internal-link clicks, query spread, cannibalization flags | Monthly cluster review; quarterly gap analysis |

Track only terms tied to a decision. If a term does not affect a page/listing assignment, title/tag/search-term field, or content plan, it is research noise.

## 7. Anti-Patterns

| Anti-pattern | Why it fails | Correct approach |
|---|---|---|
| Keyword stuffing | Repetition makes titles and snippets worse and can look spammy. | Use a few precise terms naturally. |
| Field copying | Pasting the same phrase into title, tags, description, and backend fields wastes constrained space. | Give each field a distinct job. |
| Platform flattening | Applying Google SEO limits to Etsy or Amazon ignores marketplace-specific fields. | Translate by platform. |
| Volume worship | High-volume head terms are often too broad or too competitive. | Balance demand with relevance, intent, and achievable surface. |
| Orphan clusters | Keyword clusters with no owner page/listing never become usable. | Assign every cluster or discard it. |
| Unmeasured edits | No baseline means no evidence of improvement. | Capture current rank/impressions/listing stats before changing fields. |
| Cannibalization by enthusiasm | Creating a new page for every synonym splits authority. | Cluster synonyms and give one canonical owner. |

## Public Grounding

Verify high-stakes platform work against current docs before applying. As of the 2026-05-19 audit:

- Etsy Help: tags support up to 13 tags per listing and 20 characters per tag; listing titles can be up to 140 characters.
- Amazon Seller Central public guidance: search terms are limited to 250 bytes; 2025 title guidance says most categories may not exceed 200 characters including spaces.
- Google Search Central: title links and snippets are generated automatically; use descriptive, concise titles, unique descriptions, and avoid keyword stuffing.
- Shopify Help: add keywords in readable, natural phrases; Shopify lets merchants edit title tags, meta descriptions, URLs, and alt text.

These are grounding points, not permanent invariants. Re-check them when platform policy matters.

## Verification

- [ ] Every keyword cluster has one primary intent and one owner page/listing.
- [ ] Supporting terms are distinct synonyms or modifiers, not repeated filler.
- [ ] Etsy tags are accurate phrases, each within current character limits, and irrelevant padding was avoided.
- [ ] Amazon search terms stay within current byte limits and do not repeat title, brand, or other captured fields.
- [ ] Shopify and Google web guidance uses readable phrases, unique titles/descriptions, and no keyword stuffing.
- [ ] Cannibalization check was run before creating a new page/listing for a synonym cluster.
- [ ] Rank/impression/listing baseline was captured before edits and a re-check date was set.
- [ ] Final prose, page construction, and IA decisions were handed to `writing-humanizer`, `seo-strategy`, or `information-architecture` as appropriate.

## Do NOT Use When

| Use instead | When |
|---|---|
| `seo-strategy` | You need to build pages, schema markup, internal links, programmatic SEO templates, or AI-search implementation. |
| `writing-humanizer` | You need the final listing, page, doc, or marketing prose written or edited for tone/readability. |
| `information-architecture` | You need navigation, sitemap, category hierarchy, page grouping, or wayfinding decisions. |
| Current platform docs | You need legally or commercially sensitive marketplace compliance decisions. |
