import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole, getSession } from '@/lib/session';

// GET all programs
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
    const academyId = searchParams.get('academy_id') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const offset = (page - 1) * limit;

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = ['name', 'created_at', 'is_active'];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    let query = `
      SELECT 
        p.id, p.name, p.name_ar, p.description, p.description_ar, p.image_url,
        p.academy_id, p.is_active, p.created_at, p.updated_at,
        a.name as academy_name, a.name_ar as academy_name_ar,
        (SELECT COUNT(*) FROM program_levels WHERE program_id = p.id) as level_count,
        (SELECT COUNT(*) FROM program_age_groups WHERE program_id = p.id) as age_group_count
      FROM programs p
      LEFT JOIN academies a ON a.id = p.academy_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // If not admin, only show programs from user's academy
    if (session.roleName !== 'admin') {
      const userResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const userAcademyId = userResult.rows[0]?.academy_id;
      
      if (userAcademyId) {
        query += ` AND p.academy_id = $${paramIndex}`;
        params.push(userAcademyId);
        paramIndex++;
      } else {
        return NextResponse.json({
          programs: [],
          pagination: { page, limit, total: 0, pages: 0 }
        });
      }
    } else if (academyId) {
      // Admin can filter by specific academy
      query += ` AND p.academy_id = $${paramIndex}`;
      params.push(academyId);
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.name_ar ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = query.replace(
      /SELECT[\s\S]*?FROM programs/,
      'SELECT COUNT(*) FROM programs'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Add sorting and pagination
    query += ` ORDER BY p.${validSortBy} ${validSortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const { rows } = await pool.query(query, params);

    return NextResponse.json({
      programs: rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get programs error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST create new program
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, name_ar, description, description_ar, image_url, academy_id, is_active = true } = body;

    if (!name) {
      return NextResponse.json({ message: 'Program name is required' }, { status: 400 });
    }

    // Determine which academy to use
    let targetAcademyId = academy_id;

    if (session.roleName !== 'admin') {
      // Non-admin users can only create programs for their own academy
      const userResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const userAcademyId = userResult.rows[0]?.academy_id;
      
      if (!userAcademyId) {
        return NextResponse.json(
          { message: 'You are not assigned to any academy' },
          { status: 403 }
        );
      }
      targetAcademyId = userAcademyId;
    }

    if (!targetAcademyId) {
      return NextResponse.json({ message: 'Academy ID is required' }, { status: 400 });
    }

    // Check if program name already exists in this academy
    const existingProgram = await pool.query(
      'SELECT id FROM programs WHERE name = $1 AND academy_id = $2',
      [name, targetAcademyId]
    );

    if (existingProgram.rows.length > 0) {
      return NextResponse.json(
        { message: 'A program with this name already exists in this academy' },
        { status: 409 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO programs (name, name_ar, description, description_ar, image_url, academy_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, name_ar, description, description_ar, image_url, academy_id, is_active, created_at`,
      [name, name_ar || null, description || null, description_ar || null, image_url || null, targetAcademyId, is_active]
    );

    return NextResponse.json({
      message: 'Program created successfully',
      program: rows[0],
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create program error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create program' },
      { status: 500 }
    );
  }
}
