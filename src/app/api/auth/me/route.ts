import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import pool from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const result = await pool.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url, u.academy_id,
              r.id as role_id, r.name as role_name,
              a.name as academy_name, a.logo_url as academy_logo
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       LEFT JOIN academies a ON u.academy_id = a.id
       WHERE u.id = $1`,
      [session.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = result.rows[0];

    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      avatarUrl: user.avatar_url,
      roleId: user.role_id,
      roleName: user.role_name,
      academyId: user.academy_id,
      academyName: user.academy_name,
      academyLogo: user.academy_logo
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ error: 'Failed to fetch user info' }, { status: 500 });
  }
}
