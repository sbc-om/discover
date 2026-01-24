import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// POST - mark all notifications as read
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await pool.query(
      `UPDATE messages 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE receiver_id = $1 AND is_read = false`,
      [session.userId]
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
