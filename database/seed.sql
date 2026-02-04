-- DNA (Discover Natural Ability) Seed Data
-- This file contains initial data for the system

-- Insert Default Roles (if not exists)
INSERT INTO roles (name, name_ar, name_en, description) VALUES
('admin', 'مدير', 'Admin', 'Full system access and management'),
('academy_manager', 'مدير الأكاديمية', 'Academy Manager', 'Manage academy operations and programs'),
('coach', 'مدرب', 'Coach', 'Can manage players and programs'),
('player', 'لاعب', 'Player', 'Basic player access')
ON CONFLICT (name) DO NOTHING;

-- Insert Modules (if not exists)
INSERT INTO modules (name, name_ar, name_en, icon, route, display_order) VALUES
('dashboard', 'لوحة التحكم', 'Dashboard', 'dashboard', '/dashboard', 1),
('player_profile', 'ملف اللاعب', 'Player Profile', 'user-circle', '/dashboard/profile', 11),
('users', 'المستخدمون', 'Users', 'users', '/dashboard/users', 2),
('roles', 'الأدوار', 'Roles', 'shield', '/dashboard/roles', 3),
('academies', 'الأكاديميات', 'Academies', 'building', '/dashboard/academies', 4),
('health_tests', 'الفحوصات الصحية', 'Health Tests', 'activity', '/dashboard/health-tests', 5),
('medal_requests', 'طلبات الميداليات', 'Medal Requests', 'award', '/dashboard/medal-requests', 6),
('programs', 'البرامج', 'Programs', 'layers', '/dashboard/programs', 7),
('messages', 'الرسائل', 'Messages', 'mail', '/dashboard/messages', 8),
('whatsapp', 'واتساب', 'WhatsApp', 'message-circle', '/dashboard/whatsapp', 9),
('settings', 'الإعدادات', 'Settings', 'settings', '/dashboard/settings', 10)
ON CONFLICT (name) DO NOTHING;

-- Insert Permissions for each module
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
        ('update', 'تحديث', 'Update'),
        ('delete', 'حذف', 'Delete')
) AS action(action, action_ar, action_en)
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign specific permissions to coach role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'coach' 
AND p.module_id IN (
    SELECT id FROM modules WHERE name IN ('dashboard', 'users', 'health_tests', 'programs', 'messages', 'whatsapp')
)
AND p.action IN ('read', 'create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign specific permissions to academy manager role
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

-- Assign read-only permissions to player role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'player' 
AND p.module_id IN (
    SELECT id FROM modules WHERE name IN ('player_profile')
)
AND p.action IN ('read', 'create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================
-- DEFAULT ADMIN USER
-- Email: admin@dna.com
-- Password: admin123
-- ================================================
INSERT INTO users (email, password_hash, first_name, last_name, role_id, email_verified, is_active)
SELECT 
    'admin@dna.com',
    '$2b$10$WEZVn.jH4HieIkcyrp3lr.ffzaTSPgi/94ov/D9S8Cpde/gd74PHG',
    'System',
    'Administrator',
    (SELECT id FROM roles WHERE name = 'admin'),
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@dna.com');

-- ================================================
-- DEFAULT ACADEMY
-- ================================================
INSERT INTO academies (name, name_ar, description, city, country, is_active)
SELECT 
    'DNA Academy',
    'أكاديمية DNA',
    'Default academy for discovering natural abilities',
    'Riyadh',
    'Saudi Arabia',
    true
WHERE NOT EXISTS (SELECT 1 FROM academies WHERE name = 'DNA Academy');

-- Print success message
DO $$
BEGIN
    RAISE NOTICE '✅ Seed data inserted successfully!';
    RAISE NOTICE '📧 Admin Email: admin@dna.com';
    RAISE NOTICE '🔐 Admin Password: admin123';
    RAISE NOTICE '⚠️  Please change the admin password after first login!';
END;
$$;
