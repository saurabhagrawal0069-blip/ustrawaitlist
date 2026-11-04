-- Run this SQL in Supabase SQL Editor.
create sequence if not exists customer_waitlist_seq start 1;
create sequence if not exists business_waitlist_seq start 1;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  waitlist_number bigint not null default nextval('customer_waitlist_seq'),
  full_name text not null,
  phone text not null unique,
  email text,
  city text not null,
  locality text,
  services text[] not null default '{}',
  email_consent boolean not null default false,
  whatsapp_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  waitlist_number bigint not null default nextval('business_waitlist_seq'),
  owner_name text not null,
  phone text not null unique,
  email text,
  city text not null,
  locality text,
  business_name text not null,
  business_type text not null default 'Barber Shop',
  email_consent boolean not null default false,
  whatsapp_consent boolean not null default false,
  verification_status text not null default 'pending' check (verification_status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  registration_kind text not null check (registration_kind in ('customer','business')),
  registration_id uuid not null,
  channel text not null check (channel in ('email','whatsapp')),
  status text not null check (status in ('sent','failed','skipped')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_kind text not null check (referrer_kind in ('customer','business')),
  referrer_id uuid not null,
  referral_code text not null unique,
  referred_phone text,
  status text not null default 'pending' check (status in ('pending','completed','rewarded')),
  created_at timestamptz not null default now()
);

-- Rate limiting: a salted hash of the sender's IP address (the raw IP is never stored).
-- Safe to run on a database that already has these tables.
alter table public.customers add column if not exists signup_ip_hash text;
alter table public.businesses add column if not exists signup_ip_hash text;
create index if not exists customers_signup_ip_idx on public.customers (signup_ip_hash, created_at);
create index if not exists businesses_signup_ip_idx on public.businesses (signup_ip_hash, created_at);

-- Enable RLS. The server API uses the service-role key; never expose it in the browser.
alter table public.customers enable row level security;
alter table public.businesses enable row level security;
alter table public.notification_logs enable row level security;
alter table public.referrals enable row level security;

-- No public read/write policies are created. All writes happen through the protected Next.js API route.
