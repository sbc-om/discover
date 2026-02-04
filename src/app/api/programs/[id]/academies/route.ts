import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// GET - List all academies assigned to a program
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: programId } = await params;
    if (!programId) {
      return NextResponse.json({ message: 'Program ID is required' }, { status: 400 });
    }

    // Check if program exists
    const programCheck = await pool.query('SELECT id FROM programs WHERE id = $1', [programId]);
    if (programCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Program not found' }, { status: 404 });
    }

    // Get all academies assigned to this program
    const { rows } = await pool.query(
      `SELECT 
        pa.id as assignment_id,
        pa.academy_id,
        pa.is_active,
        pa.assigned_at,
        pa.notes,
        a.name as academy_name,
        a.name_ar as academy_name_ar,
        a.logo_url,
        a.is_active as academy_is_active,
        u.first_name as assigned_by_first_name,
        u.last_name as assigned_by_last_name,
        (SELECT COUNT(*) FROM player_programs pp 
         JOIN users usr ON usr.id = pp.user_id 
         WHERE pp.program_id = $1 AND usr.academy_id = pa.academy_id) as player_count
       FROM program_academies pa
       JOIN academies a ON a.id = pa.academy_id
       LEFT JOIN users u ON u.id = pa.assigned_by
       WHERE pa.program_id = $1
       ORDER BY pa.assigned_at DESC`,
      [programId]
    );

    return NextResponse.json({ academies: rows });
  } catch (error: any) {
    console.error('Get program academies error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch program academies' },
      { status: 500 }
    );
  }
}

// POST - Assign academies to a program
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can assign programs to academies
    if (session.roleName !== 'admin') {
      return NextResponse.json({ message: 'Only admins can assign programs to academies' }, { status: 403 });
    }

    const { id: programId } = await params;
    if (!programId) {
      return NextResponse.json({ message: 'Program ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { academy_ids, notes } = body;

    if (!academy_ids || !Array.isArray(academy_ids) || academy_ids.length === 0) {
      return NextResponse.json({ message: 'academy_ids array is required' }, { status: 400 });
    }

    // Check if program exists
    const programCheck = await pool.query('SELECT id FROM programs WHERE id = $1', [programId]);
    if (programCheck.rows.length === 0) {
      return NextResponse.json({ message: 'Program not found' }, { status: 404 });
    }

    // Insert assignments
    const insertedAssignments = [];
    for (const academyId of academy_ids) {
      try {
        const result = await pool.query(
          `INSERT INTO program_academies (program_id, academy_id, assigned_by, notes, is_active)
           VALUES ($1, $2, $3, $4, true)
           ON CONFLICT (program_id, academy_id) 
           DO UPDATE SET is_active = true, updated_at = CURRENT_TIMESTAMP, notes = COALESCE(EXCLUDED.notes, program_academies.notes)
           RETURNING *`,
          [programId, academyId, session.userId, notes || null]
        );
        insertedAssignments.push(result.rows[0]);
      } catch (err) {
        console.error(`Failed to assign academy ${academyId}:`, err);
      }
    }

    return NextResponse.json({
      message: 'Academies assigned successfully',
      assignments: insertedAssignments
    }, { status: 201 });
  } catch (error: any) {
    console.error('Assign program academies error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to assign academies' },
      { status: 500 }
    );
  }
}

// DELETE - Remove academy assignment from a program
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can remove program assignments
    if (session.roleName !== 'admin') {
      return NextResponse.json({ message: 'Only admins can remove program assignments' }, { status: 403 });
    }

    const { id: programId } = await params;
    const { searchParams } = new URL(request.url);
    const academyId = searchParams.get('academy_id');

    if (!programId) {
      return NextResponse.json({ message: 'Program ID is required' }, { status: 400 });
    }

    if (!academyId) {
      return NextResponse.json({ message: 'academy_id query parameter is required' }, { status: 400 });
    }

    // Check if there are active players in this program from this academy
    const playerCheck = await pool.query(
      `SELECT COUNT(*) as count FROM player_programs pp
       JOIN users u ON u.id = pp.user_id
       WHERE pp.program_id = $1 AND u.academy_id = $2 AND pp.status = 'active'`,
      [programId, academyId]
    );

    const playerCount = parseInt(playerCheck.rows[0].count);
    
    if (playerCount > 0) {
      // Soft delete - just deactivate
      await pool.query(
        `UPDATE program_academies SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE program_id = $1 AND academy_id = $2`,
        [programId, academyId]
      );
      return NextResponse.json({
        message: `Program deactivated for this academy (${playerCount} active players exist)`,
        deactivated: true,
        player_count: playerCount
      });
    }

    // Hard delete if no active players
    await pool.query(
      'DELETE FROM program_academies WHERE program_id = $1 AND academy_id = $2',
      [programId, academyId]
    );

    return NextResponse.json({ message: 'Academy assignment removed successfully' });
  } catch (error: any) {
    console.error('Remove program academy error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to remove academy assignment' },
      { status: 500 }
    );
  }
}
