import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );

// PUT update role permissions (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin']);

    const { id } = await params;
    if (!id || !isUuid(id)) {
      return NextResponse.json({ message: 'Role id is required' }, { status: 400 });
    }

    const body = await request.json();
    const { permission_ids } = body;

    if (!Array.isArray(permission_ids)) {
      return NextResponse.json(
        { message: 'permission_ids must be an array' },
        { status: 400 }
      );
    }

    const normalizedPermissionIds = permission_ids
      .filter((value: unknown): value is string => typeof value === 'string')
      .filter((value) => isUuid(value));

    if (normalizedPermissionIds.length !== permission_ids.length) {
      return NextResponse.json(
        { message: 'permission_ids must be an array of UUID strings' },
        { status: 400 }
      );
    }

    const uniquePermissionIds = Array.from(new Set(normalizedPermissionIds));

    if (uniquePermissionIds.length > 0) {
      const { rows: permissionRows } = await pool.query(
        'SELECT id FROM permissions WHERE id = ANY($1::uuid[])',
        [uniquePermissionIds]
      );
      if (permissionRows.length !== uniquePermissionIds.length) {
        return NextResponse.json(
          { message: 'One or more permissions do not exist' },
          { status: 400 }
        );
      }
    }

    // Check if role exists
    const roleCheck = await pool.query(
      'SELECT id FROM roles WHERE id = $1',
      [id]
    );

    if (roleCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete existing permissions for this role
      await client.query('DELETE FROM role_permissions WHERE role_id = $1', [
        id,
      ]);

      // Insert new permissions
      if (uniquePermissionIds.length > 0) {
        const values = uniquePermissionIds
          .map((_, i) => `($1, $${i + 2})`)
          .join(', ');
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ${values}`,
          [id, ...uniquePermissionIds]
        );
      }

      await client.query('COMMIT');

      // Fetch updated permissions
      const result = await pool.query(
        `SELECT 
          p.id, p.name, p.name_ar, p.name_en, p.action,
          m.id as module_id, m.name as module_name
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        JOIN modules m ON m.id = p.module_id
        WHERE rp.role_id = $1
        ORDER BY m.display_order, p.action`,
        [id]
      );

      return NextResponse.json({
        message: 'Permissions updated successfully',
        permissions: result.rows,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Update permissions error:', error);
    const status =
      error.message === 'Forbidden'
        ? 403
        : error.message === 'Unauthorized'
          ? 401
          : 500;
    return NextResponse.json(
      { message: error.message || 'Failed to update permissions' },
      { status }
    );
  }
}
