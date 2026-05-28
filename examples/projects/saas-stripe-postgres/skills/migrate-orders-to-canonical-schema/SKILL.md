---
schema_version: 8
name: migrate-orders-to-canonical-schema
description: "Use when running migration 0004 that normalizes the orders table from a Stripe-specific shape (stripe_session_id, stripe_customer_id as top-level columns) to a canonical provider-agnostic shape (provider, provider_order_id, provider_customer_id). Covers the four-phase safe migration procedure — add nullable columns, backfill from existing data, validate, drop legacy columns — and the RLS policy update that must accompany the column rename. Do NOT use for unrelated schema migrations (write a fresh skill anchored to that migration's number), for designing a new canonical schema from scratch, or for the ongoing orgQuery access pattern (use postgres-rls-pattern)."
version: 0.1.0
subject: code-engineering
deployment_target: project
taxonomy_domain: engineering/database
scope: "Four-phase orders-table migration for the saas-stripe-postgres example project — canonicalizes Stripe-specific column names to provider-agnostic names with RLS policy update."
owner: saas-stripe-postgres-example
freshness: "2026-05-18"
drift_check:
  last_verified: "2026-05-18"
eval_artifacts: none
eval_state: unverified
routing_eval: absent
stability: experimental
license: MIT
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "Postgres >=14; assumes psql or pg driver. Dry-run mode requires a non-production database."
allowed-tools: Read Grep Bash
keywords:
  - orders table migration
  - canonical schema migration
  - stripe to provider-agnostic
  - column rename migration
  - four-phase migration
  - add nullable backfill validate drop
  - provider_order_id migration
  - rls policy update on migration
  - 0004 orders migration
  - safe column removal
triggers:
  - migrate-orders-to-canonical-schema
paths:
  - "db/migrations/0004_canonicalize_orders.sql"
  - "db/schema.sql"
  - "scripts/migrate-orders.ts"
examples:
  - "run the 0004 orders migration that renames stripe_session_id to provider_order_id"
  - "safely remove the stripe_customer_id column after backfilling provider_customer_id"
  - "update the RLS policy on orders after the column rename"
  - "verify that every order row has a non-null provider_order_id before dropping the old column"
anti_examples:
  - "design a different migration for the invoices table"
  - "add row level security to a new table"
  - "query the orders table in an application route"
relations:
  boundary:
    - skill: postgres-rls-pattern
      reason: "postgres-rls-pattern defines the ongoing RLS access pattern; this skill owns the one-time migration that changes the table structure those policies reference"
    - skill: payment-provider-router
      reason: "payment-provider-router reads orders to check idempotency; this migration changes the column the idempotency check uses — coordinate migration timing with router deployment"
  depends_on:
    - skill: postgres-rls-pattern
      reason: "the canonical schema migration must update RLS policies — postgres-rls-pattern defines the policy triple to follow"
  verify_with:
    - postgres-rls-pattern
grounding:
  subject_matter: "Migration 0004 — the four-phase procedure that canonicalizes the orders table from Stripe-specific column names to provider-agnostic column names, with an RLS policy update in the same migration"
  grounding_mode: repo_specific
  truth_sources:
    - path: examples/projects/saas-stripe-postgres/db/migrations/0004_canonicalize_orders.sql
      note: "The migration file — source of truth for column renames and RLS policy updates"
    - path: examples/projects/saas-stripe-postgres/db/schema.sql
      note: "The target canonical schema the migration produces"
  failure_modes:
    - dropping_column_before_backfill_verified
    - rls_policy_not_updated_to_reference_new_column_name
    - application_code_still_references_old_column_after_drop
    - migration_run_without_dry_run_gate_first
    - rollback_path_not_documented_before_irreversible_step
  evidence_priority: repo_code_first
portability:
  readiness: scripted
  targets:
    - skill-md
project:
  - handle: saas-stripe-postgres
    role: primary
lifecycle:
  stale_after_days: 30
  review_cadence: quarterly
---

# Migrate Orders to Canonical Schema

## Coverage

- The four-phase safe migration procedure applied to the orders table: *add nullable columns → backfill from existing → validate → drop legacy columns*; why collapsing any two phases is unsafe under live traffic
- The canonical column mapping: `stripe_session_id` → `provider_order_id`, `stripe_customer_id` → `provider_customer_id`, with a new `provider` column set to `'stripe'` for existing rows
- The RLS policy update — the existing `orders_org_select` policy must be updated in the same migration that renames the columns if the policy references them (it does not in this case, but the checklist step prevents future drift)
- Application code audit — grepping for `stripe_session_id` and `stripe_customer_id` in the codebase to find every reference that must be updated before the old columns are dropped
- The dry-run gate — `scripts/migrate-orders.ts` runs in `--dry-run` by default, printing the diff without committing; `--apply` is the explicit opt-in

## Philosophy

A column rename under live traffic is a non-trivial operation even on a small table. The temptation to write one migration that renames columns atomically and ships them fails because application code reads the old column names until the new application version deploys, and the deployment window is not instant. The four-phase procedure exists because the new column can be null during the window, the application can write both, and the old column can be dropped only after the new application version has been running for a full observation period with zero reads of the old column name in logs.

## Workflow

| Phase | Precondition | Action | Success criterion |
|---|---|---|---|
| 1. Add nullable columns | Production schema has no `provider` or `provider_order_id` | Add `provider TEXT`, `provider_order_id TEXT`, `provider_customer_id TEXT` as nullable | Build passes; existing rows unaffected |
| 2. Backfill | Phase 1 deployed | `UPDATE orders SET provider = 'stripe', provider_order_id = stripe_session_id, provider_customer_id = stripe_customer_id WHERE provider IS NULL` | `SELECT COUNT(*) FROM orders WHERE provider IS NULL` returns 0 |
| 3. Validate and update application | Phase 2 complete | Search codebase for `stripe_session_id` and `stripe_customer_id` references; update to `provider_order_id` / `provider_customer_id`; deploy the updated application | Zero reads of old column names in production logs for 24 hours |
| 4. Drop legacy columns | Phase 3 observation period complete | `ALTER TABLE orders DROP COLUMN stripe_session_id, DROP COLUMN stripe_customer_id` | Schema matches `db/schema.sql`; `npm run verify` passes |

## Migration SQL

```sql
-- Phase 1: Add nullable canonical columns
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_customer_id TEXT;

-- Phase 2: Backfill from Stripe-specific columns
UPDATE orders
SET
  provider = 'stripe',
  provider_order_id = stripe_session_id,
  provider_customer_id = stripe_customer_id
WHERE provider IS NULL;

-- Phase 4 (only after Phase 3 observation period):
-- ALTER TABLE orders
--   DROP COLUMN stripe_session_id,
--   DROP COLUMN stripe_customer_id;
```

## Verification

- [ ] Phase 1 was deployed to production and verified (build passed, existing rows intact) before Phase 2 ran
- [ ] Phase 2 backfill was run with `--dry-run` first; the dry-run output is committed under `db/migrations/0004-dry-run.log`
- [ ] `SELECT COUNT(*) FROM orders WHERE provider IS NULL` returns 0 before Phase 3 begins
- [ ] Phase 3 application code audit found and updated every reference to `stripe_session_id` and `stripe_customer_id`
- [ ] The observation window (minimum 24 hours) elapsed with zero old-column reads in production logs before Phase 4 was run
- [ ] Phase 4 (DROP COLUMN) is in a separate migration file from Phases 1-2, deployed only after Phase 3 sign-off
- [ ] RLS policies were reviewed after the column rename (even if not updated — the review is recorded in the migration PR)

## Do NOT Use When

| Use instead | When |
|---|---|
| `postgres-rls-pattern` | The task is the ongoing RLS access pattern, not the one-time migration |
| (a fresh migration skill) | The task is a different migration with no relation to the 0004 orders canonicalization |
| `payment-provider-router` | The task is updating the router to use `provider_order_id` after the migration |
