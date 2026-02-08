-- =============================================================================
-- Missing Patches Update Script
-- Run this script to apply all missing patches to an existing database
-- Date: 2026-02-08
-- =============================================================================

-- =============================================================================
-- Patch: 2026-01-26-add-player-level-assignment.sql
-- =============================================================================
-- Add level_id column to player_programs table for manual level assignment
ALTER TABLE player_programs ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES program_levels(id) ON DELETE SET NULL;

-- Create index for level_id lookups
CREATE INDEX IF NOT EXISTS idx_player_programs_level_id ON player_programs(level_id);

-- =============================================================================
-- Patch: 2026-02-04-add-level-health-test-requirements.sql
-- =============================================================================
-- Add health test requirement fields to program_levels table
ALTER TABLE program_levels
ADD COLUMN IF NOT EXISTS health_test_requirement VARCHAR(20) DEFAULT 'none';

-- Create table to track health test requests associated with level assignments
CREATE TABLE IF NOT EXISTS level_health_test_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES program_levels(id) ON DELETE CASCADE,
    health_test_id UUID REFERENCES health_tests(id) ON DELETE SET NULL,
    request_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, level_id, request_type)
);

CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_user_id ON level_health_test_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_level_id ON level_health_test_requests(level_id);
CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_status ON level_health_test_requests(status);

-- =============================================================================
-- Patch: 2026-01-26-add-player-level-assignment.sql (continued)
-- =============================================================================
-- Add level_id column to player_programs table for manual level assignment
ALTER TABLE player_programs ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES program_levels(id) ON DELETE SET NULL;

-- Create index for level_id lookups
CREATE INDEX IF NOT EXISTS idx_player_programs_level_id ON player_programs(level_id);

-- =============================================================================
-- Patch: 2026-02-04-add-dynamic-health-test-fields.sql
-- =============================================================================
-- Dynamic Health Test Fields System for Programs
-- This allows each program to define its own custom health test metrics/fields

-- Table to define health test field types for each program
CREATE TABLE IF NOT EXISTS program_health_test_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    field_name_ar VARCHAR(255),
    field_type VARCHAR(50) NOT NULL DEFAULT 'number',
    field_unit VARCHAR(50),
    field_unit_ar VARCHAR(50),
    field_options JSONB,
    min_value DECIMAL(10,2),
    max_value DECIMAL(10,2),
    is_required BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    description TEXT,
    description_ar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, field_key)
);

-- Table to store player health test results with dynamic fields
CREATE TABLE IF NOT EXISTS player_health_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_test_id UUID NOT NULL REFERENCES health_tests(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES program_health_test_fields(id) ON DELETE CASCADE,
    value_text TEXT,
    value_number DECIMAL(15,4),
    value_boolean BOOLEAN,
    value_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(health_test_id, field_id)
);

-- Add program_id to health_tests for linking tests to specific programs
ALTER TABLE health_tests ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE SET NULL;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_program_health_test_fields_program_id ON program_health_test_fields(program_id);
CREATE INDEX IF NOT EXISTS idx_program_health_test_fields_display_order ON program_health_test_fields(program_id, display_order);
CREATE INDEX IF NOT EXISTS idx_player_health_test_results_health_test_id ON player_health_test_results(health_test_id);
CREATE INDEX IF NOT EXISTS idx_player_health_test_results_field_id ON player_health_test_results(field_id);
CREATE INDEX IF NOT EXISTS idx_health_tests_program_id ON health_tests(program_id);

-- =============================================================================
-- Patch: 2026-02-04-add-health-test-sessions-trigger.sql
-- =============================================================================
ALTER TABLE program_levels
ADD COLUMN IF NOT EXISTS health_test_after_sessions INTEGER DEFAULT NULL;

ALTER TABLE level_health_test_requests
ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(30) DEFAULT 'level_assignment';

ALTER TABLE level_health_test_requests
ADD COLUMN IF NOT EXISTS triggered_at_session INTEGER DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_trigger_type 
ON level_health_test_requests(trigger_type);

-- =============================================================================
-- Patch: 2026-02-04-add-level-rewards-system.sql
-- =============================================================================
-- Level Rewards System
CREATE TABLE IF NOT EXISTS level_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_id UUID NOT NULL REFERENCES program_levels(id) ON DELETE CASCADE,
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('virtual', 'physical')),
    trigger_type VARCHAR(30) NOT NULL CHECK (trigger_type IN ('sessions_completed', 'points_earned', 'level_completed')),
    trigger_value INTEGER,
    title VARCHAR(200) NOT NULL,
    title_ar VARCHAR(200),
    description TEXT,
    description_ar TEXT,
    badge_icon_url TEXT,
    medal_type VARCHAR(50),
    achievement_id UUID REFERENCES achievements(id) ON DELETE SET NULL,
    notify_player BOOLEAN DEFAULT true,
    notify_coach BOOLEAN DEFAULT true,
    notify_parent BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_level_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES program_levels(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    sessions_completed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    level_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, level_id)
);

CREATE TABLE IF NOT EXISTS player_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_reward_id UUID NOT NULL REFERENCES level_rewards(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES program_levels(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'awarded' CHECK (status IN ('awarded', 'pending_delivery', 'delivered', 'cancelled')),
    medal_request_id UUID REFERENCES medal_requests(id) ON DELETE SET NULL,
    player_achievement_id UUID REFERENCES player_achievements(id) ON DELETE SET NULL,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    awarded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    note TEXT,
    player_notified BOOLEAN DEFAULT false,
    coach_notified BOOLEAN DEFAULT false,
    parent_notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, level_reward_id)
);

CREATE INDEX IF NOT EXISTS idx_level_rewards_level_id ON level_rewards(level_id);
CREATE INDEX IF NOT EXISTS idx_level_rewards_trigger_type ON level_rewards(trigger_type);
CREATE INDEX IF NOT EXISTS idx_player_level_progress_user_id ON player_level_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_player_level_progress_level_id ON player_level_progress(level_id);
CREATE INDEX IF NOT EXISTS idx_player_rewards_user_id ON player_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_player_rewards_level_reward_id ON player_rewards(level_reward_id);
CREATE INDEX IF NOT EXISTS idx_player_rewards_status ON player_rewards(status);

CREATE OR REPLACE FUNCTION update_level_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_level_rewards_updated_at ON level_rewards;
CREATE TRIGGER update_level_rewards_updated_at
    BEFORE UPDATE ON level_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_level_rewards_updated_at();

DROP TRIGGER IF EXISTS update_player_level_progress_updated_at ON player_level_progress;
CREATE TRIGGER update_player_level_progress_updated_at
    BEFORE UPDATE ON player_level_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_level_rewards_updated_at();

DROP TRIGGER IF EXISTS update_player_rewards_updated_at ON player_rewards;
CREATE TRIGGER update_player_rewards_updated_at
    BEFORE UPDATE ON player_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_level_rewards_updated_at();

INSERT INTO permissions (name, name_ar, name_en, module_id, action)
SELECT 'programs_manage_rewards', 'إدارة المكافآت', 'Manage Rewards', id, 'manage_rewards'
FROM modules WHERE name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name = 'programs_manage_rewards'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- Patch: 2026-02-04-add-multi-program-support.sql
-- =============================================================================
-- Allow players to be assigned to multiple programs
-- CRITICAL: This adds the 'id' column to player_programs which fixes "pr.id does not exist"

ALTER TABLE player_programs ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();

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

-- =============================================================================
-- Patch: 2026-02-04-add-program-academies.sql
-- =============================================================================
-- Multi-Academy Program Assignment System
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

CREATE INDEX IF NOT EXISTS idx_program_academies_program_id ON program_academies(program_id);
CREATE INDEX IF NOT EXISTS idx_program_academies_academy_id ON program_academies(academy_id);
CREATE INDEX IF NOT EXISTS idx_program_academies_is_active ON program_academies(is_active);

-- Migrate existing program-academy relationships
INSERT INTO program_academies (program_id, academy_id, is_active, assigned_at)
SELECT id, academy_id, true, created_at
FROM programs
WHERE academy_id IS NOT NULL
ON CONFLICT (program_id, academy_id) DO NOTHING;

-- =============================================================================
-- Patch: 2026-02-04-add-program-granular-permissions.sql
-- =============================================================================
INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 'programs_create_program', 'إنشاء برنامج جديد', 'Create New Program', m.id, 'create_program'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 'programs_edit_program', 'تعديل البرنامج', 'Edit Program', m.id, 'edit_program'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 'programs_delete_program', 'حذف البرنامج', 'Delete Program', m.id, 'delete_program'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 'programs_create_level', 'إنشاء مستوى جديد', 'Create New Level', m.id, 'create_level'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 'programs_edit_level', 'تعديل المستوى', 'Edit Level', m.id, 'edit_level'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 'programs_delete_level', 'حذف المستوى', 'Delete Level', m.id, 'delete_level'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 'programs_create_age_group', 'إنشاء فئة عمرية جديدة', 'Create New Age Group', m.id, 'create_age_group'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 'programs_edit_age_group', 'تعديل الفئة العمرية', 'Edit Age Group', m.id, 'edit_age_group'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 'programs_delete_age_group', 'حذف الفئة العمرية', 'Delete Age Group', m.id, 'delete_age_group'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name LIKE 'programs_%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'academy_manager')
AND permission_id IN (
    SELECT id FROM permissions 
    WHERE module_id = (SELECT id FROM modules WHERE name = 'programs')
    AND action IN ('create', 'update', 'delete')
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'academy_manager'
AND p.module_id = (SELECT id FROM modules WHERE name = 'programs')
AND p.action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'coach')
AND permission_id IN (
    SELECT id FROM permissions 
    WHERE module_id = (SELECT id FROM modules WHERE name = 'programs')
    AND action IN ('create', 'update', 'delete')
);

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'coach'
AND p.module_id = (SELECT id FROM modules WHERE name = 'programs')
AND p.action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- All missing patches applied successfully!
-- =============================================================================
SELECT 'Missing patches applied successfully!' as status;
