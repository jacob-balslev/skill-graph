# Skill Content Evaluation Run (full-content-2026-06-12-r2)

Mode: CONTENT
Generated: 2026-06-12T18:24:28.449Z
Target: /Users/jacobbalslev/Development/skills/skills
Total skills evaluated: 186

## Methodology
Evaluated the authored SKILL.md content and eval design only. The run did not evaluate whether agents used each skill correctly in the codebase and did not run SYSTEM evaluation. Skill Metadata Protocol v8 sidecar separation was applied: missing audit/eval fields inside SKILL.md were not treated as defects.

Score/Grade mean authored SKILL.md content quality only: purpose/scope, activation, boundary, instructional procedure, and grounding. Eval artifacts, Agent Skills-style eval readiness, case quality, audit-state evidence, and certification blockers are reported separately and do not reduce the content score.

Reviewer timeout: 180000ms default; Opus 180000ms, Gemini Flash 180000ms, DeepSeek Flash 60000ms, MiMo 60000ms. Timeout is documented here and in JSON; set a timeout env var to 0 for no timeout.

External references used:
- https://agentskills.io/skill-creation/evaluating-skills — Agent Skills eval guidance: realistic prompts, with/without baseline, assertions, grading evidence, aggregation, pattern analysis.
- https://agentskills.io/skill-creation/optimizing-descriptions — Agent Skills description guidance: activation depends on precise descriptions, should-trigger and should-not-trigger queries, realistic trigger eval prompts.
- https://developers.openai.com/blog/eval-skills — OpenAI guidance: evals are prompt plus captured run plus checks plus score over time; define measurable success and avoid vibe-based assessment.
- https://www.langchain.com/blog/evaluating-skills — LangChain guidance: evaluate skills with clean environments, with/without comparisons, concrete tasks, clear metrics, and observability.
- https://www.youtube.com/watch?v=C1WRly9nmnU — YouTube title/description verified: Claude Skills 2.0 Breakdown: Measure, Test, Improve; timedtext captions exposed but signed endpoint returned 404 in this environment.
- https://sonusahani.com/blogs/claude-skills-measure-test-improve — Accessible article matching the video topic: evaluation cycle, model drift, pass/fail criteria, dry runs, audits, human review, token pruning.

OpenCode reviewers receive an attached per-skill `review-bundle.md` from a scratch directory; they are instructed to use only that bundle and not inspect the wider workspace.

## Model / Agent Roster
- Opus 4.8 via Claude CLI alias `opus`
- Gemini Flash via Gemini CLI `gemini-3-flash-preview`
- DeepSeek V4 Flash via OpenCode `opencode/deepseek-v4-flash-free`
- MiMo V2.5 via OpenCode `opencode/mimo-v2.5-free`

Gemini Pro (`gemini`) is in the current advisory alias set but is not a free agent; its smoke probe did not complete cleanly in this environment and it was excluded from the free-agent reviewer set.

## Parallel Proof
For each public skill, reviewer child processes are spawned before awaiting Promise.all; per-reviewer spawn_requested_at/started_at/ended_at are recorded. OpenCode reviewers use isolated temporary model CLI homes and attached per-skill review bundles in scratch directories to avoid shared SQLite locks and broad workspace reads.

node skill-graph/scripts/__tests__/test-advisory-panel.js passed 30 checks, including worker panel starts advisory models in parallel.

Raw reviewer timing is stored per skill under /Users/jacobbalslev/Development/skill-graph/audits/content-evaluation-2026-06-12/raw-reviewers-full-content-2026-06-12-r2.

## Content Score Distribution
| Grade | Count |
|---|---:|
| A | 94 |
| B | 68 |
| C | 23 |
| D | 1 |
| F | 0 |

Average content score: 88; min: 69; max: 99.

## Score Table
| Skill | Category | Content score | Content grade | Eval readiness | Eval cases | Application verdict | Blocked? |
|---|---|---:|:---:|---:|---:|---|---|
| ai-native-development | agent-ops | 85 | B | 15 | 0 | UNVERIFIED | no |
| autonomous-loop-patterns | agent-ops | 83 | B | 66 | 16 | UNVERIFIED | no |
| claude-code | agent-ops | 87 | B | 55 | 15 |  | no |
| claude-haiku | agent-ops | 82 | B | 55 | 14 |  | yes |
| claude-opus | agent-ops | 84 | B | 53 | 14 |  | no |
| claude-sonnet | agent-ops | 81 | B | 56 | 14 |  | yes |
| codex | agent-ops | 87 | B | 53 | 14 |  | yes |
| content-monitor | agent-ops | 75 | C | 14 | 0 | UNVERIFIED | no |
| context-engineering | agent-ops | 95 | A | 15 | 0 | UNVERIFIED | no |
| context-graph | agent-ops | 91 | A | 15 | 0 | UNVERIFIED | no |
| context-management | agent-ops | 83 | B | 14 | 0 | UNVERIFIED | no |
| context-window | agent-ops | 94 | A | 15 | 0 | UNVERIFIED | no |
| gemini-flash | agent-ops | 87 | B | 54 | 14 |  | no |
| gemini-pro | agent-ops | 86 | B | 53 | 14 |  | yes |
| github-copilot | agent-ops | 87 | B | 55 | 14 |  | no |
| gpt-5-5 | agent-ops | 86 | B | 51 | 14 |  | yes |
| opencode-free-models | agent-ops | 86 | B | 55 | 14 |  | no |
| opencode | agent-ops | 91 | A | 53 | 13 |  | yes |
| skill-infrastructure | agent-ops | 83 | B | 60 | 13 | UNVERIFIED | no |
| skill-router | agent-ops | 89 | B | 64 | 16 | UNVERIFIED | yes |
| skill-scaffold | agent-ops | 91 | A | 16 | 0 | UNVERIFIED | no |
| agent-eval-design | ai-engineering | 91 | A | 63 | 15 | MIXED | no |
| eval-driven-development | ai-engineering | 97 | A | 58 | 5 | UNVERIFIED | no |
| evaluation | ai-engineering | 95 | A | 71 | 10 | UNVERIFIED | no |
| guardrails | ai-engineering | 79 | C | 15 | 0 | UNVERIFIED | no |
| intent-recognition | ai-engineering | 82 | B | 15 | 0 | UNVERIFIED | no |
| project-knowledge-extraction | ai-engineering | 86 | B | 62 | 15 | UNVERIFIED | no |
| prompt-craft | ai-engineering | 94 | A | 60 | 5 | UNVERIFIED | no |
| prompt-injection-defense | ai-engineering | 94 | A | 56 | 15 | UNVERIFIED | yes |
| summarization | ai-engineering | 87 | B | 14 | 0 | UNVERIFIED | no |
| tool-call-flow | ai-engineering | 96 | A | 16 | 0 | UNVERIFIED | no |
| tool-call-strategy | ai-engineering | 96 | A | 14 | 0 | UNVERIFIED | no |
| acid-fundamentals | backend-engineering | 91 | A | 63 | 8 | UNVERIFIED | no |
| api-design | backend-engineering | 88 | B | 15 | 0 | UNVERIFIED | yes |
| background-jobs | backend-engineering | 89 | B | 59 | 7 | UNVERIFIED | no |
| compression | backend-engineering | 71 | C | 14 | 0 | UNVERIFIED | no |
| connection-pooling | backend-engineering | 93 | A | 61 | 15 | UNVERIFIED | yes |
| cron-scheduling | backend-engineering | 91 | A | 49 | 7 | UNVERIFIED | yes |
| http-semantics | backend-engineering | 95 | A | 15 | 0 | UNVERIFIED | no |
| real-time-updates | backend-engineering | 92 | A | 55 | 15 | UNVERIFIED | no |
| route-handler-design | backend-engineering | 90 | A | 14 | 0 | UNVERIFIED | no |
| streaming-architecture | backend-engineering | 95 | A | 60 | 15 | UNVERIFIED | no |
| transaction-isolation | backend-engineering | 90 | A | 15 | 0 | UNVERIFIED | no |
| webhook-integration | backend-engineering | 79 | C | 14 | 0 | UNVERIFIED | no |
| cap-theorem-tradeoffs | data-engineering | 91 | A | 14 | 0 | UNVERIFIED | no |
| data-modeling-fundamentals | data-engineering | 92 | A | 15 | 0 | UNVERIFIED | no |
| database-migration | data-engineering | 92 | A | 56 | 8 | PROVISIONAL | no |
| indexing-strategy | data-engineering | 97 | A | 61 | 13 | UNVERIFIED | no |
| observability-modeling | data-engineering | 81 | B | 17 | 0 | UNVERIFIED | no |
| query-optimization | data-engineering | 97 | A | 15 | 0 | UNVERIFIED | no |
| replication-patterns | data-engineering | 91 | A | 58 | 13 | PROVISIONAL | no |
| schema-evolution | data-engineering | 96 | A | 61 | 8 | UNVERIFIED | yes |
| sharding-strategy | data-engineering | 91 | A | 15 | 0 | UNVERIFIED | no |
| color-system-design | design | 91 | A | 58 | 15 | REDUNDANT | no |
| component-architecture | design | 92 | A | 60 | 15 | REDUNDANT | no |
| dark-mode-implementation | design | 81 | B | 56 | 15 | UNVERIFIED | yes |
| design-module-composition | design | 83 | B | 52 | 15 | UNVERIFIED | no |
| design-thinking | design | 83 | B | 53 | 14 | UNVERIFIED | no |
| form-ux-architecture | design | 81 | B | 55 | 14 | UNVERIFIED | yes |
| ideation | design | 84 | B | 59 | 15 | UNVERIFIED | no |
| information-architecture | design | 83 | B | 51 | 15 | UNVERIFIED | yes |
| interaction-feedback | design | 84 | B | 53 | 15 | UNVERIFIED | no |
| interaction-patterns | design | 83 | B | 52 | 15 | UNVERIFIED | no |
| journey-mapping | design | 80 | B | 54 | 15 | UNVERIFIED | yes |
| layout-composition | design | 85 | B | 61 | 15 | UNVERIFIED | yes |
| microcopy | design | 86 | B | 59 | 15 | UNVERIFIED | yes |
| prototyping | design | 87 | B | 60 | 14 | UNVERIFIED | yes |
| research-synthesis | design | 82 | B | 55 | 15 | UNVERIFIED | yes |
| semiotics | design | 89 | B | 54 | 15 | UNVERIFIED | yes |
| typography-system | design | 82 | B | 59 | 15 | REDUNDANT | yes |
| usability-testing | design | 84 | B | 55 | 15 | UNVERIFIED | yes |
| user-research | design | 83 | B | 57 | 15 | UNVERIFIED | yes |
| visual-design-foundations | design | 84 | B | 60 | 15 | UNVERIFIED | yes |
| visual-hierarchy | design | 83 | B | 64 | 15 | UNVERIFIED | yes |
| writing-humanizer | design | 93 | A | 55 | 15 | UNVERIFIED | yes |
| client-server-boundary | frontend-engineering | 91 | A | 47 | 15 | UNVERIFIED | yes |
| design-system-architecture | frontend-engineering | 83 | B | 54 | 15 | UNVERIFIED | yes |
| error-boundary | frontend-engineering | 88 | B | 51 | 15 | UNVERIFIED | yes |
| frontend-architecture | frontend-engineering | 77 | C | 58 | 15 | UNVERIFIED | yes |
| generative-ui | frontend-engineering | 95 | A | 59 | 15 | UNVERIFIED | yes |
| hooks-patterns | frontend-engineering | 89 | B | 59 | 15 | UNVERIFIED | yes |
| middleware-patterns | frontend-engineering | 91 | A | 62 | 15 | UNVERIFIED | yes |
| mobile-responsive-ux | frontend-engineering | 84 | B | 58 | 15 | UNVERIFIED | yes |
| ref-patterns | frontend-engineering | 90 | A | 57 | 16 | UNVERIFIED | yes |
| rendering-models | frontend-engineering | 90 | A | 55 | 15 | UNVERIFIED | yes |
| server-actions-design | frontend-engineering | 92 | A | 67 | 17 | UNVERIFIED | yes |
| server-components-design | frontend-engineering | 90 | A | 60 | 16 | UNVERIFIED | yes |
| state-management | frontend-engineering | 91 | A | 51 | 17 | UNVERIFIED | yes |
| suspense-patterns | frontend-engineering | 89 | B | 54 | 14 | PROVISIONAL | yes |
| theme-system-design | frontend-engineering | 82 | B | 58 | 14 | UNVERIFIED | yes |
| vercel-composition-patterns | frontend-engineering | 82 | B | 57 | 15 | UNVERIFIED | yes |
| keywords | knowledge-organization | 95 | A | 62 | 5 | UNVERIFIED | yes |
| knowledge-modeling | knowledge-organization | 97 | A | 15 | 0 | UNVERIFIED | yes |
| linguistics | knowledge-organization | 96 | A | 15 | 0 | UNVERIFIED | yes |
| ontology-modeling | knowledge-organization | 91 | A | 15 | 0 | UNVERIFIED | yes |
| semantic-center | knowledge-organization | 92 | A | 14 | 0 | UNVERIFIED | yes |
| semantic-relations | knowledge-organization | 99 | A | 15 | 0 | UNVERIFIED | yes |
| semantics | knowledge-organization | 98 | A | 15 | 0 | UNVERIFIED | yes |
| skill-evolution | knowledge-organization | 89 | B | 66 | 14 | UNVERIFIED | yes |
| taxonomy-design | knowledge-organization | 90 | A | 15 | 0 | UNVERIFIED | yes |
| etsy | product-domain | 85 | B | 15 | 0 | UNVERIFIED | yes |
| printify | product-domain | 76 | C | 13 | 0 | UNVERIFIED | yes |
| shopify | product-domain | 78 | C | 15 | 0 | UNVERIFIED | yes |
| a11y | quality-assurance | 84 | B | 63 | 12 | UNVERIFIED | yes |
| best-practice | quality-assurance | 88 | B | 15 | 0 | UNVERIFIED | yes |
| code-review | quality-assurance | 96 | A | 21 | 0 | UNVERIFIED | yes |
| cognitive-load-theory | quality-assurance | 89 | B | 68 | 9 | UNVERIFIED | yes |
| contract-testing | quality-assurance | 96 | A | 61 | 8 | PROVISIONAL | yes |
| diff-analysis | quality-assurance | 79 | C | 15 | 0 | UNVERIFIED | yes |
| e2e-test-design | quality-assurance | 94 | A | 15 | 0 | UNVERIFIED | yes |
| error-tracking | quality-assurance | 85 | B | 15 | 0 | UNVERIFIED | yes |
| graph-audit | quality-assurance | 88 | B | 68 | 5 | UNVERIFIED | yes |
| integration-test-design | quality-assurance | 93 | A | 15 | 0 | UNVERIFIED | yes |
| lint-overlay | quality-assurance | 80 | B | 19 | 0 | UNVERIFIED | yes |
| mutation-testing | quality-assurance | 93 | A | 15 | 0 | UNVERIFIED | yes |
| owasp-security | quality-assurance | 98 | A | 15 | 0 | UNVERIFIED | yes |
| performance-budgets | quality-assurance | 94 | A | 15 | 0 | UNVERIFIED | yes |
| performance-engineering | quality-assurance | 80 | B | 15 | 0 | UNVERIFIED | yes |
| performance-testing | quality-assurance | 95 | A | 60 | 15 | UNVERIFIED | yes |
| property-based-testing | quality-assurance | 92 | A | 15 | 0 | UNVERIFIED | yes |
| security-fundamentals | quality-assurance | 95 | A | 58 | 13 | UNVERIFIED | yes |
| seo-strategy | quality-assurance | 72 | C | 15 | 0 | UNVERIFIED | yes |
| snapshot-testing | quality-assurance | 95 | A | 63 | 15 | UNVERIFIED | yes |
| test-coverage-strategy | quality-assurance | 95 | A | 59 | 15 | MIXED | yes |
| test-doubles-design | quality-assurance | 93 | A | 13 | 0 | UNVERIFIED | yes |
| test-driven-development | quality-assurance | 95 | A | 15 | 0 | UNVERIFIED | yes |
| testing-strategy | quality-assurance | 91 | A | 54 | 13 | PROVISIONAL | yes |
| type-safety | quality-assurance | 94 | A | 13 | 0 | UNVERIFIED | yes |
| ansoff-matrix | reasoning-strategy | 95 | A | 78 | 14 | UNVERIFIED | yes |
| balanced-scorecard | reasoning-strategy | 93 | A | 60 | 28 | UNVERIFIED | yes |
| bayesian-reasoning | reasoning-strategy | 95 | A | 74 | 14 | UNVERIFIED | yes |
| bcg-matrix | reasoning-strategy | 93 | A | 62 | 21 | UNVERIFIED | yes |
| blue-ocean-strategy | reasoning-strategy | 96 | A | 69 | 14 | UNVERIFIED | yes |
| constraint-awareness | reasoning-strategy | 91 | A | 15 | 0 | UNVERIFIED | yes |
| epistemic-grounding | reasoning-strategy | 95 | A | 53 | 5 | UNVERIFIED | yes |
| expected-value | reasoning-strategy | 92 | A | 77 | 14 | UNVERIFIED | yes |
| first-principles-thinking | reasoning-strategy | 89 | B | 61 | 8 | UNVERIFIED | yes |
| inversion | reasoning-strategy | 91 | A | 65 | 8 | UNVERIFIED | yes |
| kano-model | reasoning-strategy | 93 | A | 76 | 14 | UNVERIFIED | yes |
| mckinsey-7s | reasoning-strategy | 96 | A | 61 | 8 | UNVERIFIED | yes |
| mental-models | reasoning-strategy | 90 | A | 55 | 5 | UNVERIFIED | yes |
| okrs | reasoning-strategy | 90 | A | 67 | 22 | UNVERIFIED | yes |
| pattern-recognition | reasoning-strategy | 92 | A | 78 | 13 | UNVERIFIED | yes |
| pestel | reasoning-strategy | 96 | A | 65 | 14 | UNVERIFIED | yes |
| playing-to-win | reasoning-strategy | 93 | A | 66 | 14 | UNVERIFIED | yes |
| porters-five-forces | reasoning-strategy | 93 | A | 71 | 14 | UNVERIFIED | yes |
| positioning | reasoning-strategy | 93 | A | 67 | 14 | UNVERIFIED | yes |
| principled-negotiation | reasoning-strategy | 94 | A | 71 | 14 | UNVERIFIED | yes |
| problem-framing | reasoning-strategy | 79 | C | 15 | 0 | UNVERIFIED | yes |
| scenario-planning | reasoning-strategy | 92 | A | 64 | 22 | UNVERIFIED | yes |
| second-order-thinking | reasoning-strategy | 91 | A | 62 | 8 | UNVERIFIED | yes |
| seven-powers | reasoning-strategy | 95 | A | 58 | 16 | UNVERIFIED | yes |
| stp-marketing | reasoning-strategy | 98 | A | 79 | 21 | UNVERIFIED | yes |
| swot-tows | reasoning-strategy | 96 | A | 75 | 14 | PROVISIONAL | yes |
| task-analysis | reasoning-strategy | 77 | C | 15 | 0 | UNVERIFIED | yes |
| three-horizons | reasoning-strategy | 95 | A | 62 | 8 | UNVERIFIED | yes |
| value-chain-analysis | reasoning-strategy | 98 | A | 65 | 8 | UNVERIFIED | yes |
| vrio | reasoning-strategy | 93 | A | 70 | 14 | UNVERIFIED | yes |
| agent-engineering | software-architecture | 97 | A | 15 | 0 | UNVERIFIED | yes |
| architecture-decision-records | software-architecture | 79 | C | 15 | 0 | UNVERIFIED | yes |
| bounded-context-mapping | software-architecture | 78 | C | 15 | 0 | UNVERIFIED | yes |
| conceptual-modeling | software-architecture | 98 | A | 15 | 0 | UNVERIFIED | yes |
| data-modeling | software-architecture | 79 | C | 15 | 0 | UNVERIFIED | yes |
| dependency-architecture | software-architecture | 79 | C | 15 | 0 | UNVERIFIED | yes |
| entity-relationship-modeling | software-architecture | 79 | C | 15 | 0 | UNVERIFIED | yes |
| event-contract-design | software-architecture | 79 | C | 15 | 0 | UNVERIFIED | yes |
| event-storming | software-architecture | 73 | C | 15 | 0 | UNVERIFIED | yes |
| framework-fit-analysis | software-architecture | 94 | A | 17 | 0 | UNVERIFIED | yes |
| state-machine-modeling | software-architecture | 86 | B | 15 | 0 | UNVERIFIED | yes |
| system-interface-contracts | software-architecture | 89 | B | 15 | 0 | UNVERIFIED | yes |
| canonical-repo-structure | software-engineering-method | 92 | A | 13 | 0 |  | yes |
| debugging | software-engineering-method | 76 | C | 50 | 5 | REDUNDANT | yes |
| diagnosis | software-engineering-method | 87 | B | 15 | 0 | UNVERIFIED | yes |
| doc-updater | software-engineering-method | 81 | B | 52 | 7 | UNVERIFIED | yes |
| merge-queue | software-engineering-method | 69 | D | 13 | 0 | UNVERIFIED | yes |
| methodical | software-engineering-method | 88 | B | 64 | 13 | UNVERIFIED | yes |
| methodology | software-engineering-method | 89 | B | 62 | 5 | UNVERIFIED | yes |
| naming-conventions | software-engineering-method | 84 | B | 58 | 14 | UNVERIFIED | yes |
| no-cutting-corners | software-engineering-method | 89 | B | 49 | 7 | UNVERIFIED | yes |
| prioritization | software-engineering-method | 76 | C | 15 | 0 | UNVERIFIED | yes |
| problem-approach-router | software-engineering-method | 78 | C | 60 | 8 | UNVERIFIED | yes |
| problem-locating-solving | software-engineering-method | 83 | B | 15 | 0 | UNVERIFIED | yes |
| refactor | software-engineering-method | 77 | C | 21 | 0 | UNVERIFIED | yes |
| spec-driven-development | software-engineering-method | 77 | C | 15 | 0 | UNVERIFIED | yes |
| task-path-optimization | software-engineering-method | 89 | B | 74 | 23 | UNVERIFIED | yes |
| version-control | software-engineering-method | 82 | B | 15 | 0 | UNVERIFIED | yes |

## Per-Skill Findings
### ai-native-development
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/ai-native-development/SKILL.md
Content score: 85 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [INFO] content/procedure: Content offers reusable mental models (three eras, autonomy slider, AutoResearch constraints, gate stack) plus a verification checklist and explicit Do-NOT-Use routing table. Evidence: SKILL.md §1-7, Verification, Do NOT Use tables Action: None; content is publication-quality.
- [MEDIUM] content/provenance: skill_graph_protocol label reads 'v6' while schema_version is 8 and truth_sources lack drift_check hashes, weakening the grounding/truth-source claim. Evidence: frontmatter skill_graph_protocol: v6; no drift_check Action: Reconcile protocol label and record truth_source_hashes via drift script.
- [INFO] reasoning-strategy: Excellent mapping of Software 3.0 concepts into actionable engineering analogues like 'Prompt as Code'. Evidence: Section 1 mapping table (Source code to Prompt files). Action: Maintain this high-fidelity conceptual grounding.
- [INFO] quality-assurance: Detailed quality gate sequence provides concrete risk mitigation for the 'vibe hangover' failure modes. Evidence: Section 6 sequence from Type Checking to Human Review. Action: Ensure these gates are standard in agent-ops workflows.
- [HIGH] content: skill_graph_protocol v6 label contradicts v8-shaped metadata — subject, public, scope, relations populated Evidence: Line 144: v6 claim; lines 81-86, 88, 128, 159-161: v8 required fields present Action: Advance label to v8 or align content to v6 contract
- [MEDIUM] content: scope duplicates description verbatim instead of providing distinct PRD-style teaching statement Evidence: Line 63 (description) and line 86 (scope) are near-identical prose block Action: Author standalone scope distinct from description
- [HIGH] structural: `relations` defined twice — JSON string inside `metadata:` (line 128) and top-level YAML (lines 159–161) with slightly different key order; may cause lint or routing ambiguity. Evidence: metadata block has `relations` as escaped JSON; top-level has identical set as native YAML array. Action: Remove the `metadata:` duplicate; keep only the top-level `relations` block.
- [LOW] content: `skill_graph_protocol` claims v6 (line 144) while the skill carries v8 classification fields; honest migration-state label but signals incomplete content migration. Evidence: Line 144: `skill_graph_protocol: Skill Metadata Protocol v6`; v8 fields (`subject`, `public`, `scope`, `taxonomy_domain`) are present. Action: Advance the content label to v8 through the audit loop after confirming all v8 semantic fields are authored.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/ai-native-development/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval files, cases, prompts, or assertions exist against a target of 10; eval_artifacts is 'planned' and all audit verdicts are UNVERIFIED. Evidence: Eval summary cases:0 files:[]; audit eval_state unverified Action: Author ~10 eval cases incl. baseline, hard-neg, and boundary vs prompt-craft/code-review.
- [HIGH] eval-readiness: Complete absence of executable eval cases prevents verification of routing and activation accuracy. Evidence: Audit summary shows 0 cases; metadata marks artifacts as 'planned'. Action: Author 10+ eval cases in eval.json to certify routing.
- [HIGH] eval_readiness: Zero eval cases for a 390-line comprehensive conceptual skill with 10-point verification checklist Evidence: Eval summary: 0 cases, 0 prompts, 0 assertions across all categories Action: Author minimum 5 comprehension and 5 application eval cases
- [MEDIUM] eval_readiness: Zero comprehension and zero application eval cases despite `eval_artifacts: planned`; the skill's rich mental models are strong candidates for scenario testing. Evidence: eval summary shows 0 cases, 0 files; all four audit verdicts are UNVERIFIED. Action: Author ≥5 comprehension cases covering the three-eras mapping, autonomy-slider decision logic, and AutoResearch constraint rationale.

### autonomous-loop-patterns
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/autonomous-loop-patterns/SKILL.md
Content score: 83 (B)
Eval readiness score: 66 (D)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/boundary: Description and Do-NOT-Use table cleanly delegate to four sibling skills by mechanism, giving sharp activation and anti-scope. Evidence: Distinct rows for prompt-craft, tool-call-strategy, context-management, agent-engineering, observability-modeling. Action: Keep; this is a content strength, no change needed.
- [LOW] content/coverage: Human-gated loop appears in catalog and selection tables but has no dedicated Pattern section like the other four, leaving its safeguards underspecified. Evidence: Patterns 1-4 detailed; human-gated only in tables. Action: Add a short Pattern 5 section for the human-gated loop.
- [INFO] Clarity: Excellent breakdown of primitives and pattern catalog provides immediate reuse value. Evidence: Detailed tables for Primitives and Pattern Catalog in SKILL.md. Action: Maintain this structured approach.
- [HIGH] content-authoring: scope verbatim copies description — scope should be a distinct PRD-style statement of what the skill teaches and does not Evidence: scope field word-for-word repeats the description text Action: Write a concise PRD-style scope separate from the routing description
- [LOW] frontmatter-hygiene: triggers and keywords are quoted JSON strings in YAML frontmatter rather than native YAML arrays Evidence: Lines 101,104 use "[\"...\"]" string format instead of YAML list syntax Action: Author as native YAML arrays or verify parser compatibility for quoted-JSON encoding
- [MEDIUM] content — scope field: scope is a verbatim copy of description. It should be a PRD-style statement of what the skill teaches and what it does not, not a routing activation summary. Evidence: metadata.scope (line 82) is character-identical to description (line 67). Action: Rewrite scope as a teaching-focused PRD: what the agent learns, pattern types covered, and explicit non-coverage areas.
- [MEDIUM] content — comprehension_state: comprehension_state field is absent from metadata despite all five Understanding fields being populated. The skill signals intent to provide comprehension but does not declare it. Evidence: mental_model, purpose, concept_boundary, analogy, misconception are all present (lines 120-129); comprehension_state is only mentioned in a comment (line 116) with no value set. Action: Add comprehension_state: present to metadata so the schema and audit loop recognize the Understanding fields.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 16 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/autonomous-loop-patterns/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval/readiness: Eval has 16 cases across 3 files but 0 assertions and 0 baseline, so prompts cannot be auto-graded or compared to a no-skill control. Evidence: Eval summary: assertions 0, baseline 0, regression 0. Action: Add machine-checkable assertions and a baseline arm before certifying.
- [MEDIUM] eval/audit-state: Comprehension and application verdicts are UNVERIFIED and eval_state unverified, so usefulness is unproven despite present artifacts. Evidence: Audit: comprehension/application UNVERIFIED, eval_state unverified, routing_eval absent. Action: Run comprehension+application graders and a routing eval to lift certification.
- [MEDIUM] Eval Readiness: 16 cases exist but contain zero assertions, preventing automated pass/fail validation. Evidence: Static eval summary shows 16 cases and 0 assertions. Action: Define specific validation assertions for each case.
- [LOW] Organization: Fragmented eval artifacts across three files complicates maintenance and risks drift. Evidence: Eval summary lists comprehension.json, eval-set.json, and evals.json. Action: Consolidate cases into a single source of truth.
- [MEDIUM] eval-readiness: 16 eval cases exist but carry 0 assertions, 0 baselines, and all verdicts UNVERIFIED — cannot certify behavior change Evidence: comprehension/application_verdict UNVERIFIED, eval_state unverified, routing_eval absent Action: Define assertions per case, run comprehension eval, stamp verdicts with evidence
- [LOW] eval design: Three eval files exist (comprehension.json, eval-set.json, evals.json) but eval_state is unverified and no assertions or baseline are declared. Certification pathway is unclear. Evidence: 16 cases across 3 files; assertions: 0, baseline: 0; eval_state: unverified, both verdicts: UNVERIFIED. Action: Consolidate to a single canonical eval file, run the comprehension eval, and update eval_state to passing with an eval_last_run receipt.

### claude-code
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/claude-code/SKILL.md
Content score: 87 (B)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content-boundary: Content cleanly separates harness vs model vs SDK decisions with explicit anti-examples, suppresses edges, and a routes-away-from-itself stance that sharpens activation. Evidence: anti_examples → claude-api/gpt-5-5/autonomous-loop-patterns; 'Do NOT Use When' table Action: None; preserve the model-vs-harness framing as the core differentiator.
- [INFO] mental_model: Exceptional 'Harness vs Brain' distinction effectively prevents common user conflation with model-routing decisions. Evidence: SKILL.md sections on mental model and misconceptions. Action: Maintain this framing in all harness skills.
- [MEDIUM] grounding: references/model-facts.md cited in body but not declared as formal truth_source Evidence: Body lines 243-244 cite a reference file; no grounding.truth_sources in frontmatter Action: Add grounding.truth_sources entry matching the reference file
- [HIGH] grounding: truth_verdict is UNVERIFIED with no truth_sources declared in grounding; version-specific claims (Opus 4.8, 25 hook points, Terminal-Bench 2.0 leadership) lack source attribution. Evidence: Audit summary: truth_verdict: UNVERIFIED; SKILL.md body has no grounding block. Action: Add grounding.truth_sources with URLs to Claude Code docs and SWE-bench/Terminal-Bench references; re-record drift baselines.
- [MEDIUM] content_accuracy: Unqualified factual claims — 'Opus leads on SWE-bench Pro' and '25 lifecycle points' — risk becoming stale as the harness ships features fast, which the skill itself warns about. Evidence: Body line 153: 'Opus 4.8 as of mid-2026'; line 197: '25 lifecycle points'; the skill's own weakness section acknowledges version claims age quickly. Action: Add date-stamps to each versioned claim or route readers to a pinned reference doc; consider noting which claims are perishable.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/claude-code/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface: 15 cases carry zero expected outputs, assertions, and baselines, so comprehension/application verdicts are null and pass/fail cannot be scored. Evidence: expected 0, assertions 0, baseline 0; comprehension/application_verdict null Action: Add expected answers and assertions per case to enable scoring and certification.
- [MEDIUM] eval-coverage: Eval surface: case mix is thin on regression and boundary discrimination given the skill's heavy reliance on harness-vs-rival routing decisions. Evidence: boundary 1, regression 0, routing_eval absent across 15 cases Action: Add routing/boundary cases for Codex/OpenCode vs Claude Code edge calls.
- [HIGH] eval_readiness: Evaluation cases lack assertions or expected outputs, preventing automated pass/fail verification of the routing contract. Evidence: Eval summary shows 0 assertions and 0 expected outputs. Action: Define specific pass/fail criteria for the 15 cases.
- [MEDIUM] eval_design: Strong case volume and hard negatives provide a solid foundation for stress-testing the boundary and suppression logic. Evidence: 15 cases with 6 hard negatives and 1 boundary case. Action: Leverage these negatives to verify 'suppresses' logic.
- [HIGH] assertion_gap: Eval cases lack assertions: 0 expected_flags and 0 assertions across 15 cases Evidence: Eval summary shows assertions=0, expected=0, baseline=0 Action: Add expected_flags, absent_signals to each application.json case
- [MEDIUM] eval_verdict: No comprehension or application verdict stamped; routing_eval absent Evidence: audit-state shows comprehension_verdict=null, application_verdict=null Action: Run the eval pipeline and stamp matching verdicts
- [HIGH] eval_readiness: Eval summary shows zero assertions and zero baseline queries; routing_eval is absent and eval_state is unverified — no evidence the eval suite has ever been run. Evidence: Eval summary: expected: 0, assertions: 0, baseline: 0; audit-state: eval_state: unverified, routing_eval: absent. Action: Run the comprehension and application evals against a frontier model; populate expected/assertions/baseline; stamp eval_state: passing with eval_last_run receipt.

### claude-haiku
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/claude-haiku/SKILL.md
Content score: 82 (B)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] stability labelling: stability: experimental contradicts the mature content depth — verification checklist, Do Not Use When table, and relations with suppresses reasons Evidence: Skill body shows thorough coverage typical of a stable skill, not an experimental one Action: Advance to stable after first graded evaluation pass
- [LOW] content redundancy: Description (69) and scope (82) repeat mental model, purpose, and boundary material already in the body Evidence: The 4-line description recaps what scope + mental_model + concept_boundary already cover Action: Tighten description to routing activation summary only; let body own the procedural detail
- [HIGH] truth-grounding: truth_verdict is UNVERIFIED — the skill cites references/model-facts.md but no drift check has verified the facts are current. Evidence: audit-state.json: truth_verdict: UNVERIFIED. Action: Run drift check or re-record truth_source_hashes after verifying model-facts.md content is live.
- [LOW] body-structure: Philosophy section duplicates content already captured in Understanding fields (concept_boundary, mental_model) — minor prose redundancy. Evidence: Lines 99, 94, 156-161 overlap with lines 178-179. Action: Consider trimming the Philosophy section to point at the Understanding fields or removing the overlap.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/claude-haiku/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval set has 14 cases but zero expected outputs and zero assertions, so no case is machine-gradeable; routing_eval absent. Evidence: Eval summary: expected 0, assertions 0, routing_eval absent Action: Add expected routing verdicts/assertions per case; add a routing-decision eval.
- [MEDIUM] grounding: Content surface: capability table asserts specific numbers (200K, 64K, ~1/3, ~1/5, 4096) that drift per release; caveat helps but inline figures still risk staleness. Evidence: Capabilities table quotes pricing ratios and token limits Action: Push exact figures to references/model-facts.md; keep only the decision-relevant relations inline.
- [MEDIUM] certification: Eval-readiness surface: audit truth_verdict UNVERIFIED and eval_state unverified with no comprehension/application verdicts, so artifacts exist but are uncertified. Evidence: Audit: truth UNVERIFIED, eval_state unverified, verdicts null Action: Run truth + comprehension/application verification to populate verdicts.
- [HIGH] eval certification: Eval artifacts exist (14 cases, 7 prompts, 4 hard negatives) but comprehension/application verdicts are null and eval_state is unverified Evidence: Audit summary shows null verdicts for both comprehension and application; eval_state unverified Action: Run evaluate --mode comprehension and evaluate --mode application through the audit loop
- [MEDIUM] eval-certification: eval_state is unverified despite 14 eval cases across comprehension and application — no graded verdict has been stamped. Evidence: audit-state.json: comprehension_verdict null, application_verdict null, eval_state: unverified. Action: Run comprehension and application evals to obtain graded verdicts.

Blockers:
- gemini-flash: exit 0

### claude-opus
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/claude-opus/SKILL.md
Content score: 84 (B)
Eval readiness score: 53 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/boundary: SKILL.md gives crisp escalation signals, an inverted de-escalation rule, a Do-NOT-Use route table, and a verification checklist — boundaries name the routing mechanism, not just labels. Evidence: 'doubt routes down, not up'; Do NOT Use table maps each case to sonnet/haiku/script Action: None; content is publish-ready.
- [INFO] purpose: Treats routing as an architectural escalation rather than a lazy default. Evidence: Philosophy and Coverage sections emphasize tasks must 'earn' the top rung. Action: None; maintain this standard for all model-routing skills.
- [MEDIUM] Content efficiency: Five frontmatter Understanding fields (lines 93-103) restated nearly verbatim in body sections (lines 154-167) — inflates 176 lines without adding decision-useful content Evidence: mental_model/purpose/concept_boundary/analogy/misconception appear in both frontmatter and body with near-identical prose Action: Remove body paragraphs that duplicate frontmatter; retain only body-unique content like capability table and verification checklist
- [LOW] Content signal density: Philosophy of the skill section (lines 176-178) re-states cost-discipline advocacy already captured in mental_model and purpose — adds no new procedure or routing guidance Evidence: Line 176-178 and lines 93-96 express identical 'task earns the top rung' thesis Action: Remove or fold into purpose; replace with a decision flowchart or escalation criteria table
- [MEDIUM] truth_grounding: Truth verdict is UNVERIFIED and grounding relies on references/model-facts.md which may contain stale capability facts. Evidence: audit-state.json shows truth_verdict: UNVERIFIED; skill body warns to verify live before quoting. Action: Verify model-facts.md against current provider docs and record truth_source_hashes.
- [LOW] body_structure: Body omits a dedicated Misconception section despite frontmatter misconception field — the misconception is embedded in 'What it is NOT' instead. Evidence: Frontmatter has misconception field; body has no 'Common Misconception' heading; concept covered under 'What it is NOT'. Action: Consider adding a dedicated Misconception subsection to align body with Understanding fields.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/claude-opus/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface: 14 cases but 0 expected answers and 0 assertions, so no case is gradable — comprehension/application verdicts cannot be computed. Evidence: Eval summary expected:0, assertions:0; audit comprehension/application verdict null Action: Add expected outputs/assertions to each case before certification.
- [MEDIUM] eval-readiness/audit: Audit surface: truth_verdict UNVERIFIED and routing_eval absent, so capability-fact accuracy and router activation remain unproven despite present artifacts. Evidence: Audit summary truth_verdict UNVERIFIED, routing_eval absent, eval_state unverified Action: Run truth verification and add a routing eval to lift state to verified.
- [HIGH] eval-quality: Evaluation cases lack assertions or expected outputs, making them non-functional. Evidence: Eval summary reports 14 cases but 0 assertions and 0 expected results. Action: Add specific assertions to application.json and comprehension.json.
- [MEDIUM] audit-state: Audit state flags the routing-specific evaluation suite as absent. Evidence: audit-state.json lists 'routing_eval': 'absent' despite this being a routing skill. Action: Develop a routing-specific eval to verify tier escalation/de-escalation logic.
- [MEDIUM] Eval certification: Both eval artifacts present (14 cases, 4 hard negatives) but comprehension_verdict and application_verdict are null — no graded verdicts Evidence: audit-state.json shows comprehension_verdict:null, application_verdict:null, eval_state:unverified, routing_eval:absent Action: Run evaluate --mode comprehension and evaluate --mode application to certify graded verdicts
- [HIGH] eval_artifacts: Both eval files exist with 14 cases total but eval_state remains unverified — no eval has been run to produce a receipt. Evidence: audit-state.json shows eval_artifacts: present, eval_state: unverified, comprehension_verdict: null, application_verdict: null. Action: Run comprehension and application evals to produce receipts and stamp verdicts.

### claude-sonnet
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/claude-sonnet/SKILL.md
Content score: 81 (B)
Eval readiness score: 56 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] concept_clarity: The SKILL.md content is exceptionally comprehensive, featuring clear multi-directional routing boundaries, explicit verification checklists, and detailed coverage of the 1M-context billing caveat. Evidence: SKILL.md contains precise operational boundaries and a robust Do NOT Use When section. Action: Maintain the excellent content structure and update model facts periodically.
- [HIGH] content — lifecycle metadata: stability: experimental mismatches content maturity — skill reads as production-ready with full coverage, checklist, and boundary table Evidence: Coverage (§6 dimensions), Verification checklist with 4 checks, Do NOT Use When table with 6 routing rows Action: Upgrade to stable or add an experimental note in the body explaining what remains in flux

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/claude-sonnet/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: The evaluation suite contains zero assertions or expected outcomes despite having fourteen test cases, preventing automated validation of routing decisions. Evidence: Eval summary indicates 14 cases and 7 prompts but 0 assertions and 0 expected entries. Action: Define explicit assertions and expected output criteria for all 14 evaluation cases across both JSON files.
- [MEDIUM] eval_readiness: The evaluation design lacks any regression test cases, leaving the skill vulnerable to behavioral degradation during subsequent iterations. Evidence: Eval summary explicitly reports zero regression cases. Action: Incorporate dedicated regression test cases to lock in validated routing behaviors.
- [MEDIUM] eval — behavioral certification: Eval artifacts exist (14 cases, 3 hard neg, 2 boundary) but eval_state is unverified with null verdicts — no comprehension or application grading executed Evidence: audit-state: eval_artifacts present, eval_state unverified, comprehension_verdict null, application_verdict null Action: Execute comprehension and application evals, then stamp graded verdicts
- [MEDIUM] eval — routing coverage: routing_eval absent for a skill whose core function IS routing — no baseline verification that the router surfaces this skill correctly Evidence: audit-state: routing_eval absent; skill purpose is model-tier routing Action: Include claude-sonnet in the next routing eval sweep
- [MEDIUM] eval_readiness: eval_state: unverified and truth_verdict: UNVERIFIED with no eval_last_run receipt despite 14 eval cases present. Evidence: audit-state.json shows eval_state: unverified, truth_verdict: UNVERIFIED, no eval_last_run. Action: Run the comprehension and application evals against the skill to stamp verified verdicts.

Blockers:
- opus: exit 0

### codex
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/codex/SKILL.md
Content score: 87 (B)
Eval readiness score: 53 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/activation: Description and concept_boundary cleanly split harness-vs-model with three explicit negative routes (gpt-5-5, claude-code, autonomous-loop-patterns); mental model and misconception reinforce the differentiator. Evidence: SKILL.md description + concept_boundary + misconception fields Action: None; activation contract is strong as authored.
- [MEDIUM] Conciseness: Description at 67 words risks diluting routing activation signal; core triggers should be scannable at a glance. Evidence: Description unwinds 67 words covering triggers, capabilities, and exclusions in one sentence. Action: Restructure: concise activation hook in description, detail in scope and body.
- [MEDIUM] Grounding: references/model-facts.md cited in body lacks grounding declaration — no drift-tracking surface. Evidence: Body references model-facts.md but frontmatter omits grounding.truth_sources entirely. Action: Add grounding.truth_sources with path and hash for automated drift detection.
- [LOW] content: References section cites references/model-facts.md but no grounding truth_sources block is declared in frontmatter. Evidence: SKILL.md references section at line 245; no grounding.key_sources or truth_sources in frontmatter. Action: Add a grounding block with truth_sources pointing at model-facts.md so drift can be checked.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/codex/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: 14 cases carry 0 expected outputs and 0 assertions, so no case is machine-gradeable; comprehension/application verdicts are null. Evidence: Eval summary: expected 0, assertions 0; audit verdicts null Action: Add expected answers/assertions to each prompt before certification.
- [MEDIUM] eval-readiness/provenance: truth_verdict UNVERIFIED and routing_eval absent despite many fast-changing CLI command/flag claims dependent on external Codex docs. Evidence: Audit: truth UNVERIFIED, routing_eval absent, eval_state unverified Action: Run truth verification against references/model-facts.md and add a routing eval.
- [HIGH] Eval automation: Zero assertions, expected outputs, or baselines across 14 cases — eval artifacts cannot auto-grade. Evidence: Eval summary: expected=0, assertions=0, baseline=0 despite 14 cases. Action: Add expected outputs and assertions to application.json/comprehension.json cases.
- [HIGH] eval_readiness: Only 14 cases across both eval files (8 prompts); below the 5-case-per-file floor and 10-case target. Evidence: Eval summary shows cases: 14, prompts: 8, hardNeg: 6, boundary: 3. Action: Author additional application cases to meet the 5-case floor per file and push total toward 10.
- [MEDIUM] eval_readiness: comprehension_verdict and application_verdict are both null despite eval_artifacts being present. Evidence: Audit summary: comprehension_verdict null, application_verdict null, eval_state unverified. Action: Run evaluate for both modes to stamp verdicts and move eval_state to passing.

Blockers:
- gemini-flash: exit 0

### content-monitor
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/content-monitor/SKILL.md
Content score: 75 (C)
Eval readiness score: 14 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 3 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] content-redundancy: Content surface repeats scope across Concept, Domain Context, Coverage, and Philosophy sections, inflating length without adding new procedure. Evidence: Four sections restate 'multi-source intelligence pipeline' phases nearly verbatim Action: Collapse overlapping intro sections into one scope statement plus procedure.
- [LOW] grounding/provenance: Provenance label contradicts declared schema: frontmatter claims v8 contract but skill_graph_protocol reads 'Skill Metadata Protocol v5'. Evidence: schema_version 8 vs skill_graph_protocol: 'Skill Metadata Protocol v5' Action: Reconcile export provenance label to match the v8 contract.
- [HIGH] Instructional Design: Superior mental model provided through the model-split architecture. Evidence: Section 2 details MiniMax (free) vs GPT-5.4 (quality) usage. Action: Maintain this cost-aware reasoning in future pipeline extensions.
- [HIGH] Guardrails: Robust state separation prevents common persistence and deduplication bugs. Evidence: Sections 1.5 and 4 mandate distinct source/state locations. Action: Enforce this distinction in all newly authored adapters.
- [HIGH] Portability / Generalizability: Skill documents a specific project pipeline with hardcoded paths, adapter counts, model names, and file locations. Cannot teach a general capability. Evidence: Lines 169-174 list repo-specific files; lines 252-264 give exact source counts (19 YT channels, 14 GitHub topics); lines 210-214 anchor to Development repo root. Action: Extract the general pipeline pattern; move implementation details to a references/ doc. Keep the skill capability-centric.
- [LOW] Metadata accuracy: skill_graph_protocol claims 'Skill Metadata Protocol v5' while the current protocol is v8 and the skill uses v8 fields (subject, public, scope). Stale version label. Evidence: Line 137: skill_graph_protocol: Skill Metadata Protocol v5. Rest of frontmatter uses v8 classification fields (subject: agent-ops, public: true, scope: free-text, stability: experimental). Action: Update skill_graph_protocol to 'Skill Metadata Protocol v8' and ensure all content matches the v8 bar.
- [MEDIUM] metadata_accuracy: skill_graph_canonical_skill references skills/content-monitor/SKILL.md but actual path is skills/agent-ops/content-monitor/SKILL.md. Evidence: Canonical skill field says skills/content-monitor/SKILL.md; file lives under agent-ops/ segment. Action: Correct skill_graph_canonical_skill to skills/agent-ops/content-monitor/SKILL.md.
- [LOW] structure_consistency: Relations block appears in both nested metadata (JSON string) and top-level frontmatter, creating dual representation. Evidence: Line 125 has metadata.relations as string; line 152 has top-level relations: with typed edges. Action: Consolidate to single top-level relations block per v8 flat-frontmatter convention.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/content-monitor/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval cases, prompts, or assertions exist; comprehension and application verdicts both UNVERIFIED, so usefulness is unproven. Evidence: Eval summary: cases 0, eval_artifacts 'planned', application_verdict UNVERIFIED Action: Author ~10 cases: activation, hard-negatives (keywords/user-research), boundary, regression.
- [HIGH] Eval Readiness: Complete absence of test cases renders the skill unverified. Evidence: Eval summary reports 0 cases and 0 assertions. Action: Author 10 evaluation cases covering adapter routing and scoring.
- [MEDIUM] Eval readiness: No eval artifacts exist — 0 cases, 0 prompts, 0 assertions. Skill cannot progress beyond UNVERIFIED without comprehension and application evals. Evidence: Eval summary shows 0 in every count field. audit-state.json eval_artifacts: planned, comprehension_verdict and application_verdict both UNVERIFIED. Action: Author at least 5 comprehension eval cases and 5 application eval cases from the pipeline architecture and adapter patterns.
- [HIGH] eval_design: No eval artifacts exist despite complex multi-phase pipeline with multiple source types and model choices. Evidence: eval_artifacts: planned, eval_state: unverified, 0 cases, 0 files. Action: Create comprehension.json (5+ scenarios covering adapter routing, dedup logic, model split) and application.json (5+ cases with hard negatives).

### context-engineering
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/context-engineering/SKILL.md
Content score: 95 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Cite or label thresholds as illustrative defaults, not measured standards.

Content findings:
- [MEDIUM] grounding: Numeric metric thresholds (precision >80%, recall >90%, utilization, freshness ranges) are authored heuristics with no cited source, mildly conflicting with the skill's own 'cite specifics not generic advice' rule. Evidence: Quality-metric tables give cutoffs; truth_sources list no metric provenance. Action: Cite or label thresholds as illustrative defaults, not measured standards.
- [INFO] Instructional Quality: Exceptional five-layer stack and failure-mode decision tree provide high-signal, actionable agent-ops guidance. Evidence: 449 lines of comprehensive diagnostic protocols and stack definitions. Action: Maintain content as the gold standard for agent-ops skills.
- [MEDIUM] Verification: Truth and application verdicts remain UNVERIFIED despite strong grounding references to industry literature. Evidence: Audit summary truth_verdict: UNVERIFIED; application_verdict: UNVERIFIED. Action: Execute skill-graph-drift and gate-9 application tests.
- [HIGH] content — boundary clarity: Exceptional scope articulation via Do-Not-Use table, concept_boundary, suppresses edges, and anti_examples Evidence: 500-level Do-Not-Use table names 6 confusable skills with rationale; concept_boundary gives mechanism-level distinction; both suppresses targets carry ownership reason-text Action: Maintain as specimen for boundary-craft during new-skill authoring
- [MEDIUM] content — frontmatter consistency: Dual relations block: JSON-encoded nested metadata (L130) plus flat YAML (L174–77) with divergent content Evidence: Flat block adds epistemic-grounding to verify_with and 3 extra related skills; nested block has fewer edges and omits verify_with additions Action: Remove the nested metadata relations; keep only the richer flat block as canonical
- [LOW] content: Top-level relations block contains stale values inconsistent with the metadata relations entry. Evidence: Top-level relations.related lists 5 skills including context-window, tool-call-strategy, agent-engineering; metadata.relations.related lists only prompt-craft, skill-router. Action: Reconcile the two relations declarations so they agree on edge targets.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/context-engineering/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval cases, prompts, or assertions exist against a target of 10; routing_eval absent despite a rich activation surface (10 keywords, 8 examples, 6 anti-examples). Evidence: Eval summary: files 0, cases 0; audit eval_artifacts 'planned', routing_eval 'absent'. Action: Author 10 cases: baseline, hard-negatives vs prompt-craft/skill-scaffold/skill-router, boundary, plus routing-activation eval.
- [LOW] provenance: Export provenance label skill_graph_protocol reads 'v6' while frontmatter and comprehension fields are v8, a stale content-label that could mislead auditors. Evidence: skill_graph_protocol: Skill Metadata Protocol v6; schema_version comment Integer 8. Action: Refresh export provenance label to current protocol version via pipeline.
- [HIGH] Eval Readiness: Zero evaluation cases or prompts exist, preventing automated verification of skill activation or comprehension. Evidence: Eval summary reports 0 cases, prompts, and assertions. Action: Author 10+ evaluation cases covering hard negatives and boundaries.
- [HIGH] eval-readiness — artifact absence: eval_artifacts: planned is honest but leaves certification (comprehension + application verdicts) fully blocked Evidence: eval_artifacts=planned, eval_state=unverified, routing_eval=absent, both verdicts UNVERIFIED Action: Author comprehension.json (≥7 cases covering all 4 failure modes + metrics) then application.json with red-herring negatives
- [HIGH] eval-readiness: No eval cases exist for comprehension or application; eval_artifacts is 'planned' with zero files. Evidence: eval summary: files=[], cases=0, expected=0, eval_state: unverified, comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED. Action: Author evals/comprehension.json (5-8 cases) and evals/application.json (5-7 cases with hard negatives).
- [MEDIUM] eval-readiness: routing_eval is 'absent' and no routing eval baseline reference exists for this skill. Evidence: routing_eval: absent, audit summary confirms no routing coverage. Action: Include context-engineering in a routing eval pass against the retrieval baseline.

### context-graph
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/context-graph/SKILL.md
Content score: 91 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Reconcile to one authoritative relations source so graph synthesis is deterministic.

Content findings:
- [MEDIUM] grounding/consistency: Frontmatter declares relations twice — a metadata JSON block and a top-level YAML block — with divergent targets (knowledge-modeling, refactor, taxonomy-design appear only top-level). Evidence: metadata.relations vs top-level relations list different suppresses/verify_with skills Action: Reconcile to one authoritative relations source so graph synthesis is deterministic.
- [LOW] provenance: Export provenance labels skill_graph_protocol 'Skill Metadata Protocol v5' while the artifact uses v8 classification fields, a stale content-label claim. Evidence: skill_graph_protocol: Skill Metadata Protocol v5 amid subject/public/taxonomy_domain v8 fields Action: Correct the protocol label or confirm export pipeline emits the right version.
- [LOW] Precision: Metric thresholds rely on qualitative descriptions. Evidence: Unhealthy signal column lacks specific numeric limits. Action: Define exact numeric bands for healthy/unhealthy states.
- [HIGH] frontmatter consistency: metadata.relations and top-level relations disagree on targets Evidence: metadata.related omits knowledge-modeling, refactor; metadata.verify_with omits project-knowledge-extraction, taxonomy-design Action: Reconcile both encoding blocks to identical target lists
- [LOW] label honesty: skill_graph_protocol: v5 while content uses v8 fields comprehensively Evidence: subject, public, scope, taxonomy_domain, five Understanding fields all present; protocol label understates earned content Action: Advance skill_graph_protocol label after next audit-loop pass
- [MEDIUM] content_scope: skill_graph_protocol is 'Skill Metadata Protocol v5' but skill declares subject/public/taxonomy_domain which are v8 fields — content label does not match substantive migration. Evidence: skill_graph_protocol: Skill Metadata Protocol v5 at line 131; subject, public, taxonomy_domain present in metadata block. Action: Advance skill_graph_protocol to v8 after confirming Understanding fields and v8 classification are complete and reviewed.
- [LOW] content_relations: Top-level relations.related includes 'knowledge-modeling' and 'refactor' which are not listed in metadata.relations.related — potential drift between the two relation surfaces. Evidence: Line 138: related includes knowledge-modeling, refactor; metadata.relations block (line 109) does not list them. Action: Reconcile the two relation declarations so top-level and metadata.relations agree.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/context-graph/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface is empty: zero cases, prompts, assertions, baselines, hard-negatives against a target of 10; eval_state unverified and artifacts only planned. Evidence: Eval summary cases:0 prompts:0; audit eval_artifacts 'planned' Action: Author ≥10 routing/comprehension cases including hard-negatives for the named anti-skills.
- [HIGH] Eval Readiness: Complete absence of evaluation cases and prompts. Evidence: Eval summary reports zero cases and prompts. Action: Author 10+ cases for routing and topology.
- [MEDIUM] Audit Integrity: Audit state remains unverified across all dimensions. Evidence: audit-state.json shows UNVERIFIED status for truth/application. Action: Execute verification loops to finalize the audit.
- [MEDIUM] eval readiness: Zero eval cases despite strong eval-ready content structure and checklist Evidence: Eval summary shows 0 files, 0 cases, 0 prompts; audit-state: eval_artifacts=planned, eval_state=unverified Action: Author 7-8 comprehension cases and 5+ application cases with hard negatives
- [HIGH] eval_readiness: No comprehension or application eval artifacts exist; eval_artifacts is 'planned' with zero cases, zero prompts, zero assertions. Evidence: Static eval readiness pre-score: 15; eval summary shows 0 cases across all dimensions. Action: Author comprehension.json (≥5 cases) and application.json (≥5 cases with hard negatives) to enable graded verdict.

### context-management
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/context-management/SKILL.md
Content score: 83 (B)
Eval readiness score: 14 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/procedure: SKILL.md gives a reusable six-step loop, four-bucket intake, distillation table, drift signals, and five-field handoff — concrete and reusable mental models. Evidence: Sections 2-7 plus Verification checklist and Do-NOT-Use table. Action: None; preserve this structure.
- [LOW] content/metadata: Provenance label drift: skill_graph_protocol says v5 while body conforms to Protocol v8, a stale export-label inconsistency. Evidence: skill_graph_protocol: 'Skill Metadata Protocol v5' under schema_version 8. Action: Refresh export provenance label to v8 on next export.
- [MEDIUM] content: The 'allowed-tools' list is likely too narrow for comprehensive intake triage across a workspace. Evidence: allowed-tools: Read Grep. Action: Include Glob or ListDirectory to support the initial 'cheapest sources' search phase.
- [LOW] content: Stability is labeled 'experimental' despite the artifact presenting mature, highly structured procedural models. Evidence: metadata.stability: experimental; sections 2-7 contain detailed protocols. Action: Graduate maturity status to 'stable' once the missing evaluation suite is implemented.
- [MEDIUM] metadata consistency: Relations declared in both metadata block and top-level frontmatter with divergent content Evidence: Top-level adds summarization as related, context-window as suppressed vs metadata-encoded version Action: Reconcile to single source of truth; top-level relations should be canonical
- [MEDIUM] frontmatter structure: metadata.relations (line 128) is a JSON-stringified block, but a second YAML relations block exists at lines 157-160 outside metadata — two competing relation surfaces. Evidence: metadata.relations at line 128; relations at lines 157-160 with slightly different skill lists. Action: Remove the duplicate top-level relations block; keep only metadata.relations.
- [LOW] protocol version: skill_graph_protocol declares 'Skill Metadata Protocol v5' but schema_version should be 8 per current contract. Evidence: Line 140: skill_graph_protocol: Skill Metadata Protocol v5. Action: Bump to 'Skill Metadata Protocol v8' to match current schema_version.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/context-management/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] content/grounding: Skill is principle-grounded with no truth-source hashes or drift_check record, so claims rest on author assertion rather than verifiable sources. Evidence: No drift_check / truth_source_hashes; freshness/owner commented out. Action: Record drift_check.last_verified to anchor the provenance axis.
- [HIGH] eval-readiness: Eval artifacts are 0 cases against a target of 10; comprehension and application verdicts UNVERIFIED, so usefulness is unproven despite clean structural/truth PASS. Evidence: Eval summary cases:0; audit eval_artifacts 'planned', eval_state 'unverified'. Action: Author 10+ cases: baseline, hard-negatives vs context-graph/engineering, boundary, regression.
- [HIGH] eval_readiness: The skill has zero evaluation cases or prompts despite being marked as 'planned' for artifacts. Evidence: Eval summary: cases: 0, prompts: 0. Action: Author 10+ eval cases to verify the context-management loop and distillation rules.
- [HIGH] eval design: No comprehension or application eval artifacts exist for a skill with rich procedural content Evidence: Eval summary shows 0 cases, 0 files; eval_artifacts: planned; comprehension_verdict: UNVERIFIED Action: Author comprehension.json (5+ cases) and application.json (5+ cases including hard negatives)
- [LOW] retrieval effectiveness: Keywords include compound phrases unlikely as user search terms at the 10-term cap Evidence: 'one active hypothesis', 'lost-thread recovery', 'distill raw inputs' are skill-internal not user-typical Action: Replace skill-internal phrases with common user queries for better routing recall
- [HIGH] eval coverage: No comprehension or application eval files exist (0 cases). Skill cannot earn a graded verdict. Evidence: eval_artifacts: planned, eval_state: unverified, comprehension_verdict: UNVERIFIED. Action: Author comprehension.json (≥5 cases) and application.json (≥5 cases with ≥1 red-herring).

### context-window
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/context-window/SKILL.md
Content score: 94 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Keep content structure as a template for other agent-ops skills.

Content findings:
- [INFO] content/boundary: Description, anti_examples, and Do-NOT-Use table cleanly partition context-window from context-management, context-graph, prompt-craft, and memory curation by mechanism, not label. Evidence: SKILL.md: suppresses reasons + boundary table name distinct mechanisms. Action: None; retain as boundary exemplar.
- [INFO] instructional-design: Exceptional quantitative framework using health states and the 80% rule provides clear, actionable mental models for autonomous agents. Evidence: SKILL.md coverage section and health states table. Action: Keep content structure as a template for other agent-ops skills.
- [LOW] boundary-clarity: Strong concept boundaries successfully distinguish this skill from context-management by focusing on capacity math rather than information value. Evidence: SKILL.md concept_boundary and anti_examples fields. Action: None; content is ready for certification once evals are added.
- [MEDIUM] description activation: Description at 1352 chars reads as a mini-manual rather than a concise activation trigger Evidence: Canonical description_length: 1352; marketplace limit is 1024 Action: Trim to ~800 chars; move operational detail to SKILL.md body
- [LOW] export provenance: skill_graph_protocol: v6 while content clearly implements v8 fields Evidence: Uses subject, public, scope, taxonomy_domain — all v8 fields Action: Update to v8 when next touched by export pipeline
- [MEDIUM] frontmatter-encoding: keywords and examples stored as JSON-encoded strings instead of native arrays. Evidence: Lines 116-119 show keywords/examples as quoted JSON arrays rather than YAML list syntax. Action: Reformat as native YAML arrays (unquoted list items) for consistency with the flat encoding convention.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/context-window/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval files, cases, prompts, or assertions exist against a target of ~10; all comprehension/truth/application verdicts UNVERIFIED, so usefulness is unproven. Evidence: Eval summary cases:0; audit eval_state unverified, application UNVERIFIED. Action: Author 10 cases incl. hard-neg/boundary, run application gate.
- [MEDIUM] eval-readiness/routing: Routing eval absent despite rich keywords/examples/anti_examples; activation vs adjacent context-* skills is unverified by the harness. Evidence: Audit summary routing_eval: absent; eval_artifacts planned. Action: Add routing cases covering anti_examples; gate via lint check 12.
- [HIGH] eval-readiness: Total lack of evaluation artifacts prevents verification of routing accuracy or concept comprehension across different model families. Evidence: Eval summary shows 0 cases, prompts, and assertions. Action: Create eval.json with 10+ cases targeting boundary conditions and health-state transitions.
- [HIGH] eval design: No comprehension or application eval files exist despite eval_artifacts set to planned Evidence: eval summary shows 0 cases, 0 files, 0 prompts Action: Author evals/comprehension.json with 7+ cases across rubric dimensions
- [HIGH] audit-state: comprehension_state absent despite all five Understanding fields populated and well-written. Evidence: metadata block (lines 143-154) has mental_model/purpose/concept_boundary/analogy/misconception but no comprehension_state: present. Action: Add comprehension_state: present to metadata to gate understanding-field lint rules.
- [LOW] eval-artifacts: All four Audit Status verdicts UNVERIFIED; eval_artifacts: planned with no eval files on disk. Evidence: audit-state.json summary shows zero comprehension/application eval cases; routing_eval absent. Action: Author comprehension.json with ≥5 hard scenarios and application.json with ≥5 cases to enable certification.

### gemini-flash
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/gemini-flash/SKILL.md
Content score: 87 (B)
Eval readiness score: 54 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/boundary: SKILL.md cleanly separates the cheap/fast tier from gemini-pro, agent-engineering, and skill-router with concrete anti-examples and a single named escalation boundary. Evidence: concept_boundary, Do-NOT-Use table, three anti_examples each tagged to a sibling. Action: Keep as model boundary exemplar; no content change needed.
- [INFO] Reasoning Model: The 'Line Cook' analogy and 'Floor/Workhorse/Ceiling' framework provide exceptional clarity for model tiering decisions. Evidence: SKILL.md mental_model and analogy fields. Action: Use as template for model skills.
- [LOW] stability-lifecycle: Stability declared experimental but the concept is stable and well-bounded; this may misrepresent maturity to consumers. Evidence: frontmatter stability=experimental; skill body presents a clear, complete conceptual framework with no known churn. Action: Consider upgrading stability to stable if the Gemini Flash tier facts are settled, or add rationale for experimental designation.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/gemini-flash/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness/assertions: Eval surface: 14 cases carry 0 expected outputs and 0 assertions, so nothing is machine-gradable; cases assert routing intent but cannot pass/fail. Evidence: Eval summary expected:0 assertions:0 baseline:0 regression:0. Action: Add expected verdicts/assertions per case before certification.
- [MEDIUM] eval-readiness/audit-state: Eval surface: truth_verdict UNVERIFIED and comprehension/application verdicts null; pricing/benchmark claims (78.0% SWE-Bench) unconfirmed against references. Evidence: Audit summary truth_verdict UNVERIFIED, comprehension/application null, eval_state unverified. Action: Run truth + comprehension/application graders against references/model-facts.md.
- [HIGH] Evaluation Scaffolding: Evaluation JSONs lack assertions and expected outputs, preventing automated verification despite high case count. Evidence: Eval summary: assertions: 0, expected: 0. Action: Add assertions to JSON eval files.
- [MEDIUM] Audit State: Audit state remains unverified across all categories, preventing formal skill certification. Evidence: Audit summary: truth_verdict: UNVERIFIED. Action: Complete the manual audit process.
- [HIGH] eval_readiness: Eval cases lack structured expectations for automated grading — 0 expected fields, 0 assertions, 0 baseline across 14 cases. Evidence: expected=0 assertions=0 baseline=0 in eval summary despite 14 cases and 8 prompts. Action: Add expected_flags, expected_fix_hints, and absent_signals to each application.json case.
- [MEDIUM] truth_grounding: Truth sources unverified — model pricing and benchmark facts will drift without a locked baseline. Evidence: truth_verdict=UNVERIFIED; references/model-facts.md cited but no truth_source_hashes recorded. Action: Run drift check and record truth_source_hashes for references/model-facts.md.
- [MEDIUM] certification: Behavior Gate never run — no evidence the skill changes agent behavior on real tasks. Evidence: comprehension_verdict=null, application_verdict=null, eval_state=unverified. Action: Run evaluate --mode comprehension and evaluate --mode application to establish behavioral evidence.
- [HIGH] eval-artifacts: Eval summary shows 14 cases with 0 expected values and 0 assertions — the eval files are structurally hollow despite claiming eval_artifacts: present. Evidence: eval summary: cases=14, expected=0, assertions=0. audit-state.json eval_state=unverified. Action: Populate comprehension.json with 7-8 hard scenarios and application.json with 5-7 cases including hard negatives.
- [MEDIUM] grounding-freshness: Truth verdict is UNVERIFIED with no drift baseline; the references/model-facts.md file is dated 2026-06-08 but never formally verified against source. Evidence: audit-state.json truth_verdict=UNVERIFIED, routing_eval=absent. Action: Run drift check and record truth_source_hashes for references/model-facts.md.

### gemini-pro
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/gemini-pro/SKILL.md
Content score: 86 (B)
Eval readiness score: 53 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [LOW] grounding: Content rests on volatile prices/benchmarks (200K cliff, SWE-Bench, GPQA); well-flagged as fast-moving but truth-source freshness drives correctness. Evidence: SKILL.md: 'facts current as of 2026-06-08'; references/model-facts.md Action: Verify model-facts.md against live sources to clear truth_verdict UNVERIFIED.
- [LOW] content: 3.5-generation line in When-to-Route table is forward-looking speculation without benchmark backing. Evidence: Line 189: 'Gemini 3.5 Pro/Flash are positioned as strongest agentic+coding models' — cited as future state. Action: Remove or gate behind a date-stamped qualifier until the generation ships with verifiable benchmarks.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/gemini-pro/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Comprehension and application verdicts are null, truth_verdict UNVERIFIED, routing_eval absent — no executed grading evidence for a routing-decision skill. Evidence: audit-state: comprehension/application null; routing_eval absent Action: Run and record comprehension/application graders and a routing eval before certifying.
- [MEDIUM] eval-design: Across 14 cases there are 0 expected outputs and 0 assertions, so cases cannot be auto-scored for correct routing vs hard-negative rejection. Evidence: Eval summary: expected 0, assertions 0, prompts 8 Action: Add expected routing targets/assertions per case; reach ~10 graded application cases.
- [HIGH] Eval Readiness: The 14 evaluation cases lack expected outputs and assertions, rendering the test suite unable to verify model routing behavior. Evidence: Eval summary shows 0 expected and 0 assertions. Action: Populate expected results and assertions.
- [INFO] Content Clarity: Analogy of the 'wide-load freight truck' effectively distinguishes context volume from retrieval quality, preventing common user misconceptions. Evidence: One-line analogy and Misconception sections. Action: Retain this high-signal teaching pattern.
- [MEDIUM] Grounding: Critical routing facts like the 200K pricing cliff are present but remain unverified in the audit state. Evidence: Truth verdict is UNVERIFIED. Action: Complete truth verification against current documentation.
- [HIGH] eval_readiness: Only 14 eval cases across comprehension+application; target is 12+ per eval surface for a skill this complex. Evidence: Eval summary shows 14 total cases, 8 hard negatives, but application eval has 0 expected flags or assertions. Action: Add 3+ more application cases with explicit expected_flags and expected_fix_hints for the pricing-cliff and multimodal routing scenarios.
- [MEDIUM] truth: audit-state.json declares truth_verdict: UNVERIFIED; grounding truth_sources not checked in bundle. Evidence: Audit summary: truth_verdict UNVERIFIED; references/model-facts.md cited but no drift baseline confirmed. Action: Run drift check against references/model-facts.md and stamp truth_verdict once hashes match.

Blockers:
- deepseek-flash: exit 0

### github-copilot
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/github-copilot/SKILL.md
Content score: 87 (B)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [HIGH] GROUNDING: Exceptional precision regarding the June 2026 AI-credit shift and non-rolling plan mechanics. Evidence: SKILL.md cost model section. Action: Preserve high-fidelity billing facts.
- [MEDIUM] grounding/truth_sources: Missing grounding field for the cited references file Evidence: Body cites references/model-facts.md (L225) but frontmatter has no grounding.truth_sources (content surface) Action: Add grounding.truth_sources pointing to references/model-facts.md
- [LOW] stability_honesty: Experimental label undersells mature routing prose Evidence: 164 lines of polished documentation with verification checklist carry experimental (content surface) Action: Add evolution criteria for stable promotion or promote to stable
- [HIGH] truth_grounding: truth_verdict is UNVERIFIED. The skill cites references/model-facts.md with 2026-06-08 date but drift check has not been run. Evidence: audit-state.json truth_verdict: UNVERIFIED. No drift status recorded. Action: Run skill-graph-drift.js against github-copilot to verify truth source hashes and stamp truth_verdict.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/github-copilot/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness: Eval suite under target: 14 cases but 0 expected outputs, 0 assertions, 0 baseline, 0 regression — cases cannot mechanically pass/fail or guard against drift. Evidence: Eval summary: expected 0, assertions 0, regression 0, baseline 0. Action: Add expected-routing assertions and ≥1 regression case to reach gradeable target of 10 application cases.
- [MEDIUM] audit-state: Audit truth_verdict UNVERIFIED and comprehension/application verdicts null; time-sensitive billing claims (June-1-2026 shift, 1 credit=$0.01) lack truth verification. Evidence: Audit summary: truth_verdict UNVERIFIED, comprehension/application_verdict null. Action: Run truth verification against references/model-facts.md sources before certification.
- [LOW] content-grounding: SKILL.md content asserts specific allowances (Pro ~300, Pro+ ~1500) and model tiers as 2026 facts; hedged with ~ but durability risk if rates change. Evidence: Cost-model table values dated 2026; single reference file cited. Action: Keep volatile figures isolated in references; add as-of date inline to flag staleness.
- [MEDIUM] COVERAGE: High case volume (14) with strong hard-negative and boundary coverage for routing logic. Evidence: Eval summary statistics. Action: Leverage existing cases for testing.
- [HIGH] READINESS: Eval cases lack assertions or expected outputs, preventing automated validation of agent behavior. Evidence: Eval summary 0 assertions. Action: Add validation criteria to JSON files.
- [HIGH] eval_executability: Eval files have 14 cases but 0 expected values or assertions Evidence: 14 cases, 7 hard negatives, 0 expected values, 0 assertions, 0 baseline (eval-readiness surface) Action: Define expected_flags per case; run eval to stamp graded verdicts
- [HIGH] eval_completeness: comprehension_verdict and application_verdict are both null despite eval artifacts existing. The skill has no graded assessment. Evidence: audit-state.json shows comprehension_verdict: null, application_verdict: null, eval_state: unverified. Action: Run evaluate --mode comprehension and evaluate --mode application against existing eval JSONs to produce graded verdicts.
- [MEDIUM] routing_coverage: routing_eval is absent. The skill has not been included in any routing evaluation against a retrieval baseline. Evidence: audit-state.json routing_eval: absent. Action: Include github-copilot in a routing eval run and stamp routing_eval: present when baseline confirms activation.

### gpt-5-5
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/gpt-5-5/SKILL.md
Content score: 86 (B)
Eval readiness score: 51 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] content-grounding: SKILL.md mixes 'GPT-5' and 'GPT-5.5' across headers, decision table, and body, blurring which generation the routing facts describe. Evidence: Section 'When to route to GPT-5' and prose 'lands on GPT-5' vs gpt-5-5 name/tables. Action: Normalize all references to GPT-5.5 (content surface).
- [INFO] Decision logic: Task axis mapping provides precise, grounded heuristics for model selection. Evidence: Table in SKILL.md differentiates infrastructure, architecture, and tool use. Action: Maintain high-quality heuristics while expanding grounding data.
- [MEDIUM] content: Inconsistent model naming: body uses 'GPT-5' in section headers and table entries while frontmatter and description say 'GPT-5.5' — a single skill should use one canonical name. Evidence: Section 'When to route to GPT-5' and table rows say 'GPT-5.5' but 'GPT-5' alternates throughout the body. Action: Standardize to 'GPT-5.5' everywhere in the SKILL.md body.
- [MEDIUM] content: relations.suppresses uses deprecated {skill, reason} object format instead of the current flat array format with inline reason text. Evidence: Frontmatter lines 130-133 show `skill: codex` / `reason: ...` nested objects. Action: Migrate suppresses to flat format: `- codex — I own routing the task to the GPT MODEL vs Claude; codex owns running GPT through its CLI harness`.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/gpt-5-5/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: 14 cases carry 0 expected outputs and 0 assertions, so no case is gradeable; positive prompts have no pass criteria. Evidence: Eval summary: expected 0, assertions 0, baseline 0 across application/comprehension.json. Action: Add expected route + assertion per prompt; add a regression case.
- [MEDIUM] provenance: Truth verdict UNVERIFIED and routing eval absent; specific benchmark/pricing numbers are load-bearing for routing yet unconfirmed against sources. Evidence: Audit: truth_verdict UNVERIFIED, routing_eval absent, comprehension/application null. Action: Verify model-facts.md numbers; run routing eval to set verdicts.
- [HIGH] Eval design: Evaluation cases lack expected outputs and assertions, making them non-executable. Evidence: Eval summary reports 0 expected and 0 assertions across 14 cases. Action: Populate expected results and assertions in eval files.
- [MEDIUM] Audit readiness: Lack of dedicated routing_eval prevents certification as a reliable selector. Evidence: Audit summary explicitly marks routing_eval as absent. Action: Create routing-specific eval cases to verify selection accuracy.
- [HIGH] eval_readiness: eval_state is 'unverified' with null comprehension_verdict and application_verdict despite 14 eval cases existing — the evals have never been run or graded. Evidence: Audit summary: comprehension_verdict null, application_verdict null, eval_state unverified. Action: Run comprehension and application evals to stamp verdicts and move eval_state to passing/monitored.

Blockers:
- deepseek-flash: exit 0

### opencode-free-models
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/opencode-free-models/SKILL.md
Content score: 86 (B)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] boundary/scope: Content is well-scoped: description activates precisely, anti-examples and Do-NOT table cleanly separate opencode/autonomous-loop/github-copilot, and the hard quality-judging boundary is unambiguous. Evidence: description, anti_examples, suppresses reasons, and 'Do NOT Use When' table all name differing mechanisms. Action: No content change needed; preserve boundary framing on edits.
- [LOW] Content: Superior clarity with sharp heuristics for model routing and non-negotiable quality boundaries. Evidence: SKILL.md features a comprehensive routing table and quality-creation exclusion rules. Action: None; content is ready for stabilization.
- [MEDIUM] content: Template instructional comments left in frontmatter Evidence: 8+ lines starting with # retain template teaching guidance text Action: Strip all template teaching comments from frontmatter before commit
- [LOW] content: Reference file cited without formal grounding declaration in frontmatter Evidence: Line 223 references references/model-facts.md but no grounding field is declared Action: Add grounding truth_sources entry for referenced file or mark as informational citation
- [MEDIUM] content-grounding: Model capability table is a 2026 snapshot without truth_source hash or last_verified timestamp. Evidence: references/model-facts.md exists but audit-state.json has truth_verdict: UNVERIFIED. Action: Verify model facts against live roster and record drift baseline.
- [LOW] content-structure: Coverage section uses bullet list without a decision-procedure format; the routing table is stronger but could be referenced as the canonical procedure. Evidence: Coverage section at line 157-164 lists bullets; routing table at line 174 is the real procedure. Action: Tighten Coverage to point at the routing table as the canonical decision procedure.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/opencode-free-models/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: All 14 eval cases carry 0 expected outputs and 0 assertions, so neither comprehension nor application can be auto-scored or certified. Evidence: Eval summary: expected 0, assertions 0, regression 0; verdicts null. Action: Add expected answers/assertions per case; target ≥10 scorable cases incl. routing eval.
- [MEDIUM] grounding: Capability/routing tables assert dated model facts (MiniMax 1M ctx, GLM-5, Nemotron) but the truth source is unverified, risking confident-but-stale routing guidance. Evidence: Audit truth_verdict UNVERIFIED; routing_eval absent; references/model-facts.md dated 2026-06-08. Action: Verify model-facts.md against live roster and flip truth_verdict before certification.
- [INFO] Eval Design: Robust case volume with high ratio of hard-negatives (42%) ensures deep model discrimination. Evidence: Eval summary reports 14 cases, including 6 hard-negatives and 3 boundary cases. Action: Maintain high-density negative testing in future updates.
- [HIGH] Eval Readiness: Structural incompleteness due to total lack of assertions or expected results in JSON artifacts. Evidence: Eval summary shows 0 assertions and 0 expected values across both artifacts. Action: Add expected routing outcomes and assertions for all cases.
- [MEDIUM] eval: Application eval lacks expected-output assertions required for scoring Evidence: 0 expected, 0 assertions, 0 baseline across all 14 eval cases Action: Add expected_flags, fix_hints, and absent_signals to each application case
- [HIGH] eval-design: 14 cases present but eval_state unverified, no assertions or baseline recorded. Evidence: eval_state: unverified, assertions: 0, baseline: 0 in eval summary. Action: Run comprehension and application evals, record baseline and assertions.

### opencode
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/opencode/SKILL.md
Content score: 91 (A)
Eval readiness score: 53 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Verify and correct the canonical repo URL to the real OpenCode org.

Content findings:
- [HIGH] grounding/truth-source: SKILL.md cites the source repo as github.com/anomalyco/opencode, but OpenCode is published under sst/opencode; a wrong provenance anchor undermines every 'verify live' instruction. Evidence: References: 'Source repository: https://github.com/anomalyco/opencode' Action: Verify and correct the canonical repo URL to the real OpenCode org.
- [INFO] content clarity: Excellent scope definition with strong harness-vs-engine mental model and clear routing distinctions Evidence: scope, concept_boundary, anti_examples, Do Not Use When table, verification checklist Action: Maintain as template-quality example for runtime-focused skills

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 13 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/opencode/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: 13 cases carry 0 expected outputs and 0 assertions, so no case can be graded pass/fail; comprehension/application correctness is unmeasurable despite exceeding the 10-case target. Evidence: Eval summary: expected 0, assertions 0, baseline 0 across application+comprehension Action: Add expected answers/assertions per case to make evals gradeable.
- [MEDIUM] audit-state: Audit shows truth_verdict UNVERIFIED with comprehension and application verdicts null and eval_state unverified, so the skill is uncertified despite strong authored content. Evidence: Audit: truth UNVERIFIED, comprehension/application null, eval_state unverified Action: Run truth, comprehension, and application audits to certify.
- [MEDIUM] eval certification: 13 eval cases present (5 hard negatives) but comprehension_verdict and application_verdict both null; eval_state unverified Evidence: audit-state.json: comprehension_verdict null, application_verdict null, eval_state unverified Action: Run comprehension and application evals through audit loop to stamp graded verdicts
- [LOW] routing integration: Skill not yet included in routing eval against the retrieval baseline Evidence: routing_eval: absent in audit-state.json Action: Include opencode in the next routing eval sweep
- [HIGH] eval_design: comprehension_verdict and application_verdict are both null despite eval_artifacts: present; eval_state is unverified. The evaluation loop has never been run. Evidence: audit-state.json: comprehension_verdict null, application_verdict null, eval_state: unverified. Action: Run comprehension and application evals to produce graded verdicts with receipts.
- [HIGH] eval_design: Expected assertions and baseline assertions are both 0 across all eval cases, meaning no ground-truth expectations are defined to measure skill effectiveness against. Evidence: Eval summary: expected: 0, assertions: 0, baseline: 0. Action: Populate expected_flags/expected_fix_hints in application cases and baseline assertions in comprehension cases.
- [MEDIUM] grounding: truth_verdict is UNVERIFIED and routing_eval is absent. External doc references (opencode.ai/docs/) and the source repo are cited but not drift-checked against current state. Evidence: audit-state.json: truth_verdict: UNVERIFIED, routing_eval: absent. Action: Record truth_source_hashes and run drift check; include skill in a routing eval.

Blockers:
- gemini-flash: exit 0

### skill-infrastructure
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/skill-infrastructure/SKILL.md
Content score: 83 (B)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=DRIFT. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] description activation: Description is enormous (multi-hundred words), which risks diluting router precision and contradicts the skill's own progressive-disclosure/lean-surface discipline. Evidence: content surface: single description spans full trigger list plus full coverage summary plus four exclusions Action: Tighten to trigger phrases + key exclusions; push coverage detail into body.
- [INFO] content/mental-model: 'Library-as-database' and 'Skill-as-contract' frameworks provide exceptional conceptual framing for maintaining large-scale skill corpora and checker-ownership boundaries. Evidence: mental_model section; 7-category framework Action: Maintain as gold standard for infra-class skills.
- [MEDIUM] progressive_disclosure: 674-line body lacks load-on-demand references/ files; all health detail loaded at activation. Evidence: Body covers 7 categories, checker matrix, eval patterns, workflows; no references/ dir used. Action: Push detailed reference tables and workflow checklists into load-on-demand references/ files.
- [HIGH] metadata-dual-encoding: Frontmatter has native Skill Graph fields AND a metadata block re-encoding the same fields as nested JSON — two sources of truth for subject, scope, grounding, relations. Evidence: Lines 75–167: top-level grounding/relations/subject/scope AND lines 111–162: metadata block duplicates them as JSON strings. Action: Remove the metadata JSON re-encoding; keep native Skill Graph frontmatter only.
- [MEDIUM] content-length-token-budget: Body at 674 lines violates the token-budget progressive-disclosure principle the skill itself prescribes; heavy detail belongs in load-on-demand references/. Evidence: Skill states 'always-loaded body lean; push heavy detail into load-on-demand references/' (line 691 anti-pattern) yet the body is 674 lines. Action: Split advanced sections (imperative extraction regex patterns, advanced overlap detectors, activation-level rubric) into references/.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 13 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/skill-infrastructure/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval readiness: Routing eval absent and eval_state unverified, with zero regression cases, even though the skill centers routing/retrieval health and append-only eval discipline. Evidence: eval surface: routing_eval=absent, eval_state=unverified, regression=0, comprehension/application UNVERIFIED Action: Add/run routing eval (examples/anti_examples) and verify application evals to set eval_state.
- [MEDIUM] provenance/audit-state: Audit truth_verdict is DRIFT and provenance label skill_graph_protocol says v5 while content asserts Protocol v8, signaling stale truth-source or label drift. Evidence: audit surface: truth_verdict=DRIFT; frontmatter skill_graph_protocol: 'Skill Metadata Protocol v5' Action: Re-hash truth sources and reconcile protocol label before claiming graded verdicts.
- [HIGH] eval-readiness/assertions: Evaluation scaffolding is structurally hollow; 13 cases exist but 0 assertions prevent automated pass/fail verification for CI gates. Evidence: Eval summary: assertions: 0 Action: Add machine-gradable assertions to all 13 eval cases.
- [MEDIUM] audit/truth-integrity: Audit state is in DRIFT with unverified behavior, indicating cited grounding sources have changed since the last audit. Evidence: Audit summary: truth_verdict: DRIFT Action: Rerun truth grader and record hashes to resolve DRIFT.
- [HIGH] grounding/truth_verdict: Truth source drift since baseline recording — skill claims anchor to code that may no longer match. Evidence: truth_verdict: DRIFT in audit-state.json; 20+ truth_sources declared. Action: Re-record drift hashes against current sources or fix skill content to match.
- [HIGH] eval_readiness: Eval artifacts present but comprehension/application verdicts UNVERIFIED; 0 assertions across 13 cases; routing_eval absent. Evidence: comprehension_verdict & application_verdict both UNVERIFIED; routing_eval: absent. Action: Run evaluate --mode comprehension; add assertions to eval cases; include in routing eval baseline.
- [LOW] eval-coverage-gap: eval_state is unverified and truth_verdict is DRIFT despite eval_artifacts marked present and 13 cases — no regression cases exist for the maintenance workflow claims. Evidence: Audit summary: eval_state=unverified, truth_verdict=DRIFT, regression=0 across 13 cases. Action: Run comprehension eval, resolve DRIFT in truth sources, and add at least 2 regression cases covering maintenance workflow sequences.

### skill-router
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/skill-router/SKILL.md
Content score: 89 (B)
Eval readiness score: 64 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 16 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/skill-router/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- public:false; external reviewer panel skipped for privacy/publication boundary
- opus: public:false; external dispatch skipped
- gemini-flash: public:false; external dispatch skipped
- deepseek-flash: public:false; external dispatch skipped
- mimo: public:false; external dispatch skipped

### skill-scaffold
Path: /Users/jacobbalslev/Development/skills/skills/agent-ops/skill-scaffold/SKILL.md
Content score: 91 (A)
Eval readiness score: 16 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Ensure lint tools enforce this convention.

Content findings:
- [INFO] content/boundary-clarity: description and body cleanly separate routing contract from scope map, with explicit Do-NOT-use clauses and a dedicated semantic-layer section preventing over-activation. Evidence: description names 3 negative boundaries; § Semantic-Layer Discipline + Do NOT Use When table. Action: None; preserve as a model exemplar.
- [INFO] content: Exceptional boundary definition and routing contract clarity. Evidence: Description includes explicit negative boundaries; concept_boundary is distinct. Action: Maintain as gold-standard reference.
- [INFO] content: Precise teaching of the comment lifecycle discipline. Evidence: Authoring Flow Step 6 defines non-negotiable verification for scaffolding. Action: Ensure lint tools enforce this convention.
- [MEDIUM] content: Description over-enumerates topics like a Coverage scope map Evidence: 78-word 3-sentence description carrying 7+ topic enumerations Action: Tighten to 2 punchy routing sentences; relegate enumeration to ## Coverage
- [MEDIUM] content: Examples exceed recommended 2-5 range at 8 entries Evidence: 8 examples listed potentially diluting router activation precision Action: Trim examples to 5 strongest distinct triggers per protocol guidance
- [HIGH] truth verification: All truth sources are external URLs (skill-graph repo, schema, protocol docs) but truth_verdict is UNVERIFIED and no hashes recorded. Evidence: audit-state.json shows truth_verdict: UNVERIFIED; grounding.truth_sources lists 4 URLs with no local hash anchoring. Action: Run skill-graph-drift.js --record --apply to anchor truth-source hashes before claiming verification.
- [MEDIUM] description activation: Description is thorough but exceeds 3-sentence routing target; frontmatter duplicates body ## Coverage list almost verbatim. Evidence: Description is 7 lines covering authoring, classification, semantic discipline, teaching mechanics, gates, and routing-eval — all also listed in ## Coverage. Action: Tighten description to ≤3 sentences as routing contract; let ## Coverage carry the enumerated scope map.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/agent-ops/skill-scaffold/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness/case-coverage: No eval file exists (0 cases vs target 10); zero baseline, hard-negative, boundary, or regression prompts despite rich examples/anti_examples available to seed them. Evidence: Eval summary: files [], cases 0; eval_artifacts 'planned'. Action: Author ≥10 cases reusing the 8 examples + 5 anti_examples as boundary/hard-neg seeds.
- [MEDIUM] eval-readiness/audit-state: Audit state present but truth, comprehension, and application verdicts all UNVERIFIED and routing_eval absent, so usefulness and activation are unproven. Evidence: Audit summary: truth/comprehension/application UNVERIFIED; routing_eval absent. Action: Run routing-eval --only-asserted and gate-9 application check; record verdicts.
- [HIGH] eval-readiness: Complete lack of verification cases despite rich prompt examples. Evidence: Eval summary shows 0 cases; status is unverified. Action: Create and populate eval artifacts.
- [HIGH] eval_readiness: No eval artifacts exist despite planned intent Evidence: 0 eval files, 0 cases, 0 prompts, 0 assertions Action: Author comprehension.json (≥5 cases) and application.json (≥5 cases with 1 red-herring)
- [HIGH] eval design: Zero eval cases exist despite eval_artifacts: planned; no comprehension.json or application.json files on disk. Evidence: Eval summary shows cases: 0, files: [], no prompts or assertions defined. Action: Author evals/comprehension.json with 5+ cases covering authoring flow, semantic-layer discipline, and common mistakes.

### agent-eval-design
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/agent-eval-design/SKILL.md
Content score: 91 (A)
Eval readiness score: 63 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Trim body restatements; let body focus on procedure and matrices.

Content findings:
- [LOW] content/redundancy: SKILL.md content judged: body Concept section duplicates frontmatter mental_model, purpose, boundary, analogy, misconception nearly verbatim, adding length without new instructional value. Evidence: Body 'Concept of the skill' mirrors metadata mental_model/purpose/concept_boundary fields. Action: Trim body restatements; let body focus on procedure and matrices.
- [INFO] Clarity: Exceptional primitive mapping and grader matrices provide high-signal instructional guidance. Evidence: Primitive/Grader tables in SKILL.md. Action: Maintain current depth.
- [LOW] verification operationalization: Verification checklist does not reference skill's own primitives (grader types, threshold risk, regression loop) Evidence: 7 generic checklist items; adjacent 7-row primitives table and 9-step method are not cross-referenced Action: Tie each checklist item to a specific primitive or method step from the body
- [LOW] content: Grounding field is JSON-encoded string inside YAML frontmatter — correct per flat-encoding, but the 6 source URLs are not individually anchored to specific skill claims. Evidence: metadata.grounding contains platform.openai.com, anthropic.com, google.github.io URLs; body does not cite which source grounds which section. Action: Add inline citations mapping each method/primitive to its grounding source to strengthen truth traceability.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is MIXED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/agent-eval-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness/graders: Eval artifacts judged: 15 cases with 0 expected outputs and 0 assertions means no case can be auto-graded; suite cannot pass/fail anything despite strong hard-negative breadth. Evidence: Eval summary: cases 15, expected 0, assertions 0, baseline 0. Action: Add expected outcomes and grader assertions per case, especially routing label checks.
- [MEDIUM] eval-readiness/audit-state: Audit state judged: application_verdict MIXED, eval_state unverified, truth and comprehension UNVERIFIED; the suite has never been run green, so certification evidence is absent. Evidence: Audit summary: application MIXED, eval_state unverified, truth/comprehension UNVERIFIED. Action: Run the suite to establish a baseline and resolve MIXED application verdict.
- [INFO] Eval Design: Heavy weighting on hard negatives (13/15) perfectly aligns with the skill philosophy. Evidence: Eval summary statistics. Action: None.
- [MEDIUM] Eval Readiness: Zero recorded assertions or expected values prevent automated pass/fail verification of the skill. Evidence: Eval summary: expected: 0, assertions: 0. Action: Add assertions/expected fields to JSON.
- [MEDIUM] boundary completeness: Do NOT Use When table omits evaluation and eval-driven-development, the primary suppression targets Evidence: Suppression of 4 skills; table covers only testing-strategy, skill-infrastructure, debugging, code-review Action: Add evaluation (artifact scoring) and eval-driven-development (iterative gating) rows
- [MEDIUM] behavioral certification: application_verdict MIXED despite 15 well-designed cases — eval does not certify skill as useful Evidence: audit summary: application_verdict MIXED, eval_state unverified; skill's own method not applied to its eval Action: Apply skill's regression-loop, grader-calibration, and threshold-risk method to reach APPLICABLE
- [HIGH] eval_readiness: Eval summary reports 0 expected and 0 assertions despite 15 cases — either the counts are wrong or the cases lack declarative expected outcomes. Evidence: Static facts: expected=0, assertions=0. Eval files exist with 15 cases and 13 hard negatives. Action: Verify case structure — each case should declare expected_flags or expected_fix_hints per application eval spec.
- [MEDIUM] eval_readiness: Audit state shows application_verdict: MIXED with comprehension_verdict: UNVERIFIED and eval_state: unverified — no graded evidence backs the skill. Evidence: audit-state.json: structural PASS, truth UNVERIFIED, comprehension UNVERIFIED, application MIXED. Action: Run comprehension and application evals with a frontier grader to produce graded receipts before claiming certification.

### eval-driven-development
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/eval-driven-development/SKILL.md
Content score: 97 (A)
Eval readiness score: 58 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Keep negatives but front-load the highest-signal trigger phrases.

Content findings:
- [LOW] description-activation: The description is one ~250-word sentence packing every sub-topic; activation contract is comprehensive but dense, risking diluted router matching against shorter queries. Evidence: SKILL.md description is a single multi-clause sentence spanning all primitives Action: Keep negatives but front-load the highest-signal trigger phrases.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 5 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/eval-driven-development/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 5 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/eval-driven-development/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval suite holds 5 cases against the target of 10, with 0 assertions and 0 baseline, so it cannot certify the statistical claims the skill itself teaches. Evidence: eval summary: cases 5, assertions 0, baseline 0, target 10 Action: Author 5+ more cases with assertions and a baseline before certification.
- [MEDIUM] audit-state: Comprehension and application verdicts are UNVERIFIED and routing_eval is absent, leaving the skill's usefulness grader-unconfirmed despite strong static content. Evidence: audit summary: comprehension/application UNVERIFIED, routing_eval absent Action: Run comprehension + application graders and add a routing eval.
- [HIGH] eval_readiness: Only 5 cases present in comprehension.json, failing the target of 10 for certification. Evidence: static_eval_summary.cases = 5 Action: Author 5 additional high-signal cases to reach protocol threshold.
- [MEDIUM] eval_readiness: Eval summary shows zero assertions, reducing automated verification rigor for a skill about evaluation. Evidence: static_eval_summary.assertions = 0 Action: Add programmatic or model-graded assertions to the test suite.
- [INFO] content: Grounding is exceptional, including 2026-dated research on eval-awareness and structural benchmark decay. Evidence: grounding.truth_sources includes 2026 citations Action: Maintain this high standard of freshness in future updates.
- [MEDIUM] eval_readiness: Eval case count (5) at absolute minimum floor for a 621-line skill spanning 5 primitives, 6 eval surfaces, 7 lifecycle archetypes, statistics, and contamination. Evidence: 5 comprehension cases for a 682-line content surface. Static eval readiness pre-score: 65 confirms the gap. Action: Expand to 7–8+ cases covering cost budgets, offline-vs-telemetry, trajectory eval, and Goodhart defenses.
- [MEDIUM] eval_readiness: No application.json exists. Behavioral change from loading this skill cannot be measured, and application_verdict (the certifying quality signal) stays UNVERIFIED. Evidence: Only comprehension.json present. application_verdict: UNVERIFIED per audit summary. Action: Author application.json with 5+ cases comparing with-skill vs baseline behavior, including at least one red-herring.
- [LOW] eval_readiness: eval_state: unverified despite eval_artifacts: present. Comprehension cases exist but have never been run to produce a verdict. Evidence: comprehension_verdict: UNVERIFIED. No eval_last_run or grader receipt evidence. Action: Run the comprehension eval; exercise the suite to produce at least a PROVISIONAL verdict and calibrate on failing cases.
- [HIGH] eval-design: Application eval entirely missing despite skill's own emphasis on behavior-change measurement as the primary quality signal. Evidence: Audit summary shows application_verdict: UNVERIFIED; no application.json file listed. Action: Author application.json with 7 cases including hard negatives and red herrings.
- [HIGH] eval-design: Comprehension eval has only 5 cases at the hard floor with zero assertions, baselines, or scoring criteria — well below the 7-8 case practitioner default. Evidence: Eval summary: cases=5, assertions=0, baseline=0. Action: Add 2-3 more cases targeting misconception and analogy dimensions; add assertions/baselines.
- [MEDIUM] eval-readiness: eval_state remains unverified with no eval_last_run receipt, despite eval_artifacts: present. Evidence: Audit summary: eval_state: unverified, no comprehension or application eval run recorded. Action: Run comprehension eval and record eval_last_run receipt to advance toward passing.

### evaluation
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/evaluation/SKILL.md
Content score: 95 (A)
Eval readiness score: 71 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Ensure these caps are promoted in similar meta-engineering skills.

Content findings:
- [INFO] content-quality: SKILL.md content is exemplary: explicit description activation, score ceilings, finding format, dual boundary tables, and grounded source notes. Evidence: Score ceilings table, anti_examples, Do-NOT-Use and Boundary Decisions tables Action: None; preserve current structure.
- [INFO] instruction: Mechanical score ceilings effectively neutralize agent over-optimism by enforcing hard caps based on objective evidence gaps. Evidence: Score Ceilings table in SKILL.md. Action: Ensure these caps are promoted in similar meta-engineering skills.
- [MEDIUM] content: Frontmatter contains authoring template instructions as YAML comments alongside operational metadata Evidence: Lines 63,67,70-71,77-78: '# name: stable kebab-case...' etc — ~40 comment lines Action: Strip template teaching comments from published SKILL.md frontmatter
- [MEDIUM] Frontmatter structure: relations appears twice: once as a JSON string under metadata and again as a raw YAML mapping at the bottom, creating dual encoding ambiguity. Evidence: metadata.relations is a JSON string (line 138); a second relations: block exists at line 182 with equivalent content. Action: Remove the duplicate raw relations block at the bottom to keep a single source of truth.
- [LOW] Field encoding: keywords, triggers, examples, anti_examples are JSON strings inside YAML instead of native YAML arrays, reducing readability. Evidence: keywords: "[\"evaluation\",\"quality gate\",...]" (line 120) and similar for other array fields. Action: Convert to native YAML list syntax for consistency with v8 flat-field authoring conventions.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 10 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/evaluation/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness: Comprehension suite holds 10 cases but only 1 hard-negative and 1 boundary case, under-covering the six declared confusable siblings (agent-eval-design, code-review, etc.). Evidence: Eval summary: hardNeg 1, boundary 1 across 10 cases Action: Add hard-negatives per suppressed/boundary sibling to test routing discrimination.
- [HIGH] audit-state: Audit shows truth, comprehension, and application all UNVERIFIED and eval_state unverified; no run confirms the skill is useful or correctly routed. Evidence: audit-state: truth/comprehension/application UNVERIFIED, routing_eval absent Action: Run comprehension+application graders and a routing eval to certify.
- [INFO] routing: The skill provides a masterclass in boundary definition, clearly separating artifact evaluation from adjacent systemic design tasks. Evidence: Boundary Decisions table and Do NOT Use When section. Action: No content changes required; boundaries are definitive.
- [MEDIUM] evaluation: While 10 eval cases are provided, they lack the assertions or baseline scores required for automated verification. Evidence: Eval summary reports 0 assertions and 0 baseline. Action: Add expected scores or assertions to evals/comprehension.json.
- [HIGH] eval design: Comprehension evals have 10 cases but 0 assertions, no programmatic scoring possible Evidence: Eval summary shows assertions:0, baseline:0 across all 10 cases Action: Add at least 1 assertion per case for automated verification
- [HIGH] eval readiness: No application eval exists and routing_eval is absent, blocking usefulness certification Evidence: application_verdict:UNVERIFIED, routing_eval:absent in audit summary Action: Author evals/application.json with ≥5 cases including red herrings
- [MEDIUM] Eval design: Comprehension eval has 10 cases but only 1 hard negative and 1 boundary case, leaving anti-pattern and misconception dimensions under-sampled. Evidence: hardNeg: 1, boundary: 1 out of 10 total cases per review-bundle.md eval summary. Action: Add 2-3 hard negative cases targeting score inflation and false completion claims to balance coverage.

### guardrails
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/guardrails/SKILL.md
Content score: 79 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [INFO] content/boundary: SKILL.md content is well-scoped: layered guardrail model, enforcement tiers, explicit 'Do NOT Use When' table routing to code-review/version-control/database-migration. Evidence: Do NOT Use When + Coverage + scope all align with description Action: None; boundary and reusable procedure are publication-quality.
- [MEDIUM] content/grounding-provenance: Provenance label drifts from schema: skill_graph_protocol says v6 while schema_version is 8, and canonical_skill points to quality-assurance/ but subject is ai-engineering. Evidence: skill_graph_protocol: 'v6'; canonical_skill quality-assurance/guardrails vs subject ai-engineering Action: Reconcile export provenance labels and canonical path with current subject/schema.
- [INFO] instructional-design: Layered circuit breaker model provides exceptional phase-based safety logic for agent workflows. Evidence: SKILL.md Guardrail Model table Action: Adopt this phase-based structure as the template for all operations-focused skills.
- [LOW] grounding: Comprehensive grounding in NIST and OWASP standards ensures high-fidelity policy alignment. Evidence: Metadata grounding section cites five authoritative safety sources. Action: Ensure referenced NIST AI RMF links are verified for accessibility.
- [HIGH] scope: scope field duplicates description verbatim; should be a distinct PRD-style teaching mandate Evidence: Lines 63 and 85: identical ~450-char string Action: Rewrite scope as concise what-it-teaches statement distinct from routing description
- [HIGH] provenance accuracy: skill_graph_protocol claims v6 but frontmatter uses v8 fields; canonical_skill path points to wrong subject Evidence: Line 140: 'v6'; Line 142: quality-assurance/guardrails but skill is ai-engineering/guardrails Action: Update skill_graph_protocol to v8 and fix canonical_skill path to ai-engineering/guardrails
- [HIGH] metadata-truth: skill_graph_protocol labels v6; skill_graph_canonical_skill points to quality-assurance instead of ai-engineering. Stale export provenance. Evidence: Lines 140, 142 in SKILL.md frontmatter. Action: Update to v8 and correct canonical path to skills/ai-engineering/guardrails/SKILL.md.
- [MEDIUM] content-clarity: Agentic Threats table is generic OWASP-style — no concrete guardrail patterns, code examples, or decision trees for prompt injection, excessive agency, or insecure tool design. Evidence: Lines 245-254. The table restates risks without teaching the reader what to do differently. Action: Add one concrete mitigation pattern per row (e.g. input sanitization for prompt injection, tool-call allowlist for excessive agency).

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/guardrails/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface is empty: zero cases, prompts, assertions, baselines, or hard negatives; eval_artifacts 'planned' and eval_state 'unverified' against a target of 10 cases. Evidence: Eval summary cases:0, files:[], audit eval_state unverified Action: Author ~10 cases incl. boundary and hard-negative prompts; run to passing.
- [HIGH] eval-readiness: Skill is functionally unverified with zero test cases implemented despite 'planned' status. Evidence: Static eval summary shows 0 cases and 0 assertions. Action: Author 10+ cases covering git mutations, secret detection, and SQL safety.
- [HIGH] eval readiness: No comprehension or application eval cases exist despite planned eval_artifacts Evidence: 0 files, 0 cases, 0 assertions in eval summary Action: Author 7+ comprehension cases and 5+ application cases before certification
- [HIGH] eval-readiness: Zero eval artifacts exist — comprehension.json and application.json both absent. No cases, prompts, or expected assertions. eval_artifacts remains 'planned'. Evidence: Eval summary: files=[], cases=0, prompts=0. Audit summary: comprehension_verdict=UNVERIFIED, application_verdict=UNVERIFIED. Action: Author comprehension.json with 7 scenarios and application.json with 6 cases including red-herring hard negatives.

### intent-recognition
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/intent-recognition/SKILL.md
Content score: 82 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/structure: SKILL.md is rigorous: four-tier taxonomy, operation-vs-target rule, Identify/Confirm/Verify, broad trigger contract, anti-patterns, and explicit Do-NOT-Use routing all present. Evidence: Sections 1-5 + Do NOT Use When table with named alternatives. Action: None; preserve as model exemplar.
- [INFO] Content: Sophisticated 4-tier taxonomy and target-elevation rules provide a robust cognitive model for agent safety. Evidence: SKILL.md Sections 1-3 Action: Maintain this high-quality instructional depth.
- [HIGH] Frontmatter consistency: Duplicated relations: JSON string in metadata.relations AND YAML block in top-level relations Evidence: Lines 128 and 155-157. Nested metadata copy is stale after v8 flat migration. Action: Remove metadata.relations dead copy; keep only top-level YAML relations block
- [MEDIUM] Frontmatter verbosity: ~50% of frontmatter lines are instructional teaching comments, not skill data Evidence: Lines 62-153: per-field prose comments inflate token footprint without adding value Action: Strip inline teaching comments; retain minimal identifying comments only
- [MEDIUM] content-duplication: relations block duplicated — once as JSON string under metadata (line 128) and again as proper YAML (lines 155-157), with slightly different target lists. Evidence: metadata JSON includes code-review, testing-strategy in related; YAML verify_with adds guardrails not in metadata JSON. Action: Remove the JSON-string relations under metadata; keep only the canonical YAML relations block.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/intent-recognition/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Zero eval cases against a target of 10; no prompts, expected outputs, baseline, hard-negative, or boundary cases exist, so activation and tier-classification accuracy are unverified. Evidence: Eval summary: files [], cases 0; eval_artifacts 'planned'. Action: Author 10 cases incl. boundary (.env read), hard-negatives (anti_examples), tier-edge cases.
- [MEDIUM] provenance/audit-state: Comprehension and application verdicts are UNVERIFIED, so usefulness is grader-unconfirmed; provenance label 'Metadata Protocol v5' contradicts v8 schema in use. Evidence: audit-state comprehension/application UNVERIFIED; skill_graph_protocol: v5. Action: Run gate-8/9 graded eval; refresh export provenance label to v8.
- [HIGH] Evaluation: Skill is functionally unverified; 'planned' status has not resulted in any actual test cases or assertions. Evidence: Static eval summary: 0 cases Action: Author 10+ cases in eval.json.
- [MEDIUM] Metadata: Stability is capped at experimental and routing is absent, preventing production-grade certification of this critical skill. Evidence: Metadata stability/routing fields Action: Promote status after successful eval run.
- [INFO] Eval readiness: No eval cases exist despite eval_artifacts: planned — skill has 0 evals Evidence: Eval summary: 0 files, 0 cases, 0 prompts. comprehension/application: UNVERIFIED. Action: Author ≥5 comprehension cases and ≥5 application cases with hard negatives
- [HIGH] eval-artifacts: Zero eval cases exist — no comprehension.json or application.json despite eval_artifacts: planned and eval_state: unverified. Evidence: Eval summary shows 0 cases, 0 prompts, 0 assertions; audit-state.json has comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED. Action: Author at least 5 comprehension scenarios and 5 application cases including red-herring trigger scenarios.
- [MEDIUM] metadata-completeness: Critical metadata fields commented out or missing: schema_version, version, freshness, owner, drift_check not populated; eval_artifacts/eval_state absent from sidecar. Evidence: Frontmatter lines 73-97 show commented-out fields with no values; audit-state.json eval_artifacts: planned, eval_state: unverified. Action: Populate schema_version: 8, version, owner, freshness, drift_check in frontmatter; sync audit-state.json eval fields.

### project-knowledge-extraction
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/project-knowledge-extraction/SKILL.md
Content score: 86 (B)
Eval readiness score: 62 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [LOW] grounding/provenance: Content surface: frontmatter declares skill_graph_protocol 'v5' while metadata comments and scope follow v8 schema, creating a provenance/version-label inconsistency for truth-source readers. Evidence: skill_graph_protocol: Skill Metadata Protocol v5 vs v8 fields Action: Reconcile protocol label with the v8 schema actually used.
- [INFO] Scope/Boundary: Superior boundary definition prevents overlap with documentation and scaffolding tasks by focusing on mechanisms. Evidence: Do NOT Use When table and concept_boundary explicitly name alternative mechanisms. Action: Maintain this standard for complex routing skills.
- [INFO] Method/Grounding: Method effectively balances evidence gathering with artifact routing and drift management logic. Evidence: Step 5 (grounding) and Step 7 (future-task utility) provide high-signal guidance. Action: Standardize drift triggers for all volatile fact types.
- [MEDIUM] Description signal mixing: Description embeds activation signals and boundary redirects; per protocol it should be a short topical about-statement only Evidence: ~50-word description includes 'Do NOT' and redirects to 3 other skills Action: Trim description to pure about-statement; move signals to keywords/anti_examples
- [LOW] Anti-example boundary blur: Anti-example about repo-fact extraction implies the skill does not own it, but extracting facts from repos is this skill's core domain Evidence: Third anti_example: 'write a reusable prompt template for extracting facts from repos' Action: Remove or rephrase to avoid misrepresenting the skill's scope
- [MEDIUM] content: Skill graph protocol version claim outdated (v5 vs current v8) Evidence: SKILL.md line 123: skill_graph_protocol: Skill Metadata Protocol v5 Action: Update protocol version to match current v8 standard

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/project-knowledge-extraction/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness/certification: Eval surface: comprehension and application verdicts are UNVERIFIED and eval_state is unverified, so the skill is not certified despite present artifacts. Evidence: audit: comprehension/application UNVERIFIED; eval_state unverified Action: Run comprehension+application evals to flip verdicts before certifying.
- [MEDIUM] eval-design/graders: Eval surface: 15 cases carry 0 assertions, so expected outcomes are not machine-checkable; grading depends on human judgment, weakening regression coverage (0 regression cases). Evidence: eval summary: assertions 0, regression 0 Action: Add assertions/graders per case and a regression case set.
- [MEDIUM] Eval Design: Strong case diversity including boundaries, but lacks assertions for automated grading and verification. Evidence: Eval summary shows 15 cases but 0 assertions. Action: Add deterministic assertions to application.json to support automated verification.
- [HIGH] Eval certification gap: Both eval artifacts exist (15 cases, strong coverage) but comprehension_verdict and application_verdict are UNVERIFIED Evidence: eval_state: unverified; both verdicts UNVERIFIED despite present artifacts Action: Run evaluate --mode comprehension and --mode application against both eval files
- [HIGH] eval_readiness: Eval state marked unverified with no evidence of actual evaluation runs Evidence: audit-state.json shows eval_state: unverified, comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED Action: Run evaluations and provide evidence of passing results
- [MEDIUM] eval_readiness: Missing key eval elements: no assertions, baseline, or regression cases Evidence: Eval summary shows assertions: 0, baseline: 0, regression: 0 Action: Add assertion cases, establish baseline metrics, and include regression test cases

### prompt-craft
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/prompt-craft/SKILL.md
Content score: 94 (A)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Correct canonical_skill path to skills/ai-engineering/prompt-craft/SKILL.md.

Content findings:
- [INFO] Content: Instructional content provides precise guidance on authority framing, delimiter usage, and provider-specific nuances. Evidence: Sections on Hierarchy, Anatomy, and Provider Checks. Action: None required for content.
- [INFO] Content structure: Exceptional scope clarity with explicit exclusions, grounding from 4 authoritative sources, and comprehensive procedure coverage Evidence: 336 lines, prompt anatomy table, iterative loop, provider checks, boundary table Action: Maintain as exemplar for prompt-craft domain
- [LOW] content: skill_graph_canonical_skill path references agent-ops but subject is ai-engineering; the skill lives under ai-engineering/ in the actual corpus. Evidence: metadata line: skill_graph_canonical_skill: skills/agent-ops/prompt-craft/SKILL.md Action: Correct canonical_skill path to skills/ai-engineering/prompt-craft/SKILL.md.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 5 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/prompt-craft/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 5 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/prompt-craft/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [INFO] content/boundary: Description and Do-NOT-Use table draw crisp mechanism-based boundaries against context-engineering, agent-eval-design, guardrails, and debugging with positive ownership statements. Evidence: SKILL.md description + 'Do NOT Use When' table name 8 sibling skills by mechanism. Action: None; retain as a model boundary pattern.
- [MEDIUM] eval-readiness: Only 5 eval cases against a target of 10, with 0 regression, 0 baseline, and 0 assertions, limiting discrimination of boundary vs hard-negative routing. Evidence: Eval summary: cases 5, hardNeg 1, boundary 2, regression 0, assertions 0. Action: Author 5 more cases adding regression/baseline and explicit assertions.
- [MEDIUM] audit-state: Eval artifacts present but truth, comprehension, and application verdicts all UNVERIFIED and routing_eval absent, so usefulness is not grader-confirmed. Evidence: Audit summary: truth/comprehension/application UNVERIFIED; routing_eval absent. Action: Run application + routing eval to move toward APPLICABLE certification.
- [HIGH] Eval Readiness: The comprehension eval artifact lacks assertions, making automated pass/fail determination impossible. Evidence: Eval summary reports 0 assertions in comprehension.json. Action: Implement assertions for all cases.
- [MEDIUM] Eval Readiness: Case count of five falls short of the ten-case benchmark for production-ready certification. Evidence: Eval summary reports 5 cases. Action: Expand dataset to 10 cases.
- [MEDIUM] Eval coverage: Only 5 comprehension cases (below 10-case target) with no application.json for gate-9 certification Evidence: comprehension.json: 5 cases, 0 assertions, 0 baseline; application_verdict: UNVERIFIED Action: Add 3-5 more comprehension cases and author application.json with hard negatives
- [MEDIUM] Eval verification: All three graded verdicts are UNVERIFIED; eval_state is unverified with no eval_last_run receipt Evidence: comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED, eval_state: unverified, routing_eval: absent Action: Run gate-8 comprehension eval and gate-9 application eval to certify
- [HIGH] eval_readiness: Only 5 comprehension cases at the floor; no application eval exists despite eval_artifacts: present claiming otherwise. Evidence: audit-state.json eval_artifacts: present but only comprehension.json found. Action: Create application.json with ≥5 cases including red-herring cases.
- [MEDIUM] eval_readiness: Comprehension eval assertions: 0 and baseline: 0; no negative expectations or cross-skill routing refusal cases verified. Evidence: Eval summary shows assertions: 0, baseline: 0. Action: Add negative expectations per case and at least one routing-refusal case.

### prompt-injection-defense
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/prompt-injection-defense/SKILL.md
Content score: 94 (A)
Eval readiness score: 56 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Consider whether routing precision justifies full length or can be tightened

Content findings:
- [LOW] content: Technical framing of 'data-vs-directive collapse' replaces the ineffective 'smarter fence' mindset with robust architectural containment. Evidence: SKILL.md Philosophy and Purpose sections Action: Maintain this conceptual depth in sibling security skills.
- [LOW] content_concision: Description field (201 words) exceeds typical conciseness while correctly carrying all routing signals Evidence: 67-word description in STATIC FACTS vs 67 words — no, actual description is comprehensive Action: Consider whether routing precision justifies full length or can be tightened

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/prompt-injection-defense/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Eval suite contains 15 cases but zero assertions and zero baseline entries, rendering the tests inert for automated regression or performance tracking. Evidence: Static eval summary: assertions: 0, baseline: 0 Action: Author assertions for application.json and establish a performance baseline.
- [MEDIUM] eval_readiness: Audit status remains UNVERIFIED for truth and application dimensions, indicating a gap between case creation and human-in-the-loop quality validation. Evidence: Audit summary: truth_verdict: UNVERIFIED Action: Execute a manual audit of the 15 cases to promote state to VERIFIED.
- [HIGH] eval_case_design: Zero hard-negative/red-herring cases in 15-case suite for a defense skill where over-triggering is a real risk Evidence: 0 hardNeg in eval summary Action: Add ≥1 red-herring case where prompt-injection-defense should NOT activate
- [MEDIUM] eval_certification: All four Audit Status verdicts UNVERIFIED; no graded comprehension or application assessment evidence Evidence: comprehension_verdict UNVERIFIED, application_verdict UNVERIFIED, eval_state unverified Action: Run graded evaluation to certify comprehension and application verdicts
- [MEDIUM] eval-design: Application eval has zero hard negative / red-herring cases despite clear anti-examples in the skill. Evidence: Eval summary shows hardNeg: 0; anti_examples lists 3 routes-elsewhere prompts. Action: Add 2+ cases with red_herring: true testing over-triggering on adjacent security topics.
- [MEDIUM] eval-design: No baseline comparison cases for measuring behavior change with versus without the skill. Evidence: Eval summary shows baseline: 0. Action: Add baseline prompts to enable before/after application comparison.
- [LOW] eval-design: Regression cases absent; eval cannot detect backsliding on prior fixes. Evidence: Eval summary shows regression: 0. Action: Add 1-2 regression cases targeting previously discovered failure modes.

Blockers:
- opus: exit 0

### summarization
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/summarization/SKILL.md
Content score: 87 (B)
Eval readiness score: 14 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add boundary/hard-negative cases distinguishing prose summarization from byte compression and budget math.

Content findings:
- [MEDIUM] boundary: Content boundaries are excellent and repeated across description, scope, Do-NOT table, and synergy, but no hard-negative anti-examples show a mis-routed prompt being declined. Evidence: Boundary stated prose-only; no worked counter-example for compression/context-window overlap Action: Add boundary/hard-negative cases distinguishing prose summarization from byte compression and budget math.
- [LOW] provenance: Content grounding is solid with three public traditions cited, but skill_graph_protocol label reads v6 while body conforms to v8, a stale provenance label. Evidence: skill_graph_protocol: 'Skill Metadata Protocol v6' under v8 frontmatter Action: Reconcile protocol label during next audit; not a content-quality defect.
- [INFO] Structural Clarity: The L1-L4 hierarchy provides actionable constraints for agents to match summary depth to task needs. Evidence: Section 1 table mapping levels to specific keep/drop rules. Action: Standardize this hierarchy across communication-heavy skills.
- [MEDIUM] field completeness: comprehension_state field missing despite populated Understanding fields Evidence: mental_model/purpose/boundary/analogy/misconception present; comprehension_state absent Action: Add comprehension_state: present to SKILL.md frontmatter
- [MEDIUM] provenance metadata: canonical_skill path references wrong subject directory Evidence: skill_graph_canonical_skill points to skills/agent-ops/; actual is skills/ai-engineering/ Action: Update canonical_skill path to ai-engineering/summarization
- [MEDIUM] metadata-consistency: Two conflicting top-level `public:` declarations in frontmatter — one under metadata (line 88) and one at root level (line 176 area). Root-level `public: true` duplicates the metadata block. Evidence: Frontmatter has `public: true` under metadata section and again at root relations block. Action: Remove the duplicate root-level `public:` declaration; keep one under metadata.
- [MEDIUM] metadata-consistency: skill_graph_canonical_skill path is wrong — points to `skills/agent-ops/summarization/SKILL.md` but the skill lives at `skills/ai-engineering/summarization/SKILL.md` (subject is ai-engineering, not agent-ops). Evidence: metadata.subject: ai-engineering; skill_graph_canonical_skill: skills/agent-ops/summarization/SKILL.md. Action: Correct skill_graph_canonical_skill to skills/ai-engineering/summarization/SKILL.md.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/summarization/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval file exists; cases/prompts/assertions all zero against a target of 10, so application and routing quality are entirely unverified. Evidence: Eval summary: cases 0, eval_state unverified, routing_eval absent Action: Author 10+ eval cases including boundary cases for compression/context-window/evaluation suppression.
- [HIGH] Eval Readiness: Missing all evaluation artifacts; the skill cannot be verified in its current state. Evidence: Eval summary reports 0 cases and 0 assertions. Action: Create 10 eval cases targeting faithfulness and level-appropriate condensation.
- [LOW] Domain Coverage: Explicit logic for audit report and agent handoff condensation addresses critical project-specific failure modes. Evidence: Sections 6 and 7 detailing handoff and audit-specific requirements. Action: Maintain alignment with Sales Hub audit standards.
- [HIGH] eval readiness: Zero eval cases across all surfaces despite eval_artifacts: planned Evidence: 0 files, 0 cases, 0 prompts, 0 assertions; comprehension and application verdicts UNVERIFIED Action: Author comprehension.json (7+ cases) and application.json (5+ cases with hard negatives)
- [HIGH] eval-readiness: No comprehension or application eval cases exist. eval_artifacts: planned, eval_state: unverified, comprehension_verdict/application_verdict: UNVERIFIED. Evidence: eval summary shows 0 cases, 0 prompts, 0 assertions across all dimensions. Action: Author comprehension.json (≥5 cases) and application.json (≥5 cases with hard negatives) to unlock certification.

### tool-call-flow
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/tool-call-flow/SKILL.md
Content score: 96 (A)
Eval readiness score: 16 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Note version drift for maintainers during next metadata refresh.

Content findings:
- [INFO] content/grounding: SKILL.md gives precise, vendor-correct protocol mechanics with strong boundaries and anti-examples; description cleanly delimits scope vs four sibling skills. Evidence: Invariants table, per-vendor ID pairing, explicit Do-NOT-Use table, 20+ truth sources. Action: None; content is certification-ready.
- [LOW] content/provenance: Metadata declares Protocol v5 while review applies v8; minor staleness in skill_graph_protocol field, not a content defect. Evidence: skill_graph_protocol: Skill Metadata Protocol v5. Action: Note version drift for maintainers during next metadata refresh.
- [INFO] depth: Comprehensive coverage of complex modern flows including Anthropic PTC and MCP RC. Evidence: Sections for Programmatic Tool Calling and MCP Release-Track Note. Action: None.
- [LOW] clarity: Strong use of tabular invariants and vendor comparisons clarifies subtle protocol differences. Evidence: Protocol Invariants and Vendor Protocol Comparison tables. Action: None.
- [LOW] Version label accuracy: skill_graph_protocol field claims v5 but the skill uses v8 schema fields and Understanding structure Evidence: Line 94 records 'Skill Metadata Protocol v5' Action: Bump to v8 after content review
- [MEDIUM] Description routing efficiency: Description is an 8-line paragraph that enumerates all coverage, not a concise routing activation signal Evidence: Lines 64 spans function_calling, MCP, streaming, computer-use etc. Action: Trim to 2-3 focused lines; keep detail in scope and triggers
- [LOW] metadata: skill_graph_protocol reports v5 but skill body is authored to v8 fields (scope, subject, grounding, relations). Evidence: review-bundle.md line 94: skill_graph_protocol: Skill Metadata Protocol v5. Action: Advance protocol label after content migration audit confirms v8 conformance.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/tool-call-flow/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval artifacts exist (0 cases vs target 10): no prompts, expected outputs, baseline, hard-negative, or boundary/routing cases to verify activation or comprehension. Evidence: Eval summary: files [], cases 0; routing_eval absent. Action: Author ~10 cases incl. boundary vs tool-call-strategy and hard negatives.
- [MEDIUM] audit-state: Comprehension and application verdicts UNVERIFIED and eval_state unverified; structural/truth PASS but behavior is unproven, blocking certification. Evidence: Audit summary: comprehension/application UNVERIFIED, eval_artifacts 'planned'. Action: Run comprehension + routing evals to move verdicts to verified.
- [HIGH] evaluation: Zero eval cases implemented against a target of 10 for certification. Evidence: Eval summary shows cases: 0. Action: Create 10 cases for invariants.
- [MEDIUM] Eval artifact absence: No comprehension or application eval artifacts exist despite thorough content Evidence: 0 cases, 0 prompts, 0 assertions; eval_state unverified Action: Author 7+ comprehension cases with hard negatives
- [HIGH] eval_design: Zero comprehension or application eval cases exist despite eval_artifacts: planned and eval_state: unverified. Evidence: review-bundle.md lines 35-46: files=[], cases=0, prompts=0. Action: Author 7+ comprehension scenarios and 5+ application cases per eval specs.
- [MEDIUM] audit_state: routing_eval: absent means no routing eval includes this skill against the retrieval baseline. Evidence: review-bundle.md line 56: routing_eval absent. Action: Include tool-call-flow in the next routing eval sweep.

### tool-call-strategy
Path: /Users/jacobbalslev/Development/skills/skills/ai-engineering/tool-call-strategy/SKILL.md
Content score: 96 (A)
Eval readiness score: 14 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Consolidate into a single YAML relations block.

Content findings:
- [INFO] content/scope-boundary: Description and Do-NOT table give crisp activation triggers plus six named off-ramps (prompt-craft, context-engineering, debugging, refactor), each distinguished by mechanism not label. Evidence: Frontmatter description + 'Do NOT Use When' table Action: None; boundary articulation is exemplary.
- [MEDIUM] metadata: Duplicate 'relations' field in frontmatter with conflicting formats (JSON string vs YAML object). Evidence: Duplicate keys at L137 and L191 Action: Consolidate into a single YAML relations block.
- [INFO] content: Highly effective use of the 'Script-vs-Call Decision Gate' and 'Poka-Yoke' sections for agent alignment. Evidence: Detailed logic gates in content Action: Promote to stable once evals are passing.
- [MEDIUM] scope vs description: scope field is verbatim copy of description — no PRD-style boundary statement Evidence: Both carry the same 100-word activation string at lines 62-63 and 85 Action: Write scope as a distinct PRD: what it teaches, for whom, and what it does not cover
- [MEDIUM] duplicate relations: relations appear in metadata JSON (line 129) and top-level block (lines 175-178) with conflicting entries Evidence: Metadata omits autonomous-loop-patterns, pattern-recognition, problem-locating-solving; top-level adds them Action: Remove one block; keep top-level frontmatter for machine-readability
- [MEDIUM] content: scope field duplicates description verbatim instead of stating the teaching scope as a PRD-style statement. Evidence: Lines 63 and 85 are identical text. Action: Rewrite scope as what the skill teaches (procedure/mental model), not when it activates.
- [MEDIUM] content: Two relations blocks with divergent content: JSON-encoded in metadata (line 129) lacks autonomous-loop-patterns, pattern-recognition, problem-locating-solving present in YAML block (lines 175-178). Evidence: Metadata related has 4 entries; YAML related has 5 including autonomous-loop-patterns. Action: Consolidate into one canonical relations block; remove the duplicate.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/ai-engineering/tool-call-strategy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval artifact exists: zero cases, prompts, assertions, baselines, hard-negatives, or boundary tests against a target of 10. Skill cannot be certified for application or routing. Evidence: Eval summary: files [], cases 0; routing_eval absent Action: Author eval suite: positive activations, anti_examples as hard-negatives, boundary cases, expected-behavior assertions.
- [MEDIUM] audit-state: Audit shows truth/comprehension/application all UNVERIFIED with eval_state unverified; grounding cites five truth sources but none are drift-verified, so usefulness is unproven. Evidence: Audit summary verdicts UNVERIFIED; eval_artifacts 'planned' Action: Run application + comprehension gates and record drift_check hashes for the five truth sources.
- [HIGH] eval-readiness: Zero evaluation cases implemented despite metadata indicating artifacts are 'planned'. Evidence: Eval summary: 0 cases Action: Author 10+ test cases in a sibling eval file.
- [HIGH] eval readiness: No eval artifacts despite 418-line depth with dense decision trees and tables Evidence: eval_artifacts: planned, eval_state: unverified, 0 cases in all categories Action: Create evals/comprehension.json with >=5 cases covering decision trees, batching, and poka-yoke rules
- [HIGH] eval_readiness: Zero comprehension and application eval cases despite eval_artifacts: planned; no eval design artifact exists. Evidence: Eval summary shows 0 cases, 0 files, 0 assertions. Action: Author at least 5 comprehension and 5 application eval cases before claiming any graded verdict.

### acid-fundamentals
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/acid-fundamentals/SKILL.md
Content score: 91 (A)
Eval readiness score: 63 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Trim duplicated prose so each section earns its place.

Content findings:
- [LOW] content-redundancy: SKILL.md body restates mental_model, purpose, boundary, and misconception near-verbatim across Concept and Philosophy sections, inflating length without adding signal. Evidence: 'Concept of the skill' mirrors frontmatter Understanding fields almost word-for-word Action: Trim duplicated prose so each section earns its place.
- [INFO] provenance: Export provenance label reads 'Skill Metadata Protocol v5' though the skill conforms to v8 classification fields; harmless but stale per provenance, outside SKILL.md content scope. Evidence: skill_graph_protocol: Skill Metadata Protocol v5 Action: Refresh export-pipeline provenance label on next export.
- [INFO] content: Content clarity regarding the 'Two Cs' and configuration-graded properties is industry-leading. Evidence: SKILL.md sections on 'Two Cs' and 'Configuration Matters'. Action: Maintain this structure as a template for database-related skills.
- [LOW] content scope: Postgres-centric example bias in database-agnostic ACID fundamentals skill Evidence: synchronous_commit, isolation mapping, replication examples all reference Postgres only Action: Add non-Postgres examples (MySQL, SQL Server, Oracle) for balance
- [MEDIUM] metadata-shape: skill_graph_protocol is 'Skill Metadata Protocol v5' but schema_version is 8; content label does not match the contract version. Evidence: skill_graph_protocol: Skill Metadata Protocol v5 at line 156. Action: Bump skill_graph_protocol to v8 after confirming v8 content migration is complete.
- [LOW] frontmatter-encoding: keywords, triggers, examples, anti_examples stored as stringified JSON arrays instead of native YAML lists. Evidence: keywords: "[\"ACID\",...]" at line 114; triggers, examples, anti_examples use same stringified pattern. Action: Convert stringified JSON arrays to native YAML list syntax for readability and tool compatibility.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/acid-fundamentals/evals/evals.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/acid-fundamentals/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness: Eval suite has 8 cases vs target 10, with 0 baseline/positive-activation cases and 0 assertions; comprehension and application verdicts remain UNVERIFIED. Evidence: cases 8, baseline 0, assertions 0; eval_state unverified Action: Add 2+ positive-activation cases to reach 10 and run to populate verdicts.
- [HIGH] eval_readiness: Evaluation suite contains zero assertions, rendering it incapable of automated success verification. Evidence: Static summary reports 0 assertions for 8 cases. Action: Add specific assertions to all cases in evals.json.
- [MEDIUM] eval_readiness: Case count is 8, missing the target of 10 required for full certification. Evidence: Static eval summary: 8 cases. Action: Author 2 more cases targeting specific isolation level anomalies.
- [MEDIUM] eval design: 8 eval cases below 10-case target; no regression or baseline cases Evidence: Eval: 8 cases, 0 regression, 0 baseline, 0 assertions Action: Add 2+ regression/baseline cases to evals.json
- [MEDIUM] eval certification: comprehension_verdict and application_verdict both UNVERIFIED; routing_eval absent Evidence: audit-state.json shows no behavioral eval ever run Action: Run comprehension + application evals through audit loop
- [HIGH] eval-artifacts: 8 eval cases exist but eval_state is unverified and both comprehension/application verdicts are UNVERIFIED — no run evidence on record. Evidence: audit-state.json shows comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED, eval_state: unverified. Action: Run the comprehension and application evals to produce run receipts and advance verdicts.

### api-design
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/api-design/SKILL.md
Content score: 88 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Update protocol label to reflect current schema version

Content findings:
- [INFO] content/boundary: Description plus dual Boundary/Protocol triage tables and anti_examples cleanly delegate to 7+ sibling skills, sharply scoping activation. Evidence: Boundary Triage + Do-NOT-Use tables name http-semantics, route-handler-design, event-contract-design, etc. Action: None; preserve this boundary discipline on edits.
- [MEDIUM] content: skill_graph_protocol label v5 inconsistent with v8 field usage Evidence: Line 139 declares v5; skill uses subject, public, scope, taxonomy_domain (v8 fields) Action: Update protocol label to reflect current schema version
- [HIGH] metadata hygiene: Template teaching comments (lines 73-109) are still present in frontmatter. Evidence: Lines 73-109 contain instructional comments like '# schema_version: protocol contract version this skill conforms to.' Action: Remove all instructional template comments before publishing.
- [MEDIUM] version label: skill_graph_protocol claims 'Skill Metadata Protocol v5' but schema_version is 8. Evidence: Line 139: skill_graph_protocol: Skill Metadata Protocol v5. Action: Update skill_graph_protocol to v8 after completing v8 content migration.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/api-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface is empty: 0 cases/prompts/assertions despite SKILL.md linking an api-design.json artifact; no baseline, hardNeg, or boundary cases against target of 10. Evidence: Eval summary cases:0 files:[]; audit eval_state unverified, application_verdict UNVERIFIED. Action: Author ≥10 graded cases incl. boundary/hard-negative routing before certification.
- [MEDIUM] provenance/eval: Stale export provenance (skill_graph_protocol v5) and absent routing_eval leave activation unverified against a broad, overlap-prone description. Evidence: skill_graph_protocol: v5; audit routing_eval absent; comprehension/application UNVERIFIED. Action: Add routing eval (lint check 12) and refresh provenance label to current protocol.
- [HIGH] eval_readiness: No eval cases exist despite audit-state claiming eval_artifacts present Evidence: Eval summary: 0 files, 0 cases, 0 assertions, 0 prompts Action: Author 10 comprehension eval cases covering core dimensions
- [MEDIUM] eval_readiness: routing_eval absent — activation coverage unverified Evidence: Audit summary shows routing_eval: absent Action: Include skill in next routing eval sweep
- [LOW] eval coverage: audit-state.json claims eval_artifacts: present but no actual eval file or cases exist. Evidence: Eval summary: files=[], cases=0. SKILL.md references examples/evals/api-design.json which is empty/missing. Action: Create comprehension.json with 7+ realistic scenarios covering routing boundaries, anti-patterns, and idempotency design decisions.

Blockers:
- gemini-flash: exit 0

### background-jobs
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/background-jobs/SKILL.md
Content score: 89 (B)
Eval readiness score: 59 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [LOW] content-grounding: Scope/description/concept paragraph and mental_model restate the same five-primitive framing nearly verbatim, adding redundancy without new grounding or truth sources. Evidence: SKILL.md description, scope, mental_model, and 'Concept' section repeat five-primitive list Action: Trim repetition; cite a truth source or concrete platform-limit reference.
- [MEDIUM] metadata_integrity: Missing comprehension_state marker despite present understanding fields. Evidence: mental_model and purpose are populated, but the comprehension_state key is absent. Action: Add comprehension_state: present to the metadata block.
- [INFO] content_quality: Strong procedural grounding through decision gates and contract definitions. Evidence: The Execution Decision Gate and Job Contract tables provide clear, actionable primitives. Action: Preserve existing content structure as a high-bar benchmark.
- [MEDIUM] content_accuracy: skill_graph_protocol claims v7 but skill uses v8 schema fields (subject, public, scope) Evidence: Line 159: skill_graph_protocol: Skill Metadata Protocol v7 Action: Update skill_graph_protocol to Skill Metadata Protocol v8
- [HIGH] grounding: Skill body lacks explicit truth_sources section or verification references for external claims. Evidence: No grounding block in body or metadata referencing external sources. Action: Add grounding.truth_sources with references to queue documentation or patterns.
- [LOW] metadata: skill_graph_protocol shows v7, not current v8; minor version mismatch. Evidence: skill_graph_protocol: Skill Metadata Protocol v7 in frontmatter. Action: Update skill_graph_protocol to v8 or clarify migration status.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 7 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/background-jobs/evals/evals.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 7 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/background-jobs/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval has 7 cases vs target 10, with 0 assertions, 0 boundary cases, and 0 regression cases — coverage is thin and weakly checked. Evidence: eval summary: cases 7, assertions 0, boundary 0, regression 0, hardNeg 3 Action: Add 3+ cases reaching 10, include boundary/regression and per-case assertions.
- [MEDIUM] audit-state: Eval artifact present but unrun; comprehension and application verdicts UNVERIFIED and routing_eval absent, so usefulness is not grader-confirmed. Evidence: audit-state: eval_state unverified, comprehension/application UNVERIFIED, routing_eval absent Action: Run eval to passing and verify routing activation via lint check 12.
- [HIGH] eval_readiness: Evaluation suite fails to meet minimum case count and diagnostic complexity. Evidence: Cases: 7 (target 10); Assertions: 0; Boundary cases: 0. Action: Expand to 10+ cases and add explicit assertions to verify model output.
- [MEDIUM] eval_readiness: Eval has 0 assertions across 7 cases; grader has no formal validation contract Evidence: Eval summary shows assertions: 0 Action: Add structured assertions to each eval case
- [LOW] eval_readiness: 7 eval cases below 10-case target; 0 boundary test cases Evidence: Eval summary: cases=7, boundary=0 Action: Add 3+ cases to reach 10-case target with boundary coverage
- [MEDIUM] eval_structure: Eval file has 7 cases but 0 assertions defined; no structured criteria for scoring. Evidence: eval summary shows assertions: 0 despite 7 cases present. Action: Add assertion arrays to each eval case defining pass/fail criteria.

### compression
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/compression/SKILL.md
Content score: 71 (C)
Eval readiness score: 14 (F)
Certification status: not certified; missing eval artifacts
Verdict: Partial authored skill content; improve clarity, boundaries, procedure, or grounding.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] boundary/anti-examples: Content surface: description and 'Do NOT Use When' table give precise routing boundaries (product-photo, context-management, token-efficiency, credential-encryption) with ownership rationale. Evidence: 4-row exclusion table + explicit NOT-use clause in description Action: None; retain as model boundary pattern.
- [MEDIUM] grounding/provenance: Content surface: skill_graph_protocol label reads 'Skill Metadata Protocol v5' while frontmatter conforms to v8 schema, signaling stale export provenance. Evidence: skill_graph_protocol: Skill Metadata Protocol v5 vs schema_version 8 Action: Re-run export pipeline to refresh provenance label to v8.
- [MEDIUM] grounding: Lacks explicit links to external specifications for infra algorithms. Evidence: SaaS Data Compression section. Action: Link RFCs for Zstd and Brotli.
- [LOW] applicability: AI context section is strong but lacks a concrete example. Evidence: Section 2 instructions. Action: Add a State of the Union example.
- [HIGH] scope/grounding consistency: Key Files references repo-internal paths (scripts/hooks/, agent-orchestration/) that contradict scope claim of principle-grounded, not repo-bound Evidence: L170-175 lists scripts/hooks/, agent-orchestration/ONBOARDING.md files Action: Either ground the skill with truth_sources and project[] or remove repo-specific paths
- [MEDIUM] frontmatter hygiene: Template scaffolding comments remain in frontmatter (description, license, compatibility, metadata block) Evidence: L62-73 show commented YAML instructions for authoring Action: Remove all commented template scaffolding before stabilization
- [MEDIUM] dead code: Duplicate relations field — JSON string in legacy metadata block line 125 is shadowed by top-level relations line 152-153 Evidence: L125 has relations JSON string, L152-153 has proper top-level relations Action: Remove the legacy metadata-block relations to eliminate dead code
- [HIGH] Grounding: Key Files table references project-specific paths (pre-compact-hook.py, session-ctl.js, agent-orchestration/) that are not portable to external consumers. Evidence: Lines 172-175: paths assume this repo's directory structure. Action: Replace project-specific paths with universal guidance or remove the Key Files table.
- [MEDIUM] Schema conformance: Conflicting relations definitions: line 125 has JSON string format, line 152-153 has YAML object with extra key (cognitive-load-theory). Evidence: Two relations: keys in frontmatter, one stringified JSON, one native YAML object. Action: Consolidate to single YAML relations block and verify all targets exist in the skill library.
- [LOW] Metadata: skill_graph_protocol declares 'Skill Metadata Protocol v5' but schema_version context implies v8 conformance. Evidence: Line 137: skill_graph_protocol: Skill Metadata Protocol v5. Action: Update to current protocol version or remove export-provenance fields from hand-authored content.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/compression/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval readiness: Eval surface: zero cases against target of 10; no prompts, assertions, baseline, hard-negatives, or boundary cases; comprehension and application verdicts UNVERIFIED. Evidence: Eval summary cases:0; eval_artifacts 'planned', eval_state 'unverified' Action: Author 10 eval cases incl. boundary/hard-negative routing before certification.
- [HIGH] eval_readiness: Zero evaluation cases exist to verify skill performance. Evidence: eval_summary shows 0 cases. Action: Create 10+ cases in compression.eval.json.

### connection-pooling
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/connection-pooling/SKILL.md
Content score: 93 (A)
Eval readiness score: 61 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Reconcile protocol label to the actual v8 schema in provenance metadata.

Content findings:
- [MEDIUM] provenance/content: Frontmatter declares skill_graph_protocol 'v5' while the artifact uses full v8 fields (subject, scope, relations), creating a misleading version label on otherwise strong content. Evidence: metadata.skill_graph_protocol: 'Skill Metadata Protocol v5' Action: Reconcile protocol label to the actual v8 schema in provenance metadata.
- [MEDIUM] lifecycle accuracy: stability experimental understates content maturity — thorough, grounded, with complete modes matrix and verification checklist Evidence: 198-line skill with 9 external truth sources, failure catalog, sizing table, and 10-item verification checklist Action: Promote to stable after eval certification completes
- [LOW] truth verification: truth_verdict UNVERIFIED despite 9 external canonical truth sources cited in grounding Evidence: grounding.truth_sources lists Wooldridge, PgBouncer, PostgreSQL docs, Little's Law paper, RDS Proxy, Supavisor Action: Run drift check against truth sources to stamp truth_verdict
- [MEDIUM] structure: grounding field is JSON-encoded as a string rather than a proper nested object in metadata. Evidence: Line 95: grounding is a stringified JSON blob, not a typed nested structure. Action: Restructure grounding as a proper YAML nested object to match the v8 schema intent.
- [MEDIUM] structure: Duplicate relations blocks exist: one inside metadata (line 120) and one at top level (lines 147-150). Evidence: metadata.relations (line 120) and top-level relations (lines 147-150) carry overlapping but not identical data. Action: Consolidate to a single relations surface — keep only the top-level relations block.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/connection-pooling/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: 15 eval cases but zero expected outputs and zero assertions, so no case is machine-scoreable; routing/hardNeg coverage exists but verdict cannot be computed. Evidence: Eval summary: cases 15, expected 0, assertions 0, baseline 0 Action: Add expected answers/assertions per case so application+comprehension can be scored.
- [LOW] audit-state: Audit reports truth/comprehension/application all UNVERIFIED despite eval artifacts present, so certification readiness is incomplete though content quality is high. Evidence: Audit: truth/comprehension/application UNVERIFIED; eval_state unverified Action: Execute eval run to flip unverified verdicts before certification.
- [HIGH] eval certification: eval_state unverified despite having both comprehension and application eval artifacts Evidence: audit summary: eval_artifacts present, eval_state unverified, both comprehension/application verdicts UNVERIFIED Action: Run evaluation pipeline to certify artifacts and stamp verdicts
- [MEDIUM] eval_readiness: Eval summary shows zero expected, zero assertions, and zero baseline — comprehension and application cases lack structural completeness signals. Evidence: Eval summary: expected:0, assertions:0, baseline:0 despite 15 cases and 8 prompts present. Action: Audit eval files for missing expected/assertion fields and add baseline coverage to application cases.

Blockers:
- gemini-flash: exit 0

### cron-scheduling
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/cron-scheduling/SKILL.md
Content score: 91 (A)
Eval readiness score: 49 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Reconcile redirect targets with declared relation edges; verify referenced skills exist.

Content findings:
- [MEDIUM] grounding/consistency: Content surface: 'Do NOT Use When' names skills (inngest-orchestration, data-sync, alert-dispatch) not matching relations/anti_examples roster (background-jobs, real-time-updates), risking dangling cross-refs. Evidence: Table cites skills absent from relations.related and suppresses lists. Action: Reconcile redirect targets with declared relation edges; verify referenced skills exist.
- [INFO] Content Depth: Excellent platform-specific guidance for Vercel and Inngest with explicit auth and idempotency implementation patterns. Evidence: Decision matrix and code blocks in SKILL.md. Action: None; content is production-ready.
- [MEDIUM] content: Do NOT Use table references unreachable skills Evidence: inngest-orchestration, data-sync, alert-dispatch missing from relations.related Action: Add each as relations.related or remove unreferenced skill names
- [MEDIUM] content: Template teaching comments retained in frontmatter Evidence: 40+ comment-only lines across metadata block (lines 63-140) Action: Strip all template comments before production use

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 7 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/cron-scheduling/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 7 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/cron-scheduling/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval artifact: 7 comprehension prompts only, 0 expected/assertions, 0 hard negatives, 1 boundary, no routing eval; below target 10 and cannot verify application. Evidence: cases:7 expected:0 assertions:0 hardNeg:0 boundary:1 routing_eval:absent. Action: Add expected behaviors/assertions, hard negatives for anti_examples, and a routing eval to reach 10.
- [LOW] audit-state: Eval surface: comprehension PROVISIONAL and application UNVERIFIED with eval_state unverified; certification evidence incomplete despite present artifacts. Evidence: comprehension_verdict PROVISIONAL, application_verdict UNVERIFIED, eval_state unverified. Action: Run comprehension+application evals to promote verdicts before certifying skill.
- [MEDIUM] Eval Readiness: Evaluation case count is below the protocol target of 10, limiting verification breadth. Evidence: Eval summary reports 7 cases. Action: Author 3 additional cases covering edge-case failures.
- [HIGH] Eval Design: Zero assertions or expected outputs in the eval artifact prevent automated grading and verification. Evidence: Eval summary: assertions:0, expected:0. Action: Define structured assertions in comprehension.json.
- [MEDIUM] eval: Eval lacks assertions and hard negatives Evidence: 0 expected, 0 assertions, 0 hardNeg; no application.json Action: Add expected outputs + assertions; author application.json with 5+ cases

Blockers:
- mimo: exit 0

### http-semantics
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/http-semantics/SKILL.md
Content score: 95 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Continue monitoring IETF HTTPBIS/HTTPAPI work for draft updates and RFC publications.

Content findings:
- [INFO] content/grounding: SKILL.md content is exceptional: orthogonal mental model, MUST/SHOULD distinctions, anti-examples, and per-feature standard-field-first discipline, all anchored to named RFC sections. Evidence: Content surface: 25+ cited RFCs/drafts, draft status flagged for QUERY/Idempotency-Key/RateLimit. Action: Preserve as reference exemplar; no content changes needed.
- [INFO] Technical Grounding: Exceptional depth and currency. Correctly separates version-independent semantics from transport syntax and incorporates 2025 RFCs like 9875 and 9745. Evidence: Mentions RFC 9875 (Oct 2025) and RFC 9651 (Sept 2024) with precise semantic context. Action: Continue monitoring IETF HTTPBIS/HTTPAPI work for draft updates and RFC publications.
- [INFO] Scope & Boundaries: Superior boundary discipline. Effectively suppresses api-design by distinguishing the underlying protocol contract from the product-facing API surface shape. Evidence: metadata.relations.suppresses and concept_boundary clearly define 'protocol-level' vs 'surface-shape' ownership. Action: Use this as a reference template for other backend-engineering skill boundaries.
- [HIGH] content/lifecycle: stability: experimental contradicts production-quality content with 32+ RFC citations and 22-item verification checklist. Evidence: Line 109 stability: experimental; analysis shows thorough grounding suitable for stable. Action: Advance stability to stable after adding eval artifacts.
- [LOW] content/provenance: skill_graph_protocol labels v5 but all metadata fields follow v8 schema (subject, public, scope, relations). Evidence: Line 152 skill_graph_protocol: Skill Metadata Protocol v5 vs v8 field usage throughout. Action: Update skill_graph_protocol to v8 to match actual protocol conformance.
- [MEDIUM] content_structure: skill_graph_protocol is stamped v5 but the skill carries v8 fields (subject, public, scope, taxonomy_domain, flat Understanding fields). The content-label claim is stale. Evidence: Line 152: skill_graph_protocol: Skill Metadata Protocol v5. Skill has v8 classification fields throughout. Action: Advance skill_graph_protocol to v8 through the audit loop after confirming content migration is complete.
- [LOW] frontmatter_diagnostics: keywords and triggers are JSON-stringified arrays rather than native YAML lists, creating a double-encoding that some parsers may mishandle. Evidence: Lines 112-115: keywords and triggers use bracket-quoted JSON strings instead of YAML list syntax. Action: Convert keywords and triggers to native YAML list format for cleaner parsing.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/http-semantics/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface has zero cases, prompts, and assertions (eval_artifacts=planned); comprehension and application verdicts are UNVERIFIED, so usefulness is unconfirmed against the target of 10 cases. Evidence: Eval summary: files=[], cases=0, assertions=0; audit application_verdict UNVERIFIED. Action: Author 10+ eval cases incl. boundary and hard-negative routing vs api-design/webhook-integration.
- [MEDIUM] eval-readiness/routing: routing_eval is absent, so the broad description and overlapping suppresses edges (api-design, webhook-integration) are not harness-verified for correct activation versus near-miss prompts. Evidence: Audit: routing_eval=absent; rich anti_examples authored but unexercised. Action: Add routing eval gated by lint check 12 using existing anti_examples as negatives.
- [HIGH] Eval Readiness: Skill is currently unverifiable. No eval cases or harness files exist despite being marked as 'planned', preventing automated quality certification. Evidence: Eval summary shows 0 cases and 0 files; audit-state artifact status is 'planned'. Action: Author minimum 10 eval cases covering method safety, cache-key design, and conditional request precedence.
- [MEDIUM] eval/readiness: No comprehension or application eval files exist despite eval_artifacts: planned. Evidence: Eval summary: 0 cases, 0 files. comprehension_verdict and application_verdict both UNVERIFIED. Action: Create 7-10 comprehension cases and 5-7 application cases including hard negatives.
- [HIGH] eval_artifacts: Zero comprehension or application eval cases exist despite eval_artifacts: planned and eval_state: unverified in audit-state.json. No way to certify the skill teaches effectively. Evidence: eval summary shows files: [], cases: 0, prompts: 0. audit-state.json has comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED. Action: Author evals/comprehension.json with 7-8 scenarios covering method selection, status code families, caching pitfalls, conditional request mechanics, and boundary cases.

### real-time-updates
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/real-time-updates/SKILL.md
Content score: 92 (A)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Extend or apply the model in body rather than restating it

Content findings:
- [LOW] content/boundary: Description, scope, anti_examples, and Do-NOT-Use table consistently disambiguate six adjacent skills by mechanism, giving strong routing precision. Evidence: SKILL.md anti_examples + 'Do NOT Use When' table name streaming-architecture, background-jobs, cron, etc. Action: None; keep as exemplar of boundary authoring.
- [INFO] Content Depth: High-signal architectural guidance provided via clear decision matrices and freshness contract definitions. Evidence: SKILL.md includes comprehensive tables for Transport selection and Freshness contracts. Action: Maintain this structural pattern for sibling backend-engineering skills.
- [MEDIUM] Content uniqueness: mental_model field repeated verbatim in body paragraph one, wasting body space on restatement Evidence: Line 124 mental_model matches line 152 body opener character-for-character Action: Extend or apply the model in body rather than restating it
- [LOW] content: SSE code example shows server-side ReadableStream setup only; no client-side EventSource or reconnect catch-up example to complete the picture. Evidence: SKILL.md lines 272-296: server-side GET handler; no matching client code. Action: Add a brief client-side EventSource example with Last-Event-ID catch-up.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/real-time-updates/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval lacks adversarial depth: 0 hard-negatives and only 1 boundary case across 15 cases, so confusable-route suppression (the skill's main risk) is barely tested. Evidence: Eval summary: hardNeg 0, boundary 1, regression 0, assertions 0. Action: Add hard-negative cases per suppressed sibling and assertion-backed routing checks.
- [MEDIUM] audit-state: Truth, comprehension, and application verdicts are all UNVERIFIED despite present artifacts, so certification evidence is absent and scores rest on static pre-scores. Evidence: Audit summary: eval_state 'unverified'; three verdicts UNVERIFIED. Action: Run comprehension/application/truth evals to convert artifacts into verified verdicts.
- [HIGH] Eval Readiness: Zero assertions in eval suite prevents automated verification and certification. Evidence: Eval summary reports 0 assertions across 15 cases in eval directory. Action: Add specific assertions to application.json and comprehension.json.
- [MEDIUM] Eval Design: Missing hard negatives and regression cases limits the eval suite's discriminatory power. Evidence: Eval summary shows 0 hard negatives and 0 regression cases. Action: Author 2-3 hard negative cases targeting transport selection nuances.
- [MEDIUM] Eval case design: Zero hard-negative cases despite 7 sibling relations and explicit anti_examples; cannot detect over-triggering Evidence: Eval summary reports hardNeg:0 while anti_examples list 5 near-miss prompts Action: Add 2+ hard-negative cases testing the skill does NOT fire on sibling skill territory
- [LOW] Eval structure: No assertions or baselines across 15 cases; evals are qualitative prompts without structured pass/fail criteria Evidence: assertions:0, baseline:0, comprehension_verdict and application_verdict both UNVERIFIED Action: Add one assertion per case and a baseline arm for application grading
- [HIGH] eval-design: Zero hard negative cases in eval suite; red_herring count is 0 despite 15 total cases. Cannot detect false-positive routing or over-triggering. Evidence: Eval summary: hardNeg: 0, boundary: 1 out of 15 cases. Action: Add at least 2 red_herring cases targeting over-broad activation (e.g., low-level backpressure design).
- [MEDIUM] eval-design: Regression and assertion counts are zero across both eval files; no baseline or expected-assertion coverage to detect drift. Evidence: Eval summary: regression: 0, assertions: 0, baseline: 0. Action: Add regression cases and expected assertions per case to anchor eval stability.

### route-handler-design
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/route-handler-design/SKILL.md
Content score: 90 (A)
Eval readiness score: 14 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 35 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [LOW] description activation: Description/scope is a single ~400-word sentence duplicated verbatim in scope; high recall but may dilute router signal and is hard to scan for activation boundaries. Evidence: description and metadata.scope are identical multi-clause paragraphs Action: Keep content; rely on keywords/triggers/examples for routing and verify activation via a routing eval.
- [INFO] content_quality: Excellent technical depth regarding Next.js 15/16 breaking changes and streaming backpressure mechanisms. Evidence: Includes pull() vs start() stream logic and async params/headers mandatory awaiting. Action: Maintain this level of technical precision during future Next.js major updates.
- [LOW] metadata_integrity: Protocol version mismatch in provenance footer versus actual frontmatter structure. Evidence: Frontmatter uses v8 subject/public fields but footer claims Skill Metadata Protocol v5. Action: Update skill_graph_protocol to v8 to match current schema usage.
- [MEDIUM] truth_verification: No grounding truth_sources recorded; truth_verdict UNVERIFIED with no path to PASS Evidence: No grounding field, truth_source_hashes, or last_verified date in frontmatter Action: Link Next.js docs and record drift hashes via skill-graph-drift.js
- [MEDIUM] content_accuracy: skill_graph_protocol: v5 contradicts v8 frontmatter (subject, public, scope fields) Evidence: Protocol label v5 but content uses v8 classification axes Action: Bump skill_graph_protocol to v8 after content migration confirmed
- [MEDIUM] truth-verification: truth_verdict=UNVERIFIED — no drift check has been run against declared truth sources. Caching defaults and async API claims require verification against current Next docs. Evidence: Audit summary: truth_verdict=UNVERIFIED, drift_check absent. Action: Run skill-graph-drift.js --record --apply and verify truth sources against Next 15/16 docs.
- [LOW] version-label: skill_graph_protocol claims 'Skill Metadata Protocol v5' in frontmatter while schema_version is 8. Content was enriched but label was not advanced. Evidence: Frontmatter line 162: skill_graph_protocol: Skill Metadata Protocol v5. Action: Advance skill_graph_protocol to match schema_version after content migration is reviewed.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/route-handler-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval file exists: 0 cases against a target of 10, no prompts, assertions, baseline, or boundary/hard-negative cases. eval_artifacts is only 'planned'. Evidence: Eval summary: files [], cases 0, hardNeg 0, boundary 0 Action: Author 10 eval cases incl. boundary/hard-negatives vs server-actions/api-design, then run to passing.
- [MEDIUM] provenance/audit-state: Provenance label drift: skill_graph_protocol reads 'v5' while schema_version is 8; all truth/comprehension/application verdicts remain UNVERIFIED after material content rewrite. Evidence: skill_graph_protocol: 'Skill Metadata Protocol v5'; audit truth_verdict UNVERIFIED Action: Re-record drift hashes, run comprehension/application gates, reconcile protocol label (audit-state, not SKILL.md).
- [HIGH] eval_readiness: Skill has zero evaluation cases, prompts, or assertions despite being marked as experimental. Evidence: Eval summary shows 0 cases and 0 assertions; eval_artifacts state is 'planned'. Action: Author at least 10 evaluation cases covering caching, async APIs, and webhook patterns.
- [HIGH] eval_readiness: No comprehension or application eval artifacts exist (0 cases, 0 prompts) Evidence: eval_files: [], cases: 0, eval_artifacts: planned Action: Author evals/comprehension.json (>=5 cases) and evals/application.json (>=5 cases)
- [HIGH] eval-artifacts: Zero eval cases exist — comprehension.json and application.json are absent despite eval_artifacts: planned. No eval has been run; skill cannot be certified useful. Evidence: Eval summary: cases=0, files=[], eval_state=unverified, comprehension_verdict=UNVERIFIED. Action: Author comprehension.json (≥5 cases) and application.json (≥5 cases with red herrings), then run evaluate.

### streaming-architecture
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/streaming-architecture/SKILL.md
Content score: 95 (A)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Let export pipeline refresh the protocol label to match v8 content.

Content findings:
- [INFO] grounding: Provenance label lags the schema: skill_graph_protocol reads v5 while the frontmatter uses v8 fields, a stale export-pipeline label. Evidence: metadata.skill_graph_protocol: 'Skill Metadata Protocol v5' beside v8 subject/scope fields. Action: Let export pipeline refresh the protocol label to match v8 content.
- [HIGH] Content: The 'Five Primitives' framework is exceptional, providing a robust mental model that decouples transport mechanisms from core architectural requirements. Evidence: Five Primitives table and Mental Model section in SKILL.md. Action: Preserve this structure; it is a gold-standard pattern for engineering skills.
- [LOW] Metadata: The experimental stability tag is conservative given the high quality and comprehensive nature of the authored content. Evidence: stability: experimental in frontmatter. Action: Promote to stable once application-level evals are verified.
- [INFO] content/mental-model: Five-primitives framework (producer, stream, consumer, backpressure, termination) is a powerful transferable abstraction across all transports Evidence: Lines 184-191 primitives table plus mental_model field lines 124-126 Action: Preserve as exemplar for portable skill mental-model design
- [MEDIUM] metadata: skill_graph_protocol declared as 'Skill Metadata Protocol v5' but the skill carries v8 fields (subject, public, scope, taxonomy_domain). Evidence: Frontmatter line 143: skill_graph_protocol: Skill Metadata Protocol v5; skill has v8 required fields present. Action: Advance skill_graph_protocol to v8 after confirming substantive content migration is complete.
- [LOW] grounding: Grounding field is serialized as a JSON string rather than a native YAML object, reducing readability and lintability. Evidence: Frontmatter line 95: grounding: "{"subject_matter":...}" (string-escaped JSON). Action: Convert grounding to native YAML mapping in a future CONTENT pass.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/streaming-architecture/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval artifacts carry 15 cases but zero expected outputs and zero assertions, so no case can be scored pass/fail automatically. Evidence: Eval summary: expected 0, assertions 0, baseline 0, regression 0. Action: Add expected/assertion fields per case and at least one baseline+regression case.
- [MEDIUM] audit-state: Truth, comprehension, and application verdicts are all UNVERIFIED despite structural PASS, so certification evidence is incomplete. Evidence: Audit summary: truth/comprehension/application all UNVERIFIED, eval_state unverified. Action: Run truth and behavioral eval passes to move verdicts from UNVERIFIED to verified.
- [MEDIUM] Eval Design: Evals currently function as routing-only tests because they lack assertions and expected outputs for validating reasoning quality. Evidence: Eval summary reports 0 expected and 0 assertions. Action: Author assertions and expected response values in application.json to verify grounding.
- [MEDIUM] eval/assertions: 15 eval cases with 12 hard negatives but zero assertions — no automated grading possible for verdict certification Evidence: Eval summary: assertions=0, expected=0, baseline=0 Action: Add expected_flags and absent_signals to each comprehension and application eval case
- [LOW] eval/verdict: Present eval artifacts but no verdict earned — comprehension and application verdicts remain UNVERIFIED Evidence: comprehension_verdict UNVERIFIED, application_verdict UNVERIFIED, eval_state unverified Action: Run evaluate --mode comprehension then --mode application to earn verdicts
- [HIGH] eval-design: All four audit verdicts (structural, truth, comprehension, application) are UNVERIFIED despite eval_artifacts marked present and 15 eval cases existing. Evidence: audit-state.json shows comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED, eval_state: unverified. Action: Run comprehension and application evals to populate verdicts and stamp eval_state: passing.

### transaction-isolation
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/transaction-isolation/SKILL.md
Content score: 90 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Restructure body into distinct sectioned prose rather than re-emitting frontmatter fields.

Content findings:
- [MEDIUM] content-altitude: Body 'Concept of the skill' concatenates frontmatter mental_model/purpose/boundary/analogy/misconception verbatim into one wall-of-text paragraph, hurting scannability and signaling copy-paste over authored prose. Evidence: Second body paragraph reproduces purpose+boundary+analogy+misconception fields nearly verbatim. Action: Restructure body into distinct sectioned prose rather than re-emitting frontmatter fields.
- [INFO] Technical Depth: Exceptional treatment of vendor-specific implementation nuances, particularly Postgres SSI and MySQL gap locks, elevating the skill beyond theoretical SQL standards. Evidence: SKILL.md implementation matrix and misconception sections. Action: Preserve high-density technical details during future edits.
- [MEDIUM] Metadata Protocol: Frontmatter uses v8 schema but export provenance footer claims v5 protocol, potentially breaking automated graph processing tools. Evidence: Footer line 'skill_graph_protocol: Skill Metadata Protocol v5'. Action: Correct the provenance label to v8.
- [HIGH] content: Body opens with verbatim Understanding-field re-statement (mental_model/purpose/concept_boundary/analogy/misconception) inline. Evidence: Lines 177–183 concatenate ~40 lines of frontmatter verbatim before reaching independent operational content. Action: Remove inline Understanding dump; body should own operational guidance from the Choice Procedure forward.
- [MEDIUM] content: Acid-fundamentals listed as both related and suppresses in relations. Evidence: Lines 170–171: acid-fundamentals appears in related[] and suppresses[]. Suppresses excludes from co-routing, making the related entry meaningless. Action: Pick one: drop acid-fundamentals from related, or remove suppresses. Both is architecturally contradictory.
- [MEDIUM] Content structure: Body's 'Concept of the skill' section (lines 179-183) is a verbatim concatenation of the Understanding fields (mental_model + purpose + concept_boundary + analogy + misconception). This repeats what frontmatter already declares and delays the instructional narrative. Evidence: Lines 179-183 match lines 132-147 field-by-field; body should open with Coverage or Philosophy instead. Action: Replace the verbatim Understanding dump with a brief narrative intro, or remove it entirely — the frontmatter Understanding fields are the canonical source.
- [MEDIUM] Structural consistency: Dual relations definitions exist with different values: metadata block (line 129) has structured suppresses with reason text; top-level frontmatter (line 169) adds indexing-strategy and replication-patterns and uses flat arrays. Parser may pick the wrong one. Evidence: Line 129: related has 4 entries, suppresses has 1 object. Line 169: related has 5 entries (adds indexing-strategy), suppresses is flat string, verify_with adds replication-patterns. Action: Consolidate to one relations definition; reconcile the two sets of targets and use the structured suppresses format consistently.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/transaction-isolation/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval cases exist against a target of 10; comprehension and application verdicts both UNVERIFIED, eval_artifacts only planned. Skill cannot be certified for usefulness. Evidence: Eval summary: cases 0, prompts 0, assertions 0; audit application_verdict UNVERIFIED. Action: Author 10 eval cases: baseline, hard-negatives (acid/cap/query-opt), boundary write-skew/SSI prompts.
- [LOW] provenance: Export provenance labels skill_graph_protocol as v5 while frontmatter targets schema_version 8, a stale label inconsistency in non-SKILL audit state. Evidence: skill_graph_protocol: 'Skill Metadata Protocol v5' alongside v8 classification fields. Action: Re-run export pipeline to refresh protocol label to v8.
- [HIGH] Eval Readiness: The skill lacks all physical evaluation artifacts despite being marked as planned, resulting in an unverified state for both comprehension and application. Evidence: Static eval summary showing zero cases and files. Action: Implement 10+ test cases mapping workload anomalies to database levels.
- [MEDIUM] eval: Zero eval artifacts exist despite planned designation. Evidence: Eval summary: 0 files, 0 cases, 0 prompts, 0 assertions. Audit state: eval_state unverified, comprehension/application UNVERIFIED. Action: Author 5–7 comprehension.json cases covering anomaly identification, level-choice procedure, and DB-specific implementation variation.
- [HIGH] Eval readiness: Zero comprehension and application eval cases (eval_artifacts: planned, eval_state: unverified). A skill covering five isolation levels, six anomalies, and database-specific implementations needs 7-8 comprehension scenarios and 5-7 application cases including write-skew detection and retry-logic. Evidence: Eval summary shows files: [], cases: 0, prompts: 0. Audit-state: comprehension_verdict UNVERIFIED, application_verdict UNVERIFIED, routing_eval: absent. Action: Author evals/comprehension.json with 7-8 scenarios (anomaly identification, level selection, cross-DB reasoning) and evals/application.json with 5-7 cases (including at least one write-skew hard negative).

### webhook-integration
Path: /Users/jacobbalslev/Development/skills/skills/backend-engineering/webhook-integration/SKILL.md
Content score: 79 (C)
Eval readiness score: 14 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] grounding/provenance: Provenance label disagrees with declared schema: skill_graph_protocol says 'v5' while skill conforms to Metadata Protocol v8, undermining truth-source trust. Evidence: skill_graph_protocol: Skill Metadata Protocol v5 vs schema_version 8 framing Action: Reconcile provenance label to the actual protocol version via export pipeline.
- [LOW] content-consistency: Top-level relations.verify_with lists 'cron-scheduling' absent from metadata.relations, and 'documentation' appears in Do-NOT-Use table but not anti_examples, creating routing drift. Evidence: verify_with adds cron-scheduling; Do NOT table cites documentation skill Action: Align relations blocks and anti_examples with the Do-NOT-Use table.
- [INFO] mental-model: Exceptional depth on retry-code contracts prevents silent data loss. Evidence: Philosophy and Retry Contract sections. Action: None.
- [INFO] procedures: Concrete handler skeleton enforces correct ordering of verification and persistence. Evidence: Webhook Handler Skeleton section. Action: None.
- [MEDIUM] Relations consistency: Top-level relations includes cron-scheduling in verify_with but metadata JSON string omits it Evidence: Line 157 adds cron-scheduling; line 128 JSON object omits it Action: Synchronize both representations or remove the stale metadata JSON string
- [HIGH] metadata-structure: Two relations blocks exist: one string-encoded inside metadata (line 128) and one YAML object at top-level (line 155). Creates ambiguity about canonical source. Evidence: metadata string: related/verify_with; top-level adds cron-scheduling to verify_with. Action: Remove the legacy string-encoded relations inside metadata; keep only the top-level YAML relations block.
- [MEDIUM] content-scope: scope field (line 85) is an exact copy of description. Scope should state what the skill teaches, not restate routing signals. Evidence: Both fields contain identical text about inbound webhook handlers. Action: Rewrite scope as a PRD-style statement of coverage areas and boundaries.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/backend-engineering/webhook-integration/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: SKILL claims a shipped comprehension-eval artifact, but eval summary reports zero files and zero cases against a target of 10. Evidence: Evals section links webhook-integration.json; eval summary: files [], cases 0, assertions 0 Action: Author the referenced eval file with 10 cases (baseline, hard-neg, boundary, regression).
- [HIGH] eval-readiness: Zero evaluation cases provided despite metadata indicating presence. Evidence: Eval summary shows 0 cases. Action: Author 10+ evaluation cases.
- [HIGH] Eval artifact consistency: Audit status claims eval_artifacts: present but bundle eval summary found 0 files and 0 cases Evidence: Eval summary: files [] and cases 0; audit-state.json: eval_artifacts present Action: Reconcile audit-state.json with on-disk artifacts or downgrade to planned
- [HIGH] Eval certification readiness: No comprehension or application eval cases; both verdicts UNVERIFIED with no path to certification Evidence: 0 eval cases across all categories; comprehension/application verdicts both UNVERIFIED Action: Author comprehension (≥5) and application (≥5) eval cases per protocol
- [HIGH] eval-readiness: eval_artifacts claims present but zero eval cases exist. comprehension_verdict and application_verdict both UNVERIFIED, routing_eval absent. Evidence: Eval summary shows cases: 0, files: [], prompts: 0. Action: Author comprehension eval with 5+ cases covering signature verification, idempotency, retry contracts, and quarantine decisions.

### cap-theorem-tradeoffs
Path: /Users/jacobbalslev/Development/skills/skills/data-engineering/cap-theorem-tradeoffs/SKILL.md
Content score: 91 (A)
Eval readiness score: 14 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Condense duplicated prose; let body teach, frontmatter route.

Content findings:
- [INFO] content/grounding: Description and boundary are precise: P-not-optional, CP/AP dichotomy, PACELC, CAP-C vs ACID-C, plus four explicit anti-examples routing elsewhere. Evidence: Description NOT-clause + Do-NOT-Use table + worked CAP-C/ACID-C example Action: None; retain as exemplar boundary design.
- [LOW] content/redundancy: Body 'Concept' section reproduces mental_model, purpose, concept_boundary, analogy, and misconception nearly verbatim, inflating length without adding instructional value. Evidence: 238 lines; opening prose mirrors frontmatter Understanding fields Action: Condense duplicated prose; let body teach, frontmatter route.
- [INFO] content: Pedagogical depth is excellent, specifically the CAP-C vs ACID-C worked example. Evidence: SKILL.md utilizes a clear tabular comparison to resolve the most common industry misconception. Action: No change required; this is a high-signal content pattern.
- [MEDIUM] metadata: Stability label is mismatched with content quality. Evidence: Stability is marked 'experimental' despite high maturity and extensive literature sourcing. Action: Promote to 'stable' immediately after passing initial evaluation suite.
- [MEDIUM] content_redundancy: Body 'Concept of the skill' section restates all five Understanding fields from frontmatter as dense running prose Evidence: Lines 180-184 weave mental_model, purpose, concept_boundary, analogy, misconception into same block, duplicating lines 133-148 Action: Condense body to a distinct narrative arc, referencing frontmatter for detail
- [MEDIUM] export-compat: relations appears as both a top-level YAML key (line 170) and under metadata (line 130) — the duplicate may shadow the metadata copy during export or parsing. Evidence: Line 130: metadata.relations (JSON string). Line 170: top-level relations: (YAML block). Action: Remove the top-level relations block; the metadata.relations is the canonical surface per Skill Metadata Protocol v8.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/cap-theorem-tradeoffs/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval file exists (0 cases vs target 10); comprehension and application verdicts UNVERIFIED, eval_artifacts only 'planned', routing eval absent — skill is uncertified. Evidence: Eval summary cases:0, files:[]; audit eval_state unverified Action: Author ~10 cases: baseline, hard-negative (ACID-C), boundary (single-node), routing.
- [HIGH] eval-readiness: Absent hard-negatives mean confusable boundaries (transaction-isolation, replication-patterns, sharding) and the CA-claim trap are asserted but not test-gated against misrouting. Evidence: hardNeg:0, boundary:0, routing_eval absent Action: Add anti-example routing cases mirroring the four NOT-use rows.
- [HIGH] eval_readiness: Complete absence of evaluation test cases. Evidence: Eval summary shows 0 cases; audit summary confirms all application gates are unverified. Action: Author 10+ cases including adversarial prompts where systems claim CA property.
- [HIGH] eval_design: No comprehension or application evals exist; eval_artifacts is planned only Evidence: Eval summary: 0 cases, 0 prompts, 0 assertions; both comprehension and application verdicts UNVERIFIED Action: Author comprehension.json (≥5 scenarios) and application.json (≥5 cases including red herrings)
- [LOW] metadata_hygiene: skill_graph_protocol claims v5 while skill uses v8 features (flat Understanding fields, four-verdict Audit Status) Evidence: Line 155: 'Skill Metadata Protocol v5'; schema_version is 8 Action: Bump skill_graph_protocol to v8 to match actual content
- [HIGH] eval-readiness: No eval files exist despite eval_artifacts: planned and eval_state: unverified — comprehension and application certification is impossible. Evidence: eval summary: files [], cases 0, no comprehension.json or application.json on disk. Action: Author comprehension.json (≥5 cases) and application.json (≥5 cases, ≥1 red-herring) to enable certification.
- [MEDIUM] export-compat: skill_graph_protocol: Skill Metadata Protocol v5 is stale — the schema_version is 8 but the content-label claim was never advanced through the audit loop. Evidence: Line 155: skill_graph_protocol: Skill Metadata Protocol v5. Content is v8-quality (subject, scope, public, flat Understanding fields present). Action: Bump via /audit:improve or /audit:evolve after eval infrastructure lands; version labels must be earned not bumped.

### data-modeling-fundamentals
Path: /Users/jacobbalslev/Development/skills/skills/data-engineering/data-modeling-fundamentals/SKILL.md
Content score: 92 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Condense body prose; let tables/frontmatter carry detail.

Content findings:
- [INFO] grounding: Description, scope, mental_model, purpose, boundary, misconception, and anti-examples crisply scope theory vs. practice with named sibling owners and primary-source citations (Codd, Chen, Fagin). Evidence: Content: frontmatter + Key Sources + Do NOT Use table Action: Maintain; no content change needed.
- [LOW] clarity: 'Concept of the skill' prose verbatim concatenates mental_model+purpose+boundary+analogy+misconception into one wall of text, duplicating frontmatter and reducing scannability. Evidence: Content: §Concept repeats Understanding fields nearly word-for-word Action: Condense body prose; let tables/frontmatter carry detail.
- [INFO] Grounding: Exceptional scholarly grounding mapping historical literature to specific normalization steps and algebraic primitives. Evidence: 13 foundational citations (Codd, Chen, Fagin) mapped to 1NF-5NF and relational algebra. Action: Retain as gold standard for theory skills.
- [INFO] Boundary: Precise mechanistic separation between theory (this skill) and practical method (data-modeling) eliminates architectural ambiguity. Evidence: Concept_boundary defines theory as 'what' and data-modeling as 'how'. Action: Apply this theory/practice split across the data-engineering shelf.
- [INFO] content/grounding: Skill covers relational theory, normal forms, denormalization tradeoffs, and alternative models with thorough canonical references Evidence: 285-line SKILL.md with 14 foundational references, 4 comparison tables, 9-item verification checklist Action: Maintain this level of theoretical depth and practical verification in content reviews
- [LOW] content/description: Description exceeds recommended length and mixes about-statement with routing exclusions that duplicate anti_examples Evidence: 100+ word description combines 'Use when' activation with 'Do NOT use' routing also found in anti_examples Action: Shorten to a concise about-statement; routing belongs in anti_examples and relations.suppresses
- [MEDIUM] content: Description field (~1300 chars) exceeds the 1024-char marketplace limit. Will be truncated on skills.sh export. Evidence: Description text spans lines 63, approximately 1300 characters including exclusions. Action: Add an EXPORT_DESCRIPTION_OVERRIDES entry in export-marketplace-skills.js in the same change, or trim description to ≤1024 chars.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/data-modeling-fundamentals/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No eval artifacts: 0 cases vs target 10, no prompts/assertions/baseline/hard-negatives; comprehension and application verdicts UNVERIFIED, routing_eval absent. Evidence: Eval: cases=0, eval_artifacts=planned; audit comprehension/application UNVERIFIED Action: Author ≥10 cases incl. boundary + hard-negative routing against siblings.
- [HIGH] Eval Readiness: Zero realized evaluation cases or prompts prevents objective validation of activation or comprehension. Evidence: Audit summary reports 'planned' artifacts with 0 cases and 0 prompts. Action: Author 10+ eval cases covering normal forms and model tradeoffs.
- [HIGH] eval-readiness/cases: No comprehension or application eval cases exist despite declared eval_artifacts: planned Evidence: Eval summary shows 0 cases, 0 prompts, 0 expected; both verdicts are UNVERIFIED Action: Author 7-8 comprehension eval cases covering normal-form classification, FD closure, denormalization, and model tradeoffs
- [HIGH] eval-readiness: No comprehension or application eval cases exist — zero files, zero cases, zero prompts. Skill cannot be certified as effective for agent use. Evidence: Eval summary: files=[], cases=0, prompts=0. eval_state=unverified, both verdicts UNVERIFIED. Action: Author comprehension.json with ≥7 scenarios and application.json with ≥7 cases including hard negatives before any graded verdict.
- [MEDIUM] eval-readiness: skill_graph_protocol reads 'Skill Metadata Protocol v5' but schema_version is absent from the sidecar. Protocol label is stale — should reflect v8. Evidence: Line 155: skill_graph_protocol: Skill Metadata Protocol v5. Sidecar audit-state.json has no schema_version field. Action: Set schema_version: 8 in audit-state.json sidecar and advance skill_graph_protocol to v8 through the audit loop.

### database-migration
Path: /Users/jacobbalslev/Development/skills/skills/data-engineering/database-migration/SKILL.md
Content score: 92 (A)
Eval readiness score: 56 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Sharpen the code-review vs database-migration verification split in one anti-example.

Content findings:
- [LOW] content/boundary: Anti-examples and Do-NOT-Use table are crisp and name owning skills by mechanism, but 'review AI-generated DDL diff' routes to both code-review and is also a listed example, blurring one edge. Evidence: anti_examples includes 'review this AI-generated DDL diff' while Coverage claims verification ownership Action: Sharpen the code-review vs database-migration verification split in one anti-example.
- [INFO] Content: Exceptional coverage of lock-sensitive DDL patterns like shadow columns and NOT VALID foreign keys ensures production safety. Evidence: SKILL.md 'Common DDL Patterns' provide detailed SQL sequences for risky operations. Action: Retain content as a gold standard for technical depth.
- [HIGH] content accuracy: stability: experimental under-represents 507-line mature skill with PASS structural/truth verdicts Evidence: stability field = experimental on line 93; skill has PASS on both integrity gates Action: Set stability to at least stable or document why experimental is intentional
- [MEDIUM] relations completeness: DO NOT USE table references documentation and refactor as routing alternatives but neither appears in relations.* edges Evidence: Lines 559-568 list documentation and refactor; relations on line 140 lack both Action: Add documentation and refactor to relations.related for graph-consistent routing
- [MEDIUM] metadata_duplication: Top-level `relations` block duplicates `metadata.relations` — one copy should be removed to avoid drift. Evidence: Lines 114 (metadata.relations) and 139-142 (top-level relations) carry the same skill targets with slightly different formatting. Action: Remove the top-level `relations` block; keep the `metadata.relations` declaration.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/database-migration/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/database-migration/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface lacks hard negatives and expected assertions: 8 prompts but 0 expected, 0 assertions, 0 hardNeg, only 1 boundary. Cannot validate activation or anti-activation against the rich anti_examples set. Evidence: Eval summary: expected 0, assertions 0, hardNeg 0, boundary 1, cases 8 Action: Add hard-negative cases from anti_examples and per-case expected assertions.
- [MEDIUM] eval-readiness/audit-state: Comprehension and application verdicts are PROVISIONAL and eval_state is unverified with only 8/10 target cases, so certification evidence is incomplete despite structural/truth PASS. Evidence: Audit: comprehension PROVISIONAL, application PROVISIONAL, eval_state unverified; 8 cases vs target 10 Action: Run eval to verify cases, add 2 to reach 10, promote provisional verdicts.
- [HIGH] Eval Design: Eval artifact contains zero assertions or expected outputs, making automated scoring impossible despite having 8 defined prompts. Evidence: Eval summary reports 0 expected and 0 assertions for 8 cases. Action: Author expected response strings or regex assertions for all cases.
- [MEDIUM] Eval Design: Eval suite falls short of the 10-case target required for robust skill certification. Evidence: Eval summary indicates only 8 cases are present in comprehension.json. Action: Author 2 additional cases focusing on connection routing.
- [HIGH] eval design: 8 comprehension cases have 0 structured assertions — scoring is subjective and unreproducible Evidence: eval summary shows expected:0, assertions:0, hardNeg:0 Action: Add pass/fail assertions to each case and include at least 2 hard-negative boundary scenarios
- [HIGH] eval_structure: Comprehension eval has 8 cases but zero expected values, assertions, or baseline comparisons — grading requires these fields. Evidence: Eval summary: expected=0, assertions=0, baseline=0, hardNeg=0 despite 8 prompts. Action: Populate each eval case with expected answers, assertion checks, and negative expectations per comprehension-eval-spec.md.
- [MEDIUM] eval_lifecycle: eval_state is `unverified` and comprehension_verdict is PROVISIONAL — artifact exists but has never been graded. Evidence: audit-state.json shows eval_state: unverified, comprehension_verdict: PROVISIONAL, routing_eval: absent. Action: Run comprehension eval through the grader to advance verdict from PROVISIONAL; add routing_eval coverage.

### indexing-strategy
Path: /Users/jacobbalslev/Development/skills/skills/data-engineering/indexing-strategy/SKILL.md
Content score: 97 (A)
Eval readiness score: 61 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Let export pipeline refresh provenance label; no content edit needed.

Content findings:
- [LOW] grounding/provenance: Content is comprehensive and well-sourced with accurate boundaries, anti-examples, and a strong mental model; only minor stale provenance label (declares Protocol v5 under v8). Evidence: skill_graph_protocol: 'Skill Metadata Protocol v5' in export block Action: Let export pipeline refresh provenance label; no content edit needed.
- [INFO] content: Superior grounding in modern database features. Evidence: Includes PostgreSQL 18 skip-scans, UUIDv7 for index density, and pgvector 0.8 HNSW parallel builds. Action: Maintain this level of currency during future version bumps.
- [INFO] content: Excellent debunking of common industry myths. Evidence: Explicitly debunks 'most selective first' myth and 'hash indexes are unsafe' misconception. Action: No action needed; this provides high-signal guidance for agents.
- [MEDIUM] Description hygiene: Frontmatter description duplicates scope content instead of providing concise activation summary Evidence: description and scope fields contain nearly identical text Action: Write a shorter, distinct description focused on activation signals
- [LOW] Routing coverage: Skill is not verified in the routing harness Evidence: routing_eval is absent in audit-state.json Action: Include skill in routing eval and verify activation boundaries

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 13 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/indexing-strategy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-design: Eval cases declare zero expected outputs and zero assertions, so no case can be graded pass/fail — the suite cannot certify comprehension or application. Evidence: eval summary: expected 0, assertions 0 across 13 cases Action: Add expected answers/rubric assertions to each prompt so cases are gradable.
- [MEDIUM] eval-readiness: Comprehension and application verdicts are UNVERIFIED, eval_state unverified, and routing_eval absent; the skill has artifacts but no passing run or activation coverage. Evidence: audit: comprehension/application UNVERIFIED, eval_state unverified, routing_eval absent Action: Run comprehension+application evals and add a routing eval to verify activation.
- [MEDIUM] eval_readiness: Eval artifacts appear structurally incomplete. Evidence: Eval summary reports 13 cases but 0 assertions and 0 expected outputs. Action: Populate objective verification criteria (assertions) in both JSON eval files.
- [HIGH] Eval design: Eval cases lack expected outputs and assertions for automated grading Evidence: 0 expected outputs and 0 assertions across 13 eval cases Action: Add expected_output assertions to each case and run eval gate
- [MEDIUM] eval-readiness: comprehension_state is not declared present despite all five Understanding fields being fully populated. Evidence: audit-state.json shows no comprehension_state; SKILL.md metadata block lacks comprehension_state: present. Action: Set comprehension_state: present in the sidecar to match the authored Understanding fields.
- [MEDIUM] eval-readiness: Both comprehension and application eval artifacts exist but eval_state remains unverified — no eval has been run. Evidence: eval_state: unverified, comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED despite 13 cases across two eval files. Action: Run comprehension and application evals through the audit loop to stamp honest verdicts.
- [LOW] eval-readiness: skill_graph_protocol label reads 'Skill Metadata Protocol v5' while schema_version is 8 — content-label lag. Evidence: skill_graph_protocol: Skill Metadata Protocol v5 in frontmatter; schema is v8. Action: Advance the content label to v8 through the audit loop after confirming Understanding-field and classification content is complete.

### observability-modeling
Path: /Users/jacobbalslev/Development/skills/skills/data-engineering/observability-modeling/SKILL.md
Content score: 81 (B)
Eval readiness score: 17 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [LOW] grounding: In-file provenance label contradicts the v8 schema the skill conforms to, undermining metadata trust. Evidence: skill_graph_protocol: 'Skill Metadata Protocol v5' while schema_version is 8. Action: Reconcile export provenance label to the actual conformed protocol version.
- [INFO] clarity: Exceptional scope clarity and differentiation from confusable disciplines like debugging and error-tracking. Evidence: Comprehensive description and Do-NOT-Use exclusion table. Action: None; content is release-ready.
- [MEDIUM] content_accuracy: skill_graph_protocol claims v5 but metadata uses v8 fields (subject, subjects, scope). Evidence: Line 141: v5 label; lines 81-87 show v8 classification fields. Action: Update skill_graph_protocol to v8 to match deployed field shape.
- [MEDIUM] metadata-encoding: Relations declared twice: JSON-encoded string in metadata block and proper YAML relations block at bottom with divergent values. Evidence: Line 129 has JSON string with verify_with: [error-tracking, debugging]; line 158 adds performance-budgets. Action: Remove the JSON-encoded relations string from metadata block; keep the proper YAML relations block.
- [LOW] version-labels: skill_graph_protocol claims v5, outdated versus current v8 contract. Evidence: Line 141: skill_graph_protocol: Skill Metadata Protocol v5. Action: Update to Skill Metadata Protocol v8 or remove if export-provenance not yet stamped by pipeline.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/observability-modeling/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: SKILL.md claims a comprehension-eval artifact, but the eval surface contains zero cases/prompts/assertions versus the target of 10. Evidence: Eval summary: cases 0, files [], assertions 0; body links examples/evals JSON. Action: Author ≥10 cases: baseline, hard-negative, and boundary prompts with expected signals.
- [MEDIUM] certification: Comprehension and application verdicts are UNVERIFIED, so usefulness is unproven despite structural/truth PASS and declared eval artifacts. Evidence: Audit: comprehension UNVERIFIED, application UNVERIFIED, eval_state unverified, routing_eval absent. Action: Run comprehension + application graders and add routing eval to certify.
- [HIGH] readiness: Skill cannot be certified or verified due to zero existing test cases despite the linked path. Evidence: Static summary reports zero cases and zero files. Action: Author 10 Agent Skills-style cases.
- [MEDIUM] metadata: Metadata incorrectly claims eval artifacts are present, creating a false readiness signal. Evidence: eval_artifacts metadata field vs static summary. Action: Set eval_artifacts to planned until cases exist.
- [HIGH] eval_readiness: No comprehension or application eval artifacts exist despite eval_artifacts:present claim. Evidence: Eval summary shows 0 cases, 0 prompts, 0 assertions; both verdicts UNVERIFIED. Action: Author comprehension.json (≥5 cases) and application.json (≥5 cases) per spec.
- [INFO] eval_readiness: Body references an eval file at examples/evals/observability-modeling.json not present locally. Evidence: Line 188 links external eval; local eval summary shows 0 files and 0 cases. Action: Create local eval files or remove the stale body reference.
- [HIGH] eval-artifact-honesty: eval_artifacts: present but no eval files exist on disk (files: [], cases: 0). Evidence: Audit summary shows eval_artifacts: present; eval summary shows zero files/cases/assertions. Action: Either create comprehension.json with 5+ cases or downgrade eval_artifacts to planned.

### query-optimization
Path: /Users/jacobbalslev/Development/skills/skills/data-engineering/query-optimization/SKILL.md
Content score: 97 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Advance stability to stable after first successful eval run.

Content findings:
- [INFO] content/grounding: SKILL.md is diagnosis-led with strong boundaries, anti-examples, mental model, plan-node catalog, and cross-engine truth sources; description activation is precise and well-scoped. Evidence: 252 lines; 30+ vendor truth_sources; explicit Do-NOT-Use handoffs to 5 sibling skills. Action: None; treat as content reference exemplar.
- [INFO] content/procedure: Masterclass-level procedural depth with engine-specific diagnostic tables, evidence ladders, and a comprehensive root-cause-to-response catalog. Evidence: SKILL.md Evidence Capture Ladder, Plan-Node Catalog, and Root Cause tables Action: None; preserve this as a gold standard for technical skills.
- [MEDIUM] content/metadata: stability: experimental label contradicts the mature, high-fidelity content and exhaustive vendor-specific grounding. Evidence: Frontmatter line 24: stability: experimental; SKILL.md contains 252 lines of expert-grade instruction. Action: Advance stability to stable after first successful eval run.
- [LOW] description convention: Description starts with 'Use when' (activation trigger) rather than short about-statement per v8 convention Evidence: 158-word description overlaps scope prose; activation signals belong in keywords/triggers Action: Trim description to concise about-statement; move activation prose to keywords/triggers
- [MEDIUM] content_procedure: Verification checklist has 16 items with no priority ordering — all items appear equally weighted. Evidence: Verification section (lines 256-274) lists 16 checkbox items without criticality tiers or sequencing. Action: Group items into must-have / should-have / nice-to-have tiers or add a recommended order.
- [LOW] content_structure: Mental model and purpose fields are thorough but dense — 10+ sentence blocks may reduce scannability for agents. Evidence: mental_model (lines 77-80) and purpose (lines 81-82) are multi-paragraph; procedure (lines 150-163) is 9 steps. Action: Consider breaking mental_model into shorter paragraphs or adding inline headers for sub-concepts.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/query-optimization/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface is empty: 0 cases, 0 prompts, 0 assertions, no baseline/hardNeg/boundary/regression cases against a target of 10. Comprehension and application verdicts are UNVERIFIED. Evidence: Eval summary cases:0, files:[]; audit eval_artifacts:'planned', eval_state:'unverified'. Action: Author 10 cases incl. boundary vs indexing-strategy and hard negatives.
- [MEDIUM] eval-readiness/routing: Routing eval absent despite a dense suppress/verify_with graph and high mis-route risk with indexing-strategy, data-modeling, performance-testing. Evidence: Audit routing_eval:'absent'; relations declare suppresses indexing-strategy. Action: Add routing cases asserting selection over the four adjacent skills.
- [HIGH] eval-readiness: Zero executable eval cases, prompts, or assertions exist against target of 10; audit state remains unverified. Evidence: Eval summary cases:0; audit_state application_verdict:UNVERIFIED Action: Author 10+ eval cases in evals.json covering PG/SQL Server/MySQL plan-reading scenarios.
- [MEDIUM] eval readiness: No comprehension or application evals exist; 0 cases prevents graded verdict Evidence: eval summary: cases=0, eval_artifacts: planned Action: Author evals/comprehension.json ≥5 cases and evals/application.json ≥5 cases
- [MEDIUM] routing eval: Skill not included in routing eval baseline; retrieval placement unverified Evidence: routing_eval: absent per audit summary Action: Include skill in next routing eval sweep against retrieval baseline
- [HIGH] eval_readiness: No comprehension or application eval cases exist — eval summary shows 0 files, 0 cases, 0 prompts. Evidence: Eval summary: cases:0, files:[], comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED. Action: Author 5+ comprehension and 5+ application eval cases per the eval spec.

### replication-patterns
Path: /Users/jacobbalslev/Development/skills/skills/data-engineering/replication-patterns/SKILL.md
Content score: 91 (A)
Eval readiness score: 58 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Keep this standard of technical grounding for related skills.

Content findings:
- [INFO] content/mental-model: SKILL.md gives clear topology/synchrony/mechanism decomposition with strong boundary and misconception sections distinguishing replication from sharding, CAP, ACID. Evidence: Boundary names mechanism differences; tables for topology/synchrony/RAW/failover. Action: None; content is publish-ready.
- [MEDIUM] content_clarity: Superb boundary definitions use mechanism-level distinctions rather than simple labels. Evidence: SKILL.md correctly separates replication from sharding by data identity (same vs different). Action: Keep this standard of technical grounding for related skills.
- [LOW] discoverability: Keywords omit major technology identifiers used in the text. Evidence: Raft, Paxos, and Cassandra are in the mental model but missing keywords. Action: Add specific consensus and database names to the keywords list.
- [MEDIUM] lifecycle-accuracy: stability: experimental label mismatches the mature, complete content with concrete tables, verification checklist, and authoritative sources. Evidence: stability field reads experimental but skill has 250+ lines of production-ready reference content Action: Advance stability to stable after eval certification completes.
- [MEDIUM] content: skill_graph_protocol: v5 is stale vs current contract; content-label claim does not match schema_version era. Evidence: Line 137: skill_graph_protocol: Skill Metadata Protocol v5. Action: Advance to v8 via audit loop when content migration lands.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 13 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/replication-patterns/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface: 13 cases carry 0 expected answers and 0 assertions, so comprehension/application cases are ungradeable and verdicts stay PROVISIONAL. Evidence: Eval summary expected:0, assertions:0; verdicts PROVISIONAL/UNVERIFIED. Action: Add expected outputs/assertions to each case to enable scoring.
- [MEDIUM] eval-readiness/routing: Eval surface lacks routing eval and positive baseline cases; only 1 boundary case against 10 hard negatives skews toward suppression over activation. Evidence: routing_eval absent; baseline:0, boundary:1, hardNeg:10. Action: Add routing/activation cases plus positive baselines balancing the negatives.
- [HIGH] eval_readiness: The eval suite lacks all ground truth validation logic. Evidence: Eval summary shows 0 expected outputs and 0 assertions across 13 cases. Action: Author expected response strings or assertions for all cases.
- [HIGH] eval-certification: Eval artifacts present (13 cases) but eval_state is unverified — no graded run confirms the skill changes agent behavior. Evidence: comprehension_verdict PROVISIONAL, application_verdict PROVISIONAL, eval_state unverified Action: Run graded eval passes to certify comprehension and application verdicts.
- [MEDIUM] routing-eval-coverage: routing_eval is absent — the skill has not been tested against the retrieval baseline, risking incorrect routing or overshadowing. Evidence: routing_eval field reads absent Action: Include in next routing eval sweep against data-engineering query set.
- [HIGH] eval_readiness: eval_state: unverified with no eval_last_run receipt; PROVISIONAL verdicts lack evidence backing. Evidence: audit-state.json eval_state: unverified; comprehension_verdict and application_verdict both PROVISIONAL. Action: Run comprehension and application evals; record eval_last_run receipts; advance eval_state to passing or monitored.
- [HIGH] eval_readiness: routing_eval: absent; skill has never been included in a routing eval against the retrieval baseline. Evidence: audit-state.json routing_eval: absent. Action: Include skill in routing eval; record result and flip routing_eval to present.

### schema-evolution
Path: /Users/jacobbalslev/Development/skills/skills/data-engineering/schema-evolution/SKILL.md
Content score: 96 (A)
Eval readiness score: 61 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Evaluate upgrading to stable label to match observable content evidence

Content findings:
- [INFO] content/grounding: SKILL.md gives a rigorous expand/migrate/contract model with explicit boundary gates, per-change matrix, cross-engine table, and cited truth sources. Evidence: Mental model, lock-queue section, 18+ truth_sources, anti_examples, suppresses with mechanism reasons. Action: None; content is publication-grade.
- [INFO] content: Comprehensive mental model covers expand/contract, compatibility envelopes, and engine-specific lock hazards with exceptional clarity. Evidence: Section 2.1 and Phase diagrams provide detailed cross-engine and application-layer safety rules. Action: Maintain current content depth as a reference standard for data-engineering skills.
- [LOW] content-signal: stability: experimental understates maturity — 17 truth sources, complete boundary gates, thorough mental model Evidence: stability field set experimental despite production-quality depth Action: Evaluate upgrading to stable label to match observable content evidence

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/schema-evolution/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/schema-evolution/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval/coverage: Eval has 8 cases vs target 10, only 1 boundary, and 0 hard-negative cases probing the four anti_examples (database-migration, data-modeling, query-optimization, sharding). Evidence: Eval summary: cases 8, hardNeg 0, boundary 1, baseline 0. Action: Add 2+ cases including hard negatives that must route elsewhere to test boundary discipline.
- [MEDIUM] eval/audit-state: Audit truth, comprehension, and application verdicts are all UNVERIFIED with no assertions or routing eval, so certification evidence is absent. Evidence: Audit summary: truth/comprehension/application UNVERIFIED; assertions 0; routing_eval absent. Action: Run truth+comprehension verification and add assertion-backed cases before certifying.
- [MEDIUM] eval_readiness: The evaluation suite contains 8 cases, which is below the Agent Skills target of 10 for readiness. Evidence: Eval summary shows 8 cases, 8 prompts, 8 expected results. Action: Add 2 high-complexity cases covering multi-step renames or partitioned table indexing.
- [MEDIUM] eval_readiness: Evaluation artifact contains zero assertions, reducing the reliability of automated pass/fail verification. Evidence: Eval summary reports 0 assertions for comprehension.json. Action: Integrate regex or model-graded assertions into comprehension.json cases.
- [MEDIUM] eval-design: No hard-negative/red-herring cases (0 hardNeg) — cannot detect over-triggering on scope boundaries Evidence: 8 comprehension cases, 0 hardNeg, 0 baseline Action: Add ≥2 hard-negative cases testing boundary with database-migration
- [MEDIUM] eval-rigor: No assertions or baseline arm — grader judgment replaces structured pass/fail criteria Evidence: 0 assertions, 0 baseline across 8 eval prompts Action: Add per-case assertions and ≥2 baseline cases for lift measurement

Blockers:
- mimo: exit 0

### sharding-strategy
Path: /Users/jacobbalslev/Development/skills/skills/data-engineering/sharding-strategy/SKILL.md
Content score: 91 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Reconcile export-provenance protocol label to v8 during next audit pass.

Content findings:
- [MEDIUM] grounding/provenance: Content provenance label is stale and inconsistent with the declared contract, risking confusion about which protocol the skill conforms to. Evidence: skill_graph_protocol: 'Protocol v5' while schema_version is 8 and v8 fields present. Action: Reconcile export-provenance protocol label to v8 during next audit pass.
- [LOW] reusable-procedure: Understanding fields (mental_model/purpose/boundary/analogy/misconception) are reproduced near-verbatim in body prose, inflating length without adding new procedure. Evidence: Concept/Philosophy sections duplicate frontmatter paragraphs almost word-for-word. Action: Trim body prose to reference or condense the Understanding fields, keeping tables/checklists.
- [LOW] content-density: The distinction between sharding and replication is repeated with high redundancy across four separate understanding fields. Evidence: Instructional text in purpose, boundary, analogy, and misconception all define the sharding-vs-replication split. Action: Consolidate the definition into the concept_boundary to reduce noise in purpose and misconception sections.
- [LOW] mental-model: The mental model explains consistent hashing well but omits 'virtual nodes,' a critical refinement for avoiding imbalance in hash rings. Evidence: Text covers the hash ring and 1/N movement but excludes the mechanism for handling node heterogeneity. Action: Include a brief mention of virtual nodes/tokens as the standard solution for balance and heterogeneity.
- [MEDIUM] content_scope: description and scope fields contain byte-identical content; scope should be a PRD-style statement, not a copy of description. Evidence: Both fields: 'Use when reasoning about horizontal partitioning…' — exact match across two required fields. Action: Re-author scope as a concise PRD-style statement of what the skill teaches, distinct from the routing description.
- [MEDIUM] content_version_label: skill_graph_protocol claims v5 but skill carries v8 classification fields (subject, public, scope, taxonomy_domain). Evidence: Line 154: 'Skill Metadata Protocol v5'. Line 78: subject. Line 80: public. Line 82: scope. Line 88: taxonomy_domain. Action: Update skill_graph_protocol to reflect the actual v8 content, or downgrade fields if v5 was intentional.
- [MEDIUM] metadata_consistency: skill_graph_protocol: Skill Metadata Protocol v5 while schema_version and version fields are absent from frontmatter metadata block. Evidence: metadata block lines 69-72 show schema_version and version as comments only; skill_graph_protocol: v5 on line 154 Action: Add schema_version: 8 and skill_graph_protocol: v8 to metadata; bump to match current protocol contract
- [LOW] structural: scope and description are character-identical text; scope should state what the skill teaches without the Do NOT use routing exclusions. Evidence: description line 63 and metadata.scope line 82 are identical long strings; routing exclusions belong in anti_examples/relations.suppresses Action: Shorten scope to the positive teaching statement; keep negative routing in anti_examples and relations.suppresses where they already live

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/data-engineering/sharding-strategy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval surface is empty: 0 cases against target of 10, no prompts/assertions, no baseline or hard-negative coverage, routing_eval absent. Evidence: Eval summary cases:0, files:[]; audit routing_eval:absent, application UNVERIFIED. Action: Author 10 eval cases incl. boundary/hard-negatives and a routing case; run to APPLICABLE.
- [HIGH] eval-readiness: The skill contains zero evaluation cases, prompts, or assertions, preventing any automated verification of agent comprehension. Evidence: Eval summary shows cases: 0, prompts: 0. Action: Author at least 10 evaluation cases covering shard-key selection and resharding trade-offs.
- [HIGH] eval_readiness: No eval artifacts exist despite eval_artifacts:planned; cannot certify comprehension or application verdicts. Evidence: Eval summary shows 0 files, 0 cases, 0 prompts. Both verdicts UNVERIFIED. Action: Author comprehension.json (≥5 cases) and application.json (≥5 cases with ≥1 hard negative).
- [HIGH] eval_design: Zero comprehension or application eval cases; eval_artifacts: planned, eval_state: unverified. No evidence the skill teaches anything. Evidence: cases:0, prompts:0, expected:0, comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED Action: Create comprehension.json with ≥7 scenarios covering partitioning schemes, shard-key selection, failure modes, and cross-shard trade-offs

### color-system-design
Path: /Users/jacobbalslev/Development/skills/skills/design/color-system-design/SKILL.md
Content score: 91 (A)
Eval readiness score: 58 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Transition stability from experimental to stable once evaluation gaps are addressed.

Content findings:
- [INFO] content/mental-model: SKILL.md gives a crisp 3-layer-plus-pairing-matrix model, sharp boundaries vs theme/dark-mode/a11y siblings, and concrete role/contrast procedures. Evidence: Concept, step-role table, pairing matrix, APCA vs WCAG discipline all present. Action: None; preserve grounding and boundary precision on edits.
- [INFO] Content Depth: Exceptional technical depth regarding perceptual color spaces (OKLCH) and W3C DTCG standards ensures the skill remains relevant for modern frontend and design workflows. Evidence: Extensive sections on gamut mapping, relative color syntax, and DTCG 2025-10-28 format. Action: Transition stability from experimental to stable once evaluation gaps are addressed.
- [INFO] content_quality: Exceptional depth on perceptual color spaces, WCAG compliance, token architecture, and CVD — one of the library's strongest skills Evidence: 296-line body with detailed palette method, pairing matrix, forced-colors treatment, DTCG interchange, and 16 verifiable criteria (L329-345) Action: Maintain as reference specimen for depth-of-coverage standard

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is REDUNDANT, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/color-system-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness/audit-state: Eval surface: artifacts present but truth_verdict UNVERIFIED and eval_state unverified despite 20+ truth sources, so claims are unproven for certification. Evidence: Audit: truth UNVERIFIED, eval_state unverified, routing_eval absent. Action: Run truth verification and a routing eval before certifying.
- [MEDIUM] eval-readiness/case-coverage: Eval surface: 15 cases but only 1 hard-negative, 2 boundary, 0 regression, 0 assertions/baseline — thin discrimination given rich confusable sibling territory. Evidence: hardNeg 1, boundary 2, regression 0, assertions 0. Action: Add hard negatives per sibling and regression cases toward 10-quality target.
- [HIGH] Eval Readiness: Evaluation readiness is severely degraded by the total absence of assertions, making it impossible to programmatically verify if agents are following the complex procedures. Evidence: Eval summary reports 0 assertions across 15 cases. Action: Implement granular assertions for all test cases in application.json.
- [MEDIUM] Routing: The lack of a dedicated routing evaluation means the activation triggers and keywords are unverified for retrieval accuracy against adjacent design skills. Evidence: Audit summary identifies routing_eval as absent. Action: Create a routing-eval.json to benchmark recall and precision.
- [HIGH] eval_readiness: 15 eval cases present but all verdicts are UNVERIFIED/SKIPPED/REDUNDANT with no assertions or baselines Evidence: structural_verdict=PASS, truth_verdict=UNVERIFIED, comprehension_verdict=SKIPPED_BASELINE_HIGH, application_verdict=REDUNDANT, eval_state=unverified (L53-58) Action: Add assertions and baselines; run grader to advance verdicts
- [MEDIUM] eval_certification: Skill not yet included in retrieval baseline or routing evaluation Evidence: Audit summary routing_eval=absent (L59) Action: Register in routing eval baseline and run retrieval pass
- [HIGH] eval_design: Only 1 hard-negative case across 15 total eval cases — red-herring / over-triggering coverage is below the recommended floor for a skill with multiple sibling overlap risks. Evidence: hardNeg: 1 in eval summary; application.json has one red_herring case. Action: Add 2–3 more red-herring cases targeting theme-system-design and dark-mode-implementation confusables.
- [MEDIUM] audit_consistency: application_verdict: REDUNDANT alongside comprehension_verdict: SKIPPED_BASELINE_HIGH is internally inconsistent — if the skill is truly redundant, comprehension should also reflect that; if it is not, REDUNDANT is wrong. Evidence: audit-state.json: application_verdict REDUNDANT, comprehension_verdict SKIPPED_BASELINE_HIGH, eval_state: unverified. Action: Reconcile the two behavior verdicts through an eval run; downgrade to UNVERIFIED if no assessment evidence exists.
- [MEDIUM] eval_design: No routing_eval evidence — routing_eval: absent means no retrieval baseline entry, so the skill cannot be certified for routing correctness against sibling suppressions. Evidence: audit-state.json routing_eval: absent; routing baseline not included in eval summary. Action: Include skill in the next routing eval sweep and record routing_eval: present with a baseline receipt.

### component-architecture
Path: /Users/jacobbalslev/Development/skills/skills/design/component-architecture/SKILL.md
Content score: 92 (A)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Push version-specific ref notes to truth_sources and keep body framework-neutral.

Content findings:
- [LOW] grounding: Content embeds React-19-version-specific ref guidance, a self-declared staleness failure mode that dates an otherwise framework-agnostic skill. Evidence: SKILL.md ref row + failure_modes:ref_guidance_stale_for_react_19 Action: Push version-specific ref notes to truth_sources and keep body framework-neutral.
- [HIGH] content: The 'four questions' mental model provides a highly effective, actionable framework for immediate architectural reasoning. Evidence: Mental model section and structured tables for Layer, API, State, and Theming. Action: Template this structure for other architectural skills.
- [INFO] content: Grounding successfully synthesizes modern component patterns with foundational software engineering principles like Open-Closed. Evidence: Key Sources list Radix alongside Atomic Design and Liskov. Action: Maintain this level of theoretical and practical grounding.
- [MEDIUM] classification/stability: stability: experimental contradicts content maturity — the skill is well-structured with clear mental model, verification checklist, and comprehensive coverage Evidence: stability: experimental in metadata; content reads production-ready beyond Phase 1 Action: Advance stability to stable after first comprehension eval pass
- [LOW] grounding/truth: Grounding relies entirely on volatile web URLs with no recorded hashes and truth_verdict: UNVERIFIED Evidence: All 6 truth_sources are external URLs; no drift hashes recorded for drift detection Action: Consider recording truth_source_hashes or accepting UNVERIFIED as correct for universal-mode skill
- [LOW] content-accuracy: stability is experimental but the skill covers well-established architectural patterns (layering, open-closed principle, compound components) with authoritative sources and no open design questions. Evidence: stability: experimental in frontmatter; body references 1988–2024 sources with no unresolved design space. Action: Evaluate whether the skill is stable (production-ready) and bump stability if the content is settled.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is REDUNDANT, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/component-architecture/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: 15 cases carry 0 assertions, so no case is machine-checkable; grading must be manual and non-reproducible. Evidence: Eval summary: assertions:0 across application.json + comprehension.json Action: Add per-case assertions (expected layer/contract/pattern strings) to make outcomes verifiable.
- [MEDIUM] eval-certification: Application eval flagged REDUNDANT and all truth/comprehension/application verdicts UNVERIFIED, blocking certification despite present artifacts. Evidence: Audit summary: application_verdict REDUNDANT, eval_state unverified Action: Replace redundant application cases with distinct scenarios, then run verification to clear UNVERIFIED states.
- [MEDIUM] eval: Total lack of assertions across 15 cases prevents reliable automated grading and regression detection. Evidence: Eval summary shows 15 cases but 0 assertions. Action: Implement regex or key-value assertions for architectural requirements.
- [MEDIUM] eval/certification: application_verdict: REDUNDANT with eval_state: unverified — eval design doesn't demonstrate unique skill value vs alternatives Evidence: 15 cases but 0 assertions, 0 baseline, and REDUNDANT verdict with unverified state Action: Run comprehension eval to establish baseline; resolve REDUNDANT with fresh application eval
- [HIGH] eval-certification: application_verdict is REDUNDANT and comprehension_verdict is UNVERIFIED; no graded verdict has evidence backing it, so the skill cannot be certified as behavior-changing. Evidence: audit-state.json shows application_verdict: REDUNDANT, comprehension_verdict: UNVERIFIED, eval_state: unverified. Action: Run application eval with a frontier grader to obtain a non-REDUNDANT graded verdict or downgrade to honest UNVERIFIED.
- [MEDIUM] eval-artifact: comprehension_state is not declared in frontmatter despite all five Understanding fields being populated, so the lint gate cannot verify the Understanding-fields contract is met. Evidence: SKILL.md frontmatter lacks comprehension_state key; mental_model, purpose, concept_boundary, analogy, misconception are all present. Action: Add comprehension_state: present to the frontmatter metadata block to activate the Understanding-fields lint gate.

### dark-mode-implementation
Path: /Users/jacobbalslev/Development/skills/skills/design/dark-mode-implementation/SKILL.md
Content score: 81 (B)
Eval readiness score: 56 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] technical_depth: High-precision mental model. Comprehensive coverage of platform primitives like light-dark() and meta theme-color ensures high-signal technical guidance for complex runtime integrations. Evidence: SKILL.md Mental Model and Coverage sections detailing five technical concerns. Action: Maintain this level of technical depth.
- [INFO] boundaries: Exceptional boundary clarity. Explicitly separates runtime implementation from palette selection and multi-theme architecture, ensuring accurate router behavior and reducing overlap. Evidence: Concept Boundary and suppresses relation for color-system-design. Action: Keep these distinctions in updates.
- [HIGH] grounding: No truth_sources declared despite teaching web-platform primitives with known specs (CSS Color Module Level 5, prefers-color-scheme, color-scheme). Evidence: SKILL.md § Grounding absent; body cites `light-dark()`, `color-scheme`, `prefers-color-scheme` without spec anchors. Action: Add truth_sources pointing to relevant W3C/WHATWG specs.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/dark-mode-implementation/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval_readiness: Missing evaluation assertions. While the case count is high, the absence of structured grading criteria prevents automated validation of agent performance. Evidence: Eval summary showing 0 assertions and 0 baseline for 15 cases. Action: Implement structured assertions for all cases.
- [MEDIUM] eval design: Eval suite has zero hard-negative / red-herring cases across 15 total cases. Evidence: Pre-score eval summary: hardNeg: 0, boundary: 2, regression: 0. Action: Add at least one hard-negative case per eval file to catch over-triggering.
- [MEDIUM] eval certification: All four Audit Status verdicts are UNVERIFIED; no eval receipt evidence for comprehension or application. Evidence: audit-state.json: comprehension_verdict UNVERIFIED, application_verdict UNVERIFIED, eval_state unverified. Action: Run evaluate --mode comprehension and evaluate --mode application to earn graded verdicts.

Blockers:
- opus: exit 0
- mimo: exit 0

### design-module-composition
Path: /Users/jacobbalslev/Development/skills/skills/design/design-module-composition/SKILL.md
Content score: 83 (B)
Eval readiness score: 52 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [LOW] content/boundary: Description and concept_boundary cleanly delineate composition from architecture, styling, a11y, and single-use components by naming the differing mechanism, not just labels. Evidence: concept_boundary names frontend-architecture, design-system-architecture, a11y owners Action: None; retain as model boundary exemplar.
- [INFO] content: Excellent mental model clarity and pattern coverage Evidence: Detailed breakdown of compound components, slots, and headless patterns in frontmatter Action: Maintain current content depth as baseline
- [MEDIUM] Description activation: Description catalogs patterns instead of stating the design problem composition solves for crispest activation Evidence: Opens with 'composition patterns, compound components, slot/children APIs' — a list, not a trigger Action: Front-load activation: 'Choose between configuration props and compositional patterns for a component API'
- [MEDIUM] content: Coverage and Concept-of-the-skill sections substantially overlap with mental_model and purpose fields, wasting body tokens on redundant exposition. Evidence: Body lines 130-148 repeat the four-pattern taxonomy already stated in mental_model (lines 114-115) and purpose (lines 117-118). Action: Collapse body into one concise synthesis that references the frontmatter Understanding fields instead of restating them.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/design-module-composition/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval has zero hard negatives and zero assertions despite confusable adjacent skills; only 2 boundary cases, so anti-routing and verification grounding are untested. Evidence: hardNeg 0, assertions 0, boundary 2 of 15 cases Action: Add hard-negative cases for a11y/styling/architecture near-misses plus assertions.
- [MEDIUM] audit-state: Audit-state present but truth, comprehension, and application verdicts all UNVERIFIED and routing_eval absent, so certification evidence is incomplete. Evidence: truth/comprehension/application UNVERIFIED; routing_eval absent Action: Run comprehension/application/truth verification and add routing eval.
- [HIGH] eval_readiness: Eval suite lacks functional assertions for grading Evidence: Eval summary reports 0 assertions across 15 cases and 8 prompts Action: Add LLM-gradable assertions to all application cases
- [MEDIUM] provenance: Audit state remains unverified across all functional dimensions Evidence: Audit summary shows UNVERIFIED for truth, comprehension, and application verdicts Action: Conduct expert grounding review to verify truth state
- [HIGH] Eval robustness: Eval suite has zero hard-negative cases — no guard against over-triggering on single-use or visual-style tasks Evidence: eval summary shows hardNeg: 0, baseline: 0, assertions: 0 across 15 cases Action: Add at least 2 red_herring:true hard-negative cases to the application eval
- [MEDIUM] Routing evidence: Public dev-facing design skill with no routing eval presence — cannot verify it fires for the right queries Evidence: audit-state.json shows routing_eval: absent; comprehension_verdict and application_verdict both UNVERIFIED Action: Include skill in routing eval baseline and run comprehension eval to certify coverage
- [HIGH] eval_design: Application eval has zero hard-negative red-herring cases — a skill that teaches when NOT to compose needs at least one prompt that should NOT activate. Evidence: Static facts: hardNeg: 0, boundary: 2 only. Eval summary confirms no red_herring cases. Action: Add ≥1 red_herring case in application.json — e.g. a single-use feature component where composition adds unnecessary complexity.
- [MEDIUM] eval_coverage: Verification section defines 7 concrete checks but none map to eval cases, leaving gate-9 grader with no observable skill-specific expectations. Evidence: Verification lines 151-157 enumerate boolean-prop count, context error, asChild behavior — not reflected in application.json expected_flags. Action: Port verification criteria into application.json expected_flags and expected_fix_hints for at least 3 cases.

### design-thinking
Path: /Users/jacobbalslev/Development/skills/skills/design/design-thinking/SKILL.md
Content score: 83 (B)
Eval readiness score: 53 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/grounding: SKILL.md gives strong stage-recognition model, non-linearity principle, and named canonical sources (d.school, Double Diamond, IDEO, Sprint) with clear routing boundaries. Evidence: mental_model, concept_boundary, Do NOT Use When enumerate 7 siblings + event-storming. Action: Keep; trim Concept/Coverage overlap to reduce restated prose.
- [INFO] clarity: Superior mental model for orchestration versus single-stage execution. Evidence: Analogy section and 'orchestration layer' purpose description define boundaries clearly. Action: Ensure sibling skills reference this meta-skill for context.
- [HIGH] content: No formal grounding.truth_sources block links to canonical references cited in body (d.school, Double Diamond, IDEO). Evidence: Body cites d.school five stages, Double Diamond, IDEO, Design Sprint; truth_verdict is UNVERIFIED. Action: Add grounding.truth_sources with URLs or permanent IDs for each cited source.
- [MEDIUM] content: stability: experimental understates maturity; complete Understanding fields and relations graph suggest stable. Evidence: All five flat Understanding fields populated; relations graph with 9 siblings and a suppresses edge; 104-line body with verification section. Action: Consider upgrading stability to stable after truth-verification pass.
- [MEDIUM] content: No grounding truth_sources declared despite canonical references (d.school, IDEO, Design Council, Knapp). Skill is principle-grounded but lacks verifiable backing. Evidence: Static facts show no grounding/truth_sources in frontmatter. No citations link to retrievable documents. Action: Add grounding.truth_sources entries for cited canonical references.
- [MEDIUM] content: Body 'Coverage' section largely re-states the 'Concept of the skill' paragraph with minor framing additions. Reduces compression without adding new information. Evidence: Lines 134 and 137 both open with 'Design thinking is the meta-skill that orchestrates a full human-centered design arc.' Action: Merge or differentiate the two sections so each carries unique information.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/design-thinking/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness/routing: This is explicitly a router meta-skill, yet routing_eval is absent and no hard-negative cases exist to test mis-routing into single-stage siblings. Evidence: routing_eval absent; hardNeg 0; only 2 boundary cases. Action: Add routing + hard-negative cases distinguishing meta-arc from single-stage siblings.
- [MEDIUM] eval-readiness/verification: All truth, comprehension, and application verdicts are UNVERIFIED and assertions count is zero, so the 14 cases provide no graded signal. Evidence: assertions 0; truth/comprehension/application UNVERIFIED. Action: Add assertions and run verification to certify eval state.
- [MEDIUM] eval-design: Evaluation coverage is incomplete and lacks automated verification. Evidence: 14 cases but only 8 expected outputs and 0 assertions. Action: Complete expected outputs and add validation assertions.
- [LOW] routing: Dedicated routing evaluation is missing for this orchestration skill. Evidence: Audit summary lists routing_eval as absent in the manifest. Action: Generate a routing evaluation to verify activation triggers.
- [MEDIUM] eval: Application eval lacks hard negatives and baseline runs; cases exist but all three verdicts UNVERIFIED. Evidence: Eval summary: hardNeg: 0, assertions: 0, baseline: 0; comprehension_verdict/application_verdict both UNVERIFIED. Action: Add at least 1 red-herring case, record baseline, and run application eval.
- [HIGH] eval: Application eval has zero hard-negative or red-herring cases. Cannot detect over-triggering for single-stage work, engineering discovery, or defect localization. Evidence: Eval summary shows hardNeg: 0, boundary: 2 only. No red_herring flagged cases in application.json. Action: Add at least 3 hard-negative cases (single-stage execution, event-storming prompt, defect localization).

### form-ux-architecture
Path: /Users/jacobbalslev/Development/skills/skills/design/form-ux-architecture/SKILL.md
Content score: 81 (B)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] Boundary Definition: Superior boundary logic clearly separates timing and recovery from wording and labels, effectively preventing common routing overlaps in the design domain. Evidence: SKILL.md relations.suppresses and concept_boundary definitions. Action: Maintain this structure as a template for design-tier skills.
- [LOW] Method Completeness: Method lacks specific architectural steps for high-risk data entry or destructive actions, despite their inclusion in the coverage statement. Evidence: SKILL.md Method vs Coverage 'high-risk data entry' mention. Action: Update Method step 7 to explicitly include 'confirmation and destructive action' patterns.
- [MEDIUM] Description format: Description uses activation routing language instead of about-statement per v8 protocol doctrinal change Evidence: Line 66: 'Use when designing...' format, not topical about-statement Action: Rewrite as topical 'Form UX architecture is the discipline of...' statement
- [MEDIUM] Frontmatter completeness: comprehension_state marker absent despite populated Understanding fields Evidence: Fields mental_model through misconception present (lines 119-132); no comprehension_state in metadata Action: Add 'comprehension_state: present' to frontmatter
- [MEDIUM] content: Activation arrays (keywords, triggers, examples, anti_examples, relations) stored as JSON-encoded strings rather than native arrays; may cause router parsing failures. Evidence: Line 96: keywords: "[\"form-ux\",...]" — string-wrapped array syntax. Action: Convert JSON-stringified arrays to native YAML list syntax in SKILL.md frontmatter.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/form-ux-architecture/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Robustness: The evaluation suite lacks hard negatives and explicit assertions, which reduces the reliability of automated scoring and precision at boundaries. Evidence: Eval summary: assertions: 0, hardNeg: 0. Action: Incorporate at least 3 hard negative cases targeting the a11y and microcopy boundaries.
- [MEDIUM] Eval structural quality: Eval artifacts lack assertions, baselines, and hard-negative cases Evidence: 0 assertions, 0 baseline, 0 hardNeg per eval summary Action: Add assertions to comprehension cases and ≥1 red-herring to application cases
- [HIGH] eval_readiness: Zero hard-negative or regression cases across comprehension and application evals; cannot detect over-triggering or false positives. Evidence: Eval summary: hardNeg: 0, regression: 0 out of 14 total cases. Action: Add at least one red-herring case (e.g. 'design a REST endpoint for form submission') with red_herring: true to each eval.
- [MEDIUM] eval_readiness: All four audit verdicts are UNVERIFIED and eval_state is unverified despite eval artifacts being present; no evidence evals have been executed. Evidence: audit-state.json: comprehension_verdict UNVERIFIED, application_verdict UNVERIFIED, eval_state: unverified. Action: Run comprehension and application evals to produce eval_last_run receipts and advance verdicts from UNVERIFIED.

Blockers:
- opus: exit 0

### ideation
Path: /Users/jacobbalslev/Development/skills/skills/design/ideation/SKILL.md
Content score: 84 (B)
Eval readiness score: 59 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/grounding: Procedure, mental model, and divergent/convergent boundary are crisp and named to real sources (Osborn 1953, Diehl & Stroebe, GV Sprint), making the concept reusable and defensible. Evidence: SKILL.md Philosophy/Verification cite literature; concept_boundary names mechanisms. Action: None; content is publication-grade.
- [LOW] Scope & Detail: Excellent specificity in naming techniques like SCAMPER and Crazy 8s provides clear guidance. Evidence: SKILL.md Coverage section Action: None.
- [LOW] Boundary Definition: Concept boundary and anti-examples effectively distinguish ideation from engineering discovery and decision-making. Evidence: metadata.concept_boundary vs anti_examples Action: None.
- [INFO] Understanding fields: All five flat Understanding fields present with repo-agnostic language — strong mental_model and misconception Evidence: mental_model, purpose, concept_boundary, analogy, misconception all populated and well-written Action: Maintain this pattern as exemplar for design-subject skills
- [INFO] Boundary articulation: Exceptionally thorough boundary hygiene with named neighbor skills and explicit Do NOT Use When section Evidence: Anti-examples, concept_boundary, Do NOT Use When, and relations.related all consistently reference sibling skills Action: Serve as boundary-articulation model for other subject skills

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/ideation/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness/assertions: Eval set has 15 cases but 0 assertions and 0 baseline/regression, so pass/fail is unmeasurable and certification cannot grade comprehension or application objectively. Evidence: Eval summary: assertions 0, baseline 0, regression 0. Action: Add explicit assertions/expected-behavior checks per case and a baseline.
- [MEDIUM] eval-readiness/audit-state: Audit state shows truth, comprehension, and application all UNVERIFIED and routing_eval absent, so eval readiness is unproven despite artifacts being present. Evidence: Audit summary: three UNVERIFIED verdicts; routing_eval absent. Action: Run verification passes and add a routing/activation eval.
- [MEDIUM] Eval Readiness: High case volume (15) meets targets, but lack of assertions limits automated validation precision. Evidence: Eval summary: 15 cases, 0 assertions Action: Add assertions to eval JSON files.
- [MEDIUM] Eval certification: 15 eval cases exist (8 prompts, 1 hard negative, 3 boundary) but all verdicts are UNVERIFIED and routing_eval is absent Evidence: comprehension_verdict/application_verdict both UNVERIFIED, eval_state unverified, routing_eval absent Action: Run evaluate --mode comprehension and --mode application to certify existing eval artifacts
- [MEDIUM] eval-design: Zero assertions across 15 eval cases and no baseline cases — comprehension and application grading cannot produce reliable scores without structured assertions. Evidence: Eval summary shows assertions: 0, baseline: 0 across 15 cases. Action: Add per-case assertions and at least 3 baseline (no-skill) application cases.
- [MEDIUM] eval-design: Only 1 hard-negative and 0 regression cases in application eval — over-triggering and regression detection are not covered. Evidence: hardNeg: 1, regression: 0 in eval summary. Action: Add 2+ red-herring application cases targeting anti-example scenarios (event-storming, investment decisions).
- [LOW] eval-state: All four audit verdicts are UNVERIFIED despite eval_artifacts: present and eval_state: unverified — no eval has been run to generate certification evidence. Evidence: Audit summary: comprehension_verdict UNVERIFIED, application_verdict UNVERIFIED, eval_state: unverified. Action: Run comprehension and application evals against a frontier grader and record results in audit-state.json.

### information-architecture
Path: /Users/jacobbalslev/Development/skills/skills/design/information-architecture/SKILL.md
Content score: 83 (B)
Eval readiness score: 51 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/boundary: SKILL.md cleanly separates IA from taxonomy, layout, design-system, microcopy, a11y via mechanism not just label, with matching anti-examples and 'Do NOT Use' table. Evidence: concept_boundary + Do NOT Use table name owning skill per confusable Action: None; preserve boundary clarity on edits.
- [INFO] CONTENT_QUALITY: Highly effective task-first methodology and clear structural boundaries against layout-composition and taxonomy-design. Evidence: SKILL.md Method and concept_boundary Action: Promote to stable after verification.
- [LOW] body_duplication: Body sections (Coverage, Philosophy, Method) largely restate frontmatter fields (mental_model, purpose, concept_boundary) without adding distinct depth beyond the frontmatter signal. Evidence: Body 'Concept of the skill' mirrors frontmatter mental_model; 'Coverage' mirrors scope; 'Philosophy' mirrors purpose. Action: Refactor body sections to add practitioner depth (examples, decision frameworks, failure modes) beyond frontmatter routing signals.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/information-architecture/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval suite has 0 hard-negative and 0 assertion cases despite four authored anti_examples; routing discrimination from confusable siblings is untested. Evidence: Eval summary: hardNeg 0, assertions 0, boundary 2 Action: Add hard-negative cases mapping each anti_example to its correct owner skill.
- [MEDIUM] eval-readiness/audit: Truth, comprehension, and application verdicts all UNVERIFIED and routing_eval absent, so the 15 cases are unvalidated against authored content. Evidence: Audit: truth/comprehension/application UNVERIFIED, routing_eval absent Action: Run grading to convert UNVERIFIED verdicts and add routing eval.
- [LOW] eval-readiness: No baseline or regression cases, so skill-vs-no-skill lift and drift protection are unmeasurable. Evidence: Eval summary: baseline 0, regression 0 Action: Add baseline and regression cases to the suite.
- [HIGH] EVAL_STRENGTH: Evaluation artifacts contain 15 cases but zero assertions or baselines, preventing automated validation of agent performance. Evidence: assertions: 0, baseline: 0 Action: Add LLM-graders and regex assertions.
- [MEDIUM] AUDIT_HYGIENE: All audit tiers remain unverified and routing evaluations are absent, blocking certification. Evidence: audit-state.json tiers UNVERIFIED Action: Run evaluations and update audit-state.
- [HIGH] eval_evidence: All four audit verdicts are UNVERIFIED despite eval_artifacts: present and eval_state: unverified — no certified evidence backs the skill. Evidence: Audit summary shows structural_verdict PASS but truth/comprehension/application all UNVERIFIED. Action: Run comprehension and application evals to produce certified verdict artifacts.
- [MEDIUM] eval_coverage: Application eval has zero assertions, zero hard negatives, and zero regression cases — only 2 boundary cases exist; grader cannot score behavior change or false-positive avoidance. Evidence: Static eval summary: assertions 0, hardNeg 0, regression 0, boundary 2. Action: Add ≥1 hard-negative red-herring case and ≥3 observable assertion expectations to application.json.

Blockers:
- deepseek-flash: exit 0

### interaction-feedback
Path: /Users/jacobbalslev/Development/skills/skills/design/interaction-feedback/SKILL.md
Content score: 84 (B)
Eval readiness score: 53 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/boundary: Description and concept_boundary name the differing mechanism (words vs timing vs lifecycle vs speed) and route precisely to four siblings. Evidence: concept_boundary + Do NOT Use table cite microcopy/a11y/state-machine-modeling/performance-engineering Action: None; boundary articulation is exemplary.
- [INFO] content quality: The duration-class mental model provides excellent, actionable heuristics for surface selection. Evidence: SKILL.md duration classes (instant, short, medium, long, background). Action: Maintain this taxonomy as a core reusable primitive.
- [LOW] Content — anti_examples: Anti-examples cover microcopy/a11y but not performance-engineering explicitly Evidence: anti_examples lacks a 'profile the endpoint' variant Action: Add performance-engineering anti-example matching Do Not Use table
- [MEDIUM] content structure: Philosophy section restates mental_model and purpose nearly verbatim, adding token cost without new signal. Evidence: Lines 152-157 repeat 'user's proof the system heard them' and 'not the same as performance' from Understanding fields. Action: Collapse Philosophy into one paragraph or remove if Understanding fields cover it.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/interaction-feedback/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval suite has zero assertions, zero hard negatives, zero baseline, and routing_eval absent, so discriminability and regression coverage are unmeasurable. Evidence: assertions 0, hardNeg 0, baseline 0, routing_eval absent Action: Add scored assertions, hard-negative cases against the four boundary owners, and a baseline.
- [MEDIUM] audit-state: Audit state present but truth, comprehension, and application all UNVERIFIED, leaving content claims and 15 cases uncertified. Evidence: truth/comprehension/application_verdict UNVERIFIED; eval_state unverified Action: Run comprehension and application evals to move verdicts past UNVERIFIED.
- [HIGH] eval readiness: Evaluation suite contains 15 cases but zero assertions, preventing automated verification of agent performance. Evidence: Eval summary: 15 cases, 0 assertions. Action: Define specific LLM-judge or pattern-match assertions for all cases.
- [MEDIUM] eval design: Routing evaluation is absent, leaving the well-defined activation/suppression boundaries unverified in practice. Evidence: Audit summary: routing_eval absent. Action: Generate a routing-eval.json to test triggers and anti-examples.
- [MEDIUM] Eval coverage — hard negatives: Evals have 0 hard-negative cases; skill about boundary clarity needs them Evidence: eval summary: hardNeg: 0 across 15 cases Action: Add at least 3 red-herring cases that should route elsewhere
- [MEDIUM] Eval design — assertions: No baseline/assertion structure; eval cannot produce quantitative pass/fail Evidence: eval summary: assertions: 0, baseline: 0 Action: Add expected_flags/absent_signals to each case
- [HIGH] eval design: No hard negative cases in application eval; cannot detect over-triggering or false-positive routing. Evidence: hardNeg: 0, boundary: 2 (boundary cases exist but hardNeg count is zero). Action: Add ≥2 red_herring cases to application.json that should NOT activate this skill.
- [MEDIUM] eval readiness: All four audit verdicts are UNVERIFIED despite eval_artifacts: present; certification path blocked. Evidence: audit summary shows comprehension_verdict: UNVERIFIED, application_verdict: UNVERIFIED. Action: Run comprehension and application evals to move verdicts toward PASS or PROVISIONAL.

### interaction-patterns
Path: /Users/jacobbalslev/Development/skills/skills/design/interaction-patterns/SKILL.md
Content score: 83 (B)
Eval readiness score: 52 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/boundary: Description, concept_boundary, and Do NOT Use table cleanly partition adjacent skills by mechanism (a11y, task-analysis, interaction-feedback, design-system-architecture) with named ownership. Evidence: concept_boundary names 'runs BEFORE/AFTER' sequencing and suppresses[] reasons phrased as ownership. Action: None; boundary work is exemplary.
- [INFO] mental_model: The decision-shape framework (compare/choose/search) effectively prevents widget-first reasoning errors. Evidence: SKILL.md mental_model and purpose Action: None.
- [MEDIUM] procedural_completeness: Method lacks specific heuristics for differentiating high-frequency pattern dilemmas like Drawer vs Modal. Evidence: SKILL.md Method step 3 Action: Add a comparative heuristics table.
- [MEDIUM] relations-format: suppresses reasons use third-person voice instead of canonical first-person form. Evidence: Line 115: 'interaction-feedback owns feedback states' not 'I own this exclusively over interaction-feedback'. Action: Rewrite suppresses reason text to first-person ownership form per protocol.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/interaction-patterns/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval/coverage: Eval suite has 15 cases but 0 assertions, 0 hard-negatives, 0 baseline/regression; only 3 boundary cases. Activation precision against confusable siblings is untested. Evidence: Eval summary: assertions 0, hardNeg 0, baseline 0, boundary 3, target 10. Action: Add hard-negative cases for a11y/interaction-feedback near-misses and assertion-backed application cases.
- [MEDIUM] eval/audit-state: Audit-state present but truth/comprehension/application all UNVERIFIED and routing_eval absent, so certification claims rest on unrun artifacts. Evidence: audit-state.json: eval_state 'unverified', routing_eval 'absent'. Action: Run comprehension/application/routing evals and record verdicts before certifying.
- [HIGH] eval_readiness: Zero assertions present across 15 eval cases, making automated grading impossible. Evidence: eval summary assertions: 0 Action: Add LLM-graded assertions to application.json.
- [HIGH] eval_completeness: No hard-negative eval cases to detect over-triggering on out-of-scope tasks Evidence: hardNeg: 0 in 15-case eval suite Action: Add at least 2 red-herring cases with red_herring: true
- [MEDIUM] eval_rigor: Zero structured assertions across eval cases; no measurable pass/fail criteria Evidence: assertions: 0 across 15 cases Action: Define expected_flags or expected_fix_hints per case
- [MEDIUM] routing_coverage: Skill not included in routing evaluation baseline Evidence: routing_eval: absent in audit state Action: Include in next routing eval sweep
- [HIGH] eval-design: Zero hard-negative / red-herring cases in either eval file. No over-triggering detection. Evidence: Eval summary shows hardNeg: 0; no red_herring flags in application cases. Action: Add at least 2 red-herring cases per eval (e.g. prompts about accessibility compliance, component API design).
- [MEDIUM] eval-artifacts: All four audit verdicts are UNVERIFIED despite eval_artifacts being present. No eval has been run. Evidence: audit-state.json shows comprehension_verdict/application_verdict: UNVERIFIED, eval_state: unverified. Action: Run comprehension and application evals and stamp verdicts with evidence.

### journey-mapping
Path: /Users/jacobbalslev/Development/skills/skills/design/journey-mapping/SKILL.md
Content score: 80 (B)
Eval readiness score: 54 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content: Exceptional mental model and misconception sections prevent confusion with system architecture diagrams. Evidence: SKILL.md lines 43-66 Action: Retain current depth; it exceeds protocol benchmarks.
- [MEDIUM] content-completeness: No suppresses relation for task-analysis despite four explicit boundary references naming it as the confusable territory in description, concept_boundary, and Do NOT Use When Evidence: description, concept_boundary, and Do NOT Use When all name task-analysis; relations only has 'related' Action: Add relations.suppresses entry for task-analysis
- [MEDIUM] content: {"severity":"MEDIUM","dimension":"content","findings":"No suppresses edges declared despite detailed anti-examples routing to task-analysis, information-architecture, event-storming, bounded-context-mapping, ideation, and user-research.","evidence":"relations block at line 110 contains only related[]; six explicit exclusion names in anti_examples and Do NOT Use When have no suppresses counterpart.","action":"Add suppresses entries for the top confusable skills with ownership reason-text per ADR-0018."} Evidence: relations block at line 110 contains only related[]; six explicit exclusion names in anti_examples and Do NOT Use When have no suppresses counterpart. Action: Add suppresses entries for the top confusable skills with ownership reason-text per ADR-0018.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/journey-mapping/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Evaluation suite contains 15 cases but zero assertions, rendering automated grading impossible. Evidence: Eval summary: assertions 0 Action: Define LLM-graded assertions for all existing evaluation cases.
- [MEDIUM] eval_readiness: Absence of hard negatives limits the evaluation's ability to test boundary-case routing. Evidence: Eval summary: hardNeg 0 Action: Add 2-3 hard negative cases mimicking journey-like task flows.
- [HIGH] eval-readiness: Zero hard-negative cases despite skill body naming two concrete failure modes (anodyne happy-path, everything-everywhere) that should be red-herring cases in evals Evidence: 0 hardNeg in eval summary; skill lines 158-158 identify both failure modes Action: Add >=2 hard-negative eval cases targeting identified failure modes
- [HIGH] eval-certification: All four audit verdicts UNVERIFIED, eval_state unverified, routing_eval absent — no behavioral evidence or routing presence established Evidence: Audit summary: all verdicts UNVERIFIED, eval_state: unverified, routing_eval: absent Action: Run comprehension and application evals, stamp verdicts, include in routing eval
- [HIGH] eval_readiness: Zero hard-negative / red-herring cases in application eval; eval summary shows hardNeg: 0. Evidence: Eval summary at lines 38-49: 15 cases, 0 hardNeg, 0 assertions, 0 regression. Action: Add ≥1 red_herring case (e.g. a request for a microservice topology) to application eval.
- [HIGH] eval_readiness: All four audit verdicts are UNVERIFIED and eval_state is unverified despite eval_artifacts: present. Evidence: Audit summary lines 52-59: structural PASS but truth/comprehension/application all UNVERIFIED. Action: Run comprehension and application evals to earn the claimed verdicts before certifying.

Blockers:
- opus: exit 0

### layout-composition
Path: /Users/jacobbalslev/Development/skills/skills/design/layout-composition/SKILL.md
Content score: 85 (B)
Eval readiness score: 61 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] boundary clarity: Content draws crisp mechanism-level boundaries against task-analysis, IA, visual-design, and design-system via table, anti_examples, and concept_boundary. Evidence: SKILL.md 'Do NOT Use When' table + concept_boundary name differing mechanisms. Action: None; preserve this boundary structure.
- [HIGH] Scope: Exceptional distinction between content-driven breakpoints and device widths ensures durability. Evidence: SKILL.md rejects 375/768 targets for content breaks. Action: Maintain as core design requirement.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/layout-composition/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval verification: Eval surface: truth, comprehension, and application verdicts all UNVERIFIED and routing eval absent, so no evidence the 15 cases pass. Evidence: Audit summary: three UNVERIFIED verdicts, routing_eval absent, eval_state unverified. Action: Run eval harness to verify cases and add a routing eval.
- [MEDIUM] eval rigor: Eval surface: zero assertions and zero baseline/regression cases; only 2 hard-negative and 2 boundary cases give thin discrimination. Evidence: Eval summary: assertions 0, baseline 0, regression 0, hardNeg 2. Action: Add assertions plus baseline and regression cases toward 10-per-type target.
- [MEDIUM] Eval Readiness: Strong 15-case set covers negatives but lacks assertions and verification. Evidence: 15 cases, 0 assertions, UNVERIFIED audit state. Action: Add assertions and verify audit state.
- [LOW] Activation: Keyword mapping uses realistic user terminology for high retrieval recall. Evidence: 10 keywords and 5 triggers align with intent. Action: No action needed.

Blockers:
- deepseek-flash: timeout
- mimo: timeout

### microcopy
Path: /Users/jacobbalslev/Development/skills/skills/design/microcopy/SKILL.md
Content score: 86 (B)
Eval readiness score: 59 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content/boundary: Boundary work is exemplary: concept_boundary, anti_examples, and Do NOT Use table each name the owning sibling by mechanism, cleanly separating linguistics, interaction-feedback, a11y, and copywriting. Evidence: 'linguistics owns the why; microcopy owns the what to write'; suppresses interaction-feedback Action: None; preserve this boundary discipline as a template.
- [INFO] clarity: Exceptional surface-specific patterns for buttons, empty states, and errors provide high-signal guidance. Evidence: Sections 1, 2, and 5 define explicit verb-first and acknowledge-explain-guide structures. Action: None; maintain current content depth.
- [LOW] boundaries: Strong 'Do NOT Use' table prevents routing overlap with linguistics, documentation, and a11y. Evidence: Table clearly distinguishes 'What to write' (Microcopy) from 'Why to write it' (Linguistics). Action: Ensure sibling skills reference these boundaries.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/microcopy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness: Eval surface has 15 cases (exceeds target 10) but 0 assertions, 0 baseline, 0 regression, so cases cannot mechanically grade copy quality or guard against drift. Evidence: assertions:0, baseline:0, regression:0 across application/comprehension JSON Action: Add scored assertions and a baseline/regression set to make cases checkable.
- [MEDIUM] eval-readiness/audit: Audit state leaves truth, comprehension, and application all UNVERIFIED with routing_eval absent, so certification evidence is missing despite structural PASS. Evidence: truth/comprehension/application_verdict UNVERIFIED; routing_eval absent Action: Run truth+comprehension+application verification and add a routing eval.
- [HIGH] eval-readiness: Eval suite has healthy case volume (15) but zero assertions or baselines for regression testing. Evidence: Eval summary reports 0 assertions and 0 baselines. Action: Add LLM-grade assertions and golden baselines to existing JSON eval files.

Blockers:
- deepseek-flash: timeout
- mimo: timeout

### prototyping
Path: /Users/jacobbalslev/Development/skills/skills/design/prototyping/SKILL.md
Content score: 87 (B)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [LOW] content/grounding: Strong concept, boundary, fidelity ladder, and verification checklist; description and concept_boundary name mechanism-level distinctions from sibling skills, not just labels. Evidence: SKILL.md concept_boundary + Do NOT Use When enumerate 5 confusable owners Action: None; content is publish-ready.
- [INFO] content: The fidelity ladder and learning goal contract provide a superior mental model for artifact-based learning. Evidence: Ladder covers paper to code spikes; contract requires written questions and evidence definitions. Action: Maintain this high standard of conceptual clarity in sibling design skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/prototyping/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness/assertions: 14 cases carry zero assertions and zero baseline, so application/comprehension outcomes cannot be auto-graded; only 1 hard-negative limits boundary-confusion coverage. Evidence: Eval summary: assertions 0, baseline 0, hardNeg 1 Action: Add gradable assertions and ≥2 more hard negatives before certification.
- [MEDIUM] eval-readiness/audit-state: All truth/comprehension/application verdicts UNVERIFIED and routing eval absent, so eval-state cannot certify despite structural PASS. Evidence: Audit summary: eval_state unverified, routing_eval absent Action: Run verification passes and add a routing eval to lift eval-state.
- [MEDIUM] eval-readiness: Eval artifacts lack assertions and routing-specific evaluations, limiting automated verification of activation boundaries and suppression logic. Evidence: Assertions/baseline are 0; routing_eval is absent in audit summary. Action: Add assertion-based cases and a routing_eval.json to verify boundary logic.
- [LOW] audit: Audit state reflects unverified verdicts across all categories despite strong grounding and case volume. Evidence: audit-state.json lists truth, comprehension, and application as UNVERIFIED. Action: Execute verification runs to update audit-state.json verdicts.

Blockers:
- deepseek-flash: timeout
- mimo: timeout

### research-synthesis
Path: /Users/jacobbalslev/Development/skills/skills/design/research-synthesis/SKILL.md
Content score: 82 (B)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content quality: Exceptional mental model emphasizing traceability over gist-based summarization provides high pedagogical value. Evidence: SKILL.md mental_model and misconception sections Action: Maintain current depth as a gold standard for design skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/research-synthesis/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval readiness: Evaluation suite contains zero assertions, preventing programmatic verification of specific method constraints. Evidence: Eval summary: assertions: 0 Action: Implement assertions to check for required artifacts like traceability or empathy maps.
- [MEDIUM] certification: Audit state reflects unverified status across all functional dimensions despite present eval artifacts. Evidence: Audit summary: UNVERIFIED for truth/comprehension/application Action: Execute certification loop to move skill from experimental to stable.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### semiotics
Path: /Users/jacobbalslev/Development/skills/skills/design/semiotics/SKILL.md
Content score: 89 (B)
Eval readiness score: 54 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [HIGH] grounding: Exceptional theoretical depth using Peirce and Barthes provides a rigorous mental model for interface analysis. Evidence: SKILL.md sections on Foundations and Visual Semiotics. Action: Maintain this level of academic grounding in future design skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/semiotics/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness: Evaluation suite lacks assertions and hard negatives, relying solely on prompt-expected pairs which limits automated verification depth. Evidence: Eval summary shows 0 assertions and 0 hardNeg. Action: Add LLM-as-a-judge assertions to application.json to verify specific reasoning.
- [MEDIUM] routing: Absence of a routing evaluation makes the complex suppression rules for microcopy untestable. Evidence: Audit summary shows routing_eval is absent. Action: Implement routing.json targeting boundaries defined in the suppresses section.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### typography-system
Path: /Users/jacobbalslev/Development/skills/skills/design/typography-system/SKILL.md
Content score: 82 (B)
Eval readiness score: 59 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] grounding: High technical depth on delivery but omits explicit accessibility (WCAG legibility/contrast) in the Verification section. Evidence: Content focuses on scale and performance but lacks accessibility targets. Action: Add WCAG-aligned legibility and contrast verification steps to the skill content.
- [LOW] metadata: Experimental stability marker contradicts the mature, comprehensive technical content provided. Evidence: Metadata marks stability as experimental despite highly structured principles. Action: Promote stability to stable once truth verdict is verified.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is REDUNDANT, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/typography-system/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval design: Eval suite lacks assertions and hard negatives, relying on brittle string matching for complex architectural reasoning. Evidence: Eval summary shows 0 assertions and 0 hard negatives across 15 cases. Action: Migrate expected strings to assertions and add hard negative boundary cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### usability-testing
Path: /Users/jacobbalslev/Development/skills/skills/design/usability-testing/SKILL.md
Content score: 84 (B)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] grounding: The content is exceptionally grounded in established theory, citing Nielsen, Landauer, and Brooke to provide precise formative vs. summative distinctions. Evidence: SKILL.md cites Ericsson & Simon (think-aloud) and Brooke (SUS) directly in text. Action: Maintain this level of scholarly rigor for design-related skills.
- [LOW] routing: Anti-examples and boundaries are surgically defined by mechanism, effectively distinguishing this from testing-strategy and user-research. Evidence: Metadata scope and concept_boundary sections explicitly name mechanisms like 'automated verification' vs 'human observation'. Action: None required; this is a benchmark for boundary definitions.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/usability-testing/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Evaluation artifacts lack assertion logic and hard negatives, preventing the Skill Graph from automatically verifying if an agent correctly applies the 5-user rule. Evidence: Eval summary shows 0 assertions and 0 hard negatives despite having 15 cases. Action: Add specific LLM-judge assertions or regex-based pattern matching to application.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### user-research
Path: /Users/jacobbalslev/Development/skills/skills/design/user-research/SKILL.md
Content score: 83 (B)
Eval readiness score: 57 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] conceptual grounding: The 'field naturalist' analogy and epistemological breakdown provide a superior mental model for agent instruction. Evidence: SKILL.md mental_model and analogy sections. Action: Maintain this level of depth for future design-category skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/user-research/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] validation rigor: Evaluation suite contains 15 cases but zero assertions, limiting the ability to programmatically verify response quality beyond simple completion. Evidence: Static eval summary showing 0 assertions. Action: Add specific assertions to application.json to check for leading question avoidance.
- [MEDIUM] routing safety: Absence of hard negatives and routing-specific evals increases the risk of the skill over-triggering for analytics or evaluative tasks. Evidence: Static eval summary showing 0 hardNeg and absent routing_eval. Action: Create routing-specific eval cases comparing user-research against analytics and usability-testing.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### visual-design-foundations
Path: /Users/jacobbalslev/Development/skills/skills/design/visual-design-foundations/SKILL.md
Content score: 84 (B)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] clarity: Superior boundary definition between craft and architecture. Evidence: SKILL.md concept_boundary and Do NOT Use table clearly separate foundations from design-system-architecture. Action: Maintain this clarity as sibling skills evolve.
- [LOW] protocol: Perfect V8 metadata alignment and relational mapping. Evidence: Metadata block uses subject:design, taxonomy_domain, and suppresses logic matching ADR-0017. Action: None; use as template for design-category skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/visual-design-foundations/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-design: Eval artifacts lack programmatic assertions despite high case count. Evidence: Eval summary shows 15 cases but 0 assertions in application.json and comprehension.json. Action: Add LLM-graded assertions to verify specific visual craft principles.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### visual-hierarchy
Path: /Users/jacobbalslev/Development/skills/skills/design/visual-hierarchy/SKILL.md
Content score: 83 (B)
Eval readiness score: 64 (D)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] Mental Model: Powerful 'suppression over amplification' model transforms visual hierarchy from a decorative task into a functional, priority-driven deciding mechanism. Evidence: SKILL.md mental_model and philosophy Action: Preserve this conceptual depth in future revisions.
- [LOW] Precision: Excellent differentiation from typography-system and layout-composition by focusing on signal deployment rather than token definition. Evidence: SKILL.md relations and concept_boundary Action: None; this is a benchmark for boundaries.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/visual-hierarchy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Design: Suite exceeds case count targets but lacks assertions, meaning evals currently require manual grading rather than automated pass/fail. Evidence: Eval summary: 15 cases, 0 assertions Action: Define assertions or expected outputs in evals.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### writing-humanizer
Path: /Users/jacobbalslev/Development/skills/skills/design/writing-humanizer/SKILL.md
Content score: 93 (A)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] procedure: The 5-step humanization workflow and 3-beat rhythm pattern provide high-utility mental models for consistent prose output. Evidence: SKILL.md sections 4 and 10. Action: None.
- [INFO] grounding: Excellent grounding in industry reports (OpenAI/Stanford) prevents 'authorship laundering' promises and anchors skill in truth. Evidence: SKILL.md section 7 Source Notes. Action: None.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/design/writing-humanizer/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval readiness: Eval suite meets case count target but lacks assertions and baselines, preventing automated pass/fail certification. Evidence: Eval summary: 15 cases, 0 assertions, 0 baseline. Action: Implement assertions and hard-negative cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### client-server-boundary
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/client-server-boundary/SKILL.md
Content score: 91 (A)
Eval readiness score: 47 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Adopt this 'Triad' model (Serialization, Direction, Trust) as a benchmark for architectural skills.

Content findings:
- [INFO] content-quality: The 'Trust' and 'Philosophy' sections brilliantly elevate a framework-specific feature into a fundamental engineering principle of categorical asymmetry. Evidence: Section: Trust — The Asymmetric Boundary. Action: Adopt this 'Triad' model (Serialization, Direction, Trust) as a benchmark for architectural skills.
- [LOW] content-completeness: The distinction between file-level and function-level 'use server' scope could be more explicit regarding closure trapping risks. Evidence: Directives table mentions both locations but not their differing scoping consequences. Action: Add a brief note about function-level scope in the common leakage modes table.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/client-server-boundary/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Evaluation suite contains 15 cases but zero assertions, preventing automated verification or meaningful scoring of model performance. Evidence: Eval summary: 15 cases, 0 assertions. Action: Add assertion logic (regex, includes, or model-graded) to all cases in application.json and comprehension.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### design-system-architecture
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/design-system-architecture/SKILL.md
Content score: 83 (B)
Eval readiness score: 54 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] Content Architecture: The 3-layer mental model (Raw/Semantic/Component) provides an exceptionally clear and durable reasoning framework for complex UI systems. Evidence: mental_model section in SKILL.md Action: Maintain this structure as a template for other engineering-heavy skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/design-system-architecture/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Validation: Strong case volume is undercut by zero assertions, preventing the automated verification of agent response quality or correctness. Evidence: 0 assertions in eval summary Action: Add specific assertions to application.json to validate token taxonomy logic.
- [LOW] Routing Integrity: Absence of routing_eval prevents empirical verification of the complex boundaries with visual-design-foundations and interaction-patterns. Evidence: routing_eval: absent in audit Action: Create a routing_eval.json to test discrimination against layout and visual skills.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### error-boundary
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/error-boundary/SKILL.md
Content score: 88 (B)
Eval readiness score: 51 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 8 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/error-boundary/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [INFO] Content Clarity: The 'What an Error Boundary Catches' table provides exceptional signal on React lifecycle edge cases. Evidence: SKILL.md lines 106-118 Action: Maintain this format as a standard for boundary-related skills.
- [HIGH] Eval Robustness: Eval suite contains 15 cases but zero assertions, meaning responses cannot be automatically validated. Evidence: eval summary 'assertions': 0 Action: Define pass/fail criteria and assertions for all eval cases.
- [MEDIUM] Negative Constraints: Zero hard-negative cases despite clear guidance, risking over-triggering in ambiguous async contexts. Evidence: eval summary 'hardNeg': 0 Action: Add cases targeting event-handler and API design prompts.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### frontend-architecture
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/frontend-architecture/SKILL.md
Content score: 77 (C)
Eval readiness score: 58 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/frontend-architecture/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- opus: exit 1
- gemini-flash: exit 0
- deepseek-flash: timeout
- mimo: timeout

### generative-ui
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/generative-ui/SKILL.md
Content score: 95 (A)
Eval readiness score: 59 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] purpose/scope clarity: Exceptional depth on 2026 protocols (MCP Apps, A2UI, AG-UI) provides a precise mental model for modern interfaces. Evidence: Sections on Render Substrates and Implementation Variants cite ratified 2026 MCP standards. Action: Maintain this as the gold-standard benchmark for architectural skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/generative-ui/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval readiness: Broad case coverage (15 items) lacks structural assertions, relying purely on string matching for verification. Evidence: Eval summary reports 0 assertions across 15 cases. Action: Add specific assertions to JSON eval files to enable robust automated scoring.
- [LOW] audit evidence: Audit state is present but lacks formal verification across truth, comprehension, and application domains. Evidence: Audit summary reports UNVERIFIED for all primary verdicts. Action: Complete the verification process to finalize the audit state.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### hooks-patterns
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/hooks-patterns/SKILL.md
Content score: 89 (B)
Eval readiness score: 59 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 11 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] mental-model: Explanation of hooks as fiber slot-array indices provides a precise physical mental model for the Rule of Hooks. Evidence: SKILL.md mental_model section on call-order slots. Action: Keep as the gold standard.
- [INFO] coverage: Excellent future-proofing by explicitly addressing React Compiler and Effect Events impact on manual optimization patterns. Evidence: Reference to React 18/19 semantics and Compiler. Action: Maintain current content trajectory.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/hooks-patterns/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-design: High case volume exceeds targets but lack of assertions hinders objective, automated grading of agent performance. Evidence: Eval summary shows 15 cases with 0 assertions. Action: Add assertion criteria to evals.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### middleware-patterns
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/middleware-patterns/SKILL.md
Content score: 91 (A)
Eval readiness score: 62 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 34 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] currency: Exceptional grounding in Next.js 16 proxy.ts convention and May 2026 CVEs. Evidence: Mentions Next.js 16 proxy.ts and CVE-2026-44575 throughout. Action: None; maintains state-of-the-art accuracy.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/middleware-patterns/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness: Eval suite has healthy case volume but lacks defined assertions or baselines. Evidence: Audit summary lists 0 assertions and 0 baseline. Action: Implement LLM-as-a-judge criteria or deterministic string assertions.
- [LOW] readiness: Audit summary indicates unverified state for truth and application dimensions. Evidence: audit-state.json shows UNVERIFIED for truth/application verdicts. Action: Execute eval suite and update audit-state.json to verified.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### mobile-responsive-ux
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/mobile-responsive-ux/SKILL.md
Content score: 84 (B)
Eval readiness score: 58 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/mobile-responsive-ux/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- opus: exit 1
- gemini-flash: exit 0
- deepseek-flash: timeout
- mimo: timeout

### ref-patterns
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/ref-patterns/SKILL.md
Content score: 90 (A)
Eval readiness score: 57 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 7 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] Content Coverage: Exceptional depth covering React 19 ref-as-prop transition and Radix-style ref composition. Evidence: Sections on React 19 and composeRefs are highly detailed. Action: Maintain current detail level during future updates.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 16 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/ref-patterns/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Readiness: Evaluation artifacts contain zero assertions or baselines despite a healthy count of 16 cases. Evidence: Eval summary shows 0 assertions and 0 baselines. Action: Implement assertions in application.json and comprehension.json files.
- [LOW] Audit Status: Audit state remains unverified across qualitative dimensions despite passing structural checks. Evidence: Audit summary reports UNVERIFIED for truth and application verdicts. Action: Complete qualitative audit review to transition state to verified.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### rendering-models
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/rendering-models/SKILL.md
Content score: 90 (A)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] content/scope: Superior conceptual grounding via the 'Time x Place' grid and detailed trade-off tables. Evidence: Grid and trade-off sections provide precise FCP/LCP/TTI/INP mappings. Action: Maintain this structure as a template for architectural reasoning skills.
- [INFO] content/boundary: Exceptional boundary definitions clearly separate rendering logic from codebase organization and wire protocols. Evidence: 'Do NOT Use When' table and 'concept_boundary' explicitly name 6 adjacent skills. Action: None; excellent usage of v8 metadata for routing precision.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/rendering-models/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness/automation: Eval suite contains 15 diverse cases but 0 assertions, preventing automated pass/fail verification. Evidence: Eval summary shows 15 cases, 8 prompts, but 0 assertions. Action: Author deterministic assertions for the 15 cases in application.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### server-actions-design
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/server-actions-design/SKILL.md
Content score: 92 (A)
Eval readiness score: 67 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] security: Excellent emphasis on actions as public POST endpoints prevents common security misconceptions. Evidence: SKILL.md security discipline table and contract sections. Action: Maintain as canonical security guidance.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 17 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/server-actions-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [INFO] eval-quality: Strong eval volume with 17 cases and 14 hard negatives provides high-fidelity testing. Evidence: Eval summary showing 17 cases and high hard-neg count. Action: Proceed to model-based verification.
- [LOW] eval-readiness: Missing programmatic assertions in evaluation artifacts limits automated grading precision. Evidence: Eval summary reports zero assertions. Action: Add structured assertions to eval JSON files.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### server-components-design
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/server-components-design/SKILL.md
Content score: 90 (A)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 27 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] Grounding/Truth: Content includes sophisticated security context including recent CVE-2025-55182 and advanced Taint API usage. Evidence: SKILL.md lines 340-355 detailing the RSC RCE vulnerability and patch guidance. Action: Maintain this level of technical currency.
- [INFO] Activation: Tabular rubrics for capability mapping and decision logic provide high-signal activation for agent reasoning. Evidence: SKILL.md tables 'What a Server Component Can Do' and 'Deciding Server vs Client'. Action: Use this pattern in other architecture skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 16 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/server-components-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Design: Strong case volume (16) and boundary depth (8) are undermined by a lack of automated assertions. Evidence: Eval summary shows 16 cases and 8 boundaries but 0 assertions. Action: Implement regex or LLM-grade assertions to enable automated verification.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### state-management
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/state-management/SKILL.md
Content score: 91 (A)
Eval readiness score: 51 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] Content Clarity: The 'Four Kinds of State' classification provides a superior mental model for frontend architecture. Evidence: SKILL.md table under 'The Four Kinds Of State' section. Action: None; this is a benchmark for content quality.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 17 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/state-management/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Reliability: Eval files contain zero assertions, making automated performance measurement impossible despite the high case count. Evidence: Eval summary shows 17 cases but 0 assertions. Action: Populate application.json and comprehension.json with specific assertions.
- [MEDIUM] Routing Safety: Routing eval is absent, leaving the complex 'suppresses' and 'related' graph edges unverified. Evidence: Audit summary reports routing_eval as 'absent'. Action: Create a routing evaluation suite to verify activation triggers.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### suspense-patterns
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/suspense-patterns/SKILL.md
Content score: 89 (B)
Eval readiness score: 54 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 9 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content_quality: Strong integration of React 19 and transition patterns. Evidence: SKILL.md provides actionable rules for use() and useTransition coordination. Action: Maintain content currency as React 19 features stabilize.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/suspense-patterns/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Evaluation cases lack assertions for automated grading. Evidence: eval_summary reports 0 assertions for 14 cases. Action: Add pattern-match or LLM-graded assertions to all eval files.
- [MEDIUM] audit_state: Skill remains in provisional and unverified state. Evidence: audit_summary lists application_verdict as PROVISIONAL and eval_state as unverified. Action: Execute and verify evaluation suite to certify the skill.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### theme-system-design
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/theme-system-design/SKILL.md
Content score: 82 (B)
Eval readiness score: 58 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] content_architecture: Highly precise tiered token architecture (Reference-System-Component) provides concrete implementation patterns for complex systems. Evidence: SKILL.md coverage section details 3-tier model and DTCG standard. Action: Maintain this technical depth in future revisions.
- [INFO] content_boundaries: Excellent boundary definitions prevent overlap with dark mode and palette design, ensuring precise skill routing. Evidence: Concept boundary and Do NOT Use sections name specific adjacent skills. Action: None required.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/theme-system-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval_readiness: Evaluation artifacts lack assertions or grading criteria, preventing automated scoring despite a healthy case count. Evidence: Static facts show 14 cases but 0 assertions. Action: Add LLM-as-a-judge rubrics or assertions to JSON files.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### vercel-composition-patterns
Path: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/vercel-composition-patterns/SKILL.md
Content score: 82 (B)
Eval readiness score: 57 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/frontend-engineering/vercel-composition-patterns/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [INFO] content: The 'Boolean State Explosion Audit' provides a powerful, quantifiable mental model that transforms vague refactoring into a deterministic procedure for agents. Evidence: mental_model and 'Boolean State Explosion Audit' section in SKILL.md. Action: Maintain this high-signal grounding as a core differentiator.
- [HIGH] eval_readiness: Eval artifacts contain 15 cases but zero assertions, preventing automated verification and requiring manual grading for all application and comprehension tests. Evidence: Eval summary shows 15 cases but 0 assertions. Action: Implement specific assertions for each case in application.json and comprehension.json.
- [MEDIUM] eval_readiness: Audit summary shows all verdicts as UNVERIFIED and routing eval as absent, indicating the skill hasn't passed a formal certification loop. Evidence: audit-state.json shows UNVERIFIED for truth, comprehension, and application. Action: Conduct a verification pass and add routing eval cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### keywords
Path: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/keywords/SKILL.md
Content score: 95 (A)
Eval readiness score: 62 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.

Content findings:
- [INFO] grounding/truth sources: Superior grounding in specific platform constraints like Amazon's Jan 2025 title policy and byte-count logic. Evidence: SKILL.md § Platform Field Translation and Public Grounding sections. Action: Maintain this level of platform-specific technical detail during quarterly reviews.
- [LOW] purpose/scope clarity: Strong preventative logic regarding 'AI keyword laundering' and Tier-4 evidence risks. Evidence: SKILL.md § Evidence Quality Ladder and Philosophy sections. Action: None; this is a model for other research-heavy skills.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 5 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/keywords/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 5 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/keywords/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval readiness: Eval case count (5) is low for a skill this broad; lacks assertions for complex mapping. Evidence: Static eval summary: 5 cases, 0 assertions. Action: Increase to 10+ cases including multi-intent marketplace mapping and cannibalization detection.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### knowledge-modeling
Path: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/knowledge-modeling/SKILL.md
Content score: 97 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Verify boundaries in routing tests.

Content findings:
- [INFO] Content Depth: Exceptional depth in representation paradigms and GraphRAG patterns. Evidence: 355 lines of dense content. Action: Maintain current depth.
- [MEDIUM] Metadata Accuracy: Boundary definitions precisely mitigate routing overlaps with adjacent modeling skills. Evidence: Detailed suppresses list and boundary section. Action: Verify boundaries in routing tests.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/knowledge-modeling/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Zero evaluation cases exist despite 'planned' status. Evidence: eval_summary shows 0 cases. Action: Create eval.json with 10+ cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### linguistics
Path: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/linguistics/SKILL.md
Content score: 96 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.

Content findings:
- [INFO] Grounding: Sophisticated synthesis of industry standards and classical linguistics provides high-signal, objective instructions. Evidence: Integrates Google Style, WCAG, and Saussurean semantics. Action: Maintain this superior grounding depth.
- [LOW] Scope: Superior boundary definitions distinguish semantic rationale from mechanical convention and prose polish. Evidence: Explicit 'Boundary Routing' table and 'Do NOT Use When' sections. Action: None required.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/linguistics/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Critical infrastructure gap; zero evaluation cases or artifacts exist despite being marked as planned. Evidence: eval_summary shows 0 cases; audit_summary reports absent routing coverage. Action: Generate 10+ eval cases in eval.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### ontology-modeling
Path: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/ontology-modeling/SKILL.md
Content score: 91 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Propagate this precision to related skills like conceptual-modeling.

Content findings:
- [HIGH] reasoning-strategy: Exceptional mental model depth referencing OntoClean, OWL profiles, and reasoning tractability trade-offs. Evidence: Mental model and misconception sections provide rigorous theoretical grounding. Action: Maintain this quality level for all knowledge-organization skills.
- [MEDIUM] navigational-clarity: Precise boundary definitions and suppression relations effectively prevent routing overlaps with taxonomy and modeling skills. Evidence: Concept_boundary and relations metadata use mechanism-level distinctions. Action: Propagate this precision to related skills like conceptual-modeling.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/ontology-modeling/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Evaluation suite is non-existent despite 'planned' status, leaving skill performance entirely unverified. Evidence: Eval summary report shows 0 cases and 0 prompts. Action: Author 10+ eval cases covering hard-negatives and boundary transitions.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### semantic-center
Path: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/semantic-center/SKILL.md
Content score: 92 (A)
Eval readiness score: 14 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.

Content findings:
- [INFO] instructional_design: Rigid 5-step workflow effectively prevents flat explanations and chronological drift. Evidence: Step-by-step tables and mandatory output skeleton. Action: Maintain rigid structure in future strategy skills.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/semantic-center/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Skill lacks all functional evaluation artifacts despite planned status. Evidence: Cases, prompts, and assertions are all zero. Action: Author 10 eval cases with explicit assertions.
- [MEDIUM] audit_provenance: Metadata marks audit verdicts as UNVERIFIED across all quality axes. Evidence: Audit summary shows UNVERIFIED for truth and application. Action: Run audit loop to certify instructional quality.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### semantic-relations
Path: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/semantic-relations/SKILL.md
Content score: 99 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.

Content findings:
- [INFO] grounding: Exceptional grounding in universal truth sources like WordNet and FrameNet ensures high reliability for knowledge graph edge-typing and conceptual modeling. Evidence: Grounding section and bibliography cite canonical sources like Cruse (1986) and W3C standards. Action: Maintain link validity as these sources are foundational to the skill's authority.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/semantic-relations/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] evaluation: The skill lacks all functional evaluation artifacts, leaving routing and comprehension performance unverified despite the high content quality. Evidence: Eval summary shows 0 cases; audit summary lists eval_artifacts as 'planned' and routing_eval as 'absent'. Action: Generate 10+ evaluation cases covering taxonomic substitution and thematic role disambiguation.
- [INFO] application: The inclusion of specific substitution tests and an anti-pattern catalog provides agents with actionable procedural checks for auditing hierarchies. Evidence: Section 1 and 6 provide 'Bad vs Better' mappings and the IS-A substitution test. Action: Keep these procedural anchors as they distinguish the skill from a mere glossary.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### semantics
Path: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/semantics/SKILL.md
Content score: 98 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Prune both lists to the top 5 highest-signal entries.

Content findings:
- [MEDIUM] metadata: Frontmatter example and anti-example arrays exceed recommended density limits (9 items vs 5 limit), potentially increasing routing latency or noise. Evidence: Metadata block contains 9 examples and 9 anti_examples. Action: Prune both lists to the top 5 highest-signal entries.
- [LOW] provenance: Provenance claim cites Protocol v6 while the metadata structure utilizes v8 subject and taxonomy classification fields. Evidence: skill_graph_protocol is v6 but uses v8 subject fields. Action: Update provenance to claim v8 protocol compliance.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/semantics/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] evaluation: Zero evaluation cases exist, leaving the skill in an unverified state despite the high quality of authored content. Evidence: Eval summary reports 0 cases and prompts; static score 15. Action: Draft 10+ eval cases covering routing boundaries and accuracy.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### skill-evolution
Path: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/skill-evolution/SKILL.md
Content score: 89 (B)
Eval readiness score: 66 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- No material content finding from this pass.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/skill-evolution/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- public:false; external reviewer panel skipped for privacy/publication boundary
- opus: public:false; external dispatch skipped
- gemini-flash: public:false; external dispatch skipped
- deepseek-flash: public:false; external dispatch skipped
- mimo: public:false; external dispatch skipped

### taxonomy-design
Path: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/taxonomy-design/SKILL.md
Content score: 90 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Keep as a benchmark for knowledge-organization skills.

Content findings:
- [INFO] grounding: Expertly grounded in classification theory with a clear 7-step actionable method. Evidence: Mental model and Key Sources reference Ranganathan and SKOS. Action: Keep as a benchmark for knowledge-organization skills.
- [LOW] boundary: Strong boundary definitions clearly distinguish taxonomy from formal ontology and semantic relations. Evidence: Detailed concept_boundary and Do NOT Use When table. Action: Maintain these distinctions during eval case creation.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/knowledge-organization/taxonomy-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Complete lack of evaluation artifacts blocks certification despite the 'planned' status. Evidence: Eval summary reports 0 cases and 0 files. Action: Author eval.yaml with 10+ cases including boundary tests.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### etsy
Path: /Users/jacobbalslev/Development/skills/skills/product-domain/etsy/SKILL.md
Content score: 85 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add a concrete procedure, decision model, or verification checklist.

Content findings:
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [HIGH] content: Authoritative content captures nuanced marketplace logic and POD sync boundaries. Evidence: Details Printify's 8252 error and Etsy's 2026 semantic search shifts. Action: Preserve this level of technical depth during future updates.
- [MEDIUM] grounding: Extensive grounding identifies 12 failure modes but remains unverified. Evidence: 15+ URLs listed but truth_verdict is UNVERIFIED. Action: Map truth sources to new eval assertions.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/product-domain/etsy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Missing evaluation artifacts prevent automated verification of the 207-line skill. Evidence: Eval summary confirms 0 cases and 0 assertions exist. Action: Author 10+ cases targeting Etsy-specific field constraints.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### printify
Path: /Users/jacobbalslev/Development/skills/skills/product-domain/printify/SKILL.md
Content score: 76 (C)
Eval readiness score: 13 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [MEDIUM] content: Frontmatter metadata is cluttered with redundant keys and conflicting field formats. Evidence: Duplicate public keys and stringified JSON relations inside the metadata block. Action: Refactor frontmatter to strictly follow v8 schema without duplication.
- [INFO] content: Strong technical grounding regarding async publish lifecycles and vendor-specific constraints. Evidence: Coverage and Philosophy sections correctly detail the blueprint-provider composite key. Action: Preserve this level of technical depth during future refactors.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/product-domain/printify/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Evaluation suite is entirely missing despite intent being marked as planned. Evidence: Eval summary report shows 0 cases, prompts, and assertions. Action: Author the evaluation artifact file with at least 10 cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### shopify
Path: /Users/jacobbalslev/Development/skills/skills/product-domain/shopify/SKILL.md
Content score: 78 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] content: Instructional content provides high-density technical grounding and clear mental models for Shopify integration surfaces. Evidence: Coverage section accurately details HMAC verification and GraphQL query-cost mechanics. Action: Maintain current technical precision levels.
- [LOW] metadata: Duplicate relations block exists outside the metadata frontmatter, violating structural protocol. Evidence: Relations are defined both within the metadata object and as a standalone top-level key. Action: Consolidate relations exclusively within the metadata block.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/product-domain/shopify/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] evaluation: The skill lacks any evaluation cases, leaving routing accuracy and utility unverified. Evidence: Eval summary shows 0 cases; audit-state is UNVERIFIED. Action: Author 10 target cases covering the four primary surfaces.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### a11y
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/a11y/SKILL.md
Content score: 84 (B)
Eval readiness score: 63 (D)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [HIGH] content-grounding: The primitive selection table provides excellent grounding for UI implementation. Evidence: Primitive Selection table in SKILL.md. Action: Maintain this table-driven grounding format.
- [LOW] boundary-definition: Boundaries effectively isolate accessibility from visual design and prose. Evidence: Metadata scope and Do NOT Use table. Action: None.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 12 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/a11y/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness: Evaluation artifacts lack assertions and expected outputs. Evidence: Eval summary shows 12 cases but 0 assertions. Action: Add validation logic to application.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### best-practice
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/best-practice/SKILL.md
Content score: 88 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Unify relations and populate schema_version in metadata.

Content findings:
- [INFO] content: Industry-leading freshness in security and performance sections, correctly anticipating 2025/2026 platform shifts. Evidence: Content surface correctly maps OWASP 2025 and React Compiler behaviors. Action: None; maintain current tracking of upstream specifications.
- [MEDIUM] content: Structural issues in frontmatter including duplicate relations and missing protocol version values. Evidence: SKILL.md frontmatter surface has redundant keys and empty metadata comments. Action: Unify relations and populate schema_version in metadata.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/best-practice/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Total lack of evaluation artifacts prevents verification of the skill's sophisticated quality logic. Evidence: Eval summary surface shows 0 cases and no files present. Action: Create evals/comprehension.json and evals/application.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### code-review
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/code-review/SKILL.md
Content score: 96 (A)
Eval readiness score: 21 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.

Content findings:
- [INFO] Content/Quality: Superior grounding in 2025-2026 studies regarding AI code generation risks like slopsquatting and tautological tests provides high-signal guidance. Evidence: Philosophy section citing CodeRabbit and Veracode 2025 reports. Action: Maintain as reference for technical depth.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 0 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/code-review/evals/evals.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/code-review/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Evaluation file exists but is functionally inert with zero cases, prompts, or assertions defined. Evidence: Eval summary: cases: 0, assertions: 0. Action: Populate evals/evals.json with 10 machine-gradeable cases.
- [MEDIUM] Audit/State: Comprehension and application verdicts are unverified, preventing skill certification despite elite content quality. Evidence: Audit summary: comprehension_verdict UNVERIFIED, application_verdict UNVERIFIED. Action: Run evaluation suite to stamp verdicts.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### cognitive-load-theory
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/cognitive-load-theory/SKILL.md
Content score: 89 (B)
Eval readiness score: 68 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [INFO] Content Depth: Exceptional integration of recent LLM-specific cognitive load research and benchmarks. Evidence: Section 7 details 2024-2026 evidence including ICE and CogniLoad benchmarks. Action: Preserve high-density research grounding.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 9 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/cognitive-load-theory/evals/comprehension.json, /Users/jacobbalslev/Development/skills/skills/quality-assurance/cognitive-load-theory/evals/evals.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 9 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/cognitive-load-theory/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Mechanics: Evaluation suite contains 9 cases but lacks automated assertions for validation. Evidence: Eval summary reports 0 assertions despite near-target case count. Action: Implement llm-rubric or regex assertions in evals.json.
- [LOW] Audit Readiness: Verification verdicts remain unverified or skipped. Evidence: Audit summary shows comprehension and application verdicts as UNVERIFIED or SKIPPED. Action: Execute baseline and application evals to certify utility.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### contract-testing
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/contract-testing/SKILL.md
Content score: 96 (A)
Eval readiness score: 61 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Update to stable.

Content findings:
- [LOW] metadata: Experimental stability tag contradicts mature content. Evidence: SKILL.md stability: experimental. Action: Update to stable.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/contract-testing/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/contract-testing/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] completeness: Eval suite count of 8 fails the target of 10. Evidence: Eval summary: 8 cases. Action: Add 2 edge-case prompts.
- [HIGH] automation: Zero assertions prevents automated skill verification. Evidence: Eval summary: 0 assertions. Action: Implement LLM-judge assertions.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### diff-analysis
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/diff-analysis/SKILL.md
Content score: 79 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] mental_model: The 'Structure > Meaning > Risk' loop establishes a superior, repeatable mental model for agentic diff analysis. Evidence: Procedure defined in Sections 2, 5, and 7. Action: Cross-reference this model in related quality skills.
- [MEDIUM] grounding: Instructional effectiveness relies on external reference files that are declared but not yet populated with project data. Evidence: Key Files references repo-diff-patterns.md; eval_summary files list is empty. Action: Populate reference files with real workspace patches.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/diff-analysis/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: The skill lacks all 10 required evaluation cases, leaving it in an unverified state despite its stable structure. Evidence: Static facts show 0 cases and eval_artifacts as 'planned'. Action: Author 10+ evaluation cases in eval.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### e2e-test-design
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/e2e-test-design/SKILL.md
Content score: 94 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.

Content findings:
- [INFO] content: Exceptional conceptual boundary definitions using mechanism-based distinctions rather than just labels. Evidence: concept_boundary: internal seams vs whole-stack Action: Maintain this standard for adjacent skills.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/e2e-test-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] evaluation: Skill lacks any functional evaluation cases despite being marked as planned. Evidence: eval summary cases: 0 Action: Author 10+ eval cases in eval.json.
- [LOW] metadata: Stability is experimental despite high-quality content; maturity is tied to eval absence. Evidence: stability: experimental Action: Promote to stable after verifying eval.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### error-tracking
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/error-tracking/SKILL.md
Content score: 85 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add a concrete procedure, decision model, or verification checklist.

Content findings:
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] instruction: The 'Four Error-Capture Surfaces' model provides an excellent mental framework for ensuring comprehensive application coverage. Evidence: Section 'The Four Error-Capture Surfaces' details surfaces 1-4. Action: Maintain this structure as the core teaching point.
- [INFO] grounding: Strong grounding in PII sanitization and the 'internal IDs only' principle provides critical safety guardrails. Evidence: PII Sanitization and User Context sections. Action: Use these as the basis for negative eval cases.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/error-tracking/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: The eval design is well-conceptualized in the text but currently lacks a physical implementation, hindering certification. Evidence: Metadata shows eval_artifacts: planned and 0 cases. Action: Materialize the suggested 7+ scenarios into a local eval file.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### graph-audit
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/graph-audit/SKILL.md
Content score: 88 (B)
Eval readiness score: 68 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=DRIFT. Action: Add or refresh grounding truth sources and verify them through the sidecar.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 5 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/graph-audit/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 5 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/graph-audit/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- public:false; external reviewer panel skipped for privacy/publication boundary
- opus: public:false; external dispatch skipped
- gemini-flash: public:false; external dispatch skipped
- deepseek-flash: public:false; external dispatch skipped
- mimo: public:false; external dispatch skipped

### integration-test-design
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/integration-test-design/SKILL.md
Content score: 93 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Design hard-negative cases specifically for these boundaries.

Content findings:
- [LOW] conceptual_clarity: Boundary definitions successfully differentiate integration from 6 adjacent skill types. Evidence: Concept boundary section names specific mechanism differences. Action: Design hard-negative cases specifically for these boundaries.
- [INFO] instructional_design: High-signal decision tables effectively translate theory into practitioner-ready guidance. Evidence: Four distinct tables cover scope, lifecycle, and deps. Action: Standardize this table-heavy format for architectural skills.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/integration-test-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Evaluation cases are completely absent despite being marked as planned. Evidence: Static facts show 0 cases and 0 prompts. Action: Author 10+ evaluation cases in a YAML artifact.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### lint-overlay
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/lint-overlay/SKILL.md
Content score: 80 (B)
Eval readiness score: 19 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=DRIFT. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] Content: Excellent role separation between base skill and overlay Evidence: Comparison table in ## Extends section provides precise mental model Action: None
- [MEDIUM] Structure: Redundant and conflicting relations definitions in YAML frontmatter Evidence: Relations are defined as JSON inside metadata and YAML outside Action: Consolidate into a single YAML structure under metadata

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/lint-overlay/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Evaluation artifact exists but contains zero test cases Evidence: Eval summary reports 0 cases; target for certification is 10 Action: Author 10+ cases including hard-negatives and boundary tests

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### mutation-testing
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/mutation-testing/SKILL.md
Content score: 93 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.

Content findings:
- [HIGH] Instructional Depth: Expertly distinguishes behavioral verification from structural coverage through precise mental models, operator catalogs, and robust academic grounding (Just et al. 2014). Evidence: Mental model, operator table, and 'Do NOT Use When' sections. Action: Maintain current content depth for future revisions.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/mutation-testing/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Evaluation suite is entirely missing despite being 'planned,' with zero cases to verify agent routing or application accuracy. Evidence: Static eval summary shows 0 cases; audit-state.json marks eval_artifacts as planned. Action: Author 10+ evaluation cases covering survivor classification and CI strategy.
- [MEDIUM] Audit State: Comprehension and application verdicts remain UNVERIFIED, and routing evaluation is absent, leaving the skill's production reliability unproven. Evidence: Audit summary shows UNVERIFIED for comprehension and absent routing_eval. Action: Run routing benchmarks and author application-level eval cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### owasp-security
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/owasp-security/SKILL.md
Content score: 98 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Consolidate 'Concept' sections into a single, unified definition.

Content findings:
- [INFO] Grounding: Masterful integration of 2025 taxonomy with 2021 compatibility and AI-specific vulnerability data. Evidence: SKILL.md provides a 10-point mapping table and specific GenAI risk stats from 2025/2026 reports. Action: Preserve as the primary security-review standard.
- [LOW] Structure: Redundant 'Concept of the Skill' headers and overlapping definitions create minor instructional friction. Evidence: Section headers appear twice at lines 112 and 116 with slightly different wording. Action: Consolidate 'Concept' sections into a single, unified definition.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/owasp-security/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Zero executable eval cases or prompts exist, leaving the skill's application performance entirely unmeasured. Evidence: Eval summary shows 0 cases, prompts, and assertions; audit-state confirms UNVERIFIED status. Action: Draft 10+ high-fidelity eval cases in a new eval-set.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### performance-budgets
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/performance-budgets/SKILL.md
Content score: 94 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Retain as a gold standard for quality-assurance skill structures

Content findings:
- [INFO] Mental Model: The four-part budget framework (metric, threshold, percentile, consequence) provides exceptionally clear, actionable primitives for agent execution. Evidence: SKILL.md mental_model section Action: Retain as a gold standard for quality-assurance skill structures
- [MEDIUM] Boundaries: Strong mechanism-based separation from performance-engineering prevents routing overlap by distinguishing the 'contract' from the 'activity'. Evidence: concept_boundary and relations.suppresses Action: Maintain distinct ownership of thresholds versus optimization activities

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/performance-budgets/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: The skill lacks all functional evaluation artifacts, including cases, assertions, and baseline prompts, preventing any automated quality verification. Evidence: Eval summary shows 0 cases; audit-state: unverified Action: Author 10+ evaluation cases in eval.json

Blockers:
- opus: exit 1
- gemini-flash: timeout
- deepseek-flash: timeout
- mimo: timeout

### performance-engineering
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/performance-engineering/SKILL.md
Content score: 80 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] Instructional Model: High-quality mental model; the 'Measure first' philosophy and 7-step method provide rigorous, actionable agent guidance. Evidence: Method and Philosophy sections. Action: Retain current instructional depth.
- [MEDIUM] Metadata Integrity: Metadata protocol mismatch; content follows v8 patterns but provenance labels claim v5, creating potential tool-chain ambiguity. Evidence: Metadata skill_graph_protocol: v5. Action: Update provenance to Protocol v8.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/performance-engineering/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Critical verification gap; the skill references an eval artifact, but the static summary indicates zero cases exist. Evidence: Eval summary cases: 0. Action: Author 10+ varied test cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### performance-testing
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/performance-testing/SKILL.md
Content score: 95 (A)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- No material content finding from this pass.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/performance-testing/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- opus: exit 1
- gemini-flash: exit 0
- deepseek-flash: timeout
- mimo: timeout

### property-based-testing
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/property-based-testing/SKILL.md
Content score: 92 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.

Content findings:
- No material content finding from this pass.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/property-based-testing/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- opus: exit 1
- gemini-flash: exit 0
- deepseek-flash: timeout
- mimo: timeout

### security-fundamentals
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/security-fundamentals/SKILL.md
Content score: 95 (A)
Eval readiness score: 58 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Promote stability to stable.

Content findings:
- [INFO] grounding: Foundational grounding in 1975 Saltzer-Schroeder principles and Shostack frameworks provides a property-based security model superior to simple checklists. Evidence: SKILL.md bibliography and philosophical sections. Action: Promote stability to stable.
- [MEDIUM] boundary: Mechanistic boundary logic successfully partitions this skill from adjacent specialized territory like prompt-injection-defense and owasp-security. Evidence: Concept_boundary and 'Do NOT Use When' table. Action: None.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 13 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/security-fundamentals/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-design: Evaluation suite is functionally blind; 13 cases exist but zero assertions or expected outputs are defined for automated grading. Evidence: Eval summary shows expected=0 and assertions=0. Action: Implement pass/fail assertions for all cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### seo-strategy
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/seo-strategy/SKILL.md
Content score: 72 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Partial authored skill content; improve clarity, boundaries, procedure, or grounding.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 4 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [LOW] reusable-procedure: Programmatic SEO patterns and thin-content guardrails offer robust safety for automated page generation. Evidence: Section 2 includes 5 guardrails and a clear dynamic route architecture. Action: Ensure guardrails are tested in future evals.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/seo-strategy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [INFO] philosophy: Exceptional distinction between auditing and strategy prevents agents from misapplying diagnostics during build tasks. Evidence: Philosophy section and 'Do NOT Use When' table provide clear operational boundaries. Action: Preserve this distinction during future merges.
- [HIGH] eval-readiness: Total lack of eval cases prevents automated quality tracking or certification of routing accuracy. Evidence: Audit summary shows eval_artifacts are 'planned' with 0 cases. Action: Generate 10+ cases targeting SaaS and programmatic scenarios.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### snapshot-testing
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/snapshot-testing/SKILL.md
Content score: 95 (A)
Eval readiness score: 63 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Keep as a benchmark for other skills.

Content findings:
- [INFO] Reasoning Strategy: The wedding photograph analogy perfectly captures the core mechanism of snapshot testing without relying on specific tools. Evidence: Found in Analogy section of SKILL.md. Action: Keep as a benchmark for other skills.
- [INFO] Grounding: Comprehensive stability discipline and failure mode mapping provides excellent grounding for real-world application. Evidence: Stability Sources table and Grounding failure modes. Action: Maintain as high-signal grounding example.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/snapshot-testing/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Evaluation Design: Eval artifacts lack assertions, preventing automated verification despite a healthy case count. Evidence: Audit summary reports 15 cases but 0 assertions. Action: Populate assertions in application.json and comprehension.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### test-coverage-strategy
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/test-coverage-strategy/SKILL.md
Content score: 95 (A)
Eval readiness score: 59 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] Content Quality: Deep integration of safety-critical standards and AI-gen risks provides exceptional strategic depth. Evidence: SKILL.md MC/DC and AI sections. Action: None; content is exemplary.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 15 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is MIXED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/test-coverage-strategy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Reliability: Application verdict is MIXED, indicating potential ambiguity in strategic case grading. Evidence: Audit application_verdict. Action: Refine MIXED cases for clarity.
- [LOW] Eval Readiness: Missing routing_eval and unverified status prevent full certification. Evidence: Audit summary fields. Action: Add routing_eval and verify.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### test-doubles-design
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/test-doubles-design/SKILL.md
Content score: 93 (A)
Eval readiness score: 13 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Run skill-graph-drift.js to record hashes for provided canonical URLs.

Content findings:
- [INFO] Instructional Quality: Exceptional depth regarding Meszaros’s taxonomy and the London/Detroit school distinction provides high activation value for agents. Evidence: Mental model and purpose sections cite Fowler and Meszaros with precise definitions. Action: Maintain this level of theoretical grounding in future QA skills.
- [LOW] Grounding/Drift: Detailed key sources are provided but metadata lacks truth-source hashes to automate drift detection for external references. Evidence: Key Sources section is robust; metadata drift_check is missing verification hashes. Action: Run skill-graph-drift.js to record hashes for provided canonical URLs.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/test-doubles-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Evaluation is completely absent; zero test cases exist to verify routing or comprehension accuracy against the target of 10. Evidence: Static eval summary shows 0 cases; audit summary confirms eval_state is unverified. Action: Author 10+ eval cases covering taxonomy identification and trade-offs.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### test-driven-development
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/test-driven-development/SKILL.md
Content score: 95 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Consolidate to native YAML; shorten description to one sentence.

Content findings:
- [MEDIUM] metadata: Redundant relations and description fields increase token cost and complexity. Evidence: Verbatim scope duplication; relations defined twice (JSON string and YAML). Action: Consolidate to native YAML; shorten description to one sentence.
- [INFO] grounding: Exceptional empirical grounding provides high-signal truth sources for models. Evidence: Cites Microsoft/IBM study and defines school-based failure modes. Action: Retain as benchmark for technical discipline skills.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/test-driven-development/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Zero eval cases prevent verification of comprehension or routing accuracy. Evidence: Static eval summary shows no cases; audit-state is planned. Action: Author eval.jsonl with 10+ cases covering school choice.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### testing-strategy
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/testing-strategy/SKILL.md
Content score: 91 (A)
Eval readiness score: 54 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Keep this core logic as the primary activation mechanism.

Content findings:
- [LOW] Conceptual Grounding: Level selection table provides excellent, risk-based heuristics for test placement. Evidence: Table maps situations to levels with clear rationales for unit through e2e. Action: Keep this core logic as the primary activation mechanism.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 13 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/testing-strategy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Eval cases are structural skeletons lacking grading logic or expected outcomes. Evidence: Summary reports 13 cases but 0 assertions and 0 expected values. Action: Define concrete pass/fail assertions and gold-standard answers for all cases.
- [MEDIUM] Portability: Markdown content contains hardcoded absolute local paths to eval files. Evidence: Evals section explicitly lists absolute paths in the development directory. Action: Remove local path references from SKILL.md to maintain artifact portability.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### type-safety
Path: /Users/jacobbalslev/Development/skills/skills/quality-assurance/type-safety/SKILL.md
Content score: 94 (A)
Eval readiness score: 13 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Retain this framing as a benchmark for quality.

Content findings:
- [INFO] mental-model: The 'Two-layer model' abstraction exceptionally clarifies the distinction between compile-time claims and runtime guarantees. Evidence: SKILL.md frontmatter and mental_model fields. Action: Retain this framing as a benchmark for quality.
- [LOW] grounding: Grounding is excellent, citing seminal academic papers and primary engineering design documents. Evidence: Key Sources section citing Pierce, Siek, and Hejlsberg. Action: No content changes needed; focus on evaluation artifacts.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/quality-assurance/type-safety/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Zero evaluation cases are present, precluding certification and verification of the skill's application. Evidence: Eval summary shows 0 cases and 0 files. Action: Generate 10 test cases in eval.json immediately.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### ansoff-matrix
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/ansoff-matrix/SKILL.md
Content score: 95 (A)
Eval readiness score: 78 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Ensure sibling strategy skills maintain reciprocal suppression logic.

Content findings:
- [INFO] Routing & Boundaries: Exhaustive anti-examples and suppression logic clearly distinguish product-market growth from portfolio allocation and situational analysis. Evidence: Relations section suppresses bcg-matrix and swot-tows with specific technical justifications. Action: Ensure sibling strategy skills maintain reciprocal suppression logic.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/ansoff-matrix/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [INFO] Logic & Workflow: Mandatory baseline definition prevents the common failure mode of jumping to classification without establishing what is currently 'existing'. Evidence: Workflow Step 1 requires explicit Actor, Current Product, and Current Market definitions. Action: Keep the baseline requirement as a hard constraint in the workflow.
- [MEDIUM] Eval Readiness: Evaluation suite is structurally sound with a good mix of boundary cases, but lacks formal truth and application verification. Evidence: Audit summary shows UNVERIFIED truth and application verdicts despite 14 valid cases. Action: Run full verification suite to certify truth and application accuracy.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### balanced-scorecard
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/balanced-scorecard/SKILL.md
Content score: 93 (A)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- No material content finding from this pass.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 28 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/balanced-scorecard/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- opus: exit 1
- gemini-flash: exit 0
- deepseek-flash: timeout
- mimo: timeout

### bayesian-reasoning
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/bayesian-reasoning/SKILL.md
Content score: 95 (A)
Eval readiness score: 74 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Merge relations into a single metadata-governed block.

Content findings:
- [INFO] Instructional Design: Excellent adaptation of Bayesian theory into qualitative agent workflows avoiding fake precision. Evidence: Philosophy section and Workflow Step 5 prioritize confidence bands over decimals. Action: Maintain this approach as a template for reasoning skills.
- [LOW] Metadata: Redundant relations blocks exist in both metadata and as a top-level YAML key. Evidence: Relations defined twice in the frontmatter block. Action: Merge relations into a single metadata-governed block.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/bayesian-reasoning/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Evaluation artifacts contain zero assertions, preventing automated verification of agent performance. Evidence: Eval summary reports 14 cases but 0 assertions. Action: Add regex or LLM-gradable assertions to eval cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### bcg-matrix
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/bcg-matrix/SKILL.md
Content score: 93 (A)
Eval readiness score: 62 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] Scope & Boundaries: Exceptional exclusion logic and routing to 7+ adjacent strategy frameworks ensures high activation precision and prevents domain overlap errors. Evidence: Detailed 'Do NOT Use When' table and metadata suppressions define precise handoff points. Action: Maintain as a pattern for strategy-class skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 21 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/bcg-matrix/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Design: Evaluation suite contains 21 cases but lacks explicit assertions, which may limit the automated detection of subtle reasoning failures. Evidence: eval_summary reports 21 cases and 8 boundary cases but 0 assertions. Action: Implement assertions in eval files to verify specific cash-flow and allocation logic.
- [HIGH] Certification: The skill is structurally complete but remains UNVERIFIED across all functional audit dimensions, preventing formal certification. Evidence: audit-state.json shows UNVERIFIED for truth, comprehension, and application verdicts. Action: Run full eval suite and update audit-state.json to reflect verified status.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### blue-ocean-strategy
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/blue-ocean-strategy/SKILL.md
Content score: 96 (A)
Eval readiness score: 69 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Repair broken truth_source paths and execute a fresh drift check.

Content findings:
- [INFO] Content Quality: Exceptional instructional depth on ERRC and Six Paths frameworks ensures agents distinguish value innovation from simple differentiation through strict value-cost trade-off logic. Evidence: Sections 3 and 5 provide precise 'good vs weak' answer benchmarks for market boundary reconstruction and factor elimination. Action: Maintain this instructional rigor as a benchmark for other strategy-domain skills.
- [HIGH] Grounding: The truth_verdict is BROKEN, indicating the skill cannot be verified against its declared sources, likely due to invalid internal paths or content drift. Evidence: Audit summary explicitly reports truth_verdict: BROKEN. Action: Repair broken truth_source paths and execute a fresh drift check.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/blue-ocean-strategy/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Design: The eval suite meets volume targets with 14 cases but lacks assertions and baselines, preventing programmatic validation of the skill's high-quality instructions. Evidence: Static eval summary shows 14 cases but 0 assertions and 0 baseline. Action: Refactor the 14 eval cases to include semantic and structural assertions.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### constraint-awareness
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/constraint-awareness/SKILL.md
Content score: 91 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [HIGH] Content: Exceptional mental model mapping TOC to AI-native workflows. Evidence: Sections 1-4 provide dense, actionable logic. Action: Maintain content as a strategy baseline.
- [MEDIUM] Protocol: Stability marked as experimental despite high maturity. Evidence: metadata.stability: experimental Action: Promote to stable once evals are present.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/constraint-awareness/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Complete absence of evaluation artifacts. Evidence: Eval summary shows 0 cases; status is unverified. Action: Author 10+ cases covering routing and comprehension.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### epistemic-grounding
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/epistemic-grounding/SKILL.md
Content score: 95 (A)
Eval readiness score: 53 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.

Content findings:
- [INFO] Pedagogical Depth: Exceptional grounding in Toulmin primitives and modern AI safety literature ensures high-fidelity claim verification. Evidence: Cites Wallat (2024), Onweller (2026), and Liu (2025). Action: Maintain as the benchmark for reasoning-strategy content.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 5 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/epistemic-grounding/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 5 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/epistemic-grounding/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Case Volume: Evaluation suite is significantly undersized for a skill of this complexity and scope. Evidence: Eval summary reports only 5 total cases. Action: Expand to 10+ cases including adversarial claim-state scenarios.
- [HIGH] Assertion Rigor: Zero assertions in the eval artifact render the test suite non-functional for automated verification. Evidence: Eval summary explicitly lists assertions: 0. Action: Implement semantic assertions and LLM-rubrics for each case.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### expected-value
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/expected-value/SKILL.md
Content score: 92 (A)
Eval readiness score: 77 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [LOW] Instructional Clarity: Exceptional mental model and analogy clarify the long-run portfolio nature of EV vs single-trial outcomes. Evidence: Section 11 'Single-trial promise' and 'Misconception' text. Action: None required.
- [LOW] Boundary Mapping: Precise suppression rules for Bayesian and prioritization prevent common routing collisions in agent loops. Evidence: Relations block in frontmatter and Section 10 table. Action: None required.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/expected-value/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Infrastructure: Case count meets target, but zero assertions suggest reliance on simple matching rather than granular logic. Evidence: Eval summary stats showing 14 cases but 0 assertions. Action: Add specific assertions to JSON evals to improve grader precision.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### first-principles-thinking
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/first-principles-thinking/SKILL.md
Content score: 89 (B)
Eval readiness score: 61 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] instructional design: Elite procedure; the derivation chain and primitive classification tables provide a high-precision mental model for reconstruction. Evidence: Workflow steps 2-5 in SKILL.md Action: Maintain as gold standard for reasoning skills.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/first-principles-thinking/evals/eval-set.json, /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/first-principles-thinking/evals/evals.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/first-principles-thinking/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval automation: Eval set contains zero assertions, making automated verification impossible and requiring manual judgment for every run. Evidence: Static eval summary reports 0 assertions. Action: Add LLM-graded or pattern-match assertions to all cases.
- [MEDIUM] eval coverage: Case count is below the certification floor of 10, limiting the breadth of verified activation. Evidence: Static eval summary: 8 cases. Action: Add 2 boundary cases involving 'physics cosplay' anti-patterns.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### inversion
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/inversion/SKILL.md
Content score: 91 (A)
Eval readiness score: 65 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [LOW] clarity: Procedural guidance is exceptionally detailed, offering specific inversion prompts for various target types like goals and metrics. Evidence: SKILL.md contains mapping tables for target-to-prompt and failure-path-to-control conversion. Action: Maintain this level of tactical depth in related reasoning skills.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/inversion/evals/eval-set.json, /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/inversion/evals/evals.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/inversion/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval_readiness: Evaluation set is slightly under the target volume for robust verification. Evidence: Eval summary reports 8 cases; protocol target is 10 for high-confidence certification. Action: Add two additional cases focusing on boundary conditions.
- [MEDIUM] eval_design: Evaluation lacks explicit assertions to verify specific reasoning quality beyond basic text matching. Evidence: Eval summary shows 0 assertions across 8 cases. Action: Implement assertions to check for causal path specificity.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### kano-model
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/kano-model/SKILL.md
Content score: 93 (A)
Eval readiness score: 76 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] grounding: Exceptional grounding using original J-Stage academic sources and ASQ standards. Evidence: Truth sources include specific Japanese research articles and ASQ quality resources. Action: Maintain links for high-fidelity truth-source lookup.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/kano-model/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval-readiness: Case count is robust but lacks recorded assertions for automated validation. Evidence: Eval summary shows 14 cases but 0 assertions and 0 baseline. Action: Define specific pass/fail assertions for the 14 cases.
- [MEDIUM] audit-readiness: Audit state file is present but contains no verified verdicts. Evidence: Audit summary lists truth, comprehension, and application as UNVERIFIED. Action: Complete a manual or automated audit pass to verify content.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### mckinsey-7s
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/mckinsey-7s/SKILL.md
Content score: 96 (A)
Eval readiness score: 61 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.

Content findings:
- [INFO] Logic: Elite interdependency mapping prevents checklist failure. Evidence: Step 4 interaction map and patterns. Action: Maintain logic depth.
- [INFO] Currency: Proactive integration of 2025 McKinsey framework. Evidence: Domain Context and Reference citations. Action: None required.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/mckinsey-7s/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/mckinsey-7s/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Eval suite lacks automated assertions and volume. Evidence: 0 assertions and 8 cases vs 10 target. Action: Add 2 cases and validation assertions.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### mental-models
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/mental-models/SKILL.md
Content score: 90 (A)
Eval readiness score: 55 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] instructional-quality: Outstanding theoretical grounding and practical application tables provide high activation value. Evidence: SKILL.md sections on failure modes and model layers are comprehensive and actionable. Action: Maintain as a gold standard for reasoning-strategy skills.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 5 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/mental-models/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 5 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/mental-models/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-completeness: Eval suite is significantly under-populated for a skill of this complexity. Evidence: Summary shows only 5 cases provided against the target of 10. Action: Add 5+ high-intent cases including hard negatives and boundary tests.
- [MEDIUM] eval-design: Total lack of assertions prevents automated validation of agent comprehension. Evidence: Eval summary reports 0 assertions; audit state confirms unverified application. Action: Define specific LLM-judge assertions for all eval cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### okrs
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/okrs/SKILL.md
Content score: 90 (A)
Eval readiness score: 67 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] Procedural Logic: Exceptional transformation logic for converting activity-based goals into outcome-oriented metrics. Evidence: Section 3 provides specific 'Activity-to-Outcome' conversion tables. Action: Maintain current detail level.
- [LOW] Grounding: Strong guardrails against industry anti-patterns like compensation coupling and task lists. Evidence: Grounding failure modes list 'okrs_used_as_compensation_evaluation' and 'sandbagged_goals'. Action: None required.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 22 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/okrs/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Automation: The evaluation suite lacks programmatic assertions, limiting automated verification effectiveness. Evidence: Static summary reports 22 cases with 0 assertions. Action: Add LLM-graded assertions to verify quantitative targets and baselines.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### pattern-recognition
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/pattern-recognition/SKILL.md
Content score: 92 (A)
Eval readiness score: 78 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] mental_model: Mental model is expertly grounded in cognitive science and includes crucial thresholds to prevent over-abstraction and pareidolia. Evidence: Cites Klein/Alexander; defines 3-instance threshold rule. Action: Use as reference for all reasoning-strategy skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 13 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/pattern-recognition/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [INFO] clarity: Actionable grep patterns and the 6-step loop provide immediate utility for auditing tasks and systemic bug prevention. Evidence: Loop description and SCSS/SQL grep examples in sections 2 and 5. Action: None; content sets a high bar for strategic skills.
- [MEDIUM] eval_readiness: Eval suite meets case volume targets and includes hard negatives but lacks automated assertions for scalable verification. Evidence: Eval summary reports 13 cases but 0 assertions. Action: Implement string or LLM-graders in eval-set.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### pestel
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/pestel/SKILL.md
Content score: 96 (A)
Eval readiness score: 65 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] content: Exceptional handling of PESTEL variants and multi-level (LoNGPESTLE) friction analysis. Evidence: Section 1, 7, and variant table cover complex interaction mechanisms extensively. Action: Maintain this level of detail for reasoning-strategy skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/pestel/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Evaluation artifacts contain zero assertions across all fourteen cases. Evidence: Eval summary reports 14 cases and 14 prompts but 0 assertions. Action: Add pass/fail criteria and assertions to comprehension.json and evals.json.
- [MEDIUM] eval_readiness: Skill remains unverified for truth and application despite high content quality. Evidence: Audit summary shows structural PASS but UNVERIFIED truth and application verdicts. Action: Perform formal verification against grounding sources to move audit state to PASSED.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### playing-to-win
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/playing-to-win/SKILL.md
Content score: 93 (A)
Eval readiness score: 66 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Promote as a gold-standard reference for reasoning skills.

Content findings:
- [LOW] content: Mental model and workflow are highly actionable, providing clear templates and fit-checks for strategy extraction. Evidence: SKILL.md 'Workflow' and 'Output Template' sections. Action: Promote as a gold-standard reference for reasoning skills.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/playing-to-win/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: The evaluation artifact contains 14 cases but 0 assertions, preventing automated grading and regression testing. Evidence: Static eval summary reports zero assertions. Action: Add LLM-graded assertions to evals/evals.json.
- [MEDIUM] audit_state: Truth, comprehension, and application verdicts are UNVERIFIED, indicating the skill has not yet been certified. Evidence: Audit summary shows PASS for structure but UNVERIFIED for quality. Action: Run the skill-graph-audit pipeline.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### porters-five-forces
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/porters-five-forces/SKILL.md
Content score: 93 (A)
Eval readiness score: 71 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: No content changes needed; maintain as a framework benchmark.

Content findings:
- [INFO] content-clarity: Mental model and boundary definitions are exceptionally clear and actionable. Evidence: SKILL.md includes detailed structural driver tables and anti-pattern repairs. Action: No content changes needed; maintain as a framework benchmark.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/porters-five-forces/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: The evaluation suite remains unverified with zero routing coverage recorded. Evidence: audit-state.json lists eval_state as unverified and routing_eval as absent. Action: Run the evaluation harness and update the audit-state metadata.
- [MEDIUM] eval-design: Evaluation cases lack assertions, relying on implicit grading. Evidence: Eval summary reports 0 assertions for 14 cases. Action: Implement LLM-graded rubrics or specific assertions in evals.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### positioning
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/positioning/SKILL.md
Content score: 93 (A)
Eval readiness score: 67 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [HIGH] Reasoning Depth: Workflow provides exceptional 10-step sequence from alternatives to GTM implications, ensuring high-fidelity application of Dunford's method. Evidence: SKILL.md Workflow sections 1-10 Action: Maintain high-fidelity procedural instructions

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/positioning/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Readiness: High case count provides good coverage but zero assertions prevent automated pass/fail verification in the eval artifact. Evidence: Eval summary assertions: 0 Action: Add LLM-as-a-judge assertions to evals.json
- [MEDIUM] Audit Health: Audit summary reports BROKEN truth verdict, suggesting source drift or hash mismatch in the external audit-state file. Evidence: Audit summary truth_verdict: BROKEN Action: Re-verify grounding sources and update audit-state

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### principled-negotiation
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/principled-negotiation/SKILL.md
Content score: 94 (A)
Eval readiness score: 71 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [HIGH] Content: Precise distinction between positions and interests. Evidence: Section 3 prevents agents from using 'soft positions'. Action: None required.
- [INFO] Grounding: Strong alignment with Harvard PON standards. Evidence: Extensive truth sources and failure mode mapping. Action: None required.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/principled-negotiation/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Design: Lack of programmatic or LLM-grade assertions. Evidence: 14 cases present but zero assertions defined. Action: Add LLM-as-a-judge assertions.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### problem-framing
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/problem-framing/SKILL.md
Content score: 79 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] Scope: The skill provides exceptional clarity in its negative scope, preventing accidental activation for engineering-specific debugging tasks. Evidence: Do NOT Use section lists bug-locating and diagnosis as exclusions. Action: Preserve these specific exclusions during future content iterations.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/problem-framing/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: The skill lacks any functional evaluation artifacts, leaving routing accuracy and instructional performance entirely unverified by the harness. Evidence: Eval summary shows 0 cases and prompts; audit-state marks artifacts as planned. Action: Author 10+ evaluation cases including boundary prompts and assertions.
- [MEDIUM] Metadata: Internal documentation and export provenance fields show conflicting protocol versions, creating ambiguity for automated audit tools. Evidence: Frontmatter comments reference v8 while provenance field specifies v5. Action: Unify metadata under Protocol v8 and update export fields.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### scenario-planning
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/scenario-planning/SKILL.md
Content score: 92 (A)
Eval readiness score: 64 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] Methodology: Exceptional workflow depth including specific templates for driver separation, scenario logic tests, and strategic stress-testing across multiple plausible futures. Evidence: SKILL.md workflow sections 1-8 Action: Maintain current content standards

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 22 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/scenario-planning/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Evaluation artifact contains 22 cases but zero assertions, meaning correctness is not programmatically verified during automated runs. Evidence: Eval summary (assertions: 0) Action: Add LLM-graded or regex assertions
- [MEDIUM] Certification: Audit state remains unverified for truth and application dimensions despite a passing structural verdict and existing eval files. Evidence: Audit summary (UNVERIFIED states) Action: Complete human-in-the-loop truth verification

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### second-order-thinking
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/second-order-thinking/SKILL.md
Content score: 91 (A)
Eval readiness score: 62 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] instructional design: Mental model primitives and the actor-based response matrix provide exceptional grounding for operationalizing complex system-thinking tasks. Evidence: SKILL.md sections 'Mental model' and 'Workflow Step 4'. Action: Maintain current depth; use as a structural template for adjacent reasoning skills.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/second-order-thinking/evals/eval-set.json, /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/second-order-thinking/evals/evals.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/second-order-thinking/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] eval readiness: The evaluation suite size is below the recommended threshold of 10 cases required for robust skill certification. Evidence: Static eval summary reports 8 cases present. Action: Author 2 additional cases focusing on subtle boundary scenarios or hard-to-detect feedback loops.
- [HIGH] eval readiness: Complete absence of assertions prevents the eval artifacts from functioning as a meaningful quality gate or regression suite. Evidence: Eval summary reports 0 assertions across all 8 cases. Action: Implement model-graded assertions to verify the presence of multi-horizon 'and then what' causal chains.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### seven-powers
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/seven-powers/SKILL.md
Content score: 95 (A)
Eval readiness score: 58 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- No material content finding from this pass.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 16 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/seven-powers/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- opus: exit 1
- gemini-flash: exit 0
- deepseek-flash: timeout
- mimo: timeout

### stp-marketing
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/stp-marketing/SKILL.md
Content score: 98 (A)
Eval readiness score: 79 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] Sophistication: Superior modern context regarding brand availability and privacy shifts. Evidence: Mental availability and Privacy Sandbox content. Action: Maintain high-quality strategic sections.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 21 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/stp-marketing/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Rigor: Eval suite lacks negative density and outcome assertions for 21 cases. Evidence: 1 hard negative and 0 assertions. Action: Increase hard negatives and add assertions.
- [LOW] Audit State: Audit state is unverified across truth and application dimensions. Evidence: Audit summary verdicts show UNVERIFIED. Action: Execute truth and application verification loops.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### swot-tows
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/swot-tows/SKILL.md
Content score: 96 (A)
Eval readiness score: 75 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] Content Quality: Superior separation of internal/external factors and clear TOWS crossing logic transforms generic SWOT into actionable strategy. Evidence: SKILL.md § Workflow Step 2 and 5 Action: Preserve the evidence/confidence axis as a core reasoning standard.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/swot-tows/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Readiness: The evaluation suite meets case volume targets but the audit state remains unverified. Evidence: Eval summary: 14 cases; Audit: eval_state unverified. Action: Perform a verified grader run to move from provisional to certified.
- [LOW] Eval Design: Zero assertions reported in the evaluation summary suggests a lack of automated grading criteria. Evidence: Static eval summary: assertions 0. Action: Enhance eval JSONs with specific assertions for factor classification accuracy.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### task-analysis
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/task-analysis/SKILL.md
Content score: 77 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [MEDIUM] protocol-conformity: Provenance block claims v5 protocol while metadata fields utilize v8 structure. Evidence: skill_graph_protocol is v5; taxonomy_domain and stability are v8. Action: Update provenance to Protocol v8.
- [LOW] instructional-depth: The hierarchy contract hand-off prevents agents from hallucinating visual layout decisions. Evidence: Protocol step 2 explicitly defers to layout-composition skill. Action: Maintain sharp separation of concerns.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/task-analysis/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] evaluation-design: Zero local test cases exist despite referencing an external global example. Evidence: Static summary reports 0 cases; Evals section links externally. Action: Author 10 local cases in evals/cases.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### three-horizons
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/three-horizons/SKILL.md
Content score: 95 (A)
Eval readiness score: 62 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Standardize this level of detail for strategy skills.

Content findings:
- [INFO] Conceptual Depth: Superior integration of 'collapsed-time' and 'inverse-returns' provides industry-leading strategic nuance. Evidence: SKILL.md sections on modern disruption and 70-20-10 heuristics. Action: Standardize this level of detail for strategy skills.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/three-horizons/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/three-horizons/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Quality: Evaluation suite lacks assertions and falls below the 10-case target count. Evidence: Eval summary reports 8 cases and 0 assertions. Action: Add 2+ cases and define boolean grading assertions.
- [MEDIUM] Audit Maturity: Audit status is incomplete with skipped comprehension baselines and unverified application. Evidence: Audit summary reports SKIPPED_BASELINE and UNVERIFIED status. Action: Execute baseline comprehension runs.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### value-chain-analysis
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/value-chain-analysis/SKILL.md
Content score: 98 (A)
Eval readiness score: 65 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.

Content findings:
- [INFO] Content Sophistication: Integrates Value Shop/Network and Virtual Value Chain lenses, ensuring the skill remains relevant for platforms and digital services beyond classic manufacturing. Evidence: SKILL.md Section 0. Action: None; provides superior mental model guidance.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/value-chain-analysis/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/value-chain-analysis/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: The evaluation summary reports zero assertions, meaning agent responses are not being programmatically validated against specific success criteria. Evidence: Eval summary: 0 assertions. Action: Define assertions for key activity identification and linkage analysis.
- [MEDIUM] Eval Readiness: The evaluation suite contains only 8 cases, failing to meet the standard target of 10 for stable-tier skills. Evidence: Eval summary: 8 cases. Action: Add two additional complex boundary cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### vrio
Path: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/vrio/SKILL.md
Content score: 93 (A)
Eval readiness score: 70 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- No material content finding from this pass.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/reasoning-strategy/vrio/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- opus: exit 1
- gemini-flash: exit 0
- deepseek-flash: timeout
- mimo: timeout

### agent-engineering
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/agent-engineering/SKILL.md
Content score: 97 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Retain current depth and structure.

Content findings:
- [INFO] reusable procedure: High-signal technical pillars and coordination tables provide immediate architectural utility. Evidence: SKILL.md sections on Pillars and Coordination Patterns Action: Retain current depth and structure.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/agent-engineering/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval readiness: Zero executable eval cases exist despite high-quality prompt examples in metadata. Evidence: Eval summary shows 0 cases and 0 files Action: Implement the 8 examples as executable test cases.
- [MEDIUM] audit/provenance: Skill is marked as experimental with unverified audit and absent routing evaluation. Evidence: Audit summary routing_eval: absent Action: Execute routing lint and verify activation.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### architecture-decision-records
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/architecture-decision-records/SKILL.md
Content score: 79 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] Procedure: The Status Decision Table provides high-signal operational guidance for managing ADR lifecycles. Evidence: SKILL.md lines 132-141 Action: Keep; this is a model for reusable decision logic.
- [LOW] Boundaries: Explicit suppression relations and anti-examples clearly delineate this skill from framework-fit-analysis and documentation. Evidence: Metadata relations and lines 151-158 Action: Maintain current routing boundaries.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/architecture-decision-records/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Evaluation Readiness: Skill is missing all 10 target eval cases, preventing certification and validation of routing. Evidence: Eval summary cases: 0 Action: Author 10 cases covering acceptance, rejection, and supersession.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### bounded-context-mapping
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/bounded-context-mapping/SKILL.md
Content score: 78 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] Metadata: Protocol version inconsistency between frontmatter comments and the provenance field. Evidence: Frontmatter identifies as v8 while provenance field specifies v5. Action: Update the provenance field to v8 for protocol consistency.
- [LOW] Instructional Depth: The Philosophy section lacks a concrete example of ubiquitous language collision. Evidence: Theory mentions 'where words mean something different' without demonstrating one. Action: Add a brief 'Order' or 'Product' collision example.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/bounded-context-mapping/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Evaluation: The evaluation suite is entirely absent despite metadata marking it as planned. Evidence: Eval summary reports 0 cases, files, and assertions. Action: Author 10+ evaluation cases to validate routing and comprehension.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### conceptual-modeling
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/conceptual-modeling/SKILL.md
Content score: 98 (A)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Use as reference for other skills.

Content findings:
- [INFO] content-quality: Exceptional procedural depth and clear abstraction boundaries. Evidence: Section 1 architecture and Section 6 anti-patterns. Action: Use as reference for other skills.
- [LOW] routing-logic: Precise suppression rules prevent collision with 7 adjacent skills. Evidence: Comprehensive relations.suppresses block with detailed reasons. Action: Verify these boundaries in future evals.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/conceptual-modeling/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: No physical evaluation cases or prompts exist on disk. Evidence: Static facts report 0 cases and 0 prompts. Action: Author eval/cases.json with 10+ samples.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### data-modeling
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/data-modeling/SKILL.md
Content score: 79 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] Scope/Boundaries: Excellent phase separation between conceptual, data, and migration modeling ensures precise agent routing. Evidence: Detailed 'Do NOT Use When' table and explicit 'suppresses' logic in metadata. Action: None required; content is structurally sound.
- [MEDIUM] Protocol Compliance: Metadata claims Protocol v5 despite utilizing v8-style fields like taxonomy_domain, creating schema ambiguity. Evidence: Line: skill_graph_protocol: Skill Metadata Protocol v5. Action: Align protocol version to v8 and verify all required metadata fields.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/data-modeling/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Evaluation artifact is a hollow placeholder with zero cases, blocking automated certification and verification. Evidence: Eval summary reports 0 cases and 0 prompts despite file path mention. Action: Author 10+ cases covering normalization tradeoffs, provenance, and indexing implications.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### dependency-architecture
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/dependency-architecture/SKILL.md
Content score: 79 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] Instructional Design: Strong conceptual framing treats dependencies as architectural boundaries rather than simple library choices, emphasizing long-term ownership and coupling risks. Evidence: Philosophy section explicitly states 'Dependencies are architecture' and advocates for wrapping volatile SDKs. Action: Retain this framing as a model for other architectural skills.
- [LOW] Methodology: Step-by-step method is logically sequenced but remains abstract regarding the specific tools used to generate the required inventory. Evidence: Method Step 1 calls to 'Inventory dependencies' without mentioning standard ecosystem tools like npm-ls or depcheck. Action: Briefly mention standard discovery tools in the first method step.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/dependency-architecture/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: The skill lacks any executable test cases, rendering the 'experimental' status and routing accuracy impossible to verify. Evidence: Static eval summary shows 0 cases, prompts, and assertions despite metadata claiming artifact is present. Action: Author 10 evaluation cases including boundary and hard-negative scenarios.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### entity-relationship-modeling
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/entity-relationship-modeling/SKILL.md
Content score: 79 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] instructional-design: Excellent use of decision matrices for complex architectural trade-offs. Evidence: SKILL.md sections 2, 6, and 7 (Content surface). Action: Maintain this level of depth in sibling architecture skills.
- [LOW] content-precision: Strong anti-pattern documentation provides high-signal grounding. Evidence: SKILL.md section 9 provides symptoms and fixes (Content surface). Action: Use these anti-patterns as negative test cases in evals.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/entity-relationship-modeling/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Critical absence of evaluation cases prevents certification. Evidence: Static summary reports 0 cases and 0 prompts (Eval surface). Action: Author 10+ cases covering normalization and inheritance mapping.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### event-contract-design
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/event-contract-design/SKILL.md
Content score: 79 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] Scope clarity: Exceptional boundary definition between domain discovery and technical contract design. Evidence: Frontmatter anti_examples and Do NOT Use table. Action: None required.
- [LOW] Technical depth: Method provides rigorous coverage of async patterns like correlation and idempotency. Evidence: SKILL.md Method steps 3 and 7. Action: Ensure fixtures demonstrate these specific fields.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/event-contract-design/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval readiness: Zero registered eval cases despite text references to an external JSON file. Evidence: Static eval summary shows 0 cases and 0 files. Action: Author 10+ eval cases in the referenced path.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### event-storming
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/event-storming/SKILL.md
Content score: 73 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Partial authored skill content; improve clarity, boundaries, procedure, or grounding.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/event-storming/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- opus: exit 1
- gemini-flash: exit 0
- deepseek-flash: timeout
- mimo: timeout

### framework-fit-analysis
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/framework-fit-analysis/SKILL.md
Content score: 94 (A)
Eval readiness score: 17 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Promote to stable following successful verification of new eval cases.

Content findings:
- [INFO] Content Depth: Superior treatment of modern selection factors like AI-readiness and reversibility. Evidence: Detailed sections on AI Indicators and 4-tier Reversibility Scale in SKILL.md. Action: Preserve as the gold standard for architecture meta-skills.
- [LOW] Metadata: Stability marker 'experimental' is overly conservative given the content's maturity. Evidence: Stability: experimental vs 400+ lines of high-quality ATAM-based methodology. Action: Promote to stable following successful verification of new eval cases.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/framework-fit-analysis/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Skill is effectively unverified with zero active evaluation cases or assertions. Evidence: Static eval summary reports 0 cases, 0 prompts, and 0 assertions. Action: Author 10 high-fidelity test cases in the linked eval JSON.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### state-machine-modeling
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/state-machine-modeling/SKILL.md
Content score: 86 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Standardize this section across agent-related skills.

Content findings:
- [INFO] Mental Model: Expertly identifies the 'prompt as state store' anti-pattern in LLM loops, providing a deterministic alternative for agent orchestration. Evidence: Agent and LLM Workflows section. Action: Standardize this section across agent-related skills.
- [INFO] Procedures: The 13-step methodology provides exhaustive, actionable guidance from naming conventions to complex implementation tier selection. Evidence: SKILL.md Method section. Action: Maintain this high density for architecture skills.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/state-machine-modeling/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Skill lacks all necessary evaluation artifacts (cases, prompts, assertions), preventing certification despite superior content quality. Evidence: Static eval summary showing 0 cases. Action: Author 10+ diverse evaluation cases immediately.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### system-interface-contracts
Path: /Users/jacobbalslev/Development/skills/skills/software-architecture/system-interface-contracts/SKILL.md
Content score: 89 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Standardize this triage format across the architecture subject area.

Content findings:
- [INFO] Mental Model: Exceptional framework for contract evolution, distinguishing source, wire, and semantic compatibility alongside a nuanced 'scoped tolerance' robustness model. Evidence: Sections §Compatibility Rules and §Philosophy of the skill. Action: Preserve this depth as a gold standard for architecture skills.
- [MEDIUM] Scope: High-signal boundary triage table prevents overlap with api-design and event-contract-design, ensuring surgical skill activation. Evidence: §Boundary Triage table. Action: Standardize this triage format across the architecture subject area.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-architecture/system-interface-contracts/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Zero registered evaluation cases in the system summary despite SKILL.md referencing an external JSON eval artifact. Evidence: Eval summary: 0 cases, 0 prompts; audit-state: unverified. Action: Register and verify 10+ cases in the referenced JSON file.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### canonical-repo-structure
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/canonical-repo-structure/SKILL.md
Content score: 92 (A)
Eval readiness score: 13 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.

Content findings:
- No material content finding from this pass.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is missing, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/canonical-repo-structure/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- public:false; external reviewer panel skipped for privacy/publication boundary
- opus: public:false; external dispatch skipped
- gemini-flash: public:false; external dispatch skipped
- deepseek-flash: public:false; external dispatch skipped
- mimo: public:false; external dispatch skipped

### debugging
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/debugging/SKILL.md
Content score: 76 (C)
Eval readiness score: 50 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 5 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/debugging/evals/application.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 5 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is REDUNDANT, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/debugging/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Evaluation case count is 50% below target threshold. Evidence: Eval summary shows 5 cases; target is 10. Action: Author 5 additional cases covering edge failures.
- [MEDIUM] eval_readiness: Evaluation artifact lacks executable assertions and baseline data. Evidence: Summary counts show 0 assertions and 0 prompts. Action: Implement assertion logic in application.json.
- [LOW] content: Skill is flagged as redundant by current audit state. Evidence: Audit summary reports application_verdict as REDUNDANT. Action: Tighten scope to differentiate from testing-strategy.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### diagnosis
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/diagnosis/SKILL.md
Content score: 87 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Strong authored skill content; certification is reported separately.
Next action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.

Content findings:
- [INFO] content: Exceptional mental model using the 'triage nurse' metaphor effectively separates diagnosis from execution. Evidence: Philosophy section. Action: None required.
- [LOW] content: Robust evidence safety protocol ensures agents handle sensitive data correctly during triage. Evidence: Section 3 Evidence safety rule. Action: None required.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/diagnosis/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval_readiness: Critical lack of evaluation cases prevents verification of complex classification and escalation logic. Evidence: Static eval summary cases: 0. Action: Author 10+ eval cases covering classification accuracy and timing.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### doc-updater
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/doc-updater/SKILL.md
Content score: 81 (B)
Eval readiness score: 52 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=UNVERIFIED. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] workflow-grounding: Command-driven workflow (git diff/grep) effectively prevents agent hallucination during verification steps. Evidence: Step 4 provides explicit grep syntax Action: Maintain explicit CLI commands in all steps.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 7 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/doc-updater/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 7 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/doc-updater/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-design: Evaluation artifact contains zero assertions or expected outputs, making automated grading impossible. Evidence: eval summary shows assertions: 0 Action: Add regex or LLM-based assertions to all cases.
- [MEDIUM] case-coverage: Current case count of 7 fails the target of 10 for certification-ready skills. Evidence: eval summary shows cases: 7 Action: Add 3 additional edge-case prompts.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### merge-queue
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/merge-queue/SKILL.md
Content score: 69 (D)
Eval readiness score: 13 (F)
Certification status: not certified; missing eval artifacts
Verdict: Partial authored skill content; improve clarity, boundaries, procedure, or grounding.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [HIGH] Grounding: The 'Do NOT Use When' table is empty, leaving boundaries poorly defined for the router. Evidence: Section 'Do NOT Use When' contains 'To be filled during next audit pass'. Action: Define explicit anti-patterns and scenarios where version-control skill must take precedence.
- [LOW] Clarity: The 5-phase Merge Protocol is well-structured and maps specific actions to the CLI tool effectively. Evidence: Section 1: The Merge Protocol table. Action: Continue using this phased approach as the baseline for verification assertions.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/merge-queue/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Evaluation: Skill has zero evaluation artifacts or test cases despite being marked as 'planned'. Evidence: Eval summary shows 0 cases, files, and prompts. Action: Author an eval.json file with 10 cases covering lock acquisition and cleanup failure.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### methodical
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/methodical/SKILL.md
Content score: 88 (B)
Eval readiness score: 64 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add observable assertions or expected elements for each case.

Content findings:
- [INFO] content/grounding: Deeply researched root-cause model and 30+ truth sources provide elite theoretical grounding. Evidence: Grounding section and section 8 Action: Maintain high-fidelity research links.
- [INFO] content/boundaries: Sharp Trio boundaries and explicit Do NOT Use table prevent routing overlap with summarization. Evidence: Concept_boundary and section 11 Action: None.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 13 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/methodical/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval/readiness: High case volume (13) is offset by zero assertions and no baseline comparison. Evidence: Eval summary stats Action: Add assertions and baseline to evals.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### methodology
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/methodology/SKILL.md
Content score: 89 (B)
Eval readiness score: 62 (D)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.

Content findings:
- [INFO] Instructional Depth: Installs a load-bearing methodology/method/process stack that prevents 'cargo cult' execution by agents by explaining the underlying principles of rigor. Evidence: SKILL.md §1 establishes the philosophical framework for the three-layer stack. Action: None; content is high-signal and ready for use.
- [LOW] Grounding: Exceptional grounding in safety-critical standards ensures the skill is anchored in proven engineering reality rather than LLM-generated platitudes. Evidence: SKILL.md Grounding and Key Sources sections provide verifiable links. Action: Maintain these high-integrity links during future version bumps.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 5 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/methodology/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 5 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/methodology/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [MEDIUM] Eval Coverage: Evaluation suite volume is insufficient with only 5 cases provided; fails the target of 10 required for high-confidence certification. Evidence: Static Eval Summary shows 5 cases and 0 assertions present. Action: Expand evaluation suite to 10+ cases including explicit assertions.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### naming-conventions
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/naming-conventions/SKILL.md
Content score: 84 (B)
Eval readiness score: 58 (F)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 14 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/naming-conventions/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.

Blockers:
- opus: exit 1
- gemini-flash: exit 0
- deepseek-flash: timeout
- mimo: timeout

### no-cutting-corners
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/no-cutting-corners/SKILL.md
Content score: 89 (B)
Eval readiness score: 49 (F)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.

Content findings:
- [INFO] Content: Grounding section provides superior technical rationale by citing specific frontier model post-mortems and alignment research. Evidence: Philosophy section citing OpenAI (2025) and Anthropic research. Action: Maintain this depth; it is a reference standard.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 7 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/no-cutting-corners/evals/comprehension.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 7 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/no-cutting-corners/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Design: Suite contains only 7 cases, missing the target of 10, and completely lacks a routing evaluation component. Evidence: Eval summary: 7 cases, routing_eval: absent. Action: Add 3+ routing cases and increase total count to 10+.
- [MEDIUM] Eval Design: Evaluation cases lack defined assertions and expected outputs, preventing automated verification of skill comprehension. Evidence: Eval summary: 0 expected, 0 assertions, 0 baseline. Action: Define expected outputs and assertions in comprehension.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### prioritization
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/prioritization/SKILL.md
Content score: 76 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] Content Innovation: RICE-A framework effectively addresses AI research uncertainty by incorporating Ambiguity as a denominator. Evidence: SKILL.md surface: §1 formula and definitions. Action: Preserve as a core methodology.
- [LOW] Protocol Adherence: Metadata utilizes deprecated taxonomy_domain field instead of the v8 polyhierarchy subjects array. Evidence: SKILL.md surface: metadata block. Action: Migrate field to v8 subjects format.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/prioritization/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Design: The skill lacks any evaluation cases or assertions, preventing automated verification of agent performance. Evidence: Eval surface: summary shows 0 cases. Action: Generate 10 test cases immediately.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### problem-approach-router
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/problem-approach-router/SKILL.md
Content score: 78 (C)
Eval readiness score: 60 (D)
Certification status: has eval artifacts but not certified
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] instruction-clarity: The routing table provides high-utility classification signals that transform fuzzy intent into concrete foundational skill dispatch. Evidence: Signal-to-Route mapping table in the Coverage section. Action: Maintain this structure as the gold standard for router-type skills.

Eval and certification findings:
- [MEDIUM] case quality: Eval coverage has 8 cases, below the target of 10 distinct cases. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/problem-approach-router/evals/eval-set.json, /Users/jacobbalslev/Development/skills/skills/software-engineering-method/problem-approach-router/evals/evals.json Action: Expand evals to 10 meaningful cases with positives, hard negatives, boundary, and regression cases.
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 8 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/problem-approach-router/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-verification: The evaluation set contains zero assertions, rendering the test suite passive and incapable of automated validation. Evidence: Static eval summary shows 0 assertions for 8 cases. Action: Implement LLM-as-a-judge assertions to verify correct routing targets.
- [MEDIUM] eval-coverage: The test suite is under-sampled and lacks boundary cases required to prevent over-activation on implementation tasks. Evidence: Total cases 8 (target 10); boundary cases 0. Action: Add 2 boundary cases targeting near-miss implementation prompts.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### problem-locating-solving
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/problem-locating-solving/SKILL.md
Content score: 83 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] Content: High-quality actionable tables for search-space reduction and boundary localization. Evidence: Sections 3 and 4 provide specific symptom-to-move mappings. Action: Maintain current table structures; they are excellent instructions.
- [MEDIUM] Metadata: Skill marked as experimental despite high content maturity. Evidence: Metadata stability field is set to experimental. Action: Promote to stable once evaluation artifacts are verified.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/problem-locating-solving/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Evaluation: Complete absence of evaluation cases or prompt artifacts. Evidence: Eval summary shows zero cases, prompts, and expected values. Action: Author 10+ evaluation cases covering the locate-to-solve workflow.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### refactor
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/refactor/SKILL.md
Content score: 77 (C)
Eval readiness score: 21 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 2 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] reasoning-strategy: The 'next-change justification' philosophy provides a high-signal filter that effectively prevents speculative or aesthetic-only refactoring. Evidence: SKILL.md Philosophy and Workflow step 2. Action: Maintain this as a mandatory pre-condition for activation.
- [LOW] content-precision: The description and scope fields share significant verbatim text, which can be optimized for routing. Evidence: Description and scope metadata fields overlap significantly. Action: Refine description to focus on specific triggers.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/refactor/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] eval-readiness: Eval summary reports zero cases and prompts despite audit metadata claiming artifacts are present. Evidence: Static Eval summary shows 0 cases/prompts. Action: Author 10+ behavioral cases in examples/evals/refactor.json.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### spec-driven-development
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/spec-driven-development/SKILL.md
Content score: 77 (C)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add concrete anti-examples and adjacent-skill ownership boundaries.

Content findings:
- [MEDIUM] boundary: Boundary/anti-example surface is thin for routing precision. Evidence: Missing or weak anti_examples, concept_boundary, suppresses, or Do NOT Use section. Action: Add concrete anti-examples and adjacent-skill ownership boundaries.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [INFO] Instructional Quality: Robust 7-phase workflow with distinct artifact separation between 'what' and 'how'. Evidence: SKILL.md Workflow section Action: Preserve this structure for methodology skills.
- [LOW] Grounding: Strong external anchoring to IEEE and Spec Kit standards ensures technical accuracy. Evidence: Metadata grounding field Action: None required for this dimension.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/spec-driven-development/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Eval Readiness: Zero evaluation cases defined, making the skill unverifiable for agent execution. Evidence: Audit summary cases: 0 Action: Author eval.json with 10+ functional test cases.

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### task-path-optimization
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/task-path-optimization/SKILL.md
Content score: 89 (B)
Eval readiness score: 74 (C)
Certification status: has eval artifacts but not certified
Verdict: Strong authored skill content; certification is reported separately.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 0 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [INFO] mental_model: Successfully maps Anthropic agent patterns to repo-specific scripts like model-router.js for high grounding. Evidence: Section 3 Agent Patterns Action: none
- [INFO] grounding: Integrates METR research findings to calibrate human-in-the-loop vs autonomous execution paths. Evidence: Section 8 METR Finding Action: none

Eval and certification findings:
- [MEDIUM] eval readiness: Some eval cases lack gradeable assertions. Evidence: 0 assertions across 23 cases Action: Add observable assertions or expected elements for each case.
- [MEDIUM] baseline: Eval artifacts do not visibly encode with-skill versus without-skill or old-skill comparability. Evidence: No baseline/without-skill marker detected in eval JSON text. Action: Add baseline configuration or fields that support delta comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/task-path-optimization/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [LOW] eval_readiness: Strong case count (23) exceeds requirements, but audit reports comprehension and application as UNVERIFIED. Evidence: Audit summary verdicts Action: Run audit verification harness

Blockers:
- opus: exit 1
- deepseek-flash: timeout
- mimo: timeout

### version-control
Path: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/version-control/SKILL.md
Content score: 82 (B)
Eval readiness score: 15 (F)
Certification status: not certified; missing eval artifacts
Verdict: Useful authored skill content with some content-level hardening needed.
Next action: Add or refresh grounding truth sources and verify them through the sidecar.

Content findings:
- [MEDIUM] grounding: Grounding/truth-source evidence is weak or not explicit. Evidence: Detected 1 URL-like truth sources; truth_verdict=PASS. Action: Add or refresh grounding truth sources and verify them through the sidecar.
- [MEDIUM] instructional content: Reusable procedure or mental model is not explicit enough. Evidence: Weak workflow/process/checklist signals in SKILL.md body. Action: Add a concrete procedure, decision model, or verification checklist.
- [HIGH] Agent Safety: Instruction on 'git commit --only' provides critical safety for multi-agent environments to prevent index contamination. Evidence: Path-Limited Commits section in SKILL.md. Action: Retain this section as a core agent-safety requirement.
- [LOW] Router Precision: Suppression relations effectively separate commit boundary management from message naming, reducing routing ambiguity. Evidence: Relations section suppresses 'naming-conventions' and 'refactor'. Action: Add 'guardrails' to 'related' or 'verify_with' to strengthen lifecycle coverage.

Eval and certification findings:
- [HIGH] eval artifacts: No eval JSON artifacts were found, so Agent Skills-style with-skill/baseline readiness is absent. Evidence: No files under evals/*.json Action: Author a 10-case eval set with prompts, expected elements, assertions, and a baseline comparison.
- [MEDIUM] audit state: application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. Evidence: /Users/jacobbalslev/Development/skills/skills/software-engineering-method/version-control/audit-state.json Action: Run or repair application evals until the verdict is APPLICABLE, or record why certification is not applicable.
- [HIGH] Evaluation Coverage: The skill lacks any functional evaluation artifacts, cases, or assertions, leaving it in an unverified state. Evidence: Eval summary shows 0 cases; audit-state 'planned'. Action: Author 10+ test cases covering branching, worktrees, and safety commits.

Blockers:
- opus: exit 1
- gemini-flash: timeout
- deepseek-flash: timeout
- mimo: timeout

## Corpus Summary
- Blocked skills: 138
- Strong but uncertified skills: 162
- Skills missing eval artifacts: 71
- Skills with weak eval artifacts: 115

## Recommended Next Actions
1. Author or repair eval artifacts for every skill with no eval JSON, prioritizing high-scoring uncertified skills first.
2. Expand existing eval sets to 10 cases with positives, hard negatives, boundary cases, and regression-style cases.
3. Add baseline comparability and gradeable assertions to eval sets that currently have prompts/expected text only.
4. Re-run the Behavior Gate for strong skills after eval artifacts are repaired so application_verdict can move from PROVISIONAL/UNVERIFIED to APPLICABLE when earned.