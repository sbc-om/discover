import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription, userAgent } = body || {};

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ message: 'Invalid subscription' }, { status: 400 });
    }

    const { endpoint, keys } = subscription;

    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       ON CONFLICT (user_id, endpoint)
       DO UPDATE SET p256dh = EXCLUDED.p256dh,
                     auth = EXCLUDED.auth,
                     user_agent = EXCLUDED.user_agent,
                     is_active = true,
                     updated_at = CURRENT_TIMESTAMP`,
      [session.userId, endpoint, keys.p256dh, keys.auth, userAgent || null]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Subscribe push error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to subscribe' },
      { status: 500 }
    );
  }
}
