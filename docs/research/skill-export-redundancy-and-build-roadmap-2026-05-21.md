# Skill Export Redundancy + Build Roadmap — 2026-05-21

> Type: Reference (research output)
> Supersedes the BUILD verdicts in `skill-demand-gap-roadmap-2026-05-16.md` (that doc treated high install counts as gaps; in fact they signal strong incumbents).
> Method: fresh skills.sh / skillsmp.com research (3 agents, ~160 web calls) + independent GPT-5.5 (xhigh) corpus pass, reconciled against our 143-skill export + 284 root + 160 private inventory.

## 1. Critical finding — our published library has near-zero reach

| Repo (handle `jacob-balslev`) | Skills | Installs | Note |
|---|---|---|---|
| `skills` (the `npx skills add jacob-balslev/skills` target) | **0 active** | 597 historical | canonical install path points at an **empty repo** |
| `skill-graph` | 39 | 490 | per-skill 3–7 installs |
| `skill-graph-skills` | 34 | 366 | duplicate of the above at ~4 each |
| `skill-graph-skills-missing-1` | 27 | 91 | fragment repo |
| **Total** | — | **677** | ~0.02% of vercel-labs (3.3M) |

- **skillsmp.com:** not indexed under our handle at all.
- For scale: vercel-labs 3.3M · anthropics ~2.0M · pbakaus 1.6M · obra 1.3M · supabase 266K.
- **Publishing hygiene is a prerequisite to any redundancy decision.** The install handle is empty; real skills are scattered across duplicated / "missing-1" repos. Fix the export pipeline before optimising content.

## 2. Verdict legend

- **DE-LIST** — strong/exact public incumbent, ours is not original → stop exporting to skills.sh, **keep in repo/graph** for our own use.
- **FLAG** — a strong incumbent overlaps → export **only** if an eval proves we cover more / higher quality; otherwise de-list. (The maintainer's "unless we can make an improved version that covers more" test.)
- **KEEP** — original / graph-native / no incumbent → keep exporting.

## 3. Full classification — all 143 exported skills

| # | Skill | Verdict | Incumbent (publisher, installs) | Note |
|---|---|---|---|---|
| 1 | `a11y` | FLAG | fixing-accessibility (ibelick, 11.5K); accessibility-a11y | ours = WCAG guidelines vs their fix-tool |
| 2 | `acid-fundamentals` | KEEP | none / no strong incumbent | original / concept-shaped |
| 3 | `agent-engineering` | KEEP | none / no strong incumbent | original / concept-shaped |
| 4 | `agent-eval-design` | KEEP | none / no strong incumbent | original / concept-shaped |
| 5 | `ai-native-development` | KEEP | none / no strong incumbent | original / concept-shaped |
| 6 | `api-design` | KEEP | none / no strong incumbent | original / concept-shaped |
| 7 | `architecture-decision-records` | KEEP | none / no strong incumbent | original / concept-shaped |
| 8 | `autonomous-loop-patterns` | KEEP | none / no strong incumbent | original / concept-shaped |
| 9 | `background-jobs` | KEEP | none / no strong incumbent | original / concept-shaped |
| 10 | `best-practice` | KEEP | none / no strong incumbent | original / concept-shaped |
| 11 | `bounded-context-mapping` | KEEP | none / no strong incumbent | original / concept-shaped |
| 12 | `cap-theorem-tradeoffs` | KEEP | none / no strong incumbent | original / concept-shaped |
| 13 | `client-server-boundary` | FLAG | vercel-react-best-practices (417K, partial) | React/Next — keep only if concept-level wins |
| 14 | `code-review` | FLAG | obra review skills | commodity, mild |
| 15 | `cognitive-load-theory` | KEEP | none / no strong incumbent | original / concept-shaped |
| 16 | `color-system-design` | FLAG | colorize (pbakaus 81K); ui-ux-pro-max (177K) | ours = token architecture |
| 17 | `component-architecture` | FLAG | vercel-composition-patterns (182K, partial) | React overlap |
| 18 | `compression` | KEEP | none / no strong incumbent | original / concept-shaped |
| 19 | `conceptual-modeling` | KEEP | none / no strong incumbent | graph-native |
| 20 | `connection-pooling` | FLAG | supabase-postgres-best-practices (181K) | ours = DB-agnostic |
| 21 | `constraint-awareness` | KEEP | none / no strong incumbent | original / concept-shaped |
| 22 | `content-monitor` | KEEP | none / no strong incumbent | original / concept-shaped |
| 23 | `context-engineering` | KEEP | none / no strong incumbent | original / concept-shaped |
| 24 | `context-graph` | KEEP | none / no strong incumbent | core moat |
| 25 | `context-management` | KEEP | none / no strong incumbent | original / concept-shaped |
| 26 | `context-window` | KEEP | none / no strong incumbent | original / concept-shaped |
| 27 | `contract-testing` | KEEP | none / no strong incumbent | original / concept-shaped |
| 28 | `cron-scheduling` | KEEP | none / no strong incumbent | original / concept-shaped |
| 29 | `dark-mode-implementation` | KEEP | none / no strong incumbent | only dedicated dark-mode skill found |
| 30 | `data-modeling` | KEEP | none / no strong incumbent | original / concept-shaped |
| 31 | `data-modeling-fundamentals` | KEEP | none / no strong incumbent | possible internal dup w/ data-modeling |
| 32 | `database-migration` | KEEP | none / no strong incumbent | no strong standalone incumbent |
| 33 | `debugging` | FLAG | systematic-debugging (obra, 106K) | strong incumbent |
| 34 | `dependency-architecture` | KEEP | none / no strong incumbent | original / concept-shaped |
| 35 | `design-module-composition` | KEEP | none / no strong incumbent | original / concept-shaped |
| 36 | `design-system-architecture` | FLAG | ui-ux-pro-max (177K) | ours = architectural |
| 37 | `design-thinking` | KEEP | none / no strong incumbent | original / concept-shaped |
| 38 | `diagnosis` | KEEP | none / no strong incumbent | original / concept-shaped |
| 39 | `diff-analysis` | KEEP | none / no strong incumbent | original / concept-shaped |
| 40 | `e2e-test-design` | KEEP | none / no strong incumbent | original / concept-shaped |
| 41 | `entity-relationship-modeling` | KEEP | none / no strong incumbent | original / concept-shaped |
| 42 | `epistemic-grounding` | KEEP | none / no strong incumbent | core moat |
| 43 | `error-boundary` | FLAG | vercel-react-best-practices (partial) | React-specific |
| 44 | `error-tracking` | FLAG | Sentry official (33 skills) | generic vs provider |
| 45 | `eval-driven-development` | KEEP | none / no strong incumbent | original / concept-shaped |
| 46 | `evaluation` | KEEP | none / no strong incumbent | original / concept-shaped |
| 47 | `event-contract-design` | KEEP | none / no strong incumbent | original / concept-shaped |
| 48 | `event-storming` | KEEP | none / no strong incumbent | original / concept-shaped |
| 49 | `first-principles-thinking` | KEEP | none / no strong incumbent | original / concept-shaped |
| 50 | `form-ux-architecture` | FLAG | ui-ux-pro-max (partial) | mild |
| 51 | `framework-fit-analysis` | KEEP | none / no strong incumbent | original / concept-shaped |
| 52 | `frontend-architecture` | FLAG | frontend-design (pbakaus 53K / anthropics) | ours = structural |
| 53 | `generative-ui` | KEEP | none / no strong incumbent | no standalone incumbent |
| 54 | `guardrails` | KEEP | none / no strong incumbent | original / concept-shaped |
| 55 | `hooks-patterns` | FLAG | vercel-react-best-practices (417K) | React — leans de-list |
| 56 | `http-semantics` | KEEP | none / no strong incumbent | original / concept-shaped |
| 57 | `ideation` | FLAG | brainstorming (obra, 172K) | overlap |
| 58 | `indexing-strategy` | FLAG | supabase-postgres-best-practices (181K) | ours = DB-agnostic |
| 59 | `information-architecture` | KEEP | none / no strong incumbent | original / concept-shaped |
| 60 | `integration-test-design` | KEEP | none / no strong incumbent | original / concept-shaped |
| 61 | `intent-recognition` | KEEP | none / no strong incumbent | original / concept-shaped |
| 62 | `interaction-feedback` | FLAG | ui-ux-pro-max (partial) | mild |
| 63 | `interaction-patterns` | FLAG | ui-ux-pro-max (partial) | mild |
| 64 | `journey-mapping` | KEEP | none / no strong incumbent | original / concept-shaped |
| 65 | `keywords` | KEEP | none / no strong incumbent | no standalone incumbent |
| 66 | `knowledge-modeling` | KEEP | none / no strong incumbent | graph-native |
| 67 | `layout-composition` | FLAG | layout/arrange (pbakaus 26-39K) | ours = compositional theory |
| 68 | `linguistics` | KEEP | none / no strong incumbent | original / concept-shaped |
| 69 | `lint-overlay` | KEEP | none / no strong incumbent | overlay specimen / graph-native |
| 70 | `mental-models` | KEEP | none / no strong incumbent | original / concept-shaped |
| 71 | `merge-queue` | KEEP | none / no strong incumbent | original / concept-shaped |
| 72 | `methodology` | KEEP | none / no strong incumbent | original / concept-shaped |
| 73 | `microcopy` | KEEP | none / no strong incumbent | original / concept-shaped |
| 74 | `middleware-patterns` | FLAG | next-best-practices (91K, partial) | Next — leans de-list |
| 75 | `mobile-responsive-ux` | FLAG | ui-ux-pro-max (177K) | indirect strong |
| 76 | `mutation-testing` | KEEP | none / no strong incumbent | original / concept-shaped |
| 77 | `naming-conventions` | KEEP | none / no strong incumbent | original / concept-shaped |
| 78 | `observability-modeling` | KEEP | none / no strong incumbent | original / concept-shaped |
| 79 | `ontology-modeling` | KEEP | none / no strong incumbent | graph-native |
| 80 | `owasp-security` | KEEP | none / no strong incumbent | commodity but concept-shaped (mild) |
| 81 | `pattern-recognition` | KEEP | none / no strong incumbent | original / concept-shaped |
| 82 | `performance-budgets` | KEEP | none / no strong incumbent | original / concept-shaped |
| 83 | `performance-engineering` | KEEP | none / no strong incumbent | original / concept-shaped |
| 84 | `performance-testing` | KEEP | none / no strong incumbent | original / concept-shaped |
| 85 | `printify` | KEEP | none / no strong incumbent | no public incumbent |
| 86 | `prioritization` | KEEP | none / no strong incumbent | original / concept-shaped |
| 87 | `problem-framing` | KEEP | none / no strong incumbent | original / concept-shaped |
| 88 | `problem-locating-solving` | FLAG | systematic-debugging (106K, partial) | mild |
| 89 | `project-knowledge-extraction` | KEEP | none / no strong incumbent | graph-native |
| 90 | `prompt-craft` | KEEP | none / no strong incumbent | original / concept-shaped |
| 91 | `prompt-injection-defense` | KEEP | none / no strong incumbent | original / concept-shaped |
| 92 | `property-based-testing` | KEEP | none / no strong incumbent | original / concept-shaped |
| 93 | `prototyping` | KEEP | none / no strong incumbent | original / concept-shaped |
| 94 | `query-optimization` | FLAG | supabase-postgres-best-practices (181K) | ours = ORM/N+1 angle |
| 95 | `real-time-updates` | KEEP | none / no strong incumbent | original / concept-shaped |
| 96 | `ref-patterns` | FLAG | vercel-react-best-practices (417K) | React — leans de-list |
| 97 | `refactor` | FLAG | obra refactor skills | mild |
| 98 | `rendering-models` | FLAG | vercel-react-best-practices (417K, partial) | React/Next concept |
| 99 | `replication-patterns` | KEEP | none / no strong incumbent | original / concept-shaped |
| 100 | `research-synthesis` | KEEP | none / no strong incumbent | original / concept-shaped |
| 101 | `route-handler-design` | FLAG | next-best-practices (partial) | Next — leans de-list |
| 102 | `schema-evolution` | KEEP | none / no strong incumbent | original / concept-shaped |
| 103 | `security-fundamentals` | KEEP | none / no strong incumbent | commodity but concept (mild) |
| 104 | `semantic-center` | KEEP | none / no strong incumbent | core moat |
| 105 | `semantic-relations` | KEEP | none / no strong incumbent | core moat |
| 106 | `semantics` | KEEP | none / no strong incumbent | graph-native |
| 107 | `semiotics` | KEEP | none / no strong incumbent | original / concept-shaped |
| 108 | `seo-strategy` | FLAG | coreyhaines31 marketingskills (seo-audit 116K, suite 2.2M) | ours = strategy-first |
| 109 | `server-actions-design` | FLAG | vercel/next best-practices (partial) | Next — leans de-list |
| 110 | `server-components-design` | FLAG | vercel/next best-practices (partial) | Next — leans de-list |
| 111 | `sharding-strategy` | KEEP | none / no strong incumbent | original / concept-shaped |
| 112 | `shopify` | **DE-LIST** | Shopify/shopify-ai-toolkit (official, 23 skills, 74K) | thin clone of official vendor toolkit |
| 113 | `skill-infrastructure` | KEEP | none / no strong incumbent | core moat |
| 114 | `skill-scaffold` | KEEP | none / no strong incumbent | graph-native moat |
| 115 | `snapshot-testing` | KEEP | none / no strong incumbent | original / concept-shaped |
| 116 | `spec-driven-development` | KEEP | none / no strong incumbent | original / concept-shaped |
| 117 | `state-machine-modeling` | KEEP | none / no strong incumbent | original / concept-shaped |
| 118 | `state-management` | FLAG | zustand/redux/jotai (library-specific) | ours = framework-agnostic, mild |
| 119 | `streaming-architecture` | KEEP | none / no strong incumbent | original / concept-shaped |
| 120 | `summarization` | KEEP | none / no strong incumbent | original / concept-shaped |
| 121 | `suspense-patterns` | FLAG | vercel-react-best-practices (417K) | React — leans de-list |
| 122 | `system-interface-contracts` | KEEP | none / no strong incumbent | original / concept-shaped |
| 123 | `task-analysis` | KEEP | none / no strong incumbent | original / concept-shaped |
| 124 | `task-path-optimization` | KEEP | none / no strong incumbent | original / concept-shaped |
| 125 | `taxonomy-design` | KEEP | none / no strong incumbent | graph-native |
| 126 | `test-coverage-strategy` | KEEP | none / no strong incumbent | original / concept-shaped |
| 127 | `test-doubles-design` | KEEP | none / no strong incumbent | original / concept-shaped |
| 128 | `test-driven-development` | FLAG | tdd (mattpocock 140K; obra 92K) | strong incumbent |
| 129 | `testing-strategy` | KEEP | none / no strong incumbent | concept (mild) |
| 130 | `theme-system-design` | FLAG | ui-ux-pro-max (177K) | ours = token architecture |
| 131 | `tool-call-flow` | KEEP | none / no strong incumbent | original / concept-shaped |
| 132 | `tool-call-strategy` | KEEP | none / no strong incumbent | original / concept-shaped |
| 133 | `transaction-isolation` | KEEP | none / no strong incumbent | original / concept-shaped |
| 134 | `type-safety` | KEEP | none / no strong incumbent | original / concept-shaped |
| 135 | `typography-system` | FLAG | typeset (pbakaus 65K); ui-ux-pro-max | ours = system-level |
| 136 | `usability-testing` | KEEP | none / no strong incumbent | original / concept-shaped |
| 137 | `user-research` | KEEP | none / no strong incumbent | original / concept-shaped |
| 138 | `vercel-composition-patterns` | **DE-LIST** | vercel-labs/agent-skills/vercel-composition-patterns (182K) — EXACT NAME | exact name collision with Vercel official; rename or drop |
| 139 | `version-control` | FLAG | commodity | mild |
| 140 | `visual-design-foundations` | FLAG | impeccable suite; ui-ux-pro-max | ours = principles-level |
| 141 | `visual-hierarchy` | FLAG | ui-ux-pro-max (mentions it) | mild |
| 142 | `webhook-integration` | KEEP | none / no strong incumbent | original / concept-shaped |
| 143 | `writing-humanizer` | FLAG | copy-editing skills | mild |

## 4. Complete rollups (not subsets)

**DE-LIST (2) — stop exporting, keep in repo:** `shopify`, `vercel-composition-patterns`.

**FLAG (38) — export only if eval proves we cover more, else de-list:** `a11y`, `client-server-boundary`, `code-review`, `color-system-design`, `component-architecture`, `connection-pooling`, `debugging`, `design-system-architecture`, `error-boundary`, `error-tracking`, `form-ux-architecture`, `frontend-architecture`, `hooks-patterns`, `ideation`, `indexing-strategy`, `interaction-feedback`, `interaction-patterns`, `layout-composition`, `middleware-patterns`, `mobile-responsive-ux`, `problem-locating-solving`, `query-optimization`, `ref-patterns`, `refactor`, `rendering-models`, `route-handler-design`, `seo-strategy`, `server-actions-design`, `server-components-design`, `state-management`, `suspense-patterns`, `test-driven-development`, `theme-system-design`, `typography-system`, `version-control`, `visual-design-foundations`, `visual-hierarchy`, `writing-humanizer`.

**KEEP (103) — original/differentiated, keep exporting:** `acid-fundamentals`, `agent-engineering`, `agent-eval-design`, `ai-native-development`, `api-design`, `architecture-decision-records`, `autonomous-loop-patterns`, `background-jobs`, `best-practice`, `bounded-context-mapping`, `cap-theorem-tradeoffs`, `cognitive-load-theory`, `compression`, `conceptual-modeling`, `constraint-awareness`, `content-monitor`, `context-engineering`, `context-graph`, `context-management`, `context-window`, `contract-testing`, `cron-scheduling`, `dark-mode-implementation`, `data-modeling`, `data-modeling-fundamentals`, `database-migration`, `dependency-architecture`, `design-module-composition`, `design-thinking`, `diagnosis`, `diff-analysis`, `e2e-test-design`, `entity-relationship-modeling`, `epistemic-grounding`, `eval-driven-development`, `evaluation`, `event-contract-design`, `event-storming`, `first-principles-thinking`, `framework-fit-analysis`, `generative-ui`, `guardrails`, `http-semantics`, `information-architecture`, `integration-test-design`, `intent-recognition`, `journey-mapping`, `keywords`, `knowledge-modeling`, `linguistics`, `lint-overlay`, `mental-models`, `merge-queue`, `methodology`, `microcopy`, `mutation-testing`, `naming-conventions`, `observability-modeling`, `ontology-modeling`, `owasp-security`, `pattern-recognition`, `performance-budgets`, `performance-engineering`, `performance-testing`, `printify`, `prioritization`, `problem-framing`, `project-knowledge-extraction`, `prompt-craft`, `prompt-injection-defense`, `property-based-testing`, `prototyping`, `real-time-updates`, `replication-patterns`, `research-synthesis`, `schema-evolution`, `security-fundamentals`, `semantic-center`, `semantic-relations`, `semantics`, `semiotics`, `sharding-strategy`, `skill-infrastructure`, `skill-scaffold`, `snapshot-testing`, `spec-driven-development`, `state-machine-modeling`, `streaming-architecture`, `summarization`, `system-interface-contracts`, `task-analysis`, `task-path-optimization`, `taxonomy-design`, `test-coverage-strategy`, `test-doubles-design`, `testing-strategy`, `tool-call-flow`, `tool-call-strategy`, `transaction-isolation`, `type-safety`, `usability-testing`, `user-research`, `webhook-integration`.

> The React/Next cluster the maintainer flagged (`rendering-models`, `client-server-boundary`, `server-components-design`, `server-actions-design`, `suspense-patterns`, `ref-patterns`, `hooks-patterns`, `error-boundary`, `route-handler-design`, `middleware-patterns`, `component-architecture`) is concentrated in FLAG: no exact-name collisions, but all overlap the 417K `vercel-react-best-practices` suite. Per the rule they survive export only if our concept-level treatment genuinely covers more — an eval pass decides. They stay in the repo regardless.

## 5. Skills we want to create (complete — nothing dropped)

These do NOT yet exist (or exist only privately / as stubs) and we want them. Grouped by build type. SKIP-REDUNDANT candidates (react/next/vercel/provider/marketing/design clones with strong vendor incumbents) are deliberately **excluded** — see §3.

### Tier 1 — NEW BUILD (7) — no version exists in our library
| Skill | Why build | Differentiation vs ecosystem |
|---|---|---|
| `skill-discovery-import` | flagship graph differentiation | import + SMP enrich + privacy gate + route + drift; `find-skills` (1.6M) only searches |
| `skill-portability` | core moat | cross-runtime transforms (Claude/Codex/Copilot/Cursor/Gemini/AGENTS.md) w/ semantic preservation; no public equivalent |
| `github-actions` | build-better | only incumbent is docs-shaped (`xixu-me/github-actions-docs`, 155K); win on permissions/secrets/caching/matrix/security gates |
| `opentelemetry` | gap | vendor-neutral instrumentation; public coverage is provider-fragmented |
| `tanstack-table` | gap (we have only a stub) | no strong public incumbent (TanStack Intent ships Query/Router, not Table) |
| `vitest-jest-testing` | consolidate | merge `javascript-testing-patterns` + `test-generator`; public coverage is fragmented snippets |
| `d3-data-visualization` | upgrade from `data-viz` | D3 + a11y + responsive boundaries |

### Tier 2 — PROMOTE / public-safe migrate (4) — exist in root, not exported
| Skill | Action |
|---|---|
| `agent-task-delegation` | public-safe migrate + graph-aware reframe (task packets, dependency edges, eval gates) |
| `session-lifecycle` | migrate; public skills cover handoff slices only, not full lifecycle/resumption |
| `orchestration` | migrate as portable semantics, not Development-command docs |
| `security-scanning` | generalize the sales-hub-specific skill into a tool-agnostic public SAST/secrets/SCA/SBOM skill |

### Tier 3 — NEW GAPS (11) — demand confirmed, not previously on any list
| Skill | Why |
|---|---|
| `openai-api` | parity with our `claude-api`; public OpenAI skills are task-specific |
| `google-gemini-api` | multi-provider coverage; provider docs move fast |
| `supply-chain-security` | SBOM / SLSA / provenance / dependency review / signing — distinct from generic scanning |
| `semgrep-codeql` | practical rule authoring + CI triage |
| `zod-validation` | exists privately (sales-hub); strong public TS demand + security boundary |
| `trpc-api-contracts` | sits between api-design, type-safety, contract-testing |
| `turborepo-monorepo` | build graph + cache hygiene; local monorepo pressure |
| `pnpm-workspaces` | workspace + publish pipelines |
| `storybook-visual-regression` | component catalog + visual regression + review workflow |
| `cursor-rules-portability` | translate AGENTS.md ↔ Cursor rules losslessly (adjacent to skill-portability) |
| `copilot-instructions-portability` | Copilot/Claude instruction portability |

### Tier 4 — DEFER (7) — valid, lower priority (shown for completeness; maintainer decides)
`radix-ui`, `docker`, `vector-databases`, `datadog-observability`, `langgraph-agent-architecture`, `langsmith-evals-observability`, `langfuse-llm-observability`.

> Methodology DEFERs (`kepner-tregoe`, `itil-problem-management`, `customer-development`, `tiny-habits-fogg`, `togaf-adm`, `deliberate-practice`, `pragmatic-programmer`, `daci-rapid`, `backstage-idp`) are already tracked under epic SH-6144 and are EXTEND-or-defer, not new creates.

## 6. Next actions
1. **Fix publishing fragmentation** (highest urgency): re-point `jacob-balslev/skills` at the real export; collapse `skill-graph-skills` + `skill-graph-skills-missing-1` duplicates.
2. Apply DE-LIST to the export pipeline (`publicationQueue` in the worklist): set `included_in_export: false` + record incumbent for `shopify`, `vercel-composition-patterns`.
3. Run eval passes on the 38 FLAG skills to confirm "covers more"; de-list those that don't.
4. Open the Tier 1–3 creates as Linear tasks (one per skill, verdict + incumbent in acceptance criteria).
