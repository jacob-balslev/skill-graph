---
name: mobile-responsive-ux
description: "Use when designing mobile-specific UX for dashboards and operational web apps: touch-friendly targets, thumb-zone optimization, swipe gestures, condensed data display, bottom navigation, bottom sheets, mobile inputs, and pull-to-refresh. Load when adapting a desktop dashboard to phone use, implementing touch interactions, or checking whether a mobile layout serves quick-glance tasks rather than compressed desktop analysis. Do NOT use for audit ARIA labels and keyboard focus order. Do NOT use for choose global page breakpoints and responsive grid tracks. Do NOT use for design reusable design tokens for mobile components. Do NOT use for create the product information architecture."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "8"
  version: "1.1.0"
  subject: frontend-engineering
  scope: "Mobile-specific UX patterns for SaaS dashboards and operational web apps: touch-friendly targets, thumb-zone optimization, swipe gestures, condensed data display, bottom navigation, bottom sheets, mobile inputs, and pull-to-refresh. Portable across mobile web products; principle-grounded, not repo-bound. Excludes desktop-first layout composition (layout-composition), component/token architecture (design-system-architecture), and accessibility compliance breadth such as ARIA, keyboard, screen reader, and audit rules (a11y)."
  taxonomy_domain: design/display
  owner: skill-graph-maintainer
  freshness: "2026-06-01"
  drift_check: "{\"last_verified\":\"2026-06-01\"}"
  comprehension_state: present
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"mobile dashboard UX\",\"responsive dashboard\",\"touch targets\",\"thumb zone\",\"bottom navigation\",\"bottom sheet\",\"mobile data cards\",\"pull to refresh\",\"mobile KPI cards\",\"touch gestures\"]"
  examples: "[\"make this dashboard usable on phones\",\"turn this desktop order table into a mobile card flow\",\"check whether these mobile controls are thumb friendly\",\"design a bottom sheet filter pattern for mobile\",\"add pull to refresh and touch gestures to this operational view\"]"
  anti_examples: "[\"audit ARIA labels and keyboard focus order\",\"choose global page breakpoints and responsive grid tracks\",\"design reusable design tokens for mobile components\",\"create the product information architecture\"]"
  triggers: "[\"mobile-responsive-ux-skill\",\"mobile-ux-skill\",\"touch-target-skill\",\"thumb-zone-skill\",\"mobile-dashboard-skill\"]"
  relations: "{\"related\":[\"layout-composition\",\"interaction-patterns\",\"a11y\"],\"verify_with\":[\"a11y\",\"layout-composition\"]}"
  mental_model: "Mobile dashboard UX treats the phone as a quick control surface, not a shrunken analytics workstation. The primitives are reach, target size, glanceable hierarchy, progressive disclosure, touch gestures with visible alternatives, mobile-appropriate inputs, and recovery from cramped or interrupted use."
  purpose: "This skill prevents agents from compressing desktop tables, sidebars, modals, and hover interactions into a phone viewport. It preserves the mobile user's likely job: check status, spot a problem, perform one short action, and leave."
  analogy: "Mobile dashboard UX is a pocket control panel: it exposes the few controls and readings that matter while the full cockpit remains on desktop."
  misconception: "The common mistake is believing responsive means the same desktop screen made narrower. Correct mobile UX changes the task shape, density, navigation, and interaction model for touch and interruption."
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: PROVISIONAL
  application_verdict: PROVISIONAL
  last_audited: "2026-06-01"
  last_changed: "2026-06-01"
  lint_verdict: PASS
  public: "true"
  concept_boundary: "This skill does not own general responsive structure across all breakpoints; that belongs to layout-composition. It does not own accessibility compliance, ARIA, keyboard order, screen reader behavior, or audit mechanics; that belongs to a11y. It does not own component token architecture or visual style systems."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-engineering/mobile-responsive-ux/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Mobile Responsive UX Skill

## Concept of the skill

**What it is:** Mobile responsive UX is the practice of redesigning dashboard and operational workflows for small screens, coarse touch input, one-handed reach, and quick-glance tasks instead of merely shrinking the desktop interface.

**Mental model:** Treat the phone as a pocket control surface. Put the few readings and actions that matter most within reach, keep targets large enough to tap, reveal detail progressively, and make every gesture recoverable through a visible control.

**Why it exists:** Desktop dashboards optimize for comparison, filtering, exports, and multi-column analysis. Phone use usually means checking health, responding to one alert, searching one item, or confirming a small action under interruption.

**What it is NOT:** It is not general CSS breakpoint implementation, not a full accessibility compliance audit, not desktop data-table design, and not design-system token architecture.

**Adjacent concepts:** Use `layout-composition` for responsive page structure, `a11y` for accessibility compliance, `interaction-patterns` for broader interaction choices, and `design-system-architecture` for reusable component and token contracts.

**One-line analogy:** Mobile dashboard UX is a pocket control panel: it shows the few controls and readings needed in motion while the full cockpit stays on desktop.

**Common misconception:** Responsive mobile UX does not mean "same screen, narrower." It means the task, density, navigation, input, and recovery paths change for touch and interruption.

## Domain Context

**What is this skill?** This skill provides mobile-specific UX patterns for dashboards and operational web apps: touch-friendly targets, thumb-zone optimization, swipe gestures, condensed data display, bottom navigation, bottom sheets, mobile inputs, and pull-to-refresh. Load when designing for mobile users, implementing touch interactions, building responsive dashboard layouts, or optimizing quick-glance workflows for users checking status between tasks.
> If a button works with a mouse but not with a thumb on a moving bus, it is not usable.

## Coverage

This skill covers touch target sizing (44 x 44 CSS px ergonomic floor for mobile product work, while separately respecting WCAG 2.2 AA's 24 x 24 CSS px target-size minimum and exceptions), thumb-zone optimization (reachable areas on one-handed use), swipe gesture patterns (navigation, actions, dismissal), condensed data display for small screens (priority content, progressive disclosure), bottom navigation and bottom sheet patterns, pull-to-refresh implementation, mobile-specific input patterns (date pickers, number keyboards, autocomplete), and the SaaS dashboard mobile paradigm (quick-glance KPIs, not full desktop experience).

## Philosophy of the skill

Mobile is not a smaller desktop. Agents consistently make the mistake of "responsive" meaning "the same layout but narrower." A SaaS dashboard on mobile serves a fundamentally different purpose than on desktop. The desktop user is doing analytical work: filtering, comparing, exporting. The mobile user is doing a quick health check: "Are the important numbers healthy? Any problems?" These are different tasks requiring different interfaces. The 375px screen cannot show the same data table with 8 columns — and it should not try. This skill enforces the discipline of designing for the mobile use case, not just reflowing the desktop layout into a narrower viewport.

## Architecture

### Mobile Use Case Hierarchy

| Priority | What Mobile Users Need | Design Implication |
|----------|----------------------|-------------------|
| 1 | Today's headline KPIs (revenue, margin, orders) | Large, glanceable numbers at the top |
| 2 | Alert/notification status | Badge or indicator without scrolling |
| 3 | Quick drill-down into a specific order | Search or recent orders list |
| 4 | Period comparison (today vs yesterday) | Simple toggle, not a date range picker |
| 5 | Full data exploration | Defer to desktop; show "View on desktop" prompt |

### Touch Target Specifications

| Standard | Minimum Size | Recommended Size | Spacing |
|----------|-------------|-----------------|---------|
| **Apple HIG** | 44 x 44 pt hit region | 44 x 44 pt or larger | Do not crowd adjacent controls |
| **Material Design** | 48 x 48 dp | 48 x 48 dp | 8dp between targets |
| **WCAG 2.2 SC 2.5.8 (Level AA)** | 24 x 24 CSS px | Larger targets reduce errors | Includes spacing, equivalent-target, inline, user-agent, and essential exceptions |
| **WCAG SC 2.5.5 Enhanced (Level AAA)** | 44 x 44 CSS px | 44 x 44 CSS px | Includes equivalent, inline, user-agent, and essential exceptions |

**Rule:** All recurring interactive controls in mobile dashboard UI should provide at least a 44 x 44 CSS px hit area unless a density exception is explicitly justified and still passes accessibility review. WCAG 2.2 AA itself requires at least 24 x 24 CSS px targets or a qualifying exception; 44 x 44 CSS px is this skill's mobile ergonomics floor and aligns with stronger platform guidance. This includes buttons, links, checkboxes, filter chips, table row actions, and dropdown triggers. If the visual element is smaller (e.g., a 16px icon), the tap target must extend beyond the visible element using padding.

```css
/* Touch target pattern — visual is 24px, tap target is 44px */
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 10px;           /* Extends tap area to 44px */
  margin: 0;
  -webkit-tap-highlight-color: transparent;
}
```

### Thumb Zone Map

On one-handed phone use, the thumb has three zones of reachability:

```
+----------------------------+
|     HARD TO REACH          |  <- Top 20%: avoid primary actions
|                            |
|     STRETCH ZONE           |  <- Middle 30%: secondary actions OK
|                            |
|     NATURAL ZONE           |  <- Bottom 50%: primary actions here
+----------------------------+
     [  Home / Nav Bar  ]
```

**Design rules based on thumb zone:**
- **Primary actions** (confirm, save, navigate): bottom 50% of screen
- **Secondary actions** (filter, sort, settings): middle 30%
- **Rarely used actions** (help, account, advanced settings): top 20% or behind a menu
- **Bottom navigation** for main sections: always in the natural zone
- **Floating action buttons** (FAB): bottom-right corner for right-handed users

## Implementation Patterns

### 1. Bottom Navigation

Replace the sidebar with bottom navigation on mobile when the product has a small set of stable top-level destinations. Use 3-5 items; if there are more than 5, move lower-priority destinations behind `More`, search, or a secondary navigation surface.

```
+----------------------------+
|                            |
|     Page Content           |
|                            |
+----------------------------+
| Dashboard | Orders | More  |
|    [icon] | [icon] | [icon]|
+----------------------------+
```

**Rules:**
- 3-5 top-level destinations; never force every desktop sidebar item into the bar
- Each item: icon + label (icon-only is ambiguous)
- Active state: filled icon + color change + label
- Badge for notification count on relevant tab
- Bottom nav is always visible — never hidden by scroll

### 2. Bottom Sheet for Complex Actions

When the user needs to filter, sort, or perform multi-step actions on mobile, use a bottom sheet instead of a modal or dropdown:

```
+----------------------------+
|     Page Content           |
|     (dimmed background)    |
+----------------------------+
|  --- drag handle ---       |
|  Filter Orders             |
|                            |
|  Status:  [All] [Pending]  |
|  Channel: [All] [Shopify]  |
|                            |
|  [Apply Filters]           |
+----------------------------+
```

**Bottom sheet heights:**
- **Peek:** 25% of viewport — shows summary or first action
- **Half:** 50% — shows a form or short list
- **Full:** 90% — shows a long list or complex form (always include close/back)

### 3. Condensed Data Display

Desktop data tables do not work on mobile. Replace with card-based layouts:

**Desktop table row:**
```
| Order #1234 | Shopify | $45.99 | $12.50 | 27.2% | Shipped |
```

**Mobile card:**
```
+----------------------------+
| #1234          Shipped [>] |
| Shopify                    |
| Revenue: $45.99            |
| Margin:  27.2%  ($12.50)   |
+----------------------------+
```

**Rules for mobile data display:**
- Show 3-4 data points per card, not 8+ columns
- Most important data (order number, status) at the top
- Secondary data (channel, margin) below
- Tap to expand or navigate to detail view
- Never horizontal scroll a data table on mobile

### 4. Swipe Gestures

| Gesture | Action | Use Case |
|---------|--------|----------|
| Swipe left on list item | Reveal action buttons (delete, archive) | Order list, notification list |
| Swipe right on list item | Quick action (mark as read, flag) | Notification list |
| Swipe down from top | Pull-to-refresh | Any data list |
| Swipe between tabs | Navigate tab content | Dashboard sections |

**Rules:**
- Swipe actions must have a visual counterpart (button accessible without swiping)
- Swipe-to-delete requires confirmation (do not delete on swipe alone)
- Swipe velocity and distance thresholds must feel natural (> 30% of item width to trigger)
- Never use swipe as the only way to access an action — always provide a tap alternative

### 5. Pull-to-Refresh

```typescript
// Implementation pattern
function PullToRefresh({ onRefresh, children }: Props) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);

  // Pull indicator appears after 60px downward drag
  // Trigger refresh after 100px drag distance
  // Show spinner during refresh, snap back on complete

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {refreshing && <RefreshSpinner />}
      {children}
    </div>
  );
}
```

**Rules:**
- Only trigger when scrolled to the top of the content
- Show a visual indicator during the pull (spinner or progress)
- Haptic feedback on trigger threshold (where supported)
- Disable during active data loading to prevent double-fetch

### 6. Mobile Input Optimization

| Input Type | Mobile Optimization | HTML Attribute |
|-----------|--------------------|-|
| Phone number | Numeric keyboard | `type="tel"` |
| Email | Email keyboard (@ visible) | `type="email"` |
| Currency amount | Decimal keyboard | `type="text" inputmode="decimal"` |
| Date | Native date picker | `type="date"` (or custom bottom sheet picker) |
| Search | Search keyboard (enter = search) | `type="search"` |
| Quantity | Stepper control (+/-) instead of free text | Custom component |

### 7. Mobile-Specific KPI Display

On mobile, KPI cards should be 2-up (2 per row) instead of the 4-up desktop layout:

```
+---------------------------+
| Revenue      | Orders     |
| $4,523       | 47         |
| +12% vs yday | -3% vs yday|
+---------------------------+
| Margin       | Avg Order  |
| 28.4%        | $96.23     |
| +2.1pp       | +$4.50     |
+---------------------------+
```

**Rules:**
- 2-up layout at < 640px (never 1-up for KPIs — wastes vertical space)
- Large primary number (24-28px font)
- Smaller comparison below (12-14px)
- Tap KPI card to drill down to detail view
- No chart within KPI card on mobile — charts belong in their own section below

## Anti-Patterns

1. **Horizontal scrolling data tables.** Shrinking a 8-column desktop table and letting the user scroll horizontally. On mobile, horizontal scroll is disorienting and most users do not discover scrollable content. Use card layouts instead.

2. **Desktop modals on mobile.** A centered modal with small close button works on desktop but obscures content and has poor touch targets on mobile. Use bottom sheets instead of modals.

3. **Tiny tap targets.** A 24px icon button without extended padding. Fingers are 44-57px wide; anything smaller causes mis-taps and frustration.

4. **Top-of-screen primary actions.** Putting the main CTA ("Save", "Submit", "Next") at the top of the screen where the thumb cannot reach during one-handed use. Primary actions go at the bottom.

5. **Hover-dependent interactions.** Tooltips, hover menus, and hover-triggered dropdowns do not exist on touch devices. Every hover interaction must have a touch equivalent (tap, long-press, or inline display).

6. **Same density on mobile and desktop.** Showing the same amount of data in the same density on a 375px screen. Mobile needs progressive disclosure: show the headline, tap to see details.

7. **Full date range picker on mobile.** A dual-calendar date range selector from a desktop library. On mobile, use preset ranges ("Today", "This Week", "This Month") with a custom option that opens a bottom sheet.

## Key Files

When working in a project with mobile responsive UX:

- CSS breakpoint definitions — `_tokens.scss` or equivalent
- Responsive wrapper components — `MobileOnly`, `DesktopOnly`
- Bottom navigation component — mobile navigation bar
- Touch gesture utilities — swipe handlers, pull-to-refresh
- KPI card components — responsive grid layout

## Verification

After applying this skill, verify:
- [ ] All interactive elements are at least 44 x 44 CSS px on mobile
- [ ] Primary actions are positioned in the bottom 50% of the screen
- [ ] Data tables are replaced with card layouts below 640px
- [ ] Bottom navigation has maximum 5 items with icon + label
- [ ] No hover-only interactions exist — all have touch equivalents
- [ ] KPI cards use 2-up layout on mobile
- [ ] Pull-to-refresh is implemented for data lists
- [ ] Test on a real device (not just browser DevTools resize)

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| CSS breakpoint implementation details | `breakpoint-strategy` | Breakpoints cover the CSS system; this skill covers the UX design at each breakpoint |
| General responsive layout patterns | `responsive` | Responsive covers layout reflow; this skill covers mobile-specific interaction patterns |
| Accessibility for touch interfaces | `a11y` | Accessibility covers WCAG compliance broadly; this skill covers mobile-specific ergonomics |
| Data table design patterns | `data-table-ux` | Data table UX covers the table component; this skill covers how tables transform on mobile |

---

*Version 1.0.0 -- 2026-03-29. Initial creation.*
*Version 1.1.0 -- 2026-06-01. Added comprehension model, eval artifact, portable scope cleanup, and corrected WCAG touch-target wording.*

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `frontend-engineering`
- Domain: `design/display`
- Scope: Mobile-specific UX patterns for SaaS dashboards and operational web apps: touch-friendly targets, thumb-zone optimization, swipe gestures, condensed data display, bottom navigation, bottom sheets, mobile inputs, and pull-to-refresh. Portable across mobile web products; principle-grounded, not repo-bound. Excludes desktop-first layout composition (layout-composition), component/token architecture (design-system-architecture), and accessibility compliance breadth such as ARIA, keyboard, screen reader, and audit rules (a11y).

**When to use**
- make this dashboard usable on phones
- turn this desktop order table into a mobile card flow
- check whether these mobile controls are thumb friendly
- design a bottom sheet filter pattern for mobile
- add pull to refresh and touch gestures to this operational view
- Triggers: `mobile-responsive-ux-skill`, `mobile-ux-skill`, `touch-target-skill`, `thumb-zone-skill`, `mobile-dashboard-skill`

**Not for**
- audit ARIA labels and keyboard focus order
- choose global page breakpoints and responsive grid tracks
- design reusable design tokens for mobile components
- create the product information architecture

**Related skills**
- Verify with: `a11y`, `layout-composition`
- Related: `layout-composition`, `interaction-patterns`, `a11y`

**Concept**
- Mental model: Mobile dashboard UX treats the phone as a quick control surface, not a shrunken analytics workstation. The primitives are reach, target size, glanceable hierarchy, progressive disclosure, touch gestures with visible alternatives, mobile-appropriate inputs, and recovery from cramped or interrupted use.
- Purpose: This skill prevents agents from compressing desktop tables, sidebars, modals, and hover interactions into a phone viewport. It preserves the mobile user's likely job: check status, spot a problem, perform one short action, and leave.
- Analogy: Mobile dashboard UX is a pocket control panel: it exposes the few controls and readings that matter while the full cockpit remains on desktop.
- Common misconception: The common mistake is believing responsive means the same desktop screen made narrower. Correct mobile UX changes the task shape, density, navigation, and interaction model for touch and interruption.

**Keywords**
- `mobile dashboard UX`, `responsive dashboard`, `touch targets`, `thumb zone`, `bottom navigation`, `bottom sheet`, `mobile data cards`, `pull to refresh`, `mobile KPI cards`, `touch gestures`

<!-- skill-graph-context:end -->
