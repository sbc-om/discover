import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET single role with permissions (Admin only)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin']);

    const id = params?.id || new URL(request.url).pathname.split('/').filter(Boolean).pop() || '';
    if (!id) {
      return NextResponse.json({ message: 'Role id is required' }, { status: 400 });
    }

    // Get role details
    const roleResult = await pool.query(
      `SELECT id, name, name_ar, name_en, description, created_at, updated_at
       FROM roles WHERE id = $1`,
      [id]
    );

    if (roleResult.rows.length === 0) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    // Get role permissions with module info
    const permissionsResult = await pool.query(
      `SELECT 
        p.id, p.name, p.name_ar, p.name_en, p.action,
        m.id as module_id, m.name as module_name, m.name_ar as module_name_ar, m.name_en as module_name_en
      FROM role_permissions rp
      JOIN permissions p ON p.id = rp.permission_id
      JOIN modules m ON m.id = p.module_id
      WHERE rp.role_id = $1
      ORDER BY m.display_order, p.action`,
      [id]
    );

    return NextResponse.json({
      role: {
        ...roleResult.rows[0],
        permissions: permissionsResult.rows,
      },
    });
  } catch (error: any) {
    console.error('Get role error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch role' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// PUT update role (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin']);

    const id = params?.id || new URL(request.url).pathname.split('/').filter(Boolean).pop() || '';
    if (!id) {
      return NextResponse.json({ message: 'Role id is required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, name_ar, name_en, description } = body;

    // Check if role exists
    const existing = await pool.query(
      'SELECT id FROM roles WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    // Check if new name conflicts with another role
    if (name) {
      const nameCheck = await pool.query(
        'SELECT id FROM roles WHERE name = $1 AND id != $2',
        [name, id]
      );
      if (nameCheck.rows.length > 0) {
        return NextResponse.json(
          { message: 'Role name already exists' },
          { status: 409 }
        );
      }
    }

    const { rows } = await pool.query(
      `UPDATE roles 
       SET name = COALESCE($1, name),
           name_ar = COALESCE($2, name_ar),
           name_en = COALESCE($3, name_en),
           description = COALESCE($4, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, name, name_ar, name_en, description, updated_at`,
      [name, name_ar, name_en, description, id]
    );

    return NextResponse.json({
      message: 'Role updated successfully',
      role: rows[0],
    });
  } catch (error: any) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update role' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// DELETE role (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin']);

    const id = params?.id || new URL(request.url).pathname.split('/').filter(Boolean).pop() || '';
    if (!id) {
      return NextResponse.json({ message: 'Role id is required' }, { status: 400 });
    }

    // Check if any users have this role
    const usersWithRole = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = $1',
      [id]
    );

    if (parseInt(usersWithRole.rows[0].count) > 0) {
      return NextResponse.json(
        { message: 'Cannot delete role with assigned users' },
        { status: 409 }
      );
    }

    const { rows } = await pool.query(
      'DELETE FROM roles WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    console.error('Delete role error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete role' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
