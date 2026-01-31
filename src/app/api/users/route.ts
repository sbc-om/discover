import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';
import { hashPassword } from '@/lib/auth';

// GET users (Admin or Academy Manager)
export async function GET(request: Request) {
  try {
    // Check if user is admin or academy manager
    const session = await requireRole(['admin', 'academy_manager']);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const roleFilter = searchParams.get('role') || '';
    const specialFilter = searchParams.get('filter') || '';
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
        u.academy_id, u.created_by,
        a.name as academy_name, a.name_ar as academy_name_ar,
        r.id as role_id, r.name as role_name, r.name_ar, r.name_en,
        lvl.completed_level_order,
        lvl.completed_level_name,
        lvl.completed_level_name_ar,
        CASE WHEN ht.user_id IS NOT NULL THEN true ELSE false END AS has_health_test,
        CASE WHEN pp.user_id IS NOT NULL THEN true ELSE false END AS has_program_assignment
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN academies a ON a.id = u.academy_id
      LEFT JOIN (
        SELECT pr.user_id,
               MAX(pl.level_order) AS completed_level_order,
               (ARRAY_AGG(pl.name ORDER BY pl.level_order DESC))[1] AS completed_level_name,
               (ARRAY_AGG(pl.name_ar ORDER BY pl.level_order DESC))[1] AS completed_level_name_ar
        FROM player_programs pr
        JOIN program_levels pl ON pl.program_id = pr.program_id AND pl.is_active = true
        LEFT JOIN (
          SELECT user_id,
                 COUNT(*) FILTER (WHERE present) AS sessions_completed,
                 COALESCE(SUM(score), 0) AS points_total
          FROM program_attendance
          GROUP BY user_id
        ) pa ON pa.user_id = pr.user_id
        WHERE COALESCE(pa.sessions_completed, 0) >= pl.min_sessions
          AND COALESCE(pa.points_total, 0) >= pl.min_points
        GROUP BY pr.user_id
      ) lvl ON lvl.user_id = u.id
      LEFT JOIN (SELECT DISTINCT user_id FROM health_tests) ht ON ht.user_id = u.id
      LEFT JOIN (SELECT DISTINCT user_id FROM player_programs) pp ON pp.user_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (session.roleName !== 'admin') {
      const academyResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const academyId = academyResult.rows[0]?.academy_id;
      if (!academyId) {
        return NextResponse.json({
          users: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        });
      }
      query += ` AND u.academy_id = $${paramIndex}`;
      params.push(academyId);
      paramIndex++;
    }

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

    // Special filters from dashboard
    if (specialFilter === 'noAcademy') {
      query += ` AND u.academy_id IS NULL AND r.name IN ('player', 'coach', 'academy_manager')`;
    } else if (specialFilter === 'noProgram') {
      query += ` AND pp.user_id IS NULL AND r.name = 'player'`;
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

// POST create new user (Admin or Academy Manager)
export async function POST(request: Request) {
  try {
    const session = await requireRole(['admin', 'academy_manager']);

    const body = await request.json();
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      role_id,
      academy_id,
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

    let enforcedAcademyId = academy_id || null;
    if (session.roleName !== 'admin') {
      const academyResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const managerAcademyId = academyResult.rows[0]?.academy_id;
      if (!managerAcademyId) {
        return NextResponse.json(
          { message: 'Academy not found' },
          { status: 400 }
        );
      }

      const roleResult = await pool.query(
        'SELECT name FROM roles WHERE id = $1',
        [role_id]
      );
      const roleName = roleResult.rows[0]?.name;
      if (!roleName || !['player', 'coach'].includes(roleName)) {
        return NextResponse.json(
          { message: 'Invalid role for academy manager' },
          { status: 400 }
        );
      }

      enforcedAcademyId = managerAcademyId;
    }

    if (enforcedAcademyId) {
      const academyExists = await pool.query(
        'SELECT id FROM academies WHERE id = $1',
        [enforcedAcademyId]
      );
      if (academyExists.rows.length === 0) {
        return NextResponse.json(
          { message: 'Academy not found' },
          { status: 400 }
        );
      }
    }

    // Insert user
    const { rows } = await pool.query(
      `INSERT INTO users 
        (email, password_hash, first_name, last_name, phone, role_id, academy_id, preferred_language, is_active, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, first_name, last_name, phone, role_id, academy_id, preferred_language, is_active, created_at, created_by`,
      [email, password_hash, first_name, last_name, phone, role_id, enforcedAcademyId || null, preferred_language || 'en', is_active, session.userId]
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
