-- =====================================================
-- Stripe Subscription & User Provisioning Schema
-- =====================================================
-- Created: 2025-12-28
-- Purpose: Manage Stripe subscriptions, user entitlements, and webhook idempotency
-- 
-- IMPORTANT: 
-- - Do NOT modify auth.users schema
-- - All app data lives in public schema
-- - Stripe is source of truth for billing
-- - Supabase stores derived state for app queries

-- =====================================================
-- 1. USER SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Plan and Status
  plan TEXT NOT NULL CHECK (plan IN ('free', 'basic', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid')),
  
  -- Subscription Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one subscription per user
  CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Index for fast lookups by Stripe IDs
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer 
  ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription 
  ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
  ON public.user_subscriptions(user_id);

-- =====================================================
-- 2. STRIPE EVENTS TABLE (Idempotency Ledger)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.stripe_events (
  event_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Optional: store payload for debugging
  payload JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for event type queries
CREATE INDEX IF NOT EXISTS idx_stripe_events_type 
  ON public.stripe_events(type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created 
  ON public.stripe_events(created_at DESC);

-- =====================================================
-- 3. USER ENTITLEMENTS TABLE (Feature Flags)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_entitlements (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Feature Flags
  can_access_dashboard BOOLEAN DEFAULT FALSE,
  max_properties INTEGER DEFAULT 0,
  max_animals INTEGER DEFAULT 0,
  max_crops INTEGER DEFAULT 0,
  can_export_data BOOLEAN DEFAULT FALSE,
  can_use_analytics BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. HELPER VIEW: Active Subscriptions
-- =====================================================
CREATE OR REPLACE VIEW public.active_subscriptions AS
SELECT 
  us.*,
  CASE 
    WHEN us.status IN ('active', 'trialing') THEN TRUE
    ELSE FALSE
  END as is_active,
  CASE
    WHEN us.current_period_end > NOW() THEN TRUE
    ELSE FALSE
  END as is_current
FROM public.user_subscriptions us;

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- User Subscriptions Policies
-- Users can only SELECT their own subscription data
CREATE POLICY "Users can view own subscriptions" 
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can INSERT/UPDATE/DELETE subscriptions
-- (No user-facing policy - all mutations via API with service role)

-- User Entitlements Policies
-- Users can only SELECT their own entitlements
CREATE POLICY "Users can view own entitlements" 
  ON public.user_entitlements
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can INSERT/UPDATE/DELETE entitlements

-- Stripe Events Policies
-- No user access - service role only
-- (No policies needed - RLS enabled but no user policies = deny all)

-- =====================================================
-- 6. TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_entitlements_updated_at
  BEFORE UPDATE ON public.user_entitlements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. HELPER FUNCTION: Get User Plan
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_user_plan(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_plan TEXT;
BEGIN
  SELECT plan INTO v_plan
  FROM public.user_subscriptions
  WHERE user_id = p_user_id
    AND status IN ('active', 'trialing')
  LIMIT 1;
  
  RETURN COALESCE(v_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. HELPER FUNCTION: Sync Entitlements from Plan
-- =====================================================
CREATE OR REPLACE FUNCTION public.sync_user_entitlements(p_user_id UUID, p_plan TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_entitlements (
    user_id,
    can_access_dashboard,
    max_properties,
    max_animals,
    max_crops,
    can_export_data,
    can_use_analytics
  ) VALUES (
    p_user_id,
    CASE 
      WHEN p_plan IN ('basic', 'pro') THEN TRUE
      ELSE FALSE
    END,
    CASE 
      WHEN p_plan = 'pro' THEN 9999
      WHEN p_plan = 'basic' THEN 10
      ELSE 2
    END,
    CASE 
      WHEN p_plan = 'pro' THEN 9999
      WHEN p_plan = 'basic' THEN 50
      ELSE 10
    END,
    CASE 
      WHEN p_plan = 'pro' THEN 9999
      WHEN p_plan = 'basic' THEN 50
      ELSE 10
    END,
    CASE 
      WHEN p_plan = 'pro' THEN TRUE
      ELSE FALSE
    END,
    CASE 
      WHEN p_plan IN ('basic', 'pro') THEN TRUE
      ELSE FALSE
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    can_access_dashboard = EXCLUDED.can_access_dashboard,
    max_properties = EXCLUDED.max_properties,
    max_animals = EXCLUDED.max_animals,
    max_crops = EXCLUDED.max_crops,
    can_export_data = EXCLUDED.can_export_data,
    can_use_analytics = EXCLUDED.can_use_analytics,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created:
--   - public.user_subscriptions
--   - public.stripe_events  
--   - public.user_entitlements
-- Views created:
--   - public.active_subscriptions
-- Functions created:
--   - public.get_user_plan(user_id)
--   - public.sync_user_entitlements(user_id, plan)
-- RLS enabled with user SELECT policies only
-- =====================================================
