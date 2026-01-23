import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET users with active push subscriptions (Admin only)
export async function GET(request: Request) {
  try {
    await requireRole(['admin']);

    const { searchParams } = new URL(request.url);
    const academyId = searchParams.get('academyId');
    const roleId = searchParams.get('roleId');

    let query = `
      SELECT DISTINCT ON (u.id)
        u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
        r.name as role_name, r.id as role_id,
        u.academy_id, a.name as academy_name
      FROM push_subscriptions ps
      JOIN users u ON u.id = ps.user_id
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN academies a ON a.id = u.academy_id
      WHERE ps.is_active = true AND u.is_active = true
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (academyId) {
      query += ` AND u.academy_id = $${paramIndex}`;
      params.push(academyId);
      paramIndex++;
    }

    if (roleId) {
      query += ` AND u.role_id = $${paramIndex}`;
      params.push(roleId);
      paramIndex++;
    }

    query += ` ORDER BY u.id, ps.updated_at DESC`;

    const { rows } = await pool.query(query, params);

    return NextResponse.json({ users: rows });
  } catch (error: any) {
    console.error('Get push subscribers error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch subscribers' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
