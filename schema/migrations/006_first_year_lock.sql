-- =============================================================================
-- CODE MEETS AI + A LITTLE BIT OF CHAOS 💀
-- Supabase Database Migration: 006_first_year_lock.sql
-- Adds a first_year_locked column to the event_settings table.
-- =============================================================================

ALTER TABLE event_settings ADD COLUMN IF NOT EXISTS first_year_locked BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN event_settings.first_year_locked IS 'When true, /api/register rejects new participant creation for 1st Year students with HTTP 403';
