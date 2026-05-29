---
name: real-time-updates
description: "Use when designing browser freshness for live dashboards, notifications, progress views, or data that can change after initial render. Covers transport choice among polling, Server-Sent Events, and bidirectional sockets; webhook-to-UI propagation; optimistic updates; stale-data indicators; reconnect and catch-up behavior; and avoiding disruptive auto-refresh. Do NOT use for low-level stream/backpressure protocol design (use `streaming-architecture`), recurring schedule design (use `cron-scheduling`), or background worker execution semantics (use `background-jobs`). Do NOT use for design the backpressure protocol for an HTTP stream. Do NOT use for choose the cron expression for a daily refresh. Do NOT use for move a slow export into a queue and define retry policy. Do NOT use for debug a deployed stream outage. Do NOT use for design an outbound event schema and topic naming standard."
license: MIT
compatibility: "Portable browser freshness guidance for web applications. Transport limits vary by hosting platform, proxy, browser, and runtime; verify those limits before production rollout."
allowed-tools: Read Grep Bash
metadata:
  schema_version: "7"
  version: "1.1.0"
  subject: product-domain
  deployment_target: portable
  taxonomy_domain: engineering/realtime/browser-freshness
  owner: skill-graph-maintainer
  freshness: "2026-05-21"
  drift_check: "{\"last_verified\":\"2026-05-21\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: stable
  keywords: "[\"real-time updates\",\"live dashboard\",\"browser freshness\",\"stale data indicator\",\"Server-Sent Events\",\"SSE\",\"WebSocket\",\"adaptive polling\",\"optimistic update\",\"reconnect catch-up\",\"new data banner\",\"live notification\",\"push updates\",\"freshness timestamp\"]"
  triggers: "[\"real-time-updates-skill\",\"live-data-skill\",\"browser-freshness-skill\",\"dashboard-refresh-skill\",\"stale-data-skill\"]"
  examples: "[\"choose between polling, SSE, and WebSocket for a dashboard\",\"show when data is stale without disrupting the user\",\"design reconnect and catch-up behavior after an EventSource disconnect\",\"add optimistic UI with rollback for a reversible action\",\"avoid multiple components polling the same resource\"]"
  anti_examples: "[\"design the backpressure protocol for an HTTP stream\",\"choose the cron expression for a daily refresh\",\"move a slow export into a queue and define retry policy\",\"debug a deployed stream outage\",\"design an outbound event schema and topic naming standard\"]"
  relations: "{\"related\":[\"streaming-architecture\",\"background-jobs\",\"cron-scheduling\",\"interaction-feedback\"],\"boundary\":[{\"skill\":\"streaming-architecture\",\"reason\":\"streaming-architecture owns producer, stream, consumer, backpressure, termination, and low-level protocol semantics; real-time-updates owns browser freshness UX and transport selection.\"},{\"skill\":\"background-jobs\",\"reason\":\"background-jobs owns durable worker execution and progress state; real-time-updates owns how browser views learn about that state.\"},{\"skill\":\"cron-scheduling\",\"reason\":\"cron-scheduling owns recurring trigger timing; real-time-updates owns user-visible freshness after data exists.\"}],\"verify_with\":[\"interaction-feedback\",\"streaming-architecture\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":180,\"review_cadence\":\"quarterly\"}"
  comprehension_state: present
  mental_model: "Browser freshness has four primitives: a source of change, a delivery channel, a browser cache or view state, and a freshness contract shown to the user. The delivery channel can be polling, Server-Sent Events, or a bidirectional socket, but the user contract is the same: communicate what changed, how fresh the view is, whether the connection is healthy, and how missed changes are recovered."
  purpose: "Real-time update design prevents a rendered view from pretending old data is current. It replaces page-load-only fetching and disruptive blind auto-refresh with explicit freshness indicators, centralized subscriptions, reconnect catch-up, and transport choices matched to directionality and infrastructure constraints."
  boundary: "This skill is not low-level streaming protocol design, worker queue design, schedule design, or incident debugging. It starts when a browser-facing view needs to stay fresh and ends with transport choice, subscription ownership, stale-state UX, reconnect recovery, and optimistic-update safety."
  analogy: "A real-time UI is a newsroom ticker: it needs a wire service, an editor that knows what changed, and a visible timestamp so readers know whether the headline is current."
  misconception: "The common mistake is treating real-time as a transport choice first. The actual design starts with the freshness promise: how current the view must be, what happens during disconnect, when updates are safe to apply automatically, and when the user needs control."
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/product-domain/real-time-updates/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

# Real-Time Updates

## Coverage

- Browser freshness decisions for dashboards, feeds, progress panels, notifications, and views that can become stale after initial render.
- Transport selection among adaptive polling, Server-Sent Events, and bidirectional sockets.
- Webhook-to-UI propagation at a pattern level: external change, server state, browser notification, and catch-up fetch.
- Optimistic update safety: when to apply immediately, when to wait, and how to roll back.
- Stale-data communication: timestamps, stale badges, connection status, and non-disruptive refresh prompts.
- Reconnect and missed-update recovery: last seen version, cursor, timestamp, or sequence number.
- Subscription ownership: one shared subscription per resource instead of independent polling loops in every component.

## Philosophy

Stale data without a freshness signal is a false statement. A dashboard that fetched once and never says so teaches the user to trust numbers, statuses, or notifications that may already be outdated.

Real-time design is not the same as choosing the flashiest transport. Polling can be the best design when data changes slowly or hosting cannot keep long connections open. Server-Sent Events are the default for one-way server-to-browser updates. Bidirectional sockets are justified only when the browser must also send frequent low-latency messages over the same channel. The transport is a consequence of the freshness contract, not the starting point.

The strongest systems also keep control with the user. If an update would reorder a table, interrupt a form, clear a selection, or move the scroll position, the interface should announce that new data is available instead of silently replacing the view.

## Freshness Contract First

Before choosing a transport, define the user-visible freshness contract.

| Question | Design implication |
|---|---|
| How stale can the view be before it misleads? | Defines polling interval, staleness threshold, and warning copy. |
| Can updates apply while the user is interacting? | If no, show a "new data available" prompt instead of auto-refreshing. |
| Can the browser miss events during disconnect? | Requires catch-up by version, cursor, timestamp, or full refetch. |
| Is every event important, or only latest state? | Event streams need replay; latest-state views can refetch on reconnect. |
| Does the browser need to send frequent messages back? | If yes, consider bidirectional sockets; if no, prefer SSE or polling. |
| Must the state survive page refresh? | Store durable state on the server and treat browser state as a cache. |

## Transport Decision Matrix

| Requirement | Adaptive polling | Server-Sent Events | Bidirectional socket |
|---|---|---|---|
| Server-to-browser updates | Yes, delayed by interval | Yes, near-real-time | Yes |
| Browser-to-server messages | Separate HTTP request | Separate HTTP request | Same connection |
| Reconnect behavior | Each request is independent | Built into `EventSource` | Must be implemented |
| Hosting friendliness | Highest | Depends on connection duration limits | Requires a persistent socket-capable runtime |
| Proxy and CDN compatibility | Highest | Good with streaming support | More fragile |
| Binary payloads | No special support | Text events only | Supported |
| Best fit | Low or moderate freshness needs | One-way dashboards, progress, feeds, notifications | Collaboration, presence, live cursors, games, control channels |

### Decision Rule

Use this order:

1. If the browser only needs periodic latest state and seconds of delay are acceptable, use adaptive polling.
2. If the server needs to push one-way updates and long connections are supported, use Server-Sent Events.
3. If the browser must send frequent low-latency messages over the same live channel, use a bidirectional socket.
4. If the selected transport cannot replay or recover missed updates, add a catch-up fetch after reconnect.

Do not choose a bidirectional socket only because the feature is called "real-time." Directionality and recovery requirements decide.

## Webhook-To-UI Propagation

An external change does not automatically become a browser update. Treat it as a four-stage pipeline.

```text
External change
  -> Server receives and validates the change
  -> Durable state is updated
  -> Browser freshness channel is notified or polled
  -> Browser reconciles from authoritative state
```

The browser should usually reconcile from authoritative server state rather than trusting the push message as the full truth. A push message can be small: resource type, resource ID, version, and timestamp. The browser then decides whether to refetch a row, a page, or a summary.

| Propagation pattern | Use when | Watch out for |
|---|---|---|
| Poll latest version | Low frequency, simple hosting, broad compatibility | Latency equals interval; many components can duplicate work |
| Push invalidation | Browser can refetch changed state | Requires versioning or timestamps for missed updates |
| Push full patch | Patch is small and ordering is reliable | More complex conflict handling and replay semantics |
| Push progress state | Long work has durable progress fields | Background job state still needs its own reliable contract |

## Adaptive Polling

Polling is not a failure. Poor polling is the failure.

Use adaptive polling when persistent connections are unnecessary or unavailable:

- Poll faster while the tab is visible and the view is active.
- Poll slower or pause when the tab is hidden.
- Use conditional requests, versions, cursors, or updated-at filters when available.
- Centralize polling per resource so multiple components share one result.
- Surface stale state when polling fails or data ages beyond the threshold.

```typescript
type PollingState<T> = {
  data: T | null;
  lastFetchedAt: number | null;
  isStale: boolean;
  error: Error | null;
};

function choosePollInterval(isVisible: boolean, hasRecentActivity: boolean) {
  if (!isVisible) return 60_000;
  if (hasRecentActivity) return 5_000;
  return 20_000;
}
```

Avoid putting `document.hidden` directly in a React dependency array. Track visibility through a `visibilitychange` listener or a shared visibility hook, then derive the interval from that state.

## Server-Sent Events

Use SSE for one-way server-to-browser updates such as status feeds, progress, notification counts, or dashboard invalidation messages.

Minimum SSE contract:

- Event type: what kind of update this is.
- Event ID or version: what the browser can use to resume or catch up.
- Data payload: small enough to process quickly.
- Heartbeat or keepalive: keeps intermediaries from closing quiet streams.
- Abort cleanup: closes timers, subscriptions, and handles when the browser disconnects.

```typescript
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': keepalive\n\n'));
      }, 25_000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
    },
  });
}
```

SSE has built-in reconnect, but that does not guarantee the browser received every update. Use `Last-Event-ID`, a version field, or a timestamp to fetch missed state after reconnect.

## Bidirectional Sockets

Use a bidirectional socket only when the browser must send frequent low-latency messages while also receiving server updates.

Good fits:

- Presence and live cursors.
- Collaborative editing.
- Multiplayer or live control surfaces.
- Chat-like interactions where both sides can speak at any time.

Poor fits:

- Notification badges.
- Dashboard invalidation.
- Progress updates.
- Occasional browser actions that can use ordinary HTTP requests.

If a bidirectional socket is justified, verify heartbeat, reconnect, backoff, authorization, room cleanup, message envelope, and backpressure with `streaming-architecture` or a dedicated socket skill in the consuming environment.

## Optimistic Updates

Optimistic updates make the interface feel instant, but they are safe only when the action is reversible and the speculative state cannot mislead.

| Scenario | Use optimistic UI? | Reason |
|---|---|---|
| Toggle a preference | Yes | Reversible and low risk. |
| Mark an item read | Yes | Clear intent and easy rollback. |
| Inline text edit | Sometimes | Use local draft state until save succeeds if conflicts are likely. |
| Delete a record | Usually no | Removal is disruptive if rollback is needed. |
| Financial, legal, or irreversible action | No | Speculative state can mislead or imply completion. |

Every optimistic update needs:

- Previous state for rollback.
- Pending affordance so the user knows confirmation is not final yet.
- Failure message with recovery.
- Reconciliation with server state after success.

## Stale Data Indicators

Every live view should communicate freshness at the level of precision the user needs.

| Pattern | Use when | Example |
|---|---|---|
| Relative timestamp | Data can age but remains useful | "Updated 2 minutes ago" |
| Connection badge | Stream health matters | "Live", "Reconnecting", "Offline" |
| Staleness warning | Data age can mislead decisions | "Data may be outdated" |
| New-data banner | Auto-refresh would disrupt work | "New data available. Refresh" |
| Disabled live claim | Freshness is unknown | Show timestamp, not "live" |

Auto-refresh is safe for small, non-interactive counters. It is not safe for tables, forms, selected lists, or scroll-sensitive surfaces unless the update preserves the user's position and selection.

## Reconnect And Catch-Up

Persistent connections drop during deploys, network changes, sleep/wake cycles, and proxy timeouts. Reconnect is incomplete without catch-up.

Use this recovery sequence:

1. Detect disconnect and show a non-blocking connection status.
2. Reconnect with exponential backoff and jitter.
3. Send or remember the last seen event ID, version, cursor, or timestamp.
4. Fetch missed state before declaring the view current.
5. Deduplicate updates that arrive both through catch-up and the live channel.
6. Clear the warning only after authoritative state has been reconciled.

If the system cannot determine what was missed, perform a full refetch and say the view was refreshed, not replayed.

## Subscription Ownership

Do not let every component open its own connection or polling loop for the same resource.

Better ownership patterns:

- One route-level subscription that distributes state through context or a shared store.
- One query-cache subscription that invalidates resource keys.
- One server stream per browser view, multiplexing update types in the event payload.
- One polling coordinator that batches interested components.

Central ownership reduces duplicate requests, connection count, inconsistent stale indicators, and race conditions between components.

## Verification

After applying this skill, verify:

- [ ] The freshness contract is explicit: acceptable age, user disruption rules, and recovery behavior are named.
- [ ] The transport choice matches directionality, hosting limits, and recovery needs.
- [ ] Server-to-browser-only flows do not default to bidirectional sockets without a specific bidirectional requirement.
- [ ] Persistent connections have reconnect, backoff, visible status, cleanup on disconnect, and catch-up from last seen state.
- [ ] Polling adapts to visibility or activity and is centralized per shared resource.
- [ ] Every stale or live claim has a timestamp, status badge, or equivalent freshness indicator.
- [ ] Optimistic updates include pending state, rollback, failure recovery, and server reconciliation.
- [ ] Auto-refresh does not disrupt active typing, selection, scrolling, or filtering.
- [ ] Missed updates are deduplicated after reconnect or full refetch.

## Do NOT Use When

| Use instead | When |
|---|---|
| `streaming-architecture` | You are designing low-level producer/consumer/backpressure/termination semantics, HTTP streaming internals, or stream error encoding. |
| `background-jobs` | You are moving slow work into a durable worker, designing job states, retries, progress records, or cancellation. |
| `cron-scheduling` | You are choosing when recurring work starts, preventing schedule overlap, or designing missed-run behavior. |
| `event-contract-design` | You are defining async event envelopes, topic names, compatibility, replay, or producer/consumer ownership. |
| `debugging` | A live update channel is already failing and you need reproduction, logs, and root-cause isolation. |

## Anti-Patterns

| Anti-pattern | Why it fails | Better pattern |
|---|---|---|
| Calling static data "live" | The user trusts freshness that the system cannot prove | Show timestamp or connection status |
| Bidirectional socket for one-way updates | Adds operational complexity without product value | Use SSE or adaptive polling |
| Fixed polling in every component | Wastes requests and creates inconsistent state | Centralize polling or use a shared cache |
| Reconnect without catch-up | The connection resumes but missed updates vanish | Fetch by last seen ID, version, cursor, timestamp, or full refetch |
| Silent auto-refresh of interactive views | Causes layout shifts and lost context | Show a new-data banner or preserve position and selection |
| Optimistic UI for irreversible actions | Rollback is confusing or misleading | Wait for confirmation and show progress |
| No visible stale state after failures | The user cannot distinguish old data from current data | Show stale warning, retry state, or last successful fetch time |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `product-domain`
- Deployment: `portable`
- Domain: `engineering/realtime/browser-freshness`

**When to use**
- choose between polling, SSE, and WebSocket for a dashboard
- show when data is stale without disrupting the user
- design reconnect and catch-up behavior after an EventSource disconnect
- add optimistic UI with rollback for a reversible action
- avoid multiple components polling the same resource
- Triggers: `real-time-updates-skill`, `live-data-skill`, `browser-freshness-skill`, `dashboard-refresh-skill`, `stale-data-skill`

**Not for**
- design the backpressure protocol for an HTTP stream
- choose the cron expression for a daily refresh
- move a slow export into a queue and define retry policy
- debug a deployed stream outage
- design an outbound event schema and topic naming standard
- Owned by `streaming-architecture`: producer, stream, consumer, backpressure, termination, and low-level protocol semantics
- Owned by `background-jobs`: durable worker execution and progress state
- Owned by `cron-scheduling`: recurring trigger timing

**Related skills**
- Verify with: `interaction-feedback`, `streaming-architecture`
- Related: `streaming-architecture`, `background-jobs`, `cron-scheduling`, `interaction-feedback`

**Concept**
- Mental model: Browser freshness has four primitives: a source of change, a delivery channel, a browser cache or view state, and a freshness contract shown to the user. The delivery channel can be polling, Server-Sent Events, or a bidirectional socket, but the user contract is the same: communicate what changed, how fresh the view is, whether the connection is healthy, and how missed changes are recovered.
- Purpose: Real-time update design prevents a rendered view from pretending old data is current. It replaces page-load-only fetching and disruptive blind auto-refresh with explicit freshness indicators, centralized subscriptions, reconnect catch-up, and transport choices matched to directionality and infrastructure constraints.
- Boundary: This skill is not low-level streaming protocol design, worker queue design, schedule design, or incident debugging. It starts when a browser-facing view needs to stay fresh and ends with transport choice, subscription ownership, stale-state UX, reconnect recovery, and optimistic-update safety.
- Analogy: A real-time UI is a newsroom ticker: it needs a wire service, an editor that knows what changed, and a visible timestamp so readers know whether the headline is current.
- Common misconception: The common mistake is treating real-time as a transport choice first. The actual design starts with the freshness promise: how current the view must be, what happens during disconnect, when updates are safe to apply automatically, and when the user needs control.

**Lifecycle & audit status**
- Stability: `stable`
- Freshness: `2026-05-21`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.1.0, schema v7, owner `skill-graph-maintainer`
- Keywords: `real-time updates`, `live dashboard`, `browser freshness`, `stale data indicator`, `Server-Sent Events`, `SSE`, `WebSocket`, `adaptive polling`, `optimistic update`, `reconnect catch-up`, `new data banner`, `live notification`, `push updates`, `freshness timestamp`

<!-- skill-graph-context:end -->
