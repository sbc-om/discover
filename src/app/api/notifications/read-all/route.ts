import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// POST - mark all notifications as read
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id') || session.userId;

    if (targetUserId !== session.userId) {
      if (!['admin', 'academy_manager'].includes(session.roleName)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      if (session.roleName === 'academy_manager') {
        const actorAcademyResult = await pool.query(
          'SELECT academy_id FROM users WHERE id = $1',
          [session.userId]
        );
        const targetAcademyResult = await pool.query(
          'SELECT academy_id FROM users WHERE id = $1',
          [targetUserId]
        );

        const actorAcademyId = actorAcademyResult.rows[0]?.academy_id;
        const targetAcademyId = targetAcademyResult.rows[0]?.academy_id;

        if (!actorAcademyId || actorAcademyId !== targetAcademyId) {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
      }
    }

    await pool.query(
      `UPDATE messages 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE receiver_id = $1 AND is_read = false`,
      [targetUserId]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mark all notifications read error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to mark all as read' },
      { status: 500 }
    );
  }
}
