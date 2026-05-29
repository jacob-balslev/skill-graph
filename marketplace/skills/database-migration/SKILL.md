---
name: database-migration
description: "Use when planning or applying a raw-SQL database migration to a live PostgreSQL database — adding columns, renaming columns or tables, changing types, creating indexes, adding foreign keys, or running data backfills. Covers zero-downtime patterns (expand / contract, batched backfill, NOT VALID foreign keys, CONCURRENTLY indexes), the unpooled-connection requirement for DDL, branched-database workflows, and rollback strategy. Do NOT use for ORM-managed migrations driven by Prisma/Drizzle/TypeORM CLI scaffolding (the generation rules are tool-specific), for chasing a migration that has already failed in production (use `debugging`), or for designing the row-level-security model itself (use `owasp-security`). Do NOT use for design the row-level-security model for our new tenant table. Do NOT use for the migration crashed in production — find the root cause. Do NOT use for explain our migration conventions in the contributor docs. Do NOT use for refactor the migration runner helper for clarity."
license: MIT
compatibility: "PostgreSQL 12+ (covers concurrent index, NOT VALID foreign keys, generated columns). Connection examples target raw `psql` and the unpooled side of any PgBouncer-style pooler. Branching examples reference `neonctl` as one provider — substitute the equivalent CLI for Supabase, Xata, or self-hosted clones if your platform supports branched databases."
allowed-tools: Read Grep Bash Edit
metadata:
  schema_version: "8"
  version: "1.0.0"
  subject: code-engineering
  deployment_target: portable
  taxonomy_domain: data/migrations
  owner: skill-graph-maintainer
  freshness: "2026-05-06"
  drift_check: "{\"last_verified\":\"2026-05-06\"}"
  eval_artifacts: present
  eval_state: unverified
  routing_eval: absent
  stability: experimental
  keywords: "[\"database migration\",\"schema migration\",\"zero-downtime migration\",\"DDL migration\",\"raw SQL migration\",\"Postgres DDL\",\"alter table production\",\"expand contract migration\",\"concurrent index creation\",\"migration rollback\"]"
  examples: "[\"add a nullable column to a 50M-row orders table without taking downtime\",\"rename the `display_name` column to `username` while the app is live\",\"create a btree index on a 100M-row table without locking writes\",\"the migration takes ACCESS EXCLUSIVE — how do I avoid the lock?\",\"add a foreign key to a 10M-row table without blocking writes\",\"should I use ADD COLUMN ... NOT NULL DEFAULT 0 in this migration?\",\"write a rollback strategy for this schema change in case production breaks\",\"split the migration into expand and contract phases across two deploys\"]"
  anti_examples: "[\"design the row-level-security model for our new tenant table\",\"the migration crashed in production — find the root cause\",\"explain our migration conventions in the contributor docs\",\"refactor the migration runner helper for clarity\",\"decide whether this column rename needs an automated regression test\",\"review this AI-generated DDL diff for correctness\"]"
  relations: "{\"boundary\":[{\"skill\":\"debugging\",\"reason\":\"debugging chases an observed migration failure; database-migration plans the safe DDL path forward before execution\"},{\"skill\":\"refactor\",\"reason\":\"refactor is behavior-preserving code reorganization; database-migration is schema mutation that may require coordinated code changes across two or more deploys\"},{\"skill\":\"testing-strategy\",\"reason\":\"testing-strategy decides what deserves a regression test; database-migration owns the verification dance that runs before, during, and after applying DDL\"}],\"related\":[\"testing-strategy\",\"debugging\",\"owasp-security\"],\"verify_with\":[\"testing-strategy\",\"code-review\"]}"
  portability: "{\"readiness\":\"scripted\",\"targets\":[\"skill-md\"]}"
  lifecycle: "{\"stale_after_days\":90,\"review_cadence\":\"quarterly\"}"
  structural_verdict: PASS
  truth_verdict: PASS
  comprehension_verdict: UNVERIFIED
  application_verdict: UNVERIFIED
  last_audited: "2026-05-28"
  lint_verdict: PASS
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/code-engineering/database-migration/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---

# Database Migration

## Coverage

- Migration file conventions: chronological filenames, headers documenting purpose and rollback, `BEGIN/COMMIT` framing, when DDL must escape the transaction
- Connection requirements: why DDL needs an unpooled connection (PgBouncer transaction-mode rejects DDL session state), and the two-URL pattern for live applications
- Branched-database workflow: create a branch, apply migration, schema-diff against parent, apply to main, prune the branch — with a vendor-capability matrix
- Common DDL patterns: nullable column, column with constant default, column with non-constant default on a large table (batched backfill), zero-downtime rename via expand / contract, type change via shadow column, concurrent index creation, low-lock foreign key (NOT VALID + VALIDATE)
- Tenant-scoped schema additions: how to keep multi-tenant isolation safe across migrations (RLS-policy-in-migration discipline), without owning the policy design itself
- Zero-downtime table rename: compatibility view pattern that lets old code keep reading while the new name takes over
- Rollback strategy: transactional rollback for structural changes, `DOWN` paths for non-transactional ones, point-in-time restore as the last resort
- Pre-production checklist: schema diff, branch test run, NOT VALID gating, CONCURRENTLY gating, RLS gating, rollback documented in header

## Philosophy

A migration is the only operation in the application stack that is *both* shipped as code *and* irreversible by default. Application code can be reverted by re-deploying yesterday's commit; a `DROP COLUMN` cannot. Treat every migration as a one-way door unless you have explicitly designed the reverse door alongside it.

The dominant failure mode is the *plausible-looking single-statement migration*: `ALTER TABLE orders ADD COLUMN sync_version INTEGER NOT NULL DEFAULT 0;` looks fine on a small dev database and locks the table for minutes on a 50M-row production table. Zero-downtime migration is a discipline of *splitting* the apparent single change into a sequence of low-lock steps that each remain compatible with the running application. The split is not theoretical — it is the difference between a deploy and an outage.

The second failure mode is connection routing. Most production Postgres deployments place a transaction-mode pooler in front of the database for application traffic; that pooler does not support most DDL because DDL needs session-level state the pooler discards between transactions. A migration script that runs fine on a developer laptop and fails silently in production is almost always pointed at the pooled URL. The fix is a non-negotiable two-URL convention: pooled for application reads and writes, unpooled for migrations.

The third failure mode is *invisible* — running a migration without a rollback path documented next to it. Six months later, someone has to undo the change under incident pressure, with no record of what the reverse looks like. The discipline is to write the `DOWN` while the `UP` is still fresh, and to test it on a branched database before merging.

## Migration File Convention

Migrations are versioned, chronological, and applied in deterministic order. The naming convention has to encode both *when* the migration was authored and *what* it does:

```
db/migrations/2026_05_06_add_subscription_plan.sql
db/migrations/2026_05_07_rename_full_name_to_display_name.sql
db/migrations/2026_05_08_add_index_orders_org_created.sql
```

Use underscore-separated date parts (`YYYY_MM_DD`) so file-system sort order matches authoring order even at month boundaries. Append a snake_case description that names the change in 3-6 words.

**Critical rule: never rename an applied migration.** Migration runners track applied files by name; renaming makes a previously-applied migration appear new, leading to duplicate application or conflicts on the next run. If a name is wrong, accept it and move on.

Every migration file opens with a header that names purpose, related ticket (if any), and safety classification:

```sql
-- Migration: 2026_05_06_add_subscription_plan
-- Purpose: Add subscription_plans table with org_id, RLS, and app_role grants.
-- Related: <ticket-id, optional>
-- Safety: ONLINE  (alternatives: REQUIRES MAINTENANCE WINDOW, FORWARD-ONLY)
-- Rollback: DROP TABLE subscription_plans; -- safe to run; no downstream FKs yet.

BEGIN;

-- ... DDL ...

COMMIT;
```

The `Rollback:` line is mandatory. If the rollback is "rebuild from a point-in-time snapshot," say so explicitly — the absence of a row-level rollback is a deliberate design choice that the next reader needs to know.

## Connection: Unpooled for DDL

DDL statements (`ALTER TABLE`, `CREATE INDEX`, `CREATE TABLE`, `DROP TABLE`, `CREATE OR REPLACE FUNCTION`) need session-level state that PgBouncer's transaction mode does not preserve. The standard pattern is two connection URLs sourced from environment variables:

```
DATABASE_URL          — pooled, for application reads and writes
DATABASE_URL_UNPOOLED — direct, for migrations and operations that need session GUCs
```

The pooled URL typically points at the pooler host on its dedicated port (commonly `6543`) with a `pgbouncer=true` query parameter; the unpooled URL points at the database host directly (commonly `5432`). Migration runners always use the unpooled URL:

```bash
psql "$DATABASE_URL_UNPOOLED" -f db/migrations/2026_05_06_add_subscription_plan.sql
```

A migration that runs cleanly on a developer database (which is direct, no pooler) and fails or behaves oddly in CI or production is almost always pointed at the pooled URL by default. Audit the runner before assuming the SQL is wrong.

## Branched-Database Workflow

If your Postgres provider supports branching (Neon, Supabase clones, Xata, or self-hosted Postgres-with-snapshots), every non-trivial migration runs on a branch first:

| Capability | Why it matters for migrations |
|---|---|
| Branch from current `main` state | Isolates the migration from live traffic during verification |
| Schema diff between branches | Confirms the migration changed only what was intended |
| Point-in-time restore on the parent | Last-resort rollback if the migration shipped and corrupted data |
| Per-branch connection string | Lets the agent run the migration against the branch with a single env var swap |

Example workflow with one provider's CLI (substitute the equivalent for your platform):

```bash
# 1. Create a migration branch from main
neonctl branches create --name "migration/add-subscription-plan" --parent main

# 2. Get the unpooled connection string for the branch
BRANCH_URL=$(neonctl cs migration/add-subscription-plan --pooled false)

# 3. Apply the migration on the branch
psql "$BRANCH_URL" -f db/migrations/2026_05_06_add_subscription_plan.sql

# 4. Verify the resulting structure
psql "$BRANCH_URL" -c "\d subscription_plans"

# 5. Schema-diff the branch against main — should show only intended changes
neonctl branches schema-diff main migration/add-subscription-plan

# 6. Apply to main once the diff is clean
psql "$DATABASE_URL_UNPOOLED" -f db/migrations/2026_05_06_add_subscription_plan.sql

# 7. Delete the migration branch
neonctl branches delete migration/add-subscription-plan
```

If your provider does not support branching, the substitute is a fresh database restored from a recent production snapshot; the workflow is the same in shape but slower in cycle time.

## Common DDL Patterns

### Add a Column

Adding a nullable column or a column with a *constant* default is metadata-only on PostgreSQL 11+ — no table rewrite, no exclusive lock:

```sql
-- Nullable: instant, safe
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ;

-- Constant default: instant, safe (PostgreSQL 11+)
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS sync_version INTEGER NOT NULL DEFAULT 0;
```

### Add a Column with a Non-Constant Default (Large Tables)

A *non-constant* default (`DEFAULT now()`, `DEFAULT gen_random_uuid()`, `DEFAULT some_function(other_column)`) forces a full table rewrite. On a 50M-row table that means a multi-minute exclusive lock. The split is:

```sql
-- Step 1: add the column nullable (instant, no lock)
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS unit_weight_grams NUMERIC(10,2);

-- Step 2: backfill in batches (avoids long lock and long transaction)
DO $$
DECLARE
  batch_size INT := 1000;
  last_id UUID := '00000000-0000-0000-0000-000000000000';
  max_id UUID;
BEGIN
  LOOP
    SELECT MAX(id) INTO max_id
    FROM (
      SELECT id FROM order_items
      WHERE id > last_id
      ORDER BY id
      LIMIT batch_size
    ) sub;

    EXIT WHEN max_id IS NULL;

    UPDATE order_items
    SET unit_weight_grams = 250
    WHERE id > last_id AND id <= max_id;

    last_id := max_id;
    COMMIT;
  END LOOP;
END;
$$;

-- Step 3: enforce NOT NULL after backfill is complete
ALTER TABLE order_items
  ALTER COLUMN unit_weight_grams SET NOT NULL;
```

The batch size is workload-dependent. 1000 rows per batch is a reasonable default for narrow rows; tune down if the table has wide rows or many indexes.

### Rename a Column (Zero-Downtime — Expand / Contract)

A direct `ALTER TABLE ... RENAME COLUMN` is *technically* metadata-only and fast, but it is *not* zero-downtime: the application is reading the old name during the milliseconds between the rename and the new code's deploy, and any in-flight transaction can see the table in either state. The discipline:

```sql
-- Phase 1 (expand): add the new column, keep both in sync via trigger, backfill
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS display_name TEXT;

CREATE OR REPLACE FUNCTION sync_display_name()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.display_name := COALESCE(NEW.display_name, NEW.full_name);
  NEW.full_name := COALESCE(NEW.full_name, NEW.display_name);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_sync_display_name
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION sync_display_name();

UPDATE users SET display_name = full_name WHERE display_name IS NULL;
```

Deploy application code that reads and writes `display_name`. Wait until no caller still references `full_name` (typically one or two release cycles).

```sql
-- Phase 2 (contract): drop trigger, function, and old column
DROP TRIGGER IF EXISTS trg_sync_display_name ON users;
DROP FUNCTION IF EXISTS sync_display_name();
ALTER TABLE users DROP COLUMN full_name;
```

The two phases ship in *separate migrations and separate deploys*. Bundling them defeats the point.

### Change a Column Type

Compatible types (e.g. `INT` → `BIGINT`, `TEXT` → `VARCHAR(n)` where `n` is large enough) are direct and safe:

```sql
ALTER TABLE orders
  ALTER COLUMN external_shop_id TYPE BIGINT;
```

Incompatible types (e.g. `NUMERIC(10,2)` → `BIGINT` cents, `TEXT` → `INTEGER`) need the shadow-column pattern:

```sql
-- Step 1: add shadow column with the new type
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS amount_cents BIGINT;

-- Step 2: backfill (batched if the table is large)
UPDATE orders
  SET amount_cents = ROUND(amount_decimal * 100)
  WHERE amount_cents IS NULL;

-- Step 3 (after deploying code that reads amount_cents): drop the old column
ALTER TABLE orders DROP COLUMN amount_decimal;
ALTER TABLE orders RENAME COLUMN amount_cents TO amount;
```

### Create an Index Concurrently

`CREATE INDEX` takes an `ACCESS EXCLUSIVE` lock by default — readers are unaffected but writers block for the duration. On a large table that is unacceptable. `CONCURRENTLY` builds the index without holding the heavy lock:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_org_created
  ON orders (org_id, created_at DESC);

-- Symmetrical drop
DROP INDEX CONCURRENTLY IF EXISTS idx_orders_org_created;
```

`CONCURRENTLY` *cannot* run inside a `BEGIN/COMMIT` block — it must be the entire script, or sit between explicit transaction boundaries. Migrations that need an index plus other DDL must split the index step into its own file.

A failed `CREATE INDEX CONCURRENTLY` leaves an *invalid* index on the table; check with `\d <table>` and `DROP INDEX` the invalid one before retrying.

### Add a Foreign Key (Low Lock)

Adding a foreign key with the default validation behavior locks both tables while it scans every existing row. The two-step pattern adds the constraint without scanning, then validates without an exclusive lock:

```sql
-- Step 1: add as NOT VALID (no scan, near-instant, locks briefly)
ALTER TABLE order_items
  ADD CONSTRAINT fk_order_items_orders
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  NOT VALID;

-- Step 2: validate (acquires SHARE UPDATE EXCLUSIVE — readers and writers continue)
ALTER TABLE order_items
  VALIDATE CONSTRAINT fk_order_items_orders;
```

`NOT VALID` means *new* rows are checked against the constraint, but *existing* rows are not — which is fine if the application's prior writes already respected the constraint. If they did not, the `VALIDATE` step fails and surfaces the offending rows.

## Tenant-Scoped Schema Additions

If your application uses Postgres row-level security to isolate tenants, every new tenant-scoped table must include the policy in the *same migration that creates the table*. Adding it later is a window during which the table is readable across tenants.

```sql
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans FORCE ROW LEVEL SECURITY;

CREATE POLICY subscription_plans_org_isolation
  ON subscription_plans
  USING (
    org_id IS NOT NULL
    AND org_id = current_setting('app.organization_id', TRUE)::uuid
  )
  WITH CHECK (
    org_id IS NOT NULL
    AND org_id = current_setting('app.organization_id', TRUE)::uuid
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON subscription_plans TO app_role;

CREATE INDEX idx_subscription_plans_org
  ON subscription_plans (org_id);
```

After the migration applies, verify the policy is attached:

```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'subscription_plans';
```

### Session Variable Discipline

The session variable name in `current_setting()` and the name your application sets via `SET LOCAL app.<name>` must match exactly. A typo (`app.org_id` vs `app.organization_id`) silently fails: `current_setting()` returns `NULL`, the policy never matches, and the table appears empty to every caller. Write the policy and the application's session-variable code in the *same* review cycle, and add a test that calls a known cross-tenant query and confirms it returns zero rows.

The design of the RLS model itself (which tables are tenant-scoped, what the isolation predicate should be, where the variable is set) belongs to a security-design skill, not this one. This skill only enforces that *if* the policy exists in your model, the migration includes it.

## Zero-Downtime Table Rename

Renaming a table while the application is live needs a compatibility view so old code paths keep working:

```sql
-- Phase 1: rename
ALTER TABLE orders_v1 RENAME TO orders;

-- Phase 2: compatibility view for callers still using the old name
CREATE OR REPLACE VIEW orders_v1 AS
  SELECT * FROM orders;

GRANT SELECT ON orders_v1 TO app_role;
```

Once every caller has migrated to the new name, drop the view in a follow-up migration:

```sql
DROP VIEW IF EXISTS orders_v1;
```

Writes through the view are usually safe for simple `SELECT *` views, but verify your application's INSERT/UPDATE paths hit the underlying table directly during the transition.

## Rollback Patterns

### Transactional Rollback (Structural Changes)

Wrap structural changes in a `BEGIN/COMMIT` block with a verification step. If verification fails, `RAISE EXCEPTION` triggers automatic rollback of the entire migration:

```sql
BEGIN;

ALTER TABLE users ADD COLUMN phone TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    RAISE EXCEPTION 'phone column not created';
  END IF;
END;
$$;

COMMIT;
```

Anything that cannot run in a transaction (`CREATE INDEX CONCURRENTLY`, `ALTER TYPE ... ADD VALUE` in older versions, etc.) cannot use this pattern — it must have a separate `DOWN` migration ready to apply if the `UP` causes problems downstream.

### Point-in-Time Restore via Branched Database

Branched-database providers can restore a parent branch to a prior timestamp. This is the rollback of last resort — it loses any data written between the bad migration and the restore point.

```bash
# 1. Restore main to a known-good timestamp (preserves the bad state under a renamed branch)
neonctl branches restore main \
  main@2026-05-06T09:00:00Z \
  --preserve-under-name "main-post-bad-migration"

# 2. Verify the restored state
psql "$(neonctl cs main --pooled false)" -c "SELECT COUNT(*) FROM orders"

# 3. Apply the corrected migration
psql "$DATABASE_URL_UNPOOLED" -f db/migrations/2026_05_06_corrected.sql

# 4. Once confirmed safe, delete the preserved bad branch
neonctl branches delete main-post-bad-migration
```

If your provider lacks point-in-time restore, the substitute is a backup-and-restore from the most recent snapshot — same shape, longer window of data loss.

## Evals

This skill ships a comprehension-eval artifact at [`examples/evals/database-migration.json`](https://github.com/jacob-balslev/skill-graph/blob/main/examples/evals/database-migration.json). The checklist below is the authoring gate for migration rollout decisions; the eval file is the grader surface.

## Verification

- [ ] Migration filename matches the chronological convention (`YYYY_MM_DD_description.sql`)
- [ ] File header documents purpose, safety classification, and rollback path
- [ ] DDL targets the unpooled connection URL, not the pooled one
- [ ] If your platform supports branched databases, the migration ran on a branch and the schema diff against main shows only intended changes
- [ ] Nullable columns added with `IF NOT EXISTS`; non-constant defaults split into add-nullable + batched-backfill + set-NOT-NULL
- [ ] Column renames use expand / contract across two deploys, not direct `RENAME COLUMN`
- [ ] Type changes incompatible with `ALTER COLUMN ... TYPE` use the shadow-column pattern
- [ ] Indexes on large tables created with `CONCURRENTLY`, outside any `BEGIN/COMMIT` block
- [ ] Foreign keys on large tables added as `NOT VALID`, then validated separately
- [ ] If the application uses RLS for tenancy, the policy is created in the same migration as the new table — never deferred to a follow-up
- [ ] Rollback strategy is written in the file header (transactional rollback for structural changes; explicit `DOWN` for non-transactional ones; point-in-time restore explicitly named when row-level rollback is impossible)
- [ ] Migration was reviewed by the team or a `code-review` pass before merging

## Do NOT Use When

| Use instead | When |
|---|---|
| `documentation` | Writing the migration-conventions page for the contributor docs |
| `debugging` | Chasing a migration that has already failed in production |
| `refactor` | Reorganizing the migration runner script or helper code |
| `testing-strategy` | Deciding whether a column rename needs an automated regression test |
| `code-review` | Reviewing an AI-generated DDL diff for correctness |
| `owasp-security` | Designing the row-level-security model itself (this skill only enforces that the policy ships with the table) |

## Skill Graph context

<!-- generated by scripts/export-marketplace-skills.js from Skill Metadata Protocol fields; do not edit by hand -->

**Classification**
- Subject: `code-engineering`
- Deployment: `portable`
- Domain: `data/migrations`

**When to use**
- add a nullable column to a 50M-row orders table without taking downtime
- rename the `display_name` column to `username` while the app is live
- create a btree index on a 100M-row table without locking writes
- the migration takes ACCESS EXCLUSIVE — how do I avoid the lock?
- add a foreign key to a 10M-row table without blocking writes
- should I use ADD COLUMN ... NOT NULL DEFAULT 0 in this migration?
- write a rollback strategy for this schema change in case production breaks
- split the migration into expand and contract phases across two deploys

**Not for**
- design the row-level-security model for our new tenant table
- the migration crashed in production — find the root cause
- explain our migration conventions in the contributor docs
- refactor the migration runner helper for clarity
- decide whether this column rename needs an automated regression test
- review this AI-generated DDL diff for correctness
- Owned by `debugging`
- Owned by `refactor`
- Owned by `testing-strategy`

**Related skills**
- Verify with: `testing-strategy`, `code-review`
- Related: `testing-strategy`, `debugging`, `owasp-security`

**Lifecycle & audit status**
- Stability: `experimental`
- Freshness: `2026-05-06`
- Eval state: `unverified`
- Routing eval: `absent`
- Audit status: structural PASS, truth PASS, comprehension UNVERIFIED, application UNVERIFIED
- Last audited: `2026-05-28`

**Provenance**
- version 1.0.0, schema v8, owner `skill-graph-maintainer`
- Keywords: `database migration`, `schema migration`, `zero-downtime migration`, `DDL migration`, `raw SQL migration`, `Postgres DDL`, `alter table production`, `expand contract migration`, `concurrent index creation`, `migration rollback`
