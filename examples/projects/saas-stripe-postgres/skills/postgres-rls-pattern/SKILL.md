---
# yaml-language-server: $schema=https://skillgraph.dev/schemas/skill.v3.schema.json
schema_version: 3
name: postgres-rls-pattern
description: "Use when authoring or reviewing PostgreSQL Row-Level Security (RLS) policies — selecting between `FOR SELECT / INSERT / UPDATE / DELETE`, choosing the right `USING` and `WITH CHECK` predicates, wiring the session-level `app.current_org_id` setting, and verifying that RLS is `FORCE`d (not bypassable by the table owner). Activate this skill whenever the task touches `db/policies/*.sql`, mentions `org_id` scoping, or asks any question of the form 'why can org A see org B's data?'. Do NOT use for non-tenant authorization (use a permissions-system skill) or for fixing a specific RLS-related production bug (use debugging)."
version: 0.1.0
type: capability
browse_category: data
category: ecommerce/data/multi-tenancy
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
  notes: "PostgreSQL 14+ (RLS + FORCE ROW LEVEL SECURITY)"
allowed-tools: Read Grep Bash
keywords:
  - postgres rls
  - row level security
  - rls policy
  - rls policies
  - org_id scoping
  - tenant isolation
  - multi-tenant postgres
  - app.current_org_id
  - FOR SELECT USING
  - WITH CHECK
  - FORCE ROW LEVEL SECURITY
  - rls bypass
  - cross-org leak
  - policy USING vs WITH CHECK
triggers:
  - postgres-rls-pattern
paths:
  - "db/policies/*.sql"
  - "db/migrations/*_add_*_rls.sql"
  - "lib/db/with-org-context.ts"
  - "!db/migrations/_archive/**"
examples:
  - "write the RLS policies for the new `orders` table — read-scoped to `app.current_org_id`"
  - "review my INSERT policy: am I missing the WITH CHECK clause?"
  - "explain why my service-role connection is still bypassing RLS even after I set the policy"
  - "design the org_id propagation from the API layer through to PostgreSQL session state"
anti_examples:
  - "the orders table query is slow — add an index"             # performance, not RLS
  - "user X cannot delete their own profile — fix the bug"     # row-owner permissions, not org isolation
  - "set up RBAC for our admin dashboard"                       # role permissions, not data-row scoping
relations:
  boundary:
    - skill: documentation
      reason: "documentation writes prose about multi-tenancy patterns; this skill enforces the SQL-level primitive"
    - skill: debugging
      reason: "debugging chases an observed cross-org leak in production; this skill is the authoring discipline that prevents it"
    - skill: refactor
      reason: "refactor changes code shape; an RLS policy refactor without re-running the cross-org leak test suite is unsafe"
  verify_with:
    - testing-strategy
grounding:
  domain_object: "PostgreSQL Row-Level Security policies for org-scoped multi-tenant data isolation"
  grounding_mode: repo_specific
  truth_sources:
    - db/policies/orders_rls.sql
    - db/migrations/0042_add_org_id.sql
    - lib/db/with-org-context.ts
  failure_modes:
    - missing_with_check_on_insert
    - rls_not_forced_owner_bypass
    - org_id_session_var_not_set
    - service_role_used_in_app_path
    - policy_using_wrong_subquery_join
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
  stale_after_days: 180
  review_cadence: quarterly
---

# PostgreSQL Row-Level Security Pattern

## Coverage

- `FOR SELECT / INSERT / UPDATE / DELETE` policy decomposition — when each is needed and when the SDK's "default" omits one with security consequences
- The difference between `USING` (read-time predicate) and `WITH CHECK` (write-time predicate) — and the failure mode when only one is provided on an UPDATE policy
- Session-context propagation — setting `app.current_org_id` per request via `SET LOCAL` or `set_config()` and the `with-org-context.ts` wrapper that enforces it
- `ALTER TABLE … FORCE ROW LEVEL SECURITY` — without this, the table owner (often the migration role) bypasses every policy you wrote
- Service-role boundary — what is allowed to read with `BYPASSRLS` (cron, batch ETL) and what must always be scoped (HTTP request handlers, server actions)
- The cross-org leak test pattern — how to assert in CI that no policy regression silently makes data visible across organizations

## Philosophy

RLS is the only multi-tenancy boundary that survives developer error. Every other isolation pattern (filter in the ORM, scope in the route handler, predicate in the application query) depends on every developer remembering to apply it on every code path. RLS pushes the boundary into PostgreSQL so the database itself enforces it, which means a bug in application code degrades a query to "returns nothing" instead of "returns the wrong organization's data." The pattern is non-negotiable for any system where one customer's data must not be visible to another, and the cost of getting it wrong is a customer-disclosable incident, not a sprint slip.

## Key Files

| File | Purpose |
|---|---|
| `db/policies/orders_rls.sql` | The canonical RLS policy file for the `orders` table — read this before writing a new policy |
| `db/migrations/0042_add_org_id.sql` | The migration that added `org_id` + the FORCE statement; demonstrates the both-or-nothing pattern |
| `lib/db/with-org-context.ts` | The TypeScript helper that sets the session variable per request — every route handler must use it |

## Verification

Use this checklist before merging any change to an RLS policy file:

- [ ] Every table with tenant data has `ALTER TABLE … ENABLE ROW LEVEL SECURITY` AND `ALTER TABLE … FORCE ROW LEVEL SECURITY` — both, not just enable
- [ ] Each policy declares `FOR SELECT`, `FOR INSERT`, `FOR UPDATE`, and `FOR DELETE` explicitly (or uses `FOR ALL` with a single predicate that genuinely covers all four)
- [ ] `UPDATE` policies have BOTH `USING` and `WITH CHECK` — without `WITH CHECK`, an UPDATE can move a row to another org
- [ ] The application code path that triggers this policy uses the `with-org-context.ts` wrapper to set `app.current_org_id` — direct connections that bypass the wrapper are a violation
- [ ] A cross-org leak test exists in `__tests__/security/cross-org-leak.test.ts` for this table — it inserts as org A, reads as org B, asserts empty
- [ ] No service-role connection string appears in any HTTP request handler — service-role bypasses RLS and is reserved for explicit `BYPASSRLS` paths (cron, ETL)

## Do NOT Use When

| Use instead | When |
|---|---|
| `debugging` | A specific cross-org leak has occurred in production — reproduce + isolate first |
| `documentation` | The task is writing a security-architecture doc about multi-tenancy |
| `refactor` | The task is restructuring policy SQL without changing the predicates themselves |
| (a permissions-system skill) | The task is row-owner authorization (user X can edit their own resource) — that's RBAC, not org isolation |
