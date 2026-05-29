---
name: dark-mode-implementation
description: "Use when implementing dark mode — prefers-color-scheme detection, theme persistence, flash-of-unstyled-theme prevention, color token mirroring, image and asset variants, and meta theme-color updates. Do NOT use for designing the dark palette itself, designing the token architecture, or generic theme-switching across more than two themes. Do NOT use for Pick the dark mode color palette values. Do NOT use for Design the three-tier token architecture. Do NOT use for Build a multi-brand theme system with five themes."
license: CC-BY-4.0
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: design-craft
  deployment_target: portable
  taxonomy_domain: design/visual
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"dark mode\",\"prefers-color-scheme\",\"theme persistence\",\"flash of unstyled theme\",\"flash of incorrect theme\",\"color-scheme css property\",\"meta theme-color\",\"dark mode images\",\"picture source media\",\"system theme detection\"]"
  triggers: "[\"dark mode\",\"prefers-color-scheme\",\"light dark toggle\",\"system theme\",\"FOUC dark mode\"]"
  examples: "[\"Add a dark mode toggle with system / light / dark options and persist the user's choice\",\"Eliminate the white flash that appears for a moment when a dark-mode user loads the page\",\"Provide dark variants of the marketing illustrations and the favicon\"]"
  anti_examples: "[\"Pick the dark mode color palette values\",\"Design the three-tier token architecture\",\"Build a multi-brand theme system with five themes\"]"
  relations: "{\"related\":[\"theme-system-design\",\"color-system-design\",\"a11y\",\"frontend-architecture\"],\"boundary\":[{\"skill\":\"theme-system-design\",\"reason\":\"theme-system-design defines the token layering that makes dark mode a token-mapping change; this skill handles the integration mechanics on top of that foundation.\"},{\"skill\":\"color-system-design\",\"reason\":\"The dark palette and its contrast pairings are color-system-design's responsibility; this skill consumes them.\"}]}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design-craft/dark-mode-implementation/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Dark Mode Implementation

## Coverage
A dark mode implementation handles five concerns: detecting the user's preference (system, explicit choice, persisted choice), applying the right theme before first paint, propagating theme changes at runtime, swapping color-sensitive assets, and updating browser-chrome hints. Each has well-defined web platform primitives.

Detection uses the prefers-color-scheme media query (window.matchMedia('(prefers-color-scheme: dark)')), which reflects the operating system or browser-level preference. Most products offer three user choices — System, Light, Dark — where System defers to the media query and the other two override it. The chosen mode is persisted (localStorage or a cookie) and read on every load. The CSS color-scheme property tells the user agent which schemes a page supports, enabling correct rendering of native form controls, scrollbars, and the default page background; declare color-scheme: light dark on :root for sites that support both.

Flash-of-incorrect-theme (sometimes called FOUC for theme) occurs when the browser paints the light default before the persisted dark preference is applied. The fix is a small, blocking inline script in <head> that reads the persisted preference and sets a class or data attribute on <html> synchronously before stylesheets resolve. Frameworks with server-side rendering must serialize the resolved theme into the HTML response, often by reading a cookie on the server.

The CSS Color Module Level 5 light-dark() function (light-dark(white, black)) lets a property declare both schemes inline and the user agent picks based on color-scheme. This is supported in current browsers and reduces the boilerplate of paired custom properties for simple cases; for token-driven systems, paired :root and [data-theme="dark"] custom property assignments remain the typical approach.

Asset handling covers three categories. Raster images that have brand-color elements need dark variants delivered via <picture> with <source media="(prefers-color-scheme: dark)"> (the markup-driven approach) or via CSS background-image swapping. SVG illustrations can use currentColor or CSS custom properties for fill/stroke and update automatically. Favicons can declare a dark variant via <link rel="icon" media="(prefers-color-scheme: dark)" href="...">. Embedded videos and iframes (YouTube, Maps) often have their own theme parameter that needs to be passed via URL.

Browser chrome hints include the meta theme-color tag (<meta name="theme-color" content="..." media="(prefers-color-scheme: dark)">), which sets the address bar color on mobile browsers, the Safari toolbar tint, and the PWA splash screen. Pair it with a light variant via media= so the chrome matches the active theme. Apple-specific apple-mobile-web-app-status-bar-style is now overridden by theme-color on supported versions.

## Philosophy
Dark mode is not a re-skin; it is a parallel design surface. Image contrast, shadow strategy (shadows on dark backgrounds work differently — often replaced with subtle borders or elevated background tints), focus ring visibility, and chart palettes all need attention. Treating dark mode as a CSS-only change produces a dark mode that technically works and feels half-finished.

The user's explicit choice overrides the system. A user who has toggled to Dark on your site once expects Dark on the next visit regardless of what their OS is doing. Persistence is not optional, and a System option is a separate, third state from "no preference saved."

## Verification
- No flash of incorrect theme occurs on cold load for a dark-mode user; verified by throttling network and watching the first paint.
- The CSS color-scheme property is declared on :root with the schemes the page supports, so native form controls render correctly in dark mode.
- Brand-color images (illustrations, hero photos with light backgrounds) have dark variants delivered via <picture> source matching or equivalent.
- The meta theme-color tag has paired light and dark variants and matches the active theme.
- The favicon has a dark variant where the design needs it (e.g., dark logos on transparent backgrounds become invisible against dark browser tabs).
- The user's explicit choice (light/dark/system) is persisted and restored across reloads; toggling away from System and back is observable.
- All interactive states (focus rings, hover, selected) are visible in dark mode and meet contrast requirements; verified visually and via automated contrast testing.

## Do NOT Use When
- The task is choosing the dark palette values themselves. Use color-system-design.
- The work is defining the token architecture that makes theming possible. Use theme-system-design.
- The product requires more than two themes (multi-brand white-label, three or more visual modes). Use theme-system-design for the architecture; this skill covers the dark-specific platform integrations only.
- You are auditing for WCAG contrast violations specifically. Use a11y for the criteria; the palette decisions come from color-system-design.
- The bug is a single component looking wrong in dark mode after the system is otherwise complete. That is component-level debugging, not implementation architecture.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design-craft`
- Deployment: `portable`
- Domain: `design/visual`

**When to use**
- Add a dark mode toggle with system / light / dark options and persist the user's choice
- Eliminate the white flash that appears for a moment when a dark-mode user loads the page
- Provide dark variants of the marketing illustrations and the favicon
- Triggers: `dark mode`, `prefers-color-scheme`, `light dark toggle`, `system theme`, `FOUC dark mode`

**Not for**
- Pick the dark mode color palette values
- Design the three-tier token architecture
- Build a multi-brand theme system with five themes
- Owned by `theme-system-design`
- Owned by `color-system-design`

**Related skills**
- Related: `theme-system-design`, `color-system-design`, `a11y`, `frontend-architecture`

**Keywords**
- `dark mode`, `prefers-color-scheme`, `theme persistence`, `flash of unstyled theme`, `flash of incorrect theme`, `color-scheme css property`, `meta theme-color`, `dark mode images`, `picture source media`, `system theme detection`

<!-- skill-graph-context:end -->
