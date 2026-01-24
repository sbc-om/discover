import { NextResponse } from 'next/server';
import webpush from 'web-push';
import pool from '@/lib/db';
import { requireRole, getSession } from '@/lib/session';

function getVapidConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

  if (!publicKey || !privateKey) {
    return null;
  }

  return { publicKey, privateKey, subject };
}

// POST send push notifications (Admin only)
export async function POST(request: Request) {
  try {
    await requireRole(['admin']);
    const session = await getSession();

    const vapid = getVapidConfig();
    if (!vapid) {
      return NextResponse.json(
        { message: 'Missing VAPID configuration' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userIds, message } = body || {};

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ message: 'No users selected' }, { status: 400 });
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

    const { rows } = await pool.query(
      `SELECT id, user_id, endpoint, p256dh, auth
       FROM push_subscriptions
       WHERE is_active = true AND user_id = ANY($1)`,
      [userIds]
    );

    const payload = JSON.stringify({
      title: 'New message',
      body: message.trim(),
      icon: '/logo/icon-black.png',
      badge: '/logo/icon-black.png',
      url: '/dashboard/notifications'
    });

    const sendResults = await Promise.allSettled(
      rows.map(async (sub: any) => {
        const subscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(subscription, payload);
          return { ok: true, id: sub.id };
        } catch (err: any) {
          const statusCode = err?.statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await pool.query(
              'UPDATE push_subscriptions SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
              [sub.id]
            );
          }
          throw err;
        }
      })
    );

    const successCount = sendResults.filter(r => r.status === 'fulfilled').length;
    const failureCount = sendResults.length - successCount;

    // Save in-app notifications for all target users (as messages)
    const messageContent = message.trim();
    const senderId = session?.userId || null;
    
    // Insert messages for each user (even if push failed, they should see in-app)
    await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, subject, content, is_read)
       SELECT $1, unnest($2::uuid[]), $3, $4, false`,
      [senderId, userIds, 'New message', messageContent]
    );

    return NextResponse.json({
      message: 'Notifications sent',
      successCount,
      failureCount
    });
  } catch (error: any) {
    console.error('Send push error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to send notifications' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
