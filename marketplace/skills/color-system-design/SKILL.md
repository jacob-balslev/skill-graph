---
name: color-system-design
description: "Use when designing a color system — palette construction, semantic color tokens, WCAG contrast pairings, perceptual scale generation in OKLCH/LCH/HCT, wide-gamut fallbacks, and light/dark/high-contrast parity. Do NOT use for single brand-color picks, runtime theme-switching mechanics, token delivery architecture, or non-color design tokens. Do NOT use for Pick the brand's primary color from scratch with no system constraints. Do NOT use for Implement prefers-color-scheme detection, localStorage persistence, and anti-flash script. Do NOT use for Design the full DTCG token build pipeline for all token categories. Do NOT use for Choose spacing values for the layout grid. Do NOT use for the palette, the scale construction, the semantic color roles, and the contrast pairings against every surface (use dark-mode-implementation)."
license: CC-BY-4.0
metadata:
  subject: design
  public: "true"
  scope: "Designing a color system — palette construction, semantic color tokens, WCAG contrast pairings, perceptual scale generation in OKLCH/LCH/HCT, wide-gamut fallbacks, and light/dark/high-contrast parity. Portable across any design system; principle-grounded, not repo-bound. Excludes single brand-color picks, runtime theme switching (dark-mode-implementation), token delivery/governance architecture (theme-system-design / design-system-architecture), and non-color tokens."
  taxonomy_domain: design/visual
  stability: experimental
  keywords: "[\"semantic color tokens\",\"wcag contrast ratio\",\"apca contrast\",\"oklch color space\",\"perceptual uniformity\",\"gamut mapping\",\"hct tonal palette\",\"forced colors\",\"light dark parity\",\"color accessibility\"]"
  triggers: "[\"color system\",\"color palette\",\"color tokens\",\"wcag contrast\",\"oklch\"]"
  examples: "[\"Build an 11-step color scale from a brand seed color with perceptually even lightness steps and sRGB fallbacks\",\"Map semantic intents (success, warning, danger, info) to scale colors with WCAG AA contrast against both light and dark surfaces\",\"Audit an existing palette for text, non-text, focus, and status contrast failures and propose token-level changes\"]"
  anti_examples: "[\"Pick the brand's primary color from scratch with no system constraints\",\"Implement prefers-color-scheme detection, localStorage persistence, and anti-flash script\",\"Design the full DTCG token build pipeline for all token categories\",\"Choose spacing values for the layout grid\"]"
  relations: "{\"related\":[\"theme-system-design\",\"dark-mode-implementation\",\"visual-design-foundations\",\"typography-system\",\"a11y\",\"design-system-architecture\",\"semantics\"],\"suppresses\":[{\"skill\":\"dark-mode-implementation\",\"reason\":\"color-system-design owns the palette, the scale construction, the semantic color roles, and the contrast pairings against every surface; dark-mode-implementation consumes those tokens to wire up the runtime switch — detection, persistence, first-paint application, asset variants, and browser chrome hints.\"}],\"verify_with\":[\"a11y\",\"semantics\"]}"
  grounding: "{\"subject_matter\":\"Portable color-system design: perceptual palette generation, semantic color roles, step-index UI role conventions, contrast-pair contracts, WCAG 2.2 text and non-text contrast, APCA as an optional secondary legibility signal, color-vision-deficiency redundancy and simulation, OKLCH/LCH/HCT scale construction, interaction-state derivation, dark-mode halation review, Display-P3/sRGB gamut mapping and fallback, prefers-contrast and forced-colors/high-contrast behavior, DTCG color token value structure, and color-value export constraints\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://www.w3.org/TR/WCAG22/\",\"https://www.w3.org/TR/wcag-3.0/\",\"https://git.apcacontrast.com/documentation/APCAeasyIntro.html\",\"https://www.w3.org/TR/css-color-4/\",\"https://www.w3.org/TR/css-color-5/\",\"https://www.w3.org/TR/css-color-adjust-1/\",\"https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch\",\"https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix\",\"https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color\",\"https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-contrast\",\"https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors\",\"https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/\",\"https://www.w3.org/community/reports/design-tokens/CG-FINAL-color-20251028/\",\"https://developer.android.com/design/ui/mobile/guides/styles/color?hl=en\",\"https://codelabs.developers.google.com/codelabs/design-material-darktheme\",\"https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale\",\"https://tailwindcss.com/blog/tailwindcss-v4\",\"https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness\",\"https://pubmed.ncbi.nlm.nih.gov/9316278/\"],\"failure_modes\":[\"using_HSL_or_sRGB_numeric_steps_as_if_they_were_perceptual_steps\",\"using_step_indices_without_a_UI_role_convention\",\"copying_example_lightness_tables_without_adjusting_for_hue_chroma_gamut_and_pairings\",\"shipping_palette_swatches_without_a_pairing_matrix\",\"treating_WCAG_text_contrast_as_the_only_color_accessibility_requirement\",\"citing_APCA_as_normative_WCAG_3_contrast\",\"treating_APCA_Lc_tiers_as_WCAG_2_waivers_or_using_them_without_font_weight_context\",\"using_contrast_color_as_a_substitute_for_token_pair_design\",\"clipping_OKLCH_chroma_without_reviewing_hue_and_role\",\"gamut_mapping_by_simple_RGB_channel_clipping_without_OKLCH_chroma_review\",\"deriving_hover_active_states_without_rechecking_rendered_contrast\",\"inverting_light_theme_steps_into_dark_theme_without_halation_review\",\"shipping_P3_values_without_sRGB_fallbacks_or_gamut_tests\",\"flattening_DTCG_OKLCH_or_P3_tokens_to_sRGB_hex_without_colorSpace_components_and_fallback_review\",\"letting_semantic_tokens_exist_in_light_theme_only\",\"treating_prefers_contrast_as_the_same_signal_as_forced_colors\",\"using_color_as_the_only_status_signal\",\"using_undocumented_CVD_simulators_or_swatch_only_CVD_checks\",\"relying_on_shadows_or_background_color_for_boundaries_in_forced_colors\",\"fighting_forced_colors_instead_of_honoring_user_palette\"],\"evidence_priority\":\"equal\"}"
  mental_model: "|"
  purpose: "|"
  concept_boundary: "|"
  analogy: "A color system is a swatch deck plus a wiring diagram. Like a paint manufacturer's standardized deck, it does not decide which room is painted (the per-screen deployment) or hang the lights that change how it reads at night (the theme switch); it guarantees every swatch is mixed by formula from a base pigment so the shades step evenly, and that swatch number N always means the same job (trim, wall, accent) whatever the pigment. The wiring diagram is the part taste alone never supplies: it states which foregrounds may sit on which surfaces, and proves each pairing still meets a legibility floor under every lighting condition."
  misconception: "|"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/design/color-system-design/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
---
# Color System Design

## Concept of the skill

A color system is the discipline of turning color from a per-screen aesthetic decision into a derivable, accessible, theme-portable layer of the design system. It is built in three stacked layers — and proven by one audit artifact. The **palette** is raw values organized as per-hue scales (typically 9 to 12 steps from very light to very dark, generated in a perceptually uniform color space — OKLCH/LCH or HCT — so equal step indices read as equally spaced). The **semantic tokens** name colors by purpose rather than appearance (background-surface, text-primary, border-subtle, danger-bg/danger-fg). The per-theme **mapping** resolves each semantic token to a palette value, and is the only layer that differs between light, dark, high-contrast, brand, or product modes. A mature scale also assigns a fixed **UI role to each step index**, so step *N* means the same job (app background, component fill, border, solid fill, text) across every hue — the role convention is what makes the semantic layer cheap to define and stable across rebrands. The proof that the whole stack is safe is the **pairing matrix**: the documented set of foreground/background, border/background, focus/background, icon/background, and status/background combinations allowed to ship, each with its contrast result per theme.

Two non-negotiable constraints run through everything: scales must be constructed in a perceptually uniform space rather than sRGB/HSL (whose equal numeric steps look unequal), and every pairing a semantic token can produce must clear a contrast minimum — WCAG 2.x AA at a floor — in every theme it resolves in. The system's job is to make color reproducible and safe: scales generated by rule, accessibility baked into the token contract and the pairing matrix, and meaning decoupled from value so a brand shift never becomes a code change.

## Coverage

This skill covers color systems at the value and meaning layer:

- **Perceptual palette construction:** choosing seed colors, anchoring brand hues to scale steps, generating 9–12 step scales, mapping step indices to UI role bands, managing lightness, chroma, hue drift, gamut clipping, neutrals, and status hues.
- **Semantic color tokens:** naming by intent and relationship, including surfaces, text, borders, emphasis, status, focus, selection, disabled, overlays, charts, and data-visualization roles.
- **Pairing contracts:** defining which tokens may be used together and testing text, icon, focus, border, control, and graphical-object contrast after alpha, overlays, gradients, and image backdrops have been composited.
- **Light/dark/high-contrast parity:** ensuring every semantic token has a valid mapping in each theme and meets the same user-facing promise — not necessarily the same raw step number.
- **Web color-platform details that affect values:** CSS OKLCH/LCH, `color-mix()`, relative colors, Display-P3 and sRGB fallbacks, `contrast-color()` limits, forced-colors behavior, and `prefers-contrast` variants.
- **Color-value export constraints:** recording source color space, generated sRGB fallback values, DTCG color-token representation, and tool-support caveats that can change color fidelity.

It does **not** own the runtime application of themes, the complete token build pipeline, or accessibility-law interpretation.

## The step-role convention (the bridge between palette and semantic tokens)

A scale is not just "light to dark"; in a mature system each step *index* carries a fixed UI role that holds across every hue. The widely-adopted Radix Colors convention uses 12 steps banded by purpose, and the same step number means the same role in every palette:

| Steps | Role |
|---|---|
| 1–2 | App background and subtle component background |
| 3–5 | Component backgrounds — 3 normal, 4 hover, 5 pressed/selected |
| 6–8 | Borders — 6 subtle/non-interactive, 7 interactive, 8 strong border + focus ring |
| 9–10 | Solid backgrounds (fills) — 9 has the highest chroma in the scale, 10 is its hover |
| 11–12 | Text — 11 low-contrast/secondary text, 12 high-contrast/primary text |

This is the layer that makes semantic tokens cheap: `border-subtle → step 6`, `surface-hover → step 4`, `text-primary → step 12` are defined once against the role convention and resolve correctly for every hue and every theme. A system may use a 9-step or 10-step scale, or a labelled `50–950` ramp, instead of 12; the principle that matters is that **step index encodes role, not just lightness** — publish the equivalent bands so step *N* means the same job across every hue. The index band only *proposes* a role; the pairing matrix still decides whether that role is allowed in a specific theme. Anchor the brand color at a defined step (e.g., the solid-fill step) so the surrounding scale is generated rather than hand-tuned. Some libraries use APCA to tune internal step behavior, but WCAG 2.2 remains the conformance floor for the allowed product pairings.

## Palette Method

1. **Inventory roles before values.** List the surfaces and meanings the product needs: canvas, surface, elevated surface, text primary/secondary/inverse, border subtle/strong, accent, primary action, danger, warning, success, info, focus, selection, disabled, overlay, chart series, and brand-only display roles.

2. **Define the pairings before tuning swatches.** For each role, record what it must sit on. A text token without its expected surface is incomplete. A filled status background without its `on-*` foreground token is incomplete. Do not try to make every swatch pass against every other swatch; make the allowed semantic pairings pass.

3. **Choose the scale model.** Use OKLCH/LCH or HCT for generation. OKLCH is broadly useful for CSS-native web systems; HCT is useful when aligning with Material 3 or Android dynamic color. HSL and sRGB can be export formats, but they are poor generation spaces because equal numeric changes are not equal perceptual changes.

4. **Anchor the seed.** Put the brand or source color at a named step and document why. Many web systems use an 11-step ramp such as `50, 100, 200, …, 900, 950`; Material-style systems use tone values. The exact labels matter less than stable semantics: the anchor step is the recognizable brand color, not a random midpoint.

5. **Map step indices to role bands** (see § The step-role convention). If the scale uses numbered steps, define what each band is for *before* assigning semantic tokens.

6. **Set lightness first, chroma second, hue last.** Create the L/tone ramp before optimizing saturation. A `50–950` web ramp might start with approximate OKLCH lightness targets such as `50 → 0.97`, `100 → 0.93`, `200 → 0.86`, `300 → 0.76`, `400 → 0.64`, `500 → 0.50`, `600 → 0.41`, `700 → 0.33`, `800 → 0.24`, `900 → 0.17`, `950 → 0.10` — treat those numbers as a starting sketch, **not** a standard, because role pairings, brand anchors, dark-theme mapping, and hue-specific gamut limits may require a different ramp. Shape chroma as a curve, not a flat value: it usually tapers near the very light and very dark ends, peaks around the middle or solid-fill steps, and varies by hue. Reds, magentas, and some blues can sustain higher middle chroma; yellows, greens, and cyans tend to hit gamut, noise, or contrast problems sooner and often need lower chroma. Allow small hue corrections only when a hue needs them to preserve perceived balance; do not hand-tune every step independently.

7. **Gamut-map deliberately** (see § Wide gamut and gamut mapping). A vivid OKLCH or Display-P3 value may be outside sRGB; reduce chroma toward the neutral axis holding L and H fixed rather than clipping RGB channels.

8. **Treat neutrals as a color family.** Neutral scales are not "gray because empty." They carry the product's surface, text, border, elevation, and disabled states. Decide whether the neutral is cool, warm, or chroma-free, then keep that decision stable across themes.

9. **Generate state colors as families, not one-offs.** Success, warning, danger, and info need background, subtle background, border, emphasis, text/`on-color`, hover, selected, and disabled pairings. Hover and active states can often be derived from a base token with CSS `color-mix()` in OKLCH/OKLab or with relative color syntax, which reduces static token bloat. The recipe is still part of the color system: snapshot the resolved value, check it in the pairing matrix, and promote it to an explicit token when the state needs semantic review. State colors also need a non-color signal — icon, label, shape, or pattern — when conveying state.

## Color spaces and scale construction

Color spaces matter for scale construction. sRGB and HSL are non-perceptually-uniform — equal numeric steps in lightness produce unequal perceived lightness changes, with notable cliffs around yellow and teal. OKLCH and CIELAB are perceptually uniform spaces where equal L (lightness) steps look equal regardless of hue: a yellow and a blue both at L≈0.65 read as comparably bright, and equal C (chroma) produces equal visual saturation weight across hues — something HSL cannot do because each hue has a different maximum achievable saturation. The CSS Color Module Level 4 specifies `oklch()` and `lch()` as first-class CSS color functions, and `color-mix()` in lch/oklch space produces predictable interpolation.

A third perceptually-uniform option is **HCT (Hue, Chroma, Tone)**, the color space behind Google's Material 3 dynamic color. HCT takes hue and chroma from CAM16 (a modern color-appearance model) and tone directly from CIELAB's L\* — so "tone" is a contrast-bearing axis (tonal palettes run tone 0–100, and a fixed tone-delta between a color and its background maps to a predictable WCAG-ish contrast). HCT is the right generation space for Material/Android systems and tonal-palette workflows; OKLCH is the more CSS-native choice on the web. All three (OKLCH, CIELAB/LCH, HCT) satisfy the requirement that matters here — build scales in a perceptually uniform space, never in sRGB/HSL.

As of 2026, OKLCH has shipped in all major browsers since mid-2023 and is the default color format in Tailwind CSS v4, shadcn/ui, and Radix — Tailwind v4 explicitly moved its default palette from RGB to OKLCH to use the wider gamut, and exposes 11-step palettes with OKLCH copy values. Direct adoption (authoring `oklch()` in production with an sRGB fallback for old browsers) is now the mainstream strategy rather than a precompiled-only one; "build in OKLCH" has moved from a recommendation to an industry baseline.

## Wide gamut and gamut mapping

The display-p3 gamut, supported by most modern displays, allows more saturated colors than sRGB in the green/red regions; declaring colors with p3 functions (or `@media (color-gamut: p3)`) delivers them while sRGB fallbacks handle narrow-gamut displays. Because OKLCH is unbounded, many `(L, C, H)` triples you generate fall outside the target gamut and must be **gamut-mapped**.

The CSS Color 4 default algorithm works in OKLCH, holds lightness and hue fixed, and binary-searches chroma downward — preserving brightness and hue family while shedding only saturation, which is far safer than naive per-channel clipping. Its stop condition is **`deltaEOK` (the Euclidean distance in OKLab) ≤ 0.02** — the OKLab just-noticeable-difference — measured against a *channel-clipped* version of the candidate (the "local MINDE" / minimum-Delta-E refinement). It is **not** ΔE2000 ≤ 2: an earlier draft used CIEDE2000, but the current CSS spec is OKLab-based, so do not substitute CIEDE2000 *as the CSS algorithm*. (If a separate Lab/LCH toolchain uses CIEDE2000, `DeltaE2000 ≤ 2` is only the analogous Lab-workflow JND guardrail.) Practical bound: max usable OKLCH chroma stays below ~0.37 for both sRGB and P3, and the achievable maximum varies by hue and lightness, so a scale built at a fixed high chroma will clip unevenly across hues unless you map.

Export discipline for wide-gamut values:

- Record the source color space for generated values.
- Emit sRGB fallbacks for any value that may render in an sRGB-only environment.
- Verify fallback contrast separately; do not assume gamut mapping preserves contrast or brand intent. If the fallback changes meaning, lower chroma or choose a different anchor rather than silently clipping RGB channels.
- Use `@media (color-gamut: p3)` or equivalent build output when shipping P3-specific values on the web, and keep an explicit fallback strategy for older WebViews, email, PDFs, screenshots, canvas, and exported assets.

## Semantic Token Pattern

Use names that encode purpose and relationship, not appearance:

| Token pattern | Use |
|---|---|
| `color.background.canvas` | App or page base |
| `color.background.surface` | Cards, panels, fields, menus |
| `color.text.primary` | Default text on normal surface |
| `color.text.secondary` | Lower-emphasis text that still meets contrast |
| `color.border.subtle` | Low-emphasis separation with non-text contrast checked where meaningful |
| `color.action.primary.bg` | Primary action filled background |
| `color.action.primary.fg` | Text/icon on primary action background |
| `color.status.danger.bg` | Danger status container |
| `color.status.danger.fg` | Text/icon on danger status container |
| `color.focus.ring` | Visible focus indicator on every relevant surface |
| `color.chart.series.1` | Data series color, paired with labels/patterns when needed |

Keep raw palette tokens available for the generator and design tooling, but keep component code on semantic tokens. `blue.600` or `red.700` can be a palette value; it should not be the component contract. If a component needs a local override, name it as a component token that aliases a semantic token, not as a raw value.

A specific and widely-used pattern for the text-on-color case is the **`on-*` foreground token**: every solid/emphasis fill ships a paired foreground token guaranteed to clear contrast against it — `on-primary` for text/icons on the primary fill, `on-danger` for the danger fill, `on-emphasis` for any high-chroma surface. This makes the foreground a first-class, audited member of the contract rather than a guess made at the call site (and it is what `contrast-color()`, below, can only approximate). Author one `on-*` token per surface a component can sit on.

`text-primary` on a light theme might be near-black at L≈0.15; on a dark theme near-white at L≈0.96 — both resolve to the same component token and meet the same contrast requirement against their respective backgrounds. The discipline is to define semantic tokens by intent and contrast pair (`text-on-surface`, `text-on-emphasis`), never by appearance (`text-dark-gray`).

## Contrast and accessibility

Build the contrast contract from actual rendered pairings, not isolated swatches.

- **Text and images of text.** WCAG 2.2 SC 1.4.3 requires at least 4.5:1 for normal text and 3:1 for large-scale text (18pt+, or 14pt+ bold) at Level AA; SC 1.4.6 raises that to 7:1 and 4.5:1 at AAA. Use AA as the floor and choose AAA for long-form reading or regulated products when the brand can support it. (WCAG 2.1 and the current-stable 2.2 share these criteria unchanged.)
- **Non-text UI and graphics.** WCAG 2.2 **SC 1.4.11 (non-text contrast)** requires a 3:1 floor for the visual information that identifies UI components and their states (control borders, the boundary of a text input, toggle states) and for parts of graphics needed to understand content (icon strokes, chart segments). A color system that only checks `text-on-background` ships components whose borders and focus rings are invisible to low-vision users while passing its text audit.
- **Use of color.** WCAG 2.2 SC 1.4.1 forbids color as the *only* visual means of conveying information, action, response, or distinction. Status tokens must pair with text, icon, shape, pattern, position, or another redundant channel.
- **Alpha and overlays.** Compute contrast after transparency, overlays, gradients, image backdrops, and blend modes resolve. Store the resolved composite in the pairing matrix, not just the nominal token pair. A token can pass on a white swatch and fail over a hero image or translucent surface.

**APCA status discipline** is a common source of drift, so state it precisely. As of 2026, **WCAG 2.2 is the stable, legally-referenced standard** worldwide; **WCAG 3.0 is a Working Draft** (most recently March 2026) not expected to reach Recommendation until roughly 2029; and **APCA was moved out of the WCAG 3 normative draft in July 2023** — the WCAG 3 contrast algorithm is still "to be determined" and the draft defines a generic exploratory contrast-ratio test rather than naming APCA. APCA (the Accessible Perceptual Contrast Algorithm) is a different, lightness-aware model that better predicts perceived text legibility, with thresholds expressed as Lc values, but its scores are **not** backwards-compatible with WCAG 2 ratios (a pair can pass one and fail the other). The correct posture: **ship to WCAG 2.x AA for compliance and procurement, use APCA as the readability check** that catches cases WCAG 2 scores poorly (e.g., very light or very dark mid-tones). Compute both in tooling; gate releases on the WCAG 2.x floor; never use APCA to waive a WCAG 2.2 failure. If the team adopts APCA internally, pin the exact algorithm/version and thresholds, use the absolute Lc magnitude for tiering, and keep the sign only as the polarity signal.

A practical APCA guardrail table — note the readability guidance runs the *other* direction from a naive reading (Lc 60 is the *large-text* tier, **not** a body-text floor):

| APCA Lc magnitude | Typical use |
|---|---|
| `\|Lc\| ≥ 90` | Preferred level for fluent/body text and text columns |
| `\|Lc\| ≥ 75` | Minimum for body text where readability matters |
| `\|Lc\| ≥ 60` | Minimum for large or non-body content text (sub-headlines, large fonts) |
| `\|Lc\| ≥ 45` | Large/bold display text |
| `\|Lc\| ≥ 30` | Incidental / disabled text |

These tiers are a secondary readability check applied with font size, weight, and polarity context — not WCAG 2.2 pass/fail rules. As a concrete anchor, Radix targets its step 11 (low-contrast/secondary text) at Lc 60 and its step 12 (high-contrast/primary text) at Lc 90 against a step-2 background of the same hue — consistent with the tiers above, since step 11 is explicitly the secondary-text role. CSS `contrast-color()` can help with simple dynamic black/white foreground choices, but it returns only black or white and does not replace semantic pair design (see § Modern CSS derivation primitives).

## The pairing matrix (the contrast contract as an artifact)

The contrast contract is not a property of individual colors — it is a property of *pairings*, and a mature system makes the set of allowed pairings an explicit, audited artifact rather than something verified ad hoc per screen. The pairing matrix enumerates every foreground/background combination the semantic layer can produce and records the governing floor for each, **per theme**:

| Pairing class | Governing floor | Examples |
|---|---|---|
| Text on surface | WCAG 2.x AA — 4.5:1 (3:1 large) | `text-primary` / `text-secondary` on each surface step |
| Text on solid fill | WCAG 2.x AA — 4.5:1 (3:1 large) | `on-primary` on primary fill; `on-danger` on danger fill |
| Non-text UI (SC 1.4.11) | 3:1 | control borders, input boundaries, toggle/checkbox states |
| Focus ring on adjacent surfaces | 3:1 | focus ring vs both the component fill and the page background |
| Icon / graphical object | 3:1 | standalone icon strokes, the meaningful parts of an illustration |
| Status colors on surface | AA for status text + 3:1 for the status mark | success/warning/danger/info on light and dark surfaces |
| Chart / data-viz marks | 3:1 between adjacent series; do not rely on hue alone | series fills, categorical legends |
| Alpha overlays | AA against the *effective composited* color | translucent scrims, tinted hover states (compute the resolved color, not the token's nominal value) |

The matrix is what CI gates against: each cell is a computed pass/fail in both light and dark themes, so a token change that breaks `focus-ring` against the dark page background fails the build instead of shipping. Alpha overlays are the classic gap — a 12%-opacity hover tint passes nothing meaningful until you composite it over the actual surface and test the *result*.

## Color Vision Deficiency review

Do not stop at a generic "color-blind safe" checkbox. Review rendered components, charts, maps, alerts, focus states, and status treatments with a documented simulator and a redundant-channel check. For dichromacy, use a known LMS-cone-space method such as Brettel–Viénot–Mollon, or another peer-reviewed model such as Machado for severity-aware anomalous trichromacy — **not** a crude per-channel desaturation, which under-reports real confusions. Record the tool, algorithm, and simulated deficiency types in the audit notes.

Run at least protanopia, deuteranopia, and tritanopia reviews on the pairings that carry meaning. A simulation is not proof of accessibility; it is a risk-finding aid. The pass condition is that critical distinctions still have labels, icons, shapes, patterns, ordering, or text in addition to hue, and that chart series remain distinguishable in the actual chart context, not only as isolated legend swatches.

## Theme parity

Every semantic token must resolve in every supported theme. Parity means equal *purpose* and equal *safety*, not equal step number.

- `color.text.primary` may resolve to a dark neutral on a light surface and a light neutral on a dark surface; both must pass against their own surface.
- `color.border.subtle` may need stronger lightness separation in dark mode because faint borders disappear faster than on light surfaces.
- `color.focus.ring` must be visible against normal, inverse, filled, danger, and disabled-adjacent surfaces.
- `color.status.warning.fg` often needs special care because yellow/amber backgrounds can fail with both white and low-contrast dark text if the tone is wrong.
- **Dark mode is non-linear.** Do not mirror or invert light-theme steps blindly. **Halation** — light text on a dark background appears to bloom or smear, strongest with pure white text on near-black and with high-chroma hues — means a dark theme is not just the light theme's lightness values flipped. Mitigate by avoiding pure `#fff` body text on pure `#000` (use an off-white at, e.g., L≈0.92 on a surface at L≈0.12), and by slightly reducing chroma and/or font weight for dark-mode text. Then inspect dense text, hairline borders, icons, focus rings, and filled controls on real dark surfaces. Parity is "every token meets its contrast floor in both themes," not "the dark values are the arithmetic inverse of the light ones."

## User contrast preferences vs forced colors

Two distinct accessibility surfaces touch a color system, and conflating them is a common error — one is a *user preference* the system answers with stronger token values, the other is the OS *replacing the palette entirely*.

**User contrast preference** is expressed via the `prefers-contrast` media query, whose values are `more`, `less`, `custom`, and `no-preference`. Here the author's colors still render; the user is asking for an adjustment. The design consequence for this skill is that a mature system ships a **high-contrast variant of its token mapping** — a parallel resolution of the semantic tokens that raises every text/surface pairing toward AAA (and pushes non-text pairings well past the 3:1 floor) so `prefers-contrast: more` resolves to demonstrably higher-contrast values rather than the same palette; `less` may soften harsh pairings only where the product supports it and still clears required floors; `custom` signals a user-defined color set (often coupled with forced colors). This is the same shape as light/dark parity: another column in the per-theme mapping, gated by the same pairing matrix.

**Forced colors** is different in kind. A color system also has to survive having its colors *removed*. In **forced-colors mode** (Windows High Contrast and equivalents, surfaced by `forced-colors: active`), the OS overrides author colors with a small user-chosen system palette, exposed via the `forced-colors: active` media query and the `system-color` keywords (`Canvas`, `CanvasText`, `LinkText`, `ButtonFace`, `ButtonText`, `Highlight`, …). The design consequence is a constraint, not a runtime feature: **meaning encoded only in a background color disappears**, because backgrounds are reassigned. A button distinguished from the page solely by `surface` fill, a status conveyed only by a red background, or a focus state shown only by a background tint all collapse to indistinguishable. The system must therefore carry structural, non-color signals for anything load-bearing — a real border on interactive controls, an icon or text label alongside status color, an outline-based (not fill-based) focus indicator. A practical corollary: give interactive controls a `border: 1px solid transparent` in the normal themes, so the system palette has an existing border to repaint in forced colors and the control gains its system-colored outline **without a layout shift** (the box already reserved the border's space). Do not rely on shadows, background-only fills, or subtle author colors to define boundaries, because forced-colors mode may remove shadows and substitute system colors. The actual `@media (forced-colors: active)` / `@media (prefers-contrast: more)` overrides and any `forced-color-adjust` opt-outs are wiring that lives in dark-mode-implementation / theme-system-design; what belongs here is the upstream rule that the palette and semantic layer never make color the *sole* carrier of meaning, plus authoring the high-contrast token column those queries resolve to.

## Modern CSS derivation primitives

Three CSS features make a token system self-deriving rather than hand-listed, and all reduce the surface where contrast bugs hide:

- **Relative color syntax** derives a color from another by transforming channels: `oklch(from var(--brand) calc(l * 0.8) c h)` produces a darker brand variant in-place, and the same pattern generates hover/pressed states or whole scale steps from one seed. Global support is ~90% (early 2026); keep static fallbacks for the rest.
- **`color-mix()`** blends two colors in a named interpolation space: `color-mix(in oklch, var(--brand) 85%, black)` darkens the brand toward black perceptually, and mixing toward `transparent` yields alpha tints. Performed in `oklch`/`lch` it interpolates without the muddy mid-tones sRGB mixing produces, and it is the most broadly-shipped of the three primitives (Baseline since 2023) — the pragmatic default for generating hover/active/tint steps when relative-color support is still a concern.
- **`contrast-color()`** (the shipped name — the earlier draft `color-contrast()` was dropped) takes a color and returns black or white to meet a contrast floor against it: `color: contrast-color(var(--surface))`. MDN lists it as **Baseline 2026 "newly available" (since April 2026)** — newly available means latest browsers only, *not* widely available, so keep fallbacks. Two sharp limits: it picks **only between pure black and pure white** (no brand-tinted foreground), and MDN warns explicitly that against **mid-tone backgrounds neither black nor white clears AA** — e.g. a royal-blue `#2277d3` surface returns black text that is not readable for small text — so it is only safe over reliably light or reliably dark surfaces. It does not replace authored `on-*` / `text-on-X` tokens for the pairings a brand controls — reserve it for genuinely dynamic backgrounds (user-picked colors, tag chips) where no token could be authored ahead of time.

## Token interchange — the DTCG color format

A color system rarely lives only in CSS; its values move between Figma, Style Dictionary, Tokens Studio, and code. The interchange contract is the **W3C Design Tokens Community Group (DTCG) color format** (Final Community Group Report, 2025-10-28). A DTCG color token's `$value` is a structured object, not a hex string: **`colorSpace`** (required — one of ~14 spaces including `srgb`, `display-p3`, `oklch`, `lab`) and **`components`** (required — an array of channel numbers, with the `"none"` keyword allowed for a missing/powerless channel) are mandatory; **`alpha`** (0–1, defaults to fully opaque) and a 6-digit **`hex`** fallback are optional. An OKLCH value retains `colorSpace: "oklch"` and components in `[lightness, chroma, hue]` order; a Display-P3 value retains `colorSpace: "display-p3"` and RGB components. Alias references let semantic tokens point back to palette tokens. This is what lets a perceptually-uniform palette survive export: the OKLCH triple is carried as data rather than flattened to sRGB hex at design time.

Two round-trip risks belong to this skill, because they are where a carefully-built palette silently degrades:

- **Tool-support unevenness.** It is a *Community Group* report (stable, but not a W3C Standard), and tool coverage of the structured color type and the wider color spaces lags the spec. A consumer that understands only sRGB hex will read the optional `hex` fallback and **drop the wide-gamut/OKLCH information** — so the exported palette loses exactly the perceptual uniformity it was built for. Validate that every tool in the chain preserves `colorSpace`/`components`, not just `hex`.
- **Gamut mapping on conversion.** Converting a token between color spaces (e.g., `oklch` → `srgb` for an older target) invokes a gamut-mapping step, and **the choice of mapping algorithm materially changes the result** — a chroma-reduced map (per § Wide gamut and gamut mapping) and a naive per-channel clip produce visibly different colors. Pin and verify the translation tool's mapping behavior; do not assume two tools round-trip identically.

The DTCG format is *what the colors are, serialized for exchange* — it stays in this skill. How a build pipeline transforms, distributes, and deprecates those tokens to platform targets is theme-system-design's / design-system-architecture's machinery.

## Philosophy of the skill

Color choices are constraints applied to perception, not free decisions. Perceptual uniformity, contrast minima, color-blindness considerations (~8% of men and ~0.5% of women have some form of color vision deficiency, most commonly red-green), gamut limits, and user contrast preferences are real and observable. A palette that ignores them produces accessibility violations and uneven scales that designers compensate for with one-off tweaks — design-system debt that surfaces whenever the product adds dark mode, a brand refresh, or a new surface.

Semantic tokens are worth the indirection because color meanings outlive specific values. "Danger" stays danger when the brand red shifts a few degrees; "surface" stays a surface when the theme flips; components keep working. Tying components directly to palette values turns every brand refresh into a code change. The step-role convention earns its up-front rigor for the same reason: when step index encodes role, a new hue drops into the system and is immediately usable for borders, fills, and text without a fresh round of hand-tuning. And the same logic protects dark mode — a semantic role can keep its promise even when it maps to a different step, lower chroma, or less intense text color because the perceptual context changed.

## Verification

- A pairing matrix exists as an artifact and is gated in CI: every allowed foreground/background combination is enumerated and computed pass/fail in *both* light and dark themes, including alpha overlays composited over their actual surface before testing — not only individual swatches.
- Every text/background pair used in the product meets WCAG 2.2 AA at minimum (4.5:1 normal, 3:1 large); an automated check runs in CI against the token combinations. APCA Lc values are computed alongside as a readability signal, but the WCAG 2.x floor is the release gate.
- Non-text contrast (WCAG 2.2 SC 1.4.11) is checked at 3:1 for control borders, input boundaries, toggle/checkbox states, focus rings (against both the component and the page background), standalone icon strokes, selected states, and adjacent chart series — not only text.
- If APCA is used as a secondary check, the project pins the APCA version and tier table; `|Lc| ≥ 90 / 75 / 60` are applied with font size/weight/polarity context and never used to waive a WCAG 2.2 failure.
- Each solid/emphasis fill ships a paired `on-*` foreground token that clears AA against it; no component picks its own text color on a colored surface ad hoc.
- Hover, active, selected, and disabled state colors are either explicit tokens or documented derivation recipes, and the resolved values are checked in the pairing matrix.
- Status and chart systems do not rely on color alone — error states pair color with an icon, label, shape, or pattern (WCAG 2.2 SC 1.4.1).
- The palette and real rendered components are previewed under protanopia, deuteranopia, and tritanopia using a documented LMS-space simulator (Brettel/Viénot or Machado, not naive desaturation), and critical distinctions remain distinguishable with non-color redundancy in the actual chart/component context.
- Scales are generated in OKLCH/LCH/HCT and exported to sRGB or display-p3; equal step indices have equal lightness within ±2 L units, and HSL/sRGB equal steps are not treated as perceptual steps.
- Each scale has a documented seed/anchor, lightness ramp, chroma policy, and gamut-fallback policy; indexed scales have documented UI role bands (background / component / border / fill / text) that hold across every hue.
- Out-of-gamut scale colors are gamut-mapped by chroma reduction (L and H held fixed) using the OKLab `deltaEOK ≤ 0.02` stop condition, not per-channel clipped; P3/OKLCH values have sRGB fallbacks whose contrast is tested separately.
- Dark-theme mappings are reviewed for halation, vibrating accents, hairline-border loss, and overly harsh pure-white-on-near-black text; they are not generated by simple inversion alone.
- A high-contrast token column exists for `prefers-contrast: more` (raising text pairings toward AAA and non-text past 3:1, gated by the same matrix in both themes); forced-colors behavior does not override the user's palette harmfully; shadow-only or background-only boundaries have border/outline/system-color fallbacks, including transparent border/outline slots reserved to avoid layout shift.
- Tokens exported in the DTCG color format carry `$type: "color"` plus `$value.colorSpace` + `$value.components` (optional `alpha`, optional `hex`, alias references where needed), not a flattened `hex`, and the export pipeline has been verified to preserve wide-gamut/OKLCH values in every consuming tool — without treating format compliance as contrast proof or build-pipeline ownership.
- Every semantic token resolves in every supported theme; no token is light-only or dark-only, and components consume semantic or component tokens, not raw palette tokens or hex.
- Semantic tokens are named by intent (background-surface, danger-bg) not by appearance (gray-50, red-700) in component code.
- Brand color is anchored at a specific scale step (e.g., the solid-fill step) so the surrounding scale is generated rather than hand-tuned.

## Do NOT Use When

| Use instead | When |
|---|---|
| `visual-design-foundations` | The task is broad visual craft direction, brand mood, hierarchy, density, or art direction without a reusable color-token contract. |
| `theme-system-design` | The task is token tiering, the DTCG build/export pipeline, CSS custom-property delivery, N-theme contract governance, or token deprecation policy — how tokens are stored, transformed, and shipped, rather than what the colors are. |
| `design-system-architecture` | The task is the broader design-token package architecture, distribution, and governance across token categories. |
| `dark-mode-implementation` | The task is `prefers-color-scheme` detection, persistence, first-paint anti-flash code, asset variants, `color-scheme`, or browser chrome hints. |
| `a11y` | The task is pure WCAG interpretation, a compliance audit, keyboard/focus semantics, screen-reader behavior, or assistive-technology testing. |
| `typography-system` | The task is typeface, type scale, line height, text measure, or font delivery. |
| One-off art direction | The task is choosing colors for a single illustration, campaign graphic, screenshot, or brand exploration with no token impact. |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `design`
- Public: `true`
- Domain: `design/visual`
- Scope: Designing a color system — palette construction, semantic color tokens, WCAG contrast pairings, perceptual scale generation in OKLCH/LCH/HCT, wide-gamut fallbacks, and light/dark/high-contrast parity. Portable across any design system; principle-grounded, not repo-bound. Excludes single brand-color picks, runtime theme switching (dark-mode-implementation), token delivery/governance architecture (theme-system-design / design-system-architecture), and non-color tokens.

**When to use**
- Build an 11-step color scale from a brand seed color with perceptually even lightness steps and sRGB fallbacks
- Map semantic intents (success, warning, danger, info) to scale colors with WCAG AA contrast against both light and dark surfaces
- Audit an existing palette for text, non-text, focus, and status contrast failures and propose token-level changes
- Triggers: `color system`, `color palette`, `color tokens`, `wcag contrast`, `oklch`

**Not for**
- Pick the brand's primary color from scratch with no system constraints
- Implement prefers-color-scheme detection, localStorage persistence, and anti-flash script
- Design the full DTCG token build pipeline for all token categories
- Choose spacing values for the layout grid
- Owned by `dark-mode-implementation`: the palette, the scale construction, the semantic color roles, and the contrast pairings against every surface

**Related skills**
- Verify with: `a11y`, `semantics`
- Related: `theme-system-design`, `dark-mode-implementation`, `visual-design-foundations`, `typography-system`, `a11y`, `design-system-architecture`, `semantics`

**Concept**
- Mental model: |
- Purpose: |
- Boundary: |
- Analogy: A color system is a swatch deck plus a wiring diagram. Like a paint manufacturer's standardized deck, it does not decide which room is painted (the per-screen deployment) or hang the lights that change how it reads at night (the theme switch); it guarantees every swatch is mixed by formula from a base pigment so the shades step evenly, and that swatch number N always means the same job (trim, wall, accent) whatever the pigment. The wiring diagram is the part taste alone never supplies: it states which foregrounds may sit on which surfaces, and proves each pairing still meets a legibility floor under every lighting condition.
- Common misconception: |

**Grounding**
- Mode: `universal`
- Truth sources: `https://www.w3.org/TR/WCAG22/`, `https://www.w3.org/TR/wcag-3.0/`, `https://git.apcacontrast.com/documentation/APCAeasyIntro.html`, `https://www.w3.org/TR/css-color-4/`, `https://www.w3.org/TR/css-color-5/`, `https://www.w3.org/TR/css-color-adjust-1/`, `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/oklch`, `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix`, `https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/contrast-color`, `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-contrast`, `https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/forced-colors`, `https://www.w3.org/community/reports/design-tokens/CG-FINAL-format-20251028/`, `https://www.w3.org/community/reports/design-tokens/CG-FINAL-color-20251028/`, `https://developer.android.com/design/ui/mobile/guides/styles/color?hl=en`, `https://codelabs.developers.google.com/codelabs/design-material-darktheme`, `https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale`, `https://tailwindcss.com/blog/tailwindcss-v4`, `https://www.nei.nih.gov/learn-about-eye-health/eye-conditions-and-diseases/color-blindness`, `https://pubmed.ncbi.nlm.nih.gov/9316278/`

**Keywords**
- `semantic color tokens`, `wcag contrast ratio`, `apca contrast`, `oklch color space`, `perceptual uniformity`, `gamut mapping`, `hct tonal palette`, `forced colors`, `light dark parity`, `color accessibility`

<!-- skill-graph-context:end -->
