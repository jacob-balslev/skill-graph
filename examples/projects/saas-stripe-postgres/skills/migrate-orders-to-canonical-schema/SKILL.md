---
# name: stable skill identifier. Match the skill directory name or the final namespace segment.
# Lowercase letters/numbers with hyphen, slash, or colon separators.
name: migrate-orders-to-canonical-schema
# description: routing-facing summary of what the skill covers and when it activates.
# Include concrete triggers and an explicit negative boundary; keep routing semantics out of prose-only ambiguity.
description: "Use when running migration 0004 that normalizes the orders table from a Stripe-specific shape (stripe_session_id, stripe_customer_id as top-level columns) to a canonical provider-agnostic shape (provider, provider_order_id, provider_customer_id). Covers the four-phase safe migration procedure — add nullable columns, backfill from existing data, validate, drop legacy columns — and the RLS policy update that must accompany the column rename. Do NOT use for unrelated schema migrations (write a fresh skill anchored to that migration's number), for designing a new canonical schema from scratch, or for the ongoing orgQuery access pattern (use postgres-rls-pattern)."

# === v8 Classification (subject + public; polyhierarchy via subjects[]) — see ADR-0017 ===
# subject: primary browse shelf — what the skill teaches. One of twelve closed values:
# backend-engineering / frontend-engineering / software-architecture / data-engineering / agent-ops / ai-engineering /
# quality-assurance / design / reasoning-strategy / software-engineering-method / knowledge-organization / product-domain.
subject: data-engineering
# public: publishability/private-data gate. Boolean.
# true = publishable/shareable; false = private and excluded from public export.
# Project anchoring is carried separately by non-empty `project[]` plus `grounding`.
public: false
# taxonomy_domain: optional hierarchical sub-path within `subject`. Slash-delimited
# lowercase kebab-case segments. rename of the original v8 `domain`. Remove when the flat
# `subject` is sufficient.
taxonomy_domain: engineering/database
# scope: free-text PRD-style statement of what the skill teaches and what it excludes.
# (v8 required; not an enum). Mirrors Coverage + Do NOT Use When at frontmatter level.
scope: "Four-phase orders-table migration for the saas-stripe-postgres example project — canonicalizes Stripe-specific column names to provider-agnostic names with RLS policy update."

# stability: lifecycle marker. One of:
# experimental (active development) / stable (production-ready) /
# frozen (no further changes expected) / deprecated.
# When `deprecated`, schema's allOf REQUIRES `superseded_by: <real-skill-name>`.
stability: experimental
# license: SPDX license identifier (e.g., MIT, Apache-2.0).
license: MIT
# compatibility: runtime compatibility object. Prefer structured fields
# (`agent_runtimes`, `node_version`) over free-text `notes`.
compatibility:
  agent_runtimes:
    - node
  node_version: ">=20"
  notes: "Postgres >=14; assumes psql or pg driver. Dry-run mode requires a non-production database."
allowed-tools: Read Grep Bash
# keywords: semantic phrases for fuzzy router activation. v8 cap: max 10.
# Keep terms a user would actually type when starting a task in this skill's domain.
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
# triggers: explicit-match activation phrases the router fires on literally.
# Use when label-based routing is intended; usually keywords + examples are enough.
triggers:
  - migrate-orders-to-canonical-schema
# paths: glob array of code surfaces this skill governs. Supports gitignore-style
# negation. Each glob should map to ONE canonical skill. Omit if purely conceptual.
paths:
  - "db/migrations/0004_canonicalize_orders.sql"
  - "db/schema.sql"
  - "scripts/migrate-orders.ts"
# examples: 2-5 realistic user prompts the skill SHOULD activate for.
# Written in the user's voice. Improves retrieval recall beyond keywords alone.
examples:
  - "run the 0004 orders migration that renames stripe_session_id to provider_order_id"
  - "safely remove the stripe_customer_id column after backfilling provider_customer_id"
  - "update the RLS policy on orders after the column rename"
  - "verify that every order row has a non-null provider_order_id before dropping the old column"
# anti_examples: near-miss prompts that should route ELSEWHERE.
# Pair with relations.suppresses (or legacy boundary alias) to name the confusable territory's owner.
anti_examples:
  - "design a different migration for the invoices table"
  - "add row level security to a new table"
  - "query the orders table in an application route"
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
    - postgres-rls-pattern
    - payment-provider-router
  depends_on:
    - postgres-rls-pattern
  verify_with:
    - postgres-rls-pattern
# grounding: required when `project[]` is non-empty. Declares the truth sources
# the skill anchors to and the failure modes those sources prevent. Omit when the
# skill is universal-knowledge. `subject_matter` replaces v8 `domain_object`.
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
# project: projects this skill is linked to. Array of {handle, role} objects.
# Non-empty project[] anchors the skill to a project and requires `grounding`.
# Suggested role values: source-of-truth, consumer, mirror. Replaces original v8 `workspace_tags`.
project:
  - handle: saas-stripe-postgres
    role: primary
---

# Migrate Orders to Canonical Schema

## Concept of the skill

**What it is:** The safe migration procedure for moving an orders table from Stripe-specific columns to provider-neutral columns.
**Mental model:** Add the new shape beside the old one, backfill and observe, then remove the old shape only after application reads have moved.
**Why it exists:** Billing tables sit under live traffic, so schema changes need compatibility windows and explicit validation.
**What it is NOT:** It is not generic data modeling, a new provider router, or the steady-state RLS query pattern.
**Adjacent concepts:** Expand-and-contract migrations, backfills, idempotency checks, RLS policy updates.
**One-line analogy:** It is changing the rails under a moving train by laying the new track beside the old track first.
**Common misconception:** A database rename is atomic enough by itself; application deploy timing makes old and new column reads coexist.

## Coverage

- The four-phase safe migration procedure applied to the orders table: *add nullable columns → backfill from existing → validate → drop legacy columns*; why collapsing any two phases is unsafe under live traffic
- The canonical column mapping: `stripe_session_id` → `provider_order_id`, `stripe_customer_id` → `provider_customer_id`, with a new `provider` column set to `'stripe'` for existing rows
- The RLS policy update — the existing `orders_org_select` policy must be updated in the same migration that renames the columns if the policy references them (it does not in this case, but the checklist step prevents future drift)
- Application code audit — grepping for `stripe_session_id` and `stripe_customer_id` in the codebase to find every reference that must be updated before the old columns are dropped
- The dry-run gate — `scripts/migrate-orders.ts` runs in `--dry-run` by default, printing the diff without committing; `--apply` is the explicit opt-in

## Philosophy of the skill

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
