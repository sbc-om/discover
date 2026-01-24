-- Grant player_profile module access to academy_manager role
-- This allows academy managers to view player profiles, achievements, and assessments

-- Get module id for player_profile
DO $$
DECLARE
    v_module_id UUID;
    v_role_id UUID;
    v_permission_id UUID;
BEGIN
    -- Get module id
    SELECT id INTO v_module_id FROM modules WHERE name = 'player_profile';
    
    -- Get academy_manager role id
    SELECT id INTO v_role_id FROM roles WHERE name = 'academy_manager';
    
    IF v_module_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        -- Grant 'read' permission
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'read';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (v_role_id, v_permission_id)
            ON CONFLICT DO NOTHING;
            RAISE NOTICE 'Granted read permission on player_profile to academy_manager';
        END IF;
        
        -- Grant 'update' permission (for updating test scores, awarding achievements)
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'update';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (v_role_id, v_permission_id)
            ON CONFLICT DO NOTHING;
            RAISE NOTICE 'Granted update permission on player_profile to academy_manager';
        END IF;
    ELSE
        RAISE NOTICE 'Module player_profile or role academy_manager not found';
    END IF;
END $$;

-- Also grant health_tests module access if not already granted
DO $$
DECLARE
    v_module_id UUID;
    v_role_id UUID;
    v_permission_id UUID;
BEGIN
    -- Get module id
    SELECT id INTO v_module_id FROM modules WHERE name = 'health_tests';
    
    -- Get academy_manager role id
    SELECT id INTO v_role_id FROM roles WHERE name = 'academy_manager';
    
    IF v_module_id IS NOT NULL AND v_role_id IS NOT NULL THEN
        -- Grant 'read' permission
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'read';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (v_role_id, v_permission_id)
            ON CONFLICT DO NOTHING;
            RAISE NOTICE 'Granted read permission on health_tests to academy_manager';
        END IF;
        
        -- Grant 'update' permission
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'update';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (v_role_id, v_permission_id)
            ON CONFLICT DO NOTHING;
            RAISE NOTICE 'Granted update permission on health_tests to academy_manager';
        END IF;
        
        -- Grant 'create' permission
        SELECT id INTO v_permission_id FROM permissions WHERE module_id = v_module_id AND action = 'create';
        IF v_permission_id IS NOT NULL THEN
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (v_role_id, v_permission_id)
            ON CONFLICT DO NOTHING;
            RAISE NOTICE 'Granted create permission on health_tests to academy_manager';
        END IF;
    ELSE
        RAISE NOTICE 'Module health_tests or role academy_manager not found';
    END IF;
END $$;
