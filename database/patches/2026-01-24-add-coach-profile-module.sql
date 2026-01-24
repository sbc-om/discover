-- Add coach profile module and permissions
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

-- Assign coach permissions to coach_profile
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('coach_profile_read', 'coach_profile_create', 'coach_profile_update')
WHERE r.name = 'coach'
ON CONFLICT (role_id, permission_id) DO NOTHING;
