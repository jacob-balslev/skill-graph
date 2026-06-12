---
name: keywords
description: "Use when doing keyword research, evidence-quality triage of keyword sources, query normalization, mapping search intent, building topical clusters, choosing terms for product or marketplace listings, researching question/answer-intent and entity demand for AI search (AEO/GEO), detecting cannibalization, or translating query demand into page/listing targets. Covers seed expansion, intent classification, clustering, entity/topic research, platform field translation for Etsy, Amazon, Shopify, SaaS/content sites, long-tail marketplace strategy, marketplace semantic-intent (Amazon COSMO/Rufus) checks, cannibalization resolution, and rank/AI-citation tracking cadence. Do NOT use for building SEO pages, schema strategy, or AI-search content implementation (use `seo-strategy`), writing the finished prose (use `writing-humanizer`), or designing navigation/page hierarchy (use `information-architecture`). Do NOT use for build the SEO landing page, JSON-LD schema, and internal-linking plan from these keywords."
license: MIT
compatibility: "Portable keyword research and marketplace keyword-mapping guidance. Platform limits and field names can drift; verify against current marketplace docs (Seller Central, Etsy Help, Search Console) before high-stakes listing work."
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"related\":[\"seo-strategy\",\"writing-humanizer\",\"information-architecture\",\"etsy\"],\"verify_with\":[\"seo-strategy\",\"writing-humanizer\"]}"
  subject: knowledge-organization
  scope: "Keyword research, evidence-quality triage, query normalization, search-intent mapping, question/answer-intent and entity research for AI search (AEO/GEO), topical clustering, product/listing target assignment, marketplace field translation, marketplace semantic-intent (Amazon COSMO/Rufus) checks, cannibalization detection, and rank/AI-citation tracking cadence for public ecommerce, marketplace, SaaS, and content surfaces. Portable across projects, but external platform constraints drift and must be verified against current official docs before high-stakes listing or SEO work. Excludes SEO implementation, schema strategy, and AI-search content implementation (seo-strategy), final prose writing (writing-humanizer), and navigation/page hierarchy (information-architecture)."
  public: "true"
  taxonomy_domain: product/search
  stability: experimental
  keywords: "[\"keyword research\",\"search intent mapping\",\"keyword clustering\",\"topical cluster\",\"seed keyword expansion\",\"long-tail keyword\",\"marketplace keyword optimization\",\"keyword cannibalization\",\"rank tracking cadence\",\"AI search keyword research\"]"
  triggers: "[\"keyword-skill\",\"keyword-research-skill\"]"
  examples: "[\"research keywords for a new product line before writing listings\",\"map these 80 queries into informational, transactional, navigational, and commercial-investigation intent\",\"cluster these search terms into pillar and support pages without cannibalizing the same query\",\"choose Etsy tags for a listing while respecting current tag limits and avoiding padding\",\"convert Amazon keyword research into title-safe terms and backend search terms without repetition\",\"decide whether a Shopify collection page or product page should target this keyword\",\"two pages rank for the same query in Search Console -- is that cannibalization or different intent?\",\"set up a rank tracking cadence after changing marketplace titles and tags\",\"find the question-based and entity queries my pages should answer to show up in AI Overviews and assistant answers\"]"
  anti_examples: "[\"build the SEO landing page, JSON-LD schema, and internal-linking plan from these keywords\",\"rewrite the product description so it sounds more human and on-brand\",\"design the site navigation and decide which categories become top-level menu items\",\"audit Core Web Vitals or crawlability problems\",\"prove that this exact marketplace listing will rank first after the keyword update\"]"
  grounding: "{\"subject_matter\":\"Keyword research, evidence-quality triage, intent mapping, topical clustering, question/entity research for AI search, marketplace semantic-intent (Amazon COSMO/Rufus) checks, and marketplace/search field translation for public e-commerce, marketplace, SaaS, and content surfaces\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://help.etsy.com/hc/en-us/articles/360000336307-How-to-Use-Tags-to-Get-Found-in-Search\",\"https://help.etsy.com/hc/en-us/articles/115015628707-How-to-Create-a-Listing\",\"https://www.etsy.com/seller-handbook/article/1399426136697\",\"https://help.etsy.com/hc/en-us/articles/25869947521175-How-to-Use-the-Etsy-Search-Visibility-Page\",\"https://sellercentral.amazon.com/seller-forums/discussions/t/b2b15728-0d43-453e-974f-59eb63f73059\",\"https://sellercentral.amazon.com/help/hub/reference/external/GYTR6SYGFA5E3EQC?locale=en-US\",\"https://sellercentral.amazon.com/help/hub/reference/external/G23501?locale=en-US\",\"https://sellercentral.amazon.com/help/hub/reference/external/GF2C2L6RCFZGWBXC?locale=en-US\",\"https://www.amazon.science/publications/cosmo-a-large-scale-e-commerce-common-sense-knowledge-generation-and-serving-system-at-amazon\",\"https://www.amazon.science/blog/building-commonsense-knowledge-graphs-to-aid-product-recommendation\",\"https://developers.google.com/search/docs/appearance/title-link\",\"https://developers.google.com/search/docs/appearance/snippet\",\"https://developers.google.com/search/docs/appearance/ai-features\",\"https://developers.google.com/search/docs/fundamentals/ai-optimization-guide\",\"https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords\",\"https://help.shopify.com/en/manual/promoting-marketing/seo/seo-overview\"],\"failure_modes\":[\"keyword_stuffing_mistaken_for_strategy\",\"platform_field_limits_drift_silently\",\"marketplace_tags_padded_with_irrelevant_terms\",\"amazon_search_terms_repeat_title_or_brand_fields\",\"amazon_byte_overflow_unindexes_backend_terms\",\"shopify_keyword_guidance_ignores_readability\",\"intent_mapping_skipped_before_page_or_listing_targeting\",\"raw_queries_overwritten_by_normalized_clusters\",\"model_generated_terms_mistaken_for_measured_demand\",\"ai_search_visibility_promised_without_reporting_surface\",\"marketplace_semantic_intent_reduced_to_exact_match\",\"cannibalization_collapses_distinct_search_intents\",\"rank_tracking_claims_made_without_baseline_or_cadence\",\"keyword_skill_overowns_seo_implementation_finished_prose_or_information_architecture\"],\"evidence_priority\":\"equal\"}"
  mental_model: "Keyword work is demand translation. Raw queries are evidence of language, intent, and platform constraints; the skill turns them into validated, targetable clusters, page/listing assignments, and measurement baselines without pretending that keywords alone create rankings. In AI search, the unit of demand is shifting from the exact keyword string toward the underlying question, entity, and topic — but the translation discipline is the same: rank evidence by provenance, map demand to the surface best able to satisfy it, then measure. Generated phrases remain hypotheses until a higher-tier source confirms them."
  purpose: "This skill prevents agents from jumping straight to generic SEO copy, laundering AI-generated term lists into fake demand, stuffing repeated terms into marketplace fields, or targeting one query from multiple pages. It gives a repeatable process for finding search language, validating evidence, mapping intent, respecting platform fields, and measuring whether changes moved visibility — including visibility inside AI Overviews and assistant answers, where a high-volume term can now drive zero clicks."
  concept_boundary: "This skill owns research, evidence triage, clustering, intent mapping, question/entity research, field translation, cannibalization detection, and tracking setup. It does not build SEO pages, structure on-page answer content for AEO/GEO, write final listing or page prose, design navigation, diagnose technical SEO, guarantee rankings or AI citations, or bypass current marketplace policy checks."
  analogy: "Keyword research is like translating customer demand into a shelf map: each phrase tells you where a shopper is looking, but the shelf still needs good products, labels, layout, and measurement."
  misconception: "The common mistake is treating keywords as magic words to repeat — or treating an LLM's generated phrase list as demand. Search systems — classic and AI — reward relevance, clarity, entity consistency, and satisfaction signals; repeated, irrelevant, or unverified terms can waste fields, confuse readers, and make pages compete with each other."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/knowledge-organization/keywords/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

# Keywords

## Concept of the skill

Keyword work is demand translation. Raw queries are evidence of language, intent, and platform constraints; the skill turns them into targetable clusters, page/listing assignments, and measurement baselines without pretending that keywords alone create rankings. In AI search, the unit of demand is shifting from the exact keyword string toward the underlying question, entity, and topic — but the translation discipline is the same: rank evidence by provenance, map demand to the surface best able to satisfy it, then measure.

## Coverage

Keyword work starts before writing or page building. This skill covers:

- Seed expansion: turning product, audience, competitor, and problem language into candidate queries.
- Intent mapping: classifying terms as informational, navigational, transactional, or commercial investigation.
- Evidence-quality triage: ranking keyword sources by reliability before trusting volume, competition, or suggested phrases, so observed demand is never confused with a model's guess.
- Query normalization: preserving raw queries while grouping variants, misspellings, synonyms, locales, and branded/non-branded language into useful decision records.
- Question and entity research: surfacing the who/what/when/where/why/how questions and the named entities behind a topic, so pages and listings can be found by AI answer engines as well as classic search.
- SERP and marketplace-result validation: checking the current result set, page/listing type, and platform-native signals before assigning intent or owner surface.
- Clustering: grouping related terms by meaning, shared results, and target surface so one page or listing owns one primary intent.
- Platform field translation: mapping query language into Etsy tags/titles, Amazon titles/search terms, Shopify page fields, and SaaS/content page targets.
- Marketplace semantic-intent checks: capturing implied use cases, buyer questions, compatibility, and product claims for intent-based marketplace discovery (e.g. Amazon COSMO/Rufus) without pretending exact-match repetition is enough.
- Long-tail strategy: finding specific marketplace and product phrases where relevance is stronger than raw volume.
- Cannibalization detection: finding cases where two owned surfaces compete for the same intent.
- Query value re-weighting: prioritizing clusters by demand, click-or-citation potential, conversion fit, owner fit, and evidence confidence instead of raw volume alone.
- Tracking methodology: choosing a baseline, cadence, and platform-specific measurement surface — including AI-citation/visibility signals — after keyword changes.

## Philosophy of the skill
Keywords are not ranking spells. They are evidence of how people describe a need, what stage of the buying or learning journey they are in, and which surface can answer that need best. A good keyword pass reduces ambiguity: one query cluster, one intent, one owner surface, one measurement plan.

Agents often make three mistakes without this discipline. First, they stuff repeated terms into titles or tags instead of choosing precise phrases. Second, they copy web SEO rules into marketplace fields where character, byte, and matching rules differ. Third, they let multiple pages chase the same query, splitting relevance and making tracking unreadable.

A fourth mistake is now common in 2026: treating a keyword's raw search volume as its value when most searches end with zero clicks. A fifth, sharpened by AI research tools, is laundering an LLM's generated term list into "demand" it never measured. The right move is still translation — query language becomes a target map, not a paragraph full of repeated words — but the map now weighs question/answer intent, entity coverage, click-or-citation potential, and evidence provenance alongside volume.

## Boundary Routing

| User need | Use | Why |
|---|---|---|
| Research, cluster, and map keywords (including question/entity research) before content or listings are written | `keywords` | This skill owns demand language and target assignment. |
| Build SEO pages, schema, internal links, programmatic templates, or AI-search (AEO/GEO) content structuring | `seo-strategy` | SEO strategy owns implementation after target terms and intent are known. |
| Rewrite the final page, listing, error, or doc prose | `writing-humanizer` | Writing quality and tone are downstream of the keyword map. |
| Decide navigation, sitemap, category hierarchy, or page grouping | `information-architecture` | Search demand can inform IA, but IA owns findability and structure. |
| Apply the keyword map to live Etsy fields / diagnose Etsy Search Visibility | `etsy` | `keywords` produces the demand map and evidence; `etsy` owns final Etsy field application and platform-specific diagnostics. |

## 1. Keyword Research Process

### Seed, Expand, Cluster, Map

| Phase | Goal | Evidence to collect | Output |
|---|---|---|---|
| Seed | Identify 5-15 starting concepts | Product names, user language, support questions, competitor titles, internal search, marketplace autocomplete | Seed list with source notes |
| Entity research | Identify the named entities a topic depends on | Brand/product/person/place/attribute associations, knowledge-graph signals, related concepts | Entity map (concepts and relationships) |
| Expand | Grow into a wider candidate set | Keyword tools, marketplace autocomplete, Search Console, ads terms, related searches, "People also ask" questions, conversational/AI-assistant follow-up prompts, reviews | Candidate list with rough demand and competition signals |
| Cluster | Group terms by shared meaning and likely result set | SERP or marketplace overlap, query fan-out (sub-topics an AI answer covers), modifiers, synonyms, audience/occasion/product attributes | Topic clusters with one primary term and supporting terms |
| Intent map | Decide what the searcher wants | Query wording, current results, marketplace category, funnel stage, implied/"common-sense" need | Intent label plus target surface |
| Assign | Give every cluster one owner | Existing pages/listings, planned pages/listings, canonical URLs | Keyword map with no duplicate primary targets |
| Track | Establish visibility baseline | Rank tool, Search Console, marketplace rank, impressions/clicks, AI-citation/visibility checks | Baseline and re-check date |

### Evidence Quality Ladder

Not all "keyword data" is equal, and the biggest failure mode for an AI agent doing this work is treating its own generated term list as if it were measured demand. Rank evidence by provenance and never silently blend tiers:

| Tier | Source | Trust | Rule |
|---|---|---|---|
| 1 — First-party measured | Your own Search Console, marketplace search-term reports (Amazon Search Query Performance, Etsy Search Analytics), internal site search, ads search-term reports | Highest — real queries that reached *your* surfaces, though biased toward your current catalog and brand strength | Anchor targeting and cannibalization decisions here whenever the data exists; remember it can miss future products/markets. |
| 2 — Platform-native | Marketplace autocomplete, "People also ask", related searches, Google Suggest, platform keyword tools | High — real platform behavior, but discovery evidence, not your conversion data or proof of volume | Use to expand and validate; record locale/surface; confirm intent against current results. |
| 3 — Third-party estimates | External keyword tools' volume/difficulty numbers (Ahrefs, Semrush, Helium10, etc.) | Medium — directional only; vendors disagree and numbers drift | Treat volume as relative ordering, never an exact figure; never the sole basis for a target. |
| 4 — Model-generated hypotheses | Terms an LLM (including this agent) or a query fan-out brainstorms without a data source | Lowest — plausible language, **not** evidence of demand | Mark as hypotheses; promote to a target only after validation against a higher tier. |

Two preservation rules:

- **Preserve the raw query.** Keep the exact searcher phrasing alongside any normalized/clustered form. Normalization for clustering must never overwrite the original wording — the raw query is the evidence; the cluster label is your interpretation.
- **Record the tier.** Each candidate carries its provenance tier so a downstream reviewer can see whether a target rests on measured demand or on an unvalidated guess. A Tier-4 term presented as if it were Tier-1 demand is the core hallucination risk this ladder exists to stop. If a term cannot be traced to a source, keep it in a `hypothesis` bucket instead of assigning it to a page/listing.

### Intent Validation Rules

Intent is not decided from wording alone. Before assigning a cluster:

1. Inspect the current result set or marketplace results for the query in the target locale.
2. Note the dominant surface type: guide, product page, collection, category, marketplace listing, comparison page, support page, video, local pack, forum, or AI answer.
3. Treat a query as mixed when the result set is split across incompatible surface types.
4. Assign the owner only after the target surface can satisfy the dominant intent better than the alternatives.
5. Re-check intent after major platform changes, seasonal shifts, or when Search Console query groups change.

Use wording as the first clue; use result-set fit as the decision.

### Output Format: The Query Map

The deliverable of a keyword pass is not a flat list of terms — it is a structured **query map**, one row per candidate, so a downstream agent or human can act on it without re-deriving the research. A flat list hides provenance, intent, ownership, and measurement; the map makes each of them an explicit, checkable column.

| Column | Holds | Why it must survive |
|---|---|---|
| Raw query | The exact searcher phrasing, verbatim (spelling, pluralization, locale, punctuation) | The evidence; never overwritten by normalization (see the preservation rules above). |
| Normalized query | The cleaned/stemmed grouping label for variants and close synonyms | Your interpretation, kept distinct from the raw evidence. |
| Modifier facets | The named facets the term carries (product type, material, audience, occasion, problem, use case, compatibility, style, locale) | Makes the long-tail structure explicit and prevents inventing facets the target does not have. |
| Source | Where the term came from (Search Console, autocomplete, tool, competitor listing, review, model) | Lets a reviewer trace the claim. |
| Evidence tier / strength | 1–4 from the Evidence Quality Ladder | Flags Tier-4 model guesses so they are not actioned as measured demand. |
| Locale / surface | Language, market, and platform the demand is for (e.g. `en-US` / Etsy) | Demand and field rules differ by market and platform; a term valid on one is not portable to all. |
| Intent | Informational / navigational / transactional / commercial investigation / mixed | Drives the owner-surface choice. |
| Owner surface | The one page or listing assigned the cluster's primary intent (or discard / no target) | Enforces "one cluster, one owner"; surfaces cannibalization at authoring time. |
| Baseline metric | The pre-change rank/impressions/listing stat captured before edits (or "none yet") | Ranking-change claims are unfalsifiable without it. |
| Re-check date | When the baseline will be re-measured (after crawl, index, or enough traffic) | Closes the tracking loop; "improved keywords" is not evidence until this fires. |

Example row:

| Raw query | Normalized query | Modifier facets | Source | Tier | Locale / surface | Intent | Owner surface | Baseline metric | Re-check date |
|---|---|---|---|---|---|---|---|---|---|
| "mens wide hiking boots" | wide hiking boots mens | product: boots; audience: mens; attribute: wide; activity: hiking | Search Console | 1 | en-US / web | transactional | /mens-wide-boots | 150 impr/mo | 2026-07-01 |

A row missing `owner surface`, `baseline metric`, or `re-check date` is a research note, not a target — promote it only when those are filled.

### Search Intent Types

| Intent | Signal words | Best target | Example |
|---|---|---|---|
| Informational | how, what, why, guide, tutorial, ideas | Guide, article, FAQ, documentation | "how to clean a wool rug" |
| Navigational | brand, login, app, dashboard, support | Homepage, app page, support page | "brand shipping policy" |
| Transactional | buy, order, coupon, price, near me | Product page, collection, marketplace listing | "buy waterproof picnic blanket" |
| Commercial investigation | best, vs, review, comparison, alternative | Comparison page, roundup, buyer guide | "best print on demand providers for mugs" |

Do not assign a target until intent is clear. A single phrase can change owner depending on results: "custom mug ideas" likely wants inspiration; "custom mug bulk order" likely wants a transactional page.

**Conversational / answer-seeking phrasing is not a separate intent type.** A conversational query like "what are the best waterproof hiking boots for wide feet?" still expresses one of the four intents above (here, commercial investigation). Use query fan-out to *discover* these conversational and AEO-triggering variants, then map each back to its underlying intent rather than creating a fifth category.

### Zero-Click Value Adjustment

A keyword's strategic value is no longer its search volume alone. With AI Overviews and assistant answers now resolving a large share of queries on the results page, definitional and FAQ-style terms with high volume often drive few clicks, while product, local, and transactional terms with moderate volume convert better than their volume suggests. When prioritizing, weight each cluster by **demand × click-or-citation potential**, not demand alone:

- **High volume, low click-through** (definitional, "what is X") — worth covering for AI-answer visibility and topical authority, but do not let raw volume promote it above commercial intent.
- **Moderate volume, high click-through** (product, comparison, "buy/near me", branded) — usually the higher-value target even at lower volume.
- Treat exact-volume figures from any keyword tool as estimates; the relative ordering and the intent matter more than the headline number.

Score priority clusters qualitatively against these factors (there is no per-query "zero-click probability" number any platform exposes — do not invent a formula):

| Factor | Ask |
|---|---|
| Demand | Is there evidence people search the term or close variants? |
| Click potential | Does the result set still send users to pages/listings, or does it mostly answer the query directly? |
| Citation potential | Could a strong owned surface be cited, summarized, compared, or recommended in AI-search or shopping-assistant surfaces? |
| Conversion fit | Does the query imply a buyer, lead, signup, or useful next action? |
| Owner fit | Can one existing or planned surface satisfy the dominant intent without cannibalization? |
| Evidence confidence | Is the term supported by first-party/platform data, or only by modeled/tool/AI output? |

The practical rule is qualitative: a broad definitional term may deserve a support article or FAQ, but it should not outrank a moderate-volume query with clearer commercial intent and measurable owner fit.

## 2. Platform Field Translation

Platform fields are not interchangeable. Translate the same keyword cluster differently depending on where the buyer searches.

| Platform | Primary fields | Current public constraints to verify | Practical rule |
|---|---|---|---|
| Etsy | Listing title, category, attributes, tags | Etsy listing titles can be up to 140 characters; Etsy's current guidance favors clear, human-readable titles and says search evaluates the whole listing (title, tags, attributes, description, photo, reviews, shop signals) — title *placement* does not affect ranking, but leading terms are what shoppers see on mobile and in Google previews. Etsy supports up to 13 tags per listing, each tag up to 20 characters (spaces count; multi-word phrases allowed). | Write a clear human-first title and lead it with the primary keyword for shopper readability (not for a ranking boost); use all 13 tag slots with accurate multi-word phrases that fit 20 chars; fill attributes; do not pad irrelevant tags. |
| Amazon | Product title, bullets, product description, generic/backend search terms | Amazon 2025 title guidance (effective Jan 21, 2025): most categories may not exceed 200 characters including spaces, some special characters are restricted, and no word may repeat more than twice (prepositions/articles/conjunctions excepted). Backend "generic keywords" are limited by **bytes, not characters** — community and Amazon-staff guidance reports ~249 bytes in the US field (ASCII = 1 byte; accented/non-Latin characters cost 2+). Official docs state the limit without always publishing the exact number, so verify the live field; exceeding it can leave the backend terms unindexed. | Keep titles readable and product-specific; use backend search terms for generic synonyms not already in title/brand/bullets/description; count bytes (not characters) and stay safely under the live limit. |
| Shopify | Product/collection titles, title tags, meta descriptions, URLs, image alt text, product and collection copy | Shopify recommends readable, natural keyword phrases; it lets merchants enter up to ~70 characters for page titles (recommends ≤60 to avoid truncation) and recommends natural meta descriptions around ~160 characters. Google has no fixed `<title>`/meta-description length limit but truncates snippets. | Prefer collection pages for broad commercial/category terms (much higher volume; an empty collection above the grid cannot rank — add unique descriptive copy) and product pages for specific long-tail terms; keep titles and descriptions human-readable. |
| SaaS/content site | Page title, H1, headings, URL slug, body copy, internal links, meta description | Google recommends descriptive, concise title text, unique descriptions, no keyword stuffing, and page-specific summaries; AI features (AI Overviews) reuse the same indexed, well-structured content and need no special AI-only markup, chunking, or files. | One primary intent per page; supporting terms belong naturally in headings, examples, and related sections. (How the on-page answer is structured for AEO/GEO is `seo-strategy` and `writing-humanizer` work, not this skill's.) |

### Etsy Rules

- Write human-first titles. Etsy's search uses natural-language understanding, so robotic exact-match stuffing ("Blue Mug, Ceramic Mug, Gift Mug") is not rewarded and wastes the title.
- Lead the 140-character title with the primary keyword for shopper readability, not for a ranking boost: Etsy's current guidance states that *where* a term appears in the title does not affect listing ranking, but the leading words are the slice shown on mobile search and Google previews — so put the most decision-relevant terms first.
- Use tags as phrases, not isolated fragments, when the phrase reflects how a shopper searches.
- Etsy allows up to 13 tags per listing — use **all 13** slots when the terms are accurate and distinct (most sellers leave slots empty or repeat title phrases, wasting matching paths). Use them for synonyms, recipients, materials, and occasions rather than repeating title words.
- Each Etsy tag has a 20-character limit (spaces count toward it), so choose compact buyer language over long keyword strings.
- Fill the listing's attributes completely. They act as structured data and power category and gift filters, often matching more reliably than free-text tags.
- Do not repeat the same concept across title, tags, and attributes unless repetition adds a real matching path.
- Include audience, occasion, material, style, use case, and product type when those details are true.
- Treat Etsy's AI title-recommendation tools as a first-party *suggestion* surface, not authority: before accepting suggestions, preserve useful existing search phrases in tags/description/attributes, apply changes to a small sample when risk is high, and re-check stats after enough time. When the work is live Etsy field application or Search Visibility diagnostics, hand off to the `etsy` skill — this skill supplies the demand map and evidence.

### Amazon Rules

- Keep the product title specific to the product and within current category policy.
- Treat the 200-character title ceiling (most categories, including spaces) as a maximum, not a writing target.
- Follow Amazon's Jan 21, 2025 title-quality rules: most categories cap titles at 200 characters including spaces, restrict certain special characters (unless part of the brand name), and disallow repeating the same word more than twice (prepositions, articles, and conjunctions excepted). Verify the live category template — caps and allowed characters vary by category, and some enforce far shorter limits (e.g. 80–120 chars). Front-load the brand + main keyword + key differentiator for mobile visibility.
- Map intent, not just literal phrases: Amazon retrieval has two stages — candidate generation/matching still rewards the right literal terms being present in indexable fields, while the ranking layer (Amazon's publicly described "COSMO" common-sense knowledge system, surfaced through the Rufus shopping assistant) increasingly infers shopper intent and use-case fit. So the title/bullets must carry the precise literal terms AND describe the real use case and audience; do not assume exact-phrase stuffing alone wins ranking. (Treat the algorithm names as Amazon's described behavior, not a guaranteed internal spec; verify against current Seller Central guidance.)
- Capture **unspoken intent** as evidence. A query like "pregnant dress" implies an unmet need ("expandable waist"); a "toddler party dress" search implies "machine-washable" and "soft fabric". Record implied use cases, audiences, compatibility, occasions, constraints, and buyer questions (mined from reviews and Q&A) in the query map. This is *intent evidence* — translate it into accurate title/bullet language and product claims; place a term in backend search terms only when it is generic, accurate, and not already captured elsewhere. Capturing an implied need does not license stuffing it or inventing a claim.
- Count **bytes, not characters**: verify the live Seller Central backend "generic keywords" field (community/staff guidance reports ~249 bytes in the US). Overflowing the byte ceiling can prevent the backend terms from being indexed.
- Separate search-term words with single spaces. Amazon does **not** count spaces or punctuation toward the limit, and you do not need commas or other separators — extra punctuation earns no additional matches, so omit it.
- Do not repeat title words, brand terms, or other redundant information already captured in indexed fields in the search terms.

### Shopify and Google Organic Rules

- Add keywords in readable phrases and sentences. Random keyword strings are bad UX and may be ignored by search engines and AI models.
- Use collection pages for broader product-category demand when the collection can satisfy the query — category terms typically carry several times the volume of single-product terms, and an empty collection page above the grid cannot rank for them; add unique descriptive copy.
- Use product pages for specific attributes, models, variants, themes, or audience/occasion searches.
- Make `<title>` text descriptive and concise (Shopify recommends ≤60 chars within its ~70-char field); avoid stuffing and boilerplate. Stuffed, boilerplate, inaccurate, or unclear titles may be rewritten by Google in search results.
- Make meta descriptions page-specific and useful (~160 chars practical target), leading with the most important keyword and a reason to click. They are snippet candidates, not ranking guarantees.
- For AI Overviews / generative search (GEO): target the conversational long-tails and the sub-questions an AI answer fans out to, but remember Google says foundational SEO still applies and no special AI-only markup, chunking, or rewriting is required. Surface the entity and question demand here; leave on-page answer structuring to `seo-strategy` and `writing-humanizer`.

## 3. Long-Tail Strategy

Long-tail terms are useful when specificity increases match quality. They are especially valuable for marketplaces, product catalogs, and niche content because they encode product type, audience, style, occasion, material, or problem — and increasingly for conversational and AI-answer queries.

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
| "running shoes" | "what are the best wide trail running shoes for muddy paths" | Conversational phrasing; same intent, AI-answer-friendly. |

Long-tail does not mean every modifier belongs in the title. Use the full phrase to choose the target, then distribute true details across the appropriate fields.

### Modifier Facet Matrix

The failure mode when an agent expands a head term into long-tail is inventing modifiers that sound plausible but describe nothing the product or page actually offers. The guardrail is to expand only along **named facets**, and to attach a modifier only when it is *true* of the target. Each facet is a row; fill a cell only with an attribute that genuinely applies.

| Facet | Asks | Product / marketplace examples | SaaS / content examples |
|---|---|---|---|
| Product / page type | What kind of surface? | mug, tote, ring, planner, collection page | software, API, dashboard, integration, comparison guide |
| Attribute / spec | Measurable property? | waterproof, ceramic, 20oz, wide-fit, printable | automated, no-code, SOC 2, open source |
| Audience / recipient | Who is it for? | for dad, for nurses, for toddlers | for agencies, for finance teams, for developers |
| Occasion / job | When/why is it bought? | birthday, wedding, camping, back-to-school | onboarding, reporting, incident response, migration |
| Material / compatibility | Made of / works with? | sterling silver, cotton, A4, iPhone 17 | Slack, Shopify, Postgres, Next.js |
| Style / theme | What look or tone? | minimalist, vintage, sarcastic, luxury | lightweight, enterprise, visual, privacy-first |
| Problem / benefit | What job does it do? | leakproof, allergy-safe, travel-friendly | reduce churn, reconcile payouts, monitor uptime |
| Locale / market | Which market's language? | jewellery vs jewelry, UK spelling, US sizing | country-specific regulations, local terminology |

Two rules:

- **Expand by facet, validate by truth.** A modifier earns a place only if the product/page actually has that audience, occasion, material, etc. A facet cell with no true value stays empty — do not fill it to look complete (this is where Tier-4 hallucination creeps back in).
- **Cross-check against the Evidence Quality Ladder.** A facet-generated phrase is a Tier-4 hypothesis until validated against autocomplete, first-party search data, or a keyword tool; do not promote it to a target unvalidated.

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

A well-organized hub-and-spoke (pillar-cluster) structure is also how AI answer engines and featured snippets read topical authority: covering a topic's questions and entities completely, with consistent facts, is what makes a site a candidate to be summarized or cited. Cluster for authority, not just for individual rankings.

### Clustering Tests

A cluster is valid when the terms share both meaning and a plausible owner surface. AI-generated or tool-generated clusters are drafts — validate them against raw queries, current result sets, and owner-surface fit before publishing a keyword map.

| Test | Keep together when | Split when |
|---|---|---|
| Same-intent test | The searcher wants the same outcome. | One phrase wants education and another wants purchase or comparison. |
| Result-overlap test | The same pages/listings repeatedly appear for the terms. | The top result types differ by page/listing class. |
| Modifier-facet test | Modifiers describe compatible variants of one target. | Modifiers imply distinct products, audiences, locations, or compliance constraints. |
| Field-fit test | Supporting terms can fit naturally in headings, body, tags, attributes, or backend terms. | The terms require keyword stuffing or unrelated fields. |
| Measurement test | One baseline and cadence can judge the cluster. | Each term needs a different metric or platform surface. |

### Cluster Types

| Type | Purpose | Example |
|---|---|---|
| Topic cluster | Build authority around a broad subject | "e-commerce analytics" pillar plus reporting, attribution, and cohort articles |
| Product cluster | Cover variations of one product type | "custom mugs" with ceramic, travel, gift, and bulk-order pages |
| Comparison cluster | Own "X vs Y" or "best X for Y" demand | "Printify vs Printful" and "best POD providers for hats" |
| Question cluster | Capture informational and AI-answer queries | "How does POD work?" FAQ or explainer hub answering the topic's who/what/why questions directly |

### Entity Consistency

AI answer engines lose confidence when a brand's facts are inconsistent across surfaces (different hours, names, prices, or descriptions on different sites) and may omit the brand rather than risk a wrong answer. When keyword research surfaces the entities a topic depends on — brand, product, person, place, attribute — flag that those entities must be described consistently wherever they appear. Naming the inconsistency is in scope; fixing the on-page schema/markup is `seo-strategy`'s job.

## 5. Cannibalization Detection

Keyword cannibalization happens when two or more owned surfaces compete for the same query and same intent. It is not a problem when different surfaces satisfy different intents for the same head term. With zero-click AI answers now common, the subtler version is collapsing several *distinct* conversational intents into one overly broad page.

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

## AI-Era Keyword Research

Current AI tools (deep-research agents, web-search tools, marketplace and Search Console AI grouping) improve discovery and synthesis, but they do not replace keyword research because they do not own platform demand data, marketplace policies, or first-party performance baselines.

Use AI agents and research tools for:

- Expanding seed concepts into candidate facets, synonyms, and conversational variants (query fan-out).
- Finding official platform docs and current policy changes.
- Summarizing competitor language from public pages/listings.
- Drafting clusters that a human or agent then validates against source data.
- Explaining why terms should be merged, split, discarded, or tracked.

Do not use AI agents or research tools for:

- Inventing search volume, conversion, rank, or competition figures.
- Treating generated phrases as evidence that buyers actually search them.
- Replacing Seller Central, Etsy/Shopify analytics, Search Console, Google Trends, ads query reports, or marketplace analytics.
- Creating pages for every query fan-out or AI-suggested variant.
- Promising AI Overview / AI Mode inclusion from keyword edits alone.

Google's current generative-search guidance says foundational SEO still applies, that query fan-out may issue related searches across subtopics, and that there is no need for special AI-only files, chunking, or rewriting. For keyword work the practical change is discovery breadth: capture conversational questions, follow-up phrasing, entities, and comparison dimensions, then cluster them by user need rather than making one page per generated variant.

## 6. Tracking Methodology

Ranking claims need a baseline and a re-check window. "Improved keywords" is not evidence unless visibility, impressions, clicks, rank, AI-citation share, or marketplace listing quality changed.

| Surface | Useful measurement | Cadence |
|---|---|---|
| Google / Shopify / SaaS | Search Console impressions, clicks, CTR, average position; rank tracker for priority terms | Baseline before change; re-check 2-4 weeks after recrawl; monthly portfolio review |
| AI search (AI Overviews, ChatGPT, Perplexity, Gemini) | Search Console's generative-AI performance report (impressions, pages, countries, devices, dates — note it does **not** currently break out by individual query); the classic Performance report for query-level data; spot-checks of whether priority questions surface/cite your pages; brand mention/visibility in generated answers; clicks/conversions attributed to AI-source referrers | Baseline before change; spot-check priority questions after publishing; monthly visibility review |
| Etsy | Listing stats, query terms where available, marketplace rank checks, tag/listing quality tooling | Baseline before edit; re-check after marketplace re-indexing; monthly review |
| Amazon | Search Query Performance, Brand Analytics when available, keyword rank, sessions, conversion, backend indexing status | Baseline before edit; re-check after indexing; monthly review |
| Content clusters | Target page traffic, internal-link clicks, query spread, cannibalization flags | Monthly cluster review; quarterly gap analysis |

Track only terms tied to a decision. If a term does not affect a page/listing assignment, title/tag/search-term field, or content plan, it is research noise. For AI-search visibility, treat presence/citation in answers and downstream conversions as the signal — classic rank position alone undercounts value when most searches are zero-click. Do not promote an "AI citation rate" as a standard platform metric; no major platform exposes one — use the available reports plus citation spot-checks and referrer data.

### Search Console Segmentation

When using Google Search Console data, segment before drawing conclusions:

| Segment | Why it matters | Where to read it |
|---|---|---|
| Branded vs non-branded | Branded queries inflate visibility and convert for reasons unrelated to keyword strategy; non-branded queries are the real test of whether content earns demand you do not already own. | The branded-queries filter / classic Performance report (this split is query-level). |
| Query groups | AI-grouped similar queries reveal intent families, but Google says the grouping is a high-level perspective that can evolve and does not affect ranking — it does not replace raw query inspection. | Search Console Insights / Performance; inspect the generated grouping before acting. |
| Page × query pairs | Cannibalization is visible only when the same query/intent spreads across multiple owner surfaces. | The classic Performance report (the generative-AI report has no individual-query dimension). |
| Country / language / device | Intent and wording differ by market and device. | Classic Performance report dimensions. |
| Generative-AI visibility | Reports impressions, pages, countries, devices, and dates for AI-feature surfaces — read at the page grain so a wrong-owner or thin-page problem is visible. | The generative-AI performance report (no query dimension; drop to the classic report for page × query diagnosis). |

If Search Console's AI-powered configuration or query groups are used, inspect the generated filters/grouping before acting. AI-assisted analysis reduces setup time; it does not remove the need to verify the query set and owner-surface decision.

## 7. Anti-Patterns

| Anti-pattern | Why it fails | Correct approach |
|---|---|---|
| Keyword stuffing | Repetition makes titles and snippets worse, looks spammy, and hurts conversion. | Use a few precise terms naturally; front-load mobile titles. |
| Field copying | Pasting the same phrase into title, tags, description, and backend fields wastes constrained space. | Give each field a distinct job. |
| Platform flattening | Applying Google SEO limits to Etsy or Amazon ignores marketplace-specific fields and algorithms. | Translate by platform. |
| Byte-blind Amazon fields | Counting characters instead of bytes can overflow the backend field and leave its terms unindexed. | Count bytes; verify the live limit and stay under it. |
| AI keyword laundering | A generated keyword list looks authoritative but has no demand source. | Mark generated terms as Tier-4 hypotheses until validated by platform/search evidence. |
| Intent by wording alone | The phrase suggests one intent, but the live result set shows another. | Validate priority clusters against current SERP or marketplace result types. |
| Query-group overtrust | Search Console or a tool groups variants with AI, then the agent treats the group as final. | Use grouped views for discovery, then inspect raw queries before assigning owners. |
| Brand/non-brand mixing | Branded traffic masks whether non-branded keyword work is improving. | Segment branded, non-branded, and mixed queries before judging progress. |
| Fan-out page spam | AI search suggests many related variants, and the agent makes one page per variant. | Cluster by user need and owner surface; avoid scaled low-value pages. |
| Amazon exact-match tunnel vision | The map repeats literal terms but misses use cases, compatibility, buyer questions, and claims that semantic marketplace systems infer. | Capture explicit and implied intent evidence, then translate it into accurate fields without stuffing. |
| Volume worship | High-volume head terms are often too broad, too competitive, or zero-click. | Balance demand with intent, click/citation potential, and achievable surface. |
| Orphan clusters | Keyword clusters with no owner page/listing never become usable. | Assign every cluster or discard it. |
| Unmeasured edits | No baseline means no evidence of improvement. | Capture current rank/impressions/listing stats before changing fields. |
| Cannibalization by enthusiasm | Creating a new page for every synonym splits authority. | Cluster synonyms and give one canonical owner. |
| AI-visibility blindness | Reporting only classic rank ignores zero-click AI answers where the value now sits. | Add AI-citation/visibility spot-checks to the tracking plan. |

## Public Grounding

Verify high-stakes platform work against current docs before applying. As of the 2026-06-11 review:

- **Etsy Help / Seller Handbook:** tags support up to 13 tags per listing and 20 characters per tag (spaces count; multi-word phrases allowed); listing titles can be up to 140 characters. Etsy's current guidance favors clear human-first titles and holistic listing understanding (title, tags, attributes, description, photo, reviews); title-term *placement* does not affect ranking, but leading terms are what shoppers see on mobile and in Google previews. Treat AI title-recommendation tools as suggestions to validate, not authority.
- **Amazon Seller Central:** the Jan 21, 2025 title policy says most categories may not exceed 200 characters including spaces, restricts some special characters, and bars repeating any word more than twice (except prepositions/articles/conjunctions). Backend "generic keywords" are limited by **bytes** (community/staff guidance reports ~249 bytes in the US field; verify the live field) — overflow can leave the terms unindexed. Amazon does not count spaces or punctuation toward the limit, so no commas/separators are needed. Capture COSMO/Rufus-style implied intent as evidence, not as license to stuff backend terms.
- **Google Search Central:** title links and snippets are generated automatically; use descriptive, concise titles, unique descriptions, and avoid keyword stuffing. AI features (AI Overviews) reuse the same indexed, well-structured content and need no special AI-only markup — so the question/entity coverage this skill identifies feeds AI-answer eligibility, while the on-page structuring of those answers is `seo-strategy`/`writing-humanizer` work. The generative-AI performance report breaks out by page/country/device/date but not by individual query.
- **Shopify Help:** add keywords in readable, natural phrases; Shopify lets merchants edit title tags (≤~70 chars, recommend ≤60), meta descriptions (~160 chars), URLs, and alt text; collection pages need unique above-the-grid copy to rank for higher-volume category terms.
- **AI-search context (2026):** a large and growing share of searches resolve with zero clicks via AI Overviews and assistants, so weight keyword value by intent and click/citation potential, not raw volume, and track answer-engine visibility alongside classic rank.

These are grounding points, not permanent invariants. Re-check them when platform policy matters.

## Verification

- [ ] Output is a structured query map (raw query, normalized query, modifier facets, source, evidence tier, locale/surface, intent, owner surface, baseline metric, re-check date), not a flat term list.
- [ ] Every keyword cluster has one primary intent and one owner page/listing.
- [ ] Every candidate carries its evidence tier; no model-generated (Tier-4) term was promoted to a target without validation against measured or platform-native data, and raw searcher phrasing was preserved alongside cluster labels.
- [ ] SERP or marketplace-result fit was checked for priority clusters before owner assignment.
- [ ] Long-tail modifiers were expanded by named facet and each is true of the target (no plausible-but-false modifiers).
- [ ] Supporting terms are distinct synonyms or modifiers, not repeated filler.
- [ ] Priority clusters were value-weighted by demand, click/citation potential, conversion fit, owner fit, and evidence confidence — not search volume alone.
- [ ] Question and entity coverage was considered for topics that surface in AI answers, and entity facts were flagged for cross-surface consistency.
- [ ] Etsy uses all relevant tag slots as accurate phrases within 20 chars each, fills attributes, and leads a clear human-first 140-char title with the primary keyword.
- [ ] Amazon search terms stay within the current byte limit (counted as bytes), use spaces (no commas) to separate, do not repeat title/brand/other captured fields; the title is within the 200-char ceiling, repeats no word more than twice, and carries the use-case/audience language the ranking layer infers intent from.
- [ ] Amazon priority clusters captured implied use cases, audiences, compatibility, constraints, and buyer questions where COSMO/Rufus-style semantic intent may matter.
- [ ] Shopify and Google web guidance uses readable phrases, unique titles/descriptions, collection pages have unique copy, and no keyword stuffing or AI-only markup was prescribed.
- [ ] Branded and non-branded query data were separated (in the classic Performance report) when Search Console data is available.
- [ ] Cannibalization check was run before creating a new page/listing for a synonym cluster.
- [ ] Rank/impression/listing baseline (and AI-visibility spot-check where relevant) was captured before edits and a re-check date was set.
- [ ] Final prose, page construction, AEO/GEO content structuring, and IA decisions were handed to `writing-humanizer`, `seo-strategy`, or `information-architecture` as appropriate.

## Do NOT Use When

| Use instead | When |
|---|---|
| `seo-strategy` | You need to build pages, schema markup, internal links, programmatic SEO templates, or AEO/GEO/AI-search content implementation. |
| `writing-humanizer` | You need the final listing, page, doc, or marketing prose written or edited for tone/readability. |
| `information-architecture` | You need navigation, sitemap, category hierarchy, page grouping, or wayfinding decisions. |
| `etsy` | You need to apply the keyword map to live Etsy listings or diagnose Etsy Search Visibility specifically. |
| Current platform docs | You need legally or commercially sensitive marketplace compliance decisions. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `knowledge-organization`
- Public: `true`
- Domain: `product/search`
- Scope: Keyword research, evidence-quality triage, query normalization, search-intent mapping, question/answer-intent and entity research for AI search (AEO/GEO), topical clustering, product/listing target assignment, marketplace field translation, marketplace semantic-intent (Amazon COSMO/Rufus) checks, cannibalization detection, and rank/AI-citation tracking cadence for public ecommerce, marketplace, SaaS, and content surfaces. Portable across projects, but external platform constraints drift and must be verified against current official docs before high-stakes listing or SEO work. Excludes SEO implementation, schema strategy, and AI-search content implementation (seo-strategy), final prose writing (writing-humanizer), and navigation/page hierarchy (information-architecture).

**When to use**
- research keywords for a new product line before writing listings
- map these 80 queries into informational, transactional, navigational, and commercial-investigation intent
- cluster these search terms into pillar and support pages without cannibalizing the same query
- choose Etsy tags for a listing while respecting current tag limits and avoiding padding
- convert Amazon keyword research into title-safe terms and backend search terms without repetition
- decide whether a Shopify collection page or product page should target this keyword
- two pages rank for the same query in Search Console -- is that cannibalization or different intent?
- set up a rank tracking cadence after changing marketplace titles and tags
- find the question-based and entity queries my pages should answer to show up in AI Overviews and assistant answers
- Triggers: `keyword-skill`, `keyword-research-skill`

**Not for**
- build the SEO landing page, JSON-LD schema, and internal-linking plan from these keywords
- rewrite the product description so it sounds more human and on-brand
- design the site navigation and decide which categories become top-level menu items
- audit Core Web Vitals or crawlability problems
- prove that this exact marketplace listing will rank first after the keyword update

**Related skills**
- Verify with: `seo-strategy`, `writing-humanizer`
- Related: `seo-strategy`, `writing-humanizer`, `information-architecture`, `etsy`

**Concept**
- Mental model: Keyword work is demand translation. Raw queries are evidence of language, intent, and platform constraints; the skill turns them into validated, targetable clusters, page/listing assignments, and measurement baselines without pretending that keywords alone create rankings. In AI search, the unit of demand is shifting from the exact keyword string toward the underlying question, entity, and topic — but the translation discipline is the same: rank evidence by provenance, map demand to the surface best able to satisfy it, then measure. Generated phrases remain hypotheses until a higher-tier source confirms them.
- Purpose: This skill prevents agents from jumping straight to generic SEO copy, laundering AI-generated term lists into fake demand, stuffing repeated terms into marketplace fields, or targeting one query from multiple pages. It gives a repeatable process for finding search language, validating evidence, mapping intent, respecting platform fields, and measuring whether changes moved visibility — including visibility inside AI Overviews and assistant answers, where a high-volume term can now drive zero clicks.
- Boundary: This skill owns research, evidence triage, clustering, intent mapping, question/entity research, field translation, cannibalization detection, and tracking setup. It does not build SEO pages, structure on-page answer content for AEO/GEO, write final listing or page prose, design navigation, diagnose technical SEO, guarantee rankings or AI citations, or bypass current marketplace policy checks.
- Analogy: Keyword research is like translating customer demand into a shelf map: each phrase tells you where a shopper is looking, but the shelf still needs good products, labels, layout, and measurement.
- Common misconception: The common mistake is treating keywords as magic words to repeat — or treating an LLM's generated phrase list as demand. Search systems — classic and AI — reward relevance, clarity, entity consistency, and satisfaction signals; repeated, irrelevant, or unverified terms can waste fields, confuse readers, and make pages compete with each other.

**Grounding**
- Mode: `universal`
- Truth sources: `https://help.etsy.com/hc/en-us/articles/360000336307-How-to-Use-Tags-to-Get-Found-in-Search`, `https://help.etsy.com/hc/en-us/articles/115015628707-How-to-Create-a-Listing`, `https://www.etsy.com/seller-handbook/article/1399426136697`, `https://help.etsy.com/hc/en-us/articles/25869947521175-How-to-Use-the-Etsy-Search-Visibility-Page`, `https://sellercentral.amazon.com/seller-forums/discussions/t/b2b15728-0d43-453e-974f-59eb63f73059`, `https://sellercentral.amazon.com/help/hub/reference/external/GYTR6SYGFA5E3EQC?locale=en-US`, `https://sellercentral.amazon.com/help/hub/reference/external/G23501?locale=en-US`, `https://sellercentral.amazon.com/help/hub/reference/external/GF2C2L6RCFZGWBXC?locale=en-US`, `https://www.amazon.science/publications/cosmo-a-large-scale-e-commerce-common-sense-knowledge-generation-and-serving-system-at-amazon`, `https://www.amazon.science/blog/building-commonsense-knowledge-graphs-to-aid-product-recommendation`, `https://developers.google.com/search/docs/appearance/title-link`, `https://developers.google.com/search/docs/appearance/snippet`, `https://developers.google.com/search/docs/appearance/ai-features`, `https://developers.google.com/search/docs/fundamentals/ai-optimization-guide`, `https://help.shopify.com/en/manual/promoting-marketing/seo/adding-keywords`, `https://help.shopify.com/en/manual/promoting-marketing/seo/seo-overview`

**Keywords**
- `keyword research`, `search intent mapping`, `keyword clustering`, `topical cluster`, `seed keyword expansion`, `long-tail keyword`, `marketplace keyword optimization`, `keyword cannibalization`, `rank tracking cadence`, `AI search keyword research`

<!-- skill-graph-context:end -->
