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

    // Only players can view their notifications
    if (session.roleName !== 'player') {
      return NextResponse.json({ message: 'Only players have notifications' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';

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

    const params: any[] = [session.userId];

    if (unreadOnly) {
      query += ' AND m.is_read = false';
    }

    query += ' ORDER BY m.created_at DESC LIMIT 100';

    const result = await pool.query(query, params);

    // Get unread count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = $1 AND is_read = false',
      [session.userId]
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
