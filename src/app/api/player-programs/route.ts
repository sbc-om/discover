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

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'academy_manager', 'coach'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, program_id, age_group_id, level_id } = body;

    if (!user_id || !program_id || !age_group_id) {
      return NextResponse.json({ message: 'User, program, and age group are required' }, { status: 400 });
    }

    const access = await checkProgramAccess(program_id, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const ageGroupResult = await pool.query(
      'SELECT id FROM program_age_groups WHERE id = $1 AND program_id = $2',
      [age_group_id, program_id]
    );

    if (ageGroupResult.rows.length === 0) {
      return NextResponse.json({ message: 'Age group not found for program' }, { status: 404 });
    }

    // Validate level if provided
    if (level_id) {
      const levelResult = await pool.query(
        'SELECT id FROM program_levels WHERE id = $1 AND program_id = $2',
        [level_id, program_id]
      );
      if (levelResult.rows.length === 0) {
        return NextResponse.json({ message: 'Level not found for program' }, { status: 404 });
      }
    }

    // Verify assigning user exists
    const assignerResult = await pool.query('SELECT id FROM users WHERE id = $1', [session.userId]);
    const assignedBy = assignerResult.rows.length > 0 ? session.userId : null;

    const { rows } = await pool.query(
      `INSERT INTO player_programs (user_id, program_id, age_group_id, level_id, assigned_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id)
       DO UPDATE SET program_id = EXCLUDED.program_id,
                     age_group_id = EXCLUDED.age_group_id,
                     level_id = EXCLUDED.level_id,
                     assigned_by = EXCLUDED.assigned_by,
                     updated_at = CURRENT_TIMESTAMP
       RETURNING user_id, program_id, age_group_id, level_id, assigned_at, updated_at`,
      [user_id, program_id, age_group_id, level_id || null, assignedBy]
    );

    return NextResponse.json({ assignment: rows[0] });
  } catch (error: any) {
    console.error('Assign player program error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to assign program' },
      { status: 500 }
    );
  }
}
