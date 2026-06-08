---
name: theme-system-design
description: "Use when designing a theme system — design tokens, semantic token layering, CSS custom property strategy, runtime theme switching, and theme contract guarantees. Do NOT use for one-off color choices, brand-only palette work, or framework-specific styling-library configuration. Do NOT use for Choose the exact hex value for the brand's primary blue. Do NOT use for Configure Tailwind's content array and purge settings. Do NOT use for Implement the dark mode toggle interaction."
license: CC-BY-4.0
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: frontend-engineering
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"theme token contract\",\"theme semantic layer\",\"theme variables\",\"css custom properties\",\"runtime theme switching\",\"token tiers\",\"theme contract\",\"design tokens community group\",\"theme parity\",\"token naming\"]"
  triggers: "[\"theme system\",\"design tokens\",\"theme switching\",\"css variables for theming\",\"token architecture\"]"
  examples: "[\"Design a three-tier token system (reference → system → component) for a multi-brand product\",\"Add a third theme to an existing two-theme system without breaking the component contracts\",\"Move from hard-coded colors to CSS custom properties with runtime switching\"]"
  anti_examples: "[\"Choose the exact hex value for the brand's primary blue\",\"Configure Tailwind's content array and purge settings\",\"Implement the dark mode toggle interaction\"]"
  relations: "{\"related\":[\"color-system-design\",\"design-system-architecture\",\"visual-design-foundations\",\"dark-mode-implementation\"]}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  public: "true"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/theme-system-design/SKILL.md
  skill_graph_export_description_projection: anti_examples
---

# Theme System Design

## Coverage
A theme system is a contract between design decisions and component code, expressed as named tokens that components consume and themes resolve. The mainstream model uses three tiers — reference tokens (raw values: blue.500 = #1E66F5), system or semantic tokens (intent-named: color.background.surface, color.text.primary), and component tokens (component-specific overrides: button.primary.background). Components consume system and component tokens only; themes provide reference-token-to-system-token mappings. This indirection is what allows a single theme swap to repaint the whole product without component edits.

CSS custom properties are the dominant runtime delivery mechanism for web themes. A theme is a set of custom-property assignments scoped to a selector — typically :root for the default, [data-theme="dark"] for alternates. Custom properties cascade and inherit, so a theme override on a subtree (a dark-on-light landing-page hero inside a light app) is a single attribute change. The W3C Design Tokens Community Group format (design-tokens.org) is the emerging interchange standard, expressed as JSON with $value, $type, and $description; tooling (Style Dictionary, Tokens Studio, Terrazzo) transforms it into platform outputs (CSS variables, iOS catalogs, Android resources).

Runtime switching has three operational pieces: persistence (localStorage or a cookie if SSR-sensitive), application (a class or data attribute on the document root before first paint to avoid flash), and propagation (notify components that read theme imperatively — chart libraries, canvases). The pre-paint application typically requires a small inline script in the document head that runs before the stylesheet loads.

Theme contracts make additive changes safe and breaking changes visible. Adding a new system token is safe; renaming or removing one is a breaking change requiring a deprecation cycle. Components that read tokens by exact name should not be expected to handle missing tokens gracefully — a missing token resolves to the CSS variable's fallback value (or invalid, depending on the property), which is rarely what's wanted in production.

## Philosophy
The indirection earns its complexity by separating two rates of change: brand decisions change rarely, theme assignments (which brand color means "danger") change occasionally, and components change continuously. A flat token system collapses these into one rate and forces every component to know about every brand value. The three-tier model gives each rate of change its own surface to evolve on.

Semantic names beat descriptive names. color.background.surface tells a component author what to use; color.gray.100 forces them to know that gray.100 happens to be the surface color today and changes meaning when the theme flips. The discipline is to resist convenience names that leak appearance into the contract.

## Verification
- Components reference only system or component tokens; a grep for raw hex values or reference tokens in component code returns zero matches.
- Switching themes at runtime triggers no full-page repaint flicker; the theme attribute is set before the first paint.
- A new theme can be added by providing only a new set of system-token values; no component files are modified.
- Token definitions live in a single source-of-truth file (JSON, ideally DTCG-format) and are generated into the CSS variable layer by a build step.
- Removing or renaming a system token causes a build-time or lint-time error in every consuming component, not a silent runtime fallback.
- Server-rendered pages serialize the chosen theme into the initial HTML so first paint matches user preference.
- Documentation lists every semantic token with intent, not appearance.

## Do NOT Use When
- The task is picking specific color values or designing a palette. Use color-system-design.
- The work is one-off styling of a single component with no system-wide implications. Use design-module-composition.
- The integration concerns are dark-mode detection, asset variants, and prefers-color-scheme handling. Use dark-mode-implementation.
- You are configuring a styling library's runtime (Tailwind config, Emotion theme provider setup) without changing the token contract. That is build configuration, not theme architecture.
- The decision is about typography or spacing scales rather than tokens generally. Use typography-system or visual-design-foundations.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering`

**When to use**
- Design a three-tier token system (reference → system → component) for a multi-brand product
- Add a third theme to an existing two-theme system without breaking the component contracts
- Move from hard-coded colors to CSS custom properties with runtime switching
- Triggers: `theme system`, `design tokens`, `theme switching`, `css variables for theming`, `token architecture`

**Not for**
- Choose the exact hex value for the brand's primary blue
- Configure Tailwind's content array and purge settings
- Implement the dark mode toggle interaction

**Related skills**
- Related: `color-system-design`, `design-system-architecture`, `visual-design-foundations`, `dark-mode-implementation`

**Keywords**
- `theme token contract`, `theme semantic layer`, `theme variables`, `css custom properties`, `runtime theme switching`, `token tiers`, `theme contract`, `design tokens community group`, `theme parity`, `token naming`

<!-- skill-graph-context:end -->
