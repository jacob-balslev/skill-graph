---
name: color-system-design
description: "Use when designing a color system — palette construction, semantic color tokens, WCAG contrast ratios, perceptual uniformity in OKLCH/LCH, and light/dark mode parity. Do NOT use for single brand-color picks, runtime theme-switching mechanics, or non-color design tokens. Do NOT use for Pick the brand's primary color from scratch with no constraints. Do NOT use for Implement the prefers-color-scheme media query and toggle UI. Do NOT use for Choose spacing values for the layout grid. Do NOT use for the WCAG criteria themselves (use a11y)."
license: CC-BY-4.0
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: design
  deployment_target: portable
  scope: "Designing a color system — palette construction, semantic color tokens, WCAG contrast ratios, perceptual uniformity in OKLCH/LCH, and light/dark mode parity. Portable across any design system; principle-grounded, not repo-bound. Excludes single brand-color picks, runtime theme-switching mechanics (dark-mode-implementation), and non-color design tokens."
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"color palette design\",\"semantic color tokens\",\"wcag contrast ratio\",\"apca contrast\",\"oklch color space\",\"perceptual uniformity\",\"color scales\",\"light dark parity\",\"color accessibility\",\"p3 color gamut\"]"
  triggers: "[\"color system\",\"color palette\",\"color tokens\",\"wcag contrast\",\"oklch\"]"
  examples: "[\"Build a 10-step color scale from a brand seed color with perceptually even lightness steps\",\"Map semantic intents (success, warning, danger, info) to scale colors with WCAG AA contrast against both light and dark surfaces\",\"Audit an existing palette for AA contrast failures and propose minimal changes\"]"
  anti_examples: "[\"Pick the brand's primary color from scratch with no constraints\",\"Implement the prefers-color-scheme media query and toggle UI\",\"Choose spacing values for the layout grid\"]"
  relations: "{\"related\":[\"theme-system-design\",\"dark-mode-implementation\",\"visual-design-foundations\",\"a11y\"],\"boundary\":[{\"skill\":\"theme-system-design\",\"reason\":\"theme-system-design structures how color decisions become tokens and reach components; this skill produces those color decisions.\"},{\"skill\":\"a11y\",\"reason\":\"a11y owns the WCAG criteria themselves; this skill applies them when constructing palettes and selecting pairings.\"}]}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/color-system-design/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---

# Color System Design

## Coverage
A color system has three layers: a palette of raw color values (organized as scales — typically 9 to 12 steps from very light to very dark within a single hue), a set of semantic tokens that name colors by purpose rather than appearance (background-surface, text-primary, border-subtle, danger-emphasis), and a mapping that resolves semantic tokens to palette values per theme. The palette is the vocabulary; the semantic tokens are the contract that components consume; the mapping is what changes between themes.

Color spaces matter for scale construction. sRGB and HSL are non-perceptually-uniform — equal numeric steps in lightness produce unequal perceived lightness changes, with notable cliffs around yellow and teal. OKLCH and CIELAB are perceptually uniform color spaces where equal L (lightness) steps look equal regardless of hue, making them the appropriate space for generating scales. The CSS Color Module Level 4 specifies oklch() and lch() as first-class CSS color functions, and color-mix() in lch/oklch space produces predictable interpolation. The display-p3 gamut, supported by most modern displays, allows more saturated colors than sRGB in the green/red regions; declaring color-gamut: p3 or using p3 color functions delivers them while CSS color fallbacks handle sRGB-only displays.

Contrast is governed by WCAG 2.1, which specifies a contrast ratio computed from relative luminance: 4.5:1 for normal text (AA), 3:1 for large text (AA, defined as 18pt+ or 14pt+ bold), and 7:1 for normal text (AAA). APCA (Accessible Perceptual Contrast Algorithm), the working draft for WCAG 3, uses a different model that better predicts perceived text legibility, with thresholds expressed as Lc values (60 Lc for body text, 75 Lc for small text). Tooling should compute both, but WCAG 2.1 remains the legally referenced standard in most jurisdictions as of 2026.

Semantic tokens decouple the system from a single visual treatment. text-primary on a light theme might be near-black at L=0.15; on a dark theme it might be near-white at L=0.96. Both resolve to the same component token and meet the same contrast requirement against their respective backgrounds. The discipline is to define semantic tokens by intent and contrast pair (text-on-surface, text-on-emphasis), never by appearance (text-dark-gray).

## Philosophy
Color choices are constraints applied to perception, not free decisions. Perceptual uniformity, contrast minima, color-blindness considerations (8% of men have some form of color vision deficiency), and gamut limits are real and observable. A palette that ignores them produces accessibility violations and uneven scales that designers have to compensate for with one-off tweaks.

Semantic tokens are worth the indirection because color meanings outlive specific values. "Danger" stays danger when the brand red shifts a few degrees; components keep working. Tying components directly to palette values turns every brand refresh into a code change.

## Verification
- Every text/background pair used in the product meets WCAG 2.1 AA at minimum; an automated check runs in CI against the token combinations.
- Scales are generated in OKLCH or LCH and exported to sRGB or display-p3; equal step indices have equal lightness within ±2 L units.
- Semantic tokens are named by intent (background-surface, danger-emphasis) not by appearance (gray-50, red-700) in component code.
- Light and dark themes provide every semantic token; no token is light-only or dark-only.
- Color is not the only signal for state — error states pair red with an icon and text, not red alone, to remain accessible to color-blind users.
- The palette has been previewed under simulated protanopia, deuteranopia, and tritanopia, and important distinctions remain visible.
- Brand color is anchored at a specific scale step (e.g., brand at step 600) so the surrounding scale is generated rather than hand-tuned.

## Do NOT Use When
- The task is picking a single brand color with no system implications. That is a brand decision, not a system decision.
- You are implementing the runtime mechanics of theme switching, persistence, and asset variants. Use theme-system-design and dark-mode-implementation.
- The work is non-color tokens — spacing, typography, motion. Use typography-system or visual-design-foundations.
- The concern is purely accessibility-criterion lookup rather than palette construction. Use a11y.
- You need to choose color values for a single illustration or marketing graphic with no token impact. Treat as art direction, not system design.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Deployment: `portable`
- Scope: Designing a color system — palette construction, semantic color tokens, WCAG contrast ratios, perceptual uniformity in OKLCH/LCH, and light/dark mode parity. Portable across any design system; principle-grounded, not repo-bound. Excludes single brand-color picks, runtime theme-switching mechanics (dark-mode-implementation), and non-color design tokens.

**When to use**
- Build a 10-step color scale from a brand seed color with perceptually even lightness steps
- Map semantic intents (success, warning, danger, info) to scale colors with WCAG AA contrast against both light and dark surfaces
- Audit an existing palette for AA contrast failures and propose minimal changes
- Triggers: `color system`, `color palette`, `color tokens`, `wcag contrast`, `oklch`

**Not for**
- Pick the brand's primary color from scratch with no constraints
- Implement the prefers-color-scheme media query and toggle UI
- Choose spacing values for the layout grid
- Owned by `theme-system-design`
- Owned by `a11y`: the WCAG criteria themselves

**Related skills**
- Related: `theme-system-design`, `dark-mode-implementation`, `visual-design-foundations`, `a11y`

**Keywords**
- `color palette design`, `semantic color tokens`, `wcag contrast ratio`, `apca contrast`, `oklch color space`, `perceptual uniformity`, `color scales`, `light dark parity`, `color accessibility`, `p3 color gamut`

<!-- skill-graph-context:end -->
