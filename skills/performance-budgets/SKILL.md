---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: performance-budgets
description: "Use when declaring, measuring, or enforcing performance thresholds as a quality contract rather than as an aspirational target. Covers the three budget axes (time, size, count), the four governing properties of a real budget (metric, threshold, percentile, consequence), the Core Web Vitals set (LCP, INP, CLS), the RAIL model, Lighthouse budgets.json, lab vs field measurement, and the discipline of treating budget breach as a build or deploy failure rather than a tracked metric. Do NOT use for the activity of profiling and optimizing a specific slow path (use performance-engineering), the choice of rendering model that bounds achievable budgets (use rendering-models), or the design of observability and telemetry signals (use observability-modeling)."
version: 1.0.0
type: capability
category: quality
domain: quality/performance
scope: reference
owner: skill-graph-maintainer
freshness: "2026-05-15"
drift_check:
  last_verified: "2026-05-15"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
comprehension_state: present
stability: experimental
license: MIT
allowed-tools: Read Grep
keywords:
  - performance budget
  - Core Web Vitals
  - LCP
  - INP
  - CLS
  - RAIL model
  - Lighthouse budgets
  - lab metrics
  - field metrics
  - p75 performance
  - bundle size budget
  - request count budget
  - performance regression
  - budget breach
triggers:
  - "how fast does this page need to be"
  - "what's a good LCP target"
  - "should this fail the build"
  - "why is the Lighthouse score different from real users"
  - "we need a performance budget"
examples:
  - "set a Core Web Vitals budget for a marketing landing page and enforce it in CI"
  - "explain why a green Lighthouse score still produced bad real-user performance"
  - "decide between INP and FID as the interaction-responsiveness metric"
  - "design a per-route budget table that distinguishes static pages from logged-in dashboards"
anti_examples:
  - "profile a specific slow query and decide what to fix (use performance-engineering)"
  - "choose between SSG and SSR for a route (use rendering-models)"
  - "design telemetry spans and traces (use observability-modeling)"
relations:
  related:
    - performance-engineering
    - rendering-models
    - observability-modeling
    - testing-strategy
    - http-semantics
  boundary:
    - skill: performance-engineering
      reason: "performance-engineering owns the activity of measuring, profiling, and improving performance. performance-budgets owns the threshold-and-consequence contract. The two compose: budgets define the failure conditions; engineering produces the improvements that prevent breach."
    - skill: rendering-models
      reason: "rendering-models owns the choice of when and where the UI is produced. performance-budgets sits downstream — the chosen rendering model bounds which budgets are achievable on a given route."
    - skill: observability-modeling
      reason: "observability-modeling owns the design of telemetry signals (spans, metrics, logs). performance-budgets consumes signals as evidence of breach but does not design the signals themselves."
    - skill: testing-strategy
      reason: "testing-strategy owns runtime-correctness verification. performance-budgets is an analogous discipline for non-functional properties — a budget breach is the same kind of CI failure as a failing test."
  verify_with:
    - performance-engineering
    - observability-modeling
concept:
  definition: "A performance budget is a declared, measurable threshold for a user-affecting property of a system — load time, interaction latency, layout stability, bundle size, request count — treated as a contract the system must satisfy. A budget has four parts: the metric (what is measured), the threshold (the maximum or minimum acceptable value), the percentile (whose experience the threshold describes), and the consequence (what happens when the threshold is breached). Without all four, the number is an aspiration, not a budget."
  mental_model: |
    A budget converts performance from a vague aspiration ("the page should be fast") into a binary pass/fail check ("LCP at p75 must be below 2.5 seconds; breach blocks deploy"). The conversion has four properties that distinguish a real budget from a wish:

    1. **The metric** — what is measured. Not "fastness," but a named, defined quantity: LCP (Largest Contentful Paint), INP (Interaction to Next Paint), CLS (Cumulative Layout Shift), TTFB (Time to First Byte), JS payload bytes, image bytes, request count, third-party script count. Each metric has a precise definition; the budget cites the definition.

    2. **The threshold** — the value the metric must stay below (or above, for throughput-style metrics). Thresholds come from research (Google's CWV bands are derived from observed correlation with bounce rate), from product decision (a luxury site may target stricter numbers than a utility site), or from competitive analysis. The threshold is a number, not a band.

    3. **The percentile** — whose experience the threshold describes. A median-only budget hides the long tail of slow users. The Core Web Vitals convention is p75: the threshold must hold for 75% of real-user sessions. Other systems use p90 or p99. The percentile is part of the budget — "LCP < 2.5s" is incomplete without "at p75."

    4. **The consequence** — what happens when the budget is breached. Options ordered by strictness: alert (visible in a dashboard), warn (CI annotation, no block), block (CI failure, deploy halted), revert (auto-rollback on field detection). A budget without a consequence is a tracked metric, not a budget. The consequence is the discipline.

    The three budget axes cover the property surface:

    - **Time budgets** — LCP, INP, CLS, TTFB, FCP, TTI. The user-perceived latency budget.
    - **Size budgets** — JS, CSS, image, font, total transfer. The bandwidth-and-parse budget.
    - **Count budgets** — requests, third-party scripts, fonts loaded, DOM nodes. The connection-and-render budget.

    The three measurement modes have different uses:

    - **Lab measurement** (Lighthouse, WebPageTest synthetic runs) — controlled environment, reproducible, used for regression detection and pre-deploy gates.
    - **Field measurement** (CrUX, RUM, web-vitals.js) — real users on real networks and devices, used for the authoritative budget assessment. Field is the truth; lab is the proxy.
    - **Synthetic monitoring** — scheduled lab runs against production, useful for tracking trend over time without the noise of field variance.

    A discipline that uses only lab measurements optimizes for a constructed environment. A discipline that uses only field measurements has slow feedback (data arrives days late, after the regression already shipped). The discipline that works uses lab measurements as a fast pre-deploy gate and field measurements as the authoritative budget assessment.
  purpose: |
    Performance work without a budget regresses silently. New features add code. Third parties accumulate. Designs grow richer. Each change is individually small and individually justified; the cumulative drift is what kills the user experience. A budget makes the drift visible at the moment it happens — the same way a test makes a regression visible at the moment a function changes.

    A budget also encodes a product decision that is otherwise buried in implicit trade-offs: how fast does this experience need to be for the user we serve? The decision is a real one, not a "fastest possible" tautology. A luxury fashion site may tolerate a 3-second LCP if it ships unique high-fidelity imagery; an emergency-services tool may need a 1-second LCP because users arrive in distress. The budget is the place where that decision lives.

    Without budgets, performance reviews become qualitative ("the team thinks this is fine") and selective (only escalated when a metric goes obviously wrong). With budgets, every change passes or fails a published threshold. The argument shifts from "is this change worth it?" to "does this change fit the budget, and if not, what else must we cut?"

    The deepest purpose is to defend the user from the team's good intentions. Every individual choice the team makes — add this feature, embed this third party, support this configuration — has a defensible local rationale. A budget is the institutional voice of the user, present at every commit, refusing to grant exceptions silently.
  boundary: |
    **A budget is not a metric.** A metric is a number that can be observed. A budget is a metric plus a threshold plus a percentile plus a consequence. Tracking LCP in a dashboard is observation; declaring "LCP at p75 must be below 2.5s, or the build fails" is a budget.

    **A budget is not a target.** A target is what you'd like to achieve; a budget is what you commit to enforcing. Targets can be missed without consequence; budget breaches must produce a defined response.

    **A budget is not a Lighthouse score.** Lighthouse scores are composite numbers in a lab environment. They are useful as regression detectors, not as user-facing performance assessments. A green Lighthouse score with red field metrics is a common pattern — the lab missed the real device, network, or interaction profile.

    **A budget is not the same as optimization.** A budget defines the failure conditions; optimization produces the improvements that prevent failure. The two are complementary: a team can optimize without a budget (and drift back later) or set a budget without optimizing (and breach on the first run). Both are needed.

    **A budget is not a single global number.** Different routes have different content profiles, different user expectations, and different rendering-model constraints. A marketing landing page may have a 1.5s LCP budget; a logged-in dashboard may have a 3s budget; a real-time chart may have an INP budget but no LCP budget. The right granularity is per-route, sometimes per-component.

    **A budget is not "the metric the framework gives us."** Frameworks expose what is easy to expose. A real budget is chosen because it reflects user impact, not because it is convenient. Custom budgets (search-box-to-first-result, form-submit-to-confirmation) are often more load-bearing than the standard set.

    **A budget is not adversarial to optimization work.** A well-set budget is the goal optimization work serves. A budget set too tight (faster than the rendering model can support) becomes a blocker that gets disabled; a budget set too loose (slower than users actually notice) generates no signal. Calibration matters.
  taxonomy: |
    By what is budgeted:
    - **Time budgets** — duration metrics that reflect user-perceived latency.
      - LCP (Largest Contentful Paint): time until the largest above-fold element renders.
      - INP (Interaction to Next Paint): worst observed delay between a user interaction and the next paint.
      - CLS (Cumulative Layout Shift): sum of unexpected layout shifts during the session.
      - TTFB (Time to First Byte): time from request to first response byte.
      - FCP (First Contentful Paint): time until any content paints.
      - TTI (Time to Interactive): time until the page is responsive to input.
    - **Size budgets** — byte-count metrics that bound parse, network, and execution cost.
      - JS payload (compressed and uncompressed).
      - CSS payload.
      - Image bytes (per image and total).
      - Font bytes.
      - Total transfer size.
    - **Count budgets** — cardinality metrics that bound connection and rendering load.
      - Total requests.
      - Third-party script count.
      - DOM node count.
      - Font families loaded.

    By measurement mode:
    - **Field measurement** — Real-User Monitoring (RUM). The Chrome User Experience Report (CrUX) is Google's public field dataset. RUM SDKs (web-vitals.js, vendor RUM) capture the same metrics from a project's own users. Field is the authoritative budget assessment.
    - **Lab measurement** — Lighthouse, WebPageTest, sitespeed.io, PageSpeed Insights's lab mode. Controlled environment, reproducible, used for pre-deploy gates and regression detection.
    - **Synthetic monitoring** — scheduled lab runs against production from multiple geographies, used for trend tracking.

    By enforcement consequence:
    - **Observed** — metric tracked in a dashboard, no automated response. Not a budget by this skill's definition; a metric.
    - **Warned** — CI annotation or warning email; deploy proceeds.
    - **Blocked** — CI failure; deploy halted until the budget is restored.
    - **Reverted** — auto-rollback on field detection of breach in production.

    By scope:
    - **Site-wide** — a single threshold applies to the whole site.
    - **Per-route** — different thresholds per route, reflecting content profile.
    - **Per-component** — thresholds for specific UI elements (e.g., search box response time).
    - **Per-cohort** — thresholds vary by user segment (mobile vs desktop, geography, network class).

    By origin of the threshold:
    - **Research-derived** — CWV bands (LCP 2.5s, INP 200ms, CLS 0.1) come from Google's published correlation with bounce-rate data.
    - **Product-derived** — chosen by the team based on user expectation and competitive context.
    - **Competitive-derived** — match or beat the slowest of a defined set of competitors.
    - **Capacity-derived** — calibrated against what the rendering model and infrastructure can support.
  analogy: |
    A household budget. Income (the user's tolerance for slowness) and expenses (each feature's performance cost) net to a balance. Without a budget, every department in the household spends to its appetite — the design team adds heavier imagery, the analytics team embeds another third party, the product team adds another feature above the fold. Each spend has a defensible local rationale. The household runs over only when the cumulative bill arrives — by which time the spending decisions are years old and the cuts will hurt.

    A budget set in advance does what a budget always does: it forces the prioritization conversation to happen *before* the spending. "If we add this third-party chat widget, what do we cut to stay under 200KB of JS?" is a different question from "the page is slow now; what do we do?"

    Lab measurement is the household budget spreadsheet. Field measurement is the bank statement. The spreadsheet predicts; the statement is the truth. A discipline that uses only the spreadsheet will miss the irregular expenses that show up only in the statement; a discipline that uses only the statement will react too slowly to prevent the overrun.
  misconception: |
    The most common misconception is that **Lighthouse scores are user performance**. They are not. Lighthouse measures in a constructed environment — typically a throttled CPU, simulated network, headless Chrome. Real users have different devices (often slower), different networks (often less reliable), and different geography. A page with a Lighthouse score of 95 and a field LCP of 4.5 seconds is common; the lab missed something the field did not — typically third-party scripts that load conditionally, real-device CPU profile, or geographic latency.

    The second misconception is that **INP replaced FID and nothing else changed**. INP (Interaction to Next Paint) became a Core Web Vital in March 2024, replacing First Input Delay (FID). The change is not cosmetic: FID measured only the *first* interaction's delay; INP measures the *worst* delay across all interactions in the session. Many sites that passed FID fail INP — long-running JavaScript on subsequent interactions (search, filter, form submission) was previously invisible to the budget and is now load-bearing.

    The third misconception is that **a budget without a consequence is a budget**. A number tracked in a dashboard, with no automated response to breach, is a metric. The discipline of a budget comes from the consequence — the CI failure, the deploy block, the rollback. A "budget" that everyone agrees not to enforce is the same as no budget.

    The fourth misconception is that **the median is a useful performance percentile**. The median (p50) describes the experience of the user who is exactly in the middle. The bottom 50% of users have a worse experience than the median. The Core Web Vitals convention of p75 reflects research that user retention correlates with the experience of the slower three-quarters — not the typical user. Sites that report p50 numbers in their performance dashboards are quietly hiding their slowest half.

    The fifth misconception is that **a single global budget works**. A marketing landing page and a logged-in admin dashboard are different products with different users in different contexts; their budgets should differ. A site-wide budget either fits the strictest route (making the rest impossible to ship features into) or the loosest route (making the strict routes unprotected). Per-route budgets are the realistic granularity.

    The sixth misconception is that **third-party scripts are excluded from "our" performance**. Users do not distinguish between first-party and third-party code. If a chat widget, analytics tag, or ad script blocks the main thread, the user experiences a slow page — and the budget breach is real, regardless of which org wrote the offending code. Budgets that exclude third parties are not measuring what the user feels.

    The seventh misconception is that **performance is purely a technical concern**. Budgets are product decisions: how fast does this experience need to be, for whom, at what cost to features. A budget set by the engineering team without product input is a budget that gets overridden the first time a deadline pressures it. A budget co-signed by product is a contract.
---

# Performance Budgets

## Coverage

The discipline of declaring measurable thresholds for performance-affecting properties and enforcing them as quality contracts. Covers the four governing properties (metric, threshold, percentile, consequence), the three budget axes (time, size, count), the three measurement modes (lab, field, synthetic), the Core Web Vitals set as the most-adopted public budget standard, the RAIL model as the interaction-class framework, Lighthouse budgets.json as a declarative enforcement mechanism, and the per-route granularity that real applications require.

## Philosophy

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
