import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// Helper to check level access
async function checkLevelAccess(levelId: string, session: any) {
  const levelResult = await pool.query(
    `SELECT pl.id, pl.program_id, p.academy_id 
     FROM program_levels pl
     JOIN programs p ON p.id = pl.program_id
     WHERE pl.id = $1`,
    [levelId]
  );

  if (levelResult.rows.length === 0) {
    return { error: 'Level not found', status: 404 };
  }

  const level = levelResult.rows[0];

  if (session.roleName !== 'admin') {
    const userResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [session.userId]
    );
    const userAcademyId = userResult.rows[0]?.academy_id;
    
    if (level.academy_id !== userAcademyId) {
      return { error: 'Forbidden', status: 403 };
    }
  }

  return { level };
}

// GET single level
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { levelId } = await params;
    if (!levelId) {
      return NextResponse.json({ message: 'Level ID is required' }, { status: 400 });
    }

    const access = await checkLevelAccess(levelId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const { rows } = await pool.query(
      `SELECT id, program_id, name, name_ar, description, image_url, level_order, min_sessions, min_points, is_active, created_at, updated_at
       FROM program_levels
       WHERE id = $1`,
      [levelId]
    );

    return NextResponse.json({ level: rows[0] });
  } catch (error: any) {
    console.error('Get level error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch level' },
      { status: 500 }
    );
  }
}

// PUT update level
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: programId, levelId } = await params;
    if (!levelId) {
      return NextResponse.json({ message: 'Level ID is required' }, { status: 400 });
    }

    const access = await checkLevelAccess(levelId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const body = await request.json();
    const { name, name_ar, description, image_url, level_order, min_sessions, min_points, is_active } = body;

    // Check if new level_order conflicts with another level
    if (level_order !== undefined) {
      const orderCheck = await pool.query(
        'SELECT id FROM program_levels WHERE program_id = $1 AND level_order = $2 AND id != $3',
        [programId, level_order, levelId]
      );
      if (orderCheck.rows.length > 0) {
        return NextResponse.json(
          { message: 'A level with this order already exists' },
          { status: 409 }
        );
      }
    }

    const { rows } = await pool.query(
      `UPDATE program_levels 
       SET name = COALESCE($1, name),
           name_ar = COALESCE($2, name_ar),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           level_order = COALESCE($5, level_order),
           min_sessions = COALESCE($6, min_sessions),
           min_points = COALESCE($7, min_points),
           is_active = COALESCE($8, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, name, name_ar, description, image_url, level_order, min_sessions, min_points, is_active, updated_at`,
      [name, name_ar, description, image_url, level_order, min_sessions, min_points, is_active, levelId]
    );

    return NextResponse.json({
      message: 'Level updated successfully',
      level: rows[0],
    });
  } catch (error: any) {
    console.error('Update level error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update level' },
      { status: 500 }
    );
  }
}

// DELETE level
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; levelId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { levelId } = await params;
    if (!levelId) {
      return NextResponse.json({ message: 'Level ID is required' }, { status: 400 });
    }

    const access = await checkLevelAccess(levelId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    await pool.query('DELETE FROM program_levels WHERE id = $1', [levelId]);

    return NextResponse.json({ message: 'Level deleted successfully' });
  } catch (error: any) {
    console.error('Delete level error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete level' },
      { status: 500 }
    );
  }
}
