
-- VARBAN MARKETS — INSTITUTIONAL SUPABASE SCHEMA (IDEMPOTENT)
-- This schema handles user profiles, trading ledgers, and RLS policies.

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  first_name text,
  last_name text,
  full_name text,
  email text,
  phone text,
  country text,
  photo_url text,
  balance decimal(12,2) DEFAULT 0.00,
  equity decimal(12,2) DEFAULT 0.00,
  currency text DEFAULT 'USD',
  verification_status text DEFAULT 'Not Verified',
  role text DEFAULT 'Trader',
  referral_code text UNIQUE,
  referred_by uuid REFERENCES auth.users,
  mfa_enabled boolean DEFAULT false,
  alert_preferences jsonb DEFAULT '{"newTrades": true, "withdrawSuccess": true, "securityAlerts": true, "systemStatus": true}'::jsonb,
  language text DEFAULT 'ENGLISH',
  timezone text DEFAULT 'UTC+0',
  cookie_consent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. POSITIONS TABLE (Trading Ledger)
CREATE TABLE IF NOT EXISTS public.positions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  instrument text NOT NULL,
  vector text CHECK (vector IN ('CALL', 'PUT')),
  entry_price decimal(16,8) NOT NULL,
  exit_price decimal(16,8),
  stake decimal(12,2) NOT NULL,
  profit decimal(12,2),
  duration text NOT NULL,
  status text DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  is_demo boolean DEFAULT false,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TRANSACTIONS TABLE (Financial Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL,
  amount decimal(12,2) NOT NULL,
  asset text DEFAULT 'USD',
  status text DEFAULT 'Pending' NOT NULL,
  ref text UNIQUE,
  tx_hash text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. WATCHLIST TABLE
CREATE TABLE IF NOT EXISTS public.watchlist (
  user_id uuid REFERENCES auth.users NOT NULL,
  symbol text NOT NULL,
  name text,
  category text,
  PRIMARY KEY (user_id, symbol)
);

-- 5. TRIGGER: HANDLE NEW USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    full_name, 
    email, 
    phone, 
    country, 
    referral_code,
    balance,
    equity
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)),
    1000.00,
    1000.00
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup existing trigger to prevent duplicate execution errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Admin Policy (Optimized)
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
CREATE POLICY "Admins have full access" ON public.profiles
  USING ( auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') );

-- User Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can manage own positions" ON public.positions;
CREATE POLICY "Users can manage own positions" ON public.positions USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions" ON public.transactions USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;
CREATE POLICY "Users can manage own watchlist" ON public.watchlist USING (auth.uid() = user_id);
