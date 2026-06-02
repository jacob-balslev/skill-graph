---
name: error-tracking
description: "Use when designing or extending an application exception-reporting pipeline: error boundary placement, tracker SDK wrappers, sanitized reporting calls, environment gating, user context without PII leaks, breadcrumbs, and verification that each layer reports correctly. Covers component, route, global, and manual capture surfaces plus central `reportError`/`reportMessage` patterns. Do NOT use for the visual error UX shown to users (use `a11y` and interaction skills), chasing one captured error (use `debugging`), or broad privacy and retention policy (use `owasp-security`). Do NOT use for design accessible error-message copy and recovery UI for the 404 page. Do NOT use for the boundary fired but the tracker shows no event — root-cause it. Do NOT use for explain our error-tracking architecture in the contributor docs. Do NOT use for review this AI-generated error handler for correctness. Do NOT use for decide if the new error path needs an integration regression test."
license: MIT
compatibility: "Tracker-agnostic. The patterns target any exception-reporting SDK with a `captureException` / `captureMessage` / `addBreadcrumb` shape — Sentry, Rollbar, Bugsnag, Honeybadger, Datadog Errors, Application Insights. Examples are framed in React + Next.js because that is the most common surface; analogous primitives exist in Vue (`errorCaptured`), Svelte (error stores), Remix (`ErrorBoundary`), Nuxt (`error.vue`), and any framework with framework-level error hooks."
allowed-tools: Read Grep Bash Edit
metadata:
  schema_version: "8"
  version: "1.1.0"
  subject: code-engineering
  deployment_target: portable
  scope: "Designing and extending an application exception-reporting pipeline — error-boundary placement, tracker-SDK wrappers, sanitized reporting calls, environment gating, PII-free user context, breadcrumbs, and per-layer reporting verification across component, route, global, and manual capture surfaces (central reportError/reportMessage patterns). Portable across any application stack; principle-grounded, not repo-bound. Excludes the user-facing error UX (a11y and interaction skills), chasing a single captured error (debugging), and broad privacy/retention policy (owasp-security)."
  taxonomy_domain: engineering/observability
  owner: skill-graph-maintainer
  freshness: "2026-05-18"
  drift_check: "{\"last_verified\":\"2026-05-18\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"error tracking\",\"exception reporting\",\"error reporting\",\"error boundary\",\"React ErrorBoundary\",\"route error boundary\",\"global error boundary\",\"error tracker SDK\",\"Sentry integration\",\"captureException wrapper\"]"
  examples: "[\"set up exception reporting for a new React + Next.js application\",\"add a route-level error boundary that recovers gracefully and still reports\",\"the error tracker is showing customer emails in event payloads — fix the PII leak\",\"wrap captureException in a centralized reporter that adds environment gating\",\"audit the error pipeline — confirm every layer eventually reaches the tracker\",\"decide where error boundaries should live: component, section, route, or app-global\",\"implement PII sanitization for error payloads before they hit the tracker SDK\",\"set user context (internal id, org id, role) on errors without sending email or name\"]"
  anti_examples: "[\"design accessible error-message copy and recovery UI for the 404 page\",\"the boundary fired but the tracker shows no event — root-cause it\",\"explain our error-tracking architecture in the contributor docs\",\"review this AI-generated error handler for correctness\",\"decide if the new error path needs an integration regression test\",\"design our overall PII storage and retention policy across the system\",\"refactor the error-helper module for clarity\"]"
  relations: "{\"boundary\":[{\"skill\":\"debugging\",\"reason\":\"debugging chases an observed failure already in the tracker; error-tracking designs the pipeline that captures and routes failures in the first place\"},{\"skill\":\"owasp-security\",\"reason\":\"owasp-security owns the cross-cutting PII and credential-handling policy; error-tracking owns the request-time sanitization that error payloads pass through before leaving the application\"},{\"skill\":\"a11y\",\"reason\":\"a11y owns the user-visible error UX (message copy, focus management, screen-reader announcements); error-tracking owns the engineering pipeline behind the error boundary\"},{\"skill\":\"refactor\",\"reason\":\"refactor reorganizes existing code while preserving behavior; error-tracking changes the *behavior* of the error pipeline (where it reports, what it sanitizes, how layers compose)\"}],\"related\":[\"debugging\",\"owasp-security\",\"a11y\",\"code-review\",\"testing-strategy\"],\"verify_with\":[\"code-review\",\"testing-strategy\"]}"
  grounding: "{\"subject_matter\":\"Application exception-reporting pipeline design across boundaries, tracker wrappers, sanitization, user context, breadcrumbs, and environment gates\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://nextjs.org/docs/app/getting-started/error-handling\",\"https://docs.sentry.io/platforms/javascript/configuration/environments/\",\"https://docs.sentry.io/platforms/javascript/guides/koa/data-management/data-collected/\",\"https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html\"],\"failure_modes\":[\"route_fallback_renders_recovery_ui_but_never_reports\",\"manual_async_error_path_logs_locally_only\",\"payload_or_breadcrumb_leaks_pii_or_secrets\",\"tracker_sdk_imported_directly_at_many_call_sites\",\"user_context_uses_email_name_phone_or_ip_instead_of_internal_ids\",\"test_environment_bypasses_sanitization_wrapper\"],\"evidence_priority\":\"equal\"}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/error-tracking/SKILL.md
  skill_graph_export_description_projection: anti_examples+boundary
  skill_graph_export_description_projection_truncated: "true"
---

# Error Tracking

## Coverage

- The four error-capture surfaces every application has, whether by design or accident: component-level boundaries, route-level fallbacks, application-global crash handler, and manual reporting from non-UI code paths
- The centralized-wrapper pattern: a thin module (`reportError`, `reportMessage`, `addBreadcrumb`, `setUser`, `clearUser`, `isErrorTrackingEnabled`) that sits between application code and the tracker SDK
- PII sanitization before any external send: a `sanitizePII()` pass over every payload, the rule that internal IDs are sent and email / name / phone are not, and the verification that wrapper-time sanitization is the actual scrubber (not the tracker SDK's `beforeSend`, which is a backstop at best)
- Environment-aware gating: dev mode emits to a local logger, production emits to the tracker; the gate is a single function so testing is trivial
- User context: setting and clearing `userId`, `orgId`, `role` (or equivalent) at session boundaries; the object signature versus positional-arg trap
- Error breadcrumbs: how to add navigation, network, and state context to events without leaking sensitive data
- Diagnostic discipline: the question *"does this layer actually report, or does it only log?"* — most route-level fallbacks log locally and never reach the tracker unless wired up explicitly
- Catastrophic-failure path: app-global handler bypasses the wrapper and goes straight to the SDK because the wrapper itself may have failed

## Philosophy

Most production applications develop an error-tracking architecture by accident, one try/catch at a time. The accumulated result is unprincipled: some errors reach the tracker with full PII, some are silently swallowed, some are double-reported (once by the boundary, once by the catch), and the dev-prod gating is per-call instead of central. The first time someone has to audit it — usually after a customer reports their email appearing in a third-party error dashboard — the cost of repair is enormous because every call site has to be revisited.

The discipline is to *centralize*. Application code never imports the tracker SDK directly; it imports a thin wrapper module. The wrapper owns three concerns: sanitization, environment gating, and signature stability. Sanitization runs on every payload before any external call. Environment gating decides whether the call goes to a local logger or to the tracker SDK. Signature stability means the wrapper's API does not change when the underlying tracker is swapped — application code is insulated from vendor decisions.

The second principle is *layering*. Errors arrive through multiple surfaces and each layer is responsible for a different recovery story. Component boundaries catch render-time and effect-time exceptions in a subtree and show a fallback UI. Route boundaries catch errors in a specific route and let other routes keep working. The application-global handler catches everything else and shows a "something went wrong" screen. Manual reporting handles errors caught in non-UI code (background jobs, server actions, async event handlers). Each layer must report — the question to verify on every change is *"does this layer's catch path actually call the wrapper, or does it only log locally?"* The default for many framework-provided fallbacks is the latter.

The third principle is *internal IDs only*. The tracker is operated by a third party. Even with a strict DPA, sending email addresses or names is a privacy escalation that has no justification — internal user and org IDs are sufficient to identify the affected account and let an engineer query application logs for the rest. PII appears in error payloads usually as a side effect of "let's just dump the request body" — `sanitizePII()` is the single chokepoint that catches this.

## The Four Error-Capture Surfaces

```
Surface 1: Component-level boundary
  React `ErrorBoundary` / Vue `errorCaptured` / Svelte error store
  Catches render-time and effect-time exceptions in the subtree
  Path: catch -> sanitize -> wrapper -> dev logger or tracker

Surface 2: Route-level boundary
  Next.js `error.tsx` / Remix `ErrorBoundary` / Nuxt `error.vue`
  Catches per-route errors and shows route-scoped recovery UI
  Path: framework hook -> shared fallback component -> wrapper
  (Many framework-provided fallbacks ONLY log locally; verify they call the wrapper)

Surface 3: Application-global crash handler
  Next.js `global-error.tsx` / framework-equivalent root handler
  Catches anything that escaped the route layer
  Path: bypasses wrapper and calls tracker SDK directly
  (The wrapper itself may have failed; rely only on the SDK at this layer)

Surface 4: Manual reporting (non-UI paths)
  Background jobs, server actions, async handlers, queue workers
  Path: try / catch -> wrapper.reportError(error, { tags, extra })
```

When extending or auditing the architecture, walk all four surfaces. The most common gap is Surface 2 — a route fallback shipped that renders a recovery UI but never calls `reportError`, so the production tracker shows zero events for that route while users see "something went wrong."

## The Centralized Wrapper

The wrapper module is small. Six functions cover most needs:

```typescript
// error-tracker.ts

import { tracker } from 'your-tracker-sdk';
import { sanitizePII } from './pii-sanitizer';
import { logger } from './logger';

const enabled = isProductionEnv() && hasTrackerDsn();

export function isErrorTrackingEnabled(): boolean {
  return enabled;
}

export function reportError(
  error: Error | string,
  context?: { tags?: Record<string, string>; extra?: unknown; level?: 'fatal' | 'error' | 'warning' }
): void {
  const sanitized = context?.extra ? sanitizePII(context.extra) : undefined;

  if (!enabled) {
    logger.error(error, { ...context, extra: sanitized });
    return;
  }

  tracker.captureException(error, {
    tags: context?.tags,
    contexts: sanitized ? { sanitized } : undefined,
    level: context?.level ?? 'error',
  });
}

export function reportMessage(
  message: string,
  context?: { tags?: Record<string, string>; extra?: unknown; level?: 'info' | 'warning' | 'error' }
): void {
  const sanitized = context?.extra ? sanitizePII(context.extra) : undefined;

  if (!enabled) {
    logger[context?.level ?? 'info'](message, { ...context, extra: sanitized });
    return;
  }

  tracker.captureMessage(message, {
    tags: context?.tags,
    contexts: sanitized ? { sanitized } : undefined,
    level: context?.level ?? 'info',
  });
}

export function setUser(user: { userId?: string; orgId?: string; role?: string } | null): void {
  if (!enabled) return;
  tracker.setUser(user);
}

export function clearUser(): void {
  if (!enabled) return;
  tracker.setUser(null);
}

export function addBreadcrumb(
  category: string,
  message: string,
  data?: unknown,
  level?: 'info' | 'warning' | 'error'
): void {
  const sanitized = data ? sanitizePII(data) : undefined;
  if (!enabled) {
    logger.debug(`[breadcrumb:${category}] ${message}`, sanitized);
    return;
  }
  tracker.addBreadcrumb({ category, message, data: sanitized, level: level ?? 'info' });
}
```

Every application code path uses these functions; nothing imports the tracker SDK directly *except* the application-global crash handler (which is the one place where the wrapper itself may have crashed).

## PII Sanitization

`sanitizePII()` is the chokepoint. It is the *only* point at which payloads are scrubbed; the tracker SDK's `beforeSend` hook is a backstop, not the primary defence. Wrapping at the SDK level alone misses everything that flows through `breadcrumb` and `extra` outside the exception flow.

```typescript
// pii-sanitizer.ts (sketch)
const PII_KEY_PATTERNS = [
  /^email$/i, /^e_mail$/i,
  /^phone$/i, /^phone_number$/i,
  /^name$/i, /^first_name$/i, /^last_name$/i, /^full_name$/i,
  /^address$/i, /^street$/i, /^postal_code$/i,
  /^ssn$/i, /^tax_id$/i,
  /token/i, /secret/i, /password/i, /api_key/i,
];

export function sanitizePII(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[max-depth]';
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(v => sanitizePII(v, depth + 1));

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (PII_KEY_PATTERNS.some(re => re.test(k))) {
      out[k] = '[redacted]';
    } else {
      out[k] = sanitizePII(v, depth + 1);
    }
  }
  return out;
}
```

The patterns and the recursion bound are workload-specific; tune to your domain. The non-negotiable property is that *every* path into the wrapper passes through `sanitizePII` — there is no "trusted" call site.

## User Context

User context is set at the moment a session is established and cleared on sign-out. The signature is an object, not positional arguments — positional args break silently when one of the optional fields shifts position.

```typescript
// On sign-in or session restore
setUser({
  userId: session.user.id,
  orgId: session.user.orgId,
  role: session.user.role,
});

// On sign-out
clearUser();
```

What goes in: stable internal identifiers (UUIDs, role enums). What does *not* go in: email, full name, phone, IP address, anything that could identify a real person to a tracker operator who already has their own customer database.

For a multi-tenant application, the `orgId` is essential — it scopes the error to a specific customer organization, lets you query "show me all errors for tenant X," and makes incident response actually possible. Without `orgId`, every error event is anonymous and a tenant-affecting bug looks like a fleet-wide problem.

## Environment-Aware Gating

The gating decision lives in one place: `isErrorTrackingEnabled()`. Two conditions: production-equivalent environment *and* tracker DSN configured. If either is missing, every wrapper call falls through to the local logger.

```typescript
function isProductionEnv(): boolean {
  return process.env.NODE_ENV === 'production';
}

function hasTrackerDsn(): boolean {
  return Boolean(process.env.TRACKER_DSN ?? process.env.SENTRY_DSN ?? process.env.ROLLBAR_TOKEN);
}
```

The benefit is that *every test* exercises the same wrapper and the same sanitization path as production, except the final hop hits a logger instead of a tracker. Tests can assert on logger output to verify what *would* have been sent. Without this gating, tests either use a mock tracker (which drifts from production behavior) or skip the path entirely (which means PII leaks slip through CI).

## Diagnostic Discipline

The single most useful question when auditing or extending the architecture:

> *"Does this layer actually call the wrapper, or does it only log locally?"*

Many framework-provided error fallbacks render a recovery UI and call a console-level logger but never report the event externally. From a user perspective the recovery feels graceful; from an operator perspective the production tracker shows zero events for that route, and a regression that fires the boundary 1000 times an hour is invisible.

The audit:

1. List every error-capture surface in the application (the four-surface model above).
2. For each surface, find the actual code path: which file owns the catch, what does it do with the error?
3. Confirm each path calls `reportError` (or, for Surface 3, the SDK directly with sanitization).
4. For surfaces that only log: decide whether they *should* report, and wire them up if so.

A common output of this audit: "47 routes have `error.tsx` files; 12 of them inherit a shared fallback that does report; 35 inherit a different shared fallback that only logs; we have been blind to errors on those 35 routes for a year."

## Evals

This public skill does not bundle a runnable eval artifact. The Skill Graph tooling repo has an early error-tracking eval draft at [`examples/evals/error-tracking.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/error-tracking.json), but keep `eval_state: unverified` until a current eval with at least seven realistic scenarios, negative expectations, and resolved truth sources is added and run. The checklist below is the authoring gate for exception-reporting pipeline decisions.

## Verification

- [ ] All application code reports errors through the wrapper module; nothing imports the tracker SDK directly except the application-global crash handler
- [ ] Every wrapper call passes payloads through `sanitizePII` before any external send
- [ ] User context uses internal IDs (`userId`, `orgId`, `role`); no email, name, phone, or address
- [ ] `isErrorTrackingEnabled()` is the single environment gate; dev mode falls through to the local logger
- [ ] Component boundaries (Surface 1) catch and call the wrapper
- [ ] Route fallbacks (Surface 2) explicitly call the wrapper — verify, do not assume
- [ ] Application-global handler (Surface 3) calls the SDK directly with its own sanitization (the wrapper may have crashed)
- [ ] Non-UI code (Surface 4) wraps async paths in try/catch and calls `reportError`
- [ ] Breadcrumbs are added at meaningful state transitions (route change, network call, mutation), with sanitization
- [ ] At least one regression test exercises a forced error and asserts the wrapper was called with sanitized data
- [ ] At least one regression test exercises an unconfigured environment and asserts the wrapper falls through to the logger

## Do NOT Use When

| Use instead | When |
|---|---|
| `a11y` | Designing accessible error-message copy, focus management on the recovery UI, or screen-reader announcements |
| `debugging` | Root-causing a single observed error already captured in the tracker |
| `documentation` | Writing the contributor-docs page that explains the error-tracking architecture |
| `code-review` | Reviewing an AI-generated error handler for correctness |
| `testing-strategy` | Deciding whether a new error path warrants an integration regression test |
| `owasp-security` | Designing the broader PII storage, retention, and credential-handling policy across the system |
| `refactor` | Reorganizing the error-helper module while preserving its current behavior |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `code-engineering`
- Deployment: `portable`
- Domain: `engineering/observability`
- Scope: Designing and extending an application exception-reporting pipeline — error-boundary placement, tracker-SDK wrappers, sanitized reporting calls, environment gating, PII-free user context, breadcrumbs, and per-layer reporting verification across component, route, global, and manual capture surfaces (central reportError/reportMessage patterns). Portable across any application stack; principle-grounded, not repo-bound. Excludes the user-facing error UX (a11y and interaction skills), chasing a single captured error (debugging), and broad privacy/retention policy (owasp-security).

**When to use**
- set up exception reporting for a new React + Next.js application
- add a route-level error boundary that recovers gracefully and still reports
- the error tracker is showing customer emails in event payloads — fix the PII leak
- wrap captureException in a centralized reporter that adds environment gating
- audit the error pipeline — confirm every layer eventually reaches the tracker
- decide where error boundaries should live: component, section, route, or app-global
- implement PII sanitization for error payloads before they hit the tracker SDK
- set user context (internal id, org id, role) on errors without sending email or name

**Not for**
- design accessible error-message copy and recovery UI for the 404 page
- the boundary fired but the tracker shows no event — root-cause it
- explain our error-tracking architecture in the contributor docs
- review this AI-generated error handler for correctness
- decide if the new error path needs an integration regression test
- design our overall PII storage and retention policy across the system
- refactor the error-helper module for clarity
- Owned by `debugging`
- Owned by `owasp-security`: the cross-cutting PII and credential-handling policy
- Owned by `a11y`: the user-visible error UX (message copy, focus management, screen-reader announcements)
- Owned by `refactor`

**Related skills**
- Verify with: `code-review`, `testing-strategy`
- Related: `debugging`, `owasp-security`, `a11y`, `code-review`, `testing-strategy`

**Grounding**
- Mode: `universal`
- Truth sources: `https://nextjs.org/docs/app/getting-started/error-handling`, `https://docs.sentry.io/platforms/javascript/configuration/environments/`, `https://docs.sentry.io/platforms/javascript/guides/koa/data-management/data-collected/`, `https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html`

**Keywords**
- `error tracking`, `exception reporting`, `error reporting`, `error boundary`, `React ErrorBoundary`, `route error boundary`, `global error boundary`, `error tracker SDK`, `Sentry integration`, `captureException wrapper`

<!-- skill-graph-context:end -->
