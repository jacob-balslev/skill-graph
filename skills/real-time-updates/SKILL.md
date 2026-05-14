---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v4.schema.json
schema_version: 4
name: real-time-updates
description: "This skill provides live data update patterns for web applications: webhook-to-UI push patterns, Server-Sent Events for dashboard updates, polling fallback strategies, optimistic updates, and stale data indicators. Load when implementing live dashboards, push notifications to the browser, real-time data refresh, or deciding between SSE, WebSocket, and polling."
version: 1.0.0
type: capability
category: integration
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
  - "real-time-updates"
  - "real"
  - "time"
  - "updates"
triggers:
  - "real-time-updates-skill"
  - "live-data-skill"
  - "push-updates-skill"
  - "dashboard-refresh-skill"
  - "stale-data-skill"
relations:
  boundary:
    - background-jobs
    - cron-scheduling
  verify_with:
    - interaction-feedback
portability:
  readiness: scripted
  targets:
    - skill-md
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---
# Real-Time Updates Skill

## Domain Context

**What is this skill?** This skill provides live data update patterns for web applications: webhook-to-UI push patterns, Server-Sent Events for dashboard updates, polling fallback strategies, optimistic updates, and stale data indicators. Load when implementing live dashboards, push notifications to the browser, real-time data refresh, or deciding between SSE, WebSocket, and polling.
> Stale data without a staleness indicator is lying to the user. Every data display must communicate its freshness.

## Coverage

This skill covers the decision framework for choosing between Server-Sent Events, WebSocket, and polling, webhook-to-UI push architecture (external event to browser update), optimistic update patterns (instant UI feedback before server confirmation), stale data detection and indicator design, reconnection and recovery strategies for persistent connections, polling fallback when persistent connections fail, and data freshness communication to the user (timestamps, staleness badges, auto-refresh).

## Philosophy

Most SaaS dashboards display data that was fetched once and never updated. The user sees a margin figure from 3 minutes ago and believes it is current. When a new order arrives, the dashboard does not update until the user manually refreshes. This creates a false sense of currency that leads to bad decisions. The skill exists because agents build dashboards that fetch data on page load and never update, or overengineer with WebSocket when SSE or smart polling would suffice. The right approach depends on the data characteristics: how often it changes, how critical freshness is, and how many concurrent connections the server can handle.

## Architecture

### Transport Decision Matrix

| Criteria | SSE | WebSocket | Polling |
|----------|-----|-----------|---------|
| **Direction** | Server -> Client only | Bidirectional | Client -> Server -> Client |
| **Connection** | Persistent HTTP | Persistent TCP | Repeated HTTP requests |
| **Browser support** | All modern browsers | All modern browsers | Universal |
| **Through proxies/CDN** | Good (HTTP/2) | Can be problematic | Perfect |
| **Reconnection** | Built-in (`EventSource` auto-reconnects) | Manual implementation | N/A (each request independent) |
| **Serverless friendly** | Partial (connection duration limits) | No (requires persistent server) | Yes |
| **Best for** | Dashboard updates, notifications | Chat, collaborative editing | Simple status checks, serverless |

**Decision flow:**

1. Data flows server-to-client only? --> **SSE**
2. Need bidirectional communication? --> **WebSocket** (see `websocket` skill)
3. Running on serverless with no persistent connections? --> **Polling**
4. Need maximum compatibility with zero infrastructure? --> **Polling**

### Webhook-to-UI Push Architecture

External platforms (Shopify, Stripe) send webhooks to the server. The server must relay relevant updates to the browser. This is a three-hop architecture:

```
External Platform (Shopify)
  |
  | Webhook POST
  v
Server (API route handler)
  |
  | Process + Store
  v
Database
  |
  | Notify connected clients
  v
SSE/WebSocket/Polling endpoint
  |
  | Push update
  v
Browser (React state update)
```

**Implementation options for server-to-browser notification:**

| Option | How It Works | Latency | Serverless? |
|--------|-------------|---------|-------------|
| **Database polling** | Client polls a "last_updated" timestamp | 2-30s | Yes |
| **SSE from webhook handler** | Webhook handler writes to SSE channel | < 1s | Partial |
| **Pub/Sub (Redis)** | Webhook publishes, SSE subscriber pushes | < 1s | No (needs Redis) |
| **Inngest event -> SSE** | Webhook -> Inngest event -> SSE handler | 1-3s | Yes |

## Implementation Patterns

### 1. Server-Sent Events (SSE)

```typescript
// API route: GET /api/events/dashboard
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const updates = await getRecentUpdates(orgId);
        if (updates.length > 0) {
          const data = `data: ${JSON.stringify(updates)}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
      }, 2000);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Client-side SSE consumption:**

```typescript
// Example pattern only: this repo does not currently ship a dedicated
// useDashboardUpdates() SSE hook. The closest live freshness hooks are
// dashboardScreen.client.tsx's local data hooks plus useRelativeTime().
function useEventSourceUpdates(url: string) {
  const [lastUpdate, setLastUpdate] = useState<unknown>(null);

  useEffect(() => {
    const source = new EventSource(url);

    source.onmessage = (event) => {
      setLastUpdate(JSON.parse(event.data));
    };

    source.onerror = () => {
      console.warn('SSE connection lost, reconnecting...');
    };

    return () => source.close();
  }, [url]);

  return lastUpdate;
}
```

### 2. Smart Polling with Adaptive Intervals

When SSE is not viable (serverless, proxy limitations), use adaptive polling that adjusts frequency based on activity:

```typescript
function useAdaptivePolling(fetchFn: () => Promise<Data>, options: {
  activeInterval: number;    // 5000ms when user is active
  idleInterval: number;      // 30000ms when tab is backgrounded
  staleThreshold: number;    // 60000ms before showing stale indicator
}) {
  const [data, setData] = useState<Data | null>(null);
  const [lastFetch, setLastFetch] = useState<Date>(new Date());
  const [isStale, setIsStale] = useState(false);

  useEffect(() => {
    const interval = document.hidden
      ? options.idleInterval
      : options.activeInterval;

    const timer = setInterval(async () => {
      const result = await fetchFn();
      setData(result);
      setLastFetch(new Date());
      setIsStale(false);
    }, interval);

    // Detect staleness
    const staleChecker = setInterval(() => {
      const elapsed = Date.now() - lastFetch.getTime();
      setIsStale(elapsed > options.staleThreshold);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(staleChecker);
    };
  }, [document.hidden]);

  return { data, lastFetch, isStale };
}
```

### 3. Optimistic Updates

Show the result of a user action immediately, before the server confirms:

```typescript
// Pattern: Optimistic update with rollback
async function updateOrderStatus(orderId: string, newStatus: string) {
  // 1. Save previous state for rollback
  const previousStatus = getOrderStatus(orderId);

  // 2. Optimistically update UI
  setOrderStatus(orderId, newStatus);

  try {
    // 3. Send to server
    await api.updateOrderStatus(orderId, newStatus);
  } catch (error) {
    // 4. Rollback on failure
    setOrderStatus(orderId, previousStatus);
    showToast('Failed to update order status. Please try again.');
  }
}
```

**When to use optimistic updates:**

| Scenario | Use Optimistic? | Why |
|----------|----------------|-----|
| Toggle a setting | Yes | Low-risk, easily reversible |
| Mark order as shipped | Yes | Clear user intent, rollback is safe |
| Delete a record | No | Destructive, hard to undo visually |
| Financial calculation | No | Incorrect intermediate values mislead |
| Status filter change | Yes | UI-only, no data mutation |

### 4. Stale Data Indicators

Every data display must communicate its freshness. Three patterns:

**Relative timestamp:** "Updated 2 minutes ago" — updates in real time via `useEffect` interval.

**Staleness badge:** A visual indicator that appears when data exceeds a freshness threshold:

| Data Type | Fresh Threshold | Stale Warning | Critical Stale |
|-----------|----------------|---------------|----------------|
| Order list | 5 minutes | "Data may be outdated" | "Last updated 30+ minutes ago" |
| Financial KPIs | 15 minutes | Subtle indicator | "Refresh for current data" |
| Settings | No staleness concern | N/A | N/A |

**Auto-refresh with notification:** When stale data is detected, offer the user a choice:

```
[New data available. Refresh now | Dismiss]
```

Do NOT auto-refresh without user consent if the user is interacting with the page (scrolling, filtering, selecting). This causes disorienting layout shifts.

### 5. Reconnection Strategy

For persistent connections (SSE, WebSocket), implement reconnection with backoff:

```
Disconnect detected
  -> Wait 1s, attempt reconnect
  -> If failed, wait 2s
  -> If failed, wait 4s
  -> If failed, wait 8s (cap)
  -> Show "Connection lost. Retrying..." indicator to user
  -> On reconnect, fetch missed updates (use last event ID or timestamp)
```

**Critical:** After reconnection, the client may have missed updates. Fetch the delta between the last received event and the current state. Never assume the reconnected stream picks up exactly where it left off.

### 6. Visibility API Integration

Stop polling and close SSE connections when the browser tab is not visible. Resume on focus:

```typescript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Reduce polling frequency or pause SSE
    pauseRealTimeUpdates();
  } else {
    // Resume and fetch any missed updates
    resumeRealTimeUpdates();
    fetchMissedUpdates();
  }
});
```

## Anti-Patterns

1. **WebSocket for server-to-client-only data.** Using WebSocket when data only flows from server to client. SSE is simpler, auto-reconnects, and works through HTTP/2 proxies without configuration.

2. **Polling at fixed intervals regardless of activity.** Polling every 5 seconds even when the tab is backgrounded wastes bandwidth and server resources. Use the Visibility API to reduce or pause polling.

3. **No staleness indicator.** Showing data that was fetched 10 minutes ago without any indication of age. The user assumes the data is current and makes decisions on stale information.

4. **Auto-refreshing during user interaction.** Refreshing a data table while the user is selecting rows, scrolling, or editing inline. This causes layout shifts and data loss. Show a "New data available" banner instead.

5. **Optimistic updates for destructive actions.** Showing a record as deleted before the server confirms. If the delete fails, the record "reappears," which is confusing and erodes trust.

6. **No reconnection handling for SSE/WebSocket.** Assuming persistent connections never drop. Connections drop on network changes, server deploys, and proxy timeouts. Always implement reconnection with delta recovery.

7. **Polling the same endpoint from multiple components.** Three components on the same page each polling `/api/orders` independently. Centralize polling in a shared hook or context provider.

## Key Files

When working in a project with real-time updates:

- SSE endpoint routes — `api/events/` or `api/stream/`
- Live dashboard data hooks — `useOrders()`, `useRevenueDaily()`, `useRelativeTime()`
- Webhook handlers that trigger UI updates — webhook processing pipeline
- Stale data indicator components — timestamp display, staleness badges
- Polling configuration — intervals, visibility handling

## Verification

After applying this skill, verify:
- [ ] Every data display communicates its freshness (timestamp or staleness indicator)
- [ ] Polling pauses or reduces frequency when the tab is not visible
- [ ] SSE/WebSocket connections implement reconnection with delta recovery
- [ ] Optimistic updates include rollback on server failure
- [ ] Auto-refresh does not occur during active user interaction
- [ ] The transport choice (SSE/WebSocket/polling) matches the data flow requirements
- [ ] Multiple components sharing the same data source use a centralized subscription

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| SSE implementation details and streaming protocols | `streaming` | Streaming covers the protocol; this skill covers the UX and architecture |
| Bidirectional real-time communication | `websocket` | WebSocket covers bidirectional patterns; this skill covers the decision framework |
| Data synchronization from external platforms | `data-sync` | Data sync covers webhook ingestion and reconciliation; this covers UI push |
| Scheduled periodic data refresh | `cron-scheduling` | Cron covers time-based triggers; this covers event-driven UI updates |

---

*Version 1.0.0 -- 2026-03-29. Initial creation.*
