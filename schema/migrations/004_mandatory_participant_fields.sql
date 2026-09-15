-- =============================================================================
-- CODE MEETS AI + A LITTLE BIT OF CHAOS 💀
-- Supabase Database Migration: 004_mandatory_participant_fields.sql
-- Standalone migration to enforce NOT NULL constraints on mandatory fields.
-- Copy & paste directly into Supabase SQL Editor and click 'Run'.
-- =============================================================================

-- Step 1: Ensure existing NULL or whitespace branch entries are set to 'CSE' fallback
UPDATE participants
SET branch = 'CSE'
WHERE branch IS NULL OR trim(branch) = '';

-- Step 2: Ensure existing NULL or whitespace phone_number entries are updated if any exist
UPDATE participants
SET phone_number = '0000000000'
WHERE phone_number IS NULL OR trim(phone_number) = '';

-- Step 3: Add NOT NULL constraints on branch and phone_number
ALTER TABLE participants
ALTER COLUMN branch SET NOT NULL;

ALTER TABLE participants
ALTER COLUMN phone_number SET NOT NULL;

-- Column comments
COMMENT ON COLUMN participants.branch IS 'Participant academic branch (Mandatory)';
COMMENT ON COLUMN participants.phone_number IS 'Participant 10-digit phone number stored securely (Mandatory)';
