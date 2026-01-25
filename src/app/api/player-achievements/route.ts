import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await requireRole(['admin', 'academy_manager', 'coach']);
    const body = await request.json();
    const { user_id, achievement_id, note } = body || {};

    if (!user_id || !achievement_id) {
      return NextResponse.json({ message: 'User and achievement are required' }, { status: 400 });
    }

    const userResult = await pool.query(
      `SELECT u.id, u.academy_id, r.name as role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = $1`,
      [user_id]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].role_name !== 'player') {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 });
    }

    const playerAcademyId = userResult.rows[0].academy_id;

    // Check if user has permission to award achievement to this player
    if (session.roleName !== 'admin') {
      const academyResult = await pool.query('SELECT academy_id FROM users WHERE id = $1', [session.userId]);
      const actorAcademyId = academyResult.rows[0]?.academy_id;
      
      // Coach and academy_manager must belong to same academy as player
      if (!actorAcademyId) {
        return NextResponse.json({ message: 'No academy assigned' }, { status: 403 });
      }
      
      if (actorAcademyId !== playerAcademyId) {
        return NextResponse.json({ message: 'Cannot award achievement to player from different academy' }, { status: 403 });
      }
    }

    const achievementResult = await pool.query(
      `SELECT id, academy_id
       FROM achievements
       WHERE id = $1 AND is_active = true`,
      [achievement_id]
    );

    if (achievementResult.rows.length === 0) {
      return NextResponse.json({ message: 'Achievement not found' }, { status: 404 });
    }

    const achievementAcademyId = achievementResult.rows[0].academy_id;
    // If achievement is academy-specific, check it matches player's academy
    if (achievementAcademyId && achievementAcademyId !== playerAcademyId && session.roleName !== 'admin') {
      return NextResponse.json({ message: 'Achievement not available for this academy' }, { status: 403 });
    }

    const { rows } = await pool.query(
      `INSERT INTO player_achievements (user_id, achievement_id, awarded_by, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, achievement_id, awarded_at`,
      [user_id, achievement_id, session.userId, note || null]
    );

    return NextResponse.json({ playerAchievement: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Award achievement error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to award achievement' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
