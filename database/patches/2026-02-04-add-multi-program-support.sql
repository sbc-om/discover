-- Allow players to be assigned to multiple programs
-- Change the player_programs table structure to support multi-program assignments

-- Step 1: Add a proper primary key and allow multiple entries per user
-- First, we need to drop the existing primary key constraint and create a new one

-- Add an ID column as the new primary key
ALTER TABLE player_programs ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();

-- Drop the existing primary key constraint on user_id
DO $$ 
BEGIN
    -- Check if user_id is still the primary key
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'player_programs' 
        AND constraint_type = 'PRIMARY KEY'
        AND constraint_name = 'player_programs_pkey'
    ) THEN
        -- First check if there are any duplicate (user_id, program_id) combinations
        -- If duplicates exist, keep only the most recent one
        DELETE FROM player_programs a USING player_programs b 
        WHERE a.user_id = b.user_id 
        AND a.program_id = b.program_id 
        AND a.assigned_at < b.assigned_at;
        
        -- Drop the old primary key
        ALTER TABLE player_programs DROP CONSTRAINT player_programs_pkey;
        
        -- Set id as not null and add as primary key
        UPDATE player_programs SET id = uuid_generate_v4() WHERE id IS NULL;
        ALTER TABLE player_programs ALTER COLUMN id SET NOT NULL;
        ALTER TABLE player_programs ADD PRIMARY KEY (id);
        
        -- Add unique constraint on user_id + program_id to prevent same program twice
        ALTER TABLE player_programs ADD CONSTRAINT player_programs_user_program_unique 
            UNIQUE (user_id, program_id);
    END IF;
END $$;

-- Add is_primary column to mark the primary/default program for the player
ALTER TABLE player_programs ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Set the first (or only) program as primary for existing records
UPDATE player_programs pp
SET is_primary = true
WHERE NOT EXISTS (
    SELECT 1 FROM player_programs pp2 
    WHERE pp2.user_id = pp.user_id AND pp2.is_primary = true
)
AND pp.assigned_at = (
    SELECT MIN(assigned_at) FROM player_programs pp3 WHERE pp3.user_id = pp.user_id
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_player_programs_user_primary ON player_programs(user_id, is_primary);

-- Add status column for program enrollment status
ALTER TABLE player_programs ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

COMMENT ON COLUMN player_programs.is_primary IS 'Whether this is the primary program shown on player card';
COMMENT ON COLUMN player_programs.status IS 'Enrollment status: active, completed, paused, withdrawn';
