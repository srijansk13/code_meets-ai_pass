-- =============================================================================
-- CODE MEETS AI + A LITTLE BIT OF CHAOS 💀
-- Supabase Database Migration: 003_entry_pass_profile_fields.sql
-- Standalone migration adding branch, phone_number, and backup_code columns.
-- Copy & paste directly into Supabase SQL Editor and click 'Run'.
-- =============================================================================

-- Add branch column if it does not exist (default to CSE)
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'CSE';

-- Add phone_number column if it does not exist (stored securely for contact/verification)
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Add backup_code column (5-digit unique backup verification code)
ALTER TABLE participants
ADD COLUMN IF NOT EXISTS backup_code VARCHAR(5);

-- Uniqueness constraint on backup_code
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'participants_backup_code_key'
    ) THEN
        ALTER TABLE participants ADD CONSTRAINT participants_backup_code_key UNIQUE (backup_code);
    END IF;
END $$;

-- Index for ultra-fast lookup by 5-digit backup code during gate check-in
CREATE INDEX IF NOT EXISTS idx_participants_backup_code ON participants(backup_code);

-- Column documentation comments
COMMENT ON COLUMN participants.branch IS 'Participant academic branch (e.g. CSE, ECE)';
COMMENT ON COLUMN participants.phone_number IS 'Participant phone number stored securely for verification';
COMMENT ON COLUMN participants.backup_code IS 'Unique 5-digit emergency gate check-in code';
