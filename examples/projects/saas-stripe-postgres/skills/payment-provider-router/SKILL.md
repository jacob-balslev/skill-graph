---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: payment-provider-router
description: "Use when dispatching a payment-related task across the multiple payment providers wired into the SaaS — Stripe, PayPal, Adyen — and you need to know which provider's primitive to apply for a given event, account, or intent. Activate this skill whenever the task says 'the payment webhook' or 'the charge handler' without naming a specific provider, or when adding a new provider to the routing surface. Do NOT use for the actual signature verification of one provider (use stripe-webhook-signature-verification or the equivalent provider-specific skill) or for chasing a specific routing bug from production logs (use debugging)."
version: 0.1.0
type: router
browse_category: integration
category: ecommerce/payments/routing
scope: codebase
owner: saas-stripe-postgres-maintainer
freshness: "2026-05-06"
drift_check:
  last_verified: "2026-05-06"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "Next.js 15+ App Router; supports Stripe ^14, PayPal SDK ^7, Adyen ^15"
allowed-tools: Read Grep
keywords:
  - payment provider router
  - payment dispatch
  - which payment provider
  - stripe vs paypal
  - multi-provider payment
  - payment webhook routing
  - charge dispatch
  - payment intent routing
  - provider selection
  - payment integration router
triggers:
  - payment-provider-router
paths:
  - lib/payment/router.ts
  - lib/payment/stripe/index.ts
  - lib/payment/paypal/index.ts
  - lib/payment/adyen/index.ts
examples:
  - "the payment webhook just landed — which provider's signature primitive do I apply?"
  - "add Adyen as a fourth payment provider to the routing table"
  - "why did the router pick PayPal when the request had a Stripe-Signature header?"
  - "build the routing table for our payment webhooks across all 3 providers"
anti_examples:
  - "verify this Stripe webhook signature"                          # stripe-webhook-signature-verification owns the primitive
  - "the PayPal webhook is intermittently rejecting valid signatures" # debugging owns reproduction
  - "write a guide explaining how our payment routing works"          # documentation owns durable prose
relations:
  boundary:
    - skill: documentation
      reason: "documentation writes prose ABOUT routing; this router is the routing logic itself"
    - skill: debugging
      reason: "debugging chases a specific routing mis-dispatch from logs; this skill designs the routing table"
    - skill: refactor
      reason: "refactor restructures code; this skill defines the dispatch contract that any refactor must preserve"
  verify_with:
    - graph-audit
grounding:
  domain_object: "Payment provider routing — the dispatch table that selects between Stripe, PayPal, and Adyen primitives based on the inbound event signature, account context, or explicit provider hint"
  grounding_mode: repo_specific
  truth_sources:
    - lib/payment/router.ts
    - lib/payment/stripe/index.ts
    - lib/payment/paypal/index.ts
    - lib/payment/adyen/index.ts
  failure_modes:
    - silent_fallback_to_default_provider
    - signature_header_inspection_skipped
    - account_to_provider_map_drift
    - new_provider_added_without_router_update
    - error_response_from_one_provider_silently_retried_via_another
  evidence_priority: repo_code_first
portability:
  readiness: scripted
  targets:
    - agent-skills
project_tags:
  - saas
  - stripe-stack
  - multi-provider
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---

# Payment Provider Router

## Coverage

- Header-based provider detection — `Stripe-Signature`, `paypal-transmission-sig`, and `adyen-signature` are mutually exclusive markers; the router reads them in priority order
- Account-to-provider mapping — when one customer has historically charged via PayPal and now arrives with no header (e.g., a refund initiated from the dashboard), the router must consult the persisted account-to-provider map
- Explicit provider hints — internal callers (cron jobs, manual reconciliation tools) pass an explicit `provider` parameter that bypasses inspection
- Coverage-gap surfacing — when no detection rule matches, the router returns a structured "unknown provider" result; it never silently picks a default
- Adding a new provider — the workflow for landing a fourth provider without breaking the existing three (registration, routing precedence, idempotency-key namespace, end-to-end test)

## Philosophy

A payment router is the most adversarially-tested dispatch surface in the application. Every misroute is either a customer-affecting incident ("we charged the wrong account") or a financial-reconciliation problem ("PayPal recorded the refund but Stripe's books say it never happened"). The router's discipline is: prefer an explicit signal over an inferred one, prefer an unambiguous match over a "best guess," and prefer surfacing a coverage gap loudly over silently routing to a default. The `payment-provider-router` is to payments what `skill-router` is to skills — same anti-default doctrine.

## Routing Rules

The router evaluates four signals in priority order. The first signal that produces an unambiguous winner stops the chain.

| Priority | Signal | Source | Match rule |
|---|---|---|---|
| 1 | Explicit `provider` parameter | Internal callers (cron, manual tools) | Exact match against the `Provider` enum. Bypasses all subsequent inspection. |
| 2 | Provider-specific signature header | Inbound HTTP webhook | First matching header wins: `Stripe-Signature` → Stripe; `paypal-transmission-sig` → PayPal; `adyen-signature` → Adyen. |
| 3 | Account-to-provider persisted map | DB lookup by `account_id` | When the inbound event names an account but carries no signature header (rare; reconciliation tooling), look up the provider that account is bound to. |
| 4 | Explicit `provider_hint` in request body | Trusted internal API callers | Last-resort hint for paths that should not exist; surfaced as a warning in the router's audit log. |

### Coverage-gap behavior

If no signal produces a match, the router returns `{ ok: false, reason: 'unknown_provider', evidence: {...} }`. It does NOT fall back to a default provider. The caller must handle the unknown-provider case explicitly — typically by responding HTTP `400` to the inbound webhook (so the sender retries) and logging the full request shape for human triage.

### Adding a new provider

1. Add the new provider's signature header to the priority-2 detection table
2. Add an integration in `lib/payment/<provider>/index.ts` that mirrors the Stripe interface
3. Add the new provider to the `Provider` enum used at priority 1
4. Add an end-to-end test that sends a synthetic webhook with the new signature header and asserts the router selects the new provider — without this, the router will silently fall through

## Do NOT Use When

| Use instead | When |
|---|---|
| `stripe-webhook-signature-verification` | The task is the actual signature primitive for one provider — the router decides which primitive to apply, the primitive runs the verification |
| `debugging` | A specific routing decision is wrong in production logs and you need to reproduce |
| `documentation` | The task is writing a reference doc about the routing architecture |
