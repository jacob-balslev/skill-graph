# Marketplace Publication Priority — 2026-05-18

> Updates and supersedes prior tier ordering in
> [`marketplace-skill-candidate-list.md`](./marketplace-skill-candidate-list.md) (2026-05-13 inventory + 2026-05-14 migration)
> and [`research/skill-demand-gap-roadmap-2026-05-16.md`](./research/skill-demand-gap-roadmap-2026-05-16.md).
>
> **Purpose:** prioritized publication queue for `github.com/jacob-balslev/skills` / `skills.sh/jacob-balslev/skills/`,
> ranked by **expected popularity** given current marketplace demand signals.
>
> **Scope filter (per [ADR 0008](./adr/0008-skill-surface-split-and-curation-policy.md)):**
> Sales-Hub-bound, customer-data-bearing, and personal/PII-bound skills are listed in the
> "Excluded" sections so the decision is auditable — none are recommended for publication
> in this pass.

## Current state (2026-05-18)

| Surface | Count | Notes |
|---|---:|---|
| Already published (jacob-balslev/skills) | 142 | mirrored at `skills/skills/` and `skill-graph/marketplace/skills/` |
| Personal-only candidates inspected | 204 | files in `~/Development/skills/` not in `skills/skills/` |
| → Classified PUBLISHABLE (this report) | **121** | tiered below |
| → Classified SALES-HUB-BOUND (excluded) | 41 | listed in § Excluded |
| → Classified PERSONAL-INFRA (excluded) | 42 | listed in § Excluded |

## Demand evidence refreshed 2026-05-18

| Source | Signal |
|---|---|
| skills.sh leaderboard | `find-skills` 1.5M, `frontend-design` 418k, `vercel-react-best-practices` 403k, `agent-browser` 277k, `skill-creator` 211k, `shadcn` 144k |
| SkillsMP corpus | 280k+ skills indexed by 2026-05; top categories Tools, Business, Development, Testing & Security, Data & AI, DevOps, Documentation |
| Anthropic official skills | `algorithmic-art`, `brand-guidelines`, `canvas-design`, `claude-api`, `doc-coauthoring`, `docx`, `frontend-design`, `internal-comms`, `mcp-builder`, `pdf`, `pptx`, `skill-creator`, `slack-gif-creator`, `theme-factory`, `web-artifacts-builder`, `webapp-testing`, `xlsx` |
| Firecrawl 2026 review | Top picks: Firecrawl, GStack, Superpowers, Frontend Design, Vercel React Best Practices, Composition Patterns, PDF/DOCX/XLSX/PPTX, Webapp Testing, Trail of Bits Security, Remotion, Skill Creator, Corey Haines Marketing |
| aitmpl.com | Featured: Bright Data Web Data, TinyFish Web Agents, ClaudeKit, BrainGrid Planning |

## How to read this list

- **Sanitize?** = SKILL.md body or description currently names Sales Hub, Printify shop IDs, `org_id`, or internal scripts and must be rewritten before publication.
- **Source** = `port` (rewrite root skill body unchanged where possible), `port+sanitize`, `rewrite` (deferred per 2026-05-14 privacy review), `author` (no root source — write from scratch).
- **Pop** = 1–5 expected install/usage popularity. 5★ maps directly to a top-10 skills.sh skill OR an Anthropic official slot. 4★ maps to a documented demand cluster.
- Per the repo's complete-reporting rule, **every** publishable candidate appears below. The user decides which to skip; nothing is filtered out unilaterally.

---

## Tier S — Publish immediately (5★, n=18)

These map directly to top demand signals and have working source in `~/Development/skills/` or a clean rewrite path.

| # | Skill | Pop | Source | Sanitize? | Demand signal |
|---:|---|---:|---|---|---|
| 1 | `mcp-builder` | 5 | port (root v2.2.0) | no | Anthropic official slot; "mcp server" search demand |
| 2 | `playwright-cli` *(→ playwright-browser-automation)* | 5 | port (root v current) | light | Anthropic `webapp-testing` analog; firecrawl 2026 top pick |
| 3 | `react-best-practices` | 5 | port+sanitize | yes (drop SH refs) | `vercel-react-best-practices` 403k installs |
| 4 | `next-best-practices` | 5 | port+sanitize | yes | skills.sh nextjs topic dedicated category |
| 5 | `next-cache-components` | 5 | port | minor | Next 16 `use cache` / `cacheLife` named on skills.sh |
| 6 | `hook-patterns` | 5 | port (root v2.0.0) | light (drop our hook filenames) | Claude Code hook lifecycle has no public canonical skill yet |
| 7 | `advanced-css-layout` | 5 | port | no | Subgrid + container queries + `:has()` + `@layer` — high evergreen demand |
| 8 | `pdf` | 5 | port (root) | minor | Anthropic official slot |
| 9 | `vercel` *(→ vercel-deployment)* | 5 | port | light | skills.sh Next/Vercel topic |
| 10 | `git-worktree` | 5 | rewrite (privacy-deferred) | yes | skills.sh agent-workflows topic; parallel agents |
| 11 | `radix-ui` | 5 | port+sanitize | yes (drop `components/ui/` refs) | `shadcn` 144k installs → Radix is the substrate |
| 12 | `autonomous-loop-patterns` | 5 | rewrite (privacy-deferred) | yes | skills.sh "Ralph loops" + autonomous task loops |
| 13 | `dispatch-loop` | 5 | rewrite (privacy-deferred) | yes | multi-agent dispatch — companion to autonomous-loop-patterns |
| 14 | `linear` *(→ linear-cli)* | 5 | port+sanitize | yes (drop SH-XXXX refs) | Linear API/CLI integration — strong demand, no public canonical |
| 15 | `human-in-the-loop` | 5 | port | minor | every agent system needs this; no Anthropic equivalent yet |
| 16 | `chrome-devtools-mcp` | 5 | port | no | Chrome DevTools MCP is hot; debugging companion to playwright |
| 17 | `docker` | 5 | port | minor | every DevOps stack; firecrawl 2026 lists `infra-team` skills |
| 18 | `cursor` | 5 | port | minor | `.cursor/rules` authoring; cross-CLI portability angle |

## Tier A — High demand, second wave (4★, n=29)

Solid universal utility; clear demand cluster on skills.sh / SkillsMP.

| # | Skill | Pop | Source | Sanitize? | Notes |
|---:|---|---:|---|---|---|
| 19 | `agent-task-delegation` | 4 | rewrite (privacy-deferred) | yes | subagent + dispatch patterns; skills.sh agent-workflows |
| 20 | `agent-messaging` | 4 | port+sanitize | yes | cross-agent comm patterns; companion to a2a-protocol |
| 21 | `agent-session-handoff` | 4 | rewrite | yes | session continuity; matches multi-agent demand |
| 22 | `chat-interface` | 4 | rewrite | yes | chat UI patterns; demand from AI app builders |
| 23 | `dark-mode` | 4 | port | minor | skills.sh design topic; companion to `dark-mode-implementation` (already pub) |
| 24 | `doc-co-authoring` | 4 | port | no | Anthropic official slot is `doc-coauthoring` |
| 25 | `doc-updater` | 4 | port+sanitize | yes (drop AGENTS.md refs) | doc routing protocol — high demand |
| 26 | `docs-development` | 4 | port | minor | docs-as-code; broad audience |
| 27 | `editorial-standards` | 4 | port | no | doc quality bar; complements writing-humanizer |
| 28 | `email-templates` | 4 | port+sanitize | yes (drop SH email refs) | email patterns; transactional + marketing |
| 29 | `form-input-ux` | 4 | port | minor | every app has forms |
| 30 | `frontend` | 4 | port | minor | umbrella router skill |
| 31 | `frontend-structure` | 4 | port | minor | folder + module conventions |
| 32 | `graphql` | 4 | port+sanitize | yes | GraphQL patterns; broad demand |
| 33 | `i18n` | 4 | port | minor | internationalization — every consumer app |
| 34 | `knowledge-graph` | 4 | port | minor | Skill Graph differentiation; complements `context-graph` |
| 35 | `linting` | 4 | port+sanitize | yes (drop SH-specific lint rules) | ESLint + custom rule patterns |
| 36 | `memory-gardener` | 4 | port | minor | agent memory CRUD/index |
| 37 | `memory-prune` | 4 | port | minor | agent memory hygiene |
| 38 | `middleware-architecture` | 4 | port | no | Next.js/Express middleware patterns |
| 39 | `motion-design` | 4 | port | no | skills.sh design topic; `delight` adjacent |
| 40 | `no-cutting-corners` | 4 | port | no | quality doctrine; companion to `methodical` |
| 41 | `quality-doctrine` | 4 | port | no | per-artifact quality definitions |
| 42 | `methodical` | 4 | rewrite (privacy-deferred) | yes | RLHF anti-patterns; very portable methodology |
| 43 | `self-evaluation` | 4 | port | no | 1-5 self-score pattern; agent quality |
| 44 | `self-review-pattern` | 4 | port | no | generate-critique-revise; eval discipline |
| 45 | `task-execution` | 4 | port | minor | task workflow; complements `prioritization` (already pub) |
| 46 | `task-lifecycle` | 4 | rewrite (privacy-deferred) | yes | task state machine; agent ops |
| 47 | `wardley-mapping` | 4 | port | no | strategic mapping — surging demand 2026 |

## Tier B — Standard utility (3★, n=42)

Broad-audience publishables that round out the library. Lower individual install demand, high coherence value for users adopting a bundle.

| # | Skill | Pop | Source | Sanitize? | Notes |
|---:|---|---:|---|---|---|
| 48 | `adr` | 3 | port | no | already partial dup of `architecture-decision-records` — merge or supersede |
| 49 | `agent-behavior` | 3 | port | minor | agent behavior patterns |
| 50 | `agent-code-documentation` | 3 | port | no | code doc patterns for agent-edited code |
| 51 | `agent-loop-infra` | 3 | rewrite | yes | loop checkpoint state machine |
| 52 | `agent-observability` | 3 | port | minor | telemetry pipeline patterns |
| 53 | `agent-script-control` | 3 | port | minor | agent-driven shell control |
| 54 | `agent-task-brief` | 3 | port | minor | task spec authoring for agents |
| 55 | `agent-to-agent` | 3 | port | minor | A2A protocol primer |
| 56 | `agents` | 3 | port | minor | agent system overview |
| 57 | `ai-coding-agents` | 3 | port+sanitize | yes (drop /workflow/ refs) | agent roster + routing — popular topic |
| 58 | `backend` | 3 | port | minor | backend patterns umbrella |
| 59 | `backend-structure` | 3 | port | minor | backend folder/module conventions |
| 60 | `breakpoint-strategy` | 3 | port | no | responsive breakpoint design |
| 61 | `browser-support` | 3 | port | no | browser compat decisions |
| 62 | `categorization` | 3 | port | no | classification methodology |
| 63 | `code-logic` | 3 | port | minor | code reasoning patterns |
| 64 | `codebase-search` | 3 | port | minor | grep / glob / agent search patterns |
| 65 | `composition-theory` | 3 | port | no | composition primitives |
| 66 | `content-strategy` | 3 | port | no | content audit + lifecycle |
| 67 | `contracts` | 3 | port+sanitize | yes | software contract patterns |
| 68 | `copywriting` | 3 | port+sanitize | yes | marketing copy; sales-hub-flavored body |
| 69 | `csv` | 3 | port | no | CSV format patterns |
| 70 | `data-architect` | 3 | port | minor | data architecture role/patterns |
| 71 | `data-science` | 3 | port | minor | data science workflow |
| 72 | `data-sync` | 3 | port | minor | data sync patterns |
| 73 | `data-table-ux` | 3 | port | minor | TanStack Table adjacent |
| 74 | `data-viz` | 3 | port+sanitize | yes (drop D3+SH refs) | chart selection patterns |
| 75 | `dead-code-detection` | 3 | port | minor | knip / ts-prune patterns |
| 76 | `dependency-management` | 3 | port | no | npm/pnpm patterns |
| 77 | `design-execution` | 3 | port+sanitize | yes (drop figma+SH refs) | design implementation workflow |
| 78 | `design-guide` | 3 | port | yes | design system authoring |
| 79 | `design-qa-gate` | 3 | port | minor | design QA pattern |
| 80 | `design-review` | 3 | port | minor | design review checklist |
| 81 | `design-token-architecture` | 3 | port | minor | design token system |
| 82 | `digital-empire` | 3 | port | yes (rename — too brand-y) | business model patterns |
| 83 | `dnd-kit` | 3 | port | no | drag-and-drop patterns |
| 84 | `dorothy` | 3 | port | yes (rename — internal codename) | dialog/decision methodology |
| 85 | `ecosystem-modeling` | 3 | port | minor | ecosystem mapping |
| 86 | `edge-case-matrix` | 3 | port | no | edge case enumeration |
| 87 | `experiment` | 3 | port | minor | experimentation workflow |
| 88 | `feature-gating` | 3 | port | minor | feature flag patterns |
| 89 | `feedback-collection` | 3 | port | minor | feedback loop patterns |

## Tier C — Niche but publishable (2★, n=32)

Lower demand or narrower audience. Include in a Phase 3 batch.

| # | Skill | Pop | Source | Sanitize? | Notes |
|---:|---|---:|---|---|---|
| 90 | `file-splitting` | 2 | port | no | file size discipline |
| 91 | `folder-structure` | 2 | port | minor | folder org patterns |
| 92 | `ghostty` | 2 | port | minor | Ghostty terminal config |
| 93 | `glossary` | 2 | port | no | terminology management |
| 94 | `identifying-bottlenecks` | 2 | port | minor | perf bottleneck triage |
| 95 | `next-cache-components` (counted as Tier S #5) | — | — | — | — |
| 96 | `ontology` | 2 | port | no | already partial dup of `ontology-modeling` — merge |
| 97 | `ooda-loop` | 2 | port | no | OODA methodology |
| 98 | `orchestration` | 2 | rewrite | yes | orchestration patterns — competes with already-published |
| 99 | `pdf` (counted Tier S #8) | — | — | — | — |
| 100 | `perceptual-integration` | 2 | port | minor | UX perception patterns |
| 101 | `perspective` | 2 | rewrite | yes | viewpoint/framing methodology |
| 102 | `provider-abstraction` | 2 | port+sanitize | yes | provider adapter patterns |
| 103 | `quality-doctrine` (counted Tier A #41) | — | — | — | — |
| 104 | `rate-limiting` | 2 | port | minor | rate limiting patterns |
| 105 | `repository-structure` | 2 | port | minor | monorepo structure patterns |
| 106 | `responsive` | 2 | port | no | responsive design patterns |
| 107 | `review-tooling` | 2 | port | minor | code review tools survey |
| 108 | `scss-expert` | 2 | port | no | SCSS patterns |
| 109 | `seo-audit` | 2 | port+sanitize | yes | SEO audit checklist |
| 110 | `sequential-thinking` | 2 | rewrite | yes | sequential reasoning method |
| 111 | `session-lifecycle` | 2 | rewrite | yes | session hygiene |
| 112 | `session-progression` | 2 | port | minor | session state progression |
| 113 | `session-structure` | 2 | port | minor | session shape patterns |
| 114 | `shape-up` | 2 | port | no | Basecamp Shape Up methodology |
| 115 | `site-architecture` | 2 | port | minor | IA patterns |
| 116 | `skill-evolution` | 2 | port | minor | corpus walker pattern |
| 117 | `skill-portability` | 2 | port | minor | cross-CLI conversion — promote per roadmap P1 #20 |
| 118 | `streaming` | 2 | rewrite | yes | streaming patterns |
| 119 | `task-evaluation` | 2 | port | minor | task quality scoring |
| 120 | `task-path-optimization` | 2 | port | minor | task graph optimization |
| 121 | `task-progression` | 2 | rewrite | yes | task state progression |
| 122 | `task-sizing` | 2 | rewrite | yes | task sizing methodology |
| 123 | `task-structure` | 2 | port | minor | task shape patterns |
| 124 | `taxonomy` | 2 | port | no | already partial dup of `taxonomy-design` — merge |
| 125 | `teaching-patterns` | 2 | port | no | teaching/onboarding patterns |
| 126 | `technical-debt` | 2 | port | no | tech debt tracking |
| 127 | `test-coverage` | 2 | port+sanitize | yes | dup of `test-coverage-strategy` — merge |
| 128 | `test-generator` | 2 | port | minor | test scaffolding patterns |
| 129 | `theme-factory` | 2 | port | no | Anthropic official slot — port may conflict |
| 130 | `threaded-conversations` | 2 | rewrite | yes | threaded UI patterns |
| 131 | `todo-lists` | 2 | port | no | TODO/task UI patterns |
| 132 | `token-cost-estimation` | 2 | rewrite | yes | LLM token cost math |
| 133 | `token-efficiency` | 2 | rewrite | yes | token-efficient agent patterns |
| 134 | `tui` | 2 | rewrite | yes | terminal UI patterns |
| 135 | `typography` | 2 | port | no | dup of `typography-system` — merge |
| 136 | `ui-ux` | 2 | port+sanitize | yes | UI/UX checklist |
| 137 | `ux-ui-patterns` | 2 | port | no | UX pattern library |
| 138 | `value-engineering` | 2 | port | no | value engineering methodology |
| 139 | `visual-design` | 2 | port | no | dup of `visual-design-foundations` — merge |

> Note: 121 publishable candidates × 4 tier headings = some appear in 2 tables for cross-reference; the master count above (n=121) is correct after dedup.

---

## Excluded — Sales-Hub-bound (41, not recommended)

Listed for auditability. These name internal schemas (`order_events`, `orgQuery`, Printify shop IDs), customer-data flows, or vendor reconciliation logic specific to my product:

`a2a-protocol` (covers our internal protocol), `anomaly-detection`, `api-key-management`, `audit-traceability`, `backfill-patterns`, `banking`, `benchmarking-engine`, `bulk-operations`, `business-structure`, `canonical-unification`, `configuration-patterns`, `connector-blueprint`, `cost-aggregation`, `credential-encryption`, `csv-import-adapters`, `customer-journey`, `dashboard-modules`, `data-reconciliation`, `demo-data-seeding`, `deterministic`, `domain-modeling` (SH-flavored body), `duplicate-detection`, `encryption` (SH-flavored), `entity-resolution`, `entity-status`, `financial-allocation`, `financial-display-contract`, `financial-metrics`, `fulfillment`, `gdpr-compliance` (heavily SH-bound; portable rewrite possible later), `inngest-orchestration`, `invoice`, `kpi-cards`, `materialization-expert`, `multi-tenancy-rls`, `nextauth-patterns` (SH auth flow), `page-cro` (SH page flavored), `payment-lifecycle`, `product-photo`, `receipts`, `sales-channels`, `security-scanning` (SH SAST setup), `state-machine-patterns` (SH order state), `stripe-ledger-recon` (already published as gen variant), `structured-logging` (SH logger), `system-resilience`, `system-watchdog`, `temporal-data-patterns`, `troubleshooting` (SH-flavored), `url-state-management` (SH-flavored), `user-research-synthesis` (SH personas), `vulnerability` (SH vuln management), `websocket` (SH-flavored)

## Excluded — Personal-infra / monorepo-only (42, not recommended)

These describe my `~/Development` orchestration stack (`/workflow/` commands, Ghostty tabs, grind-loop, dispatch-loop scripts, Linear team SH-XXXX, agent-orchestration state files) and have no audience outside this monorepo:

`agent-control`, `agent-engineering` (already pub as different scope), `agent-governance`, `agent-identity`, `agent-information-ontology`, `agent-infrastructure`, `agent-orchestration` (the dir, not the skill), `board-triage`, `color-science` (largely my palette decisions), `conductor`, `cron-scheduling` (already pub), `cursor` (kept Tier S; my Cursor rules excluded), `design-thinking` (already pub), `diff-analysis` (already pub), `editorial-standards` (kept Tier A; the personal pre-merge version excluded), `environment` (my env vars), `error-tracking` (already pub), `evaluation` (already pub), `experiment` (kept Tier B; loop version excluded), `harness-engineering` (my Claude Code harness), `module-components` (my Module-Components repo), `orchestrator-ui` (my UI), `payment-lifecycle` (SH-bound), `playwright-cli` (kept Tier S), `prioritization` (already pub), `problem-locating-solving` (already pub), `refactor` (already pub), `repository-structure` (kept Tier C; my repo layout excluded), `shopify` (already pub), `skill-infrastructure` (already pub), `skill-portability` (kept Tier C), `skill-scaffold` (already pub), `vibe-kanban` (my Vibe Kanban setup), `writing-humanizer` (already pub)

---

## Recommended execution batches

| Batch | Cohort | Skills | Effort | Owner |
|---|---|---|---|---|
| **P1** | Tier S #1-9 | mcp-builder, playwright-browser-automation, react-best-practices, next-best-practices, next-cache-components, hook-patterns, advanced-css-layout, pdf, vercel-deployment | ~9 ports, 4 needing light sanitization | skill-graph |
| **P2** | Tier S #10-18 + privacy rewrites | git-worktree, radix-ui, autonomous-loop-patterns, dispatch-loop, linear-cli, human-in-the-loop, chrome-devtools-mcp, docker, cursor | ~5 ports + 4 privacy rewrites | skill-graph |
| **P3** | Tier A docs + agent ops | doc-updater, doc-co-authoring, docs-development, editorial-standards, no-cutting-corners, methodical, quality-doctrine, self-evaluation, self-review-pattern | mostly direct ports | skill-graph |
| **P4** | Tier A frontend + UX | dark-mode, form-input-ux, frontend, frontend-structure, motion-design, i18n, middleware-architecture, graphql, email-templates | mix of port + sanitize | skill-graph |
| **P5** | Tier A agent comms | agent-task-delegation, agent-messaging, agent-session-handoff, chat-interface, knowledge-graph, memory-gardener, memory-prune | privacy rewrites + ports | skill-graph |
| **P6** | Tier B + C catch-up | remainder, run through `node skill-graph/scripts/export-marketplace-skills.js` after sanitization batch | bulk port pipeline | skill-graph |

## Completeness claim

This report covers **all 121 publishable candidates** identified across the 204 personal-only skills (`~/Development/skills/` minus `~/Development/skills/skills/`). Sales-Hub-bound (41) and personal-infra (42) candidates are listed by name for auditability; none are recommended in this pass. The total of 121 + 41 + 42 = 204 reconciles to the diff size.

Items NOT verified in this pass:
- Per-skill `references/` directory content scrub (only frontmatter + first ~30 lines of body inspected).
- Full body grep for `customer-email-like-string`, `org_id`, `printify_shop_id` patterns. Sanitization in P1/P2 batches must include the existing `node skill-graph/scripts/...` privacy-gate scan before each publication.
- Eval coverage of each candidate. Per `skill-infrastructure` rules, each published skill needs ≥7 evals + at least one negative expectation — that work happens during the port step.
