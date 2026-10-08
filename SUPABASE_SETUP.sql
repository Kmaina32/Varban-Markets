-- VARBAN MARKETS — INSTITUTIONAL LEDGER ORCHESTRATION (v2.1)
-- This script provisions the schema and fixes the "Infinite Recursion" RLS error.

-- 1. EXTENSIONS & FUNCTIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. CORE TABLES

-- PROFILES: Trading Entity Registry
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  country text,
  balance numeric DEFAULT 0.00,
  equity numeric DEFAULT 0.00,
  currency text DEFAULT 'USD',
  language text DEFAULT 'ENGLISH',
  timezone text DEFAULT 'UTC+0',
  role text DEFAULT 'Trader',
  verification_status text DEFAULT 'Not Verified',
  profile_completed boolean DEFAULT false,
  photo_url text,
  
  -- Address Information
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
  
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRANSACTIONS: Financial Ledger
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL, -- 'Deposit', 'Withdrawal', 'Trade Settlement'
  asset text NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'Pending',
  ref text UNIQUE NOT NULL,
  provider text,
  meta_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- WATCHLIST: Market Favorites
CREATE TABLE IF NOT EXISTS public.watchlist (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  name text,
  category text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, symbol)
);

-- CONTACT MESSAGES: Support Ingestion
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id text, -- Can be 'anonymous'
  full_name text NOT NULL,
  email text NOT NULL,
  topic text,
  message text NOT NULL,
  status text DEFAULT 'New',
  ref text UNIQUE,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SECURITY POLICIES (RLS)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RECURSION FIX: We use auth.jwt() directly for root admin emails to avoid querying the profiles table.
-- This breaks the infinite loop.

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
CREATE POLICY "Admins have full access to profiles" ON public.profiles
FOR ALL USING (
  (auth.jwt() ->> 'email') IN ('macos8388@gmail.com', 'gmaina4242@gmail.com')
);

-- TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
CREATE POLICY "Users can create own transactions" ON public.transactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions
FOR ALL USING (
  (auth.jwt() ->> 'email') IN ('macos8388@gmail.com', 'gmaina4242@gmail.com')
);

-- WATCHLIST POLICIES
DROP POLICY IF EXISTS "Users manage own watchlist" ON public.watchlist;
CREATE POLICY "Users manage own watchlist" ON public.watchlist
FOR ALL USING (auth.uid() = user_id);

-- CONTACT MESSAGES POLICIES
DROP POLICY IF EXISTS "Public can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public can submit contact messages" ON public.contact_messages
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contact messages" ON public.contact_messages;
CREATE POLICY "Admins can view contact messages" ON public.contact_messages
FOR ALL USING (
  (auth.jwt() ->> 'email') IN ('macos8388@gmail.com', 'gmaina4242@gmail.com')
);

-- 4. TRIGGERS

-- Automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'Trader'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Handle updated_at on profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();