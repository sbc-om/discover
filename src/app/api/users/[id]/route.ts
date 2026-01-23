import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';
import { hashPassword } from '@/lib/auth';

// GET single user (Admin only)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin']);

    const id = params?.id || new URL(request.url).pathname.split('/').filter(Boolean).pop() || '';
    if (!id) {
      return NextResponse.json({ message: 'User id is required' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, 
        u.is_active, u.email_verified, u.last_login, 
        u.preferred_language, u.created_at, u.updated_at,
        r.id as role_id, r.name as role_name, r.name_ar, r.name_en
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch user' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// PUT update user (Admin only)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin']);

    const id = params?.id || new URL(request.url).pathname.split('/').filter(Boolean).pop() || '';
    if (!id) {
      return NextResponse.json({ message: 'User id is required' }, { status: 400 });
    }

    const body = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role_id,
      preferred_language,
      is_active,
      email_verified,
    } = body;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );

    if (existingUser.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (email !== undefined) {
      // Check if email is already taken by another user
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return NextResponse.json(
          { message: 'Email already exists' },
          { status: 409 }
        );
      }
      updates.push(`email = $${paramIndex++}`);
      values.push(email);
    }

    if (password) {
      const password_hash = await hashPassword(password);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(password_hash);
    }

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramIndex++}`);
      values.push(first_name);
    }

    if (last_name !== undefined) {
      updates.push(`last_name = $${paramIndex++}`);
      values.push(last_name);
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(phone);
    }

    if (role_id !== undefined) {
      updates.push(`role_id = $${paramIndex++}`);
      values.push(role_id);
    }

    if (preferred_language !== undefined) {
      updates.push(`preferred_language = $${paramIndex++}`);
      values.push(preferred_language);
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(is_active);
    }

    if (email_verified !== undefined) {
      updates.push(`email_verified = $${paramIndex++}`);
      values.push(email_verified);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { message: 'No fields to update' },
        { status: 400 }
      );
    }

    values.push(id);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, phone, role_id, 
                preferred_language, is_active, email_verified, updated_at
    `;

    const { rows } = await pool.query(query, values);

    return NextResponse.json({
      message: 'User updated successfully',
      user: rows[0],
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update user' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// DELETE user (Admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(['admin']);

    const id = params?.id || new URL(request.url).pathname.split('/').filter(Boolean).pop() || '';
    if (!id) {
      return NextResponse.json({ message: 'User id is required' }, { status: 400 });
    }

    const { rows } = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete user' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
