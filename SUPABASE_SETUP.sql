
-- ==========================================
-- VARBAN MARKETS — INSTITUTIONAL LEDGER SETUP
-- Version: 2.1 (Idempotent)
-- ==========================================

-- 1. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE: PROFILES (Core Identity Node)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  photo_url TEXT,
  verification_status TEXT DEFAULT 'Not Verified',
  role TEXT DEFAULT 'Trader',
  balance NUMERIC(20, 2) DEFAULT 0,
  equity NUMERIC(20, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'ENGLISH',
  timezone TEXT DEFAULT 'UTC+0',
  alert_preferences JSONB DEFAULT '{"newTrades": true, "withdrawSuccess": true, "securityAlerts": true, "systemStatus": true}'::jsonb,
  profile_completed BOOLEAN DEFAULT FALSE,
  referral_code TEXT DEFAULT UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6)),
  referred_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. TABLE: TRANSACTIONS (Financial Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'Crypto Deposit', 'Withdrawal', 'Vault Deposit'
  amount NUMERIC(20, 2) NOT NULL,
  asset TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'Pending',
  ref TEXT UNIQUE,
  provider TEXT,
  meta_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. TABLE: WATCHLIST (Custom Market Nodes)
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, symbol)
);

-- 5. TABLE: CONTACT_MESSAGES (Support Ingestion)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT, -- Can be UUID string or 'anonymous'
  full_name TEXT,
  email TEXT,
  topic TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. TABLE: ARTICLES (Intelligence Registry)
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT,
  asset_tag TEXT,
  status TEXT DEFAULT 'Published',
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. TABLE: NEWS_CACHE (Real-time Proxy Cache)
CREATE TABLE IF NOT EXISTS public.news_cache (
  uuid TEXT PRIMARY KEY,
  title TEXT,
  publisher TEXT,
  description TEXT,
  url TEXT,
  image TEXT,
  category JSONB,
  published_at TIMESTAMP WITH TIME ZONE,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==========================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;

-- ADMIN HELPER FUNCTION
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Admins have full profile access" ON public.profiles;
CREATE POLICY "Admins have full profile access" ON public.profiles FOR ALL USING (is_admin());

-- TRANSACTIONS POLICIES
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full transaction access" ON public.transactions;
CREATE POLICY "Admins have full transaction access" ON public.transactions FOR ALL USING (is_admin());

-- WATCHLIST POLICIES
DROP POLICY IF EXISTS "Users can manage own watchlist" ON public.watchlist;
CREATE POLICY "Users can manage own watchlist" ON public.watchlist FOR ALL USING (auth.uid() = user_id);

-- CONTACT MESSAGES POLICIES
DROP POLICY IF EXISTS "Public create contact" ON public.contact_messages;
CREATE POLICY "Public create contact" ON public.contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage contact messages" ON public.contact_messages;
CREATE POLICY "Admins manage contact messages" ON public.contact_messages FOR ALL USING (is_admin());

-- ARTICLES & NEWS POLICIES
DROP POLICY IF EXISTS "Anyone can read articles" ON public.articles;
CREATE POLICY "Anyone can read articles" ON public.articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage articles" ON public.articles;
CREATE POLICY "Admins manage articles" ON public.articles FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Anyone can read news cache" ON public.news_cache;
CREATE POLICY "Anyone can read news cache" ON public.news_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can update news cache" ON public.news_cache;
CREATE POLICY "System can update news cache" ON public.news_cache FOR ALL USING (true); -- Usually updated via server-side service role
