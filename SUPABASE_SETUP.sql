-- VARBAN MARKETS — INSTITUTIONAL SUPABASE SETUP
-- This script initializes the ledger tables and security policies.
-- Run this in your Supabase SQL Editor.

-- 1. PROFILES TABLE (Identity & Registration)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  photo_url TEXT,
  balance DECIMAL(20,2) DEFAULT 0.00,
  equity DECIMAL(20,2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  verification_status TEXT DEFAULT 'Not Verified',
  role TEXT DEFAULT 'Trader',
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Address Information
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Investor Profile
  account_purpose TEXT,
  origin_funds TEXT,
  net_worth TEXT,
  annual_income TEXT,
  trade_forecast TEXT,
  education TEXT,
  employment_status TEXT,
  source_wealth TEXT,
  
  -- Preferences
  language TEXT DEFAULT 'ENGLISH',
  timezone TEXT DEFAULT 'UTC+0',
  alert_preferences JSONB DEFAULT '{"newTrades": true, "withdrawSuccess": true, "securityAlerts": true, "systemStatus": true}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. TRANSACTIONS TABLE (Financial Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'Deposit', 'Withdrawal', 'Trade Settlement'
  asset TEXT DEFAULT 'USD',
  amount DECIMAL(20,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  ref TEXT UNIQUE,
  provider TEXT,
  meta_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. WATCHLIST TABLE (User Market Favorites)
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- 4. CONTACT MESSAGES (Public Ingestion)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT, -- Might be 'anonymous'
  full_name TEXT,
  email TEXT,
  topic TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 5. INTELLIGENCE CACHE (Market News)
CREATE TABLE IF NOT EXISTS public.news_cache (
  uuid TEXT PRIMARY KEY,
  title TEXT,
  publisher TEXT,
  published_at TEXT,
  description TEXT,
  url TEXT,
  image TEXT,
  category JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;

-- 6. ARTICLES (Admin Authored)
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  body TEXT,
  category TEXT,
  asset_tag TEXT,
  status TEXT DEFAULT 'Draft',
  author TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- IDEMPOTENT RLS POLICIES (DROP BEFORE CREATE)

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

-- Transactions Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

-- Watchlist Policies
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;
CREATE POLICY "Users can manage own watchlist" ON public.watchlist FOR ALL USING (auth.uid() = user_id);

-- Contact Messages Policies
DROP POLICY IF EXISTS "Public create contact" ON public.contact_messages;
CREATE POLICY "Public create contact" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view contacts" ON public.contact_messages;
CREATE POLICY "Admins can view contacts" ON public.contact_messages FOR SELECT USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);

-- News Cache Policies
DROP POLICY IF EXISTS "Public can view news" ON public.news_cache;
CREATE POLICY "Public can view news" ON public.news_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insertion to news cache" ON public.news_cache;
CREATE POLICY "Allow insertion to news cache" ON public.news_cache FOR INSERT WITH CHECK (true);

-- Articles Policies
DROP POLICY IF EXISTS "Public can view published articles" ON public.articles;
CREATE POLICY "Public can view published articles" ON public.articles FOR SELECT USING (status = 'Published');

DROP POLICY IF EXISTS "Admins can manage articles" ON public.articles;
CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
);