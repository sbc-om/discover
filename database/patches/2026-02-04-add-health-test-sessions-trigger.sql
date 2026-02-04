-- Enhance health test requirements with session-based triggers
-- This allows configuring health tests to trigger after a specific number of sessions

-- Add health_test_after_sessions column to program_levels
-- When set, a health test will be required after the player completes this many sessions in the level
ALTER TABLE program_levels
ADD COLUMN IF NOT EXISTS health_test_after_sessions INTEGER DEFAULT NULL;

-- Update level_health_test_requests to support session-based triggers
ALTER TABLE level_health_test_requests
ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(30) DEFAULT 'level_assignment';
-- trigger_type values: 'level_assignment', 'level_completion', 'session_count'

-- Add session_count at trigger time for reference
ALTER TABLE level_health_test_requests
ADD COLUMN IF NOT EXISTS triggered_at_session INTEGER DEFAULT NULL;

-- Create index for session-based queries
CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_trigger_type 
ON level_health_test_requests(trigger_type);

-- Add comments for documentation
COMMENT ON COLUMN program_levels.health_test_after_sessions IS 'Number of sessions after which a health test is required. NULL means disabled.';
COMMENT ON COLUMN level_health_test_requests.trigger_type IS 'What triggered this health test request: level_assignment (before), level_completion (after), or session_count';
COMMENT ON COLUMN level_health_test_requests.triggered_at_session IS 'The session count when this request was triggered (for session-based triggers)';
