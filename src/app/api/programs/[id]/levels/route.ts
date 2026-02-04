import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// Helper to check program access
async function checkProgramAccess(programId: string, session: any) {
  const programResult = await pool.query(
    'SELECT id, academy_id FROM programs WHERE id = $1',
    [programId]
  );

  if (programResult.rows.length === 0) {
    return { error: 'Program not found', status: 404 };
  }

  const program = programResult.rows[0];

  if (session.roleName !== 'admin') {
    const userResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [session.userId]
    );
    const userAcademyId = userResult.rows[0]?.academy_id;
    
    if (program.academy_id !== userAcademyId) {
      return { error: 'Forbidden', status: 403 };
    }
  }

  return { program };
}

// Helper function to check granular permission
async function hasGranularPermission(session: any, action: string): Promise<boolean> {
  if (session.roleName === 'admin') return true;
  
  const { rows } = await pool.query(
    `SELECT COUNT(*) as count
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     JOIN modules m ON m.id = p.module_id
     WHERE rp.role_id = $1 AND m.name = 'programs' AND p.action = $2`,
    [session.roleId, action]
  );
  
  return parseInt(rows[0].count) > 0;
}

// GET all levels for a program
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: programId } = await params;
    if (!programId) {
      return NextResponse.json({ message: 'Program ID is required' }, { status: 400 });
    }

    const access = await checkProgramAccess(programId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const { rows } = await pool.query(
      `SELECT id, name, name_ar, description, image_url, level_order, min_sessions, min_points, is_active, created_at, updated_at
       FROM program_levels
       WHERE program_id = $1
       ORDER BY level_order ASC`,
      [programId]
    );

    return NextResponse.json({ levels: rows });
  } catch (error: any) {
    console.error('Get levels error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch levels' },
      { status: 500 }
    );
  }
}

// POST create new level
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check for create_level or create permission
    const canCreate = await hasGranularPermission(session, 'create_level') ||
                      await hasGranularPermission(session, 'create');
    
    if (!canCreate) {
      return NextResponse.json({ message: 'You do not have permission to create levels' }, { status: 403 });
    }

    const { id: programId } = await params;
    if (!programId) {
      return NextResponse.json({ message: 'Program ID is required' }, { status: 400 });
    }

    const access = await checkProgramAccess(programId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const body = await request.json();
    const { name, name_ar, description, image_url, level_order, min_sessions = 0, min_points = 0, is_active = true } = body;

    if (!name) {
      return NextResponse.json({ message: 'Level name is required' }, { status: 400 });
    }

    // Auto-assign level_order if not provided
    let finalLevelOrder = level_order;
    if (!finalLevelOrder) {
      const maxOrderResult = await pool.query(
        'SELECT COALESCE(MAX(level_order), 0) + 1 as next_order FROM program_levels WHERE program_id = $1',
        [programId]
      );
      finalLevelOrder = maxOrderResult.rows[0].next_order;
    }

    // Check if level_order already exists
    const existingLevel = await pool.query(
      'SELECT id FROM program_levels WHERE program_id = $1 AND level_order = $2',
      [programId, finalLevelOrder]
    );

    if (existingLevel.rows.length > 0) {
      return NextResponse.json(
        { message: 'A level with this order already exists' },
        { status: 409 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO program_levels (program_id, name, name_ar, description, image_url, level_order, min_sessions, min_points, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, name, name_ar, description, image_url, level_order, min_sessions, min_points, is_active, created_at`,
      [programId, name, name_ar || null, description || null, image_url || null, finalLevelOrder, min_sessions, min_points, is_active]
    );

    return NextResponse.json({
      message: 'Level created successfully',
      level: rows[0],
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create level error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create level' },
      { status: 500 }
    );
  }
}
