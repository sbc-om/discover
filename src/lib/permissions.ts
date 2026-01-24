import { getSession } from './session';
import pool from './db';

export interface UserPermissions {
  modules: string[];
  permissions: {
    [key: string]: string[]; // module_name: [actions]
  };
}

/**
 * Get all permissions for the current user
 */
export async function getUserPermissions(): Promise<UserPermissions> {
  try {
    const session = await getSession();

    if (!session) {
      return { modules: [], permissions: {} };
    }

    // Get all permissions for user's role
    const { rows } = await pool.query(
      `SELECT 
        m.name as module_name,
        m.route,
        p.action
      FROM role_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      JOIN modules m ON m.id = p.module_id
      WHERE rp.role_id = $1 AND m.is_active = true
      ORDER BY m.display_order`,
      [session.roleId]
    );

    const modules = [...new Set(rows.map((r) => r.module_name))];
    const permissions: { [key: string]: string[] } = {};

    rows.forEach((row) => {
      if (!permissions[row.module_name]) {
        permissions[row.module_name] = [];
      }
      permissions[row.module_name].push(row.action);
    });

    return { modules, permissions };
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return { modules: [], permissions: {} };
  }
}

/**
 * Check if user has permission for a specific module and action
 */
export async function hasPermission(
  moduleName: string,
  action: string
): Promise<boolean> {
  try {
    const session = await getSession();

    if (!session) {
      return false;
    }

    // Admin has all permissions
    if (session.roleName === 'admin') {
      return true;
    }

    const { rows } = await pool.query(
      `SELECT COUNT(*) as count
      FROM role_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      JOIN modules m ON m.id = p.module_id
      WHERE rp.role_id = $1 
        AND m.name = $2 
        AND p.action = $3
        AND m.is_active = true`,
      [session.roleId, moduleName, action]
    );

    return parseInt(rows[0].count) > 0;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Check if user has access to a module (any permission)
 */
export async function hasModuleAccess(moduleName: string): Promise<boolean> {
  try {
    const session = await getSession();

    if (!session) {
      return false;
    }

    // Admin has all access
    if (session.roleName === 'admin') {
      return true;
    }

    const { rows } = await pool.query(
      `SELECT COUNT(*) as count
      FROM role_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      JOIN modules m ON m.id = p.module_id
      WHERE rp.role_id = $1 
        AND m.name = $2
        AND m.is_active = true`,
      [session.roleId, moduleName]
    );

    return parseInt(rows[0].count) > 0;
  } catch (error) {
    console.error('Error checking module access:', error);
    return false;
  }
}

/**
 * Get accessible menu items for the current user
 */
export async function getAccessibleMenuItems() {
  try {
    const session = await getSession();

    if (!session) {
      return [];
    }

    // Admin sees all modules except player_profile/coach_profile
    if (session.roleName === 'admin') {
      const { rows } = await pool.query(
        `SELECT 
          m.id, m.name, m.name_ar, m.name_en, 
          m.icon, m.route, m.display_order
        FROM modules m
        WHERE m.is_active = true AND m.route IS NOT NULL AND m.name NOT IN ('player_profile', 'coach_profile')
        ORDER BY m.display_order`
      );
      return rows;
    }

    // Get modules user has at least read permission for
    const { rows } = await pool.query(
      `SELECT DISTINCT
        m.id, m.name, m.name_ar, m.name_en, 
        m.icon, m.route, m.display_order
      FROM role_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      JOIN modules m ON m.id = p.module_id
      WHERE rp.role_id = $1 
        AND m.is_active = true 
        AND m.route IS NOT NULL
      ORDER BY m.display_order`,
      [session.roleId]
    );

    return rows;
  } catch (error) {
    console.error('Error getting accessible menu items:', error);
    return [];
  }
}

/**
 * Require specific permission - throws error if not authorized
 */
export async function requirePermission(moduleName: string, action: string) {
  const hasAccess = await hasPermission(moduleName, action);

  if (!hasAccess) {
    throw new Error('Forbidden: Insufficient permissions');
  }
}
