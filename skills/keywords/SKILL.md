---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: keywords
description: "Use when performing keyword research, building keyword strategy, optimizing product or marketplace listings, selecting terms for content, detecting cannibalization, or planning topical clusters. Covers seed expansion, intent mapping, topical clustering, marketplace keyword limits, long-tail POD/merch strategy, and tracking methodology. Do NOT use for full SEO implementation strategy (use `seo-strategy`), product copywriting (use `writing-humanizer`), or information architecture (use `information-architecture`)."
version: 1.0.0
type: capability
category: product
domain: product/overlay
scope: portable
owner: skill-graph-maintainer
freshness: "2026-03-28"
drift_check:
  last_verified: "2026-03-28"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
keywords:
  - "keyword research"
  - "keyword strategy"
  - "keyword clustering"
  - "long-tail keywords"
  - "etsy tags"
  - "amazon keywords"
  - "keyword cannibalization"
  - "search intent"
  - "topical authority"
  - "keyword tracking"
  - "rank tracking"
  - "SERP"
  - "seed keywords"
  - "keyword mapping"
triggers:
  - "keyword-skill"
  - "keyword-research-skill"
relations:
  related:
    - seo-strategy
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---
# Keyword Research & Strategy Skill

## Domain Context

**What is this skill?** This skill provides keyword research, clustering, and platform-specific keyword optimization for e-commerce and SaaS. Covers seed keyword expansion, search intent mapping (informational/navigational/transactional/commercial), keyword clustering for topical authority, marketplace-specific keyword rules (Etsy 13-tag limit and 140-char title priority, Amazon backend keywords and 250-byte limit, Shopify product/collection meta fields), long-tail strategy for POD/merch businesses, cannibalization detection, and keyword tracking methodology. Use when performing keyword research, building a keyword strategy, optimizing product listings for marketplace search, choosing keywords for new content, detecting keyword cannibalization, or planning topical clusters. Do NOT use for diagnosing existing SEO problems (use seo-audit), building optimized pages at scale (use seo-strategy), content writing (use copywriting), or site page hierarchy (use site-architecture).
## Key Files

| File | Purpose |
|---|---|
| `skills/keywords/references/marketplace-keyword-rules.md` | See for detailed per-platform rules. |
## Project-Specific Rules

This skill captures project-local rules and constraints that narrow or refine a broader pattern. Treat the repo-specific guidance and key files below as authoritative for this project.

## Coverage

Seed keyword expansion, search intent mapping (informational/navigational/transactional/commercial investigation), keyword clustering for topical authority (pillar-cluster model), marketplace-specific keyword rules (Etsy 13-tag limit and 140-char title priority, Amazon backend keywords and 250-byte limit, Shopify collection-page SEO priority), long-tail strategy for POD/merch businesses, cannibalization detection and resolution, keyword tracking methodology and tool selection by platform, and tracking cadence for rank monitoring.

## Philosophy

Keywords are the bridge between what a seller creates and what a buyer searches for. Without systematic keyword research, product listings and content pages either target terms that are too competitive (impossible to rank) or too generic (no buyer intent). For POD sellers in particular, each design is a unique product that must match a specific long-tail query. This skill exists because agents repeatedly make three mistakes without it: (1) suggesting single-word Etsy tags instead of multi-word phrases, (2) repeating title words in Amazon backend keywords (wasting the 250-byte limit), and (3) targeting head terms on Shopify product pages instead of routing generic keywords to collection pages.

> Research the right keywords before building pages or writing content.

## When to Use This Skill

Load this skill when:
- Performing keyword research for new products, pages, or content
- Building a keyword strategy for a Shopify store, Etsy shop, or Amazon listing
- Optimizing product listing titles and tags for marketplace search
- Planning topical clusters for a blog or content hub
- Detecting and resolving keyword cannibalization
- Setting up keyword rank tracking

Do NOT use for:
- Diagnosing why pages aren't ranking (use **seo-audit**)
- Building or optimizing pages at scale (use **seo-strategy**)
- Writing the actual content (use **copywriting**)
- Planning site page hierarchy (use **site-architecture**)

---

## 1. Keyword Research Process

### Seed -> Expansion -> Clustering -> Intent Mapping

| Phase | Goal | Method |
|-------|------|--------|
| **Seed** | Identify 5-15 core terms | Product names, competitor analysis, niche vocabulary |
| **Expansion** | Grow to 100-500 candidates | Tool-assisted: related terms, questions, long-tail variations |
| **Clustering** | Group by topic/intent | Semantic similarity, shared SERP overlap, parent-child relationships |
| **Intent Mapping** | Classify each cluster | Informational / Navigational / Transactional / Commercial Investigation |

### Search Intent Types

| Intent | Signal Words | Page Type | Example |
|--------|-------------|-----------|---------|
| **Informational** | how, what, why, guide, tutorial | Blog post, guide | "how to start a merch business" |
| **Navigational** | brand name, login, app | Homepage, product page | "printify dashboard" |
| **Transactional** | buy, order, price, discount, cheap | Product page, collection | "anti-trump t-shirt buy" |
| **Commercial Investigation** | best, vs, review, comparison, alternative | Comparison page, listicle | "printify vs printful for t-shirts" |

### Long-Tail Strategy for POD/Merch

POD sellers benefit disproportionately from long-tail keywords because:
1. Head terms ("t-shirt") are impossible to rank for
2. Long-tail captures buyer intent ("funny anti-trump gift for dad")
3. Each design is a unique product — match keyword to design theme
4. Lower competition = faster ranking on marketplace search

**Pattern:** `[adjective] + [topic/theme] + [product type] + [audience/occasion]`
Example: "sarcastic political humor coffee mug gift"

---

## 2. Platform-Specific Keyword Rules

See `references/marketplace-keyword-rules.md` for detailed per-platform rules.

### Quick Reference

| Platform | Title Limit | Tags/Keywords | Priority Rule |
|----------|------------|---------------|---------------|
| **Etsy** | 140 chars | 13 tags (multi-word phrases, no single words) | First 40 chars most visible in search |
| **Amazon** | 200 chars (80 optimal) | 250-byte backend keywords | Primary keyword at title start; backend = synonyms only |
| **Shopify** | 70 chars (SEO title) | Meta description + collection page copy | Google SEO rules apply; collection pages rank higher than products |
| **SaaS** | 50-60 chars | N/A (Google organic) | Target one primary keyword per page; use related terms naturally |

### Critical Platform Gotchas

- **Etsy:** Tags are multi-word phrases, NOT single words. "vintage coffee mug" is one tag. All 13 tag slots must be used.
- **Amazon:** Backend keywords have a 250-byte (not character) limit. No punctuation, no brand names, no ASINs. Only add synonyms — don't repeat title words.
- **Shopify:** Product pages are hard to rank on Google. Prioritize collection pages for generic keywords. Product pages target specific long-tail.

---

## 3. Keyword Clustering & Topical Authority

### Pillar-Cluster Model

```
Pillar Page: "Print on Demand Guide" (head term, 3000+ words)
  ├── Cluster: "POD Pricing Strategy" (commercial intent)
  ├── Cluster: "How to Design for POD" (informational)
  ├── Cluster: "Best POD Providers Compared" (commercial investigation)
  ├── Cluster: "POD Profit Margins Explained" (informational)
  └── Cluster: "Start POD Business on Etsy" (transactional)
```

**Rules:**
1. Each cluster targets one keyword group with shared intent
2. Every cluster page links back to the pillar
3. Pillar links out to all clusters
4. No two clusters should target the same primary keyword (cannibalization)

### Cluster Types

| Type | Purpose | Example |
|------|---------|---------|
| **Topic cluster** | Build authority on a broad subject | "e-commerce analytics" pillar |
| **Product cluster** | Cover variations of one product type | "custom mugs" with design/printing/shipping sub-topics |
| **Comparison cluster** | Own the "X vs Y" search space | "Printify vs Printful vs Gelato" |
| **Question cluster** | Capture informational queries | "How does POD work?" FAQ hub |

---

## 4. Cannibalization Detection

Keyword cannibalization: two or more pages on the same site compete for the same keyword, splitting authority and harming both.

### Detection Protocol

1. **Search Console check:** Export queries, sort by page. If 2+ URLs appear for the same query with similar impressions, it's cannibalized.
2. **SERP check:** Search `site:yourdomain.com "target keyword"` — if multiple results appear, confirm overlap.
3. **Intent check:** Do the two pages serve the same search intent? If yes = cannibalization. If different intents (one informational, one transactional) = acceptable.

### Resolution Options

| Strategy | When to Use |
|----------|------------|
| **Merge** | Two thin pages on the same topic — combine into one authoritative page |
| **Redirect** | One page is clearly weaker — 301 redirect to the stronger one |
| **Differentiate** | Both pages serve different intents — sharpen each page's keyword focus |
| **Canonical** | Duplicate content from variants/parameters — canonical tag to the primary |
| **Noindex** | Low-value duplicate (tag page, filter page) — noindex to remove from competition |

---

## 5. Keyword Tracking

### Tool Selection by Platform

| Platform | Recommended Tool | What It Tracks |
|----------|-----------------|----------------|
| **Etsy** | eRank, Marmalead, Alura | Tag performance, listing quality score, search rank |
| **Amazon** | Helium 10, Jungle Scout | Keyword rank, search volume, competitor keywords |
| **Shopify/SaaS** | Ahrefs, SEMrush, Google Search Console | Google rank, SERP features, CTR, impressions |
| **Cross-platform** | Google Trends | Relative demand, seasonality, geographic distribution |

### Tracking Cadence

- **Weekly:** Check rank movement for top 20 target keywords
- **Monthly:** Full keyword portfolio review (new opportunities, declining terms)
- **Quarterly:** Competitive keyword gap analysis
- **After changes:** Re-check ranks 2-4 weeks after title/tag optimizations (Etsy re-indexes in 4-6 weeks)

---

## Related Skills

- **seo-audit** — Diagnose why pages aren't ranking (technical + on-page audit)
- **seo-strategy** — Build optimized pages, programmatic SEO, schema markup, AI search
- **site-architecture** — Plan page hierarchy, navigation, URL structure
- **copywriting** — Write the actual content once keywords are chosen
- **seller-persona** — Understand which keywords matter for POD vs dropship vs inventory sellers

---

## Verification

After applying this skill, verify:
- [ ] Each keyword is mapped to a specific search intent (informational/navigational/transactional/commercial)
- [ ] Etsy tags are multi-word phrases (not single words) and all 13 slots are used
- [ ] Amazon backend keywords do not repeat title words and stay within 250-byte limit
- [ ] No two pages/listings target the same primary keyword (cannibalization check)
- [ ] Keyword clusters link back to their pillar page and pillar links to all clusters
- [ ] Platform-specific limits respected (Etsy 140-char title, Amazon 200-char title, Shopify 70-char SEO title)
- [ ] Long-tail keywords follow the `[adjective] + [topic/theme] + [product type] + [audience/occasion]` pattern

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Diagnosing why pages are not ranking | `seo-audit` | SEO audit covers technical SEO, crawlability, indexation, Core Web Vitals -- diagnostic problems, not keyword selection |
| Building optimized pages at scale | `seo-strategy` | SEO strategy owns page construction, schema markup, and programmatic SEO patterns |
| Writing the actual content for pages | `copywriting` | Copywriting owns tone, messaging, and content creation once keywords are chosen |
| Planning site page hierarchy and navigation | `site-architecture` | Site architecture owns URL structure, navigation taxonomy, and page-to-page relationships |
| Understanding the target buyer persona | `seller-persona` | Seller persona owns the business context that informs which keywords matter |

*Version 1.1.0 — 2026-03-28*
