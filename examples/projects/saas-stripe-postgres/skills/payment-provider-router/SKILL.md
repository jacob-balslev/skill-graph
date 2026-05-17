---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v6.schema.json
schema_version: 6
name: payment-provider-router
description: "Use when dispatching a verified payment event (Stripe webhook or future provider) to the correct downstream handler based on event type. Routes `checkout.session.completed` to subscription provisioning, `invoice.payment_failed` to dunning logic, and `customer.subscription.deleted` to cancellation. Do NOT use for signature verification of the incoming event (use stripe-webhook-signature-verification first) or for the actual subscription database writes (use the per-handler skill or postgres-rls-pattern)."
version: 0.1.0
type: router
category: engineering
domain: engineering/payments
scope: portable
owner: saas-stripe-postgres-example
freshness: "2026-05-18"
drift_check:
  last_verified: "2026-05-18"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "Stripe SDK >=14; event types sourced from Stripe's published event catalog."
allowed-tools: Read Grep
keywords:
  - payment event routing
  - stripe event type dispatch
  - webhook event router
  - checkout.session.completed
  - invoice.payment_failed
  - customer.subscription.deleted
  - payment provider dispatch
  - event type switch
  - payment event handler
  - multi-provider payment routing
triggers:
  - payment-provider-router
paths:
  - "lib/payments/router.ts"
  - "app/api/webhooks/stripe/route.ts"
examples:
  - "route checkout.session.completed to subscription provisioning"
  - "which handler should process invoice.payment_failed for dunning?"
  - "add a new event type handler for customer.subscription.updated"
  - "design the event router so it is extensible to a second payment provider"
anti_examples:
  - "verify that the webhook request is genuinely from Stripe"
  - "write the database insert that creates the subscription record"
  - "handle a failed Stripe API call when creating a payment intent"
relations:
  boundary:
    - skill: stripe-webhook-signature-verification
      reason: "stripe-webhook-signature-verification verifies the event is authentic before it reaches this router; routing an unverified event is a security failure"
    - skill: postgres-rls-pattern
      reason: "postgres-rls-pattern governs the database writes that each handler performs; this router decides which handler runs, not how it writes"
  depends_on:
    - skill: stripe-webhook-signature-verification
      reason: "this router must only receive events that have already passed signature verification — call stripe-webhook-signature-verification first"
  verify_with:
    - stripe-webhook-signature-verification
portability:
  readiness: portable
  targets:
    - skill-md
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---

# Payment Provider Router

## Coverage

- The routing table — a typed dispatch map from `Stripe.Event["type"]` to handler functions, with a structured "unknown event" fallback that returns 200 (to prevent Stripe retry storms) and logs the unhandled type
- Handler isolation — each handler receives only the specific event subtype it needs (e.g. `Stripe.CheckoutSessionCompletedEvent`), not the generic `Stripe.Event`, to avoid casts inside handlers
- Provider abstraction — how to wrap the Stripe-specific router behind a `PaymentEvent` canonical type so a future provider can be added without changing handler code
- Error surface — handlers must catch their own errors and return a structured result; an uncaught exception must not produce a 500 that triggers Stripe's retry mechanism with an exponential backoff cascade
- Event type coverage audit — which event types are handled, which are known-ignored (acknowledged with a comment), and which are genuinely unknown

## Philosophy

A payment event router has the same discipline requirement as a content source router: prefer an explicit handler over an implicit fallback, surface unhandled events loudly (in logs, not in HTTP status codes — a 400 triggers a retry, a 200 with a log entry does not), and never let one handler own two semantically distinct events. The event type is the authoritative signal for which business operation to perform; ambiguity at this layer produces double-charges, missed provisioning, and unfired dunning emails.

## Routing Rules

```typescript
// lib/payments/router.ts
import Stripe from "stripe";
import { handleCheckoutComplete } from "./handlers/checkout-complete";
import { handlePaymentFailed } from "./handlers/payment-failed";
import { handleSubscriptionDeleted } from "./handlers/subscription-deleted";

type HandlerResult = { ok: boolean; message?: string };

const EVENT_HANDLERS: Partial<
  Record<Stripe.Event["type"], (event: Stripe.Event) => Promise<HandlerResult>>
> = {
  "checkout.session.completed": (e) =>
    handleCheckoutComplete(e as Stripe.CheckoutSessionCompletedEvent),
  "invoice.payment_failed": (e) =>
    handlePaymentFailed(e as Stripe.InvoicePaymentFailedEvent),
  "customer.subscription.deleted": (e) =>
    handleSubscriptionDeleted(e as Stripe.CustomerSubscriptionDeletedEvent),
  // Acknowledged non-actionable events — log and return OK
  "invoice.paid": async () => ({ ok: true, message: "acknowledged" }),
};

export async function routePaymentEvent(event: Stripe.Event): Promise<HandlerResult> {
  const handler = EVENT_HANDLERS[event.type];

  if (!handler) {
    console.warn("[payment-router] unhandled event type", { type: event.type, id: event.id });
    // Return 200 — a 4xx or 5xx would trigger Stripe retry with backoff
    return { ok: true, message: "unhandled_event_type" };
  }

  return handler(event);
}
```

## Routing Decision Rules

| Event type | Handler | Rationale |
|---|---|---|
| `checkout.session.completed` | `handleCheckoutComplete` | Provision subscription, create org record |
| `invoice.payment_failed` | `handlePaymentFailed` | Trigger dunning, update subscription status |
| `customer.subscription.deleted` | `handleSubscriptionDeleted` | Revoke access, archive subscription |
| `invoice.paid` | acknowledged | No action — success is implicit from `checkout.session.completed` |
| anything else | log + 200 | Unknown event — log for triage, do not retry |

## Adding a New Event Type

1. Add the Stripe event type string to `EVENT_HANDLERS` with a typed cast.
2. Write the handler in `lib/payments/handlers/<name>.ts` — it receives the specific subtype.
3. Add a row to the routing table above documenting what the handler does.
4. If the event should be intentionally ignored, add it to the "acknowledged" row rather than leaving it in the unknown bucket.

## Verification

- [ ] Every routable event type is in `EVENT_HANDLERS` with an explicit handler or acknowledgement
- [ ] Unknown events return 200 (not 400 or 500) to prevent Stripe retry cascades
- [ ] Each handler receives a typed subtype, not the generic `Stripe.Event`
- [ ] Handler errors are caught inside the handler and returned as `{ ok: false }` — they do not propagate to the router
- [ ] `routePaymentEvent` is only called after signature verification (grep for `routePaymentEvent` — every call site should be downstream of `constructEvent`)

## Do NOT Use When

| Use instead | When |
|---|---|
| `stripe-webhook-signature-verification` | The task is verifying the event's authenticity before routing |
| `postgres-rls-pattern` | The task is writing the database statements inside a specific handler |
| (a generic event bus skill) | The application uses an event bus that is not payment-provider-specific |
