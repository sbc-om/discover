import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSession } from '@/lib/session';

// Check if user has access to the field's program
async function checkFieldAccess(fieldId: string, session: any) {
  const result = await pool.query(
    `SELECT f.id, f.program_id, p.academy_id 
     FROM program_health_test_fields f
     JOIN programs p ON p.id = f.program_id
     WHERE f.id = $1`,
    [fieldId]
  );

  if (result.rows.length === 0) {
    return { hasAccess: false, error: 'Field not found', status: 404 };
  }

  const field = result.rows[0];

  // Admins have access to all
  if (session.roleName === 'admin') {
    return { hasAccess: true, field };
  }

  // Academy managers can access their academy's programs
  if (session.roleName === 'academy_manager') {
    const managerCheck = await pool.query(
      `SELECT 1 FROM academy_managers WHERE academy_id = $1 AND user_id = $2`,
      [field.academy_id, session.userId]
    );
    if (managerCheck.rows.length === 0) {
      return { hasAccess: false, error: 'Access denied', status: 403 };
    }
    return { hasAccess: true, field };
  }

  return { hasAccess: false, error: 'Unauthorized', status: 401 };
}

// GET - Get single health test field
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { fieldId } = await params;
    if (!fieldId) {
      return NextResponse.json({ message: 'Field ID is required' }, { status: 400 });
    }

    const access = await checkFieldAccess(fieldId, session);
    if (!access.hasAccess) {
      return NextResponse.json({ message: access.error }, { status: access.status || 403 });
    }

    const { rows } = await pool.query(
      `SELECT id, program_id, field_key, field_name, field_name_ar, field_type, 
              field_unit, field_unit_ar, field_options, min_value, max_value, 
              is_required, display_order, description, description_ar, is_active, 
              created_at, updated_at
       FROM program_health_test_fields
       WHERE id = $1`,
      [fieldId]
    );

    return NextResponse.json({ field: rows[0] });
  } catch (error: any) {
    console.error('Get health test field error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch health test field' },
      { status: 500 }
    );
  }
}

// PUT - Update health test field
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.roleName !== 'admin' && session.roleName !== 'academy_manager') {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    const { fieldId } = await params;
    if (!fieldId) {
      return NextResponse.json({ message: 'Field ID is required' }, { status: 400 });
    }

    const access = await checkFieldAccess(fieldId, session);
    if (!access.hasAccess) {
      return NextResponse.json({ message: access.error }, { status: access.status || 403 });
    }

    const body = await request.json();
    const {
      field_name,
      field_name_ar,
      field_type,
      field_unit,
      field_unit_ar,
      field_options,
      min_value,
      max_value,
      is_required,
      display_order,
      description,
      description_ar,
      is_active
    } = body;

    // Validate field_type if provided
    if (field_type) {
      const validTypes = ['number', 'text', 'select', 'boolean', 'date', 'range'];
      if (!validTypes.includes(field_type)) {
        return NextResponse.json(
          { message: `Invalid field_type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const { rows } = await pool.query(
      `UPDATE program_health_test_fields 
       SET field_name = COALESCE($1, field_name),
           field_name_ar = COALESCE($2, field_name_ar),
           field_type = COALESCE($3, field_type),
           field_unit = COALESCE($4, field_unit),
           field_unit_ar = COALESCE($5, field_unit_ar),
           field_options = COALESCE($6, field_options),
           min_value = $7,
           max_value = $8,
           is_required = COALESCE($9, is_required),
           display_order = COALESCE($10, display_order),
           description = COALESCE($11, description),
           description_ar = COALESCE($12, description_ar),
           is_active = COALESCE($13, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $14
       RETURNING *`,
      [
        field_name,
        field_name_ar,
        field_type,
        field_unit,
        field_unit_ar,
        field_options ? JSON.stringify(field_options) : null,
        min_value,
        max_value,
        is_required,
        display_order,
        description,
        description_ar,
        is_active,
        fieldId
      ]
    );

    return NextResponse.json({
      message: 'Health test field updated successfully',
      field: rows[0]
    });
  } catch (error: any) {
    console.error('Update health test field error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update health test field' },
      { status: 500 }
    );
  }
}

// DELETE - Delete health test field
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.roleName !== 'admin' && session.roleName !== 'academy_manager') {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 });
    }

    const { fieldId } = await params;
    if (!fieldId) {
      return NextResponse.json({ message: 'Field ID is required' }, { status: 400 });
    }

    const access = await checkFieldAccess(fieldId, session);
    if (!access.hasAccess) {
      return NextResponse.json({ message: access.error }, { status: access.status || 403 });
    }

    // Check if there are any results using this field
    const resultsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM player_health_test_results WHERE field_id = $1',
      [fieldId]
    );

    if (parseInt(resultsCheck.rows[0].count) > 0) {
      // Soft delete by deactivating instead of hard delete
      await pool.query(
        'UPDATE program_health_test_fields SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [fieldId]
      );
      return NextResponse.json({
        message: 'Field has been deactivated (has existing results)',
        deactivated: true
      });
    }

    await pool.query('DELETE FROM program_health_test_fields WHERE id = $1', [fieldId]);

    return NextResponse.json({ message: 'Health test field deleted successfully' });
  } catch (error: any) {
    console.error('Delete health test field error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete health test field' },
      { status: 500 }
    );
  }
}
