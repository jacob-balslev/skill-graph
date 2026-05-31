# Recommended Skills for the OSS Library

> Which skills should an OSS Skill Graph library ship to be credibly useful to **all humans and AI agents**? This page names the recommended set, organized by relevance tier. For the broader Wave 2 expansion plan (skills that demonstrate the standard's expressive range across archetypes and scopes), read [`_archived/wave-2-extraction-2026-05-23.md`](_archived/wave-2-extraction-2026-05-23.md).

**Status note (2026-05-10):** the current repo ships the Tier A and Tier B recommendations plus additional conceptual skills. This document is retained as sequencing rationale and recommendation criteria, not as the current inventory.

## Selection criterion

Skills are picked by **universal relevance**, not by graph density or archetype-coverage demonstration. The test for inclusion: "Would a randomly-sampled developer or AI agent across any reasonable project benefit from having this skill loaded?"

Three filters applied:

1. **Domain-agnostic.** A pick must apply across web, mobile, backend, data, infrastructure — not just one ecosystem.
2. **Equally useful to humans and to AI agents.** A skill that only an AI consumes (e.g. `tool-call-strategy`) is in scope; a skill that only a human uses (e.g. project-specific brand voice) is out.
3. **Adoption-ready.** A pick must work the moment it's loaded — no project-specific configuration, no proprietary infrastructure, no assumed company conventions.

Picks that fail any filter are deferred to project-specific Wave 2 batches (Technical Capability, Design & UX, Doctrine/Strategy in the broader Wave 2 plan).

---

## Tier A — The Essential 12 (must-ship for any OSS skill library)

These 12 skills form the credible baseline. Without them the library cannot honestly claim to help "all humans and AI agents." In the current repo, all Tier A skills are shipped; the original eight-starter subset remains the canonical minimal specimen set.

| # | Skill | Status | Archetype | Scope | Why it's essential |
|---:|---|---|---|---|---|
| 1 | `skill-router` | shipped starter | router | reference | The entry point. Without a router skill, agents loading the library do not know how to dispatch among the rest. Demonstrates the unique value claim — graph-aware selection — at the same time. |
| 2 | `skill-scaffold` | shipped | capability | reference | Without this, adopters cannot extend the library — they can only consume it. The whole "all humans and AI agents to use" mission requires that anyone can author a new skill correctly. This skill teaches the contract by example. |
| 3 | `skill-infrastructure` | shipped | capability | portable | Library integrity matters as soon as you ship. Without this, drift accumulates silently. Operationally needed by anyone running the library more than 30 days. Covers maintenance discipline, audit tooling, and health monitoring. |
| 4 | `documentation` | shipped starter | capability | portable | Every codebase, every agent. The most cross-cutting skill in any library. |
| 5 | `naming-conventions` | shipped | capability | portable | Affects every file, function, variable, column, route, token. The single most cross-cutting authoring concern in any codebase, used by humans and agents at every commit. |
| 6 | `testing-strategy` | shipped starter | capability | portable | Universal need; pyramid/trophy/honeycomb decisions apply across stacks. |
| 7 | `debugging` | shipped starter | workflow | portable | Both humans and agents get stuck; both need the same triage discipline. |
| 8 | `refactor` | shipped starter | workflow | portable | Behavior-preserving change discipline. The most-requested operation when adopters use AI agents to clean up legacy code. |
| 9 | `code-review` | shipped | workflow | portable | Universal: humans review AI output, agents review human PRs, peers review peers. The most valuable skill an OSS library can ship to make AI-assisted coding production-safe. |
| 10 | `prompt-craft` | shipped | capability | portable | The meta-skill of working with LLMs. Used by every human asking an agent to do anything; used by every agent composing sub-agent prompts. Universal in the AI-coding era. |
| 11 | `owasp-security` | shipped | capability | portable | OWASP Top 10 is the universally-applicable security baseline. AI-generated code has 1.7–2.74× more security issues than human-written; a security skill in the library is non-negotiable. |
| 12 | `a11y` | shipped starter | capability | portable | WCAG 2.2 is the universal accessibility floor. Every UI, every public-facing surface. |

**Current status:** Tier A is shipped. The original recommendation closed the gap from the eight-starter baseline by adding `skill-scaffold`, `naming-conventions`, `code-review`, `prompt-craft`, and `owasp-security`; `lint-overlay` remains because it is the worked `archetype: overlay` specimen.

---

## Tier B — Strongly Recommended (next 8 to ship)

Skills that significantly raise adopter confidence but are not strictly necessary for first credible utility. Ship these once Tier A is stable.

| # | Skill | Archetype | Scope | Why it earns Tier B |
|---:|---|---|---|---|
| 13 | `context-engineering` | capability | portable | The discipline of designing what enters the LLM's context window. Universal AI-coding skill, but more advanced than `prompt-craft`. |
| 14 | `tool-call-strategy` | capability | portable | When to use which tool, in what order, with what fallback. Demonstrates `verify_with` + `boundary` cleanly — graph-density value as well as utility value. |
| 15 | `agent-engineering` | capability | portable | The production discipline behind agent systems: error budgets, observability, fault tolerance. Bridges everyday engineering practice to AI-native development. |
| 16 | `skill-infrastructure` | capability | portable | Meta-maintenance: how to keep a skill library healthy as it grows. Self-applying — adopters use it on their own libraries. Empowers self-sufficiency. |
| 17 | `database-migration` | capability | portable | Zero-downtime schema change is hard to improvise safely; codified expertise saves real incidents. Concrete utility every backend touches. |
| 18 | `webhook-integration` | capability | portable | Cross-platform integration boundary (signature verification, idempotency, retry). Real value from day one of any integration project. |
| 19 | `version-control` | capability | portable | Branch strategy, conventional commits, rebase-vs-merge, conflict resolution. Universal — every developer, every agent dispatching commits. |
| 20 | `error-tracking` | capability | portable | Production error capture, sampling, alerting, root-cause flow. Universal once a library reaches production. |

**Selection rationale:** these 8 are universal enough to recommend broadly but specialized enough that an early-stage adopter could reasonably skip them for the first month. Ship them in two batches of 4 for cleaner review.

---

## Tier C — Domain Extensions (optional, project-driven)

The remaining Wave 2 candidates from the broader plan. These are **not** universal; they apply to specific stacks, archetypes, or doctrines. Ship in batches when project demand surfaces.

### Technical Capability cluster (TypeScript/JS stack)

`react-best-practices`, `next-best-practices`, `linting`, `test-driven-development`, `dependency-management`, `git-worktree`, `vulnerability` (deeper companion to `owasp-security`).

### Classification cluster (knowledge-organization)

`taxonomy`, `ontology`, `semantics`, `glossary`, `knowledge-graph`, `conceptual-modeling`, `domain-modeling`. These demonstrate the standard's expressive range for adopters with deep knowledge-graph or ontology needs. Most projects can skip them.

### Agent System cluster (advanced AI engineering)

`agent-orchestration`, `agent-observability`, `hook-patterns`, `autonomous-loop-patterns`, `human-in-the-loop`, `session-lifecycle`, `claude-api`. Specialized to multi-agent systems; not universal.

### Design & UX cluster (partially shipped in OSS library)

Shipped coverage now includes `a11y`, `task-analysis`, `information-architecture`, `microcopy`, `semiotics`, `design-system-architecture`, `layout-composition`, `interaction-patterns`, `visual-design-foundations`, `interaction-feedback`, and `form-ux-architecture`.

Deferred split candidates: `color-science`, `typography`, `motion-design`, and `a11y-deep`. Do not add `design-token-architecture` as a separate OSS skill unless routing evals prove `design-system-architecture` is too broad; token architecture is currently owned there. Do not add a standalone `responsive` skill unless `layout-composition` becomes overloaded; responsive layout is currently owned there.

### Doctrine & Strategy cluster (academic-rigor signature picks)

`theory-of-constraints`, `OODA-loop`, `Shape Up`, `Wardley-mapping`, `DDD` (Domain-Driven Design). These ship "thinking patterns" as first-class skills — the project's distinctive academic-OSS commitment. Powerful but advanced; ship once Tier A + B are in place.

---

## Sequencing recommendation

| Phase | Ships | When |
|---|---|---|
| **Phase 0 (baseline)** | The 8 starters in v0.4.0 | Done |
| **Phase 1 — close Tier A** | Add `skill-scaffold`, `naming-conventions`, `code-review`, `prompt-craft`, `owasp-security` | Done |
| **Phase 2 — Tier B batch 1** | `context-engineering`, `tool-call-strategy`, `agent-engineering`, `skill-infrastructure` | Done — 2026-05-06 |
| **Phase 3 — Tier B batch 2** | `database-migration`, `webhook-integration`, `version-control`, `error-tracking` | Done — 2026-05-06 |
| **Phase 4 — Tier C pilot** | Pick one Tier C cluster based on observed adopter demand; ship its 5–7 skills | When Phase 3 stabilizes |

**Rationale:** Tier A → B → C is a deliberate sequencing from universal to specialized. A starter library with all of Tier A + 4 from Tier B (17 skills total) is a credible foundation for any adopter regardless of stack or domain. Tier C should ship demand-driven, not speculatively.

---

## What this list is *not*

To set expectations:

- **Not a graph-density demo.** The broader [`_archived/wave-2-extraction-2026-05-23.md`](_archived/wave-2-extraction-2026-05-23.md) optimizes for archetype × scope coverage and inter-skill relations. This list optimizes for adopter utility. The two lists overlap but are not the same.
- **Not a comprehensive index.** A real adopter will need project-specific skills beyond Tier A + B. Tier C names categories, not exhaustive lists.
- **Not a contract.** This is a recommendation. The OSS library has moved beyond the original 8-starter baseline; this doc explains the recommended order and why those skills mattered. The maintainer chooses the actual sequence.

---

## How this list was selected

The 4-reviewer board meeting at the 2026-05-04 multi-model synthesis (kept private) (Opus 4.7 + GPT-5.4 + Gemini 3.1 Pro + GPT-5.5 base) produced three competing Wave 2 strategies:

| Reviewer | Strategy | Picks |
|---|---|---|
| Opus | Graph density × archetype/scope coverage × meta-coherence | `agent-engineering`, `prompt-craft`, `context-engineering`, `taxonomy`, `domain-modeling`, `mcp-builder`, `naming-conventions`, `tool-call-strategy`, `human-in-the-loop`, `knowledge-graph` |
| GPT-5.4 | Concrete external value (everyday engineering) | `a11y`, `documentation`, `code-review`, `testing-strategy`, `refactor`, `vulnerability`, `next-best-practices`, `react-best-practices`, `database-migration`, `webhook-integration` |
| GPT-5.5 | Meta-maintenance (library health) | `skill-router`, `skill-infrastructure`, `documentation`, `debugging`, `testing-strategy`, `refactor`, `skill-scaffold`, `agent-engineering`, `tool-call-strategy` |

Tier A here picks the **5-way intersection** across the three strategies plus the Tier-A-defining filter (universal relevance to humans and AI agents). Tier B picks the **3-way union** of items that 2 or 3 reviewers named but that don't pass the universal filter cleanly. Tier C is the residual — items that one strategy named but that are stack-, ecosystem-, or doctrine-specific.

---

## Open questions for the maintainer

The 2026-05-04 multi-model synthesis (kept private) names seven decisions in its "Inputs Affecting Sequencing" section that gate downstream work. Two affect this recommendation list directly:

1. **Wave 2 pace** — the synthesis recommended 1 batch every 2 weeks (Aggressive), 4 weeks (Steady), or pilot-first. Tier A ships in one batch; Tier B in two. Pace decision drives milestone planning.
2. **Doctrine archetype mapping** — Tier C's Doctrine & Strategy cluster needs the schema's `type` enum either extended (Option B: add `doctrine` and `strategy` archetypes via v3.1 minor bump) or accepted as lossy (Option A: map to `capability` on extraction). The synthesis recommends Option B.

Both decisions are the maintainer's. The recommendations above hold regardless.

---

## Cross-references

| Topic | Read |
|---|---|
| Should you adopt Skill Graph at all? | [`ADOPTION.md`](ADOPTION.md) |
| Conceptual primer | [`SKILL_METADATA_PROTOCOL_PRIMER.md`](../skill-metadata-protocol/PRIMER.md) |
| Field-by-field semantics | [`SKILL_METADATA_PROTOCOL_field-reference.md`](../skill-metadata-protocol/field-reference.md) |
| Authoring template | [`../examples/skill-metadata-template.md`](../examples/skill-metadata-template.md) |
| Architecture and authority tiers | [`SKILL_GRAPH.md`](../SKILL_GRAPH.md) |
| Broader Wave 2 plan (graph-density-optimized) | [`_archived/wave-2-extraction-2026-05-23.md`](_archived/wave-2-extraction-2026-05-23.md) |
| 4-reviewer board meeting and synthesis | the 2026-05-04 multi-model synthesis (kept private) |
