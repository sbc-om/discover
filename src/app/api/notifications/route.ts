import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// GET notifications for current player (messages received)
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const targetUserId = searchParams.get('user_id') || session.userId;

    if (targetUserId !== session.userId && session.roleName !== 'admin') {
      if (session.roleName !== 'academy_manager') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      const [actorResult, targetResult] = await Promise.all([
        pool.query('SELECT academy_id FROM users WHERE id = $1', [session.userId]),
        pool.query('SELECT academy_id FROM users WHERE id = $1', [targetUserId])
      ]);
      const actorAcademyId = actorResult.rows[0]?.academy_id;
      const targetAcademyId = targetResult.rows[0]?.academy_id;

      if (!actorAcademyId || actorAcademyId !== targetAcademyId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    let query = `
      SELECT 
        m.id,
        m.subject,
        m.content,
        m.is_read,
        m.read_at,
        m.created_at,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name,
        u.avatar_url as sender_avatar
      FROM messages m
      LEFT JOIN users u ON u.id = m.sender_id
      WHERE m.receiver_id = $1
    `;

    const params: any[] = [targetUserId];

    if (unreadOnly) {
      query += ' AND m.is_read = false';
    }

    query += ' ORDER BY m.created_at DESC LIMIT 500';

    const result = await pool.query(query, params);

    // Get unread count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = false',
      [targetUserId]
    );

    return NextResponse.json({
      notifications: result.rows,
      unread_count: parseInt(countResult.rows[0]?.count || '0', 10),
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load notifications' },
      { status: 500 }
    );
  }
}
