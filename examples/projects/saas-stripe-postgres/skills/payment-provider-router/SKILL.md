---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: payment-provider-router
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when dispatching a verified payment event (Stripe webhook or future provider) to the correct downstream handler based on event type. Routes `checkout.session.completed` to subscription provisioning, `invoice.payment_failed` to dunning logic, and `customer.subscription.deleted` to cancellation. Do NOT use for signature verification of the incoming event (use stripe-webhook-signature-verification first) or for the actual subscription database writes (use the per-handler skill or postgres-rls-pattern)."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: backend-engineering
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: true
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Dispatching a verified payment event to the correct downstream handler by event type in the saas-stripe-postgres example. Excludes webhook signature verification (stripe-webhook-signature-verification) and the subscription database writes (postgres-rls-pattern)."
# taxonomy_domain: optional hierarchical sub-path within `subject`. Slash-delimited
# lowercase kebab-case segments. rename of the original v8 `domain`. Remove when the flat
# `subject` is sufficient.
taxonomy_domain: engineering/payments

# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
license: MIT
# compatibility: runtime compatibility object. Prefer structured fields
# (`runtimes`, `node`) over free-text `notes`.
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "Stripe SDK >=14; event types sourced from Stripe's published event catalog."
allowed-tools: Read Grep
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
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
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - payment-provider-router
# paths: glob array of code surfaces this skill governs. Supports gitignore-style
# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.
paths:
  - "lib/payments/router.ts"
  - "app/api/webhooks/stripe/route.ts"
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "route checkout.session.completed to subscription provisioning"
  - "which handler should process invoice.payment_failed for dunning?"
  - "add a new event type handler for customer.subscription.updated"
  - "design the event router so it is extensible to a second payment provider"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "verify that the webhook request is genuinely from Stripe"
  - "write the database insert that creates the subscription record"
  - "handle a failed Stripe API call when creating a payment intent"
# relations: typed graph edges to sibling skills. Current fields:
# related (adjacency for browse / co-routing expansion) /
# suppresses (exclude listed skills from co-routing when THIS skill wins; write reason
#             as "I own this exclusively over X", not "use X instead") /
# boundary (DEPRECATED alias of suppresses, retained for unmigrated skills) /
# verify_with (cross-check; co-loaded as one-hop expansion) /
# depends_on (composition; transitive — A→B→C loads all three) /
# broader / narrower (SKOS-style generalization) /
# disjoint_with (mutual exclusion for incompatible ownership).
relations:
  related:
    - stripe-webhook-signature-verification
    - postgres-rls-pattern
  depends_on:
    - stripe-webhook-signature-verification
  verify_with:
    - stripe-webhook-signature-verification
---

# Payment Provider Router

## Concept of the skill

**What it is:** The typed dispatch layer that sends verified payment events to the correct business handler.
**Mental model:** Verification proves the event is authentic; the router decides what business operation the event represents.
**Why it exists:** Payment events are high-impact and retried by providers, so ambiguous routing can duplicate work or miss fulfillment.
**What it is NOT:** It is not webhook signature verification, subscription database writes, or provider SDK setup.
**Adjacent concepts:** Event type maps, handler isolation, provider abstraction, idempotency.
**One-line analogy:** It is the switchboard that sends a verified payment event to the right desk.
**Common misconception:** Unknown events should return an HTTP error; for Stripe, acknowledging and logging unknown-but-valid events prevents retry storms.

## Coverage

- The routing table — a typed dispatch map from `Stripe.Event["type"]` to handler functions, with a structured "unknown event" fallback that returns 200 (to prevent Stripe retry storms) and logs the unhandled type
- Handler isolation — each handler receives only the specific event subtype it needs (e.g. `Stripe.CheckoutSessionCompletedEvent`), not the generic `Stripe.Event`, to avoid casts inside handlers
- Provider abstraction — how to wrap the Stripe-specific router behind a `PaymentEvent` canonical type so a future provider can be added without changing handler code
- Error surface — handlers must catch their own errors and return a structured result; an uncaught exception must not produce a 500 that triggers Stripe's retry mechanism with an exponential backoff cascade
- Event type coverage audit — which event types are handled, which are known-ignored (acknowledged with a comment), and which are genuinely unknown

## Philosophy of the skill

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
