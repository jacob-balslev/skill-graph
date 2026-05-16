---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: command-palette
description: "This skill provides keyboard-driven navigation patterns for power users: cmdk-style palette (Cmd+K), fuzzy search across orders/products/settings, action shortcuts, recent items, and contextual commands. Load when implementing command palette UI, keyboard shortcut systems, fuzzy search for navigation, or power-user workflow optimization."
version: 1.0.0
type: capability
category: design
domain: design/ui
scope: portable
owner: skill-graph-maintainer
freshness: "2026-03-29"
drift_check:
  last_verified: "2026-03-29"
eval_artifacts: planned
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  notes: "Markdown, Git, agent-skill runtimes"
allowed-tools: Read Grep Bash
keywords:
  - "command-palette"
  - "command"
  - "palette"
triggers:
  - "command-palette-skill"
  - "cmd-k-skill"
  - "keyboard-navigation-skill"
  - "power-user-skill"
  - "fuzzy-search-skill"
relations:
  related:
    - information-architecture
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---
# Command Palette Skill

## Domain Context

**What is this skill?** This skill provides keyboard-driven navigation patterns for power users: cmdk-style palette (Cmd+K), fuzzy search across orders/products/settings, action shortcuts, recent items, and contextual commands. Load when implementing command palette UI, keyboard shortcut systems, fuzzy search for navigation, or power-user workflow optimization.
> Power users measure productivity in keystrokes. Every mouse movement to navigate is a failure of the keyboard interface.

## Coverage

This skill covers command palette architecture (cmdk-style Cmd+K modal), fuzzy search algorithms for navigation (matching orders, products, settings, pages), action command patterns (create, navigate, toggle, execute), recent items and frecency ranking, contextual commands (commands available only on certain pages), keyboard shortcut registration and conflict resolution, accessibility for keyboard-driven interfaces (focus management, screen reader announcements), and the integration pattern for connecting the palette to application state.

## Philosophy

Command palettes originated in code editors (VS Code's Ctrl+Shift+P, Sublime's Cmd+P) and migrated to SaaS applications (Linear, Notion, Raycast, Figma). They solve a fundamental navigation problem: as an application grows, the user must remember where things are in a hierarchy of menus and pages. A command palette replaces spatial memory with recall: the user types what they want and the system finds it. For power users processing hundreds of orders per day, the difference between "click sidebar -> click Orders -> scroll to find order #1234" and "Cmd+K -> type '1234' -> Enter" is minutes per session. This skill exists because agents frequently build command palettes that are either too simple (page navigation only) or too complex (hundreds of commands with no prioritization). The right command palette ranks results by relevance and recency, provides contextual commands, and never requires the user to remember the exact command name.

## Architecture

### Command Registry

Every command palette needs a central registry of available commands:

```typescript
interface Command {
  id: string;                          // Unique identifier
  label: string;                       // Display text
  keywords: string[];                  // Additional search terms
  icon?: React.ReactNode;             // Visual icon
  shortcut?: string;                  // Keyboard shortcut (e.g., 'Cmd+N')
  section: CommandSection;            // Grouping (navigation, action, recent)
  action: () => void | Promise<void>; // What happens when selected
  when?: () => boolean;               // Contextual visibility
  priority?: number;                  // Ranking weight (higher = more prominent)
}

type CommandSection =
  | 'recent'         // Recently used items
  | 'navigation'     // Go to page/section
  | 'action'         // Create, toggle, execute
  | 'search'         // Search results (orders, products)
  | 'settings';      // Preferences and configuration

interface CommandRegistry {
  commands: Command[];
  register(command: Command): void;
  unregister(id: string): void;
  search(query: string): Command[];
}
```

### Result Ranking Algorithm

Search results must be ranked by relevance, not just string match. Use a multi-factor scoring system:

| Factor | Weight | Description |
|--------|--------|-------------|
| **Exact match** | 100 | Query exactly matches command label or keyword |
| **Prefix match** | 80 | Query matches the start of the label |
| **Fuzzy match** | 50 | Characters match in order (e.g., "ors" matches "**o**rde**rs**") |
| **Frecency** | +30 | Frequently used + recently used (combined signal) |
| **Context** | +20 | Command is relevant to the current page |
| **Priority** | +10 | Statically assigned priority from registry |

**Frecency** (frequency + recency) is the most important ranking signal after match quality. A command the user ran 5 minutes ago should rank higher than one they have never used, even if the string match is equal.

### Palette UI Architecture

```
+------------------------------------------+
|  [Search icon]  Type a command...    [Esc]|
+------------------------------------------+
|                                          |
|  Recent                                  |
|  > Order #1234 - View details       [->] |
|  > Dashboard                         [->] |
|                                          |
|  Navigation                              |
|  > Orders                      [Cmd+O]  |
|  > Products                    [Cmd+P]  |
|  > Settings                    [Cmd+,]  |
|                                          |
|  Actions                                 |
|  > Create new order            [Cmd+N]  |
|  > Export data                 [Cmd+E]  |
|  > Toggle dark mode            [Cmd+D]  |
|                                          |
+------------------------------------------+
```

**Layout rules:**
- Input field at the top, always focused on open
- Results grouped by section with section headers
- Selected item highlighted with keyboard navigation (arrow keys)
- Shortcut hints right-aligned for discoverability
- Maximum 10-12 visible items without scrolling
- Footer with keyboard hints: "Enter to select, Esc to close, arrows to navigate"

## Implementation Patterns

### 1. Keyboard Shortcut System

```typescript
// Global shortcut registration
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openPalette();
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, []);
```

**Shortcut conflict resolution:**

| Priority | Context | Example |
|----------|---------|---------|
| 1 (highest) | Browser native | Cmd+C (copy), Cmd+V (paste) — NEVER override |
| 2 | Input field focused | Cmd+A (select all in input) — defer to browser |
| 3 | Application global | Cmd+K (palette), Cmd+/ (help) |
| 4 | Page-specific | Cmd+N (new order on Orders page) |

**Rule:** Never override browser-native shortcuts. Never bind shortcuts that conflict with OS-level shortcuts (Cmd+Q, Cmd+W, Cmd+Tab). Document all custom shortcuts in the command palette itself (the palette is its own shortcut reference).

### 2. Fuzzy Search Implementation

```typescript
function fuzzyMatch(query: string, target: string): { match: boolean; score: number } {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();

  // Exact match
  if (targetLower === queryLower) return { match: true, score: 100 };

  // Prefix match
  if (targetLower.startsWith(queryLower)) return { match: true, score: 80 };

  // Contains match
  if (targetLower.includes(queryLower)) return { match: true, score: 60 };

  // Fuzzy character match
  let queryIndex = 0;
  let consecutiveMatches = 0;
  let score = 0;

  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      queryIndex++;
      consecutiveMatches++;
      score += consecutiveMatches * 2; // Bonus for consecutive matches
    } else {
      consecutiveMatches = 0;
    }
  }

  const match = queryIndex === queryLower.length;
  return { match, score: match ? Math.min(score, 50) : 0 };
}
```

### 3. Entity Search (Orders, Products)

The command palette should search across application entities, not just static commands:

```typescript
async function searchEntities(query: string): Promise<Command[]> {
  // Only search entities if query looks like an entity reference
  if (query.length < 2) return [];

  const results: Command[] = [];

  // Order number search (numeric or prefixed)
  if (/^\d+$/.test(query) || query.startsWith('#')) {
    const orders = await searchOrders(query.replace('#', ''));
    results.push(...orders.map(order => ({
      id: `order-${order.id}`,
      label: `Order #${order.number}`,
      keywords: [order.customerName, order.channel],
      section: 'search' as CommandSection,
      icon: <OrderIcon />,
      action: () => router.push(`/orders/${order.id}`),
    })));
  }

  // Product search
  const products = await searchProducts(query);
  results.push(...products.map(product => ({
    id: `product-${product.id}`,
    label: product.title,
    keywords: [product.sku, product.vendor],
    section: 'search' as CommandSection,
    icon: <ProductIcon />,
    action: () => router.push(`/products/${product.id}`),
  })));

  return results;
}
```

### 4. Contextual Commands

Some commands only make sense on certain pages:

```typescript
const contextualCommands: Command[] = [
  {
    id: 'filter-by-channel',
    label: 'Filter by sales channel',
    section: 'action',
    action: () => openChannelFilter(),
    when: () => currentPath === '/orders',  // Only on orders page
  },
  {
    id: 'export-csv',
    label: 'Export as CSV',
    section: 'action',
    shortcut: 'Cmd+Shift+E',
    action: () => exportCurrentView(),
    when: () => ['/orders', '/products', '/reports'].includes(currentPath),
  },
  {
    id: 'toggle-chart-type',
    label: 'Toggle chart type (line/bar)',
    section: 'action',
    action: () => toggleChartType(),
    when: () => currentPath.startsWith('/reports'),
  },
];
```

### 5. Recent Items with Frecency

Track both frequency and recency of command usage:

```typescript
interface UsageRecord {
  commandId: string;
  lastUsed: number;    // timestamp
  useCount: number;    // total uses
}

function calculateFrecency(record: UsageRecord): number {
  const hoursSinceUse = (Date.now() - record.lastUsed) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 100 - hoursSinceUse * 2); // Decays over 50 hours
  const frequencyScore = Math.min(record.useCount * 5, 50);  // Caps at 50
  return recencyScore + frequencyScore;
}

// Store in localStorage, keyed by user
function recordUsage(commandId: string) {
  const records = getUsageRecords();
  const existing = records.find(r => r.commandId === commandId);
  if (existing) {
    existing.lastUsed = Date.now();
    existing.useCount++;
  } else {
    records.push({ commandId, lastUsed: Date.now(), useCount: 1 });
  }
  saveUsageRecords(records);
}
```

### 6. Accessibility Requirements

The command palette is a keyboard-first interface, but it must be accessible to all users:

| Requirement | Implementation |
|------------|---------------|
| **Focus trap** | When open, focus stays within the palette until closed |
| **Escape to close** | Pressing Escape closes the palette and returns focus to the previous element |
| **Arrow key navigation** | Up/Down arrows move through results; Enter selects |
| **Screen reader** | `role="dialog"`, `aria-label="Command palette"`, `aria-activedescendant` for selected item |
| **Announce results** | `aria-live="polite"` region announces result count: "5 results found" |
| **No mouse required** | Every action achievable via keyboard alone |
| **Visible focus indicator** | Selected item has a clear visual indicator (background highlight) |

```tsx
<div
  role="dialog"
  aria-label="Command palette"
  aria-modal="true"
>
  <input
    role="combobox"
    aria-expanded="true"
    aria-controls="command-list"
    aria-activedescendant={selectedId}
    placeholder="Type a command..."
  />
  <ul id="command-list" role="listbox">
    {results.map(result => (
      <li
        key={result.id}
        id={result.id}
        role="option"
        aria-selected={result.id === selectedId}
      >
        {result.label}
      </li>
    ))}
  </ul>
  <div aria-live="polite" className="sr-only">
    {results.length} results found
  </div>
</div>
```

## Anti-Patterns

1. **Page navigation only.** A command palette that only offers "Go to Orders," "Go to Settings." This misses the most valuable feature: searching entities (orders by number, products by name) and performing contextual actions.

2. **No fuzzy matching.** Requiring exact command name matches. Users do not remember that the command is "Export orders as CSV" — they type "export" or "csv" and expect a match.

3. **Overriding browser shortcuts.** Binding Cmd+C, Cmd+V, Cmd+A, Cmd+W, or other browser-native shortcuts. This breaks fundamental user expectations and creates confusion.

4. **No result ranking.** Showing results in alphabetical order or registration order. A command the user runs 10 times per day should appear before one they have never used when both match the query.

5. **Static result list.** Showing the same commands regardless of the current page context. On the Orders page, "Filter by channel" should rank higher than on the Settings page.

6. **No keyboard shortcut hints.** The command palette is the natural place to discover keyboard shortcuts. Each result with a shortcut should display it, making the palette a self-documenting shortcut reference.

7. **Slow search.** A palette that takes > 100ms to return results feels broken. Keep the search client-side for commands and use debounced server queries (200ms) only for entity search.

8. **No empty state guidance.** When the query matches nothing, show "No results" with suggestions: "Try searching by order number, product name, or page name."

## Key Files

When working in a project with a command palette:

- Command palette component — `CommandPalette.tsx` or `CmdK.tsx`
- Command registry — centralized command definitions
- Keyboard shortcut hook — use the project's actual keyboard hook or registry and verify the current implementation name before editing palette logic
- Fuzzy search utility — string matching algorithm
- Usage tracking — localStorage frecency records
- cmdk library (if used) — `cmdk` npm package for React

## Verification

After applying this skill, verify:
- [ ] Cmd+K (Mac) / Ctrl+K (Windows) opens the palette
- [ ] Escape closes the palette and returns focus to the previous element
- [ ] Arrow keys navigate results; Enter selects
- [ ] Fuzzy search matches partial input ("ors" finds "Orders")
- [ ] Recent items appear first when the palette opens with no query
- [ ] Entity search works (order numbers, product names)
- [ ] Browser-native shortcuts are not overridden
- [ ] Screen reader announces result count and selected item
- [ ] Search results appear within 100ms for static commands
- [ ] Contextual commands reflect the current page

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Page-level search within a data set | `data-table-ux` | Table search filters a single dataset; command palette is cross-application navigation |
| Site navigation structure and hierarchy | `information-architecture` | IA covers the navigation taxonomy; this skill covers keyboard-driven access to it |
| Form input patterns and validation | `form-input-ux` | Form UX covers data entry; this skill covers navigation and action invocation |
| Full-text search implementation | General knowledge | This skill covers the UX of search-as-navigation, not search engine architecture |

---

*Version 1.0.0 -- 2026-03-29. Initial creation.*
