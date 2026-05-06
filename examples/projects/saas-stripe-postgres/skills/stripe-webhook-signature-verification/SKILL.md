---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: stripe-webhook-signature-verification
description: "Use when implementing or reviewing the Stripe webhook receiver — verifying the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`, handling clock-skew tolerance, returning the correct status codes, and rejecting malformed payloads before they reach business logic. Activate this skill whenever the task touches `app/api/webhooks/stripe/route.ts`, the `verifyStripeWebhook()` helper, or any code path that processes a `stripe-signature` header — even if the user just says 'the Stripe webhook'. Do NOT use for general webhook patterns across multiple providers (use payment-provider-router) or for a specific runtime failure being chased (use debugging)."
version: 0.1.0
type: capability
browse_category: integration
category: ecommerce/integrations/stripe
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
  notes: "Next.js 15+ App Router, Stripe Node SDK ^14"
allowed-tools: Read Grep Bash
keywords:
  - stripe webhook
  - stripe signature
  - webhook signature verification
  - stripe-signature header
  - STRIPE_WEBHOOK_SECRET
  - constructEvent
  - verifyStripeWebhook
  - webhook receiver
  - signature mismatch
  - webhook 400
  - webhook authentication
  - replay attack
  - webhook tolerance
  - webhook hmac
triggers:
  - stripe-webhook-signature-verification
paths:
  - app/api/webhooks/stripe/route.ts
  - lib/stripe/verify-signature.ts
  - "!**/*.test.ts"
examples:
  - "implement the Stripe webhook handler that verifies the signature before parsing the event"
  - "why is `stripe.webhooks.constructEvent` throwing on signatures that look correct?"
  - "review my Stripe webhook receiver for signature-handling vulnerabilities"
  - "explain how the Stripe-Signature header tolerance window works"
anti_examples:
  - "the webhook is working but my Stripe charges aren't reconciling"     # business logic, not signature
  - "audit our PayPal webhook signature handling"                        # different provider — payment-provider-router selects
  - "build a generic webhook receiver framework for our 5 providers"      # router scope, not signature primitive
relations:
  boundary:
    - skill: documentation
      reason: "documentation writes prose explaining webhook patterns; this skill enforces the specific Stripe signature primitive in code"
    - skill: debugging
      reason: "debugging chases an observed signature-verification failure from logs; this skill is the authoring/review primitive applied before failure"
    - skill: refactor
      reason: "refactor changes code shape; this skill enforces a specific security invariant — the invariant must survive any refactor, not be optimized away"
  verify_with:
    - testing-strategy
grounding:
  domain_object: "Stripe webhook signature verification — the cryptographic primitive that makes the Stripe-Signature header trustworthy"
  grounding_mode: repo_specific
  truth_sources:
    - app/api/webhooks/stripe/route.ts
    - lib/stripe/verify-signature.ts
    - .env.example
  failure_modes:
    - signature_check_skipped
    - tolerance_window_too_wide
    - raw_body_mutated_before_verify
    - secret_misread_from_env
    - constructEvent_in_try_catch_with_swallow
  evidence_priority: repo_code_first
portability:
  readiness: scripted
  targets:
    - agent-skills
project_tags:
  - saas
  - stripe-stack
  - next.js
lifecycle:
  stale_after_days: 90
  review_cadence: quarterly
---

# Stripe Webhook Signature Verification

## Coverage

- The `Stripe-Signature` header contract — what `t=`, `v1=`, and `v0=` mean and which one the verifier must consume
- Reading the **raw request body** (not the parsed JSON) before passing it to `stripe.webhooks.constructEvent()` — Next.js App Router specifics
- Reading `STRIPE_WEBHOOK_SECRET` from the environment with the correct fallback behavior across `dev` / `preview` / `prod`
- Tolerance window selection — Stripe's default is 5 minutes; widening it to handle network jitter is a security/availability trade-off worth documenting
- Status-code discipline — return `400` for signature failures (so Stripe retries), `200` only when verify *and* downstream handling succeed
- The replay-attack window — why the verifier alone is not sufficient and what idempotency layer must be paired with it

## Philosophy

The webhook receiver is the only public-internet entry point that the rest of the application trusts to mutate state. If the signature primitive is wrong — skipped, weakened, or wrapped in a try/catch that swallows the failure — every downstream guarantee about which orders are real is also wrong. There is no "small bug" version of this; either the primitive is enforced exactly to spec or the application has lost the ability to distinguish Stripe-originated events from forgeries. The Stripe SDK does the right thing if you let it — most failures here are the developer reaching past the SDK to "be helpful" (parse the body first, retry on signature mismatch, etc.).

## Key Files

| File | Purpose |
|---|---|
| `app/api/webhooks/stripe/route.ts` | The Next.js App Router POST handler — must read raw body, verify, then dispatch |
| `lib/stripe/verify-signature.ts` | The thin wrapper that consolidates `constructEvent` + tolerance + error mapping into one testable function |
| `.env.example` | Documents `STRIPE_WEBHOOK_SECRET` (and the per-environment variants if you split prod/preview) |

## Verification

Use this checklist before merging any change to the webhook receiver:

- [ ] The route handler reads `await request.text()` (raw body), NOT `await request.json()` — parsing the body invalidates the signature
- [ ] `stripe.webhooks.constructEvent(body, signature, secret)` is called inside a try/catch that **rethrows** (or returns 400) on `Stripe.errors.StripeSignatureVerificationError` — never swallows
- [ ] `STRIPE_WEBHOOK_SECRET` is read once at module load (or via a typed config helper), not re-read per request from `process.env`
- [ ] The tolerance window is either Stripe's default (5 min) or a documented exception with a written reason — drive-by widening is forbidden
- [ ] A signature failure returns HTTP `400`, not `401`/`403`/`500` — `400` is the status Stripe expects for malformed input and the one that triggers correct retry behavior
- [ ] An idempotency check on `event.id` runs before any downstream mutation — verification alone does not prevent replay

## Do NOT Use When

| Use instead | When |
|---|---|
| `payment-provider-router` | The task spans Stripe + PayPal + another provider — the router decides which signature primitive to apply |
| `debugging` | A specific webhook is failing in production and you need to reproduce + diagnose it from logs |
| `documentation` | The task is writing a runbook or reference doc about webhook patterns |
| `refactor` | The task is restructuring the receiver code without changing the verification primitive itself |
