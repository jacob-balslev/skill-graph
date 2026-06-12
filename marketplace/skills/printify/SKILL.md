---
name: printify
description: "Use when working with Printify — the print-on-demand REST API, catalog model (blueprints, print providers, variants, print areas), product creation and publish lifecycle to connected channels, order routing, shipping cost queries, and HMAC SHA-256 webhook verification. Do NOT use for non-Printify POD vendors, generic Shopify storefront work, or print-file (artwork) generation. Do NOT use for Generate the artwork PNG file that gets uploaded as a print file. Do NOT use for Implement the Shopify side of the Printify-to-Shopify sync. Do NOT use for Design a generic POD-vendor-agnostic product schema."
license: CC-BY-4.0
metadata:
  relations: "{\"related\":[\"webhook-integration\",\"api-design\",\"shopify\"],\"suppresses\":[\"shopify\"]}"
  subject: product-domain
  public: "true"
  scope: "Use when working with Printify — the print-on-demand REST API, catalog model (blueprints, print providers, variants, print areas), product creation and publish lifecycle to connected channels, order routing, shipping cost queries, and HMAC SHA-256 webhook verification. Do NOT use for non-Printify POD vendors, generic Shopify storefront work, or print-file (artwork) generation."
  subjects: "[\"product-domain\",\"backend-engineering\"]"
  taxonomy_domain: engineering/integrations
  stability: experimental
  keywords: "[\"printify api\",\"print on demand\",\"printify blueprints\",\"printify print providers\",\"printify publish lifecycle\",\"printify webhooks\",\"printify variants\",\"printify shipping costs\",\"printify order routing\",\"print provider catalog\"]"
  triggers: "[\"printify\",\"printify api\",\"printify webhook\",\"print on demand\"]"
  grounding: "{\"subject_matter\":\"Printify API catalog, product publish lifecycle, orders, shipping, and webhook verification\",\"grounding_mode\":\"universal\",\"truth_sources\":[\"https://developers.printify.com/\",\"https://developers.printify.com/#catalog\",\"https://developers.printify.com/#products\",\"https://developers.printify.com/#orders\",\"https://developers.printify.com/#shipping\",\"https://developers.printify.com/#webhooks\"],\"failure_modes\":[\"blueprint_and_print_provider_treated_as_independent_variant_spaces\",\"publish_request_treated_as_synchronous_channel_success\",\"webhook_signature_verified_from_parsed_json_instead_of_raw_body\",\"shipping_cost_estimate_treated_as_final_order_cost\",\"shopify_sync_boundary_misrouted_to_printify_skill\",\"artwork_generation_misclassified_as_printify_api_work\"],\"evidence_priority\":\"general_knowledge_first\"}"
  examples: "[\"Create a Printify product from a blueprint + print provider + variant set and publish it to a connected Shopify store\",\"Handle a Printify order:updated webhook and reconcile fulfillment status\",\"Resolve shipping cost for a basket of Printify variants given a destination country\"]"
  anti_examples: "[\"Generate the artwork PNG file that gets uploaded as a print file\",\"Implement the Shopify side of the Printify-to-Shopify sync\",\"Design a generic POD-vendor-agnostic product schema\"]"
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/product-domain/printify/SKILL.md
  skill_graph_export_description_projection: anti_examples
---
# Printify

## Concept of the skill

Use when working with Printify — the print-on-demand REST API, catalog model (blueprints, print providers, variants, print areas), product creation and publish lifecycle to connected channels, order routing, shipping cost queries, and HMAC SHA-256 webhook verification.

## Coverage
The Printify REST API exposes a catalog (blueprints — abstract product templates like "Unisex Heavy Cotton Tee"; print providers — fulfillment partners who manufacture a given blueprint; variants — concrete color/size combinations a provider offers for a blueprint), shops (connected sales channels: Shopify, Etsy, WooCommerce, eBay, TikTok, custom API), products (a blueprint + print provider + variant selection + print areas + images, owned by a Printify shop), and orders (created either by sync from a connected channel or directly via API for merchant-fulfilled flows). This skill covers the relationships between these resources and the lifecycle transitions that move a product from draft to published to live on a storefront.

Authentication is a personal access token in the Authorization: Bearer header. The API is versioned via URL path (currently /v1/) and rate-limited globally with documented limits per endpoint family — product creation is more constrained than read calls. Image uploads go through a dedicated upload endpoint that accepts either a public URL or base64 contents and returns an image ID referenced by subsequent product-create payloads.

The publish lifecycle is a two-step asynchronous operation. POST to /products marks a product as ready for publish in Printify; the actual push to the connected channel (e.g., creating the Shopify product) happens via /products/{id}/publish which returns immediately and resolves asynchronously. The channel push can fail independently (channel auth expired, blueprint not available in the target region) and must be observed via the publishing-succeeded / publishing-failed webhook events or by polling the product publish status. Unpublish and delete each have their own semantics — unpublish removes from the channel but keeps the product in Printify; delete removes both.

Webhooks deliver order, product, and shop events. Each delivery includes an X-Pfy-Signature header computed as HMAC SHA-256 over the raw body with the webhook secret returned on subscription. Order events (order:created, order:updated, order:sent-to-production, order:shipment:created, order:shipment:delivered, order:cancelled) carry the full order payload including line items with print provider, shipping cost, and tracking. Shipping cost can also be computed pre-purchase via /shops/{shop_id}/orders/shipping.json with a destination address and line items.

## Philosophy of the skill
Printify sits between the merchant and the print provider, and its catalog reflects that — a blueprint's available variants and print areas are determined by the print provider, not by Printify. The same blueprint produced by two providers can have different color availability, different print area dimensions, and different shipping profiles. Integrations should treat blueprint + print_provider as a composite key and never assume that variants are portable across providers.

The publish lifecycle is asynchronous and partially observable. Treat publish success as a separate state from product-create success, and reconcile via webhooks rather than optimistic UI. Costs (product cost, shipping cost) are determined at order-create time by Printify and can differ from any pre-quoted estimate; the order webhook payload is the source of truth for actual cost.

## Verification
- Webhook signature verification computes HMAC SHA-256 over the raw body bytes with the per-subscription secret and uses constant-time comparison against the X-Pfy-Signature header.
- Product creation supplies a valid (blueprint_id, print_provider_id) pair from the print provider's variant list — invalid pairs return 400 with the unsupported variant ID, not a generic error.
- Publish status is reconciled via the publishing-succeeded webhook before the product is marked live in the integrating system; status defaults to pending and stays there if the webhook is missed.
- Image uploads complete and return an image ID before the product-create call references it; race conditions return 404 on the image reference.
- Shipping cost queried via /shipping.json uses the same address fields the order will eventually carry; mismatched country/region codes silently route to default shipping profiles.
- Order webhooks are idempotent at the consumer — the same event ID can be delivered more than once on retry.

## Do NOT Use When
- The print-on-demand vendor is Printful, Gelato, CustomCat, or any non-Printify provider. Each has a different catalog model, signing scheme, and publish lifecycle.
- The task is generating the print artwork itself (PNG/SVG creation, DPI handling, color-profile conversion). That is a graphics-generation task, not a Printify task.
- You are working on the Shopify-side of a Printify→Shopify sync (theme display, Shopify product overrides). Use the shopify skill.
- The work is vendor-agnostic webhook plumbing (retry, dead-letter, signing-key rotation across many providers). Use webhook-integration.
- You are designing the merchant's internal order schema. Use event-contract-design.

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `product-domain` (also: `backend-engineering`)
- Public: `true`
- Domain: `engineering/integrations`
- Scope: Use when working with Printify — the print-on-demand REST API, catalog model (blueprints, print providers, variants, print areas), product creation and publish lifecycle to connected channels, order routing, shipping cost queries, and HMAC SHA-256 webhook verification. Do NOT use for non-Printify POD vendors, generic Shopify storefront work, or print-file (artwork) generation.

**When to use**
- Create a Printify product from a blueprint + print provider + variant set and publish it to a connected Shopify store
- Handle a Printify order:updated webhook and reconcile fulfillment status
- Resolve shipping cost for a basket of Printify variants given a destination country
- Triggers: `printify`, `printify api`, `printify webhook`, `print on demand`

**Not for**
- Generate the artwork PNG file that gets uploaded as a print file
- Implement the Shopify side of the Printify-to-Shopify sync
- Design a generic POD-vendor-agnostic product schema

**Related skills**
- Related: `webhook-integration`, `api-design`, `shopify`

**Grounding**
- Mode: `universal`
- Truth sources: `https://developers.printify.com/`, `https://developers.printify.com/#catalog`, `https://developers.printify.com/#products`, `https://developers.printify.com/#orders`, `https://developers.printify.com/#shipping`, `https://developers.printify.com/#webhooks`

**Keywords**
- `printify api`, `print on demand`, `printify blueprints`, `printify print providers`, `printify publish lifecycle`, `printify webhooks`, `printify variants`, `printify shipping costs`, `printify order routing`, `print provider catalog`

<!-- skill-graph-context:end -->
