---
name: framework-fit-analysis
description: "Use when choosing, replacing, or justifying a framework, library, SDK, runtime, database, UI kit, agent tool, or platform by fit: constraints, quality attributes, team skill, evidence, ecosystem maturity, maintenance health, migration cost, operability, performance, security, supply-chain posture, AI/codegen readiness, lock-in, reversibility, and exit cost. Do NOT use for routine dependency hygiene (use `dependency-architecture`), documenting an accepted decision (use `architecture-decision-records`), or framework-specific implementation work. Do NOT use for audit installed packages for duplication and supply-chain risk. Do NOT use for write the ADR after we chose the framework. Do NOT use for implement this feature in the framework we already selected. Do NOT use for profile a slow page and optimize bottlenecks. Do NOT use for design the full production lifecycle of a multi-agent system after the platform is chosen."
license: MIT
compatibility: "Portable technology-selection discipline for application frameworks, libraries, SDKs, platforms, runtimes, data stores, UI kits, and agent tooling."
allowed-tools: Read Grep WebSearch WebFetch
metadata:
  relations: "{\"related\":[\"performance-engineering\",\"owasp-security\",\"refactor\",\"agent-engineering\",\"architecture-decision-records\",\"dependency-architecture\"],\"suppresses\":[\"dependency-architecture\",\"architecture-decision-records\"],\"verify_with\":[\"architecture-decision-records\",\"dependency-architecture\",\"seven-powers\"]}"
  subject: software-architecture
  scope: "Choosing, replacing, or justifying a framework, library, SDK, runtime, database, UI kit, agent tool, or platform by fit — weighing requirement fit, hard constraints, quality attributes, team capability, evidence strength, ecosystem maturity, maintenance health, integration and migration cost, performance envelope, operability, security posture, supply-chain posture, AI/codegen readiness, lock-in, reversibility, and exit cost. Portable across any technology-selection decision; principle-grounded, not repo-bound. Excludes routine dependency hygiene (dependency-architecture), documenting an already-accepted decision (architecture-decision-records), and framework-specific implementation work."
  public: "true"
  taxonomy_domain: architecture/technology-selection
  stability: experimental
  keywords: "[\"framework fit\",\"technology selection\",\"trade study\",\"library choice\",\"SDK evaluation\",\"platform evaluation\",\"build vs buy\",\"migration cost\",\"exit cost\",\"vendor lock-in\"]"
  examples: "[\"should we use Next.js server actions, route handlers, or a separate API service for this workflow?\",\"evaluate whether adding this charting library is worth it under bundle, accessibility, maintenance, and exit constraints\",\"compare Supabase, Firebase, and custom Postgres for this project under real constraints\",\"we want to replace this framework - what fit analysis should happen before an ADR?\",\"should we standardize on Codex, Claude Code, OpenCode, or a custom agent harness for this team?\"]"
  anti_examples: "[\"audit installed packages for duplication and supply-chain risk\",\"write the ADR after we chose the framework\",\"implement this feature in the framework we already selected\",\"profile a slow page and optimize bottlenecks\",\"design the full production lifecycle of a multi-agent system after the platform is chosen\"]"
  grounding: "{\"subject_matter\":\"Technology fit analysis and trade-study discipline for selecting frameworks, libraries, SDKs, runtimes, databases, platforms, UI kits, and AI agent tools\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.thoughtworks.com/radar\",\"https://www.thoughtworks.com/en-us/insights/blog/build-your-own-technology-radar\",\"https://www.sei.cmu.edu/library/architecture-tradeoff-analysis-method-collection/\",\"https://www.nasa.gov/reference/6-8-decision-analysis/\",\"https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html\",\"https://learn.microsoft.com/en-us/azure/well-architected/\",\"https://docs.cloud.google.com/architecture/framework\",\"https://openssf.org/scorecard/\",\"https://slsa.dev/spec/v1.2/\",\"https://docs.npmjs.com/trusted-publishers/\",\"https://help.openai.com/en/articles/11369540-getting-started-with-codex\",\"https://openai.com/index/running-codex-safely/\",\"https://code.claude.com/docs/en/sub-agents\",\"https://opencode.ai/docs/agents/\"],\"failure_modes\":[\"popularity_treated_as_fit\",\"hype_gravity\",\"resume_driven_development\",\"sunk_cost_inertia\",\"fake_precision_weighted_matrix\",\"status_quo_omitted\",\"hard_constraint_scored_instead_of_gated\",\"vendor_claim_not_tested\",\"ecosystem_health_not_checked\",\"maintenance_health_base_rate_ignored\",\"migration_exit_cost_ignored\",\"ai_migration_labor_confused_with_data_exit_cost\",\"ai_codegen_velocity_treated_as_primary_fit\",\"reversibility_misclassified\",\"agent_tool_permissions_not_evaluated\",\"decision_recorded_without_reversibility\"],\"evidence_priority\":\"general_knowledge_first\"}"
  mental_model: "Framework fit analysis is a trade study under constraints. The primitives are the job to be done, hard gates, candidate options, quality attributes, evidence, uncertainty, adoption posture, migration path, operating ownership, and reversibility. The output is not a universal winner; it is the option whose known tradeoffs are acceptable for this context and whose unknowns have an explicit plan."
  purpose: "This skill prevents durable technology choices from being made by hype, local preference, star count, or a vendor demo. It gives agents a repeatable way to compare options, test risky claims, surface uncertainty, and hand a decision-ready brief to an ADR."
  concept_boundary: "This skill owns pre-decision and replacement fit analysis. It does not own package graph hygiene after a technology is accepted, writing the ADR after the decision, measuring and optimizing a live bottleneck, security deep review, refactoring code, or implementing inside an already chosen framework."
  analogy: "Framework fit analysis is like selecting a bridge design for a specific crossing: load, ground, traffic, maintenance crew, budget, weather, and future removal matter more than which bridge is famous."
  misconception: "The common mistake is treating a comparison table as the decision. A table can organize evidence, but fit comes from gates, tradeoffs, uncertainty, probes, and consequences; a high score cannot rescue an option that violates a hard constraint or creates unacceptable exit cost."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/framework-fit-analysis/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Framework Fit Analysis

## Concept of the skill

Framework fit analysis is a trade study under constraints. The primitives are the job to be done, hard gates, candidate options, quality attributes, evidence, uncertainty, adoption posture, migration path, operating ownership, and reversibility.

## Concept Of The Skill

**What it is.** A portable trade-study discipline for choosing, replacing, or justifying frameworks, libraries, SDKs, runtimes, databases, UI kits, agent tools, and platforms. It turns "which should we use?" into a constrained decision brief: what the technology must do, which options are credible, what evidence supports each claim, what risks remain, and what the team accepts by choosing.

**Mental model.** Fit is not a property of a tool in isolation. Fit is a relationship between the tool and the project's constraints, people, operating model, risk tolerance, time horizon, and exit options.

**What it is not.** It is not routine dependency cleanup, an ADR after the decision is accepted, a performance tuning pass, a security audit, or implementation guidance inside a chosen framework. Those may verify parts of the decision, but this skill owns the pre-decision comparison.

## Coverage

Evaluate technology fit before adoption, replacement, or standardization. The output is a recommendation with consequences a team can accept knowingly — not a ranking table with fake precision. Coverage:

- **Requirement fit:** the job the technology must do, non-goals, and user or business outcomes.
- **Hard constraints:** runtime, hosting, data residency, compliance, accessibility, security, budget, timeline, licensing, language, deployment, and organizational policy.
- **Quality attributes:** performance, reliability, operability, security, maintainability, portability, observability, cost, sustainability, and developer experience.
- **Ecosystem maturity & maintenance health:** age, production adopters at your scale, plugin/integration breadth, hiring pool, release cadence, maintainer count, governance, and the supply-chain posture behind the dependency.
- **AI/codegen readiness:** whether the framework's patterns, type contracts, docs, tests, and local conventions help coding agents generate correct changes at useful speed.
- **Candidate options:** status quo, "do nothing", reuse, buy, configure, customize, build, managed service, open-source component, proprietary platform, and credible competitors.
- **Adoption readiness:** whether a technology is ready to adopt, trial, assess, or avoid for this context.
- **Evidence quality:** official docs, release notes, migration guides, benchmarks, issue history, security advisories, provenance, prototypes, and production experience.
- **Migration and exit:** adoption effort, parallel-run plan, data migration, adapter needs, rollback, vendor lock-in, switching cost, and retirement path.
- **Operating ownership:** who runs it, upgrades it, secures it, responds to incidents, and removes it if the bet fails.
- **Agent-tooling fit:** permissions, sandboxing, auditability, tool access, data controls, model/provider portability, plugin/MCP attack surface, skills/subagent support, cost controls, and review gates for coding agents or agent platforms.
- **Decision handoff:** a recommendation with consequences and uncertainty, ready for `architecture-decision-records` when durable.

## Philosophy of the skill
Technology choice is context-dependent. "Best" without constraints is marketing. A good fit analysis makes tradeoffs explicit enough that a team can accept the costs knowingly.

Do not confuse popularity with fit. Popularity can indicate ecosystem depth, hiring supply, and community support; it can also hide herd behavior, churn, security exposure, or a poor match for the team's operating model. Treat popularity as one evidence point, never as the decision.

Three forces distort technology decisions, and naming them is half the discipline:

- **Hype gravity:** the newest tool with the loudest launch is treated as the default before constraints are named. Adoption status (who runs this in production at your scale, for how long) beats announcement volume.
- **Resume-driven development:** a tool is favored because someone wants the credential or learning experience, not because it matches the job the system must do. Separate "interesting" from "fit" explicitly and score team capability honestly.
- **Sunk-cost inertia:** the incumbent survives because switching feels expensive, while the cost of staying is left unpriced. "Keep current stack" is a real option only when it is costed like the alternatives.

Do not let a narrow implementation preference choose a durable platform. The right output is a recommendation plus consequences, not a ranking table with fake precision. A score can organize a conversation, but it cannot override a hard constraint, an unowned operational burden, or an exit cost the team cannot pay.

AI coding agents and vendor tooling change the research process, not the accountability. Use agents to collect sources, inspect APIs, build small spikes, and draft comparison notes. The human/team decision still needs explicit constraints, evidence, permission boundaries, data controls, operating ownership, and reversibility.

Match the rigor to the reversibility of the decision (see [Reversibility Scale](#reversibility-scale)). A reversible choice deserves a quick spike and a sane default; a one-way-door choice deserves the full method below.

## Method

A scenario-based, lightweight adaptation of ATAM (Architecture Tradeoff Analysis Method): drive the evaluation from the quality attributes that actually matter, then find where options diverge. Mandatory criteria (hard gates) eliminate options *before* any scoring — an option that fails a gate is disregarded, not down-ranked.

1. **Name the decision and owner.** State the decision in one sentence, the decision-maker or forum, the deadline, and whether this is a reversible experiment or a durable architecture choice.
2. **State the job to be done.** Describe the workflow, users, data, scale, failure impact, and time horizon the technology must serve — one or two sentences. Include non-goals so candidates are not rewarded for irrelevant strengths. If you cannot state the job, you are not ready to choose.
3. **List hard gates before preferences.** Runtime support, hosting model, data residency/sovereignty, compliance, security policy, licensing, accessibility, budget ceiling, timeline, existing stack, and team constraints are gates. An option that fails a gate is rejected or requires an explicit, recorded exception; do not average gate failures into a score.
4. **Build the option set, including staying put.** Include credible alternatives and the status quo. For each option, classify it as keep, reuse, buy, configure, customize, build, managed service, or hybrid. "Do nothing / keep current stack" and "build it ourselves" are options, not absences of one — cost each like a real candidate. Avoid comparing only the option someone already wants.
5. **Build a utility tree of evaluation criteria by decision type.** Group the [fit criteria](#fit-criteria) into must-have / important / nice-to-have / disqualifier. Weight *qualitatively* — fake-precise numeric scores (a 7.4 vs a 7.1) launder judgment as math. Use numeric scoring only when the scale is defined, the evidence is comparable, and the result will not imply false precision. The point is to surface which attributes are decisive.
6. **Gather primary evidence.** Prefer official docs, release notes, API references, migration guides, security advisories, license text, status pages, benchmarks you can reproduce, and current repository constraints. Community posts and stars can inform risk, but they do not prove fit.
7. **Probe the risky claims with a time-boxed spike — depth matched to reversibility.** Decisions made from documentation and star counts are guesses. Run the cheapest meaningful spike for high-uncertainty claims: build the riskiest slice — the integration seam, the performance-critical path, the auth flow, a migration rehearsal, a data export, a rollback, an adapter sketch, an accessibility or bundle-size check, or an AI-assisted implementation pass on representative code. This is the Trial/Assess discipline: prove it on *your* problem, not the vendor's demo. A reversible choice may need only a quick hands-on check; a costly-to-reverse or one-way-door choice demands a real spike, or an explicitly recorded uncertainty when no spike was run.
8. **Assess ecosystem, maintenance, and supply chain.** Check maintenance cadence, release compatibility, maintainer count, governance, issue/PR response, CVE response time, license, security policy, vulnerability history, provenance or trusted publishing where available, and SBOM/SLSA posture when relevant — and whether a compromised dependency or vendor outage would be high impact. Use automated signals such as OpenSSF Scorecard as a first filter, not a final verdict; because many dependencies score poorly on maintained-ness, a strong score is meaningfully differentiating. See [Maintenance Health Signals](#maintenance-health-signals).
9. **Find the sensitivity points and tradeoff points.** A *sensitivity point* is where one option is strongly better or worse on a key attribute. A *tradeoff point* is where improving one attribute (e.g., performance) degrades another (e.g., operability or cost). Name them; they are where the decision actually lives.
10. **Classify adoption readiness.** Use an organization-specific ladder:
    - **Adopt:** proven under comparable constraints; ownership, upgrade path, and rollback are clear.
    - **Trial:** promising and worth a low-risk pilot with explicit success criteria.
    - **Assess:** worth research or a spike, but not ready for a production commitment.
    - **Caution:** negative evidence, immature support, unacceptable lock-in, unowned operations, or a better-supported alternative — consider alternatives or proactively avoid.
11. **Price total cost of ownership and exit, over a horizon matched to the decision.** Set the horizon from reversibility and expected lifespan — a reversible choice may only warrant a quick look one or two cycles out, while a one-way-door platform deserves a multi-year view (often 5–10 years for a datastore or core framework). Acquisition is the smallest number. Add operating, support, scaling, retraining, testing, observability, upgrades, compliance, and — explicitly — migration and exit. Price the **total cost of exit (TCOE)** as its own line, not a footnote: `TCOE = data migration + logic re-engineering + operational retraining + transitional parallel-running + contractual penalties`. Difficult data export or a closed format is a red flag worth documenting. The components that survive AI assistance (data and operational lock-in) dominate this number — see [Note on AI-Assisted Migration](#note-on-ai-assisted-migration-20252026).
12. **Identify operational ownership and failure modes.** Who runs it at 3am? What breaks, how is it observed, who is paged? A technology with no owner is a liability regardless of fit.
13. **Classify reversibility.** Assign a reversibility category and match the rigor of the analysis to it (see [Reversibility Scale](#reversibility-scale)). A low-cost swap can move with a quick spike and a rollback plan; a datastore, cloud, auth, agent-platform, or core-framework choice needs the full analysis and an explicit exit strategy.
14. **Recommend one path with accepted tradeoffs and a reversal cost.** State the recommendation, name the rejected options and why they lost, mark uncertain claims, and state what it would cost to undo. Record what would *change* the recommendation (a price, release, benchmark, regulation, staffing change, or vendor feature).
15. **Hand off deliberately.** If the choice is durable, write or update an ADR via `architecture-decision-records`. If adoption changes package boundaries or external SDK exposure, verify with `dependency-architecture`. If the decision depends on security, performance, or agent runtime behavior, bring the relevant specialist skill in before acceptance.

## Fit Criteria

The fit axes to weigh in the utility tree at step 5. Not every axis is decisive for every decision — the utility tree decides which are must-have.

| Criterion | Ask | Evidence |
|---|---|---|
| **Job / requirement fit** | Does it do the core job natively, or only via plugins/workarounds — without distorting the product? | Requirements, prototype, user flow, API surface, non-goals |
| **Hard constraints (gates)** | Does it satisfy the gates that cannot move? | Compliance, hosting, runtime, license, data residency, air-gap, budget, policy |
| **Quality attributes** | Which quality attributes improve or degrade? | Performance, reliability, security, accessibility, operability, maintainability |
| **Team capability** | Can this team build, review, debug, and operate it? A great tool the team can't run is a poor fit. | Existing skills, hiring market, learning curve, docs quality, on-call model |
| **AI/codegen readiness** | Will coding agents produce correct changes quickly, or will the framework amplify hallucinated APIs and wrong patterns? | Pattern commonality, type contracts, machine-readable docs, examples, tests, lint/typecheck feedback, local conventions |
| **Ecosystem maturity** | Is the ecosystem alive and compatible with our needs? | Releases, issue response, migration history, plugins, integrations, support channels, hiring pool |
| **Maintenance health** | Is it actually maintained, or popular-but-dormant? | Maintainer count/bus factor, release recency, issue/PR triage, OpenSSF Scorecard, funding/backing |
| **Supply-chain posture** | Can we trust and update it safely enough for this impact level? | Security policy, advisories, provenance/trusted publishing, lockfile behavior, SLSA/SBOM signals, maintained-ness base rate |
| **Integration cost** | How much existing code, data, workflow, and tooling must change? | Adapter sketch, migration guide, code search, integration spike |
| **Migration path** | What is the realistic incremental adoption path? | Strangler vs big-bang, parallel-run plan, codemod feasibility |
| **Performance envelope** | Is there measured headroom for *your* workload? | Reproducible benchmark on your workload, not synthetic vendor numbers |
| **Security posture** | Are defaults secure and CVEs handled fast? (route depth to `owasp-security`) | CVE history and response time, supply-chain hygiene, secure defaults |
| **Operability** | Who runs it and how does it fail? | Logs, metrics, tracing, status page, backup/restore, upgrade cadence, incident playbook |
| **Lock-in and exit** | Can we leave with known cost? | Data export, standard protocols, open formats, adapter boundary, contract terms, replacement path |
| **Reversibility** | How hard is it to undo the decision after real adoption? | Reversibility category, rollback plan, anti-corruption boundary, parallel-run cost |
| **Strategic fit** | Does the choice match the project's time horizon and architecture direction? | Roadmap, ADR history, platform strategy, sunset plans |

## Maintenance Health Signals

"Well maintained" is not a vibe; it has signals. For a candidate library, SDK, or OSS platform, check:

- **Bus factor / maintainer count.** A single-maintainer project is a single point of failure. Multiple active maintainers and a real governance model (foundation, company backing, clear succession) lower abandonment risk.
- **Release cadence and recency.** Regular releases and a recent commit history beat a high star count on a dormant repo. Stars measure past popularity, not present maintenance. Release/migration history that shows care for downstream users is itself a signal.
- **Issue and PR responsiveness.** Are issues triaged? Do security reports get timely responses? A large backlog of stale issues is a leading indicator of decline.
- **Automated security score.** Tools like the [OpenSSF Scorecard](https://scorecard.dev/) score code-review process, dependency management, signing, and maintenance signals automatically — a fast first filter, not a verdict. Note the base rate: empirically most dependencies score poorly on "Maintained," so a strong score is meaningfully differentiating, while a weak score is a prompt for deeper review rather than an automatic rejection.
- **Supply-chain provenance.** Beyond an aggregate score, verify the high-stakes signals directly for anything you will depend on heavily: signed releases and trusted publishing (e.g. npm provenance, PyPI Trusted Publishers), an available SBOM, and [SLSA](https://slsa.dev/) build-level attestation where the ecosystem supports it. Treat automated scores as the first filter and provenance as the confirmation.
- **CVE history and response time.** Not "has it had vulnerabilities" (everything has) but "how fast were they fixed and disclosed."
- **Funding and backing.** Who pays for this to exist next year? Volunteer side-project, VC-funded company (with the rug-pull/relicensing risk that carries), or a neutral foundation each imply a different risk profile.

## AI Readiness Indicators

When coding agents are part of delivery, evaluate whether a candidate framework is easy for agents to use *correctly*. This is separate from agent-platform security (below): it asks whether the framework itself gives code generation enough structure, examples, and feedback to move fast without quietly degrading correctness.

- **Pattern commonality.** Mainstream conventions, stable idioms, and an abundant public corpus make generated code more likely to match real usage. A niche or recently-rewritten framework whose current API is under-represented in training data can still be correct, but it needs stronger local templates, tests, and review.
- **Type-safety and contract depth.** Static types, schema validation, generated clients, explicit route/service/component boundaries, and narrow public APIs let an agent catch its own mistakes at author time and reduce hallucinated calls. Weak or dynamic typing pushes errors to runtime where the agent cannot see them.
- **Machine-readable documentation.** First-class typed signatures, API references, migration guides, OpenAPI/GraphQL/JSON-schema surfaces, typed examples, CLI help, and RAG-friendly docs are far more usable — and far more verifiable — by an agent than prose-only tutorials.
- **Feedback-loop quality.** Fast tests, linters, typecheckers, preview builds, fixtures, and specific error messages let agents verify changes instead of treating plausible code as working code.
- **Local pattern surface.** Existing wrappers, component stories, ADRs, examples, package boundaries, and project-specific guides help agents follow the repo's conventions rather than generic internet defaults.

Do not let AI-readiness override hard gates or user outcomes. Treat it as a delivery-velocity and defect-risk dimension: valuable when options are otherwise close, but never a substitute for security, accessibility, operational ownership, or exit cost.

## Reversibility Scale

Match rigor to how hard the choice is to undo. A four-category scale is finer than a binary one-way/two-way framing and sets the depth of the analysis directly:

| Category | Reversibility | Typical shape | Concrete examples | Required strategy |
|---|---|---|---|---|
| 1 | High (classic two-way door) | Standard protocol, small surface, low data coupling, cheap rollback | Swapping a charting/logging/utility library behind a wrapper; moving an OCI-containerized service between compatible hosts; mostly standard SQL through a narrow repository layer | Lightweight comparison, quick spike, ordinary rollback note. Over-analyzing a level-1 decision wastes more than a wrong pick costs |
| 2 | Moderate (reversible with effort) | Managed or proprietary service with documented export/mapping and limited code spread | Managed Postgres with dump/restore path; a state-management or API library with moderate surface; email/search provider behind an adapter; UI kit adopted in one product surface | Document export path, adapter seam, migration rehearsal for high-impact use; a short spike on the riskiest seam |
| 3 | Low (costly to reverse) | Deep proprietary API, core data model, pervasive SDK, or platform-specific runtime | App-wide auth provider coupling; cloud-specific queues/storage SDKs spread through services; an ORM or core framework that shapes routing, data loading, and deployment together | Explicit anti-corruption boundary, TCOE line, parallel-run plan, real spike, ADR before adoption |
| 4 | Strategic / near-irreversible (one-way door) | Multi-year migration, contract lock-in, regulated data, organizational retraining, or hardware/platform commitment | Primary datastore or cloud platform; the data model itself; ERP/SAP RISE-style platform move; core CRM or data-platform replacement; regulated data estate tied to one cloud's proprietary services | Executive/forum approval, funded exit or sunset plan, staged adoption gates, exit cost (TCOE) as a first-class criterion, spike evidence before committing |

Category 3 and 4 choices are not forbidden, but they must *earn* the lock-in: a high-leverage option can still be correct if the team knowingly accepts the exit cost and contains the coupling. Most regret comes from treating a level-3 or level-4 choice like a level-1 — adopting a hard-to-leave platform on the energy of a launch post. The reversal cost named in Method step 14 is what tells the levels apart.

## Agent Tooling Fit

When the candidate is agent tooling — an LLM framework, a coding agent, an agent runtime, an MCP-enabled tool, a tool/plugin platform, or an autonomous-agent harness — the standard criteria still apply, but a distinct attack-and-control surface dominates the decision. Weigh these in addition to the table above:

- **Execution boundary & sandboxing.** Where can the agent or its tools actually read/write, can it reach the network or shell, and what requires approval? Is there a deny-by-default kernel/OS sandbox (e.g. seccomp/Seatbelt-style fencing), or only prompt-level "please don't"? **Prompt-level guardrails are not a security boundary.**
- **Permission model.** Are dangerous commands, external directories, tool calls, MCP servers, and subagent delegation controllable by policy rather than prompt wording alone? Prefer a model where capabilities are explicitly granted, not ambiently available.
- **Data controls & residency.** What repository, secrets, prompts, context, logs, screenshots, browser state, memory, and connected-app data can leave the environment? Who can train on it? Re-check against the hard-constraint list (compliance, residency).
- **Tool / MCP / plugin attack surface.** Each installed tool, MCP server, or plugin is third-party code and a prompt-injection vector. Count the surface and check the supply-chain hygiene of each.
- **Auditability.** Are tool calls, file changes, decisions, approvals, review comments, and data accesses logged in a tamper-evident, reviewable form? An agent you cannot audit is an agent you cannot operate in production.
- **Portability.** How hard is it to move prompts, skills, agents, MCP servers, command files, and workflows to another tool?
- **Failure containment.** Can it run in read-only/review mode, sandboxed mode, isolated worktrees, or low-privilege subagents?
- **Cost & throughput controls.** Token/usage spend can run away non-deterministically. Are there hard budget caps, per-run ceilings, parallelism controls, runaway-loop prevention, and spend observability — or only a monthly invoice surprise?
- **Human review gates.** Can high-risk actions (writes, deploys, payments, external sends) be held for human approval and integrate with code review, tests, CI, and branch protections? A runtime with no gate between intent and irreversible action fails the reversibility test by construction.

These axes are usually *must-have* for any agent tooling that touches production data or systems — fold them into the utility tree at step 5 rather than treating them as nice-to-haves.

**Upstream-displacement check.** For agent tooling and other fast-moving platforms, ask whether the vendor or a major OSS project now ships the capability you were about to build or adopt separately. If yes, reassess build-vs-buy and exit cost. Do not skip fit analysis; a built-in capability can reduce custom work *while* increasing lock-in, data exposure, or permission risk.

## Scoring Discipline

Use scoring only as a thinking aid. Start with gates and evidence, then use coarse labels when judgment is qualitative:

- **Disqualifier:** fails a hard gate or creates unacceptable risk.
- **Strong fit:** meets gates, evidence is direct, ownership is clear, and uncertainty is low.
- **Fit with risk:** meets gates, but needs a pilot, mitigation, or explicit tradeoff.
- **Weak fit:** possible, but cost, capability gap, or uncertainty is high.
- **Unknown:** not enough evidence; define the probe that would change the state.

If a weighted table says one option wins but the narrative evidence says another is safer, inspect the criteria, weights, and assumptions. The table may be measuring the wrong thing. Record sensitivity: which assumption, price, release, benchmark, regulation, staffing change, or vendor feature would reverse the recommendation?

## Anti-Patterns

| Anti-pattern | Why it fails | Instead |
|---|---|---|
| Scoring table with two-decimal precision | Launders subjective judgment as math; invites arguing the decimals instead of the tradeoffs | Qualitative weights + named sensitivity/tradeoff points |
| Hard constraint averaged into a score | A scored matrix that lets a gate be averaged away is worse than no matrix | Gate first; disregard options that fail a mandatory criterion |
| Deciding from docs and star counts | Vendor demos hide the seams that break on *your* problem | Time-boxed spike on the riskiest slice |
| "We'll never need to migrate" | Every long-lived system migrates eventually; unpriced exit cost is a hidden liability | Price exit cost (TCOE); prefer open formats for one-way doors |
| Popularity = fit | Loudest launch ≠ best fit for your constraints | Adoption status at *your* scale; cost "do nothing" too |
| Resume-driven choice | Optimizes for the engineer's learning, not the system's job | Separate "interesting" from "fit" in the utility tree |
| AI-codegen velocity treated as primary fit | Speed of generation is not correctness, security, or exit cost | Treat AI-readiness as a velocity/defect dimension, subordinate to gates |

## Note on AI-Assisted Migration (2025–2026)

AI coding agents lower *some* switching costs — codemods, mechanical API-surface ports, adapter sketches, and test backfill are now cheaper than they were. This shifts the build-vs-buy and migration math, but it does **not** reduce data-layer or platform exit cost (schema lock-in, proprietary formats, contractual terms, operational retraining, and parallel-running periods are unchanged). Discount migration *labor* only where a spike shows an agent can genuinely do the port; never discount *data* and *operational* lock-in. Treat any "the AI will just migrate it later" claim as a hypothesis to spike, not a given.

When AI-agent-assisted development or migration is part of the plan, also weigh how *amenable* a candidate is to it using the [AI Readiness Indicators](#ai-readiness-indicators) above. These are amenability signals, not fit on their own — a perfectly AI-amenable tool that fails a hard constraint is still out.

## Decision Brief Template

The analysis should terminate in a short, structured brief — not a checklist with no home. This is the artifact that hands cleanly into `architecture-decision-records`. Keep it concise enough that it can become or feed an ADR; fill only the rows the decision earns (a reversible choice may legitimately leave the spike row empty and the brief short). The brief records the *comparison that produced the decision*; the ADR records the *decision and its context*.

```markdown
## Decision

Choose: <recommended option>
Adoption posture: <Adopt | Trial | Assess | Caution>
Decision horizon: <experiment | reversible adoption | durable architecture choice>
Reversibility category: <1–4>  (reversal cost: <estimate>)

## Context

Job to be done:           <what, for whom, at what scale>
Hard gates:               <the eliminators — runtime, compliance, residency, budget, team, timeline>
Non-goals:
Decision owner & deadline:

## Options Considered

| Option | Posture | Why plausible | Why risky |
|---|---|---|---|
| Keep current stack |  |  |  |
| Option A |  |  |  |
| Option B |  |  |  |

## Evidence

- Direct evidence checked:
- Probes / spikes run (or "none — reversible"):
- Claims still uncertain:
- AI/codegen readiness checked:
- Sources intentionally not trusted:

## Tradeoffs

Decisive points:    <sensitivity + tradeoff points where the decision actually lived>
Accepted costs:     <consequences the team is knowingly accepting>
Rejected options & why:
Migration path:
Rollback / exit path:
TCO / TCOE:         <horizon used; exit cost line>
Operational owner:  <who runs it / who is paged>

## Recommendation

Recommend <option> because <constraints and evidence>. This should change if <reversal conditions>.

## Follow-up

- ADR needed? <yes/no>
- Dependency-boundary work needed? <yes/no>
- Security / performance / agent-engineering verification needed? <yes/no>
```

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/framework-fit-analysis.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/framework-fit-analysis.json). The checklist below is the authoring gate for technology-fit decisions; the eval file is the grader surface.

## Grounding Note

The `grounding.truth_sources` URLs in this skill are *reference grounding* — they document where this discipline's best practice comes from (ATAM, NASA decision analysis, Thoughtworks Technology Radar, the cloud well-architected frameworks, OpenSSF/SLSA/npm trusted publishing, and current agent-tool docs). They are **not** a hashed drift baseline until `drift_check.truth_source_hashes` are recorded for the hashable sources, or the audit loop explicitly accepts the external-unhashed status. Do not read `drift_check.last_verified` alone as proof that the URL truth sources were fetched and hashed — `truth_verdict` is `UNVERIFIED` for exactly this reason.

## Verification

- [ ] The recommendation is tied to explicit project constraints, the stated job, and non-goals
- [ ] Hype gravity, resume-driven development, and sunk-cost inertia were checked explicitly
- [ ] Hard gates were separated from preferences and scoring; no gate was averaged into a score
- [ ] "Do nothing" / "keep current stack" and "build it" were considered as real, costed options
- [ ] Credible options were compared, not only the favorite option
- [ ] Evaluation criteria were grouped (must-have / important / nice-to-have / disqualifier); no fake-precise numeric scoring
- [ ] Evidence sources are named, primary where it matters, and current enough for the decision
- [ ] High-risk claims were tested with a spike, benchmark, migration rehearsal, or marked uncertain — spike rigor matched reversibility
- [ ] Sensitivity points and tradeoff points are named
- [ ] Maintenance health was checked with concrete signals (maintainer count, release cadence, security score, supply-chain provenance), not popularity
- [ ] Supply-chain, license, and maintainer-health risks were checked for high-impact choices
- [ ] AI/codegen readiness claims are backed by pattern commonality, type/contract depth, machine-readable docs, and fast verification feedback
- [ ] AI-assisted migration claims separate mechanical labor savings from data and operational exit cost
- [ ] Total cost of ownership over the decision's lifecycle is estimated, including migration and exit cost
- [ ] Exit cost was priced as its own line (TCOE: data migration, re-engineering, retraining, parallel-running, penalties)
- [ ] Operational ownership and failure modes are named (who runs it, who is paged)
- [ ] The decision was placed on the four-category reversibility scale, and reversal cost is stated
- [ ] For agent tooling: permissions/sandboxing, data controls, tool/MCP attack surface, auditability, cost controls, and human review gates were weighed
- [ ] Performance and security claims are evidence-backed or marked uncertain
- [ ] A one-page decision brief was produced as the hand-off to the ADR
- [ ] Follow-up ADR is proposed for durable choices

## Do NOT Use When

| Use instead | When |
|---|---|
| `dependency-architecture` | You need dependency graph hygiene, package boundaries, duplication control, external SDK wrapping, upgrade policy, or supply-chain guardrails after the technology decision surface is known. |
| `architecture-decision-records` | The choice is already made and needs a durable record. |
| `performance-engineering` | You need to measure and optimize actual runtime behavior. |
| `owasp-security` | The task is a vulnerability-focused security review or threat model rather than a fit-level security check. |
| `agent-engineering` | The agent technology is already selected and you need to design or audit the production agent-system architecture. |
| A framework-specific skill | The framework is already chosen and the task is implementation. |
</content>
</invoke>

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Public: `true`
- Domain: `architecture/technology-selection`
- Scope: Choosing, replacing, or justifying a framework, library, SDK, runtime, database, UI kit, agent tool, or platform by fit — weighing requirement fit, hard constraints, quality attributes, team capability, evidence strength, ecosystem maturity, maintenance health, integration and migration cost, performance envelope, operability, security posture, supply-chain posture, AI/codegen readiness, lock-in, reversibility, and exit cost. Portable across any technology-selection decision; principle-grounded, not repo-bound. Excludes routine dependency hygiene (dependency-architecture), documenting an already-accepted decision (architecture-decision-records), and framework-specific implementation work.

**When to use**
- should we use Next.js server actions, route handlers, or a separate API service for this workflow?
- evaluate whether adding this charting library is worth it under bundle, accessibility, maintenance, and exit constraints
- compare Supabase, Firebase, and custom Postgres for this project under real constraints
- we want to replace this framework - what fit analysis should happen before an ADR?
- should we standardize on Codex, Claude Code, OpenCode, or a custom agent harness for this team?

**Not for**
- audit installed packages for duplication and supply-chain risk
- write the ADR after we chose the framework
- implement this feature in the framework we already selected
- profile a slow page and optimize bottlenecks
- design the full production lifecycle of a multi-agent system after the platform is chosen

**Related skills**
- Verify with: `architecture-decision-records`, `dependency-architecture`, `seven-powers`
- Related: `performance-engineering`, `owasp-security`, `refactor`, `agent-engineering`, `architecture-decision-records`, `dependency-architecture`

**Concept**
- Mental model: Framework fit analysis is a trade study under constraints. The primitives are the job to be done, hard gates, candidate options, quality attributes, evidence, uncertainty, adoption posture, migration path, operating ownership, and reversibility. The output is not a universal winner; it is the option whose known tradeoffs are acceptable for this context and whose unknowns have an explicit plan.
- Purpose: This skill prevents durable technology choices from being made by hype, local preference, star count, or a vendor demo. It gives agents a repeatable way to compare options, test risky claims, surface uncertainty, and hand a decision-ready brief to an ADR.
- Boundary: This skill owns pre-decision and replacement fit analysis. It does not own package graph hygiene after a technology is accepted, writing the ADR after the decision, measuring and optimizing a live bottleneck, security deep review, refactoring code, or implementing inside an already chosen framework.
- Analogy: Framework fit analysis is like selecting a bridge design for a specific crossing: load, ground, traffic, maintenance crew, budget, weather, and future removal matter more than which bridge is famous.
- Common misconception: The common mistake is treating a comparison table as the decision. A table can organize evidence, but fit comes from gates, tradeoffs, uncertainty, probes, and consequences; a high score cannot rescue an option that violates a hard constraint or creates unacceptable exit cost.

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.thoughtworks.com/radar`, `https://www.thoughtworks.com/en-us/insights/blog/build-your-own-technology-radar`, `https://www.sei.cmu.edu/library/architecture-tradeoff-analysis-method-collection/`, `https://www.nasa.gov/reference/6-8-decision-analysis/`, `https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html`, `https://learn.microsoft.com/en-us/azure/well-architected/`, `https://docs.cloud.google.com/architecture/framework`, `https://openssf.org/scorecard/`, `https://slsa.dev/spec/v1.2/`, `https://docs.npmjs.com/trusted-publishers/`, `https://help.openai.com/en/articles/11369540-getting-started-with-codex`, `https://openai.com/index/running-codex-safely/`, `https://code.claude.com/docs/en/sub-agents`, `https://opencode.ai/docs/agents/`

**Keywords**
- `framework fit`, `technology selection`, `trade study`, `library choice`, `SDK evaluation`, `platform evaluation`, `build vs buy`, `migration cost`, `exit cost`, `vendor lock-in`

<!-- skill-graph-context:end -->
