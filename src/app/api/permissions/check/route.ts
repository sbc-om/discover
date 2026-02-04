import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// GET check user permissions for a module
// Returns specific action permissions for the current user
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');

    if (!moduleName) {
      return NextResponse.json({ message: 'Module name is required' }, { status: 400 });
    }

    // Admin has all permissions
    if (session.roleName === 'admin') {
      // Get all actions for this module
      const { rows: permissionRows } = await pool.query(
        `SELECT DISTINCT p.action
         FROM permissions p
         JOIN modules m ON m.id = p.module_id
         WHERE m.name = $1`,
        [moduleName]
      );

      const permissions: { [key: string]: boolean } = {};
      permissionRows.forEach((row) => {
        permissions[row.action] = true;
      });

      // Also add standard CRUD permissions
      permissions.read = true;
      permissions.create = true;
      permissions.update = true;
      permissions.delete = true;

      return NextResponse.json({
        roleName: session.roleName,
        permissions,
      });
    }

    // For non-admin users, check their actual permissions
    const { rows } = await pool.query(
      `SELECT DISTINCT p.action
       FROM role_permissions rp
       JOIN permissions p ON p.id = rp.permission_id
       JOIN modules m ON m.id = p.module_id
       WHERE rp.role_id = $1 AND m.name = $2`,
      [session.roleId, moduleName]
    );

    const permissions: { [key: string]: boolean } = {};
    rows.forEach((row) => {
      permissions[row.action] = true;
    });

    return NextResponse.json({
      roleName: session.roleName,
      permissions,
    });
  } catch (error: any) {
    console.error('Check permissions error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to check permissions' },
      { status: 500 }
    );
  }
}
