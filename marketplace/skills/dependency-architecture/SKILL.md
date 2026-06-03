---
name: dependency-architecture
description: "Use when designing or auditing dependency structure: package boundaries, runtime vs build dependencies, adapter layers, duplicate-purpose libraries, supply-chain risk, upgrade policy, lock-in, and dependency graph health. Do NOT use for choosing a major framework (use `framework-fit-analysis`), vulnerability-only review (use `owasp-security`), or routine refactoring without dependency boundary changes (use `refactor`). Do NOT use for choose between Next.js, Remix, and Astro for a new app. Do NOT use for scan dependencies only for known vulnerabilities. Do NOT use for refactor this module without changing dependency boundaries. Do NOT use for write an ADR after the dependency decision is accepted."
license: MIT
compatibility: "Portable dependency architecture guidance for monorepos, package.json ecosystems, service boundaries, SDKs, and internal libraries."
allowed-tools: Read Grep
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: software-architecture
  deployment_target: portable
  taxonomy_domain: architecture/dependencies
  owner: skill-graph-maintainer
  freshness: "2026-05-11"
  drift_check: "{\"last_verified\":\"2026-05-11\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"dependency architecture\",\"dependency graph\",\"package boundaries\",\"runtime dependency\",\"build dependency\",\"duplicate libraries\",\"supply chain risk\",\"adapter layer\",\"lock-in\",\"upgrade policy\"]"
  examples: "[\"audit whether this repo has duplicate-purpose dependencies and unsafe package boundaries\",\"should this SDK be wrapped behind an adapter or imported everywhere?\",\"design dependency rules for packages in this monorepo\",\"evaluate dependency lock-in and upgrade risk before adding this library\"]"
  anti_examples: "[\"choose between Next.js, Remix, and Astro for a new app\",\"scan dependencies only for known vulnerabilities\",\"refactor this module without changing dependency boundaries\",\"write an ADR after the dependency decision is accepted\"]"
  relations: "{\"boundary\":[{\"skill\":\"framework-fit-analysis\",\"reason\":\"framework-fit-analysis evaluates major technology choices; dependency-architecture governs dependency graph structure and package boundaries\"},{\"skill\":\"architecture-decision-records\",\"reason\":\"architecture-decision-records records accepted dependency decisions; dependency-architecture analyzes the dependency design\"}],\"related\":[\"framework-fit-analysis\",\"system-interface-contracts\",\"version-control\",\"owasp-security\",\"refactor\"],\"verify_with\":[\"owasp-security\",\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":180,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/software-architecture/dependency-architecture/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Dependency Architecture

## Coverage

Design and audit the dependency graph of a codebase. Covers direct vs transitive dependencies, runtime vs dev/build dependencies, package boundaries, import direction, adapter layers, duplicate-purpose libraries, lock-in, upgrade policy, supply-chain risk, and dependency drift.

## Philosophy

Dependencies are architecture. Every package adds API surface, operational risk, update cost, and implicit design direction. A dependency that solves one task can still be wrong if it creates long-term coupling or duplicates an existing standard.

Prefer fewer, clearer dependencies with explicit ownership. Wrap volatile external SDKs at boundaries. Let application code depend on local contracts, not vendor shapes, when the vendor is likely to change or be replaced.

## Method

1. Inventory dependencies by purpose, owner, and import surface.
2. Classify each as runtime, dev, build, test, or optional.
3. Identify duplicate-purpose libraries and unauthorized standards.
4. Check import direction and package boundary rules.
5. Decide where adapters are needed for external SDKs or volatile APIs.
6. Assess security, maintenance, license, and ecosystem health.
7. Define upgrade, pinning, and removal policy.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/dependency-architecture.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/dependency-architecture.json). The checklist below is the authoring gate for dependency-boundary decisions; the eval file is the grader surface.

## Verification

- [ ] Each dependency has a purpose and owner
- [ ] Runtime dependencies are not hidden as dev/build dependencies
- [ ] Duplicate-purpose packages are justified or removed
- [ ] External SDKs do not leak vendor types across core boundaries without intent
- [ ] Package import direction is enforceable
- [ ] Upgrade policy and lockfile discipline are clear
- [ ] Security and license risks have been checked for high-impact dependencies

## Do NOT Use When

| Use instead | When |
|---|---|
| `framework-fit-analysis` | You are selecting a major framework, platform, runtime, or database. |
| `owasp-security` | The task is vulnerability-focused security review. |
| `refactor` | You are restructuring code without changing dependency architecture. |
| `architecture-decision-records` | The dependency decision is already made and needs a record. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `software-architecture`
- Deployment: `portable`
- Domain: `architecture/dependencies`

**When to use**
- audit whether this repo has duplicate-purpose dependencies and unsafe package boundaries
- should this SDK be wrapped behind an adapter or imported everywhere?
- design dependency rules for packages in this monorepo
- evaluate dependency lock-in and upgrade risk before adding this library

**Not for**
- choose between Next.js, Remix, and Astro for a new app
- scan dependencies only for known vulnerabilities
- refactor this module without changing dependency boundaries
- write an ADR after the dependency decision is accepted
- Owned by `framework-fit-analysis`
- Owned by `architecture-decision-records`

**Related skills**
- Verify with: `owasp-security`, `code-review`
- Related: `framework-fit-analysis`, `system-interface-contracts`, `version-control`, `owasp-security`, `refactor`

**Keywords**
- `dependency architecture`, `dependency graph`, `package boundaries`, `runtime dependency`, `build dependency`, `duplicate libraries`, `supply chain risk`, `adapter layer`, `lock-in`, `upgrade policy`

<!-- skill-graph-context:end -->
