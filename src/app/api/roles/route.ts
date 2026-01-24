import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET all roles (Admin or Academy Manager)
export async function GET(request: Request) {
  try {
    const session = await requireRole(['admin', 'academy_manager']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name_en';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const offset = (page - 1) * limit;

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['name_en', 'name_ar', 'user_count', 'permission_count', 'created_at'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'name_en';
    const validSortOrder = sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    let query = `
      SELECT 
        r.id, r.name, r.name_ar, r.name_en, r.description, r.created_at,
        COUNT(DISTINCT u.id)::int as user_count,
        COUNT(DISTINCT rp.permission_id)::int as permission_count
      FROM roles r
      LEFT JOIN users u ON u.role_id = r.id
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
    `;

    const params: any[] = [];
    let paramIndex = 1;

    const whereClauses: string[] = [];

    if (session.roleName !== 'admin') {
      whereClauses.push(`r.name IN ('player', 'coach')`);
    }

    if (search) {
      whereClauses.push(`(r.name_en ILIKE $${paramIndex} OR r.name_ar ILIKE $${paramIndex} OR r.name ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    query += ` GROUP BY r.id`;

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) as subquery`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    query += ` ORDER BY ${validSortBy} ${validSortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    return NextResponse.json({
      roles: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
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
