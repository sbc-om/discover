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
