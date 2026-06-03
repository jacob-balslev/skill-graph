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
- **Negative:** a large corpus migration (123 folder moves); `product-domain` rides at the floor pending recruitment.

## References
- [ADR-0017](0017-five-axis-classification-model.md) — the superseded 9-value model (five-axis shape retained).
- `schemas/SKILL_METADATA_PROTOCOL_schema.json` — the live 12-value enum.
- `skill-metadata-protocol/SKILL_METADATA_PROTOCOL.md` § Classification — the normative spec + disambiguation rules.
- `scripts/migrate-subject-reaxis-v9.js` — the one-time migration codemod (retired).
