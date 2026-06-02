# Marketplace Publication Queue (generated)

Generated: 2026-06-02T06:38:54.841Z
Schema: 2.0.0
Generator: scripts/skill/build-skill-list.js@0.4.0
Source ledger: `skill-graph/data/publication-classification.json`

> Auto-generated from `skill-graph/data/publication-classification.json` by
> `scripts/skill/build-skill-list.js`. Do not hand-edit — re-run
> `node scripts/skill/build-skill-list.js --write` after editing the ledger.

## Summary

- Publishable candidates: 136
- Sales-Hub-bound (excluded): 51
- Personal-infra (excluded): 29
- Already published (in OSS export): 154
- Tier counts: S=18 A=29 B=42 C=47
- Ledger entries total: 216

## Tier S — Publish immediately (5★) (n=18)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 1 | `advanced-css-layout` | 5 | port | no | demand-cluster | no |  |  |
| 2 | `autonomous-loop-patterns` | 5 | rewrite | yes | skills.sh-leaderboard | yes | 48 |  |
| 3 | `chrome-devtools-mcp` | 5 | port | no | skills.sh-leaderboard | no |  |  |
| 4 | `cursor` | 5 | port | minor | skills.sh-leaderboard | no |  |  |
| 5 | `dispatch-loop` | 5 | rewrite | yes | skills.sh-leaderboard | no |  |  |
| 6 | `docker` | 5 | port | minor | skills.sh-leaderboard | no |  |  |
| 7 | `git-worktree` | 5 | rewrite | yes | skills.sh-leaderboard | no |  |  |
| 8 | `hook-patterns` | 5 | port | minor | skills.sh-leaderboard | no |  |  |
| 9 | `human-in-the-loop` | 5 | port | minor | skills.sh-leaderboard | no |  |  |
| 10 | `linear` *(→ linear-cli)* | 5 | port+sanitize | yes | demand-cluster | no |  |  |
| 11 | `mcp-builder` | 5 | port | no | anthropic-official | no |  |  |
| 12 | `next-best-practices` | 5 | port+sanitize | yes | skills.sh-leaderboard | no |  |  |
| 13 | `next-cache-components` | 5 | port | minor | skills.sh-leaderboard | no |  |  |
| 14 | `pdf` | 5 | port | minor | anthropic-official | no |  |  |
| 15 | `playwright-cli` *(→ playwright-browser-automation)* | 5 | port | minor | skills.sh-leaderboard | no |  |  |
| 16 | `radix-ui` | 5 | port+sanitize | yes | skills.sh-leaderboard | no |  |  |
| 17 | `react-best-practices` | 5 | port+sanitize | yes | skills.sh-leaderboard | no |  |  |
| 18 | `vercel` *(→ vercel-deployment)* | 5 | port | minor | skills.sh-leaderboard | no |  |  |

## Tier A — High demand, second wave (4★) (n=29)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 19 | `agent-messaging` | 4 | port+sanitize | yes | demand-cluster | no |  | cross-agent comm patterns; companion to a2a-protocol |
| 20 | `agent-session-handoff` | 4 | rewrite | yes | demand-cluster | no |  | session continuity; matches multi-agent demand |
| 21 | `agent-task-delegation` | 4 | rewrite | yes | skills.sh-leaderboard | no |  | subagent + dispatch patterns; skills.sh agent-workflows |
| 22 | `chat-interface` | 4 | rewrite | yes | demand-cluster | no |  | chat UI patterns; demand from AI app builders |
| 23 | `dark-mode` | 4 | port | minor | skills.sh-leaderboard | no |  | skills.sh design topic; companion to `dark-mode-implementation` (already pub) |
| 24 | `doc-co-authoring` | 4 | port | no | anthropic-official | no |  | Anthropic official slot is `doc-coauthoring` |
| 25 | `doc-updater` | 4 | port+sanitize | yes | demand-cluster | no |  | doc routing protocol — high demand |
| 26 | `docs-development` | 4 | port | minor | demand-cluster | no |  | docs-as-code; broad audience |
| 27 | `editorial-standards` | 4 | port | no | demand-cluster | no |  | doc quality bar; complements writing-humanizer |
| 28 | `email-templates` | 4 | port+sanitize | yes | demand-cluster | no |  | email patterns; transactional + marketing |
| 29 | `form-input-ux` | 4 | port | minor | demand-cluster | no |  | every app has forms |
| 30 | `frontend` | 4 | port | minor | demand-cluster | no |  | umbrella router skill |
| 31 | `frontend-structure` | 4 | port | minor | demand-cluster | no |  | folder + module conventions |
| 32 | `graphql` | 4 | port+sanitize | yes | demand-cluster | no |  | GraphQL patterns; broad demand |
| 33 | `i18n` | 4 | port | minor | demand-cluster | no |  | internationalization — every consumer app |
| 34 | `knowledge-graph` | 4 | port | minor | demand-cluster | no |  | Skill Graph differentiation; complements `context-graph` |
| 35 | `linting` | 4 | port+sanitize | yes | demand-cluster | no |  | ESLint + custom rule patterns |
| 36 | `memory-gardener` | 4 | port | minor | demand-cluster | no |  | agent memory CRUD/index |
| 37 | `memory-prune` | 4 | port | minor | demand-cluster | no |  | agent memory hygiene |
| 38 | `methodical` | 4 | rewrite | yes | demand-cluster | yes | 3 | RLHF anti-patterns; very portable methodology |
| 39 | `middleware-architecture` | 4 | port | no | demand-cluster | no |  | Next.js/Express middleware patterns |
| 40 | `motion-design` | 4 | port | no | skills.sh-leaderboard | no |  | skills.sh design topic; `delight` adjacent |
| 41 | `no-cutting-corners` | 4 | port | no | demand-cluster | no |  | quality doctrine; companion to `methodical` |
| 42 | `quality-doctrine` | 4 | port | no | demand-cluster | no |  | per-artifact quality definitions |
| 43 | `self-evaluation` | 4 | port | no | demand-cluster | no |  | 1-5 self-score pattern; agent quality |
| 44 | `self-review-pattern` | 4 | port | no | demand-cluster | no |  | generate-critique-revise; eval discipline |
| 45 | `task-execution` | 4 | port | minor | demand-cluster | no |  | task workflow; complements `prioritization` (already pub) |
| 46 | `task-lifecycle` | 4 | rewrite | yes | demand-cluster | no |  | task state machine; agent ops |
| 47 | `wardley-mapping` | 4 | port | no | demand-cluster | no |  | strategic mapping — surging demand 2026 |

## Tier B — Standard utility (3★) (n=42)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 48 | `adr` | 3 | port | no | niche | no |  | already partial dup of `architecture-decision-records` — merge or supersede |
| 49 | `agent-behavior` | 3 | port | minor | niche | no |  | agent behavior patterns |
| 50 | `agent-code-documentation` | 3 | port | no | niche | no |  | code doc patterns for agent-edited code |
| 51 | `agent-loop-infra` | 3 | rewrite | yes | niche | no |  | loop checkpoint state machine |
| 52 | `agent-observability` | 3 | port | minor | niche | no |  | telemetry pipeline patterns |
| 53 | `agent-script-control` | 3 | port | minor | niche | no |  | agent-driven shell control |
| 54 | `agent-task-brief` | 3 | port | minor | niche | no |  | task spec authoring for agents |
| 55 | `agent-to-agent` | 3 | port | minor | niche | no |  | A2A protocol primer |
| 56 | `agents` | 3 | port | minor | niche | no |  | agent system overview |
| 57 | `ai-coding-agents` | 3 | port+sanitize | yes | demand-cluster | no |  | agent roster + routing — popular topic |
| 58 | `backend` | 3 | port | minor | niche | no |  | backend patterns umbrella |
| 59 | `backend-structure` | 3 | port | minor | niche | no |  | backend folder/module conventions |
| 60 | `breakpoint-strategy` | 3 | port | no | niche | no |  | responsive breakpoint design |
| 61 | `browser-support` | 3 | port | no | niche | no |  | browser compat decisions |
| 62 | `categorization` | 3 | port | no | niche | no |  | classification methodology |
| 63 | `code-logic` | 3 | port | minor | niche | no |  | code reasoning patterns |
| 64 | `codebase-search` | 3 | port | minor | niche | no |  | grep / glob / agent search patterns |
| 65 | `composition-theory` | 3 | port | no | niche | no |  | composition primitives |
| 66 | `content-strategy` | 3 | port | no | niche | no |  | content audit + lifecycle |
| 67 | `contracts` | 3 | port+sanitize | yes | niche | no |  | software contract patterns |
| 68 | `copywriting` | 3 | port+sanitize | yes | niche | no |  | marketing copy; sales-hub-flavored body |
| 69 | `csv` | 3 | port | no | niche | no |  | CSV format patterns |
| 70 | `data-architect` | 3 | port | minor | niche | no |  | data architecture role/patterns |
| 71 | `data-science` | 3 | port | minor | niche | no |  | data science workflow |
| 72 | `data-sync` | 3 | port | minor | niche | no |  | data sync patterns |
| 73 | `data-table-ux` | 3 | port | minor | niche | no |  | TanStack Table adjacent |
| 74 | `data-viz` | 3 | port+sanitize | yes | niche | no |  | chart selection patterns |
| 75 | `dead-code-detection` | 3 | port | minor | niche | no |  | knip / ts-prune patterns |
| 76 | `dependency-management` | 3 | port | no | niche | no |  | npm/pnpm patterns |
| 77 | `design-execution` | 3 | port+sanitize | yes | niche | no |  | design implementation workflow |
| 78 | `design-guide` | 3 | port | yes | niche | no |  | design system authoring |
| 79 | `design-qa-gate` | 3 | port | minor | niche | no |  | design QA pattern |
| 80 | `design-review` | 3 | port | minor | niche | no |  | design review checklist |
| 81 | `design-token-architecture` | 3 | port | minor | niche | no |  | design token system |
| 82 | `digital-empire` | 3 | port | yes | niche | no |  | business model patterns; consider rename |
| 83 | `dnd-kit` | 3 | port | no | niche | no |  | drag-and-drop patterns |
| 84 | `dorothy` | 3 | port | yes | niche | no |  | dialog/decision methodology; consider rename |
| 85 | `ecosystem-modeling` | 3 | port | minor | niche | no |  | ecosystem mapping |
| 86 | `edge-case-matrix` | 3 | port | no | niche | no |  | edge case enumeration |
| 87 | `experiment` | 3 | port | minor | niche | no |  | experimentation workflow |
| 88 | `feature-gating` | 3 | port | minor | niche | no |  | feature flag patterns |
| 89 | `feedback-collection` | 3 | port | minor | niche | no |  | feedback loop patterns |

## Tier C — Niche but publishable (2★) (n=47)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 90 | `file-splitting` | 2 | port | no | niche | no |  | file size discipline |
| 91 | `folder-structure` | 2 | port | minor | niche | no |  | folder org patterns |
| 92 | `ghostty` | 2 | port | minor | niche | no |  | Ghostty terminal config |
| 93 | `glossary` | 2 | port | no | niche | no |  | terminology management |
| 94 | `identifying-bottlenecks` | 2 | port | minor | niche | no |  | perf bottleneck triage |
| 95 | `ontology` | 2 | port | no | niche | no |  | already partial dup of `ontology-modeling` — merge |
| 96 | `ooda-loop` | 2 | port | no | niche | no |  | OODA methodology |
| 97 | `orchestration` | 2 | rewrite | yes | niche | no |  | orchestration patterns |
| 98 | `perceptual-integration` | 2 | port | minor | niche | no |  | UX perception patterns |
| 99 | `perspective` | 2 | rewrite | yes | niche | no |  | viewpoint/framing methodology |
| 100 | `provider-abstraction` | 2 | port+sanitize | yes | niche | no |  | provider adapter patterns |
| 101 | `rate-limiting` | 2 | port | minor | niche | no |  | rate limiting patterns |
| 102 | `repository-structure` | 2 | port | minor | niche | no |  | monorepo structure patterns |
| 103 | `responsive` | 2 | port | no | niche | no |  | responsive design patterns |
| 104 | `review-tooling` | 2 | port | minor | niche | no |  | code review tools survey |
| 105 | `scss-expert` | 2 | port | no | niche | no |  | SCSS patterns |
| 106 | `seo-audit` | 2 | port+sanitize | yes | niche | no |  | SEO audit checklist |
| 107 | `sequential-thinking` | 2 | rewrite | yes | niche | no |  | sequential reasoning method |
| 108 | `session-lifecycle` | 2 | rewrite | yes | niche | no |  | session hygiene |
| 109 | `session-progression` | 2 | port | minor | niche | no |  | session state progression |
| 110 | `session-structure` | 2 | port | minor | niche | no |  | session shape patterns |
| 111 | `shape-up` | 2 | port | no | niche | no |  | Basecamp Shape Up methodology |
| 112 | `site-architecture` | 2 | port | minor | niche | no |  | IA patterns |
| 113 | `skill-evolution` | 2 | port | minor | niche | no | 1 | corpus walker pattern |
| 114 | `skill-portability` | 2 | port | minor | niche | no |  | cross-CLI conversion |
| 115 | `streaming` | 2 | rewrite | yes | niche | no |  | streaming patterns |
| 116 | `task-evaluation` | 2 | port | minor | niche | no |  | task quality scoring |
| 117 | `task-path-optimization` | 2 | port | minor | niche | yes | 37 | task graph optimization |
| 118 | `task-progression` | 2 | rewrite | yes | niche | no |  | task state progression |
| 119 | `task-sizing` | 2 | rewrite | yes | niche | no |  | task sizing methodology |
| 120 | `task-structure` | 2 | port | minor | niche | no |  | task shape patterns |
| 121 | `taxonomy` | 2 | port | no | niche | no |  | already partial dup of `taxonomy-design` — merge |
| 122 | `teaching-patterns` | 2 | port | no | niche | no |  | teaching/onboarding patterns |
| 123 | `technical-debt` | 2 | port | no | niche | no |  | tech debt tracking |
| 124 | `test-coverage` | 2 | port+sanitize | yes | niche | no |  | dup of `test-coverage-strategy` — merge |
| 125 | `test-generator` | 2 | port | minor | niche | no |  | test scaffolding patterns |
| 126 | `theme-factory` | 2 | port | no | anthropic-official | no |  | Anthropic official slot — port may conflict |
| 127 | `threaded-conversations` | 2 | rewrite | yes | niche | no |  | threaded UI patterns |
| 128 | `todo-lists` | 2 | port | no | niche | no |  | TODO/task UI patterns |
| 129 | `token-cost-estimation` | 2 | rewrite | yes | niche | no |  | LLM token cost math |
| 130 | `token-efficiency` | 2 | rewrite | yes | niche | no |  | token-efficient agent patterns |
| 131 | `tui` | 2 | rewrite | yes | niche | no |  | terminal UI patterns |
| 132 | `typography` | 2 | port | no | niche | no |  | dup of `typography-system` — merge |
| 133 | `ui-ux` | 2 | port+sanitize | yes | niche | no |  | UI/UX checklist |
| 134 | `ux-ui-patterns` | 2 | port | no | niche | no |  | UX pattern library |
| 135 | `value-engineering` | 2 | port | no | niche | no |  | value engineering methodology |
| 136 | `visual-design` | 2 | port | no | niche | no |  | dup of `visual-design-foundations` — merge |

## Orphan ledger entries (199)

Ledger names skills not present in the active manifest or marketplace export. Likely archived or stale.

- `mcp-builder`
- `playwright-cli`
- `react-best-practices`
- `next-best-practices`
- `next-cache-components`
- `hook-patterns`
- `advanced-css-layout`
- `pdf`
- `vercel`
- `git-worktree`
- `radix-ui`
- `dispatch-loop`
- `linear`
- `human-in-the-loop`
- `chrome-devtools-mcp`
- `docker`
- `cursor`
- `agent-task-delegation`
- `agent-messaging`
- `agent-session-handoff`
- `chat-interface`
- `dark-mode`
- `doc-co-authoring`
- `doc-updater`
- `docs-development`
- `editorial-standards`
- `email-templates`
- `form-input-ux`
- `frontend`
- `frontend-structure`
- `graphql`
- `i18n`
- `knowledge-graph`
- `linting`
- `memory-gardener`
- `memory-prune`
- `middleware-architecture`
- `motion-design`
- `no-cutting-corners`
- `quality-doctrine`
- `self-evaluation`
- `self-review-pattern`
- `task-execution`
- `task-lifecycle`
- `wardley-mapping`
- `adr`
- `agent-behavior`
- `agent-code-documentation`
- `agent-loop-infra`
- `agent-observability`
- `agent-script-control`
- `agent-task-brief`
- `agent-to-agent`
- `agents`
- `ai-coding-agents`
- `backend`
- `backend-structure`
- `breakpoint-strategy`
- `browser-support`
- `categorization`
- `code-logic`
- `codebase-search`
- `composition-theory`
- `content-strategy`
- `contracts`
- `copywriting`
- `csv`
- `data-architect`
- `data-science`
- `data-sync`
- `data-table-ux`
- `data-viz`
- `dead-code-detection`
- `dependency-management`
- `design-execution`
- `design-guide`
- `design-qa-gate`
- `design-review`
- `design-token-architecture`
- `digital-empire`
- `dnd-kit`
- `dorothy`
- `ecosystem-modeling`
- `edge-case-matrix`
- `experiment`
- `feature-gating`
- `feedback-collection`
- `file-splitting`
- `folder-structure`
- `ghostty`
- `glossary`
- `identifying-bottlenecks`
- `ontology`
- `ooda-loop`
- `orchestration`
- `perceptual-integration`
- `perspective`
- `provider-abstraction`
- `rate-limiting`
- `repository-structure`
- `responsive`
- `review-tooling`
- `scss-expert`
- `seo-audit`
- `sequential-thinking`
- `session-lifecycle`
- `session-progression`
- `session-structure`
- `shape-up`
- `site-architecture`
- `skill-portability`
- `streaming`
- `task-evaluation`
- `task-progression`
- `task-sizing`
- `task-structure`
- `taxonomy`
- `teaching-patterns`
- `technical-debt`
- `test-coverage`
- `test-generator`
- `theme-factory`
- `threaded-conversations`
- `todo-lists`
- `token-cost-estimation`
- `token-efficiency`
- `tui`
- `typography`
- `ui-ux`
- `ux-ui-patterns`
- `value-engineering`
- `visual-design`
- `a2a-protocol`
- `anomaly-detection`
- `api-key-management`
- `audit-traceability`
- `backfill-patterns`
- `banking`
- `benchmarking-engine`
- `bulk-operations`
- `business-structure`
- `canonical-unification`
- `configuration-patterns`
- `connector-blueprint`
- `cost-aggregation`
- `credential-encryption`
- `csv-import-adapters`
- `customer-journey`
- `dashboard-modules`
- `data-reconciliation`
- `demo-data-seeding`
- `deterministic`
- `domain-modeling`
- `duplicate-detection`
- `encryption`
- `entity-resolution`
- `entity-status`
- `financial-allocation`
- `financial-display-contract`
- `financial-metrics`
- `fulfillment`
- `gdpr-compliance`
- `inngest-orchestration`
- `invoice`
- `kpi-cards`
- `materialization-expert`
- `multi-tenancy-rls`
- `nextauth-patterns`
- `page-cro`
- `payment-lifecycle`
- `product-photo`
- `receipts`
- `sales-channels`
- `security-scanning`
- `state-machine-patterns`
- `stripe-ledger-recon`
- `structured-logging`
- `system-resilience`
- `system-watchdog`
- `temporal-data-patterns`
- `troubleshooting`
- `url-state-management`
- `user-research-synthesis`
- `vulnerability`
- `websocket`
- `agent-control`
- `agent-governance`
- `agent-identity`
- `agent-information-ontology`
- `agent-infrastructure`
- `agent-orchestration`
- `board-triage`
- `color-science`
- `conductor`
- `environment`
- `harness-engineering`
- `module-components`
- `orchestrator-ui`
- `vibe-kanban`

## Supersedes

- `skill-graph/docs/_archived/marketplace-publication-priority-2026-05-18.md`

