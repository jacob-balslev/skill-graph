---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: migrate-orders-to-canonical-schema
description: "Use when migrating the legacy `orders` table to the canonical multi-tenant schema — adding `org_id`, backfilling from the customer→org join, applying NOT NULL after backfill, and enabling RLS on the new column. Activate this skill whenever the task references migration `0042_add_org_id`, the canonical-orders refactor, or asks how to safely add a NOT NULL tenant column to a populated table without taking writes offline. Do NOT use for unrelated migrations (use a generic migration skill or write a fresh one) or for general Postgres RLS pattern questions (use postgres-rls-pattern)."
version: 0.1.0
type: workflow
browse_category: data
category: ecommerce/data/migrations
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
    - postgres
  notes: "PostgreSQL 14+; assumes Drizzle, Prisma, or raw SQL migration runner with transaction support"
allowed-tools: Read Grep Bash
keywords:
  - migrate orders
  - canonical schema migration
  - add org_id column
  - 0042_add_org_id
  - backfill org_id
  - not null backfill
  - safe migration not null
  - migration with rls
  - rls after backfill
  - tenant column migration
triggers:
  - migrate-orders-to-canonical-schema
paths:
  - "db/migrations/0042_add_org_id.sql"
  - "db/migrations/0043_*_orders_*.sql"
  - "scripts/migrate-orders.ts"
examples:
  - "run the canonical-orders migration on a populated production-shape DB without downtime"
  - "the 0042 migration's backfill is taking longer than expected — what's safe to do?"
  - "verify that `0042_add_org_id` left every row with a non-null org_id before applying the NOT NULL"
  - "design migration 0043 to drop the legacy `customer_email` column now that org_id is canonical"
anti_examples:
  - "review my RLS policy on the orders table"                  # postgres-rls-pattern owns the policy primitive
  - "the migration is failing in CI — what's wrong?"             # debugging owns specific failure reproduction
  - "write the canonical orders schema doc for new engineers"    # documentation owns durable prose
relations:
  boundary:
    - skill: documentation
      reason: "documentation writes prose explaining the schema migration; this workflow is the procedural enforcement"
    - skill: debugging
      reason: "debugging chases a specific migration failure from logs; this workflow is the pre-failure procedure"
    - skill: refactor
      reason: "refactor changes code shape with no behavior change; a schema migration changes the data contract — different problem, different gates"
  verify_with:
    - testing-strategy
  depends_on:
    - skill: testing-strategy
      min_version: "^1.0.0"
grounding:
  domain_object: "The `0042_add_org_id` orders-table canonical-schema migration — a multi-step procedure that adds, backfills, NOT-NULL-applies, and RLS-enables a tenant column on a populated table"
  grounding_mode: repo_specific
  truth_sources:
    - db/migrations/0042_add_org_id.sql
    - scripts/migrate-orders.ts
    - db/policies/orders_rls.sql
  failure_modes:
    - not_null_applied_before_backfill_complete
    - backfill_query_holds_long_lock
    - rls_enabled_before_backfill_leaves_orphan_rows_invisible
    - rollback_step_drops_data_instead_of_reverting_constraint
    - migration_runs_outside_transaction_partial_failure
  evidence_priority: repo_code_first
portability:
  readiness: scripted
  targets:
    - agent-skills
project_tags:
  - saas
  - postgres
  - multi-tenant
lifecycle:
  stale_after_days: 30
  review_cadence: quarterly
---

# Migrate Orders to Canonical Schema

## Coverage

- The four-phase pattern for adding a NOT NULL tenant column to a populated table — `add nullable → backfill → verify → apply NOT NULL` — and why collapsing any two phases into one is unsafe
- The backfill query — joining `orders → customers → customer_org_memberships` to derive `org_id` for every row, with batch sizing chosen to avoid long locks
- The verification gate between backfill and NOT NULL — counting NULL rows must return 0 before the constraint is applied; without the gate, the migration leaves the table in a state where some rows pass NOT NULL and some don't
- The interaction with RLS — enabling `FORCE ROW LEVEL SECURITY` before the backfill is complete leaves orphan rows invisible to every query (including the migration runner's own re-check)
- The rollback path — what `ROLLBACK_PLAN.md` for this migration looks like and why "drop the column" is wrong (loses data); the correct rollback removes the constraint, not the column
- The CI dry-run pattern — running the migration against a production-shape staging dataset and asserting end-state row counts, NULL counts, and policy-eval counts before promoting to production

## Philosophy

A schema migration on a populated tenant column is the rare migration where being careful is cheaper than being clever. The temptation to combine the four phases into one "atomic" SQL block fails in production because the backfill takes longer than the lock window allows, the migration runner times out, and the rollback path is then ambiguous (was the NOT NULL applied? are some rows backfilled and others not?). The four-phase pattern is verbose but unambiguous: each phase has a clear success criterion, each phase can be re-run safely, and the rollback at any phase is well-defined. Pay the verbosity cost; the alternative is an incident.

## Workflow

Each step has a clear precondition and a clear success criterion. Do not skip steps; the steps exist because skipping them is how migrations corrupt data.

| Step | Precondition | Action | Success criterion |
|---|---|---|---|
| 1. Add nullable column | The table has no `org_id` column | `ALTER TABLE orders ADD COLUMN org_id uuid NULL` (no constraint, no default) | The column exists and is NULL for every existing row; new rows from the application can still INSERT (the application has been updated to populate it) |
| 2. Backfill | Step 1 success; the application is writing `org_id` on new rows | Run `scripts/migrate-orders.ts` which joins orders→customers→customer_org_memberships in batches of 1000, updating `org_id` per batch | Verification query `SELECT count(*) FROM orders WHERE org_id IS NULL` returns 0 |
| 3. Apply NOT NULL | Step 2 verification returned 0 | `ALTER TABLE orders ALTER COLUMN org_id SET NOT NULL` | The constraint is in place; subsequent INSERTs without `org_id` fail at the database |
| 4. Enable RLS | Step 3 is committed | Apply `db/policies/orders_rls.sql` and run `ALTER TABLE orders ENABLE ROW LEVEL SECURITY; ALTER TABLE orders FORCE ROW LEVEL SECURITY` | The cross-org leak test in `__tests__/security/cross-org-leak.test.ts` passes against a fresh seeded DB |

### When to back out

- Step 2 backfill query times out or holds locks for >5 seconds → reduce batch size, retry; the migration is still safe to resume from the same checkpoint
- Step 3 fails because the verification was wrong (some rows still NULL) → do NOT force the constraint; return to step 2, find and backfill the orphans, re-verify
- Step 4 enables RLS but the cross-org leak test fails → the policy is wrong, not the migration; revert step 4 by `DISABLE ROW LEVEL SECURITY` and re-author the policy with `postgres-rls-pattern`

## Verification

- [ ] Step 1 added the column as `NULL` (not `NOT NULL`) and without a default value
- [ ] The application code path that writes new orders has been updated to populate `org_id` BEFORE step 1 ran in production
- [ ] Step 2's verification query (`SELECT count(*) FROM orders WHERE org_id IS NULL`) returned 0 BEFORE step 3 ran
- [ ] Step 3 was applied in its own committed migration, separate from step 2's data manipulation
- [ ] Step 4 was applied AFTER step 3 — never before, because RLS-on-a-nullable-column makes orphan rows invisible to the verification query itself
- [ ] The rollback path in `ROLLBACK_PLAN.md` does NOT include `DROP COLUMN org_id` — that loses the backfilled data
- [ ] The CI dry-run against a production-shape staging dataset has been performed and the row counts at each step match the recorded baseline

## Do NOT Use When

| Use instead | When |
|---|---|
| `postgres-rls-pattern` | The task is authoring or reviewing the RLS policy itself, not the migration that enables it |
| `debugging` | A specific migration step is failing in CI or production and you need to reproduce |
| `documentation` | The task is writing a runbook or reference doc about the migration |
| (a generic migration skill) | The task is a different migration with no relation to the canonical-orders schema |
