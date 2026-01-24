-- Add program age groups table
CREATE TABLE IF NOT EXISTS program_age_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    min_age INT NOT NULL,
    max_age INT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, name)
);

-- Add player programs table
CREATE TABLE IF NOT EXISTS player_programs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    age_group_id UUID REFERENCES program_age_groups(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_program_age_groups_program_id ON program_age_groups(program_id);
CREATE INDEX IF NOT EXISTS idx_player_programs_user_id ON player_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_player_programs_program_id ON player_programs(program_id);

-- updated_at triggers
DROP TRIGGER IF EXISTS update_program_age_groups_updated_at ON program_age_groups;
CREATE TRIGGER update_program_age_groups_updated_at
    BEFORE UPDATE ON program_age_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_programs_updated_at ON player_programs;
CREATE TRIGGER update_player_programs_updated_at
    BEFORE UPDATE ON player_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
