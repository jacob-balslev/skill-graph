---
name: content-monitor
description: "Use when building or operating multi-source intelligence pipelines across video, GitHub, Reddit, curated lists, search, and RSS feeds. Covers source adapters, discovery/transcription/summarization/evaluation phases, deduplication, schedules, model-stage choice, and actionable brief generation. Do NOT use for SEO keyword research (use `keywords`) or competitive product analysis (use `user-research`)."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: agent-ops
  deployment_target: portable
  taxonomy_domain: agent/ops
  owner: skill-graph-maintainer
  freshness: "2026-03-28"
  drift_check: "{\"last_verified\":\"2026-03-28\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"content monitor\",\"github trending\",\"blog monitor\",\"intelligence brief\",\"youtube monitor\",\"awesome list\",\"trend tracking\",\"content pipeline\",\"content-monitor\",\"rss feed\"]"
  triggers: "[\"content-monitor-skill\",\"research-mode\"]"
  relations: "{\"boundary\":[\"keywords\",\"seo-strategy\"],\"verify_with\":[\"evaluation\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/agent-ops/content-monitor/SKILL.md
---
# Content Monitor

## Domain Context

**What is this skill?** This skill provides expertise for a multi-source intelligence pipeline covering YouTube channels, GitHub trending/topic/search feeds, Reddit subreddits, awesome-lists, Google Search, and RSS/Atom feeds (including Hacker News, changelogs, blogs, arXiv, and podcasts). Covers source adapter patterns, unified evaluation pipeline, deduplication, scheduling cadence, and actionable intelligence brief generation. Use when adding new content sources to the pipeline, configuring monitoring schedules, understanding the discover/transcribe/summarize/evaluate phases, extending or debugging the discovery pipeline, or deciding which model to use at each pipeline stage. Do NOT use for SEO keyword research — use the keywords skill. Do NOT use for competitive product analysis — use user-research-synthesis.

## Key Files

| File | Purpose |
|---|---|
| `scripts/content-monitor/sources.json` | Multi-source configuration for the live monitor pipeline. |
| `scripts/content-monitor/channels.json` | Legacy YouTube-channel configuration still referenced by the pipeline. |
| `.content-monitor/seen-items.json` | Persistent deduplication state. |
| `.content-monitor/backlog-evaluate-status.json` | Tracks historical scoring progress for batch backlog evaluation sweeps. |
| `.content-monitor/resume-status.json` | Catch-up sweep progress used by resume flows. |
## Workflow

Use the ordered phases, checklists, and guardrails in the sections below as the canonical workflow for this skill. When multiple subsections describe steps, follow them in the order presented.

## Coverage

The multi-source intelligence pipeline that tracks AI coding, e-commerce tooling, and agent infrastructure trends. Covers the live source groups configured in `scripts/content-monitor/sources.json` and `scripts/content-monitor/channels.json`, the 4-phase pipeline (Discover, Extract, Summarize, Evaluate), the MiniMax/GPT-5.4 model split, source adapter contract, deduplication via `seen-items.json` (at `.content-monitor/`), scheduling cadence per source type, evaluation rubric dimensions, and the daily digest output format. Source code lives at `scripts/content-monitor/`. State files live at `.content-monitor/` (the Development repo root).

## Philosophy

Staying current on AI tooling, agent patterns, and e-commerce integrations is essential for a system that competes on engineering velocity. Without this pipeline, the team would manually scan dozens of sources and miss emerging patterns that could inform skill creation, architecture decisions, or competitive positioning. The pipeline automates discovery and extraction (cheap) and reserves expensive model reasoning for evaluation (scarce), following the same constraint-awareness principle that governs the rest of the system.

### Location Precision

State persistence is critical for this pipeline. Always refer to:
- **Source code and configuration:** `scripts/content-monitor/` (discover-*.js, evaluate.js, sources.json, run.js)
- **State and results:** `.content-monitor/` at the Development root (seen-items.json, digests, logs, reports)

This separation keeps persistent state separate from executable code, ensuring deduplication survives code updates.

## 1. When This Skill Applies

| Use this skill for... | Use something else for... |
|---|---|
| Adding a new YouTube channel, GitHub topic, Reddit subreddit, or search source | SEO keyword research (use `keywords` skill) |
| Understanding why an extraction or summary is missing | Competitive product teardowns (use `user-research-synthesis`) |
| Configuring evaluation context or scoring dimensions | General web scraping patterns (use `backend` skill) |
| Diagnosing deduplication behaviour across source types | Monitoring application uptime or error rates |
| Scheduling or adjusting cadence for a source type | |

---

## 1.5. Important: State vs. Source Code Locations

This is a critical distinction that prevents bugs:

- **Source code** (scripts, adapters, runners): `scripts/content-monitor/`
- **State files** (persistent data, results): `.content-monitor/` at the Development repo root

The `seen-items.json` file used for deduplication MUST be read from and written to `.content-monitor/seen-items.json`, not `scripts/content-monitor/`. This is the single source of truth for what has already been processed.

---

## 2. Pipeline Architecture

The pipeline has 4 sequential phases. Each phase is independently runnable via `--discover-only`, `--skip-evaluate`, etc.

| Phase | Description | Primary tool |
|---|---|---|
| **Discover** | Source-specific adapters fetch new items (YouTube RSS, GitHub API, Reddit JSON) and write them to the state | Adapter scripts — see section 3.5 registry |
| **Extract** | Extract text content from each discovered item (YouTube: `yt-dlp` transcripts, GitHub: README extraction, Reddit: post body + comments) | `yt-dlp`, GitHub REST API, Reddit API |
| **Summarize** | MiniMax M2.5K produces structured JSON summaries from the extracted text | OpenRouter free tier (MiniMax M2.5K) |
| **Evaluate** | GPT-5.4 or Gemini-Flash scores summaries against the developer context and generates the actionable digest | GPT-5.4 via Copilot or Gemini-Flash |

### Why this model split matters

MiniMax M2.5K is free (200 req/day via OpenRouter) and handles the volume of extraction-to-summary work without cost. GPT-5.4/Gemini is reserved for the evaluation step where quality is the bottleneck — scoring relevance and generating insights that the developer will act on.

### Summary JSON schema (produced by Summarize phase)

Each summary contains:

```
keyFindings         — array of strings, concrete observations
toolsMentioned      — array of tool names
techniquesMentioned — array of technique names
actionableInsights  — array of strings, recommended actions
topicTags           — array of strings for deduplication grouping
oneLineSummary      — string, max 120 chars
estimatedRelevance  — integer 1-10, self-assessed by model
```

---

## 3. Source Types

| Type | Count | Example | Discovery Method | Frequency | Cost |
|---|---|---|---|---|---|
| YouTube Channel | 19 | IndyDevDan, Anthropic, Fireship | RSS feed XML | Daily | Free |
| GitHub Trending/Topic | 14 | github.com/trending, topics/ai-agents | HTML scrape + REST API | Daily/Weekly | Free |
| Reddit Subreddit | 12 | r/ClaudeCode, r/AI_Agents, r/vibecoding | JSON API | Daily | Free |
| Awesome List | 17 | awesome-claude-code, awesome-mcp-servers | README diff | Weekly | Free |
| Google Search | 6 | "multi-agent orchestration" | Custom Search API | Daily | Free (100/day) |
| Hacker News | 5 | Claude Code, MCP, AI agents | hnrss.org RSS | Daily | Free |
| Changelog | 11 | Claude Code releases, Vercel, Shopify | GitHub Atom + vendor RSS | On release | Free |
| Blog/Newsletter | 9 | Simon Willison, Latent Space, DEV.to | RSS/Atom | Daily | Free |
| arXiv Papers | 3 | cs.MA, cs.AI, cs.SE | RSS | Daily (weekdays) | Free |
| Podcast | 3 | Latent Space, Practical AI, SE Daily | RSS | Weekly | Free |
| Skills.sh | 1 | Global sitemap | XML sitemap | Weekly | Free |

---

## 3.5. Adapter Registry

Maps each source type (from section 3) to the adapter file that handles it. There is no 1-to-1 mapping — `discover-rss.js` consolidates five source types.

| Source Type | Adapter File | Notes |
|---|---|---|
| YouTube Channel | `discover.js` | **Primary** — legacy YouTube-specific adapter using RSS feed (`https://www.youtube.com/feeds/videos.xml?channel_id=...`) plus `yt-dlp` transcript backfill |
| YouTube Channel | `discover-rss.js` | **Also handles YouTube** via the same RSS endpoint; prefer `discover.js` for YouTube-specific features |
| GitHub Trending/Topic | `discover-github.js` | Scrapes `github.com/trending` HTML and calls GitHub REST API for topic pages |
| Reddit Subreddit | `discover-reddit.js` | Calls `https://www.reddit.com/r/<subreddit>.json` (unauthenticated) |
| Awesome List | `discover-awesome.js` | Fetches README.md, diffs against cached version, extracts new entries |
| Google Search | `discover-google.js` | Calls Google Custom Search API (100 req/day free tier) |
| Hacker News | `discover-rss.js` | Uses `hnrss.org` RSS feeds |
| Changelog | `discover-rss.js` | GitHub Atom feeds (`/releases.atom`) + vendor RSS |
| Blog/Newsletter | `discover-rss.js` | Standard RSS/Atom feeds |
| arXiv Papers | `discover-rss.js` | arXiv RSS export by category (e.g. `cs.MA`, `cs.AI`) |
| Podcast | `discover-rss.js` | Standard podcast RSS feeds |
| Skills.sh | `discover-skillssh.js` | Fetches and diffs the XML sitemap |

### Key architecture note

`discover-rss.js` is the generic RSS handler. It handles Hacker News, changelogs, blogs, arXiv, podcasts, and can also ingest YouTube RSS — but it lacks YouTube-specific features (transcript extraction, channel metadata). When adding a new RSS-based source, route it through `discover-rss.js`. When adding a YouTube channel, use `discover.js`.

**There is no `discover-youtube.js`.** Do not create one — YouTube RSS is already handled by `discover.js` with transcript support.

---

## 4. State Files

All state files live in `.content-monitor/` (the Development repo root directory), NOT in `scripts/content-monitor/`.

| File | Location | Purpose |
|---|---|---|
| `seen-items.json` | `.content-monitor/seen-items.json` | Inventory of all processed items by source ID. Single source of truth for deduplication. |
| `backlog-evaluate-status.json` | `.content-monitor/backlog-evaluate-status.json` | Tracks historical scoring progress for batch backlog evaluation sweeps. |
| `resume-status.json` | `.content-monitor/resume-status.json` | Catch-up sweep progress — used when reconciling artifacts. |
| `YYYY-MM-DD.md` | `.content-monitor/digests/YYYY-MM-DD.md` | Daily output file — contains all scored items above the threshold. |

---

## 5. Configuration

Config file: `scripts/content-monitor/sources.json` (multi-source) and `channels.json` (YouTube legacy).

| Setting | Type | Description |
|---|---|---|
| `maxAgeHours` | number | Maximum age (hours) of items to process in each run |
| `summarizeModel` | string | Model for Summarize phase (default: `minimax`) |
| `evaluateModel` | string | Model for Evaluate phase (default: `gpt-5.4`) |
| `maxTranscriptTokens` | number | Hard cap on text length sent to summarizer |
| `evaluationContext` | string | Free-text description of the developer's focus — shapes all relevance scoring |

---

## 6. Extending the Pipeline

Before creating a new adapter, check **section 3.5 (Adapter Registry)**. If the new source is RSS/Atom-based (blogs, changelogs, podcasts, arXiv, Hacker News), route it through the existing `discover-rss.js` — no new file needed. Only create a new `discover-<type>.js` for source types with fundamentally different discovery mechanics (HTML scraping, vendor APIs, sitemaps).

To add a new source type that needs a new adapter:

1. Create a new adapter file (e.g., `discover-reddit.js`) in the `scripts/content-monitor/` directory implementing the standard adapter interface: `fetchNew(config) → Array<{ id, url, title, rawText }>`
2. Register the new source in `sources.json`
3. Implement text extraction in `extract-text.js` or `transcribe.js`
4. Update section 3.5 of this skill to add the new adapter to the registry
5. Test with `--discover-only`
6. Run a full pass and verify output in `seen-items.json`

**Adapter contract:** The adapter must return a stable `id` per item. This is what `seen-items.json` keys on for deduplication.

## Verification

After modifying the content monitor pipeline, verify:
- [ ] New sources have a stable `id` field for deduplication (test with `--discover-only`)
- [ ] `seen-items.json` correctly records discovered items without duplicates
- [ ] Frequency matches the source's update cadence (daily for YouTube/Reddit/blogs, weekly for GitHub topics/awesome-lists)
- [ ] Summarize phase produces all required JSON fields (`keyFindings`, `toolsMentioned`, `actionableInsights`, etc.)
- [ ] Evaluate phase generates a scored digest entry in `.content-monitor/digests/YYYY-MM-DD.md`
- [ ] No API rate limits are exceeded (GitHub: 60 req/hr unauthenticated, Google: 100/day)
- [ ] Cost remains zero -- MiniMax for summarization, free APIs for discovery

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Doing SEO keyword research or clustering | `keywords` | Keywords skill owns keyword strategy; content-monitor is about trend discovery |
| Building competitive product teardowns | `user-research-synthesis` | Competitive analysis requires structured frameworks, not pipeline mechanics |
| Scraping arbitrary web pages for data | `backend` | General web scraping is a backend concern, not content monitoring |
| Monitoring application uptime or error rates | `error-tracking` or `agent-observability` | Those skills own runtime health; content-monitor tracks external intelligence |
| Analyzing content for SEO optimization | `seo-strategy` | SEO strategy owns page optimization; this skill discovers external trends |

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `agent-ops`
- Deployment: `portable`
- Domain: `agent/ops`

**When to use**
- Triggers: `content-monitor-skill`, `research-mode`

**Related skills**
- Verify with: `evaluation`

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-03-28`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `content monitor`, `github trending`, `blog monitor`, `intelligence brief`, `youtube monitor`, `awesome list`, `trend tracking`, `content pipeline`, `content-monitor`, `rss feed`
