-- Add program levels table for tracking level requirements

-- Program Levels Table
CREATE TABLE IF NOT EXISTS program_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    level_order INT NOT NULL DEFAULT 1, -- Order of the level (1, 2, 3...)
    min_sessions INT NOT NULL DEFAULT 0, -- Minimum sessions required to pass
    min_points INT NOT NULL DEFAULT 0, -- Minimum points required to pass
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, level_order)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_program_levels_program_id ON program_levels(program_id);
CREATE INDEX IF NOT EXISTS idx_program_levels_order ON program_levels(program_id, level_order);

-- Add description_ar column to programs table if not exists
ALTER TABLE programs ADD COLUMN IF NOT EXISTS description_ar TEXT;
