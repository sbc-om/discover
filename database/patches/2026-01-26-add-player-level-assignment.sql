-- Add level_id column to player_programs table for manual level assignment
ALTER TABLE player_programs ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES program_levels(id) ON DELETE SET NULL;

-- Create index for level_id lookups
CREATE INDEX IF NOT EXISTS idx_player_programs_level_id ON player_programs(level_id);
