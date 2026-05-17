-- Canonical schema for saas-stripe-postgres example project
-- Demonstrates: multi-tenant tables, RLS policies, provider-agnostic payment columns

-- ─────────────────────────────────────────────────
-- Organizations (tenant root table)
-- ─────────────────────────────────────────────────
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────────────
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, email)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

CREATE POLICY users_org_select ON users
  FOR SELECT
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY users_org_insert ON users
  FOR INSERT
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY users_org_update ON users
  FOR UPDATE
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);

CREATE POLICY users_org_delete ON users
  FOR DELETE
  USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- ─────────────────────────────────────────────────
-- Subscriptions
-- ─────────────────────────────────────────────────
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions FORCE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_org_select ON subscriptions
  FOR SELECT USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY subscriptions_org_insert ON subscriptions
  FOR INSERT WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY subscriptions_org_update ON subscriptions
  FOR UPDATE
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY subscriptions_org_delete ON subscriptions
  FOR DELETE USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- ─────────────────────────────────────────────────
-- Orders (canonical provider-agnostic schema)
-- Post-migration 0004: uses provider/provider_order_id columns,
-- not the Stripe-specific stripe_session_id/stripe_customer_id.
-- ─────────────────────────────────────────────────
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stripe',      -- 'stripe', 'paddle', etc.
  provider_order_id TEXT NOT NULL,              -- was: stripe_session_id
  provider_customer_id TEXT,                    -- was: stripe_customer_id
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_order_id)
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

CREATE POLICY orders_org_select ON orders
  FOR SELECT USING (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY orders_org_insert ON orders
  FOR INSERT WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY orders_org_update ON orders
  FOR UPDATE
  USING (org_id = current_setting('app.current_org_id', true)::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id', true)::uuid);
CREATE POLICY orders_org_delete ON orders
  FOR DELETE USING (org_id = current_setting('app.current_org_id', true)::uuid);

-- ─────────────────────────────────────────────────
-- Webhook events (idempotency log)
-- Not tenant-bound — events arrive before org context is known.
-- ─────────────────────────────────────────────────
CREATE TABLE webhook_events (
  event_id TEXT PRIMARY KEY,   -- Stripe event.id or provider equivalent
  provider TEXT NOT NULL DEFAULT 'stripe',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
