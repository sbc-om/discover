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
-- All patches applied successfully!
-- =============================================================================
