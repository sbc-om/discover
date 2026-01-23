import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET users with active push subscriptions (Admin only)
export async function GET() {
  try {
    await requireRole(['admin']);

    const { rows } = await pool.query(
      `SELECT DISTINCT ON (u.id)
        u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
        r.name as role_name
      FROM push_subscriptions ps
      JOIN users u ON u.id = ps.user_id
      LEFT JOIN roles r ON r.id = u.role_id
      WHERE ps.is_active = true AND u.is_active = true
      ORDER BY u.id, ps.updated_at DESC`
    );

    return NextResponse.json({ users: rows });
  } catch (error: any) {
    console.error('Get push subscribers error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch subscribers' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
