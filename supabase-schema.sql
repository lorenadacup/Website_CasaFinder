-- =============================================
-- CasaFinder Supabase Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- USERS TABLE
create table if not exists public.users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  name text not null,
  role text not null check (role in ('student', 'landlord', 'admin')),
  password text,
  email text,
  mobile text,
  school text,
  bio text,
  address text,
  emergency_contact text,
  avatar text,
  facebook text,
  facebook_link text,
  permit_no text,
  permit_file text,
  permit_status text,
  account_status text default 'approved' check (account_status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  age text,
  gender text,
  occupation text,
  pref_location text,
  pref_type text,
  budget_min text,
  budget_max text,
  occupants text default '1',
  move_in text,
  stay_duration text,
  pets text,
  smoking text,
  business_name text,
  years_operation text,
  created_at timestamptz default now()
);

-- PROPERTIES TABLE
create table if not exists public.properties (
  id text primary key,
  title text not null,
  price numeric not null,
  type text not null,
  beds integer default 1,
  baths integer default 1,
  sqft numeric default 15,
  address text,
  city text default 'Gumaca',
  neighborhood text,
  description text,
  image text,
  features jsonb default '[]',
  tags jsonb default '[]',
  year_built integer default 2020,
  parking text default 'No Parking',
  heating text default 'Electric Fan',
  coordinates jsonb default '{"x": 0, "y": 0}',
  gender_policy text default 'Both',
  reviews jsonb default '[]',
  landlord_username text,
  landlord_name text,
  landlord_mobile text,
  landlord_email text,
  landlord_facebook text,
  landlord_avatar text,
  landlord_bio text,
  landlord_permits jsonb default '{}',
  approval_status text default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.properties enable row level security;

-- RLS POLICIES: allow all reads (public listings)
create policy "Allow public read users" on public.users
  for select using (true);

create policy "Allow public read properties" on public.properties
  for select using (true);

-- RLS POLICIES: allow insert/update for authenticated and anon
create policy "Allow insert users" on public.users
  for insert with check (true);

create policy "Allow update users" on public.users
  for update using (true);

create policy "Allow insert properties" on public.properties
  for insert with check (true);

create policy "Allow update properties" on public.properties
  for update using (true);

create policy "Allow delete properties" on public.properties
  for delete using (true);
