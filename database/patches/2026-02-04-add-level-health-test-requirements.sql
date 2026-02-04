-- Add health test requirement fields to program_levels table
-- This allows configuring whether a level requires health tests before, after, or both

-- Add health_test_requirement column to program_levels
-- Values: 'none', 'before', 'after', 'both'
ALTER TABLE program_levels
ADD COLUMN IF NOT EXISTS health_test_requirement VARCHAR(20) DEFAULT 'none';

-- Create a table to track health test requests associated with level assignments
-- This links health test requests to specific level transitions
CREATE TABLE IF NOT EXISTS level_health_test_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES program_levels(id) ON DELETE CASCADE,
    health_test_id UUID REFERENCES health_tests(id) ON DELETE SET NULL,
    request_type VARCHAR(20) NOT NULL, -- 'before_level' or 'after_level'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, level_id, request_type)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_user_id ON level_health_test_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_level_id ON level_health_test_requests(level_id);
CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_status ON level_health_test_requests(status);

-- Add comment for documentation
COMMENT ON COLUMN program_levels.health_test_requirement IS 'Health test requirement for the level: none, before, after, or both';
COMMENT ON TABLE level_health_test_requests IS 'Tracks health test requests created when players are assigned to levels that require tests';
