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

export async function PUT(request: Request) {
  try {
    const session = await requireRole(['admin', 'academy_manager']);
    const body = await request.json();
    const { id, title, title_ar, description, icon_url } = body || {};

    if (!id || !title) {
      return NextResponse.json({ message: 'ID and title are required' }, { status: 400 });
    }

    // Check if achievement exists and user has permission
    const achievementResult = await pool.query(
      'SELECT id, academy_id, created_by FROM achievements WHERE id = $1',
      [id]
    );

    if (achievementResult.rows.length === 0) {
      return NextResponse.json({ message: 'Achievement not found' }, { status: 404 });
    }

    const achievement = achievementResult.rows[0];

    // Check permissions
    if (session.roleName === 'academy_manager') {
      const userResult = await pool.query('SELECT academy_id FROM users WHERE id = $1', [session.userId]);
      const userAcademyId = userResult.rows[0]?.academy_id;
      
      if (!userAcademyId || (achievement.academy_id && achievement.academy_id !== userAcademyId)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    const { rows } = await pool.query(
      `UPDATE achievements 
       SET title = $1, title_ar = $2, description = $3, icon_url = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id, title, title_ar, description, icon_url, academy_id, is_active, created_at`,
      [title, title_ar || null, description || null, icon_url || null, id]
    );

    return NextResponse.json({ achievement: rows[0] });
  } catch (error: any) {
    console.error('Update achievement error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update achievement' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireRole(['admin', 'academy_manager']);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    // Check if achievement exists and user has permission
    const achievementResult = await pool.query(
      'SELECT id, academy_id, created_by FROM achievements WHERE id = $1',
      [id]
    );

    if (achievementResult.rows.length === 0) {
      return NextResponse.json({ message: 'Achievement not found' }, { status: 404 });
    }

    const achievement = achievementResult.rows[0];

    // Check permissions
    if (session.roleName === 'academy_manager') {
      const userResult = await pool.query('SELECT academy_id FROM users WHERE id = $1', [session.userId]);
      const userAcademyId = userResult.rows[0]?.academy_id;
      
      if (!userAcademyId || (achievement.academy_id && achievement.academy_id !== userAcademyId)) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    // Check if achievement is being used by any players
    const usageResult = await pool.query(
      'SELECT COUNT(*) as count FROM player_achievements WHERE achievement_id = $1',
      [id]
    );

    if (parseInt(usageResult.rows[0].count) > 0) {
      // Soft delete - set is_active to false instead of actual deletion
      await pool.query(
        'UPDATE achievements SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [id]
      );
      return NextResponse.json({ message: 'Achievement deactivated (was being used by players)' });
    } else {
      // Hard delete if not being used
      await pool.query('DELETE FROM achievements WHERE id = $1', [id]);
      return NextResponse.json({ message: 'Achievement deleted' });
    }
  } catch (error: any) {
    console.error('Delete achievement error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete achievement' },
      { status: error.message === 'Forbidden' ? 403 : 500 }
    );
  }
}
