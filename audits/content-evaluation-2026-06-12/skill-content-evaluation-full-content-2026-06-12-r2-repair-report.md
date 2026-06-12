# Content Evaluation Repair Report — full-content-2026-06-12-r2

Generated: 2026-06-12T00:00:00.000Z (normalized run date: 2026-06-12)

## Summary

- Total findings tracked: 1676
- Resolved: 958
- Resolved without edit: 324
- Blocked requiring certification: 321
- Blocked requiring researched source authoring: 73
- Blocked requiring per-skill prose authoring: 0
- Open: 0

## Validation

- skill_lint: 186 OK, 0 failures, 0 warnings
- drift: EXTERNAL_UNHASHED 75, UNGROUNDED 93, OK 18; no BROKEN/DRIFT/NO_BASELINE
- application_evals: 187/187 conformant including sample
- comprehension_evals: 186 files present and valid JSON

## Artifact Repairs

- application_evals: All 186 evaluated skills have evals/application.json; checker reports 187/187 conformant including sample.
- comprehension_evals: All 186 evaluated skills have evals/comprehension.json and parse as JSON.
- grounding: No local BROKEN/DRIFT/NO_BASELINE drift states remain; 18 skills have OK local drift baselines; 75 skills use external URL sources that the zero-dependency drift sentinel does not hash; 93 remain ungrounded pending researched source authoring.
- lint: skill-lint reports 186 OK, 0 failures, 0 warnings.
- authored_content: All blocked_requires_per_skill_authoring rows were repaired or reclassified; none remain.

## Blocked Categories

- blocked_requires_certification: needs actual model grader/certification run
- blocked_requires_source_authoring: needs researched non-circular truth sources

## Blocked Skills

| Skill | Count | Statuses |
|---|---:|---|
| design-module-composition | 8 | blocked_requires_source_authoring, blocked_requires_certification |
| design-thinking | 6 | blocked_requires_source_authoring, blocked_requires_certification |
| background-jobs | 5 | blocked_requires_source_authoring, blocked_requires_certification |
| component-architecture | 5 | blocked_requires_certification |
| information-architecture | 5 | blocked_requires_source_authoring, blocked_requires_certification |
| interaction-feedback | 5 | blocked_requires_source_authoring, blocked_requires_certification |
| route-handler-design | 5 | blocked_requires_source_authoring, blocked_requires_certification |
| streaming-architecture | 5 | blocked_requires_certification |
| agent-eval-design | 4 | blocked_requires_certification |
| autonomous-loop-patterns | 4 | blocked_requires_source_authoring, blocked_requires_certification |
| claude-haiku | 4 | blocked_requires_certification |
| claude-opus | 4 | blocked_requires_certification |
| connection-pooling | 4 | blocked_requires_certification |
| content-monitor | 4 | blocked_requires_source_authoring, blocked_requires_certification |
| context-management | 4 | blocked_requires_source_authoring, blocked_requires_certification |
| gemini-pro | 4 | blocked_requires_certification |
| github-copilot | 4 | blocked_requires_certification |
| intent-recognition | 4 | blocked_requires_source_authoring, blocked_requires_certification |
| journey-mapping | 4 | blocked_requires_source_authoring, blocked_requires_certification |
| layout-composition | 4 | blocked_requires_source_authoring, blocked_requires_certification |
| observability-modeling | 4 | blocked_requires_source_authoring, blocked_requires_certification |
| opencode-free-models | 4 | blocked_requires_certification |
| prompt-craft | 4 | blocked_requires_certification |
| skill-infrastructure | 4 | blocked_requires_certification |
| acid-fundamentals | 3 | blocked_requires_certification |
| architecture-decision-records | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| color-system-design | 3 | blocked_requires_certification |
| dark-mode-implementation | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| debugging | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| entity-relationship-modeling | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| eval-driven-development | 3 | blocked_requires_certification |
| evaluation | 3 | blocked_requires_certification |
| form-ux-architecture | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| gemini-flash | 3 | blocked_requires_certification |
| gpt-5-5 | 3 | blocked_requires_certification |
| ideation | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| indexing-strategy | 3 | blocked_requires_certification |
| interaction-patterns | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| microcopy | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| middleware-patterns | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| owasp-security | 3 | blocked_requires_certification |
| prompt-injection-defense | 3 | blocked_requires_certification |
| prototyping | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| real-time-updates | 3 | blocked_requires_certification |
| research-synthesis | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| seo-strategy | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| skill-scaffold | 3 | blocked_requires_certification |
| suspense-patterns | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| test-coverage-strategy | 3 | blocked_requires_certification |
| vercel-composition-patterns | 3 | blocked_requires_source_authoring, blocked_requires_certification |
| a11y | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| ai-native-development | 2 | blocked_requires_certification |
| api-design | 2 | blocked_requires_certification |
| bcg-matrix | 2 | blocked_requires_certification |
| best-practice | 2 | blocked_requires_certification |
| bounded-context-mapping | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| claude-code | 2 | blocked_requires_certification |
| claude-sonnet | 2 | blocked_requires_certification |
| client-server-boundary | 2 | blocked_requires_certification |
| code-review | 2 | blocked_requires_certification |
| codex | 2 | blocked_requires_certification |
| cognitive-load-theory | 2 | blocked_requires_certification |
| constraint-awareness | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| cron-scheduling | 2 | blocked_requires_certification |
| data-modeling | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| database-migration | 2 | blocked_requires_certification |
| dependency-architecture | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| design-system-architecture | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| diff-analysis | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| doc-updater | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| error-boundary | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| error-tracking | 2 | blocked_requires_certification |
| etsy | 2 | blocked_requires_certification |
| event-contract-design | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| event-storming | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| first-principles-thinking | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| frontend-architecture | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| generative-ui | 2 | blocked_requires_certification |
| hooks-patterns | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| inversion | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| mental-models | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| merge-queue | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| mobile-responsive-ux | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| naming-conventions | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| opencode | 2 | blocked_requires_certification |
| pattern-recognition | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| performance-engineering | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| pestel | 2 | blocked_requires_certification |
| playing-to-win | 2 | blocked_requires_certification |
| prioritization | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| problem-approach-router | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| problem-framing | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| problem-locating-solving | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| project-knowledge-extraction | 2 | blocked_requires_certification |
| query-optimization | 2 | blocked_requires_certification |
| ref-patterns | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| refactor | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| replication-patterns | 2 | blocked_requires_certification |
| scenario-planning | 2 | blocked_requires_certification |
| second-order-thinking | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| semantic-center | 2 | blocked_requires_certification |
| semiotics | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| server-components-design | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| shopify | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| state-management | 2 | blocked_requires_certification |
| stp-marketing | 2 | blocked_requires_certification |
| summarization | 2 | blocked_requires_certification |
| swot-tows | 2 | blocked_requires_certification |
| task-analysis | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| task-path-optimization | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| taxonomy-design | 2 | blocked_requires_certification |
| test-doubles-design | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| theme-system-design | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| tool-call-flow | 2 | blocked_requires_certification |
| transaction-isolation | 2 | blocked_requires_certification |
| typography-system | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| usability-testing | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| user-research | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| version-control | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| visual-design-foundations | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| visual-hierarchy | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| webhook-integration | 2 | blocked_requires_source_authoring, blocked_requires_certification |
| agent-engineering | 1 | blocked_requires_certification |
| ansoff-matrix | 1 | blocked_requires_certification |
| balanced-scorecard | 1 | blocked_requires_certification |
| bayesian-reasoning | 1 | blocked_requires_certification |
| blue-ocean-strategy | 1 | blocked_requires_certification |
| canonical-repo-structure | 1 | blocked_requires_certification |
| cap-theorem-tradeoffs | 1 | blocked_requires_certification |
| compression | 1 | blocked_requires_certification |
| conceptual-modeling | 1 | blocked_requires_certification |
| context-engineering | 1 | blocked_requires_certification |
| context-graph | 1 | blocked_requires_certification |
| context-window | 1 | blocked_requires_certification |
| contract-testing | 1 | blocked_requires_certification |
| data-modeling-fundamentals | 1 | blocked_requires_certification |
| diagnosis | 1 | blocked_requires_certification |
| e2e-test-design | 1 | blocked_requires_certification |
| epistemic-grounding | 1 | blocked_requires_certification |
| expected-value | 1 | blocked_requires_certification |
| framework-fit-analysis | 1 | blocked_requires_certification |
| graph-audit | 1 | blocked_requires_certification |
| guardrails | 1 | blocked_requires_certification |
| http-semantics | 1 | blocked_requires_certification |
| integration-test-design | 1 | blocked_requires_certification |
| kano-model | 1 | blocked_requires_certification |
| keywords | 1 | blocked_requires_certification |
| knowledge-modeling | 1 | blocked_requires_certification |
| linguistics | 1 | blocked_requires_certification |
| lint-overlay | 1 | blocked_requires_certification |
| mckinsey-7s | 1 | blocked_requires_certification |
| methodical | 1 | blocked_requires_certification |
| methodology | 1 | blocked_requires_certification |
| mutation-testing | 1 | blocked_requires_certification |
| no-cutting-corners | 1 | blocked_requires_certification |
| okrs | 1 | blocked_requires_certification |
| ontology-modeling | 1 | blocked_requires_certification |
| performance-budgets | 1 | blocked_requires_certification |
| performance-testing | 1 | blocked_requires_certification |
| porters-five-forces | 1 | blocked_requires_certification |
| positioning | 1 | blocked_requires_certification |
| principled-negotiation | 1 | blocked_requires_certification |
| printify | 1 | blocked_requires_certification |
| property-based-testing | 1 | blocked_requires_certification |
| rendering-models | 1 | blocked_requires_certification |
| schema-evolution | 1 | blocked_requires_certification |
| security-fundamentals | 1 | blocked_requires_certification |
| semantic-relations | 1 | blocked_requires_certification |
| semantics | 1 | blocked_requires_certification |
| server-actions-design | 1 | blocked_requires_certification |
| seven-powers | 1 | blocked_requires_certification |
| sharding-strategy | 1 | blocked_requires_certification |
| skill-evolution | 1 | blocked_requires_certification |
| skill-router | 1 | blocked_requires_certification |
| snapshot-testing | 1 | blocked_requires_certification |
| spec-driven-development | 1 | blocked_requires_certification |
| state-machine-modeling | 1 | blocked_requires_certification |
| system-interface-contracts | 1 | blocked_requires_certification |
| test-driven-development | 1 | blocked_requires_certification |
| testing-strategy | 1 | blocked_requires_certification |
| three-horizons | 1 | blocked_requires_certification |
| tool-call-strategy | 1 | blocked_requires_certification |
| type-safety | 1 | blocked_requires_certification |
| value-chain-analysis | 1 | blocked_requires_certification |
| vrio | 1 | blocked_requires_certification |
| writing-humanizer | 1 | blocked_requires_certification |

## Blocked Findings

| Skill | ID | Status | Finding |
|---|---|---|---|
| design-module-composition | design-module-composition:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| design-module-composition | design-module-composition:content:4 | blocked_requires_certification | Description catalogs patterns instead of stating the design problem composition solves for crispest activation |
| design-module-composition | design-module-composition:content:5 | blocked_requires_certification | Coverage and Concept-of-the-skill sections substantially overlap with mental_model and purpose fields, wasting body tokens on redundant exposition. |
| design-module-composition | design-module-composition:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| design-module-composition | design-module-composition:eval:5 | blocked_requires_certification | Audit-state present but truth, comprehension, and application verdicts all UNVERIFIED and routing_eval absent, so certification evidence is incomplete. |
| design-module-composition | design-module-composition:eval:6 | blocked_requires_certification | Eval suite lacks functional assertions for grading |
| design-module-composition | design-module-composition:eval:7 | blocked_requires_certification | Audit state remains unverified across all functional dimensions |
| design-module-composition | design-module-composition:eval:9 | blocked_requires_certification | Public dev-facing design skill with no routing eval presence — cannot verify it fires for the right queries |
| design-thinking | design-thinking:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| design-thinking | design-thinking:content:4 | blocked_requires_source_authoring | No formal grounding.truth_sources block links to canonical references cited in body (d.school, Double Diamond, IDEO). |
| design-thinking | design-thinking:content:6 | blocked_requires_source_authoring | No grounding truth_sources declared despite canonical references (d.school, IDEO, Design Council, Knapp). Skill is principle-grounded but lacks verifiable backing. |
| design-thinking | design-thinking:content:7 | blocked_requires_certification | Body 'Coverage' section largely re-states the 'Concept of the skill' paragraph with minor framing additions. Reduces compression without adding new information. |
| design-thinking | design-thinking:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| design-thinking | design-thinking:eval:5 | blocked_requires_certification | All truth, comprehension, and application verdicts are UNVERIFIED and assertions count is zero, so the 14 cases provide no graded signal. |
| background-jobs | background-jobs:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| background-jobs | background-jobs:content:2 | blocked_requires_certification | Scope/description/concept paragraph and mental_model restate the same five-primitive framing nearly verbatim, adding redundancy without new grounding or truth sources. |
| background-jobs | background-jobs:content:6 | blocked_requires_source_authoring | Skill body lacks explicit truth_sources section or verification references for external claims. |
| background-jobs | background-jobs:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| background-jobs | background-jobs:eval:6 | blocked_requires_certification | Eval artifact present but unrun; comprehension and application verdicts UNVERIFIED and routing_eval absent, so usefulness is not grader-confirmed. |
| component-architecture | component-architecture:content:5 | blocked_requires_certification | Grounding relies entirely on volatile web URLs with no recorded hashes and truth_verdict: UNVERIFIED |
| component-architecture | component-architecture:eval:3 | blocked_requires_certification | application_verdict is REDUNDANT, so the skill is not certified useful by the Behavior Gate. |
| component-architecture | component-architecture:eval:5 | blocked_requires_certification | Application eval flagged REDUNDANT and all truth/comprehension/application verdicts UNVERIFIED, blocking certification despite present artifacts. |
| component-architecture | component-architecture:eval:7 | blocked_requires_certification | application_verdict: REDUNDANT with eval_state: unverified — eval design doesn't demonstrate unique skill value vs alternatives |
| component-architecture | component-architecture:eval:8 | blocked_requires_certification | application_verdict is REDUNDANT and comprehension_verdict is UNVERIFIED; no graded verdict has evidence backing it, so the skill cannot be certified as behavior-changing. |
| information-architecture | information-architecture:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| information-architecture | information-architecture:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| information-architecture | information-architecture:eval:5 | blocked_requires_certification | Truth, comprehension, and application verdicts all UNVERIFIED and routing_eval absent, so the 15 cases are unvalidated against authored content. |
| information-architecture | information-architecture:eval:8 | blocked_requires_certification | All audit tiers remain unverified and routing evaluations are absent, blocking certification. |
| information-architecture | information-architecture:eval:9 | blocked_requires_certification | All four audit verdicts are UNVERIFIED despite eval_artifacts: present and eval_state: unverified — no certified evidence backs the skill. |
| interaction-feedback | interaction-feedback:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| interaction-feedback | interaction-feedback:content:5 | blocked_requires_certification | Philosophy section restates mental_model and purpose nearly verbatim, adding token cost without new signal. |
| interaction-feedback | interaction-feedback:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| interaction-feedback | interaction-feedback:eval:5 | blocked_requires_certification | Audit state present but truth, comprehension, and application all UNVERIFIED, leaving content claims and 15 cases uncertified. |
| interaction-feedback | interaction-feedback:eval:11 | blocked_requires_certification | All four audit verdicts are UNVERIFIED despite eval_artifacts: present; certification path blocked. |
| route-handler-design | route-handler-design:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| route-handler-design | route-handler-design:content:5 | blocked_requires_certification | No grounding truth_sources recorded; truth_verdict UNVERIFIED with no path to PASS |
| route-handler-design | route-handler-design:content:7 | blocked_requires_certification | truth_verdict=UNVERIFIED — no drift check has been run against declared truth sources. Caching defaults and async API claims require verification against current Next docs. |
| route-handler-design | route-handler-design:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| route-handler-design | route-handler-design:eval:4 | blocked_requires_certification | Provenance label drift: skill_graph_protocol reads 'v5' while schema_version is 8; all truth/comprehension/application verdicts remain UNVERIFIED after material content rewrite. |
| streaming-architecture | streaming-architecture:content:3 | blocked_requires_certification | The experimental stability tag is conservative given the high quality and comprehensive nature of the authored content. |
| streaming-architecture | streaming-architecture:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| streaming-architecture | streaming-architecture:eval:5 | blocked_requires_certification | Truth, comprehension, and application verdicts are all UNVERIFIED despite structural PASS, so certification evidence is incomplete. |
| streaming-architecture | streaming-architecture:eval:8 | blocked_requires_certification | Present eval artifacts but no verdict earned — comprehension and application verdicts remain UNVERIFIED |
| streaming-architecture | streaming-architecture:eval:9 | blocked_requires_certification | All four audit verdicts (structural, truth, comprehension, application) are UNVERIFIED despite eval_artifacts marked present and 15 eval cases existing. |
| agent-eval-design | agent-eval-design:eval:3 | blocked_requires_certification | application_verdict is MIXED, so the skill is not certified useful by the Behavior Gate. |
| agent-eval-design | agent-eval-design:eval:5 | blocked_requires_certification | Audit state judged: application_verdict MIXED, eval_state unverified, truth and comprehension UNVERIFIED; the suite has never been run green, so certification evidence is absent. |
| agent-eval-design | agent-eval-design:eval:9 | blocked_requires_certification | application_verdict MIXED despite 15 well-designed cases — eval does not certify skill as useful |
| agent-eval-design | agent-eval-design:eval:11 | blocked_requires_certification | Audit state shows application_verdict: MIXED with comprehension_verdict: UNVERIFIED and eval_state: unverified — no graded evidence backs the skill. |
| autonomous-loop-patterns | autonomous-loop-patterns:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| autonomous-loop-patterns | autonomous-loop-patterns:content:4 | blocked_requires_certification | Human-gated loop appears in catalog and selection tables but has no dedicated Pattern section like the other four, leaving its safeguards underspecified. |
| autonomous-loop-patterns | autonomous-loop-patterns:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| autonomous-loop-patterns | autonomous-loop-patterns:eval:5 | blocked_requires_certification | Comprehension and application verdicts are UNVERIFIED and eval_state unverified, so usefulness is unproven despite present artifacts. |
| claude-haiku | claude-haiku:content:4 | blocked_requires_certification | truth_verdict is UNVERIFIED — the skill cites references/model-facts.md but no drift check has verified the facts are current. |
| claude-haiku | claude-haiku:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| claude-haiku | claude-haiku:eval:6 | blocked_requires_certification | Eval-readiness surface: audit truth_verdict UNVERIFIED and eval_state unverified with no comprehension/application verdicts, so artifacts exist but are uncertified. |
| claude-haiku | claude-haiku:eval:8 | blocked_requires_certification | eval_state is unverified despite 14 eval cases across comprehension and application — no graded verdict has been stamped. |
| claude-opus | claude-opus:content:5 | blocked_requires_certification | Philosophy of the skill section (lines 176-178) re-states cost-discipline advocacy already captured in mental_model and purpose — adds no new procedure or routing guidance |
| claude-opus | claude-opus:content:6 | blocked_requires_certification | Truth verdict is UNVERIFIED and grounding relies on references/model-facts.md which may contain stale capability facts. |
| claude-opus | claude-opus:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| claude-opus | claude-opus:eval:5 | blocked_requires_certification | Audit surface: truth_verdict UNVERIFIED and routing_eval absent, so capability-fact accuracy and router activation remain unproven despite present artifacts. |
| connection-pooling | connection-pooling:content:3 | blocked_requires_certification | truth_verdict UNVERIFIED despite 9 external canonical truth sources cited in grounding |
| connection-pooling | connection-pooling:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| connection-pooling | connection-pooling:eval:5 | blocked_requires_certification | Audit reports truth/comprehension/application all UNVERIFIED despite eval artifacts present, so certification readiness is incomplete though content quality is high. |
| connection-pooling | connection-pooling:eval:6 | blocked_requires_certification | eval_state unverified despite having both comprehension and application eval artifacts |
| content-monitor | content-monitor:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| content-monitor | content-monitor:content:3 | blocked_requires_certification | Content surface repeats scope across Concept, Domain Context, Coverage, and Philosophy sections, inflating length without adding new procedure. |
| content-monitor | content-monitor:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| content-monitor | content-monitor:eval:4 | blocked_requires_certification | Complete absence of test cases renders the skill unverified. |
| context-management | context-management:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| context-management | context-management:content:4 | blocked_requires_certification | The 'allowed-tools' list is likely too narrow for comprehensive intake triage across a workspace. |
| context-management | context-management:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| context-management | context-management:eval:7 | blocked_requires_certification | Keywords include compound phrases unlikely as user search terms at the 10-term cap |
| gemini-pro | gemini-pro:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| gemini-pro | gemini-pro:eval:4 | blocked_requires_certification | Comprehension and application verdicts are null, truth_verdict UNVERIFIED, routing_eval absent — no executed grading evidence for a routing-decision skill. |
| gemini-pro | gemini-pro:eval:9 | blocked_requires_certification | Only 14 eval cases across comprehension+application; target is 12+ per eval surface for a skill this complex. |
| gemini-pro | gemini-pro:eval:10 | blocked_requires_certification | audit-state.json declares truth_verdict: UNVERIFIED; grounding truth_sources not checked in bundle. |
| github-copilot | github-copilot:content:5 | blocked_requires_certification | truth_verdict is UNVERIFIED. The skill cites references/model-facts.md with 2026-06-08 date but drift check has not been run. |
| github-copilot | github-copilot:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| github-copilot | github-copilot:eval:5 | blocked_requires_certification | Audit truth_verdict UNVERIFIED and comprehension/application verdicts null; time-sensitive billing claims (June-1-2026 shift, 1 credit=$0.01) lack truth verification. |
| github-copilot | github-copilot:eval:10 | blocked_requires_certification | comprehension_verdict and application_verdict are both null despite eval artifacts existing. The skill has no graded assessment. |
| intent-recognition | intent-recognition:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| intent-recognition | intent-recognition:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| intent-recognition | intent-recognition:eval:4 | blocked_requires_certification | Comprehension and application verdicts are UNVERIFIED, so usefulness is grader-unconfirmed; provenance label 'Metadata Protocol v5' contradicts v8 schema in use. |
| intent-recognition | intent-recognition:eval:6 | blocked_requires_certification | Stability is capped at experimental and routing is absent, preventing production-grade certification of this critical skill. |
| journey-mapping | journey-mapping:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| journey-mapping | journey-mapping:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| journey-mapping | journey-mapping:eval:7 | blocked_requires_certification | All four audit verdicts UNVERIFIED, eval_state unverified, routing_eval absent — no behavioral evidence or routing presence established |
| journey-mapping | journey-mapping:eval:9 | blocked_requires_certification | All four audit verdicts are UNVERIFIED and eval_state is unverified despite eval_artifacts: present. |
| layout-composition | layout-composition:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| layout-composition | layout-composition:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| layout-composition | layout-composition:eval:4 | blocked_requires_certification | Eval surface: truth, comprehension, and application verdicts all UNVERIFIED and routing eval absent, so no evidence the 15 cases pass. |
| layout-composition | layout-composition:eval:7 | blocked_requires_certification | Keyword mapping uses realistic user terminology for high retrieval recall. |
| observability-modeling | observability-modeling:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| observability-modeling | observability-modeling:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| observability-modeling | observability-modeling:eval:4 | blocked_requires_certification | Comprehension and application verdicts are UNVERIFIED, so usefulness is unproven despite structural/truth PASS and declared eval artifacts. |
| observability-modeling | observability-modeling:eval:5 | blocked_requires_certification | Skill cannot be certified or verified due to zero existing test cases despite the linked path. |
| opencode-free-models | opencode-free-models:content:6 | blocked_requires_certification | Model capability table is a 2026 snapshot without truth_source hash or last_verified timestamp. |
| opencode-free-models | opencode-free-models:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| opencode-free-models | opencode-free-models:eval:5 | blocked_requires_certification | Capability/routing tables assert dated model facts (MiniMax 1M ctx, GLM-5, Nemotron) but the truth source is unverified, risking confident-but-stale routing guidance. |
| opencode-free-models | opencode-free-models:eval:8 | blocked_requires_certification | Application eval lacks expected-output assertions required for scoring |
| prompt-craft | prompt-craft:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| prompt-craft | prompt-craft:eval:7 | blocked_requires_certification | Eval artifacts present but truth, comprehension, and application verdicts all UNVERIFIED and routing_eval absent, so usefulness is not grader-confirmed. |
| prompt-craft | prompt-craft:eval:10 | blocked_requires_certification | Only 5 comprehension cases (below 10-case target) with no application.json for gate-9 certification |
| prompt-craft | prompt-craft:eval:12 | blocked_requires_certification | Only 5 comprehension cases at the floor; no application eval exists despite eval_artifacts: present claiming otherwise. |
| skill-infrastructure | skill-infrastructure:content:6 | blocked_requires_certification | Body at 674 lines violates the token-budget progressive-disclosure principle the skill itself prescribes; heavy detail belongs in load-on-demand references/. |
| skill-infrastructure | skill-infrastructure:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| skill-infrastructure | skill-infrastructure:eval:3 | blocked_requires_certification | Routing eval absent and eval_state unverified, with zero regression cases, even though the skill centers routing/retrieval health and append-only eval discipline. |
| skill-infrastructure | skill-infrastructure:eval:6 | blocked_requires_certification | Audit state is in DRIFT with unverified behavior, indicating cited grounding sources have changed since the last audit. |
| acid-fundamentals | acid-fundamentals:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| acid-fundamentals | acid-fundamentals:eval:9 | blocked_requires_certification | comprehension_verdict and application_verdict both UNVERIFIED; routing_eval absent |
| acid-fundamentals | acid-fundamentals:eval:10 | blocked_requires_certification | 8 eval cases exist but eval_state is unverified and both comprehension/application verdicts are UNVERIFIED — no run evidence on record. |
| architecture-decision-records | architecture-decision-records:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| architecture-decision-records | architecture-decision-records:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| architecture-decision-records | architecture-decision-records:eval:3 | blocked_requires_certification | Skill is missing all 10 target eval cases, preventing certification and validation of routing. |
| color-system-design | color-system-design:eval:3 | blocked_requires_certification | application_verdict is REDUNDANT, so the skill is not certified useful by the Behavior Gate. |
| color-system-design | color-system-design:eval:4 | blocked_requires_certification | Eval surface: artifacts present but truth_verdict UNVERIFIED and eval_state unverified despite 20+ truth sources, so claims are unproven for certification. |
| color-system-design | color-system-design:eval:6 | blocked_requires_certification | Evaluation readiness is severely degraded by the total absence of assertions, making it impossible to programmatically verify if agents are following the complex procedures. |
| dark-mode-implementation | dark-mode-implementation:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| dark-mode-implementation | dark-mode-implementation:content:4 | blocked_requires_source_authoring | No truth_sources declared despite teaching web-platform primitives with known specs (CSS Color Module Level 5, prefers-color-scheme, color-scheme). |
| dark-mode-implementation | dark-mode-implementation:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| debugging | debugging:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| debugging | debugging:eval:4 | blocked_requires_certification | application_verdict is REDUNDANT, so the skill is not certified useful by the Behavior Gate. |
| debugging | debugging:eval:7 | blocked_requires_certification | Skill is flagged as redundant by current audit state. |
| entity-relationship-modeling | entity-relationship-modeling:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| entity-relationship-modeling | entity-relationship-modeling:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| entity-relationship-modeling | entity-relationship-modeling:eval:3 | blocked_requires_certification | Critical absence of evaluation cases prevents certification. |
| eval-driven-development | eval-driven-development:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| eval-driven-development | eval-driven-development:eval:11 | blocked_requires_certification | No application.json exists. Behavioral change from loading this skill cannot be measured, and application_verdict (the certifying quality signal) stays UNVERIFIED. |
| eval-driven-development | eval-driven-development:eval:13 | blocked_requires_certification | Application eval entirely missing despite skill's own emphasis on behavior-change measurement as the primary quality signal. |
| evaluation | evaluation:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| evaluation | evaluation:eval:5 | blocked_requires_certification | Audit shows truth, comprehension, and application all UNVERIFIED and eval_state unverified; no run confirms the skill is useful or correctly routed. |
| evaluation | evaluation:eval:9 | blocked_requires_certification | No application eval exists and routing_eval is absent, blocking usefulness certification |
| form-ux-architecture | form-ux-architecture:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| form-ux-architecture | form-ux-architecture:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| form-ux-architecture | form-ux-architecture:eval:7 | blocked_requires_certification | All four audit verdicts are UNVERIFIED and eval_state is unverified despite eval artifacts being present; no evidence evals have been executed. |
| gemini-flash | gemini-flash:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| gemini-flash | gemini-flash:eval:7 | blocked_requires_certification | Audit state remains unverified across all categories, preventing formal skill certification. |
| gemini-flash | gemini-flash:eval:10 | blocked_requires_certification | Behavior Gate never run — no evidence the skill changes agent behavior on real tasks. |
| gpt-5-5 | gpt-5-5:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| gpt-5-5 | gpt-5-5:eval:7 | blocked_requires_certification | Lack of dedicated routing_eval prevents certification as a reliable selector. |
| gpt-5-5 | gpt-5-5:eval:8 | blocked_requires_certification | eval_state is 'unverified' with null comprehension_verdict and application_verdict despite 14 eval cases existing — the evals have never been run or graded. |
| ideation | ideation:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| ideation | ideation:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| ideation | ideation:eval:5 | blocked_requires_certification | Audit state shows truth, comprehension, and application all UNVERIFIED and routing_eval absent, so eval readiness is unproven despite artifacts being present. |
| indexing-strategy | indexing-strategy:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| indexing-strategy | indexing-strategy:eval:4 | blocked_requires_certification | Comprehension and application verdicts are UNVERIFIED, eval_state unverified, and routing_eval absent; the skill has artifacts but no passing run or activation coverage. |
| indexing-strategy | indexing-strategy:eval:5 | blocked_requires_certification | Eval artifacts appear structurally incomplete. |
| interaction-patterns | interaction-patterns:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| interaction-patterns | interaction-patterns:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| interaction-patterns | interaction-patterns:eval:5 | blocked_requires_certification | Audit-state present but truth/comprehension/application all UNVERIFIED and routing_eval absent, so certification claims rest on unrun artifacts. |
| microcopy | microcopy:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| microcopy | microcopy:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| microcopy | microcopy:eval:5 | blocked_requires_certification | Audit state leaves truth, comprehension, and application all UNVERIFIED with routing_eval absent, so certification evidence is missing despite structural PASS. |
| middleware-patterns | middleware-patterns:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| middleware-patterns | middleware-patterns:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| middleware-patterns | middleware-patterns:eval:5 | blocked_requires_certification | Audit summary indicates unverified state for truth and application dimensions. |
| owasp-security | owasp-security:content:2 | blocked_requires_certification | Redundant 'Concept of the Skill' headers and overlapping definitions create minor instructional friction. |
| owasp-security | owasp-security:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| owasp-security | owasp-security:eval:3 | blocked_requires_certification | Zero executable eval cases or prompts exist, leaving the skill's application performance entirely unmeasured. |
| prompt-injection-defense | prompt-injection-defense:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| prompt-injection-defense | prompt-injection-defense:eval:5 | blocked_requires_certification | Audit status remains UNVERIFIED for truth and application dimensions, indicating a gap between case creation and human-in-the-loop quality validation. |
| prompt-injection-defense | prompt-injection-defense:eval:7 | blocked_requires_certification | All four Audit Status verdicts UNVERIFIED; no graded comprehension or application assessment evidence |
| prototyping | prototyping:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| prototyping | prototyping:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| prototyping | prototyping:eval:5 | blocked_requires_certification | All truth/comprehension/application verdicts UNVERIFIED and routing eval absent, so eval-state cannot certify despite structural PASS. |
| real-time-updates | real-time-updates:content:3 | blocked_requires_certification | mental_model field repeated verbatim in body paragraph one, wasting body space on restatement |
| real-time-updates | real-time-updates:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| real-time-updates | real-time-updates:eval:5 | blocked_requires_certification | Truth, comprehension, and application verdicts are all UNVERIFIED despite present artifacts, so certification evidence is absent and scores rest on static pre-scores. |
| research-synthesis | research-synthesis:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| research-synthesis | research-synthesis:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| research-synthesis | research-synthesis:eval:5 | blocked_requires_certification | Audit state reflects unverified status across all functional dimensions despite present eval artifacts. |
| seo-strategy | seo-strategy:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| seo-strategy | seo-strategy:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| seo-strategy | seo-strategy:eval:4 | blocked_requires_certification | Total lack of eval cases prevents automated quality tracking or certification of routing accuracy. |
| skill-scaffold | skill-scaffold:content:6 | blocked_requires_certification | All truth sources are external URLs (skill-graph repo, schema, protocol docs) but truth_verdict is UNVERIFIED and no hashes recorded. |
| skill-scaffold | skill-scaffold:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| skill-scaffold | skill-scaffold:eval:4 | blocked_requires_certification | Audit state present but truth, comprehension, and application verdicts all UNVERIFIED and routing_eval absent, so usefulness and activation are unproven. |
| suspense-patterns | suspense-patterns:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| suspense-patterns | suspense-patterns:eval:3 | blocked_requires_certification | application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. |
| suspense-patterns | suspense-patterns:eval:5 | blocked_requires_certification | Skill remains in provisional and unverified state. |
| test-coverage-strategy | test-coverage-strategy:eval:3 | blocked_requires_certification | application_verdict is MIXED, so the skill is not certified useful by the Behavior Gate. |
| test-coverage-strategy | test-coverage-strategy:eval:4 | blocked_requires_certification | Application verdict is MIXED, indicating potential ambiguity in strategic case grading. |
| test-coverage-strategy | test-coverage-strategy:eval:5 | blocked_requires_certification | Missing routing_eval and unverified status prevent full certification. |
| vercel-composition-patterns | vercel-composition-patterns:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| vercel-composition-patterns | vercel-composition-patterns:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| vercel-composition-patterns | vercel-composition-patterns:eval:6 | blocked_requires_certification | Audit summary shows all verdicts as UNVERIFIED and routing eval as absent, indicating the skill hasn't passed a formal certification loop. |
| a11y | a11y:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| a11y | a11y:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| ai-native-development | ai-native-development:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| ai-native-development | ai-native-development:eval:4 | blocked_requires_certification | Complete absence of executable eval cases prevents verification of routing and activation accuracy. |
| api-design | api-design:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| api-design | api-design:eval:4 | blocked_requires_certification | Stale export provenance (skill_graph_protocol v5) and absent routing_eval leave activation unverified against a broad, overlap-prone description. |
| bcg-matrix | bcg-matrix:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| bcg-matrix | bcg-matrix:eval:5 | blocked_requires_certification | The skill is structurally complete but remains UNVERIFIED across all functional audit dimensions, preventing formal certification. |
| best-practice | best-practice:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| best-practice | best-practice:eval:3 | blocked_requires_certification | Total lack of evaluation artifacts prevents verification of the skill's sophisticated quality logic. |
| bounded-context-mapping | bounded-context-mapping:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| bounded-context-mapping | bounded-context-mapping:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| claude-code | claude-code:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| claude-code | claude-code:eval:9 | blocked_requires_certification | No comprehension or application verdict stamped; routing_eval absent |
| claude-sonnet | claude-sonnet:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| claude-sonnet | claude-sonnet:eval:6 | blocked_requires_certification | Eval artifacts exist (14 cases, 3 hard neg, 2 boundary) but eval_state is unverified with null verdicts — no comprehension or application grading executed |
| client-server-boundary | client-server-boundary:content:2 | blocked_requires_certification | The distinction between file-level and function-level 'use server' scope could be more explicit regarding closure trapping risks. |
| client-server-boundary | client-server-boundary:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| code-review | code-review:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| code-review | code-review:eval:5 | blocked_requires_certification | Comprehension and application verdicts are unverified, preventing skill certification despite elite content quality. |
| codex | codex:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| codex | codex:eval:8 | blocked_requires_certification | comprehension_verdict and application_verdict are both null despite eval_artifacts being present. |
| cognitive-load-theory | cognitive-load-theory:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| cognitive-load-theory | cognitive-load-theory:eval:6 | blocked_requires_certification | Verification verdicts remain unverified or skipped. |
| constraint-awareness | constraint-awareness:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| constraint-awareness | constraint-awareness:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| cron-scheduling | cron-scheduling:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| cron-scheduling | cron-scheduling:eval:6 | blocked_requires_certification | Eval surface: comprehension PROVISIONAL and application UNVERIFIED with eval_state unverified; certification evidence incomplete despite present artifacts. |
| data-modeling | data-modeling:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| data-modeling | data-modeling:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| database-migration | database-migration:eval:4 | blocked_requires_certification | application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. |
| database-migration | database-migration:eval:6 | blocked_requires_certification | Comprehension and application verdicts are PROVISIONAL and eval_state is unverified with only 8/10 target cases, so certification evidence is incomplete despite structural/truth PASS. |
| dependency-architecture | dependency-architecture:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| dependency-architecture | dependency-architecture:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| design-system-architecture | design-system-architecture:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| design-system-architecture | design-system-architecture:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| diff-analysis | diff-analysis:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| diff-analysis | diff-analysis:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| doc-updater | doc-updater:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| doc-updater | doc-updater:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| error-boundary | error-boundary:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| error-boundary | error-boundary:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| error-tracking | error-tracking:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| error-tracking | error-tracking:eval:3 | blocked_requires_certification | The eval design is well-conceptualized in the text but currently lacks a physical implementation, hindering certification. |
| etsy | etsy:content:3 | blocked_requires_certification | Extensive grounding identifies 12 failure modes but remains unverified. |
| etsy | etsy:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| event-contract-design | event-contract-design:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| event-contract-design | event-contract-design:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| event-storming | event-storming:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| event-storming | event-storming:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| first-principles-thinking | first-principles-thinking:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| first-principles-thinking | first-principles-thinking:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| frontend-architecture | frontend-architecture:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| frontend-architecture | frontend-architecture:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| generative-ui | generative-ui:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| generative-ui | generative-ui:eval:5 | blocked_requires_certification | Audit state is present but lacks formal verification across truth, comprehension, and application domains. |
| hooks-patterns | hooks-patterns:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| hooks-patterns | hooks-patterns:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| inversion | inversion:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| inversion | inversion:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| mental-models | mental-models:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| mental-models | mental-models:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| merge-queue | merge-queue:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| merge-queue | merge-queue:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| mobile-responsive-ux | mobile-responsive-ux:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| mobile-responsive-ux | mobile-responsive-ux:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| naming-conventions | naming-conventions:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| naming-conventions | naming-conventions:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| opencode | opencode:eval:3 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| opencode | opencode:eval:8 | blocked_requires_certification | comprehension_verdict and application_verdict are both null despite eval_artifacts: present; eval_state is unverified. The evaluation loop has never been run. |
| pattern-recognition | pattern-recognition:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| pattern-recognition | pattern-recognition:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| performance-engineering | performance-engineering:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| performance-engineering | performance-engineering:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| pestel | pestel:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| pestel | pestel:eval:5 | blocked_requires_certification | Skill remains unverified for truth and application despite high content quality. |
| playing-to-win | playing-to-win:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| playing-to-win | playing-to-win:eval:5 | blocked_requires_certification | Truth, comprehension, and application verdicts are UNVERIFIED, indicating the skill has not yet been certified. |
| prioritization | prioritization:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| prioritization | prioritization:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| problem-approach-router | problem-approach-router:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| problem-approach-router | problem-approach-router:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| problem-framing | problem-framing:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| problem-framing | problem-framing:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| problem-locating-solving | problem-locating-solving:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| problem-locating-solving | problem-locating-solving:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| project-knowledge-extraction | project-knowledge-extraction:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| project-knowledge-extraction | project-knowledge-extraction:eval:4 | blocked_requires_certification | Eval surface: comprehension and application verdicts are UNVERIFIED and eval_state is unverified, so the skill is not certified despite present artifacts. |
| query-optimization | query-optimization:content:5 | blocked_requires_certification | Verification checklist has 16 items with no priority ordering — all items appear equally weighted. |
| query-optimization | query-optimization:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| ref-patterns | ref-patterns:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| ref-patterns | ref-patterns:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| refactor | refactor:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| refactor | refactor:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| replication-patterns | replication-patterns:eval:3 | blocked_requires_certification | application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. |
| replication-patterns | replication-patterns:eval:7 | blocked_requires_certification | Eval artifacts present (13 cases) but eval_state is unverified — no graded run confirms the skill changes agent behavior. |
| scenario-planning | scenario-planning:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| scenario-planning | scenario-planning:eval:5 | blocked_requires_certification | Audit state remains unverified for truth and application dimensions despite a passing structural verdict and existing eval files. |
| second-order-thinking | second-order-thinking:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| second-order-thinking | second-order-thinking:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| semantic-center | semantic-center:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| semantic-center | semantic-center:eval:4 | blocked_requires_certification | Metadata marks audit verdicts as UNVERIFIED across all quality axes. |
| semiotics | semiotics:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| semiotics | semiotics:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| server-components-design | server-components-design:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| server-components-design | server-components-design:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| shopify | shopify:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| shopify | shopify:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| state-management | state-management:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| state-management | state-management:eval:5 | blocked_requires_certification | Routing eval is absent, leaving the complex 'suppresses' and 'related' graph edges unverified. |
| stp-marketing | stp-marketing:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| stp-marketing | stp-marketing:eval:5 | blocked_requires_certification | Audit state is unverified across truth and application dimensions. |
| summarization | summarization:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| summarization | summarization:eval:4 | blocked_requires_certification | Missing all evaluation artifacts; the skill cannot be verified in its current state. |
| swot-tows | swot-tows:eval:3 | blocked_requires_certification | application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. |
| swot-tows | swot-tows:eval:4 | blocked_requires_certification | The evaluation suite meets case volume targets but the audit state remains unverified. |
| task-analysis | task-analysis:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| task-analysis | task-analysis:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| task-path-optimization | task-path-optimization:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| task-path-optimization | task-path-optimization:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| taxonomy-design | taxonomy-design:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| taxonomy-design | taxonomy-design:eval:3 | blocked_requires_certification | Complete lack of evaluation artifacts blocks certification despite the 'planned' status. |
| test-doubles-design | test-doubles-design:content:2 | blocked_requires_source_authoring | Detailed key sources are provided but metadata lacks truth-source hashes to automate drift detection for external references. |
| test-doubles-design | test-doubles-design:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| theme-system-design | theme-system-design:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| theme-system-design | theme-system-design:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| tool-call-flow | tool-call-flow:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| tool-call-flow | tool-call-flow:eval:4 | blocked_requires_certification | Comprehension and application verdicts UNVERIFIED and eval_state unverified; structural/truth PASS but behavior is unproven, blocking certification. |
| transaction-isolation | transaction-isolation:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| transaction-isolation | transaction-isolation:eval:5 | blocked_requires_certification | The skill lacks all physical evaluation artifacts despite being marked as planned, resulting in an unverified state for both comprehension and application. |
| typography-system | typography-system:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| typography-system | typography-system:eval:2 | blocked_requires_certification | application_verdict is REDUNDANT, so the skill is not certified useful by the Behavior Gate. |
| usability-testing | usability-testing:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| usability-testing | usability-testing:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| user-research | user-research:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| user-research | user-research:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| version-control | version-control:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| version-control | version-control:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| visual-design-foundations | visual-design-foundations:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| visual-design-foundations | visual-design-foundations:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| visual-hierarchy | visual-hierarchy:content:1 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| visual-hierarchy | visual-hierarchy:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| webhook-integration | webhook-integration:content:2 | blocked_requires_source_authoring | Grounding/truth-source evidence is weak or not explicit. |
| webhook-integration | webhook-integration:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| agent-engineering | agent-engineering:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| ansoff-matrix | ansoff-matrix:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| balanced-scorecard | balanced-scorecard:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| bayesian-reasoning | bayesian-reasoning:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| blue-ocean-strategy | blue-ocean-strategy:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| canonical-repo-structure | canonical-repo-structure:eval:2 | blocked_requires_certification | application_verdict is missing, so the skill is not certified useful by the Behavior Gate. |
| cap-theorem-tradeoffs | cap-theorem-tradeoffs:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| compression | compression:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| conceptual-modeling | conceptual-modeling:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| context-engineering | context-engineering:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| context-graph | context-graph:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| context-window | context-window:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| contract-testing | contract-testing:eval:4 | blocked_requires_certification | application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. |
| data-modeling-fundamentals | data-modeling-fundamentals:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| diagnosis | diagnosis:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| e2e-test-design | e2e-test-design:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| epistemic-grounding | epistemic-grounding:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| expected-value | expected-value:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| framework-fit-analysis | framework-fit-analysis:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| graph-audit | graph-audit:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| guardrails | guardrails:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| http-semantics | http-semantics:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| integration-test-design | integration-test-design:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| kano-model | kano-model:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| keywords | keywords:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| knowledge-modeling | knowledge-modeling:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| linguistics | linguistics:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| lint-overlay | lint-overlay:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| mckinsey-7s | mckinsey-7s:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| methodical | methodical:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| methodology | methodology:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| mutation-testing | mutation-testing:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| no-cutting-corners | no-cutting-corners:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| okrs | okrs:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| ontology-modeling | ontology-modeling:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| performance-budgets | performance-budgets:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| performance-testing | performance-testing:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| porters-five-forces | porters-five-forces:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| positioning | positioning:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| principled-negotiation | principled-negotiation:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| printify | printify:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| property-based-testing | property-based-testing:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| rendering-models | rendering-models:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| schema-evolution | schema-evolution:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| security-fundamentals | security-fundamentals:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| semantic-relations | semantic-relations:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| semantics | semantics:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| server-actions-design | server-actions-design:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| seven-powers | seven-powers:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| sharding-strategy | sharding-strategy:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| skill-evolution | skill-evolution:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| skill-router | skill-router:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| snapshot-testing | snapshot-testing:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| spec-driven-development | spec-driven-development:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| state-machine-modeling | state-machine-modeling:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| system-interface-contracts | system-interface-contracts:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| test-driven-development | test-driven-development:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| testing-strategy | testing-strategy:eval:3 | blocked_requires_certification | application_verdict is PROVISIONAL, so the skill is not certified useful by the Behavior Gate. |
| three-horizons | three-horizons:eval:4 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| tool-call-strategy | tool-call-strategy:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| type-safety | type-safety:eval:2 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| value-chain-analysis | value-chain-analysis:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| vrio | vrio:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |
| writing-humanizer | writing-humanizer:eval:3 | blocked_requires_certification | application_verdict is UNVERIFIED, so the skill is not certified useful by the Behavior Gate. |

## Report Paths

- JSON: /Users/jacobbalslev/Development/skill-graph/audits/content-evaluation-2026-06-12/skill-content-evaluation-full-content-2026-06-12-r2-repair-report.json
- Markdown: /Users/jacobbalslev/Development/skill-graph/audits/content-evaluation-2026-06-12/skill-content-evaluation-full-content-2026-06-12-r2-repair-report.md
- Ledger: /Users/jacobbalslev/Development/skill-graph/audits/content-evaluation-2026-06-12/skill-content-evaluation-full-content-2026-06-12-r2-resolution-ledger.json
