-- 1. CLEANUP: Reset existing RLS to ensure clean state
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- 2. ADMIN AUTHORITY FUNCTION (Mirrors Firebase isAdmin logic)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    -- Hardcoded Root Emails
    auth.jwt() ->> 'email' IN ('macos8388@gmail.com', 'gmaina4242@gmail.com')
    OR 
    -- Database Role Check (Security Definer bypasses RLS recursion)
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TABLE INITIALIZATION (Ensuring all rule-target tables exist)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  first_name text,
  last_name text,
  phone text,
  country text,
  photo_url text,
  role text DEFAULT 'Trader',
  verification_status text DEFAULT 'Not Verified',
  balance decimal DEFAULT 1000.00,
  equity decimal DEFAULT 1000.00,
  created_at timestamp with time zone DEFAULT now(),
  alert_preferences jsonb DEFAULT '{"newTrades": true, "withdrawSuccess": true, "securityAlerts": true, "systemStatus": true}'::jsonb,
  language text DEFAULT 'ENGLISH',
  timezone text DEFAULT 'UTC+0',
  currency text DEFAULT 'USD'
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  full_name text,
  email text,
  topic text,
  message text,
  status text DEFAULT 'New',
  created_at timestamp with time zone DEFAULT now(),
  ref text
);

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  body text,
  category text,
  asset_tag text,
  status text DEFAULT 'Draft',
  author text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.news_cache (
  id text PRIMARY KEY, -- Using provider UUID
  title text,
  description text,
  publisher text,
  published_at timestamp with time zone,
  image text,
  url text,
  category text[],
  synced_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.settings (
  id text PRIMARY KEY,
  data jsonb,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text,
  amount decimal,
  asset text,
  status text,
  ref text,
  provider text,
  created_at timestamp with time zone DEFAULT now(),
  meta_data jsonb
);

CREATE TABLE IF NOT EXISTS public.positions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  instrument text,
  vector text,
  entry_price decimal,
  stake decimal,
  duration text,
  status text,
  profit decimal,
  is_demo boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name text,
  ip text,
  os text,
  browser text,
  last_active timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email text,
  action_type text,
  target_user text,
  details jsonb,
  status text,
  created_at timestamp with time zone DEFAULT now()
);

-- 4. ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 5. APPLY POLICIES (Mapping Firebase rules to SQL)

-- Profiles: Own access OR Admin access
CREATE POLICY "Profiles access" ON public.profiles FOR ALL TO authenticated 
USING (auth.uid() = id OR is_admin());

-- Contact Messages: Anyone can create, Admins manage
CREATE POLICY "Public create contact" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage contact" ON public.contact_messages FOR ALL USING (is_admin());

-- Articles: Public read, Admins write
CREATE POLICY "Public read articles" ON public.articles FOR SELECT USING (true);
CREATE POLICY "Admin manage articles" ON public.articles FOR ALL USING (is_admin());

-- News Cache: Global Read/Write (Verified via Proxy)
CREATE POLICY "Global news access" ON public.news_cache FOR ALL USING (true);

-- Settings: Auth read, Admin write
CREATE POLICY "Auth read settings" ON public.settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage settings" ON public.settings FOR ALL USING (is_admin());

-- Transactions & Positions: Own access OR Admin access
CREATE POLICY "Transactions user/admin access" ON public.transactions FOR SELECT TO authenticated 
USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Positions user/admin access" ON public.positions FOR SELECT TO authenticated 
USING (auth.uid() = user_id OR is_admin());

-- Sessions: Own access only
CREATE POLICY "User session access" ON public.sessions FOR ALL TO authenticated 
USING (auth.uid() = user_id);

-- Admin Logs: Admin only
CREATE POLICY "Admin log access" ON public.admin_logs FOR ALL USING (is_admin());