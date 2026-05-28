---
name: mobile-responsive-ux
description: "This skill provides mobile-specific UX patterns for SaaS dashboards: touch-friendly targets (44px minimum), thumb-zone optimization, swipe gestures, condensed data display, bottom navigation, and pull-to-refresh. Load when designing for mobile users, implementing touch interactions, building responsive dashboard layouts, or optimizing for the Side Hustler persona who checks on mobile."
license: MIT
compatibility: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: frontend-ui
  deployment_target: portable
  taxonomy_domain: design/display
  owner: skill-graph-maintainer
  freshness: "2026-03-29"
  drift_check: "{\"last_verified\":\"2026-03-29\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"mobile-responsive-ux\",\"mobile\",\"responsive\"]"
  triggers: "[\"mobile-responsive-ux-skill\",\"mobile-ux-skill\",\"touch-target-skill\",\"thumb-zone-skill\",\"mobile-dashboard-skill\"]"
  relations: "{\"boundary\":[\"a11y\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/frontend-ui/mobile-responsive-ux/SKILL.md
---
# Mobile Responsive UX Skill

## Domain Context

**What is this skill?** This skill provides mobile-specific UX patterns for SaaS dashboards: touch-friendly targets (44px minimum), thumb-zone optimization, swipe gestures, condensed data display, bottom navigation, and pull-to-refresh. Load when designing for mobile users, implementing touch interactions, building responsive dashboard layouts, or optimizing for the Side Hustler persona who checks on mobile.
> If a button works with a mouse but not with a thumb on a moving bus, it is not usable.

## Coverage

This skill covers touch target sizing (44px minimum per Apple HIG and WCAG 2.2), thumb-zone optimization (reachable areas on one-handed use), swipe gesture patterns (navigation, actions, dismissal), condensed data display for small screens (priority content, progressive disclosure), bottom navigation and bottom sheet patterns, pull-to-refresh implementation, mobile-specific input patterns (date pickers, number keyboards, autocomplete), and the SaaS dashboard mobile paradigm (quick-glance KPIs, not full desktop experience).

## Philosophy

Mobile is not a smaller desktop. Agents consistently make the mistake of "responsive" meaning "the same layout but narrower." A SaaS dashboard on mobile serves a fundamentally different purpose than on desktop. The desktop user is doing analytical work: filtering, comparing, exporting. The mobile user is doing a quick health check: "Am I making money today? Any problems?" These are different tasks requiring different interfaces. The 375px screen cannot show the same data table with 8 columns — and it should not try. This skill enforces the discipline of designing for the mobile use case, not just reflowing the desktop layout into a narrower viewport.

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
| **Apple HIG** | 44 x 44 pt | 44 x 44 pt | 8pt between targets |
| **Material Design** | 48 x 48 dp | 48 x 48 dp | 8dp between targets |
| **WCAG 2.2 (Level AA)** | 24 x 24 CSS px | 44 x 44 CSS px | Adjacent targets must not overlap |

**Rule:** All interactive elements on mobile must be at least 44 x 44 CSS pixels. This includes buttons, links, checkboxes, filter chips, table row actions, and dropdown triggers. If the visual element is smaller (e.g., a 16px icon), the tap target must extend beyond the visible element using padding.

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

Replace the sidebar with bottom navigation on mobile. Maximum 5 items:

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
- Maximum 5 items in bottom navigation (Apple HIG)
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
