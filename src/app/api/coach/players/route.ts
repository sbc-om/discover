import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await requireRole(['coach']);
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('program_id');
    const ageGroupId = searchParams.get('age_group_id');
    const dateParam = searchParams.get('date');
    const date = dateParam || new Date().toISOString().slice(0, 10);

    if (!programId || !ageGroupId) {
      return NextResponse.json(
        { message: 'Program and age group are required' },
        { status: 400 }
      );
    }

    const academyResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [session.userId]
    );
    const academyId = academyResult.rows[0]?.academy_id;

    if (!academyId) {
      return NextResponse.json({ players: [] });
    }

    const programResult = await pool.query(
      'SELECT id FROM programs WHERE id = $1 AND academy_id = $2',
      [programId, academyId]
    );
    if (programResult.rows.length === 0) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { rows } = await pool.query(
      `SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.avatar_url,
        pp.position,
        pp.sport,
        pa.present,
        pa.score,
        pa.notes,
        pa.attendance_date
      FROM player_programs pr
      JOIN users u ON u.id = pr.user_id
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN player_profiles pp ON pp.user_id = u.id
      LEFT JOIN program_attendance pa
        ON pa.user_id = u.id
        AND pa.program_id = pr.program_id
        AND pa.attendance_date = $3
      WHERE pr.program_id = $1
        AND pr.age_group_id = $2
        AND r.name = 'player'
        AND u.is_active = true
      ORDER BY u.first_name, u.last_name`,
      [programId, ageGroupId, date]
    );

    return NextResponse.json({ players: rows, date });
  } catch (error: any) {
    console.error('Get coach players error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load players' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
