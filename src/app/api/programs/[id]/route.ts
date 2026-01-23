import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// GET single program with levels
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Program ID is required' }, { status: 400 });
    }

    // Get program details
    const programResult = await pool.query(
      `SELECT 
        p.id, p.name, p.name_ar, p.description, p.description_ar, p.image_url,
        p.academy_id, p.is_active, p.created_at, p.updated_at,
        a.name as academy_name, a.name_ar as academy_name_ar
       FROM programs p
       LEFT JOIN academies a ON a.id = p.academy_id
       WHERE p.id = $1`,
      [id]
    );

    if (programResult.rows.length === 0) {
      return NextResponse.json({ message: 'Program not found' }, { status: 404 });
    }

    const program = programResult.rows[0];

    // Check access for non-admin users
    if (session.roleName !== 'admin') {
      const userResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const userAcademyId = userResult.rows[0]?.academy_id;
      
      if (program.academy_id !== userAcademyId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    // Get program levels
    const levelsResult = await pool.query(
      `SELECT id, name, name_ar, description, image_url, level_order, min_sessions, min_points, is_active, created_at
       FROM program_levels
       WHERE program_id = $1
       ORDER BY level_order ASC`,
      [id]
    );

    return NextResponse.json({
      program: {
        ...program,
        levels: levelsResult.rows,
      },
    });
  } catch (error: any) {
    console.error('Get program error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch program' },
      { status: 500 }
    );
  }
}

// PUT update program
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Program ID is required' }, { status: 400 });
    }

    // Check if program exists and get its academy
    const existing = await pool.query(
      'SELECT id, academy_id FROM programs WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ message: 'Program not found' }, { status: 404 });
    }

    const program = existing.rows[0];

    // Check access for non-admin users
    if (session.roleName !== 'admin') {
      const userResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const userAcademyId = userResult.rows[0]?.academy_id;
      
      if (program.academy_id !== userAcademyId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { name, name_ar, description, description_ar, image_url, is_active } = body;

    // Check if new name conflicts with another program in the same academy
    if (name) {
      const nameCheck = await pool.query(
        'SELECT id FROM programs WHERE name = $1 AND academy_id = $2 AND id != $3',
        [name, program.academy_id, id]
      );
      if (nameCheck.rows.length > 0) {
        return NextResponse.json(
          { message: 'A program with this name already exists in this academy' },
          { status: 409 }
        );
      }
    }

    const { rows } = await pool.query(
      `UPDATE programs 
       SET name = COALESCE($1, name),
           name_ar = COALESCE($2, name_ar),
           description = COALESCE($3, description),
           description_ar = COALESCE($4, description_ar),
           image_url = COALESCE($5, image_url),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, name, name_ar, description, description_ar, image_url, academy_id, is_active, updated_at`,
      [name, name_ar, description, description_ar, image_url, is_active, id]
    );

    return NextResponse.json({
      message: 'Program updated successfully',
      program: rows[0],
    });
  } catch (error: any) {
    console.error('Update program error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update program' },
      { status: 500 }
    );
  }
}

// DELETE program
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ message: 'Program ID is required' }, { status: 400 });
    }

    // Check if program exists and get its academy
    const existing = await pool.query(
      'SELECT id, academy_id FROM programs WHERE id = $1',
      [id]
    );

    if (existing.rows.length === 0) {
      return NextResponse.json({ message: 'Program not found' }, { status: 404 });
    }

    const program = existing.rows[0];

    // Check access for non-admin users
    if (session.roleName !== 'admin') {
      const userResult = await pool.query(
        'SELECT academy_id FROM users WHERE id = $1',
        [session.userId]
      );
      const userAcademyId = userResult.rows[0]?.academy_id;
      
      if (program.academy_id !== userAcademyId) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    // Delete program (levels will be cascade deleted)
    await pool.query('DELETE FROM programs WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error: any) {
    console.error('Delete program error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete program' },
      { status: 500 }
    );
  }
}
