-- VARBAN MARKETS — INSTITUTIONAL LEDGER SETUP v4.0 (IDEMPOTENT)
-- This script synchronizes all tables, functions, triggers, and RLS policies.

-- 1. EXTENSIONS & FUNCTIONS
CREATE OR REPLACE FUNCTION is_admin(user_id uuid) 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND (role = 'Admin' OR email IN ('macos8388@gmail.com', 'gmaina4242@gmail.com'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overload for session-based check
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Automatically Provision Profile on Auth Signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, balance, equity, profile_completed)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    'Trader', 
    0, 
    0, 
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TABLE DEFINITIONS
-- PROFILES: Core identity node
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  country text DEFAULT 'Kenya',
  role text DEFAULT 'Trader' CHECK (role IN ('Trader', 'Admin')),
  balance numeric(20,2) DEFAULT 0,
  equity numeric(20,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  language text DEFAULT 'ENGLISH',
  timezone text DEFAULT 'UTC+0',
  -- Address
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  -- Investor Profile
  account_purpose text,
  origin_funds text,
  net_worth text,
  annual_income text,
  trade_forecast text,
  education text,
  employment_status text,
  source_wealth text,
  -- Verification
  verification_status text DEFAULT 'Not Verified',
  profile_completed boolean DEFAULT false,
  alert_preferences jsonb DEFAULT '{"newTrades": true, "withdrawSuccess": true, "securityAlerts": true, "systemStatus": true}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- TRANSACTIONS: Financial ledger
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'Vault Deposit', 'Crypto Withdrawal', etc.
  asset text NOT NULL, -- 'USD', 'USDT', etc.
  amount numeric(20,2) NOT NULL,
  status text DEFAULT 'Pending Verification',
  ref text UNIQUE NOT NULL,
  provider text,
  meta_data jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- POSITIONS: Trade exposure
CREATE TABLE IF NOT EXISTS public.positions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  instrument text NOT NULL,
  vector text CHECK (vector IN ('BUY', 'SELL')),
  entry_price numeric(20,6),
  stake numeric(20,2),
  duration text,
  status text DEFAULT 'Open',
  is_demo boolean DEFAULT false,
  timestamp bigint NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- WATCHLIST: User favorites
CREATE TABLE IF NOT EXISTS public.watchlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  name text,
  category text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, symbol)
);

-- CONTACT MESSAGES: Public support conduit
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text, -- Can be 'anonymous'
  full_name text,
  email text,
  topic text,
  message text,
  status text DEFAULT 'New',
  ref text UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- NEWS CACHE & ARTICLES: Intelligence
CREATE TABLE IF NOT EXISTS public.news_cache (
  uuid text PRIMARY KEY,
  title text,
  publisher text,
  published_at text,
  description text,
  image text,
  url text,
  category text[],
  synced_at timestamp with time zone DEFAULT now()
);

-- ADMIN LOGS: Immutable activity log
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email text,
  action_type text,
  target_user text,
  details jsonb,
  status text,
  timestamp timestamp with time zone DEFAULT now()
);

-- 3. RLS ACTIVATION
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Idempotent)
DO $$
BEGIN
    -- PROFILES
    DROP POLICY IF EXISTS "Users view own profile" ON profiles;
    CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
    DROP POLICY IF EXISTS "Users update own profile" ON profiles;
    CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

    -- TRANSACTIONS
    DROP POLICY IF EXISTS "Users view own transactions" ON transactions;
    CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id OR is_admin());
    DROP POLICY IF EXISTS "Users create transactions" ON transactions;
    CREATE POLICY "Users create transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin());

    -- POSITIONS
    DROP POLICY IF EXISTS "Users manage own positions" ON positions;
    CREATE POLICY "Users manage own positions" ON positions FOR ALL USING (auth.uid() = user_id OR is_admin());

    -- WATCHLIST
    DROP POLICY IF EXISTS "Users manage own watchlist" ON watchlist;
    CREATE POLICY "Users manage own watchlist" ON watchlist FOR ALL USING (auth.uid() = user_id OR is_admin());

    -- CONTACT MESSAGES
    DROP POLICY IF EXISTS "Public create contact" ON contact_messages;
    CREATE POLICY "Public create contact" ON contact_messages FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Admins view contact" ON contact_messages;
    CREATE POLICY "Admins view contact" ON contact_messages FOR SELECT USING (is_admin());

    -- NEWS
    DROP POLICY IF EXISTS "Global view news" ON news_cache;
    CREATE POLICY "Global view news" ON news_cache FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Admins manage news" ON news_cache;
    CREATE POLICY "Admins manage news" ON news_cache FOR ALL USING (is_admin());

    -- ADMIN LOGS
    DROP POLICY IF EXISTS "Admins view logs" ON admin_logs;
    CREATE POLICY "Admins view logs" ON admin_logs FOR SELECT USING (is_admin());
END
$$;

-- 5. TRIGGERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Operational Ledger Status: Synchronized & Verified.