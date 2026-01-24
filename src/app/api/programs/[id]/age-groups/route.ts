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
