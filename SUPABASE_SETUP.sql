
-- VARBAN MARKETS: INSTITUTIONAL LEDGER SETUP v2.0
-- This script is idempotent: it can be run multiple times to synchronize schema and security policies.

-- 1. TABLES INITIALIZATION
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT DEFAULT 'United Kingdom',
  balance DECIMAL(20, 2) DEFAULT 0.00,
  equity DECIMAL(20, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  verification_status TEXT DEFAULT 'Not Verified',
  role TEXT DEFAULT 'Trader',
  profile_completed BOOLEAN DEFAULT FALSE,
  
  -- Address Data
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Investor Profile Data
  account_purpose TEXT,
  origin_funds TEXT,
  net_worth TEXT,
  annual_income TEXT,
  trade_forecast TEXT,
  education TEXT,
  employment_status TEXT,
  source_wealth TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'Vault Deposit', 'Withdrawal', 'Trade Settlement', etc.
  asset TEXT DEFAULT 'USD',
  amount DECIMAL(20, 2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  ref TEXT UNIQUE,
  provider TEXT,
  meta_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT, -- Can be UUID or 'anonymous'
  full_name TEXT,
  email TEXT,
  topic TEXT,
  message TEXT,
  status TEXT DEFAULT 'New',
  ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS articles (
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

CREATE TABLE IF NOT EXISTS news_cache (
  uuid TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  publisher TEXT,
  published_at TIMESTAMPTZ,
  url TEXT,
  image TEXT,
  category JSONB,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SECURITY ENFORCEMENT (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;

-- 3. POLICY RESET & DEFINITION
-- Profiles
DROP POLICY IF EXISTS "Profiles: Users view own" ON profiles;
CREATE POLICY "Profiles: Users view own" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: Users update own" ON profiles;
CREATE POLICY "Profiles: Users update own" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: Admin full access" ON profiles;
CREATE POLICY "Profiles: Admin full access" ON profiles FOR ALL USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com')
);

-- Transactions
DROP POLICY IF EXISTS "Transactions: Users view own" ON transactions;
CREATE POLICY "Transactions: Users view own" ON transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Transactions: Users create own" ON transactions;
CREATE POLICY "Transactions: Users create own" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Transactions: Admin full access" ON transactions;
CREATE POLICY "Transactions: Admin full access" ON transactions FOR ALL USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com')
);

-- Watchlist
DROP POLICY IF EXISTS "Watchlist: Users manage own" ON watchlist;
CREATE POLICY "Watchlist: Users manage own" ON watchlist FOR ALL USING (auth.uid() = user_id);

-- Contact Messages
DROP POLICY IF EXISTS "Contact: Public create" ON contact_messages;
CREATE POLICY "Contact: Public create" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Contact: Admin full access" ON contact_messages;
CREATE POLICY "Contact: Admin full access" ON contact_messages FOR ALL USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com')
);

-- Intelligence (Articles & Cache)
DROP POLICY IF EXISTS "Intelligence: Public view" ON articles;
CREATE POLICY "Intelligence: Public view" ON articles FOR SELECT USING (status = 'Published');

DROP POLICY IF EXISTS "Intelligence: Admin full access" ON articles;
CREATE POLICY "Intelligence: Admin full access" ON articles FOR ALL USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com')
);

DROP POLICY IF EXISTS "NewsCache: Public view" ON news_cache;
CREATE POLICY "NewsCache: Public view" ON news_cache FOR SELECT USING (true);

DROP POLICY IF EXISTS "NewsCache: Admin full access" ON news_cache;
CREATE POLICY "NewsCache: Admin full access" ON news_cache FOR ALL USING (
  auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com')
);

-- 4. UTILITY TRIGGERS (Auto-Sync Updated At)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
