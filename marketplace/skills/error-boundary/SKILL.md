---
name: error-boundary
description: "Use when designing or reviewing React error boundaries: what an error boundary catches (rendering errors, lifecycle errors, constructor errors) and what it does not (event handler errors, async errors, SSR errors, errors in the boundary itself), why React still requires class components for error boundaries, how to place boundaries by granularity (page / feature / leaf), how error boundaries pair with Suspense, the reset-and-recover pattern (resetKeys, error.reset), the Next.js error.tsx route-segment convention, and how to integrate boundaries with error reporting (Sentry, observability). Covers React 18+ and Next.js App Router. Do NOT use for Suspense boundary placement (use suspense-patterns), for general error-handling discipline (try/catch in async code, validation errors), for backend error contracts (use api-design), or for observability infrastructure (use error-tracking)."
license: MIT
allowed-tools: Read Grep
metadata:
  metadata: "{\"schema_version\":6,\"version\":\"1.0.0\",\"type\":\"capability\",\"category\":\"engineering\",\"domain\":\"engineering/frontend\",\"scope\":\"reference\",\"owner\":\"skill-graph-maintainer\",\"freshness\":\"2026-05-16\",\"drift_check\":\"{\\\\\\\"last_verified\\\\\\\":\\\\\\\"2026-05-16\\\\\\\"}\",\"eval_artifacts\":\"planned\",\"eval_state\":\"unverified\",\"routing_eval\":\"absent\",\"comprehension_state\":\"present\",\"stability\":\"experimental\",\"keywords\":\"[\\\\\\\"React Error Boundary\\\\\\\",\\\\\\\"componentDidCatch\\\\\\\",\\\\\\\"getDerivedStateFromError\\\\\\\",\\\\\\\"react-error-boundary library\\\\\\\",\\\\\\\"Next.js error.tsx\\\\\\\",\\\\\\\"global-error.tsx\\\\\\\",\\\\\\\"error boundary granularity\\\\\\\",\\\\\\\"resetKeys\\\\\\\",\\\\\\\"error boundary with Suspense\\\\\\\",\\\\\\\"caught render error\\\\\\\",\\\\\\\"uncaught event handler error\\\\\\\",\\\\\\\"catch errors in React component tree\\\\\\\",\\\\\\\"show fallback UI when component crashes\\\\\\\",\\\\\\\"where to place error boundaries\\\\\\\",\\\\\\\"React component crash recovery\\\\\\\",\\\\\\\"error.tsx route segment fallback\\\\\\\"]\",\"triggers\":\"[\\\\\\\"my error boundary isn't catching errors\\\\\\\",\\\\\\\"do I need an error boundary here\\\\\\\",\\\\\\\"why does the whole page crash on one component error\\\\\\\",\\\\\\\"how do I recover from a caught error\\\\\\\",\\\\\\\"error.tsx vs global-error.tsx\\\\\\\",\\\\\\\"why doesn't this catch async errors\\\\\\\"]\",\"examples\":\"[\\\\\\\"design a route-segment error.tsx for a dashboard so one failing widget doesn't blank the whole page\\\\\\\",\\\\\\\"diagnose why a click-handler crash bypasses the error boundary and propagates to window.onerror\\\\\\\",\\\\\\\"pair an error boundary with a Suspense boundary so failed fetches show error UI while successful ones stream in\\\\\\\",\\\\\\\"integrate an error boundary with Sentry so caught errors are reported with the component tree context\\\\\\\"]\",\"anti_examples\":\"[\\\\\\\"design where to place Suspense fallback boundaries (use suspense-patterns)\\\\\\\",\\\\\\\"design the API response contract for a 500 error (use api-design)\\\\\\\",\\\\\\\"set up Sentry SDK initialization (use error-tracking)\\\\\\\",\\\\\\\"handle a Promise rejection in an event handler (use code-review for the local try/catch pattern)\\\\\\\",\\\\\\\"configure the Sentry, Datadog, or other error-tracking SDK and dashboards (use error-tracking)\\\\\\\"]\",\"relations\":\"{\\\\\\\"related\\\\\\\":[\\\\\\\"suspense-patterns\\\\\\\",\\\\\\\"hooks-patterns\\\\\\\",\\\\\\\"error-tracking\\\\\\\",\\\\\\\"server-components-design\\\\\\\"],\\\\\\\"boundary\\\\\\\":[{\\\\\\\"skill\\\\\\\":\\\\\\\"suspense-patterns\\\\\\\",\\\\\\\"reason\\\\\\\":\\\\\\\"suspense-patterns owns the loading-state boundary mechanism; error-boundary owns the failure-state boundary mechanism. They pair in the canonical ErrorBoundary→Suspense→Component nesting but are distinct primitives that catch different signals (thrown Error vs thrown Promise).\\\\\\\"},{\\\\\\\"skill\\\\\\\":\\\\\\\"hooks-patterns\\\\\\\",\\\\\\\"reason\\\\\\\":\\\\\\\"hooks-patterns covers component-internal logic discipline; error-boundary is a tree-level mechanism that handles failures from anywhere in its descendant subtree. Class-component requirement of error boundaries is the one place hooks discipline does not apply.\\\\\\\"}],\\\\\\\"verify_with\\\\\\\":[\\\\\\\"code-review\\\\\\\",\\\\\\\"error-tracking\\\\\\\"]}\",\"mental_model\":\"|\",\"purpose\":\"|\",\"boundary\":\"|\",\"analogy\":\"An error boundary is to React's component tree what a circuit breaker is to a building's electrical system — when a fault occurs in one circuit, the breaker for THAT circuit trips, isolating the fault so the rest of the building keeps running, while sub-panels still healthy on other circuits keep lights and outlets working. A single master breaker would protect against fault propagation but at the cost of darkening everything; the right granularity is one breaker per useful zone.\",\"misconception\":\"|\",\"concept\":\"{\\\\\\\"definition\\\\\\\":\\\\\\\"An error boundary is a React component that catches JavaScript errors thrown anywhere in its descendant tree during rendering, in lifecycle methods, and in constructors — and renders a fallback UI instead of unmounting the broken subtree to the root. As of React 19 it must still be implemented as a class component using getDerivedStateFromError and/or componentDidCatch; function components cannot themselves be error boundaries (they can render one and provide its fallback). React's design choice: failure in a subtree should not require crashing the whole tree, but the boundary itself must be a stable component above the failure point.\\\\\\\",\\\\\\\"mental_model\\\\\\\":\\\\\\\"|\\\\\\\",\\\\\\\"purpose\\\\\\\":\\\\\\\"|\\\\\\\",\\\\\\\"boundary\\\\\\\":\\\\\\\"|\\\\\\\",\\\\\\\"taxonomy\\\\\\\":\\\\\\\"|\\\\\\\",\\\\\\\"analogy\\\\\\\":\\\\\\\"|\\\\\\\",\\\\\\\"misconception\\\\\\\":\\\\\\\"|\\\\\\\"}\",\"skill_graph_source_repo\":\"https://github.com/jacob-balslev/skill-graph\",\"skill_graph_protocol\":\"Skill Metadata Protocol v5\",\"skill_graph_project\":\"Skill Graph\",\"skill_graph_canonical_skill\":\"skills/error-boundary/SKILL.md\"}"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v4
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/error-boundary/SKILL.md
---

# Error Boundary

## Coverage

The discipline of placing and configuring React error boundaries: precisely what the boundary catches (rendering errors, lifecycle method errors, constructor errors) and what it provably cannot catch (event handler errors, async/setTimeout/Promise errors, server-side rendering errors before React 18.5, errors thrown by the boundary itself), why React 19 still requires class-component implementation, the boundary-placement granularity tradeoff (page / feature / leaf), the canonical Suspense+ErrorBoundary nesting and why their order matters, the reset-and-recover pattern via `resetKeys` / `FallbackComponent`, the Next.js App Router conventions (`error.tsx`, `global-error.tsx`), and how to wire boundaries to external error reporting so caught errors do not become silent UI degradation.

## Philosophy

Before React 16, an error thrown during render had nowhere to go. React's reconciler would catch it, log it, and continue trying to render — usually producing a corrupted or blank tree. The component model assumed that render functions don't throw, and the runtime had no recovery primitive when they did. The result was either total app crash or partial blank screens with no signal that anything had broken.

Error boundaries gave React the recovery primitive it had been missing. A class component that implements `getDerivedStateFromError` and/or `componentDidCatch` catches throws from anywhere in its descendant subtree during rendering, lifecycle methods, and constructors. When a throw occurs, React unmounts the broken subtree and renders the boundary's fallback in its place. The rest of the tree, outside the boundary, keeps running. A bug in one widget no longer means a blank page; it means that widget shows its fallback and everything else is fine.

The discipline is to **place boundaries by failure-blast-radius**. A boundary near the page root catches everything but replaces the entire page on any error. A boundary around a single widget catches only that widget's errors but lets the rest of the page keep working. The right granularity is the smallest scope where the fallback UI is still meaningful: a chart's error fallback ("Unable to load chart, retry?") is useful per-chart; a global "Something went wrong" replacing the whole app is useful only as a last resort.

The boundary's most important second-order property is **honesty**. A caught error is still an error. A boundary that swallows the throw without reporting externally degrades the UI silently — users see "Something went wrong," developers see nothing. The discipline is to pair every boundary with a report-to-Sentry (or equivalent) call, so the fallback is the user-facing recovery *and* the developer-facing alarm.

## What an Error Boundary Catches — and Doesn't

| Source of error | Caught by boundary? |
|---|---|
| Throw during a component's render | Yes |
| Throw in `componentDidMount` / `componentDidUpdate` | Yes |
| Throw in a class constructor | Yes |
| Throw during hook execution (useState initializer, useEffect's render-phase setup) | Yes |
| Throw in a `useEffect` callback body | **No** — runs after commit, outside render phase |
| Throw in an event handler (`onClick`, `onChange`) | **No** — runs imperatively, outside render |
| Unhandled Promise rejection (async function thrown into a click handler) | **No** — async errors propagate to `window.onunhandledrejection` |
| `setTimeout` / `setInterval` callback throw | **No** — escapes React's call stack |
| Server-side rendering error (`renderToString` throw before React 18.5) | Partially — handled via `onError` in modern streaming APIs |
| Error thrown by the boundary itself | **No** — propagates to the next ancestor boundary |

The pattern: error boundaries catch errors thrown **inside React's call stack during render or lifecycle**. Errors that happen outside that stack — event handlers, async callbacks, promise rejections — must be handled with a local `try/catch` and then surfaced into React via `setState` (so the boundary catches the re-render with the error state).

Canonical async-error pattern:

```tsx
function MyComponent() {
  const [error, setError] = useState<Error | null>(null)
  if (error) throw error   // ← rethrow into render, so the boundary catches it
  
  return (
    <button onClick={async () => {
      try {
        await doRiskyThing()
      } catch (e) {
        setError(e as Error)   // ← surface async error into state
      }
    }}>
      Click
    </button>
  )
}
```

This pattern is verbose but explicit. The boundary catches all *rendering* errors automatically; async errors must be opted-in by re-throwing during render.

## React Still Requires a Class Component

Despite the rest of React moving to function components and hooks, error boundaries must be class components as of React 19. The reason: the boundary's defining methods are `static getDerivedStateFromError` and `componentDidCatch`, which have no hooks equivalent. The React team has discussed `useErrorBoundary` but it has not shipped.

Minimal class boundary:

```tsx
import { Component, ReactNode } from 'react'

class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; onError?: (e: Error) => void },
  { hasError: boolean }
> {
  state = { hasError: false }
  
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.props.onError?.(error)
    // Report to Sentry/Datadog/etc here
  }
  
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
```

In practice, use [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary) by Brian Vaughn / Kent C. Dodds — it provides `<ErrorBoundary>` with reset support, `FallbackComponent`, `resetKeys`, and `onError` / `onReset` props out of the box. Implementing the class yourself is fine, but `react-error-boundary` covers the cases (recovery, key-based reset) you'll eventually want.

## Granularity — Where to Place the Boundary

Three placement strategies, each correct in different contexts:

**1. App-root boundary.** One boundary at the top, catches everything else's failures. Renders a "Something went wrong" generic page.

- **Use as**: backstop only. The last line of defense if every finer-grained boundary fails or doesn't exist.
- **Don't rely on alone**: when this catches an error, the user has lost everything.

**2. Route-segment boundary** (Next.js `error.tsx`). One boundary per page or layout segment.

- **Use when**: each route is a meaningful unit; failure in one route shouldn't blank the whole app shell.
- **Next.js sugar**: an `app/dashboard/error.tsx` file is automatically a route-scoped boundary around `app/dashboard/page.tsx`. A `global-error.tsx` is the app-root backstop.

**3. Feature/widget boundary.** A boundary around each independent feature or data-loading component.

- **Use when**: many features render in parallel and failure in one shouldn't take down siblings (dashboard widgets, list-of-items where one item's data is malformed).
- **Cost**: more fallback UIs to design; potential "many error messages" surface.

The right approach is layered: app-root + route-segment + feature, with each catching what its layer scopes. A leaf widget's error hits the feature boundary; an unhandled error in the feature boundary hits the route boundary; a catastrophic error in the route boundary hits the app-root boundary.

## Pairing with Suspense

Error boundaries catch *thrown Errors*. Suspense boundaries catch *thrown Promises*. They are distinct mechanisms and must be different components, but they almost always nest together:

```tsx
<ErrorBoundary fallback={<ErrorUI />}>
  <Suspense fallback={<LoadingUI />}>
    <DataLoadingComponent />
  </Suspense>
</ErrorBoundary>
```

Order matters:

- **ErrorBoundary outside Suspense**: a failed fetch replaces the entire group (loading state too) with the error UI. Most applications want this — a single failure surface.
- **Suspense outside ErrorBoundary**: the Suspense fallback shows during loading; if the fetch then fails, the inner error UI takes its place inside the Suspense slot. Useful when the loading state should remain visible for everything else and only a small portion swaps to error.

`react-error-boundary` provides `onReset` that pairs with Suspense's transition APIs to retry a failed fetch:

```tsx
<ErrorBoundary
  fallbackRender={({ resetErrorBoundary }) => (
    <ErrorUI onRetry={resetErrorBoundary} />
  )}
  resetKeys={[queryId]}
>
  <Suspense fallback={<Spinner />}>
    <QueryResult queryId={queryId} />
  </Suspense>
</ErrorBoundary>
```

When `queryId` changes (e.g., user clicks a different item), the boundary auto-resets and tries again. When the user clicks Retry, `resetErrorBoundary` clears the error state and the Suspense boundary re-tries its async render.

See `suspense-patterns` for the full Suspense discipline; this skill focuses on the error half of the pair.

## Next.js App Router Conventions

The App Router gives error boundaries first-class file conventions:

| File | Scope | What it catches |
|---|---|---|
| `app/<segment>/error.tsx` | Route segment | Errors during rendering of that segment's `page.tsx` or any descendant Server/Client component; receives `error` and `reset` props |
| `app/global-error.tsx` | Root layout fallback | Errors that escape every `error.tsx` — including errors in the root layout itself |
| `app/<segment>/not-found.tsx` | Route segment | `notFound()` calls — special case of error, distinct UI |

`error.tsx` must be a Client Component (it uses state for the reset action) and is implicitly wrapped in a route-segment-level error boundary. The convention pairs with `loading.tsx` (Suspense fallback) and produces the canonical "fast page with skeleton, then content with error-recovery if something breaks" pattern without manual boundary wiring.

Important constraint: `error.tsx` only catches errors from *its descendant tree*, not from its sibling layout. An error in `app/layout.tsx` escapes the page's `error.tsx` and only `global-error.tsx` can catch it.

## Reporting Caught Errors

A caught error is still an error. Wire every boundary to external reporting:

```tsx
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => {
    Sentry.captureException(error, { contexts: { react: { componentStack: info.componentStack } } })
  }}
>
  <App />
</ErrorBoundary>
```

`info.componentStack` is React's stack trace of which components were rendering when the error occurred — crucial for diagnosis, distinct from the JavaScript stack trace.

Sentry's `@sentry/react` provides a built-in `<Sentry.ErrorBoundary>` that handles reporting automatically. The discipline applies regardless of tool: caught errors must surface somewhere developers see them. A boundary without reporting is a UX feature with no signal-back loop. See `error-tracking` for the broader observability discipline this skill plugs into.

## Common Anti-Patterns

| Anti-pattern | Why it's wrong | Fix |
|---|---|---|
| Single app-root boundary, no finer scopes | Any error blanks the whole app | Layer boundaries: app-root + route-segment + feature |
| Boundary that swallows the error without reporting | Silent UI degradation | Wire `onError` / `componentDidCatch` to Sentry or equivalent |
| Trying to catch event-handler errors with a boundary | Boundary doesn't catch async/imperative errors | Local `try/catch` in the handler, surface to state via `setError`, re-throw during render |
| Boundary at the same level as the failing component | A throw during the boundary's own render escapes the boundary | Boundary must be *above* the failing component in the tree |
| `error.tsx` placed in the wrong route segment | Errors in `app/layout.tsx` aren't caught by `app/page/error.tsx` | Place `error.tsx` at the segment that owns the failing render; use `global-error.tsx` for the root layout |
| ErrorBoundary inside Suspense (when goal is "failure replaces loading state") | Loading state lingers after fetch fails | Put ErrorBoundary outside Suspense for the common case |
| Function-component error boundary attempt | Hooks API has no `useErrorBoundary` (as of React 19) | Use a class component or the `react-error-boundary` library |
| Reset that doesn't actually retry the failed work | User clicks "Retry" but the same stale error state persists | Use `resetKeys` tied to the inputs that should retry, or `resetErrorBoundary` from `react-error-boundary` |

## Verification

After applying this skill, verify:

- [ ] Every route segment with risk of render-time failure has an `error.tsx` (or equivalent boundary).
- [ ] Every boundary has an `onError` / `componentDidCatch` that reports to external observability.
- [ ] Event-handler errors and async errors are caught locally and surfaced via state, not assumed to hit the boundary directly.
- [ ] Error boundary placement matches failure-blast-radius: app-root for catastrophic, route-segment for navigational, feature-level for partial.
- [ ] When pairing with Suspense, the nesting order matches the desired failure-mode UI (ErrorBoundary outside Suspense for the common case).
- [ ] Reset path actually retries the failed work — `resetKeys` are tied to inputs that change on retry.
- [ ] `global-error.tsx` exists as the app-root backstop.
- [ ] The class-component requirement is acknowledged — no failed attempt to write a function-component boundary without a library.

## Grounding Sources

- React docs — [Catching rendering errors with an error boundary](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary). The official reference for `getDerivedStateFromError` and `componentDidCatch`.
- React legacy docs — [Error Boundaries](https://legacy.reactjs.org/docs/error-boundaries.html). The original explanation from React 16; still the clearest statement of what boundaries do and don't catch.
- Vaughn, B. / Dodds, K. C. — [`react-error-boundary`](https://github.com/bvaughn/react-error-boundary). The de facto library; reset semantics and `FallbackComponent` API.
- Next.js docs — [`error.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/error) and [`global-error.tsx`](https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs). Route-segment boundary conventions.
- Sentry — [React Error Boundary integration](https://docs.sentry.io/platforms/javascript/guides/react/features/error-boundary/). The observability-pairing pattern.
- Dodds, K. C. — [Use react-error-boundary to handle errors in React](https://kentcdodds.com/blog/use-react-error-boundary-to-handle-errors-in-react). Composition patterns and reset strategies.

## Do NOT Use When

| Instead of this skill | Use | Why |
|---|---|---|
| Suspense boundary placement (loading states, streaming) | `suspense-patterns` | suspense-patterns owns the loading-state mechanism; this skill owns the failure-state mechanism. They pair but are distinct primitives. |
| Setting up the observability SDK (Sentry init, breadcrumbs, sampling) | `error-tracking` | error-tracking owns the SDK and infrastructure; this skill owns the in-tree React boundary that feeds caught errors into the SDK. |
| Try/catch discipline in async code (event handlers, promises, await) | `code-review` (or general async error patterns) | Async errors are outside React's call stack — they need local handling first, then re-throwing into render to reach the boundary. |
| Backend error response design (HTTP status codes, error envelope format) | `api-design` | api-design owns the wire format for backend errors; this skill handles client-side errors after the response. |
| Server Component error handling (server-side render failure) | `server-components-design` | Server-side rendering errors are caught by `error.tsx` files at the route segment level — a Next.js convention, technically distinct from React's render-phase error boundary. |
