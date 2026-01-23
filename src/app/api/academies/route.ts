import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole, getSession } from '@/lib/session';

// GET all academies
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['name', 'city', 'created_at', 'is_active'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let query = `
      SELECT 
        a.id, a.name, a.name_ar, a.description, a.address, a.city, a.country,
        a.logo_url, a.is_active, a.created_at, a.manager_id,
        u.first_name as manager_first_name, u.last_name as manager_last_name, u.email as manager_email,
        (SELECT COUNT(*) FROM users WHERE academy_id = a.id) as user_count
      FROM academies a
      LEFT JOIN users u ON u.id = a.manager_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // If not admin, only show user's own academy
    if (session.roleName !== 'admin') {
      // Get user's academy
      const userResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const userAcademyId = userResult.rows[0]?.academy_id;
      
      if (userAcademyId) {
        query += ` AND a.id = $${paramIndex}`;
        params.push(userAcademyId);
        paramIndex++;
      } else {
        // User has no academy, return empty
        return NextResponse.json({
          academies: [],
          pagination: { page, limit, total: 0, pages: 0 }
        });
      }
    }

    if (search) {
      query += ` AND (a.name ILIKE $${paramIndex} OR a.name_ar ILIKE $${paramIndex} OR a.city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM academies/,
      'SELECT COUNT(*) FROM academies'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    query += ` ORDER BY a.${validSortBy} ${validSortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    return NextResponse.json({
      academies: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get academies error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch academies' },
      { status: 500 }
    );
  }
}

// POST create new academy (Admin only)
export async function POST(request: Request) {
  try {
    await requireRole(['admin']);

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
      is_active = true,
    } = body;

    if (!name) {
      return NextResponse.json(
        { message: 'Academy name is required' },
        { status: 400 }
      );
    }

    // Validate manager exists and has academy_manager role
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

    const result = await pool.query(
      `INSERT INTO academies (name, name_ar, description, address, city, country, logo_url, manager_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, name_ar, description, address, city, country, logo_url, manager_id, is_active]
    );

    // If manager_id is provided, update the manager's academy_id
    if (manager_id) {
      await pool.query(
        'UPDATE users SET academy_id = $1 WHERE id = $2',
        [result.rows[0].id, manager_id]
      );
    }

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Create academy error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create academy' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
