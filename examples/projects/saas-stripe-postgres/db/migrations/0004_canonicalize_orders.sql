-- Migration 0004: Canonicalize orders table
-- Changes: Stripe-specific column names → provider-agnostic names
--   stripe_session_id   → provider_order_id
--   stripe_customer_id  → provider_customer_id
--   (new) provider column set to 'stripe' for all existing rows
--
-- SAFE MIGRATION — four-phase procedure:
--   Phase 1: Add nullable columns (this file, deploy first)
--   Phase 2: Backfill data (this file, run after Phase 1 deploys)
--   Phase 3: Update application code to read new columns (manual, 24h observation)
--   Phase 4: Drop legacy columns (separate migration file 0004b)
--
-- Do NOT run Phase 4 (0004b) until 0 reads of stripe_session_id appear in logs
-- for at least 24 hours after Phase 3 application deployment.

-- ─── Phase 1: Add nullable canonical columns ─────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_customer_id TEXT;

-- ─── Phase 2: Backfill from Stripe-specific columns ──────────────────────────
-- Run: psql $DATABASE_URL -f 0004_canonicalize_orders.sql
-- Or: node scripts/migrate-orders.ts --apply (dry-run by default)

UPDATE orders
SET
  provider = 'stripe',
  provider_order_id = stripe_session_id,
  provider_customer_id = stripe_customer_id
WHERE provider IS NULL;

-- Verify: SELECT COUNT(*) FROM orders WHERE provider IS NULL;
-- Expected: 0 rows

-- ─── Phase 4 is in 0004b_drop_legacy_columns.sql ────────────────────────────
-- Only run 0004b after Phase 3 observation period (24h, zero old-column reads).
