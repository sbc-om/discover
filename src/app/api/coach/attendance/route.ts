import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await requireRole(['coach']);
    const body = await request.json();
    const { user_id, program_id, age_group_id, date, present, score, notes } = body || {};

    if (!user_id || !program_id || !age_group_id || !date) {
      return NextResponse.json(
        { message: 'User, program, age group, and date are required' },
        { status: 400 }
      );
    }

    if (score !== undefined && score !== null) {
      const numericScore = Number(score);
      if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
        return NextResponse.json(
          { message: 'Score must be between 0 and 10' },
          { status: 400 }
        );
      }
    }

    const academyResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [session.userId]
    );
    const academyId = academyResult.rows[0]?.academy_id;

    if (!academyId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const programResult = await pool.query(
      'SELECT id FROM programs WHERE id = $1 AND academy_id = $2',
      [program_id, academyId]
    );
    if (programResult.rows.length === 0) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const playerProgramResult = await pool.query(
      'SELECT user_id FROM player_programs WHERE user_id = $1 AND program_id = $2 AND age_group_id = $3',
      [user_id, program_id, age_group_id]
    );
    if (playerProgramResult.rows.length === 0) {
      return NextResponse.json({ message: 'Player not assigned to program' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `INSERT INTO program_attendance (user_id, program_id, age_group_id, attendance_date, present, score, notes, marked_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, program_id, attendance_date)
       DO UPDATE SET
         age_group_id = EXCLUDED.age_group_id,
         present = EXCLUDED.present,
         score = EXCLUDED.score,
         notes = EXCLUDED.notes,
         marked_by = EXCLUDED.marked_by,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id, user_id, program_id, age_group_id, attendance_date, present, score, notes`,
      [user_id, program_id, age_group_id, date, !!present, score ?? null, notes || null, session.userId]
    );

    return NextResponse.json({ attendance: rows[0] });
  } catch (error: any) {
    console.error('Save attendance error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to save attendance' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
