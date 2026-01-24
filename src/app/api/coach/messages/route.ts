import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await requireRole(['coach']);
    const body = await request.json();
    const { receiver_id, subject, content } = body || {};

    if (!receiver_id || !content || !content.trim()) {
      return NextResponse.json(
        { message: 'Receiver and content are required' },
        { status: 400 }
      );
    }

    const academyResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [session.userId]
    );
    const academyId = academyResult.rows[0]?.academy_id;

    if (!academyId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const accessResult = await pool.query(
      `SELECT u.id
       FROM users u
       JOIN roles r ON r.id = u.role_id
       JOIN player_programs pr ON pr.user_id = u.id
       JOIN programs p ON p.id = pr.program_id
       WHERE u.id = $1 AND r.name = 'player' AND p.academy_id = $2
       LIMIT 1`,
      [receiver_id, academyId]
    );

    if (accessResult.rows.length === 0) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, subject, content, is_read)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, subject, content, created_at`,
      [session.userId, receiver_id, subject || null, content.trim()]
    );

    return NextResponse.json({ message: 'Message sent', data: rows[0] });
  } catch (error: any) {
    console.error('Coach send message error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to send message' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
