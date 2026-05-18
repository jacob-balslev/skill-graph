# Marketplace Publication Queue (generated)

Generated: 2026-05-18T10:55:00.441Z
Schema: 2.0.0
Generator: skill-audit-loop@0.3.0
Source ledger: `skill-graph/data/publication-classification.json`

> Auto-generated from `skill-graph/data/publication-classification.json` by
> `skill-audit-loop/src/build-skill-audit-worklist.js`. Do not hand-edit — re-run
> `node scripts/skill/build-skill-audit-worklist.js --write` after editing the ledger.

## Summary

- Publishable candidates: 136
- Sales-Hub-bound (excluded): 53
- Personal-infra (excluded): 27
- Already published (in OSS export): 140
- Tier counts: S=18 A=29 B=42 C=47
- Ledger entries total: 216

## Tier S — Publish immediately (5★) (n=18)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 1 | `advanced-css-layout` | 5 | port | no | demand-cluster | no | 287 |  |
| 2 | `autonomous-loop-patterns` | 5 | rewrite | yes | skills.sh-leaderboard | no | 35 |  |
| 3 | `chrome-devtools-mcp` | 5 | port | no | skills.sh-leaderboard | no | 115 |  |
| 4 | `cursor` | 5 | port | minor | skills.sh-leaderboard | no | 292 |  |
| 5 | `dispatch-loop` | 5 | rewrite | yes | skills.sh-leaderboard | no | 186 |  |
| 6 | `docker` | 5 | port | minor | skills.sh-leaderboard | no | 298 |  |
| 7 | `git-worktree` | 5 | rewrite | yes | skills.sh-leaderboard | no | 246 |  |
| 8 | `hook-patterns` | 5 | port | minor | skills.sh-leaderboard | no | 92 |  |
| 9 | `human-in-the-loop` | 5 | port | minor | skills.sh-leaderboard | no | 93 |  |
| 10 | `linear` *(→ linear-cli)* | 5 | port+sanitize | yes | demand-cluster | no | 70 |  |
| 11 | `mcp-builder` | 5 | port | no | anthropic-official | no | 94 |  |
| 12 | `next-best-practices` | 5 | port+sanitize | yes | skills.sh-leaderboard | no | 249 |  |
| 13 | `next-cache-components` | 5 | port | minor | skills.sh-leaderboard | no | 367 |  |
| 14 | `pdf` | 5 | port | minor | anthropic-official | no | 221 |  |
| 15 | `playwright-cli` *(→ playwright-browser-automation)* | 5 | port | minor | skills.sh-leaderboard | no | 124 |  |
| 16 | `radix-ui` | 5 | port+sanitize | yes | skills.sh-leaderboard | no | 224 |  |
| 17 | `react-best-practices` | 5 | port+sanitize | yes | skills.sh-leaderboard | no | 226 |  |
| 18 | `vercel` *(→ vercel-deployment)* | 5 | port | minor | skills.sh-leaderboard | no | 236 |  |

## Tier A — High demand, second wave (4★) (n=29)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 19 | `agent-messaging` | 4 | port+sanitize | yes | demand-cluster | no | 79 | cross-agent comm patterns; companion to a2a-protocol |
| 20 | `agent-session-handoff` | 4 | rewrite | yes | demand-cluster | no | 61 | session continuity; matches multi-agent demand |
| 21 | `agent-task-delegation` | 4 | rewrite | yes | skills.sh-leaderboard | no | 31 | subagent + dispatch patterns; skills.sh agent-workflows |
| 22 | `chat-interface` | 4 | rewrite | yes | demand-cluster | no | 320 | chat UI patterns; demand from AI app builders |
| 23 | `dark-mode` | 4 | port | minor | skills.sh-leaderboard | no | 241 | skills.sh design topic; companion to `dark-mode-implementation` (already pub) |
| 24 | `doc-co-authoring` | 4 | port | no | anthropic-official | no | 68 | Anthropic official slot is `doc-coauthoring` |
| 25 | `doc-updater` | 4 | port+sanitize | yes | demand-cluster | no | 210 | doc routing protocol — high demand |
| 26 | `docs-development` | 4 | port | minor | demand-cluster | no | 117 | docs-as-code; broad audience |
| 27 | `editorial-standards` | 4 | port | no | demand-cluster | no | 87 | doc quality bar; complements writing-humanizer |
| 28 | `email-templates` | 4 | port+sanitize | yes | demand-cluster | no | 350 | email patterns; transactional + marketing |
| 29 | `form-input-ux` | 4 | port | minor | demand-cluster | no | 245 | every app has forms |
| 30 | `frontend` | 4 | port | minor | demand-cluster | no | 155 | umbrella router skill |
| 31 | `frontend-structure` | 4 | port | minor | demand-cluster | no | 301 | folder + module conventions |
| 32 | `graphql` | 4 | port+sanitize | yes | demand-cluster | no | 46 | GraphQL patterns; broad demand |
| 33 | `i18n` | 4 | port | minor | demand-cluster | no | 355 | internationalization — every consumer app |
| 34 | `knowledge-graph` | 4 | port | minor | demand-cluster | no | 158 | Skill Graph differentiation; complements `context-graph` |
| 35 | `linting` | 4 | port+sanitize | yes | demand-cluster | no | 216 | ESLint + custom rule patterns |
| 36 | `memory-gardener` | 4 | port | minor | demand-cluster | no | 122 | agent memory CRUD/index |
| 37 | `memory-prune` | 4 | port | minor | demand-cluster | no | 21 | agent memory hygiene |
| 38 | `methodical` | 4 | rewrite | yes | demand-cluster | no | 218 | RLHF anti-patterns; very portable methodology |
| 39 | `middleware-architecture` | 4 | port | no | demand-cluster | no | 71 | Next.js/Express middleware patterns |
| 40 | `motion-design` | 4 | port | no | skills.sh-leaderboard | no | 328 | skills.sh design topic; `delight` adjacent |
| 41 | `no-cutting-corners` | 4 | port | no | demand-cluster | no | 427 | quality doctrine; companion to `methodical` |
| 42 | `quality-doctrine` | 4 | port | no | demand-cluster | no | 168 | per-artifact quality definitions |
| 43 | `self-evaluation` | 4 | port | no | demand-cluster | no | 229 | 1-5 self-score pattern; agent quality |
| 44 | `self-review-pattern` | 4 | port | no | demand-cluster | no | 281 | generate-critique-revise; eval discipline |
| 45 | `task-execution` | 4 | port | minor | demand-cluster | no | 100 | task workflow; complements `prioritization` (already pub) |
| 46 | `task-lifecycle` | 4 | rewrite | yes | demand-cluster | no | 101 | task state machine; agent ops |
| 47 | `wardley-mapping` | 4 | port | no | demand-cluster | no | 105 | strategic mapping — surging demand 2026 |

## Tier B — Standard utility (3★) (n=42)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 48 | `adr` | 3 | port | no | niche | no | 78 | already partial dup of `architecture-decision-records` — merge or supersede |
| 49 | `agent-behavior` | 3 | port | minor | niche | no | 311 | agent behavior patterns |
| 50 | `agent-code-documentation` | 3 | port | no | niche | no | 107 | code doc patterns for agent-edited code |
| 51 | `agent-loop-infra` | 3 | rewrite | yes | niche | no | 59 | loop checkpoint state machine |
| 52 | `agent-observability` | 3 | port | minor | niche | no | 60 | telemetry pipeline patterns |
| 53 | `agent-script-control` | 3 | port | minor | niche | no | 259 | agent-driven shell control |
| 54 | `agent-task-brief` | 3 | port | minor | niche | no | 62 | task spec authoring for agents |
| 55 | `agent-to-agent` | 3 | port | minor | niche | no | 110 | A2A protocol primer |
| 56 | `agents` | 3 | port | minor | niche | no | 32 | agent system overview |
| 57 | `ai-coding-agents` | 3 | port+sanitize | yes | demand-cluster | no | 80 | agent roster + routing — popular topic |
| 58 | `backend` | 3 | port | minor | niche | no | 113 | backend patterns umbrella |
| 59 | `backend-structure` | 3 | port | minor | niche | no | 179 | backend folder/module conventions |
| 60 | `breakpoint-strategy` | 3 | port | no | niche | no | 347 | responsive breakpoint design |
| 61 | `browser-support` | 3 | port | no | niche | no | 141 | browser compat decisions |
| 62 | `categorization` | 3 | port | no | niche | no | 180 | classification methodology |
| 63 | `code-logic` | 3 | port | minor | niche | no | 38 | code reasoning patterns |
| 64 | `codebase-search` | 3 | port | minor | niche | no | 182 | grep / glob / agent search patterns |
| 65 | `composition-theory` | 3 | port | no | niche | no | 116 | composition primitives |
| 66 | `content-strategy` | 3 | port | no | niche | no | 3 | content audit + lifecycle |
| 67 | `contracts` | 3 | port+sanitize | yes | niche | no | 264 | software contract patterns |
| 68 | `copywriting` | 3 | port+sanitize | yes | niche | no | 16 | marketing copy; sales-hub-flavored body |
| 69 | `csv` | 3 | port | no | niche | no | 265 | CSV format patterns |
| 70 | `data-architect` | 3 | port | minor | niche | no | 293 | data architecture role/patterns |
| 71 | `data-science` | 3 | port | minor | niche | no | 184 | data science workflow |
| 72 | `data-sync` | 3 | port | minor | niche | no | 42 | data sync patterns |
| 73 | `data-table-ux` | 3 | port | minor | niche | no | 206 | TanStack Table adjacent |
| 74 | `data-viz` | 3 | port+sanitize | yes | niche | no | 84 | chart selection patterns |
| 75 | `dead-code-detection` | 3 | port | minor | niche | no | 363 | knip / ts-prune patterns |
| 76 | `dependency-management` | 3 | port | no | niche | no | 295 | npm/pnpm patterns |
| 77 | `design-execution` | 3 | port+sanitize | yes | niche | no | 148 | design implementation workflow |
| 78 | `design-guide` | 3 | port | yes | niche | no | 149 | design system authoring |
| 79 | `design-qa-gate` | 3 | port | minor | niche | no | 185 | design QA pattern |
| 80 | `design-review` | 3 | port | minor | niche | no | 296 | design review checklist |
| 81 | `design-token-architecture` | 3 | port | minor | niche | no | 207 | design token system |
| 82 | `digital-empire` | 3 | port | yes | niche | no | 151 | business model patterns; consider rename |
| 83 | `dnd-kit` | 3 | port | no | niche | no | 323 | drag-and-drop patterns |
| 84 | `dorothy` | 3 | port | yes | niche | no | 268 | dialog/decision methodology; consider rename |
| 85 | `ecosystem-modeling` | 3 | port | minor | niche | no | 86 | ecosystem mapping |
| 86 | `edge-case-matrix` | 3 | port | no | niche | no | 153 | edge case enumeration |
| 87 | `experiment` | 3 | port | minor | niche | no | 211 | experimentation workflow |
| 88 | `feature-gating` | 3 | port | minor | niche | no | 88 | feature flag patterns |
| 89 | `feedback-collection` | 3 | port | minor | niche | no | 243 | feedback loop patterns |

## Tier C — Niche but publishable (2★) (n=47)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 90 | `file-splitting` | 2 | port | no | niche | no | 407 | file size discipline |
| 91 | `folder-structure` | 2 | port | minor | niche | no | 390 | folder org patterns |
| 92 | `ghostty` | 2 | port | minor | niche | no | 190 | Ghostty terminal config |
| 93 | `glossary` | 2 | port | no | niche | no | 91 | terminology management |
| 94 | `identifying-bottlenecks` | 2 | port | minor | niche | no | 214 | perf bottleneck triage |
| 95 | `ontology` | 2 | port | no | niche | no | 368 | already partial dup of `ontology-modeling` — merge |
| 96 | `ooda-loop` | 2 | port | no | niche | no | 163 | OODA methodology |
| 97 | `orchestration` | 2 | rewrite | yes | niche | no | 50 | orchestration patterns |
| 98 | `perceptual-integration` | 2 | port | minor | niche | no | 279 | UX perception patterns |
| 99 | `perspective` | 2 | rewrite | yes | niche | no | 222 | viewpoint/framing methodology |
| 100 | `provider-abstraction` | 2 | port+sanitize | yes | niche | no | 24 | provider adapter patterns |
| 101 | `rate-limiting` | 2 | port | minor | niche | no | 402 | rate limiting patterns |
| 102 | `repository-structure` | 2 | port | minor | niche | no | 335 | monorepo structure patterns |
| 103 | `responsive` | 2 | port | no | niche | no | 169 | responsive design patterns |
| 104 | `review-tooling` | 2 | port | minor | niche | no | 336 | code review tools survey |
| 105 | `scss-expert` | 2 | port | no | niche | no | 308 | SCSS patterns |
| 106 | `seo-audit` | 2 | port+sanitize | yes | niche | no | 360 | SEO audit checklist |
| 107 | `sequential-thinking` | 2 | rewrite | yes | niche | no | 338 | sequential reasoning method |
| 108 | `session-lifecycle` | 2 | rewrite | yes | niche | no | 72 | session hygiene |
| 109 | `session-progression` | 2 | port | minor | niche | no | 73 | session state progression |
| 110 | `session-structure` | 2 | port | minor | niche | no | 255 | session shape patterns |
| 111 | `shape-up` | 2 | port | no | niche | no | 231 | Basecamp Shape Up methodology |
| 112 | `site-architecture` | 2 | port | minor | niche | no | 282 | IA patterns |
| 113 | `skill-evolution` | 2 | port | minor | niche | no | 127 | corpus walker pattern |
| 114 | `skill-portability` | 2 | port | minor | niche | no | 256 | cross-CLI conversion |
| 115 | `streaming` | 2 | rewrite | yes | niche | no | 232 | streaming patterns |
| 116 | `task-evaluation` | 2 | port | minor | niche | no | 99 | task quality scoring |
| 117 | `task-path-optimization` | 2 | port | minor | niche | no | 54 | task graph optimization |
| 118 | `task-progression` | 2 | rewrite | yes | niche | no | 102 | task state progression |
| 119 | `task-sizing` | 2 | rewrite | yes | niche | no | 130 | task sizing methodology |
| 120 | `task-structure` | 2 | port | minor | niche | no | 284 | task shape patterns |
| 121 | `taxonomy` | 2 | port | no | niche | no | 233 | already partial dup of `taxonomy-design` — merge |
| 122 | `teaching-patterns` | 2 | port | no | niche | no | 196 | teaching/onboarding patterns |
| 123 | `technical-debt` | 2 | port | no | niche | no | 376 | tech debt tracking |
| 124 | `test-coverage` | 2 | port+sanitize | yes | niche | no | 285 | dup of `test-coverage-strategy` — merge |
| 125 | `test-generator` | 2 | port | minor | niche | no | 174 | test scaffolding patterns |
| 126 | `theme-factory` | 2 | port | no | anthropic-official | no | 340 | Anthropic official slot — port may conflict |
| 127 | `threaded-conversations` | 2 | rewrite | yes | niche | no | 103 | threaded UI patterns |
| 128 | `todo-lists` | 2 | port | no | niche | no | 176 | TODO/task UI patterns |
| 129 | `token-cost-estimation` | 2 | rewrite | yes | niche | no | 133 | LLM token cost math |
| 130 | `token-efficiency` | 2 | rewrite | yes | niche | no | 134 | token-efficient agent patterns |
| 131 | `tui` | 2 | rewrite | yes | niche | no | 234 | terminal UI patterns |
| 132 | `typography` | 2 | port | no | niche | no | 104 | dup of `typography-system` — merge |
| 133 | `ui-ux` | 2 | port+sanitize | yes | niche | no | 56 | UI/UX checklist |
| 134 | `ux-ui-patterns` | 2 | port | no | niche | no | 342 | UX pattern library |
| 135 | `value-engineering` | 2 | port | no | niche | no | 76 | value engineering methodology |
| 136 | `visual-design` | 2 | port | no | niche | no | 136 | dup of `visual-design-foundations` — merge |

## Conflicts (53)

Ledger classification disagrees with manifest scope. Resolve before next publication batch.

| Skill | Ledger | Manifest Scope | Reason |
| --- | --- | --- | --- |
| `a2a-protocol` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `anomaly-detection` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `api-key-management` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `audit-traceability` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `backfill-patterns` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `banking` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `benchmarking-engine` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `bulk-operations` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `business-structure` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `canonical-unification` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `configuration-patterns` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `connector-blueprint` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `cost-aggregation` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `credential-encryption` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `csv-import-adapters` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `customer-journey` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `dashboard-modules` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `data-reconciliation` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `demo-data-seeding` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `deterministic` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `domain-modeling` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `duplicate-detection` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `encryption` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `entity-resolution` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `entity-status` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `financial-allocation` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `financial-display-contract` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `financial-metrics` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `fulfillment` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `gdpr-compliance` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `inngest-orchestration` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `invoice` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `kpi-cards` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `materialization-expert` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `multi-tenancy-rls` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `nextauth-patterns` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `page-cro` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `payment-lifecycle` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `product-photo` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `receipts` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `sales-channels` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `security-scanning` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `state-machine-patterns` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `stripe-ledger-recon` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `structured-logging` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `system-resilience` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `system-watchdog` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `temporal-data-patterns` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `troubleshooting` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `url-state-management` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `user-research-synthesis` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `vulnerability` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `websocket` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |

## Supersedes

- `skill-graph/docs/_archived/marketplace-publication-priority-2026-05-18.md`

