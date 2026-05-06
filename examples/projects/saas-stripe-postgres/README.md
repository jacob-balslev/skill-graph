# Specimen Project — Next.js SaaS with Stripe + Postgres

> **Status:** Specimens, not a maintained starter pack.
>
> These five SKILL.md files are *illustrative*. They show what the Skill Graph contract looks like when applied to a recognizable real-world project (a Next.js SaaS with Stripe payments and PostgreSQL multi-tenancy). They are not production skills — the truth-source paths point at files that exist in a *hypothetical* adopter's project, not in this repository. If you adopt one of these specimens for your own library, copy the SKILL.md, replace the truth-source paths with your real ones, and re-record the drift baseline.

## What this directory demonstrates

The five specimens cover all four Skill Graph archetypes (`capability`, `workflow`, `router`) at all three relevant scopes (`codebase`, `portable`) and exercise the most-used contract features:

| Specimen | Archetype | Scope | What it uniquely demonstrates |
|---|---|---|---|
| [`stripe-webhook-signature-verification`](skills/stripe-webhook-signature-verification/SKILL.md) | `capability` | `codebase` | Codebase-grounded capability with full `grounding` block, hierarchical `category` (`ecommerce/integrations/stripe`), and pushy `description` activation language |
| [`postgres-rls-pattern`](skills/postgres-rls-pattern/SKILL.md) | `capability` | `codebase` | Five concrete `failure_modes`, demonstrating the value of enumerable failure categories the eval grader can target |
| [`nextjs-server-action-validation`](skills/nextjs-server-action-validation/SKILL.md) | `capability` | `portable` | The `portable` scope — repo-agnostic knowledge that does NOT need a `grounding` block (compare to the codebase-scoped specimens) |
| [`payment-provider-router`](skills/payment-provider-router/SKILL.md) | `router` | `codebase` | The `router` archetype with its required `## Routing Rules` section and the anti-default doctrine surfaced in the body |
| [`migrate-orders-to-canonical-schema`](skills/migrate-orders-to-canonical-schema/SKILL.md) | `workflow` | `codebase` | The `workflow` archetype with its required `## Workflow` section, plus a `relations.depends_on` declaration |

## The conceptual relationship graph

The five specimens form a graph in concept (read this as a domain map, not as their literal `relations` blocks — see the note below):

```
                        ┌─────────────────────────────────┐
                        │ migrate-orders-to-canonical-    │
                        │ schema (workflow)               │
                        │                                 │
                        │ depends conceptually on:        │
                        │   - postgres-rls-pattern        │
                        │     (the RLS step in workflow   │
                        │      step 4 needs the pattern   │
                        │      to be authored correctly)  │
                        └────────────┬────────────────────┘
                                     │
                                     │ (conceptual dependency)
                                     ▼
                  ┌───────────────────────────────────────┐
                  │ postgres-rls-pattern (capability)     │
                  │                                       │
                  │ Verifies the RLS contract for         │
                  │ tenant-scoped data isolation          │
                  └───────────────────────────────────────┘

   ┌──────────────────────────────────┐    ┌─────────────────────────────────┐
   │ stripe-webhook-signature-        │    │ payment-provider-router         │
   │ verification (capability)        │◀───│ (router)                        │
   │                                  │    │                                 │
   │ Owns the Stripe primitive        │    │ Dispatches to Stripe / PayPal / │
   └──────────────────────────────────┘    │ Adyen primitives by signature   │
                                           │ header inspection               │
                                           └─────────────────────────────────┘

   ┌──────────────────────────────────┐
   │ nextjs-server-action-validation  │   (portable — used by every page    │
   │ (capability)                     │    that mutates data via Server      │
   │                                  │    Actions; not specifically tied    │
   │ Validates form input at server   │    to payments or orders)            │
   │ action boundary                  │
   └──────────────────────────────────┘
```

## Note on `relations` in these specimens

The Skill Graph lint enforces that every target named in `relations.depends_on`, `relations.verify_with`, etc. resolves to a real skill in `<repo>/skills/`. These specimen skills live at `examples/projects/saas-stripe-postgres/skills/`, not in `<repo>/skills/`, so cross-specimen relations would fail lint.

To keep the specimens lint-clean, their `relations` blocks point at **real existing starter skills in this Skill Graph repository** (`testing-strategy`, `documentation`, `refactor`, `debugging`, `graph-audit`). The conceptual specimen-to-specimen relationships are documented in the diagram above and in each specimen's body prose. If you copy these specimens into a real adopter library where the sibling specimens are also present as production skills, you can additionally add cross-specimen `depends_on` entries — for example, `migrate-orders-to-canonical-schema` `depends_on: postgres-rls-pattern` — and lint will validate them.

## How to verify a specimen

```bash
# Lint a single specimen with --strict (zero warnings allowed)
node scripts/skill-lint.js --strict --skip-generator-parity \
  examples/projects/saas-stripe-postgres/skills/stripe-webhook-signature-verification/SKILL.md

# Lint all five specimens (one command per specimen)
for spec in stripe-webhook-signature-verification \
            postgres-rls-pattern \
            nextjs-server-action-validation \
            payment-provider-router \
            migrate-orders-to-canonical-schema; do
  echo "=== Linting $spec ==="
  node scripts/skill-lint.js --strict --skip-generator-parity \
    "examples/projects/saas-stripe-postgres/skills/$spec/SKILL.md"
done
```

`--skip-generator-parity` is needed because the manifest sample at `examples/skills.manifest.sample.json` is generated only from `skills/`, not from this specimen directory. The skip is intentional — these specimens are demonstrations, not production library entries.

## Adopting a specimen for your own library

1. Copy the SKILL.md from this specimen directory to your own `skills/<name>/SKILL.md`
2. Replace the `truth_sources` paths under `grounding` with the real file paths in your repository
3. Replace the `paths:` glob entries with globs that match your real directory layout
4. Update `owner` to your team handle
5. Re-record the drift baseline: `node scripts/skill-graph-drift.js --record --apply skills/<name>`
6. If you want to express cross-specimen dependencies as `relations.depends_on` (e.g., `migrate-orders → postgres-rls-pattern`), add them once the sibling specimens are also in your `skills/` directory

The specimens are MIT-licensed (per each SKILL.md frontmatter) so you can adapt them freely.
