-- =============================================================================
-- CODE MEETS AI + A LITTLE BIT OF CHAOS 💀
-- Supabase Database Migration: 0001_init.sql
-- Copy & paste directly into Supabase SQL Editor and click 'Run'.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: Extensions
-- -----------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- SECTION 2: Tables & Indexes
-- -----------------------------------------------------------------------------

-- Participants table
create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  roll_number text not null,
  section text not null,
  year text not null check (year in ('1st Year', '2nd Year')),
  qr_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  is_checked_in boolean not null default false,
  checked_in_at timestamptz,
  checked_in_by text, -- which admin/device marked them present
  created_at timestamptz not null default now()
);

-- Unique case-insensitive index on roll_number to prevent duplicate registrations
create unique index if not exists participants_roll_number_unique_idx on participants (lower(roll_number));

-- Admin security keys table
create table if not exists admin_keys (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null, -- stored as SHA-256 hex string
  label text, -- e.g. "Gate Volunteers"
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Audit log of scan attempts (success, duplicate, invalid)
create table if not exists scan_log (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id),
  scanned_token text,
  result text not null check (result in ('success', 'duplicate', 'invalid')),
  device_label text, -- optional: which admin/device did the scan
  scanned_at timestamptz not null default now()
);

-- Enable Supabase Realtime publication on participants table for live admin counts
alter publication supabase_realtime add table participants;

-- -----------------------------------------------------------------------------
-- SECTION 3: Enable Row Level Security (RLS)
-- -----------------------------------------------------------------------------
alter table participants enable row level security;
alter table admin_keys enable row level security;
alter table scan_log enable row level security;

-- -----------------------------------------------------------------------------
-- SECTION 4: Row Level Security Policies
-- -----------------------------------------------------------------------------

-- RLS Policy 1: Allow public (anon) registration inserts into participants
drop policy if exists "Allow public participant registration" on participants;
create policy "Allow public participant registration"
  on participants
  for insert
  to anon, authenticated
  with check (true);

-- RLS Policy 2: Allow public (anon) select on participants (for token/ticket lookup)
drop policy if exists "Allow participant lookup by qr_token" on participants;
create policy "Allow participant lookup by qr_token"
  on participants
  for select
  to anon, authenticated
  using (true);

-- Note on admin_keys & scan_log:
-- No public (anon/authenticated) policies are created for admin_keys or scan_log.
-- All admin verification, scan logging, check-ins, and participant rosters are executed
-- via Next.js API routes using the Supabase Service Role key (server-side only).

-- -----------------------------------------------------------------------------
-- SECTION 5: Seed Data (Admin Security Key)
-- -----------------------------------------------------------------------------

-- NOTE BEFORE RUNNING:
-- You can replace 'CHAOS2026' below with your custom ADMIN_SECURITY_KEY passphrase.
-- The statement hashes the passphrase using SHA-256 (encode(digest(...), 'hex')),
-- matching the exact algorithm used by /api/admin/verify.

insert into admin_keys (key_hash, label, active)
values (
  encode(digest('CHAOS2026', 'sha256'), 'hex'),
  'Gate Volunteers Key',
  true
)
on conflict do nothing;
