import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

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
      `SELECT id, name, name_ar, min_age, max_age, is_active, created_at, updated_at
       FROM program_age_groups
       WHERE program_id = $1
       ORDER BY min_age ASC, max_age ASC`,
      [programId]
    );

    return NextResponse.json({ age_groups: rows });
  } catch (error: any) {
    console.error('Get age groups error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch age groups' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check for create_age_group or create permission
    const canCreate = await hasGranularPermission(session, 'create_age_group') ||
                      await hasGranularPermission(session, 'create');
    
    if (!canCreate) {
      return NextResponse.json({ message: 'You do not have permission to create age groups' }, { status: 403 });
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
    const { name, name_ar, min_age, max_age, is_active = true } = body;

    if (!name || min_age === undefined || max_age === undefined) {
      return NextResponse.json({ message: 'Name, min age, and max age are required' }, { status: 400 });
    }

    if (Number(min_age) > Number(max_age)) {
      return NextResponse.json({ message: 'Min age must be <= max age' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO program_age_groups (program_id, name, name_ar, min_age, max_age, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, name_ar, min_age, max_age, is_active, created_at`,
      [programId, name, name_ar || null, min_age, max_age, is_active]
    );

    return NextResponse.json({
      message: 'Age group created successfully',
      age_group: rows[0],
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create age group error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create age group' },
      { status: 500 }
    );
  }
}
