---
name: typography-system
description: "Use when designing a typography system — typeface selection and pairing, modular type scale, vertical rhythm, line-height and measure rules, and web font delivery (subsetting, font-display, variable fonts). Do NOT use for body copy writing, single-headline font pairing, or non-text design tokens."
license: CC-BY-4.0
metadata:
  schema_version: "4"
  version: "1.0.0"
  type: capability
  category: design
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"type scale\",\"typeface pairing\",\"vertical rhythm\",\"line height\",\"measure line length\",\"web font delivery\",\"variable fonts\",\"font-display swap\",\"font subsetting\",\"modular scale\",\"typographic tokens\",\"opentype features\"]"
  triggers: "[\"typography system\",\"type scale\",\"font pairing\",\"variable fonts\",\"vertical rhythm\"]"
  examples: "[\"Build a type scale with seven steps using a 1.25 ratio and assign each step to a semantic token (display, h1, body, caption)\",\"Pair a serif display face with a sans-serif text face and document when to use each\",\"Self-host a variable font with WOFF2 subsetting and font-display: swap\"]"
  anti_examples: "[\"Write the headline copy for the landing page\",\"Pick the brand's primary color\",\"Decide where the headline component lives in the folder structure\"]"
  relations: "{\"related\":[\"visual-hierarchy\",\"visual-design-foundations\",\"theme-system-design\",\"layout-composition\"],\"boundary\":[{\"skill\":\"visual-hierarchy\",\"reason\":\"visual-hierarchy decides how to deploy type as an ordering signal on a given surface; this skill defines the scale and faces that get deployed.\"},{\"skill\":\"theme-system-design\",\"reason\":\"theme-system-design covers how typography tokens are layered and switched; this skill produces the typographic decisions inside them.\"}]}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/typography-system/SKILL.md
---

# Typography System

## Coverage
A typography system has four components: a small set of typefaces (often one for display, one for text, optionally one monospaced), a modular scale of sizes, a set of weight and style variants per face, and rules for line-height, letter-spacing, and measure (characters per line). Each component is encoded as design tokens — font-family-text, font-size-100 through font-size-900, line-height-tight/normal/loose, letter-spacing-tight/normal — and consumed by components through semantic tokens (display, heading-1, body, caption).

Type scales are usually built from a single ratio applied iteratively to a base size. Common ratios: 1.125 (major second, subtle, content-dense UIs), 1.2 (minor third), 1.25 (major third, common default), 1.333 (perfect fourth), 1.414 (augmented fourth), 1.5 (perfect fifth, loud), 1.618 (golden ratio, very loud). Most production systems use 5–9 steps; more steps dilute the visual distinction between adjacent levels.

Line-height and measure are coupled. Longer measures need taller line-heights to keep the eye from skipping lines; shorter measures need tighter line-heights to avoid feeling sparse. The widely-cited target is 45–75 characters per line for body text, with line-height between 1.4 and 1.6 for body and 1.1–1.3 for display. Letter-spacing (CSS letter-spacing / tracking) generally tightens at large sizes (-0.02em or less at display sizes) and stays neutral at body sizes; uppercase text benefits from positive tracking (+0.05em or more) for legibility.

Variable fonts (OpenType font-variations) deliver multiple weights, widths, and optical sizes in a single file via continuous axes (wght 100–900, wdth, opsz, etc.), exposed in CSS via font-variation-settings and font-weight: <number>. They reduce HTTP requests and enable weight as a continuous design decision. Web font delivery best practices: WOFF2 format (universally supported, ~30% smaller than WOFF); subset to Latin or the languages actually used (Google Fonts CSS API does this automatically; self-hosted fonts use pyftsubset or fonttools); font-display: swap to render fallback text immediately and swap in the web font when loaded; preload the most-used font files with <link rel="preload" as="font" crossorigin>; use size-adjust, ascent-override, descent-override, and line-gap-override on the fallback @font-face to match metrics and minimize cumulative layout shift.

## Philosophy
Restraint is the practice. One text face and one display face cover most product needs; a third is a deliberate choice that requires justification. Each additional typeface costs bandwidth, hierarchy clarity, and rendering consistency across operating systems.

Typography is the densest carrier of brand. A wordmark, a heading face, and a body face shape voice more than any color does. Treat the choice of faces with the same seriousness as the choice of brand color, and treat the system around them — scale, rhythm, measure — as the structure that makes the choices work across surfaces.

## Verification
- The system uses at most three typefaces (display, text, monospace); each is justified by a use that the others cannot serve.
- Type scale steps are derived from a single ratio applied to a base size; sizes are not picked individually.
- Body text measure falls within 45–75 characters on the most common viewport widths; verified by inspecting actual rendered lines, not assumed.
- Web fonts are served as WOFF2, subset to required glyphs, with font-display: swap and metrics-matched fallback @font-face to minimize layout shift.
- Cumulative Layout Shift attributable to web font loading is below 0.1 on a representative page.
- Variable fonts (where used) load a single file and access weight/width through font-variation-settings or numeric font-weight, not separate files per weight.
- Headings and body share a consistent vertical rhythm; line-heights and margins snap to a baseline grid (typically a 4px or 8px subgrid).

## Do NOT Use When
- The task is writing copy. Typography systems shape how copy reads; they do not produce copy.
- The decision is a one-off pairing for a single graphic or asset with no system implications.
- The work is color, spacing, or motion tokens. Use color-system-design or visual-design-foundations.
- The concern is how typography tokens reach components and switch between themes. Use theme-system-design.
- You are debugging a single rendering issue (font kerning, ligature behavior in a specific browser) without a system change. That is browser-specific debugging.
