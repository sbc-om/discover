import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// PUT - mark notification as read
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Notification id is required' }, { status: 400 });
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

    // Mark as read only if it belongs to the current user
    const result = await pool.query(
      `UPDATE messages 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND receiver_id = $2
       RETURNING id, is_read, read_at`,
      [id, targetUserId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification: result.rows[0] });
  } catch (error: any) {
    console.error('Mark notification read error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to mark as read' },
      { status: 500 }
    );
  }
}
