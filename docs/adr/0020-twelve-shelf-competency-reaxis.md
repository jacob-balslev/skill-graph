# ADR-0020: Twelve-Shelf Competency Re-Axis (`subject` enum)

> Status: Accepted (2026-06-03)
> Supersedes the 9-value `subject` enum decided in [ADR-0017](0017-five-axis-classification-model.md) (the rest of ADR-0017 — the five-axis model shape, `deployment_target`, free-text `scope`, `subjects[]` polyhierarchy, `taxonomy_domain` — stands).
> Schema/contract shape unchanged: this changes the enum **values** of `subject`, not the field set or `schema_version`. Per [AGENTS.md § Version Labels Are Earned, Not Bumped](../../AGENTS.md), an enum-value change is not a `schema_version` bump.

## Context

A 2026-06-03 census of the live 165-skill corpus (subject × `taxonomy_domain`) found the 9-value `subject` shelf — derived in ADR-0017 — had decayed into a structure whose shelves contradicted the skills' own `taxonomy_domain` self-assignments:

- **`data-analytics` (3) was a phantom.** None of its members was data-analytics: `observability-modeling` self-tagged `engineering/observability`; `performance-budgets`/`performance-engineering` self-tagged `quality/performance`. The shelf's named purpose (data viz / analytics / financial display) had zero members.
- **`product-domain` (11) was an engineering sink.** 6 of 11 self-tagged `engineering/*` or `architecture/*` (`api-design`, `http-semantics`, `route-handler-design`, `event-contract-design`, `real-time-updates`, `webhook-integration`). Only the vendor-integration skills were genuine verticals.
- **"design" was split** across `design-craft` and `frontend-ui` (the latter held `design/*` skills).
- **`meta-methods` (21) conflated** cognitive reasoning with business/market strategy.
- **`ai-engineering` and `software-architecture` were real clusters** (per `taxonomy_domain`) buried inside `code-engineering` and scattered across `frontend-ui`/`quality-assurance`.

Grouping skills by an abstract competency axis is sound; the specific 9 values had drifted from the corpus's natural structure. The library's public identity is **AI-agentic web development** (while remaining a general library), which makes burying AI-feature-building and architecture craft inside a generic `code-engineering` bucket a positioning failure as well as a MECE failure.

## Decision

Replace the 9-value `subject` enum with a **12-value enum** organized on one principle — **the competency the skill teaches ("what does this teach you to do?")** — in 3 navigational bands:

**Band A — software & web engineering:** `backend-engineering` · `frontend-engineering` · `software-architecture` · `data-engineering`
**Band B — AI-agentic:** `agent-ops` (the agent *runtime*) · `ai-engineering` (LLM *features in a product*)
**Band C — cross-cutting craft:** `quality-assurance` · `design` · `reasoning-strategy` · `software-engineering-method` · `knowledge-organization` · `product-domain`

Derivations from the 9: `code-engineering` → split into `backend-engineering` + `software-architecture` + `data-engineering`; `frontend-ui` → `frontend-engineering` (impl) with its `design/*` members moving to `design`; `design-craft` → `design`; `meta-methods` → split into `reasoning-strategy` (thinking + business strategy) + `software-engineering-method` (engineering process discipline); `agent-ops` → split into `agent-ops` (runtime) + `ai-engineering` (features); `data-analytics` → **retired**; `product-domain` → **shrunk to genuine vendor verticals**.

### Per-shelf primary counts (post-migration, 165 skills)

quality-assurance 25 · design 22 · reasoning-strategy 21 · frontend-engineering 16 · software-engineering-method 15 · backend-engineering 12 · software-architecture 12 · ai-engineering 11 · agent-ops 10 · data-engineering 9 · knowledge-organization 9 · product-domain 3.

All shelves sit inside the 5–25 balance rule except `product-domain` (3) — see the floor-exception below.

### `product-domain` floor-exception (3) — why this is NOT a repeat of the `data-analytics` phantom

`product-domain` holds `etsy`, `shopify`, `printify` (each `[product-domain, backend-engineering]` polyhierarchy). It is below the 5-skill floor but is **kept**, on a distinction the phantom failed:

- `data-analytics`'s 3 members were **mislabeled** — they belonged on other shelves and were moved there. The shelf had no genuine content and no growth path.
- `product-domain`'s 3 members are **genuine external-vertical content** with no better home (platform-specific integration playbooks are not generic backend craft), AND a real growth path: the library explicitly hosts domain verticals (e.g. ecommerce, and future ones like tax-return skills).

Recruit `product-domain` to ≥5 genuine verticals, or fold it via a follow-up ADR if the growth path does not materialize. Retiring it now would force vendor skills into `backend-engineering` and lose the vertical browse shelf the identity needs.

## Disambiguation contract (apply in order — replaces ADR-0017's rules)

1. **Primary surface, not enablement** — classify by what it is *about*, not what it enables.
2. **Property vs construction vs shape** — verify-a-property → `quality-assurance`; build-the-artifact → the engineering/design/AI shelf; choose-the-shape-first → `software-architecture`.
3. **Runtime vs feature (AI split)** — operate the agent harness → `agent-ops`; build an LLM capability into a product → `ai-engineering`. Tie-break: "exists with no product UI?" yes → `agent-ops`.
4. **Build-method vs generic-reasoning** — engineering process discipline → `software-engineering-method`; any-domain thinking/business framework → `reasoning-strategy`.
5. **Meaning vs data vs system (modeling triage)** — vocabulary/meaning → `knowledge-organization`; stored data → `data-engineering`; system boundaries/contracts → `software-architecture`.
6. **Design-craft vs front-end-impl** — visual/UX/interaction/research/content → `design`; design-to-framework-code → `frontend-engineering`.
7. **product-domain gate (anti-sink)** — only genuine external product/market verticals; an engineering primitive is never `product-domain` because a product uses it.
8. **meta gates (anti-junk-drawer)** — do not default to `reasoning-strategy` / `software-engineering-method` / `knowledge-organization` when the skill is really about building or verifying something concrete.
9. **Multi-fit** — legitimate two-shelf skills set `subjects: [primary, secondary]` (max 2); the secondary widens browse, never changes the primary or the on-disk folder. Non-subject adjacency → `relations.related`.
10. **New-value gate** — propose a 13th subject only via ADR with ≥5 primary-fit skills that fail rules 1–9.

## Migration

A one-time codemod (`scripts/migrate-subject-reaxis-v9.js`, retired after this migration per [§ Major Version Is a Clean Cut](../../AGENTS.md)) encoded the reviewed per-skill mapping and applied it to the canonical library: 123 skills changed shelf (frontmatter `subject` + `git mv` of the folder, since the folder mirrors `subject` 1:1), 8 reviewed hedges received a `subjects: [primary, secondary]` polyhierarchy, 39 were already correct. SYSTEM artifacts regenerated in the same sweep: schema + manifest schema enums, `check-schema-constants.js` SPEC, the sample manifest's subject values, `field-reference.generated.md`, `docs/status.generated.md`, the marketplace export, and the SYSTEM fixtures/unit tests. `npm run verify:system` green.

### Reviewed hedges (`subjects[]`)
`agent-engineering` [software-architecture, ai-engineering] · `information-architecture` [design, knowledge-organization] · `generative-ui` [frontend-engineering, ai-engineering] · `observability-modeling` [data-engineering, quality-assurance] · `shopify`/`printify` [product-domain, backend-engineering] · `seo-strategy` [quality-assurance, product-domain] · `webhook-integration` [backend-engineering, product-domain].

## Consequences

- **Positive:** every shelf answers one question; `ai-engineering` + `software-architecture` are first-class for the AI-agentic-web-dev identity; no phantom or sink shelf; `subject` and `taxonomy_domain` stop contradicting each other.
- **Follow-up (CONTENT, via the audit loop):** re-shelving created cross-shelf `relations.boundary` edges (a boundary edge is a same-shelf exclusion guard) and left `taxonomy_domain` sub-paths un-normalized under the new shelves. Both are per-skill `relations`/`taxonomy_domain` cleanup for `/audit:*`, not schema violations.
- **Negative:** a large corpus migration (123 folder moves); `product-domain` rides at the floor pending recruitment — **resolved in favour of recruit, see the Addendum below (SKI-293).**

## Addendum — 2026-06-07: `product-domain` recruit-or-fold resolved → **RECRUIT** (SKI-293)

The floor-exception above left `product-domain` on a conditional ("recruit to ≥5 genuine verticals, or fold via a follow-up ADR if the growth path does not materialize"). This addendum resolves that conditional.

**Corrected facts.** SKI-293's framing said "3 skills, all Printify." That is inaccurate. The shelf holds **3 primary members spanning 3 distinct vendors** — `etsy`, `shopify`, `printify` — not a single-vendor cluster. It also has **2 polyhierarchy secondaries** that already browse under it via `subjects[]`: `seo-strategy` `[quality-assurance, product-domain]` and `webhook-integration` `[backend-engineering, product-domain]`. So the effective browse population of the shelf is 5; only the *primary* count (3) sits below the 5-skill floor.

**Decision: RECRUIT — keep the shelf, do not fold.** The fold path is explicitly rejected. Rationale (the same distinction that justified keeping the shelf over retiring it like the `data-analytics` phantom):

1. **Genuine vertical content with no better home.** Platform-specific integration playbooks (`etsy`/`shopify`/`printify`) are not generic backend craft. Folding them into `backend-engineering` would violate the disambiguation contract's rule 7 (the product-domain gate exists precisely so genuine external verticals are not dissolved into engineering primitives), and would lose the vertical browse axis.
2. **The library's identity needs a vertical shelf.** The public positioning is AI-agentic web development hosting domain verticals (ecommerce now; future verticals such as tax/VAT-return skills). Retiring the only vertical shelf is a positioning regression, not a MECE win.
3. **The growth path is concrete, not hypothetical** (this is what `data-analytics` lacked). Named recruit pipeline — each candidate a genuine external product/market vertical that passes rule 7: additional ecommerce platforms (`woocommerce`, `bigcommerce`, `amazon-selling-partner`), payments/billing domain (`stripe-billing`), and tax/compliance verticals (`vat-oss`, `eu-vat-returns`). Authoring any **two** of these brings the primary count to the ≥5 floor.

**Floor-review trigger.** This recruit decision is reviewed if the shelf's **primary** count has not reached ≥5 by the next 12-shelf balance census (the recurring `subject`-distribution audit). If the growth path has not materialized by then, a fold follow-up ADR moves `etsy`/`shopify`/`printify` to `backend-engineering` (with a `subjects: [backend-engineering, product-domain]` note) and retires the shelf. Until that trigger fires, `product-domain` stays as a kept floor-exception.

**Execution is CONTENT-mode (filed, not done here).** Authoring the recruit-pipeline vertical skills is CONTENT work that flows through skill creation / `/audit:*` against the current contract — it is **not** performed in this SYSTEM commit and no `SKILL.md` is edited here. This addendum *is* the recorded decision (AC: "decision recorded; shelf at floor or folded" → shelf kept at floor with an explicit recruit commitment + a review trigger).

## References
- [ADR-0017](0017-five-axis-classification-model.md) — the superseded 9-value model (five-axis shape retained).
- `schemas/SKILL_METADATA_PROTOCOL_schema.json` — the live 12-value enum.
- `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` § Classification — the normative spec + disambiguation rules.
- `scripts/migrate-subject-reaxis-v9.js` — the one-time migration codemod (retired).
