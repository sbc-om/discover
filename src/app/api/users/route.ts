import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';
import { hashPassword } from '@/lib/auth';

// GET all users (Admin only)
export async function GET(request: Request) {
  try {
    // Check if user is admin
    await requireRole(['admin']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['first_name', 'last_name', 'email', 'created_at', 'is_active'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let query = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.phone, 
        u.is_active, u.email_verified, u.last_login, 
        u.preferred_language, u.created_at, u.avatar_url,
        r.id as role_id, r.name as role_name, r.name_ar, r.name_en
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (u.email ILIKE $${paramIndex} OR u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (roleFilter) {
      query += ` AND r.name = $${paramIndex}`;
      params.push(roleFilter);
      paramIndex++;
    }

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM (${query}) AS count_sub`;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    query += ` ORDER BY u.${validSortBy} ${validSortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    return NextResponse.json({
      users: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch users' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

// POST create new user (Admin only)
export async function POST(request: Request) {
  try {
    await requireRole(['admin']);

    const body = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role_id,
      preferred_language,
      is_active = true,
    } = body;

    // Validation
    if (!email || !password || !first_name || !last_name || !role_id) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Insert user
    const { rows } = await pool.query(
      `INSERT INTO users 
        (email, password_hash, first_name, last_name, phone, role_id, preferred_language, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, first_name, last_name, phone, role_id, preferred_language, is_active, created_at`,
      [email, password_hash, first_name, last_name, phone, role_id, preferred_language || 'en', is_active]
    );

    return NextResponse.json(
      { message: 'User created successfully', user: rows[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create user' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
