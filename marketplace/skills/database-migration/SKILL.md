---
name: database-migration
description: "Use when planning or applying a raw-SQL database migration to a live PostgreSQL database — adding columns, renaming columns or tables, changing types, creating indexes, adding foreign keys, or running data backfills. Covers zero-downtime patterns (expand / contract, batched backfill, NOT VALID foreign keys, CONCURRENTLY indexes), the direct/unpooled connection requirement for migration tooling, branched-database workflows, and rollback strategy. Do NOT use for ORM-managed migrations driven by Prisma/Drizzle/TypeORM CLI scaffolding, for chasing a migration that has already failed in production (use debugging), for multi-release schema lifecycle planning outside one migration (use schema-evolution), or for designing the row-level-security model itself (use owasp-security). Do NOT use for design the row-level-security model for our new tenant table. Do NOT use for the migration crashed in production — find the root cause. Do NOT use for plan the full multi-release schema evolution for this domain."
license: MIT
compatibility: "Portable PostgreSQL 12+ migration guidance. Verify provider-specific CLI syntax, pooler behavior, migration-runner transaction handling, and rollback features against the target platform before production rollout."
allowed-tools: Read Grep Bash
metadata:
  relations: "{\"related\":[\"owasp-security\",\"transaction-isolation\",\"schema-evolution\",\"indexing-strategy\",\"debugging\",\"testing-strategy\",\"code-review\"],\"suppresses\":[\"schema-evolution\"],\"verify_with\":[\"indexing-strategy\",\"testing-strategy\",\"code-review\",\"schema-evolution\"]}"
  subject: data-engineering
  scope: "Raw-SQL PostgreSQL migration safety for live systems — migration file shape, direct/unpooled migration connections, branching or snapshot rehearsal, low-lock DDL patterns, batched backfills, deploy compatibility, verification, and rollback planning. Portable across PostgreSQL application stacks; principle-grounded and provider-aware, not repo-bound. Excludes ORM-specific migration generation, already-failed migration debugging, broad schema lifecycle roadmapping, and row-level-security model design."
  public: "true"
  taxonomy_domain: data/migrations
  stability: stable
  keywords: "[\"database migration\",\"schema migration\",\"zero-downtime migration\",\"DDL migration\",\"raw SQL migration\",\"Postgres DDL\",\"alter table production\",\"expand contract migration\",\"concurrent index creation\",\"migration rollback\"]"
  triggers: "[\"database-migration-skill\",\"postgres-migration-skill\",\"ddl-migration-skill\",\"zero-downtime-migration-skill\",\"raw-sql-migration-skill\"]"
  examples: "[\"add a nullable column to a 50M-row orders table without taking downtime\",\"rename the display_name column to username while the app is live\",\"create a btree index on a 100M-row table without blocking writes\",\"add a foreign key to a 10M-row table without blocking writes\",\"should I use ADD COLUMN NOT NULL DEFAULT gen_random_uuid() in this migration?\",\"write a rollback strategy for this schema change in case production breaks\",\"split this column type change into safe migration steps\"]"
  anti_examples: "[\"design the row-level-security model for our new tenant table\",\"the migration crashed in production — find the root cause\",\"plan the full multi-release schema evolution for this domain\",\"explain our migration conventions in the contributor docs\",\"refactor the migration runner helper for clarity\",\"decide whether this column rename needs an automated regression test\",\"review this AI-generated helper-code diff for correctness\"]"
  grounding: "{\"subject_matter\":\"PostgreSQL raw-SQL migration safety for live application databases\",\"grounding_mode\":\"hybrid\",\"truth_sources\":[\"https://www.postgresql.org/docs/current/ddl-alter.html\",\"https://www.postgresql.org/docs/current/sql-altertable.html\",\"https://www.postgresql.org/docs/current/sql-createindex.html\",\"https://www.postgresql.org/docs/current/functions-admin.html\",\"https://neon.com/docs/introduction/branching\",\"https://neon.com/docs/connect/connection-pooling\",\"https://www.pgbouncer.org/features.html\"],\"failure_modes\":[\"volatile_default_rewrites_large_table\",\"plain_index_build_blocks_writes\",\"concurrent_index_inside_transaction\",\"foreign_key_added_with_immediate_full_validation\",\"migration_runner_uses_transaction_pooler\",\"long_backfill_runs_as_one_transaction\",\"type_change_rewrites_table_without_shadow_column\",\"rollback_path_missing\"],\"evidence_priority\":\"equal\"}"
  mental_model: "A database migration is one schema or data-shape change applied to a live persistence layer. Its primitives are the migration file, a direct migration connection, the lock profile of each statement, the deploy-compatibility window, any batched backfill, verification queries, and a rollback or restore path. The safe version splits one risky-looking change into ordered steps that preserve application reads and writes while the database changes underneath them."
  purpose: "Raw DDL can be syntactically correct and still take production down by blocking writes, rewriting a large table, breaking old application code, or leaving no practical rollback. This skill exists to make those production-specific failure modes visible before the migration ships."
  concept_boundary: "This skill owns the mechanics of one raw-SQL PostgreSQL migration and its immediate verification. It does not own ORM migration generation, post-incident debugging, broad schema lifecycle planning across releases, row-level-security policy design, or generic code-review scoring."
  analogy: "A live database migration is changing a bridge while traffic keeps moving: temporary lanes, flaggers, inspection points, and a detour plan matter as much as the final bridge shape."
  misconception: "The common mistake is treating a migration as a single SQL statement that passed on a small dev database. Production safety comes from lock analysis, deploy compatibility, batching, direct connection choice, verification, and rollback planning."
  skill_graph_source_repo: "https://github.com/jacob-balslev/skill-graph"
  skill_graph_project: Skill Graph
  skill_graph_canonical_skill: skills/data-engineering/database-migration/SKILL.md
  skill_graph_export_description_projection: anti_examples
  skill_graph_export_description_projection_truncated: "true"
---
## Concept of the skill

**What it is:** Database migration is the discipline of changing a live PostgreSQL schema or data shape through ordered raw-SQL steps that preserve application availability.

**Mental model:** A migration is not just a statement. It is a file, connection choice, lock profile, deploy-compatibility window, backfill plan, verification surface, and rollback or restore path. Safe migrations break one risky change into steps the running application can survive.

**Why it exists:** Live databases fail differently from local databases. Correct SQL can block writes, rewrite millions of rows, break old code during a deploy, or remove data with no practical rollback. This skill makes those risks explicit before the change ships.

**What it is NOT:** It is not ORM-specific migration generation, post-incident debugging for a failed migration, broad schema lifecycle planning across several releases, row-level-security model design, or general code review.

**Adjacent concepts:** Schema evolution, indexing strategy, transaction isolation, connection pooling, background backfills, testing strategy, code review, and security review for row-level security.

**One-line analogy:** A live database migration is changing a bridge while traffic keeps moving: temporary lanes, flaggers, inspection points, and a detour plan matter as much as the final bridge shape.

**Common misconception:** The common mistake is believing a migration is safe because the SQL worked on a small dev database. Production safety depends on locks, batching, deploy compatibility, connection routing, verification, and rollback.

# Database Migration

## Coverage

- Migration file conventions: chronological filenames, headers documenting purpose and rollback, `BEGIN/COMMIT` framing, when DDL must escape the transaction
- Connection requirements: why DDL needs an unpooled connection (PgBouncer transaction-mode rejects DDL session state), and the two-URL pattern for live applications
- Branched-database workflow: create a branch, apply migration, schema-diff against parent, apply to main, prune the branch — with a vendor-capability matrix
- Common DDL patterns: nullable column, column with constant or non-volatile default, column with volatile default or row-specific value on a large table (batched backfill), zero-downtime rename via expand / contract, type change via shadow column, concurrent index creation, low-lock foreign key (NOT VALID + VALIDATE)
- Tenant-scoped schema additions: how to keep multi-tenant isolation safe across migrations (RLS-policy-in-migration discipline), without owning the policy design itself
- Zero-downtime table rename: compatibility view pattern that lets old code keep reading while the new name takes over
- Rollback strategy: transactional rollback for structural changes, `DOWN` paths for non-transactional ones, point-in-time restore as the last resort
- Pre-production checklist: schema diff, branch test run, NOT VALID gating, CONCURRENTLY gating, RLS gating, rollback documented in header

## Philosophy of the skill

A migration is the only operation in the application stack that is *both* shipped as code *and* irreversible by default. Application code can be reverted by re-deploying yesterday's commit; a `DROP COLUMN` cannot. Treat every migration as a one-way door unless you have explicitly designed the reverse door alongside it.

The dominant failure mode is the *plausible-looking single-statement migration*: `ALTER TABLE orders ADD COLUMN request_id UUID NOT NULL DEFAULT gen_random_uuid();` looks fine on a small dev database and can rewrite millions of rows on a production table because each existing row needs a distinct value. Zero-downtime migration is a discipline of *splitting* the apparent single change into a sequence of low-lock steps that each remain compatible with the running application. The split is not theoretical — it is the difference between a deploy and an outage.

The second failure mode is connection routing. Many production Postgres deployments place a transaction-mode pooler in front of the database for application traffic; that mode breaks session-based features and some migration tools rely on session state, `SET` behavior, or persistent connections. A migration script that runs fine on a developer laptop and fails oddly in production is often pointed at the pooled URL. The fix is a two-URL convention: pooled for application reads and writes, direct or unpooled for migrations and administrative work unless the migration runner and provider explicitly document otherwise.

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

## Connection: Direct or Unpooled for Migrations

Migration tools should run through a direct database connection unless the provider and runner explicitly document that pooled mode is supported for that operation. PgBouncer transaction pooling assigns a server connection only for the duration of a transaction and breaks several session-based PostgreSQL features; Neon documents schema migrations, `pg_dump` / `pg_restore`, long-running analytics, logical replication, and admin tasks as direct-connection use cases.

The standard pattern is two connection URLs sourced from environment variables:

```
DATABASE_URL          — pooled, for application reads and writes
DATABASE_URL_UNPOOLED — direct, for migrations and operations that need session GUCs
```

The pooled URL points at the pooler host or pooler endpoint; the direct URL points at the database host without the pooler. Migration runners use the direct URL by default:

```bash
psql "$DATABASE_URL_UNPOOLED" -f db/migrations/2026_05_06_add_subscription_plan.sql
```

A migration that runs cleanly on a developer database (which is often direct, with no pooler) and fails or behaves oddly in CI or production is often pointed at the pooled URL by default. Audit the runner before assuming the SQL is wrong.

## Branched-Database Workflow

If your Postgres provider supports branching (Neon, Supabase clones, Xata, or self-hosted Postgres-with-snapshots), every non-trivial migration runs on a branch first:

| Capability | Why it matters for migrations |
|---|---|
| Branch from current `main` state | Isolates the migration from live traffic during verification |
| Schema diff between branches | Confirms the migration changed only what was intended |
| Point-in-time restore on the parent | Last-resort rollback if the migration shipped and corrupted data |
| Per-branch connection string | Lets the agent run the migration against the branch with a single env var swap |

Example workflow with one provider's CLI shape (substitute the exact current command and flags for your platform):

```bash
# 1. Create a migration branch from main
neonctl branches create --name "migration/add-subscription-plan" --parent main --output json

# 2. Get the direct connection string for the branch from the provider CLI or console
BRANCH_URL="<direct branch connection string>"

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

Provider CLIs change faster than the migration principles. Treat the branch commands as a workflow skeleton; verify the exact CLI syntax against current provider docs before automating it.

If your provider does not support branching, the substitute is a fresh database restored from a recent production snapshot; the workflow is the same in shape but slower in cycle time.

## Common DDL Patterns

### Add a Column

Adding a nullable column or a column with a constant or otherwise non-volatile default is metadata-only on modern PostgreSQL — no table rewrite:

```sql
-- Nullable: instant, safe
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMPTZ;

-- Constant default: metadata-only on PostgreSQL 11+
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS sync_version INTEGER NOT NULL DEFAULT 0;
```

### Add a Column with a Volatile Default or Row-Specific Value (Large Tables)

A volatile default such as `DEFAULT gen_random_uuid()` or `DEFAULT clock_timestamp()` needs a distinct value per existing row and can force a long update or rewrite. A stable default like `DEFAULT now()` is not the same risk class, and PostgreSQL defaults cannot reference another column directly in the `DEFAULT` expression. If existing rows need row-specific values, split the change:

```sql
-- Step 1: add the column nullable (instant, no lock)
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS public_id UUID;

-- Step 2: run this bounded update repeatedly from the migration runner,
-- a maintenance job, or an operator loop until it affects 0 rows.
WITH batch AS (
  SELECT id
  FROM order_items
  WHERE public_id IS NULL
  ORDER BY id
  LIMIT 1000
)
UPDATE order_items
SET public_id = gen_random_uuid()
WHERE id IN (SELECT id FROM batch);

-- Step 3: set the future default and enforce NOT NULL after backfill is complete
ALTER TABLE order_items
  ALTER COLUMN public_id SET DEFAULT gen_random_uuid();

ALTER TABLE order_items
  ALTER COLUMN public_id SET NOT NULL;
```

The batch size is workload-dependent. 1000 rows per batch is a reasonable default for narrow rows; tune down if the table has wide rows or many indexes. Do not hide the whole backfill inside one long transaction; each batch should commit separately so locks, WAL pressure, and retry scope stay bounded.

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

Some type changes are metadata-only because PostgreSQL can preserve the stored representation, such as widening an unconstrained `VARCHAR` limit or moving between compatible text representations. Many other type changes require a table rewrite or expensive expression evaluation, even when the cast is implicit. Treat direct `ALTER COLUMN ... TYPE` as safe only after checking the specific source type, target type, constraints, indexes, and lock profile:

```sql
ALTER TABLE orders
  ALTER COLUMN external_shop_id TYPE TEXT;
```

Rewrite-prone or semantically changing types (for example, `INTEGER` to `BIGINT` on a large table, `NUMERIC(10,2)` to `BIGINT` cents, or `TEXT` to `INTEGER`) need the shadow-column pattern:

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

Plain `CREATE INDEX` locks out writes while the build runs, although readers can continue. On a large table that write block is often unacceptable. `CONCURRENTLY` builds the index without taking locks that prevent concurrent inserts, updates, or deletes:

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

This skill ships a local comprehension-eval artifact at `skills/skills/data-engineering/database-migration/evals/comprehension.json`. The previous marketplace example artifact remains at `skill-graph/examples/evals/database-migration.json`, but the current audit loop reads the local eval file next to the skill.

## Verification

- [ ] Migration filename matches the chronological convention (`YYYY_MM_DD_description.sql`)
- [ ] File header documents purpose, safety classification, and rollback path
- [ ] DDL targets the unpooled connection URL, not the pooled one
- [ ] If your platform supports branched databases, the migration ran on a branch and the schema diff against main shows only intended changes
- [ ] Nullable columns added with `IF NOT EXISTS`; volatile defaults or row-specific values split into add-nullable + batched-backfill + default/constraint enforcement
- [ ] Column renames use expand / contract across two deploys, not direct `RENAME COLUMN`
- [ ] Type changes that rewrite large tables or change semantics use the shadow-column pattern
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
| `code-review` | Reviewing AI-generated helper-code or application-code diffs around the migration |
| `owasp-security` | Designing the row-level-security model itself (this skill only enforces that the policy ships with the table) |

## Skill Graph context

<!-- skill-graph-context:start (generated — do not edit by hand) -->

**Classification**
- Subject: `data-engineering`
- Public: `true`
- Domain: `data/migrations`
- Scope: Raw-SQL PostgreSQL migration safety for live systems — migration file shape, direct/unpooled migration connections, branching or snapshot rehearsal, low-lock DDL patterns, batched backfills, deploy compatibility, verification, and rollback planning. Portable across PostgreSQL application stacks; principle-grounded and provider-aware, not repo-bound. Excludes ORM-specific migration generation, already-failed migration debugging, broad schema lifecycle roadmapping, and row-level-security model design.

**When to use**
- add a nullable column to a 50M-row orders table without taking downtime
- rename the display_name column to username while the app is live
- create a btree index on a 100M-row table without blocking writes
- add a foreign key to a 10M-row table without blocking writes
- should I use ADD COLUMN NOT NULL DEFAULT gen_random_uuid() in this migration?
- write a rollback strategy for this schema change in case production breaks
- split this column type change into safe migration steps
- Triggers: `database-migration-skill`, `postgres-migration-skill`, `ddl-migration-skill`, `zero-downtime-migration-skill`, `raw-sql-migration-skill`

**Not for**
- design the row-level-security model for our new tenant table
- the migration crashed in production — find the root cause
- plan the full multi-release schema evolution for this domain
- explain our migration conventions in the contributor docs
- refactor the migration runner helper for clarity
- decide whether this column rename needs an automated regression test
- review this AI-generated helper-code diff for correctness

**Related skills**
- Verify with: `indexing-strategy`, `testing-strategy`, `code-review`, `schema-evolution`
- Related: `owasp-security`, `transaction-isolation`, `schema-evolution`, `indexing-strategy`, `debugging`, `testing-strategy`, `code-review`

**Concept**
- Mental model: A database migration is one schema or data-shape change applied to a live persistence layer. Its primitives are the migration file, a direct migration connection, the lock profile of each statement, the deploy-compatibility window, any batched backfill, verification queries, and a rollback or restore path. The safe version splits one risky-looking change into ordered steps that preserve application reads and writes while the database changes underneath them.
- Purpose: Raw DDL can be syntactically correct and still take production down by blocking writes, rewriting a large table, breaking old application code, or leaving no practical rollback. This skill exists to make those production-specific failure modes visible before the migration ships.
- Boundary: This skill owns the mechanics of one raw-SQL PostgreSQL migration and its immediate verification. It does not own ORM migration generation, post-incident debugging, broad schema lifecycle planning across releases, row-level-security policy design, or generic code-review scoring.
- Analogy: A live database migration is changing a bridge while traffic keeps moving: temporary lanes, flaggers, inspection points, and a detour plan matter as much as the final bridge shape.
- Common misconception: The common mistake is treating a migration as a single SQL statement that passed on a small dev database. Production safety comes from lock analysis, deploy compatibility, batching, direct connection choice, verification, and rollback planning.

**Grounding**
- Mode: `hybrid`
- Truth sources: `https://www.postgresql.org/docs/current/ddl-alter.html`, `https://www.postgresql.org/docs/current/sql-altertable.html`, `https://www.postgresql.org/docs/current/sql-createindex.html`, `https://www.postgresql.org/docs/current/functions-admin.html`, `https://neon.com/docs/introduction/branching`, `https://neon.com/docs/connect/connection-pooling`, `https://www.pgbouncer.org/features.html`

**Keywords**
- `database migration`, `schema migration`, `zero-downtime migration`, `DDL migration`, `raw SQL migration`, `Postgres DDL`, `alter table production`, `expand contract migration`, `concurrent index creation`, `migration rollback`

<!-- skill-graph-context:end -->
