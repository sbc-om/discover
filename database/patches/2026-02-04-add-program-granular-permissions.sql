-- Add granular permissions for programs module
-- This allows admins to control which users can create/edit/delete programs, levels, and age groups

-- First, let's add the new granular permissions to the programs module
INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    'programs_create_program',
    'إنشاء برنامج جديد',
    'Create New Program',
    m.id,
    'create_program'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    'programs_edit_program',
    'تعديل البرنامج',
    'Edit Program',
    m.id,
    'edit_program'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    'programs_delete_program',
    'حذف البرنامج',
    'Delete Program',
    m.id,
    'delete_program'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    'programs_create_level',
    'إنشاء مستوى جديد',
    'Create New Level',
    m.id,
    'create_level'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    'programs_edit_level',
    'تعديل المستوى',
    'Edit Level',
    m.id,
    'edit_level'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    'programs_delete_level',
    'حذف المستوى',
    'Delete Level',
    m.id,
    'delete_level'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    'programs_create_age_group',
    'إنشاء فئة عمرية جديدة',
    'Create New Age Group',
    m.id,
    'create_age_group'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    'programs_edit_age_group',
    'تعديل الفئة العمرية',
    'Edit Age Group',
    m.id,
    'edit_age_group'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    'programs_delete_age_group',
    'حذف الفئة العمرية',
    'Delete Age Group',
    m.id,
    'delete_age_group'
FROM modules m WHERE m.name = 'programs'
ON CONFLICT (name) DO NOTHING;

-- Grant all program permissions to admin role (admin already has all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name LIKE 'programs_%'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- By default, academy_manager only gets read access to programs
-- Admin can grant create/edit/delete permissions as needed
-- Remove existing create/update permissions from academy_manager for programs module
DELETE FROM role_permissions 
WHERE role_id = (SELECT id FROM roles WHERE name = 'academy_manager')
AND permission_id IN (
    SELECT id FROM permissions 
    WHERE module_id = (SELECT id FROM modules WHERE name = 'programs')
    AND action IN ('create', 'update', 'delete')
);

-- Grant only read permission for programs to academy_manager
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'academy_manager'
AND p.module_id = (SELECT id FROM modules WHERE name = 'programs')
AND p.action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Coach only gets read access to programs
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
