# Skill Demand Gap Roadmap - 2026-05-16

> Scope: Skill Graph, Skill Metadata Protocol, and the `/Users/jacobbalslev/Development` workspace.
> Purpose: identify which skills are externally in demand, which skills already exist as Skill Graph upgraded skills, and which gaps should be filled first.

## Executive Summary

Skill Graph already has a strong upgraded public library: 137 marketplace-exported skills, plus the generated manifest includes 138 rows because `skill-metadata-template` is a protocol specimen rather than a marketplace export.

The highest-value gaps are not general methodology. The upgraded library is already strong there. The gaps are in high-demand practical runtime skills: marketplace discovery/import, browser automation, document formats, MCP/Claude API, React/Next/shadcn/Tailwind, provider/platform skills, Playwright/testing implementation, marketing/CRO, and local-workspace agent operations that still exist only as legacy/private Development skills.

Top recommendation: prioritize skills that are both externally demanded and locally useful in `/Development`: `skill-discovery-import`, `playwright-browser-automation`, `mcp-builder`, `react-best-practices`, `next-best-practices`, `shadcn-ui`, `tailwind-css`, `document-workflows`, `stripe`, `sentry`, `vercel-deployment`, `github-actions`, and the public-safe migration of `agent-task-delegation`, `session-lifecycle`, `autonomous-loop-patterns`, and `git-worktree`.

## Evidence Sources

| # | Source | Evidence captured | Demand signal |
|---:|---|---|---|
| 1 | `https://skillsmp.com` | SkillsMP reports 1,419,713 skills, category counts, and occupation counts. | Large public skill marketplace; strongest category counts are Tools, Business, Development, Testing & Security, Data & AI, DevOps, Documentation, Content & Media, Research, Databases. |
| 2 | `https://skills.sh` | Skills leaderboard and install counts. | Top visible skills include `find-skills` (1.5M), `frontend-design` (418.3K), `vercel-react-best-practices` (402.9K), `web-design-guidelines` (322.6K), Azure skills, `agent-browser` (277.3K), `skill-creator` (210.9K), `supabase-postgres-best-practices` (168.9K), `shadcn` (143.9K). |
| 3 | `https://skills.sh/topic` | Topic taxonomy: React, Next.js, Design & UI, Mobile, Agent workflows, Databases, Testing, Marketing. | Public navigation confirms current buyer/user demand clusters. |
| 4 | `https://skills.sh/topic/react` | React category names performance, memoization, composable APIs, shadcn, bundle-size problems, TypeScript component APIs. | Strong gap signal for React implementation skills beyond general frontend architecture. |
| 5 | `https://skills.sh/topic/nextjs` | Next.js category names App Router, RSC, caching, Vercel deployment, Turborepo, AI SDK. | Strong local fit because Sales Hub and Module-Components use Next.js 16 and React 19. |
| 6 | `https://skills.sh/topic/design` | Design category names frontend design, web guidelines, polish, critique, bolder, delight, distill, extract design system. | Skill Graph has conceptual design depth, but fewer action/operator-style design skills. |
| 7 | `https://skills.sh/topic/agent-workflows` | Agent workflows include `find-skills`, `agent-browser`, `skill-creator`, debugging, plans, TDD, review, subagents, worktrees, autonomous loops. | Direct match to Development workspace agent-orchestration work; several exist locally but not yet public-safe/upgraded. |
| 8 | `https://skills.sh/topic/databases` | Database category names Supabase, Firebase, Convex, Neon, PlanetScale, Turso, DuckDB, Drizzle. | Skill Graph has database fundamentals but fewer provider/framework implementation skills. |
| 9 | `https://skills.sh/topic/testing` | Testing category names TDD, webapp-testing, verification-before-completion, Playwright best practices, Playwright CLI. | Skill Graph has testing theory; local workspace also has root `playwright-cli` skill not yet upgraded. |
| 10 | `https://skills.sh/topic/marketing` | Marketing category names SEO audit, copywriting, marketing psychology, programmatic SEO, pricing, page CRO, launch, analytics tracking, AI SEO. | Development has several legacy marketing skills, but Skill Graph upgraded library has only partial marketing coverage. |
| 11 | `https://github.com/anthropics/skills` and GitHub API listing | Official Anthropic repo has 17 skills: `algorithmic-art`, `brand-guidelines`, `canvas-design`, `claude-api`, `doc-coauthoring`, `docx`, `frontend-design`, `internal-comms`, `mcp-builder`, `pdf`, `pptx`, `skill-creator`, `slack-gif-creator`, `theme-factory`, `web-artifacts-builder`, `webapp-testing`, `xlsx`. | Official Claude Skills emphasize documents, frontend/design, MCP/API, comms, and artifacts. |
| 12 | `https://agentskills.io` | Open Agent Skills standard lists many compatible clients and runtimes across the agent ecosystem. | Portability and cross-agent metadata remain central differentiators for Skill Graph. |
| 13 | `skill-graph/README.md` | Skill Graph positioning: protocol metadata plus library-level lint, manifest, router, drift sentinel, export pipeline. | Gaps should strengthen public Skill Graph value, not duplicate marketplace hosting. |
| 14 | `skill-graph/docs/marketplace-skill-candidate-list.md` | Prior candidate report: 568 scanned, 143 public candidates, 80 prior P0 Skill Graph canonical rows, 63 active Development rows, 22 imported on 2026-05-14, 28 deferred public-safe rewrites. | Confirms migration queue and privacy-gated legacy candidates. |
| 15 | Root `skills.manifest.json` | Active workspace library: 447 active skills, 287 shared, 160 Sales Hub, 37 archived. | Local workspace has substantial source material not yet all upgraded. |
| 16 | Local inventory script run 2026-05-16 | `skill-graph/marketplace/skills`: 137; public `skills/skills`: 137; root shared `skills/`: 277. | Confirms exported upgraded set and broader local source pool. |
| 17 | `sales-hub/package.json` | Sales Hub uses Next 16.1.6, React 19.2.3, Radix, TanStack Table, D3, ExcelJS, React PDF, Shopify, Stripe, Redis, Playwright, Jest, Tailwind 4, Vercel, Prisma. | Strong local demand for Next/React, Radix/shadcn, TanStack Table, charts, documents, provider integrations, testing, deployment. |
| 18 | `orchestrator-ui/package.json` | Orchestrator UI uses React 19, Vite 6, Express, AG-UI, SSE/WS, Zustand, dnd-kit, xterm, Shiki, Vitest. | Strong local demand for real-time, AG-UI, provider adapters, terminal UI, dnd, Vite, local security. |
| 19 | `Module-Components/package.json` | Module-Components uses Next 16, React 19, shadcn, Tailwind 4, Radix, Zod, MCP SDK, Playwright, Vitest. | Strong local demand for shadcn, block registry, component contracts, MCP, visual regression. |

## Local Inventory Snapshot

| Surface | Count | Notes |
|---|---:|---|
| `skill-graph/marketplace/skills/*/SKILL.md` | 137 | Plain Agent Skills export surface; same count as local public release clone. |
| `skill-graph/examples/skills.manifest.sample.json` | 138 | Includes `skill-metadata-template`; marketplace export correctly excludes that specimen. |
| `/Users/jacobbalslev/Development/skills/skills/*/SKILL.md` | 137 | Public release clone mirrors marketplace export. |
| Root `/Users/jacobbalslev/Development/skills/*/SKILL.md` | 277 | Shared Development source skills, many still legacy/private/local. |
| Root `skills.manifest.json` active total | 447 | 287 shared + 160 Sales Hub, with 37 archived. |

## Already Upgraded Skill Graph Skills

These 137 skills are already present in the Skill Graph marketplace export and the public local release clone.

`a11y`, `acid-fundamentals`, `agent-engineering`, `agent-eval-design`, `ai-native-development`, `api-design`, `architecture-decision-records`, `background-jobs`, `bounded-context-mapping`, `cap-theorem-tradeoffs`, `client-server-boundary`, `code-review`, `color-system-design`, `command-palette`, `component-architecture`, `compression`, `conceptual-modeling`, `connection-pooling`, `constraint-awareness`, `content-monitor`, `context-engineering`, `context-graph`, `context-management`, `context-window`, `contract-testing`, `cron-scheduling`, `dark-mode-implementation`, `data-modeling`, `data-modeling-fundamentals`, `database-migration`, `debugging`, `dependency-architecture`, `design-module-composition`, `design-system-architecture`, `design-thinking`, `diagnosis`, `diff-analysis`, `documentation`, `e2e-test-design`, `entity-relationship-modeling`, `epistemic-grounding`, `error-tracking`, `eval-driven-development`, `evaluation`, `event-contract-design`, `event-storming`, `form-ux-architecture`, `framework-fit-analysis`, `frontend-architecture`, `generative-ui`, `governance`, `graph-audit`, `guardrails`, `http-semantics`, `ideation`, `indexing-strategy`, `information-architecture`, `integration-test-design`, `intent-recognition`, `interaction-feedback`, `interaction-patterns`, `journey-mapping`, `keywords`, `knowledge-modeling`, `layout-composition`, `linguistics`, `lint-overlay`, `mental-models`, `merge-queue`, `methodology`, `microcopy`, `mobile-responsive-ux`, `mutation-testing`, `naming-conventions`, `observability-modeling`, `ontology`, `ontology-modeling`, `owasp-security`, `pattern-recognition`, `performance-budgets`, `performance-engineering`, `performance-testing`, `printify`, `prioritization`, `problem-framing`, `problem-locating-solving`, `project-knowledge-extraction`, `prompt-craft`, `prompt-injection-defense`, `property-based-testing`, `prototyping`, `query-optimization`, `real-time-updates`, `reasoning`, `refactor`, `rendering-models`, `replication-patterns`, `research-synthesis`, `schema-evolution`, `security-fundamentals`, `semantic-center`, `semantic-relations`, `semantics`, `semiotics`, `seo-strategy`, `sharding-strategy`, `shopify`, `skill-infrastructure`, `skill-router`, `skill-scaffold`, `snapshot-testing`, `spec-driven-development`, `state-machine-modeling`, `state-management`, `streaming-architecture`, `summarization`, `system-interface-contracts`, `task-analysis`, `taxonomy-design`, `test-coverage-strategy`, `test-doubles-design`, `test-driven-development`, `testing-strategy`, `theme-system-design`, `tool-call-flow`, `tool-call-strategy`, `transaction-isolation`, `type-safety`, `typography-system`, `usability-testing`, `user-research`, `vercel-composition-patterns`, `version-control`, `visual-design-foundations`, `visual-hierarchy`, `webhook-integration`, `writing-humanizer`.

## Coverage Read

| Demand cluster | Existing upgraded coverage | Gap severity | Read |
|---|---|---:|---|
| Skill discovery, install, import, marketplace workflow | `skill-router`, `skill-scaffold`, `skill-infrastructure`, `graph-audit`, `skill-portability` exists in root but not upgraded/exported | P0 | Public demand is led by `find-skills`; Skill Graph needs a first-class discovery/import/upgrading skill. |
| Frontend and React implementation | `frontend-architecture`, `component-architecture`, `vercel-composition-patterns`, `rendering-models`, `client-server-boundary` | P0 | Missing practical React 19 performance and implementation skill equivalent to `vercel-react-best-practices`. |
| Next.js implementation | `rendering-models`, `client-server-boundary`, general frontend skills | P0 | Missing `next-best-practices`, `next-cache-components`, Vercel deployment patterns as upgraded Skill Graph skills. |
| Design and UI | Strong conceptual coverage: `visual-design-foundations`, `visual-hierarchy`, `layout-composition`, `interaction-patterns`, `interaction-feedback`, `color-system-design`, `typography-system`, `theme-system-design`, `a11y` | P1 | Missing operator-style design skills: critique, polish, extract-design-system, bolder/quieter/delight. |
| Browser automation | Root has `playwright-cli`; upgraded library has `e2e-test-design`, `testing-strategy`, `webhook-integration` etc. | P0 | Missing practical browser automation Skill Graph skill despite strong demand for `agent-browser`, `browser-use`, `playwright-cli`. |
| Testing implementation | Strong theory: `testing-strategy`, `test-driven-development`, `integration-test-design`, `e2e-test-design`, `property-based-testing`, `mutation-testing`, `snapshot-testing` | P1 | Missing practical `webapp-testing`, React Testing Library, Playwright best practices, Vitest/Jest implementation skills. |
| Databases | Strong fundamentals: `data-modeling`, `database-migration`, `indexing-strategy`, `query-optimization`, `connection-pooling`, `transaction-isolation`, `replication-patterns`, `sharding-strategy` | P1 | Missing provider/ORM skills: Supabase, Neon, Firebase, Convex, PlanetScale, Drizzle, Prisma. |
| MCP/API and tool ecosystem | `tool-call-flow`, `tool-call-strategy`, `api-design`, `system-interface-contracts` | P0 | Missing upgraded `mcp-builder`, `claude-api`, `openai-api`, Vercel AI SDK skills. |
| Document and file workflows | `documentation`, `pdf` exists locally but not upgraded, `writing-humanizer`, `summarization` | P0 | Official Claude skills strongly emphasize `docx`, `pdf`, `pptx`, `xlsx`; Skill Graph needs document workflow coverage. |
| Cloud, DevOps, deployment | `version-control`, `merge-queue`, `cron-scheduling`, `background-jobs`, `error-tracking`, `observability-modeling` | P1 | Missing Vercel deployment, GitHub Actions, Docker, Cloudflare, Azure, CI/CD provider skills. |
| Product/marketing/growth | `seo-strategy`, `keywords`, `content-monitor`, `content-strategy` exists locally but not upgraded, `writing-humanizer` | P1 | Missing `seo-audit`, `copywriting`, `page-cro`, `pricing-strategy`, `analytics-tracking`, `ai-seo`, launch/growth skills. |
| Agent workflow | Strong upgraded conceptual set plus legacy local agent operations | P1 | Need public-safe migrations for root local skills: `agent-session-handoff`, `agent-task-delegation`, `autonomous-loop-patterns`, `git-worktree`, `session-lifecycle`, `task-lifecycle`, `orchestration`. |
| Security | `security-fundamentals`, `owasp-security`, `prompt-injection-defense`, `guardrails`, `intent-recognition` | P1 | Missing practical SAST/secrets/dependency/security-scanning, Semgrep/CodeQL, supply-chain, auth provider skills. |
| Analytics and observability | `observability-modeling`, `error-tracking`, `performance-engineering` | P2 | Missing Sentry, Datadog, PostHog, OpenTelemetry, product analytics implementation skills. |
| Mobile | `mobile-responsive-ux` only | P2 | Missing React Native, Expo, Flutter, mobile test/emulator skills. |
| E-commerce and payments | `shopify`, `printify`, `webhook-integration` | P2 | Missing Stripe, PayPal, Etsy, Amazon, WooCommerce, BigCommerce public-safe skills. |

## Prioritized Gap-Fill Roadmap

Priority meanings:

| Priority | Meaning |
|---|---|
| P0 | Fill immediately. High external demand plus strong local usage or Skill Graph positioning value. |
| P1 | Next wave. Strong demand, but less central than P0 or already partly covered. |
| P2 | Useful expansion. Good market signal or local fit, but narrower audience or weaker urgency. |
| P3 | Defer. Valuable later, mostly style/operator depth or specialist ecosystems. |

### P0 - Immediate

| # | Candidate skill | Status now | Why this is P0 | Recommended action |
|---:|---|---|---|---|
| 1 | `skill-discovery-import` | Gap | `find-skills` is the top skills.sh skill at 1.5M installs; Skill Graph differentiates by importing, annotating, routing, and auditing skills after discovery. | Author new Skill Graph skill covering skills.sh/SkillsMP discovery, safety review, import, SMP enrichment, privacy gate, and eval/drift handoff. |
| 2 | `playwright-browser-automation` | Root has `playwright-cli`, not upgraded | skills.sh Testing and Agent Workflows both emphasize browser automation; local Sales Hub and Module-Components use Playwright. | Port/generalize root `playwright-cli` into Skill Graph; include browser evidence, screenshots, snapshots, selector strategy boundaries. |
| 3 | `mcp-builder` | Root has `mcp-builder`, not upgraded | Official Anthropic skill; marketplace demand; Module-Components uses MCP SDK. | Port root skill, update against current MCP SDK and Anthropic/agentskills sources, add `verify_with: security-fundamentals`. |
| 4 | `react-best-practices` | Root has `react-best-practices`, not upgraded | React skills are a top public topic and `vercel-react-best-practices` is high-install; local repos use React 19. | Port or author reference skill for React 19 performance, RSC boundaries, Suspense, compiler-era memoization discipline. |
| 5 | `next-best-practices` | Root has `next-best-practices`, not upgraded | Sales Hub and Module-Components use Next 16.1.6; skills.sh has dedicated Next.js topic. | Port/update root skill, align with Next 16 App Router and Cache Components boundaries. |
| 6 | `next-cache-components` | Root has `next-cache-components`, not upgraded | skills.sh explicitly names `use cache`, `cacheLife`, `cacheTag`; local Sales Hub runs Next 16. | Port/update root skill as a reference capability; boundary with generic caching and rendering-models. |
| 7 | `shadcn-ui` | Gap in Skill Graph, local Module-Components uses shadcn | skills.sh React topic includes `shadcn`; Module-Components is a shadcn block library. | Author new Skill Graph skill for shadcn registry usage, component wrappers, theme tokens, variant extension, data-slot boundary. |
| 8 | `tailwind-css` | Gap in Skill Graph, local repos use Tailwind 4 | skills.sh React topic includes Tailwind design-system skills; Module-Components and orchestrator-ui use Tailwind. | Author Tailwind 4 skill; boundary with theme-system-design and design-system-architecture. |
| 9 | `document-workflows` | Gap; root has `pdf`, not upgraded | Official Anthropic skills include `docx`, `pdf`, `pptx`, `xlsx`; these are high-demand production skills. | Author umbrella router or four separate skills: `docx`, `pptx`, `xlsx`, `pdf-workflows`; start with umbrella if scope needs rapid coverage. |
| 10 | `anthropic-api` | Gap | Official Anthropic skill; Skill Graph works with API and runtime consumers. | Author reference skill for Anthropic API skills usage, Files/Skills APIs, rate-limit-safe patterns, tool/schema boundaries. |
| 11 | `vercel-deployment` | Root has `vercel`, not upgraded | Vercel deployment appears in Next topic; Sales Hub deploys on Vercel. | Port root `vercel` into Skill Graph; include env, preview, logs, rollback, no-MCP boundary. |
| 12 | `github-actions` | Gap/root docs mention CI | skills.sh leaderboard includes GitHub Actions docs; every public repo needs CI guidance. | Author skill for GitHub Actions workflows, matrix, secrets, caching, artifacts, security posture. |
| 13 | `stripe` | Root has archived generic `stripe` and Sales Hub `stripe-ledger-recon`, not public upgraded | Sales Hub uses Stripe; official skills.sh has Stripe creator rows; payments are high-risk. | Author portable Stripe integration skill; keep Sales Hub ledger reconciliation separate/private. |
| 14 | `sentry` | Gap; root has generic error-tracking | Sentry official creator appears on skills.sh; local Sales Hub dependencies include Sentry and error-tracking patterns. | Author Sentry-specific implementation skill; verify_with `error-tracking`, `security-fundamentals`, `gdpr-compliance` only if public-safe. |
| 15 | `agent-task-delegation` | Root legacy, deferred for public rewrite | Agent workflows topic includes subagent-driven development and parallel dispatch; local orchestration uses this heavily. | Rewrite public-safe portable version from root skill; remove local private runtime names. |
| 16 | `session-lifecycle` | Root legacy, deferred for public rewrite | Agent-runtime docs emphasize skill lifecycle/context; local multi-agent work needs session hygiene. | Rewrite public-safe version; boundary with `context-window`, `context-management`, `agent-session-handoff`. |

### P1 - Next Wave

| # | Candidate skill | Status now | Why this is P1 | Recommended action |
|---:|---|---|---|---|
| 17 | `autonomous-loop-patterns` | Root legacy, deferred | Agent workflows topic includes Ralph loops and autonomous task loops. | Rewrite public-safe version; keep local script names as examples only if scrubbed. |
| 18 | `git-worktree` | Root legacy, not upgraded | Agent workflows topic includes worktrees; multi-agent parallelism needs isolation. | Port root skill; boundary with `version-control`, `merge-queue`. |
| 19 | `orchestration` | Root legacy, deferred | Strong local demand; public agent-workflows demand. | Rewrite as portable orchestration patterns, not Development-specific command docs. |
| 20 | `skill-portability` | Root skill loaded, not upgraded/exported | AgentSkills lists many runtimes; portability is central to Skill Graph positioning. | Promote to Skill Graph source/export; add current clients and transform boundaries. |
| 21 | `webapp-testing` | Gap | Official Anthropic skill and skills.sh Testing topic. | Author/port implementation skill bridging RTL, Playwright, component/e2e choices. |
| 22 | `playwright-best-practices` | Gap | skills.sh Testing category explicitly names it. | Author focused implementation companion to browser automation. |
| 23 | `vitest-jest-testing` | Root has `javascript-testing-patterns`, `test-generator` | Local repos use Jest and Vitest. | Port/generalize JS testing implementation patterns. |
| 24 | `radix-ui` | Root has `radix-ui`, not upgraded | Sales Hub uses Radix; shadcn depends on Radix primitives. | Port root skill; boundary with `shadcn-ui`, `a11y`. |
| 25 | `tanstack-table` | Gap/root data-table UX exists | Sales Hub uses TanStack Table; public React data grids are common. | Author implementation skill for state, sorting/filtering, virtualization, selection. |
| 26 | `d3-data-visualization` | Root `data-viz` exists, not upgraded | Sales Hub uses D3, public data/UI demand. | Port/generalize D3 and chart selection skill; boundary with visual-design and a11y. |
| 27 | `supabase` | Root archived generic, not upgraded | skills.sh database topic features Supabase. | Author provider skill or import official shape into SMP. |
| 28 | `neon-postgres` | Root `neon` exists, not upgraded | Sales Hub uses Neon; skills.sh database topic names Neon. | Port root `neon`; boundary with `database-migration` and `connection-pooling`. |
| 29 | `prisma` | Root archived generic, not upgraded | Sales Hub dev deps include Prisma 7. | Author current Prisma skill or defer if repo usage stays minimal. |
| 30 | `drizzle-orm` | Gap | skills.sh database topic names Drizzle. | Author if public library wants modern TypeScript ORM breadth. |
| 31 | `security-scanning` | Root has Sales Hub-specific, not upgraded | skillsmp Testing & Security is a large category; public repos need SAST/secrets/SCA. | Author portable SAST/secrets/dependency scanning skill; boundary with `security-fundamentals`, `owasp-security`. |
| 32 | `docker` | Root has `docker`, not upgraded | Common DevOps demand; local workspace uses Docker for DB. | Port root Docker skill; boundary with Vercel and database provider skills. |
| 33 | `copywriting` | Root has Sales Hub copywriting, not public | Marketing topic has high demand; Sales Hub also needs product copy. | Author portable copywriting or public-safe SaaS/ecommerce variant. |
| 34 | `seo-audit` | Root has `seo-audit`, not upgraded | skills.sh Marketing topic has strong SEO demand. | Port/author SEO audit skill; boundary with `seo-strategy`, `keywords`, `content-strategy`. |
| 35 | `page-cro` | Root has `page-cro`, not upgraded | Marketing topic names page CRO, pricing, paywalls. | Port/author CRO skill; boundary with design, task-analysis, copywriting. |
| 36 | `analytics-tracking` | Gap/root analytics archived | Marketing topic names analytics tracking; local Sales Hub uses analytics/reporting surfaces. | Author skill for event taxonomy, tracking plans, attribution, privacy-safe analytics. |

### P2 - Useful Expansion

| # | Candidate skill | Status now | Why this is P2 | Recommended action |
|---:|---|---|---|---|
| 37 | `cloudflare` | Gap | Official skills.sh creator has 137 Cloudflare skills; common deployment edge provider. | Author if targeting infra breadth beyond Vercel. |
| 38 | `azure-core` | Gap | Azure skills dominate skills.sh leaderboard by volume/install counts. | Defer unless targeting enterprise infra audience. |
| 39 | `firebase` | Gap | skills.sh Database topic includes Firebase; common app backend. | Author provider skill if broadening beyond Postgres/Next stack. |
| 40 | `convex` | Gap | skills.sh Database topic includes Convex. | Defer until public library wants modern backend breadth. |
| 41 | `posthog` | Gap | Official creator on skills.sh; marketing/product analytics fit. | Author after analytics-tracking. |
| 42 | `opentelemetry` | Gap | Observability implementation gap. | Author after `sentry`; verify_with `observability-modeling`. |
| 43 | `react-native` | Gap | skills.sh Mobile topic; Vercel React Native skill high on leaderboard. | Author if mobile becomes a target audience. |
| 44 | `expo` | Gap | skills.sh official Expo creator. | Author after React Native if mobile wave starts. |
| 45 | `flutter` | Gap | Official Flutter creator appears on skills.sh. | Defer unless non-React mobile breadth is desired. |
| 46 | `ai-sdk` | Gap | Next.js topic names Vercel AI SDK; local AI-agent work likely benefits. | Author reference skill for streaming, tools, UI hooks; boundary with `generative-ui`, `streaming-architecture`. |
| 47 | `rag-architecture` | Partial via `knowledge-modeling` | Data & AI market signal; public agent apps need RAG implementation guidance. | Author implementation skill covering retrieval, chunking, evals, vector DB boundaries. |
| 48 | `vector-databases` | Gap | Pinecone official creator appears; RAG ecosystem demand. | Defer until `rag-architecture` exists. |
| 49 | `resend-email` | Gap/root email templates exists | Official Resend skills; Sales Hub notification/email surfaces. | Author provider skill if email feature work rises. |
| 50 | `launchdarkly-feature-flags` | Gap | Official creator and local feature-gating relevance. | Author if feature flagging becomes public-library target. |
| 51 | `clerk-auth` | Gap | Official Clerk creator, public app auth demand. | Author as provider skill; boundary with generic security/auth. |
| 52 | `auth0` | Gap | Official Auth0 creator. | Defer behind Clerk/Better Auth unless enterprise auth audience matters. |
| 53 | `better-auth` | Gap | High leaderboard item. | Author if modern auth framework breadth is important. |
| 54 | `email-sequence` | Gap | Marketing topic names lifecycle email. | Author after copywriting/page-cro. |
| 55 | `pricing-strategy` | Gap | Marketing topic and Sales Hub pricing surfaces. | Author after page-cro/copywriting. |
| 56 | `ai-seo` | Gap | Marketing topic names AI search visibility. | Author after seo-audit and content-strategy. |

### P3 - Defer

| # | Candidate skill | Status now | Why defer | Recommended action |
|---:|---|---|---|---|
| 57 | `polish` | Gap | High design value, but operator-specific and partly covered by `visual-design-foundations`. | Add after core frontend/design implementation skills. |
| 58 | `critique` | Gap | Useful design operator, but can be a mode of `design-review`. | Add if Skill Graph wants action-verb design operators. |
| 59 | `extract-design-system` | Gap | High public demand; depends on design-token/component extraction scripts for best result. | Add after `shadcn-ui`, `tailwind-css`, `design-system-architecture` updates. |
| 60 | `bolder` | Gap | Stylistic operator, narrower audience. | Defer. |
| 61 | `delight` | Gap | Stylistic/motion operator; overlaps motion-design not yet upgraded. | Defer. |
| 62 | `distill` | Gap | Stylistic operator; overlaps information architecture and visual hierarchy. | Defer. |
| 63 | `quieter` | Gap | Stylistic operator; overlaps visual hierarchy. | Defer. |
| 64 | `brand-guidelines` | Gap | Official Anthropic skill; value depends on project-specific brand assets. | Keep as template/example rather than generic portable skill. |
| 65 | `internal-comms` | Gap | Official Anthropic skill but less central to coding-agent users. | Defer unless enterprise workflow pack is planned. |
| 66 | `slack-gif-creator` | Gap | Official Anthropic creative example, low relevance to Skill Graph core. | Defer. |
| 67 | `algorithmic-art` | Root archived; official Anthropic skill | Creative niche; not central to Development workspace. | Keep archived until creative/generative media pack. |
| 68 | `canvas-design` | Root archived; official Anthropic skill | Design niche; less urgent than frontend/design implementation. | Revisit after document/artifact workflows. |

## Recommended Execution Order

| Phase | Target | Skills |
|---:|---|---|
| 1 | Skill ecosystem utility | `skill-discovery-import`, `skill-portability` promotion, `mcp-builder`, `anthropic-api` |
| 2 | Local frontend/runtime fit | `react-best-practices`, `next-best-practices`, `next-cache-components`, `shadcn-ui`, `tailwind-css`, `radix-ui` |
| 3 | Browser and testing implementation | `playwright-browser-automation`, `playwright-best-practices`, `webapp-testing`, `vitest-jest-testing` |
| 4 | Document/file workflows | `document-workflows` or split `docx`, `pptx`, `xlsx`, `pdf-workflows` |
| 5 | Provider/platform implementation | `vercel-deployment`, `github-actions`, `stripe`, `sentry`, `neon-postgres`, `supabase` |
| 6 | Public-safe agent workflow migrations | `agent-task-delegation`, `session-lifecycle`, `autonomous-loop-patterns`, `git-worktree`, `orchestration` |
| 7 | Marketing/growth | `copywriting`, `seo-audit`, `page-cro`, `analytics-tracking`, `pricing-strategy`, `ai-seo` |
| 8 | Broader ecosystem packs | `cloudflare`, `firebase`, `convex`, `react-native`, `expo`, `ai-sdk`, `rag-architecture` |

## Skill Authoring Rules For This Roadmap

| Rule | Why |
|---|---|
| Prefer upgrading existing root skills when they are public-safe. | Faster and preserves prior knowledge. |
| Rewrite private/local Development skills before publishing. | `marketplace-skill-candidate-list.md` found local/private path and project-name risks. |
| Keep provider skills separate from fundamentals. | `database-migration` should not absorb Supabase/Neon/Firebase specifics; `security-fundamentals` should not absorb Clerk/Auth0/Better Auth. |
| Add `relations.boundary` aggressively for adjacent public skills. | Public marketplaces reward discoverability, but Skill Graph value comes from routing precision. |
| Add evals before declaring `eval_state: verified`. | Skill Graph repo rules treat eval state as a truth claim. |
| Export-specific short descriptions should not weaken canonical descriptions. | Existing marketplace candidate review already found >1024-char descriptions; use export overrides when needed. |

## Immediate Next 10 Changes

| Rank | Change | Owner repo | Verification |
|---:|---|---|---|
| 1 | Author `skill-discovery-import` | `skill-graph` | `npm run lint`, routing eval for discovery/import prompts |
| 2 | Promote `skill-portability` into Skill Graph export | `skill-graph` | Manifest + marketplace export check |
| 3 | Port `playwright-cli` as `playwright-browser-automation` | `skill-graph` | Evals covering screenshot, snapshot, forms, no-MCP boundary |
| 4 | Port `mcp-builder` | `skill-graph` | Evals covering tool schema, resources, auth, inspector/testing |
| 5 | Port/update `react-best-practices` | `skill-graph` | Routing eval against React performance/component prompts |
| 6 | Port/update `next-best-practices` | `skill-graph` | Routing eval against App Router/RSC/cache prompts |
| 7 | Author `shadcn-ui` | `skill-graph` | Route against shadcn/component registry prompts; boundary with Radix |
| 8 | Author `document-workflows` | `skill-graph` | Evals for docx/pdf/pptx/xlsx routing and safety boundaries |
| 9 | Author/port `stripe` | `skill-graph` | Evals for checkout, webhooks, refunds, disputes; boundary with Sales Hub ledger recon |
| 10 | Rewrite public-safe `agent-task-delegation` | `skill-graph` | Privacy scan, routing eval for subagent/delegation prompts |

## Completeness Claim

Examined 19 evidence sources, 137 exported Skill Graph skills, 138 Skill Graph sample-manifest rows, 277 root shared skills, 447 root active manifest entries, 3 product/runtime package manifests, 7 skills.sh topic pages, the skills.sh leaderboard page, SkillsMP, Anthropic Skills repo/API listing, and AgentSkills overview. This output covers all examined sources and all 137 already-upgraded Skill Graph marketplace skills. Items excluded: full row-by-row review of 447 active root skills and full 1.4M SkillsMP corpus, because this pass used marketplace category/topic/leaderboard signals plus local inventory counts rather than a complete external crawl.
