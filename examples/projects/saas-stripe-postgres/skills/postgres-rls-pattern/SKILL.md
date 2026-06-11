---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: postgres-rls-pattern
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when writing or reviewing Postgres queries in a multi-tenant SaaS where every table row must be scoped to a single organization. Enforces the FORCE ROW LEVEL SECURITY + USING + WITH CHECK triple on every tenant-bound table, and wraps application queries in an `orgQuery(orgId)` helper that sets `app.current_org_id` before each statement. Do NOT use for cross-org system queries such as billing cron jobs or admin panels (those bypass RLS intentionally via the service role); use a service-role query wrapper instead."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: backend-engineering
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: true
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Row-level-security policy pattern for multi-tenant Postgres in the saas-stripe-postgres example — tenant isolation via RLS policies on every tenant-scoped table. Excludes application-layer authorization logic and the event routing that triggers the writes."
# taxonomy_domain: optional hierarchical sub-path within `subject`. Slash-delimited
# lowercase kebab-case segments. rename of the original v8 `domain`. Remove when the flat
# `subject` is sufficient.
taxonomy_domain: engineering/database

# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
license: MIT
# compatibility: runtime compatibility object. Prefer structured fields
# (`runtimes`, `node`) over free-text `notes`.
compatibility:
  runtimes:
    - node
  node: ">=20"
  notes: "Postgres >=14 with row-level security enabled; assumes pg or postgres.js driver."
allowed-tools: Read Grep
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
keywords:
  - postgres row level security
  - RLS multi-tenant
  - orgQuery wrapper
  - FORCE ROW LEVEL SECURITY
  - SET app.current_org_id
  - tenant data isolation
  - cross-tenant data leak prevention
  - multi-tenant postgres
  - row security policy
  - using with check policy
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - postgres-rls-pattern
# paths: glob array of code surfaces this skill governs. Supports gitignore-style
# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.
paths:
  - "lib/db.ts"
  - "db/schema.sql"
  - "db/migrations/*.sql"
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "how do I prevent one tenant's data from appearing in another tenant's queries?"
  - "write the RLS policy for the orders table in a multi-tenant SaaS"
  - "set up the orgQuery helper so every query is automatically scoped to the current org"
  - "add row level security to a new subscriptions table"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "run a billing cron job that needs to read all orgs"
  - "write a migration that backfills data across all organizations"
  - "query the database without any tenant context for an admin dashboard"
# relations: typed graph edges to sibling skills. Current fields:
# related (adjacency for browse / co-routing expansion) /
# suppresses (exclude listed skills from co-routing when THIS skill wins; write reason
#             as "I own this exclusively over X", not "use X instead") /
# boundary (DEPRECATED alias of suppresses, retained for unmigrated skills) /
# verify_with (cross-check; co-loaded as one-hop expansion) /
# depends_on (composition; transitive — A→B→C loads all three) /
# broader / narrower (SKOS-style generalization) /
# disjoint_with (mutual exclusion for incompatible ownership).
relations:
  related:
    - migrate-orders-to-canonical-schema
    - nextjs-server-action-validation
  depends_on: []
  verify_with:
    - migrate-orders-to-canonical-schema
---

# Postgres RLS Pattern

## Concept of the skill

**What it is:** The database-enforced tenant isolation pattern for Postgres tables in a multi-organization SaaS.
**Mental model:** The application sets the current organization; Postgres enforces which rows that organization can read or write.
**Why it exists:** A missed `WHERE org_id = ...` clause should not become a cross-tenant data leak.
**What it is NOT:** It is not a service-role migration pattern, admin reporting bypass, or generic SQL optimization guidance.
**Adjacent concepts:** Row-level policies, session variables, service-role isolation, tenant-bound tables.
**One-line analogy:** It is a database lock that opens only for the current organization.
**Common misconception:** Application-level filters are equivalent to RLS; RLS moves the guardrail into the database itself.

## Coverage

- The three-part policy triple — `FORCE ROW LEVEL SECURITY`, `USING (org_id = current_setting('app.current_org_id')::uuid)`, and `WITH CHECK (org_id = current_setting('app.current_org_id')::uuid)` — and why omitting any one part leaves a gap
- The `orgQuery(orgId)` application wrapper — a single function that opens a transaction, sets `app.current_org_id`, runs the caller's query, and commits; why setting the variable once at session start is unsafe under connection pooling
- Service role bypass — legitimate cross-org operations (billing cron, admin panel, migration backfills) that must use a connection string that skips RLS, and why those code paths must be isolated from application code
- Policy audit checklist — grepping for `query()` calls without a preceding `SET app.current_org_id` as a CI-safe audit gate
- New-table checklist — steps to add RLS to a table that was created before RLS was enforced on the schema

## Philosophy of the skill

Row-level security on Postgres is the difference between "we checked org_id in the WHERE clause" and "the database rejects cross-org reads at the storage layer." Application-level checks are deleted by a single missing WHERE clause; RLS cannot be bypassed unless you use the service role explicitly. The cost is a session variable that must be set before every query and a discipline of never using the service role for application queries. Both costs are cheap relative to the consequence of a cross-tenant data leak.

## Schema Pattern

```sql
-- 1. Enable and force RLS on every tenant-bound table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- 2. SELECT policy — only rows where org_id matches the session variable
CREATE POLICY orders_org_select ON orders
  FOR SELECT
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- 3. INSERT policy — only allow inserts that match the session variable
CREATE POLICY orders_org_insert ON orders
  FOR INSERT
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

-- 4. UPDATE policy — USING (read filter) AND WITH CHECK (write filter)
CREATE POLICY orders_org_update ON orders
  FOR UPDATE
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

-- 5. DELETE policy
CREATE POLICY orders_org_delete ON orders
  FOR DELETE
  USING (org_id = current_setting('app.current_org_id', true)::uuid);
```

## Application Wrapper Pattern

```typescript
// lib/db.ts
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

/** Tenant-scoped query: sets app.current_org_id for every statement. */
export async function orgQuery<T>(
  orgId: string,
  fn: (sql: postgres.Sql) => Promise<T>
): Promise<T> {
  return sql.begin(async (tx) => {
    await tx`SELECT set_config('app.current_org_id', ${orgId}, true)`;
    return fn(tx);
  });
}

/** System query: bypasses RLS. Use ONLY for cron jobs, migrations, and admin. */
export async function systemQuery<T>(fn: (sql: postgres.Sql) => Promise<T>): Promise<T> {
  return fn(sql);
}
```

Usage in a Server Action:

```typescript
import { orgQuery } from "@/lib/db";

export async function getOrders(orgId: string) {
  return orgQuery(orgId, (tx) => tx`SELECT * FROM orders ORDER BY created_at DESC`);
}
```

## Verification

- [ ] Every tenant-bound table has `ENABLE ROW LEVEL SECURITY` AND `FORCE ROW LEVEL SECURITY`
- [ ] Every DML operation (SELECT, INSERT, UPDATE, DELETE) has a corresponding policy on each table
- [ ] `WITH CHECK` is present on INSERT and UPDATE policies (not just `USING`)
- [ ] `orgQuery` sets the variable inside a transaction, not at session start
- [ ] No application code calls `systemQuery` (grep for `systemQuery` in `apps/` and `lib/` — any hit is a finding)
- [ ] Every new migration that adds a table includes the RLS policy triple in the same migration file

## Do NOT Use When

| Use instead | When |
|---|---|
| `systemQuery` wrapper | The query legitimately crosses org boundaries (billing cron, migration backfill, admin panel) |
| `migrate-orders-to-canonical-schema` | The task is a schema migration that also needs to update RLS policies |
| (a database skill without multi-tenancy scope) | The application is single-tenant and org_id isolation is not a requirement |
