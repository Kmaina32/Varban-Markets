-- VARBAN MARKETS — INSTITUTIONAL LEDGER ORCHESTRATION
-- Execute this script in the Supabase SQL Editor to provision the required schema.

-- 1. EXTENSIONS & FUNCTIONS
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com') OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TABLE PROVISIONING (Idempotent)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  full_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  country text DEFAULT 'Kenya',
  photo_url text,
  balance decimal(12,2) DEFAULT 0.00,
  equity decimal(12,2) DEFAULT 0.00,
  currency text DEFAULT 'USD',
  verification_status text DEFAULT 'Not Verified',
  role text DEFAULT 'Trader',
  profile_completed boolean DEFAULT false
);

-- 3. SCHEMA PATCH: Missing Investor Profile Columns
-- This section fixes the "Could not find column" error by ensuring all fields exist.
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS account_purpose text,
ADD COLUMN IF NOT EXISTS origin_funds text,
ADD COLUMN IF NOT EXISTS net_worth text,
ADD COLUMN IF NOT EXISTS annual_income text,
ADD COLUMN IF NOT EXISTS trade_forecast text,
ADD COLUMN IF NOT EXISTS education text,
ADD COLUMN IF NOT EXISTS employment_status text,
ADD COLUMN IF NOT EXISTS source_wealth text,
ADD COLUMN IF NOT EXISTS alert_preferences jsonb DEFAULT '{"newTrades":true,"withdrawSuccess":true,"securityAlerts":true,"systemStatus":true}'::jsonb,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'ENGLISH',
ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'UTC+0';

-- 4. ADDITIONAL TABLES
CREATE TABLE IF NOT EXISTS transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  asset text NOT NULL,
  amount decimal(12,2) NOT NULL,
  status text DEFAULT 'Pending Verification',
  ref text UNIQUE,
  meta_data jsonb DEFAULT '{}'::jsonb,
  provider text
);

CREATE TABLE IF NOT EXISTS watchlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  name text,
  category text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, symbol)
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Profile Policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());

-- Transaction Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id OR is_admin());

DROP POLICY IF EXISTS "Users can create transactions" ON transactions;
CREATE POLICY "Users can create transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. TRIGGERS: NEW USER PROVISIONING
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, first_name, last_name, country)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'country'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Force Schema Cache Reload
NOTIFY pgrst, 'reload schema';
