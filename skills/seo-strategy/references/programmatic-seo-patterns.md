# Programmatic SEO Patterns

> Type: Reference — template-based page generation at scale

## Comparison Pages

URL: `/compare/[product-a]-vs-[product-b]`

Template sections:
1. Overview paragraph (unique per comparison)
2. Feature comparison table (structured data from product DB)
3. Pricing comparison (dynamic from pricing data)
4. Pros/cons for each (must be genuinely different, not swapped)
5. Use case recommendations ("Choose A if..., Choose B if...")
6. FAQ section (3-5 unique questions per comparison)

Guardrails:
- Each comparison MUST have unique overview and recommendation text
- Feature table data must come from verified sources
- Never auto-generate pros/cons by inverting — write genuine assessments
- Minimum 500 words of unique content per page

## Integration Pages (Zapier/HubSpot model)

URL: `/integrations/[platform-name]`

Template sections:
1. Integration overview (what the integration does)
2. Setup steps (with screenshots)
3. Use cases (2-3 per integration)
4. Related integrations
5. FAQ

## Location Pages

URL: `/[service]-in-[city-state]`

Template sections:
1. City-specific introduction (population, market context)
2. Service description adapted to local context
3. Local statistics or data points (genuinely unique per city)
4. Customer testimonials from that area (if available)
5. Local FAQ

Thin content risk: Location pages are the most common programmatic SEO penalty trigger. Every page must have genuinely unique data — not just city name swapped.

## Alternative Pages

URL: `/alternatives/[competitor-name]`

Template sections:
1. Why people look for alternatives
2. Feature comparison table
3. Your product as an alternative (honest assessment)
4. Other alternatives (yes, include competitors — builds trust)
5. Migration guide (if applicable)
