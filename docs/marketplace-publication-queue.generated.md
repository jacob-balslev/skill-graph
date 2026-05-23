# Marketplace Publication Queue (generated)

Generated: 2026-05-23T13:44:00.447Z
Schema: 2.0.0
Generator: scripts/skill/build-skill-audit-worklist.js@0.4.0
Source ledger: `skill-graph/data/publication-classification.json`

> Auto-generated from `skill-graph/data/publication-classification.json` by
> `scripts/skill/build-skill-audit-worklist.js`. Do not hand-edit — re-run
> `node scripts/skill/build-skill-audit-worklist.js --write` after editing the ledger.

## Summary

- Publishable candidates: 136
- Sales-Hub-bound (excluded): 51
- Personal-infra (excluded): 29
- Already published (in OSS export): 143
- Tier counts: S=18 A=29 B=42 C=47
- Ledger entries total: 216

## Tier S — Publish immediately (5★) (n=18)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 1 | `advanced-css-layout` | 5 | port | no | demand-cluster | no | 235 |  |
| 2 | `autonomous-loop-patterns` | 5 | rewrite | yes | skills.sh-leaderboard | yes | 26 |  |
| 3 | `chrome-devtools-mcp` | 5 | port | no | skills.sh-leaderboard | no | 104 |  |
| 4 | `cursor` | 5 | port | minor | skills.sh-leaderboard | no | 243 |  |
| 5 | `dispatch-loop` | 5 | rewrite | yes | skills.sh-leaderboard | no | 155 |  |
| 6 | `docker` | 5 | port | minor | skills.sh-leaderboard | no | 265 |  |
| 7 | `git-worktree` | 5 | rewrite | yes | skills.sh-leaderboard | no | 198 |  |
| 8 | `hook-patterns` | 5 | port | minor | skills.sh-leaderboard | no |  |  |
| 9 | `human-in-the-loop` | 5 | port | minor | skills.sh-leaderboard | no | 87 |  |
| 10 | `linear` *(→ linear-cli)* | 5 | port+sanitize | yes | demand-cluster | no | 68 |  |
| 11 | `mcp-builder` | 5 | port | no | anthropic-official | no | 88 |  |
| 12 | `next-best-practices` | 5 | port+sanitize | yes | skills.sh-leaderboard | no | 201 |  |
| 13 | `next-cache-components` | 5 | port | minor | skills.sh-leaderboard | no | 299 |  |
| 14 | `pdf` | 5 | port | minor | anthropic-official | no | 202 |  |
| 15 | `playwright-cli` *(→ playwright-browser-automation)* | 5 | port | minor | skills.sh-leaderboard | no | 137 |  |
| 16 | `radix-ui` | 5 | port+sanitize | yes | skills.sh-leaderboard | no | 179 |  |
| 17 | `react-best-practices` | 5 | port+sanitize | yes | skills.sh-leaderboard | no | 180 |  |
| 18 | `vercel` *(→ vercel-deployment)* | 5 | port | minor | skills.sh-leaderboard | no | 211 |  |

## Tier A — High demand, second wave (4★) (n=29)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 19 | `agent-messaging` | 4 | port+sanitize | yes | demand-cluster | no | 99 | cross-agent comm patterns; companion to a2a-protocol |
| 20 | `agent-session-handoff` | 4 | rewrite | yes | demand-cluster | no | 57 | session continuity; matches multi-agent demand |
| 21 | `agent-task-delegation` | 4 | rewrite | yes | skills.sh-leaderboard | no | 24 | subagent + dispatch patterns; skills.sh agent-workflows |
| 22 | `chat-interface` | 4 | rewrite | yes | demand-cluster | no | 260 | chat UI patterns; demand from AI app builders |
| 23 | `dark-mode` | 4 | port | minor | skills.sh-leaderboard | no | 195 | skills.sh design topic; companion to `dark-mode-implementation` (already pub) |
| 24 | `doc-co-authoring` | 4 | port | no | anthropic-official | no | 85 | Anthropic official slot is `doc-coauthoring` |
| 25 | `doc-updater` | 4 | port+sanitize | yes | demand-cluster | no | 172 | doc routing protocol — high demand |
| 26 | `docs-development` | 4 | port | minor | demand-cluster | no | 130 | docs-as-code; broad audience |
| 27 | `editorial-standards` | 4 | port | no | demand-cluster | no | 35 | doc quality bar; complements writing-humanizer |
| 28 | `email-templates` | 4 | port+sanitize | yes | demand-cluster | no | 108 | email patterns; transactional + marketing |
| 29 | `form-input-ux` | 4 | port | minor | demand-cluster | no | 222 | every app has forms |
| 30 | `frontend` | 4 | port | minor | demand-cluster | no | 135 | umbrella router skill |
| 31 | `frontend-structure` | 4 | port | minor | demand-cluster | no | 248 | folder + module conventions |
| 32 | `graphql` | 4 | port+sanitize | yes | demand-cluster | no | 66 | GraphQL patterns; broad demand |
| 33 | `i18n` | 4 | port | minor | demand-cluster | no | 290 | internationalization — every consumer app |
| 34 | `knowledge-graph` | 4 | port | minor | demand-cluster | no | 136 | Skill Graph differentiation; complements `context-graph` |
| 35 | `linting` | 4 | port+sanitize | yes | demand-cluster | no | 175 | ESLint + custom rule patterns |
| 36 | `memory-gardener` | 4 | port | minor | demand-cluster | no | 112 | agent memory CRUD/index |
| 37 | `memory-prune` | 4 | port | minor | demand-cluster | no | 13 | agent memory hygiene |
| 38 | `methodical` | 4 | rewrite | yes | demand-cluster | no | 177 | RLHF anti-patterns; very portable methodology |
| 39 | `middleware-architecture` | 4 | port | no | demand-cluster | no | 89 | Next.js/Express middleware patterns |
| 40 | `motion-design` | 4 | port | no | skills.sh-leaderboard | no | 270 | skills.sh design topic; `delight` adjacent |
| 41 | `no-cutting-corners` | 4 | port | no | demand-cluster | no | 293 | quality doctrine; companion to `methodical` |
| 42 | `quality-doctrine` | 4 | port | no | demand-cluster | no | 138 | per-artifact quality definitions |
| 43 | `self-evaluation` | 4 | port | no | demand-cluster | no | 186 | 1-5 self-score pattern; agent quality |
| 44 | `self-review-pattern` | 4 | port | no | demand-cluster | no | 229 | generate-critique-revise; eval discipline |
| 45 | `task-execution` | 4 | port | minor | demand-cluster | no | 74 | task workflow; complements `prioritization` (already pub) |
| 46 | `task-lifecycle` | 4 | rewrite | yes | demand-cluster | no | 92 | task state machine; agent ops |
| 47 | `wardley-mapping` | 4 | port | no | demand-cluster | no | 75 | strategic mapping — surging demand 2026 |

## Tier B — Standard utility (3★) (n=42)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 48 | `adr` | 3 | port | no | niche | no | 76 | already partial dup of `architecture-decision-records` — merge or supersede |
| 49 | `agent-behavior` | 3 | port | minor | niche | no | 123 | agent behavior patterns |
| 50 | `agent-code-documentation` | 3 | port | no | niche | no | 124 | code doc patterns for agent-edited code |
| 51 | `agent-loop-infra` | 3 | rewrite | yes | niche | no | 54 | loop checkpoint state machine |
| 52 | `agent-observability` | 3 | port | minor | niche | no | 55 | telemetry pipeline patterns |
| 53 | `agent-script-control` | 3 | port | minor | niche | no | 100 | agent-driven shell control |
| 54 | `agent-task-brief` | 3 | port | minor | niche | no | 58 | task spec authoring for agents |
| 55 | `agent-to-agent` | 3 | port | minor | niche | no | 101 | A2A protocol primer |
| 56 | `agents` | 3 | port | minor | niche | no | 25 | agent system overview |
| 57 | `ai-coding-agents` | 3 | port+sanitize | yes | demand-cluster | no | 77 | agent roster + routing — popular topic |
| 58 | `backend` | 3 | port | minor | niche | no | 103 | backend patterns umbrella |
| 59 | `backend-structure` | 3 | port | minor | niche | no | 146 | backend folder/module conventions |
| 60 | `breakpoint-strategy` | 3 | port | no | niche | no | 286 | responsive breakpoint design |
| 61 | `browser-support` | 3 | port | no | niche | no | 127 | browser compat decisions |
| 62 | `categorization` | 3 | port | no | niche | no | 147 | classification methodology |
| 63 | `code-logic` | 3 | port | minor | niche | no | 30 | code reasoning patterns |
| 64 | `codebase-search` | 3 | port | minor | niche | no | 148 | grep / glob / agent search patterns |
| 65 | `composition-theory` | 3 | port | no | niche | no | 105 | composition primitives |
| 66 | `content-strategy` | 3 | port | no | niche | no | 32 | content audit + lifecycle |
| 67 | `contracts` | 3 | port+sanitize | yes | niche | no | 217 | software contract patterns |
| 68 | `copywriting` | 3 | port+sanitize | yes | niche | no | 82 | marketing copy; sales-hub-flavored body |
| 69 | `csv` | 3 | port | no | niche | no | 242 | CSV format patterns |
| 70 | `data-architect` | 3 | port | minor | niche | no | 261 | data architecture role/patterns |
| 71 | `data-science` | 3 | port | minor | niche | no | 168 | data science workflow |
| 72 | `data-sync` | 3 | port | minor | niche | no | 33 | data sync patterns |
| 73 | `data-table-ux` | 3 | port | minor | niche | no | 169 | TanStack Table adjacent |
| 74 | `data-viz` | 3 | port+sanitize | yes | niche | no | 151 | chart selection patterns |
| 75 | `dead-code-detection` | 3 | port | minor | niche | no | 288 | knip / ts-prune patterns |
| 76 | `dependency-management` | 3 | port | no | niche | no | 263 | npm/pnpm patterns |
| 77 | `design-execution` | 3 | port+sanitize | yes | niche | no | 128 | design implementation workflow |
| 78 | `design-guide` | 3 | port | yes | niche | no | 152 | design system authoring |
| 79 | `design-qa-gate` | 3 | port | minor | niche | no | 153 | design QA pattern |
| 80 | `design-review` | 3 | port | minor | niche | no | 244 | design review checklist |
| 81 | `design-token-architecture` | 3 | port | minor | niche | no | 170 | design token system |
| 82 | `digital-empire` | 3 | port | yes | niche | no | 154 | business model patterns; consider rename |
| 83 | `dnd-kit` | 3 | port | no | niche | no | 264 | drag-and-drop patterns |
| 84 | `dorothy` | 3 | port | yes | niche | no | 219 | dialog/decision methodology; consider rename |
| 85 | `ecosystem-modeling` | 3 | port | minor | niche | no | 107 | ecosystem mapping |
| 86 | `edge-case-matrix` | 3 | port | no | niche | no | 131 | edge case enumeration |
| 87 | `experiment` | 3 | port | minor | niche | no | 173 | experimentation workflow |
| 88 | `feature-gating` | 3 | port | minor | niche | no | 134 | feature flag patterns |
| 89 | `feedback-collection` | 3 | port | minor | niche | no | 197 | feedback loop patterns |

## Tier C — Niche but publishable (2★) (n=47)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 90 | `file-splitting` | 2 | port | no | niche | no | 308 | file size discipline |
| 91 | `folder-structure` | 2 | port | minor | niche | no | 303 | folder org patterns |
| 92 | `ghostty` | 2 | port | minor | niche | no | 157 | Ghostty terminal config |
| 93 | `glossary` | 2 | port | no | niche | no |  | terminology management |
| 94 | `identifying-bottlenecks` | 2 | port | minor | niche | no | 174 | perf bottleneck triage |
| 95 | `ontology` | 2 | port | no | niche | no |  | already partial dup of `ontology-modeling` — merge |
| 96 | `ooda-loop` | 2 | port | no | niche | no | 113 | OODA methodology |
| 97 | `orchestration` | 2 | rewrite | yes | niche | no | 40 | orchestration patterns |
| 98 | `perceptual-integration` | 2 | port | minor | niche | no | 227 | UX perception patterns |
| 99 | `perspective` | 2 | rewrite | yes | niche | no | 203 | viewpoint/framing methodology |
| 100 | `provider-abstraction` | 2 | port+sanitize | yes | niche | no | 43 | provider adapter patterns |
| 101 | `rate-limiting` | 2 | port | minor | niche | no | 139 | rate limiting patterns |
| 102 | `repository-structure` | 2 | port | minor | niche | no | 271 | monorepo structure patterns |
| 103 | `responsive` | 2 | port | no | niche | no | 140 | responsive design patterns |
| 104 | `review-tooling` | 2 | port | minor | niche | no | 160 | code review tools survey |
| 105 | `scss-expert` | 2 | port | no | niche | no | 141 | SCSS patterns |
| 106 | `seo-audit` | 2 | port+sanitize | yes | niche | no | 283 | SEO audit checklist |
| 107 | `sequential-thinking` | 2 | rewrite | yes | niche | no | 272 | sequential reasoning method |
| 108 | `session-lifecycle` | 2 | rewrite | yes | niche | no | 70 | session hygiene |
| 109 | `session-progression` | 2 | port | minor | niche | no | 71 | session state progression |
| 110 | `session-structure` | 2 | port | minor | niche | no | 115 | session shape patterns |
| 111 | `shape-up` | 2 | port | no | niche | no | 188 | Basecamp Shape Up methodology |
| 112 | `site-architecture` | 2 | port | minor | niche | no | 230 | IA patterns |
| 113 | `skill-evolution` | 2 | port | minor | niche | no | 72 | corpus walker pattern |
| 114 | `skill-portability` | 2 | port | minor | niche | no | 207 | cross-CLI conversion |
| 115 | `streaming` | 2 | rewrite | yes | niche | no | 189 | streaming patterns |
| 116 | `task-evaluation` | 2 | port | minor | niche | no | 73 | task quality scoring |
| 117 | `task-path-optimization` | 2 | port | minor | niche | yes | 47 | task graph optimization |
| 118 | `task-progression` | 2 | rewrite | yes | niche | no | 48 | task state progression |
| 119 | `task-sizing` | 2 | rewrite | yes | niche | no | 118 | task sizing methodology |
| 120 | `task-structure` | 2 | port | minor | niche | no | 142 | task shape patterns |
| 121 | `taxonomy` | 2 | port | no | niche | no |  | already partial dup of `taxonomy-design` — merge |
| 122 | `teaching-patterns` | 2 | port | no | niche | no | 209 | teaching/onboarding patterns |
| 123 | `technical-debt` | 2 | port | no | niche | no | 295 | tech debt tracking |
| 124 | `test-coverage` | 2 | port+sanitize | yes | niche | no | 234 | dup of `test-coverage-strategy` — merge |
| 125 | `test-generator` | 2 | port | minor | niche | no | 143 | test scaffolding patterns |
| 126 | `theme-factory` | 2 | port | no | anthropic-official | no | 273 | Anthropic official slot — port may conflict |
| 127 | `threaded-conversations` | 2 | rewrite | yes | niche | no | 119 | threaded UI patterns |
| 128 | `todo-lists` | 2 | port | no | niche | no | 144 | TODO/task UI patterns |
| 129 | `token-cost-estimation` | 2 | rewrite | yes | niche | no | 93 | LLM token cost math |
| 130 | `token-efficiency` | 2 | rewrite | yes | niche | no | 145 | token-efficient agent patterns |
| 131 | `tui` | 2 | rewrite | yes | niche | no | 191 | terminal UI patterns |
| 132 | `typography` | 2 | port | no | niche | no | 95 | dup of `typography-system` — merge |
| 133 | `ui-ux` | 2 | port+sanitize | yes | niche | no | 50 | UI/UX checklist |
| 134 | `ux-ui-patterns` | 2 | port | no | niche | no | 275 | UX pattern library |
| 135 | `value-engineering` | 2 | port | no | niche | no | 23 | value engineering methodology |
| 136 | `visual-design` | 2 | port | no | niche | no | 121 | dup of `visual-design-foundations` — merge |

## Conflicts (51)

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
| `temporal-data-patterns` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `troubleshooting` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `url-state-management` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `user-research-synthesis` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `vulnerability` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |
| `websocket` | sales-hub-bound | shared | ledger marks sales-hub-bound but skill is in shared scope; verify ledger reflects current truth |

## Orphan ledger entries (4)

Ledger names skills not present in the active manifest or marketplace export. Likely archived or stale.

- `hook-patterns`
- `glossary`
- `ontology`
- `taxonomy`

## Supersedes

- `skill-graph/docs/_archived/marketplace-publication-priority-2026-05-18.md`

