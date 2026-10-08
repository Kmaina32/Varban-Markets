-- VARBAN MARKETS — INSTITUTIONAL LEDGER ORCHESTRATION (V2.1)
-- This script provisions the schema and resolves RLS recursion errors.

-- 1. EXTENSIONS & FUNCTIONS
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. CORE IDENTITY LEDGER (PROFILES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  country text,
  photo_url text,
  role text DEFAULT 'Trader' CHECK (role IN ('Trader', 'Admin')),
  balance numeric(20,2) DEFAULT 0.00,
  equity numeric(20,2) DEFAULT 0.00,
  verification_status text DEFAULT 'Not Verified' CHECK (verification_status IN ('Not Verified', 'Pending', 'Verified', 'Rejected')),
  profile_completed boolean DEFAULT false,
  
  -- Address Data
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip_code text,
  
  -- Investor Profile Data
  account_purpose text,
  origin_funds text,
  net_worth text,
  annual_income text,
  trade_forecast text,
  education text,
  employment_status text,
  source_wealth text,
  
  alert_preferences jsonb DEFAULT '{"newTrades": true, "withdrawSuccess": true, "securityAlerts": true, "systemStatus": true}'::jsonb,
  currency text DEFAULT 'USD',
  language text DEFAULT 'ENGLISH',
  timezone text DEFAULT 'UTC+0',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- 3. RECURSION-SAFE AUTHORITY CHECK
-- SECURITY DEFINER allows this function to bypass RLS to check roles
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN (
    (auth.jwt() ->> 'email') IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );
END;
$$;

-- 4. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. IDEMPOTENT POLICIES (DROPPING FIRST TO PREVENT CONFLICTS)
DROP POLICY IF EXISTS "Public read profile" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;

CREATE POLICY "Public read profile" ON profiles FOR SELECT TO authenticated 
USING ( auth.uid() = id OR is_admin() );

CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated 
USING ( auth.uid() = id )
WITH CHECK ( auth.uid() = id );

CREATE POLICY "Admin full access" ON profiles FOR ALL TO authenticated 
USING ( is_admin() );

-- 6. AUTOMATED PROVISIONING TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, first_name, last_name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    'Trader'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. SUB-COLLECTION TABLES
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  asset text NOT NULL,
  amount numeric(20,2) NOT NULL,
  status text NOT NULL,
  ref text UNIQUE,
  meta_data jsonb DEFAULT '{}'::jsonb,
  provider text,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  name text,
  category text,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text,
  full_name text,
  email text,
  topic text,
  message text,
  status text DEFAULT 'New',
  ref text,
  timestamp timestamptz DEFAULT NOW()
);

-- 8. ENABLE RLS FOR SUB-COLLECTIONS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Transactions Policies
DROP POLICY IF EXISTS "Users view own tx" ON transactions;
DROP POLICY IF EXISTS "Admin view all tx" ON transactions;
CREATE POLICY "Users view own tx" ON transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin view all tx" ON transactions FOR ALL TO authenticated USING (is_admin());

-- Watchlist Policies
DROP POLICY IF EXISTS "Users manage own watchlist" ON watchlist;
CREATE POLICY "Users manage own watchlist" ON watchlist FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Contact Messages Policies
DROP POLICY IF EXISTS "Anyone can create contact" ON contact_messages;
DROP POLICY IF EXISTS "Admins view contact" ON contact_messages;
CREATE POLICY "Anyone can create contact" ON contact_messages FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins view contact" ON contact_messages FOR ALL TO authenticated USING (is_admin());

-- 9. NOTIFY SCHEMA RELOAD
NOTIFY pgrst, 'reload schema';