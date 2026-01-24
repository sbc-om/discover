import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

export async function GET() {
  try {
    const session = await requireRole(['coach']);

    const academyResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [session.userId]
    );
    const academyId = academyResult.rows[0]?.academy_id;

    if (!academyId) {
      return NextResponse.json({ programs: [] });
    }

    const programsResult = await pool.query(
      `SELECT id, name, name_ar, description, academy_id
       FROM programs
       WHERE academy_id = $1 AND is_active = true
       ORDER BY created_at DESC`,
      [academyId]
    );

    const programIds = programsResult.rows.map((p: any) => p.id);
    let ageGroups: any[] = [];

    if (programIds.length > 0) {
      const ageGroupsResult = await pool.query(
        `SELECT id, program_id, name, name_ar, min_age, max_age, is_active
         FROM program_age_groups
         WHERE program_id = ANY($1) AND is_active = true
         ORDER BY min_age ASC`,
        [programIds]
      );
      ageGroups = ageGroupsResult.rows;
    }

    const programs = programsResult.rows.map((program: any) => ({
      ...program,
      age_groups: ageGroups.filter((group) => group.program_id === program.id),
    }));

    return NextResponse.json({ programs });
  } catch (error: any) {
    console.error('Get coach programs error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load programs' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
