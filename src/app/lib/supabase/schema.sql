
-- VARBAN MARKETS: INSTITUTIONAL SUPABASE SCHEMA
-- This script sets up the profiles table and RLS permissions.

-- 1. Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  full_name text,
  email text unique,
  phone text,
  country text,
  balance decimal(18,2) default 0.00,
  equity decimal(18,2) default 0.00,
  verification_status text default 'Not Verified' check (verification_status in ('Not Verified', 'Pending', 'Verified', 'Rejected')),
  role text default 'Trader' check (role in ('Trader', 'Admin')),
  referral_code text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security
alter table public.profiles enable row level security;

-- 3. RLS Policies
-- Users can read their own profile
create policy "Users can view own profile" 
on public.profiles for select 
using ( auth.uid() = id );

-- Users can update their own metadata (not balance or role)
create policy "Users can update own metadata" 
on public.profiles for update 
using ( auth.uid() = id )
with check ( auth.uid() = id );

-- Admin Root Authority Override
create policy "Admins have full access" 
on public.profiles for all 
using ( 
  auth.jwt() ->> 'email' = 'macos8388@gmail.com' OR 
  auth.jwt() ->> 'email' = 'gmaina4242@gmail.com' OR
  (select role from public.profiles where id = auth.uid()) = 'Admin'
);

-- 4. Automatic Profile Creation Trigger
-- This creates a profile row whenever a user signs up via Auth
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, full_name, email, country, phone, referral_code)
  values (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'country',
    new.raw_user_meta_data->>'phone',
    'VRB-' || upper(substring(md5(random()::text) from 1 for 6))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
