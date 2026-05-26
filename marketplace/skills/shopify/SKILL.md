---
name: shopify
description: "Use when working with Shopify — Admin API, Storefront API, OAuth scopes, HMAC SHA-256 webhook verification, GraphQL query-cost handling, Online Store 2.0 themes (sections, blocks, Liquid), metafields and metaobjects, and App Proxy. Do NOT use for generic e-commerce design, non-Shopify storefronts, or internal event-contract design."
license: CC-BY-4.0
metadata:
  schema_version: "8"
  version: "1.0.0"
  type: capability
  operation: know
  category: engineering
  subject: product-domain
  domain: engineering/integrations
  scope: portable
  owner: skill-graph-maintainer
  freshness: "2026-05-12"
  drift_check: "{\"last_verified\":\"2026-05-12\"}"
  eval_artifacts: planned
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"shopify admin api\",\"shopify storefront api\",\"shopify webhooks\",\"shopify oauth scopes\",\"shopify hmac verification\",\"online store 2.0 sections\",\"liquid templates\",\"shopify graphql query cost\",\"shopify metafields\",\"shopify rate limits\"]"
  triggers: "[\"shopify\",\"shopify webhook\",\"shopify api\",\"shopify theme\",\"shopify app\"]"
  examples: "[\"Verify an incoming Shopify webhook by computing HMAC SHA-256 over the raw body and comparing against the X-Shopify-Hmac-Sha256 header\",\"Query the Shopify Admin GraphQL API for product variants with their metafields and handle query cost throttling\",\"Build an Online Store 2.0 section schema with block types and dynamic settings\"]"
  anti_examples: "[\"Design the event payload schema for our internal order-processing pipeline\",\"Implement Stripe Connect onboarding for a marketplace\",\"Refactor a generic shopping cart component that isn't Shopify-specific\"]"
  relations: "{\"related\":[\"webhook-integration\",\"api-design\",\"printify\"],\"boundary\":[{\"skill\":\"webhook-integration\",\"reason\":\"webhook-integration covers vendor-agnostic delivery, retries, and signing; this skill handles Shopify's specific topic names, X-Shopify-* header contract, and the 5-second response deadline before retry.\"},{\"skill\":\"event-contract-design\",\"reason\":\"Hand off to event-contract-design when modeling internal events downstream of Shopify webhooks — the contract surface there is your own system, not Shopify's.\"}]}"
  structural_verdict: UNVERIFIED
  truth_verdict: UNVERIFIED
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_protocol: Skill Metadata Protocol v7
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/product-domain/shopify/SKILL.md
---

# Shopify

## Coverage
Shopify exposes four primary integration surfaces: the Admin API (REST and GraphQL, used by apps acting on the merchant's behalf), the Storefront API (GraphQL, customer-facing, unauthenticated by default with a public access token), themes (Liquid templating plus Online Store 2.0 JSON templates with sections and blocks), and webhooks (signed event delivery over HTTPS). Each surface has distinct authentication, rate-limit, and versioning rules. This skill covers all four and the seams between them.

Authentication for public apps follows OAuth 2.0 authorization code flow: the merchant approves a comma-separated scope list (read_products, write_orders, etc.), the app receives a permanent offline access token, and that token is sent as the X-Shopify-Access-Token header. Webhooks are verified by computing HMAC SHA-256 over the raw request body using the app's API secret key (for app-managed webhooks) or the shop's webhook signature key (for shop-managed webhooks) and base64-comparing against the X-Shopify-Hmac-Sha256 header. The webhook handler must respond with 2xx within five seconds or Shopify retries with exponential backoff for up to 48 hours before disabling the subscription.

Rate limits differ per surface. REST Admin API uses a leaky-bucket model — 40 requests with a 2/sec leak rate on standard plans, 80/4 on Shopify Plus. GraphQL Admin API uses a query-cost model: each request is scored before execution (1000-point bucket, 50/sec leak), and the response includes extensions.cost with actualQueryCost and throttleStatus so the client can pace itself. The Storefront API has separate, more generous limits. Online Store 2.0 themes organize content into sections (reusable, merchant-configurable blocks defined in JSON schema) and templates (JSON files referencing sections), replacing the older static Liquid-include model.

Metafields and metaobjects extend native resources with typed custom data. Metafields attach to a parent resource (product, variant, customer, order, etc.) with a namespace.key path and a defined type (single_line_text_field, number_integer, json, file_reference, metaobject_reference, etc.). Metaobjects are standalone typed records and are queryable via GraphQL like first-class resources. App Proxy routes a path on the merchant's storefront domain to the app's backend with a signed query string, enabling authenticated storefront experiences without CORS.

## Philosophy
Shopify's APIs are explicit about cost and explicit about contract. The query-cost model, the HMAC requirement, the five-second webhook deadline, and the API versioning calendar (one stable version per quarter, four supported simultaneously) all push toward integrations that observe their own load and respond to drift rather than assume forever-availability. Treat each surface's contract as load-bearing: don't catch HMAC failures and proceed, don't skip query-cost inspection, don't pin to a soon-to-be-unsupported API version.

The theme surface and the API surface should remain separable. Online Store 2.0 lets merchants customize themes without code; an app that imposes UI through Liquid edits will conflict with merchant theme updates and theme-store apps. Prefer App Blocks and App Embeds (theme app extensions) over Liquid injection wherever the integration needs to render storefront UI.

## Verification
- The webhook handler computes HMAC SHA-256 over the raw, undecoded request body — not the parsed JSON — and uses a constant-time comparison against the header value.
- OAuth scopes requested match scopes actually used. Audit by listing every API endpoint called and confirming the minimum scope per the Shopify REST Admin API reference.
- GraphQL Admin clients read extensions.cost.throttleStatus on every response and back off when currentlyAvailable drops below the next expected query cost.
- The integration declares a target API version (e.g., 2026-01) and a planned upgrade path; calls without an explicit version pin fall back to the oldest supported version and break unpredictably.
- Webhook subscriptions are recreated on app reinstall — uninstall deletes them. The install flow re-registers all required topics.
- For theme app extensions, blocks are testable in the merchant's theme editor and respect the merchant's existing section group layout.

## Do NOT Use When
- The integration target is a generic e-commerce platform (WooCommerce, BigCommerce, Magento, custom). Use the platform-specific skill or api-design for a vendor-neutral approach.
- You are designing internal event contracts that happen to be triggered by Shopify webhooks — the contract surface is yours. Use event-contract-design.
- The task is generic webhook signing and retry semantics across multiple providers. Use webhook-integration.
- The work is product strategy, merchandising, or marketing for a Shopify store rather than technical work on the platform.
- You are building a storefront UI component that does not touch Shopify APIs or themes directly. Use frontend-architecture or design-module-composition.
