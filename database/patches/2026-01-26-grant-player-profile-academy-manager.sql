-- Grant player_profile access to academy_manager role
-- This allows academy managers to view and manage player profiles, achievements, and assessments

DO $$
DECLARE
    v_role_id UUID;
    v_module_id UUID;
    v_permission_id UUID;
BEGIN
    -- Get academy_manager role ID
    SELECT id INTO v_role_id FROM roles WHERE name = 'academy_manager';
    
    IF v_role_id IS NOT NULL THEN
        -- Get player_profile module ID
        SELECT id INTO v_module_id FROM modules WHERE name = 'player_profile';
        
        IF v_module_id IS NOT NULL THEN
            -- Grant 'read' permission
            SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'read';
            IF v_permission_id IS NOT NULL THEN
                INSERT INTO role_permissions (role_id, permission_id) 
                VALUES (v_role_id, v_permission_id) 
                ON CONFLICT (role_id, permission_id) DO NOTHING;
            END IF;
            
            -- Grant 'update' permission (for updating test scores, awarding achievements)
            SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'update';
            IF v_permission_id IS NOT NULL THEN
                INSERT INTO role_permissions (role_id, permission_id) 
                VALUES (v_role_id, v_permission_id) 
                ON CONFLICT (role_id, permission_id) DO NOTHING;
            END IF;
            
            -- Grant 'create' permission (for creating achievements, requesting tests)
            SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'create';
            IF v_permission_id IS NOT NULL THEN
                INSERT INTO role_permissions (role_id, permission_id) 
                VALUES (v_role_id, v_permission_id) 
                ON CONFLICT (role_id, permission_id) DO NOTHING;
            END IF;
        END IF;
    END IF;
END $$;
