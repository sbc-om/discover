-- Add player profiles table
CREATE TABLE IF NOT EXISTS player_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sport VARCHAR(100),
    position VARCHAR(100),
    bio TEXT,
    goals TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure updated_at trigger for player_profiles
DROP TRIGGER IF EXISTS update_player_profiles_updated_at ON player_profiles;
CREATE TRIGGER update_player_profiles_updated_at
    BEFORE UPDATE ON player_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Extend health_tests for request workflow
ALTER TABLE health_tests
    ALTER COLUMN test_date DROP NOT NULL;

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

-- Add player profile module
INSERT INTO modules (name, name_ar, name_en, icon, route, display_order)
VALUES ('player_profile', 'ملف اللاعب', 'Player Profile', 'user-circle', '/dashboard/profile', 11)
ON CONFLICT (name) DO NOTHING;

-- Add permissions for player profile module
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

-- Grant admin all player profile permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name LIKE 'player_profile_%'
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Replace player permissions to only player_profile
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
