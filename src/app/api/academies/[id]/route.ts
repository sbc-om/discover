import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole, getSession } from '@/lib/session';

// GET single academy
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ message: 'Invalid academy ID' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT 
        a.*, 
        u.first_name as manager_first_name, 
        u.last_name as manager_last_name,
        u.email as manager_email,
        (SELECT COUNT(*) FROM users WHERE academy_id = a.id) as user_count
       FROM academies a
       LEFT JOIN users u ON u.id = a.manager_id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Academy not found' }, { status: 404 });
    }

    // Check access: admin can see all, others can only see their own academy
    if (session.roleName !== 'admin') {
      const userResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      if (userResult.rows[0]?.academy_id !== id) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Get academy error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch academy' },
      { status: 500 }
    );
  }
}

// PUT update academy
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ message: 'Invalid academy ID' }, { status: 400 });
    }

    // Check if academy exists
    const existingAcademy = await pool.query(
      'SELECT * FROM academies WHERE id = $1',
      [id]
    );

    if (existingAcademy.rows.length === 0) {
      return NextResponse.json({ message: 'Academy not found' }, { status: 404 });
    }

    // Only admin can update academies
    if (session.roleName !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      name_ar,
      description,
      address,
      city,
      country,
      logo_url,
      manager_id,
      is_active,
    } = body;

    // Validate manager if provided
    if (manager_id) {
      const managerResult = await pool.query(
        `SELECT u.id, r.name as role_name 
         FROM users u 
         JOIN roles r ON r.id = u.role_id 
         WHERE u.id = $1`,
        [manager_id]
      );

      if (managerResult.rows.length === 0) {
        return NextResponse.json(
          { message: 'Manager not found' },
          { status: 400 }
        );
      }

      if (managerResult.rows[0].role_name !== 'academy_manager') {
        return NextResponse.json(
          { message: 'Selected user is not an academy manager' },
          { status: 400 }
        );
      }
    }

    const oldManagerId = existingAcademy.rows[0].manager_id;

    const result = await pool.query(
      `UPDATE academies 
       SET name = COALESCE($1, name),
           name_ar = COALESCE($2, name_ar),
           description = COALESCE($3, description),
           address = COALESCE($4, address),
           city = COALESCE($5, city),
           country = COALESCE($6, country),
           logo_url = COALESCE($7, logo_url),
           manager_id = $8,
           is_active = COALESCE($9, is_active)
       WHERE id = $10
       RETURNING *`,
      [name, name_ar, description, address, city, country, logo_url, manager_id, is_active, id]
    );

    // Update manager's academy_id if manager changed
    if (manager_id !== oldManagerId) {
      // Remove old manager's academy_id
      if (oldManagerId) {
        await pool.query(
          'UPDATE users SET academy_id = NULL WHERE id = $1',
          [oldManagerId]
        );
      }
      // Set new manager's academy_id
      if (manager_id) {
        await pool.query(
          'UPDATE users SET academy_id = $1 WHERE id = $2',
          [id, manager_id]
        );
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Update academy error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update academy' },
      { status: 500 }
    );
  }
}

// DELETE academy (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['admin']);

    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ message: 'Invalid academy ID' }, { status: 400 });
    }

    // Check if academy has users
    const usersCount = await pool.query(
      'SELECT COUNT(*) FROM users WHERE academy_id = $1',
      [id]
    );

    if (parseInt(usersCount.rows[0].count) > 0) {
      return NextResponse.json(
        { message: 'Cannot delete academy with assigned users. Remove users first.' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'DELETE FROM academies WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Academy not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Academy deleted successfully' });
  } catch (error: any) {
    console.error('Delete academy error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete academy' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
