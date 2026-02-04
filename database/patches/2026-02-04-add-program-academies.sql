-- Multi-Academy Program Assignment System
-- Allows programs to be assigned to multiple academies (many-to-many relationship)

-- Junction table for program-academy assignments
CREATE TABLE IF NOT EXISTS program_academies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    academy_id UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, academy_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_program_academies_program_id ON program_academies(program_id);
CREATE INDEX IF NOT EXISTS idx_program_academies_academy_id ON program_academies(academy_id);
CREATE INDEX IF NOT EXISTS idx_program_academies_is_active ON program_academies(is_active);

-- Migrate existing program-academy relationships
-- If a program has an academy_id, create a record in program_academies
INSERT INTO program_academies (program_id, academy_id, is_active, assigned_at)
SELECT id, academy_id, true, created_at
FROM programs
WHERE academy_id IS NOT NULL
ON CONFLICT (program_id, academy_id) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE program_academies IS 'Junction table for many-to-many relationship between programs and academies';
COMMENT ON COLUMN program_academies.is_active IS 'Whether the program is currently active in this academy';
COMMENT ON COLUMN program_academies.assigned_by IS 'The admin who assigned this program to the academy';
COMMENT ON COLUMN program_academies.notes IS 'Optional notes about this program-academy assignment';

-- Grant permissions to academy_manager role
GRANT SELECT ON program_academies TO academy_manager;
GRANT SELECT ON program_academies TO coach;
GRANT SELECT ON program_academies TO player;
