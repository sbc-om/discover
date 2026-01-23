-- Add academy manager role and permissions to existing database

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
