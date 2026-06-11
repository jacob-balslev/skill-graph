---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: stripe-webhook-signature-verification
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when validating incoming Stripe webhook requests in a Node.js or Next.js backend before processing any payment event. Verifies the `stripe-signature` header against `STRIPE_WEBHOOK_SECRET` using Stripe's HMAC-SHA256 scheme, and rejects replays older than 300 seconds. Do NOT use for general HTTP signature validation (use a generic crypto-signature skill), for processing the webhook payload after signature is confirmed (use payment-provider-router), or for Stripe API calls that are not webhook-driven."

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
scope: "Verifying the authenticity of an incoming Stripe webhook via signature check before any processing in the saas-stripe-postgres example. Excludes routing the verified event (payment-provider-router) and the downstream database writes (postgres-rls-pattern)."
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
  notes: "Stripe SDK >=14; expects raw request body (not parsed JSON) for signature verification."
allowed-tools: Read Grep
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
keywords:
  - stripe webhook signature verification
  - stripe-signature header
  - webhook hmac verification
  - STRIPE_WEBHOOK_SECRET
  - stripe constructEvent
  - replay attack prevention
  - webhook security
  - payment webhook validation
  - stripe webhook secret
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - stripe-webhook-signature-verification
# paths: glob array of code surfaces this skill governs. Supports gitignore-style
# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.
paths:
  - "app/api/webhooks/stripe/route.ts"
  - "lib/stripe/webhook.ts"
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "how do I verify that a webhook is really from Stripe?"
  - "my webhook handler is returning 400 — is the signature verification failing?"
  - "set up the Stripe webhook endpoint in a Next.js App Router API route"
  - "reject replayed webhook events older than 5 minutes"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "process the Stripe payment_intent.succeeded event payload"
  - "call the Stripe API to create a payment intent"
  - "validate a generic HTTP signature that is not from Stripe"
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
    - payment-provider-router
    - nextjs-server-action-validation
  depends_on:
    - postgres-rls-pattern
  verify_with:
    - nextjs-server-action-validation
---

# Stripe Webhook Signature Verification

## Concept of the skill

**What it is:** The security check that proves an incoming Stripe webhook was signed by Stripe before any payment logic runs.
**Mental model:** The raw request body, signature header, and webhook secret form one verification tuple; change any part and the event is untrusted.
**Why it exists:** Webhook routes are public endpoints that can trigger billing and fulfillment, so authenticity has to be established before routing.
**What it is NOT:** It is not payment-event routing, general HTTP signature validation, or Stripe API usage outside webhook delivery.
**Adjacent concepts:** HMAC verification, raw request bodies, replay tolerance, idempotency keys.
**One-line analogy:** It is the seal check before opening the payment envelope.
**Common misconception:** Parsing JSON first is harmless; transforming the raw bytes invalidates the signature comparison.

## Coverage

- The raw-body requirement — why `stripe.webhooks.constructEvent()` requires the unparsed `Buffer` from the request body, and how Next.js App Router routes expose it via `request.arrayBuffer()`
- HMAC-SHA256 verification — how `constructEvent(rawBody, signature, secret)` reconstructs and compares the Stripe signature internally
- Replay protection — the 300-second tolerance window Stripe checks against the `t=` timestamp embedded in the `stripe-signature` header; when to tighten it
- Environment-specific secrets — `STRIPE_WEBHOOK_SECRET` for production vs `whsec_...` from the Stripe CLI `--forward-to` session in development; why they must never be swapped
- Idempotency key pattern — recording the `event.id` in Postgres before processing so a retried delivery does not double-charge or double-fulfill

## Philosophy of the skill

A webhook that skips signature verification is an unauthenticated public endpoint that can trigger payment processing. The verification step is load-bearing security, not a convenience check. Stripe's SDK makes verification a single call, but two failure modes are common in practice: the request body gets parsed (by a body-parser middleware) before the raw bytes reach the verification call, which silently corrupts the HMAC comparison; and the wrong webhook secret is loaded from environment variables, producing a 400 that is hard to distinguish from a replay rejection. Both failures look the same to the caller — a rejected webhook — and both are invisible until a real event is dropped.

## Verification

1. **Confirm raw body access.** In Next.js App Router: `const rawBody = Buffer.from(await request.arrayBuffer())`. Do NOT pass `await request.json()` or `await request.text()` — both transform the bytes.

2. **Retrieve and verify.**

   ```typescript
   import Stripe from "stripe";
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

   const sig = request.headers.get("stripe-signature") ?? "";
   let event: Stripe.Event;
   try {
     event = stripe.webhooks.constructEvent(
       rawBody,
       sig,
       process.env.STRIPE_WEBHOOK_SECRET!
     );
   } catch (err) {
     return Response.json({ error: "Signature verification failed" }, { status: 400 });
   }
   ```

3. **Check idempotency before processing.**

   ```sql
   INSERT INTO webhook_events (event_id, processed_at)
   VALUES ($1, now())
   ON CONFLICT (event_id) DO NOTHING
   RETURNING event_id;
   ```

   If the `RETURNING` clause returns no rows, the event was already processed — return 200 immediately without re-running side effects.

4. **Route the verified event** to `payment-provider-router`.

## Failure Mode Reference

| Failure | Symptom | Fix |
|---------|---------|-----|
| Body parsed before verification | 400 on every real Stripe event | Use `arrayBuffer()`, not `json()` or `text()` |
| Wrong webhook secret | 400 with "No signatures found matching the expected signature" | Verify `STRIPE_WEBHOOK_SECRET` matches the endpoint in the Stripe dashboard |
| Replay attack | 400 with "Timestamp too old" | Legitimate if tolerance is tight; check `t=` value in the `stripe-signature` header |
| Secret from wrong environment | Events verify in dev but fail in production | Use per-environment secrets; never share between environments |

## Do NOT Use When

| Use instead | When |
|---|---|
| `payment-provider-router` | You have a verified event and need to decide which handler processes it |
| `nextjs-server-action-validation` | You are validating user-submitted form data, not a Stripe webhook |
| (a generic HTTP signature skill) | You are verifying webhooks from a non-Stripe provider with a different signing scheme |
