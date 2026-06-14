---
name: visual-design-foundations
description: "Use when designing or auditing visual craft at foundation level: color palette, typography, spacing, elevation, rhythm, density, optical alignment, visual hierarchy direction, brand fit, contrast intent, and motion feel — making a surface more legible, polished, scannable, and tone-appropriate without changing its task structure. Do NOT use for sign-system meaning (use `semiotics`), token/component architecture (use `design-system-architecture`), responsive structure (use `layout-composition`), accessibility compliance (use `a11y`), or the DEEP contract of one dimension — formal color systems (use `color-system-design`), full type systems (use `typography-system`), deep hierarchy modeling (use `visual-hierarchy`), theming/token delivery (use `theme-system-design`), or interaction-state feedback (use `interaction-feedback`). Do NOT use for what does this icon or badge color communicate to users? Do NOT use for define semantic tokens and component variants."
license: MIT
allowed-tools: Read Grep
metadata:
  subject: design
  public: "true"
  scope: "Designing and auditing the visual craft of an interface surface — palette direction, type scale, spacing rhythm, density, elevation, borders, optical alignment and balance, contrast intent, visual weight, hierarchy direction, motion feel, and brand fit — at foundation level, including knowing when a concern should be split off to a deeper specialization (color-system-design, typography-system, visual-hierarchy, theme-system-design, interaction-feedback). Portable across product UI, dashboards, docs, marketing-adjacent product surfaces, and design-system consumers; principle-grounded, not repo-bound, and does not replace brand-specific guidelines. Excludes sign-system meaning (semiotics), token/component architecture and governance (design-system-architecture), responsive structure and breakpoints (layout-composition), and accessibility compliance (a11y)."
  taxonomy_domain: design/visual
  stability: experimental
  keywords: "[\"visual-design\",\"visual craft\",\"palette direction\",\"typography direction\",\"spatial rhythm\",\"density rules\",\"elevation treatment\",\"motion feel\",\"brand fit\",\"visual hierarchy\"]"
  examples: "[\"pick a visual direction for this dashboard without changing the task structure\",\"audit color, typography, spacing, and hierarchy for this product page\",\"this UI feels flat and hard to scan - improve the visual hierarchy\",\"choose a restrained palette and type scale for an internal admin tool\",\"make this generated prototype feel more professional without changing the flow\"]"
  anti_examples: "[\"what does this icon or badge color communicate to users?\",\"define semantic tokens and component variants\",\"decide the responsive section order and breakpoint behavior\",\"verify WCAG contrast, focus order, and screen-reader behavior\",\"generate a full OKLCH color scale with semantic color tokens\",\"build the product-wide type-scale ratio and web-font loading strategy\",\"model the layered primary/secondary/tertiary information hierarchy of this complex screen\",\"design the loading, skeleton, and error-state feedback patterns\",\"set up the design-token and runtime theme-switching layer\"]"
  relations: "{\"suppresses\":[{\"skill\":\"semiotics\",\"reason\":\"semiotics owns what visual signs mean; visual-design-foundations owns the craft choices that shape the surface once intended meaning is known\"},{\"skill\":\"layout-composition\",\"reason\":\"layout-composition owns responsive structure, grid tracks, and breakpoints; visual-design-foundations owns palette, typography, rhythm, density, and polish within that structure\"}],\"narrower\":[\"visual-hierarchy\",\"color-system-design\",\"typography-system\"],\"related\":[\"semiotics\",\"design-system-architecture\",\"layout-composition\",\"microcopy\",\"a11y\",\"interaction-feedback\",\"theme-system-design\"],\"verify_with\":[\"a11y\",\"semiotics\",\"visual-hierarchy\"]}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "Visual design foundations is the interior-design layer of a building, not the structural engineering — it chooses the palette, lighting, spacing, and materials that make a room legible and set its tone, but it defers the load-bearing structure (layout), the building code (a11y), the signage meaning (semiotics), and the building-systems contracts (design-system-architecture) to the disciplines that own them."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/visual-design-foundations/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---
# Visual Design Foundations

## Concept of the skill

Visual design foundations is the discipline of shaping an interface's visual craft — palette, type, spacing rhythm, density, elevation, optical balance, hierarchy, contrast intent, motion feel, and brand fit — so that the surface's structure becomes legible rather than merely decorated. Its central premise is that visual design is not a coat of paint applied after the layout is done; it is the layer through which priority, grouping, affordance, and tone are made visible, so a user can scan and act without reading every label. The craft works through a small set of primitives chosen *by role before raw value*: palette roles (surface, text, accent, success/warning/danger/info, disabled) before specific colors, type roles (page title, section heading, control label, body, metadata, numeric emphasis) before specific sizes, spacing/density rules tuned to repeated real use rather than a single screenshot, and optical alignment that centers by perceived weight rather than only geometry — with elevation, border, and background reserved for clarifying grouping and affordance instead of adding noise. Crucially, it is a *foundation* skill by design: it gives the entry-level orientation across every craft dimension but explicitly hands off anything that needs the deep contract — formal color math (`color-system-design`), font-loading engineering and full type systems (`typography-system`), deep hierarchy modeling (`visual-hierarchy`), token governance (`design-system-architecture` / `theme-system-design`), sign-meaning analysis (`semiotics`), or accessibility compliance (`a11y`) — to the skill that owns it, and it cross-checks its decisions against `semiotics` and `a11y` before treating them as done.

## Coverage

Design and audit visual craft for interface surfaces at foundation level. Covers:

- **Visual hierarchy** — the ranked levers (size, weight, spacing/position, contrast, color) and how to spend the cheapest structural lever before reaching for color. Deep hierarchy modeling hands off to `visual-hierarchy`.
- **Palette direction** — roles before raw colors, accent restraint, and the distinction between *contrast intent* (craft) and *contrast compliance* (a11y). Full palette construction and perceptual scale generation hand off to `color-system-design`.
- **Type direction** — type roles, a single modular scale, and right-sizing type to the surface's density. The full type system (pairing, rhythm, font delivery) hands off to `typography-system`.
- **Spacing and rhythm** — a consistent base unit (the 8-pt rhythm is the common default), spacing as a hierarchy and grouping tool, and density calibrated to repeated use.
- **Optical alignment and balance** — centering icons, glyphs, badges, and control contents by perceived weight rather than bounding box, so the surface looks balanced at real production size.
- **Elevation and borders** — tonal-first elevation with shadow as a selective separation/affordance tool, never blanket depth.
- **Motion feel** — purposeful, short, direction-aware transitions that clarify state or continuity and degrade gracefully under reduced-motion. State-feedback patterns (loading, skeletons, errors, empty states) hand off to `interaction-feedback`.
- **Brand fit and tone** — matching the visual register to the surface type and product purpose (see the surface-register matrix).
- **Handoff judgment** — knowing when a concern should be split off to a deeper color, typography, hierarchy, theming, motion, sign-meaning, or accessibility skill.

## Philosophy of the skill

Visual design is not decoration after structure; it is how the structure becomes legible. Good visual craft makes priority, grouping, affordance, and tone visible without asking the user to parse every label.

Two working rules follow. First, **choose by role before raw value** — name what a color or type size is *for* before assigning a specific value, so the surface stays consistent and changeable rather than hand-tuned per screen. Second, **spend the cheapest hierarchy lever first** — reach for size, weight, and spacing before color, because color is the lever most easily exhausted and most entangled with meaning (semiotics) and contrast compliance (a11y).

**Generated drafts are inputs, not authority.** Visual drafts produced by AI tools, design-system templates, or UI kits can speed exploration, but they are material to evaluate, not finished designs. The final surface still needs the same craft audit — role clarity, hierarchy, density, elevation restraint, motion purpose, brand fit, and the boundary handoffs — applied to refine, correct, or reject the generated input.

Keep this skill at foundation level. This is the entry layer; when a single dimension needs its deep contract, hand off to the specialization that owns it — formal color math to `color-system-design`, font-loading engineering and full type systems to `typography-system`, deep hierarchy modeling to `visual-hierarchy`, theming and token governance to `theme-system-design` / `design-system-architecture`.

## The hierarchy levers (ranked)

Visual hierarchy is built from a small set of pre-attentive levers — features the eye resolves in well under a quarter-second, before conscious reading. Spend them in roughly this order, structural first:

1. **Size** — larger elements carry more weight and are seen first. The primary action or value on a screen should be unmistakably the largest in its zone.
2. **Weight** — heavier (bolder) type and denser fills read as more important than light ones; weight separates a title from its label without changing size.
3. **Spacing and position** — whitespace groups and separates; an element given room to breathe in the zone where the eye naturally lands reads as primary. Proximity is grouping; distance is separation.
4. **Contrast (intent)** — higher figure/ground contrast pulls attention; lower contrast recedes secondary and metadata text. This is *contrast as a hierarchy tool*, distinct from WCAG contrast compliance, which is verified by `a11y`.
5. **Color** — the last and most expensive lever. It is easily over-spent (every color "important" means none is), it carries learned meaning (route meaning questions to `semiotics`), and it must clear contrast and non-color-only checks (route those to `a11y`). Prefer to establish hierarchy with the first four levers and use color to confirm, not to carry, priority.

The most common scan failure — "everything looks the same / flat and hard to scan" — is almost always under-use of levers 1–3 and over-reliance on lever 5. Fix it by differentiating type roles, weight, and spacing first, not by adding more accent colors. A fast diagnostic: **if the hierarchy collapses in grayscale, at low resolution, or when accent color is removed, the surface is leaning on hue instead of structure** — rebuild it on size, weight, and spacing.

This foundation gives the ranked-lever model for everyday craft. When hierarchy needs deeper modeling — formal type-scale ratio selection, contrast tuned as an explicit ordering signal, and the layered primary/secondary/tertiary information structure of a complex surface — hand off to `visual-hierarchy`, which owns that contract.

## Palette: roles before raw, then restraint

- **Name roles first.** Define `surface`, `text` (and a muted/secondary text), `accent`, the status set (`success`, `warning`, `danger`, `info`), and `disabled` *before* assigning any raw color. A palette handed over as a list of raw hex codes "that look nice" has no roles; map each color onto a role, drop or merge the ones with no role, and ensure every status state has a dedicated role color rather than an overloaded or missing one.
- **Distribute with restraint.** Keep color from flooding the surface: reserve the accent for the few things that must draw the eye, and let neutrals carry most of the surface. The familiar 60-30-10 split (≈60% dominant/neutral, ≈30% supporting, ≈10% accent) is a useful *starting heuristic for that restraint*, not a fixed law — the actual balance shifts by register (a dense operational tool runs far more neutral and far less accent than an expressive marketing page; see the surface-register matrix below). The principle that survives every register is restraint: every color marked "important" means none is.
- **Ramp in a perceptual space, by role — then hand off.** When a role needs a ramp of lightness steps (hover, active, disabled, surfaces at different depths), generate it in a perceptually-uniform space (OKLCH / CSS Color 4), not naive HSL — HSL lightness is not perceptually even (equal HSL lightness makes yellow read far brighter than blue) and HSL ramps drift hue (a blue turns purple as it darkens). The *foundation* choice is simply "ramp in a perceptual space, by role." The formal color-space math, gamut mapping, perceptual scale generation, semantic color tokens, and light/dark/high-contrast parity are `color-system-design`'s contract — hand them off rather than building a full color system here.
- **Contrast intent ≠ contrast compliance.** Choosing how much figure/ground contrast each role carries is craft and lives here. Verifying the resulting ratios against WCAG and confirming no meaning is color-only is `a11y`'s contract — defer it rather than asserting compliance from this skill.

## Type: roles and one modular scale

- **Define type roles** — page title, section heading, control label, body, metadata, numeric emphasis — and apply them consistently. Hierarchy between roles should come from size *and* weight, not size alone.
- **Use one modular scale.** Derive sizes from a single ratio (a Major Third, ~1.25, is a common, conservative starting point; tighter ratios suit dense UI, looser ratios suit editorial/marketing surfaces) so the steps relate harmoniously instead of being picked ad hoc. Express sizes in relative units (`rem`) so the scale respects user text-size settings. Picking a concrete starting ratio for one surface is foundation-level direction; *engineering* the product-wide scale and using type-scale ratios as a formal ordering signal hand off to `typography-system` / `visual-hierarchy`.
- **Right-size to density.** A scale tuned against a marketing hero will be oversized inside compact data screens. Type roles must not balloon in dense UI; calibrate body and label sizes to the surface's *real, repeated* screens (e.g. dense tables), not a single hero mockup.
- **Hand off the deep type system.** Typeface selection and pairing, the full vertical-rhythm / line-height / measure system, and web-font delivery (subsetting, `font-display`, variable fonts) are `typography-system`'s contract; this foundation only sets the role-and-scale direction.

## Spacing and rhythm: one consistent base unit

- **Pick one base unit and keep rhythm consistent.** Inherit the project's base unit if it already has one; otherwise set one explicitly and apply it everywhere. The requirement is consistency on a single unit, not a specific number — an 8-pt base (with a 4 half-step for tight cases — spacing in multiples of 8: 4, 8, 16, 24, 32, 40) is the common industry default, renders crisply across pixel densities, and gives design and engineering one shared spacing vocabulary, but a project on a different base is fine as long as it is consistent. Horizontal column structure (the 12-column grid) is `layout-composition`'s concern; the *spacing rhythm within and around* elements is this skill's.
- **Spacing is a hierarchy tool, not filler.** Use proximity to group related elements and larger gaps to separate groups; consistent internal padding signals "same kind of thing." Keep the spacing *within* a group tighter than the margins *between* groups — when internal padding rivals or exceeds the gaps separating groups, proximity stops reading as grouping and the surface looks undifferentiated. Reach for larger gaps to create section boundaries before adding borders.
- **Calibrate density to repeated use.** Set spacing and density against the screens users actually live in, not one screenshot. Define an explicit density tier (comfortable vs compact) per surface type — an all-day operational table is not a landing page — and verify on representative real data, including the long, full, empty, loading, and error states.

## Optical alignment and visual balance

Optical alignment is the craft of making elements look centered, balanced, and intentional at real size. Geometric center is a useful starting point, but it is not always the visual center:

- **Center by perceived weight.** A triangular play icon, chevron, asymmetric glyph, notification dot, avatar stack, or pill badge may need a slight optical nudge even when its bounding box is mathematically centered — the classic case being a play triangle, which looks off-center until pushed slightly right of geometric center.
- **Balance icon-and-label as a unit.** In icon+text buttons, tabs, table cells, chips, and toolbar controls, the *combined* shape should feel centered inside the hit area; do not let one glyph's bounding box dictate the whole control.
- **Check at production size, not zoomed design-board size.** Tiny icons, dense tables, status dots, and compact form controls reveal optical imbalance that disappears while zoomed in.
- **Keep it craft polish.** Optical corrections make the existing surface feel balanced; they do not change responsive structure (`layout-composition`), what a sign means (`semiotics`), or accessibility requirements (`a11y`).

## Elevation and borders: tonal first, shadow selective

- **Express depth tonally by default.** Modern practice (Material 3 and its descendants) expresses elevation primarily through a *tonal surface tint* — a raised surface is a slightly shifted tone of the background — with shadow reserved as a selective tool, not the default. Tonal elevation differentiates stacked surfaces without the visual noise of shadows on everything.
- **Reserve shadow for genuine separation and affordance.** Use shadow where an element must clearly lift off its context or read as interactive/tactile — cards, modals, popovers, menus, draggable surfaces, and elements that must stand out against a busy or same-colored background. A drop shadow on every element signals nothing; "more elevation" is not "more polish."
- **Do not stack blanket depth.** Putting a shadow *and* a border *and* a background tint on the same element (and on every element) makes the surface busier and less structured, not more layered. Pick the one treatment that clarifies the grouping or affordance.
- **Audit every depth treatment with one test:** *does this shadow, border, or background tint clarify grouping or affordance?* If not, remove it and let hierarchy come from type, weight, and spacing.

## Motion feel

- **Purpose, not decoration.** Motion should clarify state change (a toggle, a load) or continuity (where a panel came from / went), or give feedback (hover, press). Decorative bounce and parallax compete for attention — especially on a work-focused tool used all day — and should be cut.
- **Keep it short and direction-aware.** Instant feedback under ~100ms; most UI transitions in the ~150–300ms range (micro-interactions toward the short end, toasts/system communication toward the long end); longer durations only for larger travel. Easing carries meaning: ease-*out* for elements entering (welcoming, settles in), ease-*in* for elements leaving (gets out of the way), ease-in-out for moves between states.
- **Degrade gracefully.** Always provide a reduced path under `prefers-reduced-motion`; never ship motion that has no reduced-motion fallback. (The deeper a11y obligations of motion sit with `a11y`; the *feel* and the existence of a reduced path are foundation-level.)
- **Hand off state feedback.** The patterns *around* user actions and system state — loading, skeletons, optimistic updates, progress, success/error/empty states, retries, pending/disabled states, autosave, undo, perceived latency — are `interaction-feedback`'s contract; this skill owns the motion *feel*, not the feedback-state system.

## Brand fit and tone

State the surface's intended tone and scanning demand before making craft choices, and match the visual register to the surface type. The same craft levers serve very different tones: a dense, restrained, fast-scanning admin tool and an airy, expressive marketing surface are both "correct" only relative to their purpose. Use this matrix as the starting register per archetype, then adjust:

| Surface archetype | Density | Color / noise | Personality |
|---|---|---|---|
| Operational tool / admin | Compact, high information density | Minimal accent; neutrals carry the surface | Restrained, fast-scanning, calm |
| Dashboard | Compact–comfortable | Accent reserved for status, alerts, and key metrics | Data-forward, quiet chrome |
| Docs / reference | Comfortable, generous measure | Very low chrome; near-monochrome | Quiet, legible, unobtrusive |
| Editorial / content | Generous, airy | Expressive but disciplined accent | Voiced, considered |
| Marketplace / listing | Medium; scannable cards | Accent for CTAs and trust signals | Approachable, trustworthy |
| Brand / marketing page | Airy, large scale | Bold, expressive color and motion | Distinctive, high-personality |

This skill sets foundation-level brand *fit*; it does not replace brand-specific guidelines or a formal brand/token system (hand those to `design-system-architecture` / `theme-system-design`).

## Method

1. **Name the surface type and tone.** Operational tool, docs, dashboard, editorial page, marketplace, or brand page — and state the intended tone and scanning demand (use the surface-register matrix as the starting register). Every later choice is judged against this. Preserve the task structure; this skill changes visual prominence, not which widgets exist or where responsive sections go.
2. **Establish hierarchy with structural levers first.** Decide what must be seen first, then carry that with size, weight, and spacing/position before reaching for color. Detailed first/second/third ordering and type-scale-ratio mechanics route to `visual-hierarchy`.
3. **Choose palette roles before raw colors:** surface, text (+ muted), accent, success, warning, danger, info, disabled. Distribute with restraint (register-dependent, 60-30-10 as a starting heuristic), ramp any roles in a perceptually-uniform space, and never let color be the only carrier of meaning.
4. **Define type roles and one modular scale,** in relative units, right-sized to the surface's density.
5. **Set the spacing rhythm on one consistent base unit** (inherit the project's, or set one explicitly; 8-pt is the common default), keep internal padding tighter than between-group margins, and pick a density tier calibrated to repeated real use, verified on representative real screens and states.
6. **Check optical alignment and visual balance.** Center by perceived weight, not only geometry; icons, play triangles, chevrons, badges, status dots, and uneven controls often need small optical nudges to look centered at production size.
7. **Apply elevation tonally first; reserve shadow/border/background** for clarifying grouping or affordance, auditing each use against that test and never stacking all three.
8. **Add motion only where it clarifies state or continuity,** keep it short and direction-aware, and provide a reduced-motion path.
9. **Cross-check and hand off before treating decisions as done** — meaning questions to `semiotics`; contrast ratios, non-color-only, focus, and AT behavior to `a11y`; and the deep contract of any single dimension to its owner (`color-system-design`, `typography-system`, `visual-hierarchy`, `theme-system-design`, `interaction-feedback`).

## Evals

This skill ships comprehension and application eval artifacts in its sibling `evals/` directory (`evals/comprehension.json`, `evals/application.json`). The checklist in `## Verification` below is the authoring gate for visual-design decisions; the eval files are the grader surface.

## Verification

- [ ] The surface type, tone, and scanning demand are stated before craft choices are made
- [ ] Visual hierarchy makes primary content faster to find, built first from size/weight/spacing rather than from more color; it does not collapse in grayscale, at low resolution, or when accent color is removed; deep ordering mechanics are routed to `visual-hierarchy`
- [ ] Palette roles are named by purpose rather than raw color; every status state has a dedicated role, color is distributed with restraint matched to the surface register, and no important state is carried by color alone
- [ ] Tonal ramps are built in a perceptually-uniform space (no HSL hue drift / uneven lightness steps); full color-system construction handed off to `color-system-design`
- [ ] Type roles are consistent, derived from one modular scale in relative units, and not oversized inside compact UI; deep type system handed off to `typography-system`
- [ ] Spacing follows one consistent base unit (8-pt is the common default, but any consistent unit is fine); internal padding within a group is tighter than the gaps between groups; density fits the surface's repeated-use context and was verified on real screens/states, not one mockup
- [ ] Optical alignment and visual balance are checked at production size for icons, badges, controls, and uneven shapes
- [ ] Elevation is tonal-first; shadows and borders clarify grouping or affordance instead of adding blanket noise, and the three are not stacked on the same element
- [ ] Motion, if used, clarifies state or continuity, is short and direction-aware, and has a reduced-motion path; state-feedback patterns handed off to `interaction-feedback`
- [ ] Brand/visual register fits the surface type and stated tone (matrix applied)
- [ ] Contrast intent set here; WCAG contrast, non-color-only, and other a11y checks deferred to `a11y`; sign-meaning deferred to `semiotics`; deep hierarchy / color math / font engineering / token governance handed off to their owning skills

## Do NOT Use When

| Use instead | When |
|---|---|
| `semiotics` | The question is what a color, icon, badge, shape, or visual metaphor means. |
| `visual-hierarchy` | The task needs deep hierarchy modeling — formal type-scale ratios, contrast as an ordering signal, layered primary/secondary/tertiary information structure, or detailed proximity/spacing-hierarchy mechanics. |
| `color-system-design` | The task is a full color system — palette construction, semantic color tokens, OKLCH/LCH perceptual scale generation, contrast-pair matrices, wide-gamut fallbacks, or light/dark/high-contrast parity. |
| `typography-system` | The task is a full typography system — typeface selection and pairing, vertical rhythm, line-height/measure rules, or web-font delivery (subsetting, `font-display`, variable fonts). |
| `design-system-architecture` | The task is semantic tokens, component APIs, theming contracts, or governance. |
| `theme-system-design` | The task is the theming/token-delivery layer — design tokens, semantic token layering, CSS custom-property strategy, or runtime theme switching. |
| `interaction-feedback` | The task is feedback around actions and system state — loading, skeletons, optimistic updates, progress, success/error/empty states, retries, pending/disabled, autosave, undo, perceived latency. |
| `layout-composition` | The task is responsive structure, grid tracks, breakpoints, or section order. |
| `a11y` | The task is WCAG contrast, focus, labels, keyboard access, reduced-motion compliance, or assistive technology. |
| `microcopy` | The task is the wording inside buttons, dialogs, empty states, errors, toasts, tooltips, or validation. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Public: `true`
- Domain: `design/visual`
- Scope: Designing and auditing the visual craft of an interface surface — palette direction, type scale, spacing rhythm, density, elevation, borders, optical alignment and balance, contrast intent, visual weight, hierarchy direction, motion feel, and brand fit — at foundation level, including knowing when a concern should be split off to a deeper specialization (color-system-design, typography-system, visual-hierarchy, theme-system-design, interaction-feedback). Portable across product UI, dashboards, docs, marketing-adjacent product surfaces, and design-system consumers; principle-grounded, not repo-bound, and does not replace brand-specific guidelines. Excludes sign-system meaning (semiotics), token/component architecture and governance (design-system-architecture), responsive structure and breakpoints (layout-composition), and accessibility compliance (a11y).

**When to use**
- pick a visual direction for this dashboard without changing the task structure
- audit color, typography, spacing, and hierarchy for this product page
- this UI feels flat and hard to scan - improve the visual hierarchy
- choose a restrained palette and type scale for an internal admin tool
- make this generated prototype feel more professional without changing the flow

**Not for**
- what does this icon or badge color communicate to users?
- define semantic tokens and component variants
- decide the responsive section order and breakpoint behavior
- verify WCAG contrast, focus order, and screen-reader behavior
- generate a full OKLCH color scale with semantic color tokens
- build the product-wide type-scale ratio and web-font loading strategy
- model the layered primary/secondary/tertiary information hierarchy of this complex screen
- design the loading, skeleton, and error-state feedback patterns
- set up the design-token and runtime theme-switching layer
- Owned by `semiotics`: what visual signs mean
- Owned by `layout-composition`: responsive structure, grid tracks, and breakpoints

**Related skills**
- Verify with: `a11y`, `semiotics`, `visual-hierarchy`
- Related: `semiotics`, `design-system-architecture`, `layout-composition`, `microcopy`, `a11y`, `interaction-feedback`, `theme-system-design`
- Narrower: `visual-hierarchy`, `color-system-design`, `typography-system`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: Visual design foundations is the interior-design layer of a building, not the structural engineering — it chooses the palette, lighting, spacing, and materials that make a room legible and set its tone, but it defers the load-bearing structure (layout), the building code (a11y), the signage meaning (semiotics), and the building-systems contracts (design-system-architecture) to the disciplines that own them.
- Common misconception: |

**Keywords**
- `visual-design`, `visual craft`, `palette direction`, `typography direction`, `spatial rhythm`, `density rules`, `elevation treatment`, `motion feel`, `brand fit`, `visual hierarchy`

<!-- skill-graph-context:end -->
