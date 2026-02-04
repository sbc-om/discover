import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';
import { processLevelHealthTestRequirements } from '@/lib/healthTestService';

async function checkProgramAccess(programId: string, session: any) {
  const programResult = await pool.query(
    'SELECT id, academy_id FROM programs WHERE id = $1',
    [programId]
  );

  if (programResult.rows.length === 0) {
    return { error: 'Program not found', status: 404 };
  }

  const program = programResult.rows[0];

  if (session.roleName !== 'admin') {
    const userResult = await pool.query(
      'SELECT academy_id FROM users WHERE id = $1',
      [session.userId]
    );
    const userAcademyId = userResult.rows[0]?.academy_id;

    if (program.academy_id !== userAcademyId) {
      return { error: 'Forbidden', status: 403 };
    }
  }

  return { program };
}

// GET - Get all program assignments for a player
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    // Players can only see their own assignments
    const targetUserId = session.roleName === 'player' ? session.userId : userId;

    if (!targetUserId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `SELECT 
        pp.id, pp.user_id, pp.program_id, pp.age_group_id, pp.level_id, 
        pp.is_primary, pp.status, pp.assigned_at, pp.updated_at,
        p.name as program_name, p.name_ar as program_name_ar, p.image_url as program_image,
        pag.name as age_group_name, pag.name_ar as age_group_name_ar, pag.min_age, pag.max_age,
        pl.name as level_name, pl.name_ar as level_name_ar, pl.level_order, pl.image_url as level_image,
        pl.min_sessions, pl.min_points, pl.health_test_requirement
       FROM player_programs pp
       JOIN programs p ON p.id = pp.program_id
       LEFT JOIN program_age_groups pag ON pag.id = pp.age_group_id
       LEFT JOIN program_levels pl ON pl.id = pp.level_id
       WHERE pp.user_id = $1
       ORDER BY pp.is_primary DESC, pp.assigned_at DESC`,
      [targetUserId]
    );

    // Get levels for each program
    const programsWithLevels = await Promise.all(
      rows.map(async (assignment: any) => {
        const levelsResult = await pool.query(
          `SELECT id, name, name_ar, image_url, level_order, min_sessions, min_points, health_test_requirement, is_active
           FROM program_levels
           WHERE program_id = $1 AND is_active = true
           ORDER BY level_order ASC`,
          [assignment.program_id]
        );

        // Get progress for this program
        const progressResult = await pool.query(
          `SELECT SUM(sessions_completed) as total_sessions, SUM(points_earned) as total_points
           FROM player_level_progress
           WHERE user_id = $1 AND program_id = $2`,
          [targetUserId, assignment.program_id]
        );

        const progress = progressResult.rows[0] || { total_sessions: 0, total_points: 0 };

        return {
          ...assignment,
          levels: levelsResult.rows,
          progress: {
            sessions_completed: parseInt(progress.total_sessions) || 0,
            points_earned: parseInt(progress.total_points) || 0
          }
        };
      })
    );

    return NextResponse.json({ assignments: programsWithLevels });
  } catch (error: any) {
    console.error('Get player programs error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'academy_manager', 'coach'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, program_id, age_group_id, level_id, is_primary } = body;

    if (!user_id || !program_id || !age_group_id) {
      return NextResponse.json({ message: 'User, program, and age group are required' }, { status: 400 });
    }

    const access = await checkProgramAccess(program_id, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const ageGroupResult = await pool.query(
      'SELECT id FROM program_age_groups WHERE id = $1 AND program_id = $2',
      [age_group_id, program_id]
    );

    if (ageGroupResult.rows.length === 0) {
      return NextResponse.json({ message: 'Age group not found for program' }, { status: 404 });
    }

    // Validate level if provided
    if (level_id) {
      const levelResult = await pool.query(
        'SELECT id FROM program_levels WHERE id = $1 AND program_id = $2',
        [level_id, program_id]
      );
      if (levelResult.rows.length === 0) {
        return NextResponse.json({ message: 'Level not found for program' }, { status: 404 });
      }
    }

    // Verify assigning user exists
    const assignerResult = await pool.query('SELECT id FROM users WHERE id = $1', [session.userId]);
    const assignedBy = assignerResult.rows.length > 0 ? session.userId : null;

    // Check if this program is already assigned
    const existingResult = await pool.query(
      'SELECT id FROM player_programs WHERE user_id = $1 AND program_id = $2',
      [user_id, program_id]
    );

    let result;
    if (existingResult.rows.length > 0) {
      // Update existing assignment
      result = await pool.query(
        `UPDATE player_programs 
         SET age_group_id = $1, level_id = $2, assigned_by = $3, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $4 AND program_id = $5
         RETURNING id, user_id, program_id, age_group_id, level_id, is_primary, status, assigned_at, updated_at`,
        [age_group_id, level_id || null, assignedBy, user_id, program_id]
      );
    } else {
      // Check if user has any programs yet
      const hasPrograms = await pool.query(
        'SELECT COUNT(*) as count FROM player_programs WHERE user_id = $1',
        [user_id]
      );
      const shouldBePrimary = is_primary === true || parseInt(hasPrograms.rows[0].count) === 0;

      // If this should be primary, unset other primaries
      if (shouldBePrimary) {
        await pool.query(
          'UPDATE player_programs SET is_primary = false WHERE user_id = $1',
          [user_id]
        );
      }

      // Insert new assignment
      result = await pool.query(
        `INSERT INTO player_programs (user_id, program_id, age_group_id, level_id, assigned_by, is_primary, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'active')
         RETURNING id, user_id, program_id, age_group_id, level_id, is_primary, status, assigned_at, updated_at`,
        [user_id, program_id, age_group_id, level_id || null, assignedBy, shouldBePrimary]
      );
    }

    // Process health test requirements if level is assigned
    let healthTestRequests = {};
    if (level_id) {
      healthTestRequests = await processLevelHealthTestRequirements(user_id, level_id, session.userId);
    }

    return NextResponse.json({ 
      assignment: result.rows[0],
      healthTestRequests
    });
  } catch (error: any) {
    console.error('Assign player program error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to assign program' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a program assignment
export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'academy_manager'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('id');
    const userId = searchParams.get('user_id');
    const programId = searchParams.get('program_id');

    if (!assignmentId && (!userId || !programId)) {
      return NextResponse.json({ message: 'Assignment ID or user_id and program_id required' }, { status: 400 });
    }

    let deletedAssignment;
    if (assignmentId) {
      const result = await pool.query(
        'DELETE FROM player_programs WHERE id = $1 RETURNING user_id, is_primary',
        [assignmentId]
      );
      deletedAssignment = result.rows[0];
    } else {
      const result = await pool.query(
        'DELETE FROM player_programs WHERE user_id = $1 AND program_id = $2 RETURNING user_id, is_primary',
        [userId, programId]
      );
      deletedAssignment = result.rows[0];
    }

    // If deleted assignment was primary, set another one as primary
    if (deletedAssignment?.is_primary) {
      await pool.query(
        `UPDATE player_programs 
         SET is_primary = true 
         WHERE user_id = $1 AND id = (
           SELECT id FROM player_programs WHERE user_id = $1 ORDER BY assigned_at ASC LIMIT 1
         )`,
        [deletedAssignment.user_id]
      );
    }

    return NextResponse.json({ message: 'Program assignment removed' });
  } catch (error: any) {
    console.error('Delete player program error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to remove program' },
      { status: 500 }
    );
  }
}

// PATCH - Update assignment (set primary, change level, etc.)
export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['admin', 'academy_manager', 'coach'].includes(session.roleName)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, user_id, program_id, level_id, is_primary, status } = body;

    if (!id && (!user_id || !program_id)) {
      return NextResponse.json({ message: 'Assignment ID or user_id and program_id required' }, { status: 400 });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (level_id !== undefined) {
      updates.push(`level_id = $${paramIndex}`);
      values.push(level_id || null);
      paramIndex++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (is_primary === true) {
      // First unset all primaries for this user
      const userIdForPrimary = user_id || (
        await pool.query('SELECT user_id FROM player_programs WHERE id = $1', [id])
      ).rows[0]?.user_id;

      if (userIdForPrimary) {
        await pool.query('UPDATE player_programs SET is_primary = false WHERE user_id = $1', [userIdForPrimary]);
      }
      updates.push(`is_primary = true`);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    let whereClause;
    if (id) {
      whereClause = `id = $${paramIndex}`;
      values.push(id);
    } else {
      whereClause = `user_id = $${paramIndex} AND program_id = $${paramIndex + 1}`;
      values.push(user_id, program_id);
    }

    const result = await pool.query(
      `UPDATE player_programs SET ${updates.join(', ')} WHERE ${whereClause}
       RETURNING id, user_id, program_id, age_group_id, level_id, is_primary, status, assigned_at, updated_at`,
      values
    );

    // Process health test requirements if level changed
    if (level_id && result.rows[0]) {
      await processLevelHealthTestRequirements(result.rows[0].user_id, level_id, session.userId);
    }

    return NextResponse.json({ assignment: result.rows[0] });
  } catch (error: any) {
    console.error('Update player program error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update program' },
      { status: 500 }
    );
  }
}
