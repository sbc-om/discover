import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole } from '@/lib/session';

export async function GET(request: Request) {
  try {
    const session = await requireRole(['admin', 'academy_manager']);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = `
      SELECT 
        mr.id, mr.medal_type, mr.achievement_description, mr.status, mr.requested_date, mr.delivery_date,
        u.id as user_id, u.first_name, u.last_name, u.avatar_url,
        a.id as academy_id, a.name as academy_name, a.name_ar as academy_name_ar
      FROM medal_requests mr
      JOIN users u ON u.id = mr.user_id
      LEFT JOIN academies a ON a.id = u.academy_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let index = 1;

    if (session.roleName !== 'admin') {
      const academyResult = await pool.query('SELECT academy_id FROM users WHERE id = $1', [session.userId]);
      const academyId = academyResult.rows[0]?.academy_id;
      if (!academyId) {
        return NextResponse.json({ requests: [] });
      }
      query += ` AND u.academy_id = $${index}`;
      params.push(academyId);
      index += 1;
    }

    if (status) {
      query += ` AND mr.status = $${index}`;
      params.push(status);
      index += 1;
    }

    query += ' ORDER BY mr.requested_date DESC, mr.created_at DESC';

    const { rows } = await pool.query(query, params);

    return NextResponse.json({ requests: rows });
  } catch (error: any) {
    console.error('Get medal requests error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load medal requests' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(['admin', 'academy_manager']);
    const body = await request.json();
    const { user_id, medal_type, achievement_description } = body || {};

    if (!user_id || !medal_type) {
      return NextResponse.json(
        { message: 'User and medal type are required' },
        { status: 400 }
      );
    }

    if (session.roleName !== 'admin') {
      const academyResult = await pool.query('SELECT academy_id FROM users WHERE id = $1', [session.userId]);
      const academyId = academyResult.rows[0]?.academy_id;
      const userResult = await pool.query(
        `SELECT u.id
         FROM users u
         JOIN roles r ON r.id = u.role_id
         WHERE u.id = $1 AND r.name = 'player' AND u.academy_id = $2`,
        [user_id, academyId]
      );
      if (!academyId || userResult.rows.length === 0) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO medal_requests (user_id, medal_type, achievement_description)
       VALUES ($1, $2, $3)
       RETURNING id, medal_type, achievement_description, status, requested_date`,
      [user_id, medal_type, achievement_description || null]
    );

    return NextResponse.json({ message: 'Request submitted', request: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create medal request error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to submit request' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
