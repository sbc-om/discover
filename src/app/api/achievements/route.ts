import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireRole, getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'academy_manager', 'coach', 'player'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    let query = `
      SELECT a.id, a.title, a.title_ar, a.description, a.icon_url, a.academy_id, a.is_active, a.created_at
      FROM achievements a
      WHERE a.is_active = true
    `;
    const params: any[] = [];
    let idx = 1;

    if (session.roleName !== 'admin') {
      const academyResult = await pool.query('SELECT academy_id FROM users WHERE id = $1', [session.userId]);
      const academyId = academyResult.rows[0]?.academy_id || null;
      if (academyId) {
        query += ` AND (a.academy_id IS NULL OR a.academy_id = $${idx})`;
        params.push(academyId);
        idx += 1;
      } else {
        query += ' AND a.academy_id IS NULL';
      }
    }

    query += ' ORDER BY a.created_at DESC';

    const { rows } = await pool.query(query, params);
    return NextResponse.json({ achievements: rows });
  } catch (error: any) {
    console.error('Get achievements error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to load achievements' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(['admin', 'academy_manager']);
    const body = await request.json();
    const { title, title_ar, description, icon_url } = body || {};

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    let academyId: string | null = null;
    if (session.roleName === 'academy_manager') {
      const academyResult = await pool.query('SELECT academy_id FROM users WHERE id = $1', [session.userId]);
      academyId = academyResult.rows[0]?.academy_id || null;
      if (!academyId) {
        return NextResponse.json({ message: 'Academy not found' }, { status: 400 });
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO achievements (title, title_ar, description, icon_url, academy_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, title_ar, description, icon_url, academy_id, is_active, created_at`,
      [title, title_ar || null, description || null, icon_url || null, academyId, session.userId]
    );

    return NextResponse.json({ achievement: rows[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Create achievement error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create achievement' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
