---
name: performance-budgets
description: "Use when declaring, measuring, or enforcing performance thresholds as a quality contract rather than as an aspirational target. Covers the three budget axes (time, size, count), the four governing properties of a real budget (metric, threshold, percentile, consequence), the Core Web Vitals set (LCP, INP, CLS), the RAIL model, Lighthouse budgets.json, lab vs field measurement, and the discipline of treating budget breach as a build or deploy failure rather than a tracked metric. Do NOT use for the activity of profiling and optimizing a specific slow path (use performance-engineering), the choice of rendering model that bounds achievable budgets (use rendering-models), or the design of observability and telemetry signals (use observability-modeling)."
license: MIT
allowed-tools: Read Grep
metadata:
  relations: "{\"related\":[\"rendering-models\",\"http-semantics\",\"performance-engineering\",\"observability-modeling\",\"testing-strategy\"],\"suppresses\":[\"performance-engineering\",\"testing-strategy\"],\"verify_with\":[\"observability-modeling\",\"performance-engineering\",\"streaming-architecture\"]}"
  subject: quality-assurance
  scope: "Declaring, measuring, and enforcing performance thresholds as a quality contract rather than an aspirational target — the three budget axes (time, size, count), the four governing properties of a real budget (metric, threshold, percentile, consequence), the Core Web Vitals set (LCP, INP, CLS), the RAIL model, Lighthouse budgets.json, lab vs field measurement, and treating budget breach as a build/deploy failure. Portable across any product with performance SLAs; principle-grounded, not repo-bound. Excludes profiling and optimizing a specific slow path (performance-engineering), the rendering-model choice that bounds achievable budgets (rendering-models), and observability/telemetry signal design (observability-modeling)."
  public: "true"
  taxonomy_domain: quality/performance
  stability: experimental
  keywords: "[\"performance budget\",\"Core Web Vitals\",\"LCP\",\"INP\",\"CLS\",\"RAIL model\",\"Lighthouse budgets\",\"lab metrics\",\"field metrics\",\"p75 performance\"]"
  triggers: "[\"how fast does this page need to be\",\"what's a good LCP target\",\"should this fail the build\",\"why is the Lighthouse score different from real users\",\"we need a performance budget\"]"
  examples: "[\"set a Core Web Vitals budget for a marketing landing page and enforce it in CI\",\"explain why a green Lighthouse score still produced bad real-user performance\",\"decide between INP and FID as the interaction-responsiveness metric\",\"design a per-route budget table that distinguishes static pages from logged-in dashboards\"]"
  anti_examples: "[\"profile a specific slow query and decide what to fix (use performance-engineering)\",\"choose between SSG and SSR for a route (use rendering-models)\",\"design telemetry spans and traces (use observability-modeling)\"]"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A performance budget is to a web app what a calorie budget is to a diet — the calorie count of any single meal is information; the calorie budget is what you do about it when you exceed it. A diet that 'tracks' calories without consequence is description; a diet with a calorie *budget* is discipline. And a per-meal budget (per-route) catches drift earlier than a per-day total: by the time the day total breaches, the offending meal is hours behind you and harder to undo."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/quality-assurance/performance-budgets/SKILL.md
---

# Performance Budgets

## Concept of the skill

A performance budget is a declared, measurable threshold for a user-affecting property of a system — load time, interaction latency, layout stability, bundle size, request count — *treated as a contract the system must satisfy*. A complete budget has *four parts* (a statement missing any part is not a budget): (1) *metric* — LCP, INP, CLS, JS bytes, request count, cited by name not by "speed" or "load time"; (2) *threshold* — a number, not a band ("2.5 seconds"); (3) *percentile* — whose experience the threshold describes ("p75" is the Core Web Vitals standard, meaning the threshold must hold for the median through the 75th percentile of users); (4) *consequence* — what happens when the threshold is breached: deploy blocked / CI failure / rollback trigger, *not* "we look at it next sprint."

Replaces aspirational performance targets ("we'd like the page to be fast") with enforceable contracts ("LCP at p75 must be below 2.5 seconds in field measurement; breach blocks deploy"). Solves the problem that performance regressions accumulate silently — every commit adds a little JS, every quarter ships more third-party scripts, every redesign loosens layout — and by the time anyone notices, the regressions are baked into many changes that are hard to disentangle. Three properties distinguish a real budget from a tracked metric: (1) it is set *before* the spending decisions, not after (a budget that emerges from post-hoc retrospectives is description; one that constrains the next feature is discipline); (2) it binds to a *consequence*, not a dashboard (a number someone watches is a metric; a number that fails a build is a budget); (3) it speaks *for the user* (every other voice in the room — engineering, design, product, marketing — has its own incentives; the budget is the institutional voice of the user, present at every commit, refusing to grant exceptions silently). The hardest part is not setting the number — it is committing to enforce it the first time the budget blocks a feature.

Distinct from performance-engineering, which owns the activity of measuring, profiling, and improving performance — this skill owns the *threshold-and-consequence contract*; the two compose (budgets define failure conditions; engineering produces improvements that prevent breach). Distinct from rendering-models, which owns the choice of when and where UI is produced — this skill sits *downstream* (the chosen rendering model bounds which budgets are achievable on a given route; a fully-CSR dashboard cannot meet a 1.5s LCP budget no matter what optimization). Distinct from observability-modeling, which owns the design of telemetry signals (spans, metrics, logs) — this skill *consumes* signals as evidence of breach but does not design them. Distinct from testing-strategy, which owns runtime-correctness verification — this skill is an analogous discipline for *non-functional* properties; a budget breach is the same kind of CI failure as a failing test. Distinct from http-semantics (transport-level optimization, downstream of the rendering and routing choices that determine achievable budgets). A performance budget is to a web app what a calorie budget is to a diet — the calorie count of any single meal is information; the calorie budget is what you do about it when you exceed it. A diet that 'tracks' calories without consequence is description; a diet with a calorie *budget* is discipline. And a per-meal budget (per-route) catches drift earlier than a per-day total: by the time the day total breaches, the offending meal is hours behind you and harder to undo. The wrong mental model is that a "performance budget" is any kind of measurement-and-tracking around performance — that a dashboard with green-yellow-red thresholds is a budget, or that "we monitor Core Web Vitals" is a budgeting practice. They are not. The defining property is the *consequence*: a budget without an automated build-or-deploy gate is a tracked metric, not a budget. Adjacent misconceptions: that a single site-wide threshold fits all routes (it does not — marketing landing pages need stricter budgets than logged-in admin panels because the audience and competitive context differ; per-route budgets are the working standard); that lab measurements alone are sufficient (they are not — lab is reproducible and fast for CI gates, but field data is authoritative; if the field metric breaches while the lab passes, the lab is missing something — investigate and fix the gap, never accept "but the Lighthouse score is green"); that one-axis budgets are enough (they are not — a JS-bytes budget catches bundle bloat, a time budget catches render delays, a request-count budget catches third-party drift; setting all three axes catches regression at the level closest to where it happened); that FID is still the interaction-responsiveness metric (it is not — INP replaced FID in March 2024; a site that passes FID may fail INP); that third-party scripts should be exempted from the budget (they should not — the user experiences their cost regardless of who shipped them; the budget *includes* third parties or it is not measuring user experience); and that budgets are aspirational from day one (they are not — calibrate against current p75 + 5-10% margin and ratchet tighter as optimization lands; "impossible from day one" gets disabled, "loose forever" generates no signal).

## Coverage

The discipline of declaring measurable thresholds for performance-affecting properties and enforcing them as quality contracts. Covers the four governing properties (metric, threshold, percentile, consequence), the three budget axes (time, size, count), the three measurement modes (lab, field, synthetic), the Core Web Vitals set as the most-adopted public budget standard, the RAIL model as the interaction-class framework, Lighthouse budgets.json as a declarative enforcement mechanism, and the per-route granularity that real applications require.

## Philosophy of the skill
A budget is a contract written in numbers. Three things distinguish a real budget from a tracked metric:

1. **It is set before the spending decisions, not after.** A budget that emerges from post-hoc retrospectives is a description; a budget that constrains the next feature is a discipline.
2. **It binds to a consequence, not a dashboard.** A number that someone watches and worries about is a metric. A number that fails a build is a budget.
3. **It speaks for the user.** Every other voice in the room — engineering, design, product, analytics, marketing — has its own incentives. The budget is the institutional voice of the user, present at every commit, refusing to grant exceptions silently.

The hardest part of performance budgeting is not setting the number — it is committing to enforce it when enforcement is expensive. The first time the budget blocks a feature, the discipline is tested. A team that grants an exception "just this once" has reduced the budget to a metric. A team that delays the feature, cuts another feature, or extends the budget through a documented amendment has kept the contract intact.

## The Four Parts of a Real Budget

A complete budget statement names all four:

> **LCP at p75 must be below 2.5 seconds in field measurement; breach blocks deploy.**

| Part | This budget's value | Why it matters |
|---|---|---|
| Metric | LCP (Largest Contentful Paint) | Cited by name, not by "speed" or "load time"; LCP has a precise definition |
| Threshold | 2.5 seconds | A number, not a band; matches the Core Web Vitals "Good" boundary |
| Percentile | p75 | Whose experience this threshold describes — the slower three-quarters get worse |
| Consequence | Deploy blocked | The discipline; without this, the rest is a tracked metric |

A statement that says "LCP should be fast" or "we target a Lighthouse score of 90" is missing at least one of these parts. The missing parts are where the discipline leaks.

## The Three Axes

| Axis | Examples | Why budgeted |
|---|---|---|
| **Time** | LCP, INP, CLS, TTFB, FCP, TTI | Direct user-perceived latency |
| **Size** | JS bytes, CSS bytes, image bytes, font bytes, total transfer | Bounds parse, network, and execution cost — proxies for time on slow devices |
| **Count** | Requests, third-party scripts, fonts loaded, DOM nodes | Connection overhead, rendering cost, attack surface |

Size and count budgets are upstream of time budgets: a page that ships 3MB of JS will fail INP on a mid-range Android device regardless of how clever the optimization is. Setting all three axes catches regression at the level closest to where it happened.

## The Core Web Vitals Set

Google's Core Web Vitals are the most widely adopted public budget standard. They are the default starting point for a project that does not yet have a budget.

| Metric | Good | Needs Improvement | Poor | Definition |
|---|---|---|---|---|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5–4.0s | > 4.0s | Time from navigation start to the largest above-fold element rendering |
| INP (Interaction to Next Paint) | ≤ 200ms | 200–500ms | > 500ms | The worst observed delay between any user interaction and the next paint, in the session |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 | Sum of unexpected layout shifts, weighted by impact area |

All three are measured at p75 in field data. The bands come from Google's published correlation between metric value and user-retention proxies.

INP replaced First Input Delay (FID) as a Core Web Vital in March 2024. FID measured only the first interaction; INP measures the worst across the session. A site that passes FID may fail INP; the budget update is not cosmetic.

## The RAIL Model

A complementary framework that classifies interactions by their latency budget:

| Class | Budget | Examples |
|---|---|---|
| **Response** | < 100ms from user input to acknowledgement | Button press feedback, hover, focus |
| **Animation** | < 16ms per frame (60fps) | Scroll, transition, drag |
| **Idle** | Idle work in chunks ≤ 50ms | Analytics flush, prefetching, deferred rendering |
| **Load** | < 5s on a slow 3G mid-range mobile | First navigation to interactive |

RAIL is older than Core Web Vitals but still load-bearing as a per-interaction-class budget. CWV is the public-facing summary; RAIL is the design-time guidance for what each interaction should cost.

## Lab vs Field

| Mode | Tool examples | Strengths | Limitations |
|---|---|---|---|
| Lab | Lighthouse, WebPageTest, sitespeed.io | Reproducible, fast, integrable in CI | Constructed environment may not reflect real users |
| Field (RUM) | CrUX, web-vitals.js + own RUM, Sentry Performance, Datadog RUM | Authoritative; reflects real users on real devices | Slow feedback; data arrives after the regression ships |
| Synthetic | Scheduled lab runs against production from multiple regions | Trend tracking; geographic coverage | Still lab; same constructed-environment limits |

The discipline that works:

- **Lab as pre-deploy gate.** Lighthouse-CI or equivalent runs on every PR; budget breach blocks the merge. Catches regressions before they ship.
- **Field as authoritative assessment.** RUM data reports the p75 the user actually experienced. If the field metric breaches even though the lab passed, the lab is missing something — investigate and fix the gap.
- **Synthetic for trend.** Scheduled production runs from a representative set of geographies; useful for week-over-week regression spotting and for the rare case where production diverges from staging.

## Per-Route Budgets

A site-wide budget either fits the strictest route or the loosest. Neither is right. A realistic budget table:

| Route profile | LCP target | INP target | JS budget | Why |
|---|---|---|---|---|
| Marketing landing | 1.5s | 200ms | 100KB compressed | Largest revenue impact per millisecond; competition is fast |
| Product detail | 2.0s | 200ms | 200KB | Catalog content + image-heavy; users have intent |
| Search results | 2.5s | 200ms | 250KB | Server work per query; users tolerate slightly more for relevance |
| Logged-in dashboard | 3.0s | 300ms | 400KB | Personalized; users have committed; richer UI |
| Admin panel | 4.0s | 500ms | 600KB | Low-traffic; high-functionality; small known audience |

The numbers above are illustrative — the actual values come from the project's content, audience, and competitive position. The shape is the load-bearing part: differentiate per route, with stricter budgets on the routes that face the cold-arriving user and looser budgets on the routes that face the committed one.

## Lighthouse budgets.json

A declarative enforcement file that Lighthouse and Lighthouse-CI consume:

```json
{
  "path": "/",
  "resourceSizes": [
    { "resourceType": "script", "budget": 200 },
    { "resourceType": "stylesheet", "budget": 50 },
    { "resourceType": "image", "budget": 300 },
    { "resourceType": "font", "budget": 100 },
    { "resourceType": "total", "budget": 800 }
  ],
  "resourceCounts": [
    { "resourceType": "third-party", "budget": 10 },
    { "resourceType": "script", "budget": 20 }
  ],
  "timings": [
    { "metric": "interactive", "budget": 3000 },
    { "metric": "first-contentful-paint", "budget": 1500 }
  ]
}
```

The file is checked into the repo, applies per path, and triggers a Lighthouse-CI failure when breached. It is the cheapest place to make a budget enforceable; the consequence (CI failure) is the property that makes it a budget rather than documentation.

## The Discipline of Calibration

A budget set too tight blocks all work and gets disabled. A budget set too loose generates no signal. Calibration is the practice of setting budgets that are slightly stricter than current performance, ratcheting them tighter as optimization work lands.

**Ratchet pattern:**

1. Measure current p75 on the route.
2. Set the budget at the current value + a small margin (5–10%).
3. Land optimization work; budget enforces no regression.
4. When the optimization shows in field data, tighten the budget to the new p75 + margin.
5. Repeat.

The pattern prevents the "budget is impossible from day one" failure mode and the "budget drifts forever" failure mode. Each tightening is small enough to land without negotiation; the cumulative effect over a year is substantial.

## Verification

After applying this skill, verify:
- [ ] Every budget statement names all four parts (metric, threshold, percentile, consequence).
- [ ] At least one budget on each of the three axes (time, size, count) — single-axis budgets miss whole classes of regression.
- [ ] Field measurement (RUM, CrUX) is the authoritative source for at least the Core Web Vitals; lab measurement is the pre-deploy gate.
- [ ] Per-route budgets exist where routes have meaningfully different content profiles (landing vs dashboard, anonymous vs logged-in).
- [ ] The consequence is automated — a CI step, a deploy gate, a rollback trigger — not a manual review.
- [ ] Lighthouse budgets.json (or equivalent declarative file) is checked into the repo, version-controlled, and reviewed in the same PR as performance-affecting changes.
- [ ] INP is part of the time budget set (FID alone is insufficient for sessions with multiple interactions).
- [ ] Third-party scripts are inside the budget, not exempted — the user experiences their cost.
- [ ] The percentile is documented and matches industry convention (p75 for CWV) or has an explicit reason for differing.
- [ ] A calibration plan exists — when and how the budget tightens as performance improves.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Profiling a specific slow path and deciding what to fix | `performance-engineering` | performance-engineering owns the diagnostic and optimization activity; this skill owns the contract that defines failure |
| Choosing a rendering model for a route | `rendering-models` | rendering-models bounds what budgets are achievable; this skill consumes that input |
| Designing telemetry spans, traces, or metric pipelines | `observability-modeling` | observability-modeling designs the signals; this skill defines what level of those signals counts as a breach |
| Writing tests for behavior correctness | `testing-strategy` | testing-strategy owns runtime correctness; budgets are an analogous discipline for non-functional properties |
| Designing HTTP cache headers, compression, or transport | `http-semantics` | http-semantics owns the wire-level optimization; budgets are downstream of the choice |

## Key Sources

- Google Chrome Team. [Core Web Vitals](https://web.dev/articles/vitals). Definitions, "Good / Needs Improvement / Poor" bands, and the underlying research linking metric values to user-retention proxies. The most-adopted public budget standard.
- Google Chrome Team. [Interaction to Next Paint (INP)](https://web.dev/articles/inp). The 2024 replacement for FID; explains why measuring all interactions in the session (not just the first) materially changes which sites pass.
- Google Chrome Team. [The RAIL performance model](https://web.dev/articles/rail). Older but still load-bearing; classifies interactions by latency class and assigns each a budget.
- Tim Kadlec. ["Performance Budgets"](https://timkadlec.com/2013/01/setting-a-performance-budget/). 2013. The original article naming and defining the performance-budget concept; introduces the discipline as a product practice rather than a technical metric.
- Google Chrome Team. [Lighthouse performance budgets](https://developer.chrome.com/docs/lighthouse/performance/performance-budgets-101). The budgets.json reference and CI integration.
- Chrome User Experience Report (CrUX). [CrUX dataset](https://developer.chrome.com/docs/crux). The public field dataset; the source of truth for cross-site Core Web Vitals data and the underlying corpus for the band definitions.
- Addy Osmani. ["Speed at Scale: Web Performance Tips and Tricks from the Trenches"](https://addyosmani.com/blog/). Practitioner-level writing on calibrating and enforcing budgets in production teams.
- Web Almanac (HTTP Archive). [Performance chapter](https://almanac.httparchive.org/en/2024/performance). Annual cross-site analysis; useful for competitive-derived threshold calibration.
- Microsoft. [INP at Microsoft Store: 30% improvement case study](https://blogs.windows.com/msedgedev/2023/10/06/the-edge-team-on-improving-inp/). A worked example of an INP budget driving a measurable user-experience improvement.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `quality-assurance`
- Public: `true`
- Domain: `quality/performance`
- Scope: Declaring, measuring, and enforcing performance thresholds as a quality contract rather than an aspirational target — the three budget axes (time, size, count), the four governing properties of a real budget (metric, threshold, percentile, consequence), the Core Web Vitals set (LCP, INP, CLS), the RAIL model, Lighthouse budgets.json, lab vs field measurement, and treating budget breach as a build/deploy failure. Portable across any product with performance SLAs; principle-grounded, not repo-bound. Excludes profiling and optimizing a specific slow path (performance-engineering), the rendering-model choice that bounds achievable budgets (rendering-models), and observability/telemetry signal design (observability-modeling).

**When to use**
- set a Core Web Vitals budget for a marketing landing page and enforce it in CI
- explain why a green Lighthouse score still produced bad real-user performance
- decide between INP and FID as the interaction-responsiveness metric
- design a per-route budget table that distinguishes static pages from logged-in dashboards
- Triggers: `how fast does this page need to be`, `what's a good LCP target`, `should this fail the build`, `why is the Lighthouse score different from real users`, `we need a performance budget`

**Not for**
- profile a specific slow query and decide what to fix (use performance-engineering)
- choose between SSG and SSR for a route (use rendering-models)
- design telemetry spans and traces (use observability-modeling)

**Related skills**
- Verify with: `observability-modeling`, `performance-engineering`, `streaming-architecture`
- Related: `rendering-models`, `http-semantics`, `performance-engineering`, `observability-modeling`, `testing-strategy`

**Concept**
- Mental model: |
- Purpose: |
- Analogy: A performance budget is to a web app what a calorie budget is to a diet — the calorie count of any single meal is information; the calorie budget is what you do about it when you exceed it. A diet that 'tracks' calories without consequence is description; a diet with a calorie *budget* is discipline. And a per-meal budget (per-route) catches drift earlier than a per-day total: by the time the day total breaches, the offending meal is hours behind you and harder to undo.
- Common misconception: |

**Keywords**
- `performance budget`, `Core Web Vitals`, `LCP`, `INP`, `CLS`, `RAIL model`, `Lighthouse budgets`, `lab metrics`, `field metrics`, `p75 performance`

<!-- skill-graph-context:end -->
