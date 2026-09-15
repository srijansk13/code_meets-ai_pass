-- =============================================================================
-- CODE MEETS AI + A LITTLE BIT OF CHAOS 💀
-- Supabase Database Migration: 005_registration_lock.sql
-- Adds a global event_settings table with a registration_locked toggle.
-- Copy & paste directly into Supabase SQL Editor and click 'Run'.
-- Safe to run on a live database — does not touch participants, admin_keys,
-- scan_log, or any existing RLS policies.
-- =============================================================================

-- Step 1: Create the event_settings singleton table
CREATE TABLE IF NOT EXISTS event_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  registration_locked BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Enforce singleton: only row with id = 1 is ever allowed
  CONSTRAINT event_settings_singleton CHECK (id = 1)
);

-- Step 2: Seed the single row (idempotent: safe to run multiple times)
INSERT INTO event_settings (id, registration_locked)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Enable RLS on the new table
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;

-- Step 4: Public SELECT policy
-- The homepage and /register page need to read registration_locked without
-- authentication. This matches the existing pattern on the participants table
-- (participants are publicly selectable for ticket lookup).
DROP POLICY IF EXISTS "Allow public read of event_settings" ON event_settings;
CREATE POLICY "Allow public read of event_settings"
  ON event_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Step 5: NO public INSERT or UPDATE policy.
-- All writes to event_settings go through /api/admin/settings which uses
-- the Supabase service role key (bypasses RLS entirely). This matches the
-- existing pattern for admin_keys and scan_log writes.

-- Column comments
COMMENT ON TABLE event_settings IS 'Global event configuration singleton (id must always be 1)';
COMMENT ON COLUMN event_settings.registration_locked IS 'When true, /api/register rejects new participant creation with HTTP 403';
COMMENT ON COLUMN event_settings.updated_at IS 'Timestamp of last settings change';
