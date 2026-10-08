
-- ==========================================
-- VARBAN MARKETS — INSTITUTIONAL LEDGER SETUP
-- Database: Supabase (PostgreSQL)
-- ==========================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. HELPER FUNCTIONS
-- Check if the requesting entity holds Root Administrative Authority
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' = 'macos8388@gmail.com' OR 
    auth.jwt() ->> 'email' = 'gmaina4242@gmail.com' OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TABLES DEFINITION

-- PROFILES: Core Identity Ledger
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  country TEXT,
  photo_url TEXT,
  
  -- Financials
  balance DECIMAL(20, 2) DEFAULT 0.00,
  equity DECIMAL(20, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  
  -- Status
  verification_status TEXT DEFAULT 'Not Verified' CHECK (verification_status IN ('Not Verified', 'Pending', 'Verified', 'Rejected')),
  role TEXT DEFAULT 'Trader' CHECK (role IN ('Trader', 'Admin')),
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Address (Institutional KYC)
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Investor Profile (Regulatory)
  account_purpose TEXT,
  origin_funds TEXT,
  net_worth TEXT,
  annual_income TEXT,
  trade_forecast TEXT,
  education TEXT,
  employment_status TEXT,
  source_wealth TEXT,
  
  -- Preferences
  alert_preferences JSONB DEFAULT '{"newTrades": true, "withdrawSuccess": true, "securityAlerts": true, "systemStatus": true}'::jsonb,
  language TEXT DEFAULT 'ENGLISH',
  timezone TEXT DEFAULT 'UTC+0',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TRANSACTIONS: Financial Event Log
CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  asset TEXT,
  amount DECIMAL(20, 2) NOT NULL,
  status TEXT DEFAULT 'Pending' NOT NULL,
  ref TEXT UNIQUE,
  meta_data JSONB,
  provider TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WATCHLIST: User Market Favorites
CREATE TABLE public.watchlist (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, symbol)
);

-- CONTACT MESSAGES: Support Ingestion
CREATE TABLE public.contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT,
  email TEXT,
  topic TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  ref TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ARTICLES: Market Insights
CREATE TABLE public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT,
  asset_tag TEXT,
  status TEXT DEFAULT 'Draft',
  author TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEWS CACHE: Real-time Intelligence
CREATE TABLE public.news_cache (
  uuid TEXT PRIMARY KEY,
  title TEXT,
  published_at TIMESTAMPTZ,
  publisher TEXT,
  description TEXT,
  url TEXT,
  image TEXT,
  category JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (is_admin());

-- Transactions
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all transactions" ON public.transactions FOR ALL USING (is_admin());

-- Watchlist
CREATE POLICY "Users can manage own watchlist" ON public.watchlist FOR ALL USING (auth.uid() = user_id);

-- Contact Messages
CREATE POLICY "Public can submit contact messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage contact messages" ON public.contact_messages FOR ALL USING (is_admin());

-- Articles
CREATE POLICY "Everyone can read articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (is_admin());

-- News Cache
CREATE POLICY "Everyone can read news cache" ON public.news_cache FOR SELECT USING (true);
CREATE POLICY "System can manage news cache" ON public.news_cache FOR ALL USING (true); -- Internal proxy handles this

-- 6. AUTOMATED UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
