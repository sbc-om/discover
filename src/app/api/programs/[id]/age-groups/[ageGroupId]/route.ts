import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

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

// Helper function to check granular permission
async function hasGranularPermission(session: any, action: string): Promise<boolean> {
  if (session.roleName === 'admin') return true;
  
  const { rows } = await pool.query(
    `SELECT COUNT(*) as count
     FROM role_permissions rp
     JOIN permissions p ON p.id = rp.permission_id
     JOIN modules m ON m.id = p.module_id
     WHERE rp.role_id = $1 AND m.name = 'programs' AND p.action = $2`,
    [session.roleId, action]
  );
  
  return parseInt(rows[0].count) > 0;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; ageGroupId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check for edit_age_group or update permission
    const canEdit = await hasGranularPermission(session, 'edit_age_group') ||
                    await hasGranularPermission(session, 'update');
    
    if (!canEdit) {
      return NextResponse.json({ message: 'You do not have permission to edit age groups' }, { status: 403 });
    }

    const { id: programId, ageGroupId } = await params;
    if (!programId || !ageGroupId) {
      return NextResponse.json({ message: 'Program ID and age group ID are required' }, { status: 400 });
    }

    const access = await checkProgramAccess(programId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const body = await request.json();
    const { name, name_ar, min_age, max_age, is_active } = body;

    if (min_age !== undefined && max_age !== undefined && Number(min_age) > Number(max_age)) {
      return NextResponse.json({ message: 'Min age must be <= max age' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `UPDATE program_age_groups
       SET name = COALESCE($1, name),
           name_ar = COALESCE($2, name_ar),
           min_age = COALESCE($3, min_age),
           max_age = COALESCE($4, max_age),
           is_active = COALESCE($5, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND program_id = $7
       RETURNING id, name, name_ar, min_age, max_age, is_active, updated_at`,
      [name, name_ar, min_age, max_age, is_active, ageGroupId, programId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Age group not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Age group updated successfully',
      age_group: rows[0],
    });
  } catch (error: any) {
    console.error('Update age group error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update age group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; ageGroupId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check for delete_age_group or delete permission
    const canDelete = await hasGranularPermission(session, 'delete_age_group') ||
                      await hasGranularPermission(session, 'delete');
    
    if (!canDelete) {
      return NextResponse.json({ message: 'You do not have permission to delete age groups' }, { status: 403 });
    }

    const { id: programId, ageGroupId } = await params;
    if (!programId || !ageGroupId) {
      return NextResponse.json({ message: 'Program ID and age group ID are required' }, { status: 400 });
    }

    const access = await checkProgramAccess(programId, session);
    if (access.error) {
      return NextResponse.json({ message: access.error }, { status: access.status });
    }

    const result = await pool.query(
      'DELETE FROM program_age_groups WHERE id = $1 AND program_id = $2',
      [ageGroupId, programId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ message: 'Age group not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Age group deleted successfully' });
  } catch (error: any) {
    console.error('Delete age group error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete age group' },
      { status: 500 }
    );
  }
}
