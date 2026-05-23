# Marketplace Publication Queue (generated)

Generated: 2026-05-23T17:21:56.722Z
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
| 1 | `advanced-css-layout` | 5 | port | no | demand-cluster | no | 242 |  |
| 2 | `autonomous-loop-patterns` | 5 | rewrite | yes | skills.sh-leaderboard | yes | 28 |  |
| 3 | `chrome-devtools-mcp` | 5 | port | no | skills.sh-leaderboard | no | 114 |  |
| 4 | `cursor` | 5 | port | minor | skills.sh-leaderboard | no | 249 |  |
| 5 | `dispatch-loop` | 5 | rewrite | yes | skills.sh-leaderboard | no | 167 |  |
| 6 | `docker` | 5 | port | minor | skills.sh-leaderboard | no | 270 |  |
| 7 | `git-worktree` | 5 | rewrite | yes | skills.sh-leaderboard | no | 209 |  |
| 8 | `hook-patterns` | 5 | port | minor | skills.sh-leaderboard | no |  |  |
| 9 | `human-in-the-loop` | 5 | port | minor | skills.sh-leaderboard | no | 95 |  |
| 10 | `linear` *(→ linear-cli)* | 5 | port+sanitize | yes | demand-cluster | no | 71 |  |
| 11 | `mcp-builder` | 5 | port | no | anthropic-official | no | 96 |  |
| 12 | `next-best-practices` | 5 | port+sanitize | yes | skills.sh-leaderboard | no | 212 |  |
| 13 | `next-cache-components` | 5 | port | minor | skills.sh-leaderboard | no | 305 |  |
| 14 | `pdf` | 5 | port | minor | anthropic-official | no | 213 |  |
| 15 | `playwright-cli` *(→ playwright-browser-automation)* | 5 | port | minor | skills.sh-leaderboard | no | 150 |  |
| 16 | `radix-ui` | 5 | port+sanitize | yes | skills.sh-leaderboard | no | 191 |  |
| 17 | `react-best-practices` | 5 | port+sanitize | yes | skills.sh-leaderboard | no | 192 |  |
| 18 | `vercel` *(→ vercel-deployment)* | 5 | port | minor | skills.sh-leaderboard | no | 222 |  |

## Tier A — High demand, second wave (4★) (n=29)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 19 | `agent-messaging` | 4 | port+sanitize | yes | demand-cluster | no | 108 | cross-agent comm patterns; companion to a2a-protocol |
| 20 | `agent-session-handoff` | 4 | rewrite | yes | demand-cluster | no | 60 | session continuity; matches multi-agent demand |
| 21 | `agent-task-delegation` | 4 | rewrite | yes | skills.sh-leaderboard | no | 26 | subagent + dispatch patterns; skills.sh agent-workflows |
| 22 | `chat-interface` | 4 | rewrite | yes | demand-cluster | no | 265 | chat UI patterns; demand from AI app builders |
| 23 | `dark-mode` | 4 | port | minor | skills.sh-leaderboard | no | 206 | skills.sh design topic; companion to `dark-mode-implementation` (already pub) |
| 24 | `doc-co-authoring` | 4 | port | no | anthropic-official | no | 91 | Anthropic official slot is `doc-coauthoring` |
| 25 | `doc-updater` | 4 | port+sanitize | yes | demand-cluster | no | 183 | doc routing protocol — high demand |
| 26 | `docs-development` | 4 | port | minor | demand-cluster | no | 142 | docs-as-code; broad audience |
| 27 | `editorial-standards` | 4 | port | no | demand-cluster | no | 37 | doc quality bar; complements writing-humanizer |
| 28 | `email-templates` | 4 | port+sanitize | yes | demand-cluster | no | 93 | email patterns; transactional + marketing |
| 29 | `form-input-ux` | 4 | port | minor | demand-cluster | no | 231 | every app has forms |
| 30 | `frontend` | 4 | port | minor | demand-cluster | no | 147 | umbrella router skill |
| 31 | `frontend-structure` | 4 | port | minor | demand-cluster | no | 254 | folder + module conventions |
| 32 | `graphql` | 4 | port+sanitize | yes | demand-cluster | no | 69 | GraphQL patterns; broad demand |
| 33 | `i18n` | 4 | port | minor | demand-cluster | no | 298 | internationalization — every consumer app |
| 34 | `knowledge-graph` | 4 | port | minor | demand-cluster | no | 148 | Skill Graph differentiation; complements `context-graph` |
| 35 | `linting` | 4 | port+sanitize | yes | demand-cluster | no | 186 | ESLint + custom rule patterns |
| 36 | `memory-gardener` | 4 | port | minor | demand-cluster | no | 120 | agent memory CRUD/index |
| 37 | `memory-prune` | 4 | port | minor | demand-cluster | no | 13 | agent memory hygiene |
| 38 | `methodical` | 4 | rewrite | yes | demand-cluster | no | 188 | RLHF anti-patterns; very portable methodology |
| 39 | `middleware-architecture` | 4 | port | no | demand-cluster | no | 97 | Next.js/Express middleware patterns |
| 40 | `motion-design` | 4 | port | no | skills.sh-leaderboard | no | 275 | skills.sh design topic; `delight` adjacent |
| 41 | `no-cutting-corners` | 4 | port | no | demand-cluster | no | 301 | quality doctrine; companion to `methodical` |
| 42 | `quality-doctrine` | 4 | port | no | demand-cluster | no | 151 | per-artifact quality definitions |
| 43 | `self-evaluation` | 4 | port | no | demand-cluster | no | 194 | 1-5 self-score pattern; agent quality |
| 44 | `self-review-pattern` | 4 | port | no | demand-cluster | no | 239 | generate-critique-revise; eval discipline |
| 45 | `task-execution` | 4 | port | minor | demand-cluster | no | 78 | task workflow; complements `prioritization` (already pub) |
| 46 | `task-lifecycle` | 4 | rewrite | yes | demand-cluster | no | 101 | task state machine; agent ops |
| 47 | `wardley-mapping` | 4 | port | no | demand-cluster | no | 79 | strategic mapping — surging demand 2026 |

## Tier B — Standard utility (3★) (n=42)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 48 | `adr` | 3 | port | no | niche | no | 80 | already partial dup of `architecture-decision-records` — merge or supersede |
| 49 | `agent-behavior` | 3 | port | minor | niche | no | 134 | agent behavior patterns |
| 50 | `agent-code-documentation` | 3 | port | no | niche | no | 135 | code doc patterns for agent-edited code |
| 51 | `agent-loop-infra` | 3 | rewrite | yes | niche | no | 57 | loop checkpoint state machine |
| 52 | `agent-observability` | 3 | port | minor | niche | no | 58 | telemetry pipeline patterns |
| 53 | `agent-script-control` | 3 | port | minor | niche | no | 111 | agent-driven shell control |
| 54 | `agent-task-brief` | 3 | port | minor | niche | no | 61 | task spec authoring for agents |
| 55 | `agent-to-agent` | 3 | port | minor | niche | no | 112 | A2A protocol primer |
| 56 | `agents` | 3 | port | minor | niche | no | 27 | agent system overview |
| 57 | `ai-coding-agents` | 3 | port+sanitize | yes | demand-cluster | no | 82 | agent roster + routing — popular topic |
| 58 | `backend` | 3 | port | minor | niche | no | 84 | backend patterns umbrella |
| 59 | `backend-structure` | 3 | port | minor | niche | no | 158 | backend folder/module conventions |
| 60 | `breakpoint-strategy` | 3 | port | no | niche | no | 294 | responsive breakpoint design |
| 61 | `browser-support` | 3 | port | no | niche | no | 139 | browser compat decisions |
| 62 | `categorization` | 3 | port | no | niche | no | 159 | classification methodology |
| 63 | `code-logic` | 3 | port | minor | niche | no | 32 | code reasoning patterns |
| 64 | `codebase-search` | 3 | port | minor | niche | no | 160 | grep / glob / agent search patterns |
| 65 | `composition-theory` | 3 | port | no | niche | no | 115 | composition primitives |
| 66 | `content-strategy` | 3 | port | no | niche | no | 34 | content audit + lifecycle |
| 67 | `contracts` | 3 | port+sanitize | yes | niche | no | 226 | software contract patterns |
| 68 | `copywriting` | 3 | port+sanitize | yes | niche | no | 88 | marketing copy; sales-hub-flavored body |
| 69 | `csv` | 3 | port | no | niche | no | 248 | CSV format patterns |
| 70 | `data-architect` | 3 | port | minor | niche | no | 266 | data architecture role/patterns |
| 71 | `data-science` | 3 | port | minor | niche | no | 179 | data science workflow |
| 72 | `data-sync` | 3 | port | minor | niche | no | 35 | data sync patterns |
| 73 | `data-table-ux` | 3 | port | minor | niche | no | 180 | TanStack Table adjacent |
| 74 | `data-viz` | 3 | port+sanitize | yes | niche | no | 163 | chart selection patterns |
| 75 | `dead-code-detection` | 3 | port | minor | niche | no | 296 | knip / ts-prune patterns |
| 76 | `dependency-management` | 3 | port | no | niche | no | 268 | npm/pnpm patterns |
| 77 | `design-execution` | 3 | port+sanitize | yes | niche | no | 140 | design implementation workflow |
| 78 | `design-guide` | 3 | port | yes | niche | no | 164 | design system authoring |
| 79 | `design-qa-gate` | 3 | port | minor | niche | no | 165 | design QA pattern |
| 80 | `design-review` | 3 | port | minor | niche | no | 250 | design review checklist |
| 81 | `design-token-architecture` | 3 | port | minor | niche | no | 181 | design token system |
| 82 | `digital-empire` | 3 | port | yes | niche | no | 166 | business model patterns; consider rename |
| 83 | `dnd-kit` | 3 | port | no | niche | no | 269 | drag-and-drop patterns |
| 84 | `dorothy` | 3 | port | yes | niche | no | 228 | dialog/decision methodology; consider rename |
| 85 | `ecosystem-modeling` | 3 | port | minor | niche | no | 117 | ecosystem mapping |
| 86 | `edge-case-matrix` | 3 | port | no | niche | no | 143 | edge case enumeration |
| 87 | `experiment` | 3 | port | minor | niche | no | 184 | experimentation workflow |
| 88 | `feature-gating` | 3 | port | minor | niche | no | 146 | feature flag patterns |
| 89 | `feedback-collection` | 3 | port | minor | niche | no | 208 | feedback loop patterns |

## Tier C — Niche but publishable (2★) (n=47)

| Rank | Skill | Pop | Source | Sanitize? | Demand | In Export | Audit Rank | Notes |
| --- | --- | ---: | --- | --- | --- | ---: | ---: | --- |
| 90 | `file-splitting` | 2 | port | no | niche | no | 310 | file size discipline |
| 91 | `folder-structure` | 2 | port | minor | niche | no | 308 | folder org patterns |
| 92 | `ghostty` | 2 | port | minor | niche | no | 169 | Ghostty terminal config |
| 93 | `glossary` | 2 | port | no | niche | no |  | terminology management |
| 94 | `identifying-bottlenecks` | 2 | port | minor | niche | no | 185 | perf bottleneck triage |
| 95 | `ontology` | 2 | port | no | niche | no |  | already partial dup of `ontology-modeling` — merge |
| 96 | `ooda-loop` | 2 | port | no | niche | no | 121 | OODA methodology |
| 97 | `orchestration` | 2 | rewrite | yes | niche | no | 41 | orchestration patterns |
| 98 | `perceptual-integration` | 2 | port | minor | niche | no | 236 | UX perception patterns |
| 99 | `perspective` | 2 | rewrite | yes | niche | no | 214 | viewpoint/framing methodology |
| 100 | `provider-abstraction` | 2 | port+sanitize | yes | niche | no | 44 | provider adapter patterns |
| 101 | `rate-limiting` | 2 | port | minor | niche | no | 123 | rate limiting patterns |
| 102 | `repository-structure` | 2 | port | minor | niche | no | 277 | monorepo structure patterns |
| 103 | `responsive` | 2 | port | no | niche | no | 152 | responsive design patterns |
| 104 | `review-tooling` | 2 | port | minor | niche | no | 171 | code review tools survey |
| 105 | `scss-expert` | 2 | port | no | niche | no | 153 | SCSS patterns |
| 106 | `seo-audit` | 2 | port+sanitize | yes | niche | no | 291 | SEO audit checklist |
| 107 | `sequential-thinking` | 2 | rewrite | yes | niche | no | 278 | sequential reasoning method |
| 108 | `session-lifecycle` | 2 | rewrite | yes | niche | no | 74 | session hygiene |
| 109 | `session-progression` | 2 | port | minor | niche | no | 75 | session state progression |
| 110 | `session-structure` | 2 | port | minor | niche | no | 124 | session shape patterns |
| 111 | `shape-up` | 2 | port | no | niche | no | 196 | Basecamp Shape Up methodology |
| 112 | `site-architecture` | 2 | port | minor | niche | no | 240 | IA patterns |
| 113 | `skill-evolution` | 2 | port | minor | niche | no | 76 | corpus walker pattern |
| 114 | `skill-portability` | 2 | port | minor | niche | no | 197 | cross-CLI conversion |
| 115 | `streaming` | 2 | rewrite | yes | niche | no | 198 | streaming patterns |
| 116 | `task-evaluation` | 2 | port | minor | niche | no | 77 | task quality scoring |
| 117 | `task-path-optimization` | 2 | port | minor | niche | yes | 50 | task graph optimization |
| 118 | `task-progression` | 2 | rewrite | yes | niche | no | 51 | task state progression |
| 119 | `task-sizing` | 2 | rewrite | yes | niche | no | 129 | task sizing methodology |
| 120 | `task-structure` | 2 | port | minor | niche | no | 154 | task shape patterns |
| 121 | `taxonomy` | 2 | port | no | niche | no |  | already partial dup of `taxonomy-design` — merge |
| 122 | `teaching-patterns` | 2 | port | no | niche | no | 220 | teaching/onboarding patterns |
| 123 | `technical-debt` | 2 | port | no | niche | no | 302 | tech debt tracking |
| 124 | `test-coverage` | 2 | port+sanitize | yes | niche | no | 241 | dup of `test-coverage-strategy` — merge |
| 125 | `test-generator` | 2 | port | minor | niche | no | 155 | test scaffolding patterns |
| 126 | `theme-factory` | 2 | port | no | anthropic-official | no | 279 | Anthropic official slot — port may conflict |
| 127 | `threaded-conversations` | 2 | rewrite | yes | niche | no | 130 | threaded UI patterns |
| 128 | `todo-lists` | 2 | port | no | niche | no | 156 | TODO/task UI patterns |
| 129 | `token-cost-estimation` | 2 | rewrite | yes | niche | no | 102 | LLM token cost math |
| 130 | `token-efficiency` | 2 | rewrite | yes | niche | no | 157 | token-efficient agent patterns |
| 131 | `tui` | 2 | rewrite | yes | niche | no | 200 | terminal UI patterns |
| 132 | `typography` | 2 | port | no | niche | no | 104 | dup of `typography-system` — merge |
| 133 | `ui-ux` | 2 | port+sanitize | yes | niche | no | 53 | UI/UX checklist |
| 134 | `ux-ui-patterns` | 2 | port | no | niche | no | 281 | UX pattern library |
| 135 | `value-engineering` | 2 | port | no | niche | no | 25 | value engineering methodology |
| 136 | `visual-design` | 2 | port | no | niche | no | 132 | dup of `visual-design-foundations` — merge |

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

