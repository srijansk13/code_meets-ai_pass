-- =============================================================================
-- CODE MEETS AI + A LITTLE BIT OF CHAOS 💀
-- ONE-TIME PRE-EVENT DATA RESET
-- DO NOT RUN AFTER REAL EVENT PARTICIPANT DATA EXISTS
-- =============================================================================
-- This script safely clears all test participant records and scan logs
-- while preserving admin_keys and the database schema/RLS policies.
-- =============================================================================

BEGIN;

-- 1. Delete dependent scan log entries
DELETE FROM scan_log;

-- 2. Delete participant registrations
DELETE FROM participants;

COMMIT;

-- Verification Queries:
-- SELECT count(*) FROM participants; -- Expected: 0
-- SELECT count(*) FROM scan_log;     -- Expected: 0
-- SELECT count(*) FROM admin_keys;   -- Expected: > 0 (Preserved)
