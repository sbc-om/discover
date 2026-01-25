import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

// GET all active users for messaging (Admin or Academy Manager)
export async function GET(request: Request) {
  try {
    const session = await requireRole(['admin', 'academy_manager']);

    const { searchParams } = new URL(request.url);
    const academyId = searchParams.get('academyId');
    const roleId = searchParams.get('roleId');

    let query = `
      SELECT DISTINCT 
        u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
        r.name as role_name, r.id as role_id,
        u.academy_id, a.name as academy_name,
        CASE WHEN ps.user_id IS NOT NULL THEN true ELSE false END as has_push_subscription
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      LEFT JOIN academies a ON a.id = u.academy_id
      LEFT JOIN push_subscriptions ps ON ps.user_id = u.id AND ps.is_active = true
      WHERE u.is_active = true
        AND u.role_id IS NOT NULL
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Academy Manager can only see users from their academy
    if (session.roleName !== 'admin') {
      const academyResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const managerAcademyId = academyResult.rows[0]?.academy_id;
      if (!managerAcademyId) {
        return NextResponse.json({ users: [] });
      }
      query += ` AND u.academy_id = $${paramIndex}`;
      params.push(managerAcademyId);
      paramIndex++;
    } else if (academyId) {
      // Admin can filter by academy
      query += ` AND u.academy_id = $${paramIndex}`;
      params.push(academyId);
      paramIndex++;
    }

    // Filter by role if specified
    if (roleId) {
      query += ` AND u.role_id = $${paramIndex}`;
      params.push(roleId);
      paramIndex++;
    }

    query += ` ORDER BY r.name, u.first_name, u.last_name`;

    const { rows } = await pool.query(query, params);

    return NextResponse.json({ users: rows });
  } catch (error: any) {
    console.error('Get messaging users error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch messaging users' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}