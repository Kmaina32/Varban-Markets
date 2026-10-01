
-- VARBAN MARKETS — INSTITUTIONAL SUPABASE SCHEMA
-- This schema handles user profiles, financial ledgers, and RLS policies.

-- 1. PROFILES TABLE
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  first_name text,
  last_name text,
  full_name text,
  email text,
  phone text,
  country text,
  photo_url text,
  balance decimal(12,2) default 0.00,
  equity decimal(12,2) default 0.00,
  currency text default 'USD',
  verification_status text default 'Not Verified',
  role text default 'Trader',
  referral_code text unique,
  referred_by uuid references auth.users,
  mfa_enabled boolean default false,
  alert_preferences jsonb default '{"newTrades": true, "withdrawSuccess": true, "securityAlerts": true, "systemStatus": true}'::jsonb,
  language text default 'ENGLISH',
  timezone text default 'UTC+0',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. POSITIONS TABLE (Trading Ledger)
create table positions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  instrument text not null,
  vector text check (vector in ('CALL', 'PUT')),
  entry_price decimal(16,8) not null,
  exit_price decimal(16,8),
  stake decimal(12,2) not null,
  profit decimal(12,2),
  duration text not null,
  status text default 'Open' check (status in ('Open', 'Closed')),
  is_demo boolean default false,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. TRANSACTIONS TABLE (Financial Ledger)
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  type text not null,
  amount decimal(12,2) not null,
  asset text default 'USD',
  status text default 'Pending' not null,
  ref text unique,
  tx_hash text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. WATCHLIST TABLE
create table watchlist (
  user_id uuid references auth.users not null,
  symbol text not null,
  name text,
  category text,
  primary key (user_id, symbol)
);

-- 5. TRIGGER: HANDLE NEW USER SIGNUP
-- This captures data from auth.signUp({ options: { data: { ... } } })
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
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
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country',
    upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8)),
    1000.00, -- Default welcome credit
    1000.00
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS) Policies
alter table profiles enable row level security;
alter table positions enable row level security;
alter table transactions enable row level security;
alter table watchlist enable row level security;

-- Admin Policy (Root Authority)
create policy "Admins have full access" on profiles
  using ( (select email from auth.users where id = auth.uid()) in ('macos8388@gmail.com', 'gmaina4242@gmail.com') );

-- User Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

create policy "Users can manage own positions" on positions using (auth.uid() = user_id);
create policy "Users can manage own transactions" on transactions using (auth.uid() = user_id);
create policy "Users can manage own watchlist" on watchlist using (auth.uid() = user_id);
