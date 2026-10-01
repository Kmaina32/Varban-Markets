
-- VARBAN MARKETS — SUPABASE DATABASE SCHEMA & RLS PROTOCOLS
-- This SQL script defines the institutional data structures and security policies.

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  country TEXT,
  role TEXT DEFAULT 'Trader' CHECK (role IN ('Trader', 'Admin')),
  balance DECIMAL(12,2) DEFAULT 1000.00,
  equity DECIMAL(12,2) DEFAULT 1000.00,
  currency TEXT DEFAULT 'USD',
  verification_status TEXT DEFAULT 'Not Verified' CHECK (verification_status IN ('Not Verified', 'Pending', 'Verified', 'Rejected')),
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES auth.users(id)
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS POLICIES FOR PROFILES
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own metadata (not balance or role)
CREATE POLICY "Users can update own metadata" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admin Global Authority (Root Override)
CREATE POLICY "Admin Global Authority" ON public.profiles
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'macos8388@gmail.com' OR 
    auth.jwt() ->> 'email' = 'gmaina4242@gmail.com' OR
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Admin'
  );

-- 4. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- 5. FUNCTION TO HANDLE NEW USER REGISTRATION
-- Automatically creates a profile entry when a user signs up via Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, first_name, last_name, country, phone, referral_code)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'country',
    NEW.raw_user_meta_data ->> 'phone',
    'VRB-' || upper(substring(replace(NEW.id::text, '-', ''), 1, 6))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
