-- =============================================================================
-- Combined Database Patches for DNA Application
-- Run this file to apply all migrations
-- =============================================================================

-- =============================================================================
-- Patch: 2026-01-23-add-academy-manager.sql
-- =============================================================================
INSERT INTO roles (name, name_ar, name_en, description)
VALUES ('academy_manager', 'مدير الأكاديمية', 'Academy Manager', 'Manage academy operations and programs')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'academy_manager'
AND p.module_id IN (
    SELECT id FROM modules WHERE name IN ('dashboard', 'academies', 'programs', 'users', 'health_tests', 'messages', 'whatsapp')
)
AND p.action IN ('read', 'create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- Patch: 2026-01-23-add-academy-relations.sql
-- =============================================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS academy_id UUID REFERENCES academies(id) ON DELETE SET NULL;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_academy_id ON users(academy_id);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);
CREATE INDEX IF NOT EXISTS idx_academies_manager_id ON academies(manager_id);

-- =============================================================================
-- Patch: 2026-01-23-add-program-levels.sql
-- =============================================================================
CREATE TABLE IF NOT EXISTS program_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    level_order INT NOT NULL DEFAULT 1,
    min_sessions INT NOT NULL DEFAULT 0,
    min_points INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, level_order)
);

CREATE INDEX IF NOT EXISTS idx_program_levels_program_id ON program_levels(program_id);
CREATE INDEX IF NOT EXISTS idx_program_levels_order ON program_levels(program_id, level_order);

ALTER TABLE programs ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- =============================================================================
-- Patch: 2026-01-23-add-program-images.sql
-- =============================================================================
ALTER TABLE programs ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE program_levels ADD COLUMN IF NOT EXISTS image_url TEXT;

-- =============================================================================
-- Patch: 2026-01-24-add-program-age-groups-and-player-programs.sql
-- =============================================================================
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

CREATE TABLE IF NOT EXISTS player_programs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    age_group_id UUID REFERENCES program_age_groups(id) ON DELETE SET NULL,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_program_age_groups_program_id ON program_age_groups(program_id);
CREATE INDEX IF NOT EXISTS idx_player_programs_user_id ON player_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_player_programs_program_id ON player_programs(program_id);

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

-- =============================================================================
-- Patch: 2026-01-24-add-achievements.sql
-- =============================================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    description TEXT,
    icon_url TEXT,
    academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS player_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    awarded_by UUID REFERENCES users(id),
    note TEXT,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_achievements_academy_id ON achievements(academy_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_user_id ON player_achievements(user_id);

-- =============================================================================
-- Patch: 2026-01-24-add-coach-attendance.sql
-- =============================================================================
CREATE TABLE IF NOT EXISTS program_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    age_group_id UUID REFERENCES program_age_groups(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL,
    present BOOLEAN DEFAULT false,
    score INT CHECK (score >= 0 AND score <= 10),
    notes TEXT,
    marked_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, program_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_program_attendance_user_date ON program_attendance(user_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_program_attendance_program_date ON program_attendance(program_id, attendance_date);

-- =============================================================================
-- Patch: 2026-01-24-add-player-profile-and-health-tests.sql
-- =============================================================================
CREATE TABLE IF NOT EXISTS player_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sport VARCHAR(100),
    position VARCHAR(100),
    bio TEXT,
    goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS update_player_profiles_updated_at ON player_profiles;
CREATE TRIGGER update_player_profiles_updated_at
    BEFORE UPDATE ON player_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE health_tests ALTER COLUMN test_date DROP NOT NULL;

ALTER TABLE health_tests
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS review_notes TEXT,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS speed_score INT,
    ADD COLUMN IF NOT EXISTS agility_score INT,
    ADD COLUMN IF NOT EXISTS power_score INT;

INSERT INTO modules (name, name_ar, name_en, icon, route, display_order)
VALUES ('player_profile', 'ملف اللاعب', 'Player Profile', 'user-circle', '/dashboard/profile', 11)
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action)
SELECT 
    m.name || '_' || action.action,
    'صلاحية ملف اللاعب - ' || action.action_ar,
    m.name_en || ' Permission - ' || action.action_en,
    m.id,
    action.action
FROM modules m
CROSS JOIN (
    VALUES 
        ('create', 'إنشاء', 'Create'),
        ('read', 'قراءة', 'Read'),
        ('update', 'تحديث', 'Update'),
        ('delete', 'حذف', 'Delete')
) AS action(action, action_ar, action_en)
WHERE m.name = 'player_profile'
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name LIKE 'player_profile_%'
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

DELETE FROM role_permissions rp
USING roles r, permissions p, modules m
WHERE rp.role_id = r.id
  AND rp.permission_id = p.id
  AND p.module_id = m.id
  AND r.name = 'player'
  AND m.name <> 'player_profile';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('player_profile_read', 'player_profile_create', 'player_profile_update')
WHERE r.name = 'player'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- Patch: 2026-01-24-add-coach-profile-module.sql
-- =============================================================================
INSERT INTO modules (name, name_ar, name_en, icon, route, display_order)
VALUES ('coach_profile', 'ملف المدرب', 'Coach Profile', 'user-circle', '/dashboard/coach', 12)
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action)
SELECT
  m.name || '_' || action.action,
  'صلاحية ' || m.name_ar || ' - ' || action.action_ar,
  m.name_en || ' Permission - ' || action.action_en,
  m.id,
  action.action
FROM modules m
CROSS JOIN (
  VALUES
    ('create', 'إنشاء', 'Create'),
    ('read', 'قراءة', 'Read'),
    ('update', 'تحديث', 'Update')
) AS action(action, action_ar, action_en)
WHERE m.name = 'coach_profile'
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('coach_profile_read', 'coach_profile_create', 'coach_profile_update')
WHERE r.name = 'coach'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- Patch: 2026-01-24-add-physical-test-metrics.sql
-- =============================================================================
ALTER TABLE health_tests
    ADD COLUMN IF NOT EXISTS balance_score INT,
    ADD COLUMN IF NOT EXISTS reaction_score INT,
    ADD COLUMN IF NOT EXISTS coordination_score INT,
    ADD COLUMN IF NOT EXISTS flexibility_score INT;

-- =============================================================================
-- Patch: 2026-01-24-add-medal-delivery-date.sql
-- =============================================================================
ALTER TABLE medal_requests ADD COLUMN IF NOT EXISTS delivery_date DATE;

-- =============================================================================
-- Patch: 2026-01-24-add-push-subscriptions.sql
-- =============================================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active);

-- =============================================================================
-- Patch: 2026-01-24-grant-messages-academy-manager.sql
-- =============================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
JOIN modules m ON m.id = p.module_id
WHERE r.name = 'academy_manager'
  AND m.name = 'messages'
  AND p.action IN ('read', 'create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =============================================================================
-- Patch: 2026-01-25-add-site-settings.sql
-- =============================================================================
-- Add site_settings table for admin configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id)
);

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('font_arabic', 'IBM Plex Sans Arabic'),
  ('font_english', 'Inter'),
  ('font_size_base', '16'),
  ('font_size_heading_1', '48'),
  ('font_size_heading_2', '36'),
  ('font_size_heading_3', '24'),
  ('font_size_heading_4', '20')
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================================================
-- Patch: 2026-01-24-grant-player-profile-academy-manager.sql
-- =============================================================================
DO $$
DECLARE
    v_module_id UUID;
    v_role_id UUID;
    v_permission_id UUID;
BEGIN
    SELECT id INTO v_module_id FROM modules WHERE name = 'player_profile';
    SELECT id INTO v_role_id FROM roles WHERE name = 'academy_manager';
    
    IF v_module_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'read';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id) VALUES (v_role_id, v_permission_id) ON CONFLICT DO NOTHING;
        END IF;
        
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'update';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id) VALUES (v_role_id, v_permission_id) ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

DO $$
DECLARE
    v_module_id UUID;
    v_role_id UUID;
    v_permission_id UUID;
BEGIN
    SELECT id INTO v_module_id FROM modules WHERE name = 'health_tests';
    SELECT id INTO v_role_id FROM roles WHERE name = 'academy_manager';
    
    IF v_module_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'read';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id) VALUES (v_role_id, v_permission_id) ON CONFLICT DO NOTHING;
        END IF;
        
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'update';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id) VALUES (v_role_id, v_permission_id) ON CONFLICT DO NOTHING;
        END IF;
        
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'create';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id) VALUES (v_role_id, v_permission_id) ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END $$;

-- =============================================================================
-- Patch: 2026-01-24-update-medal-requests-statuses.sql
-- =============================================================================
COMMENT ON COLUMN medal_requests.status IS 'Status: pending, approved, rejected, preparing, shipped, delivered';
ALTER TABLE medal_requests ADD COLUMN IF NOT EXISTS shipping_date DATE;
ALTER TABLE medal_requests ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE medal_requests ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

-- =============================================================================
-- Patch: 2026-01-26-add-push-subscriptions-unique-constraint.sql
-- =============================================================================
-- Add unique constraint for push_subscriptions to support ON CONFLICT
-- This allows users to have multiple subscriptions from different devices/browsers
-- but prevents duplicate subscriptions for the same endpoint

-- Drop existing records with duplicate (user_id, endpoint) combinations
-- Keep only the most recent one
DELETE FROM push_subscriptions a
USING push_subscriptions b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.endpoint = b.endpoint;

-- Add unique constraint
ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_user_endpoint_key;

ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_user_endpoint_key UNIQUE (user_id, endpoint);

-- =============================================================================
-- Patch: 2026-01-26-add-role-permissions-unique-constraint.sql
-- =============================================================================
-- Add unique constraint to role_permissions table
-- This prevents duplicate role-permission mappings and allows ON CONFLICT clauses

-- Drop existing duplicate entries if any
DELETE FROM role_permissions a USING role_permissions b
WHERE a.id < b.id 
  AND a.role_id = b.role_id 
  AND a.permission_id = b.permission_id;

-- Add the unique constraint
ALTER TABLE role_permissions
ADD CONSTRAINT role_permissions_role_permission_unique 
UNIQUE (role_id, permission_id);

-- =============================================================================
-- Patch: 2026-01-26-grant-player-profile-academy-manager.sql
-- =============================================================================
-- Grant academy_manager full access to player_profile module
-- This allows academy managers to view and manage player profiles for their academy

DO $$
DECLARE
    v_module_id UUID;
    v_role_id UUID;
    v_permission_id UUID;
BEGIN
    -- Get player_profile module and academy_manager role IDs
    SELECT id INTO v_module_id FROM modules WHERE name = 'player_profile';
    SELECT id INTO v_role_id FROM roles WHERE name = 'academy_manager';
    
    IF v_module_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        -- Grant read permission
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'read';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id) 
            VALUES (v_role_id, v_permission_id) 
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END IF;
        
        -- Grant update permission
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'update';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id) 
            VALUES (v_role_id, v_permission_id) 
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END IF;
        
        -- Grant create permission
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'create';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id) 
            VALUES (v_role_id, v_permission_id) 
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        END IF;
    END IF;
END $$;

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
    request_type VARCHAR(20) NOT NULL, -- 'before_level' or 'after_level'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, level_id, request_type)
);

CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_user_id ON level_health_test_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_level_id ON level_health_test_requests(level_id);
CREATE INDEX IF NOT EXISTS idx_level_health_test_requests_status ON level_health_test_requests(status);

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
ALTER TABLE player_programs ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();

DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'player_programs' 
        AND constraint_type = 'PRIMARY KEY'
        AND constraint_name = 'player_programs_pkey'
    ) THEN
        DELETE FROM player_programs a USING player_programs b 
        WHERE a.user_id = b.user_id 
        AND a.program_id = b.program_id 
        AND a.assigned_at < b.assigned_at;
        
        ALTER TABLE player_programs DROP CONSTRAINT player_programs_pkey;
        
        UPDATE player_programs SET id = uuid_generate_v4() WHERE id IS NULL;
        ALTER TABLE player_programs ALTER COLUMN id SET NOT NULL;
        ALTER TABLE player_programs ADD PRIMARY KEY (id);
        
        ALTER TABLE player_programs ADD CONSTRAINT player_programs_user_program_unique 
            UNIQUE (user_id, program_id);
    END IF;
END $$;

ALTER TABLE player_programs ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

UPDATE player_programs pp
SET is_primary = true
WHERE NOT EXISTS (
    SELECT 1 FROM player_programs pp2 
    WHERE pp2.user_id = pp.user_id AND pp2.is_primary = true
)
AND pp.assigned_at = (
    SELECT MIN(assigned_at) FROM player_programs pp3 WHERE pp3.user_id = pp.user_id
);

CREATE INDEX IF NOT EXISTS idx_player_programs_user_primary ON player_programs(user_id, is_primary);

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
-- All patches applied successfully!
-- =============================================================================
