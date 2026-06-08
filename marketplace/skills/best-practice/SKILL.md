---
name: best-practice
description: "Cross-cutting best practices enforcement across code, templates, skills, prompts, scripts, documentation, pages, and design. The enforcement layer that catches violations any specialist might miss. Do NOT use for deep code review methodology (use code-review), application security depth (use owasp-security), accessibility implementation depth (use a11y), or specialist design-system work (use design-system-architecture, color-system-design, or typography-system). Do NOT use for designing the color system and contrast model (use color-system-design). Do NOT use for implementing font loading and vertical rhythm (use typography-system). Do NOT use for designing a skill's comprehension or application eval suite (use agent-eval-design)."
license: MIT
compatibility: "Applies to any web application codebase using TypeScript, React, and Next.js App Router. The cross-domain enforcement priorities (security, a11y, performance, design system, testing, DevOps, AI/LLM) are framework-agnostic; the Next.js section is specific to the App Router pattern."
allowed-tools: Read Grep Bash
metadata:
  subject: quality-assurance
  scope: "Portable final-pass quality enforcement across code, templates, skills, prompts, scripts, documentation, pages, and design. Use after or alongside specialist skills to catch boundary-spanning issues in security, accessibility, performance, testing, design-system use, documentation, DevOps, AI/LLM artifacts, and Next.js App Router patterns. Excludes deep specialist methodology owned by code-review, owasp-security, a11y, design-system-architecture, color-system-design, typography-system, testing-strategy, and agent-eval-design."
  taxonomy_domain: quality/cross-domain
  stability: stable
  keywords: "[\"best practice\",\"best practices\",\"code quality\",\"quality enforcement\",\"code review checklist\",\"OWASP\",\"WCAG\",\"Core Web Vitals\",\"SOLID principles\",\"clean code\"]"
  examples: "[\"reviewing a pull request for correctness, security, and style\",\"creating a new React component and checking it against quality standards\",\"auditing an existing feature for WCAG compliance and performance regressions\",\"writing tests and verifying coverage shape (unit / integration / e2e pyramid)\",\"authoring a new skill and checking it has structured scope, evals, and examples\",\"adding a new Next.js Server Action and verifying it has Zod validation and auth check\"]"
  anti_examples: "[\"reviewing PR feedback phrasing and comment classification (use code-review)\",\"performing a deep OWASP threat review (use owasp-security)\",\"designing keyboard focus behavior or live-region placement (use a11y)\",\"designing the color system and contrast model (use color-system-design)\",\"implementing font loading and vertical rhythm (use typography-system)\",\"designing a skill's comprehension or application eval suite (use agent-eval-design)\"]"
  relations: "{\"boundary\":[{\"skill\":\"code-review\",\"reason\":\"best-practice owns the broad final quality gate across artifacts; code-review owns review process, finding classification, and feedback phrasing\"},{\"skill\":\"owasp-security\",\"reason\":\"best-practice owns breadth-level security checks in a cross-domain pass; owasp-security owns deep application-security review\"},{\"skill\":\"a11y\",\"reason\":\"best-practice owns broad accessibility reminders in a final quality pass; a11y owns detailed accessibility implementation and verification\"}],\"related\":[\"code-review\",\"owasp-security\",\"a11y\",\"testing-strategy\",\"test-coverage-strategy\",\"performance-engineering\",\"performance-budgets\",\"design-system-architecture\",\"visual-design-foundations\",\"layout-composition\",\"color-system-design\",\"typography-system\",\"microcopy\",\"architecture-decision-records\",\"skill-scaffold\",\"agent-eval-design\",\"server-components-design\",\"server-actions-design\"],\"verify_with\":[\"code-review\",\"owasp-security\",\"a11y\",\"testing-strategy\",\"design-system-architecture\"]}"
  grounding: "{\"subject_matter\":\"Cross-cutting quality enforcement across 14 domains\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[],\"failure_modes\":[\"specialist_boundary_gaps\",\"heading_hierarchy_violations\",\"hardcoded_values_bypass_token_system\",\"server_actions_treated_as_internal\",\"dead_tests_accumulate\"],\"evidence_priority\":\"general_knowledge_first\"}"
  public: "true"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/best-practice/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Best Practice — Cross-Cutting Quality Enforcement

## Domain Context

**What is this skill?** Cross-cutting best practices enforcement across code, templates, skills, prompts, scripts, documentation, pages, and design. The enforcement layer that catches violations any specialist might miss.

## Coverage

Cross-cutting best practices enforcement across code, templates, skills, prompts, scripts, documentation, pages, and design. The sections below contain the detailed rules, examples, and boundaries for using this skill correctly.

## Coverage (14 domains)

Code quality (SOLID, strict TypeScript, DRY/KISS), documentation (ADRs, self-documenting names, TSDoc), security (OWASP Top 10:2025, secret management, input validation), accessibility (WCAG 2.2, semantic HTML, keyboard operability), performance (Core Web Vitals, code splitting, image optimization), design systems (token hierarchy, dark mode, composable APIs), testing (pyramid shape, behavior-not-implementation, coverage guardrails), DevOps (trunk-based development, progressive delivery, pipeline-as-code), AI/LLM skill design (RCCF structure, eval methodology, scope boundaries), Next.js App Router patterns (Server Components default, Server Action security, explicit caching), UX & UI composition (F-pattern for data surfaces, one L1 focal point per zone, density-first spacing), visual hierarchy (surface layering, card/banner depth, information density vs whitespace), typographic hierarchy (6-level heading contract, Minor Third scale, 4 canonical weights, h6 micro-labels), and color hierarchy (greyscale chrome, financial-only semantic color, triple encoding for colorblind safety).

> **Authority:** Cross-domain quality gate. Does not override specialist skills — catches violations that fall between specialist boundaries. Use specialist skills for depth.
> **Scope:** "Small focused changes" means scope discipline, NOT code reduction.

## Philosophy

This skill exists because quality violations most often occur at the boundaries between specialist domains — a developer focuses on getting the TypeScript right but ships a `<div onClick>` instead of a `<button>`, or nails the component logic but hardcodes a hex color. No single specialist skill catches all of these; each covers its own depth. Without a cross-cutting enforcement layer, agents produce code that passes within any one domain but fails the "would a senior engineer approve this PR?" test. Observed failure modes that motivated this skill: SQL injection via string interpolation passing TypeScript strict mode, skipped test.skip entries accumulating into permanent dead tests, Server Actions treated as internal functions despite being public HTTP endpoints, and heading hierarchy violations slipping through because neither the a11y skill nor the design-system skill owned the overlap zone. This skill is the net that catches what falls between specialist boundaries.

---

## Cross-Domain Synergy
As the baseline enforcement layer, this skill connects:
- **layout-composition & frontend-architecture**: Enforcing one L1 focal point, scan-friendly layout, and density appropriate to the task.
- **visual-design-foundations & design-system-architecture**: Surface hierarchy, component composition, token use, and information density.
- **typography-system & semantics**: Heading hierarchy, readable names, and text structure that matches meaning.
- **color-system-design**: Semantic color use, contrast, and redundant encoding when color carries meaning.
- **microcopy**: Validating product copy inside PRs against the project voice and interaction state.

## 1. Code Quality

| Rule | Enforcement |
|------|-------------|
| Strict TypeScript | `"strict": true`, no `any`, no `@ts-ignore` without explanation |
| SOLID principles | One responsibility per module, depend on abstractions |
| DRY / KISS / YAGNI | No duplicate blocks >10 lines, no premature abstraction |
| Explicit return types | Every exported function declares its return type |
| Small focused changes | PRs touch one logical concern, <400 changed lines (excl. generated) |

> Anti-patterns and checklist: `references/code-quality-checklist.md`. See naming-conventions and semantics for naming rules.

## 2. Documentation

| Rule | Enforcement |
|------|-------------|
| Self-documenting names | If a name needs a comment, rename it |
| Comments explain WHY | Code explains what; comments explain intent, gotchas, business rules |
| ADRs for decisions | `docs/adr/` — Context, Decision, Alternatives, Consequences |
| TSDoc on public APIs | `@param`, `@returns`, `@throws` on exported functions |
| No stale TODOs | Every `// TODO` must reference a tracker ticket |

> See architecture-decision-records for ADR creation methodology.

## 3. Security (OWASP Top 10:2025)

| Priority | Rule | Check |
|----------|------|-------|
| A01 | Broken Access Control | Every endpoint verifies auth AND authz; default-deny |
| A03 | Supply Chain | No high/critical CVEs; pin dependency versions |
| A05 | Injection | Parameterized queries only; Zod validation on all input |
| A10 | Exception Handling | No stack traces to clients; all errors caught server-side |
| — | Secret management | No secrets in source; `.env*` in `.gitignore` |

> Deep reference: `references/security-checklist.md`. See owasp-security for application-security depth, webhook-integration for webhook verification, and prompt-injection-defense for LLM input threats.

## 4. Accessibility (WCAG 2.2)

| Rule | Standard | Check |
|------|----------|-------|
| Semantic HTML first | WCAG 4.1.2 | `<button>` not `<div onClick>`, native `<dialog>`, `<nav>` |
| Keyboard operable | WCAG 2.1.1 | All functionality via Tab/Enter/Space/Arrows; no traps |
| Color contrast | WCAG 1.4.3 | 4.5:1 text, 3:1 UI components |
| Target size | WCAG 2.5.8 | 24px WCAG minimum; follow the project standard when stricter |
| Heading hierarchy | WCAG 1.3.1 | Sequential h1>h2>h3, no skipping, one h1 per page |

> Deep reference: `references/accessibility-checklist.md`. See a11y for Axe-Core Playwright tests, focus-ring systems, reduced-motion strategy, and live-region placement.

## 5. Performance

| Rule | Threshold | Check |
|------|-----------|-------|
| LCP | <2.5s | No lazy-load on above-fold images |
| INP | <200ms | No main-thread tasks >50ms; defer non-critical JS |
| CLS | <0.1 | Images have `width`/`height`; no layout shifts |
| Bundle discipline | Monitor in CI | Dynamic `import()` for routes; no full-library imports |
| Image optimization | AVIF/WebP | `next/image` with proper sizing; `loading="lazy"` below fold |

> Deep reference: `references/performance-checklist.md`. See react-best-practices for 57 detailed performance optimization rules across 8 categories.

## 6. Design System

| Rule | Enforcement |
|------|-------------|
| Three-tier token hierarchy | Primitive > Semantic > Component; never use primitives in components |
| No hardcoded values | All colors, spacing, typography via tokens — never raw hex or px |
| Dark mode via CSS custom properties | `:root` light, `[data-theme="dark"]` overrides |
| Composable component APIs | Variant props from tokens, not arbitrary style overrides |
| No `!important` | Fix specificity, don't override it |

> See design-system-architecture for system structure, color-system-design for contrast and semantic color, typography-system for type hierarchy, and visual-design-foundations for composition polish.

## 7. Testing

| Rule | Enforcement |
|------|-------------|
| Pyramid shape | Many unit, some integration, few E2E |
| Test behavior, not implementation | Public interfaces and observable outcomes only |
| Coverage guardrails | 70-80% line coverage; focus on logic and edge cases |
| No dead tests | No `test.skip` / `xit` without linked ticket |
| Co-located test files | `.test.ts` next to source `.ts` |

> Deep reference: `references/testing-patterns.md`. See testing-strategy and test-coverage-strategy for depth.

## 8. DevOps & CI/CD

| Rule | Enforcement |
|------|-------------|
| Trunk-based development | Short-lived branches (<2 days); feature flags control visibility |
| Pipeline as code | Build, lint, typecheck, test, security scan — all automated gates |
| Feature flag lifecycle | Owner + expiration; remove within 30 days of GA |
| No force operations | No `--force` push, no `--no-verify`, no `reset --hard` without cause |
| Rollback strategy | Health checks + documented recovery path |

## 9. AI/LLM Skill & Prompt Design

| Rule | Enforcement |
|------|-------------|
| RCCF structure | Role, Context, Constraints, Format in every prompt |
| Structured outputs | JSON schemas or Zod validation; never free-text parsing |
| Few-shot examples | 2-3 examples for non-trivial tasks |
| Eval coverage | Skills declare honest eval state; use `evals/comprehension.json` and `evals/application.json` when certification is claimed |
| Explicit scope boundaries | Define what skill does AND does not do |

> See skill-scaffold for skill creation methodology and agent-eval-design for eval-suite design.

## 10. Next.js App Router

| Rule | Enforcement |
|------|-------------|
| Server Components default | `'use client'` is opt-in, pushed down the tree |
| Server Actions = public API | Zod validation + auth check as first two operations |
| Explicit caching | `revalidatePath` / `revalidateTag` after mutations |
| Loading states | `loading.tsx` or Suspense boundaries for async routes |
| No Pages Router patterns | No `getServerSideProps`, `getStaticProps`, `_app.tsx` |

> Deep reference: `references/nextjs-patterns.md`. See server-components-design for component placement, server-actions-design for action security, and http-semantics for HTTP contract details.

---

## Cross-Domain Enforcement Priorities

These rules appear across 3+ domains — **highest enforcement weight**:

1. **Validate all input server-side** (Security + Next.js + Testing)
2. **Never expose secrets or PII** (Security + DevOps + GDPR)
3. **Semantic HTML over ARIA hacks** (Accessibility + Design System)
4. **Automate quality gates in CI** (Code Quality + Testing + DevOps + Security)
5. **Test behavior, not implementation** (Testing + Code Quality)
6. **Token hierarchy, never hardcoded values** (Design System + Performance)
7. **Server Components by default** (Next.js + Performance + Security)
8. **Small, focused changes** (Code Quality + DevOps + AI/LLM)
9. **Explicit caching strategy** (Next.js + Performance)
10. **Structure over verbosity** (AI/LLM + Documentation)

---

## Verification

- [ ] **Code:** No `any`, no lint suppressions without reason, explicit return types
- [ ] **Docs:** Names are self-documenting, TODOs have tickets, ADRs for decisions
- [ ] **Security:** Auth checked, input validated, no secrets in source
- [ ] **A11y:** Semantic HTML, keyboard operable, contrast passing, targets 44px (Sales Hub)
- [ ] **Perf:** No unnecessary client JS, images optimized, no layout shifts
- [ ] **Design:** All values from tokens, no `!important`, dark mode works
- [ ] **Tests:** New logic has tests, behavior-focused, no dead tests
- [ ] **DevOps:** No force operations, feature flags have owners, pipeline passes
- [ ] **AI/LLM:** Skills have evals, prompts have structure, scope is bounded
- [ ] **Next.js:** Server Components default, Server Actions secured, caching explicit

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Deep code review methodology (feedback phrasing, review structure) | `code-review` | code-review owns the review process and feedback format |
| Application security threat modeling and OWASP-depth review | `owasp-security` | owasp-security owns security depth beyond broad reminders |
| Webhook signature verification and retry semantics | `webhook-integration` | webhook-integration owns inbound webhook contracts |
| 44px touch targets, focus-ring system, reduced-motion strategy | `a11y` | a11y owns Sales Hub accessibility implementation depth |
| Deep type correctness, narrowing, and unsafe casts | `type-safety` | type-safety owns TypeScript soundness patterns |
| Design tokens, component APIs, and theme architecture | `design-system-architecture` | design-system-architecture owns the design-system contract |
| L1 focal point rules, F-pattern layout, zone-based composition | `layout-composition` | layout-composition owns layout composition rules |
| Font loading, OpenType features, vertical rhythm | `typography-system` | typography-system owns deep typographic engineering |
| Token sync contract and contrast math | `color-system-design` | color-system-design owns the color system rules |
| SCSS architecture, BEM naming, design token integration | `scss-expert` | scss-expert owns CSS architecture patterns |
| Eval-case design for skills and agents | `agent-eval-design` | agent-eval-design owns comprehension and application eval design |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Domain: `quality/cross-domain`
- Scope: Portable final-pass quality enforcement across code, templates, skills, prompts, scripts, documentation, pages, and design. Use after or alongside specialist skills to catch boundary-spanning issues in security, accessibility, performance, testing, design-system use, documentation, DevOps, AI/LLM artifacts, and Next.js App Router patterns. Excludes deep specialist methodology owned by code-review, owasp-security, a11y, design-system-architecture, color-system-design, typography-system, testing-strategy, and agent-eval-design.

**When to use**
- reviewing a pull request for correctness, security, and style
- creating a new React component and checking it against quality standards
- auditing an existing feature for WCAG compliance and performance regressions
- writing tests and verifying coverage shape (unit / integration / e2e pyramid)
- authoring a new skill and checking it has structured scope, evals, and examples
- adding a new Next.js Server Action and verifying it has Zod validation and auth check

**Not for**
- reviewing PR feedback phrasing and comment classification (use code-review)
- performing a deep OWASP threat review (use owasp-security)
- designing keyboard focus behavior or live-region placement (use a11y)
- designing the color system and contrast model (use color-system-design)
- implementing font loading and vertical rhythm (use typography-system)
- designing a skill's comprehension or application eval suite (use agent-eval-design)
- Owned by `code-review`: the broad final quality gate across artifacts
- Owned by `owasp-security`: breadth-level security checks in a cross-domain pass
- Owned by `a11y`: broad accessibility reminders in a final quality pass

**Related skills**
- Verify with: `code-review`, `owasp-security`, `a11y`, `testing-strategy`, `design-system-architecture`
- Related: `code-review`, `owasp-security`, `a11y`, `testing-strategy`, `test-coverage-strategy`, `performance-engineering`, `performance-budgets`, `design-system-architecture`, `visual-design-foundations`, `layout-composition`, `color-system-design`, `typography-system`, `microcopy`, `architecture-decision-records`, `skill-scaffold`, `agent-eval-design`, `server-components-design`, `server-actions-design`

**Grounding**
- Mode: `hybrid`

**Keywords**
- `best practice`, `best practices`, `code quality`, `quality enforcement`, `code review checklist`, `OWASP`, `WCAG`, `Core Web Vitals`, `SOLID principles`, `clean code`

<!-- skill-graph-context:end -->
