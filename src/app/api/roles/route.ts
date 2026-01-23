import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET all roles (Admin only)
export async function GET(request: Request) {
  try {
    await requireRole(['admin']);

    const { rows } = await pool.query(`
      SELECT 
        r.id, r.name, r.name_ar, r.name_en, r.description, r.created_at,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN users u ON u.role_id = r.id
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      GROUP BY r.id
      ORDER BY r.created_at ASC
    `);

    return NextResponse.json({ roles: rows });
  } catch (error: any) {
    console.error('Get roles error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch roles' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// POST create new role (Admin only)
export async function POST(request: Request) {
  try {
    await requireRole(['admin']);

    const body = await request.json();
    const { name, name_ar, name_en, description } = body;

    if (!name || !name_ar || !name_en) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if role name already exists
    const existing = await pool.query(
      'SELECT id FROM roles WHERE name = $1',
      [name]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { message: 'Role name already exists' },
        { status: 409 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO roles (name, name_ar, name_en, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, name_ar, name_en, description, created_at`,
      [name, name_ar, name_en, description]
    );

    return NextResponse.json(
      { message: 'Role created successfully', role: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create role error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create role' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
